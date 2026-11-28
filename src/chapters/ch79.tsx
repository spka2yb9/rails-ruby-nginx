import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 77-1 注文の確定に関係するクラスと、問題が起きる箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="77-1"
      w={780}
      h={400}
      label="利用者のアプリが POST /orders/1/checkout に use_points=1500 を送る。CheckoutsController#create は、入力を to_i で数値にして used_points に入れ、PaymentGateway#charge で決済代行会社の API に請求し、order.update の戻り値を見ずに 200 を返す。PaymentGateway は、起動時に config/initializers/payment.rb が ENV から読んだ秘密鍵で本文に署名する。問題1は、秘密鍵の環境変数が無くても起動できること。問題2は、1500 や -500 を確かめずに使うこと。問題3は、orders テーブルへの保存に失敗しても 200 を返すこと"
    >
      <T x={20} y={140} fs={11} tone="acc">
        POST /orders/1/checkout
      </T>
      <Box x={20} y={160} w={150} h={56} lines={['利用者のアプリ', 'use_points=1500']} fs={12} bold subTone="muted" />
      <Arrow x1={170} y1={188} x2={238} y2={188} accent />
      <Box
        x={240}
        y={120}
        w={260}
        h={136}
        lines={['CheckoutsController#create', '① used_points = 入力.to_i', '② PaymentGateway#charge', '③ order.update（戻り値を見ない）', '④ 200 と status を返す']}
        fs={12}
        bold
        subTone="muted"
      />
      <Box x={550} y={24} w={210} h={56} lines={['config/initializers/payment.rb', 'ENV["PAYMENT_SECRET"]']} fs={10} mono />
      <Arrow x1={655} y1={80} x2={655} y2={148} dashed />
      <Box x={550} y={150} w={210} h={56} lines={['PaymentGateway', '@secret で本文に署名する']} fs={12} bold subTone="muted" />
      <Arrow x1={500} y1={178} x2={548} y2={178} />
      <Arrow x1={655} y1={206} x2={655} y2={268} />
      <Box x={550} y={270} w={210} h={56} lines={['決済代行会社の API', 'POST /v1/charges']} fill="box4" fs={12} bold subTone="muted" />
      <Arrow x1={370} y1={256} x2={370} y2={318} />
      <Box x={295} y={320} w={150} h={40} lines="orders テーブル" fill="box4" fs={12} />
      <T x={645} y={100} anchor="end" fs={11} tone="danger">
        問題1：値が無くても起動できる
      </T>
      <T x={20} y={240} fs={11} tone="danger">
        問題2：1500 や -500 を
      </T>
      <T x={20} y={256} fs={11} tone="danger">
        確かめずに使う
      </T>
      <T x={455} y={344} fs={11} tone="danger">
        問題3：保存に失敗しても 200 を返す
      </T>
      <T x={20} y={386} fs={11} tone="muted">
        青い矢印は利用者からの要求、破線の矢印は起動時に設定を読む向き。緑の箱は外部のサービスと MySQL のテーブル
      </T>
    </Svg>
  )
}

/* ---------- 図 77-2 問題に気づく時点と、起きること ---------- */
const costStages = [
  { head: ['テスト・CI', '書いた直後'], who: '開発者', what: ['テストが失敗する', '直してから出す'] },
  { head: ['起動', 'デプロイの時'], who: 'デプロイした人', what: ['新しい版が起動しない', '利用者が使う前に止まる'] },
  { head: ['入力を受け取った時', '要求の最初'], who: '利用者', what: ['その要求だけを断る', '利用者が入力を直す'] },
  { head: ['処理の途中', '決済の後'], who: '利用者と運用の担当', what: ['決済済みで注文が未払い', '返金と手作業の修正'] },
  { head: ['後日', '照合・問い合わせ'], who: '経理の担当', what: ['原因の行を探す', 'データを直す'] },
]

function CostFigure() {
  const cx = (i: number) => 116 + i * 132
  return (
    <Svg
      id="77-2"
      w={780}
      h={320}
      label="問題に気づく時点を左から時間の順に5つ並べた。テストと CI では開発者が気づき、直してから出せる。起動の時はデプロイした人が気づき、新しい版が起動しないので利用者が使う前に止まる。入力を受け取った時は利用者が気づき、その要求だけを断るので利用者が入力を直す。処理の途中、たとえば決済の後では利用者と運用の担当が気づき、決済済みで注文が未払いのまま残り、返金と手作業の修正が要る。後日の照合や問い合わせで気づくと、原因の行を探してデータを直すことになる。左の3つが fail fast（すぐに見える形で止まる）、右の2つが fail slowly（後で別の場所で壊れる）で、右へ行くほど手間と影響が大きくなる"
    >
      <T x={20} y={63} fs={12} bold>
        気づく時点
      </T>
      <T x={20} y={140} fs={12} bold>
        気づく人
      </T>
      <T x={20} y={204} fs={12} bold>
        起きること
      </T>
      {costStages.map((s, i) => (
        <g key={s.who}>
          <Box x={cx(i)} y={40} w={126} h={46} lines={s.head} fs={11} bold subTone="muted" />
          <Box x={cx(i)} y={124} w={126} h={32} lines={s.who} fs={11} fill="bg" />
          <Box x={cx(i)} y={176} w={126} h={56} lines={s.what} fs={11} fill="bg" />
        </g>
      ))}
      <Arrow x1={116} y1={104} x2={770} y2={104} />
      <T x={746} y={97} anchor="end" fs={10} tone="muted">
        時間
      </T>
      <T x={116} y={258} fs={12} tone="acc">
        fail fast：すぐに・見える形で止まる
      </T>
      <T x={770} y={258} anchor="end" fs={12} tone="danger">
        fail slowly：後で・別の場所で壊れる
      </T>
      <Arrow x1={116} y1={280} x2={770} y2={280} accent />
      <T x={443} y={302} anchor="middle" fs={11} tone="muted">
        右へ行くほど、原因を探す手間と、直すデータ・利用者への影響が大きくなる
      </T>
    </Svg>
  )
}

/* ---------- 図 77-3 ENV[] と ENV.fetch の違い ---------- */
function EnvFetchFigure() {
  return (
    <Svg
      id="77-3"
      w={780}
      h={300}
      label="上段は直す前の ENV[&quot;PAYMENT_SECRET&quot;]。起動時に nil を設定に入れ、GET /up は 200 を返し、最初の決済で HMAC に nil を渡して TypeError になる。例外の行は payment_gateway.rb の11行目で、メッセージは no implicit conversion of nil into String。PAYMENT_SECRET の名前は出てこない。下段は直した後の ENV.fetch(&quot;PAYMENT_SECRET&quot;)。起動時に KeyError（key not found: PAYMENT_SECRET）になり、アプリは起動せず /up も応答しない。例外の行と足りない変数の名前が同じメッセージに出る"
    >
      <T x={20} y={18} bold>
        ENV["PAYMENT_SECRET"]（直す前）
      </T>
      <Box x={20} y={36} w={160} h={52} lines={['起動', 'nil を設定に入れる']} fs={12} bold subTone="muted" />
      <Arrow x1={180} y1={62} x2={208} y2={62} />
      <Box x={210} y={36} w={160} h={52} lines={['GET /up', '200（起動できた）']} fs={12} bold subTone="muted" />
      <Arrow x1={370} y1={62} x2={398} y2={62} />
      <Box x={400} y={36} w={160} h={52} lines={['最初の決済', 'HMAC に nil を渡す']} fs={12} bold subTone="muted" />
      <Arrow x1={560} y1={62} x2={588} y2={62} />
      <Box x={590} y={36} w={170} h={52} lines={['TypeError', 'payment_gateway.rb:11']} fs={12} bold subTone="danger" />
      <T x={760} y={106} anchor="end" fs={11} tone="danger">
        メッセージは「no implicit conversion of nil into String」
      </T>
      <T x={760} y={124} anchor="end" fs={11} tone="danger">
        PAYMENT_SECRET の名前は出てこない
      </T>
      <line x1={20} y1={146} x2={760} y2={146} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={168} bold>
        ENV.fetch("PAYMENT_SECRET")（直した後）
      </T>
      <Box x={20} y={186} w={160} h={52} lines={['起動', 'ENV.fetch で読む']} fs={12} bold subTone="muted" />
      <Arrow x1={180} y1={212} x2={208} y2={212} />
      <Box x={210} y={186} w={250} h={52} lines={['KeyError', 'key not found: "PAYMENT_SECRET"']} fs={12} bold subTone="acc" accent />
      <Arrow x1={460} y1={212} x2={488} y2={212} />
      <Box x={490} y={186} w={170} h={52} lines={['起動しない', '/up も応答しない']} fs={12} bold subTone="muted" />
      <T x={20} y={258} fs={11} tone="acc">
        例外の行（config/initializers/payment.rb:6）と、足りない環境変数の名前が同じメッセージに出る
      </T>
      <Arrow x1={20} y1={284} x2={728} y2={284} />
      <T x={760} y={284} anchor="end" fs={10} tone="muted">
        時間
      </T>
    </Svg>
  )
}

/* ---------- 図 77-5 直す前と直した後の、注文の確定の流れ ---------- */
const beforeSteps: { lines: string[] }[] = [
  { lines: ['use_points = 入力.to_i', '"-500" も "abc" も数値になる'] },
  { lines: ['決済代行会社に請求', '確かめていない金額で請求する'] },
  { lines: ['order.update', 'false が返っても見ない'] },
  { lines: ['200 {"status":"paid"}', 'DB は pending、charge_id は空'] },
]
const afterSteps: { lines: string | string[]; note?: string[] }[] = [
  { lines: 'params.expect(:use_points)', note: ['無ければ 400'] },
  { lines: 'order.invalid?', note: ['誤りなら 422 とメッセージ', '請求はしない'] },
  { lines: '決済代行会社に請求' },
  { lines: 'order.update!', note: ['失敗は ChargeNotRecorded', '（500 にして報告する）'] },
  { lines: '200 {"status":"paid"}' },
]

function BeforeAfterFigure() {
  const sy = (i: number) => 40 + i * 70
  return (
    <Svg
      id="77-5"
      w={780}
      h={420}
      label="左は直す前の注文の確定の流れ。入力を to_i で数値にするので -500 や abc も数値になり、確かめていない金額で決済代行会社に請求し、order.update の false を見ずに 200 と status paid を返す。DB の注文は pending のままで charge_id は空になる。右は直した後の流れ。params.expect で use_points を受け取り、無ければ 400 を返す。order.invalid? で確かめ、誤りなら 422 とメッセージを返して請求しない。請求した後は order.update! で保存し、失敗したら ChargeNotRecorded にして 500 を返し、報告する。最後に 200 を返す"
    >
      <T x={20} y={18} bold>
        直す前
      </T>
      <T x={300} y={18} bold>
        直した後
      </T>
      {beforeSteps.map((s, i) => (
        <g key={s.lines[0]}>
          <Box x={20} y={sy(i)} w={240} h={50} lines={s.lines} fs={12} bold subTone="danger" />
          {i < beforeSteps.length - 1 && <Arrow x1={140} y1={sy(i) + 50} x2={140} y2={sy(i + 1) - 2} />}
        </g>
      ))}
      {afterSteps.map((s, i) => {
        const note = s.note ?? []
        return (
          <g key={String(s.lines)}>
            <Box x={300} y={sy(i)} w={220} h={50} lines={s.lines} fs={12} bold mono={i !== 2} fill={note.length ? 'box5' : 'box'} />
            {i < afterSteps.length - 1 && <Arrow x1={410} y1={sy(i) + 50} x2={410} y2={sy(i + 1) - 2} />}
            {note.length > 0 && <Arrow x1={520} y1={sy(i) + 25} x2={546} y2={sy(i) + 25} dashed />}
            {note.map((t, j) => (
              <T key={t} x={552} y={sy(i) + 25 + (j - (note.length - 1) / 2) * 17} fs={11} tone="acc">
                {t}
              </T>
            ))}
          </g>
        )
      })}
      <line x1={280} y1={8} x2={280} y2={390} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={326} fs={11} tone="danger">
        請求は済み、注文は未払いのまま
      </T>
      <T x={20} y={344} fs={11} tone="danger">
        利用者には「paid」と返す
      </T>
      <T x={300} y={406} fs={11} tone="muted">
        紫の箱で止まる。止めるのは、その要求だけ
      </T>
    </Svg>
  )
}

/* ---------- 図 77-4 save と save! の使い分け ---------- */
const saveKinds = [
  { x: 20, who: ['利用者の入力', 'フォーム・API の値'], how: ['valid? や save の戻り値を見る', '誤りは 422 とメッセージで返す'] },
  { x: 275, who: ['プログラムが決めた値', '確かめた後の値・ジョブ・バッチ'], how: ['save! / update! を使う', '失敗は例外（500 にして報告）'] },
  { x: 530, who: ['外部から届くデータ', 'Webhook・CSV'], how: ['境界で形と値を確かめる', 'Defensive Programming の章'] },
]

function SaveFigure() {
  return (
    <Svg
      id="77-4"
      w={780}
      h={320}
      label="保存する値を決めたのは誰かで、save と save! を選ぶ図。利用者の入力（フォームや API の値）なら、valid? や save の戻り値を見て、誤りは 422 とメッセージで返す。プログラムが決めた値（確かめた後の値、ジョブ、バッチ）なら、save! や update! を使い、失敗は例外にして 500 を返し報告する。外部から届くデータ（Webhook や CSV）は、境界で形と値を確かめる（Defensive Programming の章）。注意として、コントローラーの中で RecordInvalid が起きると、Rails は 422 の応答にしてエラーの報告にも送らないので、プログラムの誤りとして扱う保存は別の例外に変えるか自分で報告する"
    >
      <Box x={240} y={16} w={300} h={44} lines="保存する値を決めたのは誰か" fill="box5" bold fs={13} />
      {saveKinds.map((k) => (
        <g key={k.x}>
          <Arrow x1={390} y1={60} x2={k.x + 115} y2={108} />
          <Box x={k.x} y={110} w={230} h={52} lines={k.who} fs={12} bold subTone="muted" />
          <Arrow x1={k.x + 115} y1={162} x2={k.x + 115} y2={196} />
          <Box x={k.x} y={198} w={230} h={56} lines={k.how} fs={12} subTone="muted" fill="bg" />
        </g>
      ))}
      <T x={20} y={282} fs={11} tone="danger">
        注意：コントローラーの中で RecordInvalid が起きると、Rails は 422 の応答にして、エラーの報告にも送らない
      </T>
      <T x={20} y={302} fs={11} tone="danger">
        プログラムの誤りとして扱う保存は、別の例外に変えるか、自分で報告する
      </T>
    </Svg>
  )
}

/* ---------- 図 77-6 問題の出どころと、止める範囲 ---------- */
const scopes = [
  ['アプリ全体', '起動しない'],
  ['1つの要求', '4xx・5xx を返す'],
  ['1件の処理', '報告して次へ'],
  ['その機能だけ', '代わりの表示'],
]
const origins: { name: string; marks: [number, string][] }[] = [
  { name: '必須の設定の抜け（決済の秘密鍵）', marks: [[0, '起動しない']] },
  { name: '任意の設定の抜け（分析のキー）', marks: [[3, '機能を止める']] },
  { name: '利用者の入力の誤り', marks: [[1, '422']] },
  { name: 'プログラムの誤り・内部の不整合', marks: [[1, '500・報告']] },
  { name: 'バッチの1件の不正なデータ', marks: [[2, '報告して次へ']] },
  { name: '必須の外部サービスの障害（決済）', marks: [[1, '失敗を伝える']] },
  { name: '任意の外部サービスの障害（おすすめ）', marks: [[3, '空の一覧']] },
  { name: '外部から届くデータ（Webhook・CSV）', marks: [[1, '形の誤りは 4xx'], [2, '記録して除く']] },
]

function JudgeFigure() {
  const colX = (c: number) => 270 + c * 125
  const rowY = (r: number) => 76 + r * 36
  return (
    <Svg
      id="77-6"
      w={780}
      h={410}
      label="問題の出どころごとに、止める範囲を表にした図。列は止める範囲で、アプリ全体（起動しない）、1つの要求（4xx や 5xx を返す）、1件の処理（報告して次へ）、その機能だけ（代わりの表示）。必須の設定の抜けはアプリ全体を止める。任意の設定の抜けはその機能だけを止める。利用者の入力の誤りは1つの要求を 422 で断る。プログラムの誤りや内部の不整合は1つの要求を 500 にして報告する。バッチの1件の不正なデータは報告して次へ進む。必須の外部サービス（決済）の障害は、その要求の失敗を伝える。任意の外部サービス（おすすめ）の障害は、その機能だけを空の一覧にする。外部から届くデータは、署名や形の誤りなら要求を 4xx で断り、中身の誤りならその1件を記録して除く"
    >
      <T x={20} y={42} fs={12} bold>
        問題の出どころ
      </T>
      {scopes.map((s, c) => (
        <Box key={s[0]} x={colX(c) + 2} y={20} w={121} h={44} lines={s} fs={11} bold subTone="muted" />
      ))}
      {origins.map((o, r) => (
        <g key={o.name}>
          <line x1={20} y1={rowY(r)} x2={770} y2={rowY(r)} stroke="var(--fig-line)" strokeWidth={0.5} />
          <T x={20} y={rowY(r) + 18} fs={12}>
            {o.name}
          </T>
          {o.marks.map(([c, t]) => (
            <Box key={c} x={colX(c) + 8} y={rowY(r) + 5} w={109} h={26} lines={t} fs={11} fill="box5" />
          ))}
        </g>
      ))}
      <line x1={20} y1={rowY(origins.length)} x2={770} y2={rowY(origins.length)} stroke="var(--fig-line)" strokeWidth={0.5} />
      <T x={20} y={390} fs={11} tone="muted">
        Fail Fast で止めるのは、問題が見つかった範囲だけ。範囲の外まで止めると、続けられた機能まで止まる
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 79,
  part: 8,
  title: 'Fail Fast：設定の抜けと不正な値を、起動時と入力を受け取った時点で止める',
  summary:
    '決済の秘密鍵の環境変数が無いまま起動して最初の決済で TypeError になる場面と、保有ポイントを超える値で請求した後に保存の失敗を無視して注文が未払いのまま残る場面から始めます。Jim Shore の2004年の記事で Fail Fast の意味を確かめ、ENV.fetch・params.expect・invalid?・update! を使って、起動時・入力を受け取った時点・請求の後のそれぞれで止める形に直します。最後に、任意の外部サービスの障害やバッチの1件の誤りで全体を止める当てはめすぎと、Defensive Programming・Graceful Degradation との使い分けを扱います。',
  goals: [
    '問題が起きた時点・場所と、気づく時点・場所が離れると、原因を探す手間と影響が大きくなる理由を、実行結果をもとに説明できる',
    'Jim Shore の記事が勧めるアサーションの置き場所（モジュールの境目、インスタンス変数に入れる値）と、エラーメッセージに書く情報を説明できる',
    'ENV.fetch と ENV[]、save! と save、params.expect と params[] の違いを、起動時・入力を受け取った時点・処理の途中のどこで止めるかと結びつけて選べる',
    'コントローラーの中で RecordInvalid が起きると Rails が 422 にして報告しないことを確かめ、プログラムの誤りとして扱う保存を別の例外に変えられる',
    '問題の出どころ（設定・利用者の入力・プログラムの誤り・外部のデータ・外部サービス）ごとに止める範囲を決め、Defensive Programming や Graceful Degradation と使い分けられる',
  ],
  prerequisites: [10, 14, 56],
  sections: [
    {
      id: 'scene',
      title: '秘密鍵の無い起動と、無視された保存の失敗',
      body: (
        <>
          <p>
            この章では<Term en="Fail Fast">Fail Fast</Term>を扱います。Fail Fast は不正な状態や入力をできるだけ早く見つけ、問題を隠したまま処理を続けないという原則です。まず、問題が起きた場所とは別の場所で、時間がたってから問題が表に出るコードを動かします。
          </p>
          <h3>そもそも何をするのか：注文の確定と決済</h3>
          <p>
            EC サイトで利用者がカートの中身を確かめて「注文を確定する」ボタンを押すと、アプリは決済代行会社の API に金額を送って請求し、その結果を注文に保存します。決済代行会社は店に代わってクレジットカードの請求を行う会社です。この店では、会員が持っているポイントを1ポイント1円として支払いに使えます。3,000 円の注文で 500 ポイントを使えば、請求する金額は 2,500 円です。
          </p>
          <p>
            決済代行会社の API は要求の本文に、店ごとの秘密鍵で作った署名（HMAC-SHA256）を付けるよう求めます。決済代行会社は署名を確かめて、要求がその店から送られたものか、途中で書き換えられていないかを判断します。秘密鍵はリポジトリに入れず、本番のサーバーの環境変数 PAYMENT_SECRET で渡します。
          </p>
          <h3>注文を確定するコード</h3>
          <p>
            起動時に読み込まれる initializer で、環境変数の値を Rails の設定（config.x）に入れます。config.x は、アプリが独自の設定を入れておくための Rails の仕組みです<Ref n={3} />。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/payment.rb（直す前）"
            code={`Rails.configuration.x.payment.endpoint = ENV["PAYMENT_ENDPOINT"] || "https://pay.example.com"
Rails.configuration.x.payment.secret = ENV["PAYMENT_SECRET"]`}
          />
          <p>PaymentGateway は決済代行会社の API を呼ぶクラスです。作るときに秘密鍵を受け取ってインスタンス変数に入れておき、請求するときに本文の署名に使います。</p>
          <Code
            lang="ruby"
            title="app/models/payment_gateway.rb（直す前）"
            code={`class PaymentGateway
  def initialize(secret: Rails.configuration.x.payment.secret,
                 endpoint: Rails.configuration.x.payment.endpoint)
    @secret = secret
    @http = Faraday.new(url: endpoint)
  end

  # 決済代行会社の API に金額と注文番号を送り、売上を作る
  def charge(amount:, order_number:)
    body = { amount:, order_number: }.to_json
    signature = OpenSSL::HMAC.hexdigest("SHA256", @secret, body)
    res = @http.post("/v1/charges", body,
                     "Content-Type" => "application/json", "X-Signature" => signature)
    JSON.parse(res.body)
  end
end`}
          />
          <p>
            注文のモデルには、使うポイントの数が0以上の整数で、会員の保有ポイント以下であることを確かめるバリデーションがあります。決済代行会社が返す売上の id（charge_id）は「ch_」で始まる文字列なので、その形も確かめています。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb"
            code={`class Order < ApplicationRecord
  belongs_to :member

  validates :used_points, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validate :used_points_within_balance
  validates :charge_id, format: { with: /\\Ach_\\w+\\z/ }, allow_nil: true # 決済代行会社の売上の id

  # 決済代行会社に請求する金額（ポイントを使った分を引く）
  def amount_due
    total - used_points
  end

  private

  def used_points_within_balance
    return if used_points.to_i <= member.points

    errors.add(:used_points, :less_than_or_equal_to, count: member.points)
  end
end`}
          />
          <p>注文を確定するアクションは、受け取ったポイントの数を to_i で整数にし、請求してから、結果を注文に保存します。</p>
          <Code
            lang="ruby"
            title="app/controllers/checkouts_controller.rb（直す前）"
            code={`class CheckoutsController < ApplicationController
  def create
    order = Order.find(params[:order_id])
    order.used_points = params[:use_points].to_i
    charge = PaymentGateway.new.charge(amount: order.amount_due, order_number: order.number)
    order.update(status: "paid", charge_id: charge["id"]) # 戻り値を見ていない
    render json: { status: order.status, charged: order.amount_due }
  end
end`}
          />
          <p>図 77-1 はこのコードに関係するクラス・設定・外部のサービスと、次の項から確かめる3つの問題の場所です。</p>
          <Figure n="77-1" title="注文の確定に関係するクラスと、問題が起きる箇所" caption="赤い文字は、この節で実行結果を確かめる3つの問題。">
            <SceneFigure />
          </Figure>
          <h3>PAYMENT_SECRET を設定せずに起動する</h3>
          <p>
            新しく用意した本番のサーバーで、PAYMENT_SECRET の設定を忘れたままデプロイした場面を再現します。spec では本番と同じく例外を 500 の応答に変える設定にし、Rails のエラーの報告（Rails.error）に届いた例外を記録します。エラーを集めるサービス（Sentry など）も、Rails.error から例外を受け取ります。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/checkouts_spec.rb（直す前。関係する部分）"
            code={`RSpec.describe "POST /orders/:order_id/checkout（直す前）", type: :request do
  let(:member) { Member.create!(name: "山田花子", points: 1200) }
  let(:order) { Order.create!(member:, number: "A-1001", total: 3000) }

  context "PAYMENT_SECRET を設定せずに起動したとき" do
    let(:reported) { [] }
    let(:subscriber) { Struct.new(:errors) { def report(error, **) = errors << error }.new(reported) }

    around do |example|
      # 本番と同じく、例外を 500 の応答にする
      Rails.application.env_config["action_dispatch.show_exceptions"] = :all
      Rails.application.env_config["action_dispatch.show_detailed_exceptions"] = false
      Rails.error.subscribe(subscriber)
      example.run
    ensure
      # …（設定を戻す。省略）
    end

    it "起動とヘルスチェックは成功し、最初の決済で 500 になる" do
      get "/up"
      puts "  GET /up: #{response.status}"
      post "/orders/#{order.id}/checkout", params: { use_points: "0" }, as: :json
      puts "  POST /orders/#{order.id}/checkout: #{response.status}"
      error = reported.first
      puts "  報告された例外: #{error.class}: #{error.message}"
      puts "  例外が起きた行: #{error.backtrace.grep(/payment_gateway/).first.sub("#{Rails.root}/", "")}"
      expect(response.status).to eq 500
    end
  end
  # …（省略）
end`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。bundle exec rspec spec/requests/checkouts_spec.rb --format documentation）"
            code={`POST /orders/:order_id/checkout（直す前）
  PAYMENT_SECRET を設定せずに起動したとき
  GET /up: 200
  POST /orders/1/checkout: 500
  報告された例外: TypeError: no implicit conversion of nil into String
  例外が起きた行: app/models/payment_gateway.rb:11:in 'PaymentGateway#charge'
    起動とヘルスチェックは成功し、最初の決済で 500 になる`}
          />
          <p>
            アプリは起動し、ヘルスチェック（/up）も 200 を返しました。Rails の /up は、アプリが例外なく起動したかどうかを返すエンドポイントです<Ref n={6} />。ロードバランサーやデプロイの仕組みはこの応答を見て、新しいサーバーに利用者の要求を流してよいかを判断します。秘密鍵が無いことは、最初の利用者が注文を確定したときに初めて表に出ました。
          </p>
          <p>
            報告された例外は TypeError で、場所は payment_gateway.rb の11行目（HMAC を計算する行）です。メッセージは「nil を文字列に変換できない」という意味で、PAYMENT_SECRET という名前はどこにも出てきません。この例外を受け取った担当者は、@secret がなぜ nil なのかを、PaymentGateway を作った場所、設定を入れた initializer、本番のサーバーの環境変数の順にたどって調べることになります。
          </p>
          <h3>保有ポイントを超える値と、負の値</h3>
          <p>次は秘密鍵を設定した状態で、保有ポイントが 1,200 の会員が 1,500 ポイントを使おうとした場合と、-500 を送った場合です。決済代行会社の API は WebMock で置き換え、送られた本文を記録します。</p>
          <Code
            lang="ruby"
            title="spec/requests/checkouts_spec.rb（直す前。続き）"
            code={`  context "PAYMENT_SECRET を設定したとき" do
    let(:sent) { [] }

    before do
      Rails.configuration.x.payment.secret = "test-secret"
      stub_request(:post, "https://pay.example.com/v1/charges").to_return do |req|
        sent << JSON.parse(req.body)
        { body: { id: "ch_0001" }.to_json }
      end
    end

    after { Rails.configuration.x.payment.secret = nil }

    %w[1500 -500].each do |points|
      it "use_points が #{points} でも決済し、注文は未払いのまま残る" do
        post "/orders/#{order.id}/checkout", params: { use_points: points }, as: :json
        order.reload
        puts "  応答: #{response.status} #{response.body}"
        puts "  決済代行会社に送った金額: #{sent.first["amount"]} 円"
        puts "  DB の注文: status=#{order.status}, used_points=#{order.used_points}, charge_id=#{order.charge_id.inspect}"
        expect(order.status).to eq "pending"
        expect(order.charge_id).to be_nil
      end
    end
  end`}
          />
          <Code
            lang="text"
            title="実行結果（続き）"
            code={`  PAYMENT_SECRET を設定したとき
  応答: 200 {"status":"paid","charged":1500}
  決済代行会社に送った金額: 1500 円
  DB の注文: status=pending, used_points=0, charge_id=nil
    use_points が 1500 でも決済し、注文は未払いのまま残る
  応答: 200 {"status":"paid","charged":3500}
  決済代行会社に送った金額: 3500 円
  DB の注文: status=pending, used_points=0, charge_id=nil
    use_points が -500 でも決済し、注文は未払いのまま残る

3 examples, 0 failures`}
          />
          <p>
            1,500 ポイントは保有ポイントを超えているので、update はバリデーションで失敗して false を返しました。アクションは戻り値を見ていないので、決済代行会社には 1,500 円を請求し、利用者には「paid」と返しました。DB の注文は pending のままで、charge_id も保存されていません。決済代行会社の側には売上があるのに、店の側にはその売上を指す記録がありません。月末に決済代行会社の売上と注文を突き合わせるまで、誰も気づきません。
          </p>
          <p>
            -500 の場合は、請求する金額が 3,000 − (−500) = 3,500 円になり、注文の金額より 500 円多く請求しました。応答の status が「paid」なのは、update が属性をメモリー上のオブジェクトに入れてからバリデーションに失敗したためです。DB の値とメモリー上の値が違うまま、メモリー上の値で応答を作っています。
          </p>
          <p>to_i は数字として読めない文字列を例外にせず、読めるところまでを整数にします。</p>
          <Code lang="text" title="実行結果（ruby -e 'p %w[1500 1,000 abc -500].to_h { [it, it.to_i] }'）" code={`{"1500" => 1500, "1,000" => 1, "abc" => 0, "-500" => -500}`} />
          <p>利用者が「1,000」と入力すると1ポイント、「abc」と入力すると0ポイントとして扱われ、どちらも誤りとして伝わりません。</p>
          <h3>このコードの問題</h3>
          <ul>
            <li>問題1：必須の設定が無くても起動します。設定の抜けは最初の決済という別の時点に、HMAC の計算という別の場所で、原因を示さない TypeError として表に出ました。</li>
            <li>問題2：利用者の入力を確かめる前に請求します。to_i は「1,000」や「abc」を誤りとして扱わず、負の数もそのまま通します。</li>
            <li>問題3：保存の失敗（false）を無視します。請求は済んだのに注文は未払いのまま残り、利用者には成功と返しました。</li>
          </ul>
          <p>
            3つに共通するのは、問題が起きた時点と場所から離れた所で、問題が表に出ることです。問題1は数分から数時間後の別のファイルで、問題3は月末の照合で見つかります。そのときには、請求済みの売上と未払いの注文という、手で直さなければならないデータが残っています。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Fail Fast の意味と由来',
      body: (
        <>
          <h3>Fail Fast の定義</h3>
          <p>
            Fail Fast は不正な状態や入力をできるだけ早く検出し、問題を隠したまま処理を続けない原則です。ここでの「早く」には2つの意味があります。1つは時間で、問題が起きてから気づくまでの時間を短くすることです。もう1つは場所で、例外が起きる行と原因の行を近づけることです。前の節の TypeError は時間も場所も原因から離れていました。
          </p>
          <p>
            「止める」はアプリ全体を止めることだけを指すわけではありません。起動時に見つけた設定の抜けならアプリを起動させず、注文の確定で見つけた入力の誤りならその要求だけを断ります。どちらも問題を見つけた所で処理を先に進めず、失敗したことを見える形で伝えます。<ChapterLink n={56} section="what-is-principle" /> の最初の例で、数量 0 の注文に 201 を返したコードへの指摘も、この形です。不正な入力を受け取った時点で 422 を返し、成功として扱わないようにします。
          </p>
          <h3>Jim Shore の2004年の記事</h3>
          <p>
            Fail Fast という呼び名を広めた資料に、Jim Shore が IEEE Software の 2004年9・10月号の設計のコラム（編集は Martin Fowler）に書いた「Fail Fast」があります<Ref n={1} />。Shore は、問題を自動的に回避してソフトウェアを頑丈にしようとすると、ソフトウェアは「failing slowly（ゆっくり失敗する）」ことになると書いています。エラーの直後は動き続けるものの、後になって奇妙な形で失敗するという意味です。これに対して fail fast するシステムは、問題が起きたときに「immediately and visibly（すぐに、見える形で）」失敗します<Ref n={1} />。
          </p>
          <p>
            記事の最初の例は設定ファイルから最大の接続数を読むメソッドです。値が無いときに既定値の 10 を返す書き方では、設定ファイルの名前を書き間違えても動き続け、利用者が使い始めてから原因のわからない遅さとして表に出ます。値が無いときに、設定の名前とファイルのパスを含む例外を投げる書き方なら、書き間違えた直後にソフトウェアが止まり、開発者はすぐに直せると Shore は説明しています<Ref n={1} />。前の節の PAYMENT_SECRET と同じ形の問題です。
          </p>
          <Figure n="77-2" title="問題に気づく時点と、起きること" caption="前の節のコードに当てはめた模式図。Shore の記事の「fail fast」と「failing slowly」の対比を、気づく時点の順に並べた。">
            <CostFigure />
          </Figure>
          <p>
            図 77-2 は同じ問題に気づく時点を左から順に並べたものです。左の3つは、問題が起きたその場で止まる場合です。右の2つは、処理が先に進んでから気づく場合で、決済のように外部に結果が残る処理が間に入ると、元に戻すための手作業が増えます。Shore も、この方法でバグの数がすぐに減るわけではなく、ほとんどの不具合を見つけやすくするのだと書いています<Ref n={1} />。
          </p>
          <h3>アサーションを置く場所と、メッセージに書くこと</h3>
          <p>
            Shore は、fail fast の中心は<Term en="assertion">アサーション</Term>だとしています<Ref n={1} />。アサーションは条件を確かめ、満たされなければ失敗する小さなコードです。Ruby では条件を確かめて例外を投げる1行（<code>raise ArgumentError, "…" if secret.blank?</code>）や、例外を投げるメソッド（ENV.fetch や save!）がこれに当たります。記事はアサーションの置き方について次のように勧めています<Ref n={1} />。
          </p>
          <ul>
            <li>コードの前提や呼び方の決まりを説明するコメントを書きたくなったら、そのコメントをアサーションにできないかを考えます。</li>
            <li>メソッドそのものの誤りを確かめるアサーションは書かず、テスト（特にテスト駆動開発）で確かめます。アサーションは、システムの境目、つまりほかの部分が自分のメソッドをどう使うかの誤りを見つけるのに向いています。</li>
            <li>null（Ruby の nil）を確かめるアサーションを、すべての代入の後に置くと、コードが役に立たないアサーションで埋まります。Shore は引数をそのままインスタンス変数に入れるときだけ確かめるという目安を使っています。インスタンス変数に入れた nil は、後で別のメソッドから使われたときに初めて例外になり、スタックトレースから原因の場所をたどれないからです。</li>
            <li>アサーションのメッセージには条件を繰り返すのではなく、直すために必要な情報（どの設定の、どのキーが無いか）を書きます。読むのはプログラマーなので、利用者向けの丁寧な文にする必要はありません。</li>
          </ul>
          <p>
            前の節の PaymentGateway は、受け取った秘密鍵を確かめずに @secret に入れ、別のメソッド（charge）で使っています。Shore の目安で確かめるべき場所そのものです。
          </p>
          <h3>止めることと、止める範囲</h3>
          <p>
            記事は fail fast にすると壊れやすいソフトウェアになるのではないかという心配にも答えています。Shore は本番でアサーションを無効にすることには反対し、そのうえでクラッシュは決して適切ではないと書いています。その間の方法として、予期しない例外を受け止めて開発者に知らせる<Term en="global exception handler">全体の例外ハンドラー</Term>を置くことを勧めています。バッチ処理なら、例外を記録してシステムの管理者を呼び出し、次の処理に進みます<Ref n={1} />。Rails では、例外を 500 の応答にするミドルウェアと Rails.error がこの役を受け持ちます（後の Rails の節で扱います）。
          </p>
          <p>この章では問題をどこから来たかで分け、止める範囲を次のように決めます。</p>
          <ul>
            <li>
              内部の不整合（必須の設定の抜け、プログラムの誤り、確かめた後の値で保存に失敗すること）：見つけた所で例外にして止めます。起動時に見つかるならアプリを起動させず、要求の途中で見つかるならその要求を 500 にして報告します。これがこの章の Fail Fast の中心です。
            </li>
            <li>
              利用者の入力の誤り：受け取った時点で確かめ、その要求だけを 422 などで断って、何が誤りかを返します。アプリは止めず、例外の報告にも送りません。早く見つける点は Fail Fast と同じですが、プログラムの誤りではないので扱いが違います。
            </li>
            <li>
              外部から届くデータ（Webhook・CSV）：形の崩れや欠けた項目が届く前提で、境界で確かめます。確かめ方は <ChapterLink n={82} />（Defensive Programming）で扱います。
            </li>
            <li>
              外部サービスの障害：決済のように欠かせないサービスならその要求の失敗を伝え、おすすめ商品のように無くても続けられるサービスなら、その部分だけを諦めて残りを表示します。後者は <ChapterLink n={91} />（Graceful Degradation）で扱います。
            </li>
          </ul>
          <h3>似た原則との違い</h3>
          <ul>
            <li>
              <ChapterLink n={80} />（Design by Contract）：メソッドの前提条件・事後条件・不変条件を決め、破られたら例外にします。Shore のアサーションは契約を確かめるコードとして読めます。Fail Fast は「いつ・どこで止めるか」を、Design by Contract は「何を確かめるか」を主に扱います。
            </li>
            <li>
              <ChapterLink n={82} />（Defensive Programming）：信頼できない外部の入力から自分のコードを守ります。外部のデータの誤りを例外で止めるのか、記録して読み飛ばすのかは、その章で扱います。
            </li>
            <li>
              <ChapterLink n={91} />（Graceful Degradation）：一部が壊れても、残りの機能で動き続けます。Fail Fast とは向きが反対に見えますが、止める範囲を決めるという点で組み合わせて使います。2つの原則の比べ方は <ChapterLink n={93} section="failfast-graceful" /> でまとめます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'apply',
      title: '起動時・入力を受け取った時点・請求の後で止める',
      body: (
        <>
          <p>前の節の3つの問題を、問題が起きる時点の早いものから順に直します。どの手順でも、止める範囲（アプリ全体か、1つの要求か）を先に決めてから書き方を選びます。</p>
          <h3>手順1：必須の設定を、起動時に確かめる</h3>
          <p>
            Ruby の <code>ENV[name]</code> は環境変数が無ければ nil を返します。<code>ENV.fetch(name)</code> は既定値もブロックも渡さなければ KeyError を投げます<Ref n={7} />。initializer で ENV.fetch を使えば、秘密鍵が無いときはアプリが起動しません。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/payment.rb（直した後）"
            code={`# 開発とテストでは決済代行会社のテスト用の値を使い、それ以外の環境では環境変数を必須にする
local = Rails.env.local?
Rails.configuration.x.payment.endpoint =
  local ? ENV.fetch("PAYMENT_ENDPOINT", "https://pay.example.com") : ENV.fetch("PAYMENT_ENDPOINT")
Rails.configuration.x.payment.secret =
  local ? ENV.fetch("PAYMENT_SECRET", "local-dummy-secret") : ENV.fetch("PAYMENT_SECRET")`}
          />
          <p>
            Rails.env.local? は、環境が development か test のときに true を返します。開発やテストで使う既定値は、本番の値と取り違えても害のない、決済代行会社のテスト用の値にします。本番とステージングでは既定値を持たないので、値が無ければ起動の時点で止まります。直す前は PAYMENT_ENDPOINT にも既定値を書いていましたが、Shore の例と同じく、本番の接続先を書き間違えても既定値で動き続けてしまうので、本番では必須にしました。
          </p>
          <p>本番の環境（RAILS_ENV=production）で、PAYMENT_SECRET を設定せずに rails runner を実行しました。rails runner はアプリを起動してから、渡した Ruby のコードを実行するコマンドです。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production PAYMENT_ENDPOINT=https://pay.example.com bin/rails runner 'puts &quot;起動しました&quot;'。先頭の3行）"
            code={`/work/ch79/config/initializers/payment.rb:6:in 'fetch': key not found: "PAYMENT_SECRET" (KeyError)
Did you mean?  "PAYMENT_ENDPOINT"
	from /work/ch79/config/initializers/payment.rb:6:in '<top (required)>'`}
          />
          <Code
            lang="text"
            title="実行結果（PAYMENT_SECRET=s3cr3t を加えたとき）"
            code={`起動しました`}
          />
          <p>
            例外の行は initializer の6行目で、メッセージに足りない環境変数の名前が出ています。Ruby の did_you_mean は、名前の似たキー（PAYMENT_ENDPOINT）も示しました。アプリが起動しないので /up も応答せず、ロードバランサーやデプロイの仕組みは、このサーバーに利用者の要求を流しません。図 77-3 は直す前と直した後で、問題が表に出る時点を比べたものです。
          </p>
          <Figure n="77-3" title="ENV[] と ENV.fetch の違い" caption="上段は前の節の実行結果、下段はこの項の実行結果をもとにした図。">
            <EnvFetchFigure />
          </Figure>
          <Callout kind="note" title="空の文字列は ENV.fetch を通る">
            <p>
              <code>PAYMENT_SECRET=</code> のように、変数はあるが値が空のときは、ENV.fetch は空の文字列を返します。空の値も止めたいときは、手順4のように使う側で確かめるか、Rails の設定の <code>Rails.configuration.x.payment.secret!</code> のように名前の後に ! を付けて読みます（後の Rails の節で動かします）。
            </p>
          </Callout>
          <h3>手順2：受け取った値を、請求の前に確かめる</h3>
          <p>注文を確定するアクションを、確かめる処理が請求より前に来る順に並べ直しました。</p>
          <Code
            lang="ruby"
            title="app/controllers/checkouts_controller.rb（直した後）"
            code={`class CheckoutsController < ApplicationController
  # 決済した後に、注文へ決済の結果を保存できなかった（プログラムの誤りなので 500 にして報告する）
  class ChargeNotRecorded < StandardError; end

  def create
    order = Order.find(params[:order_id])
    order.used_points = params.expect(:use_points) # 無ければ 400

    # 利用者の入力の誤りは、決済の前に見つけて 422 で返す
    if order.invalid?
      return render json: { errors: order.errors.full_messages }, status: :unprocessable_content
    end

    charge = PaymentGateway.new.charge(amount: order.amount_due, order_number: order.number)
    begin
      order.update!(status: "paid", charge_id: charge.fetch("id"))
    rescue ActiveRecord::RecordInvalid => e
      raise ChargeNotRecorded, "決済 #{charge["id"]} を注文 #{order.number} に保存できません（#{e.message}）"
    end
    render json: { status: order.status, charged: order.amount_due }
  end
end`}
          />
          <ul>
            <li>
              <code>params.expect(:use_points)</code> は、パラメーターが無いときや形が違うときに ActionController::ParameterMissing を投げ、Rails はそれを 400 Bad Request の応答にします<Ref n={5} />。
            </li>
            <li>
              to_i をやめて、受け取った文字列をそのまま used_points に入れます。numericality のバリデーションは、型を変換する前の値（"abc" や "1,000"）を見て、数値として読めなければ誤りにします。
            </li>
            <li>
              <code>order.invalid?</code> はバリデーションを実行し、誤りがあれば true を返します<Ref n={2} />。誤りがあれば、請求する前に 422 とメッセージを返します。
            </li>
          </ul>
          <Code
            lang="ruby"
            title="spec/requests/checkouts_spec.rb（直した後。関係する部分）"
            code={`RSpec.describe "POST /orders/:order_id/checkout（直した後）", type: :request do
  let(:member) { Member.create!(name: "山田花子", points: 1200) }
  let(:order) { Order.create!(member:, number: "A-1001", total: 3000) }
  let!(:charges) { stub_request(:post, "https://pay.example.com/v1/charges").to_return(body: { id: "ch_0001" }.to_json) }

  %w[1500 -500 abc 1,000].each do |points|
    it "use_points が #{points} なら、決済せずに 422 を返す" do
      post "/orders/#{order.id}/checkout", params: { use_points: points }, as: :json
      puts "  #{points}: #{response.status} #{response.body}"
      expect(response.status).to eq 422
      expect(charges).not_to have_been_requested
      expect(order.reload.status).to eq "pending"
    end
  end

  it "use_points が無ければ 400 を返す" do
    post "/orders/#{order.id}/checkout", params: {}, as: :json
    puts "  use_points なし: #{response.status}"
    expect(response.status).to eq 400
  end

  it "正しい値なら決済して、決済の id を保存する" do
    post "/orders/#{order.id}/checkout", params: { use_points: "500" }, as: :json
    order.reload
    puts "  500: #{response.status} #{response.body}、DB の注文: status=#{order.status}, used_points=#{order.used_points}, charge_id=#{order.charge_id}"
    expect(order).to have_attributes(status: "paid", used_points: 500, charge_id: "ch_0001")
  end
  # …（省略）
end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/checkouts_spec.rb --format documentation。一部）"
            code={`POST /orders/:order_id/checkout（直した後）
  1500: 422 {"errors":["Used points must be less than or equal to 1200"]}
  use_points が 1500 なら、決済せずに 422 を返す
  -500: 422 {"errors":["Used points must be greater than or equal to 0"]}
  use_points が -500 なら、決済せずに 422 を返す
  abc: 422 {"errors":["Used points is not a number"]}
  use_points が abc なら、決済せずに 422 を返す
  1,000: 422 {"errors":["Used points is not a number"]}
  use_points が 1,000 なら、決済せずに 422 を返す
  use_points なし: 400
  use_points が無ければ 400 を返す
  500: 200 {"status":"paid","charged":2500}、DB の注文: status=paid, used_points=500, charge_id=ch_0001
  正しい値なら決済して、決済の id を保存する`}
          />
          <p>
            誤りのある4つの値はどれも 422 になり、決済代行会社への要求は1回も送られていません（<code>not_to have_been_requested</code> が通っています）。正しい値の 500 ポイントでは 2,500 円を請求し、注文に charge_id を保存しました。ここで止めた範囲はその要求だけで、アプリはほかの要求を受け付け続けます。利用者の入力の誤りは利用者が直すものなので、例外の報告には送りません。
          </p>
          <h3>手順3：確かめた後の保存の失敗を、例外にする</h3>
          <p>
            手順2で確かめた後の update が失敗するのは、利用者の入力ではなく、プログラムの側の前提が成り立たなくなったときです。たとえば、決済代行会社が新しい API で売上の id を「py_」で始まる形に変えると、Order の charge_id のバリデーションに通りません。直す前のように false を無視すると、また未払いの注文が残ります。
          </p>
          <p>まず、update を update! に変えるだけの形を試しました。決済代行会社の応答の id を「py_0001」にして実行します。</p>
          <Code
            lang="ruby"
            title="app/controllers/checkouts_controller.rb（update! にしただけの形。関係する部分）"
            code={`    charge = PaymentGateway.new.charge(amount: order.amount_due, order_number: order.number)
    order.update!(status: "paid", charge_id: charge.fetch("id"))
    render json: { status: order.status, charged: order.amount_due }`}
          />
          <Code
            lang="text"
            title="実行結果（本番と同じく例外を応答に変える設定。Rails.error に届いた例外を数えた）"
            code={`POST /orders/:order_id/checkout（update! にしただけの形）
  応答: 422 {"status":422,"error":"Unprocessable Content"}
  DB の注文: status=pending、報告された例外: 0 件
  決済の id の形が変わると、決済した後に 422 になり、報告もされない`}
          />
          <p>
            update! は ActiveRecord::RecordInvalid を投げましたが、応答は 500 ではなく 422 で、Rails.error には何も届きませんでした。Active Record は RecordInvalid を 422 の応答に対応づけています<Ref n={8} />。Rails はこの対応表（rescue_responses）にある例外を、サーバーの誤り（500）ではなく、直す必要のあるバグでもないものとして扱い、エラーの報告に送りません<Ref n={4} /><Ref n={9} />。利用者のフォームの入力を save! で保存する場合には都合のよい扱いですが、請求の後の保存の失敗は、利用者には直せないプログラムの誤りです。このままでは、決済代行会社に売上が残ったまま、誰にも知らされません。
          </p>
          <p>
            そこで、請求の後の update! で起きた RecordInvalid を、アプリで定義した ChargeNotRecorded に変えて投げ直しました（前に載せた直した後のコード）。ChargeNotRecorded は対応表に無いので、Rails は 500 の応答にして報告します。メッセージには Shore の勧めに沿って、調べるのに必要な決済の id と注文番号を入れました。rescue の中で raise すると、Ruby は元の RecordInvalid を新しい例外の cause に入れるので、元のバリデーションの誤りもたどれます。
          </p>
          <Code
            lang="text"
            title="実行結果（直した後。決済した後に注文を保存できないとき）"
            code={`  決済した後に、注文を保存できないとき
  応答: 500
  報告された例外: CheckoutsController::ChargeNotRecorded: 決済 py_0001 を注文 A-1001 に保存できません（Validation failed: Charge is invalid）
    決済の id の形が変わると、500 を返し、例外を報告する
  応答: 500、報告された例外: KeyError: key not found: "id"
    決済の応答に id が無ければ、500 を返し、例外を報告する`}
          />
          <p>
            2つ目は、決済代行会社の応答に id が無い場合です。<code>charge["id"]</code> なら nil を保存して先に進むところを、<code>charge.fetch("id")</code> にしたので KeyError で止まり、報告されました。どちらの場合も請求は済んでいるので、担当者は報告を受けて、決済代行会社の管理画面と突き合わせて対応します。月末の照合で見つかる場合と比べると、気づくまでの時間と、調べる範囲が短くなります。
          </p>
          <p>図 77-4 は save と save! を、保存する値を誰が決めたかで選ぶ目安です。</p>
          <Figure n="77-4" title="save と save! の使い分け" caption="模式図。外部から届くデータの扱いは Defensive Programming の章で詳しく扱う。">
            <SaveFigure />
          </Figure>
          <h3>手順4：インスタンス変数に入れる値を確かめる</h3>
          <p>
            最後に、Shore の目安に沿って、PaymentGateway が受け取った秘密鍵をインスタンス変数に入れる前に確かめます。手順1で本番の起動時には確かめていますが、PaymentGateway はテストやほかのクラスからも作られ、空の文字列（ENV.fetch を通る値）が渡ることもあります。
          </p>
          <Code
            lang="ruby"
            title="app/models/payment_gateway.rb（直した後。関係する部分）"
            code={`  def initialize(secret: Rails.configuration.x.payment.secret,
                 endpoint: Rails.configuration.x.payment.endpoint)
    # 受け取った値をインスタンス変数に入れる前に確かめる（空のまま後で使われるのを防ぐ）
    raise ArgumentError, "決済の署名に使う secret が空です（PAYMENT_SECRET を確かめてください）" if secret.blank?

    @secret = secret
    @http = Faraday.new(url: endpoint)
  end`}
          />
          <Code
            lang="text"
            title="実行結果（spec/models/payment_gateway_spec.rb。PaymentGateway.new(secret: &quot;&quot;) を呼ぶ）"
            code={`PaymentGateway
  ArgumentError: 決済の署名に使う secret が空です（PAYMENT_SECRET を確かめてください）
  secret が空なら、作った時点で ArgumentError にする`}
          />
          <p>
            例外は、空の値が渡された PaymentGateway.new の行で起き、メッセージに確かめる環境変数の名前が出ます。請求のメソッド（charge）の中の HMAC の行まで進んでから TypeError になる直す前と比べると、原因の場所に近い所で止まります。
          </p>
          <p>図 77-5 は注文の確定の流れを直す前と比べたものです。</p>
          <Figure n="77-5" title="直す前と直した後の、注文の確定の流れ" caption="起動時に確かめる処理（手順1）は図 77-3 に示した。直した後の紫の箱は、問題があればその場で止まる所。">
            <BeforeAfterFigure />
          </Figure>
          <h3>直す順序</h3>
          <ol>
            <li>起動時に読む設定のうち、無いと動かないものを洗い出し、本番では ENV.fetch などで必須にします。ステージングで一度起動して、足りない変数が無いことを確かめます。</li>
            <li>請求・メールの送信・ジョブの登録のように、外部に結果が残る処理を探し、その前に入力を確かめる処理を移します。</li>
            <li>save や update の戻り値を見ていない行を探します。保存する値が利用者の入力なら戻り値で分岐して 422 を返し、プログラムが決めた値なら ! の付いたメソッドにします。</li>
            <li>コントローラーの中で、プログラムの誤りとして扱いたい RecordInvalid が起きうる所は、別の例外に変えるか、自分で報告します。</li>
            <li>400・422・500 の応答と、外部への要求が送られたかどうかを request spec で固定します。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '止める範囲を広げすぎたとき',
      body: (
        <>
          <p>
            Fail Fast を「問題が見つかったら、何でも例外にして止める」と読むと、問題と関係のない処理まで止まります。この節では月に1回のポイント付与のバッチと、注文完了のページの2つの例を動かします。どちらも前の節の「プログラムが決めた値は update! で保存する」「失敗は例外にする」を、止める範囲を考えずに当てはめた形です。
          </p>
          <h3>1人の会員のデータの誤りで、月のポイント付与が止まる</h3>
          <p>この店では毎月1日に全会員へ 100 ポイントを付与します。付与する値はプログラムが決めた値なので、図 77-4 の目安に従って update! で保存しました。</p>
          <Code
            lang="ruby"
            title="app/models/monthly_point_grant.rb（当てはめすぎた形）"
            code={`class MonthlyPointGrant
  # 会員に毎月 100 ポイントを付与する
  def self.call(members)
    members.each { |member| member.update!(points: member.points + 100) }
  end
end`}
          />
          <p>
            会員のモデルには、名前を必須にするバリデーション（<code>validates :name, presence: true</code>）があります。このバリデーションを足す前に古い画面で登録された会員には、名前が空の行が残っています。spec では3人のうち2人目の会員B の名前をバリデーションを通さずに空にしてから、付与を実行しました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/monthly_point_grant_spec.rb（当てはめすぎた形）"
            code={`RSpec.describe MonthlyPointGrant do
  it "1人の会員のデータが不正だと、その後の会員にポイントが付かない" do
    members = %w[会員A 会員B 会員C].map { |name| Member.create!(name:, points: 0) }
    members[1].update_column(:name, "") # 古い画面で登録された、名前が空の会員
    begin
      MonthlyPointGrant.call(Member.order(:id))
    rescue ActiveRecord::RecordInvalid => e
      puts "  例外: #{e.message}"
    end
    puts "  付与後のポイント: #{Member.order(:id).pluck(:points).inspect}"
    expect(Member.order(:id).pluck(:points)).to eq [100, 0, 0]
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/monthly_point_grant_spec.rb --format documentation）"
            code={`MonthlyPointGrant
  例外: Validation failed: Name can't be blank
  付与後のポイント: [100, 0, 0]
  1人の会員のデータが不正だと、その後の会員にポイントが付かない`}
          />
          <p>
            会員B の update! が RecordInvalid を投げ、each の繰り返しはそこで終わりました。会員A には付与され、会員B と、その後の会員C には付与されていません。会員C のデータには誤りが無く、会員C への付与は会員B の名前と関係がありません。会員が数万人いれば、1人の古いデータのために、その後の全員への付与が止まります。
          </p>
          <p>
            止まった後にバッチをもう一度実行すると、会員A には2回目の 100 ポイントが付きます。このバッチは付与済みの会員を区別していないからです。同じ処理を2回実行しても結果を変えない作り方は <ChapterLink n={83} />（Idempotency）で扱います。
          </p>
          <p>
            Shore の記事はバッチ処理での全体の例外ハンドラーの例として、1件ごとの処理で起きた例外を記録してシステムの管理者に知らせ、次の処理に進む形を示しています<Ref n={1} />。同じ形に直しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/monthly_point_grant.rb（直した後）"
            code={`class MonthlyPointGrant
  # 会員に毎月 100 ポイントを付与する。付与できなかった会員の id を返す
  def self.call(members)
    members.each_with_object([]) do |member, failed|
      member.update!(points: member.points + 100)
    rescue ActiveRecord::RecordInvalid => e
      # 1人分の失敗は報告して、次の会員に進む
      Rails.error.report(e, handled: true, context: { member_id: member.id })
      failed << member.id
    end
  end
end`}
          />
          <Code
            lang="ruby"
            title="spec/models/monthly_point_grant_spec.rb（直した後）"
            code={`RSpec.describe MonthlyPointGrant do
  it "不正なデータの会員を報告して、ほかの会員には付与する" do
    members = %w[会員A 会員B 会員C].map { |name| Member.create!(name:, points: 0) }
    members[1].update_column(:name, "") # 古い画面で登録された、名前が空の会員
    failed = MonthlyPointGrant.call(Member.order(:id))
    puts "  付与できなかった会員: #{failed.inspect}（会員B の id は #{members[1].id}）"
    puts "  付与後のポイント: #{Member.order(:id).pluck(:points).inspect}"
    expect(Member.order(:id).pluck(:points)).to eq [100, 0, 100]
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（直した後）"
            code={`MonthlyPointGrant
  付与できなかった会員: [2]（会員B の id は 2）
  付与後のポイント: [100, 0, 100]
  不正なデータの会員を報告して、ほかの会員には付与する`}
          />
          <p>
            会員B の失敗は Rails.error に報告され、会員A と会員C には付与されました。戻り値の配列で、付与できなかった会員の id がわかります。担当者は会員B のデータを直してから、その会員にだけ付与します。
          </p>
          <p>
            rescue するのは ActiveRecord::RecordInvalid、つまりその会員のデータがバリデーションを通らなかった場合だけです。DB に接続できない、メソッドの名前を書き間違えたといった誤りは、どの会員でも同じように起きるので、rescue せずにバッチ全体を止めます。Shore も全体の例外ハンドラーを置くなら、アプリのほかの場所ではすべての例外を捕まえるハンドラー（catch-all）を避けるよう書いています。例外が全体のハンドラーまで届かなくなるからです<Ref n={1} />。ここを <code>rescue StandardError</code> にすると、全員の付与が同じ誤りで失敗しても、バッチは会員の数だけ報告を送りながら最後まで進みます。
          </p>
          <h3>おすすめ商品の取得の失敗で、支払い済みの注文の完了ページが 500 になる</h3>
          <p>
            注文を確定すると、利用者のアプリは注文完了のページを表示します。このページの API は注文番号と支払いの状態に加えて、おすすめ商品の API から取った「一緒に買われている商品」を返します。おすすめ商品の API は社内の別のサービスで、RecommendationClient が1秒のタイムアウトで呼びます。
          </p>
          <Code
            lang="ruby"
            title="app/models/recommendation_client.rb"
            code={`class RecommendationClient
  def initialize(http: Faraday.new(url: "https://reco.example.com", request: { timeout: 1 }))
    @http = http
  end

  # 注文した商品と一緒に買われている商品を返す
  def for_order(order)
    res = @http.get("/v1/recommendations", order_number: order.number)
    JSON.parse(res.body).fetch("items")
  end
end`}
          />
          <Code
            lang="ruby"
            title="app/controllers/completions_controller.rb（当てはめすぎた形）"
            code={`class CompletionsController < ApplicationController
  # 注文完了ページ。おすすめ商品を取れなければ、そのまま例外にする
  def show
    order = Order.find(params[:order_id])
    render json: { number: order.number, status: order.status,
                   recommendations: RecommendationClient.new.for_order(order) }
  end
end`}
          />
          <p>本番と同じく例外を 500 の応答にする設定で、おすすめ商品の API がタイムアウトする場合を WebMock で再現しました。</p>
          <Code
            lang="ruby"
            title="spec/requests/completions_spec.rb（当てはめすぎた形。関係する部分）"
            code={`  it "おすすめ API がタイムアウトすると、支払い済みの注文の完了ページが 500 になる" do
    stub_request(:get, %r{\\Ahttps://reco.example.com/v1/recommendations}).to_timeout
    get "/orders/#{order.id}/completion", as: :json
    puts "  応答: #{response.status}、DB の注文: status=#{order.reload.status}"
    expect(response.status).to eq 500
  end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/completions_spec.rb --format documentation）"
            code={`GET /orders/:order_id/completion（Fail Fast を当てはめすぎた形）
  応答: 500、DB の注文: status=paid
  おすすめ API がタイムアウトすると、支払い済みの注文の完了ページが 500 になる`}
          />
          <p>
            注文は支払い済み（paid）なのに、完了ページは 500 になりました。利用者には、決済が済んだのかどうかがわかりません。決済に失敗したと考えて、もう一度注文を確定する利用者もいるかもしれません。おすすめ商品は、無くても注文の確認ができる情報です。また、おすすめ商品の API の障害はこのページのコードの誤りではありません。
          </p>
          <p>おすすめ商品の取得だけを rescue し、失敗を報告して空の一覧を返すように直しました。</p>
          <Code
            lang="ruby"
            title="app/controllers/completions_controller.rb（直した後）"
            code={`class CompletionsController < ApplicationController
  # 注文完了ページ。おすすめ商品は無くても注文の確認はできるので、取れなければ空にする
  def show
    order = Order.find(params[:order_id])
    render json: { number: order.number, status: order.status,
                   recommendations: recommendations_for(order) }
  end

  private

  def recommendations_for(order)
    RecommendationClient.new.for_order(order)
  rescue Faraday::Error => e
    Rails.error.report(e, handled: true, context: { order_id: order.id })
    []
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（直した後。spec は Rails.error に届いた例外を記録する）"
            code={`GET /orders/:order_id/completion（おすすめだけを諦める形）
  応答: 200 {"number":"A-1001","status":"paid","recommendations":[]}
  報告された例外: Faraday::ConnectionFailed
  おすすめ API がタイムアウトしても、完了ページを返し、失敗を報告する`}
          />
          <p>
            完了ページは 200 を返し、おすすめ商品の欄だけが空になりました。失敗は handled: true として Rails.error に報告されるので、おすすめ商品の API の障害には気づけます。rescue するのは Faraday::Error（接続の失敗やタイムアウト）に限り、自分たちのコードの誤りは 500 のままにします。タイムアウトの長さ、前回の結果を使った代わりの表示、障害が続くときの扱いは <ChapterLink n={91} />（Graceful Degradation）で扱います。
          </p>
          <h3>起動時に確かめる項目とアサーションを増やしすぎる</h3>
          <p>起動時に確かめる項目やアサーションも、増やしすぎると別の問題が起きます。</p>
          <ul>
            <li>
              任意の設定まで必須にする：分析サービスのキーのように、無くても注文や決済ができる設定を ENV.fetch で必須にすると、キーの設定を忘れただけでアプリ全体が起動しません。任意の設定は ENV[] で読み、値が無ければその機能だけを使わないようにして、起動時のログにその旨を書きます。
            </li>
            <li>
              起動時に外部のサービスへの接続まで確かめる：initializer で決済代行会社の API を呼んで確かめると、決済代行会社に障害が起きている間は、アプリを再起動するたびに起動に失敗し、決済を使わない商品の一覧まで表示できなくなります。起動時に確かめるのは、設定の値があるか・形が正しいかまでにします。外部のサービスにつながるかは、監視で確かめます。
            </li>
            <li>
              すべての代入の後に nil を確かめる：Shore は、この書き方ではコードが役に立たないアサーションで埋まると書き、引数をそのままインスタンス変数に入れるときに確かめるという目安を示しています<Ref n={1} />。Order のバリデーションで確かめた値を、コントローラーや PaymentGateway でもう一度確かめると、同じ規則が3か所に書かれ、規則を変えるときに直し漏れが起きます。
            </li>
          </ul>
          <h3>止める範囲を決める目安</h3>
          <p>図 77-6 は、問題がどこから来たかごとに、止める範囲を並べたものです。列は止める範囲で、左の列ほど広く止めます。</p>
          <Figure n="77-6" title="問題の出どころと、止める範囲" caption="この章の例に当てはめた目安。外部から届くデータは Defensive Programming の章、外部サービスの障害は Graceful Degradation の章で詳しく扱う。">
            <JudgeFigure />
          </Figure>
          <p>
            アプリ全体を止めるのは、必須の設定が無い場合だけです。決済の秘密鍵が無いアプリはどの要求でも決済できないので、起動させないほうが早く気づけます。利用者の入力の誤りとプログラムの誤りは、どちらも1つの要求を止めます。違いは 422 を返して利用者に直してもらうか、500 にして開発者に報告するかです。バッチの1件の誤りと、無くても続けられる外部サービスの障害は、その1件・その機能だけを止め、報告して残りを続けます。
          </p>
          <p>止める範囲に迷ったときは、次の2つを確かめます。</p>
          <ul>
            <li>続けた場合に、誤ったデータや外部への誤った要求（請求・メール）が残るか。残るなら、その処理より前で止めます。</li>
            <li>止めた場合に、問題と関係のない処理（ほかの会員への付与、注文の確認）まで止まるか。止まるなら、止める範囲を、問題が見つかった1件・1つの機能に狭めます。</li>
          </ul>
          <p>Fail Fast と Graceful Degradation の組み合わせ方は <ChapterLink n={93} section="failfast-graceful" /> でまとめます。</p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の例外の扱い・設定の読み方・MySQL の strict モード',
      body: (
        <>
          <h3>Rails は例外を応答に変え、500 になるものだけを報告する</h3>
          <p>
            Shore が勧めた全体の例外ハンドラーに当たる仕組みは、Rails にはじめから入っています。コントローラーのアクションから例外が出ると、ミドルウェアの ActionDispatch::ShowExceptions が例外を受け取り、例外のクラスに対応する HTTP のステータスコードで応答を作ります。対応は ActionDispatch::ExceptionWrapper の rescue_responses という表で決まり、表に無い例外は 500 になります<Ref n={10} />。ShowExceptions は、例外が表にあるかどうかを要求の情報（action_dispatch.report_exception）に記録し、ActionDispatch::Executor は、表に無い例外だけを Rails.error に報告します<Ref n={9} /><Ref n={11} />。Rails Guides も、rescue_responses にある例外は 500 にならず、直す必要のあるバグでもないことが多いので報告しないと説明しています<Ref n={4} />。
          </p>
          <Figure n="77-7" title="Rails が例外を変える応答と、報告するかどうか" caption="Rails 8.1.4.1 のソース（rescue_responses の表と、Active Record が加える対応）による。右の列はこの章で使った場面。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">例外</th>
                    <th scope="col">応答</th>
                    <th scope="col">Rails.error への報告</th>
                    <th scope="col">この章の場面</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ActionController::ParameterMissing</td>
                    <td>400</td>
                    <td>しない</td>
                    <td>params.expect で use_points が無い（手順2）</td>
                  </tr>
                  <tr>
                    <td>ActiveRecord::RecordNotFound</td>
                    <td>404</td>
                    <td>しない</td>
                    <td>Order.find で注文が見つからない</td>
                  </tr>
                  <tr>
                    <td>ActiveRecord::RecordInvalid</td>
                    <td>422</td>
                    <td>しない</td>
                    <td>請求の後の update! だけにした形（手順3）</td>
                  </tr>
                  <tr>
                    <td>表に無い例外（TypeError・KeyError・ChargeNotRecorded など）</td>
                    <td>500</td>
                    <td>する</td>
                    <td>秘密鍵が無いまま決済した（直す前）、決済の id を保存できない（手順3）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 77-7 の上の3行は利用者の要求の誤りとして扱われる例外です。Active Record は RecordNotFound と RecordInvalid をこの表に加えています<Ref n={8} />。手順3で、請求の後の update! の失敗が 422 になり報告されなかったのは、RecordInvalid が3行目にあるからでした。最後の行の例外は 500 になって報告されるので、この章では、利用者には直せない失敗を、表に無い例外（ChargeNotRecorded）に変えました。
          </p>
          <p>
            この仕組みがあるので、予期しない例外を rescue して 500 を返すコードを、コントローラーに書く必要はありません。rescue は図 77-6 で止める範囲を狭めると決めた所（バッチの1件、おすすめ商品の取得）に限ります。特定の例外を決まった応答に変える rescue_from の使い方は <ChapterLink n={10} section="exceptions" /> で扱いました。
          </p>
          <h3>設定を、値が空なら止まる形で読む</h3>
          <p>
            手順1では、環境変数が無いときに ENV.fetch で止めました。Rails の設定（config.x）と credentials には、値が空のときに止める読み方もあります。設定の名前の後に ! を付けると、値が nil や空の文字列のときに KeyError を投げます。config.x の値を持つ ActiveSupport::OrderedOptions が、この読み方を受け付けます<Ref n={12} />。PAYMENT_SECRET を空の値にして確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/config_bang.rb"
            code={`# Rails の設定と credentials を読むとき、名前の後に「!」を付けると、値が空なら KeyError になる
puts "x.payment.secret: #{Rails.configuration.x.payment.secret.inspect}"
begin
  Rails.configuration.x.payment.secret!
rescue KeyError => e
  puts "x.payment.secret!: #{e.class}: #{e.message}"
end
begin
  Rails.application.credentials.payment_secret!
rescue KeyError => e
  puts "credentials.payment_secret!: #{e.class}: #{e.message}"
end`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development PAYMENT_SECRET= bin/rails runner script/config_bang.rb）"
            code={`x.payment.secret: ""
x.payment.secret!: KeyError: :secret is blank
credentials.payment_secret!: KeyError: :payment_secret is blank`}
          />
          <p>
            PAYMENT_SECRET が空の値で設定されているので、initializer の ENV.fetch は空の文字列を返し、起動は止まりませんでした。読む側で secret! と書くと、空の文字列も KeyError で止まります。credentials に無いキー（payment_secret）を ! 付きで読んだときも、同じ KeyError になりました。ただし、止まるのは ! 付きで読んだ時点です。起動時に止めたいときは initializer の中で読みます。credentials の使い方は <ChapterLink n={21} section="secrets" /> で扱いました。
          </p>
          <h3>開発とテストでは止め、本番では報告して続ける</h3>
          <p>
            起こらないはずの状態に気づいたものの、本番で利用者の要求を止めるほどではない、という場面があります。たとえば、未払いの注文で注文完了のページを表示しようとした場合です。表示するだけなので、データは変わりません。Rails.error.unexpected は、このような場面のためのメソッドです。Rails Guides は、本番では例外を報告して nil を返して処理を続け、開発とテストでは新しい例外のクラスで包んで投げ、開発者に見せると説明しています<Ref n={4} />。
          </p>
          <Code
            lang="ruby"
            title="script/unexpected.rb"
            code={`# 起こらないはずの状態に気づいたとき、開発とテストでは例外にし、本番では報告して続ける
subscriber = Class.new do
  def report(error, handled:, **) = puts("報告: #{error.class}: #{error.message}（handled: #{handled}）")
end
Rails.error.subscribe(subscriber.new)

begin
  result = Rails.error.unexpected("[BUG] 未払いの注文 A-1001 の完了ページを表示しようとした")
  puts "戻り値: #{result.inspect}。処理を続けた"
rescue ActiveSupport::ErrorReporter::UnexpectedError => e
  puts "#{e.class}: #{e.message}"
end`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/unexpected.rb）"
            code={`ActiveSupport::ErrorReporter::UnexpectedError: RuntimeError: [BUG] 未払いの注文 A-1001 の完了ページを表示しようとした`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=production。PAYMENT_ENDPOINT と PAYMENT_SECRET を設定して実行）"
            code={`報告: RuntimeError: [BUG] 未払いの注文 A-1001 の完了ページを表示しようとした（handled: true）
戻り値: nil。処理を続けた`}
          />
          <p>
            開発の環境では UnexpectedError が投げられ、本番の環境では報告（handled: true）の後に nil が返って、処理が続きました。2つの環境の違いは config.consider_all_requests_local の値で決まります。Rails は、この設定が true（新しいアプリの開発とテストの環境の設定）のときに Rails.error の debug_mode を true にし、unexpected は debug_mode が true のときに例外を投げます<Ref n={13} /><Ref n={14} />。UnexpectedError は StandardError ではなく Exception を直接継承しているので、<code>rescue =&gt; e</code> では捕まえられません。途中の rescue に捕まらずに、開発者に届くようにするためです<Ref n={4} />。
          </p>
          <p>
            この方法は、テストで見つけられる問題はテストで止め、本番では止めずに報告する、という中間の扱いです。決済の金額のように、続けると誤った結果が外部に残る処理には使いません。そうした処理は本番でも例外で止めます。
          </p>
          <h3>MySQL の strict モードで、長すぎる値を止める</h3>
          <p>
            DB にも不正な値を受け取ったときに止めるか、値を変えて続けるかの設定があります。MySQL の strict モードは INSERT や UPDATE で不正な値や足りない値を受け取ったときの扱いを決めます。strict モードが無効なら、MySQL は値を調整して保存し、警告を出すだけです<Ref n={16} />。Rails の MySQL のアダプターは、database.yml の strict が無ければ true として扱い、接続ごとに SQL モードへ STRICT_ALL_TABLES を加えます。ソースのコメントはこの目的を、不正な値を切り詰めたり空にしたりせずに MySQL に拒否させるためと書いています<Ref n={15} />。
          </p>
          <Code
            lang="ruby"
            title="script/strict_mode.rb"
            code={`# Rails が MySQL の接続に設定する SQL モードと、長すぎる文字列を保存したときの動き
def save_long_number
  puts "sql_mode: #{ActiveRecord::Base.connection.select_value("SELECT @@SESSION.sql_mode")}"
  ActiveRecord::Base.transaction do
    member = Member.create!(name: "山田花子")
    order = Order.create!(member:, number: "A" * 300, total: 3000) # number は VARCHAR(255)
    puts "保存できた。DB の number の長さ: #{order.reload.number.length}"
    raise ActiveRecord::Rollback
  end
rescue ActiveRecord::ActiveRecordError => e
  puts "#{e.class}: #{e.message[0, 60]}…"
end

puts "== Rails の既定（strict: true）"
save_long_number

puts "== database.yml に strict: false を書いたとき"
ActiveRecord::Base.establish_connection(ActiveRecord::Base.connection_db_config.configuration_hash.merge(strict: false))
save_long_number`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/strict_mode.rb。MySQL 8.4）"
            code={`== Rails の既定（strict: true）
sql_mode: ONLY_FULL_GROUP_BY,NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,STRICT_ALL_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
ActiveRecord::ValueTooLong: Mysql2::Error: Data too long for column 'number' at row 1…
== database.yml に strict: false を書いたとき
sql_mode: ONLY_FULL_GROUP_BY,NO_AUTO_VALUE_ON_ZERO,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
保存できた。DB の number の長さ: 255`}
          />
          <p>
            既定の設定では 255 文字までの number の列に 300 文字を保存しようとして、ActiveRecord::ValueTooLong になりました。strict: false にすると同じ保存が成功し、DB には先頭の 255 文字だけが残りました。アプリはエラーを受け取らないので、注文番号が切れたことには、その番号で注文を探して見つからなかったときに初めて気づきます。
          </p>
          <p>
            Order に長さのバリデーション（<code>validates :number, length: {'{ maximum: 255 }'}</code>）を書けば、保存の前に止まり、利用者向けのメッセージも返せます。strict モードはバリデーションを書き忘れた列や、update_column のようにバリデーションを通らない保存でも止まるようにする、DB の側の仕組みです。
          </p>
          <h3>Rails Doctrine と、止める書き方・止めない書き方</h3>
          <p>
            Ruby と Rails は止める書き方と止めない書き方の両方を用意しています。ENV.fetch と ENV[]、save! と save、find（見つからなければ RecordNotFound）と find_by（nil を返す）、config.x の secret! と secret です。save! のように名前が ! で終わるメソッドは、失敗を例外で伝える側であることが多く、使う側は名前で選べます。
          </p>
          <p>
            Rails Doctrine の「Provide sharp knives」は、Ruby と Rails が強い道具をあえて用意し、正しい使い方を、道具を禁止するのではなく、規約と後押し（nudges）と教育で広めるという考え方を説明しています<Ref n={17} />。save の戻り値を見ないことも、必須の設定を ENV[] で読むことも、Rails は禁止しません。そのため、この章の使い分け（図 77-4・図 77-6）は、チームの規約として決めます。レビューでは「戻り値を見ていない save」「必須なのに ENV[] で読んでいる設定」を確かめます。一方で、params.expect が 400 を返すこと、RecordInvalid が 422 になること、MySQL の strict モードが既定で有効なことは、Rails が既定の設定で、問題を早く止める側に寄せている部分です。
          </p>
          <Callout kind="v72">
            <p>
              params.expect は Rails 8.0 で加わったメソッドです<Ref n={18} />。Rails 7.2 では <code>params.require(:use_points)</code> で受け取ります。値が無いときに ActionController::ParameterMissing になって 400 を返す点は同じです。Rails 7.2.2.1 のソースでも、RecordInvalid は 422（<code>:unprocessable_entity</code>）に対応づけられていて、報告されません<Ref n={19} />。Rails.error.unexpected、設定の名前に ! を付ける読み方、Rails.env.local? も、7.2.2.1 のソースに同じ形であります。
            </p>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={14} section="validations" />：バリデーションの書き方と、save と save! の違いを扱いました。この章の図 77-4 はそのどちらを選ぶかの目安です。
            </li>
            <li>
              <ChapterLink n={13} section="strict-loading" />：strict_loading は読み込んでいない関連を後から読もうとした所で例外を投げ、N+1 問題を開発中に見つけるための Rails の機能です。
            </li>
            <li>
              <ChapterLink n={25} section="production-observability" />：Rails.error に報告された例外を、本番で受け取って調べる方法を扱いました。報告を受け取る仕組みが無ければ、例外で止めても誰も気づきません。
            </li>
            <li>
              <ChapterLink n={80} />（Design by Contract）：メソッドが呼び出し側に求める条件と、呼び出し側に約束する結果を、前提条件・事後条件・不変条件として決めて確かめる方法を扱います。
            </li>
            <li>
              <ChapterLink n={82} />（Defensive Programming）：Webhook や CSV のように外部から届くデータを、境界で確かめる方法を扱います。
            </li>
            <li>
              <ChapterLink n={91} />（Graceful Degradation）：おすすめ商品の API が止まっても商品ページを表示する例で、外部サービスの障害の間に残りの機能で動き続ける方法を扱います。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          止めるのは、続けると誤ったデータや外部への誤った要求（請求・メール）が残る処理の手前です。この章では、必須の設定は起動時に、利用者の入力は請求の前に、確かめた後の保存の失敗は例外にして止めました。止める範囲は問題が見つかった1件・1つの機能に限り、関係のない処理は続けます。
        </>
      ),
      benefit: {
        text: <>直す前は、秘密鍵の環境変数が無くても起動して最初の決済で原因を示さない TypeError になり、1,500 ポイントの入力で保存に失敗しても 1,500円を請求して「paid」と返した。直した後は、起動時と請求の前で止まり、決済済みの売上と未払いの注文が残らなくなった。</>,
        basis: <><ChapterLink n={79} section="scene" />、<ChapterLink n={79} section="apply" /></>,
      },
      cost: {
        text: <>止めた場合に、問題と関係のない処理まで止まることがある。月のポイント付与を update! で止めた例では、名前が空の会員B で繰り返しが終わり、誤りの無い会員C にも付与されなかった。もう一度実行すると会員A に2回目の 100 ポイントが付いた。</>,
        basis: <ChapterLink n={79} section="overuse" />,
      },
      alternative: {
        text: <>バッチは1件ごとに RecordInvalid だけを rescue して Rails.error に報告し、残りの会員に付与を続ける。おすすめ商品の取得の失敗は Faraday::Error だけを rescue し、完了ページは 200 を返しておすすめの欄だけを空にする。</>,
        basis: <ChapterLink n={79} section="overuse" />,
      },
      criterion: {
        text: <>続けた場合に、誤ったデータや外部への誤った要求が残るか。止めた場合に、ほかの会員への付与や注文の確認のような関係のない処理まで止まるか。アプリ全体を止めるのは、必須の設定が無い場合だけにする。</>,
        basis: <ChapterLink n={79} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Fail Fast は不正な状態や入力をできるだけ早く見つけ、問題を隠したまま処理を続けない原則です。気づくまでの時間を短くし、例外が起きる場所を原因の場所に近づけます。</li>
          <li>直す前のコードは、秘密鍵の環境変数が無くても起動し、最初の決済で原因を示さない TypeError になりました。保有ポイントを超える値で請求し、保存の失敗を無視したため、決済済みの売上と未払いの注文が残りました。</li>
          <li>Jim Shore の2004年の記事は、問題を回避して動き続ける作りを failing slowly と呼び、すぐに見える形で失敗させることを勧めています。アサーションはシステムの境目とインスタンス変数に入れる値に置き、メッセージには直すために必要な情報を書きます。</li>
          <li>必須の設定は ENV.fetch や ! 付きの読み方で起動時に止めます。利用者の入力は請求の前に invalid? で確かめて 422 を返し、確かめた後の保存の失敗は update! と独自の例外で 500 にして報告します。</li>
          <li>コントローラーの中で起きた RecordInvalid は 422 の応答になり、Rails.error に報告されません。プログラムの誤りとして扱う保存の失敗は、rescue_responses に無い例外に変えます。</li>
          <li>止める範囲は、問題が見つかった範囲に限ります。バッチの1件のデータの誤りや、無くても続けられる外部サービスの障害は、報告して残りを続けます。rescue する例外のクラスは、その範囲で起きるものに絞ります。</li>
          <li>Rails は例外を応答に変えて報告する仕組み、Rails.error.unexpected、MySQL の strict モードを持っています。どこで止めるかの使い分けは、チームの規約として決めてレビューで確かめます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Fail Fast', publisher: 'Jim Shore / IEEE Software（martinfowler.com に置かれた複製）', url: 'https://www.martinfowler.com/ieeeSoftware/failFast.pdf', accessed: '2026-11-22', version: '2004年9・10月号（Design のコラム。編集は Martin Fowler）', note: '問題を自動で回避するソフトウェアは failing slowly になり、fail fast するソフトウェアは問題が起きたときにすぐに見える形で失敗すること。設定ファイルから値を読む例（既定値を返す書き方と例外を投げる書き方）。バグの数をすぐに減らすのではなく見つけやすくすること。アサーションの置き場所（コメントの代わり、システムの境目、引数をインスタンス変数に入れるとき）とメッセージに書く情報。本番でアサーションを無効にしないこと、クラッシュは適切でなく全体の例外ハンドラーを置くこと、バッチでは記録して管理者に知らせ次の処理に進むこと、ほかの場所で catch-all のハンドラーを避けること。' },
    { title: 'Active Record Validations（Checking Validity）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_validations.html#checking-validity', accessed: '2026-11-22', version: 'Rails 8.1', note: 'valid? と invalid? がバリデーションを実行し、invalid? が valid? の逆の値を返すこと。' },
    { title: 'Configuring Rails Applications（Custom Configuration）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html#custom-configuration', accessed: '2026-11-22', version: 'Rails 8.1', note: 'config.x にアプリ独自の設定（入れ子の設定）を入れ、Rails.configuration.x から読めること。設定していない値は nil を返すこと。' },
    { title: 'Error Reporting in Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/error_reporting.html#reporting-unexpected-errors', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Rails が HTTP の要求・ジョブ・rails runner の未処理の例外を Rails.error に報告すること。rescue_responses にある例外は 500 にならず、直す必要のあるバグでもないことが多いので報告しないこと。Rails.error.unexpected が、本番では報告して nil を返して処理を続け、開発とテストでは新しい例外のクラスで包んで投げること（上の階層の rescue に捕まらないようにするため）。' },
    { title: 'Action Controller Overview（Strong Parameters・expect）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_overview.html#expect', accessed: '2026-11-22', version: 'Rails 8.1', note: 'params.expect が、必要なパラメーターが無いときや形が違うときに 400 Bad Request の応答にすること。' },
    { title: 'railties/lib/rails/health_controller.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/health_controller.rb#L6-L16`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '/up が、アプリが例外なく起動していれば 200、そうでなければ 500 を返すこと。ロードバランサーや監視がこの応答を使うこと。' },
    { title: 'class ENV（fetch）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/ENV.html#method-c-fetch', accessed: '2026-11-22', version: 'Ruby 4.0', note: 'ENV.fetch が、既定値もブロックも渡さずに無い名前を読むと KeyError を投げること。ENV[] は環境変数が無ければ nil を返すこと。' },
    { title: 'activerecord/lib/active_record/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railtie.rb#L23-L28`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Active Record が rescue_responses に RecordNotFound（404）、StaleObjectError（409）、RecordInvalid と RecordNotSaved（422）を加えること。' },
    { title: 'actionpack/lib/action_dispatch/middleware/show_exceptions.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/show_exceptions.rb#L32-L38`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'ShowExceptions が例外を受け取り、rescue_responses にある例外かどうかで action_dispatch.report_exception を決めること。' },
    { title: 'actionpack/lib/action_dispatch/middleware/exception_wrapper.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/exception_wrapper.rb#L12-L29`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'rescue_responses の表。ParameterMissing などが 400 に対応し、表に無い例外は internal_server_error（500）になること。' },
    { title: 'actionpack/lib/action_dispatch/middleware/executor.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/executor.rb#L19-L37`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'action_dispatch.report_exception が true の例外と、ミドルウェアを通り抜けた例外を、Rails.error に handled: false で報告すること。' },
    { title: 'activesupport/lib/active_support/ordered_options.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/ordered_options.rb#L28-L58`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '名前の後に ! を付けて読むと、値が blank のときに KeyError（「:名前 is blank」）を投げること。' },
    { title: 'activesupport/lib/active_support/error_reporter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/error_reporter.rb#L146-L155`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'unexpected が、debug_mode のときは UnexpectedError を投げ、そうでなければ handled: true で報告すること。同じファイルの33行目で UnexpectedError を Exception の直接のサブクラスとして定義していること。' },
    { title: 'railties/lib/rails/application/bootstrap.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/bootstrap.rb#L66-L72`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'config.consider_all_requests_local が true のときに Rails.error.debug_mode を true にすること。新しいアプリの環境の設定（railties の generators のテンプレート）は、development と test でこの設定を true、production で false にしていること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L982-L995`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '不正な値を切り詰めたり空にしたりせずに MySQL に拒否させるため、接続ごとに STRICT_ALL_TABLES を加えること。strict: false のときは STRICT_TRANS_TABLES などを外すこと。strict の既定が true であること（685〜687行目）。' },
    { title: 'MySQL 8.4 Reference Manual 7.1.11 Server SQL Modes（Strict SQL Mode）', publisher: 'Oracle', url: 'https://dev.mysql.com/doc/refman/8.4/en/sql-mode.html#sql-mode-strict', accessed: '2026-11-22', version: 'MySQL 8.4', note: 'strict モードが INSERT・UPDATE での不正な値・足りない値の扱いを決めること。strict モードが無効なら値を調整して挿入し、警告を出すこと。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '「Provide sharp knives」で、Ruby と Rails が強い道具をあえて用意し、使い方を禁止ではなく規約・後押し（nudges）・教育で広めると述べていること。' },
    { title: 'actionpack/CHANGELOG.md（Rails 8.0.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.0.0/actionpack/CHANGELOG.md', accessed: '2026-11-20', version: 'Rails 8.0.0', note: 'params.expect が Rails 8.0 で加わったこと。不正な形の値で 400 を返すこと。' },
    { title: 'activerecord/lib/active_record/railtie.rb（Rails 7.2.2.1）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.2.1/activerecord/lib/active_record/railtie.rb#L23-L28', accessed: '2026-11-22', version: 'Rails 7.2.2.1', note: 'Rails 7.2.2.1 で RecordInvalid が :unprocessable_entity（422）に対応づけられていること。同じ版の gem で、show_exceptions.rb の report_exception の決め方、error_reporter.rb の unexpected、ordered_options.rb の ! 付きの読み方、environment_inquirer.rb の local? が 8.1.4.1 と同じ形であることを確かめた。' },
  ],
}

export default chapter
