import type { Status } from "@/types/incident";

const styles: Record<Status, string> = {
    open: "bg-slate-100 text-slate-700 border-slate-200",
    investigating: "bg-purple-100 text-purple-700 border-purple-200",
    resolved: "bg-green-100 text-green-700 border-green-200",
};

const dots: Record<Status, string> = {
    open: "bg-slate-400",
    investigating: "bg-purple-500",
    resolved: "bg-green-500",
};

interface Props {
    status: Status;
}

export function StatusBadge({ status }: Props) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
            <span className={`size-1.5 rounded-full ${dots[status]}`} />
            {status}
        </span>
    );
}
