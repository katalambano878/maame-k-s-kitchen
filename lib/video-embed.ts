export function embedVideoUrl(url: string): string | null {
  if (url.includes('youtube.com/watch')) {
    try {
      const id = new URL(url).searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    } catch {
      return null;
    }
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return url;
  return null;
}

export function isEmbeddableStream(url: string): boolean {
  const embed = embedVideoUrl(url);
  return !!embed && (embed.includes('youtube') || embed.includes('vimeo'));
}
