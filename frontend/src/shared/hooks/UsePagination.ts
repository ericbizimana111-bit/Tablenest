import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
    initialPage?: number;
    initialLimit?: number;
    total?: number;
}

interface UsePaginationReturn {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    offset: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setTotal: (total: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    firstPage: () => void;
    lastPage: () => void;
    reset: () => void;
    pageNumbers: number[];
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
    const { initialPage = 1, initialLimit = 20, total: initialTotal = 0 } = options;

    const [page, setPageState] = useState(initialPage);
    const [limit, setLimitState] = useState(initialLimit);
    const [total, setTotal] = useState(initialTotal);

    const pages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    const offset = (page - 1) * limit;

    const setPage = useCallback((p: number) => {
        setPageState(Math.min(Math.max(1, p), pages));
    }, [pages]);

    const setLimit = useCallback((l: number) => {
        setLimitState(l);
        setPageState(1);
    }, []);

    const nextPage = useCallback(() => { if (hasNext) setPageState(p => p + 1); }, [hasNext]);
    const prevPage = useCallback(() => { if (hasPrev) setPageState(p => p - 1); }, [hasPrev]);
    const firstPage = useCallback(() => setPageState(1), []);
    const lastPage = useCallback(() => setPageState(pages), [pages]);
    const reset = useCallback(() => { setPageState(initialPage); setLimitState(initialLimit); setTotal(0); }, [initialPage, initialLimit]);

    const pageNumbers = useMemo(() => {
        const maxVisible = 5;
        if (pages <= maxVisible) return Array.from({ length: pages }, (_, i) => i + 1);
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, page - half);
        const end = Math.min(pages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [page, pages]);

    return {
        page, limit, total, pages, hasNext, hasPrev, offset,
        setPage, setLimit, setTotal, nextPage, prevPage, firstPage, lastPage, reset, pageNumbers,
    };
}