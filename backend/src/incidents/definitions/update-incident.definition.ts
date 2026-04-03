import { defineEndpoint } from "../../utils/endpoint.utils.js";

export const updateIncidentEndpoint = defineEndpoint({
    method: "patch",
    path: ":id",
});
