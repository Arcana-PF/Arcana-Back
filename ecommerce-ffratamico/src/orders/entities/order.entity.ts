import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderDetail } from "./orderDetail.entity";

@Entity({
  name: 'orders'
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'timestamp',
    default: () => "date_trunc('minute', CURRENT_TIMESTAMP)",
  })
  date: Date;

   @Column({ default: true })
    isActive: boolean; // ← Nuevo campo para borrado lógico

  @ManyToOne(() => User, (user) => user.orders, {nullable: false})
  user:User;

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.order, { cascade: true })
  orderDetail: OrderDetail;
}
  