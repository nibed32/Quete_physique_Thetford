import VectorDecomposition from './challenges/ch1/VectorDecomposition'
import VectorAddition from './challenges/ch1/VectorAddition'
import CrossProductDirection from './challenges/ch1/CrossProductDirection'

import ProjectileTarget from './challenges/ch2/ProjectileTarget'
import MruaPrediction from './challenges/ch2/MruaPrediction'
import RiverCrossing from './challenges/ch2/RiverCrossing'

import InclineCriticalAngle from './challenges/ch3/InclineCriticalAngle'
import ForceDiagram from './challenges/ch3/ForceDiagram'
import NewtonRocket from './challenges/ch3/NewtonRocket'

import ElasticCollision from './challenges/ch4/ElasticCollision'
import InelasticCollision from './challenges/ch4/InelasticCollision'
import MomentumExplosion from './challenges/ch4/MomentumExplosion'

export const CHAPTERS = [
  {
    id: 'ch1',
    title: 'Vecteurs',
    subtitle: 'Chapitre 1 — Introduction',
    color: '#4f9dff',
    icon: '🧭',
    challenges: [
      { id: 'decomposition', title: 'Décomposition', instructions: 'Décompose le vecteur en ses composantes Vx et Vy.', Component: VectorDecomposition },
      { id: 'addition', title: 'Addition bout-à-bout', instructions: 'Additionne deux vecteurs par la méthode bout-à-bout.', Component: VectorAddition },
      { id: 'produit-vectoriel', title: 'Produit vectoriel', instructions: 'Détermine le sens du produit vectoriel avec la règle de la main droite.', Component: CrossProductDirection },
    ],
  },
  {
    id: 'ch2',
    title: 'Cinématique',
    subtitle: 'Chapitre 2',
    color: '#39c977',
    icon: '🚀',
    challenges: [
      { id: 'projectile', title: 'Tir de précision', instructions: 'Ajuste l\'angle et la vitesse pour atteindre la cible.', Component: ProjectileTarget },
      { id: 'mrua', title: 'MRUA', instructions: 'Prédis la position et la vitesse finales du mobile.', Component: MruaPrediction },
      { id: 'riviere', title: 'Traversée de rivière', instructions: 'Compense le courant pour accoster directement en face.', Component: RiverCrossing },
    ],
  },
  {
    id: 'ch3',
    title: 'Dynamique',
    subtitle: 'Chapitre 3',
    color: '#e07a2f',
    icon: '⚙️',
    challenges: [
      { id: 'plan-incline', title: 'Angle critique', instructions: 'Trouve l\'angle où le bloc est sur le point de glisser.', Component: InclineCriticalAngle },
      { id: 'diagramme-forces', title: 'Diagramme de forces', instructions: 'Place chaque force dans la bonne direction.', Component: ForceDiagram },
      { id: 'newton2', title: '2e loi de Newton', instructions: 'Choisis la force pour atteindre l\'objectif dans le bon temps.', Component: NewtonRocket },
    ],
  },
  {
    id: 'ch4',
    title: 'Systèmes de particules',
    subtitle: 'Chapitre 4',
    color: '#a259e0',
    icon: '💥',
    challenges: [
      { id: 'collision-elastique', title: 'Collision élastique', instructions: 'Ajuste la vitesse initiale pour obtenir la vitesse finale visée.', Component: ElasticCollision },
      { id: 'collision-inelastique', title: 'Collision inélastique', instructions: 'Prédis la vitesse commune après un choc parfaitement mou.', Component: InelasticCollision },
      { id: 'explosion', title: 'Conservation de la quantité de mouvement', instructions: 'Trouve la vitesse du second fragment après une explosion.', Component: MomentumExplosion },
    ],
  },
]

export const TOTAL_CHALLENGES = CHAPTERS.reduce((sum, c) => sum + c.challenges.length, 0)
export const MAX_STARS = TOTAL_CHALLENGES * 3
