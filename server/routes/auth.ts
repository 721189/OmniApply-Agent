import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sendVerificationEmail } from '../services/email';
import { setSessionCookie, clearSessionCookie, getUserFromReq } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const result = await db.verifyUserCredentials(email, password);
  if (!result.success || !result.token) {
    return res.status(401).json({ error: result.error || 'Invalid credentials' });
  }
  setSessionCookie(res, result.token);
  res.json({
    user: result.user,
    message: 'Login successful',
  });
});

router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
  }
  const result = await db.createUser(name || email.split('@')[0], email, password);
  setSessionCookie(res, result.token);
  const emailDispatch = await sendVerificationEmail(email, result.code, name || email.split('@')[0]);
  res.status(201).json({
    user: result.user,
    emailDispatched: emailDispatch.success,
    emailProvider: emailDispatch.provider,
    message: 'Account registered successfully! Verification code dispatched to ' + email,
  });
});

router.post('/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer ')) 
    ? authHeader.split(' ')[1]?.trim() 
    : undefined;
  
  if (token) {
    await db.revokeToken(token);
  }
  clearSessionCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

router.post('/resend-code', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = await db.getUserByEmail(email);
  if (!user) return res.json({ success: true, message: `If that account exists, a verification code was sent to ${email}` });
  
  const { generateSecureVerificationCode } = await import('../services/auth');
  const code = generateSecureVerificationCode();
  user.verificationCode = code;
  user.verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await db.insertUserRecord(user);
  const emailDispatch = await sendVerificationEmail(email, code, user.name);
  res.json({ success: true, emailDispatched: emailDispatch.success, emailProvider: emailDispatch.provider, message: `New verification code sent to ${email} (expires in 15 minutes)` });
});

router.post('/verify-email', async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and verification code are required' });
  const result = await db.verifyEmail(email, code);
  if (result.success) {
    const user = await db.getUserByEmail(email);
    res.json({ success: true, user: user ? db.sanitizeUser(user) : null, message: 'Email verified successfully!' });
  } else {
    res.status(400).json({ error: result.error || 'Invalid or expired verification code.' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  res.json({ user: user || null });
});

router.patch('/profile', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  const updated = await db.updateUserProfile(user.id, req.body);
  res.json({ success: true, user: updated });
});

router.post('/change-password', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  await db.changePassword(user.id, newPassword);
  res.json({ success: true, message: 'Password updated successfully' });
});

router.get('/export-data', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  const data = await db.exportUserData(user.id);
  res.json({ success: true, data });
});

router.delete('/account', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  await db.deleteUserAccount(user.id);
  res.json({ success: true, message: 'Account and associated records purged successfully' });
});

export default router;
