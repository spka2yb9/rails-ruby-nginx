import { useState } from 'react'
import { FigureChoices, FigureFacts, FigureFlow, StudyFigure } from './study-figure'

const associations = [
  {
    name: '一対一',
    table: 'author_profiles',
    columns: ['id', 'author_id'],
    links: [{ column: 'author_id', target: 'authors.id' }],
    result: '著者を指す author_id を一意にすると、同じ著者のプロフィールは最大1行になります。',
  },
  {
    name: '多対多',
    table: 'taggings',
    columns: ['id', 'article_id', 'tag_id'],
    links: [
      { column: 'article_id', target: 'articles.id' },
      { column: 'tag_id', target: 'tags.id' },
    ],
    result: '中間テーブルの1行が記事とタグを1組つなぎます。同じ組の重複は2列の一意索引で防げます。',
  },
  {
    name: 'ポリモーフィック',
    table: 'reactions',
    columns: ['id', 'reactable_type', 'reactable_id'],
    links: [
      { column: 'reactable_type が Article なら reactable_id', target: 'articles.id' },
      { column: 'reactable_type が Comment なら reactable_id', target: 'comments.id' },
    ],
    result: '対象は1行ごとにどちらか一方です。型が参照するテーブルを、ID がそのテーブルの行を決めます。',
  },
]

export function AssociationFigure() {
  const [selected, setSelected] = useState(0)
  const example = associations[selected]

  return (
    <StudyFigure title="関連を表す列と参照先" caption="模式図。参照に使う列を持つテーブルから、対象の主キーに矢印を向けています。">
      <FigureChoices label="関連の種類" options={associations.map(item => item.name)} selected={selected} onSelect={setSelected} />
      <div className="study-schema">
        <div className="study-card" data-tone="accent">
          <strong><code>{example.table}</code></strong>
          <div className="study-fields">
            {example.columns.map(column => <div key={column}><code>{column}</code></div>)}
          </div>
        </div>
        <ul className="study-links">
          {example.links.map(link => (
            <li className="study-link" key={link.target}>
              <span className="study-link-arrow" aria-hidden="true" />
              <div className="study-card">
                <small>{link.column} が参照</small>
                <strong><code>{link.target}</code></strong>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="study-result" aria-live="polite">{example.result}</p>
    </StudyFigure>
  )
}

const taggingChanges = [
  { action: '追加する', fields: ['tag_id: "5"'], match: 'id がないので、新しいタグ付けを組み立てる', result: 'tag_id が 5 の行を追加' },
  { action: '変更する', fields: ['id: "12"', 'tag_id: "5"'], match: 'id が 12 の既存のタグ付けに代入する', result: 'id が 12 の行を、tag_id が 5 に更新' },
  { action: '外す', fields: ['id: "12"', '_destroy: "1"'], match: 'id が 12 の既存のタグ付けを削除対象にする', result: 'id が 12 のタグ付けの行を削除' },
  { action: '空欄で送る', fields: ['tag_id: ""'], match: '新しい子の空欄を reject_if: :all_blank で除外する', result: 'タグ付けの変更なし' },
]

export function NestedFormFigure() {
  const [selected, setSelected] = useState(0)
  const example = taggingChanges[selected]

  return (
    <StudyFigure
      title="フォームで送った値からタグ付けの変更を決める"
      caption="模式図。記事に id が 12 のタグ付けがあり、allow_destroy と reject_if は本文の設定です。保存が成功し、タグ付けを外す場合に消えるのは taggings の行です。タグそのものは残ります。"
    >
      <FigureChoices label="フォームで行う操作" options={taggingChanges.map(item => item.action)} selected={selected} onSelect={setSelected} />
      <FigureFlow steps={[
        {
          label: '送信した子1件分',
          detail: <div className="study-fields">{example.fields.map(field => <div key={field}><code>{field}</code></div>)}</div>,
        },
        { label: '関連の処理', detail: example.match },
        { label: '保存後の taggings', detail: <span aria-live="polite">{example.result}</span>, tone: 'accent' },
      ]} />
    </StudyFigure>
  )
}

export function JobRetryFigure() {
  const [failure, setFailure] = useState(1)
  const committed = failure === 1
  const firstRows = committed ? 1 : 0
  const duplicateRows = firstRows + 1

  return (
    <StudyFigure
      title="同じジョブを再試行したときに残る履歴"
      caption="記事公開の履歴を DB に書く模式図。再試行は最初から実行され、初回と同じイベント ID を使います。"
    >
      <FigureChoices label="初回に例外が起きた位置" options={['コミット前', 'コミット後']} selected={failure} onSelect={setFailure} />
      <FigureFlow steps={[
        { label: '初回の処理', detail: <span>公開イベント <code>42</code> の履歴を書き込む</span> },
        { label: '例外が発生', detail: committed ? 'コミット済みなので1行残る' : 'ロールバックされて0行残る', tone: 'caution' },
        { label: '再試行', detail: <span>同じイベント <code>42</code> の処理を最初から行う</span> },
      ]} />
      <FigureFacts facts={[
        { label: '実行するたびに履歴を追加', value: <span className="study-count">{duplicateRows} 行</span> },
        { label: 'イベント ID ごとに1行にする', value: <span className="study-count">1 行</span> },
      ]} />
      <p className="study-result" aria-live="polite">
        初回に保存された件数は{firstRows}行です。{committed
          ? '毎回追加すると再試行で2行になります。一意制約で同じ ID の重複を防ぎ、既存の行を処理済みとして扱えば1行です。'
          : '初回の変更が戻っているので、どちらも再試行で初めて1行が確定します。'}
      </p>
    </StudyFigure>
  )
}

const editors = [
  {
    label: '未ログイン',
    authentication: 'ログインが必要',
    scope: 'まだ取得しない',
    policy: 'まだ判定しない',
    result: '認証の段階で止まり、編集対象は読み込みません。',
  },
  {
    label: '別組織の編集者',
    authentication: 'ログイン済み',
    scope: '自分の組織の記事に含まれない',
    policy: 'まだ判定しない',
    result: 'ログインできても、他組織の記事は取得範囲に含まれません。',
  },
  {
    label: '同じ組織の閲覧者',
    authentication: 'ログイン済み',
    scope: '自分の組織の記事を取得',
    policy: '編集権限がない',
    result: '記事の取得はできます。操作の認可で編集が止まります。',
  },
  {
    label: '同じ組織の編集者',
    authentication: 'ログイン済み',
    scope: '自分の組織の記事を取得',
    policy: '編集を許可',
    result: 'この設定では編集を許可し、更新処理に進みます。',
  },
]

export function AuthorizationFigure() {
  const [selected, setSelected] = useState(2)
  const editor = editors[selected]

  return (
    <StudyFigure
      title="同じ記事を編集できるかを段階ごとに確かめる"
      caption="模式図。所属組織の記事だけを読み、編集者のロールを持つ人に編集を許可するアプリケーションの例です。"
    >
      <FigureChoices label="記事を編集しようとする利用者" options={editors.map(item => item.label)} selected={selected} onSelect={setSelected} />
      <FigureFlow steps={[
        { label: '認証', detail: editor.authentication, tone: selected === 0 ? 'caution' : undefined },
        { label: '取得範囲', detail: editor.scope, tone: selected === 1 ? 'caution' : undefined },
        { label: '操作の認可', detail: editor.policy, tone: selected === 2 ? 'caution' : selected === 3 ? 'accent' : undefined },
      ]} />
      <p className="study-result" aria-live="polite">{editor.result}</p>
    </StudyFigure>
  )
}

const publication = [
  { action: '初版を承認', revision: '1', approvals: '1', status: 'draft', matches: true, result: '現在の改訂1を承認しました。続けて公開できる状態です。' },
  { action: '本文を編集', revision: '2', approvals: '1', status: 'draft', matches: false, result: '本文を変えて改訂2になりました。残っている承認は改訂1に対するものです。' },
  { action: '公開を試す', revision: '2', approvals: '1', status: 'draft', matches: false, result: '改訂2の承認がないので公開を拒否し、記事は下書きのままです。' },
  { action: '改訂2を承認', revision: '2', approvals: '1, 2', status: 'draft', matches: true, result: '現在の改訂2にも承認が付いたので、公開できる状態です。' },
  { action: '公開する', revision: '2', approvals: '1, 2', status: 'published', matches: true, result: '状態と改訂2の承認を同じロックの中で確かめ、記事を公開しました。' },
]

export function PublicationFigure() {
  const [selected, setSelected] = useState(0)
  const article = publication[selected]

  return (
    <StudyFigure
      title="本文を編集すると公開できる条件が変わる"
      caption="本文の設計を使った模式図。操作権限がある前提で、操作を順に選び、記事の改訂番号と承認が指す番号を比べます。"
    >
      <FigureChoices label="直前に行った操作" options={publication.map(item => item.action)} selected={selected} onSelect={setSelected} />
      <FigureFacts facts={[
        { label: '本文の改訂番号', value: <code>revision: {article.revision}</code> },
        { label: '承認がある改訂番号', value: <code>{article.approvals}</code> },
        { label: '記事の状態', value: <code>{article.status}</code> },
      ]} />
      <p className="study-result" aria-live="polite">
        <strong>{article.matches ? '現在の改訂は承認済み。' : '現在の改訂は未承認。'}</strong>{' '}{article.result}
      </p>
    </StudyFigure>
  )
}
