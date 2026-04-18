---
title: "TP04 - Emploi du Temps"
sidebar_position: 4
---

# TP04 - Emploi du Temps

## Objectif

Implementer un systeme d'emploi du temps en utilisant des **tables de hachage** pour gerer efficacement les plannings de cours.

## Modele du domaine

### `Schedule` - Creneau horaire

Represente un evenement planifie :

```java
public class Schedule {
    private final DayOfWeek dow;
    private final int start_hour;
    
    public Schedule(DayOfWeek dow, int start_hour) {
        this.dow = dow;
        this.start_hour = start_hour;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Schedule sch = (Schedule) o;
        return this.dow.equals(sch.dow) && this.start_hour == sch.start_hour;
    }
    
    @Override
    public int hashCode() {
        return this.dow.hashCode() * 31 + this.start_hour;
    }
}
```

### `TimeTable` - Emploi du temps complet

Gere une collection de creneaux avec une structure `Map<String, Map<Schedule, String>>` -- la map externe a les noms d'enseignants comme cles, la map interne utilise `Schedule` comme cle et le nom du cours comme valeur.

```java
public class TimeTable {
    private final Map<String, Map<Schedule, String>> data;
    
    public TimeTable(List<String> teachers) {
        this.data = new HashMap<>();
        for (String teacher : teachers)
            this.data.put(teacher, new HashMap<>());
    }
    
    public boolean addCourse(String teacher, DayOfWeek dow,
                             int start_hour, String courseName) {
        return this.data.get(teacher)
            .putIfAbsent(new Schedule(dow, start_hour), courseName) == null;
    }
}
```

## Concepts clefs

### Bases des tables de hachage

Une **table de hachage** fournit une recherche O(1) en moyenne en :
1. Calculant un **code de hachage** a partir de la cle
2. Utilisant ce hash pour indexer dans un tableau
3. Gerant les **collisions** quand plusieurs cles hashent au meme index

### Strategies de resolution de collisions

**1. Chainage** (utilise ici) - Chaque case contient une liste chainee

**2. Adressage ouvert** (alternative) - Trouver la prochaine case libre en cas de collision

### Choix de la cle de hachage

Pour un emploi du temps, bons choix de cle :
- **Jour + Heure** : `Schedule(MONDAY, 10)` -- unique par creneau
- **Cours + Jour** : si un seul cours par jour

## Detection de conflits

Verifier si un nouveau creneau chevauche un existant :

```java
public int classesAtTenAMOnMonday() {
    int res = 0;
    for (Map<Schedule, String> sch : this.data.values()) {
        res += sch.containsKey(new Schedule(DayOfWeek.MONDAY, 10)) ? 1 : 0;
    }
    return res;
}
```

`containsKey` utilise nos methodes `equals()`/`hashCode()` personnalisees sur `Schedule`.

## Analyse de complexite

| Operation | Complexite | Notes |
|-----------|------------------|-------------|
| Ajouter un cours | O(1) | Hash direct |
| Obtenir le planning d'un jour | O(n) | Parcours des cles |
| Obtenir le cours a un creneau | O(1) | Hash direct |
| Detection de conflit | O(1) par creneau | Via containsKey |

Ou n = nombre de creneaux par enseignant (typiquement petit, 5-10)

## Exemple d'utilisation

```java
TimeTable timetable = new TimeTable(Arrays.asList("Dupont", "Martin"));

timetable.addCourse("Dupont", DayOfWeek.MONDAY, 8, "SDD");
timetable.addCourse("Dupont", DayOfWeek.MONDAY, 10, "Algo");
timetable.addCourse("Martin", DayOfWeek.TUESDAY, 9, "Physique");

Schedule s = new Schedule(DayOfWeek.MONDAY, 10);
Map<Schedule, String> planning = timetable.getTimeTable("Dupont");
System.out.println(planning.get(s));  // "Algo"
```

## Considerations du monde reel

1. **Recurrence** : Les plannings se repetent chaque semaine
2. **Exceptions** : Gerer les jours feries, periodes d'examen
3. **Capacite** : Verifier la capacite de la salle vs. etudiants inscrits
4. **Disponibilite enseignant** : Un enseignant ne peut pas etre a deux endroits
5. **Plannings etudiants** : Verifier les conflits individuels
6. **Priorite** : Certains cours sont prioritaires sur certains creneaux

## Voir aussi

- **TP05** : Tables de hachage en profondeur
