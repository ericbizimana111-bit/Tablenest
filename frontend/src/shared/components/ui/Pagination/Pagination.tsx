import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    page: number;
    pages: number;
    onPage: (p: number) => void;
}

export function Pagination({ page, pages, onPage }: PaginationProps) {
    if (pages <= 1) return null;

    const nums = (() => {
        const span = 5;
        let start = Math.max(1, page - Math.floor(span / 2));
        const end = Math.min(pages, start + span - 1);
        start = Math.max(1, end - span + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })();

    const navBtn = (disabled: boolean) => ({
        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid var(--color-line)', borderRadius: 10, background: '#fff',
        color: disabled ? '#c9bdaf' : '#4a4038', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    } as React.CSSProperties);

    return (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', padding: '20px 0' }}>
            <button onClick={() => onPage(page - 1)} disabled={page === 1} style={navBtn(page === 1)}>
                <ChevronLeft size={16} />
            </button>
            {nums[0] > 1 && <span style={{ padding: '0 4px', color: '#b3a89d' }}>…</span>}
            {nums.map((n) => (
                <button
                    key={n}
                    onClick={() => onPage(n)}
                    className="btn-sm"
                    style={{
                        width: 34, height: 34, padding: 0, borderRadius: 10, fontWeight: 700, fontSize: 13,
                        border: n === page ? 'none' : '1.5px solid var(--color-line)',
                        background: n === page ? 'var(--color-brand-500)' : '#fff',
                        color: n === page ? '#fff' : '#4a4038',
                        boxShadow: n === page ? '0 6px 16px -6px rgb(249 105 26 / 0.6)' : 'none',
                    }}
                >
                    {n}
                </button>
            ))}
            {nums[nums.length - 1] < pages && <span style={{ padding: '0 4px', color: '#b3a89d' }}>…</span>}
            <button onClick={() => onPage(page + 1)} disabled={page === pages} style={navBtn(page === pages)}>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}

export default Pagination;
