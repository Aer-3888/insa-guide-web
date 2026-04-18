---
title: "TP4 - Emploi du Temps"
sidebar_position: 4
---

# TP4 - Emploi du Temps

> D'apres les consignes de l'enseignant : `S5/SDD/data/moodle/tp/tp4_scheduling/README.md`

## Objectif

Utiliser `java.util.HashMap` pour modeliser un systeme d'emploi du temps universitaire. Pratiquer le contrat `equals()`/`hashCode()` et les operations map-of-maps complexes.

## Fichiers

| Fichier | Role | Statut |
|---------|------|--------|
| `src/main/Schedule.java` | Classe valeur : (DayOfWeek, startHour) | **A ecrire** |
| `src/main/TimeTable.java` | Gestion d'emploi du temps avec maps imbriquees | **A ecrire** |
| `test/test/ScheduleTest.java` | Tests pour Schedule | Fourni |
| `test/test/TimeTableTest.java` | Tests pour TimeTable | Fourni |

---

## Exercice 1

### Implementer la classe Schedule

Creer une classe valeur representant un creneau horaire (jour + heure). Elle doit fonctionner correctement comme cle de HashMap.

**Reponse :**

```java
package main;

import java.time.DayOfWeek;

public class Schedule {
    private final DayOfWeek dow;
    private final int start_hour;

    public Schedule(DayOfWeek dow, int start_hour) {
        this.dow = dow;
        this.start_hour = start_hour;
    }

    public DayOfWeek getDow() { return dow; }
    public int getStart_hour() { return start_hour; }

    @Override
    public String toString() {
        return this.dow + "@" + this.start_hour + "h";
    }

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

**Fonctionnement du code :**
- `equals()` compare jour et heure. Deux Schedule avec le meme jour et la meme heure sont egaux.
- `hashCode()` multiplie par le nombre premier 31 pour repartir les valeurs de hash. La formule combine les deux champs pour que (MONDAY, 8) et (MONDAY, 10) produisent des hash differents.
- Le contrat `equals`/`hashCode` est essentiel : si on redefinit `equals()`, on DOIT redefinir `hashCode()` de maniere coherente pour que HashMap fonctionne.

---

## Exercice 2

### Implementer le constructeur TimeTable et la methode addCourse

Structure : `Map<String, Map<Schedule, String>>` -- la map externe a les noms d'enseignants comme cles. La map interne utilise `Schedule` comme cle et le nom du cours comme valeur.

**Reponse :**

```java
package main;

import java.util.*;
import java.time.DayOfWeek;

public class TimeTable {
    private final Map<String, Map<Schedule, String>> data;

    public TimeTable(List<String> teachers) throws IllegalArgumentException {
        if (teachers == null || teachers.isEmpty())
            throw new IllegalArgumentException();
        this.data = new HashMap<>();
        for (String teacher : teachers)
            this.data.put(teacher, new HashMap<>());
    }

    public boolean addCourse(String teacher, DayOfWeek dow, int start_hour,
                             String courseName) throws IllegalArgumentException {
        if (teacher == null || teacher.equals(""))
            throw new IllegalArgumentException("Invalid empty or null teacher name");
        if (dow == null)
            throw new IllegalArgumentException("Invalid null day of the week");
        if (start_hour % 2 != 0 || start_hour < 0 || start_hour > 22)
            throw new IllegalArgumentException("Invalid start hour");
        if (courseName == null)
            throw new IllegalArgumentException("Invalid null course name");

        if (!this.data.containsKey(teacher))
            this.data.put(teacher, new HashMap<>());

        // putIfAbsent retourne null si le creneau etait libre (insertion reussie)
        return this.data.get(teacher)
                        .putIfAbsent(new Schedule(dow, start_hour), courseName) == null;
    }
```

**Fonctionnement du code :**
- `putIfAbsent` verifie atomiquement si une cle existe et n'insere que si elle est absente. Retourne `null` en cas de succes (creneau libre -> retourne `true`) ou la valeur existante en cas de conflit (retourne `false`).
- Les heures doivent etre paires (blocs de 2h), entre 0 et 22.
- Les enseignants inconnus sont ajoutes automatiquement.

---

## Exercice 3

### Implementer getTimeTable

**Reponse :**

```java
    public Map<Schedule, String> getTimeTable(String teacher)
            throws IllegalArgumentException {
        if (teacher == null || teacher.equals(""))
            throw new IllegalArgumentException("Invalid null teacher");
        return this.data.get(teacher);
    }
```

**Fonctionnement du code :**
Retourne `null` pour un enseignant inconnu, ou la map de creneaux de l'enseignant.

---

## Exercice 4

### Implementer classesAtTenAMOnMonday -- combien d'enseignants ont un cours lundi a 10h ?

**Reponse :**

```java
    public int classesAtTenAMOnMonday() {
        int res = 0;
        for (Map<Schedule, String> sch : this.data.values()) {
            res += sch.containsKey(new Schedule(DayOfWeek.MONDAY, 10)) ? 1 : 0;
        }
        return res;
    }
```

**Fonctionnement du code :**
`containsKey` utilise notre `equals()`/`hashCode()` personnalise sur `Schedule`. La creation d'un `new Schedule(MONDAY, 10)` correspondra a tout Schedule existant avec le meme jour et la meme heure.

---

## Exercice 5

### Implementer classesOnMonday -- nombre total de cours le lundi pour tous les enseignants

**Reponse :**

```java
    public int classesOnMonday() {
        int res = 0;
        for (Map<Schedule, String> sch : this.data.values()) {
            for (Schedule key : sch.keySet()) {
                res += key.getDow() == DayOfWeek.MONDAY ? 1 : 0;
            }
        }
        return res;
    }
```

**Fonctionnement du code :**
On parcourt toutes les maps internes et on compte les Schedule dont le jour est MONDAY. `DayOfWeek` est un enum, donc `==` fonctionne.

---

## Exercice 6

### Implementer earlyBirdTeacher -- l'enseignant avec le plus de cours avant midi

**Reponse :**

```java
    public String earlyBirdTeacher() {
        HashMap<String, Integer> teachers = new HashMap<>();
        for (String teacher : this.data.keySet()) {
            for (Schedule key : this.data.get(teacher).keySet()) {
                if (key.getStart_hour() < 12) {
                    teachers.put(teacher,
                        teachers.getOrDefault(teacher, 0) + 1);
                }
            }
        }
        String tch = "";
        int max_early_class = 0;
        for (Map.Entry<String, Integer> e : teachers.entrySet()) {
            if (e.getValue() > max_early_class) {
                tch = e.getKey();
                max_early_class = e.getValue();
            }
        }
        return tch;
    }
```

**Fonctionnement du code :**
Premiere passe : compter les cours matinaux par enseignant. Deuxieme passe : trouver le maximum. `getOrDefault` evite les NullPointerException pour les enseignants non encore comptes.

---

## Exercice 7

### Implementer versatileTeacher -- l'enseignant qui enseigne le plus de cours distincts

**Reponse :**

```java
    public String versatileTeacher() {
        HashMap<String, Integer> teachers = new HashMap<>();
        for (String teacher : this.data.keySet()) {
            Set<String> classes = new HashSet<>(this.data.get(teacher).values());
            teachers.put(teacher, classes.size());
        }
        String tch = "";
        int max = 0;
        for (Map.Entry<String, Integer> e : teachers.entrySet()) {
            if (e.getValue() > max) {
                tch = e.getKey();
                max = e.getValue();
            }
        }
        return tch;
    }
```

**Fonctionnement du code :**
Convertir les valeurs en `Set` supprime les doublons, donnant le nombre de cours *distincts*. Un enseignant qui fait "SDD" 3 fois par semaine aura `classes.size() == 1`.

---

## Exercice 8

### Implementer buildReverseTable -- inverser la structure de donnees

De `enseignant -> (creneau -> cours)` vers `creneau -> (enseignant -> cours)`.

**Reponse :**

```java
    public Map<Schedule, Map<String, String>> buildReverseTable() {
        Map<Schedule, Map<String, String>> result = new HashMap<>();
        for (String teacher : this.data.keySet()) {
            for (Map.Entry<Schedule, String> entry :
                 this.data.get(teacher).entrySet()) {
                result.putIfAbsent(entry.getKey(), new HashMap<>());
                result.get(entry.getKey()).put(teacher, entry.getValue());
            }
        }
        return result;
    }
```

**Fonctionnement du code :**
La table inversee regroupe tous les enseignants par creneau horaire. Pour chaque couple (enseignant, creneau, cours), on ajoute une entree dans la map associee au creneau.

---

## Exercice 9

### Implementer minimalNumberOfClassRooms -- nombre maximum de cours simultanes

**Reponse :**

```java
    public int minimalNumberOfClassRooms() {
        Map<Schedule, Map<String, String>> res = this.buildReverseTable();
        int maxrooms = 0;
        for (Map<String, String> classes : res.values())
            maxrooms = Math.max(maxrooms, classes.size());
        return maxrooms;
    }
}
```

**Fonctionnement du code :**
La table inversee associe chaque creneau a l'ensemble des enseignants actifs a ce moment. Le plus grand ensemble determine le pic de demande, donc le nombre minimum de salles necessaires.

---

## Erreurs courantes

1. **Ne pas redefinir les deux : equals() et hashCode()** -- Si on ne redefinit que equals(), deux Schedule "egaux" peuvent etre dans des buckets differents, cassant les recherches HashMap.
2. **Utiliser == au lieu de .equals() pour DayOfWeek** -- `DayOfWeek` est un enum, donc `==` fonctionne, mais pour les non-enums il faut `.equals()`.
3. **Oublier putIfAbsent pour la table inversee** -- Sans cela, on ecrase les entrees precedentes pour le meme creneau.
4. **Ne pas valider start_hour comme pair** -- Les tests imposent des blocs de 2h.
