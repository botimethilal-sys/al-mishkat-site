import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SubjectsIndex from "@/pages/subjects/index";
import SubjectDetail from "@/pages/subjects/[subjectId]";
import PillarsList from "@/pages/pillars/index";
import PillarDetail from "@/pages/pillars/[pillarId]";
import Search from "@/pages/search";
import Quiz from "@/pages/quiz/[subjectId]/[quizId]";
import Admin from "@/pages/admin";
import Saved from "@/pages/saved";
import Library from "@/pages/library";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/subjects" component={SubjectsIndex} />
      <Route path="/subjects/:subjectId" component={SubjectDetail} />
      <Route path="/pillars" component={PillarsList} />
      <Route path="/pillars/:pillarId" component={PillarDetail} />
      <Route path="/search" component={Search} />
      <Route path="/quiz/:subjectId/:quizId" component={Quiz} />
      <Route path="/admin" component={Admin} />
      <Route path="/saved" component={Saved} />
      <Route path="/library" component={Library} />
      <Route component={NotFound} />
    </Switch>
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
