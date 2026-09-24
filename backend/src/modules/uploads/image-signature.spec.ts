import { detectImage } from './image-signature';
import { SAFE_KEY } from './storage/storage.driver';

const pad = (b: Buffer) => Buffer.concat([b, Buffer.alloc(32)]);

describe('detectImage', () => {
  it('recognises real image headers', () => {
    expect(detectImage(pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0])))).toEqual({ mimetype: 'image/jpeg', ext: 'jpg' });
    expect(detectImage(pad(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))).toEqual({ mimetype: 'image/png', ext: 'png' });
    expect(detectImage(pad(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')])))).toEqual({ mimetype: 'image/webp', ext: 'webp' });
    expect(detectImage(pad(Buffer.from('GIF89a')))).toEqual({ mimetype: 'image/gif', ext: 'gif' });
  });

  it('rejects everything else', () => {
    expect(detectImage(pad(Buffer.from('MZ')))).toBeNull(); // Windows executable
    expect(detectImage(pad(Buffer.from('<svg onload=alert(1)>')))).toBeNull(); // SVG can carry script
    expect(detectImage(pad(Buffer.from('%PDF-1.7')))).toBeNull();
    expect(detectImage(pad(Buffer.from('RIFF\0\0\0\0WAVE')))).toBeNull();
    expect(detectImage(Buffer.from([0xff, 0xd8]))).toBeNull(); // truncated
    expect(detectImage(Buffer.alloc(0))).toBeNull();
  });
});

describe('SAFE_KEY', () => {
  it('only matches server-generated names', () => {
    expect(SAFE_KEY.test('3f2a1b4c-1111-4222-8333-944455556666.png')).toBe(true);
    expect(SAFE_KEY.test('1788103598104-777502524.jpg')).toBe(true); // legacy format
    for (const bad of ['../etc/passwd', 'x.html', 'a/b.png', '3f2a1b4c-1111-4222-8333-944455556666.png.html', '.env', 'index.png']) {
      expect(SAFE_KEY.test(bad)).toBe(false);
    }
  });
});
