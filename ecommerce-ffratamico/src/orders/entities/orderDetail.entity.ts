// src/orders/entities/orderDetail.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { OrderDetailProduct } from './order-detail-product.entity';

@Entity({ name: 'orderDetails' })
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price: number;

  @OneToMany(() => OrderDetailProduct, (item) => item.orderDetail, { cascade: true })
  items: OrderDetailProduct[];

  @OneToOne(() => Order, (order) => order.orderDetail)
  @JoinColumn()
  order: Order;
}