---
title: "Preuves recurrentes -- Graphes et Algorithmique"
sidebar_position: 4
---

# Preuves recurrentes -- Graphes et Algorithmique

Preuves classiques demandees en DS, avec methodes et redaction type.

---

## 1. Theoreme des poignees de main

### Enonce

Dans un graphe non oriente G = (S, A), la somme de tous les degres est egale a deux fois le nombre d'aretes : Somme d(v) = 2m.

### Preuve

Chaque arete {u, v} est incidente a exactement 2 sommets : u et v. Donc chaque arete contribue exactement +1 au degre de u et +1 au degre de v, soit +2 a la somme totale des degres.

Comme il y a m aretes, la somme totale est 2m.

### Consequence : nombre pair de sommets de degre impair

Decomposons la somme : Somme d(v) = (somme des degres pairs) + (somme des degres impairs) = 2m.

La somme des degres pairs est paire. Donc la somme des degres impairs est aussi paire. Or une somme de nombres impairs est paire si et seulement si le nombre de termes est pair.

Donc le nombre de sommets de degre impair est pair.

---

## 2. Un arbre a n sommets a exactement n-1 aretes

### Preuve par recurrence sur n

**Base :** n = 1. L'arbre a 1 sommet et 0 arete = 1-1 = 0. OK.

**Hypothese de recurrence :** Tout arbre a k sommets (k < n) a k-1 aretes.

**Etape :** Soit T un arbre a n sommets (n >= 2). T a au moins une feuille v (sommet de degre 1).

Supprimons v et son unique arete incidente. Le graphe restant T' est :
- Connexe (car v etait une feuille, sa suppression ne deconnecte pas T)
- Acyclique (supprimer un sommet ne cree pas de cycle)
- Donc T' est un arbre a n-1 sommets.

Par hypothese de recurrence, T' a (n-1)-1 = n-2 aretes.
Donc T a n-2+1 = n-1 aretes.

---

## 3. Tout arbre a au moins 2 feuilles (n >= 2)

### Preuve

Soit T un arbre a n >= 2 sommets. Prenons le plus long chemin P = (v_0, v_1, ..., v_k) dans T.

v_0 est une feuille : en effet, si v_0 avait un voisin w different de v_1 et non dans P, alors le chemin (w, v_0, v_1, ..., v_k) serait plus long. Contradiction avec la maximalite de P. Et si w etait dans P, il y aurait un cycle, contradiction avec l'acyclicite de T.

De meme, v_k est une feuille.

v_0 et v_k sont distincts (k >= 1 car n >= 2).

Donc T a au moins 2 feuilles.

---

## 4. Un graphe est biparti ssi il n'a pas de cycle impair

### Preuve (sens =>)

Si G est biparti avec partition (X, Y), tout cycle C = (v_0, v_1, ..., v_k = v_0) alterne entre X et Y. Si v_0 est dans X, alors v_1 est dans Y, v_2 dans X, ... v_i est dans X si i est pair, dans Y si i est impair. Pour que v_k = v_0 soit dans X, il faut k pair. Donc tout cycle est de longueur paire.

### Preuve (sens <=)

Supposons que G n'a pas de cycle impair. On construit une 2-coloration par BFS depuis un sommet arbitraire s :
- Colorier s en 0. dist(s) = 0.
- Pour tout sommet v, colorier v en dist(v) mod 2.

Si cette coloration n'est pas propre, il existe une arete {u, v} avec dist(u) mod 2 = dist(v) mod 2. Donc dist(u) et dist(v) ont la meme parite. Le cycle forme par le chemin BFS s->...->u, l'arete u-v, et le chemin v->...->s a une longueur dist(u) + 1 + dist(v) qui est impaire. Contradiction.

Donc la coloration est propre, et G est biparti.

---

## 5. Formule d'Euler : n - m + f = 2 (graphe planaire connexe)

### Preuve par recurrence sur m

**Base :** m = 0. Le graphe a n = 1 sommet (connexe), m = 0 arete, f = 1 face (exterieure). 1 - 0 + 1 = 2. OK.

**Etape :** Si G a un cycle, supprimer une arete e du cycle. Le graphe reste connexe (chemin alternatif par le cycle). On perd 1 arete et 2 faces fusionnent en 1, donc on perd 1 face. n - (m-1) + (f-1) = n - m + f. Par recurrence, le resultat vaut 2.

Si G n'a pas de cycle, G est un arbre. Alors m = n-1 et f = 1 (pas de face interieure). n - (n-1) + 1 = 2. OK.

---

## 6. m <= 3n - 6 pour un graphe planaire simple (n >= 3)

### Preuve

Par Euler : f = 2 - n + m.

Chaque face est delimitee par au moins 3 aretes (graphe simple, pas de boucle ni arete multiple). Chaque arete borde au plus 2 faces.

Donc : 3f <= 2m (somme des longueurs de toutes les faces = 2m, et chaque longueur >= 3).

Substituant f : 3(2 - n + m) <= 2m => 6 - 3n + 3m <= 2m => m <= 3n - 6.

---

## 7. K_5 n'est pas planaire

### Preuve

K_5 a n = 5 sommets et m = n(n-1)/2 = 10 aretes.

Si K_5 etait planaire : m <= 3n - 6 = 3(5) - 6 = 9.

Or m = 10 > 9. Contradiction.

Donc K_5 n'est pas planaire.

---

## 8. K_{3,3} n'est pas planaire

### Preuve

K_{3,3} a n = 6 sommets et m = 3*3 = 9 aretes.

Test m <= 3n - 6 : 9 <= 12. OK, ce test ne suffit pas.

K_{3,3} est biparti, donc sans triangle. Chaque face est delimitee par au moins 4 aretes.

Donc : 4f <= 2m => f <= m/2 = 9/2 = 4.5 => f <= 4.

Par Euler : f = 2 - n + m = 2 - 6 + 9 = 5.

Mais f <= 4 et f = 5. Contradiction.

Donc K_{3,3} n'est pas planaire.

---

## 9. Correction de Dijkstra (schema de preuve)

### Enonce

Si tous les poids sont >= 0, Dijkstra calcule les distances exactes depuis la source.

### Preuve (invariant de boucle)

**Invariant :** Quand un sommet u est marque comme visite, dist(u) = delta(s, u) (distance exacte).

**Preuve par recurrence sur le nombre de sommets visites :**

**Base :** s est visite avec dist(s) = 0 = delta(s, s). OK.

**Etape :** Supposons que pour tous les sommets deja visites, dist = delta.

Soit u le prochain sommet visite (non visite de dist minimale). Supposons par l'absurde que dist(u) > delta(s, u). Alors il existe un chemin P de s a u de poids < dist(u). Ce chemin quitte l'ensemble des sommets visites a un certain moment : soit (x, y) le premier arc ou x est visite et y ne l'est pas.

dist(y) <= dist(x) + w(x, y) = delta(s, x) + w(x, y) <= poids de P jusqu'a y <= delta(s, u) < dist(u).

Mais u est le sommet non visite de dist minimale, donc dist(u) <= dist(y). Contradiction.

---

## 10. Theoreme flot max = coupe min (schema)

### Idees cles

1. Pour tout flot f et toute coupe (S, T) : |f| <= c(S, T). (Le flot ne peut pas depasser la capacite de la coupe.)

2. Ford-Fulkerson termine quand il n'y a plus de chemin augmentant dans le graphe residuel. A ce moment, l'ensemble S des sommets accessibles depuis s dans le residuel et T = V \ S forment une coupe.

3. Les arcs de S vers T sont satures (sinon il y aurait un arc residuel, et le sommet serait accessible). Les arcs de T vers S ont flot 0 (sinon il y aurait un arc arriere residuel).

4. Donc |f| = flot sortant de S - flot entrant = c(S, T) - 0 = c(S, T).

5. Combine avec (1), |f| = c(S, T) = min des coupes.

---

## Resume des methodes de preuve utiles en DS

| Methode | Quand l'utiliser |
|---------|-----------------|
| Recurrence sur n (sommets) | Proprietes des arbres, coloration |
| Recurrence sur m (aretes) | Formule d'Euler, arbres couvrants |
| Contradiction | Non-planarite, bipartite, NP-completude |
| Double comptage | Poignees de main, faces/aretes |
| Invariant de boucle | Correction d'algorithmes (Dijkstra, Prim) |
| Coupe et flot | Theoreme flot max = coupe min |
| Construction explicite | Montrer qu'un graphe EST biparti, planaire, etc. |
