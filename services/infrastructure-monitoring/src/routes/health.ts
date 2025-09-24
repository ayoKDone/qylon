/**
 * Health check routes for Infrastructure Monitoring Service
 */

import { Router } from 'express';

const router: Router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'infrastructure-monitoring',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
