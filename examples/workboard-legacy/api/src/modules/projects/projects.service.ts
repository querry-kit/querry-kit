import type { Project, Task } from '@/generated/prisma/client';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QueryOptionsMap, QueryService } from '@querry-kit/nest';

import type { CreateProjectDTO } from './dto/create-project.dto';
import type { UpdateTaskDTO } from './dto/update-task.dto';
import { ProjectTypeMap } from './project.types';
import { PrismaService } from '~/prisma/prisma.service';

@Injectable()
export class ProjectsService extends QueryService<
  PrismaService['project'],
  ProjectTypeMap,
  PrismaService['project'],
  QueryOptionsMap<ProjectTypeMap>
> {
  static readonly token = 'WORKBOARD_PROJECTS_SERVICE';

  constructor(@Inject(PrismaService) private readonly db: PrismaService) {
    super(db.project);
  }

  async create(data: CreateProjectDTO, query: QueryOptionsMap<ProjectTypeMap>['findById']): Promise<Project> {
    return this.db.project.create({ data, include: query.include });
  }

  async updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
    const existing = await this.db.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Task not found.');

    return this.db.task.update({ where: { id }, data });
  }
}
