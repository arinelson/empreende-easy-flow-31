import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPhone } from "@/lib/formatters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, MessageSquare, Plus, Search, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Customer } from "@/types/models";

const Clientes = () => {
  const { customers, addCustomer, deleteCustomer, exportToSheet } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Form state with properly typed status
  const [formData, setFormData] = useState<Omit<Customer, "id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    joinDate: new Date().toISOString().split('T')[0],
    totalPurchases: 0,
    lastPurchase: "",
    notes: "",
    status: "active", // Explicitly use "active" as the initial value
  });

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === "totalPurchases" ? parseFloat(value) : value
    });
  };

  // Handle select changes with proper typing for status
  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      // Ensure status is only "active" or "inactive"
      setFormData({ 
        ...formData, 
        [name]: value as "active" | "inactive"
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer(formData);
    setOpenAddDialog(false);
    resetForm();
  };

  // Reset form with properly typed status
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      joinDate: new Date().toISOString().split('T')[0],
      totalPurchases: 0,
      lastPurchase: "",
      notes: "",
      status: "active", // Explicitly use "active" as the initial value
    });
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = (phone: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent("Olá! Gostaríamos de saber como foi sua experiência com nosso produto/serviço. Por favor, avalie-nos: https://forms.gle/example");
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-xl">Gestão de Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e acompanhe suas interações
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => exportToSheet('customers')} 
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
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Cliente</DialogTitle>
                  <DialogDescription>
                    Preencha os campos para adicionar um novo cliente
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
                      <Label htmlFor="address" className="text-right">
                        Endereço
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        className="col-span-3"
                        value={formData.address}
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
                        className="col-span-3"
                        value={formData.totalPurchases}
                        onChange={handleFormChange}
                      />
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="notes" className="text-right">
                        Observações
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        className="col-span-3"
                        value={formData.notes}
                        onChange={handleFormChange}
                      />
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
        
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
            <CardDescription>
              Visão geral da sua base de clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Total de Clientes</div>
                <div className="text-2xl font-bold">{customers.length}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Clientes Ativos</div>
                <div className="text-2xl font-bold text-success">
                  {customers.filter(c => c.status === 'active').length}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Clientes Inativos</div>
                <div className="text-2xl font-bold text-destructive">
                  {customers.filter(c => c.status === 'inactive').length}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-2 items-center">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Lista de clientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead>Total de Compras</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div>{customer.email}</div>
                        <div className="text-muted-foreground">{formatPhone(customer.phone)}</div>
                      </TableCell>
                      <TableCell>{formatDate(customer.joinDate)}</TableCell>
                      <TableCell>{customer.totalPurchases}</TableCell>
                      <TableCell>
                        <Badge
                          variant={customer.status === 'active' ? "success" : "destructive"}
                        >
                          {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => sendWhatsAppMessage(customer.phone)}
                            title="Enviar feedback via WhatsApp"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCustomer(customer.id)}
                            title="Remover cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum cliente encontrado
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

export default Clientes;
