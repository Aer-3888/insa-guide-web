---
title: "TP2 - Communication UDP & TCP en Java"
sidebar_position: 2
---

# TP2 - Communication UDP & TCP en Java

> D'apres les instructions de l'enseignant : S6/Reseaux/data/moodle/tp/TP2/README.md

Ce TP introduit la programmation socket en Java avec deux protocoles de transport :
- **UDP** (User Datagram Protocol) : sans connexion, rapide, non fiable.
- **TCP** (Transmission Control Protocol) : avec connexion, fiable, ordonne.

On construit un serveur echo UDP, un serveur HTTP basique en TCP, et un client HTTP.

---

## Partie 1 : Serveur echo UDP

### Exercice 1 : Implementer un serveur echo UDP qui ecoute sur le port 5674, recoit un datagramme et le renvoie a l'emetteur.

**Reponse :**

Le serveur UDP fonctionne en boucle : il attend un datagramme, puis le renvoie a l'emetteur. Il n'y a pas de connexion, chaque datagramme est independant.

#### Code complet : Serveur_UDP.java

```java
import java.net.*;
import java.io.*;

public class Serveur_UDP {
    private int port_number;
    private DatagramSocket sock;

    Serveur_UDP(int port_number, InetAddress ip) throws SocketException {
        // DatagramSocket(port) cree un socket UDP et le lie au port
        // sur toutes les interfaces (0.0.0.0)
        this.sock = new DatagramSocket(port_number);
        System.out.println("UDP Server listening on port " + port_number);
    }

    void runtime() {
        // Buffer de 256 octets pour les donnees entrantes
        byte[] recvBuf = new byte[256];
        // DatagramPacket contient les donnees + metadonnees (IP/port emetteur)
        DatagramPacket message = new DatagramPacket(recvBuf, 256);

        while (true) {
            try {
                // Bloque jusqu'a reception d'un datagramme
                // Remplit message.getData(), message.getAddress(), message.getPort()
                this.sock.receive(message);

                String data = new String(message.getData(), 0, message.getLength());
                System.out.println("Received from " +
                    message.getAddress() + ":" +
                    message.getPort() + " -> " + data);
            } catch (IOException e) {
                System.err.println("IOException when reading: " + e.getMessage());
                break;
            }

            try {
                // Renvoie le datagramme a l'emetteur (l'adresse est deja dans message)
                this.sock.send(message);
                System.out.println("Echoed back to client");
            } catch (IOException e) {
                System.err.println("IOException when sending back: " + e.getMessage());
                break;
            }
        }
    }

    public static void main(String[] argv) {
        final int DEFAULT_PORT = 5674;
        Serveur_UDP srv;
        try {
            srv = new Serveur_UDP(DEFAULT_PORT, null);
        } catch (SocketException e) {
            System.err.println("Failed to create UDP server: " + e.getMessage());
            return;
        }
        srv.runtime();
    }
}
```

### Exercice 2 : Implementer un client UDP avec une interface graphique (AWT) qui envoie un message et affiche la reponse.

**Reponse :**

Le client GUI permet de saisir le hostname et le port, puis envoie un datagramme et affiche la reponse.

#### Code complet : Client_UDP.java

```java
import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.net.*;

public class Client_UDP extends Frame implements ActionListener {
    private static final long serialVersionUID = 1L;

    GridBagLayout Disposition = new GridBagLayout();
    public Label Lab_Mess_recu = new Label(
        "(Tjrs rien ................................ )", Label.CENTER);
    Label Lab_Port       = new Label("Quel port interroger  ? ", Label.LEFT);
    Label Lab_Hote       = new Label("Quelle machine  ? ", Label.LEFT);
    Label l1             = new Label("Message recu :", Label.LEFT);
    Button Bouton_1      = new Button("Envoi message");
    Button Bouton_2      = new Button("Arret des clients UDP");
    TextField Champ_Hote = new TextField(24);
    TextField Champ_Port = new TextField(6);

    Client_UDP() {
        setLayout(Disposition);
        Lab_Port.setBackground(Color.yellow);
        UtilitaireRepartition.ajouter(this, Lab_Hote, 0, 5, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        UtilitaireRepartition.ajouter(this, Champ_Hote, 2, 5, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        Lab_Hote.setBackground(Color.yellow);
        UtilitaireRepartition.ajouter(this, Lab_Port, 0, 10, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        UtilitaireRepartition.ajouter(this, Champ_Port, 2, 10, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        UtilitaireRepartition.ajouter(this, l1, 0, 15, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        Lab_Mess_recu.setBackground(Color.white);
        UtilitaireRepartition.ajouter(this, Lab_Mess_recu, 2, 15, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        Bouton_1.setBackground(Color.yellow);
        UtilitaireRepartition.ajouter(this, Bouton_1, 0, 20, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);
        Bouton_2.setBackground(Color.pink);
        UtilitaireRepartition.ajouter(this, Bouton_2, 2, 20, 1, 1,
            GridBagConstraints.NONE, GridBagConstraints.WEST, 0, 0, 10, 10, 10, 10, 0, 0);

        Champ_Hote.addActionListener(this);
        Champ_Port.addActionListener(this);
        Bouton_1.addActionListener(this);
        Bouton_2.addActionListener(this);

        addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent we) { dispose(); }
        });
    }

    public void actionPerformed(ActionEvent event) {
        Object source = event.getSource();
        if (source == Bouton_1) {
            try {
                int Port = Integer.parseInt(Champ_Port.getText());
                String Hote = Champ_Hote.getText();
                Comm_UDP_1 Trans_UDP = new Comm_UDP_1(Port, this, Hote);
                Trans_UDP.run();
            } catch (NumberFormatException e) {
                System.out.println("Erreur port ou thread");
                e.printStackTrace();
            }
        }
        if (source == Bouton_2) {
            Lab_Mess_recu.setText(" ... RAZ faite ...");
        }
    }

    public static void main(String[] argv) {
        Client_UDP Mon_Client_UDP = new Client_UDP();
        Mon_Client_UDP.setSize(400, 350);
        Mon_Client_UDP.setVisible(true);
    }
}

class Comm_UDP_1 {
    int Port;
    String hote;
    Client_UDP client;

    public Comm_UDP_1(int Un_Port, Client_UDP c, String Un_Hote) {
        this.Port = Un_Port;
        this.client = c;
        this.hote = Un_Hote;
    }

    public void run() {
        DatagramPacket Message;
        byte[] sendBuf = new byte[256];
        sendBuf[4] = 0x74;  // Donnee de test (octet 't')
        DatagramSocket Socket_UDP;
        InetAddress Adresse_IP = null;

        try {
            Adresse_IP = InetAddress.getByName(hote);
        } catch (UnknownHostException e) {
            System.out.println("Erreur sur Adresse_IP");
            System.exit(1);
        }

        try {
            Socket_UDP = new DatagramSocket();
        } catch (IOException e) {
            System.out.println("Erreur sur DatagramSocket");
            return;
        }

        // Envoyer le datagramme
        Message = new DatagramPacket(sendBuf, 256, Adresse_IP, Port);
        try {
            Socket_UDP.send(Message);
        } catch (IOException e) {
            System.out.println("Emission ratee ...");
            e.printStackTrace();
            return;
        }
        System.out.println(Thread.currentThread().getName()
            + " : Emission vers " + Adresse_IP + ", port " + Port);

        // Recevoir la reponse echo
        Message = new DatagramPacket(sendBuf, 256);
        try {
            Socket_UDP.receive(Message);
        } catch (IOException e) {
            System.out.println("Erreur Socket_UDP.receive :");
            e.printStackTrace();
            return;
        }

        String received = new String(Message.getData());
        System.out.println(Thread.currentThread().getName() + " recu : " + received);
        client.Lab_Mess_recu.setText(received);
    }
}
```

#### Code complet : UtilitaireRepartition.java

```java
import java.awt.*;

class UtilitaireRepartition {
    static void ajouter(Container composant, Component sousComposant,
                        int x, int y, int largeur, int hauteur,
                        int typeElargissement, int typePosition,
                        int etalementHorizontal, int etalementVertical,
                        int espacementHaut, int espacementBas,
                        int espacementGauche, int espacementDroite,
                        double poidsHorizontal, double poidsVertical) {
        GridBagConstraints contraintes = new GridBagConstraints();
        contraintes.gridx = x;
        contraintes.gridy = y;
        contraintes.gridwidth = largeur;
        contraintes.gridheight = hauteur;
        contraintes.fill = typeElargissement;
        contraintes.anchor = typePosition;
        contraintes.ipadx = etalementHorizontal;
        contraintes.ipady = etalementVertical;
        if (espacementHaut + espacementBas + espacementGauche + espacementDroite > 0)
            contraintes.insets = new Insets(espacementHaut, espacementBas,
                                           espacementGauche, espacementDroite);
        contraintes.weightx = poidsHorizontal;
        contraintes.weighty = poidsVertical;
        ((GridBagLayout)composant.getLayout()).setConstraints(sousComposant, contraintes);
        composant.add(sousComposant);
    }
}
```

**Comment tester :**

```bash
# Terminal 1 : demarrer le serveur
javac Serveur_UDP.java
java Serveur_UDP
# Output: UDP Server listening on port 5674

# Terminal 2 : demarrer le client GUI
javac Client_UDP.java UtilitaireRepartition.java
java Client_UDP
# In the GUI window:
#   Machine: localhost
#   Port: 5674
#   Click "Envoi message"
#   -> The label displays the echoed response
```

### Exercice 3 : Capturer et analyser l'echange UDP dans Wireshark.

**Reponse :**

Filtre Wireshark : `udp.port == 5674`

```
N   Time   Source          Destination     Protocol  Info
1   0.000  127.0.0.1:54321 127.0.0.1:5674 UDP       256 bytes
2   0.001  127.0.0.1:5674  127.0.0.1:54321 UDP      256 bytes

Total: 2 packets. No handshake, no ACK.
```

Structure du paquet UDP :
```
Ethernet Header (14 bytes)
  Dst MAC | Src MAC | Type: 0x0800 (IPv4)

IP Header (20 bytes)
  Version: 4 | Protocol: 17 (UDP) | Src IP | Dst IP

UDP Header (8 bytes)
  Source Port | Destination Port | Length | Checksum

Data (variable)
  Application payload
```

Observations :
- Pas de handshake (pas de SYN/ACK)
- Un seul aller-retour (requete + echo)
- Le serveur est stateless : il ne memorise rien entre les datagrammes
- Si un paquet est perdu, pas de retransmission automatique

---

## Partie 2 : Serveur HTTP TCP

### Exercice 4 : Implementer un serveur HTTP qui ecoute sur le port 8888, parse les requetes GET et sert les fichiers depuis le repertoire courant.

**Reponse :**

Le serveur HTTP ecoute sur un port TCP, accepte les connexions, parse la requete "GET /fichier HTTP/1.0", et sert le fichier demande ou renvoie une erreur.

#### Code complet : ServeurHttp.java

```java
import java.net.*;
import java.io.*;
import java.util.*;

public class ServeurHttp {
    static String nomServeur = "-- Serveur HTTP Java --";
    static String entete = "";
    static String enteteReponse = "";
    static int port = 8888;
    static String racine = "./";

    static void usage() {
        message("Usage :\n java ServeurHttp [port]\n");
    }

    static void message(String msg) {
        System.err.println(msg);
    }

    static void erreur(String msg) {
        message("Erreur: " + msg);
    }

    static String date() {
        Date d = new Date();
        return d.toString();
    }

    static String erreur400() {
        String msg = null;
        msg += "HTTP/1.0 400 Bad Request\n";
        msg += "Date: " + date() + "\n";
        msg += "Server: " + entete + "\n";
        msg += "Content-type: text/html\n\n";
        msg += "<HEAD><TITLE>Mauvaise requete</TITLE></HEAD>\n";
        msg += "<BODY><H1>Mauvaise requete</H1>\n";
        msg += "Votre butineur a envoye une requete invalide.<P>\n</BODY>\n";
        return msg;
    }

    static String typeMime(String nom) {
        if (nom.matches(".*\\.html$"))
            return "text/html";
        if (nom.matches(".*\\.gz$"))
            return "application/gzip";
        else
            return "text/plain";
    }

    public static void main(String argv[]) {
        ServerSocket socket = null;
        PrintWriter out = null;
        BufferedReader in = null;

        if (argv.length == 1) {
            port = Integer.parseInt(argv[0]);
        } else if (argv.length >= 1)
            usage();

        try {
            socket = new ServerSocket(port);
        } catch (IOException e) {
            erreur("Impossible d'ouvrir le port " + port + ":" + e);
        }

        while (true) {
            Socket s = null;
            try { s = socket.accept(); } catch (IOException e) {
                erreur("accept " + e);
            }

            System.out.println("[" + date() + "] Connexion :"
                + s.getInetAddress().getHostName()
                + ":" + s.getPort() + " ("
                + s.getInetAddress().getHostAddress() + ") ");

            try {
                out = new PrintWriter(s.getOutputStream());
            } catch (IOException e) {
                erreur("Ecriture socket " + e);
            }

            try {
                in = new BufferedReader(new InputStreamReader(s.getInputStream()));
            } catch (IOException e) {
                erreur("Lecture socket " + e);
            }

            String requete = null;
            try { requete = in.readLine(); } catch (IOException e) {
                erreur("lecture " + e);
            }
            System.out.println(requete);

            // Parse: "GET /index.html HTTP/1.0"
            String reqHTTP[] = requete.split("\\s");
            String reponse = null;

            if (reqHTTP.length != 3) {
                reponse = erreur400();
                out.println(reponse); out.flush();
            } else {
                File fichier = new File(racine + reqHTTP[1]);
                if (!fichier.exists()) {
                    reponse = "HTTP/1.0 404 Not Found\n";
                    reponse += "Date: " + date() + "\n";
                    reponse += "Server: " + nomServeur + "\n";
                    reponse += "Content-type: text/html\n\n";
                    reponse += "<HEAD><TITLE>Fichier Non Trouve</TITLE></HEAD>\n\n";
                    reponse += "<BODY><H1>Fichier Non Trouve</H1>\n";
                    reponse += "La ressource <i>" + reqHTTP[1]
                        + "</i> n'est pas presente sur ce serveur.<P>\n\n</BODY>\n";
                    out.println(reponse); out.flush();
                } else {
                    reponse = "HTTP/1.0 200 OK\r\n";
                    reponse += "Date: " + date() + "\r\n";
                    reponse += "Server: " + nomServeur + "\r\n";
                    reponse += "Content-type: " + typeMime(reqHTTP[1]) + " \r\n\r\n";
                    out.println(reponse); out.flush();

                    FileInputStream f = null;
                    try { f = new FileInputStream(fichier); } catch (IOException e) {
                        erreur("lecture ressource " + e);
                        try { s.close(); } catch (IOException e2) {}
                        continue;
                    }
                    int lu = -1;
                    try { lu = f.read(); } catch (IOException e) {
                        erreur("lecture ressource " + e);
                        try { s.close(); } catch (IOException e2) {}
                        continue;
                    }
                    while (lu != -1) {
                        out.write(lu);
                        try { lu = f.read(); } catch (IOException e) {
                            erreur("lecture ressource " + e);
                        }
                    }
                    out.flush();
                }
            }

            try { s.close(); } catch (IOException e) {
                System.err.println("Impossible fermer la socket " + e);
            }
        }
    }
}
```

**Comment tester :**

```bash
# Compiler et lancer
javac ServeurHttp.java
java ServeurHttp          # port par defaut 8888
java ServeurHttp 9000     # port personnalise

# Tester avec un navigateur : http://localhost:8888/index.html
# Tester avec curl :
curl -v http://localhost:8888/index.html
```

Creer un fichier test `index.html` dans le repertoire de travail du serveur :
```html
<!DOCTYPE html>
<html>
<head><title>TP2 - Serveur HTTP Java</title></head>
<body>
    <h1>Bienvenue sur le serveur HTTP Java</h1>
    <p>Ce fichier est servi par ServeurHttp.java</p>
</body>
</html>
```

### Exercice 5 : Implementer un client HTTP qui envoie des requetes GET et affiche les reponses.

**Reponse :**

#### Code complet : ClientHttp.java

```java
import java.net.*;
import java.io.*;

public class ClientHttp {
    static String userAgent = "Simple ClientHttp";

    ClientHttp() {}

    static String makeRequest(String target) {
        String request = "GET /" + target + " HTTP/1.1\r\n";
        request += "\r\n";
        return request;
    }

    String get(String addr, int port, String target) {
        Socket sock = null;
        try {
            sock = new Socket(addr, port);
        } catch (IOException e) {
            System.out.println("Error connecting to " + addr + ":" + port);
            return "";
        }

        String request = ClientHttp.makeRequest(target);
        PrintWriter out = null;
        try {
            out = new PrintWriter(sock.getOutputStream());
        } catch (IOException e) {
            System.out.println("Error opening output stream");
        }
        System.out.println(request);
        out.println(request);
        out.flush();

        BufferedReader in = null;
        try {
            in = new BufferedReader(new InputStreamReader(sock.getInputStream()));
        } catch (IOException e) {
            System.out.println("IOException when opening input for response");
            return "";
        }

        String response = null;
        try {
            String buff = in.readLine();
            while (buff != null) {
                response += buff + "\n";
                buff = in.readLine();
            }
        } catch (IOException e) {
            System.out.println("IOException when reading");
            return response;
        }
        return response;
    }

    public static void main(String[] args) {
        String[] possible_targets = {
            "index.html",           // Should return 200 OK
            "Client_UDP.java",      // Should return 200 OK (if present)
            "ziuoaueyaizezuae"      // Should return 404 Not Found
        };
        ClientHttp clt = new ClientHttp();
        for (String target : possible_targets) {
            System.out.println(clt.get("127.0.0.1", 8888, target));
        }
    }
}
```

**Comment tester :**

```bash
# Terminal 1: start the HTTP server
javac ServeurHttp.java
java ServeurHttp

# Terminal 2: run the client
javac ClientHttp.java
java ClientHttp

# Expected output for index.html: HTTP/1.0 200 OK + file content
# Expected output for nonexistent: HTTP/1.0 404 Not Found
```

### Exercice 6 : Mesurer le temps de reponse pour 50 requetes.

**Reponse :**

```java
// Add to ClientHttp.main():
ClientHttp clt = new ClientHttp();
long start = System.currentTimeMillis();
for (int i = 0; i < 50; i++) {
    clt.get("127.0.0.1", 8888, "index.html");
}
long end = System.currentTimeMillis();
System.out.println("Total: " + (end - start) + " ms");
System.out.println("Average: " + (end - start) / 50.0 + " ms/request");
```

Observation : le serveur est sequentiel (un seul client a la fois). Avec 5 clients simultanes de 10 requetes chacun, le temps total est ~50 x temps_par_requete. Pour gerer la concurrence, il faudrait utiliser du multithreading (un thread par client) ou du NIO (non-blocking I/O).

### Exercice 7 : Comparer les echanges UDP et TCP dans Wireshark.

**Reponse :**

**Session UDP** (filtre `udp.port == 5674`) :
```
1. Client -> Server: UDP datagram with data
2. Server -> Client: UDP datagram with echo
Total: 2 packets
```

**Session TCP** (filtre `tcp.port == 8888`) :
```
 1. Client -> Server: SYN
 2. Server -> Client: SYN-ACK
 3. Client -> Server: ACK
 4. Client -> Server: PSH,ACK  "GET /index.html HTTP/1.1"
 5. Server -> Client: ACK
 6. Server -> Client: PSH,ACK  "HTTP/1.0 200 OK..." + file content
 7. Client -> Server: ACK
 8. Server -> Client: FIN,ACK
 9. Client -> Server: ACK
10. Client -> Server: FIN,ACK
11. Server -> Client: ACK
Total: ~11 packets
```

| Critere | UDP (echo) | TCP (HTTP) |
|---------|-----------|------------|
| Paquets pour 1 echange | 2 | ~11 |
| Handshake | Non | 3 paquets (SYN/SYN-ACK/ACK) |
| ACK | Non | Oui (pour chaque segment) |
| Terminaison | Aucune | 4 paquets (FIN/ACK x2) |
| Garantie de livraison | Non | Oui |
| Overhead en-tete | 8 octets (UDP) | 20+ octets (TCP) |

TCP est ~5x plus couteux en paquets pour la meme quantite de donnees utiles, mais garantit la fiabilite et l'ordre de livraison.
