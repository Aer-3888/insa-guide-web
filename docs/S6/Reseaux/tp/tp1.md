---
title: "TP1 - Network Discovery"
sidebar_position: 1
---

# TP1 - Network Discovery

Network fundamentals through command-line tools and packet analysis with Wireshark.

## Objectives

Learn to inspect and analyze network configuration, routing, and protocols at the packet level using Linux networking tools and Wireshark.

## Topics Covered

1. **IP & Ethernet** - Interface configuration and addressing
2. **ARP & ICMP** - Address resolution and ping analysis
3. **IP Fragmentation** - MTU and packet fragmentation
4. **Internet Services** - Port numbers and service mapping
5. **DNS** - Domain name resolution
6. **TCP & HTTP** - Connection establishment and data transfer

---

## Section 1: IP & Ethernet

### Commands
```bash
hostname                    # Machine name
ifconfig                    # Network interfaces (deprecated)
ip addr show               # Modern interface listing
ip route show              # Routing table
```

### Key Findings

**Q1: Machine identification**
- Hostname: Machine name on the network
- Interfaces: `lo` (loopback), `wlp3s0` (WiFi), `enp0s25` (Ethernet), `tun1` (VPN)
- IPv4 addresses: `127.0.0.1` (loopback), `192.168.x.x` (local network)
- IPv6 addresses: `::1` (loopback), link-local `fe80::/64`

**Q2: MTU (Maximum Transmission Unit)**
| Interface | MTU | Notes |
|-----------|-----|-------|
| lo | 65536 | Loopback - no fragmentation needed |
| enp0s25, wlp3s0 | 1500 | Standard Ethernet MTU |
| tun1 | 1420 | VPN tunnel - slightly smaller |

**Q3: Routing table**
```
# IPv4
default via 192.168.43.1 dev wlp3s0        # Default gateway
10.8.1.0/24 dev tun1                       # VPN network
192.168.43.0/24 dev wlp3s0                 # Local network

# IPv6
default dev tun1                           # VPN default route
fd11:1::/64 dev tun1                       # VPN IPv6 network
```

**Routing explanation:**
- Packets to local network go directly via `wlp3s0`
- All other traffic goes through default gateway or VPN tunnel
- VPN routes can override default routing for specific destinations

**Q4: Remote machine comparison**
Connected to VPS `vulpinecitrus.info` to compare network setup:
- More interfaces: `eth0` (public), `docker0`, `tun0`, multiple `veth*` (Docker containers)
- Public IPv4: `51.91.58.45`
- Public IPv6: `2001:41d0:305:2100::4547`
- Docker creates bridge networks for container isolation

---

## Section 2: ARP & ICMP Analysis

### ARP (Address Resolution Protocol)

**Purpose:** Map IP addresses to MAC addresses on local network.

**Q5: ARP table**
```bash
arp -a
```

Shows mappings like:
```
192.168.43.1    ether   0c:70:4a:f8:8a:47   C   wlp3s0
```

**Q7: ARP packet structure** (captured after clearing ARP cache)
```
Ethernet type: 0x0806 (ARP)
Hardware type: 1 (Ethernet)
Protocol type: 0x0800 (IPv4)
Hardware size: 6 (MAC address length)
Protocol size: 4 (IPv4 address length)
Opcode: 1 (request) / 2 (reply)
Sender MAC: 0c:70:4a:f8:8a:47
Sender IP: 192.168.43.1
Target MAC: 00:00:00:00:00:00 (broadcast for request)
Target IP: 192.168.43.251
```

**Process:**
1. Phone/AP asks: "Who has 192.168.43.251? Tell 192.168.43.1"
2. Laptop replies: "192.168.43.251 is at a4:4e:31:08:ac:84"

### ICMP (Internet Control Message Protocol)

**Q6: Ping analysis**
```bash
ping -c 4 1.1.1.1
```

Captured on VPN interface for cleaner traffic.

**ICMP Echo Request/Reply structure:**
```
Type: 8 (Echo Request) / 0 (Echo Reply)
Code: 0
Checksum: 2 bytes
Identifier: 2 bytes (BE and LE)
Sequence number: 2 bytes
Timestamp: 8 bytes
Data: 48 bytes (echoed back in reply)
```

**Key points:**
- ICMP is encapsulated in IP packets (IP protocol number: 1)
- Echo request/reply used by `ping` to test connectivity
- Round-trip time (RTT) measured between request and reply

---

## Section 3: IP Fragmentation

**Q14: Testing fragmentation**
```bash
ping -s 2000 1.1.1.1    # Packet size > MTU (1420)
```

**Q15: Fragment analysis in Wireshark**

First fragment:
```
Flags: More Fragments = 1
Fragment Offset: 0
Total Length: 1420
Identification: 0x1234 (same for all fragments)
```

Last fragment:
```
Flags: More Fragments = 0
Fragment Offset: 1400
Total Length: 628
Identification: 0x1234 (matches first fragment)
```

**Q16: Differences between fragments**
- Total length (1420 vs 628)
- More Fragments flag (1 vs 0)
- Fragment offset (0 vs 1400)
- Checksum (recalculated for each fragment)
- Same identification field to group fragments

**Why fragmentation happens:**
When packet size exceeds MTU, IP layer splits it into smaller fragments that fit within MTU. Receiving host reassembles using identification and offset fields.

---

## Section 4: Internet Services

**Q17: Service-to-port mapping**

File: `/etc/services`

Common services:
```
ftp         20/tcp, 21/tcp      # File Transfer Protocol
ssh         22/tcp              # Secure Shell
telnet      23/tcp              # Telnet
smtp        25/tcp              # Simple Mail Transfer
domain      53/udp, 53/tcp      # DNS
http        80/tcp              # World Wide Web
pop3        110/tcp             # Post Office Protocol v3
ntp         123/udp             # Network Time Protocol
imap        143/tcp             # Internet Message Access
https       443/tcp             # HTTP over TLS/SSL
```

**Q18: Active connections**
```bash
netstat -tuln    # Show TCP/UDP listening ports
netstat -tun     # Show established connections
```

Sample output shows:
- Many HTTPS connections (port 443) to various services
- HTTP connection (port 80) to package mirrors
- DHCP client on UDP bootpc port
- Connections in states: ESTABLISHED, TIME_WAIT

**Connection states:**
- ESTABLISHED: Active connection
- TIME_WAIT: Connection closed, waiting to ensure remote received FIN
- LISTEN: Server waiting for connections

---

## Section 5: DNS & Network Testing

**Q19: Ping tests to different locations**
```bash
ping google.com           # ~142ms, 0.8% loss
ping namibia-server.com   # ~283ms, 0% loss
ping victoria.ac.nz       # ~135ms, 1.2% loss
```

**Q20: Traceroute analysis**
```bash
traceroute google.com     # 11 hops through ISP to Google
traceroute namibia-site   # 22 hops via international backbone
traceroute victoria.ac.nz # 12 hops through CDN
```

**Insights:**
- More hops = longer latency (generally)
- Some hops don't respond (`* * *`) - firewalls blocking ICMP
- ISP routes through peering points (Cogent, etc.)
- CDNs reduce hops (New Zealand site actually served from Paris)

**Q21: DNS lookups**
```bash
nslookup www.free.fr
nslookup www.insa-rennes.fr
```

Results:
- `www.free.fr`: `212.27.48.10`, `2a01:e0c:1::1`
- `www.insa-rennes.fr`: `193.52.94.51` (no IPv6)

---

## Section 6: TCP & HTTP

**Q22-30: TCP handshake analysis**

Captured HTTPS connection to analyze TCP three-way handshake.

### Three-Way Handshake

**Packet 1: SYN**
```
Client → Server
Flags: SYN
Seq: 238730258 (random initial)
Ack: 0
Window: 64860
Options: MSS, SACK, timestamps, window scale
```

**Packet 2: SYN-ACK**
```
Server → Client
Flags: SYN, ACK
Seq: 1347695507 (server's random initial)
Ack: 238730259 (client seq + 1)
Window: 64296
```

**Packet 3: ACK**
```
Client → Server
Flags: ACK
Seq: 238730259
Ack: 1347695508 (server seq + 1)
Window: 64896
```

### Key Observations

**Q22:** HTTPS uses TCP port 443

**Q23:** TCP header is 32 bytes (20 base + 12 options)

**Q24:** Segment length = 0 for all handshake packets (no data, only control)

**Q25:** Wireshark shows relative sequence numbers starting at 0 for readability

**Q26:** Ethernet frame (not visible in VPN tunnel):
```
Src MAC: a4:4e:31:08:ac:84
Dst MAC: 0c:70:4a:f8:8a:47
Type: 0x0800 (IPv4)
```

**Q27:** MSS (Maximum Segment Size) = min(client window, server window) = 64296

**Q28:** Final ACK completes handshake with Seq=238730259, Ack=1347695508

**Q29:** Connection established, ready for data transfer

**Q30:** TCP ensures reliable, ordered delivery through:
- Sequence numbers (track byte order)
- Acknowledgments (confirm receipt)
- Retransmission on timeout
- Flow control via window size

---

## Tools & Commands Summary

| Tool | Purpose | Example |
|------|---------|---------|
| `hostname` | Machine name | `hostname` |
| `ip addr` | Interface info | `ip addr show wlp3s0` |
| `ip route` | Routing table | `ip route show` |
| `arp` | ARP cache | `arp -a` |
| `ping` | Test connectivity | `ping -c 4 google.com` |
| `traceroute` | Trace route | `traceroute google.com` |
| `netstat` | Connections | `netstat -tuln` |
| `nslookup` | DNS lookup | `nslookup google.com` |
| `dig` | DNS details | `dig google.com` |
| `wireshark` | Packet capture | Start GUI, select interface |

---

## Wireshark Filters

```
arp                         # ARP packets only
icmp                        # ICMP packets
tcp.flags.syn == 1          # TCP SYN packets
tcp.port == 443             # HTTPS traffic
ip.addr == 192.168.1.1      # Specific IP
tcp.stream eq 0             # Follow TCP stream
```

---

## Key Takeaways

1. **Layered architecture**: Each protocol layer adds its own header
2. **ARP is local**: Only works on same network segment
3. **ICMP for diagnostics**: Ping, traceroute rely on ICMP
4. **Fragmentation overhead**: Avoid when possible (Path MTU Discovery)
5. **TCP reliability**: Handshake, sequence numbers, ACKs ensure delivery
6. **Port numbers**: Identify specific services on a host
7. **Routing decisions**: Based on destination IP and routing table

---

## Further Exploration

- Capture DNS queries with Wireshark (UDP port 53)
- Analyze HTTP GET/POST requests (TCP port 80)
- Observe TCP retransmissions under packet loss
- Compare TCP window scaling with different servers
- Examine IPv6 Neighbor Discovery (replaces ARP for IPv6)

---

## Files in This Directory

- `CR.md` - Original lab report (French)
- `tp(11).pdf` - Assignment instructions
- `TP1_GONZALEZ.pdf` - Completed report
