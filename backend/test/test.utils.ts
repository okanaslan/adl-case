import { BadRequestException, INestApplication, ValidationError, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";

import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter.js";
import { EventsGateway } from "../src/events/events.gateway.js";
import { TestModule } from "./test.module.js";

function flattenValidationErrors(errors: ValidationError[], parentPath = ""): Array<{ field: string; reason: string }> {
    const details: Array<{ field: string; reason: string }> = [];

    for (const error of errors) {
        const field = parentPath ? `${parentPath}.${error.property}` : error.property;

        if (error.constraints) {
            for (const reason of Object.values(error.constraints)) {
                details.push({ field, reason });
            }
        }

        if (error.children?.length) {
            details.push(...flattenValidationErrors(error.children, field));
        }
    }

    return details;
}

export async function createTestApp(): Promise<INestApplication> {
    const eventsGatewayMock = {
        emitIncidentCreated: vi.fn(),
        emitIncidentUpdated: vi.fn(),
        emitIncidentDeleted: vi.fn(),
    };

    const moduleRef = await Test.createTestingModule({
        imports: [TestModule],
    })
        .overrideProvider(EventsGateway)
        .useValue(eventsGatewayMock)
        .compile();

    const app = moduleRef.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            exceptionFactory: (errors: ValidationError[]) =>
                new BadRequestException({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid payload",
                        details: flattenValidationErrors(errors),
                    },
                }),
        }),
    );
    await app.init();

    return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
    if (!app) return;
    await app.close();
}
