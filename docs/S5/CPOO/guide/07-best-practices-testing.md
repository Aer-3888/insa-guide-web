---
title: "Bonnes pratiques Java et tests"
sidebar_position: 7
---

# Bonnes pratiques Java et tests

## Principes SOLID

### S -- Responsabilite unique

Chaque classe ne devrait avoir qu'une seule raison de changer. Exemple : `Foret` gere la collection d'arbres ; `Arbre` gere sa propre logique de prix et d'age.

### O -- Ouvert/Ferme

Les classes devraient etre ouvertes a l'extension mais fermees a la modification. La classe abstraite `Arbre` permet d'ajouter de nouveaux types d'arbres (ouverte a l'extension) sans modifier le code existant (fermee a la modification).

### L -- Substitution de Liskov

Les objets d'une classe parente doivent pouvoir etre remplaces par des objets d'une sous-classe sans casser le programme. `List<Arbre>` peut contenir a la fois des objets `Chene` et `Pin`, et toutes les operations sur `Arbre` fonctionnent correctement quel que soit le type reel.

### I -- Segregation des interfaces

Les clients ne devraient pas dependre d'interfaces qu'ils n'utilisent pas. Le cours utilise des interfaces ciblees : `Service` n'a que `getLatency()`, `Network` n'a que `ping()` et `sendGetHTTPQuery()`.

### D -- Inversion de dependances

Dependre des abstractions, pas des implementations concretes. `Exo2` depend de l'interface `Network`, pas d'une implementation concrete. Cela permet le testing avec des mocks.

```java
public class Exo2 {
    private final Network network;          // depends on interface

    public Exo2(Network network) {          // injected via constructor
        this.network = network;
    }
}
```

---

## Tests unitaires avec JUnit 5

### Structure d'un test (patron AAA)

```java
@Test
void testVieillir() {
    // Arrange (Preparation)
    Arbre arbre = new Chene(5, 2.0);

    // Act (Action)
    arbre.vieillir();

    // Assert (Verification)
    assertEquals(6, arbre.getAge());
}
```

### Assertions courantes

```java
assertEquals(expected, actual);                 // egalite
assertEquals(expected, actual, 0.001);          // virgule flottante avec delta
assertTrue(condition);
assertFalse(condition);
assertNull(object);
assertNotNull(object);
assertThrows(ExType.class, () -> code());       // exception attendue
assertSame(obj1, obj2);                         // meme reference (==)
```

### Annotations de cycle de vie

```java
@BeforeEach
void setUp() {
    // s'execute avant chaque methode de test
    mp = new MyPoint();
}

@AfterEach
void tearDown() {
    // s'execute apres chaque methode de test (nettoyage)
}

@BeforeAll
static void initAll() { /* une fois avant tous les tests */ }

@AfterAll
static void cleanAll() { /* une fois apres tous les tests */ }
```

### Tests parametres

```java
@ParameterizedTest
@ValueSource(strings = {"abc", "999.999.999.999", "", "1.2.3"})
void testInvalidIP(String address) {
    assertFalse(exo2.connectServer(address));
}

@ParameterizedTest
@CsvSource({"0, true", "-1, true", "5, true", "4, false"})
void testIsOut(int value, boolean expected) {
    assertEquals(expected, plateau.isOut(value));
}
```

### Anti-patrons de tests courants (tires du cours)

**Anti-patron 1 : assertTrue(a.equals(b))** -- utilisez `assertEquals(a, b)` a la place.

**Anti-patron 2 : assertFalse(!a.foo())** -- utilisez `assertTrue(a.foo())`.

**Anti-patron 3 : assertTrue(a == b)** -- utilisez `assertSame(a, b)` pour l'egalite de reference.

**Anti-patron 4 : try/catch avec fail()** -- utilisez `assertThrows()`.

```java
// INCORRECT
@Test
void test1() {
    try {
        foobar.m(null);
        fail();
    } catch (MyException ex) {
        assertTrue(true);       // meaningless
    }
}

// CORRECT
@Test
void test1() {
    assertThrows(MyException.class, () -> foobar.m(null));
}
```

**Anti-patron 5 : if/fail au lieu de assertEquals** :
```java
// INCORRECT
if (i != 10) { fail(); }

// CORRECT
assertEquals(10, foo.getI());
```

**Anti-patron 6 : initialisation dupliquee dans chaque test** :
```java
// INCORRECT
@Test void testC1() { C c = new C(); assertEquals(12.12, c.getC1()); }
@Test void testC2() { C c = new C(); assertEquals("foo", c.getC2()); }

// CORRECT : utiliser @BeforeEach
C c;
@BeforeEach void setUp() { c = new C(); }
@Test void testC1() { assertEquals(12.12, c.getC1()); }
@Test void testC2() { assertEquals("foo", c.getC2()); }
```

---

## Mocking avec Mockito

### Pourquoi mocker ?

Quand une classe depend d'une interface (par ex., `Network`, `Service`, `B`), vous ne pouvez pas la tester sans implementation. Les mocks simulent le comportement de l'interface.

### Mock basique

```java
// Create a mock
Network network = Mockito.mock(Network.class);

// Define behavior
Mockito.when(network.ping("192.168.1.1")).thenReturn(true);

// Use in tests
Exo2 exo2 = new Exo2(network);
assertTrue(exo2.connectServer("192.168.1.1"));
```

### Mocker des exceptions

```java
B beh = Mockito.mock(B.class);
Mockito.when(beh.getB1()).thenThrow(new AnException("test"));

A a = new A(beh);
assertThrows(AnException.class, () -> a.al(true));
```

### Verifier les appels de methodes

```java
// Verifier que sendGetHTTPQuery a ete appele avec le bon argument
Mockito.verify(network).sendGetHTTPQuery("192.168.1.1");

// Verifier qu'une methode n'a jamais ete appelee
Mockito.verify(network, Mockito.never()).sendGetHTTPQuery("bad");
```

### Mocker des retours consecutifs

```java
Random random = Mockito.mock(Random.class);
Mockito.when(random.nextInt()).thenReturn(892, 190);

mp.setPoint(random, random);
assertEquals(892, mp.getX(), 1e-6);    // first call returns 892
assertEquals(190, mp.getY(), 1e-6);    // second call returns 190
```

### Mock Construction (Avance -- Exo8)

Quand une classe instancie un objet en interne, vous ne pouvez pas injecter un mock normalement. Utilisez `mockConstruction()` :

```java
@Test
void testUneFonctionInutile() {
    try (var mocked = Mockito.mockConstruction(Random.class,
            (mock, context) -> {
                Mockito.when(mock.nextRandom()).thenReturn(42);
            })) {
        Exo8 exo8 = new Exo8();           // constructor creates Random, gets mock
        assertEquals(42 * 5, exo8.uneFonctionInutile(5));
    }
}
```

### Mock de methodes statiques (Avance -- Exo8)

Quand une classe appelle directement une methode statique :

```java
@Test
void testUneAutreFonctionInutile() {
    try (var mocked = Mockito.mockStatic(RandomGenerator.class)) {
        RandomGenerator mockGen = Mockito.mock(RandomGenerator.class);
        Mockito.when(mockGen.nextInt()).thenReturn(10);
        mocked.when(RandomGenerator::getDefault).thenReturn(mockGen);

        Exo8 exo8 = new Exo8();
        assertEquals(10 * 3, exo8.uneAutreFonctionInutile(3));
    }
}
```

---

## Couverture de code

### Types de couverture

| Type | Description | Pertinence a l'examen |
|------|-------------|----------------------|
| **Couverture de lignes** | % de lignes source executees | Frequemment demande |
| **Couverture de branches** | % de branches decisionnelles prises (vrai + faux) | Frequemment demande |
| **Couverture de conditions** | Chaque sous-expression booleenne evaluee a vrai et a faux | Frequemment demande |

### Operateurs en court-circuit et couverture

```java
if (s == null || services.contains(s))     // || short-circuits
```

Table de verite pour la couverture :

| `s == null` | `services.contains(s)` | Evalue ? | Resultat |
|-------------|----------------------|----------|----------|
| true | non evalue | Seulement le premier | true |
| false | true | Les deux | true |
| false | false | Les deux | false |

Pour atteindre la **couverture de conditions**, vous avez besoin de tests ou chaque sous-condition est vraie et fausse independamment.

### Graphes de flot de controle

Pour la methode `getTotalLatency` :
```java
public double getTotalLatency() {    // A
    double sum = 0.0;                // B
    for (Service s : services) {     // C  (loop condition)
        sum += s.getLatency();       // D
    }
    return sum;                      // E
}
```

```
  A -> B -> C --(has next)--> D -> C
             |
             +--(no more)--> E
```

### Classes d'equivalence

Regrouper les entrees qui produisent le meme comportement :
```java
// Pour addService(Service s) :
// Classe 1 : s == null            -> IllegalArgumentException
// Classe 2 : s deja dans la liste -> IllegalArgumentException
// Classe 3 : s valide, pas dans la liste -> ajoute avec succes
```

Pour les coordonnees dans `PlateauJeu` (SIZE = 5) :
```
// Classe 1 : x < 0            -> isOut = true
// Classe 2 : 0 <= x < SIZE    -> isOut = false (valide)
// Classe 3 : x >= SIZE         -> isOut = true
// Valeurs limites : -1, 0, 4, 5
```

---

## Tests de mutation (Pitest)

### Concept

Les tests de mutation modifient votre code (creent des "mutants") et verifient si vos tests detectent les changements. Si un test passe toujours apres une mutation, le test est faible.

**Les mutations incluent** :
- Changer `>` en `>=` ou `<`
- Remplacer `+` par `-`
- Supprimer des appels de methodes
- Changer les valeurs de retour
- Inverser les conditions

### Executer Pitest

```bash
mvn clean install test org.pitest:pitest-maven:mutationCoverage
# Rapport : target/pit-reports/index.html
```

### Les trois problemes de TestExo9

Le `TestExo9` original a trois problemes :

1. **Pas d'assertion sur `ajouterElement`** : le test appelle `ajouterElement("foo")` mais ne verifie jamais que l'element a reellement ete ajoute (pas de `assertFalse(exo9.estVide())` ni de `assertTrue(exo9.contient("foo"))`).

2. **Pas de test pour `estVide` retournant false** : ne teste que le cas vide (`assertTrue(exo9.estVide())`), jamais le cas non-vide.

3. **Ne detecte pas le bug off-by-one dans `contient()`** : le test appelle uniquement `contient("bar")` qui trouve l'element avant d'atteindre la limite. Il ne teste jamais `contient("notPresent")` qui declencherait le `IndexOutOfBoundsException`.

### Tests corriges (100% de score de mutation)

```java
@Test
void testIsEmpty() {
    assertTrue(exo9.estVide());
}

@Test
void testIsNotEmpty() {
    exo9.ajouterElement("foo");
    assertFalse(exo9.estVide());
}

@Test
void testAjouterElement() {
    exo9.ajouterElement("foo");
    assertFalse(exo9.estVide());
    assertTrue(exo9.contient("foo"));
}

@Test
void testContientPresent() {
    exo9.ajouterElement("bar");
    assertTrue(exo9.contient("bar"));
}

@Test
void testContientAbsent() {
    exo9.ajouterElement("bar");
    // Apres avoir corrige le bug (i <= taille -> i < taille) :
    assertFalse(exo9.contient("notHere"));
}
```

---

## Pieges courants

1. **Tester le mock au lieu du systeme sous test** : `assertEquals(vb, b.getB1())` teste la configuration du mock, pas la classe reelle.
2. **Atteindre 100% de couverture de lignes mais avec des assertions faibles** : la couverture mesure l'execution, pas la correction. Les tests de mutation detectent cela.
3. **Oublier `@ExtendWith(MockitoExtension.class)`** : requis pour que les annotations `@Mock` fonctionnent.
4. **Ne pas utiliser `try-with-resources` pour mock static/construction** : la portee du mock doit etre fermee correctement.

---

## AIDE-MEMOIRE

```
ANNOTATIONS JUNIT 5
  @Test                              methode de test individuelle
  @BeforeEach / @AfterEach          avant/apres chaque test
  @BeforeAll / @AfterAll            avant/apres tous les tests (static)
  @ParameterizedTest                 test pilote par les donnees
  @ValueSource / @CsvSource          fournisseurs de donnees

ASSERTIONS
  assertEquals(expected, actual)
  assertEquals(expected, actual, delta)   // pour les doubles
  assertTrue / assertFalse
  assertNull / assertNotNull
  assertThrows(Exception.class, () -> ...)
  assertSame / assertNotSame             // egalite de reference

MOCKITO
  mock(Class.class)                      creer un mock
  when(mock.method()).thenReturn(val)     configurer la valeur de retour
  when(mock.method()).thenThrow(ex)       configurer une exception
  verify(mock).method()                  verifier l'appel
  verify(mock, never()).method()         verifier l'absence d'appel
  verify(mock, times(n)).method()        verifier le nombre d'appels
  mockConstruction(Class.class, ...)     mocker les nouvelles instances
  mockStatic(Class.class)               mocker les methodes statiques

TYPES DE COUVERTURE
  Lignes :     chaque ligne source executee
  Branches :   chaque chemin if/else parcouru
  Conditions : chaque sous-expression booleenne VRAIE ET FAUSSE

TESTS DE MUTATION
  mvn clean install test org.pitest:pitest-maven:mutationCoverage
  Objectif : 100% de score de mutation = tous les mutants tues par les tests
```
