import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import WebsiteCard from "@/components/WebsiteCard";
import Sidebar from "@/components/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NewForm from "@/components/NewForm";
import axios from "axios";

interface WebsiteType {
  _id: string;
  websiteName: string;
  websiteUrl: string;
  feedback: string;
  rating: number;
  username: string;
  status: "Legit" | "Scam" | "Suspicious";
  createdAt: string;
}

const Index = () => {
  const [websites, setWebsites] = useState<WebsiteType[]>([]);
  const [searchResults, setSearchResults] = useState<WebsiteType[]>([]);
  const [newForm, setNewForm] = useState({ websiteUrl: "", websiteName: "", feedback: "", rating: "1" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch reviews from backend
  const fetchReviews = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/reviews", { withCredentials: true });
      setWebsites(response.data);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSearch = (query: string) => {
    const filtered = websites.filter(
      (website) =>
        website.websiteName.toLowerCase().includes(query.toLowerCase()) ||
        website.websiteUrl.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleNewFormSubmit = async (formData: { websiteUrl: string; websiteName: string; feedback: string; rating: string }) => {
    const newWebsite = {
      websiteName: formData.websiteName || new URL(formData.websiteUrl).hostname,
      websiteUrl: formData.websiteUrl,
      feedback: formData.feedback,
      rating: parseInt(formData.rating),
      username: "user", // Replace with logged-in user
    };

    try {
      const response = await axios.post("http://localhost:3000/api/reviews", newWebsite, { withCredentials: true });
      const savedWebsite = response.data;

      setWebsites([savedWebsite, ...websites]);
      setSearchResults([savedWebsite, ...searchResults]);

      // Reset form
      setNewForm({ websiteUrl: "", websiteName: "", feedback: "", rating: "1" });

      // Close dialog
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to submit new website:", err);
    }
  };

  if (loading) return <p className="text-center py-12">Loading reviews...</p>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">Check Website Legitimacy</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Verify if a website is legitimate or a potential scam
              </p>
              <SearchBar onSearch={handleSearch} />
            </div>

            <div className="flex justify-end mb-6">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-lg">
                    <Plus /> New Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a New Review</DialogTitle>
                    <DialogDescription>Enter website details below:</DialogDescription>
                  </DialogHeader>
                  <NewForm
                    onSubmit={handleNewFormSubmit}
                    onSuccess={() => setIsDialogOpen(false)}
                    userId="user-id"
                    username="username"
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((website) => (
                <WebsiteCard
                  key={website._id}
                  name={website.websiteName}
                  url={website.websiteUrl}
                  rating={website.rating}
                  status={website.status}
                  feedback={website.feedback}
                  username={website.username}
                />
              ))}
            </div>

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No websites found matching your search.</p>
              </div>
            )}
          </div>
        </main>

        <Sidebar onAddWebsite={(url: string) => {}} />
      </div>
    </div>
  );
};

export default Index;
