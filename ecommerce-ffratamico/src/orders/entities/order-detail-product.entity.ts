
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OrderDetail } from './orderDetail.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'order_detail_products' })
export class OrderDetailProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number;

  @ManyToOne(() => OrderDetail, (orderDetail) => orderDetail.items)
  orderDetail: OrderDetail;

  @ManyToOne(() => Product, { eager: true }) // eager: true para carga automática
  product: Product;
}