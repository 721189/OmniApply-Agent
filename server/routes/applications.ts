import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getUserFromReq } from '../middleware/auth';
import { PlatformType, JobApplication, AgentTask } from '../../src/types';
import { generateApplicationPackage } from '../services/appGenerator';
import { analyzeCandidateProfiles } from '../services/analyzer';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromReq(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized. Bearer token required.' });

    const {
      candidateAnalysis,
      jobTitle,
      companyName,
      targetPlatform,
      jobDescription,
      salaryExpectation,
      noticePeriod,
      saveImmediately,
    } = req.body as {
      candidateAnalysis: any;
      jobTitle: string;
      companyName: string;
      targetPlatform: PlatformType;
      jobDescription: string;
      salaryExpectation?: string;
      noticePeriod?: string;
      saveImmediately?: boolean;
    };

    if (!jobTitle || !companyName) {
      return res.status(400).json({ error: 'Job title and Company name are required' });
    }

    const userId = user.id;

    let candidate = candidateAnalysis;
    if (!candidate) {
      candidate = await db.getAnalysis(userId);
    }
    if (!candidate) {
      candidate = await analyzeCandidateProfiles(
        {
          github: 'https://github.com/developer',
          linkedin: 'https://linkedin.com/in/engineer',
          leetcode: 'https://leetcode.com/u/algorithms',
          substack: 'https://techwriting.substack.com',
          twitter: 'https://x.com/tech_builder',
        },
        user.name || 'Software Engineer'
      );
      candidate.userId = userId;
      await db.saveAnalysis(candidate);
    }

    const taskId = `task-appgen-${Date.now()}`;
    const workerId = `async-worker-node-${Math.floor(10 + Math.random() * 90)}`;
    const task: AgentTask = {
      taskId,
      type: 'application_generation',
      status: 'running',
      progress: 15,
      currentStage: `Tailoring Application Package for ${targetPlatform.toUpperCase()}`,
      workerId,
      createdAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Async worker task started for ${companyName} (${jobTitle})`,
          workerId,
          stage: 'Job Ingestion',
        },
      ],
    };
    await db.saveTask(task);

    const applicationPackage = await generateApplicationPackage(
      candidate,
      jobTitle,
      companyName,
      targetPlatform || 'wellfound',
      jobDescription || '',
      salaryExpectation,
      noticePeriod,
      async (progress, stage, log) => {
        task.progress = progress;
        task.currentStage = stage;
        task.logs.push(log);
        await db.saveTask(task);
      }
    );

    task.status = 'completed';
    task.progress = 100;
    task.completedAt = new Date().toISOString();
    task.result = applicationPackage;
    await db.saveTask(task);

    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const jobApplication: JobApplication = {
      id: jobId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      jobTitle,
      companyName,
      targetPlatform: targetPlatform || 'wellfound',
      jobDescription,
      salaryExpectation,
      noticePeriod,
      status: 'prepared',
      applicationPackage,
    };

    if (saveImmediately !== false) {
      await db.saveJob(jobApplication);
    }

    res.json({
      success: true,
      taskId,
      jobApplication,
      applicationPackage,
    });
  } catch (err: any) {
    console.error('Error generating application package:', err);
    res.status(500).json({ error: err.message || 'Failed to generate application package' });
  }
});

export default router;
