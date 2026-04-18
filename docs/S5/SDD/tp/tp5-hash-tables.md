---
title: "TP05 - Tables de Hachage et Dictionnaire"
sidebar_position: 5
---

# TP05 - Tables de Hachage et Dictionnaire

## Objectif

Implementer un **dictionnaire bilingue** en utilisant des tables de hachage pour atteindre un temps de recherche O(1) en moyenne.

## Modele du domaine

### `Word` - Mot du dictionnaire

```java
public class Word {
    private final String word;
    
    public Word(String s) {
        if (s == null || s.equals(""))
            throw new IllegalArgumentException();
        this.word = s.toLowerCase();
    }
    
    @Override
    public boolean equals(Object o) {
        if (o == null || o.getClass() != this.getClass()) return false;
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

### `Couple` - Paire de traduction

```java
public class Couple {
    private final Word mot;
    private final Word traduction;
    
    public Couple(Word m1, Word m2) {
        this.mot = m1;
        this.traduction = m2;
    }
    
    public Word compCoupleMot(Word w) {
        if (w.equals(this.mot)) return this.traduction;
        return null;
    }
}
```

### `TableCouples` - Dictionnaire

```java
public class TableCouples {
    private final List<Couple>[] lists;
    
    public TableCouples() {
        this.lists = new ArrayList[256 * 26 + 256];
    }
    
    public boolean ajouter(Word w, Word t) { ... }
    public Word traduire(Word w) { ... }
}
```

## Conception de la fonction de hachage

### Objectifs d'une bonne fonction de hachage

1. **Distribution uniforme** : Repartir les cles uniformement dans la table
2. **Deterministe** : La meme entree donne toujours le meme hash
3. **Rapide a calculer** : O(1) en temps
4. **Minimiser les collisions** : Des entrees differentes collisionnent rarement

### Implementation pour `Word`

La fonction de hachage utilise `premier_char * 26 + deuxieme_char`. Cela mappe chaque prefixe de deux lettres a un bucket unique. La taille de la table est `256 * 26 + 256 = 6912`, couvrant toutes les combinaisons possibles de deux caracteres.

## Implementation

### Ajouter une traduction

```java
public boolean ajouter(Word w, Word t) {
    int hashcode = w.hashCode();
    
    if (this.lists[hashcode] == null)
        this.lists[hashcode] = new ArrayList<>();
    
    Couple new_couple = new Couple(w, t);
    
    // Verifier si le mot existe deja -- mettre a jour
    for (int idx = 0; idx < this.lists[hashcode].size(); idx++) {
        Word old = this.lists[hashcode].get(idx).compCoupleMot(w);
        if (old != null) {
            this.lists[hashcode].set(idx, new_couple);
            return !old.equals(t);
        }
    }
    
    return this.lists[hashcode].add(new_couple);
}
```

**Complexite :** Calcul du hash O(1), recherche dans la chaine O(k) ou k = longueur de la chaine. **Moyenne** : O(1) avec une bonne fonction de hachage.

### Traduire un mot

```java
// Version NAIVE (O(n) -- parcourt tout) :
public Word traduire(Word w) {
    for (List<Couple> lst : this.lists) {
        if (lst == null) continue;
        for (Couple attempt : lst) {
            Word answer = attempt.compCoupleMot(w);
            if (answer != null) return answer;
        }
    }
    return null;
}

// Version OPTIMISEE (O(1) en moyenne) :
public Word traduire(Word w) {
    int hashcode = w.hashCode();
    List<Couple> chain = this.lists[hashcode];
    if (chain == null) return null;
    for (Couple c : chain) {
        Word translation = c.compCoupleMot(w);
        if (translation != null) return translation;
    }
    return null;
}
```

**Probleme** : La version naive recherche dans TOUTES les chaines, pas seulement la bonne.

## Gestion des collisions : Chainage

Quand plusieurs cles hashent au meme index, les stocker dans une **liste chainee** :

```
Index :  Valeur :
[0]  -> null
[1]  -> [("hello","bonjour")] -> [("hi","salut")] -> null
[2]  -> null
[3]  -> [("bye","au revoir")] -> null
```

### Facteur de charge

**Facteur de charge alpha = n / m** ou :
- n = nombre d'entrees
- m = taille de la table

- alpha < 0.7 : Bonne performance
- alpha > 0.9 : Beaucoup de collisions, envisager le redimensionnement

### Redimensionnement dynamique

Quand le facteur de charge depasse le seuil, creer une table 2x plus grande et rehacher toutes les entrees.

## Analyse de performance

### Complexite temporelle

| Operation | Moyenne | Pire cas | Notes |
|-----------|---------|----------|-------|
| Ajouter | O(1) | O(n) | Pire : toutes les cles collisionnent |
| Traduire | O(1) | O(n) | Pire : longue chaine |
| Mettre a jour | O(1) | O(n) | Identique a ajouter |

### Comparaison avec d'autres structures

| Structure | Recherche | Insertion | Suppression | Ordonnee ? |
|-----------|--------|--------|--------|----------|
| Tableau (non trie) | O(n) | O(1) | O(n) | Non |
| Tableau (trie) | O(log n) | O(n) | O(n) | Oui |
| Liste chainee | O(n) | O(1) | O(n) | Non |
| **Table de hachage** | **O(1)** | **O(1)** | **O(1)** | **Non** |
| ABR | O(log n) | O(log n) | O(log n) | Oui |

Les tables de hachage gagnent pour la **recherche rapide**, mais ne maintiennent pas d'ordre.

## Pieges courants

1. **Mauvaise fonction de hachage** : Cause de nombreuses collisions
2. **Oublier de redefinir `equals()`** : La table de hachage a besoin des deux
3. **Ne pas gerer null** : Cause des `NullPointerException`
4. **Chercher dans toutes les chaines** : Annule l'interet du hachage

## Voir aussi

- **TP04** : Tables de hachage pour la planification
- [Java HashMap](https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html)
