
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
import { Download, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FinancialTransaction } from "@/types/models";

const Financeiro = () => {
  const { 
    transactions, 
    addTransaction, 
    deleteTransaction,
    exportToSheet,
    dashboardSummary
  } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Form state with properly typed transaction type
  const [formData, setFormData] = useState<Omit<FinancialTransaction, "id">>({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "Vendas",
    type: "income", // Explicitly use "income" as the initial value
    paymentMethod: "Dinheiro",
  });

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "amount" ? parseFloat(value) : value });
  };

  // Handle select changes with proper typing for type
  const handleSelectChange = (name: string, value: string) => {
    if (name === "type") {
      // Ensure type is only "income" or "expense"
      setFormData({ 
        ...formData, 
        [name]: value as "income" | "expense"
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
    });
  };

  // Filter transactions based on search
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Button onClick={() => exportToSheet('transactions')} variant="outline" className="flex gap-2 items-center">
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
              <DialogContent>
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
                        Valor
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
                          <SelectItem value="Aluguel">Aluguel</SelectItem>
                          <SelectItem value="Salários">Salários</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Insumos">Insumos</SelectItem>
                          <SelectItem value="Impostos">Impostos</SelectItem>
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
                        </SelectContent>
                      </Select>
                    </div>
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
                  <TableHead>Categoria</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead></TableHead>
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
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? "success" : "destructive"}
                        >
                          {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Financeiro;
