export type Severity = "low" | "medium" | "high" | "critical";
export type Status = "open" | "investigating" | "resolved";

export interface Incident {
    id: string;
    title: string;
    description: string;
    service: string;
    severity: Severity;
    status: Status;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedIncidents {
    data: Incident[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface ListIncidentsParams {
    page?: number;
    limit?: number;
    status?: Status;
    severity?: Severity;
    service?: string;
}

export interface CreateIncidentPayload {
    title: string;
    description: string;
    service: string;
    severity: Severity;
    status?: Status;
}

export interface UpdateIncidentPayload {
    title?: string;
    description?: string;
    service?: string;
    severity?: Severity;
    status?: Status;
}
