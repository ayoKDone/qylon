/**
 * Dashboards routes for Infrastructure Monitoring Service
 */

import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Dashboards endpoint - coming soon',
    timestamp: new Date().toISOString(),
  });
});

export default router;
