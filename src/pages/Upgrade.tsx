import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import { Crown, Check, Shield, Clock, BarChart3, Bell, Headphones, ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
interface FormData {
  first_name: string;
  email: string;
  country_code: string;
  phone_number: string;
}

interface FormErrors {
  first_name?: string;
  email?: string;
  country_code?: string;
  phone_number?: string;
}

const Upgrade = () => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    email: '',
    country_code: '',
    phone_number: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Fetch user profile to get email
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.email) {
          setFormData(prev => ({ ...prev, email: userData.email }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  // Load user email on component mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserProfile();
    }
  }, [isLoggedIn]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    fetchUserProfile();
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate first_name: required, string
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    // Validate email: required, valid email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate country_code: required, 1-3 digits
    if (!formData.country_code.trim()) {
      newErrors.country_code = 'Country code is required';
    } else if (!/^\d{1,3}$/.test(formData.country_code)) {
      newErrors.country_code = 'Country code must be 1-3 digits only';
    }

    // Validate phone_number: required, 9-10 digits
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{9,10}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 9-10 digits only';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Apply input restrictions
    let processedValue = value;
    
    if (field === 'country_code') {
      // Only allow digits, max 3 characters
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'phone_number') {
      // Only allow digits, max 10 characters
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: t('common.error'),
        description: "Please log in first to upgrade your account.",
        variant: "destructive",
      });
      setIsLoginModalOpen(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/payments/create-charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const paymentUrl = await response.text();
      

      if (response.ok) {
        // Validate that we received a URL
        if (paymentUrl && (paymentUrl.startsWith('http://') || paymentUrl.startsWith('https://'))) {
          toast({
            title: t('upgrade.redirectingPayment'),
            description: t('upgrade.redirectingPaymentDesc'),
            variant: "default",
          });
          
          // Small delay to ensure toast is visible before redirect
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);
        } else {
          throw new Error("Invalid payment URL received");
        }
      } else {
        console.error("Payment API error:", response.status, paymentUrl);
        throw new Error(`HTTP ${response.status}: Payment failed`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: <Headphones className="h-6 w-6" />,
      title: t('upgrade.support24_7'),
      description: t('upgrade.support247Description')
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('upgrade.unlimitedWarranties'),
      description: t('upgrade.unlimitedWarrantiesDescription')
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('upgrade.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('upgrade.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Features Section */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">{t('upgrade.premiumFeaturesTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <Card key={index} className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-purple-600 dark:text-purple-400 mt-1">
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Pricing Card */}
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {t('upgrade.oneTimePayment')}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{t('upgrade.premium')}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600">{t('upgrade.priceAmount')}<span className="text-lg text-muted-foreground">{t('upgrade.lifetimeAccess')}</span></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      t('upgrade.unlimitedWarrantiesFeature'),
                      t('upgrade.support247Feature'),
                      t('upgrade.priorityAssistanceFeature'),
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-xl">{t('upgrade.completeUpgrade')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">{t('upgrade.firstName')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder={t('upgrade.enterFirstName')}
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={errors.first_name ? "border-red-500" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500">{errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('upgrade.email')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('upgrade.enterEmail')}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? "border-red-500" : formData.email ? "bg-muted" : ""}
                    readOnly={!!formData.email && isLoggedIn}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                  {formData.email && isLoggedIn && (
                    <p className="text-xs text-muted-foreground">{t('upgrade.emailAutoFilled')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country_code">{t('upgrade.countryCode')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="country_code"
                    type="tel"
                    placeholder="965"
                    value={formData.country_code}
                    onChange={(e) => handleInputChange('country_code', e.target.value)}
                    className={errors.country_code ? "border-red-500" : ""}
                    maxLength={3}
                  />
                  {errors.country_code && (
                    <p className="text-sm text-red-500">{errors.country_code}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('upgrade.countryCodeHelper')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">{t('upgrade.phoneNumber')} <span className="text-red-500">*</span></Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="512345678"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className={errors.phone_number ? "border-red-500" : ""}
                    maxLength={10}
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-red-500">{errors.phone_number}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('upgrade.phoneNumberHelper')}</p>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('upgrade.processing')}
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      {t('upgrade.pay')}
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {t('upgrade.termsAgreement')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Upgrade;
