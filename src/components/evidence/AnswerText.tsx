/**
 * SPACEBIO-024 — Texto da resposta com citações navegáveis
 *
 * Converte cada `[n]` do texto num botão que leva à fonte correspondente.
 *
 * POR QUE NÃO `dangerouslySetInnerHTML`
 * -------------------------------------
 * O texto vem de um modelo de linguagem. Injetá-lo como HTML abriria XSS a
 * partir de conteúdo gerado — exatamente o tipo de risco que não se aceita
 * num sistema cuja proposta é confiabilidade. `parseAnswerSegments()` divide
 * o texto em partes e o React escapa cada uma.
 *
 * Uma citação para um índice que não existe é renderizada como texto comum,
 * sem virar link quebrado. O backend já a detectou e registrou em `warnings`;
 * aqui ela apenas não ganha destaque de âncora.
 */

import { cn } from "@/lib/utils";
import { parseAnswerSegments } from "@/types/evidence";

interface AnswerTextProps {
  answer: string;
  /** Quantas fontes existem — define quais citações são válidas. */
  sourceCount: number;
  onCitationClick?: (citationIndex: number) => void;
  className?: string;
}

export function AnswerText({
  answer,
  sourceCount,
  onCitationClick,
  className,
}: AnswerTextProps) {
  const segments = parseAnswerSegments(answer);

  return (
    <div
      className={cn(
        "whitespace-pre-wrap text-[15px] leading-relaxed text-foreground",
        className,
      )}
    >
      {segments.map((segment, index) => {
        if (segment.kind === "text") {
          return <span key={index}>{segment.content}</span>;
        }

        const valid = segment.indices.filter(
          (n) => Number.isInteger(n) && n >= 1 && n <= sourceCount,
        );

        // Citação fabricada pelo modelo: fica como texto, não como link.
        if (valid.length === 0) {
          return (
            <span key={index} className="text-muted-foreground">
              {segment.raw}
            </span>
          );
        }

        return (
          <span key={index} className="inline-flex items-baseline gap-0.5">
            {valid.map((citationIndex, position) => (
              <button
                key={citationIndex}
                type="button"
                onClick={() => onCitationClick?.(citationIndex)}
                title={`Ir para a fonte ${citationIndex}`}
                className={cn(
                  "inline-flex h-4 min-w-4 items-center justify-center rounded px-1",
                  "bg-primary/15 text-[11px] font-semibold tabular-nums text-primary align-super",
                  "transition-colors hover:bg-primary/30",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                )}
              >
                {citationIndex}
                {position < valid.length - 1 && ","}
              </button>
            ))}
          </span>
        );
      })}
    </div>
  );
}
