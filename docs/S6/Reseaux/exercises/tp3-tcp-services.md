---
title: "TP3 - TCP Services in Java"
sidebar_position: 3
---

# TP3 - TCP Services in Java

> Following teacher instructions from: S6/Reseaux/data/moodle/tp/TP3/README.md

Ce TP construit deux services TCP interactifs en Java :
1. **Service Majuscule** (ServeurMajuscule) : le client envoie du texte, le serveur repond en majuscules.
2. **Plus ou Moins** (ServeurPlusMoins) : le serveur choisit un nombre aleatoire, le client doit le deviner.

---

## Part 1: Uppercase Service (ServeurMajuscule)

### Exercise 1: Write a TCP server that accepts connections, sends a welcome message, then converts each received line to uppercase. The client sends "." to terminate.

**Answer:**

Protocol:
```
Server -> Client: "Hello. Please behave."
Client -> Server: "hello world"
Server -> Client: "HELLO WORLD"
Client -> Server: "bonjour"
Server -> Client: "BONJOUR"
Client -> Server: "."
[Connection closes]
```

#### Complete code: ServeurMajuscule.java

```java
import java.net.*;
import java.io.*;

public class ServeurMajuscule {
    ServerSocket sock = null;
    Integer port = null;

    public ServeurMajuscule(int port) {
        this.port = port;
        try {
            this.sock = new ServerSocket(this.port);
        } catch (IOException e) {
            System.out.println("Error opening service socket.");
        }
    }

    public void runtime() {
        PrintWriter out = null;
        BufferedReader in = null;
        Socket cs = null;

        while (true) {
            // Accept a client connection (blocks until client connects)
            try {
                cs = this.sock.accept();
            } catch (IOException e) {
                System.out.println("Error opening client communication.");
                continue;
            }

            // Setup output stream with auto-flush (true = flush on println)
            try {
                out = new PrintWriter(cs.getOutputStream(), true);
            } catch (IOException e) {
                System.out.println("Error opening output stream.");
                continue;
            }

            // Setup input stream (BufferedReader for line-by-line reading)
            try {
                in = new BufferedReader(new InputStreamReader(cs.getInputStream()));
            } catch (IOException e) {
                System.out.println("Error opening input stream");
                continue;
            }

            // Send welcome message
            out.println("Hello. Please behave.");

            // Processing loop
            String line = null;
            while (true) {
                try {
                    line = in.readLine();
                } catch (IOException e) {
                    System.out.println("Hmm, error.");
                    break;
                }
                System.out.println("'" + line + "'");

                // Check for termination: null (client disconnected) or "."
                if (line == null || line.equals("."))
                    break;

                // Convert to uppercase and send back
                out.println(line.toUpperCase());
            }

            // Close client connection (ServerSocket stays open)
            try {
                cs.close();
            } catch (IOException e) {
                System.out.println("Error closing socket service.");
                continue;
            }
        }
    }

    public static void main(String[] args) {
        ServeurMajuscule poss = new ServeurMajuscule(8987);
        poss.runtime();
    }
}
```

### Exercise 2: Write a TCP client for the uppercase service.

**Answer:**

#### Complete code: ClientMajuscule.java

```java
import java.net.*;
import java.io.*;

public class ClientMajuscule {
    Socket sock = null;
    boolean ready = false;
    BufferedReader in = null;
    PrintWriter out = null;

    public ClientMajuscule(String addr, int port) {
        try {
            this.sock = new Socket(addr, port);
        } catch (IOException e) {
            System.out.println("Error opening socket to " + addr + ":" + port);
            return;
        }

        try {
            this.in = new BufferedReader(new InputStreamReader(this.sock.getInputStream()));
        } catch (IOException e) {
            System.out.println("Error opening input stream.");
            return;
        }
        try {
            this.out = new PrintWriter(this.sock.getOutputStream(), true);
        } catch (IOException e) {
            System.out.println("Error opening output stream.");
            return;
        }

        // Read and consume the welcome message
        try {
            this.in.readLine();
        } catch (IOException e) {
            System.out.println("Error reading modality line");
            return;
        }
        this.ready = true;
    }

    public boolean isReader() {
        return this.ready;
    }

    public String toUpp(String s) {
        this.out.println(s);
        String line = null;
        try {
            line = this.in.readLine();
        } catch (IOException e) {
            return "";
        }
        return line;
    }

    public void terminate() {
        this.out.println(".");
    }

    public static void main(String[] argv) {
        int port = 8988;
        if (argv.length > 1) {
            try {
                port = Integer.parseInt(argv[1]);
            } catch (NumberFormatException e) {
                System.out.println("Invalid port number.");
                return;
            }
        }

        ClientMajuscule cl = new ClientMajuscule("127.0.0.1", port);
        for (int scan = 0; scan < argv.length; scan++)
            System.out.println(cl.toUpp(argv[scan]));
        cl.terminate();
    }
}
```

**How to test:**

```bash
# Terminal 1: start the server
javac ServeurMajuscule.java
java ServeurMajuscule
# Server waits on port 8987...

# Terminal 2: run the client with command-line arguments
javac ClientMajuscule.java
java ClientMajuscule hello world
# Output:
# HELLO
# WORLD

# Or test with netcat (no Java client needed):
nc localhost 8987
Hello. Please behave.
hello world
HELLO WORLD
bonjour a tous
BONJOUR A TOUS
.
# (connection closed)
```

**Expected Wireshark capture** (filter `tcp.port == 8987`):
```
 1  Client -> Server      SYN
 2  Server -> Client      SYN,ACK
 3  Client -> Server      ACK
 4  Server -> Client      PSH,ACK     "Hello. Please behave.\n"
 5  Client -> Server      ACK
 6  Client -> Server      PSH,ACK     "hello world\n"
 7  Server -> Client      ACK
 8  Server -> Client      PSH,ACK     "HELLO WORLD\n"
 9  Client -> Server      ACK
10  Client -> Server      PSH,ACK     ".\n"
11  Server -> Client      ACK
12  Client -> Server      FIN,ACK
13  Server -> Client      FIN,ACK
14  Client -> Server      ACK
```

---

## Part 2: Guessing Game (Plus ou Moins)

### Exercise 3: Write a TCP server that picks a random number (0 to 65534) and responds to guesses with +, -, = or ~.

**Answer:**

Protocol:
```
Server picks random number (0 to 65534)
Server -> Client: "Hello. Please behave."

Client -> Server: "50000"
Server -> Client: "+"     (too low, go higher)

Client -> Server: "abc"
Server -> Client: "~"     (invalid input)

Client -> Server: "42735"
Server -> Client: "="     (correct!)
[Connection closes]
```

Response codes:

| Code | Meaning |
|------|---------|
| `+` | The target number is HIGHER than the guess |
| `-` | The target number is LOWER than the guess |
| `=` | Correct, the number has been found |
| `~` | Invalid input (not a number) |

#### Complete code: ServeurPlusMoins.java

```java
import java.net.*;
import java.io.*;
import java.util.Random;

public class ServeurPlusMoins {
    ServerSocket sock = null;
    Integer port = null;

    public ServeurPlusMoins(int port) {
        this.port = port;
        try {
            this.sock = new ServerSocket(this.port);
        } catch (IOException e) {
            System.out.println("Error opening service socket.");
        }
    }

    public void runtime() {
        PrintWriter out = null;
        BufferedReader in = null;
        Socket cs = null;
        Random rand = new Random();

        while (true) {
            try {
                cs = this.sock.accept();
            } catch (IOException e) {
                System.out.println("Error opening client communication.");
                continue;
            }

            try {
                out = new PrintWriter(cs.getOutputStream(), true);
            } catch (IOException e) {
                System.out.println("Error opening output stream.");
                continue;
            }
            try {
                in = new BufferedReader(new InputStreamReader(cs.getInputStream()));
            } catch (IOException e) {
                System.out.println("Error opening input stream");
                continue;
            }

            // Send welcome message
            out.println("Hello. Please behave.");

            // Pick random number between 0 and 65534
            int to_be_guessed = rand.nextInt(65535);
            System.out.println("Guess " + to_be_guessed);

            // Game loop
            String line = null;
            while (true) {
                try {
                    line = in.readLine();
                } catch (IOException e) {
                    System.out.println("Hmm, error.");
                    break;
                }
                System.out.println("'" + line + "'");

                if (line == null || line.equals("."))
                    break;

                int guess = 0;
                String response = new String();
                try {
                    guess = Integer.parseInt(line);
                    if (guess < to_be_guessed) {
                        response = "+";
                    } else if (guess > to_be_guessed) {
                        response = "-";
                    } else {
                        response = "=";
                    }
                } catch (NumberFormatException e) {
                    System.out.println("Encoding error: " + e);
                    response = "~";
                }

                out.println(response);

                // Note: use .equals() not == for String comparison
                if (response.equals("="))
                    break;
            }

            try {
                cs.close();
            } catch (IOException e) {
                System.out.println("Error closing socket service.");
                continue;
            }
        }
    }

    public static void main(String[] args) {
        ServeurPlusMoins poss = new ServeurPlusMoins(8988);
        poss.runtime();
    }
}
```

### Exercise 4: Write an interactive TCP client for the guessing game.

**Answer:**

#### Complete code: ClientPlusMoins.java

```java
import java.net.*;
import java.io.*;

public class ClientPlusMoins {
    Socket sock = null;
    boolean ready = false;
    BufferedReader in = null;
    PrintWriter out = null;

    public ClientPlusMoins(String addr, int port) {
        try {
            this.sock = new Socket(addr, port);
        } catch (IOException e) {
            System.out.println("Error opening socket to " + addr + ":" + port);
            return;
        }

        try {
            this.in = new BufferedReader(new InputStreamReader(this.sock.getInputStream()));
        } catch (IOException e) {
            System.out.println("Error opening input stream.");
            return;
        }
        try {
            this.out = new PrintWriter(this.sock.getOutputStream(), true);
        } catch (IOException e) {
            System.out.println("Error opening output stream.");
            return;
        }

        // Read welcome message
        try {
            this.in.readLine();
        } catch (IOException e) {
            System.out.println("Error reading modality line");
            return;
        }
        this.ready = true;
    }

    public void runtime() {
        BufferedReader keyboard = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            String line = null;
            try {
                line = keyboard.readLine();
            } catch (IOException e) {
                System.out.println("Error reading from keyboard");
                break;
            }
            if (line == null) {
                System.out.println("There was a reading error.");
                break;
            }

            // Send guess to server
            this.out.println(line);

            // Read server response
            String response = null;
            try {
                response = this.in.readLine();
            } catch (IOException e) {
                System.out.println("An error occurred while reading from the server.");
                break;
            }
            if (response == null) {
                System.out.println("Error during reading from server");
                break;
            }

            switch (response) {
                case "+": { System.out.println("It's higher"); break; }
                case "-": { System.out.println("It's lower"); break; }
                case "~": { System.out.println("...what?"); break; }
                case "=": { System.out.println("It's the answer!"); return; }
            }
        }
    }

    public void terminate() {
        this.out.println(".");
    }

    public static void main(String[] argv) {
        int port = 8988;
        if (argv.length >= 1) {
            try {
                port = Integer.parseInt(argv[0]);
            } catch (NumberFormatException e) {
                System.out.println("Invalid port number");
                return;
            }
        }

        ClientPlusMoins cl = new ClientPlusMoins("127.0.0.1", port);
        cl.runtime();
        cl.terminate();
    }
}
```

**How to test:**

```bash
# Terminal 1: start the server
javac ServeurPlusMoins.java
java ServeurPlusMoins
# Output: Guess 42735  (the server shows the secret number)

# Terminal 2: run the interactive client
javac ClientPlusMoins.java
java ClientPlusMoins
30000
It's higher
50000
It's lower
42000
It's higher
43000
It's lower
42735
It's the answer!

# Or test with netcat:
nc localhost 8988
Hello. Please behave.
50000
+
25000
-
42735
=
```

### Exercise 5: Implement a binary search strategy for the client (optimal play).

**Answer:**

The optimal strategy is binary search: each guess halves the search space. For a range of 0 to 65534, this takes at most ceil(log2(65535)) = 16 guesses.

```java
/**
 * Automated binary search client.
 * Finds any number in at most 16 guesses.
 */
public void binarySearchStrategy() {
    int low = 0, high = 65534;
    int attempts = 0;

    while (low <= high) {
        int guess = (low + high) / 2;
        attempts++;
        this.out.println(guess);

        String response = null;
        try {
            response = this.in.readLine();
        } catch (IOException e) {
            break;
        }

        System.out.println("Guess " + guess + " -> " + response);

        if (response.equals("=")) {
            System.out.println("Found in " + attempts + " attempts!");
            return;
        } else if (response.equals("+")) {
            low = guess + 1;   // Target is higher
        } else if (response.equals("-")) {
            high = guess - 1;  // Target is lower
        }
    }
}
```

Complexity: log2(65535) = 15.99, so at most **16 guesses** to find any number between 0 and 65534.

**Expected Wireshark capture** (filter `tcp.port == 8988`):
```
 1  Client -> Server      SYN
 2  Server -> Client      SYN,ACK
 3  Client -> Server      ACK
 4  Server -> Client      PSH,ACK     "Hello. Please behave.\n"
 5  Client -> Server      ACK
 6  Client -> Server      PSH,ACK     "32767\n"
 7  Server -> Client      ACK
 8  Server -> Client      PSH,ACK     "+\n"
 9  Client -> Server      ACK
    ... (more guesses)
N   Server -> Client      PSH,ACK     "=\n"
N+1 Client -> Server      FIN,ACK
N+2 Server -> Client      FIN,ACK
N+3 Client -> Server      ACK
```
