import { Cart } from "src/carrito/entities/cart.entity";
import { Order } from "src/orders/entities/order.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: 'users'
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 50, nullable: false})
  name: string;

  @Column({unique: true, length: 50, nullable: false})
  email: string;

  @Column({length: 100, nullable: false})
  password: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column('text', {nullable: true})
  address: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({default: true})
  isActive: boolean

  @OneToMany(() => Cart, (cart) => cart.user)
   carts: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
