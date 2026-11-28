import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 61-1 場面の構成 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="61-1"
      w={780}
      h={440}
      label="Order モデル（app/models/order.rb）の中に、経理の CSV（accounting_csv と CSV_HEADERS）、発送の通知（ship! と shipped_message）、保存の規則（has_many、enum、validates）が書かれている。経理の CSV と発送の通知は、どちらも total（商品の合計 + 送料 − ポイント）を呼ぶ。経理の CSV は会計ソフトに取り込まれ、発送の通知は OrderMailer を通じてお客様にメールで届き、保存の規則は MySQL の orders と order_items に関係する。経理の依頼で total を変えると、発送のメールの金額も変わる"
    >
      <rect x={160} y={30} width={460} height={290} rx={8} fill="none" stroke="var(--fig-line)" />
      <T x={176} y={50} bold mono>
        Order（app/models/order.rb）
      </T>
      <Box x={180} y={70} w={200} h={64} lines={['経理の CSV', 'accounting_csv・CSV_HEADERS']} fs={12} bold subTone="muted" />
      <Box x={400} y={70} w={200} h={64} lines={['発送の通知', 'ship!・shipped_message']} fs={12} bold subTone="muted" />
      <Box x={290} y={170} w={200} h={56} lines={['total', '商品の合計 + 送料 − ポイント']} fs={12} fill="box5" bold accent subTone="muted" />
      <Arrow x1={280} y1={134} x2={338} y2={168} accent />
      <Arrow x1={500} y1={134} x2={442} y2={168} accent />
      <T x={268} y={158} fs={11} anchor="end" tone="muted">
        呼ぶ
      </T>
      <T x={512} y={158} fs={11} tone="muted">
        呼ぶ
      </T>
      <Box x={180} y={248} w={420} h={56} lines={['保存の規則', 'has_many :items・enum :status・validates']} fs={12} bold subTone="muted" />

      <Box x={10} y={70} w={130} h={64} lines={['会計ソフト', '経理部が取り込む']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={180} y1={102} x2={142} y2={102} />
      <Box x={640} y={70} w={130} h={64} lines={['お客様', '発送のメール']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={600} y1={102} x2={638} y2={102} />
      <T x={705} y={152} fs={11} anchor="middle" tone="muted">
        OrderMailer が送る
      </T>
      <Box x={290} y={346} w={200} h={48} lines={['MySQL', 'orders・order_items']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={390} y1={304} x2={390} y2={344} />

      <T x={390} y={424} fs={12} anchor="middle" tone="danger">
        経理の依頼で total を変えると、発送のメールの金額も変わる
      </T>
    </Svg>
  )
}

/* ---------- 図 61-2 変更を求める人と変更の理由 ---------- */
function ActorsFigure() {
  const rows = [
    { y: 40, who: ['経理部', '売上の計上'], why: ['会計ソフトの取り込み形式', '売上・値引きの計上のしかた'] },
    { y: 170, who: ['カスタマーサポート', 'お客様への連絡'], why: ['メールの文面と書く項目', 'お客様からの問い合わせ'] },
    { y: 300, who: ['開発チーム', 'データの保存'], why: ['必須の項目と状態', 'テーブルの設計'] },
  ]
  return (
    <Svg
      id="61-2"
      w={780}
      h={420}
      label="経理部は会計ソフトの取り込み形式や売上の計上のしかたを理由に、accounting_csv と CSV_HEADERS、そして total の変更を求める。カスタマーサポートはメールの文面やお客様からの問い合わせを理由に、shipped_message と total の変更を求める。開発チームは必須の項目や状態、テーブルの設計を理由に、validates・enum・has_many の変更を求める。total には経理部とカスタマーサポートの2つの担当の変更が届く"
    >
      <T x={85} y={18} anchor="middle" bold>
        変更を求める人
      </T>
      <T x={315} y={18} anchor="middle" bold>
        変更の理由（例）
      </T>
      <T x={645} y={18} anchor="middle" bold>
        Order の中で直す箇所
      </T>
      {rows.map((r) => (
        <g key={r.y}>
          <Box x={10} y={r.y} w={150} h={70} lines={r.who} fs={12} bold subTone="muted" />
          <Arrow x1={160} y1={r.y + 35} x2={198} y2={r.y + 35} />
          <Box x={200} y={r.y} w={230} h={70} lines={r.why} fs={12} dashed />
        </g>
      ))}
      <Box x={520} y={40} w={250} h={50} lines="accounting_csv・CSV_HEADERS" fs={12} mono />
      <Box x={520} y={115} w={250} h={50} lines={['total', '経理部と CS の両方の変更が届く']} fs={12} mono fill="box5" accent subTone="danger" />
      <Box x={520} y={190} w={250} h={50} lines="ship!・shipped_message" fs={12} mono />
      <Box x={520} y={300} w={250} h={70} lines="validates・enum・has_many" fs={12} mono />
      <Arrow x1={430} y1={68} x2={518} y2={65} />
      <Arrow x1={430} y1={82} x2={518} y2={132} accent />
      <Arrow x1={430} y1={198} x2={518} y2={150} accent />
      <Arrow x1={430} y1={212} x2={518} y2={215} />
      <Arrow x1={430} y1={335} x2={518} y2={335} />
      <T x={20} y={402} fs={12} tone="muted">
        破線の箱は、その担当から届く変更の理由の例
      </T>
    </Svg>
  )
}

/* ---------- 図 61-3 SRP の背景にある考え方の流れ ---------- */
function HistoryFigure() {
  const items: { x: number; year: string; lines: string[]; up: boolean; acc?: boolean }[] = [
    { x: 90, year: '1972', lines: ['Parnas', '変わりやすい設計判断', 'ごとにモジュールを分ける'], up: true },
    { x: 210, year: '1974', lines: ['Dijkstra（EWD447）', '関心の分離'], up: false },
    { x: 330, year: '1970〜80年代', lines: ['Constantine ら', '結合と凝集'], up: true },
    { x: 450, year: '2002', lines: ['Martin『Agile Software', 'Development』', '第8章 SRP'], up: false, acc: true },
    { x: 570, year: '2014', lines: ['Martin のブログ', '変更の理由は人', '同じ理由で変わる物を集める'], up: true },
    { x: 690, year: '2017', lines: ['Martin『Clean', 'Architecture』第7章', '偶然の重複・マージ'], up: false },
  ]
  return (
    <Svg
      id="61-3"
      w={780}
      h={360}
      label="1972年に Parnas が、変わりやすい設計判断ごとにモジュールを分けることを提案した。1974年に Dijkstra が EWD447 で関心の分離という言葉を使った。1970〜80年代に Constantine らが結合と凝集の考え方を広めた。Martin はこれらを1990年代後半に1つの原則にまとめ、2002年の『Agile Software Development』の第8章で SRP として示した。2014年のブログでは、変更の理由は人であり、同じ理由で変わる物を集め、違う理由で変わる物を分けると説明した。2017年の『Clean Architecture』第7章では、偶然の重複とマージの2つの症状を節に分けている"
    >
      <Arrow x1={20} y1={180} x2={765} y2={180} />
      {items.map((it) => {
        const by = it.up ? 50 : 230
        return (
          <g key={it.year}>
            <circle cx={it.x} cy={180} r={5} fill={it.acc ? 'var(--fig-accent)' : 'var(--fig-line)'} />
            <line x1={it.x} y1={it.up ? 130 : 185} x2={it.x} y2={it.up ? 175 : 230} stroke="var(--fig-line)" strokeDasharray="3 3" />
            <T x={it.x} y={it.up ? 196 : 164} fs={12} anchor="middle" bold>
              {it.year}
            </T>
            <Box x={it.x - 85} y={by} w={170} h={80} lines={it.lines} fs={12} bold accent={it.acc} fill={it.acc ? 'box5' : 'box'} subTone="muted" />
          </g>
        )
      })}
      <T x={20} y={346} fs={12} tone="muted">
        2002年の本の前に、Martin は1990年代後半にこれらを1つの原則にまとめたと書いている
      </T>
    </Svg>
  )
}

/* ---------- 図 61-4 分ける前と分けた後のクラス ---------- */
function BeforeAfterFigure() {
  return (
    <Svg
      id="61-4"
      w={780}
      h={420}
      label="分ける前は、Order の中に経理の CSV、発送の通知、保存の規則、両方が使う total があり、spec/models/order_spec.rb に経理・CS・開発の3つの担当のテストが入っている。分けた後は、経理の CSV を AccountingCsv（経理）に、発送の通知の文面を OrderMailer と shipped.text.erb（CS）に移し、Order（開発）には items_total・payment_amount・ship!・validates が残る。AccountingCsv は Order の items_total などを読み、メールのテンプレートは payment_amount を読む。Order の ship! は OrderMailer を呼ぶ。テストは accounting_csv_spec.rb・order_spec.rb・order_mailer_spec.rb の3つに分かれる"
    >
      <T x={20} y={20} bold>
        分ける前
      </T>
      <Box
        x={20}
        y={40}
        w={270}
        h={200}
        lines={['Order', '経理の CSV（accounting_csv）', '発送の通知（shipped_message）', '保存の規則（validates など）', 'total（経理の CSV と通知が使う）', 'ship!']}
        fs={12}
        bold
        align="start"
        subTone="muted"
      />
      <Box x={20} y={270} w={270} h={56} lines={['spec/models/order_spec.rb', '経理・CS・開発のテストが1つのファイルに']} fs={12} fill="box4" subTone="muted" />
      <T x={20} y={360} fs={12} tone="danger">
        3つの担当の変更が、同じクラスと同じ
      </T>
      <T x={20} y={378} fs={12} tone="danger">
        テストのファイルに入る
      </T>

      <line x1={315} y1={10} x2={315} y2={410} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={335} y={20} bold>
        分けた後
      </T>
      <Box x={335} y={40} w={200} h={70} lines={['AccountingCsv（経理）', 'HEADERS・row・sales_amount']} fs={12} bold accent subTone="muted" />
      <Box x={565} y={40} w={200} h={70} lines={['OrderMailer（CS）', 'shipped.text.erb']} fs={12} bold accent subTone="muted" />
      <Box x={450} y={170} w={260} h={70} lines={['Order（開発）', 'items_total・payment_amount', 'ship!・validates']} fs={12} bold subTone="muted" />
      <Arrow x1={440} y1={110} x2={500} y2={168} dashed />
      <T x={335} y={150} fs={11} tone="muted">
        items_total などを読む
      </T>
      <Arrow x1={630} y1={110} x2={630} y2={168} dashed />
      <T x={622} y={150} fs={11} anchor="end" tone="muted">
        payment_amount
      </T>
      <Arrow x1={700} y1={168} x2={700} y2={112} />
      <T x={708} y={150} fs={11} tone="muted">
        ship! が呼ぶ
      </T>
      <Box x={335} y={290} w={140} h={44} lines="accounting_csv_spec" fs={11} fill="box4" mono />
      <Box x={490} y={290} w={120} h={44} lines="order_spec" fs={11} fill="box4" mono />
      <Box x={625} y={290} w={140} h={44} lines="order_mailer_spec" fs={11} fill="box4" mono />
      <T x={335} y={364} fs={12} tone="acc">
        担当ごとにクラスとテストのファイルが分かれる
      </T>
    </Svg>
  )
}

/* ---------- 図 61-5 経理の依頼が及ぶ範囲 ---------- */
function ImpactFigure() {
  return (
    <Svg
      id="61-5"
      w={780}
      h={320}
      label="分ける前は、経理の依頼で Order#total を変えると、経理の CSV の金額が依頼どおり 3,300 から 3,800 に変わるのと同時に、発送のメールのお支払い金額も 3,300円から 3,800円に変わる。メールの変更は誰も依頼していない。order_spec.rb の4件のうち1件が失敗する。分けた後は、AccountingCsv だけを変え、経理の CSV の金額が 3,800 に変わる。発送のメールは 3,300円のままで、Order と OrderMailer は変えない。変えたファイルは2つで、5件のテストがすべて成功する"
    >
      <T x={20} y={20} bold>
        分ける前
      </T>
      <Box x={105} y={36} w={180} h={40} lines="経理の依頼" fs={12} fill="box5" bold />
      <Arrow x1={195} y1={76} x2={195} y2={104} />
      <Box x={95} y={106} w={200} h={44} lines="Order#total を変える" fs={12} accent />
      <Arrow x1={160} y1={150} x2={110} y2={188} />
      <Arrow x1={230} y1={150} x2={280} y2={188} accent />
      <Box x={20} y={190} w={165} h={54} lines={['経理の CSV', '3300 → 3800（依頼どおり）']} fs={12} subTone="muted" />
      <Box x={200} y={190} w={165} h={54} lines={['発送のメール', '3,300円 → 3,800円']} fs={12} subTone="danger" />
      <T x={282} y={262} fs={12} anchor="middle" tone="danger">
        誰も依頼していない変更
      </T>
      <T x={20} y={300} fs={12} tone="danger">
        order_spec.rb：4件中1件が失敗
      </T>

      <line x1={390} y1={10} x2={390} y2={310} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={410} y={20} bold>
        分けた後
      </T>
      <Box x={495} y={36} w={180} h={40} lines="経理の依頼" fs={12} fill="box5" bold />
      <Arrow x1={585} y1={76} x2={585} y2={104} />
      <Box x={485} y={106} w={200} h={44} lines="AccountingCsv を変える" fs={12} accent />
      <Arrow x1={540} y1={150} x2={500} y2={188} />
      <Box x={410} y={190} w={165} h={54} lines={['経理の CSV', '3300 → 3800（依頼どおり）']} fs={12} subTone="muted" />
      <Box x={595} y={190} w={165} h={54} lines={['発送のメール', '3,300円のまま']} fs={12} dashed subTone="muted" />
      <T x={677} y={262} fs={12} anchor="middle" tone="muted">
        Order・OrderMailer は変えない
      </T>
      <T x={410} y={300} fs={12} tone="acc">
        変えたファイルは2つ。5件すべて成功
      </T>
    </Svg>
  )
}

/* ---------- 図 61-6 分けるかどうかの判断 ---------- */
function JudgeFigure() {
  const cells = [
    { x: 130, y: 50, head: '同じクラスの中で分ける', lines: ['private メソッドに名前を付ける', '例：CSV の日付の形式と金額の計算'] },
    { x: 450, y: 50, head: '別のクラスに分ける', lines: ['この章の SRP の対象', '例：経理の CSV と発送の通知'] },
    { x: 130, y: 220, head: '1つにまとめておく', lines: ['分けると1つの依頼で多くのファイルを直す', '例：CSV の見出しと行の並び'] },
    { x: 450, y: 220, head: '今は共有してよい', lines: ['食い違いが出た時点で分ける', '例：消費税率（法律で決まる値）'] },
  ]
  return (
    <Svg
      id="61-6"
      w={780}
      h={450}
      label="横軸は変更を求める人が同じか違うか、縦軸は変わる時期が別々か一緒か。変更を求める人が違い、変わる時期も別々なら、別のクラスに分ける。この章の経理の CSV と発送の通知がこれに当たる。変更を求める人が同じで変わる時期が別々なら、同じクラスの中で private メソッドに分ける。変更を求める人が同じで一緒に変わるなら、1つにまとめておく。CSV の見出しと行の並びがこれに当たり、6つのクラスに分けた例は分けすぎになる。変更を求める人は違うが一緒に変わるもの、たとえば法律で決まる消費税率は、今は共有し、食い違いが出た時点で分ける"
    >
      <T x={60} y={20} anchor="middle" bold>
        変わる時期
      </T>
      <T x={60} y={135} anchor="middle" fs={12}>
        別々に変わる
      </T>
      <T x={60} y={305} anchor="middle" fs={12}>
        一緒に変わる
      </T>
      <Arrow x1={120} y1={390} x2={120} y2={36} />
      <Arrow x1={120} y1={390} x2={770} y2={390} />
      <T x={285} y={410} anchor="middle" fs={12}>
        同じ人（1つの担当）
      </T>
      <T x={605} y={410} anchor="middle" fs={12}>
        違う人（複数の担当）
      </T>
      <T x={445} y={436} anchor="middle" bold>
        変更を求める人
      </T>
      {cells.map((c) => (
        <Box key={c.head} x={c.x} y={c.y} w={310} h={150} fill="none" dashed />
      ))}
      {cells.map((c) => (
        <g key={`${c.head}-t`}>
          <T x={c.x + 155} y={c.y + 24} anchor="middle" bold>
            {c.head}
          </T>
          <T x={c.x + 155} y={c.y + 50} anchor="middle" fs={12}>
            {c.lines[0]}
          </T>
          <T x={c.x + 155} y={c.y + 70} anchor="middle" fs={12} tone="muted">
            {c.lines[1]}
          </T>
        </g>
      ))}
      <Box x={150} y={306} w={270} h={40} lines="AccountingCsv を6つのクラスに分けた例" fs={12} fill="box5" />
      <T x={285} y={358} anchor="middle" fs={11} tone="danger">
        分けすぎ：1つの依頼で7つのファイルを直す
      </T>
      <Box x={470} y={136} w={270} h={40} lines="分ける前の Order#total" fs={12} fill="box5" />
      <T x={605} y={186} anchor="middle" fs={11} tone="danger">
        分けていない：経理の変更が通知に及ぶ
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 63,
  part: 8,
  title: 'SRP：注文のモデルから CSV の出力と通知を分ける',
  summary:
    '経理の CSV と発送の通知が1つの Order モデルに書かれ、経理の依頼で変えた金額の計算が通知のメールの金額まで変えてしまう例で、単一責任の原則（SRP）を扱います。変更を求める人ごとにクラスとテストを分け、分けすぎたときの判断の目安と、Rails の置き場所との対応を示します。',
  goals: [
    '単一責任の原則（SRP）の「変更する理由」が、変更を求める人（業務の担当）を指すことを説明できる',
    '1つのモデルに複数の担当の処理が混ざると、ある担当の依頼で別の担当の機能が変わってしまう流れを、実行結果をもとに説明できる',
    '同じ式に見える計算が別の知識（お客様の支払額と経理の売上額）であることを見分け、名前と置き場所を分けられる',
    'CSV を普通の Ruby のクラスに、通知の文面をメーラーのテンプレートに移し、テストを担当ごとのファイルに分けられる',
    '同じ担当の処理を細かいクラスに分けすぎたときの費用を説明し、分けるかどうかを2つの軸で判断できる',
    'Active Record・Concern・メーラーなど Rails の仕組みと SRP の関係を説明できる',
  ],
  prerequisites: [30, 56],
  sections: [
    {
      id: 'scene',
      title: '経理の CSV の列を変えたら、発送のメールの金額が変わる',
      body: (
        <>
          <p>
            この章では注文のモデルに書かれた経理の CSV と発送の通知を例に、単一責任の原則（SRP）を扱います。<ChapterLink n={30} section="design-basics" />では、責務を分ける手がかりがそのコードを書き換える理由（変更理由）であることを、注文の取り消しの例で説明しました。この章ではその「書き換える理由」が誰から来るのかに注目し、理由の違うコードが1つのクラスにあると何が起きるかを、動かして確かめます。
          </p>
          <h3>そもそも注文のデータを誰が使うのか</h3>
          <p>
            雑貨を売る EC サイトを考えます。お客様が注文すると、orders テーブルに1行、order_items テーブルに商品ごとの行が保存されます。この注文のデータを、社内の3つの担当が別々の目的で使います。
          </p>
          <ul>
            <li>経理部：毎月、前の月の注文を CSV（項目をカンマで区切ったテキストのファイル）でダウンロードし、会計ソフトに取り込んで売上を記録します。CSV の列の並びと、金額の列に何を入れるかは経理部が決めます。</li>
            <li>カスタマーサポート（以下 CS）：商品を発送したときにお客様に送るメールの文面を決め、お客様からの問い合わせに答えます。メールに何を書くかは CS が決めます。</li>
            <li>開発チーム：注文に必須の項目、注文の状態（発送待ち・発送済み）、テーブルの設計を決めます。</li>
          </ul>
          <p>
            例として、山田さんが Tシャツ（2,000円）とマグカップ（1,200円）を注文し、送料 600円のうち 500円分をポイントで払った注文を使います。商品の合計は 3,200円、送料を足して 3,800円、ポイントを引いてお客様が支払う金額は 3,300円です。金額はどれも税込みの円とし、1ポイントは1円として扱います。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :number, null: false, index: { unique: true } # 注文番号（A-1001 など）
      t.string :customer_name, null: false
      t.string :email, null: false
      t.string :status, null: false, default: "pending"        # pending・shipped
      t.integer :shipping_fee, null: false, default: 0          # 送料（円・税込み）
      t.integer :points_used, null: false, default: 0           # 支払いに使ったポイント（1ポイント = 1円）
      t.string :tracking_number                                 # 配送の問い合わせ番号
      t.datetime :ordered_at, null: false
      t.datetime :shipped_at
      t.timestamps
    end

    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.string :product_name, null: false
      t.integer :unit_price, null: false # 単価（円・税込み）
      t.integer :quantity, null: false
      t.timestamps
    end
  end
end
`}
          />
          <h3>1つのモデルに書いたコード</h3>
          <p>最初のコードは経理の CSV も発送の通知の文面も Order モデルに書いています。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
require "csv"

class Order < ApplicationRecord
  has_many :items, class_name: "OrderItem", dependent: :destroy

  enum :status, { pending: "pending", shipped: "shipped" }
  validates :number, :customer_name, :email, :ordered_at, presence: true

  # ---------- 経理の CSV（経理部が毎月、会計ソフトに取り込む） ----------
  CSV_HEADERS = %w[注文番号 注文日 顧客名 金額 状態].freeze
  STATUS_LABELS = { "pending" => "発送待ち", "shipped" => "発送済み" }.freeze

  def self.accounting_csv(orders)
    CSV.generate do |csv|
      csv << CSV_HEADERS
      orders.each do |order|
        csv << [order.number, order.ordered_at.to_date.iso8601, order.customer_name, order.total, STATUS_LABELS.fetch(order.status)]
      end
    end
  end

  # ---------- 発送の通知（文面はカスタマーサポートが決める） ----------
  def ship!(tracking_number:)
    update!(status: "shipped", tracking_number:, shipped_at: Time.current)
    OrderMailer.with(order: self).shipped.deliver_later
  end

  def shipped_message
    <<~TEXT
      #{customer_name} 様

      ご注文 #{number} の商品を発送しました。
      お支払い金額：#{total.to_fs(:delimited)}円
      お問い合わせ番号：#{tracking_number}
    TEXT
  end

  # ---------- 両方から使う ----------
  # 注文の金額（商品の合計 + 送料 - ポイント）
  def total = items.sum(&:amount) + shipping_fee - points_used
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/order_item.rb・app/mailers/order_mailer.rb・app/views/order_mailer/shipped.text.erb"
            code={`
class OrderItem < ApplicationRecord
  belongs_to :order

  def amount = unit_price * quantity
end

class OrderMailer < ApplicationMailer
  def shipped
    @order = params[:order]
    mail(to: @order.email, subject: "ご注文 #{@order.number} の商品を発送しました")
  end
end

# app/views/order_mailer/shipped.text.erb の中身は1行だけ
<%= @order.shipped_message %>
`}
          />
          <p>
            <code>Order.accounting_csv</code> は、Ruby の csv ライブラリの <code>CSV.generate</code> で、見出しの行と注文ごとの行を作ります。<code>ship!</code> は注文を発送済みにして、<code>deliver_later</code> で発送のメールの送信をジョブのキューに入れます。メールの本文は <code>shipped_message</code> が作ります。<code>to_fs(:delimited)</code> は、数値を3桁ごとにカンマで区切る Active Support のメソッドです。
          </p>
          <p>
            経理の CSV の金額の列と、メールのお支払い金額は、どちらも <code>total</code> を呼んでいます。今は「商品の合計 + 送料 − ポイント」という同じ金額を表示すればよいので、同じ計算を2回書かずに1つのメソッドにまとめた形です。図 61-1 はこのコードの構成です。経理の CSV と発送の通知の2つの処理が、真ん中の total を共有しています。
          </p>
          <Figure n="61-1" title="場面の構成" caption="模式図。Order の枠の中の箱はクラスの中の処理のまとまり、枠の外の箱は DB と外部のもの。強調した total に、2つの処理からの矢印が集まっている。">
            <SceneFigure />
          </Figure>
          <p>開発用の DB に注文を1件作り、経理の CSV と発送のメールの本文を表示しました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/demo.rb）"
            code={`
== 経理の CSV
注文番号,注文日,顧客名,金額,状態
A-1001,2026-11-02,山田花子,3300,発送待ち
== 発送の通知
山田花子 様

ご注文 A-1001 の商品を発送しました。
お支払い金額：3,300円
お問い合わせ番号：1234-5678-9012
`}
          />
          <p>
            テストは spec/models/order_spec.rb の1つのファイルにあります。保存の規則、経理の CSV、発送の通知のテストが並んでいて、4件とも成功します。
          </p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（直す前）"
            code={`
require "rails_helper"

RSpec.describe Order do
  include ActiveJob::TestHelper

  let(:order) do
    Order.create!(number: "A-1001", customer_name: "山田花子", email: "hanako@example.com",
                  ordered_at: Time.zone.local(2026, 11, 2, 10, 0), shipping_fee: 600, points_used: 500).tap do |o|
      o.items.create!(product_name: "Tシャツ", unit_price: 2000, quantity: 1)
      o.items.create!(product_name: "マグカップ", unit_price: 1200, quantity: 1)
    end
  end

  # ---------- 開発：保存の規則 ----------
  it "注文番号がなければ保存しない" do
    expect(Order.new(customer_name: "山田花子", email: "hanako@example.com", ordered_at: Time.current)).not_to be_valid
  end

  # ---------- 経理：CSV ----------
  describe ".accounting_csv" do
    it "経理の列の順に1行ずつ出力する" do
      expect(Order.accounting_csv([order])).to eq <<~CSV
        注文番号,注文日,顧客名,金額,状態
        A-1001,2026-11-02,山田花子,3300,発送待ち
      CSV
    end
  end

  # ---------- カスタマーサポート：発送の通知 ----------
  describe "#ship!" do
    it "発送済みにして、発送の通知をキューに入れる" do
      expect { order.ship!(tracking_number: "1234-5678-9012") }
        .to have_enqueued_mail(OrderMailer, :shipped).with(params: { order: }, args: [])
      expect(order.reload).to be_shipped
    end
  end

  describe "#shipped_message" do
    it "お支払い金額と問い合わせ番号を書く" do
      order.tracking_number = "1234-5678-9012"
      expect(order.shipped_message).to include("お支払い金額：3,300円", "お問い合わせ番号：1234-5678-9012")
    end
  end
end
`}
          />
          <h3>経理部の依頼で CSV の列を変える</h3>
          <p>
            ある月、経理部から次の依頼が届きました。「ポイントは会社が負担する販促費として、売上とは別に記録することになった。CSV の金額の列はポイントを引く前の金額（商品の合計 + 送料）にし、ポイント利用額の列を足してほしい」。
          </p>
          <p>
            依頼を受けた開発者は、CSV の金額の列が <code>order.total</code> から来ていることを確かめ、total からポイントを引く部分を消し、見出しと行に points_used を足しました。CSV のテストの期待値も依頼どおりに直しました。次は直す前と直した後のファイルの差分です。
          </p>
          <Code
            lang="text"
            title="経理部の依頼で変えた差分（git diff --no-index で比べた）"
            code={`
--- a/app/models/order.rb
+++ b/app/models/order.rb
-  CSV_HEADERS = %w[注文番号 注文日 顧客名 金額 状態].freeze
+  CSV_HEADERS = %w[注文番号 注文日 顧客名 金額 ポイント利用額 状態].freeze
 …（省略）
-        csv << [order.number, order.ordered_at.to_date.iso8601, order.customer_name, order.total, STATUS_LABELS.fetch(order.status)]
+        csv << [order.number, order.ordered_at.to_date.iso8601, order.customer_name, order.total, order.points_used, STATUS_LABELS.fetch(order.status)]
 …（省略）
-  # 注文の金額（商品の合計 + 送料 - ポイント）
-  def total = items.sum(&:amount) + shipping_fee - points_used
+  # 注文の金額（商品の合計 + 送料）。ポイントは CSV の別の列に出す
+  def total = items.sum(&:amount) + shipping_fee
--- a/spec/models/order_spec.rb
+++ b/spec/models/order_spec.rb
-        注文番号,注文日,顧客名,金額,状態
-        A-1001,2026-11-02,山田花子,3300,発送待ち
+        注文番号,注文日,顧客名,金額,ポイント利用額,状態
+        A-1001,2026-11-02,山田花子,3800,500,発送待ち
`}
          />
          <h3>テストを実行すると</h3>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec）"
            code={`
...F

Failures:

  1) Order#shipped_message お支払い金額と問い合わせ番号を書く
     Failure/Error: expect(order.shipped_message).to include("お支払い金額：3,300円", "お問い合わせ番号：1234-5678-9012")

       expected "山田花子 様\\n\\nご注文 A-1001 の商品を発送しました。\\nお支払い金額：3,800円\\nお問い合わせ番号：1234-5678-9012\\n" to include "お支払い金額：3,300円"
       Diff:
       @@ -1,2 +1,5 @@
       -お支払い金額：3,300円
       +山田花子 様
       +
       +ご注文 A-1001 の商品を発送しました。
       +お支払い金額：3,800円
        お問い合わせ番号：1234-5678-9012
     # ./spec/models/order_spec.rb:41:in 'block (3 levels) in <top (required)>'

Finished in 0.09465 seconds (files took 0.89404 seconds to load)
4 examples, 1 failure
`}
          />
          <p>
            直した CSV のテストは成功し、触っていない発送の通知のテストが失敗しました。山田さんが実際に支払ったのは 3,300円ですが、メールには 3,800円と書かれます。開発用の DB でもう一度メールの本文を表示すると、CSV は依頼どおりになり、メールの金額も変わっていました。
          </p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/demo.rb）"
            code={`
== 経理の CSV
注文番号,注文日,顧客名,金額,ポイント利用額,状態
A-1001,2026-11-02,山田花子,3800,500,発送待ち
== 発送の通知
山田花子 様

ご注文 A-1001 の商品を発送しました。
お支払い金額：3,800円
お問い合わせ番号：1234-5678-9012
`}
          />
          <p>
            このテストがなければ、ポイントを使ったお客様全員に、実際より高い金額を書いたメールが届きます。CS には「請求が多い」という問い合わせが届きますが、CS はメールの文面を変える依頼をしていないので、原因が経理部の依頼にあるとはすぐにわかりません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>
              total という1つのメソッドが、意味の違う2つの金額を表していました。1つは「お客様が支払う金額」（CS が説明に使う）、もう1つは「経理が売上として記録する金額」（経理部が決める）です。依頼が届くまでは2つがたまたま同じ式だったので、1つのメソッドで足りていました。
            </li>
            <li>経理部の依頼でコードを変えると、CS の機能の結果が変わります。依頼した経理部も、影響を受けた CS も、その変更を予想していません。</li>
            <li>order_spec.rb に3つの担当のテストが混ざっています。失敗したテストが誰の仕様を確かめているのかは、テストの名前とコメントを読まないとわかりません。</li>
            <li>経理部の依頼と CS の依頼が同じ時期に来ると、2人の開発者が order.rb の近い行を同時に書き換え、マージ（2人の変更を1つにまとめる作業）で衝突しやすくなります。</li>
            <li>Order を読む人は注文の保存の規則を確かめたいだけでも、CSV の列やメールの文面のコードを読み飛ばす必要があります。</li>
          </ul>
          <p>
            図 61-2 は Order のどこに、誰から、どんな理由で変更が届くかを並べたものです。経理部・CS・開発チームの3つの担当から変更が届き、total には経理部と CS の両方から届いています。これらの問題は、変更を求める人が違うコードを1つのクラスに書き、さらに1つのメソッドを共有したことから起きています。
          </p>
          <Figure n="61-2" title="変更を求める人と変更の理由" caption="変更の理由は例。強調した total には、2つの担当からの変更が届く。">
            <ActorsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '変更する理由を1つにする：単一責任の原則の意味と由来',
      body: (
        <>
          <h3>定義</h3>
          <p>
            <Term en="Single Responsibility Principle、SRP">単一責任の原則</Term>は、モジュールが変更される理由を1つに絞るという原則です。ここでのモジュールはクラス、モジュール、ファイルのように、まとめて書き換えたりテストしたりするコードの単位を指します。Rails のアプリでは、多くの場合1つのクラスとそのファイルが1つのモジュールに当たります。
          </p>
          <p>
            この章の Order には、経理部の依頼、CS の依頼、開発チームの判断という3つの変更の理由がありました。SRP に沿うなら、経理部の依頼で変わるコードは経理部の依頼でしか変わらない場所に、CS の依頼で変わるコードは CS の依頼でしか変わらない場所に置きます。そうすれば、経理部の依頼でコードを変えても、CS の機能の結果は変わりません。
          </p>
          <h3>提唱者と最初の資料</h3>
          <p>
            SRP をこの名前でまとめたのは Robert C. Martin です。Martin は2014年のブログ記事で、1990年代後半にそれまでの考え方を1つの原則にまとめ、単一責任の原則と名付けたと書いています<Ref n={1} />。2002年の著書『Agile Software Development, Principles, Patterns, and Practices』では、第8章を「SRP: The Single-Responsibility Principle」にあてています<Ref n={2} />。なお Martin は同じ記事で、この名前を Bertrand Meyer から借りたような気がするが確かめられていない、とも書いています<Ref n={1} />。
          </p>
          <p>
            2014年の記事は SRP を「それぞれのソフトウェアのモジュールが変更される理由は、ただ1つであるべきだ」と述べたうえで、では「変更の理由」とは何かを問い直しています<Ref n={1} />。バグの修正やリファクタリングは変更の理由に入るのか、という疑問に対して、Martin は、それらはプログラムではなくプログラマーの責任であり、プログラムが応えるべき相手は誰かを考えるべきだと答えます。そして「この原則は人についての原則である」とまとめています<Ref n={1} />。
          </p>
          <p>
            記事の例は Java の Employee クラスです<Ref n={1} />。このクラスには、給与を計算する calculatePay、データベースに保存する save、監査の担当が使う勤務時間の報告を作る reportHours の3つのメソッドがあります。給与の計算の仕様を決めるのは財務の責任者（CFO）の組織、報告の形式を決めるのは業務の責任者（COO）の組織、保存の仕組みを決めるのは技術の責任者（CTO）の組織です。Martin は、モジュールへの変更の依頼が、1つの業務を受け持つ1人の人、あるいは密接に結びついた1つの集団からだけ来るように設計したい、と書いています。CTO の依頼で変えたコードが原因で COO の仕事が壊れるような事態を避けるためです。
          </p>
          <p>
            同じ記事は SRP を次のようにも言い換えています<Ref n={1} />。
          </p>
          <ul>
            <li>同じ理由で変わる物を集める。違う理由で変わる物を分ける。</li>
          </ul>
          <p>
            Martin は、この言い換えが凝集（同じ理由で変わる物どうしのまとまり）を高め、結合（違う理由で変わる物どうしのつながり）を低くすることの別の言い方だと説明しています<Ref n={1} />。
          </p>
          <h3>Martin の例と、この章の例の対応</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">変更を求める人</th>
                  <th scope="col">Martin の Employee</th>
                  <th scope="col">この章の Order</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">お金の扱いを決める担当</th>
                  <td>CFO の組織：calculatePay</td>
                  <td>経理部：accounting_csv と CSV_HEADERS</td>
                </tr>
                <tr>
                  <th scope="row">外部への報告・連絡を決める担当</th>
                  <td>COO の組織：reportHours</td>
                  <td>CS：shipped_message（発送のメール）</td>
                </tr>
                <tr>
                  <th scope="row">保存の仕組みを決める担当</th>
                  <td>CTO の組織：save</td>
                  <td>開発チーム：validates・enum・has_many</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Martin は2017年の著書『Clean Architecture』の第7章で、SRP に反したときの症状として「偶然の重複（Accidental Duplication）」と「マージ（Merges）」の2つの節を立てています<Ref n={3} />。この章の total は、経理部が決める金額とお客様が支払う金額という別の知識が、ある時点でたまたま同じ式だったために1つのメソッドになったものです。もう1つの症状のマージは、前の節の「2人の開発者が order.rb の近い行を同時に書き換える」問題に当たります。
          </p>
          <h3>背景にある考え方</h3>
          <p>
            Martin は2014年の記事で、SRP のもとになった考え方として次の3つを挙げています<Ref n={1} />。図 61-3 はそれらと SRP の資料を年の順に並べたものです。
          </p>
          <ul>
            <li>
              David Parnas の1972年の論文「On the Criteria To Be Used in Decomposing Systems into Modules」：処理の流れの順にモジュールを分けるのではなく、難しい設計判断や変わりやすい設計判断を並べ、それぞれを1つのモジュールに隠すように分けることを提案しました<Ref n={4} />。この考え方は<ChapterLink n={73} />（Information Hiding）で扱います。
            </li>
            <li>
              Edsger Dijkstra の1974年の文書 EWD447「On the role of scientific thought」：プログラムの正しさ、効率、そもそも必要かといった側面を、1つずつ切り離して考えることを「関心の分離（the separation of concerns）」と呼びました<Ref n={5} />。<ChapterLink n={68} />（SoC）で扱います。
            </li>
            <li>Larry Constantine らの結合と凝集：モジュールの中のまとまりの強さと、モジュールどうしのつながりの強さで設計を評価する考え方です。<ChapterLink n={69} />（High Cohesion）と<ChapterLink n={70} />（Low Coupling）で扱います。</li>
          </ul>
          <Figure n="61-3" title="SRP の背景にある考え方の流れ" caption="Martin の2014年のブログ記事が挙げる考え方と、SRP を示した Martin の資料。強調した箱が SRP の名前で示された最初の書籍。">
            <HistoryFigure />
          </Figure>
          <h3>「1つのことだけをする」との違い</h3>
          <p>
            SRP は「1つのクラスは1つのことだけをする」と説明されることがありますが、Martin の説明に沿うと、数えるのは処理の種類ではなく、変更を求める人の数です。この章の AccountingCsv には、見出しを作る、日付を整える、金額を計算する、状態を日本語にする、という複数の処理がありますが、どれも経理部の依頼でしか変わらないので、変更の理由は1つです。反対に、直す前の total は1行のメソッドでしたが、経理部と CS の2つの担当から変更が届くので、SRP に反していました。「1つのことだけをする」を目安にクラスを分けると何が起きるかは、「当てはめすぎたとき」の節で実行して確かめます。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を基準に分ける・まとめるか</th>
                  <th scope="col">この章の例での見え方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">SRP</th>
                  <td>変更を求める人（変更の理由）</td>
                  <td>経理部・CS・開発チームごとにクラスを分ける</td>
                </tr>
                <tr>
                  <th scope="row">
                    SoC（<ChapterLink n={68} />）
                  </th>
                  <td>関心事（表示・入力の検証・権限・保存など）</td>
                  <td>CSV の形式・メールの文面・保存の規則を別の層に置く。分けた結果は SRP と重なることが多い</td>
                </tr>
                <tr>
                  <th scope="row">
                    High Cohesion（<ChapterLink n={69} />）
                  </th>
                  <td>関係の強い処理とデータを同じ場所に集める</td>
                  <td>CSV の見出しと行の並びを AccountingCsv に集める</td>
                </tr>
                <tr>
                  <th scope="row">
                    DRY（<ChapterLink n={59} />）
                  </th>
                  <td>同じ知識を1か所に置く</td>
                  <td>「お客様の支払額」と「経理の売上額」は別の知識なので、式が同じでも1つにしない</td>
                </tr>
                <tr>
                  <th scope="row">
                    Information Hiding（<ChapterLink n={73} />）
                  </th>
                  <td>変わりやすい設計判断を隠す</td>
                  <td>売上額の定義を AccountingCsv の private メソッドに隠す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            DRY との関係には注意が必要です。直す前の total は、同じ式を2回書かないという点では DRY に沿って見えます。しかし DRY が1か所にまとめるように求めるのは同じ知識であり、式の見た目が同じことではありません。経理部の売上額とお客様の支払額は、決める人も変わるきっかけも違う2つの知識なので、1つのメソッドにまとめると SRP に反します。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '変更を求める人ごとにクラスとテストを分ける',
      body: (
        <>
          <p>直す前のコードを、次の6つの手順で直します。どの手順の後でもテストを実行し、出力が変わっていないことを確かめます。</p>
          <ol>
            <li>今の出力をテストで固定する</li>
            <li>メソッドを、変更を求める人ごとに分類する</li>
            <li>共有している計算に、意味ごとの名前を付ける</li>
            <li>CSV を AccountingCsv に移す</li>
            <li>通知の文面をメーラーのテンプレートに移す</li>
            <li>テストを担当ごとのファイルに分ける</li>
          </ol>
          <p>経理部の依頼は6つの手順を終えてから当てはめます。構造を変える作業と、振る舞いを変える作業を同時に行わないためです。</p>
          <h3>手順1：今の出力をテストで固定する</h3>
          <p>
            直す前の order_spec.rb には、CSV の文字列全体と、メールの本文のお支払い金額を確かめるテストがあります。どちらも直した後に同じ出力になったかを確かめるために使います。CSV は会計ソフトが読み取るので、見出しの文字、列の順、金額の書き方（カンマを入れない）まで含めて、文字列全体を比べています。
          </p>
          <h3>手順2：メソッドを、変更を求める人ごとに分類する</h3>
          <p>Order のメソッドと定数を1つずつ見て、それを変えるように依頼するのは誰かを書き出します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">メソッド・定数</th>
                  <th scope="col">変更を求める人</th>
                  <th scope="col">移す先</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>accounting_csv</code>・<code>CSV_HEADERS</code>・<code>STATUS_LABELS</code>
                  </td>
                  <td>経理部</td>
                  <td>新しいクラス AccountingCsv</td>
                </tr>
                <tr>
                  <td>
                    <code>shipped_message</code>
                  </td>
                  <td>CS</td>
                  <td>メーラーのテンプレート（shipped.text.erb）</td>
                </tr>
                <tr>
                  <td>
                    <code>ship!</code>
                  </td>
                  <td>開発チーム（発送の手順）</td>
                  <td>Order に残す</td>
                </tr>
                <tr>
                  <td>
                    <code>has_many</code>・<code>enum</code>・<code>validates</code>
                  </td>
                  <td>開発チーム</td>
                  <td>Order に残す</td>
                </tr>
                <tr>
                  <td>
                    <code>total</code>
                  </td>
                  <td>経理部と CS の両方</td>
                  <td>意味ごとに分ける（手順3）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            2つ以上の担当が使うメソッドが見つかったら、それが本当に1つの知識かを確かめます。消費税率のように法律で決まり、全員が同じ値を使うものなら共有してかまいません。total のように、担当ごとに定義が違いうるものは分けます。
          </p>
          <h3>手順3：共有している計算に、意味ごとの名前を付ける</h3>
          <p>
            total を、何の金額かがわかる名前に変えます。お客様が支払う金額は、注文そのものについての事実で、メール、領収書、管理画面など複数の場所が同じ値を使います。そこで Order に <code>payment_amount</code> として残します。商品の合計は売上額の計算にも使うので、<code>items_total</code> として取り出します。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後）"
            code={`
class Order < ApplicationRecord
  has_many :items, class_name: "OrderItem", dependent: :destroy

  enum :status, { pending: "pending", shipped: "shipped" }
  validates :number, :customer_name, :email, :ordered_at, presence: true

  # 商品の合計（円）
  def items_total = items.sum(&:amount)

  # お客様が支払う金額（商品の合計 + 送料 - ポイント）
  def payment_amount = items_total + shipping_fee - points_used

  def ship!(tracking_number:)
    update!(status: "shipped", tracking_number:, shipped_at: Time.current)
    OrderMailer.with(order: self).shipped.deliver_later
  end
end
`}
          />
          <p>
            この時点では経理部の CSV の金額もお客様の支払額と同じなので、CSV も payment_amount を使います。名前を変えただけなので出力は変わりません。売上額を別に計算するのは、経理部の依頼を当てはめるときです。<code>items.sum(&amp;:amount)</code> のようにブロックを渡した sum は、SQL の SUM ではなく、明細を読み込んでから Ruby で足し合わせます<Ref n={10} />。
          </p>
          <h3>手順4：CSV を AccountingCsv に移す</h3>
          <Code
            lang="ruby"
            title="app/models/accounting_csv.rb"
            code={`
require "csv"

# 経理部が毎月、会計ソフトに取り込む注文の CSV。列と金額の定義は経理部が決める
class AccountingCsv
  HEADERS = %w[注文番号 注文日 顧客名 金額 状態].freeze
  STATUS_LABELS = { "pending" => "発送待ち", "shipped" => "発送済み" }.freeze

  def initialize(orders)
    @orders = orders
  end

  def generate
    CSV.generate do |csv|
      csv << HEADERS
      @orders.each { |order| csv << row(order) }
    end
  end

  private

  def row(order)
    [order.number, order.ordered_at.to_date.iso8601, order.customer_name, order.payment_amount, STATUS_LABELS.fetch(order.status)]
  end
end
`}
          />
          <p>
            AccountingCsv は Active Record を継承しない普通の Ruby のクラスです。DB のテーブルを持ちませんが、注文のデータを扱う業務のコードなので app/models に置きました。Rails は app の下のディレクトリ（assets・javascript・views を除く）を自動で読み込む対象にするので、app/exports のようなディレクトリを作って置くこともできます<Ref n={8} />。状態の日本語の表記 STATUS_LABELS も、CSV に出す値として経理部が決めるので、AccountingCsv に移しました。
          </p>
          <p>
            呼び出す側は <code>Order.accounting_csv(orders)</code> を <code>AccountingCsv.new(orders).generate</code> に書き換えます。この例では指定した月の CSV を出力する rake タスクから呼びます。注文ごとに明細を読むので、<code>includes(:items)</code> で明細をまとめて読み込みます（N+1 クエリを避ける方法は<ChapterLink n={13} section="n-plus-one" />で説明しました）。
          </p>
          <Code
            lang="ruby"
            title="lib/tasks/accounting.rake"
            code={`
namespace :accounting do
  desc "指定した月の注文を経理の CSV で出力する（例：bin/rails 'accounting:export[2026-11]'）"
  task :export, [:month] => :environment do |_task, args|
    month = Time.zone.parse("#{args.fetch(:month)}-01").all_month
    orders = Order.includes(:items).where(ordered_at: month).order(:ordered_at)
    puts AccountingCsv.new(orders).generate
  end
end
`}
          />
          <p>開発用の DB に11月の注文を3件入れて、タスクを実行しました。</p>
          <Code
            lang="text"
            title={"実行結果（RAILS_ENV=development bin/rails 'accounting:export[2026-11]'）"}
            code={`
注文番号,注文日,顧客名,金額,状態
A-1001,2026-11-02,山田花子,3300,発送待ち
A-1002,2026-11-05,佐藤次郎,8800,発送済み
A-1003,2026-11-09,鈴木一郎,1100,発送待ち
`}
          />
          <h3>手順5：通知の文面をメーラーのテンプレートに移す</h3>
          <Code
            lang="erb"
            title="app/views/order_mailer/shipped.text.erb"
            code={`
<%= @order.customer_name %> 様

ご注文 <%= @order.number %> の商品を発送しました。
お支払い金額：<%= @order.payment_amount.to_fs(:delimited) %>円
お問い合わせ番号：<%= @order.tracking_number %>
`}
          />
          <p>
            Action Mailer ではメーラーのアクションごとに app/views/〈メーラー名〉/ の下にテンプレートを置き、本文をそこに書きます<Ref n={7} />。テキストのメールは .text.erb、HTML のメールは .html.erb です。文面は CS の依頼で変わるので、Order の shipped_message をやめて、テンプレートに直接書きました。CS から「お問い合わせ番号の前に配送業者の名前を書きたい」と依頼されたときに直すのは、このテンプレートとメーラーのテストだけです。OrderMailer のクラスは直す前と同じです。
          </p>
          <p>
            Order の ship! には、<code>OrderMailer.with(order: self).shipped.deliver_later</code> の1行が残っています。この1行が表しているのは「発送したらお客様に知らせる」という発送の手順で、文面ではありません。文面を変えても order.rb は変わりません。通知の手段が増えたり、発送の手順に別の処理が加わったりしたときの置き場所は、「Rails の機能・規約との関係」の節で扱います。
          </p>
          <h3>手順6：テストを担当ごとのファイルに分ける</h3>
          <p>3つの spec が同じ注文を使うので、注文を作るメソッドを spec/support に置き、テストは担当ごとのファイルに分けます。</p>
          <Code
            lang="ruby"
            title="spec/support/orders.rb"
            code={`
# 3つの spec で使う注文（商品 3,200円 + 送料 600円 - ポイント 500 = 3,300円）
module OrderExamples
  def create_order(**attrs)
    Order.create!(number: "A-1001", customer_name: "山田花子", email: "hanako@example.com",
                  ordered_at: Time.zone.local(2026, 11, 2, 10, 0), shipping_fee: 600, points_used: 500, **attrs).tap do |o|
      o.items.create!(product_name: "Tシャツ", unit_price: 2000, quantity: 1)
      o.items.create!(product_name: "マグカップ", unit_price: 1200, quantity: 1)
    end
  end
end

RSpec.configure { |config| config.include OrderExamples }
`}
          />
          <Code
            lang="ruby"
            title="spec/models/accounting_csv_spec.rb・spec/mailers/order_mailer_spec.rb・spec/models/order_spec.rb"
            code={`
# spec/models/accounting_csv_spec.rb（経理部）
RSpec.describe AccountingCsv do
  it "経理の列の順に1行ずつ出力する" do
    expect(AccountingCsv.new([create_order]).generate).to eq <<~CSV
      注文番号,注文日,顧客名,金額,状態
      A-1001,2026-11-02,山田花子,3300,発送待ち
    CSV
  end
end

# spec/mailers/order_mailer_spec.rb（CS）
RSpec.describe OrderMailer, type: :mailer do
  it "発送の通知に、お支払い金額と問い合わせ番号を書く" do
    mail = OrderMailer.with(order: create_order(tracking_number: "1234-5678-9012")).shipped
    expect(mail.subject).to eq "ご注文 A-1001 の商品を発送しました"
    expect(mail.body.to_s).to include("お支払い金額：3,300円", "お問い合わせ番号：1234-5678-9012")
  end
end

# spec/models/order_spec.rb（開発チーム）
RSpec.describe Order do
  include ActiveJob::TestHelper

  it "注文番号がなければ保存しない" do
    expect(Order.new(customer_name: "山田花子", email: "hanako@example.com", ordered_at: Time.current)).not_to be_valid
  end

  it "お客様が支払う金額は、商品の合計 + 送料 - ポイント" do
    expect(create_order.payment_amount).to eq 3300
  end

  describe "#ship!" do
    it "発送済みにして、発送の通知をキューに入れる" do
      order = create_order
      expect { order.ship!(tracking_number: "1234-5678-9012") }
        .to have_enqueued_mail(OrderMailer, :shipped).with(params: { order: }, args: [])
      expect(order.reload).to be_shipped
    end
  end
end
# 各ファイルの先頭の require "rails_helper" と require_relative "../support/orders" は省略
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
OrderMailer
  発送の通知に、お支払い金額と問い合わせ番号を書く

AccountingCsv
  経理の列の順に1行ずつ出力する

Order
  注文番号がなければ保存しない
  お客様が支払う金額は、商品の合計 + 送料 - ポイント
  #ship!
    発送済みにして、発送の通知をキューに入れる

Finished in 0.11623 seconds (files took 1.04 seconds to load)
5 examples, 0 failures
`}
          />
          <p>
            CSV の文字列も、メールのお支払い金額も、直す前と同じ値で成功しました。図 61-4 は分ける前と分けた後のクラスの比較です。分けた後は、クラスにもテストのファイルにも、変更を求める担当が1つずつ対応しています。AccountingCsv とメールのテンプレートは Order の値を読みますが、Order は AccountingCsv を知りません。
          </p>
          <Figure n="61-4" title="分ける前と分けた後のクラス" caption="括弧の中は変更を求める担当。破線の矢印は値を読むこと、実線の矢印は呼び出しを表す。">
            <BeforeAfterFigure />
          </Figure>
          <h3>経理部の依頼をもう一度当てはめる</h3>
          <p>
            分けた後のコードに、同じ依頼（金額の列をポイントを引く前の金額にし、ポイント利用額の列を足す）を当てはめます。売上額の定義は経理部が決めるものなので、AccountingCsv の private メソッド <code>sales_amount</code> として書きます。
          </p>
          <Code
            lang="text"
            title="経理部の依頼で変えた差分（git diff --no-index で比べた）"
            code={`
--- a/app/models/accounting_csv.rb
+++ b/app/models/accounting_csv.rb
-  HEADERS = %w[注文番号 注文日 顧客名 金額 状態].freeze
+  HEADERS = %w[注文番号 注文日 顧客名 金額 ポイント利用額 状態].freeze
 …（省略）
   def row(order)
-    [order.number, order.ordered_at.to_date.iso8601, order.customer_name, order.payment_amount, STATUS_LABELS.fetch(order.status)]
+    [order.number, order.ordered_at.to_date.iso8601, order.customer_name,
+     sales_amount(order), order.points_used, STATUS_LABELS.fetch(order.status)]
   end
+
+  # 経理が計上する売上（商品の合計 + 送料）。ポイントは販促費として別の列に出す
+  def sales_amount(order) = order.items_total + order.shipping_fee
 end
--- a/spec/models/accounting_csv_spec.rb
+++ b/spec/models/accounting_csv_spec.rb
-      注文番号,注文日,顧客名,金額,状態
-      A-1001,2026-11-02,山田花子,3300,発送待ち
+      注文番号,注文日,顧客名,金額,ポイント利用額,状態
+      A-1001,2026-11-02,山田花子,3800,500,発送待ち
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec と、変えたファイルの一覧）"
            code={`
.....

Finished in 0.11558 seconds (files took 0.88046 seconds to load)
5 examples, 0 failures

$ git diff --no-index --stat after after_change
 {after => after_change}/app/models/accounting_csv.rb       | 8 ++++++--
 {after => after_change}/spec/models/accounting_csv_spec.rb | 4 ++--
 2 files changed, 8 insertions(+), 4 deletions(-)
`}
          />
          <Code
            lang="text"
            title={"実行結果（RAILS_ENV=development bin/rails 'accounting:export[2026-11]'）"}
            code={`
注文番号,注文日,顧客名,金額,ポイント利用額,状態
A-1001,2026-11-02,山田花子,3800,500,発送待ち
A-1002,2026-11-05,佐藤次郎,8800,0,発送済み
A-1003,2026-11-09,鈴木一郎,2100,1000,発送待ち
`}
          />
          <p>
            変えたのは AccountingCsv とそのテストの2つのファイルだけで、5件のテストがすべて成功しました。メーラーのテストは今回も 3,300円で成功しているので、お客様へのメールは変わっていません。図 61-5 は、同じ依頼が直す前と直した後でどこまで及んだかを比べたものです。
          </p>
          <Figure n="61-5" title="経理部の依頼が及ぶ範囲" caption="破線の箱は依頼の影響を受けなかった機能。">
            <ImpactFigure />
          </Figure>
          <p>
            変えたファイルの数は直す前も直した後も2つです。違うのは、直す前は経理部の依頼で CS の機能の結果が変わり、直した後は変わらないことです。SRP で減らすのは変更の手間そのものよりも、依頼していない機能が変わることと、それを確かめる手間です。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '当てはめすぎたとき：同じ担当の変更が多くのファイルに散らばる',
      body: (
        <>
          <h3>「1つのことだけをする」クラスに分けたコード</h3>
          <p>
            SRP を「1つのクラスは1つのことだけをする」と読むと、AccountingCsv もさらに分けたくなります。次のコードは、見出し、行の組み立て、金額、日付、状態の表記を、それぞれ別のクラスにしたものです。テストもクラスごとに作りました。
          </p>
          <Code
            lang="ruby"
            title="app/models/accounting_csv.rb と app/models/accounting_csv/ の5つのファイル（分けすぎた例）"
            code={`
# app/models/accounting_csv.rb
class AccountingCsv
  def initialize(orders, header: Header.new, row_builder: RowBuilder.new)
    @orders = orders
    @header = header
    @row_builder = row_builder
  end

  def generate
    CSV.generate do |csv|
      csv << @header.columns
      @orders.each { |order| csv << @row_builder.build(order) }
    end
  end
end

# app/models/accounting_csv/header.rb
class AccountingCsv::Header
  def columns = %w[注文番号 注文日 顧客名 金額 状態]
end

# app/models/accounting_csv/row_builder.rb
class AccountingCsv::RowBuilder
  def initialize(amount: AccountingCsv::AmountCalculator.new, date: AccountingCsv::DateFormatter.new,
                 status: AccountingCsv::StatusFormatter.new)
    @amount = amount
    @date = date
    @status = status
  end

  def build(order)
    [order.number, @date.format(order.ordered_at), order.customer_name, @amount.amount(order), @status.format(order.status)]
  end
end

# app/models/accounting_csv/amount_calculator.rb
class AccountingCsv::AmountCalculator
  def amount(order) = order.payment_amount
end

# app/models/accounting_csv/date_formatter.rb
class AccountingCsv::DateFormatter
  def format(time) = time.to_date.iso8601
end

# app/models/accounting_csv/status_formatter.rb
class AccountingCsv::StatusFormatter
  LABELS = { "pending" => "発送待ち", "shipped" => "発送済み" }.freeze

  def format(status) = LABELS.fetch(status)
end
`}
          />
          <p>どのクラスも数行で、1つのことだけをしています。このコードに、経理部の同じ依頼を当てはめました。</p>
          <Code
            lang="text"
            title="実行結果（依頼を当てはめた後の bundle exec rspec と、変えたファイルの一覧）"
            code={`
...........

Finished in 0.13545 seconds (files took 0.81826 seconds to load)
11 examples, 0 failures

$ git diff --no-index --stat overuse overuse_change
 {overuse => overuse_change}/app/models/accounting_csv/amount_calculator.rb       | 4 +++-
 {overuse => overuse_change}/app/models/accounting_csv/header.rb                  | 2 +-
 {overuse => overuse_change}/app/models/accounting_csv/row_builder.rb             | 2 +-
 {overuse => overuse_change}/spec/models/accounting_csv/amount_calculator_spec.rb | 3 ++-
 {overuse => overuse_change}/spec/models/accounting_csv/header_spec.rb            | 2 +-
 {overuse => overuse_change}/spec/models/accounting_csv/row_builder_spec.rb       | 2 +-
 {overuse => overuse_change}/spec/models/accounting_csv_spec.rb                   | 4 ++--
 7 files changed, 11 insertions(+), 8 deletions(-)
`}
          />
          <p>
            テストは成功しましたが、1つの依頼で7つのファイルを変えました。分けた後のコードでは2つでした。列を1つ足すという依頼は、見出しと行の並びと金額の定義を同時に変えます。どれも経理部の依頼でしか変わらないので、分けても依頼のたびに全部を開くことになります。ほかにも次の費用がかかります。
          </p>
          <ul>
            <li>CSV の列が何で、どの順に並ぶかを知るには、6つのファイルを順に読む必要があります。直した後の AccountingCsv なら、1つのファイルの HEADERS と row を並べて読めば確かめられます。</li>
            <li>
              initialize の <code>header:</code> や <code>amount:</code> の引数は、差し替える場面がないまま用意されています。将来に備えた引数の費用は<ChapterLink n={58} />（YAGNI）で扱います。
            </li>
            <li>
              AmountCalculator という名前からは、それが経理の売上額であることがわかりません。発送のメールを書く開発者が「金額の計算ならこのクラスを使おう」と考えて呼び出すと、直す前の total と同じく、2つの担当が1つの計算を共有する状態に戻ります。
            </li>
          </ul>
          <p>
            この分け方は、変更を求める人ではなく処理の種類で分けています。Martin の説明に沿えば、変更の理由が1つの経理部だけである以上、AccountingCsv を1つのクラスにしておくことは SRP に反していません。
          </p>
          <h3>もう1つの当てはめすぎ：保存と業務の規則を別のクラスにする</h3>
          <p>
            Martin の Employee の例では、保存の save も1つの担当（CTO）の責任として、給与の計算と分けています。これをそのまま Rails に当てはめると、Order を「データを持つだけのクラス」と「保存を受け持つクラス（リポジトリ）」に分けたくなります。しかし Active Record は、DB とのやり取りと業務の規則を1つのクラスにまとめる設計で、バリデーション・関連・スコープ・コールバックはその前提で動きます。分けるとこれらを使えなくなるか、同じ規則を2か所に書くことになります。Rails の設計思想がこの組み合わせをどう扱っているかは、次の節で原文を引いて説明します。リポジトリを使う場面は<ChapterLink n={44} section="repository" />で、Active Record がまとめて保存する仕組みは<ChapterLink n={48} section="active-record" />で扱います。
          </p>
          <h3>分けるかどうかの目安</h3>
          <p>
            図 61-6 は、分けるかどうかを2つの軸で判断する目安です。横軸は変更を求める人が同じか違うか、縦軸はそれらが一緒に変わるか別々に変わるかです。
          </p>
          <Figure n="61-6" title="分けるかどうかの判断" caption="模式図。強調した箱は、この章のコードが当てはまる位置。">
            <JudgeFigure />
          </Figure>
          <ul>
            <li>右上（違う人・別々に変わる）：別のクラスに分けます。この章の経理の CSV と発送の通知がこれに当たり、直す前の total がこの位置にあったことが問題でした。</li>
            <li>左下（同じ人・一緒に変わる）：1つのクラスにまとめておきます。CSV の見出しと行の並びがこれに当たります。6つのクラスに分けた例は、ここを分けすぎたものです。</li>
            <li>左上（同じ人・別々に変わる）：クラスは分けずに、private メソッドに名前を付けて分けます。CSV の日付の形式と売上額の計算は、どちらも経理部が決めますが、別々の依頼で変わります。</li>
            <li>右下（違う人・一緒に変わる）：今は共有してかまいません。消費税率は経理部も CS も使いますが、法律で決まり、変わるときは全員の分が同時に変わります。担当ごとに扱いが違ってきた時点で分けます。</li>
          </ul>
          <p>迷ったときは、次の3つを確かめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">確かめること</th>
                  <th scope="col">分ける方向の答え</th>
                  <th scope="col">まとめる方向の答え</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>このコードを変えるように依頼するのは誰か</td>
                  <td>メソッドごとに依頼する担当が違う</td>
                  <td>全部同じ担当が依頼する</td>
                </tr>
                <tr>
                  <td>ある担当の依頼で、ほかの担当の機能のテストが落ちたことがあるか</td>
                  <td>ある（この章の total）</td>
                  <td>ない</td>
                </tr>
                <tr>
                  <td>1つの依頼で、いくつのファイルを直すか</td>
                  <td>1つのファイルの中で、関係のない部分まで読む必要がある</td>
                  <td>分けた結果、1つの依頼で多くのファイルを直している</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            まだ変更を求める人が1つしかないコードを、将来の担当を想像して先に分ける必要はありません。直す前の Order も、最初は開発チームだけが変えるクラスでした。経理部の CSV が加わった時点、または2つの担当の依頼が同じメソッドに届いた時点が、分けるかどうかを考える時期です。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能・規約との関係',
      body: (
        <>
          <h3>Rails の置き場所と変わるきっかけ</h3>
          <p>
            Rails の新しいアプリには、app/controllers・app/models・app/views・app/mailers・app/jobs のようにディレクトリが最初から用意されています。図 61-7 は、それぞれの置き場所に何を書き、どんなきっかけで変わるかを並べたものです。置き場所ごとに、変更を求める人もおおむね分かれています。この章で文面をメーラーのテンプレートに移したのは、Rails がすでに用意している「メールの文面の置き場所」を使ったということです。
          </p>
          <Figure n="61-7" title="Rails の置き場所と変わるきっかけ" caption="変更を求める人は例。組織によって担当の分け方は違う。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">置き場所</th>
                    <th scope="col">書くもの</th>
                    <th scope="col">変わるきっかけ（変更を求める人の例）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>app/controllers</td>
                    <td>HTTP の入力の受け取りと応答</td>
                    <td>画面の流れや API の仕様（画面の担当・API の利用者）</td>
                  </tr>
                  <tr>
                    <td>app/views・app/helpers</td>
                    <td>画面の表示</td>
                    <td>デザインや文言（デザイナー・CS）</td>
                  </tr>
                  <tr>
                    <td>app/mailers と app/views/〈メーラー名〉</td>
                    <td>メールの宛先・件名・本文</td>
                    <td>文面や送る相手（CS・マーケティング）</td>
                  </tr>
                  <tr>
                    <td>app/models（Active Record）</td>
                    <td>業務の規則と保存</td>
                    <td>業務の決まりやテーブルの設計（業務の担当・開発チーム）</td>
                  </tr>
                  <tr>
                    <td>app/jobs</td>
                    <td>後で実行する処理と、失敗したときの再試行</td>
                    <td>実行の時期や失敗の扱い（運用・開発チーム）</td>
                  </tr>
                  <tr>
                    <td>app の下の普通のクラス（この章の AccountingCsv）</td>
                    <td>特定の担当のための形式や計算</td>
                    <td>その担当の依頼（経理部）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>Active Record は、保存と業務の規則を1つのクラスにまとめる</h3>
          <p>
            Rails Doctrine（Rails の設計思想をまとめた文書）の「No one paradigm（1つのパラダイムにこだわらない）」の節は、Active Record がデータベースとのやり取りと業務の規則を混ぜていることに触れ、それが純粋さを求める人の反発を招くことを認めたうえで、データベースに状態を保存する Web アプリでは実用的な方法だったと書いています<Ref n={6} />。同じ節は、モデルを、名前を選び、凝集を高め、結合を低くするオブジェクト指向の設計を行う層として扱うとも書いています<Ref n={6} />。
          </p>
          <p>
            Rails で SRP を当てはめるときは、この前提に沿って、保存と業務の規則を分けることよりも、この章の CSV やメールの文面のように、特定の担当のための形式をモデルの外に出すことを先に考えます。直した後の Order には保存の規則と payment_amount と ship! が残っていますが、どれも開発チームと業務の担当が決める、注文そのものの規則です。
          </p>
          <h3>Concern はファイルを分けるが、クラスは分けない</h3>
          <p>
            Concern（<code>ActiveSupport::Concern</code> を使ったモジュール）を使えば、CSV のコードを <code>app/models/concerns/order/accounting_export.rb</code> のような別のファイルに移せます。Rails Doctrine の「Provide sharp knives（よく切れる道具を渡す）」の節は、Concern を、1つのクラスが「関係はあるが別々に理解できる複数の関心事」を持てるようにする仕組みだと説明しています<Ref n={6} />。
          </p>
          <p>
            ただし、Concern に移したメソッドは Order のメソッドのままです。total のように2つの担当が共有するメソッドは共有されたままで、テストも Order に対して書きます。ファイルは分かれても、経理部の依頼で Order が変わり、CS の機能が変わるという関係は残ります。Concern が向いているのは、Order 自身の規則（たとえば注文の公開や取り消しの規則）を読みやすく分ける使い方です。使い分けは<ChapterLink n={31} section="concern" />で扱いました。
          </p>
          <h3>メールを送る場所</h3>
          <p>
            Action Mailer のガイドの例は、コントローラーで利用者を保存した直後に <code>UserMailer.with(user: @user).welcome_email.deliver_later</code> を呼んでいます<Ref n={7} />。この章では ship! の中から呼びましたが、発送したときの処理が増えたら（SMS も送る、倉庫のシステムに知らせるなど）、それらを並べる場所を ship! の外に作ります。コントローラーにまとめる方法と、手順を1つのクラスにする方法（<ChapterLink n={44} />の Use Case）があります。
          </p>
          <p>
            after_save や after_commit のコールバックで送る方法もありますが、データを直すために保存しただけでもメールが送られる、という問題が起きやすくなります。この問題は<ChapterLink n={62} />（Explicit over Implicit）で、コールバックに置く処理の選び方は<ChapterLink n={30} section="callback-design" />で扱います。
          </p>
          <Callout kind="note" title="Ruby 3.4 以降で csv を使うとき">
            <p>
              csv は Ruby 3.3 までは標準で使えるライブラリ（default gem）でしたが、Ruby 3.4 で bundled gem に変わりました<Ref n={9} />。Bundler を使う Rails のアプリでは、Gemfile に <code>gem "csv"</code> を書かないと <code>require "csv"</code> が LoadError になります。この章の検証環境（Ruby 4.0.9）で Gemfile に書かずに実行すると、「csv used to be loaded from the standard library, but is not part of the default gems since Ruby 3.4.0.」という警告の後に <code>cannot load such file -- csv (LoadError)</code> が出ました。Ruby 3.3 以前の Rails 7.x のアプリでは書かなくても動くので、Ruby を上げるときに気づくことが多い点です。
            </p>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={30} section="design-basics" />：責務と変更理由の考え方を、注文の取り消しの例で説明しています。大きくなったモデルの評価は<ChapterLink n={30} section="fat-model" />で扱いました。
            </li>
            <li>
              <ChapterLink n={33} section="service-contract" />：モデルの外に普通の Ruby のクラスを作る時期と、戻り値の決め方を扱っています。
            </li>
            <li>
              <ChapterLink n={59} />（DRY）と<ChapterLink n={76} />（AHA）：見た目が同じコードを共通にするかどうかの判断を扱います。この章の total は、別の知識を共通にしてしまった例です。
            </li>
            <li>
              <ChapterLink n={68} />（SoC）と<ChapterLink n={69} />（High Cohesion）：関心事ごとに分けることと、関係の強いものを集めることを、それぞれの観点から扱います。
            </li>
            <li>
              <ChapterLink n={64} />（OCP）：変更の理由ごとに分けたクラスに、既存のコードを書き換えずに種類を足す方法を扱います。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          クラスを分ける単位は処理の種類ではなく、変更を求める人（担当）です。この章では、経理部が決める CSV と、CS が説明に使う発送の通知を Order から分けました。同じ経理部の依頼でしか変わらない CSV の見出し・行・金額は、1つのクラスにまとめておきます。
        </>
      ),
      benefit: {
        text: <>直す前は、経理部の依頼で total を変えると、山田さんへのメールの金額が実際の支払額 3,300円ではなく 3,800円になった。分けた後に同じ依頼を当てはめると、変えたのは AccountingCsv とそのテストの2つのファイルだけで、メールは 3,300円のままだった。</>,
        basis: <><ChapterLink n={63} section="scene" />、<ChapterLink n={63} section="apply" /></>,
      },
      cost: {
        text: <>変えたファイルの数は直す前も後も2つで、変更の手間そのものは減らない。分けたクラスごとにテストのファイルと、注文を作る共通のメソッド（spec/support）が要る。</>,
        basis: <ChapterLink n={63} section="apply" />,
      },
      alternative: {
        text: <>同じ担当の中で別々の依頼で変わる部分（CSV の日付の形式と売上額の計算）は、クラスを分けずに private メソッドに名前を付けて分ける。「1つのことだけをする」6つのクラスに分けた例では、同じ依頼で7つのファイルを変えることになった。</>,
        basis: <ChapterLink n={63} section="overuse" />,
      },
      criterion: {
        text: <>このコードを変えるように依頼するのは誰か。ある担当の依頼で、ほかの担当の機能のテストが落ちたことがあるか。1つの依頼でいくつのファイルを直すか。担当が1つのうちは、将来の担当を想像して先に分けない。</>,
        basis: <ChapterLink n={63} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>単一責任の原則（SRP）は、モジュールが変更される理由を1つに絞る原則です。Martin は、変更の理由とは変更を求める人（1つの業務を受け持つ担当）だと説明しています。</li>
          <li>経理の CSV と発送の通知を1つの Order に書き、total を共有すると、経理部の依頼で total を変えたときに、お客様へのメールの金額まで変わりました。</li>
          <li>式が同じでも、決める人と変わるきっかけが違う計算は別の知識です。お客様の支払額は Order の payment_amount に、経理の売上額は AccountingCsv の sales_amount に分けました。</li>
          <li>テストで出力を固定し、メソッドを担当ごとに分類してから、CSV を普通の Ruby のクラスに、文面をメーラーのテンプレートに移しました。テストも担当ごとのファイルに分けます。</li>
          <li>「1つのことだけをする」を目安に同じ担当の処理を細かく分けると、1つの依頼で多くのファイルを直すことになります。分けるかどうかは、変更を求める人と変わる時期の2つで判断します。</li>
          <li>Active Record は保存と業務の規則を1つのクラスにまとめる設計です。Rails では、特定の担当のための形式をモデルの外に出すことを先に考えます。Concern はファイルを分けますが、クラスは分けません。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Single Responsibility Principle', publisher: 'The Clean Code Blog / Robert C. Martin', url: 'https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html', accessed: '2026-11-21', version: '2014年5月8日', note: 'SRP の定義（変更の理由は1つ）、1990年代後半に原則としてまとめたこと、名前を Meyer から借りたかもしれないという記述、変更の理由は人であること、Employee（calculatePay・save・reportHours）と CFO・COO・CTO の例、「同じ理由で変わる物を集め、違う理由で変わる物を分ける」という言い換えと凝集・結合との関係、Parnas・Dijkstra・Constantine らの考え方を背景に挙げていること。' },
    { title: 'Agile Software Development, Principles, Patterns, and Practices', publisher: 'Robert C. Martin / Pearson（InformIT の書籍ページの目次）', url: 'https://www.informit.com/store/agile-software-development-principles-patterns-and-practices-9780135974445', accessed: '2026-11-21', version: '2002年10月刊', note: '第8章「SRP: The Single-Responsibility Principle」。' },
    { title: "Clean Architecture: A Craftsman's Guide to Software Structure and Design", publisher: 'Robert C. Martin / Pearson（InformIT の書籍ページの目次）', url: 'https://www.informit.com/store/clean-architecture-a-craftsmans-guide-to-software-structure-9780134494166', accessed: '2026-11-21', version: '2017年9月刊', note: '第7章「SRP: The Single Responsibility Principle」の節「Symptom 1: Accidental Duplication」「Symptom 2: Merges」。' },
    { title: 'On the Criteria To Be Used in Decomposing Systems into Modules', publisher: 'D. L. Parnas / Communications of the ACM（アイントホーフェン工科大学の教員のサイトに置かれた複製）', url: 'https://www.win.tue.nl/~wstomv/edu/2ip30/references/criteria_for_modularization.pdf', accessed: '2026-11-21', version: '1972年12月号（Vol. 15, No. 12）', note: '難しい設計判断や変わりやすい設計判断を並べ、それぞれを隠すようにモジュールを分けるという提案。' },
    { title: 'EWD447: On the role of scientific thought', publisher: 'E. W. Dijkstra Archive（The University of Texas at Austin）', url: 'https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html', accessed: '2026-11-21', version: '1974年', note: '正しさ・効率などの側面を切り離して考えることを「the separation of concerns」と呼んだ箇所。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '「No one paradigm」：Active Record がデータベースとのやり取りと業務の規則を混ぜていることと、それが実用的な方法だったこと、モデルの層で凝集を高め結合を低くすること。「Provide sharp knives」：Concern は1つのクラスが関係はあるが別々に理解できる複数の関心事を持てるようにする仕組みであること。' },
    { title: 'Action Mailer Basics', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_mailer_basics.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'メーラーのビューを app/views/〈メーラー名〉 に置くこと、.text.erb と .html.erb、with で渡した値を params で受け取ること、保存の直後に deliver_later を呼ぶコントローラーの例。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-21', version: 'Rails 8.1', note: '起動時に存在する app の下のディレクトリ（assets・javascript・views を除く）が自動で読み込む対象になること。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-21', version: 'Ruby 3.4.0', note: 'csv が default gem から bundled gem に変わったこと。Gemfile に書かないときの LoadError は Ruby 4.0.9 で実行して確認した。' },
    { title: 'activerecord/lib/active_record/relation/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/calculations.rb#L171-L177`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'sum にブロックを渡すと、レコードに map してから Ruby で合計すること。' },
  ],
}

export default chapter
