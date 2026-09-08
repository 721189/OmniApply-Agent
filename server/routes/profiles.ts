import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getUserFromReq } from '../middleware/auth';
import { ProfileUrls, AgentTask } from '../../src/types';
import { analyzeCandidateProfiles } from '../services/analyzer';

const router = Router();

router.get('/urls', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  const urls = await db.getUserUrls(user.id);
  res.json({ urls: urls || null });
});

router.post('/urls', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  const { urls } = req.body as { urls: ProfileUrls };
  if (urls) {
    await db.saveUserUrls(user.id, urls);
  }
  res.json({ success: true, urls });
});

router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });

    const { urls, userName } = req.body as { urls: ProfileUrls; userName?: string };
    const name = userName || user.name || 'Engineer';

    const taskId = `task-analysis-${Date.now()}`;
    const workerId = `async-worker-node-${Math.floor(10 + Math.random() * 90)}`;
    const task: AgentTask = {
      taskId,
      type: 'profile_analysis',
      status: 'running',
      progress: 10,
      currentStage: 'Initializing Multi-Platform Scraping Agent',
      workerId,
      createdAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Async worker task dispatched on priority application queue`,
          workerId,
          stage: 'Task Queued',
        },
      ],
    };
    await db.saveTask(task);

    const analysis = await analyzeCandidateProfiles(
      urls || {
        linkedin: 'https://linkedin.com/in/alexrivera-tech',
        github: 'https://github.com/alexrivera-dev',
        leetcode: 'https://leetcode.com/u/alex_algorithms',
        substack: 'https://systemsengineering.substack.com',
        twitter: 'https://x.com/alexrivera_codes',
      },
      name,
      async (progress, stage, log) => {
        task.progress = progress;
        task.currentStage = stage;
        task.logs.push(log);
        await db.saveTask(task);
      }
    );

    analysis.userId = user.id;
    await db.saveAnalysis(analysis);
    await db.logActivity(analysis.userId, 'Generated Candidate Analysis', 'profile', `Analyzed profiles for ${analysis.fullName}`);

    task.status = 'completed';
    task.progress = 100;
    task.completedAt = new Date().toISOString();
    task.result = analysis;
    await db.saveTask(task);

    res.json({ success: true, taskId, analysis });
  } catch (err: any) {
    console.error('Error analyzing candidate profiles:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze profiles' });
  }
});

router.get('/analysis', async (req: Request, res: Response) => {
  const user = await getUserFromReq(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });
  const analysis = await db.getAnalysis(user.id);
  res.json({ analysis: analysis || null });
});

export default router;
