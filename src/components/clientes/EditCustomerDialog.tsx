
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types/models";

interface EditCustomerDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<Customer>) => void;
}

const EditCustomerDialog = ({
  customer,
  open,
  onOpenChange,
  onUpdate
}: EditCustomerDialogProps) => {
  const [formData, setFormData] = useState<Customer>({...customer});
  
  // Reset form when customer changes
  useEffect(() => {
    setFormData({...customer});
  }, [customer]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "totalPurchases" ? parseFloat(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      setFormData({ 
        ...formData, 
        [name]: value as "active" | "inactive"
      });
    } else if (name === "category") {
      setFormData({ 
        ...formData, 
        [name]: value as "regular" | "vip" | "enterprise" | "new"
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(customer.id, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize os campos para editar este cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                name="name"
                className="col-span-3"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                name="phone"
                className="col-span-3"
                value={formData.phone}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                CPF/CNPJ
              </Label>
              <Input
                id="document"
                name="document"
                className="col-span-3"
                value={formData.document || ""}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Endereço
              </Label>
              <Input
                id="address"
                name="address"
                className="col-span-3"
                value={formData.address || ""}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="joinDate" className="text-right">
                Data de Cadastro
              </Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                className="col-span-3"
                value={formData.joinDate}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="totalPurchases" className="text-right">
                Total de Compras
              </Label>
              <Input
                id="totalPurchases"
                name="totalPurchases"
                type="number"
                min="0"
                step="0.01"
                className="col-span-3"
                value={formData.totalPurchases}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastPurchase" className="text-right">
                Última Compra
              </Label>
              <Input
                id="lastPurchase"
                name="lastPurchase"
                type="date"
                className="col-span-3"
                value={formData.lastPurchase || ""}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select 
                value={formData.category || "regular"} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="enterprise">Empresa</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Observações
              </Label>
              <Textarea
                id="notes"
                name="notes"
                className="col-span-3"
                value={formData.notes || ""}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomerDialog;
