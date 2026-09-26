import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">
            <header className="sticky top-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-6">
              <SidebarTrigger />
            </header>
            {/* A1: o Hero e o Features sairam daqui. Eram a landing PUBLICA
                renderizada dentro da area logada, o que punha a pagina
                inicial atras do login. Agora vivem em `/` (src/pages/Index.tsx).

                Esta tela continua sendo a area autenticada, agora em
                /dashboard. O conteudo dela e escopo da A6, que decide o que
                fica quando as telas de rede social forem desligadas. */}
            <div className="p-6">
              <h1 className="text-2xl font-semibold">Area do pesquisador</h1>
              <p className="mt-2 text-muted-foreground">
                Use o menu lateral para abrir a Dra. Aris.
              </p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
