import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

// ── Modal ──
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: number;
}
export function Modal({ isOpen, onClose, title, children, width = 520 }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div style= {{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: 20,
    }
} onClick = { onClose } >
    <div style={
    {
        background: 'white', borderRadius: 16, width: '100%', maxWidth: width,
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                animation: 'fadeIn 0.2s ease-out',
      }
} onClick = { e => e.stopPropagation() } >
    <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #E5E7EB' } }>
        <h3 style={ { fontSize: 17, fontWeight: 600, color: '#111827' } }> { title } </h3>
            < button onClick = { onClose } style = {{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
                <X size={ 20 } />
                    </button>
                    </div>
                    < div style = {{ padding: '20px 24px' }}> { children } </div>
                        </div>
                        </div>
  );
}

// ── StatCard ──
interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    sub?: string;
    color?: string;
}
export function StatCard({ label, value, icon, trend, trendUp, sub, color = '#B91C1C' }: StatCardProps) {
    return (
        <div style= {{
        background: 'white', borderRadius: 12, padding: '20px',
            border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }
}>
    <div style={ { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 } }>
        <div style={ { background: `${color}15`, padding: 10, borderRadius: 10, color } }>
            { icon }
            </div>
{
    trend && (
        <span style={
        {
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 500,
                color: trendUp ? '#16A34A' : '#DC2626',
          }
    }>
        { trendUp?<TrendingUp size = { 12 } /> : <TrendingDown size={ 12 } />
}
{ trend }
</span>
        )}
</div>
    < div style = {{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}> { label } </div>
        < div style = {{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}> { value } </div>
{ sub && <div style={ { fontSize: 12, color: '#9CA3AF', marginTop: 4 } }> { sub } </div> }
</div>
  );
}

// ── Spinner ──
export function Spinner({ size = 32 }: { size?: number }) {
    return (
        <div style= {{ display: 'flex', justifyContent: 'center', padding: 40 }
}>
    <div style={
    {
        width: size, height: size,
            border: '3px solid #FEE2E2',
                borderTop: '3px solid #B91C1C',
                    borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
      }
} />
    < style > {`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
  );
}

// ── EmptyState ──
export function EmptyState({ icon, title, message }: { icon?: React.ReactNode; title: string; message?: string }) {
    return (
        <div style= {{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }
}>
    { icon && <div style={ { marginBottom: 16, opacity: 0.4 } }> { icon } </div>}
<div style={ { fontSize: 16, fontWeight: 600, color: '#6B7280', marginBottom: 6 } }> { title } </div>
{ message && <div style={ { fontSize: 14 } }> { message } </div> }
</div>
  );
}

// ── Pagination ──
interface PaginationProps {
    page: number;
    pages: number;
    onPage: (p: number) => void;
}
export function Pagination({ page, pages, onPage }: PaginationProps) {
    if (pages <= 1) return null;
    const nums = Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1);
    return (
        <div style= {{ display: 'flex', gap: 6, justifyContent: 'center', padding: '16px 0' }
}>
    <button onClick={ () => onPage(page - 1) } disabled = { page === 1}
style = {{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13 }}>‹</button>
{
    nums.map(n => (
        <button key= { n } onClick = {() => onPage(n)}
style = {{
    padding: '6px 10px', border: '1px solid', borderRadius: 6, fontSize: 13, cursor: 'pointer',
        borderColor: n === page ? '#B91C1C' : '#E5E7EB',
            background: n === page ? '#B91C1C' : 'white',
                color: n === page ? 'white' : '#374151',
          }}> { n } </button>
      ))}
{ pages > 5 && <span style={ { padding: '6px 4px', fontSize: 13 } }>...</span> }
{
    pages > 5 && (
        <button onClick={ () => onPage(pages) }
    style = {{
        padding: '6px 10px', border: '1px solid', borderRadius: 6, fontSize: 13, cursor: 'pointer',
            borderColor: pages === page ? '#B91C1C' : '#E5E7EB',
                background: pages === page ? '#B91C1C' : 'white',
                    color: pages === page ? 'white' : '#374151',
          }
}> { pages } </button>
      )}
<button onClick={ () => onPage(page + 1) } disabled = { page === pages}
style = {{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 6, background: 'white', cursor: page === pages ? 'not-allowed' : 'pointer', fontSize: 13 }}>›</button>
    </div>
  );
}

// ── Toggle ──
export function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <label className= "toggle-switch" >
        <input type="checkbox" checked = { checked } onChange = { onChange } />
            <span className="toggle-slider" />
                </label>
  );
}

// ── Badge helpers ──
export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: 'badge-success', delivered: 'badge-success', confirmed: 'badge-success',
        open: 'badge-success', successful: 'badge-success', available: 'badge-success',
        pending: 'badge-warning', reserved: 'badge-warning', in_transit: 'badge-warning',
        in_progress: 'badge-olive', preparing: 'badge-warning', arrived: 'badge-blue',
        cancelled: 'badge-danger', suspended: 'badge-danger', rejected: 'badge-danger',
        occupied: 'badge-danger', unavailable: 'badge-danger',
        inactive: 'badge-gray', closed: 'badge-gray', blocked: 'badge-gray',
    };
    const cls = map[status?.toLowerCase()] || 'badge-gray';
    return <span className={ cls }> { status?.replace(/ _ / g, ' ')
} </span>;
}