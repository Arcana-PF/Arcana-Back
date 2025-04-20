import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { OrderDetail } from "./entities/orderDetail.entity";
import { Repository } from "typeorm";

@Injectable()
export class OrderDetailRepository {
    constructor (@InjectRepository(OrderDetail) private readonly repository: Repository<OrderDetail>){}

    createOrderDetail(detail: Partial<OrderDetail> ){
        return this.repository.create(detail);
    }

    async saveOrderDetail(detail: OrderDetail){
        return await this.repository.save(detail);
    }

}