import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { withExplanations } from '../explanations/shared'
import { explanation26 } from '../explanations/operations'
import { ChapterLink, Code, Figure, Ref } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 44-1 要求が通る部品 ---------- */
function PartsFigure() {
  const front = [
    { x: 20, t: 'ブラウザー', s: 'URL を開く' },
    { x: 220, t: 'ロードバランサー', s: '第41章' },
    { x: 420, t: 'Nginx', s: '第40章' },
    { x: 620, t: 'Puma', s: '第39章' },
  ]
  const rails = [
    { x: 34, t: 'ミドルウェア', s: '第11章' },
    { x: 174, t: 'ルーティング', s: '第15章' },
    { x: 314, t: 'コントローラー', s: '第16章' },
    { x: 454, t: 'モデル', s: `第${chapterNumber(11)}〜${chapterNumber(13)}章` },
  ]
  return (
    <Svg
      id="44-1"
      w={780}
      h={330}
      label={`GET /articles/1 が通る部品を順に並べた図。ブラウザーの要求は、ロードバランサー（第41章）、Nginx（第40章）、Puma（第39章）の順に届く。Puma が呼ぶ Rails のアプリケーションの中では、ミドルウェア（第11章）、ルーティング（第15章）、コントローラー（第16章）の順に進み、コントローラーはモデル（第${chapterNumber(11)}〜${chapterNumber(13)}章）を通して MySQL（第22・25章）から記事を読み、ビュー（第27章）で HTML を作る。応答は同じ経路を逆にたどってブラウザーに戻る`}
    >
      {front.map((b, i) => (
        <g key={b.t}>
          <Box x={b.x} y={20} w={150} h={56} lines={[b.t, b.s]} fs={12} bold fill={i === 0 ? 'bg' : 'box'} subTone="muted" />
          {i < front.length - 1 && <Arrow x1={b.x + 150} y1={48} x2={front[i + 1].x - 2} y2={48} />}
        </g>
      ))}
      <rect x={20} y={110} width={580} height={180} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <Arrow d="M695,76 L695,96 L94,96 L94,144" />
      <T x={340} y={126} fs={11} tone="muted">
        Rails のアプリケーション（Puma が呼ぶ）
      </T>
      {rails.map((b, i) => (
        <g key={b.t}>
          <Box x={b.x} y={146} w={120} h={52} lines={[b.t, b.s]} fs={12} bold fill="box5" subTone="muted" />
          {i < rails.length - 1 && <Arrow x1={b.x + 120} y1={172} x2={rails[i + 1].x - 2} y2={172} />}
        </g>
      ))}
      <Arrow x1={374} y1={198} x2={374} y2={224} />
      <Box x={314} y={226} w={120} h={52} lines={['ビュー', '第27章']} fs={12} bold fill="box5" subTone="muted" />
      <Arrow x1={574} y1={172} x2={628} y2={172} both />
      <Box x={630} y={146} w={130} h={52} lines={['MySQL', '第22・25章']} fs={12} bold fill="box4" subTone="muted" />
      <T x={600} y={160} fs={10} tone="muted" mono>
        SQL
      </T>
      <T x={20} y={314} fs={11} tone="muted">
        応答（HTML）は、ビュー → コントローラー → ミドルウェア → Puma → Nginx → ロードバランサー → ブラウザーの順に戻る
      </T>
    </Svg>
  )
}

/* ---------- 図 44-2 リクエスト全体のシーケンス ---------- */
function SequenceFigure() {
  const lanes = [
    { x: 36, t: 'ブラウザー' },
    { x: 88, t: 'ALB' },
    { x: 132, t: 'Nginx' },
    { x: 179, t: 'Puma' },
    { x: 242, t: 'ミドルウェア' },
    { x: 325, t: 'コントローラー' },
    { x: 406, t: 'DB・ビュー' },
  ]
  const steps: { a: number; b: number; y: number; t: string; chapters: number[]; back?: boolean; self?: boolean }[] = [
    { a: 0, b: 1, y: 60, t: 'GET /articles/1（HTTPS）', chapters: [25] },
    { a: 1, b: 2, y: 92, t: '転送元の情報を付けて HTTP で転送', chapters: [25] },
    { a: 2, b: 2, y: 116, t: 'try_files でファイルが見つからず @app へ', chapters: [24], self: true },
    { a: 2, b: 3, y: 148, t: '要求 ID を付けて Puma に転送', chapters: [24] },
    { a: 3, b: 3, y: 172, t: 'スレッドが要求を受け取る', chapters: [23], self: true },
    { a: 3, b: 4, y: 204, t: 'app.call(env) で Rails を呼ぶ', chapters: [6] },
    { a: 4, b: 4, y: 228, t: 'HTTPS の確認、要求 ID やログの処理', chapters: [6, 8, 21, 25], self: true },
    { a: 4, b: 5, y: 260, t: 'ルーティング → articles#show', chapters: [9, 10] },
    { a: 5, b: 6, y: 292, t: 'Article.find(1) → SQL', chapters: [11, 12, 15] },
    { a: 5, b: 6, y: 324, t: '描画（パーシャル・関連の SQL）', chapters: [13, 16] },
    { a: 5, b: 3, y: 360, t: 'Rails が [status, headers, body] を返す', chapters: [6, 10], back: true },
    { a: 3, b: 2, y: 392, t: 'Puma が Nginx に応答を書き込む', chapters: [23, 24], back: true },
    { a: 2, b: 0, y: 424, t: 'ALB を通って HTML が届く（200）', chapters: [24, 25], back: true },
    { a: 0, b: 2, y: 460, t: '別の要求で CSS などを取得', chapters: [16, 24] },
    { a: 0, b: 3, y: 492, t: '/cable への接続を Puma に転送', chapters: [24] },
  ]
  return (
    <Svg
      id="44-2"
      w={820}
      h={520}
      label="GET /articles/1 は、ブラウザーから ALB に HTTPS で届き、ALB が TLS を終端して Nginx に HTTP で送る。Nginx は location / の try_files でファイルが無いことを確かめ、@app から Puma に送る。Puma が要求を読み、スレッドで Rails を呼ぶと、Rails のミドルウェア（AssumeSSL、SSL、Executor、RequestId、RemoteIp、Logger など）を通ってルーティングが articles#show を選ぶ。コントローラーが Article.find(1) で SQL を送り、ビューがレイアウトとパーシャルを描画する途中で関連の SQL を送る。応答は Puma のスレッドが Nginx に書き込み、Nginx がバッファーして ALB を通ってブラウザーに返す。その後、ブラウザーはアセットを Nginx から直接取得し、/cable に WebSocket で接続する。各段の横の数字は、その段を扱った章の番号"
    >
      <T x={454} y={20} bold fs={12}>この時点の処理</T>
      <T x={808} y={20} anchor="end" bold fs={12}>参照する章</T>
      {lanes.map((l) => (
        <g key={l.t}>
          <T x={l.x} y={20} anchor="middle" bold fs={11.5}>
            {l.t}
          </T>
          <line x1={l.x} y1={32} x2={l.x} y2={506} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {steps.map((st) => {
        const x1 = lanes[st.a].x
        const x2 = lanes[st.b].x
        return (
          <g key={st.t}>
            {st.self ? (
              <rect x={x1 - 5} y={st.y - 5} width={10} height={10} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            ) : (
              <Arrow x1={x1} y1={st.y} x2={x2 + (x2 > x1 ? -2 : 2)} y2={st.y} dashed={st.back} />
            )}
            <T x={454} y={st.y} fs={12}>{st.t}</T>
            <T x={808} y={st.y} anchor="end" fs={12} tone="muted">{st.chapters.map(chapterNumber).join('・')}</T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 44-4 段階とログの対応 ---------- */
function LogsFigure() {
  const rows = [
    { s: 'ロードバランサー', log: 'AWS の ALB なら elb_status_code・target_status_code・target_processing_time', demo: 'デモの Nginx：lb_time=0.008 upstream_status=200' },
    { s: 'Nginx', log: 'access.log（$request_id・$request_time・$upstream_response_time）・error.log', demo: 'request_id=e18060ac… rt=0.007 urt=0.007' },
    { s: 'Puma', log: '/stats（backlog・busy_threads）、標準出力（ワーカーの起動・停止）', demo: 'backlog=0 busy_threads=0' },
    { s: 'Rails|ミドルウェア・コントローラー', log: 'Started・Processing by・Parameters・Completed（log_tags で request_id）', demo: 'Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 0.6ms …)' },
    { s: 'ActiveRecord・MySQL', log: 'SQL の行（debug）、スロークエリログ、EXPLAIN', demo: 'Article Load (0.4ms) SELECT … WHERE id = 1 LIMIT 1' },
    { s: 'ビュー', log: 'Rendering・Rendered（debug）、Server-Timing（開発環境）', demo: 'Rendered layout layouts/application.html.erb (Duration: 2.8ms)' },
  ]
  return (
    <Svg
      id="44-4"
      w={790}
      h={rows.length * 58 + 30}
      label="各段の上段に調べるログ、下段にデモの記録を示す。ロードバランサーは、AWS の ALB ではアクセスログを調べ、Nginx を使ったデモでは lb_time が 8ms だった。その後の Nginx は access.log と error.log、Puma は /stats と標準出力、Rails は Started から Completed までの行、ActiveRecord は SQL の行、ビューは Rendered の行を見る"
    >
      {rows.map((r, i) => {
        const y = 14 + i * 58
        return (
          <g key={r.s}>
            <Box x={14} y={y} w={190} h={48} lines={r.s.split('|')} fs={12} bold fill={i < 3 ? 'box' : 'box5'} subTone="muted" />
            <T x={216} y={y + 16} fs={11}>
              {r.log}
            </T>
            <T x={216} y={y + 36} fs={11.5} tone="muted" mono>
              {r.demo}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 各ログの時間が測る範囲（番号なし） ---------- */
function TimeRangesFigure() {
  const x0 = 210
  const sc = 58 // 1ms あたりの幅
  const bx = (ms: number) => x0 + ms * sc
  const rows = [
    { t: 'ロードバランサー役の lb_time', s: 0, d: 8 },
    { t: 'Nginx の rt', s: 0.5, d: 7 },
    { t: 'Nginx の urt', s: 0.5, d: 7 },
    { t: 'Rails の Completed', s: 1.5, d: 5 },
  ]
  return (
    <Svg
      id="ch26-time-ranges"
      w={780}
      h={320}
      label="GET /articles/1 の1回の記録で、各ログの時間が測る範囲を棒で並べた図。ロードバランサー役の lb_time が 8ms で最も外側にあり、その中に Nginx の rt の 7ms と urt の 7ms、さらにその中に Rails の Completed の 5ms がある。urt と Completed の差の約2ms には、スレッドの空き待ち、ミドルウェア、ルーティング、応答の書き戻しが含まれる。Completed の 5ms のうち、Views が 2.9ms、ActiveRecord が 0.6ms で、残りはどちらにも入らない時間。外側の値に内側の値を足すと、内側の時間を二重に数える"
    >
      {rows.map((r, i) => {
        const y = 16 + i * 40
        return (
          <g key={r.t}>
            <T x={x0 - 12} y={y + 14} anchor="end" fs={11.5}>
              {r.t}
            </T>
            <Box x={bx(r.s)} y={y} w={r.d * sc} h={28} lines={`${r.d}ms`} fs={12} />
          </g>
        )
      })}
      <T x={bx(7.5) + 10} y={110} fs={11.5} tone="muted">
        rt と同じ値
      </T>
      <Box x={bx(0.5)} y={136} w={sc} h={28} fill="box5" dashed />
      <Box x={bx(6.5)} y={136} w={sc} h={28} fill="box5" dashed />
      <T x={x0 - 60} y={182} fs={11.5} tone="acc">
        Completed の左右の区間：合わせて約2ms。スレッドの空き待ち、ミドルウェア、ルーティング、応答の書き戻し
      </T>
      <T x={x0 - 12} y={214} anchor="end" fs={11.5}>
        Completed の内訳
      </T>
      <Box x={bx(1.5)} y={200} w={2.9 * sc} h={28} lines="Views 2.9ms" fs={11.5} />
      <Box x={bx(4.4)} y={200} w={0.6 * sc} h={28} lines="AR" fs={11.5} fill="box4" />
      <Box x={bx(5)} y={200} w={1.5 * sc} h={28} lines="残り" fs={11.5} fill="bg" dashed />
      <T x={bx(4.7)} y={244} anchor="middle" fs={11.5} tone="muted">
        ActiveRecord 0.6ms（SQL 2回）
      </T>
      <T x={20} y={278} fs={11.5} tone="muted">
        上の行ほど外側で測った時間で、下の行の範囲を含む。外側の値に内側の値を足すと、内側の時間を二重に数える
      </T>
      <T x={20} y={300} fs={11.5} tone="muted">
        スレッドの空き待ちは Rails のログに出ない。Puma の backlog か X-Request-Start との差で調べる
      </T>
    </Svg>
  )
}

/* ---------- 図 44-3（段階送り）SQL を送るまでの呼び出しの重なり ---------- */
const CALL_STAGES = [
  { name: 'RouteSet#call', at: 'route_set.rb:906' },
  { name: 'Journey::Router#serve', at: 'journey/router.rb:31' },
  { name: 'Dispatcher#serve', at: 'route_set.rb:50' },
  { name: 'Metal.dispatch → process', at: 'metal.rb:335' },
  { name: 'process_action（6段）', at: 'controller_runtime.rb:39' },
  { name: 'default_render → 描画', at: 'implicit_render.rb:39' },
  { name: 'Relation#load', at: 'collection_renderer.rb:131' },
  { name: 'select_all → log', at: 'connection_pool.rb:459' },
]

function CallStackSvg({ i }: { i: number }) {
  return (
    <Svg
      id={`44-3-${i + 1}`}
      w={760}
      h={252}
      label={`Comment Load の SQL を送るまでに通る8つの段のうち、${i + 1}段目の ${CALL_STAGES[i].name} を実行している状態。${i > 0 ? `上の${i}段は呼び出し履歴に残ったまま、この段が戻るのを待っている。` : ''}${i < 7 ? `下の${7 - i}段はまだ呼ばれていない。` : ''}`}
    >
      {CALL_STAGES.map((s, k) => {
        const y = 8 + k * 26
        return (
          <g key={s.name}>
            <Box x={20 + k * 22} y={y} w={300} h={22} lines={s.name} fs={11.5} mono bold={k === i} accent={k === i} dashed={k > i} fill={k === i ? 'box5' : k < i ? 'box' : 'bg'} />
            <T x={500} y={y + 11} fs={11.5} mono={k <= i} tone={k === i ? undefined : 'muted'}>
              {k <= i ? s.at : '（まだ呼ばれていない）'}
            </T>
          </g>
        )
      })}
      <T x={20} y={234} fs={11} tone="muted">
        右下に行くほど内側で呼ばれた段。上の段は、下の段がすべて戻るまで終わらない。右は呼び出し履歴でその段が始まる行
      </T>
    </Svg>
  )
}

const callSteps = [
  {
    label: '1. RouteSet#call',
    detail: (
      <>
        <CallStackSvg i={0} />
        <p>
          ミドルウェアの最後の段が呼ぶのは、routes.rb から作ったルーティングの Rack アプリ（RouteSet）です。RouteSet#call は env から要求のオブジェクトを作り、パスの表記をそろえてから Journey::Router#serve に渡します。<Ref n={6} />
        </p>
        <p>詳しく扱う節：<ChapterLink n={6} section="build" /></p>
      </>
    ),
  },
  {
    label: '2. Journey::Router#serve',
    detail: (
      <>
        <CallStackSvg i={1} />
        <p>
          serve から呼ばれた recognize がパスに合うルートを集め、HTTP のメソッドなどの条件で絞り、優先順位の順に試します。合ったルートのパスから <code>id: "1"</code> を取り出して要求の path_parameters に入れ、serve がそのルートの転送先の serve を呼びます。<Ref n={7} />
        </p>
        <p>詳しく扱う節：<ChapterLink n={9} section="recognize" /></p>
      </>
    ),
  },
  {
    label: '3. Dispatcher#serve',
    detail: (
      <>
        <CallStackSvg i={2} />
        <p>
          Dispatcher は <code>resources</code> や <code>"articles#show"</code> のようにコントローラーとアクションで書いたルートが転送先として持つ部品で、コントローラーのクラスを求めてアクションを呼びます。path_parameters の <code>controller: "articles"</code> から ArticlesController を求め、応答のオブジェクトを作って、<code>ArticlesController.dispatch("show", req, res)</code> を呼びます。<Ref n={6} />
        </p>
        <p>詳しく扱う節：<ChapterLink n={9} section="dispatch" /></p>
      </>
    ),
  },
  {
    label: '4. Metal.dispatch と process',
    detail: (
      <>
        <CallStackSvg i={3} />
        <p>
          Metal.dispatch が要求ごとにコントローラーのインスタンスを new で作り、Metal#dispatch が要求と応答を持たせてから process を呼びます。process はアクション名を確かめてから process_action を呼びます。<Ref n={8} />
        </p>
        <p>詳しく扱う節：<ChapterLink n={10} section="dispatch" /></p>
      </>
    ),
  },
  {
    label: '5. process_action の6段',
    detail: (
      <>
        <CallStackSvg i={4} />
        <p>同じ名前のメソッドを6つのモジュールが重ねて定義し、それぞれ super で次へ進みます。外側から順に次のとおりです。</p>
        <ol>
          <li>ControllerRuntime：SQL の時間の集計を 0 に戻す</li>
          <li>ParamsWrapper：JSON で送られた値を、コントローラー名から決めたキーの下にもまとめる</li>
          <li>Instrumentation：Processing by と Completed のログの元になる通知を出す</li>
          <li>Rescue：rescue_from の処理</li>
          <li>Callbacks：before_action などの実行</li>
          <li>Rendering：要求が求める形式を設定する</li>
        </ol>
        <p>最後に AbstractController::Base の process_action が send_action で show メソッドを呼びます。1回目の SQL（Article Load）はこの show の中の <code>Article.find</code> が送ります。</p>
        <p>詳しく扱う節：<ChapterLink n={10} section="hierarchy" /></p>
      </>
    ),
  },
  {
    label: '6. default_render と描画',
    detail: (
      <>
        <CallStackSvg i={5} />
        <p>
          show は render を呼ばずに終わったので、send_action の後で default_render が render を呼びます。render_to_body から ActionView に入り、レイアウトと articles/show.html.erb を描画して、テンプレートをコンパイルしたメソッド（<code>_app_views_articles_show_html_erb___…</code>）を実行します。テンプレートの2行目の render はコメントの Relation を CollectionRenderer に渡します。CollectionRenderer は render に配列や Relation を渡したときに、要素ごとにパーシャルを描画する ActionView のクラスです。<Ref n={11} />
        </p>
        <p>詳しく扱う節：<ChapterLink n={16} section="flow" />、<ChapterLink n={16} section="compile" /></p>
      </>
    ),
  },
  {
    label: '7. Relation の読み込み',
    detail: (
      <>
        <CallStackSvg i={6} />
        <p>
          CollectionRenderer は要素ごとに使うパーシャルの名前を求めるため、map で要素を1件ずつ取り出します。このとき Relation の each が呼ばれ、records、load、exec_queries、exec_main_query と進みます。Relation はここで初めて SQL を送ります。関連から作った Relation なので、AssociationRelation の exec_queries を経由しています。<Ref n={9} /><Ref n={11} />
        </p>
        <p>詳しく扱う節：<ChapterLink n={12} section="load" /></p>
      </>
    ),
  },
  {
    label: '8. SQL の発行',
    detail: (
      <>
        <CallStackSvg i={7} />
        <p>
          exec_main_query は with_connection でこのスレッドの接続を接続プールから借り、_query_by_sql が select_all を呼びます。select_all はクエリキャッシュに同じ SQL の結果があるかを確かめ、無ければ Arel の構文木を SQL の文字列にしてから、select、raw_execute を経て log に進みます。log は SQL の実行を囲んで sql.active_record を通知します。ログの <code>Comment Load (0.3ms)</code> の行も、trace.rb が記録した呼び出し履歴も、この通知を受けて作られたものです。
        </p>
        <p>詳しく扱う節：<ChapterLink n={15} section="pool" /></p>
      </>
    ),
  },
]

const ch26: Chapter = {
  number: 26,
  part: 5,
  title: '記事表示のリクエストを LB から DB まで追う',
  summary:
    '記事を1件開いたときの要求を、ロードバランサーから Rails、MySQL、ブラウザーへの応答まで追います。各ログに残る要求 ID と時間を照合し、1件の処理を異なる場所から読んでみます。',
  goals: [
    'GET /articles/1 が通る順番と、記事やコメントを読む SQL が送られる場所を説明できる',
    '要求の識別子を使い、前段のアクセスログと Rails のログから対応する記録を探せる',
    '各層の時間が重なっている範囲を読み、次にどのログを調べるかを判断できる',
  ],
  prerequisites: [6, 9, 10, 12, 15, 16, 21, 23, 24, 25],
  sections: [
    {
      id: 'network-entry',
      title: 'ブラウザーが HTTP を送る前に行う処理',
      body: (
        <>
          <ol>
            <li>すでに使える接続がなければ、ブラウザーは URL のホスト名に対応するアドレスを DNS で調べます。回答はキャッシュから得られることもあります（<ChapterLink n={105} />）。</li>
            <li>HTTP/1.1 や HTTP/2 の HTTPS では公開先の TCP ポートへ接続します。ブラウザーは TLS でサーバーの証明書を検証し、通信を暗号化します。HTTP/3 は TCP の代わりに QUIC を使います（<ChapterLink n={104} />、<ChapterLink n={105} />）。</li>
            <li>ロードバランサーが TLS を終端する構成では、ロードバランサーが HTTP を読み、選んだ転送先に別の接続で送ります。転送先まで暗号化する場合は、その区間にも TLS を設定します（<ChapterLink n={25} section="tls" />）。</li>
          </ol>
          <p>Nginx や Rails のログで要求を見つけられるのは、要求がその層まで届いたときです。名前解決や証明書の検証で止まると、Rails のリクエストログは出ません。層をまたぐ順序は <a href="#/map">システム全体図</a> でも確認できます。</p>
        </>
      ),
    },
    {
      id: 'parts',
      title: '要求が通る部品',
      body: (
        <>
          <p>
            記事のページ（/articles/1）をブラウザーで開くと、ブラウザーには HTML が1つ届きます。デモの構成に、curl で同じ要求を送りました（<code>-k</code> は自己署名の証明書の確認を省く指定です。
            <ChapterLink n={25} section="tls" />）。
          </p>
          <Code
            lang="text"
            code={`
$ curl -sk -o /dev/null -w '%{http_code} %{size_download} bytes %{time_total}s\\n' https://127.0.0.1:8443/articles/1
200 2391 bytes 0.131696s
`}
          />
          <p>
            ステータスコード 200 で、2391 バイトの HTML が約 0.13 秒で届きました。ブラウザーから見れば、URL を1つ開いて HTML を受け取っただけです。この間に、次の部品が順に動いています（図 44-1）。
          </p>
          <ol>
            <li>
              ロードバランサー：HTTPS の接続を受けて暗号を解き（TLS の終端）、後ろの複数のサーバーのうち1台に要求を送ります（<ChapterLink n={25} section="load-balancer" />
              ）。
            </li>
            <li>
              Nginx：パスを見て、public にファイルがあればそれを返し、無ければ Puma に転送します（<ChapterLink n={24} section="reverse-proxy" />
              ）。/articles/1 にあたるファイルは無いので、Puma に送られます。
            </li>
            <li>
              Puma：要求を最後まで読み取り、空いているスレッドで Rails のアプリケーションを呼びます（<ChapterLink n={23} section="app-server" />
              ）。
            </li>
            <li>
              ミドルウェア：Rails がすべての要求に同じ順で行う処理の並びです。https で届いたかの確認、要求 ID の付与、ログの書き出し、Cookie の読み書きなどを1つずつ行います（<ChapterLink n={6} />
              ）。
            </li>
            <li>
              ルーティング：GET というメソッドと /articles/1 というパスから、ArticlesController の show アクションを選び、パスから id の 1 を取り出します（<ChapterLink n={9} />
              ）。
            </li>
            <li>
              コントローラー：show アクションのメソッドを実行し、モデルを使って記事を読み、ビューに渡します（<ChapterLink n={10} />
              ）。
            </li>
            <li>
              モデル（ActiveRecord）：<code>Article.find(1)</code> を SELECT の SQL に変えて MySQL に送り、返ってきた行を Article のオブジェクトにします（<ChapterLink n={11} />・
              <ChapterLink n={12} />
              ）。記事のコメントのような関連するデータも、使う時点で SQL を送って読みます（<ChapterLink n={13} />
              ）。
            </li>
            <li>
              MySQL：SQL を実行して、条件に合う行を返します。Rails はスレッドごとに、接続プールから MySQL への接続を借りて使います（<ChapterLink n={15} />
              ）。
            </li>
            <li>
              ビュー：テンプレートに記事の値を埋め込んで HTML を作ります（<ChapterLink n={16} />
              ）。
            </li>
          </ol>
          <p>
            できた HTML はミドルウェアを逆の順に通り、Puma、Nginx、ロードバランサーを経てブラウザーに届きます。途中の部品は応答にヘッダーを付け足します（「応答のヘッダー」の節）。次の節から、この1件の要求を各部品がどう処理し、どんなログと時間を残したかを順に読みます。
          </p>
          <Figure n="44-1" title="要求が通る部品" caption="デモの構成（Rails 8.1.4.1・Puma 8.0.2・Nginx 1.30.6・MySQL 8.4）で記事のページを開いたときに動く部品と、それを扱った章。">
            <PartsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'setup',
      title: '追いかける要求',
      body: (
        <>
          <p>
            この章では、これまでの章で作ったデモの構成に、<code>GET /articles/1</code> を1回だけ送ります。構成は次のとおりです。
          </p>
          <ul>
            <li>ロードバランサー役の Nginx（ALB の代わり、TLS を終端）：<ChapterLink n={25} /></li>
            <li>
              Nginx 1.30.6（try_files・proxy_pass・X-Request-Id）：<ChapterLink n={24} />
            </li>
            <li>
              Puma 8.0.2（本番環境の設定、ワーカー2・スレッド3、assume_ssl と force_ssl を有効）：<ChapterLink n={23} />
            </li>
            <li>Rails 8.1.4.1・MySQL 8.4（ログを debug にして SQL と描画の行も出す）</li>
          </ul>
          <p>
            try_files は並べた候補のファイルを順に探し、どれも無ければ最後に書いた転送先（このデモでは名前付きの location の <code>@app</code>）に処理を移す Nginx の設定です。<Ref n={10} />proxy_pass は受け取った要求を指定したサーバー（このデモでは Puma）に転送する設定です。
          </p>
          <p>
            記事のページは、記事を読み、最新のコメント2件をパーシャルで描画します。デモでは HTML を受け取ったブラウザーがアセットを取得し、更新通知を受け取るために Action Cable に接続します。要求が通る段階を図 44-2 に示します。
          </p>
          <Figure n="44-2" title="リクエスト全体のシーケンス" caption="上から順に、左の矢印と同じ高さにある右の説明を読む。四角はその部品の中で行う処理、破線の矢印は応答を表す。末尾の2行は HTML を受け取ったブラウザーからの別の要求で、途中の中継を省略している。">
            <SequenceFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'front',
      title: 'ロードバランサーから Puma まで',
      body: (
        <>
          <p>実際に送った要求の、ロードバランサー役と Nginx のアクセスログです。</p>
          <Code
            lang="text"
            code={`
（ロードバランサー役）
172.29.0.1 "GET /articles/1 HTTP/1.1" 200 lb_time=0.008 upstream=172.29.0.5:80 upstream_status=200
（Nginx）
172.29.0.6 xff="172.29.0.1" "GET /articles/1 HTTP/1.1" 200 request_id=e18060ac5cdf0a5095a71d12a45ef5be rt=0.007 urt=0.007
`}
          />
          <p>
            このアクセスログの時間の単位は秒です。たとえば後段の <code>rt=0.007</code> は、Nginx が要求を受けて応答を送り終えるまでの 7ms に当たります。<code>urt=0.007</code> は Nginx の変数 <code>$upstream_response_time</code> の値で、そのうち Nginx が Puma から応答を受け取り終えるまでにかかった時間です。
          </p>
          <ol>
            <li>
              ロードバランサーが HTTPS を終端し、X-Forwarded-For にブラウザーの IP を、X-Forwarded-Proto に https を入れて Nginx に送ります。ここで起きうる問題は、ターゲットが1つも登録されていないときの 503、ヘルスチェックの失敗、接続できないときの
              502・504、アイドルタイムアウト（ALB の既定 60 秒）による 504 です（<ChapterLink n={25} section="triage" />
              ）。
            </li>
            <li>
              Nginx は、<code>location /</code> の <code>try_files $uri @app</code> で public/articles/1 が無いことを確かめ、<code>@app</code> から Puma に送ります（
              <ChapterLink n={24} section="location" />
              ）。try_files は並べた候補のファイルを順に探し、どれも無ければ最後の引数（ここでは Puma に転送する location の名前 <code>@app</code>）に処理を移す設定です。Host・X-Forwarded-For・X-Forwarded-Proto・X-Request-Id をここで付けます。本文が client_max_body_size（Nginx が受け付ける要求の本文の上限）を超えれば、ここで 413 になり Rails には届きません。
            </li>
            <li>
              Puma のワーカーが要求を読み、処理用のスレッドで Rails を呼びます（<ChapterLink n={23} section="cluster" />
              ）。スレッドがすべてふさがっていれば、ここで待たされます。待ち時間は Rails のログには出ないので、Puma の /stats の backlog か、X-Request-Start との差で確かめます。backlog は、ワーカーが受け取ったものの、まだどのスレッドにも渡していない要求の数です。X-Request-Start は、前段の Nginx が時刻を入れて Puma に送るヘッダーで、アプリが要求を受け取った時刻との差から、スレッドを待った時間を見積もれます（設定は「時間の内訳を読む」の節）。
            </li>
          </ol>
          <p>次の Rails のログには、これと同じ要求について、アクションの実行にかかった時間が出ます。</p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'ミドルウェアからビューまで',
      body: (
        <>
          <p>本番環境のミドルウェアの順は次のとおりです（<code>bin/rails middleware</code>、末尾のルーティングは省略）。</p>
          <Code
            lang="text"
            code={`
use ActionDispatch::AssumeSSL                 ← 第41章：https とみなす
use ActionDispatch::SSL                       ← 第33・41章：HSTS、secure な Cookie
use Rack::Sendfile
use ActionDispatch::Static                    ← 第27章：public のファイル（Nginx があれば通常は届かない）
use ActionDispatch::Executor                  ← 第14・39章：クエリキャッシュ、CurrentAttributes の後始末
use Rack::Runtime                             ← X-Runtime
use Rack::MethodOverride
use ActionDispatch::RequestId                 ← 第41章：X-Request-Id
use ActionDispatch::RemoteIp                  ← 第41章：request.remote_ip
use Rails::Rack::SilenceRequest               ← 第41章：/up のログを出さない
use Rails::Rack::Logger                       ← ここで "Started GET" を書く
use ActionDispatch::ShowExceptions            ← 第16章：例外を 404・500 などに
use ActionDispatch::DebugExceptions
use ActionDispatch::Callbacks
use ActionDispatch::Cookies                   ← 第16章
use ActionDispatch::Session::CookieStore      ← 第16・33章
use ActionDispatch::Flash
use ActionDispatch::ContentSecurityPolicy::Middleware
use Rack::Head
use Rack::ConditionalGet                      ← 第34章
use Rack::ETag                                ← 第34章
use Rack::TempfileReaper
`}
          />
          <p>
            本番環境では config.hosts が空なので HostAuthorization は無く、Server-Timing も入っていません（<ChapterLink n={6} section="rails-stack" />
            ）。Logger より前のミドルウェアが返した応答（SSL のリダイレクトなど）は、Rails のログに出ません。同じ要求の Rails のログを、X-Request-Id で抜き出しました。
          </p>
          <Code
            lang="text"
            code={`
[e18060ac5cdf0a5095a71d12a45ef5be] Started GET "/articles/1" for 172.29.0.1 at 2026-11-11 11:10:02 +0000
[e18060ac5cdf0a5095a71d12a45ef5be] Processing by ArticlesController#show as */*
[e18060ac5cdf0a5095a71d12a45ef5be]   Parameters: {"id" => "1"}
[e18060ac5cdf0a5095a71d12a45ef5be]   Article Load (0.4ms)  SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`id\` = 1 LIMIT 1
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendering layout layouts/application.html.erb
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendering articles/show.html.erb within layouts/application
[e18060ac5cdf0a5095a71d12a45ef5be]   Comment Load (0.3ms)  SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1 ORDER BY \`comments\`.\`id\` DESC LIMIT 2
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendered collection of comments/_comment.html.erb [2 times] (Duration: 0.1ms | GC: 0.0ms)
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendered articles/show.html.erb within layouts/application (Duration: 1.9ms | GC: 0.0ms)
[e18060ac5cdf0a5095a71d12a45ef5be]   Rendered layout layouts/application.html.erb (Duration: 2.8ms | GC: 0.3ms)
[e18060ac5cdf0a5095a71d12a45ef5be] Completed 200 OK in 5ms (Views: 2.9ms | ActiveRecord: 0.6ms (2 queries, 0 cached) | GC: 0.3ms)
`}
          />
          <p>
            Started の行の <code>for 172.29.0.1</code> は RemoteIp が求めたクライアントの IP で、Nginx やロードバランサーの IP ではありません（<ChapterLink n={25} section="client-ip" />
            ）。行の先頭の ID は、Nginx が作った <code>$request_id</code> と同じです。
          </p>
          <ol start={4}>
            <li>
              ルーティング：<code>recognize_path("/articles/1")</code> の結果は <code>&#123;controller: "articles", action: "show", id: "1"&#125;</code> でした。Journey は要求のパスを routes.rb から作ったルートと照合する、Rails のルーティングの内部の部品（ActionDispatch::Journey）です。Journey が resources
              のルートから選び、ArticlesController の <code>show</code> を呼びます（<ChapterLink n={9} section="recognize" />
              ）。合うルートが無ければ 404 です。
            </li>
            <li>
              コントローラー：<code>Processing by</code> の行から、before_action（このデモでは request.variant の設定）、アクション、暗黙の render の順に進みます（
              <ChapterLink n={10} section="dispatch" />
              ）。<code>as */*</code> は、curl の Accept が <code>*/*</code> だったことを表します。
            </li>
            <li>
              ActiveRecord：<code>Article.find(1)</code> が SQL を送ります（<ChapterLink n={12} />
              ）。接続は、このスレッドが接続プールから借りたものです（<ChapterLink n={15} section="pool" />
              ）。接続が足りなければここで ConnectionTimeoutError、ロックの待ちがあればここで時間がかかります。
            </li>
            <li>
              ビュー：レイアウトとテンプレートを描画する途中で、<code>@article.comments</code> の SQL が送られています（<ChapterLink n={16} section="flow" />
              ）。コメントを表示件数ぶん別々に読む書き方なら、ここで N+1 になります（<ChapterLink n={13} section="n-plus-one" />
              ）。
            </li>
          </ol>
        </>
      ),
    },
    {
      id: 'call-order',
      title: 'Rails の中でメソッドが呼ばれる順',
      body: (
        <>
          <p>
            前の節のログに出るのは、各段が処理した結果です。ルーティングから SQL を送るまでに、Rails のどのメソッドがどの順に呼ばれたかは、ログからは分かりません。そこで、Rails 8.1.4.1 の1ファイルのアプリ（本番環境の設定、DB は SQLite）に <code>GET /articles/1</code> を1回処理させ、SQL を送った時点の呼び出し履歴を記録しました。呼び出し履歴は実行中のメソッドから、それを呼んだメソッドへ順にさかのぼった一覧で、Ruby の <code>caller_locations</code> で取り出せます。
          </p>
          <Code
            lang="ruby"
            title="trace.rb（抜粋）"
            code={`
class ArticlesController < ActionController::Base
  def show
    @article = Article.find(params[:id])
  end
end
# app/views/articles/show.html.erb の2行目
#   <%= render @article.comments.order(id: :desc).limit(2) %>

traces = []
ActiveSupport::Notifications.subscribe("sql.active_record") do |*, payload|
  traces << [payload[:name], payload[:sql], caller_locations]
end
env = Rack::MockRequest.env_for("http://example.com/articles/1")
status, _headers, body = Rails.application.call(env)
`}
          />
          <p>
            <code>sql.active_record</code> は、Active Record が SQL を1つ実行するたびに出す通知です。通知を受け取ったブロックの中で <code>caller_locations</code> を呼ぶと、その SQL を送るまでに通ったメソッドが分かります。Nginx と Puma は使わず、Puma と同じように <code>Rails.application.call(env)</code> を直接呼びました。応答は 200 で、SQL は2回送られました。
          </p>
          <p>
            次は2回目の SQL（Comment Load）を送った時点の呼び出し履歴から抜き出したものです。先に呼ばれた外側のメソッドが上に来るように並べ替え、gem のディレクトリの前半とバージョンの番号を省きました。ミドルウェアと ActiveSupport の行など、説明に使わない行は「…」にしています。
          </p>
          <Code
            lang="text"
            code={`
railties/lib/rails/engine.rb:534:in 'Rails::Engine#call'
  …（ミドルウェアの call が順に続く）
actionpack/lib/action_dispatch/routing/route_set.rb:906:in 'ActionDispatch::Routing::RouteSet#call'
actionpack/lib/action_dispatch/journey/router.rb:31:in 'ActionDispatch::Journey::Router#serve'
actionpack/lib/action_dispatch/journey/router.rb:86:in 'block in ActionDispatch::Journey::Router#recognize'
actionpack/lib/action_dispatch/journey/router.rb:35:in 'block in ActionDispatch::Journey::Router#serve'
actionpack/lib/action_dispatch/routing/route_set.rb:50:in 'ActionDispatch::Routing::RouteSet::Dispatcher#serve'
actionpack/lib/action_controller/metal.rb:335:in 'ActionController::Metal.dispatch'
actionpack/lib/action_controller/metal.rb:252:in 'ActionController::Metal#dispatch'
actionpack/lib/abstract_controller/base.rb:154:in 'AbstractController::Base#process'
activerecord/lib/active_record/railties/controller_runtime.rb:39:in 'ActiveRecord::Railties::ControllerRuntime#process_action'
actionpack/lib/action_controller/metal/params_wrapper.rb:259:in 'ActionController::ParamsWrapper#process_action'
actionpack/lib/action_controller/metal/instrumentation.rb:75:in 'ActionController::Instrumentation#process_action'
actionpack/lib/action_controller/metal/rescue.rb:36:in 'ActionController::Rescue#process_action'
actionpack/lib/abstract_controller/callbacks.rb:266:in 'AbstractController::Callbacks#process_action'
actionpack/lib/action_controller/metal/rendering.rb:199:in 'ActionController::Rendering#process_action'
actionpack/lib/abstract_controller/base.rb:221:in 'AbstractController::Base#process_action'
actionpack/lib/action_controller/metal/basic_implicit_render.rb:9:in 'ActionController::BasicImplicitRender#send_action'
actionpack/lib/action_controller/metal/implicit_render.rb:39:in 'ActionController::ImplicitRender#default_render'
  …
actionview/lib/action_view/rendering.rb:122:in 'ActionView::Rendering#render_to_body'
  …
actionview/lib/action_view/template.rb:272:in 'ActionView::Template#render'
  …
app/views/articles/show.html.erb:2:in '_app_views_articles_show_html_erb___224123452457880863_2976'
actionview/lib/action_view/helpers/rendering_helper.rb:152:in 'ActionView::Helpers::RenderingHelper#render'
  …
actionview/lib/action_view/renderer/collection_renderer.rb:131:in 'ActionView::CollectionRenderer#render_collection_derive_partial'
activerecord/lib/active_record/relation/delegation.rb:100:in 'ActiveRecord::Delegation#each'
activerecord/lib/active_record/relation.rb:353:in 'ActiveRecord::Relation#records'
activerecord/lib/active_record/relation.rb:1209:in 'ActiveRecord::Relation#load'
activerecord/lib/active_record/association_relation.rb:44:in 'ActiveRecord::AssociationRelation#exec_queries'
activerecord/lib/active_record/relation.rb:1436:in 'ActiveRecord::Relation#exec_queries'
activerecord/lib/active_record/relation.rb:1464:in 'ActiveRecord::Relation#exec_main_query'
  …
activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb:459:in 'ActiveRecord::ConnectionAdapters::ConnectionPool#with_connection'
  …
activerecord/lib/active_record/querying.rb:80:in 'ActiveRecord::Querying#_query_by_sql'
activerecord/lib/active_record/connection_adapters/abstract/query_cache.rb:275:in 'ActiveRecord::ConnectionAdapters::QueryCache#select_all'
  …
activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb:76:in 'ActiveRecord::ConnectionAdapters::DatabaseStatements#select_all'
  …
activerecord/lib/active_record/connection_adapters/abstract_adapter.rb:1218:in 'ActiveRecord::ConnectionAdapters::AbstractAdapter#log'
`}
          />
          <p>
            この呼び出し履歴を8つの段にまとめ、図 44-3 で1段ずつ進められるようにしました。各段は前の段の中から呼ばれるので、段を進めても前の段は呼び出し履歴に残ったままです。各段の説明の下に、その段を詳しく扱う節を示します。
          </p>
          <Figure
            n="44-3"
            title="SQL を送るまでの呼び出しの順（段階送り）"
            caption="2回目の SQL（Comment Load）を送った時点の呼び出し履歴を、8つの段にまとめた概念モデルです。右の行番号は Rails 8.1.4.1 で記録した呼び出し履歴でその段が始まる行です。実際の呼び出し履歴には、ミドルウェアや ActiveSupport の行、ブロックの行など、この図で省いた行がほかにもあります。"
          >
            <Stepper steps={callSteps} />
          </Figure>
          <p>1回目の SQL（Article Load）の呼び出し履歴は、send_action の下から次のように分かれます。</p>
          <Code
            lang="text"
            code={`
actionpack/lib/action_controller/metal/basic_implicit_render.rb:8:in 'ActionController::BasicImplicitRender#send_action'
trace.rb:26:in 'ArticlesController#show'
activerecord/lib/active_record/core.rb:278:in 'ActiveRecord::Core::ClassMethods#find'
activerecord/lib/active_record/core.rb:443:in 'ActiveRecord::Core::ClassMethods#cached_find_by'
  …
activerecord/lib/active_record/statement_cache.rb:156:in 'ActiveRecord::StatementCache#execute'
activerecord/lib/active_record/querying.rb:64:in 'ActiveRecord::Querying#find_by_sql'
  …
activerecord/lib/active_record/querying.rb:80:in 'ActiveRecord::Querying#_query_by_sql'
activerecord/lib/active_record/connection_adapters/abstract/query_cache.rb:275:in 'ActiveRecord::ConnectionAdapters::QueryCache#select_all'
  …（ここから下は Comment Load と同じ）
`}
          />
          <p>
            StatementCache は <code>find</code> のように形の決まった問い合わせについて、Arel の構文木を初回に作って保存しておき、次からは id などの値だけを差し替えて使う仕組みです。<Ref n={12} />主キー1つの <code>find</code> はこの作り置きの文を使うので、Relation の load と exec_queries を通りません（<ChapterLink n={12} section="finders" />
            ）。どちらの SQL も、最後は同じ select_all に届きます。
          </p>
          <p>
            Rails のログの Completed に出る時間（デモでは 5ms）は、Instrumentation の process_action が囲んだ範囲です。抜粋でそれより上にあるミドルウェア、RouteSet#call、Journey の処理の時間は、Nginx の urt（Nginx が Puma に接続してから応答を受け取り終えるまでの時間）には入りますが、Completed には入りません（「時間の内訳を読む」の節）。
          </p>
        </>
      ),
    },
    {
      id: 'response',
      title: '応答のヘッダー',
      body: (
        <>
          <p>ブラウザーが受け取った応答のヘッダーです。どのヘッダーをどの段が付けたかを右に書きました。</p>
          <Code
            lang="text"
            code={`
HTTP/1.1 200 OK
Server: nginx/1.30.6                                      ← Nginx（ロードバランサー役）
x-frame-options: SAMEORIGIN                               ← Rails の既定のヘッダー
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
link: </assets/application-8b441ae0.css>; rel=preload; as=style; nopush   ← stylesheet_link_tag（第27章）
vary: Accept, X-Requested-With
etag: W/"5c28e0b585c11476428a4cf5abcb8da1"                ← Rack::ETag（第34章）
cache-control: max-age=0, private, must-revalidate
set-cookie: _demo_session=…; path=/; secure; httponly; samesite=lax   ← CookieStore と SSL の secure（第16・33章）
x-request-id: e18060ac5cdf0a5095a71d12a45ef5be           ← RequestId（Nginx の $request_id を引き継いだ）
x-runtime: 0.005802                                       ← Rack::Runtime
strict-transport-security: max-age=63072000; includeSubDomains   ← ActionDispatch::SSL（既定 2 年）
X-Served-By: app-nginx                                    ← デモの Nginx の add_header
X-Served-By: lb                                           ← デモのロードバランサー役の add_header
`}
          />
          <p>
            応答の本文は Puma のスレッドが Nginx に書き込み、Nginx がバッファーしてからロードバランサーに送ります（<ChapterLink n={24} section="buffering" />
            ）。ブラウザーはその後、HTML の中の <code>/assets/…</code> を要求しますが、これは Nginx が public/assets から直接返し、Rails には届きません（
            <ChapterLink n={24} section="static" />
            ）。更新通知を購読するページでは、ブラウザーは別の要求で <code>/cable</code> に接続します。Action Cable が WebSocket の接続を管理します（<ChapterLink n={19} section="cable-and-text" />）。
          </p>
        </>
      ),
    },
    {
      id: 'write-flow',
      title: 'コメントの POST とバックグラウンドジョブ',
      body: (
        <>
          <p>フォームからコメントを保存する <code>POST /articles/1/comments</code> も、Nginx、Puma、Rack、ルーティングを通ります。コントローラーは CSRF トークンを検証し、利用者が投稿できるかを確認してから、受け取る属性を Strong Parameters で限定します（<ChapterLink n={10} section="params" />、<ChapterLink n={21} section="csrf" />）。</p>
          <ol>
            <li>コントローラーが関連を通じてコメントを保存します。Active Record は接続を借り、MySQL に INSERT を送り、トランザクションを確定します。入力が不正なら 422 の応答にエラー付きのフォームを返します。</li>
            <li>コミット済みのコメントをメールで通知するなら、確定後にジョブを登録します。キューに登録したことと、メールが届いたことは別の状態です。通知の登録を失えない場合は、送信待ちの記録をコメントと同じトランザクションで保存する方法を検討します（<ChapterLink n={53} />）。</li>
            <li>保存に成功した応答で 303 を返す設計なら、ブラウザーは Location に示した記事の URL に GET を送ります。ジョブは別のワーカーがキューから取り出します（<ChapterLink n={18} />）。</li>
          </ol>
          <p>2件の投稿が同時に来ると、Puma でスレッドを待つ場合と、Rails に入った後で DB 接続を待つ場合があります。接続を借りても、同じ行の更新なら MySQL のロックを待つことがあります。どの資源の待ち時間かを区別すると、スレッド数を増やすべきか、更新する範囲を狭めるべきか判断できます（<ChapterLink n={113} />）。</p>
        </>
      ),
    },
    {
      id: 'timing',
      title: '時間の内訳を読む',
      body: (
        <>
          <p>
            各層のログに残る時間は、それぞれ次の範囲を表しています（Nginx の変数の意味は説明書による<Ref n={4} />）。デモの値を並べました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ログの値</th>
                  <th>範囲</th>
                  <th>デモ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>デモのロードバランサー役（Nginx）の lb_time</td>
                  <td>ロードバランサーが要求を受けてから、応答を送り終えるまで</td>
                  <td>8ms</td>
                </tr>
                <tr>
                  <td>
                    Nginx の <code>$request_time</code>（rt）
                  </td>
                  <td>Nginx が要求を読み始めてから、応答を送り終えるまで</td>
                  <td>7ms</td>
                </tr>
                <tr>
                  <td>
                    Nginx の <code>$upstream_response_time</code>（urt）
                  </td>
                  <td>Puma に接続してから、Puma の応答を受け取り終えるまで</td>
                  <td>7ms</td>
                </tr>
                <tr>
                  <td>Rails の Completed</td>
                  <td>process_action の処理時間（コールバック・アクション・描画）</td>
                  <td>5ms</td>
                </tr>
                <tr>
                  <td>Views・ActiveRecord</td>
                  <td>描画（描画中の SQL を除く）と SQL の時間。重ならない（<ChapterLink n={22} />）</td>
                  <td>2.9ms・0.6ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            この記録では urt が 7ms、Completed が 5ms です。約2ms の差には、Puma がスレッドの空きを待つ時間のほか、ミドルウェア、ルーティング、応答を書き戻す時間も含まれます。待ち時間を調べたい場合は Puma の <code>backlog</code> と突き合わせます。
          </p>
          <p>
            次の図は、表の値を棒の長さにして、図 34-1 と同じように上下に並べたものです。上の行ほど外側の部品が測った時間で、下の行の範囲を含みます。
          </p>
          <Figure
            title="各ログの時間が測る範囲"
            caption="デモで GET /articles/1 を1回送ったときの値をもとにした模式図。棒の長さは値に合わせ、左端の位置と内訳の並び順は模式的なもの。紫の破線の箱は urt に含まれ、Completed に含まれない区間。AR は ActiveRecord（SQL の時間）、残りは Completed から Views と ActiveRecord を引いた時間。"
          >
            <TimeRangesFigure />
          </Figure>
          <p>
            Puma の説明書では、Nginx に <code>proxy_set_header X-Request-Start "$&#123;msec&#125;";</code> を設定し、転送時の時刻を記録する方法も紹介しています。Rack のミドルウェアで現在時刻との差を取ると、転送から Rails が要求を受け取るまでに経過した時間が分かります。<Ref n={3} />
          </p>
          <p>
            rt に比べて urt が短い場合は、Nginx が要求を受け取る区間やクライアントへ本文を返す区間も調べます。表の <code>lb_time</code> はデモで Nginx が付けた名前です。AWS の ALB のアクセスログでは3つの処理時間を記録し、最後の <code>response_processing_time</code> はクライアントに応答を送り始めた時点までを測ります。本文を送り終える時点まで測るデモの 8ms とは、終点が違います。<Ref n={5} />
          </p>
          <p>
            同じ記事でも、起動直後の要求には<ChapterLink n={16} section="compile">テンプレートのコンパイル</ChapterLink>や<ChapterLink n={11} section="schema">列の情報の読み込み</ChapterLink>が含まれることがあります。ふだんの応答時間を比べるときは、起動直後の値と、同じ要求を繰り返した値を分けて記録します。
          </p>
        </>
      ),
    },
    {
      id: 'map',
      title: 'リクエスト追跡のまとめ',
      body: (
        <>
          <p>ここまでの段階で起きうる主な問題と、確かめるログ・参照する章をまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>段階</th>
                  <th>起きうる問題</th>
                  <th>見るもの</th>
                  <th>章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ALB</td>
                  <td>503（ターゲットが登録されていない）、502・504、ヘルスチェックの失敗</td>
                  <td>ALB のアクセスログ、ターゲットグループの状態</td>
                  <td><ChapterLink n={25} /></td>
                </tr>
                <tr>
                  <td>Nginx</td>
                  <td>413、location の誤り、ヘッダーの継承漏れ、502・504、499</td>
                  <td>access.log・error.log</td>
                  <td><ChapterLink n={24} /></td>
                </tr>
                <tr>
                  <td>Puma</td>
                  <td>スレッドの空き待ち、ワーカーの停止、メモリー不足</td>
                  <td>/stats の backlog、標準出力</td>
                  <td><ChapterLink n={23} /></td>
                </tr>
                <tr>
                  <td>ミドルウェア</td>
                  <td>SSL のリダイレクトの繰り返し、Host の拒否</td>
                  <td>応答のヘッダー（Rails のログに出ない場合がある）</td>
                  <td><ChapterLink n={6} />・<ChapterLink n={21} />・<ChapterLink n={25} /></td>
                </tr>
                <tr>
                  <td>ルーティング・コントローラー</td>
                  <td>404、406、CSRF の検証による 422、例外の 500</td>
                  <td>Started・Processing・Completed の行、例外のバックトレース</td>
                  <td><ChapterLink n={9} />・<ChapterLink n={10} />・<ChapterLink n={21} /></td>
                </tr>
                <tr>
                  <td>ActiveRecord</td>
                  <td>N+1、遅い SQL、接続プールの枯渇、ロックの待ち・デッドロック</td>
                  <td>SQL の行・回数、EXPLAIN、MySQL のスロークエリログ</td>
                  <td><ChapterLink n={12} />・<ChapterLink n={13} />・<ChapterLink n={15} /></td>
                </tr>
                <tr>
                  <td>ビュー</td>
                  <td>ビューの中の N+1、描画の遅さ、エスケープ漏れ</td>
                  <td>Rendered の行、Server-Timing（開発環境）</td>
                  <td><ChapterLink n={16} />・<ChapterLink n={21} />・<ChapterLink n={22} /></td>
                </tr>
                <tr>
                  <td>非同期の処理</td>
                  <td>COMMIT 前のジョブの実行、再試行の重複</td>
                  <td>Sidekiq のログ、retry・dead</td>
                  <td><ChapterLink n={18} /></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモでは、Nginx の <code>request_id=e18060ac…</code> と Rails の行頭の ID が同じです。これは Nginx がヘッダーで渡した値を Rails が採用したためです。<Ref n={1} /> 図 44-4 のログを照合するときも、まず同じ要求の行を探し、それぞれが測った区間を比べます。
          </p>
          <p>
            AWS の ALB までさかのぼるには、Nginx 側にも ALB の <code>X-Amzn-Trace-Id</code> を記録して、ALB の追跡 ID と Rails 側の要求 ID を対応付けます（<ChapterLink n={25} section="request-id">要求 ID でログを突き合わせる</ChapterLink>）。
          </p>
          <Figure n="44-4" title="段階とログの対応" caption="各段で見るログと、デモで GET /articles/1 を1回送ったときの値。">
            <LogsFigure />
          </Figure>
          <p>
            ここまでで、記事を表示する1件のリクエストがどの層を通り、どこで時間を使ったかを追えました。この経路に書き込みの規則を加える例は、<ChapterLink n={31} section="publication-case">記事の承認と公開</ChapterLink>で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>GET /articles/1 は、ALB（TLS の終端）→ Nginx（try_files・proxy_pass）→ Puma のスレッド→ ミドルウェア → ルーティング → コントローラー → ActiveRecord → ビューの順に処理され、同じ経路を戻ります。</li>
          <li>Logger より前のミドルウェアと、Nginx・ALB が返した応答は、Rails のログに出ません。Rails のログに無いときは、前段のログを見ます。</li>
          <li>Rails のログでは描画と SQL の時間を確認できます。Nginx の rt と urt を合わせて見ると、Rails のログに含まれない区間も調べられます。</li>
          <li>X-Request-Id を Nginx で作って渡すと、Nginx と Rails のログを1つの要求で並べられます。</li>
          <li>応答のヘッダーには、ETag・Cookie・HSTS・X-Request-Id・X-Runtime など、各段が付けた値が並びます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'actionpack/lib/action_dispatch/middleware/request_id.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '受け取った X-Request-Id を要求の ID として使い、応答にも付けること。' },
    { title: 'railties/lib/rails/application/default_middleware_stack.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/default_middleware_stack.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '本番環境のミドルウェアの順と、設定によって入るミドルウェア（AssumeSSL・SSL・HostAuthorization・SilenceRequest）。' },
    { title: 'Puma: docs/deployment.md（Measuring utilization and queue time）', publisher: 'puma/puma（GitHub）', url: 'https://github.com/puma/puma/blob/v8.0.2/docs/deployment.md', accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'X-Request-Start を前段で付け、スレッドを待った時間を計る方法。' },
    { title: 'Module ngx_http_log_module・ngx_http_upstream_module（Embedded Variables）', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_upstream_module.html#var_upstream_response_time', accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: '$request_time（最初のバイトを読んでから最後のバイトを送ってログを書くまで）と $upstream_response_time（upstream の応答の受信にかかった時間）。' },
    { title: 'Access logs for your Application Load Balancer（処理時間の各フィールド）', publisher: 'AWS Documentation', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-access-logs.html', accessed: '2026-11-22', note: 'ALB が測る3つの区間と、クライアントへの送信開始時点。' },
    { title: 'actionpack/lib/action_dispatch/routing/route_set.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/routing/route_set.rb#L903-L907`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'RouteSet#call（903〜907行目）と Dispatcher#serve（46〜57行目）。' },
    { title: 'actionpack/lib/action_dispatch/journey/router.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/journey/router.rb#L30-L41`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'Journey::Router#serve と recognize。合ったルートの path_parameters を要求に入れ、route.app.serve を呼ぶ。' },
    { title: 'actionpack/lib/action_controller/metal.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal.rb#L331-L337`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'Metal.dispatch がインスタンスを作り、Metal#dispatch（249〜255行目）が process を呼ぶ。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L1431-L1485`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'load・exec_queries・exec_main_query。with_connection の中で _query_by_sql を呼ぶ。' },
    { title: 'Module ngx_http_core_module（try_files）', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files', accessed: '2026-11-27', version: 'nginx 1.30（説明書は最新の版）', note: '候補を順に調べ、どれも無ければ最後の引数の URI か名前付きの location に内部で転送する。' },
    { title: 'actionview/lib/action_view/renderer/collection_renderer.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionview/lib/action_view/renderer/collection_renderer.rb#L130-L132`, accessed: '2026-11-28', version: 'Rails 8.1.4.1', note: 'CollectionRenderer が要素ごとのパーシャルの名前を map で求める（131 行目）。呼び出し履歴の Enumerable#map と Relation の each はここから始まる。' },
    { title: 'activerecord/lib/active_record/statement_cache.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/statement_cache.rb#L4-L30`, accessed: '2026-11-28', version: 'Rails 8.1.4.1', note: '「Statement cache is used to cache a single statement in order to avoid creating the AST again」。値は bind で後から渡す。' },
  ],
}

export default withExplanations(ch26, explanation26)
