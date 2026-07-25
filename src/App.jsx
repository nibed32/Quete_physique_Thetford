import { useEffect, useState } from 'react'
import { CHAPTERS, MAX_STARS } from './gameData'
import TitleScreen from './components/TitleScreen'
import WorldMap from './components/WorldMap'
import ChapterPath from './components/ChapterPath'
import ChallengeShell from './components/ChallengeShell'

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

  const goMap = () => setScreen('map')
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
      {screen === 'title' && (
        <TitleScreen onStart={goMap} totalStars={totalStars} maxStars={MAX_STARS} />
      )}

      {screen === 'map' && (
        <WorldMap
          chapters={CHAPTERS}
          progress={progress}
          isUnlocked={isChapterUnlocked}
          onSelectChapter={selectChapter}
        />
      )}

      {screen === 'chapter' && chapter && (
        <ChapterPath
          chapter={chapter}
          progress={progress}
          onSelectChallenge={selectChallenge}
          onBack={goMap}
        />
      )}

      {screen === 'challenge' && challenge && (
        <ChallengeShell
          key={attemptKey}
          title={challenge.title}
          instructions={challenge.instructions}
          color={chapter.color}
          onExit={() => setScreen('chapter')}
          onFinish={finishChallenge}
        >
          {({ onComplete }) => <challenge.Component onComplete={onComplete} />}
        </ChallengeShell>
      )}
    </div>
  )
}

export default App
