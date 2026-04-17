---
title: "TP3 - TCP Services in Java"
sidebar_position: 3
---

# TP3 - TCP Services in Java

Building interactive TCP client-server applications with text-based protocols.

## Objectives

- Implement TCP server that handles multiple sequential clients
- Design simple application-layer protocols
- Build interactive services (uppercase conversion, guessing game)
- Understand socket lifecycle and connection management

## Topics Covered

1. **Uppercase Service** - TCP server converts text to uppercase
2. **Guessing Game** - Interactive "Plus ou Moins" (higher/lower) game
3. **Protocol Design** - Application-layer message formats

---

## Part 1: Uppercase Service (ServeurMajuscule)

### Concept

Simple text transformation service:
1. Client connects to server
2. Server sends welcome message
3. Client sends strings
4. Server responds with uppercase version
5. Client sends "." to terminate
6. Connection closes

### Protocol

```
Server → Client: "Welcome! Send text to convert (. to quit)"
Client → Server: "hello world"
Server → Client: "HELLO WORLD"
Client → Server: "bonjour"
Server → Client: "BONJOUR"
Client → Server: "."
[Connection closes]
```

### Server Implementation

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

### Client Implementation (ClientMajuscule)

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

### Running

```bash
# Terminal 1: Start server
javac ServeurMajuscule.java
java ServeurMajuscule 8989

# Terminal 2: Start client
javac ClientMajuscule.java
java ClientMajuscule localhost 8989
```

**Example session:**
```
Client: hello world
Server: HELLO WORLD
Client: java is fun
Server: JAVA IS FUN
Client: .
[Connection closed]
```

---

## Part 2: Guessing Game (Plus ou Moins)

### Game Rules

1. Server picks random number between 1 and 100
2. Client guesses a number
3. Server responds:
   - `+` if guess is too low
   - `-` if guess is too high  
   - `=` if guess is correct
   - `~` if input is invalid
4. Game ends when correct number guessed

### Protocol

```
Server → Client: "Guess a number between 1 and 100"
Client → Server: "50"
Server → Client: "+"
Client → Server: "75"
Server → Client: "-"
Client → Server: "62"
Server → Client: "+"
Client → Server: "68"
Server → Client: "="
[Connection closes]
```

### Server Implementation (ServeurPlusMoins)

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

### Client Implementation (ClientPlusMoins)

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

### Running

```bash
# Terminal 1: Start server
javac ServeurPlusMoins.java
java ServeurPlusMoins 8988

# Terminal 2: Start client
javac ClientPlusMoins.java
java ClientPlusMoins localhost 8988
```

**Example game:**
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

### Binary Search Strategy

Optimal client uses binary search:
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

Finds any number in at most 7 guesses (log₂(100) ≈ 6.64).

---

## Enhanced Features

### Server Enhancements

**1. Handle multiple clients concurrently**
```java
while (true) {
    Socket client = serverSocket.accept();
    
    // Spawn thread for each client
    new Thread(() -> handleClient(client)).start();
}
```

**2. Track statistics**
```java
int totalGames = 0;
int totalGuesses = 0;
Map<Integer, Integer> guessDistribution = new HashMap<>();
```

**3. Configurable difficulty**
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

**4. Add hints**
```java
if (Math.abs(guess - target) <= 5) {
    out.println("+!");  // Very close!
} else {
    out.println("+");
}
```

### Client Enhancements

**1. Automated optimal player**
Binary search implementation that always wins in ≤ 7 guesses.

**2. GUI interface**
Swing/JavaFX interface with:
- Input field for guesses
- History of previous guesses
- Visual indicator (too high/low)
- Number of attempts counter

**3. Network error handling**
```java
try {
    // Network operations
} catch (IOException e) {
    System.err.println("Connection lost: " + e.getMessage());
    // Attempt reconnection or graceful exit
}
```

---

## Protocol Design Principles

### Key Concepts

1. **Simplicity** - Easy to implement and debug
2. **Text-based** - Human-readable with telnet/nc
3. **Stateful** - Server remembers game state per connection
4. **Explicit termination** - Clear end-of-session signal
5. **Error handling** - Invalid input handled gracefully

### Message Format

Our protocols use simple newline-delimited text:
```
<command>\n
```

More complex protocols might use:
```json
{
  "type": "guess",
  "value": 50,
  "timestamp": 1234567890
}
```

Or binary formats for efficiency.

### Protocol State Machine

**Uppercase Service:**
```
[CONNECTED] → send welcome → [ACTIVE]
[ACTIVE] → receive text → convert → send response → [ACTIVE]
[ACTIVE] → receive "." → [CLOSED]
```

**Guessing Game:**
```
[CONNECTED] → pick number → send welcome → [PLAYING]
[PLAYING] → receive guess → evaluate → send hint → [PLAYING]
[PLAYING] → receive correct guess → send "=" → [CLOSED]
```

---

## Testing with Netcat

Test servers without writing client code:

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

## Wireshark Analysis

Capture TCP stream with filter: `tcp.port == 8988`

**Handshake:**
```
1. Client → Server: SYN
2. Server → Client: SYN-ACK
3. Client → Server: ACK
```

**Data Exchange:**
```
4. Server → Client: PSH-ACK "Guess a number..."
5. Client → Server: ACK
6. Client → Server: PSH-ACK "50"
7. Server → Client: ACK
8. Server → Client: PSH-ACK "+"
9. Client → Server: ACK
... (more guesses)
```

**Connection Termination:**
```
N.   Client → Server: FIN-ACK
N+1. Server → Client: ACK
N+2. Server → Client: FIN-ACK
N+3. Client → Server: ACK
```

---

## Common Issues & Solutions

### Issue: Server doesn't respond

**Cause:** Output not flushed

**Solution:** Use `PrintWriter` with auto-flush:
```java
PrintWriter out = new PrintWriter(
    socket.getOutputStream(), 
    true  // auto-flush on println()
);
```

Or manually flush:
```java
out.flush();
```

### Issue: readLine() blocks forever

**Cause:** Client didn't send newline

**Solution:** Ensure client sends `\n`:
```java
out.println(message);  // Adds \n automatically
```

### Issue: Connection refuses

**Cause:** Server not running or wrong port

**Solution:** Check server is listening:
```bash
netstat -tuln | grep 8988
```

### Issue: Address already in use

**Cause:** Previous server instance still bound to port

**Solution:** Enable SO_REUSEADDR:
```java
ServerSocket server = new ServerSocket();
server.setReuseAddress(true);
server.bind(new InetSocketAddress(port));
```

Or wait for TIME_WAIT to expire (30-120 seconds).

---

## Key Takeaways

1. **TCP provides reliable stream** - no message boundaries
2. **BufferedReader.readLine()** uses `\n` as delimiter
3. **PrintWriter auto-flush** important for responsiveness
4. **Each client needs separate socket** from accept()
5. **Sequential server** handles one client at a time
6. **Protocol design** determines application behavior
7. **Text protocols** are easy to debug with telnet
8. **Error handling** critical for robust applications

---

## Files in This Directory

### Source Code (`src/`)
- `ServeurMajuscule.java` - Uppercase conversion server
- `ClientMajuscule.java` - Uppercase client
- `ServeurPlusMoins.java` - Guessing game server
- `ClientPlusMoins.java` - Guessing game client (with binary search)

### Alternative Implementations (`GUILHEM/`)
- Different student's implementation for comparison

### Documentation
- `tp3.pdf` - Assignment instructions

### Compilation

```bash
cd src
javac *.java
java ServeurMajuscule 8989
java ClientMajuscule localhost 8989
```

---

## Extensions

### 1. Multiplayer Game

Multiple clients compete to guess first:
- Server broadcasts hints to all clients
- First correct guess wins
- Use multithreading + shared state

### 2. Chat Server

Relay messages between connected clients:
- Each client has username
- Messages broadcast to all clients
- Commands: `/who`, `/msg user text`, `/quit`

### 3. File Transfer

Client uploads/downloads files:
```
GET filename    → Server sends file content
PUT filename    → Client sends file content
LIST            → Server sends directory listing
```

### 4. Authentication

Add login requirement:
```
Server: Username:
Client: alice
Server: Password:
Client: secret123
Server: Welcome alice!
```

---

## Further Reading

- Java Socket API documentation
- RFC 854 (Telnet) - inspiration for text protocols
- Design patterns for network servers
- Thread pooling (ExecutorService)
- Non-blocking I/O (java.nio)
