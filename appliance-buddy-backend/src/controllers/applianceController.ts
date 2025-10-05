import { Request, Response } from 'express';
import { db, useMockDb } from '../config/database.js';
import { appliances } from '../db/schema/appliances.js';
import { eq } from 'drizzle-orm';

// GET all appliances
export const getAllAppliances = async (req: Request, res: Response) => {
  try {
    console.log('=== GET ALL APPLIANCES ===');
    
    if (!db) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Database connection is not available'
      });
    }
    
    let allAppliances: any[];
    if (useMockDb) {
      console.log('Using mock database');
      const result: any = await db.select().from('appliances');
      allAppliances = result;
    } else {
      console.log('Using real database');
      allAppliances = await db.select().from(appliances);
    }
    
    console.log(`Found ${allAppliances.length} appliances`);
    res.status(200).json(allAppliances);
  } catch (error: any) {
    console.error('Error fetching appliances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appliances',
      message: error.message 
    });
  }
};

// GET specific appliance by ID
export const getApplianceById = async (req: Request, res: Response) => {
  try {
    console.log('=== GET APPLIANCE BY ID ===');
    const { id } = req.params;
    console.log(`Fetching appliance with id: ${id}`);
    
    if (!db) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Database connection is not available'
      });
    }
    
    let appliance: any;
    if (useMockDb) {
      console.log('Using mock database');
      const result: any = await db.select().from('appliances');
      appliance = result.find((item: any) => item.id === id);
    } else {
      console.log('Using real database');
      const result = await db.select().from(appliances).where(eq(appliances.id, id));
      appliance = result[0];
    }
    
    if (!appliance) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('Appliance found');
    res.status(200).json(appliance);
  } catch (error: any) {
    console.error('Error fetching appliance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch appliance',
      message: error.message 
    });
  }
};

// POST new appliance
export const addAppliance = async (req: Request, res: Response) => {
  try {
    console.log('=== ADD APPLIANCE REQUEST ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Content-Type:', req.headers['content-type']);
    console.log('============================');
    
    // Check if database is available
    if (!db) {
      console.log('ERROR: Database not available');
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Database connection is not available'
      });
    }
    
    const newAppliance: any = req.body;
    
    // Check if body is empty
    if (!newAppliance || Object.keys(newAppliance).length === 0) {
      console.log('ERROR: Empty request body');
      return res.status(400).json({ 
        error: 'Empty request',
        message: 'No appliance data provided'
      });
    }
    
    // Validate required fields with more flexible checking
    const name = newAppliance.name || newAppliance.applianceName || newAppliance.title;
    if (!name || name.trim() === '') {
      console.log('ERROR: Missing appliance name');
      return res.status(400).json({ 
        error: 'Missing required field',
        message: 'Appliance name is required'
      });
    }
    
    // Prepare appliance data with proper defaults
    const applianceData = {
      id: newAppliance.id || undefined,
      name: name,
      brand: newAppliance.brand || newAppliance.manufacturer || '',
      model: newAppliance.model || newAppliance.modelNumber || '',
      purchaseDate: newAppliance.purchaseDate || newAppliance.dateOfPurchase || new Date().toISOString(),
      warrantyDurationMonths: parseInt(newAppliance.warrantyDurationMonths) || parseInt(newAppliance.warrantyPeriod) || 0,
      serialNumber: newAppliance.serialNumber || newAppliance.serialNo || null,
      purchaseLocation: newAppliance.purchaseLocation || newAppliance.location || newAppliance.store || null,
      notes: newAppliance.notes || newAppliance.description || newAppliance.comments || null,
      userId: newAppliance.userId || 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Processing appliance data:', JSON.stringify(applianceData, null, 2));
    
    let result: any[];
    if (useMockDb) {
      console.log('Using mock database');
      result = await db.insert('appliances').values(applianceData).returning();
    } else {
      console.log('Using real database');
      result = await db.insert(appliances).values(applianceData).returning();
    }
    
    console.log('SUCCESS: Appliance added', JSON.stringify(result[0], null, 2));
    res.status(201).json(result[0]);
    
  } catch (error: any) {
    console.error('=== ADD APPLIANCE ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('===========================');
    
    res.status(500).json({ 
      error: 'Failed to add appliance',
      message: error.message || 'Internal server error'
    });
  }
};

// PUT update appliance
export const updateAppliance = async (req: Request, res: Response) => {
  try {
    console.log('=== UPDATE APPLIANCE ===');
    const { id } = req.params;
    console.log(`Updating appliance ${id}:`, JSON.stringify(req.body, null, 2));
    
    if (!db) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Database connection is not available'
      });
    }
    
    let result: any[];
    if (useMockDb) {
      console.log('Using mock database');
      result = await db.update('appliances').set(req.body).where({ _where: { left: { value: id } } }).returning();
    } else {
      console.log('Using real database');
      result = await db.update(appliances).set(req.body).where(eq(appliances.id, id)).returning();
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('Appliance updated successfully');
    res.status(200).json(result[0]);
  } catch (error: any) {
    console.error('Error updating appliance:', error);
    res.status(500).json({ 
      error: 'Failed to update appliance',
      message: error.message 
    });
  }
};

// DELETE appliance
export const deleteAppliance = async (req: Request, res: Response) => {
  try {
    console.log('=== DELETE APPLIANCE ===');
    const { id } = req.params;
    console.log(`Deleting appliance ${id}`);
    
    if (!db) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Database connection is not available'
      });
    }
    
    let result: any[];
    if (useMockDb) {
      console.log('Using mock database');
      result = await db.delete('appliances').where({ _where: { left: { value: id } } }).returning();
    } else {
      console.log('Using real database');
      result = await db.delete(appliances).where(eq(appliances.id, id)).returning();
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('Appliance deleted successfully');
    res.status(200).json({ 
      message: 'Appliance deleted successfully',
      deleted: result[0]
    });
  } catch (error: any) {
    console.error('Error deleting appliance:', error);
    res.status(500).json({ 
      error: 'Failed to delete appliance',
      message: error.message 
    });
  }
};