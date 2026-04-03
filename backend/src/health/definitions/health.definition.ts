import { defineEndpoint } from "../../utils/endpoint.utils.js";

export const healthEndpoint = defineEndpoint({
    method: "get",
    path: "health",
    skipValidation: true,
    response: { status: "ok" },
});
