import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { vi } from "vitest";

import { AllExceptionsFilter } from "../src/common/filters/http-exception.filter.js";
import { EventsGateway } from "../src/events/events.gateway.js";
import { TestModule } from "./test.module.js";

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
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();

    return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
    if (!app) return;
    await app.close();
}
