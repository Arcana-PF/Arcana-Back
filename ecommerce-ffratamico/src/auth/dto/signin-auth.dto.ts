import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInAuthDTO{
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}