import { useEffect, useRef, useState } from 'react'

type Level = 'Easy' | 'Medium' | 'Hard'

const lessons: Record<Level, string[]> = {
  Easy: [
    'the sun is up and the day is calm. a cat sits by the window. we take a slow walk and see the green trees.',
    'a good book can take you far. turn the page, find a new place, and let the story unfold one step at a time.',
    'keep a steady pace. take a short break, stretch your hands, and come back when you feel ready to begin again.',
  ],
  Medium: [
    'A quiet moment before the rain can change how a room feels. Notice the light, take a breath, and let your hands find an easy rhythm.',
    'Practice works best when it becomes part of the day. A little focus, repeated often, can turn a difficult skill into a natural one.',
    'Take your time with each sentence. Accuracy builds confidence, and confidence makes it easier to keep a steady pace.',
  ],
  Hard: [
    'Precision matters: keep your eyes moving, your wrists relaxed, and your rhythm consistent. Small corrections now prevent bigger mistakes later.',
    'At 8:45 a.m., the plan changed; the team adapted quickly, checked every detail, and finished 3 tasks before lunch.',
    'Fast typing is not random motion. It is controlled repetition: notice the pattern, reduce wasted movement, and stay accurate under pressure!',
  ],
}

const durations = [15, 30, 60] as const
const levels: Level[] = ['Easy', 'Medium', 'Hard']

function App() {
  const [duration, setDuration] = useState<number>(30)
  const [level, setLevel] = useState<Level>('Medium')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(duration)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const passage = lessons[level][lessonIndex]

  useEffect(() => {
    if (startedAt === null || finished) return

    const timer = window.setInterval(() => {
      const secondsLeft = Math.max(0, duration - Math.floor((Date.now() - startedAt) / 1000))
      setRemaining(secondsLeft)
      if (secondsLeft === 0) setFinished(true)
    }, 100)

    return () => window.clearInterval(timer)
  }, [duration, finished, startedAt])

  useEffect(() => {
    function startFromFirstKey(event: KeyboardEvent) {
      const target = event.target
      const isInteractive = target instanceof HTMLElement && target.closest('button, a, input, textarea, select, [contenteditable="true"]')
      if (startedAt !== null || finished || isInteractive || event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return

      event.preventDefault()
      setTyped(event.key.slice(0, passage.length))
      setStartedAt(Date.now())
      inputRef.current?.focus()
    }

    window.addEventListener('keydown', startFromFirstKey)
    return () => window.removeEventListener('keydown', startFromFirstKey)
  }, [finished, passage.length, startedAt])

  const correctCharacters = typed
    .split('')
    .reduce((total, character, index) => total + Number(character === passage[index]), 0)
  const accuracy = typed.length ? Math.round((correctCharacters / typed.length) * 100) : 100
  const elapsed = startedAt === null ? 0 : Math.max(1, duration - remaining)
  const wpm = elapsed ? Math.round(correctCharacters / 5 / (elapsed / 60)) : 0
  const progress = Math.min(100, (typed.length / passage.length) * 100)

  function reset(nextDuration = duration) {
    setDuration(nextDuration)
    setTyped('')
    setStartedAt(null)
    setRemaining(nextDuration)
    setFinished(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function selectLevel(nextLevel: Level) {
    setLevel(nextLevel)
    setLessonIndex(0)
    reset()
  }

  function nextLesson() {
    setLessonIndex((current) => (current + 1) % lessons[level].length)
    reset()
  }

  function handleInput(value: string) {
    if (finished) return
    const nextValue = value.slice(0, passage.length)
    if (startedAt === null && nextValue.length > 0) setStartedAt(Date.now())
    setTyped(nextValue)
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Keystroke home">
          <span className="brand-mark" aria-hidden="true">k</span>
          <span>keystroke</span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> your daily typing space</div>
      </header>

      <section className="practice" id="top" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">A little practice goes a long way</p>
          <h1 id="page-title">Find your <em>flow.</em></h1>
          <p className="subtitle">Easy hands. Clear mind. One word at a time.</p>
        </div>

        <div className="test-toolbar">
          <div className="toolbar-settings">
            <div className="setting-group">
              <span className="control-label">Level</span>
              <div className="level-control" role="group" aria-label="Difficulty level">
                {levels.map((option) => (
                  <button
                    className={level === option ? 'level-option active' : 'level-option'}
                    key={option}
                    onClick={() => selectLevel(option)}
                    type="button"
                    aria-pressed={level === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-group">
              <span className="control-label">Time</span>
              <div className="duration-control" role="group" aria-label="Test duration">
                {durations.map((seconds) => (
                  <button
                    className={duration === seconds ? 'duration-option active' : 'duration-option'}
                    key={seconds}
                    onClick={() => reset(seconds)}
                    type="button"
                    aria-pressed={duration === seconds}
                  >
                    {seconds}<span>s</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lesson-actions">
            <button className="refresh-button" onClick={() => reset()} type="button" title="Refresh this lesson">
              <span aria-hidden="true">↻</span> Refresh
            </button>
            <button className="next-button" onClick={nextLesson} type="button">
              Next lesson <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="test-panel">
          <div className="stats">
            <div className="stat"><span className="stat-label">WPM</span><strong>{wpm}</strong></div>
            <div className="stat"><span className="stat-label">Accuracy</span><strong>{accuracy}<small>%</small></strong></div>
            <div className="stat time-stat"><span className="stat-label">Time</span><strong>{remaining}<small>s</small></strong></div>
          </div>

          <div className="progress-track" role="progressbar" aria-label="Passage progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="typing-area" onClick={() => inputRef.current?.focus()}>
            {!startedAt && <p className="typing-prompt">Type any letter to begin <span>Your first key starts the timer</span></p>}
            <p className="passage" aria-hidden="true">
              {passage.split('').map((character, index) => {
                let characterClass = 'character'
                if (index < typed.length) characterClass += typed[index] === character ? ' correct' : ' incorrect'
                if (index === typed.length) characterClass += ' cursor'
                return <span className={characterClass} key={index}>{character}</span>
              })}
            </p>
            <textarea
              aria-label="Type the displayed passage here"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="typing-input"
              onChange={(event) => handleInput(event.target.value)}
              ref={inputRef}
              spellCheck={false}
              value={typed}
            />
            {finished && <span className="finish-message">Time. Nice work.</span>}
          </div>
        </div>

        <div className="underbar">
          <span>Focus on accuracy. Speed will come.</span>
        </div>
      </section>

      <footer className="footer">
        <span>Built for the rhythm of getting better.</span>
        <span className="footer-mark">LESS RUSH, MORE FLOW</span>
      </footer>
    </main>
  )
}

export default App