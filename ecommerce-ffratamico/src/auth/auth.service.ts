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
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
    await this.mailService.sendEmail(
      savedUSer.email,
      '¡Bienvenido a Arcana!',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color:rgb(112, 7, 161);">¡Bienvenido a Arcana!</h2>
        <p>Hola ${savedUSer.name|| savedUSer.email},</p>
        <p>Gracias por registrarte. Estamos felices de tenerte con nosotros.</p>
        <p>Puedes comenzar a comprar desde ya en nuestra tienda online.</p>
        <p style="margin-top: 30px;">Saludos,<br><strong> Equipo de Arcana</strong></p>
        <hr style="margin-top: 40px;" />
        <small style="color: #888;">Este correo fue enviado automáticamente. Por favor, no respondas.</small>
      </div>
      `
    );
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
