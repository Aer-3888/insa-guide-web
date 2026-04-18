---
title: "TP2 : Construction d'un pipeline ML complet"
sidebar_position: 2
---

# TP2 : Construction d'un pipeline ML complet

## Presentation
Ce TP montre comment construire un pipeline d'apprentissage automatique de bout en bout pour un probleme de classification reel : predire les absences aux rendez-vous medicaux. Le TP couvre le preprocessing des donnees, l'ingenierie de features, la selection de modeles et le reglage d'hyperparametres.

## Enonce du probleme
Predire si un patient manquera son rendez-vous medical a partir d'informations demographiques, de conditions de sante et de details sur le rendez-vous.

## Jeu de donnees : absences aux rendez-vous medicaux (No-Show Appointments)
- **Source** : Jeu de donnees Kaggle contenant 110 527 rendez-vous medicaux
- **Cible** : Classification binaire (present / absent)
- **Features** : 14 attributs incluant la demographie du patient, les conditions de sante et les informations de planification

### Attributs
| Attribut | Type | Description |
|----------|------|-------------|
| PatientId | Numerique | Identifiant unique du patient |
| AppointmentID | Numerique | Identifiant unique du rendez-vous |
| Gender | Binaire | Genre du patient (F/M) |
| ScheduledDay | Date/heure | Date et heure de la prise de rendez-vous |
| AppointmentDay | Date/heure | Date du rendez-vous |
| Age | Numerique | Age du patient |
| Neighbourhood | Categoriel | Quartier du patient (81 valeurs uniques) |
| Scholarship | Binaire | Beneficie d'une bourse (0/1) |
| Hipertension | Binaire | Souffre d'hypertension (0/1) |
| Diabetes | Binaire | Souffre de diabete (0/1) |
| Alcoholism | Binaire | Souffre d'alcoolisme (0/1) |
| Handcap | Binaire | Presente un handicap (0/1) |
| SMS_received | Binaire | A recu un rappel par SMS (0/1) |
| No-show | Binaire | Variable cible (Oui/Non) |

## Preprocessing des donnees

### Ingenierie de features
**Feature creee** : `AppointmentDelay` (nombre de jours entre la prise de rendez-vous et le rendez-vous)
- Calcule comme : `(AppointmentDay - ScheduledDay) / 86400`
- Gere les rendez-vous le jour meme (valeurs negatives mises a 0)
- Feature la plus importante (26.32% d'importance dans le Random Forest)

### Transformations des donnees
1. **Encodage** : Convertir les variables categorielles (Gender, Neighbourhood) en labels numeriques
2. **Traitement des dates** : Convertir les chaines de date/heure en timestamps Unix
3. **Extraction de features** : Extraire le jour de l'annee depuis AppointmentDay
4. **Encodage de la cible** : Convertir "Yes"/"No" en 1/0

### Separation train/test
- Entrainement : 82 895 echantillons (75%)
- Test : 27 632 echantillons (25%)
- Random state base sur le timestamp courant pour la reproductibilite

## Modeles implementes

### 1. Random Forest (reference)
**Objectif** : Classifieur de reference avec analyse d'importance des features

**Configuration** :
- 100 arbres (defaut)
- Validation croisee 4-fold

**Resultats** :
- Precision : 78.06% (CV), 79.8% (test)
- Temps d'entrainement : ~45 secondes

**Importance des features** (top 5) :
1. AppointmentDelay : 26.32%
2. ScheduledDay : 24.66%
3. Age : 17.22%
4. Neighbourhood : 15.82%
5. AppointmentDay : 9.37%

### 2. k plus proches voisins (kNN)
**Reglage d'hyperparametres** : Recherche sur grille (grid search) des valeurs de k

**Plage de recherche** :
- [1, 2, 3, 5, 10, 15, 20-190 (pas de 10), 200-295 (pas de 5), 300, 400, 500, 1000]

**Methodologie** :
- Separer l'entrainement en fit/validation (75/25)
- Evaluer chaque k sur le jeu de validation
- Selectionner le k avec le meilleur score de validation

**Resultats** :
- Meilleur k : 60-70 (plateau de performance)
- Precision : 79.77% (test)
- Legerement meilleur que le Random Forest

**Observations** :
- La performance atteint un plateau apres k = 60
- Courbe de validation lisse et bien definie
- Resultats coherents avec des separations train/val/test fixes

### 3. Naive Bayes
**Difficulte** : sklearn Naive Bayes necessite des types de features uniformes

**Approche 1 : Supprimer les features numeriques**
- Garder uniquement les features categorielles : Gender, Neighbourhood, Scholarship, Hipertension, Diabetes, Alcoholism, Handcap, SMS_received
- Utiliser `CategoricalNB`
- **Precision** : 79.76% (test)

**Approche 2 : Discretiser les features continues**
Categories d'age :
- 0-12 : enfant
- 13-19 : adolescent
- 20-30 : jeune
- 31-50 : adulte
- 51-65 : senior
- 66-80 : age
- 81+ : tres age

Categories de delai de rendez-vous (AppointmentDelay) :
- 0 : aujourd'hui
- 1-6 : semaine
- 7-14 : deux semaines
- 15-31 : mois
- 32-62 : deux mois
- 63+ : plus tard

Features temporelles :
- Extraire le jour de la semaine (0-6) depuis ScheduledDay et AppointmentDay

**Resultats** :
- Precision : 79.08% (moyenne CV 4-fold)
- Legerement inferieur au kNN mais comparable au Random Forest

### 4. AdaBoost (Boosting de stumps)
**Configuration** : Boosting avec des stumps (arbres de decision a un noeud)

**Recherche d'hyperparametres** : Nombre d'estimateurs
- Plage : [1, 2-48 (pas de 2), 50-450 (pas de 50)]

**Resultats** :
- Meilleur n_estimators : Variable (1-100, courbe de validation chaotique)
- Precision : ~79-80% (ne depasse jamais 80% de maniere consistante)
- Performance similaire aux autres modeles

**Observations** :
- Courbe de validation plus erratique que celle du kNN
- Pas de gain significatif par rapport aux modeles plus simples
- Le surcouit de calcul n'est pas justifie

## Resultats cles

### Comparaison des modeles
| Modele | Precision | Remarques |
|--------|-----------|-----------|
| Random Forest | 79.8% | Bonne reference, importance des features interpretable |
| kNN (k=60) | 79.77% | Meilleure performance, simple, efficace |
| Naive Bayes | 79.08-79.76% | Rapide, necessite de l'ingenierie de features |
| AdaBoost | ~79-80% | Pas d'amelioration par rapport aux modeles plus simples |

### Meilleur modele : kNN
- Meilleure precision sur le test
- Simple et interpretable
- Temps de prediction efficace
- Robuste avec un bon choix de k

### Enseignements importants
1. **L'ingenierie de features est cruciale** : AppointmentDelay (feature creee) est la plus importante
2. **Rendements decroissants** : Les modeles complexes ne surpassent pas significativement les modeles simples
3. **Qualite des donnees** : Tous les modeles peinent a depasser 80% de precision, ce qui suggere :
   - Des features importantes manquantes
   - Une imprevisibilite inherente au comportement humain
   - Des problemes de desequilibre de classes

## Visualisations

### Analyse Pairplot
Examen des correlations entre features sur un echantillon de 5% :
- Gender, SMS_received, Age, ScheduledDay, AppointmentDay, AppointmentDelay
- Regroupements notables dans AppointmentDay/AppointmentDelay et AppointmentDelay/Age

### Courbes d'hyperparametres
- kNN : Courbe de validation lisse, plateau clair
- AdaBoost : Erratique, pas de valeur optimale claire

## Fichiers
- `TP2_no_show_complete.ipynb` : Implementation complete du pipeline
- `no_show.csv` : Jeu de donnees des rendez-vous medicaux (110 527 enregistrements)
- `music_genre.csv` : Jeu de donnees alternatif (travail de Hugo)

## Lancer le code
```bash noexec
# Installer les dependances
pip install scikit-learn pandas numpy matplotlib seaborn

# Lancer le notebook Jupyter
jupyter notebook TP2_no_show_complete.ipynb
```

## Lecons apprises
1. **Toujours creer des features** : La connaissance du domaine ameliore les modeles
2. **Commencer par une reference** : Le Random Forest fournit rapidement des informations sur l'importance des features
3. **Le reglage des hyperparametres compte** : kNN avec k=1 vs k=60 montre une difference significative
4. **Visualiser les courbes de validation** : Aide a identifier les parametres optimaux et le sur-apprentissage
5. **Le simple peut etre le meilleur** : Le kNN surpasse les methodes d'ensemble complexes ici
6. **Utiliser des separations coherentes** : Des separations train/val/test fixes permettent des comparaisons equitables
