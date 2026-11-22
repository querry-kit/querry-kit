import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { DemoModule } from '../demo/demo.module.js';
import { LookupsController } from '../lookups/lookups.controller.js';
import { ProjectWritesController } from '../mutations/project-writes.controller.js';
import { TaskWritesController } from '../mutations/task-writes.controller.js';
import { ProjectTableController } from '../projects/project-table.controller.js';
import { TaskGroupsController } from './task-groups.controller.js';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';

/** Wires the authenticated Workboard resource routes. */
@Module({
  imports: [DatabaseModule, DemoModule],
  controllers: [
    TasksController,
    TaskGroupsController,
    LookupsController,
    ProjectWritesController,
    ProjectTableController,
    TaskWritesController,
  ],
  providers: [TasksService],
})
export class WorkboardResourcesModule {}
