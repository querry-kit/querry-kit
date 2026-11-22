import { Module } from '@nestjs/common';

import { ProjectsModule } from '~/modules/projects/projects.module';
import { PrismaModule } from '~/prisma/prisma.module';

@Module({ imports: [PrismaModule, ProjectsModule] })
export class AppModule {}
