import type {
    CreateIncidentPayload,
    Incident,
    ListIncidentsParams,
    PaginatedIncidents,
    UpdateIncidentPayload,
} from "@/types/incident";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...init,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(body?.error?.message ?? `Request failed: ${res.status}`);
    }

    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}

export const api = {
    incidents: {
        list(params: ListIncidentsParams = {}): Promise<PaginatedIncidents> {
            const search = new URLSearchParams();
            if (params.page) search.set("page", String(params.page));
            if (params.limit) search.set("limit", String(params.limit));
            if (params.status) search.set("status", params.status);
            if (params.severity) search.set("severity", params.severity);
            if (params.service) search.set("service", params.service);
            const qs = search.toString();
            return request<PaginatedIncidents>(`/incidents${qs ? `?${qs}` : ""}`);
        },

        create(payload: CreateIncidentPayload): Promise<Incident> {
            return request<Incident>("/incidents", {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },

        update(id: string, payload: UpdateIncidentPayload): Promise<Incident> {
            return request<Incident>(`/incidents/${id}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        delete(id: string): Promise<void> {
            return request<void>(`/incidents/${id}`, { method: "DELETE" });
        },
    },
};
