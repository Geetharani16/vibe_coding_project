import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { appliances, InsertAppliance } from '../db/schema/appliances.js';
import { eq } from 'drizzle-orm';

// GET all appliances
export const getAllAppliances = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all appliances...');
    const allAppliances = await db.select().from(appliances);
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

// POST new appliance
export const addAppliance = async (req: Request, res: Response) => {
  try {
    console.log('Adding new appliance:', req.body);
    const newAppliance: InsertAppliance = req.body;
    
    // Validate required fields
    if (!newAppliance.name || !newAppliance.category) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name and category are required'
      });
    }
    
    const result = await db.insert(appliances).values(newAppliance).returning();
    console.log('Appliance added successfully:', result[0]);
    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error('Error adding appliance:', error);
    res.status(500).json({ 
      error: 'Failed to add appliance',
      message: error.message 
    });
  }
};

// PUT update appliance
export const updateAppliance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`Updating appliance ${id}:`, updates);
    
    const result = await db.update(appliances)
      .set(updates)
      .where(eq(appliances.id, parseInt(id)))
      .returning();
      
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('Appliance updated successfully:', result[0]);
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
    const { id } = req.params;
    
    console.log(`Deleting appliance ${id}`);
    
    const result = await db.delete(appliances)
      .where(eq(appliances.id, parseInt(id)))
      .returning();
      
    if (result.length === 0) {
      return res.status(404).json({ 
        error: 'Appliance not found',
        message: `Appliance with id ${id} not found`
      });
    }
    
    console.log('Appliance deleted successfully:', result[0]);
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