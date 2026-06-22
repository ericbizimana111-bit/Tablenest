import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import * as helmet from "helmet";
import * as rateLimit from "express-rate-limit";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: false });

    app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" });

    // Security
    app.use(
        (helmet as any).default ? (helmet as any).default() : (helmet as any)(),
    );

    // Rate limiting
    app.use(
        (rateLimit as any).default
            ? (rateLimit as any).default({ windowMs: 15 * 60 * 1000, max: 200 })
            : (rateLimit as any)({ windowMs: 15 * 60 * 1000, max: 200 }),
    );

    // CORS
    app.enableCors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    // Global validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    app.setGlobalPrefix("api");

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`TableNest API running on http://localhost:${port}/api`);
}

void bootstrap();
