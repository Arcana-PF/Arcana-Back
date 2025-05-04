import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthenticatedRequest } from 'src/auth/dto/AuthenticatedRequest.dto';
import { Role } from 'src/config/enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiereRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass()
    ])

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    const hasRole = ()=> requiereRoles.some((role) => user.roles?.includes(role));
    const valid = user?.roles && hasRole();

    if(!valid){throw new UnauthorizedException('no tienes permiso para acceder a esta ruta')};

    return valid;
  }
}
