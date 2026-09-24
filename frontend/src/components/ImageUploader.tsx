import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, LoaderCircle, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadApi } from '@/lib/api';
import { errorMessage } from '@/lib/http';
import { cn } from '@/lib/format';
import { Photo } from '@/ui/bits';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_MB = 5;

async function uploadFiles(files: File[]) {
  const out: string[] = [];
  for (const f of files) {
    if (!ACCEPT.split(',').includes(f.type)) {
      toast.error(`${f.name}: use a JPG, PNG or WebP photo`);
      continue;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`${f.name} is larger than ${MAX_MB} MB`);
      continue;
    }
    try {
      out.push((await uploadApi.image(f)).url);
    } catch (e) {
      toast.error(errorMessage(e, `${f.name} could not be uploaded`));
    }
  }
  return out;
}

/** A gallery of uploaded photos; the first one is the cover. */
export function GalleryUploader({ value, onChange, max = 8 }: { value: string[]; onChange: (v: string[]) => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, max - value.length);
    if (!list.length) return;
    setBusy(true);
    const urls = await uploadFiles(list);
    setBusy(false);
    if (urls.length) onChange([...value, ...urls]);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AnimatePresence>
          {value.map((url, i) => (
            <motion.div key={url} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative aspect-square overflow-hidden rounded-2xl">
              <Photo src={url} alt={`Photo ${i + 1}`} className="size-full" />
              {i === 0 ? (
                <span className="absolute bottom-2 left-2 rounded-full bg-herb-900/90 px-2 py-1 text-[11px] font-semibold text-paper">Cover</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange([url, ...value.filter((u) => u !== url)])}
                  className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-ink opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  <Star className="size-3" /> Make cover
                </button>
              )}
              <button
                type="button"
                onClick={() => onChange(value.filter((u) => u !== url))}
                aria-label="Remove photo"
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {value.length < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => (e.preventDefault(), setDrag(true))}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              addFiles(e.dataTransfer.files);
            }}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center text-[13px] font-semibold transition',
              drag ? 'border-herb-500 bg-herb-50 text-herb-700' : 'border-line-2 bg-card text-ink-3 hover:border-herb-500 hover:text-herb-700',
            )}
          >
            {busy ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {busy ? 'Uploading…' : 'Add photos'}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => e.target.files && addFiles(e.target.files)} />
      <p className="mt-2 text-[12.5px] text-ink-4">JPG, PNG or WebP up to {MAX_MB} MB each. The first photo is the one guests see first.</p>
    </div>
  );
}

/** A single image slot (dish photo, logo, avatar). */
export function SingleImageUploader({ value, onChange, label = 'Photo', className }: { value: string | null; onChange: (v: string | null) => void; label?: string; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    const [url] = await uploadFiles([f]);
    setBusy(false);
    if (url) onChange(url);
  };
  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="group relative block size-full overflow-hidden rounded-2xl border-2 border-dashed border-line-2 bg-card transition hover:border-herb-500"
        aria-label={value ? `Change ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
      >
        {value ? (
          <Photo src={value} alt={label} className="size-full" />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1.5 text-[12.5px] font-semibold text-ink-3 group-hover:text-herb-700">
            {busy ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {busy ? 'Uploading…' : label}
          </span>
        )}
        {value && (
          <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {busy ? 'Uploading…' : 'Change'}
          </span>
        )}
      </button>
      {value && (
        <button type="button" onClick={() => onChange(null)} className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-ink text-white shadow" aria-label={`Remove ${label.toLowerCase()}`}>
          <X className="size-4" />
        </button>
      )}
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
