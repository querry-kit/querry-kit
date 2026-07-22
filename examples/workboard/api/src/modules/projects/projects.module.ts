import { Module } from '@nestjs/common';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController],
  providers: [{ provide: ProjectsService.token, useClass: ProjectsService }],
})
export class ProjectsModule {}
