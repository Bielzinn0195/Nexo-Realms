# Sprites e animações

## Direção

Os três personagens seguem a referência fornecida:
1. Cavaleiro — coluna esquerda
2. Arqueiro — coluna central
3. Mago — coluna direita

A referência possui poses estáticas/direcionais. Ela não deve ser tratada como se já contivesse todas as animações necessárias.

## Pipeline final

Cada personagem terá spritesheets separados:

- idle
- run
- jump
- fall
- attack-1
- attack-2
- attack-3
- skill-1
- skill-2
- skill-3
- dash
- hurt
- death
- victory

Também haverá efeitos separados para:
- espada
- flecha
- projétil mágico
- impacto
- crítico
- dash
- congelamento
- meteoro
- escudo

O código já usa nomes estáveis de animação, permitindo substituir os placeholders pelos sprites finais sem reescrever o combate.
