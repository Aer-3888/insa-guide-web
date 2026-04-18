---
title: "TP CPOO1 - Exercices 2 a 6 : Tests avec JUnit 5, Mockito et Pitest"
sidebar_position: 3
---

# TP CPOO1 - Exercices 2 a 6 : Tests avec JUnit 5, Mockito et Pitest

> D'apres les instructions de l'enseignant dans : `S5/CPOO/data/moodle/tp/tp3_gitlab_exercises/README.md` (Exercices 2-6)

Ces exercices travaillent avec des classes preexistantes. Vous ecrivez des tests, analysez le flot de controle et evaluez la qualite des tests. Le code se trouve dans le projet gitlab `tp-CPOO1`, avec la structure de dossiers correspondant a `src/main/java/cpoo1/exoN/`.

---

## Exercice 2 - Tester Exo2 (Validation d'IP et reseau)

Texte original de l'enseignant :

> Vous devez tester la classe `Exo2` (la classe de tests est deja creee).

### Code a tester

**Exo2.java** (`cpoo1/exo2/`):

```java
package cpoo1.exo2;

import java.util.regex.Pattern;

public class Exo2 {
    private final Network network;
    private final Pattern regex;

    public Exo2(Network network) {
        this.network = network;
        regex = Pattern.compile("^((25[0-5]|(2[0-4]|1\\d|[1-9]|)\\d)\\.?\\b){4}$");
    }

    public boolean connectServer(final String address) {
        if (!regex.matcher(address).matches()) {
            return false;
        }
        try {
            boolean pingOK = network.ping(address);
            network.sendGetHTTPQuery(address);
            return pingOK;
        } catch (NetworkException ex) {
            return false;
        }
    }
}
```

**Network.java:**

```java
package cpoo1.exo2;

public interface Network {
    boolean ping(String address) throws NetworkException;
    void sendGetHTTPQuery(String address);
}
```

**NetworkException.java:**

```java
package cpoo1.exo2;

public class NetworkException extends Exception { }
```

**TestExo2.java** (squelette fourni par l'enseignant) :

```java
package cpoo1.exo2;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestExo2 {
    Exo2 exo2;
    Network network;
}
```

---

### Question 1

### Tester comme dans l'exercice precedent.

**Reponse :**

`Exo2` depend de `Network`, qui est une interface. On ne peut pas utiliser un vrai reseau dans les tests. On cree un **mock** : un faux objet qui simule le comportement de `Network`. Mockito cree des mocks qui retournent des valeurs par defaut (false pour les booleens, null pour les objets) sauf si configures avec `when().thenReturn()`.

Il y a 4 chemins distincts a travers `connectServer` :
1. Format d'IP invalide --> retourne false
2. IP valide, ping retourne true, pas d'exception --> retourne true
3. IP valide, ping retourne false, pas d'exception --> retourne false
4. IP valide, ping lance NetworkException --> retourne false

```java
package cpoo1.exo2;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class TestExo2 {
    Exo2 exo2;
    Network network;

    @BeforeEach
    void setUp() {
        network = Mockito.mock(Network.class);
        exo2 = new Exo2(network);
    }

    // Path 2: Valid IP, ping succeeds
    @Test
    void testValidIPPingSucceeds() throws NetworkException {
        Mockito.when(network.ping("192.168.1.1")).thenReturn(true);
        assertTrue(exo2.connectServer("192.168.1.1"));
    }

    // Path 3: Valid IP, ping fails
    @Test
    void testValidIPPingFails() throws NetworkException {
        Mockito.when(network.ping("10.0.0.1")).thenReturn(false);
        assertFalse(exo2.connectServer("10.0.0.1"));
    }

    // Path 4: Valid IP, NetworkException thrown
    @Test
    void testValidIPNetworkException() throws NetworkException {
        Mockito.when(network.ping("10.0.0.1")).thenThrow(new NetworkException());
        assertFalse(exo2.connectServer("10.0.0.1"));
    }
}
```

**Fichiers modifies :**
- `TestExo2.java`: Added `@BeforeEach` setup with mock Network, added tests for paths 2, 3, and 4

---

### Question 2

### Utiliser des tests parametres pour tester le `if(!regex.matcher(address).matches())`. Attention, le(s) test(s) utilisant une mauvaise adresse IP doivent echouer parce que le format de l'IP n'est pas bon (et non pas parce que `network.ping(address)` retourne `false` par defaut). Dans ce cas, il vous faut donc configurer `network.ping(address)` pour qu'elle retourne `true`.

**Reponse :**

L'enseignant avertit explicitement : les tests pour des IP invalides doivent echouer **parce que le format de l'IP est incorrect**, et non parce que `network.ping` retourne false (qui est la valeur par defaut du mock). Il faut donc configurer `network.ping(address)` pour retourner `true`. Ainsi, la seule raison pour laquelle `connectServer` retourne `false` est la verification du regex.

```java
    // Path 1: Invalid IP formats (parameterized)
    @ParameterizedTest
    @ValueSource(strings = {
        "abc",                    // not an IP at all
        "999.999.999.999",        // octets > 255
        "",                       // empty string
        "1.2.3",                  // only 3 octets
        "256.1.1.1",              // first octet > 255
        "1.2.3.4.5",              // 5 octets
        "192.168.1",              // missing last octet
        "hello.world.foo.bar"     // words instead of numbers
    })
    void testInvalidIPFormat(String address) throws NetworkException {
        // CRITICAL: configure ping to return true
        // so the failure comes from the REGEX, not from ping
        Mockito.when(network.ping(address)).thenReturn(true);

        assertFalse(exo2.connectServer(address));
    }
```

**Fichiers modifies :**
- `TestExo2.java`: Added `@ParameterizedTest` with `@ValueSource` for invalid IP addresses, with `network.ping` configured to return `true`

---

### Question 3

### Meme si vous avez une couverture de 100%, un de vos tests doit verifier que la methode `sendGetHTTPQuery` est bien appelee avec la valeur `address`.

**Reponse :**

La couverture de code vous dit quelles lignes ont ete executees, mais pas si les bonnes methodes ont ete appelees avec les bons arguments. `Mockito.verify()` verifie qu'une methode du mock a ete appelee avec des arguments specifiques.

```java
    // Verify sendGetHTTPQuery is called with the correct address
    @Test
    void testSendGetHTTPQueryCalledWithAddress() throws NetworkException {
        String address = "122.154.198.1";
        Mockito.when(network.ping(address)).thenReturn(true);

        exo2.connectServer(address);

        // Verify that sendGetHTTPQuery was called exactly once with this address
        Mockito.verify(network).sendGetHTTPQuery(address);
    }

    // Bonus: verify sendGetHTTPQuery is NOT called on invalid IP
    @Test
    void testSendGetHTTPQueryNotCalledOnInvalidIP() throws NetworkException {
        exo2.connectServer("invalid");

        // sendGetHTTPQuery should never be called because the regex check fails first
        Mockito.verify(network, Mockito.never()).sendGetHTTPQuery(Mockito.anyString());
    }
```

**Fichiers modifies :**
- `TestExo2.java`: Added `verify()` test to confirm `sendGetHTTPQuery` is called with the correct address value

---

## Exercice 3 - Client et Services (Analyse de flot de controle)

Texte original de l'enseignant :

> Le code de cet exercice se trouve dans le dossier `exo4`. Il concerne une classe `Client` qui utilise des objets `Service`. Pour rappel, une latence est le temps entre une demande et la reponse.

### Code a tester

**Client.java** (`cpoo1/exo4/`):

```java
package cpoo1.exo4;

import java.util.ArrayList;
import java.util.List;

interface Service {
    int getLatency();
}

public class Client {
    private final List<Service> services;

    public Client() {
        services = new ArrayList<>();
    }

    public void addService(Service s) {
        if(s==null || services.contains(s)) throw new IllegalArgumentException(); // line 23
        services.add(s);
    }

    public List<Service> getServices() {
        return services;
    }

    public double getTotalLatency() { // A
        double sum = 0.0; // B
        for(Service s : services) { // C
            sum += s.getLatency(); // D
        }
        return sum; // E
    }
}
```

---

### Question 1

### Quelle est la difference entre les operateurs `&&` et `&` (idem pour `||` et `|`) ? Exemple ligne 23.

**Reponse :**

**Operateurs en court-circuit (`&&`, `||`) :**
- `&&` : si le cote gauche est `false`, le cote droit n'est **pas evalue** (le resultat est deja `false`)
- `||` : si le cote gauche est `true`, le cote droit n'est **pas evalue** (le resultat est deja `true`)

**Operateurs sans court-circuit (`&`, `|`) :**
- `&` : les deux cotes sont **toujours evalues**, quelle que soit la valeur du cote gauche
- `|` : les deux cotes sont **toujours evalues**, quelle que soit la valeur du cote gauche

**La ligne 23 utilise `||` (court-circuit) :**
```java
if (s == null || services.contains(s))
```
Si `s == null` est `true`, alors `services.contains(s)` n'est pas evalue. Cela signifie :
1. Performance : pas besoin de chercher dans la liste si s est null
2. Pour les tests : il suffit de couvrir les combinaisons specifiques qui sont effectivement executees

---

### Question 2

### En tenant compte de la question precedente, donner la table de verite effective de la condition ligne 23. Pourquoi est-ce utile lors de l'ecriture de tests ?

**Reponse :**

Comme `||` effectue un court-circuit, toutes les combinaisons des deux sous-conditions ne sont pas atteignables :

| `s == null` | `services.contains(s)` | Evalue ? | Resultat |
|:-----------:|:---------------------:|:--------:|:--------:|
| true | -- (non evalue) | Court-circuit | lance `IllegalArgumentException` |
| false | true | Les deux evalues | lance `IllegalArgumentException` |
| false | false | Les deux evalues | `services.add(s)` reussit |

**Seulement 3 lignes au lieu de 4.** La combinaison `s == null` ET `services.contains(s) == false` existerait avec `|` mais pas avec `||`. Cela signifie qu'il faut exactement **3 cas de test** pour couvrir toutes les combinaisons de conditions/branches.

C'est utile lors de l'ecriture des tests car cela indique le nombre minimum de cas de test necessaires pour une couverture complete des conditions/branches.

---

### Question 3

### En utilisant cette table de verite, donner maintenant le graphe de flot de controles de la methode `addService`.

**Reponse :**

Avec le court-circuit `||`, le graphe a deux noeuds de decision separes, pas un noeud combine :

```
    [entry: s]
        |
        v
    [s == null?] ----true----> [throw IllegalArgumentException]
        |
       false (short-circuit: s is not null, so evaluate right side)
        |
        v
    [services.contains(s)?] ----true----> [throw IllegalArgumentException]
        |
       false
        |
        v
    [services.add(s)]
        |
        v
    [return]
```

Pour la couverture de branches, il faut tester les branches `s == null` et `services.contains(s)` independamment.

---

### Question 4

### En lien avec la question precedente, quelles sont les classes d'equivalence du parametre `s` de la methode `addService` ?

**Reponse :**

Une classe d'equivalence est un ensemble d'entrees qui produisent le meme comportement :

| Classe | Description | Entree representative | Resultat attendu |
|:------:|-------------|----------------------|:----------------:|
| 1 | `s` est null | `null` | lance `IllegalArgumentException` |
| 2 | `s` est un Service valide deja dans la liste | un Service deja ajoute | lance `IllegalArgumentException` |
| 3 | `s` est un Service valide PAS dans la liste | un nouveau mock Service | `s` est ajoute a la liste |

---

### Question 5

### Donner le graphe de flot de controle representant le code de la methode `getTotalLatency`. Utilisez les lettres mises en commentaires pour nommer les noeuds.

**Answer:**

```
    A (method entry)
    |
    v
    B (double sum = 0.0)
    |
    v
    C (for loop: has next service?) ----NO----> E (return sum)
    |
   YES
    |
    v
    D (sum += s.getLatency())
    |
    +----> back to C
```

Chemins a travers le graphe :
1. **Liste vide :** A -> B -> C -> E (le corps de la boucle ne s'execute jamais)
2. **Un service :** A -> B -> C -> D -> C -> E
3. **Deux services :** A -> B -> C -> D -> C -> D -> C -> E

Pour atteindre une couverture de branches complete, il faut au minimum les chemins 1 et 2 (un test avec une liste vide, un avec au moins un service).

---

### Question 6

### Donner le code Java d'une classe de tests unitaires `ClientTest` testant la classe `Client` avec une couverture de conditions et de branches de 100 %. Vous ne disposez pas d'implementations de l'interface `Service`.

**Reponse :**

Comme `Service` est une interface sans implementation fournie, nous devons la **mocker**. Mockito cree un faux `Service` dont `getLatency()` retourne une valeur configuree.

```java
package cpoo1.exo4;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

public class ClientTest {
    private Client client;

    @BeforeEach
    void setUp() {
        client = new Client();
    }

    // ========== addService tests ==========

    // Equivalence class 1: s is null
    @Test
    void testAddServiceNullThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> client.addService(null));
    }

    // Equivalence class 2: s is already in the list (duplicate)
    @Test
    void testAddServiceDuplicateThrows() {
        Service s = Mockito.mock(Service.class);
        client.addService(s);
        assertThrows(IllegalArgumentException.class,
            () -> client.addService(s));
    }

    // Equivalence class 3: s is a valid new Service
    @Test
    void testAddServiceValid() {
        Service s = Mockito.mock(Service.class);
        client.addService(s);
        assertEquals(1, client.getServices().size());
        assertSame(s, client.getServices().get(0));
    }

    // ========== getServices tests ==========

    @Test
    void testGetServicesInitiallyEmpty() {
        assertTrue(client.getServices().isEmpty());
    }

    @Test
    void testGetServicesAfterAdding() {
        Service s1 = Mockito.mock(Service.class);
        Service s2 = Mockito.mock(Service.class);
        client.addService(s1);
        client.addService(s2);
        assertEquals(2, client.getServices().size());
    }

    // ========== getTotalLatency tests ==========

    // Path A -> B -> C -> E (empty list)
    @Test
    void testGetTotalLatencyEmptyList() {
        assertEquals(0.0, client.getTotalLatency(), 0.001);
    }

    // Path A -> B -> C -> D -> C -> E (one service)
    @Test
    void testGetTotalLatencyOneService() {
        Service s = Mockito.mock(Service.class);
        Mockito.when(s.getLatency()).thenReturn(100);
        client.addService(s);
        assertEquals(100.0, client.getTotalLatency(), 0.001);
    }

    // Path A -> B -> C -> D -> C -> D -> C -> E (multiple services)
    @Test
    void testGetTotalLatencyMultipleServices() {
        Service s1 = Mockito.mock(Service.class);
        Service s2 = Mockito.mock(Service.class);
        Service s3 = Mockito.mock(Service.class);
        Mockito.when(s1.getLatency()).thenReturn(100);
        Mockito.when(s2.getLatency()).thenReturn(200);
        Mockito.when(s3.getLatency()).thenReturn(50);
        client.addService(s1);
        client.addService(s2);
        client.addService(s3);
        assertEquals(350.0, client.getTotalLatency(), 0.001);
    }
}
```

**Fichiers modifies :**
- `ClientTest.java`: Created from scratch with mock Services, covers all 3 equivalence classes of `addService` plus all branches of `getTotalLatency`

---

## Exercice 4 - PlateauJeu (Plateau de jeu avec tests parametres)

Texte original de l'enseignant :

> Le code de cet exercice se trouve dans le dossier `exo5`. Il concerne une classe `PlateauJeu` qui utilise des objets `Pion`.

### Code a tester

**PlateauJeu.java** (`cpoo1/exo5/`):

```java
package cpoo1.exo5;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

interface Pion {
    int getX();
    int getY();
}

public class PlateauJeu {
    public static final int SIZE = 5;
    private final List<Pion> pions;

    public PlateauJeu() {
        pions = new ArrayList<>();
    }

    public List<Pion> getPions() {
        return Collections.unmodifiableList(pions);
    }

    public boolean isFree(final int x, final int y) {
        if(isOut(x) || isOut(y)) {
            return false;
        }
        for (final Pion pion : pions) {
            if (pion.getX() == x && pion.getY() == y) {
                return false;
            }
        }
        return true;
    }

    public boolean addPion(final Pion p) {
        if (p == null || !isFree(p.getX(), p.getY())) {
            return false;
        }
        pions.add(p);
        return true;
    }

    private boolean isOut(final int value) {
        return value < 0 || value >= SIZE;
    }
}
```

---

### Question 1

### En Java, que signifie le mot-cle `final` pose sur l'attribut `pions` ? Quelle est la difference entre un attribut de type primitif *final* (exemple `SIZE`) et un attribut de type complexe (exemple `pions`) ?

**Reponse :**

**`public static final int SIZE = 5;`**
- `SIZE` est une constante. La valeur `5` ne peut jamais changer.
- `static` signifie qu'elle appartient a la classe, pas a une instance.
- C'est une vraie constante immuable.

**`private final List<Pion> pions;`**
- La **reference** `pions` pointe toujours vers le meme objet `ArrayList` apres la construction. On ne peut pas ecrire `pions = new ArrayList<>()` apres le constructeur.
- MAIS le **contenu** de la liste peut toujours changer. `pions.add(...)`, `pions.remove(...)`, `pions.clear()` fonctionnent tous.
- `final` sur un type complexe signifie "la variable pointe toujours vers le meme objet", PAS "l'objet lui-meme est immuable".

Le `Collections.unmodifiableList()` dans `getPions()` est distinct de `final`. Il retourne une **vue** qui lance `UnsupportedOperationException` si on tente de la modifier. `final` empeche la reassignation de la variable ; `unmodifiableList()` empeche la modification du contenu via la vue retournee.

---

### Question 2

### Etudier le code de la classe `PlateauJeu` et inferez quelles sont les classes d'equivalence de la coordonnee `x` (idem pour `y`) d'un pion ?

**Reponse :**

Etant donne `SIZE = 5` et `isOut(value)` retourne `value < 0 || value >= SIZE` :

| Classe | Intervalle | Resultat `isOut` | Description |
|:------:|:----------:|:----------------:|-------------|
| 1 | x < 0 | true | En dessous de l'intervalle valide |
| 2 | 0 <= x < 5 | false | Intervalle valide [0, 4] |
| 3 | x >= 5 | true | Au-dessus de l'intervalle valide |

**Valeurs limites** (les plus susceptibles de reveler des bugs) : `-1, 0, 4, 5`

- `-1` : derniere valeur invalide sous 0
- `0` : premiere valeur valide
- `4` : derniere valeur valide (SIZE - 1)
- `5` : premiere valeur invalide a SIZE

---

### Question 3

### Donner le graphe de flot de controle de la methode `isFree`.

**Answer:**

```
    [entry: x, y]
         |
         v
    [isOut(x)?] ----true----> [return false]
         |
        false
         |
         v
    [isOut(y)?] ----true----> [return false]
         |
        false
         |
         v
    [for pion in pions: has next?] ----NO----> [return true]
         |
        YES
         |
         v
    [pion.getX()==x && pion.getY()==y?] ----true----> [return false]
         |
        false
         |
         +----> back to loop
```

Pour atteindre une couverture de branches complete :
- Un test ou `isOut(x)` est true
- Un test ou `isOut(y)` est true (mais `isOut(x)` est false)
- Un test ou les coordonnees sont valides et aucun pion n'occupe la position (retourne true)
- Un test ou les coordonnees sont valides et un pion occupe la position (retourne false)

---

### Question 4

### Tester la methode `isOut` en utilisant des tests parametres.

**Reponse :**

Comme `isOut` est `private`, on la teste indirectement via `isFree`. Si `isOut(x)` retourne true, alors `isFree(x, validY)` retourne false.

```java
package cpoo1.exo5;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

public class PlateauJeuTest {
    private PlateauJeu plateau;

    @BeforeEach
    void setUp() {
        plateau = new PlateauJeu();
    }

    // Test x values that are out of bounds (y = 2, a valid value)
    @ParameterizedTest
    @ValueSource(ints = {-100, -1, 5, 6, 100})
    void testIsOutXOutOfBounds(int x) {
        assertFalse(plateau.isFree(x, 2));
    }

    // Test y values that are out of bounds (x = 2, a valid value)
    @ParameterizedTest
    @ValueSource(ints = {-100, -1, 5, 6, 100})
    void testIsOutYOutOfBounds(int y) {
        assertFalse(plateau.isFree(2, y));
    }

    // Test valid x coordinates (with valid y = 2)
    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2, 3, 4})
    void testIsOutXInBounds(int x) {
        assertTrue(plateau.isFree(x, 2));
    }

    // Test valid y coordinates (with valid x = 2)
    @ParameterizedTest
    @ValueSource(ints = {0, 1, 2, 3, 4})
    void testIsOutYInBounds(int y) {
        assertTrue(plateau.isFree(2, y));
    }

    // ========== Additional tests for full coverage ==========

    @Test
    void testIsFreeEmptyBoard() {
        assertTrue(plateau.isFree(2, 3));
    }

    @Test
    void testIsFreeOccupiedPosition() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(2);
        Mockito.when(p.getY()).thenReturn(3);
        plateau.addPion(p);

        assertFalse(plateau.isFree(2, 3));  // occupied
    }

    @Test
    void testIsFreeAdjacentToOccupied() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(2);
        Mockito.when(p.getY()).thenReturn(3);
        plateau.addPion(p);

        assertTrue(plateau.isFree(2, 2));   // same x, different y
        assertTrue(plateau.isFree(3, 3));   // different x, same y
    }

    @Test
    void testAddPionNull() {
        assertFalse(plateau.addPion(null));
    }

    @Test
    void testAddPionValid() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(0);
        Mockito.when(p.getY()).thenReturn(0);

        assertTrue(plateau.addPion(p));
        assertEquals(1, plateau.getPions().size());
    }

    @Test
    void testAddPionOutOfBounds() {
        Pion p = Mockito.mock(Pion.class);
        Mockito.when(p.getX()).thenReturn(-1);
        Mockito.when(p.getY()).thenReturn(0);

        assertFalse(plateau.addPion(p));
    }

    @Test
    void testAddPionDuplicatePosition() {
        Pion p1 = Mockito.mock(Pion.class);
        Mockito.when(p1.getX()).thenReturn(2);
        Mockito.when(p1.getY()).thenReturn(3);
        plateau.addPion(p1);

        Pion p2 = Mockito.mock(Pion.class);
        Mockito.when(p2.getX()).thenReturn(2);
        Mockito.when(p2.getY()).thenReturn(3);

        assertFalse(plateau.addPion(p2));  // same position
        assertEquals(1, plateau.getPions().size());
    }

    @Test
    void testGetPionsReturnsUnmodifiableList() {
        assertThrows(UnsupportedOperationException.class,
            () -> plateau.getPions().clear());
    }

    @Test
    void testGetPionsInitiallyEmpty() {
        assertTrue(plateau.getPions().isEmpty());
    }
}
```

**Fichiers modifies :**
- `PlateauJeuTest.java`: Created with parameterized tests for `isOut` (via `isFree`), plus tests for `addPion`, `isFree` with occupants, and `getPions`

---

## Exercice 5 - Mocker Random (Exo8)

Texte original de l'enseignant :

> La classe `Exo8` presente deux problemes pour tester ses methodes.

### Code a tester

**Exo8.java** (`cpoo1/exo8/`):

```java
package cpoo1.exo8;

import java.util.random.RandomGenerator;

class Random {
    public int nextRandom() {
        return RandomGenerator.getDefault().nextInt();
    }
}

public class Exo8 {
    private final Random rand;

    public Exo8() {
        rand = new Random();
    }

    public int uneFonctionInutile(int coeff) {
        return rand.nextRandom() * coeff;
    }

    public int uneAutreFonctionInutile(int coeff) {
        return RandomGenerator.getDefault().nextInt() * coeff;
    }
}
```

---

### Question 1

### Cette classe instancie dans son constructeur l'objet `Random`. Nous ne pouvons donc pas "mocker" un `Random` et le donner a l'objet `Exo8`. Utilisez cette technique pour pallier ce probleme et tester la methode `uneFonctionInutile`. https://javadoc.io/static/org.mockito/mockito-core/5.20.0/org.mockito/org/mockito/Mockito.html#49

**Reponse :**

Le probleme est que `Exo8` cree `Random` en interne -- on ne peut pas injecter un mock via le constructeur. La solution est `Mockito.mockConstruction(Class)`, qui intercepte les appels `new Class()`. Chaque fois que `new Random()` est appele dans le bloc `try`, Mockito remplace l'objet nouvellement cree par un mock.

```java
package cpoo1.exo8;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;

class Exo8Test {

    @Test
    void testUneFonctionInutile() {
        // mockConstruction intercepts "new Random()" inside the try block
        try (var mocked = Mockito.mockConstruction(Random.class,
                (mock, context) -> {
                    // Configure the mock: nextRandom() returns 42
                    Mockito.when(mock.nextRandom()).thenReturn(42);
                })) {

            // When Exo8() calls "new Random()", it gets our mock
            Exo8 exo8 = new Exo8();

            // uneFonctionInutile(5) = mock.nextRandom() * 5 = 42 * 5 = 210
            assertEquals(210, exo8.uneFonctionInutile(5));
        }
        // After the try block, construction mocking is deactivated
    }

    @Test
    void testUneFonctionInutileWithZero() {
        try (var mocked = Mockito.mockConstruction(Random.class,
                (mock, context) -> {
                    Mockito.when(mock.nextRandom()).thenReturn(7);
                })) {
            Exo8 exo8 = new Exo8();
            assertEquals(0, exo8.uneFonctionInutile(0));  // 7 * 0 = 0
        }
    }
}
```

**Comment ca fonctionne etape par etape :**

```
1. Mockito.mockConstruction(Random.class, ...) activates construction interception
2. new Exo8() is called
3. Inside Exo8(), "rand = new Random()" is intercepted
4. Instead of a real Random, a mock Random is assigned to rand
5. The callback configures mock.nextRandom() to return 42
6. exo8.uneFonctionInutile(5) calls rand.nextRandom() which returns 42
7. 42 * 5 = 210
```

**Fichiers modifies :**
- `Exo8Test.java`: Created with `mockConstruction` tests for `uneFonctionInutile`

---

### Question 2

### L'autre methode de la classe `Exo8`, `uneAutreFonctionInutile`, utilise directement une methode statique de la classe `RandomGenerator`. Utilisez cette autre technique pour pallier ce nouveau probleme : https://javadoc.io/static/org.mockito/mockito-core/5.20.0/org.mockito/org/mockito/Mockito.html#48

**Reponse :**

Les methodes statiques ne peuvent pas etre mockees avec `mock()` classique car elles appartiennent a la classe, pas a une instance. `Mockito.mockStatic()` cree un remplacement scope : dans le bloc `try`, les appels a la methode statique retournent ce que vous configurez.

```java
    @Test
    void testUneAutreFonctionInutile() {
        import java.util.random.RandomGenerator;

        // mockStatic intercepts static calls on RandomGenerator
        try (var mockedStatic = Mockito.mockStatic(RandomGenerator.class)) {
            // Create a mock RandomGenerator
            RandomGenerator mockGen = Mockito.mock(RandomGenerator.class);
            Mockito.when(mockGen.nextInt()).thenReturn(10);

            // When RandomGenerator.getDefault() is called, return our mock
            mockedStatic.when(RandomGenerator::getDefault).thenReturn(mockGen);

            // Must create Exo8 INSIDE the try block (after static mock is active)
            Exo8 exo8 = new Exo8();

            // uneAutreFonctionInutile(3) = RandomGenerator.getDefault().nextInt() * 3
            // = mockGen.nextInt() * 3 = 10 * 3 = 30
            assertEquals(30, exo8.uneAutreFonctionInutile(3));
        }
    }

    @Test
    void testUneAutreFonctionInutileNegativeCoeff() {
        try (var mockedStatic = Mockito.mockStatic(RandomGenerator.class)) {
            RandomGenerator mockGen = Mockito.mock(RandomGenerator.class);
            Mockito.when(mockGen.nextInt()).thenReturn(5);
            mockedStatic.when(RandomGenerator::getDefault).thenReturn(mockGen);

            Exo8 exo8 = new Exo8();
            assertEquals(-15, exo8.uneAutreFonctionInutile(-3)); // 5 * -3 = -15
        }
    }
```

**Comment ca fonctionne etape par etape :**

```
1. Mockito.mockStatic(RandomGenerator.class) activates static interception
2. mockedStatic.when(RandomGenerator::getDefault).thenReturn(mockGen) configures it
3. exo8.uneAutreFonctionInutile(3) is called
4. Inside: RandomGenerator.getDefault() is intercepted, returns mockGen
5. mockGen.nextInt() returns 10 (configured)
6. 10 * 3 = 30
```

**IMPORTANT :** `mockConstruction` et `mockStatic` utilisent tous deux `try-with-resources`. Le mock n'est actif que dans le bloc `try`. Apres la fermeture du bloc, le comportement normal est retabli.

**Fichiers modifies :**
- `Exo8Test.java`: Added `mockStatic` tests for `uneAutreFonctionInutile`

---

## Exercice 6 - Tests de mutation (Exo9)

Texte original de l'enseignant :

> Etudier le code de la classe `Exo9` ainsi que celui de sa classe de test `TestExo9`. Cette derniere teste tres mal la classe `Exo9`.

### Code a tester (avec bug)

**Exo9.java** (`cpoo1/exo9/`):

```java
package cpoo1.exo9;

import java.util.ArrayList;
import java.util.List;

public class Exo9 {
    private final List<String> maListe;

    public Exo9() {
        maListe = new ArrayList<>();
    }

    public void ajouterElement(String elt) {
        maListe.add(elt);
    }

    public boolean estVide() {
        return maListe.isEmpty();
    }

    public boolean contient(String str) {
        final int taille = maListe.size();

        for (int i = 0; i <= taille; i++) {    // BUG: <= should be <
            if(maListe.get(i).equals(str)) {
                return true;
            }
        }
        return false;
    }
}
```

**TestExo9.java** (tests intentionnellement faibles fournis par l'enseignant) :

```java
package cpoo1.exo9;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class TestExo9 {
    Exo9 exo9;

    @BeforeEach
    void setUp() {
        exo9 = new Exo9();
    }

    @Test
    void testIsEmpty() {
        assertTrue(exo9.estVide());
    }

    @Test
    void testAjouterElement() {
        exo9.ajouterElement("foo");
    }

    @Test
    void testContient() {
        exo9.ajouterElement("bar");
        assertTrue(exo9.contient("bar"));
    }
}
```

---

### Question 1

### Quelles sont les trois raisons ? La premiere est assez evidente, les deux autres moins.

**Reponse :**

**Probleme 1 (evident) : `testAjouterElement` n'a AUCUNE assertion.**

```java
@Test
void testAjouterElement() {
    exo9.ajouterElement("foo");
    // No assertion! We never verify that "foo" was actually added.
    // You could delete the body of ajouterElement() and this test would still pass.
}
```

**Probleme 2 (subtil) : `testIsEmpty` ne teste que le cas `true`.**

```java
@Test
void testIsEmpty() {
    assertTrue(exo9.estVide());
    // Never tests that estVide() returns FALSE after adding an element.
    // You could replace the method body with "return true;" and this test still passes.
}
```

**Probleme 3 (subtil) : `testContient` ne teste jamais le cas ou l'element n'est PAS trouve.**

```java
@Test
void testContient() {
    exo9.ajouterElement("bar");
    assertTrue(exo9.contient("bar"));
    // Never tests contient("notHere") which should return false.
    // Also: "bar" is found at index 0, so the loop never reaches
    // the off-by-one bug at index == taille.
}
```

Le bug dans `contient` est `i <= taille` au lieu de `i < taille`. Quand l'element EST dans la liste, il est trouve avant d'atteindre l'indice invalide. Le bug ne se declenche que quand l'element n'est PAS trouve (la boucle va un indice trop loin et lance `IndexOutOfBoundsException`).

---

### Question 2

### Pour trouver les trois problemes : commenter le contenu des trois methodes, et pour `estVide`, ecrivez `return true;`. Reexecuter les tests. Essayez de comprendre pourquoi le fait de changer le code et que la suite de tests passe toujours est un probleme.

**Reponse :**

Si on modifie le code de production et que les tests passent toujours, les tests ne verifient pas le comportement. C'est une **suite de tests faible** :

- `estVide()` retourne toujours `true` --> `testIsEmpty` passe toujours (ne verifie que `true`)
- `ajouterElement()` ne fait rien --> `testAjouterElement` passe toujours (pas d'assertion)
- `contient()` retourne toujours `true` --> `testContient` passe toujours (n'asserte que `true`)

Une bonne suite de tests devrait **echouer quand l'implementation change**. Des tests qui passent quelle que soit l'implementation donnent un faux sentiment de securite. C'est precisement ce que les tests de mutation detectent.

---

### Question 3

### En ligne de commande, executez Pitest : `mvn clean install test org.pitest:pitest-maven:mutationCoverage` puis ouvrez le fichier `index.html` se trouvant dans `target/pi-reports`. Pitest est un outil de score de *mutation testing*. Essayez de comprendre le principe a partir des resultats.

**Reponse :**

**Ce que fait Pitest :**

1. Execute vos tests pour s'assurer qu'ils passent tous (ligne de base)
2. Cree des **mutants** : des copies de votre code avec de petits changements :
   - Remplacer `<=` par `<` (mutant de borne)
   - Remplacer `return true` par `return false`
   - Supprimer des appels de methodes
   - Changer `+` en `-`
3. Execute vos tests contre chaque mutant
4. Si un test echoue (detecte la mutation), le mutant est **tue** (bien)
5. Si tous les tests passent (mutation non detectee), le mutant **survit** (mauvais)
6. **Score de mutation** = mutants tues / total mutants * 100%

Avec les tests faibles originaux, beaucoup de mutants survivent car :
- Changer `i <= taille` en `i < taille` --> les tests passent toujours (la correction du bug n'est pas detectee !)
- Supprimer `maListe.add(elt)` --> `testAjouterElement` passe toujours (pas d'assertion)
- Changer `return maListe.isEmpty()` en `return true` --> `testIsEmpty` passe toujours

---

### Question 4

### Concernant le *mutation testing*, modifier la suite de tests de `TestExo9` pour arriver a un score de mutation de 100% (corrigez egalement les eventuels defauts presents dans la classe `Exo9`).

**Reponse :**

**Etape 1 : Corriger le bug dans `Exo9.contient()`**

Le bug est a la ligne 24 : `i <= taille` devrait etre `i < taille`. Si la liste a 3 elements, `taille = 3`, les indices valides sont 0, 1, 2. Avec `i <= 3`, la boucle essaie `maListe.get(3)`, ce qui lance `IndexOutOfBoundsException`.

**Exo9.java corrige :**

```java
package cpoo1.exo9;

import java.util.ArrayList;
import java.util.List;

public class Exo9 {
    private final List<String> maListe;

    public Exo9() {
        maListe = new ArrayList<>();
    }

    public void ajouterElement(String elt) {
        maListe.add(elt);
    }

    public boolean estVide() {
        return maListe.isEmpty();
    }

    public boolean contient(String str) {
        final int taille = maListe.size();

        for (int i = 0; i < taille; i++) {    // FIXED: < instead of <=
            if (maListe.get(i).equals(str)) {
                return true;
            }
        }
        return false;
    }
}
```

**Etape 2 : Ecrire des tests complets pour 100% de score de mutation**

Pour atteindre 100% de score de mutation, chaque mutation possible doit faire echouer au moins un test :

```java
package cpoo1.exo9;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class TestExo9 {
    Exo9 exo9;

    @BeforeEach
    void setUp() {
        exo9 = new Exo9();
    }

    // ========== estVide tests ==========

    @Test
    void testEstVideTrue() {
        assertTrue(exo9.estVide());
    }

    @Test
    void testEstVideFalse() {
        exo9.ajouterElement("foo");
        assertFalse(exo9.estVide());  // kills "return true" mutant
    }

    // ========== ajouterElement tests ==========

    @Test
    void testAjouterElementAddsToList() {
        exo9.ajouterElement("foo");
        assertFalse(exo9.estVide());      // kills "remove add()" mutant
        assertTrue(exo9.contient("foo")); // verifies element was actually added
    }

    @Test
    void testAjouterMultipleElements() {
        exo9.ajouterElement("a");
        exo9.ajouterElement("b");
        assertTrue(exo9.contient("a"));
        assertTrue(exo9.contient("b"));
    }

    // ========== contient tests ==========

    @Test
    void testContientPresent() {
        exo9.ajouterElement("bar");
        assertTrue(exo9.contient("bar"));  // kills "return false" mutant in loop
    }

    @Test
    void testContientAbsent() {
        exo9.ajouterElement("bar");
        assertFalse(exo9.contient("notHere"));  // kills "return true" mutant at end
        // Also catches the i <= taille bug (would throw IndexOutOfBoundsException)
    }

    @Test
    void testContientEmptyList() {
        assertFalse(exo9.contient("anything"));  // loop body never executes
    }

    @Test
    void testContientMultipleElementsFoundLast() {
        exo9.ajouterElement("a");
        exo9.ajouterElement("b");
        exo9.ajouterElement("c");
        assertTrue(exo9.contient("c"));  // exercises the loop fully
    }

    @Test
    void testContientMultipleElementsNotFound() {
        exo9.ajouterElement("a");
        exo9.ajouterElement("b");
        assertFalse(exo9.contient("z"));  // loop runs through all elements
    }
}
```

**Pourquoi chaque test tue des mutants specifiques :**

| Mutant | Tue par |
|--------|---------|
| Remove `maListe.add(elt)` in `ajouterElement` | `testAjouterElementAddsToList` (assertFalse on estVide fails) |
| Change `return maListe.isEmpty()` to `return true` | `testEstVideFalse` (assertFalse fails) |
| Change `return maListe.isEmpty()` to `return false` | `testEstVideTrue` (assertTrue fails) |
| Change `i < taille` to `i <= taille` | `testContientAbsent` (throws IndexOutOfBoundsException) |
| Change `return true` to `return false` in contient loop | `testContientPresent` (assertTrue fails) |
| Change `return false` to `return true` at end of contient | `testContientAbsent` (assertFalse fails) |
| Remove the `equals` check | `testContientAbsent` (would return true for any string) |
| Negate the `equals` check | `testContientPresent` (would not find "bar") |

**Fichiers modifies :**
- `Exo9.java`: Fixed bug `i <= taille` to `i < taille` on line 24
- `TestExo9.java`: Rewritten with comprehensive assertions covering both true and false returns for every method
