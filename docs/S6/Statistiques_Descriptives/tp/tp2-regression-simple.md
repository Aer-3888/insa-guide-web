---
title: "TP2: Régression linéaire simple"
sidebar_position: 2
---

# TP2: Régression linéaire simple

## Objectifs

Maîtriser la régression linéaire simple et sa validation:
- Ajuster un modèle linéaire avec `lm()`
- Analyser les résidus pour valider les hypothèses
- Interpréter le coefficient de détermination R²
- Calculer des prédictions et intervalles de confiance
- Détecter les problèmes et appliquer des transformations

## Structure

```
TP2/
├── README.md                    # Ce fichier
├── Sujet TP2.pdf               # Énoncé officiel
├── TP 2 ex 2 correction.pdf    # Correction de l'exercice 2
├── src/
│   └── TP2_solutions.R         # Solutions commentées et nettoyées
├── TP2_Donnees/                # Jeux de données
│   ├── Courrier.txt
│   ├── tomassone.txt
│   ├── freinage.txt
│   └── porcs.csv
└── (fichiers originaux)        # Déplacés vers _originals/
```

## Modèle linéaire simple

**Équation:** Y = β₀ + β₁X + ε  
où ε ~ N(0, σ²) (erreurs indépendantes, identiquement distribuées)

**Estimation:** méthode des moindres carrés  
**Syntaxe R:** `lm(Y ~ X, data=df)`

## Exercices

### Exercice 1: Courrier (régression parfaite)
Modéliser le nombre de lettres en fonction du poids du courrier.

**Étapes:**
1. Représentation graphique (scatter plot)
2. Ajustement du modèle linéaire
3. Tracer la droite de régression
4. Calculer R² (coefficient de détermination)
5. Analyser les résidus
6. Tester la significativité de β₁
7. Faire une prédiction ponctuelle
8. Calculer un intervalle de prédiction
9. Visualiser les intervalles de prédiction

**Résultat:** R² = 0.963 → modèle excellent, hypothèses validées

**Concepts clés:**
- `attach()` pour utiliser directement les noms de colonnes
- `summary(reg)` pour les statistiques du modèle
- `predict()` avec `interval="prediction"` pour les intervalles
- Graphe des résidus: valeurs ajustées vs résidus

### Exercice 2: Le quatuor d'Anscombe (pièges de la régression)
Analyser 4 jeux de données avec les mêmes statistiques mais des relations très différentes.

**Données:** `tomassone.txt` contient X et Y1, Y2, Y3, Y4

#### Y1: Cas idéal
- Relation linéaire claire
- Résidus uniformément répartis
- Modèle linéaire approprié ✓

#### Y2: Non-linéarité
- Tendance parabolique visible
- R² = 0.62 (faible)
- Résidus non uniformes → structure parabolique

**Solution:** Ajouter X² comme variable explicative
```r
X2 <- X^2
reg_poly <- lm(Y2 ~ X + X2)
```

#### Y3: Valeur aberrante (outlier)
- Une observation influence fortement le modèle
- Point 16 s'écarte de plus de 2σ

**Solution:** Identifier et supprimer l'outlier
```r
data_clean <- data[-16, ]
reg_clean <- lm(Y3 ~ X, data=data_clean)
```

#### Y4: Transformation nécessaire
- Résidus non uniformes (allure sinusoïdale)
- Transformation logarithmique + polynomiale nécessaire

**Solution:**
```r
reg_log <- lm(log(Y4) ~ X + X2)
```

**Message clé:** Ne jamais se fier uniquement aux statistiques (R², p-value).  
Toujours visualiser les données et analyser les résidus !

### Exercice 3: Distance de freinage
Modéliser la distance d'arrêt en fonction de la vitesse du véhicule.

**Variables:**
- Y: Distance d'arrêt (m)
- X: Vitesse (km/h)

**Workflow:**
1. Régression linéaire simple
   - R² = 0.98 → très bon
   - p-value < 0.05 → influence significative
2. Analyse des résidus → allure parabolique
3. Amélioration: ajouter Vitesse²
   - Résidus aléatoires et homoscédastiques ✓
4. Prédiction pour 85 km/h
   - Distance totale = distance de freinage + distance de réaction
   - Distance de réaction = vitesse × 2 secondes

**Conversion:** 85 km/h = 85/3.6 = 23.6 m/s

### Exercice 4: Gain en protéines (porcs)
Modéliser le gain journalier en protéines en fonction de l'ingestion.

**Variables:**
- Y: gain (g de protéines/jour)
- X: ingestion (quantité ingérée/jour)

**Workflow:**
1. Régression simple
   - R² = 0.63 (moyen)
   - Résidus paraboliques
2. Amélioration avec X²
3. **Modèle avec seuil** (Q6):
   - Hypothèse: gain augmente jusqu'à ingestion=28, puis plafonne
   - Régression sur données où ingestion ≤ 28
   - Valeur constante pour ingestion > 28

**Concepts clés:**
- Modèles segmentés (piecewise)
- Contraintes de continuité
- Plafonnement d'une réponse biologique

## Validation du modèle linéaire

### Hypothèses à vérifier

1. **Linéarité:** relation linéaire entre X et Y
   - Vérification: scatter plot
2. **Indépendance:** erreurs indépendantes
   - Hypothèse raisonnable si échantillonnage aléatoire
3. **Homoscédasticité:** variance constante des erreurs
   - Vérification: graphe des résidus (forme rectangulaire)
4. **Normalité:** erreurs ~ N(0, σ²)
   - Vérification: Q-Q plot

### Graphe des résidus

**Interpré tation:**
- **Bon modèle:** points répartis aléatoirement autour de 0, dans une bande horizontale
- **Problèmes:**
  - Forme parabolique → ajouter X²
  - Forme en entonnoir → hétéroscédasticité → transformation log
  - Points isolés → outliers → vérifier/supprimer
  - Structure systématique → variable manquante

**Seuils:** ±2σ (95% des résidus doivent être dans cet intervalle)

## Coefficient de détermination (R²)

**Formule:** R² = SCE/SCT = 1 - SCR/SCT

**Interprétation:**
- 0 ≤ R² ≤ 1
- R² = 0.80 → 80% de la variabilité de Y est expliquée par X
- R² élevé ne garantit pas un bon modèle !

**Règles empiriques:**
- R² > 0.9: excellent
- 0.7 < R² < 0.9: bon
- 0.5 < R² < 0.7: moyen
- R² < 0.5: faible (modèle peu prédictif)

## Prédiction

### Prédiction ponctuelle
```r
predict(reg, data.frame(X=27.5))
```

### Intervalle de prédiction (95%)
```r
predict(reg, data.frame(X=27.5), interval="prediction")
```

**Différence:**
- **Intervalle de confiance:** pour la moyenne de Y|X
- **Intervalle de prédiction:** pour une nouvelle observation Y (plus large)

## Commandes essentielles

```r
# Régression
reg <- lm(Y ~ X, data=df)
summary(reg)                    # Statistiques complètes
coef(reg)                       # Coefficients β₀, β₁
residuals(reg)                  # Résidus
fitted.values(reg)              # Valeurs ajustées

# Visualisation
plot(X, Y)
abline(reg)                     # Ajouter la droite
plot(reg$fitted, reg$residuals) # Graphe des résidus

# Prédiction
predict(reg, newdata, interval="prediction")

# Transformation
reg_log <- lm(log(Y) ~ X)
reg_poly <- lm(Y ~ X + I(X^2))  # I() pour calculs dans la formule
```

## Pièges à éviter

1. **Ne pas vérifier les résidus:** un R² élevé ne suffit pas
2. **Ignorer les outliers:** une seule valeur peut tout changer
3. **Extrapoler hors du domaine:** dangereux
4. **Causalité ≠ corrélation:** une relation statistique n'implique pas un lien de cause à effet

## Ressources

- `?lm` pour la documentation
- `?predict.lm` pour les options de prédiction
- Package `car` pour des outils diagnostiques avancés
