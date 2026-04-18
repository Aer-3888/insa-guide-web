---
title: "TP2 : Loi des grands nombres et theoreme central limite"
sidebar_position: 2
---

# TP2 : Loi des grands nombres et theoreme central limite

## Presentation
Ce TP explore deux theoremes fondamentaux en theorie des probabilites : la loi des grands nombres (LGN) et le theoreme central limite (TCL). Les etudiants analysent des donnees experimentales reelles (mesures de la vitesse de la lumiere par Michelson) et simulent des distributions de probabilite discretes.

## Objectifs pedagogiques
- Appliquer la loi des grands nombres a des donnees reelles
- Comprendre et verifier le theoreme central limite
- Travailler avec le jeu de donnees de la bibliotheque MASS
- Utiliser `tapply()` pour les operations par groupe
- Comparer distributions theoriques et empiriques
- Simuler des processus binomiaux et leur approximation normale

## Concepts cles

### 1. Loi des grands nombres (LGN)
La moyenne empirique de variables aleatoires independantes et identiquement distribuees (i.i.d.) converge vers la moyenne theorique lorsque la taille de l'echantillon augmente.

**Enonce mathematique** :
Pour X_1, X_2, ..., X_n ~ i.i.d. avec E(X_i) = mu :

```
X_bar_n = (X_1 + X_2 + ... + X_n)/n -> mu lorsque n -> infini
```

**Interpretation pratique** :
- Petits echantillons : la moyenne empirique varie considerablement
- Grands echantillons : la moyenne empirique se stabilise pres de la moyenne theorique
- La convergence n'est PAS monotone (elle fluctue mais la tendance est claire)

### 2. Theoreme central limite (TCL)
La distribution des moyennes d'echantillons tend vers une distribution normale lorsque la taille de l'echantillon augmente, quelle que soit la distribution d'origine.

**Enonce mathematique** :
Pour X_1, X_2, ..., X_n ~ i.i.d. avec E(X_i) = mu et Var(X_i) = sigma^2 :

```
(X_bar_n - mu)/(sigma/sqrt(n)) -> N(0, 1) lorsque n -> infini
```

Ou de maniere equivalente : X_bar_n ~ N(mu, sigma^2/n) approximativement

**Interpretation pratique** :
- La somme ou la moyenne de nombreuses variables aleatoires est approximativement normale
- Fonctionne meme si la distribution d'origine n'est PAS normale
- Permet l'approximation normale pour de grands echantillons

### 3. Fonctions R cles

#### Chargement de donnees et resume
```r noexec
library(MASS)           # Charger le package avec les jeux de donnees
summary(data)           # Statistiques descriptives
head(data)              # Premieres lignes
mean(data$column)       # Moyenne d'une colonne
sd(data$column)         # Ecart-type
var(data$column)        # Variance
```

#### Operations par groupe
```r noexec
tapply(values, groups, function)
# Appliquer une fonction aux valeurs groupees
# Exemple : tapply(speed, experiment, mean)
#   -> calcule la vitesse moyenne par experience
```

#### Operations cumulees
```r noexec
cumsum(x)               # Somme cumulee
cumsum(x) / (1:length(x))  # Moyenne cumulee
```

#### Generation aleatoire
```r noexec
rbinom(n, size, prob)   # Generer des variables aleatoires binomiales
# n = nombre d'experiences
# size = nombre d'epreuves par experience
# prob = probabilite de succes
```

## Exercices

### Exercice 1 : Donnees de vitesse de la lumiere de Michelson

**Contexte** : En 1879, Albert Michelson a mesure la vitesse de la lumiere en 5 experiences de 20 mesures chacune (100 mesures au total).

**Taches** :
1. Charger et explorer le jeu de donnees `michelson` de la bibliotheque MASS
2. Calculer la moyenne et l'ecart-type
3. Visualiser la convergence avec la moyenne cumulee (loi des grands nombres)
4. Creer un histogramme avec superposition de la courbe normale theorique (theoreme central limite)
5. Grouper par experience et comparer les distributions

**Points cles** :
- La moyenne empirique converge vers une valeur stable
- La distribution de toutes les mesures semble normale
- Les moyennes des mesures groupees (n=20) ont une variance plus faible

### Exercice 2 : Simulation d'un QCM

**Scenario** :
- 10 questions, 4 choix chacune, 1 seule reponse correcte
- L'etudiant repond au hasard
- La reussite requiert >= 6 bonnes reponses

**Modele probabiliste** :
- Une question : Bernoulli(p = 0.25)
- Total de bonnes reponses : X ~ Binomiale(n = 10, p = 0.25)
- Evenement de reussite : P(X >= 6)

**Taches** :
1. Calculer la probabilite exacte : P(X >= 6) = 1 - P(X <= 5)
2. Simuler 5000 examens avec `rbinom()`
3. Verifier la loi des grands nombres pour le taux de reussite
4. Appliquer le TCL : approximer avec la loi normale
5. Comparer probabilites exactes et approchees

**Points cles** :
- Calcul exact : utiliser `pbinom()` pour la CDF binomiale
- Pour l'approximation discret -> continu, penser a la correction de continuite
- La qualite de l'approximation TCL depend de n et p
- Lorsque np < 5 ou n(1-p) < 5, l'approximation normale peut etre mediocre

## Contexte theorique

### Quand utiliser l'approximation normale

**Approximation Binomiale -> Normale** :
- X ~ Binomiale(n, p)
- Approximer par : X ~ N(mu = np, sigma^2 = np(1-p))
- Regle empirique : fonctionne bien lorsque np >= 5 ET n(1-p) >= 5

**Pour les proportions empiriques** :
- p_hat = X/n (proportion empirique)
- p_hat ~ N(p, p(1-p)/n) approximativement

**Erreur standard** :
```
SE(X_bar) = sigma/sqrt(n)
```

### Correction de continuite
Lors de l'approximation d'une loi discrete par une loi continue :
- P(X = k) -> P(k - 0.5 < X < k + 0.5)
- P(X >= k) -> P(X > k - 0.5)
- P(X <= k) -> P(X < k + 0.5)

## Reference des fonctions R

| Fonction | Objectif | Exemple |
|----------|---------|---------|
| `library(package)` | Charger un package | `library(MASS)` |
| `tapply(X, INDEX, FUN)` | Appliquer une fonction par groupe | `tapply(speed, exp, mean)` |
| `cumsum(x)` | Somme cumulee | `cumsum(c(1,2,3))` -> [1,3,6] |
| `rbinom(n, size, prob)` | Echantillons binomiaux aleatoires | `rbinom(100, 10, 0.25)` |
| `pbinom(q, size, prob)` | CDF binomiale P(X <= q) | `pbinom(5, 10, 0.25)` |
| `dbinom(x, size, prob)` | PMF binomiale P(X = x) | `dbinom(6, 10, 0.25)` |
| `pnorm(q, mean, sd)` | CDF normale P(X <= q) | `pnorm(0.6, 0.25, 0.137)` |
| `dnorm(x, mean, sd)` | Densite normale f(x) | `dnorm(0.5, 0.25, 0.137)` |

## Conseils et pieges courants

1. **Syntaxe de tapply()** : `tapply(DONNEES, VARIABLE_GROUPEMENT, FONCTION)`
2. **Moyenne cumulee** : Utiliser `cumsum(x) / (1:length(x))` et non `cumsum(x) / length(x)`
3. **Notation des probabilites** :
   - P(X <= k) : utiliser `pbinom(k, ...)`
   - P(X >= k) : utiliser `1 - pbinom(k-1, ...)` ou `pbinom(k-1, ..., lower.tail=FALSE)`
4. **Densite de l'histogramme** : Utiliser `freq=FALSE` pour tracer la densite (necessaire pour la superposition avec les courbes theoriques)
5. **Limites du TCL** : L'approximation normale peut etre mediocre pour des probabilites extremes ou de petits n

## Extensions et exercices supplementaires

1. Tester differentes probabilites de succes (p = 0.1, 0.3, 0.5)
2. Varier les tailles d'echantillon pour observer la vitesse de convergence du TCL
3. Comparer differentes distributions (Poisson, exponentielle) et verifier le TCL
4. Implementer la correction de continuite et comparer les resultats
5. Calculer l'erreur d'approximation pour differentes valeurs de parametres

## Ressources

- `help(tapply)` - Operations par groupe
- `help(Distributions)` - Liste de toutes les distributions de probabilite
- Documentation du package MASS : `help(package="MASS")`
