---
title: "TP CPOO1 - UML vers Java : Associations et Composition (Velo/Guidon/Roue)"
sidebar_position: 1
---

# TP CPOO1 - UML vers Java : Associations et Composition (Velo/Guidon/Roue)

> D'apres les instructions de l'enseignant dans : `S5/CPOO/data/moodle/tp/tp1/README.md`

Ce TP couvre la traduction de diagrammes de classes UML en code Java. Il progresse des associations unidirectionnelles simples a l'integrite referentielle bidirectionnelle, puis a la composition avec des relations un-vers-plusieurs.

---

## Q.1 - Association simple (0..1)

### Creer une association unidirectionnelle simple entre `Velo` et `Guidon`. Un `Velo` peut avoir 0 ou 1 `Guidon`. Un `Guidon` peut etre associe a 0 ou 1 `Velo`. Les deux classes ont des getters et setters.

**Reponse :**

Une multiplicite 0..1 en UML signifie que la reference est optionnelle (peut etre null). En Java, cela se traduit par un champ nullable. `Velo` et `Guidon` detiennent chacun une reference vers l'autre, mais il n'y a pas de synchronisation automatique -- modifier un cote ne met pas a jour l'autre.

**Diagramme UML :**

```
+-----------------+         guidon     +-----------------+
|      Velo       | -----------------> |     Guidon      |
+-----------------+       0..1         +-----------------+
| - guidon: Guidon|                    | - velo: Velo    |
+-----------------+                    +-----------------+
| + getGuidon()   |       velo         | + getVelo()     |
| + setGuidon()   | <----------------- | + setVelo()     |
+-----------------+       0..1         +-----------------+
```

**Velo.java :**

```java
package q1;

public class Velo {
    private Guidon guidon = null;

    public Guidon getGuidon() {
        return this.guidon;
    }

    public void setGuidon(Guidon gd) {
        this.guidon = gd;
    }
}
```

**Guidon.java :**

```java
package q1;

public class Guidon {
    private Velo velo = null;

    public Velo getVelo() {
        return this.velo;
    }

    public void setVelo(Velo vl) {
        this.velo = vl;
    }
}
```

**Tests :**

```java
package q1;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloTest {

    @Test
    void testInitialGuidonIsNull() {
        Velo v = new Velo();
        assertNull(v.getGuidon());
    }

    @Test
    void testSetAndGetGuidon() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        assertSame(g, v.getGuidon());
    }

    @Test
    void testSetGuidonToNull() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        v.setGuidon(null);
        assertNull(v.getGuidon());
    }
}

class GuidonTest {

    @Test
    void testInitialVeloIsNull() {
        Guidon g = new Guidon();
        assertNull(g.getVelo());
    }

    @Test
    void testSetAndGetVelo() {
        Guidon g = new Guidon();
        Velo v = new Velo();
        g.setVelo(v);
        assertSame(v, g.getVelo());
    }
}
```

**Le probleme de Q.1 :** Il n'y a pas de synchronisation automatique entre les deux cotes. Apres `v.setGuidon(g)`, appeler `g.getVelo()` retourne toujours null. Le programmeur doit mettre a jour manuellement les deux cotes, ce qui est source d'erreurs. Cela motive Q.2.

**Fichiers modifies :**
- `q1/Velo.java` : Cree avec un champ `Guidon`, getter et setter
- `q1/Guidon.java` : Cree avec un champ `Velo`, getter et setter

---

## Q.2 - Association bidirectionnelle avec integrite referentielle

### Assurer l'integrite referentielle lors de l'ajout d'un `Guidon` a un `Velo`. Quand `velo.setGuidon(guidon)` est appele, `guidon.setVelo(velo)` devrait etre appele automatiquement.

**Reponse :**

L'integrite referentielle signifie que les deux cotes d'une association bidirectionnelle sont toujours coherents. La solution consiste a designer une classe comme "maitre" (Velo) qui gere la relation. L'autre classe (Guidon) a un setter simple. Le defi principal est d'eviter la recursion infinie : si `setGuidon` appelle `setVelo` et `setVelo` appelle `setGuidon`, on obtient un debordement de pile. La clause de garde `if (gd != this.guidon)` empeche cela.

**Diagramme UML :**

```
+-----------------+        guidon      +-----------------+
|      Velo       | =================> |     Guidon      |
+-----------------+       0..1         +-----------------+
| - guidon: Guidon|   integrite        | - velo: Velo    |
+-----------------+   referentielle    +-----------------+
| + getGuidon()   |                    | + getVelo()     |
| + setGuidon()   | <================= | + setVelo()     |
+-----------------+       0..1         +-----------------+
```

**Velo.java** (cote maitre -- gere la relation) :

```java
package q2;

public class Velo {
    private Guidon guidon = null;

    public Guidon getGuidon() {
        return this.guidon;
    }

    public void setGuidon(Guidon gd) {
        // Garde : si meme objet, ne rien faire (empeche la recursion infinie)
        if (gd != this.guidon) {
            Guidon oldGuidon = this.guidon;

            // Si on retire le guidon, notifier l'ancien
            if (gd == null && oldGuidon != null) {
                oldGuidon.setVelo(null);
            }

            // Definir le nouveau guidon
            this.guidon = gd;

            // Etablir la reference retour sur le nouveau guidon
            if (gd != null) {
                gd.setVelo(this);
            }
        }
    }
}
```

**Guidon.java** (cote passif -- setter simple) :

```java
package q2;

public class Guidon {
    private Velo velo = null;

    public Velo getVelo() {
        return this.velo;
    }

    // Setter simple. Le cote Velo gere l'integrite referentielle.
    // Cette methode N'appelle PAS Velo.setGuidon() pour eviter la recursion infinie.
    public void setVelo(Velo vl) {
        this.velo = vl;
    }
}
```

**Comment la recursion infinie est empechee :**

```
v.setGuidon(g)
  |-- gd != this.guidon? OUI (guidon etait null, gd est g)
  |-- this.guidon = g
  |-- g.setVelo(v)              // Guidon.setVelo est un setter simple
  |     |-- this.velo = v       // Termine. Pas de rappel.
  |-- Termine.
```

Si `Guidon.setVelo` rappelait `v.setGuidon(g)`, la garde `gd != this.guidon` s'evaluerait a FAUX (car `this.guidon` est deja `g`), et la methode retournerait immediatement.

**Tests :**

```java
package q2;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloGuidonTest {

    @Test
    void testReferentialIntegrityOnSet() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        assertSame(g, v.getGuidon());
        assertSame(v, g.getVelo());     // reference retour automatique
    }

    @Test
    void testReplaceGuidonUpdatesOldAndNew() {
        Velo v = new Velo();
        Guidon g1 = new Guidon();
        Guidon g2 = new Guidon();
        v.setGuidon(g1);
        v.setGuidon(g2);
        assertSame(g2, v.getGuidon());
        assertSame(v, g2.getVelo());    // nouveau guidon lie
    }

    @Test
    void testRemoveGuidonCleansUp() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        v.setGuidon(null);
        assertNull(v.getGuidon());
        assertNull(g.getVelo());        // ancienne reference retour nettoyee
    }

    @Test
    void testSetSameGuidonTwice() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        v.setGuidon(g);                 // pas de changement
        assertSame(g, v.getGuidon());
        assertSame(v, g.getVelo());
    }

    @Test
    void testInitialStateIsNull() {
        Velo v = new Velo();
        assertNull(v.getGuidon());
    }
}
```

**Fichiers modifies :**
- `q2/Velo.java` : Copie de q1, `setGuidon()` modifie pour maintenir l'integrite referentielle avec clause de garde et mise a jour de la reference retour
- `q2/Guidon.java` : Copie de q1, inchange (cote passif)

---

## Q.3 - Suppression de l'acces bidirectionnel

### Empecher `Guidon` d'acceder a son `Velo` parent. L'association est strictement unidirectionnelle avec multiplicite 1 (un Velo DOIT avoir un Guidon).

**Reponse :**

Quand la navigation n'est necessaire que dans un sens, la conception est plus simple. Le `Guidon` devient un composant pur sans connaissance de son proprietaire. La multiplicite passe de 0..1 a 1, ce qui signifie que null est rejete.

**Diagramme UML :**

```
+-----------------+        guidon      +-----------------+
|      Velo       | -----------------> |     Guidon      |
+-----------------+          1         +-----------------+
| - guidon: Guidon|                    |                 |
+-----------------+                    +-----------------+
| + Velo()        |   PAS de reference retour.
| + Velo(Guidon)  |   La multiplicite est 1 (pas 0..1).
| + getGuidon()   |
| + setGuidon()   |
+-----------------+
```

**Velo.java :**

```java
package q3;

public class Velo {
    private Guidon guidon;

    public Velo() {
        // guidon est null par defaut
    }

    // Constructeur imposant la contrainte de multiplicite 1
    public Velo(Guidon gd) {
        if (gd == null) {
            throw new IllegalArgumentException("Guidon cannot be null");
        }
        this.guidon = gd;
    }

    public Guidon getGuidon() {
        return this.guidon;
    }

    // Rejette null pour imposer la multiplicite 1. Si null est passe, pas d'effet.
    public void setGuidon(Guidon gd) {
        if (gd != null) {
            this.guidon = gd;
        }
    }
}
```

**Guidon.java :**

```java
package q3;

// Guidon simple sans reference vers un velo.
public class Guidon {
    public Guidon() {
        // Constructeur vide
    }
}
```

**Tests :**

```java
package q3;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloTest {

    @Test
    void testConstructorWithValidGuidon() {
        Guidon g = new Guidon();
        Velo v = new Velo(g);
        assertSame(g, v.getGuidon());
    }

    @Test
    void testConstructorWithNullThrows() {
        assertThrows(IllegalArgumentException.class, () -> new Velo(null));
    }

    @Test
    void testDefaultConstructorHasNullGuidon() {
        Velo v = new Velo();
        assertNull(v.getGuidon());
    }

    @Test
    void testSetGuidonWithValidGuidon() {
        Velo v = new Velo();
        Guidon g = new Guidon();
        v.setGuidon(g);
        assertSame(g, v.getGuidon());
    }

    @Test
    void testSetGuidonWithNullDoesNothing() {
        Guidon g = new Guidon();
        Velo v = new Velo(g);
        v.setGuidon(null);
        assertSame(g, v.getGuidon()); // inchange
    }

    @Test
    void testReplaceGuidon() {
        Guidon g1 = new Guidon();
        Guidon g2 = new Guidon();
        Velo v = new Velo(g1);
        v.setGuidon(g2);
        assertSame(g2, v.getGuidon());
    }
}
```

**Fichiers modifies :**
- `q3/Velo.java` : Copie de q2, logique d'integrite referentielle retiree, constructeur avec validation de null ajoute, setGuidon rejette null
- `q3/Guidon.java` : Champ `velo`, `getVelo()` et `setVelo()` supprimes entierement

---

## Q.4 - Association un-vers-plusieurs (0..*)

### Implementer une association un-vers-plusieurs ou un `Velo` a plusieurs `Roue` (roues). L'association est unidirectionnelle.

**Reponse :**

Une multiplicite 0..* signifie "zero ou plusieurs", ce qui se traduit par une `List<Roue>` en Java. La collection doit etre initialisee dans le constructeur (sinon `NullPointerException`). Les roues null et les doublons sont rejetes.

**Diagramme UML :**

```
+---------------------+       roues      +-------------+
|       Velo          | ---------------> |    Roue     |
+---------------------+      0..*        +-------------+
| - roues: List<Roue> |                  |             |
+---------------------+                  +-------------+
| + Velo()            |                  | + Roue()    |
| + getRoues()        |                  +-------------+
| + addRoue(Roue)     |
| + removeRoues(Roue) |
+---------------------+
```

**Velo.java :**

```java
package q4;

import java.util.ArrayList;
import java.util.List;

public class Velo {
    private List<Roue> roues;

    public Velo() {
        this.roues = new ArrayList<>();
    }

    public List<Roue> getRoues() {
        return this.roues;
    }

    // Ajoute une roue. Rejette null et les doublons.
    public Boolean addRoue(Roue r) {
        if (r == null || this.roues.contains(r)) {
            return false;
        }
        return this.roues.add(r);
    }

    // Retire une roue de ce velo.
    public Boolean removeRoues(Roue r) {
        return this.roues.remove(r);
    }
}
```

**Roue.java :**

```java
package q4;

// Roue simple sans connaissance du velo auquel elle appartient.
public class Roue {
    public Roue() {
        // Constructeur vide
    }
}
```

**Tests :**

```java
package q4;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class VeloRoueTest {
    private Velo velo;

    @BeforeEach
    void setUp() {
        velo = new Velo();
    }

    @Test
    void testInitiallyNoWheels() {
        assertTrue(velo.getRoues().isEmpty());
    }

    @Test
    void testAddOneWheel() {
        Roue r = new Roue();
        assertTrue(velo.addRoue(r));
        assertEquals(1, velo.getRoues().size());
        assertSame(r, velo.getRoues().get(0));
    }

    @Test
    void testAddMultipleWheels() {
        Roue r1 = new Roue();
        Roue r2 = new Roue();
        assertTrue(velo.addRoue(r1));
        assertTrue(velo.addRoue(r2));
        assertEquals(2, velo.getRoues().size());
    }

    @Test
    void testAddNullRejected() {
        assertFalse(velo.addRoue(null));
        assertEquals(0, velo.getRoues().size());
    }

    @Test
    void testAddDuplicateRejected() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertFalse(velo.addRoue(r));
        assertEquals(1, velo.getRoues().size());
    }

    @Test
    void testRemoveWheel() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertTrue(velo.removeRoues(r));
        assertEquals(0, velo.getRoues().size());
    }

    @Test
    void testRemoveNonexistentWheel() {
        Roue r = new Roue();
        assertFalse(velo.removeRoues(r));
    }
}
```

**Fichiers modifies :**
- `q4/Velo.java` : Cree avec un champ `List<Roue>`, `addRoue()` avec gardes null/doublon, `removeRoues()`
- `q4/Roue.java` : Cree comme classe vide simple

---

## Q.5 - Composition avec navigation bidirectionnelle

### Implementer la composition ou `Roue` appartient a exactement un `Velo`, et `Velo` peut acceder a ses roues. Respecter l'integrite referentielle du role `roues` dans la composition.

**Reponse :**

La composition est une forme forte d'association ou la "partie" (Roue) appartient a exactement un "tout" (Velo) a la fois. Ajouter une Roue a un Velo definit automatiquement `roue.getVelo()`. Retirer une Roue la remet a null. Deplacer une Roue d'un Velo a un autre la retire du premier. La prevention de la recursion infinie est plus complexe ici car `addRoue` et `setVelo` s'appellent mutuellement.

**Diagramme UML :**

```
+---------------------+       roues      +------------------+
|       Velo          |<>=============>  |      Roue        |
+---------------------+      0..*        +------------------+
| - roues: List<Roue> |                  | - velo: Velo     |
+---------------------+      velo        +------------------+
| + Velo()            | <=============== | + getVelo()      |
| + getRoues()        |      0..1        | + setVelo(Velo)  |
| + addRoue(Roue)     |                  +------------------+
| + removeRoues(Roue) |
+---------------------+
```

**Velo.java :**

```java
package q5;

import java.util.ArrayList;
import java.util.List;

public class Velo {
    private List<Roue> roues;

    public Velo() {
        this.roues = new ArrayList<>();
    }

    public List<Roue> getRoues() {
        return this.roues;
    }

    // Ajoute une roue avec integrite referentielle.
    // 1. Rejeter null et les doublons
    // 2. Ajouter a la collection
    // 3. Si la roue ne nous reference pas deja, la definir (empeche la recursion)
    public Boolean addRoue(Roue r) {
        if (r == null || this.roues.contains(r)) {
            return false;
        }

        this.roues.add(r);

        // Etablir la reference retour (la garde empeche la recursion)
        if (r.getVelo() != this) {
            r.setVelo(this);
        }

        return true;
    }

    // Retire une roue avec integrite referentielle.
    // 1. Rejeter null
    // 2. Si la roue est dans la collection, nettoyer sa reference retour, puis retirer
    public Boolean removeRoues(Roue r) {
        if (r == null) {
            return false;
        }

        if (this.roues.contains(r)) {
            if (r.getVelo() == this) {
                r.setVelo(null);
            }
            this.roues.remove(r);
            return true;
        }

        return false;
    }
}
```

**Roue.java :**

```java
package q5;

public class Roue {
    private Velo velo = null;

    public Velo getVelo() {
        return this.velo;
    }

    // Definit le velo auquel cette roue appartient avec integrite referentielle.
    // 1. Si deja defini sur ce velo, ne rien faire (garde de recursion)
    // 2. Si actuellement sur un autre velo, retirer de ce velo d'abord
    //    (nettoyer la reference AVANT d'appeler removeRoues pour empecher la recursion)
    // 3. Definir la nouvelle reference vers le velo
    // 4. Si le nouveau velo ne nous contient pas deja, nous ajouter
    public void setVelo(Velo vl) {
        if (this.velo == vl) {
            return;
        }

        // Retirer de l'ancien velo (si existant)
        if (this.velo != null) {
            Velo oldVelo = this.velo;
            this.velo = null;          // nettoyer AVANT d'appeler remove
            oldVelo.removeRoues(this);
        }

        // Definir le nouveau velo
        this.velo = vl;

        // Ajouter a la collection du nouveau velo (si pas deja present)
        if (vl != null && !vl.getRoues().contains(this)) {
            vl.addRoue(this);
        }
    }
}
```

**Comment la recursion infinie est empechee pour un ajout normal :**

```
bike.addRoue(wheel)
  |-- wheel pas null, pas dans la liste --> ajouter a la liste
  |-- wheel.getVelo() != bike --> appeler wheel.setVelo(bike)
  |     |-- this.velo != bike? OUI (etait null)
  |     |-- this.velo est null, donc passer "retirer de l'ancien velo"
  |     |-- this.velo = bike
  |     |-- bike.getRoues().contains(this)? OUI (vient d'etre ajoute)
  |     |-- passer addRoue (deja dans la collection)
  |-- TERMINE
```

**Comment le deplacement d'une roue entre velos fonctionne :**

```
wheel.setVelo(bike2)
  |-- this.velo != bike2? OUI (etait bike1)
  |-- oldVelo = bike1
  |-- this.velo = null          <-- couper le lien AVANT le rappel
  |-- bike1.removeRoues(wheel)
  |     |-- wheel est dans la liste de bike1
  |     |-- wheel.getVelo() == bike1? NON (on l'a mis a null)
  |     |-- passer l'appel setVelo(null)
  |     |-- retirer de la liste
  |-- this.velo = bike2
  |-- bike2 ne contient pas wheel --> bike2.addRoue(wheel)
  |     |-- wheel pas null, pas dans la liste --> ajouter a la liste
  |     |-- wheel.getVelo() == bike2? OUI (vient d'etre defini)
  |     |-- passer l'appel setVelo
  |-- TERMINE
```

**Tests :**

```java
package q5;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CompositionTest {
    private Velo velo;

    @BeforeEach
    void setUp() {
        velo = new Velo();
    }

    @Test
    void testAddRoueSetsBackReference() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertSame(velo, r.getVelo());
    }

    @Test
    void testAddRoueAppearsInList() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertEquals(1, velo.getRoues().size());
        assertSame(r, velo.getRoues().get(0));
    }

    @Test
    void testAddNullRejected() {
        assertFalse(velo.addRoue(null));
    }

    @Test
    void testAddDuplicateRejected() {
        Roue r = new Roue();
        velo.addRoue(r);
        assertFalse(velo.addRoue(r));
        assertEquals(1, velo.getRoues().size());
    }

    @Test
    void testRemoveRoueClearsBackReference() {
        Roue r = new Roue();
        velo.addRoue(r);
        velo.removeRoues(r);
        assertNull(r.getVelo());
    }

    @Test
    void testRemoveRoueRemovesFromList() {
        Roue r = new Roue();
        velo.addRoue(r);
        velo.removeRoues(r);
        assertTrue(velo.getRoues().isEmpty());
    }

    @Test
    void testRemoveNullReturnsFalse() {
        assertFalse(velo.removeRoues(null));
    }

    @Test
    void testRemoveNonexistentReturnsFalse() {
        assertFalse(velo.removeRoues(new Roue()));
    }

    @Test
    void testMoveWheelViaSetVelo() {
        Velo v1 = new Velo();
        Velo v2 = new Velo();
        Roue r = new Roue();

        v1.addRoue(r);
        assertSame(v1, r.getVelo());
        assertEquals(1, v1.getRoues().size());

        r.setVelo(v2);     // deplacer la roue vers v2

        assertFalse(v1.getRoues().contains(r));   // retiree de v1
        assertTrue(v2.getRoues().contains(r));     // ajoutee a v2
        assertSame(v2, r.getVelo());               // reference retour mise a jour
    }

    @Test
    void testDetachWheel() {
        Roue r = new Roue();
        velo.addRoue(r);
        r.setVelo(null);
        assertNull(r.getVelo());
        assertFalse(velo.getRoues().contains(r));
    }

    @Test
    void testSetVeloDirectlyAddsToList() {
        Roue r = new Roue();
        r.setVelo(velo);    // defini depuis le cote Roue
        assertTrue(velo.getRoues().contains(r));
        assertSame(velo, r.getVelo());
    }

    @Test
    void testSetVeloSameBikeNoOp() {
        Roue r = new Roue();
        velo.addRoue(r);
        r.setVelo(velo);    // deja defini
        assertEquals(1, velo.getRoues().size());
        assertSame(velo, r.getVelo());
    }
}
```

**Fichiers modifies :**
- `q5/Velo.java` : Copie de q4, integrite referentielle ajoutee dans `addRoue()` et `removeRoues()` avec gestion de la reference retour
- `q5/Roue.java` : Champ `velo` ajoute avec `getVelo()` et `setVelo()` gerant le deplacement entre velos avec prevention de la recursion par coupure-avant-rappel

---

## Q.6 - Tests avec la suite de tests Moodle

### Executer les tests fournis par Moodle et corriger les eventuels problemes.

**Reponse :**

Cette etape valide l'implementation par rapport a la suite de tests officielle de l'enseignant.

**Etapes :**

1. Telecharger l'archive de tests depuis Moodle
2. L'extraire dans le repertoire `test/java2` de votre projet
3. Dans IntelliJ : clic droit sur le dossier `java2`, selectionner "Mark directory as" puis "Test Sources Root"
4. Executer tous les tests en cliquant droit sur la classe de test, puis "Run"
5. Corriger les tests echoues en corrigeant votre implementation de q1 a q5

**Problemes courants detectes par la suite de tests Moodle :**

- Oublier de verifier null dans `addRoue()`
- Ne pas gerer le cas ou `removeRoues()` est appele avec une roue absente de la liste
- Recursion infinie dans les associations bidirectionnelles due a l'absence de clauses de garde
- Ne pas nettoyer les anciennes references retour lors du remplacement d'un Guidon en Q.2

Si un test echoue, lisez attentivement le message d'assertion. Il indique quelle valeur attendue ne correspond pas a la valeur reelle. Tracez l'execution de votre code avec les entrees du test pour trouver l'ecart.

---

## Tableau recapitulatif

| Question | Classes | Relation | Concept cle |
|----------|---------|----------|-------------|
| Q.1 | Velo, Guidon | 0..1 bidirectionnelle, sans sync | Association simple |
| Q.2 | Velo, Guidon | 0..1 bidirectionnelle, avec integrite | Integrite referentielle, clauses de garde |
| Q.3 | Velo, Guidon | 1 unidirectionnelle | Retrait reference retour, rejet de null |
| Q.4 | Velo, Roue | 0..* unidirectionnelle | Un-vers-plusieurs avec List |
| Q.5 | Velo, Roue | 0..* composition avec integrite | Composition, coupure-avant-rappel |
| Q.6 | Toutes | Toutes | Validation avec les tests Moodle |
