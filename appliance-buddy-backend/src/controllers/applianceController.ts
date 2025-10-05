import { Request, Response } from 'express';
import { db, useMockDb } from '../config/database';
import { appliances } from '../db/schema';

// GET all appliances
export const getAllAppliances = async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }

  try {
    let result;
    if (useMockDb) {
      result = await db.select().from('appliances');
    } else {
      result = await db.select().from(appliances);
    }
    
    res.status(200).json(result);
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
  if (!db) {
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }

  try {
    const { id } = req.params;
    
    let result;
    if (useMockDb) {
      result = await db.select().from('appliances').where({ id }).limit(1);
    } else {
      result = await db.select().from(appliances).where({ id: parseInt(id) }).limit(1);
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with ID ${id} not found`
      });
    }
    
    res.status(200).json(result[0]);
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
  // Check if database is available
  if (!db) {
    console.log('addAppliance: Database not available');
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }
  
  try {
    console.log('addAppliance: Request received');
    console.log('addAppliance: Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('addAppliance: Request body:', JSON.stringify(req.body, null, 2));
    console.log('addAppliance: Content type:', req.headers['content-type']);
    
    const newAppliance: any = req.body;
    
    // Log the exact data being received
    console.log('addAppliance: Raw data received:', JSON.stringify(newAppliance, null, 2));
    
    // Check if body is empty
    if (!newAppliance || Object.keys(newAppliance).length === 0) {
      console.log('addAppliance: Empty request body received');
      return res.status(400).json({ 
        error: 'Empty request',
        message: 'No appliance data provided in request body'
      });
    }
    
    // Transform data to match expected format if needed
    const transformedAppliance: any = {
      id: newAppliance.id || undefined,
      name: newAppliance.name || newAppliance.applianceName || newAppliance.title || '',
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
      try {
        result = await db.insert('appliances').values(transformedAppliance).returning();
        console.log('addAppliance: Mock DB insert result:', result);
      } catch (mockError: any) {
        console.error('addAppliance: Mock DB insert error:', mockError);
        console.error('addAppliance: Mock DB insert error stack:', mockError.stack);
        throw mockError;
      }
    } else {
      console.log('addAppliance: Using real database');
      result = await db.insert(appliances).values(transformedAppliance).returning();
    }
    
    console.log('addAppliance: Appliance added successfully:', result[0]);
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('addAppliance: Error adding appliance:', error);
    console.error('addAppliance: Error stack:', error.stack);
    console.error('addAppliance: Error name:', error.name);
    console.error('addAppliance: Error message:', error.message);
    
    // Send more detailed error response
    res.status(500).json({ 
      error: 'Failed to add appliance',
      message: error.message,
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
};

// PUT update appliance
export const updateAppliance = async (req: Request, res: Response) => {
  if (!db) {
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }

  try {
    const { id } = req.params;
    const updateData: any = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdAt;
    updateData.updatedAt = new Date().toISOString();
    
    let result;
    if (useMockDb) {
      result = await db.update('appliances').set(updateData).where({ id }).returning();
    } else {
      result = await db.update(appliances).set(updateData).where({ id: parseInt(id) }).returning();
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with ID ${id} not found`
      });
    }
    
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
  if (!db) {
    return res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Database connection is not available. Please check the service status.'
    });
  }

  try {
    const { id } = req.params;
    
    let result;
    if (useMockDb) {
      result = await db.delete('appliances').where({ id }).returning();
    } else {
      result = await db.delete(appliances).where({ id: parseInt(id) }).returning();
    }
    
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with ID ${id} not found`
      });
    }
    
    res.status(200).json({ message: 'Appliance deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting appliance:', error);
    res.status(500).json({ 
      error: 'Failed to delete appliance',
      message: error.message
    });
  }
};