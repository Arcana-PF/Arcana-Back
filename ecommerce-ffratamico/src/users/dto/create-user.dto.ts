import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";

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
    @IsNotEmpty()
    @MaxLength(20)
    password: string;

    @IsString()
    @MinLength(3)
    @MaxLength(50)
    address: string;

    @IsNumber()
    phone: number;

}

