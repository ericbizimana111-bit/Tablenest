import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RichText } from './RichText';

const show = (text: string) => render(<RichText text={text} />, { wrapper: MemoryRouter });

describe('RichText (concierge replies)', () => {
  it('renders bold text, bullets and internal links', () => {
    show('Try **Chez Lando**:\n- [See the menu](/restaurants/abc)\n- Open until 22:00');
    expect(screen.getByText('Chez Lando').tagName).toBe('STRONG');
    const link = screen.getByRole('link', { name: 'See the menu' });
    expect(link.getAttribute('href')).toBe('/restaurants/abc');
    expect(screen.getByText('Open until 22:00')).toBeInTheDocument();
  });

  it('never turns external or protocol-relative URLs into links', () => {
    show('[a](https://005cevil.example) [b](//evil.example) [c](/\u005cevil.example) [d](javascript:alert(1))');
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText(/a b c d/)).toBeInTheDocument();
  });

  it('shows HTML as text instead of injecting it', () => {
    const { container } = show('<img src=x onerror="alert(1)"> hi');
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img src=x');
  });
});
