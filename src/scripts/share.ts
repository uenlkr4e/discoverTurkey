import { track } from './analytics';

export function initShare(): void {
  for (const root of document.querySelectorAll<HTMLElement>('[data-share]')) {
    const { title = document.title, url = location.href, contentType = 'page' } = root.dataset;
    const status = root.querySelector<HTMLElement>('[data-share-status]');
    const native = root.querySelector<HTMLButtonElement>('[data-share-native]');
    const copy = root.querySelector<HTMLButtonElement>('[data-share-copy]');

    if (native && 'share' in navigator) {
      native.hidden = false;
      native.addEventListener('click', async () => {
        try {
          await navigator.share({ title, url });
          track('share', { method: 'native', content_type: contentType });
        } catch {
          // Cancelled by the user.
        }
      });
    }

    copy?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(url);
        if (status) status.textContent = 'Link copied';
        track('share', { method: 'copy_link', content_type: contentType });
      } catch {
        if (status) status.textContent = 'Could not copy the link. Copy it from the address bar instead.';
      }
    });

    for (const link of root.querySelectorAll<HTMLAnchorElement>('a[data-share-method]')) {
      link.addEventListener('click', () =>
        track('share', { method: link.dataset.shareMethod!, content_type: contentType }),
      );
    }
  }
}
