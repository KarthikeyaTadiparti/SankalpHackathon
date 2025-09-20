import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">About ScamCheck</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              ScamCheck is a community-driven platform dedicated to protecting users from online scams and fraudulent websites.
            </p>
            
            <p>
              Our mission is to create a safer internet by providing real-time information about website legitimacy, 
              helping users make informed decisions before sharing personal information or making purchases online.
            </p>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">How It Works</h2>
            
            <ul className="space-y-3">
              <li>• <strong>Community Reports:</strong> Users submit websites for review and verification</li>
              <li>• <strong>Automated Analysis:</strong> Our system analyzes website characteristics and patterns</li>
              <li>• <strong>Expert Review:</strong> Security experts validate findings and provide ratings</li>
              <li>• <strong>Real-time Updates:</strong> Information is continuously updated as new data becomes available</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">Stay Safe Online</h2>
            
            <p>
              Always verify websites before entering personal information, making purchases, or downloading files. 
              When in doubt, check with ScamCheck or search for reviews from other users.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;