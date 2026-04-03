import { Logger } from "@nestjs/common";
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

import { Incident } from "../incidents/entities/incident.entity.js";

const corsOrigin = process.env.CORS_ORIGIN;
@WebSocketGateway({
    cors: {
        origin: corsOrigin?.trim() ? corsOrigin.split(",").map(origin => origin.trim()) : "*",
        credentials: Boolean(corsOrigin?.trim()),
    },
})
export class EventsGateway implements OnGatewayInit {
    @WebSocketServer()
    private server: Server;

    private readonly logger = new Logger(EventsGateway.name);

    afterInit() {
        this.logger.log("WebSocket gateway initialized");
    }

    emitIncidentCreated(incident: Incident) {
        this.server.emit("incident.created", incident);
    }

    emitIncidentUpdated(incident: Incident) {
        this.server.emit("incident.updated", incident);
    }

    emitIncidentDeleted(id: string) {
        this.server.emit("incident.deleted", { id });
    }
}
