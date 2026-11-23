import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 61-1 在庫を動かす4つの呼び出し側と、ずれが起きた箇所 ---------- */
const sceneCallers = [
  { y: 34, lines: ['管理画面の棚卸し', 'stock.update!(on_hand: 1)'], note: 'reserved 2 が on_hand 1 を超える', tone: 'danger' as const },
  { y: 134, lines: ['注文の確定（Checkout）', 'allocate(quantity: 2)'], note: '呼び出し方は正しい', tone: 'muted' as const },
  { y: 224, lines: ['モールの取り込み', 'allocate(sku: "TEA-009")'], note: '在庫の行がない SKU を渡す', tone: 'danger' as const },
  { y: 314, lines: ['サポートの画面のキャンセル', 'allocate(quantity: -2)'], note: '負の数で引き当てを戻そうとする', tone: 'danger' as const },
]
const sceneTargets = [62, 180, 235, 290]

function SceneFigure() {
  return (
    <Svg
      id="61-1"
      w={780}
      h={450}
      label="左に在庫を動かす4つの呼び出し側、中央に Inventory.allocate、右に MySQL の stocks と allocations のテーブルを並べた。管理画面の棚卸しは stocks を直接 update! し、引き当て済みの数 2 が棚の数 1 を超える。注文の確定は正しい数で allocate を呼ぶが、Inventory.allocate は在庫が足りないときに UPDATE が0行でも引き当ての行を作って戻るので、A-003 は在庫なしで確定した。モールの取り込みは在庫の行がない TEA-009 を渡し、サポートの画面は数量 -2 で引き当てを戻そうとする。4つの呼び出しはどれも例外にならず、ずれは出荷の前の照合で初めて見つかった"
    >
      <T x={20} y={16} bold>
        呼び出し側
      </T>
      <T x={395} y={16} anchor="middle" bold>
        Inventory
      </T>
      <T x={560} y={16} bold>
        MySQL
      </T>
      {sceneCallers.map((c, i) => (
        <g key={c.note}>
          <Box x={20} y={c.y} w={240} h={56} lines={c.lines} fs={12} bold subTone="muted" />
          <T x={20} y={c.y + 70} fs={11} tone={c.tone}>
            {c.note}
          </T>
          {i === 0 ? <Arrow x1={260} y1={62} x2={558} y2={62} /> : <Arrow x1={260} y1={c.y + 28} x2={298} y2={sceneTargets[i]} />}
        </g>
      ))}
      <Box x={300} y={150} w={190} h={170} lines={['Inventory.allocate', '足りるときだけ', 'reserved を UPDATE', '引き当ての行を INSERT']} fs={12} fill="box2" bold />
      <T x={395} y={340} anchor="middle" fs={11} tone="danger">
        UPDATE が0行でも
      </T>
      <T x={395} y={358} anchor="middle" fs={11} tone="danger">
        行を作って戻る（A-003）
      </T>
      <Box x={560} y={34} w={200} h={130} lines={['stocks', 'sku', 'on_hand（棚の数）', 'reserved（引き当て済み）']} fs={12} fill="box4" bold />
      <Box x={560} y={220} w={200} h={110} lines={['allocations', 'order_number', 'sku', 'quantity']} fs={12} fill="box4" bold />
      <Arrow x1={490} y1={190} x2={558} y2={140} />
      <Arrow x1={490} y1={270} x2={558} y2={275} />
      <T x={20} y={416} fs={12} tone="danger">
        4つの呼び出しはどれも例外にならず、ずれは出荷の前の照合で初めて見つかった
      </T>
      <T x={20} y={438} fs={11} tone="muted">
        オレンジの箱はモジュール、緑の箱は MySQL のテーブル。実線の矢印は呼び出しと書き込み
      </T>
    </Svg>
  )
}

/* ---------- 図 61-3 3種類の条件と、確かめる場所 ---------- */
const lifeStates = [
  { x: 20, lines: ['作成した直後', 'reserved 0'] },
  { x: 230, lines: ['allocate の後', 'reserved 2'] },
  { x: 440, lines: ['release の後', 'reserved 0'] },
  { x: 650, lines: ['棚卸しの後', 'on_hand 2'] },
]
const lifeCalls = ['allocate', 'release', '棚卸し']

function ConditionsFigure() {
  return (
    <Svg
      id="61-3"
      w={780}
      h={410}
      label="上の段は1回の呼び出し。呼び出し側が Inventory.allocate を呼ぶと、メソッドの最初で前提条件と不変条件を確かめ、処理で reserved を更新して引き当ての行を INSERT し、戻る前に事後条件と不変条件を確かめる。最初の確認の違反は呼び出し側のバグ、戻る前の確認の違反は Inventory のバグを表す。処理の途中では、reserved を増やした後で行を作る前のように、不変条件 I3 が一時的に崩れてよい。下の段は Stock の行の移り変わりで、作成した直後、allocate の後、release の後、棚卸しの後のように、公開したメソッドが戻った後の観測できる状態で、不変条件が成り立つ"
    >
      <T x={20} y={16} bold>
        1回の呼び出し（Inventory.allocate）
      </T>
      <Box x={20} y={40} w={130} h={70} lines={['呼び出し側', 'Checkout など']} fs={12} bold subTone="muted" />
      <Box x={190} y={40} w={170} h={70} lines={['最初に確かめる', '前提条件', '＋ 不変条件']} fs={12} fill="box5" bold />
      <Box x={400} y={40} w={170} h={70} lines={['処理', 'reserved を更新', '引き当ての行を INSERT']} fs={12} bold subTone="muted" />
      <Box x={610} y={40} w={150} h={70} lines={['戻る前に確かめる', '事後条件', '＋ 不変条件']} fs={12} fill="box5" bold />
      <Arrow x1={150} y1={75} x2={188} y2={75} />
      <Arrow x1={360} y1={75} x2={398} y2={75} />
      <Arrow x1={570} y1={75} x2={608} y2={75} />
      <Arrow d="M 685 110 L 685 136 L 85 136 L 85 112" dashed />
      <T x={395} y={152} anchor="middle" fs={11} tone="muted">
        戻り値（呼び出し側は、事後条件が成り立っていることを前提にして次へ進める）
      </T>
      <Box x={190} y={174} w={170} h={48} lines={['違反したら', '呼び出し側のバグ']} fs={12} fill="none" dashed subTone="danger" />
      <T x={485} y={188} anchor="middle" fs={11} tone="muted">
        途中では I3 が一時的に崩れてよい
      </T>
      <T x={485} y={206} anchor="middle" fs={11} tone="muted">
        （reserved を増やした後、行を作る前）
      </T>
      <Box x={600} y={174} w={160} h={48} lines={['違反したら', 'Inventory のバグ']} fs={12} fill="none" dashed subTone="danger" />
      <line x1={20} y1={244} x2={760} y2={244} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={266} bold>
        Stock の行の移り変わりと、不変条件
      </T>
      {lifeStates.map((s) => (
        <Box key={s.lines[0]} x={s.x} y={286} w={s.x === 650 ? 110 : 130} h={56} lines={s.lines} fs={12} fill="box5" bold subTone="muted" />
      ))}
      {lifeCalls.map((c, i) => (
        <g key={c}>
          <Arrow x1={150 + i * 210} y1={314} x2={228 + i * 210} y2={314} />
          <T x={189 + i * 210} y={300} anchor="middle" fs={11} mono tone="acc">
            {c}
          </T>
        </g>
      ))}
      <T x={20} y={368} fs={12}>
        紫の箱の状態（作成した直後と、公開したメソッドが戻った後）では、不変条件 I1〜I3 が成り立つ
      </T>
      <T x={20} y={392} fs={11} tone="muted">
        メソッドの実行中の状態は外から観測できないので、不変条件が一時的に崩れてもよい（Meyer 1992 の図5を、この章の在庫に当てはめた）
      </T>
    </Svg>
  )
}

/* ---------- 図 61-4 Eiffel の契約と、Ruby・Rails での書き方 ---------- */
const eiffelRows: { head: string; eiffel: string[]; ruby: string[] }[] = [
  { head: '前提条件', eiffel: ['require 節', 'non_negative: sum >= 0'], ruby: ['メソッドの最初で調べて raise する', 'PreconditionViolation（ArgumentError の子）'] },
  { head: '事後条件', eiffel: ['ensure 節。old で呼ばれた時点の値を参照する', 'balance = old balance + sum'], ruby: ['呼ばれた時点の値を変数に取っておき、戻る前に比べる', 'テストでは change { … }.by(…)'] },
  { head: '不変条件', eiffel: ['invariant 節。作成の後と、', '公開したメソッドの開始時と終了時に確かめる'], ruby: ['1行の条件：validates と CHECK 制約', 'テーブルをまたぐ条件：夜間の照合とテスト'] },
  { head: '確かめるか', eiffel: ['クラスごとにコンパイルのオプションで選ぶ', 'no・require（既定）・ensure・invariant・all'], ruby: ['切り替える仕組みはない。書いた確認は常に動く', '軽い確認だけをコードに書く'] },
  { head: '継承', eiffel: ['定義し直すときは require else・ensure then', '（前提条件は弱く、事後条件は強くだけできる）'], ruby: ['構文による制限はない', 'shared_examples で全サブクラスを確かめる'] },
  { head: '文書', eiffel: ['契約の形式（short form）を', 'クラスの本文から取り出す'], ruby: ['メソッドの上のコメントと、', 'RSpec の example の説明'] },
]

function EiffelFigure() {
  const cols = [
    { x: 10, w: 110, head: '項目' },
    { x: 120, w: 320, head: 'Eiffel' },
    { x: 440, w: 330, head: 'Ruby・Rails（この章の書き方）' },
  ]
  const rowH = 54
  return (
    <Svg
      id="61-4"
      w={780}
      h={382}
      label={`Eiffel の契約と、Ruby と Rails での書き方を6つの項目で比べた表。${eiffelRows.map((r) => `${r.head}：Eiffel は${r.eiffel.join('')}。Ruby と Rails では${r.ruby.join('')}`).join('。')}`}
    >
      {cols.map((c) => (
        <Box key={c.head} x={c.x} y={10} w={c.w} h={30} lines={c.head} fs={12} fill="box5" bold rx={0} />
      ))}
      {eiffelRows.map((r, i) => {
        const y = 40 + i * rowH
        return (
          <g key={r.head}>
            <Box x={cols[0].x} y={y} w={cols[0].w} h={rowH} lines={r.head} fs={12} fill="box" bold rx={0} />
            <Box x={cols[1].x} y={y} w={cols[1].w} h={rowH} lines={r.eiffel} fs={11} fill="bg" rx={0} align="start" subTone="muted" />
            <Box x={cols[2].x} y={y} w={cols[2].w} h={rowH} lines={r.ruby} fs={11} fill="bg" rx={0} align="start" subTone="muted" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 61-5 契約を確かめる4つの方法と、書き込みの経路 ---------- */
const wayPaths = [
  ['Inventory の', 'メソッド'],
  ['save・update', '（管理画面の棚卸し）'],
  ['update_columns・', 'update_all・insert_all'],
  ['別のアプリ・', '手作業の SQL'],
]
const wayRows: { head: string[]; cells: string[][] }[] = [
  { head: ['メソッドの中の raise', '前提条件・事後条件'], cells: [['○', '呼んだ時点で例外'], ['×', 'メソッドを通らない'], ['×'], ['×']] },
  { head: ['モデルの検証', '不変条件 I1。画面にエラー'], cells: [['○', 'update! が検証を呼ぶ'], ['○', 'errors に理由が入る'], ['×', '検証を飛ばす'], ['×']] },
  { head: ['CHECK 制約・外部キー', '不変条件 I1・I2'], cells: [['○'], ['○'], ['○', 'CheckViolation など'], ['○']] },
  { head: ['夜間の照合', '不変条件 I3'], cells: [['△'], ['△'], ['△'], ['△']] },
]

function WaysFigure() {
  const colX = (i: number) => 200 + i * 140
  const rowY = (i: number) => 54 + i * 56
  return (
    <Svg
      id="61-5"
      w={780}
      h={336}
      label="縦に契約を確かめる4つの方法、横に4つの書き込みの経路を並べた表。メソッドの中の raise は前提条件と事後条件を確かめ、Inventory のメソッドを通る書き込みだけを呼んだ時点で止める。モデルの検証は不変条件 I1 を確かめ、Inventory のメソッドと save・update の経路で止めて、画面に理由を返す。update_columns・update_all・insert_all と、別のアプリや手作業の SQL は検証を通らない。CHECK 制約と外部キーは不変条件 I1 と I2 を確かめ、4つの経路すべてで止める。夜間の照合は不変条件 I3 を確かめ、どの経路の書き込みも止めないが、翌朝にずれを見つける"
    >
      <Box x={10} y={10} w={180} h={44} lines="確かめる方法" fs={12} fill="box5" bold rx={0} />
      {wayPaths.map((p, i) => (
        <Box key={p[0]} x={colX(i)} y={10} w={140} h={44} lines={p} fs={11} fill="box5" bold rx={0} />
      ))}
      {wayRows.map((r, i) => (
        <g key={r.head[0]}>
          <Box x={10} y={rowY(i)} w={180} h={56} lines={r.head} fs={12} fill="box" bold rx={0} subTone="muted" />
          {r.cells.map((c, k) => (
            <Box
              key={k}
              x={colX(k)}
              y={rowY(i)}
              w={140}
              h={56}
              lines={c}
              fs={c.length > 1 ? 11 : 14}
              fill={c[0] === '○' ? 'box4' : c[0] === '△' ? 'none' : 'bg'}
              dashed={c[0] === '△'}
              rx={0}
              subTone="muted"
            />
          ))}
        </g>
      ))}
      <T x={10} y={298} fs={12}>
        ○ その場で止める（例外か検証のエラー）　× 止めずに書き込む　△ 止めないが、後でずれを見つける
      </T>
      <T x={10} y={320} fs={11} tone="muted">
        I1：0 ≦ reserved ≦ on_hand　I2：引き当ての行は quantity が1以上で、在庫の行がある　I3：reserved = 引き当ての行の合計
      </T>
    </Svg>
  )
}

/* ---------- 図 61-6 直す前と後：どこで、いつ確かめるか ---------- */
const beforeCallers = ['管理画面の棚卸し', '注文の確定', 'モールの取り込み', 'サポートの画面']
const afterCallers = ['棚卸し → 検証のエラーを表示', '注文の確定 → OutOfStock を扱う', 'モールの取り込み → 境界で確かめる', 'サポートの画面 → release を呼ぶ']
const afterTargets = [277, 330, 365, 400]

function BeforeAfterFigure() {
  return (
    <Svg
      id="61-6"
      w={780}
      h={500}
      label="上は直す前で、管理画面の棚卸しは stocks を直接書き換え、注文の確定・モールの取り込み・サポートの画面は Inventory.allocate を呼ぶ。allocate は何も確かめずに UPDATE と INSERT を行い、MySQL のテーブルにも制約がないので、4つのずれがすべて保存され、11月22日の照合で初めて見つかった。下は直した後で、棚卸しは Stock の検証（I1）で止まり、画面に理由が出る。注文の確定は OutOfStock を受け取って注文を確定しない。モールの取り込みは外から来た値を境界で確かめてから allocate を呼ぶ。サポートの画面は release を呼ぶ。Inventory はメソッドの最初で前提条件を、戻る前に事後条件を確かめ、在庫が足りなければ OutOfStock を発生させる。MySQL の CHECK 制約と外部キーが I1 と I2 を、夜間の照合が I3 を確かめる"
    >
      <T x={20} y={16} bold tone="danger">
        直す前：どこでも確かめず、照合で初めて見つかる
      </T>
      {beforeCallers.map((c, i) => (
        <Box key={c} x={20} y={36 + i * 40} w={200} h={30} lines={c} fs={12} />
      ))}
      <Arrow x1={220} y1={51} x2={518} y2={51} />
      {[1, 2, 3].map((i) => (
        <Arrow key={i} x1={220} y1={51 + i * 40} x2={268} y2={96 + i * 20} />
      ))}
      <Box x={270} y={86} w={200} h={100} lines={['Inventory.allocate', '確かめずに', 'UPDATE と INSERT']} fs={12} fill="box2" bold />
      <Arrow x1={470} y1={136} x2={518} y2={136} />
      <Box x={520} y={36} w={240} h={150} lines={['stocks・allocations', '制約なし']} fs={12} fill="box4" bold subTone="muted" />
      <T x={20} y={210} fs={12} tone="danger">
        4つのずれがすべて保存され、出荷の前（11/22）の照合で見つかった
      </T>
      <line x1={20} y1={230} x2={760} y2={230} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={250} bold tone="acc">
        直した後：呼び出し側・Inventory のメソッド・DB の3か所で、契約に沿って確かめる
      </T>
      {afterCallers.map((c, i) => (
        <g key={c}>
          <Box x={20} y={262 + i * 40} w={230} h={30} lines={c} fs={11} />
          <Arrow x1={250} y1={277 + i * 40} x2={278} y2={afterTargets[i]} />
        </g>
      ))}
      <Box x={280} y={262} w={200} h={30} lines="Stock の検証（I1）" fs={12} />
      <Box x={280} y={306} w={200} h={114} lines={['Inventory', '最初：前提条件', '戻る前：事後条件', '足りない：OutOfStock']} fs={12} fill="box2" bold />
      <Arrow x1={480} y1={277} x2={518} y2={277} />
      <Arrow x1={480} y1={360} x2={518} y2={360} />
      <Box x={520} y={262} w={240} h={158} lines={['stocks・allocations', 'CHECK 制約（I1・I2）', '外部キー（I2）']} fs={12} fill="box5" bold />
      <Box x={520} y={436} w={240} h={30} lines="夜間の照合（I3）" fs={12} fill="none" dashed />
      <Arrow x1={640} y1={436} x2={640} y2={422} dashed />
      <T x={20} y={488} fs={11} tone="muted">
        どの違反も、呼んだその場で例外か検証のエラーになる。I3 のずれは、翌朝の照合で見つける
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 80,
  part: 8,
  title: 'Design by Contract：在庫の引き当てに前提条件・事後条件・不変条件を書く',
  summary:
    '注文の確定・モールの取り込み・サポートの画面・棚卸しの4か所から在庫を動かし、負の数量や販売を終えた商品の SKU が渡されて、在庫の数が出荷の直前までずれたままになる場面から始めます。Bertrand Meyer が Eiffel とともに示した契約による設計を1992年の論文と Eiffel のドキュメントで確かめ、在庫の引き当てに前提条件・事後条件・不変条件を書いて、例外・モデルの検証・CHECK 制約で確かめる形に直します。最後に、在庫が足りることまで前提条件にしたときと、重い不変条件を毎回確かめたときの問題を扱います。',
  goals: [
    '前提条件・事後条件・不変条件の違いと、それぞれが破られたときに、呼び出し側と呼ばれる側のどちらのバグになるかを説明できる',
    'Meyer の契約の考え方（義務と利益、同じ条件を呼ばれる側の本体で重ねて調べない規則、防御的プログラミングとの違い）を説明できる',
    'Rails のメソッドの契約をコメントと RSpec に書き、前提条件をメソッドの最初で、事後条件を戻る前に確かめるコードを書ける',
    '不変条件を、モデルの検証・CHECK 制約・外部キー・夜間の照合のどれで守るかを、書き込みの経路と検査の費用から選べる',
    '同時の注文で変わる在庫の数のように、呼び出し側が確かめきれない条件を前提条件にせず、事後条件の結果として扱える',
  ],
  prerequisites: [14, 15, 65, 79],
  sections: [
    {
      id: 'scene',
      title: '負の数量と販売を終えた商品が渡されて在庫の数がずれる',
      body: (
        <>
          <p>
            この章では EC サイトの在庫の引き当てを例に、<Term en="Design by Contract">契約による設計</Term>を扱います。契約による設計はメソッドを呼ぶ側と呼ばれる側の取り決めを、前提条件・事後条件・不変条件の3種類の条件として明確にする原則です。まず、取り決めが書かれていないまま4か所から在庫を動かし、在庫の数がずれていくコードを動かします。
          </p>
          <h3>そもそも在庫の引き当てとは</h3>
          <p>
            この EC サイトは紅茶の缶を売っていて、倉庫の棚にある缶を、注文の確定から出荷までのあいだ注文ごとに取っておきます。この「取っておく」操作を引き当てと呼びます。たとえば棚に3缶あり、2缶の注文が確定したら、出荷するまでその2缶はほかの注文に売れません。新しい注文に売れるのは残りの1缶です。
          </p>
          <p>
            テーブルは2つあります。stocks は商品（SKU）ごとに、棚にある数（<code>on_hand</code>）と、注文に引き当て済みでまだ出荷していない数（<code>reserved</code>）を持ちます。新しい注文に売れる数は <code>on_hand - reserved</code> です。allocations はどの注文にどの商品を何個引き当てたかを1行ずつ記録します。出荷すると on_hand と reserved の両方が減りますが、この章では出荷の処理は扱いません。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_stocks_and_allocations.rb"
            code={`
class CreateStocksAndAllocations < ActiveRecord::Migration[8.1]
  def change
    create_table :stocks do |t|
      t.string :sku, null: false, index: { unique: true }
      t.string :name, null: false
      t.integer :on_hand, null: false, default: 0  # 倉庫の棚にある数
      t.integer :reserved, null: false, default: 0 # 注文に引き当て済みで、まだ出荷していない数
      t.timestamps
    end

    create_table :allocations do |t|
      t.string :order_number, null: false
      t.string :sku, null: false, index: true
      t.integer :quantity, null: false
      t.timestamps
    end
  end
end
`}
          />
          <h3>引き当てのコードと呼び出す4か所</h3>
          <p>
            引き当ては <code>Inventory.allocate</code> にまとめてあります。同時に注文が入っても数がずれないように、売れる数が足りるときだけ reserved を増やす UPDATE を1回で実行し、そのあとで引き当ての行を作ります。この書き方は在庫の減算を条件付きの UPDATE で書く方法（<ChapterLink n={49} section="stock-update" />）にならったものです。
          </p>
          <Code
            lang="ruby"
            title="app/models/inventory.rb（直す前）"
            code={`
module Inventory
  # 注文の明細の数だけ在庫を引き当てる
  def self.allocate(order_number:, sku:, quantity:)
    # 同時の注文で数がずれないように、足りるときだけ1回の UPDATE で増やす
    Stock.where(sku:).where("on_hand - reserved >= ?", quantity)
         .update_all(["reserved = reserved + ?, updated_at = ?", quantity, Time.current])
    Allocation.create!(order_number:, sku:, quantity:)
  end
end
`}
          />
          <p>
            <code>allocate</code> を呼ぶのは3か所です。注文の確定（Checkout）、外部のモールから届いた注文の取り込み（MallOrderImport）、サポートの担当者が使う画面の「注文をキャンセルする」（OrderCancellation）です。キャンセルの処理を書いた開発者は、引き当てを戻すメソッドが見つからなかったので、数量を負にして <code>allocate</code> を呼びました。
          </p>
          <Code
            lang="ruby"
            title="app/services/checkout.rb・mall_order_import.rb・order_cancellation.rb（直す前）"
            code={`
# 注文の確定。明細ごとに在庫を引き当てる
class Checkout
  def self.call(order_number:, items:)
    items.each { |item| Inventory.allocate(order_number:, **item) }
    "#{order_number} を確定しました"
  end
end

# 外部のモールの API から届いた注文の明細を取り込む
# lines は [{ order_number: "M-101", sku: "TEA-009", quantity: 1 }, ...]
class MallOrderImport
  def self.call(lines)
    lines.each do |line|
      Inventory.allocate(order_number: line[:order_number], sku: line[:sku], quantity: line[:quantity])
    end
  end
end

# サポートの画面の「注文をキャンセルする」
class OrderCancellation
  def self.call(order_number:)
    # 引き当てを戻すメソッドがないので、数を負にして allocate を呼ぶ
    Allocation.where(order_number:).group(:sku).sum(:quantity).each do |sku, quantity|
      Inventory.allocate(order_number:, sku:, quantity: -quantity)
    end
  end
end
`}
          />
          <p>
            4か所目は管理画面の棚卸しです。倉庫の担当者が数えた棚の数を入力すると、<code>stock.update!(on_hand: 数えた数)</code> で stocks の行を直接書き換えます。Stock のモデルには、売れる数を返す <code>available</code>（<code>on_hand - reserved</code>）のメソッドだけがあり、検証はありません。
          </p>
          <h3>5つの操作を動かす</h3>
          <p>
            ダージリン（TEA-001）とアッサム（TEA-002）を3缶ずつ棚に置き、2日間に起きた5つの操作を順に行います。モールの商品ページには、販売を終えて在庫の行を消したはずの TEA-009 が残っていて、そこから注文が1件届きました。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（抜粋）"
            code={`
# …（省略）TEA-001 と TEA-002 の在庫の行を、on_hand 3 で作る
travel_to Time.zone.parse("2026-11-20 10:00")
puts "(1) 注文の確定"
puts "  " + Checkout.call(order_number: "A-001", items: [{ sku: "TEA-001", quantity: 2 }])
puts "  " + Checkout.call(order_number: "A-002", items: [{ sku: "TEA-002", quantity: 2 }])
puts "  " + Checkout.call(order_number: "A-003", items: [{ sku: "TEA-002", quantity: 2 }])
puts "(2) モールの注文の取り込み"
MallOrderImport.call([{ order_number: "M-101", sku: "TEA-009", quantity: 1 }])
puts "  M-101 を取り込みました"

travel_to Time.zone.parse("2026-11-21 11:00")
puts "(3) サポートの画面で A-003 をキャンセル"
OrderCancellation.call(order_number: "A-003")
puts "  A-003 をキャンセルしました"
puts "(4) 注文の確定"
puts "  " + Checkout.call(order_number: "A-004", items: [{ sku: "TEA-002", quantity: 3 }])
puts "(5) 管理画面で棚卸しの結果を入力（TEA-001 は2缶が破損していて、棚には1缶）"
Stock.find_by!(sku: "TEA-001").update!(on_hand: 1)
puts "  TEA-001 の棚の数を 1 にしました"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
(1) 注文の確定
  A-001 を確定しました
  A-002 を確定しました
  A-003 を確定しました
(2) モールの注文の取り込み
  M-101 を取り込みました
(3) サポートの画面で A-003 をキャンセル
  A-003 をキャンセルしました
(4) 注文の確定
  A-004 を確定しました
(5) 管理画面で棚卸しの結果を入力（TEA-001 は2缶が破損していて、棚には1缶）
  TEA-001 の棚の数を 1 にしました
`}
          />
          <p>
            5つの操作はどれも例外にならずに終わりました。翌朝、倉庫が出荷の準備をする前に、在庫の行と引き当ての行を照らし合わせるスクリプト（script/reconcile.rb）を流すと、次の結果になりました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/reconcile.rb）"
            code={`
在庫の行（stocks）
  sku      on_hand reserved available 引き当ての行の合計
  TEA-001        1        2        -1                  2
  TEA-002        3        3         0                  5
  TEA-009        -        -         -                  1
引き当ての行（allocations）
  A-001  TEA-001    2
  A-002  TEA-002    2
  A-003  TEA-002    2
  M-101  TEA-009    1
  A-003  TEA-002   -2
  A-004  TEA-002    3
照合の結果
  TEA-001：reserved（2）が on_hand（1）を超えている
  TEA-001：出荷を待つ数（2）が棚の数（1）より 1 多い
  TEA-002：reserved（3）と引き当ての行の合計（5）が違う
  TEA-002：出荷を待つ数（5）が棚の数（3）より 2 多い
  TEA-009：在庫の行がないのに、引き当ての行の合計が 1
  A-003：quantity が -2 の引き当ての行がある
`}
          />
          <h3>何が起きたか</h3>
          <ul>
            <li>
              A-003 は、A-002 のあとで売れる数が1缶しかないのに確定しました。条件付きの UPDATE は0行を更新して終わりましたが、<code>allocate</code> はその件数を見ずに引き当ての行を作り、普段どおりに戻りました。Checkout は戻ったのだから引き当てられたと考えて「確定しました」を返しています。
            </li>
            <li>モールから届いた M-101 の TEA-009 には在庫の行がありません。UPDATE は0行で終わり、引き当ての行だけができて、注文は取り込まれました。倉庫には出荷する商品がありません。</li>
            <li>
              サポートの画面は A-003 のキャンセルで <code>allocate(quantity: -2)</code> を呼びました。A-003 は実際には何も引き当てていなかったので、A-002 の分の reserved が 2 減って 0 になりました。条件の <code>on_hand - reserved &gt;= -2</code> はいつでも成り立つので、UPDATE は止まりません。
            </li>
            <li>その結果、売れる数が3缶に戻り、翌日の A-004 の3缶が確定しました。アッサムの棚は3缶なのに、出荷を待つ注文は A-002 と A-004 の合わせて5缶です。</li>
            <li>棚卸しで TEA-001 の棚の数を1にしたため、reserved（2）が on_hand（1）を超え、売れる数が −1 になりました。A-001 の2缶のうち1缶は出荷できません。</li>
          </ul>
          <p>図 61-1 は4つの呼び出し側と Inventory、2つのテーブルの関係と、ずれが起きた箇所を示したものです。</p>
          <Figure n="61-1" title="在庫を動かす4つの呼び出し側と、ずれが起きた箇所" caption="赤の文字は、ずれの原因になった呼び出しと処理。">
            <SceneFigure />
          </Figure>
          <p>
            図 61-1 の4つのずれには、共通する原因があります。<code>allocate</code> を書いた開発者は、呼び出し側が正の数と存在する SKU を渡すと考えていました。呼び出し側の開発者は、おかしな値なら <code>allocate</code> が拒否し、戻ったなら引き当てられていると考えていました。棚卸しの画面は stocks の行を書き換えてよい範囲を知りません。「誰が何を確かめ、戻ったときに何が成り立っているか」がどこにも書かれていないので、どちらの側も確かめず、ずれは出荷の前の照合まで見つかりませんでした。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '契約による設計の意味と由来',
      body: (
        <>
          <h3>原則の定義</h3>
          <p>
            契約による設計（Design by Contract）は、前提条件・事後条件・不変条件を明確にする原則です。メソッドを呼ぶ側と呼ばれる側の取り決めを「契約」と見て、次の3種類の条件として書きます。
          </p>
          <ul>
            <li>
              <Term en="precondition">前提条件</Term>：呼び出し側がメソッドを呼ぶ前に満たしておく条件です。<code>allocate</code> なら「quantity は1以上の整数」「sku の在庫の行がある」です。LSP の章（<ChapterLink n={65} section="meaning" />）では、同じものを事前条件と呼んでいます。
            </li>
            <li>
              <Term en="postcondition">事後条件</Term>：前提条件を満たして呼ばれたとき、メソッドが戻った時点で成り立っていると約束する条件です。<code>allocate</code> なら「sku の reserved が quantity だけ増え、引き当ての行が1行増えている」です。
            </li>
            <li>
              <Term en="class invariant">不変条件</Term>：クラスのオブジェクト（この章では在庫のデータ）について、作った直後と、公開したメソッドが戻った後にいつも成り立つ条件です。この章の在庫では「0 ≦ reserved ≦ on_hand」「reserved は、その商品の引き当ての行の合計と等しい」などです。
            </li>
          </ul>
          <p>
            場面の4つのずれはどれもこの3種類のどれかに当たります。負の数量と TEA-009 は前提条件を満たさない呼び出しで、A-003 は事後条件を満たさずに戻った <code>allocate</code> です。棚卸しの入力は不変条件を破る書き込みでした。
          </p>
          <h3>由来：Bertrand Meyer と Eiffel</h3>
          <p>
            契約による設計は、Bertrand Meyer がプログラミング言語 Eiffel とともに示した考え方です。Meyer は1985年にカリフォルニア大学サンタバーバラ校の技術報告で Eiffel を初めて記述しました。契約による設計を初めて論じたのは、1986年の Interactive Software Engineering 社の技術報告「Design by Contract」（TR-EI-12/CO）だったと、Meyer は自身の文献一覧に書いています<Ref n={3} />。1988年の著書『Object-Oriented Software Construction』の初版にも章があり、1991年に書籍の1章として公開しました<Ref n={3} />。
          </p>
          <p>
            1992年10月には、IEEE の雑誌 Computer（25巻10号、40〜51ページ）に論文「Applying "Design by Contract"」を発表しました。この論文は1991年の章をもとにしたもので、Meyer は着想の元として、Floyd・Hoare・Dijkstra によるプログラムの正しさの証明の研究と、抽象データ型の理論を挙げています。クラスの不変条件は Hoare のデータの不変条件から来たもので、それをオブジェクト指向のクラスに移したのは Eiffel が初めてだろう、とも書いています<Ref n={1} />。
          </p>
          <h3>契約は義務と利益の表で書ける</h3>
          <p>
            1992年の論文は人どうしの契約の例から始まります。パリの中で急ぎの荷物を届けたいとき、自分で届けずに配送業者に頼むことができます。依頼者の義務は「5kg 以下、各辺 2m 以下の荷物を渡し、100フランを払う」ことで、利益は「4時間以内に届く」ことです。配送業者の義務は「4時間以内に届ける」ことで、利益は「大きすぎる荷物、重すぎる荷物、代金が払われていない荷物は扱わなくてよい」ことです。一方の義務はもう一方の利益になっています<Ref n={1} />。
          </p>
          <p>
            Meyer はこの表をメソッドに当てはめ、呼び出し側（client）の義務を前提条件、呼ばれる側（supplier）の義務を事後条件と呼びました。契約に書かれた義務のほかに、利益を受けるための条件を相手に課してはならない、という規則（No Hidden Clauses）も挙げています<Ref n={1} />。図 61-2 は <code>allocate</code> の契約を同じ形の表にしたものです。
          </p>
          <Figure n="61-2" title="Inventory.allocate の契約（義務と利益）" caption="Meyer の論文の表の形にならった。右下のマスが、呼ばれる側が書かなくてよい処理。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col"></th>
                    <th scope="col">義務</th>
                    <th scope="col">利益</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">呼び出し側（注文の確定・モールの取り込みなど）</th>
                    <td>quantity を1以上の整数にする。在庫の行がある SKU を渡す（前提条件）</td>
                    <td>戻ったら、その数が引き当てられている。足りなければ OutOfStock で分かり、在庫は変わっていない</td>
                  </tr>
                  <tr>
                    <th scope="row">Inventory.allocate</th>
                    <td>reserved を quantity だけ増やし、引き当ての行を1行作る。足りなければ何も変えずに OutOfStock を発生させる。不変条件を保つ（事後条件）</td>
                    <td>負の数・小数・文字列の数量や、在庫の行がない SKU を扱う処理を書かなくてよい</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 61-2 の右下のマスについて、Meyer は、前提条件が満たされないときはルーチンは何もしなくてよい、と書いています。規格に合わない荷物を渡された配送業者と同じです<Ref n={1} />。直す前の <code>allocate</code> は、この表を持たないまま、負の数を「戻す」意味に受け取って処理していました。
          </p>
          <h3>違反はどちらかのコードのバグを表す</h3>
          <p>
            契約を書くと、違反が起きたときにどちらのコードを直すかが決まります。Meyer は「前提条件の違反は呼び出し側のバグを表し、事後条件の違反は呼ばれる側のバグを表す」としています<Ref n={1} />。Eiffel のドキュメントは不変条件の違反も呼ばれる側のバグとし、「実行時の表明の違反は、バグが表に出たものである」という規則を挙げています<Ref n={2} />。表明（assertion）は、前提条件・事後条件・不変条件のようにプログラムの中に書いた条件のことです。
          </p>
          <p>
            同じドキュメントは、契約は利用者の誤った入力のような特別な場合を調べるための仕組みではない、とも書いています。表明は2つのソフトウェアのモジュールの間の正しさの条件であり、モジュールと人、モジュールと外部の装置の間の条件ではありません。外からの誤った値は通常の if 文や例外の処理で扱います<Ref n={2} />。場面のモールの取り込みに当てはめると、モールから届いた値の確認は MallOrderImport が通常の処理として行い、そのうえで <code>allocate</code> との間では契約を守る、という分担になります。
          </p>
          <h3>同じ条件を呼ぶ側と呼ばれる側の両方で処理しない</h3>
          <p>
            Meyer は1992年の論文で、当時の教科書がすすめていた<Term en="defensive programming">防御的プログラミング</Term>を取り上げています。これは、呼び出し側がすでに調べた条件でも、念のためにすべてのモジュールで調べる書き方です。Meyer は、この書き方ではコードが増え、複雑さが増して、かえって誤りの元が増えると述べました<Ref n={1} />。そのうえで、1つの条件の責任はどちらか一方だけが持つ、という規則を示しています。条件を前提条件に書くか、ルーチンの本体の if 文で処理するかのどちらかにして、両方には書きません<Ref n={1} />。
          </p>
          <p>
            どちらに置くかに絶対の決まりはありません。前提条件を強くして呼び出し側に責任を持たせる書き方（demanding）から、前提条件を弱くして呼ばれる側が多くを処理する書き方（tolerant）まであり、Meyer は全体の構成がいちばん単純になるほうを選ぶとしています。多くの呼び出し側が同じ確認と同じ処理を書くことになるなら、それは契約が厳しすぎるしるしで、呼ばれる側が引き受ける形に契約を広げます。呼び出し側ごとに処理が違うなら、呼び出し側がそれぞれ確かめるのは避けられません<Ref n={1} />。
          </p>
          <p>
            この章では <code>allocate</code> の数量と SKU を前提条件にしました。おかしな値が来たときにすべきことが、呼び出し側ごとに違うからです。注文の確定では画面の作りの誤りで、モールの取り込みでは要確認の一覧に回す明細で、サポートの画面では <code>release</code> を呼ぶべきところの誤りです。一方、新しく作る <code>release</code>（注文の引き当てを外す）は、引き当ての行がない注文なら何もしない形にしました。キャンセルのボタンは2回押されることがあり、前提条件にすると、すべての呼び出し側が同じ確認を書くことになるからです。
          </p>
          <p>
            Ruby で前提条件を書くときは、メソッドの最初で条件を調べ、満たさなければ例外を発生させます。これは本体で条件を「処理する」if 文とは違い、Eiffel が実行時に前提条件を調べるのと同じ役目です。満たさない呼び出しのために別の処理を行うことはしません。
          </p>
          <h3>不変条件と観測できる状態</h3>
          <p>
            Meyer の論文によると、クラスの不変条件は、オブジェクトを作る処理の後に成り立ち、公開したルーチン（ほかのクラスから呼べるルーチン）が戻るたびに保たれなければなりません。不変条件は公開したすべてのルーチンの前提条件と事後条件に加わる条件と見ることができます。不変条件が成り立つのは外から観測できる状態だけで、ルーチンの実行の途中では成り立っていなくてもかまいません<Ref n={1} />。
          </p>
          <Figure n="61-3" title="3種類の条件と、確かめる場所" caption="上は1回の呼び出しの中の確認の場所、下はオブジェクトの状態の移り変わり。紫の箱が条件を確かめる場所と観測できる状態。">
            <ConditionsFigure />
          </Figure>
          <p>
            図 61-3 の上の段では、メソッドの最初で前提条件を、戻る前に事後条件を確かめ、不変条件は両方で確かめます。最初の確認で違反が見つかれば呼び出し側を、戻る前の確認で見つかれば Inventory を直します。処理の途中で reserved を増やしてから引き当ての行を作るまでのあいだは、「reserved は引き当ての行の合計と等しい」が一時的に成り立ちません。下の段のように、メソッドが戻った後の状態で成り立っていれば、契約は守られています。
          </p>
          <h3>Eiffel の書き方と Ruby との違い</h3>
          <p>
            Eiffel では、前提条件を <code>require</code>、事後条件を <code>ensure</code>、不変条件を <code>invariant</code> の節として、メソッドやクラスの本文に書きます。Eiffel のドキュメントの銀行口座の例では、入金の <code>deposit</code> に、前提条件 <code>non_negative: sum &gt;= 0</code> と、事後条件 <code>balance = old balance + sum</code> が書かれています。<code>old</code> はメソッドが呼ばれた時点の値を表す書き方で、事後条件の中だけで使えます<Ref n={2} />。
          </p>
          <p>
            表明を実行時に確かめるかどうかは、クラスごとにコンパイルのオプションで選びます。段階は、確かめない（no）、前提条件だけ（require）、事後条件まで（ensure）、不変条件まで（invariant）、すべて（all）で、既定は require です。開発とテストではいちばん高い段階で確かめ、システムを公開するときは確かめないか require に下げるのが通常で、どこまで下げるかは効率・誤りの費用・製品への信頼の兼ね合いで決めるとしています<Ref n={2} />。サブクラスでメソッドを定義し直すときは、<code>require else</code> で前提条件を弱め、<code>ensure then</code> で事後条件を強めることだけができます<Ref n={4} />。
          </p>
          <p>
            Ruby と Rails には、これらの構文がありません。図 61-4 は Eiffel の仕組みと、この章で使う Ruby と Rails の書き方を並べたものです。
          </p>
          <Figure n="61-4" title="Eiffel の契約と、Ruby・Rails での書き方" caption="右の列は、この章の apply 節で書くコード。継承の行は LSP の章で扱っている。">
            <EiffelFigure />
          </Figure>
          <p>
            図 61-4 の「確かめるか」の行は、Ruby で契約を書くときにいちばん大きな違いです。Ruby には表明の確認を切り替える仕組みがないので、メソッドに書いた確認は本番でも毎回動きます。そのため、コードに書く確認は軽いものに限り、重い確認はテストや夜間の照合に回します。どこで線を引くかは「当てはめすぎたとき」の節で測ります。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を扱うか</th>
                  <th scope="col">この章との違い</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Fail Fast（<ChapterLink n={79} />）
                  </td>
                  <td>不正な状態や入力を、できるだけ早く見つけて止める</td>
                  <td>いつ・どこで止めるかを扱う。この章は、どちらの側が何を確かめ、戻ったら何が成り立つかを扱う。メソッドの最初で前提条件を確かめることは、早く止める方法の1つになる</td>
                </tr>
                <tr>
                  <td>
                    Defensive Programming（<ChapterLink n={82} />）
                  </td>
                  <td>外部の入力や信頼できないデータによる問題を防ぐ</td>
                  <td>外から来た値を境界で確かめる。内部のモジュールの間では同じ条件を両方で調べずに契約で分担する</td>
                </tr>
                <tr>
                  <td>
                    LSP（<ChapterLink n={65} />）
                  </td>
                  <td>派生型を基底型の代わりに使っても、期待される振る舞いを保つ</td>
                  <td>契約を継承の関係でどう引き継ぐかを扱う。この章は、1つのメソッドとデータの契約を書く</td>
                </tr>
                <tr>
                  <td>
                    Make Illegal States Unrepresentable（<ChapterLink n={81} />）
                  </td>
                  <td>不正な組み合わせを、データの形で作れないようにする</td>
                  <td>CHECK 制約は、テーブルの不変条件を DB に書いたものと見ることもできる。前提条件と事後条件は、呼び出しの前後で確かめる</td>
                </tr>
                <tr>
                  <td>
                    Encapsulation（<ChapterLink n={71} />）
                  </td>
                  <td>内部の状態を隠し、必要な操作だけを公開する</td>
                  <td>不変条件が「公開したメソッドが戻った後」に成り立つためには、内部の値を外から直接書き換えさせないことが要る。棚卸しの画面はその前提を破っていた</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '契約を書き、メソッドと DB で確かめる',
      body: (
        <>
          <h3>直す順序</h3>
          <p>次の順に直します。</p>
          <ol>
            <li>契約をコメントに書き、契約で使う例外のクラスを決める（処理はまだ変えない）</li>
            <li>契約を RSpec の example にして、直す前の処理で動かす</li>
            <li>前提条件を <code>allocate</code> の最初で、事後条件を戻る前に確かめる。引き当てを外す処理は <code>release</code> に分ける</li>
            <li>不変条件を Stock のモデルの検証と DB の制約にする</li>
            <li>呼び出し側を、契約に合わせて直す</li>
            <li>場面と同じ操作を動かし、照合とテストで確かめる</li>
          </ol>
          <p>
            1と2を先にするのは、何が契約違反かを決めてからでないと、直した結果が正しいかを判断できないからです。2で落ちたテストがそのまま直す箇所の一覧になります。4の DB の制約は3と5で正しい呼び出しに直してから加えます。先に加えると、直す前のサポートの画面が負の数量で例外を出し始めます。
          </p>
          <h3>手順1：契約をコメントに書いて例外のクラスを決める</h3>
          <p>
            Inventory のモジュールの先頭に不変条件を、<code>allocate</code> の上に前提条件と事後条件を書きます。不変条件には I1〜I3 の番号を付け、あとで、どの仕組みで守るかを書き足します。処理はまだ直す前のままです。
          </p>
          <Code
            lang="ruby"
            title="app/models/inventory.rb（手順1）"
            code={`
# 在庫の引き当て。呼び出し側（注文の確定・サポートの画面・モールの取り込み）との契約をここに書く
#
# 不変条件（Inventory のメソッドが戻ったときに成り立つ）
#   I1. 在庫の行ごとに 0 <= reserved <= on_hand
#   I2. 引き当ての行は quantity が1以上で、sku の在庫の行がある
#   I3. 在庫の行の reserved = その sku の引き当ての行の quantity の合計
module Inventory
  # 前提条件の違反。呼び出し側のバグ
  class PreconditionViolation < ArgumentError; end
  # 事後条件の違反。Inventory のバグ
  class PostconditionViolation < StandardError; end
  # 在庫が足りない。業務の上で起こりうる結果で、バグではない
  class OutOfStock < StandardError; end

  # 在庫を引き当てる
  #   前提条件：quantity は1以上の整数。sku の在庫の行がある
  #   事後条件：sku の reserved が quantity だけ増え、引き当ての行が1行増える。戻り値はその行
  #             在庫が足りなければ OutOfStock を発生させ、何も変えない
  def self.allocate(order_number:, sku:, quantity:)
    # 処理はまだ直す前のまま
    # …（省略）
  end
end
`}
          />
          <p>
            例外のクラスは3つに分けました。<code>PreconditionViolation</code> は呼び出し側のバグ、<code>PostconditionViolation</code> は Inventory のバグを表します。前提条件の違反は引数の誤りなので、Ruby の <code>ArgumentError</code>（引数が誤っていて、より具体的な例外のクラスがないときに発生させる例外<Ref n={13} />）のサブクラスにしました。
          </p>
          <p>
            <code>OutOfStock</code> は契約の違反ではありません。在庫が足りるかどうかは、呼び出し側が呼ぶ前に確かめても、呼ぶまでのあいだにほかの注文で変わります。呼び出し側が確実には満たせない条件を前提条件にはできないので、「足りなければ OutOfStock を発生させ、何も変えない」を事後条件の一部として約束します。前提条件にしたときに何が起きるかは、「当てはめすぎたとき」の節で動かします。
          </p>
          <h3>手順2：契約を RSpec にして直す前の処理で動かす</h3>
          <p>
            コメントに書いた契約を、そのまま RSpec の example にします。事後条件の「reserved が quantity だけ増える」は、RSpec の <code>change {'{ … }'}.by(…)</code> で書けます。<code>change</code> はブロックを実行する前と後に値を読み、その差を比べるマッチャーで<Ref n={14} />、Eiffel の事後条件の <code>old</code> と同じことをテストの中で行います。「何も変えない」は <code>change</code> を否定したマッチャー <code>not_change</code> を rails_helper.rb で定義して書きました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/inventory_spec.rb（抜粋）と spec/rails_helper.rb の追加分"
            code={`
# spec/rails_helper.rb：「何も変えない」を change の否定で書く
RSpec::Matchers.define_negated_matcher :not_change, :change

RSpec.describe Inventory do
  let!(:stock) { Stock.create!(sku: "TEA-002", name: "アッサム 100g", on_hand: 3) }
  let(:state) { -> { [stock.reload.reserved, Allocation.count] } }

  describe ".allocate" do
    it "前提条件を満たし在庫が足りれば、reserved が quantity だけ増え、引き当ての行が1行増える" do
      expect { Inventory.allocate(order_number: "A-002", sku: "TEA-002", quantity: 2) }
        .to change { stock.reload.reserved }.by(2)
        .and change { Allocation.where(order_number: "A-002", sku: "TEA-002", quantity: 2).count }.by(1)
    end

    it "在庫が足りなければ OutOfStock を発生させ、何も変えない" do
      Inventory.allocate(order_number: "A-002", sku: "TEA-002", quantity: 2)
      expect { Inventory.allocate(order_number: "A-003", sku: "TEA-002", quantity: 2) }
        .to raise_error(Inventory::OutOfStock).and not_change(&state)
    end

    it "quantity が1以上の整数でなければ PreconditionViolation を発生させ、何も変えない" do
      [-2, 0, "2", 1.5].each do |quantity|
        expect { Inventory.allocate(order_number: "A-003", sku: "TEA-002", quantity:) }
          .to raise_error(Inventory::PreconditionViolation).and not_change(&state)
      end
    end

    it "在庫の行がない SKU なら PreconditionViolation を発生させ、何も変えない" do
      expect { Inventory.allocate(order_number: "M-101", sku: "TEA-009", quantity: 1) }
        .to raise_error(Inventory::PreconditionViolation).and not_change(&state)
    end
  end
  # …（省略）release と不変条件の example
end
`}
          />
          <Code
            lang="text"
            title="実行結果（手順1の処理で bundle exec rspec spec/models/inventory_spec.rb -e '.allocate'。失敗した行のコードとバックトレースを省略）"
            code={`
.FFF

Failures:

  1) Inventory.allocate 在庫が足りなければ OutOfStock を発生させ、何も変えない
          expected Inventory::OutOfStock but nothing was raised
       ...and:
          expected result not to have changed, but did change from [2, 1] to [2, 2]

  2) Inventory.allocate quantity が1以上の整数でなければ PreconditionViolation を発生させ、何も変えない
          expected Inventory::PreconditionViolation but nothing was raised
       ...and:
          expected result not to have changed, but did change from [0, 0] to [-2, 1]

  3) Inventory.allocate 在庫の行がない SKU なら PreconditionViolation を発生させ、何も変えない
          expected Inventory::PreconditionViolation but nothing was raised
       ...and:
          expected result not to have changed, but did change from [0, 0] to [0, 1]

4 examples, 3 failures
`}
          />
          <p>
            落ちた3件は場面の3つのずれと対応しています。1は A-003 で、在庫が足りないのに例外にならず、引き当ての行が1行増えました（事後条件の違反）。2は数量 −2 で、reserved が −2 になり、行も1行増えました。3は TEA-009 で、行だけが増えました（2と3は前提条件を満たさない呼び出しを受け付けたこと）。成功した1件は正しい呼び出しの事後条件です。
          </p>
          <h3>手順3：前提条件と事後条件をメソッドの中で確かめる</h3>
          <p>
            <code>allocate</code> の処理を書き直します。メソッドの最初で前提条件を調べ、在庫の行をロックして読み、足りなければ <code>OutOfStock</code> を発生させます。更新の前の reserved を変数に取っておき、戻る前に読み直して比べます。引き当てを外す処理は <code>release</code> として分けました。
          </p>
          <Code
            lang="ruby"
            title="app/models/inventory.rb（直した後）"
            code={`
# …（省略）不変条件のコメント。I1〜I3 のそれぞれに、守る仕組みを書き足した
module Inventory
  # …（省略）3つの例外のクラス

  # 在庫を引き当てる
  #   前提条件：quantity は1以上の整数。sku の在庫の行がある
  #   事後条件：sku の reserved が quantity だけ増え、引き当ての行が1行増える。戻り値はその行
  #             在庫が足りなければ OutOfStock を発生させ、何も変えない
  def self.allocate(order_number:, sku:, quantity:)
    unless quantity.is_a?(Integer) && quantity >= 1
      raise PreconditionViolation, "quantity は1以上の整数にしてください（#{quantity.inspect}）"
    end

    Stock.transaction do
      stock = Stock.lock.find_by(sku:)
      raise PreconditionViolation, "在庫の行がない SKU です（#{sku}）" unless stock
      raise OutOfStock, "#{sku} は残り #{stock.available} 個で、#{quantity} 個を引き当てられません" if stock.available < quantity

      old_reserved = stock.reserved
      stock.update!(reserved: old_reserved + quantity)
      allocation = Allocation.create!(order_number:, sku:, quantity:)

      unless stock.reload.reserved == old_reserved + quantity
        raise PostconditionViolation, "#{sku} の reserved が #{old_reserved} から #{quantity} 増えていません"
      end
      allocation
    end
  end

  # 注文の引き当てをすべて外す
  #   前提条件：なし（引き当ての行がない注文なら、何もしない）
  #   事後条件：その注文の引き当ての行がなくなり、sku ごとの reserved が外した数だけ減る
  def self.release(order_number:)
    Stock.transaction do
      Allocation.where(order_number:).order(:sku).group_by(&:sku).each do |sku, allocations|
        stock = Stock.lock.find_by!(sku:)
        old_reserved = stock.reserved
        quantity = allocations.sum(&:quantity)
        stock.update!(reserved: old_reserved - quantity)
        allocations.each(&:destroy!)

        unless stock.reload.reserved == old_reserved - quantity
          raise PostconditionViolation, "#{sku} の reserved が #{old_reserved} から #{quantity} 減っていません"
        end
      end
    end
  end
end
`}
          />
          <p>
            <code>Stock.lock.find_by(sku:)</code> は、<code>SELECT … FOR UPDATE</code> で在庫の行をロックしながら読みます<Ref n={12} />。トランザクションが終わるまで、ほかの注文はこの行を書き換えられないので、<code>old_reserved</code> と戻る前に読み直した値の差は、このメソッドが加えた変更だけになります。ロックしないで呼ばれた時点の値を取っておくと、そのあいだにほかの注文が reserved を変えたときに、正しい処理でも事後条件の確認が失敗します。Eiffel の <code>old</code> を DB の値に使うときは、比べる値がほかの処理に変えられないようにしておく必要があります。ロックの仕組みは<ChapterLink n={15} section="pessimistic" />で扱っています。
          </p>
          <p>
            戻る前の確認は、Inventory の処理が正しいあいだは毎回成り立ちます。働くのは、将来の書き換えで処理に誤りが入ったときです。たとえば引き当ての部分だけを直す前の書き方（件数を見ない条件付きの UPDATE）に戻すと、A-003 の呼び出しがその場で例外になり、トランザクションがロールバックされて、引き当ての行も残りません。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/broken_postcondition.rb。引き当ての部分だけを直す前の書き方に戻した allocate で、A-002 と A-003 を引き当てる）"
            code={`
A-003：Inventory::PostconditionViolation: TEA-002 の reserved が 2 から 2 増えていません
引き当ての行：A-002（A-003 の行はロールバックで消えた）
`}
          />
          <p>直した <code>allocate</code> を、直す前の呼び出し側と同じ引数で呼ぶと、メソッドの最初の確認で止まります。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/misuse.rb）"
            code={`
サポートの画面（直す前）：allocate(quantity: -2)
  → Inventory::PreconditionViolation: quantity は1以上の整数にしてください（-2）
モールの取り込み（直す前）：allocate(sku: "TEA-009")
  → Inventory::PreconditionViolation: 在庫の行がない SKU です（TEA-009）
文字列の数量：allocate(quantity: "2")
  → Inventory::PreconditionViolation: quantity は1以上の整数にしてください（"2"）
在庫の行：TEA-002 reserved 0、引き当ての行 0 行
`}
          />
          <p>
            例外のメッセージにはどの条件を満たさなかったかと、渡された値を入れました。<code>PreconditionViolation</code> を見た開発者は、Inventory ではなく呼び出し側を調べればよいことが、クラスの名前から分かります。
          </p>
          <h3>手順4：不変条件をモデルの検証と DB の制約にする</h3>
          <p>
            不変条件 I1（0 ≦ reserved ≦ on_hand）は、Inventory を通らない棚卸しの画面にも破られていました。そこで、Stock のモデルの検証に書きます。<code>comparison</code> は2つの比較できる値を比べる検証で、ほかの属性の名前を比べる相手に指定できます<Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            title="app/models/stock.rb（直した後）"
            code={`
class Stock < ApplicationRecord
  # 不変条件 I1：棚の数と引き当て済みの数は0以上で、引き当て済みの数は棚の数を超えない
  validates :on_hand, :reserved, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :reserved, comparison: { less_than_or_equal_to: :on_hand,
                                     message: "（%{value}）が棚の数を超えます。先に引き当てを外してください" }

  # 新しい注文に引き当てられる数
  def available = on_hand - reserved
end
`}
          />
          <p>
            モデルの検証は <code>update_columns</code>・<code>update_all</code>・<code>insert_all</code> などでは実行されません<Ref n={5} />。I1 と I2 は1行の中で判断できる条件なので、DB の CHECK 制約と外部キーにも書きます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000002_add_contract_constraints.rb"
            code={`
class AddContractConstraints < ActiveRecord::Migration[8.1]
  def change
    # 不変条件 I1：0 <= reserved <= on_hand
    add_check_constraint :stocks, "on_hand >= 0", name: "stocks_on_hand"
    add_check_constraint :stocks, "reserved >= 0", name: "stocks_reserved"
    add_check_constraint :stocks, "reserved <= on_hand", name: "stocks_reserved_within_on_hand"
    # 不変条件 I2：引き当ての行は quantity が1以上で、sku の在庫の行がある
    add_check_constraint :allocations, "quantity >= 1", name: "allocations_quantity"
    add_foreign_key :allocations, :stocks, column: :sku, primary_key: :sku
  end
end
`}
          />
          <p>
            外部キーは allocations.sku から stocks.sku を参照します。MySQL 8.4 では、外部キーが一意でない索引の列を参照する書き方は非推奨になっていて、既定の設定では使えません<Ref n={7} />。stocks.sku には一意の索引があるので、この外部キーを作れます。在庫の行を消すときに引き当ての行が残っていれば、外部キーがその削除を拒否します。場面の TEA-009 のように、在庫の行を消した商品の引き当てが残ることはなくなります。
          </p>
          <p>
            既存のテーブルに制約を加えるときは、先に制約に反する行を数えて直しておきます。反する行が残ったままでは、MySQL は CHECK 制約を加えずにエラーにします。その手順は <ChapterLink n={81} section="apply" /> と <ChapterLink n={27} section="schema-and-data-repair" /> で扱っています。この章の確認では DB を作り直してから制約を加えました。
          </p>
          <p>
            I3（reserved = 引き当ての行の合計）は2つのテーブルにまたがるので、CHECK 制約には書けません。MySQL の CHECK 制約はほかのテーブルの列や副問い合わせを使えないからです<Ref n={6} />。I3 は、Inventory のメソッドが reserved と引き当ての行を1つのトランザクションで書き換えることで守り、ずれていないかを夜間の照合（場面で使った script/reconcile.rb）とテストで確かめます。テストでは呼び出しの順序をすべて入れ替えて、どの順序でも I1 と I3 が成り立つことを確かめました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/inventory_spec.rb（抜粋）"
            code={`
it "不変条件：どの順に呼んでも、reserved が引き当ての行の合計と等しく、0 以上 on_hand 以下" do
  calls = [
    -> { Inventory.allocate(order_number: "A-1", sku: "TEA-002", quantity: 2) },
    -> { Inventory.allocate(order_number: "A-2", sku: "TEA-002", quantity: 2) },
    -> { Inventory.release(order_number: "A-1") },
    -> { Inventory.allocate(order_number: "A-3", sku: "TEA-002", quantity: -1) },
    -> { Inventory.allocate(order_number: "A-4", sku: "TEA-002", quantity: 1) },
  ]
  calls.permutation.each do |order| # 5つの呼び出しの120通りの順序
    Allocation.delete_all
    stock.update!(reserved: 0)
    order.each do |call|
      call.call
    rescue Inventory::OutOfStock, Inventory::PreconditionViolation
      nil
    end
    stock.reload
    expect(stock.reserved).to eq(Allocation.where(sku: "TEA-002").sum(:quantity))
    expect(stock.reserved).to be_between(0, stock.on_hand)
  end
end
`}
          />
          <p>
            図 61-5 は、この章で使う4つの確かめ方が、どの書き込みの経路で働くかをまとめたものです。
          </p>
          <Figure n="61-5" title="契約を確かめる4つの方法と、書き込みの経路" caption="緑のマスは、その経路の書き込みをその場で止める。破線のマスは止めないが後でずれを見つける。">
            <WaysFigure />
          </Figure>
          <p>
            図 61-5 の1行目のメソッドの中の確認は、Inventory のメソッドを通る呼び出しにだけ働きます。2行目のモデルの検証は管理画面の棚卸しのようにモデルを通る書き込みで働き、利用者に分かる理由を <code>errors</code> に入れます。3行目の CHECK 制約と外部キーは、どの経路の書き込みでも止めますが、例外のメッセージは利用者向けの文になりません。4行目の照合は書き込みを止めずに、翌朝にずれを見つけます。1つの方法ですべての経路と条件を覆うことはできないので、条件ごとに複数の方法を組み合わせます。3行目が働くことは、モデルを通らない書き込みで確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/bypass.rb。メッセージは90文字で切った）"
            code={`
update_columns(reserved: 4) → ActiveRecord::CheckViolation: Check constraint 'stocks_reserved_within_on_hand' is violated.
insert_all（quantity: -2） → ActiveRecord::CheckViolation: Check constraint 'allocations_quantity' is violated.
insert_all（sku: "TEA-009"） → ActiveRecord::InvalidForeignKey: Cannot add or update a child row: a foreign key constraint fails (\`ch80_development\`.\`allo
`}
          />
          <p>
            Rails 8.1 の MySQL のアダプターは、CHECK 制約の違反（エラー番号 3819）を <code>ActiveRecord::CheckViolation</code> に、外部キーの違反（1452 など）を <code>ActiveRecord::InvalidForeignKey</code> に変換します<Ref n={10} />。
          </p>
          <h3>手順5：呼び出し側を契約に合わせて直す</h3>
          <p>
            呼び出し側は3つとも直します。モールの取り込みは外から来た値を <code>allocate</code> に渡す前に確かめ、前提条件を満たさない明細を要確認の一覧に回します。サポートの画面は <code>release</code> を呼びます。注文の確定は <code>OutOfStock</code> を受け取って注文を確定しません。
          </p>
          <Code
            lang="ruby"
            title="app/services/mall_order_import.rb・order_cancellation.rb・checkout.rb（直した後）"
            code={`
# 外部のモールの API から届いた注文の明細を取り込む
# lines は [{ order_number: "M-101", sku: "TEA-009", quantity: 1 }, ...]
# モールから来た値は Inventory の前提条件を満たすとは限らないので、ここで確かめて、要確認の一覧に回す
class MallOrderImport
  def self.call(lines)
    lines.filter_map do |line|
      reason = check(line)
      next { **line, reason: } if reason

      Inventory.allocate(order_number: line[:order_number], sku: line[:sku], quantity: line[:quantity])
      nil
    rescue Inventory::OutOfStock => e
      { **line, reason: e.message }
    end
  end

  def self.check(line)
    return "数量が1以上の整数ではありません" unless line[:quantity].is_a?(Integer) && line[:quantity] >= 1
    "当店に在庫の行がない SKU です" unless Stock.exists?(sku: line[:sku])
  end
  private_class_method :check
end

# サポートの画面の「注文をキャンセルする」
class OrderCancellation
  def self.call(order_number:)
    Inventory.release(order_number:)
  end
end

# 注文の確定。明細ごとに在庫を引き当て、1つでも足りなければ注文全体を確定しない
class Checkout
  def self.call(order_number:, items:)
    Allocation.transaction do
      items.each { |item| Inventory.allocate(order_number:, **item) }
    end
    "#{order_number} を確定しました"
  rescue Inventory::OutOfStock => e
    "#{order_number} は確定できません（#{e.message}）"
  end
end
`}
          />
          <p>
            MallOrderImport の <code>check</code> は、<code>allocate</code> の前提条件と同じ条件を調べています。これは Meyer が避けるようにすすめた二重の確認ではありません。前提条件を満たさない明細のときにすることが、MallOrderImport だけに必要な処理（要確認の一覧に回す）だからです。外から来た値を境界で確かめる書き方は、Defensive Programming の章（<ChapterLink n={82} />）で詳しく扱います。<code>allocate</code> の最初の確認は、MallOrderImport が確かめ忘れたときに例外にするためのもので、別の処理はしません。
          </p>
          <p>
            Checkout は明細ごとの <code>allocate</code> を1つのトランザクションで囲みました。<code>allocate</code> の中の <code>Stock.transaction</code> は外側のトランザクションに加わるので、2つ目の明細で <code>OutOfStock</code> が発生すると、1つ目の明細の引き当てもロールバックされます。「足りなければ何も変えない」という <code>allocate</code> の事後条件を、注文全体についても守る形です。
          </p>
          <h3>手順6：場面と同じ操作を動かして照合とテストで確かめる</h3>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/after.rb。場面と同じ5つの操作）"
            code={`
(1) 注文の確定
  A-001 を確定しました
  A-002 を確定しました
  A-003 は確定できません（TEA-002 は残り 1 個で、2 個を引き当てられません）
(2) モールの注文の取り込み
  要確認：M-101 TEA-009 × 1（当店に在庫の行がない SKU です）
(3) サポートの画面で A-003 をキャンセル
  A-003 をキャンセルしました
(4) 注文の確定
  A-004 は確定できません（TEA-002 は残り 1 個で、3 個を引き当てられません）
(5) 管理画面で棚卸しの結果を入力（TEA-001 は2缶が破損していて、棚には1缶）
  入力のエラー：reserved （2）が棚の数を超えます。先に引き当てを外してください
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/reconcile.rb）"
            code={`
在庫の行（stocks）
  sku      on_hand reserved available 引き当ての行の合計
  TEA-001        3        2         1                  2
  TEA-002        3        2         1                  2
引き当ての行（allocations）
  A-001  TEA-001    2
  A-002  TEA-002    2
照合の結果
  ずれはありません
`}
          />
          <p>
            A-003 と A-004 は在庫が足りないので確定せず、M-101 は要確認の一覧に回りました。A-003 のキャンセルは、引き当ての行がないので何もしていません。棚卸しの入力は検証のエラーになり、担当者には「先に引き当てを外してください」と表示されます。棚が1缶しかないことは事実なので、担当者は A-001 の注文者に連絡して1缶を待ってもらうなどの対応を決め、その注文の引き当てを外してから、棚の数を入力し直すことになります。不変条件があるので、担当者は数を書き換える前にこうした判断をすることになります。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
.............

Finished in 1.69 seconds (files took 0.92806 seconds to load)
13 examples, 0 failures
`}
          />
          <p>
            13件の内訳は、Inventory の契約が7件（allocate が4件、release が2件、不変条件が1件）、Stock の検証と DB の制約が2件、3つの呼び出し側が1件ずつ、MySQL のバージョンを確かめる1件です。図 61-6 は直す前と後で、どこで何を確かめているかを比べたものです。
          </p>
          <Figure n="61-6" title="直す前と後：どこで、いつ確かめるか" caption="オレンジの箱は Inventory、紫の箱は MySQL の制約、破線の箱は夜間の照合。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 61-6 の上の段では、4つのずれがすべて DB に保存され、翌日の照合で見つかりました。下の段ではどの違反も呼んだその場で例外か検証のエラーになり、その例外のクラスが、直すべきなのが呼び出し側か Inventory かを示します。DB の制約で止めるものは、Inventory を通らない書き込みのための確認です。
          </p>
          <Callout kind="v72">
            <p>
              <code>ActiveRecord::CheckViolation</code> は Rails 8.1 で加わった例外のクラスです<Ref n={11} />。Rails 7.2 までは、CHECK 制約の違反は <code>ActiveRecord::StatementInvalid</code>（メッセージは <code>Mysql2::Error: Check constraint '…' is violated.</code>）になります。外部キーの違反の <code>ActiveRecord::InvalidForeignKey</code>、<code>comparison</code> の検証、<code>add_check_constraint</code>、<code>lock</code> は、Rails 7.2 にもあります<Ref n={16} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '何でも前提条件にする・重い不変条件を毎回確かめる',
      body: (
        <>
          <p>
            契約を書き始めると、ほかの条件も契約に入れ、できるだけ多くを実行時に確かめたくなります。ここでは、呼び出し側が確かめきれない条件を前提条件にした例と、重い不変条件をメソッドの最初と戻る前に毎回確かめた例を動かします。
          </p>
          <h3>在庫が足りることまで前提条件にした例</h3>
          <p>
            <code>allocate</code> の契約を「在庫が足りるときに呼ぶこと」という前提条件にして、足りなければ <code>PreconditionViolation</code> を発生させる形にしたとします。呼び出し側は契約を守り、呼ぶ前に必ず売れる数を確かめます。この形で、残り5缶の限定の缶に、20人がほぼ同時に購入のボタンを押した場面を再現しました。20のスレッドは、全員が売れる数を読み終えてから、そろって <code>allocate</code> を呼びます。
          </p>
          <Code
            lang="ruby"
            title="script/overuse_precondition.rb（抜粋）"
            code={`
# 在庫が足りることまで前提条件にした allocate（当てはめすぎの例）
module DemandingInventory
  def self.allocate(order_number:, sku:, quantity:)
    Stock.transaction do
      stock = Stock.lock.find_by!(sku:)
      if stock.available < quantity
        raise Inventory::PreconditionViolation, "在庫が足りるときだけ呼んでください（残り #{stock.available}）"
      end
      stock.update!(reserved: stock.reserved + quantity)
      Allocation.create!(order_number:, sku:, quantity:)
    end
  end
end

# …（省略）TEA-005 の在庫の行を on_hand 5 で作る
# 20人がほぼ同時に購入のボタンを押す。どの画面も、呼ぶ前に在庫を確かめる
read_done = Concurrent::CountDownLatch.new(20)
results = Concurrent::Array.new
threads = 20.times.map do |i|
  Thread.new do
    available = ActiveRecord::Base.connection_pool.with_connection { Stock.find_by!(sku: "TEA-005").available }
    read_done.count_down
    read_done.wait
    ActiveRecord::Base.connection_pool.with_connection do
      if available >= 1 # 呼び出し側は前提条件を確かめてから呼ぶ
        DemandingInventory.allocate(order_number: format("W-%03d", i + 1), sku: "TEA-005", quantity: 1)
        results << :allocated
      else
        results << :sold_out_on_screen
      end
    rescue Inventory::PreconditionViolation
      results << :precondition_violation
    end
  end
end
threads.each(&:join)
# …（省略）results を数えて表示する
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_MAX_THREADS=25 bin/rails runner script/overuse_precondition.rb）"
            code={`
呼ぶ前に画面で確かめた在庫：20人とも 5
引き当てた：5 人
PreconditionViolation（バグとして扱われる）：15 人
`}
          />
          <p>
            20人の画面はどれも呼ぶ前に前提条件を確かめていました。それでも15人の呼び出しが前提条件の違反になりました。確かめてから呼ぶまでのあいだに、ほかの注文が在庫を引き当てたからです。契約の上では、この15件は呼び出し側のバグです。リクエストの中で処理されない例外は 500 の応答になり、エラーの通知に送られます（<ChapterLink n={79} section="rails" />）。限定品が売り切れるたびに、直す箇所のないバグの通知が15件届き、本当のバグの通知と見分けにくくなります。
          </p>
          <p>
            Meyer は1992年の論文の囲み記事で、この問題を取り上げています。上限のあるキューに要素を入れる処理の前提条件が「満杯でない」なら、呼び出し側は満杯でないことを確かめてから呼べば成功するはずです。ところが複数のプロセッサーが同じキューを使うと、確かめてから呼ぶまでのあいだに、別の呼び出し側がキューを満杯にすることがあります。Meyer は、並行して動く場合には前提条件に別の意味づけが要る、と書いています<Ref n={1} />。Eiffel のドキュメントも、ファイルが読めることを前提条件にした読み込みの例で、確かめてから呼ぶまでのあいだにファイルの状態が変わる場合は、例外の処理で扱うとしています<Ref n={2} />。
          </p>
          <p>
            直した <code>allocate</code> で、在庫が足りないことを <code>OutOfStock</code> という結果にして、事後条件に書いたのはこのためです。売り切れは業務の上で起こりうる結果で、呼び出し側は「売り切れました」と表示すれば済み、エラーの通知にも送りません。
          </p>
          <h3>不変条件 I3 を呼ぶたびに確かめた例</h3>
          <p>
            次は Eiffel の invariant の段階のように、不変条件 I3（reserved = 引き当ての行の合計）を <code>allocate</code> の最初と戻る前に毎回確かめた例です。I3 を確かめるには、引き当ての行の合計を求める SQL が要ります。
          </p>
          <Code
            lang="ruby"
            title="script/overuse_invariant.rb（抜粋）"
            code={`
module CheckedInventory
  def self.allocate(**args)
    check_invariant!(args[:sku])
    Inventory.allocate(**args).tap { check_invariant!(args[:sku]) }
  end

  def self.check_invariant!(sku)
    Thread.current[:checking] = true
    reserved = Stock.where(sku:).pick(:reserved)
    total = Allocation.where(sku:).sum(:quantity)
    raise "不変条件 I3 の違反（#{sku}：reserved #{reserved}、合計 #{total}）" unless reserved == total
  ensure
    Thread.current[:checking] = false
  end
end
# …（省略）未出荷の引き当ての行が 0・5,000・20,000 件ある商品に、それぞれ300回 allocate を呼ぶ。
# sql.active_record の通知を購読し、照合の SQL とそれ以外の SQL の回数と時間を分けて集計する
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse_invariant.rb）"
            code={`
1回の allocate あたり（300回の平均）
  未出荷の行  allocate の SQL       照合の SQL
       0 件    6 回  13.60 ms    4 回   0.93 ms
    5000 件    6 回  14.16 ms    4 回   2.69 ms
   20000 件    6 回  12.66 ms    4 回  24.77 ms
`}
          />
          <p>
            照合を足すと、1回の <code>allocate</code> の SQL は6回から10回になりました。照合の SQL の時間は、その商品の未出荷の引き当ての行が増えるほど長くなり、2万件では <code>allocate</code> 自身の SQL の時間を超えました。時間は Docker の上で測ったもので、同じスクリプトをもう一度動かすと照合の時間は 1.76 ms・2.62 ms・54.61 ms になるなど、回によって変わります。変わらないのは、行が増えるほど照合の時間が長くなる傾向です。売れている商品ほど引き当ての行が多いので、注文の多い時間帯ほど確認の費用が増えます。
          </p>
          <p>
            Eiffel のドキュメントは、開発とテストでは高い段階で確かめ、システムを公開するときは確かめないか前提条件だけにするのが通常だとしています<Ref n={2} />。Ruby には段階を切り替える仕組みがないので、この章では I3 をメソッドの中では確かめず、夜間の照合と、呼び出しの順序を入れ替えるテストに回しました。メソッドの中に残した確認は、メモリーの上の比較と、主キーで1行を読み直す SQL だけです。
          </p>
          <h3>判断の目安</h3>
          <p>図 61-7 は条件の種類ごとに、契約のどこに書き、何で確かめるかの目安をまとめたものです。</p>
          <Figure n="61-7" title="条件の種類と、書く場所・確かめ方の目安" caption="上の4行はメソッドの前提条件と事後条件、下の3行は不変条件と、契約の外で扱う入力。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">条件の種類</th>
                    <th scope="col">この章の例</th>
                    <th scope="col">呼び出し側が呼ぶ前に確かめられるか</th>
                    <th scope="col">確認の費用</th>
                    <th scope="col">書く場所と確かめ方</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>引数の形と範囲</td>
                    <td>quantity は1以上の整数</td>
                    <td>確かめられる</td>
                    <td>メモリーの上の比較</td>
                    <td>前提条件。メソッドの最初で raise</td>
                  </tr>
                  <tr>
                    <td>相手が存在する</td>
                    <td>在庫の行がある SKU</td>
                    <td>確かめられる（外から来た値は境界で確かめる）</td>
                    <td>1回の SELECT（行のロックと兼ねる）</td>
                    <td>前提条件。メソッドの最初で raise し、外部キーでも守る</td>
                  </tr>
                  <tr>
                    <td>呼ぶまでに変わりうる状態</td>
                    <td>在庫が足りる</td>
                    <td>確かめきれない（同時の注文）</td>
                    <td>1回の SELECT</td>
                    <td>前提条件にしない。事後条件の結果（OutOfStock）にする</td>
                  </tr>
                  <tr>
                    <td>メソッドの結果</td>
                    <td>reserved が quantity だけ増える</td>
                    <td>（呼ばれる側の義務）</td>
                    <td>主キーで1回の SELECT</td>
                    <td>事後条件。戻る前に確かめ、テストでは change で書く</td>
                  </tr>
                  <tr>
                    <td>1行の中でいつも成り立つ</td>
                    <td>0 ≦ reserved ≦ on_hand</td>
                    <td>（クラスの義務）</td>
                    <td>DB が書き込みのたびに確かめる</td>
                    <td>不変条件。モデルの検証と CHECK 制約</td>
                  </tr>
                  <tr>
                    <td>テーブルをまたぎ、行の数に比例して重い</td>
                    <td>reserved = 引き当ての行の合計</td>
                    <td>（クラスの義務）</td>
                    <td>合計の SQL。行が増えるほど重い</td>
                    <td>不変条件。トランザクションで守り、夜間の照合とテストで確かめる</td>
                  </tr>
                  <tr>
                    <td>利用者や外部のシステムからの入力</td>
                    <td>モールの明細の数量</td>
                    <td>（契約の外）</td>
                    <td>（契約の外）</td>
                    <td>契約にしない。境界の処理やフォームの検証で、通常の処理として扱う</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>迷ったときは、次の順に確かめます。</p>
          <ol>
            <li>呼び出し側は呼ぶ前にその条件を確かめられるか。確かめても呼ぶまでに変わりうるなら、前提条件ではなく事後条件の結果にする。</li>
            <li>条件を満たさないときにすることは、呼び出し側ごとに違うか。どの呼び出し側でも同じなら、呼ばれる側が引き受ける形（release のように何もしない、など）にする。</li>
            <li>確認の費用はメソッドの処理と比べてどれくらいか。メソッドの処理と同じくらいか、データが増えるほど重くなるなら、テストと照合に回す。</li>
            <li>その条件を破る書き込みの経路は、メソッドのほかにあるか。あるなら、DB の制約か照合を足す。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能と契約の書き方',
      body: (
        <>
          <h3>Rails 自身が確かめている前提条件</h3>
          <p>
            Rails のメソッドにも、前提条件を最初に確かめているものがあります。たとえば関連を定義する <code>has_many</code> は、渡されたオプションの名前を一覧と照らし合わせ、知らない名前があれば <code>ArgumentError</code> を発生させます<Ref n={9} />。照らし合わせには Active Support の <code>Hash#assert_valid_keys</code> を使っています<Ref n={8} />。次は <code>dependent</code> を <code>dependant</code> と綴り誤った例です。
          </p>
          <Code
            lang="ruby"
            title="script/rails_contracts.rb"
            code={`
# Rails 自身が前提条件を確かめている例
begin
  Class.new(ApplicationRecord) do
    self.table_name = "stocks"
    has_many :allocations, foreign_key: :sku, primary_key: :sku, dependant: :restrict_with_error
  end
rescue ArgumentError => e
  puts "has_many のオプションの綴りの誤り → #{e.class}: #{e.message}"
end

puts "find_by(sku: \\"TEA-009\\") → #{Stock.find_by(sku: 'TEA-009').inspect}"
begin
  Stock.find_by!(sku: "TEA-009")
rescue ActiveRecord::RecordNotFound => e
  puts "find_by!(sku: \\"TEA-009\\") → #{e.class}: #{e.message}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/rails_contracts.rb。オプションの一覧の途中を省略）"
            code={`
has_many のオプションの綴りの誤り → ArgumentError: Unknown key: :dependant. Valid keys are: :anonymous_class, :primary_key, :foreign_key, :dependent, …（省略）, :as, :through
find_by(sku: "TEA-009") → nil
find_by!(sku: "TEA-009") → ActiveRecord::RecordNotFound: Couldn't find Stock with [WHERE \`stocks\`.\`sku\` = ?]
`}
          />
          <p>
            綴りを誤ったオプションを例外にせずに無視すると、<code>dependent</code> を指定したつもりの関連が、何も指定しない関連として動きます。Rails はクラスを読み込んだ時点で例外にするので、誤りはその場で見つかります。
          </p>
          <p>
            <code>find_by</code> と <code>find_by!</code> は、同じ検索に2つの契約を用意した例です。<code>find_by</code> は「見つからなければ nil を返す」と約束し、nil の場合の処理を呼び出し側に任せます。<code>find_by!</code> は「戻ったら必ずレコードがある」と約束し、見つからなければ <code>ActiveRecord::RecordNotFound</code> を発生させます。呼び出し側は、見つからないことが通常の場合か誤りかで、どちらの契約を使うかを選びます。場面の <code>Stock.where(sku:).update_all</code> は、見つからないときに0行を更新して何も知らせない、3つ目の振る舞いでした。
          </p>
          <h3>この章で使った Rails と RSpec の機能</h3>
          <ul>
            <li>
              <code>ArgumentError</code> のサブクラス：前提条件の違反を、引数の誤りとして表しました<Ref n={13} />。呼び出し側は <code>rescue ArgumentError</code> でもまとめて受け取れます。
            </li>
            <li>
              <code>lock</code>（<code>SELECT … FOR UPDATE</code>）：事後条件で呼ばれた時点の値と比べるために、比べる行をほかのトランザクションに書き換えさせないようにしました<Ref n={12} />。
            </li>
            <li>
              <code>validates</code> の <code>numericality</code>（<code>only_integer</code>）と <code>comparison</code>：1行の不変条件を、利用者に理由を返せる形で書きました<Ref n={5} />。
            </li>
            <li>
              <code>add_check_constraint</code> と、<code>primary_key:</code> を指定した <code>add_foreign_key</code>：モデルを通らない書き込みも含めて、1行の不変条件と、参照先の存在を DB で守りました。違反は <code>ActiveRecord::CheckViolation</code> と <code>ActiveRecord::InvalidForeignKey</code> になります<Ref n={10} />。
            </li>
            <li>
              RSpec の <code>change {'{ … }'}.by(…)</code>・<code>raise_error</code>・<code>define_negated_matcher</code>：事後条件と「何も変えない」を、実行できる仕様として書きました<Ref n={14} />。
            </li>
          </ul>
          <h3>モデルの検証と DB の制約の分担</h3>
          <p>
            Rails のガイドは、ほとんどの場合はモデルの検証を使うことをすすめています。DB を問わず使え、利用者が回避できず、テストと保守がしやすいからです。DB の制約は DB に依存し、テストと保守を難しくすることがありますが、ほかのアプリも同じ DB を使う場合や、一意性のように検証だけでは守りにくいものには、DB の制約を使うとよいとしています<Ref n={5} />。
          </p>
          <p>
            この章では不変条件ごとに分担を決めました。I1 は棚卸しの画面に理由を返すためにモデルの検証に書き、モデルを通らない書き込みのために CHECK 制約にも書きました。I2 は、引き当ての行を作るのが Inventory だけで、前提条件の確認がすでにあるので、モデルの検証は足さずに CHECK 制約と外部キーだけにしました。I3 は DB の制約では書けず、毎回の確認は重いので、照合とテストに回しました。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Exalt beautiful code」は、美しいコードの例として、<code>belongs_to</code>・<code>has_many</code>・<code>validates_presence_of</code> の3行だけを持つモデルのクラスを挙げています。DSL のように見えるが、実際はシンボルとオプションを受け取るクラスメソッドの呼び出しにすぎない、と説明しています<Ref n={15} />。Stock の <code>validates</code> の2行も同じ種類の宣言で、クラスの本文の中で、そのクラスの行がいつも満たす条件を述べています。Eiffel がクラスの本文に <code>invariant</code> の節を書くのと近い役目を、Rails では検証の宣言が担っている、と読むことができます。これはこの章の解釈で、Doctrine が契約による設計に触れているわけではありません。
          </p>
          <p>
            同じ Doctrine の「No one paradigm」は、Rails は1つの考え方をその論理的な結論まで押し進めるのではなく多くの考え方を組み合わせたものだと述べています<Ref n={15} />。この章でも、Eiffel の契約の仕組みをすべて Ruby に持ち込むことはせず、コメント・メソッドの中の確認・モデルの検証・DB の制約・テスト・夜間の照合を、条件ごとに組み合わせました。
          </p>
          <h3>本書のほかの章</h3>
          <ul>
            <li>
              <ChapterLink n={79} />（Fail Fast）：設定の抜けや不正な値を、起動時と入力を受け取った時点で止める方法です。この章の前提条件の確認は止める場所をメソッドの最初に置いたものです。
            </li>
            <li>
              <ChapterLink n={65} />（LSP）：サブクラスがメソッドを定義し直すときに、前提条件を強めず、事後条件を弱めないことを、共通のテストで確かめる方法です。
            </li>
            <li>
              <ChapterLink n={81} />（Make Illegal States Unrepresentable）：状態の列と日時の列の組み合わせを CHECK 制約で決める方法と、既存の行を直してから制約を加える手順です。
            </li>
            <li>
              <ChapterLink n={82} />（Defensive Programming）：Webhook や CSV のように外から来るデータを、境界で確かめる方法です。この章の MallOrderImport の確認にあたります。
            </li>
            <li>
              <ChapterLink n={71} />（Encapsulation）：残高のように不変条件を持つ値を、公開した操作だけで書き換えさせる方法です。
            </li>
            <li>
              <ChapterLink n={49} section="stock-update" />：在庫の減算を条件付きの UPDATE で書く方法です。条件に合う行がなかったときの件数を確かめることも扱っています。
            </li>
            <li>
              <ChapterLink n={84} />（Atomicity）：Checkout のように、複数の明細の引き当てを全部行うか、何も行わないかの単位にする方法です。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>契約による設計（Design by Contract）は、メソッドを呼ぶ側と呼ばれる側の取り決めを、前提条件・事後条件・不変条件として明確にする原則です。Bertrand Meyer が Eiffel とともに示した考え方で、Meyer は1986年の技術報告を最初の論述とし、1992年に論文「Applying "Design by Contract"」を発表しました。</li>
          <li>場面では、取り決めがないまま4か所から在庫を動かし、負の数量・在庫の行がない SKU・件数を見ない UPDATE・棚卸しの書き換えで、在庫の数が出荷の前の照合までずれたままになりました。</li>
          <li>前提条件の違反は呼び出し側のバグ、事後条件と不変条件の違反は呼ばれる側のバグを表します。例外のクラスを分けておくと、どちらを直すかが例外を見た時点で分かります。</li>
          <li>1つの条件は前提条件として呼び出し側に任せるか、呼ばれる側の処理で引き受けるかのどちらかにして、両方で処理しません。外から来た値は契約の対象にせず、境界で通常の処理として確かめます。</li>
          <li>Ruby では、前提条件をメソッドの最初の raise、事後条件を呼ばれた時点の値との比較とテストの change、1行の不変条件をモデルの検証と CHECK 制約、テーブルをまたぐ不変条件を照合とテストで書きます。Ruby には確認を切り替える仕組みがないので、メソッドの中には軽い確認だけを置きます。</li>
          <li>在庫が足りることのように、呼び出し側が確かめても呼ぶまでに変わる条件は、前提条件にせず、事後条件の結果（OutOfStock）として約束します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    {
      title: 'Applying "Design by Contract"',
      publisher: 'Bertrand Meyer / IEEE Computer（ETH Zurich の Meyer のページに置かれた PDF）',
      url: 'https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf',
      accessed: '2026-11-22',
      version: '25巻10号、1992年10月、40〜51ページ（DOI 10.1109/2.161279。巻号とページは Crossref のメタデータでも確かめた）',
      note: '1991年の書籍の章をもとにしたこと。防御的プログラミングへの批判、配送業者の契約の例（5kg・2m・100フラン・4時間）と義務と利益の表、No Hidden Clauses の規則、前提条件と事後条件と不変条件の定義、put_child の old を使う事後条件、前提条件の違反は呼び出し側のバグで事後条件の違反は呼ばれる側のバグであること、前提条件が満たされないときルーチンは何もしなくてよいこと、条件を Require か本体の If のどちらかに置き両方には置かないこと、demanding と tolerant の選び方、不変条件は作成の後と公開したルーチンの後に成り立ち途中では成り立たなくてよいこと、実行時の確認の段階、並行して動く場合の前提条件の問題（囲み記事）、Floyd・Hoare・Dijkstra の研究と Hoare のデータの不変条件が元になったこと。',
    },
    {
      title: 'ET: Design by Contract (tm), Assertions and Exceptions',
      publisher: 'Eiffel Documentation（eiffel.org）',
      url: 'https://www.eiffel.org/doc/eiffel/ET-_Design_by_Contract_%28tm%29%2C_Assertions_and_Exceptions',
      accessed: '2026-11-22',
      note: 'require・ensure・invariant の構文と ACCOUNT の deposit の例、old は事後条件の中だけで使えること、事後条件と不変条件の違反は呼ばれる側のバグであること、実行時の表明の違反はバグの現れであること、契約は利用者の誤った入力を調べる仕組みではなくモジュールの間の条件であること、確認の段階（no・require・ensure・invariant・all）と既定が require であること、システムを公開するときは確かめないか require に下げるのが通常であること、file.readable を前提条件にした読み込みで状態が変わる場合を例外で扱う例、契約の形式（short form）。',
    },
    {
      title: 'Publications of Bertrand Meyer',
      publisher: 'Bertrand Meyer（ETH Zurich）',
      url: 'https://se.inf.ethz.ch/~meyer/publications/',
      accessed: '2026-11-22',
      note: '1985年の UCSB の技術報告が Eiffel の最初の記述であること。1986年の技術報告「Design by Contract」（TR-EI-12/CO、Interactive Software Engineering Inc.）が最初の論述であり IEEE Computer の論文になったこと。1988年の『Object-Oriented Software Construction』初版の章と、1991年の『Advances in Object-Oriented Software Engineering』の章（1〜50ページ）。',
    },
    {
      title: 'ET: Inheritance',
      publisher: 'Eiffel Documentation（eiffel.org）',
      url: 'https://www.eiffel.org/doc/eiffel/ET-_Inheritance',
      accessed: '2026-11-22',
      note: '定義し直したルーチンでは require と ensure を書けず、require else と ensure then だけを書けること。',
    },
    {
      title: 'Active Record Validations',
      publisher: 'Ruby on Rails Guides',
      url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html',
      accessed: '2026-11-22',
      version: 'Rails 8.1',
      note: 'comparison の検証が2つの比較できる値を比べ、message で文を変えられること。numericality の only_integer。update_all・update_columns・insert_all などが検証を飛ばすこと。モデルの検証が多くの場合にすすめられる理由と、DB の制約の利点と欠点。',
    },
    {
      title: 'CHECK Constraints',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html',
      accessed: '2026-11-21',
      version: 'MySQL 8.4',
      note: 'CHECK 制約の条件に、ほかのテーブルの列や副問い合わせを使えないこと（Make Illegal States Unrepresentable の章の出典を流用）。',
    },
    {
      title: 'FOREIGN KEY Constraints',
      publisher: 'MySQL 8.4 Reference Manual',
      url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html',
      accessed: '2026-11-22',
      version: 'MySQL 8.4',
      note: '一意でない索引の列を参照する外部キーは非推奨で、restrict_fk_on_non_standard_key の設定で許したときだけ作れること。',
    },
    {
      title: 'activesupport/lib/active_support/core_ext/hash/keys.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activesupport/lib/active_support/core_ext/hash/keys.rb#L39-L55`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'assert_valid_keys が、一覧にないキーがあれば「Unknown key: … Valid keys are: …」の ArgumentError を発生させること。',
    },
    {
      title: 'activerecord/lib/active_record/associations/builder/association.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/associations/builder/association.rb#L65-L71`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: '関連のオプションを validate_options で assert_valid_keys に渡し、使えるオプションの一覧と照らし合わせること。',
    },
    {
      title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L850-L905`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'MySQL のエラー番号 1216・1217・1451・1452 を InvalidForeignKey に、3819（ER_CHECK_CONSTRAINT_VIOLATED）を CheckViolation に変換すること。',
    },
    {
      title: 'activerecord/CHANGELOG.md',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/CHANGELOG.md#L913`,
      accessed: '2026-11-21',
      version: 'Rails 8.1.0（2025年10月22日）の項',
      note: '「Add ActiveRecord::CheckViolation error class for check constraint violations.」（Make Illegal States Unrepresentable の章の出典を流用）。',
    },
    {
      title: 'activerecord/lib/active_record/locking/pessimistic.rb',
      publisher: 'rails/rails（GitHub）',
      url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L7-L26`,
      accessed: '2026-11-22',
      version: 'Rails 8.1.4.1',
      note: 'find や find_by に lock をつなぐと SELECT … FOR UPDATE で行の排他ロックを取ること。',
    },
    {
      title: 'class ArgumentError',
      publisher: 'Ruby 4.0 Documentation',
      url: 'https://docs.ruby-lang.org/en/4.0/ArgumentError.html',
      accessed: '2026-11-22',
      version: 'Ruby 4.0',
      note: '引数が誤っていて、より具体的な例外のクラスがないときに発生させる例外であること。',
    },
    {
      title: '`change` matcher',
      publisher: 'RSpec Expectations',
      url: 'https://rspec.info/features/3-13/rspec-expectations/built-in-matchers/change/',
      accessed: '2026-11-22',
      version: 'RSpec 3.13',
      note: 'change がブロックの実行で変わる値を指定し、from・to・by などで変わり方を絞れること。',
    },
    {
      title: 'The Rails Doctrine',
      publisher: 'rubyonrails.org / David Heinemeier Hansson',
      url: 'https://rubyonrails.org/doctrine',
      accessed: '2026-11-22',
      note: '「Exalt beautiful code」で、belongs_to・has_many・validates_presence_of の3行のモデルを例に挙げ、シンボルとオプションを受け取るクラスメソッドの呼び出しにすぎないと説明していること。「No one paradigm」で、Rails は1つの考え方を押し進めず多くの考え方を組み合わせたものだと述べていること。',
    },
    {
      title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb（Rails 7.2.2.1）',
      publisher: 'rails/rails（GitHub）',
      url: 'https://github.com/rails/rails/blob/v7.2.2.1/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L838-L839',
      accessed: '2026-11-22',
      version: 'Rails 7.2.2.1',
      note: '7.2.2.1 でも外部キーの違反を InvalidForeignKey に変換すること。同じ版の gem で add_check_constraint（schema_statements.rb）と lock（query_methods.rb）があることを確かめ、activemodel/lib/active_model/validations/comparison.rb が v7.2.2.1 のタグにあることを GitHub のファイルの一覧で確かめた。',
    },
  ],
}

export default chapter
