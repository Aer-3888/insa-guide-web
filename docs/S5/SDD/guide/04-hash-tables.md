---
title: "Tables de Hachage"
sidebar_position: 4
---

# Tables de Hachage

## Theorie

Une **table de hachage** associe des cles a des valeurs en utilisant une **fonction de hachage** qui calcule un index dans un tableau de seaux.

```
  Cle: "hello"  --->  hashCode("hello") = 42  --->  table[42] = valeur
```

### Fonction de Hachage

Une fonction de hachage `h(cle)` doit satisfaire :
1. **Deterministe** : la meme cle donne toujours le meme hash
2. **Uniforme** : les cles se repartissent uniformement dans la table
3. **Rapide** : calcul en O(1)

### Resolution de Collisions

Quand deux cles ont le meme index de hachage :

#### 1. Chainage -- Utilise dans les TP SDD

Chaque seau stocke une liste chainee des entrees qui ont le meme hash.

```
  Index:
  [0] -> null
  [1] -> ("hello","bonjour") -> ("hi","salut") -> null
  [2] -> null
  [3] -> ("bye","au revoir") -> null
  [4] -> null
```

- Insertion : O(1) (ajout en tete de chaine)
- Recherche : O(k) ou k = longueur de la chaine
- Cas moyen : O(1) si le facteur de charge est faible

#### 2. Adressage ouvert

Si le seau est occupe, sonder pour trouver le prochain emplacement libre.

**Sondage lineaire** : essayer index+1, index+2, ...
**Sondage quadratique** : essayer index+1, index+4, index+9, ...
**Double hachage** : utiliser une seconde fonction de hachage pour le pas

```
  h("hello") = 3, h("world") = 3 (collision !)

  Sondage lineaire :
  [0]      [1]      [2]      [3]       [4]
  vide     vide     vide     "hello"   "world"  <- place a 3+1
```

### Facteur de Charge

**alpha = n / m** ou n = nombre d'entrees, m = taille de la table

| alpha | Performance | Action |
|-------|-------------|--------|
| < 0.5 | Excellente | -- |
| 0.5-0.75 | Bonne | -- |
| 0.75-1.0 | Degradee | Envisager le redimensionnement |
| > 1.0 | Mauvaise (chainage uniquement) | Redimensionnement necessaire |

### Rehachage

Quand le facteur de charge depasse le seuil :
1. Creer une nouvelle table de taille plus grande (typiquement 2x)
2. Recalculer le hash de chaque entree existante
3. Inserer dans la nouvelle table

Cout amorti de n insertions avec doublement : O(n) au total, O(1) amorti par insertion.


## Implementation Java (des TP4-5)

### Fonction de Hachage Personnalisee (classe Word, TP5)

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
        if (o == null) return false;
        if (o.getClass() != this.getClass()) return false;
        Word wo = (Word) o;
        return wo.word.equals(this.word);
    }

    @Override
    public int hashCode() {
        // Uses first 2 characters for a simple hash
        if (this.word.length() > 2)
            return this.word.charAt(0) * 26 + this.word.charAt(1);
        else
            return this.word.charAt(0) * 26;
    }
}
```

**Contrat important** : Si `a.equals(b)` alors `a.hashCode() == b.hashCode()`.
L'inverse n'est pas requis (deux objets differents peuvent avoir le meme hash -- c'est une collision).

### Table de Hachage avec Chainage (TableCouples, TP5)

```java
public class TableCouples {
    private final List<Couple>[] lists;

    public TableCouples() {
        this.lists = new ArrayList[256 * 26 + 256];  // fixed size
    }

    public boolean ajouter(Word w, Word t) {
        int hashcode = w.hashCode();
        if (this.lists[hashcode] == null)
            this.lists[hashcode] = new ArrayList<>();

        Couple new_couple = new Couple(w, t);
        // Check if key already exists -> update
        for (int idx = 0; idx < this.lists[hashcode].size(); idx++) {
            Word old = this.lists[hashcode].get(idx).compCoupleMot(w);
            if (old != null) {
                this.lists[hashcode].set(idx, new_couple);
                return !old.equals(t);  // true if translation changed
            }
        }
        return this.lists[hashcode].add(new_couple);
    }

    public Word traduire(Word w) {
        int hashcode = w.hashCode();
        if (this.lists[hashcode] == null) return null;
        for (Couple c : this.lists[hashcode]) {
            Word answer = c.compCoupleMot(w);
            if (answer != null) return answer;
        }
        return null;
    }
}
```

### Utilisation de java.util.HashMap (TP4 -- Emploi du Temps)

```java
public class TimeTable {
    // teacher -> (schedule -> courseName)
    private final Map<String, Map<Schedule, String>> data;

    public TimeTable(List<String> teachers) {
        this.data = new HashMap<>();
        for (String teacher : teachers)
            this.data.put(teacher, new HashMap<>());
    }

    public boolean addCourse(String teacher, DayOfWeek dow,
                             int startHour, String courseName) {
        // putIfAbsent returns null if key was absent (success)
        return this.data.get(teacher)
            .putIfAbsent(new Schedule(dow, startHour), courseName) == null;
    }
}
```

### Contrat equals/hashCode correct (Schedule, TP4)

```java
public class Schedule {
    private final DayOfWeek dow;
    private final int start_hour;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        if (this.getClass() != o.getClass()) return false;
        Schedule sch = (Schedule) o;
        return this.dow.equals(sch.dow) && this.start_hour == sch.start_hour;
    }

    @Override
    public int hashCode() {
        return this.dow.hashCode() * 31 + this.start_hour;
    }
}
```

**Regle pratique pour hashCode** : multiplier par un nombre premier (31 est standard en Java), combiner les champs.


## Visualisation ASCII : Chainage

```
TableCouples avec les mots "ab", "ac", "ba", "bb" :

h("ab") = 'a'*26 + 'b' = 97*26 + 98 = 2620
h("ac") = 'a'*26 + 'c' = 97*26 + 99 = 2621
h("ba") = 'b'*26 + 'a' = 98*26 + 97 = 2645
h("bb") = 'b'*26 + 'b' = 98*26 + 98 = 2646

Table :
  [2620] -> [("ab", trad_ab)]
  [2621] -> [("ac", trad_ac)]
  ...
  [2645] -> [("ba", trad_ba)]
  [2646] -> [("bb", trad_bb)]

Pas de collisions ! Bonne fonction de hachage.

Supposons maintenant h("xy") = h("xz") = meme_index (collision) :
  [meme_index] -> [("xy", trad_xy)] -> [("xz", trad_xz)]
```


## Complexite

| Operation | Cas moyen | Pire cas | Notes |
|-----------|-----------|----------|-------|
| Insertion (chainage) | O(1) | O(n) | Pire : toutes les cles collisionnent |
| Recherche (chainage) | O(1) | O(n) | La moyenne depend de alpha |
| Suppression (chainage) | O(1) | O(n) | Identique a la recherche |
| Insertion (adr. ouvert) | O(1) | O(n) | Se degrade quand alpha -> 1 |
| Rehachage | O(n) | O(n) | Doit reinserer toutes les entrees |

### Analyse Amortie avec Rehachage

Si on double la table quand alpha > seuil :
- n insertions coutent O(n) au total (serie geometrique : n + n/2 + n/4 + ...)
- Cout amorti par insertion : O(1)


## Schemas Classiques d'Examen

1. **Implementer hashCode** pour une classe donnee
2. **Tracer une insertion** dans une table de hachage (montrer le chainage ou le sondage)
3. **Calculer le facteur de charge** et decider s'il faut rehacher
4. **Comparer** table de hachage vs. ABR pour un cas d'utilisation donne


## AIDE-MEMOIRE

```
TABLE DE HACHAGE
================
h(cle) -> index dans un tableau de seaux

CHAINAGE :                     ADRESSAGE OUVERT :
  seau[i] = liste chainee       seau[i] = entree unique
  alpha peut etre > 1           alpha doit etre < 1
  pas de regroupement           problemes de regroupement

FACTEUR DE CHARGE : alpha = n/m     (n entrees, m seaux)
  alpha < 0.75 -> bon            alpha -> 1 -> mauvais

REHACHAGE : nouvelle table 2x plus grande, reinserer toutes les entrees

CONTRAT equals/hashCode :
  a.equals(b) => a.hashCode() == b.hashCode()
  a.hashCode() == b.hashCode() N'IMPLIQUE PAS a.equals(b)

JAVA :
  HashMap<K,V>  -- non ordonnee, O(1) en moyenne
  TreeMap<K,V>  -- triee par cle, O(log n)
  HashSet<T>    -- ensemble non ordonne, O(1) en moyenne
  TreeSet<T>    -- ensemble trie, O(log n)
```
