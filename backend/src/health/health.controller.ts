import { Controller } from "@nestjs/common";

import { healthEndpoint } from "./definitions/health.definition.js";

@Controller()
export class HealthController {
    @healthEndpoint
    health() {
        return { status: "ok" };
    }
}
