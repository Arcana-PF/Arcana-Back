import { IsArray, IsUUID, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class ProductIdDTO {
  @IsUUID(undefined, {message: 'El ID debe ser un UUID válido'})
  id: string;
}

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Se debe ingresar almenos 1 producto' })
  @ValidateNested({ each: true }) //esto sirve para que nest valide cada objeto que agrego en el array
  @Type(() => ProductIdDTO) //esto determina de que tipo deben ser los objetos del array
  products: ProductIdDTO[];
}