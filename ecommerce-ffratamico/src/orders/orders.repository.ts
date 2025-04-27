import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "src/users/users.repository";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProductsRepository } from "src/products/products.repository";
import { Product } from "src/products/entities/product.entity";
import { OrderDetailRepository } from "./orderDetail.repository";

@Injectable()
export class OrdersRepository {
    constructor( @InjectRepository(Order) private readonly repository: Repository<Order>, 
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductsRepository,
    private readonly orderDetailRepository: OrderDetailRepository) {}

    async addOrder(order: CreateOrderDto){
        const user = await this.userRepository.getById(order.userId);
        // if(!user)throw new NotFoundException('usuario no encontrado'); //ya lo valida la funcion getById de users
        
        const productsToBuy: Product[] = [];
        let total = 0;
    
        for ( const item of order.products) {
            const product = await this.productRepository.getProductById(item.id);
            // if(!product) throw new ConflictException(`El producto con el ID ${item.id} no existe`);//Ya lo valida en la funcion
            if(product.stock <= 0 ) continue;

            product.stock -= 1;
            await this.productRepository.updateProduct(product.id, {stock: product.stock});

            productsToBuy.push(product);
            total += Number(product.price);
        }

        if(productsToBuy.length === 0) throw new ConflictException('Ningun producto tiene stock disponible');

        const orderDetail = this.orderDetailRepository.createOrderDetail({price: total, products: productsToBuy});
        await this.orderDetailRepository.saveOrderDetail(orderDetail);

        const newOrder = this.repository.create({user, orderDetail});
        await this.repository.save(newOrder);

        return {id: newOrder.id, total: orderDetail.price, orderDetailId: orderDetail.id}

    }

    getOrder(id: string){
        const order = this.repository.findOne({where: {id}, relations: {orderDetail:{products: true}}});
        
        if(!order) throw new NotFoundException('La orden no fue encontrada');

        return order;

    }
}