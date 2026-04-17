---
title: "TP5 - Multicast Chat Application"
sidebar_position: 5
---

# TP5 - Multicast Chat Application

Advanced network programming: IP multicast, multithreading, and real-time communication.

## Objectives

- Understand IP multicast concepts
- Implement multicast socket programming in C
- Use POSIX threads (pthreads) for concurrent operations
- Build a real-time chat application
- Handle terminal I/O in raw mode

## Topics Covered

1. **IP Multicast** - Group communication protocol
2. **Multithreading** - Concurrent send/receive operations
3. **Terminal Control** - Raw mode for interactive input
4. **Chat Protocol** - Message formatting and display

---

## IP Multicast Concepts

### What is Multicast?

**Multicast** allows one-to-many communication:
- One sender, multiple receivers
- More efficient than unicast to each receiver
- Less overhead than broadcast

### Multicast Addresses

**IPv4 multicast range:** 224.0.0.0 to 239.255.255.255

| Range | Purpose |
|-------|---------|
| 224.0.0.0 - 224.0.0.255 | Local network (not routed) |
| 224.0.1.0 - 238.255.255.255 | Global multicast |
| 239.0.0.0 - 239.255.255.255 | Organization-local |

**Common addresses:**
- `224.0.0.1` - All hosts on this subnet
- `224.0.0.2` - All routers on this subnet
- `224.0.0.10` - Custom application (used in this TP)

### How It Works

1. **Sender** sends UDP packets to multicast group address
2. **Receivers** join the multicast group (subscribe)
3. **Network** delivers packets to all group members
4. **IGMP** (Internet Group Management Protocol) manages group membership

---

## Architecture Overview

### Application Design

```
┌─────────────────────────────────────┐
│      Main Thread (main)             │
│  - Initialize socket                │
│  - Join multicast group             │
│  - Spawn threads                    │
└────────┬─────────────────┬──────────┘
         │                 │
    ┌────▼────┐      ┌────▼────────┐
    │ Send    │      │ Receive     │
    │ Thread  │      │ Thread      │
    ├─────────┤      ├─────────────┤
    │ Read    │      │ recv()      │
    │ keyboard│      │ Parse       │
    │ Format  │      │ Display     │
    │ sendto()│      │ Redraw      │
    └─────────┘      └─────────────┘
```

### Thread Communication

- **Shared resource:** Input string (user typing)
- **Synchronization:** Mutex protects input string
- **Coordination:** Main thread waits for send thread to exit

---

## Implementation (main.c)

### 1. Command-Line Argument Parsing

**Usage:**
```bash
./chat ADDRESS PORT NAME
./chat 224.0.0.10 10000 Alice
```

**Argument structure:**
```c
typedef struct {
    bool help;
    bool version;
    char *address;  // Multicast group (e.g., 224.0.0.10)
    char *port;     // Port number (e.g., 10000)
    char *name;     // Username
} Args;
```

**Macro-based argument definition:**
```c
#define ARGS_FLAGS \
    FLAG(help, h, "show this help message and exit") \
    FLAG(version, v, "show program's version number and exit")

#define ARGS_PARAMS \
    PARAM(address, ADDRESS, "the multicast address to use") \
    PARAM(port, PORT, "the port to use") \
    PARAM(name, NAME, "the name of the user")
```

This allows generic parsing and help generation.

### 2. Socket Setup

```c
// Create UDP socket
const int sock = socket(AF_INET, SOCK_DGRAM, 0);
if (sock == -1) {
    error("failed to create socket: %s", strerror(errno));
}

// Join multicast group
const struct ip_mreq option = {
    .imr_multiaddr = { .s_addr = inet_addr(args.address) },
    .imr_interface = { .s_addr = INADDR_ANY },  // All interfaces
};

if (setsockopt(sock, IPPROTO_IP, IP_ADD_MEMBERSHIP,
               &option, sizeof(option)) == -1) {
    error("failed to set IP_ADD_MEMBERSHIP option: %s", strerror(errno));
}

// Enable address reuse (multiple programs on same machine)
const int opt = 1;
if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) == -1) {
    error("failed to set SO_REUSEADDR option: %s", strerror(errno));
}

// Bind to port (receive from multicast group)
const struct sockaddr_in server_addr = {
    .sin_family = AF_INET,
    .sin_port = htons(port),
    .sin_addr.s_addr = htonl(INADDR_ANY),  // Receive from any source
};

if (bind(sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1) {
    error("failed to bind socket: %s", strerror(errno));
}
```

### Key Socket Options

#### `IP_ADD_MEMBERSHIP`

Joins a multicast group:
```c
struct ip_mreq {
    struct in_addr imr_multiaddr;  // Multicast group address
    struct in_addr imr_interface;  // Local interface (INADDR_ANY = all)
};
```

#### `SO_REUSEADDR`

Allows multiple processes to bind to same port:
```c
int opt = 1;
setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
```

Essential for multicast - all receivers need same port.

#### Other Useful Options

```c
// Set TTL (Time To Live) - how many router hops
unsigned char ttl = 5;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));

// Enable loopback (receive own messages)
unsigned char loop = 1;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));

// Set outgoing interface
struct in_addr interface_addr;
interface_addr.s_addr = inet_addr("192.168.1.100");
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_IF, &interface_addr, sizeof(interface_addr));
```

### 3. Thread Structure

#### Input String (Shared State)

```c
typedef struct {
    size_t capacity;          // Buffer size
    size_t size;              // Current length
    char *string;             // Character buffer
    pthread_mutex_t mutex;    // Protects concurrent access
} InputString;
```

**Operations:**
```c
// Initialize
InputString *input_string_init(void) {
    InputString *self = safe_malloc(sizeof(*self));
    self->capacity = 2;
    self->size = 0;
    self->string = safe_malloc(self->capacity);
    pthread_mutex_init(&self->mutex, NULL);
    return self;
}

// Append character (grows buffer if needed)
void input_string_append(InputString *self, const char chr) {
    if (self->size == self->capacity) {
        self->capacity *= 2;
        self->string = realloc(self->string, self->capacity);
    }
    self->string[self->size++] = chr;
}

// Clear
void input_string_clear(InputString *self) {
    self->size = 0;
}

// Display with prompt
void input_string_draw(InputString *self) {
    lock_mutex(&self->mutex);
    printf(CLEAR_LINE "❯ ");
    fwrite(self->string, self->size, 1, stdout);
    fflush(stdout);
    unlock_mutex(&self->mutex);
}
```

#### Send Thread

```c
typedef struct {
    int sock;
    int port;
    const char *username;
    const char *address;         // Multicast group
    InputString *input_string;
} SendMessagesThread;

static void *send_messages_thread(void *data) {
    const SendMessagesThread *thread = data;
    
    // Setup destination address (multicast group)
    struct sockaddr_in destination_address = {
        .sin_family = AF_INET,
        .sin_port = htons(thread->port),
    };
    inet_pton(AF_INET, thread->address, &destination_address.sin_addr);
    
    // Enable terminal raw mode (read char by char)
    terminal_enable_raw_mode();
    atexit(terminal_disable_raw_mode);
    
    while (true) {
        input_string_draw(thread->input_string);
        
        // Read one character
        char input_char = fgetc(stdin);
        
        if (input_char == EOF || input_char == 4) break;  // Ctrl+D
        
        if (input_char == 127) {  // Backspace
            lock_mutex(&thread->input_string->mutex);
            if (thread->input_string->size) 
                --thread->input_string->size;
            unlock_mutex(&thread->input_string->mutex);
            continue;
        }
        
        if (input_char == 12) {  // Ctrl+L (clear screen)
            printf("\033[H\033[J");
            continue;
        }
        
        if (input_char == '\n') {  // Enter - send message
            if (thread->input_string->size) {
                lock_mutex(&thread->input_string->mutex);
                
                // Format message: "username@message content"
                const size_t message_length = 
                    1 + strlen(thread->username) + 
                    thread->input_string->size;
                char *message = malloc(message_length);
                
                snprintf(message, message_length, "%s@%s", 
                        thread->username, 
                        thread->input_string->string);
                
                input_string_clear(thread->input_string);
                unlock_mutex(&thread->input_string->mutex);
                
                // Send to multicast group
                if (sendto(thread->sock, message, message_length, 0,
                          (struct sockaddr*)&destination_address,
                          sizeof(destination_address)) == -1) {
                    error("failed to send message: %s", strerror(errno));
                }
                
                free(message);
            }
            continue;
        }
        
        // Regular character - append to input string
        lock_mutex(&thread->input_string->mutex);
        input_string_append(thread->input_string, input_char);
        unlock_mutex(&thread->input_string->mutex);
    }
    
    return NULL;
}
```

#### Receive Thread

```c
typedef struct {
    int sock;
    InputString *input_string;
} ReceiveMessagesThread;

static void *receive_messages_thread(void *data) {
    ReceiveMessagesThread *thread = data;
    
    while (true) {
        char buffer[2048];
        memset(buffer, 0, sizeof(buffer));
        
        // Receive multicast message
        const ssize_t message_size = recv(thread->sock, &buffer, 
                                         sizeof(buffer), 0);
        if (message_size == 0) continue;
        
        // Parse and display message
        print_message(buffer, strlen(buffer), thread->input_string);
    }
    
    return NULL;
}
```

#### Message Display

```c
static void print_message(char *message, const size_t message_length,
                          InputString *input_string) {
    if (message_length == 0) return;
    
    // Clear current line
    printf(CLEAR_LINE);
    
    // Parse message format: "username@content"
    char *at = strchr(message, '@');
    if (at != NULL) {
        *at = '\0';
        const char *name = message;
        const char *message_content = at + 1;
        
        // Get current time
        const time_t now = time(NULL);
        const struct tm *t = localtime(&now);
        
        // Display: "HH:MM: username: message"
        printf("%02d:%02d: %s: %s", t->tm_hour, t->tm_min, 
               name, message_content);
    } else {
        printf("invalid message received: %s", message);
    }
    
    if (message[message_length - 1] != '\n') {
        putc('\n', stdout);
    }
    
    // Redraw input prompt
    input_string_draw(input_string);
}
```

### 4. Terminal Raw Mode

Normal terminal is **line-buffered** - input not available until Enter pressed.

**Raw mode** allows character-by-character input:

```c
static void terminal_enable_raw_mode() {
    struct termios terminal;
    tcgetattr(STDIN_FILENO, &terminal);
    
    // Disable canonical mode and echo
    terminal.c_lflag &= ~(ICANON | ECHO);
    
    tcsetattr(STDIN_FILENO, TCSANOW, &terminal);
}

static void terminal_disable_raw_mode() {
    struct termios terminal;
    tcgetattr(STDIN_FILENO, &terminal);
    
    // Re-enable canonical mode and echo
    terminal.c_lflag |= (ICANON | ECHO);
    
    tcsetattr(STDIN_FILENO, TCSANOW, &terminal);
}
```

**Why needed:** To show prompt with user typing in real-time while receiving messages.

### 5. Thread Management

```c
int main(const int argc, char *argv[]) {
    // ... parse args, setup socket ...
    
    InputString *input_string = input_string_init();
    
    // Create receive thread
    pthread_t receive_messages;
    ReceiveMessagesThread receive_data = {
        .sock = sock,
        .input_string = input_string,
    };
    pthread_create(&receive_messages, NULL, 
                   receive_messages_thread, &receive_data);
    
    // Create send thread
    pthread_t send_messages;
    SendMessagesThread send_data = {
        .sock = sock,
        .port = port,
        .address = args.address,
        .username = args.name,
        .input_string = input_string,
    };
    pthread_create(&send_messages, NULL, 
                   send_messages_thread, &send_data);
    
    // Wait for send thread (blocks until user exits)
    pthread_join(send_messages, NULL);
    
    // Cancel and cleanup receive thread
    pthread_cancel(receive_messages);
    pthread_join(receive_messages, NULL);
    
    // Cleanup
    input_string_destroy(input_string);
    close(sock);
    
    return EXIT_SUCCESS;
}
```

---

## Compilation & Running

### Compile

```bash
gcc -pthread -o chat main.c
# -pthread: Link pthread library
```

### Run Multiple Instances

```bash
# Terminal 1
./chat 224.0.0.10 10000 Alice

# Terminal 2
./chat 224.0.0.10 10000 Bob

# Terminal 3
./chat 224.0.0.10 10000 Charlie
```

### Usage

Type message and press Enter to send.

**Special keys:**
- `Ctrl+D` or `Ctrl+C` - Exit
- `Backspace` / `Delete` - Delete character
- `Ctrl+L` - Clear screen

**Example chat:**
```
❯ Hello everyone!
10:30: Alice: Hello everyone!
10:30: Bob: Hi Alice!
❯ How are you?
10:31: Alice: How are you?
10:31: Charlie: Good, thanks!
```

---

## Message Protocol

### Format

```
<username>@<message content>
```

### Examples

```
Alice@Hello world
Bob@How is everyone?
Charlie@I'm good!
```

### Why @ Separator?

- Simple to parse with `strchr()`
- Unlikely in usernames
- Clear delimiter in debugging

### Improvements

**JSON format:**
```json
{
  "user": "Alice",
  "message": "Hello world",
  "timestamp": 1234567890
}
```

**Binary format:**
```c
struct Message {
    uint32_t timestamp;
    uint8_t username_len;
    char username[32];
    uint16_t message_len;
    char message[256];
};
```

---

## Multicast vs Other Approaches

### Unicast (One-to-One)

```
Sender → Receiver 1
Sender → Receiver 2
Sender → Receiver 3
```

**Cost:** N messages for N receivers

### Broadcast (One-to-All)

```
Sender → [All hosts on network]
```

**Issues:**
- Floods network
- All hosts process packet (even if not interested)
- Not routable

### Multicast (One-to-Many)

```
Sender → [Multicast Group] → Receivers (who joined group)
```

**Benefits:**
- Single packet to multiple receivers
- Only interested hosts receive
- Routable (with proper configuration)

---

## Network Analysis

### Wireshark Capture

**Filter:** `ip.dst == 224.0.0.10`

**Packet structure:**
```
Ethernet Header
├─ Destination MAC: 01:00:5E:00:00:0A (multicast MAC)
└─ Source MAC: <sender MAC>

IP Header
├─ Source IP: <sender IP>
├─ Destination IP: 224.0.0.10 (multicast group)
└─ Protocol: 17 (UDP)

UDP Header
├─ Source Port: <ephemeral>
├─ Destination Port: 10000
└─ Length: <data length>

Data
└─ "Alice@Hello world"
```

### Multicast MAC Address

Multicast IP maps to Ethernet multicast MAC:
```
224.0.0.10
→ 01:00:5E:00:00:0A
```

Formula: `01:00:5E:<last 23 bits of IP>`

---

## Synchronization with Mutexes

### Why Needed?

**Problem:** Both threads access `input_string`:
- Send thread reads/modifies (user typing)
- Receive thread displays messages → redraws prompt → reads `input_string`

Without synchronization: **race condition** → corruption/crashes.

### Solution: Mutex

```c
pthread_mutex_t mutex;

// Initialize
pthread_mutex_init(&mutex, NULL);

// Critical section
pthread_mutex_lock(&mutex);
// ... access shared data ...
pthread_mutex_unlock(&mutex);

// Cleanup
pthread_mutex_destroy(&mutex);
```

### In Our Code

Every `input_string` access is protected:

```c
// Append character
lock_mutex(&self->mutex);
input_string_append(thread->input_string, input_char);
unlock_mutex(&self->mutex);

// Display
lock_mutex(&self->mutex);
printf(CLEAR_LINE "❯ ");
fwrite(self->string, self->size, 1, stdout);
unlock_mutex(&self->mutex);
```

---

## Advanced Features

### 1. Private Messages

```
/msg Bob Hello Bob!
```

Implementation:
- Parse `/msg <user> <message>`
- Send unicast UDP to specific user
- Requires tracking user IPs (discovery protocol needed)

### 2. User Join/Leave Notifications

```
Charlie joined the chat
Bob left the chat
```

Implementation:
- Send special message on join: `@JOIN@Charlie`
- Send on leave: `@LEAVE@Bob`
- Track active users in each client

### 3. Message History

Save messages to file:
```c
FILE *log = fopen("chat.log", "a");
fprintf(log, "[%s] %s: %s\n", timestamp, username, message);
fclose(log);
```

### 4. Encryption

Encrypt messages with symmetric key:
```c
// Pseudo-code
encrypted = encrypt_aes(message, shared_key);
sendto(sock, encrypted, len, ...);

decrypted = decrypt_aes(received, shared_key);
```

### 5. File Transfer

Send file through multicast:
```
Alice@FILE:image.jpg:12345  (announce file, size)
Alice@CHUNK:0:...binary...  (send chunks)
Alice@CHUNK:1:...binary...
...
Alice@DONE:image.jpg        (transfer complete)
```

Receivers reassemble chunks.

---

## Troubleshooting

### Messages not received

**Check:**
1. Multicast address correct? (224.0.0.x)
2. Port correct on all instances?
3. Firewall blocking?
4. Joined multicast group?

```bash
# Check multicast membership (Linux)
netstat -g

# Test with netcat (if available)
nc -u 224.0.0.10 10000
```

### Own messages not visible

**Cause:** Multicast loopback disabled

**Solution:** Enable loopback:
```c
unsigned char loop = 1;
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_LOOP, &loop, sizeof(loop));
```

### Messages only on local machine

**Cause:** TTL = 0 (default)

**Solution:** Increase TTL:
```c
unsigned char ttl = 5;  // Up to 5 router hops
setsockopt(sock, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl));
```

### Terminal messed up after exit

**Cause:** Raw mode not restored

**Solution:** Ensure cleanup with `atexit()`:
```c
atexit(terminal_disable_raw_mode);
```

Or manually:
```bash
reset  # Reset terminal
```

---

## Key Takeaways

1. **Multicast = efficient one-to-many** communication
2. **IP_ADD_MEMBERSHIP** joins multicast group
3. **SO_REUSEADDR** allows multiple receivers on same port
4. **Pthreads** enable concurrent operations
5. **Mutexes** protect shared data from race conditions
6. **Raw terminal mode** for character-by-character input
7. **Message protocol** defines application behavior
8. **sendto()** for multicast (destination = group address)
9. **recv()** receives from any group member

---

## Files in This Directory

### Source Code (`src/`)
- `main.c` - Complete multicast chat implementation

### Documentation
- `tp5.pdf` - Assignment instructions

### Compilation

```bash
gcc -pthread -o chat main.c -Wall -Wextra
./chat 224.0.0.10 10000 YourName
```

---

## Further Reading

- RFC 1112 (IP Multicast)
- RFC 2236 (IGMP v2)
- RFC 3376 (IGMP v3)
- POSIX Threads Programming (pthreads)
- `man 7 ip` - IP socket options
- `man pthread_create`, `man pthread_mutex_lock`
- Terminal control (`man termios`)

---

## Comparison with Modern Chat Apps

This TP demonstrates core concepts used in real-time applications:

| Concept | Our Implementation | Industry (e.g., Slack, Discord) |
|---------|-------------------|-------------------------------|
| Group communication | IP multicast | Pub/Sub (Redis, Kafka) |
| Real-time | UDP multicast | WebSocket over TCP |
| Message format | Text: `user@msg` | JSON or Protocol Buffers |
| Delivery | Best-effort UDP | Reliable (TCP + ACKs) |
| Persistence | None | Database storage |
| Scalability | Local network | Cloud infrastructure |
| Security | None | TLS, authentication, encryption |

Despite simplicity, our chat demonstrates fundamental principles applicable to production systems.
