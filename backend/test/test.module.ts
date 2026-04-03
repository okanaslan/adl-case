import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { MODULES } from "../src/constants/modules.js";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, cache: true, envFilePath: ".env.test" }),
        TypeOrmModule.forRootAsync({
            useFactory: async () => {
                const url = process.env.TEST_DATABASE_URL;
                if (!url) {
                    throw new Error("Missing TEST_DATABASE_URL for tests");
                }

                return {
                    type: "postgres",
                    url,
                    autoLoadEntities: true,
                    // Tests must generate schema from entities (no migrations).
                    synchronize: true,
                    dropSchema: true,
                    migrationsRun: false,
                    migrations: [],
                    retryAttempts: 1,
                    retryDelay: 0,
                };
            },
        }),
        ...MODULES,
    ],
})
export class TestModule {}
