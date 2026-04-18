---
title: "Diagrammes UML"
sidebar_position: 4
---

# Diagrammes UML

## Theorie

UML (Unified Modeling Language) est un langage visuel normalise pour specifier, construire et documenter des systemes logiciels. L'examen CPOO vous demande systematiquement de dessiner des diagrammes de classes et, occasionnellement, des diagrammes de cas d'utilisation et des diagrammes de sequence.

---

## 1. Diagrammes de classes

### Notation de base d'une classe

```
+-------------------+
|    ClassName       |       <<abstract>>  or <<interface>>
+-------------------+
| - privateField    |       Visibilite :
| # protectedField  |         - private
| + publicField     |         # protected
| ~ packageField    |         + public
+-------------------+         ~ package
| + publicMethod()  |
| # protectedMethod()|
| + abstractMethod()*|      * italique ou {abstract}
+-------------------+
```

### Relations

**Heritage (generalisation)** : trait plein avec tete de fleche en triangle creux pointant vers le parent.
```
     Arbre              (parent)
       ^
       |                trait plein + triangle creux
       |
     Chene              (enfant : Chene extends Arbre)
```

**Implementation d'interface (realisation)** : trait en pointilles avec triangle creux.
```
  <<interface>>
    Network             (interface)
       ^
       :                trait en pointilles + triangle creux
       :
  NetworkImpl           (classe implements Network)
```

**Association** : trait plein, optionnellement avec tete de fleche pour la direction de navigation.
```
  Velo ---------> Guidon         unidirectionnelle (Velo connait Guidon)
        guidon
        0..1

  Velo <--------> Guidon         bidirectionnelle (les deux se connaissent)
        guidon     velo
        0..1       0..1
```

**Agregation** ("possede" faible) : trait plein avec losange creux du cote du "tout".
```
  Foret <>------> Arbre          Foret possede des Arbres
          arbres
          0..*
```

**Composition** ("possede" fort) : trait plein avec losange plein. La partie ne peut pas exister sans le tout.
```
  Velo <*>------> Roue           Roue ne peut pas exister sans Velo
          roues
          0..*
```

**Dependance** : fleche en pointilles. Une classe utilise temporairement une autre (par ex., comme parametre).
```
  Client - - - -> Service        Client depend de Service
```

### Multiplicite

| Notation | Signification |
|----------|---------------|
| `1` | Exactement un |
| `0..1` | Zero ou un (optionnel) |
| `0..*` ou `*` | Zero ou plusieurs |
| `1..*` | Un ou plusieurs |
| `2` | Exactement deux |

### Classes abstraites et interfaces en UML

```
+-------------------+           +-------------------+
|   <<abstract>>    |           |   <<interface>>   |
|      Arbre        |           |     Service       |
+-------------------+           +-------------------+
| # age: double     |           | + getLatency(): int|
| # volume: double  |           +-------------------+
+-------------------+
| + vieillir()      |
| + getPrix(): double|
| + getPrixM3()*    |     * = methode abstraite
+-------------------+
```

### Enumerations en UML

```
+-------------------+
|   <<enumeration>> |
|   UniteDeMesure   |
+-------------------+
|   ML              |
|   M2              |
|   U               |
+-------------------+
```

---

## 2. Exemple detaille : systeme forestier (TP2)

Depuis le texte du cours :

```
                      +-------------------+
                      |   <<abstract>>    |
                      |   Arbre<F>        |
                      +-------------------+
                      | # age: double     |
                      | # volume: double  |
                      +-------------------+
                      | + vieillir()      |
                      | + getPrix(): double|
                      | + peutEtreCoupe() |
                      | + produireFruit():F|
                      | # getPrixM3()*    |
                      | + getAgeMinCoupe()*|
                      +-------------------+
                            ^         ^
                            |         |
              +-------------+    +------------+
              |                               |
    +-------------------+          +-------------------+
    |   Chene<Gland>    |          |    Pin<Cone>      |
    +-------------------+          +-------------------+
    | + getPrixM3()     |          | + getPrixM3()     |
    | + getAgeMinCoupe()|          | + getAgeMinCoupe()|
    | + produireFruit() |          | + produireFruit() |
    +-------------------+          +-------------------+
              |                               |
           produit                          produit
              |                               |
    +-------------------+          +-------------------+
    |      Gland        |          |      Cone         |
    +-------------------+          +-------------------+
    (extends Fruit)                (extends Fruit)

    +-------------------+
    |      Foret        |
    +-------------------+
    | - arbres: List<Arbre>        |
    | - arbres_coupes: List<Arbre> |
    +-------------------+
    | + planterArbre()  |
    | + couperArbre()   |
    | + getPrixTotal()  |
    | + getNombreChenes()|
    +-------------------+
           <>
           | arbres 0..*
           v
         Arbre
```

---

## 3. Exemple detaille : examen 2024-2025 (systeme de devis)

Texte : "Un devis concerne un client et possede une date. Un client a un nom et une adresse. Un client peut etre une entreprise (avec un numero). Une tache a une designation, quantite, prix unitaire, et unite de mesure. Une tache fait reference a du materiel (au moins un). Un materiel est fourni par un ou plusieurs fournisseurs."

```
  +-------------------+     1    +-------------------+
  |      Devis        |--------->|     Client        |
  +-------------------+          +-------------------+
  | - date: String    |          | - nom: String     |
  +-------------------+          | - adresse: String |
         |                       +-------------------+
         | taches 1..*                    ^
         v                                |
  +-------------------+          +-------------------+
  |      Tache        |          |   Entreprise      |
  +-------------------+          +-------------------+
  | - designation: String|       | - numero: String  |
  | - quantite: double  |       +-------------------+
  | - prixUnitaire: double|
  +-------------------+
  | - unite: UniteDeMesure |
  +-------------------+
         |
         | materiels 1..*
         v
  +-------------------+     *     +-------------------+
  |     Materiel      |<--------->|   Fournisseur     |
  +-------------------+   1..*   +-------------------+
  | - designation: String|       | - nom: String     |
  +-------------------+          +-------------------+

  +-------------------+
  | <<enumeration>>   |
  |  UniteDeMesure    |
  +-------------------+
  |   ML              |
  |   M2              |
  |   U               |
  +-------------------+
```

---

## 4. Exemple detaille : examen 2020-2021 (formule arithmetique)

Le texte decrit une formule comme un arbre : le noeud racine est un operateur, les operandes peuvent etre des valeurs, des references a des constantes, ou d'autres operateurs.

```
  +-------------------+          +-------------------+
  | FormuleArithmetique|-------->| <<interface>>     |
  +-------------------+ racine  |   Calculable      |
  | - constantes: Map  | 1      +-------------------+
  +-------------------+         | + calculer(): double|
  | + calculer(): double|       +-------------------+
  +-------------------+              ^    ^    ^
                                     |    |    |
                    +----------------+    |    +----------------+
                    |                     |                     |
          +-------------------+ +-------------------+ +-------------------+
          |     Valeur        | |  RefConstante     | |   <<abstract>>    |
          +-------------------+ +-------------------+ |   Operateur       |
          | - nombre: double  | | - ref: Constante  | +-------------------+
          +-------------------+ +-------------------+ | - gauche: Calculable|
          | + calculer()      | | + calculer()      | | - droite: Calculable|
          +-------------------+ +-------------------+ +-------------------+
                                                      | + calculer()      |
                                                      +-------------------+
                                                           ^         ^
                                                           |         |
                                                 +-----------+ +-----------+
                                                 |  Addition  | |Soustraction|
                                                 +-----------+ +-----------+

  +-------------------+
  |    Constante      |
  +-------------------+
  | - nom: String     |
  | - valeur: double  |
  +-------------------+
```

---

## 5. Diagrammes de cas d'utilisation

Les diagrammes de cas d'utilisation montrent les acteurs (bonhommes batons) et les cas d'utilisation (ovales) avec lesquels ils interagissent.

### Relations dans les diagrammes de cas d'utilisation

| Relation | Notation | Signification |
|----------|----------|---------------|
| Association | Trait plein | L'acteur participe au cas d'utilisation |
| Include | Fleche en pointilles `<<include>>` | Le cas d'utilisation inclut toujours un autre |
| Extend | Fleche en pointilles `<<extend>>` | Le cas d'utilisation etend optionnellement un autre |
| Generalisation | Fleche pleine avec triangle | Cas d'utilisation specialise / heritage d'acteur |

### Exemple detaille : restaurant (examen 2020-2021)

```
   Client            Serveur           Cuisinier          Caissier
     |                  |                  |                  |
     +-- Passer --+     |                  |                  |
     |  commande  |-----+                  |                  |
     |            |     |                  |                  |
     | Commander  |     +-- Servir plat ---+                  |
     |   du vin --+     |                  |                  |
     | (specialise      +-- Servir vin     |                  |
     |  commande)       | (specialise      |                  |
     |                  |  servir plat)    |                  |
     |                  |                  +-- Cuisiner plat  |
     |                  |                  | <<include>>      |
     |                  |                  | passer commande  |
     |                  |                                     |
     +----------------------------------------- Encaisser ---+
                                             <<include>>
                                             passer commande
```

Note : "Serveur peut etre Caissier" = generalisation d'acteur (Serveur herite de Caissier ou inversement).

---

## 6. Diagrammes de sequence

Les diagrammes de sequence montrent l'ordre des appels de methodes entre objets au fil du temps.

### Exemple detaille : Addition.calculer()

```
  :Client         :Addition        :gauche           :droite
     |                |               |                  |
     | calculer()     |               |                  |
     |--------------->|               |                  |
     |                | calculer()    |                  |
     |                |-------------->|                  |
     |                |    valG       |                  |
     |                |<------------- |                  |
     |                |               | calculer()       |
     |                |---------------|----------------->|
     |                |               |     valD         |
     |                |<--------------|------------------|
     |                |               |                  |
     |  valG + valD   |               |                  |
     |<---------------|               |                  |
```

---

## Pieges courants

1. **Confondre agregation et composition** : la composition signifie que la partie ne peut pas exister sans le tout (losange plein). L'agregation est plus faible (losange creux).
2. **Multiplicite manquante** : chaque association doit montrer la multiplicite aux deux extremites.
3. **Oublier la notation abstraite** : marquer les classes abstraites avec `<<abstract>>` ou mettre le nom en italique.
4. **Mauvaise direction de fleche** : la fleche pointe DE l'element dependant VERS la dependance. Un `Velo` qui connait son `Guidon` a la fleche DE Velo VERS Guidon.
5. **Confondre `<<include>>` et `<<extend>>`** : include est obligatoire ; extend est optionnel/conditionnel.

---

## AIDE-MEMOIRE

```
RELATIONS DES DIAGRAMMES DE CLASSES
  Heritage :       trait plein + triangle creux pointant vers le parent
  Implementation : trait en pointilles + triangle creux pointant vers l'interface
  Association :    trait plein (+ tete de fleche pour la direction)
  Agregation :     losange creux du cote "tout"
  Composition :    losange plein du cote "tout"
  Dependance :     fleche en pointilles

MULTIPLICITE
  1     exactement un
  0..1  optionnel (zero ou un)
  0..*  zero ou plusieurs
  1..*  un ou plusieurs

NOTATION DES CLASSES
  + public   # protected   - private   ~ package
  <<abstract>>   <<interface>>   <<enumeration>>
  methode abstraite : italique ou marquee {abstract}

DIAGRAMME DE CAS D'UTILISATION
  Acteur :        bonhomme baton
  Cas d'utilisation : ovale
  <<include>> :   fleche en pointilles, sous-comportement obligatoire
  <<extend>> :    fleche en pointilles, sous-comportement optionnel
  Generalisation : fleche pleine + triangle (heritage d'acteur ou de cas d'utilisation)

DIAGRAMME DE SEQUENCE
  Objet :         boite en haut avec ligne de vie (verticale en pointilles)
  Message :       fleche pleine (synchrone) ou fleche en pointilles (retour)
  Activation :    rectangle fin sur la ligne de vie
  Auto-appel :    fleche bouclant sur la meme ligne de vie
```
