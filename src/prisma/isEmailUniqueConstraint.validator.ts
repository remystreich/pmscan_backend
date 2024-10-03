import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prismaService: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(email: string, args: ValidationArguments) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });
      return !user;
    } catch (error) {
      console.error('Error during email uniqueness check:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `Email ${args.value} already exists.`;
  }
}

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}
