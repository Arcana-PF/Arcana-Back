import { PartialType } from '@nestjs/mapped-types'; //Sirve para que todos los campos de vuelvan opcionales
import { CreateUserDTO } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
    
    @IsBoolean()
    @IsOptional()
    isAdmin: boolean
    
} //El PartialType usa todos los campos de CreateUserDTO pero los vuelve opcionales