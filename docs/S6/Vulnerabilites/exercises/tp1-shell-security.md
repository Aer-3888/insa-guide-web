---
title: "TP1 -- Shell for Security : Analyse de fichier"
sidebar_position: 1
---

# TP1 -- Shell for Security : Analyse de fichier

> Following teacher instructions from: S6/Vulnerabilites/data/moodle/tp/TP1/TP-Shell-1.pdf
> Fichier analyse : `pixgame.html.prep` (tire de `prep.zip`)

---

## Contexte du TP

Dans ce TP il s'agit de qualifier / decrire des donnees et d'evaluer leurs caracteristiques globales (frequences, structures, etc.) Il s'agit aussi de reperer des elements utiles en securite (ou plus globalement).

**Contraintes du TP :**
- Utiliser des commandes shell uniquement (pas de scripts Python sauf pour des calculs)
- Rechercher des termes litteraux plutot que des expressions (utiliser `fgrep` plutot que `grep` avec regex)
- Pas de fichiers binaires, que des formats textuels
- Collectionner ses commandes au fur et a mesure pour en faire un script reutilisable

---

## Etape 1 : Prendre au hasard un premier fichier de donnees *.prep

### Decompression et selection aleatoire

**Answer:**

```bash
# Decompresser l'archive
unzip prep.zip -d prep/

# Lister les fichiers disponibles
ls prep/

# Selectionner un fichier aleatoire
ls prep/ | shuf -n 1
# --> pixgame.html.prep
```

Le fichier selectionne est `pixgame.html.prep`.

---

## Etape 2 : Evaluer le contenu

### Le nom du fichier est-il parlant ? Si oui quelle langue ?

**Answer:**

Le nom `pixgame.html.prep` est parlant :
- `pixgame` suggere un site web lie au jeu video (pixels + game)
- `.html` indique un fichier au format HTML (page web)
- `.prep` est l'extension ajoutee pour le TP

La langue est le francais (le site `pixgame.fr` est enregistre aupres de la FRNIC, avec un registrar ayant indique "Ano Nymous" comme contact).

### L'extension du fichier suggere-t-elle un format ?

**Answer:**

Oui, l'extension `.html` indique un document HTML (page web). Confirmation avec `file` :

```bash
$ file pixgame.html.prep
pixgame.html.prep: HTML document, UTF-8 Unicode text, with very long lines
```

Le fichier est un document HTML encode en UTF-8 avec des lignes tres longues.

### Evaluer la taille et le nombre d'items dans le fichier

**Answer:**

```bash
# Taille du fichier
$ stat pixgame.html.prep
  File: pixgame.html.prep
  Size: 656028    Blocks: 1288   IO Block: 4096   regular file
  Modify: 2021-03-15 22:32:00

# Nombre de lignes
$ wc -l pixgame.html.prep
16368 pixgame.html.prep

# Nombre de caracteres
$ wc -c pixgame.html.prep
656028 pixgame.html.prep
```

Le fichier fait 656 028 octets et contient 16 368 lignes. La derniere modification date du 15/03/2021.

### Visualiser des portions du fichier

**Answer:**

```bash
# Debut du fichier
$ head -20 pixgame.html.prep
<!DOCTYPE html>
<html lang="fr">
<head>
...

# Fin du fichier
$ tail -20 pixgame.html.prep
</html>
```

### Penser une commande permettant de visualiser quelques lignes au milieu du fichier

**Answer:**

```bash
# Afficher 10 lignes autour de la ligne 8000 (milieu du fichier)
$ sed -n '7995,8005p' pixgame.html.prep

# Ou avec head + tail :
$ head -8005 pixgame.html.prep | tail -10
```

**Security explanation:**

L'evaluation du contenu est la premiere etape de toute analyse de securite. Le type de fichier determine les techniques d'analyse a appliquer. Un fichier HTML de site WordPress necessite une attention particuliere aux patterns d'administration, aux scripts JavaScript embarques, et aux credentials potentiellement exposes.

---

## Etape 3 : Calculer des metriques

### Calculer les frequences des caracteres

**Answer:**

```bash
# Frequence de tous les caracteres (un par ligne, tries par occurrence)
$ grep -o . pixgame.html.prep | sort | uniq -c | sort -nr | head -20
```

On peut aussi utiliser `tr` pour decomposer en caracteres individuels :

```bash
$ cat pixgame.html.prep | tr -c '' '\n' | sort | uniq -c | sort -nr | head -20
```

Les caracteres les plus frequents seront probablement les espaces, les lettres minuscules courantes, et les caracteres HTML (`<`, `>`, `/`).

### Rechercher le/les principaux separateurs

**Answer:**

```bash
# Compter les occurrences de chaque separateur courant
$ fgrep -o ' ' pixgame.html.prep | wc -l    # espaces
$ fgrep -o '	' pixgame.html.prep | wc -l   # tabulations
$ wc -l pixgame.html.prep                    # sauts de ligne
$ fgrep -o ',' pixgame.html.prep | wc -l    # virgules
$ fgrep -o ':' pixgame.html.prep | wc -l    # deux-points
$ fgrep -o ';' pixgame.html.prep | wc -l    # points-virgules
```

Pour un fichier HTML, les principaux separateurs structurels sont les sauts de ligne et les espaces. Les `<` et `>` delimitent les balises.

### Decrire brievement la structure des donnees

**Answer:**

Le fichier est une page HTML complete d'un site WordPress francophone (pixgame.fr). Sa structure est :
1. En-tete HTML (`<head>`) avec metadonnees, liens CSS, et scripts
2. Corps HTML (`<body>`) avec la structure du site (navigation, contenu, footer)
3. Blocs JavaScript intercales (configuration WordPress, scripts tiers)
4. CSS auto-genere (styles inline)

Le site utilise des assets externes comme la font "Montserrat" chargee via le CDN de Google APIs.

### Calculer les tailles des principaux elements structurants (lignes, termes, ou autres). Indiquez les tailles typiques (ou moyenne, normale, maxi, esperee) d'une ligne, d'un item, etc.

**Answer:**

```bash
# Nombre de lignes non vides
$ grep -v '^\s*$' pixgame.html.prep | wc -l
14289

# Taille de la plus longue ligne
$ wc -L pixgame.html.prep
32083 pixgame.html.prep

# Identifier la ligne la plus longue (numero et longueur)
$ awk '{ print length, NR }' pixgame.html.prep | sort -rn | head -1
32083 9825

# Taille moyenne des lignes non vides
$ grep -v '^\s*$' pixgame.html.prep | awk '{ total += length } END { print total/NR }'
44.02

# Taille minimale d'une ligne non vide
$ grep -v '^\s*$' pixgame.html.prep | awk '{ print length }' | sort -n | head -1
1

# Examiner la ligne anormalement longue
$ sed -n '9825p' pixgame.html.prep | sed 's/x//g' | wc -c
1
# --> La ligne 9825 ne contient QUE des 'x' (32083 fois)
```

| Metrique | Valeur |
|----------|--------|
| Lignes totales | 16 368 |
| Lignes non vides | 14 289 |
| Taille du fichier | 656 028 octets |
| Plus longue ligne | 32 083 caracteres (ligne 9825, remplie de 'x') |
| Taille moyenne d'une ligne | ~44 caracteres |
| Plus petite ligne non vide | 1 caractere |

### Calculer la frequence des termes

**Answer:**

```bash
# Frequence des termes (mots separes par des espaces)
$ tr ' ' '\n' < pixgame.html.prep | sort | uniq -c | sort -nr | head -20
```

Pour l'analyse HTML, il est plus utile de calculer la frequence des balises :

```bash
# Pipeline complet d'extraction et comptage des balises HTML
$ grep -v '^\s*$' pixgame.html.prep \
  | sed 's/</ </g' \
  | sed 's/>/> /g' \
  | tr ' ' '\n' \
  | grep '^<[^!/]' \
  | cut -b '2-' \
  | sed 's/>//g' \
  | sort | uniq -c | sort -nr
```

**Decomposition du pipeline :**
1. `grep -v '^\s*$'` : supprime les lignes vides
2. `sed 's/</ </g'` : ajoute un espace avant chaque `<` pour separer les balises
3. `sed 's/>/> /g'` : ajoute un espace apres chaque `>` pour separer les balises
4. `tr ' ' '\n'` : un element par ligne
5. `grep '^<[^!/]'` : garde les balises ouvrantes (exclut commentaires `<!` et fermantes `</`)
6. `cut -b '2-' | sed 's/>//g'` : extrait le nom de la balise
7. `sort | uniq -c | sort -nr` : trie par frequence decroissante

**Resultat :**

| Occurrences | Balise | Signification securite |
|------------|--------|----------------------|
| 794 | `div` | Regions de contenu |
| 355 | `span` | Texte en ligne |
| 310 | `a` | Liens (surface d'attaque externe) |
| 80 | `time` | Dates |
| 67 | `style` | CSS |
| 63 | `script` | **Code executable -- interet majeur** |
| 25 | `i` | Texte en italique |
| 20 | `meta` | Metadonnees |
| 8 | `input` | **Champs de saisie -- point d'entree** |
| 4 | `img` | Images |
| 2 | `form` | **Formulaires -- potentiel CSRF/injection** |

**Note :** ce decoupage produit du bruit parasite (des comparaisons JavaScript comme `a<b` peuvent etre interpretees comme des balises). On filtre manuellement les faux positifs.

**Security explanation:**

L'analyse des balises HTML cartographie la **surface d'attaque** du site :
- Les 63 `<script>` representent du code executable potentiellement vulnerable
- Les 8 `<input>` et 2 `<form>` sont des points d'entree pour les injections (XSS, SQL)
- Les 310 `<a>` representent des liens vers des ressources externes potentiellement compromises

---

## Etape 4 : Rechercher des elements

### Chercher des termes comme password ou login etc. Chercher dans les quelques lignes qui precedent et qui suivent.

**Answer:**

```bash
# Recherche de termes lies aux credentials (insensible a la casse, avec contexte)
$ fgrep -in 'password' pixgame.html.prep
830:password=ohsuo6xae7Th

$ fgrep -in -C 2 'login' pixgame.html.prep
6779:Login
6781:aiv1Xaet4vee

$ fgrep -in -C 2 'credential' pixgame.html.prep
2554:va5eijih9OPe
2557:CREDential

$ fgrep -in -C 2 'mot de passe' pixgame.html.prep
1469:Mot de Passe
1471:ip6ooja6Eize

$ fgrep -in -C 2 'temporary' pixgame.html.prep
6889:temporary
8691:eich7So5xo4a
```

**Mots de passe trouves en clair :**

| Ligne(s) | Contexte | Credential |
|----------|---------|------------|
| 830 | Parametre explicite | `password=ohsuo6xae7Th` |
| 1469-1471 | Texte libre en francais | `Mot de Passe` / `ip6ooja6Eize` |
| 6779, 6781 | Couple login/password | `Login` / `aiv1Xaet4vee` |
| 2554, 2557 | Couple credential | `va5eijih9OPe` / `CREDential` |
| 6889, 8691 | Couple temporaire | `temporary` / `eich7So5xo4a` |

### Recherche de l'interface admin WordPress

```bash
$ fgrep -n 'admin' pixgame.html.prep | head -20
```

Vers la ligne 127, la definition de la structure `twdGlobal` de l'objet JavaScript `window` contient :
- L'URL vers le panel administrateur WordPress (`/wp-admin/admin-ajax.php`)
- Le **nonce** utilise pour l'authentification aupres de l'API REST
- L'URL de l'API REST du backend WordPress (`/wp-json/`)
- Un format de permalink vers les posts du site

```bash
# Extraire le contexte autour de la ligne 127
$ sed -n '125,130p' pixgame.html.prep
```

**Impact critique :** la presence du nonce est *gravissime*. Un nonce est par definition utilise dans une seule session de protocole et aleatoire. Meme si ce dernier est remplace a chaque rafraichissement de page, il est tres inquietant qu'un simple visiteur du site puisse avoir acces aussi simplement a une valeur censee rester privee. Cela permet potentiellement des appels API authentifies.

### Reperer des possibles mots de passe parmi les termes de frequence 3, 4 ou 5

**Answer:**

```bash
# Lister les termes qui apparaissent exactement 3, 4 ou 5 fois
$ tr ' ' '\n' < pixgame.html.prep | sort | uniq -c | sort -nr \
  | awk '$1 >= 3 && $1 <= 5 { print }'
```

Les termes de faible frequence (3 a 5 occurrences) sont des candidats interessants pour des mots de passe, car un mot de passe place dans le fichier est rarement repete de nombreuses fois.

### Rechercher des elements manifestement atypiques dans les donnees (des "monstres")

**Answer:**

```bash
# Lignes anormalement longues (plus de 1000 caracteres)
$ awk 'length > 1000 { print NR, length }' pixgame.html.prep

# Zones vides (sequences de lignes vides)
$ grep -n '^\s*$' pixgame.html.prep | head -20
```

**Monstre identifie :** la ligne 9825 (32 083 caracteres) ne contient que des 'x'. C'est un element completement atypique dans une page HTML. Apres investigation :

```bash
$ sed -n '9825p' pixgame.html.prep | sed 's/x//g' | wc -c
1
```

La ligne ne contient rien d'autre que des 'x' -- aucun contenu utile. C'est peut-etre un artefact de l'extraction ou un padding delibere.

### Reflechir aux autres elements interessant a rechercher : url, nombres, etc.

**Answer:**

```bash
# Extraire les URLs
$ fgrep -o 'http' pixgame.html.prep | wc -l

# Garder uniquement les nombres (supprimer le reste)
$ tr -dc '0-9\n' < pixgame.html.prep | grep -v '^\s*$' | head -20

# Rechercher des emails
$ fgrep -i '@' pixgame.html.prep | head -10

# Rechercher des chemins de fichiers
$ fgrep -i 'wp-admin' pixgame.html.prep | head -10
$ fgrep -i 'wp-content' pixgame.html.prep | head -10
```

### Recherche de donnees obfusquees (attributs Base64)

```bash
# Recherche de chaines Base64 (commencent souvent par ey pour du JSON encode)
$ grep -o 'ey[A-Za-z0-9+/=]*' pixgame.html.prep | head -5

# Decoder un echantillon
$ echo "eyJhbGwiOnsibWFyZ2luLXRvcCI6IjI0In0=" | base64 -d
{"all":{"margin-top":"24"}}

# Decoder toutes les chaines Base64 trouvees
$ grep -o 'ey.*=' pixgame.html.prep | base64 -d
```

**Resultats du decodage :**

| Lignes | Contenu decode | Dangereux ? |
|--------|---------------|------------|
| 2563 | `tdc_css` : JSON avec marges et tailles CSS | Non |
| 2564 | `f_article_font_size` : `{"portrait":"13"}` | Non |
| 3765, 3770-3772 | Configurations CSS supplementaires | Non |
| 3784-3788 | Styles de formatage | Non |

Toutes les chaines Base64 decodees sont des configurations CSS inoffensives.

**Security explanation:**

L'obfuscation n'est PAS du chiffrement. Base64 est un encodage reversible en une seule commande. Il ne fournit aucune protection de confidentialite. Un attaquant peut decoder n'importe quelle chaine Base64 instantanement. Si des donnees sensibles etaient encodees en Base64, elles seraient tout aussi exposees qu'en clair.

---

## Etape 5 : Examen des formulaires

### Analyse des points d'entree

**Answer:**

```bash
# Trouver les formulaires
$ fgrep -n '<form' pixgame.html.prep
2399:<form class="search-form" ...
2437:<form class="search-form" ...
```

Les deux formulaires font partie du systeme de recherche de contenu du site (lignes 2399 et 2437). Ce sont des points d'entree potentiels pour des injections (XSS reflete, injection SQL si la recherche est mal protegee).

### Examen des scripts externes

```bash
# Scripts charges depuis des domaines externes
$ grep -o 'src="http[^"]*"' pixgame.html.prep | sort -u | head -20
```

Identifier les CDN utilises (Google APIs, etc.) et les scripts tiers potentiellement compromis (attaque de type supply chain).

**Security explanation:**

Chaque formulaire et chaque script externe represente un point d'entree potentiel pour un attaquant. Les formulaires de recherche sont particulierement sensibles aux XSS reflete si la saisie utilisateur est renvoyee dans la page sans echappement. Les scripts charges depuis des CDN tiers introduisent un risque de supply chain : si le CDN est compromis, tous les sites qui l'utilisent le sont aussi.

---

## Pour aller au-dela

### Rechercher des termes ayant les proprietes suivantes : le terme apparait le plus souvent possible dans votre fichier et le moins souvent possible dans tous les autres

**Answer:**

```bash
# Etape 1 : calculer la frequence des termes dans notre fichier
$ tr ' ' '\n' < pixgame.html.prep | sort | uniq -c | sort -nr > freq_notre_fichier.txt

# Etape 2 : calculer la frequence des termes dans TOUS les fichiers
$ for f in prep/*.prep; do tr ' ' '\n' < "$f"; done | sort | uniq -c | sort -nr > freq_tous.txt

# Etape 3 : trouver les termes specifiques a notre fichier
# (frequents chez nous, rares ailleurs)
$ join -1 2 -2 2 <(sort -k2 freq_notre_fichier.txt) <(sort -k2 freq_tous.txt) \
  | awk '{ ratio = $2 / $3; if (ratio > 0.5 && $2 > 3) print ratio, $2, $3, $1 }' \
  | sort -rn | head -20
```

L'idee est de trouver des termes qui sont a la fois tres frequents dans notre fichier et quasiment absents des autres. Ces termes sont des "empreintes digitales" du fichier et permettent de l'identifier via un moteur de recherche en une seule requete (par exemple le nom de domaine `pixgame.fr`).

### Reflechir a un script qui recherche automatiquement de tels termes dans un corpus de donnees. En quoi le bash et les commandes de base sont bien adaptes a ce type de recherches ?

**Answer:**

Bash est bien adapte car :
1. Les pipes (`|`) permettent de chainer des transformations sans fichiers intermediaires
2. `sort | uniq -c` est optimise pour le comptage de frequences sur de gros volumes
3. Les outils de base (`tr`, `sort`, `uniq`, `grep`) traitent les flux de texte ligne par ligne sans charger tout en memoire
4. La parallelisation est naturelle avec `xargs -P` ou `&` pour traiter plusieurs fichiers simultanement

### Certaines commandes utilisees notamment pour calculer des frequences peuvent etre tres lentes (sur des gros fichiers). Penser des moyens d'accelerer ca.

**Answer:**

Moyens d'acceleration :
1. **Utiliser `LC_ALL=C`** pour eviter les comparaisons Unicode dans `sort` (gain de 2-10x)
2. **Echantillonner** avec `shuf -n 1000` au lieu de traiter tout le fichier
3. **Utiliser `awk` au lieu de `sort | uniq -c`** : `awk '{ count[$0]++ } END { for (k in count) print count[k], k }'` est plus rapide car il ne trie pas
4. **Paralleliser** avec `split` + `xargs -P` pour decouper le fichier et traiter en parallele
5. **Filtrer en amont** : utiliser `head -10000` ou `grep` pour reduire le volume avant les operations couteuses

---

## Synthese des vulnerabilites trouvees

| # | Vulnerabilite | Severite | Lignes | Defense recommandee |
|---|--------------|----------|--------|---------------------|
| 1 | Nonce API REST expose dans JavaScript client | CRITICAL | 127 | Ne jamais exposer de nonces/tokens dans le JS client ; utiliser des sessions server-side |
| 2 | Mots de passe en clair dans le HTML | CRITICAL | 830, 1469-1471, 6779-6781, 2554-2557, 6889-8691 | Supprimer immediatement ; changer tous les mots de passe compromis ; ne jamais stocker de credentials en clair |
| 3 | URL admin WordPress exposee | HIGH | 127 | Restreindre `/wp-admin/` par IP ou VPN ; utiliser un plugin de securite WordPress |
| 4 | Attributs obfusques en Base64 (pas de donnee sensible) | INFO | 2563-3788 | N/A -- mais rappeler que Base64 n'est pas du chiffrement |
| 5 | Ligne anormalement longue de 32k 'x' | INFO | 9825 | Investiguer l'origine ; anomalie a comprendre |

---

## Commandes shell les plus utiles (a retenir)

```bash
# Pipeline de frequences (Top-N) -- pattern fondamental
sort | uniq -c | sort -nr | head -N

# Recherche de mots-cles sensibles (litterale, insensible a la casse, avec contexte)
fgrep -in -C 3 "password" fichier

# Plus longue ligne d'un fichier
wc -L fichier

# Lignes de plus de N caracteres (detecter les monstres)
awk 'length > 1000 { print NR, length }' fichier

# Decodage Base64
echo "chaine_encodee" | base64 -d

# Echantillon aleatoire de N lignes
shuf fichier -n 32

# Enregistrer toutes les commandes d'une session
script -a session.log
```

---

## Lecons cles du TP

1. **Exposition client-side** : ne jamais embarquer de tokens d'authentification (nonces, API keys) dans le JavaScript cote client -- ils sont visibles par tous les visiteurs
2. **Stockage des mots de passe** : les mots de passe en clair dans le HTML sont catastrophiques -- une seule visite du site suffit pour les collecter
3. **Obfuscation =/= securite** : Base64 est un encodage reversible, pas du chiffrement -- il ne fournit aucune protection
4. **Analyse de surface avec le shell** : les commandes shell permettent de cartographier rapidement la surface d'attaque (formulaires, scripts, liens externes)
5. **WordPress** : l'installation par defaut expose des chemins admin (`/wp-admin/`, `/wp-json/`) -- le hardening est indispensable
6. **Pipeline de securite** : la combinaison `fgrep | sed | sort | uniq -c | sort -nr` est l'outil fondamental pour l'analyse de securite en shell
