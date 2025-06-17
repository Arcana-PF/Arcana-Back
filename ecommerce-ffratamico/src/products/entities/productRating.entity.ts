import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { User } from 'src/users/entities/user.entity';
import { Max, Min } from 'class-validator';

@Entity()
export class ProductRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.ratings)
  user: User;

  @ManyToOne(() => Product, product => product.ratings, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'int' })
  @Min(1)
  @Max(5)
  score: number;
}