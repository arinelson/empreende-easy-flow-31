
import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { Download, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const { refreshData, exportToExcel, isLoading } = useData();
  const [showExportOptions, setShowExportOptions] = useState(false);

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="heading-xl">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu negócio
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowExportOptions(!showExportOptions)} 
              variant="outline"
              size="sm"
              className="whitespace-nowrap flex gap-2 items-center"
            >
              <ExternalLink size={16} />
              {showExportOptions ? "Ocultar Exportações" : "Exportar Dados"}
            </Button>
            <Button 
              onClick={() => refreshData()} 
              disabled={isLoading}
              className="whitespace-nowrap flex gap-2 items-center"
              size="sm"
            >
              <RefreshCw size={16} />
              {isLoading ? "Sincronizando..." : "Sincronizar Dados"}
            </Button>
          </div>
        </div>

        {showExportOptions && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>
                Exporte os dados do sistema para Excel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  onClick={() => exportToExcel('transactions')} 
                  variant="outline" 
                  className="flex gap-2 items-center"
                >
                  <Download size={16} />
                  Transações
                </Button>
                <Button 
                  onClick={() => exportToExcel('customers')} 
                  variant="outline" 
                  className="flex gap-2 items-center"
                >
                  <Download size={16} />
                  Clientes
                </Button>
                <Button 
                  onClick={() => exportToExcel('products')} 
                  variant="outline" 
                  className="flex gap-2 items-center"
                >
                  <Download size={16} />
                  Produtos
                </Button>
                <Button 
                  onClick={() => exportToExcel('suppliers')} 
                  variant="outline" 
                  className="flex gap-2 items-center"
                >
                  <Download size={16} />
                  Fornecedores
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <DashboardCards />
          <RecentTransactions />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
