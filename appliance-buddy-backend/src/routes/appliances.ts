import { Router } from 'express';
import { 
  getAllAppliances, 
  addAppliance, 
  updateAppliance, 
  deleteAppliance,
  getApplianceById
} from '../controllers/applianceController';

const router = Router();

// GET all appliances
router.get('/', getAllAppliances);

// GET specific appliance by ID
router.get('/:id', getApplianceById);

// POST new appliance
router.post('/', addAppliance);

// PUT update appliance
router.put('/:id', updateAppliance);

// DELETE appliance
router.delete('/:id', deleteAppliance);

export default router;