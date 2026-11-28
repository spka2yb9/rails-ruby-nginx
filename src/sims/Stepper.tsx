import { useState, type ReactNode } from 'react'

export function Stepper({ steps, onStepChange }: { steps: readonly { label: string; detail: ReactNode }[]; onStepChange?: (index: number) => void }) {
  const [index, setIndex] = useState(0)
  const select = (next: number) => {
    setIndex(next)
    onStepChange?.(next)
  }
  return (
    <div className="stepper">
      <ol className="stepper-steps" aria-label="処理の順序">
        {steps.map((step, n) => (
          <li key={n}>
            <button type="button" aria-current={n === index ? 'step' : undefined} onClick={() => select(n)}>
              {step.label}
            </button>
          </li>
        ))}
      </ol>
      <div className="stepper-detail" aria-live="polite">{steps[index].detail}</div>
      <div className="stepper-controls">
        <button type="button" disabled={index === 0} onClick={() => select(index - 1)}>前の段階</button>
        <span>{index + 1} / {steps.length}</span>
        <button type="button" disabled={index === steps.length - 1} onClick={() => select(index + 1)}>次の段階</button>
      </div>
    </div>
  )
}
