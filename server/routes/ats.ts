import { Router, Request, Response } from 'express';
import { generateContentWithFallback } from '../services/gemini';
import { getUserFromReq, getOrSetGuestId } from '../middleware/auth';
import { db } from '../db';
import { AtsScanResult } from '../../src/types';

export const atsRouter = Router();

atsRouter.post('/instant-scan', async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription, candidateName, targetRole } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a valid resume text (at least 20 characters).' });
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a job description (at least 20 characters) to audit against.' });
    }

    const user = await getUserFromReq(req);
    const guestId = !user ? getOrSetGuestId(req, res) : undefined;

    const prompt = `
You are an expert ATS (Applicant Tracking System) Algorithm Auditor and Principal Technical Recruiter.
Evaluate the candidate's resume against the target job description with rigorous, production-grade precision.

Candidate Resume Text:
"""
${resumeText.slice(0, 6000)}
"""

Target Job Description:
"""
${jobDescription.slice(0, 4000)}
"""

Candidate Name: ${candidateName || 'Candidate'}
Target Role: ${targetRole || 'Software Professional'}

Perform a deep semantic and keyword audit.
Return a STRICT JSON object conforming to this exact structure:
{
  "score": number (0 to 100 integer representing actual ATS parse and match score),
  "grade": string (one of "A+", "A", "B", "C", "Needs Improvement"),
  "candidateName": string,
  "targetRole": string,
  "matchedKeywords": array of strings (top 8 keywords and skills successfully found in both),
  "missingKeywords": array of strings (top 6 critical keywords/technologies demanded by the job but missing from resume),
  "strengths": array of strings (3 bullet points highlighting candidate's strong alignments),
  "criticalGaps": array of strings (3 bullet points highlighting missing experience or qualification mismatches),
  "formattingIssues": array of strings (2-3 structural or ATS parseability issues, e.g. lack of quantified metrics, table formatting risks),
  "tailoredSummaryPitch": string (a punchy 3-sentence high-signal executive pitch crafted specifically to bridge this candidate to this job),
  "estimatedCallbackProbability": string (e.g. "14% baseline ATS pass rate -> 85%+ with tailored optimization")
}
`;

    const aiResponse = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = aiResponse.text || '{}';
    let scanResult: AtsScanResult;

    try {
      scanResult = JSON.parse(responseText);
    } catch {
      // Fallback parser if markdown wrapping occurred
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      scanResult = JSON.parse(cleaned);
    }

    // Log activity if user is authenticated
    if (user) {
      await db.logActivity(
        user.id,
        `ATS Instant Scan (${scanResult.score}%)`,
        'application',
        `Scored resume for ${targetRole || 'Role'}: ${scanResult.score}% (${scanResult.grade}).`
      );
    }

    res.json({
      success: true,
      result: scanResult,
      authenticated: !!user,
      guestId,
    });
  } catch (err: any) {
    console.error('[ATS Instant Scan Error]:', err);
    res.status(500).json({ 
      error: err.message || 'Failed to complete ATS scan. Please check your inputs and try again.' 
    });
  }
});
