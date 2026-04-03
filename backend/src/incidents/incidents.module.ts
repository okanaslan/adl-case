import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { EventsModule } from "../events/events.module.js";
import { Incident } from "./entities/incident.entity.js";
import { IncidentsController } from "./incidents.controller.js";
import { IncidentsService } from "./incidents.service.js";

@Module({
    imports: [TypeOrmModule.forFeature([Incident]), EventsModule],
    controllers: [IncidentsController],
    providers: [IncidentsService],
})
export class IncidentsModule {}
