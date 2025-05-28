import { PartialType } from '@nestjs/mapped-types'; //Sirve para que todos los campos de vuelvan opcionales
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {} //El PartialType usa todos los campos de CreateProductDTO pero los vuelve opcionales
