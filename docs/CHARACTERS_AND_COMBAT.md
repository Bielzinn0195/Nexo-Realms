# NEXO REALMS — Classes e combate

## Classes atuais

### Cavaleiro
- Espada e escudo
- Vigor
- Alta vida/defesa
- Combate corpo a corpo
- Combo de 3 golpes
- Impacto do Escudo
- Giro de Aço
- Postura Guardiã

### Arqueiro
- Arco
- Foco
- Alta velocidade e crítico
- Ataques à distância
- Disparo Rápido
- Duplo Disparo
- Flecha Perfurante
- Chuva de Flechas
- Tiro Evasivo
- Foco do Caçador

### Mago
- Cajado
- Mana
- Maior recurso e dano mágico
- Projétil Arcano
- Raio Gélido
- Explosão Arcana
- Nova Congelante
- Meteoro
- Véu Arcano

## Arquitetura de combate

O combate é orientado a dados. Cada ataque possui dano relativo, custo, cooldown, alcance, tipo de hitbox e animação. Isso permite balancear as classes sem duplicar lógica.

Estados:
- idle
- attack
- skill
- dash
- hurt
- dead

A imagem de referência enviada pelo usuário será tratada como a direção visual dos personagens. As poses existentes são usadas como base direcional; frames adicionais de ataque, impacto, dash, skill e morte precisam ser produzidos para o spritesheet final.
