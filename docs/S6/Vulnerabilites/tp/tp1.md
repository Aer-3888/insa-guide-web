---
title: "TP1 - Shell for Security : Analyse de fichier"
sidebar_position: 1
---

# TP1 - Shell for Security : Analyse de fichier

## Objectif

Analyser un fichier de donnees sensibles (.prep) pour identifier des vulnerabilites, extraire des metriques et rechercher des elements de securite tels que des mots de passe, des identifiants et des donnees obfusquees.

## Enonce

**Fichier** : TP-Shell-1.pdf

**Taches** :
1. Selectionner un fichier aleatoire dans prep.zip
2. Evaluer le contenu (type de fichier, structure, langue)
3. Calculer des metriques (nombre de lignes, frequences de caracteres, elements structurels)
4. Rechercher des elements de securite (mots de passe, identifiants, URLs d'administration, donnees obfusquees)
5. Documenter les resultats avec des commandes shell

**Contraintes** :
- Utiliser uniquement des commandes shell (pas de scripts Python sauf pour les calculs)
- Privilegier les recherches de chaines litterales (fgrep) plutot que les regex
- Aucun fichier binaire fourni

## Corrige

**Fichier analyse** : `pixgame.html.prep` (page d'accueil d'un site WordPress)

**Resultats** : `resultat-GONZALEZ.txt`

### Resultats principaux

#### 1. Metriques du fichier
- **Type** : fichier HTML UTF-8 avec des lignes tres longues
- **Taille** : 656 028 octets
- **Lignes** : 16 368 au total, 14 289 non vides
- **Plus longue ligne** : 32 083 caracteres (ligne 9825, remplie de 'x')
- **Longueur moyenne d'une ligne** : ~44 caracteres

#### 2. Structure HTML
Balises les plus frequentes :
- `<div>` : 794 occurrences
- `<span>` : 355
- `<a>` : 310 (liens)
- `<script>` : 63
- `<form>` : 2 (formulaires de recherche)

#### 3. Vulnerabilites de securite trouvees

**Critique : identifiants d'administration WordPress exposes**
- Emplacement : Ligne 127 dans l'objet JavaScript `twdGlobal`
- Donnees exposees :
  - URL du panneau d'administration WordPress
  - **Nonce d'authentification** pour l'API REST
  - URL du point d'acces de l'API REST
  - Format des permaliens

**Impact** : Le nonce permet l'authentification API sans identifiants. Meme s'il est renouvele a chaque session, l'exposer a tous les visiteurs du site constitue une faille de securite critique.

**Mots de passe en clair trouves** :
- Ligne 830 : `password=ohsuo6xae7Th`
- Lignes 1469-1471 : `Mot de Passe\nip6ooja6Eize`
- Lignes 6779, 6781 : `Login\naiv1Xaet4vee`
- Lignes 2554, 2557 : `va5eijih9OPe\nCREDential`
- Lignes 6889, 8691 : `temporary\neich7So5xo4a`

**Attributs JavaScript obfusques** :
- Lignes 2563-2564 : Configurations CSS/police encodees en Base64 dans les attributs `tdc_css` et `f_article_font_size`
- Lignes 3765, 3770-3772, 3784-3788 : Autres structures JSON encodees en Base64
- Toutes les donnees decodees sont des donnees de formatage inoffensives (JSON avec marges, tailles de police)

### Commandes shell utilisees

```bash noexec
# Type et encodage du fichier
file pixgame.html.prep
stat pixgame.html.prep

# Nombre de lignes (total et non vides)
wc -l pixgame.html.prep
cat pixgame.html.prep | grep -v '^\s*$' | wc -l

# Calculer la longueur de la plus longue ligne
cat pixgame.html.prep | grep -v '^\s*$' | awk '{ print length }' | \
  python -c "print(max([int(input()) for _ in range(14289)]))"

# Analyse de frequence des balises
cat pixgame.html.prep | grep -v '^\s*$' | sed 's/</ </g' | sed 's/>/> /g' | \
  tr ' ' '\n' | grep '^<[^!/]' | cut -b '2-' | sed 's/>//g' | \
  sort | uniq -c | sort -nr

# Recherche d'identifiants d'administration
grep "admin" pixgame.html.prep -n

# Recherche de chaines liees aux mots de passe
grep -i "password\|login\|credential" pixgame.html.prep -n

# Decodage du contenu obfusque en Base64
grep -o 'ey.*=' pixgame.html.prep | base64 -d
```

## Lecons retenues

1. **Exposition cote client** : ne jamais embarquer de jetons d'authentification (nonces, cles API) dans le JavaScript cote client
2. **Stockage des mots de passe** : les mots de passe en clair dans le HTML sont catastrophiques -- utiliser des systemes d'authentification adaptes
3. **Obfuscation =/= Securite** : l'encodage Base64 n'est pas du chiffrement ; il ne fournit aucune protection
4. **Analyse de la surface d'attaque** : les commandes shell permettent de cartographier rapidement la surface d'attaque (formulaires, scripts, ressources externes)
5. **Securite WordPress** : les installations WordPress par defaut exposent les chemins d'administration ; le durcissement est indispensable

## Fichiers

- `TP-Shell-1.pdf` - Description de l'enonce
- `prep.zip` - Fichiers de donnees pour l'analyse (archive de 19 Mo)
- `resultat-GONZALEZ.txt` - Rapport d'analyse complet (rendu original)
