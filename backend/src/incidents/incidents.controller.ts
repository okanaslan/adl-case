import { Body, Controller, Param, Query } from "@nestjs/common";

import { createIncidentEndpoint } from "./definitions/create-incident.definition.js";
import { deleteIncidentEndpoint } from "./definitions/delete-incident.definition.js";
import { getIncidentEndpoint } from "./definitions/get-incident.definition.js";
import { listIncidentsEndpoint } from "./definitions/list-incidents.definition.js";
import { updateIncidentEndpoint } from "./definitions/update-incident.definition.js";
import { CreateIncidentDto } from "./dto/create-incident.dto.js";
import { ListIncidentsDto } from "./dto/list-incidents.dto.js";
import { UpdateIncidentDto } from "./dto/update-incident.dto.js";
import { IncidentsService } from "./incidents.service.js";

@Controller("incidents")
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) {}

    @createIncidentEndpoint
    create(@Body() dto: CreateIncidentDto) {
        return this.incidentsService.create(dto);
    }

    @listIncidentsEndpoint
    findAll(@Query() query: ListIncidentsDto) {
        return this.incidentsService.findAll(query);
    }

    @getIncidentEndpoint
    findOne(@Param("id") id: string) {
        return this.incidentsService.findOne(id);
    }

    @updateIncidentEndpoint
    update(@Param("id") id: string, @Body() dto: UpdateIncidentDto) {
        return this.incidentsService.update(id, dto);
    }

    @deleteIncidentEndpoint
    remove(@Param("id") id: string) {
        return this.incidentsService.remove(id);
    }
}
