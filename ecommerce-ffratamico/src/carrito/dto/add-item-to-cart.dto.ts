import { IsNotEmpty, IsString, IsUUID, IsInt, Min } from 'class-validator';

export class AddItemToCartDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor que cero' })
  quantity: number;
}