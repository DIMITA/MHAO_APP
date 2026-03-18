import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Inject,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICE_TOKENS } from '../../config/microservices.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('quotes')
@UseInterceptors(TransformInterceptor)
export class QuotesController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.QUOTES_SERVICE)
    private readonly quotesClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.quotesClient.send('quotes.create', { ...body, providerId: user.sub }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.quotesClient.send('quotes.find_my', { userId: user.sub, role: user.role }),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.quotesClient.send('quotes.find_one', { id, userId: user.sub, role: user.role }),
    );
  }

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async accept(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.quotesClient.send('quotes.accept', { id, clientId: user.sub }),
    );
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.quotesClient.send('quotes.reject', { id, clientId: user.sub }),
    );
  }
}
