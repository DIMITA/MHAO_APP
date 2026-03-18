import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { ProjectStatus } from '@prisma/client';

@Controller()
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('projects.create')
  async create(
    @Payload() payload: { clientId: string; dto: CreateProjectDto },
  ) {
    this.logger.log(`projects.create called for client: ${payload.clientId}`);
    return this.projectsService.create(payload.clientId, payload.dto);
  }

  @MessagePattern('projects.find_all')
  async findAll(@Payload() filters: ProjectFilterDto) {
    this.logger.log('projects.find_all called');
    return this.projectsService.findAll(filters);
  }

  @MessagePattern('projects.find_one')
  async findOne(@Payload() payload: { id: string }) {
    this.logger.log(`projects.find_one called for id: ${payload.id}`);
    return this.projectsService.findOne(payload.id);
  }

  @MessagePattern('projects.update')
  async update(
    @Payload()
    payload: { id: string; clientId: string; dto: UpdateProjectDto },
  ) {
    this.logger.log(`projects.update called for id: ${payload.id}`);
    return this.projectsService.update(
      payload.id,
      payload.clientId,
      payload.dto,
    );
  }

  @MessagePattern('projects.delete')
  async delete(@Payload() payload: { id: string; clientId: string }) {
    this.logger.log(`projects.delete called for id: ${payload.id}`);
    return this.projectsService.delete(payload.id, payload.clientId);
  }

  @MessagePattern('projects.my_projects')
  async getMyProjects(@Payload() payload: { clientId: string }) {
    this.logger.log(
      `projects.my_projects called for client: ${payload.clientId}`,
    );
    return this.projectsService.getMyProjects(payload.clientId);
  }

  @MessagePattern('projects.update_status')
  async updateStatus(
    @Payload() payload: { id: string; status: ProjectStatus },
  ) {
    this.logger.log(
      `projects.update_status called for id: ${payload.id}, status: ${payload.status}`,
    );
    return this.projectsService.updateStatus(payload.id, payload.status);
  }
}
