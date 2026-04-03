import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

const ERROR_CODES: Record<number, string> = {
    400: "VALIDATION_ERROR",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY",
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === "object" && "message" in exceptionResponse && Array.isArray(exceptionResponse.message)) {
                return response.status(status).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid payload",
                        details: exceptionResponse.message.map((reason: string) => ({ reason })),
                    },
                });
            }

            const code = ERROR_CODES[status] ?? "HTTP_ERROR";
            const message = typeof exceptionResponse === "string" ? exceptionResponse : exception.message;
            return response.status(status).json({ error: { code, message } });
        }

        const err = exception instanceof Error ? exception : new Error(String(exception));
        this.logger.error(`[${request.method}] ${request.url} — ${err.message}`, err.stack);

        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
        });
    }
}
