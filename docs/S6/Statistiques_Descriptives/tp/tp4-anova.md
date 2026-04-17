---
title: "TP4: ANOVA (Analyse de la variance)"
sidebar_position: 4
---

# TP4: ANOVA (Analyse de la variance)

## Objectifs

Maîtriser l'ANOVA pour comparer des moyennes entre groupes:
- ANOVA à 1 facteur (one-way)
- ANOVA à 2 facteurs avec/sans interaction (two-way)
- Interpréter les tables d'ANOVA
- Tests de comparaisons multiples
- Utilisation du package `emmeans`

## Structure

```
TP4/
├── README.md                    # Ce fichier
├── Sujet TP4.pdf               # Énoncé officiel
├── src/
│   └── TP4_solutions.R         # Solutions commentées et nettoyées
├── TP4_Donnees/                # Jeux de données
│   ├── hotdogs.txt
│   ├── cafe.csv
│   └── resistance_textile.txt
└── (fichiers originaux)        # Déplacés vers _originals/
```

## Package requis

```r
install.packages("emmeans")
library(emmeans)
```

## ANOVA: Principes

### Objectif
Comparer les moyennes de plusieurs groupes (≥ 2) pour déterminer si au moins une diffère des autres.

### Hypothèses
- **H₀:** μ₁ = μ₂ = ... = μₖ (toutes les moyennes sont égales)
- **H₁:** ∃i,j tel que μᵢ ≠ μⱼ (au moins une moyenne diffère)

### Conditions d'application
1. **Indépendance:** observations indépendantes
2. **Normalité:** distributions normales dans chaque groupe
3. **Homoscédasticité:** variances égales entre groupes

### Vérification
- Graphiques de diagnostic: `plot(modele)`
- Tests formels (si nécessaire):
  - Normalité: `shapiro.test()`
  - Homoscédasticité: `bartlett.test()`, `leveneTest()`

## ANOVA à 1 facteur

### Modèle
Pour tout i = 1,...,k (groupes) et j = 1,...,nᵢ (observations):

**Yᵢⱼ = μ + αᵢ + εᵢⱼ**

où:
- μ: moyenne générale
- αᵢ: effet du groupe i
- εᵢⱼ iid ~ N(0, σ²): erreur aléatoire

### Contraintes
1. **Contrainte naturelle:** Σαᵢ = 0
2. **Contrainte témoin (défaut R):** α₁ = 0

### Syntaxe R
```r
# Créer un modèle
mod <- lm(Y ~ Facteur, data=df)

# Convertir en facteur si nécessaire
df$Facteur <- as.factor(df$Facteur)

# Table d'ANOVA
anova(mod)

# Résumé des coefficients
summary(mod)

# Graphiques de diagnostic
par(mfrow=c(2,2))
plot(mod)
par(mfrow=c(1,1))
```

### Table d'ANOVA

| Source | Df | Sum Sq | Mean Sq | F value | Pr(>F) |
|--------|-----|--------|---------|---------|--------|
| Facteur | k-1 | SCM | CCM | F₀ | p-value |
| Residuals | n-k | SCR | CCR | | |

- **Df:** degrés de liberté
- **Sum Sq:** sommes des carrés
  - SCM: somme des carrés du modèle (between-group variability)
  - SCR: somme des carrés résiduelle (within-group variability)
- **Mean Sq:** carrés moyens
  - CCM = SCM / (k-1)
  - CCR = SCR / (n-k)
- **F value:** F₀ = CCM / CCR
- **Pr(>F):** probabilité critique (p-value)

### Décision
- Si p < α (souvent 0.05): **rejeter H₀** → au moins une moyenne diffère
- Si p ≥ α: **ne pas rejeter H₀** → pas de différence significative

## ANOVA à 2 facteurs

### Sans interaction
**Yᵢⱼₖ = μ + αᵢ + βⱼ + εᵢⱼₖ**

```r
mod <- lm(Y ~ FacteurA + FacteurB, data=df)
```

### Avec interaction
**Yᵢⱼₖ = μ + αᵢ + βⱼ + (αβ)ᵢⱼ + εᵢⱼₖ**

```r
mod <- lm(Y ~ FacteurA * FacteurB, data=df)
# Équivalent à:
mod <- lm(Y ~ FacteurA + FacteurB + FacteurA:FacteurB, data=df)
```

### Interaction
- **Définition:** L'effet d'un facteur dépend du niveau de l'autre facteur
- **Test:** H₀: pas d'interaction vs H₁: interaction significative
- **Si interaction significative:** ne pas interpréter les effets principaux séparément

## Exercices

### Exercice 1: Hotdogs (ANOVA à 1 facteur)
Comparer les caractéristiques nutritionnelles de 3 types de hotdogs.

**Types:**
1. Boeuf
2. Mélange (boeuf + porc)
3. Volaille

**Variables:** Calories, Sodium

**Workflow:**

#### 1. Nettoyage des données
```r
tab <- tab[-which(tab$Type == 4), ]  # Supprimer Type=4 (aberrant)
tab$Type <- as.factor(tab$Type)      # Convertir en facteur
```

#### 2. Statistiques descriptives
```r
summary(Calories)
by(tab, tab$Type, summary)
boxplot(Calories ~ Type)
```

**Observations:**
- Boeuf et mélange: riches en calories
- Volaille: moins calorique
- Boeuf: moins riche en sel (en moyenne)

#### 3. Modèle ANOVA
```r
mod1 <- lm(Calories ~ Type, data=tab)
anova(mod1)
```

**Test:**
- H₀: α₁ = α₂ = α₃ = 0 (pas d'effet du type)
- H₁: ∃i tel que αᵢ ≠ 0 (effet du type)

**Résultat:** p < 0.05 → le type de hotdog a un effet significatif

#### 4. Graphiques de diagnostic
```r
par(mfrow=c(2,2))
plot(mod1)
```

**Interprétation:**
- **Residuals vs Fitted:** 3 valeurs alignées (3 niveaux du facteur)
- Résidus homogènes autour de 0 ✓
- Homoscédasticité vérifiée ✓
- **Q-Q plot:** léger écart aux extrémités (acceptable)

#### 5. Estimation des paramètres
```r
summary(mod1)
```

**Contrainte témoin (α₁ = 0):**
- μ̂ = 156.85: moyenne des calories pour Type 1 (boeuf)
- α̂₂ = 1.86: différence Type 2 - Type 1
- α̂₃ = -38.09: différence Type 3 - Type 1

**Prédictions:**
- Type 1: 156.85 calories
- Type 2: 156.85 + 1.86 = 158.71 calories
- Type 3: 156.85 - 38.09 = 118.76 calories

**R² = 0.387:** 38.7% de variabilité expliquée

#### 6. Comparaisons multiples
```r
emmeans(mod1, pairwise ~ Type, adjust="bonferroni")
```

**Méthode de Bonferroni:**
- Ajuste le niveau de confiance pour comparaisons multiples
- Contrôle le taux d'erreur global

**Résultats:**
- Comparaison 1-2: différence non significative
- Comparaison 1-3: **-38.09 calories** (significatif)
- Comparaison 2-3: **-39.94 calories** (significatif)

**Conclusion:** La volaille est significativement moins calorique

#### 7. Même analyse pour le Sodium
- Résultats similaires
- Identifier le type le moins salé

### Exercice 2: Cafés (ANOVA à 2 facteurs)
Comparer l'acidité de 3 cafés évaluée par 6 juges.

**Facteurs:**
- FacteurA: Café (3 niveaux)
- FacteurB: Juge (6 niveaux)

**Question:** Est-ce que le type de café influence l'acidité perçue?

**Workflow:**

#### 1. Convertir en facteurs
```r
cafe$cafe <- as.factor(cafe$cafe)
cafe$juge <- as.factor(cafe$juge)
```

#### 2. Modèle sans interaction
```r
mod <- lm(acidite ~ cafe + juge, data=cafe)
anova(mod)
```

**Tests:**
- **Effet café:** H₀: α₁ = α₂ = α₃ = 0
- **Effet juge:** H₀: β₁ = ... = β₆ = 0

**Résultats:**
- Effet café: p < 0.05 → significatif
- Effet juge: p < 0.05 → significatif

**Interprétation:**
- Le type de café influence l'acidité
- Les juges notent différemment (biais individuel)
- **Intérêt d'inclure le juge:** contrôler la variabilité due aux juges pour mieux estimer l'effet café

#### 3. Modèle avec interaction
```r
mod_inter <- lm(acidite ~ cafe * juge, data=cafe)
anova(mod_inter)
```

**Test d'interaction:**
- H₀: pas d'interaction
- H₁: interaction significative

**Si interaction significative:**
- L'effet du café dépend du juge
- Un café peut être jugé plus acide par certains juges et moins par d'autres

#### 4. Comparaisons multiples
```r
emmeans(mod, pairwise ~ cafe, adjust="bonferroni")
```

**Recommandation:** Choisir le café perçu comme le moins acide

### Exercice 3: Résistance textile (ANOVA à 3 facteurs)
Évaluer l'effet du type de textile sur la résistance à l'usure en contrôlant position et cycle.

**Facteurs:**
- Textile: A, B, C, D (4 niveaux)
- Position: 4 positions dans le testeur (4 niveaux)
- Cycle: ordre de passage (4 niveaux)

**Variable réponse:** Perte de poids (dixièmes de mg)

**Workflow:**

#### 1. Convertir en facteurs
```r
resistance$textile <- as.factor(resistance$textile)
resistance$position <- as.factor(resistance$position)
resistance$cycle <- as.factor(resistance$cycle)
```

#### 2. Visualisation
```r
boxplot(perte_poids ~ textile, data=resistance,
        main="Perte de poids par textile")
abline(h=mean(perte_poids), col="red", lwd=3)
```

**Observations:**
- Textile A: perd moins de poids → plus résistant
- Textile B: perd le plus de poids → moins résistant

#### 3. ANOVA à 1 facteur (textile uniquement)
```r
mod1 <- lm(perte_poids ~ textile, data=resistance)
anova(mod1)
```

**Résultat:** p < 0.05 → effet significatif du textile

#### 4. ANOVA à 3 facteurs
```r
mod2 <- lm(perte_poids ~ textile + position + cycle, data=resistance)
anova(mod2)
```

**Résultats:**
- Textile: p < 0.05 → significatif
- Position: p < 0.05 → significatif
- Cycle: p < 0.05 → significatif

**Interprétation:**
- Les 3 facteurs influencent la perte de poids
- **Avantage du modèle à 3 facteurs:** contrôle la variabilité due à position et cycle pour mieux estimer l'effet textile

#### 5. Test d'un coefficient spécifique
```r
summary(mod2)$coefficients["textileD", 4] < 0.05
```

Vérifie si le coefficient du textile D est significativement différent de 0

#### 6. Comparaisons multiples
```r
emmeans(mod2, pairwise ~ textile, adjust="bonferroni")
```

**Identifier:**
- Quelles paires de textiles diffèrent significativement?
- Quel textile est le plus résistant?

**Recommandation:** Choisir le textile A (perte de poids minimale)

## Comparaisons multiples

### Problème
Faire k tests à α=5% augmente le risque d'erreur global:
- 1 test: risque = 5%
- 10 tests: risque ≈ 40%

### Solution: Correction de Bonferroni
Ajuster le seuil de significativité: α' = α / nombre de comparaisons

### Fonction emmeans
```r
library(emmeans)

# Moyennes estimées avec IC
emmeans(mod, ~ Facteur)

# Comparaisons deux à deux
emmeans(mod, pairwise ~ Facteur, adjust="bonferroni")

# Autres méthodes d'ajustement
adjust="tukey"        # Tukey HSD (recommandé)
adjust="bonferroni"   # Bonferroni (conservateur)
adjust="none"         # Pas d'ajustement (risqué)
```

### Interprétation
```
$emmeans: intervalles de confiance sur les moyennes de chaque groupe

$contrasts: comparaisons deux à deux
- estimate: différence estimée
- SE: erreur standard
- t.ratio: statistique de test
- p.value: probabilité critique (ajustée)
```

## Graphiques de diagnostic

```r
par(mfrow=c(2,2))
plot(mod)
par(mfrow=c(1,1))
```

### 1. Residuals vs Fitted
- **Bon:** points aléatoires autour de 0, forme rectangulaire
- **Problème:**
  - Structure systématique → modèle inadapté
  - Forme en entonnoir → hétéroscédasticité

### 2. Q-Q plot
- **Bon:** points alignés sur la droite
- **Problème:** écarts aux extrémités → non-normalité

### 3. Scale-Location
- **Bon:** ligne horizontale
- **Problème:** tendance → hétéroscédasticité

### 4. Residuals vs Leverage
- **Identifier:** observations influentes (au-delà des lignes de Cook)
- Distance de Cook > 1 → observation très influente

## Commandes essentielles

```r
# Modèle
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

# Prédictions
predict(mod, newdata=df_new)

# Extraire les résultats
anova_table <- anova(mod)
anova_table["Facteur", "Pr(>F)"]  # p-value
```

## Choix du modèle

### ANOVA vs Régression
- **ANOVA:** variable explicative catégorielle (facteur)
- **Régression:** variable explicative quantitative
- **ANCOVA:** mélange des deux

### Interaction: oui ou non?
1. Tester avec interaction
2. Si interaction non significative (p > 0.05):
   - Refaire sans interaction (modèle plus simple)
3. Si interaction significative:
   - Garder l'interaction
   - Ne pas interpréter les effets principaux séparément

### Validation
1. Graphiques de diagnostic
2. Si hypothèses non vérifiées:
   - Transformation (log, √)
   - Tests non paramétriques (Kruskal-Wallis)

## Pièges à éviter

1. **Oublier de convertir en facteur:**
   ```r
   df$Facteur <- as.factor(df$Facteur)
   ```

2. **Ne pas vérifier les hypothèses:** toujours tracer `plot(mod)`

3. **Interpréter les effets principaux quand interaction significative**

4. **Comparaisons multiples sans ajustement:** augmente le risque d'erreur

5. **Confondre significativité et importance pratique**

## Ressources

- `?lm` pour la régression/ANOVA
- `?anova` pour la table d'ANOVA
- `?emmeans` pour les comparaisons multiples
- Package `multcomp` pour tests avancés
- Package `car` pour diagnostics (Levene test, etc.)
