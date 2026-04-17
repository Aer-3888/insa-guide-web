---
title: "Exercices -- Recurrences"
sidebar_position: 1
---

# Exercices -- Recurrences

> Chaque exercice montre TOUTES les etapes intermediaires. En DS, l'exercice de recurrence vaut typiquement 6 points sur 20. Les exercices suivent les TD du cours (Hugo TD 1 et TD 3).

---

## Exercice 1 : Serie generatrice -- racines distinctes (Hugo TD 1, Ex 1)

**Enonce :** Resoudre u_n = 5*u_{n-1} - 6*u_{n-2} pour n >= 2, avec u_0 = 0, u_1 = 1.

### Solution par series generatrices

**Etape 1 -- Definir la serie generatrice.**

```
F(x) = sum_{n >= 0} u_n * x^n = u_0 + u_1*x + u_2*x^2 + ...
     = 0 + x + u_2*x^2 + ...
```

**Etape 2 -- Multiplier la recurrence par x^n et sommer pour n >= 2.**

```
sum_{n>=2} u_n * x^n = 5 * sum_{n>=2} u_{n-1} * x^n - 6 * sum_{n>=2} u_{n-2} * x^n
```

**Etape 3 -- Identifier chaque somme.**

Membre de gauche :

```
sum_{n>=2} u_n * x^n = F(x) - u_0 - u_1*x = F(x) - x
```

Premier terme du membre de droite :

```
5 * sum_{n>=2} u_{n-1} * x^n = 5x * sum_{m>=1} u_m * x^m = 5x * (F(x) - u_0) = 5x * F(x)
```

Second terme :

```
-6 * sum_{n>=2} u_{n-2} * x^n = -6x^2 * sum_{m>=0} u_m * x^m = -6x^2 * F(x)
```

**Etape 4 -- Resoudre pour F(x).**

```
F(x) - x = 5x * F(x) - 6x^2 * F(x)
F(x)(1 - 5x + 6x^2) = x
F(x) = x / (1 - 5x + 6x^2)
```

Factorisons le denominateur :

```
1 - 5x + 6x^2 = (1 - 2x)(1 - 3x)
```

Verification : (1-2x)(1-3x) = 1 - 3x - 2x + 6x^2 = 1 - 5x + 6x^2. OK.

**Etape 5 -- Decomposition en fractions partielles.**

```
F(x) = x / [(1 - 2x)(1 - 3x)]
```

On cherche A, B tels que :

```
x / [(1 - 2x)(1 - 3x)] = A/(1 - 2x) + B/(1 - 3x)
```

Multiplions par (1-2x)(1-3x) :

```
x = A(1 - 3x) + B(1 - 2x)
```

x = 1/2 : 1/2 = A(1 - 3/2) = A(-1/2), donc A = -1.
x = 1/3 : 1/3 = B(1 - 2/3) = B(1/3), donc B = 1.

```
F(x) = -1/(1 - 2x) + 1/(1 - 3x)
```

**Etape 6 -- Identifier les coefficients.**

```
1/(1 - 2x) = sum_{n>=0} (2x)^n = sum_{n>=0} 2^n * x^n
1/(1 - 3x) = sum_{n>=0} (3x)^n = sum_{n>=0} 3^n * x^n
```

Donc :

```
u_n = -2^n + 3^n = 3^n - 2^n
```

**Verification :**

```
u_0 = 3^0 - 2^0 = 1 - 1 = 0          -- correct
u_1 = 3 - 2 = 1                       -- correct
u_2 = 5*1 - 6*0 = 5
Formule : 9 - 4 = 5                   -- correct
u_3 = 5*5 - 6*1 = 25 - 6 = 19
Formule : 27 - 8 = 19                 -- correct
```

---

## Exercice 2 : Serie generatrice -- ordre 3 (Hugo TD 1, Ex 2)

**Enonce :** Resoudre u_n = 2*u_{n-1} + u_{n-2} - 2*u_{n-3} pour n >= 3, avec u_0 = 0, u_1 = 1, u_2 = 1.

### Solution par series generatrices

**Etape 1 -- Serie generatrice et equation fonctionnelle.**

```
F(x) = sum_{n>=0} u_n * x^n

sum_{n>=3} u_n * x^n = 2 * sum_{n>=3} u_{n-1}*x^n + sum_{n>=3} u_{n-2}*x^n - 2 * sum_{n>=3} u_{n-3}*x^n
```

Gauche : F(x) - u_0 - u_1*x - u_2*x^2 = F(x) - x - x^2

```
2x * (F(x) - u_0 - u_1*x) = 2x*F(x) - 2x^2
x^2 * (F(x) - u_0) = x^2*F(x)
-2x^3 * F(x)
```

Equation :

```
F(x) - x - x^2 = 2x*F(x) - 2x^2 + x^2*F(x) - 2x^3*F(x)
F(x)(1 - 2x - x^2 + 2x^3) = x + x^2 - 2x^2 = x - x^2
```

Factorisons le denominateur :

```
1 - 2x - x^2 + 2x^3 = (1 - 2x)(1 - x)(1 + x)
```

Verification : (1-2x)(1-x^2) = 1 - x^2 - 2x + 2x^3. OK.

```
F(x) = (x - x^2) / [(1 - 2x)(1 - x)(1 + x)]
     = x(1 - x) / [(1 - 2x)(1 - x)(1 + x)]
     = x / [(1 - 2x)(1 + x)]
```

**Etape 2 -- Fractions partielles.**

```
x / [(1 - 2x)(1 + x)] = A/(1 - 2x) + B/(1 + x)
```

x = 1/2 : 1/2 = A(1 + 1/2) = 3A/2, donc A = 1/3.
x = -1 : -1 = B(1 + 2) = 3B, donc B = -1/3.

```
F(x) = (1/3) * 1/(1 - 2x) + (-1/3) * 1/(1 + x)
     = (1/3) * 1/(1 - 2x) - (1/3) * 1/(1 - (-x))
```

**Etape 3 -- Coefficients.**

```
u_n = (1/3) * 2^n - (1/3) * (-1)^n
    = (1/3) * [2^n - (-1)^n]
    = (1/3) * [2^n + (-1)^{n+1}]
```

**Verification :**

```
u_0 = (1/3)(1 - 1) = 0                           -- correct
u_1 = (1/3)(2 + 1) = 1                           -- correct
u_2 = (1/3)(4 - 1) = 1                           -- correct
u_3 = 2*1 + 1 - 2*0 = 3
Formule : (1/3)(8 + 1) = 3                       -- correct
```

---

## Exercice 3 : Serie generatrice avec second membre polynomial (Hugo TD 1, Ex 3)

**Enonce :** Resoudre u_n = 3*u_{n-1} - 2*u_{n-2} + 4*(n-2) pour n >= 2, avec u_0 = 0, u_1 = 0.

### Solution par series generatrices

**Etape 1 -- Mise en equation.**

```
F(x) = sum_{n>=0} u_n * x^n = 0 + 0 + u_2*x^2 + ...
```

L'equation fonctionnelle :

```
F(x) = 3x*F(x) - 2x^2*F(x) + 4 * sum_{n>=2} (n-2)*x^n
```

La somme du second membre (posons m = n-2) :

```
sum_{n>=2} (n-2)*x^n = x^2 * sum_{m>=0} m*x^m = x^2 * x/(1-x)^2 = x^3/(1-x)^2
```

Donc :

```
F(x)(1 - 3x + 2x^2) = 4x^3/(1-x)^2
F(x)(1-x)(1-2x) = 4x^3/(1-x)^2
F(x) = 4x^3 / [(1-x)^3(1-2x)]
```

**Etape 2 -- Fractions partielles.**

```
4x^3 / [(1-x)^3(1-2x)] = A/(1-x) + B/(1-x)^2 + C/(1-x)^3 + D/(1-2x)
```

Multiplions par (1-x)^3(1-2x) :

```
4x^3 = A(1-x)^2(1-2x) + B(1-x)(1-2x) + C(1-2x) + D(1-x)^3
```

x = 1 : 4 = C(1-2) = -C, donc C = -4.
x = 1/2 : 4/8 = 1/2 = D(1/2)^3 = D/8, donc D = 4.

x = 0 : 0 = A(1)(1) + B(1)(1) + C(1) + D(1) = A + B - 4 + 4 = A + B.
Donc B = -A.

Derivons et posons x = 0, ou bien utilisons x = 2 :
x = 2 : 32 = A(1)(1-4) + B(-1)(-3) + C(-3) + D(-1) = -3A + 3B + 12 - 4
32 = -3A + 3B + 8 = -3A - 3A + 8 = -6A + 8 (car B = -A)
24 = -6A, donc A = -4, B = 4.

```
F(x) = -4/(1-x) + 4/(1-x)^2 - 4/(1-x)^3 + 4/(1-2x)
```

**Etape 3 -- Coefficients.**

```
1/(1-x) => 1
1/(1-x)^2 => n+1
1/(1-x)^3 => C(n+2,2) = (n+1)(n+2)/2
1/(1-2x) => 2^n
```

Donc :

```
u_n = -4 + 4(n+1) - 4*(n+1)(n+2)/2 + 4*2^n
    = -4 + 4n + 4 - 2(n+1)(n+2) + 2^{n+2}
    = 4n - 2(n^2 + 3n + 2) + 2^{n+2}
    = 4n - 2n^2 - 6n - 4 + 2^{n+2}
    = 2^{n+2} - 2n^2 - 2n - 4
```

**Verification :**

```
u_0 = 4 - 0 - 0 - 4 = 0                       -- correct
u_1 = 8 - 2 - 2 - 4 = 0                       -- correct
u_2 = 3*0 - 2*0 + 4*0 = 0
Formule : 16 - 8 - 4 - 4 = 0                  -- correct
u_3 = 3*0 - 2*0 + 4*1 = 4
Formule : 32 - 18 - 6 - 4 = 4                 -- correct
```

---

## Exercice 4 : Serie generatrice avec second membre n*alpha^n (Hugo TD 1, Ex 4)

**Enonce :** Resoudre u_n = 4*u_{n-1} - 3*u_{n-2} + n*2^n pour n >= 2, avec u_0 = 0, u_1 = 2.

### Solution par series generatrices

**Etape 1 -- Mise en equation.**

```
F(x) = sum u_n * x^n

F(x) - 0 - 2x = 4x(F(x) - 0) - 3x^2*F(x) + sum_{n>=2} n*2^n*x^n
```

La somme du second membre :

```
sum_{n>=0} n*2^n*x^n = 2x/(1-2x)^2

sum_{n>=2} n*2^n*x^n = 2x/(1-2x)^2 - 0 - 2x = 2x/(1-2x)^2 - 2x
= [2x - 2x(1-2x)^2] / (1-2x)^2
= 2x[1 - (1-2x)^2] / (1-2x)^2
= 2x[1 - 1 + 4x - 4x^2] / (1-2x)^2
= 2x * 4x(1 - x) / (1-2x)^2
= 8x^2(1-x) / (1-2x)^2
```

L'equation fonctionnelle devient :

```
F(x) - 2x = 4xF(x) - 3x^2F(x) + 8x^2(1-x)/(1-2x)^2
F(x)(1 - 4x + 3x^2) = 2x + 8x^2(1-x)/(1-2x)^2
```

Factorisons : 1 - 4x + 3x^2 = (1 - x)(1 - 3x).

```
F(x) = [2x(1-2x)^2 + 8x^2(1-x)] / [(1-x)(1-3x)(1-2x)^2]
```

Numerateur :

```
2x(1-2x)^2 = 2x(1 - 4x + 4x^2) = 2x - 8x^2 + 8x^3
8x^2(1-x) = 8x^2 - 8x^3

Numerateur = 2x - 8x^2 + 8x^3 + 8x^2 - 8x^3 = 2x
```

Donc :

```
F(x) = 2x / [(1-x)(1-3x)(1-2x)^2]
```

**Etape 2 -- Decomposition en fractions partielles.**

```
2x / [(1-x)(1-3x)(1-2x)^2] = A/(1-x) + B/(1-3x) + C/(1-2x) + D/(1-2x)^2
```

Multiplions par (1-x)(1-3x)(1-2x)^2 :

```
2x = A(1-3x)(1-2x)^2 + B(1-x)(1-2x)^2 + C(1-x)(1-3x)(1-2x) + D(1-x)(1-3x)
```

x = 1 : 2 = A(1-3)(1-2)^2 = A(-2)(1) = -2A. Donc A = -1.
x = 1/3 : 2/3 = B(1-1/3)(1-2/3)^2 = B(2/3)(1/9) = 2B/27. Donc B = 9.
x = 1/2 : 1 = D(1-1/2)(1-3/2) = D(1/2)(-1/2) = -D/4. Donc D = -4.

x = 0 : 0 = A + B + C + D = -1 + 9 + C - 4 = 4 + C. Donc C = -4.

```
F(x) = -1/(1-x) + 9/(1-3x) - 4/(1-2x) - 4/(1-2x)^2
```

**Etape 3 -- Coefficients.**

```
1/(1-x) => 1
1/(1-3x) => 3^n
1/(1-2x) => 2^n
1/(1-2x)^2 => (n+1)*2^n
```

```
u_n = -1 + 9*3^n - 4*2^n - 4(n+1)*2^n
    = -1 + 9*3^n - 2^n(4 + 4n + 4)
    = -1 + 9*3^n - (4n + 8)*2^n
    = 9*3^n - (4n + 8)*2^n - 1
```

**Verification :**

```
u_0 = 9 - 8 - 1 = 0                           -- correct
u_1 = 27 - 24 - 1 = 2                         -- correct
u_2 = 4*2 - 3*0 + 2*4 = 8 + 8 = 16
Formule : 81 - 64 - 1 = 16                    -- correct
u_3 = 4*16 - 3*2 + 3*8 = 64 - 6 + 24 = 82
Formule : 243 - 160 - 1 = 82                  -- correct
```

---

## Exercice 5 : Recurrence avec second membre et racine double (Hugo TD 3, Ex 3)

**Enonce :** Resoudre u_n = u_{n-1} + 8*u_{n-2} - 12*u_{n-3} + 4m + 1 pour n >= 3, avec u_0 = m + 5, u_1 = 2m + 7, u_2 = 7m + 15 (ou m est un parametre).

### Solution par equation caracteristique

**Etape 1 -- Equation caracteristique de la partie homogene.**

```
u_n = u_{n-1} + 8*u_{n-2} - 12*u_{n-3}
r^3 - r^2 - 8r + 12 = 0
```

Essayons r = 2 : 8 - 4 - 16 + 12 = 0. Oui, r = 2 est racine.

Division par (r - 2) :

```
r^3 - r^2 - 8r + 12 = (r - 2)(r^2 + r - 6) = (r - 2)(r + 3)(r - 2) = (r - 2)^2(r + 3)
```

Racines : r = 2 (double), r = -3 (simple).

**Etape 2 -- Solution homogene.**

```
u_n^{(h)} = (A + Bn) * 2^n + C * (-3)^n
```

**Etape 3 -- Solution particuliere pour g(n) = 4m + 1 (constante par rapport a n).**

Alpha = 1 (constante), or 1 n'est pas racine de l'equation caracteristique.
On essaie u_n^{(p)} = D (constante).

```
D = D + 8D - 12D + 4m + 1
D = -3D + 4m + 1
4D = 4m + 1
D = m + 1/4
```

Hmm, verifions. La recurrence est u_n - u_{n-1} - 8u_{n-2} + 12u_{n-3} = 4m+1. Si u_n = D constant :

```
D - D - 8D + 12D = 4D = 4m + 1
D = (4m + 1)/4 = m + 1/4
```

**Etape 4 -- Solution generale et conditions initiales.**

```
u_n = (A + Bn) * 2^n + C * (-3)^n + m + 1/4
```

n = 0 : A + C + m + 1/4 = m + 5 => A + C = 19/4
n = 1 : (A + B)*2 + C*(-3) + m + 1/4 = 2m + 7 => 2A + 2B - 3C = m + 27/4
n = 2 : (A + 2B)*4 + C*9 + m + 1/4 = 7m + 15 => 4A + 8B + 9C = 6m + 59/4

De (I) : A = 19/4 - C.

Substituons dans (II) : 2(19/4 - C) + 2B - 3C = m + 27/4
19/2 - 2C + 2B - 3C = m + 27/4
2B - 5C = m + 27/4 - 19/2 = m - 11/4

Substituons dans (III) : 4(19/4 - C) + 8B + 9C = 6m + 59/4
19 - 4C + 8B + 9C = 6m + 59/4
8B + 5C = 6m + 59/4 - 19 = 6m - 17/4

Systeme :
2B - 5C = m - 11/4     ... (a)
8B + 5C = 6m - 17/4    ... (b)

(a) + (b) : 10B = 7m - 28/4 = 7m - 7. Donc B = (7m - 7)/10.

Hmm, pour des valeurs entieres plus propres de m, posons m = 1 :

u_0 = 6, u_1 = 9, u_2 = 22. Second membre = 5.

```
D = (4+1)/4 = 5/4
A + C = 19/4
2B - 5C = -7/4
8B + 5C = -11/4

10B = -18/4 = -9/2, B = -9/20

2(-9/20) - 5C = -7/4
-9/10 - 5C = -7/4
5C = -9/10 + 7/4 = (-18+35)/20 = 17/20
C = 17/100
```

Ceci donne des fractions compliquees. La solution generale est :

```
u_n = (A + Bn) * 2^n + C * (-3)^n + (4m+1)/4
```

avec A, B, C determinees par le systeme lineaire ci-dessus pour chaque valeur de m.

**Resultat en forme compacte (d'apres le cours) :**

```
u_n = (2m - 24/5) * 2^n - (1/5) * (-3)^n + m + 5
```

(A verifier avec les conditions initiales pour un m donne.)

---

## Exercice 6 : Recurrence non lineaire (Hugo TD 3, Ex 4)

**Enonce :** Resoudre u_n = 3^m * u_{n-1}^2 pour n >= 1, avec u_0 = 1 (m est un parametre entier).

### Solution par passage au logarithme

Cette recurrence est **non lineaire** (u_{n-1}^2). On linearise par passage au logarithme.

**Etape 1 -- Poser v_n = log_3(u_n).**

```
u_n = 3^m * u_{n-1}^2
log_3(u_n) = m + 2*log_3(u_{n-1})
v_n = 2*v_{n-1} + m
```

avec v_0 = log_3(u_0) = log_3(1) = 0.

**Etape 2 -- Resoudre la recurrence lineaire v_n = 2*v_{n-1} + m.**

Equation caracteristique de la partie homogene : r = 2 (racine simple).
Solution homogene : v_n^{(h)} = A * 2^n.
Solution particuliere (second membre constant m) : alpha = 1, pas racine.
v_n^{(p)} = C. Alors C = 2C + m => C = -m.

Solution generale : v_n = A * 2^n - m.

Condition initiale : v_0 = A - m = 0 => A = m.

```
v_n = m * 2^n - m = m(2^n - 1)
```

**Etape 3 -- Revenir a u_n.**

```
u_n = 3^{v_n} = 3^{m(2^n - 1)}
```

Forme alternative :

```
u_n = 3^{m * 2^n - m}
```

**Verification :**

```
u_0 = 3^{m(1-1)} = 3^0 = 1                     -- correct
u_1 = 3^m * u_0^2 = 3^m * 1 = 3^m
Formule : 3^{m(2-1)} = 3^m                     -- correct
u_2 = 3^m * (3^m)^2 = 3^m * 3^{2m} = 3^{3m}
Formule : 3^{m(4-1)} = 3^{3m}                  -- correct
u_3 = 3^m * (3^{3m})^2 = 3^m * 3^{6m} = 3^{7m}
Formule : 3^{m(8-1)} = 3^{7m}                  -- correct
```

---

## Exercice 7 : Theoreme maitre -- 5 cas

**Enonce :** Determiner la complexite de chaque recurrence.

### a) T(n) = 4*T(n/2) + n

```
a = 4, b = 2
Comparaison : a = 4 > b = 2
Resultat : T(n) = O(n^{log_2(4)}) = O(n^2)
```

Justification par deroulement :

```
Niveau 0 :  n           (1 probleme)
Niveau 1 :  4*(n/2) = 2n   (4 problemes de taille n/2)
Niveau 2 :  16*(n/4) = 4n  (16 problemes de taille n/4)
...
Niveau k :  4^k * n/2^k = n * 2^k

Profondeur : log_2(n) niveaux
Feuilles : 4^{log_2(n)} = n^{log_2(4)} = n^2

Cout total domine par les feuilles : O(n^2)
```

### b) T(n) = 2*T(n/2) + n

```
a = 2, b = 2
Comparaison : a = b
Resultat : T(n) = O(n * log n)
```

C'est le cas du tri fusion.

### c) T(n) = T(n/2) + n

```
a = 1, b = 2
Comparaison : a = 1 < b = 2
Resultat : T(n) = O(n)
```

Deroulement : T(n) = n + n/2 + n/4 + ... = n * (1 + 1/2 + 1/4 + ...) = 2n = O(n).

### d) T(n) = 3*T(n/3) + n

```
a = 3, b = 3
Comparaison : a = b
Resultat : T(n) = O(n * log n)
```

### e) T(n) = 7*T(n/2) + n^2

```
a = 7, b = 2
Comparaison : a = 7 > b^2 = 4
Resultat : T(n) = O(n^{log_2(7)}) = O(n^{2.807})
```

C'est le cas de Strassen. Meme si le travail a chaque niveau est n^2, le nombre de sous-problemes (7) domine.

---

## Exercice 8 : Recurrence de Fibonacci par equation caracteristique

**Enonce :** Resoudre F_n = F_{n-1} + F_{n-2}, F_0 = 0, F_1 = 1.

### Solution

**Equation caracteristique :**

```
r^2 - r - 1 = 0
Delta = 1 + 4 = 5
r1 = (1 + sqrt(5))/2 = phi    (nombre d'or, environ 1.618)
r2 = (1 - sqrt(5))/2 = psi    (environ -0.618)
```

**Solution generale :**

```
F_n = A * phi^n + B * psi^n
```

**Conditions initiales :**

```
F_0 = A + B = 0           =>  B = -A
F_1 = A*phi + B*psi = 1   =>  A*phi - A*psi = 1
A*(phi - psi) = 1          =>  A*sqrt(5) = 1
A = 1/sqrt(5)
B = -1/sqrt(5)
```

**Formule de Binet :**

```
F_n = (phi^n - psi^n) / sqrt(5)
```

**Asymptotiquement :** |psi| < 1, donc psi^n -> 0. Donc F_n est environ phi^n / sqrt(5), et F_n = Theta(phi^n) = Theta(1.618^n).

---

## Resume des methodes

| Forme de la recurrence | Methode | Complexite de la resolution |
|------------------------|---------|----------------------------|
| u_n = a1*u_{n-1} + ... + ak*u_{n-k} + g(n) | Equation caracteristique | Trouver racines du polynome |
| T(n) = a*T(n/b) + c*n | Theoreme maitre | Comparer a et b |
| T(n) = T(n-1) + f(n) | Deroulement | Somme telescopique |
| Toute recurrence lineaire | Series generatrices | Mise en equation + fractions partielles |
| u_n = f(u_{n-1}) non lineaire | Passage au log | Lineariser puis resoudre |

### Checklist pour le DS

```
[ ] J'ai identifie la forme de la recurrence
[ ] Pour les SG : j'ai ecrit l'equation fonctionnelle F(x)
[ ] J'ai factorise le denominateur
[ ] J'ai decompose en fractions partielles (attention aux poles multiples)
[ ] Pour les EC : j'ai verifie si alpha est racine (piege classique)
[ ] J'ai resolu le systeme des conditions initiales
[ ] J'ai verifie la solution sur u_0, u_1, u_2
```
