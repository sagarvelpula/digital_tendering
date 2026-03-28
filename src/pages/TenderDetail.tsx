
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTender } from '@/context/TenderContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, File, FileText, ArrowLeft, Users, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TenderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTenderById, getTenderBids, deleteTender } = useTender();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const tender = getTenderById(id as string);
  const bids = getTenderBids(id as string);
  
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
  
  const handleDelete = () => {
    deleteTender(tender.id);
    toast({
      title: "Tender deleted",
      description: "The tender has been successfully deleted",
    });
    navigate('/tenders');
  };
  
  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/tenders')}
          className="self-start"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenders
        </Button>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <Link to={`/tenders/${tender.id}/edit`}>
              <Button variant="outline">Edit Tender</Button>
            </Link>
            <Button 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
        
        {!isAdmin && tender.status === 'active' && (
          <Link to={`/tenders/${tender.id}/bid`}>
            <Button>Place Bid</Button>
          </Link>
        )}
      </div>
      
      {/* Tender Overview */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-2xl">{tender.title}</CardTitle>
              <CardDescription className="mt-2">
                Posted on {new Date(tender.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold">₹{tender.value.toLocaleString()}</div>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                Deadline: {new Date(tender.deadline).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline">{tender.category}</Badge>
            <Badge 
              variant={
                tender.status === 'active' ? 'default' : 
                tender.status === 'closed' ? 'secondary' : 
                'outline'
              }
            >
              {tender.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="description">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              {isAdmin && <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="description" className="pt-4">
              <p className="whitespace-pre-line">{tender.description}</p>
              
              {tender.documents && tender.documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Attached Documents</h4>
                  <div className="space-y-2">
                    {tender.documents.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 rounded-md border">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="requirements" className="pt-4">
              <h4 className="font-medium mb-3">Tender Requirements</h4>
              <ul className="space-y-2">
                {tender.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="bids" className="pt-4">
                {bids.length > 0 ? (
                  <div className="space-y-4">
                    {bids.map(bid => (
                      <Card key={bid.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div>
                              <div className="font-medium">{bid.vendorName}</div>
                              <div className="text-sm text-muted-foreground">
                                Submitted: {new Date(bid.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-xl font-bold">${bid.amount.toLocaleString()}</div>
                          </div>
                          <Separator className="my-3" />
                          <div>
                            <h4 className="text-sm font-medium mb-1">Proposal</h4>
                            <p className="text-sm text-muted-foreground">{bid.proposal}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No bids yet</h3>
                    <p className="text-muted-foreground">This tender hasn't received any bids.</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tender
              and all associated bids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TenderDetail;
