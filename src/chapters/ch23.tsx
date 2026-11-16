import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation23 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const PM = 'https://github.com/puma/puma/blob/v8.0.2'

/* ---------- 図 23-1 プロセスとスレッドの構成 ---------- */
function ClusterFigure() {
  const worker = (x: number, i: number, pid: number) => (
    <g key={i}>
      <rect x={x} y={130} width={330} height={190} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={x + 12} y={148} bold fs={12}>
        {`ワーカー ${i}（PID ${pid}）`}
      </T>
      <Box x={x + 12} y={160} w={140} h={40} lines={['puma reactor', '要求を読み切る']} fs={10.5} mono fill="box" subTone="muted" />
      <Arrow x1={x + 152} y1={180} x2={x + 176} y2={180} />
      <Box x={x + 178} y={160} w={140} h={40} lines={['todo（待ち行列）', 'backlog']} fs={10.5} fill="box4" subTone="muted" />
      {[0, 1, 2].map((t) => (
        <Box key={t} x={x + 12 + t * 106} y={220} w={96} h={40} lines={[`tp 00${t + 1}`, 'Rails を実行']} fs={10.5} mono fill="box5" subTone="muted" />
      ))}
      <Arrow x1={x + 248} y1={200} x2={x + 165} y2={218} />
      <T x={x + 12} y={284} fs={10.5} tone="muted">
        接続プール（max_connections = 3）
      </T>
      <T x={x + 12} y={302} fs={10.5} tone="muted">
        応答の書き込みもスレッドが行う
      </T>
    </g>
  )
  return (
    <Svg
      id="23-1"
      w={780}
      h={340}
      label="Puma のクラスタモードでは、マスターのプロセスがソケットを開いてワーカーのプロセスを fork する。マスターは要求を処理せず、ワーカーの監視とシグナルの処理をする。各ワーカーでは、reactor のスレッドが要求を最後まで読み、todo の待ち行列に入れる。スレッドプールのスレッド（tp 001〜003）が待ち行列から取り出して Rails を実行し、応答も書き込む。ワーカーはそれぞれ接続プールを持つ"
    >
      <Box x={240} y={14} w={300} h={56} lines={['マスター（PID 1）', 'fork・ワーカーの監視・シグナル']} fs={12} fill="box" subTone="muted" />
      <T x={560} y={34} fs={11} tone="muted">
        ソケット tcp://0.0.0.0:3000
      </T>
      <T x={560} y={52} fs={11} tone="muted">
        はワーカーが共有して受け付ける
      </T>
      <Arrow x1={330} y1={70} x2={190} y2={128} />
      <Arrow x1={450} y1={70} x2={590} y2={128} />
      <T x={260} y={100} fs={10.5} tone="muted" mono>
        fork
      </T>
      <T x={500} y={100} fs={10.5} tone="muted" mono>
        fork
      </T>
      {worker(20, 0, 12)}
      {worker(430, 1, 15)}
    </Svg>
  )
}

/* ---------- 図 23-2 GVL と I/O 待ち ---------- */
function GvlFigure() {
  const scale = 0.55 // 1ms あたりの幅
  const x0 = 120
  const bar = (y: number, segs: { s: number; e: number; kind: 'run' | 'io' | 'wait' }[]) =>
    segs.map((g, i) => (
      <rect
        key={i}
        x={x0 + g.s * scale}
        y={y}
        width={(g.e - g.s) * scale}
        height={18}
        rx={3}
        fill={g.kind === 'run' ? 'var(--fig-box5)' : g.kind === 'io' ? 'var(--fig-box4)' : 'none'}
        stroke="var(--fig-line)"
        strokeDasharray={g.kind === 'wait' ? '3 3' : undefined}
      />
    ))
  return (
    <Svg
      id="23-2"
      w={780}
      h={330}
      label="1つのワーカーの3つのスレッドで、DB の待ちが200ms の要求を処理すると、待っている間は GVL を手放すので3件が同時に進み、6件を約425ms で処理した。Ruby の計算が約290ms の要求では、GVL を持っている1つのスレッドしか進めないので、3件を同時に受けると各要求が約680ms かかり、6件で約2.2秒かかった。ワーカーを2つにすると、6件が約0.95秒になった"
    >
      <T x={20} y={20} bold>
        DB の待ち（SELECT SLEEP(0.2)）：待つ間は GVL を手放す
      </T>
      {[0, 1, 2].map((t) => (
        <g key={t}>
          <T x={20} y={46 + t * 26} fs={11} mono>
            {`tp 00${t + 1}`}
          </T>
          {bar(37 + t * 26, [
            { s: 0, e: 8, kind: 'run' },
            { s: 8, e: 200, kind: 'io' },
            { s: 200, e: 210, kind: 'run' },
            { s: 212, e: 220, kind: 'run' },
            { s: 220, e: 412, kind: 'io' },
            { s: 412, e: 422, kind: 'run' },
          ])}
        </g>
      ))}
      <T x={x0 + 440 * scale} y={72} fs={11} tone="muted">
        6件で 425ms
      </T>
      <T x={20} y={140} bold>
        Ruby の計算（約 290ms）：GVL を持つ1つのスレッドだけが進む
      </T>
      {[0, 1, 2].map((t) => (
        <g key={t}>
          <T x={20} y={166 + t * 26} fs={11} mono>
            {`tp 00${t + 1}`}
          </T>
          {bar(157 + t * 26, [0, 1, 2, 3, 4, 5, 6].map((k) => ({ s: k * 100, e: k * 100 + 100, kind: (k % 3 === t ? 'run' : 'wait') as 'run' | 'wait' })).filter((g) => g.s < 680))}
        </g>
      ))}
      <T x={x0 + 700 * scale + 14} y={192} fs={11} tone="muted">
        3件とも約 680ms
      </T>
      <rect x={20} y={252} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={40} y={258} fs={11}>
        Ruby を実行（GVL を持つ）
      </T>
      <rect x={220} y={252} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={240} y={258} fs={11}>
        DB の応答を待つ（GVL を手放す）
      </T>
      <rect x={460} y={252} width={14} height={12} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
      <T x={480} y={258} fs={11}>
        GVL の順番待ち
      </T>
      <T x={20} y={290} fs={11} tone="muted">
        Ruby の計算の6件：1ワーカー × 3スレッドで約 2.2 秒、2ワーカー × 3スレッドで約 0.95 秒（4 CPU のマシン）
      </T>
      <T x={20} y={310} fs={11} tone="muted">
        図の区切り（100ms ごとの交代）は模式的なもの。実際の切り替えの間隔は Ruby の VM が決める
      </T>
    </Svg>
  )
}

/* ---------- 図 23-3 スレッド数と接続数 ---------- */
function ConnFigure() {
  return (
    <Svg
      id="23-3"
      w={780}
      h={260}
      label="データベースの接続は、Puma のワーカーごとに、スレッドの数だけ必要になる。サーバーが2台、ワーカーが4つ、スレッドが3つなら、Puma だけで2×4×3=24本。Sidekiq のプロセスがスレッドを10本持てば10本、ActionCable のワーカープールを使えばさらにその数が加わる。合計を MySQL の max_connections より小さくする"
    >
      <rect x={20} y={20} width={340} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={38} bold fs={12}>
        サーバー × 2
      </T>
      {[0, 1, 2, 3].map((w) => (
        <Box key={w} x={32 + w * 80} y={52} w={72} h={52} lines={[`ワーカー${w}`, 'スレッド 3', '接続 3']} fs={10.5} fill="box" subTone="muted" />
      ))}
      <T x={32} y={130} fs={11.5}>
        Puma：2 台 × 4 ワーカー × 3 スレッド = 24
      </T>
      <T x={32} y={152} fs={10.5} tone="muted">
        （ActionCable を使えば、ワーカーごとにワーカープールの分も加わる）
      </T>
      <Box x={20} y={190} w={340} h={44} lines={['Sidekiq：1 プロセス × concurrency 10 = 10', 'rails console・マイグレーションなども 1 本ずつ']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={360} y1={95} x2={478} y2={120} />
      <Arrow x1={360} y1={212} x2={478} y2={150} />
      <Box x={480} y={100} w={280} h={70} lines={['MySQL', 'max_connections（既定 151）', '24 + 10 + α より大きくする']} fs={12} fill="box4" subTone="muted" />
    </Svg>
  )
}

const ch23: Chapter = {
  number: 23,
  part: 5,
  title: 'Puma とプロセス・スレッド',
  summary:
    'Puma のクラスタモードのプロセスとスレッドの構成を実際に確かめ、GVL のもとでスレッドを増やしたときの効果を I/O 待ちと計算で比べます。ワーカー数・スレッド数・DB の接続数の決め方、preload_app によるメモリーの共有、タイムアウトと phased restart、Executor とスレッド安全性も扱います。',
  goals: [
    'マスター・ワーカー・スレッドの役割と、reactor が要求を読み切ってからスレッドに渡すことを説明できる',
    'GVL のもとで、I/O 待ちの多い処理と計算の多い処理でスレッドの効果が違う理由を説明できる',
    'ワーカー数・スレッド数から、必要な DB の接続数を計算できる',
    'preload_app! によるメモリーの共有と、phased restart と両立しないことを説明できる',
    'Puma の worker_timeout がリクエストのタイムアウトではないことと、再起動の種類を説明できる',
    'クラスに要求ごとの値を入れると別の要求に混ざる理由と、CurrentAttributes の仕組みを説明できる',
  ],
  prerequisites: [8, 15],
  sections: [
    {
      id: 'cluster',
      title: 'クラスタモードの構成',
      body: (
        <>
          <p>
            Puma には1つのプロセスで動くシングルモードと、マスターのプロセスが複数のワーカーのプロセスを作るクラスタモードがあります。<code>workers</code> が1以上ならクラスタモードです。デモのアプリケーションを本番環境の設定で、ワーカー2・スレッド3
            にして起動し、プロセスとスレッドの名前を Linux の /proc から読みました。
          </p>
          <Code
            lang="text"
            code={`
[1] Puma starting in cluster mode...
[1] *  Min threads: 3
[1] *  Max threads: 3
[1] *  Environment: production
[1] *   Master PID: 1
[1] *      Workers: 2
[1] *     Restarts: (✔) hot (✖) phased (✖) refork
[1] * Preloading application
[1] - Worker 0 (PID: 12) booted in 0.0s, phase: 0
[1] - Worker 1 (PID: 15) booted in 0.0s, phase: 0

pid=1  ppid=0 threads=6  puma 8.0.2 (tcp://0.0.0.0:3000) [demo]
pid=12 ppid=1 threads=10 puma: cluster worker 0: 1 [demo]
pid=15 ppid=1 threads=11 puma: cluster worker 1: 1 [demo]

（ワーカー 0 のスレッドの名前）
      1 puma reactor
      1 puma srv
      1 puma srv tp 001
      1 puma srv tp 002
      1 puma srv tp 003
      1 puma srv tp rea
      1 puma stat pld
      1 puma wrkr check
      2 bundle
`}
          />
          <p>
            Puma の説明書によると、マスターは要求を処理せず、シグナルの受け取りとワーカーの起動・停止を受け持ちます
            <Ref n={1} />。ワーカーは同じソケットで接続を受け付けます。ワーカーの中では、reactor のスレッドが HTTP の要求を最後まで読んでから todo の待ち行列に入れ、スレッドプール（
            <code>tp 001</code>〜<code>tp 003</code>）のスレッドが取り出して Rails を実行します（図 23-1）。要求の受信は reactor が受け持ちますが、応答の書き込みは Rails を実行したスレッドがそのまま行います。応答を受け取るのが遅いクライアントがいると、その間スレッドがふさがるので、前段の
            Nginx に応答を受け取らせます（<ChapterLink n={24} />
            ）。
          </p>
          <p>コントロールサーバーの <code>/stats</code> では、ワーカーごとのスレッドの使用状況が見られます。</p>
          <Code
            lang="json"
            code={`
{"workers":2,"phase":0,"booted_workers":2,
 "worker_status":[
  {"pid":12,"index":0,"booted":true,"last_status":{"backlog":0,"running":3,"pool_capacity":3,"busy_threads":0,"max_threads":3,"requests_count":0}},
  {"pid":15,"index":1,"booted":true,"last_status":{"backlog":0,"running":3,"pool_capacity":3,"busy_threads":0,"max_threads":3,"requests_count":1}}]}
`}
          />
          <p>
            <code>backlog</code> は、スレッドの空きを待っている要求の数です。これが常に0より大きいなら、スレッドかワーカーが足りていません。
          </p>
          <Figure n="23-1" title="プロセスとスレッドの構成" caption="Puma 8.0.2（ワーカー2・スレッド3）での実測と、Puma の docs/architecture.md をもとにした模式図。">
            <ClusterFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'gvl',
      title: 'GVL と I/O 待ち',
      body: (
        <>
          <p>
            CRuby には <Term en="Global VM Lock">GVL</Term> があり、1つのプロセスの中で Ruby のコードを実行できるスレッドは同時に1つだけです。DB やネットワークの応答を待つ間はスレッドが GVL
            を手放すので、その間に別のスレッドが進めます
            <Ref n={2} />。デモに、DB で 0.2 秒待つアクション（<code>SELECT SLEEP(0.2)</code>）と、Ruby で計算するアクションを用意し、ワーカー1・スレッド3 に同時に要求を送りました。
          </p>
          <Code
            lang="text"
            code={`
== DB の待ち（/lab/io）を 6 件同時
io pid=12 tid=9432 201ms   io pid=12 tid=9432 202ms
io pid=12 tid=9512 201ms   io pid=12 tid=9512 201ms
io pid=12 tid=9560 201ms   io pid=12 tid=9560 202ms
全体: 425ms

== Ruby の計算（/lab/cpu）。1 件だけなら 286ms
（3 件同時）  cpu … 697ms   cpu … 679ms   cpu … 665ms        全体: 879ms
（6 件同時）  cpu … 698ms  994ms  1030ms  698ms  690ms  806ms  全体: 2212ms

== ワーカー 2・スレッド 3 で Ruby の計算を 6 件同時
cpu pid=12 … 428ms  430ms  307ms   cpu pid=16 … 529ms  520ms  622ms   全体: 948ms
`}
          />
          <p>
            DB の待ちは3つのスレッドで同時に進み、6件が2回分（約 0.4 秒）で終わりました。Ruby の計算は、3件を同時に受けると1件あたりの時間が 286ms から約 680ms に延び、全体の時間は1件ずつ処理するのとほとんど変わりません。スレッドを増やしても計算は速くならず、1件ごとの応答が遅くなるだけです（図
            23-2）。ワーカー（プロセス）を2つにすると、別の CPU で並行して計算できるので、6件の全体の時間がほぼ半分になりました。
          </p>
          <p>
            Rails のガイドは、N+1 や遅い SQL の無いアプリケーションの I/O 待ちは処理時間の50%を超えないことが多く、プロセスあたり3スレッドを超えても効果は少ないとしています
            <Ref n={2} />。外部の API を同期的に呼ぶアプリケーションのように I/O 待ちが長い場合は、スレッドを増やす効果があります。
          </p>
          <Figure n="23-2" title="GVL と I/O 待ち" caption="ワーカー1・スレッド3（4 CPU のマシン上の Docker）での実測値をもとにした模式図。">
            <GvlFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'sizing',
      title: 'ワーカー数・スレッド数・DB の接続数',
      body: (
        <>
          <p>Rails 8.1 の rails new が作る config/puma.rb は、スレッドの数だけを決め、ワーカーの数は環境変数に任せています。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/generators/rails/app/templates/config/puma.rb.tt（コメントを除く）"
            href={`${GH}/railties/lib/rails/generators/rails/app/templates/config/puma.rb.tt`}
            code={`
threads_count = ENV.fetch("RAILS_MAX_THREADS", 3)
threads threads_count, threads_count
port ENV.fetch("PORT", 3000)
plugin :tmp_restart
pidfile ENV["PIDFILE"] if ENV["PIDFILE"]
`}
          />
          <p>
            ワーカーの数は、Puma 自身が環境変数 <code>WEB_CONCURRENCY</code> を読んで決めます（configuration.rb の <code>puma_options_from_env</code>）。設定が無ければ0で、シングルモードになります。Puma
            の説明書は、ワーカーの数を CPU のコア数に合わせ（<code>workers :auto</code>）、スレッドの数は同時に処理したい要求の数をワーカーの数で割った値にするよう勧めています
            <Ref n={3} />。Puma 自身のスレッドの既定値は5ですが、Rails のテンプレートは上のガイドの考え方に沿って3にしています。
          </p>
          <p>
            ワーカーはそれぞれ別のプロセスなので、ActiveRecord の接続プールもワーカーごとにあります（<ChapterLink n={15} section="pool" />
            ）。デモで <code>/lab/info</code> を見ると、プールの大きさ（max_connections）は RAILS_MAX_THREADS と同じ3でした。ワーカー2・スレッド3 で DB を使う要求を12件同時に処理した後、MySQL
            の接続を数えました。
          </p>
          <Code
            lang="text"
            code={`
接続数（要求の前）: 2
接続数（12 件を同時に処理した後）: 6      ← 2 ワーカー × 3 スレッド
      6 172.29.0.3                      ← すべて Puma のコンテナから
`}
          />
          <p>
            接続は、使われた時点で作られ、プールに残ります。必要な接続の数は、Puma のサーバーの台数 × ワーカー数 × スレッド数に、Sidekiq の concurrency、ActionCable のワーカープール（
            <ChapterLink n={17} section="actioncable" />
            ）などを足した数です（図 23-3）。ActionCable のワーカーは同じプロセスの接続プールを Puma のスレッドと共有するので、チャネルの処理で DB を使うなら、プロセスの max_connections をスレッド数とワーカープールの数の合計以上にします。Solid Cache・Solid Queue・Solid Cable を別のデータベースに置く構成では、それぞれのデータベースの接続も別に数えます。この合計が MySQL の <code>max_connections</code>（デモの MySQL 8.4 では既定値の 151）を超えないようにします。サーバーを増やすときは、この合計も増えることに注意します。
          </p>
          <Figure n="23-3" title="スレッド数と接続数" caption="ワーカーごとに接続プールを持つこと（デモでの実測）をもとにした計算の例。台数・ワーカー数などの値は例。">
            <ConnFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'preload',
      title: 'preload_app! とコピーオンライト',
      body: (
        <>
          <p>
            <code>preload_app!</code> を指定すると、マスターがアプリケーションを読み込んでからワーカーを fork します。fork した直後のワーカーは、マスターのメモリーをそのまま共有し、書き換えたページだけが複製されます（
            <Term en="copy-on-write">コピーオンライト</Term>）。Puma 8 では、ワーカーが2つ以上なら既定で有効です
            <Ref n={4} />。デモで、20回要求した後の各プロセスのメモリー（/proc の smaps_rollup）を比べました。
          </p>
          <Code
            lang="text"
            code={`
== preload_app! あり（2 ワーカー）
puma 8.0.2 (tcp://0.0.0.0:3000)   Rss=112MB Pss=63MB  Shared=75MB Private=37MB
puma: cluster worker 0             Rss=111MB Pss=62MB  Shared=75MB Private=36MB
puma: cluster worker 1             Rss=115MB Pss=71MB  Shared=66MB Private=49MB
== preload_app! なし（2 ワーカー）
puma 8.0.2 (tcp://0.0.0.0:3000)   Rss=33MB  Pss=21MB  Shared=16MB Private=16MB
puma: cluster worker 0             Rss=116MB Pss=102MB Shared=22MB Private=94MB
puma: cluster worker 1             Rss=114MB Pss=100MB Shared=22MB Private=92MB
`}
          />
          <p>
            Pss は、共有しているページをプロセスの数で割って配分した値です。preload ありでは、ワーカーの Private（そのプロセスだけが使うメモリー）が 36〜49MB で、合計の Pss は約 196MB でした。preload
            なしでは各ワーカーが自分でアプリケーションを読み込むので、Private が約 93MB になり、合計は約 223MB でした。ワーカーが多いほど差が大きくなります。
          </p>
          <p>
            fork の前にマスターで開いた DB の接続をワーカーがそのまま使うと、複数のプロセスが1本の接続を共有し、正常に使えなくなります。ActiveRecord は fork を検知して、ワーカーの側で接続プールを捨てて作り直します
            <Ref n={5} />。Redis などの接続を自分で開いている場合は、<code>before_worker_boot</code> で開き直します。デモの設定ファイルにも、このフックで PID を出力する行を書きました。
          </p>
          <p>起動時の表示の <code>Restarts: (✖) phased</code> のとおり、preload_app! は次節の phased restart と両立しません。</p>
        </>
      ),
    },
    {
      id: 'restart-timeout',
      title: 'タイムアウトと再起動',
      body: (
        <>
          <p>Puma にはいくつかのタイムアウトがありますが、どれも1件の要求の処理時間を制限するものではありません。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>設定</th>
                  <th>既定値</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>worker_timeout</code>
                  </td>
                  <td>60 秒</td>
                  <td>ワーカーがマスターに状態を知らせなくなったら作り直す。応答の無いプロセスへの対策で、遅い要求は止めない</td>
                </tr>
                <tr>
                  <td>
                    <code>first_data_timeout</code>
                  </td>
                  <td>30 秒</td>
                  <td>接続してから最初のデータが届くまで待つ時間</td>
                </tr>
                <tr>
                  <td>
                    <code>persistent_timeout</code>
                  </td>
                  <td>65 秒</td>
                  <td>keep-alive の接続で、次の要求を待つ時間</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            worker_timeout について、Puma の dsl.rb のコメントは「リクエストのタイムアウトではなく、応答の無いプロセスを守るためのもの」と書いています
            <Ref n={4} />。遅い要求を打ち切るのは、前段の Nginx や ALB のタイムアウトです（<ChapterLink n={25} />
            ）。ただし、前段が接続を切っても、Puma のスレッドは Rails の処理を最後まで続けます。persistent_timeout と前段の keep-alive の関係も第25章で扱います。
          </p>
          <p>
            デプロイで新しいコードに切り替える方法には、hot restart（SIGUSR2。プロセス全体を exec し直す）と phased restart（SIGUSR1。ワーカーを1つずつ入れ替える）があります
            <Ref n={6} />。preload なしで起動し、0.05 秒ごとに要求を送りながら SIGUSR1 を送りました。
          </p>
          <Code
            lang="text"
            code={`
[1] - Starting phased worker restart, phase: 1
[1] - Stopping 11 for phased upgrade...
[lab] before_worker_boot index=0 pid=56
[1] - Worker 0 (PID: 56) booted in 0.62s, phase: 1
[1] - Stopping 15 for phased upgrade...
[lab] before_worker_boot index=1 pid=68
[1] - Worker 1 (PID: 68) booted in 0.59s, phase: 1
再起動中の要求: 200=219 それ以外=0
`}
          />
          <p>
            ワーカーが1つずつ止められ、新しいワーカーが起動してから次のワーカーが止められました。その間の219件の要求はすべて成功しています。入れ替えの途中では、古いコードと新しいコードのワーカーが同時に動きます。DB
            のマイグレーションで列を消すような変更は、両方のコードで動くように段階を分けて行います。
          </p>
        </>
      ),
    },
    {
      id: 'thread-safety',
      title: 'Executor とスレッド安全性',
      body: (
        <>
          <p>
            同じワーカーの3つのスレッドは、クラスやグローバルな変数を共有します。要求ごとの値をクラスに入れると、別の要求の値と混ざります。デモで、利用者の名前をクラスの属性と <code>Current</code>（ActiveSupport::CurrentAttributes）の両方に入れ、0.1
            秒待ってから返すアクションに、3人分の要求を同時に送りました。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/lab_controller.rb（デモ、抜粋）"
            code={`
class LabController < ApplicationController
  class << self
    attr_accessor :last_user # 悪い例：クラスに要求ごとの値を入れる
  end

  def leak
    self.class.last_user = params[:u]
    Current.user_name = params[:u]
    sleep 0.1
    render plain: "u=#{params[:u]} class_var=#{self.class.last_user} current=#{Current.user_name}\\n"
  end
end
`}
          />
          <Code
            lang="text"
            code={`
u=alice class_var=carol current=alice
u=bob class_var=carol current=bob
u=carol class_var=carol current=carol
`}
          />
          <p>
            クラスの属性は最後に書いた carol で上書きされ、alice と bob の応答に carol が出ました。ログインした利用者の情報で起きれば、他人のデータを表示する事故になります。開発環境でもスレッドは3つあるので起こりえますが、同時に要求を送らないと気づきにくい問題です。
          </p>
          <p>
            CurrentAttributes の値はスレッド（正確には実行の単位）ごとに分かれていて、混ざりませんでした。さらに、Rails の Executor（<ChapterLink n={8} section="executor" />
            ）は要求の処理が終わるたびに値を消すので、次の要求に持ち越されません
            <Ref n={7} />。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/railtie.rb（49〜65行目）"
            href={`${GH}/activesupport/lib/active_support/railtie.rb#L49-L65`}
            code={`
    initializer "active_support.reset_execution_context" do |app|
      app.reloader.before_class_unload do
        ActiveSupport::CurrentAttributes.clear_all
        ActiveSupport::ExecutionContext.flush
        ActiveSupport.event_reporter.clear_context
      end

      app.executor.to_run do
        ActiveSupport::ExecutionContext.push
      end

      app.executor.to_complete do
        ActiveSupport::CurrentAttributes.clear_all
        ActiveSupport::ExecutionContext.pop
        ActiveSupport.event_reporter.clear_context
      end
    end
`}
          />
          <p>
            クラスのレベルで <code>@cache ||= …</code> のようにメモ化する書き方も、初回に複数のスレッドが同時に計算する可能性があります。結果が同じなら害はありませんが、配列や Hash
            を少しずつ書き換える場合は Mutex で同時の書き換えを防ぐか、起動時に作っておきます。DB の接続はスレッドごとにプールから借りるので（<ChapterLink n={15} section="pool" />
            ）、ActiveRecord を普通に使う範囲では、スレッドの間で接続が混ざることはありません。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 の rails new が作る config/puma.rb も同じ内容（スレッド3、ワーカーは WEB_CONCURRENCY）です。Puma は Rails とは別の gem なので、この章の Puma の挙動は Puma
              のバージョンで決まります。業務のアプリケーションでは Gemfile.lock の puma のバージョンを確かめ、そのバージョンの説明書を読みます。
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
          <li>クラスタモードでは、マスターがワーカーを fork して監視し、ワーカーの reactor が要求を読み切ってから、スレッドプールのスレッドが Rails を実行して応答を書き込みます。</li>
          <li>GVL のため、Ruby の計算はスレッドを増やしても速くならず、1件ごとの応答が遅くなります。I/O 待ちの間だけ他のスレッドが進めます。並行して計算するにはワーカーを増やします。</li>
          <li>DB の接続はワーカーごとにスレッドの数だけ必要で、合計は台数 × ワーカー数 × スレッド数に Sidekiq などを足した数になります。</li>
          <li>preload_app! はワーカーの間でメモリーを共有させます（ワーカーが2つ以上なら既定で有効）。phased restart とは両立しません。</li>
          <li>Puma の worker_timeout は要求のタイムアウトではありません。遅い要求は前段のタイムアウトで打ち切られますが、Rails の処理は続きます。</li>
          <li>クラスやグローバルな変数に要求ごとの値を入れると、別の要求に混ざります。要求ごとの値は CurrentAttributes に入れ、Executor が要求の終わりに消します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Puma: docs/architecture.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/architecture.md`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'マスターとワーカーの役割、reactor が要求を読み切って todo に入れること、応答の書き込みに別のスレッドを使わないこと。' },
    { title: 'Tuning Performance for Deployment', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/tuning_performance_for_deployment.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'GVL と I/O 待ち、I/O 待ちが50%以下なら3スレッドを超えても効果が少ないこと、プロセスによる並列性とコピーオンライト。' },
    { title: 'Puma: docs/deployment.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/deployment.md`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'クラスタモードの勧め、workers :auto、スレッド数の決め方、ワーカー数とメモリー、X-Request-Start による待ち時間の計測。' },
    { title: 'Puma: lib/puma/dsl.rb・configuration.rb', publisher: 'puma/puma（GitHub）', url: `${PM}/lib/puma/dsl.rb`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'preload_app! の既定値（ワーカー2以上で true）、worker_timeout がリクエストのタイムアウトではないこと、各タイムアウトの既定値、WEB_CONCURRENCY の読み取り。' },
    { title: 'activerecord/lib/active_record/connection_adapters/pool_config.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/pool_config.rb#L83`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ForkTracker の after_fork で接続プールを捨てること。' },
    { title: 'Puma: docs/restart.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/restart.md`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'hot restart（SIGUSR2）と phased restart（SIGUSR1）、phased restart の条件（preload_app! を無効に）と、新旧のコードが同時に動くこと。' },
    { title: 'Threading and Code Execution in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/threading_and_code_execution.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Executor が要求の前後で行う処理と、スレッドの間で共有される状態。' },
  ],
}

export default withExplanations(ch23, explanation23)
