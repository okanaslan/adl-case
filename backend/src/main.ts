import { BadRequestException, ValidationError, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "./app.module.js";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter.js";

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

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const corsOrigin = process.env.CORS_ORIGIN;
    if (corsOrigin?.trim()) {
        app.enableCors({
            origin: corsOrigin.split(",").map(origin => origin.trim()),
            credentials: true,
        });
    } else {
        app.enableCors();
    }
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

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
