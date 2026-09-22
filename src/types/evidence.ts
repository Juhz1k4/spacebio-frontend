/**
 * SPACEBIO-024 — Contrato de evidência da Dra. Aris
 *
 * Espelho TypeScript de `evidence.py` do backend. Os dois precisam mudar
 * juntos: este arquivo foi gerado a partir do JSON Schema que o Pydantic
 * produz, e qualquer divergência aparece como `undefined` em runtime, não
 * como erro de compilação.
 *
 * Referência: Master Briefing §14 (Scientific Evidence Contract)
 *
 * PARA CONFERIR SE AINDA ESTÁ SINCRONIZADO
 * ----------------------------------------
 *   cd spacebio-knowledge-engine
 *   ./venv/Scripts/python -c "from evidence import EvidenceAnswer; \
 *       import json; print(json.dumps(EvidenceAnswer.model_json_schema(), indent=2))"
 */

/** Canal de recuperação que trouxe uma passagem (SPACEBIO-013). */
export type RetrievalChannel = "semantic" | "lexical" | "entity";

/**
 * Uma fonte citável: o trecho literal mais a procedência até a publicação.
 *
 * É a unidade de evidência. Nunca apenas o título — sempre o texto que
 * sustenta a afirmação.
 */
export interface EvidenceSource {
  /** O número usado no texto da resposta: [1], [2], ... Começa em 1. */
  citation_index: number;

  /** Identificador da publicação (hoje, o título). */
  publication_id: string;
  title: string;

  /** URL do artigo no PMC. */
  url: string | null;

  /**
   * DOI real ou `null`. NUNCA fabricado (§15.4).
   *
   * 5 das 493 publicações do corpus não têm DOI no cabeçalho do PMC. A
   * interface deve mostrar a ausência, não omiti-la em silêncio — omitir
   * sugere que a fonte não foi verificada.
   */
  doi: string | null;

  journal: string | null;

  /** O trecho literal recuperado. É o ativo; não resumir na interface. */
  passage: string;

  section: string | null;

  /**
   * SEMPRE `null` neste corpus.
   *
   * A extração é de HTML do PMC, que não tem paginação. O §15.5 proíbe
   * inventar número de página, então o campo existe no contrato mas nunca
   * é preenchido. Não renderizar campo de página.
   */
  page: number | null;

  /** Score da fusão RRF. Compara fontes entre si, não entre perguntas. */
  relevance: number;

  chunk_id: string;

  /** Canais que recuperaram este trecho — explica POR QUE ele apareceu. */
  channels: RetrievalChannel[];

  /**
   * A resposta realmente citou esta fonte?
   *
   * Verificado no backend contra o texto gerado, não presumido. Fontes com
   * `cited: false` foram recuperadas mas não usadas — devem aparecer como
   * secundárias, nunca com o mesmo peso das citadas.
   */
  cited: boolean;
}

/**
 * Como a evidência foi obtida.
 *
 * Torna a recuperação auditável: sem isto não há como distinguir "o corpus
 * não tem" de "a busca falhou".
 */
export interface RetrievalTrace {
  query: string;

  /** Trechos avaliados pelo retriever. */
  chunks_considered: number;

  /** Trechos efetivamente citados. Medido, não estimado. */
  chunks_used: number;

  /**
   * Similaridade de cosseno da melhor passagem, ou `null` quando nenhuma
   * passagem veio do canal semântico.
   */
  top_score: number | null;

  /**
   * Limiar abaixo do qual a Dra. Aris recusa responder (padrão 0,72).
   *
   * Calibrado no corpus: perguntas do domínio pontuam 0,89–0,92; fora dele,
   * 0,59–0,66. O piso não é zero — com vetores normalizados, qualquer
   * pergunta pontua ~0,6.
   */
  evidence_threshold: number;

  channels: RetrievalChannel[];
}

/**
 * Uma entidade da ontologia mencionada nas passagens citadas (§16).
 *
 * Vem apenas dos trechos que a resposta de fato citou, não de tudo o que foi
 * recuperado.
 */
export interface MentionedEntity {
  canonical: string;
  /** Organism, Gene, Tissue, CellType, BiologicalProcess, ExperimentalCondition, Mission, Spacecraft, Dataset */
  label: string;
  /** Total de ocorrências nos trechos citados. */
  occurrences: number;
  /** Em quantos trechos distintos aparece. */
  chunks: number;
}

/**
 * A resposta completa da Dra. Aris.
 *
 * ATENÇÃO AO `grounded`: quando `false`, a assistente NÃO conseguiu sustentar
 * a resposta em evidência — e isso é uma funcionalidade, não um erro. A
 * interface deve apresentá-la como rigor científico, com destaque próprio.
 * Renderizar como falha de rede destrói exatamente o que a torna valiosa.
 */
/**
 * Estado da resposta (E3-04).
 *
 * Existe para que o cliente decida COMO renderizar sem inferir isso de campos
 * soltos. Antes, "recusei por falta de evidência" e "achei a evidência mas não
 * consegui redigir" se distinguiam cruzando `grounded`, `sources` e o texto de
 * `warnings` — e as duas têm `grounded: false`, o que tornava a leitura
 * ambígua. São situações opostas para quem lê a tela.
 *
 *   ok                     — resposta sintetizada normalmente
 *   synthesis_unavailable  — evidência completa, síntese falhou ou demorou
 *   insufficient_evidence  — o corpus não cobre a pergunta
 */
export type AnswerStatus =
  | "ok"
  | "synthesis_unavailable"
  | "insufficient_evidence";

/**
 * Texto exibido quando a evidência foi recuperada mas a síntese falhou.
 *
 * Fica declarado aqui, e não só vindo do backend, porque a tela não deve
 * depender da cópia que chegou pela rede para exibir a mensagem certa — numa
 * falha de conexão parcial, `answer` pode chegar vazio.
 */
export const SYNTHESIS_UNAVAILABLE_MESSAGE =
  "Os documentos relevantes foram recuperados com sucesso, mas a síntese em " +
  "texto está temporariamente indisponível devido a uma falha de conexão.";

/**
 * Conferência de um trecho entre aspas (E3-02).
 *
 * A Dra. Aris sintetiza em português a partir de passagens em inglês, e a
 * regra de idioma manda não traduzir o que estiver entre aspas. O backend
 * procura cada trecho literalmente nas passagens recuperadas; o que não é
 * encontrado perde as aspas no texto e aparece aqui com `verified: false`.
 *
 * `verified: false` significa inventado OU traduzido — os dois falham pelo
 * mesmo teste, porque nenhum dos dois existe no original em inglês.
 */
export interface QuoteCheck {
  /** O trecho entre aspas, como o modelo escreveu. */
  quote: string;

  /** O trecho existe literalmente em alguma passagem recuperada? */
  verified: boolean;

  /** Índice [n] da fonte que contém o trecho, quando verificado. */
  source_index: number | null;
}

export interface EvidenceAnswer {
  answer: string;
  sources: EvidenceSource[];
  entities: MentionedEntity[];
  related_topics: string[];
  retrieval: RetrievalTrace;

  /** A resposta está sustentada em evidência verificada do corpus? */
  grounded: boolean;

  /**
   * Estado da resposta (E3-04).
   *
   * Opcional porque uma resposta servida do cache de demonstração gravado
   * antes da E3-04 não o carrega. Ausente, trate como "ok" e recaia na
   * heurística de `isDegradedAnswer`.
   */
  status?: AnswerStatus;

  /**
   * O que o sistema notou e o leitor precisa saber.
   *
   * Exemplos reais: citação a fonte inexistente detectada, resposta
   * interrompida por limite de tokens, provedor de LLM indisponível.
   * Quando não vazio, deve ser exibido.
   */
  warnings: string[];

  /**
   * Conferência dos trechos entre aspas (E3-02).
   *
   * Lista vazia significa que a resposta não trouxe citação literal longa o
   * bastante para conferir — NÃO que a conferência foi pulada. Campo opcional
   * porque uma resposta servida de cache gravado antes da E3-02 não o tem.
   */
  quote_checks?: QuoteCheck[];
}

/** Corpo aceito por POST /api/v1/chat. */
export interface ChatRequest {
  question: string;
  /** Quantas passagens recuperar. Padrão do backend: 6. */
  top_k?: number;
}

/** Resposta de GET /api/v1/health. */
export interface HealthResponse {
  status: "ok" | "degraded";
  detail?: string;
  llm?: { provider: string; model: string; configured: boolean };
  corpus?: { publications: number; chunks: number; has_chunk_relations: number };
  evidence_threshold?: number;
  top_k?: number;
}

// --------------------------------------------------------------------- //
// Auxiliares de leitura do contrato
// --------------------------------------------------------------------- //

/** As fontes que a resposta realmente citou, na ordem da numeração. */
export function citedSources(answer: EvidenceAnswer): EvidenceSource[] {
  return answer.sources
    .filter((source) => source.cited)
    .sort((a, b) => a.citation_index - b.citation_index);
}

/** As fontes recuperadas mas não citadas. */
export function uncitedSources(answer: EvidenceAnswer): EvidenceSource[] {
  return answer.sources.filter((source) => !source.cited);
}

/**
 * A resposta é uma recusa por falta de evidência?
 *
 * Distingue dos outros casos de `grounded: false` — como falha do provedor de
 * LLM, em que a evidência existe mas a síntese não foi gerada. Os dois pedem
 * tratamento visual diferente.
 */
export function isEvidenceRefusal(answer: EvidenceAnswer): boolean {
  return !answer.grounded && answer.sources.length === 0;
}

/**
 * A evidência foi recuperada mas a síntese falhou?
 *
 * Acontece quando a quota do LLM acaba. As passagens continuam válidas e
 * devem ser mostradas.
 */
export function isDegradedAnswer(answer: EvidenceAnswer): boolean {
  // `status` é a fonte de verdade desde a E3-04. A heurística antiga
  // permanece como fallback para respostas gravadas em cache antes dele --
  // e continua correta, porque só a degradação combina "sem lastro" com
  // "tem fontes".
  if (answer.status) return answer.status === "synthesis_unavailable";
  return !answer.grounded && answer.sources.length > 0;
}

/**
 * A evidência veio completa, mas a síntese em texto falhou (E3-04).
 *
 * Isto NÃO é um erro a exibir como tal: a recuperação funcionou e os trechos
 * estão todos no payload. O que falta é o parágrafo que os resumiria.
 */
export function isSynthesisUnavailable(answer: EvidenceAnswer): boolean {
  return isDegradedAnswer(answer);
}

/**
 * Divide o texto da resposta em segmentos, separando as citações [n].
 *
 * Permite renderizar cada `[n]` como âncora clicável sem usar
 * `dangerouslySetInnerHTML`. Reconhece `[1]`, `[2]`, `[1, 3]` e `[1][2]` —
 * os mesmos formatos que `evidence.py:CITATION_PATTERN` aceita.
 */
export type AnswerSegment =
  | { kind: "text"; content: string }
  | { kind: "citation"; indices: number[]; raw: string };

/**
 * Trechos entre aspas que não foram encontrados nas passagens (E3-02).
 *
 * Quando não vazio, o backend JÁ removeu as aspas do texto da resposta — não
 * há nada a corrigir na renderização. Serve para exibir a conferência ao
 * leitor que queira auditar, e o aviso correspondente já vem em `warnings`.
 */
export function unverifiedQuotes(answer: EvidenceAnswer): QuoteCheck[] {
  return (answer.quote_checks ?? []).filter((check) => !check.verified);
}

export function parseAnswerSegments(answer: string): AnswerSegment[] {
  const pattern = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
  const segments: AnswerSegment[] = [];
  let cursor = 0;

  for (const match of answer.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ kind: "text", content: answer.slice(cursor, start) });
    }
    segments.push({
      kind: "citation",
      indices: match[1].split(",").map((part) => Number(part.trim())),
      raw: match[0],
    });
    cursor = start + match[0].length;
  }

  if (cursor < answer.length) {
    segments.push({ kind: "text", content: answer.slice(cursor) });
  }
  return segments;
}
