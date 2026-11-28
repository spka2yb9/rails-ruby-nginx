import { useState } from 'react'
import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'
import { FigureChoices } from '../visuals/study-figure'

const figure = (n: number) => `${chapterNumber(103)}-${n}`
const PM = 'https://github.com/puma/puma/blob/v8.0.2'

/* ---------- 図1 プロセスとカーネル ---------- */
function KernelFigure() {
  const kernelParts: [string, string][] = [
    ['スケジューラー', 'CPU を割り当てる'],
    ['メモリー管理', 'ページ表・キャッシュ'],
    ['ファイルシステム', '権限を確認する'],
    ['TCP/IP', 'ソケット'],
    ['シグナル・/proc', 'プロセスの管理'],
  ]
  return (
    <Svg id={figure(1)} w={780} h={352} label="上段はユーザー空間で、Puma のプロセス（Rack アプリ、Ruby VM、libc）と ps コマンドのプロセスが別々にある。中段のシステムコール（openat、read、write、accept4、clone、kill など）を通して、下段のカーネル（スケジューラー、メモリー管理、ファイルシステム、TCP/IP、シグナルと /proc）に処理を依頼する。ハードウェアを直接操作するのはカーネルだけ。">
      <rect x={10} y={10} width={760} height={150} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={24} y={28} bold fs={12}>ユーザー空間（ユーザーモードで動く。プロセスごとに別の仮想アドレス空間）</T>
      <rect x={24} y={42} width={470} height={108} rx={6} fill="none" stroke="var(--fig-line)" />
      <T x={36} y={60} bold fs={12}>Puma のプロセス（PID 621）</T>
      <Box x={36} y={76} w={140} h={60} lines={['Rack アプリ', '（Rails の代わり）']} fs={12} subTone="muted" />
      <Box x={186} y={76} w={140} h={60} lines={['Ruby VM', 'GC・GVL・スレッド']} fs={12} subTone="muted" />
      <Box x={336} y={76} w={146} h={60} lines={['libc', 'read・write の関数']} fs={12} subTone="muted" />
      <rect x={510} y={42} width={246} height={108} rx={6} fill="none" stroke="var(--fig-line)" />
      <T x={522} y={60} bold fs={12}>ps コマンド（PID 900）</T>
      <Box x={522} y={76} w={222} h={60} lines={['libc', '/proc のファイルを読む']} fs={12} subTone="muted" />
      <Arrow x1={409} y1={136} x2={409} y2={170} />
      <Arrow x1={633} y1={136} x2={633} y2={170} />
      <Box x={10} y={172} w={760} h={36} lines={['システムコール（openat・read・write・accept4・clone・kill など）']} fill="box5" fs={13} />
      <Arrow x1={409} y1={208} x2={409} y2={236} />
      <Arrow x1={633} y1={208} x2={633} y2={236} />
      <rect x={10} y={218} width={760} height={92} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={24} y={234} bold fs={12}>カーネル（カーネルモードで動く）</T>
      {kernelParts.map(([a, b], i) => (
        <Box key={a} x={24 + i * 149} y={248} w={140} h={50} lines={[a, b]} fs={12} subTone="muted" />
      ))}
      <Box x={10} y={320} w={760} h={26} lines={['ハードウェア：CPU・メモリー・ディスク・ネットワークカード（カーネルだけが直接操作する）']} fill="box4" fs={12} />
    </Svg>
  )
}

/* ---------- 図2 Puma の1件の要求とシステムコール ---------- */
function PumaSyscallFigure() {
  const lanes = [
    { x: 80, a: 'curl', b: 'クライアント' },
    { x: 250, a: 'カーネル', b: 'ソケットの処理' },
    { x: 450, a: 'puma srv', b: 'TID 628' },
    { x: 640, a: 'puma srv tp 001', b: 'TID 623' },
  ]
  const time = (y: number, s: string) => <T x={12} y={y} fs={10} tone="muted">{s}</T>
  return (
    <Svg id={figure(2)} w={780} h={444} label="curl が接続すると、カーネルが接続を確立する。puma srv スレッドの pselect6 が戻り、accept4 が FD 11 を返す。接続は pool << client でスレッドプールに渡され、puma srv tp 001 スレッドが recvfrom で要求の86バイトを読み、アプリを実行して sendto で73バイトの応答を送る。curl が接続を閉じると recvfrom が0を返し、close(11) で FD を閉じる。">
      {lanes.map((l) => (
        <g key={l.a}>
          <Box x={l.x - 75} y={12} w={150} h={44} lines={[l.a, l.b]} fs={12} mono={l.a.startsWith('puma')} subTone="muted" />
          <line x1={l.x} y1={56} x2={l.x} y2={416} stroke="var(--fig-line)" strokeDasharray="4 4" />
        </g>
      ))}
      <T x={165} y={78} fs={11} anchor="middle">接続（SYN など）</T>
      <Arrow x1={80} y1={88} x2={248} y2={88} />
      {time(118, '0 ms')}
      <T x={350} y={108} fs={11} anchor="middle">pselect6 が戻る</T>
      <Arrow x1={250} y1={118} x2={448} y2={118} />
      {time(148, '0.4 ms')}
      <T x={458} y={148} fs={11} mono>accept4(5) = 11</T>
      <T x={545} y={170} fs={11} mono anchor="middle">{'pool << client'}</T>
      <Arrow x1={450} y1={180} x2={638} y2={180} />
      <T x={165} y={202} fs={11} mono anchor="middle">GET /articles</T>
      <Arrow x1={80} y1={212} x2={248} y2={212} />
      {time(242, '5.1 ms')}
      <T x={545} y={232} fs={11} mono anchor="middle">recvfrom(11) = 86</T>
      <Arrow x1={250} y1={242} x2={638} y2={242} accent />
      <Box x={585} y={256} w={110} h={28} lines={['アプリを実行']} fs={11} fill="box5" />
      {time(304, '6.5 ms')}
      <T x={545} y={294} fs={11} mono anchor="middle">sendto(11) = 73</T>
      <Arrow x1={640} y1={304} x2={252} y2={304} accent />
      <T x={165} y={294} fs={11} mono anchor="middle">HTTP/1.1 200 OK</T>
      <Arrow x1={250} y1={304} x2={82} y2={304} />
      <T x={165} y={326} fs={11} anchor="middle">接続を閉じる（FIN）</T>
      <Arrow x1={80} y1={336} x2={248} y2={336} />
      {time(366, '8.9 ms')}
      <T x={545} y={356} fs={11} mono anchor="middle">recvfrom(11) = 0</T>
      <Arrow x1={250} y1={366} x2={638} y2={366} />
      {time(396, '10.5 ms')}
      <T x={648} y={396} fs={11} mono>close(11)</T>
      <T x={12} y={432} fs={11} tone="muted">左端の時刻は pselect6 が戻った時点からの経過です（strace を付けた状態の値なので、付けないときより遅くなります）</T>
    </Svg>
  )
}

/* ---------- 図3 スレッドと fork で共有するもの ---------- */
function ShareFigure() {
  return (
    <Svg id={figure(3)} w={780} h={296} label="左はスレッドの場合で、1つのプロセスの中で仮想アドレス空間、FD の表、シグナルの処理方法とカレントディレクトリを共有し、スタック・レジスター・実行位置はスレッドごとに持つ。右は fork の場合で、親と子がそれぞれ仮想アドレス空間と FD の表を持つ。仮想アドレス空間は fork の時点の内容をコピーオンライトで共有し始め、FD の表は複製されて同じソケットやファイルを指す。">
      <T x={20} y={22} bold fs={12}>スレッド：clone に CLONE_VM などを付ける</T>
      <rect x={20} y={36} width={355} height={248} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={54} bold fs={12}>1つのプロセス（PID 621）</T>
      <Box x={32} y={66} w={331} h={96} lines={['共有する', '仮想アドレス空間（Ruby のオブジェクト）', 'FD の表（ソケット・ログ）', 'シグナルの処理方法・カレントディレクトリ']} fs={12} fill="box5" bold subTone="muted" />
      {[623, 624, 625].map((tid, i) => (
        <Box key={tid} x={32 + i * 114} y={176} w={103} h={96} lines={[`TID ${tid}`, 'スタック', 'レジスター', '実行位置']} fs={11} bold subTone="muted" />
      ))}
      <T x={405} y={22} bold fs={12}>fork：clone に SIGCHLD だけを付ける</T>
      {[
        { x: 405, name: '親（PID 610）' },
        { x: 590, name: '子（PID 612）' },
      ].map((p) => (
        <g key={p.name}>
          <rect x={p.x} y={36} width={170} height={248} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
          <T x={p.x + 12} y={54} bold fs={12}>{p.name}</T>
          <Box x={p.x + 8} y={66} w={154} h={96} lines={['仮想アドレス空間', 'fork の時点の内容を', 'コピーオンライトで共有']} fs={11} bold subTone="muted" />
          <Box x={p.x + 8} y={176} w={154} h={96} lines={['FD の表', '複製される', '同じソケットを指す']} fs={11} bold subTone="muted" />
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図4 コピーオンライト ---------- */
function CowFigure() {
  const col = (x0: number, title: string, stage: 1 | 2 | 3, notes: [string, string]) => (
    <g key={title}>
      <T x={x0 + 125} y={22} bold fs={12} anchor="middle">{title}</T>
      <Box x={x0 + 15} y={40} w={100} h={36} lines="親のページ表" fs={11} />
      <Box x={x0 + 135} y={40} w={100} h={36} lines="子のページ表" fs={11} />
      {stage < 3 ? (
        <>
          <Box x={x0 + 35} y={150} w={80} h={36} lines="ページ A" fs={11} fill="box4" accent={stage === 2} />
          <Box x={x0 + 135} y={150} w={80} h={36} lines="ページ B" fs={11} fill="box4" />
          <Arrow x1={x0 + 60} y1={76} x2={x0 + 70} y2={148} dashed />
          <Arrow x1={x0 + 80} y1={76} x2={x0 + 165} y2={148} dashed />
          <Arrow x1={x0 + 175} y1={76} x2={x0 + 95} y2={148} dashed={stage === 1} accent={stage === 2} />
          <Arrow x1={x0 + 195} y1={76} x2={x0 + 180} y2={148} dashed />
          {stage === 2 && <T x={x0 + 140} y={112} fs={10} tone="danger">書き込み</T>}
        </>
      ) : (
        <>
          <Box x={x0 + 10} y={150} w={70} h={36} lines="ページ A" fs={11} fill="box4" />
          <Box x={x0 + 90} y={150} w={70} h={36} lines="A′（複製）" fs={11} fill="box5" accent />
          <Box x={x0 + 170} y={150} w={70} h={36} lines="ページ B" fs={11} fill="box4" />
          <Arrow x1={x0 + 50} y1={76} x2={x0 + 45} y2={148} />
          <Arrow x1={x0 + 90} y1={76} x2={x0 + 195} y2={148} dashed />
          <Arrow x1={x0 + 170} y1={76} x2={x0 + 125} y2={148} accent />
          <Arrow x1={x0 + 210} y1={76} x2={x0 + 210} y2={148} dashed />
        </>
      )}
      <T x={x0 + 125} y={212} fs={11} anchor="middle">{notes[0]}</T>
      <T x={x0 + 125} y={232} fs={11} anchor="middle" tone="muted">{notes[1]}</T>
    </g>
  )
  return (
    <Svg id={figure(4)} w={780} h={250} label="① fork の直後は、親と子のページ表が同じ物理ページ A と B を指し、どちらも書き込み禁止の印を付けている。② 子がページ A に書き込もうとするとページフォルトが起き、カーネルが A を複製する。③ その後、子は複製した A′ を、親は元の A を使い、ページ B は引き続き共有する。">
      {col(10, '① fork の直後', 1, ['親と子が同じ物理ページを指す', 'どちらにも書き込み禁止の印を付ける'])}
      {col(265, '② 子がページ A に書き込む', 2, ['書き込みでページフォルトが起きる', 'カーネルが A を A′ に複製する'])}
      {col(520, '③ 書き込みの後', 3, ['子は A′、親は A を使う', 'B は引き続き共有する'])}
    </Svg>
  )
}

/* ---------- 図5（段階送り）cow.rb のページの共有と複製 ---------- */
// 100 MiB の IO::Buffer を 25 MiB ずつ4つの箱で表す。数値は cow.rb の実行結果（cowOut）
type CowStage = { child: boolean; copied: boolean; values: boolean; parent: string[]; childNums: string[] }
const COW_STAGES: { label: string; stage: CowStage; text: string }[] = [
  {
    label: 'fork の前',
    stage: { child: false, copied: false, values: false, parent: ['Rss 114・Shared 8', 'Private 106'], childNums: ['まだない', ''] },
    text: '親が 100 MiB の IO::Buffer を確保し、すべてに a を書き込みました。ページを使っているのは親だけなので、親の Private が 106 MiB です。',
  },
  {
    label: 'fork の直後',
    stage: { child: true, copied: false, values: false, parent: ['Rss 114・Shared 112', 'Private 1'], childNums: ['Rss 110・Shared 108', 'Private 0'] },
    text: '子のページ表は親と同じ物理ページを指し、カーネルはページを複製しません。両方のページ表に書き込み禁止の印を付けます。子の Private は 0 MiB で、Pss は親子とも約 55 MiB になりました。',
  },
  {
    label: '子が 25 MiB を書き換える',
    stage: { child: true, copied: true, values: false, parent: ['Rss 114・Shared 87', 'Private 26'], childNums: ['Rss 110・Shared 83', 'Private 26'] },
    text: '子が先頭の 25 MiB に b を書き込もうとすると、書き込み禁止のページなのでページフォルトが起きます。カーネルは書き込まれたページだけを複製し、子のページ表を複製に付け替えます。元のページを使うのは親だけになったので、親の Private も 26 MiB に増えました。残りの 75 MiB は共有のままです。',
  },
  {
    label: '親と子が値を読む',
    stage: { child: true, copied: true, values: true, parent: ['Rss 114・Shared 87', 'Private 26'], childNums: ['Rss 110・Shared 83', 'Private 26'] },
    text: '子は先頭で b、30 MiB 目で a を読み、親は先頭で a を読みました。同じ仮想アドレスでも、書き換えた範囲だけは親と子が別の物理ページを使っています。',
  },
]

function CowStepSvg({ i, stage }: { i: number; stage: CowStage }) {
  const x = (k: number) => 130 + k * 92
  const ranges = ['0〜25', '25〜50', '50〜75', '75〜100']
  const ref = (x1: number, y1: number, x2: number, y2: number, shared: boolean, accent = false) => (
    <Arrow x1={x1} y1={y1} x2={x2} y2={y2} dashed={shared} accent={accent} />
  )
  return (
    <Svg id={`${figure(5)}-${i}`} w={780} h={250}
      label={`親のページ表、物理メモリー、子のページ表を上から並べた図。${stage.child ? '' : '子はまだない。'}${stage.copied ? '先頭の 25 MiB だけ、子は複製したページを指す。' : stage.child ? '親と子が同じ物理ページを指す。' : ''}親は ${stage.parent.join('、')}。子は ${stage.childNums.join('、')}（MiB）。`}>
      <T x={10} y={38} fs={12} bold>親のページ表</T>
      <T x={10} y={128} fs={12} bold>物理メモリー</T>
      <T x={10} y={218} fs={12} bold>子のページ表</T>
      {ranges.map((r, k) => (
        <g key={r}>
          <Box x={x(k)} y={24} w={80} h={28} lines={`${r} MiB`} fs={10} />
          <Box x={x(k)} y={114} w={80} h={28} lines={k === 0 && stage.values ? 'a（親が読む）' : 'a'} fs={11} mono fill="box4" />
          {stage.child && <Box x={x(k)} y={204} w={80} h={28} lines={`${r} MiB`} fs={10} />}
          {ref(x(k) + 40, 52, x(k) + 40, 112, stage.child && !(k === 0 && stage.copied))}
          {stage.child && !(k === 0 && stage.copied) && ref(x(k) + 40, 204, x(k) + 40, 144, true)}
        </g>
      ))}
      {stage.copied && (
        <>
          <Box x={x(4)} y={114} w={80} h={28} lines={stage.values ? 'b（子が読む）' : 'b（複製）'} fs={11} mono fill="box5" accent />
          {ref(x(0) + 40, 204, x(4) + 40, 144, false, true)}
        </>
      )}
      {stage.values && <T x={612} y={128} fs={11} tone="muted">30 MiB 目は親子とも a</T>}
      <T x={612} y={30} fs={11} bold>親（MiB）</T>
      <T x={612} y={48} fs={11}>{stage.parent[0]}</T>
      <T x={612} y={64} fs={11}>{stage.parent[1]}</T>
      <T x={612} y={200} fs={11} bold>子（MiB）</T>
      <T x={612} y={218} fs={11}>{stage.childNums[0]}</T>
      {stage.childNums[1] && <T x={612} y={234} fs={11}>{stage.childNums[1]}</T>}
    </Svg>
  )
}

const cowSteps = COW_STAGES.map((c, i) => ({ label: c.label, detail: <><CowStepSvg i={i + 1} stage={c.stage} /><p>{c.text}</p></> }))

/* ---------- 図9 シグナルを選ぶと終わり方が変わる（操作できる図） ---------- */
const SIGNALS = [
  { option: 'SIGTERM（trap あり）', name: 'SIGTERM', num: 15, lane: 0, exception: '', status: '0', text: 'signal.rb は trap のブロックでフラグを立て、ループが処理中の1件を終えてから終了しました。プログラムが自分で終わったので、終了ステータスは 0 です。' },
  { option: 'SIGTERM（trap なし）', name: 'SIGTERM', num: 15, lane: 1, exception: 'SignalException', status: '143 = 128 + 15', text: 'trap を登録していないと、Ruby はメインスレッドで SignalException を起こします。sig_ensure.rb では ensure が動いてから SIGTERM で終了し、bash は終了ステータス 143 を表示しました。' },
  { option: 'SIGINT（trap なし）', name: 'SIGINT', num: 2, lane: 1, exception: 'Interrupt', status: '130 = 128 + 2', text: '端末で Ctrl-C を押したときに届く SIGINT では、Interrupt が起きます。ensure が動いた後、例外のメッセージを標準エラーに出して終了し、終了ステータスは 130 でした。' },
  { option: 'SIGKILL', name: 'SIGKILL', num: 9, lane: 2, exception: '', status: '137 = 128 + 9', text: 'SIGKILL はプロセスが捕まえられず、カーネルがその場で終了させます。trap も ensure も動かず、終了ステータスは 137 です。猶予時間を過ぎた後の強制終了や、メモリーの上限を超えた場合にこの値になります。' },
]

function SignalPathFigure() {
  const [selected, setSelected] = useState(0)
  const sig = SIGNALS[selected]
  const lanes = [
    [['trap のブロックを実行', 'フラグを立てるだけ'], ['処理中の1件を終える', 'ループを抜ける'], ['exit で正常に終了', '終了ステータス 0']],
    [['例外を起こす', sig.lane === 1 ? sig.exception : 'SignalException・Interrupt'], ['ensure を実行', '後片付けが動く'], ['シグナルで終了', sig.lane === 1 ? `終了ステータス ${sig.status}` : '128 + シグナルの番号']],
    [['プロセスは何もできない', 'trap を登録できない'], ['ensure も動かない', '後片付けなし'], ['カーネルが終了させる', '終了ステータス 137 = 128 + 9']],
  ]
  const cols = [190, 400, 600]
  const widths = [180, 170, 170]
  return (
    <Figure n={figure(9)} title="送るシグナルとプロセスの終わり方（選ぶと通る経路が光る）" caption="signal.rb と sig_ensure.rb の実行結果をもとにした概念モデルです。終了ステータスは bash の wait が表示した値です。実際のアプリでは Puma のようにシグナルごとに独自の処理を登録しているプログラムもあり、その場合は経路が変わります。">
      <FigureChoices label="送るシグナル" options={SIGNALS.map((s) => s.option)} selected={selected} onSelect={setSelected} />
      <Svg id={figure(9)} w={780} h={236} label={`${sig.option}を送ると、${lanes[sig.lane].map((b) => b.join('、')).join('、次に')}。`}>
        <Box x={10} y={92} w={130} h={48} lines={[sig.name, `番号 ${sig.num}`]} fs={12} bold fill="box5" accent />
        {lanes.map((lane, l) => {
          const on = l === sig.lane
          const y = 20 + l * 76
          return (
            <g key={l}>
              <Arrow x1={140} y1={116} x2={cols[0] - 2} y2={y + 24} dashed={!on} accent={on} />
              {lane.map((lines, c) => (
                <g key={c}>
                  <Box x={cols[c]} y={y} w={widths[c]} h={48} lines={lines} fs={12} bold={on} fill={on ? 'box5' : 'none'} accent={on} dashed={!on} subTone="muted" />
                  {c < 2 && <Arrow x1={cols[c] + widths[c]} y1={y + 24} x2={cols[c + 1] - 2} y2={y + 24} dashed={!on} accent={on} />}
                </g>
              ))}
            </g>
          )
        })}
      </Svg>
      <p aria-live="polite">{sig.text}</p>
    </Figure>
  )
}

/* ---------- 図6 VSZ と RSS ---------- */
function VmFigure() {
  const x0 = 200
  const rows: [string, number, string][] = [
    ['① 確保した直後', 0, 'VSZ 652 / RSS 14'],
    ['② 先頭の 50 MiB に書いた', 50, 'VSZ 652 / RSS 64'],
    ['③ 200 MiB すべてに書いた', 200, 'VSZ 652 / RSS 214'],
  ]
  return (
    <Svg id={figure(6)} w={780} h={236} label="IO::Buffer で確保した200 MiB の範囲を横棒で表す。確保した直後は物理メモリーに載ったページがなく RSS は14 MiB のまま。先頭の50 MiB に書くと、その部分だけが物理メモリーに載り RSS は64 MiB。すべてに書くと RSS は214 MiB。VSZ はどの時点でも652 MiB。">
      <T x={x0} y={20} fs={12}>IO::Buffer で確保した 200 MiB の仮想アドレスの範囲（単位 MiB）</T>
      {rows.map(([label, filled, value], i) => {
        const y = 40 + i * 56
        return (
          <g key={label}>
            <T x={16} y={y + 17} fs={12}>{label}</T>
            <rect x={x0} y={y} width={400} height={34} rx={3} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
            {filled > 0 && <rect x={x0} y={y} width={filled * 2} height={34} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />}
            <T x={612} y={y + 17} fs={12} mono>{value}</T>
          </g>
        )
      })}
      <rect x={x0} y={208} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={x0 + 20} y={214} fs={11}>物理メモリーに載ったページ（RSS に入る）</T>
      <rect x={x0 + 260} y={208} width={14} height={12} fill="none" stroke="var(--fig-line)" strokeDasharray="3 3" />
      <T x={x0 + 280} y={214} fs={11}>確保しただけの範囲（VSZ に入る）</T>
    </Svg>
  )
}

/* ---------- 図7 パーミッション ---------- */
function PermFigure() {
  const parts: [number, number, string, string][] = [
    [30, 60, '-', '種類'],
    [100, 110, 'rw-', '所有者（app）'],
    [220, 110, 'r--', 'グループ（shop）'],
    [340, 110, '---', 'その他の利用者'],
  ]
  return (
    <Svg id={figure(7)} w={780} h={244} label="ls -l の -rw-r----- は、先頭の1文字が種類、続く3文字ずつが所有者、グループ、その他の利用者の権限を表す。r は4、w は2、x は1で、数字で書くと640。所有者の app は読み書きでき、shop グループの deploy は読めるが、その他の nginx は開けない。判定は所有者、グループ、その他の順に最初に当てはまった1組だけを使う。">
      {parts.map(([x, w, s, label]) => (
        <g key={label}>
          <Box x={x} y={20} w={w} h={40} lines={s} fs={18} mono fill={s === '-' ? 'bg' : 'box'} />
          <T x={x + w / 2} y={78} fs={12} anchor="middle">{label}</T>
        </g>
      ))}
      <T x={470} y={40} fs={15} mono>app shop production.log</T>
      <T x={470} y={78} fs={12}>r = 4（読む）  w = 2（書く）  x = 1（実行）</T>
      <T x={470} y={98} fs={12}>rw-r----- を数字で書くと 640</T>
      <Box x={30} y={120} w={230} h={52} lines={['app（所有者）', 'rw- → 読み書きできる']} fs={12} bold subTone="muted" />
      <Box x={275} y={120} w={230} h={52} lines={['deploy（shop グループ）', 'r-- → 読める']} fs={12} bold subTone="muted" />
      <Box x={520} y={120} w={230} h={52} lines={['nginx（その他）', '--- → 開けない']} fs={12} bold subTone="muted" />
      <T x={30} y={200} fs={11}>ディレクトリでは、r は名前の一覧、w は作成・削除・名前の変更、x は中のファイルへの到達を許す</T>
      <T x={30} y={222} fs={11} tone="muted">判定は所有者 → グループ → その他の順に、最初に当てはまった1組だけを使う（root は例外）</T>
    </Svg>
  )
}

/* ---------- 図8 FD の表 ---------- */
function FdFigure() {
  const rows: { fd: string; y: number }[] = [
    { fd: '0', y: 40 },
    { fd: '1', y: 76 },
    { fd: '2', y: 112 },
    { fd: '5', y: 148 },
    { fd: '9', y: 184 },
    { fd: '11（接続中）', y: 220 },
  ]
  return (
    <Svg id={figure(8)} w={780} h={316} label="Puma の FD の表の番号は、開いたファイルの記述を指し、その先にファイルやソケットがある。FD 0 は /dev/null、FD 1 と 2 は同じ記述を共有して puma.log を指す。FD 5 は 3000番の待ち受けソケット、FD 9 はパイプの読み取り側、FD 11 は curl との接続ソケット。">
      <T x={20} y={22} bold fs={12}>FD の表（PID 621）</T>
      <T x={260} y={22} bold fs={12}>開いたファイルの記述</T>
      <T x={540} y={22} bold fs={12}>対象</T>
      {rows.map((r) => (
        <Box key={r.fd} x={20} y={r.y} w={150} h={28} lines={r.fd} fs={12} mono />
      ))}
      <Box x={260} y={40} w={220} h={28} lines="/dev/null・読み書き" fs={11} fill="box2" />
      <Box x={260} y={76} w={220} h={64} lines={['puma.log・追記の位置', '1 と 2 が共有（2>&1）']} fs={11} fill="box2" subTone="muted" />
      <Box x={260} y={148} w={220} h={28} lines="待ち受けソケット" fs={11} fill="box2" />
      <Box x={260} y={184} w={220} h={28} lines="パイプの読み取り側" fs={11} fill="box2" />
      <Box x={260} y={220} w={220} h={28} lines="接続ソケット" fs={11} fill="box2" />
      <Box x={540} y={40} w={220} h={28} lines="/dev/null（デバイス）" fs={11} fill="box4" />
      <Box x={540} y={76} w={220} h={64} lines={['/work/puma.log', 'ファイル（inode）']} fs={11} fill="box4" subTone="muted" />
      <Box x={540} y={148} w={220} h={28} lines="TCP 0.0.0.0:3000 LISTEN" fs={11} mono fill="box4" />
      <Box x={540} y={184} w={220} h={28} lines="pipe:[1490326]" fs={11} mono fill="box4" />
      <Box x={540} y={220} w={220} h={28} lines="TCP :3000 ⇄ 127.0.0.1:40190" fs={11} mono fill="box4" />
      <Arrow x1={170} y1={54} x2={258} y2={54} />
      <Arrow x1={170} y1={90} x2={258} y2={100} />
      <Arrow x1={170} y1={126} x2={258} y2={116} />
      <Arrow x1={170} y1={162} x2={258} y2={162} />
      <Arrow x1={170} y1={198} x2={258} y2={198} />
      <Arrow x1={170} y1={234} x2={258} y2={234} accent />
      {[54, 108, 162, 198, 234].map((y) => (
        <Arrow key={y} x1={480} y1={y} x2={538} y2={y} />
      ))}
      <T x={20} y={278} fs={11}>fork した子は FD の表を複製し、同じ記述を指す。スレッドは FD の表そのものを共有する</T>
      <T x={20} y={300} fs={11} tone="muted">close(11) で表から 11 が消え、ほかに参照がなければ接続ソケットも解放される</T>
    </Svg>
  )
}

/* ---------- 図10 停止のシグナル ---------- */
function StopFigure() {
  return (
    <Svg id={figure(10)} w={780} h={226} label="上の段は SIGTERM を trap したプロセスで、処理中の1件を終えて終了ステータス0で終わる。下の段は猶予時間内に終わらないプロセスで、SIGTERM の後も処理が続き、猶予時間を過ぎると SIGKILL で強制終了し、終了ステータスは137になる。猶予時間は systemd の TimeoutStopSec= や ECS の stopTimeout で決まる。">
      <T x={20} y={20} bold fs={12}>停止の依頼から終了まで（systemd や ECS がプロセスを止める場合）</T>
      <T x={20} y={70} fs={11}>① TERM を trap して</T>
      <T x={20} y={86} fs={11}>処理中の1件を終える</T>
      <Box x={150} y={62} w={90} h={30} lines="処理中" fs={11} fill="box5" />
      <Box x={240} y={62} w={110} h={30} lines="1件を終える" fs={11} fill="box4" />
      <T x={240} y={38} fs={11} mono anchor="middle">SIGTERM</T>
      <Arrow x1={240} y1={46} x2={240} y2={60} accent />
      <T x={358} y={77} fs={11}>exit 0（終了ステータス 0）</T>
      <T x={20} y={140} fs={11}>② 猶予時間内に</T>
      <T x={20} y={156} fs={11}>終わらない</T>
      <Box x={150} y={132} w={90} h={30} lines="処理中" fs={11} fill="box5" />
      <Box x={240} y={132} w={360} h={30} lines="終わらない処理（猶予時間）" fs={11} fill="none" dashed />
      <T x={240} y={110} fs={11} mono anchor="middle">SIGTERM</T>
      <Arrow x1={240} y1={116} x2={240} y2={130} accent />
      <T x={600} y={110} fs={11} mono anchor="middle">SIGKILL</T>
      <Arrow x1={600} y1={116} x2={600} y2={130} accent />
      <T x={608} y={147} fs={11}>強制終了（137）</T>
      <T x={420} y={180} fs={11} anchor="middle" tone="muted">TimeoutStopSec=（systemd）・stopTimeout（ECS）</T>
      <Arrow x1={150} y1={204} x2={760} y2={204} />
      <T x={700} y={192} fs={11} tone="muted">時間</T>
    </Svg>
  )
}

const pumaStart = String.raw`
$ puma -t 3:3 -b tcp://0.0.0.0:3000 config.ru > puma.log 2>&1 &
$ ps -o pid,ppid,stat,nlwp,vsz,rss,args -p 621
  PID  PPID STAT NLWP    VSZ   RSS COMMAND
  621   615 Sl      8 883988 26036 puma 8.0.2 (tcp://0.0.0.0:3000) [work]
$ grep -E '^(Name|State|Pid|PPid|VmSize|VmRSS|RssAnon|RssFile|RssShmem|Threads):' /proc/621/status
Name:	ruby
State:	S (sleeping)
Pid:	621
PPid:	615
VmSize:	  883988 kB
VmRSS:	   26036 kB
RssAnon:	   13492 kB
RssFile:	   12544 kB
RssShmem:	       0 kB
Threads:	8
`

const straceRead = String.raw`
$ cat database.yml
production:
  pool: 5
$ strace -f -e trace=openat,read,write,close -o strace-read.txt \
    ruby -e 'puts File.read("database.yml").bytesize'
22
$ grep -A4 'database.yml' strace-read.txt
579   openat(AT_FDCWD, "database.yml", O_RDONLY|O_CLOEXEC) = 5
579   read(5, "production:\n  pool: 5\n", 22) = 22
579   read(5, "", 8192)                 = 0
579   close(5)                          = 0
579   write(1, "22\n", 3)               = 3
`

const straceCount = String.raw`
$ strace -f -c -o strace-c.txt ruby -e 'puts File.read("database.yml").bytesize'
$ cat strace-c.txt   （一部の行を省略）
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ------------------
 89.29    0.068173       68173         1           epoll_wait
  2.19    0.001674           6       278       109 openat
  1.38    0.001055           2       456       456 readlink
  0.98    0.000748           5       138           mmap
  0.57    0.000437           3       118           read
  0.52    0.000396           2       169           close
  0.03    0.000020          10         2           write
  0.00    0.000000           0         1         1 clone3
------ ----------- ----------- --------- --------- ------------------
100.00    0.076350          40      1875       670 total
`

const stracePuma = String.raw`
$ strace -f -tt -p 621 -o strace-puma.txt \
    -e trace=accept4,read,recvfrom,write,sendto,close,ppoll,pselect6,epoll_wait &
$ curl -s http://127.0.0.1:3000/articles
articles
$ cat strace-puma.txt
628   11:11:39.943447 pselect6(10, [5 9], NULL, NULL, NULL, NULL <unfinished ...>
626   11:11:39.943903 epoll_wait(8,  <unfinished ...>
622   11:11:39.944045 epoll_wait(4,  <unfinished ...>
628   11:11:41.045500 <... pselect6 resumed>) = 1 (in [5])
628   11:11:41.045882 accept4(5, {sa_family=AF_INET, sin_port=htons(40190), sin_addr=inet_addr("127.0.0.1")}, [2048 => 16], SOCK_CLOEXEC|SOCK_NONBLOCK) = 11
628   11:11:41.049577 write(3, "\1\0\0\0\0\0\0\0", 8) = 8
622   11:11:41.049760 <... epoll_wait resumed>[{events=EPOLLIN, data=0}], 16, -1) = 1
622   11:11:41.049867 read(3, "\1\0\0\0\0\0\0\0", 8) = 8
628   11:11:41.050031 pselect6(10, [5 9], NULL, NULL, NULL, NULL <unfinished ...>
622   11:11:41.050122 epoll_wait(4,  <unfinished ...>
623   11:11:41.050274 ppoll([{fd=11, events=POLLIN}], 1, {tv_sec=0, tv_nsec=0}, NULL, 8) = 1 ([{fd=11, revents=POLLIN}], left {tv_sec=0, tv_nsec=0})
623   11:11:41.050625 recvfrom(11, "GET /articles HTTP/1.1\r\nHost: 12"..., 65536, MSG_DONTWAIT, NULL, NULL) = 86
623   11:11:41.052008 sendto(11, "HTTP/1.1 200 OK\r\ncontent-type: t"..., 73, MSG_DONTWAIT, NULL, 0) = 73
623   11:11:41.052410 ppoll([{fd=11, events=POLLIN}], 1, {tv_sec=0, tv_nsec=0}, NULL, 8) = 1 ([{fd=11, revents=POLLIN}], left {tv_sec=0, tv_nsec=0})
623   11:11:41.054413 recvfrom(11, "", 65536, MSG_DONTWAIT, NULL, NULL) = 0
623   11:11:41.056011 close(11)         = 0
`

const pumaServerExcerpt = String.raw`
# lib/puma/server.rb（handle_servers の 343〜409 行目から抜粋）
sockets = [check] + @binder.ios
# ...
ios = IO.select sockets, nil, nil, (shutting_down? ? 0 : @idle_timeout)
# ...
io = begin
  sock.accept_nonblock
rescue IO::WaitReadable
  next
end
# ...
client = new_client(io, sock)
client.send(addr_send_name, addr_value) if addr_value
pool << client
`

const tasks = String.raw`
$ for t in /proc/621/task/*; do echo "$(basename $t) $(cat $t/comm)"; done
621 ruby
622 ruby
623 puma srv tp 001
624 puma srv tp 002
625 puma srv tp 003
626 puma reactor
627 puma srv tp rea
628 puma srv
`

const straceFork = String.raw`
$ strace -f -e trace=clone,clone3,wait4,exit_group -o strace-fork.txt \
    ruby -e 'pid = fork { exit 3 }; Process.wait(pid); p $?.exitstatus'
3
$ cat strace-fork.txt   （長い引数の一部を省略）
610   clone3({flags=CLONE_VM|CLONE_FS|CLONE_FILES|CLONE_SIGHAND|CLONE_THREAD|CLONE_SYSVSEM|CLONE_SETTLS|..., ...}, 88) = -1 ENOSYS (Function not implemented)
610   clone(child_stack=0x7f111385eeb0, flags=CLONE_VM|CLONE_FS|CLONE_FILES|CLONE_SIGHAND|CLONE_THREAD|CLONE_SYSVSEM|CLONE_SETTLS|CLONE_PARENT_SETTID|CLONE_CHILD_CLEARTID, ...) = 611
610   clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|CLONE_CHILD_SETTID|SIGCHLD, child_tidptr=0x7f112ce4e690) = 612
610   wait4(612,  <unfinished ...>
612   exit_group(3)                     = ?
612   +++ exited with 3 +++
610   <... wait4 resumed>[{WIFEXITED(s) && WEXITSTATUS(s) == 3}], 0, NULL) = 612
610   --- SIGCHLD {si_signo=SIGCHLD, si_code=CLD_EXITED, si_pid=612, si_uid=0, si_status=3, ...} ---
`

const zombieRb = String.raw`
# zombie.rb：終了した子を親が回収しないと、ゾンビ（Z）として残る
pid = fork { exit 0 }
sleep 1
system("ps -o pid,ppid,stat,args -p #{Process.pid},#{pid}")
Process.wait(pid)                       # 子の終了ステータスを受け取る（回収する）
state = %x(ps -o stat= -p #{pid}).strip
puts "回収した後: #{state.empty? ? "一覧にない" : state}"
`

const zombieOut = String.raw`
  PID  PPID STAT COMMAND
   27     0 Ssl  ruby /work/zombie.rb
   34    27 Z    [ruby] <defunct>
回収した後: 一覧にない
`

const cowRb = String.raw`
# cow.rb：fork した子が書き込むと、共有していたページが複製される
Warning[:experimental] = false
MiB = 1024 * 1024

def rollup(who, pid, label)
  r = File.read("/proc/#{pid}/smaps_rollup")
  kb = ->(key) { r[/^#{key}:\s+(\d+)/, 1].to_i / 1024 }
  shared  = kb["Shared_Clean"] + kb["Shared_Dirty"]
  private = kb["Private_Clean"] + kb["Private_Dirty"]
  puts format("%s Rss=%4d Pss=%4d Shared=%4d Private=%4d (MiB)  %s",
              who, kb["Rss"], kb["Pss"], shared, private, label)
end

buf = IO::Buffer.new(100 * MiB)
buf.clear(0x61)                 # 親で 100 MiB すべてに "a" を書き込んでおく
parent = Process.pid
rollup("親", parent, "fork の前")

rd, wr = IO.pipe
pid = fork do
  rollup("子", Process.pid, "fork の直後")
  rollup("親", parent, "fork の直後")
  buf.clear(0x62, 0, 25 * MiB)  # 子が先頭の 25 MiB を "b" に書き換える
  rollup("子", Process.pid, "子が 25 MiB を書き換えた後")
  rollup("親", parent, "子が 25 MiB を書き換えた後")
  wr.puts buf.get_string(0, 1) + buf.get_string(30 * MiB, 1)
end
Process.wait(pid)
puts "子が見た先頭と 30 MiB 目: #{rd.gets.chomp} / 親が見た先頭: #{buf.get_string(0, 1)}"
`

const cowOut = String.raw`
親 Rss= 114 Pss= 107 Shared=   8 Private= 106 (MiB)  fork の前
子 Rss= 110 Pss=  54 Shared= 108 Private=   0 (MiB)  fork の直後
親 Rss= 114 Pss=  55 Shared= 112 Private=   1 (MiB)  fork の直後
子 Rss= 110 Pss=  67 Shared=  83 Private=  26 (MiB)  子が 25 MiB を書き換えた後
親 Rss= 114 Pss=  67 Shared=  87 Private=  26 (MiB)  子が 25 MiB を書き換えた後
子が見た先頭と 30 MiB 目: ba / 親が見た先頭: a
`

const vmRb = String.raw`
# vm.rb：確保しただけの領域と、書き込んだ領域
Warning[:experimental] = false   # IO::Buffer の「実験的」の警告を出さない
MiB = 1024 * 1024

def mem(label)
  st = File.read("/proc/self/status")
  vsz = st[/^VmSize:\s+(\d+)/, 1].to_i / 1024
  rss = st[/^VmRSS:\s+(\d+)/, 1].to_i / 1024
  minflt = File.read("/proc/self/stat").split(") ").last.split[7].to_i
  puts format("VSZ=%4d MiB  RSS=%4d MiB  minflt=%6d  %s", vsz, rss, minflt, label)
end

mem("起動直後")
buf = IO::Buffer.new(200 * MiB)   # 200 MiB の領域を確保する（mmap で確保される）
mem("200 MiB を確保した後")
buf.clear(0x61, 0, 50 * MiB)       # 先頭の 50 MiB に "a" を書き込む
mem("先頭の 50 MiB に書き込んだ後")
buf.clear(0x62, 50 * MiB)          # 残りの 150 MiB に "b" を書き込む
mem("200 MiB すべてに書き込んだ後")
`

const vmOut = String.raw`
VSZ= 452 MiB  RSS=  14 MiB  minflt=  2579  起動直後
VSZ= 652 MiB  RSS=  14 MiB  minflt=  2581  200 MiB を確保した後
VSZ= 652 MiB  RSS=  64 MiB  minflt= 15382  先頭の 50 MiB に書き込んだ後
VSZ= 652 MiB  RSS= 214 MiB  minflt= 53782  200 MiB すべてに書き込んだ後
`

const smapsOut = String.raw`
7f8a8fbb0000-7f8a96090000 rw-p 00000000 00:00 0
Size:             103296 kB
Rss:              103296 kB
Pss:               64556 kB
Shared_Clean:          0 kB
Shared_Dirty:      77480 kB
Private_Clean:         0 kB
Private_Dirty:     25816 kB
Anonymous:        103296 kB
Swap:                  0 kB
`

const permOut = String.raw`
$ stat -c "%A %U:%G %n" /srv/shop/log /srv/shop/log/production.log /srv/shop/config/master.key
drwxr-xr-x root:root /srv/shop/log
-rw-r--r-- root:root /srv/shop/log/production.log
-rw------- root:root /srv/shop/config/master.key
$ su app -c 'ruby -e "File.open(%q(/srv/shop/log/production.log), %q(a)) { _1.puts 1 }"'
-e:1:in 'File#initialize': Permission denied @ rb_sysopen - /srv/shop/log/production.log (Errno::EACCES)
$ chown app:app /srv/shop/log/production.log      # 所有者を app に変える
$ su app -c 'ruby -e "File.open(%q(/srv/shop/log/production.log), %q(a)) { _1.puts 1 }; puts :ok"'
ok
$ chmod 700 /srv/shop/log                          # 親のディレクトリから、その他の x を外す
$ su app -c 'ruby -e "File.open(%q(/srv/shop/log/production.log), %q(a))"'
-e:1:in 'File#initialize': Permission denied @ rb_sysopen - /srv/shop/log/production.log (Errno::EACCES)
`

const permStrace = String.raw`
$ su app -c 'strace -e trace=openat -o /tmp/s.txt ruby -e "File.read(%q(/srv/shop/config/master.key))"'
-e:1:in 'IO.read': Permission denied @ rb_sysopen - /srv/shop/config/master.key (Errno::EACCES)
$ grep master.key /tmp/s.txt
openat(AT_FDCWD, "/srv/shop/config/master.key", O_RDONLY|O_CLOEXEC) = -1 EACCES (Permission denied)
`

const fdOpenRb = String.raw`
File.open("/work/database.yml") do |file|
  puts "FD: #{file.fileno}"
  puts file.gets
end
`

const fdList = String.raw`
$ ls -l /proc/621/fd | awk '{print $9, $10, $11}'
0 -> /dev/null
1 -> /work/puma.log
10 -> pipe:[1490326]
2 -> /work/puma.log
3 -> anon_inode:[eventfd]
4 -> anon_inode:[eventpoll]
5 -> socket:[1489304]
6 -> pipe:[1490325]
7 -> pipe:[1490325]
8 -> anon_inode:[eventpoll]
9 -> pipe:[1490326]
$ ss -ltnpe   （Puma の行だけ。後ろの列は省略）
State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
LISTEN 0      1024         0.0.0.0:3000       0.0.0.0:*    users:(("ruby",pid=621,fd=5)) ino:1489304
$ grep 'Max open files' /proc/621/limits
Max open files            1048576              1048576              files
`

const fdLeakRb = String.raw`
# fd_leak.rb：閉じ忘れたファイルが FD を使い切るまで
puts "上限（soft）: #{Process.getrlimit(:NOFILE).first}"
puts "開始時に開いている FD: #{Dir.children("/proc/self/fd").size}"
leaked = []
begin
  loop { leaked << File.open("/work/database.yml") }   # close しない
rescue Errno::EMFILE => e
  puts "#{leaked.size} 個開いたところで #{e.class}: #{e.message}"
  puts "最後に開けた FD の番号: #{leaked.last.fileno}"
end
leaked.each(&:close)
puts "close した後に開いた FD: #{File.open("/work/database.yml", &:fileno)}"
`

const fdLeakOut = String.raw`
$ ulimit -n 64; ruby fd_leak.rb
上限（soft）: 64
開始時に開いている FD: 6
59 個開いたところで Errno::EMFILE: Too many open files @ rb_sysopen - /work/database.yml
最後に開けた FD の番号: 63
close した後に開いた FD: 5
`

const signalRb = String.raw`
# signal.rb：SIGTERM を受けたら、処理中の1件を終えてから終了する
$stdout.sync = true
stopping = false
Signal.trap("TERM") { stopping = true }   # trap の中ではフラグだけを立てる

puts "PID #{Process.pid} で開始"
n = 0
until stopping
  n += 1
  sleep 0.5                                # 1件分の処理の代わり
end
puts "TERM を受けたので、#{n} 件目を終えて終了します"
`

const signalOut = String.raw`
$ ruby signal.rb & P=$!; sleep 3; kill -TERM $P; wait $P; echo "終了ステータス: $?"
PID 902 で開始
TERM を受けたので、3 件目を終えて終了します
終了ステータス: 0
$ ruby signal.rb & P=$!; sleep 3; kill -KILL $P; wait $P; echo "終了ステータス: $?"
PID 905 で開始
bash: line 1:   905 Killed                  ruby signal.rb
終了ステータス: 137
$ ruby -e 'sleep' & P=$!; sleep 3; kill -TERM $P; wait $P; echo "終了ステータス: $?"
終了ステータス: 143
`

const sigEnsureRb = String.raw`
# sig_ensure.rb：trap を登録せずにシグナルを受けたとき、ensure が動くかを確かめる
$stdout.sync = true
begin
  puts "PID #{Process.pid} で開始"
  sleep
ensure
  puts "ensure を実行（#{$!.class}: #{$!.message}）"
end
`

const sigEnsureSh = String.raw`
#!/bin/bash
# run_sig.sh：trap なしの sig_ensure.rb に3種類のシグナルを送る
set -m   # ジョブ制御を有効にする（無効だと & で起動したコマンドは SIGINT を無視する）
for sig in TERM INT KILL; do
  ruby sig_ensure.rb & P=$!; sleep 1.5; kill -$sig $P; wait $P; echo "SIG$sig 終了ステータス: $?"
done
`

const sigEnsureOut = String.raw`
$ bash run_sig.sh
PID 8 で開始
ensure を実行（SignalException: SIGTERM）
SIGTERM 終了ステータス: 143
PID 11 で開始
ensure を実行（Interrupt: ）
sig_ensure.rb:5:in 'Kernel#sleep': Interrupt
	from sig_ensure.rb:5:in '<main>'
SIGINT 終了ステータス: 130
PID 14 で開始
run_sig.sh: line 5:    14 Killed                  ruby sig_ensure.rb
SIGKILL 終了ステータス: 137
`

const cpuWaitRb = String.raw`
# cpu_wait.rb：経過時間・CPU 時間・CPU の順番待ちの時間を区間ごとに測る
require "mysql2"
require "json"

# /proc/self/task/<TID>/schedstat の2つ目の値は、実行できる状態で CPU を待った時間（ナノ秒）
def runq_wait
  File.read("/proc/self/task/#{Thread.current.native_thread_id}/schedstat").split[1].to_i / 1e9
end

def measure(label)
  wall0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  cpu0  = Process.clock_gettime(Process::CLOCK_THREAD_CPUTIME_ID)
  rq0   = runq_wait
  yield
  wall = Process.clock_gettime(Process::CLOCK_MONOTONIC) - wall0
  cpu  = Process.clock_gettime(Process::CLOCK_THREAD_CPUTIME_ID) - cpu0
  rq   = runq_wait - rq0
  puts format("経過 %4.0f ms  CPU %4.0f ms  CPU 待ち %4.0f ms  %s", wall * 1000, cpu * 1000, rq * 1000, label)
end

db = Mysql2::Client.new(host: "rbdemo-mysql", username: "root", password: "pass")
rows = Array.new(20_000) { |i| { id: i, title: "記事 #{i}", tags: %w[ruby rails] } }

measure("JSON に変換（20,000 件 × 5 回）") { 5.times { JSON.generate(rows) } }
measure("MySQL の SELECT SLEEP(0.2)") { db.query("SELECT SLEEP(0.2)") }
measure("200 回ファイルを読む（キャッシュ済み）") { 200.times { File.read("/work/config.ru") } }
`

const cpuWaitOut = String.raw`
経過  483 ms  CPU   52 ms  CPU 待ち  431 ms  JSON に変換（20,000 件 × 5 回）
経過  205 ms  CPU    0 ms  CPU 待ち    0 ms  MySQL の SELECT SLEEP(0.2)
経過    2 ms  CPU    2 ms  CPU 待ち    0 ms  200 回ファイルを読む（キャッシュ済み）
`

const ioWaitRb = String.raw`
# io_wait.rb（抜粋）。measure は前の cpu_wait.rb と同じ方法で経過時間・CPU 時間・CPU の順番待ちを測り、
# /proc/self/io の値の増分を表示する
def io_counters = File.read("/proc/self/io").scan(/(\w+): (\d+)/).to_h { |k, v| [k, v.to_i] }

block = "x" * 4096
measure("A. 4KB を書くたびに fsync（500 回）") do
  File.open("/tmp/iotest/a.log", "w") { |f| 500.times { f.write(block); f.fsync } }
end
measure("B. 4KB を書くだけ（500 回、fsync なし）") do
  File.open("/tmp/iotest/b.log", "w") { |f| 500.times { f.write(block) } }
end

# 256MB のファイルを書いて fsync し、そのページをページキャッシュから外してから読む
File.open("/tmp/iotest/big.bin", "w") { |f| 256.times { f.write("y" * 1_048_576) }; f.fsync }
File.open("/tmp/iotest/big.bin") { |f| f.advise(:dontneed) }
measure("C. 256MB を読む（ページキャッシュから外した後）") do
  File.open("/tmp/iotest/big.bin") { |f| nil while f.read(1_048_576) }
end
measure("D. 同じ 256MB をもう一度読む（ページキャッシュにある）") do
  File.open("/tmp/iotest/big.bin") { |f| nil while f.read(1_048_576) }
end
`

const ioWaitOut = String.raw`
$ cat /proc/pressure/io
cat: /proc/pressure/io: No such file or directory

18:03:36 開始
A. 4KB を書くたびに fsync（500 回）
  経過 3808.1 ms  CPU 100.4 ms  CPU の順番待ち 390.6 ms  それ以外の待ち 3317.0 ms
  /proc/self/io の増分: rchar 144  wchar 2048000  read_bytes 0  write_bytes 2048000
18:03:40 開始
B. 4KB を書くだけ（500 回、fsync なし）
  経過 2.3 ms  CPU 2.4 ms  CPU の順番待ち 0.0 ms  それ以外の待ち -0.0 ms
  /proc/self/io の増分: rchar 161  wchar 2048000  read_bytes 0  write_bytes 2048000
18:03:40 開始
C. 256MB を読む（ページキャッシュから外した後）
  経過 672.6 ms  CPU 357.5 ms  CPU の順番待ち 234.2 ms  それ以外の待ち 80.9 ms
  /proc/self/io の増分: rchar 268435625  wchar 0  read_bytes 268435456  write_bytes 0
18:03:41 開始
D. 同じ 256MB をもう一度読む（ページキャッシュにある）
  経過 579.1 ms  CPU 223.0 ms  CPU の順番待ち 356.0 ms  それ以外の待ち 0.1 ms
  /proc/self/io の増分: rchar 268435635  wchar 0  read_bytes 0  write_bytes 0
`

const iostatOut = String.raw`
# iostat -dxyt 1 sde の出力から、値のある行と主な列を抜き出したもの
時刻          r/s    rkB/s r_await     w/s    wkB/s w_await    f/s f_await aqu-sz  %util
18:03:37      0.0        0    0.00   304.0     2978    2.30  202.0    2.50   1.23   81.2
18:03:38      0.0        0    0.00   422.0     4160    2.07  282.0    2.32   1.54  101.0
18:03:39      0.0        0    0.00   377.0     3524    1.98  250.0    2.30   1.32   97.0
18:03:40      0.0        0    0.00   394.0     3672    2.01  264.0    2.34   1.41   97.0
18:03:41    185.2   125216    0.87   233.7   259616   90.60    2.0    5.00  21.34   58.4
18:03:42    200.0   135680    0.94     0.0        0    0.00    0.0    0.00   0.19   34.0
`

const chapter: Chapter = {
  number: 103,
  part: 5,
  title: "Rails を動かす Linux の基礎",
  summary: "Puma を例に、Linux がプロセスに CPU・メモリー・ファイル・ソケットを提供する仕組みを、/proc と strace で観察しながら学びます。",
  goals: [
    "カーネルとユーザー空間の役割を区別し、システムコールを strace で読む",
    "プロセスとスレッド、fork とコピーオンライトで共有されるものを区別する",
    "VSZ・RSS・PSS とページの関係を説明する",
    "パーミッション、ファイルディスクリプター、シグナルが Rails の運用で起こす問題を説明する",
  ],
  prerequisites: [94],
  sections: [
    {
      id: "process",
      title: "カーネル・ユーザー空間・プロセス",
      body: (
        <>
          <p>本番のサーバーで <code>bundle exec puma</code> を実行すると、Linux は Ruby のプログラムを読み込んで動かし始めます。その後、Puma が要求を受けてログを書き、DB に問い合わせる処理は、どれも Linux のカーネルを通して行われます。この章では、Rails の代わりに小さな Rack アプリを Puma で動かし、Linux がそのプロセスに CPU・メモリー・ファイル・ソケットをどう与えているかを、<code>/proc</code> と strace で観察します。</p>
          <p>検証には Docker のコンテナ（Debian 13、Ruby 4.0.9、Puma 8.0.2）を使いました。ホストは WSL2 の Linux 5.15 で、CPU は 4 個、Docker Engine は 20.10.17 です。PID などの番号や時刻は、実行するたびに変わります。</p>
          <Code lang="ruby" title="config.ru（記事の一覧の代わりに文字列を返す Rack アプリ）" code={String.raw`
run ->(env) {
  [200, { "content-type" => "text/plain" }, ["articles\n"]]
}
`} />
          <Code lang="bash" title="Puma を3スレッドで起動し、プロセスの状態を読む" code={pumaStart} />
          <p><Term en="process">プロセス</Term>は、実行中のプログラムと、そのプログラムのために OS が用意した状態をまとめた単位です。状態には仮想アドレス空間（プロセスから見えるメモリー）、開いているファイルの一覧、ユーザー ID、カレントディレクトリなどが入ります。OS はプロセスごとに PID（プロセス ID）を付けて区別します。上の出力では Puma の PID が 621、PPID（親プロセスの PID）が 615 です。PID 615 は Puma を起動したシェルです。</p>
          <p>ps の STAT 列の S は、何かを待って止まっている状態を表します。要求が来ていない Puma は新しい接続を待っているので S になります。続く l は複数のスレッドを持つことを、NLWP はスレッドの数（8）を表します。VSZ と RSS はメモリーの量（KiB 単位）で、読み方は「仮想メモリー」の節で説明します <Ref n={12} />。</p>
          <p>COMMAND の列は <code>puma 8.0.2 (tcp://0.0.0.0:3000) [work]</code> ですが、<code>/proc/621/status</code> の Name は ruby です。実行しているファイルは ruby で、Puma は起動後に表示用のコマンドライン（Ruby の <code>$0</code>）を書き換えています。ps で Puma が見つからないときは、表示名と実行ファイル名の両方で探します。</p>
          <p><code>/proc</code> の下のファイルはディスク上にはありません。読むたびに、カーネルがその時点の値を作って返します。<code>/proc/621/status</code> はプロセスの状態とメモリー、<code>/proc/621/task</code> はスレッド、<code>/proc/621/fd</code> は開いているファイルを表します <Ref n={3} />。ps や top もこれらのファイルを読んで表示しています。</p>
          <h3>カーネルとユーザー空間</h3>
          <p><Term en="kernel">カーネル</Term>は、CPU、メモリー、ディスク、ネットワークカードなどの装置を管理する OS の中心のプログラムです。CPU にはすべての命令を実行できるカーネルモードと、装置を直接操作する命令やほかのプロセスのメモリーへのアクセスが禁じられたユーザーモードがあります。Puma や ps のようなアプリケーションはユーザーモードで動き、このモードで使うメモリーの範囲をユーザー空間と呼びます。ディスクのファイルを読む、ソケットでデータを送るといった処理が必要になると、アプリケーションはシステムコールでカーネルに依頼し、カーネルが権限を確かめてから装置を操作します（図 {figure(1)}）<Ref n={1} />。</p>
          <Figure n={figure(1)} title="Puma のプロセスとカーネル" caption="簡略化した模式図です。カーネルの中の区分は説明のためのもので、実際には互いの機能を呼び合います。2つのプロセスは別々の仮想アドレス空間を持ち、相手のメモリーを直接は読めません。">
            <KernelFigure />
          </Figure>
          <p>この区別があるので、Puma のプロセスに不具合があっても ps のプロセスのメモリーを直接書き換えることはできず、ファイルを書き換えるときもカーネルによる権限の確認を受けます。一方で、ファイルを1回読むだけでも、ユーザーモードとカーネルモードの切り替えが起きます。次の節で、Ruby の1行がどれだけのシステムコールになるかを数えます。</p>
          <h3>終了したプロセスの回収</h3>
          <p>プロセスが終了しても、親が終了ステータスを受け取るまで、カーネルは PID と終了ステータスを残します。この状態をゾンビと呼び、ps の STAT は Z になります。Ruby では <code>Process.wait</code> で子の終了を待ち、終了ステータスを受け取ります <Ref n={13} />。</p>
          <Code lang="ruby" title="zombie.rb" code={zombieRb} />
          <Code lang="text" title="実行結果（Ruby 4.0.9）" code={zombieOut} />
          <p>子（PID 34）はすでに終了していますが、親が <code>Process.wait</code> を呼ぶまで <code>{'<defunct>'}</code> として一覧に残りました。ゾンビはメモリーをほとんど使いませんが、PID を1つずつ使います。Puma のクラスタモードではマスターがワーカーの終了を回収しています。ps で Z の行が増え続けるときは、その PPID の親プロセスが子を回収していないことを疑います。</p>
        </>
      ),
    },
    {
      id: "syscall",
      title: "システムコールを strace で見る",
      body: (
        <>
          <p><Term en="system call">システムコール</Term>は、ユーザーモードのプログラムがカーネルに処理を依頼する仕組みです。ファイルを開く openat、読む read、書く write、閉じる close のように、依頼の種類ごとに番号と名前が決まっています。Ruby の <code>File.read</code> も <code>puts</code> も libc（C の標準ライブラリ）を通して、最終的にこれらのシステムコールを呼びます <Ref n={1} />。</p>
          <p>strace は、指定したプロセスが呼んだシステムコールを、引数と戻り値とともに表示するコマンドです <Ref n={7} />。設定ファイルを読んでバイト数を表示するだけの Ruby を、strace の下で実行しました。<code>-f</code> は子プロセスやスレッドも追跡する指定、<code>-e trace=</code> は表示するシステムコールの種類、<code>-o</code> は出力先のファイルです。</p>
          <Code lang="bash" title="File.read と puts のシステムコール（strace 6.13）" code={straceRead} />
          <p>1行が1回のシステムコールで、先頭の 579 は呼び出したスレッドの ID（TID）です。openat はファイルを開き、戻り値の 5 がファイルディスクリプター（開いたファイルを指す番号。「ファイルディスクリプター」の節で説明します）です。続く <code>read(5, ..., 22)</code> は FD 5 から最大 22 バイトを読み、22 を返しました。2回目の read が 0 を返したのは、ファイルの終わりに達したためです。最後の <code>write(1, "22\n", 3)</code> は、puts が標準出力（FD 1）に3バイトを書いた呼び出しです。失敗したシステムコールは <code>= -1 EACCES (Permission denied)</code> のように、-1 とエラーの名前を返します（「ファイルシステムとパーミッション」の節で実例を見ます）。</p>
          <p>表示した5行は全体の一部です。同じプログラムを <code>-c</code>（呼び出しの回数と時間を集計する指定）を付けて実行しました。</p>
          <Code lang="text" title="システムコールの回数の集計" code={straceCount} />
          <p>1行の Ruby でも、起動から終了までに 1,875 回のシステムコールを呼んでいました。openat の errors の 109 回はすべて ENOENT（ファイルがない）で、動的リンカーが共有ライブラリを、Ruby が読み込むファイルを、候補のディレクトリから順に探した結果です。readlink の失敗の多くは EINVAL（シンボリックリンクではない）でした。errors の列は異常の数ではありません。失敗が想定どおりのものかは、strace の出力でパスとエラーの名前を見て判断します。time と seconds の列は strace を付けた状態で測った値なので、付けないときの時間の内訳としては使えません。回数と失敗の数を見るのに使います。</p>
          <Callout kind="warn" title="本番で strace を使う前に">
            strace で追跡しているプロセスは、システムコールのたびに止まって strace に情報を渡すため、遅くなります。また read や write の引数には送受信したデータの先頭（既定で 32 バイト。<code>-s</code> で変えられる）が出るので、Cookie やパスワードが出力ファイルに残ることがあります。本番では対象の PID と <code>-e trace=</code> を絞り、短い時間だけ実行し、出力ファイルの置き場所と削除の時期を決めておきます <Ref n={7} />。
          </Callout>
          <Callout title="Docker のコンテナで strace を使う場合">
            Docker は既定でコンテナから CAP_SYS_PTRACE（ほかのユーザーのプロセスを追跡する権限）を外します。この環境で、root から別のユーザー（rails）で動く ruby に <code>strace -p</code> で接続すると、<code>attach: ptrace(PTRACE_SEIZE, 78): Operation not permitted</code> で失敗しました。<code>docker run</code> に <code>--cap-add SYS_PTRACE</code> を付けたコンテナでは接続できました。strace から起動したプロセスと、同じユーザーのプロセスは、この環境では付けなくても追跡できました。Docker 20.10 の既定の seccomp の設定は、Linux 4.8 以上で ptrace を許可しています。ホストのカーネルの設定（Yama の ptrace_scope）によっては、同じユーザーのプロセスでも接続できないことがあります <Ref n={10} /><Ref n={11} />。
          </Callout>
          <h3>Puma が1件の要求を処理するときのシステムコール</h3>
          <p>次に、起動済みの Puma（PID 621）に <code>strace -p</code> で接続し、curl で1回だけ要求を送りました。<code>-tt</code> は時刻をマイクロ秒まで表示する指定です。ソケットの読み書きと待ち合わせに関係するシステムコールだけを表示しています。</p>
          <Code lang="text" title="Puma の1件の要求（strace 6.13、Puma 8.0.2）" code={stracePuma} />
          <p>行頭の番号で、どのスレッドが呼んだかが分かります（スレッドの名前は次の節で確かめます）。TID 628 の puma srv スレッドは pselect6 で FD 5（3000 番の待ち受けソケット）と FD 9（Puma が停止などの指示を受け取るパイプ）を同時に待っていました。curl が接続すると FD 5 が読める状態になって pselect6 が戻り、accept4 が接続済みの新しいソケットを FD 11 として返します。<code>sin_port=htons(40190)</code> は curl 側のポート番号です。</p>
          <p>その後の処理は TID 623 の puma srv tp 001 スレッドに移ります。recvfrom で要求の 86 バイトを読み、アプリの応答を作って sendto で 73 バイト（ヘッダーと本文の <code>articles\n</code>）を送りました。次の recvfrom が 0 を返したのは、curl が接続を閉じたことを表します。Puma は close(11) で FD 11 を閉じました。recvfrom と sendto はソケット用の読み書きで、MSG_DONTWAIT はデータがなければ待たずに戻る指定です。Puma はソケットを待たずに読み書きする方式で扱っているので、read と write ではなく MSG_DONTWAIT を付けた recvfrom と sendto が現れています（図 {figure(2)}）。</p>
          <p>FD 3 への write と read は eventfd（スレッドの間で通知を送るためのカーネルの機能）を使った通知です。TID 622 は Ruby が起動時に作るスレッドで、accept4 の直後にこの通知を受け取っています。アプリケーションのコードからは見えない処理ですが、strace にはこのような内部の呼び出しも現れます。</p>
          <Figure n={figure(2)} title="Puma が1件の要求を処理するときのシステムコール" caption="上の strace の出力を時間順に並べた図です。縦の点線が担当（curl、カーネル、Puma の2つのスレッド）を表し、上から下へ時間が進みます。TCP の接続の手順と eventfd の通知は省いています。">
            <PumaSyscallFigure />
          </Figure>
          <p>Puma のこの部分は <code>lib/puma/server.rb</code> の handle_servers メソッドです。IO.select が pselect6 に、accept_nonblock が accept4 に当たります <Ref n={16} />。</p>
          <Code lang="ruby" title="lib/puma/server.rb（Puma 8.0.2）" href={`${PM}/lib/puma/server.rb#L337-L409`} code={pumaServerExcerpt} />
          <p>accept_nonblock で受け取った接続は、<code>{'pool << client'}</code> でスレッドプールの待ち行列（todo）に入り、空いているスレッドが取り出して処理します。Puma の /stats が表示する backlog はこの待ち行列の長さです。カーネルが持つ「accept を待つ接続の待ち行列」とは別のもので、違いは <ChapterLink n={104} /> で扱います。</p>
        </>
      ),
    },
    {
      id: "thread",
      title: "プロセスとスレッド",
      body: (
        <>
          <p><Term en="thread">スレッド</Term>は、プロセスの中で命令を順に実行する流れです。Linux のカーネルはスレッドを1本ずつ CPU に割り当て、それぞれに TID を付けます。<code>/proc/621/task</code> の下には Puma のプロセスのスレッドが TID ごとに並んでいます。</p>
          <Code lang="bash" title="Puma のスレッドの TID と名前" code={tasks} />
          <p>TID 621 は最初からあるメインスレッドで、TID が PID と同じです。622 は Ruby が起動時に作るスレッドです。623〜625 の puma srv tp 001〜003 がアプリを実行するスレッドプールで、起動時の <code>-t 3:3</code> で3本にしました。puma reactor は要求を最後まで受信していない接続を待つスレッド（<ChapterLink n={23} section="cluster" />）、puma srv は前の節で accept4 を呼んでいたスレッドです。puma srv tp rea は、Puma のソースでは puma srv tp reap という名前を付けています。Linux のスレッドの名前は終端の文字を含めて 16 バイトまでなので、15 文字で切れています <Ref n={22} /><Ref n={26} />。<code>/proc/621/status</code> の Threads: 8 と、ps の NLWP 8 はこの8本を数えた値です。</p>
          <h3>clone の引数に表れる違い</h3>
          <p>スレッドもプロセスも、Linux では clone システムコールで作ります。Ruby で fork して子の終了を待つだけのプログラムを strace で追跡すると、スレッドを作る clone と、fork でプロセスを作る clone の違いが引数に現れます。</p>
          <Code lang="text" title="スレッドを作る clone と fork の clone" code={straceFork} />
          <p>1つ目と2つ目の行はスレッドを作る呼び出しで、CLONE_VM、CLONE_FS、CLONE_FILES、CLONE_SIGHAND、CLONE_THREAD が付いています。それぞれ、仮想アドレス空間、カレントディレクトリと umask、FD の表、シグナルの処理方法を元のスレッドと共有し、同じプロセス（スレッドグループ）に属することを指定します <Ref n={8} />。3つ目の行が fork で、これらの指定がなく、SIGCHLD（子が終了したら親にシグナルを送る指定）だけが付いています。子は親の仮想アドレス空間と FD の表を共有せず、複製を受け取ります（図 {figure(3)}）<Ref n={9} />。子が <code>exit 3</code> で終わると、親の wait4 が終了ステータス 3 を受け取り、親には SIGCHLD が届きました。</p>
          <p>最初の clone3 は -1 ENOSYS（未実装）を返し、すぐに clone で作り直しています。Docker 20.10 の既定の seccomp の設定は、CAP_SYS_ADMIN を持たないコンテナで clone3 に ENOSYS を返します。glibc は ENOSYS を受けると従来の clone を使います。ホストで直接実行すると、clone3 がそのまま成功することがあります <Ref n={11} />。</p>
          <Figure n={figure(3)} title="スレッドと fork で共有するもの" caption="clone に渡す指定の違いを、共有するものと別々に持つものに分けて示した図です。fork の子の PID は上の strace の値です。">
            <ShareFigure />
          </Figure>
          <p>共有するものが違うので、問題の起き方も違います。同じプロセスのスレッドは同じ Ruby のオブジェクトを読み書きできるため、Puma の3本のスレッドが同じハッシュを更新すると、実行の順序によって結果が変わります（<ChapterLink n={23} section="thread-safety" />）。また、Ruby のコードを同時に実行できるのは GVL を持つ1本だけです（<ChapterLink n={98} section="gvl" />）。プロセスはメモリーを共有しないので、1つのワーカーが異常終了してもほかのワーカーは動き続けますが、Rails を読み込んだメモリーをワーカーごとに持つことになります。次の節では fork した後にどれだけのメモリーを共有できるかを測ります。</p>
        </>
      ),
    },
    {
      id: "fork",
      title: "fork とコピーオンライト",
      body: (
        <>
          <p>fork の直後、子は親と同じ内容のメモリーを持って始まります。ただしカーネルはその時点ですべてのページ（メモリーを管理する単位。この環境では <code>getconf PAGESIZE</code> で 4,096 バイト）を複製するわけではありません。親と子のページ表（仮想アドレスと物理メモリーの対応表）を同じ物理ページに向け、両方に書き込み禁止の印を付けます。どちらかが書き込もうとすると CPU がページフォルトを起こしてカーネルに処理を移し、カーネルはそのページだけを複製してから書き込みを続けさせます。この方式を<Term en="copy-on-write">コピーオンライト</Term>と呼びます（図 {figure(4)}）<Ref n={9} /><Ref n={2} />。</p>
          <Figure n={figure(4)} title="コピーオンライトで1つのページを複製する" caption="2つのページだけに注目した模式図です。実際のページ表は多段の表で、カーネルは書き込み禁止の印を使って複製の時点を決めます。破線の矢印は書き込みを禁止した参照、実線は書き込みできる参照を表します。">
            <CowFigure />
          </Figure>
          <p>実際に共有される量を、<code>/proc/PID/smaps_rollup</code> で測りました。smaps_rollup はプロセスのメモリーを種類ごとに合計したファイルです <Ref n={5} />。親で 100 MiB の領域を確保してすべてに書き込み、fork した子がそのうち 25 MiB だけを書き換えます。Shared は親子で共有しているページ、Private はそのプロセスだけが使っているページの合計です。</p>
          <Code lang="ruby" title="cow.rb" code={cowRb} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、Linux 5.15）" code={cowOut} />
          <p>fork の直後、子の Rss は 110 MiB あるのに Private は 0 MiB で、ほぼすべてのページを親と共有していました。Pss は共有するページを使っているプロセスの数で割って配分した値で、親子とも約 55 MiB です。子が 25 MiB を書き換えると、子の Private が 26 MiB に増えました。親の Private も 26 MiB に増えています。書き換えられる前のページを、今は親だけが使っているからです。最後の行では、子が先頭を b に変えた後も親の先頭は a のままで、親子のメモリーが別々であることも確かめられます。</p>
          <p>図 {figure(5)} では cow.rb の 100 MiB を 25 MiB ずつに分け、fork の前から値を読むまでを段階ごとに進めます。どの範囲を親子で共有し、どの範囲を複製したかを、そのときの smaps_rollup の値と並べて確かめられます。</p>
          <Figure n={figure(5)} title="fork の前から書き込みの後までのページ（段階送り）" caption="cow.rb の実行結果をもとにした概念モデルです。25 MiB を1つの箱で表していますが、実際にはカーネルは 4 KiB のページごとに複製し、書き込んだページの分だけ Private が増えます。破線は親子が共有しているページへの参照、実線は1つのプロセスだけが使うページへの参照です。右の数値は Ruby 自身が使うメモリーも含みます。">
            <Stepper steps={cowSteps} />
          </Figure>
          <p>Puma の <code>preload_app!</code> は、マスターで Rails を読み込んでからワーカーを fork し、この共有を使います。Rails のアプリでの実測は <ChapterLink n={23} section="preload" /> にあります。そこでは、要求を処理した後のワーカーの Private が、起動直後より増えていました。ワーカーが新しいオブジェクトを作ったり GC がオブジェクトを解放したりすると、ヒープのページに書き込みが起きるためと考えられます（<ChapterLink n={97} section="gc" />）。</p>
          <h3>fork で受け継ぐ FD</h3>
          <p>fork で受け継ぐのはメモリーだけではありません。子は親の FD の表の複製を受け取り、同じ番号の FD は親と同じ「開いたファイル」を指します。Puma のクラスタモードでは、マスターが待ち受けソケットを開いてから fork するので、すべてのワーカーが同じソケットで accept できます。一方、fork の前にマスターで開いた MySQL の接続をワーカーがそのまま使うと、複数のプロセスが1本の TCP 接続に別々の要求を書き込むことになります。Active Record は fork を検知して接続プールを作り直しますが、自分で開いた Redis などの接続は <code>before_worker_boot</code> で開き直します（<ChapterLink n={23} section="preload" />）。</p>
        </>
      ),
    },
    {
      id: "memory",
      title: "仮想メモリー・ページ・VSZ と RSS",
      body: (
        <>
          <p>プログラムが使うアドレスを<Term en="virtual address">仮想アドレス</Term>と呼びます。カーネルはプロセスごとにページ表を管理し、仮想アドレスのページを物理メモリーのページやファイルの内容に対応づけます。2つのプロセスが同じ数値の仮想アドレスを使っていても、物理的に同じ場所を読み書きするとは限りません <Ref n={2} />。</p>
          <p>ps の VSZ（<code>/proc/PID/status</code> の VmSize）は、プロセスが確保している仮想アドレスの範囲の合計です。RSS（VmRSS）はそのうち今物理メモリーに載っているページの合計です <Ref n={3} />。2つがどれだけ違うかを、Ruby の IO::Buffer で確かめます。IO::Buffer.new はページの大きさより大きい領域を mmap（仮想アドレスの範囲を確保するシステムコール）で確保します。Ruby 4.0 では実験的な機能なので、警告を止めています <Ref n={15} />。</p>
          <Code lang="ruby" title="vm.rb" code={vmRb} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、Linux 5.15、ページは 4 KiB）" code={vmOut} />
          <p>200 MiB を確保した時点で VSZ は 200 MiB 増えましたが、RSS は 14 MiB のままでした。カーネルは仮想アドレスの範囲を予約しただけで、物理ページをまだ割り当てていません。先頭の 50 MiB に書き込むと RSS が 50 MiB 増え、minflt（ディスクの読み込みを伴わないページフォルトの回数）が 12,801 回増えました。50 MiB を 4 KiB で割ると 12,800 なので、初めて触ったページごとに1回ずつページフォルトが起き、そのたびにカーネルが物理ページを割り当てたことになります。残りの 150 MiB でも、minflt はちょうど 38,400 回増えています（図 {figure(6)}）<Ref n={23} />。</p>
          <Figure n={figure(6)} title="確保した範囲と、物理メモリーに載ったページ" caption="vm.rb の出力を、200 MiB の範囲に注目して描いた図です。右の数値はプロセス全体の VSZ と RSS（MiB）です。">
            <VmFigure />
          </Figure>
          <p>プロセスが触ったページに対応がないとき、CPU はページフォルトを起こしてカーネルに処理を渡します。初めて触る領域へのページの割り当てや、ファイルに対応するページの読み込みであれば、カーネルが処理を済ませて命令を再開させます。後者のようにディスクの読み込みを伴うものは majflt として数えます。アクセスする権限のないアドレスなら、カーネルはプロセスにシグナル（SIGSEGV）を送ります。「ページフォルトが起きた」という情報だけでは、プログラムが異常終了したとはいえません。</p>
          <p>OS はファイルの読み書きにも物理メモリーを使います。読み込んだ内容をページキャッシュに残すと、次の読み込みでは記憶装置へのアクセスを省ける場合があります。メモリーが足りなくなれば、カーネルは不要なページキャッシュを回収します。free コマンドの free の列（どの用途にも使っていないメモリー）だけを見ると、アプリケーションが使える余地を少なく見積もることがあります。</p>
          <p>このため VSZ はメモリーの使用量の判断には向きません。Ruby やスレッドのスタック、共有ライブラリは、使う予定の範囲を先に予約します。最初の節の Puma も、VSZ は 863 MiB（883,988 KiB）でしたが、RSS は 25 MiB でした。メモリー不足を調べるときは、RSS、共有を按分した PSS、コンテナならカーネルが cgroup ごとに集計した値を見ます。</p>
          <h3>/proc/PID/smaps の主な項目</h3>
          <p><code>/proc/PID/smaps</code> は仮想アドレスの範囲（マッピング）ごとに使用量を表示します。前の節の実験と同じく、子が 100 MiB の領域のうち 25 MiB を書き換えた後で、子の smaps からこの領域の項目を表示しました（主な行だけを抜き出しています）。</p>
          <Code lang="text" title="子の smaps の1項目（Linux 5.15）" code={smapsOut} />
          <p>1行目は仮想アドレスの範囲と権限です。rw-p は読み書きでき、プロセスごとの私的な領域であることを表し、ファイル名がないので無名の領域（Anonymous）です。Size が 100 MiB（102,400 kB）より少し大きいのは、隣の無名の領域と1つにまとめて表示されているためと考えられます。Rss は物理メモリーに載っている量で、ここでは全体が載っています。Shared_Dirty は書き込み済みで親と共有しているページ、Private_Dirty はこのプロセスだけが使う書き込み済みのページです。Pss の 64,556 kB は Private_Dirty の 25,816 kB に、親子の2つで共有する 77,480 kB の半分を足した値です。Swap はスワップ領域に移された量です <Ref n={5} />。</p>
          <p>Rails のワーカー1つの smaps には数百のマッピングが並びます。合計だけが必要なら smaps_rollup を読みます。Clean（ファイルの内容と同じで、捨てても読み直せるページ）と Dirty（書き換えられたページ）の区別は、メモリーが不足したときにカーネルがどのページを回収しやすいかに関係します。</p>
        </>
      ),
    },
    {
      id: "allocation",
      title: "ワーカーを増やす前にメモリーを見積もる",
      body: (
        <>
          <p>たとえば Puma のワーカーを増やす際、各ワーカーで RSS が 150 MiB と表示されたとします。二つとも読んでいる 80 MiB のページを共有する単純な例では、二つの RSS は合計 300 MiB でも、この二つのプロセスが使用している物理ページの合計は 220 MiB です。PSS で数えると、共有の 80 MiB を 40 MiB ずつ按分するので、各ワーカーは 110 MiB、合計は 220 MiB になります。fork の節の実測でも、子が書き換える前は親子の Pss がそれぞれ Rss の約半分でした。</p>
          <p>ただし、起動直後に共有できるメモリーがそのまま安定して残るとは限りません。一部のページへの書き込みが進むと、コピーオンライトにより共有量が減ります。Rails が一度も表示していない画面を開いたときに、読み込む定数やメモリー上のデータが増える場合もあります。ワーカー数を決めるときは、起動後に代表的な処理を行い、落ち着いた時点とピーク時の利用量を調べます。</p>
          <p>コンテナの上限を考える場合は、プロセス一覧の RSS に加えて、カーネルが cgroup に集計する利用量も確認します。cgroup はプロセスをグループとして扱い、利用できるリソースを管理する仕組みです <Ref n={6} />。複数の処理を同じグループで実行している場合、そこに含まれるプロセスやファイルのページキャッシュの影響を受けます。個々のプロセスを足した値と指標の定義が異なるのはそのためです。cgroup の上限を超えるとカーネルがグループ内のプロセスを SIGKILL で止めることがあり、その場合の終了ステータスは「シグナル」の節で見る 137 になります。</p>
          <p>単一のコンテナに置くワーカーを増やすか、コンテナを増やすかでも、失われる処理能力が異なります。前者ではメモリーを共有しやすい場合がありますが、一つのコンテナを止めるとその中のすべてのワーカーが止まります。後者では別ホストに分ける選択肢がある一方、ルーティング、ヘルスチェック、DB 接続数も変わります。通常時のメモリーだけでなく、入れ替え時や片方が止まった状態で比較します。Puma のワーカーとスレッドの数の決め方は <ChapterLink n={113} /> で扱います。</p>
          <Ref n={3} />
          <Ref n={5} />
        </>
      ),
    },
    {
      id: "filesystem",
      title: "ファイルシステムとパーミッション",
      body: (
        <>
          <p>ファイルシステムは、記憶装置のデータをファイルとディレクトリとして管理する仕組みです。Linux ではファイルごとに inode というデータがあり、所有者（ユーザー ID）、グループ、パーミッション（誰に何を許すか）、大きさ、更新時刻などを記録しています。ファイルの名前はディレクトリの中で名前と inode を対応づけた項目です。ログのローテーションで名前を変えても、すでに開いている FD が別のファイルを指すようにはならないのは、FD が名前ではなく inode の側を指しているからです。そのため、新しいパスへ書き出すためにアプリケーション側でファイルを開き直す方式もあります（Puma の SIGHUP は「シグナル」の節の表を参照）。</p>
          <p>パーミッションは、所有者・グループ・その他の利用者の3組に、読み取り（r）、書き込み（w）、実行（x）の許可を付けたものです（図 {figure(7)}）。カーネルは、プロセスのユーザーがファイルの所有者なら所有者の組を、そうでなくファイルのグループに属していればグループの組を、どちらでもなければその他の組を使い、最初に当てはまった1組だけで判定します <Ref n={19} />。</p>
          <Figure n={figure(7)} title="パーミッションの読み方" caption="ls -l や stat の1列目の読み方を示した図です。root は通常この判定を受けません。ACL などの追加の仕組みを使う場合は判定が変わります。">
            <PermFigure />
          </Figure>
          <p>Rails のファイルを root で配置し、Puma を app ユーザーで動かす構成を想定して、ログに追記できるかを試しました。Ruby がファイルを開くときに、カーネルがこの判定を行います。</p>
          <Code lang="bash" title="app ユーザーの Ruby からログに追記する（Debian 13）" code={permOut} />
          <p>production.log の所有者は root で、パーミッションは rw-r--r-- です。app は所有者でもグループでもないので、その他の r-- が使われ、追記のための open が Errno::EACCES で失敗しました。所有者を app に変えると成功しました。最後の例では、ファイル自体は app が所有していますが、親のディレクトリ <code>/srv/shop/log</code> からその他の x を外したため、パスをたどれずに同じエラーになりました。ディレクトリの x は中の名前を使ってファイルに到達するための許可です <Ref n={19} />。</p>
          <p>strace で見ると、この失敗はカーネルが openat に -1 EACCES を返したものです。Ruby の Errno::EACCES はこのエラー番号を例外にしたものです。</p>
          <Code lang="bash" title="EACCES を返した openat" code={permStrace} />
          <p>新しく作るファイルのパーミッションは、プロセスの umask で決まります。この環境の umask は 0022 で、touch で作ったファイルは 644（rw-r--r--）、mkdir で作ったディレクトリは 755（rwxr-xr-x）になりました。Rails では log/、tmp/（pids、sockets、cache）、storage/ に Puma のユーザーが書き込める必要があります。<code>config/master.key</code> は、所有者だけが読める 600 にするのが一般的です。配置の作業を root で行うと、root が所有するファイルが混ざり、起動後に書き込めないことがあります。Permission denied の原因の調べ方は、第6部の演習「<a href="#/linux/case16">Permission denied の原因を探す</a>」で練習できます。</p>
        </>
      ),
    },
    {
      id: "descriptors",
      title: "ファイルディスクリプター",
      body: (
        <>
          <p><Term en="file descriptor">ファイルディスクリプター</Term>（FD）は、プロセスが開いているファイルを指す番号です。openat や accept4 が成功すると、カーネルはプロセスの FD の表に項目を追加して番号を返し、以後の read・write・close はその番号で対象を指定します。0 は標準入力、1 は標準出力、2 は標準エラー出力として使う決まりです。番号には開いていない番号のうち最も小さいものが使われます <Ref n={4} />。</p>
          <Code lang="ruby" title="ファイルを開いている間の FD を表示する" code={fdOpenRb} />
          <p>この実行では <code>FD: 5</code> と <code>production:</code> が表示されました。0〜4 を Ruby がすでに使っていたので、5 が選ばれています。ブロックが終わると Ruby がファイルを閉じます。先頭の1行を要求しても、Ruby のバッファーやカーネルのページキャッシュがあるので、毎回ちょうど1行分を記憶装置から読むとは限りません。</p>
          <h3>Puma が開いている FD</h3>
          <p>Puma（PID 621）の FD を <code>/proc/621/fd</code> で一覧すると、次のようになりました。ls は名前を文字列として並べるので、10 が 1 の次に来ています <Ref n={20} />。</p>
          <Code lang="bash" title="Puma の FD と待ち受けソケット" code={fdList} />
          <p>1 と 2 は起動時のリダイレクト（<code>{'> puma.log 2>&1'}</code>）で同じログファイルを指しています。5 は <code>socket:[1489304]</code> で、ss の <code>ino:1489304</code> と同じ番号なので、3000 番の待ち受けソケットだと分かります。ss の Send-Q の 1024 は、待ち受けソケットでは accept を待つ接続を何本まで並べるかの上限です（<ChapterLink n={104} />）。3・4・8 は Ruby の VM と Puma の reactor が内部の通知と待ち合わせに使う FD で、前の strace でも TID 622 が FD 4 で、reactor が FD 8 で epoll_wait を呼んでいました。9 と 10 は Puma の accept のループが停止の指示などを受け取るパイプです。</p>
          <p>ソケットも FD です。strace の節では、accept4 が新しい接続に FD 11 を返し、処理の後に close(11) で閉じていました。同時に 500 本の接続を受けていれば、待ち受けのソケットとは別に、接続ソケットの FD が 500 個開きます。Nginx から Puma、Puma から MySQL や Redis への接続も、それぞれ1つずつ FD を使います。</p>
          <Figure n={figure(8)} title="FD の番号から対象のファイルやソケットまで" caption="Puma の FD の一部を、カーネルの中の対応とともに示した模式図です。番号は上の /proc/621/fd の値です。">
            <FdFigure />
          </Figure>
          <p>図のとおり、FD の番号はプロセスごとの表の番号で、その先に「開いたファイルの記述」（読み書きの位置やフラグを持つカーネルのデータ）があり、さらにその先にファイルの inode やソケットがあります。<code>{'2>&1'}</code> や dup で複製した FD と、fork で子に複製した FD は、同じ記述を共有します。そのため、親子が同じログファイルの FD に書けば、書き込む位置も共有されます <Ref n={4} />。</p>
          <h3>FD の上限（ulimit -n）</h3>
          <p>1つのプロセスが開ける FD の数には上限（RLIMIT_NOFILE）があります。上限には、カーネルが実際に適用する soft と、soft を引き上げられる最大値の hard の2つがあり、<code>ulimit -n</code> で soft を、<code>ulimit -Hn</code> で hard を表示できます。上限に達すると、open や accept は EMFILE（Too many open files）で失敗します <Ref n={18} />。上限を 64 にして、ファイルを閉じずに開き続けるプログラムを実行しました。</p>
          <Code lang="ruby" title="fd_leak.rb" code={fdLeakRb} />
          <Code lang="bash" title="実行結果（Ruby 4.0.9）" code={fdLeakOut} />
          <p>上限 64 に対して、最後に開けた FD は 63 でした。上限は「開ける FD の番号の最大値 + 1」を表します。開始時の6個には一覧を読むために Ruby が一時的に開いたディレクトリの FD も入っています。それを除いた 0〜4 の5個に 59 個を足した 64 個で止まりました。すべて close した後に開いたファイルは、再び最も小さい 5 番を使いました。</p>
          <p>Puma の上限は <code>/proc/621/limits</code> の Max open files で確かめられます。この Docker の環境では soft・hard とも 1,048,576 でした。上限の既定値は起動のしかたによって違い、systemd のサービスでは unit ファイルの <code>LimitNOFILE=</code> で指定します <Ref n={25} />。Too many open files が出たときに上限を上げれば、使える FD は増えます。しかし閉じ忘れで FD が増え続けているなら、上限に達する時刻が遅くなるだけです。<code>/proc/PID/fd</code> の数を時間をおいて数え、負荷が下がっても減らないかを確かめます。第6部の演習「<a href="#/linux/case30">Too many open files を直す</a>」では、この調べ方と上限の変更を練習できます。</p>
        </>
      ),
    },
    {
      id: "signal",
      title: "シグナル",
      body: (
        <>
          <p><Term en="signal">シグナル</Term>は、カーネルがプロセスに送る短い通知です。kill コマンド（kill システムコール）で送るほか、端末で Ctrl-C を押したとき（SIGINT）や子プロセスが終了したとき（SIGCHLD）にもカーネルが送ります。fork の strace の最後にあった <code>--- SIGCHLD ---</code> の行は、子が終了したことを親に知らせたシグナルです。</p>
          <p>シグナルを受けたプロセスは種類ごとに決まった既定の動作（終了、無視、停止など）をします。プログラムはほとんどのシグナルについて、既定の動作の代わりに自分の処理を登録できます。SIGKILL と SIGSTOP だけは処理を登録できず、無視もできません <Ref n={17} />。</p>
          <div className="table-wrap">
            <table>
              <caption>Rails の運用でよく見るシグナル（番号は x86 の Linux）</caption>
              <thead><tr><th scope="col">シグナル</th><th scope="col">番号</th><th scope="col">既定の動作</th><th scope="col">よく使われる場面</th></tr></thead>
              <tbody>
                <tr><th scope="row"><code>SIGHUP</code></th><td>1</td><td>終了</td><td>端末の切断。Puma ではログファイルの開き直し（<code>stdout_redirect</code> を設定した場合）</td></tr>
                <tr><th scope="row"><code>SIGINT</code></th><td>2</td><td>終了</td><td>端末で Ctrl-C を押す</td></tr>
                <tr><th scope="row"><code>SIGKILL</code></th><td>9</td><td>終了（処理を登録できない）</td><td>猶予時間を過ぎた後の強制終了</td></tr>
                <tr><th scope="row"><code>SIGUSR1</code></th><td>10</td><td>終了</td><td>Puma ではワーカーを順に入れ替える（phased restart）</td></tr>
                <tr><th scope="row"><code>SIGUSR2</code></th><td>12</td><td>終了</td><td>Puma では全体の再起動（hot restart）</td></tr>
                <tr><th scope="row"><code>SIGTERM</code></th><td>15</td><td>終了</td><td>停止の依頼。systemd や ECS が最初に送る</td></tr>
                <tr><th scope="row"><code>SIGCHLD</code></th><td>17</td><td>無視</td><td>子プロセスの終了の通知</td></tr>
              </tbody>
            </table>
          </div>
          <p>Ruby では <code>Signal.trap</code> で処理を登録します <Ref n={14} />。SIGTERM を受けたら処理中の1件を終えてから終了するプログラムを書き、SIGTERM と SIGKILL を送って比べました。</p>
          <Code lang="ruby" title="signal.rb" code={signalRb} />
          <Code lang="bash" title="SIGTERM と SIGKILL を送る（Ruby 4.0.9、bash）" code={signalOut} />
          <p>SIGTERM では trap の処理が動き、ループを抜けて正常に終了しました（終了ステータス 0）。SIGKILL ではプログラムに処理の機会がなく、カーネルがその場で終了させました。シェルはシグナルで終了したプロセスの終了ステータスを 128 + シグナルの番号で表します <Ref n={24} />。137 は SIGKILL（9）での終了、trap を登録していない ruby に SIGTERM を送ったときの 143 は SIGTERM（15）での終了です。コンテナのログや ECS の画面で終了コード 137 を見たら、SIGKILL で止められた可能性を考えます。メモリーの上限を超えてカーネルに止められた場合も 137 になります。</p>
          <p>trap のブロックは、メインスレッドが実行中の処理を中断して実行されます。ブロックの中で Mutex を使うと ThreadError（<code>can't be called from trap context</code>）になったので、上の例ではフラグを立てるだけにし、終了の処理はループの側で行っています。</p>
          <p>trap を登録していないプロセスでも、受け取るシグナルによって終わり方が変わります。ensure を書いた sig_ensure.rb に、SIGTERM・SIGINT・SIGKILL を送りました。スクリプトとして動かす bash はジョブ制御が無効で、<code>&amp;</code> で起動したコマンドは SIGINT を無視するので、<code>set -m</code> でジョブ制御を有効にしています <Ref n={31} />。</p>
          <Code lang="ruby" title="sig_ensure.rb" code={sigEnsureRb} />
          <Code lang="bash" title="run_sig.sh" code={sigEnsureSh} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、bash 5.2）" code={sigEnsureOut} />
          <p>SIGTERM では SignalException、SIGINT では Interrupt という例外がメインスレッドで起き、どちらも ensure が動いてから終了しました。終了ステータスは 128 + シグナルの番号の 143 と 130 です。SIGKILL では ensure は動きませんでした。図 {figure(9)} で送るシグナルを選ぶと、プロセスの終わり方と終了ステータスが変わります。</p>
          <SignalPathFigure />
          <Figure n={figure(10)} title="停止の依頼から終了まで" caption="systemd や ECS がプロセスを止めるときの順序を簡略化した図です。猶予時間の長さと、SIGTERM の代わりに送るシグナルは設定で変えられます。">
            <StopFigure />
          </Figure>
          <p>systemd はサービスを止めるときに SIGTERM を送り、<code>TimeoutStopSec=</code> の時間が過ぎても終わらなければ SIGKILL を送ります <Ref n={27} />。ECS もタスクを止めるときに同じ順でシグナルを送ります <Ref n={28} />。Puma のワーカーは SIGTERM を受けると、処理中の要求を終えてから終了しようとします <Ref n={29} />。SIGUSR1・SIGUSR2 による再起動の違いは <ChapterLink n={23} section="puma-commands" /> で扱います。ECS で猶予時間が足りずに処理中のジョブが失われる例は第6部の演習「<a href="#/linux/case39">デプロイのあと、処理中だったジョブが消えた</a>」、端末を閉じたときの SIGHUP は「<a href="#/linux/case32">長時間の作業が途中で止まっていた</a>」で扱います。</p>
        </>
      ),
    },
    {
      id: "observation",
      title: "CPU・メモリー・I/O を区別する",
      body: (
        <>
          <p>CPU を使う時間は、Ruby が文字列の整形や JSON への変換をしている間などに積み上がります。経過時間には CPU を使っていない間も入ります。たとえば CPU 時間が短く経過時間が長い要求では、DB の応答、接続プール、別のスレッドからの通知などを待っていた可能性があります。もう1つ、CPU を使える状態なのに CPU が空かずに待つ時間も経過時間に入ります。</p>
          <p>この3つを区間ごとに分けて測りました。<code>/proc/self/task/TID/schedstat</code> の2つ目の値は、そのスレッドが実行できる状態で CPU を待った時間の合計です <Ref n={21} />。CPU 時間は <code>Process.clock_gettime</code> の CLOCK_THREAD_CPUTIME_ID で測ります <Ref n={13} />。</p>
          <Code lang="ruby" title="cpu_wait.rb" code={cpuWaitRb} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、MySQL 8.4.13、4 CPU、負荷平均は約 25）" code={cpuWaitOut} />
          <p>JSON の変換では CPU を 52 ms 使いましたが、経過時間は 483 ms でした。差のほとんど（431 ms）は CPU の順番待ちです。測定したとき、同じマシンでは別の作業が動いていて、4 CPU に対して負荷平均（load average）が約 25 ありました。同じスクリプトを3回実行すると、JSON の変換の CPU 時間は 47〜53 ms でほぼ同じでしたが、経過時間は 369〜625 ms と大きく変わりました。MySQL の <code>SELECT SLEEP(0.2)</code> は CPU 時間も順番待ちもほぼ 0 で、経過時間の大部分はソケットで MySQL の応答を待った時間です。キャッシュ済みのファイルの読み込みは、システムコールを呼んでもディスクを待たず、CPU 時間とほぼ同じ時間で終わりました。</p>
          <p>カーネルのスケジューラーは、実行できるスレッドに CPU の時間を割り当てます。DB の応答を待つスレッドは、その間にほかのスレッドへ CPU を譲れます。二つの要求を同時に受け付けても、二つのスレッドが常に同時に CPU を使うわけではありません。CPU の数のほか、cgroup による CPU の割り当ての上限や、Ruby のコードを実行する際の GVL も関係します <Ref n={6} />。</p>
          <p>同じ「遅い」でも、CPU の順番待ちが長いなら CPU の数や同時に動かすプロセス・スレッドの数を見直し、それ以外の待ちが長いなら待っている相手（DB、外部 API、ディスク）を調べます。Ruby のスレッドが GVL の空きを待つ時間は、カーネルから見るとスレッドが眠っている時間なので、この方法では「それ以外の待ち」に入ります（<ChapterLink n={98} section="gvl" />）。</p>
          <p>ps の STAT でも、待ちの種類の一部が分かります。R は実行中か CPU の順番待ち、S はソケットのデータやタイマーなどを待って眠っている状態、D は主にディスクの I/O を待つ割り込めない眠り、Z はゾンビです <Ref n={12} />。Linux の負荷平均は R と D のスレッドの数の平均です <Ref n={30} />。そのため、CPU に余裕があってもディスクの待ちが多ければ負荷平均は上がります。</p>
          <p>プロセスに見える仮想サイズと、現在物理メモリーに載っている部分の大きさも区別します。共有ページも個々のプロセスの RSS に含まれ得るため、ワーカーの RSS を足すと、同じ物理ページを重複して数える場合があります。逆にコンテナのメモリー上限と比較する場合は、そのコンテナの計測値の範囲や、回収できるページキャッシュを確認します。</p>
          <p>I/O の待ちが長く見える場合は、処理対象と測定する場所をそろえます。たとえば Web サーバーで DB の応答を待っていても、ディスクを読んでいるのは別のマシンの MySQL かもしれません。MySQL がロックを待っているなら、ディスクを交換しても同じクエリの待ちが減るとは限りません。どのプロセスが何を要求し、次にどこで処理されるかを追うと、調査の範囲を絞れます。</p>
          <h3>ディスクの読み書きを待つ時間を測る</h3>
          <p>経過時間から CPU 時間と CPU の順番待ちを引いた「それ以外の待ち」には、ディスクの読み書きを待つ時間も入ります。待っている相手がディスクかどうかは、3つの場所の値で確かめます。プロセスごとの読み書きの量は <code>/proc/PID/io</code>、ディスク装置ごとの1件あたりの時間と忙しさは <code>iostat -x</code>、システム全体でディスクを待って止まっていた時間の割合は <code>/proc/pressure/io</code>（PSI）で読みます。</p>
          <p>Docker のコンテナ（ruby:4.0 に sysstat 12.7.5 を入れたもの）で、ディスクを待つ処理と待たない処理を比べました。<code>fsync</code> は、ファイルに書いた内容がディスク装置に書き込まれるまで待つシステムコールです。<code>IO#advise(:dontneed)</code> はそのファイルのページをページキャッシュから外すようカーネルに伝えます <Ref n={35} />。同時に、別のプロセスで <code>iostat -dxyt 1 sde</code> を動かしました。sde はこのコンテナのファイルシステムがあるディスク装置です。</p>
          <Code lang="ruby" title="io_wait.rb（抜粋）" code={ioWaitRb} />
          <Code lang="text" title="実行結果（Ruby 4.0.9、WSL2 の Linux 5.15.167.4、4 CPU。ほかの作業も動いている）" code={ioWaitOut} />
          <p>A は経過 3,808 ms のうち、CPU 時間と CPU の順番待ちを除いた 3,317 ms が「それ以外の待ち」で、<code>fsync</code> 1回あたり約 6.6 ms です。fsync を呼ばない B は同じ量を書いても 2.3 ms で終わりました。B の <code>write</code> はページキャッシュを書き換えるだけで、ディスクへの書き込みはカーネルが後でまとめて行うからです。</p>
          <p><code>/proc/PID/io</code> の rchar と wchar は read や write のシステムコールで読み書きしたバイト数で、ページキャッシュから読んだ分も含みます。read_bytes はディスク装置から実際に読み込んだバイト数、write_bytes はディスク装置へ送られるバイト数です <Ref n={32} />。C と D はどちらも rchar が約 256MB ですが、read_bytes が 268,435,456 になったのはページキャッシュから外した後の C だけでした。一方、write_bytes は A でも B でも 2,048,000 でした。write_bytes はページキャッシュを書き換えた時点で数えるので <Ref n={36} />、そのプロセスが書き込みを待ったかどうかは分かりません。読み書きの量は <code>/proc/PID/io</code> で、待った時間は「それ以外の待ち」で確かめます。</p>
          <Code lang="text" title="同じ時間の iostat -x（sde）" code={iostatOut} />
          <p><code>iostat -x</code> の r_await と w_await は、読み込みと書き込みの要求1件がディスク装置に出されてから終わるまでの平均時間（ms）で、装置の待ち行列で待った時間を含みます。f/s と f_await は書いた内容を装置に確定させる要求（flush）の数と平均時間です。aqu-sz は待ち行列の平均の長さ、%util は装置が要求を処理していた時間の割合です <Ref n={33} />。A を実行した 18:03:37〜18:03:40 には書き込みが毎秒 300〜420 件、flush が毎秒 200〜280 件あり、w_await は約 2 ms、f_await は約 2.3 ms でした。fsync 1回あたりの 6.6 ms はデータの書き込みと flush を順に待った時間と考えられます。</p>
          <p>A の間の %util は 100% 前後でしたが、装置が処理能力を使い切っていたとは限りません。A は1本のスレッドが fsync を1回ずつ待つ処理で、aqu-sz は 1.2〜1.5 でした。iostat の説明書は、SSD や RAID のように要求を並列に処理する装置では %util が 100% でも上限に達したことを表さないとしています <Ref n={33} />。装置の混雑は await が平常時より長くなったか、aqu-sz が増えたかで判断します。18:03:41 の w_await 90.60 ms は 256MB のファイルをまとめて書いた後の fsync で要求が一度に並んだ時間です（aqu-sz 21.34）。</p>
          <p><code>/proc/pressure/io</code> は PSI（Pressure Stall Information）の値です。some の行は少なくとも1つのタスクが I/O を待って止まっていた時間の割合、full の行は実行できるタスクがすべて止まっていた時間の割合を、直近 10 秒・60 秒・300 秒の平均（avg10・avg60・avg300）と、待った時間の合計（total、マイクロ秒）で表します。cgroup v2 では cgroup ごとの <code>io.pressure</code> も同じ形で読めます <Ref n={34} />。この環境の WSL2 のカーネル 5.15.167.4 は PSI を組み込まずにビルドされていて（<code>/proc/config.gz</code> に <code>CONFIG_PSI is not set</code>）、上の実行結果のようにファイルがないので、PSI の値は測れませんでした。本番のサーバーでは、ファイルがあるかを先に確かめます。</p>
          <p>同じ PID について状態、スレッド数、メモリー、FD を確認すれば、別のプロセスの数値を混ぜずに関係を読めます。稼働中のプロセスでは観測している間にも接続数が変わります。1回の表示で決めず、増加がリクエストの処理中だけか、負荷が下がった後も続くかを確かめます。</p>
          <Code lang="bash" title="Bash 自身のプロセス情報を読み取る" code={"grep -E '^(Pid|Threads|VmSize|VmRSS):' /proc/$$/status"} />
          <p>この例の対象はコマンドを入力した Bash です（<code>$$</code> はシェル自身の PID）。Rails の実行プロセスを調べるときは、その PID を指定します。</p>
        </>
      ),
    },
    {
      id: "decisions",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章で使った観察の方法を、知りたいことごとにまとめます。どれも同じ PID を対象にし、時間をおいて複数回見ることが前提です。</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">知りたいこと</th><th scope="col">見るもの</th><th scope="col">注意点</th></tr></thead>
              <tbody>
                <tr><th scope="row">プロセスが動いているか、親はどれか</th><td><code>ps -o pid,ppid,stat,args</code></td><td>表示名は書き換えられる。Z が増え続けるなら親を調べる</td></tr>
                <tr><th scope="row">スレッドの数と役割</th><td><code>/proc/PID/task/*/comm</code></td><td>名前は 15 文字で切れる</td></tr>
                <tr><th scope="row">どのシステムコールで待っているか</th><td><code>strace -p PID -e trace=...</code></td><td>対象が遅くなる。送受信したデータの先頭が出力に残る</td></tr>
                <tr><th scope="row">メモリーの使用量</th><td>smaps_rollup の Pss と Private、cgroup の集計</td><td>VSZ は予約した範囲。RSS を足すと共有分を重ねて数える</td></tr>
                <tr><th scope="row">開いているファイルと接続</th><td><code>/proc/PID/fd</code>、<code>ss -tnp</code>、<code>/proc/PID/limits</code></td><td>数を時間をおいて比べる</td></tr>
                <tr><th scope="row">遅い区間の内訳</th><td>アプリの区間ごとの計測、schedstat</td><td>経過時間と CPU 時間の差には CPU の順番待ちも入る</td></tr>
              </tbody>
            </table>
          </div>
          <p>ワーカー（プロセス）を増やすか、スレッドを増やすかは、共有するものの違いで比べます。スレッドはメモリーを共有するので1本あたりの追加のメモリーは小さい一方、Ruby のコードを同時に実行できるのは GVL を持つ1本だけで、共有するオブジェクトの扱いにも注意が要ります。プロセスは CPU を並行して使え、1つが異常終了してもほかは動き続けますが、コピーオンライトの共有は書き込みが進むにつれて減ります。具体的な数の決め方は <ChapterLink n={113} /> で扱います。</p>
          <p>FD やメモリーの上限に達したときは、上限を上げるか、使用量が増える原因を直すかを、増え方で判断します。同時接続数に比例して増え、負荷が下がると減るなら、上限が足りないと考えられます。負荷に関係なく増え続けるなら、閉じ忘れや参照の保持を疑います。上限だけを上げると、後者では問題が起きる時刻が遅くなるだけです。</p>
          <p>strace は、ログやメトリクスでは区間が分からない待ちを調べるときに使います。対象を遅くし、通信の内容も記録するので、本番では1つのワーカーに短い時間だけ使います。最初の手がかりは、アプリのログ、Puma の /stats、<code>/proc</code> の値から集めます。</p>
          <p>停止の処理は、SIGTERM を受けてから終了するまでの時間が、systemd や ECS の猶予時間より短くなるように設計します。長い処理を SIGTERM の後に始めないこと、処理を途中で止めても再実行できるようにすることが、猶予時間を延ばすことより先に検討する項目です。</p>
          <p>関連する章：プロセス・スレッドと Puma の設定は <ChapterLink n={23} />、Ruby のメモリーと GC は <ChapterLink n={97} />、GVL は <ChapterLink n={98} />、ソケットと TCP は <ChapterLink n={104} />、性能の測り方は <ChapterLink n={111} />、Puma と DB の同時処理能力の設計は <ChapterLink n={113} /> で扱います。第6部の演習では、「<a href="#/linux/case06">Pumaが動いているか確認する</a>」「<a href="#/linux/case09">サーバーが急に重くなった原因を探す</a>」「<a href="#/linux/case11">特定ポートを使用しているprocessを調査する</a>」で、この章のコマンドを本番のサーバーの場面で使います。</p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "syscalls(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/syscalls.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "カーネルが提供するシステムコール",
    },
    {
      title: "Concepts overview",
      publisher: "The Linux Kernel documentation",
      url: "https://www.kernel.org/doc/html/v6.12/admin-guide/mm/concepts.html",
      accessed: "2026-11-27",
      version: "Linux 6.12",
      note: "仮想メモリー、ページ、ページキャッシュ、回収",
    },
    {
      title: "proc_pid_status(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/proc_pid_status.5.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "VmSize・VmRSS・Threads などの表示項目",
    },
    {
      title: "open(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/open.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "FD は最も小さい空き番号、FD と開いたファイルの記述の関係",
    },
    {
      title: "proc_pid_smaps(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/proc_pid_smaps.5.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "Rss・Pss・Shared・Private の数え方、smaps_rollup",
    },
    {
      title: "Control Group v2",
      publisher: "The Linux Kernel documentation",
      url: "https://docs.kernel.org/admin-guide/cgroup-v2.html",
      accessed: "2026-11-27",
      version: "cgroup v2",
      note: "グループ単位でのリソースの管理とメモリーの計測",
    },
    {
      title: "strace(1)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man1/strace.1.html",
      accessed: "2026-11-27",
      version: "strace 6.13 で実行",
      note: "-f・-e trace・-c・-p・-s の意味、追跡されたプロセスが遅くなること",
    },
    {
      title: "clone(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/clone.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "CLONE_VM・CLONE_FS・CLONE_FILES・CLONE_SIGHAND・CLONE_THREAD の意味",
    },
    {
      title: "fork(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/fork.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "子は FD の複製を受け継ぐ、コピーオンライトによる実装",
    },
    {
      title: "ptrace(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/ptrace.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "追跡できるプロセスの条件、CAP_SYS_PTRACE、Yama の ptrace_scope",
    },
    {
      title: "profiles/seccomp/default.json",
      publisher: "moby/moby（GitHub）",
      url: "https://github.com/moby/moby/blob/v20.10.17/profiles/seccomp/default.json",
      accessed: "2026-11-27",
      version: "Docker 20.10.17",
      note: "clone3 に ENOSYS（errno 38）を返す規則、Linux 4.8 以上での ptrace の許可",
    },
    {
      title: "ps(1)",
      publisher: "Linux man-pages（procps）",
      url: "https://man7.org/linux/man-pages/man1/ps.1.html",
      accessed: "2026-11-27",
      version: "procps-ng",
      note: "STAT の R・S・D・Z・l、VSZ と RSS の単位",
    },
    {
      title: "Process",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Process.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "Process.wait、Process.getrlimit、Process.clock_gettime",
    },
    {
      title: "Signal",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Signal.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "Signal.trap による処理の登録",
    },
    {
      title: "IO::Buffer",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/IO/Buffer.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "ページより大きい領域を mmap で確保すること、実験的な機能であること",
    },
    {
      title: "lib/puma/server.rb",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/lib/puma/server.rb`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "handle_servers の IO.select・accept_nonblock・pool << client",
    },
    {
      title: "signal(7)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man7/signal.7.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "シグナルの既定の動作、SIGKILL と SIGSTOP は処理を登録できないこと",
    },
    {
      title: "getrlimit(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/getrlimit.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "RLIMIT_NOFILE の soft と hard、EMFILE",
    },
    {
      title: "path_resolution(7)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man7/path_resolution.7.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "パーミッションの判定の順序、ディレクトリの検索の許可",
    },
    {
      title: "proc_pid_fd(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/proc_pid_fd.5.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "/proc/PID/fd の項目と socket:[inode] の表示",
    },
    {
      title: "Scheduler Statistics",
      publisher: "The Linux Kernel documentation",
      url: "https://docs.kernel.org/scheduler/sched-stats.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "/proc/PID/schedstat の CPU 時間と、実行待ちの時間",
    },
    {
      title: "pthread_setname_np(3)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man3/pthread_setname_np.3.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "スレッドの名前は終端を含めて 16 バイトまで",
    },
    {
      title: "proc_pid_stat(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/proc_pid_stat.5.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "minflt と majflt の意味",
    },
    {
      title: "Exit Status",
      publisher: "GNU Bash Reference Manual",
      url: "https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html",
      accessed: "2026-11-27",
      version: "Bash 5",
      note: "シグナルで終了したコマンドの終了ステータスは 128 + 番号",
    },
    {
      title: "systemd.exec",
      publisher: "systemd",
      url: "https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html",
      accessed: "2026-11-27",
      version: "systemd（最新版の説明書）",
      note: "LimitNOFILE= による FD の上限の指定",
    },
    {
      title: "lib/puma/thread_pool.rb",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/lib/puma/thread_pool.rb`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "スレッドの名前（tp 001、tp reap）",
    },
    {
      title: "systemd.service",
      publisher: "systemd",
      url: "https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html",
      accessed: "2026-11-27",
      version: "systemd（最新版の説明書）",
      note: "TimeoutStopSec= を過ぎた後の SIGKILL",
    },
    {
      title: "StopTask",
      publisher: "Amazon ECS API Reference",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_StopTask.html",
      accessed: "2026-11-27",
      version: "Amazon ECS",
      note: "停止のシグナルの後、猶予時間を過ぎると SIGKILL を送ること",
    },
    {
      title: "docs/signals.md",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/docs/signals.md`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "TERM・USR1・USR2・HUP に対する Puma の動作",
    },
    {
      title: "proc_loadavg(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/proc_loadavg.5.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "負荷平均は R と D のジョブの数の平均",
    },
    {
      title: "Signals",
      publisher: "GNU Bash Reference Manual",
      url: "https://www.gnu.org/software/bash/manual/html_node/Signals.html",
      accessed: "2026-11-27",
      version: "Bash 5.2",
      note: "ジョブ制御が無効なとき、& で起動したコマンドは SIGINT と SIGQUIT を無視する",
    },
    {
      title: "proc_pid_io(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/proc_pid_io.5.html",
      accessed: "2026-11-28",
      version: "Linux",
      note: "rchar・wchar・read_bytes・write_bytes の意味",
    },
    {
      title: "iostat(1)",
      publisher: "sysstat",
      url: "https://man7.org/linux/man-pages/man1/iostat.1.html",
      accessed: "2026-11-28",
      version: "sysstat 12.7.5",
      note: "r_await・w_await・f_await・aqu-sz・%util の意味。要求を並列に処理する装置では %util が上限を表さないこと",
    },
    {
      title: "PSI - Pressure Stall Information",
      publisher: "The Linux Kernel documentation",
      url: "https://docs.kernel.org/accounting/psi.html",
      accessed: "2026-11-28",
      version: "Linux カーネルの文書",
      note: "/proc/pressure/io の some と full、avg10・avg60・avg300・total、cgroup v2 の io.pressure",
    },
    {
      title: "posix_fadvise(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/posix_fadvise.2.html",
      accessed: "2026-11-28",
      version: "Linux",
      note: "POSIX_FADV_DONTNEED でファイルのページをページキャッシュから外す（Ruby の IO#advise(:dontneed) が呼ぶ）",
    },
    {
      title: "The /proc Filesystem（/proc/<pid>/io）",
      publisher: "The Linux Kernel documentation",
      url: "https://docs.kernel.org/filesystems/proc.html",
      accessed: "2026-11-28",
      version: "Linux カーネルの文書",
      note: "write_bytes はページを書き換えた（dirty にした）時点で数えること",
    },
  ],
}

export default chapter
