// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } =
      await this.authService.login(loginDto);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 jours
    });

    return { access_token };
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Register' })
  @ApiResponse({ status: 201, description: 'Register successful' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir le token' })
  @ApiResponse({ status: 200, description: 'Token rafraîchi avec succès' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refreshToken(
    @Req() req: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    const access_token =
      await this.authService.refreshAccessToken(refreshToken);

    return { access_token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    } else {
      throw new UnauthorizedException('Refresh token manquant');
    }

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Déconnexion réussie' };
  }
}
