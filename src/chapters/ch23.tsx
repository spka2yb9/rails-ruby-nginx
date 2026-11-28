import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation23 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { PumaRestartFigure } from '../visuals/deployment-figures'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const PM = 'https://github.com/puma/puma/blob/v8.0.2'

/* ---------- 図 39-3 プロセスとスレッドの構成 ---------- */
function ClusterFigure() {
  const worker = (x: number, i: number, pid: number) => (
    <g key={i}>
      <rect x={x} y={130} width={330} height={190} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={x + 12} y={148} bold fs={12}>
        {`ワーカー ${i}（PID ${pid}）`}
      </T>
      <Box x={x + 12} y={160} w={140} h={40} lines={['puma reactor', '受信待ちの接続を預かる']} fs={12} mono fill="box" subTone="muted" />
      <Arrow x1={x + 152} y1={180} x2={x + 176} y2={180} />
      <Box x={x + 178} y={160} w={140} h={40} lines={['todo（待ち行列）', 'backlog']} fs={12} fill="box4" subTone="muted" />
      {[0, 1, 2].map((t) => (
        <Box key={t} x={x + 12 + t * 106} y={220} w={96} h={40} lines={[`tp 00${t + 1}`, 'Rails を実行']} fs={12} mono fill="box5" subTone="muted" />
      ))}
      <Arrow x1={x + 248} y1={200} x2={x + 165} y2={218} />
      <Arrow x1={x + 60} y1={218} x2={x + 60} y2={202} dashed />
      <T x={x + 12} y={284} fs={11.5} tone="muted">
        接続プール（max_connections = 3）
      </T>
      <T x={x + 12} y={302} fs={11.5} tone="muted">
        応答の書き込みもスレッドが行う
      </T>
    </g>
  )
  return (
    <Svg
      id="39-3"
      w={780}
      h={340}
      label="Puma のクラスタモードでは、マスターのプロセスがソケットを開いてワーカーのプロセスを fork する。マスターは要求を処理せず、ワーカーの監視とシグナルの処理をする。各ワーカーでは、新しく受け付けた接続が todo の待ち行列に入る。スレッドがすぐに要求を読み切れなければ reactor に預け、受信が済むと再び待ち行列に入る。準備ができた要求ではスレッドが Rails を実行し、応答も書き込む。ワーカーはそれぞれ接続プールを持つ"
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
      {worker(20, 0, 12)}
      {worker(430, 1, 15)}
    </Svg>
  )
}

/* ---------- 図 39-4 GVL と I/O 待ち ---------- */
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
      id="39-4"
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

/* ---------- 図 39-5 スレッド数と接続数 ---------- */
function ConnFigure() {
  return (
    <Svg
      id="39-5"
      w={780}
      h={260}
      label="Puma 用のサーバーは2台で、各台に4ワーカーある。各ワーカーのプール上限が3本なら Web 用の最大接続数は24本。この例の Sidekiq 用プール上限は10本。ほかの作業に使う分も含めて、MySQL の接続上限に収まるかを確かめる"
    >
      <rect x={20} y={20} width={340} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={38} bold fs={12}>
        サーバー × 2
      </T>
      {[0, 1, 2, 3].map((w) => (
        <Box key={w} x={32 + w * 80} y={52} w={72} h={52} lines={[`ワーカー${w}`, 'スレッド 3', '接続 3']} fs={12} fill="box" subTone="muted" />
      ))}
      <T x={32} y={130} fs={11.5}>
        Puma：2 台 × 4 ワーカー × 3 スレッド = 24
      </T>
      <T x={32} y={152} fs={11.5} tone="muted">
        この例は各ワーカーの DB 接続プールを上限3本に設定
      </T>
      <Box x={20} y={190} w={340} h={44} lines={['Sidekiq：1 プロセス × concurrency 10 = 10', 'rails console・マイグレーションなども 1 本ずつ']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={360} y1={95} x2={478} y2={120} />
      <Arrow x1={360} y1={212} x2={478} y2={150} />
      <Box x={480} y={100} w={280} h={70} lines={['MySQL', 'max_connections（既定 151）', '24 + 10 + α より大きくする']} fs={12} fill="box4" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 39-1 プロセスとスレッドのメモリー ---------- */
function MemoryFigure() {
  return (
    <Svg
      id="39-1"
      w={780}
      h={290}
      label="左は fork で作った2つのプロセス。親プロセスと子プロセスはそれぞれ自分のメモリーを持ち、子プロセスが count を1にしても親プロセスの count は0のまま。右は1つのプロセスの中の3本のスレッド。3本とも同じメモリーを読み書きするので、1本が count を書き換えると、ほかのスレッドからも新しい値が見える"
    >
      <T x={20} y={22} bold>
        fork で作った2つのプロセス
      </T>
      <rect x={20} y={40} width={150} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={60} fs={12} bold>
        親プロセス（PID 9）
      </T>
      <Box x={32} y={100} w={126} h={60} lines={['メモリー', 'count = 0']} fs={12} fill="box4" subTone="muted" />
      <rect x={220} y={40} width={150} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={232} y={60} fs={12} bold>
        子プロセス（PID 11）
      </T>
      <Box x={232} y={100} w={126} h={60} lines={['メモリー', 'count = 1']} fs={12} fill="box4" subTone="muted" accent />
      <Arrow x1={170} y1={80} x2={218} y2={80} />
      <T x={175} y={74} fs={10.5} tone="muted" mono>
        fork
      </T>
      <T x={20} y={214} fs={11.5}>
        メモリーはプロセスごとに別々
      </T>
      <T x={20} y={234} fs={11.5}>
        子が書き換えても、親の count は 0 のまま
      </T>

      <T x={410} y={22} bold>
        1つのプロセスの3本のスレッド
      </T>
      <rect x={410} y={40} width={350} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={422} y={60} fs={12} bold>
        プロセス（PID 31）
      </T>
      <Box x={430} y={72} w={310} h={46} lines={['共有のメモリー', 'count・クラス・オブジェクト']} fs={12} fill="box4" subTone="muted" />
      {['メインスレッド', 'スレッド 1', 'スレッド 2'].map((name, i) => (
        <g key={name}>
          <Box x={430 + i * 108} y={142} w={94} h={34} lines={name} fs={11} fill="box5" />
          <Arrow x1={477 + i * 108} y1={140} x2={477 + i * 108} y2={120} both />
        </g>
      ))}
      <T x={410} y={214} fs={11.5}>
        メモリーはスレッドの間で共通
      </T>
      <T x={410} y={234} fs={11.5}>
        1本が書き換えると、ほかのスレッドからも見える
      </T>
      <T x={20} y={270} fs={11} tone="muted">
        プロセスを増やすとメモリーが増え、Ruby の計算も同時に進む。スレッドを増やしてもメモリーはあまり増えないが、Ruby の計算は同時に1本だけ
      </T>
    </Svg>
  )
}

/* ---------- 図 39-2 Puma と Rails の分担 ---------- */
function ServerRoleFigure() {
  return (
    <Svg
      id="39-2"
      w={780}
      h={210}
      label="ブラウザーが HTTP の要求を送ると、Puma が受け取り、空いているスレッドで Rails のアプリケーションを呼ぶ。Rails は応答の状態・ヘッダー・本文を作って Puma に返し、Puma がそれをブラウザーに送り返す"
    >
      <Box x={20} y={70} w={130} h={60} lines={['ブラウザー', '（curl など）']} fs={12} fill="box" subTone="muted" />
      <Box x={290} y={30} w={210} h={140} lines={['Puma', 'ポート 3000 で待つ', '要求を受け取る', '空いたスレッドに渡す', '応答を送り返す']} fs={12} bold fill="box" subTone="muted" />
      <Box x={600} y={70} w={160} h={60} lines={['Rails のアプリ', '応答の内容を作る']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={150} y1={88} x2={288} y2={88} />
      <T x={160} y={80} fs={10.5} tone="muted" mono>
        GET /articles
      </T>
      <Arrow x1={288} y1={118} x2={150} y2={118} />
      <T x={160} y={140} fs={10.5} tone="muted">
        200 OK と HTML
      </T>
      <Arrow x1={500} y1={88} x2={598} y2={88} />
      <T x={508} y={80} fs={10.5} tone="muted">
        要求の内容
      </T>
      <Arrow x1={598} y1={118} x2={500} y2={118} />
      <T x={508} y={140} fs={10.5} tone="muted">
        状態・ヘッダー・本文
      </T>
      <T x={20} y={198} fs={11} tone="muted">
        ネットワークとのやり取りは Puma、要求に応じた処理は Rails が受け持つ
      </T>
    </Svg>
  )
}

/* ---------- 図 39-6 Puma の再起動方式 ---------- */
function RestartFigure() {
  return (
    <Svg
      id="39-6"
      w={780}
      h={206}
      label="2ワーカー構成の模式図。hot restart では旧ワーカーの処理を終えてから、待受ソケットを引き継いでマスターを exec し、新ワーカーを起動する。phased restart では同じマスターがワーカーを1つずつ入れ替える。途中は旧版と新版のワーカーが同時に要求を処理する"
    >
      <T x={253} y={21} anchor="middle" bold>再起動前</T>
      <T x={454} y={21} anchor="middle" bold>切り替え中</T>
      <T x={655} y={21} anchor="middle" bold>再起動後</T>

      <T x={16} y={73} bold mono>hot restart</T>
      <Box x={165} y={39} w={176} h={70} lines={['マスターと旧ワーカー', '要求を処理']} fill="box" subTone="muted" />
      <Arrow x1={341} y1={74} x2={364} y2={74} />
      <Box x={366} y={39} w={176} h={70} lines={['待受ソケットを引き継ぐ', 'マスターの exec と', '新ワーカーの起動']} fill="box4" subTone="muted" />
      <Arrow x1={542} y1={74} x2={565} y2={74} />
      <Box x={567} y={39} w={176} h={70} lines={['exec 後のマスター', '新ワーカーが処理']} fill="box5" subTone="muted" />

      <T x={16} y={158} bold mono>phased restart</T>
      <Box x={165} y={123} w={176} h={70} lines={['マスター', '旧ワーカー × 2']} fill="box" subTone="muted" />
      <Arrow x1={341} y1={158} x2={364} y2={158} />
      <Box x={366} y={123} w={176} h={70} lines={['同じマスター', '新ワーカー × 1', '旧ワーカー × 1']} fill="box4" subTone="muted" />
      <Arrow x1={542} y1={158} x2={565} y2={158} />
      <Box x={567} y={123} w={176} h={70} lines={['同じマスター', '新ワーカー × 2']} fill="box5" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 39-7 Nginx で転送先を切り替える ---------- */
function RuntimeSwitchFigure() {
  return (
    <Svg
      id="39-7"
      w={720}
      h={208}
      label="1台のサーバーで旧 Ruby の Puma をポート3000、新 Ruby の Puma をポート3001で起動する。最初は Nginx が新しい要求を3000へ送り、3001の応答は直接確認する。Nginx の設定を再読み込みすると、新しい要求は3001へ向かう。旧 Puma は処理中の接続と切り戻しのために残す"
    >
      <T x={178} y={21} anchor="middle" bold>新しい Puma の起動確認</T>
      <T x={542} y={21} anchor="middle" bold>Nginx の reload 後</T>

      <Box x={88} y={40} w={180} h={58} lines={['Nginx', '新しい要求を転送']} fill="box" subTone="muted" />
      <Box x={14} y={125} w={156} h={65} lines={['旧 Ruby の Puma', '127.0.0.1:3000']} fill="box5" subTone="muted" />
      <Box x={186} y={125} w={156} h={65} lines={['新 Ruby の Puma', '127.0.0.1:3001']} fill="box" subTone="muted" />
      <Arrow x1={151} y1={98} x2={92} y2={123} accent />

      <Box x={452} y={40} w={180} h={58} lines={['Nginx', '新しい要求を転送']} fill="box" subTone="muted" />
      <Box x={378} y={125} w={156} h={65} lines={['旧 Ruby の Puma', '127.0.0.1:3000', '処理中の接続と切り戻し']} fill="box" subTone="muted" />
      <Box x={550} y={125} w={156} h={65} lines={['新 Ruby の Puma', '127.0.0.1:3001']} fill="box5" subTone="muted" />
      <Arrow x1={569} y1={98} x2={628} y2={123} accent />
    </Svg>
  )
}

/* ---------- preload_app! の有無とメモリー（番号なし） ---------- */
function PreloadMemoryFigure() {
  const scale = 4.8 // 1MB あたりの幅
  const x0 = 110
  const groups = [
    {
      title: 'preload_app! あり（2 ワーカー）',
      pss: 'Pss の合計 約 196MB',
      rows: [
        { name: 'マスター', shared: 75, priv: 37, rss: 112 },
        { name: 'ワーカー 0', shared: 75, priv: 36, rss: 111 },
        { name: 'ワーカー 1', shared: 66, priv: 49, rss: 115 },
      ],
    },
    {
      title: 'preload_app! なし（2 ワーカー）',
      pss: 'Pss の合計 約 223MB',
      rows: [
        { name: 'マスター', shared: 16, priv: 16, rss: 33 },
        { name: 'ワーカー 0', shared: 22, priv: 94, rss: 116 },
        { name: 'ワーカー 1', shared: 22, priv: 92, rss: 114 },
      ],
    },
  ]
  return (
    <Svg
      id="ch23-preload-memory"
      w={780}
      h={300}
      label="preload_app! ありでは、マスターと2つのワーカーがそれぞれ66〜75MBを共有し、各ワーカーだけが使うメモリーは36MBと49MB。preload_app! なしでは、マスターは33MBで、2つのワーカーがそれぞれ自分でアプリケーションを読み込むため、各ワーカーだけが使うメモリーが94MBと92MBになる。Pss の合計は、ありで約196MB、なしで約223MB"
    >
      {groups.map((g, gi) => {
        const top = gi * 130
        return (
          <g key={g.title}>
            <T x={20} y={top + 20} bold>
              {g.title}
            </T>
            <T x={737} y={top + 20} anchor="end" fs={12} tone="muted">
              {g.pss}
            </T>
            {g.rows.map((r, ri) => {
              const y = top + 36 + ri * 30
              return (
                <g key={r.name}>
                  <T x={20} y={y + 12} fs={12}>
                    {r.name}
                  </T>
                  <Box x={x0} y={y} w={r.shared * scale} h={24} lines={`Shared ${r.shared}`} fs={12} fill="box4" rx={3} />
                  <Box x={x0 + r.shared * scale} y={y} w={r.priv * scale} h={24} lines={`Private ${r.priv}`} fs={12} fill="box5" rx={3} />
                  <T x={x0 + (r.shared + r.priv) * scale + 8} y={y + 12} fs={11.5} tone="muted">
                    {`Rss ${r.rss}MB`}
                  </T>
                </g>
              )
            })}
          </g>
        )
      })}
      <rect x={20} y={264} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={40} y={270} fs={11.5}>
        Shared：ほかのプロセスと共有しているページ
      </T>
      <rect x={390} y={264} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={410} y={270} fs={11.5}>
        Private：そのプロセスだけが使うページ
      </T>
    </Svg>
  )
}

/* ---------- クラスの属性に入れた値が混ざる順序（番号なし） ---------- */
function ClassAttrRaceFigure() {
  const reqs = [
    { u: 'alice', tp: 'tp 001' },
    { u: 'bob', tp: 'tp 002' },
    { u: 'carol', tp: 'tp 003' },
  ]
  return (
    <Svg
      id="ch23-class-attr-race"
      w={780}
      h={250}
      label="同じワーカーの3本のスレッドが、alice、bob、carol の要求を同時に処理する。各スレッドは自分の名前をクラスの属性 last_user と Current に代入し、0.1秒待ってから render で読む。待っている間にほかのスレッドが last_user を書き換え、最後に代入した carol が残るので、3件の応答とも class_var は carol になる。Current はスレッドごとに分かれているので、各応答の current は自分の名前になる"
    >
      <T x={20} y={20} fs={12} tone="muted">
        時間の流れ
      </T>
      <Arrow x1={160} y1={20} x2={540} y2={20} />
      <T x={564} y={20} fs={12} tone="muted">
        render で返す値
      </T>
      {reqs.map((r, i) => {
        const y = 40 + i * 50
        const wx = 160 + i * 100
        return (
          <g key={r.u}>
            <T x={20} y={y + 10} fs={12} mono>
              {`u=${r.u}`}
            </T>
            <T x={20} y={y + 27} fs={11.5} tone="muted">
              {`スレッド ${r.tp}`}
            </T>
            <Box x={wx} y={y} w={92} h={36} lines={`${r.u} を代入`} fs={12} fill="box" />
            <rect x={wx + 92} y={y + 9} width={556 - wx - 92} height={18} rx={3} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
            <T x={(wx + 92 + 556) / 2} y={y + 18} anchor="middle" fs={11.5} mono tone="muted">
              sleep 0.1
            </T>
            <rect x={564} y={y} width={200} height={36} rx={6} fill="var(--fig-box)" stroke="var(--fig-line)" />
            <T x={576} y={y + 11} fs={12} mono tone={r.u === 'carol' ? undefined : 'danger'}>
              class_var=carol
            </T>
            <T x={576} y={y + 26} fs={12} mono>
              {`current=${r.u}`}
            </T>
            <Arrow x1={wx + 46} y1={y + 36} x2={wx + 46} y2={194} />
          </g>
        )
      })}
      <T x={20} y={206} fs={12} mono bold>
        last_user
      </T>
      <T x={20} y={224} fs={11.5} tone="muted">
        クラスに1つ
      </T>
      <Box x={206} y={196} w={100} h={40} lines="alice" fs={12} fill="box4" />
      <Box x={306} y={196} w={100} h={40} lines="bob" fs={12} fill="box4" />
      <Box x={406} y={196} w={358} h={40} lines={['carol', '3つの render が読む値']} fs={12} fill="box5" subTone="muted" accent />
    </Svg>
  )
}

const ch23: Chapter = {
  number: 23,
  part: 5,
  title: 'Puma とプロセス・スレッド',
  summary:
    '3人が同時に記事を開くと、Puma のどこで要求を受け、どこで空きを待つのでしょうか。小さな Ruby プログラムでプロセスとスレッドの違いを確かめ、Puma の設定と DB の接続数を読みます。',
  goals: [
    'プロセスを増やす場合と、同じプロセスでスレッドを増やす場合で、何を共有するかを説明できる',
    '処理が DB の応答を待つ場合と Ruby で計算を続ける場合を実測で比べられる',
    'ワーカー数と接続プールの設定から、アプリが使う DB 接続数の上限を見積もれる',
    '再起動の方法ごとに、どのプロセスが新しいコードや Ruby を読み込むかを判断できる',
  ],
  prerequisites: [8, 15],
  sections: [
    {
      id: 'process',
      title: 'プロセスとメモリー',
      body: (
        <>
          <p>
            プログラムはファイルに書いた命令の集まりです。<code>ruby hello.rb</code> のように実行すると、OS（Linux や macOS）はそのプログラム用のメモリーを用意し、命令を順に実行し始めます。実行中のプログラムを
            <Term en="process">プロセス</Term>と呼びます。同じ hello.rb を2回実行すれば、プロセスが2つできます。OS はプロセスごとに PID（プロセス ID）という番号を付けて区別します。
          </p>
          <p>
            Ruby の変数やオブジェクトはそのプロセスのメモリーに置かれます。メモリーはプロセスごとに分かれているので、あるプロセスで変数を書き換えても、別のプロセスの変数は変わりません。Ruby の <code>fork</code>{' '}
            で確かめます。fork は実行中のプロセスを複製して新しいプロセスを作るメソッドです。作られたほうを子プロセス、元のほうを親プロセスと呼びます。fork に渡したブロックは、子プロセスだけが実行します
            <Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="process.rb"
            code={`
puts "親プロセスの PID: #{Process.pid}"
count = 0

pid = fork do
  count += 1
  puts "子プロセスの PID: #{Process.pid}（親の PID: #{Process.ppid}） count = #{count}"
end

Process.wait(pid)
puts "親プロセスで見た count = #{count}"
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
親プロセスの PID: 9
子プロセスの PID: 11（親の PID: 9） count = 1
親プロセスで見た count = 0
`}
          />
          <p>
            子プロセスは、fork した時点の親プロセスのメモリーの内容（<code>count = 0</code>）を受け継いで始まります。子プロセスが count を1にしても、親プロセスの count は0のままでした。
            <code>Process.wait</code> は子プロセスが終わるまで親プロセスを待たせるメソッドです。
          </p>
          <p>
            メモリーが分かれていることには、利点と欠点があります。1つのプロセスが異常終了しても、ほかのプロセスは動き続けます。その一方で、Rails のアプリケーションをプロセスごとに読み込むので、プロセスを増やすとメモリーの使用量も増えます。Puma
            でワーカー（要求を処理するプロセス）を増やすときに、この2つが関わります。
          </p>
        </>
      ),
    },
    {
      id: 'thread',
      title: 'スレッドと同時に進む処理',
      body: (
        <>
          <p>
            1つのプロセスの中で、命令を順に実行していく流れを<Term en="thread">スレッド</Term>と呼びます。プロセスが始まったときのスレッドは1本で、これをメインスレッドと呼びます。Ruby では{' '}
            <code>Thread.new</code> で2本目以降のスレッドを作れます。作ったスレッドは渡したブロックをメインスレッドと並行して実行します。<code>join</code> はそのスレッドが終わるまで待つメソッドです
            <Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            title="thread_wait.rb"
            code={`
start = Time.now
results = []

threads = 3.times.map do |i|
  Thread.new do
    sleep 1 # DB の応答を1秒待つ代わり
    results << "スレッド#{i}"
  end
end
threads.each(&:join)

puts results.sort.inspect
puts format("かかった時間: %.2f 秒", Time.now - start)
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
["スレッド0", "スレッド1", "スレッド2"]
かかった時間: 1.00 秒
`}
          />
          <p>
            <code>sleep 1</code> を順に3回実行すると3秒かかりますが、3本のスレッドで実行すると約1秒で終わりました。1本が待っている間に、ほかのスレッドも待ちを始められるためです。Web
            アプリケーションの処理には、データベースや外部の API の応答を待つ時間が多く含まれます。1件の要求が応答を待っている間にほかの要求を進められるように、Web サーバーは複数のスレッドで要求を処理します。
          </p>
          <p>同じプロセスのスレッドはメモリーを共有します。fork の例と同じように、スレッドの中で変数を書き換えました。</p>
          <Code
            lang="ruby"
            title="thread_share.rb と実行結果"
            code={`
count = 0
t = Thread.new { count += 1 }
t.join
puts "メインのスレッドで見た count = #{count}"
# => メインのスレッドで見た count = 1
`}
          />
          <p>
            スレッドが書き換えた count は、メインスレッドからも1に見えました（図 39-1）。メモリーを共有するので、スレッドを増やしてもアプリケーションを読み込み直す必要がなく、プロセスを増やすよりメモリーの増え方は小さくなります。その代わり、複数のスレッドが同じ変数を書き換えると、ある要求の値が別の要求の処理に混ざることがあります。この問題は「Executor
            とスレッド安全性」の節で扱います。
          </p>
          <p>
            Linux の <code>ps</code> コマンドでは NLWP の列でプロセスごとのスレッドの数を確かめられます。スレッドを3本作って5秒待つプログラム（ps_demo.rb）と、スレッドを作らずに5秒待つプログラムを同時に動かしました。
          </p>
          <Code
            lang="text"
            title="ps_demo.rb と ps の出力"
            code={`
# ps_demo.rb
3.times { Thread.new { sleep 5 } }
sleep 5

$ ps -o pid,ppid,nlwp,cmd -C ruby
  PID  PPID NLWP CMD
   31     1    5 ruby ps_demo.rb
   32     1    2 ruby -e sleep 5
`}
          />
          <p>
            スレッドを作らないプログラムでも、OS から見たスレッドは2本あります。Ruby の <code>Thread.list</code> で数えると1本なので、もう1本は Ruby の処理系が内部で使うスレッドです。ps_demo.rb
            はこれにメインスレッドと作った3本を加えて5本です。
          </p>
          <p>
            スレッドを増やしても速くならない処理もあります。CPU は命令を実行する装置で、CPU のコア1つが同時に実行できる命令の流れは1つです。OS は実行するスレッドを短い間隔で切り替えて、コアの数より多いスレッドを動かします。コアが4つのマシンで、計算だけを続ける処理を順に3回実行した場合と、3本のスレッドで実行した場合を比べました。
          </p>
          <Code
            lang="ruby"
            title="thread_calc.rb"
            code={`
def calc
  x = 0
  20_000_000.times { |i| x += i }
end

start = Time.now
3.times { calc }
puts format("順番に3回: %.2f 秒", Time.now - start)

start = Time.now
3.times.map { Thread.new { calc } }.each(&:join)
puts format("3つのスレッドで同時に: %.2f 秒", Time.now - start)
`}
          />
          <Code
            lang="text"
            title="実行結果（4 コアのマシン）"
            code={`
順番に3回: 4.58 秒
3つのスレッドで同時に: 4.54 秒
`}
          />
          <p>
            待つ処理と違い、計算の処理は3本のスレッドで実行しても、順に実行したときとほぼ同じ時間がかかりました。コアは4つあるのに、3本の計算が同時に進まなかったことになります。CRuby（標準の Ruby
            の処理系）では、1つのプロセスの中で Ruby のコードを実行できるスレッドが同時に1本だけだからです。この仕組みを GVL と呼び、「GVL と I/O 待ち」の節で詳しく扱います。Ruby
            の計算を同時に進めるには、プロセスを増やします。
          </p>
          <Figure n="39-1" title="プロセスとスレッドのメモリー" caption="process.rb と thread_share.rb の実行結果をもとにした模式図。PID は実行例の値。">
            <MemoryFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'app-server',
      title: 'Puma が受け持つこと',
      body: (
        <>
          <p>
            ブラウザーで Rails のアプリケーションのページを開くと、ブラウザーはサーバーに HTTP の要求（リクエスト）を送ります。サーバーは要求に応じた HTML などを応答（レスポンス）として返します。Rails
            のアプリケーションは要求の内容を受け取って応答の内容を作るプログラムで、ネットワークから要求を受け取る処理は別のプログラムが受け持ちます。rails new で作ったアプリケーションでは、この処理を Puma
            が受け持ち、<code>bin/rails server</code> は Puma を起動します
            <Ref n={10} />。Puma はポート（同じコンピューターで動く複数のプログラムを区別する通信用の番号）で要求を待ち、届いた要求を Rails に渡し、Rails が作った応答を送り返します（図 39-2）。
          </p>
          <p>
            デモのアプリケーションを開発環境で <code>bin/rails server</code> で起動し、ブラウザーの代わりに curl で <code>/articles</code> を要求しました。
          </p>
          <Code
            lang="text"
            title="bin/rails server の出力（Rails 8.1.4.1・Puma 8.0.2。SQL のログは一部を省略）"
            code={`
=> Booting Puma
=> Rails 8.1.4.1 application starting in development
=> Run \`bin/rails server --help\` for more startup options
Puma starting in single mode...
* Puma version: 8.0.2 ("Into the Arena")
* Ruby version: ruby 4.0.9 (2026-10-23 revision 3e93b23afc) +PRISM [x86_64-linux]
*  Min threads: 3
*  Max threads: 3
*  Environment: development
*          PID: 1
* Listening on http://0.0.0.0:3000
Use Ctrl-C to stop
Started GET "/articles" for 172.29.0.1 at 2026-11-16 06:49:40 +0000
Processing by ArticlesController#index as */*
  Rendering layout layouts/application.html.erb
  Rendering articles/index.html.erb within layouts/application
  Article Load (6.2ms)  SELECT \`articles\`.* FROM \`articles\` ORDER BY \`articles\`.\`id\` ASC LIMIT 3
  Rendered articles/index.html.erb within layouts/application (Duration: 25.4ms | GC: 0.0ms)
  Rendered layout layouts/application.html.erb (Duration: 34.6ms | GC: 0.0ms)
Completed 200 OK in 110ms (Views: 31.9ms | ActiveRecord: 20.0ms (1 query, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            前半は Puma の起動時の表示です。single mode はプロセス1つで動く起動方法（シングルモード）です。Min threads と Max threads は要求を処理するスレッドの数で、ここでは3本です。PID
            はこのプロセスの番号、Listening on は要求を受け付けるアドレスとポート番号（3000）です。<code>Started GET "/articles"</code>{' '}
            から後ろは、Puma から呼ばれた Rails が要求を処理したときのログで、どのコントローラーのどのアクションが動き、どんな SQL を実行し、何ミリ秒で応答したかが出ています。
          </p>
          <p>
            Puma の設定は config/puma.rb に書きます。rails new が作るファイルでは、<code>threads</code> でスレッドの数を、<code>port</code>{' '}
            でポート番号を指定しています（内容は「ワーカー数・スレッド数・DB の接続数」の節で示します）。ワーカーの数は書かれておらず、環境変数（プログラムの外から渡す設定の値）の WEB_CONCURRENCY
            で指定しなければ、Puma は1つのプロセスで動きます。
          </p>
          <p>
            1つのプロセスに3本のスレッドなら、同時に処理できる要求は3件です。4件目の要求はどれかのスレッドが空くまで待ちます。同時に処理できる要求を増やすには、スレッドを増やす方法と、プロセスを増やす方法があります。前の2つの節で見たとおり、スレッドはメモリーをあまり増やしませんが
            Ruby の計算は同時に進まず、プロセスはメモリーを多く使いますが計算も同時に進みます。Puma の説明書は、本番環境ではプロセスを複数にするクラスタモードを勧めています
            <Ref n={3} />。次の節ではその構成を動かして確かめます。
          </p>
          <Figure n="39-2" title="Puma と Rails の分担" caption="bin/rails server で起動したときの要求と応答の流れ。">
            <ServerRoleFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'cluster',
      title: 'クラスタモードの構成',
      body: (
        <>
          <p>
            Puma には1つのプロセスで動くシングルモードもあり、<code>workers</code> が1以上ならクラスタモードになります。デモのアプリケーションを本番環境の設定で、ワーカー2・スレッド3
            にして起動し、プロセスとスレッドの名前を Linux の /proc から読みました。/proc は、動いているプロセスの名前や親の PID、スレッドの数などを、Linux がファイルの形で見せるディレクトリです。
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
            ログの <code>ppid</code> は親プロセスの番号です。PID 12 と 15 の親はどちらも PID 1 のマスターです。マスターはワーカーを起動・監視し、各ワーカーが同じ待ち受け用のソケット（OS が接続を受け付ける窓口）で新しい接続を受け取ります。<Ref n={1} />
          </p>
          <p>
            ワーカーは受け付けた接続を <code>todo</code> という待ち行列に入れます。<code>tp 001</code> などのスレッドが取り出し、要求を読み切れれば Rails を呼びます。このデモの既定設定では、まだデータが揃わない接続は受信待ちを担当する <code>reactor</code> に預けます。読み終わると接続は待ち行列に戻るので、その間スレッドは別の要求を処理できます（図 39-3）。<Ref n={21} />
          </p>
          <p>
            応答を書き込むのは Rails を呼んだスレッドです。大きな本文を遅い回線に送り続ける間は、次の要求を扱えないことがあります。前段の Nginx が応答を一時保存する場合は <ChapterLink n={24} section="buffering">バッファリングと Puma のスレッド</ChapterLink>で確かめます。
          </p>
          <p>コントロールサーバー（Puma の状態を HTTP で返す管理用の機能）の <code>/stats</code> では、ワーカーごとのスレッドの使用状況が見られます。</p>
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
            <code>backlog</code> は待ち行列にある仕事の数です。上の出力では2つのワーカーとも 0 で、各ワーカーに3本ある処理用のスレッドは空いています。待ち行列が続けて伸びるときは、<code>busy_threads</code> と Rails の SQL や処理時間を見比べると、どの仕事がスレッドを長く使っているかを絞れます。
          </p>
          <Figure n="39-3" title="プロセスとスレッドの構成" caption="Puma 8.0.2（ワーカー2・スレッド3）の例。新しい接続は右の待ち行列に入り、すぐに読み切れないときは破線の先の reactor がデータを待つ。">
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
            CRuby の <Term en="Global VM Lock">GVL</Term> により、1つのプロセスの中で Ruby のコードを実行できるスレッドは同時に1つだけです
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
            DB の待ちは3つのスレッドで同時に進み、6件が2回分（約 0.4 秒）で終わりました。Ruby の計算は、3件を同時に受けると1件あたりの時間が 286ms から約 680ms に延び、全体の時間は1件ずつ処理するのとほとんど変わりません。スレッドを増やしても計算は速くならず、1件ごとの応答が遅くなるだけです（図 39-4）。ワーカー（プロセス）を2つにすると、別の CPU で並行して計算できるので、6件の全体の時間がほぼ半分になりました。
          </p>
          <p>
            Rails のガイドは、N+1 や遅い SQL の無いアプリケーションの I/O 待ちは処理時間の50%を超えないことが多く、プロセスあたり3スレッドを超えても効果は少ないとしています
            <Ref n={2} />。外部の API を同期的に呼ぶアプリケーションのように I/O 待ちが長い場合は、スレッドを増やす効果があります。
          </p>
          <Figure n="39-4" title="GVL と I/O 待ち" caption="ワーカー1・スレッド3（4 CPU のマシン上の Docker）での実測値をもとにした模式図。">
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
            この例では、同じ DB に対して各ワーカーが接続を最大3本持てます。要求が12件来ても、ワーカー2個で作った接続は合計6本でした。接続は使うときに作り、返却後もプールに残して次の要求で使います。プールの上限をスレッド数より小さく設定すると、スレッドに空きがあっても DB を使うところで接続を待つ場合があります。
          </p>
          <p>
            図 39-5 ではサーバーを2台に増やし、各台にワーカーを4つ、各ワーカーに上限3本のプールを用意しています。Web 用には最大 2 × 4 × 3 = 24 本です。別プロセスで動く Sidekiq の分は別に足します。ActionCable を同じプロセスで動かす場合は、Puma と同じプールから借りるので、両方が同時に使う本数を見積もってプールの大きさを決めます。
          </p>
          <p>
            Rails 側の <code>max_connections</code> はプールごとの上限です。MySQL 側の同名の設定は DB サーバー全体で受け付ける上限です。同じサーバーを使うジョブや運用作業の接続も合計に含めます。Solid Cache や Solid Queue などで別の接続先を使うときは、接続先ごとに数えます。
          </p>
          <Figure n="39-5" title="スレッド数と接続数" caption="ワーカーごとに接続プールを持つこと（デモでの実測）をもとにした計算の例。台数・ワーカー数などの値は例。">
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
            <Term en="copy-on-write">コピーオンライト</Term>）。Puma 8 では次の3つの条件をすべて満たすと、書かなくても有効になります。ワーカーが2つ以上あること、<code>prune_bundler</code> を指定していないこと、Ruby の実行環境で fork が使えること（Linux 上の CRuby なら使えます）です
            <Ref n={4} />。Puma 8.0.2 で設定を読み込ませて確かめたところ、ワーカー2つに <code>prune_bundler</code> を加えた場合と、ワーカーが1つの場合は、既定で無効でした。デモで、20回要求した後の各プロセスのメモリー（/proc の smaps_rollup）を比べました。
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
          <p>次の図は、上の出力の Shared と Private を、プロセスごとに1本の横棒に積んだものです。上の3本が preload_app! あり、下の3本がなしです。</p>
          <Figure
            title="preload_app! の有無と各プロセスのメモリー"
            caption="上の出力（20回要求した後の smaps_rollup）の値を MB 単位で描いた図。棒の長さは Rss で、Shared と Private を足した値です。"
          >
            <PreloadMemoryFigure />
          </Figure>
          <p>
            fork の前にマスターで開いた DB の接続をワーカーがそのまま使うと、複数のプロセスが1本の接続を共有し、正常に使えなくなります。ActiveRecord は fork を検知して、ワーカーの側で接続プールを捨てて作り直します
            <Ref n={5} />。redis 5.x（redis-client）も、接続を使うときにプロセス ID が変わったことを検知して接続を作り直します<Ref n={24} />（<ChapterLink n={115} section="workers" />で実行して確かめています）。fork を検知しないライブラリでマスターが開いた接続やソケットだけは、<code>before_worker_boot</code> で開き直します。デモの設定ファイルにも、このフックで PID を出力する行を書きました。
          </p>
          <p>起動ログの <code>Restarts: (✖) phased</code> は、ワーカーを順に入れ替える <ChapterLink n={23} section="puma-commands">phased restart</ChapterLink> が無効であることを示します。preload_app! を有効にすると、ワーカーはマスターが読み込んだコードを受け継ぐためです。</p>
        </>
      ),
    },
    {
      id: 'memory',
      title: 'Puma のワーカーごとにメモリーと GC を測る',
      body: (
        <>
          <p>Puma のワーカーはそれぞれ Ruby ヒープ、接続プール、プロセス内キャッシュを持ちます。<code>preload_app!</code> で共有したページは、ワーカーが書き換えると個別の物理ページを使います。起動直後と、通常の利用を再現した負荷をかけた後にメモリーを測ります。<Ref n={2} /><Ref n={3} /></p>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">見る値</th><th scope="col">読み方</th></tr></thead>
              <tbody>
                <tr><th scope="row">RSS と PSS</th><td>RSS は物理メモリー上にあるページの合計です。共有ページは複数の RSS に入ります。Linux の <code>/proc/PID/smaps_rollup</code> の PSS では、共有ページの分をプロセスごとに按分します。<Ref n={22} /></td></tr>
                <tr><th scope="row"><code>GC.stat(:heap_live_slots)</code></th><td>Ruby のヒープでオブジェクトを置いているスロットの数です。同じ負荷をかけた後の値を、GC の直後など同じ条件で比較します。繰り返すたびに増えるなら、アプリが参照を保持している箇所を調べます。<Ref n={23} /></td></tr>
                <tr><th scope="row">応答時間と GC の時間</th><td>ワーカーを増やす前後で、同じ要求の種類と到着数で比較します。RSS が増えても、原因が Ruby のオブジェクトの増加とは限りません。ネイティブ拡張やバッファーも確認します。</td></tr>
              </tbody>
            </table>
          </div>
          <p><code>bin/rails runner</code> は別のプロセスを起動します。稼働中のワーカーの GC を調べるには、そのワーカー内で値を記録します。Ruby の割り当てと回収の仕組みは <ChapterLink n={97} />、ワーカー数と接続上限の決め方は <ChapterLink n={113} /> で扱います。</p>
          <p>実行中のサーバーでプロセスを探し、設定やログを調べる手順は <a href="#/linux">第6部のサーバ運用</a> で確認できます。</p>
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
            次の図は、3件の要求を処理する3本のスレッドを上から並べ、左から右へ時間の順に描いたものです。下の行は、3本が共有するクラスの属性 last_user の値の移り変わりです。
          </p>
          <Figure
            title="クラスの属性に入れた値が別の要求に混ざる順序"
            caption="carol が最後に代入した場合の模式図。代入の間隔は広げて描いています。各スレッドは last_user と Current の両方に代入します。Current の値はスレッドごとに分かれるので、render で読む値はそのスレッドが代入したものです。"
          >
            <ClassAttrRaceFigure />
          </Figure>
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
      id: 'restart-timeout',
      title: 'Puma のタイムアウト',
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
                  <td>keep-alive の接続（1本の接続で複数の要求を続けて送る方式）で、次の要求を待つ時間</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            worker_timeout について、Puma の dsl.rb のコメントは「リクエストのタイムアウトではなく、応答の無いプロセスを守るためのもの」と書いています
            <Ref n={4} />。遅い要求を打ち切るのは、前段の Nginx や ALB のタイムアウトです（<ChapterLink n={25} />
            ）。ただし、前段が接続を切っても、Puma に渡った処理がその時点で中断されるとは限りません。接続の再利用とタイムアウトの設定は <ChapterLink n={25} section="timeouts" /> で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'puma-commands',
      title: 'Puma のコマンドと再起動方式',
      body: (
        <>
          <p>
            Rails の本番環境は起動時にアプリケーションのコードを読み込みます（<ChapterLink n={8} />）。新しいコードを反映するには、それを読み込む Puma のプロセスを起動します。
            Puma を起動するコマンドは <code>puma</code>、起動中の Puma に操作を指示するコマンドは <code>pumactl</code> です。ここでは Linux 上の CRuby と Puma 8.0.2 を使います。
          </p>
          <h3>起動と状態確認</h3>
          <p>
            開発中に Rails から起動するなら <code>bin/rails server</code> を使います。Rails アプリのディレクトリで Puma を直接起動する例では、次の設定を <code>config/puma.rb</code> に追加します。
            <code>state_path</code> には、<code>pumactl</code> が読む状態ファイルのパスを指定します。このファイルには PID と制御用の接続先、認証トークンが入ります。
            ここで使う Unix ソケットは、同じサーバー内のプロセス同士をファイルのパスでつなぎます
            <Ref n={4} /><Ref n={11} /><Ref n={12} />。
          </p>
          <Code
            lang="ruby"
            title="config/puma.rb（操作用の設定を追加）"
            code={`
state_path 'tmp/pids/puma.state'
state_permission 0o600
activate_control_app "unix://#{File.expand_path('tmp/pids/puma-control.sock')}"
`}
          />
          <Code
            lang="bash"
            title="Rails アプリのディレクトリで実行"
            code={`
# 端末1で起動
mkdir -p tmp/pids
bundle exec puma -C config/puma.rb

# 同じアプリのディレクトリで、端末2から確認
bundle exec pumactl -S tmp/pids/puma.state status
bundle exec pumactl -S tmp/pids/puma.state stats
`}
          />
          <p>
            <code>-C</code> は Puma の設定ファイル、<code>-S</code> は起動した Puma が書いた状態ファイルを指定します。<code>bundle exec pumactl --help</code> で使える操作を一覧できます。
            状態ファイルに制御用の接続先があれば、pumactl はそこへ操作を送ります。PID で操作する場合は、たとえばクラスタのマスターの PID を指定して <code>kill -USR2 "$puma_pid"</code> でシグナルを送れます
            <Ref n={6} /><Ref n={11} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th scope="col">操作</th><th scope="col">何をするか</th><th scope="col">PID で操作する場合</th></tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>status</code></th>
                  <td>Puma の起動を確認する。Rails が要求に応答できるかは <code>/up</code> などで別途確かめる</td>
                  <td>PID が存在するかを確認</td>
                </tr>
                <tr>
                  <th scope="row"><code>stats</code></th>
                  <td>ワーカーの PID、スレッドプール、待ち行列などの統計を表示する</td>
                  <td>制御用の接続先が必要</td>
                </tr>
                <tr>
                  <th scope="row"><code>restart</code></th>
                  <td>Puma 全体を起動し直す（hot restart）</td>
                  <td><code>SIGUSR2</code></td>
                </tr>
                <tr>
                  <th scope="row"><code>phased-restart</code></th>
                  <td>クラスタのワーカーを順に入れ替える（phased restart）</td>
                  <td><code>SIGUSR1</code></td>
                </tr>
                <tr>
                  <th scope="row"><code>stop</code></th>
                  <td>処理中の要求の完了を待つ終了処理を始める</td>
                  <td><code>SIGTERM</code></td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>hot restart と phased restart</h3>
          <Code
            lang="bash"
            title="用途に応じて選ぶ再起動コマンド"
            code={`
# Puma 全体を起動し直す場合
bundle exec pumactl -S tmp/pids/puma.state restart

# または、下の条件を満たすクラスタでワーカーを順に替える場合
bundle exec pumactl -S tmp/pids/puma.state phased-restart
`}
          />
          <p>
            <strong>Hot restart</strong> は、実行中のプログラムを置き換える OS の機能 <code>exec</code> で、Puma を同じ PID のまま起動し直します。
            Puma 本体やマスターが読み込む設定を更新するときに使えます。Linux 上の CRuby では、接続を待ち受けるソケットを次の Puma に引き継ぎます。
            Rails の起動が終わるまで、新しい接続が待つことがあります。Nginx や ALB の待ち時間を超えれば、利用者にはエラーとして返ります
            <Ref n={6} /><Ref n={12} />（<ChapterLink n={25} section="timeouts" />）。
          </p>
          <p>
            <strong>Phased restart</strong> は、マスターが旧ワーカーを1つ停止し、代わりのワーカーの起動を確認してから次を停止します。
            アプリケーションの更新に使うには、クラスタで <code>preload_app! false</code> と <code>prune_bundler</code> を設定します。後者は、ワーカーが自分でそのリリースの gem を読み込めるようにする設定です。
            入れ替え中の要求をほかのワーカーで処理するには、ワーカーが2つ以上あり、残るワーカーに余力が必要です。Puma 本体やマスターが読み込んだ gem を更新するときは、マスターも起動し直します
            <Ref n={4} /><Ref n={6} />。
          </p>
          <Figure n="39-6" title="再起動方式ごとに入れ替わるプロセス" caption="Linux 上の CRuby と2ワーカー構成の模式図。hot restart の起動待ちと、phased restart で新旧ワーカーが重なる区間を比較。">
            <RestartFigure />
          </Figure>
          <p>
            CLI の綴りは <code>phased-restart</code> で、Puma の Ruby メソッド名は <code>phased_restart</code> です。Puma 8.0.2 は、単一プロセスや preload が有効な構成でこの操作を受けると hot restart に切り替えます。
            実行前に起動ログで <code>Restarts: (✔) phased</code> を確認します
            <Ref n={12} />。
          </p>
          <p>
            コマンドを送った後はログや <code>stats</code> で完了を確認します。phased restart では <code>phase</code> が操作前より進み、<code>old_workers</code> が 0、
            <code>booted_workers</code> が設定したワーカー数になれば、入れ替えが完了しています。
          </p>
          <p>デモでは preload なしでワーカーを2つ起動し、0.05秒ごとに要求を送りながら phased restart を指示するシグナル <code>SIGUSR1</code> を送っています。</p>
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
            1つ目のワーカーが PID 56 で起動してから、2つ目の入れ替えに進みました。この実行では219件すべてが成功しました。
            入れ替え中は新旧のコードが同時に動くため、DB の列を削除するような変更は両方のコードが動くように段階を分けます（<ChapterLink n={27} section="deploy-order" />）。
          </p>
          <p>
            リリースごとにディレクトリを作る構成では、<code>directory</code> に指定した <code>current</code> などのシンボリックリンクを先に新版へ向けます。
            phased restart が始まると、マスターがそのリンク先へ移動し、新しいワーカーが新版を読み込みます。操作に使う状態ファイルと制御ソケットは、リリース間で共通のパスに置きます
            <Ref n={6} />。
          </p>
          <h3>systemd で管理している場合</h3>
          <p>
            systemd は Linux でサービスの起動や停止を管理します。Puma を登録している環境では <code>systemctl status puma.service</code> で状態を確認でき、
            <code>systemctl restart puma.service</code> はサービスを停止し、登録した起動コマンド <code>ExecStart</code> で起動します。停止させたままにする場合は <code>systemctl stop puma.service</code> を使います。
            systemd が <code>puma.socket</code> で待受ソケットを用意する構成をソケットアクティベーションと呼びます。この構成では <code>puma.service</code> だけを再起動する間もソケットを開いておけます
            <Ref n={13} />。
          </p>
        </>
      ),
    },
    {
      id: 'ruby-upgrade',
      title: 'Ruby 更新時の Puma とトラフィックの切り替え',
      body: (
        <>
          <p>
            Ruby をインストールしたり <code>.ruby-version</code> を変えたりしても、実行中の Puma は起動時の Ruby を使い続けます。
            phased restart で作られるワーカーも、<code>fork</code> したマスターの Ruby を受け継ぎます。新しい Ruby を使うには、その Ruby で Puma のマスターから起動します
            <Ref n={8} /><Ref n={14} />。
          </p>
          <p>
            Puma 8.0.2 の hot restart は、既定で <code>Gem.ruby</code> が返す Ruby の実行ファイルを使います。たとえば rbenv で Ruby を別々のディレクトリに入れていると、端末で <code>ruby -v</code> が新版を示しても、
            Puma は元のパスで起動し直します。Puma の <code>restart_command</code> で起動コマンドを指定することもできます。新版を別に起動してからトラフィックを切り替える構成なら、動作確認まで旧版に要求を任せられます
            <Ref n={4} /><Ref n={12} /><Ref n={14} />。
          </p>
          <h3>新しい Ruby で起動できる状態を作る</h3>
          <ol>
            <li>
              Ruby と Rails の更新を分けます。更新作業用の環境で、アプリが使う <code>.ruby-version</code> や <code>Gemfile</code> の Ruby の指定をそろえます。
              <code>Gemfile.lock</code> に Ruby の記録があれば、新しい Ruby で <code>bundle update --ruby</code> を実行し、変更をリリースに含めます（<ChapterLink n={29} section="upgrade" />）
              <Ref n={15} /><Ref n={16} />。
            </li>
            <li>
              新しい Ruby で <code>bundle install</code> し、Puma や <code>mysql2</code> など Ruby に読み込まれるネイティブ拡張（C などで書かれた部分）も新しい環境に導入して、テストを通します。
              旧版の Ruby・gem・リリースは、切り戻して動かせるように残します
              <Ref n={17} />。
            </li>
            <li>
              systemd で起動する場合は <code>systemctl cat puma.service</code> で <code>ExecStart</code> と環境の指定を確認し、新版を使う設定を用意します。
              サービスの設定ファイルを変えたら <code>systemctl daemon-reload</code> を実行します。起動後に <code>journalctl -u puma.service -n 30</code> などで Puma のログを読み、実際に使った Ruby の版を確かめます
              <Ref n={13} />。
            </li>
          </ol>
          <h3>複数台なら ALB から1台ずつ外す</h3>
          <p>
            たとえば AWS のロードバランサーである ALB（Application Load Balancer）が2台の Nginx に振り分け、各 Nginx が同じサーバー内の Puma に転送する構成を考えます。
            1台を外している間も、残る台で通常のリクエストを処理できることが前提です。1台ずつ更新する方法をローリングデプロイと呼びます（<ChapterLink n={25} section="load-balancer" />）。
          </p>
          <ol>
            <li>
              更新する1台を ALB の転送先から登録解除します。新しい要求の振り分けを止め、処理中の要求が終わるのを待ちます。この待機をドレインと呼びます。
              ALB で登録解除が完了するまで待ってから Puma を入れ替えます
              <Ref n={18} />。
            </li>
            <li>
              対象の1台で <code>systemctl restart puma.service</code> などを使って、新しい Ruby で Puma を起動します。
              ログの Ruby の版、<code>/up</code> の 200、DB を使う代表的な画面や API の応答を確認します。<code>/up</code> は Rails の起動確認に使えます（<ChapterLink n={25} section="health" />）。
            </li>
            <li>
              ALB に再登録し、正常と判定されてから HTTP 5xx の割合と応答時間を見ます。問題がなければ次の1台に進みます。
              問題が出たら展開を止め、その台を外して旧 Ruby と旧リリースで起動し、動作を確認してから戻します
              <Ref n={18} />。
            </li>
          </ol>
          <h3>1台なら Nginx の転送先を切り替える</h3>
          <p>
            旧 Puma が <code>127.0.0.1:3000</code> で要求を受けている間に、新しい Ruby で別の Puma を <code>127.0.0.1:3001</code> に起動します。
            2つの Puma を同時に動かす間は、待受先・PID ファイル・制御ソケット・状態ファイルのパスを分け、メモリーと DB 接続数に余裕を持たせます（<ChapterLink n={23} section="sizing" />）。
          </p>
          <Figure n="39-7" title="新旧 Puma を並べて Ruby を切り替える" caption="左は新版の起動を確認している間、右は reload 後に新しい要求を新版へ送る経路。処理中の接続は旧側に残ることがあります。">
            <RuntimeSwitchFigure />
          </Figure>
          <Code
            lang="bash"
            title="新しいリリースのディレクトリで、新しい Ruby を選んで実行"
            code={`
RAILS_ENV=production bundle exec puma -C config/puma.rb -b tcp://127.0.0.1:3001

# 別の端末から新版の Rails に直接接続（/up が HTTP で応答する構成）
curl -fsS -o /dev/null -w '%{http_code}\\n' http://127.0.0.1:3001/up
`}
          />
          <p>
            新版の動作を確かめたら、既存の <code>proxy_pass http://app;</code> が参照する <code>upstream app</code> の転送先を更新します（<ChapterLink n={24} section="upstream" />）。
          </p>
          <Code
            lang="nginx"
            title="Nginx の変更箇所"
            code={`
upstream app {
    server 127.0.0.1:3001;
}
`}
          />
          <Code lang="bash" code="sudo nginx -t && sudo nginx -s reload" />
          <p>
            <code>nginx -t</code> で設定を検査し、<code>reload</code> で新しい Nginx ワーカーに切り替えます。Nginx 経由の応答やエラー率を確認し、旧ワーカーが処理中の接続を終えるまで旧 Puma を残します。
            確認中に異常が出たら、旧 Puma が応答できる状態で転送先をポート <code>3000</code> に戻し、再び <code>reload</code> します。
            WebSocket などでは接続が長く続くため、切り替え後に旧 Puma を止める時点とクライアントの再接続も確認します
            <Ref n={19} /><Ref n={20} />（<ChapterLink n={24} section="websocket" />）。
          </p>
          <p>
            Docker で Puma 8.0.2 と Nginx 1.30.6 を起動し、<code>RUBY_VERSION</code> を応答に含める小さな Rack アプリで確かめました。旧 Puma に処理の長い要求を送り、
            その応答を待つ間に Nginx を再読み込みすると、新しい要求には新版が応答し、先に送った要求も旧版で完了しました。
          </p>
          <Code
            lang="text"
            title="Nginx 経由で観測した HTTP 状態と Ruby の版"
            code={`
切り替え前の要求                       200  Ruby 3.4.12
切り替え後に送った新しい要求           200  Ruby 4.0.9
切り替え前から処理中だった要求の完了   200  Ruby 3.4.12
旧 Puma に切り戻した後の要求           200  Ruby 3.4.12
`}
          />
          <p>
            1台で Puma を2つ動かせない場合は、systemd のソケットアクティベーションで、新しい Ruby での起動中も接続を待受キューに入れられます。
            キューに収まる件数や Nginx が応答を待つ時間には上限があるので、切り替え前に起動時間と負荷を測ります。待受を Puma だけが持つ構成で停止と起動を行う場合は、待受が途切れる時間を見込んで作業します
            <Ref n={13} />（<ChapterLink n={25} section="timeouts" />）。
          </p>
          <p>
            新旧が同時に動く間に DB も変更するなら、両方が使える構造を維持します（<ChapterLink n={27} section="deploy-order" />）。
            Sidekiq など Puma とは別に起動している Ruby プロセスも、処理中のジョブに配慮して、各サービスの手順で新しい Ruby に切り替えます（<ChapterLink n={18} section="idempotency" />）。
          </p>
          <PumaRestartFigure />
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>プロセスはメモリーが別々で、Ruby の計算も同時に進みます。スレッドは同じプロセスのメモリーを共有し、待ちの間にほかのスレッドが進めますが、Ruby の計算は同時に1本だけです。</li>
          <li>Puma はポートで要求を待ち、スレッドで Rails を呼んで、Rails が作った応答を送り返します。</li>
          <li>クラスタモードでは、マスターがワーカーを fork して監視し、各ワーカーのスレッドが Rails を呼んで応答を書き込みます。既定の設定では、すぐに読み切れない要求を reactor に預けられます。</li>
          <li>GVL のため、Ruby の計算はスレッドを増やしても速くならず、1件ごとの応答が遅くなります。I/O 待ちの間は別のスレッドが Ruby の処理を進められます。並行して計算するにはワーカーを増やします。</li>
          <li>DB の接続プールはワーカーごとにあります。同じ DB にそれぞれ最大何本つなぐかを足し合わせ、ジョブなど別プロセスの接続も含めて見積もります。</li>
          <li>preload_app! はワーカーの間でメモリーを共有させます（ワーカーが2つ以上で prune_bundler を指定していなければ既定で有効）。phased restart とは両立しません。</li>
          <li>クラスやグローバルな変数に要求ごとの値を入れると、別の要求に混ざります。要求ごとの値は CurrentAttributes に入れ、Executor が要求の終わりに消します。</li>
          <li>Puma の worker_timeout は要求のタイムアウトではありません。遅い要求は前段のタイムアウトで打ち切られますが、Rails の処理は続きます。</li>
          <li><code>pumactl restart</code> は Puma を起動し直します。<code>pumactl phased-restart</code> は同じマスターからワーカーを順に作り直します。</li>
          <li>Ruby 更新では、新しい Ruby でマスターから起動します。複数台なら ALB で1台ずつ外し、1台で新旧 Puma を並べられるなら Nginx で転送先を切り替えます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Puma: docs/architecture.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/architecture.md`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'マスターとワーカーの役割、スレッドプールと応答の書き込み。' },
    { title: 'Tuning Performance for Deployment', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/tuning_performance_for_deployment.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'GVL と I/O 待ち、I/O 待ちが50%以下なら3スレッドを超えても効果が少ないこと、プロセスによる並列性とコピーオンライト。' },
    { title: 'Puma: docs/deployment.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/deployment.md`, accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'クラスタモードの勧め、workers :auto、スレッド数の決め方、ワーカー数とメモリー、X-Request-Start による待ち時間の計測。' },
    { title: 'Puma: lib/puma/dsl.rb・configuration.rb', publisher: 'puma/puma（GitHub）', url: `${PM}/lib/puma/dsl.rb`, accessed: '2026-11-28', version: 'Puma 8.0.2', note: 'preload_app! の既定値を決める条件（set_conditional_default_options：prune_bundler なし・ワーカー2つ以上・fork が使えること）とタイムアウトの既定値、WEB_CONCURRENCY、制御用ソケット・状態ファイル・再起動コマンドの設定。' },
    { title: 'activerecord/lib/active_record/connection_adapters/pool_config.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/pool_config.rb#L83`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ForkTracker の after_fork で接続プールを捨てること。' },
    { title: 'Puma: docs/restart.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/restart.md`, accessed: '2026-11-20', version: 'Puma 8.0.2', note: 'hot restart と phased restart の操作、待受ソケットの引き継ぎ、ワーカーの入れ替え順と設定条件、新旧のコードが同時に動くこと。' },
    { title: 'Threading and Code Execution in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/threading_and_code_execution.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Executor が要求の前後で行う処理と、スレッドの間で共有される状態。' },
    { title: 'class Process（Process.fork・Process.wait）', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Process.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'fork が子プロセスを作り、ブロックを子プロセスで実行すること。Process.wait が子プロセスの終了を待つこと。実行例は Ruby 4.0.9 で実測。' },
    { title: 'class Thread', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Thread.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'Thread.new・join・Thread.list。実行例は Ruby 4.0.9 で実測。' },
    { title: 'The Rails Command Line（bin/rails server）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/command_line.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'bin/rails server が Rails に同梱の Puma を起動すること。' },
    { title: 'Puma: lib/puma/control_cli.rb', publisher: 'puma/puma（GitHub）', url: `${PM}/lib/puma/control_cli.rb`, accessed: '2026-11-20', version: 'Puma 8.0.2', note: 'pumactl の操作一覧、状態ファイルの読み込み、制御用の接続とシグナルの使い分け。' },
    { title: 'Puma: lib/puma/launcher.rb', publisher: 'puma/puma（GitHub）', url: `${PM}/lib/puma/launcher.rb`, accessed: '2026-11-20', version: 'Puma 8.0.2', note: '状態ファイルの項目、phased restart が使えない場合の動作、hot restart での exec と Gem.ruby。' },
    { title: 'Puma: docs/systemd.md', publisher: 'puma/puma（GitHub）', url: `${PM}/docs/systemd.md`, accessed: '2026-11-20', version: 'Puma 8.0.2', note: 'ExecStart、systemctl restart、ソケットアクティベーションによる待受ソケットの維持。' },
    { title: 'rbenv(1)', publisher: 'rbenv', url: 'https://rbenv.org/man/rbenv.1', accessed: '2026-11-20', note: '.ruby-version と PATH による実行ファイルの選択、バージョンごとのインストール先。' },
    { title: 'Ruby Directive', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/gemfile_ruby/', accessed: '2026-11-20', note: 'Gemfile の ruby 指定と .ruby-version の参照。' },
    { title: 'bundle update', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/command-reference/bundle-update/', accessed: '2026-11-20', note: '--ruby がロックファイルの Ruby の記録を更新すること。' },
    { title: 'Gems with Extensions', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/gems-with-extensions/', accessed: '2026-11-20', note: 'gem のネイティブ拡張とインストール時のビルド。' },
    { title: 'Register targets with your Application Load Balancer target group', publisher: 'AWS', url: 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-register-targets.html', accessed: '2026-11-20', note: '登録解除中のドレイン、登録解除完了の確認、再登録と最初のヘルスチェック。' },
    { title: 'Controlling nginx', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/control.html#reconfiguration', accessed: '2026-11-20', version: 'Nginx 1.30.6', note: '設定の再読み込み、新ワーカーの起動、旧ワーカーによる既存クライアントの処理。' },
    { title: 'Nginx: Command-line parameters', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/switches.html', accessed: '2026-11-20', version: 'Nginx 1.30.6', note: 'nginx -t と nginx -s reload の意味。' },
    { title: 'Puma::Server（handle_servers・process_client・reactor_wakeup）', publisher: 'puma/puma（GitHub）', url: `${PM}/lib/puma/server.rb`, accessed: '2026-11-22', version: 'Puma 8.0.2', note: '接続をプールに渡し、すぐに読めないときに reactor へ預けてプールに戻す分岐。' },
    { title: 'The /proc Filesystem', publisher: 'Linux Kernel Documentation', url: 'https://docs.kernel.org/filesystems/proc.html', accessed: '2026-11-27', note: 'smaps と smaps_rollup の RSS、PSS。' },
    { title: 'GC.stat', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/GC.html#method-c-stat', accessed: '2026-11-27', version: 'Ruby 4.0', note: 'heap_live_slots と各値が数える対象。' },
    { title: 'redis-client lib/redis_client.rb（ensure_connected）', publisher: 'redis-rb', url: 'https://github.com/redis-rb/redis-client/blob/v0.31.0/lib/redis_client.rb#L769-L770', accessed: '2026-11-28', version: 'redis-client 0.31.0', note: 'プロセス ID が変わっていれば接続を閉じて作り直す。' },
  ],
}

export default withExplanations(ch23, explanation23)
