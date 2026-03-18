import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: Record<string, unknown>) {
    return firstValueFrom(this.authClient.send('auth.register', body));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: Record<string, unknown>) {
    return firstValueFrom(this.authClient.send('auth.login', body));
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() body: Record<string, unknown>) {
    return firstValueFrom(this.authClient.send('auth.send_otp', body));
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: Record<string, unknown>) {
    return firstValueFrom(this.authClient.send('auth.verify_otp', body));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: Record<string, unknown>) {
    return firstValueFrom(this.authClient.send('auth.refresh_token', body));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.authClient.send('auth.logout', { ...body, userId: user.sub, jti: user.jti }),
    );
  }
}
