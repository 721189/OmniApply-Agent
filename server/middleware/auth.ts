import { Request, Response } from 'express';
import { db } from '../db';

export const parseCookies = (req: Request): Record<string, string> => {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('=')).trim();
    }
  });
  return list;
};

export const setSessionCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  res.setHeader('Set-Cookie', [
    `omniapply_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${isProd ? '; Secure' : ''}`
  ]);
};

export const clearSessionCookie = (res: Response) => {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  res.setHeader('Set-Cookie', [
    `omniapply_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${isProd ? '; Secure' : ''}`
  ]);
};

export const getUserFromReq = async (req: Request) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]?.trim();
  } else {
    const cookies = parseCookies(req);
    if (cookies.omniapply_session) {
      token = cookies.omniapply_session;
    }
  }
  if (token) {
    const userId = await db.getUserIdFromToken(token);
    if (userId) {
      const user = await db.getUserById(userId);
      if (user) {
        return db.sanitizeUser(user);
      }
    }
  }
  return null;
};
