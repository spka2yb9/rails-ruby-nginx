import type { ReactNode } from 'react'
import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 認証と認可の流れ ---------- */
function AuthFlowFigure() {
  return (
    <Svg
      id="102-2"
      w={780}
      h={300}
      label="要求は、まず認証で Cookie の session_id に対応する Session を探す。見つからなければログイン画面へ 302 で移動する。見つかれば Current.user が決まり、次に認可でスコープやポリシーを使って記事と操作を確かめる。許可なら 200、範囲外の記事は 404、ポリシーが拒否すれば 403 を返す"
    >
      <Box x={20} y={40} w={160} h={56} lines={['要求', 'Cookie: session_id']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={180} y1={68} x2={218} y2={68} />
      <Box x={220} y={40} w={200} h={56} lines={['認証', 'require_authentication']} fs={12} bold fill="box" subTone="muted" />
      <Arrow x1={320} y1={96} x2={320} y2={148} />
      <T x={328} y={122} fs={11} tone="muted">
        Session がない
      </T>
      <Box x={220} y={150} w={200} h={44} lines={['302 → /session/new']} fs={12} fill="box5" />
      <Arrow x1={420} y1={68} x2={458} y2={68} />
      <Box x={460} y={40} w={170} h={56} lines={['Current.session', 'Current.user が決まる']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={545} y1={96} x2={545} y2={128} />
      <Box x={460} y={130} w={170} h={56} lines={['認可', 'スコープ・ポリシー']} fs={12} bold fill="box" subTone="muted" />
      <Arrow x1={630} y1={148} x2={658} y2={116} />
      <Arrow x1={630} y1={158} x2={658} y2={170} />
      <Arrow x1={630} y1={168} x2={658} y2={224} />
      <Box x={660} y={96} w={100} h={40} lines={['200', '許可']} fs={12} fill="box5" subTone="muted" />
      <Box x={660} y={150} w={100} h={40} lines={['404', '範囲外']} fs={12} fill="box5" subTone="muted" />
      <Box x={660} y={204} w={100} h={40} lines={['403', '操作を拒否']} fs={12} fill="box5" subTone="muted" />
      <T x={20} y={268} fs={11} tone="muted">
        実測：ログイン前の /drafts/1 は 302、ログイン後の自分の下書きは 200、Bob の下書きは 404、Bob の記事の更新は 403
      </T>
    </Svg>
  )
}

/* ---------- bcrypt のダイジェストの中身 ---------- */
function DigestFigure() {
  const cw = 9.6
  const x0 = 40
  const segs = [
    { text: '$2a$', label: '方式（2a）', ly: 92 },
    { text: '12$', label: 'コスト 12', ly: 120 },
    { text: 'bAYxaVwVfm2sErHfpDNf0O', label: 'ソルト（22 文字）', ly: 92 },
    { text: 'w1GFPQQnEXd0W81r3Hdr5BDj85zEXHm', label: 'ハッシュ値（31 文字）', ly: 92 },
  ]
  let x = x0
  const placed = segs.map((s) => {
    const w = s.text.length * cw
    const r = { ...s, x, w }
    x += w
    return r
  })
  return (
    <Svg
      id="102-3"
      w={780}
      h={200}
      label="password_digest の値は、方式を表す $2a$、コストの 12、22 文字のソルト、31 文字のハッシュ値をつなげた 60 文字の文字列。照合するときは、保存した値からソルトとコストを取り出し、入力されたパスワードを同じ条件で計算して比べる"
    >
      <T x={20} y={22} bold fs={12.5}>
        alice の password_digest（60 文字）
      </T>
      {placed.map((s, i) => (
        <g key={s.text}>
          <rect x={s.x} y={40} width={s.w} height={30} fill={i === 2 ? 'var(--fig-box4)' : i === 3 ? 'var(--fig-box5)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
          <T x={s.x + 1} y={55} fs={16} mono>
            {s.text}
          </T>
          <line x1={s.x + s.w / 2} y1={70} x2={s.x + s.w / 2} y2={s.ly - 9} stroke="var(--fig-line)" />
          <T x={s.x + s.w / 2} y={s.ly} fs={11.5} anchor="middle">
            {s.label}
          </T>
        </g>
      ))}
      <T x={20} y={156} fs={11.5}>
        照合では、保存した値からソルトとコストを取り出し、入力されたパスワードを同じ条件で計算して比べる
      </T>
      <T x={20} y={180} fs={11} tone="muted">
        コスト 12 は 2 の 12 乗回の繰り返しを表す。この環境では authenticate_by 1回に約 0.28〜0.32 秒かかった
      </T>
    </Svg>
  )
}

/* ---------- ログイン・後続の要求・ログアウト ---------- */
function LoginSequenceFigure() {
  const lanes = [
    { x: 90, name: 'ブラウザー（curl）' },
    { x: 340, name: 'Rails のコントローラー' },
    { x: 620, name: 'DB（users・sessions）' },
  ]
  const msgs: { y: number; from: number; to: number; text: string }[] = [
    { y: 82, from: 0, to: 1, text: 'POST /session（メールとパスワード）' },
    { y: 112, from: 1, to: 2, text: 'User.authenticate_by（bcrypt で照合）' },
    { y: 142, from: 1, to: 2, text: 'INSERT INTO sessions（user_id・IP・UA）' },
    { y: 172, from: 1, to: 0, text: '302、Set-Cookie: session_id（署名付き）' },
    { y: 222, from: 0, to: 1, text: 'GET /drafts/1、Cookie: session_id' },
    { y: 252, from: 1, to: 2, text: 'Session.find_by(id: 署名を検証した値)' },
    { y: 302, from: 0, to: 1, text: 'DELETE /session' },
    { y: 332, from: 1, to: 2, text: 'DELETE FROM sessions、Cookie を削除' },
  ]
  return (
    <Svg
      id="102-5"
      w={780}
      h={370}
      label="ログインでは、ブラウザーがメールとパスワードを送り、コントローラーが authenticate_by で照合して sessions 表に行を作り、その id を署名付きの Cookie で返す。後続の要求では Cookie の署名を検証して Session を探す。ログアウトでは sessions の行を削除し、Cookie も消す"
    >
      {lanes.map((l) => (
        <g key={l.name}>
          <Box x={l.x - 85} y={14} w={170} h={34} lines={l.name} fs={12} bold fill="box" />
          <line x1={l.x} y1={48} x2={l.x} y2={350} stroke="var(--fig-line)" strokeDasharray="4 4" />
        </g>
      ))}
      <T x={760} y={66} fs={11} tone="muted" anchor="end">
        ログイン
      </T>
      <T x={760} y={206} fs={11} tone="muted" anchor="end">
        後続の要求
      </T>
      <T x={760} y={286} fs={11} tone="muted" anchor="end">
        ログアウト
      </T>
      {msgs.map((m) => {
        const x1 = lanes[m.from].x
        const x2 = lanes[m.to].x
        const left = Math.min(x1, x2)
        return (
          <g key={m.y}>
            <Arrow x1={x1 + (x2 > x1 ? 2 : -2)} y1={m.y} x2={x2 + (x2 > x1 ? -2 : 2)} y2={m.y} accent={m.text.startsWith('302')} />
            <T x={left + 6} y={m.y - 9} fs={11}>
              {m.text}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 6（段階送り）ログインから古い Cookie まで ---------- */
interface AuthStep { label: string; req: string[]; db: string | null; res: string[]; jar: string[]; rows: string[]; text: ReactNode }
function AuthExchange({ i, step }: { i: number; step: AuthStep }) {
  const lines = (arr: string[], x: number, arrowY: number) =>
    arr.map((t, k) => <T key={k} x={x} y={arrowY - 12 - (arr.length - 1 - k) * 14} anchor="middle" fs={11} mono>{t}</T>)
  return (
    <Svg id={`102-8-${i}`} w={780} h={274}
      label={`curl が ${step.req.join('、')} を送る。${step.db ? `Rails は DB に ${step.db} を送る。` : 'Rails は DB に問い合わせない。'}Rails は ${step.res.join('、')} を返す。${step.jar.join('：')}。${step.rows.join('：')}。`}>
      <Box x={10} y={8} w={100} h={34} lines="curl" bold />
      <Box x={325} y={8} w={150} h={34} lines="Rails" bold accent />
      <Box x={640} y={8} w={130} h={34} lines="DB" bold fill="box4" />
      {[60, 400, 705].map((x) => <line key={x} x1={x} y1={42} x2={x} y2={196} stroke="var(--fig-line)" strokeDasharray="4 4" />)}
      {lines(step.req, 230, 96)}
      <Arrow x1={62} y1={96} x2={398} y2={96} accent />
      {step.db ? (
        <>
          <T x={552} y={112} anchor="middle" fs={11} mono>{step.db}</T>
          <Arrow x1={402} y1={124} x2={703} y2={124} />
        </>
      ) : (
        <T x={552} y={124} anchor="middle" fs={11} tone="muted">DB には問い合わせない</T>
      )}
      {lines(step.res, 230, 186)}
      <Arrow x1={398} y1={186} x2={62} y2={186} />
      <Box x={10} y={204} w={370} h={62} lines={step.jar} fs={12} fill="box4" bold align="start" subTone="muted" />
      <Box x={400} y={204} w={370} h={62} lines={step.rows} fs={12} fill="box4" bold align="start" subTone="muted" />
    </Svg>
  )
}

const AUTH_STEPS: AuthStep[] = [
  {
    label: 'ログイン前に下書きを開く',
    req: ['GET /drafts/1', '（Cookie の session_id なし）'],
    db: null,
    res: ['HTTP/1.1 302 Found', 'location: http://localhost:3000/session/new'],
    jar: ['curl が持つ Cookie', 'session_id はまだない'],
    rows: ['sessions 表', '行はない'],
    text: <>Rails の <code>require_authentication</code> が Cookie の <code>session_id</code> を探します。見つからないので、<code>request_authentication</code> が開こうとした URL を <code>session</code> に記録し、ログイン画面へ移動させます。Cookie がないときは DB に問い合わせません。</>,
  },
  {
    label: 'ログインする',
    req: ['POST /session', 'email_address=alice@… password=…'],
    db: 'INSERT INTO sessions（user_id 2 …）',
    res: ['HTTP/1.1 302 Found', 'location: http://localhost:3000/drafts/1', 'set-cookie: session_id=eyJf…--a3b2f8d6…'],
    jar: ['curl が持つ Cookie', 'session_id（中身は id 2、署名付き、期限は20年後）'],
    rows: ['sessions 表', 'id 2・user_id 2・127.0.0.1・curl/8.14.1'],
    text: <>パスワードが合うと、<code>start_new_session_for</code> が sessions 表に行を作り、その id の 2 を署名付きの Cookie で返します。移動先の <code>location</code> は前の段階で記録した <code>/drafts/1</code> です。</>,
  },
  {
    label: '認証が要るページを開く',
    req: ['GET /drafts/1', 'Cookie: session_id=eyJf…--a3b2f8d6…'],
    db: 'SELECT … FROM sessions WHERE id = 2',
    res: ['HTTP/1.1 200 OK', 'Alice の下書き'],
    jar: ['curl が持つ Cookie', 'session_id（id 2）'],
    rows: ['sessions 表', 'id 2 の行があるので、利用者は user_id 2'],
    text: <>Rails は Cookie の署名を検証して id の 2 を取り出し、sessions 表から行を読んで利用者を決めます。開発環境のログでは、ログイン後のすべての要求でこの問い合わせが1回ずつ実行されていました。</>,
  },
  {
    label: 'ログアウトする',
    req: ['DELETE /session', 'Cookie: session_id=eyJf…--a3b2f8d6…'],
    db: 'DELETE FROM sessions WHERE id = 2',
    res: ['HTTP/1.1 303 See Other', 'location: http://localhost:3000/session/new'],
    jar: ['curl が持つ Cookie', 'session_id を消す（実験では値を控えておいた）'],
    rows: ['sessions 表', 'id 2 の行を削除した'],
    text: <><code>terminate_session</code> が sessions 表の行を削除し、<code>cookies.delete(:session_id)</code> で Cookie の削除も指示します。この実験では次の段階で使うために、ログアウトの前に Cookie の値を控えておきました。</>,
  },
  {
    label: '古い Cookie を送る',
    req: ['GET /drafts/1', 'Cookie: session_id=（控えた値）'],
    db: 'SELECT … FROM sessions WHERE id = 2',
    res: ['HTTP/1.1 302 Found', 'location: http://localhost:3000/session/new'],
    jar: ['curl が持つ Cookie', '控えた session_id（署名は正しい）'],
    rows: ['sessions 表', 'id 2 の行がないので、利用者を決められない'],
    text: <>控えた値の署名は正しいので、id の 2 は取り出せます。しかし sessions 表に id 2 の行がないので、Rails は利用者を決められず、ログイン画面へ移動させます。<ChapterLink n={94} section="cookies" /> の CookieStore では古い値を拒否できませんでした。サーバー側に行を持つこの方式では、行を消せば古い Cookie も使えなくなります。</>,
  },
]

const authSteps = AUTH_STEPS.map((step, i) => ({ label: step.label, detail: <><AuthExchange i={i + 1} step={step} /><p>{step.text}</p></> }))

const chapter: Chapter = {
  number: 102,
  part: 4,
  title: '認証と認可',
  summary:
    'Rails 8.1 の認証ジェネレーターで作ったアプリを実際に動かし、パスワードの照合、Cookie とセッション、試行回数の制限、API のトークンを確かめます。そのうえで、利用者が読み書きできる記事をスコープと Pundit のポリシーで絞り、RSpec で検証します。',
  goals: [
    '認証と認可の結果を区別し、302・401・403・404 を使い分けられる',
    'has_secure_password と認証ジェネレーターが作るコードを読み、セッションの発行と失効を説明できる',
    'API のトークン、generates_token_for、JWT のそれぞれで、検証と失効に必要な処理を説明できる',
    '検索の範囲を利用者に限定して IDOR を防ぎ、ポリシーとスコープを RSpec でテストできる',
  ],
  prerequisites: [94, 10, 11],
  sections: [
    {
      id: 'authentication',
      title: '誰かを確認し、その人に操作を許すか判断する',
      body: (
        <>
          <p>
            ブログの管理画面で、著者が自分の下書きを開く場面を考えます。サーバーはまず、要求を送ってきたのが誰かを確かめます。ログイン画面でパスワードを照合し、その結果を後続の要求でも使えるようにする処理を<Term en="authentication">認証</Term>と呼びます。利用者が分かっても、他の人の下書きを開いてよいとは限りません。対象の記事と操作を見て、許可する条件に合うかを判断するのが<Term en="authorization">認可</Term>です。
          </p>
          <Figure n={figureNumber(102, 1)} title="下書きを表示する前の二つの判断" caption="認証の結果が同じ利用者でも、どの記事を要求したかによって認可の結果は変わります。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>要求に対応する利用者</th>
                    <th>記事</th>
                    <th>結果の例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>確認できない</td>
                    <td>任意の下書き</td>
                    <td>ログイン画面へ案内する</td>
                  </tr>
                  <tr>
                    <td>利用者 A</td>
                    <td>A の下書き</td>
                    <td>記事を返す</td>
                  </tr>
                  <tr>
                    <td>利用者 A</td>
                    <td>B の下書き</td>
                    <td>表示を許可しない</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            この章では、Rails 8.1.4.1 で作った練習用のアプリ（<code>rails new blog --minimal -d mysql</code>）に認証ジェネレーターを実行し、著者の alice と bob、管理者の admin、alice の下書き（id 1）と公開記事（id 2）、bob の下書き（id 3）を用意しました。アプリを Docker のコンテナで起動し、curl で要求を送って結果を確かめます。
          </p>
          <Figure n={figureNumber(102, 2)} title="認証と認可を通る要求の流れ" caption="この章のアプリでの実測の結果を書き込んでいます。認証の処理は ApplicationController に取り込んだ Authentication モジュールが、認可の処理は各コントローラーとポリシーが受け持ちます。">
            <AuthFlowFigure />
          </Figure>
          <p>
            応答のステータスは判定の結果に合わせて選びます。ブラウザーの画面では、ログインしていない利用者をログイン画面へ 302 で移動させます。API では有効な認証情報がないときに 401 と、認証方式を示す <code>WWW-Authenticate</code> ヘッダーを返します
            <Ref n={5} />。認証できても操作を許可しないときは 403 が候補です。他人の下書きのように、対象の存在自体を知らせたくないときは 404 を返す設計にできます。
          </p>
          <p>
            画面のボタンを表示するかどうかは補助的な制御です。ボタンがなくても、利用者は URL を直接打ったり curl で要求を送ったりできます。サーバーは受け取った要求ごとに、認証と認可を独立に行います。脆弱性として何が起きるかの全体像は <ChapterLink n={21} section="authentication" />と <ChapterLink n={21} section="object-authorization" />で扱います。この章はそれを実装して動かす手順に絞ります。
          </p>
        </>
      ),
    },
    {
      id: 'password',
      title: 'パスワードを照合するための値を保存する',
      body: (
        <>
          <p>
            パスワードをデータベースに保存する場合、元の値を読み戻せる形で持つ必要はありません。ログインのときに利用者から渡された値を、保存済みのハッシュ値と照合できれば足ります。Rails の <code>has_secure_password</code> は bcrypt でハッシュ値を計算し、<code>password_digest</code> の列に保存します
            <Ref n={3} />。bcrypt は、計算に時間がかかるように繰り返しの回数（コスト）を決められるハッシュ関数で、利用者ごとに異なるランダムな値（ソルト）を混ぜます。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行（development 環境）"
            code={`
alice = User.create!(email_address: " Alice@Example.test ", password: "correct horse battery")
alice.email_address    # => "alice@example.test"（normalizes で前後の空白を除き小文字に）
alice.password_digest  # => "$2a$12$bAYxaVwVfm2sErHfpDNf0Ow1GFPQQnEXd0W81r3Hdr5BDj85zEXHm"
BCrypt::Engine.cost    # => 12
alice.authenticate("wrong")                  # => false
alice.authenticate("correct horse battery")  # => alice
`}
          />
          <Figure n={figureNumber(102, 3)} title="password_digest の値の中身" caption="bcrypt の値は、方式・コスト・ソルト・ハッシュ値を1つの文字列にまとめたものです。ソルトが値の中にあるので、別の列に保存する必要はありません。">
            <DigestFigure />
          </Figure>
          <p>
            コストを 1 上げると計算の時間は約2倍になります。照合に時間がかかるのは、データベースが漏れた場合に、攻撃者が辞書の単語を片端から試す費用を高くするためです。この環境ではログインに使う <code>User.authenticate_by</code> の1回が約 0.28〜0.32 秒でした。Rails はテスト環境では <code>ActiveModel::SecurePassword.min_cost</code> を真にして、最小のコストで計算します。
          </p>
          <h3>登録されていないメールアドレスでも同じ時間をかける</h3>
          <Code
            lang="text"
            title="User.authenticate_by を5回ずつ実行した時間の中央値"
            code={`
登録済みのアドレスで誤ったパスワード   316.7 ms
登録されていないアドレス               283.8 ms
登録済みのアドレスで正しいパスワード   276.4 ms
`}
          />
          <p>
            <code>authenticate_by</code> はメールアドレスに一致する利用者がいない場合も、渡されたパスワードで新しいインスタンスを作り、bcrypt の計算を1回行ってから nil を返します（<code>secure_password.rb</code> の 41〜58 行目）
            <Ref n={4} />。登録されていないアドレスだけ応答が速いと、時間を測ってアドレスが登録済みかを推測できるからです。実測でも3つの時間は同程度でした。<code>User.find_by(email_address:)&amp;.authenticate(password)</code> と書くと、未登録のときに bcrypt の計算を飛ばすので、この対策が失われます。
          </p>
          <h3>72 バイトの上限</h3>
          <p>
            bcrypt は 72 バイトを超える部分を無視します。そのため <code>has_secure_password</code> は、72 バイトを超えるパスワードを検証のエラーにします（<code>MAX_PASSWORD_LENGTH_ALLOWED = 72</code>）
            <Ref n={3} />。上限は文字数ではなくバイト数です。「あ」は UTF-8 で 3 バイトなので、24 文字（72 バイト）は通り、25 文字（75 バイト）では <code>Password is too long</code> になりました。日本語を含むパスワードを受け付ける画面では、入力欄で制限する文字数と、この上限のバイト数を取り違えないようにします。
          </p>
          <p>
            ログインの入力値、保存したハッシュ値、リセット用のトークンは、ログや通常の JSON の応答に出しません。実際にこのアプリのログでは、ログインの要求のパラメーターが <code>{'{"email_address" => "[FILTERED]", "password" => "[FILTERED]"}'}</code> と伏せられていました。新しいアプリの <code>config/initializers/filter_parameter_logging.rb</code> が、名前に password や email を含むパラメーターを伏せる設定を持つからです。
          </p>
        </>
      ),
    },
    {
      id: 'generator',
      title: 'Rails の認証ジェネレーターが作るもの',
      body: (
        <>
          <p>
            Rails 8.0 から、ログインの基本的な仕組みを生成する <code>bin/rails generate authentication</code> が使えます。Devise のような gem を加えず、生成されたコードを自分のアプリのコードとして読んで直せることが特徴です
            <Ref n={1} />
            <Ref n={13} />。練習用のアプリで実行した出力は次のとおりです。
          </p>
          <Code
            lang="text"
            title="bin/rails generate authentication の出力（Rails 8.1.4.1、--minimal のアプリ）"
            code={`
      invoke  erb
      create    app/views/passwords/new.html.erb
      create    app/views/passwords/edit.html.erb
      create    app/views/sessions/new.html.erb
      create  app/models/session.rb
      create  app/models/user.rb
      create  app/models/current.rb
      create  app/controllers/sessions_controller.rb
      create  app/controllers/concerns/authentication.rb
      create  app/controllers/passwords_controller.rb
      insert  app/controllers/application_controller.rb
       route  resources :passwords, param: :token
       route  resource :session
         run  bundle add bcrypt
    generate  migration
       rails  generate migration CreateUsers email_address:string!:uniq password_digest:string! --force
    generate  migration
       rails  generate migration CreateSessions user:references ip_address:string user_agent:string --force
`}
          />
          <Figure n={figureNumber(102, 4)} title="生成されるファイルと役割" caption="generator のソース（authentication_generator.rb の 17〜57 行目）と実行結果から作った表です。Action Mailer を外した --minimal のアプリでは、メーラーとパスワード再設定のメール送信の部分が生成されませんでした。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ファイル</th>
                    <th>役割</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>app/models/user.rb</code></td><td><code>has_secure_password</code>、<code>has_many :sessions</code>、メールアドレスの正規化</td></tr>
                  <tr><td><code>app/models/session.rb</code></td><td>ログイン1回ごとの記録（user_id・ip_address・user_agent）</td></tr>
                  <tr><td><code>app/models/current.rb</code></td><td>要求ごとに現在の Session と User を持つ <code>CurrentAttributes</code></td></tr>
                  <tr><td><code>app/controllers/concerns/authentication.rb</code></td><td>全アクションでログインを要求する <code>before_action</code>、Cookie から Session を探す処理、ログインとログアウト</td></tr>
                  <tr><td><code>app/controllers/sessions_controller.rb</code></td><td>ログイン画面、ログイン（<code>rate_limit</code> 付き）、ログアウト</td></tr>
                  <tr><td><code>app/controllers/passwords_controller.rb</code> とビュー</td><td>パスワード再設定。トークンの検証と新しいパスワードの保存</td></tr>
                  <tr><td><code>app/mailers/passwords_mailer.rb</code> とビュー</td><td>再設定のメール（Action Mailer があるアプリだけ）</td></tr>
                  <tr><td><code>app/channels/application_cable/connection.rb</code></td><td>Action Cable の接続でも Cookie から利用者を探す（Action Cable があるアプリだけ）</td></tr>
                  <tr><td>2つのマイグレーション</td><td>users（email_address は一意索引）と sessions（user への外部キー）</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <Code
            lang="ruby"
            title="app/models/user.rb・session.rb・current.rb（生成されたまま）"
            code={`
class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy

  normalizes :email_address, with: ->(e) { e.strip.downcase }
end

class Session < ApplicationRecord
  belongs_to :user
end

class Current < ActiveSupport::CurrentAttributes
  attribute :session
  delegate :user, to: :session, allow_nil: true
end
`}
          />
          <p>
            <code>Current</code> は <code>ActiveSupport::CurrentAttributes</code> を継承したクラスで、属性の値は要求ごとに分かれ、要求の処理が終わるとリセットされます
            <Ref n={8} />。Puma の複数のスレッドが同時に別の利用者の要求を処理しても、<code>Current.user</code> が混ざりません（クラスの属性に入れた値が混ざる例は <ChapterLink n={23} section="thread-safety" />）。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/concerns/authentication.rb（生成されたまま。行番号付き）"
            code={`
 4  included do
 5    before_action :require_authentication
 6    helper_method :authenticated?
 7  end
 ...
20    def require_authentication
21      resume_session || request_authentication
22    end
23
24    def resume_session
25      Current.session ||= find_session_by_cookie
26    end
27
28    def find_session_by_cookie
29      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
30    end
31
32    def request_authentication
33      session[:return_to_after_authenticating] = request.url
34      redirect_to new_session_path
35    end
 ...
41    def start_new_session_for(user)
42      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
43        Current.session = session
44        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
45      end
46    end
47
48    def terminate_session
49      Current.session.destroy
50      cookies.delete(:session_id)
51    end
`}
          />
          <p>
            5 行目の <code>before_action</code> で、すべてのアクションがログインを要求します。ログインなしで開ける画面にするには、コントローラーで <code>allow_unauthenticated_access</code> を宣言します。生成された <code>SessionsController</code> は <code>new</code> と <code>create</code> に、<code>PasswordsController</code> は全体にこれを宣言しています。ログインを要求しない画面を足し忘れる誤りより、ログインを要求し忘れる誤りのほうが被害が大きいので、既定を「要求する」側に倒した作りです。
          </p>
        </>
      ),
    },
    {
      id: 'session',
      title: 'ログインを後続の要求で確認する',
      body: (
        <>
          <p>
            記事を開くたびにパスワードを送る代わりに、ログインに成功したらブラウザーに Cookie を発行し、後続の要求ではその Cookie で利用者を確認します。ジェネレーターのコードは sessions 表に1行を作り、その id を署名付きの Cookie に入れます。curl でログインから後続の要求、ログアウトまでを送りました。
          </p>
          <Code
            lang="text"
            title="script/session_flow.sh の出力（抜粋。Cookie の値は途中を省略）"
            code={`
--- 1. ログイン前に下書きを開く
302 http://localhost:3000/session/new
--- 2. パスワードを間違える
302 http://localhost:3000/session/new
--- 3. 正しいパスワードでログイン（応答ヘッダー）
HTTP/1.1 302 Found
location: http://localhost:3000/drafts/1
set-cookie: session_id=eyJfcmFpbHMiOnsibWVzc2FnZSI6Ik1nPT0iLCJleHAiOiIyMDQ2LTExLTI3VDEy…--a3b2f8d686b252ab5fcb4932dab596523534b795;
            path=/; expires=Tue, 27 Nov 2046 12:31:17 GMT; httponly; samesite=lax
--- 7. ログアウト
DELETE /session 303 http://localhost:3000/session/new
--- 8. ログアウトの前に控えた Cookie をもう一度送る
302 http://localhost:3000/session/new
`}
          />
          <Figure n={figureNumber(102, 5)} title="ログイン・後続の要求・ログアウトのやり取り" caption="上の curl の実行と、生成された Authentication モジュールのコードから描いた図です。">
            <LoginSequenceFigure />
          </Figure>
          <p>
            ログイン前に <code>/drafts/1</code> を開くと、<code>request_authentication</code> が開こうとした URL をセッションに記録してから、ログイン画面へ移動させました。ログインに成功すると、記録した <code>/drafts/1</code> へ戻されています。そのときの sessions 表には <code>[2, 2, "127.0.0.1", "curl/8.14.1"]</code>（id・user_id・ip_address・user_agent）の行ができました。利用者の画面に「ログイン中の端末」を並べ、端末ごとにログアウトさせる機能は、この表を使って作れます。
          </p>
          <p>
            <code>session_id</code> の Cookie の値は <code>--</code> の前後に分かれます。前半を Base64 として読むと <code>{'{"_rails":{"message":"Mg==","exp":"2046-11-27T12:31:17.531Z","pur":"cookie.session_id"}}'}</code> で、<code>Mg==</code> は Session の id の "2" です。この値は暗号化されておらず、誰でも読めます。後半は <code>secret_key_base</code> から作った署名で、値を書き換えると署名が合わなくなり、<code>cookies.signed[:session_id]</code> は nil を返します。<code>permanent</code> を付けたので、有効期限は20年後です。
          </p>
          <p>
            ログアウトでは <code>terminate_session</code> が sessions の行を削除しました。控えておいた古い Cookie を送っても、署名は正しいのに対応する行がないので、ログイン画面へ移動しました。サーバー側の行を消せば、その端末のログインをすぐに無効にできます。一方、Cookie の有効期限が20年なので、行を消さない限りログインは続きます。一定の期間使われていない Session を削除するジョブや、重要な操作の前にパスワードを再入力させる仕組みは、要件に応じて足します。
          </p>
          <p>
            ログインから古い Cookie の要求までを、要求と応答の1往復ずつ図 {figureNumber(102, 6)} に並べます。段階を進めると、curl が持つ Cookie と sessions 表の行がどう変わり、Rails がどちらを見て利用者を決めるかを確かめられます。
          </p>
          <Figure n={figureNumber(102, 6)} title="ログインから古い Cookie の要求までを1往復ずつ進める（段階送り）" caption="上の session_flow.sh の出力と、開発環境のログに出た SQL をもとにした概念モデルです。ヘッダーと SQL は一部だけを示し、Cookie の値は途中を省いています。実際のブラウザーは 302 の後に location の URL を自動で要求し、ログイン画面のフォームに入った CSRF のトークンを付けて POST を送ります。削除を指示された Cookie は送りません。">
            <Stepper steps={authSteps} />
          </Figure>
          <p>
            Rails の <code>session</code>（CookieStore）に利用者の id を入れる方式とは、失効のさせ方が違います。両者の比較、セッション固定攻撃への対策は <ChapterLink n={21} section="session-protection" />で扱います。Cookie をブラウザーが自動で送る画面では、変更要求の送信元を検証する <ChapterLink n={21} section="csrf">CSRF 対策</ChapterLink>も必要です。実際、curl で記事を更新する要求に、ログインのフォームに埋め込まれたトークンを付けて送ったところ、<code>ActionController::InvalidAuthenticityToken</code> で 422 になりました。新しいアプリはフォームごとに別のトークンを使う設定なので、ログインの POST 用のトークンは記事の PATCH には使えません。画面の <code>csrf-token</code> のメタタグの値を付けると通りました。
          </p>
        </>
      ),
    },
    {
      id: 'rate-limit',
      title: 'ログインの試行回数を制限する',
      body: (
        <>
          <p>
            パスワードを総当たりで試す攻撃に対して、生成された <code>SessionsController</code> は <code>rate_limit</code> でログインの回数を制限しています。
          </p>
          <Code lang="ruby" title="app/controllers/sessions_controller.rb（3 行目）" code={`rate_limit to: 10, within: 3.minutes, only: :create, with: -> { redirect_to new_session_path, alert: "Try again later." }`} />
          <p>
            3分の間に同じ接続元から 10 回を超える <code>create</code>（ログインの POST）が来たら、<code>with</code> の処理を実行してアクションを止めます。誤ったパスワードで12回続けてログインし、毎回の応答のメッセージを調べました。
          </p>
          <Code
            lang="text"
            title="script/rate_limit.sh の出力"
            code={`
12:31:34 1 回目: Try another email address or password.
  …（2〜9 回目も同じ）
12:31:37 10 回目: Try another email address or password.
12:31:37 11 回目: Try again later.
12:31:37 12 回目: Try again later.
--- 正しいパスワード（制限中）
Try again later.
`}
          />
          <p>
            11 回目から「Try again later.」に変わり、制限の間は正しいパスワードでもログインできませんでした。<code>rate_limit</code> は既定で <code>request.remote_ip</code> ごとに数えます。<code>rate_limiting</code> の処理はキャッシュのストアの <code>increment</code> で「rate-limit:コントローラー名:接続元」のキーを1増やし、<code>within</code> の期間で期限を切ります（<code>rate_limiting.rb</code> の 72〜90 行目）
            <Ref n={6} />。
          </p>
          <p>
            数を数える場所はキャッシュのストアです。この練習用のアプリの development 環境は <code>:memory_store</code> で、数はプロセスのメモリーにあります。Puma のワーカーが複数あると、ワーカーごとに別々に数えることになります。本番では Solid Cache や Redis のように、すべてのプロセスが共有するストアを使います。<code>rate_limit</code> の <code>store:</code> で、制限用に別のストアを渡すこともできます
            <Ref n={6} />。
          </p>
          <p>
            接続元の IP アドレスで数える方式には限界もあります。同じ会社の利用者が1つの IP アドレスから接続していると、誰かの誤入力が続いたときに、同じ IP アドレスから接続している利用者がログインできなくなります。逆に、多くの IP アドレスから少しずつ試す攻撃は止められません。アカウントごとの失敗回数も数える、多要素認証を使うといった対策は、要件と運用の手間を比べて決めます（<ChapterLink n={21} section="mfa-and-federation" />）。Nginx の前段で IP アドレスごとの要求数を制限する方法もあります。
          </p>
        </>
      ),
    },
    {
      id: 'bearer',
      title: 'API の要求に添える Bearer トークン',
      body: (
        <>
          <p>
            別のサービスやスマートフォンのアプリが Rails の API を呼ぶときは、Cookie の代わりに <code>Authorization</code> ヘッダーで<Term en="bearer token">Bearer トークン</Term>を送る方式がよく使われます。Bearer は「持参人」の意味で、その値を持っている人なら誰でも使えます
            <Ref n={5} />。値は HTTPS で送り、URL のクエリやログに記録しないようにします。
          </p>
          <p>
            練習用のアプリでは、発行したトークンを api_tokens 表で管理しました。十分にランダムな値を作って利用者に一度だけ渡し、表にはその SHA-256 のダイジェストだけを保存します。表が漏れても、ダイジェストから元のトークンは計算できません。パスワードと違って値が十分に長いランダムな文字列なので、bcrypt のように時間をかける必要はなく、ダイジェストを条件にして索引で探せます。
          </p>
          <Code
            lang="ruby"
            title="app/models/api_token.rb と API のコントローラー"
            code={`
class ApiToken < ApplicationRecord
  belongs_to :user

  # 平文のトークンは発行時に一度だけ返し、DB にはダイジェストだけを保存する
  def self.issue!(user, expires_in: 30.days)
    raw = SecureRandom.base58(32)
    user.api_tokens.create!(token_digest: digest(raw), expires_at: expires_in.from_now)
    raw
  end

  def self.authenticate(raw)
    token = where(expires_at: Time.current..).find_by(token_digest: digest(raw))
    token&.touch(:last_used_at)
    token&.user
  end

  def self.digest(raw) = OpenSSL::Digest::SHA256.hexdigest(raw)
end

class Api::ArticlesController < ActionController::API
  include ActionController::HttpAuthentication::Token::ControllerMethods
  before_action :authenticate_api_user

  def index
    render json: @api_user.articles.order(:id).pluck(:id, :title)
  end

  private
    def authenticate_api_user
      @api_user = authenticate_with_http_token { |token, _options| ApiToken.authenticate(token) }
      request_http_token_authentication unless @api_user
    end
end
`}
          />
          <Code
            lang="text"
            title="curl で API を呼んだ結果"
            code={`
$ curl -i http://localhost:3000/api/articles
HTTP/1.1 401 Unauthorized
www-authenticate: Token realm="Application"
HTTP Token: Access denied.

$ curl -H "Authorization: Bearer wrong-token" http://localhost:3000/api/articles   # => 401
$ curl -H "Authorization: Bearer $(cat tmp/api_token.txt)" http://localhost:3000/api/articles
[[1,"Alice の下書き（改）"],[2,"Alice の公開記事"]]
`}
          />
          <p>
            <code>authenticate_with_http_token</code> は <code>Authorization</code> ヘッダーからトークンを取り出してブロックに渡すだけで、検証はブロックの中でアプリが行います
            <Ref n={7} />。ヘッダーの形式は <code>/^(Token|Bearer)\s+/</code> の正規表現で判定するので、<code>Bearer</code> と <code>Token</code> のどちらも受け付けます（<code>http_authentication.rb</code> の 427 行目）。<code>request_http_token_authentication</code> は 401 と <code>WWW-Authenticate: Token realm="Application"</code> を返しました。OAuth 2.0 の Bearer トークンの規約（RFC 6750）に合わせる API なら、このヘッダーを <code>Bearer</code> の形式で返すように書き換えます。
          </p>
          <p>
            期限は <code>expires_at</code> で、失効は行の削除で行えます。利用者ごと・クライアントごとに発行しておけば、漏れたトークンだけを止められます。1つの API キーを全員で共有する設計では、交換するときにすべてのクライアントを同時に更新する必要があります。<code>last_used_at</code> を記録しておくと、使われていないトークンを見つけて削除できます。
          </p>
        </>
      ),
    },
    {
      id: 'token-for',
      title: 'generates_token_for で期限付きのトークンを作る',
      body: (
        <>
          <p>
            メールアドレスの確認やパスワードの再設定のリンクには、一定の時間だけ使えるトークンが必要です。Active Record の <code>generates_token_for</code> は、表に列を足さずにこのトークンを作れます
            <Ref n={9} />。ブロックの戻り値がトークンに埋め込まれ、検証のときにレコードの現在の値と比べられます。値が変わっていれば、トークンは使えなくなります。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb に追加"
            code={`
generates_token_for :email_confirmation, expires_in: 15.minutes do
  email_address
end
`}
          />
          <Code
            lang="text"
            title="bin/rails runner での実行結果"
            code={`
t = alice.generate_token_for(:email_confirmation)
User.find_by_token_for(:email_confirmation, t)            # => alice
alice.update!(email_address: "alice2@example.test")
User.find_by_token_for(:email_confirmation, t)            # => nil（アドレスが変わった）

t = alice.generate_token_for(:email_confirmation)
travel(14.minutes) { User.find_by_token_for(:email_confirmation, t) }  # => alice
travel(16.minutes) { User.find_by_token_for(:email_confirmation, t) }  # => nil（期限切れ）

# トークンの前半を Base64 として読む
{"_rails":{"data":[1,"alice2@example.test"],"exp":"2026-11-27T12:44:52.638Z","pur":"User\\nemail_confirmation\\n900"}}
`}
          />
          <p>
            最後の行が示すように、トークンは署名付きで、暗号化されていません。ブロックの戻り値のメールアドレスがそのまま読める形で入っています。メールで送るリンクにアドレスが入っても困らない用途ならこのままでよいですが、秘密にしたい値をブロックで返してはいけません。<code>has_secure_password</code> が用意する <code>password_reset_token</code> は、ブロックでパスワードのソルトの末尾 10 文字を返します（<code>secure_password.rb</code> の 171〜179 行目）
            <Ref n={3} />。実際に、パスワードを変更した後は古い再設定のトークンで <code>find_by_password_reset_token</code> が nil を返しました。期限の既定は 15 分です。
          </p>
          <p>
            このトークンは発行の記録を持たないので、ブロックの値が変わるか期限が来るまで、個別に失効させることはできません。API のトークンのように長く使い、端末ごとに止めたいものには、前の節のように表で管理する方式が向いています。
          </p>
        </>
      ),
    },
    {
      id: 'jwt',
      title: 'JWT を使うときに確かめること',
      body: (
        <>
          <p>
            JWT（JSON Web Token）は、ヘッダー・ペイロード・署名を <code>.</code> でつないだトークンで、ペイロードに利用者の番号や権限、期限を入れて署名します。受け取ったサーバーは署名を検証すれば、データベースを検索せずに中身を信用できます。複数のサービスで同じトークンを検証したい場合に使われます。JWT の構造と失効の考え方は <ChapterLink n={21} section="mfa-and-federation" />でも扱います。ここでは jwt gem（3.3.1）で、検証の設定を誤ったときに何が起きるかを確かめます
            <Ref n={14} />。
          </p>
          <Code
            lang="text"
            title="script/exp_jwt.rb の実行結果"
            code={`
ヘッダー: {"alg":"HS256"}
ペイロード: {"sub":"2","scope":"articles:read","iss":"blog","aud":"blog-api","iat":1795782716,"exp":1795783616}
ペイロードを書き換え（署名を検証）: JWT::VerificationError: Signature verification failed
ペイロードを書き換え（検証なし）: 受け入れた {"sub" => "4", "scope" => "admin"}
alg: none のトークン（HS256 だけを許可）: JWT::IncorrectAlgorithm: Expected a different algorithm
期限切れ: JWT::ExpiredSignature: Signature has expired
別のサービス向け（aud が違う）: JWT::InvalidAudError: Invalid audience. Expected blog-api, received other-service
`}
          />
          <Code
            lang="ruby"
            title="検証するときの呼び出し"
            code={`
JWT.decode(token, SECRET, true,
           algorithm: "HS256",                 # 受け入れる方式を固定する
           iss: "blog", verify_iss: true,      # 発行者
           aud: "blog-api", verify_aud: true)  # 宛先のサービス
# exp（期限）は既定で検証される
`}
          />
          <p>
            ペイロードは Base64 なので誰でも読めます。パスワードや個人情報を入れてはいけません。<code>JWT.decode(token, nil, false)</code> のように検証を無効にすると、<code>sub</code> を 4（管理者）に、<code>scope</code> を admin に書き換えたトークンをそのまま受け入れました。署名を検証しないコードはデバッグ用でも本番の経路に残さないようにします。受け入れる方式を固定しておくと、ヘッダーで <code>alg: none</code>（署名なし）を名乗るトークンも拒否されました。方式・発行者・宛先を固定して検証することは、JWT の運用の推奨事項（RFC 8725）にも挙げられています
            <Ref n={15} />。
          </p>
          <p>
            JWT の弱点は失効です。署名と期限だけで検証する構成では、発行したトークンを期限前に止める方法がありません。利用者がログアウトしても、漏れたトークンは期限まで使えます。止める必要がある場合は、失効したトークンの識別子（<code>jti</code>）の一覧をサーバーに持つか、期限を数分にして更新用のトークンを別に管理します。どちらもサーバーに状態を持つことになるので、1つの Rails アプリの API なら、前の節の表で管理するトークンのほうが単純な場合が多いです。
          </p>
        </>
      ),
    },
    {
      id: 'authorization',
      title: '利用者が検索できる範囲を絞る',
      body: (
        <>
          <p>
            著者が自分の下書きを読む画面では、記事の id を URL から受け取ります。このとき、ログインしているかだけを確かめて <code>Article.find(params[:id])</code> で探すと、URL の数字を変えるだけで他人の記事を読めてしまいます。この種の欠陥を<Term en="Insecure Direct Object Reference">IDOR</Term>と呼びます。練習用のアプリに、持ち主を確かめない悪い例と、確かめる例の2つのコントローラーを用意しました。
          </p>
          <Code
            lang="ruby"
            title="悪い例と、利用者の範囲で探す例"
            code={`
# 悪い例：ログインしているかだけを確かめ、記事の持ち主を確かめていない
class LeakyDraftsController < ApplicationController
  def show
    @article = Article.where(published: false).find(params[:id])
    render plain: @article.title
  end
end

class DraftsController < ApplicationController
  def show
    @article = Current.user.articles.where(published: false).find(params[:id])
    render plain: @article.title
  end
end
`}
          />
          <Code
            lang="text"
            title="alice でログインして、alice の下書き（1）と bob の下書き（3）を開いた結果"
            code={`
/drafts/1 200 Alice の下書き
/drafts/3 404
/leaky_drafts/3 200 Bob の下書き
`}
          />
          <p>
            悪い例では、alice が bob の下書きを読めました。<code>Current.user.articles</code> から探す例では、SQL が <code>WHERE articles.user_id = 2 AND articles.published = FALSE AND articles.id = 3 LIMIT 1</code> になり（開発環境のログで確認）、該当する行がないので <code>ActiveRecord::RecordNotFound</code> から 404 になりました。404 にすると、bob の下書きが存在することも alice に知られません。利用者の id は URL やフォームの値から取らず、認証の結果の <code>Current.user</code> から取ります。
          </p>
          <p>
            一覧、詳細、更新、削除のすべてのアクションで同じ範囲を使います。一覧だけ絞って詳細で絞り忘れると、一覧に出ない記事を URL で開けます。管理者は全記事を見られる、公開記事は誰でも見られる、のように条件が増えてくると、条件をアクションごとに書く方式では漏れが出やすくなります。次の節では、条件を1つのクラスにまとめる Pundit を使います。
          </p>
          <p>
            権限は変わることがあります。編集者が所属先を離れた場合、セッションがまだ有効でも、現在の所属に基づいて次の編集を拒否できるようにします。権限をログイン時に Cookie やトークンへ記録する設計では、その値をいつ更新するか、変更後から更新までの間も編集を許してよいかを決めます。毎回の要求でデータベースの現在の値から判定すれば、この問題は起きません。
          </p>
        </>
      ),
    },
    {
      id: 'pundit',
      title: 'Pundit でポリシーとスコープを分ける',
      body: (
        <>
          <p>
            Pundit は認可の規則を、モデルごとの<Term en="policy">ポリシー</Term>クラスにまとめる gem です
            <Ref n={10} />。ポリシーは「この利用者がこの記事にこの操作をしてよいか」を <code>update?</code> のような真偽のメソッドで答え、<code>Scope</code> は「この利用者が見てよい記事の集合」を Relation で返します。前者は1件の操作、後者は一覧の検索に使います。
          </p>
          <Code
            lang="ruby"
            title="app/policies/article_policy.rb"
            code={`
class ArticlePolicy
  attr_reader :user, :article

  def initialize(user, article)
    @user = user
    @article = article
  end

  def show? = article.published? || owner? || admin?
  def update? = owner? || admin?

  class Scope
    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      return @scope.all if @user&.admin?
      return @scope.published unless @user
      @scope.published.or(@scope.where(user: @user))
    end
  end

  private
    def owner? = user.present? && article.user_id == user.id
    def admin? = user&.admin? || false
end
`}
          />
          <Code
            lang="ruby"
            title="ApplicationController と ArticlesController"
            code={`
class ApplicationController < ActionController::Base
  include Authentication
  include Pundit::Authorization

  rescue_from Pundit::NotAuthorizedError do
    head :forbidden
  end

  private
    # Pundit は既定で current_user を使う。生成された認証は Current.user を持つ
    def pundit_user = Current.user
end

class ArticlesController < ApplicationController
  allow_unauthenticated_access only: :index
  before_action :resume_session, only: :index   # ログインしていれば Current.user を設定する
  after_action :verify_authorized, except: :index
  after_action :verify_policy_scoped, only: :index

  def index
    render plain: policy_scope(Article).order(:id).pluck(:title).join("\\n")
  end

  def update
    @article = Article.find(params[:id])
    authorize @article                            # ArticlePolicy#update? が false なら例外
    @article.update!(params.expect(article: [:title]))
    render plain: @article.title
  end
end
`}
          />
          <p>
            Pundit は既定で <code>current_user</code> を呼んで利用者を得ますが、Rails の認証ジェネレーターのコードには <code>current_user</code> がありません。そこで <code>pundit_user</code> を定義して <code>Current.user</code> を渡しました。<code>allow_unauthenticated_access</code> を宣言したアクションでは <code>require_authentication</code> が動かないので、ログイン中の利用者を使いたい一覧では <code>resume_session</code> を呼んでいます。呼ばないと、ログインしていても <code>Current.user</code> は nil のままです。
          </p>
          <p>
            <code>verify_authorized</code> はアクションの中で <code>authorize</code> を一度も呼ばなかったときに例外を上げます。新しいアクションを足して認可を書き忘れても、開発中に気付けます。curl で alice として送った結果は次のとおりでした。
          </p>
          <Figure n={figureNumber(102, 7)} title="利用者ごとの認可の結果" caption="一覧は ArticlePolicy::Scope、更新は ArticlePolicy#update? の定義から決まる結果です。このうち alice の一覧と更新（200 と 403）は curl で、未ログイン・alice・bob・admin の一覧と、bob と admin による alice の記事の更新は RSpec で確かめました。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>利用者</th>
                    <th>一覧に出る記事</th>
                    <th>alice の記事の更新</th>
                    <th>bob の記事の更新</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>ログインしていない</td><td>公開記事だけ</td><td>ログイン画面へ</td><td>ログイン画面へ</td></tr>
                  <tr><td>alice</td><td>公開記事と alice の下書き</td><td>200</td><td>403</td></tr>
                  <tr><td>bob</td><td>公開記事と bob の下書き</td><td>403</td><td>200</td></tr>
                  <tr><td>admin</td><td>すべて</td><td>200</td><td>200</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            更新を拒否したときに 403 と 404 のどちらを返すかは、記事の存在を知られてよいかで決めます。公開記事の更新を拒否する場合は記事が見えているので 403 で問題ありません。下書きのように存在自体を隠したい場合は、<code>policy_scope(Article).find(params[:id])</code> で探してから <code>authorize</code> すると、範囲外の記事は 404 になります。
          </p>
        </>
      ),
    },
    {
      id: 'authz-tests',
      title: '認可を RSpec で確かめる',
      body: (
        <>
          <p>
            認可のテストは2段に分けます。ポリシーのテストでは、利用者と記事の組み合わせごとに <code>update?</code> や <code>Scope</code> の結果を確かめます。リクエストスペックでは、実際の要求で 403・404・200 が返り、拒否したときに記事が変わらないことを確かめます。ログインは生成された <code>SessionsController</code> に POST して行い、以降の要求は発行された Cookie を引き継ぎます（RSpec の準備は <ChapterLink n={20} />）。
          </p>
          <Code
            lang="ruby"
            title="spec/policies/article_policy_spec.rb"
            code={`
RSpec.describe ArticlePolicy do
  let(:alice) { User.create!(email_address: "alice@example.test", password: "local-test-password") }
  let(:bob) { User.create!(email_address: "bob@example.test", password: "local-test-password") }
  let(:admin) { User.create!(email_address: "admin@example.test", password: "local-test-password", admin: true) }
  let!(:draft) { alice.articles.create!(title: "下書き", published: false) }
  let!(:published) { bob.articles.create!(title: "公開記事", published: true) }

  describe "#update?" do
    it { expect(described_class.new(alice, draft).update?).to be(true) }
    it { expect(described_class.new(bob, draft).update?).to be(false) }
    it { expect(described_class.new(admin, draft).update?).to be(true) }
    it { expect(described_class.new(nil, draft).update?).to be(false) }
  end

  describe "Scope" do
    def titles(user) = described_class::Scope.new(user, Article).resolve.order(:id).pluck(:title)

    it "未ログインは公開記事だけ、本人は自分の下書きも、管理者はすべて" do
      expect(titles(nil)).to eq(["公開記事"])
      expect(titles(bob)).to eq(["公開記事"])
      expect(titles(alice)).to eq(["下書き", "公開記事"])
      expect(titles(admin)).to eq(["下書き", "公開記事"])
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/support/sign_in_helper.rb と spec/requests/drafts_spec.rb（抜粋）"
            code={`
module SignInHelper
  def sign_in_as(user, password: "local-test-password")
    post session_path, params: { email_address: user.email_address, password: password }
    expect(cookies[:session_id]).to be_present
  end
end

RSpec.describe "下書きの表示", type: :request do
  let(:alice) { User.create!(email_address: "alice@example.test", password: "local-test-password") }
  let(:bob) { User.create!(email_address: "bob@example.test", password: "local-test-password") }
  let!(:alice_draft) { alice.articles.create!(title: "Alice の下書き", published: false) }
  let!(:bob_draft) { bob.articles.create!(title: "Bob の下書き", published: false) }

  it "自分の下書きは表示でき、他人の下書きは 404 になる" do
    sign_in_as alice

    get draft_path(alice_draft)
    expect(response).to have_http_status(:ok)

    get draft_path(bob_draft)
    expect(response).to have_http_status(:not_found)
  end

  it "ログアウトした後は、同じ Cookie を送っても認証されない" do
    sign_in_as alice
    old_cookie = cookies[:session_id]
    delete session_path

    cookies[:session_id] = old_cookie
    get draft_path(alice_draft)
    expect(response).to redirect_to(new_session_path)
  end
end

# spec/requests/articles_spec.rb では、bob による更新が 403 で、記事の題名が変わらないことも確かめる
`}
          />
          <Code
            lang="text"
            title="bundle exec rspec --format documentation の結果（抜粋）"
            code={`
ArticlePolicy
  #update?
    is expected to equal true
    is expected to equal false
    is expected to equal true
    is expected to equal false
  Scope
    未ログインは公開記事だけ、本人は自分の下書きも、管理者はすべて

記事の更新
  持ち主は更新できる
  持ち主でない利用者は 403 になり、記事は変わらない
  管理者は他人の記事も更新できる

API のトークン認証
  トークンがないと 401 と WWW-Authenticate を返す
  期限切れのトークンは受け付けない

下書きの表示
  ログイン前はログイン画面へ移動する
  自分の下書きは表示でき、他人の下書きは 404 になる
  持ち主を確かめない画面では他人の下書きが見える（IDOR）
  ログアウトした後は、同じ Cookie を送っても認証されない

14 examples, 0 failures
`}
          />
          <p>
            リクエストスペックが 404 を受け取れるのは、Rails 8.1 の新しいアプリがテスト環境に <code>config.action_dispatch.show_exceptions = :rescuable</code> を設定し、<code>ActiveRecord::RecordNotFound</code> を 404 の応答に変えるからです
            <Ref n={11} />。テスト環境では CSRF の検証も無効なので、PATCH や DELETE にトークンを付けずに送れます。
          </p>
          <p>
            認可のテストでは、許可される場合よりも拒否される場合を多く書きます。他人の記事、未ログイン、権限の低い利用者、公開から下書きに戻した記事、管理者の権限を外した直後の利用者などです。拒否された要求で、応答のステータスだけでなく、データが変わっていないことも確かめます。IDOR の悪い例のテストは学習のために「見えてしまう」ことを確かめていますが、実際のアプリでは他人の記事が 404 になることを確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'choices',
      title: '標準の生成コードと認証ライブラリを選ぶ',
      body: (
        <>
          <p>
            ブラウザーの管理画面なら、Rails の認証ジェネレーターが作るセッションとパスワード認証を出発点にできます。生成されたコントローラーとモデルは、この章の --minimal のアプリで数えて 110 行ほどで、動かしながら全体を読めます。その代わり、利用者の自己登録、メールアドレスの確認、アカウントのロック、多要素認証、外部サービスでのログインは含まれていないので、必要なら自分で足します。
          </p>
          <p>
            これらの機能が最初から必要なら、Devise の提供範囲と比べます
            <Ref n={12} />。Devise は登録（registerable）、メール確認（confirmable）、ロック（lockable）などをモジュールとして選んで使えます。導入すると決めたら、採用するモジュールの既定値、Rails のバージョンとの互換性、生成されたファイルにどこまで手を入れるかを確認します。Devise を使う構成の具体例は <ChapterLink n={21} section="authentication" />で扱います。
          </p>
          <Figure n={figureNumber(102, 8)} title="利用するクライアントと認証情報の管理" caption="ログアウト、失効、期限切れをどこで実施するかは方式ごとに決めます。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>利用場面</th>
                    <th>選択肢</th>
                    <th>失効のさせ方（この章で確かめたこと）</th>
                    <th>検討する条件</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Web 画面</td><td>Cookie と sessions 表（認証ジェネレーター）</td><td>行を削除すると、古い Cookie はログイン画面へ戻された</td><td>端末ごとのログアウト、Cookie の属性、CSRF、使われない Session の削除</td></tr>
                  <tr><td>別のサービスやアプリからの API</td><td>表で管理するトークン</td><td>行の削除か expires_at。期限後は 401 になった</td><td>許可範囲、期限、交換、last_used_at</td></tr>
                  <tr><td>メールのリンク</td><td>generates_token_for</td><td>期限か、ブロックの値の変更（アドレス変更で nil）</td><td>トークンに入る値が読まれてよいか</td></tr>
                  <tr><td>複数のサービスで検証を共有</td><td>JWT</td><td>期限まで止められない（失効には別の仕組み）</td><td>受け入れる方式・iss・aud の固定、短い期限</td></tr>
                  <tr><td>組織で共通のログインを使う</td><td>外部の ID プロバイダー</td><td>ID プロバイダー側でアカウントを止める</td><td>組織での本人確認、停止時のアクセス、アプリ側の権限</td></tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            認可の仕組みも同じように選びます。条件が「自分の記事だけ」程度なら、<code>Current.user.articles</code> から探すスコープで足ります。管理者、編集者、閲覧者のような役割があり、同じ規則を一覧と詳細と更新で使う場合は、Pundit のようにポリシーを1か所にまとめると、規則とテストの対応が見えやすくなります。どちらの場合も、認可の判定はサーバーで毎回の要求ごとに行い、テストでは拒否される場合を中心に確かめます。
          </p>
          <p>
            同じ利用者が画面と API の両方を使うアプリでは、画面のログアウトと API トークンの失効を一緒に行うかも決めます。端末だけをログアウトさせたい場合と、アカウントを停止したい場合では範囲が異なります。アカウントの停止では、sessions と api_tokens の行をすべて削除し、パスワードの再設定のトークンもパスワードの変更で無効にします。
          </p>
          <p>
            関連する章：Cookie とセッションの仕組みは <ChapterLink n={10} section="cookie-session" />、認証と認可にかかわる脆弱性は <ChapterLink n={21} />、Puma のスレッドと <code>Current</code> の関係は <ChapterLink n={23} section="thread-safety" />、RSpec のリクエストスペックは <ChapterLink n={20} />で扱います。
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: 'Getting Started with Rails: Adding Authentication', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/getting_started.html#adding-authentication', accessed: '2026-11-27', version: 'Rails 8.1', note: '認証ジェネレーターと用意するファイル' },
    { title: 'Authentication concern template', publisher: 'Rails', url: `${GH}/railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt`, accessed: '2026-11-27', version: '8.1.4.1', note: '署名付き Cookie と Session レコードの扱い' },
    { title: 'activemodel/lib/active_model/secure_password.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/secure_password.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'MAX_PASSWORD_LENGTH_ALLOWED（12 行目）、password_reset_token（171〜179 行目）' },
    { title: 'activerecord/lib/active_record/secure_password.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/secure_password.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'authenticate_by が未登録でもハッシュを計算すること（41〜58 行目）' },
    { title: 'The OAuth 2.0 Authorization Framework: Bearer Token Usage', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6750', accessed: '2026-11-27', version: 'RFC 6750', note: 'Authorization ヘッダー、トークンの保護、401 と WWW-Authenticate' },
    { title: 'actionpack/lib/action_controller/metal/rate_limiting.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/rate_limiting.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'rate_limit の引数と、キャッシュのストアで数える処理（66〜90 行目）' },
    { title: 'actionpack/lib/action_controller/metal/http_authentication.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/http_authentication.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: 'TOKEN_REGEX（427 行目）、authenticate_with_http_token、Token realm の応答（555〜557 行目）' },
    { title: 'ActiveSupport::CurrentAttributes', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/CurrentAttributes.html', accessed: '2026-11-27', version: 'Rails 8.1', note: '要求ごとにリセットされる属性' },
    { title: 'ActiveRecord::TokenFor', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/TokenFor/ClassMethods.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'generates_token_for、find_by_token_for、期限とブロックの値' },
    { title: 'Pundit README', publisher: 'varvet/pundit（GitHub）', url: 'https://github.com/varvet/pundit', accessed: '2026-11-27', note: 'ポリシー、Scope、authorize、verify_authorized、pundit_user' },
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html#config-action-dispatch-show-exceptions', accessed: '2026-11-27', version: 'Rails 8.1', note: 'テスト環境の例外を HTTP 応答に変換する設定' },
    { title: 'Devise README', publisher: 'heartcombo/devise（GitHub）', url: 'https://github.com/heartcombo/devise', accessed: '2026-11-27', note: '認証の各モジュールと設定' },
    { title: 'railties/lib/rails/generators/rails/authentication/authentication_generator.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/authentication/authentication_generator.rb`, accessed: '2026-11-27', version: '8.1.4.1', note: '生成するファイルと、Action Mailer・Action Cable があるときだけ作るファイル（17〜57 行目）' },
    { title: 'JSON Web Token (JWT)', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc7519', accessed: '2026-11-27', version: 'RFC 7519', note: 'iss・aud・exp・jti のクレーム' },
    { title: 'JSON Web Token Best Current Practices', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc8725', accessed: '2026-11-27', version: 'RFC 8725', note: '受け入れるアルゴリズムの固定、aud と iss の検証' },
  ],
}

export default chapter
