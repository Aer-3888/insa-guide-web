---
title: "Preparation a l'examen CPOO"
sidebar_position: 0
---

# Preparation a l'examen CPOO

## Format de l'examen

- **Duree** : 2 heures (2h40 pour les etudiants avec tiers-temps)
- **Documents autorises** : notes de cours imprimees et notes manuscrites
- **Format** : epreuve ecrite sur papier, reponses ecrites directement sur la feuille d'examen
- **Longueur** : typiquement 6 pages, 3-5 exercices
- **Bareme** : environ 20 points repartis entre les exercices

**Regle critique** : tout texte rature ou illisible entraine une penalite. Utilisez d'abord votre brouillon, puis recopiez votre reponse propre sur la feuille d'examen.

## Structure de l'examen (basee sur 5 annees d'examens passes)

Chaque examen CPOO de 2019 a 2025 suit la meme structure a trois piliers :

| Pilier | Poids | Sujets |
|--------|-------|--------|
| **Tests unitaires** | ~5-8 pts | Ecrire des classes de tests, corriger des assertions, mocking, couverture, flot de controle |
| **Diagrammes UML** | ~5-8 pts | Diagrammes de classes depuis un texte, diagrammes de cas d'utilisation, diagrammes de sequence |
| **Theorie POO / QCM** | ~3-5 pts | Choix multiples, reponses courtes sur les concepts POO |

---

## Analyse detaillee des examens

### [Corriges d'examens par annee](/S5/CPOO/exam-prep/exam-walkthroughs)

Solutions pas a pas pour les questions de tous les examens passes disponibles.

### [Banque de questions par type](/S5/CPOO/exam-prep/question-bank)

Toutes les questions d'examen organisees par sujet pour une revision ciblee.

---

## Strategie d'examen

### Gestion du temps (2 heures)

| Phase | Temps | Activite |
|-------|-------|----------|
| Lecture | 10 min | Lire l'integalite de l'examen, identifier les points faciles |
| Exercice de tests | 40-50 min | Ecrire la classe de test, corriger les assertions |
| Exercice UML | 40-50 min | Dessiner les diagrammes avec soin |
| Theorie/QCM | 10-15 min | Repondre aux choix multiples, reponses courtes |
| Relecture | 5-10 min | Verifier toutes les reponses, relire les diagrammes |

### Ordre de priorite

1. **Exercices de tests** : ce sont les plus mecaniques et rapportent bien si vous connaissez les patrons.
2. **Diagrammes de classes UML** : approche systematique (noms=classes, verbes=methodes, relations).
3. **QCM theorique** : souvent direct si vous connaissez les definitions.
4. **Flot de controle / classes d'equivalence** : necessite une analyse minutieuse, a garder pour la fin si le temps presse.

### Quoi apporter

- Diapositives du cours imprimees (surtout la reference de notation UML et les aide-memoires JUnit/Mockito)
- Notes manuscrites avec des exemples de classes de tests
- Ce guide de revision (imprime)

---

## Patrons cles qui reviennent chaque annee

### 1. "Ecrire une classe de test pour ce code" (Chaque annee sans exception)

On vous donne une classe Java et une interface. L'interface n'a pas d'implementation, vous devez donc la mocker. Patron attendu :

```java
@ExtendWith(MockitoExtension.class)
public class TestX {
    X x;
    MockedInterface mock;

    @BeforeEach
    void setUp() throws Exception {
        mock = Mockito.mock(MockedInterface.class);
        Mockito.when(mock.method()).thenReturn(value);
        x = new X(mock);
    }

    @Test void testNormalCase() { ... }
    @Test void testNullInput() {
        assertThrows(IllegalArgumentException.class, () -> new X(null));
    }
    @Test void testExceptionPath() { ... }
}
```

### 2. "Corriger ces assertions" (La plupart des annees)

Corrections courantes :
- `assertTrue(a.equals(b))` devient `assertEquals(a, b)`
- `assertFalse(!a.foo())` devient `assertTrue(a.foo())`
- `assertTrue(a == b)` devient `assertSame(a, b)`
- try/catch avec `fail()` devient `assertThrows()`
- `if (x != 10) fail()` devient `assertEquals(10, x)`
- `new C()` duplique dans chaque test devient `@BeforeEach`

### 3. "Dessiner un diagramme de classes UML depuis ce texte" (Chaque annee sans exception)

Approche systematique :
1. Souligner tous les noms (classes/attributs)
2. Souligner tous les verbes (methodes)
3. Identifier "est-un" = heritage
4. Identifier "possede" / "contient" = association/agregation/composition
5. Identifier la multiplicite depuis le texte ("un", "plusieurs", "au moins un")
6. Identifier les enumerations ("est soit X, Y, ou Z")
7. Dessiner les boites, connecter avec des lignes, ajouter les multiplicites

### 4. "Graphe de flot de controle / table de verite / classes d'equivalence" (La plupart des annees)

- Dessiner les noeuds pour chaque instruction/branche
- Dessiner les aretes pour le flot de controle
- Pour `||` (court-circuit) : gauche vrai signifie droite NON evaluee
- Pour `&&` (court-circuit) : gauche faux signifie droite NON evaluee
- Classes d'equivalence : regrouper les entrees qui produisent le meme comportement
- Valeurs limites : tester aux bornes de chaque classe

### 5. "Quelle est la couverture maximale atteignable ?" (2021-2022)

Verifier s'il y a du code mort :
- Exceptions declarees mais jamais lancees
- Branches inatteignables en raison de l'evaluation en court-circuit
- Methodes privees qui transforment l'etat (par ex., `doSomething()` definit `str = "yolo"`, ce qui rend la branche `str == null` dans le `if` suivant impossible)

---

## Reference rapide : vocabulaire d'examen

| Francais (examen) | Anglais | Signification |
|-------------------|---------|---------------|
| couverture de lignes | line coverage | % de lignes source executees |
| couverture de branches | branch coverage | % de chemins if/else parcourus |
| couverture de conditions | condition coverage | chaque sous-expression vraie et fausse |
| graphe de flot de controle | control flow graph | noeuds=instructions, aretes=flot de controle |
| classes d'equivalence | equivalence classes | partitions d'entrees au meme comportement |
| diagramme de classes | class diagram | relations entre classes UML |
| diagramme de cas d'utilisation | use case diagram | acteurs et cas d'utilisation |
| diagramme de sequence | sequence diagram | ordonnancement des appels de methodes |
| heritage | inheritance | extends |
| polymorphisme | polymorphism | dispatch dynamique |
| encapsulation | encapsulation | champs prives + methodes publiques |
| integrite referentielle | referential integrity | les deux cotes d'un lien bidirectionnel coherents |
