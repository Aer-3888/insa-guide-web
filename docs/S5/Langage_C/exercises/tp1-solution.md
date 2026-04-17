---
title: "TP1 - Introduction au C : Pointeurs et Fonctions"
sidebar_position: 1
---

# TP1 - Introduction au C : Pointeurs et Fonctions

> Following teacher instructions from: `S5/Langage_C/data/moodle/tp/tp1/README.md`

## Exercice 1

### Implementer une fonction `carre()` qui prend un pointeur vers un `double` en parametre, eleve la valeur au carre en place (modifie la valeur pointee), et retourne le resultat

**Concepts cles :**
- Dereferencement de pointeur (`*ptr`)
- Modification par reference
- Operateur d'assignation composee (`*=`)

**Diagramme memoire : passage par valeur vs passage par reference**

```
PASSAGE PAR VALEUR (ce qu'on ne veut PAS ici) :
================================================================

main()                          carre_val(double a)
+----------+---------+          +----------+---------+
| n        |   5.0   | 0x1000  | a (copie)|   5.0   | 0x2008
+----------+---------+          +----------+---------+
                                      |
                                      v  a *= a
                                +----------+---------+
                                | a (copie)|  25.0   | 0x2008
                                +----------+---------+

Retour dans main() : n vaut toujours 5.0  !! La copie est detruite.


PASSAGE PAR REFERENCE (avec pointeur) :
================================================================

main()                          carre(double *a)
+----------+---------+          +----------+---------+
| n        |   5.0   | 0x1000  | a (ptr)  | 0x1000  | 0x2008
+----------+---------+          +----------+---------+
      ^                               |
      |_______________________________|
           a pointe vers n

Apres *a *= *a :
+----------+---------+          +----------+---------+
| n        |  25.0   | 0x1000  | a (ptr)  | 0x1000  | 0x2008
+----------+---------+          +----------+---------+

Retour dans main() : n vaut 25.0 -- modifie via le pointeur !
```

**Answer:**

```c
/*!
 * \file main.c
 * \brief TP1 - Manipulation de pointeurs et calculs mathematiques
 * \author ESM05 - Langage C
 * \date 2021
 */

#include <stdio.h>
#include <math.h>

/*!
 * \brief Eleve un nombre au carre en place (modifie la valeur pointee)
 *
 * Cette fonction demontre le passage par reference en C.
 * La valeur est modifiee directement en memoire via le pointeur.
 *
 * \param a Pointeur vers le nombre a elever au carre
 * \return La valeur du carre (la variable pointee est aussi modifiee)
 */
double carre(double* a) {
    return (*a) *= (*a);
    /* Decomposition :
     * Etape 1 : (*a) dereference le pointeur, lit la valeur
     * Etape 2 : (*a) *= (*a) est equivalent a *a = *a * *a
     *           Calcule 5.0 * 5.0 = 25.0 et stocke a l'adresse pointee
     * Etape 3 : return retourne la valeur 25.0
     */
}

/* (norme() sera ajoutee dans l'exercice 2) */

int main() {
    double n;

    /* Test de la fonction carre() */
    printf("Nombre a elever au carre : \n");
    scanf("%lf", &n);     /* &n passe l'ADRESSE de n a scanf */
    carre(&n);            /* &n passe l'ADRESSE de n a carre() */
    printf("Resultat \n");
    printf("%lf\n", n);   /* n a ete modifie par carre() via le pointeur */

    return 0;
}
```

**Compilation:**

```bash
gcc -Wall -Wextra -std=c11 -g -o main main.c -lm
```

**Expected output:**

```
Nombre a elever au carre : 
5
Resultat 
25.000000
```

---

## Exercice 2

### Implementer une fonction `norme()` qui prend deux `double` (coordonnees x, y) en parametre, calcule et retourne la norme euclidienne sqrt(x^2 + y^2), en utilisant la fonction `sqrt()` de `<math.h>`

**Formule :**
```
norme(x, y) = sqrt(x^2 + y^2)
```

Contrairement a `carre()`, ici on passe les parametres par valeur. On ne modifie pas x et y, on calcule un resultat et on le retourne.

**Diagramme memoire : passage par valeur**

```
main()                              norme(double x, double y)
+-----------+---------+             +-----------+---------+
| x_main    |   3.0   | 0x1000     | x (copie) |   3.0   | 0x2000
+-----------+---------+             +-----------+---------+
| y_main    |   4.0   | 0x1008     | y (copie) |   4.0   | 0x2008
+-----------+---------+             +-----------+---------+
| resultat  |   ???   | 0x1010     

Les copies x et y sont independantes de x_main et y_main.
Modifier x dans norme() ne changerait PAS x_main.
```

**Answer:**

```c
/*!
 * \file main.c
 * \brief TP1 - Manipulation de pointeurs et calculs mathematiques
 * \author ESM05 - Langage C
 * \date 2021
 */

#include <stdio.h>
#include <math.h>

/*!
 * \brief Eleve un nombre au carre en place (modifie la valeur pointee)
 *
 * \param a Pointeur vers le nombre a elever au carre
 * \return La valeur du carre (la variable pointee est aussi modifiee)
 */
double carre(double* a) {
    return (*a) *= (*a);
}

/*!
 * \brief Calcule la norme euclidienne d'un vecteur 2D
 *
 * La norme d'un vecteur (x, y) est calculee comme :
 * norme = sqrt(x^2 + y^2)
 *
 * \param x Coordonnee x du vecteur
 * \param y Coordonnee y du vecteur
 * \return La norme du vecteur
 */
double norme(double x, double y) {
    return sqrt(x*x + y*y);
    /* On utilise x*x plutot que pow(x, 2) car la multiplication
     * directe est plus rapide que l'appel a pow() */
}

int main() {
    double n;

    /* Test de la fonction carre() */
    printf("Nombre a elever au carre : \n");
    scanf("%lf", &n);
    carre(&n);  /* Passage par reference: &n est l'adresse de n */
    printf("Resultat \n");
    printf("%lf\n", n);

    /* Test de la fonction norme() */
    double x, y, resultat;
    printf(" \n Vector \n");
    scanf("%lf %lf", &x, &y);
    resultat = norme(x, y);  /* Passage par valeur */
    printf("%lf\n", resultat);

    return 0;
}
```

**Makefile:**

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g
LDFLAGS = -lm

TARGET = main
SOURCES = main.c
OBJECTS = $(SOURCES:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $<

clean:
	rm -f $(OBJECTS) $(TARGET)

run: $(TARGET)
	./$(TARGET)

.PHONY: all clean run
```

**Compilation:**

```bash
cd tp1/src
make
./main
```

**Expected output:**

```
Nombre a elever au carre : 
5
Resultat 
25.000000
 
 Vector 
3 4
5.000000
```

---

## Recapitulatif : passage par valeur vs reference

```
+--------------------+-------------------------------+-------------------------------+
|                    | Passage par VALEUR            | Passage par REFERENCE         |
+--------------------+-------------------------------+-------------------------------+
| Declaration        | double norme(double x, ...)   | double carre(double *a)       |
| Appel              | resultat = norme(x, y);       | carre(&n);                    |
| Copie ?            | Oui, x et y sont copies       | Non, a recoit l'adresse de n  |
| Modification ?     | Impossible de modifier         | Peut modifier via *a          |
|                    | les variables de l'appelant   |                               |
| Quand utiliser ?   | Lecture seule, calcul          | Modification en place         |
+--------------------+-------------------------------+-------------------------------+
```

## Points importants

1. **Pointeurs vs Valeurs :**
   - `carre()` utilise un pointeur pour modifier la variable en place
   - `norme()` prend des valeurs et retourne un resultat

2. **Bibliotheque Mathematique :**
   - `#include <math.h>` pour les fonctions mathematiques
   - Lier avec `-lm` lors de la compilation

3. **Format d'Entree/Sortie :**
   - `%lf` pour lire des `double` avec `scanf()`
   - `scanf()` prend toujours des adresses (`&variable`)
   - `printf()` prend des valeurs directement

## Erreurs courantes

**Oublier `-lm` :**
```bash
$ gcc -Wall main.c -o main
/usr/bin/ld: main.o: undefined reference to `sqrt'
# Solution : ajouter -lm a la fin
```

**Oublier `&` dans `scanf` :**
```c
scanf("%lf", n);   /* FAUX -- n est une valeur, pas une adresse */
scanf("%lf", &n);  /* CORRECT -- &n est l'adresse de n */
```

**Confondre `%f` et `%lf` dans `scanf` :**
```c
double n;
scanf("%f", &n);   /* FAUX -- %f est pour float, pas double */
scanf("%lf", &n);  /* CORRECT -- %lf est pour double */
```
