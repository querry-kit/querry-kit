import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiErrorResponses,
  ApiFieldsQuery,
  ApiPaginatedResponse,
  ApiParamId,
  ApiResourceQuery,
  Fields,
  FindByIdDTO,
  prepareFieldsQuery,
  QueryDTO,
  ResourceQuery,
} from '@querry-kit/nest';

import { CreateProjectDTO } from './dto/create-project.dto';
import { ProjectDTO, type ProjectModel } from './dto/project.dto';
import { UpdateTaskDTO } from './dto/update-task.dto';
import { ProjectsService } from './projects.service';
import { ProjectTypeMap } from './project.types';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(@Inject(ProjectsService.token) private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Query projects with nested workspace, tasks, labels and assignees' })
  @ApiResourceQuery()
  @ApiPaginatedResponse({ model: ProjectDTO })
  @ApiErrorResponses({ badRequestDescription: 'Invalid query, include or fields parameter.' })
  async query(@Query() query: QueryDTO<ProjectTypeMap>) {
    return ResourceQuery.query({
      service: this.projectsService,
      query,
      schema: ProjectDTO,
      map: (project: ProjectModel) => ProjectDTO.fromModel(project),
    });
  }

  @Get(':id')
  @ApiParamId({ description: 'Project ID' })
  @ApiOperation({ summary: 'Find a project by ID' })
  @ApiFieldsQuery()
  @ApiOkResponse({ type: ProjectDTO })
  async findById(@Param('id') id: string, @Query() query: FindByIdDTO<ProjectTypeMap>) {
    return ResourceQuery.findById({
      service: this.projectsService,
      id,
      query,
      schema: ProjectDTO,
      map: (project: ProjectModel) => ProjectDTO.fromModel(project),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a project in a workspace' })
  @ApiFieldsQuery()
  @ApiCreatedResponse({ type: ProjectDTO })
  async create(@Body() data: CreateProjectDTO, @Query() query: FindByIdDTO<ProjectTypeMap>) {
    const prepared = prepareFieldsQuery(query, ProjectDTO);
    const project = await this.projectsService.create(data, prepared.query);

    return Fields.project(ProjectDTO.fromModel(project), prepared.projection);
  }

  @Patch('tasks/:id')
  @ApiParamId({ description: 'Task ID' })
  @ApiOperation({ summary: 'Update a task status or assignee' })
  @ApiOkResponse({ type: ProjectDTO })
  async updateTask(@Param('id') id: string, @Body() data: UpdateTaskDTO) {
    return this.projectsService.updateTask(id, data);
  }
}
