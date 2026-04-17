---
title: "Chapitre 8 : Angular et TypeScript -- Le front-end moderne"
sidebar_position: 8
---

# Chapitre 8 : Angular et TypeScript -- Le front-end moderne

## Table des matieres

1. [TypeScript essentiel](#1-typescript-essentiel)
2. [Composants Angular](#2-composants-angular)
3. [Data binding](#3-data-binding)
4. [Directives structurelles](#4-directives-structurelles)
5. [Injection de dependances et services](#5-injection-de-dependances-et-services)
6. [Requetes HTTP (HttpClient)](#6-requetes-http-httpclient)
7. [Cycle de vie et acces au DOM](#7-cycle-de-vie-et-acces-au-dom)
8. [Routes Angular](#8-routes-angular)
9. [Pieges courants](#9-pieges-courants)
10. [Cheat Sheet](#10-cheat-sheet)

---

## 1. TypeScript essentiel

### Types de base

```typescript
let nom: string = "Alice";
let age: number = 22;
let actif: boolean = true;
let donnees: any = "n'importe quoi";   // a eviter

let valeur: string | number = "hello"; // union de types
valeur = 42;   // OK
```

### Interfaces (peuvent typer du JSON)

```typescript
export interface Personne {
    nom: string;
    age: number;
    adresses: string[];
}

// Assigner du JSON a une interface (sans new !)
const alice: Personne = { nom: "Alice", age: 22, adresses: ["Rennes"] };
```

### Classes TypeScript

```typescript
export class MaClasse {
    readonly id: number;
    private donnees: string[];

    // private dans le constructeur = declaration automatique d'attribut
    constructor(private router: Router, public nom: string) {
        this.id = 42;
        this.donnees = [];
    }
}
```

### Getter / Setter

```typescript
export class Data {
    private _valeur: string;

    public set valeur(v: string) { this._valeur = v; }
    public get valeur(): string { return this._valeur; }
}

const d = new Data();
d.valeur = "hello";       // appelle le setter
console.log(d.valeur);    // appelle le getter
```

---

## 2. Composants Angular

### Un composant = un dossier

```
mycomponent/
  |-- mycomponent.component.ts      (code TypeScript)
  |-- mycomponent.component.html    (template HTML)
  |-- mycomponent.component.css     (styles CSS)
```

### Le fichier TypeScript

```typescript
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    thetitle = 'app';
    score: number = 0;

    incrementer(): void { this.score++; }
}
```

### Le template HTML

```html
<main>
    <h1>{{thetitle}}</h1>
    <p>Score : {{score}}</p>
    <app-mycomponent></app-mycomponent>
    <router-outlet></router-outlet>
</main>
```

> Les proprietes et methodes utilisees dans le template doivent etre **public**.

---

## 3. Data binding

| Type | Syntaxe | Direction |
|------|---------|-----------|
| Interpolation | `{{ expr }}` | TS -> HTML |
| Property binding | `[prop]` | TS -> HTML |
| Event binding | `(event)` | HTML -> TS |
| Two-way binding | `[(ngModel)]` | TS <-> HTML |

### Exemples

```html
<!-- Interpolation : afficher un attribut -->
<p>{{score}}</p>

<!-- Property binding : lier un attribut HTML -->
<img [src]="player.avatarUrl"/>
<button [disabled]="!isReady">Jouer</button>

<!-- Event binding : lier un evenement -->
<button (click)="saveGame()">Sauvegarder</button>
<div (mousedown)="handleClick($event)">Zone</div>

<!-- Attribut dynamique -->
<div [attr.data-x]="x" [attr.data-y]="y"></div>
```

### Recuperer l'element dans le handler

```typescript
public handleClick(event: MouseEvent): void {
    const element = event.currentTarget as Element;
    const x = element.getAttribute('data-x');
}
```

---

## 4. Directives structurelles

### *ngIf : affichage conditionnel

```html
<p *ngIf="ok">Visible si ok est true</p>
<p *ngIf="isFinished()">Partie terminee</p>
```

### *ngFor : boucle

```html
<div *ngFor="let joueur of listeJoueurs">
    {{joueur.nom}} - {{joueur.score}}
</div>

<!-- Boucles imbriquees avec ng-container -->
<ng-container *ngFor="let y of [0,1,2,3,4,5]">
    <ng-container *ngFor="let x of [0,1,2,3,4,5]">
        <div class='tile' [attr.data-x]="x" [attr.data-y]="y"
             (click)="onTileClick($event)">
        </div>
    </ng-container>
</ng-container>
```

> `ng-container` : conteneur Angular invisible (pas de balise HTML dans le DOM).

---

## 5. Injection de dependances et services

### Creer un service

```typescript
@Injectable({ providedIn: 'root' })
export class GameService {
    private currentGame: Game;

    constructor() { this.currentGame = new Game(); }
    public getCurrentGame(): Game { return this.currentGame; }
}
```

### Injecter dans un composant

```typescript
export class FooComponent implements OnInit {
    constructor(
        private http: HttpClient,
        private router: Router,
        private gameService: GameService
    ) { }

    ngOnInit(): void {
        const game = this.gameService.getCurrentGame();
    }
}
```

---

## 6. Requetes HTTP (HttpClient)

### Configuration

```typescript
// Dans app.module.ts
@NgModule({
    imports: [ HttpClientModule ]
})
```

### GET

```typescript
this.http
    .get<Array<string>>('api/names')
    .subscribe(data => this.names = data);
```

### GET avec interface typee

```typescript
export interface Foo { attr1: string; attr2: number; }

this.http
    .get<Foo>(`api/foo/${value}`)
    .subscribe(data => this.foo = data);
```

### POST

```typescript
this.http
    .post('api/foo/', JSON.stringify(this.foo), {})
    .subscribe(returnedData => { });
```

### PUT et DELETE

```typescript
this.http.put(`api/item/${x}`, {}, {}).subscribe(data => { });
this.http.delete(`api/item/${id}`).subscribe(() => { });
```

### Promise (alternative)

```typescript
async chargerFoo(name: string): Promise<Foo> {
    return this.http.get<Foo>(`api/foo/${name}`).toPromise();
}
const foo = await this.chargerFoo("test");
```

> **subscribe est OBLIGATOIRE**. Sans subscribe, la requete n'est PAS envoyee.

---

## 7. Cycle de vie et acces au DOM

### Hooks du cycle de vie

```
constructor()        <-- injection de dependances
ngOnInit()           <-- initialisation (charger des donnees)
ngAfterViewInit()    <-- vue prete (DOM disponible)
ngOnDestroy()        <-- nettoyage
```

### @ViewChildren : acceder aux elements HTML

```html
<div #myobjects *ngFor="let x of [0,1,2,3,4,5]"></div>
```

```typescript
@ViewChildren('myobjects')
private myobjects: QueryList<ElementRef<HTMLDivElement>>;

ngAfterViewInit(): void {
    this.myobjects.forEach(ref => {
        console.log(ref.nativeElement);   // l'element HTML reel
    });
}
```

> Ne PAS acceder a @ViewChildren avant ngAfterViewInit.

---

## 8. Routes Angular

### Configuration

```typescript
const routes: Routes = [
    { path: '', component: AppComponent },
    { path: 'game', component: GameComponent },
    { path: 'menu', component: MenuComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
```

### Navigation

```html
<router-outlet></router-outlet>
<a routerLink="/game">Jouer</a>
```

```typescript
constructor(private router: Router) { }
naviguer(): void { this.router.navigate(['/game']); }
```

---

## 9. Pieges courants

1. **Oublier subscribe** : la requete HTTP n'est pas envoyee
2. **Acceder au DOM avant ngAfterViewInit** : les elements n'existent pas encore
3. **Proprietes privees dans le template** : erreur de compilation
4. **this dans arrow functions** : ne pointe pas vers l'objet
5. **Confondre nativeElement et ElementRef** : nativeElement = l'element HTML reel
6. **Route nommee comme le proxy** : conflit avec le back-end

---

## 10. Cheat Sheet

```
TypeScript :
  Types : string, number, boolean, any
  Interface : peut typer du JSON (sans new)
  Classe : private/public dans le constructeur = declaration auto

Angular composant :
  @Component({ selector, templateUrl, styleUrls })
  Cycle de vie : constructor -> ngOnInit -> ngAfterViewInit

Data binding :
  {{ }}      = interpolation (TS -> HTML)
  [prop]     = property binding (TS -> HTML)
  (event)    = event binding (HTML -> TS)
  $event     = objet evenement dans le template

Directives :
  *ngIf="condition"
  *ngFor="let x of liste"
  ng-container = conteneur invisible

HTTP :
  this.http.get<T>(url).subscribe(data => ...)
  this.http.post(url, body, {}).subscribe(...)
  subscribe OBLIGATOIRE sinon requete PAS envoyee

Service :
  @Injectable({ providedIn: 'root' })
  Injection via le constructeur (private service: Service)
```
