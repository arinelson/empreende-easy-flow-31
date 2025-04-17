
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Customer, FinancialTransaction, Product } from "@/types/models";
import { ComboBox } from "../ui/ComboBox";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";

interface EditTransactionDialogProps {
  transaction: FinancialTransaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: Partial<FinancialTransaction>) => void;
  customers: Customer[];
  products: Product[];
}

const EditTransactionDialog = ({
  transaction,
  open,
  onOpenChange,
  onUpdate,
  customers,
  products
}: EditTransactionDialogProps) => {
  const [formData, setFormData] = useState<FinancialTransaction>({...transaction});
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(transaction.customerId);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(transaction.productIds || []);
  
  // Reset form when transaction changes
  useEffect(() => {
    setFormData({...transaction});
    setSelectedCustomer(transaction.customerId);
    setSelectedProducts(transaction.productIds || []);
  }, [transaction]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "amount" ? parseFloat(value) : value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      setFormData({ 
        ...formData, 
        [name]: value as 'income' | 'expense' | 'refund'
      });
    } else if (name === "status") {
      setFormData({
        ...formData,
        [name]: value as 'pending' | 'completed' | 'canceled'
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleCustomerSelect = (customerId: string | undefined) => {
    setSelectedCustomer(customerId);
    
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      setFormData(prev => ({
        ...prev,
        customerId,
        customer: customer?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: undefined,
        customer: undefined
      }));
    }
  };

  const handleProductSelect = (productId: string | undefined) => {
    if (productId && !selectedProducts.includes(productId)) {
      const newProducts = [...selectedProducts, productId];
      setSelectedProducts(newProducts);
      
      const productNames = newProducts.map(id => {
        const product = products.find(p => p.id === id);
        return product?.name || '';
      });
      
      setFormData(prev => ({
        ...prev,
        productIds: newProducts,
        products: productNames
      }));
    }
  };

  const removeProduct = (productId: string) => {
    const newProducts = selectedProducts.filter(id => id !== productId);
    setSelectedProducts(newProducts);
    
    const productNames = newProducts.map(id => {
      const product = products.find(p => p.id === id);
      return product?.name || '';
    });
    
    setFormData(prev => ({
      ...prev,
      productIds: newProducts,
      products: productNames
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(transaction.id, formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>
            Atualize os campos para editar esta transação
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="refund">Reembolso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Input
                id="description"
                name="description"
                className="col-span-3"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="col-span-3"
                value={formData.amount}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Data
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                className="col-span-3"
                value={formData.date}
                onChange={handleFormChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange("category", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Assinaturas">Assinaturas</SelectItem>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Salários">Salários</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Insumos">Insumos</SelectItem>
                  <SelectItem value="Impostos">Impostos</SelectItem>
                  <SelectItem value="Comissões">Comissões</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Devoluções">Devoluções</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                Método de Pagamento
              </Label>
              <Select 
                value={formData.paymentMethod || ""} 
                onValueChange={(value) => handleSelectChange("paymentMethod", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={formData.status || "completed"} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Cliente
              </Label>
              <div className="col-span-3">
                <ComboBox
                  placeholder="Selecione um cliente"
                  items={customers.map(customer => ({
                    value: customer.id,
                    label: customer.name
                  }))}
                  value={selectedCustomer}
                  onSelect={handleCustomerSelect}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="products" className="text-right pt-3">
                Produtos
              </Label>
              <div className="col-span-3 space-y-2">
                <ComboBox
                  placeholder="Adicionar produto"
                  items={products.filter(p => !selectedProducts.includes(p.id)).map(product => ({
                    value: product.id,
                    label: product.name
                  }))}
                  onSelect={handleProductSelect}
                />
                
                <ScrollArea className="h-24 w-full border rounded-md p-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map(productId => {
                      const product = products.find(p => p.id === productId);
                      if (!product) return null;
                      
                      return (
                        <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                          {product.name}
                          <button 
                            type="button" 
                            onClick={() => removeProduct(productId)}
                            className="rounded-full hover:bg-destructive/20"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      );
                    })}
                    
                    {selectedProducts.length === 0 && (
                      <span className="text-muted-foreground text-sm">Nenhum produto selecionado</span>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isRefundable" className="text-right">
                Reembolsável
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox 
                  id="isRefundable" 
                  checked={formData.isRefundable || false}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange("isRefundable", checked === true)
                  }
                />
                <label
                  htmlFor="isRefundable"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Esta transação pode ser reembolsada
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right pt-2">
                Observações
              </Label>
              <Textarea
                id="notes"
                name="notes"
                className="col-span-3 min-h-[80px]"
                value={formData.notes || ""}
                onChange={handleFormChange}
              />
            </div>
            
            {formData.type === 'refund' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="relatedTransactionId" className="text-right">
                  Transação Original
                </Label>
                <Input
                  id="relatedTransactionId"
                  name="relatedTransactionId"
                  className="col-span-3"
                  value={formData.relatedTransactionId || ""}
                  onChange={handleFormChange}
                  placeholder="ID da transação que está sendo reembolsada"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Salvar Alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
