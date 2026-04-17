---
title: "Exercices -- Protocoles et proprietes de securite"
sidebar_position: 4
---

# Exercices -- Protocoles et proprietes de securite

> Following teacher instructions from: S6/Vulnerabilites/data/moodle/guide/05_cryptographie_protocoles.md, 06_authentification.md, 07_mitm.md
> Sources du cours : C1-annotated.pdf, intro.pdf, intro_mim-annotated.pdf, secrecy_auth-annotated.pdf (Barbara Fila)

---

## Exercice 1 : Inference de messages

### L'adversaire connait l'ensemble M = {h(k), sk(b), {m}h(k), {m}pk(b), {p}h(h(h(m)))}. Peut-il deduire les messages suivants ?

**Rappel : regles de deduction**

```
Ce qu'on sait               Ce qu'on peut deduire         Regle
-----------                 ----------------------         -----
m                           m                              identite
m1, m2                      (m1, m2)                       paire
m, k                        {m}k                           chiffrement
(m1, m2)                    m1  et  m2                     decomposition
{m}k, k^(-1)                m                              dechiffrement
m                           h(m)                           hachage
```

Avec : chiffrement symetrique `k^(-1) = k` ; chiffrement asymetrique `pk(i)^(-1) = sk(i)`.

### a) h(m) ?

**Answer:**

h(m) n'est pas directement dans M. Mais l'adversaire peut-il d'abord deduire m ?

```
Etape 1 : L'adversaire connait {m}pk(b) et sk(b)   (les deux dans M)
Etape 2 : sk(b) est l'inverse de pk(b)
Etape 3 : Regle de dechiffrement : dec({m}pk(b), sk(b)) = m
Etape 4 : L'adversaire connait m
Etape 5 : Regle de hachage : h(m) peut etre calcule
```

**Reponse : OUI** (en deux etapes : dechiffrement puis hachage).

### b) m ?

**Answer:**

```
Etape 1 : L'adversaire connait {m}pk(b)   (dans M)
Etape 2 : L'adversaire connait sk(b)      (dans M)
Etape 3 : sk(b) est la cle inverse de pk(b)
Etape 4 : dec({m}pk(b), sk(b)) = m
```

**Reponse : OUI.**

### c) k ?

**Answer:**

```
L'adversaire connait h(k).
h est une fonction a sens unique (resistance a la pre-image).
Connaitre h(k) ne permet PAS de retrouver k.
Aucune autre combinaison dans M ne permet d'obtenir k.
```

**Reponse : NON.** Le hachage est irreversible sous l'hypothese de cryptographie parfaite.

### d) h(k) ?

**Answer:**

```
h(k) est directement dans M.
```

**Reponse : OUI** (directement, par la regle d'identite).

### e) p ?

**Answer:**

```
Etape 1 : L'adversaire peut deduire m           (voir b)
Etape 2 : h(m) peut etre calcule                (hachage de m)
Etape 3 : h(h(m)) peut etre calcule             (hachage iteratif)
Etape 4 : h(h(h(m))) peut etre calcule          (encore une iteration)
Etape 5 : L'adversaire connait {p}h(h(h(m)))    (dans M)
Etape 6 : h(h(h(m))) est la cle de chiffrement symetrique
Etape 7 : dec({p}h(h(h(m))), h(h(h(m)))) = p
```

**Reponse : OUI.** La chaine de deduction complete est : `{m}pk(b) + sk(b)` --> `m` --> `h(m)` --> `h(h(m))` --> `h(h(h(m)))` --> `dec({p}h(h(h(m))))` = `p`.

### f) {m}h(k) peut-il etre dechiffre ?

**Answer:**

```
L'adversaire connait {m}h(k) et h(k)   (les deux dans M).
h(k) est la cle symetrique utilisee pour chiffrer m.
Pour le chiffrement symetrique : k^(-1) = k
Donc : dec({m}h(k), h(k)) = m
```

**Reponse : OUI.** Cela fournit une deuxieme methode pour obtenir m (en plus de la methode par dechiffrement asymetrique du point b).

**Security explanation:**

L'inference de messages est le fondement de l'analyse de protocoles. L'adversaire Dolev-Yao combine les messages qu'il connait pour en deduire de nouveaux, en appliquant les regles de chiffrement, dechiffrement, hachage et decomposition. L'hypothese de cryptographie parfaite impose que le hachage est irreversible et que le dechiffrement sans la cle est impossible.

---

## Exercice 2 : Secret d'un protocole (chiffrement asymetrique)

### Protocole :

```
     pk(r)                    sk(r), pk(r)
       i                          r
       |  nonce n                 |
       |     {i, n}pk(r)          |
       |------------------------->|
       |                          |
     [secret n pour i ?]     [secret n pour r ?]
```

### Le secret de n est-il valide pour i ? Pour r ?

**Answer:**

**Secret pour i -- VALIDE**

```
Raisonnement :
1. i genere n et l'envoie chiffre avec pk(r)
2. Seul r possede sk(r), donc seul r peut dechiffrer {i, n}pk(r)
3. L'adversaire Dolev-Yao intercepte {i, n}pk(r) sur le reseau
4. L'adversaire connait pk(r) (publique) mais PAS sk(r)
5. Sous l'hypothese de cryptographie parfaite, il ne peut pas dechiffrer
6. Si r est honnete, il ne revelera pas n
7. Conclusion : l'adversaire ne peut pas deduire n
```

**Secret pour r -- INVALIDE**

```
Raisonnement :
1. r recoit {i, n}pk(r) et dechiffre avec sk(r)
2. r obtient (i, n) et connait n
3. MAIS : r ne sait pas si le message vient VRAIMENT de i
4. N'importe qui connait pk(r) et peut creer {Eve, n_eve}pk(r)
5. L'adversaire Eve peut envoyer {Eve, n_eve}pk(r) a r
6. r dechiffre et obtient n_eve... que Eve connait deja !
7. Du point de vue de r, le n qu'il recoit pourrait etre connu de l'adversaire
```

**Attaque concrete :**
```
     Eve                          r
       |  nonce n_eve             |
       |     {Eve, n_eve}pk(r)    |
       |------------------------->|
       |                          |
       |                     r dechiffre : obtient n_eve
       |                     r croit que n_eve est secret
       |                     MAIS Eve connait n_eve !
```

**Security explanation:**

C'est l'**asymetrie fondamentale** du chiffrement asymetrique : la cle de chiffrement (`pk(r)`) est publique. N'importe qui peut chiffrer pour r, donc l'emetteur n'est PAS authentifie. Le secret est valide pour l'emetteur (i sait ce qu'il a envoye et a qui) mais PAS pour le receveur (r ne sait pas qui a vraiment envoye le message).

---

## Exercice 3 : Correction avec cle symetrique

### Reprenez le protocole de l'exercice 2 avec une cle symetrique k(i,r).

```
     k(i,r)                   k(i,r)
       i                          r
       |  nonce n                 |
       |     {i, n}k(i,r)        |
       |------------------------->|
       |                          |
     [secret n pour i ?]     [secret n pour r ?]
```

**Answer:**

**Secret pour i -- VALIDE**
```
1. Seuls i et r connaissent k(i,r) (cle symetrique partagee)
2. L'adversaire ne peut ni chiffrer ni dechiffrer avec k(i,r)
3. Si r est honnete, il ne revelera pas n
```

**Secret pour r -- VALIDE**
```
1. r recoit {i, n}k(i,r) et dechiffre avec k(i,r)
2. Seuls i et r possedent k(i,r)
3. Si i est honnete, c'est bien i qui a envoye le message
4. L'adversaire ne peut PAS creer {Eve, n_eve}k(i,r) car il ne connait pas k(i,r)
5. Donc le n que r recoit vient de i et est inconnu de l'adversaire
```

**Security explanation:**

La cle symetrique garantit le secret pour les DEUX roles, contrairement a la cle asymetrique. C'est parce que seuls les deux participants possedent la cle, ce qui empeche l'adversaire de creer des messages chiffres valides.

---

## Exercice 4 : Proprietes d'authentification -- Protocole "Hello" avec signatures

### Rappel des niveaux d'authentification

```
Faible                                              Fort
  |                                                   |
  v                                                   v

Weak Aliveness    Non-injective    Non-injective      Injective
                  Agreement        Synchronization    Synchronization

"r a participe    "r a participe   "r a participe     "r a participe
 a UN protocole"   avec i et       avec i dans le      exactement UNE
                   a utilise les    BON ORDRE et        FOIS avec i dans
                   memes donnees"  memes donnees"      le bon ordre"
```

### Protocole :

```
  sk(i), pk(r)               sk(r), pk(i)
       i                          r
       |    {"Hello"}sk(i)        |
       |------------------------->|
       |    {"Hello"}sk(r)        |
       |<-------------------------|
       |                          |
     [weak-alive r ?]
```

### Ce protocole garantit-il la weak aliveness de r pour i ?

**Answer:**

**Reponse : VALIDE.**

```
Raisonnement :
1. i recoit {"Hello"}sk(r)
2. Seul r possede sk(r) (cle privee)
3. i verifie la signature avec pk(r)
4. Si la verification reussit, r a bien signe "Hello"
5. Donc r a participe a un protocole (il est "vivant")
```

**MAIS attention -- weak aliveness seulement :**

Ce protocole ne garantit PAS que r jouait le role de repondeur. r pourrait avoir envoye `{"Hello"}sk(r)` dans une AUTRE session ou il jouait le role d'initiateur.

**Attaque par confusion de role :**
```
1. r initie une session avec Eve : envoie {"Hello"}sk(r) a Eve
2. Eve relaie {"Hello"}sk(r) a i dans la session i<-->Eve
3. i pense que r a repondu, mais r jouait un role d'initiateur
```

**Security explanation:**

La weak aliveness est la propriete d'authentification la plus faible. Elle garantit seulement que l'agent distant "est vivant" et a participe a un protocole, mais ne dit rien sur le role joue ni sur les donnees echangees. Pour un protocole "Hello" sans nonce ni donnees specifiques, c'est le maximum qu'on peut prouver.

---

## Exercice 5 : Attaque de Lowe sur NSPK -- Trace MSC complete

### Rappel du protocole NSPK

```
     pk(r), sk(i)               pk(i), sk(r)
          i                          r
          |                          |
          | nonce n                  |
          |   {(n, i)}pk(r)          |   Message 1
          |------------------------->|
          |                          |
          |                          | nonce m
          |   {(n, m)}pk(i)          |   Message 2
          |<-------------------------|
          |                          |
          |   {m}pk(r)               |   Message 3
          |------------------------->|
```

### Decrivez l'attaque de Lowe pas a pas avec le MSC complet

**Answer:**

```
     Bob                    Eve                      Alice
     (pense parler          (MitM)                   (pense parler
      a Eve)                                          a Bob)

     pk(Eve), sk(Bob)       pk(Bob), pk(Alice)       pk(Bob), sk(Alice)
                            sk(Eve)
          |                     |                        |
          | nonce n             |                        |
  (1)     | {(n,Bob)}pk(Eve)   |                        |
          |-------------------->|                        |
          |                     |                        |
          |              Eve dechiffre : obtient (n, Bob)|
          |                     |                        |
          |                     | {(n,Bob)}pk(Alice)     |
          |                (1') |----------------------->|
          |                     |                        |
          |                     |             Alice croit recevoir de Bob
          |                     |             Alice genere nonce m
          |                     |                        |
          |                     | {(n,m)}pk(Bob)         |
          |                (2') |<-----------------------|
          |                     |                        |
          |              Eve NE PEUT PAS lire ce message |
          |              (chiffre avec pk(Bob))          |
          |              Elle le relaie tel quel         |
          |                     |                        |
          | {(n,m)}pk(Bob)      |                        |
  (2)     |<--------------------|                        |
          |                     |                        |
          | Bob dechiffre :     |                        |
          | trouve n (son       |                        |
          | nonce) et m         |                        |
          |                     |                        |
          | {m}pk(Eve)          |                        |
  (3)     |-------------------->|                        |
          |                     |                        |
          |              Eve dechiffre : obtient m       |
          |                     |                        |
          |                     | {m}pk(Alice)           |
          |                (3') |----------------------->|
          |                     |                        |
          |                     |             Alice verifie m : correct
          |                     |             Alice est convaincue
          |                     |             de parler a Bob
          |                     |             FAUX !
```

**Trace detaillee :**

**Etape 1 :** Bob initie legitimement une session avec Eve.
- Bob genere nonce n, cree `{(n, Bob)}pk(Eve)`, envoie a Eve

**Etape 1' :** Eve ouvre une session PARALLELE avec Alice en se faisant passer pour Bob.
- Eve dechiffre le message de Bob (elle a `sk(Eve)`), obtient n
- Eve rechiffre `{(n, Bob)}pk(Alice)` et l'envoie a Alice

**Etape 2' :** Alice repond a "Bob" (en realite Eve).
- Alice croit parler a Bob, genere nonce m
- Alice envoie `{(n, m)}pk(Bob)` -- seul Bob peut lire

**Etape 2 :** Eve relaie le message d'Alice a Bob.
- Eve ne peut pas lire `{(n, m)}pk(Bob)` mais le transmet
- Bob dechiffre, trouve son nonce n (confirmation) et m

**Etape 3 :** Bob repond a Eve (car il croit parler a Eve).
- Bob envoie `{m}pk(Eve)` -- Eve peut lire

**Etape 3' :** Eve obtient m et le transmet a Alice.
- Eve dechiffre `{m}pk(Eve)`, obtient m
- Eve rechiffre `{m}pk(Alice)` et l'envoie a Alice

**Resultat :** Alice est convaincue de parler a Bob. Eve connait n et m.

### Pourquoi la correction NSPKL fonctionne

**Answer:**

**NSPKL :** message 2 devient `{(n, m, r)}pk(i)` -- on ajoute l'identite de r.

```
Dans l'attaque :
- Alice (qui joue r) envoie {(n, m, Alice)}pk(Bob) au message 2'
- Eve relaie ce message a Bob au message 2
- Bob dechiffre et trouve r = Alice
- Bob s'attend a r = Eve (car il pense parler a Eve)
- INCOHERENCE DETECTEE --> Bob refuse
- L'attaque echoue
```

C'est l'ajout d'UN SEUL champ (l'identite de r) qui corrige le protocole. NSPKL satisfait la non-injective synchronization et le secret de n et m.

**Security explanation:**

L'attaque de Lowe demontre que la cryptographie parfaite ne suffit pas pour securiser un protocole. Eve ne casse aucun chiffrement -- elle relaie des messages chiffres entre deux sessions paralleles. La correction est minime (un champ ajoute) mais a ete decouverte 17 ans apres la publication du protocole. C'est pourquoi la verification formelle (Scyther) est indispensable.

---

## Exercice 6 : Challenge-response vulnerable

### Protocole :

```
     pk(p)                    pk(p), sk(p)
       r                          p
       |   nonce n                |
       |       n                  |
       |------------------------->|
       |     {n}sk(p)             |
       |<-------------------------|
       |                          |
     [auth p pour r ?]
```

### Trouvez la vulnerabilite et proposez une correction

**Answer:**

**Attaque par session parallele :**

```
     Eve                          p                          r
       |                          |                          |
       |       n (intercepte de r)|                          |
       |   n                      |                          |
       |   (ouvre une session     |                          |
       |    parallele avec p)     |                          |
       |------------------------->|                          |
       |                          |                          |
       |     {n}sk(p)             |                          |
       |<-------------------------|                          |
       |                          |                          |
       |                                    {n}sk(p)         |
       |---------------------------------------------------->|
       |                          |                          |
       |                          |              r croit que p a repondu
       |                          |              MAIS c'est Eve qui relaie
```

Trace detaillee :
1. r envoie le nonce n (en clair) sur le reseau
2. Eve intercepte n
3. Eve ouvre une session parallele avec p en envoyant n
4. p signe n : `{n}sk(p)` et renvoie a Eve
5. Eve obtient `{n}sk(p)` et le relaie a r
6. r verifie la signature : valide (p a bien signe n)
7. r croit que p a repondu a son challenge
8. MAIS p a repondu au challenge d'EVE, pas de r

**Correction : inclure l'identite du destinataire**

```
     pk(p)                    pk(p), sk(p)
       r                          p
       |   nonce n                |
       |       n, r               |
       |------------------------->|
       |     {n, r}sk(p)          |
       |<-------------------------|
       |                          |
     [auth p pour r]
```

Pourquoi ca corrige : la signature inclut l'identite r. Si Eve essaie d'utiliser cette signature pour s'authentifier aupres d'un autre verifieur r', la signature contient r (pas r'), donc r' detecte l'incoherence.

---

## Exercice 7 : Scyther -- Lire et interpreter les resultats

### Protocole Scyther :

```
protocol auth-mim(r, p) {
    role r {
        fresh n: Nonce;
        send_1(r, p, n);
        recv_2(p, r, {n}sk(p));
        claim_3(r, Weakagree);
        claim_4(r, Niagree);
        claim_5(r, Nisynch);
    }
    role p {
        var v: Nonce;
        recv_1(r, p, v);
        send_2(p, r, {v}sk(p));
    }
}
```

### Q1 : Decrivez le protocole en MSC

**Answer:**

```
     pk(p)                    pk(p), sk(p)
       r                          p
       |   fresh nonce n          |
       |       n                  |  Message 1 : envoi du nonce en clair
       |------------------------->|
       |                          |
       |     {n}sk(p)             |  Message 2 : signature du nonce
       |<-------------------------|
       |                          |
     [Weakagree p ?]
     [Non-inj. Agreement ?]
     [Non-inj. Synch ?]
```

### Q2 : Quels claims sont satisfaits ?

**Answer:**

**Weak Aliveness (claim_3) : VALIDE**
```
Seul p possede sk(p). Si r verifie {n}sk(p) avec pk(p), c'est que p a signe n.
Donc p a participe a un protocole.
```

**Non-injective Agreement (claim_4) : INVALIDE**
```
L'agreement demande que p ait utilise les memes donnees et joue le meme role.
Attaque : Eve intercepte n, ouvre une session parallele avec p,
obtient {n}sk(p), et le relaie a r. L'agreement est viole car p
n'a pas participe dans la session de r mais dans celle d'Eve.
```

**Non-injective Synchronization (claim_5) : INVALIDE**
```
La synchronisation demande le bon ordre des messages dans la meme session.
Meme attaque que ci-dessus : les messages de p sont dans une autre session.
```

---

## Exercice 8 : Replay attack et nonces

### Protocole de transfert bancaire :

```
     pk(r), sk(i)             sk(r), pk(i)
       i                          r
       |                          |
       |     {i, "transfert 100EUR"}sk(i)
       |------------------------->|
```

### Q1 : Quelle attaque est possible ?

**Answer:**

**Attaque par rejeu (replay) :**
```
1. Eve intercepte le message signe {i, "transfert 100EUR"}sk(i)
2. Eve ne peut pas le modifier (la signature le protege)
3. Mais Eve peut le RENVOYER a r autant de fois qu'elle veut
4. r verifie la signature : valide a chaque fois
5. r execute le transfert de 100 EUR a chaque rejeu
6. Si Eve relaie 10 fois, 1000 EUR sont transferes
```

### Q2 : Comment corriger ?

**Answer:**

**Ajout d'un nonce (challenge-response) :**
```
     pk(r), sk(i)             sk(r), pk(i)
       i                          r
       |                          |
       |      nonce n             |
       |<-------------------------|  r envoie un challenge frais
       |                          |
       |     {i, n, "transfert 100EUR"}sk(i)
       |------------------------->|  i repond avec le nonce inclus
       |                          |
       |              r verifie : n est-il frais ?
       |              Si oui, accepte. Sinon, rejette.
```

Pourquoi ca corrige :
1. r genere un nonce n frais a chaque requete
2. i inclut n dans le message signe
3. Si Eve rejoue le message, r detecte que n est ancien (deja utilise)
4. r rejette le message rejoue
5. Eve ne peut pas forger un nouveau message avec un nonce frais car elle ne possede pas `sk(i)`

**Alternative : timestamp**
```
{i, timestamp, "transfert 100EUR"}sk(i)
```
Le serveur rejette les messages avec un timestamp trop ancien (fenetre de 60 secondes).

---

## Exercice 9 : Protocole a corriger (type DS)

### Protocole de transfert de cle :

```
     pk(r)                    sk(r)
       i                          r
       |   cle k                  |
       |     {k}pk(r)             |
       |------------------------->|
       |                          |
     [secret k pour i ?]     [secret k pour r ?]
     [auth i pour r ?]
```

### Evaluez les proprietes de securite et proposez une correction

**Answer:**

**Secret de k pour i : VALIDE**
```
k est chiffre avec pk(r). Seul r peut dechiffrer. Si r est honnete, k reste secret.
```

**Secret de k pour r : INVALIDE**
```
N'importe qui peut chiffrer avec pk(r) (cle publique).
L'adversaire Eve peut envoyer {k_eve}pk(r) a r.
r ne sait pas si k vient de i ou de Eve.
```

**Authentification de i pour r : INVALIDE**
```
Le message ne contient aucune preuve que i l'a cree.
N'importe qui peut creer {k}pk(r) car pk(r) est publique.
r ne peut pas verifier l'identite de l'emetteur.
```

**Correction : signer le message**

```
     pk(r), sk(i)             sk(r), pk(i)
       i                          r
       |   cle k                  |
       |     {k, i}pk(r)          |   chiffrement pour confidentialite
       |     signature: {h(k,i)}sk(i)
       |------------------------->|
       |                          |
     [secret k pour i : VALIDE]
     [secret k pour r : VALIDE]
     [auth i pour r : VALIDE]
```

La signature `{h(k,i)}sk(i)` prouve que i a cree le message (seul i possede `sk(i)`). Le chiffrement `{k, i}pk(r)` assure la confidentialite (seul r peut dechiffrer). r verifie la signature avec `pk(i)` : l'emetteur est authentifie.

---

## Resume : proprietes de securite

| Propriete | Signification | Piege DS |
|-----------|--------------|----------|
| Secret pour i | L'adversaire ne peut pas deduire le message secret de i | Asymetrie : valide pour l'emetteur en asym, pas pour le receveur |
| Secret pour r | L'adversaire ne peut pas deduire le message secret de r | Invalide si n'importe qui peut chiffrer (pk publique) |
| Weak Aliveness | r a participe a un protocole | Ne dit rien sur le role joue par r |
| Non-inj. Agreement | r a participe avec i et les memes donnees | Viole si les donnees viennent d'une session parallele |
| Non-inj. Synchronization | r a participe avec i dans le bon ordre | Plus fort que agreement, inclut l'ordre |
| Injective Synchronization | r a participe exactement une fois | Protege contre le rejeu |

---

## Pieges courants en DS

1. **Confondre chiffrement et signature** : `{m}pk(i)` = chiffrement POUR i ; `{m}sk(i)` = signature DE i
2. **Secret asymetrique unilateral** : en chiffrement asymetrique, le secret est valide pour l'emetteur mais PAS pour le receveur (car pk est publique)
3. **Oublier les sessions paralleles** : l'attaquant Dolev-Yao peut ouvrir des sessions independantes avec n'importe qui
4. **Confondre weak aliveness et agreement** : weak aliveness = r a participe ; agreement = r a participe avec les MEMES donnees
5. **Penser que le chiffrement empeche le MitM** : Eve peut relayer des messages chiffres sans les lire (NSPK)
6. **Oublier le rejeu** : un message valide peut etre reemis si aucun mecanisme anti-rejeu n'est en place
7. **Correction NSPKL** : c'est l'ajout de l'identite de r dans le message 2 (UN seul champ ajoute)
