import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { FieldsExceptionFilter, QueryTransformPipe } from '@querry-kit/nest';

import { AppModule } from '~/app.module';
import { ENV } from '~/config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: { origin: true } });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(new QueryTransformPipe(), new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new FieldsExceptionFilter());

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Workboard API')
      .setDescription('Prisma-backed Query Kit reference API for workspaces, projects, tasks, members and labels.')
      .setVersion('1.0.0')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);
  await app.listen(ENV.port);
}

void bootstrap();
