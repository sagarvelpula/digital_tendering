import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Ban, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { fetchAllVendors, fetchVendorBidCount, updateUserStatus } from '@/lib/supabase-helpers';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/lib/supabase/users';

const Vendors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedVendor, setSelectedVendor] = useState<UserProfile | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchAllVendors,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: 'active' | 'banned' }) => 
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: 'Status updated',
        description: 'Vendor status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update vendor status.',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (vendorId: string, newStatus: 'active' | 'banned') => {
    updateStatusMutation.mutate({ userId: vendorId, status: newStatus });
  };

  const handleViewDetails = (vendor: UserProfile) => {
    setSelectedVendor(vendor);
    setIsDetailsOpen(true);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
              Error Loading Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the vendors list. Please try again later.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Vendor Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Registered Vendors</CardTitle>
          <CardDescription>Manage all vendors registered in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-pulse flex space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p>No vendors found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>{vendor.name}</TableCell>
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>
                          {vendor.status === 'banned' ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge className="bg-green-600">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(vendor)}
                            >
                              View Details
                            </Button>
                            {vendor.status === 'banned' ? (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-green-600"
                                onClick={() => handleStatusChange(vendor.id, 'active')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleStatusChange(vendor.id, 'banned')}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              asChild
                            >
                              <a href={`mailto:${vendor.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected vendor.
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedVendor.name}</h3>
                  <p className="text-gray-500">{selectedVendor.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {selectedVendor.status === 'banned' ? 'Banned' : 'Active'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="font-medium">{selectedVendor.company || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Bid History</h4>
                <p className="text-sm text-gray-500">
                  This feature will display the vendor's bid history. Coming soon.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            {selectedVendor && (
              selectedVendor.status === 'banned' ? (
                <Button onClick={() => handleStatusChange(selectedVendor.id, 'active')}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activate Account
                </Button>
              ) : (
                <Button variant="destructive" onClick={() => handleStatusChange(selectedVendor.id, 'banned')}>
                  <Ban className="h-4 w-4 mr-1" />
                  Ban Account
                </Button>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors;
