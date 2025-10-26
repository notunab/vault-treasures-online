import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Categories from "./pages/Categories";
import CategoryItems from "./pages/CategoryItems";
import ItemDetails from "./pages/ItemDetails";
import Auctions from "./pages/Auctions";
import Celebrity from "./pages/Celebrity";
import Verify from "./pages/Verify";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import ListItem from "./pages/ListItem";
import CreateAuction from "./pages/CreateAuction";
import LiveAuction from "./pages/LiveAuction";
import MyBids from "./pages/MyBids";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryId" element={<CategoryItems />} />
          <Route path="/items/:itemId" element={<ItemDetails />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:itemId" element={<LiveAuction />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/celebrity" element={<Celebrity />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/about" element={<About />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/list-item" element={<ListItem />} />
          <Route path="/my-bids" element={<MyBids />} />
          <Route path="/checkout/:itemId" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
