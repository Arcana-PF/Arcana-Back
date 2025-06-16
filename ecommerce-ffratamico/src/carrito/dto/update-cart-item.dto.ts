import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @Min(0, { message: 'La cantidad no puede ser negativa' })
  quantity: number;
}