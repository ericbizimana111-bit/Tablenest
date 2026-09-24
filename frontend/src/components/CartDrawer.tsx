import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { cartSubtotal, useCart } from '@/stores/cart';
import { useMoney } from '@/lib/settings';
import { Drawer } from '@/ui/Overlay';
import { Button } from '@/ui/Button';
import { EmptyState, Photo, QtyStepper } from '@/ui/bits';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, restaurantId, restaurantName, setQuantity, clear } = useCart();
  const money = useMoney();
  const navigate = useNavigate();
  const subtotal = cartSubtotal(lines);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={lines.length ? 'Your order' : 'Your bag'}
      footer={
        lines.length ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink-3">Items</span>
              <span className="font-display text-2xl text-ink">{money(subtotal)}</span>
            </div>
            <p className="text-[12.5px] text-ink-3">Delivery, service fee and tax are confirmed on the next step.</p>
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
            >
              Go to checkout
            </Button>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<ShoppingBag className="size-6" />}
            title="Nothing here yet"
            body="Open a restaurant's menu and add a few dishes — they'll wait for you here."
            action={
              <Button
                variant="dark"
                onClick={() => {
                  onClose();
                  navigate('/restaurants?service=delivery');
                }}
              >
                Find something to eat
              </Button>
            }
          />
        </div>
      ) : (
        <div className="p-5">
          <button onClick={() => (onClose(), navigate(`/restaurants/${restaurantId}?tab=menu`))} className="mb-4 text-left">
            <p className="eyebrow">From</p>
            <p className="mt-1 font-display text-xl text-ink hover:underline">{restaurantName}</p>
          </button>
          <ul className="divide-y divide-line">
            {lines.map((l) => (
              <li key={l.menuItemId} className="flex items-center gap-3 py-3.5">
                <Photo src={l.image} alt={l.name} label={l.name} className="size-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-ink">{l.name}</p>
                  <p className="text-[13px] text-ink-3">{money(l.price * l.quantity)}</p>
                </div>
                <QtyStepper size="sm" value={l.quantity} onChange={(v) => setQuantity(l.menuItemId, v)} label={`Quantity of ${l.name}`} />
              </li>
            ))}
          </ul>
          <button onClick={clear} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-tomato-600">
            <Trash2 className="size-3.5" /> Empty the bag
          </button>
        </div>
      )}
    </Drawer>
  );
}
