import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  phone?: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  //  Register
  // ─────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ userId: string; message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new RpcException({
        statusCode: 409,
        message: 'A user with this email already exists',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role ?? 'CLIENT',
        isActive: true,
        isPhoneVerified: false,
      },
    });

    // Send OTP for phone verification if phone provided
    if (dto.phone) {
      await this.sendOtp({ phone: dto.phone });
    }

    this.logger.log(`User registered: ${user.id} (${user.email})`);

    return {
      userId: user.id,
      message: 'Registration successful. Please verify your phone number.',
    };
  }

  // ─────────────────────────────────────────────
  //  Login
  // ─────────────────────────────────────────────
  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: object }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new RpcException({ statusCode: 401, message: 'Invalid credentials' });
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new RpcException({ statusCode: 401, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      throw new RpcException({ statusCode: 403, message: 'Account is deactivated' });
    }

    const tokens = await this.generateTokens(user);

    this.logger.log(`User logged in: ${user.id}`);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }

  // ─────────────────────────────────────────────
  //  Send OTP
  // ─────────────────────────────────────────────
  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.cacheOtp(dto.phone, otp, 300);

    // MVP: log the OTP instead of real SMS
    this.logger.log(`[SMS MOCK] OTP for ${dto.phone}: ${otp}`);

    return { message: 'OTP sent successfully' };
  }

  // ─────────────────────────────────────────────
  //  Verify OTP
  // ─────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string }> {
    const storedOtp = await this.redis.getOtp(dto.phone);

    if (!storedOtp) {
      throw new RpcException({
        statusCode: 400,
        message: 'OTP expired or not found. Please request a new one.',
      });
    }

    if (storedOtp !== dto.otp) {
      throw new RpcException({ statusCode: 400, message: 'Invalid OTP' });
    }

    // Mark phone as verified in DB
    await this.prisma.user.updateMany({
      where: { phone: dto.phone },
      data: { isPhoneVerified: true },
    });

    await this.redis.deleteOtp(dto.phone);

    this.logger.log(`Phone verified: ${dto.phone}`);

    return { message: 'Phone number verified successfully' };
  }

  // ─────────────────────────────────────────────
  //  Refresh Token
  // ─────────────────────────────────────────────
  async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'refresh_secret'),
      });
    } catch {
      throw new RpcException({ statusCode: 401, message: 'Invalid or expired refresh token' });
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new RpcException({ statusCode: 401, message: 'User not found or deactivated' });
    }

    const jti = uuidv4();
    const accessTokenExpiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        jti,
      },
      {
        secret: this.config.get<string>('JWT_SECRET', 'access_secret'),
        expiresIn: accessTokenExpiresIn,
      },
    );

    return { accessToken };
  }

  // ─────────────────────────────────────────────
  //  Logout
  // ─────────────────────────────────────────────
  async logout(data: {
    userId: string;
    jti: string;
    accessToken: string;
  }): Promise<{ message: string }> {
    try {
      // Decode to get remaining TTL
      const decoded = this.jwtService.decode(data.accessToken) as JwtPayload & { exp: number };

      if (decoded?.jti && decoded?.exp) {
        const now = Math.floor(Date.now() / 1000);
        const remainingTtl = decoded.exp - now;

        if (remainingTtl > 0) {
          await this.redis.blacklistToken(decoded.jti, remainingTtl);
        }
      }
    } catch (error) {
      this.logger.warn(`Logout: could not decode token for blacklisting`, error);
    }

    return { message: 'Logged out successfully' };
  }

  // ─────────────────────────────────────────────
  //  Validate Token (called by gateway JWT guard)
  // ─────────────────────────────────────────────
  async validateToken(data: { token: string }): Promise<JwtPayload> {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify<JwtPayload>(data.token, {
        secret: this.config.get<string>('JWT_SECRET', 'access_secret'),
      });
    } catch {
      throw new RpcException({ statusCode: 401, message: 'Invalid or expired token' });
    }

    if (payload.jti) {
      const isBlacklisted = await this.redis.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new RpcException({ statusCode: 401, message: 'Token has been revoked' });
      }
    }

    return payload;
  }

  // ─────────────────────────────────────────────
  //  Generate Tokens (internal)
  // ─────────────────────────────────────────────
  private async generateTokens(user: {
    id: string;
    email: string;
    phone: string | null;
    role: string;
  }): Promise<TokenPair> {
    const jti = uuidv4();

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        jti,
      },
      {
        secret: this.config.get<string>('JWT_SECRET', 'access_secret'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        jti: uuidv4(),
      },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET', 'refresh_secret'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      },
    );

    return { accessToken, refreshToken };
  }
}
