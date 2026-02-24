

# Corrigir Alinhamento Visual — Revenue Share e Royalties

## Problema
Na seção 9 (Regras Comerciais / Receita), os dois campos (Revenue Share da Franquia no SAAS e Royalties sobre Receita Bruta) estão desalinhados verticalmente. O label do lado esquerdo quebra em duas linhas enquanto o direito fica em uma, e as descrições e inputs não alinham entre si.

## Solução

**Arquivo:** `src/components/simulator/SectionRevenueRules.tsx`

- Uniformizar a estrutura dos dois campos para que ambos tenham a mesma altura em cada "faixa" (label+badge, descrição, input)
- Usar `items-start` no grid e garantir que cada sub-bloco (label, descrição, input) tenha altura mínima consistente
- Colocar o badge "Somente Admin" abaixo do label (em vez de ao lado) para evitar quebra de linha desigual, ou usar `min-h` nos containers de label e descrição para forçar alinhamento
- Aplicar `flex flex-col justify-between` em cada coluna para distribuir o espaço igualmente

Mudança simples de layout CSS/estrutura JSX, sem alteração de lógica.

