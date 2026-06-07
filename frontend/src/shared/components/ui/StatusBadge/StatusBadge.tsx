import React from "react";

export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: "badge-success",
        delivered: "badge-success",
        confirmed: "badge-success",
        open: "badge-success",
        successful: "badge-success",
        available: "badge-success",

        pending: "badge-warning",
        reserved: "badge-warning",
        in_transit: "badge-warning",

        in_progress: "badge-olive",
        preparing: "badge-warning",
        arrived: "badge-blue",

        cancelled: "badge-danger",
        suspended: "badge-danger",
        rejected: "badge-danger",
        occupied: "badge-danger",
        unavailable: "badge-danger",

        inactive: "badge-gray",
        closed: "badge-gray",
        blocked: "badge-gray",
    };

    const cls = map[status?.toLowerCase()] || "badge-gray";

    return (
        <span className={cls}>
            {status?.replace(/_/g, " ")}
        </span>
    );
}