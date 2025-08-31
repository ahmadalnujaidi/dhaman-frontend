import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL;

interface AddWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWarrantyAdded: () => void;
}

const AddWarrantyModal = ({ isOpen, onClose, onWarrantyAdded }: AddWarrantyModalProps) => {
  const [itemName, setItemName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [itemImage, setItemImage] = useState<File | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemImage(file);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
    }
  };

  const removeImage = () => {
    setItemImage(null);
    // Reset the file input
    const imageInput = document.getElementById('item-image') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
  };

  const removeReceipt = () => {
    setReceipt(null);
    // Reset the file input
    const receiptInput = document.getElementById('receipt') as HTMLInputElement;
    if (receiptInput) receiptInput.value = '';
  };

  const triggerImageInput = () => {
    const imageInput = document.getElementById('item-image') as HTMLInputElement;
    if (imageInput) imageInput.click();
  };

  const triggerReceiptInput = () => {
    const receiptInput = document.getElementById('receipt') as HTMLInputElement;
    if (receiptInput) receiptInput.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("item_name", itemName);
      formData.append("purchase_date", purchaseDate);
      formData.append("duration", duration);
      formData.append("notes", notes);
      
      if (itemImage) {
        formData.append("item_image", itemImage);
      }
      
      if (receipt) {
        formData.append("receipt", receipt);
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/warranties`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast({
          title: t('warranty.warrantyAdded'),
          description: t('warranty.warrantyAddedDesc'),
        });
        onWarrantyAdded();
        onClose();
        // Reset form
        setItemName("");
        setPurchaseDate("");
        setDuration("");
        setNotes("");
        setItemImage(null);
        setReceipt(null);
        // Reset file inputs
        const imageInput = document.getElementById('item-image') as HTMLInputElement;
        const receiptInput = document.getElementById('receipt') as HTMLInputElement;
        if (imageInput) imageInput.value = '';
        if (receiptInput) receiptInput.value = '';
      } else {
        const data = await response.json();
        throw new Error(data.message || "Failed to add warranty");
      }
    } catch (error) {
      toast({
        title: t('warranty.errorAddingWarranty'),
        description: error instanceof Error ? error.message : t('warranty.errorAddingWarrantyDesc'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            {t('warranty.addNewWarranty')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="item-name">{t('warranty.itemName')} {t('common.required')}</Label>
            <Input
              id="item-name"
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={t('warranty.itemNamePlaceholder')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purchase-date">{t('warranty.purchaseDate')} {t('common.required')}</Label>
            <Input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">{t('warranty.warrantyDuration')} {t('common.required')}</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={t('warranty.durationPlaceholder')}
              required
              min="1"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">{t('warranty.notes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('warranty.notesPlaceholder')}
              rows={3}
            />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('warranty.itemImage')}</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {itemImage ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <span className="text-sm text-foreground">{itemImage.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-center cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors"
                    onClick={triggerImageInput}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('warranty.uploadItemImage')}
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="item-image"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerImageInput();
                      }}
                    >
{t('warranty.chooseFile')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>{t('warranty.receipt')}</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                {receipt ? (
                  <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                    <span className="text-sm text-foreground">{receipt.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeReceipt}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-center cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors"
                    onClick={triggerReceiptInput}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('warranty.uploadReceipt')}
                    </p>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleReceiptChange}
                      className="hidden"
                      id="receipt"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerReceiptInput();
                      }}
                    >
{t('warranty.chooseFile')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
{t('warranty.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isLoading}
            >
{isLoading ? t('warranty.adding') : t('warranty.addWarranty')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWarrantyModal;