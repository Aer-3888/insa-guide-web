---
title: "TP4: ANOVA (Analyse de la variance)"
sidebar_position: 4
---

# TP4: ANOVA (Analyse de la variance)

## Objectifs

Maitriser l'ANOVA pour comparer des moyennes entre groupes :
- ANOVA a 1 facteur (one-way)
- ANOVA a 2 facteurs avec/sans interaction (two-way)
- Interpreter les tables d'ANOVA
- Tests de comparaisons multiples
- Utilisation du package `emmeans`

## Structure

```
TP4/
├── README.md                    # Ce fichier
├── Sujet TP4.pdf               # Enonce officiel
├── src/
│   └── TP4_solutions.R         # Solutions commentees et nettoyees
├── TP4_Donnees/                # Jeux de donnees
│   ├── hotdogs.txt
│   ├── cafe.csv
│   └── resistance_textile.txt
└── (fichiers originaux)        # Deplaces vers _originals/
```

## Package requis

```r noexec
install.packages("emmeans")
library(emmeans)
```

## ANOVA : Principes

### Objectif
Comparer les moyennes de plusieurs groupes ($\geq 2$) pour determiner si au moins une differe des autres.

### Hypotheses
- **$H_0$ :** $\mu_1 = \mu_2 = \cdots = \mu_k$ (toutes les moyennes sont egales)
- **$H_1$ :** $\exists\, i,j$ tel que $\mu_i \neq \mu_j$ (au moins une moyenne differe)

### Conditions d'application
1. **Independance :** observations independantes
2. **Normalite :** distributions normales dans chaque groupe
3. **Homoscedasticite :** variances egales entre groupes

### Verification
- Graphiques de diagnostic : `plot(modele)`
- Tests formels (si necessaire) :
  - Normalite : `shapiro.test()`
  - Homoscedasticite : `bartlett.test()`, `leveneTest()`

## ANOVA a 1 facteur

### Modele
Pour tout $i = 1, \ldots, k$ (groupes) et $j = 1, \ldots, n_i$ (observations) :

$$Y_{ij} = \mu + \alpha_i + \varepsilon_{ij}$$

ou :
- $\mu$ : moyenne generale
- $\alpha_i$ : effet du groupe $i$
- $\varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$ : erreur aleatoire

### Contraintes
1. **Contrainte naturelle :** $\sum \alpha_i = 0$
2. **Contrainte temoin (defaut R) :** $\alpha_1 = 0$

### Syntaxe R
```r noexec
# Creer un modele
mod <- lm(Y ~ Facteur, data=df)

# Convertir en facteur si necessaire
df$Facteur <- as.factor(df$Facteur)

# Table d'ANOVA
anova(mod)

# Resume des coefficients
summary(mod)

# Graphiques de diagnostic
par(mfrow=c(2,2))
plot(mod)
par(mfrow=c(1,1))
```

### Table d'ANOVA

| Source | Df | Sum Sq | Mean Sq | F value | Pr(>F) |
|--------|-----|--------|---------|---------|--------|
| Facteur | $k-1$ | SCM | CCM | $F_0$ | p-value |
| Residuals | $n-k$ | SCR | CCR | | |

- **Df :** degres de liberte
- **Sum Sq :** sommes des carres
  - SCM : somme des carres du modele (variabilite inter-groupes)
  - SCR : somme des carres residuelle (variabilite intra-groupes)
- **Mean Sq :** carres moyens
  - $CCM = SCM / (k-1)$
  - $CCR = SCR / (n-k)$
- **F value :** $F_0 = CCM / CCR$
- **Pr(>F) :** probabilite critique (p-value)

### Decision
- Si $p < \alpha$ (souvent 0.05) : **rejeter $H_0$** -- au moins une moyenne differe
- Si $p \geq \alpha$ : **ne pas rejeter $H_0$** -- pas de difference significative

## ANOVA a 2 facteurs

### Sans interaction
$$Y_{ijk} = \mu + \alpha_i + \beta_j + \varepsilon_{ijk}$$

```r noexec
mod <- lm(Y ~ FacteurA + FacteurB, data=df)
```

### Avec interaction
$$Y_{ijk} = \mu + \alpha_i + \beta_j + (\alpha\beta)_{ij} + \varepsilon_{ijk}$$

```r noexec
mod <- lm(Y ~ FacteurA * FacteurB, data=df)
# Equivalent a :
mod <- lm(Y ~ FacteurA + FacteurB + FacteurA:FacteurB, data=df)
```

### Interaction
- **Definition :** L'effet d'un facteur depend du niveau de l'autre facteur
- **Test :** $H_0$ : pas d'interaction vs $H_1$ : interaction significative
- **Si interaction significative :** ne pas interpreter les effets principaux separement

## Exercices

### Exercice 1 : Hotdogs (ANOVA a 1 facteur)
Comparer les caracteristiques nutritionnelles de 3 types de hotdogs.

**Types :**
1. Boeuf
2. Melange (boeuf + porc)
3. Volaille

**Variables :** Calories, Sodium

**Demarche :**

#### 1. Nettoyage des donnees
```r noexec
tab <- tab[-which(tab$Type == 4), ]  # Supprimer Type=4 (aberrant)
tab$Type <- as.factor(tab$Type)      # Convertir en facteur
```

#### 2. Statistiques descriptives
```r noexec
summary(Calories)
by(tab, tab$Type, summary)
boxplot(Calories ~ Type)
```

**Observations :**
- Boeuf et melange : riches en calories
- Volaille : moins calorique
- Boeuf : moins riche en sel (en moyenne)

#### 3. Modele ANOVA
```r noexec
mod1 <- lm(Calories ~ Type, data=tab)
anova(mod1)
```

**Test :**
- $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$ (pas d'effet du type)
- $H_1 : \exists\, i$ tel que $\alpha_i \neq 0$ (effet du type)

**Resultat :** $p < 0.05$ -- le type de hotdog a un effet significatif

#### 4. Graphiques de diagnostic
```r noexec
par(mfrow=c(2,2))
plot(mod1)
```

**Interpretation :**
- **Residuals vs Fitted :** 3 valeurs alignees (3 niveaux du facteur)
- Residus homogenes autour de 0
- Homoscedasticite verifiee
- **QQ-plot :** leger ecart aux extremites (acceptable)

#### 5. Estimation des parametres
```r noexec
summary(mod1)
```

**Contrainte temoin ($\alpha_1 = 0$) :**
- $\hat{\mu} = 156.85$ : moyenne des calories pour le Type 1 (boeuf)
- $\hat{\alpha}_2 = 1.86$ : difference Type 2 - Type 1
- $\hat{\alpha}_3 = -38.09$ : difference Type 3 - Type 1

**Predictions :**
- Type 1 : 156.85 calories
- Type 2 : $156.85 + 1.86 = 158.71$ calories
- Type 3 : $156.85 - 38.09 = 118.76$ calories

**$R^2 = 0.387$ :** 38.7% de variabilite expliquee

#### 6. Comparaisons multiples
```r noexec
emmeans(mod1, pairwise ~ Type, adjust="bonferroni")
```

**Methode de Bonferroni :**
- Ajuste le niveau de confiance pour comparaisons multiples
- Controle le taux d'erreur global

**Resultats :**
- Comparaison 1-2 : difference non significative
- Comparaison 1-3 : **-38.09 calories** (significatif)
- Comparaison 2-3 : **-39.94 calories** (significatif)

**Conclusion :** La volaille est significativement moins calorique

#### 7. Meme analyse pour le Sodium
- Resultats similaires
- Identifier le type le moins sale

### Exercice 2 : Cafes (ANOVA a 2 facteurs)
Comparer l'acidite de 3 cafes evaluee par 6 juges.

**Facteurs :**
- Facteur A : Cafe (3 niveaux)
- Facteur B : Juge (6 niveaux)

**Question :** Est-ce que le type de cafe influence l'acidite percue ?

**Demarche :**

#### 1. Convertir en facteurs
```r noexec
cafe$cafe <- as.factor(cafe$cafe)
cafe$juge <- as.factor(cafe$juge)
```

#### 2. Modele sans interaction
```r noexec
mod <- lm(acidite ~ cafe + juge, data=cafe)
anova(mod)
```

**Tests :**
- **Effet cafe :** $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$
- **Effet juge :** $H_0 : \beta_1 = \cdots = \beta_6 = 0$

**Resultats :**
- Effet cafe : $p < 0.05$ -- significatif
- Effet juge : $p < 0.05$ -- significatif

**Interpretation :**
- Le type de cafe influence l'acidite
- Les juges notent differemment (biais individuel)
- **Interet d'inclure le juge :** controler la variabilite due aux juges pour mieux estimer l'effet cafe

#### 3. Modele avec interaction
```r noexec
mod_inter <- lm(acidite ~ cafe * juge, data=cafe)
anova(mod_inter)
```

**Test d'interaction :**
- $H_0$ : pas d'interaction
- $H_1$ : interaction significative

**Si interaction significative :**
- L'effet du cafe depend du juge
- Un cafe peut etre juge plus acide par certains juges et moins par d'autres

#### 4. Comparaisons multiples
```r noexec
emmeans(mod, pairwise ~ cafe, adjust="bonferroni")
```

**Recommandation :** Choisir le cafe percu comme le moins acide

### Exercice 3 : Resistance textile (ANOVA a 3 facteurs)
Evaluer l'effet du type de textile sur la resistance a l'usure en controlant position et cycle.

**Facteurs :**
- Textile : A, B, C, D (4 niveaux)
- Position : 4 positions dans le testeur (4 niveaux)
- Cycle : ordre de passage (4 niveaux)

**Variable reponse :** Perte de poids (dixiemes de mg)

**Demarche :**

#### 1. Convertir en facteurs
```r noexec
resistance$textile <- as.factor(resistance$textile)
resistance$position <- as.factor(resistance$position)
resistance$cycle <- as.factor(resistance$cycle)
```

#### 2. Visualisation
```r noexec
boxplot(perte_poids ~ textile, data=resistance,
        main="Perte de poids par textile")
abline(h=mean(perte_poids), col="red", lwd=3)
```

**Observations :**
- Textile A : perd moins de poids -- plus resistant
- Textile B : perd le plus de poids -- moins resistant

#### 3. ANOVA a 1 facteur (textile uniquement)
```r noexec
mod1 <- lm(perte_poids ~ textile, data=resistance)
anova(mod1)
```

**Resultat :** $p < 0.05$ -- effet significatif du textile

#### 4. ANOVA a 3 facteurs
```r noexec
mod2 <- lm(perte_poids ~ textile + position + cycle, data=resistance)
anova(mod2)
```

**Resultats :**
- Textile : $p < 0.05$ -- significatif
- Position : $p < 0.05$ -- significatif
- Cycle : $p < 0.05$ -- significatif

**Interpretation :**
- Les 3 facteurs influencent la perte de poids
- **Avantage du modele a 3 facteurs :** controle la variabilite due a la position et au cycle pour mieux estimer l'effet textile

#### 5. Test d'un coefficient specifique
```r noexec
summary(mod2)$coefficients["textileD", 4] < 0.05
```

Verifie si le coefficient du textile D est significativement different de 0

#### 6. Comparaisons multiples
```r noexec
emmeans(mod2, pairwise ~ textile, adjust="bonferroni")
```

**Identifier :**
- Quelles paires de textiles different significativement ?
- Quel textile est le plus resistant ?

**Recommandation :** Choisir le textile A (perte de poids minimale)

## Comparaisons multiples

### Probleme
Faire $k$ tests a $\alpha = 5\%$ augmente le risque d'erreur global :
- 1 test : risque = 5%
- 10 tests : risque $\approx$ 40%

### Solution : Correction de Bonferroni
Ajuster le seuil de significativite : $\alpha' = \alpha / \text{nombre de comparaisons}$

### Fonction `emmeans`
```r noexec
library(emmeans)

# Moyennes estimees avec IC
emmeans(mod, ~ Facteur)

# Comparaisons deux a deux
emmeans(mod, pairwise ~ Facteur, adjust="bonferroni")

# Autres methodes d'ajustement
adjust="tukey"        # Tukey HSD (recommande)
adjust="bonferroni"   # Bonferroni (conservateur)
adjust="none"         # Pas d'ajustement (risque)
```

### Interpretation
```
$emmeans : intervalles de confiance sur les moyennes de chaque groupe

$contrasts : comparaisons deux a deux
- estimate : difference estimee
- SE : erreur standard
- t.ratio : statistique de test
- p.value : probabilite critique (ajustee)
```

## Graphiques de diagnostic

```r noexec
par(mfrow=c(2,2))
plot(mod)
par(mfrow=c(1,1))
```

### 1. Residuals vs Fitted
- **Bon :** points aleatoires autour de 0, forme rectangulaire
- **Probleme :**
  - Structure systematique -- modele inadapte
  - Forme en entonnoir -- heteroscedasticite

### 2. QQ-plot
- **Bon :** points alignes sur la droite
- **Probleme :** ecarts aux extremites -- non-normalite

### 3. Scale-Location
- **Bon :** ligne horizontale
- **Probleme :** tendance -- heteroscedasticite

### 4. Residuals vs Leverage
- **Identifier :** observations influentes (au-dela des lignes de Cook)
- Distance de Cook > 1 -- observation tres influente

## Commandes essentielles

```r noexec
# Modele
mod <- lm(Y ~ Facteur, data=df)
mod <- lm(Y ~ Facteur1 + Facteur2, data=df)
mod <- lm(Y ~ Facteur1 * Facteur2, data=df)

# Table d'ANOVA
anova(mod)

# Coefficients
summary(mod)
coef(mod)

# Graphiques
par(mfrow=c(2,2))
plot(mod)
boxplot(Y ~ Facteur, data=df)

# Comparaisons
library(emmeans)
emmeans(mod, ~ Facteur)
emmeans(mod, pairwise ~ Facteur, adjust="bonferroni")

# Predictions
predict(mod, newdata=df_new)

# Extraire les resultats
anova_table <- anova(mod)
anova_table["Facteur", "Pr(>F)"]  # p-value
```

## Choix du modele

### ANOVA vs Regression
- **ANOVA :** variable explicative categorielle (facteur)
- **Regression :** variable explicative quantitative
- **ANCOVA :** melange des deux

### Interaction : oui ou non ?
1. Tester avec interaction
2. Si interaction non significative ($p > 0.05$) :
   - Refaire sans interaction (modele plus simple)
3. Si interaction significative :
   - Garder l'interaction
   - Ne pas interpreter les effets principaux separement

### Validation
1. Graphiques de diagnostic
2. Si hypotheses non verifiees :
   - Transformation (log, $\sqrt{}$)
   - Tests non parametriques (Kruskal-Wallis)

## Pieges a eviter

1. **Oublier de convertir en facteur :**
   ```r noexec
   df$Facteur <- as.factor(df$Facteur)
   ```

2. **Ne pas verifier les hypotheses :** toujours tracer `plot(mod)`

3. **Interpreter les effets principaux quand l'interaction est significative**

4. **Comparaisons multiples sans ajustement :** augmente le risque d'erreur

5. **Confondre significativite et importance pratique**

## Ressources

- `?lm` pour la regression/ANOVA
- `?anova` pour la table d'ANOVA
- `?emmeans` pour les comparaisons multiples
- Package `multcomp` pour tests avances
- Package `car` pour diagnostics (test de Levene, etc.)
