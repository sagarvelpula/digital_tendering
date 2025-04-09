
import React, { createContext, useContext, useState } from "react";

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
  addTender: (tender: Omit<Tender, "id" | "createdAt">) => void;
  updateTender: (id: string, updates: Partial<Tender>) => void;
  deleteTender: (id: string) => void;
  placeBid: (bid: Omit<Bid, "id" | "submittedAt" | "status">) => void;
  getUserBids: (userId: string) => Bid[];
  getTenderBids: (tenderId: string) => Bid[];
  getTenderById: (id: string) => Tender | undefined;
  getRecommendedTenders: (userId: string, userRole: string) => Tender[];
}

const TenderContext = createContext<TenderContextType | undefined>(undefined);

export const useTender = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error("useTender must be used within a TenderProvider");
  }
  return context;
};

// Sample data for demo purposes
const sampleTenders: Tender[] = [
  {
    id: "t1",
    title: "Website Development for Government Agency",
    description: "Seeking experienced web development company to build a modern, responsive website for a government agency. The website should include a content management system, search functionality, and meet accessibility requirements.",
    category: "IT Services",
    value: 85000,
    deadline: "2025-06-30",
    status: "active",
    createdBy: "admin1",
    createdAt: "2025-03-15",
    requirements: ["5+ years experience", "Government sector experience", "Accessibility compliance"],
  },
  {
    id: "t2",
    title: "Office Furniture Supply",
    description: "Supply of ergonomic office furniture for a new corporate headquarters. Items include adjustable desks, chairs, meeting tables, and storage solutions.",
    category: "Supplies",
    value: 120000,
    deadline: "2025-05-15",
    status: "active",
    createdBy: "admin1",
    createdAt: "2025-03-10",
    requirements: ["Quality certification", "Delivery within 45 days", "Installation included"],
  },
  {
    id: "t3",
    title: "IT Infrastructure Upgrade",
    description: "Comprehensive IT infrastructure upgrade including servers, networking equipment, and cybersecurity solutions for a mid-sized organization.",
    category: "IT Services",
    value: 250000,
    deadline: "2025-07-20",
    status: "active",
    createdBy: "admin1",
    createdAt: "2025-03-05",
    requirements: ["Certified technicians", "24/7 support", "3-year warranty"],
  },
  {
    id: "t4",
    title: "Marketing Campaign Management",
    description: "Full-service marketing agency needed for a 6-month campaign including digital marketing, social media management, and content creation.",
    category: "Marketing",
    value: 75000,
    deadline: "2025-04-30",
    status: "active",
    createdBy: "admin1",
    createdAt: "2025-03-01",
    requirements: ["Proven track record", "Industry experience", "Performance metrics"],
  },
  {
    id: "t5",
    title: "Facility Maintenance Services",
    description: "Annual contract for comprehensive facility maintenance including HVAC, electrical, plumbing, and general repairs for a large office complex.",
    category: "Services",
    value: 180000,
    deadline: "2025-05-31",
    status: "active",
    createdBy: "admin1",
    createdAt: "2025-02-28",
    requirements: ["Licensed contractors", "Rapid response time", "24/7 emergency service"],
  }
];

const sampleBids: Bid[] = [
  {
    id: "b1",
    tenderId: "t1",
    vendorId: "vendor1",
    vendorName: "TechSolutions Inc.",
    amount: 82000,
    proposal: "Comprehensive web development solution with ongoing support",
    status: "pending",
    submittedAt: "2025-03-20",
  },
  {
    id: "b2",
    tenderId: "t1",
    vendorId: "vendor2",
    vendorName: "WebMasters Pro",
    amount: 79500,
    proposal: "Custom CMS with enhanced security features",
    status: "pending",
    submittedAt: "2025-03-22",
  },
  {
    id: "b3",
    tenderId: "t2",
    vendorId: "vendor3",
    vendorName: "Office Comfort Solutions",
    amount: 115000,
    proposal: "High-quality ergonomic furniture with 5-year warranty",
    status: "pending",
    submittedAt: "2025-03-18",
  }
];

export const TenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenders, setTenders] = useState<Tender[]>(sampleTenders);
  const [bids, setBids] = useState<Bid[]>(sampleBids);

  const addTender = (tender: Omit<Tender, "id" | "createdAt">) => {
    const newTender: Tender = {
      ...tender,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenders([...tenders, newTender]);
  };

  const updateTender = (id: string, updates: Partial<Tender>) => {
    setTenders(
      tenders.map(tender => 
        tender.id === id ? { ...tender, ...updates } : tender
      )
    );
  };

  const deleteTender = (id: string) => {
    setTenders(tenders.filter(tender => tender.id !== id));
    // Also delete associated bids
    setBids(bids.filter(bid => bid.tenderId !== id));
  };

  const placeBid = (bid: Omit<Bid, "id" | "submittedAt" | "status">) => {
    const newBid: Bid = {
      ...bid,
      id: Math.random().toString(36).substr(2, 9),
      status: "pending",
      submittedAt: new Date().toISOString().split('T')[0],
    };
    setBids([...bids, newBid]);
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
    if (userRole !== "vendor") return [];
    
    // Get categories from user's previous bids
    const userBids = getUserBids(userId);
    const userTenderIds = userBids.map(bid => bid.tenderId);
    const userTenders = tenders.filter(tender => userTenderIds.includes(tender.id));
    const preferredCategories = [...new Set(userTenders.map(tender => tender.category))];
    
    // Recommend active tenders in preferred categories that the user hasn't bid on
    return tenders.filter(tender => 
      tender.status === "active" && 
      preferredCategories.includes(tender.category) && 
      !userBids.some(bid => bid.tenderId === tender.id)
    ).slice(0, 3); // Return top 3 recommendations
  };

  return (
    <TenderContext.Provider value={{
      tenders,
      bids,
      addTender,
      updateTender,
      deleteTender,
      placeBid,
      getUserBids,
      getTenderBids,
      getTenderById,
      getRecommendedTenders
    }}>
      {children}
    </TenderContext.Provider>
  );
};
