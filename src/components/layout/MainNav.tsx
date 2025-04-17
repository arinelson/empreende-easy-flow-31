
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";
import { useIsMobile } from "@/hooks/use-mobile";

export function MainNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Financeiro",
      path: "/financeiro",
    },
    {
      name: "Clientes",
      path: "/clientes",
    },
    {
      name: "Operações",
      path: "/operacoes",
    },
    {
      name: "Relatórios",
      path: "/relatorios",
    },
    {
      name: "Configurações",
      path: "/configuracoes",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Mobile navigation
  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-4 h-14 border-b">
        <Link to="/dashboard" className="font-bold text-lg">
          EasyFlow
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-end">
                  <UserNav />
                </div>
                <div className="grid gap-2">
                  {routes.map((route) => (
                    <Link
                      key={route.path}
                      to={route.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center py-2 px-3 rounded-md",
                        isActive(route.path)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      {route.name}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // Desktop navigation
  return (
    <div className="flex items-center justify-between px-8 h-16 border-b">
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="font-bold text-xl">
          EasyFlow
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {routes.map((route) => (
              <NavigationMenuItem key={route.path}>
                <Link to={route.path}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      isActive(route.path) &&
                        "bg-muted text-foreground font-medium"
                    )}
                  >
                    {route.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserNav />
      </div>
    </div>
  );
}
