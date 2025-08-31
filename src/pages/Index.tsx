import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import LoginModal from "@/components/LoginModal";
import AddWarrantyModal from "@/components/AddWarrantyModal";
import WarrantyCard from "@/components/WarrantyCard";
import { ShieldCheck, Plus } from "lucide-react";
import { useTranslation } from 'react-i18next';
const API_URL = import.meta.env.VITE_API_URL;
interface Warranty {
  id: number;
  item_name: string;
  purchase_date: string;
  duration: number;
  notes: string;
  item_image: string | null;
  receipt: string | null;
  user: {
    email: string;
  };
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddWarrantyModalOpen, setIsAddWarrantyModalOpen] = useState(false);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [isLoadingWarranties, setIsLoadingWarranties] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      fetchWarranties();
    }
  }, []);

  const fetchWarranties = async () => {
    setIsLoadingWarranties(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/warranties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWarranties(data);
      } else {
        throw new Error("Failed to fetch warranties");
      }
    } catch (error) {
      toast({
        title: t('warranty.errorFetchingWarranties'),
        description: t('warranty.errorFetchingWarrantiesDesc'),
        variant: "destructive",
      });
    } finally {
      setIsLoadingWarranties(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    fetchWarranties();
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setWarranties([]);
  };

  const handleWarrantyAdded = () => {
    fetchWarranties();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />

      <main className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="bg-gradient-hero p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <ShieldCheck className="h-12 w-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  {t('home.welcomeTitle')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('home.welcomeSubtitle')}
                </p>
              </div>
              
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full"
              >
{t('home.loginToContinue')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{t('home.yourWarranties')}</h1>
                <p className="text-muted-foreground mt-2">
                  {t('home.warrantySubtitle')}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleLogout}>
                  {t('home.logout')}
                </Button>
                <Button variant="primary" onClick={() => setIsAddWarrantyModalOpen(true)}>
                  <Plus className="h-4 w-4" />
                  {t('home.addWarranty')}
                </Button>
              </div>
            </div>

            {isLoadingWarranties ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">{t('home.loadingWarranties')}</p>
                </div>
              </div>
            ) : warranties.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="bg-muted/50 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                  <ShieldCheck className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{t('home.noWarrantiesTitle')}</h3>
                <p className="text-muted-foreground">
                  {t('home.noWarrantiesDesc')}
                </p>
                <Button variant="primary" onClick={() => setIsAddWarrantyModalOpen(true)}>
                  <Plus className="h-4 w-4" />
{t('home.addFirstWarranty')}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {warranties.map((warranty) => (
                  <WarrantyCard key={warranty.id} warranty={warranty} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AddWarrantyModal
        isOpen={isAddWarrantyModalOpen}
        onClose={() => setIsAddWarrantyModalOpen(false)}
        onWarrantyAdded={handleWarrantyAdded}
      />
    </div>
  );
};

export default Index;
