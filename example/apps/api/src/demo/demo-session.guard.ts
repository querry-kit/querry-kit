import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { DemoSession } from '@workboard/contracts';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { demoSessionCookie, DemoSessionService } from './demo-session.service.js';

/** Request state assigned only after authentication on a guarded route. */
export type AuthenticatedRequest = FastifyRequest & { demoSession: DemoSession };

/** Verifies a signed cookie and obtains the current principal without trusting client role data. */
@Injectable()
export class DemoSessionGuard implements CanActivate {
  /** Receives the service that resolves the signed value against the database. */
  constructor(private readonly sessions: DemoSessionService) {}

  /** Adds the authenticated session to this request, otherwise returns a documented 401. */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    http.getResponse<FastifyReply>().header('Cache-Control', 'no-store');

    const token = request.cookies[demoSessionCookie];
    const unsigned = token ? request.unsignCookie(token) : undefined;
    if (!unsigned?.valid || !unsigned.value) throw new UnauthorizedException('Select a demo account first.');

    request.demoSession = await this.sessions.resolve(unsigned.value);
    return true;
  }
}
