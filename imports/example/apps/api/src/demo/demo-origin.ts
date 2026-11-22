import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

/** The configured browser origin for this demo, independent of forwarded headers. */
export const demoOrigin = process.env.DEMO_ORIGIN ?? 'http://127.0.0.1:3201';
const loopback = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.exec(demoOrigin);
const localAlias = loopback
  ? `http://${loopback[1] === 'localhost' ? '127.0.0.1' : 'localhost'}${loopback[2] ?? ''}`
  : undefined;

/** Verifies the origin of a cookie-authenticated state change. */
export function requireDemoOrigin(request: FastifyRequest, message: string): void {
  const origin = request.headers.origin;
  if (!origin || (origin !== demoOrigin && origin !== localAlias)) throw new ForbiddenException(message);
}

/** Applies the demo's origin policy to resource writes. */
@Injectable()
export class DemoWriteOriginGuard implements CanActivate {
  /** Rejects requests from origins other than the configured Workboard browser origin. */
  canActivate(context: ExecutionContext): boolean {
    requireDemoOrigin(context.switchToHttp().getRequest<FastifyRequest>(), 'Writes require the configured origin.');
    return true;
  }
}
