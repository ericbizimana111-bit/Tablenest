export type DetectedImage = { mimetype: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'; ext: string };

/**
 * Identifies an image from its leading bytes. The client-supplied MIME type and file name are
 * ignored entirely — a renamed executable or HTML file will not match any signature.
 */
export function detectImage(buf: Buffer): DetectedImage | null {
  if (!buf || buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mimetype: 'image/jpeg', ext: 'jpg' };
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mimetype: 'image/png', ext: 'png' };
  }
  // WebP: "RIFF" <size> "WEBP"
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { mimetype: 'image/webp', ext: 'webp' };
  }
  // GIF: "GIF87a" / "GIF89a"
  const gif = buf.toString('ascii', 0, 6);
  if (gif === 'GIF87a' || gif === 'GIF89a') return { mimetype: 'image/gif', ext: 'gif' };
  return null;
}
