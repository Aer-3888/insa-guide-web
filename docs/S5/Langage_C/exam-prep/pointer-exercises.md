---
title: "Exercices de Pointeurs et Memoire - Preparation Examen"
sidebar_position: 3
---

# Exercices de Pointeurs et Memoire - Preparation Examen

Les questions de pointeurs sont les plus difficiles de l'examen. Voici des exercices d'entrainement avec corrections detaillees.

---

## Exercice 1 : Tracage basique de pointeurs

**Remplir le tableau d'etat des variables apres chaque ligne :**

```c noexec
int a = 10, b = 20, c = 30;
int *p1 = &a;
int *p2 = &b;

*p1 = *p2;           /* Ligne 1 */
p1 = &c;             /* Ligne 2 */
*p2 = *p1 + 5;       /* Ligne 3 */
p2 = p1;             /* Ligne 4 */
*p1 = 100;           /* Ligne 5 */
```

**Solution :**
```
Etape  | a  | b  | c   | p1 | p2 | Explication
-------|----|----|-----|----|----|-----------------------------
init   | 10 | 20 | 30  | &a | &b |
L1     | 20 | 20 | 30  | &a | &b | *p1(=a) = *p2(=b) = 20
L2     | 20 | 20 | 30  | &c | &b | p1 pointe maintenant vers c
L3     | 20 | 35 | 30  | &c | &b | *p2(=b) = *p1(=c)+5 = 35
L4     | 20 | 35 | 30  | &c | &c | p2 pointe aussi vers c
L5     | 20 | 35 | 100 | &c | &c | *p1(=c) = 100
```

**Resultat final : a=20, b=35, c=100**

---

## Exercice 2 : Passage par reference

**Que produit ce programme ?**

```c noexec
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 5, y = 10;
    printf("Avant: x=%d y=%d\n", x, y);
    swap(&x, &y);
    printf("Apres: x=%d y=%d\n", x, y);
}
```

**Solution :**
```
Avant: x=5 y=10

Dans swap(&x, &y) :
  a = &x, b = &y
  temp = *a = 5
  *a = *b -> x = 10
  *b = temp -> y = 5

Apres: x=10 y=5
```

**Diagramme :**
```
AVANT :         DANS swap :              APRES :
x = 5           temp = 5                 x = 10
y = 10          x <- y (=10)             y = 5
                y <- temp (=5)
```

---

## Exercice 3 : Pointeurs et tableaux

**Que produit ce programme ?**

```c noexec
int tab[] = {10, 20, 30, 40, 50};
int *p = tab;

printf("%d\n", *p);         /* Ligne 1 */
printf("%d\n", *(p + 2));   /* Ligne 2 */
p += 3;
printf("%d\n", *p);         /* Ligne 3 */
printf("%d\n", p[-1]);      /* Ligne 4 */
printf("%d\n", p - tab);    /* Ligne 5 */
```

**Solution :**
```
Ligne 1 : *p = tab[0] = 10
Ligne 2 : *(p+2) = tab[2] = 30
           (p pointe toujours vers tab[0], on regarde 2 cases plus loin)
p += 3 :  p pointe maintenant vers tab[3]
Ligne 3 : *p = tab[3] = 40
Ligne 4 : p[-1] = *(p-1) = tab[2] = 30
Ligne 5 : p - tab = 3 (difference d'indices, pas d'octets)

Sortie :
10
30
40
30
3
```

---

## Exercice 4 : Structures et pointeurs

**Que produit ce programme ?**

```c noexec
typedef struct {
    int x, y;
} Point;

void deplacer(Point *p, int dx, int dy) {
    p->x += dx;
    p->y += dy;
}

void copier(Point src, Point *dst) {
    dst->x = src.x;
    dst->y = src.y;
}

int main() {
    Point a = {1, 2};
    Point b = {10, 20};
    
    deplacer(&a, 3, 4);
    printf("a=(%d,%d)\n", a.x, a.y);
    
    copier(a, &b);
    printf("b=(%d,%d)\n", b.x, b.y);
    
    a.x = 100;
    printf("a=(%d,%d) b=(%d,%d)\n", a.x, a.y, b.x, b.y);
}
```

**Solution :**
```
deplacer(&a, 3, 4) : a.x = 1+3 = 4, a.y = 2+4 = 6
-> a=(4,6)

copier(a, &b) : b.x = a.x = 4, b.y = a.y = 6
-> b=(4,6)

a.x = 100 : modifie seulement a (b est une COPIE independante)
-> a=(100,6) b=(4,6)
```

---

## Exercice 5 : Allocation dynamique et fuites

**Identifier les erreurs et fuites memoire :**

```c noexec
int main() {
    int *p = (int *)malloc(5 * sizeof(int));
    
    for (int i = 0; i <= 5; i++) {   /* ERREUR 1 */
        p[i] = i * 10;
    }
    
    int *q = p;
    p = (int *)malloc(10 * sizeof(int));  /* ERREUR 2 */
    
    free(p);
    free(q);
    
    printf("%d\n", *q);  /* ERREUR 3 */
    
    return 0;
}
```

**Erreurs :**
```
ERREUR 1 : i <= 5 devrait etre i < 5
            p[5] est hors limites (buffer overflow) !
            Le tableau n'a que les indices 0 a 4.

ERREUR 2 : p = malloc(10 * sizeof(int))
            L'ancien bloc de 5 ints n'est PAS perdu grace a q.
            Mais si on n'avait pas q, ce serait une fuite memoire.

ERREUR 3 : Utilisation de q apres free(q) -> use-after-free !
            Le comportement est INDEFINI (peut crasher ou afficher n'importe quoi).
```

**Version corrigee :**
```c noexec
int main() {
    int *p = (int *)malloc(5 * sizeof(int));
    if (p == NULL) return 1;
    
    for (int i = 0; i < 5; i++) {    /* < 5, pas <= 5 */
        p[i] = i * 10;
    }
    
    int *q = p;                       /* q sauvegarde l'ancien bloc */
    p = (int *)malloc(10 * sizeof(int));
    if (p == NULL) { free(q); return 1; }
    
    /* Utiliser p et q ici... */
    
    free(q);                          /* Liberer l'ancien bloc */
    free(p);                          /* Liberer le nouveau bloc */
    /* Ne plus utiliser ni p ni q apres free ! */
    
    return 0;
}
```

---

## Exercice 6 : Tracage memoire complet

**Dessiner l'etat de la memoire apres chaque operation :**

```c noexec
int main() {
    int *a = (int *)malloc(sizeof(int));
    *a = 42;
    
    int *b = a;
    
    int *c = (int *)malloc(sizeof(int));
    *c = *a + 10;
    
    free(a);
    a = c;
    
    printf("%d %d\n", *a, *c);
}
```

**Trace :**
```
Etape 1: a = malloc(sizeof(int))
  HEAP: [42]    a --> [42]

Etape 2: b = a
  HEAP: [42]    a --> [42] <-- b   (a et b pointent vers le MEME bloc)

Etape 3: c = malloc(sizeof(int)), *c = 52
  HEAP: [42] [52]    a --> [42] <-- b    c --> [52]

Etape 4: free(a), a = c
  HEAP: [???] [52]    a --> [52] <-- c    b --> [???] (DANGLING !)
                       ^
                       |
                       a pointe maintenant vers le bloc de c

Sortie: 52 52
(a et c pointent vers le meme bloc contenant 52)
```

**ATTENTION :** `b` est maintenant un **pointeur dangling** : il pointe vers de la memoire liberee. Toute utilisation de `*b` est un comportement indefini.

---

## Exercice 7 : Double pointeur et liste

**Que produit ce code ?**

```c noexec
void ajouter(int **ptr) {
    *ptr = (int *)malloc(sizeof(int));
    **ptr = 99;
}

int main() {
    int *p = NULL;
    ajouter(&p);
    printf("%d\n", *p);
    free(p);
}
```

**Solution :**
```
main() : p = NULL
ajouter(&p) :
  ptr = &p     (ptr pointe vers le pointeur p)
  *ptr = malloc(...)  (modifie p : p pointe maintenant vers un bloc alloue)
  **ptr = 99   (*ptr = p, **ptr = *p = 99)

Retour dans main() :
  p pointe vers un bloc contenant 99
  printf -> 99
  free(p) -> libere correctement
```

**Pourquoi `int **ptr` ?**
On veut modifier le **pointeur** p (pas la valeur pointee). Pour modifier une variable dans une fonction, il faut passer son adresse. L'adresse d'un `int*` est un `int**`.

---

## Methode de resolution systematique pour l'examen

1. **Creer un tableau** avec une colonne par variable et une ligne par instruction
2. **Pour chaque ligne, identifier** : qui est modifie et comment
3. **Distinguer** :
   - `p = ...` modifie le **pointeur** (ou il pointe)
   - `*p = ...` modifie la **valeur pointee** (ce qu'il y a a l'adresse)
4. **Dessiner des fleches** pour les pointeurs
5. **Attention aux alias** : si `p` et `q` pointent vers la meme adresse, modifier `*p` modifie aussi `*q`
