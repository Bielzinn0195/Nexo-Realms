# NEXO REALMS — 100 auditorias + 100 correções

Cada item abaixo representa um ciclo alternado: **auditoria → correção aplicada** na branch `feat/100-audits-100-fixes`.

1. Arena usava sala inexistente → roteada para ranked/casual.
2. Arena não passava token → autenticação Colyseus adicionada.
3. Boss Rush não passava token → autenticação adicionada.
4. Texto dizia sala privada → alinhado ao 1v1 implementado.
5. Queue podia ficar preso → estado resetado ao terminar.
6. Teclas eram criadas por frame → referências persistentes.
7. Input Arena repetia addKey → reutilização de teclas.
8. Rating vinha do cliente → removida confiança no rating enviado.
9. Casual alterava ELO → rating limitado ao ranked.
10. Wins/losses eram sobrescritos → leitura e incremento dos totais.
11. Resultado casual recalculava rating local → bloqueado.
12. Rating do servidor era ignorado → cliente usa rating autoritativo.
13. Token expirado no Arena → refresh antes do join.
14. Token expirado no Boss Rush → refresh antes do join.
15. Boss Rush não expunha dificuldade → dificuldade adicionada ao fluxo.
16. Boot dizia Vertical Slice → identidade pública atualizada.
17. Texture de inimigo tinha chave errada → corrigida.
18. Timer de ataque inimigo era ambíguo → timing determinístico.
19. Feedback de hit podia executar após destroy → callback protegido.
20. Tower recriava teclas por frame → input persistente + cooldown de dash.
21. Ações Arena sem validação → vocabulário validado.
22. Finalização Arena podia duplicar → idempotência adicionada.
23. Difficulty Boss Rush normalizada → valores inválidos caem em normal.
24. Classe Boss Rush normalizada → apenas classes válidas.
25. Fase Boss Rush não tinha evento → evento de fase adicionado.
26. Estado local de Boss Rush tinha feedback insuficiente → status melhorado.
27. Validação não cobria modos → todos os modos verificados.
28. Validação não cobria classes → três classes verificadas.
29. Validação não cobria regiões → seis regiões verificadas.
30. Validação não cobria XP de equipamento → campo verificado.
31. GDD usava nomes antigos → classes canonizadas.
32. CSS não tinha viewport mobile robusto → regras mobile adicionadas.
33. Phaser não declarava keyboard explicitamente → input declarado.
34. Boot não tinha diagnóstico de runtime → marcador adicionado.
35. Touch Arena podia duplicar controles → controles resetados.
36. Saída Arena não limpava touch → cleanup adicionado.
37. Saída Boss Rush não limpava boss → destroy adicionado.
38. Saída Tower não limpava actor → cleanup adicionado.
39. Derrota Tower não zerava velocidade → reset de movimento.
40. Spawn Tower não protegia definição → guard adicionado.
41. Score Boss Rush sem teto → clamp adicionado.
42. Erros Supabase eram pouco informativos → corpo limitado incluído.
43. Supabase HTTP sem no-store → cache desabilitado.
44. Porta inválida não tinha fallback → parsing robusto.
45. Servidor não validava faixa de porta → validação 1–65535.
46. Cloud save sem userId podia prosseguir → guard de identidade.
47. Runtime não tinha contrato automatizado → audit-runtime criado.
48. Script não estava exposto → npm run audit:runtime.
49. CI não rodava contrato → etapa adicionada.
50. RLS competitivo permitia escrita pelo cliente → migration 003 preparada.
51. Season default divergente → season-2026-10.
52. Env/docs divergiam → sincronizados.
53. Database docs não citavam hardening → documentação atualizada.
54. README não explicava separação NEXO/NEXO REALMS → nota adicionada.
55. Checkpoint final estava stale → hardening registrado.
56. Smoke cobria só health → config/leaderboard adicionados.
57. Limit leaderboard podia ser NaN → sanitizado.
58. API não forçava no-store → corrigida.
59. OPTIONS não declarava métodos → GET/OPTIONS.
60. API não tinha versão → apiVersion adicionada.
61. Save confiava no gameClass → classe sanitizada.
62. Inventory save não limitava recursos → bounds adicionados.
63. Quest aceitava incremento inválido → validação.
64. Skill points restaurados sem teto → clamp.
65. Skill cost inválido podia passar → custo positivo exigido.
66. XP inválido podia corromper progressão → validação.
67. Loot pool vazio podia quebrar → guard.
68. Skills locais sem throttle → debounce.
69. Damage inválido → rejeitado.
70. Multiplier inválido → rejeitado.
71. Quantidade de item inválida → rejeitada.
72. Level de equipamento inválido → rejeitado.
73. Recursos de inventário corrompidos → guard.
74. XP de equipamento inválido → rejeitado.
75. Item level podia crescer sem limite → XP limitado.
76. Joystick não tinha pointer owner → pointer tracking.
77. HUD duplicava pointer events → label deixou de ser interactive.
78. Inventário mostrava 32/36 slots → 36 slots.
79. UI passava level 99 → requisito real respeitado.
80. Skill tree tinha gap fixo → layout responsivo.
81. Quest panel tinha step fixo → espaçamento responsivo.
82. HUD sem depth explícito → depth elevado.
83. Inventory modal sem depth → depth 1100.
84. Skill tree modal sem depth → depth 1100.
85. Quest modal sem depth → depth 1100.
86. Arena listeners acumulavam → cleanup no shutdown.
87. Boss Rush listeners/room acumulavam → cleanup no shutdown.
88. Tower listeners/enemy acumulavam → cleanup no shutdown.
89. Save item data legacy não era normalizada → migração/sanitização.
90. Erro de storage era cru → mensagem explícita.
91. Validação não cobria migration 003 → checks adicionados.
92. Runtime audit não cobria Arena auth → checks adicionados.
93. Runtime audit não detectava secret key no cliente → guard estático.
94. Checklist não citava audit-runtime → passo adicionado.
95. Key setup não destacava secret boundary → regra explícita.
96. Não havia comando combinado de contratos → test:contracts.
97. Env local precisava de barreira → .gitignore reforçado.
98. Migration order estava disperso → database/README criado.
99. Os ciclos anteriores não tinham registro único → este log criado.
100. Estado final precisava de um checkpoint verificável → próximo checkpoint/CI passa a ser a validação final do conjunto.

## Regra de segurança

A migration 003 foi preparada, mas **não aplicada ao projeto Supabase do NEXO streaming**. O backend REALMS deve usar um projeto Supabase dedicado antes da ativação online.
