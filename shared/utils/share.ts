// share-utils.ts (or place these at the top of your page file)
export function buildShare(url: string, title: string, text: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const d = encodeURIComponent(text);
  return {
    twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}%20-%20${d}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=${t}&summary=${d}`,
  };
}

export async function nativeShare(url: string, title: string, text: string) {
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({ url, title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function copyToClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  // Fallback
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
