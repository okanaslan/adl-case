import { MigrationInterface, QueryRunner } from "typeorm";

export class IncidentsSearchIndex1775300001000 implements MigrationInterface {
    name = "IncidentsSearchIndex1775300001000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_incidents_search_fts"
            ON "incidents"
            USING GIN (
                to_tsvector(
                    'simple',
                    coalesce("title", '') || ' ' ||
                    coalesce("description", '') || ' ' ||
                    coalesce("service", '')
                )
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_incidents_search_fts"`);
    }
}

