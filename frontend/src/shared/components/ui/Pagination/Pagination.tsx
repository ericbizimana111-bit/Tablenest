import React from "react";

interface PaginationProps {
    page: number;
    pages: number;
    onPage: (p: number) => void;
}

export function Pagination({ page, pages, onPage }: PaginationProps) {
    if (pages <= 1) return null;

    const nums = Array.from(
        { length: Math.min(pages, 5) },
        (_, i) => i + 1
    );

    return (
        <div style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            padding: "16px 0"
        }}>
            <button
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
                style={{
                    padding: "6px 10px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    background: "white",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontSize: 13
                }}
            >
                ‹
            </button>

            {nums.map((n) => (
                <button
                    key={n}
                    onClick={() => onPage(n)}
                    style={{
                        padding: "6px 10px",
                        border: "1px solid",
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: "pointer",
                        borderColor: n === page ? "#F97316" : "#E2E8F0",
                        background: n === page ? "#F97316" : "white",
                        color: n === page ? "white" : "#475569"
                    }}
                >
                    {n}
                </button>
            ))}

            {pages > 5 && <span style={{ padding: "6px 4px" }}>...</span>}

            {pages > 5 && (
                <button
                    onClick={() => onPage(pages)}
                    style={{
                        padding: "6px 10px",
                        border: "1px solid",
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: "pointer",
                        borderColor: pages === page ? "#F97316" : "#E2E8F0",
                        background: pages === page ? "#F97316" : "white",
                        color: pages === page ? "white" : "#475569"
                    }}
                >
                    {pages}
                </button>
            )}

            <button
                onClick={() => onPage(page + 1)}
                disabled={page === pages}
                style={{
                    padding: "6px 10px",
                    border: "1px solid #E2E8F0",
                    borderRadius: 6,
                    background: "white",
                    cursor: page === pages ? "not-allowed" : "pointer",
                    fontSize: 13
                }}
            >
                ›
            </button>
        </div>
    );
}