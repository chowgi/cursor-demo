import { Router } from 'express';

import { getTeamsCollection } from '../db';

export const teamsRouter = Router();

teamsRouter.get('/', async (_req, res) => {
  try {
    const teams = await getTeamsCollection().find().toArray();
    res.json({
      data: teams.map((team) => ({
        id: team._id,
        name: team.name,
        description: team.description,
        createdAt: team.createdAt,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server Error';
    res.status(500).json({ message });
  }
});
