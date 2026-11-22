/** Builds the shared project title search for filter and editor lookups. */
export function projectSearchQuery(term: string) {
  const title = term.trim().slice(0, 160);
  return title ? { where: { title: { contains: title, mode: 'insensitive' } }, perPage: 10 } : { perPage: 10 };
}
