import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UserDTO {
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

}