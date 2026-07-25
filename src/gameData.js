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
import FinalSynthesis from './challenges/ch4/FinalSynthesis'

export const STATION_NAME = 'Station Aurora'
export const AI_NAME = 'COSMO'

export const STORY_INTRO =
  "La Station Aurora dérive après une collision avec un champ d'astéroïdes. Tous ses systèmes sont hors service. Toi seul·e maîtrises assez la mécanique pour tout réparer avant que l'équipage ne manque d'air."

export const STORY_OUTRO =
  "Tous les systèmes répondent de nouveau. La Station Aurora reprend sa route et l'équipage est sauf. Grâce à toi, la mission continue — tu es officiellement Ingénieur·e en Mécanique."

export const CHAPTERS = [
  {
    id: 'ch1',
    title: 'Vecteurs',
    subtitle: 'Chapitre 1 — Introduction',
    missionName: 'Poste de navigation',
    brief: "Les capteurs directionnels sont désaxés depuis l'impact. Recalibre-les à l'aide des vecteurs pour qu'on retrouve notre position.",
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
    missionName: 'Propulseurs',
    brief: 'Le calculateur de trajectoire ne répond plus. Rétablis les équations du mouvement pour reprendre le contrôle de la poussée.',
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
    missionName: 'Salle des machines',
    brief: 'Les moteurs peinent à vaincre les frottements et refusent de redémarrer. Applique les lois de Newton pour relancer la salle des machines.',
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
    missionName: 'Bouclier déflecteur',
    brief: 'Le bouclier absorbe mal les impacts de débris depuis la collision. Maîtrise les chocs et la quantité de mouvement pour le stabiliser.',
    color: '#a259e0',
    icon: '💥',
    challenges: [
      { id: 'collision-elastique', title: 'Collision élastique', instructions: 'Ajuste la vitesse initiale pour obtenir la vitesse finale visée.', Component: ElasticCollision },
      { id: 'collision-inelastique', title: 'Collision inélastique', instructions: 'Prédis la vitesse commune après un choc parfaitement mou.', Component: InelasticCollision },
      { id: 'explosion', title: 'Conservation de la quantité de mouvement', instructions: 'Trouve la vitesse du second fragment après une explosion.', Component: MomentumExplosion },
      { id: 'synthese-finale', title: 'Test final des systèmes', instructions: 'Combine vecteurs, cinématique et collisions pour ce test de synthèse en 3 étapes.', Component: FinalSynthesis },
    ],
  },
]

export const TOTAL_CHALLENGES = CHAPTERS.reduce((sum, c) => sum + c.challenges.length, 0)
export const MAX_STARS = TOTAL_CHALLENGES * 3
