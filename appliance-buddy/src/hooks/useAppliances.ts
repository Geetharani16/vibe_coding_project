import { useState, useEffect } from 'react';
import { Appliance } from '@/types/appliance';

const API_BASE_URL = 'https://appliance-buddy-backend.onrender.com';

// ... existing code ...

export const useAppliances = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
  try {
    setLoading(true);
    console.log('=== FRONTEND: Starting to fetch appliances ===');
    console.log('API URL:', `${API_BASE_URL}/appliances`);
    
    const response = await fetch(`${API_BASE_URL}/appliances`);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Raw response data:', data);
    console.log('Number of appliances received:', data.length);
    
    const parsedAppliances = data.map((appliance: any) => ({
      ...appliance,
      purchaseDate: new Date(appliance.purchaseDate),
      warrantyExpiration: new Date(appliance.warrantyExpiration),
      maintenanceTasks: appliance.maintenanceTasks?.map((task: any) => ({
        ...task,
        scheduledDate: new Date(task.scheduledDate),
        completedDate: task.completedDate ? new Date(task.completedDate) : undefined
      })) || []
    }));
    
    console.log('Parsed appliances:', parsedAppliances);
    console.log('Setting appliances in state...');
    setAppliances(parsedAppliances);
  } catch (error) {
    console.error('=== FRONTEND ERROR: Failed to fetch appliances ===');
    console.error('Error details:', error);
    setAppliances([]);
  } finally {
    setLoading(false);
  }
};

  const addAppliance = async (appliance: Omit<Appliance, 'id' | 'supportContacts' | 'maintenanceTasks' | 'linkedDocuments'>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appliances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(appliance)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newAppliance = await response.json();
      
      const parsedNewAppliance = {
        ...newAppliance,
        purchaseDate: new Date(newAppliance.purchaseDate),
        warrantyExpiration: new Date(newAppliance.warrantyExpiration),
        maintenanceTasks: newAppliance.maintenanceTasks?.map((task: any) => ({
          ...task,
          scheduledDate: new Date(task.scheduledDate),
          completedDate: task.completedDate ? new Date(task.completedDate) : undefined
        })) || []
      };
      
      setAppliances(prev => [...prev, parsedNewAppliance]);
      return parsedNewAppliance;
    } catch (error) {
      console.error('Failed to add appliance:', error);
      throw error;
    }
  };

  const updateAppliance = async (id: string, updates: Partial<Appliance>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appliances/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedAppliance = await response.json();
      
      const parsedUpdatedAppliance = {
        ...updatedAppliance,
        purchaseDate: new Date(updatedAppliance.purchaseDate),
        warrantyExpiration: new Date(updatedAppliance.warrantyExpiration),
        maintenanceTasks: updatedAppliance.maintenanceTasks?.map((task: any) => ({
          ...task,
          scheduledDate: new Date(task.scheduledDate),
          completedDate: task.completedDate ? new Date(task.completedDate) : undefined
        })) || []
      };
      
      setAppliances(prev => prev.map(app => app.id === id ? parsedUpdatedAppliance : app));
      return parsedUpdatedAppliance;
    } catch (error) {
      console.error('Failed to update appliance:', error);
      throw error;
    }
  };

  const deleteAppliance = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/appliances/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setAppliances(prev => prev.filter(app => app.id !== id));
    } catch (error) {
      console.error('Failed to delete appliance:', error);
      throw error;
    }
  };

  const resetToSampleData = () => {
    setAppliances([]);
  };

  return {
    appliances,
    loading,
    addAppliance,
    updateAppliance,
    deleteAppliance,
    resetToSampleData
  };
};