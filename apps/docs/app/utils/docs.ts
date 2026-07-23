export type PackageId = 'nest' | 'nuxt' | 'nuxt-ui';

type NavigationItem = { text: string; path: string };
type NavigationGroup = { text: string; items: NavigationItem[] };

export type DocumentationPackage = {
  id: PackageId;
  label: string;
  packageName: string;
  description: string;
  repository: string;
  groups: NavigationGroup[];
};

const page = (packageId: PackageId, path = ''): string => `/docs/${packageId}${path}`;

export const documentationPackages: DocumentationPackage[] = [
  {
    id: 'nest',
    label: 'Nest',
    packageName: '@querry-kit/nest',
    description: 'Resource queries, fields projection, pagination and API helpers for NestJS.',
    repository: 'https://github.com/querry-kit/nest',
    groups: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', path: page('nest', '/guide/getting-started') },
          { text: 'Example App', path: page('nest', '/guide/example-app') },
          { text: 'NestJS main.ts', path: page('nest', '/guide/main-bootstrap') },
          { text: 'CRUD Controller', path: page('nest', '/guide/crud-controller') },
        ],
      },
      {
        text: 'Concepts',
        items: [
          { text: 'Fields Projection', path: page('nest', '/concepts/fields') },
          { text: 'Query Transformation', path: page('nest', '/concepts/query-transform') },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', path: page('nest', '/api') },
          { text: 'Fields', path: page('nest', '/api/fields') },
          { text: 'DTO Schema', path: page('nest', '/api/fields/dto-schema') },
          { text: 'Query Service', path: page('nest', '/api/query-service') },
          { text: 'DTOs and Pagination', path: page('nest', '/api/dtos-pagination') },
          { text: 'CASL', path: page('nest', '/api/casl') },
          { text: 'OpenAPI Decorators', path: page('nest', '/api/openapi') },
          { text: 'Decorators', path: page('nest', '/api/decorators') },
          { text: 'Pipes', path: page('nest', '/api/pipes') },
          { text: 'Object Utilities', path: page('nest', '/api/object-utils') },
        ],
      },
      { text: 'Releases', items: [{ text: 'Changelog', path: page('nest', '/changelog') }] },
    ],
  },
  {
    id: 'nuxt',
    label: 'Nuxt',
    packageName: '@querry-kit/nuxt',
    description: 'Typed API clients, remote table state and autocomplete composables.',
    repository: 'https://github.com/querry-kit/nuxt',
    groups: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', path: page('nuxt', '/guide/getting-started') },
          { text: 'Controller Contract', path: page('nuxt', '/guide/controller-contract') },
          { text: 'Remote Tables', path: page('nuxt', '/guide/table') },
          { text: 'Autocomplete', path: page('nuxt', '/guide/autocomplete') },
          { text: 'Example App', path: page('nuxt', '/guide/example-app') },
        ],
      },
      { text: 'Concepts', items: [{ text: 'Query Conventions', path: page('nuxt', '/guide/query-conventions') }] },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', path: page('nuxt', '/api') },
          { text: 'Client and Endpoints', path: page('nuxt', '/api/client') },
          { text: 'useTable', path: page('nuxt', '/api/table') },
          { text: 'useAutocomplete', path: page('nuxt', '/api/autocomplete') },
          { text: 'Backend Compatibility', path: page('nuxt', '/api/query-kit') },
        ],
      },
    ],
  },
  {
    id: 'nuxt-ui',
    label: 'Nuxt UI',
    packageName: '@querry-kit/nuxt-ui',
    description: 'Composable, accessible table controls for Nuxt UI applications.',
    repository: 'https://github.com/querry-kit/nuxt-ui',
    groups: [
      { text: 'Guide', items: [{ text: 'Getting Started', path: page('nuxt-ui', '/guide/getting-started') }] },
      {
        text: 'Table Controls',
        items: [
          { text: 'Table Toolbar', path: page('nuxt-ui', '/components/toolbar') },
          { text: 'Sorting', path: page('nuxt-ui', '/components/sorting') },
          { text: 'Filtering', path: page('nuxt-ui', '/components/filtering') },
          { text: 'Column Options', path: page('nuxt-ui', '/components/options') },
          { text: 'Pagination', path: page('nuxt-ui', '/components/pagination') },
        ],
      },
      { text: 'API Reference', items: [{ text: 'Types and Locales', path: page('nuxt-ui', '/api/types') }] },
    ],
  },
];

export const documentationRoutes = documentationPackages.flatMap((packageItem) => [
  page(packageItem.id),
  ...packageItem.groups.flatMap((group) => group.items.map((item) => item.path)),
]);

// Kept outside the current sidebar so existing package-doc links remain valid.
documentationRoutes.push(page('nest', '/api/decorators-pipes-utils'));

export const getDocumentationPackage = (id: string): DocumentationPackage | undefined =>
  documentationPackages.find((packageItem) => packageItem.id === id);

export const getSurroundingPages = (packageItem: DocumentationPackage, currentPath: string) => {
  const normalizedCurrentPath: string = currentPath.replace(/\/+$/, '') || '/';
  const items = packageItem.groups.flatMap((group) => group.items);
  const index = items.findIndex((item) => item.path === normalizedCurrentPath);
  return { previous: index > 0 ? items[index - 1] : undefined, next: index >= 0 ? items[index + 1] : undefined };
};
