import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request: Request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers['authorization'];
    
    // Verificamos si el header de autorización existe
    if (!authHeader) {
      throw new UnauthorizedException('Email o password incorrectos');
    }

    // Verificamos si el formato es correcto (debe comenzar con "Basic")
    const [basic, credentials] = authHeader.split(' ');
    if (basic !== 'Basic' || !credentials) {
      throw new UnauthorizedException('Email o password incorrectos');
    }

    // Verificamos si el formato es "Basic: email:password"
    const [email, password] = credentials.split(':');
    if (!email || !password) {
      throw new UnauthorizedException('Email o password incorrectos');
    }

    // Todo está bien, se permite el acceso
    return true;
  }
}
