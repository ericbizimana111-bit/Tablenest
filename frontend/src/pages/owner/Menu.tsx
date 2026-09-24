import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { Eye, EyeOff, Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import { useMoney } from '@/lib/settings';
import type { MenuCategory, MenuItem, Restaurant } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { SingleImageUploader } from '@/components/ImageUploader';
import { Button } from '@/ui/Button';
import { Badge, EmptyState, Photo } from '@/ui/bits';
import { Input, Select, Textarea, Toggle } from '@/ui/Field';
import { Confirm, Modal } from '@/ui/Overlay';
import { Skeleton } from '@/ui/Loader';

type Draft = Partial<MenuItem> & { tagsText?: string };

function ItemForm({ initial, categories, onClose }: { initial: Draft; categories: MenuCategory[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [d, setD] = useState<Draft>({ ...initial, tagsText: initial.tags?.join(', ') ?? '' });
  const [err, setErr] = useState<string | null>(null);
  const save = useMutation({
    mutationFn: () => {
      const body: Partial<MenuItem> = {
        categoryId: d.categoryId,
        name: d.name?.trim(),
        description: d.description?.trim() || null,
        price: Number(d.price),
        image: d.image ?? null,
        isAvailable: d.isAvailable ?? true,
        isSoldOut: d.isSoldOut ?? false,
        tags: (d.tagsText || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10),
        preparationTime: Number(d.preparationTime) || 15,
      };
      return d._id ? menuApi.updateItem(d._id, body) : menuApi.createItem(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner', 'menu'] });
      toast.success(d._id ? 'Dish updated' : 'Dish added');
      onClose();
    },
    onError: (e) => setErr(errorMessage(e)),
  });
  const valid = !!d.name?.trim() && Number(d.price) > 0 && !!d.categoryId;
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={d._id ? `Edit ${initial.name}` : 'New dish'}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" disabled={!valid} loading={save.isPending} onClick={() => save.mutate()}>
            {d._id ? 'Save changes' : 'Add to menu'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <SingleImageUploader label="Dish photo" value={d.image ?? null} onChange={(url) => setD({ ...d, image: url })} className="aspect-square w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" className="sm:col-span-2" value={d.name ?? ''} maxLength={100} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="e.g. Brochettes with pili-pili" />
          <Input label="Price" type="number" min={0} step="0.01" inputMode="decimal" value={d.price ?? ''} onChange={(e) => setD({ ...d, price: e.target.value === '' ? undefined : Number(e.target.value) })} />
          <Select label="Section" value={d.categoryId ?? ''} onChange={(e) => setD({ ...d, categoryId: e.target.value })}>
            <option value="" disabled>
              Choose…
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea label="Description" optional className="sm:col-span-2" rows={3} maxLength={500} value={d.description ?? ''} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="What makes it good — ingredients, how it's cooked." />
          <Input label="Tags" optional hint="Comma separated: vegan, spicy, chef's pick" value={d.tagsText} onChange={(e) => setD({ ...d, tagsText: e.target.value })} />
          <Input label="Prep time (minutes)" type="number" min={1} max={240} value={d.preparationTime ?? 15} onChange={(e) => setD({ ...d, preparationTime: Number(e.target.value) })} />
          <div className="space-y-4 sm:col-span-2">
            <Toggle checked={d.isAvailable ?? true} onChange={(v) => setD({ ...d, isAvailable: v })} label="Show on the menu" description="Hidden dishes are kept but guests can't see them." />
            <Toggle checked={d.isSoldOut ?? false} onChange={(v) => setD({ ...d, isSoldOut: v })} label="Sold out today" description="Visible, but can't be ordered." />
          </div>
        </div>
      </div>
      {err && <p className="mt-4 rounded-xl bg-tomato-50 p-3 text-sm text-tomato-700">{err}</p>}
    </Modal>
  );
}

function MenuBoard({ r }: { r: Restaurant }) {
  const qc = useQueryClient();
  const money = useMoney();
  const cats = useQuery({ queryKey: ['owner', 'menu', 'categories', r._id], queryFn: () => menuApi.categories(r._id) });
  const items = useQuery({ queryKey: ['owner', 'menu', 'items', r._id], queryFn: () => menuApi.items(r._id) });
  const [editing, setEditing] = useState<Draft | null>(null);
  const [newCat, setNewCat] = useState('');
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [removing, setRemoving] = useState<{ kind: 'item' | 'category'; id: string; name: string } | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ['owner', 'menu'] });
  const onError = (e: unknown) => toast.error(errorMessage(e));

  const addCat = useMutation({ mutationFn: () => menuApi.createCategory(newCat.trim()), onSuccess: () => (setNewCat(''), refresh()), onError });
  const renameCat = useMutation({ mutationFn: (v: { id: string; name: string }) => menuApi.updateCategory(v.id, { name: v.name }), onSuccess: () => (setRenaming(null), refresh()), onError });
  const toggle = useMutation({ mutationFn: menuApi.toggleItem, onSuccess: refresh, onError });
  const remove = useMutation({
    mutationFn: (v: { kind: 'item' | 'category'; id: string }) => (v.kind === 'item' ? menuApi.deleteItem(v.id) : menuApi.deleteCategory(v.id)),
    onSuccess: () => (setRemoving(null), refresh()),
    onError,
  });

  const categories = [...(cats.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const all = items.data ?? [];

  return (
    <>
      <DashHead
        title="Menu"
        lead={`${all.length} dishes in ${categories.length} sections. Prices you set here are what guests pay — totals are always calculated on our side.`}
        action={
          <Button variant="primary" size="sm" icon={<Plus className="size-4" />} disabled={!categories.length} onClick={() => setEditing({ categoryId: categories[0]?._id, isAvailable: true })}>
            Add dish
          </Button>
        }
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newCat.trim()) addCat.mutate();
        }}
        className="mb-6 flex max-w-lg gap-2"
      >
        <input value={newCat} onChange={(e) => setNewCat(e.target.value)} maxLength={60} className="input-base" placeholder={categories.length ? 'New section, e.g. Desserts' : 'Start with a section, e.g. Starters'} aria-label="New section name" />
        <Button type="submit" variant="dark" loading={addCat.isPending} disabled={!newCat.trim()}>
          Add section
        </Button>
      </form>

      {cats.isLoading || items.isLoading ? (
        <Skeleton className="h-80" />
      ) : !categories.length ? (
        <EmptyState icon={<UtensilsCrossed className="size-6" />} title="Your menu is a blank page" body="Create a section like Starters or Mains, then add dishes with a photo and price." />
      ) : (
        <div className="space-y-8">
          {categories.map((c) => {
            const list = all.filter((i) => i.categoryId === c._id);
            return (
              <section key={c._id}>
                <header className="mb-3 flex items-center gap-2">
                  {renaming?.id === c._id ? (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameCat.mutate(renaming);
                      }}
                    >
                      <input autoFocus value={renaming.name} onChange={(e) => setRenaming({ ...renaming, name: e.target.value })} className="input-base !h-10" aria-label="Section name" />
                      <Button size="sm" type="submit" variant="dark" loading={renameCat.isPending}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRenaming(null)}>
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <>
                      <h2 className="font-display text-2xl text-ink">{c.name}</h2>
                      <span className="text-sm text-ink-4">{list.length}</span>
                      <button onClick={() => setRenaming({ id: c._id, name: c.name })} className="grid size-8 place-items-center rounded-full text-ink-4 hover:bg-paper-2 hover:text-ink" aria-label={`Rename ${c.name}`}>
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={() => setRemoving({ kind: 'category', id: c._id, name: c.name })} className="grid size-8 place-items-center rounded-full text-ink-4 hover:bg-tomato-50 hover:text-tomato-600" aria-label={`Delete ${c.name}`}>
                        <Trash2 className="size-3.5" />
                      </button>
                      <div className="ml-auto">
                        <Button size="sm" variant="ghost" icon={<Plus className="size-4" />} onClick={() => setEditing({ categoryId: c._id, isAvailable: true })}>
                          Dish
                        </Button>
                      </div>
                    </>
                  )}
                </header>
                {list.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((i) => (
                      <motion.div layout key={i._id} className={cn('group flex gap-3 rounded-[20px] border border-line bg-card p-3 transition', !i.isAvailable && 'opacity-60')}>
                        <Photo src={i.image} alt={i.name} className="size-20 shrink-0 rounded-2xl" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-1 font-semibold text-ink">{i.name}</p>
                            <span className="font-display text-[17px] tabular-nums text-ink">{money(i.price)}</span>
                          </div>
                          <p className="line-clamp-2 text-[12.5px] text-ink-3">{i.description || 'No description yet'}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {!i.isAvailable && <Badge>Hidden</Badge>}
                            {i.isSoldOut && <Badge tone="tomato">Sold out</Badge>}
                            <div className="ml-auto flex gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                              <button onClick={() => toggle.mutate(i._id)} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label={i.isAvailable ? 'Hide from menu' : 'Show on menu'}>
                                {i.isAvailable ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              </button>
                              <button onClick={() => setEditing(i)} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-paper-2 hover:text-ink" aria-label={`Edit ${i.name}`}>
                                <Pencil className="size-4" />
                              </button>
                              <button onClick={() => setRemoving({ kind: 'item', id: i._id, name: i.name })} className="grid size-8 place-items-center rounded-full text-ink-3 hover:bg-tomato-50 hover:text-tomato-600" aria-label={`Delete ${i.name}`}>
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setEditing({ categoryId: c._id, isAvailable: true })} className="w-full rounded-[20px] border-2 border-dashed border-line-2 p-6 text-sm font-semibold text-ink-3 transition hover:border-herb-400 hover:text-herb-700">
                    Add the first dish to {c.name}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}

      {editing && <ItemForm initial={editing} categories={categories} onClose={() => setEditing(null)} />}
      <Confirm
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing)}
        loading={remove.isPending}
        title={`Delete ${removing?.name}?`}
        body={removing?.kind === 'category' ? 'Only empty sections can be deleted. Move or delete its dishes first.' : 'Past orders keep their copy of this dish. This cannot be undone.'}
        confirmLabel="Delete"
      />
    </>
  );
}

export default function OwnerMenu() {
  return <OwnerGate>{(r) => <MenuBoard r={r} />}</OwnerGate>;
}
