export type ShareResult = 'gedeeld' | 'gekopieerd' | 'geannuleerd' | 'mislukt';

/** Systeemdeelmenu waar het kan, anders kopiëren naar het klembord. */
export async function shareText(text: string, url?: string): Promise<ShareResult> {
  const full = url ? `${text}\n${url}` : text;
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share(url ? { text, url } : { text });
      return 'gedeeld';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'geannuleerd';
    }
  }
  try {
    await navigator.clipboard.writeText(full);
    return 'gekopieerd';
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = full;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok ? 'gekopieerd' : 'mislukt';
    } catch {
      return 'mislukt';
    }
  }
}

export function puzzleUrl(puzzleId: string): string {
  const u = new URL(location.href);
  u.searchParams.delete('testdag');
  u.searchParams.delete('simuleer');
  u.hash = `#/puzzel/${encodeURIComponent(puzzleId)}`;
  return u.toString();
}

export const shareToast: Record<ShareResult, string | null> = {
  gedeeld: null,
  gekopieerd: 'Gekopieerd. Plak het in je chat.',
  geannuleerd: null,
  mislukt: 'Delen lukte niet in deze browser.',
};
