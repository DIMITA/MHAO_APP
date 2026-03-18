import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: RegisterDto) {
    this.logger.log(`auth.register → ${data.email}`);
    try {
      return await this.authService.register(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 500, message: error?.message || 'Registration failed' });
    }
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: LoginDto) {
    this.logger.log(`auth.login → ${data.email}`);
    try {
      return await this.authService.login(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 500, message: error?.message || 'Login failed' });
    }
  }

  @MessagePattern('auth.send_otp')
  async sendOtp(@Payload() data: SendOtpDto) {
    this.logger.log(`auth.send_otp → ${data.phone}`);
    try {
      return await this.authService.sendOtp(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 500, message: error?.message || 'Failed to send OTP' });
    }
  }

  @MessagePattern('auth.verify_otp')
  async verifyOtp(@Payload() data: VerifyOtpDto) {
    this.logger.log(`auth.verify_otp → ${data.phone}`);
    try {
      return await this.authService.verifyOtp(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 500, message: error?.message || 'OTP verification failed' });
    }
  }

  @MessagePattern('auth.refresh_token')
  async refreshToken(@Payload() data: RefreshTokenDto) {
    this.logger.log('auth.refresh_token');
    try {
      return await this.authService.refreshToken(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 500, message: error?.message || 'Token refresh failed' });
    }
  }

  @MessagePattern('auth.logout')
  async logout(
    @Payload() data: { userId: string; jti: string; accessToken: string },
  ) {
    this.logger.log(`auth.logout → user ${data.userId}`);
    try {
      return await this.authService.logout(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 500, message: error?.message || 'Logout failed' });
    }
  }

  @MessagePattern('auth.validate_token')
  async validateToken(@Payload() data: { token: string }) {
    try {
      return await this.authService.validateToken(data);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ statusCode: 401, message: error?.message || 'Token validation failed' });
    }
  }
}
