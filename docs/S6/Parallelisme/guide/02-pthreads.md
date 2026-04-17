---
title: "Chapitre 02 -- Threads POSIX (Pthreads)"
sidebar_position: 2
---

# Chapitre 02 -- Threads POSIX (Pthreads)

## 1. Processus vs Thread

Un **thread** est un fil d'execution leger au sein d'un processus. Tous les threads partagent la memoire globale et le tas, mais chacun a sa propre pile, ses registres et son compteur de programme.

| Aspect | Processus | Thread |
|--------|-----------|--------|
| Memoire | Propre (isolee) | Partagee |
| Creation | Lourde (fork, copie memoire) | Legere (microsecondes) |
| Communication | IPC (pipes, sockets) | Lecture/ecriture directe en memoire |
| Crash | N'affecte pas les autres | Peut crasher tout le processus |

**Partage :** variables globales, tas (malloc), descripteurs de fichiers, code.
**Propre :** pile, registres, compteur de programme, TID.

---

## 2. Creer et attendre un thread

### pthread_create

```c
#include <pthread.h>

int pthread_create(
    pthread_t *thread,              /* [OUT] identifiant du thread */
    const pthread_attr_t *attr,     /* NULL = defaut */
    void *(*start_routine)(void *), /* fonction a executer */
    void *arg                       /* argument (void*) */
);
/* Retour : 0 = succes, code erreur sinon */
```

### pthread_join

```c
int pthread_join(
    pthread_t thread,    /* thread a attendre */
    void **retval        /* [OUT] valeur retournee (ou NULL) */
);
/* Bloque jusqu'a la terminaison du thread cible */
```

### Exemple complet

```c
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>

void *dire_bonjour(void *arg)
{
    int numero = *(int *)arg;
    printf("Bonjour du thread %d\n", numero);
    return NULL;
}

int main(void)
{
    int nb_threads = 4;
    pthread_t threads[4];
    int numeros[4];   /* tableau d'arguments -- NE PAS passer &i directement */

    for (int i = 0; i < nb_threads; i++) {
        numeros[i] = i;
        pthread_create(&threads[i], NULL, dire_bonjour, &numeros[i]);
    }
    for (int i = 0; i < nb_threads; i++) {
        pthread_join(threads[i], NULL);
    }
    printf("Tous les threads ont termine.\n");
    return EXIT_SUCCESS;
}
```

**Compilation :** `gcc -pthread programme.c -o programme`

---

## 3. Passer des arguments complexes

Utiliser une structure quand on veut passer plusieurs valeurs :

```c
typedef struct {
    int id;
    int debut;
    int fin;
    double *tableau;
    double resultat;
} args_thread_t;

void *calculer_somme(void *arg)
{
    args_thread_t *p = (args_thread_t *)arg;
    double somme = 0.0;
    for (int i = p->debut; i < p->fin; i++) {
        somme += p->tableau[i];
    }
    p->resultat = somme;
    return NULL;
}
```

---

## 4. Race conditions

Une **race condition** se produit quand deux threads accedent a la **meme variable** en meme temps et qu'au moins un ecrit. Le resultat depend de l'ordonnancement, qui est imprevisible.

```c
int compteur = 0;  /* Variable partagee */

void *incrementer(void *arg)
{
    for (int i = 0; i < 1000000; i++) {
        compteur++;   /* PAS atomique : lire, incrementer, ecrire */
    }
    return NULL;
}
/* Avec 2 threads, on obtient souvent < 2000000 */
```

---

## 5. Mutex (exclusion mutuelle)

Un **mutex** est un verrou : un seul thread peut le detenir a la fois.

```c
pthread_mutex_t verrou = PTHREAD_MUTEX_INITIALIZER;

pthread_mutex_lock(&verrou);    /* entrer en section critique */
compteur++;                      /* acces protege */
pthread_mutex_unlock(&verrou);  /* sortir de la section critique */
```

**Regle d'or :** la section critique doit etre la plus **courte** possible.

```c
/* BON */
double r = calcul_complexe(donnees);  /* hors mutex */
pthread_mutex_lock(&verrou);
compteur += r;                         /* seulement l'acces partage */
pthread_mutex_unlock(&verrou);
```

---

## 6. Deadlocks

Un **deadlock** se produit quand deux threads s'attendent mutuellement.

### 4 conditions de Coffman (toutes necessaires)

1. Exclusion mutuelle
2. Detention et attente
3. Pas de preemption
4. Attente circulaire

### Solutions

**Ordre global :** tous les threads prennent les verrous dans le meme ordre.

```c
/* Thread 1 et 2 : toujours A avant B */
pthread_mutex_lock(&verrou_A);
pthread_mutex_lock(&verrou_B);
/* section critique */
pthread_mutex_unlock(&verrou_B);
pthread_mutex_unlock(&verrou_A);
```

**trylock :** essayer sans bloquer, relacher si echec.

```c
while (1) {
    pthread_mutex_lock(&verrou_A);
    if (pthread_mutex_trylock(&verrou_B) == 0) break;
    pthread_mutex_unlock(&verrou_A);  /* relacher et reessayer */
}
```

---

## 7. Variables de condition

Permettent a un thread de **dormir** en attendant un evenement, au lieu de boucler (attente active).

```c
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;

/* Thread qui attend */
pthread_mutex_lock(&mutex);
while (!condition_remplie) {              /* WHILE, pas IF */
    pthread_cond_wait(&cond, &mutex);     /* dort, libere le mutex */
}
/* condition remplie, mutex verrouille */
pthread_mutex_unlock(&mutex);

/* Thread qui signale */
pthread_mutex_lock(&mutex);
condition_remplie = 1;
pthread_cond_signal(&cond);    /* reveille UN thread */
pthread_mutex_unlock(&mutex);
```

**IMPORTANT :** toujours `while`, jamais `if` -- les reveils intempestifs (spurious wakeups) existent.

---

## 8. Patron producteur-consommateur

```c
#define TAILLE_BUFFER 5

int buffer[TAILLE_BUFFER];
int count = 0, idx_prod = 0, idx_cons = 0;
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t pas_plein = PTHREAD_COND_INITIALIZER;
pthread_cond_t pas_vide  = PTHREAD_COND_INITIALIZER;

/* Producteur */
pthread_mutex_lock(&mutex);
while (count == TAILLE_BUFFER)
    pthread_cond_wait(&pas_plein, &mutex);
buffer[idx_prod] = valeur;
idx_prod = (idx_prod + 1) % TAILLE_BUFFER;
count++;
pthread_cond_signal(&pas_vide);
pthread_mutex_unlock(&mutex);

/* Consommateur */
pthread_mutex_lock(&mutex);
while (count == 0)
    pthread_cond_wait(&pas_vide, &mutex);
int val = buffer[idx_cons];
idx_cons = (idx_cons + 1) % TAILLE_BUFFER;
count--;
pthread_cond_signal(&pas_plein);
pthread_mutex_unlock(&mutex);
```

---

## 9. Pieges classiques

| Piege | Explication | Solution |
|-------|------------|----------|
| Passer `&i` en boucle | Tous les threads recoivent le meme pointeur | Utiliser un tableau `numeros[i] = i` |
| Oublier `pthread_join` | Le main quitte, les threads meurent | Toujours join (ou detach) |
| Variable partagee non protegee | Race condition silencieuse | Mutex obligatoire des qu'un thread ecrit |
| `if` au lieu de `while` avec cond_wait | Spurious wakeup | Toujours `while(!cond)` |
| Ordre de verrouillage inconsistant | Deadlock | Ordre global pour tous les mutex |

---

## CHEAT SHEET -- Pthreads

```c
/* Creation / attente */
pthread_create(&t, NULL, fonction, arg);
pthread_join(t, NULL);

/* Mutex */
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_lock(&m);
/* section critique */
pthread_mutex_unlock(&m);

/* Variable de condition */
pthread_cond_t c = PTHREAD_COND_INITIALIZER;
while (!cond) pthread_cond_wait(&c, &m);   /* attendre */
pthread_cond_signal(&c);                    /* reveiller 1 */
pthread_cond_broadcast(&c);                 /* reveiller tous */

/* Compilation */
gcc -pthread fichier.c -o sortie
```

| Fonction | Role |
|----------|------|
| `pthread_create` | Creer un thread |
| `pthread_join` | Attendre la fin |
| `pthread_exit` | Terminer le thread courant |
| `pthread_self` | Obtenir son TID |
| `pthread_detach` | Detacher (pas de join) |
| `pthread_mutex_lock` | Verrouiller |
| `pthread_mutex_unlock` | Deverrouiller |
| `pthread_mutex_trylock` | Essayer sans bloquer |
| `pthread_cond_wait` | Dormir sur une condition |
| `pthread_cond_signal` | Reveiller un thread |
| `pthread_cond_broadcast` | Reveiller tous les threads |
