import { IsArray, IsUUID, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ProductIdDTO {
  @IsUUID(undefined, { message: 'El ID debe ser un UUID válido' })
  id: string;
}

export class CreateOrderDto {
  @IsUUID(undefined, { message: 'El ID debe ser un UUID válido' })
  userId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Se debe ingresar al menos 1 producto' })
  @ValidateNested({ each: true })
  @Type(() => ProductIdDTO)
  products: ProductIdDTO[];
}