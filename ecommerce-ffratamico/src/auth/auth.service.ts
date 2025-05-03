import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInAuthDTO } from './dto/signin-auth.dto';
import { UserRepository } from 'src/users/users.repository';
import { SignUpDTO } from './dto/signup-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signUp(newUser: SignUpDTO){
    const emailExists= await this.userRepository.findOneByEmail(newUser.email);
    if(emailExists) throw new ConflictException('ya existe un usuario con ese email');

    if (newUser.password !== newUser.confirmPassword) throw new BadRequestException('Las contraseñas no coinciden');

    const hashedPassword = await bcrypt.hash(newUser.password, 10)
    if(!hashedPassword) throw new BadRequestException('La contraseña no pudo ser hasheada');
 
    const {confirmPassword, ...userdata} = newUser;
    const userToSave = {...userdata, password: hashedPassword};
    
    const savedUSer = await this.userRepository.createUser(userToSave);
    const {password, ...userWithoutPassword} = savedUSer;

    return userWithoutPassword;
  }

  async logIn(credentials: SignInAuthDTO) {
    const { email, password } = credentials;

    const user = await this.userRepository.findOneByEmail(email);

    if (!user || user.password !== password) {
      throw new UnauthorizedException('Email o contraseña incorrectos.'); //Mensaje de seguridad en caso de escribir algun dato mal
    }

    return { message: 'Sesión iniciada correctamente'}; //mensaje de confirmacion
  }
}
