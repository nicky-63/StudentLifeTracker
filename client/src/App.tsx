import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Assignments from "@/pages/assignments";
import Calendar from "@/pages/calendar";
import Notes from "@/pages/notes";
import Progress from "@/pages/progress";
import StudyGroups from "@/pages/study-groups";
import Gamification from "@/pages/gamification";
import Sidebar from "@/components/sidebar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/notes" component={Notes} />
      <Route path="/progress" component={Progress} />
      <Route path="/study-groups" component={StudyGroups} />
      <Route path="/gamification" component={Gamification} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto lg:ml-0">
            <Router />
          </main>
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
