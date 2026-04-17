---
title: "TP2 - UDP & TCP Communication in Java"
sidebar_position: 2
---

# TP2 - UDP & TCP Communication in Java

Introduction to socket programming with Java, implementing UDP echo server and HTTP web server.

## Objectives

- Understand UDP connectionless communication
- Implement TCP client-server applications
- Build a basic HTTP server
- Compare UDP and TCP protocols

## Topics Covered

1. **UDP Echo Server** - Stateless request/reply
2. **TCP HTTP Server** - Connection-oriented file serving
3. **HTTP Client** - Making GET requests

---

## Part 1: UDP Echo Server

### Concept

UDP (User Datagram Protocol) is **connectionless**:
- No handshake or connection establishment
- Each datagram is independent
- No guarantee of delivery or order
- Fast, low overhead

### Implementation

The UDP server:
1. Waits for a message from a client
2. Echoes the message back to sender
3. Repeat indefinitely

### Key Code Points

```java
// Create UDP socket on specific port
DatagramSocket socket = new DatagramSocket(port);

// Prepare buffer for incoming data
byte[] recvBuf = new byte[256];
DatagramPacket packet = new DatagramPacket(recvBuf, 256);

// Receive datagram (blocking)
socket.receive(packet);

// Send datagram back (packet contains sender address)
socket.send(packet);
```

### Running

```bash
# Terminal 1: Start server
javac Serveur_UDP.java
java Serveur_UDP

# Terminal 2: Start client (GUI)
javac Client_UDP.java UtilitaireRepartition.java
java Client_UDP
```

**Client GUI:**
- Enter hostname (e.g., `localhost` or `127.0.0.1`)
- Enter port number (e.g., `5674`)
- Click "Envoi message" to send
- Received message appears in label

### Network Analysis

Capture with Wireshark filter: `udp.port == 5674`

**UDP packet structure:**
```
Ethernet Header (14 bytes)
├─ Destination MAC
├─ Source MAC
└─ Type: 0x0800 (IPv4)

IP Header (20 bytes)
├─ Version: 4
├─ Protocol: 17 (UDP)
├─ Source IP
└─ Destination IP

UDP Header (8 bytes)
├─ Source Port
├─ Destination Port
├─ Length
└─ Checksum

Data (variable)
└─ Application payload
```

### Observations

- No connection setup (no SYN/ACK)
- Single request/reply exchange
- Stateless: server doesn't remember previous messages
- If packet lost, no automatic retransmission

---

## Part 2: TCP HTTP Server

### Concept

HTTP protocol operates over TCP:
- Connection-oriented (3-way handshake)
- Reliable delivery
- Request/response model

### Server Features

1. **Listen on port** (default 8888)
2. **Accept connections** from browsers
3. **Parse HTTP requests** (GET method)
4. **Serve files** from root directory
5. **Handle errors** (400 Bad Request, 404 Not Found)
6. **Log requests** with timestamp and client IP

### HTTP Request Format

```
GET /index.html HTTP/1.0
Host: localhost:8888
User-Agent: Mozilla/5.0
```

### HTTP Response Format

**Success (200 OK):**
```
HTTP/1.0 200 OK
Date: Fri Apr 11 10:30:00 2026
Server: -- Serveur HTTP Java --
Content-type: text/html

<!DOCTYPE html>
<html>
...file content...
</html>
```

**Not Found (404):**
```
HTTP/1.0 404 Not Found
Date: Fri Apr 11 10:30:00 2026
Server: -- Serveur HTTP Java --
Content-type: text/html

<HTML><BODY><H1>Fichier Non Trouvé</H1></BODY></HTML>
```

**Bad Request (400):**
```
HTTP/1.0 400 Bad Request
...
<HTML><BODY><H1>Mauvaise requête</H1></BODY></HTML>
```

### Implementation Highlights

```java
// Create server socket
ServerSocket serverSocket = new ServerSocket(port);

// Accept client connections (blocking)
Socket clientSocket = serverSocket.accept();

// Get input/output streams
BufferedReader in = new BufferedReader(
    new InputStreamReader(clientSocket.getInputStream()));
PrintWriter out = new PrintWriter(clientSocket.getOutputStream());

// Read HTTP request
String request = in.readLine();  // "GET /index.html HTTP/1.0"

// Parse request
String[] parts = request.split("\\s");  // Split by whitespace
String filename = parts[1];  // Extract path

// Check if file exists
File file = new File(rootDir + filename);
if (!file.exists()) {
    // Send 404 response
} else {
    // Send 200 response + file content
}

// Close connection
clientSocket.close();
```

### MIME Types

Server determines content type from file extension:

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

### Running

```bash
# Compile
javac ServeurHttp.java

# Run with default port 8888
java ServeurHttp

# Run with custom port
java ServeurHttp 9000
```

**Test with browser:**
```
http://localhost:8888/index.html
```

**Test with curl:**
```bash
curl -v http://localhost:8888/index.html
```

**Test with ClientHttp:**
```bash
javac ClientHttp.java
java ClientHttp
```

### Server Log Output

```
[Fri Apr 11 10:30:15 2026] Connexion :laptop:54321 (192.168.1.100)
GET /index.html HTTP/1.0

[Fri Apr 11 10:30:20 2026] Connexion :laptop:54322 (192.168.1.100)
GET /missing.html HTTP/1.0
```

### Performance Testing

**Exercise:** Measure response time for 50 requests

Create benchmark client:
```java
long start = System.currentTimeMillis();
for (int i = 0; i < 50; i++) {
    client.get("localhost", 8888, "index.html");
}
long end = System.currentTimeMillis();
System.out.println("Total: " + (end - start) + " ms");
System.out.println("Average: " + (end - start) / 50.0 + " ms/request");
```

**Exercise:** Launch 5 clients, each making 10 requests

Observe:
- Server handles requests sequentially (one at a time)
- Clients block while waiting for server
- Total time ≈ 50 requests × per-request time

To handle concurrent requests, server would need:
- Multithreading (one thread per client)
- Thread pool for efficiency
- Non-blocking I/O (NIO)

---

## Part 3: HTTP Client

### Implementation

Simple HTTP client that sends GET requests:

```java
// Connect to server
Socket socket = new Socket(hostname, port);

// Send HTTP request
PrintWriter out = new PrintWriter(socket.getOutputStream());
out.println("GET /" + filename + " HTTP/1.1\r\n\r\n");
out.flush();

// Read response
BufferedReader in = new BufferedReader(
    new InputStreamReader(socket.getInputStream()));
String line;
while ((line = in.readLine()) != null) {
    System.out.println(line);
}

socket.close();
```

### Testing

Client tests multiple files:
```java
String[] targets = {
    "index.html",           // Should return 200 OK
    "Client_UDP.java",      // Should return 200 OK
    "nonexistent.html"      // Should return 404 Not Found
};
```

---

## UDP vs TCP Comparison

| Feature | UDP | TCP |
|---------|-----|-----|
| **Connection** | Connectionless | Connection-oriented |
| **Reliability** | Best-effort, no guarantee | Guaranteed delivery |
| **Ordering** | No guarantee | In-order delivery |
| **Speed** | Fast, low overhead | Slower, more overhead |
| **Header size** | 8 bytes | 20+ bytes |
| **Use cases** | DNS, streaming, gaming | HTTP, FTP, email |
| **Error detection** | Checksum only | Checksum + ACK/retransmit |
| **Flow control** | No | Yes (window size) |
| **State** | Stateless | Stateful |

### When to Use UDP

- Real-time applications (VoIP, video streaming)
- Small request/reply (DNS)
- Broadcast/multicast
- Low latency critical, occasional loss acceptable

### When to Use TCP

- File transfer (must be complete and correct)
- HTTP/HTTPS (web pages)
- Email (SMTP, IMAP, POP3)
- Anything requiring reliability

---

## Network Analysis

### Wireshark Capture Comparison

**UDP Session:**
```
1. Client → Server: UDP packet with data
2. Server → Client: UDP packet with echo
(2 packets total)
```

**TCP Session:**
```
1. Client → Server: SYN
2. Server → Client: SYN-ACK
3. Client → Server: ACK
4. Client → Server: GET request (PSH, ACK)
5. Server → Client: HTTP response (PSH, ACK)
6. Client → Server: ACK
7. Client → Server: FIN, ACK
8. Server → Client: FIN, ACK
9. Client → Server: ACK
(9+ packets for simple exchange)
```

### Capture Filters

```
udp.port == 5674                    # UDP traffic
tcp.port == 8888                    # HTTP server
http.request.method == "GET"        # HTTP GET requests
http.response.code == 200           # Successful responses
tcp.flags.syn == 1                  # TCP SYN packets
```

---

## Extensions & Exercises

### 1. Multithreaded UDP Server

Current server handles one client at a time. Modify to handle multiple simultaneous clients:

```java
while (true) {
    DatagramPacket packet = new DatagramPacket(buf, buf.length);
    socket.receive(packet);
    
    // Spawn thread to handle this request
    new Thread(() -> {
        // Process and respond
        socket.send(packet);
    }).start();
}
```

### 2. HTTP Server Enhancements

- **POST support**: Handle form submissions
- **Keep-Alive**: Reuse connections (HTTP/1.1)
- **Multithreading**: Handle concurrent clients
- **Statistics**: Track requests per file, error rates
- **Logging**: Write access log to file
- **Virtual hosts**: Serve multiple domains
- **CGI support**: Execute server-side scripts

### 3. HTTP Client Features

- **Follow redirects**: Handle 301/302 responses
- **Persistent connections**: Reuse socket
- **Download progress**: Show bytes received
- **Timeout handling**: Don't wait forever
- **HTTPS support**: SSL/TLS connections

### 4. Protocol Implementation

Implement your own application protocol:

```
ECHO <message>          → Server echoes message
TIME                    → Server returns current time
CALC <expr>             → Server evaluates expression
QUIT                    → Close connection
```

---

## Key Takeaways

1. **UDP is simple** but unreliable - suitable for real-time apps
2. **TCP ensures delivery** at cost of complexity and overhead
3. **HTTP is text-based** - easy to debug with telnet/curl
4. **Socket programming abstracts** network details
5. **Buffering is important** - flush() output streams
6. **Error handling matters** - network operations can fail
7. **Resource management** - close sockets when done

---

## Files in This Directory

### Source Code (`src/`)
- `Client_UDP.java` - UDP client with GUI
- `Serveur_UDP.java` - UDP echo server
- `ServeurHttp.java` - HTTP file server
- `ClientHttp.java` - Simple HTTP client
- `UtilitaireRepartition.java` - GUI layout utility

### Resources
- `index.html` - Sample HTML file for HTTP server
- `tp2.pdf` - Assignment instructions

### Compilation & Execution

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

## Further Reading

- RFC 768 (UDP)
- RFC 793 (TCP)
- RFC 2616 (HTTP/1.1)
- Java Socket API documentation
- Wireshark User Guide
