import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Incident } from "@/types/incident";
import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { UpdateIncidentDialog } from "./UpdateIncidentDialog";

interface Props {
    incident: Incident;
    onDeleted: () => void;
    onUpdated: () => void;
    isNew?: boolean;
}

export function IncidentRow({ incident, onDeleted, onUpdated, isNew }: Props) {
    const [updateOpen, setUpdateOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm(`Delete "${incident.title}"?`)) return;
        setDeleting(true);
        try {
            await api.incidents.delete(incident.id);
            toast.success("Incident deleted");
            onDeleted();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete");
            setDeleting(false);
        }
    }

    const createdAt = new Date(incident.createdAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <>
            <tr
                className={`border-b border-border transition-colors hover:bg-muted/30 ${isNew ? "animate-in fade-in slide-in-from-top-2 duration-300" : ""}`}
            >
                <td className="px-4 py-3">
                    <div className="font-medium text-foreground leading-snug">{incident.title}</div>
                    <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1">{incident.description}</div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{incident.service}</td>
                <td className="px-4 py-3"><SeverityBadge severity={incident.severity} /></td>
                <td className="px-4 py-3"><StatusBadge status={incident.status} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{createdAt}</td>
                <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setUpdateOpen(true)}>
                            Edit
                        </Button>
                        <Button size="sm" variant="destructive" disabled={deleting} onClick={() => { void handleDelete(); }}>
                            {deleting ? "…" : "Delete"}
                        </Button>
                    </div>
                </td>
            </tr>

            <UpdateIncidentDialog
                incident={incident}
                open={updateOpen}
                onOpenChange={setUpdateOpen}
                onUpdated={onUpdated}
            />
        </>
    );
}
