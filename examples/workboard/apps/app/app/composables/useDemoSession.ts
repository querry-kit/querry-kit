import { demoLoginInputSchema, demoSessionSchema, type DemoSession } from '@workboard/contracts';

/** Owns the browser's current public identity; the HttpOnly cookie stays outside Vue state. */
export function useDemoSession() {
  const { $workboardApi, $invalidateWorkboardReads } = useNuxtApp();
  const router = useRouter();
  const session = useState<DemoSession | null>('workboard:demo-session', /** Starts without a persona. */ () => null);
  const checked = useState('workboard:session-checked', /** Tracks the initial cookie check. */ () => false);
  const switching = useState('workboard:session-switching', /** Prevents concurrent login requests. */ () => false);
  const error = useState<string | null>('workboard:session-error', /** Starts without a session error. */ () => null);
  const activeSession = computed(
    /** Hides account-bound components immediately, not after the cookie request returns. */
    () => (switching.value ? null : session.value),
  );

  /** Restores the cookie or starts the default demo session when it is missing or expired. */
  async function restore(): Promise<void> {
    if (switching.value || (checked.value && !error.value)) return;
    switching.value = true;
    checked.value = false;
    error.value = null;
    try {
      const response = await $workboardApi.get('/demo/session').catch(
        /** Starts as admin only after the API rejects the current cookie. */
        (cause: unknown) => {
          if (typeof cause === 'object' && cause && 'statusCode' in cause && cause.statusCode === 401) {
            return $workboardApi.post('/demo/session', { login: 'admin' });
          }
          throw cause;
        },
      );
      session.value = demoSessionSchema.parse(response.data);
    } catch {
      error.value = 'Could not start the demo session.';
    } finally {
      checked.value = true;
      switching.value = false;
    }
  }

  /** Selects a validated demo account and replaces the server-managed cookie. */
  async function select(login: DemoSession['login']): Promise<void> {
    if (switching.value || session.value?.login === login) return;
    switching.value = true;
    error.value = null;
    $invalidateWorkboardReads();
    try {
      const input = demoLoginInputSchema.parse({ login });
      // Selections and detail routes belonged to the previous account, even when the role is unchanged.
      if (session.value) await router.replace({ path: '/tasks', query: {} });
      const response = await $workboardApi.post('/demo/session', input);
      session.value = demoSessionSchema.parse(response.data);
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Could not select the demo account.';
      // A response can be lost after the cookie changed. Do not reuse a previously cached principal.
      session.value = null;
    } finally {
      switching.value = false;
    }
  }

  return { session, activeSession, checked, switching, error, restore, select };
}
