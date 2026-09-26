/**
 * SPACEBIO A1 — página inicial
 *
 * O QUE ESTA TELA PRECISA FAZER
 * -----------------------------
 * Dizer, em três segundos, o que o produto é e o que o torna diferente. O
 * diferencial não é "usa IA" — é que toda afirmação é rastreável até o artigo,
 * e que a ausência de evidência é dita em voz alta em vez de disfarçada.
 *
 * OS NÚMEROS VÊM DA API, SEMPRE
 * -----------------------------
 * Esta tela já exibiu três contagens inventadas, removidas na F0-2. A A1 as
 * traz de volta lendo `GET /api/v1/stats`, que conta no grafo.
 *
 * Escrever 493 e 45.947 à mão aqui seria o mesmo defeito numa forma pior:
 * correto hoje, silenciosamente errado quando o acervo mudar, e ninguém
 * revisa porque parece certo. A única constante escrita à mão na interface é
 * o tamanho do conjunto oficial do desafio, documentada em `i18n/pt-BR.ts` —
 * e ela não existe no nosso grafo, então não há de onde contá-la.
 *
 * A TELA RENDERIZA SEM O BACKEND
 * ------------------------------
 * Se `/api/v1/stats` falhar (Neo4j fora do ar responde 503), o texto continua
 * e o bloco de números diz que a contagem está indisponível. Esconder o bloco
 * faria o visitante achar que o produto não tem números; mentir um valor
 * padrão seria pior ainda.
 */

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { landing } from "@/i18n/pt-BR";
import { fetchStats } from "@/lib/api";
import type { PublicStats } from "@/types/stats";

/** Separador de milhar em português: 45947 -> "45.947". */
function formatar(valor: number): string {
  return valor.toLocaleString("pt-BR");
}

export const Hero = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    // `cancelado` evita atualizar estado depois que o componente saiu da
    // tela -- o visitante pode clicar num botão antes de a contagem voltar.
    let cancelado = false;
    fetchStats()
      .then((dados) => {
        if (!cancelado) setStats(dados);
      })
      .catch(() => {
        // A falha não é registrada como erro no console: backend fora do ar
        // é uma condição esperada desta tela, não um defeito.
        if (!cancelado) setFalhou(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

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
          {/* Selo: nomeia o desafio inteiro, e não só o evento. Quem chega
              pelo lançamento reconhece o contexto sem precisar ler a página
              "Sobre". */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary animate-glow" aria-hidden />
            <span className="text-xs sm:text-sm text-primary font-medium">
              {landing.selo}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {landing.titulo.linha1}
            <span className="block text-gradient mt-2">{landing.titulo.linha2}</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            {landing.subtitulo}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              size="lg"
              className="gradient-cosmic hover:opacity-90 transition-opacity text-lg h-14 px-8 glow-primary"
              onClick={() => navigate("/ai-assistant")}
            >
              {landing.acoes.perguntar}
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden />
            </Button>
            {/* O segundo botão aponta para a MESMA tela, de propósito.
                A especificação da A1 pede "Ver o panorama do acervo", levando
                a /panorama -- rota que a issue A2 cria e que hoje não existe.
                Um botão para 404 na primeira tela seria pior que um botão a
                menos. Quando a A2 entrar, este destino muda. */}
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 text-lg h-14 px-8"
              onClick={() => navigate("/ai-assistant")}
            >
              {landing.acoes.verEvidencia}
            </Button>
          </div>

          <StatsBlock stats={stats} falhou={falhou} />
        </div>
      </div>
    </section>
  );
};

/**
 * Os três números do acervo, com a nota de cobertura.
 *
 * Três estados, todos honestos:
 *   carregando     rótulos visíveis, valores com marcador de espera
 *   carregado      valores do grafo, com a linha "N das 608"
 *   indisponível   diz que a contagem falhou, sem inventar valor
 */
function StatsBlock({
  stats,
  falhou,
}: {
  stats: PublicStats | null;
  falhou: boolean;
}) {
  const numeros = [
    { valor: stats?.publications, rotulo: landing.numeros.publicacoes, cor: "text-primary" },
    { valor: stats?.chunks, rotulo: landing.numeros.trechos, cor: "text-secondary" },
    { valor: stats?.entities, rotulo: landing.numeros.entidades, cor: "text-accent" },
  ];

  return (
    <div className="mt-16 w-full max-w-2xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {numeros.map(({ valor, rotulo, cor }) => (
          <div key={rotulo} className="space-y-2">
            <div className={`text-4xl font-bold ${cor}`}>
              {valor !== undefined ? (
                formatar(valor)
              ) : (
                // Traço em vez de zero: zero é um número, e mostrá-lo
                // enquanto a contagem não voltou seria afirmar algo falso.
                <span className="text-muted-foreground/40" aria-hidden>
                  —
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{rotulo}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/80">
        {stats
          ? landing.numeros.cobertura(stats.publications)
          : falhou
            ? landing.numeros.indisponivel
            : landing.numeros.carregando}
      </p>
    </div>
  );
}
