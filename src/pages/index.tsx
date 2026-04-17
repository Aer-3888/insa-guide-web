import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

interface Course {
  id: string;
  name: string;
  fullName: string;
  topics: string[];
}

const S5_COURSES: readonly Course[] = [
  {id: 'ADFD', name: 'ADFD', fullName: 'Analyse et Fouille de Donnees', topics: ['PCA', 'Clustering', 'Pandas']},
  {id: 'CLP', name: 'CLP', fullName: 'Conception Logique des Processeurs', topics: ['Logic gates', 'ARM Assembly']},
  {id: 'CPOO', name: 'CPOO', fullName: 'Conception et Programmation OO', topics: ['Java', 'Design Patterns', 'UML']},
  {id: 'ITI', name: 'ITI', fullName: 'Introduction Techniques de l\'Ingenieur', topics: ['Shell', 'Git', 'Python', 'SQL']},
  {id: 'Langage_C', name: 'Langage C', fullName: 'Langage C', topics: ['Pointers', 'Memory', 'Structs']},
  {id: 'Probabilites', name: 'Probabilites', fullName: 'Probabilites', topics: ['Distributions', 'R']},
  {id: 'Programmation_Fonctionnelle', name: 'Prog. Fonctionnelle', fullName: 'Programmation Fonctionnelle', topics: ['OCaml', 'Recursion']},
  {id: 'Programmation_Logique', name: 'Prog. Logique', fullName: 'Programmation Logique', topics: ['Prolog', 'Unification']},
  {id: 'SDD', name: 'SDD', fullName: 'Structures de Donnees', topics: ['Trees', 'Graphs', 'Heaps']},
] as const;

const S6_COURSES: readonly Course[] = [
  {id: 'Apprentissage_Automatique', name: 'Apprentissage Auto.', fullName: 'Apprentissage Automatique', topics: ['sklearn', 'Neural Networks']},
  {id: 'Bases_de_Donnees', name: 'Bases de Donnees', fullName: 'Bases de Donnees', topics: ['SQL', 'Neo4j', 'MongoDB']},
  {id: 'Complexite', name: 'Complexite', fullName: 'Complexite', topics: ['DP', 'Greedy', 'NP']},
  {id: 'Graphes_Algorithmique', name: 'Graphes', fullName: 'Graphes et Algorithmique', topics: ['Shortest paths', 'Flow']},
  {id: 'Ingenierie_Web', name: 'Ingenierie Web', fullName: 'Ingenierie Web', topics: ['Spring Boot', 'Angular']},
  {id: 'Parallelisme', name: 'Parallelisme', fullName: 'Parallelisme', topics: ['OpenMP', 'MPI']},
  {id: 'Propositions_Predicats', name: 'Props. et Predicats', fullName: 'Propositions et Predicats', topics: ['Logic', 'Resolution']},
  {id: 'Reseaux', name: 'Reseaux', fullName: 'Reseaux', topics: ['TCP/IP', 'Sockets']},
  {id: 'Statistiques_Descriptives', name: 'Statistiques', fullName: 'Statistiques Descriptives', topics: ['ANOVA', 'Regression', 'R']},
  {id: 'TAL', name: 'TAL', fullName: 'Traitement Automatique du Langage', topics: ['NLP', 'Viterbi', 'CKY']},
  {id: 'Vulnerabilites', name: 'Vulnerabilites', fullName: 'Vulnerabilites', topics: ['XSS', 'SQL Injection']},
] as const;

interface Feature {
  title: string;
  icon: string;
  description: string;
}

const FEATURES: readonly Feature[] = [
  {
    title: 'Code Interactif',
    icon: '\u{1F4BB}',
    description: 'Editeur de code integre avec support Java, Python, C, OCaml, Prolog et SQL. Testez directement dans le navigateur.',
  },
  {
    title: 'Preparation aux Examens',
    icon: '\u{1F4DD}',
    description: 'Annales corrigees, exercices types et fiches de revision pour chaque matiere du semestre.',
  },
  {
    title: 'Solutions Completes',
    icon: '\u{2705}',
    description: 'Corriges detailles des TPs, TDs et projets avec explications pas a pas.',
  },
] as const;

function CourseCard({course, semester}: {course: Course; semester: 's5' | 's6'}): ReactNode {
  return (
    <Link to={`/${semester}/${course.id}/`} className="course-card">
      <div className="course-card__code">{course.name}</div>
      <div className="course-card__name">{course.fullName}</div>
      <div className="course-card__topics">
        {course.topics.map((topic) => (
          <span key={topic} className="course-card__topic">{topic}</span>
        ))}
      </div>
    </Link>
  );
}

function FeatureCard({feature}: {feature: Feature}): ReactNode {
  return (
    <div className="feature-card">
      <div className="feature-card__icon">{feature.icon}</div>
      <div className="feature-card__title">{feature.title}</div>
      <div className="feature-card__desc">{feature.description}</div>
    </div>
  );
}

function HeroSection(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero--insa">
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

function CourseCatalog(): ReactNode {
  return (
    <section style={{padding: '3rem 0'}}>
      <div className="container">
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem'}}>
          <div>
            <Heading as="h2" className="section-heading">Semestre 5</Heading>
            <p className="section-subheading">9 matieres</p>
            <div className="course-grid">
              {S5_COURSES.map((course) => (
                <CourseCard key={course.id} course={course} semester="s5" />
              ))}
            </div>
          </div>
          <div>
            <Heading as="h2" className="section-heading">Semestre 6</Heading>
            <p className="section-subheading">11 matieres</p>
            <div className="course-grid">
              {S6_COURSES.map((course) => (
                <CourseCard key={course.id} course={course} semester="s6" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection(): ReactNode {
  return (
    <section className="features-section">
      <div className="container">
        <Heading as="h2" className="section-heading">Fonctionnalites</Heading>
        <p className="section-subheading">Tout pour reussir votre 3A Informatique</p>
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Accueil"
      description="Guide d'etude interactif pour INSA Rennes 3A Informatique">
      <HeroSection />
      <main>
        <CourseCatalog />
        <FeaturesSection />
      </main>
    </Layout>
  );
}
