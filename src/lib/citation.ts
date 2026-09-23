/**
 * SPACEBIO E3-07 — formatação de referências bibliográficas
 *
 * Converte uma fonte do painel de evidência em ABNT (NBR 6023) ou BibTeX,
 * prontas para colar num trabalho acadêmico ou num gerenciador de referências.
 *
 * TUDO AQUI É GERADO POR CÓDIGO. NENHUM LLM PARTICIPA.
 * ----------------------------------------------------
 * Isso não é uma escolha de arquitetura, é uma exigência de correção. Uma
 * referência bibliográfica é uma afirmação verificável sobre quem escreveu o
 * quê, quando e onde. Um modelo de linguagem pedindo para "formatar em ABNT"
 * completa campos ausentes com o que parece plausível — inventa um volume,
 * arredonda um ano, corrige um sobrenome para a grafia mais comum. O erro é
 * invisível: a referência sai bem-formada e errada, e vai parar na
 * bibliografia de alguém.
 *
 * Aqui, campo ausente produz referência mais curta. Nunca um campo inventado.
 * É a mesma regra do §15.4 do briefing, que proíbe a Dra. Aris de fabricar
 * identificadores, aplicada à camada de exportação.
 *
 * SOBRE O QUE NÃO DÁ PARA FAZER NA ÁREA DE TRANSFERÊNCIA
 * ------------------------------------------------------
 * A ABNT pede o título do periódico em destaque (itálico ou negrito). Texto
 * simples não carrega formatação, então ele sai sem marcação e quem colar
 * aplica o destaque no editor. A alternativa seria copiar HTML, que quebra ao
 * colar em campo de texto puro — e é onde a maioria das pessoas cola.
 */

import type { EvidenceSource } from "@/types/evidence";

/** Como a referência ficou: completa, parcial, ou só o link. */
export type CitationQuality = "complete" | "partial" | "minimal";

export interface FormattedCitation {
  text: string;
  quality: CitationQuality;
  /** Por que não ficou completa. Vazio quando `quality === "complete"`. */
  missing: string[];
}

/**
 * Acima disto, a ABNT permite citar o primeiro autor seguido de "et al.".
 *
 * A NBR 6023 admite as duas formas — listar todos ou abreviar. Abreviamos
 * porque o corpus tem artigos com 13 autores, e uma referência de quatro
 * linhas no meio de um cartão é ilegível.
 */
const ABNT_MAX_AUTHORS = 3;

/** Meses abreviados como a ABNT os grafa, para a data de acesso. */
const MESES_ABNT = [
  "jan.", "fev.", "mar.", "abr.", "maio", "jun.",
  "jul.", "ago.", "set.", "out.", "nov.", "dez.",
];

/**
 * Separa "Sobrenome, Nome" em suas partes.
 *
 * A ausência de vírgula é significativa, não um defeito de dados: o backend
 * grava consórcios e instituições como um nome único ("The ISS Consortium").
 * Tratá-los como sobrenome faria "THE ISS CONSORTIUM, " com nome vazio.
 */
function splitName(author: string): { family: string; given: string } {
  const comma = author.indexOf(",");
  if (comma < 0) return { family: author.trim(), given: "" };
  return {
    family: author.slice(0, comma).trim(),
    given: author.slice(comma + 1).trim(),
  };
}

/** "Doe, Jane" -> "DOE, Jane"; "The ISS Consortium" -> "THE ISS CONSORTIUM". */
function toAbntName(author: string): string {
  const { family, given } = splitName(author);
  return given ? `${family.toUpperCase()}, ${given}` : family.toUpperCase();
}

function formatAbntAuthors(authors: string[]): string {
  if (authors.length === 0) return "";
  if (authors.length > ABNT_MAX_AUTHORS) {
    return `${toAbntName(authors[0])} et al.`;
  }
  return authors.map(toAbntName).join("; ");
}

/**
 * Acrescenta o ponto final, a menos que já exista.
 *
 * Sem isto sai ponto duplo em dois casos que o corpus produz o tempo todo:
 * "SPATZ, Jordan M." (nome terminado em inicial) e "SPATZ, Jordan M. et al."
 * (a abreviação já traz o ponto). Medido no primeiro artigo testado.
 */
function endPeriod(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
}

/** Data de hoje no formato que a ABNT usa em "Acesso em:". */
function accessDate(): string {
  const now = new Date();
  return `${now.getDate()} ${MESES_ABNT[now.getMonth()]} ${now.getFullYear()}`;
}

/**
 * Monta a referência ABNT (NBR 6023) de um artigo de periódico.
 *
 * Forma completa:
 *   SOBRENOME, Nome; SOBRENOME, Nome. Título do artigo. Nome do Periódico,
 *   v. 22, n. 16, p. 9088, 2021. DOI: 10.3390/x. Disponível em: <url>.
 *   Acesso em: 22 set. 2026.
 *
 * Cada bloco só entra se o dado existir. Sem autores, a referência começa
 * pelo título, que é o que a norma manda para obra de autoria desconhecida —
 * e é também o que sobra nas 5 publicações sem DOI.
 */
export function toAbnt(source: EvidenceSource): FormattedCitation {
  const meta = source.citation;
  const authors = meta?.authors ?? [];
  const missing: string[] = [];

  const partes: string[] = [];

  if (authors.length > 0) {
    partes.push(endPeriod(formatAbntAuthors(authors)));
  } else {
    missing.push("autores");
  }

  // O título sempre existe: vem do metadata do PMC, não do Crossref.
  partes.push(endPeriod(source.title));

  const periodico = meta?.journal ?? source.journal;
  if (periodico) {
    // Localização na publicação: v., n., p. — cada um opcional.
    const local = [
      meta?.volume ? `v. ${meta.volume}` : null,
      meta?.issue ? `n. ${meta.issue}` : null,
      meta?.pages ? `p. ${meta.pages}` : null,
      meta?.year ? String(meta.year) : null,
    ].filter(Boolean);
    partes.push(
      endPeriod(local.length ? `${periodico}, ${local.join(", ")}` : periodico),
    );
  } else {
    missing.push("periódico");
  }

  if (!meta?.year) missing.push("ano");

  if (source.doi) {
    partes.push(endPeriod(`DOI: ${source.doi}`));
  } else {
    missing.push("DOI");
  }

  const url = source.doi ? `https://doi.org/${source.doi}` : source.url;
  if (url) {
    partes.push(`Disponível em: ${url}. Acesso em: ${accessDate()}.`);
  }

  return {
    text: partes.join(" "),
    quality: citationQuality(authors.length > 0, Boolean(meta?.year)),
    missing,
  };
}

/**
 * Escapa os caracteres que o LaTeX interpreta como comando.
 *
 * Sem isso, um título com "%" comenta o resto da linha e um "&" quebra a
 * compilação — o usuário só descobre ao rodar o BibTeX, longe daqui.
 */
function escapeBibtex(value: string): string {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * Gera a chave da entrada BibTeX: sobrenome + ano + primeira palavra do título.
 *
 * Ex.: `kumar2021spaceflight`. É a convenção que gerenciadores de referência
 * usam, e mantê-la evita colisão quando o usuário importa várias fontes do
 * mesmo painel.
 *
 * Apenas ASCII: chaves BibTeX com acento quebram em distribuições LaTeX
 * antigas, que ainda são comuns em universidades.
 */
function bibtexKey(source: EvidenceSource): string {
  const meta = source.citation;
  const ascii = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

  const first = meta?.authors?.[0];
  const family = first ? ascii(splitName(first).family) : "";
  const year = meta?.year ? String(meta.year) : "";
  const word = ascii(source.title.split(/\s+/)[0] ?? "");

  // Sem autor E sem ano, sobraria só a primeira palavra do título -- e duas
  // passagens da MESMA publicação gerariam a mesma chave. Um gerenciador de
  // referências importa as duas e a segunda sobrescreve a primeira, sem
  // avisar. O chunk_id desempata e é determinístico, então reimportar a mesma
  // fonte continua produzindo a mesma chave.
  if (!family && !year) {
    return `spacebio${ascii(source.chunk_id).slice(0, 8)}${word}`;
  }

  // Chave iniciada por dígito é legal no BibTeX, mas tropeça em parsers mais
  // antigos. Sem sobrenome, prefixa.
  const key = `${family}${year}${word}`;
  return /^\d/.test(key) ? `ref${key}` : key;
}

/**
 * Monta a entrada BibTeX.
 *
 * Campos vazios são OMITIDOS, não escritos vazios: `volume = {}` faz alguns
 * estilos imprimirem "v. ," na bibliografia.
 */
export function toBibtex(source: EvidenceSource): FormattedCitation {
  const meta = source.citation;
  const authors = meta?.authors ?? [];
  const missing: string[] = [];

  const campos: Array<[string, string | null]> = [
    // BibTeX separa autores por " and ", e cada um já vem em "Family, Given".
    ["author", authors.length ? authors.map(escapeBibtex).join(" and ") : null],
    ["title", escapeBibtex(source.title)],
    ["journal", meta?.journal ?? source.journal ? escapeBibtex((meta?.journal ?? source.journal)!) : null],
    ["year", meta?.year ? String(meta.year) : null],
    ["volume", meta?.volume ? escapeBibtex(meta.volume) : null],
    ["number", meta?.issue ? escapeBibtex(meta.issue) : null],
    ["pages", meta?.pages ? escapeBibtex(meta.pages) : null],
    ["doi", source.doi ?? null],
    ["url", source.doi ? `https://doi.org/${source.doi}` : source.url ?? null],
  ];

  if (!authors.length) missing.push("autores");
  if (!meta?.year) missing.push("ano");
  if (!source.doi) missing.push("DOI");

  const preenchidos = campos.filter(([, valor]) => valor) as Array<[string, string]>;
  const largura = Math.max(...preenchidos.map(([nome]) => nome.length));
  const linhas = preenchidos.map(
    ([nome, valor]) => `  ${nome.padEnd(largura)} = {${valor}}`,
  );

  return {
    text: `@article{${bibtexKey(source)},\n${linhas.join(",\n")}\n}`,
    quality: citationQuality(authors.length > 0, Boolean(meta?.year)),
    missing,
  };
}

/**
 * Classifica o que foi possível montar.
 *
 * A distinção importa para a interface: "minimal" merece um aviso de que a
 * referência precisa ser completada à mão, "partial" não — faltar o volume
 * não impede ninguém de usar a citação.
 */
function citationQuality(hasAuthors: boolean, hasYear: boolean): CitationQuality {
  if (hasAuthors && hasYear) return "complete";
  if (hasAuthors || hasYear) return "partial";
  return "minimal";
}

/**
 * Copia para a área de transferência, com alternativa para contexto inseguro.
 *
 * `navigator.clipboard` só existe em HTTPS ou localhost. A demonstração roda
 * pelo IP da LAN (http://192.168.x.x:8080), que é contexto INSEGURO — ali a
 * API não está definida e o botão falharia em silêncio, que é exatamente onde
 * não se pode falhar.
 *
 * O caminho alternativo usa `document.execCommand("copy")`, obsoleto e ainda
 * suportado em todos os navegadores atuais. É a única opção fora de HTTPS.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Cai no caminho alternativo abaixo: a permissão pode ter sido negada
    // mesmo em contexto seguro.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Fora da tela, mas não `display:none` — um elemento não renderizado não
    // pode ser selecionado, e a cópia falharia.
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
