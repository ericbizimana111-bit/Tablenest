import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Download, Printer, QrCode } from 'lucide-react';
import { tableApi } from '@/lib/api';
import type { DiningTable, Restaurant } from '@/lib/types';
import { DashHead } from '@/layouts/DashboardLayout';
import { OwnerGate } from '@/components/OwnerGate';
import { Button, LinkButton } from '@/ui/Button';
import { EmptyState } from '@/ui/bits';
import { LogoMark } from '@/ui/Logo';
import { Skeleton } from '@/ui/Loader';

const tableUrl = (r: Restaurant, t: DiningTable) => `${location.origin}/restaurants/${r._id}?tab=menu&table=${t._id}&t=${encodeURIComponent(t.tableNumber)}`;

function QrCard({ r, t }: { r: Restaurant; t: DiningTable }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(tableUrl(r, t), { margin: 1, width: 480, color: { dark: '#0f2a20', light: '#fffdf9' }, errorCorrectionLevel: 'M' }).then((d) => alive && setSrc(d));
    return () => {
      alive = false;
    };
  }, [r, t]);

  return (
    <figure className="qr-card flex break-inside-avoid flex-col items-center rounded-[24px] border border-line bg-card p-6 text-center">
      <div className="flex items-center gap-2 text-herb-800">
        <LogoMark className="size-5" />
        <span className="font-display text-[15px]">{r.name}</span>
      </div>
      <div className="relative mt-4 w-full max-w-[200px] rounded-2xl border-2 border-dashed border-line-2 p-3">
        {src ? <img src={src} alt={`QR code for table ${t.tableNumber}`} className="aspect-square w-full" /> : <Skeleton className="aspect-square w-full" />}
      </div>
      <figcaption className="mt-4">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-ink-4 uppercase">Table</p>
        <p className="font-display text-4xl leading-none text-ink">{t.tableNumber}</p>
        <p className="mt-3 text-[13px] text-ink-3">Scan to see the menu and order to your table</p>
      </figcaption>
      {src && (
        <a href={src} download={`table-${t.tableNumber}.png`} className="print:hidden mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-herb-700 hover:underline">
          <Download className="size-3.5" /> PNG
        </a>
      )}
    </figure>
  );
}

function Sheet({ r }: { r: Restaurant }) {
  const { data, isLoading } = useQuery({ queryKey: ['owner', 'tables', r._id], queryFn: () => tableApi.list(r._id) });
  const tables = [...(data ?? [])].sort((a, b) => a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true }));
  return (
    <>
      <div className="print:hidden">
        <DashHead
          title="Table QR codes"
          lead={
            r.dineIn
              ? 'Print one for each table. Guests scan, browse your menu and order — the ticket lands on your board with the table number on it.'
              : 'Turn on dine-in in Restaurant settings so guests can order to their table.'
          }
          action={
            !!tables.length && (
              <Button variant="dark" size="sm" icon={<Printer className="size-4" />} onClick={() => window.print()}>
                Print all
              </Button>
            )
          }
        />
      </div>
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : !tables.length ? (
        <EmptyState icon={<QrCode className="size-6" />} title="Add tables first" body="Each table gets its own code, so orders arrive with the right table number." action={<LinkButton to="/owner/tables">Set up tables</LinkButton>} />
      ) : (
        <div className="qr-sheet grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-3 print:gap-3">
          {tables.map((t) => (
            <QrCard key={t._id} r={r} t={t} />
          ))}
        </div>
      )}
    </>
  );
}

export default function OwnerQr() {
  return <OwnerGate>{(r) => <Sheet r={r} />}</OwnerGate>;
}
