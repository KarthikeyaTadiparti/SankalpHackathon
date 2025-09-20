import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD
import Detector from "./components/detector/Detector"; // 👈 import your new page
=======
import Signup from "./pages/Signup";
import Login from "./pages/Login";
>>>>>>> 3b3413cb1c3860522764756d3d5ef48e63b7862d

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toasts can be enabled when needed */}
      {/* <Toaster />
      <Sonner /> */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
<<<<<<< HEAD
          <Route path="/detect" element={<Detector />} /> {/* 👈 new route */}
          
          {/* Catch-all route should always stay at the bottom */}
=======
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
>>>>>>> 3b3413cb1c3860522764756d3d5ef48e63b7862d
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
