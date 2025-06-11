import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/auth/dto/AuthenticatedRequest.dto';


@Injectable()
export class IsUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (user?.isAdmin) {
      throw new UnauthorizedException('Los administradores no tienen permiso para acceder a esta ruta');
    }

    return true;
  }
}
