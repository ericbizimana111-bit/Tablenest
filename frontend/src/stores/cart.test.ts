import { beforeEach, describe, expect, it } from 'vitest';
import { cartCount, cartSubtotal, MAX_QTY, useCart } from './cart';

const bistro = { _id: 'r1', name: 'Bistro' };
const grill = { _id: 'r2', name: 'Grill' };
const soup = { menuItemId: 'm1', name: 'Soup', price: 4.5, image: null };
const bread = { menuItemId: 'm2', name: 'Bread', price: 1.2, image: null };

describe('cart store', () => {
  beforeEach(() => useCart.getState().clear());

  it('adds items and merges quantities of the same dish', () => {
    const cart = useCart.getState();
    expect(cart.add(bistro, soup)).toBe(true);
    expect(cart.add(bistro, soup, 2)).toBe(true);
    expect(cart.add(bistro, bread)).toBe(true);
    const { lines, restaurantId } = useCart.getState();
    expect(restaurantId).toBe('r1');
    expect(lines).toHaveLength(2);
    expect(lines.find((l) => l.menuItemId === 'm1')?.quantity).toBe(3);
    expect(cartCount(lines)).toBe(4);
    expect(cartSubtotal(lines)).toBe(14.7);
  });

  it('refuses a dish from another restaurant until the guest chooses to switch', () => {
    const cart = useCart.getState();
    cart.add(bistro, soup);
    expect(cart.add(grill, bread)).toBe(false);
    expect(useCart.getState().restaurantId).toBe('r1');
    cart.replaceWith(grill, bread);
    const s = useCart.getState();
    expect(s.restaurantId).toBe('r2');
    expect(s.lines).toEqual([{ ...bread, quantity: 1 }]);
  });

  it('caps quantities and empties the cart when the last line reaches zero', () => {
    const cart = useCart.getState();
    cart.add(bistro, soup, 999);
    expect(useCart.getState().lines[0].quantity).toBe(MAX_QTY);
    cart.setQuantity('m1', 0);
    const s = useCart.getState();
    expect(s.lines).toEqual([]);
    expect(s.restaurantId).toBeNull();
  });

  it('persists to localStorage so a refresh keeps the order', () => {
    useCart.getState().add(bistro, soup);
    const saved = JSON.parse(localStorage.getItem('tn.cart') || '{}');
    expect(saved.state.lines[0].menuItemId).toBe('m1');
  });
});
