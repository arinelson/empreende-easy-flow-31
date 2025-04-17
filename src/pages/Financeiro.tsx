
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Plus, Search, Trash2, Edit, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FinancialTransaction } from "@/types/models";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ComboBox } from "@/components/ui/ComboBox";
import EditTransactionDialog from "@/components/financeiro/EditTransactionDialog";

const Financeiro = () => {
  const { 
    transactions, 
    customers,
    products,
    addTransaction, 
    updateTransaction,
    deleteTransaction,
    exportToSheet,
    syncWithSheet,
    dashboardSummary
  } = useData();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | undefined>(undefined);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Form state with properly typed transaction type
  const [formData, setFormData] = useState<Omit<FinancialTransaction, "id">>({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "Vendas",
    type: "income", // Explicitly use "income" as the initial value
    paymentMethod: "Dinheiro",
    status: "completed",
  });

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "amount" ? parseFloat(value) : value });
  };

  // Handle select changes with proper typing for type
  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      // Ensure type is only "income" or "expense" or "refund"
      setFormData({ 
        ...formData, 
        [name]: value as "income" | "expense" | "refund"
      });
    } else if (name === "status") {
      setFormData({
        ...formData,
        [name]: value as "pending" | "completed" | "canceled"
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
      setFormData({
        ...formData,
        customerId,
        customer: customer?.name || ''
      });
    } else {
      setFormData({
        ...formData,
        customerId: undefined,
        customer: undefined
      });
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
      
      setFormData({
        ...formData,
        productIds: newProducts,
        products: productNames
      });
    }
  };

  const removeProduct = (productId: string) => {
    const newProducts = selectedProducts.filter(id => id !== productId);
    setSelectedProducts(newProducts);
    
    const productNames = newProducts.map(id => {
      const product = products.find(p => p.id === id);
      return product?.name || '';
    });
    
    setFormData({
      ...formData,
      productIds: newProducts,
      products: productNames
    });
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction(formData);
    setOpenAddDialog(false);
    resetForm();
  };

  // Reset form with properly typed transaction type
  const resetForm = () => {
    setFormData({
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "Vendas",
      type: "income", // Explicitly use "income" as the initial value
      paymentMethod: "Dinheiro",
      status: "completed",
    });
    setSelectedCustomer(undefined);
    setSelectedProducts([]);
  };

  // Edit transaction
  const handleEdit = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (transaction.customer && transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-xl">Gestão Financeira</h1>
            <p className="text-muted-foreground">
              Controle suas receitas e despesas
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => syncWithSheet()}
              variant="outline"
              className="flex gap-2 items-center"
            >
              <RefreshCw size={16} />
              Sincronizar
            </Button>
            <Button 
              onClick={() => exportToSheet('transactions')} 
              variant="outline" 
              className="flex gap-2 items-center"
            >
              <Download size={16} />
              Exportar
            </Button>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex gap-2 items-center">
                  <Plus size={16} />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Transação</DialogTitle>
                  <DialogDescription>
                    Preencha os campos para adicionar uma nova transação
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
                        value={formData.paymentMethod} 
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
                    <Button type="submit">Adicionar</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(dashboardSummary.totalIncome)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(dashboardSummary.totalExpenses)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${dashboardSummary.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(dashboardSummary.balance)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2 items-center">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>
              Todas as transações registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.description}</TableCell>
                      <TableCell>{transaction.customer || "—"}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.status === 'completed' ? "outline" : 
                            transaction.status === 'pending' ? "secondary" : 
                            "destructive"
                          }
                        >
                          {transaction.status === 'completed' ? 'Concluído' : 
                           transaction.status === 'pending' ? 'Pendente' : 
                           'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transaction.type === 'income' ? "success" : 
                            transaction.type === 'refund' ? "secondary" : 
                            "destructive"
                          }
                        >
                          {transaction.type === 'income' ? 'Receita' : 
                           transaction.type === 'refund' ? 'Reembolso' : 
                           'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Edit Transaction Dialog */}
        {editingTransaction && (
          <EditTransactionDialog
            transaction={editingTransaction}
            open={!!editingTransaction}
            onOpenChange={(open) => !open && setEditingTransaction(null)}
            onUpdate={updateTransaction}
            customers={customers}
            products={products}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default Financeiro;
