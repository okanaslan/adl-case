import "dotenv/config";
import { DataSource } from "typeorm";

export default new DataSource({
    type: "postgres",
    synchronize: false,
    migrationsRun: false,
    entities: ["dist/**/*.entity.js"],
    url: process.env.DATABASE_URL,
    migrations: ["dist/src/migrations/scripts/*.js"],
});
