import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  FINANCEIRO_SCRIPT_URL, 
  CLIENTES_SCRIPT_URL, 
  OPERACOES_SCRIPT_URL,
  SHEET_URL 
} from "@/types/models";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCcw, Save, Trash2 } from "lucide-react";
import { 
  FINANCEIRO_SHEET_URL, 
  CLIENTES_SHEET_URL, 
  OPERACOES_SHEET_URL, 
  updateScriptUrls 
} from "@/services/googleSheets";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Configuracoes = () => {
  const { theme, setTheme } = useTheme();
  const { clearData, refreshData } = useData();
  const { userProfile } = useAuth();
  
  // Form state
  const [financeiroUrl, setFinanceiroUrl] = useState(FINANCEIRO_SHEET_URL);
  const [clientesUrl, setClientesUrl] = useState(CLIENTES_SHEET_URL);
  const [operacoesUrl, setOperacoesUrl] = useState(OPERACOES_SHEET_URL);
  
  const [financeiroScriptUrl, setFinanceiroScriptUrl] = useState(FINANCEIRO_SCRIPT_URL);
  const [clientesScriptUrl, setClientesScriptUrl] = useState(CLIENTES_SCRIPT_URL);
  const [operacoesScriptUrl, setOperacoesScriptUrl] = useState(OPERACOES_SCRIPT_URL);
  
  const [username, setUsername] = useState(userProfile?.username || "");
  const [avatar, setAvatar] = useState(userProfile?.avatar || "");
  
  // Update the form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || "");
      setAvatar(userProfile.avatar || "");
    }
  }, [userProfile]);
  
  const saveUserProfile = async () => {
    if (!userProfile?.id) {
      toast.error("Você precisa estar logado para salvar as alterações.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userProfile.id,
          username,
          avatar
        });
        
      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao salvar perfil: " + error.message);
    }
  };
  
  const saveIntegrationSettings = () => {
    try {
      updateScriptUrls(
        financeiroScriptUrl, 
        clientesScriptUrl, 
        operacoesScriptUrl,
        financeiroUrl,
        clientesUrl,
        operacoesUrl
      );
      toast.success("Configurações de integração salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações. Verifique o console para mais detalhes.");
    }
  };
  
  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="heading-xl">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize o sistema e gerencie suas preferências
          </p>
        </div>

        <Tabs defaultValue="appearance">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="theme">Tema Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ative o tema escuro para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    id="theme"
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <p className="text-sm text-muted-foreground">
                  Suas preferências são salvas automaticamente
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Dados</CardTitle>
                <CardDescription>
                  Gerencie os dados do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-amber-50 dark:bg-amber-900/20">
                  <AlertTitle>Atenção!</AlertTitle>
                  <AlertDescription>
                    As ações nesta seção podem resultar em perda permanente de dados. 
                    Certifique-se de fazer backup antes de prosseguir.
                  </AlertDescription>
                </Alert>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Sincronizar com Google Sheets</h3>
                    <p className="text-sm text-muted-foreground">
                      Sincronize todos os dados com sua planilha do Google
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={refreshData}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Sincronizar
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Limpar Todos os Dados</h3>
                    <p className="text-sm text-muted-foreground">
                      Remova todos os dados do sistema. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                    onClick={clearData}
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="avatar">URL do Avatar</Label>
                  <Input 
                    id="avatar" 
                    value={avatar} 
                    onChange={(e) => setAvatar(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Digite a URL de uma imagem para usar como seu avatar
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="flex items-center gap-2"
                  onClick={saveUserProfile}
                >
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">URLs das Planilhas Google</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="financeiro-sheet-url">URL da Planilha Financeiro</Label>
                        <Input 
                          id="financeiro-sheet-url" 
                          value={financeiroUrl} 
                          onChange={(e) => setFinanceiroUrl(e.target.value)} 
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="clientes-sheet-url">URL da Planilha Clientes</Label>
                        <Input 
                          id="clientes-sheet-url" 
                          value={clientesUrl} 
                          onChange={(e) => setClientesUrl(e.target.value)} 
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="operacoes-sheet-url">URL da Planilha Operações</Label>
                        <Input 
                          id="operacoes-sheet-url" 
                          value={operacoesUrl} 
                          onChange={(e) => setOperacoesUrl(e.target.value)} 
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">URLs dos Scripts Google Apps</h3>
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="financeiro-script-url">URL do Script Financeiro</Label>
                        <Input 
                          id="financeiro-script-url" 
                          value={financeiroScriptUrl} 
                          onChange={(e) => setFinanceiroScriptUrl(e.target.value)} 
                          placeholder="https://script.google.com/macros/s/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          URL da API do Script para a planilha Financeiro
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="clientes-script-url">URL do Script Clientes</Label>
                        <Input 
                          id="clientes-script-url" 
                          value={clientesScriptUrl} 
                          onChange={(e) => setClientesScriptUrl(e.target.value)} 
                          placeholder="https://script.google.com/macros/s/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          URL da API do Script para a planilha Clientes
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="operacoes-script-url">URL do Script Operações</Label>
                        <Input 
                          id="operacoes-script-url" 
                          value={operacoesScriptUrl} 
                          onChange={(e) => setOperacoesScriptUrl(e.target.value)} 
                          placeholder="https://script.google.com/macros/s/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          URL da API do Script para a planilha Operações
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <h3 className="font-semibold">Instruções de Integração</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Crie três planilhas separadas no Google Sheets: Financeiro, Clientes e Operações</li>
                      <li>Para cada planilha, vá em Extensões &gt; Apps Script</li>
                      <li>Cole o código de script correspondente (disponível na documentação)</li>
                      <li>Implante cada script como aplicativo web (Execute como: Você / Quem tem acesso: Qualquer pessoa)</li>
                      <li>Copie as URLs geradas e cole nos campos acima</li>
                      <li>Salve as configurações para atualizar o sistema</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="flex items-center gap-2"
                  onClick={saveIntegrationSettings}
                >
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default Configuracoes;
