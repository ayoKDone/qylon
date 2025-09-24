/**
 * Metrics routes for Infrastructure Monitoring Service
 */

import { Router } from 'express';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Metrics endpoint - coming soon',
    timestamp: new Date().toISOString(),
  });
});

export default router;
