
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'vendor'>('vendor');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      login(email, password, role);
      navigate('/');
    } catch (err) {
      setError('Failed to log in');
    }
  };

  // Demo logins for quick testing
  const loginAsAdmin = () => {
    login('admin@tenderflow.com', 'password', 'admin');
    navigate('/');
  };

  const loginAsVendor = () => {
    login('vendor@company.com', 'password', 'vendor');
    navigate('/');
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
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup 
                  value={role} 
                  onValueChange={(value) => setRole(value as 'admin' | 'vendor')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vendor" id="vendor" />
                    <Label htmlFor="vendor">Vendor</Label>
                  </div>
                </RadioGroup>
              </div>

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">
                Log In
              </Button>
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 space-y-4">
          <div className="text-center text-sm text-gray-600">
            Demo Accounts (Click to auto-fill)
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={loginAsAdmin}
              className="flex-1 text-xs hover:bg-primary hover:text-primary-foreground"
            >
              Login as Admin
            </Button>
            <Button 
              variant="outline" 
              onClick={loginAsVendor}
              className="flex-1 text-xs hover:bg-primary hover:text-primary-foreground"
            >
              Login as Vendor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
