import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MinLength,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: "L'email de l'utilisateur",
    example: 'test@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    example: 'Password123!',
    minLength: 8,
    pattern:
      'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial',
    },
  )
  password?: string;

  @ApiProperty({
    description: "Le nom de l'utilisateur",
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;
}
