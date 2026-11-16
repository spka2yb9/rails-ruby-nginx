import type { ReactNode } from 'react'
import type { Chapter, Source } from '../content/types'
import { Ref } from '../components/content'

export interface Explanations {
  sources: Source[]
  sections: Record<string, (cite: ReactNode) => ReactNode>
}

/** 節の前提となる説明を同じ本文に組み込む。既存の節IDと出典番号は保つ。 */
export function withExplanations(chapter: Chapter, explanations: Explanations): Chapter {
  for (const id of Object.keys(explanations.sections)) {
    if (!chapter.sections.some(section => section.id === id)) {
      throw new Error(`Chapter ${chapter.number}: unknown section ${id}`)
    }
  }
  const cite = explanations.sources.map((_, i) => <Ref key={i} n={chapter.sources.length + i + 1} />)
  return {
    ...chapter,
    sections: chapter.sections.map(section => {
      const explain = explanations.sections[section.id]
      return explain ? { ...section, body: <>{explain(cite)}{section.body}</> } : section
    }),
    sources: [...chapter.sources, ...explanations.sources],
  }
}

export function guide(file: string, title: string): Source {
  return {
    title, publisher: 'Ruby on Rails Guides',
    url: `https://guides.rubyonrails.org/v8.0/${file}.html`,
    accessed: '2026-11-16', version: 'Rails 8.0',
    note: '基本APIと設定を参照。内部実装と実測は各章に示したバージョンを対象にしています。',
  }
}

export function rubyDoc(file: string, title: string): Source {
  return {
    title, publisher: 'Ruby RDoc', url: `https://ruby-doc.org/3.4/${file}.html`,
    accessed: '2026-11-16', version: 'Ruby 3.4', note: '文法と標準メソッドの仕様。',
  }
}

export function primarySource(title: string, publisher: string, url: string, version?: string): Source {
  return { title, publisher, url, accessed: '2026-11-16', version }
}
