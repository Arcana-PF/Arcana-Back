import { IsEmail, IsOptional, IsString, Matches } from "class-validator";

export class CreateUserDTO{
    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,15}$/,{
        message:
        'Tu contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una letra mayúscula, un número y un carácter especial'
    },)
    @IsString()
    password: string;

    @IsString()
    address: string;

    @IsString()
    phone: string;

    @IsString()
    @IsOptional()
    country?: string;
    
    @IsString()
    @IsOptional()
    city?: string;
}

