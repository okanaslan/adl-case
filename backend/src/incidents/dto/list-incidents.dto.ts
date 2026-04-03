import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import { Severity, Status } from "../entities/incident.entity.js";

export class ListIncidentsDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(Status, { message: "status must be one of: open, investigating, resolved" })
    status?: Status;

    @IsOptional()
    @IsEnum(Severity, { message: "severity must be one of: low, medium, high, critical" })
    severity?: Severity;

    @IsOptional()
    @IsString()
    service?: string;
}
