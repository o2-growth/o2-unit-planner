

## Plano: Subsecção Pró-labore Sócios na Seção 9

### Resumo

Criar configuração de 1-3 sócios com pró-labore individual. Cada sócio tem um papel (Técnico/Comercial/Administrativo) que determina onde seu custo é alocado. A lógica usa MAX(premissa_%, prolabore_socio) para a linha correspondente.

### 1. `src/types/simulator.ts` — Novo tipo + estado

```ts
export interface SocioData {
  proLabore: number;
  papel: 'tecnico' | 'comercial' | 'administrativo';
}

export interface SociosConfig {
  quantidade: 1 | 2 | 3;
  socios: SocioData[];
}
```

Adicionar `socios: SociosConfig` ao `SimulatorState` com default:
```ts
socios: { quantidade: 1, socios: [{ proLabore: 0, papel: 'tecnico' }] }
```

### 2. `src/components/simulator/SectionPL.tsx` — UI da subsecção

Novo card "Pró-labore Sócios" antes dos cards de custos/despesas:
- Select: Número de sócios (1, 2, 3)
- Para cada sócio: nome do papel (dropdown: Técnico/Comercial/Administrativo), CurrencyInput pró-labore
- Info: "Técnico → alocado em Custos CAAS | Comercial → Desp. Comerciais | Administrativo → Desp. Administrativas"
- Mostrar: "Será usado MAX(premissa %, pró-labore) para cada linha"

Props: receber `socios` e `onSociosChange` do Index.

### 3. `src/lib/financial.ts` — Lógica MAX

Para cada sócio ativo:
- **Técnico**: `custosCaas = MAX(rbCaas * custoCaasRate, socio.proLabore)`
- **Comercial**: `despComerciais = MAX(receitaBrutaTotal * comRate, socio.proLabore)`
- **Administrativo**: `despAdm = MAX(despAdm_calculada, socio.proLabore)`

Se dois sócios têm o mesmo papel, somar os pró-labores antes de aplicar MAX.

### 4. `src/pages/Index.tsx` — Passar props

Adicionar `socios` ao state, passar para SectionPL e para `calculateProjections`.

### 5. `src/lib/financial.ts` — Assinatura

`calculateProjections` já recebe `state` inteiro, então `state.socios` estará disponível sem mudança de assinatura.

### 6. Migração

Em `migrateState`, se `parsed.socios` não existe, usar default.

### Arquivos afetados
- `src/types/simulator.ts` — tipos + default
- `src/components/simulator/SectionPL.tsx` — UI subsecção
- `src/lib/financial.ts` — lógica MAX
- `src/pages/Index.tsx` — props + migração

