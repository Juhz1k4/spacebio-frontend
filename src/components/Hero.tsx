import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-card/50" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: "4s" }} />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary animate-glow" />
            <span className="text-sm text-primary font-medium">NASA Space Apps Challenge 2025</span>
          </div>

          {/* Main heading
              F0-2: o título anterior posicionava o produto como uma rede
              social de pesquisadores. Não existe nada disso aqui -- sem
              perfil, sem conexão entre pessoas, sem publicação de artigo.
              Prometia um produto diferente do que o código entrega.

              Os literais removidos NÃO são reproduzidos neste comentário de
              propósito: a F0-2 deixa uma verificação por grep, e citá-los aqui
              faria o próprio registro histórico disparar o alarme depois.
              A redação DEFINITIVA de posicionamento é escopo da A1; aqui o
              texto apenas descreve o que o sistema faz hoje. */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Evidência em
            <span className="block text-gradient mt-2">Biologia Espacial</span>
          </h1>

          {/* Description
              F0-2: dizia "conecte-se com pesquisadores, publique artigos
              científicos". Nenhuma das duas coisas existe. */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Pergunte sobre biologia espacial e veja exatamente quais trechos de
            artigos revisados por pares sustentam cada resposta — ou que nenhum
            sustenta.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button 
              size="lg" 
              className="gradient-cosmic hover:opacity-90 transition-opacity text-lg h-14 px-8 glow-primary"
              onClick={() => navigate("/ai-assistant")}
            >
              Perguntar à Dra. Aris
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary/30 hover:bg-primary/10 text-lg h-14 px-8"
              onClick={() => navigate("/ai-assistant")}
            >
              Ver como a evidência é citada
            </Button>
          </div>

          {/* F0-2 -- O BLOCO DE NÚMEROS FOI REMOVIDO, NÃO CORRIGIDO.
              ==================================================================
              Eram três números inventados: contagem de pesquisadores, de
              artigos publicados e de disponibilidade contínua. Nenhum tinha
              origem -- não há cadastro de pesquisador, nada foi publicado
              através desta interface, e disponibilidade não é medida em lugar
              nenhum. Os valores literais ficaram fora deste comentário para
              não disparar a verificação por grep da própria F0-2.

              NÃO foram substituídos pelos números verdadeiros (493 publicações,
              45.947 trechos, ~980 entidades) DE PROPÓSITO. Escrevê-los à mão
              aqui criaria o mesmo problema numa forma mais difícil de
              perceber: um número correto hoje e silenciosamente errado no dia
              em que o acervo mudar.

              A A1 traz de volta este bloco lendo GET /api/v1/stats, que conta
              no grafo a cada requisição. Até lá, a ausência é a opção
              honesta. */}
        </div>
      </div>
    </section>
  );
};
