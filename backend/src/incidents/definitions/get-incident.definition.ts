import { defineEndpoint } from "../../utils/endpoint.utils.js";

export const getIncidentEndpoint = defineEndpoint({
    method: "get",
    path: ":id",
    skipValidation: true,
});
