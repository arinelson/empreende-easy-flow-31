
import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncLog } from "@/services/googleSheets";
import { ScrollArea } from "@/components/ui/scroll-area";

const Dashboard = () => {
  const { syncWithSheet, isLoading } = useData();
  const [showLogs, setShowLogs] = useState(false);

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
              onClick={() => setShowLogs(!showLogs)} 
              variant="outline"
              size="sm"
              className="whitespace-nowrap flex gap-2 items-center"
            >
              <ExternalLink size={16} />
              {showLogs ? "Ocultar logs" : "Ver logs"}
            </Button>
            <Button 
              onClick={syncWithSheet} 
              disabled={isLoading}
              className="whitespace-nowrap flex gap-2 items-center"
              size="sm"
            >
              <Download size={16} />
              {isLoading ? "Sincronizando..." : "Sincronizar com Google Sheets"}
            </Button>
          </div>
        </div>

        {showLogs && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Logs de Sincronização</CardTitle>
              <CardDescription>
                Registro das operações com Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] rounded-md border p-2">
                {syncLog.getLogs().length > 0 ? (
                  <div className="space-y-2">
                    {syncLog.getLogs().map((log, index) => (
                      <div key={index} className="text-sm border-b pb-1 last:border-0">
                        <div className="flex gap-2 justify-between text-xs text-muted-foreground">
                          <span>{new Date(log.timestamp).toLocaleString()}</span>
                          <span className={`font-medium ${
                            log.status.includes('Erro') ? 'text-destructive' : 
                            log.status.includes('Sucesso') ? 'text-green-500' : ''
                          }`}>{log.status}</span>
                        </div>
                        <div className="font-medium">{log.action}</div>
                        {log.details && <div className="text-xs text-muted-foreground">{log.details}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum log disponível. Realize uma operação de sincronização.
                  </div>
                )}
              </ScrollArea>
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
