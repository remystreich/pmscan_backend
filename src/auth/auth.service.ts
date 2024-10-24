// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../users/users.repository';
import * as crypto from 'crypto';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private refreshTokensService: RefreshTokensService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    const decoded = this.jwtService.decode(refreshToken) as any;
    const tokenId = decoded.jti;

    await this.refreshTokensService.storeRefreshToken(
      tokenId,
      user.id,
      refreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(user: any): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(user: any): string {
    const tokenId = crypto.randomBytes(16).toString('hex'); // Génère un identifiant unique
    const payload = { sub: user.id, jti: tokenId };
    return this.jwtService.sign(payload, { expiresIn: '10d' });
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokenId = payload.jti;
      const userId = payload.sub;

      const storedData =
        await this.refreshTokensService.getRefreshTokenData(tokenId);

      if (!storedData) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const hashedToken = this.refreshTokensService.hashToken(refreshToken);
      if (storedData.token !== hashedToken) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const user = await this.usersRepository.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      const newAccessToken = this.generateAccessToken(user);

      return { access_token: newAccessToken };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokenId = payload.jti;
      await this.refreshTokensService.deleteRefreshToken(tokenId);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }
}
