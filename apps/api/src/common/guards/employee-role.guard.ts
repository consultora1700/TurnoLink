import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EMPLOYEE_ROLES_KEY } from '../decorators/employee-roles.decorator';

@Injectable()
export class EmployeeRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      EMPLOYEE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // OWNER/SUPER_ADMIN bypass — they always have access
    if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') {
      return true;
    }

    // For EMPLOYEE role users, check employeeRole
    if (user.role === 'EMPLOYEE' && user.employeeRole) {
      if (requiredRoles.includes(user.employeeRole)) {
        return true;
      }
    }

    throw new ForbiddenException('No tenés permisos para realizar esta acción');
  }
}
