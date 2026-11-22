import 'reflect-metadata';
import 'dotenv/config';

import { randomBytes } from 'node:crypto';

import fastifyCookie from '@fastify/cookie';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { DatabaseModule } from './database/database.module.js';
import { DemoModule } from './demo/demo.module.js';
import { HealthController } from './health/health.controller.js';
import { WorkboardResourcesModule } from './tasks/workboard-resources.module.js';

/** API composition root. Domain and infrastructure modules are registered here. */
@Module({ imports: [DatabaseModule, DemoModule, WorkboardResourcesModule], controllers: [HealthController] })
class AppModule {}

/**
 * Starts the HTTP application with Fastify instead of Nest's default Express adapter.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/guide/main-bootstrap/
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  // A fresh secret keeps the local demo self-contained; a restart invalidates its sessions by default.
  const secret = process.env.DEMO_SESSION_SECRET ?? randomBytes(32).toString('base64url');
  if (secret.length < 32) throw new Error('DEMO_SESSION_SECRET must be at least 32 characters.');
  await app.getHttpAdapter().getInstance().register(fastifyCookie, { secret });
  app.setGlobalPrefix('api');

  // Interface definitions use the same Zod schemas as the runtime validation.
  // https://querry-kit.github.io/querry-kit/docs/nest/api/openapi/
  const doc = new DocumentBuilder()
    .setTitle('Querry Kit Workboard')
    .setVersion('1')
    .addCookieAuth('workboard_demo')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc), { jsonDocumentUrl: 'docs/openapi.json' });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? '3101'), process.env.HOST ?? '127.0.0.1');
}

await bootstrap();
