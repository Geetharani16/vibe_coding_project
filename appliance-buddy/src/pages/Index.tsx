import { useState, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ApplianceCard } from "@/components/ApplianceCard";
import { ApplianceForm } from "@/components/ApplianceForm";
import { useAppliances } from "@/hooks/useAppliances";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appliance } from "@/types/appliance";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const [viewingAppliance, setViewingAppliance] = useState<Appliance | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const { appliances, loading, addAppliance, updateAppliance } = useAppliances();

  // Debug logging
  console.log('🏠 INDEX PAGE - Current state:');
  console.log('   Loading:', loading);
  console.log('   Appliances count:', appliances.length);
  console.log('   Appliances data:', appliances);

  // Filter appliances by warranty status
  const filteredAppliances = useMemo(() => {
    if (activeTab === 'all') return appliances;
    
    return appliances.filter(appliance => {
      // Use the warrantyStatus from the backend if available, otherwise calculate it
      const status = appliance.warrantyStatus || 'Active';
      
      switch (activeTab) {
        case 'active':
          return status === 'Active';
        case 'expiring':
          return status === 'Expiring Soon';
        case 'expired':
          return status === 'Expired';
        default:
          return true;
      }
    });
  }, [appliances, activeTab]);

  // Count appliances by status
  const counts = useMemo(() => {
    const active = appliances.filter(a => (a.warrantyStatus || 'Active') === 'Active').length;
    const expiring = appliances.filter(a => (a.warrantyStatus || 'Active') === 'Expiring Soon').length;
    const expired = appliances.filter(a => (a.warrantyStatus || 'Active') === 'Expired').length;
    
    return { active, expiring, expired, total: appliances.length };
  }, [appliances]);

  const handleAddAppliance = async (applianceData: any) => {
    try {
      await addAppliance(applianceData);
      toast({
        title: "Success",
        description: "Appliance added successfully!",
      });
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add appliance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditAppliance = (appliance: Appliance) => {
    setEditingAppliance(appliance);
    setIsFormOpen(true);
  };

  const handleViewAppliance = (appliance: Appliance) => {
    setViewingAppliance(appliance);
    // You can implement a view modal here if needed
    console.log('Viewing appliance:', appliance);
  };

  const handleUpdateAppliance = async (applianceData: any) => {
    if (!editingAppliance) return;
    
    try {
      await updateAppliance(editingAppliance.id, applianceData);
      toast({
        title: "Success",
        description: "Appliance updated successfully!",
      });
      setIsFormOpen(false);
      setEditingAppliance(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appliance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAppliance(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Appliance Buddy
            </h1>
            <p className="text-gray-600">
              Track warranties, maintenance, and support for all your home appliances
            </p>
          </div>
          
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Add Appliance
          </Button>
        </div>

        {appliances.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appliances yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first appliance to track its warranty and maintenance.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Appliance
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  All <Badge variant="secondary">{counts.total}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="flex items-center gap-2">
                  Active <Badge variant="default">{counts.active}</Badge>
                </TabsTrigger>
                <TabsTrigger value="expiring" className="flex items-center gap-2">
                  Expiring Soon <Badge variant="secondary">{counts.expiring}</Badge>
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex items-center gap-2">
                  Expired <Badge variant="destructive">{counts.expired}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {filteredAppliances.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {activeTab === 'all' ? '' : activeTab} appliances
                    </h3>
                    <p className="text-gray-600">
                      {activeTab === 'all' 
                        ? 'Add your first appliance to get started.'
                        : `No appliances with ${activeTab} warranty status.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppliances.map((appliance) => (
                      <ApplianceCard 
                        key={appliance.id} 
                        appliance={appliance}
                        onEdit={handleEditAppliance}
                        onView={handleViewAppliance}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      
      {isFormOpen && (
        <ApplianceForm
          appliance={editingAppliance}
          onSave={editingAppliance ? handleUpdateAppliance : handleAddAppliance}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Index;