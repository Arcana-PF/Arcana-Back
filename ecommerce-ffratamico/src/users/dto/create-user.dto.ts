import { IsEmail, IsInt, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateUserDTO{
    @IsEmail()
    email: string;

    @IsString()
    @MaxLength(50)
    name: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,{
        message:
        'Tu contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una letra mayúscula, un número y un carácter especial'
    },)
    @IsString()
    @MaxLength(20)
    password: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsInt()
    @IsOptional()
    phone?: number;

    @IsString()
    @IsOptional()
    @MaxLength(50)
    country?: string;
    
    @IsString()
    @IsOptional()
    @MaxLength(50)
    city?: string;
}

