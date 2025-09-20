import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  onAddWebsite: (url: string) => void;
}

const Sidebar = ({ onAddWebsite }: SidebarProps) => {
  const [newUrl, setNewUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      onAddWebsite(newUrl.trim());
      setNewUrl("");
      toast({
        title: "Website Added",
        description: "The website has been submitted for review.",
      });
    }
  };

  return (
    <div className="w-80 bg-sidebar-bg border-l border-border min-h-full p-6 flex flex-col justify-between">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground">Add New Website</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="Enter website URL..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full bg-background border-input"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-dark-gray"
          >
            Add
          </Button>
        </form>
      </div>
      
      <div className="pt-6 border-t border-border mt-6">
        <h3 className="text-sm font-medium text-foreground mb-3">How it works</h3>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li>• Submit a website URL for review</li>
          <li>• Our system analyzes the site</li>
          <li>• Results appear in the main feed</li>
          <li>• Help others avoid scams</li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
