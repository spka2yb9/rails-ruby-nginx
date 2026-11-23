import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 43-1 場面の構成 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="43-1"
      w={760}
      h={390}
      label="月次の集計、問い合わせの画面、データの移行の3つが Order を使う。Order には default_scope でキャンセルしていない注文に絞る条件と、after_save で状態が変わったらメールを送るコールバックが書かれている。default_scope はすべての検索に canceled_at IS NULL を加え、集計の件数が決済代行の明細と合わず、キャンセルした注文を開けない。after_save はデータの移行の update! でも動き、お客さまにメールが届く。どちらも呼び出し側のコードには現れない"
    >
      <Box x={10} y={30} w={170} h={48} lines={['月次の集計', '件数・キャンセル率']} fs={12} subTone="muted" />
      <Box x={10} y={130} w={170} h={48} lines={['問い合わせの画面', '注文を ID で開く']} fs={12} subTone="muted" />
      <Box x={10} y={250} w={170} h={48} lines={['データの移行', 'sent → shipped']} fs={12} subTone="muted" />

      <Box x={270} y={20} w={250} h={290} fill="box5" />
      <T x={395} y={44} anchor="middle" bold>
        Order
      </T>
      <Box x={286} y={64} w={218} h={96} lines={['default_scope', '{ where(canceled_at: nil) }', 'すべての検索に条件を加える']} fs={12} mono={false} fill="bg" dashed subTone="muted" />
      <Box x={286} y={190} w={218} h={96} lines={['after_save', ':notify_status_change', '状態が変わったらメールを送る']} fs={12} fill="bg" dashed subTone="muted" />

      <Arrow x1={180} y1={54} x2={284} y2={100} />
      <T x={14} y={92} fs={11} mono>
        where(...).count
      </T>
      <Arrow x1={180} y1={154} x2={284} y2={124} />
      <T x={14} y={192} fs={11} mono>
        Order.find(id)
      </T>
      <Arrow x1={180} y1={274} x2={284} y2={238} />
      <T x={14} y={312} fs={11} mono>
        update!(status:)
      </T>

      <Box x={600} y={92} w={150} h={40} lines="orders テーブル" fs={12} fill="box4" />
      <Box x={600} y={218} w={150} h={48} lines={['OrderMailer', 'お客さまへのメール']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={504} y1={112} x2={598} y2={112} />
      <Arrow x1={504} y1={238} x2={598} y2={240} />

      <T x={10} y={334} fs={12} tone="danger">
        ① 件数が決済代行の明細と合わず、キャンセル率が 0 になる ② キャンセルした注文を開けない
      </T>
      <T x={10} y={356} fs={12} tone="danger">
        ③ データの移行でお客さまにメールが届き、キャンセルした注文だけ移行されずに残る
      </T>
      <T x={10} y={378} fs={12} tone="muted">
        点線の枠の処理は、左の呼び出し側のコードには現れない
      </T>
    </Svg>
  )
}

/* ---------- 図 43-2 書いたコードと実際に動く処理 ---------- */
function WrittenVsRunFigure() {
  const rows: { code: string; run: string[]; note: string }[] = [
    { code: 'Order.where(created_at: month).count', run: ['WHERE canceled_at IS NULL', '  AND created_at BETWEEN …'], note: '5件のうち4件' },
    { code: 'Order.where.not(canceled_at: nil).count', run: ['WHERE canceled_at IS NULL', '  AND canceled_at IS NOT NULL'], note: '常に0件' },
    { code: 'Order.find(canceled.id)', run: ['WHERE canceled_at IS NULL', '  AND id = 3'], note: 'RecordNotFound' },
    { code: 'sato.orders.unscoped.count', run: ['SELECT COUNT(*) FROM orders', '（user_id の条件も消える）'], note: '全員の5件' },
    { code: 'order.update!(status: "shipped")', run: ['UPDATE orders SET status = …', 'after_save → メールのジョブ'], note: 'メールが届く' },
  ]
  const top = 34
  const rh = 60
  return (
    <Svg
      id="43-2"
      w={760}
      h={top + rows.length * rh + 6}
      label={`書いたコードと、実際に実行される SQL と処理の対応。${rows.map((r) => `${r.code} は ${r.run.join(' ')} になり、結果は${r.note}`).join('。')}`}
    >
      <T x={10} y={14} fs={12} bold>
        書いたコード
      </T>
      <T x={350} y={14} fs={12} bold>
        実際に実行される SQL と処理
      </T>
      <T x={750} y={14} fs={12} bold anchor="end">
        結果
      </T>
      {rows.map((r, i) => {
        const y = top + i * rh
        return (
          <g key={r.code}>
            <Box x={10} y={y} w={300} h={48} lines={r.code} fs={11} mono />
            <Arrow x1={310} y1={y + 24} x2={344} y2={y + 24} />
            <Box x={346} y={y} w={290} h={48} lines={r.run} fs={11} mono fill="box4" align="start" />
            <T x={750} y={y + 24} fs={12} anchor="end" tone="danger">
              {r.note}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 43-4 規約による暗黙と隠れた副作用 ---------- */
function ConventionVsHiddenFigure() {
  const x0 = 150
  const y0 = 40
  const w = 600
  const h = 300
  return (
    <Svg
      id="43-4"
      w={760}
      h={400}
      label="横軸は暗黙に決まることの種類で、左から名前と場所の対応、値の整形と検証、対象の行と外部への副作用。縦軸は、それを知っている人の範囲で、上が Rails を使う人全員（ガイドに書かれている）、下がそのアプリのモデルを読んだ人だけ。左上にテーブル名・外部キー・テンプレートの規約、上の中央に created_at と updated_at の自動の設定がある。下の中央に normalizes と validates があり、モデルに宣言され、すべての経路で成り立たせる。右下に default_scope、after_save のメール、Current を読む既定値があり、呼び出しの結果を変えるので呼び出し側に書く。右下の領域が明示する対象"
    >
      <rect x={x0 + (w * 2) / 3} y={y0 + h / 2} width={w / 3} height={h / 2} fill="var(--fig-box)" stroke="var(--fig-danger)" strokeDasharray="5 4" />
      <line x1={x0} y1={y0} x2={x0} y2={y0 + h} stroke="var(--fig-line)" />
      <line x1={x0} y1={y0 + h} x2={x0 + w} y2={y0 + h} stroke="var(--fig-line)" />
      <line x1={x0} y1={y0 + h / 2} x2={x0 + w} y2={y0 + h / 2} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={x0 + w / 3} y1={y0} x2={x0 + w / 3} y2={y0 + h} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={x0 + (w * 2) / 3} y1={y0} x2={x0 + (w * 2) / 3} y2={y0 + h} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={y0 + 50} fs={12} bold>
        Rails を使う人
      </T>
      <T x={10} y={y0 + 68} fs={12} bold>
        全員が知っている
      </T>
      <T x={10} y={y0 + 88} fs={11} tone="muted">
        （ガイドに書かれている）
      </T>
      <T x={10} y={y0 + 200} fs={12} bold>
        そのアプリの
      </T>
      <T x={10} y={y0 + 218} fs={12} bold>
        モデルを読んだ人
      </T>
      <T x={10} y={y0 + 236} fs={12} bold>
        だけが知っている
      </T>
      <T x={x0 + w / 6} y={y0 + h + 20} fs={12} anchor="middle">
        名前と場所の対応
      </T>
      <T x={x0 + w / 2} y={y0 + h + 20} fs={12} anchor="middle">
        値の整形・検証
      </T>
      <T x={x0 + (w * 5) / 6} y={y0 + h + 20} fs={12} anchor="middle">
        対象の行・外部への副作用
      </T>
      <T x={x0 + w / 2} y={y0 + h + 44} fs={12} anchor="middle" tone="muted">
        暗黙に決まることの種類
      </T>
      <T x={x0 + w / 2} y={22} fs={12} anchor="middle" tone="muted">
        それを知っている人の範囲（縦）と、決まることの種類（横）
      </T>

      <Box x={x0 + 12} y={y0 + 20} w={176} h={84} lines={['CoC の規約', 'Order → orders', 'belongs_to → user_id', 'index → index.html.erb']} fs={11} subTone="muted" />
      <Box x={x0 + 212} y={y0 + 20} w={176} h={60} lines={['timestamps', 'created_at・updated_at', 'を自動で入れる']} fs={11} subTone="muted" />
      <Box x={x0 + 212} y={y0 + 170} w={176} h={84} lines={['normalizes・validates', 'モデルの先頭に宣言', 'すべての経路で', '成り立たせる']} fs={11} subTone="muted" />
      <Box x={x0 + 412} y={y0 + 162} w={176} h={40} lines={['default_scope（行を絞る）']} fs={11} accent />
      <Box x={x0 + 412} y={y0 + 208} w={176} h={40} lines={['after_save のメール送信']} fs={11} accent />
      <Box x={x0 + 412} y={y0 + 254} w={176} h={40} lines={['Current を読む既定値']} fs={11} accent />
      <T x={x0 + w / 6} y={y0 + 130} fs={11} anchor="middle" tone="acc">
        暗黙でよい
      </T>
      <T x={x0 + w / 2} y={y0 + 110} fs={11} anchor="middle" tone="acc">
        暗黙でよい
      </T>
      <T x={x0 + w / 2} y={y0 + 270} fs={11} anchor="middle" tone="acc">
        宣言を読めばわかる
      </T>
      <T x={x0 + (w * 5) / 6} y={y0 + 100} fs={11} anchor="middle" tone="muted">
        （この種類の処理は、アプリが
      </T>
      <T x={x0 + (w * 5) / 6} y={y0 + 116} fs={11} anchor="middle" tone="muted">
        モデルに書いたときだけ加わる）
      </T>
      <T x={x0 + (w * 5) / 6} y={y0 + h / 2 - 8} fs={11} anchor="middle" tone="danger">
        呼び出し側に書く
      </T>
    </Svg>
  )
}

/* ---------- 図 43-5 明示にした後の呼び出しの流れ ---------- */
function BeforeAfterFigure() {
  const rows: { caller: string; before: string[]; after: string[] }[] = [
    { caller: '月次の集計', before: ['Order.where(…).count', '→ 暗黙に canceled_at IS NULL'], after: ['Order.where(…).count', 'Order.where(…).active.count'] },
    { caller: '問い合わせの画面', before: ['Order.find(id)', '→ キャンセル済みは見つからない'], after: ['Order.find(id)', '（キャンセル済みも開ける）'] },
    { caller: 'データの移行', before: ['find_each { update!(status:) }', '→ after_save でメールが届く'], after: ['update_all(status: "shipped")', '（コールバックもメールもなし）'] },
    { caller: '出荷の画面', before: ['order.update!(status: "shipped")', '→ after_save でメールが届く'], after: ['order.ship!', '→ update! と OrderMailer.shipped'] },
  ]
  const top = 36
  const rh = 74
  return (
    <Svg
      id="43-5"
      w={760}
      h={top + rows.length * rh + 4}
      label={`呼び出し元ごとに、適用前に書いたコードと実際に起きたこと、適用後に書くコードを並べた図。${rows
        .map((r) => `${r.caller}：適用前は ${r.before.join(' ')}。適用後は ${r.after.join(' ')}`)
        .join('。')}`}
    >
      <T x={10} y={14} fs={12} bold>
        呼び出し元
      </T>
      <T x={170} y={14} fs={12} bold tone="danger">
        適用前（書いたコード → 隠れて起きること）
      </T>
      <T x={480} y={14} fs={12} bold>
        適用後（呼び出し側に書くコード）
      </T>
      <line x1={466} y1={26} x2={466} y2={top + rows.length * rh} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {rows.map((r, i) => {
        const y = top + i * rh
        return (
          <g key={r.caller}>
            <Box x={10} y={y + 8} w={130} h={44} lines={r.caller} fs={12} />
            <Arrow x1={140} y1={y + 30} x2={166} y2={y + 30} />
            <Box x={168} y={y + 4} w={284} h={52} lines={r.before} fs={11} mono subTone="danger" />
            <Arrow d={`M140,${y + 46} L156,${y + 46} L156,${y + 66} L494,${y + 66} L494,${y + 58}`} />
            <Box x={480} y={y + 4} w={270} h={52} lines={r.after} fs={11} mono fill="box5" accent subTone="muted" />
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 62,
  part: 8,
  title: 'Explicit over Implicit：default_scope とコールバックに隠れた処理を表に出す',
  summary:
    '注文のモデルに書いた default_scope とコールバックを例に、月次の集計の件数が合わない・キャンセルした注文を開けない・データの移行でお客さまにメールが届く、という問題を動かして確かめます。Rails の Convention over Configuration による暗黙と、アプリのモデルに隠れた副作用の違いを区別し、絞り込みと通知を呼び出し側に書く形に直します。',
  goals: [
    'default_scope とコールバックが、呼び出し側のコードに現れない処理を加え、集計やデータの移行で不具合を起こす仕組みを説明できる',
    'Explicit over Implicit の由来（PEP 20 の The Zen of Python）と、POLA・Dependency Injection との違いを説明できる',
    'Convention over Configuration による暗黙と、default_scope・コールバックによる隠れた副作用を、知っている人の範囲・決めることの種類・失敗の仕方で区別できる',
    'default_scope を名前付きのスコープに、通知のコールバックを名前の付いた操作のメソッドに置き換え、データの移行で通知を出さない書き方を選べる',
    'normalizes・validates のように、すべての経路で成り立たせる処理は宣言のまま残す判断ができる',
  ],
  sections: [
    {
      id: 'scene',
      title: '集計の件数が合わない注文と、データの移行で届いたメール',
      body: (
        <>
          <p>
            この章では通販サイトの注文のモデルを例に、Explicit over Implicit（暗黙より明示）を扱います。モデルに書いた default_scope とコールバックは、モデルを使うすべてのコードに処理を加えます。呼び出し側のコードにはその処理が現れないので、呼び出した人は加わった処理を知らないまま結果を受け取ります。
          </p>
          <h3>そもそも default_scope とコールバックは何をするのか</h3>
          <p>
            <Term en="default_scope">default_scope</Term> は、モデルに対するすべての検索に、決まった条件を自動で加える Active Record の機能です。たとえば <code>default_scope {'{'} where(canceled_at: nil) {'}'}</code> と書くと、<code>Order.all</code> も <code>Order.count</code> も <code>Order.find(id)</code> も、SQL に <code>canceled_at IS NULL</code> の条件が付きます。Rails のガイドは、モデルへのすべての検索に適用したいスコープがあるときに使う機能として説明しています。<Ref n={4} />
          </p>
          <p>
            コールバックは保存や削除の決まった時点で実行する処理をモデルに宣言する機能です。<code>after_save :notify_status_change</code> と書くと、<code>save</code> や <code>update!</code> で保存した後に、どこから保存したかにかかわらず notify_status_change が実行されます。コールバックの基本は <ChapterLink n={14} section="callback-basics" /> で扱っています。
          </p>
          <p>
            どちらも、モデルを使うコードに何も書かなくても処理が加わる仕組みです。この章では、モデルを使う側のコードに現れない処理を<Term en="hidden side effect">隠れた副作用</Term>と呼びます。ここでの副作用はメールの送信のような外への処理に加えて、検索の対象の行が変わることも含みます。
          </p>
          <h3>場面：キャンセルした注文を画面に出さないために</h3>
          <p>
            このサイトの注文は orders テーブルに保存します。お客さまが注文をキャンセルすると、行は消さずに <code>canceled_at</code> にキャンセルした日時を入れます。注文の一覧や注文の詳細の画面には、キャンセルした注文を出しません。ある開発者が画面ごとに条件を書くのを省くために、Order に default_scope を書きました。同じ時期に、注文の状態が変わったらお客さまにお知らせのメールを送る処理を after_save に書きました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.string :status, null: false, default: "pending" # pending・shipped（以前は発送済みを sent と保存していた）
      t.integer :total, null: false
      t.datetime :canceled_at # キャンセルした日時
      t.timestamps
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order.rb（適用前）"
            code={`
class Order < ApplicationRecord
  belongs_to :user

  # キャンセルした注文は、どの画面にも出さない
  default_scope { where(canceled_at: nil) }

  # 状態が変わったら、注文した人にお知らせを送る
  after_save :notify_status_change, if: :saved_change_to_status?

  private

  def notify_status_change
    OrderMailer.with(order: self).status_changed.deliver_later
  end
end
`}
          />
          <p>
            この Order を、3つの別の仕事が使います。経理の担当者が見る月次の集計、サポートの担当者がお客さまの問い合わせに答えるときに使う注文の画面、そして状態の名前を整理するデータの移行です。以前のシステムは発送済みの注文の状態を <code>sent</code> と保存していたので、新しい名前の <code>shipped</code> にそろえることになりました。
          </p>
          <Figure n="43-1" title="注文のモデルを使う3つの仕事と、問題が起きる箇所" caption="色の付いた枠が Order。点線の枠の default_scope と after_save は、左の3つの呼び出し側のコードには現れない。">
            <SceneFigure />
          </Figure>
          <p>
            図 43-1 で、3つの仕事の担当者が書くのは左の矢印に添えたコードだけです。Order の中の点線の枠の処理は Order のファイルを開かないと見えません。
          </p>
          <h3>動かして確かめる</h3>
          <p>
            script/scene.rb で、佐藤さんと鈴木さんの11月の注文を5件作りました。佐藤さんの3件目（ID 3）はキャンセル済みで、状態は sent のままです。sent の注文は全部で3件あります。作ったときのお知らせのメールは数えません。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（抜粋）"
            code={`
month = Time.zone.local(2026, 11, 1).all_month
puts "注文の件数: #{Order.where(created_at: month).count}件（決済代行の明細は5件）"
puts "キャンセルした件数: #{Order.where.not(canceled_at: nil).count}件"
puts Order.where.not(canceled_at: nil).to_sql

Order.find(canceled.id)                  # 問い合わせ対応で、キャンセルした注文を開く

sato.orders.unscoped.count               # 佐藤さんの注文を、キャンセルも含めて数える

# データの移行：発送済みの状態の名前を sent から shipped に変える
Order.where(status: "sent").find_each { |o| o.update!(status: "shipped") }
# …（省略。結果の表示）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
== 1. 11月の集計
注文の件数: 4件（決済代行の明細は5件）
キャンセルした件数: 0件
SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`canceled_at\` IS NULL AND \`orders\`.\`canceled_at\` IS NOT NULL
== 2. 問い合わせ対応で、キャンセルした注文を開く
Order.find(3) => ActiveRecord::RecordNotFound
== 3. 佐藤さんの注文を、キャンセルも含めて数える
sato.orders.unscoped.count => 5
SELECT \`orders\`.* FROM \`orders\`
== 4. データの移行：発送済みの状態の名前を sent から shipped に変える
送られたメール: 2通
  sato@example.com「注文の状況が変わりました」
  suzuki@example.com「注文の状況が変わりました」
sent のまま残った注文: [3]
`}
          />
          <p>
            1では、11月の注文の件数が4件になりました。決済代行の会社から届く明細には、キャンセルした注文も含めて5件あります。経理の担当者は差の1件の理由を調べることになりますが、集計のコード（<code>Order.where(created_at: month).count</code>）を読んでも、キャンセルを除いていることはわかりません。キャンセルした件数は0件でした。to_sql で SQL を表示すると、<code>canceled_at IS NULL AND canceled_at IS NOT NULL</code> という、どの行も満たさない条件になっています。default_scope の条件と、書いた where.not の条件が AND でつながったからです。
          </p>
          <p>
            2では、キャンセルした注文を ID で開こうとして RecordNotFound になりました。行は DB にあるのに、<code>Order.find</code> にも canceled_at の条件が付くからです。お客さまが「キャンセルした注文の返金はどうなっていますか」と問い合わせても、サポートの画面で注文を開けません。
          </p>
          <p>
            3では、default_scope を外すつもりで <code>unscoped</code> を使い、佐藤さんの注文を数えました。結果は5件で、これは佐藤さんの注文（3件）を含む全員の注文の数です。unscoped は default_scope だけでなく、関連の <code>user_id = ?</code> の条件まで外します。Rails の API ドキュメントにも、<code>User.find(1).posts.unscoped</code> が <code>SELECT * FROM posts</code> になる例が載っています。<Ref n={5} />
          </p>
          <p>
            4のデータの移行では、お客さま2人に「注文の状況が変わりました」のメールが届きました。移行を書いた人は状態の名前を書き換えただけですが、update! が保存するたびに after_save が実行されたからです。さらに、キャンセルした ID 3 の注文は移行されずに sent のまま残りました。移行の対象を選ぶ <code>Order.where(status: "sent")</code> にも default_scope の条件が付いたからです。sent を前提にしたコードを消した後で、この注文を読む処理がエラーになる可能性があります。
          </p>
          <Figure n="43-2" title="書いたコードと、実際に実行される SQL と処理" caption="左が呼び出し側に書いたコード、中央が実行された SQL と処理。default_scope の条件とコールバックが、書いていないのに加わっている。">
            <WrittenVsRunFigure />
          </Figure>
          <p>
            図 43-2 は、書いたコードと実際に実行された SQL と処理を並べたものです。どの行でも、中央の列には左の列に書いていない条件や処理が含まれています。右の列の結果はどれも例外にならず（2を除く）、件数やメールとして表に出ます。
          </p>
          <h3>default_scope はどの操作に加わるか</h3>
          <p>
            script/scope_probe.rb で、有効な注文1件とキャンセルした注文1件を作り、default_scope がどの操作に加わるかを確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scope_probe.rb。適用前の Order）"
            code={`
Order.count                                    => 1
sato.orders.count                              => 1
User.joins(:orders).count                      => 1
Order.find(canceled.id)                        => ActiveRecord::RecordNotFound
canceled.reload                                => :reloaded
Order.update_all(total: 0)                     => 1
Order.unscoped.count                           => 2
Order.unscope(where: :canceled_at).count       => 2
sato.orders.unscope(where: :canceled_at).count => 2
`}
          />
          <Figure n="43-3" title="default_scope の条件が加わる操作と、加わらない操作" caption="Rails 8.1.4.1 で、default_scope { where(canceled_at: nil) } を書いた Order で確かめた結果。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">操作</th>
                    <th scope="col">条件が加わるか</th>
                    <th scope="col">結果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>Order.count</code>・<code>Order.where(…)</code></td>
                    <td>加わる</td>
                    <td>キャンセルした注文を数えない</td>
                  </tr>
                  <tr>
                    <td><code>sato.orders</code>・<code>User.joins(:orders)</code></td>
                    <td>加わる</td>
                    <td>関連や JOIN を通しても除かれる</td>
                  </tr>
                  <tr>
                    <td><code>Order.find(id)</code></td>
                    <td>加わる</td>
                    <td>キャンセルした注文は RecordNotFound</td>
                  </tr>
                  <tr>
                    <td><code>Order.update_all</code>・<code>delete_all</code></td>
                    <td>加わる</td>
                    <td>キャンセルした注文は更新されない</td>
                  </tr>
                  <tr>
                    <td><code>order.reload</code>・<code>order.update!</code></td>
                    <td>加わらない</td>
                    <td>読み込み済みのレコードは操作できる</td>
                  </tr>
                  <tr>
                    <td><code>Order.unscoped</code></td>
                    <td>外れる</td>
                    <td>関連の条件など、ほかの条件もすべて外れる</td>
                  </tr>
                  <tr>
                    <td><code>unscope(where: :canceled_at)</code></td>
                    <td>その条件だけ外れる</td>
                    <td>関連の条件は残る</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 43-3 のとおり、default_scope の条件は、検索・関連・JOIN・一括の更新まで加わります。一方で、読み込み済みのレコードの reload や update! には加わりません。Rails のソースのコメントも、default_scope はレコードの作成のときには使われ、レコードの更新や削除のときには使われないと説明しています。<Ref n={5} />
            条件を外す方法は2つあり、unscoped はすべての条件を外し、<code>unscope(where: :canceled_at)</code> はその列の条件だけを外します。どの操作に加わり、どう外すかは Order のファイルの1行からは読み取れません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>集計・問い合わせ・データの移行のコードを読んでも、キャンセルした注文が除かれることがわかりません。件数のずれは例外にならないので、気づくのは明細と突き合わせたときです。</li>
            <li>default_scope を外すための unscoped は、関連の条件まで外します。外し方を間違えると、ほかのお客さまの注文まで対象になります。</li>
            <li>after_save のメールは、画面の操作でもデータの移行でも同じように送られます。どこから保存したかをコールバックは区別しません。</li>
            <li>Order を使うコードを書くたびに、Order のファイルを開いて隠れた処理を確かめる必要があります。</li>
          </ul>
          <p>次の節で、この問題を避けるための原則 Explicit over Implicit を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Explicit over Implicit の意味と、The Zen of Python',
      body: (
        <>
          <h3>定義</h3>
          <p>
            <Term en="Explicit over Implicit">暗黙より明示</Term>は、この部では次の定義で扱います。
          </p>
          <ul>
            <li>暗黙的な動作より明示的な記述を優先する。</li>
            <li>隠れた依存関係や副作用を減らす。</li>
          </ul>
          <p>
            明示的な記述とは呼び出し側のコードを読めば、どの行が対象になり、何が保存され、外に何が送られるかがわかる書き方です。<code>Order.where(created_at: month).active.count</code> と書けば、キャンセルした注文を除くことが呼び出しから読めます。<code>order.ship!</code> と書けば、発送に伴う処理を呼んでいることが読め、定義を開けば何が起きるかがわかります。
          </p>
          <p>
            隠れた依存関係とは、コードが使っているのに引数や呼び出しに現れないものです。メソッドの中で読む環境変数、現在時刻、要求ごとの値を入れる <code>Current.user</code> などがあります。隠れた副作用とは呼び出し側に書いていないのに起きる処理で、この章の default_scope の条件とコールバックのメールがそれに当たります。
          </p>
          <h3>由来：PEP 20 の The Zen of Python</h3>
          <p>
            「Explicit is better than implicit.」は、Python の設計の考え方を短い文にまとめた The Zen of Python の2行目です。The Zen of Python は Tim Peters が書いた19の文で、2004年8月に PEP 20（Python の改善提案の文書の20番）として登録されました。PEP 20 は、Python の作者 Guido van Rossum の設計の指針を Tim Peters が20の格言にまとめ、そのうち19を書き出したものだと説明しています。もとは comp.lang.python のメーリングリストに「The Way of Python」という題の投稿で示されたものです。<Ref n={1} />
          </p>
          <p>
            同じ The Zen of Python には、「Errors should never pass silently.（エラーを黙って通してはいけない）」「In the face of ambiguity, refuse the temptation to guess.（あいまいなときに推測しない）」「There should be one-- and preferably only one --obvious way to do it.（明らかなやり方は1つ、できれば1つだけにする）」も並んでいます。<Ref n={1} />
            この章の集計の件数のずれは、条件が加わったことを誰にも知らせずに結果だけを返しているので、1つ目の文にも関係します。
          </p>
          <h3>Ruby と Rails の立場</h3>
          <p>
            Ruby と Rails は Python と比べて暗黙を多く使う考え方をとっています。The Rails Doctrine は、Python が「ものごとを行う方法は1つ、できれば1つだけ」を誇るのに対し、Ruby は表現の豊かさを大切にしたと書いています。<Ref n={2} />
            Rails の Convention over Configuration は、テーブル名や外部キーの名前をコードに書かずに規約で決める考え方です。そのため、Rails のアプリに Explicit over Implicit を当てはめるときに「暗黙をすべてなくす」と読むと、Rails の規約まで捨てることになります。
          </p>
          <p>
            この部では Explicit over Implicit を「呼び出し側の結果を変える処理を、その呼び出しを書く人が読める場所に置く」と具体的に読み替えます。どの暗黙を残し、どの暗黙を明示にするかは、<ChapterLink n={62} section="convention">次の節</ChapterLink>で区別します。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を目指すか</th>
                  <th scope="col">この章の場面での見え方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Explicit over Implicit</th>
                  <td>呼び出し側のコードから、対象・処理・依存先が読めること</td>
                  <td>集計のコードから、キャンセルを除くことが読めない</td>
                </tr>
                <tr>
                  <th scope="row">
                    POLA（<ChapterLink n={61} />）
                  </th>
                  <td>名前や API の動作が、使う人の予想と一致すること</td>
                  <td><code>Order.find(id)</code> は「ID の行を返す」と予想されるのに、キャンセル済みでは例外になる</td>
                </tr>
                <tr>
                  <th scope="row">
                    Dependency Injection（<ChapterLink n={40} />）
                  </th>
                  <td>依存先をクラスの中で作らず、引数で受け取ること</td>
                  <td>Current.user や現在時刻を、引数で渡して見えるようにする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            POLA との違いは問題を見る位置です。POLA は名前と動作の一致を見るので、名前を変えても直せます。Explicit over Implicit は呼び出し側から処理が読めるかを見るので、処理を呼び出し側に移すか、呼び出しの名前で処理を示す必要があります。Dependency Injection は、隠れた依存関係を引数に出す具体的な方法の1つです。Martin Fowler は、依存先を使うクラスがそれを自分で探すのではなく、外から渡す形をこの名前で説明しています。<Ref n={8} />
          </p>
        </>
      ),
    },
    {
      id: 'convention',
      title: '規約による暗黙と、隠れた副作用の違い',
      body: (
        <>
          <p>
            Rails のアプリには、コードに書かれていないのに決まっていることが多くあります。Order クラスは orders テーブルに、<code>belongs_to :user</code> は user_id 列に、OrdersController の index アクションは app/views/orders/index.html.erb に対応します。これらは Convention over Configuration（設定より規約）による暗黙です。この節では、この暗黙とdefault_scope やコールバックによる隠れた副作用を区別します。
          </p>
          <h3>4つの観点で比べる</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">規約による暗黙（CoC）</th>
                  <th scope="col">隠れた副作用（default_scope・コールバック）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">知っている人</th>
                  <td>Rails を使う人全員。ガイドに書かれ、どの Rails のアプリでも同じ</td>
                  <td>そのアプリのモデル（親クラスや concern を含む）を読んだ人だけ</td>
                </tr>
                <tr>
                  <th scope="row">決めること</th>
                  <td>名前と場所の対応（どのテーブル・列・テンプレートか）</td>
                  <td>どの行を対象にするか、保存のときに外へ何をするか</td>
                </tr>
                <tr>
                  <th scope="row">外れたときの失敗</th>
                  <td>テーブルやテンプレートが見つからず、例外になる</td>
                  <td>例外にならず、件数が少ない・メールが届くという結果になる</td>
                </tr>
                <tr>
                  <th scope="row">外し方</th>
                  <td><code>self.table_name =</code> のように書いて外し、外したことがコードに残る</td>
                  <td>unscoped は関連の条件まで外す。コールバックを外す方法は呼び出しごとに違う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            規約による暗黙は、知っている人の範囲が Rails を使う人全員なので、Order のファイルを開かなくても「orders テーブルを使う」と読めます。The Rails Doctrine は、Person クラスが people テーブルに対応するような規約は、初心者が理由を知らなくても恩恵を受けられると述べています。<Ref n={2} />
            一方、default_scope の条件はこのアプリの Order にだけ書かれていて、Rails を知っていても読めません。
          </p>
          <p>規約から外れたときの失敗の仕方も違います。shipments テーブルを作る前に Shipment モデルを使うと、次のようになりました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/convention_probe.rb）"
            code={`
ActiveRecord::StatementInvalid: Mysql2::Error: Table 'ch62_test.shipments' doesn't exist
Order.table_name => "orders"
Order.reflect_on_association(:user).foreign_key => "user_id"
`}
          />
          <p>
            規約の対応が成り立たないと、最初の検索で例外になります。規約で決まった値は <code>Order.table_name</code> や関連の <code>foreign_key</code> で取り出して確かめることもできます。default_scope の条件が加わったときは、例外にならずに件数が4件になりました。失敗が例外として表に出るかどうかが、テストや運用で気づけるかどうかを左右します。
          </p>
          <Figure
            n="43-4"
            title="規約による暗黙と、隠れた副作用の位置"
            caption="縦は、それを知っている人の範囲、横は、暗黙に決まることの種類。赤の点線で囲んだ右下が、呼び出し側に書く対象。模式図で、位置は本書の判断による。"
          >
            <ConventionVsHiddenFigure />
          </Figure>
          <p>
            図 43-4 は、Rails のアプリにある暗黙を、知っている人の範囲と、決まることの種類で並べたものです。左上の CoC の規約と上の中央の timestamps は、Rails を使う人全員が知っています。下の中央の normalizes と validates は、アプリのモデルに書かれた宣言ですが、決めるのは値の整形と検証で、どの経路で保存しても成り立たせたい条件です。右下の default_scope、after_save のメール、Current を読む既定値は、アプリのモデルにだけ書かれ、呼び出しの結果（対象の行・外に送るもの・使う値）を変えます。この右下を、呼び出し側に書く対象にします。
          </p>
          <h3>コールバックそのものを避けるのではない</h3>
          <p>
            右下に置いたのはコールバックに置いた処理の種類で、コールバックの仕組みそのものは対象にしていません。<ChapterLink n={31} section="callbacks-current" /> で紹介したように、37signals の Basecamp は、プロジェクトの作成に付随する単純な処理を after_create に書いています。<Ref n={7} />
            <ChapterLink n={30} section="callback-design" /> の表も、自分の属性の正規化や軽い導出値はコールバックに置ける処理とし、メールの送信や外部 API の呼び出しは、すべての保存経路で必要な場合を除いて、操作のメソッドから呼ぶものとしています。この章の after_save のメールは、データの移行では送りたくないので、後者に当たります。
          </p>
          <Callout kind="note" title="Doctrine の Provide sharp knives との関係">
            <p>
              The Rails Doctrine の「Provide sharp knives」の柱は、誤って使うと害のある強力な機能も、禁止するのではなく、規約と教育で正しく使えるようにすると述べ、例に concern を挙げています。<Ref n={2} />
              本書の <ChapterLink n={31} section="doctrine" /> では、コールバックと CurrentAttributes もこの柱に関わる機能として扱いました。この章の判断も、これらの機能を使ったうえで、呼び出しの結果を変える処理を置くかどうかを図 43-4 の位置で決めるものです。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'apply',
      title: '絞り込みと通知を、呼び出し側に書く形に直す',
      body: (
        <>
          <h3>直す順序</h3>
          <p>default_scope もコールバックも、消した瞬間に、それを前提にしていたすべての呼び出しの結果が変わります。次の順に、小さく分けて直します。</p>
          <ol>
            <li>名前付きのスコープ <code>active</code> と <code>canceled</code> を足す。この時点では default_scope を残す。</li>
            <li>Order を検索している箇所を探し、キャンセルを除きたい箇所に <code>.active</code> を書き足す。画面の一覧や詳細は <code>Order.active</code> から始める。</li>
            <li>default_scope を消す。.active を書き足さなかった箇所（集計・問い合わせ・データの移行）は、キャンセルした注文も対象になる。そのことを、集計の担当者と確かめる。</li>
            <li>状態を変える業務の操作に名前を付け（<code>ship!</code>）、その中でメールを送る。画面とジョブの呼び出しを、update! から ship! に書き換える。</li>
            <li>after_save のコールバックを消す。4と5は同じリリースに入れ、メールが1回だけ送られることをテストで確かめる。</li>
          </ol>
          <p>
            2で探すときは、<code>grep -rn "Order\.\|\.orders" app lib</code> のように、クラス名と関連名の両方で探します。default_scope は関連（<code>user.orders</code>）や JOIN（<code>User.joins(:orders)</code>）にも加わっていたからです。3で default_scope を消す前に、.active を書き足した箇所としなかった箇所の一覧を作っておくと、レビューで確かめられます。
          </p>
          <p>
            4と5を別のリリースに分けると、ship! のメールと after_save のメールが両方送られる期間ができます。<ChapterLink n={30} section="callback-design" /> でも、コールバックを消す変更と、明示的な呼び出しを足す変更を同じリリースに入れるよう説明しました。
          </p>
          <h3>直したコード</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb（適用後）"
            code={`
class Order < ApplicationRecord
  belongs_to :user

  scope :active,   -> { where(canceled_at: nil) }
  scope :canceled, -> { where.not(canceled_at: nil) }

  # 発送済みにして、注文した人に発送のお知らせを送る
  def ship!
    update!(status: "shipped")
    OrderMailer.with(order: self).shipped.deliver_later
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/mailers/order_mailer.rb（適用後）"
            code={`
class OrderMailer < ApplicationMailer
  def shipped
    @order = params[:order]
    mail to: @order.user.email, subject: "注文の商品を発送しました"
  end
end
`}
          />
          <p>
            キャンセルした注文を除く条件は、<code>active</code> という名前のスコープにしました。名前付きのスコープは、呼び出し側が <code>Order.active</code> と書いたときだけ条件を加えます。スコープの設計は <ChapterLink n={12} section="scope-design" /> で扱っています。
          </p>
          <p>
            お知らせのメールは、「状態が変わったら」という保存のたびの条件から外し、「発送する」という業務の操作に結び付けました。<code>ship!</code> を呼んだときだけメールが送られ、データの移行の update! や update_all では送られません。お知らせの文面もどの状態になったかを伝える「状況が変わりました」から、何が起きたかを伝える「発送しました」に変えています。
          </p>
          <p>呼び出し側のコードは次のようになります。</p>
          <Code
            lang="ruby"
            title="script/after.rb（抜粋）"
            code={`
month = Time.zone.local(2026, 11, 1).all_month
Order.where(created_at: month).count          # キャンセルを含む件数
Order.where(created_at: month).active.count   # 有効な注文だけ
Order.where(created_at: month).canceled.count # キャンセルだけ

Order.find(canceled.id)                       # 問い合わせ対応：キャンセルした注文も開ける

# データの移行：状態の名前だけを変える。コールバックを通さないことを update_all で示す
Order.where(status: "sent").update_all(status: "shipped", updated_at: Time.current)

pending.ship!                                 # 出荷の画面：発送してお知らせを送る
`}
          />
          <p>
            データの移行では <code>update_all</code> を使いました。update_all は1つの UPDATE 文を実行し、検証もコールバックも通しません。Rails のガイドは、コールバックを飛ばすメソッドには大切な業務の規則が含まれる場合があるので注意して使うよう書いています。<Ref n={3} />
            この移行は状態の名前を書き換えるだけで、業務の操作ではないので、コールバックを通さないことがこの場面の目的に合っています。メソッドの名前（update_all）から、1つの SQL で更新することが読めます。
          </p>
          <h3>実行結果</h3>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/after.rb）"
            code={`
== 1. 11月の集計
注文の件数（キャンセルを含む）: 5件
うち有効な注文: 4件 / キャンセル: 1件
== 2. 問い合わせ対応で、キャンセルした注文を開く
Order.find(3).canceled_at => 2026-11-11
== 3. 佐藤さんの注文
sato.orders.count => 3 / sato.orders.active.count => 2
== 4. データの移行：発送済みの状態の名前を sent から shipped に変える
update_all => 3件
送られたメール: 0通
sent のまま残った注文: []
== 5. 出荷の画面で、鈴木さんの注文を発送する（ship!）
送られたメール: suzuki@example.com「注文の商品を発送しました」
`}
          />
          <p>
            1では、キャンセルを含む件数が決済代行の明細と同じ5件になり、有効な注文とキャンセルの件数も別々に出せました。2では、キャンセルした注文を ID で開けました。3では、関連の <code>sato.orders</code> は佐藤さんの3件を数え、<code>.active</code> を付けると2件になります。unscoped を使う必要はありません。
          </p>
          <p>
            4のデータの移行は、キャンセルした注文を含む3件を書き換え、メールは送られず、sent のまま残った注文もありません。5では、ship! を呼んだときだけ、鈴木さんに発送のお知らせが届きました。
          </p>
          <Figure n="43-5" title="直す前と後の呼び出しの流れ" caption="左の赤の行が、適用前に呼び出し側から見えなかった処理。適用後は、絞り込みと通知が呼び出し側のコードに書かれている。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 43-5 は、4つの呼び出し元について、適用前に書いたコードと隠れて起きたこと、適用後に書くコードを並べたものです。適用後の列では、キャンセルを除くかどうか（.active）、コールバックを通すかどうか（update_all）、メールを送るかどうか（ship!）が、それぞれの呼び出しに書かれています。呼び出し元の担当者は Order のファイルを開かなくても、自分の書いたコードから結果を読めます。
          </p>
          <h3>テストで固定する</h3>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Order do
  include ActiveJob::TestHelper

  let(:user) { User.create!(name: "佐藤", email: "sato@example.com") }
  let!(:order) { user.orders.create!(total: 3000) }
  let!(:canceled) { user.orders.create!(total: 2000, canceled_at: Time.current) }

  it "Order.count はキャンセルした注文も数える。絞り込みは呼び出し側が選ぶ" do
    expect(Order.count).to eq 2
    expect(Order.active).to eq [order]
    expect(Order.canceled).to eq [canceled]
    expect(Order.find(canceled.id)).to eq canceled
  end

  it "update! で状態を変えても、メールを送らない" do
    expect { order.update!(status: "shipped") }.not_to have_enqueued_mail
  end

  it "ship! は発送済みにして、発送のお知らせを1通送る" do
    expect { order.ship! }.to have_enqueued_mail(OrderMailer, :shipped).once
    expect(order.reload.status).to eq "shipped"
  end
end
`}
          />
          <p>
            2つ目の例は「update! ではメールを送らない」ことを確かめています。後から誰かが after_save を足してメールを送るようにすると、この例が失敗します。隠れた副作用が再び加わったことを、テストで見つけられます。
          </p>
          <Callout kind="warn" title="ジョブの投入とトランザクション">
            <p>
              ship! は update! の後にメールのジョブを投入します。検証のアプリ（load_defaults 8.1）では、<code>ActiveJob::Base.enqueue_after_transaction_commit</code> は false でした。<Ref n={9} />
              この設定で、トランザクションの中で ship! を呼んでから ActiveRecord::Rollback でロールバックすると、注文の状態は pending に戻り、メールのジョブ（ActionMailer::MailDeliveryJob）は投入されたまま残りました（script/tx_probe.rb）。ほかの保存と一緒にトランザクションの中で呼ぶ場合は、トランザクションの外で ship! を呼ぶか、コミットの後に投入する方法を選びます。after_commit とジョブの投入の関係は <ChapterLink n={14} section="after-commit" /> と <ChapterLink n={18} section="transaction" /> で扱っています。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: 'すべてを明示しようとしたとき',
      body: (
        <>
          <h3>規約で決まることまで書き出す</h3>
          <p>
            「暗黙をなくす」方針を Rails の規約にまで当てはめると、規約で決まる値をすべてコードに書くことになります。次の ExplicitOrder は Order と同じ orders テーブルを使い、テーブル名・主キー・関連のクラス名・外部キーを書き出したクラスです。
          </p>
          <Code
            lang="ruby"
            title="script/overuse.rb（規約で決まることを、すべて書き出した版）"
            code={`
class ExplicitOrder < ApplicationRecord
  self.table_name = "orders"
  self.primary_key = "id"
  belongs_to :user, class_name: "User", foreign_key: "user_id", inverse_of: false
end
puts ExplicitOrder.joins(:user).to_sql
puts Order.joins(:user).to_sql
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb の該当部分）"
            code={`
SELECT \`orders\`.* FROM \`orders\` INNER JOIN \`users\` ON \`users\`.\`id\` = \`orders\`.\`user_id\`
SELECT \`orders\`.* FROM \`orders\` INNER JOIN \`users\` ON \`users\`.\`id\` = \`orders\`.\`user_id\`
`}
          />
          <p>
            2つの SQL は同じです。書き出した4つの値は、どれも規約が決める値と同じなので、動作は何も変わっていません。読む人は、書かれた値が規約と同じなのか、規約から外れているのかを1つずつ確かめることになります。規約から外れる箇所（たとえば古いテーブル名を使い続けるモデル）があっても、ほかの書き出した値に紛れて目立たなくなります。
          </p>
          <p>
            The Rails Doctrine は、規約から外れるべきときを知ることが難しい点だと述べ、Rails から外れる費用は低く見積もられがちだと書いています。<Ref n={2} />
            規約の値は書かず、規約から外れるときだけ <code>self.table_name =</code> のように書くと、書いてあること自体が「ここは規約と違う」という印になります。
          </p>
          <h3>すべての経路で成り立たせたい処理を、呼び出し側に移す</h3>
          <p>
            もう1つの当てはめすぎは、宣言で済む処理まで呼び出し側に移すことです。適用後の User は、メールアドレスを小文字にして前後の空白を除く処理を <code>normalizes</code> で宣言しています。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb（適用後）"
            code={`
class User < ApplicationRecord
  has_many :orders

  normalizes :email, with: ->(email) { email.strip.downcase }
end
`}
          />
          <p>
            「モデルに暗黙の処理を置かない」として normalizes をやめ、保存する側で <code>EmailNormalizer.call</code> を呼ぶ形にしたとします。会員登録の画面では呼びましたが、CSV からの取り込みでは呼び忘れました。検証では User と同じ users テーブルを使う別のクラス PlainUser で動かしました。
          </p>
          <Code
            lang="ruby"
            title="script/overuse.rb（normalizes を使わない版）"
            code={`
class PlainUser < ApplicationRecord
  self.table_name = "users"
end

module EmailNormalizer
  def self.call(email) = email.strip.downcase
end

# 会員登録の画面：整えてから保存する
PlainUser.create!(name: "佐藤", email: EmailNormalizer.call(" Sato@Example.com"))
# CSV からの取り込み：整える呼び出しを書き忘れた
PlainUser.create!(name: "田中", email: " Tanaka@Example.com")

# ログイン：入力を整えてから探す
PlainUser.find_by(email: EmailNormalizer.call("tanaka@example.com"))
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb の該当部分）"
            code={`
== normalizes を使わない版
保存された email: ["sato@example.com", " Tanaka@Example.com"]
ログイン（sato@example.com）: 見つかった
ログイン（tanaka@example.com）: 見つからない
== normalizes を使う版（app/models/user.rb）
保存された email: ["sato@example.com", "tanaka@example.com"]
ログイン（sato@example.com）: 見つかった
ログイン（TANAKA@example.com）: 見つかった
`}
          />
          <p>
            呼び忘れた取り込みの経路では、先頭に空白が付いたままのアドレスが保存され、田中さんはログインできませんでした。MySQL の既定の照合順序は大文字と小文字を区別しないので、この結果の原因は先頭の空白です。normalizes を使う版では、取り込みでも同じ宣言が使われ、検索の <code>find_by(email: "TANAKA@example.com")</code> の値も同じ規則で整えられて見つかりました。
          </p>
          <p>
            Active Model の normalizes のドキュメントは、宣言した整形が属性への代入と検証のときに使われ、<code>find_by</code> や <code>where</code> にハッシュで渡した値にも使われる一方、<code>where(["email = ?", …])</code> のような文字列の条件には使われないと説明しています。<Ref n={6} />
            検証の Rails 8.1.4.1 では insert_all と update_all で入れた値も整えられました。メールアドレスの形をそろえることは、どの経路で保存しても成り立たせたい条件です。飛ばしたい呼び出し元がない処理を呼び出し側に移すと、書き忘れた経路の分だけデータがずれます。
          </p>
          <h3>判断の目安</h3>
          <p>宣言（暗黙）に置くか、呼び出し側に書くかは、「その処理を飛ばしたい呼び出し元があるか」と「その処理が呼び出しの結果を変えるか」で決めます。</p>
          <Figure n="43-6" title="宣言に置く処理と、呼び出し側に書く処理" caption="「飛ばしたい呼び出し元」は、データの移行、管理画面での修正、一括の取り込みなど、通常の画面と目的の違う呼び出し元を指す。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">処理</th>
                    <th scope="col">飛ばしたい呼び出し元</th>
                    <th scope="col">置き場所</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>テーブル名・外部キー・テンプレートの対応</td>
                    <td>ない</td>
                    <td>規約に任せる。外れるときだけ書く</td>
                  </tr>
                  <tr>
                    <td>値の整形（normalizes）・すべての画面に共通の検証</td>
                    <td>ない</td>
                    <td>モデルに宣言する。DB の制約（NOT NULL・一意・外部キー）と組み合わせる</td>
                  </tr>
                  <tr>
                    <td>画面ごとに違う検証</td>
                    <td>ある（ほかの画面）</td>
                    <td>その画面の Form Object などに書く</td>
                  </tr>
                  <tr>
                    <td>対象の行の絞り込み（キャンセル・退会・非公開）</td>
                    <td>ある（集計・問い合わせ・移行）</td>
                    <td>名前付きのスコープにして、呼び出し側で付ける。default_scope にしない</td>
                  </tr>
                  <tr>
                    <td>メール・外部 API の呼び出し・別のモデルの更新</td>
                    <td>ある（移行・管理画面）</td>
                    <td>名前の付いた操作のメソッドから呼ぶ</td>
                  </tr>
                  <tr>
                    <td>どの保存でも必ず必要な通知（監査の記録など）</td>
                    <td>ない</td>
                    <td>after_commit からジョブに依頼してよい。飛ばす経路（update_all など）を把握しておく</td>
                  </tr>
                  <tr>
                    <td>要求ごとの値（Current.user）</td>
                    <td>ジョブ・コンソールでは値がない</td>
                    <td>業務の入力は引数で渡す。作成者の既定値のような少数の用途に限る</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 43-6 の上の2行は、どの呼び出し元にとっても同じ結果になるべき処理なので、宣言のまま残します。下の行の多くは、呼び出し元によって必要かどうかが変わる処理なので、呼び出し側に書きます。画面ごとの検証の置き場所は <ChapterLink n={33} section="model-form-objects" /> で、Current の扱いは <ChapterLink n={31} section="callbacks-current" /> で扱っています。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能と Explicit over Implicit',
      body: (
        <>
          <h3>Rails が用意している、明示するための機能</h3>
          <p>Rails には暗黙の処理を加える機能と並んで、呼び出し側で明示するための機能もあります。</p>
          <ul>
            <li>名前付きのスコープ（<code>scope :active</code>）：呼び出し側が付けたときだけ条件を加えます。</li>
            <li>
              <code>unscope(where: :canceled_at)</code>：指定した条件だけを外します。unscoped と違い、関連の条件は残ります（図 43-3）。
            </li>
            <li>
              コールバックを通さないメソッド：<code>update_all</code>・<code>update_column</code>・<code>update_columns</code>・<code>insert_all</code>・<code>delete_all</code> などは、コールバックを実行しません。Rails のガイドは、これらのメソッドを一覧にしたうえで、コールバックにある業務の規則を飛ばすことになるので注意して使うよう書いています。<Ref n={3} />
            </li>
            <li>
              <code>after_create_commit</code> などのコミット後のコールバック：どの操作の確定に結び付けるかを名前で示せます（<ChapterLink n={14} section="after-commit" />）。
            </li>
          </ul>
          <p>
            default_scope には <code>all_queries: true</code> という指定もあります。Rails のソースのコメントによると、この指定を付けると、レコードの更新や削除のときにも default_scope の条件が加わります。<Ref n={5} />
            この指定は、default_scope が及ぶ範囲を広げるもので、呼び出し側から条件が見えないことは変わりません。
          </p>
          <h3>隠れた依存関係：Current と現在時刻</h3>
          <p>
            この章では副作用を中心に扱いましたが、定義のもう1つの対象である隠れた依存関係も、Rails のアプリでよく見かけます。<code>belongs_to :creator, default: -&gt; {'{'} Current.user {'}'}</code> のように、モデルの既定値が要求ごとの値を読むと、ジョブやコンソールから保存したときに値がなく、検証のエラーになります。<ChapterLink n={31} section="callbacks-current" /> では、Current.user が空のときに「Author must exist」になることを確かめ、業務の入力になる実行者はジョブの引数で渡す形を示しました。メソッドの中で <code>Time.current</code> や <code>ENV</code> を直接読むコードも、テストで結果が変わる原因になります。これらを引数で受け取る形にする方法は <ChapterLink n={40} section="idea" /> で扱っています。
          </p>
          <h3>Rails Doctrine から見た規約と隠れた処理</h3>
          <p>
            The Rails Doctrine の Convention over Configuration は、何度も出てくる小さな決定（主キーの名前など）を規約に任せることで、本当に大切な部分に時間を使えるようにする考え方です。<Ref n={2} />
            この章の default_scope とコールバックは、規約ではなく、このアプリで決めた処理です。Explicit over Implicit を Rails のアプリに当てはめるときは、規約に任せる部分と、アプリが決めた処理の部分を分けて考えます。Rails Doctrine と原則の対応は <ChapterLink n={56} section="rails-doctrine" /> で扱います。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>コールバックの基本、実行の順序、飛ばし方は <ChapterLink n={14} section="callback-basics" />・<ChapterLink n={14} section="skip" /> で扱っています。</li>
            <li>コールバックに置ける処理と置かない処理の表、コールバックの連鎖を整理する手順は <ChapterLink n={30} section="callback-design" /> にあります。</li>
            <li>DHH と Basecamp のコールバックと CurrentAttributes の使い方は <ChapterLink n={31} section="callbacks-current" /> で扱っています。</li>
            <li>名前と動作を一致させる考え方は <ChapterLink n={61} /> で、依存先を引数で受け取る方法は <ChapterLink n={40} /> で扱っています。</li>
            <li>コミットと通知の記録を確実にする方法は <ChapterLink n={34} section="external-boundaries" /> と <ChapterLink n={53} /> で扱っています。</li>
          </ul>
          <Callout kind="v72" title="normalizes は Rails 7.1 から">
            <p>
              normalizes は Rails 7.1 で入った機能です。<Ref n={10} />
              Rails 7.0 以前のアプリでは、<code>before_validation</code> で属性に代入して整えます（<ChapterLink n={30} section="callback-design" />）。検証に使った Rails 8.1.4.1 では、normalizes の実装は Active Model（activemodel/lib/active_model/attributes/normalization.rb）にあり、Active Record がそれを取り込んでいます。<Ref n={6} />
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>Explicit over Implicit は、暗黙的な動作より明示的な記述を優先し、隠れた依存関係や副作用を減らす原則です。由来は PEP 20 の The Zen of Python の「Explicit is better than implicit.」です。</li>
            <li>default_scope は検索・関連・JOIN・一括の更新に条件を加え、unscoped は関連の条件まで外します。集計の件数のずれやデータの移行漏れは例外にならないので、気づくのが遅れます。</li>
            <li>after_save のような保存のたびのコールバックは、どこから保存したかを区別しません。データの移行や管理画面での修正でも、お客さまへのメールが送られます。</li>
            <li>Convention over Configuration の暗黙は、Rails を使う人全員が知っていて、名前と場所の対応を決め、外れると例外になります。default_scope やコールバックの隠れた副作用は、アプリのモデルを読んだ人だけが知っていて、呼び出しの結果を変え、例外になりません。この2つを区別して扱います。</li>
            <li>直すときは、名前付きのスコープ（active・canceled）を呼び出し側で付け、通知は名前の付いた操作（ship!）から送ります。コールバックを消す変更と明示的な呼び出しを足す変更は、同じリリースに入れます。</li>
            <li>規約で決まる値を書き出したり、normalizes のように飛ばしたい呼び出し元がない処理を呼び出し側に移したりすると、読む量が増え、書き忘れた経路でデータがずれます。</li>
          </ul>
        </>
      ),
    },
  ],
  prerequisites: [12, 14, 30, 31, 61],
  sources: [
    { title: 'PEP 20 – The Zen of Python', publisher: 'Python Software Foundation / Tim Peters', url: 'https://peps.python.org/pep-0020/', accessed: '2026-11-21', version: '2004年8月19日作成', note: '「Explicit is better than implicit.」をはじめとする19の文、Guido van Rossum の設計の指針を Tim Peters がまとめたこと、comp.lang.python の「The Way of Python」の投稿が元であること。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Python の「方法は1つ」と Ruby の表現の豊かさの対比、Convention over Configuration（Person と people、初心者が理由を知らなくても恩恵を受けること、規約から外れる費用と判断の難しさ）、Provide sharp knives（concern の例）。' },
    { title: 'Active Record Callbacks', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'コールバックを飛ばすメソッドの一覧（update_all・update_columns・insert_all・delete_all など）と、業務の規則を飛ばすことになるので注意して使うこと。' },
    { title: 'Active Record Query Interface（Applying a Default Scope / Removing All Scoping）', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'default_scope がモデルへのすべての検索に適用されること、ハッシュで書いた条件は作成時にも使われ、更新時には使われないこと、unscoped。' },
    { title: 'activerecord/lib/active_record/scoping/default.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/scoping/default.rb#L24-L130`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'unscoped が関連の条件も外す例（User.find(1).posts.unscoped）、default_scope が作成時に使われ更新・削除時に使われないこと、all_queries: true。' },
    { title: 'activemodel/lib/active_model/attributes/normalization.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attributes/normalization.rb#L35-L115`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'normalizes が代入と検証のときに使われ、find_by・where・exists? にハッシュで渡した値にも使われ、文字列の条件には使われないこと。DB から読んだ値には使われないこと。' },
    { title: 'Globals, callbacks and other sacrileges', publisher: '37signals Dev / Jorge Manrubia', url: 'https://dev.37signals.com/globals-callbacks-and-other-sacrileges/', accessed: '2026-11-20', version: '2023-07-31', note: 'Basecamp がプロジェクトの作成に付随する単純な処理を after_create に書いていること（第7部 DHH の思想の章の出典を流用）。' },
    { title: 'Inversion of Control Containers and the Dependency Injection pattern', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/articles/injection.html', accessed: '2026-11-13', version: '2004年1月23日', note: 'Dependency Injection の名前の由来と、依存先を外から渡す形（第9部 Dependency Injection の章の出典を流用）。' },
    { title: 'activejob/lib/active_job/enqueuing.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/enqueuing.rb#L23`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'enqueue_after_transaction_commit の既定値が false であること。検証のアプリでも false で、ロールバックしてもジョブが残ることを確かめた。' },
    { title: 'Ruby on Rails 7.1 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/7_1_release_notes.html', accessed: '2026-11-21', version: 'Rails 7.1', note: 'ActiveRecord::Base.normalizes が Rails 7.1 で追加されたこと。' },
  ],
}

export default chapter
