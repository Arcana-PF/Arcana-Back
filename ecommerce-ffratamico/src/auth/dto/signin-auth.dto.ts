import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInAuthDTO{
    @IsEmail({}, { message: 'El email es inválido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    password: string;
}