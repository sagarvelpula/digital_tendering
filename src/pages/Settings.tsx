
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  adminSettingsSchema, 
  vendorSettingsSchema, 
  profileUpdateSchema, 
  updatePasswordSchema 
} from '@/lib/form-schemas';
import { fetchUserProfile, updateUserProfile } from '@/lib/supabase-helpers';
import { supabase } from '@/integrations/supabase/client';
import * as z from 'zod';

const categoryOptions = [
  { label: 'Construction', value: 'construction' },
  { label: 'IT Services', value: 'it' },
  { label: 'Consulting', value: 'consulting' },
  { label: 'Office Supplies', value: 'supplies' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Logistics', value: 'logistics' },
];

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user?.id || ''),
    enabled: !!user?.id,
  });

  // Admin settings form
  const adminSettingsForm = useForm({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      defaultTenderDuration: 30,
      maxBidsAllowed: 10,
    },
  });

  // Vendor settings form
  const vendorSettingsForm = useForm({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      preferredCategories: [],
      emailNotifications: true,
    },
  });

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: z.infer<typeof profileUpdateSchema>) => 
      updateUserProfile(user?.id || '', data),
    onSuccess: () => {
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

  // Vendor settings mutation
  const updateVendorSettingsMutation = useMutation({
    mutationFn: (data: z.infer<typeof vendorSettingsSchema>) => 
      updateUserProfile(user?.id || '', {
        categories: data.preferredCategories,
        email_notifications: data.emailNotifications,
      }),
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your preference settings have been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    },
  });

  // Admin settings mutation
  const updateAdminSettingsMutation = useMutation({
    mutationFn: (data: z.infer<typeof adminSettingsSchema>) => {
      // This would typically update a settings table in the database
      // For now, we'll just show a success toast
      return Promise.resolve(true);
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'System settings have been updated successfully.',
      });
    },
  });

  // Password update mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof updatePasswordSchema>) => {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update password.',
        variant: 'destructive',
      });
    },
  });

  // Set profile form defaults when data is loaded
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || '',
        email: profile.email || '',
        company: profile.company || '',
      });

      if (!isAdmin) {
        vendorSettingsForm.reset({
          preferredCategories: profile.categories || [],
          emailNotifications: profile.email_notifications !== false,
        });
      }
    }
  }, [profile, isAdmin]);

  // Form submission handlers
  const onProfileSubmit = (data: z.infer<typeof profileUpdateSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: z.infer<typeof updatePasswordSchema>) => {
    updatePasswordMutation.mutate(data);
  };

  const onVendorSettingsSubmit = (data: z.infer<typeof vendorSettingsSchema>) => {
    updateVendorSettingsMutation.mutate(data);
  };

  const onAdminSettingsSubmit = (data: z.infer<typeof adminSettingsSchema>) => {
    updateAdminSettingsMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isAdmin ? (
            <TabsTrigger value="system">System Settings</TabsTrigger>
          ) : (
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          )}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
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
                      control={profileForm.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Your company name will be visible to admins and on your bids
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>

        {isAdmin ? (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure global application settings</CardDescription>
              </CardHeader>
              <Form {...adminSettingsForm}>
                <form onSubmit={adminSettingsForm.handleSubmit(onAdminSettingsSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={adminSettingsForm.control}
                      name="defaultTenderDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tender Duration (days)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min={1} />
                          </FormControl>
                          <FormDescription>
                            The default number of days for new tenders
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={adminSettingsForm.control}
                      name="maxBidsAllowed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Bids Per Tender</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min={1} />
                          </FormControl>
                          <FormDescription>
                            The maximum number of bids allowed per tender
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={updateAdminSettingsMutation.isPending}>
                      {updateAdminSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        ) : (
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Preferences</CardTitle>
                <CardDescription>Customize your preferences</CardDescription>
              </CardHeader>
              <Form {...vendorSettingsForm}>
                <form onSubmit={vendorSettingsForm.handleSubmit(onVendorSettingsSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={vendorSettingsForm.control}
                      name="preferredCategories"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Preferred Tender Categories</FormLabel>
                            <FormDescription>
                              Select the categories you're interested in bidding on
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {categoryOptions.map((option) => (
                              <FormField
                                key={option.value}
                                control={vendorSettingsForm.control}
                                name="preferredCategories"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={option.value}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option.value)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...(field.value || []),
                                                  option.value,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== option.value
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {option.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator className="my-4" />
                    
                    <FormField
                      control={vendorSettingsForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>
                              Receive email notifications about new tenders and bids
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={updateVendorSettingsMutation.isPending}>
                      {updateVendorSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          At least 6 characters with a mix of letters, numbers and symbols
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={updatePasswordMutation.isPending}>
                    {updatePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
