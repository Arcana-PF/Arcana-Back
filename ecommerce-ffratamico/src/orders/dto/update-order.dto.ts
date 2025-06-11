// src/orders/dto/update-order.dto.ts
import { IsOptional, IsUUID, IsEnum, ValidateNested, ArrayMinSize, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enums/order-status.enum';

class UpdateOrderProductDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderProductDto)
  @ArrayMinSize(1)
  products?: UpdateOrderProductDto[];
}
