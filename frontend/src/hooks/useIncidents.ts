import { useCallback, useEffect, useReducer, useRef } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Incident, ListIncidentsParams, PaginatedIncidents } from "@/types/incident";

interface State {
    data: Incident[];
    meta: PaginatedIncidents["meta"] | null;
    loading: boolean;
    error: string | null;
    newIds: Set<string>;
    updatedIds: Set<string>;
    exitingIds: Set<string>;
}

type Action =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: PaginatedIncidents }
    | { type: "FETCH_ERROR"; payload: string }
    | { type: "SET_META"; payload: PaginatedIncidents["meta"] }
    | { type: "INCIDENT_CREATED"; payload: { incident: Incident; limit: number } }
    | { type: "INCIDENT_UPDATED"; payload: Incident }
    | { type: "INCIDENT_MARK_EXITING"; payload: string }
    | { type: "INCIDENT_DELETED"; payload: string }
    | { type: "CLEAR_TRANSIENT"; payload: { kind: "new" | "updated" | "exiting"; id: string } };

function matchesFilters(incident: Incident, params: ListIncidentsParams): boolean {
    if (params.status && incident.status !== params.status) return false;
    if (params.severity && incident.severity !== params.severity) return false;
    if (params.service && incident.service !== params.service) return false;
    return true;
}

function computeMetaAfterDelta(meta: PaginatedIncidents["meta"] | null, limit: number, delta: number) {
    if (!meta) return meta;
    const totalItems = Math.max(0, meta.totalItems + delta);
    const totalPages = Math.ceil(totalItems / limit);
    return { ...meta, totalItems, totalPages };
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, error: null };
        case "FETCH_SUCCESS":
            return {
                data: action.payload.data,
                meta: action.payload.meta,
                loading: false,
                error: null,
                newIds: new Set(),
                updatedIds: new Set(),
                exitingIds: new Set(),
            };
        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };
        case "SET_META":
            return { ...state, meta: action.payload };
        case "INCIDENT_CREATED":
            return {
                ...state,
                data: [action.payload.incident, ...state.data].slice(0, action.payload.limit),
                newIds: new Set(state.newIds).add(action.payload.incident.id),
            };
        case "INCIDENT_UPDATED": {
            const nextData = state.data.map(i => i.id === action.payload.id ? action.payload : i);
            return { ...state, data: nextData, updatedIds: new Set(state.updatedIds).add(action.payload.id) };
        }
        case "INCIDENT_MARK_EXITING":
            return { ...state, exitingIds: new Set(state.exitingIds).add(action.payload) };
        case "INCIDENT_DELETED":
            return { ...state, data: state.data.filter(i => i.id !== action.payload) };
        case "CLEAR_TRANSIENT": {
            if (action.payload.kind === "new") {
                const next = new Set(state.newIds);
                next.delete(action.payload.id);
                return { ...state, newIds: next };
            }
            if (action.payload.kind === "updated") {
                const next = new Set(state.updatedIds);
                next.delete(action.payload.id);
                return { ...state, updatedIds: next };
            }
            const next = new Set(state.exitingIds);
            next.delete(action.payload.id);
            return { ...state, exitingIds: next };
        }
        default:
            return state;
    }
}

const initialState: State = {
    data: [],
    meta: null,
    loading: true,
    error: null,
    newIds: new Set(),
    updatedIds: new Set(),
    exitingIds: new Set(),
};

export function useIncidents(params: ListIncidentsParams) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const paramsRef = useRef(params);
    paramsRef.current = params;

    const fetchIncidents = useCallback(async () => {
        dispatch({ type: "FETCH_START" });
        try {
            const result = await api.incidents.list(paramsRef.current);
            dispatch({ type: "FETCH_SUCCESS", payload: result });
        } catch (err) {
            dispatch({ type: "FETCH_ERROR", payload: err instanceof Error ? err.message : "Failed to load incidents" });
        }
    }, []);

    useEffect(() => {
        void fetchIncidents();
    }, [fetchIncidents, params.page, params.limit, params.status, params.severity, params.service]);

    // Real-time socket events
    useEffect(() => {
        const socket = getSocket();

        const createdHandler = (incident: Incident) => {
            const current = paramsRef.current;
            const limit = current.limit ?? 10;
            if (!matchesFilters(incident, current)) return;

            // Avoid duplicates if we already have it.
            if (state.data.some(i => i.id === incident.id)) return;

            // Only insert into the visible list when on the first page (newest-first list).
            if ((current.page ?? 1) === 1) {
                dispatch({ type: "INCIDENT_CREATED", payload: { incident, limit } });
                setTimeout(() => dispatch({ type: "CLEAR_TRANSIENT", payload: { kind: "new", id: incident.id } }), 1000);
            }

            // Meta becomes stale without a refetch; best-effort bump.
            if (state.meta) {
                const nextMeta = computeMetaAfterDelta(state.meta, limit, 1);
                if (nextMeta) {
                    dispatch({ type: "SET_META", payload: nextMeta });
                }
            }
        };

        const updatedHandler = (incident: Incident) => {
            const current = paramsRef.current;
            const exists = state.data.some(i => i.id === incident.id);

            if (exists && !matchesFilters(incident, current)) {
                dispatch({ type: "INCIDENT_MARK_EXITING", payload: incident.id });
                setTimeout(() => {
                    dispatch({ type: "INCIDENT_DELETED", payload: incident.id });
                    dispatch({ type: "CLEAR_TRANSIENT", payload: { kind: "exiting", id: incident.id } });
                }, 200);
                return;
            }

            if (!exists) return;
            dispatch({ type: "INCIDENT_UPDATED", payload: incident });
            setTimeout(() => dispatch({ type: "CLEAR_TRANSIENT", payload: { kind: "updated", id: incident.id } }), 800);
        };

        const deletedHandler = ({ id }: { id: string }) => {
            if (!state.data.some(i => i.id === id)) return;
            dispatch({ type: "INCIDENT_MARK_EXITING", payload: id });
            setTimeout(() => {
                dispatch({ type: "INCIDENT_DELETED", payload: id });
                dispatch({ type: "CLEAR_TRANSIENT", payload: { kind: "exiting", id } });
            }, 200);
        };

        socket.on("incident.created", createdHandler);
        socket.on("incident.updated", updatedHandler);
        socket.on("incident.deleted", deletedHandler);

        // On connect (incl. reconnect), refetch to resync with server truth.
        socket.on("connect", () => {
            void fetchIncidents();
        });

        return () => {
            socket.off("incident.created", createdHandler);
            socket.off("incident.updated", updatedHandler);
            socket.off("incident.deleted", deletedHandler);
            socket.off("connect");
        };
    }, [fetchIncidents, state.data, state.meta]);

    return { ...state, refetch: fetchIncidents };
}
