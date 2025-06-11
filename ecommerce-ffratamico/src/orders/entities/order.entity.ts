import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderDetail } from "./orderDetail.entity";
import { OrderStatus } from "../enums/order-status.enum";

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => "date_trunc('minute', CURRENT_TIMESTAMP)" })
  date: Date;


  @Column({ default: true })
  isActive: boolean; // ← Nuevo campo para borrado lógico

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

 @Column({ type: 'jsonb', nullable: true })
  paypalData: {
    orderId?: string;  // <- Añade esta propiedad
    captureId?: string;
    payerEmail?: string;
    fullResponse?: any;
  };

  @ManyToOne(() => User, (user) => user.orders, { nullable: false })
  user: User;

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.order, { cascade: true })
  orderDetail: OrderDetail;
}