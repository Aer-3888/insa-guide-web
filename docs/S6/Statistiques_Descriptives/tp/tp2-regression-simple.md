---
title: "TP2: Regression lineaire simple"
sidebar_position: 2
---

# TP2: Regression lineaire simple

## Objectifs

Maitriser la regression lineaire simple et sa validation :
- Ajuster un modele lineaire avec `lm()`
- Analyser les residus pour valider les hypotheses
- Interpreter le coefficient de determination $R^2$
- Calculer des predictions et intervalles de confiance
- Detecter les problemes et appliquer des transformations

## Structure

```
TP2/
├── README.md                    # Ce fichier
├── Sujet TP2.pdf               # Enonce officiel
├── TP 2 ex 2 correction.pdf    # Correction de l'exercice 2
├── src/
│   └── TP2_solutions.R         # Solutions commentees et nettoyees
├── TP2_Donnees/                # Jeux de donnees
│   ├── Courrier.txt
│   ├── tomassone.txt
│   ├── freinage.txt
│   └── porcs.csv
└── (fichiers originaux)        # Deplaces vers _originals/
```

## Modele lineaire simple

**Equation :** $Y = \beta_0 + \beta_1 X + \varepsilon$
ou $\varepsilon \sim \mathcal{N}(0, \sigma^2)$ (erreurs independantes, identiquement distribuees)

**Estimation :** methode des moindres carres
**Syntaxe R :** `lm(Y ~ X, data=df)`

## Exercices

### Exercice 1 : Courrier (regression parfaite)
Modeliser le nombre de lettres en fonction du poids du courrier.

**Etapes :**
1. Representation graphique (nuage de points)
2. Ajustement du modele lineaire
3. Tracer la droite de regression
4. Calculer $R^2$ (coefficient de determination)
5. Analyser les residus
6. Tester la significativite de $\beta_1$
7. Faire une prediction ponctuelle
8. Calculer un intervalle de prevision
9. Visualiser les intervalles de prevision

**Resultat :** $R^2 = 0.963$ -- modele excellent, hypotheses validees

**Concepts cles :**
- `attach()` pour utiliser directement les noms de colonnes
- `summary(reg)` pour les statistiques du modele
- `predict()` avec `interval="prediction"` pour les intervalles
- Graphe des residus : valeurs ajustees vs residus

### Exercice 2 : Le quatuor d'Anscombe (pieges de la regression)
Analyser 4 jeux de donnees avec les memes statistiques mais des relations tres differentes.

**Donnees :** `tomassone.txt` contient X et Y1, Y2, Y3, Y4

#### Y1 : Cas ideal
- Relation lineaire claire
- Residus uniformement repartis
- Modele lineaire approprie

#### Y2 : Non-linearite
- Tendance parabolique visible
- $R^2 = 0.62$ (faible)
- Residus non uniformes -- structure parabolique

**Solution :** Ajouter $X^2$ comme variable explicative
```r noexec
X2 <- X^2
reg_poly <- lm(Y2 ~ X + X2)
```

#### Y3 : Valeur aberrante (outlier)
- Une observation influence fortement le modele
- Le point 16 s'ecarte de plus de $2\sigma$

**Solution :** Identifier et supprimer l'outlier
```r noexec
data_clean <- data[-16, ]
reg_clean <- lm(Y3 ~ X, data=data_clean)
```

#### Y4 : Transformation necessaire
- Residus non uniformes (allure sinusoidale)
- Transformation logarithmique + polynomiale necessaire

**Solution :**
```r noexec
reg_log <- lm(log(Y4) ~ X + X2)
```

**Message cle :** Ne jamais se fier uniquement aux statistiques ($R^2$, p-value).
Toujours visualiser les donnees et analyser les residus !

### Exercice 3 : Distance de freinage
Modeliser la distance d'arret en fonction de la vitesse du vehicule.

**Variables :**
- Y : Distance d'arret (m)
- X : Vitesse (km/h)

**Demarche :**
1. Regression lineaire simple
   - $R^2 = 0.98$ -- tres bon
   - p-value < 0.05 -- influence significative
2. Analyse des residus -- allure parabolique
3. Amelioration : ajouter $\text{Vitesse}^2$
   - Residus aleatoires et homoscedastiques
4. Prediction pour 85 km/h
   - Distance totale = distance de freinage + distance de reaction
   - Distance de reaction = vitesse x 2 secondes

**Conversion :** 85 km/h = 85/3.6 = 23.6 m/s

### Exercice 4 : Gain en proteines (porcs)
Modeliser le gain journalier en proteines en fonction de l'ingestion.

**Variables :**
- Y : gain (g de proteines/jour)
- X : ingestion (quantite ingeree/jour)

**Demarche :**
1. Regression simple
   - $R^2 = 0.63$ (moyen)
   - Residus paraboliques
2. Amelioration avec $X^2$
3. **Modele avec seuil** (Q6) :
   - Hypothese : le gain augmente jusqu'a ingestion = 28, puis plafonne
   - Regression sur les donnees ou ingestion $\leq$ 28
   - Valeur constante pour ingestion > 28

**Concepts cles :**
- Modeles segmentes (par morceaux)
- Contraintes de continuite
- Plafonnement d'une reponse biologique

## Validation du modele lineaire

### Hypotheses a verifier

1. **Linearite :** relation lineaire entre X et Y
   - Verification : nuage de points
2. **Independance :** erreurs independantes
   - Hypothese raisonnable si echantillonnage aleatoire
3. **Homoscedasticite :** variance constante des erreurs
   - Verification : graphe des residus (forme rectangulaire)
4. **Normalite :** erreurs $\sim \mathcal{N}(0, \sigma^2)$
   - Verification : QQ-plot

### Graphe des residus

**Interpretation :**
- **Bon modele :** points repartis aleatoirement autour de 0, dans une bande horizontale
- **Problemes :**
  - Forme parabolique -- ajouter $X^2$
  - Forme en entonnoir -- heteroscedasticite -- transformation log
  - Points isoles -- outliers -- verifier/supprimer
  - Structure systematique -- variable manquante

**Seuils :** $\pm 2\sigma$ (95% des residus doivent etre dans cet intervalle)

## Coefficient de determination ($R^2$)

**Formule :** $R^2 = SCE/SCT = 1 - SCR/SCT$

**Interpretation :**
- $0 \leq R^2 \leq 1$
- $R^2 = 0.80$ -- 80% de la variabilite de Y est expliquee par X
- Un $R^2$ eleve ne garantit pas un bon modele !

**Regles empiriques :**
- $R^2 > 0.9$ : excellent
- $0.7 < R^2 < 0.9$ : bon
- $0.5 < R^2 < 0.7$ : moyen
- $R^2 < 0.5$ : faible (modele peu predictif)

## Prediction

### Prediction ponctuelle
```r noexec
predict(reg, data.frame(X=27.5))
```

### Intervalle de prevision (95%)
```r noexec
predict(reg, data.frame(X=27.5), interval="prediction")
```

**Difference :**
- **Intervalle de confiance :** pour la moyenne de $Y \mid X$
- **Intervalle de prevision :** pour une nouvelle observation $Y$ (plus large)

## Commandes essentielles

```r noexec
# Regression
reg <- lm(Y ~ X, data=df)
summary(reg)                    # Statistiques completes
coef(reg)                       # Coefficients beta_0, beta_1
residuals(reg)                  # Residus
fitted.values(reg)              # Valeurs ajustees

# Visualisation
plot(X, Y)
abline(reg)                     # Ajouter la droite
plot(reg$fitted, reg$residuals) # Graphe des residus

# Prediction
predict(reg, newdata, interval="prediction")

# Transformation
reg_log <- lm(log(Y) ~ X)
reg_poly <- lm(Y ~ X + I(X^2))  # I() pour calculs dans la formule
```

## Pieges a eviter

1. **Ne pas verifier les residus :** un $R^2$ eleve ne suffit pas
2. **Ignorer les outliers :** une seule valeur peut tout changer
3. **Extrapoler hors du domaine :** dangereux
4. **Causalite $\neq$ correlation :** une relation statistique n'implique pas un lien de cause a effet

## Ressources

- `?lm` pour la documentation
- `?predict.lm` pour les options de prediction
- Package `car` pour des outils diagnostiques avances
