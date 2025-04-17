
import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { Download, ExternalLink, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncLog, testCorsMethod, setCorsMethod, getCurrentCorsMethod, CorsMethod } from "@/services/googleSheets";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const corsMethodOptions: { value: CorsMethod, label: string }[] = [
  { value: 'direct', label: 'Direto (Padrão)' },
  { value: 'proxy', label: 'Proxy CORS' },
  { value: 'no-cors', label: 'No-CORS Mode' },
  { value: 'no-cache', label: 'No-Cache' },
  { value: 'xhr', label: 'XMLHttpRequest' },
  { value: 'jsonp', label: 'JSONP' },
  { value: 'iframe', label: 'IFrame' }
];

const Dashboard = () => {
  const { syncWithSheet, isLoading } = useData();
  const [showLogs, setShowLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "diagnostic">("logs");
  const [testResults, setTestResults] = useState<{method: CorsMethod, success: boolean, error?: string}[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [currentMethod, setCurrentMethod] = useState<CorsMethod>(getCurrentCorsMethod());

  const runDiagnostic = async () => {
    setIsTesting(true);
    setTestResults([]);
    toast.info("Executando diagnóstico de CORS...");
    
    const methods: CorsMethod[] = ['direct', 'proxy', 'no-cors', 'no-cache', 'xhr'];
    const results = [];
    
    for (const method of methods) {
      try {
        // Teste simples de GET
        const result = await testCorsMethod(
          "https://script.google.com/macros/s/AKfycbzTbxsxRu_Eic9g1m45GJ_8Eaor4tfDatSNl--35JsRG-hofoLrTL9mceBPwwdkOPzf-w/exec?action=importTransactions",
          method
        );
        
        results.push({
          method,
          success: result.success,
          error: result.error
        });
      } catch (error) {
        results.push({
          method,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    setTestResults(results);
    
    // Encontrar o melhor método
    const successfulMethods = results.filter(r => r.success);
    if (successfulMethods.length > 0) {
      const bestMethod = successfulMethods[0].method;
      setCorsMethod(bestMethod);
      setCurrentMethod(bestMethod);
      toast.success(`Método CORS ideal encontrado: ${bestMethod}`);
    } else {
      toast.error("Nenhum método CORS foi bem-sucedido. Tente novamente mais tarde.");
    }
    
    setIsTesting(false);
  };

  const changeMethod = (method: CorsMethod) => {
    setCorsMethod(method);
    setCurrentMethod(method);
    toast.success(`Método de sincronização alterado para: ${method}`);
  };

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
              <CardTitle>Operações com Google Sheets</CardTitle>
              <CardDescription>
                Registros de sincronização e diagnóstico de CORS
              </CardDescription>
              
              <Tabs defaultValue="logs" value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="logs">Logs de Sincronização</TabsTrigger>
                  <TabsTrigger value="diagnostic">Diagnóstico de CORS</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="logs" className="space-y-4">
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
              </TabsContent>
              
              <TabsContent value="diagnostic" className="space-y-4">
                <div className="flex flex-col gap-4">
                  <Alert className="bg-blue-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Método CORS atual: {currentMethod}</AlertTitle>
                    <AlertDescription>
                      O método atual é usado para todas as operações de sincronização.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {corsMethodOptions.map(option => (
                      <Button
                        key={option.value}
                        variant={currentMethod === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => changeMethod(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex justify-between gap-2">
                    <Button 
                      onClick={runDiagnostic} 
                      disabled={isTesting}
                      className="flex gap-2 items-center"
                    >
                      {isTesting ? "Executando testes..." : "Executar diagnóstico automático"}
                    </Button>
                  </div>
                  
                  {testResults.length > 0 && (
                    <ScrollArea className="h-[200px] rounded-md border p-2">
                      <div className="space-y-2">
                        {testResults.map((result, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border-b last:border-0">
                            {result.success ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-destructive" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{corsMethodOptions.find(o => o.value === result.method)?.label}</div>
                              {!result.success && result.error && (
                                <div className="text-xs text-muted-foreground">{result.error}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
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
