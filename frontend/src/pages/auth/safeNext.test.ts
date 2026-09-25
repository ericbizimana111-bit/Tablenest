import { describe, expect, it } from 'vitest';
import { safeNext } from './Login';

describe('safeNext (post-login redirect)', () => {
  it('allows same-site paths', () => {
    expect(safeNext('/my-orders/123/track')).toBe('/my-orders/123/track');
    expect(safeNext('/restaurants?city=Kigali')).toBe('/restaurants?city=Kigali');
  });

  it('blocks anything that leaves the site', () => {
    for (const bad of ['https://005cevil.example', '//evil.example', '/\u005cevil.example', 'javascript:alert(1)', '', null]) {
      expect(safeNext(bad)).toBeNull();
    }
  });
});
