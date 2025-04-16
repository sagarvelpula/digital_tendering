
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updatePasswordSchema } from '@/lib/form-schemas';
import { useAuth } from '@/context/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPassword: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError(null);
    setIsResetting(true);
    
    try {
      await updatePassword(data.password);
      setIsSuccess(true);
      
      // Auto-redirect after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-10 w-10 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mr-2">
              TMS
            </div>
            <h1 className="text-3xl font-bold text-gray-800">TenderFlow</h1>
          </div>
          <p className="text-gray-600">Streamlined Tender Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              {isSuccess 
                ? "Password Successfully Updated" 
                : "Enter a new, strong password to secure your account"}
            </CardDescription>
          </CardHeader>
          
          {isSuccess ? (
            <CardContent className="space-y-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <p className="text-green-800">
                  Your account password has been successfully updated! 
                  You can now log in with your new password.
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full mt-4"
              >
                Go to Login
              </Button>
            </CardContent>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              disabled={isResetting}
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowPassword(!showPassword)}
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              disabled={isResetting}
                              {...field}
                            />
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
