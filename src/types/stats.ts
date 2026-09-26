/**
 * SPACEBIO A1 — contagens públicas do acervo
 *
 * Espelha `PublicStats` de `main.py`. Vem de `GET /api/v1/stats`, que conta no
 * grafo a cada requisição (com cache de 10 minutos no servidor).
 *
 * POR QUE ESTES NÚMEROS NÃO PODEM SER CONSTANTES NO FRONTEND
 * ----------------------------------------------------------
 * A página inicial já exibiu "500+ pesquisadores" e "1.2K artigos" escritos à
 * mão, sem origem nenhuma. A F0-2 removeu os dois.
 *
 * A correção NÃO foi trocá-los por 493 e 45.947 igualmente escritos à mão.
 * Isso criaria o mesmo defeito numa forma mais difícil de perceber: um número
 * correto hoje, silenciosamente errado no dia em que o acervo mudar, e que
 * ninguém revisa porque parece certo. Contar no grafo é o que impede isso.
 *
 * É o princípio 0.4 do plano da Fase Final: o LLM interpreta texto, o código
 * afirma números — e nenhum número exibido ao usuário é escrito à mão.
 */

export interface PublicStats {
  /** Publicações do conjunto da NASA presentes no acervo. */
  publications: number;

  /** Trechos indexados, cada um citável e auditável individualmente. */
  chunks: number;

  /** Entidades biológicas vinculadas pela ontologia. */
  entities: number;

  organisms: number;

  /** Conjuntos de dados do OSDR mencionados nas publicações. */
  datasets: number;

  /**
   * Quando a contagem foi feita, em UTC (ISO 8601).
   *
   * Exposto para que a interface possa dizer a idade do número, em vez de
   * fingir que é instantâneo. Com cache de 10 minutos no servidor, "agora"
   * seria uma pequena mentira.
   */
  generated_at: string;

  /** A resposta veio do cache do servidor? */
  cached: boolean;
}
