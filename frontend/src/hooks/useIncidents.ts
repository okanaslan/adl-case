import { useCallback, useEffect, useReducer, useRef } from "react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { Incident, ListIncidentsParams, PaginatedIncidents } from "@/types/incident";

interface State {
    data: Incident[];
    meta: PaginatedIncidents["meta"] | null;
    loading: boolean;
    error: string | null;
}

type Action =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: PaginatedIncidents }
    | { type: "FETCH_ERROR"; payload: string }
    | { type: "INCIDENT_CREATED"; payload: Incident }
    | { type: "INCIDENT_UPDATED"; payload: Incident }
    | { type: "INCIDENT_DELETED"; payload: string };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "FETCH_START":
            return { ...state, loading: true, error: null };
        case "FETCH_SUCCESS":
            return { data: action.payload.data, meta: action.payload.meta, loading: false, error: null };
        case "FETCH_ERROR":
            return { ...state, loading: false, error: action.payload };
        case "INCIDENT_CREATED":
            return { ...state, data: [action.payload, ...state.data] };
        case "INCIDENT_UPDATED":
            return { ...state, data: state.data.map(i => i.id === action.payload.id ? action.payload : i) };
        case "INCIDENT_DELETED":
            return { ...state, data: state.data.filter(i => i.id !== action.payload) };
        default:
            return state;
    }
}

const initialState: State = { data: [], meta: null, loading: true, error: null };

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

        socket.on("incident.created", (incident: Incident) => {
            dispatch({ type: "INCIDENT_CREATED", payload: incident });
        });

        socket.on("incident.updated", (incident: Incident) => {
            dispatch({ type: "INCIDENT_UPDATED", payload: incident });
        });

        socket.on("incident.deleted", ({ id }: { id: string }) => {
            dispatch({ type: "INCIDENT_DELETED", payload: id });
        });

        socket.on("reconnect", () => {
            void fetchIncidents();
        });

        return () => {
            socket.off("incident.created");
            socket.off("incident.updated");
            socket.off("incident.deleted");
            socket.off("reconnect");
        };
    }, [fetchIncidents]);

    return { ...state, refetch: fetchIncidents };
}
