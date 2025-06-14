import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ItemIdParamDto {
  @ApiProperty({ format: 'uuid', description: 'ID del item dentro del carrito' })
  @IsUUID(undefined, { message: 'El ID debe ser un UUID válido' })
  itemId: string;
}