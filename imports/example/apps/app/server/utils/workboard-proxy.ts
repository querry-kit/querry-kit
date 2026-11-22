import { getRequestURL, proxyRequest, type H3Event } from 'h3';

/** Forwards a Workboard path to the configured internal API and preserves same-origin cookies. */
export function proxyWorkboard(event: H3Event) {
  const incoming = getRequestURL(event);
  // Build from server configuration, never the request's host or forwarded headers.
  const upstream = new URL(useRuntimeConfig(event).apiOrigin);
  upstream.pathname = incoming.pathname;
  upstream.search = incoming.search;
  return proxyRequest(event, upstream.href, { fetchOptions: { redirect: 'manual' } });
}
