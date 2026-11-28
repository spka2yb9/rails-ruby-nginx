import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const figure = (n: number) => `${chapterNumber(113)}-${n}`

/* ---------- 図1 測る値と決める設定 ---------- */
function SettingsFigure() {
  const rows: [string[], string[], string[]][] = [
    [['CPU コア数'], ['ワーカー数', '（コア数を目安に）'], ['2 vCPU → 2ワーカー']],
    [['I/O 待ちの割合'], ['ワーカーあたりの', 'スレッド数'], ['82% → 5〜6スレッド']],
    [['1ワーカーのメモリー'], ['1台に置ける', 'ワーカー数の上限'], ['RSS 約 140 MB']],
    [['DB の接続の上限'], ['プールの上限 ×', 'ワーカー数 × 台数'], ['max_connections 151']],
  ]
  return (
    <Svg id={figure(1)} w={780} h={300} label="左の列は測る値で、CPU コア数、I/O 待ちの割合、1ワーカーのメモリー、DB の接続の上限。中央の列はそれぞれから決める設定で、ワーカー数、スレッド数、1台に置けるワーカー数の上限、プールの上限とワーカー数と台数の積。右の列はこの章の実測での値。">
      <T x={20} y={20} bold fs={12}>測る値</T>
      <T x={290} y={20} bold fs={12}>決める設定</T>
      <T x={560} y={20} bold fs={12}>この章の例</T>
      {rows.map(([m, s, e], i) => {
        const y = 34 + i * 66
        return (
          <g key={m[0]}>
            <Box x={20} y={y} w={210} h={50} lines={m} fs={12} fill="box4" />
            <Arrow x1={230} y1={y + 25} x2={288} y2={y + 25} />
            <Box x={290} y={y} w={210} h={50} lines={s} fs={12} fill="box" />
            <Arrow x1={500} y1={y + 25} x2={558} y2={y + 25} dashed />
            <Box x={560} y={y} w={200} h={50} lines={e} fs={12} fill="bg" mono={i === 3} />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図2 I/O 待ちの割合とスレッド数 ---------- */
function IoRatioFigure() {
  const px = (f: number) => 420 + f * 340
  const py = (n: number) => 230 - (Math.min(n, 10) / 10) * 190
  const curve = Array.from({ length: 91 }, (_, i) => i / 100).map((f, i) => `${i ? 'L' : 'M'}${px(f)},${py(1 / (1 - f))}`).join(' ')
  const k = 340 / 40.1
  return (
    <Svg id={figure(2)} w={780} h={270} label="左は /articles の1件あたりの時間の内訳で、経過 40.1 ms のうち CPU が 7.3 ms、それ以外が 32.8 ms（82%）。右は I/O 待ちの割合 f に対して、1つのプロセスの CPU を使い切るのに必要なスレッド数の目安 1 ÷ (1 − f) の曲線。f が 0.82 のとき約 5.6。">
      <T x={20} y={24} bold fs={12}>/articles の1件（実測）</T>
      <rect x={20} y={50} width={7.3 * k} height={34} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <rect x={20 + 7.3 * k} y={50} width={32.8 * k} height={34} fill="var(--fig-box4)" stroke="var(--fig-line)" strokeDasharray="4 3" />
      <T x={20} y={100} fs={11}>CPU 7.3 ms</T>
      <T x={20 + 7.3 * k + 8} y={67} fs={11}>DB の応答などを待つ 32.8 ms（82%）</T>
      <T x={20} y={132} fs={11} tone="muted">1つのプロセスで CPU を使い続けるには、</T>
      <T x={20} y={150} fs={11} tone="muted">1本が待っている間にほかのスレッドが</T>
      <T x={20} y={168} fs={11} tone="muted">Ruby を実行できればよい。</T>
      <T x={20} y={196} fs={11} tone="acc">40.1 ÷ 7.3 ≒ 5.5 本</T>
      <line x1={420} y1={230} x2={760} y2={230} stroke="var(--fig-line)" />
      <line x1={420} y1={230} x2={420} y2={36} stroke="var(--fig-line)" />
      {[0, 0.5, 0.9].map((f) => <T key={f} x={px(f)} y={244} fs={10} anchor="middle" tone="muted">{f.toFixed(1)}</T>)}
      {[1, 5, 10].map((n) => <T key={n} x={414} y={py(n)} fs={10} anchor="end" tone="muted">{`${n}`}</T>)}
      <path d={curve} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <circle cx={px(0.82)} cy={py(1 / 0.18)} r={5} fill="var(--fig-accent)" />
      <T x={px(0.82) - 10} y={py(1 / 0.18) - 4} fs={11} anchor="end" tone="acc">f ≒ 0.82 → 約 5.5 本</T>
      <T x={430} y={30} fs={11} tone="muted">スレッド数の目安 1 ÷ (1 − f)</T>
      <T x={760} y={262} fs={11} anchor="end" tone="muted">I/O 待ちの割合 f</T>
    </Svg>
  )
}

/* ---------- 図3 MySQL に向かう接続の見積もり ---------- */
function ConnectionBudgetFigure() {
  const k = 560 / 151
  const x0 = 180
  const segs: [string, number, 'box' | 'box2' | 'box4' | 'box5' | 'bg', boolean][] = [
    ['Web 18', 18, 'box', false],
    ['ジョブ 8', 8, 'box4', false],
    ['入れ替え 6', 6, 'box5', true],
    ['運用 5', 5, 'bg', true],
  ]
  let x = x0
  return (
    <Svg id={figure(3)} w={780} h={220} label="計算例の横棒。Web 3台 × 2ワーカー × 3 で 18、ジョブ 2プロセス × 4 で 8、デプロイで Web が1台増える間の 6、コンソールや監視などの運用に 5 を見込むと合計 37。MySQL の max_connections 151 に対する割合を示す。下の横棒は実測で、Web の2ワーカー × 3 で 6、ジョブのプロセスで 5、合わせて 11。">
      <T x={20} y={48} fs={12}>計算例</T>
      {segs.map(([label, n, fill, dashed]) => {
        const w = n * k
        const el = <rect key={label} x={x} y={30} width={w} height={36} fill={`var(--fig-${fill})`} stroke="var(--fig-line)" strokeDasharray={dashed ? '4 3' : undefined} />
        x += w
        return el
      })}
      <T x={x + 8} y={48} fs={11}>{`${segs.map(([label]) => label).join(' ＋ ')} ＝ 37`}</T>
      <T x={x0} y={84} fs={11} tone="muted">破線は平時には使わないが、上限として見込む分です。</T>
      <T x={20} y={138} fs={12}>実測</T>
      <rect x={x0} y={120} width={6 * k} height={36} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <rect x={x0 + 6 * k} y={120} width={5 * k} height={36} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={x0 + 11 * k + 8} y={138} fs={11}>Web 6（2ワーカー × 3）＋ ジョブ 5 ＝ 11</T>
      <line x1={x0 + 151 * k} y1={20} x2={x0 + 151 * k} y2={170} stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="6 4" />
      <T x={x0 + 151 * k} y={188} fs={11} anchor="end" tone="acc">MySQL の max_connections（既定 151）</T>
      <T x={x0} y={208} fs={11} tone="muted">同じ MySQL を使うほかのアプリケーションの接続も、この 151 の中に入ります。</T>
    </Svg>
  )
}

/* ---------- 図4 メモリーと CPU で決まるワーカー数 ---------- */
function MemoryBudgetFigure() {
  const k = 560 / 4096
  const x0 = 180
  const rows = [
    { label: ['この章のアプリ', '1ワーカー 140 MB'], worker: 140, master: 82 },
    { label: ['大きいアプリの例', '1ワーカー 600 MB'], worker: 600, master: 300 },
  ]
  return (
    <Svg id={figure(4)} w={780} h={250} label="4 GiB の実行環境で、OS などに 1 GiB を残した残りに何ワーカー置けるかを比べた図。この章のアプリは1ワーカー 140 MB に3割の余裕を見て、メモリーの上では16ワーカー置けるが、2 vCPU なので CPU の目安は2〜3ワーカー。1ワーカー 600 MB のアプリでは、メモリーの上で3ワーカーまで。">
      {rows.map((r, i) => {
        const y = 30 + i * 90
        const per = r.worker * 1.3
        const fit = Math.floor((3072 - r.master) / per)
        return (
          <g key={r.label[0]}>
            <Box x={20} y={y} w={150} h={44} lines={r.label} fs={11} fill="bg" subTone="muted" />
            <rect x={x0} y={y + 4} width={1024 * k} height={36} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="4 3" />
            <T x={x0 + 4} y={y + 22} fs={10} tone="muted">OS など 1 GiB</T>
            <rect x={x0 + 1024 * k} y={y + 4} width={r.master * k} height={36} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            {Array.from({ length: fit }, (_, j) => (
              <rect key={j} x={x0 + (1024 + r.master + j * per) * k} y={y + 4} width={per * k} height={36} fill={j < 2 ? 'var(--fig-box5)' : 'var(--fig-box)'} stroke="var(--fig-line)" strokeWidth={0.6} />
            ))}
            <T x={x0} y={y + 58} fs={11}>{`メモリーの上では ${fit} ワーカーまで（マスター ${r.master} MB、1ワーカー ${r.worker} MB × 1.3）`}</T>
          </g>
        )
      })}
      <line x1={x0 + 4096 * k} y1={24} x2={x0 + 4096 * k} y2={210} stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={x0 + 4096 * k} y={226} fs={11} anchor="end" tone="acc">4 GiB</T>
      <rect x={x0} y={216} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={x0 + 20} y={222} fs={11}>2 vCPU での CPU の目安（2ワーカー）</T>
    </Svg>
  )
}

/* ---------- 図5 設定ごとの p95 と成功件数 ---------- */
const RESULTS = [
  { cfg: '1 × 3', r100: { p95: 2724, ok: 1000 }, r150: { p95: 2929, ok: 254 } },
  { cfg: '1 × 6', r100: { p95: 208, ok: 1000 }, r150: { p95: 1229, ok: 1500 } },
  { cfg: '2 × 3', r100: { p95: 262, ok: 1000 }, r150: { p95: 547, ok: 1500 } },
  { cfg: '2 × 6', r100: { p95: 205, ok: 1000 }, r150: { p95: 330, ok: 1500 } },
]

function LoadResultFigure() {
  const py = (ms: number) => 240 - ((Math.log10(ms) - 2) / (Math.log10(3000) - 2)) * 190
  return (
    <Svg id={figure(5)} w={780} h={300} label="ワーカー数 × スレッド数の4つの設定で、成功した要求の p95 を対数の縦軸で比べた棒グラフ。毎秒100件では 1×3 が 2,724 ms で、ほかは 205〜262 ms。毎秒150件では 1×3 が 2,929 ms で成功は1,500件中254件、1×6 が 1,229 ms、2×3 が 547 ms、2×6 が 330 ms。">
      {[100, 300, 1000, 3000].map((ms) => (
        <g key={ms}>
          <line x1={80} y1={py(ms)} x2={760} y2={py(ms)} stroke="var(--fig-line)" strokeOpacity={0.25} />
          <T x={74} y={py(ms)} fs={10} anchor="end" tone="muted">{`${ms.toLocaleString('en-US')} ms`}</T>
        </g>
      ))}
      <line x1={80} y1={240} x2={760} y2={240} stroke="var(--fig-line)" />
      {RESULTS.map((r, i) => {
        const x = 110 + i * 165
        return (
          <g key={r.cfg}>
            <rect x={x} y={py(r.r100.p95)} width={50} height={240 - py(r.r100.p95)} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <rect x={x + 56} y={py(r.r150.p95)} width={50} height={240 - py(r.r150.p95)} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={x + 25} y={py(r.r100.p95) + 12} fs={10} anchor="middle">{`${r.r100.p95}`}</T>
            <T x={x + 81} y={py(r.r150.p95) + 12} fs={10} anchor="middle">{`${r.r150.p95}`}</T>
            <T x={x + 53} y={256} fs={12} anchor="middle" bold>{r.cfg}</T>
            <T x={x + 53} y={274} fs={10} anchor="middle" tone={r.r150.ok < 1500 ? 'danger' : 'muted'}>{`150件/秒の成功 ${r.r150.ok}`}</T>
          </g>
        )
      })}
      <rect x={560} y={14} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={580} y={20} fs={11}>毎秒100件</T>
      <rect x={660} y={14} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={680} y={20} fs={11}>毎秒150件</T>
      <T x={20} y={20} fs={11} tone="muted">成功した要求の p95（縦軸は対数）</T>
      <T x={760} y={294} fs={10} anchor="end" tone="muted">横軸はワーカー数 × スレッド数</T>
    </Svg>
  )
}

/* ---------- 図6 タイムアウトの長さの順 ---------- */
function TimeoutFigure() {
  const rows: [string, number, string][] = [
    ['利用者・クライアント', 575, 'アプリの作り方による'],
    ['ロードバランサー', 515, 'ALB のアイドルタイムアウト 既定 60 秒'],
    ['Nginx', 455, 'proxy_read_timeout 既定 60 秒'],
    ['Rails の処理', 380, 'Puma は要求の処理時間に上限を持たない'],
    ['MySQL の1文', 300, 'max_execution_time 既定 0（上限なし）'],
  ]
  return (
    <Svg id={figure(6)} w={780} h={260} label="上から利用者、ロードバランサー、Nginx、Rails の処理、MySQL の1文の順に、待つ時間の上限を横棒で描いた図。内側の処理ほど上限を短くすると、外側が待つのをやめる前に内側が先に打ち切られる。各層の既定値は、ALB と Nginx が 60 秒、Puma は上限なし、MySQL の max_execution_time は 0。">
      {rows.map(([label, w, note], i) => (
        <g key={label}>
          <T x={20} y={40 + i * 44} fs={12}>{label}</T>
          <rect x={170} y={26 + i * 44} width={w} height={28} rx={3} fill={i === 3 ? 'var(--fig-box5)' : 'var(--fig-box)'} stroke="var(--fig-line)" />
          <T x={178} y={40 + i * 44} fs={11} tone="muted">{note}</T>
        </g>
      ))}
      <Arrow x1={760} y1={232} x2={760} y2={30} accent />
      <T x={750} y={250} fs={11} anchor="end" tone="acc">外側ほど長く、内側ほど短くする</T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 113,
  part: 10,
  title: "Puma と DB の同時処理能力を設計する",
  summary: "Puma のワーカーとスレッド、Active Record のプール、MySQL の上限を、CPU・I/O 待ち・メモリーの実測から一緒に見積もります。",
  goals: [
    "CPU コア数・I/O 待ちの割合・メモリーからワーカー数とスレッド数を見積もる",
    "Web とジョブのプロセスを含めて、MySQL に向かう接続の合計を計算する",
    "同じ到着率で設定を一つずつ変え、p95 と成功件数で比べる",
    "スケールアップとスケールアウト、タイムアウトの長さを制約に応じて決める",
  ],
  prerequisites: [15, 23, 111, 112],
  sections: [
    {
      id: "workers",
      title: "ワーカー、スレッド、待ち行列",
      body: (
        <>
          <p>Puma の設定で決める値は主にワーカー数（<code>WEB_CONCURRENCY</code>）とワーカーあたりのスレッド数（<code>RAILS_MAX_THREADS</code>）です。この章では2つの値と Active Record の接続プール、MySQL の接続の上限を、実際に測った値から決める手順を扱います。ワーカーとスレッドがどう要求を処理するか、GVL がスレッドに与える制約、<code>preload_app!</code> とコピーオンライトは <ChapterLink n={23} section="cluster" />・<ChapterLink n={23} section="gvl" />・<ChapterLink n={23} section="preload" /> で実験とともに説明しています。ここでは要点だけを確認します。</p>
          <p>Puma のクラスタモードではワーカーごとに Rails を実行するプロセスがあり、それぞれにスレッドプールがあります。例えば 2 ワーカーそれぞれの最大スレッド数が 4 なら、合計で最大 8 本の要求処理用のスレッドがあります。同じ時点で、その 8 本がすべて Ruby のコードを実行できるかは、CPU のコア数、CPU の割り当て、CRuby の GVL などで変わります。</p>
          <p>スレッドを増やすと、片方が I/O の完了を待つ間に別の要求を実行できる場合があります。Ruby の計算が長く、1プロセスで GVL の取得を待つ処理が多いなら、同じプロセスのスレッド数を増やす効果は限定的です。ワーカーを増やすと複数のプロセスで Ruby を実行できますが、使用するメモリーや DB に開く接続も増え得ます。</p>
          <p>まだ処理を開始していない要求が待つ時間と、スレッドを割り当てた後の時間を区別します。スレッドの空きを待っているだけなら、SQL の発行時間にはその待ちが現れません。DB 接続を待っている場合も、SQL を送ってからの時間は短いかもしれません。要求の全体時間と、Puma での待ち・接続待ち・SQL の時間を対応づけます（<ChapterLink n={111} section="latency" />）。</p>
          <Figure n={figure(1)} title="測る値と、それから決める設定" caption="右の列はこの章の実験で測った値です。4つの値のうち最も厳しい制約が設定の上限を決めます。">
            <SettingsFigure />
          </Figure>
          <p>図 {figure(1)} の4つの値はそれぞれ別の設定を制約します。Puma の説明書は、ワーカー数を CPU のコア数（x86 では vCPU の数）に合わせ、スレッドを使う場合は1ワーカーに1コアを割り当てることを勧めています。<Ref n={7} /> スレッド数は I/O 待ちの割合から、1台に置けるワーカー数はメモリーから、プールの上限と台数の積は MySQL の上限から決まります。次の節から1つずつ測ります。</p>
          <p>この章では設定ごとの応答時間を p95 で比べます。<Term en="95th percentile">p95</Term>（95 パーセンタイル）は、測った応答時間を短い順に並べたとき、全体の 95% がその値以下に入る値です。1,000件の応答なら短い方から 950 番目の値で、遅い方の 5% の要求がどれだけ待ったかを表します。平均は、一部の要求が長く待っても小さく出ることがあります。この章の負荷のスクリプトは成功した応答の時間を短い順に並べ、件数 × 0.95 を切り上げた番目の値を p95 としています。</p>
          <Ref n={1} /><Ref n={2} />
        </>
      ),
    },
    {
      id: "io-ratio",
      title: "I/O 待ちの割合からスレッド数を見積もる",
      body: (
        <>
          <p>この章の実験には Rails 8.1.4.1 を1つのファイルで定義したアプリケーションを使います。<code>/articles</code> は、MySQL で 30 ms 待つ SQL（<code>SELECT SLEEP(0.03)</code>）を実行してから、記事 200 件を読んで JSON を返します。外部の API や遅いクエリを待つ時間と、Ruby で応答を作る時間の両方を持つ要求の例です。MySQL 8.4.13 のデータベース <code>ag_113</code> に、記事 200 件を入れてあります。</p>
          <Code lang="ruby" title="app.rb（config/database.yml で ag_113 に接続し、max_connections は環境変数 DB_POOL で指定）" code={`require "rails"
require "active_record/railtie"
require "action_controller/railtie"

class DemoApp < Rails::Application
  config.load_defaults 8.1
  config.eager_load = true
  config.secret_key_base = "0" * 64
  config.logger = Logger.new(nil)
  config.hosts.clear
  routes.append do
    get "/articles" => "articles#index"
  end
end

class Article < ActiveRecord::Base; end

class ArticlesController < ActionController::API
  # DB で 30 ms 待ってから、記事 200 件を JSON にする
  def index
    Article.connection.select_value("SELECT SLEEP(0.03)")
    render json: Article.order(:id).map { |a| { id: a.id, title: a.title, body: a.body } }
  end
end

DemoApp.initialize!`} />
          <p>1件の要求のうち CPU を使う時間を、<ChapterLink n={111} section="constraints" /> と同じ方法で測ります。Puma を通さずに Rack のテスト用の要求で200回呼び、スレッドの CPU 時間と経過時間を足し合わせます。</p>
          <Code lang="ruby" title="io_ratio.rb" code={`require_relative "app"
require "rack/mock"

request = Rack::MockRequest.new(DemoApp)
20.times { request.get("/articles") } # 予行
wall = cpu = 0.0
200.times do
  w0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  c0 = Process.clock_gettime(Process::CLOCK_THREAD_CPUTIME_ID)
  raise unless request.get("/articles").status == 200
  cpu += Process.clock_gettime(Process::CLOCK_THREAD_CPUTIME_ID) - c0
  wall += Process.clock_gettime(Process::CLOCK_MONOTONIC) - w0
end
printf "1件あたり 経過 %.1f ms  CPU %.1f ms  CPU 以外 %.1f ms（%.0f%%）\\n",
       wall / 200 * 1e3, cpu / 200 * 1e3, (wall - cpu) / 200 * 1e3, (wall - cpu) / wall * 100`} />
          <Code lang="text" title="実行結果（CPU を2つに制限したコンテナ、RAILS_ENV=production、Ruby 4.0.9・YJIT あり。2回実行）" code={`1件あたり 経過 40.1 ms  CPU 7.3 ms  CPU 以外 32.8 ms（82%）
1件あたり 経過 39.3 ms  CPU 7.5 ms  CPU 以外 31.8 ms（81%）`} />
          <p>1件の経過時間 40 ms のうち、CPU を使ったのは約 7.3 ms で、残りの約 82% は MySQL の応答などを待っています。<code>load_defaults 8.1</code> は production で YJIT を有効にするので、この値は YJIT ありの値です（<ChapterLink n={112} section="plan" />）。</p>
          <Figure n={figure(2)} title="I/O 待ちの割合と、1プロセスに必要なスレッド数の目安" caption="右の曲線は単純化したモデルです。待ち時間と CPU の時間が要求ごとに一定で、スレッドの切り替えや GC の費用が無いと仮定しています。">
            <IoRatioFigure />
          </Figure>
          <p>GVL があるので、1つのプロセスで同時に Ruby を実行できるのは1本のスレッドです。1本が DB を待っている間にほかのスレッドが Ruby を実行できれば、そのプロセスの CPU を使い続けられます。I/O 待ちの割合を f とすると、そのために必要なスレッド数の目安は 1 ÷ (1 − f) で、この例では 40.1 ÷ 7.3 ≒ 5.5 本です。これは本書が説明のために使う単純なモデルで、実際にはスレッドが増えるほど GVL の取り合いと GC の負担が増えます。</p>
          <p>Rails ガイドは N+1 や遅い SQL の無いアプリケーションの I/O 待ちは処理時間の 50% を超えないことが多く、プロセスあたり3スレッドを既定にしています。<Ref n={4} /> Puma の説明書も、I/O 待ちが 50% 以上でない限りスレッド数を既定から増やさないよう勧めています。<Ref n={7} /> この例のアプリケーションは I/O 待ちが 82% と大きいので、既定の3より多いスレッドが候補になります。自分のアプリケーションでは、APM や <code>ActiveSupport::Notifications</code> の <code>cpu_time</code> と <code>idle_time</code>（<ChapterLink n={112} section="notifications" />）で、主な要求の割合を測ってから決めます。</p>
        </>
      ),
    },
    {
      id: "capacity",
      title: "接続を借りる数と DB の上限",
      body: (
        <>
          <p>Active Record の接続プールは接続を再利用し、対応する設定に対してプロセス内で開ける接続数を制限します。一つの Puma ワーカーで対象 DB のプールに <code>max_connections: 3</code> を設定すると、そのプールは最大 3 接続です。4 本のスレッドが同時に接続を借り、先に借りた 3 本が返していないなら、残りの 1 本は接続を待ちます。<code>checkout_timeout</code> を超えて借りられなければ <code>ActiveRecord::ConnectionTimeoutError</code> が発生します。<Ref n={2} /> そのため、プールの上限はワーカーあたりのスレッド数以上にするのが一般的です。</p>
          <h3>Web とジョブの接続を実際に数える</h3>
          <p>前の節のアプリケーションを2ワーカー × 3スレッド（プールの上限3）の Puma で起動し、毎秒80件の要求を送りました。同時に、ジョブを実行するプロセスを別のコンテナで動かしました。このプロセスは Sidekiq の既定の同時実行数と同じ5本のスレッドで、それぞれ DB で1秒待つ処理を繰り返します（Sidekiq の代わりに同じ数のスレッドで接続を使うスクリプトで、プールの上限は5）。その間に MySQL の接続を、接続元の IP アドレスごとに数えます。</p>
          <Code lang="sql" title="count.sql" code={`SELECT SUBSTRING_INDEX(host, ':', 1) AS client_ip, COUNT(*) AS connections
FROM information_schema.processlist
WHERE db = 'ag_113' AND id <> CONNECTION_ID()
GROUP BY client_ip;`} />
          <Code lang="text" title="実行結果（MySQL 8.4.13。172.29.0.6 が Puma、172.29.0.10 がジョブのコンテナ）" code={`+-------------+-------------+
| client_ip   | connections |
+-------------+-------------+
| 172.29.0.6  |           6 |
| 172.29.0.10 |           5 |
+-------------+-------------+

mysql> SHOW GLOBAL STATUS LIKE 'Threads_connected';
Threads_connected	22

mysql> SHOW VARIABLES LIKE 'max_connections';
max_connections	151

# ジョブのプロセスの ActiveRecord::Base.connection_pool.stat
{size: 5, connections: 5, busy: 5, waiting: 0}`} />
          <p>Puma からは 2 × 3 = 6 本、ジョブのプロセスからは 5 本で、合わせて 11 本でした。各ワーカーとジョブのプロセスがそれぞれ自分のプールを持ち、上限まで接続を開いています。一方、MySQL 全体の <code>Threads_connected</code> は 22 でした。この MySQL は本書のほかの実験とも共有しているので、ほかのデータベースへの接続も数えられています。<code>max_connections</code> はサーバー全体の上限で、同じ MySQL を使うすべてのアプリケーションと運用の接続がこの中に入ります。<Ref n={3} /></p>
          <h3>接続の合計を計算する</h3>
          <p>Puma の 1 台に 2 ワーカーあり、同じ Web タスクを 3 台配置するなら、その DB に向けた Web 用の接続枠は最大 <code>2 × 3 × 3 = 18</code> です。ジョブのプロセスが 2 個、同じ DB に各 4 接続まで使うなら、合計は 26 接続です。これは上限の合計で、起動しただけで全枠を消費する意味ではありません。</p>
          <p>Sidekiq の同時実行数は指定しなければ5です。<code>-c</code> や設定ファイルで指定せず、環境変数 <code>RAILS_MAX_THREADS</code> があればその値を使います。<Ref n={5} /> Web と同じ環境変数を読む設定にしていると、Web のスレッド数を変えたときにジョブの同時実行数と必要な接続数も変わります。ジョブのプロセスでは、プールの上限を同時実行数以上にします。</p>
          <p>対象 DB に向く別ロールやシャードのプール、管理用の接続、マイグレーション、監視、デプロイ中に一時的に追加するワーカーも計上します。Web タスクが一台増える間は、この例で Web の枠に 6 を加えます。MySQL サーバー全体で接続数を見た上で、監視や運用のためにも余裕を取ります。MySQL は <code>max_connections</code> に1本を加えた接続を受け付け、その1本は <code>CONNECTION_ADMIN</code> 権限を持つアカウント用に予約しています。<Ref n={12} /> アプリケーションが上限まで使い切っても、管理者が接続して調べられるようにするための枠です。</p>
          <Figure n={figure(3)} title="MySQL に向かう接続数の見積もり" caption="上は計算例、下はこの節の実測です。稼働中にはプールごとの使用数（busy）や待機数（waiting）も測ります。">
            <ConnectionBudgetFigure />
          </Figure>
          <Code lang="yaml" title={"Rails 8.1 で既存の DB 設定へ加える例"} code={"production:\n  adapter: mysql2\n  url: <%= ENV.fetch(\"DATABASE_URL\") %>\n  max_connections: <%= Integer(ENV.fetch(\"WEB_DB_POOL\", \"3\")) %>\n  checkout_timeout: 1"} />
          <p>この設定の 1 秒は例です。利用者の応答に許される時間、接続を得てから残る処理時間、上流のタイムアウトを見て決めます。Web とジョブで同じ設定ファイルを使う場合も、実行環境ごとに値を指定できます。Rails 8.1 では、プールの上限の設定名が <code>pool</code> から <code>max_connections</code> に変わりました。両方を違う値で書くと起動時にエラーになります。<Ref n={6} /></p>
          <p>次の図ではワーカー数・スレッド数・プールの上限・到着数を変えて、要求がどこで待つかを試せます。</p>
        </>
      ),
    },
    {
      id: "budgets",
      title: "ワーカー内の待ちとサーバー全体の枠を比べる",
      body: (
        <>
          <p>前の例で、同じワーカーの 4 本のスレッドがすべて DB を使う状態が続くと、プール上限が 3 のため待つスレッドが生じます。上限を 4 にすると、6 ワーカーが向く Web 用の枠は 18 から 24 に増えます。ジョブの 8 を加えて 32 です。入れ替えで一時的に Web が一台増えれば、追加の 2 ワーカーが各 4 を使い、合計は 40 です。例えばアプリケーションに残した接続枠が 35 なら、平時には足りても入れ替え時の上限を超えます。</p>
          <p>予算を確保できない場合、プールの上限を広げる代わりに、接続を貸し出している時間を調べます。問い合わせの結果を受け取った後に Ruby だけで時間を使う処理があっても、借りた接続をいつ返すかは取得方法や周囲の処理によって変わります。接続を使う範囲を明確にし、外部通信などの間に不要なロックを持っていないかも調べます。</p>
          <p>平均で使っている接続数は、リトルの法則で見積もれます。<Term en="Little's law">リトルの法則</Term>は、ある範囲（待っている場所と処理している場所を合わせたもの）に入っている仕事の平均の数 L が、1秒あたりの到着数 λ と、1件がその範囲にいる平均時間 W の積になるという関係です（L = λ × W）。到着と完了が長い期間で釣り合っていれば、到着の間隔や処理時間のばらつきに関係なく成り立ちます。範囲を接続プールに取ると、毎秒80件の要求がそれぞれ平均 30 ms 接続を借りるとき、使用中の接続は平均 80 × 0.03 = 2.4 本です。範囲を Puma のスレッドに取ると、スレッド数 ÷ 1件がスレッドを使う時間で、1秒に完了できる件数の上限が分かります。この式から分かるのは平均で、一時的な集中や p95 は求められません。式の導き方と使い方の例は <ChapterLink n={111} section="little" /> にあります。</p>
          <p>一つのプールで空きがなくても、別のワーカーのプールに空きがあることがあります。各プールはそれぞれ接続を管理するため、空いている接続をワーカー間で融通しません。全体の平均だけでなく、待機が多いワーカーと、そのワーカーへ流れた要求の種類を比較します。</p>
        </>
      ),
    },
    {
      id: "memory",
      title: "1ワーカーの RSS を測って台数と実行環境の大きさを決める",
      body: (
        <>
          <p>ワーカーを増やすとメモリーも増えます。1台に置けるワーカー数の上限を決めるために、負荷をかけた後の各プロセスのメモリーを測ります。RSS（物理メモリーに載っているページの合計）と PSS（共有ページをプロセスの数で割って配分した値）の意味と、<code>preload_app!</code> による共有は <ChapterLink n={23} section="memory" /> と <ChapterLink n={103} section="allocation" /> で扱っています。</p>
          <p>2ワーカー × 6スレッドの Puma（<code>preload_app!</code> あり）に毎秒150件を10秒間送った後、コンテナの中で <code>/proc/PID/smaps_rollup</code> を読みました。<Ref n={11} /></p>
          <Code lang="bash" title="rss.sh（Puma のコンテナの中で、puma のプロセスごとに RSS と PSS を MB で表示する）" code={`for d in /proc/[0-9]*; do
  cmd=$(tr "\\0" " " < $d/cmdline 2>/dev/null)
  case "$cmd" in *puma*)
    rss=$(awk '/^Rss:/ {print int($2/1024)}' $d/smaps_rollup)
    pss=$(awk '/^Pss:/ {print int($2/1024)}' $d/smaps_rollup)
    echo "PID \${d#/proc/}  RSS \${rss}MB  PSS \${pss}MB  $(echo $cmd | cut -c1-40)";;
  esac
done`} />
          <Code lang="text" title="実行結果（Puma 8.0.2・Rails 8.1.4.1・Ruby 4.0.9）" code={`PID 1  RSS 82MB  PSS 49MB  puma 8.0.2 (tcp://0.0.0.0:3000) [work]
PID 13  RSS 113MB  PSS 83MB  puma: cluster worker 1: 1 [work]
PID 9  RSS 112MB  PSS 82MB  puma: cluster worker 0: 1 [work]`} />
          <p>マスターが RSS 82 MB、ワーカーが 112〜113 MB でした。別の実行（負荷をかける側の CPU が足りず、Puma の前で要求が長く待った回）の後には、ワーカーの RSS が 135〜139 MB まで増えていました。同じアプリケーションでも、待っている要求や処理したデータの量でメモリーは変わります。見積もりには代表的な負荷とピーク時の負荷をかけた後の大きい方の値を使います。ここでは 140 MB とします。</p>
          <h3>台数と実行環境の大きさを決める例</h3>
          <p>2 vCPU・4 GiB の実行環境に置く場合を計算します。OS、ログの収集、監視のエージェントなどに 1 GiB を残し、残りの 3 GiB（3,072 MB）を Puma に使うと仮定します。1ワーカーの RSS 140 MB に、長時間の稼働で増える分として3割の余裕を見て 182 MB とすると、マスターの 82 MB を除いて (3,072 − 82) ÷ 182 ≒ 16 ワーカーまで置けます。一方、CPU は2つなので、ワーカー数の目安は2です。このアプリケーションでは CPU が先に上限になり、メモリーには余裕があります。CPU に対してメモリーの少ない種類の実行環境を選ぶか、同じ CPU 数でメモリーを減らしても足ります。</p>
          <Figure n={figure(4)} title="メモリーと CPU で決まるワーカー数" caption="計算例です。OS などに残す 1 GiB と、3割の余裕は仮定の値です。実際の値はワーカーの RSS を数時間から数日測って決めます。">
            <MemoryBudgetFigure />
          </Figure>
          <p>業務のアプリケーションでは読み込む gem やキャッシュが多く、1ワーカーが数百 MB になることがよくあります。Puma の説明書は、多くの Puma のプロセスが1ワーカーあたり約 512 MB〜1 GB、マスターが約 1 GB を使うとしています。<Ref n={7} /> 1ワーカーが 600 MB なら、同じ 4 GiB には3ワーカーまでしか置けません。この場合はメモリーが先に上限になり、メモリーの大きい実行環境を選ぶか、メモリーの使い方を見直します（<ChapterLink n={112} section="memory" />）。</p>
          <p>必要な台数はピーク時の到着数と1台で処理できる件数から求めます。次の節の実験では、2ワーカー × 6スレッドの1台が毎秒150件を p95 330 ms で処理できました。ピーク時に毎秒400件届くなら、1台が止まっても処理できるように 400 ÷ 150 ≒ 2.7 を切り上げた3台に、1台を加えた4台が候補です。この見積もりは単純な割り算なので、実際の台数は同じ構成で負荷をかけて確かめます。</p>
        </>
      ),
    },
    {
      id: "scaling",
      title: "何を増やせば完了件数が増えるか",
      body: (
        <>
          <p><Term en="scale up">スケールアップ</Term>は1台の実行環境を CPU やメモリーの大きいものに替えて、1台で使える資源を増やす方法です。<Term en="scale out">スケールアウト</Term>は同じ役割の台やコンテナを増やし、ロードバランサーで要求を分ける方法です。Puma ではどちらの場合も増えた CPU コアを使うためにワーカー数を合わせて変えます。スケールアップには1台の大きさの上限があり、スケールアウトでは台数に比例して DB への接続が増えます。どちらの方法でも、共有している MySQL の処理能力は増えません。それぞれが成り立つ条件の比較は <ChapterLink n={111} section="scaling" /> にあります。</p>
          <p>ここでは、測った値からどちらを選ぶかを考えます。CPU を使い切っている Web サーバーなら、プロセスが追加のコアを使える形で増やすか、別の台に負荷を分ける余地があります。</p>
          <p>DB に時間の長いクエリやロックの待ちが多い場合は、Web を増やしても同じ DB にさらに負荷がかかる可能性があります。接続の待ちが多い場合も、DB に余裕があるかを確かめます。プールを広げて待ちが減ったように見えても、SQL の実行時間や失敗が増えれば、原因が後ろの層に移っただけです。</p>
          <div className="table-wrap"><table>
            <caption>観測した状態と、増やすものの候補</caption>
            <thead><tr><th scope="col">観測した状態</th><th scope="col">増やすものの候補</th><th scope="col">同時に確かめること</th></tr></thead>
            <tbody>
              <tr><th scope="row">Puma の backlog が増え、CPU に余裕があり、I/O 待ちの割合が高い</th><td>ワーカーあたりのスレッド数</td><td>プールの上限、MySQL の接続数の合計</td></tr>
              <tr><th scope="row">CPU が飽和し、1台のコア数を増やせる</th><td>大きい実行環境とワーカー数（スケールアップ）</td><td>1台が止まったときに失う処理能力</td></tr>
              <tr><th scope="row">CPU が飽和し、状態を台の外に置いている</th><td>台数（スケールアウト）</td><td>台数 × ワーカー数 × プールの上限</td></tr>
              <tr><th scope="row">メモリーが上限に近く、CPU に余裕がある</th><td>メモリーの大きい実行環境、または割り当ての削減</td><td>RSS の増え方（時間とともに増え続けないか）</td></tr>
              <tr><th scope="row">MySQL の実行中のスレッドやロック待ちが多い</th><td>Web は増やさない。SQL と索引を直す</td><td>DB のスケールアップや読み取り用のレプリカ</td></tr>
            </tbody>
          </table></div>
          <p>Web を複数台にすると、アップロードやセッションを一台のローカルファイルに残す設計では、次の要求が別の台に届いたときに読めない場合があります。データをどこに置くか、ロードバランサーで負荷をどう分けるか、台数が減った状態でも必要な処理を行えるかを合わせて考えます。スケールアップの場合も、単一障害で失う処理能力を考えます。</p>
          <p>Puma の説明書は1台（1つの Pod）あたりのワーカー数を4以上にすることを勧めています。待ち行列は台ごとにできるため、1ワーカーの台を4つ並べるより、4ワーカーの台を1つ置く方が、空いたワーカーに要求が渡りやすく待ち時間が短くなるという理由です。<Ref n={7} /> <ChapterLink n={111} section="queueing" /> のシミュレーションで、処理枠が3つの列が1枠の列より待ちが短かったのと同じ関係です。台数を増やす場合も、1台あたりのワーカー数を少なくしすぎないようにします。</p>
        </>
      ),
    },
    {
      id: "verify",
      title: "利用中の接続と待ちを見て設定を選ぶ",
      body: (
        <>
          <p>まず実負荷に近い要求を使い、Puma の混雑、Active Record のプールで忙しい接続数と待っているスレッド数、MySQL の接続数と SQL の実行状況を同じ時間帯で比べます。接続枠を使い切った時刻と遅い応答の発生時刻があっていれば、接続待ちがどう生じたかを調べられます。相関だけでは接続枠の設定を原因とは決められません。長時間接続を返さない処理も確認します。</p>
          <p>ワーカー数、最大スレッド数、プールの上限を一度に変更すると、改善の理由が分からなくなります。設定を一つずつ変えて、同じ到着率で成功率、レイテンシ、完了数、メモリーを比較します。本番に適用する候補が決まったら、台数が増えるデプロイ中、台数が減った状態、ジョブが多く動く時間帯にも上限を超えないかを確認します。</p>
          <h3>Puma のスレッド数を変えて待ちを測る</h3>
          <p>Puma 8.0.2 と Rack 3.2.8 を使います。ローカルの Rack アプリは要求を受けるたびに50ミリ秒を指定して <code>sleep</code> します。ここではスレッドが待つ処理だけを再現し、Rails や DB は起動しません。</p>
          <Code lang="ruby" title="config.ru" code={`run lambda { |_env|
  sleep 0.05
  [200, {"content-type" => "text/plain"}, ["ok\\n"]]
}`} />
          <p>まず1スレッドの Puma を起動し、別の端末から <code>ruby load-http.rb</code> を実行します。この Puma を終了した後、同じアプリを4スレッドで起動し、同じクライアントを実行します。</p>
          <Code lang="bash" title="スレッド数を指定する起動コマンド" code={`# 1回目
puma -b tcp://127.0.0.1:9292 -t 1:1 config.ru

# 2回目（1回目を終了してから）
puma -b tcp://127.0.0.1:9292 -t 4:4 config.ru`} />
          <Code lang="ruby" title="load-http.rb" code={`require "net/http"

request = -> {
  Net::HTTP.start("127.0.0.1", 9292, nil, open_timeout: 2, read_timeout: 2) do |http|
    http.get("/")
  end
}

raise "warmup failed" unless request.call.code == "200"

start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
clients = Array.new(4) do
  Thread.new do
    Array.new(10) do
      sent_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      response = request.call
      elapsed = Process.clock_gettime(Process::CLOCK_MONOTONIC) - sent_at
      [response.code, elapsed]
    end
  end
end
results = clients.flat_map(&:value)
total = Process.clock_gettime(Process::CLOCK_MONOTONIC) - start
statuses = results.map(&:first).tally
raise "unexpected responses: #{statuses.inspect}" unless statuses == {"200" => 40}

latencies = results.map(&:last).sort
p95 = latencies.fetch((latencies.length * 0.95).ceil - 1)
printf "200s=%d, throughput=%.1f requests/s, p95=%.1f ms\\n",
       results.length, results.length / total, p95 * 1_000`} />
          <p>クライアントは予行の1回を計測対象から外し、4スレッドで各10件を送ります。各スレッドは前の応答を受け取るたびに次の要求を送るため、到着率は応答時間によって変わります。p95 には40件の応答時間を短い順に並べた38番目を使います。応答時間には各要求の TCP 接続時間も含まれます。</p>
          <div className="table-wrap"><table>
            <caption>CPU の割り当て上限を1にした Docker コンテナ内での計測例（CRuby 4.0.9）</caption>
            <thead><tr><th scope="col">Puma のスレッド数</th><th scope="col">成功件数</th><th scope="col">1秒あたりの完了件数</th><th scope="col">p95</th></tr></thead>
            <tbody>
              <tr><th scope="row">1</th><td>40件</td><td>19.6件</td><td>205.4 ms</td></tr>
              <tr><th scope="row">4</th><td>40件</td><td>76.1件</td><td>57.5 ms</td></tr>
            </tbody>
          </table></div>
          <p>1スレッドでは、一つの要求が待っている間も次の要求を処理できません。4スレッドでは待つ時間が重なり、毎秒の完了件数が増えました。ここで確認したのは待機だけの処理です。Rails アプリに適用するときは、Ruby が計算する時間と DB の接続待ちを測り、どちらが上限になるかを確かめます。</p>
          <h3>Rails と MySQL で、設定ごとの p95 と成功件数を比べる</h3>
          <p>次に、<code>/articles</code> の Rails アプリケーションを Puma で動かし、ワーカー数とスレッド数を変えて比べます。Puma のコンテナは CPU を2つに制限し、<code>preload_app!</code> を有効にします。プールの上限はスレッド数と同じにします。負荷をかける側は別のコンテナ（CPU 2つ）で動かし、前の応答を待たずに決まった間隔で要求を送ります（<ChapterLink n={112} section="load" />）。応答を3秒待っても返らなければ失敗として数えます。</p>
          <Code lang="ruby" title="puma.rb" code={`workers Integer(ENV.fetch("WEB_CONCURRENCY", "1"))
threads_count = Integer(ENV.fetch("RAILS_MAX_THREADS", "3"))
threads threads_count, threads_count
bind "tcp://0.0.0.0:3000"
preload_app!`} />
          <Code lang="ruby" title="load.rb（ruby load.rb 1秒あたりの件数 秒数）" code={`require "net/http"

rate, seconds = Integer(ARGV.fetch(0)), Integer(ARGV.fetch(1))
uri = URI("http://ag-113-web:3000/articles")
Net::HTTP.get(uri) # 予行

start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
threads = Array.new(rate * seconds) do |i|
  at = start + i.fdiv(rate)
  sleep [at - Process.clock_gettime(Process::CLOCK_MONOTONIC), 0].max
  Thread.new do
    t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    code = begin
      Net::HTTP.start(uri.host, uri.port, open_timeout: 3, read_timeout: 3) { |h| h.get(uri.path).code }
    rescue => e
      e.class.name.split("::").last
    end
    [code, (Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) * 1_000]
  end
end
results = threads.map(&:value)
ok = results.select { |code, _| code == "200" }.map(&:last).sort
pct = ->(p) { ok.empty? ? 0 : ok[(ok.size * p).ceil - 1] }
printf "送信 %d件  成功 %d件  失敗 %s  成功の p50 %.0f ms  p95 %.0f ms  最大 %.0f ms\\n",
       results.size, ok.size, results.reject { |c, _| c == "200" }.map(&:first).tally, pct.(0.5), pct.(0.95), ok.last.to_f`} />
          <Code lang="text" title="実行結果（4コアのホスト、load average 3〜4。各設定を10秒ずつ）" code={`== workers=1 threads=3 pool=3 rate=100/s 10s
送信 1000件  成功 1000件  失敗 {}  成功の p50 1624 ms  p95 2724 ms  最大 2897 ms
== workers=1 threads=6 pool=6 rate=100/s 10s
送信 1000件  成功 1000件  失敗 {}  成功の p50 36 ms  p95 208 ms  最大 322 ms
== workers=2 threads=3 pool=3 rate=100/s 10s
送信 1000件  成功 1000件  失敗 {}  成功の p50 46 ms  p95 262 ms  最大 373 ms
== workers=2 threads=6 pool=6 rate=100/s 10s
送信 1000件  成功 1000件  失敗 {}  成功の p50 37 ms  p95 205 ms  最大 284 ms
== workers=1 threads=3 pool=3 rate=150/s 10s
送信 1500件  成功 254件  失敗 {"ReadTimeout" => 1246}  成功の p50 2267 ms  p95 2929 ms  最大 3002 ms
== workers=1 threads=6 pool=6 rate=150/s 10s
送信 1500件  成功 1500件  失敗 {}  成功の p50 765 ms  p95 1229 ms  最大 1253 ms
== workers=2 threads=3 pool=3 rate=150/s 10s
送信 1500件  成功 1500件  失敗 {}  成功の p50 349 ms  p95 547 ms  最大 677 ms
== workers=2 threads=6 pool=6 rate=150/s 10s
送信 1500件  成功 1500件  失敗 {}  成功の p50 38 ms  p95 330 ms  最大 472 ms`} />
          <Figure n={figure(5)} title="ワーカー数 × スレッド数ごとの p95 と成功件数" caption="上の実行結果の p95 を描いたグラフです。p95 は成功した要求だけで計算しています。1 × 3 の毎秒150件では1,500件のうち1,246件が3秒以内に応答を受け取れませんでした。">
            <LoadResultFigure />
          </Figure>
          <p>結果は前の節までの見積もりで説明できます。1 × 3 は、3本のスレッドが1件を約 40 ms 使うので、リトルの法則から最大で 3 ÷ 0.04 = 毎秒75件ほどしか処理できません。毎秒100件では待ち行列が伸び続け、p95 が 2.7 秒になりました。1 × 6 はスレッドの枠では毎秒150件まで処理できますが、1つのプロセスの CPU は1件 7.4 ms なので、GVL の上限が毎秒約135件です。毎秒100件では余裕があり（p95 208 ms）、毎秒150件では上限を超えて p95 が 1.2 秒になりました。2 × 6 は2つの CPU を使い、どちらの到着数でも p95 を最も短くしました。</p>
          <p>毎秒150件の 1 × 3 は、成功が1,500件中254件でした。処理能力の上限（毎秒約75件）から見ると、10秒の間に約 750 件は処理できたはずです。それでも成功が少なかったのは、クライアントが3秒で待つのをやめた要求も、Puma が先着順に処理し続けたためです。クライアントが待つのをやめた要求の処理に時間を使うほど、まだ待っている要求の応答も遅れます。これは次の節で扱うタイムアウトの設計につながります。</p>
          <p>この実験では最初に負荷をかける側の CPU を1つにして実行したところ、2ワーカーの設定の方が1ワーカー × 6スレッドより遅いという、見積もりと合わない結果が出ました。負荷をかける側の CPU を2つに増やすと、上の結果になりました。負荷をかける側が先に詰まると、サーバーの差ではなくクライアントの限界を測ることになります。負荷試験では、負荷をかける側の CPU とネットワークにも余裕があるかを確かめます。</p>
          <p>この結果から、このアプリケーションを 2 vCPU の実行環境で動かすなら、2ワーカー × 6スレッド（プールの上限6）が候補です。I/O 待ちの割合から見積もった約 5.5 本とも合います。ただし、実際のアプリケーションでは要求の種類ごとに I/O 待ちの割合が違うので、主な要求の割合で同じ実験を行います。</p>
        </>
      ),
    },
    {
      id: "timeouts",
      title: "Nginx・ロードバランサーのタイムアウトとの関係",
      body: (
        <>
          <p>前の節の実験で、クライアントが待つのをやめた後も Puma が処理を続け、1 × 3 の毎秒150件では成功が1,500件中254件に減りました。本番では利用者のブラウザー、ロードバランサー、Nginx がそれぞれ待つ時間の上限（タイムアウト）を持ちます。Nginx が 504 を返した後も Rails が処理を最後まで続けてログに 200 を残す様子は、<ChapterLink n={25} section="timeouts" /> で実際のログを使って確かめています。</p>
          <Figure n={figure(6)} title="タイムアウトの長さの順" caption="模式図です。棒の長さは順序を表し、実際の秒数の比ではありません。Puma 自身は要求の処理時間に上限を持ちません。">
            <TimeoutFigure />
          </Figure>
          <p>図 {figure(6)} のように、内側の処理ほど上限を短くします。外側（ロードバランサーや Nginx）が先に待つのをやめると、内側の Puma のスレッドと DB の接続は、誰も受け取らない応答を作り続けます。混雑しているときほどこの無駄が増え、前の節の 1 × 3 の結果のように成功件数が減ります。AWS の ALB のアイドルタイムアウトの既定は60秒、Nginx の <code>proxy_read_timeout</code> の既定も60秒です。<Ref n={8} /><Ref n={9} /> Puma には要求の処理時間の上限が無く（<ChapterLink n={23} section="restart-timeout" />）、MySQL の <code>max_execution_time</code>（SELECT 文の実行時間の上限）の既定は 0 で、上限がありません。<Ref n={10} /></p>
          <p>そのため、上限を内側に設ける設定を検討します。たとえば、遅い SELECT を MySQL の <code>max_execution_time</code> で打ち切る、外部 API の呼び出しに短い <code>open_timeout</code> と <code>read_timeout</code> を付ける、接続プールの <code>checkout_timeout</code> を短くする、といった方法です。どの値も、利用者が待てる時間、処理を途中でやめたときにデータが不整合にならないか、再試行するかを考えて決めます。</p>
          <p>タイムアウトの長さは同時処理能力の見積もりにも関係します。リトルの法則から、1件が長く待つほど同時に使うスレッドと接続は増えます。たとえば外部 API が障害で30秒応答しなくなると、毎秒10件の要求でも 10 × 30 = 300 本のスレッドが必要になり、どんな設定でも足りません。上限を3秒にすれば、同じ状況で必要なスレッドは30本です。タイムアウトは障害のときに Puma のスレッドと DB の接続を使い切らないための上限として決めます。</p>
        </>
      ),
    },
    {
      id: "tradeoffs",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章の手順をまとめると、次の順に決めます。1. 主な要求の CPU 時間と I/O 待ちの割合を測る。2. CPU コア数からワーカー数を、I/O 待ちの割合からスレッド数を見積もる。3. 1ワーカーの RSS から、実行環境の大きさとメモリーの上限を確かめる。4. 台数 × ワーカー数 × プールの上限とジョブのプロセスの接続を足し、MySQL の上限と比べる。5. 同じ到着率で設定を一つずつ変えて、p95・成功件数・メモリーを比べる。6. タイムアウトを外側ほど長く設定する。</p>
          <p>スレッドを増やすと、I/O 待ちを重ねて完了件数を増やせる一方、同じプロセスの Ruby の実行が GVL を取り合い、CPU を使う要求の応答は遅くなります。メモリーと接続数も増えます。ワーカーを増やすと CPU のコアを使えますが、ワーカーごとにメモリーとプールが要ります。台数を増やすと止まったときの影響は小さくなりますが、接続数と運用の手間が増え、DB がボトルネックなら効果がありません。</p>
          <p>本書ではまず rails new が生成する設定の値（3スレッド。Puma 自体の既定は5スレッド）と、vCPU の数と同じワーカー数から始め、I/O 待ちの割合が 50% を大きく超えることを測って確かめた場合にだけスレッド数を増やすことを勧めます。これは設計上の意見で、Rails ガイドと Puma の説明書の推奨に沿ったものです。<Ref n={4} /><Ref n={7} /> この章の実験の数値（2 × 6 が最も短い p95）は、I/O 待ちが 82% のアプリケーションでの結果で、別のアプリケーションにそのまま当てはまるとは限りません。</p>
          <p>関連する章（<ChapterLink n={15} section="pool">プールの仕組み</ChapterLink>、<ChapterLink n={23}>Puma の内部</ChapterLink>、<ChapterLink n={25} section="timeouts">ロードバランサーと Nginx のタイムアウト</ChapterLink>、<ChapterLink n={111}>レイテンシと待ち行列</ChapterLink>、<ChapterLink n={112}>プロファイリングとベンチマーク</ChapterLink>、<ChapterLink n={115}>容量を判断する事例</ChapterLink>）</p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Puma README",
      publisher: "Puma",
      url: "https://github.com/puma/puma/blob/v8.0.2/README.md",
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "スレッドプールとクラスタモード",
    },
    {
      title: "ConnectionPool",
      publisher: "Ruby on Rails",
      url: "https://github.com/rails/rails/blob/v8.1.4.1/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb",
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "接続の貸し出し、容量、チェックアウトのタイムアウト、stat",
    },
    {
      title: "Server System Variables（max_connections）",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html#sysvar_max_connections",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "max_connections とサーバー全体の接続数、CONNECTION_ADMIN 用の1本",
    },
    {
      title: "Tuning Performance for Deployment",
      publisher: "Ruby on Rails Guides",
      url: "https://guides.rubyonrails.org/v8.1/tuning_performance_for_deployment.html",
      accessed: "2026-11-27",
      version: "Rails 8.1",
      note: "I/O 待ちの割合とスレッド数、プロセス数と CPU コア",
    },
    {
      title: "lib/sidekiq/config.rb と lib/sidekiq/cli.rb",
      publisher: "Sidekiq",
      url: "https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/sidekiq/config.rb",
      accessed: "2026-11-27",
      version: "Sidekiq 8.1.7",
      note: "concurrency の既定値 5（config.rb）、RAILS_MAX_THREADS を読む処理（cli.rb の290行目）",
    },
    {
      title: "activerecord/lib/active_record/database_configurations/hash_config.rb",
      publisher: "Ruby on Rails",
      url: "https://github.com/rails/rails/blob/v8.1.4.1/activerecord/lib/active_record/database_configurations/hash_config.rb",
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "max_connections、pool の非推奨、両方を違う値で指定したときのエラー",
    },
    {
      title: "docs/deployment.md",
      publisher: "Puma",
      url: "https://github.com/puma/puma/blob/v8.0.2/docs/deployment.md",
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "CPU コアとワーカーの比、I/O 待ち 50% とスレッド数、1台あたりのワーカー数、ワーカーのメモリー",
    },
    {
      title: "Module ngx_http_proxy_module（proxy_read_timeout）",
      publisher: "nginx",
      url: "https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_read_timeout",
      accessed: "2026-11-27",
      version: "nginx 1.30",
      note: "既定値 60s",
    },
    {
      title: "Application Load Balancers: Load balancer attributes",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html#load-balancer-attributes",
      accessed: "2026-11-27",
      version: "Elastic Load Balancing",
      note: "idle_timeout.timeout_seconds の既定値 60 秒",
    },
    {
      title: "Server System Variables（max_execution_time）",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html#sysvar_max_execution_time",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "SELECT 文の実行時間の上限。既定値 0 は上限なし",
    },
    {
      title: "The /proc Filesystem（smaps_rollup）",
      publisher: "The Linux Kernel documentation",
      url: "https://docs.kernel.org/filesystems/proc.html",
      accessed: "2026-11-27",
      version: "Linux カーネルの文書",
      note: "Rss と Pss の意味",
    },
    {
      title: "Too many connections",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/too-many-connections.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "max_connections + 1 の接続を受け付け、1本を CONNECTION_ADMIN 用に予約すること",
    },
  ],
}

export default chapter
