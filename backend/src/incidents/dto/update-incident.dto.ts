import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { Severity, Status } from "../entities/incident.entity.js";

export class UpdateIncidentDto {
    @IsOptional()
    @IsEnum(Status, { message: "status must be one of: open, investigating, resolved" })
    status?: Status;

    @IsOptional()
    @IsEnum(Severity, { message: "severity must be one of: low, medium, high, critical" })
    severity?: Severity;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: "description must not be empty" })
    description?: string;
}
