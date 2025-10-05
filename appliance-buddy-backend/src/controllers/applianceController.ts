import { Request, Response } from 'express';
import { db, useMockDb } from '../config/database.js';
import { appliances } from '../db/schema/appliances.js';
import { eq } from 'drizzle-orm';

// Define the type for inserting appliances
type InsertAppliance = typeof appliances.$inferSelect;
type SelectAppliance = typeof appliances.$inferSelect;

// GET all appliances
export const getAllAppliances = async (req: Request, res: Response) => {
  // Check if database is available
  if (!db) {
    console.log('getAllAppliances: Database not available');
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }
  
  try {
    console.log('getAllAppliances: Fetching all appliances...');
    let allAppliances;
    
    if (useMockDb) {
      console.log('getAllAppliances: Using mock database');
      const result = await db.select().from('appliances');
      allAppliances = result;
      console.log('getAllAppliances: Mock DB returned:', result);
    } else {
      console.log('getAllAppliances: Using real database');
      allAppliances = await db.select().from(appliances);
    }
    
    console.log(`getAllAppliances: Found ${allAppliances.length} appliances`);
    res.status(200).json(allAppliances);
  } catch (error: any) {
    console.error('getAllAppliances: Error fetching appliances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appliances',
      message: error.message 
    });
  }
};

// GET specific appliance by ID
export const getApplianceById = async (req: Request, res: Response) => {
  // Check if database is available
  if (!db) {
    console.log('getApplianceById: Database not available');
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }
  
  try {
    const { id } = req.params;
    console.log(`getApplianceById: Fetching appliance with id: ${id}`);
    
    let appliance;
    if (useMockDb) {
      console.log('getApplianceById: Using mock database');
      const result = await db.select().from('appliances');
      console.log('getApplianceById: Mock DB returned all appliances:', result);
      appliance = result.find((item: any) => item.id === id);
      console.log(`getApplianceById: Found appliance:`, appliance);
    } else {
      console.log('getApplianceById: Using real database');
      const result = await db.select().from(appliances).where(eq(appliances.id, id));
      appliance = result[0];
    }
    
    if (!appliance) {
      console.log(`getApplianceById: Appliance with id ${id} not found`);
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('getApplianceById: Appliance found:', appliance);
    res.status(200).json(appliance);
  } catch (error: any) {
    console.error('getApplianceById: Error fetching appliance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appliance',
      message: error.message 
    });
  }
};

// POST new appliance
export const addAppliance = async (req: Request, res: Response) => {
  // Check if database is available
  if (!db) {
    console.log('addAppliance: Database not available');
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }
  
  try {
    console.log('addAppliance: Adding new appliance:', req.body);
    const newAppliance: any = req.body;
    
    // Log the exact data being received
    console.log('addAppliance: Raw data received:', JSON.stringify(newAppliance, null, 2));
    
    // Transform data to match expected format if needed
    const transformedAppliance: any = {
      id: newAppliance.id || undefined,
      name: newAppliance.name || newAppliance.applianceName || '',
      brand: newAppliance.brand || '',
      model: newAppliance.model || '',
      purchaseDate: newAppliance.purchaseDate || newAppliance.dateOfPurchase || new Date(),
      warrantyDurationMonths: newAppliance.warrantyDurationMonths || newAppliance.warrantyPeriod || 0,
      serialNumber: newAppliance.serialNumber || newAppliance.serialNo || null,
      purchaseLocation: newAppliance.purchaseLocation || newAppliance.location || null,
      notes: newAppliance.notes || newAppliance.description || null,
      userId: newAppliance.userId || 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('addAppliance: Transformed data:', JSON.stringify(transformedAppliance, null, 2));
    
    // Validate required fields (be more flexible)
    if (!transformedAppliance.name || transformedAppliance.name.trim() === '') {
      console.log('addAppliance: Name is required');
      return res.status(400).json({ 
        error: 'Missing required field',
        message: 'Appliance name is required'
      });
    }
    
    let result;
    if (useMockDb) {
      console.log('addAppliance: Using mock database');
      result = await db.insert('appliances').values(transformedAppliance).returning();
      console.log('addAppliance: Mock DB insert result:', result);
    } else {
      console.log('addAppliance: Using real database');
      result = await db.insert(appliances).values(transformedAppliance).returning();
    }
    
    console.log('addAppliance: Appliance added successfully:', result[0]);
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('addAppliance: Error adding appliance:', error);
    console.error('addAppliance: Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to add appliance',
      message: error.message 
    });
  }
};

// PUT update appliance
export const updateAppliance = async (req: Request, res: Response) => {
  // Check if database is available
  if (!db) {
    console.log('updateAppliance: Database not available');
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }
  
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`updateAppliance: Updating appliance ${id}:`, updates);
    
    let result;
    if (useMockDb) {
      console.log('updateAppliance: Using mock database');
      result = await db.update('appliances').set({ ...updates, id }).where({ _where: { left: { value: id } } }).returning();
      console.log('updateAppliance: Mock DB update result:', result);
    } else {
      console.log('updateAppliance: Using real database');
      result = await db.update(appliances).set(updates).where(eq(appliances.id, id)).returning();
    }
    
    if (result.length === 0) {
      console.log(`updateAppliance: Appliance with id ${id} not found`);
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('updateAppliance: Appliance updated successfully:', result[0]);
    res.status(200).json(result[0]);
  } catch (error: any) {
    console.error('updateAppliance: Error updating appliance:', error);
    res.status(500).json({ 
      error: 'Failed to update appliance',
      message: error.message 
    });
  }
};

// DELETE appliance
export const deleteAppliance = async (req: Request, res: Response) => {
  // Check if database is available
  if (!db) {
    console.log('deleteAppliance: Database not available');
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }
  
  try {
    const { id } = req.params;
    
    console.log(`deleteAppliance: Deleting appliance ${id}`);
    
    let result;
    if (useMockDb) {
      console.log('deleteAppliance: Using mock database');
      result = await db.delete('appliances').where({ _where: { left: { value: id } } }).returning();
      console.log('deleteAppliance: Mock DB delete result:', result);
    } else {
      console.log('deleteAppliance: Using real database');
      result = await db.delete(appliances).where(eq(appliances.id, id)).returning();
    }
    
    if (result.length === 0) {
      console.log(`deleteAppliance: Appliance with id ${id} not found`);
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('deleteAppliance: Appliance deleted successfully:', result[0]);
    res.status(200).json({ 
      message: 'Appliance deleted successfully',
      deleted: result[0]
    });
  } catch (error: any) {
    console.error('deleteAppliance: Error deleting appliance:', error);
    res.status(500).json({ 
      error: 'Failed to delete appliance',
      message: error.message 
    });
  }
};