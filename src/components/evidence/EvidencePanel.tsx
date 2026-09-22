/**
 * SPACEBIO-024 — Painel de resposta com evidência
 *
 * Monta as quatro regiões que o §25 do briefing define:
 *
 *     ANSWER               o texto, com citações navegáveis
 *     SCIENTIFIC EVIDENCE  os cartões de fonte
 *     RELATED ENTITIES     as entidades da ontologia presentes nos trechos
 *     EXPLORE GRAPH        (SPACEBIO-028 — ainda não implementado)
 *
 * Decide também qual estado apresentar: resposta fundamentada, recusa por
 * falta de evidência, ou degradação sem síntese.
 */

import { useCallback, useState } from "react";
import { FlaskConical, Link2, ListTree } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnswerText } from "./AnswerText";
import {
  AnswerWarnings,
  DegradedAnswer,
  EvidenceRefusal,
} from "./AnswerStates";
import { SourceCard } from "./SourceCard";
import {
  citedSources,
  isDegradedAnswer,
  isEvidenceRefusal,
  uncitedSources,
  type EvidenceAnswer,
  type MentionedEntity,
} from "@/types/evidence";

/** Cor por tipo de entidade, para dar leitura rápida à lista. */
const ENTITY_TONE: Record<string, string> = {
  Organism: "border-emerald-500/40 text-emerald-400",
  Gene: "border-violet-500/40 text-violet-400",
  ExperimentalCondition: "border-sky-500/40 text-sky-400",
  BiologicalProcess: "border-amber-500/40 text-amber-400",
  Tissue: "border-rose-500/40 text-rose-400",
  CellType: "border-pink-500/40 text-pink-400",
  Mission: "border-cyan-500/40 text-cyan-400",
  Spacecraft: "border-slate-500/40 text-slate-300",
  Dataset: "border-teal-500/40 text-teal-400",
};

export function EvidencePanel({ answer }: { answer: EvidenceAnswer }) {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  // Clicar numa citação leva à fonte e a destaca por um instante — sem o
  // destaque, o leitor chega ao lugar certo e não percebe.
  const goToSource = useCallback((citationIndex: number) => {
    const element = document.getElementById(`source-${citationIndex}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlighted(citationIndex);
    window.setTimeout(() => setHighlighted(null), 2000);
  }, []);

  const refusal = isEvidenceRefusal(answer);
  const degraded = isDegradedAnswer(answer);
  const cited = citedSources(answer);
  const uncited = uncitedSources(answer);

  return (
    <div className="space-y-4">
      {/* --- ANSWER --- */}
      {refusal ? (
        <EvidenceRefusal answer={answer} />
      ) : (
        <>
          {degraded && <DegradedAnswer answer={answer} />}
          {!degraded && (
            <AnswerText
              answer={answer.answer}
              sourceCount={answer.sources.length}
              onCitationClick={goToSource}
            />
          )}
        </>
      )}

      <AnswerWarnings
        warnings={answer.warnings}
        tone={refusal ? "explanation" : "problem"}
      />

      {/* --- SCIENTIFIC EVIDENCE --- */}
      {answer.sources.length > 0 && (
        <section className="space-y-3">
          <Separator />
          <header className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Evidência científica
            </h3>
            <span className="text-xs text-muted-foreground">
              {answer.retrieval.chunks_used} de{" "}
              {answer.retrieval.chunks_considered} trechos citados
            </span>
          </header>

          <div className="space-y-3">
            {cited.map((source) => (
              <SourceCard
                key={source.chunk_id}
                source={source}
                highlighted={highlighted === source.citation_index}
              />
            ))}
          </div>

          {uncited.length > 0 && (
            <details className="group rounded-md border border-border/40 p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                {uncited.length} trecho(s) recuperado(s) que a resposta não citou
              </summary>
              {/* Esta explicação não é detalhe: sem ela, "não citado" parece
                  falha de recuperação. É o oposto — é a seletividade da
                  assistente, e é o que separa citar evidência de despejar
                  tudo o que a busca trouxe. */}
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Estes trechos foram recuperados na busca, mas descartados pelo filtro
                de seletividade da Dra. Aris por não conterem evidências diretas para
                a pergunta. Ficam aqui para auditoria: você pode conferir o que o
                sistema encontrou e decidiu não usar.
              </p>
              <div className="mt-3 space-y-3">
                {uncited.map((source) => (
                  <SourceCard key={source.chunk_id} source={source} />
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      {/* --- RELATED ENTITIES --- */}
      {answer.entities.length > 0 && (
        <section className="space-y-2">
          <Separator />
          <header className="flex items-center gap-2">
            <ListTree className="h-4 w-4 text-secondary" aria-hidden />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Entidades relacionadas
            </h3>
          </header>
          <div className="flex flex-wrap gap-1.5">
            {answer.entities.map((entity: MentionedEntity) => (
              <Badge
                key={`${entity.label}:${entity.canonical}`}
                variant="outline"
                className={`gap-1 font-normal ${ENTITY_TONE[entity.label] ?? "border-border"}`}
                title={`${entity.label} · ${entity.occurrences} ocorrência(s) em ${entity.chunks} trecho(s)`}
              >
                {entity.canonical}
                <span className="tabular-nums opacity-60">{entity.chunks}</span>
              </Badge>
            ))}
          </div>
          {/* SPACEBIO-028: aqui entra a navegação para o Knowledge Explorer. */}
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" aria-hidden />
            Exploração do grafo chega na SPACEBIO-028
          </p>
        </section>
      )}

      {/* --- Rastro da recuperação --- */}
      <RetrievalFooter answer={answer} />
    </div>
  );
}

/**
 * Como a evidência foi obtida.
 *
 * Discreto de propósito: é informação de auditoria, importante para quem
 * quer conferir e irrelevante para quem só quer a resposta.
 */
function RetrievalFooter({ answer }: { answer: EvidenceAnswer }) {
  const { chunks_used, chunks_considered, top_score, evidence_threshold, channels } =
    answer.retrieval;

  return (
    <footer className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
      <span
        className={answer.grounded ? "text-emerald-400" : "text-amber-400"}
        title={
          answer.grounded
            ? "As citações foram conferidas contra as fontes existentes"
            : "A resposta não pôde ser verificada contra a evidência"
        }
      >
        {answer.grounded ? "fundamentada" : "não fundamentada"}
      </span>
      <span className="tabular-nums">
        {chunks_used}/{chunks_considered} trechos
      </span>
      {top_score !== null && (
        <span className="tabular-nums" title={`Limiar: ${evidence_threshold}`}>
          similaridade {top_score.toFixed(3)}
        </span>
      )}
      {channels.length > 0 && <span>canais: {channels.join(", ")}</span>}
    </footer>
  );
}
