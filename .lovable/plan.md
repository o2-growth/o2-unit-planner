
# Simulador Financeiro de Franquia O2 Inc.

Ferramenta web one-page para simulação financeira completa de unidades franqueadas, com branding O2 Inc. (tons de verde e preto), fluxo vertical de cima para baixo e uso comercial com candidatos a franqueados.

---

## Seção 1 — Perfil do Novo Sócio
Formulário com campos de identificação: nome, experiência (seleção única), se já possui consultoria, número de clientes ativos, ticket médio (R$), receita mensal (R$), funcionários (condicional), e pró-labore atual (R$). Campos com máscara monetária e validações.

## Seção 2 — Mensagem de Transição
Card em destaque com a frase: *"Muito obrigado por suas respostas, agora você está apto a montar o BP da sua unidade."*

## Seção 3 — Objetivos do Franqueado
Campos para metas: faturamento desejado em 12 meses (R$/mês), pró-labore atual desejado, pró-labore em 12 meses, e meta de ROI/payback com seletor de prazo (12, 18, 24, 36, 48, 60 meses). Seguido de mensagem: *"Excelente. Bora para os números."*

## Seção 4 — Horizonte de Projeção
Seletor de prazo (12/18/24/36/48/60 meses) com badges de "curto prazo" e "longo prazo". Toda a modelagem recalcula automaticamente conforme o horizonte selecionado.

## Seção 5 — Premissas Comerciais (Venda Própria)
- **Compromisso comercial**: slider de 1 a 10 projetos/mês
- **Tickets por produto**: campos editáveis com valor sugerido e mínimo (Setup, CAAS, SaaS, Diagnóstico Estratégico), com aviso visual se abaixo do mínimo
- **Mix de vendas**: distribuição das vendas mensais entre os 4 produtos, com validação de soma e indicador visual

## Seção 6 — Clientes Comprados da Matriz
Seção destacada com campos para: quantidade mensal inicial, tipo de crescimento (fixo, incremental ou percentual), preço por cliente (CAC, padrão R$ 9.000), e receita por cliente comprado (Setup R$ 15.000 + MRR R$ 6.570,10). Projeção mensal automática de quantidade, acumulado, receita e custos.

## Seção 7 — Churn sobre MRR
Campo de churn mensal (%) com projeção mês a mês: base MRR inicial, churn em R$, novo MRR, base MRR final. Tabela visível e transparente.

## Seção 8 — Impostos / Deduções
Configuração tributária com campos vazios (PIS, COFINS, IRPJ, CSLL, ISSQN, ICMS). Alíquotas editáveis manualmente, com checkboxes para marcar quais impostos se aplicam a quais produtos.

## Seção 9 — Regras Comerciais / Receita
- Mapeamento de produtos do formulário para o plano de contas (configurável)
- Revenue share do SaaS (padrão 30%, editável) — separação visual entre receita total e reconhecida pela franquia
- Royalties sobre receita bruta (padrão 20%, editável)

## Seção 10 — P&L / DRE Gerencial
Tabela completa seguindo o plano de contas fornecido (Receita Bruta → Deduções → Receita Líquida → Custos Variáveis → Lucro Bruto → Despesas Fixas → EBITDA → Ajustes → Resultado Líquido → Amortização/Investimentos → Resultado Final). Visão mensal com scroll horizontal, valores em R$ e margens %. Subtotais em destaque com estilo verde/preto da O2.

## Seção 11 — ROI e Payback
Campos editáveis de investimento inicial (taxa de franquia, capital de giro, implantação, marketing, equipamentos, outros). Cálculos automáticos de ROI anual (%) e Payback (meses). Comparação com a meta do usuário e status visual (atinge/não atinge).

## Seção 12 — Visualização dos Resultados
Tabs para alternar entre visão Mensal, Consolidada e Anualizada. KPIs em cards destacados: Receita Bruta Total, Receita Líquida, MRR Final Projetado, Churn (%), Lucro Bruto, EBITDA (R$ e %), Resultado Líquido, Resultado Final, ROI (%), Payback (meses).

## Funcionalidades Transversais
- **Recálculo automático** ao alterar qualquer premissa
- **Tooltips** explicativos nos campos
- **Botão "Resetar Premissas"** para limpar tudo
- **Salvar simulação** em localStorage (carregar depois)
- **Exportar PDF** com resultado completo
- **Exportar Excel** com dados da modelagem
- **Validações** em tempo real (ticket mínimo, soma do mix, campos obrigatórios)
- **Branding O2 Inc.** com paleta verde/preto baseada na imagem de referência

## Abordagem de Implementação
Tudo frontend, sem backend necessário. Toda a lógica financeira implementada de forma transparente e organizada em funções reutilizáveis. Dados armazenados em localStorage. A implementação será feita em etapas progressivas dada a complexidade (formulários primeiro, depois lógica financeira, depois visualização e exportação).
