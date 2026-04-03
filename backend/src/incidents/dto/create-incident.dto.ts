import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { Severity, Status } from "../entities/incident.entity.js";

export class CreateIncidentDto {
    @IsString()
    @IsNotEmpty({ message: "title must not be empty" })
    title: string;

    @IsString()
    @IsNotEmpty({ message: "description must not be empty" })
    description: string;

    @IsString()
    @IsNotEmpty({ message: "service must not be empty" })
    service: string;

    @IsEnum(Severity, { message: "severity must be one of: low, medium, high, critical" })
    severity: Severity;

    @IsOptional()
    @IsEnum(Status, { message: "status must be one of: open, investigating, resolved" })
    status?: Status;
}
