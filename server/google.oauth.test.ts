import { describe, expect, it } from "vitest";

describe("Google OAuth configuration", () => {
  it("accepts the configured client credentials at Google's token endpoint", async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured");
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: "orbit-intentionally-invalid-test-code",
      grant_type: "authorization_code",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "https://localhost/api/auth/google/callback",
    });
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    const payload = await response.json() as { error?: string; error_description?: string };

    expect(response.status).toBe(400);
    expect(payload.error).not.toBe("unauthorized_client");
    expect(payload.error).not.toBe("invalid_client");
  }, 30_000);
});
