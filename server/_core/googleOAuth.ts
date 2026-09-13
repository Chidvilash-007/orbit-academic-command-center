import crypto from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { prisma } from "../prisma";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

const GOOGLE_STATE_COOKIE = "__Host-google_oauth_state";
const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function secureOrigin(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function registerGoogleOAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", (req: Request, res: Response) => {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      res.status(503).json({ error: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." });
      return;
    }
    const redirectUri = secureOrigin(typeof req.query.redirect_uri === "string" ? req.query.redirect_uri : "");
    if (!redirectUri) {
      res.status(400).json({ error: "redirect_uri must be an HTTPS URL or localhost URL" });
      return;
    }
    const nonce = crypto.randomUUID();
    const state = Buffer.from(JSON.stringify({ nonce, redirectUri })).toString("base64url");
    res.cookie(GOOGLE_STATE_COOKIE, nonce, {
      ...getSessionCookieOptions(req),
      maxAge: 10 * 60 * 1000,
    });
    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    res.redirect(`${GOOGLE_AUTHORIZE_URL}?${params.toString()}`);
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : "";
    if (!code || !state) {
      res.status(400).json({ error: "Google code and state are required" });
      return;
    }
    let parsed: { nonce?: string; redirectUri?: string } = {};
    try { parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")); } catch { parsed = {}; }
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[GOOGLE_STATE_COOKIE];
    if (!parsed.nonce || parsed.nonce !== expectedNonce) {
      res.status(403).json({ error: "Invalid Google OAuth state" });
      return;
    }
    res.clearCookie(GOOGLE_STATE_COOKIE, getSessionCookieOptions(req));
    try {
      const tokenBody = new URLSearchParams({
        code,
        client_id: ENV.googleClientId,
        client_secret: ENV.googleClientSecret,
        redirect_uri: parsed.redirectUri ?? ENV.googleRedirectUri,
        grant_type: "authorization_code",
      });
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: tokenBody });
      if (!tokenResponse.ok) throw new Error(`Google token exchange failed: ${tokenResponse.status}`);
      const token = await tokenResponse.json() as { access_token?: string };
      if (!token.access_token) throw new Error("Google access token missing");
      const userResponse = await fetch(GOOGLE_USERINFO_URL, { headers: { authorization: `Bearer ${token.access_token}` } });
      if (!userResponse.ok) throw new Error(`Google user info failed: ${userResponse.status}`);
      const profile = await userResponse.json() as { sub?: string; email?: string; name?: string; picture?: string };
      if (!profile.sub || !profile.email) throw new Error("Google profile is missing required identity fields");
      const openId = `google:${profile.sub}`;
      const existing = await prisma.user.findUnique({ where: { googleId: profile.sub } }) ?? await prisma.user.findFirst({ where: { email: profile.email } });
      const user = existing
        ? await prisma.user.update({ where: { id: existing.id }, data: { googleId: profile.sub, name: profile.name ?? existing.name, email: profile.email, image: profile.picture ?? existing.image, loginMethod: "google", lastSignedIn: new Date() } })
        : await prisma.user.create({ data: { openId, googleId: profile.sub, name: profile.name ?? "Orbit student", email: profile.email, image: profile.picture ?? null, loginMethod: "google", lastSignedIn: new Date() } });
      const sessionToken = await sdk.signSession({ openId: user.openId, appId: ENV.appId || "orbit-google", name: user.name || "Orbit student" }, { expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      res.status(500).json({ error: "Google OAuth callback failed" });
    }
  });
}
