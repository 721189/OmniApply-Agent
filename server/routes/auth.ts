import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sendVerificationEmail, EmailSendResult } from '../services/email';
import { setSessionCookie, clearSessionCookie, getUserFromReq, parseCookies } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const result = await db.verifyUserCredentials(email, password);
    if (!result.success || !result.token) {
      return res.status(401).json({ error: result.error || 'Invalid credentials' });
    }
    setSessionCookie(res, result.token);
    return res.json({
      user: result.user,
      message: 'Login successful',
    });
  } catch (err: any) {
    console.error('[Auth Route Login Error]:', err);
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }
    const result = await db.createUser(name || email.split('@')[0], email, password);
    setSessionCookie(res, result.token);

    let emailDispatch: EmailSendResult = { success: false, provider: 'none' };
    try {
      emailDispatch = await sendVerificationEmail(email, result.code, name || email.split('@')[0]);
    } catch (emailErr) {
      console.info('[Email Dispatch Notice]:', emailErr);
    }

    const isDevOrSandbox = !emailDispatch.success || process.env.NODE_ENV !== 'production';

    return res.status(200).json({
      user: result.user,
      emailDispatched: emailDispatch.success,
      emailProvider: emailDispatch.provider,
      code: isDevOrSandbox ? result.code : undefined,
      message: emailDispatch.success
        ? 'Account registered successfully! Verification code dispatched to ' + email
        : (emailDispatch.sandboxNotice 
            ? `Account registered! ${emailDispatch.sandboxNotice}`
            : `Account registered successfully! Verification code: ${result.code}`),
    });
  } catch (err: any) {
    console.info('[Auth Route Register Notice]:', err?.message || err);
    return res.status(500).json({ error: err.message || 'Failed to create account. Please try again.' });
  }
});

router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const cookies = parseCookies(req);
    const token = (authHeader && authHeader.startsWith('Bearer ')) 
      ? authHeader.split(' ')[1]?.trim() 
      : cookies.omniapply_session;
    
    if (token) {
      await db.revokeToken(token);
    }
    clearSessionCookie(res);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err: any) {
    clearSessionCookie(res);
    return res.json({ success: true, message: 'Logged out' });
  }
});

router.post('/resend-code', async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await db.getUserByEmail(email);
    if (!user) return res.json({ success: true, message: `If that account exists, a verification code was sent to ${email}` });
    
    const { generateSecureVerificationCode } = await import('../services/auth');
    const code = generateSecureVerificationCode();
    user.verificationCode = code;
    user.verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await db.insertUserRecord(user);
    const emailDispatch = await sendVerificationEmail(email, code, user.name);
    const isDevOrSandbox = !emailDispatch.success || process.env.NODE_ENV !== 'production';
    return res.json({ 
      success: true, 
      emailDispatched: emailDispatch.success, 
      emailProvider: emailDispatch.provider, 
      code: isDevOrSandbox ? code : undefined,
      message: emailDispatch.success 
        ? `New verification code sent to ${email} (expires in 15 minutes)` 
        : (emailDispatch.sandboxNotice
            ? `New verification code: ${code} (${emailDispatch.sandboxNotice})`
            : `New verification code: ${code} (Simulated for testing)`)
    });
  } catch (err: any) {
    console.info('[Auth Route Resend Code Notice]:', err?.message || err);
    return res.status(500).json({ error: err.message || 'Failed to resend code' });
  }
});

router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: 'Email and verification code are required' });
    const result = await db.verifyEmail(email, code);
    if (result.success) {
      const user = await db.getUserByEmail(email);
      return res.json({ success: true, user: user ? db.sanitizeUser(user) : null, message: 'Email verified successfully!' });
    } else {
      return res.status(400).json({ error: result.error || 'Invalid or expired verification code.' });
    }
  } catch (err: any) {
    console.error('[Auth Route Verify Email Error]:', err);
    return res.status(500).json({ error: err.message || 'Verification failed' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    return res.json({ user: user || null });
  } catch (err: any) {
    return res.json({ user: null });
  }
});

router.patch('/profile', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
    const updated = await db.updateUserProfile(user.id, req.body);
    return res.json({ success: true, user: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
});

router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    await db.changePassword(user.id, newPassword);
    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update password' });
  }
});

router.get('/export-data', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
    const data = await db.exportUserData(user.id);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to export data' });
  }
});

router.delete('/account', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
    await db.deleteUserAccount(user.id);
    clearSessionCookie(res);
    return res.json({ success: true, message: 'Account and associated records purged successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete account' });
  }
});

export default router;
