import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const Navbar = ({ isLoggedIn, onLoginClick }: NavbarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <nav className="w-full bg-card/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t('brand.name')}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 navbar-flex">
          <LanguageSwitcher />
          <Button 
            variant="outline" 
            onClick={() => navigate('/upgrade')}
            className="flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            {t('nav.upgrade')}
          </Button>
          {!isLoggedIn && (
            <Button variant="primary" onClick={onLoginClick}>
              {t('nav.login')}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;