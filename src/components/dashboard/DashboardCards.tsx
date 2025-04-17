
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, ResponsiveContainer, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters";

export function DashboardCards() {
  const { dashboardSummary, transactions } = useData();

  // Format transactions for chart
  const lastSixMonths = getLastSixMonths();
  const monthlyData = lastSixMonths.map(month => {
    const income = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(month.value))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(month.value))
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: month.label,
      income,
      expenses
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(dashboardSummary.totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de receitas no período
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(dashboardSummary.totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de despesas no período
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {dashboardSummary.customersCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de clientes cadastrados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Produtos com Estoque Baixo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-warning">
            {dashboardSummary.lowStockCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Produtos abaixo do estoque mínimo
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                name="Receitas" 
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                name="Despesas" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Análise de Categorias</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getCategoryData(transactions)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="value" fill="#3B82F6" name="Valor" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getLastSixMonths() {
  const months = [];
  const date = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const monthValue = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = month.toLocaleDateString('pt-BR', { month: 'short' });
    months.push({ value: monthValue, label: monthLabel });
  }
  
  return months;
}

function getCategoryData(transactions: any[]) {
  const categories: Record<string, number> = {};
  
  transactions.forEach(transaction => {
    if (!categories[transaction.category]) {
      categories[transaction.category] = 0;
    }
    
    if (transaction.type === 'income') {
      categories[transaction.category] += transaction.amount;
    } else {
      categories[transaction.category] -= transaction.amount;
    }
  });
  
  return Object.entries(categories).map(([name, value]) => ({
    name,
    value: Math.abs(value),
  }));
}
