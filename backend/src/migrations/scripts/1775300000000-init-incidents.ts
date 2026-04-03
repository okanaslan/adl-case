import { MigrationInterface, QueryRunner } from "typeorm";

export class InitIncidents1775300000000 implements MigrationInterface {
    name = "InitIncidents1775300000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION "pgcrypto"`);
        await queryRunner.query(`CREATE TYPE "incidents_severity_enum" AS ENUM ('low', 'medium', 'high', 'critical')`);
        await queryRunner.query(`CREATE TYPE "incidents_status_enum" AS ENUM ('open', 'investigating', 'resolved')`);

        await queryRunner.query(`
            CREATE TABLE "incidents" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "title" text NOT NULL,
                "description" text NOT NULL,
                "service" text NOT NULL,
                "severity" "incidents_severity_enum" NOT NULL,
                "status" "incidents_status_enum" NOT NULL DEFAULT 'open',
                "created_at" timestamptz NOT NULL DEFAULT now(),
                "updated_at" timestamptz NOT NULL DEFAULT now(),
                "deleted_at" timestamptz,
                CONSTRAINT "PK_incidents_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_incidents_created_at_desc" ON "incidents" ("created_at" DESC)`);
        await queryRunner.query(`CREATE INDEX "IDX_incidents_service" ON "incidents" ("service")`);
        await queryRunner.query(`CREATE INDEX "IDX_incidents_severity" ON "incidents" ("severity")`);
        await queryRunner.query(`CREATE INDEX "IDX_incidents_status" ON "incidents" ("status")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_incidents_status"`);
        await queryRunner.query(`DROP INDEX "IDX_incidents_severity"`);
        await queryRunner.query(`DROP INDEX "IDX_incidents_service"`);
        await queryRunner.query(`DROP INDEX "IDX_incidents_created_at_desc"`);
        await queryRunner.query(`DROP TABLE "incidents"`);
        await queryRunner.query(`DROP TYPE "incidents_status_enum"`);
        await queryRunner.query(`DROP TYPE "incidents_severity_enum"`);
    }
}
