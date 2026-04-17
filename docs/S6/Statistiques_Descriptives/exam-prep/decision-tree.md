---
title: "Arbre de decision : quel test utiliser ?"
sidebar_position: 2
---

# Arbre de decision : quel test utiliser ?

> C'est **l'outil le plus precieux** pour l'examen. Imprime-le ou memorise-le.

---

## Flowchart principal

```mermaid
flowchart TD
    START["Que veux-tu faire ?"]
    
    START --> COMP_MOY["Comparer des MOYENNES"]
    START --> COMP_VAR["Comparer des VARIANCES"]
    START --> COMP_PROP["Tester une PROPORTION"]
    START --> RELATION["Etudier une RELATION\nentre variables"]
    START --> ADEQUATION["Tester l'ADEQUATION\na une loi"]
    
    %% ─── MOYENNES ───
    COMP_MOY --> NB_GR["Combien de groupes ?"]
    NB_GR -->|"1 groupe\nvs valeur de ref"| UN_GR
    NB_GR -->|"2 groupes"| DEUX_GR
    NB_GR -->|"3 groupes\nou plus"| PLUS_GR
    
    UN_GR["1 groupe"] --> NORM_1{"Normalite\nverifiee ?"}
    NORM_1 -->|"OUI"| T1["t-test 1 echantillon\nt.test(x, mu=)"]
    NORM_1 -->|"NON"| W1["Wilcoxon signe\nwilcox.test(x, mu=)"]
    
    DEUX_GR["2 groupes"] --> APPARIE{"Donnees\nappariees ?"}
    APPARIE -->|"OUI\n(memes sujets)"| NORM_P{"Normalite\ndes differences ?"}
    NORM_P -->|"OUI"| TP["t-test apparie\nt.test(x,y,paired=T)"]
    NORM_P -->|"NON"| WP["Wilcoxon apparie\nwilcox.test(x,y,paired=T)"]
    
    APPARIE -->|"NON\n(groupes differents)"| NORM_2{"Normalite\ndans chaque groupe ?"}
    NORM_2 -->|"OUI"| VAR_EQ{"Variances\negales ?"}
    VAR_EQ -->|"OUI\n(var.test p>0.05)"| TS["t-test Student\nt.test(x,y,var.equal=T)"]
    VAR_EQ -->|"NON / pas sur"| TW["t-test Welch\nt.test(x,y)"]
    NORM_2 -->|"NON"| MW["Mann-Whitney\nwilcox.test(x,y)"]
    
    PLUS_GR["3+ groupes"] --> NORM_K{"Normalite +\nhomoscedasticite ?"}
    NORM_K -->|"OUI"| ANOVA["ANOVA\nanova(lm(Y~G))"]
    NORM_K -->|"NON"| KW["Kruskal-Wallis\nkruskal.test(Y~G)"]
    ANOVA -->|"Significatif"| POSTHOC["Post-hoc :\nTukey / emmeans"]
    KW -->|"Significatif"| POSTHOC2["Post-hoc :\npairwise.wilcox.test"]
    
    %% ─── VARIANCES ───
    COMP_VAR --> NB_V["Combien de groupes ?"]
    NB_V -->|"1"| CHI_V["Test chi-deux\nsur la variance"]
    NB_V -->|"2"| FTEST["Test F de Fisher\nvar.test(x,y)"]
    NB_V -->|"3+"| BART["Test de Bartlett\nbartlett.test(y~g)"]
    
    %% ─── PROPORTIONS ───
    COMP_PROP --> NB_P["Combien de proportions ?"]
    NB_P -->|"1"| PROP1["prop.test(x,n,p=)"]
    NB_P -->|"2"| PROP2["prop.test(c(x1,x2),c(n1,n2))"]
    
    %% ─── RELATIONS ───
    RELATION --> TYPE_REL["Type de variables ?"]
    TYPE_REL -->|"2 quantitatives"| REG["Regression lineaire\nlm(Y ~ X)"]
    TYPE_REL -->|"2 categorielles"| CHI_IND["Chi-deux independance\nchisq.test(tableau)"]
    TYPE_REL -->|"1 cat + 1 quant"| ANOVA2["ANOVA\nlm(Y ~ Facteur)"]
    
    %% ─── ADEQUATION ───
    ADEQUATION --> TYPE_AD["Quelle loi ?"]
    TYPE_AD -->|"Normale"| SHAP["Shapiro-Wilk\nshapiro.test(x)"]
    TYPE_AD -->|"Autre"| CHI_AD["Chi-deux adequation\nchisq.test(obs, p=theo)"]
```

---

## Version texte (pour memorisation rapide)

### Comparer des MOYENNES

```
1 groupe vs reference
  └── Normal ? → OUI : t.test(x, mu=)
                 NON : wilcox.test(x, mu=)

2 groupes
  ├── Apparies (memes sujets)
  │   └── Normal ? → OUI : t.test(x, y, paired=TRUE)
  │                  NON : wilcox.test(x, y, paired=TRUE)
  │
  └── Independants (groupes differents)
      └── Normal ? → OUI → Variances egales ?
                           → OUI : t.test(x, y, var.equal=TRUE)
                           → NON : t.test(x, y)  [Welch, defaut]
                     NON : wilcox.test(x, y)

3+ groupes
  └── Normal + Homosced ? → OUI : anova(lm(Y ~ G))
                            NON : kruskal.test(Y ~ G)
```

### Comparer des VARIANCES

```
1 groupe   → chi² sur la variance
2 groupes  → var.test(x, y)       [F de Fisher]
3+ groupes → bartlett.test(y ~ g)  [Bartlett]
```

### Tester une PROPORTION

```
1 proportion  → prop.test(x, n, p = p0)
2 proportions → prop.test(c(x1, x2), c(n1, n2))
```

### Tester l'INDEPENDANCE

```
2 variables categorielles → chisq.test(tableau)
  Condition : effectifs theoriques >= 5
```

### Tester la NORMALITE

```
shapiro.test(x)
  Si p > 0.05 → normalite OK
  Si p < 0.05 → normalite rejetee
  
Complement visuel : qqnorm(x); qqline(x)
```

---

## Conditions d'application a verifier

| Test | Conditions |
|------|-----------|
| t-test (1 ou 2 ech.) | Normalite (Shapiro, QQ-plot) OU $n \geq 30$ |
| t-test apparie | Normalite des differences |
| t-test Student (2 ech.) | Variances egales (var.test) |
| ANOVA | Normalite (Shapiro) + Homoscedasticite (Bartlett) |
| Chi-deux | Effectifs theoriques $\geq 5$ |
| Test Z proportion | $n\hat{p} \geq 5$ et $n(1-\hat{p}) \geq 5$ |
| Kruskal-Wallis | Aucune (non parametrique) |

---

## Aide-memoire de conclusion

Toujours rediger la conclusion en 3 temps :

1. **Rappeler les hypotheses** : "On teste $H_0: \mu = 50$ contre $H_1: \mu \neq 50$"
2. **Donner le resultat** : "La statistique de test vaut $T = 2.5$, la p-value est $0.02$"
3. **Conclure en francais** :
   - Si $p < 0.05$ : "Au risque de 5%, on rejette $H_0$. On conclut que la moyenne differe significativement de 50."
   - Si $p \geq 0.05$ : "Au risque de 5%, on ne rejette pas $H_0$. On ne peut pas conclure a une difference significative."

**JAMAIS dire "on accepte $H_0$"** -- on dit "on ne rejette pas $H_0$".
