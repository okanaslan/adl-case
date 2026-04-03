import { Get, Post, Put, Delete, UsePipes, applyDecorators, Patch } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";

interface EndpointConfig {
    isPublic?: boolean;
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
        decorators.push(UsePipes(new ValidationPipe()));
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
