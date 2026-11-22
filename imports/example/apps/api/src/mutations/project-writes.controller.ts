import { randomUUID } from 'node:crypto';

import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import {
  projectBulkDeleteSchema,
  projectCreateSchema,
  projectLookupSchema,
  projectUpdateSchema,
} from '@workboard/contracts';

import { DatabaseService } from '../database/database.service.js';
import { DemoWriteOriginGuard } from '../demo/demo-origin.js';
import { DemoSessionGuard, type AuthenticatedRequest } from '../demo/demo-session.guard.js';
import { describeWrite, parseId, parseWrite, writeError } from './write-contract.js';

/** Projects can be maintained by the demo admin. */
@ApiTags('Projects')
@ApiCookieAuth('workboard_demo')
@UseGuards(DemoSessionGuard, DemoWriteOriginGuard)
@Controller('projects')
export class ProjectWritesController {
  /** Receives the project delegate. */
  constructor(private readonly database: DatabaseService) {}

  /** Creates a project with a stable server-assigned ID. */
  @Post()
  @describeWrite(201, projectCreateSchema, projectLookupSchema)
  async create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    requireAdmin(request);
    const input = parseWrite(projectCreateSchema, body);
    try {
      return projectLookupSchema.parse(await this.database.project.create({ data: { id: randomUUID(), ...input } }));
    } catch (error) {
      writeError(error, 'Project', 'The project could not be created.');
    }
  }

  /** Updates a project's title and slug without changing its task links. */
  @Patch(':id')
  @describeWrite(200, projectUpdateSchema, projectLookupSchema)
  async update(@Req() request: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    requireAdmin(request);
    const input = parseWrite(projectUpdateSchema, body);
    try {
      return projectLookupSchema.parse(await this.database.project.update({ where: { id: parseId(id) }, data: input }));
    } catch (error) {
      writeError(error, 'Project', 'The project could not be updated.');
    }
  }

  /** Uses the existing database foreign key to prevent deleting projects that still have tasks. */
  @Delete(':id')
  @HttpCode(204)
  @describeWrite(204)
  async remove(@Req() request: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    requireAdmin(request);
    await this.deleteProjects([parseId(id)]);
  }

  /** Deletes the entire selection, provided each project exists and has no tasks. */
  @Post('bulk-delete')
  @HttpCode(204)
  @describeWrite(204, projectBulkDeleteSchema)
  async bulkDelete(@Req() request: AuthenticatedRequest, @Body() body: unknown): Promise<void> {
    requireAdmin(request);
    const { ids } = parseWrite(projectBulkDeleteSchema, body);
    await this.deleteProjects(ids);
  }

  /** Rolls back all deletes on missing IDs or foreign key conflicts. */
  private async deleteProjects(ids: string[]): Promise<void> {
    try {
      await this.database.$transaction(
        /** Deletes only the specified set and verifies its size before commit. */
        async (db) => {
          const { count } = await db.project.deleteMany({ where: { id: { in: ids } } });
          if (count !== ids.length) throw new NotFoundException('Project not found.');
        },
      );
    } catch (error) {
      writeError(
        error,
        'Project',
        ids.length === 1
          ? 'Move or delete this project’s tasks before deleting the project.'
          : 'Move or delete the tasks in each selected project before deleting it.',
      );
    }
  }
}

/** Rejects regular users before inspecting the requested project. */
function requireAdmin(request: AuthenticatedRequest): void {
  if (request.demoSession.role !== 'admin') throw new ForbiddenException('Only the admin can manage projects.');
}
