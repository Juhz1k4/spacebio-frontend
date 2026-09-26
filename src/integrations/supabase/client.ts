/**
 * Cliente Supabase — criação preguiçosa (A1)
 *
 * O ARQUIVO ERA GERADO E DIZIA "não edite". FOI EDITADO, E EIS O PORQUÊ
 * ---------------------------------------------------------------------
 * A versão anterior chamava `createClient` no topo do módulo. Como
 * `ProtectedRoute` e `useAuth` importam este arquivo, e o `App` importa os
 * dois, o cliente era construído assim que a aplicação carregava — antes de
 * qualquer rota ser resolvida.
 *
 * Sem `VITE_SUPABASE_URL` definida, `createClient` lança `supabaseUrl is
 * required`. Como isso acontece durante o import, o React nem monta: a
 * página fica **completamente em branco**, sem mensagem, e a única pista é
 * uma linha no console do navegador.
 *
 * Medido nesta branch: com o `.env` ausente, `#root` ficava com 0 caracteres
 * de HTML. A landing pública da A1 — que não usa Supabase para nada — era
 * derrubada por uma dependência que ela nem exerce.
 *
 * A CORREÇÃO É ADIAR, NÃO ESCONDER
 * --------------------------------
 * O Proxy abaixo constrói o cliente na primeira vez que alguém toca numa
 * propriedade dele. Quem não usa autenticação nunca dispara a construção, e a
 * página renderiza. Quem usa recebe o MESMO erro de antes, no momento em que
 * de fato precisa do serviço — que é onde ele é diagnosticável.
 *
 * Nenhum valor padrão é inventado: configuração ausente continua sendo erro,
 * só que localizado.
 *
 * ESTA CAMADA DEVE SUMIR NA A6
 * ----------------------------
 * A A6 põe as telas de rede social atrás de `VITE_FEATURE_SOCIAL` e, com a
 * flag desligada, o Supabase não é inicializado nem entra no bundle. Quando
 * isso acontecer, este arquivo passa a ser carregado só no caminho que
 * realmente usa autenticação.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** Instância real, construída no primeiro uso. */
let instancia: SupabaseClient<Database> | null = null;

function obter(): SupabaseClient<Database> {
  if (instancia) return instancia;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    // Mensagem explícita: o erro original ("supabaseUrl is required") não diz
    // qual variável falta nem de onde ela deveria vir.
    throw new Error(
      "Supabase não configurado: defina VITE_SUPABASE_URL e " +
        "VITE_SUPABASE_PUBLISHABLE_KEY no .env do frontend. " +
        "Veja .env.example. A página inicial funciona sem isso; apenas as " +
        "telas que exigem conta dependem dele.",
    );
  }

  instancia = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return instancia;
}

/**
 * Importe como antes: `import { supabase } from "@/integrations/supabase/client"`.
 *
 * O Proxy mantém a mesma forma de uso. A diferença é invisível para quem
 * chama e decisiva para quem não chama.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_alvo, propriedade, receptor) {
    const valor = Reflect.get(obter(), propriedade, receptor);
    // Métodos precisam continuar ligados ao cliente real; sem o `bind`,
    // `supabase.auth` funcionaria mas `supabase.from(...)` perderia o `this`.
    return typeof valor === "function" ? valor.bind(obter()) : valor;
  },
  has(_alvo, propriedade) {
    return Reflect.has(obter(), propriedade);
  },
});

/** A configuração existe? Permite à interface evitar o caminho que falharia. */
export function supabaseConfigurado(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}
