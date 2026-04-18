---
title: "TP3 - Arbres de decision et boosting avec BonzaiBoost"
sidebar_position: 3
---

# TP3 - Arbres de decision et boosting avec BonzaiBoost

> D'apres les consignes de l'enseignant : `data/moodle/tp/tp3_boosting/README.md` et `data/moodle/tp/tp3_boosting/TP3_but_4.pdf`

---

## Jeu de donnees : Adult Income (Recensement)

**Probleme :** Predire si une personne gagne plus de 50 000 $/an a partir de donnees de recensement.

- `adult.data` : Donnees d'entrainement (32 561 enregistrements)
- `adult.test` : Donnees de test (16 281 enregistrements)
- `adult.names` : Description du jeu de donnees et definitions des attributs

**Attributs (14 features) :**

| Feature | Type | Valeurs |
|---------|------|---------|
| age | Continu | Age de la personne |
| workclass | Nominal | Private, Self-emp-not-inc, Federal-gov, etc. |
| fnlwgt | Ignore | Poids de recensement (non utilise) |
| education | Nominal | Bachelors, Some-college, HS-grad, etc. |
| education-num | Continu | Nombre d'annees d'etudes |
| marital-status | Nominal | Married-civ-spouse, Divorced, Never-married, etc. |
| occupation | Nominal | Tech-support, Exec-managerial, Prof-specialty, etc. |
| relationship | Nominal | Wife, Own-child, Husband, etc. |
| race | Nominal | White, Asian-Pac-Islander, Black, etc. |
| sex | Nominal | Female, Male |
| capital-gain | Ignore | (non utilise) |
| capital-loss | Ignore | (non utilise) |
| hours-per-week | Continu | Heures travaillees par semaine |
| native-country | Nominal | United-States, England, etc. (41 pays) |

**Classes cibles :**
- `sup50K` (~24%) : Revenu > 50 000 $/an
- `infeq50K` (~76%) : Revenu <= 50 000 $/an

---

## Exercice 1 : Reference naive

### Quelle est la precision d'entrainement/test du classifieur naif ?

Le classifieur naif predit la classe majoritaire pour toutes les instances.

**Reponse :**

```bash noexec
# Aller dans le repertoire du jeu de donnees
cd adult/

# Generer le classifieur naif (profondeur 0 = pas de question = classe majoritaire)
../bonzaiboost -S adult -d 0

# Evaluer sur les donnees d'entrainement
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluer sur les donnees de test
../bonzaiboost -S adult -C < adult.test > /dev/null
```

**Sortie attendue :**
- Precision d'entrainement : ~75.9% (= proportion de `infeq50K` dans adult.data)
- Precision de test : ~76.1% (proportion similaire dans adult.test)

### Pourquoi cela peut-il etre trompeur ?

**Reponse :**

Le classifieur naif donne ~76% de precision simplement en predisant `infeq50K` (gagne <= 50 000 $) pour tout le monde. C'est trompeur car :
- Il classe correctement 100% de la classe majoritaire mais 0% de la classe minoritaire (`sup50K`).
- Tout modele qui ne depasse pas significativement 76% est essentiellement inutile.
- Avec des donnees desequilibrees (76% vs 24%), la precision seule est trompeuse. Un modele a 78% ne s'ameliore que de 2 points par rapport a la prediction la plus triviale possible.

**Explication :** La reference etablit le seuil de performance minimale. Un modele utile devrait viser bien au-dessus de 82-85% pour justifier la complexite ajoutee.

---

## Exercice 2 : Arbre de decision manuel (4 feuilles)

### Concevoir un arbre binaire a 4 feuilles par intuition, puis l'evaluer.

**Reponse :**

Le fichier `arbre.txt` montre le format des regles manuelles :

```
racine=race White
no=sex Male yes=sup50K no=infeq50K
yes=native-country United-States yes=sup50K no=infeq50K
```

**Explication de la structure :**
- Ligne 1 : La racine demande "race = White ?"
- Ligne 2 : Branche "no" (pas White) -> demande "sex = Male ?" -> si oui : `sup50K`, si non : `infeq50K`
- Ligne 3 : Branche "yes" (White) -> demande "native-country = United-States ?" -> si oui : `sup50K`, si non : `infeq50K`

### Procedure pour construire et evaluer votre propre arbre

```bash noexec
# 1. Creer votre fichier de regles (ex : mon_arbre.txt)
#    Exemple : essayer education ou marital-status comme racine
#    racine=marital-status Married-civ-spouse
#    no=education Bachelors yes=sup50K no=infeq50K
#    yes=hours-per-week 40 yes=sup50K no=infeq50K

# 2. Convertir au format BonzaiBoost
perl ../rules2tree.pl adult mon_arbre.txt

# 3. Evaluer sur les donnees d'entrainement
../bonzaiboost -S adult -C < adult.data > /dev/null

# 4. Evaluer sur les donnees de test
../bonzaiboost -S adult -C < adult.test > /dev/null
```

### Question 1 : Votre arbre manuel surpasse-t-il le classifieur naif ?

**Reponse :** Probablement pas, ou a peine. L'intuition humaine est rarement meilleure que les statistiques des donnees pour choisir les bons splits et les bonnes predictions aux feuilles. L'arbre exemple dans `arbre.txt` utilise la race et la nationalite, qui sont de faibles predicteurs de revenu compares au niveau d'etudes ou au statut marital.

### Question 2 : Si vous gardez les regles mais changez les decisions des feuilles pour correspondre aux statistiques d'entrainement, les resultats s'ameliorent-ils ?

**Reponse :** Oui, significativement. Les splits (questions posees) sont moins importants que les predictions des feuilles. Meme avec des splits sous-optimaux, si les feuilles predisent la classe majoritaire parmi les exemples d'entrainement qui les atteignent, le resultat s'ameliore. Cela demontre que la precision d'un arbre de decision depend fortement de l'affectation correcte des classes aux feuilles.

---

## Exercice 3 : Construction automatique de l'arbre

### 3a : Arbre a profondeur limitee (d=2, 4 feuilles)

```bash noexec
# Construire un arbre de profondeur 2 (4 feuilles maximum)
../bonzaiboost -S adult -d 2

# Evaluer sur les donnees d'entrainement
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluer sur les donnees de test
../bonzaiboost -S adult -C < adult.test > /dev/null

# Visualiser l'arbre
dot -Tpng adult.tree.dot > adult_d2.png
```

**Sortie attendue :**
- Precision d'entrainement : ~80-82%
- Precision de test : ~79-81%
- Ecart train/test : ~1-2 points (peu de sur-apprentissage)

### L'arbre automatique surpasse-t-il votre arbre manuel ? Interpretez-le : quelles features a-t-il choisies ? Pourquoi ?

**Reponse :**

L'arbre automatique de profondeur 2 est significativement meilleur que la reference naive (+4-6 points) et surpasse presque certainement tout arbre manuel. Les features automatiquement choisies sont typiquement :

- **marital-status** (etre marie augmente significativement la probabilite de haut revenu)
- **education-num** (plus d'annees d'etudes = revenu plus eleve)
- **age** (les 35-55 ans gagnent le plus)

Ces features sont choisies car elles maximisent le gain d'information. Le faible ecart train/test (~1-2 points) indique un **sous-apprentissage modere** : l'arbre est trop simple pour capturer toutes les regularites.

### 3b : Critere d'arret MDLPC

MDLPC (Minimum Description Length Principle for Classification) determine automatiquement la taille optimale de l'arbre sur la base de la theorie de l'information. Il arrete la croissance de l'arbre quand l'ajout d'un nouveau noeud n'est pas justifie par le gain d'information par rapport a la complexite ajoutee.

```bash noexec
# Construire l'arbre avec MDLPC
../bonzaiboost -S adult -mdlpc

# Evaluer sur les donnees d'entrainement
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluer sur les donnees de test
../bonzaiboost -S adult -C < adult.test > /dev/null

# Visualiser
dot -Tpng adult.tree.dot > adult_mdlpc.png
```

**Sortie attendue :**
- Precision d'entrainement : ~83-85%
- Precision de test : ~82-84%
- Ecart train/test : ~1-2 points

### Comment MDLPC se compare-t-il a l'arbre a profondeur limitee ? Quel est l'ecart de sur-apprentissage ?

**Reponse :**

MDLPC produit un arbre plus profond que d=2 mais pas aussi profond que Tmax. La performance est meilleure que l'arbre a profondeur limitee (+2-3 points). L'ecart train/test reste faible, indiquant un bon **compromis biais-variance**. MDLPC est un critere d'arret principiel et automatique qui evite a la fois le sous-apprentissage et le sur-apprentissage.

### 3c : Arbre complet (sans critere d'arret)

```bash noexec
# Construire l'arbre complet (mode verbeux, sans arret)
../bonzaiboost -S adult -v

# Evaluer sur les donnees d'entrainement
../bonzaiboost -S adult -C < adult.data > /dev/null

# Evaluer sur les donnees de test
../bonzaiboost -S adult -C < adult.test > /dev/null
```

**Sortie attendue :**
- Precision d'entrainement : **~100%**
- Precision de test : ~82-84%
- Ecart train/test : **~16-18 points** (sur-apprentissage severe)

### Comment les precisions d'entrainement vs test se comparent-elles ? Quel phenomene se produit ?

**Reponse :**

L'arbre complet atteint une precision parfaite en entrainement (100%) en memorisant chaque exemple d'entrainement. Cependant, la precision de test (~82-84%) n'est pas meilleure que celle de l'arbre MDLPC. C'est la demonstration classique du **sur-apprentissage** : un modele trop complexe qui apprend le bruit des donnees d'entrainement au lieu de regularites generalisables. L'arbre a des centaines voire des milliers de noeuds, ce qui le rend aussi completement ininterpretable.

### Resume de l'exercice 3

| Critere d'arret | Prec. train | Prec. test | Ecart | Diagnostic |
|-----------------|-------------|------------|-------|-----------|
| Profondeur 2 (4 feuilles) | ~80-82% | ~79-81% | ~1-2% | Sous-apprentissage modere |
| MDLPC (automatique) | ~83-85% | ~82-84% | ~1-2% | **Bon compromis** |
| Aucun (arbre complet) | ~100% | ~82-84% | ~16-18% | **Sur-apprentissage severe** |

**Observation cle :** La precision de test de l'arbre complet N'EST PAS meilleure que celle de MDLPC malgre 100% en entrainement. Le sur-apprentissage n'ameliore pas la generalisation.

---

## Exercice 4 : AdaBoost

### Question 5 : Comment les resultats du boosting se comparent-ils aux arbres individuels ?

**Reponse :**

```bash noexec
# Entrainer AdaBoost avec 100 iterations de stumps
../bonzaiboost -S adult -boost adamh -n 100

# Evaluer sur les donnees d'entrainement
../bonzaiboost -S adult -boost adamh -C < adult.data > /dev/null

# Evaluer sur les donnees de test
../bonzaiboost -S adult -boost adamh -C < adult.test > /dev/null
```

**Sortie attendue :**
- Precision d'entrainement : ~87-90%
- Precision de test : **~85-87%**
- Ecart train/test : ~2-3 points

AdaBoost (85-87% test) surpasse significativement :
- Le classifieur naif (+10-11 points)
- L'arbre de profondeur 2 (+5-7 points)
- L'arbre MDLPC (+2-4 points)
- L'arbre complet (+2-4 points en test, malgre 100% en train pour l'arbre complet)

**Explication :** Combiner 100 stumps (classifieurs tres faibles, a peine meilleurs que le hasard) produit un classifieur plus puissant que n'importe quel arbre individuel complexe. C'est le principe fondamental du boosting : combiner des apprenants faibles produit un apprenant fort.

### Question 6 : Analyse du taux d'erreur -- Analysez les courbes d'erreur d'entrainement/test

```bash noexec
# Generer un rapport HTML detaille avec les resultats iteration par iteration
../bonzaiboost -S adult -boost adamh -n 100 --info > adult.boost.log.html

# Ouvrir dans un navigateur pour voir les courbes
```

**Reponse :**

| Propriete de la courbe | Observation |
|----------------------|-------------|
| Erreur d'entrainement | Diminue de facon monotone (ou quasi-monotone) avec les iterations |
| Erreur de test | Diminue rapidement (iterations 1-20), puis se stabilise ou diminue lentement |
| Sur-apprentissage | Leger : l'ecart train/test augmente avec les iterations mais reste modere |
| Convergence | L'essentiel du gain vient des 20-50 premieres iterations |
| Nombre optimal d'iterations | ~50-100 (au-dela, gains marginaux) |

**Explication :** Contrairement a un arbre individuel qui sur-apprend severement quand la complexite augmente, le boosting montre un sur-apprentissage beaucoup plus modere. L'erreur de test continue de diminuer (ou se stabiliser) meme apres que l'erreur d'entrainement atteint des valeurs tres basses. C'est une propriete remarquable d'AdaBoost, expliquee par l'augmentation progressive des marges de classification.

### Question 7 : Importance des features -- D'apres le modele de boosting, quelles features sont les plus discriminantes pour predire un revenu > 50K ?

**Reponse :**

Le rapport HTML indique quelles features sont utilisees par les stumps a chaque iteration.

| Feature | Importance |
|---------|-----------|
| marital-status | Tres elevee -- "Married-civ-spouse" est le meilleur predicteur |
| education / education-num | Elevee -- plus d'etudes = revenu plus eleve |
| age | Elevee -- les 35-55 ans gagnent le plus |
| hours-per-week | Moyenne -- travailler > 40h/semaine augmente la probabilite |
| occupation | Moyenne -- "Exec-managerial" et "Prof-specialty" associes a >50K |
| workclass | Faible a moyenne |
| relationship | Correlee avec marital-status |

**Explication :** Les features selectionnees par le boosting correspondent aux facteurs socio-economiques intuitifs. Le statut marital domine car etre marie (surtout "Married-civ-spouse") est un fort indicateur du niveau de revenu du menage et de la stabilite economique.

---

## Comparaison globale des modeles

| Modele | Prec. train | Prec. test | Ecart | Complexite |
|--------|-------------|------------|-------|-----------|
| Naif (majoritaire) | ~76% | ~76% | 0% | Aucune |
| Arbre manuel (4 feuilles) | Variable | Variable | Variable | Tres faible |
| Arbre auto d=2 | ~80-82% | ~79-81% | ~1-2% | Faible |
| Arbre MDLPC | ~83-85% | ~82-84% | ~1-2% | Moyenne |
| Arbre complet | ~100% | ~82-84% | ~16-18% | Tres elevee |
| **AdaBoost (n=100)** | ~87-90% | **~85-87%** | ~2-3% | Elevee (100 stumps) |

**Enseignements cles :**

1. **Toujours etablir une reference.** Un modele a 78% sur un jeu de donnees avec 76% de classe majoritaire n'apporte quasiment rien.
2. **Sur-apprentissage = train >> test.** L'arbre complet a 100% en train mais ~83% en test. MDLPC a ~84% en train et ~83% en test : meilleure generalisation avec un modele bien plus simple.
3. **MDLPC** est un bon critere d'arret automatique base sur le principe de longueur de description minimale.
4. **Le boosting surpasse les arbres individuels.** 100 stumps combines battent n'importe quel arbre individuel complexe. Le boosting reduit le biais (sous-apprentissage) tout en controlant la variance (sur-apprentissage).
5. **Rendements decroissants.** Passer de 1 a 20 stumps apporte beaucoup ; passer de 50 a 100 apporte peu.

---

## Formules d'AdaBoost (reference pour l'examen)

### Poids du classifieur faible t

```
alpha_t = (1/2) * ln((1 - epsilon_t) / epsilon_t)
```

- epsilon_t = erreur ponderee du classifieur faible t (entre 0 et 0.5 pour un classifieur utile)
- Si epsilon_t = 0.5 (pas mieux que le hasard), alpha_t = 0 (aucune contribution)
- Si epsilon_t est proche de 0, alpha_t est grand (classifieur tres fiable)

### Mise a jour des poids des exemples

```
w_i^(t+1) = w_i^(t) * exp(-alpha_t * y_i * h_t(x_i)) / Z_t
```

- y_i = vraie classe de l'exemple i (+1 ou -1)
- h_t(x_i) = prediction du classifieur faible t pour l'exemple i (+1 ou -1)
- Si prediction correcte (y_i * h_t(x_i) > 0) : le poids diminue
- Si prediction incorrecte (y_i * h_t(x_i) < 0) : le poids augmente
- Z_t = facteur de normalisation

### Prediction finale (vote pondere)

```
H(x) = signe(sum_{t=1}^{T} alpha_t * h_t(x))
```

Sommer les votes ponderes de tous les T classifieurs faibles. Le signe de la somme determine la classe predite.
