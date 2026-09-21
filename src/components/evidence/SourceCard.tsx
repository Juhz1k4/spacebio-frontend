/**
 * SPACEBIO-025 — Cartão de fonte
 *
 * Renderiza uma passagem recuperada com a procedência completa: o trecho
 * literal, a publicação, o DOI e os canais que a encontraram.
 *
 * O TRECHO É O ATIVO
 * ------------------
 * Uma lista de links não comunica procedência — qualquer sistema mostra
 * links. O que distingue este é exibir *o texto que sustenta a afirmação*,
 * para que o leitor julgue por si.
 *
 * DOI AUSENTE APARECE COMO AUSENTE
 * --------------------------------
 * 5 das 493 publicações não têm DOI no cabeçalho do PMC. O §15.4 proíbe
 * fabricar; omitir em silêncio seria pior, porque sugeriria que a fonte não
 * foi verificada. Mostramos "DOI não disponível" de forma explícita.
 */

import { useState } from "react";
import { BookOpen, ExternalLink, Quote, Search, Sparkles, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceSource, RetrievalChannel } from "@/types/evidence";

/** Acima disto, a passagem ganha botão de expandir. */
const PASSAGE_PREVIEW_CHARS = 280;

const CHANNEL_INFO: Record<
  RetrievalChannel,
  { label: string; title: string; icon: typeof Sparkles }
> = {
  semantic: {
    label: "semântico",
    title: "Encontrado por proximidade de significado (embeddings)",
    icon: Sparkles,
  },
  lexical: {
    label: "termo exato",
    title: "Encontrado por correspondência de termos (BM25)",
    icon: Search,
  },
  entity: {
    label: "entidade",
    title: "Encontrado por entidades compartilhadas no grafo",
    icon: Network,
  },
};

interface SourceCardProps {
  source: EvidenceSource;
  /** Destacado ao ser alvo de uma citação clicada. */
  highlighted?: boolean;
}

export function SourceCard({ source, highlighted = false }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);

  // A extração HTML deixa o texto quebrado por itálicos: nomes de espécies e
  // genes viram linhas soltas. Normalizar o espaço em branco torna a
  // passagem legível sem alterar uma palavra do conteúdo.
  const passage = source.passage.replace(/\s+/g, " ").trim();
  const isLong = passage.length > PASSAGE_PREVIEW_CHARS;
  const shown = expanded || !isLong ? passage : `${passage.slice(0, PASSAGE_PREVIEW_CHARS)}…`;

  return (
    <article
      id={`source-${source.citation_index}`}
      className={cn(
        "scroll-mt-24 rounded-lg border p-4 transition-colors",
        source.cited
          ? "border-border bg-card"
          : // Recuperada mas não citada: presente para auditoria, secundária
            // na hierarquia. Não some — quem confere precisa ver o que o
            // retriever trouxe e a resposta não usou.
            "border-border/40 bg-card/40",
        highlighted && "border-primary ring-1 ring-primary/40",
      )}
    >
      <header className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-semibold tabular-nums",
            source.cited
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
          aria-label={`Fonte ${source.citation_index}`}
        >
          {source.citation_index}
        </span>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium leading-snug text-foreground">
            {source.title}
          </h4>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {source.journal && (
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-3 w-3" aria-hidden />
                {source.journal}
              </span>
            )}
            {!source.cited && (
              <span className="italic">recuperada, não citada na resposta</span>
            )}
          </div>
        </div>
      </header>

      <blockquote className="relative rounded-md bg-muted/40 py-3 pl-8 pr-3 text-sm leading-relaxed text-foreground/90">
        <Quote
          className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground/60"
          aria-hidden
        />
        {shown}
        {isLong && (
          <Button
            variant="link"
            size="sm"
            className="ml-1 h-auto p-0 align-baseline text-xs"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "mostrar menos" : "mostrar trecho completo"}
          </Button>
        )}
      </blockquote>

      <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {source.doi ? (
          <a
            href={`https://doi.org/${source.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-secondary hover:underline"
          >
            {source.doi}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : (
          <span
            className="font-mono text-muted-foreground"
            title="O cabeçalho do PMC não trazia DOI. Não fabricamos identificadores."
          >
            DOI não disponível
          </span>
        )}

        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
          >
            ver no PMC
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}

        <div className="ml-auto flex items-center gap-1.5">
          {source.channels.map((channel) => {
            const info = CHANNEL_INFO[channel];
            if (!info) return null;
            const Icon = info.icon;
            return (
              <Badge
                key={channel}
                variant="outline"
                className="gap-1 border-border/60 px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                title={info.title}
              >
                <Icon className="h-2.5 w-2.5" aria-hidden />
                {info.label}
              </Badge>
            );
          })}
        </div>
      </footer>
    </article>
  );
}
