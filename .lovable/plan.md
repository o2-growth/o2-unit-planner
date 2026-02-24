
# Login Simples e Persistencia de Simulacoes no Banco de Dados

## Resumo
Criar um sistema de login simplificado (nome + email, sem validacao por email) e salvar as simulacoes do usuario no banco de dados do Lovable Cloud, substituindo o localStorage.

## Etapas

### 1. Banco de Dados - Criar tabelas

**Tabela `profiles`:**
- `id` (UUID, PK, referencia auth.users.id com ON DELETE CASCADE)
- `nome` (text, not null)
- `email` (text, not null)
- `created_at` (timestamp with default now())

**Tabela `simulations`:**
- `id` (UUID, PK, default gen_random_uuid())
- `user_id` (UUID, not null, referencia profiles.id com ON DELETE CASCADE)
- `nome` (text, default 'Minha Simulacao')
- `state` (jsonb, not null) -- armazena o SimulatorState completo
- `created_at` / `updated_at` (timestamps)

**RLS Policies:**
- profiles: usuarios so leem/atualizam o proprio perfil
- simulations: usuarios so acessam suas proprias simulacoes

**Trigger:** criar perfil automaticamente ao registrar usuario (via trigger on auth.users insert)

**Auth config:** habilitar auto-confirm de email (pois o usuario pediu explicitamente "sem validacao por email")

### 2. Tela de Login/Registro

Criar pagina `/auth` com formulario simples:
- Campo Nome
- Campo Email
- Campo Senha (necessario para autenticacao)
- Botoes "Entrar" e "Criar Conta"
- Sem validacao por email (auto-confirm habilitado)

### 3. Contexto de Autenticacao

Atualizar `AuthContext.tsx` para usar autenticacao real do banco:
- `signUp(nome, email, senha)` -- cria conta + perfil
- `signIn(email, senha)` -- faz login
- `signOut()` -- faz logout
- Expor dados do usuario logado (id, nome, email)
- Listener `onAuthStateChange` para manter sessao

### 4. Roteamento Protegido

- Redirecionar para `/auth` se nao estiver logado
- Redirecionar para `/` se ja estiver logado (ao acessar `/auth`)

### 5. Persistencia das Simulacoes

Atualizar `ActionButtons.tsx`:
- "Salvar Simulacao" grava no banco (upsert na tabela simulations)
- "Carregar Simulacao" busca do banco
- Manter fallback para localStorage quando offline

Atualizar `Index.tsx`:
- Carregar simulacao do banco ao montar (se logado)
- Auto-save no banco ao fazer alteracoes

### 6. Header com Usuario Logado

Substituir o `AdminLogin` no header por informacoes do usuario logado (nome + botao sair).

---

## Detalhes Tecnicos

### Arquivos novos:
- `src/pages/Auth.tsx` -- pagina de login/registro
- `src/components/ProtectedRoute.tsx` -- wrapper de rota protegida

### Arquivos modificados:
- `src/contexts/AuthContext.tsx` -- reescrever para usar autenticacao real
- `src/App.tsx` -- adicionar rota `/auth` e proteger rota `/`
- `src/components/simulator/ActionButtons.tsx` -- salvar/carregar do banco
- `src/pages/Index.tsx` -- carregar simulacao do banco ao iniciar, mostrar nome do usuario

### Migracao SQL:
1. Criar tabela `profiles` com RLS
2. Criar tabela `simulations` com RLS
3. Criar trigger para auto-criar perfil no signup
4. Configurar auto-confirm de email
