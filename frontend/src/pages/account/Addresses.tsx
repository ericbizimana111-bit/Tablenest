import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, House, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import type { Address } from '@/lib/types';
import { PageHead } from '@/layouts/AccountLayout';
import { Button } from '@/ui/Button';
import { Badge, EmptyState } from '@/ui/bits';
import { Input, Select } from '@/ui/Field';
import { Modal } from '@/ui/Overlay';

function AddressForm({ initial, onSave, onClose, busy }: { initial?: Address; onSave: (a: Partial<Address>) => void; onClose: () => void; busy: boolean }) {
  const [a, setA] = useState<Partial<Address>>(initial ?? { label: 'Home', isDefault: false });
  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? 'Edit address' : 'New address'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" loading={busy} disabled={!a.street?.trim()} onClick={() => onSave(a)}>
            Save address
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Label" value={a.label ?? ''} onChange={(e) => setA({ ...a, label: e.target.value })} placeholder="Home, Work…" />
        <Input label="City" value={a.city ?? ''} onChange={(e) => setA({ ...a, city: e.target.value })} />
        <Input label="Street and number" className="sm:col-span-2" value={a.street ?? ''} onChange={(e) => setA({ ...a, street: e.target.value })} placeholder="Include building, floor, door" />
        <Input label="Area / state" optional value={a.state ?? ''} onChange={(e) => setA({ ...a, state: e.target.value })} />
        <Input label="Postcode" optional value={a.zip ?? ''} onChange={(e) => setA({ ...a, zip: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-ink-2 sm:col-span-2">
          <input type="checkbox" checked={!!a.isDefault} onChange={(e) => setA({ ...a, isDefault: e.target.checked })} className="size-4 accent-herb-700" /> Use as my default
        </label>
      </div>
    </Modal>
  );
}

function CardForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [c, setC] = useState({ brand: 'Visa', last4: '', expiryMonth: '', expiryYear: '' });
  const add = useMutation({
    mutationFn: () => userApi.addCard({ ...c, isDefault: false }),
    onSuccess: () => (qc.invalidateQueries({ queryKey: ['cards'] }), onClose(), toast.success('Card saved')),
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Modal
      open
      onClose={onClose}
      title="Save a card for reference"
      description="We only keep the brand, last four digits and expiry — never the full number. Online card payment is coming soon."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" loading={add.isPending} disabled={!/^\d{4}$/.test(c.last4) || !c.expiryMonth || !c.expiryYear} onClick={() => add.mutate()}>
            Save card
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Brand" value={c.brand} onChange={(e) => setC({ ...c, brand: e.target.value })}>
          {['Visa', 'Mastercard', 'Amex', 'Discover', 'Card'].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </Select>
        <Input label="Last 4 digits" inputMode="numeric" maxLength={4} value={c.last4} onChange={(e) => setC({ ...c, last4: e.target.value.replace(/\D/g, '') })} />
        <Input label="Expiry month" placeholder="MM" inputMode="numeric" maxLength={2} value={c.expiryMonth} onChange={(e) => setC({ ...c, expiryMonth: e.target.value.replace(/\D/g, '') })} />
        <Input label="Expiry year" placeholder="YYYY" inputMode="numeric" maxLength={4} value={c.expiryYear} onChange={(e) => setC({ ...c, expiryYear: e.target.value.replace(/\D/g, '') })} />
      </div>
    </Modal>
  );
}

export default function Addresses() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<{ index: number | null; value?: Address } | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: userApi.addresses });
  const cards = useQuery({ queryKey: ['cards'], queryFn: userApi.cards });
  const done = () => qc.invalidateQueries({ queryKey: ['addresses'] });
  const save = useMutation({
    mutationFn: (a: Partial<Address>) => (editing?.index === null ? userApi.addAddress(a) : userApi.updateAddress(editing!.index!, a)),
    onSuccess: () => (done(), setEditing(null), toast.success('Address saved')),
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({ mutationFn: userApi.deleteAddress, onSuccess: done });
  const makeDefault = useMutation({ mutationFn: userApi.defaultAddress, onSuccess: done });
  const removeCard = useMutation({ mutationFn: userApi.deleteCard, onSuccess: () => qc.invalidateQueries({ queryKey: ['cards'] }) });

  return (
    <div className="space-y-10">
      <PageHead eyebrow="Checkout faster" title="Addresses & cards" />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl text-ink">Delivery addresses</h2>
          <Button size="sm" variant="dark" icon={<Plus className="size-4" />} onClick={() => setEditing({ index: null })}>
            Add address
          </Button>
        </div>
        {!addresses.data?.addresses.length ? (
          <EmptyState icon={<MapPin className="size-6" />} title="No saved addresses" body="Save your home or office and choose it with one tap at checkout." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.data.addresses.map((a, i) => (
              <div key={i} className="rounded-[20px] border border-line bg-card p-5">
                <div className="flex items-center gap-2">
                  <House className="size-4 text-herb-600" />
                  <p className="font-semibold text-ink">{a.label}</p>
                  {a.isDefault && <Badge tone="herb">Default</Badge>}
                </div>
                <p className="mt-2 text-[14px] text-ink-3">{[a.street, a.city, a.state, a.zip].filter(Boolean).join(', ')}</p>
                <div className="mt-4 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditing({ index: i, value: a })}>
                    Edit
                  </Button>
                  {!a.isDefault && (
                    <Button size="sm" variant="ghost" icon={<Star className="size-3.5" />} onClick={() => makeDefault.mutate(i)}>
                      Make default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="ml-auto text-tomato-600" icon={<Trash2 className="size-3.5" />} onClick={() => remove.mutate(i)} aria-label="Remove address" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl text-ink">Cards</h2>
          <Button size="sm" variant="outline" icon={<Plus className="size-4" />} onClick={() => setAddingCard(true)}>
            Save a card
          </Button>
        </div>
        <p className="mb-4 rounded-2xl bg-paper-2 p-4 text-sm text-ink-3">Payment is in person for now. Saved cards are for your reference and will be used once online payment launches.</p>
        {!!cards.data?.paymentMethods.length && (
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.data.paymentMethods.map((c, i) => (
              <div key={i} className="flex items-center gap-4 rounded-[20px] bg-herb-900 p-5 text-paper">
                <CreditCard className="size-8 text-saffron-300" />
                <div className="flex-1">
                  <p className="font-semibold">
                    {c.brand} •••• {c.last4}
                  </p>
                  <p className="text-[12.5px] text-paper/60">
                    Expires {c.expiryMonth}/{c.expiryYear}
                  </p>
                </div>
                <button onClick={() => removeCard.mutate(i)} className="grid size-9 place-items-center rounded-full text-paper/60 hover:bg-paper/10 hover:text-paper" aria-label="Remove card">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {editing && <AddressForm initial={editing.value} busy={save.isPending} onSave={(a) => save.mutate(a)} onClose={() => setEditing(null)} />}
      {addingCard && <CardForm onClose={() => setAddingCard(false)} />}
    </div>
  );
}
