import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { UserRepository } from 'src/users/users.repository';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async logIn(credentials: SignInAuthDTO) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son requeridos.');
    }

    const user = await this.userRepository.findOneByEmail(email);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Email o contraseña incorrectos.'); //Mensaje de seguridad en caso de escribir algun dato mal
    }

    return { message: 'Sesión iniciada correctamente'}; //mensaje de confirmacion
  }
}
