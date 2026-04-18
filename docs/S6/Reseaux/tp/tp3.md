---
title: "TP3 - Services TCP en Java"
sidebar_position: 3
---

# TP3 - Services TCP en Java

Construction d'applications client-serveur TCP interactives avec des protocoles textuels.

## Objectifs

- Implementer un serveur TCP gerant plusieurs clients sequentiels
- Concevoir des protocoles de couche application simples
- Construire des services interactifs (conversion en majuscules, jeu de devinette)
- Comprendre le cycle de vie des sockets et la gestion des connexions

## Themes abordes

1. **Service Majuscule** - Le serveur TCP convertit le texte en majuscules
2. **Jeu de devinette** - Jeu interactif "Plus ou Moins"
3. **Conception de protocole** - Formats de messages applicatifs

---

## Partie 1 : Service Majuscule (ServeurMajuscule)

### Concept

Service de transformation de texte simple :
1. Le client se connecte au serveur
2. Le serveur envoie un message de bienvenue
3. Le client envoie des chaines de caracteres
4. Le serveur repond avec la version en majuscules
5. Le client envoie "." pour terminer
6. La connexion se ferme

### Protocole

```
Serveur -> Client : "Welcome! Send text to convert (. to quit)"
Client -> Serveur : "hello world"
Serveur -> Client : "HELLO WORLD"
Client -> Serveur : "bonjour"
Serveur -> Client : "BONJOUR"
Client -> Serveur : "."
[Connexion fermee]
```

### Implementation du serveur

```java
// Create server socket
ServerSocket serverSocket = new ServerSocket(port);

while (true) {
    // Accept client connection
    Socket clientSocket = serverSocket.accept();
    
    // Setup I/O streams
    BufferedReader in = new BufferedReader(
        new InputStreamReader(clientSocket.getInputStream()));
    PrintWriter out = new PrintWriter(
        clientSocket.getOutputStream(), true);
    
    // Send welcome message
    out.println("Welcome! Send text to convert (. to quit)");
    
    // Process requests until '.' received
    String line;
    while ((line = in.readLine()) != null) {
        if (line.equals(".")) {
            break;  // Client wants to quit
        }
        // Convert to uppercase and send back
        out.println(line.toUpperCase());
    }
    
    // Close connection
    clientSocket.close();
}
```

### Implementation du client (ClientMajuscule)

```java
// Connect to server
Socket socket = new Socket(hostname, port);

// Setup I/O
BufferedReader in = new BufferedReader(
    new InputStreamReader(socket.getInputStream()));
PrintWriter out = new PrintWriter(
    socket.getOutputStream(), true);
BufferedReader keyboard = new BufferedReader(
    new InputStreamReader(System.in));

// Read welcome message
System.out.println(in.readLine());

// Interactive loop
String userInput;
while ((userInput = keyboard.readLine()) != null) {
    // Send to server
    out.println(userInput);
    
    if (userInput.equals(".")) {
        break;  // Quit
    }
    
    // Read and display response
    String response = in.readLine();
    System.out.println("Server: " + response);
}

socket.close();
```

### Execution

```bash
# Terminal 1 : Demarrer le serveur
javac ServeurMajuscule.java
java ServeurMajuscule 8989

# Terminal 2 : Demarrer le client
javac ClientMajuscule.java
java ClientMajuscule localhost 8989
```

**Exemple de session :**
```
Client : hello world
Serveur : HELLO WORLD
Client : java is fun
Serveur : JAVA IS FUN
Client : .
[Connexion fermee]
```

---

## Partie 2 : Jeu de devinette (Plus ou Moins)

### Regles du jeu

1. Le serveur choisit un nombre aleatoire entre 1 et 100
2. Le client propose un nombre
3. Le serveur repond :
   - `+` si la proposition est trop basse
   - `-` si la proposition est trop haute
   - `=` si la proposition est correcte
   - `~` si l'entree est invalide
4. Le jeu se termine quand le bon nombre est trouve

### Protocole

```
Serveur -> Client : "Guess a number between 1 and 100"
Client -> Serveur : "50"
Serveur -> Client : "+"
Client -> Serveur : "75"
Serveur -> Client : "-"
Client -> Serveur : "62"
Serveur -> Client : "+"
Client -> Serveur : "68"
Serveur -> Client : "="
[Connexion fermee]
```

### Implementation du serveur (ServeurPlusMoins)

```java
ServerSocket serverSocket = new ServerSocket(port);

while (true) {
    Socket client = serverSocket.accept();
    
    BufferedReader in = new BufferedReader(
        new InputStreamReader(client.getInputStream()));
    PrintWriter out = new PrintWriter(
        client.getOutputStream(), true);
    
    // Pick random number
    Random random = new Random();
    int target = random.nextInt(100) + 1;  // 1 to 100
    
    // Send welcome message
    out.println("Guess a number between 1 and 100");
    
    // Game loop
    String line;
    while ((line = in.readLine()) != null) {
        try {
            int guess = Integer.parseInt(line);
            
            if (guess < target) {
                out.println("+");  // Too low
            } else if (guess > target) {
                out.println("-");  // Too high
            } else {
                out.println("=");  // Correct!
                break;
            }
        } catch (NumberFormatException e) {
            out.println("~");  // Invalid input
        }
    }
    
    client.close();
}
```

### Implementation du client (ClientPlusMoins)

```java
Socket socket = new Socket(hostname, port);

BufferedReader in = new BufferedReader(
    new InputStreamReader(socket.getInputStream()));
PrintWriter out = new PrintWriter(
    socket.getOutputStream(), true);
BufferedReader keyboard = new BufferedReader(
    new InputStreamReader(System.in));

// Read and display welcome
System.out.println(in.readLine());

// Game loop
while (true) {
    // Read user input
    System.out.print("Your guess: ");
    String guess = keyboard.readLine();
    
    // Send to server
    out.println(guess);
    
    // Read response
    String response = in.readLine();
    
    switch (response) {
        case "+":
            System.out.println("It's higher");
            break;
        case "-":
            System.out.println("It's lower");
            break;
        case "~":
            System.out.println("Invalid input");
            break;
        case "=":
            System.out.println("You found it!");
            socket.close();
            return;
    }
}
```

### Execution

```bash
# Terminal 1 : Demarrer le serveur
javac ServeurPlusMoins.java
java ServeurPlusMoins 8988

# Terminal 2 : Demarrer le client
javac ClientPlusMoins.java
java ClientPlusMoins localhost 8988
```

**Exemple de partie :**
```
Guess a number between 1 and 100
Your guess: 50
It's higher
Your guess: 75
It's lower
Your guess: 62
It's higher
Your guess: 68
You found it!
```

### Strategie par recherche dichotomique

Le client optimal utilise la recherche dichotomique (binary search) :
```java
int low = 1, high = 100;
while (low <= high) {
    int guess = (low + high) / 2;
    out.println(guess);
    
    String response = in.readLine();
    if (response.equals("=")) {
        break;  // Found it!
    } else if (response.equals("+")) {
        low = guess + 1;  // Search upper half
    } else {
        high = guess - 1;  // Search lower half
    }
}
```

Trouve n'importe quel nombre en au plus 7 tentatives (log2(100) = 6.64).

---

## Fonctionnalites avancees

### Ameliorations du serveur

**1. Gerer plusieurs clients simultanement**
```java
while (true) {
    Socket client = serverSocket.accept();
    
    // Spawn thread for each client
    new Thread(() -> handleClient(client)).start();
}
```

**2. Suivre les statistiques**
```java
int totalGames = 0;
int totalGuesses = 0;
Map<Integer, Integer> guessDistribution = new HashMap<>();
```

**3. Difficulte configurable**
```java
enum Difficulty {
    EASY(1, 10),
    MEDIUM(1, 100),
    HARD(1, 1000);
    
    int min, max;
    Difficulty(int min, int max) {
        this.min = min;
        this.max = max;
    }
}
```

**4. Ajouter des indices**
```java
if (Math.abs(guess - target) <= 5) {
    out.println("+!");  // Very close!
} else {
    out.println("+");
}
```

### Ameliorations du client

**1. Joueur automatique optimal**
Implementation par recherche dichotomique qui gagne toujours en 7 tentatives ou moins.

**2. Interface graphique**
Interface Swing/JavaFX avec :
- Champ de saisie pour les propositions
- Historique des tentatives precedentes
- Indicateur visuel (trop haut/trop bas)
- Compteur de tentatives

**3. Gestion des erreurs reseau**
```java
try {
    // Network operations
} catch (IOException e) {
    System.err.println("Connection lost: " + e.getMessage());
    // Attempt reconnection or graceful exit
}
```

---

## Principes de conception de protocole

### Concepts cles

1. **Simplicite** - Facile a implementer et a debugger
2. **Texte** - Lisible par un humain avec telnet/nc
3. **Avec etat** - Le serveur memorise l'etat du jeu pour chaque connexion
4. **Terminaison explicite** - Signal de fin de session clair
5. **Gestion d'erreurs** - Entrees invalides gerees proprement

### Format des messages

Nos protocoles utilisent du texte simple delimite par des retours a la ligne :
```
<command>\n
```

Des protocoles plus complexes pourraient utiliser :
```json
{
  "type": "guess",
  "value": 50,
  "timestamp": 1234567890
}
```

Ou des formats binaires pour l'efficacite.

### Machine a etats du protocole

**Service Majuscule :**
```
[CONNECTED] → send welcome → [ACTIVE]
[ACTIVE] → receive text → convert → send response → [ACTIVE]
[ACTIVE] → receive "." → [CLOSED]
```

**Jeu de devinette :**
```
[CONNECTED] → pick number → send welcome → [PLAYING]
[PLAYING] → receive guess → evaluate → send hint → [PLAYING]
[PLAYING] → receive correct guess → send "=" → [CLOSED]
```

---

## Test avec Netcat

Tester les serveurs sans ecrire de code client :

```bash
# Connect to uppercase server
nc localhost 8989
# Type: hello
# Receive: HELLO
# Type: .
# [Connection closes]

# Connect to game server
nc localhost 8988
# Type: 50
# Receive: +
# Type: 75
# Receive: -
# Type: 62
# Receive: =
```

---

## Analyse Wireshark

Capture du flux TCP avec le filtre : `tcp.port == 8988`

**Handshake :**
```
1. Client → Server: SYN
2. Server → Client: SYN-ACK
3. Client → Server: ACK
```

**Echange de donnees :**
```
4. Server → Client: PSH-ACK "Guess a number..."
5. Client → Server: ACK
6. Client → Server: PSH-ACK "50"
7. Server → Client: ACK
8. Server → Client: PSH-ACK "+"
9. Client → Server: ACK
... (more guesses)
```

**Terminaison de la connexion :**
```
N.   Client → Server: FIN-ACK
N+1. Server → Client: ACK
N+2. Server → Client: FIN-ACK
N+3. Client → Server: ACK
```

---

## Problemes courants et solutions

### Probleme : Le serveur ne repond pas

**Cause :** Sortie non flushee

**Solution :** Utiliser `PrintWriter` avec auto-flush :
```java
PrintWriter out = new PrintWriter(
    socket.getOutputStream(), 
    true  // auto-flush on println()
);
```

Ou flusher manuellement :
```java
out.flush();
```

### Probleme : readLine() bloque indefiniment

**Cause :** Le client n'a pas envoye de retour a la ligne

**Solution :** S'assurer que le client envoie `\n` :
```java
out.println(message);  // Adds \n automatically
```

### Probleme : Connexion refusee

**Cause :** Serveur non demarre ou mauvais port

**Solution :** Verifier que le serveur ecoute :
```bash
netstat -tuln | grep 8988
```

### Probleme : Address already in use

**Cause :** L'instance precedente du serveur est encore liee au port

**Solution :** Activer SO_REUSEADDR :
```java
ServerSocket server = new ServerSocket();
server.setReuseAddress(true);
server.bind(new InetSocketAddress(port));
```

Ou attendre que le TIME_WAIT expire (30-120 secondes).

---

## Points a retenir

1. **TCP fournit un flux fiable** - pas de frontieres de messages
2. **BufferedReader.readLine()** utilise `\n` comme delimiteur
3. **Auto-flush de PrintWriter** important pour la reactivite
4. **Chaque client necessite un socket separe** depuis accept()
5. **Serveur sequentiel** gere un seul client a la fois
6. **La conception du protocole** determine le comportement de l'application
7. **Les protocoles textuels** sont faciles a debugger avec telnet
8. **La gestion d'erreurs** est essentielle pour des applications robustes

---

## Fichiers dans ce repertoire

### Code source (`src/`)
- `ServeurMajuscule.java` - Serveur de conversion en majuscules
- `ClientMajuscule.java` - Client majuscule
- `ServeurPlusMoins.java` - Serveur du jeu de devinette
- `ClientPlusMoins.java` - Client du jeu de devinette (avec recherche dichotomique)

### Implementations alternatives (`GUILHEM/`)
- Implementation d'un autre etudiant pour comparaison

### Documentation
- `tp3.pdf` - Enonce du TP

### Compilation

```bash
cd src
javac *.java
java ServeurMajuscule 8989
java ClientMajuscule localhost 8989
```

---

## Extensions

### 1. Jeu multijoueur

Plusieurs clients s'affrontent pour deviner en premier :
- Le serveur diffuse les indices a tous les clients
- La premiere reponse correcte gagne
- Utiliser le multithreading + etat partage

### 2. Serveur de chat

Relayer les messages entre les clients connectes :
- Chaque client a un nom d'utilisateur
- Les messages sont diffuses a tous les clients
- Commandes : `/who`, `/msg utilisateur texte`, `/quit`

### 3. Transfert de fichiers

Le client telecharge/envoie des fichiers :
```
GET filename    → Server sends file content
PUT filename    → Client sends file content
LIST            → Server sends directory listing
```

### 4. Authentification

Ajouter une exigence de connexion :
```
Server: Username:
Client: alice
Server: Password:
Client: secret123
Server: Welcome alice!
```

---

## Pour aller plus loin

- Documentation de l'API Socket Java
- RFC 854 (Telnet) - inspiration pour les protocoles textuels
- Patrons de conception pour les serveurs reseau
- Pool de threads (ExecutorService)
- I/O non bloquant (java.nio)
