# Game Design Document — Forgefront Protocol

## 1) Promesse produit

Jeu d'automatisation premium PC (Steam), simple à apprendre, profond à maîtriser, basé sur la boucle:

**Extraire → Transporter → Transformer → Optimiser → Étendre**

## 2) Positionnement

- Inspirations: Shapez (lisibilité), Factorio (échelle), Mindustry (pression logistique), Opus Magnum (optimisation élégante).
- Identité: automation modulaire multi-biomes + contrats dynamiques + prestige systémique.

## 3) Ressources

### Ressources naturelles
- minerai
- cuivre
- charbon
- sable
- pétrole
- cristaux
- biomasse
- eau

### Ressources rares
- uranium
- titane
- données quantiques
- énergie pure

### Intermédiaires/exemples
- ferraffiné, silicium, plastique, circuits, alliage, nanotube, carburant, module IA

## 4) Catalogue machines

### Base
- extracteur
- tapis roulant
- bras robotisé
- four
- découpeuse
- assembleur
- trieur
- stockage

### Avancé
- raffinerie
- imprimante 3D
- laboratoire
- drone hub
- gare ferroviaire
- fusionneur moléculaire

### Endgame
- téléporteur logistique
- IA d'optimisation
- nano-usine auto-réplicante

## 5) Arbre technologique (macro)

- Industrie: vitesse/rendement/machines MK2-MK3
- Logistique: tapis rapides, trains, drones, tri intelligent
- Énergie: charbon → solaire → nucléaire → fusion
- Informatique: circuits, IA, automation autonome
- Expansion: zones lointaines, planètes supplémentaires
- Prestige: reset volontaire + bonus permanents

## 6) Contraintes de gestion

- énergie limitée et priorisation des lignes
- congestion réseau (tapis, hubs, gares)
- pénuries matières / mauvais ratio input-output
- pollution locale impactant rendement
- saturation stockage et dette maintenance

## 7) Biomes

- continent terrestre
- archipel
- désert minéral
- planète glacée
- monde volcanique
- astéroïde spatial

Chaque biome modifie extraction, énergie disponible, transport optimal et risques.

## 8) Contrats dynamiques

Exemples:
- livrer 500 circuits
- maintenir 50 objets/min
- alimenter une ville orbitale
- lancer une fusée cargo
- construire un supercalculateur
- terraformer une zone

## 9) Progression addictive

- objectifs visibles en permanence
- récompenses courtes (crédits/science)
- pics sensoriels (FX + audio) aux milestones
- stats de rendement en temps réel
- objectifs secondaires pour casser la monotonie

## 10) Rejouabilité

- cartes procédurales seedées (partageables)
- modes défi et speedrun
- leaderboard (seed + catégorie)
- difficulté progressive
- New Game+ avec mutateurs

## 11) Direction artistique

- vue top-down lisible
- palette claire par couche logistique
- feedback machine "satisfying" (animation/particules)
- effet lumineux croissant avec progression
- textures procédurales cohérentes

## 12) Audio

- sons machines paramétriques
- UI click feedback court
- ambiance industrielle relaxante
- montée musicale lors d'objectifs complétés
- couches musicales débloquées par tier techno

## 13) Monétisation / roadmap

- Jeu premium: 14,99€–24,99€
- DLC: planètes + chaînes spécialisées
- Support mods + Steam Workshop

## 14) Priorité dev (MVP)

Le prototype initial doit inclure:
- extraction
- tapis roulants
- 10 machines
- arbre techno simple
- 20 ressources cataloguées
- sauvegarde locale
- UI claire

## 15) Architecture web recommandée

- **HTML/CSS/JS** pour client de jeu (canvas)
- **Python** pour génération procédurale offline (assets, équilibrage, export data)
- données JSON versionnées pour ressources, recettes, machines, contrats
