import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/role.js';
import { sendSuccess } from '../../middleware/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Role } from '../../types/enums.js';
import * as aiService from './ai.service.js';

const router = Router();

const aiRoles: Role[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK, Role.DOSEN, Role.MAHASISWA, Role.ALUMNI];

router.post('/chat', authenticate, requireRole(...aiRoles), async (req, res, next) => {
  try {
    const result = await aiService.chat(req, req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.get('/chat/history', authenticate, requireRole(...aiRoles), async (req, res, next) => {
  try {
    const result = await aiService.getHistory(req);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.delete('/chat/history', authenticate, requireRole(...aiRoles), async (req, res, next) => {
  try {
    await aiService.clearHistory(req);
    sendSuccess(res, { cleared: true });
  } catch (err) { next(err); }
});

router.post('/generate-rps', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK), async (req, res, next) => {
  try {
    const result = await aiService.generateRPS(req, req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.get('/generate-rps/history', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK), async (req, res, next) => {
  try {
    const result = await aiService.getRPSHistory(req);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.post('/plagiarism/check', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK, Role.DOSEN), async (req, res, next) => {
  try {
    const result = await aiService.checkPlagiarism(req, req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.post('/analytics/mahasiswa', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK), async (req, res, next) => {
  try {
    const result = await aiService.analyzeMahasiswa(req, req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.get('/usage', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AKADEMIK), async (req, res, next) => {
  try {
    const result = await aiService.getUsageStats(req);
    sendSuccess(res, result);
  } catch (err) { next(err); }
});

router.get('/config', authenticate, async (req, res, next) => {
  try {
    const { query } = await import('../../config/database.js');
    const { rows } = await query(
      `SELECT setting_key, setting_value FROM public.web_settings
       WHERE setting_key IN ('ai_provider','ai_model','openai_api_key','gemini_api_key','ai_daily_limit','ai_monthly_limit')`
    );
    const cfg: Record<string, string> = {};
    rows.forEach((r: any) => { cfg[r.setting_key] = r.setting_value; });
    sendSuccess(res, {
      provider: cfg['ai_provider'] || 'openai',
      model: cfg['ai_model'] || 'gpt-4o-mini',
      openaiConfigured: !!(cfg['openai_api_key'] || process.env.OPENAI_API_KEY),
      geminiConfigured: !!(cfg['gemini_api_key'] || process.env.GEMINI_API_KEY),
      dailyLimit: parseInt(cfg['ai_daily_limit'] || '100', 10),
      monthlyLimit: parseInt(cfg['ai_monthly_limit'] || '2000', 10),
    });
  } catch (err) { next(err); }
});

export default router;
