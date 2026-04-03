import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { Incident, Severity, Status, UpdateIncidentPayload } from "@/types/incident";

const STATUSES: Status[] = ["open", "investigating", "resolved"];
const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

interface Props {
    incident: Incident;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
}

export function UpdateIncidentDialog({ incident, open, onOpenChange, onUpdated }: Props) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<UpdateIncidentPayload>({
        status: incident.status,
        severity: incident.severity,
        description: incident.description,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await api.incidents.update(incident.id, form);
            toast.success("Incident updated");
            onOpenChange(false);
            onUpdated();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update incident");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Incident</DialogTitle>
                    <p className="text-muted-foreground text-sm truncate">{incident.title}</p>
                </DialogHeader>
                <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="update-status">Status</Label>
                        <Select
                            value={form.status ?? incident.status}
                            onValueChange={val => setForm(f => ({ ...f, status: val as Status }))}
                        >
                            <SelectTrigger id="update-status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map(s => (
                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="update-severity">Severity</Label>
                        <Select
                            value={form.severity ?? incident.severity}
                            onValueChange={val => setForm(f => ({ ...f, severity: val as Severity }))}
                        >
                            <SelectTrigger id="update-severity">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SEVERITIES.map(s => (
                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="update-description">Description</Label>
                        <Textarea
                            id="update-description"
                            value={form.description ?? incident.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving…" : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
