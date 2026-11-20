import { track } from './analytics';

const LOAD_MARGIN = '200px';
const VIEWABLE_MS = 1000;

function loadAdSense(client: string, nonPersonalized: boolean): void {
  const queue = (window.adsbygoogle ??= [] as unknown as NonNullable<Window['adsbygoogle']>);
  if (nonPersonalized) queue.requestNonPersonalizedAds = 1;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.append(script);
}

function activate(ins: HTMLElement): void {
  // AdSense fills any unprocessed .adsbygoogle element on push, so the class is only
  // added once this particular slot is near the viewport.
  ins.classList.add('adsbygoogle');
  (window.adsbygoogle ??= [] as unknown as NonNullable<Window['adsbygoogle']>).push({});
}

function watchRendered(ins: HTMLElement, placement: string): void {
  const report = () => {
    if (ins.dataset.adStatus !== 'filled') return false;
    track('ad_slot_rendered', { placement });
    watchViewable(ins, placement);
    return true;
  };
  if (report()) return;
  const observer = new MutationObserver(() => {
    if (report() || ins.dataset.adStatus === 'unfilled') observer.disconnect();
  });
  observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
}

/** Approximates the IAB standard: at least 50% visible for one continuous second. */
function watchViewable(ins: HTMLElement, placement: string): void {
  let timer: number | undefined;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        timer = window.setTimeout(() => {
          track('ad_slot_viewable', { placement });
          observer.disconnect();
        }, VIEWABLE_MS);
      } else {
        window.clearTimeout(timer);
      }
    },
    { threshold: 0.5 },
  );
  observer.observe(ins);
}

export function initAds(): void {
  const units = [...document.querySelectorAll<HTMLElement>('.ad-slot ins.ad-unit')];
  if (!units.length) return;

  const client = units[0].dataset.adClient!;
  const nonPersonalized = document.documentElement.dataset.adsNpa === 'true';
  let loaded = false;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const ins = entry.target as HTMLElement;
        observer.unobserve(ins);
        if (!loaded) {
          loadAdSense(client, nonPersonalized);
          loaded = true;
        }
        activate(ins);
        watchRendered(ins, ins.closest<HTMLElement>('.ad-slot')!.dataset.adPlacement!);
      }
    },
    { rootMargin: LOAD_MARGIN },
  );
  // Hidden slots (e.g. the sidebar on small screens) never intersect, so they never load.
  for (const ins of units) observer.observe(ins);
}
