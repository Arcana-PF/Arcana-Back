import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { SignUpDTO } from './dto/signup-auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Authenticator')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService){}

  @Post('seederUsers')
  addUsers(){
    return this.authService.addUsers();
  }

  @Post('signup')
  signUp(@Body() newUser: SignUpDTO) {
    return this.authService.signUp(newUser);
  }

  @Post('signin')
  logIn(@Body() Credentials: SignInAuthDTO) {
    return this.authService.signIn(Credentials);
  }

  @Post('google-login')
  signIn(@Body() email: string){
    return {
      "validationToken": "...",
      "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      }
    }
  }
}
