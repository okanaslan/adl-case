import type { Severity } from "@/types/incident";

const styles: Record<Severity, string> = {
    low: "bg-blue-100 text-blue-700 border-blue-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    critical: "bg-red-100 text-red-700 border-red-200",
};

interface Props {
    severity: Severity;
}

export function SeverityBadge({ severity }: Props) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[severity]}`}>
            {severity}
        </span>
    );
}
