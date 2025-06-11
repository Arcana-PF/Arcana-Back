import { IsArray, IsString, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductOrderDto {
  @IsString()
  productId: string;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOrderDto)
  products: ProductOrderDto[];
}