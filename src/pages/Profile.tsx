
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '@/lib/supabase-helpers';
import { profileUpdateSchema } from '@/lib/form-schemas';
import * as z from 'zod';
import { Camera, User, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const { data: profile, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user?.id || ''),
    enabled: !!user?.id,
  });

  const form = useForm<z.infer<typeof profileUpdateSchema>>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
    },
  });

  // Set form defaults when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        email: profile.email || '',
        company: profile.company || '',
      });
      setAvatarUrl(profile.photo_url || null);
    }
  }, [profile]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof profileUpdateSchema>) => 
      updateUserProfile(user?.id || '', data),
    onSuccess: () => {
      refetch();
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Update user profile with new photo URL
      const photoUrl = data.publicUrl;
      await updateUserProfile(user?.id || '', { photo_url: photoUrl });
      
      return photoUrl;
    },
    onSuccess: (newUrl) => {
      setAvatarUrl(newUrl);
      refetch();
      toast({
        title: 'Photo updated',
        description: 'Your profile photo has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    uploadAvatarMutation.mutate(file);
  };

  const onSubmit = (data: z.infer<typeof profileUpdateSchema>) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            View and manage your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarUrl || ''} />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {user?.name ? getInitials(user.name) : <User />}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-medium">{profile?.name}</h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 capitalize">
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="space-y-1">
                <h3 className="font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your account details
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!isAdmin && (
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
