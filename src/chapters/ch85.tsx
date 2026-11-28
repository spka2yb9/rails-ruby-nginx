import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const PUNDIT = 'https://github.com/varvet/pundit/blob/v2.5.2'

/* ---------- 図 83-1 月次の売上集計の構成と、問題が起きる箇所 ---------- */
const sceneTables = [
  { name: 'shops', sub: '店' },
  { name: 'orders', sub: '確定した合計' },
  { name: 'order_items', sub: '数量・単価' },
  { name: 'products', sub: '現在の価格' },
  { name: 'users', sub: 'メール・役割' },
]

function SceneFigure() {
  return (
    <Svg
      id="83-1"
      w={780}
      h={420}
      label="月次の売上集計の構成。MonthlySalesReportJob（毎月1日に前月を集計する）と MonthlyReportsController（店長と本部が見る画面）が、MonthlySalesReport#rows を呼ぶ。rows は注文ごとに Order#recalculate_total! を呼び、このメソッドは現在の価格で合計を計算して orders を UPDATE する。どの処理も DB のユーザー ch85_app で接続し、ch85_app は ch85_development のすべてのテーブルに ALL PRIVILEGES を持つ。テーブルは shops、orders、order_items、products、users。問題は3つ。1つ目は過去の注文の合計が変わること、2つ目は集計に使わない users テーブルも読めること、3つ目は店長にもすべての店の売上を返すこと"
    >
      <Box x={20} y={20} w={220} h={50} lines={['MonthlySalesReportJob', '毎月1日に前月を集計する']} fs={12} bold subTone="muted" />
      <Box x={20} y={92} w={220} h={50} lines={['MonthlyReportsController', '店長と本部が見る画面']} fs={12} bold subTone="muted" />
      <Arrow x1={240} y1={45} x2={298} y2={72} />
      <Arrow x1={240} y1={117} x2={298} y2={92} />
      <Box x={300} y={56} w={210} h={50} lines={['MonthlySalesReport#rows', '店ごとの件数と売上']} fs={12} bold subTone="muted" />
      <Arrow x1={510} y1={81} x2={548} y2={81} />
      <Box x={550} y={56} w={210} h={50} lines={['Order#recalculate_total!', '現在の価格で計算して保存']} fs={12} fill="box5" bold subTone="muted" />
      <T x={20} y={168} fs={12} tone="danger">
        ③ 店長にも、すべての店の売上を返す
      </T>
      <Arrow x1={405} y1={106} x2={405} y2={192} />
      <Arrow x1={655} y1={106} x2={655} y2={192} />
      <T x={663} y={154} fs={12} tone="danger" mono>
        UPDATE orders
      </T>
      <Box x={20} y={194} w={740} h={44} lines="DB の接続のユーザー：ch85_app（GRANT ALL PRIVILEGES ON ch85_development.*）" fs={12} fill="bg" dashed />
      {sceneTables.map((t, i) => (
        <g key={t.name}>
          <Arrow x1={88 + i * 151} y1={238} x2={88 + i * 151} y2={286} />
          <Box x={20 + i * 151} y={288} w={136} h={48} lines={[t.name, t.sub]} fs={12} fill="box4" subTone="muted" />
        </g>
      ))}
      <T x={239} y={358} anchor="middle" fs={12} tone="danger">
        ① 過去の注文の
      </T>
      <T x={239} y={376} anchor="middle" fs={12} tone="danger">
        合計が変わる
      </T>
      <T x={692} y={358} anchor="middle" fs={12} tone="danger">
        ② 集計に使わない
      </T>
      <T x={692} y={376} anchor="middle" fs={12} tone="danger">
        表も読める
      </T>
      <T x={20} y={408} fs={11} tone="muted">
        上段はアプリのクラス、点線の箱は接続に使う DB のユーザーと権限、下段の緑の箱は MySQL のテーブル
      </T>
    </Svg>
  )
}

/* ---------- 図 83-2 価格を改定した後に集計をやり直すと、過去の注文の合計が変わる ---------- */
function TimelineFigure() {
  const xs = [95, 290, 485, 680]
  const names = ['本部の担当者', 'MonthlySalesReportJob', 'products（コーヒー豆）', 'orders（注文1）']
  const times = [
    { y: 84, text: '10/10' },
    { y: 154, text: '11/1 3:00' },
    { y: 244, text: '11/1 10:00' },
    { y: 324, text: '11/2 9:00' },
  ]
  return (
    <Svg
      id="83-2"
      w={780}
      h={470}
      label="縦に時間をとり、本部の担当者、MonthlySalesReportJob、products のコーヒー豆の行、orders の注文1の行を列に並べた。10月10日に渋谷店の注文1が、コーヒー豆1,200円を2袋で確定し、total は2,400円になる。11月1日3時の集計は recalculate_total! を呼ぶが、計算しても2,400円なので UPDATE は発行されず、渋谷店の10月の売上は3,200円になる。11月1日10時に本部の担当者がコーヒー豆の価格を1,500円に改定する。11月2日9時に集計をやり直すと、recalculate_total! が注文1の total を3,000円に UPDATE し、渋谷店の10月の売上は3,800円になる。同じ10月の売上が変わり、注文1の合計はお客様が払った2,400円と合わなくなる"
    >
      {names.map((n, i) => (
        <g key={n}>
          <Box x={xs[i] - 85} y={10} w={170} h={36} lines={n} fs={12} fill={i >= 2 ? 'box4' : 'box'} accent={i === 1} />
          <line x1={xs[i]} y1={46} x2={xs[i]} y2={400} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {times.map((t) => (
        <T key={t.text} x={8} y={t.y} fs={12} bold>
          {t.text}
        </T>
      ))}
      <Box x={600} y={66} w={160} h={30} lines="total = 2,400" fs={12} />
      <T x={672} y={114} anchor="end" fs={11} tone="muted">
        1,200円 × 2袋で確定
      </T>
      <Arrow x1={290} y1={150} x2={678} y2={150} />
      <T x={387} y={140} anchor="middle" fs={12} mono>
        recalculate_total!
      </T>
      <T x={672} y={172} anchor="end" fs={11} tone="muted">
        2,400 のまま。UPDATE なし
      </T>
      <T x={298} y={186} fs={12} tone="acc">
        渋谷店の10月：3,200 円
      </T>
      <Arrow x1={95} y1={240} x2={483} y2={240} />
      <T x={192} y={230} anchor="middle" fs={12}>
        価格を 1,500 円に改定
      </T>
      <T x={493} y={262} fs={11} tone="muted">
        price = 1,500
      </T>
      <Arrow x1={290} y1={320} x2={678} y2={320} />
      <T x={387} y={310} anchor="middle" fs={12} mono>
        recalculate_total!
      </T>
      <Box x={600} y={334} w={160} h={30} lines="total = 3,000" fs={12} fill="box5" />
      <T x={672} y={382} anchor="end" fs={11} tone="danger">
        UPDATE で書き換わる
      </T>
      <T x={298} y={356} fs={12} tone="danger">
        渋谷店の10月：3,800 円
      </T>
      <T x={8} y={430} fs={12} tone="danger">
        同じ10月の売上が 3,200 円から 3,800 円に変わり、注文1の合計はお客様が払った 2,400 円と合わなくなる
      </T>
      <T x={8} y={456} fs={11} tone="muted">
        縦は時間。実線の矢印はメソッドの呼び出しと更新。11/2 9:00 は、集計の担当者が手で実行し直した
      </T>
    </Svg>
  )
}

/* ---------- 図 83-3 利用者・アプリ・DB の3つの層の権限 ---------- */
const layerRows: { y: number; head: string[]; items: string[][]; check: string[] }[] = [
  {
    y: 20,
    head: ['利用者', '人'],
    items: [
      ['本部の管理者', 'すべての店'],
      ['店長', '自分の店だけ'],
      ['そのほかの役割', '何も見ない'],
    ],
    check: ['確かめる所', 'OrderPolicy::Scope', '（Pundit）'],
  },
  {
    y: 150,
    head: ['アプリ', 'プログラム'],
    items: [
      ['注文の受付・管理画面', 'writing のロール'],
      ['集計のジョブ・画面', 'reading のロール'],
    ],
    check: ['確かめる所', 'connected_to の', 'prevent_writes'],
  },
  {
    y: 280,
    head: ['DB', 'MySQL のユーザー'],
    items: [
      ['ch85_app', 'ALL PRIVILEGES'],
      ['ch85_reporter', '4つの表の SELECT'],
    ],
    check: ['確かめる所', 'MySQL の', 'GRANT'],
  },
]

function LayersFigure() {
  return (
    <Svg
      id="83-3"
      w={780}
      h={412}
      label="権限を3つの層に分けた図。利用者の層では、本部の管理者はすべての店、店長は自分の店だけ、そのほかの役割は何も見ない。確かめる所は Pundit の OrderPolicy::Scope。アプリの層では、注文の受付と管理画面は writing のロール、集計のジョブと画面は reading のロールで動く。確かめる所は connected_to の prevent_writes。DB の層では、ch85_app は ALL PRIVILEGES、ch85_reporter は4つのテーブルの SELECT だけを持つ。確かめる所は MySQL の GRANT。店長が集計の画面を開くと、集計の処理は reading のロールで動き、ch85_reporter で接続する"
    >
      {layerRows.map((r) => {
        const w = r.items.length === 3 ? 126 : 195
        return (
          <g key={r.head[0]}>
            <Box x={20} y={r.y} w={110} h={100} lines={r.head} fs={13} fill="box2" bold subTone="muted" />
            {r.items.map((it, k) => (
              <Box key={it[0]} x={150 + k * (w + 12)} y={r.y + 20} w={w} h={60} lines={it} fs={12} subTone="muted" fill={k === r.items.length - 1 && r.y > 20 ? 'box5' : 'box'} />
            ))}
            <Box x={590} y={r.y + 10} w={170} h={80} lines={r.check} fs={12} fill="bg" dashed subTone="muted" />
          </g>
        )
      })}
      <line x1={20} y1={135} x2={760} y2={135} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={20} y1={265} x2={760} y2={265} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Arrow x1={351} y1={100} x2={440} y2={168} accent />
      <T x={402} y={121} fs={11} tone="acc">
        集計の画面を開く
      </T>
      <Arrow x1={454} y1={230} x2={454} y2={298} accent />
      <Arrow x1={247} y1={230} x2={247} y2={298} />
      <T x={20} y={402} fs={11} tone="muted">
        Saltzer・Schroeder の「every user」は利用者の層、「every program」はアプリと DB の層に当たる
      </T>
    </Svg>
  )
}

/* ---------- 図 83-4 直す前と後の接続と、同じ操作の結果 ---------- */
const compareResults: { label: string; before: string; after: string }[] = [
  { label: 'recalculate_total! の UPDATE', before: '実行される（合計が変わる）', after: 'ReadOnlyError（Rails が止める）' },
  { label: 'WITH で始まる UPDATE', before: '実行される', after: 'UPDATE command denied（MySQL）' },
  { label: 'SELECT … FROM users', before: '読める', after: 'SELECT command denied（MySQL）' },
]

function CompareFigure() {
  return (
    <Svg
      id="83-4"
      w={780}
      h={420}
      label="直す前は、MonthlySalesReportJob が writing のロール、つまりいつもの接続で動き、DB のユーザー ch85_app（ch85_development のすべてに ALL PRIVILEGES）で接続する。recalculate_total! の UPDATE も、WITH で始まる UPDATE も実行され、users テーブルも読める。直した後は、ジョブが connected_to(role: :reading) の中で集計する。Rails の prevent_writes が書き込みと判定した SQL を送らず、接続のユーザー ch85_reporter は4つのテーブルの SELECT だけを持つ。recalculate_total! の UPDATE は Rails の ReadOnlyError、WITH で始まる UPDATE は MySQL の UPDATE command denied、users の SELECT は MySQL の SELECT command denied で止まる"
    >
      <T x={10} y={18} bold>
        直す前
      </T>
      <Box x={30} y={34} w={330} h={50} lines={['MonthlySalesReportJob', 'writing のロール（いつもの接続）']} fs={12} bold subTone="muted" />
      <Arrow x1={195} y1={84} x2={195} y2={120} />
      <Box x={30} y={122} w={330} h={44} lines={['ch85_app', 'ALL PRIVILEGES ON ch85_development.*']} fs={12} fill="bg" dashed subTone="muted" />
      <Arrow x1={195} y1={166} x2={195} y2={232} />
      <T x={404} y={18} bold>
        直した後
      </T>
      <Box x={420} y={34} w={330} h={50} lines={['MonthlySalesReportJob', 'connected_to(role: :reading)']} fs={12} bold accent subTone="acc" />
      <Arrow x1={585} y1={84} x2={585} y2={98} />
      <Box x={420} y={100} w={330} h={44} lines={['Rails：prevent_writes', '書き込みと判定した SQL を送らない']} fs={12} fill="box2" subTone="muted" />
      <Arrow x1={585} y1={144} x2={585} y2={166} />
      <Box x={420} y={168} w={330} h={44} lines={['ch85_reporter', '4つのテーブルの SELECT だけ']} fs={12} fill="bg" dashed subTone="muted" />
      <Arrow x1={585} y1={212} x2={585} y2={232} />
      {compareResults.map((r, i) => (
        <g key={r.label}>
          <Box x={30} y={234 + i * 52} w={330} h={44} lines={[r.label, r.before]} fs={12} subTone="danger" />
          <Box x={420} y={234 + i * 52} w={330} h={44} lines={[r.label, r.after]} fs={12} fill="box5" subTone="acc" />
        </g>
      ))}
      <line x1={390} y1={8} x2={390} y2={390} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={410} fs={11} tone="muted">
        下の3段は、それぞれの接続で同じ操作を実行した結果（実際の出力は図 83-6）
      </T>
    </Svg>
  )
}

/* ---------- 図 83-5 SQL が通る2つの確認 ---------- */
const gateRows: { sql: string; stop: 1 | 2 | 3; result: string }[] = [
  { sql: 'update!（recalculate_total!）', stop: 1, result: 'ReadOnlyError' },
  { sql: 'update_all(total: 0)', stop: 1, result: 'ReadOnlyError' },
  { sql: 'execute("UPDATE orders …")', stop: 1, result: 'ReadOnlyError' },
  { sql: 'execute("WITH … UPDATE …")', stop: 2, result: '1143 UPDATE denied' },
  { sql: 'SELECT … FROM users', stop: 2, result: '1142 SELECT denied' },
  { sql: '集計の SELECT（orders）', stop: 3, result: '' },
]

function GatesFigure() {
  const ry = (i: number) => 60 + i * 46
  return (
    <Svg
      id="83-5"
      w={780}
      h={384}
      label="connected_to(role: :reading) の中で送る SQL は、まず Rails の write_query? が先頭の語で書き込みかを判定し、次に MySQL が ch85_reporter の GRANT と照らし合わせる。update!（recalculate_total!）、update_all、execute の UPDATE は1つ目の確認で ReadOnlyError になる。WITH で始まる UPDATE は Rails が読み取りと判定して通し、MySQL がエラー 1143（UPDATE command denied）で拒否する。users の SELECT も Rails は通し、MySQL がエラー 1142（SELECT command denied）で拒否する。集計の orders の SELECT は両方を通って実行される"
    >
      <T x={385} y={18} anchor="middle" bold>
        ① Rails の確認
      </T>
      <T x={385} y={36} anchor="middle" fs={11} tone="muted">
        write_query?（先頭の語で判定）
      </T>
      <T x={595} y={18} anchor="middle" bold>
        ② MySQL の権限
      </T>
      <T x={595} y={36} anchor="middle" fs={11} tone="muted">
        GRANT（ユーザーと表・列）
      </T>
      <Box x={300} y={46} w={170} h={290} fill="box2" rx={4} />
      <Box x={510} y={46} w={170} h={290} fill="box2" rx={4} />
      {gateRows.map((r, i) => {
        const y = ry(i) + 17
        const end = r.stop === 1 ? 318 : r.stop === 2 ? 528 : 698
        return (
          <g key={r.sql}>
            <Box x={10} y={ry(i)} w={250} h={34} lines={r.sql} fs={12} mono />
            <Arrow x1={260} y1={y} x2={end} y2={y} accent={r.stop === 3} />
            {r.stop === 1 && (
              <T x={396} y={y + 4} anchor="middle" fs={12} tone="danger">
                {r.result}
              </T>
            )}
            {r.stop === 2 && (
              <T x={606} y={y + 4} anchor="middle" fs={12} tone="danger">
                {r.result}
              </T>
            )}
          </g>
        )
      })}
      <Box x={700} y={ry(5)} w={70} h={34} lines="実行" fs={12} fill="box4" />
      <T x={10} y={362} fs={11} tone="muted">
        connected_to(role: :reading) と ch85_reporter を組み合わせた場合。while_preventing_writes で ch85_app のまま止めると、
      </T>
      <T x={10} y={378} fs={11} tone="muted">
        ② ですべて許可されるので、4行目の UPDATE と5行目の SELECT も実行される
      </T>
    </Svg>
  )
}

/* ---------- 図 83-7 利用者ごとの Pundit のスコープと集計の SQL ---------- */
const scopeRows: { user: string[]; resolve: string; cond: string; result: string[] }[] = [
  { user: ['本部 太郎', 'admin'], resolve: 'scope.all', cond: '（条件を足さない）', result: ['渋谷店', '新宿店'] },
  { user: ['渋谷 花子', 'manager・渋谷店'], resolve: 'scope.where(shop_id: 1)', cond: 'orders.shop_id = 1', result: ['渋谷店'] },
  { user: ['アルバイト', 'staff'], resolve: 'scope.none', cond: 'SQL を送らない', result: ['なし'] },
]

function ScopeFigure() {
  return (
    <Svg
      id="83-7"
      w={780}
      h={340}
      label="利用者ごとに OrderPolicy::Scope#resolve が返す Relation と、集計の SQL に加わる条件、結果を並べた。本部 太郎（admin）は scope.all で条件を足さず、渋谷店と新宿店の売上を見る。渋谷 花子（manager、渋谷店）は scope.where(shop_id: 1) で orders.shop_id = 1 が加わり、渋谷店だけを見る。アルバイト（staff）は scope.none で SQL を送らず、何も見ない。MonthlyReportsController#show は connected_to(role: :reading) の中で policy_scope(Order) を集計に渡す"
    >
      <T x={105} y={22} anchor="middle" bold>
        利用者（role）
      </T>
      <T x={330} y={22} anchor="middle" bold>
        OrderPolicy::Scope#resolve
      </T>
      <T x={550} y={22} anchor="middle" bold>
        集計の SQL に加わる条件
      </T>
      <T x={715} y={22} anchor="middle" bold>
        結果
      </T>
      {scopeRows.map((r, i) => {
        const y = 40 + i * 70
        return (
          <g key={r.resolve}>
            <Box x={20} y={y} w={170} h={50} lines={r.user} fs={12} bold subTone="muted" />
            <Arrow x1={190} y1={y + 25} x2={223} y2={y + 25} />
            <Box x={225} y={y} w={210} h={50} lines={r.resolve} fs={12} fill="box2" mono />
            <Arrow x1={435} y1={y + 25} x2={463} y2={y + 25} />
            <Box x={465} y={y} w={170} h={50} lines={r.cond} fs={12} fill="bg" mono={i === 1} />
            <Arrow x1={635} y1={y + 25} x2={663} y2={y + 25} />
            <Box x={665} y={y} w={100} h={50} lines={r.result} fs={12} fill="box4" />
          </g>
        )
      })}
      <Box x={20} y={262} w={745} h={40} lines="MonthlyReportsController#show：connected_to(role: :reading) の中で、policy_scope(Order) を集計に渡す" fs={12} fill="bg" dashed />
      <T x={20} y={328} fs={11} tone="muted">
        利用者は書き込みのロールで users から読み、集計だけを読み取りのロール（ch85_reporter）で実行する
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 85,
  part: 8,
  title: 'Least Privilege（最小権限の原則）：集計の処理と DB のユーザーに必要な権限だけを与える',
  summary:
    '月次の売上集計のジョブがアプリと同じ書き込みのできる DB ユーザーで動き、誤った UPDATE で過去の注文の合計を書き換える場面から始めます。Saltzer・Schroeder の1975年の論文の定義を確かめ、MySQL に SELECT だけを持つユーザーを作って Rails の読み取りのロールで集計を動かし、Rails の確認と MySQL の権限がそれぞれ止める範囲を実行結果で比べます。利用者の層では Pundit のスコープで店長に見せる注文を絞り、権限を細かく分けすぎたときの問題も扱います。',
  goals: [
    '最小権限の原則の定義と目的（誤りや攻撃が起きたときの影響の範囲を狭める）を、Saltzer・Schroeder の論文に沿って説明できる',
    '利用者・アプリ・DB の3つの層で、処理と利用者に必要な権限を決められる',
    'MySQL の GRANT で読み取りだけのユーザーを作り、database.yml・connects_to・connected_to(role: :reading) で集計をその接続で動かせる',
    'while_preventing_writes と読み取り専用の DB ユーザーが止める範囲の違いを、Rails のソースと実行結果で説明できる',
    'Pundit のスコープで利用者ごとに集計の対象を絞り、トランザクションを使うテストでは読み取りのロールの権限を確かめられない理由を説明できる',
    '列単位の権限や処理ごとのユーザーのように、権限を細かく分けすぎたときの運用の手間を判断できる',
  ],
  prerequisites: [21],
  sections: [
    {
      id: 'scene',
      title: '書き込みのできる DB ユーザーで動く月次の売上集計',
      body: (
        <>
          <p>
            この章では月に1回、店ごとの売上を集計する処理を例に、<Term en="Least Privilege">最小権限の原則</Term>を扱います。最小権限の原則は処理に必要な権限だけを与えて、セキュリティ上のリスクを最小限に抑えるという原則です。まず、集計の処理がアプリと同じ DB のユーザーで動いているコードを動かし、誤った UPDATE が過去の注文を書き換える様子と、集計の処理が実行できる操作の範囲を確かめます。
          </p>
          <h3>そもそも月次の売上集計で何をするのか</h3>
          <p>
            2つの店（渋谷店と新宿店）でコーヒー豆と雑貨を売る会社を考えます。本部は毎月1日に前の月の売上を店ごとに集計し、店の評価と仕入れの計画に使います。店長は同じ画面で自分の店の売上を確かめます。集計の処理は注文のデータを読んで足し上げるだけで、注文を書き換える必要はありません。
          </p>
          <p>
            ここでいう<Term en="privilege">権限</Term>は、だれが、何に対して、どの操作をしてよいかの決まりです。この章では3つの層の権限を扱います。1つ目は利用者の権限で、たとえば店長がほかの店の売上を見てよいかという決まりです。2つ目はアプリの処理の権限で、集計の処理が注文を更新してよいかという決まりです。3つ目は DB のユーザーの権限で、MySQL に接続したユーザーが、どのテーブルに SELECT や UPDATE を実行できるかという決まりです。MySQL では GRANT 文でユーザーに権限を与え、REVOKE 文で取り消します。
          </p>
          <p>
            データは5つのテーブルにあります。注文（orders）の total は、注文を確定した時点の合計です。明細（order_items）は注文した時点の単価を unit_price に持ち、商品（products）の price は現在の価格です。利用者（users）は名前・メールアドレス・役割を持ち、役割は本部の管理者（admin）、店長（manager）、そのほかの利用者（staff）のどれかです。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_shop_tables.rb"
            code={`
class CreateShopTables < ActiveRecord::Migration[8.1]
  def change
    create_table :shops do |t|
      t.string :name, null: false
    end
    create_table :users do |t|
      t.references :shop, foreign_key: true # 本部の管理者は店に属さない
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.string :role, null: false # "admin"（本部）・"manager"（店長）・"staff"
    end
    create_table :products do |t|
      t.string :name, null: false
      t.integer :price, null: false # 現在の価格
    end
    create_table :orders do |t|
      t.references :shop, null: false, foreign_key: true
      t.date :ordered_on, null: false
      t.integer :total, null: false # 注文を確定した時点の合計
    end
    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.integer :unit_price, null: false # 注文した時点の価格
    end
  end
end
`}
          />
          <h3>集計のコード</h3>
          <p>
            Order には管理画面で明細を直した後に呼ぶ recalculate_total! があります。このメソッドは現在の価格で合計を計算し、orders に保存してから、合計を返します。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb"
            code={`
class Order < ApplicationRecord
  belongs_to :shop
  has_many :order_items

  # 管理画面で明細を直した後に呼ぶ。現在の価格で合計を計算し直して保存する
  def recalculate_total!
    update!(total: order_items.sum { |item| item.quantity * item.product.price })
    total
  end
end
`}
          />
          <p>
            集計のクラス MonthlySalesReport は、指定した月の注文を店ごとに分けて、件数と売上を返します。集計を書いた担当者は「合計の列が明細と合わない注文がある」と聞いて、明細から計算し直す recalculate_total! を使いました。名前の末尾の ! は、呼ぶと状態が変わることを示しています。しかし担当者は戻り値の合計だけを見ていました。
          </p>
          <Code
            lang="ruby"
            title="app/models/monthly_sales_report.rb（直す前）"
            code={`
# 月次の売上集計（店ごとの件数と売上）
class MonthlySalesReport
  def initialize(month, orders: Order.all)
    @range = month.all_month
    @orders = orders
  end

  def rows
    @orders.where(ordered_on: @range).includes(:shop, order_items: :product)
           .group_by(&:shop).sort_by { |shop, _| shop.id }.map do |shop, orders|
      # 合計の列が明細と合わない注文があると聞いたので、明細から計算し直す
      { shop: shop.name, count: orders.size, amount: orders.sum(&:recalculate_total!) }
    end
  end
end
`}
          />
          <p>集計は2か所から呼ばれます。毎月1日に動くジョブと、店長と本部が開く画面のコントローラーです。</p>
          <Code
            lang="ruby"
            title="app/jobs/monthly_sales_report_job.rb（直す前）"
            code={`
# 毎月1日に前月の売上を集計して、本部に送る
class MonthlySalesReportJob < ApplicationJob
  def perform(month = Date.current.prev_month)
    rows = MonthlySalesReport.new(month).rows
    Rails.logger.info("monthly sales #{month.strftime('%Y-%m')}: #{rows}")
    rows
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/monthly_reports_controller.rb（直す前）"
            code={`
# 店長と本部が見る月次の売上の画面
class MonthlyReportsController < ApplicationController
  def show
    month = Date.strptime(params[:month], "%Y-%m")
    render json: MonthlySalesReport.new(month).rows
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/application_controller.rb（直す前）・sessions_controller.rb"
            code={`
class ApplicationController < ActionController::Base
  before_action :require_login

  private

  def current_user = @current_user ||= User.find_by(id: session[:user_id])
  def require_login = (head :unauthorized unless current_user)
end

# 例を短くするため、メールアドレスだけでログインする（パスワードの確認は省いた）
class SessionsController < ApplicationController
  skip_before_action :require_login

  def create
    session[:user_id] = User.find_by!(email: params[:email]).id
    head :no_content
  end
end
`}
          />
          <Figure n="83-1" title="月次の売上集計の構成と、問題が起きる箇所" caption="赤い文字は、この節で確かめる3つの問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 83-1 のとおり、ジョブも画面もアプリのほかの処理と同じ DB のユーザー ch85_app で接続しています。ch85_app は開発環境の DB（ch85_development）のすべてのテーブルに、すべての権限（ALL PRIVILEGES）を持っています。次の項から、図の赤い文字の3つの問題を順に確かめます。
          </p>
          <h3>価格を改定した後に集計すると、過去の注文の合計が変わる</h3>
          <p>
            開発環境で10月の注文を3件作り、集計を2回実行しました。1回目と2回目の間に、本部がコーヒー豆の価格を 1,200 円から 1,500 円に改定します。DB には ch85_app で接続し、orders を更新する SQL だけを表示しています。
          </p>
          <Code
            lang="ruby"
            title="script/data.rb"
            code={`
# 例のデータを作り直す（bin/rails runner から読み込む）
def seed!
  [OrderItem, Order, User, Product, Shop].each(&:delete_all)
  shibuya = Shop.create!(name: "渋谷店")
  shinjuku = Shop.create!(name: "新宿店")
  User.create!(name: "本部 太郎", email: "hq@example.com", role: "admin")
  User.create!(name: "渋谷 花子", email: "shibuya@example.com", role: "manager", shop: shibuya)
  User.create!(name: "新宿 次郎", email: "shinjuku@example.com", role: "manager", shop: shinjuku)
  beans = Product.create!(name: "コーヒー豆", price: 1_200)
  cup = Product.create!(name: "マグカップ", price: 800)
  [[shibuya, beans, 2], [shibuya, cup, 1], [shinjuku, beans, 1]].each_with_index do |(shop, product, qty), i|
    order = shop.orders.create!(ordered_on: Date.new(2026, 10, 10 + i), total: product.price * qty)
    order.order_items.create!(product:, quantity: qty, unit_price: product.price)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="script/scene_update.rb"
            code={`
# 価格を改定した後に10月の集計をもう一度実行する
require_relative "data"
seed!
ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
  puts "  SQL: #{payload[:sql]}" if payload[:sql].start_with?("UPDATE \`orders\`")
end

october = Date.new(2026, 10)
puts "1回目の集計: #{MonthlySalesReport.new(october).rows}"
Product.find_by!(name: "コーヒー豆").update!(price: 1_500) # 11月1日に価格を改定した
puts "2回目の集計: #{MonthlySalesReport.new(october).rows}"
puts "orders.total: #{Order.order(:id).pluck(:id, :total)}"
`}
          />
          <Code
            lang="text"
            title="実行結果（DATABASE_URL を ch85_app にして bin/rails runner script/scene_update.rb。注文の id は 1〜3 に整えた）"
            code={`
1回目の集計: [{shop: "渋谷店", count: 2, amount: 3200}, {shop: "新宿店", count: 1, amount: 1200}]
  SQL: UPDATE \`orders\` SET \`orders\`.\`total\` = 3000 WHERE \`orders\`.\`id\` = 1
  SQL: UPDATE \`orders\` SET \`orders\`.\`total\` = 1500 WHERE \`orders\`.\`id\` = 3
2回目の集計: [{shop: "渋谷店", count: 2, amount: 3800}, {shop: "新宿店", count: 1, amount: 1500}]
orders.total: [[1, 3000], [2, 800], [3, 1500]]
`}
          />
          <p>
            1回目の集計では、計算し直した合計が元の値と同じなので、Active Record は UPDATE を発行しません。変更のない属性は保存しないからです。価格を改定した後の2回目では、コーヒー豆を含む注文1と注文3の total が、新しい価格で書き換わりました。渋谷店の10月の売上は 3,200 円から 3,800 円に変わり、注文1の合計 3,000 円は、お客様が実際に払った 2,400 円と合いません。図 83-2 はこの流れを時間の順に並べたものです。
          </p>
          <Figure n="83-2" title="価格を改定した後に集計をやり直すと、過去の注文の合計が変わる" caption="11/1 3:00 の集計では何も書き換わらず、価格の改定の後にやり直した集計で total が書き換わる。">
            <TimelineFigure />
          </Figure>
          <p>
            このずれは集計を実行するたびに、その時点の価格で起きます。月の初めの集計では表に出ず、価格を改定した後に集計をやり直したときに初めて表に出るので、原因の調べにも時間がかかります。
          </p>
          <h3>集計の処理の DB ユーザーが実行できる操作</h3>
          <p>
            recalculate_total! の呼び出しを消せば、この不具合は止まります。しかし、集計の処理がそもそも注文を書き換えられることも問題です。同じ間違いは別の集計や、調査のために書いた SQL でも起こります。集計の処理が使う DB のユーザーが、何を実行できるかを確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/grants.rb"
            code={`
# 集計のジョブが使う DB ユーザーと、その権限
ActiveRecord::Base.with_connection do |c|
  puts c.select_value("SELECT CURRENT_USER()")
  c.select_values("SHOW GRANTS").each { |g| puts g }
  puts "users の件数: #{c.select_value('SELECT COUNT(*) FROM users')}"
  puts c.select_rows("SELECT name, email FROM users LIMIT 2").inspect
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/grants.rb）"
            code={`
ch85_app@172.29.0.0/16
GRANT USAGE ON *.* TO \`ch85_app\`@\`172.29.0.0/16\`
GRANT ALL PRIVILEGES ON \`ch85_development\`.* TO \`ch85_app\`@\`172.29.0.0/16\`
GRANT ALL PRIVILEGES ON \`ch85_test\`.* TO \`ch85_app\`@\`172.29.0.0/16\`
users の件数: 3
[["本部 太郎", "hq@example.com"], ["渋谷 花子", "shibuya@example.com"]]
`}
          />
          <p>
            ch85_app は ch85_development のすべてのテーブルに ALL PRIVILEGES を持っています。集計の処理は集計に使わない users のメールアドレスを読めますし、テーブルの削除（DROP TABLE）もできます。集計の画面に SQL インジェクションのような脆弱性があった場合も、攻撃者はこの範囲の操作を実行できます。
          </p>
          <h3>店長がほかの店の売上も見られる</h3>
          <p>集計の画面を、本部の管理者と渋谷店の店長でそれぞれ開く request spec を書きました。</p>
          <Code
            lang="ruby"
            title="spec/requests/monthly_reports_spec.rb（直す前に実行した）"
            code={`
require "rails_helper"
require Rails.root.join("script/data")

RSpec.describe "月次の売上の画面", type: :request do
  before { seed! }

  def shops_seen_by(email)
    post session_path, params: { email: }
    get monthly_report_path("2026-10")
    response.parsed_body.map { it["shop"] }
  end

  it "本部の管理者にはすべての店の売上を返す" do
    expect(shops_seen_by("hq@example.com")).to eq ["渋谷店", "新宿店"]
  end

  it "店長には自分の店の売上だけを返す" do
    expect(shops_seen_by("shibuya@example.com")).to eq ["渋谷店"]
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/monthly_reports_spec.rb）"
            code={`
.F

Failures:

  1) 月次の売上の画面 店長には自分の店の売上だけを返す
     Failure/Error: expect(shops_seen_by("shibuya@example.com")).to eq ["渋谷店"]

       expected: ["渋谷店"]
            got: ["渋谷店", "新宿店"]

       (compared using ==)
     # ./spec/requests/monthly_reports_spec.rb:18:in 'block (2 levels) in <top (required)>'

2 examples, 1 failure
`}
          />
          <p>
            コントローラーはログインしているかだけを確かめ、だれが開いても全店の集計を返します。渋谷店の店長は新宿店の売上も見られます。
          </p>
          <h3>3つの問題に共通すること</h3>
          <p>
            3つの問題はどれも、処理や利用者が、仕事に必要な範囲より多くの権限を持っていることから起きています。集計は読むだけでよいのに書き込みの権限を持ち、4つのテーブルを読めればよいのにすべてのテーブルを読め、店長は自分の店を見られればよいのに全店を見られます。コードの誤りは、どれだけ注意しても入り込みます。権限を仕事に必要な範囲に絞っておけば、誤りが入り込んだときに起きる被害の範囲が狭くなります。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '処理と利用者に、仕事を終えるのに必要な権限だけを与える',
      body: (
        <>
          <h3>原則の定義</h3>
          <p>
            最小権限の原則は処理に必要な権限だけを付与して、セキュリティ上のリスクを最小限に抑えるという原則です。ここでいう「必要な権限」は、その処理や利用者が自分の仕事を終えるために使う、操作と対象の組み合わせです。場面の集計の処理の仕事は前の月の注文を店ごとに足し上げることです。この仕事に必要なのは orders・order_items・products・shops の SELECT で、users の SELECT や orders の UPDATE は使いません。
          </p>
          <p>
            権限を絞る目的は誤りや攻撃をなくすことではありません。誤りや攻撃が起きたときに、変えられるデータと読まれるデータの範囲を狭くすることです。この点は、次に見る最初の論文にもはっきり書かれています。
          </p>
          <h3>Saltzer・Schroeder の論文</h3>
          <p>
            この原則は、Jerome H. Saltzer と Michael D. Schroeder が 1975年に Proceedings of the IEEE（63巻9号）に発表した論文「The Protection of Information in Computer Systems」で、保護の仕組みを設計するときの8つの原則の1つとして示されました<Ref n={1} />。論文は、欠陥のないシステムを作る方法はまだ知られていないので、欠陥の数と深刻さを減らす設計の原則に頼る、という立場でこの8つを挙げています<Ref n={1} />。論文の定義は次のとおりです。
          </p>
          <blockquote>
            システムのすべてのプログラムとすべての利用者は、仕事を終えるのに必要な最小の権限の集まりを使って動くべきである。（原文：Every program and every user of the system should operate using the least set of privileges necessary to complete the job.）
          </blockquote>
          <p>論文は、この原則の効果として次の3つを挙げています<Ref n={1} />。</p>
          <ul>
            <li>事故や誤りが起きたときに生じうる被害を限定する。論文はこれを第一の効果としています。</li>
            <li>特権を持つプログラム同士が影響し合う可能性を、正しく動くのに必要な最小限に減らす。その結果、意図しない特権の使い方や不適切な使い方が起きにくくなる。</li>
            <li>特権の誤用が疑われたときに、調べなければならないプログラムの数が少なくて済む。</li>
          </ul>
          <p>
            また、軍の機密の扱いで使われる「<Term en="need-to-know">知る必要の原則</Term>」（仕事のために知る必要がある人にだけ情報を渡す規則）を、この原則の例として挙げています<Ref n={1} />。
          </p>
          <p>
            論文の注7によると、8つの原則のうち最小権限を含む4つは、Saltzer が 1974年に Communications of the ACM（17巻7号）に発表した論文「Protection and the control of information sharing in Multics」の内容を改訂したものです<Ref n={2} /><Ref n={3} />。Multics は MIT と Honeywell の共同のプロジェクトで作られた OS です<Ref n={1} />。この原則は、Web アプリケーションが生まれる前に、OS の保護の仕組みを設計する中でまとめられたものです。
          </p>
          <h3>「すべてのプログラムとすべての利用者」と3つの層</h3>
          <p>
            定義の主語は「すべてのプログラムとすべての利用者」です。Rails のアプリケーションでは利用者の層、アプリの処理の層、DB のユーザーの層の3つで、それぞれ権限を決めます。図 83-3 は場面の3つの問題を層ごとに並べ、それぞれの権限をどこで確かめるかを示したものです。
          </p>
          <Figure n="83-3" title="利用者・アプリ・DB の3つの層の権限" caption="右の点線の箱は、その層の権限を確かめる仕組み。紫の箱はこの章で権限を絞る対象。">
            <LayersFigure />
          </Figure>
          <p>
            図の上の段は利用者の層です。本部の管理者はすべての店、店長は自分の店だけの売上を見ます。この判定はログインした利用者ごとにアプリの中で行います。中の段はアプリの処理の層です。注文の受付や管理画面は注文を書き換えますが、集計のジョブと画面は読むだけです。下の段は DB の層で、MySQL が接続のユーザーごとの GRANT と照らし合わせて、SQL を実行するかを決めます。
          </p>
          <p>
            論文には、利用者が自分の権限を自分で絞る例もあります。ある利用者が価値の高い情報を扱う権限を持っていても、その情報と関係のない目的で計算機を使うときには、その情報にアクセスできない別の<Term en="principal">プリンシパル</Term>（権限を与える単位）として作業する、という例です。論文はこれを、事故を防ぐために最小権限の原則に従う例として書いています<Ref n={1} />。この章の直し方もこれと同じ形です。同じアプリの中で、注文を書き換える処理はいつもの DB のユーザーで接続し、集計の処理だけは SELECT しか持たない別のユーザーで接続します。
          </p>
          <h3>防ぐのは誤りではなく、誤りが起きたときの被害</h3>
          <p>
            最小権限の原則は、コードの誤りそのものをなくす原則ではありません。場面の recalculate_total! の呼び出しは権限を絞っても集計のコードに残ります。変わるのは、誤りが実行されたときに起きることです。書き込みの権限がなければ、UPDATE はエラーになって注文は書き換わらず、ジョブは失敗として記録されます。注文の合計がいつの間にか書き換わっていた場合も、集計の処理は書き込めないので、調べる対象から外せます。論文が挙げた1つ目と3つ目の効果は、この2点にあたります。
          </p>
          <p>
            攻撃に対しても同じです。集計の画面に SQL インジェクションの脆弱性があった場合、攻撃者が実行できるのは、画面が接続に使う DB のユーザーが持つ権限の範囲です。そのユーザーが4つのテーブルの SELECT しか持たなければ、攻撃者は users のメールアドレスを読み出せず、注文も書き換えられません。脆弱性そのものの対策（値をプレースホルダーで渡すなど）は<ChapterLink n={21} section="sqli" />で扱いました。最小権限の原則は、その対策に漏れがあったときの被害を狭めます。
          </p>
          <p>
            MySQL 8.4 のマニュアルのセキュリティの指針も、必要以上の権限を与えないこと、SHOW GRANTS でどのアカウントが何にアクセスできるかを確かめ、必要のない権限を REVOKE で取り消すことを勧めています<Ref n={6} />。場面で ch85_app の SHOW GRANTS を確かめたのは、この確認にあたります。
          </p>
          <h3>似た原則との違い</h3>
          <p>
            Saltzer・Schroeder の8つの原則には、最小権限と一緒に使うものがあります。本書のほかの原則とも、対象が近いものがあります。違いを表にまとめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>原則</th>
                  <th>何を決めるか</th>
                  <th>この章の場面での例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>最小権限（Least Privilege）</td>
                  <td>与える権限の量。仕事に必要な分だけにする</td>
                  <td>集計のユーザーに、4つのテーブルの SELECT だけを与える</td>
                </tr>
                <tr>
                  <td>フェイルセーフなデフォルト（Fail-safe defaults、同じ論文の b）</td>
                  <td>決めていない場合の扱い。許可したものだけを通し、それ以外は拒む<Ref n={1} /></td>
                  <td>役割を決めていない利用者には、集計を何も返さない</td>
                </tr>
                <tr>
                  <td>権限の分離（Separation of privilege、同じ論文の e）</td>
                  <td>アクセスを許す前に、2つ以上の条件を満たすことを求める<Ref n={1} /></td>
                  <td>Rails の確認と MySQL の権限の両方を通った SQL だけを実行する</td>
                </tr>
                <tr>
                  <td>知る必要の原則（need-to-know）</td>
                  <td>情報を、仕事で知る必要がある人にだけ渡す。論文は最小権限の例としている<Ref n={1} /></td>
                  <td>店長には、自分の店の売上だけを返す</td>
                </tr>
                <tr>
                  <td>
                    Encapsulation（<ChapterLink n={71} />）
                  </td>
                  <td>コードの中で、ほかのクラスに公開する操作を決める</td>
                  <td>プログラムを書く段階の取り決め。動いている処理が DB に対して何をできるかは決めない</td>
                </tr>
                <tr>
                  <td>
                    Defensive Programming（<ChapterLink n={82} />）
                  </td>
                  <td>外部からの入力を信用せずに確かめる</td>
                  <td>URL の月の形式を確かめる。確かめた後に何を実行できるかは、最小権限で決める</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            フェイルセーフなデフォルトを最小権限と組み合わせると、権限の与え忘れは「必要な操作が拒まれる」という形で見つかります。論文は、許可を明示する仕組みに設計や実装の誤りがあると、必要なアクセスまで拒む形で失敗し、すぐに気づかれると説明しています。反対に、拒否を明示する仕組みに誤りがあると、許すべきでないアクセスを許す形で失敗し、普段の利用では気づかれにくいとしています<Ref n={1} />。Pundit の <code>bin/rails g pundit:install</code> が作る ApplicationPolicy も、index? や update? などの判定がすべて false を返し、Scope#resolve は定義しなければ例外を投げる形になっています<Ref n={20} />。何も書かなければ何も許さない、という形です。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '集計を SELECT だけのユーザーと読み取りのロールで動かす',
      body: (
        <>
          <h3>直す順序</h3>
          <p>3つの層のうち、DB の層とアプリの層から直し、利用者の層を最後に直します。手順は次の6つです。</p>
          <ol>
            <li>MySQL に、集計に使う4つのテーブルの SELECT だけを持つユーザー ch85_reporter を作る。</li>
            <li>database.yml に読み取りの接続を足し、ApplicationRecord の connects_to で読み取りのロールに割り当てる。</li>
            <li>集計のジョブを読み取りのロールで動かす。直す前の集計のコードはここで ReadOnlyError になる。</li>
            <li>集計のコードを、注文を確定した時点の合計（orders.total）を足し上げる形に直す。</li>
            <li>集計の画面も読み取りのロールで動かし、Pundit のスコープで利用者ごとに注文を絞る。</li>
            <li>テストで、読み取りのロールが使う DB のユーザーと、止まる操作を確かめる。</li>
          </ol>
          <p>
            本番では手順3と手順4を同じデプロイに含めます。手順3だけを先に出すと、価格を改定した後の集計のジョブが ReadOnlyError で失敗するからです。この節では、権限を絞ったときに誤りがどう見えるかを確かめるため、手順3を先に動かします。
          </p>
          <h3>手順1：読み取りだけの DB ユーザーを作る</h3>
          <p>MySQL の root で次の SQL を実行し、集計のための DB のユーザーを作ります。</p>
          <Code
            lang="sql"
            title="db/grants/reporter.sql"
            code={`
-- 集計のジョブと集計の画面が使う、読み取りだけのユーザー（MySQL の root で実行する）
-- 接続できるのは、アプリのサーバーがあるネットワーク（この環境では Docker のネットワーク）からだけ
CREATE USER IF NOT EXISTS 'ch85_reporter'@'172.29.0.0/16' IDENTIFIED BY 'ch85-reporter-pass';

-- 集計に使う4つのテーブルだけ SELECT を許可する（users は許可しない）
GRANT SELECT ON ch85_development.shops       TO 'ch85_reporter'@'172.29.0.0/16';
GRANT SELECT ON ch85_development.orders      TO 'ch85_reporter'@'172.29.0.0/16';
GRANT SELECT ON ch85_development.order_items TO 'ch85_reporter'@'172.29.0.0/16';
GRANT SELECT ON ch85_development.products    TO 'ch85_reporter'@'172.29.0.0/16';

SHOW GRANTS FOR 'ch85_reporter'@'172.29.0.0/16';
`}
          />
          <Code
            lang="text"
            title="実行結果（SHOW GRANTS の部分）"
            code={`
+-------------------------------------------------------------------------------------+
| Grants for ch85_reporter@172.29.0.0/16                                              |
+-------------------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO \`ch85_reporter\`@\`172.29.0.0/16\`                               |
| GRANT SELECT ON \`ch85_development\`.\`order_items\` TO \`ch85_reporter\`@\`172.29.0.0/16\` |
| GRANT SELECT ON \`ch85_development\`.\`orders\` TO \`ch85_reporter\`@\`172.29.0.0/16\`      |
| GRANT SELECT ON \`ch85_development\`.\`products\` TO \`ch85_reporter\`@\`172.29.0.0/16\`    |
| GRANT SELECT ON \`ch85_development\`.\`shops\` TO \`ch85_reporter\`@\`172.29.0.0/16\`       |
+-------------------------------------------------------------------------------------+
`}
          />
          <p>
            ユーザー名の後ろの <code>'172.29.0.0/16'</code> は、接続を受け付ける接続元の範囲です。MySQL 8.4 では IPv4 のアドレスで書くホストを 198.51.100.44/24 のような CIDR の表記で書けます<Ref n={5} />。この環境では Docker のネットワークの範囲を書きました。本番では、アプリのサーバーがあるネットワークの範囲にします。MySQL のマニュアルのセキュリティの指針も、すべてのホストに権限を与えないよう求めています<Ref n={6} />。
          </p>
          <p>
            <code>GRANT SELECT ON データベース名.テーブル名</code> は、テーブルの単位の権限です。テーブルの単位の権限はそのテーブルのすべての列に適用されます<Ref n={4} />。users には GRANT を書いていないので、ch85_reporter は users を読めません。最初の行の <code>GRANT USAGE ON *.*</code> は「権限なし」を表す行で、CREATE USER をするとこの行ができます。テストの DB（ch85_test）にも、同じ4つのテーブルの SELECT を与えました。
          </p>
          <p>
            パスワードは database.yml に書かず、環境変数 REPORTER_DB_PASSWORD で渡します。この SQL のファイルには説明のためにパスワードを書きましたが、本番のパスワードは credentials や環境変数で管理します。秘密の値の扱いは<ChapterLink n={21} section="secrets" />で扱いました。
          </p>
          <h3>手順2：読み取りの接続とロールを足す</h3>
          <p>
            次に、Rails から ch85_reporter で接続できるようにします。Active Record の<Term en="role">ロール</Term>は、モデルが使う DB の接続に付ける名前です。既定の名前は writing（書き込み）と reading（読み取り）です。<code>connects_to</code> で、ロールごとに database.yml のどの設定で接続するかを決めます<Ref n={8} />。database.yml には環境ごとに primary（書き込み）と primary_replica（読み取り）の2つの設定を書きます。
          </p>
          <Code
            lang="yaml"
            title="config/database.yml"
            code={`
default: &default
  adapter: mysql2
  encoding: utf8mb4
  max_connections: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  username: root
  password:
  host: <%= ENV.fetch("DB_HOST") { "127.0.0.1" } %>

# 書き込みの接続（primary）は、環境変数 DATABASE_URL のユーザーで接続する
# 読み取りの接続（primary_replica）は、SELECT だけを許可した ch85_reporter で接続する
development:
  primary:
    <<: *default
    database: ch85_development
  primary_replica:
    <<: *default
    database: ch85_development
    username: ch85_reporter
    password: <%= ENV["REPORTER_DB_PASSWORD"] %>
    replica: true

test:
  # …（省略。development と同じ形で、database は ch85_test）
`}
          />
          <Code
            lang="ruby"
            title="app/models/application_record.rb（直した後）"
            code={`
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  connects_to database: { writing: :primary, reading: :primary_replica }
end
`}
          />
          <p>
            primary には、環境変数 DATABASE_URL の値（この章の開発環境では ch85_app のユーザーとパスワード）が重ねて適用されます。primary_replica は同じ ch85_development に ch85_reporter で接続します。Rails のガイドも、複数の DB を使うときは書き込み用と読み取り用でユーザー名を分け、読み取り用のユーザーには読み取りの権限だけを与えるよう求めています<Ref n={7} />。
          </p>
          <p>
            <code>replica: true</code> は、この設定が読み取り専用の複製（<Term en="replica">レプリカ</Term>）であることを Rails に伝えます。Rails はレプリカに対してマイグレーションなどのタスクを実行しません<Ref n={7} />。また、replica: true の接続はどのロールで使っても書き込みを止める扱いになります<Ref n={14} />。この章には MySQL のレプリカのサーバーはなく、同じ DB に別のユーザーで接続するためにこの仕組みを使っています。すでにレプリカのサーバーを使っている場合は、そのサーバーに接続するユーザーにも SELECT だけを与えます。
          </p>
          <h3>手順3：集計のジョブを読み取りのロールで動かす</h3>
          <p>
            <code>ActiveRecord::Base.connected_to(role: :reading)</code> のブロックの中では、ApplicationRecord を継承したモデルが読み取りのロールの接続を使います。reading のロールを指定すると、Rails は書き込みを止める設定（prevent_writes）も自動でオンにします<Ref n={10} />。ジョブの集計の部分をこのブロックに入れました。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/monthly_sales_report_job.rb（直した後）"
            code={`
# 毎月1日に前月の売上を集計して、本部に送る
class MonthlySalesReportJob < ApplicationJob
  def perform(month = Date.current.prev_month)
    # 集計は読み取りのロール（ch85_reporter の接続）で実行する
    rows = ActiveRecord::Base.connected_to(role: :reading) do
      MonthlySalesReport.new(month).rows
    end
    Rails.logger.info("monthly sales #{month.strftime('%Y-%m')}: #{rows}")
    rows
  end
end
`}
          />
          <p>MonthlySalesReport は直す前のまま、価格を改定した後にジョブを実行しました。</p>
          <Code
            lang="ruby"
            title="script/job_reading.rb"
            code={`
# 直す前の MonthlySalesReport のまま、ジョブだけを読み取りのロールで動かす
require_relative "data"
seed!
Product.find_by!(name: "コーヒー豆").update!(price: 1_500) # 11月1日に価格を改定した

begin
  MonthlySalesReportJob.perform_now(Date.new(2026, 10))
rescue => e
  puts "#{e.class}: #{e.message}"
end
puts "orders.total: #{Order.order(:id).pluck(:id, :total)}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/job_reading.rb。注文の id は 1〜3 に整えた）"
            code={`
ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE \`orders\` SET \`orders\`.\`total\` = 3000 WHERE \`orders\`.\`id\` = 1
orders.total: [[1, 2400], [2, 800], [3, 1200]]
`}
          />
          <p>
            recalculate_total! が発行しようとした UPDATE を、Rails が MySQL に送る前に止め、ActiveRecord::ReadOnlyError を投げました。注文1の total は 2,400 のままです。場面では誤りが何も言わずに注文を書き換えましたが、権限を絞ると、同じ誤りがジョブの失敗として記録されます。
          </p>
          <p>
            価格を改定する前の集計では、計算し直した合計が元の値と同じなので UPDATE は発行されず、エラーにもなりません。エラーになるのは、注文が書き換わるはずだった時点です。権限を絞っても、誤りがあるかどうかを前もって教えてくれるわけではありません。誤りが実行されたときに、データを変えずにエラーにするのが、権限を絞ることの効果です。
          </p>
          <h3>手順4：集計のコードを直す</h3>
          <p>
            集計の仕事は注文を確定した時点の合計を足し上げることです。現在の価格で計算し直す必要はありません。orders.total を MySQL で店ごとに足し上げる形に直しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/monthly_sales_report.rb（直した後）"
            code={`
# 月次の売上集計（店ごとの件数と売上）
class MonthlySalesReport
  def initialize(month, orders: Order.all)
    @range = month.all_month
    @orders = orders
  end

  # 注文を確定した時点の合計（orders.total）を、MySQL で店ごとに足し上げる
  def rows
    @orders.where(ordered_on: @range).joins(:shop)
           .group("shops.id", "shops.name").order("shops.id")
           .pluck("shops.name", Arel.sql("COUNT(*)"), Arel.sql("SUM(orders.total)"))
           .map { |name, count, amount| { shop: name, count:, amount: amount.to_i } }
  end
end
`}
          />
          <Code
            lang="ruby"
            title="script/job_after.rb"
            code={`
# 価格を改定した後に、直した集計のジョブを実行する
require_relative "data"
seed!
Product.find_by!(name: "コーヒー豆").update!(price: 1_500) # 11月1日に価格を改定した
ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
  puts "  SQL: #{payload[:sql]}" if payload[:sql].include?("SUM(")
end

puts "集計: #{MonthlySalesReportJob.perform_now(Date.new(2026, 10))}"
puts "orders.total: #{Order.order(:id).pluck(:id, :total)}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/job_after.rb。注文の id は 1〜3 に整えた）"
            code={`
  SQL: SELECT \`shops\`.\`name\`, COUNT(*), SUM(orders.total) FROM \`orders\` INNER JOIN \`shops\` ON \`shops\`.\`id\` = \`orders\`.\`shop_id\` WHERE \`orders\`.\`ordered_on\` BETWEEN '2026-10-01' AND '2026-10-31' GROUP BY \`shops\`.\`id\`, \`shops\`.\`name\` ORDER BY shops.id
集計: [{shop: "渋谷店", count: 2, amount: 3200}, {shop: "新宿店", count: 1, amount: 1200}]
orders.total: [[1, 2400], [2, 800], [3, 1200]]
`}
          />
          <p>
            価格を改定した後でも、渋谷店の10月の売上は 3,200 円、新宿店は 1,200 円で、場面の1回目の集計と同じです。orders.total も書き換わっていません。直した集計が読むテーブルは orders と shops の2つで、集計の SQL は1回です。直す前は、注文・明細・商品をすべて読み込んでから Ruby で足し上げ、合計が変わった注文には UPDATE を発行していました。
          </p>
          <p>図 83-4 は直す前と直した後で、ジョブが使う接続と、同じ操作の結果を比べたものです。</p>
          <Figure n="83-4" title="直す前と後の接続と、同じ操作の結果" caption="左は直す前（いつもの接続）、右は直した後（読み取りのロール）。下の3段は同じ操作をそれぞれの接続で実行した結果。">
            <CompareFigure />
          </Figure>
          <p>
            直した後のジョブの SQL は、Rails の確認（prevent_writes）と MySQL の権限（ch85_reporter の GRANT）の2つを通ります。図の下の3段のとおり、2つの確認は止める操作が違います。次の項で、この違いを実行結果で確かめます。
          </p>
          <h3>Rails の確認と MySQL の権限が止める範囲</h3>
          <p>
            Rails には DB のユーザーを変えずに書き込みだけを止める <code>ActiveRecord::Base.while_preventing_writes</code> もあります。ブロックの中では今のロールの接続（この章では ch85_app）を使い、書き込みと判定した SQL を送りません<Ref n={9} />。DB のユーザーを作らずに済むので手軽ですが、止める範囲は読み取りのロールと同じではありません。2つの方法で同じ5つの操作を試しました。4つ目は明細から合計を作り直すつもりで、数量を掛け忘れた SQL です。
          </p>
          <Code
            lang="ruby"
            title="script/write_attempts.rb"
            code={`
# 書き込みを止める2つの方法で、同じ5つの操作を試す
require_relative "data"

# 明細から合計を作り直すつもりで、数量を掛け忘れた SQL
WRONG_REPAIR = <<~SQL
  WITH sums AS (SELECT order_id, SUM(unit_price) AS amount FROM order_items GROUP BY order_id)
  UPDATE orders JOIN sums ON sums.order_id = orders.id SET orders.total = sums.amount
SQL

ATTEMPTS = {
  "update!（recalculate_total!）" => -> { Order.order(:id).first.recalculate_total! },
  "update_all" => -> { Order.update_all(total: 0) },
  "execute の UPDATE" => -> { ActiveRecord::Base.with_connection { it.execute("UPDATE orders SET total = 0") } },
  "WITH で始まる UPDATE" => -> { ActiveRecord::Base.with_connection { it.execute(WRONG_REPAIR) } },
  "users の SELECT" => -> { ActiveRecord::Base.with_connection { it.select_value("SELECT COUNT(*) FROM users") } },
}

def try_all
  puts "DB ユーザー: #{ActiveRecord::Base.with_connection { it.select_value('SELECT CURRENT_USER()') }}"
  ATTEMPTS.each do |name, attempt|
    puts "  #{name}: 実行できた（#{attempt.call.inspect}）"
  rescue => e
    puts "  #{name}: #{e.class}: #{e.message}"
  end
end

def prepare
  seed!
  Product.find_by!(name: "コーヒー豆").update!(price: 1_500) # 価格を改定した後の状態にする
end

prepare
puts "[1] ActiveRecord::Base.while_preventing_writes"
ActiveRecord::Base.while_preventing_writes { try_all }
puts "  → orders.total: #{Order.order(:id).pluck(:total)}"

prepare
puts "[2] ActiveRecord::Base.connected_to(role: :reading)"
ActiveRecord::Base.connected_to(role: :reading) { try_all }
puts "  → orders.total: #{Order.order(:id).pluck(:total)}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/write_attempts.rb。注文の id は 1 に整えた）"
            code={`
[1] ActiveRecord::Base.while_preventing_writes
DB ユーザー: ch85_app@172.29.0.0/16
  update!（recalculate_total!）: ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE \`orders\` SET \`orders\`.\`total\` = 3000 WHERE \`orders\`.\`id\` = 1
  update_all: ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE \`orders\` SET \`orders\`.\`total\` = 0
  execute の UPDATE: ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE orders SET total = 0
  WITH で始まる UPDATE: 実行できた（nil）
  users の SELECT: 実行できた（3）
  → orders.total: [1200, 800, 1200]
[2] ActiveRecord::Base.connected_to(role: :reading)
DB ユーザー: ch85_reporter@172.29.0.0/16
  update!（recalculate_total!）: ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE \`orders\` SET \`orders\`.\`total\` = 3000 WHERE \`orders\`.\`id\` = 1
  update_all: ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE \`orders\` SET \`orders\`.\`total\` = 0
  execute の UPDATE: ActiveRecord::ReadOnlyError: Write query attempted while in readonly mode: UPDATE orders SET total = 0
  WITH で始まる UPDATE: ActiveRecord::StatementInvalid: Mysql2::Error: UPDATE command denied to user 'ch85_reporter'@'172.29.0.5' for column 'total' in table 'orders'
  users の SELECT: ActiveRecord::StatementInvalid: Mysql2::Error: SELECT command denied to user 'ch85_reporter'@'172.29.0.5' for table 'users'
  → orders.total: [2400, 800, 1200]
`}
          />
          <p>
            どちらの方法でも、最初の3つの UPDATE は Rails が MySQL に送る前に止めました。違いが出たのは4つ目と5つ目です。while_preventing_writes では、WITH で始まる UPDATE が実行され、注文1の total が数量を掛け忘れた 1,200 円に変わりました。users の件数も読めています。読み取りのロールでは、同じ2つの SQL を MySQL が拒否し、orders.total は元の値のままです。
          </p>
          <p>
            違いが出る理由は、Rails が SQL の先頭の語だけで書き込みかどうかを判定しているからです。Rails は、先頭（空白・括弧・コメントを除く）が begin・commit・explain・release・rollback・savepoint・select・with のどれかで始まる SQL を読み取りとみなします。MySQL のアダプターはこれに desc・describe・set・show・use・kill を加えています<Ref n={11} /><Ref n={12} />。どれにも当てはまらない SQL は書き込みと判定され、書き込みを止めている間は ReadOnlyError になります<Ref n={13} /><Ref n={14} />。WITH が読み取りの一覧にあるのは、WITH … SELECT が読み取りだからです。しかし MySQL 8.4 では WITH 句を SELECT だけでなく UPDATE と DELETE の先頭にも書けます<Ref n={15} />。そのため WITH … UPDATE は Rails の確認を通り、DB のユーザーの権限だけが止めます。users の SELECT も、SQL としては読み取りなので Rails は止めません。
          </p>
          <p>
            Rails のソースの while_preventing_writes のコメントにも、このメソッドは読み取り専用のユーザーと同じ保護にはならず、誤った書き込みを防ぐための安全策だと書かれています<Ref n={9} />。Rails のガイドも、prevent_writes は書き込みに見える SQL を送らないだけなので、レプリカの DB も読み取り専用で動かすよう求めています<Ref n={7} />。図 83-5 は、SQL がこの2つの確認を順に通る様子を示したものです。
          </p>
          <Figure n="83-5" title="SQL が通る2つの確認" caption="左の SQL が、どちらの確認で止まるか。一番下の集計の SELECT だけが両方を通って実行される。">
            <GatesFigure />
          </Figure>
          <p>
            MySQL のエラーの番号は、テーブルへの権限がないときが 1142（ER_TABLEACCESS_DENIED_ERROR）、列への権限がないときが 1143（ER_COLUMNACCESS_DENIED_ERROR）です<Ref n={16} />。WITH … UPDATE は、更新しようとした列 total への権限がないので 1143 になり、users の SELECT はテーブルへの権限がないので 1142 になりました。エラーの番号は、例外の cause（Mysql2::Error）の error_number で確かめました。図 83-6 は2つの方法の結果を表にまとめたものです。
          </p>
          <Figure n="83-6" title="書き込みを止める2つの方法で、同じ5つの操作を試した結果" caption="script/write_attempts.rb の実行結果を表にした。どちらも価格を 1,500 円に改定した後の状態から実行した。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>操作</th>
                    <th>while_preventing_writes（ch85_app のまま）</th>
                    <th>connected_to(role: :reading)（ch85_reporter）</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>update!（recalculate_total!）</td>
                    <td>ReadOnlyError（Rails が止めた）</td>
                    <td>ReadOnlyError（Rails が止めた）</td>
                  </tr>
                  <tr>
                    <td>update_all</td>
                    <td>ReadOnlyError（Rails が止めた）</td>
                    <td>ReadOnlyError（Rails が止めた）</td>
                  </tr>
                  <tr>
                    <td>execute の UPDATE</td>
                    <td>ReadOnlyError（Rails が止めた）</td>
                    <td>ReadOnlyError（Rails が止めた）</td>
                  </tr>
                  <tr>
                    <td>WITH で始まる UPDATE</td>
                    <td>実行された。注文1の total が 1,200 に変わった</td>
                    <td>1143 UPDATE command denied（MySQL が止めた）</td>
                  </tr>
                  <tr>
                    <td>users の SELECT</td>
                    <td>実行された（3件）</td>
                    <td>1142 SELECT command denied（MySQL が止めた）</td>
                  </tr>
                  <tr>
                    <td>実行後の orders.total</td>
                    <td>[1200, 800, 1200]</td>
                    <td>[2400, 800, 1200]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            Rails の確認は DB に SQL を送る前に止めるので、エラーの原因が Rails のどの呼び出しかが分かりやすいという利点があります。MySQL の権限は SQL をどう書いたかに関係なく、ユーザーとテーブル・列の組み合わせで止めます。読み取りのロールは、この2つの確認を両方使える方法です。
          </p>
          <h3>読み取りのロールのブロックの中で読み終える</h3>
          <p>
            読み取りのロールを使うときに、もう1つ気をつけることがあります。Active Record の Relation は、中身が必要になったときに初めて SQL を送ります。そのため、connected_to のブロックの外で中身を読むと、SQL はブロックの外の接続で送られます。ブロックから Relation をそのまま返す場合と、Hash に入れて返す場合を比べました。
          </p>
          <Code
            lang="ruby"
            title="script/relation_outside.rb"
            code={`
# connected_to のブロックから Relation を返す場合と、Hash に入れて返す場合
begin
  ActiveRecord::Base.connected_to(role: :reading) { User.all }
rescue => e
  puts "Relation を返す: #{e.class}: #{e.message}"
end
result = ActiveRecord::Base.connected_to(role: :reading) { { users: User.all } }
puts "Hash に入れて返す: #{result[:users].size} 件（ブロックの外で読んだ）"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/relation_outside.rb）"
            code={`
Relation を返す: ActiveRecord::StatementInvalid: Mysql2::Error: SELECT command denied to user 'ch85_reporter'@'172.29.0.4' for table 'users'
Hash に入れて返す: 3 件（ブロックの外で読んだ）
`}
          />
          <p>
            ブロックの戻り値が Relation のときは、Rails がブロックを抜ける前に load を呼んで SQL を送ります<Ref n={10} />。そのため1つ目は読み取りのロールで users を読もうとして、MySQL に拒否されました。2つ目の戻り値は Hash なので、Rails は中の Relation を読み込みません。ブロックを抜けた後の <code>size</code> で SQL が送られ、書き込みのロール（ch85_app）で3件を読めてしまいました。読み取りのロールで実行したい処理は、ブロックの中で to_a や pluck を呼んで読み終えます。直した MonthlySalesReport#rows は pluck の結果を Array で返すので、集計の SQL はブロックの中で送られます。
          </p>
          <h3>手順5：集計の画面で、利用者ごとに注文を絞る</h3>
          <p>
            最後に利用者の層を直します。Pundit の<Term en="policy scope">ポリシースコープ</Term>は、利用者ごとに「その人が扱ってよいレコードの集まり」を返すクラスです。Pundit はポリシーのクラスの中の Scope という名前のクラスに、利用者と対象（多くはモデルのクラスか Relation）を渡し、resolve の戻り値を使います<Ref n={18} />。注文のスコープを次のように書きました。
          </p>
          <Code
            lang="ruby"
            title="app/policies/order_policy.rb"
            code={`
class OrderPolicy < ApplicationPolicy
  # 利用者が集計に含めてよい注文
  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.admin?
        scope.all
      elsif user.manager?
        scope.where(shop_id: user.shop_id)
      else
        scope.none # 役割を足したときは、許可するまで何も見せない
      end
    end
  end
end
`}
          />
          <p>
            本部の管理者はすべての注文、店長は自分の店の注文を扱えます。そのほかの役割には <code>scope.none</code> を返し、何も見せません。これは前の節のフェイルセーフなデフォルトにあたります。たとえば後で「経理」の役割を足したときに、スコープを直し忘れても、経理の担当者には何も表示されません。全店の売上が表示されることはありません。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/application_controller.rb（直した後）・monthly_reports_controller.rb（直した後）"
            code={`
class ApplicationController < ActionController::Base
  include Pundit::Authorization

  before_action :require_login

  private

  def current_user = @current_user ||= User.find_by(id: session[:user_id])
  def require_login = (head :unauthorized unless current_user)
end

# 店長と本部が見る月次の売上の画面
class MonthlyReportsController < ApplicationController
  after_action :verify_policy_scoped

  def show
    month = Date.strptime(params[:month], "%Y-%m")
    rows = ActiveRecord::Base.connected_to(role: :reading) do
      MonthlySalesReport.new(month, orders: policy_scope(Order)).rows
    end
    render json: rows
  end
end
`}
          />
          <p>
            <code>policy_scope(Order)</code> は、current_user と Order を OrderPolicy::Scope に渡して resolve を呼び、呼んだことを記録します。<code>after_action :verify_policy_scoped</code> は、アクションの中で policy_scope が呼ばれていなければ Pundit::PolicyScopingNotPerformedError を投げます<Ref n={19} />。ただし Pundit の README は、この確認は開発中に呼び忘れに気づくためのもので、認可の仕組みでも失敗したときの安全策でもないとしています<Ref n={18} />。利用者を絞るのは、あくまで resolve の中の条件です。
          </p>
          <p>
            current_user は before_action の require_login で、ブロックに入る前に読み込まれます。そのため users の SELECT は書き込みのロール（ch85_app）で送られ、ch85_reporter に users の権限がなくても動きます。ブロックの中の resolve は読み込み済みの利用者の role と shop_id を見るだけで、users を読み直しません。利用者ごとに、集計が送る SQL と結果を表示しました。
          </p>
          <Code
            lang="ruby"
            title="script/scope_sql.rb"
            code={`
# 利用者ごとに、集計が送る SQL と結果を表示する
require_relative "data"
seed!
ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
  puts "  SQL: #{payload[:sql]}" if payload[:sql].include?("SUM(")
end

users = User.order(:id).to_a + [User.new(name: "アルバイト", role: "staff", shop: Shop.first)]
ActiveRecord::Base.connected_to(role: :reading) do
  users.each do |user|
    rows = MonthlySalesReport.new(Date.new(2026, 10), orders: OrderPolicy::Scope.new(user, Order).resolve).rows
    puts "#{user.name}（#{user.role}）: #{rows}"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scope_sql.rb。店の id は 1・2 に整えた）"
            code={`
  SQL: SELECT \`shops\`.\`name\`, COUNT(*), SUM(orders.total) FROM \`orders\` INNER JOIN \`shops\` ON \`shops\`.\`id\` = \`orders\`.\`shop_id\` WHERE \`orders\`.\`ordered_on\` BETWEEN '2026-10-01' AND '2026-10-31' GROUP BY \`shops\`.\`id\`, \`shops\`.\`name\` ORDER BY shops.id
本部 太郎（admin）: [{shop: "渋谷店", count: 2, amount: 3200}, {shop: "新宿店", count: 1, amount: 1200}]
  SQL: SELECT \`shops\`.\`name\`, COUNT(*), SUM(orders.total) FROM \`orders\` INNER JOIN \`shops\` ON \`shops\`.\`id\` = \`orders\`.\`shop_id\` WHERE \`orders\`.\`shop_id\` = 1 AND \`orders\`.\`ordered_on\` BETWEEN '2026-10-01' AND '2026-10-31' GROUP BY \`shops\`.\`id\`, \`shops\`.\`name\` ORDER BY shops.id
渋谷 花子（manager）: [{shop: "渋谷店", count: 2, amount: 3200}]
  SQL: SELECT \`shops\`.\`name\`, COUNT(*), SUM(orders.total) FROM \`orders\` INNER JOIN \`shops\` ON \`shops\`.\`id\` = \`orders\`.\`shop_id\` WHERE \`orders\`.\`shop_id\` = 2 AND \`orders\`.\`ordered_on\` BETWEEN '2026-10-01' AND '2026-10-31' GROUP BY \`shops\`.\`id\`, \`shops\`.\`name\` ORDER BY shops.id
新宿 次郎（manager）: [{shop: "新宿店", count: 1, amount: 1200}]
アルバイト（staff）: []
`}
          />
          <p>
            店長の集計の SQL には <code>orders.shop_id = 1</code> の条件が加わり、自分の店の注文だけを足し上げます。アルバイトの行には SQL が表示されていません。<code>scope.none</code> の Relation は、DB に SQL を送らずに空の結果を返すからです<Ref n={25} />。図 83-7 は利用者ごとのスコープと、集計の SQL に加わる条件をまとめたものです。
          </p>
          <Figure n="83-7" title="利用者ごとの Pundit のスコープと集計の SQL" caption="店の id は、渋谷店を 1 とした。スコープが返す Relation に、集計の条件（月の範囲・店ごとの集計）が足される。">
            <ScopeFigure />
          </Figure>
          <h3>手順6：テストで権限を確かめる</h3>
          <p>
            最後に、読み取りのロールで止まるべき操作が止まることをテストにします。ここで1つ注意があります。rspec-rails の既定の設定では、テストの例ごとにトランザクションを開始し、終わったら ROLLBACK します（<ChapterLink n={20} section="transaction" />）。このとき Rails は読み取りのロールの接続の設定を、書き込みのロールの接続の設定に置き換えます<Ref n={17} />。読み取りのロールで送った SQL からも同じトランザクションの中のデータを見られるようにするためです。そのため、トランザクションを使うテストでは、読み取りのロールでも ch85_reporter では接続しません。
          </p>
          <Code
            lang="ruby"
            title="spec/jobs/monthly_sales_report_job_spec.rb"
            code={`
require "rails_helper"
require Rails.root.join("script/data")

RSpec.describe MonthlySalesReportJob do
  # 読み取りのロールに本物の ch85_reporter の接続を使わせるため、トランザクションを使わない
  self.use_transactional_tests = false

  before { seed! }
  after { [OrderItem, Order, User, Product, Shop].each(&:delete_all) }

  def reading(&) = ActiveRecord::Base.connected_to(role: :reading, &)
  def run_sql(sql) = ActiveRecord::Base.with_connection { it.execute(sql) }

  it "店ごとの件数と、確定した時点の合計を足した売上を返す" do
    Product.find_by!(name: "コーヒー豆").update!(price: 1_500)
    expect(described_class.perform_now(Date.new(2026, 10))).to eq [
      { shop: "渋谷店", count: 2, amount: 3200 },
      { shop: "新宿店", count: 1, amount: 1200 },
    ]
  end

  it "読み取りのロールは ch85_reporter で接続する" do
    user = reading { ActiveRecord::Base.with_connection { it.select_value("SELECT CURRENT_USER()") } }
    expect(user).to start_with("ch85_reporter@")
  end

  it "Active Record の更新は、Rails が SQL を送る前に止める" do
    expect { reading { Order.update_all(total: 0) } }.to raise_error(ActiveRecord::ReadOnlyError)
  end

  it "Rails が読み取りと判定する WITH で始まる UPDATE は、MySQL が拒否する" do
    sql = "WITH s AS (SELECT 1 AS x) UPDATE orders SET total = 0"
    expect { reading { run_sql(sql) } }.to raise_error(ActiveRecord::StatementInvalid, /UPDATE command denied/)
    expect(Order.pluck(:total)).not_to include(0)
  end

  it "集計に使わない users テーブルは読めない" do
    expect { reading { run_sql("SELECT email FROM users") } }
      .to raise_error(ActiveRecord::StatementInvalid, /SELECT command denied .* for table 'users'/)
  end
end

RSpec.describe "トランザクションを使うテストの読み取りのロール" do
  it "書き込みの接続（DATABASE_URL のユーザー）を共有する" do
    user = ActiveRecord::Base.connected_to(role: :reading) do
      ActiveRecord::Base.with_connection { it.select_value("SELECT CURRENT_USER()") }
    end
    expect(user).to eq "root@%"
  end
end
`}
          />
          <p>
            1つ目の describe は <code>self.use_transactional_tests = false</code> でトランザクションを使わず、例ごとに after でデータを消します。2つ目の describe は既定のトランザクションを使うテストで、読み取りのロールの接続ユーザーがテストの DATABASE_URL のユーザー（この環境では root）になることを確かめています。DB の権限を確かめるテストは、トランザクションを使わない形で、数を絞って書きます。
          </p>
          <p>集計の画面の request spec には、役割を決めていない利用者の例を足しました。</p>
          <Code
            lang="ruby"
            title="spec/requests/monthly_reports_spec.rb（直した後）"
            code={`
require "rails_helper"
require Rails.root.join("script/data")

RSpec.describe "月次の売上の画面", type: :request do
  before { seed! }

  def report_for(email)
    post session_path, params: { email: }
    get monthly_report_path("2026-10")
    response.parsed_body.map { it.values_at("shop", "amount") }
  end

  it "本部の管理者にはすべての店の売上を返す" do
    expect(report_for("hq@example.com")).to eq [["渋谷店", 3200], ["新宿店", 1200]]
  end

  it "店長には自分の店の売上だけを返す" do
    expect(report_for("shibuya@example.com")).to eq [["渋谷店", 3200]]
  end

  it "役割を決めていない利用者には何も返さない" do
    User.create!(name: "アルバイト", email: "staff@example.com", role: "staff", shop: Shop.first)
    expect(report_for("staff@example.com")).to eq []
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/jobs spec/requests --format documentation）"
            code={`
MonthlySalesReportJob
  店ごとの件数と、確定した時点の合計を足した売上を返す
  読み取りのロールは ch85_reporter で接続する
  Active Record の更新は、Rails が SQL を送る前に止める
  Rails が読み取りと判定する WITH で始まる UPDATE は、MySQL が拒否する
  集計に使わない users テーブルは読めない

トランザクションを使うテストの読み取りのロール
  書き込みの接続（DATABASE_URL のユーザー）を共有する

月次の売上の画面
  本部の管理者にはすべての店の売上を返す
  店長には自分の店の売上だけを返す
  役割を決めていない利用者には何も返さない

Finished in 1.05 seconds (files took 0.86733 seconds to load)
9 examples, 0 failures
`}
          />
          <p>
            場面で失敗していた「店長には自分の店の売上だけを返す」も通りました。request spec はトランザクションを使うテストなので、画面の集計は ch85_reporter ではなく書き込みの接続で動いています。画面の集計もジョブと同じ読み取りのロールの設定を使うので、DB の権限についてはジョブの spec で確かめた結果がそのまま当てはまります。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '権限を列や処理の単位まで細かく分けたとき',
      body: (
        <>
          <p>
            権限は、細かく分けるほど止められる操作が増えます。その代わり、正しい変更をしたときにも権限が足りずに止まることが増え、権限を直す作業も増えます。この節では集計のユーザーの権限をさらに細かくした例を動かし、どこまで分けるかの判断の目安をまとめます。
          </p>
          <h3>列ごとに SELECT を許可する</h3>
          <p>
            MySQL ではテーブルの中の列ごとに権限を与えられます。列の単位で与えられるのは INSERT・REFERENCES・SELECT・UPDATE の4つで、<code>GRANT SELECT (列1, 列2) ON …</code> のように列を括弧で書きます<Ref n={4} />。直した集計が orders から読む列は id・shop_id・ordered_on・total の4つなので、テーブルの単位の SELECT を取り消して、この4つの列だけを許可しました。
          </p>
          <Code
            lang="sql"
            title="db/grants/reporter_columns.sql"
            code={`
-- 当てはめすぎの例：orders は、集計に使う4つの列だけ SELECT を許可する
REVOKE SELECT ON ch85_development.orders FROM 'ch85_reporter'@'172.29.0.0/16';
GRANT SELECT (id, shop_id, ordered_on, total) ON ch85_development.orders TO 'ch85_reporter'@'172.29.0.0/16';
`}
          />
          <p>この状態で、注文に割引の額の列を足すマイグレーションを実行し、読み取りのロールで3つの読み方を試しました。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000002_add_discount_to_orders.rb"
            code={`
class AddDiscountToOrders < ActiveRecord::Migration[8.1]
  def change
    add_column :orders, :discount, :integer, null: false, default: 0
  end
end
`}
          />
          <Code
            lang="ruby"
            title="script/column_grant.rb"
            code={`
# orders に割引の列を足した後、読み取りのロールで3つの読み方を試す
require_relative "data"
seed!
october = Date.new(2026, 10).all_month

READS = {
  "今の集計（SUM(orders.total)）" => -> { MonthlySalesReport.new(Date.new(2026, 10)).rows },
  "Order.first（SELECT orders.*）" => -> { Order.order(:id).first },
  "割引を引いた集計" => -> { Order.where(ordered_on: october).group(:shop_id).sum(Arel.sql("orders.total - orders.discount")) },
}

ActiveRecord::Base.connected_to(role: :reading) do
  READS.each do |name, read|
    puts "#{name}: #{read.call.inspect}"
  rescue => e
    puts "#{name}: #{e.class}: #{e.message}"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（reporter_columns.sql とマイグレーションの後、bin/rails runner script/column_grant.rb）"
            code={`
今の集計（SUM(orders.total)）: [{shop: "渋谷店", count: 2, amount: 3200}, {shop: "新宿店", count: 1, amount: 1200}]
Order.first（SELECT orders.*）: ActiveRecord::StatementInvalid: Mysql2::Error: SELECT command denied to user 'ch85_reporter'@'172.29.0.5' for table 'orders'
割引を引いた集計: ActiveRecord::StatementInvalid: Mysql2::Error: SELECT command denied to user 'ch85_reporter'@'172.29.0.5' for column 'discount' in table 'orders'
`}
          />
          <p>
            今の集計は許可した4つの列だけを読むので通りました。しかし <code>Order.order(:id).first</code> は失敗しました。Active Record はモデルを読み込むときに <code>SELECT orders.*</code> ですべての列を読むので、許可していない discount の列も読もうとするからです。読み取りのロールでモデルを読み込む処理は、すべて select で列を指定しなければならなくなります。
          </p>
          <p>
            割引を引いた集計も、discount の列への権限がないというエラーで失敗しました。割引を集計に入れるという正しい変更でも、マイグレーションと一緒に GRANT を直さなければ、月の初めに集計のジョブが動いたときに初めて失敗します。列を足すたびに、マイグレーションと GRANT を同じ手順で反映する作業が増えます。この章の orders は集計に使わない列も含めてすべて集計のユーザーに見えてかまわないデータなので、列の単位まで分けても止められる被害はほとんど増えません。この例の後、orders の権限はテーブルの単位の SELECT に戻しました。
          </p>
          <h3>処理ごとに DB のユーザーを分ける</h3>
          <p>
            別の分け方として、集計の種類ごと（店別の売上、商品別の売上、在庫の集計など）に DB のユーザーを分けることも考えられます。どの集計がどのテーブルを読めるかを細かく決められますが、次の作業が集計の数だけ増えます。
          </p>
          <ul>
            <li>MySQL のユーザーとパスワード、database.yml の設定、connects_to のロールを、集計ごとに足す。</li>
            <li>
              Rails はロールごとに接続プールを作ります<Ref n={8} />。プールはそれぞれ最大 max_connections 本の接続を持てるので<Ref n={24} />、1つのプロセスから MySQL に張られうる接続の数の上限も、ロールの数に合わせて増えます。
            </li>
            <li>集計のコードを変えて読むテーブルが変わるたびに、そのユーザーの GRANT も直す。</li>
          </ul>
          <p>
            この章では、売上の集計が読むテーブルの範囲として、4つのテーブルの SELECT を ch85_reporter に与えました。直した店別の集計が読むのは orders と shops だけなので、厳密には2つで足ります。order_items と products も許可したのは、明細と商品も売上のデータで、集計のユーザーに見えて困るものではないからです。反対に users は集計に使わない個人情報（メールアドレス）を含むので許可していません。権限の境界は、コードが今読んでいる範囲より、読まれたときや書き換えられたときの被害の大きさが変わる所に置くと、コードを変えるたびに GRANT を直さずに済みます。
          </p>
          <h3>利用者の層でも同じことが起きる</h3>
          <p>
            利用者の層でも、細かく分けすぎると同じ問題が起きます。たとえば店長・副店長・アルバイトで見られる列を変えると、スコープと画面の分岐が役割の数だけ増え、役割を足すたびにすべての画面を確かめ直すことになります。Pundit のスコープで店ごとに分けたのは、店長にほかの店の売上を見せないという業務の決まりがあるからです。業務の決まりがない区別まで権限で表すと、テストと確認の手間だけが増えます。将来の役割に備えて権限の種類を先に作っておくことは、YAGNI（<ChapterLink n={58} />）の章で見た、今必要のない複雑さにあたります。
          </p>
          <h3>判断の目安</h3>
          <p>図 83-8 は DB のユーザーの権限の分け方ごとに、止められることと増える作業を並べたものです。</p>
          <Figure n="83-8" title="DB のユーザーの権限の分け方と、止められること・増える作業" caption="上から下へ細かくなる。この章の場面では2行目と3行目を組み合わせた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>分け方</th>
                    <th>止められること</th>
                    <th>増える作業</th>
                    <th>使う場面の目安</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>アプリ全体で1つのユーザー（ALL PRIVILEGES）</td>
                    <td>なし。アプリの誤りはすべて DB に届く</td>
                    <td>なし</td>
                    <td>手元の開発環境。本番の読むだけの処理には使わない</td>
                  </tr>
                  <tr>
                    <td>書き込み用と読み取り用の2つ</td>
                    <td>読み取りの処理からの書き込み（WITH … UPDATE も含む）</td>
                    <td>ユーザー1つ、database.yml の設定1つ、connected_to のブロック</td>
                    <td>集計・検索・CSV の出力など、読むだけの処理がある</td>
                  </tr>
                  <tr>
                    <td>読み取り用のユーザーに、テーブルの単位の SELECT</td>
                    <td>個人情報など、読ませなくてよいテーブルの読み出し</td>
                    <td>テーブルを足したときの GRANT</td>
                    <td>読み取りの処理に見せる必要のない機密のテーブルがある（この章の users）</td>
                  </tr>
                  <tr>
                    <td>列の単位の SELECT</td>
                    <td>同じテーブルの中の機密の列の読み出し</td>
                    <td>列を足すたびの GRANT、モデルを読むすべての所での select の指定</td>
                    <td>機密の列を別のテーブルに分けられない。分けられるなら、テーブルを分けてテーブルの単位で許可する</td>
                  </tr>
                  <tr>
                    <td>処理ごとのユーザー</td>
                    <td>処理ごとの読み書きの範囲の違反</td>
                    <td>ユーザー・パスワード・接続プールが処理の数だけ増える</td>
                    <td>処理ごとに、扱うデータの機密の度合いや、誤ったときの被害の大きさが大きく違う</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            目安は権限の境界ごとに「その境界で止めたい被害が何か」を1文で言えるかどうかです。この章の2つの境界は「集計が注文を書き換えない」「集計の処理から利用者のメールアドレスを読めない」と言えます。列の単位の境界は、この章の orders では止めたい被害を言えないので、置きませんでした。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の複数 DB の機能・Pundit と、本書のほかの章',
      body: (
        <>
          <h3>権限に関わる Rails と Pundit の機能</h3>
          <p>この章で使った機能と、使わなかった関連の機能を表にまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>機能</th>
                  <th>何をするか</th>
                  <th>この章での使い方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>connects_to database: {'{'} writing:, reading: {'}'}</code>
                  </td>
                  <td>ロールごとに、database.yml のどの設定で接続するかを決める<Ref n={8} /></td>
                  <td>ApplicationRecord で primary と primary_replica を割り当てた</td>
                </tr>
                <tr>
                  <td>
                    <code>connected_to(role: :reading)</code>
                  </td>
                  <td>ブロックの間、読み取りのロールの接続を使い、書き込みを止める<Ref n={10} /></td>
                  <td>集計のジョブと集計の画面</td>
                </tr>
                <tr>
                  <td>
                    <code>replica: true</code>
                  </td>
                  <td>設定をレプリカとして扱い、マイグレーションなどを実行しない。この設定の接続は常に書き込みを止める<Ref n={7} /><Ref n={14} /></td>
                  <td>primary_replica（ch85_reporter）</td>
                </tr>
                <tr>
                  <td>
                    <code>while_preventing_writes</code>
                  </td>
                  <td>今の接続のまま、書き込みに見える SQL を送らない。読み取り専用のユーザーの代わりにはならない<Ref n={9} /></td>
                  <td>読み取りのロールと比べるためだけに使った</td>
                </tr>
                <tr>
                  <td>自動のロールの切り替え（database_selector）</td>
                  <td>GET・HEAD などの要求を、直前に書き込んでいなければ読み取りのロールで処理する<Ref n={7} /></td>
                  <td>使っていない（次の項）</td>
                </tr>
                <tr>
                  <td>
                    Pundit の <code>policy_scope</code>・<code>verify_policy_scoped</code>
                  </td>
                  <td>利用者が扱ってよいレコードの集まりを返す。呼び忘れを開発中に見つける<Ref n={18} /><Ref n={19} /></td>
                  <td>集計の画面で、利用者ごとに注文を絞った</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>自動のロールの切り替えを使わなかった理由</h3>
          <p>
            Rails には、HTTP の要求ごとにロールを切り替えるミドルウェアがあります。<code>bin/rails g active_record:multi_db</code> で作られる設定を有効にすると、POST・PUT・DELETE・PATCH の要求は書き込みのロールで処理されます。それ以外の要求は、その利用者が直前（既定では2秒以内）に書き込んでいなければ、読み取りのロールで処理されます<Ref n={7} />。
          </p>
          <p>
            このミドルウェアがロールを決める基準は、HTTP のメソッドと、直前に書き込んだかどうかです。読み取りのロールでは書き込みが止まるので<Ref n={10} />、GET の要求の中で書き込む処理（閲覧の回数を数える UPDATE など）は ReadOnlyError になります。この章の目的は集計という特定の処理の権限を絞ることでした。そのため、集計を実行する所だけを <code>connected_to</code> のブロックで囲み、どの処理が読み取りのロールで動くかをコードに書きました。暗黙の切り替えより明示的な記述を選ぶ考え方は、<ChapterLink n={62} />で扱いました。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Provide sharp knives」の項は、Ruby がモンキーパッチ（既存のクラスやメソッドを書き換える機能）のような強力な機能を意図して備えていると述べています。そして、良い使い方は禁止ではなく、規約と教育で伝えるとしています<Ref n={21} />。Rails も <code>update_all</code> や <code>execute</code> のように、コールバックやバリデーションを通らずに DB を変える機能をプログラマーに渡しています。
          </p>
          <p>
            最小権限の原則はこの考え方と対立しません。Doctrine が扱っているのは、プログラマーがコードに何を書けるかです。最小権限の原則が扱うのは、動いている処理と利用者が、本番のデータに対して何をできるかです。この章でも、集計のコードから <code>execute</code> を取り上げてはいません。集計を動かす DB のユーザーの権限を絞り、誤った SQL が実行されたときに変わるデータの範囲を狭めただけです。
          </p>
          <h3>本書のほかの章</h3>
          <ul>
            <li>
              利用者ごとの認可（IDOR の防ぎ方、Pundit の authorize）は<ChapterLink n={21} section="object-authorization" />、SQL インジェクションの対策は<ChapterLink n={21} section="sqli" />、DB のパスワードなど秘密の値の管理は<ChapterLink n={21} section="secrets" />で扱いました。
            </li>
            <li>
              Pundit のポリシーの実装は <ChapterLink n={41} section="pundit" />、テストは <ChapterLink n={41} section="test" /> で扱います。
            </li>
            <li>
              トランザクションを使うテストの仕組みは<ChapterLink n={20} section="transaction" />で扱いました。読み取りのロールの権限を確かめるテストは、この章のようにトランザクションを使わずに書きます。
            </li>
            <li>
              書き込みの権限がない処理で誤った UPDATE を実行すると、データを変える前にエラーになります。不正な状態をできるだけ早く検出する Fail Fast（<ChapterLink n={79} />）と同じ効果です。
            </li>
            <li>
              列を足すマイグレーションと GRANT を一緒に反映する手順は、稼働中のテーブルを変える手順（<ChapterLink n={27} section="live-change" />）に含めます。
            </li>
          </ul>
          <Callout kind="v72">
            <p>
              この章のコードの <code>ActiveRecord::Base.with_connection</code> は Rails 7.2 にもありますが、Rails 7.1 の ConnectionHandling にはありません。Rails 7.1 では <code>ActiveRecord::Base.connection</code> を使います<Ref n={22} /><Ref n={23} />。while_preventing_writes は読み取り専用のユーザーと同じ保護にはならない、というソースのコメントは、Rails 7.1・7.2 の API ドキュメントにも同じ文があります<Ref n={22} /><Ref n={23} />。
            </p>
            <p>
              database.yml の接続の数の上限は、Rails 8.1 が生成するファイルでは <code>max_connections</code> と書きます<Ref n={26} />。Rails 8.1 でも、max_connections がなければ <code>pool</code> の値を読みます<Ref n={24} />。また、ブロックの引数を <code>it</code> で参照する書き方は Ruby 3.4 で入りました<Ref n={27} />。それより前の Ruby では <code>|c|</code> のように引数に名前を付けます。
            </p>
          </Callout>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          権限の境界はその境界で止めたい被害を1文で言える所に置きます。この章では「集計が注文を書き換えない」「集計の処理から利用者のメールアドレスを読めない」の2つを、4つのテーブルの SELECT だけを持つ DB ユーザーで、店長が自分の店だけを見ることを Pundit のスコープで守りました。止めたい被害を言えない列の単位には、境界を置きません。
        </>
      ),
      benefit: {
        text: <>直す前は、ALL PRIVILEGES の ch85_app で動く集計が価格の改定後に過去の注文の total を書き換え、集計に使わない users も読め、店長はほかの店の売上も見られた。読み取りのロール（ch85_reporter）で動かすと、同じ誤りは ReadOnlyError になり、WITH で始まる UPDATE と users の SELECT は MySQL が拒否した。</>,
        basis: <><ChapterLink n={85} section="scene" />、<ChapterLink n={85} section="apply" /></>,
      },
      cost: {
        text: <>読み取りだけの DB ユーザー・接続の設定・GRANT の SQL を管理する。トランザクションを使うテストでは読み取りのロールが書き込みの接続を共有するので、DB の権限を確かめるテストはトランザクションを使わずに書き、例ごとにデータを消す必要がある。</>,
        basis: <ChapterLink n={85} section="apply" />,
      },
      alternative: {
        text: <>書き込みだけを止めるなら while_preventing_writes もあるが、Rails は SQL の先頭の語で判定するので、WITH で始まる UPDATE と users の SELECT は止まらなかった。列ごとに SELECT を許可した例では、Order.first も割引を入れた正しい集計も、権限が足りずに失敗した。</>,
        basis: <><ChapterLink n={85} section="apply" />、<ChapterLink n={85} section="overuse" /></>,
      },
      criterion: {
        text: <>その境界で止めたい被害（注文の書き換え、メールアドレスの読み取り、ほかの店の売上の表示）を1文で言えるか。列を足すたびや集計を変えるたびに GRANT を直す作業が、止められる被害に見合うか。</>,
        basis: <ChapterLink n={85} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>最小権限の原則は、処理と利用者に仕事を終えるのに必要な権限だけを与える原則です。Saltzer・Schroeder の1975年の論文は、事故や誤りが起きたときの被害を限定することを第一の効果とし、特権の誤用を調べる範囲が狭まることも挙げています。</li>
          <li>場面では、月次の集計のジョブが ALL PRIVILEGES を持つ ch85_app で動いていました。価格を改定した後の集計で過去の注文の合計が書き換わり、集計に使わない users も読め、店長はほかの店の売上も見られました。</li>
          <li>MySQL に4つのテーブルの SELECT だけを持つ ch85_reporter を作り、replica: true の設定と connects_to・connected_to(role: :reading) で集計を動かしました。同じ誤りは ReadOnlyError になり、注文は書き換わりませんでした。</li>
          <li>Rails の確認（prevent_writes）は SQL の先頭の語で書き込みかを判定するので、WITH で始まる UPDATE や users の SELECT は止めません。while_preventing_writes だけでは足りず、DB のユーザーの権限と組み合わせます。ブロックの外で読み込む Relation は、書き込みの接続で SQL を送ります。</li>
          <li>利用者の層は Pundit のスコープで絞り、役割を決めていない利用者には scope.none で何も見せません。トランザクションを使うテストでは読み取りのロールが書き込みの接続を共有するので、DB の権限のテストはトランザクションを使わずに書きます。</li>
          <li>列の単位や処理ごとのユーザーまで分けると、列を足すたびや集計を変えるたびに GRANT を直す作業が増え、Order.first のような普通の読み込みも止まります。権限の境界は止めたい被害を1文で言える所に置きます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Protection of Information in Computer Systems（Section I-A-3 Design Principles）', publisher: 'Jerome H. Saltzer, Michael D. Schroeder / Proceedings of the IEEE, Vol. 63, No. 9, pp. 1278-1308（著者の MIT のページの HTML 版）', url: 'https://web.mit.edu/Saltzer/www/publications/protection/Basic.html', accessed: '2026-11-22', version: '1975年（書誌情報は Crossref の DOI 10.1109/PROC.1975.9939 で確認）', note: '最小権限の定義（Every program and every user of the system should operate using the least set of privileges necessary to complete the job）、事故や誤りの被害を限定することが第一の効果であること、特権を持つプログラム同士の影響を減らすこと、誤用を調べるプログラムの数が減ること、need-to-know が例であること。8つの原則の一覧と、欠陥のないシステムを作る方法がないので原則に頼るという立場。fail-safe defaults（許可を明示する仕組みの誤りは拒否として表に出る）、separation of privilege（2つ以上の条件）、別のプリンシパルで作業する例、Multics が MIT と Honeywell の共同のプロジェクトであること。' },
    { title: 'The Protection of Information in Computer Systems（Notes）', publisher: 'Jerome H. Saltzer, Michael D. Schroeder（著者の MIT のページの HTML 版）', url: 'https://web.mit.edu/Saltzer/www/publications/protection/notes.html', accessed: '2026-11-22', version: '1975年', note: '注7：原則 b・d・f（最小権限）・h は、Communications of the ACM に1974年に発表した資料（参考文献26の398ページ）を改訂したものであること。' },
    { title: 'Protection and the control of information sharing in Multics', publisher: 'Jerome H. Saltzer / Communications of the ACM, Vol. 17, No. 7, pp. 388-402', url: 'https://doi.org/10.1145/361011.361067', accessed: '2026-11-22', version: '1974年7月', note: '最小権限の原則の元になった1974年の論文。書誌情報は Crossref で確認した。本文は確認していないので、定義は1975年の論文から引いた。' },
    { title: 'MySQL 8.4 Reference Manual: 15.7.1.6 GRANT Statement', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/grant.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'テーブルの単位の権限が、そのテーブルのすべての列に適用されること。列の単位の権限を括弧で列を書いて与えること、列の単位で与えられるのが INSERT・REFERENCES・SELECT・UPDATE であること。' },
    { title: 'MySQL 8.4 Reference Manual: 8.2.4 Specifying Account Names', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/account-names.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'IPv4 のアドレスで書くホストを、198.51.100.44/24 のような CIDR の表記で書けること。' },
    { title: 'MySQL 8.4 Reference Manual: 8.1.1 Security Guidelines', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/security-guidelines.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: '必要以上の権限を与えないこと、すべてのホストに権限を与えないこと、SHOW GRANTS で確かめて必要のない権限を REVOKE で取り消すこと。' },
    { title: 'Multiple Databases with Active Record', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_multiple_databases.html', accessed: '2026-11-22', version: 'Rails 8.1', note: '書き込み用と読み取り用でユーザー名を分け、読み取り用のユーザーには読み取りの権限だけを与えること。replica: true でレプリカを Rails に伝え、マイグレーションなどを実行しないこと。prevent_writes は書き込みに見える SQL を送らないだけなので、レプリカも読み取り専用で動かすこと。自動のロールの切り替え（POST・PUT・DELETE・PATCH は書き込み、それ以外は直前の書き込みがなければ読み取り、既定の遅れは2秒）。' },
    { title: 'activerecord/lib/active_record/connection_handling.rb（connects_to・connected_to）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_handling.rb#L56-L151`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'connects_to がロールごとに database.yml の設定で接続を確立すること（ロールごとに接続プールができる）、connected_to がブロックの間ロールを切り替えること。' },
    { title: 'activerecord/lib/active_record/connection_handling.rb（while_preventing_writes）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_handling.rb#L227-L240`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'while_preventing_writes が今のロールのまま prevent_writes を有効にすること、読み取り専用のユーザーと同じ保護にはならず誤った書き込みへの安全策であるというコメント。' },
    { title: 'activerecord/lib/active_record/connection_handling.rb（with_role_and_shard）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_handling.rb#L397-L408`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'reading のロールでは prevent_writes を自動で true にすること、ブロックの戻り値が Relation なら抜ける前に load すること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_adapter.rb（DEFAULT_READ_QUERY）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_adapter.rb#L90-L96`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '読み取りとみなす SQL の先頭の語（begin・commit・explain・release・rollback・savepoint・select・with）と、先頭の空白・括弧・コメントを除いて照らし合わせる正規表現。' },
    { title: 'activerecord/lib/active_record/connection_adapters/mysql/database_statements.rb（READ_QUERY・write_query?）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/mysql/database_statements.rb#L7-L21`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'MySQL のアダプターが desc・describe・set・show・use・kill を読み取りに加えること、READ_QUERY に当てはまらない SQL を書き込みと判定すること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb（preprocess_query）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L606-L610`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '書き込みと判定した SQL について ensure_writes_are_allowed を呼ぶこと。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_adapter.rb（ensure_writes_are_allowed・replica?・preventing_writes?）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_adapter.rb#L206-L250`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '書き込みを止めている間は ReadOnlyError を投げること、replica: true の接続では preventing_writes? が常に true になること。' },
    { title: 'MySQL 8.4 Reference Manual: 15.2.20 WITH (Common Table Expressions)', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/with.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'WITH 句を SELECT・UPDATE・DELETE の先頭に書けること。' },
    { title: 'MySQL 8.4 Error Reference: Server Error Message Reference', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/mysql-errors/8.4/en/server-error-reference.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'エラー 1142（ER_TABLEACCESS_DENIED_ERROR、テーブルへの権限がない）と 1143（ER_COLUMNACCESS_DENIED_ERROR、列への権限がない）のメッセージ。番号は実行結果の Mysql2::Error#error_number でも確かめた。' },
    { title: 'activerecord/lib/active_record/test_fixtures.rb（setup_shared_connection_pool）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/test_fixtures.rb#L238-L262`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'トランザクションを使うテストで、読み取りの接続が書き込みの接続の開いたトランザクションのデータを見られるように、書き込みのロールの接続プールの設定を共有すること。' },
    { title: 'varvet/pundit（README）', publisher: 'GitHub', url: 'https://github.com/varvet/pundit', accessed: '2026-11-13', version: '2.5.2（gem に同梱の README で確認）', note: 'Scope のクラスの規約（利用者と対象を受け取り、resolve を持つ）、policy_scope、verify_policy_scoped は開発中に呼び忘れを見つけるためのもので、認可の仕組みや安全策ではないこと（第9部の Strategy / Policy の章の出典を流用）。' },
    { title: 'lib/pundit/authorization.rb（policy_scope・verify_policy_scoped）', publisher: 'varvet/pundit（GitHub）', url: `${PUNDIT}/lib/pundit/authorization.rb#L163-L200`, accessed: '2026-11-22', version: 'pundit 2.5.2', note: 'policy_scope が呼んだことを記録してスコープの resolve を返すこと、verify_policy_scoped が呼ばれていなければ PolicyScopingNotPerformedError を投げること。' },
    { title: 'lib/generators/pundit/install/templates/application_policy.rb.tt', publisher: 'varvet/pundit（GitHub）', url: `${PUNDIT}/lib/generators/pundit/install/templates/application_policy.rb.tt#L11-L53`, accessed: '2026-11-22', version: 'pundit 2.5.2', note: 'pundit:install が作る ApplicationPolicy の index?・show?・create?・update?・destroy? が false を返し、Scope#resolve が定義されていなければ NoMethodError を投げること。' },
    { title: 'The Rails Doctrine（Provide sharp knives）', publisher: 'rubyonrails.org', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', version: '', note: 'Ruby がモンキーパッチのような強力な機能を意図して備え、良い使い方を禁止ではなく規約と教育で伝えるという考え方。' },
    { title: 'ActiveRecord::ConnectionHandling（Rails 7.2）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v7.2/classes/ActiveRecord/ConnectionHandling.html', accessed: '2026-11-22', version: 'Rails 7.2', note: 'with_connection があること。while_preventing_writes のコメントが 8.1 と同じであること。' },
    { title: 'ActiveRecord::ConnectionHandling（Rails 7.1）', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v7.1/classes/ActiveRecord/ConnectionHandling.html', accessed: '2026-11-22', version: 'Rails 7.1', note: 'with_connection がなく connection を使うこと。while_preventing_writes のコメントが 8.1 と同じであること。' },
    { title: 'activerecord/lib/active_record/database_configurations/hash_config.rb（max_connections）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/database_configurations/hash_config.rb#L73-L85`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '接続プールの接続の上限を max_connections から読み、なければ pool、どちらもなければ 5 を使うこと。HashConfig#pool が非推奨になったこと。' },
    { title: 'activerecord/lib/active_record/relation/query_methods.rb（none）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/query_methods.rb#L1282-L1320`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'none が DB に問い合わせずに空の結果を返す Relation を返し、条件を足しても問い合わせないこと。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/databases/mysql.yml.tt#L12-L18`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Rails 8.1 が生成する MySQL の database.yml が max_connections を使うこと。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby（docs.ruby-lang.org）', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-22', version: 'Ruby 3.4', note: 'ブロックの引数を参照する it が追加されたこと。' },
  ],
}

export default chapter
