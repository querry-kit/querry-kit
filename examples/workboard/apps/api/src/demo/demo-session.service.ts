import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { demoLoginSchema, demoSessionSchema, type DemoSession } from '@workboard/contracts';

import { createWorkboardAbility, workboardCapabilities } from '../auth/workboard-ability.js';
import { DatabaseService } from '../database/database.service.js';

/** Demo sessions are intentionally short lived. */
export const demoSessionMaxAgeSeconds = 60 * 30;
/** Cookie namespace for local Workboard demo sessions. */
export const demoSessionCookie = 'workboard_demo';

/** Looks up synthetic accounts and derives their public session from the same server policy. */
@Injectable()
export class DemoSessionService {
  /** Receives the initialized database client. */
  constructor(private readonly database: DatabaseService) {}

  /** Loads a named demo account; missing fixtures require setup, not account creation. */
  async select(login: DemoSession['login']): Promise<DemoSession> {
    const account = await this.database.account.findUnique({ where: { login }, include: { profile: true } });
    if (!account?.profile) throw new ServiceUnavailableException('This demo account is not available in the dataset.');
    return this.toSession(account);
  }

  /** Resolves an unexpired signed cookie value to a current server-owned account. */
  async resolve(value: string): Promise<DemoSession> {
    const match = /^([A-Za-z0-9_-]{1,64})\.(\d{13})$/.exec(value);
    if (!match || Number(match[2]) <= Date.now()) throw new UnauthorizedException('Demo session has expired.');

    const account = await this.database.account.findUnique({ where: { id: match[1] }, include: { profile: true } });
    if (!account?.profile || !demoLoginSchema.safeParse(account.login).success) {
      throw new UnauthorizedException('Demo session is not available.');
    }

    return this.toSession(account);
  }

  /** Validates the public account shape and supplies its policy hints. */
  private toSession(account: {
    id: string;
    login: string;
    role: DemoSession['role'];
    profile: { displayName: string } | null;
  }): DemoSession {
    return demoSessionSchema.parse({
      id: account.id,
      login: account.login,
      role: account.role,
      displayName: account.profile?.displayName,
      ...workboardCapabilities(createWorkboardAbility(account)),
    });
  }
}
