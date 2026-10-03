# NEXO REALMS — configuração das keys

O jogo foi preparado para funcionar em modo local/convidado sem keys. Para ativar conta, cloud save e persistência competitiva, preencha somente as variáveis de ambiente.

## Client
Arquivo: apps/game-client/.env.local

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MULTIPLAYER_URL=

## Multiplayer
Ambiente do servidor:

PORT=2567
PUBLIC_ORIGIN=https://seu-dominio.com
GAME_SEASON_ID=season-2026-01
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

A service role key/secret key nunca deve ir para o navegador.

## Banco
Execute database/migrations/001_game_persistence.sql e depois 002_competitive_and_rewards.sql no projeto Supabase escolhido.

## O que passa a funcionar com as keys
- cadastro/login por e-mail;
- cloud save dos 3 slots;
- autenticação do multiplayer;
- Arena ranqueada/casual;
- rating e temporadas;
- Boss Rush validado no servidor;
- leaderboards e recompensas.

Sem keys, campanha, inventário, skills, quests, Tower e modos locais continuam disponíveis; Arena/Boss Rush podem rodar como servidor local sem persistência externa.
