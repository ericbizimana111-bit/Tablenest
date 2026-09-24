import { ORDER_FLOW } from './orders.service';
import { OrderStatus } from './order.schema';
import { RESERVATION_FLOW } from '../reservations/reservations.service';
import { ReservationStatus } from '../reservations/reservation.schema';
import { slotsFor } from '../reservations/slot-lock.service';

describe('order lifecycle', () => {
  it('follows placed → confirmed → preparing → ready → (out_for_delivery) → delivered', () => {
    expect(ORDER_FLOW.placed).toEqual([OrderStatus.CONFIRMED, OrderStatus.CANCELLED]);
    expect(ORDER_FLOW.confirmed).toContain(OrderStatus.PREPARING);
    expect(ORDER_FLOW.preparing).toContain(OrderStatus.READY);
    expect(ORDER_FLOW.ready).toEqual(expect.arrayContaining([OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED]));
  });

  it('final states are final and nothing can skip backwards', () => {
    expect(ORDER_FLOW.delivered).toEqual([]);
    expect(ORDER_FLOW.cancelled).toEqual([]);
    const order = Object.values(OrderStatus);
    for (const [from, targets] of Object.entries(ORDER_FLOW)) {
      for (const to of targets) {
        if (to === OrderStatus.CANCELLED) continue;
        expect(order.indexOf(to)).toBeGreaterThan(order.indexOf(from as OrderStatus));
      }
    }
  });

  it('every status is covered', () => {
    expect(Object.keys(ORDER_FLOW).sort()).toEqual(Object.values(OrderStatus).sort());
  });
});

describe('reservation lifecycle', () => {
  it('matches the booking rules', () => {
    expect(RESERVATION_FLOW.pending).toEqual([ReservationStatus.CONFIRMED, ReservationStatus.CANCELLED]);
    expect(RESERVATION_FLOW.arrived).toEqual([ReservationStatus.COMPLETED]);
    for (const s of [ReservationStatus.COMPLETED, ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW]) {
      expect(RESERVATION_FLOW[s]).toEqual([]);
    }
    expect(Object.keys(RESERVATION_FLOW).sort()).toEqual(Object.values(ReservationStatus).sort());
  });

  it('a booking holds three 30-minute slots (90 minutes)', () => {
    expect(slotsFor(19 * 60)).toEqual([1140, 1170, 1200]);
  });
});
