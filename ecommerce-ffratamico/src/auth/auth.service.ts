import { Injectable } from '@nestjs/common';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async logIn(credentials: SignInAuthDTO) {
        // Verificar que ambas credenciales estén presentes
        if (!credentials.email || !credentials.password) {
            throw { message: 'Email y contraseña son requeridos.' };
        }
    
        // Buscar el usuario por email
        const user = await this.userService.findOneByEmail(credentials.email);
    
        // Si el usuario no existe o la contraseña no coincide
        if (!user || user.password !== credentials.password) {
          throw { message: 'Email o contraseña incorrectos.' };
        }
    
        // Si las credenciales son correctas
        return { message: 'Sesión iniciada correctamente' };
    }
}
