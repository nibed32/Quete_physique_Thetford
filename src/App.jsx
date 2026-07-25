import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CHAPTERS, MAX_STARS } from './gameData'
import TitleScreen from './components/TitleScreen'
import WorldMap from './components/WorldMap'
import ChapterPath from './components/ChapterPath'
import ChallengeShell from './components/ChallengeShell'
import StarField from './components/StarField'
import SoundToggle from './components/SoundToggle'
import StoryEnding from './components/StoryEnding'

const STORAGE_KEY = 'quete-physique-progress-v1'

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function App() {
  const [screen, setScreen] = useState('title')
  const [chapterIndex, setChapterIndex] = useState(0)
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [progress, setProgress] = useState(loadProgress)
  const [attemptKey, setAttemptKey] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const totalStars = Object.values(progress).reduce(
    (sum, ch) => sum + Object.values(ch).reduce((s, v) => s + v, 0),
    0
  )

  const isChapterUnlocked = (i) => {
    if (i === 0) return true
    const prev = CHAPTERS[i - 1]
    return prev.challenges.every((c) => (progress[prev.id]?.[c.id] || 0) > 0)
  }

  const allComplete = totalStars === MAX_STARS

  const goMap = () => setScreen('map')
  const openEnding = () => setScreen('ending')
  const selectChapter = (i) => {
    setChapterIndex(i)
    setScreen('chapter')
  }
  const selectChallenge = (i) => {
    setChallengeIndex(i)
    setAttemptKey((k) => k + 1)
    setScreen('challenge')
  }

  const finishChallenge = (stars) => {
    const chapter = CHAPTERS[chapterIndex]
    const challenge = chapter.challenges[challengeIndex]
    setProgress((prev) => {
      const chapterProgress = prev[chapter.id] || {}
      const prevStars = chapterProgress[challenge.id] || 0
      return {
        ...prev,
        [chapter.id]: { ...chapterProgress, [challenge.id]: Math.max(prevStars, stars) },
      }
    })
    setScreen('chapter')
  }

  const chapter = CHAPTERS[chapterIndex]
  const challenge = chapter?.challenges[challengeIndex]

  return (
    <div className="app">
      <StarField />
      <SoundToggle />
      <AnimatePresence mode="wait">
        {screen === 'title' && (
          <motion.div key="title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ display: 'flex', flex: 1 }}>
            <TitleScreen onStart={goMap} totalStars={totalStars} maxStars={MAX_STARS} />
          </motion.div>
        )}

        {screen === 'map' && (
          <motion.div key="map" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flex: 1 }}>
            <WorldMap
              chapters={CHAPTERS}
              progress={progress}
              isUnlocked={isChapterUnlocked}
              onSelectChapter={selectChapter}
              allComplete={allComplete}
              onOpenEnding={openEnding}
            />
          </motion.div>
        )}

        {screen === 'ending' && (
          <motion.div key="ending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ display: 'flex', flex: 1 }}>
            <StoryEnding onBack={goMap} />
          </motion.div>
        )}

        {screen === 'chapter' && chapter && (
          <motion.div key={'chapter-' + chapter.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flex: 1 }}>
            <ChapterPath
              chapter={chapter}
              progress={progress}
              onSelectChallenge={selectChallenge}
              onBack={goMap}
            />
          </motion.div>
        )}

        {screen === 'challenge' && challenge && (
          <motion.div key={'challenge-' + attemptKey} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} style={{ display: 'flex', flex: 1 }}>
            <ChallengeShell
              title={challenge.title}
              instructions={challenge.instructions}
              color={chapter.color}
              onExit={() => setScreen('chapter')}
              onFinish={finishChallenge}
            >
              {({ onComplete }) => <challenge.Component onComplete={onComplete} />}
            </ChallengeShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
