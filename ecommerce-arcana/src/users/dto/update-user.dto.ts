import { PartialType } from '@nestjs/mapped-types'; //Sirve para que todos los campos de vuelvan opcionales
import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {} //El PartialType usa todos los campos de CreateUserDTO pero los vuelve opcionales