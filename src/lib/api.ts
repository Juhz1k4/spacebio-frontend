/**
 * SPACEBIO-024 — Cliente da API do SpaceBio
 *
 * Ponto único de contato com o backend. Nenhum componente deve chamar `fetch`
 * diretamente: o tratamento de erro aqui distingue casos que a interface
 * precisa apresentar de formas diferentes.
 *
 * A DISTINÇÃO QUE IMPORTA
 * -----------------------
 * Três coisas podem dar errado, e confundi-las destrói o valor do sistema:
 *
 *   1. Rede/servidor fora      -> ApiError. "Algo quebrou."
 *   2. Grafo indisponível (503) -> ApiError com `unavailable`. "Falta configurar."
 *   3. Sem evidência no corpus  -> HTTP 200, `grounded: false`. NÃO é erro.
 *
 * O caso 3 é a assistente funcionando como projetada. O backend devolve 200
 * de propósito: ausência de evidência é um resultado científico legítimo
 * (§15.7), não uma exceção. Quem trata isso é a interface, não este módulo.
 */

import type {
  ChatRequest,
  EvidenceAnswer,
  HealthResponse,
} from "@/types/evidence";

/**
 * Endereco do backend.
 *
 * O padrao e 127.0.0.1, nunca `localhost`, e a diferenca nao e cosmetica.
 * No Windows `localhost` resolve para `::1` (IPv6) ANTES de 127.0.0.1, e o
 * uvicorn sobe ligado a `0.0.0.0`, que e apenas IPv4. A tentativa IPv6
 * precisa estourar o timeout do resolver antes de cair para IPv4.
 *
 * Medido nesta maquina, GET /api/v1/health, mediana de 5 execucoes:
 *     via `localhost`  ->  2073 ms
 *     via 127.0.0.1    ->    37 ms
 *
 * Sao ~2 s somados a TODA requisicao, invisiveis no codigo e faceis de
 * confundir com lentidao do modelo. Ver docs/RETRIEVAL_AUDIT.md no backend.
 */
const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000";

/** Tempo máximo de espera. O caminho completo inclui embedding + LLM. */
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Falha de comunicação com a API.
 *
 * Não confundir com `grounded: false`, que chega como resposta bem-sucedida.
 */
export class ApiError extends Error {
  readonly status: number;
  /** O backend respondeu, mas uma dependência dele está fora (503). */
  readonly unavailable: boolean;
  /** A requisição nem chegou ao servidor. */
  readonly networkFailure: boolean;

  constructor(
    message: string,
    options: { status?: number; unavailable?: boolean; networkFailure?: boolean } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.unavailable = options.unavailable ?? false;
    this.networkFailure = options.networkFailure ?? false;
  }
}

/** Requisição com timeout e erros tipados. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (cause) {
    const aborted = cause instanceof DOMException && cause.name === "AbortError";
    throw new ApiError(
      aborted
        ? "A Dra. Aris demorou demais para responder."
        : "Não foi possível alcançar o servidor do SpaceBio.",
      { networkFailure: true },
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // O backend manda o motivo em `detail`; preservá-lo evita que o usuário
    // veja "erro 503" sem saber que basta subir o Neo4j.
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = String(body.detail);
    } catch {
      // resposta sem JSON — fica o status
    }
    throw new ApiError(detail, {
      status: response.status,
      unavailable: response.status === 503,
    });
  }

  return (await response.json()) as T;
}

/**
 * Pergunta à Dra. Aris, com o contrato de evidência completo.
 *
 * Uma resposta com `grounded: false` é retorno normal desta função, não erro.
 */
export async function askAris(
  question: string,
  topK?: number,
): Promise<EvidenceAnswer> {
  const payload: ChatRequest = { question };
  if (topK !== undefined) payload.top_k = topK;

  return request<EvidenceAnswer>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Estado do corpus, do índice e do provedor de LLM. */
export async function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/v1/health");
}

/** URL resolvida — útil para diagnóstico na interface. */
export function apiBaseUrl(): string {
  return API_BASE_URL;
}
