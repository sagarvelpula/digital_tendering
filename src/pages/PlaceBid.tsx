
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTender } from '@/context/TenderContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

const PlaceBid: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTenderById, placeBid } = useTender();
  const { user } = useAuth();
  
  const [bidAmount, setBidAmount] = useState('');
  const [proposal, setProposal] = useState('');
  
  const tender = getTenderById(id as string);
  
  if (!tender) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4">Tender not found</div>
        <Button variant="outline" onClick={() => navigate('/tenders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenders
        </Button>
      </div>
    );
  }
  
  if (tender.status !== 'active') {
    return (
      <div className="py-12 text-center">
        <div className="mb-4">This tender is no longer accepting bids</div>
        <Button variant="outline" onClick={() => navigate(`/tenders/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          View Tender Details
        </Button>
      </div>
    );
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidAmount || !proposal) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newBid = {
      tenderId: tender.id,
      vendorId: user?.id || '',
      vendorName: user?.name || '',
      amount: parseFloat(bidAmount),
      proposal,
    };
    
    placeBid(newBid);
    toast({
      title: "Bid submitted",
      description: "Your bid has been successfully submitted",
    });
    navigate(`/tenders/${id}`);
  };
  
  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={() => navigate(`/tenders/${id}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tender
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Bid</CardTitle>
              <CardDescription>
                Enter your bid details for the tender
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bidAmount">Bid Amount (USD)*</Label>
                  <Input 
                    id="bidAmount" 
                    type="number" 
                    placeholder="Enter your bid amount" 
                    min="0"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Tender budget: ${tender.value.toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proposal">Proposal Details*</Label>
                  <Textarea 
                    id="proposal" 
                    placeholder="Describe your proposal and how you meet the requirements" 
                    rows={8}
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="ml-auto">Submit Bid</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tender Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Title</h4>
                <p>{tender.title}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">Category</h4>
                <Badge variant="outline">{tender.category}</Badge>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-1">Deadline</h4>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(tender.deadline).toLocaleDateString()}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium text-sm mb-1">Requirements</h4>
                <ul className="text-sm space-y-1 list-disc pl-4">
                  {tender.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceBid;
