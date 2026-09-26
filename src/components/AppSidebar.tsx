import { Home, MessageSquare, FileText, Sparkles, User, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { navegacao } from "@/i18n/pt-BR";

// A1 -- rótulos vindos de i18n/pt-BR.ts.
//
// "Dashboard" e "AI Assistant" estavam em inglês numa interface toda em
// português: parece descuido de tradução, não escolha. Viraram "Início" e
// "Dra. Aris", que é como a assistente é chamada no resto do produto.
//
// Os itens de rede social continuam aqui de propósito. Desligar Feed,
// Mensagens e Perfil é a issue A6, que os põe atrás de uma flag em vez de
// apagar o código -- e polir agora o que vai sair seria trabalho jogado fora.
const menuItems = [
  { title: navegacao.inicio, url: "/dashboard", icon: Home },
  { title: navegacao.feed, url: "/feed", icon: FileText },
  { title: navegacao.mensagens, url: "/chat", icon: MessageSquare },
  { title: navegacao.assistente, url: "/ai-assistant", icon: Sparkles },
  { title: navegacao.perfil, url: "/profile", icon: User },
  { title: navegacao.configuracoes, url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent>
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-cosmic flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gradient">SpaceBio</span>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary/20 text-primary font-medium"
                          : "hover:bg-accent/50"
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
