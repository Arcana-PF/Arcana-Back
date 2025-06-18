import { PartialType } from '@nestjs/mapped-types'; //Sirve para que todos los campos de vuelvan opcionales
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryNames?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} //El PartialType usa todos los campos de CreateProductDTO pero los vuelve opcionales
