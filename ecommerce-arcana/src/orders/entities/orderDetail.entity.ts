import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "src/products/entities/product.entity";

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