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
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { CreateUserDTO } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private readonly mockUsers: SignUpDTO[] = MockUsers;

  private jwks = jwksClient({
    jwksUri: `${process.env.AUTH0_DOMAIN}.well-known/jwks.json`,
  });

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async addUsers() {
    for (const user of this.mockUsers) {
      try {
        await this.signUp(user);
      } catch (error) {
        if (error instanceof ConflictException) continue;
        throw error;
      }
    }
  }

  async signUp(newUser: SignUpDTO) {
    const emailExists = await this.userRepository.findOneByEmail(newUser.email);
    if (emailExists) throw new ConflictException('ya existe un usuario con ese email');

    const hashedPassword = await bcrypt.hash(newUser.password, 10);
    if (!hashedPassword) throw new BadRequestException('La contraseña no pudo ser hasheada');

    const userToSave = { ...newUser, password: hashedPassword };

    const savedUser = await this.userRepository.createUser(userToSave);
    const { password, ...userWithoutPassword } = savedUser;

    await this.mailService.sendEmail(
      savedUser.email,
      '¡Bienvenido a Arcana!',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color:rgb(112, 7, 161);">¡Bienvenido a Arcana!</h2>
        <p>Hola ${savedUser.name || savedUser.email},</p>
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
    if (!user) throw new UnauthorizedException('Email o contraseña incorrectos.');

    const unhashedPassword = await bcrypt.compare(password, user.password);
    if (!unhashedPassword) throw new UnauthorizedException('Email o contraseña incorrectos.');

    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const token = this.jwtService.sign(payload);

    await this.mailService.sendEmail(
    user.email,
    'Has iniciado sesión en Arcana',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color:rgb(112, 7, 161);">Inicio de sesión exitoso</h2>
      <p>Hola ${user.name || user.email},</p>
      <p>Tu cuenta ha sido utilizada para iniciar sesión en nuestra plataforma.</p>
      <p>Si no fuiste tú, por favor contáctanos de inmediato.</p>
      <p style="margin-top: 30px;">Saludos,<br><strong>Equipo de Arcana</strong></p>
      <hr style="margin-top: 40px;" />
      <small style="color: #888;">Este correo fue enviado automáticamente. Por favor, no respondas.</small>
    </div>
    `
  );

    return {
      success: 'Sesión iniciada correctamente',
      validationToken: token,
      user,
    };
  }

  // 🚀 Nuevo método: login con Auth0
  async signInWithAuth0(auth0Token: string) {
    const decoded = await this.verifyAuth0Token(auth0Token);
    const email = decoded.email;

    if (!email) throw new UnauthorizedException('Token de Auth0 inválido: no tiene email');

    // Verificamos si el usuario existe
    let user = await this.userRepository.findOneByEmail(email);
    if (!user) {
      // Si no existe, lo creamos como usuario normal
     const userToSave: CreateUserDTO = {
  email,
  name: decoded.name || email,
  address: '', // si tenés campos obligatorios como este, dales valores por defecto o hazlos opcionales
  phone: '',   // idem
  password: '', // si no usás contraseña para usuarios Auth0, podés dejar vacío o nulo (y tu repositorio debería soportarlo)
};
      user = await this.userRepository.createUser(userToSave);
    }

    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const token = this.jwtService.sign(payload);

    return {
      success: 'Sesión con Auth0 iniciada correctamente',
      validationToken: token,
      user,
    };
  }

  // 🔐 Verificación del token de Auth0
  private verifyAuth0Token(token: string): Promise<jwt.JwtPayload> {
    return new Promise((resolve, reject) => {
      const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
        this.jwks.getSigningKey(header.kid, (err, key) => {
          const signingKey = key?.getPublicKey();
          callback(err, signingKey);
        });
      };

      jwt.verify(
        token,
        getKey,
        {
          audience: process.env.AUTH0_AUDIENCE,
          issuer: `${process.env.AUTH0_DOMAIN}`,
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err || !decoded) {
            return reject(new UnauthorizedException('Token de Auth0 inválido'));
          }
          resolve(decoded as jwt.JwtPayload);
        },
      );
    });
  }
}
