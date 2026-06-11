const request = require("supertest");
const app = require("../server");

describe("Health API", () => {
  test("should return health status", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.statusCode).toBe(200);
  });
});
