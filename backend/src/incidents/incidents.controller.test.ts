import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Repository } from "typeorm";

import { closeTestApp, createTestApp } from "../../test/test.utils.js";
import { Incident } from "./entities/incident.entity.js";

describe("IncidentsController", () => {
    let app: INestApplication;
    let incidentRepository: Repository<Incident>;

    beforeAll(async () => {
        app = await createTestApp();
        incidentRepository = app.get("IncidentRepository");
    });

    beforeEach(async () => {
        await incidentRepository.clear();
    });

    afterAll(async () => {
        await closeTestApp(app);
    });

    it("POST /incidents creates an incident (defaults status=open)", async () => {
        const res = await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Database timeout on payment service",
                description: "Users are receiving timeout errors during checkout.",
                service: "Payment API",
                severity: "high",
            })
            .expect(201);

        expect(res.body).toMatchObject({
            title: "Database timeout on payment service",
            description: "Users are receiving timeout errors during checkout.",
            service: "Payment API",
            severity: "high",
            status: "open",
        });
        expect(typeof res.body.id).toBe("string");
        expect(typeof res.body.createdAt).toBe("string");
        expect(typeof res.body.updatedAt).toBe("string");
    });

    it("POST /incidents returns 400 for invalid payload", async () => {
        const res = await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "   ",
                description: "",
                service: "",
                severity: "unknown",
            })
            .expect(400);

        expect(res.body).toHaveProperty("error.code", "VALIDATION_ERROR");
        expect(res.body).toHaveProperty("error.message", "Invalid payload");
        expect(Array.isArray(res.body?.error?.details)).toBe(true);
    });

    it("GET /incidents returns paginated list + meta (createdAt DESC)", async () => {
        const first = await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "First",
                description: "First incident",
                service: "Auth Service",
                severity: "low",
            })
            .expect(201);

        const second = await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Second",
                description: "Second incident",
                service: "Payment API",
                severity: "medium",
            })
            .expect(201);

        const res = await request(app.getHttpServer()).get("/incidents?page=1&limit=10").expect(200);

        expect(res.body).toHaveProperty("data");
        expect(res.body).toHaveProperty("meta");
        expect(res.body.meta).toMatchObject({
            page: 1,
            limit: 10,
        });
        expect(typeof res.body.meta.totalItems).toBe("number");
        expect(typeof res.body.meta.totalPages).toBe("number");

        expect(res.body.data[0].id).toBe(second.body.id);
        expect(res.body.data[1].id).toBe(first.body.id);
    });

    it("GET /incidents supports filters (status/severity/service)", async () => {
        await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Critical payment issue",
                description: "Card payments failing",
                service: "Payment API",
                severity: "critical",
                status: "investigating",
            })
            .expect(201);

        await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Minor auth delay",
                description: "Some logins slow",
                service: "Auth Service",
                severity: "low",
                status: "open",
            })
            .expect(201);

        const res = await request(app.getHttpServer()).get("/incidents?status=investigating&severity=critical&service=Payment%20API").expect(200);

        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toMatchObject({
            service: "Payment API",
            severity: "critical",
            status: "investigating",
        });
    });

    it("GET /incidents supports full-text search via service query param", async () => {
        await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Database timeout on payment service",
                description: "Users are receiving timeout errors during checkout.",
                service: "Payment API",
                severity: "high",
            })
            .expect(201);

        await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Auth latency",
                description: "Some users are reporting slow logins",
                service: "Auth Service",
                severity: "low",
            })
            .expect(201);

        const res = await request(app.getHttpServer()).get("/incidents?service=payment").expect(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toMatchObject({ service: "Payment API" });
    });

    it("GET /incidents returns 400 for invalid pagination params", async () => {
        const res = await request(app.getHttpServer()).get("/incidents?page=0&limit=999").expect(400);
        expect(res.body).toHaveProperty("error.code", "VALIDATION_ERROR");
    });

    it("GET /incidents/:id returns 404 when not found", async () => {
        const res = await request(app.getHttpServer()).get("/incidents/00000000-0000-0000-0000-000000000000").expect(404);
        expect(res.body).toHaveProperty("error.code", "NOT_FOUND");
    });

    it("PATCH /incidents/:id updates status/severity/description", async () => {
        const created = await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Update me",
                description: "Before",
                service: "Notification Worker",
                severity: "medium",
            })
            .expect(201);

        const updated = await request(app.getHttpServer())
            .patch(`/incidents/${created.body.id}`)
            .send({ status: "resolved", severity: "high", description: "After" })
            .expect(200);

        expect(updated.body).toMatchObject({
            id: created.body.id,
            status: "resolved",
            severity: "high",
            description: "After",
        });
        expect(updated.body.updatedAt).not.toBe(created.body.updatedAt);
    });

    it("DELETE /incidents/:id returns 204 and incident is no longer visible", async () => {
        const created = await request(app.getHttpServer())
            .post("/incidents")
            .send({
                title: "Delete me",
                description: "Soon gone",
                service: "Payment API",
                severity: "low",
            })
            .expect(201);

        await request(app.getHttpServer()).delete(`/incidents/${created.body.id}`).expect(204);
        await request(app.getHttpServer()).get(`/incidents/${created.body.id}`).expect(404);

        const list = await request(app.getHttpServer()).get("/incidents?page=1&limit=100").expect(200);
        const ids = list.body.data.map((i: { id: string }) => i.id);
        expect(ids).not.toContain(created.body.id);
    });

    it("GET /incidents pagination meta matches total counts", async () => {
        for (let idx = 0; idx < 15; idx++) {
            await request(app.getHttpServer())
                .post("/incidents")
                .send({
                    title: `Incident ${idx}`,
                    description: `Desc ${idx}`,
                    service: "Auth Service",
                    severity: "medium",
                })
                .expect(201);
        }

        const page1 = await request(app.getHttpServer()).get("/incidents?page=1&limit=10").expect(200);
        expect(page1.body.data).toHaveLength(10);
        expect(page1.body.meta).toMatchObject({ page: 1, limit: 10, totalItems: 15, totalPages: 2 });

        const page2 = await request(app.getHttpServer()).get("/incidents?page=2&limit=10").expect(200);
        expect(page2.body.data).toHaveLength(5);
        expect(page2.body.meta).toMatchObject({ page: 2, limit: 10, totalItems: 15, totalPages: 2 });
    });
});
