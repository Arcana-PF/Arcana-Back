import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Product } from './product.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
@Unique(['user', 'product'])
export class ProductRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  score: number;

  @ManyToOne(() => Product, product => product.ratings, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => User, user => user.ratings, { onDelete: 'CASCADE' })
  user: User;
}