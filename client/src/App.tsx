import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "./pages/Home";
import CaseForm from "./pages/CaseForm";
import AdminPanel from "./pages/AdminPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/case-form" component={CaseForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminPath = location.startsWith("/admin"); // Though AdminPanel seems to be a fixed overlay in current code
  const isCaseFormPath = location === "/case-form";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30">
          <main className="flex-1 overflow-x-hidden">
            <Router />
          </main>
          {!isCaseFormPath && <AdminPanel />}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
