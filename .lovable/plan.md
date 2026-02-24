

# Reformular Ajustes Abaixo do EBITDA

## Resumo
Transformar os campos de Receita e Despesa Financeira para aceitar percentual (%) sobre receita bruta, configurar Amortizacao como PMT de emprestimo bancario/mutuo, e adicionar descricoes/tooltips explicativos em cada campo.

## Mudancas

### 1. Alterar tipo de dados (`src/components/simulator/SectionPL.tsx`)

O tipo `BelowEbitdaData` muda de:
```text
recFinanceiras: number (R$)
despFinanceiras: number (R$)
amortizacao: number (R$)
investimentosMensal: number (R$)
```
Para:
```text
recFinanceirasPercent: number (% sobre receita bruta)
despFinanceirasPercent: number (% sobre receita bruta, default 1%)
amortizacaoPMT: number (R$ - parcela mensal do emprestimo)
investimentosMensal: number (R$ - mantido igual)
```

### 2. Atualizar UI dos campos (`src/components/simulator/SectionPL.tsx`)

- **Receitas Financeiras**: Campo de percentual (%) com label "Receitas Financeiras (% s/ receita)"
- **Despesas Financeiras**: Campo de percentual (%) com valor padrao 1% e aviso informativo: "Padrao de 1% sobre receita bruta. Pode ser alterado conforme a operacao."
- **Amortizacao da Divida**: Renomear para "PMT Emprestimo (parcela mensal)" com tooltip explicando que se refere ao pagamento mensal de emprestimo bancario/mutuo para inicio da operacao
- **Investimentos**: Adicionar tooltip explicando: "Investimentos mensais em ativos (computadores, branding do escritorio, compra de outros escritorios, partnership na matriz, etc.)"

### 3. Atualizar calculo financeiro (`src/lib/financial.ts`)

- `recFinanceiras` passa a ser calculado: `receitaBrutaTotal * (recFinanceirasPercent / 100)`
- `despFinanceiras` passa a ser calculado: `receitaBrutaTotal * (despFinanceirasPercent / 100)`
- `amortizacao` usa o valor fixo de `amortizacaoPMT` diretamente (parcela mensal)
- `investimentos` permanece igual

### 4. Atualizar estado inicial (`src/pages/Index.tsx`)

- Ajustar o estado `belowEbitda` para usar os novos nomes de campos
- Definir `despFinanceirasPercent: 1` como valor padrao

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/simulator/SectionPL.tsx` | Tipo BelowEbitdaData, UI com inputs de %, tooltips |
| `src/lib/financial.ts` | Calculo de rec/desp financeiras como % da receita |
| `src/pages/Index.tsx` | Estado inicial com novos campos e default 1% |

