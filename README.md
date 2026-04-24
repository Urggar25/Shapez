# Forgefront Protocol

Prototype jouable d'un jeu d'automation/gestion inspiré de Shapez, Factorio, Mindustry et Opus Magnum.

## Lancer le prototype

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Boucle de jeu du prototype

- Construire des extracteurs sur les gisements.
- Poser des tapis roulants pour transporter les ressources.
- Transformer dans des machines (four, découpeuse, assembleur, raffinerie).
- Livrer vers le hub central pour gagner des crédits et de la science.
- Débloquer des technologies pour accélérer et étendre la base.

## Commandes

- `1`: Extracteur
- `2`: Tapis
- `3`: Bras robotisé
- `4`: Four
- `5`: Découpeuse
- `6`: Assembleur
- `7`: Trieur
- `8`: Stockage
- `9`: Raffinerie
- `0`: Laboratoire
- `R`: Rotation
- `C`: Effacer une case

## Génération de ressources média

Le script `generator.py` génère automatiquement (localement) :

- textures SVG cohérentes (`assets/textures`)
- sons WAV synthétiques (`assets/sfx`)

> Les assets générés ne sont plus versionnés pour éviter les erreurs GitHub liées aux fichiers binaires dans certaines interfaces de PR.

```bash
python3 generator.py
```

## Vision produit (Steam)

Prix cible premium: 14,99€ à 24,99€ avec roadmap DLC (planètes, chaînes avancées, automation IA) et support mods/workshop.
