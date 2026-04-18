---
title: "Corriges d'examens"
sidebar_position: 2
---

# Corriges d'examens

## Examen 2024-2025 (cpoo1-2024-2025.pdf)

### Exercice 1 (~5 points) -- Tester Traitement

**Code donne** :
```java
public class Traitement {
    private final Observateur obs;

    public Traitement(Observateur obs) {
        this.obs = obs;
    }

    public void analyser(String str) {
        switch(str) {
            case "a" -> obs.a();
            case "b" -> obs.b(str);
            default -> throw new IllegalArgumentException();
        }
    }
}

public interface Observateur {
    void a();
    void b(String str);
}
```

**Consigne** : Ecrire `TestTraitement`. Un defaut est present dans le code, et vous devez ecrire un test qui le met en evidence.

**Le defaut** : le constructeur ne valide pas `obs`. Si `obs` est `null`, appeler `analyser()` lancera un `NullPointerException` au lieu d'une erreur appropriee a la construction.

**Solution** :

```java
@ExtendWith(MockitoExtension.class)
public class TestTraitement {
    Traitement traitement;
    Observateur obs;

    @BeforeEach
    void setUp() {
        obs = Mockito.mock(Observateur.class);
        traitement = new Traitement(obs);
    }

    // Test cas "a" -> appelle obs.a()
    @Test
    void testAnalyserA() {
        traitement.analyser("a");
        Mockito.verify(obs).a();
    }

    // Test cas "b" -> appelle obs.b(str)
    @Test
    void testAnalyserB() {
        traitement.analyser("b");
        Mockito.verify(obs).b("b");
    }

    // Test default -> lance IllegalArgumentException
    @Test
    void testAnalyserDefault() {
        assertThrows(IllegalArgumentException.class,
            () -> traitement.analyser("xyz"));
    }

    // Test du DEFAUT : le constructeur accepte null
    @Test
    void testConstructorWithNull() {
        Traitement t = new Traitement(null);
        // Cela devrait etre empeche, mais le constructeur l'autorise
        // Appeler analyser provoquera NullPointerException
        assertThrows(NullPointerException.class, () -> t.analyser("a"));
    }
}
```

### Exercice 2 (~5 points) -- QCM et questions

**Q.2** : Tester du code c'est : **"apporter de la confiance vis-a-vis du code developpe"**. Tester ne prouve PAS l'absence de bugs ; cela augmente la confiance.

**Q.3** : Executer des tests pour mesurer la couverture de code est une technique d' : **"analyse dynamique"**. Le code doit reellement s'executer pour mesurer la couverture.

**Q.4** : Un "mock" permet... La proposition FAUSSE est : **"tester le fonctionnement de l'objet mocke"**. Les mocks simulent les dependances ; ils testent le code qui UTILISE le mock, pas le mock lui-meme.

**Q.5** : Les user stories et les diagrammes de classes sont utiles car : les user stories capturent les besoins du point de vue de l'utilisateur et definissent les criteres d'acceptation ; les diagrammes de classes modelisent la structure du systeme, les relations et les responsabilites. Ensemble, ils font le lien entre ce que le systeme doit faire (stories) et comment il est concu (diagrammes).

**Q.6** : Les tests d'acceptation en Agile et dans le test logiciel : en Agile, une user story inclut des criteres d'acceptation qui definissent le "termine". Ces criteres se traduisent directement en tests d'acceptation. Le terme "test" a la meme signification dans les deux contextes : une condition verifiable qui, une fois satisfaite, confirme que la fonctionnalite fonctionne comme specifie.

**Q.7** : "Une classe abstraite... ne possede que des methodes abstraites" est FAUX. Une classe abstraite peut avoir a la fois des methodes abstraites et concretes. (Les interfaces en Java n'avaient que des methodes abstraites avant Java 8, mais les classes abstraites ont toujours autorise les methodes concretes.)

### Exercice 3 (~5 points) -- Diagramme de classes UML (Devis)

**Resume du texte** : Un devis concerne un client et possede une date. Un client a un nom et une adresse. Un client peut etre une entreprise (avec un numero). Une tache a une designation, quantite, prix unitaire, et unite de mesure (ML, M2, U). Une tache fait reference a du materiel (au moins un). Un materiel a une designation et est fourni par un ou plusieurs fournisseurs. Un fournisseur a un nom.

**Diagramme solution** :

```
  +-------------------+     1    +-------------------+
  |      Devis        |--------->|     Client        |
  +-------------------+          +-------------------+
  | - date: String    |          | - nom: String     |
  +-------------------+          | - adresse: String |
         |                       +-------------------+
         | taches 1..*                    ^
         v                                | (extends)
  +-------------------+          +-------------------+
  |      Tache        |          |   Entreprise      |
  +-------------------+          +-------------------+
  | - designation: String   |    | - numero: String  |
  | - quantite: double      |   +-------------------+
  | - prixUnitaire: double  |
  | - unite: UniteDeMesure  |
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
  | ML                |
  | M2                |
  | U                 |
  +-------------------+
```

Decisions cles :
- `UniteDeMesure` est une enumeration (trois valeurs fixes)
- `Entreprise extends Client` (heritage : "un client peut etre une entreprise")
- `Materiel <-> Fournisseur` est plusieurs-a-plusieurs (1..* des deux cotes)
- `Devis -> Tache` est 1..* (au moins une tache)

### Exercice 4 (~5 points) -- Flot de controle de Polygone

**Code donne** :
```java
public void deplacerPoints(List<Integer> positions, double vecteurTranslation) {
    for(int position : positions) {                    // A
        if(position < 0 || position >= points.size()) { // B, a: position<0, b: position>=size
            return;                                     // C
        }
    }
    for(int position: positions) {                     // D
        points.get(position).translation(vecteurTranslation); // E
    }
    System.out.println("deplacement fait");            // F
}
```

**Q.9 -- Table de verite pour la ligne B** :

| a : `position < 0` | b : `position >= points.size()` | Evalue ? | Resultat |
|---|---|---|---|
| true | non evalue (court-circuit) | Seulement a | true (return) |
| false | true | Les deux | true (return) |
| false | false | Les deux | false (continue) |

**Q.10 -- Graphe de flot de controle** :

```
  A (boucle for : a-t-on un prochain position ?) ---non---> D
  |
  oui
  v
  a (position < 0 ?) ---vrai---> C (return)
  |
  faux
  v
  b (position >= points.size() ?) ---vrai---> C (return)
  |
  faux
  v
  A (retour boucle)

  D (boucle for : a-t-on un prochain position ?) ---non---> F (println)
  |
  oui
  v
  E (translation)
  |
  v
  D (retour boucle)

  F -> [fin]
```

**Q.11 -- Classes d'equivalence pour `position`** :

Etant donne un polygone a 3 points (indices 0, 1, 2) :
- Classe 1 : `position < 0` (par ex., -1) -- invalide, provoque return
- Classe 2 : `0 <= position < 3` (par ex., 0, 1, 2) -- valide
- Classe 3 : `position >= 3` (par ex., 3, 4) -- invalide, provoque return

Valeurs limites : -1, 0, 2, 3

**Q.12 -- Valeurs pour 100% de couverture de lignes** (polygone a 3 points) :

Test 1 : `positions = [-1]` -- couvre A, B (a=true), C (return)
Test 2 : `positions = [0, 1, 2]` -- couvre A, B (a=false, b=false), D, E, F

**Q.13 -- Valeurs pour 100% de couverture de conditions** :

Besoin que chaque sous-condition soit vraie et fausse :
- `a` vrai : position = -1
- `a` faux, `b` vrai : position = 3
- `a` faux, `b` faux : position = 0

Tests : `[-1]`, `[3]`, `[0, 1, 2]`

### Exercice 5 (Bonus ~1 point) -- Tests de mutation

Les tests de mutation modifient automatiquement le code source pour creer des "mutants" (par ex., changer `>` en `>=`, supprimer un appel de methode, inverser une condition). La suite de tests est ensuite executee contre chaque mutant. Si un test echoue, le mutant est "tue" (detecte). Si tous les tests passent, le mutant "survit", indiquant une lacune dans la suite de tests. Le score de mutation = (mutants tues / total) * 100%. Un score eleve indique des tests robustes.

---

## Examen 2021-2022 (DS-CPOO1-2021-2022.pdf)

### Exercice 1 -- Tester la classe A

**Code donne** : La classe `A` avec validation du constructeur, `getB()`, `getStr()`, `al(boolean value)`, `doSomething()` (privee), et `create(B b)` (fabrique statique).

**Q.1 -- Analyse de couverture maximale** :

1. **Couverture de lignes 100% ?** Analyse : `doSomething()` definit `str = "yolo"`. Apres avoir appele `al()`, `str` est toujours `"yolo"` (jamais null). Toutes les lignes de `al()` restent atteignables : `return 0` est declenche quand `!value` est vrai ; `return str.length() * b.getB1()` est declenche quand `value` est vrai. Les `throws SecurityException, NumberFormatException` ne sont que declares dans la signature -- ils n'ajoutent pas de lignes couvrables. **100% de couverture de lignes EST atteignable**.

2. **Couverture de branches 100% ?** La condition `str == null || !value` apres l'execution de `doSomething()` : `str` est toujours `"yolo"`, donc `str == null` est toujours `false`. Le court-circuit fait que l'on entre dans la branche uniquement quand `!value` est vrai. On ne peut jamais couvrir la branche ou `str == null` est vrai (puisque `doSomething()` s'execute toujours avant).

3. **Couverture de conditions 100% ?** `str == null` est toujours `false` apres `doSomething()`, donc on ne peut pas le rendre `true`.

**Classe de test solution** :

```java
public class TestA {
    A a;
    B b;

    @BeforeEach
    void setUp() throws AnException {
        b = Mockito.mock(B.class);
        Mockito.when(b.getB1()).thenReturn(1);
        a = new A(b);
    }

    @Test void testConstructorNull() {
        assertThrows(IllegalArgumentException.class, () -> new A(null));
    }

    @Test void testGetB() {
        assertSame(b, a.getB());
    }

    @Test void testGetStrInitiallyNull() {
        assertNull(a.getStr());
    }

    @Test void testAlFalse() throws Exception {
        assertEquals(0, a.al(false));
        // Apres al(), str vaut "yolo" (doSomething a ete appele)
    }

    @Test void testAlTrue() throws Exception {
        // "yolo".length() = 4, b.getB1() = 1
        assertEquals(4, a.al(true));
    }

    @Test void testAlThrowsAnException() throws AnException {
        B badB = Mockito.mock(B.class);
        Mockito.when(badB.getB1()).thenThrow(new AnException("test"));
        A badA = new A(badB);
        assertThrows(AnException.class, () -> badA.al(true));
    }

    @Test void testCreateWithNull() {
        assertNull(A.create(null));
    }

    @Test void testCreateWithValid() {
        A created = A.create(b);
        assertNotNull(created);
        assertSame(b, created.getB());
    }
}
```

**Q.2 -- Test supplementaire pour create** : verifier que `create` retourne une NOUVELLE instance a chaque appel (pas un singleton) :

```java
@Test void testCreateReturnsNewInstance() {
    A a1 = A.create(b);
    A a2 = A.create(b);
    assertNotSame(a1, a2);
}
```

**Q.3 -- Tests qui n'augmentent pas la couverture mais sont necessaires** : tester que `getStr()` retourne `"yolo"` apres l'appel de `al()` (verifier l'effet de bord de `doSomething()`) :

```java
@Test void testStrAfterAl() throws Exception {
    a.al(false);
    assertEquals("yolo", a.getStr());
}
```

### Exercice 2 -- UML Championnat de football

C'est un exercice complexe de diagramme de classes. Classes cles :
- `Championnat`, `Equipe`, `Joueur`, `Entraineur`, `Arbitre`, `Rencontre`
- Types d'evenements : `Penalty`, `Carton`, `But`, `Remplacement`, `Expulsion`
- Specialisations d'arbitres : `ArbitreCentral`, `ArbitreTouche`, `ArbitreVideo`

Relations cles :
- `Rencontre` appartient a exactement 1 `Championnat`
- `Equipe` peut participer a plusieurs `Championnat`s
- `Rencontre` implique 2 `Equipe` (local + visiteur)
- `Carton` a une couleur (enum : JAUNE, ROUGE) et cible un `Joueur` ou `Entraineur`
- `ArbitreCentral` peut faire tout ce que `ArbitreTouche` et `ArbitreVideo` peuvent faire, et plus encore

---

## Examen 2020-2021 (DS-CPOO1-2020-2021.pdf)

### Exercice 1 -- Flot de controle de Foo

```java
public int foo(int i, int j) {
    if (i < 0 || j > 0) {
        return i + j;
    }
    return i * j;
}
```

**Q.1** : Nombre minimum de tests pour 100% de couverture de flot de controle : **2 tests** (un pour la branche `true`, un pour la branche `false`).

**Q.2** : Valeurs de test :
- Test 1 (branche true) : `i < 0` (par ex., i=-1, j=0) OU `j > 0` (par ex., i=0, j=1)
- Test 2 (branche false) : `i >= 0 ET j <= 0` (par ex., i=1, j=0 ou i=0, j=-1)

Pour la couverture de conditions (chaque sous-condition vraie et fausse) : 3 tests necessaires.

**Q.3** : Graphe de flot de controle :
```
  [entree : ligne 2]
  |
  v
  [i<0?] --vrai--> [return i+j : ligne 4]
  |
  faux
  v
  [j>0?] --vrai--> [return i+j : ligne 4]
  |
  faux
  v
  [return i*j : ligne 6]
```

### Exercice 2 -- Corrections d'assertions

| Incorrect | Correct |
|-----------|---------|
| `assertTrue(a.equals(b))` | `assertEquals(a, b)` |
| `assertFalse(!a.foo())` | `assertTrue(a.foo())` |
| try/catch avec `fail()` | `assertThrows(VeryBadException.class, () -> foobar.m())` suivi de `assertEquals(1, foobar.m())` pour le cas normal |

### Exercice 3 -- UML Formule arithmetique

Voir l'exemple detaille dans [04-uml-diagrams.md](/S5/CPOO/guide/04-uml-diagrams). Point cle : identifier le patron Composite ou `Noeud` est soit une `Valeur`, une `RefConstante`, ou un `Operateur` (avec `Addition` et `Soustraction` comme sous-types).
