// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../../categories/entities/categories.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  price: number;
  
  @Column('int', { nullable: false })
  stock: number;

  @Column('text', { default: 'imagen por defecto' })
  imgUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.products, { nullable: false })
  category: Category;

  // Eliminamos la relación con OrderDetail
}