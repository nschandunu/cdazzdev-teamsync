import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(userId: string, email: string, role: string) {
    const accessTokenSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshTokenSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    const accessTokenExpiresIn = this.getJwtExpiresIn('JWT_ACCESS_EXPIRATION');
    const refreshTokenExpiresIn = this.getJwtExpiresIn('JWT_REFRESH_EXPIRATION');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: accessTokenSecret, expiresIn: accessTokenExpiresIn },
      ),
      this.jwtService.signAsync(
        { sub: userId },
        { secret: refreshTokenSecret, expiresIn: refreshTokenExpiresIn },
      ),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash: hashedPassword, name: dto.name },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const refreshTokenSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshTokenSecret,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      
      return this.generateTokens(user.id, user.email, user.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private getJwtExpiresIn(key: 'JWT_ACCESS_EXPIRATION' | 'JWT_REFRESH_EXPIRATION'): JwtExpiresIn {
    const value = this.configService.getOrThrow<string>(key);
    const numericValue = Number(value);

    if (Number.isInteger(numericValue) && String(numericValue) === value.trim()) {
      return numericValue;
    }

    return value as JwtExpiresIn;
  }
}