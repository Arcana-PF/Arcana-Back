import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request: Request = context.switchToHttp().getRequest();
    
    const authHeader = request.headers['authorization'];
    
    if (!authHeader) {
      throw new UnauthorizedException('Email o password incorrectos'); // Verificamos si el header de autorización existe
    }

    const [basic, credentials] = authHeader.split(' '); // Verificamos si el formato es correcto (debe comenzar con "Basic")
    if (basic !== 'Basic' || !credentials) { 
      throw new UnauthorizedException('Email o password incorrectos');
    }

    const [email, password] = credentials.split(':'); // Verificamos que el formato es "Basic: email:password"
    if (!email || !password) {
      throw new UnauthorizedException('Email o password incorrectos');
    }

    return true;
  }
}
