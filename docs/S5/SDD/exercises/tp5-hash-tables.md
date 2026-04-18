---
title: "TP5 - Tables de Hachage et Dictionnaire Bilingue"
sidebar_position: 5
---

# TP5 - Tables de Hachage et Dictionnaire Bilingue

> D'apres les consignes de l'enseignant : `S5/SDD/data/moodle/tp/tp5_hash_tables/README.md`

## Objectif

Implementer un dictionnaire bilingue utilisant une table de hachage avec chainage separe. Concevoir une fonction de hachage personnalisee pour des objets `Word`.

## Fichiers

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/Word.java` | Mot du dictionnaire avec hashCode personnalise | **A ecrire** |
| `src/main/Couple.java` | Paire de traduction (source, traduction) | **A ecrire** |
| `src/main/TableCouples.java` | Dictionnaire avec table de hachage | **A ecrire** |
| `test/test/WordTest.java` | Tests pour Word | Fourni |
| `test/test/CoupleTest.java` | Tests pour Couple | Fourni |
| `test/test/TableCouplesTest.java` | Tests pour TableCouples | Fourni |

---

## Exercice 1

### Implementer la classe Word

Creer une classe mot qui stocke le texte en minuscules, supporte l'egalite insensible a la casse, et possede une fonction de hachage basee sur les deux premiers caracteres.

**Reponse :**

```java
package main;

public class Word {
    private final String word;

    public Word(String s) {
        if (s == null || s.equals(""))
            throw new IllegalArgumentException("Word with null or empty string");
        this.word = s.toLowerCase();
    }

    @Override
    public String toString() {
        return this.word;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null) return false;
        if (o.getClass() != this.getClass()) return false;
        Word wo = (Word) o;
        return wo.word.equals(this.word);
    }

    @Override
    public int hashCode() {
        if (this.word.length() > 2)
            return this.word.charAt(0) * 26 + this.word.charAt(1);
        else
            return this.word.charAt(0) * 26;
    }
}
```

**Fonctionnement du code :**
- Le constructeur convertit en minuscules pour que `"Mustard"` et `"mustard"` soient egaux.
- La fonction de hachage utilise `premier_char * 26 + deuxieme_char`. Cela mappe chaque prefixe de deux lettres a un bucket unique. La taille de la table est `256 * 26 + 256 = 6912`, couvrant toutes les combinaisons possibles de deux caracteres ASCII etendus.
- Piege classique : oublier de mettre en minuscules dans le constructeur. Sans cela, `"Cat"` et `"cat"` auraient des hash codes differents.

Tests attendus :
- `equalsWorksOnLowerAndUpperCase` -- PASS (`new Word("mustard")` equals `new Word("MuStArD")`)
- `hashCodeOnLong` -- PASS (`'m' * 26 + 'u'`)
- `hashCodeSimpleChar` -- PASS (`'m' * 26`)

---

## Exercice 2

### Implementer la classe Couple

Creer une paire liant un mot source a sa traduction, avec une methode de recherche.

**Reponse :**

```java
package main;

public class Couple {
    private final Word mot;
    private final Word traduction;

    public Couple(Word m1, Word m2) {
        if (m1 == null || m2 == null)
            throw new IllegalArgumentException("One or both given words are null");
        this.mot = m1;
        this.traduction = m2;
    }

    public String toString() {
        return "(\"" + this.mot + "\", \"" + this.traduction + "\")";
    }

    public Word compCoupleMot(Word m) {
        if (m == null) return null;
        if (m.equals(this.mot)) return this.traduction;
        return null;
    }
}
```

**Fonctionnement du code :**
- `compCoupleMot(Word m)` : si le mot donne correspond au mot source (`mot`), retourne la traduction. Sinon retourne `null`.
- C'est une recherche unidirectionnelle -- l'implementation ne supporte pas la traduction inverse (francais vers anglais).

---

## Exercice 3

### Implementer TableCouples -- la table de hachage avec chainage separe

Construire une table de hachage utilisant un tableau de `ArrayList<Couple>`. Supporter l'ajout de traductions (avec mise a jour) et la recherche.

**Reponse :**

```java
package main;

import java.util.ArrayList;
import java.util.List;

public class TableCouples {
    private final List<Couple>[] lists;

    public TableCouples() {
        this.lists = new ArrayList[256 * 26 + 256];
    }

    public String toString() {
        StringBuilder res = new StringBuilder();
        for (List<Couple> lst : this.lists) {
            if (lst == null) continue;
            for (Couple cp : lst) {
                res.append(cp);
                res.append("\n");
            }
        }
        if (res.length() != 0)
            return res.substring(0, res.length() - 1);
        else
            return "<Empty>";
    }

    public boolean ajouter(Word w, Word t) {
        if (w == null || t == null)
            throw new IllegalArgumentException(
                "One or both of the words are null");

        int hashcode = w.hashCode();

        // Initialiser la chaine si necessaire
        if (this.lists[hashcode] == null)
            this.lists[hashcode] = new ArrayList<>();

        Couple new_couple = new Couple(w, t);

        // Verifier si le mot existe deja dans cette chaine -- mettre a jour
        for (int idx = 0; idx < this.lists[hashcode].size(); idx++) {
            Word old_translation =
                this.lists[hashcode].get(idx).compCoupleMot(w);
            if (old_translation != null) {
                // Remplacer le couple
                this.lists[hashcode].set(idx, new_couple);
                // Retourner true si la traduction a reellement change
                return !old_translation.equals(t);
            }
        }

        // Mot non trouve dans la chaine -- ajouter une nouvelle entree
        return this.lists[hashcode].add(new_couple);
    }

    public Word traduire(Word w) {
        Word answer = null;
        for (List<Couple> lst : this.lists) {
            if (lst == null) continue;
            for (Couple attempt : lst) {
                answer = attempt.compCoupleMot(w);
                if (answer != null) return answer;
            }
        }
        return answer;
    }
}
```

**Fonctionnement du code :**

La methode `ajouter` a une valeur de retour nuancee :
- Si le mot n'existait **pas** : l'ajoute et retourne `true` (de `ArrayList.add`)
- Si le mot existait avec la **meme** traduction : le remplace et retourne `false` (pas de changement)
- Si le mot existait avec une traduction **differente** : le remplace et retourne `true` (changement effectue)

Tests attendus :
- `singleAddOK` -- PASS
- `addAlreadyExistingIsFalse` -- PASS (meme traduction, retourne false)
- `addWithUpdate` -- PASS (traduction differente remplace l'ancienne)
- `addCollision` -- PASS ("Californie" et "Calorimetre" partagent le prefixe hash "ca")

---

## Exercice 4

### Comprendre le probleme de performance de traduire()

L'implementation actuelle de `traduire()` parcourt TOUTES les chaines au lieu d'utiliser le hash :

```java
// ACTUEL (O(n) -- parcourt tout) :
for (List<Couple> lst : this.lists) { ... }

// OPTIMAL (O(1) en moyenne -- utilise le hash) :
int hashcode = w.hashCode();
List<Couple> chain = this.lists[hashcode];
if (chain == null) return null;
for (Couple c : chain) { ... }
```

**Reponse :**

La version optimisee de `traduire()` irait directement a `lists[w.hashCode()]` au lieu de scanner toute la table.

```java
public Word traduire(Word w) {
    int hashcode = w.hashCode();
    List<Couple> chain = this.lists[hashcode];
    if (chain == null) return null;
    for (Couple attempt : chain) {
        Word answer = attempt.compCoupleMot(w);
        if (answer != null) return answer;
    }
    return null;
}
```

**Fonctionnement du code :**
La version de l'etudiant fonctionne mais annule l'interet du hachage en faisant un scan lineaire O(n). La version optimisee va directement au bon bucket en O(1) en moyenne.

---

## Complexite

| Operation | Moyenne | Pire cas |
|-----------|---------|----------|
| `ajouter` | O(1) | O(k) ou k = longueur de chaine |
| `traduire` (optimise) | O(1) | O(k) |
| `traduire` (version etudiant) | O(n) | O(n) |

Avec une bonne fonction de hash et un facteur de charge < 0.7, les chaines sont courtes et la performance approche O(1).

## Erreurs courantes

1. **Ne pas mettre en minuscules dans le constructeur de Word** -- `"Cat"` et `"cat"` auraient des hash differents.
2. **Oublier d'initialiser la chaine** -- `lists[hashcode]` commence a `null`. Il faut creer une `ArrayList` avant d'y ajouter.
3. **Scanner toutes les chaines dans traduire()** -- Fonctionne mais O(n). L'approche optimisee utilise directement `lists[w.hashCode()]`.
4. **Ne pas gerer le cas de mise a jour dans ajouter()** -- Si un mot existe deja, le Couple doit etre *remplace*, pas duplique.
5. **Confusion sur les collisions** -- "Californie" et "Calorimetre" hashent tous deux a `'c' * 26 + 'a'`. Ils coexistent dans la meme chaine et sont distingues par `equals()`.
