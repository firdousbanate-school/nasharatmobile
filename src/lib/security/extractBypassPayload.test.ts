import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { extractBypassPayload } from "./extractBypassPayload";

describe("extractBypassPayload", () => {
  it("never reads the secret from the query string, only the clear flag", async () => {
    const req = new NextRequest("http://localhost:3000/api/bypass?secret=foo&clear=1");
    const payload = await extractBypassPayload(req);
    expect(payload.secret).toBeNull();
    expect(payload.clear).toBe(true);
  });

  it("extracts secret from the x-bypass-secret header", async () => {
    const req = new NextRequest("http://localhost:3000/api/bypass", {
      headers: { "x-bypass-secret": "header-secret" },
    });
    const payload = await extractBypassPayload(req);
    expect(payload.secret).toBe("header-secret");
    expect(payload.clear).toBe(false);
  });

  it("extracts secret and clear from POST JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/bypass", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret: "body-secret", clear: true }),
    });
    const payload = await extractBypassPayload(req);
    expect(payload.secret).toBe("body-secret");
    expect(payload.clear).toBe(true);
  });
});
