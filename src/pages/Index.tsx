/**
 * SPACEBIO A1 — página inicial pública
 *
 * POR QUE ESTE ARQUIVO MUDOU DE UMA LINHA PARA ISTO
 * -------------------------------------------------
 * Ele renderizava `Dashboard`, que envolve o conteúdo em `<ProtectedRoute>`.
 * A consequência é que a página inicial estava ATRÁS DO LOGIN: quem abrisse o
 * link compartilhado era mandado para `/auth` antes de ver uma palavra sobre
 * o produto.
 *
 * Isso esvaziava a A1 inteira. Reposicionar uma página que ninguém alcança
 * não muda nada — e a B10, que monta o cartão de compartilhamento, existe
 * justamente para trazer gente por link.
 *
 * Agora `/` renderiza a landing diretamente, sem autenticação e sem o menu
 * lateral, que é mobília de área logada e não faz sentido para quem chega de
 * fora.
 *
 * O QUE **NÃO** MUDOU
 * -------------------
 * A área autenticada continua existindo, agora em `/dashboard`, com o mesmo
 * `ProtectedRoute` e o mesmo menu. Desligar de vez as telas de rede social é
 * a issue A6, que as põe atrás de uma flag em vez de apagar o código. Aqui o
 * escopo é só deixar a porta da frente aberta.
 */

import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
    </div>
  );
};

export default Index;
