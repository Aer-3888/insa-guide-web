---
title: "TP2 - Communication UDP & TCP en Java"
sidebar_position: 2
---

# TP2 - Communication UDP & TCP en Java

Introduction a la programmation socket en Java, implementation d'un serveur echo UDP et d'un serveur web HTTP.

## Objectifs

- Comprendre la communication sans connexion UDP
- Implementer des applications client-serveur TCP
- Construire un serveur HTTP basique
- Comparer les protocoles UDP et TCP

## Themes abordes

1. **Serveur echo UDP** - Requete/reponse sans etat
2. **Serveur HTTP TCP** - Service de fichiers oriente connexion
3. **Client HTTP** - Envoi de requetes GET

---

## Partie 1 : Serveur echo UDP

### Concept

UDP (User Datagram Protocol) est **sans connexion** :
- Pas de handshake ni d'etablissement de connexion
- Chaque datagramme est independant
- Pas de garantie de livraison ni d'ordre
- Rapide, faible surcout

### Implementation

Le serveur UDP :
1. Attend un message d'un client
2. Renvoie le message a l'emetteur (echo)
3. Repete indefiniment

### Points cles du code

```java
// Creer un socket UDP sur un port specifique
DatagramSocket socket = new DatagramSocket(port);

// Preparer le buffer pour les donnees entrantes
byte[] recvBuf = new byte[256];
DatagramPacket packet = new DatagramPacket(recvBuf, 256);

// Recevoir un datagramme (bloquant)
socket.receive(packet);

// Renvoyer le datagramme (le paquet contient l'adresse de l'emetteur)
socket.send(packet);
```

### Execution

```bash
# Terminal 1 : Demarrer le serveur
javac Serveur_UDP.java
java Serveur_UDP

# Terminal 2 : Demarrer le client (GUI)
javac Client_UDP.java UtilitaireRepartition.java
java Client_UDP
```

**Interface graphique du client :**
- Saisir le hostname (ex : `localhost` ou `127.0.0.1`)
- Saisir le numero de port (ex : `5674`)
- Cliquer sur "Envoi message" pour envoyer
- Le message recu s'affiche dans le label

### Analyse reseau

Capture avec le filtre Wireshark : `udp.port == 5674`

**Structure du paquet UDP :**
```
Ethernet Header (14 octets)
+-- Destination MAC
+-- Source MAC
+-- Type: 0x0800 (IPv4)

IP Header (20 octets)
+-- Version: 4
+-- Protocol: 17 (UDP)
+-- Source IP
+-- Destination IP

UDP Header (8 octets)
+-- Source Port
+-- Destination Port
+-- Length
+-- Checksum

Data (variable)
+-- Charge utile applicative
```

### Observations

- Pas d'etablissement de connexion (pas de SYN/ACK)
- Un seul echange requete/reponse
- Sans etat : le serveur ne memorise pas les messages precedents
- Si un paquet est perdu, pas de retransmission automatique

---

## Partie 2 : Serveur HTTP TCP

### Concept

Le protocole HTTP fonctionne sur TCP :
- Oriente connexion (3-way handshake)
- Livraison fiable
- Modele requete/reponse

### Fonctionnalites du serveur

1. **Ecoute sur un port** (par defaut 8888)
2. **Accepte les connexions** depuis les navigateurs
3. **Parse les requetes HTTP** (methode GET)
4. **Sert les fichiers** depuis le repertoire racine
5. **Gere les erreurs** (400 Bad Request, 404 Not Found)
6. **Journalise les requetes** avec horodatage et IP du client

### Format de la requete HTTP

```
GET /index.html HTTP/1.0
Host: localhost:8888
User-Agent: Mozilla/5.0
```

### Format de la reponse HTTP

**Succes (200 OK) :**
```
HTTP/1.0 200 OK
Date: Fri Apr 11 10:30:00 2026
Server: -- Serveur HTTP Java --
Content-type: text/html

<!DOCTYPE html>
<html>
...contenu du fichier...
</html>
```

**Non trouve (404) :**
```
HTTP/1.0 404 Not Found
Date: Fri Apr 11 10:30:00 2026
Server: -- Serveur HTTP Java --
Content-type: text/html

<HTML><BODY><H1>Fichier Non Trouve</H1></BODY></HTML>
```

**Mauvaise requete (400) :**
```
HTTP/1.0 400 Bad Request
...
<HTML><BODY><H1>Mauvaise requete</H1></BODY></HTML>
```

### Points cles de l'implementation

```java
// Creer le socket serveur
ServerSocket serverSocket = new ServerSocket(port);

// Accepter les connexions client (bloquant)
Socket clientSocket = serverSocket.accept();

// Obtenir les flux d'entree/sortie
BufferedReader in = new BufferedReader(
    new InputStreamReader(clientSocket.getInputStream()));
PrintWriter out = new PrintWriter(clientSocket.getOutputStream());

// Lire la requete HTTP
String request = in.readLine();  // "GET /index.html HTTP/1.0"

// Parser la requete
String[] parts = request.split("\\s");  // Decouper par espaces
String filename = parts[1];  // Extraire le chemin

// Verifier si le fichier existe
File file = new File(rootDir + filename);
if (!file.exists()) {
    // Envoyer la reponse 404
} else {
    // Envoyer la reponse 200 + contenu du fichier
}

// Fermer la connexion
clientSocket.close();
```

### Types MIME

Le serveur determine le type de contenu a partir de l'extension du fichier :

```java
static String typeMime(String nom) {
    if (nom.matches(".*\\.html$"))
        return "text/html";
    if (nom.matches(".*\\.gz$"))
        return "application/gzip";
    else 
        return "text/plain";
}
```

### Execution

```bash
# Compiler
javac ServeurHttp.java

# Lancer avec le port par defaut 8888
java ServeurHttp

# Lancer avec un port personnalise
java ServeurHttp 9000
```

**Tester avec un navigateur :**
```
http://localhost:8888/index.html
```

**Tester avec curl :**
```bash
curl -v http://localhost:8888/index.html
```

**Tester avec ClientHttp :**
```bash
javac ClientHttp.java
java ClientHttp
```

### Sortie du journal serveur

```
[Fri Apr 11 10:30:15 2026] Connexion :laptop:54321 (192.168.1.100)
GET /index.html HTTP/1.0

[Fri Apr 11 10:30:20 2026] Connexion :laptop:54322 (192.168.1.100)
GET /missing.html HTTP/1.0
```

### Tests de performance

**Exercice :** Mesurer le temps de reponse pour 50 requetes

Creer un client de benchmark :
```java
long start = System.currentTimeMillis();
for (int i = 0; i < 50; i++) {
    client.get("localhost", 8888, "index.html");
}
long end = System.currentTimeMillis();
System.out.println("Total: " + (end - start) + " ms");
System.out.println("Moyenne: " + (end - start) / 50.0 + " ms/requete");
```

**Exercice :** Lancer 5 clients, chacun effectuant 10 requetes

Observer :
- Le serveur traite les requetes sequentiellement (une a la fois)
- Les clients bloquent en attendant le serveur
- Le temps total = environ 50 requetes x temps par requete

Pour gerer des requetes concurrentes, le serveur aurait besoin de :
- Multithreading (un thread par client)
- Pool de threads pour l'efficacite
- I/O non bloquant (NIO)

---

## Partie 3 : Client HTTP

### Implementation

Client HTTP simple qui envoie des requetes GET :

```java
// Se connecter au serveur
Socket socket = new Socket(hostname, port);

// Envoyer la requete HTTP
PrintWriter out = new PrintWriter(socket.getOutputStream());
out.println("GET /" + filename + " HTTP/1.1\r\n\r\n");
out.flush();

// Lire la reponse
BufferedReader in = new BufferedReader(
    new InputStreamReader(socket.getInputStream()));
String line;
while ((line = in.readLine()) != null) {
    System.out.println(line);
}

socket.close();
```

### Tests

Le client teste plusieurs fichiers :
```java
String[] targets = {
    "index.html",           // Devrait retourner 200 OK
    "Client_UDP.java",      // Devrait retourner 200 OK
    "nonexistent.html"      // Devrait retourner 404 Not Found
};
```

---

## Comparaison UDP vs TCP

| Critere | UDP | TCP |
|---------|-----|-----|
| **Connexion** | Sans connexion | Oriente connexion |
| **Fiabilite** | Best-effort, sans garantie | Livraison garantie |
| **Ordre** | Pas de garantie | Livraison ordonnee |
| **Vitesse** | Rapide, faible surcout | Plus lent, plus de surcout |
| **Taille en-tete** | 8 octets | 20+ octets |
| **Cas d'usage** | DNS, streaming, jeux | HTTP, FTP, email |
| **Detection d'erreurs** | Checksum uniquement | Checksum + ACK/retransmission |
| **Controle de flux** | Non | Oui (taille de fenetre) |
| **Etat** | Sans etat | Avec etat |

### Quand utiliser UDP

- Applications temps reel (VoIP, streaming video)
- Requetes courtes (DNS)
- Broadcast/multicast
- Latence critique, perte occasionnelle acceptable

### Quand utiliser TCP

- Transfert de fichiers (doit etre complet et correct)
- HTTP/HTTPS (pages web)
- Email (SMTP, IMAP, POP3)
- Tout ce qui necessite de la fiabilite

---

## Analyse reseau

### Comparaison des captures Wireshark

**Session UDP :**
```
1. Client -> Serveur : paquet UDP avec donnees
2. Serveur -> Client : paquet UDP avec echo
(2 paquets au total)
```

**Session TCP :**
```
1. Client -> Serveur : SYN
2. Serveur -> Client : SYN-ACK
3. Client -> Serveur : ACK
4. Client -> Serveur : requete GET (PSH, ACK)
5. Serveur -> Client : reponse HTTP (PSH, ACK)
6. Client -> Serveur : ACK
7. Client -> Serveur : FIN, ACK
8. Serveur -> Client : FIN, ACK
9. Client -> Serveur : ACK
(9+ paquets pour un echange simple)
```

### Filtres de capture

```
udp.port == 5674                    # Trafic UDP
tcp.port == 8888                    # Serveur HTTP
http.request.method == "GET"        # Requetes HTTP GET
http.response.code == 200           # Reponses reussies
tcp.flags.syn == 1                  # Paquets TCP SYN
```

---

## Extensions et exercices

### 1. Serveur UDP multithread

Le serveur actuel gere un seul client a la fois. Modifier pour gerer plusieurs clients simultanes :

```java
while (true) {
    DatagramPacket packet = new DatagramPacket(buf, buf.length);
    socket.receive(packet);
    
    // Lancer un thread pour traiter cette requete
    new Thread(() -> {
        // Traiter et repondre
        socket.send(packet);
    }).start();
}
```

### 2. Ameliorations du serveur HTTP

- **Support POST** : gerer les soumissions de formulaires
- **Keep-Alive** : reutiliser les connexions (HTTP/1.1)
- **Multithreading** : gerer les clients concurrents
- **Statistiques** : suivre les requetes par fichier, taux d'erreur
- **Journalisation** : ecrire le journal d'acces dans un fichier
- **Hotes virtuels** : servir plusieurs domaines
- **Support CGI** : executer des scripts cote serveur

### 3. Fonctionnalites du client HTTP

- **Suivi des redirections** : gerer les reponses 301/302
- **Connexions persistantes** : reutiliser le socket
- **Progression du telechargement** : afficher les octets recus
- **Gestion du timeout** : ne pas attendre indefiniment
- **Support HTTPS** : connexions SSL/TLS

### 4. Implementation d'un protocole

Implementer son propre protocole applicatif :

```
ECHO <message>          -> Le serveur renvoie le message
TIME                    -> Le serveur retourne l'heure actuelle
CALC <expr>             -> Le serveur evalue l'expression
QUIT                    -> Fermer la connexion
```

---

## Points a retenir

1. **UDP est simple** mais non fiable - adapte aux applications temps reel
2. **TCP assure la livraison** au prix de la complexite et du surcout
3. **HTTP est en texte** - facile a debugger avec telnet/curl
4. **La programmation socket abstrait** les details reseau
5. **Le buffering est important** - flush() les flux de sortie
6. **La gestion d'erreurs compte** - les operations reseau peuvent echouer
7. **La gestion des ressources** - fermer les sockets quand c'est fini

---

## Fichiers dans ce repertoire

### Code source (`src/`)
- `Client_UDP.java` - Client UDP avec interface graphique
- `Serveur_UDP.java` - Serveur echo UDP
- `ServeurHttp.java` - Serveur de fichiers HTTP
- `ClientHttp.java` - Client HTTP simple
- `UtilitaireRepartition.java` - Utilitaire de disposition GUI

### Ressources
- `index.html` - Fichier HTML exemple pour le serveur HTTP
- `tp2.pdf` - Enonce du TP

### Compilation et execution

```bash
# UDP
javac src/*.java
java -cp src Serveur_UDP
java -cp src Client_UDP

# HTTP
java -cp src ServeurHttp
java -cp src ClientHttp
```

---

## Pour aller plus loin

- RFC 768 (UDP)
- RFC 793 (TCP)
- RFC 2616 (HTTP/1.1)
- Documentation de l'API Socket Java
- Guide utilisateur Wireshark
