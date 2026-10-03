# Sprite import

A referência enviada para os três personagens contém 3 classes em 4 poses direcionais: Cavaleiro, Arqueiro e Mago.

O runtime atual já possui animações de ataque, skill, dash, dano e morte por camadas, permitindo usar a folha de sprites como base sem exigir novos frames de ataque.

Para trocar a arte procedural pela folha final, coloque os PNGs em:

assets/characters/cavaleiro/
assets/characters/arqueiro/
assets/characters/mago/

Depois, registre as texturas no BootScene/preload e mantenha os mesmos identificadores hero-cavaleiro-*, hero-arqueiro-* e hero-mago-* usados pelo WorldScene.

O pacote de sprites transparente gerado a partir da referência deve ser tratado como asset do projeto; nenhuma key é necessária para essa etapa.
