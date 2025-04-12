
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTender } from '@/context/TenderContext';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bidSchema } from '@/lib/form-schemas';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

type BidFormValues = {
  amount: number;
  proposal: string;
};

const PlaceBid: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTenderById, placeBid } = useTender();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: 0,
      proposal: '',
    }
  });
  
  const { isSubmitting } = form.formState;
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
  
  const onSubmit = async (data: BidFormValues) => {
    if (!user) {
      setError("You must be logged in to place a bid");
      return;
    }
    
    setError(null);
    
    try {
      await placeBid({
        tenderId: tender.id,
        vendorId: user.id,
        vendorName: user.name,
        amount: data.amount,
        proposal: data.proposal,
      });
      navigate(`/tenders/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit bid. Please try again later.");
    }
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

            {error && (
              <div className="px-6">
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bid Amount (USD)*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter your bid amount" 
                            min="0"
                            disabled={isSubmitting}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Tender budget: ${tender.value.toLocaleString()}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="proposal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proposal Details*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your proposal and how you meet the requirements" 
                            rows={8}
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="ml-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Bid'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
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
