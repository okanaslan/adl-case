import { EventsModule } from "../events/events.module.js";
import { HealthModule } from "../health/health.module.js";
import { IncidentsModule } from "../incidents/incidents.module.js";

export const MODULES = [HealthModule, EventsModule, IncidentsModule];
