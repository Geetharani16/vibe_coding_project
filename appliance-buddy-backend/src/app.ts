import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { eq, desc } from 'drizzle-orm';
import { db } from './config/database.js';
import { appliances, supportContacts, maintenanceTasks, linkedDocuments } from './db/schema/index.js';
import { addMonths, differenceInDays, isBefore } from 'date-fns';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173','http://localhost:8082', 'http://localhost:3000'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Utility functions
const calculateWarrantyStatus = (purchaseDate: Date, warrantyMonths: number) => {
  const today = new Date();
  const warrantyExpiration = addMonths(purchaseDate, warrantyMonths);
  const daysDifference = differenceInDays(warrantyExpiration, today);
  
  if (daysDifference < 0) return 'Expired';
  if (daysDifference <= 30) return 'Expiring Soon';
  return 'Active';
};

const getMaintenanceStatus = (scheduledDate: Date, completedDate?: Date | null) => {
  if (completedDate) return 'Completed';
  const today = new Date();
  if (isBefore(scheduledDate, today)) return 'Overdue';
  return 'Upcoming';
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Appliance Buddy Backend is running!' 
  });
});

// Get all appliances
app.get('/api/appliances', async (req, res) => {
  try {
    console.log('=== Fetching appliances ===');
    console.log('Database connection status: Connected to Supabase');
    
    const result = await db
      .select()
      .from(appliances)
      .orderBy(desc(appliances.createdAt));

    console.log('Query executed successfully. Found:', result.length, 'appliances');
    console.log('Raw result:', result);

    const appliancesWithRelations = await Promise.all(
      result.map(async (appliance) => {
        const [contacts, tasks, documents] = await Promise.all([
          db.select().from(supportContacts).where(eq(supportContacts.applianceId, appliance.id)),
          db.select().from(maintenanceTasks).where(eq(maintenanceTasks.applianceId, appliance.id)),
          db.select().from(linkedDocuments).where(eq(linkedDocuments.applianceId, appliance.id))
        ]);

        const warrantyStatus = calculateWarrantyStatus(
          appliance.purchaseDate,
          appliance.warrantyDurationMonths
        );

        const warrantyExpiration = addMonths(appliance.purchaseDate, appliance.warrantyDurationMonths);

        const tasksWithStatus = tasks.map(task => ({
          ...task,
          status: getMaintenanceStatus(task.scheduledDate, task.completedDate),
          serviceProvider: task.serviceProviderName ? {
            name: task.serviceProviderName,
            phone: task.serviceProviderPhone,
            email: task.serviceProviderEmail,
            notes: task.serviceProviderNotes
          } : undefined
        }));

        return {
          ...appliance,
          warrantyStatus,
          warrantyExpiration: warrantyExpiration.toISOString(),
          supportContacts: contacts,
          maintenanceTasks: tasksWithStatus,
          linkedDocuments: documents
        };
      })
    );

    console.log('Processed appliances:', appliancesWithRelations.length);
    res.json(appliancesWithRelations);
  } catch (error: any) {
    console.error('=== ERROR in /api/appliances ===');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error code:', error?.code || 'No code');
    console.error('Error message:', error?.message || 'No message');
    console.error('Full error:', error);
    
    // Handle specific database errors
    if (error?.code === '42P01') {
      console.log('Tables do not exist yet, returning empty array');
      return res.json([]);
    }
    
    // Handle Supabase connection errors
    if (error?.code === 'XX000') {
      console.log('Database connection error:', error?.message);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to the database. Please check connection settings.',
        code: 'DB_CONNECTION_ERROR',
        type: 'DatabaseError'
      });
    }
    
    // Return detailed error for debugging
    res.status(500).json({ 
      error: 'Failed to fetch appliances',
      details: error?.message || 'Unknown error occurred while fetching appliances',
      code: error?.code || 'FETCH_ERROR',
      type: error?.constructor?.name || 'Unknown'
    });
  }
});
// Create appliance
app.post('/api/appliances', async (req, res) => {
  try {
    console.log('=== POST /api/appliances ===');
    console.log('Received data:', req.body);
    
    // For now, we'll use a default user ID since we don't have authentication
    // In a real app, this would come from the authenticated user
    const defaultUserId = '00000000-0000-0000-0000-000000000000'; // Temporary placeholder
    
    const result = await db
      .insert(appliances)
      .values({
        name: req.body.name,
        brand: req.body.brand,
        model: req.body.model,
        purchaseDate: new Date(req.body.purchaseDate),
        warrantyDurationMonths: req.body.warrantyDurationMonths,
        serialNumber: req.body.serialNumber || null,
        purchaseLocation: req.body.purchaseLocation || null,
        notes: req.body.notes || null,
        userId: defaultUserId, // Add the required userId field
        updatedAt: new Date()
      })
      .returning();

    console.log('Database insert result:', result);

    const createdAppliance = result[0];
    const warrantyStatus = calculateWarrantyStatus(
      createdAppliance.purchaseDate,
      createdAppliance.warrantyDurationMonths
    );

    const warrantyExpiration = addMonths(createdAppliance.purchaseDate, createdAppliance.warrantyDurationMonths);

    const responseData = {
      ...createdAppliance,
      warrantyStatus,
      warrantyExpiration: warrantyExpiration.toISOString(),
      supportContacts: [],
      maintenanceTasks: [],
      linkedDocuments: []
    };

    console.log('Sending response:', responseData);
    res.status(201).json(responseData);
  } catch (error: any) {
    console.error('=== ERROR in POST /api/appliances ===');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error code:', error?.code || 'No code');
    console.error('Error message:', error?.message || 'No message');
    console.error('Full error:', error);
    
    // If tables don't exist, return empty array
    if (error?.code === '42P01') {
      console.log('Tables do not exist yet, returning empty array');
      return res.json([]);
    }
    
    // Return detailed error for debugging
    res.status(500).json({ 
      error: 'Failed to create appliance',
      details: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE',
      type: error?.constructor?.name || 'Unknown'
    });
  }
});
// Update appliance
app.put('/api/appliances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateData: any = {
      name: req.body.name,
      brand: req.body.brand,
      model: req.body.model,
      warrantyDurationMonths: req.body.warrantyDurationMonths,
      serialNumber: req.body.serialNumber || null,
      purchaseLocation: req.body.purchaseLocation || null,
      notes: req.body.notes || null,
      updatedAt: new Date()
    };

    if (req.body.purchaseDate) {
      updateData.purchaseDate = new Date(req.body.purchaseDate);
    }

    const result = await db
      .update(appliances)
      .set(updateData)
      .where(eq(appliances.id, id))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Appliance not found' });
    }

    // Get updated appliance with relations
    const [contacts, tasks, documents] = await Promise.all([
      db.select().from(supportContacts).where(eq(supportContacts.applianceId, id)),
      db.select().from(maintenanceTasks).where(eq(maintenanceTasks.applianceId, id)),
      db.select().from(linkedDocuments).where(eq(linkedDocuments.applianceId, id))
    ]);

    const appliance = result[0];
    const warrantyStatus = calculateWarrantyStatus(
      appliance.purchaseDate,
      appliance.warrantyDurationMonths
    );

    const warrantyExpiration = addMonths(appliance.purchaseDate, appliance.warrantyDurationMonths);

    const tasksWithStatus = tasks.map(task => ({
      ...task,
      status: getMaintenanceStatus(task.scheduledDate, task.completedDate),
      serviceProvider: task.serviceProviderName ? {
        name: task.serviceProviderName,
        phone: task.serviceProviderPhone,
        email: task.serviceProviderEmail,
        notes: task.serviceProviderNotes
      } : undefined
    }));

    res.json({
      ...appliance,
      warrantyStatus,
      warrantyExpiration: warrantyExpiration.toISOString(),
      supportContacts: contacts,
      maintenanceTasks: tasksWithStatus,
      linkedDocuments: documents
    });
  // ... existing code ...
  } catch (error: any) {
    console.error('Error updating appliance:', error);
    res.status(500).json({ error: 'Failed to update appliance' });
  }
// ... existing code ...
});

// Delete appliance
app.delete('/api/appliances/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db
      .delete(appliances)
      .where(eq(appliances.id, id))
      .returning();

    if (!result.length) {
      return res.status(404).json({ error: 'Appliance not found' });
    }

    res.json({ message: 'Appliance deleted successfully' });
  // ... existing code ...
  } catch (error: any) {
    console.error('Error deleting appliance:', error);
    res.status(500).json({ error: 'Failed to delete appliance' });
  }
// ... existing code ...
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});