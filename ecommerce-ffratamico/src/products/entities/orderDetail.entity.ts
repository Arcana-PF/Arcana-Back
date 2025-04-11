import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { Order } from "./order.entity";

@Entity({
  name: 'orderDetails'
})
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {precision: 10, scale: 2, nullable: false})
  price: number;

  @ManyToMany(() => Product, (product) => product.orderDetails)
  @JoinTable()
  products: Product[];

  @OneToOne(() => Order, (order) => order.orderDetail)
  @JoinColumn()
  order: Order;
}