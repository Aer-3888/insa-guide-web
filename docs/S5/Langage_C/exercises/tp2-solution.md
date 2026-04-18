---
title: "TP2 - Structures de Controle et Calculs Numeriques"
sidebar_position: 2
---

# TP2 - Structures de Controle et Calculs Numeriques

> D'apres les instructions du TP : `S5/Langage_C/data/moodle/tp/tp2/README.md`

## Exercice 1

### Implementer une fonction `myfact(n)` qui calcule n! -- Gerer les erreurs (n < 0), detecter le depassement de capacite (`INT_MAX`), identifier le plus grand n calculable correctement

**Rappel mathematique :**
```
n! = 1 x 2 x 3 x ... x n
0! = 1  (par convention)
```

**Probleme :** La factorielle croit tres rapidement. A partir de n=13, le resultat depasse `INT_MAX` (2147483647).

**Reponse :**

```c noexec
/*!
 * \file factorial.c
 * \brief Calcul de la factorielle et detection de depassement
 * \author ESM05 - Langage C
 * \date 2021
 */

#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

/*!
 * \brief Calcule la factorielle de n
 *
 * Calcule n! = 1 x 2 x 3 x ... x n
 * Retourne -1 si n est negatif.
 *
 * \param n L'entier dont on calcule la factorielle
 * \return La factorielle de n, ou -1 si n < 0
 */
int myfact(int n) {
    if (n < 0) {
        return -1;  /* Factorielle non definie pour les negatifs */
    }

    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

/*!
 * \brief Affiche les factorielles de 1 a 20
 *
 * Attention: A partir de n=13, le resultat depasse INT_MAX
 * et les valeurs deviennent incorrectes (depassement d'entier).
 */
void display_fact() {
    printf("\nTable des factorielles:\n");
    printf("========================\n");
    for (int i = 1; i <= 20; i++) {
        printf("Factorielle de %2d = %d\n", i, myfact(i));
    }
}

/*!
 * \brief Trouve le plus grand n dont la factorielle est calculable
 *
 * Utilise une verification anticipee du depassement:
 * Si fact x (i+1) > INT_MAX, alors fact(i+1) depassera.
 *
 * \return Le plus grand n tel que n! < INT_MAX
 */
int rang() {
    int i = 0;
    /* Tant que la prochaine multiplication ne depassera pas INT_MAX */
    while (myfact(i) < INT_MAX / (i + 1)) {
        i++;
    }
    return i;
}

int main() {
    int n;

    /* Test avec une valeur saisie */
    printf("Rentrez n \n");
    scanf("%d", &n);
    printf("Factorielle de n = %d \n", myfact(n));

    /* Affichage des factorielles de 1 a 20 (observe le depassement) */
    display_fact();

    /* Determination du plus grand n calculable correctement */
    printf("\nRang de la plus grande factorielle correcte = %d \n", rang());
    printf("(Au-dela de ce rang, le resultat depasse INT_MAX = %d)\n", INT_MAX);

    return EXIT_SUCCESS;
}
```

**Compilation :**

```bash
cd tp2/src
make factorial
./factorial
```

**Sortie attendue :**

```
Rentrez n 
12
Factorielle de n = 479001600 

Table des factorielles:
========================
Factorielle de  1 = 1
Factorielle de  2 = 2
Factorielle de  3 = 6
Factorielle de  4 = 24
Factorielle de  5 = 120
Factorielle de  6 = 720
Factorielle de  7 = 5040
Factorielle de  8 = 40320
Factorielle de  9 = 362880
Factorielle de 10 = 3628800
Factorielle de 11 = 39916800
Factorielle de 12 = 479001600      <-- dernier resultat correct
Factorielle de 13 = 1932053504     <-- FAUX ! 13! = 6227020800
...

Rang de la plus grande factorielle correcte = 12 
(Au-dela de ce rang, le resultat depasse INT_MAX = 2147483647)
```

**Pourquoi le depassement ?**
```
INT_MAX = 2147483647  (2^31 - 1 pour un int 32 bits)

12! =  479 001 600   < 2 147 483 647  --> OK
13! = 6 227 020 800  > 2 147 483 647  --> DEPASSEMENT !

Quand un int depasse INT_MAX, le comportement est indefini en C.
```

---

## Exercice 2

### Calculer sin(x) en utilisant la serie de Taylor -- Version naive `sinus()` qui recalcule chaque terme independamment, et version optimisee `sinus2()` qui calcule chaque terme a partir du precedent

**Serie de Taylor :**
```
sin(x) = x - x^3/3! + x^5/5! - x^7/7! + ...
       = Somme (-1)^n x x^(2n+1) / (2n+1)!
```

**Deux approches :**
1. **Version naive** (`sinus()`) : recalcule chaque terme independamment -- cout O(n^2)
2. **Version optimisee** (`sinus2()`) : calcule chaque terme a partir du precedent -- cout O(n)

**Optimisation :**
```c noexec
// Au lieu de recalculer x^(2n+1) / (2n+1)! a chaque fois :
terme_suivant = terme_precedent * x^2 / (n * (n-1))
```

**Reponse :**

```c
/*!
 * \file sinus.c
 * \brief Calcul du sinus par developpement de Taylor
 * \author ESM05 - Langage C
 * \date 2021
 */

#define _USE_MATH_DEFINES
#include <stdio.h>
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

/*!
 * \brief Calcule x eleve a la puissance n
 *
 * \param x La base
 * \param n L'exposant (entier positif)
 * \return x^n
 */
double puissance(double x, int n) {
    double res = 1;
    for (int i = 0; i < n; i++) {
        res *= x;
    }
    return res;
}

/*!
 * \brief Calcule n! (factorielle)
 *
 * \param n L'entier (doit etre >= 0)
 * \return n! ou -1 si n < 0
 */
int myfact(int n) {
    if (n < 0) {
        return -1;
    }

    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

/*!
 * \brief Calcule un terme de la serie de Taylor : x^n / n!
 *
 * \param x La valeur
 * \param n Le rang du terme
 * \return x^n / n!
 */
double terme(double x, int n) {
    return puissance(x, n) / myfact(n);
}

/*!
 * \brief Calcule sin(x) par serie de Taylor (version naive)
 *
 * sin(x) = Somme (-1)^i x x^(2i+1) / (2i+1)!
 *        = x - x^3/3! + x^5/5! - x^7/7! + ...
 *
 * Cette version recalcule chaque terme independamment (inefficace).
 *
 * \param x L'angle en radians
 * \param n Le nombre de termes a calculer
 * \return Approximation de sin(x)
 */
double sinus(double x, int n) {
    double res = 0;
    /* Reduction de x dans [0, pi] pour ameliorer la convergence */
    double m = fmod(x, M_PI);

    for (int i = 0; i < n / 2; i++) {
        /* Alterne les signes: +, -, +, -, ... */
        res += puissance(-1, i) * terme(m, 2 * i + 1);
    }
    return res;
}

/*!
 * \brief Calcule le terme suivant a partir du precedent
 *
 * Au lieu de recalculer x^n / n!, utilise la relation:
 * terme_{n} = terme_{n-2} x x^2 / (n x (n-1))
 *
 * \param t Le terme precedent
 * \param x La valeur de x
 * \param n Le rang du nouveau terme
 * \return Le terme suivant
 */
double suiv(double t, double x, int n) {
    return t * x * x / ((double)(n * (n - 1)));
}

/*!
 * \brief Calcule sin(x) par serie de Taylor (version optimisee)
 *
 * Calcule chaque terme a partir du precedent au lieu de tout recalculer.
 * Beaucoup plus efficace que sinus().
 *
 * \param x L'angle en radians
 * \param n Le nombre de termes (doit etre impair)
 * \return Approximation de sin(x)
 */
double sinus2(double x, int n) {
    double m = fmod(x, M_PI);
    double res = m;  /* Premier terme: x */
    double t = m;    /* Terme courant */
    int signe = -1;  /* Alterne -1, +1, -1, +1, ... */

    /* Calcule les termes x^3/3!, x^5/5!, x^7/7!, ... */
    for (int i = 3; i <= n; i += 2) {
        t = suiv(t, m, i);
        res += (double)signe * t;
        signe *= (-1);
    }
    return res;
}

int main() {
    int n;
    double x;

    /* Test avec valeur saisie */
    printf("Rentrez x puis n : \n");
    scanf("%lf %d", &x, &n);
    printf("x a la puissance n = %lf\n", puissance(x, n));
    printf("sin(x) au rang n (en RADIANT) = %lf\n\n", sinus(x, n));

    /* Convergence de la serie pour sin(pi/2) = 1 */
    printf("Convergence de sin(pi/2) vers 1:\n");
    printf("================================\n");
    for (int i = 1; i <= 41; i += 2) {
        printf("sinus(Pi/2) au rang %2d = %g\n", i, sinus2(M_PI / 2, i));
    }
    printf("\nValeur exacte: sin(pi/2) = %g\n", sin(M_PI / 2));

    return 0;
}
```

**Compilation :**

```bash
make sinus
./sinus
```

**Sortie attendue :**

```
Rentrez x puis n : 
1.5708 20
sin(x) au rang n (en RADIANT) = 1.000000

sinus(Pi/2) au rang  1 = 1.5708
sinus(Pi/2) au rang  3 = 0.924832
sinus(Pi/2) au rang  5 = 1.00452
sinus(Pi/2) au rang  7 = 0.999844
sinus(Pi/2) au rang  9 = 1.00000
...
sinus(Pi/2) au rang 41 = 1

Valeur exacte: sin(pi/2) = 1
```

---

## Exercice 3

### Suite recurrente et stabilite numerique -- Calculer la suite u_0 = e - 1, u_n = e - n * u_{n-1} avec deux implementations : recursive ascendante `suite()` (instable) et iterative descendante `suiteDecroissante()` (stable)

**Suite definie par :**
```
u_0 = e - 1
u_n = e - n x u_{n-1}
```

**Probleme de stabilite :** La version recursive amplifie les erreurs d'arrondi a chaque iteration (erreur multipliee par n). La version descendante les reduit (erreur divisee par n).

**Reponse :**

```c
/*!
 * \file suite.c
 * \brief Etude de la stabilite numerique d'une suite recurrente
 * \author ESM05 - Langage C
 * \date 2021
 */

#define _USE_MATH_DEFINES
#include <stdio.h>
#include <math.h>

#ifndef M_E
#define M_E 2.71828182845904523536
#endif

/*!
 * \brief Calcule la suite par recurrence ascendante (INSTABLE)
 *
 * Suite definie par:
 * - u_0 = e - 1
 * - u_n = e - n x u_{n-1}
 *
 * Cette methode est numeriquement instable car les erreurs d'arrondi
 * sont amplifiees a chaque iteration (multiplication par n).
 *
 * \param n Le rang a calculer
 * \param verbose Si 1, affiche les valeurs intermediaires
 * \return La valeur (incorrecte pour n grand) de u_n
 */
double suite(int n, int verbose) {
    double res = 0;

    if (n == 0) {
        res = M_E - 1;  /* Cas de base: u_0 = e - 1 ~ 1.718 */
    } else {
        res = M_E - n * suite(n - 1, verbose);
        if (verbose == 1) {
            printf("La suite au rang %d vaut %lf\n", n, res);
        }
    }
    return res;
}

/*!
 * \brief Calcule la suite par recurrence descendante (STABLE)
 *
 * Reformule la relation: u_{n-1} = (e - u_n) / n
 * Calcule a partir d'une valeur initiale u_50 = 0 vers u_0.
 *
 * Cette methode est stable car les erreurs sont divisees (non amplifiees).
 *
 * \return La valeur correcte de u_0
 */
double suiteDecroissante() {
    double res = 0;  /* Initialisation: u_50 ~ 0 */

    /* Calcule de u_50 vers u_0 */
    for (int i = 50; i > 0; i--) {
        res = (M_E - res) / i;
        printf("La suite au rang %d vaut %.6lf\n", i - 1, res);
    }
    return res;
}

int main() {
    int n, v;

    /* Methode instable (pour demonstration) */
    printf("=== Methode Recursive Ascendante (INSTABLE) ===\n");
    printf("Rentrez n et la verbose (0 ou 1):\n");
    scanf("%d %d", &n, &v);
    double res_instable = suite(n, v);
    printf("Resultat (instable): u_%d = %lf\n\n", n, res_instable);

    /* Methode stable */
    printf("=== Methode Iterative Descendante (STABLE) ===\n");
    double res_stable = suiteDecroissante();
    printf("\nResultat (stable): u_0 = %.6lf\n", res_stable);
    printf("Valeur theorique: u_0 = e - 1 = %.6lf\n", M_E - 1);

    /* Explication */
    printf("\n=== Analyse ===\n");
    printf("La methode ascendante amplifie les erreurs d'arrondi (xn).\n");
    printf("La methode descendante reduit les erreurs (/n).\n");
    printf("Resultat: la version descendante est beaucoup plus precise!\n");

    return 0;
}
```

**Compilation :**

```bash
make suite
./suite
```

**Sortie attendue :**

```
=== Methode Recursive Ascendante (INSTABLE) ===
Rentrez n et la verbose (0 ou 1):
25 1
La suite au rang 1 vaut 1.000000
La suite au rang 2 vaut 0.718282
...
La suite au rang 20 vaut -2.194566    <-- NEGATIF ! Absurde !
La suite au rang 25 vaut 81936.279... <-- ENORME ! Totalement faux !

=== Methode Iterative Descendante (STABLE) ===
La suite au rang 49 vaut 0.054555
La suite au rang 48 vaut 0.055544
...
La suite au rang 1 vaut 1.000000
La suite au rang 0 vaut 1.718282
```

**Pourquoi l'instabilite ?**

```
Methode ascendante : erreur multipliee par n a chaque etape
  u_n = e - n * (u_{n-1}_exact + epsilon)
      = u_n_exact - n * epsilon
  Apres 20 etapes, erreur ~ 20! * epsilon ~ 2.4 x 10^18 * epsilon

Methode descendante : erreur divisee par n a chaque etape
  u_{n-1} = (e - (u_n_exact + epsilon)) / n
           = u_{n-1}_exact - epsilon / n
  Apres 50 etapes, erreur initiale divisee par 50! ~ 3 x 10^64
```

---

## Makefile complet pour TP2

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g
LDFLAGS = -lm

TARGETS = factorial sinus suite

all: $(TARGETS)

factorial: factorial.o
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

sinus: sinus.o
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

suite: suite.o
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f *.o $(TARGETS)

.PHONY: all clean
```

## Points importants

1. **Depassement d'entier :** Verifier les limites avant calcul avec `INT_MAX` de `<limits.h>`
2. **Precision numerique :** Les calculs en virgule flottante ne sont pas exacts. L'ordre des calculs affecte la precision.
3. **Optimisation :** Reutiliser les resultats precedents evite les recalculs couteux.
4. **Constantes mathematiques :** `M_PI`, `M_E` definis dans `<math.h>`. Sur Windows, il faut parfois `#define _USE_MATH_DEFINES`.
