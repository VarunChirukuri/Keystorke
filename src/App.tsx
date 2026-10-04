import { useEffect, useRef, useState } from 'react'

const passage = `There is a particular kind of quiet that arrives just before the rain. The windows turn silver, the streetlights come on early, and even the busiest room seems to take a slower breath. In that small pause, ordinary things become easier to notice: a warm cup between your hands, a familiar song from another room, the steady rhythm of keys beneath your fingers. Practice works much the same way. A little attention, repeated often, turns effort into ease. Start where you are, keep a comfortable pace, and let accuracy lead. Speed tends to follow when your hands know the way.`

const durations = [15, 30, 60] as const

function App() {
  const [duration, setDuration] = useState<number>(30)
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(duration)
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (startedAt === null || finished) return

    const timer = window.setInterval(() => {
      const secondsLeft = Math.max(0, duration - Math.floor((Date.now() - startedAt) / 1000))
      setRemaining(secondsLeft)
      if (secondsLeft === 0) setFinished(true)
    }, 100)

    return () => window.clearInterval(timer)
  }, [duration, finished, startedAt])

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
          <button className="restart-button" onClick={() => reset()} type="button" title="Restart test">
            Restart
          </button>
        </div>

        <div className="test-panel">
          <div className="stats">
            <div className="stat"><span className="stat-label">WPM</span><strong>{wpm}</strong></div>
            <div className="stat"><span className="stat-label">Accuracy</span><strong>{accuracy}<small>%</small></strong></div>
            <div className="stat time-stat"><span className="stat-label">Time</span><strong>{remaining}<small>s</small></strong></div>
          </div>

          <div className="progress-track" aria-label={`Passage ${Math.round(progress)} percent typed`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <div className="typing-area" onClick={() => inputRef.current?.focus()}>
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
            {!startedAt && <span className="start-hint">click here and start typing</span>}
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