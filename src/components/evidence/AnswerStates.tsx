/**
 * SPACEBIO-024 — Estados da resposta
 *
 * Três situações que parecem iguais a um cliente ingênuo e precisam ser
 * visualmente distintas:
 *
 *   EvidenceRefusal   Não há evidência no corpus. A assistente se recusa a
 *                     responder. NÃO É ERRO — é a funcionalidade que separa
 *                     este sistema de um chatbot. Apresentar como falha
 *                     destruiria exatamente o que a torna valiosa (§15.7).
 *
 *   DegradedAnswer    A evidência existe, a síntese não foi gerada (quota do
 *                     LLM esgotada, provedor fora). As passagens continuam
 *                     válidas e devem ser lidas.
 *
 *   ConnectionError   A requisição não chegou, ou o backend está sem Neo4j.
 *                     Aqui sim algo está quebrado.
 *
 * A recusa usa a cor secundária (ciano) e vocabulário de rigor — não o
 * vermelho de destrutivo, que sinalizaria defeito.
 */

import { AlertTriangle, Info, PlugZap, ShieldCheck, WifiOff } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { EvidenceAnswer } from "@/types/evidence";

/**
 * A assistente não encontrou evidência suficiente e disse isso.
 *
 * Mostra o score da melhor passagem contra o limiar: torna a recusa
 * auditável em vez de arbitrária.
 */
export function EvidenceRefusal({ answer }: { answer: EvidenceAnswer }) {
  const { top_score, evidence_threshold, chunks_considered } = answer.retrieval;

  return (
    <Alert className="border-secondary/40 bg-secondary/5">
      <ShieldCheck className="h-4 w-4 text-secondary" />
      <AlertTitle className="text-secondary">
        Sem evidência suficiente no corpus
      </AlertTitle>
      <AlertDescription className="space-y-2 text-foreground/80">
        <p>{answer.answer}</p>
        <p className="text-xs text-muted-foreground">
          {chunks_considered > 0 ? (
            <>
              A passagem mais próxima ficou em{" "}
              <span className="font-mono tabular-nums">
                {top_score?.toFixed(3) ?? "—"}
              </span>{" "}
              de similaridade, abaixo do limiar de{" "}
              <span className="font-mono tabular-nums">
                {evidence_threshold.toFixed(2)}
              </span>{" "}
              exigido para responder.
            </>
          ) : (
            "A busca não retornou nenhuma passagem do corpus."
          )}
        </p>
      </AlertDescription>
    </Alert>
  );
}

/** A evidência existe, mas não houve síntese. */
export function DegradedAnswer({ answer }: { answer: EvidenceAnswer }) {
  return (
    <Alert className="border-amber-500/40 bg-amber-500/5">
      <PlugZap className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">
        Evidência recuperada, síntese indisponível
      </AlertTitle>
      <AlertDescription className="space-y-1 text-foreground/80">
        <p>{answer.answer}</p>
        <p className="text-xs text-muted-foreground">
          Os trechos abaixo vieram do corpus e são confiáveis; apenas o resumo
          em linguagem natural não pôde ser gerado.
        </p>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Avisos que o backend anexou à resposta.
 *
 * O TOM DEPENDE DO CONTEXTO, e isso importa.
 *
 * Quando acompanham uma RECUSA, os avisos apenas explicam por que ela
 * aconteceu ("a melhor passagem ficou abaixo do limiar") — são a memória de
 * cálculo de uma decisão correta. Em vermelho de erro, contradizem a mensagem
 * logo acima, que diz ao usuário que a recusa é rigor e não defeito.
 *
 * Quando acompanham uma RESPOSTA, sinalizam algo que deu errado de fato:
 * citação a fonte inexistente, texto truncado por limite de tokens. Aí o
 * vermelho é adequado.
 */
export function AnswerWarnings({
  warnings,
  tone = "problem",
}: {
  warnings: string[];
  /** "explanation" quando acompanham uma recusa esperada. */
  tone?: "problem" | "explanation";
}) {
  if (warnings.length === 0) return null;

  const isExplanation = tone === "explanation";

  return (
    <Alert
      className={
        isExplanation
          ? "border-border/60 bg-muted/30"
          : "border-destructive/40 bg-destructive/5 text-destructive"
      }
    >
      {isExplanation ? (
        <Info className="h-4 w-4 text-muted-foreground" />
      ) : (
        <AlertTriangle className="h-4 w-4" />
      )}
      <AlertTitle className={isExplanation ? "text-foreground/80" : undefined}>
        {isExplanation
          ? "Por que não respondi"
          : warnings.length === 1
            ? "Ressalva"
            : `${warnings.length} ressalvas`}
      </AlertTitle>
      <AlertDescription>
        <ul
          className={`list-disc space-y-1 pl-4 text-sm ${
            isExplanation ? "text-muted-foreground" : ""
          }`}
        >
          {warnings.map((warning, index) => (
            <li key={index}>{warning}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

/** Falha real de comunicação. */
export function ConnectionError({
  message,
  unavailable,
}: {
  message: string;
  unavailable: boolean;
}) {
  return (
    <Alert variant="destructive">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>
        {unavailable ? "Serviço indisponível" : "Falha de comunicação"}
      </AlertTitle>
      <AlertDescription className="space-y-1">
        <p>{message}</p>
        {unavailable && (
          <p className="text-xs opacity-80">
            O backend respondeu, mas uma dependência está fora — normalmente o
            Neo4j. Verifique se o banco está rodando.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}
