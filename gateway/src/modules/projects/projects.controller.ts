import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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

@Controller('projects')
@UseInterceptors(TransformInterceptor)
export class ProjectsController {
  constructor(
    @Inject(MICROSERVICE_TOKENS.PROJECTS_SERVICE)
    private readonly projectsClient: ClientProxy,
  ) {}

  @Get()
  async findAll() {
    return firstValueFrom(this.projectsClient.send('projects.find_all', {}));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtPayload, @Body() body: Record<string, unknown>) {
    return firstValueFrom(
      this.projectsClient.send('projects.create', { ...body, clientId: user.sub }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMine(@CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.projectsClient.send('projects.find_my', { userId: user.sub, role: user.role }),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.projectsClient.send('projects.find_one', { id }));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: Record<string, unknown>,
  ) {
    return firstValueFrom(
      this.projectsClient.send('projects.update', { id, ...body, userId: user.sub, role: user.role }),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return firstValueFrom(
      this.projectsClient.send('projects.delete', { id, userId: user.sub }),
    );
  }
}
