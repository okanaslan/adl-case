import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { LoggingMiddleware } from "./common/middleware/logging.middleware.js";
import { MODULES } from "./constants/modules.js";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true }),
        TypeOrmModule.forRootAsync({
            useFactory: () => ({
                type: "postgres",
                url: process.env.DATABASE_URL,
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== "production",
            }),
        }),
        ...MODULES,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggingMiddleware).forRoutes("*");
    }
}
