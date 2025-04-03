import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  logIn(@Body() Credentials: SignInAuthDTO){
    return this.authService.logIn(Credentials);
  }
}
