import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(MICROSERVICE_TOKENS.AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Delegate full validation (including blacklist check) to auth service
      const payload = await firstValueFrom(
        this.authClient.send('auth.validate_token', { token }),
      );

      if (!payload) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        error?.message || 'Invalid or expired token',
      );
    }
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
