/**
 * Health check routes for Event Sourcing Service
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'event-sourcing',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
