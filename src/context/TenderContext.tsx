
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRecommendations } from "@/utils/recommendationEngine";
import {
  fetchTenders, fetchBids, createTender, updateTender,
  deleteTender, createBid, updateBid, deleteBid
} from "@/lib/supabase-helpers";

export interface Tender {
  id: string;
  title: string;
  description: string;
  category: string;
  value: number;
  deadline: string;
  status: "active" | "closed" | "awarded";
  createdBy: string;
  createdAt: string;
  requirements: string[];
  documents?: string[];
}

export interface Bid {
  id: string;
  tenderId: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  proposal: string;
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
}

interface TenderContextType {
  tenders: Tender[];
  bids: Bid[];
  loading: {
    tenders: boolean;
    bids: boolean;
  };
  addTender: (tender: Omit<Tender, "id" | "createdAt">) => Promise<void>;
  updateTender: (id: string, updates: Partial<Tender>) => Promise<void>;
  deleteTender: (id: string) => Promise<void>;
  placeBid: (bid: Omit<Bid, "id" | "submittedAt" | "status">) => Promise<void>;
  updateBid: (id: string, updates: Partial<Bid>) => Promise<void>;
  deleteBid: (id: string) => Promise<void>;
  getUserBids: (userId: string) => Bid[];
  getTenderBids: (tenderId: string) => Bid[];
  getTenderById: (id: string) => Tender | undefined;
  getRecommendedTenders: (userId: string, userRole: string) => Tender[];
  refreshTenders: () => Promise<void>;
  refreshBids: () => Promise<void>;
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export const useTender = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error("useTender must be used within a TenderProvider");
  }
  return context;
};

export const TenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState({
    tenders: true,
    bids: true
  });
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      refreshTenders();
      refreshBids();
    }
  }, [isAuthenticated]);

  const refreshTenders = async () => {
    setLoading(prev => ({ ...prev, tenders: true }));
    try {
      const fetchedTenders = await fetchTenders();
      setTenders(fetchedTenders);
    } catch (error) {
      console.error("Failed to fetch tenders:", error);
      toast({
        title: "Error",
        description: "Failed to load tenders",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, tenders: false }));
    }
  };

  const refreshBids = async () => {
    setLoading(prev => ({ ...prev, bids: true }));
    try {
      const fetchedBids = await fetchBids();
      setBids(fetchedBids);
    } catch (error) {
      console.error("Failed to fetch bids:", error);
      toast({
        title: "Error",
        description: "Failed to load bids",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, bids: false }));
    }
  };

  const addTender = async (tender: Omit<Tender, "id" | "createdAt">) => {
    try {
      const newTender = await createTender(tender);
      if (newTender) {
        setTenders(prev => [...prev, newTender]);
        toast({
          title: "Success",
          description: "Tender created successfully",
        });
      }
    } catch (error) {
      console.error("Failed to create tender:", error);
      toast({
        title: "Error",
        description: "Failed to create tender",
        variant: "destructive",
      });
    }
  };

  const modifyTender = async (id: string, updates: Partial<Tender>) => {
    try {
      const updatedTender = await updateTender(id, updates);
      if (updatedTender) {
        setTenders(prev => 
          prev.map(tender => tender.id === id ? { ...tender, ...updatedTender } : tender)
        );
        toast({
          title: "Success",
          description: "Tender updated successfully",
        });
      }
    } catch (error) {
      console.error("Failed to update tender:", error);
      toast({
        title: "Error",
        description: "Failed to update tender",
        variant: "destructive",
      });
    }
  };

  const removeTender = async (id: string) => {
    try {
      const success = await deleteTender(id);
      if (success) {
        setTenders(prev => prev.filter(tender => tender.id !== id));
        // Also remove associated bids
        setBids(prev => prev.filter(bid => bid.tenderId !== id));
        toast({
          title: "Success",
          description: "Tender deleted successfully",
        });
      }
    } catch (error) {
      console.error("Failed to delete tender:", error);
      toast({
        title: "Error",
        description: "Failed to delete tender",
        variant: "destructive",
      });
    }
  };

  const placeBid = async (bid: Omit<Bid, "id" | "submittedAt" | "status">) => {
    try {
      const newBid = await createBid(bid);
      if (newBid) {
        setBids(prev => [...prev, newBid]);
        toast({
          title: "Success",
          description: "Bid submitted successfully",
        });
      }
    } catch (error) {
      console.error("Failed to place bid:", error);
      toast({
        title: "Error",
        description: "Failed to submit bid",
        variant: "destructive",
      });
    }
  };

  const modifyBid = async (id: string, updates: Partial<Bid>) => {
    try {
      const updatedBid = await updateBid(id, updates);
      if (updatedBid) {
        setBids(prev => 
          prev.map(bid => bid.id === id ? { ...bid, ...updatedBid } : bid)
        );
        toast({
          title: "Success",
          description: "Bid updated successfully",
        });
      }
    } catch (error) {
      console.error("Failed to update bid:", error);
      toast({
        title: "Error",
        description: "Failed to update bid",
        variant: "destructive",
      });
    }
  };

  const removeBid = async (id: string) => {
    try {
      const success = await deleteBid(id);
      if (success) {
        setBids(prev => prev.filter(bid => bid.id !== id));
        toast({
          title: "Success",
          description: "Bid deleted successfully",
        });
      }
    } catch (error) {
      console.error("Failed to delete bid:", error);
      toast({
        title: "Error",
        description: "Failed to delete bid",
        variant: "destructive",
      });
    }
  };

  const getUserBids = (userId: string) => {
    return bids.filter(bid => bid.vendorId === userId);
  };

  const getTenderBids = (tenderId: string) => {
    return bids.filter(bid => bid.tenderId === tenderId);
  };

  const getTenderById = (id: string) => {
    return tenders.find(tender => tender.id === id);
  };

  const getRecommendedTenders = (userId: string, userRole: string) => {
    // Return empty array for non-vendor users
    if (userRole !== "vendor") return [];
    
    try {
      // Get user's previous bids to understand preferences
      const userBids = getUserBids(userId);
      
      // If the user has no previous bids, we can't make AI recommendations
      if (userBids.length === 0) {
        // Fallback: Return a few active tenders
        return tenders
          .filter(tender => tender.status === "active")
          .slice(0, 3);
      }
      
      // Get tenders the user has already bid on
      const userTenderIds = userBids.map(bid => bid.tenderId);
      const userTenders = tenders.filter(tender => userTenderIds.includes(tender.id));
      
      // Get active tenders the user hasn't bid on
      const availableTenders = tenders.filter(tender => 
        tender.status === "active" && 
        !userTenderIds.includes(tender.id)
      );
      
      // Generate recommendations using TF-IDF and cosine similarity
      const recommendations = getRecommendations(userTenders, availableTenders);
      
      console.log("AI Recommendations generated:", recommendations.length);
      
      return recommendations;
      
    } catch (error) {
      console.error("Error generating recommendations:", error);
      // Fallback in case of errors
      return tenders
        .filter(tender => tender.status === "active")
        .slice(0, 3);
    }
  };

  return (
    <TenderContext.Provider value={{
      tenders,
      bids,
      loading,
      addTender,
      updateTender: modifyTender,
      deleteTender: removeTender,
      placeBid,
      updateBid: modifyBid,
      deleteBid: removeBid,
      getUserBids,
      getTenderBids,
      getTenderById,
      getRecommendedTenders,
      refreshTenders,
      refreshBids
    }}>
      {children}
    </TenderContext.Provider>
  );
};
