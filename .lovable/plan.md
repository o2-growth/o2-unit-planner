

## Plano: Ajustar páginas MRR e ROI do PDF

### 1. Página MRR — Reordenar e renomear colunas (linhas 531-557)

Colunas atuais: `MRR CAAS, MRR SAAS, MRR Matriz, MRR Total, Churn R$, Clientes Mês, Clientes Acum., Setup Matriz`

Novas colunas (ordem corrigida):
```
MRR Franquia | MRR Matriz | MRR Total | Churn Total | MRR Total Líquido | Novos Clientes Mês (Total) | Clientes Acumulados (Total)
```

- **MRR Franquia**: `mrrCaasOwn + mrrSaasOwn` (receita recorrente própria da franquia)
- **MRR Matriz**: `mrrMatriz`
- **MRR Total**: `mrrCaasOwn + mrrSaasOwn + mrrMatriz` (bruto, antes de churn)
- **Churn Total**: `churnValor`
- **MRR Total Líquido**: `mrrTotal` (que já é líquido de churn no cálculo)
- **Novos Clientes Mês (Total)**: `clientesCompradosMes`
- **Clientes Acumulados (Total)**: `clientesCompradosAcum`

Remover coluna **Setup Matriz** da tabela MRR.

Atualizar glossário para refletir os novos termos:
- **MRR Franquia**: Receita recorrente da unidade (CAAS + SAAS revenue share)
- **MRR Matriz**: MRR dos clientes adquiridos via inbound da matriz
- **MRR Total**: Soma bruta de MRR Franquia + MRR Matriz, antes do churn
- **Churn Total**: Perda mensal de receita recorrente
- **MRR Total Líquido**: MRR Total após dedução do churn
- **Novos Clientes Mês**: Total de novos clientes no período
- **Clientes Acumulados**: Base ativa ao final do período

### 2. Página ROI — Adicionar explicações descritivas (linhas 622-715)

Manter layout atual (2 cards lado a lado) mas adicionar descrições explicativas abaixo de cada item:

**Card Investimento Detalhado** — após cada item, adicionar texto explicativo em fonte menor (6.5pt, cor muted):
- **Taxa de Franquia**: Exibir valor original (R$ 190.000) e, se cupom aplicado, mostrar "Cupom: {cupom} — Desconto: R$ 50.000" abaixo
- **Marketing Inicial**: "Evento de lançamento, Mídias, Parcerias, Patrocínios e/ou compra de mais clientes (CAC)"
- **Equipamentos**: "Mesa, computador, televisão, etc."
- **Capital de Giro**: "Gap dos primeiros meses para suportar período de prejuízo"
- **INVESTIMENTO TOTAL**: "Todos investimentos + Capital de giro sugerido"

**Card Indicadores de Retorno** — adicionar descrições:
- **ROI Direto**: Adicionar subtexto explicando fórmula
- **ROI Total**: Adicionar subtexto explicando fórmula
- **Payback**: "Tempo até o Lucro Líquido acumulado pagar o INVESTIMENTO TOTAL"

Aumentar altura do card de 80 para ~105 para acomodar as explicações. Ajustar espaçamento vertical dos itens.

### Arquivos afetados
- `src/lib/exportPdf.ts` — funções `drawMRRPage` e `drawROIPage`

