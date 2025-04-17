
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SHEET_URL } from "@/types/models";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCcw, Save, Trash2 } from "lucide-react";

const Configuracoes = () => {
  const { theme, setTheme } = useTheme();
  const { clearData, syncWithSheet } = useData();
  const { user } = useAuth();
  
  // Form state
  const [sheetUrl, setSheetUrl] = useState(SHEET_URL);
  const [username, setUsername] = useState(user?.username || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  
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
                    onClick={syncWithSheet}
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
                <Button className="flex items-center gap-2">
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
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="sheet-url">URL da Planilha Google</Label>
                  <Input 
                    id="sheet-url" 
                    value={sheetUrl} 
                    onChange={(e) => setSheetUrl(e.target.value)} 
                  />
                  <p className="text-xs text-muted-foreground">
                    URL da API do Google Apps Script para integração com Google Sheets
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <h3 className="font-semibold">Instruções de Integração</h3>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Crie uma planilha no Google Sheets</li>
                    <li>Adicione abas para cada módulo: Financeiro, Clientes, Produtos</li>
                    <li>No menu, vá em Extensões &gt; Apps Script</li>
                    <li>Crie uma API Web configurando um doGet e doPost</li>
                    <li>Implante como aplicativo web e copie a URL</li>
                    <li>Cole a URL no campo acima</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="flex items-center gap-2">
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
