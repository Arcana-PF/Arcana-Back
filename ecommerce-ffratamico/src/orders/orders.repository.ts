import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "src/users/users.repository";
import { Order } from "./entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class OrdersRepository {
    constructor( @InjectRepository(Order) private readonly repository: Repository<Order>, private readonly userRepository: UserRepository) {}

    async addOrder(newOrder){
        const user = await this.userRepository.getById(newOrder.userId);
        if(!user){throw new Error('usuario no encontrado')};

    }

    getOrder(id){

    }
}