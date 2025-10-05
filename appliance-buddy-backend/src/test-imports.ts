// Test file to check if imports work correctly
import { getAllAppliances } from './controllers/applianceController.js';
import applianceRoutes from './routes/appliances.js';

console.log('Imports working correctly');
console.log('getAllAppliances:', typeof getAllAppliances);
console.log('applianceRoutes:', typeof applianceRoutes);