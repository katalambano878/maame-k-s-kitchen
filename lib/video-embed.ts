export function embedVideoUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  if (trimmed.includes('youtube.com/embed/') || trimmed.includes('player.vimeo.com/')) {
    return trimmed;
  }
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const id = new URL(trimmed).searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    } catch {
      return null;
    }
  }
  if (trimmed.includes('youtube.com/shorts/')) {
    const id = trimmed.split('youtube.com/shorts/')[1]?.split(/[?&/]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (trimmed.includes('vimeo.com/')) {
    const id = trimmed.split('vimeo.com/')[1]?.split(/[?&/]/)[0];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(trimmed)) return trimmed;
  if (trimmed.includes('/storage/v1/object/')) return trimmed;
  return trimmed.startsWith('http') ? trimmed : null;
}

export function isEmbeddableStream(url: string): boolean {
  const embed = embedVideoUrl(url);
  return !!embed && (embed.includes('youtube') || embed.includes('vimeo'));
}
