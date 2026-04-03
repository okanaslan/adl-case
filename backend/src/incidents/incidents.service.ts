import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { EventsGateway } from "../events/events.gateway.js";
import { CreateIncidentDto } from "./dto/create-incident.dto.js";
import { ListIncidentsDto } from "./dto/list-incidents.dto.js";
import { UpdateIncidentDto } from "./dto/update-incident.dto.js";
import { Incident } from "./entities/incident.entity.js";

@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(Incident)
        private readonly incidentRepository: Repository<Incident>,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(dto: CreateIncidentDto): Promise<Incident> {
        const incident = this.incidentRepository.create(dto);
        const saved = await this.incidentRepository.save(incident);
        this.eventsGateway.emitIncidentCreated(saved);
        return saved;
    }

    async findAll(query: ListIncidentsDto) {
        const { page = 1, limit = 10, status, severity, service } = query;

        const qb = this.incidentRepository.createQueryBuilder("incident");

        if (status) qb.andWhere("incident.status = :status", { status });
        if (severity) qb.andWhere("incident.severity = :severity", { severity });
        if (service?.trim()) {
            qb.andWhere(
                `
                to_tsvector(
                    'simple',
                    coalesce(incident.title, '') || ' ' ||
                    coalesce(incident.description, '') || ' ' ||
                    coalesce(incident.service, '')
                ) @@ websearch_to_tsquery('simple', :service)
                `,
                { service: service.trim() },
            );
        }

        qb.orderBy("incident.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit);

        const [data, totalItems] = await qb.getManyAndCount();

        return {
            data,
            meta: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        };
    }

    async findOne(id: string): Promise<Incident> {
        const incident = await this.incidentRepository.findOne({ where: { id } });
        if (!incident) throw new NotFoundException(`Incident with id ${id} not found`);
        return incident;
    }

    async update(id: string, dto: UpdateIncidentDto): Promise<Incident> {
        const incident = await this.findOne(id);
        Object.assign(incident, dto);
        const updated = await this.incidentRepository.save(incident);
        this.eventsGateway.emitIncidentUpdated(updated);
        return updated;
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.incidentRepository.softDelete(id);
        this.eventsGateway.emitIncidentDeleted(id);
    }
}
