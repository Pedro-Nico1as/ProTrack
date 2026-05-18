# Guia de Configuração (Setup)

Instruções para rodar o projeto ProTrack & Flow localmente.

## Pré-requisitos
- Node.js (v18+)
- npm ou yarn
- Expo Go instalado no celular (para testes mobile)
- Supabase CLI (opcional, para backend local)

## Mobile
1. Navegue até o diretório `protrack-mobile`.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Expo:
   ```bash
   npx expo start
   ```

## Backend
1. Navegue até o diretório `protrack-backend`.
2. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env`.
   - Preencha com as credenciais do seu projeto Supabase.

## Testes
Consulte o [Plano de Testes](./test-plan.md) para rodar a suite de QA.
