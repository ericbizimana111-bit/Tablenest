import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  it("/api/restaurants/public (GET)", () => {
    return request(app.getHttpServer())
      .get("/api/restaurants/public")
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(expect.objectContaining({
          restaurants: expect.any(Array),
          total: expect.any(Number),
        }));
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
