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
 *   DegradedAnswer    A evidência existe, a síntese não foi gerada (timeout,
 *                     quota esgotada, provedor fora). As passagens continuam
 *                     válidas e devem ser lidas. Tom NEUTRO, nunca vermelho
 *                     nem âmbar: o trabalho de recuperação foi feito, e a
 *                     cor decide a leitura antes do texto (E3-04).
 *
 *   ConnectionError   A requisição não chegou, ou o backend está sem Neo4j.
 *                     Aqui sim algo está quebrado.
 *
 * A recusa usa a cor secundária (ciano) e vocabulário de rigor — não o
 * vermelho de destrutivo, que sinalizaria defeito.
 */

import {
  AlertTriangle,
  FileSearch,
  Info,
  RotateCw,
  ShieldCheck,
  WifiOff,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  SYNTHESIS_UNAVAILABLE_MESSAGE,
  type EvidenceAnswer,
} from "@/types/evidence";

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

/**
 * A evidência veio completa, mas a síntese não (E3-04).
 *
 * POR QUE ESTE ESTADO NÃO É VERMELHO NEM ÂMBAR
 * --------------------------------------------
 * A versão anterior usava âmbar com ícone de tomada desconectada. Era honesto
 * e era ruim: sinalizava avaria justamente quando o sistema fez o trabalho
 * difícil. A recuperação rodou, os trechos estão todos na tela, com DOI e
 * procedência. O que faltou foi o parágrafo que os resumiria.
 *
 * Numa demonstração, a cor decide a leitura antes do texto. Âmbar faz o
 * avaliador concluir "quebrou"; o tom neutro deixa que ele leia a mensagem e
 * veja as fontes logo abaixo — que é a conclusão correta.
 *
 * O ícone é de busca concluída, não de falha. A causa técnica exata não vem
 * aqui: ela vai em `warnings`, em tom de nota de rodapé.
 */
export function DegradedAnswer({
  answer,
  onRetry,
}: {
  answer: EvidenceAnswer;
  onRetry?: () => void;
}) {
  return (
    <Alert className="border-border bg-muted/40">
      <FileSearch className="h-4 w-4 text-muted-foreground" />
      <AlertTitle className="text-foreground">
        Evidência recuperada
      </AlertTitle>
      <AlertDescription className="space-y-3 text-foreground/80">
        {/* Preferimos a cópia local à que veio pela rede: numa falha parcial
            de conexão, `answer` pode chegar vazio. */}
        <p>{answer.answer?.trim() || SYNTHESIS_UNAVAILABLE_MESSAGE}</p>
        <p className="text-xs text-muted-foreground">
          Os {answer.sources.length} trecho(s) abaixo vieram do corpus e são
          confiáveis — apenas o resumo em linguagem natural não pôde ser gerado.
        </p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCw className="h-3.5 w-3.5" aria-hidden />
            Tentar gerar a síntese novamente
          </Button>
        )}
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
  /**
   * Como ler os avisos. Nenhum dos três é cosmético:
   *
   *   problem   — algo saiu errado NESTA resposta (citação a fonte
   *               inexistente, texto truncado). Vermelho é adequado.
   *   refusal   — a memória de cálculo de uma recusa correta. Em vermelho,
   *               contradiria a mensagem acima, que diz que recusar é rigor.
   *   technical — a causa de uma degradação (timeout, quota). O sistema
   *               respondeu: entregou as passagens. Dizer "por que não
   *               respondi" aqui seria falso (E3-04).
   */
  tone?: "problem" | "refusal" | "technical";
}) {
  if (warnings.length === 0) return null;

  const isExplanation = tone === "refusal" || tone === "technical";

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
        {tone === "refusal"
          ? "Por que não respondi"
          : tone === "technical"
            ? "Detalhe técnico"
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
