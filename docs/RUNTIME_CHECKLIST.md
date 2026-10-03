# Runtime checklist

1. npm install
2. npm run validate:data
3. npm run typecheck
4. npm run build
5. npm run smoke:server
6. npm run dev:server
7. npm run dev
8. Testar os 3 slots e as 3 classes.
9. Testar campanha, inventário, upgrade, Ascend, Imbue, XP de equipamento, árvore de skills, quests, bosses e checkpoints.
10. Testar Torre, Boss Rush e Arena.
11. Testar teclado, touch e controle.
12. Preencher as keys somente depois do teste local.
13. Aplicar as migrations no Supabase.
14. Repetir o teste online com duas contas.
15. Somente depois integrar ao repositório NEXO principal.

Este repositório permanece independente do NEXO principal durante toda a fase de QA.

- `npm run audit:runtime` — validate client/server room contracts and secret-key boundaries.
