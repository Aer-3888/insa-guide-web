---
title: "TP2 : Classification Hierarchique (CAH-MIXTE) apres ACP - Solution"
sidebar_position: 2
---

# TP2 : Classification Hierarchique (CAH-MIXTE) apres ACP - Solution

> Conforme aux instructions de l'enseignant dans : `S5/ADFD/data/moodle/tp/tp2/README.md`

**Technique** : Classification Ascendante Hierarchique (CAH) appliquee apres ACP sur les composantes principales, selon la methodologie CAH-MIXTE.

**Objectif** : Regrouper les villes francaises en clusters aux profils climatiques homogenes, en utilisant les composantes principales issues de l'ACP comme variables d'entree.

**Jeu de donnees** : Temperatures mensuelles moyennes (12 mois) pour 15 villes francaises.

---

## Exercice 1 : Realisation de l'ACP normee

### Standardiser les 12 variables (temperatures mensuelles), calculer les composantes principales, conserver les 2 premieres composantes.

**Reponse :**
```python noexec
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from scipy.cluster.hierarchy import dendrogram, linkage, fcluster
from scipy.spatial.distance import cdist
from sklearn.metrics import silhouette_score, davies_bouldin_score

# Donnees : 15 villes francaises, 12 mois de temperatures moyennes
cities = ['Bordeaux', 'Brest', 'Clermont-Ferrand', 'Grenoble', 'Lille',
          'Lyon', 'Marseille', 'Montpellier', 'Nantes', 'Nice',
          'Paris', 'Rennes', 'Strasbourg', 'Toulouse', 'Vichy']

data = pd.DataFrame({
    'Janvier': [6.2, 7.2, 3.7, 3.1, 4.0, 4.2, 7.1, 7.3, 5.9, 8.7, 4.7, 6.0, 1.9, 6.1, 3.8],
    'Fevrier': [7.5, 7.6, 5.1, 4.8, 4.8, 5.9, 8.3, 8.5, 6.8, 9.3, 5.8, 6.7, 3.7, 7.6, 5.2],
    'Mars':    [10.2, 9.4, 8.0, 8.3, 7.8, 9.5, 11.4, 11.3, 9.2, 11.5, 9.1, 9.0, 7.8, 10.4, 8.3],
    'Avril':   [12.6, 10.8, 10.6, 11.2, 10.1, 12.6, 14.1, 13.8, 11.4, 13.7, 12.0, 10.9, 11.4, 13.0, 10.9],
    'Mai':     [16.3, 13.9, 14.6, 15.4, 13.9, 16.8, 18.0, 17.4, 14.7, 17.2, 15.8, 14.2, 15.8, 16.8, 14.9],
    'Juin':    [19.7, 16.6, 18.1, 19.3, 16.8, 20.8, 22.2, 21.3, 17.8, 20.9, 19.0, 17.2, 19.4, 20.5, 18.4],
    'Juillet': [22.0, 18.4, 20.5, 21.8, 18.8, 23.5, 24.7, 24.0, 19.7, 23.5, 21.4, 19.2, 21.6, 23.0, 20.8],
    'Aout':    [21.7, 18.3, 20.2, 21.4, 18.9, 23.0, 24.6, 23.7, 19.5, 23.6, 21.2, 19.1, 21.1, 22.7, 20.5],
    'Septembre': [18.7, 16.3, 16.8, 17.5, 16.2, 19.0, 21.1, 20.5, 17.1, 20.4, 17.9, 16.9, 17.4, 19.3, 17.1],
    'Octobre': [14.5, 13.3, 12.3, 12.9, 12.5, 14.1, 16.6, 16.4, 13.6, 16.5, 13.8, 13.4, 12.3, 15.0, 12.6],
    'Novembre': [9.6, 10.0, 7.0, 6.9, 7.6, 8.2, 11.4, 11.2, 9.3, 12.0, 8.3, 9.1, 6.3, 9.8, 7.3],
    'Decembre': [6.9, 7.9, 4.5, 3.9, 5.1, 5.1, 8.3, 8.5, 6.8, 9.5, 5.6, 6.8, 3.1, 7.1, 4.8],
}, index=cities)

months = list(data.columns)

# Standardisation (ACP normee)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(data)

# ACP complete (toutes les 12 composantes)
pca_full = PCA()
pca_full.fit(X_scaled)

print("Variance expliquee par composante :")
for i, v in enumerate(pca_full.explained_variance_ratio_):
    print(f"  PC{i+1}: {v*100:.2f}%")

cumvar = np.cumsum(pca_full.explained_variance_ratio_) * 100
print(f"\nVariance cumulee avec 2 PCs : {cumvar[1]:.1f}%")

# Conserver 2 composantes
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
```

**Resultat attendu :**
```
Variance expliquee par composante :
  PC1: ~73%
  PC2: ~17%
  PC3: ~4%
  ...
Variance cumulee avec 2 PCs : ~90%
```

**Interpretation :** Deux composantes capturent environ 87-90% de la variance totale, bien au-dessus du seuil de 80%. Les 12 temperatures mensuelles peuvent etre resumees par seulement 2 nombres par ville avec une perte d'information minimale.

---

## Exercice 2 : Diagramme des valeurs propres

### Tracer le diagramme des valeurs propres pour determiner le nombre de composantes a conserver.

**Reponse :**
```python noexec
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

components = range(1, 13)
ax1.bar(components, pca_full.explained_variance_ratio_ * 100, color='steelblue')
ax1.set_xlabel('Composante')
ax1.set_ylabel('Variance (%)')
ax1.set_title('Variance expliquee par composante')
ax1.grid(axis='y', alpha=0.3)

ax2.plot(components, cumvar, 'o-', linewidth=2, markersize=8)
ax2.axhline(y=80, color='r', linestyle='--', label='Seuil 80%')
ax2.set_xlabel('Nombre de composantes')
ax2.set_ylabel('Variance cumulee (%)')
ax2.set_title('Variance cumulee')
ax2.legend()
ax2.grid(alpha=0.3)

plt.tight_layout()
plt.show()
```

**Resultat attendu :**
- Panneau gauche : Une tres grande barre pour PC1 (~73%), une barre moyenne pour PC2 (~17%), puis toutes les barres restantes sont minuscules (<5%). Le "coude" est clair a k=2.
- Panneau droit : Monte fortement a ~73% a PC1, puis a ~90% a PC2, puis s'approche lentement de 100%. La ligne de seuil de 80% est franchie a PC2.

---

## Exercice 3 : Description des axes factoriels (methode DEFAC)

### Tracer le cercle des correlations et interpreter les axes.

**Reponse :**
```python noexec
# Correlation des variables avec les PCs
loadings = pca.components_.T * np.sqrt(pca.explained_variance_)

plt.figure(figsize=(10, 10))
circle = plt.Circle((0, 0), 1, color='gray', fill=False, linestyle='--', linewidth=2)
plt.gca().add_patch(circle)

for i, month in enumerate(months):
    plt.arrow(0, 0, loadings[i, 0], loadings[i, 1],
              head_width=0.05, head_length=0.05, fc='red', ec='red', alpha=0.7)
    plt.text(loadings[i, 0] * 1.15, loadings[i, 1] * 1.15,
             month, fontsize=10, ha='center', va='center')

plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.xlim(-1.2, 1.2)
plt.ylim(-1.2, 1.2)
plt.gca().set_aspect('equal')
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)')
plt.title('Cercle des correlations')
plt.grid(alpha=0.3)
plt.show()
```

**Resultat attendu :** Toutes les 12 fleches des mois pointent approximativement vers la droite (PC1 positif), car toutes les temperatures sont positivement correlees. Les fleches s'etalent verticalement :
- Les mois d'ete (Juin, Juillet, Aout) s'orientent vers le haut (PC2 positif) -- composante "amplitude" plus forte
- Les mois d'hiver (Decembre, Janvier, Fevrier) s'orientent vers le bas (PC2 negatif)
- Les mois de transition (Mars, Octobre) sont les plus proches de l'axe PC1

**Interpretation des axes :**
- **Axe 1 (~73%) :** Temperature moyenne annuelle. Gradient Nord-Sud (latitude). Villes projetees a droite = chaudes toute l'annee.
- **Axe 2 (~17%) :** Amplitude thermique. Gradient Est-Ouest (continentalite). Villes projetees en haut = etes chauds et hivers froids (climat continental). Villes projetees en bas = temperatures douces toute l'annee (climat oceanique).

---

## Exercice 4 : Plan factoriel des individus

### Projeter les villes sur le plan factoriel des 2 premiers axes.

**Reponse :**
```python noexec
plt.figure(figsize=(12, 10))
plt.scatter(X_pca[:, 0], X_pca[:, 1], s=100, alpha=0.6, color='steelblue')

for i, city in enumerate(cities):
    plt.annotate(city, (X_pca[i, 0], X_pca[i, 1]),
                 fontsize=10, xytext=(5, 5), textcoords='offset points')

plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)')
plt.title('Plan factoriel des individus (villes)')
plt.grid(alpha=0.3)
plt.show()
```

**Resultat attendu :** Les villes sont reparties dans un motif approximativement triangulaire :
- Cote droit (PC1 eleve) : Marseille, Nice, Montpellier, Toulouse, Bordeaux (villes chaudes du sud)
- Cote gauche (PC1 faible) : Lille, Strasbourg, Brest (villes plus fraiches du nord/ouest)
- Haut (PC2 eleve) : Grenoble, Lyon, Strasbourg (continental, grande amplitude)
- Bas (PC2 faible) : Brest, Rennes, Nantes (oceanique, faible amplitude)

Trois groupes naturels sont deja visibles.

---

## Exercice 5 : Comparaison des methodes de liaison

### Comparer les dendrogrammes obtenus avec les methodes Ward, Complete, Average et Single.

**Reponse :**
```python noexec
methods = ['ward', 'complete', 'average', 'single']

fig, axes = plt.subplots(2, 2, figsize=(16, 12))
axes = axes.ravel()

for idx, method in enumerate(methods):
    Z = linkage(X_pca, method=method)
    dendrogram(Z, labels=cities, ax=axes[idx], leaf_font_size=9)
    axes[idx].set_title(f'Methode : {method.upper()}', fontsize=12)
    axes[idx].tick_params(axis='x', rotation=45)
    axes[idx].set_ylabel('Distance')

plt.tight_layout()
plt.show()
```

**Resultat attendu :**
- **Ward :** Arbre equilibre avec des sauts horizontaux clairs. Trois branches principales correspondent aux trois zones climatiques. Methode la plus appropriee.
- **Complete :** Similaire a Ward mais avec des hauteurs de branches legerement differentes.
- **Average :** Separation moins nette. Certaines fusions se font a des hauteurs similaires.
- **Single :** "Effet chaine" -- les villes sont ajoutees une par une. Le dendrogramme ressemble a un escalier. PAS appropriate.

**Decision :** Utiliser Ward car il minimise la variance intra-cluster, produisant des clusters compacts et bien separes.

---

## Exercice 6 : Choix du nombre de clusters (methode du coude)

### Tracer la courbe du coude, le score de silhouette et l'indice de Davies-Bouldin pour determiner le nombre optimal de clusters.

**Reponse :**
```python noexec
inertias = []
silhouettes = []
davies_bouldins = []
k_range = range(2, 9)

for k in k_range:
    Z = linkage(X_pca, method='ward')
    clusters = fcluster(Z, t=k, criterion='maxclust')

    # Inertie intra-cluster (WCSS)
    inertia = 0
    for c in range(1, k + 1):
        pts = X_pca[clusters == c]
        if len(pts) > 0:
            center = pts.mean(axis=0)
            inertia += np.sum((pts - center) ** 2)
    inertias.append(inertia)

    # Silhouette
    sil = silhouette_score(X_pca, clusters)
    silhouettes.append(sil)

    # Davies-Bouldin
    db = davies_bouldin_score(X_pca, clusters)
    davies_bouldins.append(db)

    print(f"k={k}: Inertie={inertia:.2f}, Silhouette={sil:.4f}, DB={db:.4f}")

# Visualisation
fig, axes = plt.subplots(1, 3, figsize=(16, 5))

axes[0].plot(k_range, inertias, 'o-', linewidth=2, markersize=8)
axes[0].set_xlabel('Nombre de clusters')
axes[0].set_ylabel('Inertie intra-cluster')
axes[0].set_title('Methode du coude')
axes[0].grid(alpha=0.3)

axes[1].plot(k_range, silhouettes, 'o-', linewidth=2, markersize=8, color='green')
axes[1].set_xlabel('Nombre de clusters')
axes[1].set_ylabel('Score de silhouette')
axes[1].set_title('Silhouette (plus eleve = meilleur)')
axes[1].grid(alpha=0.3)

axes[2].plot(k_range, davies_bouldins, 'o-', linewidth=2, markersize=8, color='red')
axes[2].set_xlabel('Nombre de clusters')
axes[2].set_ylabel('Indice de Davies-Bouldin')
axes[2].set_title('Davies-Bouldin (plus faible = meilleur)')
axes[2].grid(alpha=0.3)

plt.tight_layout()
plt.show()
```

**Resultat attendu :**
```
k=2: Inertie=~8.5,  Silhouette=~0.50, DB=~0.65
k=3: Inertie=~4.5,  Silhouette=~0.55, DB=~0.55
k=4: Inertie=~3.2,  Silhouette=~0.48, DB=~0.68
k=5: Inertie=~2.3,  Silhouette=~0.42, DB=~0.72
```

**Resultat attendu :**
- Courbe du coude : Forte chute de k=2 a k=3, puis declin progressif. Le "coude" est a k=3.
- Courbe de silhouette : Pic a k=3 (score le plus eleve ~0.55).
- Courbe de Davies-Bouldin : Creux a k=3 (indice le plus faible ~0.55).

**Conclusion :** Les trois metriques convergent : k=3 est le nombre optimal de clusters.

---

## Exercice 7 : Classification avec differents nombres de composantes

### Classification avec la 1ere composante uniquement

**Reponse :**
```python noexec
# Utilisation de PC1 uniquement
Z_1pc = linkage(X_pca[:, :1], method='ward')
clusters_1pc = fcluster(Z_1pc, t=2, criterion='maxclust')

print("Classification avec 1 composante (2 groupes) :")
for c in range(1, 3):
    cities_c = [cities[i] for i in range(len(cities)) if clusters_1pc[i] == c]
    print(f"  Groupe {c}: {', '.join(cities_c)}")
```

**Resultat attendu :**
- Groupe 1 (Nord) : Lille, Strasbourg, Brest, Vichy, Clermont-Ferrand, Grenoble, Rennes, Paris, Lyon, Nantes, Nice
- Groupe 2 (Sud) : Marseille, Montpellier, Toulouse, Bordeaux

Cette classification plus simple ne detecte pas la distinction oceanique vs continental.

---

### Classification avec 2 composantes, 3 clusters

**Reponse :**
```python noexec
Z = linkage(X_pca, method='ward')
clusters = fcluster(Z, t=3, criterion='maxclust')

print("Classification avec 2 composantes (3 clusters) :")
for c in range(1, 4):
    cities_c = [cities[i] for i in range(len(cities)) if clusters[i] == c]
    print(f"  Cluster {c}: {', '.join(cities_c)}")
```

**Resultat attendu :**

| Cluster | Type climatique | Villes |
|---------|----------------|--------|
| 1 | **Continental** (Centre/Nord) | Strasbourg, Lille, Grenoble, Lyon, Vichy, Clermont-Ferrand, Paris |
| 2 | **Oceanique** (Ouest) | Brest, Rennes, Nantes |
| 3 | **Mediterraneen** (Sud) | Nice, Marseille, Montpellier, Toulouse, Bordeaux |

Note : La numerotation exacte des clusters peut varier entre les executions, mais les regroupements sont stables.

---

### Classification avec toutes les composantes

**Reponse :**
```python noexec
pca_full_data = PCA()
X_pca_full = pca_full_data.fit_transform(X_scaled)

Z_full = linkage(X_pca_full, method='ward')
clusters_full = fcluster(Z_full, t=3, criterion='maxclust')

print("Classification avec toutes les composantes (3 clusters) :")
for c in range(1, 4):
    cities_c = [cities[i] for i in range(len(cities)) if clusters_full[i] == c]
    print(f"  Cluster {c}: {', '.join(cities_c)}")
```

**Resultat attendu :** Regroupements similaires mais potentiellement des separations plus nuancees au sein des clusters.

---

## Exercice 8 : Dendrogramme avec coupure

### Afficher le dendrogramme avec la ligne de coupure a 3 clusters.

**Reponse :**
```python noexec
plt.figure(figsize=(14, 8))
dendrogram(Z, labels=cities, leaf_font_size=11, leaf_rotation=45)
plt.axhline(y=4.0, color='red', linestyle='--', linewidth=2, label='Coupure a 3 clusters')
plt.legend(fontsize=12)
plt.title('Dendrogramme - Methode de Ward', fontsize=14)
plt.xlabel('Villes')
plt.ylabel('Distance')
plt.tight_layout()
plt.show()
```

**Resultat attendu :** Un arbre ou le bas montre les villes individuelles fusionnant en petits groupes, et le haut montre trois grandes branches se rejoignant a de grandes distances. La ligne horizontale rouge coupe a travers les deux plus grands sauts verticaux, produisant 3 sous-arbres. Les trois branches sont :
- Branche 1 : Villes continentales (7 villes)
- Branche 2 : Villes oceaniques (3 villes)
- Branche 3 : Villes mediterraneennes (5 villes)

---

## Exercice 9 : Clusters sur le plan factoriel

### Visualiser les 3 clusters sur le plan factoriel avec les centres de gravite.

**Reponse :**
```python noexec
plt.figure(figsize=(12, 10))
colors = ['steelblue', 'orange', 'green']

for c in range(1, 4):
    mask = clusters == c
    x = X_pca[mask, 0]
    y = X_pca[mask, 1]

    plt.scatter(x, y, s=150, alpha=0.6, color=colors[c-1],
                label=f'Cluster {c}', edgecolors='black', linewidth=1)

    # Centre de gravite (barycentre)
    centroid = [x.mean(), y.mean()]
    plt.scatter(*centroid, s=300, alpha=0.9, color=colors[c-1],
                marker='*', edgecolors='black', linewidth=2)

    # Noms des villes
    for j in range(len(cities)):
        if clusters[j] == c:
            plt.annotate(cities[j],
                         (X_pca[j, 0], X_pca[j, 1]),
                         fontsize=9, xytext=(5, 5), textcoords='offset points')

plt.axhline(0, color='k', linestyle='--', alpha=0.3)
plt.axvline(0, color='k', linestyle='--', alpha=0.3)
plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)')
plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)')
plt.title('Classification en 3 clusters sur le plan factoriel')
plt.legend(loc='best')
plt.grid(alpha=0.3)
plt.show()
```

**Resultat attendu :** Trois groupes clairement separes avec des marqueurs etoiles a chaque centroide :
- Bleu (Continental) : Reparti au centre-gauche, de Grenoble/Strasbourg (haut-gauche) a Paris (centre)
- Orange (Oceanique) : Petit groupe serre en bas a gauche (Brest, Rennes, Nantes)
- Vert (Mediterraneen) : Reparti le long du cote droit, de Bordeaux a Nice/Marseille

---

## Exercice 10 : Identification des parangons

### Identifier les individus les plus representatifs (parangons) de chaque cluster.

> Parangon = individu le plus proche du centre de gravite du cluster.

**Reponse :**
```python noexec
for c in range(1, 4):
    mask = clusters == c
    cluster_points = X_pca[mask]
    cluster_cities = [cities[i] for i in range(len(cities)) if clusters[i] == c]

    # Centre de gravite
    centroid = cluster_points.mean(axis=0)

    # Distance de chaque ville au centre
    distances = cdist(cluster_points, [centroid], metric='euclidean').flatten()

    # Parangon = point le plus proche
    paragon_idx = np.argmin(distances)

    print(f"Cluster {c}: parangon = {cluster_cities[paragon_idx]} "
          f"(distance = {distances[paragon_idx]:.4f})")
    print(f"  Centre : PC1={centroid[0]:.4f}, PC2={centroid[1]:.4f}")
    print(f"  Villes : {', '.join(cluster_cities)}")
```

**Resultat attendu :**

| Cluster | Parangon | Distance au centre | Justification |
|---------|----------|-------------------|---------------|
| 1 (Continental) | **Vichy** ou Clermont-Ferrand | ~0.3 | Position centrale parmi 7 villes |
| 2 (Oceanique) | **Rennes** | ~0.2 | Milieu du triangle Brest-Nantes-Rennes |
| 3 (Mediterraneen) | **Toulouse** ou Montpellier | ~0.4 | Profil sudiste moyen |

**Interpretation :** Le parangon est utile pour la communication. Au lieu de lister 7 villes, on peut dire : "Ce cluster est caracterise par des villes comme Vichy -- temperature moderee, forte amplitude saisonniere, climat continental typique."

---

## Exercice 11 : Profilage des clusters

### Analyser le profil climatique de chaque cluster (temperatures moyennes, amplitude thermique).

**Reponse :**
```python noexec
for c in range(1, 4):
    mask = clusters == c
    cluster_cities = [cities[i] for i in range(len(cities)) if clusters[i] == c]
    cluster_data = data.loc[cluster_cities]

    print(f"\n{'='*60}")
    print(f"CLUSTER {c}")
    print(f"{'='*60}")
    print(f"Villes ({len(cluster_cities)}): {', '.join(cluster_cities)}")

    # Temperatures moyennes par mois
    print("\nTemperatures moyennes par mois :")
    print(cluster_data.mean().round(1))

    # Moyenne annuelle
    annual_mean = cluster_data.values.mean()
    print(f"\nMoyenne annuelle : {annual_mean:.1f} C")

    # Amplitude thermique (ete - hiver)
    summer = cluster_data[['Juin', 'Juillet', 'Aout']].mean(axis=1).mean()
    winter = cluster_data[['Decembre', 'Janvier', 'Fevrier']].mean(axis=1).mean()
    amplitude = summer - winter
    print(f"Moyenne ete : {summer:.1f} C")
    print(f"Moyenne hiver : {winter:.1f} C")
    print(f"Amplitude thermique : {amplitude:.1f} C")
```

**Resultats attendus :**

| Cluster | Type | Moyenne annuelle | Moyenne hiver | Moyenne ete | Amplitude |
|---------|------|-----------------|---------------|-------------|-----------|
| 1 Continental | Centre/Nord | ~11 C | ~4-5 C | ~20-21 C | ~16 C |
| 2 Oceanique | Ouest | ~11 C | ~7 C | ~18 C | ~11 C |
| 3 Mediterraneen | Sud | ~14 C | ~7-8 C | ~22-23 C | ~15 C |

**Interpretation :**
- **Cluster 1 (Continental) :** Hivers froids (3-5 C), etes chauds (20-23 C), grande amplitude (~16 C). Villes interieures eloignees de l'influence moderatrice de l'ocean.
- **Cluster 2 (Oceanique) :** Hivers doux (6-7 C), etes frais (17-18 C), faible amplitude (~11 C). Villes de la cote atlantique avec une courbe de temperature "plate".
- **Cluster 3 (Mediterraneen) :** Hivers doux (7-8 C), etes chauds (22-24 C), grande amplitude (~15 C). Latitude meridionale avec climat mediterraneen ou semi-mediterraneen.

---

## Exercice 12 : Metriques d'evaluation

### Calculer le score de silhouette et l'indice de Davies-Bouldin pour la classification en 3 clusters.

**Reponse :**
```python noexec
sil = silhouette_score(X_pca, clusters)
db = davies_bouldin_score(X_pca, clusters)

# Inertie intra-cluster
inertia_intra = 0
for c in range(1, 4):
    pts = X_pca[clusters == c]
    center = pts.mean(axis=0)
    inertia_intra += np.sum((pts - center) ** 2)

print(f"Score de silhouette : {sil:.4f}")
print(f"  Interpretation : [-1, 1], plus proche de 1 = meilleur")
print(f"Indice de Davies-Bouldin : {db:.4f}")
print(f"  Interpretation : Plus faible = meilleur")
print(f"Inertie intra-cluster : {inertia_intra:.4f}")
print(f"  Interpretation : Plus faible = clusters plus compacts")
```

**Resultat attendu :**
```
Score de silhouette : ~0.55
Indice de Davies-Bouldin : ~0.55
```

**Interpretation :**
- Un score de silhouette de 0.55 indique une bonne separation (>0.5 est generalement considere comme bon, >0.7 excellent)
- Un Davies-Bouldin de 0.55 est bon (plus faible = meilleur, 0 serait parfait)

---

## Exercice 13 : Choix de la meilleure classification

### Justifier le choix de 2 composantes et 3 clusters comme classification optimale.

**Reponse :**

Classification optimale : **2 composantes, 3 clusters**.

Justification :
1. Les 2 premieres composantes capturent 87-90% de l'information totale
2. 3 clusters correspondent aux grandes zones climatiques francaises :
   - Oceanique (Ouest)
   - Continental (Nord/Centre)
   - Mediterraneen (Sud)
3. Le score de silhouette est maximise a k=3
4. Bonne separation inter-cluster visible sur le plan factoriel
5. Chaque cluster a une interpretation geographique et climatique coherente
6. Les parangons sont des villes representant bien leur groupe

---

## Exercice 14 : Classifications alternatives

### Comparer les classifications en 2 et 4 classes.

**Reponse :**
```python noexec
# Classification en 2 classes
clusters_2 = fcluster(Z, t=2, criterion='maxclust')
print("Classification en 2 classes :")
for c in range(1, 3):
    cities_c = [cities[i] for i in range(len(cities)) if clusters_2[i] == c]
    print(f"  Classe {c}: {', '.join(cities_c)}")

print()

# Classification en 4 classes
clusters_4 = fcluster(Z, t=4, criterion='maxclust')
print("Classification en 4 classes :")
for c in range(1, 5):
    cities_c = [cities[i] for i in range(len(cities)) if clusters_4[i] == c]
    print(f"  Classe {c}: {', '.join(cities_c)}")
```

**Resultat attendu :**

**2 classes :**
- Classe 1 : Villes du Nord et de l'Ouest (temperatures plus basses)
- Classe 2 : Villes du Sud (temperatures plus elevees)

**4 classes :**
- Classe 1 : Nord continental (Lille, Strasbourg)
- Classe 2 : Central (Paris, Vichy, Clermont-Ferrand, Lyon, Grenoble)
- Classe 3 : Oceanique (Brest, Rennes, Nantes)
- Classe 4 : Mediterraneen (Marseille, Nice, Montpellier, Toulouse, Bordeaux)

**Conclusion :** 3 classes est le meilleur compromis entre granularite et interpretabilite.
