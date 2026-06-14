import { Router } from 'express';

import { getTeamsCollection } from '../db';
import { serializeTeam } from '../serialize';

export const teamsRouter = Router();

teamsRouter.get('/teams', async (_req, res) => {
  try {
    const teams = getTeamsCollection();
    const result = await teams.find().toArray();
    res.json({ data: result.map(serializeTeam) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
