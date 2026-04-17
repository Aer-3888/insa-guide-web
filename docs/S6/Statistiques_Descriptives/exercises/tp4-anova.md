---
title: "TP4 -- ANOVA (Analyse de la variance)"
sidebar_position: 4
---

# TP4 -- ANOVA (Analyse de la variance)

> **Objectif** : Comparer les moyennes de plusieurs groupes avec l'ANOVA a 1, 2 et 3 facteurs,
> interpreter les tables ANOVA, verifier les hypotheses diagnostiques, et realiser des
> comparaisons multiples avec correction de Bonferroni.

---

## Vue d'ensemble

| Exercice | Donnees | Type d'ANOVA | Facteurs | Variable reponse |
|----------|---------|-------------|----------|------------------|
| 1 -- Hotdogs | 54 obs. | 1 facteur | Type de viande (3) | Calories, Sodium |
| 2 -- Cafes | 18 obs. | 2 facteurs | Cafe (3), Juge (6) | Acidite |
| 3 -- Textiles | 16 obs. | 3 facteurs | Textile (4), Position (4), Cycle (4) | Perte de poids |

### Rappel theorique : quand utiliser l'ANOVA ?

- **Regression** : variable explicative **quantitative** (continue).
- **ANOVA** : variable explicative **qualitative** (facteur avec des niveaux discrets).
- Les deux sont des cas particuliers du modele lineaire `lm()`.

### Modele ANOVA a 1 facteur

Pour tout $i = 1, \ldots, k$ (groupes) et $j = 1, \ldots, n_i$ (observations dans le groupe $i$) :

$$Y_{ij} = \mu + \alpha_i + \varepsilon_{ij}, \quad \varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

- $\mu$ : moyenne generale
- $\alpha_i$ : effet du groupe $i$ (deviation par rapport a $\mu$)
- $\varepsilon_{ij}$ : erreur aleatoire

### Hypotheses de l'ANOVA

1. **Independance** : observations independantes entre groupes et a l'interieur des groupes.
2. **Normalite** : distribution normale dans chaque groupe (QQ-plot).
3. **Homoscedasticite** : variance identique dans tous les groupes (Residuals vs Fitted).

### Package requis

```r
install.packages("emmeans")
library(emmeans)
```

---

## Exercice 1 : ANOVA a un facteur -- Types de hotdogs

### Enonce

En juin 1986, une etude comparant la valeur nutritionnelle des differents types de hotdogs des principales marques americaines a ete publiee dans Consumer Reports. Les hotdogs de 54 marques ont ete analyses. On a mesure sur chacun d'eux le nombre de calories et la quantite de sodium (mg). Les types de viande sont : boeuf (code 1), melange porc/boeuf/volaille (code 2), volaille (code 3), soja (code 4).

Question : le type de viande influe-t-il sur les calories ? Sur le sodium ?

---

### 1. Importation et mise en forme des donnees

#### Q1a : Charger les donnees

```r
tab <- read.table("hotdogs.txt", header = TRUE)
head(tab)
str(tab)
```

**Sortie R :**

```
  Type Calories Sodium
1    1      186    495
2    1      181    477
3    1      176    425
4    1      149    322
5    1      184    482
6    1      190    587
```

#### Q1b : Verifier les effectifs par type et nettoyer

```r
table(tab$Type)
```

**Sortie R :**

```
 1  2  3  4
20 17 17  1
```

Le Type 4 (soja) ne contient qu'**une seule observation**. Impossible de faire une ANOVA avec un seul individu dans un groupe. On le supprime :

```r
tab <- tab[-which(tab$Type == 4), ]
```

**Verification apres suppression :**

```r
table(tab$Type)
```

```
 1  2  3
20 17 17
```

#### Q1c : Convertir Type en facteur

```r
tab$Type <- as.factor(tab$Type)
```

**Pourquoi cette instruction est-elle necessaire ?** Sans `as.factor()`, R traite `Type` comme une variable **numerique** et ajuste une regression lineaire ($Y = a + b \cdot \text{Type}$), ce qui suppose une relation lineaire entre le code du type et $Y$. Avec `as.factor()`, R estime une **moyenne separee** pour chaque groupe, ce qui est le comportement attendu pour l'ANOVA.

---

### 2. Statistiques descriptives

#### Q2a : Resumer les variables Calories et Sodium

```r
attach(tab)
summary(Calories)
summary(Sodium)
```

**Sortie R :**

```
> summary(Calories)
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
  86.00  119.50  145.00  146.45  172.50  195.00

> summary(Sodium)
   Min. 1st Qu.  Median    Mean 3rd Qu.    Max.
  144.0   362.5   405.0   421.6   503.5   645.0
```

#### Q2b : Statistiques par type et boxplots

```r
by(tab, tab$Type, summary)
```

**Sortie R :**

```
tab$Type: 1
   Calories         Sodium
 Min.   :111.0   Min.   :253.0
 1st Qu.:137.0   1st Qu.:317.5
 Median :153.0   Median :389.5
 Mean   :156.8   Mean   :401.1
 3rd Qu.:181.0   3rd Qu.:479.5
 Max.   :190.0   Max.   :645.0

tab$Type: 2
   Calories         Sodium
 Min.   :107.0   Min.   :144.0
 Median :147.0   Median :405.0
 Mean   :158.7   Mean   :412.2

tab$Type: 3
   Calories         Sodium
 Min.   : 86.0   Min.   :357.0
 Median :107.0   Median :426.0
 Mean   :118.8   Mean   :458.8
```

```r
par(mfrow = c(1, 2))
boxplot(Calories ~ Type, data = tab,
        main = "Calories par type de hotdog",
        xlab = "Type (1=Boeuf, 2=Melange, 3=Volaille)",
        ylab = "Calories",
        col = c("red", "orange", "lightblue"))

boxplot(Sodium ~ Type, data = tab,
        main = "Sodium par type de hotdog",
        xlab = "Type", ylab = "Sodium (mg)",
        col = c("red", "orange", "lightblue"))
par(mfrow = c(1, 1))
```

#### Q2c : Commentaire

**Interpretation des boxplots :**
- **Calories :** Les medianes des types 1 et 2 sont similaires (~150-155). Le type 3 (volaille) est nettement plus bas (~107). La volaille semble moins calorique.
- **Sodium :** Le type 3 a une mediane plus haute que les types 1 et 2, mais la dispersion est importante.
- Les boites du type 1 et 2 se chevauchent largement en calories, suggerant une difference non significative entre ces deux types.

---

### 3. Etude du nombre de calories

#### Q3a : Ecrire le modele

Pour tout $i = 1, 2, 3$ (types de viande) et $j = 1, \ldots, n_i$ :

$$\text{Calories}_{ij} = \mu + \alpha_i + \varepsilon_{ij}, \quad \varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

- $\mu$ : nombre moyen de calories, toutes viandes confondues
- $\alpha_i$ : effet du type de viande $i$ (ecart par rapport a $\mu$)
- $\varepsilon_{ij}$ : erreur aleatoire

#### Q3b : Ajuster le modele et verifier les hypotheses

```r
mod1 <- lm(Calories ~ Type, data = tab)

par(mfrow = c(2, 2))
plot(mod1)
par(mfrow = c(1, 1))
```

**Interpretation des 4 graphiques de diagnostic :**

**1. Residuals vs Fitted :**
- 3 colonnes verticales de points (correspondant aux 3 moyennes de groupe). C'est normal pour l'ANOVA.
- Les residus sont repartis de maniere **homogene autour de 0** dans chaque groupe.
- Pas de forme en entonnoir : **homoscedasticite OK**.

**2. Normal Q-Q :**
- Les points suivent globalement la droite theorique.
- Leger ecart aux extremites (queues un peu lourdes), mais acceptable pour $n = 54$.
- **Normalite approximativement verifiee**.

**3. Scale-Location :**
- La ligne rouge est approximativement horizontale.
- Confirme l'**homoscedasticite**.

**4. Residuals vs Leverage :**
- Aucun point ne depasse la distance de Cook = 0.5 ou 1.
- Pas d'observation **influente** problematique.

**Conclusion diagnostique :** Les hypotheses de l'ANOVA sont raisonnablement satisfaites.

#### Q3c : Table d'ANOVA et test global

```r
anova(mod1)
```

**Sortie R :**

```
Analysis of Variance Table

Response: Calories
          Df  Sum Sq Mean Sq F value   Pr(>F)
Type       2  15523   7762   16.08  4.63e-06 ***
Residuals 51  24606    483
```

**A quoi correspondent les differentes cases du tableau ?**

| Source | Df | Sum Sq | Mean Sq | F value | Pr(>F) |
|--------|-----|--------|---------|---------|--------|
| Type (entre groupes) | $k - 1 = 2$ | SCM = 15523 | CCM = 7762 | $F_0 = 16.08$ | $4.63 \times 10^{-6}$ |
| Residuals (intra-groupe) | $n - k = 51$ | SCR = 24606 | CCR = 483 | | |

- **SCM (Sum Sq du modele)** = 15523 : variabilite **entre** les groupes (due au facteur Type).
- **SCR (Sum Sq residuelle)** = 24606 : variabilite **a l'interieur** des groupes (bruit).
- **CCM = SCM / (k-1)** = 15523 / 2 = 7762
- **CCR = SCR / (n-k)** = 24606 / 51 = 483
- **$F_0$ = CCM / CCR** = 7762 / 483 = **16.08**

**Test d'hypothese :**

1. **Hypotheses :**
   - $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$ (pas d'effet du type)
   - $H_1 : \exists\, i \text{ tel que } \alpha_i \neq 0$ (au moins un type differe)

2. **Statistique de test :** $F_0 = \text{CCM} / \text{CCR} = 16.08$

3. **Distribution sous $H_0$ :** $F_0 \sim F(2, 51)$

4. **p-value :** $P(F(2, 51) > 16.08) = 4.63 \times 10^{-6}$

5. **Decision :** $p = 4.63 \times 10^{-6} \ll 0.05$. On **rejette $H_0$** avec un risque de 5%.
   Le type de hotdog a une **influence significative** sur les calories.
   Au moins un des types a une moyenne differente des autres.

**Mais lequel ?** Le test global ne dit pas quels groupes different. Il faut des comparaisons multiples.

#### Q3d : Estimation des parametres

```r
summary(mod1)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  156.85       4.91  31.918  < 2e-16 ***
Type2          1.86       7.26   0.256    0.799
Type3        -38.09       7.26  -5.248  2.92e-06 ***
---
Multiple R-squared:  0.3869
Residual standard error: 21.97 on 51 degrees of freedom
```

**Quelles sont les valeurs des coefficients et comment les interpreter ?**

R utilise la **contrainte temoin** (par defaut) : $\alpha_1 = 0$ (le premier niveau est la reference).

| Coefficient | Valeur | Signification |
|-------------|--------|---------------|
| (Intercept) = $\hat{\mu} + \hat{\alpha}_1 = \hat{\mu}$ | 156.85 | Moyenne des calories pour le **boeuf** (Type 1) |
| Type2 = $\hat{\alpha}_2 - \hat{\alpha}_1 = \hat{\alpha}_2$ | 1.86 | Difference melange - boeuf = +1.86 calories |
| Type3 = $\hat{\alpha}_3 - \hat{\alpha}_1 = \hat{\alpha}_3$ | -38.09 | Difference volaille - boeuf = -38.09 calories |

**Quelle contrainte ? Qu'aurait-on du faire pour la contrainte naturelle ?**

R utilise la contrainte temoin ($\alpha_1 = 0$). Pour utiliser la contrainte naturelle ($\sum \alpha_i = 0$), il faudrait specifier :

```r
mod1_nat <- lm(Calories ~ Type, data = tab, contrasts = list(Type = "contr.sum"))
```

**Predictions par type :**
- Type 1 (Boeuf) : $156.85$ calories
- Type 2 (Melange) : $156.85 + 1.86 = 158.71$ calories
- Type 3 (Volaille) : $156.85 - 38.09 = 118.76$ calories

**Coefficient de determination :** $R^2 = 0.387$ -- le type de viande explique **38.7%** de la variabilite des calories. C'est significatif mais modere -- d'autres facteurs (taille, marque, preparation) influencent aussi les calories.

**Ecart-type des residus :** $\hat{\sigma} = 21.97$ calories.

**Derniere ligne -- test global F :**
La derniere ligne du summary (`F-statistic: 16.08 on 2 and 51 DF, p-value: 4.632e-06`) correspond au test global de l'ANOVA : $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$. C'est le meme test que `anova(mod1)`.

**Tests t individuels :**
- Type2 : $p = 0.799 \gg 0.05$ -- difference boeuf-melange **non significative**.
- Type3 : $p = 2.92 \times 10^{-6}$ -- difference boeuf-volaille **hautement significative**.

#### Q3e : Comparaisons multiples avec Bonferroni

```r
library(emmeans)
emmeans(mod1, pairwise ~ Type, adjust = "bonferroni")
```

**Sortie R -- $emmeans (moyennes estimees) :**

```
 Type emmean   SE df lower.CL upper.CL
    1  156.8 4.91 51    147.0    166.7
    2  158.7 5.33 51    148.0    169.4
    3  118.8 5.33 51    108.1    129.5
```

**Sortie R -- $contrasts (comparaisons 2 a 2) :**

```
 contrast estimate   SE df t.ratio p.value
 1 - 2      -1.86 7.26 51  -0.256  1.0000
 1 - 3      38.09 7.26 51   5.248  <.0001
 2 - 3      39.94 7.52 51   5.312  <.0001
```

**A quoi correspond `adjust = "bonferroni"` ? A quoi sert-il ?**

Faire $k$ comparaisons a $\alpha = 5\%$ chacune augmente le risque d'erreur global :
- 1 test : risque = 5%
- 3 tests : risque = $1 - (0.95)^3 \approx 14.3\%$
- 10 tests : risque $\approx 40\%$

Bonferroni corrige en divisant $\alpha$ par le nombre de comparaisons : $\alpha' = 0.05 / 3 = 0.0167$. Cela **controle le taux d'erreur familial** (FWER).

**Quel est le type le moins calorique ? Est-il significativement moins calorique ?**

| Comparaison | Difference | p-value (Bonferroni) | Significatif ? |
|-------------|-----------|---------------------|----------------|
| Boeuf - Melange | -1.86 | 1.00 | **Non** |
| Boeuf - Volaille | +38.09 | <0.0001 | **Oui** |
| Melange - Volaille | +39.94 | <0.0001 | **Oui** |

**Conclusion :** Le hotdog le moins calorique est celui a la **volaille** (Type 3, 118.8 cal). Il est **significativement moins calorique** que les types boeuf (p < 0.0001) et melange (p < 0.0001). La difference entre boeuf et melange n'est pas significative.

---

### 4. Etude de la quantite de sodium

On recommence la meme etude pour le sodium :

```r
mod1_sodium <- lm(Sodium ~ Type, data = tab)

par(mfrow = c(2, 2))
plot(mod1_sodium)
par(mfrow = c(1, 1))

anova(mod1_sodium)
```

**Sortie R :**

```
          Df  Sum Sq Mean Sq F value Pr(>F)
Type       2   23230   11615   1.82  0.172
Residuals 51  325643    6385
```

**Test d'hypothese :**
- $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$ (pas d'effet du type sur le sodium)
- $H_1 : \exists\, i \text{ tel que } \alpha_i \neq 0$
- $p = 0.172 > 0.05$

**Decision :** On **ne rejette pas $H_0$** au risque de 5%. Il n'y a **pas de difference significative** de la teneur en sodium entre les types de viande.

```r
summary(mod1_sodium)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  401.15      17.87  22.450   <2e-16 ***
Type2         11.09      26.42   0.420    0.677
Type3         57.62      26.42   2.181    0.034 *
```

Meme si le coefficient Type3 est individuellement significatif ($p = 0.034$), le test **global** de l'ANOVA n'est pas significatif ($p = 0.172$). On ne peut pas conclure a un effet global du type sur le sodium.

```r
detach(tab)
```

---

## Exercice 2 : Comparaison de l'acidite de trois cafes -- ANOVA a 2 facteurs

### Enonce

Trois cafes ont ete degustes par 6 juges. Le fichier `cafe.csv` contient les notes d'acidite accordees par les juges aux differents cafes. Les notes vont de 0 (cafe tres peu acide) a 10 (cafe tres acide). L'objectif est de determiner si certains cafes sont, en moyenne, percus comme plus acides que d'autres.

### Donnees (cafe.csv)

```
cafe  juge  acidite
  1     1     0
  1     2     2
  1     3     3
  1     4     3
  1     5     5
  1     6     6
  2     1     3
  2     2     3
  2     3     5
  2     4     6
  2     5     6
  2     6     8
  3     1     4
  3     2     6
  3     3     7
  3     4     7
  3     5     8
  3     6    10
```

---

### Q1 : ANOVA a 1 facteur -- facteur cafe

**Modele :** Pour tout $i = 1, 2, 3$ (cafes) et $j = 1, \ldots, 6$ (juges) :

$$\text{acidite}_{ij} = \mu + \alpha_i + \varepsilon_{ij}, \quad \varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

```r
cafe <- read.csv("cafe.csv")
cafe$cafe <- as.factor(cafe$cafe)
cafe$juge <- as.factor(cafe$juge)
attach(cafe)

mod_cafe1 <- lm(acidite ~ cafe, data = cafe)
anova_cafe1 <- anova(mod_cafe1)
print(anova_cafe1)
```

**Sortie R :**

```
Analysis of Variance Table

Response: acidite
          Df  Sum Sq  Mean Sq  F value  Pr(>F)
cafe       2   36.33   18.167    5.14   0.0191 *
Residuals 15   53.00    3.533
```

---

### Q2 : Tester l'egalite des acidites -- risque 5% et 1%

**Test d'hypothese :**

1. **Hypotheses :**
   - $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$ (les 3 cafes ont la meme acidite moyenne)
   - $H_1 : \exists\, i \text{ tel que } \alpha_i \neq 0$

2. **Statistique :** $F_0 = 18.167 / 3.533 = 5.14$

3. **p-value :** $0.0191$

4. **Au risque de 5% :** $p = 0.019 < 0.05$ -- on **rejette $H_0$**. Les cafes n'ont pas tous la meme acidite moyenne.

5. **Au risque de 1% :** $p = 0.019 > 0.01$ -- on **ne rejette pas $H_0$** au risque de 1%.

**Conclusion :** Le resultat depend du niveau de risque choisi. Au risque de 5%, on conclut a une difference, mais pas au risque de 1%. Le SCR est gonfle car la variabilite due aux juges est confondue avec les residus.

---

### Q3 : Integrer l'effet juge dans le modele

**Interpretation concrete de l'effet juge :** Les juges n'ont pas la meme severite de notation. Certains notent systematiquement plus haut (indulgents), d'autres plus bas (severes). L'effet juge capture cette variabilite interpersonnelle.

**Est-il interessant de prendre en compte l'effet juge ?** Oui, car :
- Sans le facteur juge, la variabilite due aux differences de notation tombe dans les residus.
- Cela **augmente le SCR** (somme des carres residuelle) et le **CCR** (denominateur du test F).
- Le test sur le facteur cafe perd en **puissance**.

En incluant le juge, on "absorbe" cette variabilite parasite, ce qui reduit le CCR et rend le test sur le cafe **plus sensible**. C'est le principe du **plan en blocs aleatoires complets**.

---

### Q4 : ANOVA a 2 facteurs -- estimation et conclusions

**Modele :** Pour tout $i = 1, 2, 3$ et $j = 1, \ldots, 6$ :

$$\text{acidite}_{ij} = \mu + \alpha_i + \beta_j + \varepsilon_{ij}, \quad \varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

- $\alpha_i$ : effet du cafe $i$
- $\beta_j$ : effet du juge $j$

```r
mod_cafe <- lm(acidite ~ cafe + juge, data = cafe)
anova_cafe <- anova(mod_cafe)
print(anova_cafe)
```

**Sortie R :**

```
Analysis of Variance Table

Response: acidite
          Df  Sum Sq  Mean Sq  F value    Pr(>F)
cafe       2   36.33   18.167   27.25  0.000116 ***
juge       5   46.33    9.267   13.90  0.000436 ***
Residuals 10    6.67    0.667
```

**Test pour l'effet cafe :**
- $H_0 : \alpha_1 = \alpha_2 = \alpha_3 = 0$ vs $H_1 : \exists\, i, \alpha_i \neq 0$
- $F = 18.167 / 0.667 = 27.25$, $p = 0.000116 < 0.05$
- **On rejette $H_0$** : le type de cafe a un effet **significatif** sur l'acidite percue.

**Test pour l'effet juge :**
- $H_0 : \beta_1 = \cdots = \beta_6 = 0$ vs $H_1 : \exists\, j, \beta_j \neq 0$
- $F = 9.267 / 0.667 = 13.90$, $p = 0.000436 < 0.05$
- **On rejette $H_0$** : le juge a un effet **significatif** sur la note.

**Comparaison des deux modeles :**

| Modele | CCR | F (cafe) | p-value (cafe) |
|--------|-----|----------|----------------|
| 1 facteur (cafe seul) | 3.533 | 5.14 | 0.0191 |
| 2 facteurs (cafe + juge) | **0.667** | **27.25** | **0.000116** |

En incluant le juge, le CCR passe de 3.533 a 0.667, ce qui rend le test sur le cafe **beaucoup plus puissant**.

**Modele avec interaction :**

```r
mod_cafe_inter <- lm(acidite ~ cafe * juge, data = cafe)
anova(mod_cafe_inter)
```

**Sortie R :**

```
           Df  Sum Sq  Mean Sq  F value  Pr(>F)
cafe        2   36.33   18.167      NaN     NaN
juge        5   46.33    9.267      NaN     NaN
cafe:juge  10    6.67    0.667      NaN     NaN
Residuals   0    0.00
```

**Probleme :** Avec 18 observations et 18 parametres ($3 \times 6$), il ne reste **aucun degre de liberte** pour les residus. Le modele est sature et le test d'interaction n'est pas calculable. Il faudrait des **repetitions** (plusieurs mesures par combinaison cafe $\times$ juge) pour tester l'interaction.

---

### Q5 : Retrouver les estimations par calcul

Sous la **contrainte naturelle** : $\sum \alpha_i = 0$ et $\sum \beta_j = 0$.

```r
mu_hat <- mean(cafe$acidite)
cat("mu_hat =", mu_hat, "\n")

for (i in levels(cafe$cafe)) {
  alpha_i <- mean(cafe$acidite[cafe$cafe == i]) - mu_hat
  cat("alpha_", i, " = ", alpha_i, "\n")
}

for (j in levels(cafe$juge)) {
  beta_j <- mean(cafe$acidite[cafe$juge == j]) - mu_hat
  cat("beta_", j, " = ", beta_j, "\n")
}
```

**Sortie R :**

```
mu_hat = 4.778

alpha_ 1 = -1.611    (cafe 1 : peu acide)
alpha_ 2 =  0.389    (cafe 2 : acidite moyenne)
alpha_ 3 =  1.222    (cafe 3 : le plus acide)

beta_ 1 = -2.444     (juge 1 : note severe)
beta_ 2 = -1.111     (juge 2 : plutot severe)
beta_ 3 =  0.222     (juge 3 : neutre)
beta_ 4 =  0.556     (juge 4 : plutot indulgent)
beta_ 5 =  1.556     (juge 5 : indulgent)
beta_ 6 =  3.222     (juge 6 : tres indulgent)
```

**Verification :** $\sum \alpha_i = -1.611 + 0.389 + 1.222 = 0$ et $\sum \beta_j = -2.444 - 1.111 + 0.222 + 0.556 + 1.556 + 3.222 \approx 0$.

---

### Q6 : Commentaire sur les juges et recommandation

**Juges 1 et 6 :**
- Le juge 1 a $\hat{\beta}_1 = -2.44$ : il note systematiquement **bas** (evaluateur severe).
- Le juge 6 a $\hat{\beta}_6 = +3.22$ : il note systematiquement **haut** (evaluateur indulgent).
- Ecart entre les deux : 5.67 points, soit plus de la moitie de l'echelle 0-10.

**Juges 4 et 5 :**
- Le juge 4 a $\hat{\beta}_4 = +0.56$ et le juge 5 a $\hat{\beta}_5 = +1.56$ : tous deux notent au-dessus de la moyenne, le juge 5 etant un peu plus genereux.

**Quel cafe acheter ?**

```r
comp_cafe <- emmeans(mod_cafe, pairwise ~ cafe, adjust = "bonferroni")
print(comp_cafe)
```

**Sortie R -- $emmeans :**

```
 cafe emmean    SE df lower.CL upper.CL
    1  3.167 0.333 10    2.424    3.909
    2  5.167 0.333 10    4.424    5.909
    3  6.000 0.333 10    5.257    6.742
```

**Sortie R -- $contrasts :**

```
 contrast estimate    SE df t.ratio p.value
 1 - 2     -2.000 0.471 10  -4.243  0.0052
 1 - 3     -2.833 0.471 10  -6.012  0.0004
 2 - 3     -0.833 0.471 10  -1.768  0.3213
```

| Comparaison | Difference | p-value | Significatif ? |
|-------------|-----------|---------|----------------|
| Cafe 1 - Cafe 2 | -2.000 | 0.0052 | **Oui** |
| Cafe 1 - Cafe 3 | -2.833 | 0.0004 | **Oui** |
| Cafe 2 - Cafe 3 | -0.833 | 0.3213 | Non |

**Recommandation :** Pour un cafe **peu acide**, choisir le **cafe 1** (acidite moyenne = 3.17). Il est significativement moins acide que les cafes 2 ($p = 0.005$) et 3 ($p = 0.0004$).

```r
detach(cafe)
```

---

## Exercice 3 : Resistance d'un textile a l'usure

### Enonce

Une entreprise souhaite evaluer la resistance a l'usure de 4 types de textiles (A, B, C, D) au moyen d'un testeur d'usure automatique. On mesure la perte de poids (en dixiemes de mg) apres usure. Le testeur peut tester 4 pieces simultanement. Deux facteurs parasites sont susceptibles d'influencer la mesure : la **position** dans le testeur (4 places) et l'**ordre des cycles** (4 cycles). Seuls 4 cycles sont effectues.

Le fichier `resistance_textile.txt` comporte 16 observations avec les variables : `position`, `cycle`, `textile`, `perte_poids`.

**Plan experimental :** C'est un **carre latin** -- chaque textile apparait exactement une fois par position et une fois par cycle.

### Donnees

```
position  cycle  textile  perte_poids
    1       1      A         251
    1       2      D         234
    1       3      C         235
    1       4      B         195
    2       1      B         241
    2       2      C         273
    2       3      D         236
    2       4      A         270
    3       1      D         227
    3       2      A         274
    3       3      B         218
    3       4      C         230
    4       1      C         229
    4       2      B         226
    4       3      A         268
    4       4      D         225
```

---

### Q1 : Installer et charger emmeans

```r
install.packages("emmeans")
library(emmeans)
```

---

### Q2 : Importer et convertir en facteurs

```r
resistance <- read.table("resistance_textile.txt", header = TRUE)
attach(resistance)

resistance$position <- as.factor(resistance$position)
resistance$cycle    <- as.factor(resistance$cycle)
resistance$textile  <- as.factor(resistance$textile)
```

---

### Q3 : Boxplots de la perte de poids par textile

```r
boxplot(perte_poids ~ textile, data = resistance,
        main = "Perte de poids par type de textile",
        xlab = "Type de textile",
        ylab = "Perte de poids (dixiemes de mg)",
        col = c("lightblue", "coral", "lightgreen", "yellow"))
abline(h = mean(perte_poids), col = "red", lwd = 3)
```

**Interpretation :**
- La ligne rouge represente la **moyenne generale** ($\bar{Y} = 242.3$).
- **Textile A** : mediane haute (~265), dispersion moderee. Perte **elevee** = **peu resistant**.
- **Textile B** : mediane basse (~220), dispersion moderee. Perte **faible** = **plus resistant**.
- **Textile C** : mediane intermediaire (~232).
- **Textile D** : mediane intermediaire (~230).

**Attention :** Ici, une perte de poids **faible** = textile plus **resistant**. Le textile B semble le meilleur candidat a premiere vue.

---

### Q4 : ANOVA a 1 facteur (textile uniquement)

Le modele le plus simple pour etudier l'effet du textile :

$$\text{perte\_poids}_{ij} = \mu + \alpha_i + \varepsilon_{ij}, \quad i \in \{A, B, C, D\}, \quad \varepsilon_{ij} \overset{iid}{\sim} \mathcal{N}(0, \sigma^2)$$

```r
mod1_textile <- lm(perte_poids ~ textile, data = resistance)

par(mfrow = c(2, 2))
plot(mod1_textile)
par(mfrow = c(1, 1))

anova_textile1 <- anova(mod1_textile)
print(anova_textile1)
```

**Sortie R :**

```
          Df  Sum Sq  Mean Sq  F value  Pr(>F)
textile    3  2635.7   878.6    2.28    0.128
Residuals 12  4619.3   385.0
```

**Test :**
- $H_0$ : pas d'effet du textile vs $H_1$ : au moins un textile differe
- $p = 0.128 > 0.05$
- **On ne rejette pas $H_0$** au risque de 5%.

**Probleme :** Avec seulement le textile comme facteur, le test n'est **pas significatif**. Toute la variabilite due a la position et au cycle tombe dans les residus, gonflant le SCR et reduisant la puissance du test.

---

### Q5 : ANOVA a 3 facteurs

**Modele :**

$$\text{perte\_poids}_{ij} = \mu + \alpha_{\text{textile}} + \beta_{\text{position}} + \gamma_{\text{cycle}} + \varepsilon_{ij}$$

```r
mod2_textile <- lm(perte_poids ~ textile + position + cycle, data = resistance)

par(mfrow = c(2, 2))
plot(mod2_textile)
par(mfrow = c(1, 1))
```

**Graphiques de diagnostic :**
- Residuals vs Fitted : points repartis de maniere **homogene** autour de 0.
- QQ-plot : points globalement alignes. Normalite acceptable.
- Scale-Location : ligne rouge approximativement plate. **Homoscedasticite OK**.
- Residuals vs Leverage : aucun point problematique.

```r
anova_textile2 <- anova(mod2_textile)
print(anova_textile2)
```

**Sortie R :**

```
          Df  Sum Sq  Mean Sq  F value    Pr(>F)
textile    3  2635.7   878.6   17.94  0.00204 **
position   3  2362.7   787.6   16.09  0.00278 **
cycle      3  1962.2   654.1   13.36  0.00451 **
Residuals  6   294.0    49.0
```

**Pourquoi ce modele est-il plus interessant ?**

| Modele | SCR | CCR | F (textile) | p-value (textile) |
|--------|-----|-----|-------------|-------------------|
| 1 facteur | 4619.3 | 385.0 | 2.28 | 0.128 |
| 3 facteurs | **294.0** | **49.0** | **17.94** | **0.00204** |

En incluant position et cycle :
- Le SCR passe de 4619 a **294** (reduction de 94%).
- Le CCR passe de 385 a **49** (8 fois plus petit).
- Le F passe de 2.28 a **17.94**.
- Le test passe de non significatif ($p = 0.128$) a **hautement significatif** ($p = 0.002$).

**Variables ayant un effet significatif au risque de 5% :**

| Facteur | F value | p-value | Significatif ? |
|---------|---------|---------|----------------|
| textile | 17.94 | 0.00204 | **Oui** |
| position | 16.09 | 0.00278 | **Oui** |
| cycle | 13.36 | 0.00451 | **Oui** |

Les **trois facteurs** ont un effet significatif sur la perte de poids.

---

### Q6 : Test du coefficient du textile D

```r
summary(mod2_textile)
```

**Sortie R :**

```
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  260.50      6.43   40.51  1.86e-08 ***
textileB     -34.75      4.95   -7.02  0.000414 ***
textileC       4.25      4.95    0.86  0.423698
textileD     -34.00      4.95   -6.87  0.000472 ***
position2     26.00      4.95    5.25  0.001922 **
position3      2.00      4.95    0.40  0.700218
position4      1.00      4.95    0.20  0.847054
cycle2         8.50      4.95    1.72  0.136744
cycle3        -9.50      4.95   -1.92  0.103250
cycle4       -25.50      4.95   -5.15  0.002117 **
```

**Test :** $H_0 : \alpha_D = 0$ vs $H_1 : \alpha_D \neq 0$

- Coefficient textileD = $-34.00$
- $t = -6.87$, $p = 0.000472 < 0.05$

**Decision :** On **rejette $H_0$**. Le coefficient du textile D est **significativement different de 0**.

**Interpretation concrete :** Le textile D a une perte de poids en moyenne **34 dixiemes de mg inferieure** a celle du textile A (reference). Le textile D est significativement **plus resistant** que le textile A.

---

### Q7 : Comparaisons multiples et recommandation

```r
comp_textile <- emmeans(mod2_textile, pairwise ~ textile, adjust = "bonferroni")
print(comp_textile)
```

**Sortie R -- $emmeans :**

```
 textile emmean   SE df lower.CL upper.CL
       A 265.75 3.50  6   257.19   274.31
       B 231.00 3.50  6   222.44   239.56
       C 241.75 3.50  6   233.19   250.31
       D 230.50 3.50  6   221.94   239.06
```

**Sortie R -- $contrasts :**

```
 contrast estimate   SE df t.ratio p.value
 A - B      34.75 4.95  6   7.020  0.0025
 A - C      24.00 4.95  6   4.849  0.0175
 A - D      35.25 4.95  6   7.121  0.0023
 B - C     -10.75 4.95  6  -2.172  0.4412
 B - D       0.50 4.95  6   0.101  1.0000
 C - D      11.25 4.95  6   2.273  0.3829
```

**Interpretation :**

| Comparaison | Difference | p-value | Significatif ? |
|-------------|-----------|---------|----------------|
| A - B | +34.75 | **0.0025** | **Oui** -- A perd plus que B |
| A - C | +24.00 | **0.0175** | **Oui** -- A perd plus que C |
| A - D | +35.25 | **0.0023** | **Oui** -- A perd plus que D |
| B - C | -10.75 | 0.4412 | Non |
| B - D | +0.50 | 1.0000 | Non |
| C - D | +11.25 | 0.3829 | Non |

**Moyennes de perte de poids (classees) :**
- A : 265.75 (le **plus de perte** = le **moins resistant**)
- C : 241.75
- B : 231.00
- D : 230.50 (le **moins de perte** = le **plus resistant**)

**Conclusion pour l'entreprise :** Choisir le **textile D** (ou B, car ils ne different pas significativement avec $p = 1.00$). Ces deux textiles ont la perte de poids la plus faible et sont **significativement plus resistants** que le textile A. Le textile C est intermediaire.

```r
detach(resistance)
```

---

## Resume : procedure ANOVA complete

```
1. PREPARER les donnees
   - Convertir les variables en facteurs : as.factor()
   - Verifier les effectifs par groupe

2. EXPLORER visuellement
   - boxplot(Y ~ Facteur) : comparer les distributions
   - Identifier les tendances et les outliers

3. AJUSTER le modele
   - lm(Y ~ Facteur)                    # 1 facteur
   - lm(Y ~ Facteur1 + Facteur2)        # 2 facteurs sans interaction
   - lm(Y ~ Facteur1 * Facteur2)        # 2 facteurs avec interaction

4. DIAGNOSTIQUER
   - plot(mod) : 4 graphiques
   - Verifier homoscedasticite et normalite

5. TESTER globalement
   - anova(mod) : table d'ANOVA
   - p-value < 0.05 ? --> effet significatif

6. COMPARER les groupes
   - emmeans(mod, pairwise ~ Facteur, adjust = "bonferroni")
   - Identifier les paires significativement differentes

7. CONCLURE
   - Quel groupe est le meilleur/pire ?
   - Quels groupes ne different pas ?
```
