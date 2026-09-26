/**
 * SPACEBIO A1 — textos da interface, em um lugar só
 *
 * POR QUE CENTRALIZAR
 * -------------------
 * Não é preparação para traduzir o produto — ele é em português e assim fica.
 * É para que o texto exibido ao usuário seja **revisável de uma vez**.
 *
 * A F0-2 precisou caçar promessas sem lastro espalhadas por quatro arquivos,
 * e duas delas escaparam da varredura por `src/` porque estavam no
 * `index.html`. Com as strings reunidas, a próxima revisão é ler um arquivo,
 * não confiar num `grep`.
 *
 * O QUE NÃO ENTRA AQUI
 * --------------------
 * Número nenhum. Contagens vêm de `GET /api/v1/stats`, que conta no grafo —
 * ver `src/types/stats.ts`. A única exceção está documentada em
 * `PUBLICACOES_NO_CONJUNTO_OFICIAL`, e é um fato sobre o desafio, não sobre
 * o nosso sistema.
 */

/**
 * Tamanho do conjunto oficial de publicações do NASA Space Apps Challenge 2025.
 *
 * ÚNICO NÚMERO ESCRITO À MÃO NA INTERFACE, e por um motivo: ele não existe no
 * nosso grafo. O grafo sabe quantas publicações NÓS ingerimos (493); quantas
 * o desafio disponibilizou é um dado externo, que não temos como contar.
 *
 * Aparece sempre ao lado do número real vindo da API, na forma "493 das 608".
 * A regra do plano da Fase Final é explícita: em toda a interface o número é
 * 493, descrito como "493 das 608 publicações do conjunto do desafio". Nunca
 * 608 sozinho, que daria a entender uma cobertura que não temos.
 */
export const PUBLICACOES_NO_CONJUNTO_OFICIAL = 608;

export const landing = {
  selo: "NASA Space Apps Challenge 2025 · Build a Space Biology Knowledge Engine",

  titulo: {
    linha1: "O mapa da evidência",
    linha2: "em biologia espacial",
  },

  subtitulo:
    "Pergunte, e veja exatamente quais artigos da NASA sustentam cada resposta " +
    "— ou descubra que nenhum sustenta.",

  acoes: {
    perguntar: "Perguntar à Dra. Aris",
    verEvidencia: "Ver como a evidência é citada",
  },

  numeros: {
    publicacoes: "publicações do conjunto da NASA",
    trechos: "trechos auditáveis",
    entidades: "entidades biológicas vinculadas",

    /** Nota de cobertura. Recebe o número real vindo da API. */
    cobertura: (publicacoes: number) =>
      `${publicacoes} das ${PUBLICACOES_NO_CONJUNTO_OFICIAL} publicações do ` +
      `conjunto do NASA Space Apps Challenge 2025`,

    /** Exibido enquanto a chamada à API não voltou. */
    carregando: "contando no acervo…",

    /**
     * Exibido quando a API não responde.
     *
     * Dizer que o número está indisponível é melhor que esconder o bloco: o
     * visitante entende que existe uma contagem e que ela falhou agora, em vez
     * de achar que o produto não tem números.
     */
    indisponivel: "contagem indisponível no momento",
  },
} as const;

export const recursos = {
  titulo: {
    antes: "Como a ",
    destaque: "evidência",
    depois: " aparece",
  },
  subtitulo:
    "O que separa este sistema de um chatbot: toda afirmação é rastreável " +
    "até o artigo, e a ausência de evidência é dita em voz alta.",
} as const;

/**
 * Itens do menu lateral.
 *
 * Os rótulos em inglês foram corrigidos: "Dashboard" virou "Início" e
 * "AI Assistant" virou "Dra. Aris" — a interface é toda em português, e
 * deixar dois rótulos em inglês parece descuido de tradução, não escolha.
 *
 * Os itens de rede social (Feed, Mensagens, Perfil) continuam aqui de
 * propósito: desligá-los é a issue A6, que os coloca atrás de uma flag em vez
 * de apagar o código. Renomeá-los agora seria polir algo que vai sair.
 */
export const navegacao = {
  inicio: "Início",
  feed: "Feed",
  mensagens: "Mensagens",
  assistente: "Dra. Aris",
  perfil: "Perfil",
  configuracoes: "Configurações",
  sair: "Sair",
} as const;
