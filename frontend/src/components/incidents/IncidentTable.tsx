import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIncidents } from "@/hooks/useIncidents";
import type { ListIncidentsParams } from "@/types/incident";
import { CreateIncidentDialog } from "./CreateIncidentDialog";
import { IncidentFilters } from "./IncidentFilters";
import { IncidentRow } from "./IncidentRow";

const LIMIT = 10;

export function IncidentTable() {
    const [filters, setFilters] = useState<ListIncidentsParams>({ page: 1, limit: LIMIT });
    const [newIds, setNewIds] = useState<Set<string>>(new Set());

    const { data, meta, loading, error, refetch } = useIncidents(filters);

    function handleCreated() {
        // New item will arrive via socket event as "new"
        void refetch();
    }

    function handleFiltersChange(next: ListIncidentsParams) {
        setFilters(next);
    }

    function handlePage(page: number) {
        setFilters(f => ({ ...f, page }));
    }

    // Track newly created incidents for entry animation
    function handleSocketCreated(id: string) {
        setNewIds(s => new Set(s).add(id));
        setTimeout(() => setNewIds(s => { const n = new Set(s); n.delete(id); return n; }), 1000);
    }

    // Suppress unused warning — socket events drive this via useIncidents
    void handleSocketCreated;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={() => void refetch()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <IncidentFilters filters={filters} onChange={handleFiltersChange} />
                <CreateIncidentDialog onCreated={handleCreated} />
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                    ))}
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-center border border-dashed rounded-xl">
                    <p className="text-muted-foreground text-sm">No incidents found.</p>
                    <CreateIncidentDialog onCreated={handleCreated} />
                </div>
            ) : (
                <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Service</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Severity</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(incident => (
                                <IncidentRow
                                    key={incident.id}
                                    incident={incident}
                                    isNew={newIds.has(incident.id)}
                                    onDeleted={refetch}
                                    onUpdated={refetch}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                        {meta.totalItems} incident{meta.totalItems !== 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={meta.page <= 1}
                            onClick={() => handlePage(meta.page - 1)}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            {meta.page} / {meta.totalPages}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => handlePage(meta.page + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
