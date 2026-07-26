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
      { id: 'decomposition', title: 'Décomposition', instructions: "Un signal capté par le poste de navigation doit être décomposé en composantes pour trianguler sa source.", Component: VectorDecomposition },
      { id: 'addition', title: 'Addition bout-à-bout', instructions: 'Combine deux poussées de correction (méthode bout-à-bout) pour réaligner la trajectoire de la station.', Component: VectorAddition },
      { id: 'produit-vectoriel', title: 'Produit vectoriel', instructions: 'Détermine le sens du couple appliqué par les gyroscopes de stabilisation avec la règle de la main droite.', Component: CrossProductDirection },
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
      { id: 'projectile', title: 'Tir de précision', instructions: 'Calibre le tube de lancement pour que la capsule de ravitaillement atteigne la plateforme d\'arrimage.', Component: ProjectileTarget },
      { id: 'mrua', title: 'MRUA', instructions: 'Prédis la vitesse et la position du chariot de fret sur le rail de la soute.', Component: MruaPrediction },
      { id: 'riviere', title: 'Traversée de rivière', instructions: 'Pilote le drone de maintenance à travers le flux de refroidissement pour l\'amener droit en face.', Component: RiverCrossing },
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
      { id: 'plan-incline', title: 'Angle critique', instructions: 'Trouve l\'angle où la caisse de pièces se met à glisser sur la rampe de la soute.', Component: InclineCriticalAngle },
      { id: 'diagramme-forces', title: 'Diagramme de forces', instructions: 'Place chaque force agissant sur la caisse tirée sur le convoyeur de la salle des machines.', Component: ForceDiagram },
      { id: 'newton2', title: '2e loi de Newton', instructions: 'Calibre la poussée du chariot de maintenance pour respecter le délai de la manœuvre.', Component: NewtonRocket },
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
      { id: 'collision-elastique', title: 'Collision élastique', instructions: 'Ajuste la vitesse d\'un débris pour qu\'il rebondisse sur le bouclier à la vitesse voulue.', Component: ElasticCollision },
      { id: 'collision-inelastique', title: 'Collision inélastique', instructions: 'Prédis la vitesse commune quand un débris reste collé au bouclier après l\'impact.', Component: InelasticCollision },
      { id: 'explosion', title: 'Conservation de la quantité de mouvement', instructions: 'Trouve la vitesse du second module après la séparation d\'urgence d\'une capsule de secours.', Component: MomentumExplosion },
      { id: 'synthese-finale', title: 'Test final des systèmes', instructions: 'COSMO lance un test de synthèse en 3 étapes combinant vecteurs, cinématique et collisions.', Component: FinalSynthesis },
    ],
  },
]

export const TOTAL_CHALLENGES = CHAPTERS.reduce((sum, c) => sum + c.challenges.length, 0)
export const MAX_STARS = TOTAL_CHALLENGES * 3
