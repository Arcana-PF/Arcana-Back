import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../dto/AuthenticatedRequest.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = request.headers['authorization']?.split(' ')[1]; // Esto significa que despues des Bearer va un espacio y despues el token
    //ejemplo: Bearer fdsg684fg68f7g6a8g74
    if (!token) {
      throw new UnauthorizedException('token no encontrado'); // Verificamos si el token existe
    }

    try {
      const secret = process.env.JWT_SECRET;
      const verification = await this.jwtService.verifyAsync(token, { secret });
      
      // verification.roles = ['admin']; //esto se lo puedo agregar si los usuarios tienen distintos roles
      request.user = verification;

      return true;
    } catch (error) {
      throw new UnauthorizedException('token no valido');
    }
  }
}
