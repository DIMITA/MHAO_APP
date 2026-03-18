import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { ProjectStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, dto: CreateProjectDto) {
    try {
      const project = await this.prisma.project.create({
        data: {
          clientId,
          title: dto.title,
          description: dto.description,
          category: dto.category || 'general',
          budgetMin: dto.budgetMin,
          budgetMax: dto.budgetMax,
          lat: dto.lat,
          lng: dto.lng,
          address: dto.address,
          city: dto.city || 'Cotonou',
          country: dto.country || 'Benin',
          photos: dto.photos || [],
          status: 'OPEN',
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      });
      return project;
    } catch (error) {
      this.logger.error('Failed to create project', error);
      throw new RpcException({
        statusCode: 500,
        message: 'Failed to create project',
      });
    }
  }

  async findAll(filters: ProjectFilterDto) {
    const {
      status,
      category,
      lat,
      lng,
      radius,
      budgetMin,
      budgetMax,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (category) where.category = category;
    if (budgetMin !== undefined) where.budgetMin = { gte: budgetMin };
    if (budgetMax !== undefined) where.budgetMax = { lte: budgetMax };

    // Fetch projects with filters (excluding geo for initial query)
    const [allProjects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: { quotes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    // Apply Haversine geolocation filter in-app if lat/lng/radius provided
    let filtered = allProjects;
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      filtered = allProjects.filter((project) => {
        const distance = this.haversineDistance(
          lat,
          lng,
          project.lat,
          project.lng,
        );
        return distance <= radius;
      });
    }

    // Apply pagination after geo filter
    const paginatedProjects = filtered.slice(skip, skip + limit);
    const filteredTotal = filtered.length;

    return {
      projects: paginatedProjects,
      total: filteredTotal,
      page,
      totalPages: Math.ceil(filteredTotal / limit),
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        _count: {
          select: { quotes: true },
        },
      },
    });

    if (!project) {
      throw new RpcException({
        statusCode: 404,
        message: `Project with id ${id} not found`,
      });
    }

    return project;
  }

  async update(id: string, clientId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new RpcException({
        statusCode: 404,
        message: `Project with id ${id} not found`,
      });
    }

    if (project.clientId !== clientId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to update this project',
      });
    }

    const { status, ...rest } = dto;
    const updateData: any = { ...rest };
    if (status) updateData.status = status;

    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: { quotes: true },
        },
      },
    });
  }

  async delete(id: string, clientId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new RpcException({
        statusCode: 404,
        message: `Project with id ${id} not found`,
      });
    }

    if (project.clientId !== clientId) {
      throw new RpcException({
        statusCode: 403,
        message: 'You do not have permission to delete this project',
      });
    }

    if (project.status !== 'OPEN') {
      throw new RpcException({
        statusCode: 400,
        message: 'Only OPEN projects can be deleted',
      });
    }

    await this.prisma.project.delete({ where: { id } });

    return { message: 'Project deleted successfully', id };
  }

  async getMyProjects(clientId: string) {
    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        _count: {
          select: { quotes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async updateStatus(id: string, status: ProjectStatus) {
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new RpcException({
        statusCode: 404,
        message: `Project with id ${id} not found`,
      });
    }

    return this.prisma.project.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Haversine formula to calculate distance between two coordinates in km.
   */
  private haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}
