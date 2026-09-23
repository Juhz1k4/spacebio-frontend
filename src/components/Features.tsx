import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, Quote, ScanSearch, ShieldCheck } from "lucide-react";

/**
 * F0-2 -- CARTÕES REESCRITOS PARA DESCREVER O QUE EXISTE.
 *
 * Os seis anteriores prometiam: rede profissional, publicação de artigos,
 * chat em tempo real, feed personalizado e análise bibliométrica. CINCO dos
 * seis descreviam funcionalidade que o produto não tem, e o sexto
 * ("Assistente IA Avançado") prometia análise de dados e desenvolvimento de
 * hipóteses, que também não acontece.
 *
 * Os quatro abaixo descrevem capacidades que estão no código hoje e podem ser
 * verificadas abrindo a tela da Dra. Aris. Nenhum menciona número.
 *
 * Deliberadamente NÃO incluímos "Panorama do acervo" e "Lacunas de
 * conhecimento", que a A1 propõe: essas telas são as issues A2 e A3 e ainda
 * não existem. Anunciá-las agora repetiria exatamente o defeito que esta
 * issue corrige, só que com texto novo.
 */
const features = [
  {
    icon: Quote,
    title: "Respostas com o trecho citado",
    description:
      "Cada afirmação vem com o número da passagem que a sustenta. Clicar no número leva ao texto literal do artigo, com revista e DOI.",
  },
  {
    icon: ShieldCheck,
    title: "Recusa quando não há lastro",
    description:
      "Se o acervo não cobre a pergunta, a resposta é dizer isso — e não arriscar uma resposta plausível sem base. A recusa é o comportamento projetado, não uma falha.",
  },
  {
    icon: ScanSearch,
    title: "Citações conferidas por código",
    description:
      "As referências e os trechos entre aspas são verificados contra as passagens recuperadas depois que o texto é gerado. O que não confere perde as aspas e fica registrado.",
  },
  {
    icon: BookMarked,
    title: "Referência pronta para citar",
    description:
      "Exportação em ABNT ou BibTeX a partir dos metadados bibliográficos do artigo, montada por código. Campo que falta encurta a referência; nunca é inventado.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 md:px-6 relative">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          {/* F0-2: dizia "Tudo que você precisa para colaborar, publicar e
              avançar sua pesquisa" -- promessa de um produto que não é este. */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Como a <span className="text-gradient">evidência</span> aparece
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            O que separa este sistema de um chatbot: toda afirmação é rastreável
            até o artigo, e a ausência de evidência é dita em voz alta.
          </p>
        </div>

        {/* 2 colunas: com 4 cartões, lg:grid-cols-3 deixaria um órfão na
              segunda linha. */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-elevated bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all hover:scale-105"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-cosmic flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
