import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ListIncidentsParams, Severity, Status } from "@/types/incident";

const STATUSES: Status[] = ["open", "investigating", "resolved"];
const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

interface Props {
    filters: ListIncidentsParams;
    onChange: (filters: ListIncidentsParams) => void;
}

export function IncidentFilters({ filters, onChange }: Props) {
    return (
        <div className="flex flex-wrap gap-3">
            <Select
                value={filters.status ?? "all"}
                onValueChange={val => onChange({ ...filters, status: val === "all" ? undefined : val as Status, page: 1 })}
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filters.severity ?? "all"}
                onValueChange={val => onChange({ ...filters, severity: val === "all" ? undefined : val as Severity, page: 1 })}
            >
                <SelectTrigger className="w-40">
                    <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    {SEVERITIES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                className="w-48"
                placeholder="Search (service/title/description)…"
                value={filters.service ?? ""}
                onChange={e => onChange({ ...filters, service: e.target.value || undefined, page: 1 })}
            />
        </div>
    );
}
