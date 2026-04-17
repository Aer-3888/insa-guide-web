---
title: "Chapitre 2 -- Recurrences"
sidebar_position: 2
---

# Chapitre 2 -- Recurrences

> Les algorithmes recursifs produisent des equations de recurrence. Savoir les resoudre donne la complexite exacte.

**Poids au DS : ~6 points (exercice 1, presque chaque annee).**

---

## 1. Les trois methodes de resolution

| Methode | Quand l'utiliser | Type d'equation |
|---------|-----------------|-----------------|
| Equation caracteristique | Coefficients constants, lineaire | u_n = a*u_{n-1} + b*u_{n-2} + g(n) |
| Series generatrices | Cas generaux, demandee en DS | Toute recurrence lineaire |
| Theoreme maitre | Diviser pour regner | T(n) = a*T(n/b) + f(n) |

---

## 2. Methode de l'equation caracteristique

### Procedure en 5 etapes

**Forme generale :** u_n = a1*u_{n-1} + a2*u_{n-2} + ... + ak*u_{n-k} + g(n)

**Etape 1 -- Equation caracteristique (partie homogene)**

On pose u_n = r^n dans la partie homogene :
```
r^k - a1*r^{k-1} - a2*r^{k-2} - ... - ak = 0
```

**Etape 2 -- Trouver les racines r1, r2, ...**

Resoudre le polynome (souvent degre 2 en DS).

**Etape 3 -- Solution homogene**

- Racines distinctes r1, r2, ..., rk :
  ```
  u_n^{(h)} = C1*r1^n + C2*r2^n + ... + Ck*rk^n
  ```

- Racine r de multiplicite m :
  ```
  (C1 + C2*n + C3*n^2 + ... + Cm*n^{m-1}) * r^n
  ```

**Etape 4 -- Solution particuliere** (si g(n) != 0)

| g(n) | Essayer | Si alpha est racine de mult. m |
|------|---------|-------------------------------|
| c (constante) | A | A * n^m |
| c * n | A*n + B | (A*n + B) * n^m |
| c * n^2 | A*n^2 + B*n + C | (A*n^2 + B*n + C) * n^m |
| c * alpha^n | A * alpha^n | A * n^m * alpha^n |
| c * n * alpha^n | (A*n + B) * alpha^n | (A*n + B) * n^m * alpha^n |

**ATTENTION : Toujours verifier si alpha est racine de l'equation caracteristique !**
Si oui, multiplier la forme essayee par n^m (m = multiplicite).

**Etape 5 -- Solution generale + conditions initiales**
```
u_n = u_n^{(h)} + u_n^{(p)}
```
Utiliser u_0, u_1, ... pour determiner C1, C2, ...

---

## 3. Exemple detaille (type DS 2017/2021)

**Probleme :** u_n = u_{n-1} + 6*u_{n-2} + 5*3^n, u_0 = 2, u_1 = 0.

**Etape 1 :** Equation caracteristique de u_n = u_{n-1} + 6*u_{n-2} :
```
r^2 - r - 6 = 0
```

**Etape 2 :** Racines :
```
Delta = 1 + 24 = 25
r1 = (1+5)/2 = 3,  r2 = (1-5)/2 = -2
```

**Etape 3 :** Solution homogene :
```
u_n^{(h)} = A * 3^n + B * (-2)^n
```

**Etape 4 :** Solution particuliere pour g(n) = 5*3^n.
- 3 est racine simple (r1 = 3), donc on essaie C*n*3^n (pas C*3^n !).
- Substitution dans u_n = u_{n-1} + 6*u_{n-2} + 5*3^n :
  ```
  C*n*3^n = C*(n-1)*3^{n-1} + 6*C*(n-2)*3^{n-2} + 5*3^n
  ```
- Diviser par 3^{n-2} et simplifier : C = 3.
- Donc u_n^{(p)} = 3*n*3^n = n*3^{n+1}.

**Etape 5 :** Solution generale :
```
u_n = A*3^n + B*(-2)^n + n*3^{n+1}
```

Conditions initiales :
```
u_0 = 2 : A + B = 2
u_1 = 0 : 3A - 2B + 9 = 0  =>  3A - 2B = -9
```

Systeme : A = -1, B = 3.

**Solution finale :** u_n = -3^n + 3*(-2)^n + n*3^{n+1}

---

## 4. Series generatrices

### Principe

Encoder la suite dans une fonction :
```
F(x) = sum_{n>=0} u_n * x^n = u_0 + u_1*x + u_2*x^2 + ...
```

### Procedure

1. Multiplier l'equation de recurrence par x^n
2. Sommer pour tout n (a partir du bon indice)
3. Reconnaitre F(x) dans la somme
4. Resoudre pour F(x) (equation algebrique)
5. Decomposer F(x) en fractions partielles
6. Identifier les coefficients (developpement en serie)

### Formules a connaitre absolument

| Fonction | Developpement en serie |
|----------|----------------------|
| 1/(1-x) | sum x^n = 1 + x + x^2 + ... |
| 1/(1-ax) | sum a^n * x^n |
| 1/(1-x)^2 | sum (n+1) * x^n |
| x/(1-x)^2 | sum n * x^n |

### Exemple (type DS 2021)

**Probleme :** u_n = u_{n-2} + 8n*3^{n-2}, u_0 = 0, u_1 = 2.

**Etape 1 :** Definir F(x) = sum_{n>=0} u_n * x^n.

**Etape 2 :** Multiplier par x^n et sommer pour n >= 2 :
```
sum_{n>=2} u_n*x^n = sum_{n>=2} u_{n-2}*x^n + 8 * sum_{n>=2} n*3^{n-2}*x^n
```

- Gauche : F(x) - u_0 - u_1*x = F(x) - 2x
- Premier terme droite : x^2 * F(x)
- Second terme : 8x^2 * [3x/(1-3x)^2 + 2/(1-3x)]

**Etape 3 :** Resoudre :
```
F(x)(1 - x^2) = 2x + 8x^2 * [3x/(1-3x)^2 + 2/(1-3x)]
```

**Etape 4 :** Decomposer en fractions partielles et identifier les coefficients.

**Note DS :** En general, on demande la mise en equation et les premieres etapes. Aller jusqu'a la decomposition complete n'est pas toujours requis.

---

## 5. Resolution par deroulement

Pour les recurrences simples, "derouler" est souvent le plus rapide.

**Exemple 1 :** T(n) = T(n-1) + n, T(0) = 0
```
T(n) = T(n-1) + n = T(n-2) + (n-1) + n = ... = 1 + 2 + ... + n = n(n+1)/2 = O(n^2)
```

**Exemple 2 :** T(n) = 2*T(n/2) + n, T(1) = 1
```
T(n) = 2T(n/2) + n
     = 4T(n/4) + 2n
     = 8T(n/8) + 3n
     = 2^k * T(n/2^k) + k*n

Quand n/2^k = 1, k = log_2(n) :
T(n) = n + n*log(n) = O(n log n)
```

---

## 6. Methode des facteurs sommants

Pour T(n) = T(n/2) + g(n), T(1) = C :

```
T(n) = C + sum_{i=1}^{floor(log_2(n))} g(2^i)
```

**Exemple :** T(n) = T(n/2) + 2 => T(n) = C + 2*log_2(n) = O(log n)

---

## 7. Sommes utiles

```
1 + 2 + ... + n = n(n+1)/2
1 + 2 + 4 + ... + 2^k = 2^{k+1} - 1
sum_{i=0}^{k} a^i = (a^{k+1} - 1)/(a - 1)    si a != 1
sum_{i=0}^{inf} a^i = 1/(1-a)                  si |a| < 1
sum_{i=0}^{inf} i*a^i = a/(1-a)^2              si |a| < 1
```

---

## 8. Pieges classiques

1. **Oublier que alpha est racine** : Si g(n) = c*alpha^n et alpha est racine de l'eq. caract., il faut multiplier par n^m. C'est le piege numero 1 des DS.

2. **Se tromper dans les conditions initiales** : Bien substituer n = 0, n = 1 dans la solution generale (pas dans la recurrence).

3. **Mal appliquer le theoreme maitre** : Il ne s'applique qu'a T(n) = a*T(n/b) + f(n), pas aux recurrences lineaires a coefficients constants.

4. **Confondre les methodes** : Eq. caract. = recurrences lineaires. Theoreme maitre = diviser pour regner. Ce ne sont PAS les memes!

5. **Racines multiples** : Si r est racine double, les solutions sont r^n ET n*r^n.

---

## CHEAT SHEET -- Recurrences

```
EQUATION CARACTERISTIQUE :
  1. Partie homogene => r^k - a1*r^{k-1} - ... = 0
  2. Racines => solution homogene
     Distinctes : C1*r1^n + C2*r2^n
     Multiplicite m : (C1 + C2*n + ... + Cm*n^{m-1})*r^n
  3. Solution particuliere (VERIFIER si alpha est racine!)
  4. Solution = homogene + particuliere
  5. Conditions initiales => constantes

SERIES GENERATRICES :
  F(x) = sum u_n * x^n
  1/(1-x) = sum x^n
  1/(1-ax) = sum a^n x^n
  1/(1-x)^2 = sum (n+1) x^n
  x/(1-x)^2 = sum n x^n

THEOREME MAITRE :
  T(n) = a*T(n/b) + cn
  a < b => O(n)
  a = b => O(n log n)
  a > b => O(n^{log_b(a)})

SOMMES :
  sum_{i=1}^{n} i = n(n+1)/2
  sum_{i=0}^{k} 2^i = 2^{k+1} - 1
  sum_{i=0}^{k} a^i = (a^{k+1}-1)/(a-1)
```
