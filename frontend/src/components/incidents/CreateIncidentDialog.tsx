import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { CreateIncidentPayload, Severity } from "@/types/incident";

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

interface Props {
    onCreated: () => void;
}

interface FormErrors {
    title?: string;
    description?: string;
    service?: string;
    severity?: string;
}

export function CreateIncidentDialog({ onCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<Partial<CreateIncidentPayload>>({});
    const [errors, setErrors] = useState<FormErrors>({});

    function validate(): boolean {
        const next: FormErrors = {};
        if (!form.title?.trim()) next.title = "Title is required";
        if (!form.description?.trim()) next.description = "Description is required";
        if (!form.service?.trim()) next.service = "Service is required";
        if (!form.severity) next.severity = "Severity is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await api.incidents.create(form as CreateIncidentPayload);
            toast.success("Incident created successfully");
            setOpen(false);
            setForm({});
            setErrors({});
            onCreated();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create incident");
        } finally {
            setLoading(false);
        }
    }

    function handleOpenChange(val: boolean) {
        setOpen(val);
        if (!val) {
            setForm({});
            setErrors({});
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger render={<Button />}>+ New Incident</DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Incident</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={form.title ?? ""}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Brief summary of the incident"
                        />
                        {errors.title && <p className="text-destructive text-xs">{errors.title}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={form.description ?? ""}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Detailed description of what happened"
                            rows={3}
                        />
                        {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="service">Service</Label>
                        <Input
                            id="service"
                            value={form.service ?? ""}
                            onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                            placeholder="e.g. payments-api, auth-service"
                        />
                        {errors.service && <p className="text-destructive text-xs">{errors.service}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                            value={form.severity ?? ""}
                            onValueChange={val => setForm(f => ({ ...f, severity: val as Severity }))}
                        >
                            <SelectTrigger id="severity">
                                <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEVERITIES.map(s => (
                                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.severity && <p className="text-destructive text-xs">{errors.severity}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating…" : "Create Incident"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
