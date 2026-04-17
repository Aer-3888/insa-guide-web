---
title: "TP04 - Time Scheduling (Emploi du Temps)"
sidebar_position: 4
---

# TP04 - Time Scheduling (Emploi du Temps)

## Objective

Implement a timetable/scheduling system using **hash tables** to efficiently manage course schedules.

## Domain Model

### `Schedule` - Individual Course

Represents a single scheduled event:

```java
public class Schedule {
    private String course;      // Course name (e.g., "SDD", "Math")
    private String day;         // Day of week (e.g., "Monday")
    private int startHour;      // Start hour (0-23)
    private int duration;       // Duration in hours
    
    // Constructor, getters, setters
}
```

### `TimeTable` - Complete Timetable

Manages a collection of schedules:

```java
public class TimeTable {
    // Internal storage - choose appropriate structure
    private Map<String, List<Schedule>> schedulesByDay;
    // or
    private Map<String, Schedule> schedulesByKey;  // key = "day-hour"
    
    public void addSchedule(Schedule s) { ... }
    public List<Schedule> getSchedulesForDay(String day) { ... }
    public Schedule getScheduleAt(String day, int hour) { ... }
    public boolean hasConflict(Schedule s) { ... }
    public void removeSchedule(Schedule s) { ... }
}
```

## Key Concepts

### Hash Table Basics

A **hash table** provides O(1) average-case lookup by:
1. Computing a **hash code** from the key
2. Using that hash to index into an array
3. Handling **collisions** when multiple keys hash to the same index

### Collision Resolution Strategies

**1. Chaining** (used here)
- Each array slot contains a linked list
- Colliding elements stored in the list
- Lookup: hash to find list, then linear search within list

```
[0] -> null
[1] -> Schedule("Math") -> Schedule("Physics") -> null
[2] -> Schedule("SDD") -> null
[3] -> null
```

**2. Open Addressing** (alternative)
- Find next empty slot when collision occurs
- Techniques: linear probing, quadratic probing, double hashing

### Choosing a Hash Key

For timetable, good key choices:
- **Day + Hour**: `"Monday-9"` - unique per timeslot
- **Course + Day**: `"SDD-Monday"` - if one course per day
- **Composite**: `(day, startHour)` tuple

## Implementation Strategy

### Option 1: Hash by Timeslot

```java
public class TimeTable {
    private Map<String, Schedule> slots;
    
    public TimeTable() {
        slots = new HashMap<>();
    }
    
    private String makeKey(String day, int hour) {
        return day + "-" + hour;
    }
    
    public void addSchedule(Schedule s) {
        String key = makeKey(s.getDay(), s.getStartHour());
        
        // Check for conflicts
        if (slots.containsKey(key)) {
            throw new IllegalArgumentException("Timeslot already occupied");
        }
        
        slots.put(key, s);
    }
    
    public Schedule getScheduleAt(String day, int hour) {
        return slots.get(makeKey(day, hour));
    }
    
    public List<Schedule> getSchedulesForDay(String day) {
        return slots.values().stream()
            .filter(s -> s.getDay().equals(day))
            .sorted(Comparator.comparingInt(Schedule::getStartHour))
            .collect(Collectors.toList());
    }
}
```

### Option 2: Hash by Day

```java
public class TimeTable {
    private Map<String, List<Schedule>> schedulesByDay;
    
    public TimeTable() {
        schedulesByDay = new HashMap<>();
    }
    
    public void addSchedule(Schedule s) {
        schedulesByDay
            .computeIfAbsent(s.getDay(), k -> new ArrayList<>())
            .add(s);
    }
    
    public List<Schedule> getSchedulesForDay(String day) {
        return schedulesByDay.getOrDefault(day, Collections.emptyList());
    }
    
    public Schedule getScheduleAt(String day, int hour) {
        List<Schedule> daySchedules = schedulesByDay.get(day);
        if (daySchedules == null) return null;
        
        for (Schedule s : daySchedules) {
            if (s.getStartHour() == hour) {
                return s;
            }
        }
        return null;
    }
}
```

## Conflict Detection

Check if a new schedule overlaps with existing ones:

```java
public boolean hasConflict(Schedule newSchedule) {
    String day = newSchedule.getDay();
    int start = newSchedule.getStartHour();
    int end = start + newSchedule.getDuration();
    
    List<Schedule> daySchedules = getSchedulesForDay(day);
    
    for (Schedule existing : daySchedules) {
        int existingStart = existing.getStartHour();
        int existingEnd = existingStart + existing.getDuration();
        
        // Check for overlap: [start, end) and [existingStart, existingEnd)
        if (start < existingEnd && end > existingStart) {
            return true;  // Conflict!
        }
    }
    
    return false;
}

public void addScheduleSafe(Schedule s) {
    if (hasConflict(s)) {
        throw new IllegalArgumentException("Schedule conflicts with existing courses");
    }
    addSchedule(s);
}
```

## Usage Example

```java
TimeTable timetable = new TimeTable();

// Monday schedule
timetable.addSchedule(new Schedule("Math", "Monday", 8, 2));
timetable.addSchedule(new Schedule("SDD", "Monday", 10, 2));
timetable.addSchedule(new Schedule("Algorithms", "Monday", 14, 2));

// Tuesday schedule
timetable.addSchedule(new Schedule("Physics", "Tuesday", 9, 2));
timetable.addSchedule(new Schedule("English", "Tuesday", 14, 1));

// Query
Schedule s = timetable.getScheduleAt("Monday", 10);
System.out.println(s.getCourse());  // "SDD"

List<Schedule> monday = timetable.getSchedulesForDay("Monday");
System.out.println("Monday: " + monday.size() + " courses");  // 3

// Conflict detection
Schedule conflict = new Schedule("Lunch", "Monday", 9, 2);
if (timetable.hasConflict(conflict)) {
    System.out.println("Cannot schedule - conflicts with existing courses");
}
```

## Complexity Analysis

| Operation | Hash by Timeslot | Hash by Day |
|-----------|------------------|-------------|
| Add schedule | O(1) | O(1) |
| Get schedule at time | O(1) | O(n) per day |
| Get day's schedules | O(n) total | O(1) |
| Conflict detection | O(1) per slot | O(n) per day |
| Remove schedule | O(1) | O(n) per day |

Where n = number of schedules in a day (typically small, e.g., 5-10)

## Extensions

### 1. Week View

```java
public void printWeek() {
    String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
    
    System.out.println("     | 08:00 | 09:00 | 10:00 | 11:00 | ...");
    System.out.println("-----|-------|-------|-------|-------|-----");
    
    for (String day : days) {
        System.out.print(String.format("%-5s|", day));
        for (int hour = 8; hour < 18; hour++) {
            Schedule s = getScheduleAt(day, hour);
            String cell = s != null ? s.getCourse().substring(0, 5) : "     ";
            System.out.print(" " + cell + " |");
        }
        System.out.println();
    }
}
```

### 2. Find Free Slots

```java
public List<String> findFreeSlots(String day, int startHour, int endHour) {
    List<String> freeSlots = new ArrayList<>();
    
    for (int hour = startHour; hour < endHour; hour++) {
        if (getScheduleAt(day, hour) == null) {
            freeSlots.add(day + " " + hour + ":00");
        }
    }
    
    return freeSlots;
}
```

### 3. Export to iCalendar

```java
public String toICalendar() {
    StringBuilder ical = new StringBuilder();
    ical.append("BEGIN:VCALENDAR\n");
    ical.append("VERSION:2.0\n");
    
    for (Schedule s : getAllSchedules()) {
        ical.append("BEGIN:VEVENT\n");
        ical.append("SUMMARY:").append(s.getCourse()).append("\n");
        ical.append("DTSTART:").append(formatDateTime(s)).append("\n");
        ical.append("DURATION:PT").append(s.getDuration()).append("H\n");
        ical.append("END:VEVENT\n");
    }
    
    ical.append("END:VCALENDAR\n");
    return ical.toString();
}
```

### 4. Room Assignment

```java
public class Schedule {
    private String course;
    private String day;
    private int startHour;
    private int duration;
    private String room;      // New: assigned room
    private String teacher;   // New: assigned teacher
}

public class TimeTable {
    // Check room conflicts
    public boolean hasRoomConflict(Schedule newSchedule) {
        // Check if room is already occupied at this time
    }
}
```

## Testing

```java
@Test
public void testAddAndRetrieve() {
    TimeTable tt = new TimeTable();
    Schedule s = new Schedule("Math", "Monday", 9, 2);
    tt.addSchedule(s);
    
    Schedule retrieved = tt.getScheduleAt("Monday", 9);
    assertEquals("Math", retrieved.getCourse());
}

@Test
public void testConflictDetection() {
    TimeTable tt = new TimeTable();
    tt.addSchedule(new Schedule("Math", "Monday", 9, 2));
    
    Schedule conflict = new Schedule("Physics", "Monday", 10, 2);
    assertTrue(tt.hasConflict(conflict));
    
    Schedule noConflict = new Schedule("SDD", "Monday", 11, 2);
    assertFalse(tt.hasConflict(noConflict));
}

@Test
public void testGetDaySchedules() {
    TimeTable tt = new TimeTable();
    tt.addSchedule(new Schedule("Math", "Monday", 8, 2));
    tt.addSchedule(new Schedule("SDD", "Monday", 10, 2));
    tt.addSchedule(new Schedule("Physics", "Tuesday", 9, 2));
    
    List<Schedule> monday = tt.getSchedulesForDay("Monday");
    assertEquals(2, monday.size());
}
```

## Real-World Considerations

1. **Recurrence**: Schedules repeat weekly - store once, apply to all weeks
2. **Exceptions**: Handle holidays, exam periods, room changes
3. **Capacity**: Check room capacity vs. enrolled students
4. **Teacher availability**: One teacher can't be in two places
5. **Student schedules**: Check individual student conflicts
6. **Priority**: Some courses have priority for certain timeslots
7. **Optimization**: NP-complete problem - use heuristics or constraint solvers

## See Also

- **TP05**: Hash tables in depth
- [Constraint Satisfaction Problems](https://en.wikipedia.org/wiki/Constraint_satisfaction_problem)
- [Timetabling Problem](https://en.wikipedia.org/wiki/Timetabling)
