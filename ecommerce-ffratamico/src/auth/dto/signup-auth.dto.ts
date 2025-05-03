import { IsString } from "class-validator";
import { CreateUserDTO } from "src/users/dto/create-user.dto";

export class SignUpDTO extends CreateUserDTO{
    @IsString()
    confirmPassword: string;
}