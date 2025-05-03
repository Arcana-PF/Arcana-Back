import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDTO{
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    name: string;

    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/,{
        message:
        'Tu contraseña debe tener entre 8 y 15 caracteres, incluir al menos una letra minúscula, una letra mayúscula, un número y algunos de estos caracteres especiales: !@#$%^&*'
    },)
    @IsString()
    @MaxLength(20)
    password: string;

    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(50)
    address?: string;

    @IsInt()
    phone: number;

    @IsString()
    @IsOptional()
    @MinLength(5)
    @MaxLength(50)
    country?: string;
    
    @IsString()
    @IsOptional()
    @MinLength(5)
    @MaxLength(50)
    city?: string;
}

