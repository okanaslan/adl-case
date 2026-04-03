import { HttpCode, applyDecorators } from "@nestjs/common";

import { defineEndpoint } from "../../utils/endpoint.utils.js";

export const deleteIncidentEndpoint = applyDecorators(
    defineEndpoint({ method: "delete", path: ":id", skipValidation: true }),
    HttpCode(204),
);
