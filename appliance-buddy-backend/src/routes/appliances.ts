import { Router } from 'express';
import { 
  getAllAppliances, 
  addAppliance, 
  updateAppliance, 
  deleteAppliance 
} from '../controllers/applianceController.js';

const router = Router();

// Log when routes are accessed
router.use((req, res, next) => {
  console.log(`Appliances router accessed: ${req.method} ${req.path}`);
  next();
});

// GET all appliances
router.get('/', (req, res, next) => {
  console.log('GET /api/appliances called');
  getAllAppliances(req, res).catch(next);
});

// POST new appliance
router.post('/', (req, res, next) => {
  console.log('POST /api/appliances called');
  addAppliance(req, res).catch(next);
});

// PUT update appliance
router.put('/:id', (req, res, next) => {
  console.log(`PUT /api/appliances/${req.params.id} called`);
  updateAppliance(req, res).catch(next);
});

// DELETE appliance
router.delete('/:id', (req, res, next) => {
  console.log(`DELETE /api/appliances/${req.params.id} called`);
  deleteAppliance(req, res).catch(next);
});

export default router;