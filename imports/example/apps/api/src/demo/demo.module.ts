import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.js';
import { DemoSessionController } from './demo-session.controller.js';
import { DemoSessionGuard } from './demo-session.guard.js';
import { DemoSessionService } from './demo-session.service.js';

/** Exposes the demo guard without coupling read modules to persona-selection routing. */
@Module({
  imports: [DatabaseModule],
  controllers: [DemoSessionController],
  providers: [DemoSessionService, DemoSessionGuard],
  exports: [DemoSessionGuard, DemoSessionService],
})
export class DemoModule {}
