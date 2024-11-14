// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsersRepository } from '../users/users.repository';
import * as crypto from 'crypto';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { EmailService } from '../email/email.service';
import { ResetPasswordTokensService } from '../reset-password-tokens/reset-password-tokens.service';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private refreshTokensService: RefreshTokensService,
    private emailService: EmailService,
    private resetPasswordTokensService: ResetPasswordTokensService,
  ) {}

  private generateAccessToken(user: any): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }

  private generateRefreshToken(user: any): string {
    const tokenId = crypto.randomBytes(16).toString('hex'); // Génère un identifiant unique
    const payload = { sub: user.id, jti: tokenId };
    return this.jwtService.sign(payload, { expiresIn: '10d' });
  }

  private generateResetPasswordToken(userId: number): {
    token: string;
    tokenId: string;
  } {
    const tokenId = crypto.randomBytes(16).toString('hex');
    const payload = { userId: userId, jti: tokenId };
    return {
      token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      tokenId,
    };
  }

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

  async sendResetPasswordEmail(email: string) {
    const genericResponse = { message: 'Email sent' };
    const user = await this.usersRepository.findOneByEmail(email);
    if (!user) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return genericResponse;
    }
    try {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const { token, tokenId } = this.generateResetPasswordToken(user.id);
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      const text = `Click on this link to reset your password: ${resetUrl}`;

      await Promise.all([
        this.emailService.sendEmail(
          'noreply@pmscan.com',
          email,
          'Reset your password',
          text,
        ),
        this.resetPasswordTokensService.storeResetPasswordToken(
          tokenId,
          user.id,
          token,
        ),
      ]);

      return genericResponse;
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return genericResponse;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const resetToken = resetPasswordDto.resetToken;
    const newPassword = resetPasswordDto.password;

    try {
      const payload = this.jwtService.verify(resetToken);
      const tokenId = payload.jti;
      const userId = payload.userId;

      const storedData =
        await this.resetPasswordTokensService.getResetPasswordTokenData(
          tokenId,
        );

      if (!storedData) {
        throw new UnauthorizedException(
          'Expired or invalid reset password token',
        );
      }

      const hashedToken = this.resetPasswordTokensService.hashToken(resetToken);
      if (storedData.token !== hashedToken) {
        throw new UnauthorizedException('Invalid reset password token');
      }

      // Mettre à jour le mot de passe de l'utilisateur
      const user = await this.usersRepository.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await this.usersRepository.update(userId, user);

      // Supprimer le token de réinitialisation après utilisation
      await this.resetPasswordTokensService.deleteResetPasswordToken(tokenId);

      return { message: 'Password updated with success' };
    } catch (error) {
      console.error(
        'Erreur lors de la réinitialisation du mot de passe:',
        error,
      );
      throw new UnauthorizedException(
        'Reset password token expired or invalid',
      );
    }
  }
}
