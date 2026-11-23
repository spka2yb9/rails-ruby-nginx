import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 73-1 商品の API の利用者と、変更で壊れる箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="73-1"
      w={780}
      h={350}
      label="モバイルアプリ v2.3（利用者の端末に残るバージョン）と v2.4（新しいバージョン）が、Rails のアプリの GET /api/v1/products/:id を呼ぶ。Rails のアプリはデプロイの間、古いコードのプロセスと新しいコードのプロセスが同時に動き、どちらも MySQL の products テーブルを読む。1回のデプロイで products の列 price を price_excluding_tax に変え、API の項目の名前も同じように変えた。1つ目の失敗は、古いコードのプロセスが price の列を読めずに 500（MissingAttributeError）を返すこと。2つ目の失敗は、v2.3 のアプリが新しい JSON に price がないので KeyError になり、商品の画面を開けないこと"
    >
      <Box x={20} y={58} w={170} h={56} lines={['モバイルアプリ v2.3', '利用者の端末に残る']} fs={12} bold subTone="muted" />
      <Box x={20} y={134} w={170} h={56} lines={['モバイルアプリ v2.4', '新しいバージョン']} fs={12} bold subTone="muted" />
      <Arrow x1={190} y1={86} x2={248} y2={86} />
      <Arrow x1={190} y1={162} x2={248} y2={162} />
      <T x={200} y={76} fs={13} tone="danger" bold>
        ②
      </T>

      <Box x={250} y={20} w={290} h={226} fill="bg" />
      <T x={266} y={42} fs={12} bold>
        Rails のアプリ（Puma）
      </T>
      <Box x={266} y={58} w={258} h={56} lines={['古いコードのプロセス', 'デプロイの間だけ残る（数分）']} fs={12} bold subTone="muted" />
      <Box x={266} y={134} w={258} h={56} lines={['新しいコードのプロセス', 'price_excluding_tax を返す']} fs={12} bold subTone="muted" />
      <T x={266} y={222} fs={11} tone="muted">
        どちらも GET /api/v1/products/:id を処理する
      </T>

      <Box x={600} y={96} w={160} h={56} lines={['MySQL', 'products テーブル']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={524} y1={86} x2={598} y2={114} accent />
      <Arrow x1={524} y1={162} x2={598} y2={136} />
      <T x={552} y={84} fs={13} tone="danger" bold>
        ①
      </T>
      <T x={604} y={176} fs={11} mono>
        rename_column
      </T>
      <T x={604} y={194} fs={11} mono>
        price →
      </T>
      <T x={604} y={212} fs={11} mono>
        price_excluding_tax
      </T>

      <T x={20} y={276} fs={12} tone="danger">
        ① 古いコードのプロセスは price の列を読めず、500（MissingAttributeError）を返す
      </T>
      <T x={20} y={298} fs={12} tone="danger">
        ② v2.3 のアプリは、新しい JSON に price がないので KeyError になり、商品の画面を開けない
      </T>
      <T x={20} y={334} fs={11} tone="muted">
        赤い番号は、この節で確かめる2つの失敗。緑の箱は DB。青い矢印は、列の名前が変わった後に失敗する読み込み
      </T>
    </Svg>
  )
}

/* ---------- 図 73-2 列と項目の名前を1回のデプロイで変えたときのタイムライン ---------- */
const tlCols = [
  { x: 150, lines: ['アプリ v2.3', '利用者の端末'], fill: 'box' as const },
  { x: 290, lines: ['古いプロセス', '古いコード'], fill: 'box' as const },
  { x: 430, lines: ['db:migrate', 'マイグレーション'], fill: 'box' as const },
  { x: 570, lines: ['新しいプロセス', '新しいコード'], fill: 'box' as const },
  { x: 705, lines: ['MySQL', 'products'], fill: 'box4' as const },
]

function TimelineFigure() {
  return (
    <Svg
      id="73-2"
      w={780}
      h={430}
      label="縦は時間、列は関係者。デプロイの前、アプリ v2.3 の要求を古いプロセスが処理し、price のある JSON を 200 で返す。次に db:migrate が products の列 price を price_excluding_tax に変える。その後に古いプロセスが受けた要求は、price の列を読めずに 500（MissingAttributeError）になる。Puma のプロセスを新しいコードに入れ替えた後は、新しいプロセスが 200 を返すが、JSON に price がないので、v2.3 のアプリは KeyError になり商品の画面を開けない。この状態は、利用者が v2.4 に更新するまで続く"
    >
      {tlCols.map((c) => (
        <g key={c.lines[0]}>
          <Box x={c.x - 55} y={10} w={110} h={44} lines={c.lines} fs={12} fill={c.fill} bold subTone="muted" />
          <line x1={c.x} y1={54} x2={c.x} y2={336} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <T x={8} y={92} fs={10} tone="muted">
        デプロイの前
      </T>
      <T x={8} y={146} fs={10} tone="muted">
        マイグレーション
      </T>
      <T x={8} y={200} fs={10} tone="muted">
        マイグレーション後
      </T>
      <T x={8} y={302} fs={10} tone="muted">
        入れ替えの後
      </T>

      <Arrow x1={150} y1={84} x2={288} y2={84} />
      <T x={158} y={76} fs={11}>
        GET
      </T>
      <Arrow x1={290} y1={104} x2={152} y2={104} dashed />
      <T x={158} y={118} fs={11}>
        200（price あり）
      </T>

      <Arrow x1={430} y1={146} x2={703} y2={146} accent />
      <T x={438} y={138} fs={11} tone="acc">
        rename_column
      </T>

      <Arrow x1={150} y1={184} x2={288} y2={184} />
      <T x={158} y={176} fs={11}>
        GET
      </T>
      <Arrow x1={290} y1={204} x2={152} y2={204} dashed />
      <T x={158} y={217} fs={11} tone="danger">
        500
      </T>
      <T x={158} y={230} fs={10} tone="danger">
        MissingAttributeError
      </T>

      <rect x={100} y={236} width={670} height={30} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={435} y={251} anchor="middle" fs={12} tone="muted">
        Puma のプロセスを新しいコードに入れ替える（数分）
      </T>

      <Arrow x1={150} y1={294} x2={568} y2={294} />
      <T x={300} y={286} fs={11}>
        GET
      </T>
      <Arrow x1={570} y1={314} x2={152} y2={314} dashed />
      <T x={300} y={328} fs={11}>
        200（price がなく、price_excluding_tax がある）
      </T>
      <line x1={150} y1={340} x2={150} y2={392} stroke="var(--fig-danger)" strokeWidth={4} />
      <T x={160} y={356} fs={11} tone="danger">
        KeyError：商品の画面を開けない
      </T>
      <T x={160} y={374} fs={11} tone="danger">
        利用者が v2.4 に更新するまで続く（数か月）
      </T>
      <T x={8} y={418} fs={11} tone="muted">
        本番の環境（RAILS_ENV=production）で Puma を起動して確かめた。アプリ v2.3 の読み方は Ruby で書いたもので再現した
      </T>
    </Svg>
  )
}

/* ---------- 図 73-4 expand・migrate・contract の手順（API と DB） ---------- */
const ecPhases = [
  { x: 150, title: 'expand（広げる）' },
  { x: 360, title: 'migrate（移す）' },
  { x: 570, title: 'contract（縮める）' },
]
const ecApi = [
  ['price を残し、', 'price_excluding_tax と', 'price_including_tax を足す'],
  ['アプリ v2.4 を出し、', 'バージョンごとの', '要求を数える'],
  ['v2.3 以前がなくなったら', 'price を消す。取引先には', 'v2 と終了日を知らせる'],
]
const ecDb = [
  ['① 新しい列を足す', '② 両方の列に書く'],
  ['③ 過去の行を補完する', '④ 読む列を変える'],
  ['⑤ 古い列を無視してから', '消す'],
]

function ExpandContractFigure() {
  return (
    <Svg
      id="73-4"
      w={780}
      h={360}
      label="変更を expand（広げる）、migrate（移す）、contract（縮める）の3つに分ける。API の項目では、expand で price を残したまま price_excluding_tax と price_including_tax を足し、migrate でアプリ v2.4 を出してバージョンごとの要求を数え、contract で v2.3 以前がなくなったら price を消す。取引先には v2 と終了日を知らせる。DB の列では、図 31-4 の手順のとおり、expand で新しい列を足して両方の列に書き、migrate で過去の行を補完して読む列を変え、contract で古い列を無視してから消す。この章では列の名前を変えず、alias_attribute でコードの中の名前だけを変えた"
    >
      {ecPhases.map((p) => (
        <Box key={p.title} x={p.x} y={14} w={200} h={40} lines={p.title} fs={13} fill="box5" bold />
      ))}
      <Arrow x1={350} y1={34} x2={358} y2={34} />
      <Arrow x1={560} y1={34} x2={568} y2={34} />

      <T x={20} y={100} fs={12} bold>
        API の項目
      </T>
      <T x={20} y={118} fs={11} tone="muted">
        この章で行う
      </T>
      {ecApi.map((lines, i) => (
        <Box key={lines[0]} x={ecPhases[i].x} y={70} w={200} h={80} lines={lines} fs={12} />
      ))}

      <T x={20} y={206} fs={12} bold>
        DB の列
      </T>
      <T x={20} y={224} fs={11} tone="muted">
        図 31-4 の手順
      </T>
      {ecDb.map((lines, i) => (
        <Box key={lines[0]} x={ecPhases[i].x} y={176} w={200} h={80} lines={lines} fs={12} fill="box4" dashed />
      ))}

      <T x={20} y={290} fs={12} bold>
        古い利用者が
      </T>
      <T x={20} y={308} fs={12} bold>
        残る期間
      </T>
      <T x={150} y={290} fs={12}>
        API：利用者が端末のアプリを更新するまで（数か月）
      </T>
      <T x={150} y={308} fs={12}>
        DB：古いコードのプロセスが入れ替わるまで（デプロイ数回分）
      </T>
      <T x={20} y={344} fs={11} tone="muted">
        この章では列の名前を変えず、alias_attribute でコードの中の名前だけを変えた。そのため DB の行は破線にした
      </T>
    </Svg>
  )
}

/* ---------- 図 73-6 直す前と直した後：古い利用者ごとの結果 ---------- */
const cmpRows = [
  {
    who: ['古いコードのプロセス', 'デプロイの間'],
    before: ['失敗：500 を返す', 'MissingAttributeError'],
    after: ['成功：200 を返す', '列の名前を変えない'],
  },
  {
    who: ['アプリ v2.3', '利用者の端末に残る'],
    before: ['失敗：商品の画面を開けない', 'price がなく KeyError'],
    after: ['成功：price を読める', 'price を残した'],
  },
  {
    who: ['アプリ v2.4', '新しいバージョン'],
    before: ['成功：新しい項目を読める', ''],
    after: ['成功：新しい項目を読める', ''],
  },
  {
    who: ['古い形を消す時期', ''],
    before: ['デプロイと同時', '利用者の移行を待たない'],
    after: ['バージョンごとの要求を数え、', 'v2.3 以前がなくなってから'],
  },
]

function CompareFigure() {
  return (
    <Svg
      id="73-6"
      w={780}
      h={392}
      label="直す前は、1回のデプロイで列の名前と API の項目の名前を変えた。古いコードのプロセスは 500（MissingAttributeError）を返し、アプリ v2.3 は price がなく KeyError で商品の画面を開けず、アプリ v2.4 だけが新しい項目を読めた。古い形はデプロイと同時に消えた。直した後は、列の名前を変えずに alias_attribute を使い、API には新しい項目を足して price を残した。古いコードのプロセスは 200 を返し、v2.3 は price を読め、v2.4 は新しい項目を読めた。古い形は、バージョンごとの要求を数え、v2.3 以前がなくなってから消す"
    >
      <Box x={230} y={14} w={260} h={50} lines={['直す前', '列と項目の名前を1回で変える']} fs={12} bold subTone="muted" />
      <Box x={500} y={14} w={260} h={50} lines={['直した後', '項目を足し、列は変えない']} fs={12} fill="box5" bold subTone="muted" accent />
      {cmpRows.map((r, i) => (
        <g key={r.who[0]}>
          <Box x={20} y={76 + i * 66} w={200} h={56} lines={r.who.filter((s) => s)} fs={12} fill="bg" bold subTone="muted" />
          <Box
            x={230}
            y={76 + i * 66}
            w={260}
            h={56}
            lines={r.before.filter((s) => s)}
            fs={12}
            fill={r.before[0].startsWith('失敗') ? 'bg' : 'box'}
            subTone={r.before[0].startsWith('失敗') ? 'danger' : 'muted'}
          />
          <Box x={500} y={76 + i * 66} w={260} h={56} lines={r.after.filter((s) => s)} fs={12} fill="box" subTone="muted" />
        </g>
      ))}
      <T x={232} y={366} fs={11} tone="danger">
        赤い文字は、この章の最初の節で実行して失敗した箇所
      </T>
      <T x={20} y={384} fs={11} tone="muted">
        直した後の結果は、バージョンごとの読み方のテスト（spec/requests/mobile_app_contract_spec.rb）で確かめた
      </T>
    </Svg>
  )
}

/* ---------- 図 73-5 API のバージョンと非推奨の期間 ---------- */
function SunsetFigure() {
  return (
    <Svg
      id="73-5"
      w={780}
      h={360}
      label="取引先など、こちらから更新を求められない利用者がいる場合の流れ。2026年11月22日に v1 に新しい項目を足す（expand）。2026年12月1日に price のない v2 を公開し、v1 の応答に Deprecation、Sunset、Link のヘッダーを付けて、非推奨であることと終了の予定日を知らせる。この非推奨の期間に、利用者に v2 へ移ってもらう。終了日の2027年12月1日を過ぎると、v1 は 410 Gone を返す。v2 はその後も応答する"
    >
      <T x={14} y={68} fs={12} mono bold>
        /api/v1
      </T>
      <rect x={90} y={50} width={80} height={30} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={130} y={65} anchor="middle" fs={11}>
        項目を足した
      </T>
      <rect x={170} y={50} width={460} height={30} rx={4} fill="var(--fig-box5)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={400} y={65} anchor="middle" fs={12} tone="acc">
        非推奨の期間：Deprecation・Sunset・Link のヘッダーを付ける
      </T>
      <rect x={630} y={50} width={130} height={30} rx={4} fill="var(--fig-bg)" stroke="var(--fig-danger)" />
      <T x={695} y={65} anchor="middle" fs={12} tone="danger">
        410 Gone
      </T>

      <T x={14} y={128} fs={12} mono bold>
        /api/v2
      </T>
      <rect x={170} y={110} width={590} height={30} rx={4} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={465} y={125} anchor="middle" fs={12}>
        price のない形（price_excluding_tax・price_including_tax）
      </T>

      <T x={14} y={186} fs={12} bold>
        利用者
      </T>
      <Arrow x1={180} y1={186} x2={620} y2={186} accent />
      <T x={400} y={178} anchor="middle" fs={11} tone="acc">
        v1 から v2 に移ってもらう
      </T>
      <T x={640} y={180} fs={11} tone="danger">
        移っていない利用者は
      </T>
      <T x={640} y={196} fs={11} tone="danger">
        410 を受け取る
      </T>

      <line x1={90} y1={232} x2={760} y2={232} stroke="var(--fig-line)" />
      {[
        { x: 90, l1: '2026-11-22', l2: 'expand' },
        { x: 170, l1: '2026-12-01', l2: 'v2 を公開' },
        { x: 630, l1: '2027-12-01', l2: '終了日（Sunset）' },
      ].map((t) => (
        <g key={t.l1}>
          <line x1={t.x} y1={40} x2={t.x} y2={238} stroke="var(--fig-line)" strokeDasharray="3 4" />
          <T x={t.x} y={252} anchor="middle" fs={11} mono>
            {t.l1}
          </T>
          <T x={t.x} y={268} anchor="middle" fs={11} tone="muted">
            {t.l2}
          </T>
        </g>
      ))}

      <T x={14} y={304} fs={11} mono>
        Deprecation: @1796083200（2026-12-01 00:00:00 UTC。RFC 9745）
      </T>
      <T x={14} y={322} fs={11} mono>
        Sunset: Wed, 01 Dec 2027 00:00:00 GMT（RFC 8594）
      </T>
      <T x={14} y={348} fs={11} tone="muted">
        横の位置は時間に比例しない。ヘッダーの値は、この章の spec/requests/api/sunset_spec.rb で確かめた値
      </T>
    </Svg>
  )
}

/* ---------- 図 73-7 古い利用者が残る期間と、互換性の保ち方 ---------- */
const judgeRows = [
  { span: ['なし', '同じデプロイで直せる'], who: ['アプリの中のメソッド', 'ビュー・同じリポジトリの画面'], how: ['互換のための層を作らず、', '呼び出し元をまとめて直す'] },
  { span: ['数分〜数時間', 'デプロイの間'], who: ['デプロイ中の古いプロセス', 'キューに残ったジョブ'], how: ['1〜2回のデプロイに分ける', '列の変更は図 31-4 の手順'] },
  { span: ['数か月', '更新は利用者しだい'], who: ['利用者の端末のアプリ', ''], how: ['項目を足し、バージョンごとに要求を数え、', '最低バージョンを上げてから消す'] },
  { span: ['決めた期間', '相手の都合で更新する'], who: ['取引先のシステム', '公開している API'], how: ['バージョンを分け、Deprecation と', 'Sunset で終了日を知らせる'] },
]

function JudgeFigure() {
  return (
    <Svg
      id="73-7"
      w={780}
      h={420}
      label="古い利用者が残る期間ごとに、互換性の保ち方を決める表。期間がない（同じデプロイで直せる）アプリの中のメソッドやビューは、互換のための層を作らず、呼び出し元をまとめて直す。数分から数時間残るデプロイ中の古いプロセスやキューに残ったジョブは、1〜2回のデプロイに分け、列の変更は図 31-4 の手順に従う。数か月残る利用者の端末のアプリは、項目を足し、バージョンごとに要求を数え、最低バージョンを上げてから消す。決めた期間残る取引先のシステムや公開している API は、バージョンを分け、Deprecation と Sunset で終了日を知らせる。期間が長いほど、互換性を保つ費用は大きい。当てはめすぎは、期間を決めずに古い形を残すことと、項目を足すだけの変更でバージョンを増やすこと"
    >
      <Box x={50} y={14} w={190} h={36} lines="古い利用者が残る期間" fs={12} fill="bg" bold />
      <Box x={250} y={14} w={220} h={36} lines="例" fs={12} fill="bg" bold />
      <Box x={480} y={14} w={280} h={36} lines="互換性の保ち方" fs={12} fill="bg" bold />
      {judgeRows.map((r, i) => (
        <g key={r.span[0]}>
          <Box x={50} y={60 + i * 68} w={190} h={58} lines={r.span} fs={12} bold subTone="muted" />
          <Box x={250} y={60 + i * 68} w={220} h={58} lines={r.who.filter((s) => s)} fs={12} fill="box4" />
          <Box x={480} y={60 + i * 68} w={280} h={58} lines={r.how} fs={12} fill={i === 0 ? 'box' : 'box5'} />
        </g>
      ))}
      <Arrow x1={26} y1={64} x2={26} y2={322} accent />
      <T x={20} y={344} fs={11} tone="acc">
        下ほど、古い利用者が長く残り、互換性を保つ費用が大きい
      </T>
      <T x={20} y={372} fs={12} tone="danger">
        当てはめすぎ：期間を決めずに古い形を残す。項目を足すだけの変更でバージョンを増やす
      </T>
      <T x={20} y={392} fs={12} tone="danger">
        → バージョンの数だけ直す場所が増え、どれかを直し忘れる（当てはめすぎの節）
      </T>
      <T x={20} y={414} fs={11} tone="muted">
        右の列の2〜4行目は、互換性のために古い形を一定の期間残す保ち方
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 92,
  part: 8,
  title: 'Backward Compatibility：API の項目名と DB の列名を、利用者を壊さずに変える',
  summary:
    'API の項目名と DB の列名を1回のデプロイで変えたために、デプロイ中の古いプロセスが 500 を返し、利用者の端末に残る古いモバイルアプリが商品を読めなくなる場面から始めます。Semantic Versioning、Rails のメンテナンスポリシー、Google の AIP-180 で後方互換性の意味と変更の種類を確かめ、項目を足す・バージョンごとの読み方をテストする・バージョンごとの要求を数える・終了日を知らせて古い形を消す、という expand/contract の順で直します。最後に、API のバージョンを増やし続ける当てはめすぎと、Rails の非推奨の警告やジョブの引数の扱いを取り上げます。',
  goals: [
    'API の項目の名前の変更・削除・型や意味の変更が古い利用者を壊す理由を、項目の追加と比べて説明できる',
    'デプロイ中の古いプロセス、キューに残ったジョブ、利用者の端末に残るアプリなど、新しいコードと同時に動く古い利用者を挙げられる',
    '変更を expand（広げる）・migrate（移す）・contract（縮める）に分け、API と DB の変更の順序を決められる',
    'バージョンごとの読み方のテスト、バージョンごとの要求の数、Deprecation と Sunset のヘッダーを使って、古い形を消す時期を決められる',
    '古いバージョンや互換のためのコードを残し続ける当てはめすぎを避け、利用者の種類ごとに互換性を保つ期間を決められる',
    'Rails の非推奨の警告・load_defaults・ジョブの引数の扱いを、後方互換性の道具として使える',
  ],
  prerequisites: [27, 18],
  sections: [
    {
      id: 'scene',
      title: 'API の項目名と列名を1回のデプロイで変え、古いプロセスと古いアプリが失敗する',
      body: (
        <>
          <p>
            この章では EC サイトの商品の API を例に、<Term en="Backward Compatibility">Backward Compatibility</Term>（後方互換性）を扱います。後方互換性は既存の利用者やシステムとの互換性を保ち、変更による破壊的な影響を抑えるという原則です。まず、API の項目名と DB の列名を一度に変えるコードを動かして、どの利用者が失敗するかを確かめます。
          </p>
          <h3>そもそも、商品の API を誰が使っているのか</h3>
          <p>
            EC サイトには、iPhone と Android のモバイルアプリがあります。アプリの商品の画面は Rails のアプリの <code>GET /api/v1/products/:id</code> を呼び、返ってきた JSON の商品名と価格を表示します。この API を呼ぶプログラムが、API の<Term en="consumer">利用者</Term>です。
          </p>
          <p>
            モバイルアプリはアプリストアから配布します。新しいバージョンを出しても、利用者の端末に入っているバージョンは、その利用者が更新するまで変わりません。そのため、新しいバージョンを出した後も数か月の間、古いバージョンのアプリが同じ API を呼び続けます。この章では利用者の端末に残っているバージョンを v2.3、次に出すバージョンを v2.4 とします。
          </p>
          <p>
            Rails のアプリの側にも、古いコードが残る時間があります。デプロイでは Puma のプロセスを1つずつ新しいコードに入れ替えるので、入れ替えの途中は、古いコードのプロセスと新しいコードのプロセスが同時に動き、同じ DB を使います（<ChapterLink n={23} section="puma-commands" />）。この古いプロセスも DB のテーブルの利用者です。
          </p>
          <p>商品のテーブルと API は次のとおりです。price は税抜きの価格（円）です。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_products.rb"
            code={`
class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.integer :price, null: false # 税抜きの価格（円）
      t.timestamps
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/product.rb・app/controllers/api/base_controller.rb・app/controllers/api/v1/products_controller.rb（直す前）"
            code={`
class Product < ApplicationRecord
end

module Api
  class BaseController < ActionController::API
  end
end

module Api
  module V1
    class ProductsController < Api::BaseController
      def show
        product = Product.find(params[:id])
        render json: { id: product.id, name: product.name, price: product.price }
      end
    end
  end
end
`}
          />
          <p>
            アプリが JSON を読む処理は Swift や Kotlin で書かれていますが、この章では同じ読み方を Ruby で書き、RSpec からサーバーの API に向けて実行します。v2.3 は画面に出す項目を必須の項目として読みます。<code>Hash#fetch</code> はキーがなければ KeyError を投げるので、項目が1つでもなければ、商品の画面を開けません。<code>Data.define</code> は値を持つだけのクラスを作る Ruby の機能です。
          </p>
          <Code
            lang="ruby"
            title="spec/support/mobile_app.rb（v2.3 の読み方）"
            code={`
# モバイルアプリが商品の JSON を読む処理を、Ruby で同じ形に書いたもの。
# アプリは画面に出す項目を必須として読む。項目がなければ例外になり、商品の画面を開けない
module MobileApp
  ProductV23 = Data.define(:id, :name, :price) # price は税抜きの価格

  # v2.3（いま利用者の端末に入っているバージョン）の読み方
  def self.read_product_v2_3(json)
    ProductV23.new(id: json.fetch("id"), name: json.fetch("name"), price: json.fetch("price"))
  end
end
`}
          />
          <h3>price の名前を変えるプルリクエスト</h3>
          <p>
            アプリのチームから「price が税抜きか税込みかわからない」という問い合わせが続いたので、サーバーのチームは名前を price_excluding_tax（税抜きの価格）に変え、税込みの価格 price_including_tax も返すことにしました。1つのプルリクエストで、列の名前、モデル、API の項目の名前、テストを次のように変えました。
          </p>
          <Code
            lang="ruby"
            title="プルリクエストで変えた4つのファイル"
            code={`
# db/migrate/20261122000002_rename_price_to_price_excluding_tax.rb
class RenamePriceToPriceExcludingTax < ActiveRecord::Migration[8.1]
  def change
    rename_column :products, :price, :price_excluding_tax
  end
end

# app/models/product.rb
class Product < ApplicationRecord
  # 税込みの価格（消費税 10%。1円未満は切り捨て）
  def price_including_tax = price_excluding_tax * 110 / 100
end

# app/controllers/api/v1/products_controller.rb（show だけを抜き出した）
      def show
        product = Product.find(params[:id])
        render json: { id: product.id, name: product.name,
                       price_excluding_tax: product.price_excluding_tax,
                       price_including_tax: product.price_including_tax }
      end

# spec/requests/api/v1/products_spec.rb
require "rails_helper"

RSpec.describe "GET /api/v1/products/:id", type: :request do
  it "税抜きと税込みの価格を返す" do
    product = Product.create!(name: "ノートPCスタンド", price_excluding_tax: 4980)
    get "/api/v1/products/#{product.id}"
    expect(response.parsed_body).to include("price_excluding_tax" => 4980, "price_including_tax" => 5478)
  end
end
`}
          />
          <h3>デプロイの途中で、古いプロセスが 500 を返す</h3>
          <p>
            まず、デプロイの途中を再現します。本番の環境（RAILS_ENV=production）で古いコードの Puma を起動して要求を1回送り、列の名前を変えるマイグレーションを実行してから、同じプロセスにもう一度要求を送りました。
          </p>
          <Code
            lang="bash"
            title="script/scene/deploy_rename.sh"
            code={`
# 古いコードの Puma が動いている間に、列の名前を変えるマイグレーションを実行する
bin/rails server -p 3000 > log/puma.log 2>&1 &
until curl -s -o /dev/null http://127.0.0.1:3000/api/v1/products/1; do sleep 0.5; done

echo "--- マイグレーションの前（古いコード）"
curl -s -w "  (%{http_code})\\n" http://127.0.0.1:3000/api/v1/products/1

cp script/scene/20261122000002_rename_price_to_price_excluding_tax.rb db/migrate/
bin/rails db:migrate

echo "--- マイグレーションの後（同じ古いコード）"
curl -s -o /dev/null -w "%{http_code}\\n" http://127.0.0.1:3000/api/v1/products/1
grep -E "Completed 500|MissingAttributeError" log/puma.log | sed "s/^\\[[^]]*\\] //" # request_id の部分を除く
kill %1
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production bash script/scene/deploy_rename.sh）"
            code={`
--- マイグレーションの前（古いコード）
{"id":1,"name":"ノートPCスタンド","price":4980}  (200)
Migrating to RenamePriceToPriceExcludingTax (20261122000002)
== 20261122000002 RenamePriceToPriceExcludingTax: migrating ===================
-- rename_column(:products, :price, :price_excluding_tax)
   -> 0.0320s
== 20261122000002 RenamePriceToPriceExcludingTax: migrated (0.0321s) ==========

--- マイグレーションの後（同じ古いコード）
500
Completed 500 Internal Server Error in 2ms (ActiveRecord: 0.5ms (1 query, 0 cached) | GC: 0.0ms)
ActiveModel::MissingAttributeError (missing attribute 'price' for Product):
`}
          />
          <p>
            マイグレーションの前、古いプロセスは price のある JSON を 200 で返しました。マイグレーションの後、同じプロセスは 500 を返し、ログには ActiveModel::MissingAttributeError が出ました。Active Record のモデルは、列の一覧を最初に使うときに DB から読み込み、その後も使い続けます。古いプロセスの Product は price の列がある前提で行を読み、price を取り出そうとして失敗しました。この仕組みと、行を書き込むときの失敗は <ChapterLink n={27} section="live-change" /> で確かめたので、ここでは繰り返しません。
          </p>
          <p>
            同じ実験を開発の環境で行うと、起きる例外が変わりました。開発の環境では、db:migrate が db/schema.rb を書き換えると、Rails がその変化を見つけてアプリのコードを読み込み直します<Ref n={17} />。Product が新しい列の一覧を読み直すので、失敗は NoMethodError（undefined method 'price'）になりました。本番の環境は読み込み直さないので、本番で起きる失敗を確かめるときは、本番の環境の設定で起動します。
          </p>
          <h3>デプロイの後、古いアプリが新しい JSON を読めない</h3>
          <p>次に、デプロイが終わった後を再現します。新しいコードのサーバーに、v2.3 の読み方で要求を送りました。</p>
          <Code
            lang="ruby"
            title="spec/requests/mobile_app_v2_3_spec.rb"
            code={`
require "rails_helper"

# モバイルアプリ v2.3 の読み方で、サーバーの API を読む
RSpec.describe "モバイルアプリ v2.3 から商品を読む", type: :request do
  it "商品名と価格を読める" do
    product = Product.create!(name: "ノートPCスタンド", price_excluding_tax: 4980)
    get "/api/v1/products/#{product.id}"
    app_product = MobileApp.read_product_v2_3(response.parsed_body)
    expect([app_product.name, app_product.price]).to eq(["ノートPCスタンド", 4980])
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec。プルリクエストで直した products_spec.rb も一緒に実行した）"
            code={`
.F

Failures:

  1) モバイルアプリ v2.3 から商品を読む 商品名と価格を読める
     Failure/Error: ProductV23.new(id: json.fetch("id"), name: json.fetch("name"), price: json.fetch("price"))

     KeyError:
       key not found: "price"
     # ./spec/support/mobile_app.rb:8:in 'MobileApp.read_product_v2_3'
     # ./spec/requests/mobile_app_v2_3_spec.rb:8:in 'block (2 levels) in <top (required)>'

2 examples, 1 failure
`}
          />
          <p>
            1つ目の「.」はプルリクエストで直したサーバーのテストで、これは通りました。2つ目の v2.3 の読み方は、JSON に price がないので KeyError になりました。実際のアプリでは、v2.3 の利用者が商品の画面を開けなくなります。サーバーのテストは新しい名前に合わせて直したので、CI（変更のたびにテストを自動で実行する仕組み）は失敗しません。古いアプリの読み方がサーバーのテストに入っていないからです。
          </p>
          <Figure n="73-1" title="商品の API の利用者と、変更で壊れる箇所" caption="赤い番号は、この節で実行して確かめた失敗。">
            <SceneFigure />
          </Figure>
          <p>
            図 73-1 はこの場面の利用者と、失敗した2つの箇所を示したものです。API の利用者は端末のアプリで、DB のテーブルの利用者は Rails のプロセスです。1つのプルリクエストがこの2種類の利用者との約束を同時に変えました。
          </p>
          <Figure n="73-2" title="列と項目の名前を1回のデプロイで変えたときのタイムライン" caption="縦は時間、列は関係者。入れ替えの数分と、アプリの更新を待つ数か月は、同じ縮尺ではない。">
            <TimelineFigure />
          </Figure>
          <p>
            図 73-2 は2つの失敗を時間の順に並べたものです。古いプロセスの失敗は、プロセスの入れ替えが終わる数分で止まります。アプリ v2.3 の失敗は、利用者が v2.4 に更新するまで続きます。コードだけを前のバージョンに戻しても、列の名前は変わったままなので、古いコードは列を読めません（戻し方の考え方は <ChapterLink n={27} section="recovery" />）。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>DB の列の名前と API の項目の名前という、利用者の違う2つの約束を、1回のデプロイで変えました。</li>
            <li>デプロイ中の古いプロセスは、列の名前が変わると行を読めず、500 を返します。</li>
            <li>端末に残る v2.3 のアプリは price を読めず、利用者が更新するまで商品の画面を開けません。</li>
            <li>サーバーのテストを新しい名前に合わせて直したので CI は通り、古い利用者の読み方を確かめるテストがありません。</li>
            <li>コードだけを戻しても列の名前は戻らないので、失敗に気づいても、元の状態にすぐには戻せません。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '後方互換性の意味と、SemVer・Rails・AIP-180 の決まり',
      body: (
        <>
          <h3>後方互換性の定義</h3>
          <p>
            Backward Compatibility（後方互換性）は、既存の利用者やシステムとの互換性を保ち、変更による破壊的な影響を抑えるという原則です。提供する側（API、DB のテーブル、ライブラリ）を新しくしても、古いバージョンに合わせて作られた利用者が、それまでどおりに動くようにします。この章の場面では、v2.3 のアプリと古いコードのプロセスが、新しいサーバーと新しいテーブルを相手にしても動き続けることにあたります。
          </p>
          <p>
            逆の向きの<Term en="forward compatibility">前方互換性</Term>は、古い側が新しい側の作ったデータや要求を扱えることです。たとえば、新しいコードがキューに入れたジョブを、デプロイ中の古いワーカーが実行できることです（Rails の機能との関係の節で確かめます）。
          </p>
          <p>
            後方互換性は、特定の人が論文や書籍で名付けた原則ではありません。ソフトウェアを提供する側が守る決まりとして、いくつかの文書に書かれています。この節では Semantic Versioning、Rails のメンテナンスポリシー、Google の API の設計の指針を見ます。
          </p>
          <h3>Semantic Versioning：公開する API を決め、互換性をバージョン番号で伝える</h3>
          <p>
            Semantic Versioning（SemVer）2.0.0 は Tom Preston-Werner が書いた、バージョン番号の付け方の決まりです<Ref n={1} />。バージョン番号を MAJOR.MINOR.PATCH の3つの数で表し、次のように上げます<Ref n={1} />。
          </p>
          <ul>
            <li>MAJOR：互換性のない API の変更をしたとき</li>
            <li>MINOR：後方互換性を保って機能を足したとき</li>
            <li>PATCH：後方互換性を保ってバグを直したとき</li>
          </ul>
          <p>
            SemVer はこの決まりを使う前提として、公開する API（public API）を決め、文書かコードで示すよう求めています<Ref n={1} />。互換性は公開すると決めたものについて守るので、何を公開するかを先に決めます。この章では、API の JSON の項目の名前・型・意味が、アプリとの約束にあたります。
          </p>
          <p>
            機能を消す手順も SemVer の FAQ に書かれています。<Term en="deprecation">非推奨</Term>は、まだ使えるが将来消す予定なので、使うのをやめてほしいと利用者に知らせることです。非推奨にする部分を文書で知らせ、非推奨を含む MINOR バージョンを出します。MAJOR バージョンで完全に消す前に、非推奨を含む MINOR バージョンを少なくとも1回出し、利用者が新しい API に移れるようにします<Ref n={1} />。
          </p>
          <h3>Rails のメンテナンスポリシー：互換性のない変更の前に、非推奨の警告を出す</h3>
          <p>
            Rails は SemVer をずらした形（a shifted version of semver）でバージョン番号を付けると、メンテナンスポリシーに書いています<Ref n={2} />。PATCH はバグの修正だけで、API を変えません。MINOR は新しい機能を含み、API の変更を含むことがあり、SemVer の MAJOR にあたります。MAJOR との違いは互換性のない変更の大きさです。そのうえで、互換性のない変更には1つ前の MINOR か MAJOR バージョンで非推奨の通知を出すと決めています<Ref n={2} />。
          </p>
          <p>
            Rails のアップグレードのガイドは、非推奨の警告を活かすために、MINOR バージョンを1つずつ上げるよう勧めています<Ref n={3} />。7.2 から 8.1 へ上げるなら、8.0 に上げて警告を直してから、8.1 に上げます。Rails 自身も利用者（Rails を使うアプリケーション）を壊す前に警告を出し、移る時間を作っています。
          </p>
          <h3>AIP-180：どの変更が互換性を壊すか</h3>
          <p>
            Google の API の設計の指針（API Improvement Proposals）の AIP-180「Backwards compatibility」（2019年）は、API を利用者との約束（contract）と呼び、同じ MAJOR バージョンの中では、古いクライアントが新しいサーバーで動かなければならないとしています<Ref n={4} />。そのうえで、互換性を次の3つに分けています<Ref n={4} />。
          </p>
          <ul>
            <li>ソースの互換性：古いバージョンに向けて書いたコードが、新しいバージョンでもコンパイルでき、動くこと。</li>
            <li>ワイヤー（通信）の互換性：古いバージョンに向けて書いたコードが、新しいサーバーと正しく通信できること。入力と出力に加えて、データを送れる形に変える方法（シリアライズ）の前提も合っていること。</li>
            <li>意味の互換性：古いバージョンに向けて書いたコードが、多くの開発者が期待するとおりの結果を受け取り続けること。</li>
          </ul>
          <p>
            変更の種類ごとの扱いも示しています<Ref n={4} />。項目を足すことは一般に同じ MAJOR バージョンの中で行ってよい変更です。ただし、サーバーが今まで返していた項目は、重複になっても返し続けます。項目を消すことは互換性のない変更で、名前を変えることは「消して足す」ことと同じだとしています。項目の型を変えること、値の形式や作り方を変えること、既定値を変えることも、互換性のない変更です。
          </p>
          <Figure n="73-3" title="変更の種類と、古い利用者への影響" caption="AIP-180 の分け方を、この章の JSON の項目・ジョブの引数・DB の列に当てはめた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">変更</th>
                    <th scope="col">この章の例</th>
                    <th scope="col">古い利用者に起きること</th>
                    <th scope="col">互換性</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>応答に項目を足す</td>
                    <td>price_including_tax を足す</td>
                    <td>読まない項目は無視される。知らないキーをエラーにする読み方では失敗する</td>
                    <td>あり（読む側が知らない項目を無視するなら）</td>
                  </tr>
                  <tr>
                    <td>応答の項目を消す・名前を変える</td>
                    <td>price を price_excluding_tax に変える</td>
                    <td>項目がなく KeyError になる（最初の節）</td>
                    <td>なし</td>
                  </tr>
                  <tr>
                    <td>項目の型や形式を変える</td>
                    <td>4980 を文字列の "4980" にする</td>
                    <td>数として読む利用者が失敗する</td>
                    <td>なし</td>
                  </tr>
                  <tr>
                    <td>項目の意味を変える</td>
                    <td>price を税込みの価格にする</td>
                    <td>読めるが、違う金額を表示する</td>
                    <td>なし（失敗しないので気づきにくい）</td>
                  </tr>
                  <tr>
                    <td>要求に省略できる引数を足す</td>
                    <td>ジョブに old_price: nil を足す</td>
                    <td>古い要求もこれまでどおりに処理される</td>
                    <td>あり</td>
                  </tr>
                  <tr>
                    <td>要求に必須の引数を足す</td>
                    <td>ジョブに old_price: を必須で足す</td>
                    <td>古い要求が ArgumentError になる（Rails の節）</td>
                    <td>なし</td>
                  </tr>
                  <tr>
                    <td>NULL を許す列を足す</td>
                    <td>add_column</td>
                    <td>古いプロセスは新しい列を使わずに動く</td>
                    <td>あり</td>
                  </tr>
                  <tr>
                    <td>列の名前を変える・列を消す</td>
                    <td>rename_column</td>
                    <td>古いプロセスが MissingAttributeError になる（最初の節）</td>
                    <td>なし</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 73-3 は AIP-180 の分け方を、この章の JSON・ジョブの引数・DB の列に当てはめた表です。最初の節のプルリクエストは price を消して price_excluding_tax を足す変更でした。price_including_tax を足すことは互換性のある変更なので、それだけなら古いアプリを壊しませんでした。意味を変える変更（price を税込みの価格にする）は、名前も型も同じなので読む側は失敗せず、違う金額を表示します。テストの失敗にも例外にもならないので、表の中で最も見つけにくい変更です。DB の列の扱いは <ChapterLink n={27} section="deploy-order" /> に従いました。
          </p>
          <h3>似た考え方との関係</h3>
          <ul>
            <li>
              Parallel Change：Danilo Sato は Martin Fowler のサイトの記事「Parallel Change」（2014年）で、互換性のないインターフェースの変更を安全に行うために、expand（広げる）・migrate（移す）・contract（縮める）の3つの段階に分ける方法を説明しています。expand and contract とも呼びます。expand で古い形と新しい形の両方を使えるようにし、migrate で利用者を新しい形に移し、すべての利用者が移ったら contract で古い形を消します。外部の利用者がいる場合は、migrate が最も長い段階になると書いています<Ref n={5} />。データベースのリファクタリングと、外部に公開する API の変更も、適用する例に挙げています<Ref n={5} />。<ChapterLink n={27} section="deploy-order" /> の列の変更も、次の節の API の変更も、この3つの段階で進めます。
            </li>
            <li>
              Tolerant Reader：Martin Fowler の「Tolerant Reader」（2011年）は、利用者の側の考え方です。サービスからデータを読むときは、必要な項目だけを読んでほかは無視し、構造についての仮定を最小にするよう勧めています。Jon Postel の「自分が行うことには慎重に、他人から受け取るものには寛容に」という言葉も引いています。さらに、利用者が自分の読み方とそのテストを提供する側に渡すと、提供する側は自分のビルドで、利用者を壊す変更を見つけられると書いています<Ref n={6} />。次の節のバージョンごとの読み方のテストは、この方法です。
            </li>
            <li>
              読む側が知らない項目を無視しないと、項目を足すだけの変更でも壊れます。Kotlin の JSON のライブラリ kotlinx.serialization は、既定では JSON の中の知らないキーを、読み込みのエラーにします。ignoreUnknownKeys を true にすると、知らないキーを無視します<Ref n={10} />。知らない項目を無視する読み方にすることも、アプリのチームと決めておきます。
            </li>
            <li>
              Hyrum's Law：Hyrum Wright は、API の利用者が十分に多くなると、約束に何を書いたかに関係なく、システムの観察できるすべての振る舞いに誰かが依存するようになると書いています<Ref n={7} />。文書に書いていない応答の速さや項目の並び順も、利用者が依存すれば変えにくくなります。当てはめすぎの節で使います。
            </li>
            <li>
              Information Hiding（<ChapterLink n={73} />）は、変わりうる設計判断をモジュールの中に隠し、変更が外に広がらないようにする原則でした。外に見せるものが少ないほど、後方互換性を守る対象も少なくなります。<ChapterLink n={70} /> でも、公開した名前はほかのチームとの約束になると書きました。OCP（<ChapterLink n={64} />）は、既存のコードを変えずに振る舞いを足せるようにする原則で、変更する側のコードの書き方を扱います。後方互換性は、変更した後も既存の利用者が動くかどうかを扱います。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '項目を足し、利用者を移してから、古い形を消す',
      body: (
        <>
          <h3>直す順序</h3>
          <p>Parallel Change の3つの段階に沿って、次の順に直します。</p>
          <ol>
            <li>変更を、互換性のある部分とない部分に分ける（図 73-3）。price_including_tax を足すのは互換性のある変更で、price の名前を変えるのは互換性のない変更です。</li>
            <li>古い利用者と、それが残る期間を挙げる。端末のアプリ v2.3 は数か月、デプロイ中の古いプロセスは数分です。</li>
            <li>expand：API には新しい名前の項目を足し、price を残す。DB の列の名前は変えない。</li>
            <li>サポートしているバージョンごとの読み方を、サーバーのテストに入れる。</li>
            <li>migrate：アプリ v2.4 を出し、バージョンごとの要求の数を数える。</li>
            <li>contract：v2.3 以前からの要求がなくなったら price を消す。数えられない利用者がいるときは、新しいバージョンの API を作り、古いバージョンの終了日を知らせる。</li>
          </ol>
          <h3>DB の列の名前は変えず、コードの中の名前だけを変える</h3>
          <p>
            最初の節の目的は、コードと API で price が税抜きの価格だとわかるようにすることでした。そのために DB の列の名前まで変える必要はありません。API の項目名と DB の列名は、利用者の違う別の約束なので、別々に変えられます。Active Record の <code>alias_attribute</code> は属性に別の名前を付けるメソッドです。新しい名前の読み書きのメソッドを作り、検索の条件に書いた新しい名前も、元の列の名前に変えます<Ref n={15} />。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb"
            code={`
class Product < ApplicationRecord
  # 新しいコードと API では price_excluding_tax と呼ぶ。DB の列は price のまま変えない
  alias_attribute :price_excluding_tax, :price

  # 税込みの価格（消費税 10%。1円未満は切り捨て）
  def price_including_tax = price_excluding_tax * 110 / 100
end
`}
          />
          <Code
            lang="ruby"
            title="script/alias_attribute.rb"
            code={`
# alias_attribute で付けた新しい名前で、読み書きと検索をする（bin/rails runner で実行する）
product = Product.create!(name: "ノートPCスタンド", price_excluding_tax: 4980)
puts "price_excluding_tax: #{product.price_excluding_tax}　price: #{product.price}"
puts Product.where(price_excluding_tax: 4980).to_sql
product.update!(price_excluding_tax: 4480)
puts "変更した属性: #{product.saved_changes.keys - ["updated_at"]}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/alias_attribute.rb）"
            code={`
price_excluding_tax: 4980　price: 4980
SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`price\` = 4980
変更した属性: ["price"]
`}
          />
          <p>
            price_excluding_tax で書いた値は price の列に入り、where の条件も price の列で検索しています。マイグレーションがないので、デプロイ中の古いプロセスも新しいプロセスも、同じ列を読み書きできます。BI のツールのように DB を直接読む利用者のために列の名前そのものを変えるときは、<ChapterLink n={27} section="deploy-order" />の手順で、新しい列を足し、両方の列に書き、過去の行を補完し、読む列を変え、古い列を無視してから消します。
          </p>
          <h3>API には新しい項目を足し、price を残す（expand）</h3>
          <Code
            lang="ruby"
            title="app/controllers/api/v1/products_controller.rb（expand の段階）"
            code={`
module Api
  module V1
    class ProductsController < Api::BaseController
      def show
        product = Product.find(params[:id])
        render json: {
          id: product.id,
          name: product.name,
          price: product.price_excluding_tax, # 古い名前。v2.3 以前のアプリが読むので残す
          price_excluding_tax: product.price_excluding_tax,
          price_including_tax: product.price_including_tax,
        }
      end
    end
  end
end
`}
          />
          <p>
            price は price_excluding_tax と同じ値を返します。AIP-180 のとおり、今まで返していた項目は重複になっても返し続けます<Ref n={4} />。新しい2つの項目は互換性のある追加なので、v2.3 のアプリは読まずに無視します。
          </p>
          <h3>サポートしているバージョンごとの読み方をテストにする</h3>
          <p>
            最初の節では v2.3 の読み方がサーバーのテストに入っていませんでした。アプリのチームと相談して、サポートしているバージョンごとの読み方を spec/support/mobile_app.rb に置き、サーバーのテストで実行します。Fowler が Tolerant Reader の記事で書いた、利用者の読み方とテストを提供する側に渡す方法です<Ref n={6} />。
          </p>
          <Code
            lang="ruby"
            title="spec/support/mobile_app.rb（v2.4 の読み方を足したもの）"
            code={`
module MobileApp
  ProductV23 = Data.define(:id, :name, :price) # price は税抜きの価格
  ProductV24 = Data.define(:id, :name, :price_excluding_tax, :price_including_tax)

  # …（省略。read_product_v2_3 は最初の節と同じ）

  # v2.4（新しい項目を読むバージョン）の読み方
  def self.read_product_v2_4(json)
    ProductV24.new(id: json.fetch("id"), name: json.fetch("name"),
                   price_excluding_tax: json.fetch("price_excluding_tax"),
                   price_including_tax: json.fetch("price_including_tax"))
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/mobile_app_contract_spec.rb"
            code={`
require "rails_helper"

# サポートしているアプリのバージョンごとの読み方で、サーバーの API を読む
RSpec.describe "モバイルアプリの読み方（サポートしているバージョン）", type: :request do
  let(:product) { Product.create!(name: "ノートPCスタンド", price_excluding_tax: 4980) }
  before { get "/api/v1/products/#{product.id}" }

  it "v2.3 は price を税抜きの価格として読む" do
    expect(MobileApp.read_product_v2_3(response.parsed_body).price).to eq(4980)
  end

  it "v2.4 は税抜きと税込みの価格を読む" do
    app_product = MobileApp.read_product_v2_4(response.parsed_body)
    expect([app_product.price_excluding_tax, app_product.price_including_tax]).to eq([4980, 5478])
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
GET /api/v1/products/:id
  税抜きと税込みの価格を返す

モバイルアプリの読み方（サポートしているバージョン）
  v2.3 は price を税抜きの価格として読む
  v2.4 は税抜きと税込みの価格を読む

3 examples, 0 failures
`}
          />
          <p>
            v2.3 は price を、v2.4 は新しい2つの項目を読めました。この後、誰かが price を消すと v2.3 の例が失敗し、CI でわかります。v2.3 の例を消すのは、v2.3 をサポートしないと決めたときです。
          </p>
          <Figure n="73-4" title="expand・migrate・contract の手順（API と DB）" caption="上の段がこの章で行う API の変更、下の段が図 31-4 の列の変更の手順。">
            <ExpandContractFigure />
          </Figure>
          <p>
            図 73-4 は API の項目と DB の列の変更を、Parallel Change の3つの段階に並べたものです。どちらも古い形と新しい形を両方使える期間を作り、利用者が移ったことを確かめてから古い形を消します。違うのは、古い利用者が残る期間です。DB の列の利用者は自分たちのプロセスなので、デプロイが数回終われば移ります。API の利用者は端末のアプリなので、利用者が更新するまで数か月残ります。
          </p>
          <h3>バージョンごとの要求を数える（migrate）</h3>
          <p>
            v2.4 を出した後も、v2.3 を使い続ける利用者がいます。price を消してよいかは、v2.3 以前からの要求がどれだけ残っているかで決めます。アプリは要求の X-App-Version ヘッダーで自分のバージョンを送るので、API の共通のコントローラーでバージョンをログに書きます。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/api/base_controller.rb と script/count_app_versions.rb"
            code={`
module Api
  class BaseController < ActionController::API
    before_action :log_app_version

    private

    # アプリは要求のヘッダーで自分のバージョンを送る（X-App-Version: 2.3.0）。バージョンごとの要求の数を、ログから数える
    def log_app_version
      logger.info("[api_client] app_version=#{request.headers["X-App-Version"] || "none"} path=#{request.path}")
    end
  end
end

# script/count_app_versions.rb
# ログの app_version を数え、price を読むバージョン（2.4.0 より前）からの要求の数を出す。バージョンを送らない要求（none）は数えない
counts = File.foreach(ARGV.fetch(0)).filter_map { |line| line[/app_version=([\\d.]+)/, 1] }.tally
counts.sort_by { |v, _| Gem::Version.new(v) }.each { |v, n| puts format("%-7s %3d 件", v, n) }

reads_price = counts.select { |v, _| Gem::Version.new(v) < Gem::Version.new("2.4.0") }
puts "price を読むバージョンからの要求: #{reads_price.values.sum} / #{counts.values.sum} 件"
puts %(文字列のまま比べると "2.10.0" < "2.4.0" は #{"2.10.0" < "2.4.0"})
`}
          />
          <p>
            本番の環境で Puma を起動し、試しに 2.3.0 から3回、2.3.1 から9回、2.4.0 から20回、2.10.0 から68回の要求を送ってから、ログを数えました。
          </p>
          <Code
            lang="text"
            title="実行結果（log/puma.log の1行と、ruby script/count_app_versions.rb log/puma.log）"
            code={`
[api_client] app_version=2.3.0 path=/api/v1/products/1

2.3.0     3 件
2.3.1     9 件
2.4.0    20 件
2.10.0   68 件
price を読むバージョンからの要求: 12 / 100 件
文字列のまま比べると "2.10.0" < "2.4.0" は true
`}
          />
          <p>
            price を読むバージョンからの要求は、100件中12件でした。バージョンを比べるときは Gem::Version を使います。バージョンの文字列をそのまま比べると "2.10.0" &lt; "2.4.0" が true になり、2.10.0 の68件まで古いバージョンに数えてしまいます。本番ではこの数を日ごとに集計するか、メトリクスとして記録します（<ChapterLink n={89} />）。
          </p>
          <p>
            price を消す時期はこの数と業務の判断で決めます。v2.3 以前からの要求がなくなるのを待つほかに、アプリの側でサポートする最低バージョンを決め、それより古いバージョンの利用者には更新を求める画面を出す方法もあります。最低バージョンを 2.4 に上げた後なら、v1 から price を消しても、サポートしているバージョンのアプリは動き続けます。消すときは、バージョンごとの読み方のテストからも v2.3 の例を消します。
          </p>
          <h3>数えられない利用者には、新しいバージョンと終了日を知らせる（contract）</h3>
          <p>
            取引先のシステムも同じ API を使っている場合は、取引先のコードがどの項目を読んでいるかをこちらでは数えられず、更新も求められません。SemVer では互換性のない変更を MAJOR バージョンで行います<Ref n={1} />。API なら、price のない形を /api/v2 で公開し、/api/v1 には終了の予定を知らせて、決めた日に終えます。
          </p>
          <p>
            HTTP にはこのためのヘッダーがあります。Deprecation（RFC 9745、2025年）は、応答した資源（URL で示すもの）が非推奨になる、または非推奨になった日時を、@ と UNIX 時刻（1970年1月1日からの秒数）で示します<Ref n={8} />。非推奨を示しても、資源の振る舞いは変わりません<Ref n={8} />。Sunset（RFC 8594、2019年）は、その資源が応答しなくなる予定の日時を示します<Ref n={9} />。RFC 9745 は Sunset の日時を Deprecation の日時より前にしてはならないことと、非推奨の説明のページを Link ヘッダーの rel="deprecation" で示せることも決めています<Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="app/serializers/product_json.rb と app/controllers/concerns/api_sunset.rb"
            code={`
# 商品の JSON。v2 の形を正とし、v1 は v2 に古い名前の price を足した形にする
module ProductJson
  def self.v2(product)
    { id: product.id, name: product.name,
      price_excluding_tax: product.price_excluding_tax, price_including_tax: product.price_including_tax }
  end

  def self.v1(product) = v2(product).merge(price: product.price_excluding_tax)
end

# 終わらせるバージョンの API に、非推奨（Deprecation、RFC 9745）と終了の予定（Sunset、RFC 8594）のヘッダーを付ける。
# 終了の日時を過ぎたら 410 Gone を返す
module ApiSunset
  extend ActiveSupport::Concern

  class_methods do
    def sunset(deprecated_at:, sunset_at:, link:)
      before_action do
        if Time.current >= sunset_at
          render json: { error: "このバージョンの API は終了しました", link: }, status: :gone
        else
          response.headers["Deprecation"] = "@#{deprecated_at.to_i}"
          response.headers["Sunset"] = sunset_at.httpdate
          response.headers["Link"] = %(<#{link}>; rel="deprecation"; type="text/html")
        end
      end
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/api/v1/products_controller.rb と app/controllers/api/v2/products_controller.rb"
            code={`
module Api
  module V1
    class ProductsController < Api::BaseController
      include ApiSunset
      sunset deprecated_at: Time.utc(2026, 12, 1), sunset_at: Time.utc(2027, 12, 1),
             link: "https://developer.example.com/api/v1-sunset"

      def show
        render json: ProductJson.v1(Product.find(params[:id]))
      end
    end
  end
end

module Api
  module V2
    class ProductsController < Api::BaseController
      def show
        render json: ProductJson.v2(Product.find(params[:id]))
      end
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/api/sunset_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "v1 の終了", type: :request do
  include ActiveSupport::Testing::TimeHelpers
  let(:product) { Product.create!(name: "ノートPCスタンド", price_excluding_tax: 4980) }

  it "終了日までは、v1 に非推奨と終了の予定を付けて返す" do
    travel_to Time.utc(2027, 3, 1) do
      get "/api/v1/products/#{product.id}"
      expect(response).to have_http_status(:ok)
      expect(response.headers["Deprecation"]).to eq("@1796083200") # 2026-12-01 00:00:00 UTC
      expect(response.headers["Sunset"]).to eq("Wed, 01 Dec 2027 00:00:00 GMT")
    end
  end

  it "終了日を過ぎたら、v1 は 410 を返す。v2 は price のない形で返す" do
    travel_to Time.utc(2027, 12, 1) do
      get "/api/v1/products/#{product.id}"
      expect(response).to have_http_status(:gone)
      get "/api/v2/products/#{product.id}"
      expect(response.parsed_body.keys).to eq(%w[id name price_excluding_tax price_including_tax])
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/api/sunset_spec.rb --format documentation）"
            code={`
v1 の終了
  終了日までは、v1 に非推奨と終了の予定を付けて返す
  終了日を過ぎたら、v1 は 410 を返す。v2 は price のない形で返す

2 examples, 0 failures
`}
          />
          <ul>
            <li>
              <code>travel_to</code> はブロックの中の現在時刻を指定した時刻にするテストのヘルパーです。終了日の前と後の2つの時刻で、v1 の応答を確かめています。
            </li>
            <li>
              終了日を過ぎた v1 は 410 Gone と説明のページの URL を返します。410 は、資源がもう使えず、その状態がおそらく続くことを示す状態コードです<Ref n={22} />。移っていない利用者は、この状態コードと URL から v1 が終わったことを知ることができます。
            </li>
            <li>
              v1 の JSON は ProductJson.v2 に price を足して作ります。税込みの価格を計算する場所は Product#price_including_tax の1か所だけなので、計算を直したときに v1 だけ直し忘れることがありません。そうしなかった場合のコードは、当てはめすぎの節で動かします。
            </li>
          </ul>
          <Figure n="73-5" title="API のバージョンと非推奨の期間" caption="取引先など、こちらから更新を求められない利用者がいる場合の流れ。">
            <SunsetFigure />
          </Figure>
          <p>
            図 73-5 は v1 と v2 の期間を並べたものです。v2 を公開した日から終了日までが非推奨の期間で、v1 はその間もこれまでどおりに応答し、ヘッダーで終了日を知らせます。非推奨の期間の長さは、利用者が移るのにかかる時間と、取引先との契約で決めます。
          </p>
          <h3>直す前と直した後</h3>
          <Figure n="73-6" title="直す前と直した後：古い利用者ごとの結果" caption="直す前は最初の節の実行結果、直した後はバージョンごとの読み方のテストの結果。">
            <CompareFigure />
          </Figure>
          <p>
            図 73-6 は古い利用者ごとの結果を、直す前と直した後で比べたものです。直す前は、1回のデプロイで列と項目の名前を変えたので、古いプロセスと v2.3 のアプリが失敗しました。直した後は、列の名前を変えずに alias_attribute を使ったので古いプロセスは失敗せず、price を残したので v2.3 も読めます。古い形を消す時期もデプロイの日ではなくバージョンごとの要求の数を見て決めるようになりました。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: 'バージョンを残したまま増やし続けたとき：直す場所がバージョンの数だけ増える',
      body: (
        <>
          <h3>変更のたびにバージョンを足した API</h3>
          <p>
            後方互換性を守ろうとして、「API を変えるときは必ず新しいバージョンを作り、古いバージョンはそのまま残す」という決まりを作ったとします。次はこの決まりで3年の間にバージョンを足した API です（直した後のコードとは別のアプリで動かしました）。2025年に、項目の名前を変えて税込みの価格を足すために v1 を写して v2 を作りました。2026年に、軽減税率（食品などの消費税率 8%）の商品を扱うために税率の項目を足して、v2 を写して v3 を作りました。Product#price_including_tax は、税率の列 tax_rate を使うように直しました。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_products.rb と app/models/product.rb"
            code={`
class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.integer :price, null: false # 税抜きの価格（円）
      t.integer :tax_rate, null: false, default: 10 # 消費税率（%）。軽減税率の商品は 8
      t.timestamps
    end
  end
end

class Product < ApplicationRecord
  alias_attribute :price_excluding_tax, :price

  # 税込みの価格（1円未満は切り捨て）。2026年に軽減税率のため tax_rate を使うように直した
  def price_including_tax = price_excluding_tax * (100 + tax_rate) / 100
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/api/v1・v2・v3/products_controller.rb"
            code={`
# 2024年に作ったバージョン
class Api::V1::ProductsController < Api::BaseController
  def show
    product = Product.find(params[:id])
    render json: { id: product.id, name: product.name, price: product.price }
  end
end

# 2025年に、項目の名前を変えて税込みの価格を足すために、v1 を写して作ったバージョン
class Api::V2::ProductsController < Api::BaseController
  def show
    product = Product.find(params[:id])
    render json: { id: product.id, name: product.name, price_excluding_tax: product.price,
                   price_including_tax: product.price * 110 / 100 }
  end
end

# 2026年に、税率の項目を足すために、v2 を写して作ったバージョン
class Api::V3::ProductsController < Api::BaseController
  def show
    product = Product.find(params[:id])
    render json: { id: product.id, name: product.name, price_excluding_tax: product.price_excluding_tax,
                   price_including_tax: product.price_including_tax, tax_rate: product.tax_rate }
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/tax_rate_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "軽減税率の商品の税込みの価格", type: :request do
  let(:beans) { Product.create!(name: "コーヒー豆", price_excluding_tax: 1200, tax_rate: 8) }

  %w[v2 v3].each do |version|
    it "#{version} は 1296 円を返す" do
      get "/api/#{version}/products/#{beans.id}"
      expect(response.parsed_body["price_including_tax"]).to eq(1296)
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation --order defined）"
            code={`
軽減税率の商品の税込みの価格
  v2 は 1296 円を返す (FAILED - 1)
  v3 は 1296 円を返す

Failures:

  1) 軽減税率の商品の税込みの価格 v2 は 1296 円を返す
     Failure/Error: expect(response.parsed_body["price_including_tax"]).to eq(1296)

       expected: 1296
            got: 1320

       (compared using ==)
     # ./spec/requests/tax_rate_spec.rb:9:in 'block (3 levels) in <top (required)>'

2 examples, 1 failure
`}
          />
          <p>
            v3 は 1296 円を返しましたが、v2 は 1320 円（税率 10% の金額）を返しました。v2 は写したときの <code>product.price * 110 / 100</code> を持ったままで、税率を直したときに直し忘れたからです。v2 を使う利用者には、食品の税込みの価格が24円高く表示されます。この決まりには、2つの当てはめすぎがあります。
          </p>
          <ul>
            <li>
              互換性のある変更にもバージョンを作りました。v3 で足した tax_rate は項目の追加なので、v2 に足しても v2 を使う利用者のアプリは失敗しません（図 73-3）。v2 の名前の変更も、新しい項目を足して古い項目を残せば、v1 の中で行えました。
            </li>
            <li>
              古いバージョンを終える日を決めていません。バージョンごとの要求を数えていないので、どのバージョンにも利用者がいるかもしれず、どれも消せません。バージョンが3つあれば、税率の計算を直す場所も、テストを書く場所も3つになります。
            </li>
          </ul>
          <p>
            直した後のコードでは v1 を v2 の上に書いたので（ProductJson.v1）、計算を直す場所は1か所でした。古いバージョンを残すときはコードを写さず、新しいバージョンの結果に古い項目を足す形にします。Parallel Change の記事も、古いメソッドを新しい API を使って書くと、2つの実装を保守せずに済むと書いています<Ref n={5} />。
          </p>
          <h3>すべての振る舞いを守ろうとすると、何も変えられない</h3>
          <p>
            Hyrum's Law のとおり、利用者が多い API では、文書に書いていない振る舞いにも誰かが依存します<Ref n={7} />。JSON のキーの並び順、エラーの文言、応答の速さまで変えないようにすると、バグの修正もできなくなります。AIP-180 も、意味の互換性の指針を広く読みすぎるとどんな変更もできなくなるが、それは意図していないと書いています<Ref n={4} />。守る対象は SemVer のように公開すると決めたもの（この章では項目の名前・型・意味と状態コード）に絞り<Ref n={1} />、それ以外は約束に含めないと API の文書に書いておきます。
          </p>
          <h3>同じデプロイで直せる利用者に、互換のための層を作る</h3>
          <p>
            互換性を保つ費用が見合うのは、利用者をこちらで一度に直せないときです。アプリの中のメソッドを呼ぶのが同じリポジトリのコードだけなら、メソッドの名前を変えて、呼び出し元も同じプルリクエストで直せます。古い名前を別名として残して非推奨の警告を出すと、同じ処理をする名前が2つになり、ログには警告が増えます。AIP-180 も、同じチームのコードだけが呼ぶ API や、利用者に更新を強制できる API は、自分たちの互換性の要件を考えるよう書いています<Ref n={4} />。
          </p>
          <p>
            ただし、Parallel Change の記事は、利用者をすべて直せる場合でも、動かなくなる箇所が一度にコード全体に出るのを防ぐために、3つの段階を使うことを勧めています。その場合の migrate は短くてよいとも書いています<Ref n={5} />。大きな変更を小さなプルリクエストに分けるために作った古い名前は、呼び出し元を直し終えたら、すぐに消します。
          </p>
          <h3>判断の目安</h3>
          <Figure n="73-7" title="古い利用者が残る期間と、互換性の保ち方" caption="古い利用者を、こちらで一度に直せるか、どれだけの期間残るかで分けた。">
            <JudgeFigure />
          </Figure>
          <p>
            図 73-7 は古い利用者が残る期間ごとに、互換性の保ち方を並べた表です。迷ったら、次の3つを確かめます。古い利用者をこちらで一度に直せるか。直せないなら、古い利用者がいつまで残るかを数えられるか。古い形を残す期間の終わりを決めたか。直せる利用者には互換のための層を作らず、直せない利用者には期間を決めて古い形を残します。期間の終わりを決められない互換のためのコードは、この節の v1・v2・v3 のように増え続けます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の非推奨の警告・load_defaults・ジョブの引数と後方互換性',
      body: (
        <>
          <h3>Rails 自身の非推奨の警告を、アップグレードの前に見つける</h3>
          <p>
            Rails はメンテナンスポリシーのとおり、機能を変える前に非推奨の警告を出します。Rails 8.1 では <code>update_all</code> を <code>distinct</code> の付いた検索に対して呼ぶと警告が出ます。8.1.0 の CHANGELOG によると、distinct・WITH・WITH RECURSIVE は update_all の SQL に入らず、これまで警告なしに無視されていたので、警告を出すようにし、将来のバージョンで例外にする予定です<Ref n={14} /><Ref n={13} />。
          </p>
          <Code
            lang="ruby"
            title="script/deprecation.rb"
            code={`
# Rails 8.1 の非推奨の警告と、警告を例外に変える設定を確かめる（RAILS_ENV=test bin/rails runner で実行する）
Product.distinct.where(id: 0).update_all(name: "x") # distinct は update_all の SQL に入らない

ActiveRecord.deprecator.behavior = :raise # config.active_support.deprecation = :raise と同じ動き
begin
  Product.distinct.where(id: 0).update_all(name: "x")
rescue ActiveSupport::DeprecationException => e
  puts "#{e.class}: #{e.message.lines.first}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=test bin/rails runner script/deprecation.rb）"
            code={`
DEPRECATION WARNING: \`distinct\` is not supported by \`update_all\` and was never included in the generated query.

Calling \`distinct\` with \`update_all\` will raise an error in Rails 8.2.
 (called from <top (required)> at /work/ch92/script/deprecation.rb:2)
ActiveSupport::DeprecationException: DEPRECATION WARNING: \`distinct\` is not supported by \`update_all\` and was never included in the generated query.
`}
          />
          <p>
            1回目は警告を出して処理を続け、警告には「Rails 8.2 で例外にする」と、呼び出した行が書かれています。2回目は振る舞いを :raise にしたので ActiveSupport::DeprecationException になりました<Ref n={16} />。Rails の部品はそれぞれ非推奨の警告を出すオブジェクト（deprecator）を持ち、アプリケーションの Rails.application.deprecators に登録します<Ref n={17} />。config.active_support.deprecation は、登録されたすべての deprecator の振る舞いを決める設定です<Ref n={23} />。
          </p>
          <ul>
            <li>新しいアプリケーションの設定では、開発の環境が :log（ログに書く）、テストの環境が :stderr（標準エラー出力に書く）です<Ref n={24} />。</li>
            <li>本番の環境は report_deprecations が false で、非推奨の警告を出しません<Ref n={24} /><Ref n={12} />。本番のログを見ていても、警告には気づけません。</li>
            <li>テストの環境で :raise にするか、config.active_support.disallowed_deprecation_warnings に特定の警告を書いてそれだけを例外にすると、CI で見つけられます<Ref n={12} />。</li>
          </ul>
          <h3>load_defaults で、設定の既定値を1つずつ切り替える</h3>
          <p>
            Rails のバージョンを上げても、config/application.rb の config.load_defaults を変えるまでは、前のバージョンの設定の既定値で動きます。bin/rails app:update が作る config/initializers/new_framework_defaults_X_Y.rb のコメントを1つずつ外して、新しい既定値を何回かのデプロイに分けて有効にし、すべて有効にできたらこのファイルを消して load_defaults の値を上げます<Ref n={3} />。Rails の側が用意した expand と contract の手順です。
          </p>
          <p>
            保存されたデータの形式を変える設定は、さらに順序に気をつけます。Cookie などの署名や暗号化に使う config.active_support.message_serializer は、形式を移りやすくするために、別の形式で書かれたメッセージも読める仕組みを持ちます。別の形式で読んだときには message_serializer_fallback.active_support という通知を出すので、古い形式のメッセージがどれだけ残っているかを数えられます<Ref n={12} />。一方、config.active_support.use_message_serializer_for_metadata を true にするとメッセージの形式が変わり、7.1 より前の Rails では読めなくなります。古い形式のメッセージはこの設定に関係なく読めます<Ref n={12} />。新しい形式には前方互換性がないので、古いバージョンの Rails のプロセスが残っていないこと、古いバージョンに戻す予定がないことを確かめてから有効にします。
          </p>
          <h3>キューに残ったジョブの引数も、古いコードとの約束</h3>
          <p>
            Active Job のジョブは、引数を JSON にしてキューに入れ、別のプロセスが後で実行します（<ChapterLink n={18} section="serialize" />）。キューに残ったジョブは入れたときのコードの引数の形を持っています。値下げのお知らせの文を作るジョブに、必須のキーワード引数 old_price: を足して、2つの向きで実行しました。
          </p>
          <Code
            lang="ruby"
            title="app/jobs/price_drop_notice_job.rb（必須の引数を足したもの）と spec/jobs/price_drop_notice_job_spec.rb"
            code={`
# 値下げのお知らせの文を作るジョブ（old_price は新しく足した引数）
class PriceDropNoticeJob < ApplicationJob
  def perform(product_id, old_price:)
    product = Product.find(product_id)
    "#{product.name}を #{old_price} 円から #{product.price_excluding_tax} 円に値下げしました"
  end
end

# spec/jobs/price_drop_notice_job_spec.rb
require "rails_helper"

RSpec.describe PriceDropNoticeJob do
  let(:product) { Product.create!(name: "ノートPCスタンド", price_excluding_tax: 4480) }

  it "古いコードが入れたジョブ（引数は商品の id だけ）を、新しいコードで実行する" do
    payload = PriceDropNoticeJob.new(product.id).serialize # 古いコードの perform_later(product.id) が入れる内容
    expect(ActiveJob::Base.execute(payload)).to eq("ノートPCスタンドを 4480 円に値下げしました")
  end

  it "新しいコードが入れたジョブを、古いコードのワーカーで実行する" do
    payload = PriceDropNoticeJob.new(product.id, old_price: 4980).serialize
    stub_const("PriceDropNoticeJob", Class.new(ApplicationJob) { def perform(product_id) = Product.find(product_id) })
    expect { ActiveJob::Base.execute(payload) }.to raise_error(ArgumentError, /given 2, expected 1/)
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/jobs --format documentation --order defined。gem のバックトレースは省略）"
            code={`
PriceDropNoticeJob
  古いコードが入れたジョブ（引数は商品の id だけ）を、新しいコードで実行する (FAILED - 1)
  新しいコードが入れたジョブを、古いコードのワーカーで実行する

Failures:

  1) PriceDropNoticeJob 古いコードが入れたジョブ（引数は商品の id だけ）を、新しいコードで実行する
     Failure/Error:
       def perform(product_id, old_price:)
         product = Product.find(product_id)
         "#{product.name}を #{old_price} 円から #{product.price_excluding_tax} 円に値下げしました"
       end

     ArgumentError:
       missing keyword: :old_price
     # ./app/jobs/price_drop_notice_job.rb:3:in 'PriceDropNoticeJob#perform'
     # ./spec/jobs/price_drop_notice_job_spec.rb:8:in 'block (2 levels) in <top (required)>'

2 examples, 1 failure
`}
          />
          <p>
            <code>ActiveJob::Base.execute</code> はキューから取り出したジョブのデータからジョブを作り、perform_now を呼ぶメソッドです<Ref n={18} />。ワーカーがジョブを実行するときと同じ経路を通ります。
          </p>
          <ul>
            <li>1つ目の例：古いコードが入れたジョブ（引数は商品の id だけ）を、新しい perform が受け取れずに ArgumentError になりました。キューに残ったジョブは再試行しても同じ例外になります。</li>
            <li>2つ目の例：逆の向きです。新しいコードが old_price を付けて入れたジョブを、デプロイ中の古いワーカーが実行すると、引数の数が合わずに ArgumentError になることを確かめています。</li>
          </ul>
          <p>新しい引数に既定値を置くと、1つ目の例も通ります。</p>
          <Code
            lang="ruby"
            title="app/jobs/price_drop_notice_job.rb"
            code={`
# 値下げのお知らせの文を作るジョブ。old_price は後から足した引数なので、古いジョブのために既定値を置く
class PriceDropNoticeJob < ApplicationJob
  def perform(product_id, old_price: nil)
    product = Product.find(product_id)
    from = old_price ? "#{old_price} 円から " : ""
    "#{product.name}を #{from}#{product.price_excluding_tax} 円に値下げしました"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/jobs --format documentation --order defined）"
            code={`
PriceDropNoticeJob
  古いコードが入れたジョブ（引数は商品の id だけ）を、新しいコードで実行する
  新しいコードが入れたジョブを、古いコードのワーカーで実行する

2 examples, 0 failures
`}
          />
          <p>
            古いワーカーの失敗は新しいコードの既定値では防げません。そこでデプロイを2回に分けます。1回目で、old_price を受け取れる（既定値の付いた）ジョブをすべてのワーカーに行き渡らせます。2回目で、old_price を渡してジョブを入れるコードを出します。列の変更と同じく、受け取る側のコードを先にデプロイし、渡す側のコードを後からデプロイする順序です。
          </p>
          <h3>列の名前を変えるための道具</h3>
          <p>
            この章で使った alias_attribute は、DB を変えずにコードの中の名前を変える道具です。列を消す前にモデルから列を見えなくする ignored_columns と、列を変える手順は <ChapterLink n={27} section="remove-columns" /> で扱いました。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Progress over stability」は、10年以上続くシステムは変わりにくくなり、過去の振る舞いに依存する誰かにとって、どの変更も問題になりうると認めています。そのうえで、Rails が進化し続けるためには、ときには壊して変える必要があると述べています。同時に、不要な痛みや過度な痛みを与えてよいという意味ではないとも書き、Rails 2 から 3 への移行が多くの利用者に負担をかけたことを挙げています<Ref n={11} />。Rails 自身は、非推奨の警告と load_defaults で利用者が移る時間を作ったうえで変えています。
          </p>
          <p>
            アプリケーションの API では、事情が違います。Rails を上げるのは Rails を使う開発者で、動かなくなったところを自分で直せます。端末のアプリの利用者や取引先は、こちらの変更に合わせて自分で直せません。そのため、外部の利用者がいる API では、Rails 自身よりも互換性を保つ側に判断を寄せます。Rails Doctrine と原則の関係は <ChapterLink n={56} section="rails-doctrine" /> でまとめました。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 には、update_all に distinct を付けたときの非推奨の警告がありません。activerecord 7.2.0 の update_all は distinct を確かめずに、SQL に入れないまま処理します<Ref n={19} /><Ref n={14} />。7.2 のアプリでこの書き方をしていると、8.1 に上げたときに初めて警告が出ます。Rails.application.deprecators は 7.2 にもあり（railties 7.2.0 で確かめました）<Ref n={20} />、config.active_support.deprecation の設定もこの章と同じように使えます。
            </p>
            <p>
              この章の spec/support/mobile_app.rb で使った Data.define は Ruby 3.2 以降の機能です<Ref n={21} />。Rails 7.2 は Ruby 3.1 でも動くので<Ref n={3} />、Ruby 3.1 のアプリでは Struct で書きます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Backward Compatibility（後方互換性）は、既存の利用者やシステムとの互換性を保ち、変更による破壊的な影響を抑える原則です。SemVer は互換性のない変更を MAJOR バージョンで行い、その前に非推奨を知らせるよう求め、Rails も互換性のない変更の前のバージョンで非推奨の警告を出します。</li>
          <li>列の名前と API の項目の名前を1回のデプロイで変えると、デプロイ中の古いプロセスが MissingAttributeError で 500 を返し、端末に残る v2.3 のアプリが KeyError で商品の画面を開けなくなりました。サーバーのテストは新しい名前に合わせて直したので通りました。</li>
          <li>項目の追加は互換性のある変更で、項目の削除・名前の変更・型や意味の変更は互換性のない変更です。名前の変更は「消して足す」ことと同じです。</li>
          <li>直すときは、API の項目を足して price を残し（expand）、DB の列は alias_attribute で名前だけを変えました。サポートしているバージョンごとの読み方をテストにし、バージョンごとの要求を Gem::Version で比べて数えてから（migrate）、古い形を消します（contract）。</li>
          <li>数えられない利用者には新しいバージョンの API を作り、古いバージョンに Deprecation と Sunset のヘッダーで終了日を知らせ、終了日の後は 410 を返します。古いバージョンは新しいバージョンの上に書き、計算を写しません。</li>
          <li>変更のたびにバージョンを作って残し続けると、税率の計算の直し忘れのように、直す場所がバージョンの数だけ増えます。互換性を保つのは一度に直せない利用者に限り、守る対象と期間を決めます。</li>
          <li>Rails の非推奨の警告は本番では出ないので、テストで :raise にして見つけます。キューに残ったジョブも古い利用者なので、新しい引数には既定値を置き、受け取る側を先にデプロイします。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Semantic Versioning 2.0.0', publisher: 'Tom Preston-Werner / semver.org', url: 'https://semver.org/spec/v2.0.0.html', accessed: '2026-11-22', version: '2.0.0', note: 'MAJOR・MINOR・PATCH の上げ方（互換性のない API の変更・後方互換性のある機能の追加・後方互換性のあるバグの修正）。公開する API を決めて示すこと。非推奨にするときは文書で知らせ、非推奨を含む MINOR バージョンを出し、MAJOR バージョンで消す前に少なくとも1回は非推奨を含む MINOR バージョンを出すこと（FAQ）。仕様の作者が Tom Preston-Werner であること（About）。' },
    { title: 'Maintenance Policy for Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/maintenance_policy.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Rails は SemVer をずらした形でバージョン番号を付けること。PATCH はバグの修正だけで API を変えず、MINOR は API の変更を含むことがあり SemVer の MAJOR にあたり、MAJOR との違いは互換性のない変更の大きさであること。互換性のない変更には、1つ前の MINOR か MAJOR バージョンで非推奨の通知を出すこと。' },
    { title: 'Upgrading Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/upgrading_ruby_on_rails.html', accessed: '2026-11-22', version: 'Rails 8.1', note: '非推奨の警告を活かすために MINOR バージョンを1つずつ上げること。load_defaults を変えるまでは前のバージョンの既定値で動き、new_framework_defaults_X_Y.rb で新しい既定値を何回かのデプロイに分けて有効にし、最後にファイルを消して load_defaults を上げること。Rails 7.2 が Ruby 3.1.0 以降を必要とすること。' },
    { title: 'AIP-180: Backwards compatibility', publisher: 'Google / API Improvement Proposals', url: 'https://google.aip.dev/180', accessed: '2026-11-22', version: '2019-07-23 作成', note: 'API を利用者との約束とし、同じ MAJOR バージョンの中では古いクライアントが新しいサーバーで動くこと。ソース・ワイヤー・意味の3つの互換性。項目の追加は同じ MAJOR バージョンで行えるが、今まで返していた項目は重複になっても返し続けること。削除は互換性のない変更で、名前の変更は削除と追加と同じであること。型・値の形式・既定値の変更が互換性のない変更であること。意味の互換性の指針を広く読みすぎるとどんな変更もできなくなるが、それは意図ではないこと。同じチームのコードだけが呼ぶ API や更新を強制できる API は、自分の互換性の要件を考えること。' },
    { title: 'Parallel Change', publisher: 'Danilo Sato / martinfowler.com', url: 'https://martinfowler.com/bliki/ParallelChange.html', accessed: '2026-11-22', version: '2014-05-13', note: 'expand and contract とも呼び、互換性のないインターフェースの変更を expand・migrate・contract の3つの段階に分けること。外部の利用者がいると migrate が最も長いこと。すべての利用者を直せる場合でも、壊れる箇所が一度に広がるのを防ぐのに役立ち、migrate は短くてよいこと。古いメソッドを新しい API で実装すると2つの実装を保守せずに済むこと。データベースのリファクタリングと外部の API の変更に使えること。' },
    { title: 'Tolerant Reader', publisher: 'Martin Fowler / martinfowler.com', url: 'https://martinfowler.com/bliki/TolerantReader.html', accessed: '2026-11-22', version: '2011-05-09', note: 'データを読むときは必要なものだけを読んでほかは無視し、構造の仮定を最小にすること。Jon Postel の言葉の引用。利用者が自分の読み方とそのテストを提供する側に渡し、提供する側のビルドで利用者を壊す変更を見つける方法（Consumer-Driven Contracts への言及）。' },
    { title: "Hyrum's Law", publisher: 'Hyrum Wright / hyrumslaw.com', url: 'https://www.hyrumslaw.com/', accessed: '2026-11-22', note: 'API の利用者が十分に多いと、約束の内容に関係なく、観察できるすべての振る舞いに誰かが依存すること。文書に書いていない性能などにも利用者が依存すること。' },
    { title: 'RFC 9745: The Deprecation HTTP Response Header Field', publisher: 'IETF（S. Dalal, E. Wilde）', url: 'https://www.rfc-editor.org/rfc/rfc9745.html', accessed: '2026-11-22', version: '2025年3月', note: 'Deprecation ヘッダーが、応答した資源が非推奨になる、またはなった日時を Structured Field の Date（@ と UNIX 時刻）で示すこと。rel="deprecation" の Link ヘッダーで説明のページを示せること。Sunset の日時を Deprecation より前にしてはならないこと。非推奨は資源の振る舞いを変えないこと。' },
    { title: 'RFC 8594: The Sunset HTTP Header Field', publisher: 'IETF（E. Wilde）', url: 'https://www.rfc-editor.org/rfc/rfc8594.html', accessed: '2026-11-22', version: '2019年5月', note: 'Sunset ヘッダーが、資源が応答しなくなる予定の日時を HTTP-date で示すこと。' },
    { title: 'Customize the Json instance（Ignore unknown keys）', publisher: 'Kotlin Documentation（kotlinx.serialization）', url: 'https://kotlinlang.org/docs/serialization-json-configuration.html', accessed: '2026-11-22', note: '既定では、JSON の中の知らないキーが読み込みのエラーになり、ignoreUnknownKeys を true にすると無視すること。' },
    { title: 'The Rails Doctrine（Progress over stability）', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '長く続くシステムは変わりにくくなり、過去の振る舞いに依存する誰かにとってどの変更も問題になりうること。進化のためにときには壊して変えること。不要な痛みや過度な痛みを与えてよいという意味ではないこと。Rails 2 から 3 への移行の例。' },
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'config.active_support.deprecation・disallowed_deprecation_warnings・report_deprecations（生成された本番の設定では false）の説明。message_serializer が別の形式のメッセージも読める仕組みを持ち、message_serializer_fallback.active_support の通知で回数を数えられること。use_message_serializer_for_metadata を true にすると 7.1 より前の Rails で読めず、古い形式は読めること。' },
    { title: 'activerecord/lib/active_record/relation.rb（update_all）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L602-L617`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'update_all が distinct・with・with_recursive（63行目の INVALID_METHODS_FOR_UPDATE_AND_DELETE_ALL）を見つけると、Rails 8.2 で例外にするという非推奨の警告を出すこと。警告の文は実行して確かめた。' },
    { title: 'activerecord/CHANGELOG.md（Rails 8.1.0）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md#L1443-L1451`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（Rails 8.1.0 の項）', note: 'update_all に WITH・WITH RECURSIVE・DISTINCT を付けると非推奨の警告を出すようにしたこと。これらは対応しておらず SQL を作るときに無視されてきたこと。将来のバージョンで例外にすること。' },
    { title: 'activemodel/lib/active_model/attribute_methods.rb（alias_attribute）', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attribute_methods.rb#L203-L209`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'alias_attribute が attribute_aliases に新しい名前と元の名前を記録し、新しい名前の属性のメソッドを作ること。where の条件が元の列の名前になることは実行して確かめた。' },
    { title: 'activesupport/lib/active_support/deprecation/behaviors.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/deprecation/behaviors.rb#L8-L24`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: ':raise が ActiveSupport::DeprecationException を投げ、:stderr が標準エラー出力に書くこと。' },
    { title: 'activerecord/lib/active_record/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railtie.rb#L306-L309`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'db/schema.rb と db/structure.sql を watchable_files に加え、開発の環境でこれらが変わるとコードを読み込み直すこと（306〜309行目）。ActiveRecord.deprecator を app.deprecators[:active_record] に登録すること（82〜84行目）。' },
    { title: 'activejob/lib/active_job/execution.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/execution.rb#L26-L31`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'ActiveJob::Base.execute がジョブのデータから deserialize でジョブを作り、perform_now を呼ぶこと。' },
    { title: 'activerecord/lib/active_record/relation.rb（Rails 7.2.0 の update_all）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.0/activerecord/lib/active_record/relation.rb#L581-L600', accessed: '2026-11-22', version: 'Rails 7.2.0（rubygems.org の gem で確認）', note: '7.2.0 の update_all に distinct などを確かめる処理がなく、非推奨の警告を出さないこと（delete_all だけが INVALID_METHODS_FOR_DELETE_ALL で例外にする）。' },
    { title: 'railties/lib/rails/application.rb（Rails 7.2.0 の deprecators）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.0/railties/lib/rails/application.rb#L232-L236', accessed: '2026-11-22', version: 'Rails 7.2.0（rubygems.org の gem で確認）', note: '7.2.0 に Rails.application.deprecators があること。' },
    { title: 'class Data', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-22', note: 'Data.define で値を持つクラスを作ること。Ruby 3.2 で入ったことは Ruby 3.2 の NEWS（https://docs.ruby-lang.org/en/4.0/NEWS/NEWS-3_2_0_md.html）で確認した。' },
    { title: 'RFC 9110: HTTP Semantics（15.5.11 410 Gone）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html#name-410-gone', accessed: '2026-11-22', version: '2022年6月', note: '410 が、資源がもう使えず、その状態がおそらく続くことを示す状態コードであること。' },
    { title: 'activesupport/lib/active_support/railtie.rb（deprecation_behavior）', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/railtie.rb#L89-L105`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'config.active_support.deprecation が app.deprecators（登録されたすべての deprecator）の behavior になること。report_deprecations が false なら警告を止めること。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt#L46-L47`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '新しいアプリケーションのテストの環境が config.active_support.deprecation = :stderr であること。同じディレクトリの development.rb.tt の49〜50行目が :log、production.rb.tt の58〜59行目が report_deprecations = false であること。' },
  ],
}

export default chapter
