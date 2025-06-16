import { Injectable } from "@nestjs/common";
import { CartItem } from "./entities/cart-item.entity";
import { Cart } from "./entities/cart.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class CartRepository {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  async getOrCreateActiveCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId }, isActive: true },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ user: { id: userId }, items: [] });
      await this.cartRepo.save(cart);
    }

    return cart;
  }

  async addProductToCart(userId: string, productId: string, quantity: number) {
    const cart = await this.getOrCreateActiveCart(userId);

    const existingItem = cart.items.find(i => i.product.id === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      return this.cartItemRepo.save(existingItem);
    } else {
      const newItem = this.cartItemRepo.create({
        cart,
        product: { id: productId },
        quantity,
      });
      return this.cartItemRepo.save(newItem);
    }
  }

  async clearCart(cartId: string) {
    await this.cartItemRepo.delete({ cart: { id: cartId } });
  }

  async deactivateCart(cartId: string) {
    await this.cartRepo.update(cartId, { isActive: false });
  }
}
