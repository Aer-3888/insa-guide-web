---
title: "Chapitre 7 : Securite Web"
sidebar_position: 7
---

# Chapitre 7 : Securite Web

## Table des matieres

1. [Routes publiques vs privees](#1-routes-publiques-vs-privees)
2. [Configuration Spring Security](#2-configuration-spring-security)
3. [Authentification et sessions](#3-authentification-et-sessions)
4. [Proteger les donnees utilisateur](#4-proteger-les-donnees-utilisateur)
5. [Failles de securite courantes](#5-failles-de-securite-courantes)
6. [Cheat Sheet](#6-cheat-sheet)

---

## 1. Routes publiques vs privees

```
Routes publiques  : /api/public/**  --> tout le monde peut y acceder
Routes privees    : /api/private/** --> authentification requise
Routes admin      : /api/admin/**   --> role ADMIN requis
```

### Principe

```
Client                                    Serveur
  |                                          |
  |-- GET /api/public/data ----------------->|  OK (200)
  |                                          |
  |-- GET /api/private/data ---------------->|  401 Unauthorized
  |                                          |  (pas de session)
  |                                          |
  |-- POST /api/public/login + body -------->|  200 OK
  |<------ Set-Cookie: JSESSIONID=abc -------|  (cookie de session)
  |                                          |
  |-- GET /api/private/data                  |
  |   Cookie: JSESSIONID=abc --------------->|  200 OK
  |                                          |  (session valide)
```

---

## 2. Configuration Spring Security

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            // .antMatchers("/api/admin/**").hasRole("ADMIN")  // (optionnel) routes admin
            .antMatchers("/api/public/**").permitAll()      // routes publiques
            .anyRequest().authenticated()                    // le reste = auth requise
            .and()
            .logout(logout -> logout.deleteCookies("JSESSIONID"))
            .csrf().disable();     // desactive CSRF pour simplifier
    }

    @Bean
    public PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsManager userDetailsManager() {
        return new InMemoryUserDetailsManager();
    }
}
```

---

## 3. Authentification et sessions

### Creation de compte

```java
@RestController
@RequestMapping("api/public/user")
public class PublicUserController {

    @PostMapping(value = "new", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void newAccount(@RequestBody final UserDTO user) {
        userService.newAccount(user.login(), user.pwd());
    }
}
```

### Connexion

```java
@PostMapping(value = "login", consumes = MediaType.APPLICATION_JSON_VALUE)
public void login(@RequestBody final UserDTO user) {
    boolean logged = userService.login(user.login(), user.pwd());
    // Si succes, Spring retourne automatiquement Set-Cookie: JSESSIONID=xxx
}
```

### Mecanisme de session

```
1. Connexion :
   Client --POST /login { "login":"a", "pwd":"p" }--> Serveur
   Client <--Set-Cookie: JSESSIONID=abc123----------- Serveur

2. Requetes suivantes :
   Client --GET /api/private/data
           Cookie: JSESSIONID=abc123 ----------------> Serveur
   Serveur verifie le JSESSIONID et identifie l'utilisateur

3. Deconnexion :
   Client --POST /logout -----------------------------> Serveur
   Le cookie JSESSIONID est supprime
```

---

## 4. Proteger les donnees utilisateur

### Utiliser Principal

```java
@RestController
@RequestMapping("api/private/todo")
public class PrivateTodoController {

    @DeleteMapping(path = "{id}")
    public void deleteTodo(@PathVariable("id") final long id,
                           final Principal user) {
        // Verifier que le todo appartient a l'utilisateur connecte
        if (!todoService.removeTodo(id, user.getName())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Not your todo");
        }
    }

    @GetMapping(path = "all", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<TodoDTO> getMyTodos(final Principal user) {
        // Retourner uniquement les todos de l'utilisateur connecte
        return todoService.getTodosByUser(user.getName());
    }
}
```

### Roles et droits

Pour le DS 2022-2023 (gestion des notes) :
- **Etudiant** : peut consulter uniquement SES copies
- **Enseignant** : peut consulter et modifier TOUTES les donnees

```java
// Dans SecurityConfig :
.antMatchers("/api/etudiant/**").hasRole("ETUDIANT")
.antMatchers("/api/enseignant/**").hasRole("ENSEIGNANT")

// Dans le controleur etudiant :
@GetMapping("copies")
public List<CopieDTO> mesCopies(final Principal user) {
    // Filtrer par l'etudiant connecte
    return service.getCopiesByEtudiant(user.getName());
}
```

---

## 5. Failles de securite courantes

### XSS (Cross-Site Scripting)

Injection de code JavaScript malveillant dans une page Web.

```html
<!-- DANGEREUX : ne jamais inserer du HTML non filtre -->
element.innerHTML = userInput;

<!-- SECURISE : textContent n'interprete pas le HTML -->
element.textContent = userInput;
```

### CSRF (Cross-Site Request Forgery)

Forcer le navigateur d'un utilisateur authentifie a envoyer une requete non voulue.

```
Protection : token CSRF dans chaque formulaire
Spring : csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
```

### SQL Injection

Injection de code SQL via les entrees utilisateur.

```java
// DANGEREUX : concatenation de string dans une requete SQL
"SELECT * FROM users WHERE name = '" + userInput + "'"

// SECURISE : requetes parametrees (JPA fait ca automatiquement)
@Query("SELECT u FROM User u WHERE u.name = :name")
```

### CORS (Cross-Origin Resource Sharing)

Controle quels domaines peuvent appeler l'API.

---

## 6. Cheat Sheet

```
Routes :
  /api/public/**  -> permitAll()
  /api/private/** -> authenticated()
  /api/admin/**   -> hasRole("ADMIN")

Authentification :
  POST /login + body JSON -> Set-Cookie: JSESSIONID=xxx
  Requetes suivantes : Cookie: JSESSIONID=xxx

Verification des droits :
  Principal user -> user.getName() = login de l'utilisateur connecte
  Verifier que les donnees appartiennent a l'utilisateur

Questions DS :
  "Comment ajouter l'authentification ?"
  1. SecurityConfig : routes publiques vs privees
  2. Route POST /login et POST /register (publiques)
  3. Routes privees : injecter Principal
  4. Verifier les droits dans chaque route privee

Failles :
  XSS -> textContent au lieu de innerHTML
  CSRF -> token CSRF
  SQL Injection -> requetes parametrees (JPA)
```
