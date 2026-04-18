---
title: "Banque de questions par type"
sidebar_position: 3
---

# Banque de questions par type

Toutes les questions extraites des examens CPOO de 2019 a 2025, organisees par sujet.

---

## Type 1 : Ecrire une classe de test

Ces questions vous donnent une classe Java + une interface et vous demandent d'ecrire une classe de test complete avec couverture maximale.

### Schema type de la question

Vous recevez :
- Une classe a tester (avec constructeur, methodes, eventuellement une fabrique statique)
- Une interface dont la classe depend (doit etre mockee)
- Parfois une classe d'exception personnalisee

Vous devez ecrire :
- `@BeforeEach` avec configuration du mock
- Tests pour le constructeur (y compris entree null)
- Tests pour chaque methode (cas normal, cas limites, chemins d'exception)
- Appels `verify()` le cas echeant

### Exemples tires des examens passes

**2024-2025** : Tester `Traitement` (interface Observateur, switch/case, defaut a trouver)
**2021-2022** : Tester `A` (interface B, AnException, doSomething privee, createA statique)
**2020-2021** : Tester `Client` (interface Service, addService avec validation, getTotalLatency)

### Reponse type

```java
@ExtendWith(MockitoExtension.class)
public class TestClassName {
    ClassName obj;
    InterfaceName mock;

    @BeforeEach
    void setUp() throws SomeException {
        mock = Mockito.mock(InterfaceName.class);
        Mockito.when(mock.someMethod()).thenReturn(someValue);
        obj = new ClassName(mock);
    }

    @Test void testConstructorNull() {
        assertThrows(IllegalArgumentException.class, () -> new ClassName(null));
    }

    @Test void testNormalCase() throws SomeException {
        assertEquals(expected, obj.method(args));
    }

    @Test void testExceptionCase() throws SomeException {
        InterfaceName badMock = Mockito.mock(InterfaceName.class);
        Mockito.when(badMock.someMethod()).thenThrow(new SomeException());
        ClassName badObj = new ClassName(badMock);
        assertThrows(SomeException.class, () -> badObj.method(args));
    }

    @Test void testVerifyCall() throws SomeException {
        obj.method(args);
        Mockito.verify(mock).someMethod();
    }
}
```

---

## Type 2 : Corriger des assertions / reecrire des tests

### Corrections courantes (reviennent chaque annee)

| Incorrect | Correct | Pourquoi |
|-----------|---------|----------|
| `assertTrue(a.equals(b))` | `assertEquals(a, b)` | Meilleur message d'erreur en cas d'echec |
| `assertFalse(!a.foo())` | `assertTrue(a.foo())` | La double negation est confuse |
| `assertTrue(a == b)` | `assertSame(a, b)` | Clarte semantique pour l'egalite de reference |
| `assertFalse(a.equals(b))` | `assertNotEquals(a, b)` | Intention plus claire |
| `assertTrue(!o.myMethod())` | `assertFalse(o.myMethod())` | Supprimer la negation |

### Anti-patron try/catch

```java
// INCORRECT
@Test void test1() {
    try {
        foobar.m(null);
        fail();
    } catch (MyException ex) {
        assertTrue(true);
    }
}

// CORRECT
@Test void test1() {
    assertThrows(MyException.class, () -> foobar.m(null));
}
```

### Anti-patron if/fail

```java
// INCORRECT
@Test void testI() {
    final int i = foo.getI();
    if (i != 10) { fail(); }
}

// CORRECT
@Test void testI() {
    assertEquals(10, foo.getI());
}
```

### Anti-patron d'initialisation dupliquee

```java
// INCORRECT
@Test void testC1() { C c = new C(); assertEquals(12.12, c.getC1()); }
@Test void testC2() { C c = new C(); assertEquals("foo", c.getC2()); }

// CORRECT
C c;
@BeforeEach void setUp() { c = new C(); }
@Test void testC1() { assertEquals(12.12, c.getC1()); }
@Test void testC2() { assertEquals("foo", c.getC2()); }
```

---

## Type 3 : Diagrammes de classes UML depuis un texte

### Instances d'examen

**2024-2025 (Devis)** : Devis, Client, Entreprise, Tache, UniteDeMesure (enum), Materiel, Fournisseur

**2021-2022 (Football)** : Championnat, Equipe, Joueur, Entraineur, Arbitre (3 types), Rencontre, evenements (Penalty, But, Carton, Remplacement, Expulsion)

**2020-2021 (Arithmetique)** : FormuleArithmetique, Constante, Noeud (interface/abstraite), Valeur, RefConstante, Operateur (abstraite), Addition, Soustraction -- patron Composite

### Methode systematique

1. **Lister tous les noms** : ce sont des classes ou attributs candidats
2. **Classifier les noms** : entite autonome = classe ; descripteur = attribut ; ensemble fixe de valeurs = enum
3. **Identifier l'heritage** : "X est un type de Y" ou "X peut etre Y" = Y est parent
4. **Identifier les associations** : "X possede Y" ou "X contient Y"
5. **Determiner la multiplicite** : "un" = 1 ; "zero ou plusieurs" = 0..* ; "au moins un" = 1..* ; "optionnel" = 0..1
6. **Agregation vs Composition** : "appartient a exactement un" ou dependance de cycle de vie = composition ; "peut exister independamment" = agregation
7. **Ajouter les methodes** : la ou un comportement est decrit
8. **Marquer les abstraites** : les classes qui ne doivent pas etre instanciees directement

### Erreurs courantes

- Oublier la multiplicite aux extremites des associations
- Tout transformer en classe (certaines choses ne sont que des attributs)
- Manquer la relation d'heritage quand le texte dit "X peut etre Y" ou "X est un type special de Y"
- Ne pas reconnaitre les enumerations ("est soit A, B, ou C")

---

## Type 4 : Graphes de flot de controle

### Que dessiner

- **Noeuds** : instructions, conditions, en-tetes de boucle
- **Aretes** : flot de controle entre les noeuds
- **Noeuds de branchement** : `if`, `switch`, conditions de boucle

### Operateurs en court-circuit

Pour `if (a || b)` :
```
  [a?] --vrai--> [corps-then]
  |
  faux
  v
  [b?] --vrai--> [corps-then]
  |
  faux
  v
  [corps-else ou suite]
```

Pour `if (a && b)` :
```
  [a?] --faux--> [corps-else ou suite]
  |
  vrai
  v
  [b?] --faux--> [corps-else ou suite]
  |
  vrai
  v
  [corps-then]
```

### Instances d'examen

- **2024-2025** : `deplacerPoints` avec deux boucles for et condition `||`
- **2021-2022** : `addService` avec condition `||`, `getTotalLatency` avec boucle for-each
- **2020-2021** : `foo` avec condition `||`

---

## Type 5 : Tables de verite

### Methode

Pour `if (a || b)` avec court-circuit :

| a | b | b evalue ? | Resultat |
|---|---|------------|----------|
| V | - | Non | V |
| F | V | Oui | V |
| F | F | Oui | F |

Pour `if (a && b)` avec court-circuit :

| a | b | b evalue ? | Resultat |
|---|---|------------|----------|
| F | - | Non | F |
| V | F | Oui | F |
| V | V | Oui | V |

---

## Type 6 : Classes d'equivalence

### Methode

1. Identifier le parametre d'entree
2. Identifier les conditions qui partitionnent l'espace des entrees
3. Nommer chaque partition
4. Identifier les valeurs limites

### Exemple (positions dans deplacerPoints, polygone a 3 points)

| Classe | Intervalle | Comportement |
|--------|-----------|--------------|
| Invalide basse | position < 0 | return (quitter la methode) |
| Valide | 0 <= position < 3 | translatee |
| Invalide haute | position >= 3 | return (quitter la methode) |

Valeurs limites : -1, 0, 2, 3

---

## Type 7 : QCM / Reponses courtes

### Sujets recurrents

**Definitions sur les tests** :
- Tester apporte de la confiance, ne prouve pas la correction
- La couverture de code est de l'analyse dynamique (le code doit s'executer)
- Les mocks testent le code qui UTILISE le mock, pas le mock lui-meme
- Les tests de mutation evaluent la qualite des tests en introduisant des modifications de code

**Definitions POO** :
- Les classes abstraites peuvent avoir des constructeurs, des methodes concretes et des champs
- Une interface definit un contrat ; l'implementation multiple est possible
- `final` sur une reference : la reference ne peut pas changer, mais l'objet peut etre mute
- Polymorphisme : meme appel de methode, comportement different selon le type reel

**Definitions UML/Conception** :
- Les user stories capturent les besoins ; les diagrammes de classes capturent la conception
- Les criteres/tests d'acceptation font le lien entre les besoins et la verification

---

## Type 8 : Analyse de couverture

### "Peut-on atteindre 100% de couverture de lignes/branches/conditions ?"

Verifier :
1. **Code mort** : code apres `return` ou `throw`
2. **Branches inatteignables** : court-circuit empechant l'evaluation
3. **Methodes privees qui changent l'etat** : par ex., `doSomething()` definit `str = "yolo"`, rendant la branche `str == null` dans le `if` suivant morte
4. **Exceptions declarees mais non lancables** : `throws SecurityException` mais aucun chemin de code ne la lance

### Analyse 2021-2022 de la classe A

- `doSomething()` definit toujours `str = "yolo"` avant la verification `if`
- Donc `str == null` est toujours `false` dans `al()` -- cette sous-condition ne peut pas etre `true`
- `SecurityException` et `NumberFormatException` sont declarees mais jamais lancees par `al()` elle-meme
- Resultat : 100% de couverture de **lignes** EST atteignable (toutes les lignes sont atteignables : `return 0` via `!value`, `return str.length() * b.getB1()` via `value == true`). Mais 100% de couverture de **branches** et **conditions** ne sont PAS atteignables (la branche `str == null` true est morte)

---

## Type 9 : Questions bonus

### Tests de mutation (2024-2025)

Expliquer en quelques phrases le fonctionnement des tests de mutation et leur interet :

"Les tests de mutation modifient automatiquement le code source pour creer des 'mutants' (par ex., changer `>` en `>=`, supprimer un appel de methode, inverser une condition). La suite de tests est ensuite executee contre chaque mutant. Si un test echoue, le mutant est 'tue' (detecte). Si tous les tests passent, le mutant 'survit', indiquant une lacune dans la suite de tests. Le score de mutation (tues/total) mesure la qualite des tests -- un score eleve signifie que les tests detectent efficacement les modifications du code."
