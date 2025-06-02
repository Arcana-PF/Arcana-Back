import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { SignUpDTO } from './dto/signup-auth.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Authenticator')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService){}

  @Post('signup')
  signUp(@Body() newUser: SignUpDTO) {
    return this.authService.signUp(newUser);
  }

  @Post('signin')
  logIn(@Body() Credentials: SignInAuthDTO) {
    return this.authService.signIn(Credentials);
  }
}
