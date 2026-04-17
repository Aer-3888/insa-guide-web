---
title: "Chapitre 6 : Entrees/Sorties Fichier"
sidebar_position: 5
---

# Chapitre 6 : Entrees/Sorties Fichier

## 6.1 Ouverture et fermeture de fichiers

```c
#include <stdio.h>

/* Ouverture */
FILE *fichier = fopen("nom_fichier.txt", "r");

/* TOUJOURS verifier le resultat ! */
if (fichier == NULL) {
    fprintf(stderr, "Erreur d'ouverture du fichier\n");
    exit(1);
}

/* ... utilisation du fichier ... */

/* Fermeture OBLIGATOIRE */
if (fclose(fichier)) {
    fprintf(stderr, "Erreur a la fermeture du fichier\n");
}
```

### Modes d'ouverture

| Mode | Description | Si le fichier n'existe pas |
|------|-------------|---------------------------|
| `"r"` | Lecture seule | Erreur (retourne NULL) |
| `"w"` | Ecriture (ecrase le contenu) | Cree le fichier |
| `"a"` | Ajout (ecrit a la fin) | Cree le fichier |
| `"r+"` | Lecture et ecriture | Erreur |
| `"w+"` | Lecture et ecriture (ecrase) | Cree le fichier |
| `"rb"` | Lecture binaire | Erreur |
| `"wb"` | Ecriture binaire | Cree le fichier |

### Pattern robuste (TP6)

```c
typedef enum {ARRET, RETOUR} TypeRetour;

FILE *ouvrirFichier(char *nom, char *mode, TypeRetour t) {
    FILE *pFile = fopen(nom, mode);
    if (pFile == NULL) {
        perror(nom);  /* Affiche le message d'erreur systeme */
        if (t == ARRET)
            exit(EXIT_FAILURE);
    }
    return pFile;
}

void fermerFichier(FILE *f) {
    fclose(f);
}
```

## 6.2 Lecture formatee (fscanf)

```c
/* Lire des valeurs formatees depuis un fichier */
int no, duree, nbPred;
fscanf(fichier, "%d %d %d", &no, &duree, &nbPred);

/* Lire une chaine jusqu'au saut de ligne */
char titre[64];
fscanf(fichier, " %[^\n]", titre);
/* L'espace initial consomme les espaces/tabs restants */
/* %[^\n] lit tout jusqu'au '\n' (non inclus) */
```

### Lecture complete d'une tache (TP4)

```c
void saisieTache(Tache *t, FILE *f) {
    /* Lecture des attributs numeriques */
    fscanf(f, "%d %d %d", &(t->no), &(t->duree), &(t->nbPred));
    
    /* Lecture des predecesseurs */
    for (int i = 0; i < t->nbPred; i++) {
        fscanf(f, "%d", &(t->pred[i]));
    }
    
    /* Lecture du titre (tout le reste de la ligne) */
    fscanf(f, " %[^\n]", t->titre);
}
```

**Format du fichier taches.txt :**
```
1 5 0  Analyse des besoins
2 8 1 1  Conception architecture
3 12 1 2  Developpement module A
4 10 1 2  Developpement module B
5 6 2 3 4  Tests d'integration
6 4 1 5  Documentation
7 3 1 6  Deploiement
```

### Lecture de toutes les taches

```c
int lireTachesFichier(char *nomFichier, Tache *tab) {
    FILE *fichier;
    
    if ((fichier = fopen(nomFichier, "r")) == NULL) {
        fprintf(stderr, "Erreur d'ouverture du fichier %s\n", nomFichier);
        exit(1);
    }
    
    int i = 0;
    while (i < MAXTACHES && !feof(fichier)) {
        Tache t;
        saisieTache(&t, fichier);
        
        if (!feof(fichier)) {  /* Verifie que la lecture a reussi */
            tab[i] = t;
            i++;
        }
    }
    
    if (fclose(fichier)) {
        fprintf(stderr, "Erreur a la fermeture\n");
    }
    
    return i;  /* Nombre de taches lues */
}
```

## 6.3 Ecriture formatee (fprintf)

```c
/* Ecrire dans un fichier */
fprintf(fichier, "%d %d %d ", t.no, t.duree, t.nbPred);

/* Ecrire sur stderr (erreurs) */
fprintf(stderr, "Erreur: fichier non trouve\n");

/* Ecrire sur stdout (equivalent a printf) */
fprintf(stdout, "Message normal\n");
```

### Ecriture de taches dans un fichier (TP4)

```c
int ecrireTachesFichier(char *nomFichier, Tache *tab_t, int nbTaches) {
    FILE *fichier;
    
    if ((fichier = fopen(nomFichier, "w")) == NULL) {
        fprintf(stderr, "Erreur d'ouverture du fichier %s\n", nomFichier);
        return 0;  /* Echec */
    }
    
    for (int i = 0; i < nbTaches; i++) {
        fprintf(fichier, "%d %d %d ", tab_t[i].no, tab_t[i].duree, tab_t[i].nbPred);
        
        for (int j = 0; j < tab_t[i].nbPred; j++) {
            fprintf(fichier, "%d ", tab_t[i].pred[j]);
        }
        
        fprintf(fichier, " %s\n", tab_t[i].titre);
    }
    
    if (fclose(fichier)) {
        fprintf(stderr, "Erreur a la fermeture\n");
        return 0;
    }
    
    return 1;  /* Succes */
}
```

## 6.4 Lecture ligne par ligne (fgets)

```c
char ligne[TMAX];

/* fgets lit UNE ligne (incluant le '\n') */
while (fgets(ligne, TMAX, fichier) != NULL) {
    /* Traitement de la ligne */
    printf("%s", ligne);
}
```

### Traitement generique avec pointeur de fonction (TP6)

```c
/* Fonction qui applique un traitement a chaque ligne du fichier */
int traiterLignesFichier(FILE *f, int (*ptFonction)(char *)) {
    int cpt = 0;
    char tampon[TMAX];
    
    rewind(f);  /* Retour au debut du fichier */
    
    while (fgets(tampon, TMAX, f) != NULL) {
        cpt++;
        if (ptFonction != NULL)
            (*ptFonction)(tampon);    /* Appelle la fonction passee en parametre */
        else
            printf("%s", tampon);     /* Traitement par defaut */
    }
    
    printf("Nombre de lignes: %d\n", cpt);
    return cpt;
}

/* Appel : */
traiterLignesFichier(pFile, rechercheNomSabotiers);
traiterLignesFichier(pFile, NULL);  /* Affiche simplement les lignes */
```

## 6.5 Detection de fin de fichier

```c
/* Methode 1 : feof (apres une lecture) */
while (!feof(fichier)) {
    /* Lecture ... */
    /* ATTENTION : feof est vrai APRES une tentative de lecture echouee */
}

/* Methode 2 : verifier le retour de fscanf */
while (fscanf(fichier, "%d", &val) == 1) {
    /* Lecture reussie */
}

/* Methode 3 : verifier le retour de fgets */
while (fgets(ligne, TMAX, fichier) != NULL) {
    /* Ligne lue avec succes */
}
```

**PIEGE avec feof :**
```c
/* MAUVAIS : lit une tache de trop */
while (!feof(fichier)) {
    saisieTache(&t, fichier);
    tab[i] = t;  /* La derniere iteration lit des donnees invalides ! */
    i++;
}

/* BON : verifier APRES la lecture */
while (!feof(fichier)) {
    saisieTache(&t, fichier);
    if (!feof(fichier)) {
        tab[i] = t;
        i++;
    }
}
```

## 6.6 Lecture de notes avec calcul de moyenne (TD2)

```c
int main() {
    float notes[NB_ELEVES_MAX];
    int nb_notes;
    char nom_fichier[FILE_MAX];
    FILE *ptr_fic;
    
    printf("Nom du fichier de notes: ");
    scanf("%s", nom_fichier);
    
    /* Ouverture en lecture */
    ptr_fic = fopen(nom_fichier, "r");
    
    /* Lecture des notes */
    int i = 0;
    while (i < NB_ELEVES_MAX && fscanf(ptr_fic, "%f", &notes[i]) >= 0) {
        i++;
    }
    nb_notes = i;
    fclose(ptr_fic);
    
    /* Calcul de la moyenne */
    float moy = notes[0];
    for (i = 1; i < nb_notes; i++)
        moy += notes[i];
    moy /= nb_notes;
    
    /* Ecriture du resultat */
    printf("Nom du fichier de sortie: ");
    scanf("%s", nom_fichier);
    ptr_fic = fopen(nom_fichier, "w");
    fprintf(ptr_fic, "%.1f\n", moy);
    fclose(ptr_fic);
}
```

## 6.7 Lecture avec taille dynamique (TP5)

```c
/* Le fichier commence par le nombre d'elements */
Tache *lireTachesFichierDyn(char *nomFichier, int *nbtaches) {
    FILE *fichier;
    if ((fichier = fopen(nomFichier, "r")) == NULL) {
        fprintf(stderr, "Erreur d'ouverture\n");
        exit(1);
    }
    
    /* Premiere ligne : nombre de taches */
    fscanf(fichier, "%d", nbtaches);
    
    /* Allocation dynamique de la taille exacte */
    Tache *tab = (Tache *)calloc(*nbtaches, sizeof(Tache));
    
    /* Lecture des taches */
    lireTachesFichier(fichier, tab);
    
    fclose(fichier);
    return tab;  /* ATTENTION : l'appelant doit faire free(tab) */
}
```

## 6.8 Fichiers CSV (cours - villes)

```c
/* Lecture d'un fichier CSV avec sscanf */
Ville convertir(char *chaine) {
    Ville v;
    sscanf(chaine,
        "%[^;];%[^;];%[^;];%[^;];%[^;];%[^;];%d;%d;%[^;];%[^;];%d;%d;%d;%d;%d;%d;%lf;%lf;%d;%d",
        v.departement, v.departementNom, v.region, v.nom, v.nomReel, v.codeCommune,
        &v.statut, &v.arrondissement, v.arrondissementNom, v.cantonNom, &v.canton,
        &v.population2010, &v.population1999, &v.population2012, &v.densite,
        &v.surface, &v.longitude, &v.latitude, &v.altitudeMin, &v.altitudeMax);
    return v;
}
/* %[^;] : lit tous les caracteres SAUF ';' */
```

---

## CHEAT SHEET - Entrees/Sorties Fichier

```
OUVERTURE :   FILE *f = fopen("fichier.txt", "r");     /* Lecture */
              FILE *f = fopen("fichier.txt", "w");     /* Ecriture (ecrase) */
              FILE *f = fopen("fichier.txt", "a");     /* Ajout */
              if (f == NULL) { perror("fichier"); exit(1); }

FERMETURE :   fclose(f);

LECTURE :     fscanf(f, "%d %s", &n, str);             /* Formatee */
              fgets(ligne, TAILLE, f);                 /* Ligne entiere */
              int c = fgetc(f);                         /* Un caractere */

ECRITURE :    fprintf(f, "%d %s\n", n, str);           /* Formatee */
              fputs(ligne, f);                          /* Chaine */
              fputc(c, f);                              /* Un caractere */

FIN :         feof(f)      /* Vrai APRES echec de lecture */
              rewind(f)     /* Retour au debut */

ERREURS :     fprintf(stderr, "message\n");            /* Ecrire sur stderr */
              perror("contexte");                       /* Message d'erreur systeme */

FORMATS :     %[^\n]   Lit jusqu'au saut de ligne
              %[^;]    Lit jusqu'au point-virgule
              %*[^/]   Lit et JETTE jusqu'au /
              " %s"    L'espace consomme les blancs avant

PATTERN :     ouverture -> verification -> lecture/ecriture -> fermeture
```
