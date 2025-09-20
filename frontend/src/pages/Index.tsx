import { useState } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import WebsiteCard from "@/components/WebsiteCard";
import Sidebar from "@/components/Sidebar";

// Mock data for demonstration
const mockWebsites = [
  {
    id: 1,
    name: "Amazon",
    url: "https://amazon.com",
    rating: 5,
    status: "Legit" as const,
  },
  {
    id: 2,
    name: "Fake Shopping Site",
    url: "https://fake-deals-now.com",
    rating: 1,
    status: "Scam" as const,
  },
  {
    id: 3,
    name: "Unknown Marketplace",
    url: "https://quick-buy-store.net",
    rating: 3,
    status: "Suspicious" as const,
  },
  {
    id: 4,
    name: "PayPal",
    url: "https://paypal.com",
    rating: 5,
    status: "Legit" as const,
  },  
  {
    id: 5,
    name: "Suspicious Investment",
    url: "https://get-rich-quick.info",
    rating: 2,
    status: "Suspicious" as const,
  },
  {
    id: 6,
    name: "Phishing Bank Site",
    url: "https://bank-login-secure.tk",
    rating: 1,
    status: "Scam" as const,
  },
];

const Index = () => {
  const [websites, setWebsites] = useState(mockWebsites);
  const [searchResults, setSearchResults] = useState(mockWebsites);

  const handleSearch = (query: string) => {
    const filtered = websites.filter(
      (website) =>
        website.name.toLowerCase().includes(query.toLowerCase()) ||
        website.url.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleAddWebsite = (url: string) => {
    const newWebsite = {
      id: websites.length + 1,
      name: new URL(url).hostname,
      url: url,
      rating: 0,
      status: "Suspicious" as const,
    };
    setWebsites([newWebsite, ...websites]);
    setSearchResults([newWebsite, ...searchResults]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Search Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Check Website Legitimacy
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Verify if a website is legitimate or a potential scam
              </p>
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((website) => (
                <WebsiteCard
                  key={website.id}
                  name={website.name}
                  url={website.url}
                  rating={website.rating}
                  status={website.status}
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

        {/* Sidebar */}
        <Sidebar onAddWebsite={handleAddWebsite} />
      </div>
    </div>
  );
};

export default Index;