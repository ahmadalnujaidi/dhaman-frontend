import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, ExternalLink } from "lucide-react";
import { useTranslation } from 'react-i18next';

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

interface WarrantyCardProps {
  warranty: Warranty;
}

const WarrantyCard = ({ warranty }: WarrantyCardProps) => {
  const { t } = useTranslation();
  const purchaseDate = new Date(warranty.purchase_date);
  const expiryDate = new Date(purchaseDate.getTime() + warranty.duration * 30 * 24 * 60 * 60 * 1000);
  const isExpired = expiryDate < new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">{t('warranty.expired')}</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">{t('warranty.expiringSoon')}</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-success text-success-foreground">{t('warranty.active')}</Badge>;
    }
  };

  return (
    <Card className="w-full bg-gradient-card shadow-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between card-header-flex">
          <CardTitle className="text-xl font-semibold text-foreground">
            {warranty.item_name}
          </CardTitle>
          {getStatusBadge()}
        </div>
        
        {warranty.item_image && (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={warranty.item_image}
              alt={warranty.item_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm card-info-grid">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('warranty.purchased')}: {purchaseDate.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('warranty.expires')}: {expiryDate.toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">{t('warranty.duration')}: {warranty.duration} {t('warranty.months')}</span>
          </div>
        </div>
        
        {warranty.notes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4" />
{t('warranty.notes')}
            </div>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {warranty.notes}
            </p>
          </div>
        )}
        
        {warranty.receipt && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full"
            >
              <a
                href={warranty.receipt}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
{t('warranty.viewReceipt')}
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarrantyCard;