import { SetMetadata } from '@nestjs/common';

export const EMPLOYEE_ROLES_KEY = 'employeeRoles';
export const EmployeeRoles = (...roles: string[]) =>
  SetMetadata(EMPLOYEE_ROLES_KEY, roles);
