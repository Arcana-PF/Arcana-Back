import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';





import { Cart } from 'src/carrito/entitites/cart.entity';
import { CartItem } from 'src/carrito/entitites/cart-item-entity';
import { Order } from 'src/orders/entities/order.entity';
import { OrderDetail } from 'src/orders/entities/orderDetail.entity';
import { OrderDetailProduct } from 'src/orders/entities/order-detail-product.entity';
import { Product } from 'src/products/entities/product.entity';
import { PayPalService } from 'src/orders/paypal.service';
import { OrderStatus } from 'src/orders/enums/order-status.enum';


@Injectable()
export class CartService {
 constructor(
  @InjectRepository(Product)
  private readonly productsRepository: Repository<Product>,

  @InjectRepository(Cart)
  private readonly cartRepository: Repository<Cart>,

  @InjectRepository(CartItem)
  private readonly cartItemRepository: Repository<CartItem>,

  private readonly paypalService: PayPalService,
  private readonly dataSource: DataSource,
) {}

 async getActiveCartByUser(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['items', 'items.product']
    });

    if (!cart) {
      const newCart = this.cartRepository.create({
        user: { id: userId } as any,
        isActive: true,
        items: []
      });
      return this.cartRepository.save(newCart);
    }

    return cart;
  }

  async addItemToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) throw new ConflictException('La cantidad debe ser mayor que cero');

    const cart = await this.getActiveCartByUser(userId);

    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (!product.isActive) throw new ConflictException('Producto no está activo');

    let cartItem = cart.items.find(item => item.product.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
      if (cartItem.quantity > product.stock) throw new ConflictException('Stock insuficiente');
      await this.cartItemRepository.save(cartItem);
    } else {
      if (quantity > product.stock) throw new ConflictException('Stock insuficiente');
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity
      });
      await this.cartItemRepository.save(cartItem);
      cart.items.push(cartItem);
    }

    return cart;
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    if (quantity < 0) throw new ConflictException('La cantidad no puede ser negativa');

    const cart = await this.getActiveCartByUser(userId);

    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en carrito');

    if (quantity === 0) {
      await this.cartItemRepository.delete(itemId);
      cart.items = cart.items.filter(i => i.id !== itemId);
    } else {
      if (quantity > item.product.stock) throw new ConflictException('Stock insuficiente');
      item.quantity = quantity;
      await this.cartItemRepository.save(item);
    }

    return cart;
  }

  async removeCartItem(userId: string, itemId: string): Promise<Cart> {
    const cart = await this.getActiveCartByUser(userId);
    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en carrito');

    await this.cartItemRepository.delete(itemId);
    cart.items = cart.items.filter(i => i.id !== itemId);
    return cart;
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getActiveCartByUser(userId);

    if (cart.items.length > 0) {
      const itemIds = cart.items.map(i => i.id);
      await this.cartItemRepository.delete(itemIds);
      cart.items = [];
    }

    return cart;
  }


  async createOrderFromCart(userId: string) {
    const cart = await this.getActiveCartByUser(userId);

    if (!cart || cart.items.length === 0) {
      throw new ConflictException('El carrito está vacío');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = new Order();
      order.user = { id: userId } as any;
      order.status = OrderStatus.PENDING;

      const orderDetail = new OrderDetail();
      orderDetail.price = 0;

      const savedOrder = await queryRunner.manager.save(Order, order);
      orderDetail.order = savedOrder;
      const savedOrderDetail = await queryRunner.manager.save(OrderDetail, orderDetail);

      let total = 0;

      for (const item of cart.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.product.id }
        });

        if (!product) throw new NotFoundException(`Producto ${item.product.name} no encontrado`);
        if (!product.isActive) throw new ConflictException(`Producto ${product.name} no está disponible`);
        if (product.stock < item.quantity) throw new ConflictException(`Stock insuficiente para ${product.name}`);

        const orderItem = new OrderDetailProduct();
        orderItem.product = product;
        orderItem.quantity = item.quantity;
        orderItem.priceAtPurchase = product.price;
        orderItem.orderDetail = savedOrderDetail;

        await queryRunner.manager.save(OrderDetailProduct, orderItem);

        product.stock -= item.quantity;
        await queryRunner.manager.save(Product, product);

        total += product.price * item.quantity;
      }

      savedOrderDetail.price = total;
      await queryRunner.manager.save(OrderDetail, savedOrderDetail);

      const paypalOrder = await this.paypalService.createOrder(total, 'USD');
      const approveLink = paypalOrder.links.find(link => link.rel === 'approve');

      savedOrder.paypalData = {
        orderId: paypalOrder.id
      };
      await queryRunner.manager.save(Order, savedOrder);

      cart.isActive = false;
      await queryRunner.manager.save(Cart, cart);

      await queryRunner.commitTransaction();

      return {
        success: true,
        orderId: savedOrder.id,
        paypalId: paypalOrder.id,
        total,
        redirectUrl: approveLink?.href,
        items: cart.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Error al crear orden desde carrito: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}