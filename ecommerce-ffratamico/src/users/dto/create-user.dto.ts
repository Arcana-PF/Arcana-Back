import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO{
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(80)
    name: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,15}$/,{
        message:
        'Tu contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una letra mayúscula, un número y algunos de estos caracteres especiales: !@#$%^&*'
    },)
    @IsString()
    @MaxLength(15)
    password: string;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(80)
    address?: string;

    @IsInt()
    phone: number;

    @IsString()
    @IsOptional()
    @MinLength(5)
    @MaxLength(20)
    country?: string;
    
    @IsString()
    @IsOptional()
    @MinLength(5)
    @MaxLength(20)
    city?: string;
}

