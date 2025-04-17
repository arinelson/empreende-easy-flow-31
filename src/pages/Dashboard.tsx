
import { PageLayout } from "@/components/layout/PageLayout";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { Download } from "lucide-react";

const Dashboard = () => {
  const { syncWithSheet } = useData();

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="heading-xl">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu negócio
            </p>
          </div>
          <Button onClick={syncWithSheet} className="flex gap-2 items-center">
            <Download size={16} />
            Sincronizar com Google Sheets
          </Button>
        </div>

        <div className="space-y-6">
          <DashboardCards />
          <RecentTransactions />
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
