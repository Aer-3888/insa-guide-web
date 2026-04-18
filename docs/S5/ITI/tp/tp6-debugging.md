---
title: "FUS6 - Debogage et profilage avances"
sidebar_position: 6
---

# FUS6 - Debogage et profilage avances

## Objectifs pedagogiques

Ce TP etend FUS5 avec des techniques avancees de debogage et de profilage dans des scenarios reels.

## Sujets abordes

- Fonctionnalites avancees de gdb (points de surveillance, points d'arret conditionnels)
- Debogage memoire avec valgrind
- Analyse de performance sur des bases de code plus importantes
- Compromis d'optimisation
- Debogage de programmes multi-threades

## Concepts cles

### Fonctionnalites avancees de GDB

**Watchpoints**: Break when a variable changes
```gdb
watch myvar
watch *0x12345678  # Watch memory address
```

**Conditional Breakpoints**: Only break when condition is true
```gdb
break main if argc > 3
break file.c:42 if pointer == NULL
```

**Command Scripts**: Automate debugging workflows
```gdb
define print_array
    set $i = 0
    while $i < $arg1
        print array[$i]
        set $i = $i + 1
    end
end
```

### Valgrind

Outil de detection d'erreurs memoire :
```bash
valgrind --leak-check=full ./program
```

Detecte :
- Fuites memoire
- Utilisation de memoire non initialisee
- Acces memoire invalide
- Double liberation

### Analyse de performance

Comparer les niveaux d'optimisation :
- Impact sur la taille du code
- Differences de temps d'execution
- Difficulte de debogage avec les optimisations

## Materiel de reference

Voir le PDF inclus pour les exercices et exemples detailles.

## Points cles a retenir

1. **Utiliser le bon outil** - gdb pour les bugs logiques, valgrind pour les problemes memoire
2. **Les points de surveillance sont puissants** - Trouver quand/ou les donnees sont corrompues
3. **Optimisation != Toujours plus rapide** - Profiler pour verifier
4. **Builds de debogage vs builds de production** - Compromis differents
