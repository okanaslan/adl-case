import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MODULES } from "../src/constants/modules.js";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath: ".env.test" }),
        TypeOrmModule.forRootAsync({
            useFactory: async () => {
                const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
                if (!url) {
                    throw new Error("Missing TEST_DATABASE_URL (or DATABASE_URL) for tests");
                }

                return {
                    type: "postgres",
                    url,
                    autoLoadEntities: true,
                    synchronize: true,
                    dropSchema: true,
                    retryAttempts: 1,
                    retryDelay: 0,
                };
            },
        }),
        ...MODULES,
    ],
})
export class TestModule {}
