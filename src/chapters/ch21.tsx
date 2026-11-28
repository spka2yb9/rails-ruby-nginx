import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation21 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { AuthorizationFigure } from '../visuals/rails-figures'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 33-1 要求の中の値はすべて送る側が決める ---------- */
function RequestPartsFigure() {
  const parts: [string, string][] = [
    ['URL・パス', 'POST /probe/echo/hello'],
    ['ヘッダー', 'User-Agent: my-script/1.0'],
    ['Cookie', 'Cookie: _demo_session=…'],
    ['フォームの値', 'article[title]=…&article[status]=published'],
  ]
  return (
    <Svg
      id="33-1"
      w={780}
      h={250}
      label="ブラウザーのフォームから送る場合も、curl やプログラムから送る場合も、要求の URL・ヘッダー・Cookie・フォームの値は、すべて送る側が自由に決められる。フォームに無い article[status] の欄も送れる。サーバーは届いた値をそのまま信用せず、受け取る値を決めて確かめる"
    >
      <Box x={20} y={40} w={170} h={50} lines={['ブラウザーのフォーム', '画面にある欄だけ']} fs={11.5} fill="bg" subTone="muted" />
      <Box x={20} y={120} w={170} h={50} lines={['curl・プログラム', '好きな値を付けられる']} fs={11.5} fill="box5" subTone="muted" accent />
      <Arrow x1={190} y1={65} x2={238} y2={95} />
      <Arrow x1={190} y1={145} x2={238} y2={115} />
      <rect x={240} y={20} width={390} height={190} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={256} y={40} bold fs={12}>
        HTTP の要求
      </T>
      {parts.map(([k, v], i) => (
        <g key={k}>
          <Box x={256} y={54 + i * 38} w={90} h={30} lines={k} fs={11} fill="box" />
          <T x={356} y={69 + i * 38} fs={10.5} mono>
            {v}
          </T>
        </g>
      ))}
      <Arrow x1={630} y1={105} x2={648} y2={105} />
      <Box x={650} y={70} w={110} h={70} lines={['Rails', '届いた値を', 'そのまま信用しない']} fs={11} fill="box" subTone="muted" />
      <T x={20} y={234} fs={11} tone="muted">
        画面に欄が無くても、送る側は article[status]=published のような値を足して送れる
      </T>
    </Svg>
  )
}

/* ---------- 図 33-2 Cookie によるログイン状態と、別のサイトからの要求 ---------- */
function CookieFlowFigure() {
  const msgs = [
    { y: 70, t: '① GET /probe/login（ログインの代わり）', back: false },
    { y: 106, t: '② set-cookie: _demo_session=…（暗号化した user_id 42）; httponly; samesite=lax', back: true },
    { y: 142, t: '③ GET /articles/1 と Cookie: _demo_session=…（自動で付ける）', back: false },
    { y: 178, t: '④ 応答（Rails は Cookie を復号して、user_id 42 の利用者からの要求だとわかる）', back: true },
  ]
  return (
    <Svg
      id="33-2"
      w={780}
      h={330}
      label="ログインすると、Rails は user_id を入れたセッションを暗号化し、set-cookie で _demo_session としてブラウザーに渡す。ブラウザーはその後の同じサイトへの要求に Cookie ヘッダーで自動で付け、Rails は復号して user_id 42 の利用者として処理する。別のサイトのページがこのサイトへ POST を送らせた場合、samesite=lax の Cookie は付かないが、同じドメインの別のサブドメインのページからなら付く。そのため Rails は CSRF のトークンでも確かめる"
    >
      <T x={60} y={20} anchor="middle" bold fs={12.5}>
        ブラウザー
      </T>
      <T x={720} y={20} anchor="middle" bold fs={12.5}>
        Rails
      </T>
      <line x1={60} y1={32} x2={60} y2={200} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={720} y1={32} x2={720} y2={200} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {msgs.map((m) => (
        <g key={m.t}>
          <Arrow x1={m.back ? 716 : 64} y1={m.y} x2={m.back ? 64 : 716} y2={m.y} dashed={m.back} />
          <T x={76} y={m.y - 10} fs={10.5}>
            {m.t}
          </T>
        </g>
      ))}
      <Box x={20} y={220} w={240} h={56} lines={['別のサイトのページ', 'このサイトへ POST を送らせる']} fs={11.5} fill="bg" subTone="danger" />
      <Arrow x1={260} y1={248} x2={318} y2={248} />
      <Box x={320} y={214} w={440} h={68} lines={['samesite=lax の Cookie は、別のサイトからの POST には付かない', '同じドメインの別のサブドメインのページからなら付く', '→ Rails は CSRF のトークンでも確かめる']} fs={11} fill="box" subTone="muted" />
      <T x={20} y={310} fs={11} tone="muted">
        Cookie は、受け取ったサイトへの要求に、ブラウザーが自動で付けて送る
      </T>
    </Svg>
  )
}

/* ---------- 図 33-4 入力が SQL や HTML として解釈される ---------- */
function InjectionFigure() {
  return (
    <Svg
      id="33-4"
      w={780}
      h={300}
      label="SQL の例では、WHERE (article_id = の後ろに入力を埋め込む。入力が 1 なら article_id = 1 で8件、入力が 1 OR 1=1 なら条件が常に真になり2975件が返る。値として渡すと article_id = 1 のままで8件。HTML の例では、入力の script タグを <%= %> で出すと &lt;script&gt; に変わって文字として表示され、raw で出すと script タグのまま出力されてブラウザーが実行する"
    >
      <T x={20} y={20} bold>
        SQL に埋め込む
      </T>
      <Box x={20} y={34} w={250} h={40} lines={'WHERE (article_id = 入力)'} mono fs={11} fill="box" />
      <Arrow x1={270} y1={54} x2={298} y2={54} />
      <Box x={300} y={30} w={300} h={22} lines={'入力 "1" → article_id = 1'} mono fs={10.5} fill="box4" />
      <T x={610} y={41} fs={11}>
        8 件
      </T>
      <Box x={300} y={56} w={300} h={22} lines={'入力 "1 OR 1=1" → 常に真'} mono fs={10.5} fill="bg" accent />
      <T x={610} y={67} fs={11} tone="danger">
        2975 件（全部）
      </T>
      <Box x={20} y={92} w={250} h={30} lines={'where(article_id: 入力)'} mono fs={11} fill="box5" />
      <Arrow x1={270} y1={107} x2={298} y2={107} />
      <Box x={300} y={96} w={300} h={22} lines={'"1 OR 1=1" → 整数の 1 に変換'} mono fs={10.5} fill="box4" />
      <T x={610} y={107} fs={11}>
        8 件
      </T>
      <T x={20} y={160} bold>
        HTML に出力する
      </T>
      <Box x={20} y={174} w={250} h={40} lines={'入力 <script>alert("XSS")</script>'} mono fs={10.5} fill="box" />
      <Arrow d="M270,186 L298,186" />
      <Arrow d="M270,204 L285,204 L285,242 L298,242" />
      <Box x={300} y={172} w={300} h={30} lines={'<%= %> → &lt;script&gt;…'} mono fs={10.5} fill="box5" />
      <T x={610} y={187} fs={11}>
        文字として表示
      </T>
      <Box x={300} y={228} w={300} h={30} lines={'<%= raw %> → <script>…'} mono fs={10.5} fill="bg" accent />
      <T x={610} y={243} fs={11} tone="danger">
        ブラウザーが実行
      </T>
      <T x={20} y={286} fs={11} tone="muted">
        入力の中の記号が SQL の命令や HTML のタグとして解釈されると、入力した人が SQL やページの動作を変えられる
      </T>
    </Svg>
  )
}

/* ---------- 図 33-6 CSRF トークンの発行と検証 ---------- */
function CsrfFigure() {
  return (
    <Svg
      id="33-6"
      w={780}
      h={330}
      label="ページを描画するとき、Rails はセッションに保存した32バイトのトークンを取り出す（無ければ作る）。毎回新しい32バイトのランダムなパッドを作り、トークンとの XOR を取ってパッドの後ろにつなぎ、Base64 にしてフォームの隠しフィールドと csrf-token のメタタグに入れる。POST を受けると、パラメーターの authenticity_token か X-CSRF-Token ヘッダーの値を Base64 で戻し、前半のパッドと後半の XOR を取ってトークンを復元し、セッションのトークンと比べる。Origin ヘッダーがあれば、要求の URL のオリジンと一致するかも確かめる。一致しなければ 422 になる。攻撃者のサイトはセッションのトークンを読めないので、正しい値を送れない"
    >
      <T x={20} y={20} bold>
        発行（GET でページを描画）
      </T>
      <Box x={20} y={34} w={200} h={46} lines={['セッション', '_csrf_token（32 バイト）']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={220} y1={57} x2={258} y2={57} />
      <Box x={260} y={34} w={250} h={46} lines={['パッド（毎回ランダム 32 バイト）', '+ パッド XOR トークン → Base64']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={510} y1={57} x2={548} y2={57} />
      <Box x={550} y={26} w={210} h={62} lines={['<input name="authenticity_token">', '<meta name="csrf-token">', '（描画のたびに値が変わる）']} mono fs={10} fill="box5" subTone="muted" />
      <T x={20} y={130} bold>
        検証（POST などを受けたとき）
      </T>
      <Box x={20} y={146} w={220} h={46} lines={['authenticity_token パラメーター', 'または X-CSRF-Token ヘッダー']} fs={11} fill="box5" subTone="muted" />
      <Arrow x1={240} y1={169} x2={278} y2={169} />
      <Box x={280} y={146} w={230} h={46} lines={['Base64 を戻し、前半と後半の', 'XOR でトークンを復元']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={510} y1={169} x2={548} y2={169} />
      <Box x={550} y={146} w={210} h={46} lines={['セッションのトークンと比較', '（一定時間の比較）']} fs={11} fill="box" subTone="muted" />
      <Box x={280} y={216} w={230} h={46} lines={['Origin ヘッダーがあれば', 'request.base_url と一致するか']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={395} y1={192} x2={395} y2={214} />
      <Arrow x1={510} y1={239} x2={548} y2={239} />
      <Box x={550} y={216} w={210} h={46} lines={['不一致なら 422', 'InvalidAuthenticityToken']} fs={11} fill="bg" subTone="danger" />
      <T x={20} y={300} fs={11} tone="muted">
        攻撃者のサイトのページは、利用者のセッションのトークンも、このサイトの HTML も読めないので、正しい値を送れない
      </T>
    </Svg>
  )
}

/* ---------- 図 33-5 セキュリティ対策の適用箇所 ---------- */
function WhereFigure() {
  const rows = [
    { t: 'ミドルウェア', items: 'HostAuthorization（Host ヘッダー）、SSL（HTTPS への転送・HSTS・secure 属性）', fill: 'box' as const },
    { t: 'セッション・Cookie', items: '署名・暗号化（secret_key_base から鍵を作る）', fill: 'box' as const },
    { t: 'コントローラー', items: 'CSRF の検証（before_action）、Strong Parameters', fill: 'box2' as const },
    { t: 'モデル・Relation', items: 'プレースホルダーと値のクォート、order の列名の検査', fill: 'box' as const },
    { t: 'ビュー', items: '<%= %> の自動エスケープ、sanitize、to_json のエスケープ', fill: 'box' as const },
    { t: '応答ヘッダー', items: 'Content-Security-Policy（既定では未設定）', fill: 'bg' as const },
  ]
  return (
    <Svg
      id="33-5"
      w={780}
      h={rows.length * 48 + 30}
      label="要求が通る順に、セキュリティ対策の適用箇所を並べた。ミドルウェアでは HostAuthorization が Host ヘッダーを、SSL が HTTPS への転送と HSTS と Cookie の secure 属性を受け持つ。セッションと Cookie は secret_key_base から作った鍵で署名・暗号化される。コントローラーでは CSRF の検証と Strong Parameters、モデルではプレースホルダーと order の列名の検査、ビューでは自動エスケープ、応答ヘッダーでは Content-Security-Policy を使う。CSP は既定では設定されていない"
    >
      {rows.map((r, i) => {
        const y = 14 + i * 48
        return (
          <g key={r.t}>
            <Box x={20} y={y} w={170} h={38} lines={r.t} fs={12} bold fill={r.fill} />
            <T x={206} y={y + 19} fs={11.5}>
              {r.items}
            </T>
            {i < rows.length - 1 && <Arrow x1={105} y1={y + 38} x2={105} y2={y + 48} />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 33-3 DB のセッションを使うログイン ---------- */
function AuthenticationSessionFigure() {
  return (
    <Svg
      id="33-3"
      w={740}
      h={194}
      label="Rails 8.1 の認証ジェネレーターの構成。ログイン時にパスワードの照合が成功すると、Rails が DB に Session の行を作り、その ID を署名付き Cookie としてブラウザーに返す。次の要求では Cookie の署名を検証し、ID で DB の Session を取得して Current.session を設定する"
    >
      <T x={14} y={51} bold>ログイン時</T>
      <Box x={128} y={20} w={172} h={62} lines={['パスワードを照合', 'SessionsController']} fill="box" subTone="muted" />
      <Arrow x1={300} y1={51} x2={332} y2={51} />
      <Box x={334} y={20} w={172} h={62} lines={['DB に Session を作成', 'セッション ID ができる']} fill="box4" subTone="muted" />
      <Arrow x1={506} y1={51} x2={538} y2={51} />
      <Box x={540} y={20} w={184} h={62} lines={['ブラウザーへ返す', 'ID を入れた署名付き Cookie']} fill="box5" subTone="muted" />

      <T x={14} y={137} bold>次の要求</T>
      <Box x={128} y={106} w={172} h={62} lines={['Cookie を受け取る', '署名を検証して ID を読む']} fill="box" subTone="muted" />
      <Arrow x1={300} y1={137} x2={332} y2={137} />
      <Box x={334} y={106} w={172} h={62} lines={['DB から Session を読む', 'ID で対象の行を探す']} fill="box4" subTone="muted" />
      <Arrow x1={506} y1={137} x2={538} y2={137} />
      <Box x={540} y={106} w={184} h={62} lines={['要求の認証状態を設定', 'Current.session を使う']} fill="box5" subTone="muted" />
    </Svg>
  )
}

/* ---------- CookieStore と DB のセッションで、サーバーが失効させられるもの（番号なし） ---------- */
function SessionRevokeFigure() {
  return (
    <Svg
      id="ch21-session-revoke"
      w={780}
      h={290}
      label="左は CookieStore。ブラウザーの Cookie に暗号化したセッションの中身（user_id 42 など）が入り、Rails は鍵で復号して読むだけで、サーバーには利用者ごとの行が無い。その利用者だけを止めるには別の仕組みが必要で、secret_key_base を変えると全員がログアウトする。右は認証ジェネレーターの DB のセッション。Cookie には署名付きの session_id だけが入り、Rails は Session.find_by で sessions テーブルの行を探す。行を削除すると、その利用者だけを失効させられ、次の要求では行が見つからずログインを求める"
    >
      <T x={20} y={18} bold fs={12.5}>
        CookieStore（Rails の既定）
      </T>
      <T x={410} y={18} bold fs={12.5}>
        DB のセッション（認証ジェネレーター）
      </T>

      <Box x={20} y={34} w={350} h={48} lines={['ブラウザーの Cookie（_demo_session）', '暗号化したセッションの中身（user_id 42 など）']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={195} y1={82} x2={195} y2={104} />
      <Box x={20} y={106} w={350} h={48} lines={['Rails', '鍵で復号して中身を読む']} fs={11.5} fill="box" subTone="muted" />
      <Box x={20} y={178} w={350} h={48} lines={['利用者ごとの行は無い', 'サーバーで消せるものが無い']} fs={11.5} fill="bg" dashed subTone="muted" />
      <T x={20} y={250} fs={11.5}>
        その利用者だけを止めるには、別の仕組みが必要
      </T>
      <T x={20} y={272} fs={11.5} tone="muted">
        secret_key_base を変えると全員がログアウトする
      </T>

      <Box x={410} y={34} w={350} h={48} lines={['ブラウザーの Cookie（session_id）', '署名付きの ID だけが入る']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={585} y1={82} x2={585} y2={104} />
      <Box x={410} y={106} w={350} h={48} lines={['Rails', 'Session.find_by(id: …) で行を探す']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={585} y1={154} x2={585} y2={176} />
      <Box x={410} y={178} w={350} h={48} lines={['DB の sessions テーブル', 'ログインごとに1行。行を削除できる']} fs={11.5} fill="box4" subTone="muted" accent />
      <T x={410} y={250} fs={11.5} tone="acc">
        行を削除すると、その利用者だけを失効させられる
      </T>
      <T x={410} y={272} fs={11.5} tone="muted">
        次の要求では行が見つからず、ログインを求める
      </T>
    </Svg>
  )
}

/* ---------- 認可コード方式でログインするときの往復（段階送り。番号なし） ---------- */
function OidcCodeFlowFigure({ active }: { active: number }) {
  const B = 70
  const A = 390
  const S = 710
  const msgs: { y: number; from: number; to: number; t: string; sub?: string }[] = [
    { y: 60, from: B, to: A, t: '① 外部サービスでのログインを始める' },
    { y: 130, from: A, to: B, t: '② 認証サービスへ移動させる応答', sub: '戻り先 URI・state・nonce・code_challenge を付ける' },
    { y: 186, from: B, to: S, t: '③ 認証サービスへ移動する' },
    { y: 256, from: S, to: B, t: '④ 登録済みの戻り先 URI へ移動させる', sub: '短命のコードと state を付ける' },
    { y: 312, from: B, to: A, t: '⑤ コードと state をアプリに届ける' },
    { y: 382, from: A, to: S, t: '⑥ コードと code_verifier を送る', sub: 'アプリのサーバーから直接送る' },
    { y: 484, from: S, to: A, t: '⑦ ID トークンとアクセストークン' },
  ]
  const boxes: { step: number; x: number; y: number; w: number; h: number; lines: string | string[] }[] = [
    { step: 0, x: 255, y: 72, w: 270, h: 28, lines: 'state・nonce・code_verifier を作る' },
    { step: 2, x: 600, y: 198, w: 170, h: 28, lines: '利用者がログインして許可' },
    { step: 4, x: 255, y: 324, w: 270, h: 28, lines: 'state を開始時の値と比べる' },
    { step: 5, x: 560, y: 408, w: 210, h: 44, lines: ['code_verifier のハッシュが', '② の値と一致するか確かめる'] },
    { step: 6, x: 250, y: 496, w: 280, h: 44, lines: ['ID トークンを検証する', '発行者・署名・受信対象・期限・nonce'] },
  ]
  return (
    <Svg
      id={`ch21-oidc-flow-${active + 1}`}
      w={780}
      h={556}
      label={`認可コード方式でログインするときの往復の ${active + 1} 番目の段階。${msgs[active].t}${msgs[active].sub ? `（${msgs[active].sub}）` : ''}`}
    >
      {(
        [
          [B, 'ブラウザー'],
          [A, 'Rails アプリ'],
          [S, '認証サービス'],
        ] as const
      ).map(([x, name]) => (
        <g key={name}>
          <T x={x} y={18} anchor="middle" bold fs={12.5}>
            {name}
          </T>
          <line x1={x} y1={30} x2={x} y2={546} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {msgs.map((m, i) => {
        const right = m.from < m.to
        const lx = Math.min(m.from, m.to) === B ? B + 14 : A + 14
        const on = i === active
        return (
          <g key={m.t}>
            <Arrow x1={m.from + (right ? 4 : -4)} y1={m.y} x2={m.to + (right ? -4 : 4)} y2={m.y} accent={on} />
            <T x={lx} y={m.y - 10} fs={11.5} bold={on} tone={on ? undefined : 'muted'}>
              {m.t}
            </T>
            {m.sub && (
              <T x={lx} y={m.y + 14} fs={11.5} tone="muted">
                {m.sub}
              </T>
            )}
          </g>
        )
      })}
      {boxes.map((b) => (
        <Box key={b.step} x={b.x} y={b.y} w={b.w} h={b.h} lines={b.lines} fs={11.5} fill={b.step === active ? 'box5' : 'box'} accent={b.step === active} subTone="muted" />
      ))}
    </Svg>
  )
}

const oidcSteps: { label: string; text: string; guard?: string }[] = [
  {
    label: '① 開始',
    text: '利用者がアプリの「外部サービスでログイン」を押すと、アプリは3つのランダムな値を作り、利用者のセッションに保存します。state はこのログインの開始と戻ってくる応答を結び付ける値、nonce は ID トークンに入れて返してもらう値、code_verifier（PKCE の検証値）はコードを交換するときに、ログインを始めたアプリであることを示す値です。どれも推測できない長さの乱数にし、ログインのたびに作り直します。',
  },
  {
    label: '② 移動の応答',
    text: 'アプリはブラウザーを認証サービスへ移動させるリダイレクトの応答を返します。移動先の URL には戻り先 URI・state・nonce と、code_verifier から SHA-256 で計算したハッシュ（code_challenge）を付けます。code_verifier そのものは送りません。ハッシュからは元の値を計算できないので、この URL を見た人がいても、⑥ で code_verifier を示せません。',
  },
  {
    label: '③ ログイン',
    text: 'ブラウザーが認証サービスのページを開き、利用者はそこでログインして、アプリに情報を渡すことを許可します。パスワードを受け取るのは認証サービスで、アプリはパスワードを受け取りません。認証サービスは code_challenge と nonce を、これから発行するコードと結び付けて覚えます。',
  },
  {
    label: '④ 戻り先へ',
    text: '認証サービスは短命のコード（認可コード）と、② で受け取った state をそのまま付けて、ブラウザーを戻り先 URI へ移動させます。',
    guard: '戻り先 URI は、アプリが事前に登録したものと文字列が完全に一致する場合だけ受け付けます。一致を緩めると、攻撃者が用意した URI へコードが送られてしまいます。',
  },
  {
    label: '⑤ state の確認',
    text: 'ブラウザーがコードと state をアプリの戻り先に届けます。アプリは state を ① でセッションに保存した値と比べ、一致しなければ処理を止めます。',
    guard: 'state が防ぐのは、攻撃者が自分のアカウントで得たコードを利用者のブラウザーから送らせ、利用者を攻撃者のアカウントでログインさせる攻撃（CSRF）です。攻撃者は利用者のセッションにある state を知らないので、一致する値を付けられません。',
  },
  {
    label: '⑥ コードの交換',
    text: 'アプリのサーバーはコードと code_verifier を認証サービスへ直接送ります。この通信はブラウザーを通りません。認証サービスは code_verifier のハッシュを計算し、② の code_challenge と一致するときだけトークンを返します。',
    guard: 'PKCE が防ぐのは、盗まれたコードや、攻撃者が差し込んだコードの交換です。コードは ④ と ⑤ でブラウザーの URL に載るので、漏れることがあります。それでも code_verifier を知らない攻撃者は、コードをトークンに交換できません。',
  },
  {
    label: '⑦ ID トークンの検証',
    text: '認証サービスは ID トークンとアクセストークンを返します。アプリは ID トークンの発行者（iss）・署名・受信対象（aud。どのアプリ向けに発行されたか）・期限（exp）を検証し、nonce が ① で保存した値と一致するかも確かめます。',
    guard: 'nonce が防ぐのは、別のログインで発行された ID トークンを差し込んで使い回す攻撃です。',
  },
]

function OidcCodeFlowStepper() {
  return (
    <Stepper
      steps={oidcSteps.map((st, i) => ({
        label: st.label,
        detail: (
          <>
            <OidcCodeFlowFigure active={i} />
            <p>{st.text}</p>
            {st.guard && <p>{st.guard}</p>}
          </>
        ),
      }))}
    />
  )
}

/* ---------- secret_key_base の出どころと、そこから作られる鍵（番号なし） ---------- */
function SecretKeyBaseFigure() {
  const xs = [20, 275, 530]
  const sources = [
    ['1. 環境変数 SECRET_KEY_BASE', 'あれば最初に使う'],
    ['2. credentials の secret_key_base', 'config/credentials.yml.enc', '鍵は master.key か RAILS_MASTER_KEY'],
    ['3. tmp/local_secret.txt', '開発・テスト環境で1と2が無いとき'],
  ]
  const uses = [['署名・暗号化した Cookie', '"authenticated encrypted cookie" など'], ['署名付きの ID', 'Active Storage の URL']]
  return (
    <Svg
      id="ch21-secret-key-base"
      w={780}
      h={346}
      label="Rails は secret_key_base を、環境変数 SECRET_KEY_BASE、credentials の secret_key_base の順に探し、開発・テスト環境でどちらも無いときだけ tmp/local_secret.txt に作った値を使う。Rails はそれを使い、Cookie や Active Storage の署名付き ID の鍵を生成する。古い鍵を検証用に残さず secret_key_base を変えると、発行済みの Cookie や署名付き ID は使えなくなる"
    >
      {sources.map((lines, i) => (
        <Box key={lines[0]} x={xs[i]} y={20} w={230} h={62} lines={lines} fs={11.5} fill="box4" subTone="muted" />
      ))}
      <Arrow x1={135} y1={82} x2={340} y2={110} />
      <Arrow x1={390} y1={82} x2={390} y2={110} />
      <Arrow x1={645} y1={82} x2={440} y2={110} />
      <Box x={290} y={112} w={200} h={44} lines={['secret_key_base', '1つの秘密の値']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={390} y1={156} x2={390} y2={180} />
      <Box x={240} y={182} w={300} h={44} lines={['Rails.application.key_generator', 'PBKDF2 で用途ごとに鍵を作る']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={330} y1={226} x2={270} y2={256} />
      <Arrow x1={450} y1={226} x2={510} y2={256} />
      {uses.map((lines, i) => (
        <Box key={lines[0]} x={155 + i * 240} y={258} w={230} h={46} lines={lines} fs={11.5} fill="box4" subTone="muted" />
      ))}
      <T x={20} y={328} fs={11.5} tone="muted">
        古い鍵を検証用に残さず secret_key_base を変えると、発行済みの Cookie や署名付き ID は使えなくなる
      </T>
    </Svg>
  )
}

const ch21: Chapter = {
  number: 21,
  part: 4,
  title: 'セキュリティ',
  summary:
    'ログインできた利用者が、どの記事を編集してよいかは別に確認します。記事の編集を例に、本人の確認、操作の許可、フォームから受け取った値の扱いを、Rails のどの処理が受け持つかを調べます。',
  goals: [
    'ログイン状態を確認する処理と、対象の記事を更新してよいかを決める処理を区別できる',
    'フォームに付けるトークンの役割と、受け取った値を保存・表示・検索に使うときの扱いを説明できる',
    'セッションを失効させる方法と、ログやリポジトリに秘密の値を残さない方法を説明できる',
  ],
  prerequisites: [6, 10, 12, 16],
  sections: [
    {
      id: 'untrusted-input',
      title: '利用者が送る値は自由に作れる',
      body: (
        <>
          <p>
            Web アプリケーションへの攻撃とは、作り手が想定していない要求を送って、他人のデータを読んだり書き換えたり、許されていない操作をしたりすることです。攻撃の多くは、利用者から届いた値を、アプリケーションがそのまま信用して使うところから起きます。
          </p>
          <p>
            ブラウザーで記事のフォームを送ると、フォームにある欄の値だけが送られます。しかし、要求を送るのはブラウザーだけではありません。curl のようなコマンドやプログラムを使えば、フォームに無い欄の値も、好きなヘッダーも付けて送れます。デモの、送られた値をそのまま返すアクションに、curl
            で要求を送りました。
          </p>
          <Code
            lang="text"
            title="curl で送った要求と応答、開発環境のログ（Rails 8.1.4.1）"
            code={`
$ curl -X POST 'http://127.0.0.1:3300/probe/echo/hello' \\
    -d 'article[title]=下書きの記事' -d 'article[status]=published' \\
    -H 'User-Agent: my-script/1.0' -H 'Referer: https://example.com/admin'
{"article":{"title":"下書きの記事","status":"published"},"controller":"probe","action":"echo","title":"hello"}

Started POST "/probe/echo/hello" for 172.29.0.1 at 2026-11-16 07:10:04 +0000
Processing by ProbeController#echo as */*
  Parameters: {"article" => {"title" => "下書きの記事", "status" => "published"}, "title" => "hello"}
`}
          />
          <p>
            フォームに status（公開の状態）の欄が無くても、<code>article[status]=published</code> を送ればサーバーに届きます。User-Agent（使っているブラウザーの名前を伝えるヘッダー）や
            Referer（どのページから来たかを伝えるヘッダー）も、送る側が決めた値です。要求の URL・ヘッダー・Cookie・フォームの値はどれも、送る側が自由に作れます（図 33-1）。
          </p>
          <p>
            受け取った値をまとめてモデルに渡すことを一括代入と呼びます。一括代入では、作り手が変えさせるつもりのない列まで変わることがあります。デモの Article には status（draft・published・archived）の列があります。下書きを作るフォームに
            title の欄しか無くても、送られた値をすべてモデルに渡すと、公開の状態の記事が作られます。rails runner で確かめました。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行したコード"
            code={`
params = ActionController::Parameters.new(article: { title: "下書きの記事", status: "published" })
begin
  Article.new(params[:article])
rescue => e
  puts "そのまま渡す: #{e.class}"
end
a = Article.new(params[:article].permit!)
puts "permit! で全部を許可: status=#{a.status}"
b = Article.new(params.expect(article: [:title]))
puts "title だけを許可:     status=#{b.status}"
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
そのまま渡す: ActiveModel::ForbiddenAttributesError
permit! で全部を許可: status=published
title だけを許可:     status=draft
`}
          />
          <p>
            Rails は許可していない params をそのままモデルに渡すと ActiveModel::ForbiddenAttributesError にします
            <Ref n={11} />。<code>permit!</code> で全部を許可すると status も入り、公開の状態の記事になりました。<code>expect(article: [:title])</code> で受け取る属性を title
            だけにすると、status は既定値の draft のままでした。受け取る属性をコントローラーで1つずつ決めるこの仕組みを Strong Parameters と呼びます（<ChapterLink n={10} section="params" />
            ）。
          </p>
          <Figure n="33-1" title="要求の中の値はすべて送る側が決める" caption="デモで curl から送った要求と、そのときのログをもとにした模式図。">
            <RequestPartsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'cookie-session',
      title: 'Cookie・セッション・ログイン状態',
      body: (
        <>
          <p>
            HTTP の要求は1回ごとに独立していて、サーバーは要求の中身だけでは、前の要求と次の要求が同じ利用者からのものかを区別できません。そこで Cookie を使います。Cookie は、サーバーが応答の
            Set-Cookie ヘッダーで渡した名前と値をブラウザーが保存し、同じサイトへのその後の要求の Cookie ヘッダーに付けて送り返す仕組みです
            <Ref n={6} />。
          </p>
          <p>デモには、セッションに <code>user_id = 42</code> を入れるだけのアクションがあります。ログインの代わりにこれを curl で要求しました。</p>
          <Code
            lang="text"
            title="curl -i http://127.0.0.1:3300/probe/login の応答（ヘッダーの一部と Cookie の値の一部を省略）"
            code={`
HTTP/1.1 200 OK
content-type: text/html
set-cookie: _demo_session=wsW1G2t12Srsb20sUHoWjIPduEuDQ5idtOCMpeNFoPBXwqNgUaWiDEE6L67%2F8e6m…--bhtZ7rrWUvZPYsGdQ6LeQA%3D%3D; path=/; httponly; samesite=lax
`}
          />
          <p>
            セッションは、Rails が Cookie を使って、要求をまたいで値を覚えておく仕組みです。コントローラーで <code>session[:user_id] = 42</code> のように書きます。Rails
            は既定では、セッションの中身全体を暗号化して、_demo_session という名前の Cookie に入れます（<ChapterLink n={10} section="cookies-session" />
            ）。この Cookie の値を、Rails の鍵で復号しました。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で Cookie の値を復号した結果"
            code={`
Cookie の値の長さ: 372 バイト
サーバーが復号した中身: {"session_id" => "7edf16ecb96eb9b6d02af63f8358e77b", "user_id" => 42, "flash" => {"discard" => [], "flashes" => {"notice" => "ログインしました"}}}
1文字を書き換えた値: nil
`}
          />
          <p>
            Cookie の値はブラウザーの開発者ツールなどで見えますが、暗号化されているので中身は読めません。値を1文字でも書き換えると Rails は復号できず、空のセッションとして扱います。user_id を書き換えて他人になりすますことはできません。この
            Cookie を付けて別のページを要求すると、curl も Cookie ヘッダーで値を送り返しました。
          </p>
          <Code
            lang="text"
            title="curl -v -b '_demo_session=…' http://127.0.0.1:3300/articles/1 で送った要求の先頭（値を省略）"
            code={`
> GET /articles/1 HTTP/1.1
> Host: 127.0.0.1:3300
> Cookie: _demo_session=wsW1G2t12Srsb20sUHoWjIPduEuDQ5idtOCMpeNFoPBXwqNgUaWiDEE6L67%2F8e6m…
`}
          />
          <p>
            ログインした状態はこの仕組みで保ちます。ログインに成功したら、サーバーは利用者を区別する値を Cookie に入れ、その後の要求では Cookie の値から利用者を決めます（図 33-2）。Rails 8 の <code>bin/rails generate authentication</code> が作るコードも、ログインのたびにデータベースの sessions テーブルに行を作り、その id を署名付きの Cookie
            に入れます
            <Ref n={10} />。
          </p>
          <Code
            lang="ruby"
            title="bin/rails generate authentication が作る app/controllers/concerns/authentication.rb（抜粋）"
            href={`${GH}/railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt`}
            code={`
    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
      end
    end
`}
          />
          <p>
            ブラウザーは Cookie を受け取ったサイトへの要求に、その Cookie を自動で付けます。利用者がログインしたまま別のサイトを開き、そのページがこのサイトへ POST
            を送らせた場合にも、条件によっては Cookie が付きます。サーバーから見ると、ログイン中の利用者が自分で送った要求と区別がつきません。これを利用した攻撃を CSRF（クロスサイトリクエストフォージェリ）と呼びます。たとえば攻撃者のページに次の
            HTML があると、開いた利用者のブラウザーが、記事1へのコメントを自動で送信します。
          </p>
          <Code
            lang="html"
            title="攻撃者のサイト（https://evil.example）のページの例"
            code={`
<form action="http://localhost:3300/articles/1/comments" method="post">
  <input type="hidden" name="comment[body]" value="攻撃者が書かせたコメント">
</form>
<script>document.forms[0].submit()</script>
`}
          />
          <p>
            上の set-cookie の <code>samesite=lax</code> は、別のサイトのページから送られる POST にはこの Cookie を付けないように、ブラウザーに指示する属性です
            <Ref n={7} />。Rails は load_defaults 6.1 以降、Cookie に既定でこの属性を付けます
            <Ref n={9} />。ただし SameSite の「サイト」は example.com のようなドメインの単位で、同じドメインの別のサブドメイン（blog.example.com と app.example.com など）のページは同じサイトとして扱われ、Cookie
            が付きます
            <Ref n={8} />。そのため Rails はこの属性だけに頼らず、「CSRF の対策」の節で見るトークンでも要求を確かめます。<code>httponly</code> はページの JavaScript からこの Cookie
            を読めないようにする属性です
            <Ref n={7} />。
          </p>
          <Figure n="33-2" title="Cookie によるログイン状態と、別のサイトからの要求" caption="デモでの curl の実測（set-cookie、Cookie の復号）と、MDN の Set-Cookie の説明をもとにした模式図。">
            <CookieFlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'authentication',
      title: "ログインを実装するときの認証とセッション",
      body: (
        <>
          <p>
            認証では利用者を確認し、認可では操作を許可できるかを判断します。ログインの失敗やパスワード再設定では、応答から登録の有無を推測されないようにします。実装の基本は <ChapterLink n={102} /> を参照してください。<Ref n={12} />
          </p>
          <h3>パスワードの照合</h3>
          <p>
            <code>has_secure_password</code> を宣言した Rails のモデルは、平文のパスワードの代わりに bcrypt で計算した <code>password_digest</code> を保存します。bcrypt はパスワードから元のパスワードに戻せない値（ハッシュ）を、わざと時間をかけて計算する方式です。計算にはパスワードごとに作るランダムな値（ソルト）と、計算の手間を表すコストを加えます。同じパスワードでも利用者ごとに保存される値が変わるので、よく使われるパスワードのハッシュを先に計算しておいた表では、まとめて照合できません。<code>user.authenticate(password)</code> で照合でき、成功するとユーザー自身、失敗すると <code>false</code> が返ります。ユーザーの検索を含むログインでは <code>User.authenticate_by(email_address: ..., password: ...)</code> を使うと、対象が見つからなかった場合にも照合に近い処理を行い、検索結果による応答時間の差を小さくできます。<Ref n={13} /><Ref n={14} />
          </p>
          <p>
            ログインとパスワード再設定には、一定時間に受け付ける回数の上限（頻度制限）を、アカウントごとと接続元ごとの両方に設けます。Rails の <code>rate_limit</code> や Rack::Attack で制限する場合、サーバーが複数台なら、回数を全台で共有できるストア（Redis など）を使います。Nginx などのプロキシを通して受ける構成では、Rails が受け取る接続元の IP がプロキシのものになっていないかも確かめます（取り方は <ChapterLink n={25} section="client-ip" />）。既知・未知のメールアドレスで「受付けました」のような同じ応答を返し、応答時間も揃えると、登録の有無を推測されにくくなります。パスワードを変更したときは古いセッションを失効させ、再設定の URL やトークンをログに出さないようにします。<Ref n={15} /><Ref n={16} /><Ref n={14} />
          </p>
          <h3>Rails 8 の認証ジェネレーター</h3>
          <p>
            <code>bin/rails generate authentication</code> は、モデル・ログイン画面・コントローラー・パスワード再設定メールなどの土台を生成します。Rails 8.1 系では、認証が成功すると <code>Session</code> の行を作り、ブラウザーに <code>session_id</code> の署名付き Cookie を返します。署名付き Cookie は、Rails が鍵で計算した署名を値に添えた Cookie で、値が書き換えられていないかを Rails が確かめられます（値は暗号化されません）。次の要求では <code>Authentication</code> の Concern（コントローラーに取り込むモジュール）が Cookie を読み、<code>Session.find_by</code> で行を探して <code>Current.session</code> と <code>Current.user</code> を使えるようにします。これにより、セッションの行を消せばサーバー側で失効させられます。生成されたコードをアプリに取り込む方式なので、ユーザー登録、ログイン保持期間、権限の規則は用途に応じて決めます。<Ref n={17} /><Ref n={18} />
          </p>
          <p>
            <code>Current</code> は、処理中のリクエストで利用者やセッションを参照するための <code>CurrentAttributes</code> のクラスです。リクエストごとに値がどのように管理されるかは、<ChapterLink n={23} section="thread-safety">Executor とスレッド安全性</ChapterLink>で扱います。
          </p>
          <p>
            再設定では <code>password_reset_token</code> をメールで送り、<code>find_by_password_reset_token!</code> で期限と対象を確認します。<code>has_secure_password</code> の既定の再設定トークンは15分で期限が切れ、パスワードを変更すると以前のトークンを使えなくなります。<code>Authentication</code> は原則としてログインを要求し、公開するアクションには <code>allow_unauthenticated_access</code> を明示できます。<Ref n={13} /><Ref n={18} />
          </p>
          <Figure n="33-3" title="Cookie の ID と DB の Session の対応" caption="Rails 8.1 の認証ジェネレーターをもとにした模式図。上段で作った行を、下段の要求で ID を使って読みます。">
            <AuthenticationSessionFigure />
          </Figure>
          <h3>Devise を使う構成</h3>
          <p>
            Devise は複数の認証機能を組み合わせられる gem です。利用者の自己登録、メール確認、再設定、長期ログイン、ロックなどが必要なら、既存チームの運用や必要な機能を見て選びます。既存アプリではモデルの <code>devise</code> 宣言を読むと、有効な機能がわかります。<Ref n={19} />
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">モジュール</th>
                  <th scope="col">担当すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>database_authenticatable</code>、<code>validatable</code></th>
                  <td>パスワードの照合、メールやパスワードの基本検証</td>
                </tr>
                <tr>
                  <th scope="row"><code>registerable</code>、<code>confirmable</code>、<code>recoverable</code></th>
                  <td>登録、確認メールと確認状態、再設定</td>
                </tr>
                <tr>
                  <th scope="row"><code>rememberable</code>、<code>timeoutable</code></th>
                  <td>ログイン状態を再開する Cookie、無操作時間による期限</td>
                </tr>
                <tr>
                  <th scope="row"><code>lockable</code>、<code>trackable</code>、<code>omniauthable</code></th>
                  <td>失敗によるロック、ログインの記録、外部認証との連携</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>authenticate_user!</code> でログインを要求し、<code>current_user</code> と <code>user_signed_in?</code> で状態を参照します。<code>confirmable</code> の確認画面はメールのリンクでトークンを検証し、確認時刻を保存します。<code>rememberable</code> は長く残る認証用 Cookie を扱うため、共有端末での利用や失効条件も設計に含めます。画面だけ変更する場合は Devise のビューを生成して編集し、ログイン後の遷移先などは提供されるフック（<code>after_sign_in_path_for</code> など）から変更できます。処理を上書きする場合は元の処理とテストも確認します。<Ref n={19} />
          </p>
          <p>Devise の confirmable を使う例では、登録時に確認用トークンを発行してメールを送り、リンクの検証が済んだアカウントに confirmed_at を記録します。再送・期限切れ・すでに確認済みの場合も画面から追います。登録項目を加えるときは、生成したビューだけでなく Devise のパラメータ許可にも追加し、利用者が選べる項目を限定します。</p>
        </>
      ),
    },
    {
      id: 'object-authorization',
      title: "所有者・ロールとレコードの認可",
      body: (
        <>
          <p>
            「全員が公開記事を読めるが、書き換えられるのは自分の記事だけ」という画面を考えます。ログインで分かるのは誰が操作しているかです。編集を受け付けるアクションでは、その記事が本人のものかも確かめます。対象の ID だけで行を選び、この権限の確認が抜ける問題を IDOR と呼びます。
          </p>
          <p>
            <code>Current.user.articles.find(params.expect(:id))</code> は2段階に読めます。<code>Current.user.articles</code> で本人の記事だけに絞り、その中から <code>find</code> で該当する1件を探します。新規作成では <code>Current.user.articles.build(article_params)</code> とすると、ログイン中の利用者が記事の所有者になります。一覧やダウンロードなど、別の経路にもそれぞれの操作に合う規則を適用します。<Ref n={12} /><Ref n={20} />
          </p>
          <p>
            条件が増えたら、Pundit では <code>ArticlePolicy#update?</code> のように利用者と対象の組から操作を判定し、<code>authorize @article</code> で使えます。<code>policy_scope(Article)</code> は一覧に含めてよい行を選びます。スコープで読める行の中にも編集できないものがあるので、更新のときは操作のポリシーも適用します。似た選択肢の CanCanCan は、<code>Ability</code> に許可の規則をまとめ、<code>authorize!</code> や <code>accessible_by</code> で参照できます。<Ref n={20} /><Ref n={21} />
          </p>
          <p>
            <code>Admin::BaseController</code> を用意すれば、管理画面の入口に認証と管理者の条件を置けます。個々の操作には、所属や担当範囲など必要な条件を足します。ロールや所有者 ID のような権限に関わる属性は、一般利用者の一括代入の許可リストから外し、権限を変更する操作を専用の認可と記録の対象にします。未認証、権限のない利用者、許可された利用者で同じエンドポイントを検証すると、経路ごとの確認漏れを見つけられます。<Ref n={12} /><Ref n={20} />
          </p>
          <AuthorizationFigure />
          <p>利用者やプロセスに必要な権限だけを渡す考え方（最小権限の原則）は、<ChapterLink n={85} /> で扱います。</p>
        </>
      ),
    },
    {
      id: 'session-protection',
      title: "セッションを守り、失効させる",
      body: (
        <>
          <p>
            ログイン前に知られていた識別子を使う攻撃を、セッション固定と呼びます。<ChapterLink n={10} section="cookie-session">ログイン時のセッションの切り替え</ChapterLink> はこのために行います。<code>HttpOnly</code> で読み取りを制限した Cookie も、ブラウザーは条件が合えばリクエストに付けます。Cookie 認証を採用する API でも、要求元と CSRF の検証を確認します。GET は取得に使い、状態を変える操作は別のメソッドで受け付けます。<Ref n={12} /><Ref n={27} />
          </p>
          <p>
            CookieStore のセッションデータはクライアント側にあるので、サーバーでその利用者のセッションだけを即座に止めるには別の仕組みが必要です。DB のセッションなら行の削除で失効させられます。どの方式でも期限を設け、パスワード変更や不審なログイン時には関連セッションを確認します。重要な変更は再認証を要求し、失効の動作をテストします。<Ref n={12} /><Ref n={27} />
          </p>
          <p>次の図は、CookieStore と DB のセッションを左右に並べ、セッションの中身がどこにあり、サーバーが何を消せるかを比べたものです。上からブラウザーの Cookie、Rails、DB の順に見てください。</p>
          <Figure title="CookieStore と DB のセッションで、サーバーが失効させられるもの" caption="図 33-2 と図 33-3 をもとにした模式図。破線の箱は CookieStore には無いものを示します。secret_key_base を変えたときの動作は「secret_key_base と credentials」の節で扱います。">
            <SessionRevokeFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'mfa-and-federation',
      title: "多要素認証と外部サービスでのログイン",
      body: (
        <>
          <p>
            パスワードに加えて別の要素も確かめる認証を、MFA（多要素認証）と呼びます。要素には時刻から作る一時コードの TOTP（Time-based One-Time Password）や、パスキーなどがあります。TOTP では登録時にサーバーと利用者の認証アプリが同じ秘密の値を共有します。両方がその値と現在時刻から、多くは30秒ごとに変わる6桁のコードを計算し、利用者が入力したコードがサーバーの計算と一致すればログインを認めます。サーバー側では許容する時刻のずれを狭くし、使用済みのコードを再利用できないようにし、試行回数を制限します。登録時の QR コードに含まれる秘密の値と、端末をなくしたときに使う復旧用コードを保護し、端末をなくしたときの本人確認の手順も決めます。SMS で送るコードは電話番号の移管などの手続きを悪用されると、他人の端末に届くことがあります。パスキーは端末に保存した鍵で本人を確認する方式で、WebAuthn という仕様で動きます。鍵は登録したサイトに結び付くので、本物に似せた偽のサイトに入力させる攻撃（フィッシング）に強くなります。<Ref n={32} /><Ref n={33} />
          </p>
          <p>
            カレンダーアプリに「自分の予定を読む」ことを許可する場面を考えます。このように外部アプリへ API の利用権限を渡す仕組みが OAuth 2.0 です。権限は API を呼ぶときに見せるアクセストークンという値で渡します。「ほかのサービスのアカウントでログインする」場面では、OAuth 2.0 に本人確認を加えた OpenID Connect（OIDC）を使います。ログインを担当する外部のサービス（認証サービス）は、本人確認の結果を ID トークンとして返します。ID トークンは誰がいつ認証されたかを、認証サービスが署名して表したデータです。
          </p>
          <p>
            OIDC で多く使う認可コード方式では、認証サービスから戻るブラウザーが短命のコード（認可コード）をアプリに届け、アプリのサーバーがそのコードをトークンに交換します。戻り先には事前に登録した URI を使います。この往復では、アプリが作る次の3つのランダムな値で、攻撃者が途中に割り込むのを防ぎます。<Ref n={34} /><Ref n={35} /><Ref n={39} />
          </p>
          <ul>
            <li><code>state</code>：ログインの開始と、認証サービスから戻ってきた応答を結び付ける値です。</li>
            <li><code>nonce</code>：開始したログインと、受け取った ID トークンを結び付ける値です。</li>
            <li>PKCE（Proof Key for Code Exchange）の検証値 <code>code_verifier</code>：コードを交換するときに、ログインを始めたアプリであることを示す値です。</li>
          </ul>
          <p>
            次の図では認可コード方式でログインするときの要求と応答を7つの段階に分けています。段階を進めると、その段の矢印と処理が強調され、図の下にその段で行うことと、state・nonce・PKCE が防ぐ攻撃が表示されます。② で付けた値のうち、state は ⑤ でアプリが、PKCE は ⑥ で認証サービスが、nonce は ⑦ でアプリが確かめます。
          </p>
          <Figure title="認可コード方式でログインするときの往復（段階送り）" caption="OpenID Connect Core 1.0、RFC 7636、RFC 9700 をもとにした概念モデルです。灰色の箱は、その時点でアプリや認証サービスが行う処理です。③ と ④ はブラウザーの移動で、アプリを通りません。RFC 9700 は、PKCE や nonce も CSRF の対策になると説明しています。この図では、各値を確かめる段階と主に防ぐ攻撃を示しました。実際の値の作り方や確かめる順番は、認証サービスと gem（OmniAuth など）によって異なります。エラーの場合の流れは省略しています。">
            <OidcCodeFlowStepper />
          </Figure>
          <p>
            Rails で OmniAuth を使う場合も、外部サービスのアクセストークンは API の利用に使い、本人の識別には検証済みの ID トークンやプロバイダーが指定する手順を使います。外部アカウントは発行元とそのサービス内の利用者 ID の組でひも付け、メールアドレスの一致だけで既存アカウントへ結合しません。登録や結合の開始は CSRF から保護し、接続解除時には保持しているトークンも扱います。<Ref n={36} /><Ref n={34} />
          </p>
          <h3>JWT を認証に使うとき</h3>
          <p>
            JWT（JSON Web Token）は、JSON の値に署名を付けて1つの文字列にしたものです。署名付き JWT はヘッダー、ペイロード（本体のデータ）、署名からなり、ペイロードは誰でも読めます。署名によって内容が改変されていないことを調べ、許可する署名方式と鍵を受け手側で指定します。用途ごとに発行者 <code>iss</code>、受信者 <code>aud</code>、期限 <code>exp</code> などを検証します。ブラウザーでの保存先は JavaScript からの読み取りや Cookie の自動送信の性質を考えて決めます。<Ref n={37} />
          </p>
          <p>
            JWT が有効期限まで単独で使える構成では、個別失効に失効リストなどの状態が必要です。短命のアクセストークンと更新用トークンを使う場合は、更新時のローテーションや失効を設計します。一つの Rails アプリのブラウザーログインでは、サーバー側セッションで要件を満たせることもあります。<Ref n={37} /><Ref n={27} />
          </p>
          <p>
            既存の Rails アカウントに外部ログインを追加するときは、そのアカウントの本人が連携を承認する手順を設けます。多要素認証の復旧コードを発行する場合は、使ったコードを記録して1回限りにします。
          </p>
        </>
      ),
    },
    {
      id: 'injection',
      title: '入力が HTML や SQL として解釈される',
      body: (
        <>
          <p>
            アプリケーションは、利用者が入力した文字列を、HTML の一部として画面に出したり、SQL の一部としてデータベースに送ったりします。入力の中の記号が HTML のタグや SQL
            の命令として解釈されると、入力した人がページや SQL の動作を変えられます。
          </p>
          <p>
            まず HTML の例です。コメントの本文に <code>{'<script>alert("XSS")</script>'}</code> と書かれていた場合を、ERB の2通りの書き方で描画しました。
          </p>
          <Code
            lang="text"
            title="ApplicationController.render(inline: …) で描画した結果（bin/rails runner）"
            code={`
<%= body %>      → &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
<%= raw body %>  → <script>alert("XSS")</script>
`}
          />
          <p>
            <code>{'<%= %>'}</code> は、<code>{'<'}</code>・<code>{'>'}</code>・<code>"</code> を <code>&amp;lt;</code> などの文字参照（記号をそのまま文字として表示させる
            HTML の書き方）に変えて出力しました。これをエスケープと呼び、ブラウザーは入力を文字として表示します（<ChapterLink n={16} section="escape" />
            ）。<code>raw</code> を付けるとエスケープされず、ブラウザーは script タグとして JavaScript を実行します。コメントを読んだほかの利用者のブラウザーで、攻撃者が書いた JavaScript
            が動くことになります。このスクリプトはそのページの内容を読んだり、利用者のブラウザーから要求を送ったりできます。この攻撃を XSS（クロスサイトスクリプティング）と呼びます
            <Ref n={1} />。
          </p>
          <p>次は SQL の例です。記事の id でコメントを絞り込む SQL を、入力の文字列を埋め込んで作りました。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行したコード"
            code={`
[ "1", "1 OR 1=1" ].each do |input|
  rel = Comment.where("article_id = #{input}")
  puts "入力 #{input.inspect}"
  puts "  SQL: #{rel.to_sql}"
  puts "  件数: #{rel.count}"
end
puts "コメントの総数: #{Comment.count}"
rel = Comment.where(article_id: "1 OR 1=1")
puts "値として渡す: #{rel.to_sql} 件数: #{rel.count}"
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
入力 "1"
  SQL: SELECT \`comments\`.* FROM \`comments\` WHERE (article_id = 1)
  件数: 8
入力 "1 OR 1=1"
  SQL: SELECT \`comments\`.* FROM \`comments\` WHERE (article_id = 1 OR 1=1)
  件数: 2975
コメントの総数: 2975
値として渡す: SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1 件数: 8
`}
          />
          <p>
            入力が "1" なら、記事1のコメント8件が返ります。入力が "1 OR 1=1" だと条件が <code>article_id = 1 OR 1=1</code> になり、<code>1=1</code>{' '}
            は常に真なので、すべての行が条件に当てはまって、全部のコメント（2975件）が返りました。同じ条件で <code>delete_all</code> を呼べば、すべてのコメントが消えます。入力が SQL
            の命令の一部として解釈されたためで、この攻撃を SQL インジェクションと呼びます
            <Ref n={1} />。<code>where(article_id: 入力)</code> のように値として渡すと、Rails は入力を article_id の値として扱います。article_id は整数の列なので、入力は整数に変換されて 1
            になり、条件の形は変わりませんでした（図 33-4）。
          </p>
          <p>
            一括代入、CSRF、XSS、SQL インジェクションのどれも、利用者から届いた値や要求を、アプリケーションが確かめずに使うことで起きます。Rails はそれぞれに対策を用意していて、多くは既定で有効です。次の節では、それらの対策が要求を処理するどの段階で行われるかを見ます。
          </p>
          <Figure n="33-4" title="入力が SQL や HTML として解釈される" caption="デモ（Rails 8.1.4.1、MySQL 8.4）での bin/rails runner の実測をもとにした模式図。">
            <InjectionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'overview',
      title: 'セキュリティ対策の適用箇所',
      body: (
        <>
          <p>
            Rails の主なセキュリティ対策は、要求の処理の各段に分かれています（図 33-5）。多くは既定で有効ですが、設定が必要なものや、コードの書き方によって保護が働かなくなるものもあります。この章では、デモのアプリケーション（開発環境）で、攻撃を防げる例と、保護が働かなくなるコードの書き方を確かめます。全体はセキュリティのガイド
            <Ref n={1} />
            にまとめられています。
          </p>
          <Figure n="33-5" title="セキュリティ対策の適用箇所" caption="Rails 8.1.4.1 の default_middleware_stack.rb・request_forgery_protection.rb などと Securing Rails Applications（ガイド）をもとにまとめた図。">
            <WhereFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>攻撃</th>
                  <th>Rails の対策</th>
                  <th>外れる書き方の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CSRF</td>
                  <td>トークンと Origin の検証</td>
                  <td>GET で状態を変える、skip_forgery_protection</td>
                </tr>
                <tr>
                  <td>XSS</td>
                  <td>ビューの自動エスケープ</td>
                  <td>raw・html_safe、link_to の href に利用者の値</td>
                </tr>
                <tr>
                  <td>SQL インジェクション</td>
                  <td>プレースホルダーと Hash の条件</td>
                  <td>where や order への文字列の埋め込み、Arel.sql</td>
                </tr>
                <tr>
                  <td>一括代入</td>
                  <td>Strong Parameters</td>
                  <td>permit! や、admin のような列の permit</td>
                </tr>
                <tr>
                  <td>Host ヘッダーの偽装</td>
                  <td>HostAuthorization</td>
                  <td>本番環境で config.hosts を設定しない</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'csrf',
      title: 'CSRF の対策',
      body: (
        <>
          <p>
            CSRF（<Term en="Cross-Site Request Forgery">クロスサイトリクエストフォージェリ</Term>）は、利用者がログインしたまま別のサイトを開いたときに、そのサイトのページから利用者のブラウザーに POST などを送らせる攻撃です。ブラウザーは Cookie
            を自動で付けるので、セッションだけでは本人の操作か区別できません。Rails は、ページに埋め込んだトークンを POST などで送り返させて、それを確かめます。デモで、コメントのフォームのページを2回表示し、POST を4通り送りました。
          </p>
          <Code
            lang="text"
            code={`
  meta(1回目)=VaBI7h8i7LnCviLIz-ivgAun…  form=xFLohoeW5vb0BxihuffndPyn…  meta(2回目)=POCIG47HuFj6TFde345ykewz…
  デコード後の長さ=64 バイト（パッド32 + 暗号化したトークン32）
  トークンなし         => 422
  フォームのトークン   => 302 http://localhost/articles/1
  X-CSRF-Token（2回目のmeta） => 302
  正しいトークン + Origin: https://evil.example => 422
  forgery_protection_origin_check=true per_form_csrf_tokens=true
    log: HTTP Origin header (https://evil.example) didn't match request.base_url (http://localhost)
`}
          />
          <p>
            トークンは表示のたびに値が変わりますが、どれも受け付けられました。セッションに保存した1つのトークンを、毎回違うランダムな値（パッド）で隠して出力しているからです。デモの設定は <code>per_form_csrf_tokens=true</code> なので、フォームのトークンは送信先のアクションとメソッドごとに作られ、メタタグのトークンはどの送信先にも使えます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/request_forgery_protection.rb（470〜473行目、546〜551行目、635〜643行目）"
            href={`${GH}/actionpack/lib/action_controller/metal/request_forgery_protection.rb#L470-L473`}
            code={`
      def verified_request? # :doc:
        request.get? || request.head? || !protect_against_forgery? ||
          (valid_request_origin? && any_authenticity_token_valid?)
      end

      def mask_token(raw_token) # :doc:
        one_time_pad = SecureRandom.random_bytes(AUTHENTICITY_TOKEN_LENGTH)
        encrypted_csrf_token = xor_byte_strings(one_time_pad, raw_token)
        masked_token = one_time_pad + encrypted_csrf_token
        encode_csrf_token(masked_token)
      end

      def valid_request_origin? # :doc:
        if forgery_protection_origin_check
          # We accept blank origin headers because some user agents don't send it.
          raise InvalidAuthenticityToken, NULL_ORIGIN_MESSAGE if request.origin == "null"
          request.origin.nil? || request.origin == request.base_url
        else
          true
        end
      end
`}
          />
          <p>
            毎回値を変えるのは、HTTPS の圧縮を利用して秘密の値を推測する攻撃（BREACH）への対策です（ソースのコメント）。GET と HEAD は検証されないので、GET で状態を変える処理を作ると CSRF の対策が効きません。
            <code>forgery_protection_origin_check</code> は <code>load_defaults 5.0</code> 以降で true になり、Origin ヘッダーがあれば要求の URL のオリジンと一致するかも確かめます
            <Ref n={2} />。同じオリジンに JavaScript で状態を変更する要求を送る場合は、メタタグからトークンを取得して X-CSRF-Token ヘッダーに入れます。
          </p>
          <p>
            検証に失敗すると、<code>load_defaults 5.2</code> 以降の既定（<code>default_protect_from_forgery</code> により ActionController::Base に <code>protect_from_forgery with: :exception</code> が付く）により InvalidAuthenticityToken になり、ShowExceptions が 422
            にします（<ChapterLink n={10} section="exceptions" />
            ）。ALB（AWS のロードバランサー）などで HTTPS を終端していて Rails が要求を http と判断すると、ブラウザーの Origin（https://…）と <code>request.base_url</code>（http://…）が一致せず、正しいトークンでも 422 になります。この切り分けは
            <ChapterLink n={25} />で扱います。
          </p>
          <Figure n="33-6" title="CSRF トークンの発行と検証" caption="Rails 8.1.4.1 の request_forgery_protection.rb を読み、デモでの実測で確かめてまとめた模式図。">
            <CsrfFigure />
          </Figure>
          <Callout kind="note" title="開発中のバージョンでの Sec-Fetch-Site の検査">
            <p>
              Rails の開発中のブランチ（未リリース）の request_forgery_protection.rb には、ブラウザーが送る <code>Sec-Fetch-Site</code> ヘッダー（same-origin・same-site・cross-site
              など）で要求の出どころを確かめ、トークンを使わない検証方法が追加されています
              <Ref n={3} />。8.1.4.1 には無く、まだリリースされていない内容なので、今後のバージョンで変わる可能性があります。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'xss',
      title: 'XSS の対策',
      body: (
        <>
          <p>
            <ChapterLink n={16} section="escape" />
            で見たとおり、<code>{'<%= %>'}</code> は html_safe? でない値をエスケープします。ただし、エスケープは「HTML の本文に文字列を入れる」場面の対策で、それ以外の場面では足りません。デモで確かめました。
          </p>
          <Code
            lang="text"
            code={`
  link_to("x", "javascript:alert(1)") => <a href="javascript:alert(1)">x</a>
  { s: "</script><script>" }.to_json => {"s":"\\u003c/script\\u003e\\u003cscript\\u003e"}
  CSP ヘッダー: nil
`}
          />
          <p>
            <code>link_to</code> は href の値の <code>"</code> などはエスケープしますが、<code>javascript:</code> で始まる URL はそのまま出力しました。利用者が入力した URL をリンクにする場合は、
            <code>http</code> か <code>https</code> で始まることを確かめてから使います。一方、<code>to_json</code> は <code>{'<'}</code> と <code>{'>'}</code> を{' '}
            <code>\u003c</code> などに変えるので、<code>{'<script>'}</code> の中に JSON を埋め込んでもタグが閉じられません（ActiveSupport の{' '}
            <code>escape_html_entities_in_json</code>、既定で true）。
          </p>
          <p>
            Content-Security-Policy（CSP）は、ブラウザーに実行してよいスクリプトの出どころを指示するヘッダーで、エスケープ漏れがあっても被害を抑えられます。新規のアプリケーションの
            <code>config/initializers/content_security_policy.rb</code> は全体がコメントになっていて、デモでもヘッダーは出力されていませんでした。設定するときは、importmap のインラインのスクリプトのために nonce
            を使います
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'sqli',
      title: 'SQL インジェクションの対策',
      body: (
        <>
          <p>
            <ChapterLink n={12} section="arel" />
            で見たとおり、mysql2 のアダプターは値をクォートして SQL の文字列に入れます。値として渡せばクォートされますが、文字列に埋め込むとクォートされません。
          </p>
          <Code
            lang="text"
            code={`
x = "' OR '1'='1"
  文字列に埋め込む : SELECT \`articles\`.* FROM \`articles\` WHERE (title = '' OR '1'='1')
  プレースホルダー : SELECT \`articles\`.* FROM \`articles\` WHERE (title = '\\' OR \\'1\\'=\\'1')
  Hash の条件      : SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`title\` = '\\' OR \\'1\\'=\\'1'
  件数: 埋め込み=10004 プレースホルダー=0
  order に生の文字列 => ActiveRecord::UnknownAttributeReference: Dangerous query method (method whose arguments are used as raw SQL) called with non-attribute argument(s): "title; DROP TABLE articles".
  order(params の値を列名として) => ActiveRecord::UnknownAttributeReference
  sanitize_sql_like => 100\\%\\_off
`}
          />
          <p>
            埋め込んだ場合は条件が常に真になり、全件（10004件）が返りました。<code>order</code> や <code>pluck</code> は、列名として解釈できない文字列を渡すと例外を投げます。並び順を利用者に選ばせる場合は、許可する列名の一覧と照らし合わせてから渡します。
            <code>Arel.sql</code> で包むとこの検査を外せますが、利用者の値を入れてはいけません。LIKE の検索では、<code>sanitize_sql_like</code> で <code>%</code> と <code>_</code> をエスケープします
            <Ref n={1} />。
          </p>
          <p>
            一括代入については、<ChapterLink n={10} section="params" />
            の Strong Parameters が対策です。<code>params.expect(comment: [:body])</code> のように受け取る属性を列挙し、管理者かどうかを表す列などを利用者が変えられないようにします。
          </p>
        </>
      ),
    },
    {
      id: 'input-boundaries',
      title: "外部コマンド・ファイル・外向き通信を守る",
      body: (
        <>
          <p>
            利用者から届く値は、表示や DB の条件以外にも渡ります。どの処理がその値を解釈するかを決め、受け持つ境界で入力と出力を制限します。<Ref n={12} />
          </p>
          <ul>
            <li><strong>SQL の列や並び順</strong>を利用者が選ぶ場合は、受け取るキーとアプリが用意した列・順序の対応表から選びます。値に使えるプレースホルダーを、列名や SQL の並び順指定にも使えるとは限りません。<code>select</code>、<code>order</code>、<code>group</code>、<code>pluck</code> などに断片を渡す箇所を見ます。<Ref n={22} /><Ref n={12} /></li>
            <li><strong>OS コマンド</strong>が必要なら、実行するプログラムを固定し、<code>Open3.capture3(command, arg1, arg2)</code> などで引数を区別します。コマンド自身がオプションやファイル名をどう扱うかも検査します。<code>--</code> でオプションの終端を指定できるものではそれを使い、対応は各コマンドの仕様を確認します。ファイルを読む処理には <code>File.open</code> など、用途が限定された API を選べます。<Ref n={23} /></li>
            <li><strong>ファイルの取得や描画</strong>では、URL にファイルパスを持たせる代わりにレコードの ID を受け取り、認可済みのレコードから保管場所を解決します。入力からパスを組み立てる必要があれば、正規化やシンボリックリンクの解決後に許可ディレクトリの子であることを確かめます。接頭辞だけが同じ別ディレクトリにも注意し、書き換え可能なディレクトリを不用意に参照しません。テンプレート名も既知の値から選びます。<Ref n={12} /><Ref n={24} /></li>
            <li><strong>外部 URL の取得</strong>に利用者が入力できる場合、SSRF（サーバー自身から意図しない接続先へ要求を出させる問題）を防ぎます。対象が決まっていれば HTTPS の許可リストを使い、URL の構文、名前解決された接続先、リダイレクト先に同じ制約を適用します。内部ネットワークへ到達できない出口制御や、タイムアウト、応答サイズの上限も合わせます。<Ref n={25} /></li>
          </ul>
          <p>
            リダイレクトの戻り先はルートヘルパーで決めるか、同一ホストを確かめる <code>url_from(params[:return_to])</code> と既定の移動先を組み合わせます。外部サイトへの移動を許す場合は、対象をアプリの設定で管理します。アップロードはサイズ・許可した形式・ファイルの実データを検査し、公開するか、認可付きで配信するかをアプリで決めます（<ChapterLink n={19} section="attachment-lifecycle">添付と配信権限</ChapterLink>）。<Ref n={26} /><Ref n={24} />
          </p>
        </>
      ),
    },
    {
      id: 'secrets',
      title: 'secret_key_base と credentials',
      body: (
        <>
          <p>
            <ChapterLink n={10} section="cookies-session" />
            の署名・暗号化された Cookie の鍵は、<code>secret_key_base</code> から <code>Rails.application.key_generator</code>（PBKDF2）で用途ごとに作られます。署名付きの ID（ActiveStorage の
            URL、<ChapterLink n={19} section="serving" />
            ）の検証に使う鍵も、同じ秘密の値から作られます。
          </p>
          <Code
            lang="text"
            code={`
  credentials のキー: [:secret_key_base]
  key_generator.generate_key("authenticated encrypted cookie", 32) => 7f09ac6111ab53e5…
`}
          />
          <p>
            Rails 8.1.4.1 は secret_key_base を、環境変数 <code>SECRET_KEY_BASE</code>、credentials の <code>secret_key_base</code> の順に探します。開発環境とテスト環境でどちらも無いときだけ、tmp/local_secret.txt に作った値を使います（railties の configuration.rb の <code>secret_key_base</code>）。<code>rails new</code> が作る credentials には secret_key_base が入っているので、master.key がある開発環境では credentials の値が使われます。credentials
            は config/credentials.yml.enc に暗号化して保存され、復号の鍵は config/master.key か環境変数 <code>RAILS_MASTER_KEY</code> で渡します
            <Ref n={1} />。master.key はリポジトリーに入れません。
          </p>
          <p>
            secret_key_base を変えると、それから作られたすべての鍵が変わります。既存のセッションの Cookie は読めなくなって全員がログアウトし、すでに配った署名付きの URL やストリーム名も無効になります。
          </p>
          <p>
            次の図は、secret_key_base の出どころを上の段に、そこから作られる鍵の使い道を下の段に並べたものです。開発・テスト環境では上の段の左を、本番環境では中央か右を使います。
          </p>
          <Figure title="secret_key_base の出どころと、そこから作られる鍵" caption="デモ（開発環境）での bin/rails runner の実測と、Securing Rails Applications（ガイド）をもとにした模式図。下の段の鍵は用途ごとの文字列を変えて別々に作られます。">
            <SecretKeyBaseFigure />
          </Figure>
          <h3>秘密の値の保管と漏えいの検査</h3>
          <p>
            API キーやパスワードのような機密の設定は、暗号化された credentials か、配備先の秘密情報を管理する機能から渡します。利用者ごとに受け取る外部サービスのトークン（連携を続けるための更新用トークンなど）は、設定ではなくデータベースに保存する利用者のデータです。必要なら、列の値を暗号化して保存する Active Record Encryption の <code>encrypts :refresh_token</code> などで保管します。ログの値を [FILTERED] に置き換える <code>filter_parameters</code> にも、その名前を指定します。漏えいしたときは値を失効させて再発行し、利用状況を調査します。履歴や出力から値を取り除く作業と、値そのものを使えなくする作業は、どちらも必要です。<Ref n={12} /><Ref n={28} />
          </p>
          <p>
            漏えいの検査にはリポジトリの変更履歴から API キーなどの秘密の値を探す <code>gitleaks</code> などのツールを使えます。リポジトリ全体だけでなく、CI で変更の差分にも実行できます。<ChapterLink n={21} section="tools" /> の Brakeman と bundler-audit に加え、依存する gem の新しいバージョンを知らせ、更新のプルリクエストを作る Dependabot などで、依存の見直しを続けます。脆弱性が見つかったときは、該当するバージョンと、アプリがその機能を使う経路を確かめます。OWASP（Web アプリのセキュリティの情報を公開している団体）の ASVS は、アプリの安全性を確かめる項目を一覧にした基準です。認証やセッションの項目を、コードレビューで確かめる内容に使えます。<Ref n={29} /><Ref n={30} /><Ref n={31} />
          </p>
        </>
      ),
    },
    {
      id: 'host-ssl-csp',
      title: 'Host Authorization と force_ssl',
      body: (
        <>
          <p>HostAuthorization と SSL のミドルウェアは、設定があるときだけミドルウェアのスタックに入ります。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/default_middleware_stack.rb（16〜27行目から抜粋）"
            href={`${GH}/railties/lib/rails/application/default_middleware_stack.rb#L16-L27`}
            code={`
          unless Array(config.hosts).empty?
            middleware.use ::ActionDispatch::HostAuthorization, config.hosts, **config.host_authorization
          end

          if config.assume_ssl
            middleware.use ::ActionDispatch::AssumeSSL
          end

          if config.force_ssl
            middleware.use ::ActionDispatch::SSL, **config.ssl_options,
`}
          />
          <p>
            開発環境の <code>config.hosts</code> は localhost などを許可する一覧で、それ以外の Host の要求は 403 になりました。本番環境の既定値は空の配列で、HostAuthorization
            は入りません。Host ヘッダーは、コントローラーやビューでの URL の生成（<code>redirect_to</code> や <code>*_url</code> のヘルパー）に使われるので、本番環境でも <code>config.hosts</code> を設定します。
          </p>
          <Code
            lang="text"
            code={`
  Host: evil.example => 403 Blocked hosts: evil.example

（ActionDispatch::SSL を直接呼ぶ）
  http  => 301 location=https://example.com/articles?x=1
  https => 200 strict-transport-security=max-age=31556952; includeSubDomains   ← hsts: { expires: 1.year } を渡したので1年 set-cookie=["_s=1; path=/; httponly; secure"]
  http + X-Forwarded-Proto: https => 200
`}
          />
          <p>
            <code>config.force_ssl = true</code> で入る ActionDispatch::SSL は、http の要求を https に 301 で転送し、https の応答に HSTS のヘッダーを付け、Cookie に secure
            属性を付けます。HSTS の max-age の既定値は2年（63072000 秒、ssl.rb の <code>HSTS_EXPIRES_IN</code>）で、上の実測では1年を指定しています。X-Forwarded-Proto が https なら https の要求として扱います。ロードバランサーで HTTPS を終端する構成では、このヘッダーの受け渡しを誤るとリダイレクトが繰り返されます（
            <ChapterLink n={25} />
            ）。新規のアプリケーションの本番環境の設定には、<code>config.assume_ssl = true</code>（すべての要求を https とみなす）と <code>force_ssl</code> の両方が入っています。
          </p>
        </>
      ),
    },
    {
      id: 'tools',
      title: '検査ツール',
      body: (
        <>
          <p>
            Brakeman はソースを解析してセキュリティ上の問題を探すツールです<Ref n={5} />。デモのアプリケーションでは警告はありませんでした。検査のために、危険な書き方のコントローラーとビューを一時的に追加して実行しました（確認後に削除）。
          </p>
          <Code
            lang="ruby"
            title="一時的に追加したコード"
            code={`
class VulnController < ApplicationController
  def search
    @articles = Article.where("title = '#{params[:q]}'")
  end

  def go
    redirect_to params[:url], allow_other_host: true
  end
end
# app/views/vuln/search.html.erb
# <%= link_to "戻る", params[:back] %>
# <%= raw params[:q] %>
`}
          />
          <Code
            lang="text"
            code={`
Security Warnings: 4
Cross-Site Scripting: 2
Redirect: 1
SQL Injection: 1

Confidence: High   Check: LinkToHref          Message: Unsafe parameter value in \`link_to\` href
Confidence: High   Check: CrossSiteScripting  Message: Unescaped parameter value
Confidence: High   Check: SQL                 Message: Possible SQL injection
Confidence: Weak   Check: Redirect            Message: Possible unprotected redirect
`}
          />
          <p>
            Brakeman は追加した4か所をすべて検出しました。bundler-audit は Gemfile.lock
            の gem のバージョンを、既知の脆弱性の一覧と照らし合わせます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 の rails new も Gemfile に brakeman を入れますが、bundler-audit と、これらをまとめて実行する config/ci.rb は 8.1 で追加されました
              <Ref n={4} />。この章で見た CSRF・エスケープ・SQL・Host Authorization・SSL の仕組みは 7.2.4 でも同じです。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'redirects',
      title: 'リダイレクト先を制限する',
      body: (
        <>
          <p>アプリが入力された URL へ無条件にリダイレクトすると、利用者は自サイトの URL を開いたつもりでも別のサイトに移動することがあります。これがオープンリダイレクトです。遷移先が数種類なら、受け取った名前に対応するルートを選び、登録されていない名前では既定のページに戻ります。<Ref n={26} /></p>
          <Code lang="ruby" title="ログイン後の遷移先を登録済みのルートから選ぶ例" code={`
def redirect_after_sign_in
  destination = case params[:destination]
  when "profile" then profile_path
  when "articles" then articles_path
  else root_path
  end

  redirect_to destination, status: :see_other
end
`} />
          <p>やむを得ず URL を入力として受け取る場合、<code>url_from</code> は Rails が内部向けと判定できた URL を返し、それ以外は nil を返します。TLS を使うことや、遷移先での操作を利用者に許可することは別に確認します。<Ref n={26} /></p>
          <p><code>redirect_to</code> 自体にも外部のホストへの移動を止める仕組みがあります。actionpack 8.1.4.1 の <code>action_on_open_redirect</code> の既定は <code>:log</code>（ログに警告を出して移動する）ですが、<code>config.load_defaults "7.0"</code> 以降を指定したアプリでは <code>:raise</code>（例外を発生させる）になります。<code>rails new</code> で作った 8.1 のアプリは <code>load_defaults "8.1"</code> なので、外部の URL をそのまま <code>redirect_to</code> に渡すと <code>ActionController::Redirecting::OpenRedirectError</code> が発生します。1ファイルの Rails アプリで、load_defaults の値を変えて同じ要求を送りました。<Ref n={38} /></p>
          <Code lang="text" title="外部の URL へのリダイレクト（Rails 8.1.4.1、Ruby 4.0.9。例外の場面のバックトレースは省略）" code={`
load_defaults 8.1: action_on_open_redirect=:raise
/go         to=https://evil.example/login => 500（OpenRedirectError: Unsafe redirect to "https://evil.example/login",
                                                  pass allow_other_host: true to redirect anyway.）
/go         to=/articles                  => 302 http://example.org/articles
/go_allowed to=https://evil.example/login => 302 https://evil.example/login
/go_from    to=https://evil.example/login => 302 http://example.org/
/go_from    to=http://example.org/articles => 302 http://example.org/articles

load_defaults 6.1: action_on_open_redirect=:log
/go         to=https://evil.example/login => 302 https://evil.example/login
            （ログ: Open redirect to "https://evil.example/login" detected）
`} />
          <p><code>/go</code> は <code>redirect_to(params[:to])</code>、<code>/go_allowed</code> は <code>allow_other_host: true</code> を付けた呼び出し、<code>/go_from</code> は <code>redirect_to(url_from(params[:to]) || "/")</code> です。load_defaults 8.1 では外部の URL を渡した <code>/go</code> だけが 500 になりました。同じホストのパスは通常どおり 302 になり、<code>url_from</code> は外部の URL に nil を返すので既定のページへ移動しました。<code>allow_other_host: true</code> を付けると、設定にかかわらず外部へ移動します。load_defaults を古い値のまま上げていないアプリでは、警告のログだけで外部へ移動するので、設定の値を確かめます。</p>
          <p>この例外は外部の URL を入力から受け取ったときの最後の防御で、本来の対策ではありません。遷移先はルートの名前か <code>url_from</code> で決め、外部への移動は、アプリが URL を決める呼び出しにだけ <code>allow_other_host: true</code> を付けます。</p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>要求の URL・ヘッダー・Cookie・フォームの値は、送る側が自由に作れます。受け取った値をまとめてモデルに渡すと、作り手が変えさせるつもりのない列まで変わるので、Strong Parameters で受け取る属性を決めます。</li>
          <li>CookieStore はセッションを暗号化して Cookie に入れます。Rails 8 の認証ジェネレーターでは、DB に保存したセッションを Cookie の ID で参照し、サーバー側で失効させられます。</li>
          <li>認証で利用者を確認し、認可ではその利用者が対象のレコードを読んだり変更したりできるかを確かめます。</li>
          <li>別のサイトから送らせた要求にも Cookie が付く場合があり、これを利用するのが CSRF です。</li>
          <li>入力の記号が HTML のタグや SQL の命令として解釈されると、XSS や SQL インジェクションになります。&lt;%= %&gt; のエスケープと、SQL に値として渡す書き方で防ぎます。</li>
          <li>CSRF のトークンはセッションの値を毎回違うパッドで隠して出力され、POST などで送り返された値と Origin ヘッダーが検証されます。GET は検証されません。</li>
          <li>自動エスケープは HTML の本文の対策です。link_to の href の javascript: は防がないので、URL は自分で確かめます。CSP は既定では設定されていません。</li>
          <li>SQL には値をプレースホルダーか Hash で渡します。order などは列名でない文字列を拒否します。</li>
          <li>Cookie・署名付き ID・ストリーム名の鍵は secret_key_base から作られ、変えるとすべて無効になります。</li>
          <li>HostAuthorization と SSL のミドルウェアは設定したときだけ入ります。本番環境でも config.hosts を設定します。</li>
          <li>Brakeman はソースから危険な書き方を検出し、bundler-audit は gem の既知の脆弱性を検出します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Securing Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/security.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'CSRF・XSS・SQL インジェクション・一括代入・Host Authorization・CSP（nonce）・credentials。' },
    { title: 'actionpack/lib/action_controller/metal/request_forgery_protection.rb・railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/request_forgery_protection.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'verified_request?・mask_token・valid_request_origin?、load_defaults 5.0 の forgery_protection_origin_check と per_form_csrf_tokens。' },
    { title: 'actionpack/lib/action_controller/metal/request_forgery_protection.rb（開発中のブランチ）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/fec707f56360ce14b1a3c24b4be5e8f3bc84e12f/actionpack/lib/action_controller/metal/request_forgery_protection.rb', accessed: '2026-11-11', version: '未リリース（main、コミット fec707f）', note: 'Sec-Fetch-Site ヘッダーによる検証（header_only・header_or_legacy_token）。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/Gemfile.tt・config/ci.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/ci.rb.tt`, accessed: '2026-11-11', version: 'Rails 8.1.4.1（7.2.4 と比較）', note: '8.1 の rails new が bundler-audit と config/ci.rb（Brakeman・bundler-audit を実行）を生成すること。' },
    { title: 'Brakeman', publisher: 'Brakeman Project', url: 'https://brakemanscanner.org/', accessed: '2026-11-11', version: 'Brakeman 8.1.0', note: 'Rails のソースを静的に解析してセキュリティ上の問題を報告するツール（デモで実行）。' },
    { title: 'Using HTTP cookies', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', accessed: '2026-11-16', note: 'サーバーが Set-Cookie で渡した Cookie をブラウザーが保存し、その後の要求の Cookie ヘッダーで送り返すこと。デモで curl により確認。' },
    { title: 'Set-Cookie', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie', accessed: '2026-11-16', note: 'SameSite=Lax の Cookie は、別のサイトからの要求のうち、安全なメソッドのトップレベルの移動にだけ付き、POST には付かないこと。HttpOnly は JavaScript から Cookie を読めなくすること。' },
    { title: 'Site（用語集）', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Site', accessed: '2026-11-16', note: 'サイトは登録できるドメインの単位（と通信方式）で決まり、同じドメインのサブドメインは同じサイトになること。' },
    { title: 'Configuring Rails Applications（cookies_same_site_protection）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/configuring.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'load_defaults 6.1 で config.action_dispatch.cookies_same_site_protection が :lax になること。デモの set-cookie にも samesite=lax が付いた。' },
    { title: 'railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'start_new_session_for が sessions テーブルに行を作り、その id を cookies.signed.permanent[:session_id] に入れること。' },
    { title: 'Action Controller Overview（Strong Parameters）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_controller_overview.html', accessed: '2026-11-16', version: 'Rails 8.1', note: '許可せずに一括代入すると ActiveModel::ForbiddenAttributesError になること、expect と permit!。デモで実測。' },
    { title: "Securing Rails Applications", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/security.html", accessed: "2026-11-20", version: "Rails 8.1", note: "認証、セッション、CSRF、入力、アップロードの安全性。" },
    { title: "ActiveModel::SecurePassword", publisher: "Rails API", url: "https://api.rubyonrails.org/v8.1.3/classes/ActiveModel/SecurePassword/ClassMethods.html", accessed: "2026-11-20", version: "Rails 8.1", note: "bcrypt と再設定用トークン、既定の有効期限。" },
    { title: "Authentication Cheat Sheet", publisher: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", accessed: "2026-11-20", note: "レート制限、応答の統一、再認証。" },
    { title: "ActionController::RateLimiting", publisher: "Rails API", url: "https://api.rubyonrails.org/v8.1/classes/ActionController/RateLimiting/ClassMethods.html", accessed: "2026-11-20", version: "Rails 8.1", note: "rate_limit の適用範囲、キャッシュと IP。" },
    { title: "Rack::Attack", publisher: "rack/rack-attack", url: "https://github.com/rack/rack-attack", accessed: "2026-11-20", note: "ミドルウェアでの頻度制限とキャッシュストア。" },
    { title: "Getting Started with Rails", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/getting_started.html", accessed: "2026-11-20", version: "Rails 8.1", note: "認証ジェネレーターと生成されるファイル。" },
    { title: "Rails Authentication generator", publisher: "rails/rails", url: "https://github.com/rails/rails/tree/v8.1.4.1/railties/lib/rails/generators/rails/authentication/templates", accessed: "2026-11-20", note: "生成される Session、Authentication Concern、パスワード再設定。" },
    { title: "Devise", publisher: "heartcombo/devise", url: "https://github.com/heartcombo/devise", accessed: "2026-11-20", note: "構成モジュール、設定、テストと画面のカスタマイズ。" },
    { title: "Pundit", publisher: "varvet/pundit", url: "https://github.com/varvet/pundit", accessed: "2026-11-20", note: "ポリシー、スコープ、認可の検査。" },
    { title: "CanCanCan", publisher: "coorasse/cancancan", url: "https://github.com/coorasse/cancancan", accessed: "2026-11-20", note: "Ability、authorize!、accessible_by。" },
    { title: "Active Record Querying", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_querying.html", accessed: "2026-11-20", version: "Rails 8.1", note: "Relation、スコープ、バッチ、一覧と集計の問い合わせ。" },
    { title: "OS Command Injection Defense Cheat Sheet", publisher: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html", accessed: "2026-11-20", note: "コマンドを直接実行し、プログラムと引数を制限する。" },
    { title: "File Upload Cheat Sheet", publisher: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html", accessed: "2026-11-20", note: "ファイル形式・サイズと配信の認可。" },
    { title: "Server Side Request Forgery Prevention Cheat Sheet", publisher: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html", accessed: "2026-11-20", note: "宛先の許可リストとネットワーク制御。" },
    { title: "ActionController::Redirecting", publisher: "Rails API", url: "https://api.rubyonrails.org/v8.1.0/classes/ActionController/Redirecting.html", accessed: "2026-11-20", version: "Rails 8.1", note: "リダイレクトの HTTP ステータスと url_from。" },
    { title: "Session Management Cheat Sheet", publisher: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html", accessed: "2026-11-20", note: "セッションの生成、Cookie 属性と失効。" },
    { title: "Active Record Encryption", publisher: "Ruby on Rails Guides", url: "https://guides.rubyonrails.org/v8.1/active_record_encryption.html", accessed: "2026-11-20", version: "Rails 8.1", note: "モデルの属性に対する暗号化の宣言。" },
    { title: "Gitleaks", publisher: "gitleaks/gitleaks", url: "https://github.com/gitleaks/gitleaks", accessed: "2026-11-20", note: "機密値が変更履歴に含まれないかを検査する。" },
    { title: "Dependabot version updates", publisher: "GitHub Docs", url: "https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-version-updates", accessed: "2026-11-20", note: "依存関係の更新を通知し、変更案を作る。" },
    { title: "OWASP Application Security Verification Standard", publisher: "OWASP", url: "https://asvs.owasp.org/", accessed: "2026-11-20", note: "アプリケーションのセキュリティを検証するための基準。" },
    { title: "Multifactor Authentication Cheat Sheet", publisher: "OWASP Cheat Sheet Series", url: "https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html", accessed: "2026-11-20", note: "各認証要素の特性と復旧手段。" },
    { title: "RFC 6238: TOTP", publisher: "IETF", url: "https://www.rfc-editor.org/rfc/rfc6238.html", accessed: "2026-11-20", note: "時刻に基づくワンタイムパスワード。" },
    { title: "OpenID Connect Core 1.0", publisher: "OpenID Foundation", url: "https://openid.net/specs/openid-connect-core-1_0.html", accessed: "2026-11-20", note: "ID トークン、認可コード、nonce と各値の検証。" },
    { title: "RFC 9700: OAuth 2.0 Security Best Current Practice", publisher: "IETF", url: "https://www.rfc-editor.org/rfc/rfc9700.html", accessed: "2026-11-20", note: "コード交換時の保護、PKCE とリダイレクト URI の検証。" },
    { title: "OmniAuth", publisher: "omniauth/omniauth", url: "https://github.com/omniauth/omniauth", accessed: "2026-11-20", note: "外部認証の Rack ミドルウェア、要求フェーズの検証。" },
    { title: "RFC 8725: JSON Web Token Best Current Practices", publisher: "IETF", url: "https://www.rfc-editor.org/rfc/rfc8725.html", accessed: "2026-11-20", note: "アルゴリズム・発行元・受信者を検証する。" },
    { title: 'actionpack/lib/action_controller/metal/redirecting.rb・railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/redirecting.rb`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'action_on_open_redirect の既定 :log（30行）、_enforce_open_redirect_protection（277〜296行）、load_defaults 7.0 で :raise（configuration.rb 266行）。1ファイルの Rails アプリで load_defaults 8.1 と 6.1 を実測。' },
    { title: 'RFC 7636: Proof Key for Code Exchange by OAuth Public Clients', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc7636.html', accessed: '2026-11-28', version: 'RFC 7636（2015年9月）', note: 'code_verifier と code_challenge（S256）、トークンの要求時の検証' },
  ],
}

export default withExplanations(ch21, explanation21)
