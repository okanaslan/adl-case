import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        hookTimeout: 30_000,
        testTimeout: 30_000,
        maxWorkers: 1,
        maxConcurrency: 1,
        exclude: ["dist", "node_modules"],
        coverage: {
            reporter: ["text", "lcov"],
            include: ["src/**/*.ts"],
            exclude: ["src/**/*.entity.ts", "src/migrations/**", "src/index.ts"],
        },
    },
    plugins: [swc.vite()],
});
