import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { MODULES } from "./constants/modules.js";

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true, cache: true }), ...MODULES],
})
export class AppModule {}
