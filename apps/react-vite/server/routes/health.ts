import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/healthcheck', (_req, res) => {
  res.json({ ok: true });
});
