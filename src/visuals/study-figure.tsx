import { useId, type ReactNode } from 'react'
import { Figure } from '../components/content'
import './study-figure.css'

type StudyFigureProps = {
  title: string
  caption: ReactNode
  children: ReactNode
}

export function StudyFigure({ title, caption, children }: StudyFigureProps) {
  return (
    <Figure title={title} caption={caption}>
      <div className="study-figure">{children}</div>
    </Figure>
  )
}

type ChoicesProps = {
  label: string
  options: readonly string[]
  selected: number
  onSelect: (index: number) => void
}

export function FigureChoices({ label, options, selected, onSelect }: ChoicesProps) {
  const name = useId()
  return (
    <fieldset className="study-choices">
      <legend>{label}</legend>
      <div className="study-options">
        {options.map((option, index) => (
          <label key={option}>
            <input type="radio" name={name} checked={index === selected} onChange={() => onSelect(index)} />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

type FigureStep = {
  label: string
  detail: ReactNode
  tone?: 'accent' | 'caution'
}

export function FigureFlow({ steps }: { steps: FigureStep[] }) {
  return (
    <ol className="study-flow">
      {steps.map(({ label, detail, tone }) => (
        <li className="study-card" data-tone={tone} key={label}>
          <strong>{label}</strong>
          <div>{detail}</div>
        </li>
      ))}
    </ol>
  )
}

export function FigureFacts({ facts }: { facts: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="study-grid">
      {facts.map(({ label, value }) => (
        <div className="study-card" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
