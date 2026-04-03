import { Delete, Get, Patch, Post, Put, UsePipes, ValidationPipe, applyDecorators } from "@nestjs/common";

interface EndpointConfig {
    method: "get" | "post" | "put" | "patch" | "delete";
    path: string;
    skipValidation?: boolean;
    request?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
    };
    response?: unknown;
}

export function defineEndpoint({ skipValidation = false, ...config }: EndpointConfig): MethodDecorator {
    const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [];

    if (!skipValidation) {
        decorators.push(UsePipes(new ValidationPipe({ transform: true, whitelist: true })));
    }

    const methodDecorator = {
        get: Get,
        post: Post,
        patch: Patch,
        put: Put,
        delete: Delete,
    }[config.method];

    if (methodDecorator) {
        decorators.push(methodDecorator(config.path));
    }

    return applyDecorators(...decorators);
}
