
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";
import { addAdminToBus, removeAdminFromBus, getAdminsForBus } from "@/services/busTracking";
import { useAuth } from "@/contexts/auth";

interface AdminAccessManagerProps {
  busId: string;
}

const AdminAccessManager: React.FC<AdminAccessManagerProps> = ({ busId }) => {
  const [adminEmail, setAdminEmail] = useState("");
  const [authorizedAdmins, setAuthorizedAdmins] = useState<{email: string; id: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (busId) {
      loadAuthorizedAdmins();
    }
  }, [busId]);

  const loadAuthorizedAdmins = async () => {
    if (!busId) return;
    
    try {
      setIsLoading(true);
      const admins = await getAdminsForBus(busId);
      setAuthorizedAdmins(admins);
    } catch (error) {
      console.error("Error loading authorized admins:", error);
      toast.error("Failed to load authorized admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmail.trim() || !busId) return;

    try {
      setIsLoading(true);
      const success = await addAdminToBus(busId, adminEmail.trim());
      
      if (success) {
        toast.success(`Admin ${adminEmail} added successfully`);
        setAdminEmail("");
        await loadAuthorizedAdmins();
      }
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      setIsLoading(true);
      const success = await removeAdminFromBus(busId, adminId);
      
      if (success) {
        toast.success("Admin removed successfully");
        await loadAuthorizedAdmins();
      }
    } catch (error) {
      console.error("Error removing admin:", error);
      toast.error("Failed to remove admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-sm font-medium">Manage Admin Access</h3>
      
      <form onSubmit={handleAddAdmin} className="flex gap-2">
        <Input
          type="email"
          placeholder="Admin email address"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={isLoading}>
          Add Admin
        </Button>
      </form>
      
      <div className="space-y-2">
        <h4 className="text-xs text-muted-foreground">Authorized Admins</h4>
        {authorizedAdmins.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admins have access yet</p>
        ) : (
          <ul className="space-y-2">
            {authorizedAdmins.map((admin) => (
              <li 
                key={admin.id} 
                className="flex items-center justify-between p-2 bg-secondary/20 rounded-md"
              >
                <span className="text-sm">{admin.email}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveAdmin(admin.id)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminAccessManager;
