'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccount } from 'wagmi';
import { useAuth } from '@/contexts/AuthContext';
import { useBackend } from '@/hooks/useBackend';
import ConnectWalletButton from '@/components/connect-button';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  User, 
  Mail, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { login, register, isLoading: authLoading } = useAuth();
  const { getJwt } = useBackend();
  
  const [step, setStep] = useState<'wallet' | 'details' | 'vincent'>('wallet');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleWalletConnect = () => {
    if (isConnected && address) {
      setStep('details');
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsLoading(true);
    try {
      // Try to login first (user might already exist)
      try {
        await login(address);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to your account.",
        });
        router.push('/dashboard');
        return;
      } catch (loginError) {
        // If login fails, user doesn't exist, proceed with registration
        console.log('User not found, proceeding with registration');
      }

      // Register new user
      await register({
        name: formData.name,
        email: formData.email,
        wallet_address: address,
      });

      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });

      setStep('vincent');
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVincentConnect = async () => {
    setIsLoading(true);
    try {
      await getJwt();
      toast({
        title: "Vincent connected!",
        description: "You're now ready to use GuardianAgent.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Vincent connection failed:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect with Vincent. You can still use the app.",
        variant: "destructive",
      });
      // Still redirect to dashboard even if Vincent fails
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to GuardianAgent
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {step === 'wallet' && "Connect your wallet to get started"}
                {step === 'details' && "Tell us a bit about yourself"}
                {step === 'vincent' && "Connect with Vincent for enhanced security"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      (step === 'wallet' && stepNumber === 1) ||
                      (step === 'details' && stepNumber <= 2) ||
                      (step === 'vincent' && stepNumber <= 3)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className="w-8 h-px bg-border mx-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Wallet Connection */}
            {step === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <Wallet className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your EVM wallet to access your DeFi positions
                  </p>
                </div>

                <ConnectWalletButton 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                />

                {isConnected && address && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Connected: {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                  </motion.div>
                )}

                {isConnected && (
                  <Button 
                    onClick={handleWalletConnect}
                    className="w-full"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking account...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            )}

            {/* Step 2: User Details */}
            {step === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <User className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Create Your Account</h3>
                  <p className="text-sm text-muted-foreground">
                    We need some basic information to set up your profile
                  </p>
                </div>

                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Wallet className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading || !formData.name || !formData.email}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Vincent Connection */}
            {step === 'vincent' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <Shield className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">Connect with Vincent</h3>
                  <p className="text-sm text-muted-foreground">
                    Vincent provides enhanced security and non-custodial authentication
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Account created successfully
                    </span>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">What is Vincent?</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Non-custodial authentication</li>
                      <li>• Enhanced security for your account</li>
                      <li>• Seamless wallet integration</li>
                    </ul>
                  </div>
                </div>

                <Button 
                  onClick={handleVincentConnect}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect with Vincent
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Skip for now
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
