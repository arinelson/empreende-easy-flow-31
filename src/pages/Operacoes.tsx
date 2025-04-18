import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Plus, Search, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

const Operacoes = () => {
  const { products, addProduct, deleteProduct, exportToExcel } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    cost: 0,
    stock: 0,
    category: "Produto",
    minimumStock: 10,
    supplier: "",
  });

  // Handle form changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: ["price", "cost", "stock", "minimumStock"].includes(name) 
        ? parseFloat(value) 
        : value
    });
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(formData);
    setOpenAddDialog(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      cost: 0,
      stock: 0,
      category: "Produto",
      minimumStock: 10,
      supplier: "",
    });
  };

  // Calculate stock status
  const getStockStatus = (stock: number, minimumStock: number = 10) => {
    if (stock <= 0) return { status: "Sem estoque", variant: "destructive" };
    if (stock < minimumStock) return { status: "Estoque baixo", variant: "warning" };
    return { status: "Em estoque", variant: "success" };
  };

  // Calculate stock percentage for progress bar
  const getStockPercentage = (stock: number, minimumStock: number = 10) => {
    if (stock <= 0) return 0;
    if (stock >= minimumStock * 2) return 100;
    return (stock / (minimumStock * 2)) * 100;
  };

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count products by stock status
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < (p.minimumStock || 10)).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const inStockCount = products.filter(p => p.stock >= (p.minimumStock || 10)).length;

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-xl">Operações e Logística</h1>
            <p className="text-muted-foreground">
              Gerencie seu estoque e produtos
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => exportToExcel('products')} 
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
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Produto</DialogTitle>
                  <DialogDescription>
                    Preencha os campos para adicionar um novo produto
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
                      <Label htmlFor="description" className="text-right">
                        Descrição
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        className="col-span-3"
                        value={formData.description}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">
                        Preço de Venda
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="col-span-3"
                        value={formData.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cost" className="text-right">
                        Custo
                      </Label>
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        className="col-span-3"
                        value={formData.cost}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">
                        Estoque Atual
                      </Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        className="col-span-3"
                        value={formData.stock}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="minimumStock" className="text-right">
                        Estoque Mínimo
                      </Label>
                      <Input
                        id="minimumStock"
                        name="minimumStock"
                        type="number"
                        min="0"
                        className="col-span-3"
                        value={formData.minimumStock}
                        onChange={handleFormChange}
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
                          <SelectItem value="Produto">Produto</SelectItem>
                          <SelectItem value="Serviço">Serviço</SelectItem>
                          <SelectItem value="Insumo">Insumo</SelectItem>
                          <SelectItem value="Equipamento">Equipamento</SelectItem>
                          <SelectItem value="Material">Material</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier" className="text-right">
                        Fornecedor
                      </Label>
                      <Input
                        id="supplier"
                        name="supplier"
                        className="col-span-3"
                        value={formData.supplier}
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
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Em Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{inStockCount}</div>
              <div className="text-xs text-muted-foreground">Produtos com estoque normal</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Estoque Baixo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
              <div className="text-xs text-muted-foreground">Produtos abaixo do estoque mínimo</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sem Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
              <div className="text-xs text-muted-foreground">Produtos sem estoque disponível</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2 items-center">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>
              Lista de produtos cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock, product.minimumStock);
                    const stockPercentage = getStockPercentage(product.stock, product.minimumStock);
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div>{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-muted-foreground">{product.description}</div>
                          )}
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm">{product.stock} unidades</div>
                            <Progress value={stockPercentage} className="h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant as any}>
                            {stockStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum produto encontrado
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

export default Operacoes;
