import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

// Pages
import Home from "@/pages/Home";
import Features from "@/pages/Features";
import Demo from "@/pages/Demo";
import DemoAccess from "@/pages/DemoAccess";
import Signup from "@/pages/Signup";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import Security from "@/pages/Security";
import Nda from "@/pages/Nda";
import SampleFiles from "@/pages/SampleFiles";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <AnnouncementBanner />
      <main className="flex-1 pt-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/features" component={Features} />
          <Route path="/demo" component={Demo} />
          <Route path="/demo/access" component={DemoAccess} />
          <Route path="/signup" component={Signup} />
          <Route path="/contact" component={Contact} />
          <Route path="/support" component={Support} />
          <Route path="/security" component={Security} />
          <Route path="/nda" component={Nda} />
          <Route path="/samplefiles" component={SampleFiles} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
