export type PackageId = 'nest' | 'nuxt' | 'nuxt-ui';

type NavigationItem = { text: string; path: string; icon?: string; items?: NavigationItem[] };
type NavigationGroup = { text: string; icon: string; items: NavigationItem[] };

export type DocumentationPackage = {
  id: PackageId;
  label: string;
  packageName: string;
  description: string;
  repository: string;
  groups: NavigationGroup[];
};

const page = (packageId: PackageId, path = ''): string => `/docs/${packageId}${path}`;

const flattenNavigationItems = (items: NavigationItem[]): NavigationItem[] =>
  items.flatMap((item) => [item, ...(item.items ? flattenNavigationItems(item.items) : [])]);

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
        icon: 'i-lucide-book-open',
        items: [
          { text: 'Getting Started', path: page('nest', '/guide/getting-started'), icon: 'i-lucide-rocket' },
          { text: 'Example App', path: page('nest', '/guide/example-app'), icon: 'i-lucide-panels-top-left' },
          { text: 'NestJS main.ts', path: page('nest', '/guide/main-bootstrap'), icon: 'i-lucide-terminal' },
          { text: 'CRUD Controller', path: page('nest', '/guide/crud-controller'), icon: 'i-lucide-database' },
        ],
      },
      {
        text: 'Concepts',
        icon: 'i-lucide-lightbulb',
        items: [
          { text: 'Fields Projection', path: page('nest', '/concepts/fields'), icon: 'i-lucide-scan-line' },
          { text: 'Query Transformation', path: page('nest', '/concepts/query-transform'), icon: 'i-lucide-git-compare-arrows' },
        ],
      },
      {
        text: 'API Reference',
        icon: 'i-lucide-braces',
        items: [
          { text: 'Overview', path: page('nest', '/api'), icon: 'i-lucide-layout-dashboard' },
          { text: 'Fields', path: page('nest', '/api/fields'), icon: 'i-lucide-list-filter' },
          { text: 'DTO Schema', path: page('nest', '/api/fields/dto-schema'), icon: 'i-lucide-file-json-2' },
          { text: 'Query Service', path: page('nest', '/api/query-service'), icon: 'i-lucide-database-zap' },
          { text: 'DTOs and Pagination', path: page('nest', '/api/dtos-pagination'), icon: 'i-lucide-list-restart' },
          { text: 'CASL', path: page('nest', '/api/casl'), icon: 'i-lucide-shield-check' },
          { text: 'OpenAPI Decorators', path: page('nest', '/api/openapi'), icon: 'i-lucide-file-code-2' },
          { text: 'Decorators', path: page('nest', '/api/decorators'), icon: 'i-lucide-at-sign' },
          { text: 'Pipes', path: page('nest', '/api/pipes'), icon: 'i-lucide-workflow' },
          { text: 'Object Utilities', path: page('nest', '/api/object-utils'), icon: 'i-lucide-wrench' },
        ],
      },
      { text: 'Releases', icon: 'i-lucide-history', items: [{ text: 'Changelog', path: page('nest', '/changelog'), icon: 'i-lucide-history' }] },
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
        icon: 'i-lucide-book-open',
        items: [
          { text: 'Getting Started', path: page('nuxt', '/guide/getting-started'), icon: 'i-lucide-rocket' },
          { text: 'Controller Contract', path: page('nuxt', '/guide/controller-contract'), icon: 'i-lucide-file-check-2' },
          { text: 'Remote Tables', path: page('nuxt', '/guide/table'), icon: 'i-lucide-table-2' },
          { text: 'Autocomplete', path: page('nuxt', '/guide/autocomplete'), icon: 'i-lucide-search' },
          { text: 'Example App', path: page('nuxt', '/guide/example-app'), icon: 'i-lucide-panels-top-left' },
        ],
      },
      { text: 'Concepts', icon: 'i-lucide-lightbulb', items: [{ text: 'Query Conventions', path: page('nuxt', '/guide/query-conventions'), icon: 'i-lucide-list-tree' }] },
      {
        text: 'API Reference',
        icon: 'i-lucide-braces',
        items: [
          { text: 'Overview', path: page('nuxt', '/api'), icon: 'i-lucide-layout-dashboard' },
          {
            text: 'API',
            path: page('nuxt', '/api/api'),
            icon: 'i-lucide-plug',
            items: [
              { text: 'ApiVersion', path: page('nuxt', '/api/api/api-version'), icon: 'i-lucide-git-branch' },
              { text: 'CreateApiClientOptions', path: page('nuxt', '/api/api/create-api-client-options'), icon: 'i-lucide-settings-2' },
              { text: 'createApiClient', path: page('nuxt', '/api/api/create-api-client'), icon: 'i-lucide-circle-plus' },
              { text: 'useModuleApi', path: page('nuxt', '/api/api/use-module-api'), icon: 'i-lucide-box' },
              { text: 'Backend Compatibility', path: page('nuxt', '/api/query-kit'), icon: 'i-lucide-link' },
            ],
          },
          {
            text: 'Autocomplete',
            path: page('nuxt', '/api/autocomplete'),
            icon: 'i-lucide-search',
            items: [
              { text: 'UseAutocompleteOptions', path: page('nuxt', '/api/autocomplete/use-autocomplete-options'), icon: 'i-lucide-settings-2' },
              { text: 'useAutocomplete', path: page('nuxt', '/api/autocomplete/use-autocomplete'), icon: 'i-lucide-search-check' },
            ],
          },
          {
            text: 'Table',
            path: page('nuxt', '/api/table'),
            icon: 'i-lucide-table-2',
            items: [
              { text: 'UseTableOptions', path: page('nuxt', '/api/table/use-table-options'), icon: 'i-lucide-settings-2' },
              { text: 'useTable', path: page('nuxt', '/api/table/use-table'), icon: 'i-lucide-table-properties' },
            ],
          },
          {
            text: 'Types',
            path: page('nuxt', '/api/types'),
            icon: 'i-lucide-brackets',
            items: [
              { text: 'EndpointDefinition', path: page('nuxt', '/api/types/endpoint-definition'), icon: 'i-lucide-route' },
              { text: 'EndpointMap', path: page('nuxt', '/api/types/endpoint-map'), icon: 'i-lucide-map' },
              { text: 'PaginatedResponse', path: page('nuxt', '/api/types/paginated-response'), icon: 'i-lucide-list-restart' },
              { text: 'PaginationMeta', path: page('nuxt', '/api/types/pagination-meta'), icon: 'i-lucide-list-ordered' },
              { text: 'QueryParameters', path: page('nuxt', '/api/types/query-parameters'), icon: 'i-lucide-list-filter' },
              { text: 'FilteringField', path: page('nuxt', '/api/types/filtering-field'), icon: 'i-lucide-filter' },
              { text: 'FilteringState', path: page('nuxt', '/api/types/filtering-state'), icon: 'i-lucide-sliders-horizontal' },
              { text: 'RoutePageRef', path: page('nuxt', '/api/types/route-page-ref'), icon: 'i-lucide-waypoints' },
              { text: 'SortingRule', path: page('nuxt', '/api/types/sorting-rule'), icon: 'i-lucide-arrow-down-up' },
              { text: 'StorageLike', path: page('nuxt', '/api/types/storage-like'), icon: 'i-lucide-hard-drive' },
              { text: 'TableColumnInput', path: page('nuxt', '/api/types/table-column-input'), icon: 'i-lucide-columns-3' },
              { text: 'TableColumn', path: page('nuxt', '/api/types/table-column'), icon: 'i-lucide-columns-2' },
            ],
          },
          {
            text: 'Utils',
            path: page('nuxt', '/api/utils'),
            icon: 'i-lucide-wrench',
            items: [
              { text: 'andWhere', path: page('nuxt', '/api/utils/and-where'), icon: 'i-lucide-circle-plus' },
              { text: 'filteringToWhere', path: page('nuxt', '/api/utils/filtering-to-where'), icon: 'i-lucide-filter' },
              { text: 'isEqual', path: page('nuxt', '/api/utils/is-equal'), icon: 'i-lucide-equal' },
              { text: 'mergeQuery', path: page('nuxt', '/api/utils/merge-query'), icon: 'i-lucide-git-merge' },
              { text: 'parseJson', path: page('nuxt', '/api/utils/parse-json'), icon: 'i-lucide-file-json-2' },
              { text: 'pathsToFieldsQuery', path: page('nuxt', '/api/utils/paths-to-fields-query'), icon: 'i-lucide-list-tree' },
              { text: 'serializeQuery', path: page('nuxt', '/api/utils/serialize-query'), icon: 'i-lucide-braces' },
              { text: 'sortingToOrderBy', path: page('nuxt', '/api/utils/sorting-to-order-by'), icon: 'i-lucide-arrow-down-up' },
              { text: 'unflatten', path: page('nuxt', '/api/utils/unflatten'), icon: 'i-lucide-align-justify' },
            ],
          },
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
      { text: 'Guide', icon: 'i-lucide-book-open', items: [{ text: 'Getting Started', path: page('nuxt-ui', '/guide/getting-started'), icon: 'i-lucide-rocket' }] },
      {
        text: 'Table Controls',
        icon: 'i-lucide-sliders-horizontal',
        items: [
          { text: 'Table Toolbar', path: page('nuxt-ui', '/components/toolbar'), icon: 'i-lucide-panels-top-left' },
          { text: 'Sorting', path: page('nuxt-ui', '/components/sorting'), icon: 'i-lucide-arrow-down-up' },
          { text: 'Filtering', path: page('nuxt-ui', '/components/filtering'), icon: 'i-lucide-filter' },
          { text: 'Column Options', path: page('nuxt-ui', '/components/options'), icon: 'i-lucide-columns-3' },
          { text: 'Pagination', path: page('nuxt-ui', '/components/pagination'), icon: 'i-lucide-list-restart' },
        ],
      },
      { text: 'API Reference', icon: 'i-lucide-braces', items: [{ text: 'Types and Locales', path: page('nuxt-ui', '/api/types'), icon: 'i-lucide-languages' }] },
    ],
  },
];

export const documentationRoutes = documentationPackages.flatMap((packageItem) => [
  page(packageItem.id),
  ...packageItem.groups.flatMap((group) => flattenNavigationItems(group.items).map((item) => item.path)),
]);

// Kept outside the current sidebar so existing package-doc links remain valid.
documentationRoutes.push(page('nest', '/api/decorators-pipes-utils'));

export const getDocumentationPackage = (id: string): DocumentationPackage | undefined =>
  documentationPackages.find((packageItem) => packageItem.id === id);

export const getSurroundingPages = (packageItem: DocumentationPackage, currentPath: string) => {
  const normalizedCurrentPath: string = currentPath.replace(/\/+$/, '') || '/';
  const items = packageItem.groups.flatMap((group) => flattenNavigationItems(group.items));
  const index = items.findIndex((item) => item.path === normalizedCurrentPath);
  return { previous: index > 0 ? items[index - 1] : undefined, next: index >= 0 ? items[index + 1] : undefined };
};
