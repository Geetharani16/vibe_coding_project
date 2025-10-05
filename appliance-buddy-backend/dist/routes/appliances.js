import { Router } from 'express';
import { getAllAppliances, getApplianceById, addAppliance, updateAppliance, deleteAppliance } from '../controllers/applianceController.js';
const router = Router();
// Log when routes are accessed
router.use((req, res, next) => {
    console.log(`Appliances route accessed: ${req.method} ${req.path}`);
    next();
});
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
//# sourceMappingURL=appliances.js.map