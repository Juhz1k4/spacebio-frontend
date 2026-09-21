/**
 * SPACEBIO-024 — Dra. Aris UI V2
 *
 * A tela principal do produto. Substitui o chat que exibia apenas
 * `data.answer` por uma apresentação da cadeia de evidência completa.
 *
 * O QUE MUDOU E POR QUÊ
 * ---------------------
 * A versão anterior chamava `/chat` e descartava `sources`, `entities`,
 * `retrieval`, `grounded` e `warnings` — tudo o que distingue este sistema de
 * um chatbot qualquer. Agora consome `/api/v1/chat` e renderiza o contrato
 * inteiro (§14).
 *
 * A mudança mais importante é conceitual: quando a Dra. Aris responde que não
 * tem evidência, isso é apresentado como RIGOR, não como erro. Ver
 * `AnswerStates.tsx`.
 */

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

import { ConnectionError } from "@/components/evidence/AnswerStates";
import { EvidencePanel } from "@/components/evidence/EvidencePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, askAris } from "@/lib/api";
import type { EvidenceAnswer } from "@/types/evidence";

const DR_ARIS_AVATAR = "https://placehold.co/128x128/083344/E0F2FE?text=Aris";

const GREETING =
  "Olá! Sou a Dra. Aris. Respondo sobre biologia espacial usando apenas os " +
  "artigos indexados no nosso corpus — e digo quando não encontro evidência " +
  "para sustentar uma resposta.";

/** Perguntas que funcionam bem, para quem chega sem saber o que perguntar. */
const SUGGESTIONS = [
  "Como a microgravidade afeta a densidade óssea?",
  "Quais genes respondem à radiação espacial?",
  "O que acontece com o sistema imune em voo espacial?",
];

/** Uma troca: a pergunta e o que voltou (resposta, erro, ou nada ainda). */
interface Exchange {
  question: string;
  answer?: EvidenceAnswer;
  error?: { message: string; unavailable: boolean };
}

export default function AIAssistant() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [exchanges, isLoading]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setIsLoading(true);
    setExchanges((previous) => [...previous, { question: trimmed }]);

    try {
      const answer = await askAris(trimmed);
      setExchanges((previous) => {
        const next = [...previous];
        next[next.length - 1] = { question: trimmed, answer };
        return next;
      });
    } catch (cause) {
      // Só chega aqui falha real de comunicação. Falta de evidência volta
      // como resposta bem-sucedida com `grounded: false`.
      const apiError = cause instanceof ApiError ? cause : null;
      setExchanges((previous) => {
        const next = [...previous];
        next[next.length - 1] = {
          question: trimmed,
          error: {
            message: apiError?.message ?? "Erro inesperado ao consultar a Dra. Aris.",
            unavailable: apiError?.unavailable ?? false,
          },
        };
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={DR_ARIS_AVATAR}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-secondary"
          />
          <div>
            <h1 className="text-xl font-bold">Dra. Aris</h1>
            <p className="text-xs text-muted-foreground">
              Assistente científica · responde com evidência do corpus, ou não responde
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-3xl space-y-8">
          {exchanges.length === 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <img
                  src={DR_ARIS_AVATAR}
                  alt=""
                  className="h-9 w-9 rounded-full border-2 border-secondary"
                />
                <p className="rounded-lg bg-muted/50 p-3 text-[15px] leading-relaxed">
                  {GREETING}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pl-12">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal py-1.5 text-left text-xs"
                    onClick={() => ask(suggestion)}
                  >
                    <Sparkles className="mr-1.5 h-3 w-3 shrink-0" aria-hidden />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {exchanges.map((exchange, index) => (
            <section key={index} className="space-y-4">
              <div className="flex justify-end">
                <p className="max-w-xl rounded-lg bg-primary px-4 py-2 text-[15px] text-primary-foreground">
                  {exchange.question}
                </p>
              </div>

              {exchange.answer && (
                <div className="flex items-start gap-3">
                  <img
                    src={DR_ARIS_AVATAR}
                    alt=""
                    className="mt-1 h-9 w-9 shrink-0 rounded-full border-2 border-secondary"
                  />
                  <div className="min-w-0 flex-1">
                    <EvidencePanel answer={exchange.answer} />
                  </div>
                </div>
              )}

              {exchange.error && (
                <ConnectionError
                  message={exchange.error.message}
                  unavailable={exchange.error.unavailable}
                />
              )}
            </section>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <img
                src={DR_ARIS_AVATAR}
                alt=""
                className="h-9 w-9 rounded-full border-2 border-secondary"
              />
              <div className="rounded-lg bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-secondary [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-secondary [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    buscando evidência no corpus…
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            ask(input);
          }}
          className="mx-auto flex max-w-3xl items-center gap-2"
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Pergunte sobre biologia espacial…"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" aria-hidden />
            <span className="sr-only">Enviar pergunta</span>
          </Button>
        </form>
      </footer>
    </div>
  );
}
