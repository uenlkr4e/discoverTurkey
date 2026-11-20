/** Sends a GA4 event. gtag is always defined (consent bootstrap); without GA4 it only queues. */
export function track(name: string, params: Record<string, string | number> = {}): void {
  window.gtag?.('event', name, params);
}

export function initAnalytics(): void {
  document.addEventListener('site:search', (event) => {
    const { term, count } = (event as CustomEvent<{ term: string; count: number }>).detail;
    track('search', { search_term: term, result_count: count });
  });

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    // Share links report their own event.
    if (!(link instanceof HTMLAnchorElement) || link.closest('[data-share]')) return;
    const url = new URL(link.href, location.href);
    if (url.protocol.startsWith('http') && url.host !== location.host) {
      track('outbound_click', { link_domain: url.hostname });
    }
  });
}
