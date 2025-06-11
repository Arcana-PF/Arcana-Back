import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { UserRepository } from 'src/users/users.repository';
import { SignUpDTO } from './dto/signup-auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MockUsers } from 'src/users/mock/mock.users.data';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  private readonly mockUsers: SignUpDTO[] = MockUsers;

  async addUsers() {
    for (const user of this.mockUsers) {
      try {
        await this.signUp(user);
      } catch (error) {
        // Si ya existe el usuario, lo ignoramos
        if (error instanceof ConflictException) continue;
        // Otros errores se relanzan
        throw error;
      }
    }
  }

  async signUp(newUser: SignUpDTO) {
    const emailExists = await this.userRepository.findOneByEmail(newUser.email);
    if (emailExists)
      throw new ConflictException('ya existe un usuario con ese email');

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    if (!hashedPassword)
      throw new BadRequestException('La contraseña no pudo ser hasheada');

    const userToSave = { ...newUser, password: hashedPassword };

    const savedUSer = await this.userRepository.createUser(userToSave);
    const { password, ...userWithoutPassword } = savedUSer;

    return userWithoutPassword;
  }

  async signIn(credentials: SignInAuthDTO) {
    const { email, password } = credentials;

    const user = await this.userRepository.findOneByEmail(email);
    if (!user)
      throw new UnauthorizedException('Email o contraseña incorrectos.');

    const unhashedPassword = await bcrypt.compare(password, user.password);
    if (!unhashedPassword)
      throw new UnauthorizedException('Email o contraseña incorrectos.');
    
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    };
    const token = this.jwtService.sign(payload);

    return { success: 'Sesión iniciada correctamente', validationToken: token, user };
  }
}
