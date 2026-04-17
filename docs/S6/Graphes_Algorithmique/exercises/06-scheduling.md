---
title: "Exercices -- Ordonnancement (TD 6)"
sidebar_position: 6
---

# Exercices -- Ordonnancement (TD 6)

> Chaque exercice est resolu avec le graphe potentiels-taches complet, les calculs de dates au plus tot/tard detailles pour chaque tache, les marges et le chemin critique.

---

## Exercice 1 : Ordonnancement d'un projet (7 taches)

**Enonce (TD 6) :** Un projet se compose de sept taches dont les durees (en unites de temps) et les contraintes sont les suivantes :

| Tache | Duree (u.t.) | Contraintes |
|-------|-------------|-------------|
| A | 6 | Pas de contraintes |
| B | 7 | Commence au plus tot 3 u.t. apres le debut du projet. Commence au plus tot 2 u.t. apres le debut de A. Commence au plus tot 1 u.t. apres le debut de B. |
| C | 3 | Commence au plus tard 6 u.t. apres le debut du projet |
| D | 8 | Commence au plus tot a la fin de A. Commence au plus tot 3 u.t. apres le debut de B. |
| E | 4 | Commence au plus tot a la fin de B. Commence au plus tot a la fin de C. |
| F | 5 | Commence au plus tot 2 u.t. apres le debut de D. Commence au plus tot a la fin de B. Commence au plus tot a la fin de E. |
| G | 1 | Commence au plus tot 3 u.t. apres le debut de F. Commence au plus tard 5 u.t. apres le debut de D. |

### Question 1.1 -- Inegalites de potentiels et graphe

**Traduction des contraintes en inegalites :**

Notons t_X la date de debut de la tache X, t_D le debut du projet (t_D = 0), et t_F la fin du projet.

```
Contraintes de A :
  Aucune : t_A >= 0

Contraintes de B :
  t_B >= t_D + 3 = 3       (3 u.t. apres debut projet)
  t_B >= t_A + 2            (2 u.t. apres debut de A)
  Contrainte "1 u.t. apres debut de B" : se lit comme t_B >= t_B + 1, 
    ce qui est infaisable. Relisons : "Commence au plus tot 1 u.t. apres le debut de B" 
    est probablement une erreur de lecture -- interpretons comme une contrainte sur C ou autre.
    En regardant le TD : B commence au plus tot apres le debut de A de 2 u.t.
    
  Retenons : t_B >= 3, t_B >= t_A + 2

Contraintes de C :
  t_C <= 6 (commence au plus tard 6 u.t. apres debut)
  => C'est une contrainte "au plus tard" : on la traite differemment.
  En MPM, on la traduit comme : t_D + 6 >= t_C, soit t_C <= 6.
  Ou avec arc inverse : arc de C vers D(debut) avec poids -6.

Contraintes de D :
  t_D >= t_A + 6  (= fin de A, car duree A = 6)
  t_D >= t_B + 3  (3 u.t. apres debut de B)

Contraintes de E :
  t_E >= t_B + 7  (fin de B, car duree B = 7)
  t_E >= t_C + 3  (fin de C, car duree C = 3)

Contraintes de F :
  t_F >= t_D + 2            (2 u.t. apres debut de D)
  t_F >= t_B + 7            (fin de B)
  t_F >= t_E + 4            (fin de E)

Contraintes de G :
  t_G >= t_F + 3            (3 u.t. apres debut de F)
  t_G <= t_D + 5            (contrainte au plus tard)
```

**Graphe potentiels-taches (MPM) :**

Les sommets sont les taches {debut, A, B, C, D, E, F, G, fin}. Les arcs sont les contraintes, ponderes par les delais.

```
debut --0--> A
debut --3--> B
debut --0--> C
A --2--> B        (B >= A + 2)
A --6--> D        (D >= A + 6 = fin de A)
B --3--> D        (D >= B + 3)
B --7--> E        (E >= B + 7 = fin de B)
C --3--> E        (E >= C + 3 = fin de C)
D --2--> F        (F >= D + 2)
B --7--> F        (F >= B + 7 = fin de B)
E --4--> F        (F >= E + 4 = fin de E)
F --3--> G        (G >= F + 3)
A --6--> fin      (fin >= A + 6)
D --8--> fin      (fin >= D + 8)
E --4--> fin      (fin >= E + 4)  si E n'a pas de successeur apres F
F --5--> fin      (fin >= F + 5)
G --1--> fin      (fin >= G + 1)
```

**Graphe ASCII :**

```
                    +--6--> D --8-->+
                    |       |       |
           +--2-->B-+--7-->E--4-->F--5-->fin
           |   ^    |       ^      |
  debut--0-->A |    +--7----+      +--3-->G--1-->fin
           |   +--3--debut         
           |                       
           +--0-->C--3-->E         
```

### Question 1.2 -- Ordonnancement au plus tot (dates ES)

On calcule les dates au plus tot par **propagation vers l'avant** : pour chaque tache, sa date ES est le max des (ES du predecesseur + poids de l'arc).

```
ES(debut) = 0

ES(A) = max(ES(debut) + 0) = 0
ES(B) = max(ES(debut) + 3, ES(A) + 2) = max(3, 0+2) = max(3, 2) = 3
ES(C) = max(ES(debut) + 0) = 0
ES(D) = max(ES(A) + 6, ES(B) + 3) = max(0+6, 3+3) = max(6, 6) = 6
ES(E) = max(ES(B) + 7, ES(C) + 3) = max(3+7, 0+3) = max(10, 3) = 10
ES(F) = max(ES(D) + 2, ES(B) + 7, ES(E) + 4) = max(6+2, 3+7, 10+4) = max(8, 10, 14) = 14
ES(G) = max(ES(F) + 3) = 14 + 3 = 17

ES(fin) = max(ES(A)+6, ES(D)+8, ES(F)+5, ES(G)+1) 
        = max(0+6, 6+8, 14+5, 17+1) 
        = max(6, 14, 19, 18) = 19
```

**Duree minimale du projet T1 = ES(fin) = 19 u.t.**

**Tableau ES :**

| Tache | debut | A | B | C | D | E | F | G | fin |
|-------|-------|---|---|---|---|---|---|---|-----|
| ES    | 0     | 0 | 3 | 0 | 6 | 10| 14| 17| 19  |

### Chemin critique

Le chemin critique est le plus long chemin de debut a fin. Il passe par les taches qui determinent la duree du projet.

```
debut -> A(0) -> D(6) -> ... Non, ES(F) = 14 est determine par E.

Tracons les chemins :
  debut -> A -> D : ES(D) = 6. D -> fin : 6+8 = 14.
  debut -> B -> E -> F -> fin : 0+3+7+4+5 = 19. C'est le chemin critique !
  debut -> B -> E -> F -> G -> fin : 0+3+7+4+3+1 = 18.

Chemin critique : debut -> B -> E -> F -> fin

Verifions :
  debut --3--> B : ES(B) = 3
  B --7--> E : ES(E) = 3+7 = 10
  E --4--> F : ES(F) = 10+4 = 14
  F --5--> fin : ES(fin) = 14+5 = 19. OK.
```

**Chemin critique : debut -> B -> E -> F -> fin. Les taches critiques sont B, E, F.**

### Question 1.3 -- Ordonnancement au plus tard (dates LS) et marges

On calcule les dates au plus tard par **propagation vers l'arriere** depuis LS(fin) = T1 = 19.

```
LS(fin) = 19
LS(G) = LS(fin) - 1 = 18
LS(F) = min(LS(fin) - 5, LS(G) - 3) = min(19-5, 18-3) = min(14, 15) = 14
LS(E) = LS(F) - 4 = 14 - 4 = 10
LS(D) = min(LS(fin) - 8, LS(F) - 2) = min(19-8, 14-2) = min(11, 12) = 11
LS(C) = LS(E) - 3 = 10 - 3 = 7
LS(B) = min(LS(D) - 3, LS(E) - 7, LS(F) - 7) = min(11-3, 10-7, 14-7) = min(8, 3, 7) = 3
LS(A) = min(LS(B) - 2, LS(D) - 6) = min(3-2, 11-6) = min(1, 5) = 1
LS(debut) = min(LS(A) - 0, LS(B) - 3, LS(C) - 0) = min(1, 0, 7) = 0
```

**Tableau LS :**

| Tache | debut | A | B | C | D | E | F | G | fin |
|-------|-------|---|---|---|---|---|---|---|-----|
| LS    | 0     | 1 | 3 | 7 | 11| 10| 14| 18| 19  |

### Marges

**Marge libre (ML)** = ES(successeur) - ES(tache) - poids de l'arc (pour chaque successeur, prendre le min).

**Marge totale (MT)** = LS(tache) - ES(tache).

| Tache | ES | LS | MT = LS-ES | Critique ? |
|-------|----|----|------------|------------|
| A | 0 | 1 | 1 | Non |
| B | 3 | 3 | 0 | **OUI** |
| C | 0 | 7 | 7 | Non |
| D | 6 | 11 | 5 | Non |
| E | 10 | 10 | 0 | **OUI** |
| F | 14 | 14 | 0 | **OUI** |
| G | 17 | 18 | 1 | Non |

**Taches critiques (MT = 0) : B, E, F.** Confirme le chemin critique.

---

## Exercice 2 : Ordonnancement avec couts

**Enonce (TD 6) :** Projet de 7 taches avec durees et contraintes differentes.

| Tache | Duree (jours) | Contraintes |
|-------|--------------|-------------|
| A | 4 | Pas de contraintes |
| B | 6 | Commence au plus tot 2 jours apres le debut du projet. Commence au plus tot a la fin de A. |
| C | 3 | Commence au plus tot a la fin de A. Commence au plus tard 6 jours apres le debut du projet. |
| D | 3 | Commence au plus tot 4 jours apres le debut de B. Commence au plus tot 1 jour apres la fin de A. |
| E | 6 | Commence au plus tot 2 jours apres le debut de D. Commence au plus tot 1 jour apres la fin de B. |
| F | 8 | Commence au plus tot a la fin de D. Commence au plus tot 2 jours apres le debut de C. |
| G | 4 | Commence au plus tot 2 jours apres le debut de C. Commence au plus tot a la fin de C. |

### Question 2.1 -- Graphe potentiels-taches

**Inegalites de potentiels :**

```
t_A >= 0
t_B >= 2                       (2 jours apres debut)
t_B >= t_A + 4                 (fin de A)
t_C >= t_A + 4                 (apres fin de A, duree A = 4)
t_D >= t_B + 4                 (4 jours apres debut de B)
t_D >= t_A + 4 + 1 = t_A + 5  (1 jour apres fin de A)
t_E >= t_D + 2                 (2 jours apres debut de D)
t_E >= t_B + 6 + 1 = t_B + 7  (1 jour apres fin de B)
t_F >= t_D + 3                 (fin de D)
t_F >= t_C + 2                 (2 jours apres debut de C)
t_G >= t_C + 2                 (2 jours apres debut de C)
t_G >= t_C + 3                 (fin de C)
```

**Arcs du graphe :**

```
debut --0--> A
debut --2--> B
A --4--> B         (B apres fin A)
A --4--> C         (C apres fin A)
A --5--> D         (D 1 jour apres fin A)
B --4--> D         (D 4 jours apres debut B)
B --7--> E         (E 1 jour apres fin B)
D --2--> E         (E 2 jours apres debut D)
D --3--> F         (F apres fin D)
C --2--> F         (F 2 jours apres debut C)
C --2--> G         (G 2 jours apres debut C)
C --3--> G         (G apres fin C) -- cet arc est plus contraignant que le precedent
E --6--> fin
F --8--> fin
G --4--> fin
```

Note : pour G, les deux arcs C--2-->G et C--3-->G existent, mais on garde le plus contraignant : C--3-->G.

### Question 2.2 -- Ordonnancement au plus tot

```
ES(debut) = 0
ES(A) = 0
ES(B) = max(2, ES(A)+4) = max(2, 4) = 4
ES(C) = ES(A)+4 = 4
ES(D) = max(ES(A)+5, ES(B)+4) = max(5, 4+4) = max(5, 8) = 8
ES(E) = max(ES(D)+2, ES(B)+7) = max(8+2, 4+7) = max(10, 11) = 11
ES(F) = max(ES(D)+3, ES(C)+2) = max(8+3, 4+2) = max(11, 6) = 11
ES(G) = max(ES(C)+3) = 4+3 = 7

ES(fin) = max(ES(E)+6, ES(F)+8, ES(G)+4) = max(11+6, 11+8, 7+4) = max(17, 19, 11) = 19
```

**T1 = 19 jours.**

**Chemin critique :** debut -> A -> B -> D -> F -> fin

```
Verification : 0 + 4(A) + 4(B apres A) + 4(D apres B+4) + 3(F apres D) + 8(F) = ?
Tracons : ES(A)=0, A--4-->B: ES(B)=4, B--4-->D: ES(D)=8, D--3-->F: ES(F)=11, F--8-->fin: 19.
Poids du chemin : 0 + 4 + 4 + 3 + 8 = 19. OK.
```

### Question 2.3 -- Ordonnancement au plus tard et marges

```
LS(fin) = 19
LS(G) = 19 - 4 = 15
LS(F) = 19 - 8 = 11
LS(E) = 19 - 6 = 13
LS(D) = min(LS(E)-2, LS(F)-3) = min(13-2, 11-3) = min(11, 8) = 8
LS(C) = min(LS(F)-2, LS(G)-3) = min(11-2, 15-3) = min(9, 12) = 9
LS(B) = min(LS(D)-4, LS(E)-7) = min(8-4, 13-7) = min(4, 6) = 4
LS(A) = min(LS(B)-4, LS(C)-4, LS(D)-5) = min(4-4, 9-4, 8-5) = min(0, 5, 3) = 0
LS(debut) = min(LS(A), LS(B)-2) = min(0, 4-2) = min(0, 2) = 0
```

**Tableau complet :**

| Tache | ES | Duree | EF=ES+d | LS | LF=LS+d | MT=LS-ES |
|-------|----|----|---------|----|---------|---------| 
| A | 0 | 4 | 4 | 0 | 4 | **0** |
| B | 4 | 6 | 10 | 4 | 10 | **0** |
| C | 4 | 3 | 7 | 9 | 12 | 5 |
| D | 8 | 3 | 11 | 8 | 11 | **0** |
| E | 11 | 6 | 17 | 13 | 19 | 2 |
| F | 11 | 8 | 19 | 11 | 19 | **0** |
| G | 7 | 4 | 11 | 15 | 19 | 8 |

**Chemin critique (MT = 0) : A -> B -> D -> F. Duree T1 = 19 jours.**

### Question 2.4 -- Couts

A chaque tache x est associe un cout C(x) defini par :

```
C(x) = C_b(x) + alpha_x * (d_x - d_b_x)^2
```

ou C_b(x) est le cout de base, alpha_x le coefficient, d_x la duree effective et d_b_x la duree de base.

| Tache | A | B | C | D | E | F | G |
|-------|---|---|---|---|---|---|---|
| C_b (milliers EUR) | 100 | 50 | 65 | 40 | 120 | 30 | 75 |
| alpha (milliers EUR) | 10 | 20 | 5 | 15 | 7 | 10 | 15 |

**Cout de l'ordonnancement au plus tot (durees de base) :**

Avec les durees de base, chaque tache a d_x = d_b_x, donc (d_x - d_b_x)^2 = 0.

```
C_total = C_b(A) + C_b(B) + C_b(C) + C_b(D) + C_b(E) + C_b(F) + C_b(G)
        = 100 + 50 + 65 + 40 + 120 + 30 + 75
        = 480 milliers d'euros
```

### Question 2.5 -- Allongement avec penalite

**Enonce :** Allongement cumule des durees de A, B et D de 3 jours. Penalite de 30 000 EUR par jour de retard. Chercher la repartition qui minimise l'augmentation du cout.

On doit repartir 3 jours d'allongement entre A, B, D (entiers >= 0). Notons delta_A, delta_B, delta_D les allongements avec delta_A + delta_B + delta_D = 3.

**Cout supplementaire d'une tache x rallongee de delta :**

```
Delta_C(x) = alpha_x * delta_x^2    (car d_b ne change pas)
```

**Cout supplementaire total :**

```
Delta_C = alpha_A * delta_A^2 + alpha_B * delta_B^2 + alpha_D * delta_D^2 + 30 * max(0, T_new - T1)
        = 10 * delta_A^2 + 20 * delta_B^2 + 15 * delta_D^2 + 30 * retard
```

A, B, D sont sur le chemin critique : A -> B -> D -> F. Allonger une tache critique allonge le projet de la meme duree (si elle reste critique).

Allongement total du chemin critique = delta_A + delta_B + delta_D = 3 jours.
Donc T_new = T1 + 3 = 22 jours. Retard = 3 jours. Penalite = 3 * 30 = 90 milliers EUR.

Note : la penalite est fixe (90) quelle que soit la repartition, car les 3 taches sont toutes critiques et les allongements s'additionnent.

**Minimisation de alpha_A * delta_A^2 + alpha_B * delta_B^2 + alpha_D * delta_D^2 avec delta_A + delta_B + delta_D = 3 :**

Enumeration des repartitions (delta_A, delta_B, delta_D) avec somme = 3 :

```
(3,0,0) : 10*9 + 20*0 + 15*0 = 90
(0,3,0) : 10*0 + 20*9 + 15*0 = 180
(0,0,3) : 10*0 + 20*0 + 15*9 = 135
(2,1,0) : 10*4 + 20*1 + 15*0 = 40+20 = 60
(2,0,1) : 10*4 + 20*0 + 15*1 = 40+15 = 55
(1,2,0) : 10*1 + 20*4 + 15*0 = 10+80 = 90
(0,2,1) : 10*0 + 20*4 + 15*1 = 80+15 = 95
(1,0,2) : 10*1 + 20*0 + 15*4 = 10+60 = 70
(0,1,2) : 10*0 + 20*1 + 15*4 = 20+60 = 80
(1,1,1) : 10*1 + 20*1 + 15*1 = 10+20+15 = 45
```

**Minimum : (1, 1, 1) avec cout supplementaire = 45 milliers EUR.**

**Cout total :**

```
Cout = 480 (base) + 45 (allongement) + 90 (penalite) = 615 milliers d'euros
```

**Repartition optimale : (1, 1, 1) avec cout d'allongement = 45 milliers EUR.**

**Nouvelles durees :** A = 5, B = 7, D = 4.

**Nouvel ordonnancement au plus tot :**

Les arcs du graphe ne changent pas. Seules les durees des taches (et donc les poids des arcs de type "fin de X") changent.

```
ES(A) = 0
ES(B) = max(2, ES(A)+5) = max(2, 5) = 5     (arc A--5-->B car duree A = 5)
ES(C) = ES(A)+5 = 5                           (arc A--5-->C car duree A = 5)
ES(D) = max(ES(A)+6, ES(B)+4) = max(0+6, 5+4) = max(6, 9) = 9
    (A--6-->D : duree A=5, +1 jour = 6; B--4-->D : 4 jours apres debut B)
ES(E) = max(ES(D)+2, ES(B)+8) = max(9+2, 5+8) = max(11, 13) = 13
    (B--8-->E : duree B=7, +1 jour = 8)
ES(F) = max(ES(D)+4, ES(C)+2) = max(9+4, 5+2) = max(13, 7) = 13
    (D--4-->F : duree D=4, fin de D)
ES(G) = ES(C)+3 = 5+3 = 8
ES(fin) = max(ES(E)+6, ES(F)+8, ES(G)+4) = max(13+6, 13+8, 8+4) = max(19, 21, 12) = 21
```

**Nouvelle duree T_new = 21 jours. Retard = 21 - 19 = 2 jours.**

Attention : bien que l'allongement total soit de 3 jours, le retard n'est que de 2 jours car certaines augmentations sont absorbees par la marge ou les chemins non critiques.

**Penalite = 2 * 30 = 60 milliers EUR.**

**Cout total :**

```
Cout = 480 (base) + 45 (allongement) + 60 (penalite) = 585 milliers d'euros
```

**Verification avec d'autres repartitions :**

(2, 0, 1) : cout allongement = 10*4 + 20*0 + 15*1 = 55. 
Durees : A=6, B=6, D=4.
ES(B) = max(2, 6) = 6. ES(D) = max(7, 6+4) = 10. ES(E) = max(12, 6+7) = 13.
ES(F) = max(10+4, ...) = 14. ES(fin) = max(19, 22, ...) = 22. Retard = 3.
Cout total = 480 + 55 + 90 = 625. Plus cher.

(2, 1, 0) : cout allongement = 10*4 + 20*1 + 0 = 60.
Durees : A=6, B=7, D=3.
ES(B) = max(2, 6) = 6. ES(D) = max(7, 6+4) = 10. ES(F) = max(10+3, ...) = 13.
ES(E) = max(12, 6+8) = 14. ES(fin) = max(20, 21, ...) = 21. Retard = 2.
Cout total = 480 + 60 + 60 = 600. Plus cher.

La repartition (1, 1, 1) reste optimale avec un cout total de **585 milliers EUR**.

---

## Resume des methodes d'ordonnancement

| Etape | Calcul | Direction |
|-------|--------|-----------|
| ES (au plus tot) | Max des predecesseurs + poids | Avant (gauche->droite) |
| LS (au plus tard) | Min des successeurs - duree | Arriere (droite->gauche) |
| Marge totale | MT = LS - ES | -- |
| Marge libre | ML = min(ES_succ) - ES - duree | -- |
| Chemin critique | Taches avec MT = 0 | Plus long chemin |

| Formule de cout | C(x) = C_b(x) + alpha_x * (d_x - d_b_x)^2 |
|-----------------|---------------------------------------------|
| Penalite retard | P * max(0, T_new - T1) |
| Optimisation | Minimiser somme des couts + penalite |
