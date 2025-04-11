import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Category } from "./categories.entity";
import { OrderDetail } from "./orderDetail.entity";

@Entity({
  name: 'products'
})
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 50, nullable: false})
  name: string;

  @Column('text', {nullable: false})
  description: string;

  @Column('decimal', {precision: 10, scale: 2, nullable: false})
  price: number;
  
  @Column('int', {nullable: false})
  stock: number;

  @Column('text', {default: 'https://miapp.com/default-image.png'})
  imgUrl: string;

  @ManyToOne(() => Category, (category) => category.products, { nullable: false })
  category: Category;

  @ManyToMany(() => OrderDetail, (orderDetail) => orderDetail.products)
  orderDetails: OrderDetail[];
}
