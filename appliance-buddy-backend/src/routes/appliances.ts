import { Router } from 'express';
import { 
  getAllAppliances, 
  addAppliance, 
  updateAppliance, 
  deleteAppliance 
} from '../controllers/applianceController.js';

const router = Router();

// GET all appliances
router.get('/', getAllAppliances);

// POST new appliance
router.post('/', addAppliance);

// PUT update appliance
router.put('/:id', updateAppliance);

// DELETE appliance
router.delete('/:id', deleteAppliance);

export default router;