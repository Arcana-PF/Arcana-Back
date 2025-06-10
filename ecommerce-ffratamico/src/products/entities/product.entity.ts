// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
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

  @Column('text', {default: 'https://res.cloudinary.com/dcixxfhx9/image/upload/v1749511642/Imagen_de_WhatsApp_2025-05-24_a_las_11.48.09_49378316_vgginz.jpg'})
  imgUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({default: 0})
  quantity: number;

  @Column({nullable: true})
  score: number;

  @ManyToMany(() => Category, (category) => category.products, { eager: true })
  @JoinTable()
  categories: Category[];

}
