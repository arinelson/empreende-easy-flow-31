
import { PageLayout } from "@/components/layout/PageLayout";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, PieChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Download } from "lucide-react";

const Relatorios = () => {
  const { transactions, customers, products } = useData();

  // Calculate financial data by month
  const financialByMonth = getFinancialByMonth(transactions);
  
  // Calculate transactions by category
  const transactionsByCategory = getTransactionsByCategory(transactions);
  
  // Calculate product distribution data
  const productDistribution = getProductDistribution(products);
  
  // Customer acquisition data
  const customerAcquisition = getCustomerAcquisition(customers);

  // Colors for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];
  
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-xl">Relatórios e Dashboards</h1>
            <p className="text-muted-foreground">
              Visualize dados e indicadores do seu negócio
            </p>
          </div>
          
          <Button className="flex gap-2 items-center">
            <Download size={16} />
            Exportar Relatórios
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
              <CardDescription>Evolução das receitas e despesas nos últimos meses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10B981" name="Receitas" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="Despesas" strokeWidth={2} />
                  <Line type="monotone" dataKey="balance" stroke="#4F46E5" name="Saldo" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Transações por Categoria</CardTitle>
              <CardDescription>Distribuição das transações por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transactionsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Produtos por Categoria</CardTitle>
              <CardDescription>Quantidade de produtos por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#6366F1" name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Aquisição de Clientes</CardTitle>
              <CardDescription>Novos clientes ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerAcquisition}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newCustomers" fill="#10B981" name="Novos Clientes" />
                  <Bar dataKey="accumulated" fill="#8B5CF6" name="Total Acumulado" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>KPIs Principais</CardTitle>
            <CardDescription>Indicadores-chave de desempenho do seu negócio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">Taxa de Lucratividade</div>
                <div className="text-2xl font-bold">{calculateProfitability(transactions)}%</div>
                <div className="text-xs text-muted-foreground">(Lucro / Receitas) * 100</div>
              </div>
              
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">Taxa de Crescimento</div>
                <div className="text-2xl font-bold">{calculateGrowthRate(transactions)}%</div>
                <div className="text-xs text-muted-foreground">Últimos 3 meses vs anteriores</div>
              </div>
              
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">Valor Médio de Compra</div>
                <div className="text-2xl font-bold">{formatCurrency(calculateAverageOrder(transactions))}</div>
                <div className="text-xs text-muted-foreground">Receitas / Número de transações</div>
              </div>
              
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">Total de Produtos</div>
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-xs text-muted-foreground">Cadastrados no sistema</div>
              </div>
              
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">Total de Clientes</div>
                <div className="text-2xl font-bold">{customers.length}</div>
                <div className="text-xs text-muted-foreground">Cadastrados no sistema</div>
              </div>
              
              <div className="p-4 border rounded-lg flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">Produtos Esgotados</div>
                <div className="text-2xl font-bold">{products.filter(p => p.stock <= 0).length}</div>
                <div className="text-xs text-muted-foreground">Sem estoque disponível</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

// Auxiliary functions for data processing

function getFinancialByMonth(transactions: any[]) {
  const months: Record<string, { month: string, income: number, expenses: number, balance: number }> = {};
  
  // Get last 6 months
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
    
    months[monthKey] = {
      month: monthName,
      income: 0,
      expenses: 0,
      balance: 0,
    };
  }
  
  // Aggregate transaction data by month
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (months[monthKey]) {
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expenses += transaction.amount;
      }
      months[monthKey].balance = months[monthKey].income - months[monthKey].expenses;
    }
  });
  
  return Object.values(months);
}

function getTransactionsByCategory(transactions: any[]) {
  const categories: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = 0;
    }
    categories[transaction.category] += transaction.amount;
  });
  
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value,
  }));
}

function getProductDistribution(products: any[]) {
  const categories: Record<string, number> = {};
  
  products.forEach(product => {
    if (!categories[product.category]) {
      categories[product.category] = 0;
    }
    categories[product.category] += 1;
  });
  
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value,
  }));
}

function getCustomerAcquisition(customers: any[]) {
  const months: Record<string, { month: string, newCustomers: number, accumulated: number }> = {};
  let accumulated = 0;
  
  // Get last 6 months
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
    
    months[monthKey] = {
      month: monthName,
      newCustomers: 0,
      accumulated: 0,
    };
  }
  
  // Count customers by join date
  customers.forEach(customer => {
    if (!customer.joinDate) return;
    
    const date = new Date(customer.joinDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (months[monthKey]) {
      months[monthKey].newCustomers += 1;
    }
  });
  
  // Calculate accumulated values
  Object.keys(months).sort().forEach(month => {
    accumulated += months[month].newCustomers;
    months[month].accumulated = accumulated;
  });
  
  return Object.values(months);
}

function calculateProfitability(transactions: any[]) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  if (income === 0) return 0;
  return Math.round(((income - expenses) / income) * 100);
}

function calculateGrowthRate(transactions: any[]) {
  // Get transactions from the last 3 months and previous 3 months
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  
  const recentTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= threeMonthsAgo && date <= now && t.type === 'income';
  });
  
  const previousTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= sixMonthsAgo && date < threeMonthsAgo && t.type === 'income';
  });
  
  const recentTotal = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const previousTotal = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
  return Math.round(((recentTotal - previousTotal) / previousTotal) * 100);
}

function calculateAverageOrder(transactions: any[]) {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  if (incomeTransactions.length === 0) return 0;
  
  const total = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  return total / incomeTransactions.length;
}

export default Relatorios;
