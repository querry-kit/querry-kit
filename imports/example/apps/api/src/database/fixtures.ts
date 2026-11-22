import type { Prisma } from '../generated/prisma/client.js';

/** Seed input ordered by dependency rather than by screen or controller. */
export interface WorkboardFixtures {
  accounts: Prisma.AccountCreateManyInput[];
  profiles: Prisma.ProfileCreateManyInput[];
  projects: Prisma.ProjectCreateManyInput[];
  items: Prisma.TaskCreateManyInput[];
  labels: Prisma.LabelCreateManyInput[];
  itemLabels: Prisma.TaskLabelCreateManyInput[];
}

const SAMPLE_DATE = new Date('2026-11-01T09:00:00.000Z');

/** Declares one fixture row with shared dates and deterministic internal values. */
function item(
  id: string,
  ownerId: string,
  projectId: string,
  title: string,
  status: Prisma.TaskCreateManyInput['status'],
  priority: Prisma.TaskCreateManyInput['priority'],
  estimatedHours: number,
  assigneeId: string | null = ownerId,
): Prisma.TaskCreateManyInput {
  return {
    id,
    ownerId,
    projectId,
    assigneeId,
    title,
    status,
    priority,
    estimatedHours,
    internalNote: `Demo planning note for ${id}.`,
    internalCostCents: id === 'a6' ? 98_765 : estimatedHours * 4_000,
    createdAt: SAMPLE_DATE,
  };
}

/** Stable synthetic rows used for exact counts and read-policy checks. */
export const compactFixtures: WorkboardFixtures = {
  accounts: [
    { id: 'u1', login: 'user1', role: 'user' },
    { id: 'u2', login: 'user2', role: 'user' },
    { id: 'admin', login: 'admin', role: 'admin' },
  ],
  profiles: [
    { accountId: 'u1', displayName: 'Avery Lane' },
    { accountId: 'u2', displayName: 'Blair Chen' },
    { accountId: 'admin', displayName: 'Robin Patel' },
  ],
  projects: [
    { id: 'shared', slug: 'workboard', title: 'Workboard' },
    { id: 'design', slug: 'design', title: 'Design' },
    { id: 'docs', slug: 'documentation', title: 'Documentation' },
    { id: 'ops', slug: 'operations', title: 'Operations' },
  ],
  items: [
    item('u1-1', 'u1', 'shared', 'Review navigation labels', 'OPEN', 'HIGH', 2, null),
    item('u1-2', 'u1', 'design', 'Sketch an empty state', 'OPEN', 'NORMAL', 6),
    item('u1-3', 'u1', 'shared', 'Clarify board filters', 'IN_PROGRESS', 'NORMAL', 4),
    item('u1-4', 'u1', 'design', 'Check colour contrast', 'IN_PROGRESS', 'HIGH', 4),
    item('u1-5', 'u1', 'shared', 'Measure card spacing', 'DONE', 'LOW', 1),
    item('u1-6', 'u1', 'design', 'Review detail layout', 'DONE', 'LOW', 2),
    item('u2-1', 'u2', 'shared', 'Review navigation labels', 'OPEN', 'NORMAL', 3),
    item('u2-2', 'u2', 'docs', 'Draft filter reference', 'OPEN', 'HIGH', 9, null),
    item('u2-3', 'u2', 'shared', 'Review keyboard examples', 'IN_PROGRESS', 'NORMAL', 4),
    item('u2-4', 'u2', 'docs', 'Check code snippets', 'IN_PROGRESS', 'HIGH', 4),
    item('u2-5', 'u2', 'shared', 'Verify tooltips', 'DONE', 'LOW', 1),
    item('u2-6', 'u2', 'docs', 'Publish glossary draft', 'DONE', 'LOW', 2),
    item('a1', 'admin', 'shared', 'Audit default projections', 'OPEN', 'HIGH', 10),
    item('a2', 'admin', 'ops', 'Review deployment notes', 'IN_PROGRESS', 'NORMAL', 7),
    item('a3', 'admin', 'ops', 'Check startup metrics', 'IN_PROGRESS', 'HIGH', 5),
    item('a4', 'admin', 'shared', 'Record review decisions', 'DONE', 'LOW', 4),
    item('a5', 'admin', 'ops', 'Verify backup checks', 'DONE', 'NORMAL', 3),
    item('a6', 'admin', 'ops', 'Retire old demo fixtures', 'ARCHIVED', 'LOW', 1),
  ],
  labels: [
    { id: 'review', slug: 'review', displayName: 'Review' },
    { id: 'ux', slug: 'ux', displayName: 'UX' },
    { id: 'guide', slug: 'guide', displayName: 'Guide' },
    { id: 'ops', slug: 'ops', displayName: 'Operations' },
  ],
  itemLabels: [
    { taskId: 'u1-1', labelId: 'review' },
    { taskId: 'u1-1', labelId: 'ux' },
    { taskId: 'u1-4', labelId: 'ux' },
    { taskId: 'u2-1', labelId: 'review' },
    { taskId: 'u2-2', labelId: 'guide' },
    { taskId: 'u2-4', labelId: 'guide' },
    { taskId: 'a1', labelId: 'review' },
    { taskId: 'a6', labelId: 'ops' },
  ],
};

const teams = [
  'Analytics',
  'Billing',
  'Customer Success',
  'Design Systems',
  'Engineering',
  'Marketing',
  'Platform',
  'Support',
];
const initiatives = ['Accessibility', 'Automation', 'Insights', 'Onboarding', 'Reliability', 'Self-Service'];
const activities = [
  'Review requirements',
  'Draft implementation notes',
  'Map dependencies',
  'Verify edge cases',
  'Update examples',
  'Resolve review feedback',
  'Check keyboard navigation',
  'Estimate delivery effort',
  'Document rollout steps',
  'Run the acceptance checks',
  'Review empty states',
  'Collect stakeholder feedback',
  'Triage open issues',
  'Improve status messaging',
  'Validate reporting fields',
  'Identify migration risks',
  'Prepare the handover',
  'Test with sample data',
  'Review support requests',
  'Verify recovery steps',
  'Draft release notes',
  'Check mobile layouts',
];
const statuses = ['OPEN', 'IN_PROGRESS', 'DONE', 'ARCHIVED'] as const;
const priorities = ['LOW', 'NORMAL', 'HIGH'] as const;

const projects = teams
  .flatMap(
    /** Builds distinct, readable project names from teams and initiatives. */
    (team) => initiatives.map(/** Names one team initiative. */ (initiative) => `${team} ${initiative}`),
  )
  .slice(0, 50 - compactFixtures.projects.length)
  .map(
    /** Assigns a stable ID and a readable slug to each generated project. */
    (title, index) => ({
      id: `demo-project-${String(index + 1).padStart(2, '0')}`,
      slug: title.toLowerCase().replaceAll(' ', '-'),
      title,
    }),
  );

const items = Array.from(
  { length: 1_000 - compactFixtures.items.length },
  /** Distributes tasks among projects, accounts, statuses, priorities and creation dates. */
  (_, index) => {
    const project = projects[index % projects.length];
    const activity = Math.floor(index / projects.length);
    const owner = compactFixtures.accounts[index % compactFixtures.accounts.length];
    const id = `demo-task-${String(index + 1).padStart(4, '0')}`;
    return {
      ...item(
        id,
        owner.id,
        project.id,
        `${activities[activity]} · ${project.title}`,
        statuses[(index + activity) % statuses.length],
        priorities[(index + activity) % priorities.length],
        1 + (index % 24),
        index % 7 ? owner.id : null,
      ),
      createdAt: new Date(SAMPLE_DATE.getTime() + index * 3_600_000),
    };
  },
);

/** Full synthetic dataset for fresh Workboard databases. */
export const demoFixtures: WorkboardFixtures = {
  ...compactFixtures,
  projects: [...compactFixtures.projects, ...projects],
  items: [...compactFixtures.items, ...items],
  itemLabels: [
    ...compactFixtures.itemLabels,
    ...items.flatMap(
      /** Adds a mix of unlabeled, single-label, and multi-label tasks. */
      ({ id: taskId }, index) =>
        compactFixtures.labels
          .slice(index % 4, (index % 4) + (index % 3))
          .map(/** Links one existing demo label. */ ({ id: labelId }) => ({ taskId, labelId })),
    ),
  ],
};
