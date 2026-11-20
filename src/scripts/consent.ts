/**
 * Shows the footer "Privacy settings" button once Google's consent platform (Privacy &
 * messaging, delivered with the AdSense tag) is ready, and lets visitors reopen it.
 */
export function initPrivacySettings(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-privacy-settings]');
  if (!button) return;
  const googlefc = (window.googlefc ??= {});
  (googlefc.callbackQueue ??= []).push({
    CONSENT_API_READY: () => {
      button.hidden = false;
    },
  });
  button.addEventListener('click', () => window.googlefc?.showRevocationMessage?.());
}
