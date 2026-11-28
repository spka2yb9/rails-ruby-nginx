import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(104)}-${n}`
const PM = 'https://github.com/puma/puma/blob/v8.0.2'

/* ---------- 図1 HTTP のデータを TCP と IP で包む ---------- */
function LayersFigure() {
  return (
    <Svg id={figure(1)} w={780} h={256} label="1つの IP パケットは、IP ヘッダー（送信元と宛先の IP アドレス）、TCP ヘッダー（送信元と宛先のポート、seq・ack・フラグ）、データ（HTTP なら要求の文字列）の順に並ぶ。TCP ヘッダーとデータをまとめて TCP セグメントと呼ぶ。IP は経路上のルーターと両端が読み、宛先の IP アドレスへ転送する。TCP は両端のカーネルが読み、ポートで接続を選び、順序と再送を扱う。データは Puma が HTTP の要求として解釈する。">
      <line x1={20} y1={34} x2={760} y2={34} stroke="var(--fig-line)" />
      <line x1={20} y1={28} x2={20} y2={40} stroke="var(--fig-line)" />
      <line x1={760} y1={28} x2={760} y2={40} stroke="var(--fig-line)" />
      <T x={390} y={20} fs={12} anchor="middle" bold>IP パケット</T>
      <line x1={220} y1={58} x2={760} y2={58} stroke="var(--fig-line)" />
      <line x1={220} y1={52} x2={220} y2={64} stroke="var(--fig-line)" />
      <T x={490} y={46} fs={12} anchor="middle" bold>TCP セグメント</T>
      <Box x={20} y={70} w={200} h={64} lines={['IP ヘッダー', '送信元 127.0.0.1', '宛先 127.0.0.1']} fs={12} bold subTone="muted" />
      <Box x={220} y={70} w={280} h={64} lines={['TCP ヘッダー', 'ポート 45418 → 4000', 'seq・ack・フラグ（SYN など）']} fs={12} bold subTone="muted" />
      <Box x={500} y={70} w={260} h={64} lines={['データ', 'page=1\\n（HTTP なら要求の文字列）']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={20} y={168} w={200} h={50} lines={['IP（経路と両端）', '宛先の IP アドレスへ転送']} fs={12} bold subTone="muted" />
      <Box x={240} y={168} w={260} h={50} lines={['TCP（両端のカーネル）', 'ポートで接続を選び、順序と再送を扱う']} fs={12} bold subTone="muted" />
      <Box x={520} y={168} w={240} h={50} lines={['アプリ（Puma）', 'HTTP の要求として解釈する']} fs={12} bold subTone="muted" />
      <Arrow x1={120} y1={168} x2={120} y2={136} dashed />
      <Arrow x1={370} y1={168} x2={370} y2={136} dashed />
      <Arrow x1={640} y1={168} x2={630} y2={136} dashed />
      <T x={20} y={240} fs={11} tone="muted">TLS を使う場合は TCP とデータの間で暗号化する。イーサネットなどのリンク層のヘッダーは省略している</T>
    </Svg>
  )
}

/* ---------- 図2 接続の開始から終了まで ---------- */
function HandshakeFigure() {
  const cx = 200
  const sx = 580
  const msgs: [boolean, string][] = [
    [true, 'SYN  seq 0'],
    [false, 'SYN+ACK  seq 0, ack 1'],
    [true, 'ACK  ack 1'],
    [true, 'データ 7 バイト（page=1）'],
    [false, 'ACK  ack 8'],
    [false, 'データ 20 バイト（応答）'],
    [false, 'FIN  seq 21'],
    [true, 'ACK  ack 21'],
    [true, 'FIN  seq 8, ack 22'],
    [false, 'ACK  ack 9'],
  ]
  const y0 = 80
  const step = 36
  const state = (x: number, y: number, s: string, anchor: 'start' | 'end' = 'start') => (
    <T x={x} y={y} fs={11} mono anchor={anchor} tone="muted">{s}</T>
  )
  return (
    <Svg id={figure(2)} w={780} h={490} label="クライアントが SYN を送り、サーバーが SYN+ACK を返し、クライアントが ACK を返して接続が確立する。クライアントが7バイトを送り、サーバーが ACK と20バイトの応答を返す。サーバーが先に FIN を送り、クライアントが ACK と FIN を返し、サーバーが最後の ACK を返す。先に閉じたサーバー側が TIME-WAIT に入り、クライアント側は CLOSED になる。">
      <Box x={cx - 80} y={14} w={160} h={42} lines={['クライアント', 'client.rb（:45418）']} fs={12} bold subTone="muted" />
      <Box x={sx - 80} y={14} w={160} h={42} lines={['サーバー', 'server.rb（:4000）']} fs={12} bold subTone="muted" />
      <line x1={cx} y1={56} x2={cx} y2={440} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <line x1={sx} y1={56} x2={sx} y2={440} stroke="var(--fig-line)" strokeDasharray="4 4" />
      {msgs.map(([fromClient, label], i) => {
        const y = y0 + i * step
        const accent = i < 3 || i >= 6
        return (
          <g key={label}>
            <T x={390} y={y - 2} fs={11} anchor="middle" mono={!label.startsWith('データ')}>{label}</T>
            <Arrow x1={fromClient ? cx : sx} y1={y + 4} x2={fromClient ? sx - 2 : cx + 2} y2={y + 18} accent={accent} />
          </g>
        )
      })}
      {state(110, 84, 'SYN-SENT', 'end')}
      {state(110, 134, 'ESTABLISHED', 'end')}
      {state(110, 314, 'CLOSE-WAIT', 'end')}
      {state(110, 368, 'LAST-ACK', 'end')}
      {state(110, 422, 'CLOSED', 'end')}
      {state(606, 70, 'LISTEN')}
      {state(606, 98, 'SYN-RECV')}
      {state(606, 170, 'ESTABLISHED')}
      <T x={606} y={186} fs={11} tone="muted">accept キューへ</T>
      {state(606, 298, 'FIN-WAIT-1')}
      {state(606, 386, 'TIME-WAIT')}
      <T x={606} y={402} fs={11} tone="muted">（約 60 秒残る）</T>
      <T x={20} y={470} fs={11} tone="muted">127.0.0.1 での tcpdump の出力をもとにした図。seq と ack は tcpdump が表示する相対値。左右の文字は各時点のソケットの状態</T>
    </Svg>
  )
}

/* ---------- 図3 待ち受けソケットと接続ソケット ---------- */
function SocketsFigure() {
  return (
    <Svg id={figure(3)} w={780} h={270} label="サーバーのプロセスには、127.0.0.1:4000 で LISTEN している待ち受けソケット（FD 5）が1つある。accept するたびに接続ソケットが作られ、FD 6 は相手のポート 45418、FD 7 は相手のポート 43788 との接続を表す。同じ 4000 番でも、相手のアドレスとポートが違えば別の接続で、送信元と宛先のアドレスとポートの4つの組で区別する。">
      <rect x={20} y={20} width={420} height={214} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={34} y={38} bold fs={12}>サーバーのプロセス（server.rb）</T>
      <Box x={34} y={52} w={392} h={46} lines={['待ち受けソケット（FD 5）', '127.0.0.1:4000  LISTEN']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={60} y={124} w={366} h={44} lines={['接続ソケット（FD 6）', '127.0.0.1:4000 ⇄ 127.0.0.1:45418  ESTAB']} fs={12} bold subTone="muted" />
      <Box x={60} y={178} w={366} h={44} lines={['接続ソケット（FD 7）', '127.0.0.1:4000 ⇄ 127.0.0.1:43788  ESTAB']} fs={12} bold subTone="muted" />
      <Arrow x1={46} y1={98} x2={46} y2={200} dashed />
      <line x1={46} y1={146} x2={58} y2={146} stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={52} y={112} fs={11} tone="muted">accept のたびに作る</T>
      <Box x={530} y={124} w={230} h={44} lines={['client.rb', '127.0.0.1:45418 → :4000']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={530} y={178} w={230} h={44} lines={['curl', '127.0.0.1:43788 → :4000']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={428} y1={146} x2={528} y2={146} both />
      <Arrow x1={428} y1={200} x2={528} y2={200} both />
      <T x={20} y={256} fs={11} tone="muted">送信元と宛先の IP アドレスとポートの4つの組が1本の接続を表す。図は2本の接続が同時にある場合の模式図</T>
    </Svg>
  )
}

/* ---------- 図4 接続が待つ場所 ---------- */
function QueuesFigure() {
  return (
    <Svg id={figure(4)} w={780} h={300} label="カーネルの中には、ハンドシェイクの途中の接続が入る SYN キューと、確立して accept を待つ接続が入る accept キューがある。accept キューの上限が listen の backlog で、ss の Send-Q に出る。Puma は accept4 で接続を受け取って todo（待ち行列）に入れ、空いたスレッドが取り出して処理する。Puma の /stats の backlog は todo の長さ。">
      <rect x={20} y={30} width={390} height={130} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={32} y={46} bold fs={12}>カーネル</T>
      <rect x={420} y={30} width={340} height={130} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={432} y={46} bold fs={12}>Puma のプロセス</T>
      <Box x={32} y={60} w={170} h={86} lines={['SYN キュー', 'SYN-RECV の接続', '上限は SYN の', 'キューの設定']} fs={12} bold subTone="muted" />
      <Box x={226} y={60} w={172} h={86} lines={['accept キュー', '確立済みで accept 待ち', '上限は backlog', '（ss の Send-Q）']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={432} y={60} w={150} h={86} lines={['todo（待ち行列）', '/stats の backlog', 'スレッドの空き待ち']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={600} y={60} w={148} h={86} lines={['スレッドプール', 'tp 001 など', '（-t の数）']} fs={12} bold subTone="muted" />
      <Arrow x1={202} y1={103} x2={224} y2={103} />
      <Arrow x1={398} y1={103} x2={430} y2={103} accent />
      <Arrow x1={582} y1={103} x2={598} y2={103} />
      <T x={214} y={180} fs={11} anchor="middle">ACK が届く</T>
      <T x={414} y={180} fs={11} anchor="middle">accept4（Puma の srv スレッド）</T>
      <T x={620} y={180} fs={11} anchor="middle">空いたスレッドが取り出す</T>
      <T x={20} y={220} fs={11}>実験 1：backlog 2 で accept しないサーバーに6本 → accept キューに3本、残り3本は SYN を捨てられ 3.1 秒後に接続</T>
      <T x={20} y={244} fs={11}>実験 2：1 スレッドの Puma（1件 2 秒）に5本 → accept キュー 0 本、Puma の backlog 4、応答は 2・4・6・8・10 秒</T>
      <T x={20} y={276} fs={11} tone="muted">キューの名前は説明のためのもの。SYN キューの上限は tcp_max_syn_backlog や SYN クッキーの設定で変わる</T>
    </Svg>
  )
}

/* ---------- 図5（段階送り）接続がどの待ち行列にいるか ---------- */
function QueueSnapshot({ i, syn, acc, todo, busy, note }: { i: number; syn: number; acc: string; todo: number; busy: number; note: string }) {
  const cells: [string, string, boolean][] = [
    ['SYN キュー', String(syn), false],
    ['accept キュー', acc, true],
    ['Puma の todo', String(todo), false],
    ['処理中のスレッド', `${busy} / 1`, false],
  ]
  return (
    <Svg id={`${figure(5)}-${i}`} w={700} h={92} label={`SYN キュー ${syn}、accept キュー ${acc}、Puma の todo ${todo}、処理中のスレッド ${busy}。${note}`}>
      {cells.map(([name, value, emph], k) => (
        <g key={name}>
          <Box x={10 + k * 172} y={10} w={150} h={52} lines={[name, value]} fs={12} fill={emph ? 'box5' : 'box'} bold subTone="muted" />
          {k < 3 && <Arrow x1={160 + k * 172} y1={36} x2={180 + k * 172} y2={36} />}
        </g>
      ))}
      <T x={10} y={80} fs={11} tone="muted">{note}</T>
    </Svg>
  )
}

const queueSteps = [
  {
    label: 'SYN が届く',
    detail: (
      <>
        <QueueSnapshot i={1} syn={1} acc="0（上限 1024）" todo={0} busy={0} note="カーネルが SYN+ACK を返す。Puma はまだ何も知らない" />
        <p>クライアントの SYN を受けたカーネルは、接続を SYN-RECV の状態で覚えて SYN+ACK を返します。この段階はカーネルだけが処理し、Puma のコードは動きません。</p>
      </>
    ),
  },
  {
    label: 'ACK が届く',
    detail: (
      <>
        <QueueSnapshot i={2} syn={0} acc="1（上限 1024）" todo={0} busy={0} note="接続が確立し、accept キューに入る（ss の Recv-Q が 1）" />
        <p>クライアントの ACK が届くと接続が確立し、accept キューに入ります。クライアントの connect はここで戻るので、クライアントは要求を送り始めます。届いたデータは、Puma が読むまでカーネルの受信バッファーに残ります。</p>
      </>
    ),
  },
  {
    label: 'Puma が accept する',
    detail: (
      <>
        <QueueSnapshot i={3} syn={0} acc="0（上限 1024）" todo={1} busy={0} note="puma srv スレッドの accept4 が FD を返し、接続を todo に入れる" />
        <p>待ち受けソケットが読める状態になると、puma srv スレッドの pselect6 が戻り、accept4 が接続ソケットの FD を返します。Puma はこの接続を todo に入れます。カーネルの accept キューからは消えます。</p>
      </>
    ),
  },
  {
    label: 'スレッドが処理する',
    detail: (
      <>
        <QueueSnapshot i={4} syn={0} acc="0（上限 1024）" todo={0} busy={1} note="空いていたスレッドが todo から取り出し、要求を読んで Rails を呼ぶ" />
        <p>空いているスレッドが todo から接続を取り出し、要求を読んでアプリを実行します。この例のスレッドは1本なので、処理中はほかの接続を処理できません。</p>
      </>
    ),
  },
  {
    label: '処理中に4本届く',
    detail: (
      <>
        <QueueSnapshot i={5} syn={0} acc="0（上限 1024）" todo={4} busy={1} note="Puma は accept を続けるので、待つ場所はカーネルではなく Puma の todo になる" />
        <p>スレッドがふさがっていても、Puma 8.0.2 の accept のループは接続を受け取り続けます。実験 2 のとおり、ss の Recv-Q は 0 のままで、Puma の /stats の backlog が 4 になります。</p>
      </>
    ),
  },
  {
    label: 'accept が止まっている',
    detail: (
      <>
        <QueueSnapshot i={6} syn={0} acc="1025（満杯）" todo={0} busy={0} note="accept するプロセスがない間は accept キューに溜まり、満杯になると新しい SYN を捨てる" />
        <p>起動中や再起動中のように、待ち受けソケットはあっても accept するスレッドが動いていない間は、確立した接続が accept キューに溜まります。満杯になった後の SYN はカーネルが捨て、クライアントは 1 秒、3 秒と間をあけて SYN を送り直します。実験 1 では、backlog 2 のソケットに3本までが並びました。</p>
      </>
    ),
  },
] as const

/* ---------- 図6 Unix ドメインソケットで Nginx と Puma をつなぐ ---------- */
function UnixSocketFigure() {
  return (
    <Svg id={figure(6)} w={780} h={190} label="Nginx のコンテナの worker（nginx ユーザー）が /sock/puma.sock に connect し、Puma のコンテナは同じファイルを /work/tmp/puma.sock として bind している。2つのコンテナはホストの同じディレクトリをマウントしている。Puma が受け取る REMOTE_ADDR は 127.0.0.1。mode=0660 で root:root のソケットにすると、nginx ユーザーには書き込みの許可がないので connect が Permission denied になり、Nginx は 502 を返す。">
      <Box x={20} y={24} w={220} h={92} lines={['Nginx のコンテナ', 'worker は nginx ユーザー', 'server unix:/sock/puma.sock']} fs={12} bold subTone="muted" />
      <Box x={290} y={24} w={200} h={92} lines={['ソケットファイル', 'ホストの同じディレクトリ', 'srwxrwxrwx root:root']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={540} y={24} w={220} h={92} lines={['Puma のコンテナ', 'bind unix:///work/tmp/puma.sock', 'REMOTE_ADDR は 127.0.0.1']} fs={11} bold subTone="muted" />
      <Arrow x1={240} y1={70} x2={288} y2={70} accent />
      <T x={264} y={58} fs={10} anchor="middle" mono>connect</T>
      <Arrow x1={540} y1={70} x2={492} y2={70} dashed />
      <T x={516} y={58} fs={10} anchor="middle" mono>listen</T>
      <T x={20} y={146} fs={11}>Puma の既定（umask 0）ではソケットファイルが srwxrwxrwx になり、どのユーザーも接続できた</T>
      <T x={20} y={170} fs={11} tone="danger">mode=0660（srw-rw---- root:root）では nginx ユーザーに書き込みの許可がなく、connect() が 13: Permission denied → 502</T>
    </Svg>
  )
}

/* ---------- 図7 TIME-WAIT がどちらに残るか ---------- */
function TimeWaitFigure() {
  const rows: [string, number, number][] = [
    ['curl を 200 回別々に実行', 200, 0],
    ['Connection: close で 200 回', 0, 200],
    ['1回の curl で 200 回（keep-alive）', 1, 0],
  ]
  const x0 = 250
  const scale = 1.5
  return (
    <Svg id={figure(7)} w={780} h={222} label="curl を200回別々に実行するとクライアント側に200本、Puma 側に0本の TIME-WAIT が残った。Connection: close を付けるとクライアント側0本、Puma 側200本。1回の curl で keep-alive を使って200回要求するとクライアント側1本、Puma 側0本。">
      {rows.map(([label, client, puma], i) => {
        const y = 24 + i * 56
        return (
          <g key={label}>
            <T x={20} y={y + 15} fs={12}>{label}</T>
            <rect x={x0} y={y} width={Math.max(client * scale, 2)} height={14} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={x0 + Math.max(client * scale, 2) + 8} y={y + 7} fs={11} mono>{`クライアント側 ${client}`}</T>
            <rect x={x0} y={y + 18} width={Math.max(puma * scale, 2)} height={14} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={x0 + Math.max(puma * scale, 2) + 8} y={y + 25} fs={11} mono>{`Puma 側 ${puma}`}</T>
          </g>
        )
      })}
      <rect x={20} y={188} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={40} y={194} fs={11}>クライアント（curl）側の TIME-WAIT</T>
      <rect x={280} y={188} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={300} y={194} fs={11}>Puma 側の TIME-WAIT（本数。各回の直後に ss で数えた）</T>
    </Svg>
  )
}

const serverRb = String.raw`
# server.rb：1行を受け取り、1行を返して接続を閉じる TCP サーバー
require "socket"
$stdout.sync = true

server = TCPServer.new("127.0.0.1", 4000)   # socket・bind・listen をまとめて行う
puts "待ち受け開始: #{server.local_address.inspect_sockaddr}"
loop do
  conn = server.accept                       # 接続が来るまで待ち、接続ソケットを返す
  puts "接続を受け付けた: 相手 #{conn.remote_address.inspect_sockaddr}  FD #{conn.fileno}"
  line = conn.gets
  conn.write("articles for #{line.chomp}\n")
  conn.close                                  # サーバー側から先に閉じる
end
`

const clientRb = String.raw`
# client.rb：サーバーに接続して1行を送り、返事を読む
require "socket"

sock = TCPSocket.new("127.0.0.1", 4000)      # 3ウェイハンドシェイクが済むと戻る
puts "接続した: 自分 #{sock.local_address.inspect_sockaddr}"
sock.write("page=1\n")
puts "返事: #{sock.gets}"
puts "次の読み込み: #{sock.read.inspect}"     # 相手が閉じると空文字列（EOF）
sock.close
`

const echoRun = String.raw`
$ ruby server.rb &
待ち受け開始: 127.0.0.1:4000
$ ruby client.rb
接続した: 自分 127.0.0.1:45418
接続を受け付けた: 相手 127.0.0.1:45418  FD 6      ← server.rb の出力
返事: articles for page=1
次の読み込み: ""
$ ss -tan '( sport = :4000 or dport = :4000 )'    （前の実行で残った行は省略）
State     Recv-Q Send-Q Local Address:Port Peer Address:Port
LISTEN    0      4096       127.0.0.1:4000      0.0.0.0:*
TIME-WAIT 0      0          127.0.0.1:4000    127.0.0.1:45418
`

const tcpdumpOut = String.raw`
$ tcpdump -i lo -nn 'tcp port 4000'          （options の部分は省略）
12:02:19.905871 IP 127.0.0.1.45418 > 127.0.0.1.4000: Flags [S], seq 2286710942, win 65495, length 0
12:02:19.905885 IP 127.0.0.1.4000 > 127.0.0.1.45418: Flags [S.], seq 117183549, ack 2286710943, win 65483, length 0
12:02:19.905899 IP 127.0.0.1.45418 > 127.0.0.1.4000: Flags [.], ack 1, win 512, length 0
12:02:19.919423 IP 127.0.0.1.45418 > 127.0.0.1.4000: Flags [P.], seq 1:8, ack 1, win 512, length 7
12:02:19.919434 IP 127.0.0.1.4000 > 127.0.0.1.45418: Flags [.], ack 8, win 512, length 0
12:02:19.919471 IP 127.0.0.1.4000 > 127.0.0.1.45418: Flags [P.], seq 1:21, ack 8, win 512, length 20
12:02:19.919485 IP 127.0.0.1.4000 > 127.0.0.1.45418: Flags [F.], seq 21, ack 8, win 512, length 0
12:02:19.919518 IP 127.0.0.1.45418 > 127.0.0.1.4000: Flags [.], ack 21, win 512, length 0
12:02:19.919555 IP 127.0.0.1.45418 > 127.0.0.1.4000: Flags [F.], seq 8, ack 22, win 512, length 0
12:02:19.919568 IP 127.0.0.1.4000 > 127.0.0.1.45418: Flags [.], ack 9, win 512, length 0
`

const backlogRb = String.raw`
# backlog.rb：backlog を 2 にして accept を 2.5 秒遅らせたサーバーに、6本の接続を同時に試みる
require "socket"
$stdout.sync = true
t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
elapsed = -> { format("%.2f 秒", Process.clock_gettime(Process::CLOCK_MONOTONIC) - t0) }

server = Socket.new(:INET, :STREAM)
server.setsockopt(:SOCKET, :REUSEADDR, true)
server.bind(Addrinfo.tcp("127.0.0.1", 4001))
server.listen(2)                              # backlog に 2 を指定する

clients = 6.times.map do |i|
  Thread.new do
    s = TCPSocket.new("127.0.0.1", 4001)      # 3ウェイハンドシェイクが済むまで待つ
    puts "クライアント #{i}: 接続できた（#{elapsed.call}）"
    s
  end
end

sleep 0.5
puts "--- #{elapsed.call}：まだ accept していない"
system("ss -ltn 'sport = :4001' | tail -1")
puts %x(ss -tan 'dport = :4001' | awk 'NR>1 {print $1}' | sort | uniq -c)

sleep 2
puts "--- #{elapsed.call}：ここから accept を始める"
6.times { server.accept }
clients.each(&:join)
`

const backlogOut = String.raw`
$ nstat -n; ruby backlog.rb; nstat TcpExtListenOverflows TcpExtListenDrops TcpExtTCPTimeouts
クライアント 2: 接続できた（0.00 秒）
クライアント 0: 接続できた（0.00 秒）
クライアント 1: 接続できた（0.00 秒）
--- 0.50 秒：まだ accept していない
LISTEN 3      2          127.0.0.1:4001      0.0.0.0:*
      3 ESTAB
      3 SYN-SENT
--- 2.51 秒：ここから accept を始める
クライアント 3: 接続できた（3.14 秒）
クライアント 4: 接続できた（3.14 秒）
クライアント 5: 接続できた（3.14 秒）
#kernel
TcpExtListenOverflows           6                  0.0
TcpExtListenDrops               6                  0.0
TcpExtTCPTimeouts               6                  0.0
`

const pumaBacklog = String.raw`
$ puma -t 1:1 -b tcp://127.0.0.1:3000 --control-url tcp://127.0.0.1:9293 --control-token secret slow.ru &
$ for i in 1 2 3 4 5; do curl -s -o /dev/null -w "curl $i: %{time_total} 秒\n" http://127.0.0.1:3000/ & done
$ sleep 0.5; ss -ltn 'sport = :3000' | tail -1
LISTEN 0      1024       127.0.0.1:3000      0.0.0.0:*
$ curl -s 'http://127.0.0.1:9293/stats?token=secret'      （一部の項目を省略）
{"backlog":4,"running":1,"pool_capacity":0,"busy_threads":5,"backlog_max":4,"max_threads":1, ...}
（約 10 秒後）
curl 3: 2.001389 秒
curl 4: 3.993654 秒
curl 1: 5.994050 秒
curl 5: 7.993349 秒
curl 2: 9.989717 秒
`

const binderExcerpt = String.raw`
# lib/puma/binder.rb（Puma 8.0.2。171・335・350・414〜416・432・443 行目から抜粋）
backlog = params.fetch('backlog', 1024).to_i            # bind の URL の ?backlog=（既定 1024）

def add_tcp_listener(host, port, optimize_for_latency=true, backlog=1024)
  # ...
  tcp_server.listen backlog

def add_unix_listener(path, umask=nil, mode=nil, backlog=1024)
  # Let anyone connect by default
  umask ||= 0
  # ...
  s.listen backlog
  # ...
  env[REMOTE_ADDR] = "127.0.0.1"
`

const unixRun = String.raw`
$ puma -t 3:3 -b unix:///work/tmp/puma.sock env.ru &
* Listening on unix:///work/tmp/puma.sock
$ ls -l /work/tmp/puma.sock
srwxrwxrwx 1 root root 0 Nov 27 12:06 /work/tmp/puma.sock
$ ss -lx | grep puma
u_str LISTEN 0      1024   /work/tmp/puma.sock 379550            * 0
$ curl -s --unix-socket /work/tmp/puma.sock http://localhost/articles
REMOTE_ADDR=127.0.0.1 HTTP_X_REAL_IP=nil
`

const envRu = String.raw`
# env.ru：Puma が受け取った接続の情報を返す Rack アプリ
run ->(env) {
  body = "REMOTE_ADDR=#{env["REMOTE_ADDR"]} HTTP_X_REAL_IP=#{env["HTTP_X_REAL_IP"].inspect}\n"
  [200, { "content-type" => "text/plain" }, [body]]
}
`

const nginxConf = String.raw`
events {}
http {
  upstream app {
    server unix:/sock/puma.sock;     # Puma の Unix ドメインソケット
  }
  server {
    listen 8080;
    location / {
      proxy_pass http://app;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}
`

const nginxRun = String.raw`
$ docker run -d --rm --name ag-104-nginx --network rbdemo \
    -v "$PWD/tmp":/sock -v "$PWD/nginx-unix.conf":/etc/nginx/nginx.conf:ro nginx:1.30.6
$ curl -s http://ag-104-nginx:8080/articles
REMOTE_ADDR=127.0.0.1 HTTP_X_REAL_IP="172.29.0.7"

# Puma を mode=0660 で起動し直す
$ puma -t 3:3 -b "unix:///work/tmp/puma.sock?mode=0660" env.ru &
$ ls -l /work/tmp/puma.sock
srw-rw---- 1 root root 0 Nov 27 12:06 /work/tmp/puma.sock
$ curl -s -o /dev/null -w "HTTP %{http_code}\n" http://ag-104-nginx:8080/articles
HTTP 502
$ docker logs ag-104-nginx 2>&1 | grep connect
... [crit] 29#29: *3 connect() to unix:/sock/puma.sock failed (13: Permission denied) while connecting to upstream, ...
`

const pairRb = String.raw`
require "socket"

sender, receiver = Socket.pair(:UNIX, :STREAM, 0)
begin
  sender.write("abc")
  sender.write("def")
  p receiver.read(4) # "abcd"
  p receiver.read(2) # "ef"
ensure
  sender.close
  receiver.close
end
`

const tcpBoundaryRb = String.raw`
# tcp_boundary.rb：TCP でも2回の write が1回の読み込みで返る
require "socket"

server = TCPServer.new("127.0.0.1", 4002)
client = TCPSocket.new("127.0.0.1", 4002)
conn = server.accept
client.write("GET /a\n")
client.write("GET /b\n")
sleep 0.1
p conn.readpartial(1024)        # 届いている分をまとめて返す
`

const keepaliveRun = String.raw`
$ curl -s -o /dev/null -w "%{url_effective} num_connects=%{num_connects} local_port=%{local_port}\n" \
    http://127.0.0.1:3000/a http://127.0.0.1:3000/b
http://127.0.0.1:3000/a num_connects=1 local_port=35728
http://127.0.0.1:3000/b num_connects=0 local_port=35728
`

const timeWaitRun = String.raw`
$ tw() { echo "TIME-WAIT: クライアント側 $(ss -tan state time-wait 'dport = :3000' | tail -n +2 | wc -l) 本 / Puma 側 $(ss -tan state time-wait 'sport = :3000' | tail -n +2 | wc -l) 本"; }

# 200 回、curl を別々に実行する
$ for i in $(seq 200); do curl -s -o /dev/null http://127.0.0.1:3000/; done; tw
TIME-WAIT: クライアント側 200 本 / Puma 側 0 本

# 90 秒待ってから、1回の curl で 200 回要求する（keep-alive）
$ curl -s $(for i in $(seq 200); do printf "http://127.0.0.1:3000/%s " $i; done) > /dev/null; tw
TIME-WAIT: クライアント側 1 本 / Puma 側 0 本

# 90 秒待ってから、Connection: close を付けて 200 回実行する
$ for i in $(seq 200); do curl -s -o /dev/null -H "Connection: close" http://127.0.0.1:3000/; done; tw
TIME-WAIT: クライアント側 0 本 / Puma 側 200 本
`

const udpRb = String.raw`
# udp.rb：UDP は送った単位（データグラム）ごとに受け取る
require "socket"

server = UDPSocket.new
server.bind("127.0.0.1", 5000)
client = UDPSocket.new
client.send("abc", 0, "127.0.0.1", 5000)     # 接続の手順なしに送る
client.send("def", 0, "127.0.0.1", 5000)
p server.recvfrom(4)[0]                       # 4 バイトまで読める指定でも "abc" だけ
p server.recvfrom(4)[0]                       # 次のデータグラムの "def"
client.send("abcdefgh", 0, "127.0.0.1", 5000)
p server.recvfrom(4)[0]                       # 入りきらない部分は捨てられる

# 待ち受けていないポートに送る
lost = UDPSocket.new
lost.connect("127.0.0.1", 5999)
lost.send("hello", 0)                         # 送信自体は成功する
sleep 0.1
begin
  lost.recv(10)
rescue => e
  puts "#{e.class}: #{e.message}"
end
`

const udpOut = String.raw`
"abc"
"def"
"abcd"
Errno::ECONNREFUSED: Connection refused - recvfrom(2)

$ tcpdump -i lo -nn 'udp and (port 5000 or port 5999) or icmp'
12:13:29.743745 IP 127.0.0.1.59393 > 127.0.0.1.5000: UDP, length 3
12:13:29.743754 IP 127.0.0.1.59393 > 127.0.0.1.5000: UDP, length 3
12:13:29.743799 IP 127.0.0.1.59393 > 127.0.0.1.5000: UDP, length 8
12:13:29.743812 IP 127.0.0.1.43778 > 127.0.0.1.5999: UDP, length 5
12:13:29.743818 IP 127.0.0.1 > 127.0.0.1: ICMP 127.0.0.1 udp port 5999 unreachable, length 41
`

const chapter: Chapter = {
  number: 104,
  part: 5,
  title: "TCP/IP とソケット",
  summary: "ブラウザーと Rails の間をデータがどう移動するかを、IP・TCP・ポート・ソケットの役割から説明します。tcpdump と ss で接続の開始と終了、accept の待ち行列、TIME_WAIT を観察します。",
  goals: [
    "IP アドレスと TCP ポートの役割を区別する",
    "3ウェイハンドシェイク、データの送受信、接続の終了を tcpdump の出力で読む",
    "listen の backlog（カーネルの accept キュー）と Puma の backlog（スレッドの空き待ち）を区別する",
    "TCP ソケットと Unix ドメインソケット、TCP と UDP を使い分ける条件を知る",
  ],
  prerequisites: [94, 103],
  sections: [
    {
      id: "layers",
      title: "IP アドレスとポート",
      body: (
        <>
          <p>ブラウザーで記事一覧を開くと、ブラウザーが作った HTTP のデータはネットワークを通ってサーバーに届きます。HTTP では要求のメソッドやパス、応答のステータスコードなどを表します。HTTP/1.1 や HTTP/2 を TCP で送る場合、TCP はそのデータを順序のあるバイト列として届けます。IP は宛先の IP アドレスに向けてパケットを転送するためのプロトコルです。HTTP/3 は UDP の上の QUIC を利用するため、この章の TCP の接続手順は適用されません <Ref n={20} />。</p>
          <p>1つのパケットの中ではデータの前に TCP のヘッダー、その前に IP のヘッダーが付きます（図 {figure(1)}）。IP のヘッダーには送信元と宛先の IP アドレスが、TCP のヘッダーには送信元と宛先のポート番号、データの位置を示す番号（seq と ack）、接続の開始や終了を示すフラグが入ります。経路上のルーターは IP のヘッダーを見て次の転送先を決め、両端のカーネルは TCP のヘッダーを見て、どの接続のデータかを決めます。</p>
          <Figure n={figure(1)} title="HTTP のデータを TCP と IP で包む" caption="この章の client.rb が送った最初のデータを例にした模式図です。ヘッダーの項目は一部だけを示しています。">
            <LayersFigure />
          </Figure>
          <p>IP アドレスはネットワーク上の宛先を示します。同じ宛先アドレスで複数のサービスを提供する場合、OS は TCP のポート番号で待ち受けるサービスを区別します。インターネット向けに HTTPS を提供するサーバーは、一般に TCP の 443 番で待ち受けます。同じマシンで Puma がローカルの 3000 番で待ち受ける構成なら、Nginx からそこへ転送できます。ポート番号が 443 番でも、TLS を使うには待ち受けるサーバーで TLS を設定します。IP アドレスの書き方、プライベートなアドレスの範囲、プロキシを通るたびに相手のアドレスが変わることは <ChapterLink n={25} section="ip-port" /> で扱います。</p>
          <p>一つの待ち受けポートで複数のクライアントから接続を受け付けられます。TCP の接続を区別する情報は、両端の IP アドレスと両端のポートの4つの組です。ブラウザー側では、OS が空いている一時的なポート（この章の環境では 32768〜60999 の範囲）を選ぶのが一般的です。サーバー側のポートが同じでも、接続元のアドレスまたはポートが違えば別の接続になります <Ref n={1} /><Ref n={19} />。</p>
          <p>ブラウザーと Nginx が一つの TCP 接続を作り、Nginx と Puma が別の TCP 接続を作る構成もあります。各接続では、受信が追いつかない場合の待ちや切断を個別に扱います。ブラウザーから見た応答が遅かったという事実だけでは、どちらの接続やアプリケーション処理に時間がかかったのかは分かりません。</p>
          <p>この章の実験は Docker のコンテナ（Debian 13、Ruby 4.0.9、Puma 8.0.2、tcpdump と ss）で行いました。ホストは WSL2 の Linux 5.15 です。多くの実験は 127.0.0.1（同じマシンの中だけで使うループバックアドレス）で行っているため、経路上の遅延やパケットの損失は含みません。</p>
        </>
      ),
    },
    {
      id: "tcp",
      title: "3ウェイハンドシェイクとデータの送受信",
      body: (
        <>
          <p>TCP 接続は通常、クライアントの SYN、サーバーの SYN と ACK、クライアントの ACK の順で確立します。この3回のやり取りを<Term en="three-way handshake">3ウェイハンドシェイク</Term>と呼びます。両端の最初のシーケンス番号を交換してから、データを送る準備が整います <Ref n={1} />。次の節で作る小さなサーバー（server.rb）とクライアント（client.rb）の通信を、tcpdump（ネットワークのパケットを表示するコマンド）で記録しました <Ref n={7} />。</p>
          <Code lang="text" title="1回の接続のパケット（tcpdump 4.99、Linux 5.15）" code={tcpdumpOut} />
          <p>Flags の S は SYN、F は FIN、P はデータをすぐアプリに渡す指定（PUSH）、. は ACK を表します。1行目はクライアント（ポート 45418）の SYN で、seq 2286710942 はクライアントが選んだ最初のシーケンス番号です。2行目のサーバーの SYN+ACK は自分の最初の番号 117183549 と、「次は 2286710943 から受け取る」ことを示す ack を返しています。3行目のクライアントの ACK で接続が確立しました。tcpdump は3行目から、最初の番号を 0 とした相対値で seq と ack を表示します。</p>
          <p>4行目はクライアントが送った7バイト（<code>page=1\n</code>）で、seq 1:8 はバイト列の1番目から7番目を表します。5行目でサーバーのカーネルが ack 8（8番目から先を待っている）を返し、6行目でサーバーが20バイトの応答を送りました。最初の SYN から接続の確立まではおよそ 28 マイクロ秒でした。これは同じマシンの中での値で、新しい TCP 接続には経路を往復する時間がかかります。別の地域のサーバーとの間では、往復に数十〜数百ミリ秒かかります。同じ接続を再利用できる場合は、要求のたびにこの手順を繰り返す必要がありません（「keep-alive と TIME_WAIT」の節）。TLS も使う構成では、TCP の上で TLS の通信を始める手順が加わります（<ChapterLink n={105} section="tls" />）。</p>
          <p>7行目以降は終了の手順です。サーバーの close で FIN が送られ（7行目）、クライアントのカーネルが受信を通知し（8行目）、クライアントの close で FIN が送られ（9行目）、サーバーが最後の ACK を返しました（10行目）。各時点のソケットの状態を図 {figure(2)} に示します <Ref n={1} />。</p>
          <Figure n={figure(2)} title="接続の開始から終了まで" caption="上の tcpdump の10行を、クライアントとサーバーの間の矢印として並べた図です。上から下へ時間が進みます。斜めの矢印は送ってから届くまでの時間を表しますが、長さは実際の時間と比例していません。">
            <HandshakeFigure />
          </Figure>
          <p>TCP は送ったデータの位置をシーケンス番号で示します。受信側は次にどの位置を期待しているかを ACK で通知し、送信側は欠けた部分を検出すると再送します。このためカーネルは、IP のパケットが途中で失われたり到着順が入れ替わったりしても、アプリケーションに順番どおりのバイト列を渡せます。接続が長時間回復しなければ、アプリケーションはタイムアウトや接続エラーを受け取ります。</p>
          <p>送信したものが TCP で確認されたとしても、相手の Rails のコードが DB に保存を済ませたとは限りません。TCP の ACK は相手側 TCP が受け取ったバイト列についての通知です。上の5行目の ack 8 も、server.rb が gets で読む前にカーネルが返しています。アプリケーションでどの処理が成功したかは、HTTP 応答など、上の層で定めた方法で確認します。接続が途中で切れた場合は処理結果が不明になることがあるため、変更を伴う要求の再試行では同じ処理を二度行わない仕組みも検討します。</p>
          <p>送信側は、これ以上送るデータがないことを FIN で通知できます。TCP は双方向なので、片方が FIN を送った後でも、もう片方がデータを送れる場合があります。RST は接続を中止する通知で、待ち受けていないポートへの SYN にはカーネルが RST を返します。途中のプロキシや各プロセスのタイムアウトでも接続が終わることがあるため、観測したエラー名と発生した場所を合わせて調べます。</p>
          <Ref n={2} />
        </>
      ),
    },
    {
      id: "socket",
      title: "ソケットと TCPServer・TCPSocket",
      body: (
        <>
          <p><Term en="socket">ソケット</Term>は、プロセスが通信に使うためにカーネルが用意するデータで、プロセスからは FD（ファイルディスクリプター）として見えます（<ChapterLink n={103} section="descriptors" />）。サーバーはソケットを作り（socket）、アドレスとポートに結びつけ（bind）、待ち受けを始めます（listen）。クライアントから接続を受け付けると（accept）、待ち受け用とは別の接続ソケットができ、データはそちらで読み書きします。クライアントはソケットを作って接続を要求します（connect）<Ref n={2} />。</p>
          <p>Ruby の TCPServer.new は socket・bind・listen をまとめて行い、accept は接続ソケットを TCPSocket として返します。TCPSocket.new は socket と connect を行い、3ウェイハンドシェイクが済むと戻ります <Ref n={8} />。1行を受け取って1行を返すサーバーと、そのクライアントを書きました。</p>
          <Code lang="ruby" title="server.rb" code={serverRb} />
          <Code lang="ruby" title="client.rb" code={clientRb} />
          <Code lang="bash" title="実行結果（Ruby 4.0.9）" code={echoRun} />
          <p>サーバーの接続ソケットの FD は 6 で、相手のアドレスはクライアントが表示した自分のアドレス（127.0.0.1:45418）と一致しています。クライアントの2回目の読み込み（<code>sock.read</code>）が空文字列を返したのは、サーバーが接続を閉じて FIN が届き、これ以上データが来ないと分かったからです。受理した接続を閉じても、待ち受け用のソケットは開いたままなので、server.rb は次のクライアントを受け付けられます（図 {figure(3)}）。</p>
          <Figure n={figure(3)} title="待ち受けソケットと接続ソケット" caption="1つの待ち受けソケットから、accept のたびに接続ソケットが作られます。2本目の接続（curl）は説明のために足したものです。">
            <SocketsFigure />
          </Figure>
          <p>ss は、カーネルが持つソケットの一覧を表示するコマンドです。<code>-t</code> は TCP、<code>-l</code> は待ち受け中だけ、<code>-a</code> はすべての状態、<code>-n</code> はポートを番号のまま表示する指定です <Ref n={6} />。上の実行の後の ss には LISTEN の行と、TIME-WAIT の行が残っていました。LISTEN の行では Recv-Q が accept を待っている接続の数を、Send-Q がその上限（backlog）を表します。TCPServer.new で作った待ち受けソケットの Send-Q は 4096 で、この環境の net.core.somaxconn と同じ値でした。listen に渡す backlog は somaxconn を上限に切り詰められます <Ref n={5} />。TIME-WAIT は「keep-alive と TIME_WAIT」の節で説明します。</p>
          <p>ソケットに一度書いたデータが、一度の読み込みで同じ長さのかたまりとして返るとは限りません。TCP はバイト列を扱うため、メッセージの境界は上位のプロトコルで決めます。server.rb は gets で改行までを1件としています。HTTP/1.1 では応答ヘッダーや本文の長さなどを使って、どこで一つの応答を読み終えたかを判断します。Rails のアクションからは、通常、ソケットのバイト列を HTTP として解釈する部分は Puma や前段のプロキシに任せます。</p>
          <p>ここで <code>127.0.0.1</code> は IPv4 のループバックアドレスです。同じマシンのプロセス同士の通信に使います。コンテナなどでネットワーク名前空間が違えば、二つのプロセスはそれぞれ別のループバックを参照します。<code>127.0.0.1</code> で待ち受けたサーバーには、ほかのマシンやほかのコンテナからは接続できません。<code>0.0.0.0</code> で待ち受けると、そのマシンのすべてのアドレスで受け付けます。待ち受けアドレスの選択はどの相手に接続を許すかと一緒に考えます。ポートを使っているプロセスの調べ方は、第6部の演習「<a href="#/linux/case11">特定ポートを使用しているprocessを調査する</a>」で練習できます。</p>
        </>
      ),
    },
    {
      id: "backlog",
      title: "listen のバックログと accept の待ち行列",
      body: (
        <>
          <p>サーバーが accept するより先に、接続は確立していることがあります。Linux のカーネルはハンドシェイクの途中（SYN を受けて SYN+ACK を返した後）の接続と、確立して accept を待つ接続を別々に管理します。この節では前者を SYN キュー、後者を accept キューと呼びます。listen に渡す <Term en="backlog">backlog</Term> は、Linux では accept キューの上限です。SYN キューの上限は別の設定（tcp_max_syn_backlog など）で決まります <Ref n={5} /><Ref n={19} />。</p>
          <p>accept キューが満杯のときに何が起きるかを確かめるため、backlog を 2 にした待ち受けソケットに6本の接続を同時に試み、2.5 秒たってから accept を始めるプログラムを書きました。カーネルの統計の変化を nstat（ネットワークの統計の差分を表示するコマンド）で見ています。</p>
          <Code lang="ruby" title="backlog.rb" code={backlogRb} />
          <Code lang="bash" title="実行結果（Ruby 4.0.9、Linux 5.15）" code={backlogOut} />
          <p>3本はすぐに接続でき、LISTEN の行の Recv-Q は 3 になりました。backlog の 2 より1本多く並んでいます。残りの3本は SYN-SENT のまま待たされました。カーネルは accept キューが満杯の間に届いた SYN を捨て、その回数を TcpExtListenOverflows と TcpExtListenDrops に数えます。クライアントは SYN を 1 秒後、さらに 2 秒後に送り直し、accept が始まった後の 3.14 秒で接続できました。TcpExtTCPTimeouts の 6 は3本のクライアントで2回ずつ再送のタイマーが切れた回数と考えられます <Ref n={5} /><Ref n={15} /><Ref n={18} />。</p>
          <p>この結果から、accept キューがあふれると、クライアントにはエラーではなく接続の遅れとして現れることが分かります。Linux の既定（tcp_abort_on_overflow が 0）では、キューがあふれても RST を返さないためです <Ref n={2} />。応答時間の分布に 1 秒や 3 秒の山ができていたら、どこかの待ち受けソケットで SYN が捨てられていないかを nstat で確かめます。</p>
          <h3>Puma の backlog は別の待ち行列</h3>
          <p>Puma にも backlog という名前の値が2つあります。1つは bind の URL の <code>?backlog=</code> で、listen に渡す値です。指定しなければ 1024 で、<ChapterLink n={103} section="descriptors" /> の ss の Send-Q に出ていた値です。もう1つは /stats が表示する backlog で、Puma が accept した後、スレッドの空きを待っている要求の数（todo の長さ）です <Ref n={9} /><Ref n={10} />。</p>
          <Code lang="ruby" title="lib/puma/binder.rb（Puma 8.0.2）" href={`${PM}/lib/puma/binder.rb#L414-L445`} code={binderExcerpt} />
          <p>2つの違いを、スレッドが1本で、1件の処理に2秒かかる Puma に5本の要求を同時に送って確かめました（slow.ru は <code>sleep 2</code> の後に応答を返す Rack アプリです）。</p>
          <Code lang="bash" title="1 スレッドの Puma に5本を同時に送る（Puma 8.0.2、curl 8.14.1）" code={pumaBacklog} />
          <p>5本の接続はすべて Puma が accept していて、カーネルの accept キュー（Recv-Q）は 0 本でした。待っていたのは Puma の todo で、/stats の backlog が 4、busy_threads が 5（処理中の1本と待っている4本の合計）です。応答はちょうど2秒ずつ遅れて、最後の要求は約 10 秒かかりました。Puma 8.0.2 の accept のループはスレッドがふさがっていても接続を受け取るので、Puma が動いている間はカーネルの accept キューはほとんど伸びません（図 {figure(4)}）<Ref n={11} />。</p>
          <Figure n={figure(4)} title="接続が待つ場所" caption="カーネルと Puma の待ち行列を左から右へ並べた模式図です。下の2行はこの節の2つの実験の結果です。">
            <QueuesFigure />
          </Figure>
          <p>カーネルの accept キューが伸びるのは、待ち受けソケットはあるのに accept するスレッドが動いていない間です。Puma の説明書は、hot restart の間に接続したクライアントは、サーバーが止まって起動し直すまで待たされるが、接続は閉じられないと説明しています <Ref n={12} />。この待ちに使われるのがカーネルの accept キューです。下の段階送りで、1本の接続がどの待ち行列を通るかを確かめられます。</p>
          <Figure n={figure(5)} title="接続がどの待ち行列にいるか（段階送り）" caption="1 スレッドの Puma を想定した概念モデルです。数値は説明のための例で、最後の段階の 1025 は backlog 1024 に実験 1 と同じく1本多く並んだ場合を表します。実際の Puma はクラスタモードでワーカーごとに todo を持ち、reactor が要求の受信を待つこともあります。">
            <Stepper steps={queueSteps} />
          </Figure>
          <p>Puma の backlog が続けて 0 より大きいなら、スレッドやワーカーの数に対して要求の処理時間が長いか、到着が多すぎます。カーネルの accept キューの上限（bind の backlog や somaxconn）を上げても、この待ちは減りません。どの待ち行列で待っているかを決めてから、処理能力を増やすか、処理時間を減らすかを選びます（<ChapterLink n={113} />）。</p>
        </>
      ),
    },
    {
      id: "unix-socket",
      title: "Unix ドメインソケットで Nginx と Puma をつなぐ",
      body: (
        <>
          <p>同じマシンのプロセスだけで通信するなら、<Term en="Unix domain socket">Unix ドメインソケット</Term>を使う構成もあります。接続先を IP アドレスとポートではなく、ファイルシステムのパス（たとえば <code>/app/tmp/sockets/puma.sock</code>）で指定します。データは TCP/IP の処理を通らずにカーネルの中で受け渡されるので、ポート番号もシーケンス番号もありません。ただし、ストリーム型の Unix ドメインソケットも TCP と同じくバイト列を扱い、listen の backlog と accept の手順もあります <Ref n={3} />。</p>
          <p>Puma を Unix ドメインソケットで起動し、ファイルの権限と ss の表示を確かめました。env.ru は Puma から受け取った REMOTE_ADDR などを返すだけの Rack アプリです。</p>
          <Code lang="ruby" title="env.ru" code={envRu} />
          <Code lang="bash" title="Unix ドメインソケットで起動した Puma（Puma 8.0.2）" code={unixRun} />
          <p>ls -l の先頭の s はソケットのファイルであることを表します。パーミッションが rwxrwxrwx なのは、Puma が既定でソケットを作るときに umask を 0 にしているためです（上の binder.rb の「Let anyone connect by default」）。ss では <code>-x</code> で Unix ドメインソケットを表示でき、LISTEN の Send-Q は TCP と同じく 1024 でした。Puma は Unix ドメインソケットで受けた要求の REMOTE_ADDR を 127.0.0.1 にします <Ref n={9} />。</p>
          <p>次に、Nginx 1.30.6 の別のコンテナから、同じソケットファイルに接続しました。2つのコンテナはホストの同じディレクトリをそれぞれ <code>/work/tmp</code> と <code>/sock</code> にマウントしています。</p>
          <Code lang="nginx" title="nginx-unix.conf" code={nginxConf} />
          <Code lang="bash" title="Nginx から Unix ドメインソケットで Puma に転送する" code={nginxRun} />
          <p>1回目は 200 が返り、Puma の REMOTE_ADDR は 127.0.0.1、Nginx が付けた X-Real-IP は curl を実行したコンテナのアドレス（172.29.0.7）でした。Unix ドメインソケットでは接続元の IP アドレスがないので、クライアントのアドレスはヘッダーで渡す必要があります（<ChapterLink n={25} section="client-ip" />）。</p>
          <p>Puma を <code>?mode=0660</code> で起動し直すと、ソケットファイルは srw-rw----（所有者 root、グループ root）になり、Nginx は 502 を返しました。Nginx の worker のプロセスは nginx ユーザーで動いていて、このファイルへの書き込みの許可がありません。Linux では、Unix ドメインソケットに接続するにはソケットファイルへの書き込みの許可が必要です <Ref n={3} />。Nginx のエラーログの <code>13: Permission denied</code> は、connect が EACCES（番号 13）で失敗したことを表します（図 {figure(6)}）。</p>
          <Figure n={figure(6)} title="Unix ドメインソケットで Nginx と Puma をつなぐ" caption="この節の実験の構成です。コンテナを使わずに同じマシンで動かす場合も、ソケットファイルの場所と権限の関係は同じです。">
            <UnixSocketFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <caption>Nginx から Puma への接続方法の比較</caption>
              <thead><tr><th scope="col">項目</th><th scope="col">TCP（127.0.0.1:3000 など）</th><th scope="col">Unix ドメインソケット</th></tr></thead>
              <tbody>
                <tr><th scope="row">接続先の指定</th><td>IP アドレスとポート</td><td>ファイルシステムのパス</td></tr>
                <tr><th scope="row">接続できる範囲</th><td>待ち受けアドレスに届くすべてのホスト</td><td>同じカーネルで、そのパスを参照できるプロセスだけ</td></tr>
                <tr><th scope="row">接続の許可</th><td>待ち受けアドレスとファイアウォールで決める</td><td>ソケットファイルとディレクトリのパーミッションで決める</td></tr>
                <tr><th scope="row">Puma の REMOTE_ADDR</th><td>接続元（Nginx）の IP アドレス</td><td>127.0.0.1（Puma が設定する）</td></tr>
                <tr><th scope="row">別のホストに分けるとき</th><td>そのまま使える</td><td>使えない。TCP に変える</td></tr>
              </tbody>
            </table>
          </div>
          <p>Nginx と Puma を同じホストに置き、外から Puma に直接接続させたくない場合は、Unix ドメインソケットが選択肢になります。ECS のように Nginx と Puma を別のタスクやホストに分ける構成や、ロードバランサーから Puma に直接転送する構成では TCP を使います。コンテナを使う場合、同じホストの上でも別々のファイルシステムを見ているので、ソケットファイルのディレクトリを両方のコンテナにマウントする必要があります。Nginx の upstream の書き方と keep-alive の設定は <ChapterLink n={24} section="upstream" /> で扱います <Ref n={13} />。</p>
        </>
      ),
    },
    {
      id: "stream-boundary",
      title: "一度の読み込みでどこまで得られるか",
      body: (
        <>
          <p>次のコードは Ruby の同じプロセス内に接続済みのソケットを二つ作り、2回の書き込みを異なる長さで読み取ります。ネットワークを介さない Unix ドメインのストリームソケットを使います <Ref n={4} />。</p>
          <Code lang="ruby" title="二つの書き込みを別の長さで読み取る" code={pairRb} />
          <p>実行すると <code>"abcd"</code> と <code>"ef"</code> が表示されました。書き込んだ単位（"abc" と "def"）は残っていません。この例で <code>read(4)</code> は、データが到着する途中なら要求した長さを読むまで待てます。実際に長さを指定して待つ場合は、どこまで読めば入力が完了するのかをプロトコルから判断し、相手が途中で送信を止めても無期限に待たないようにします。</p>
          <p>TCP でも同じことが起きます。2回に分けて書いた2行を、受信側が少し待ってから readpartial（届いている分を返すメソッド）で読みました。</p>
          <Code lang="ruby" title="tcp_boundary.rb" code={tcpBoundaryRb} />
          <p>結果は <code>"GET /a\nGET /b\n"</code> で、2回の write が1回の読み込みでまとめて返りました。逆に、大きなデータは何回かに分かれて届くこともあります。受信のかたまりをアプリケーションの処理単位とみなすと、送信内容が同じでもタイミングによって処理結果が変わります。HTTP/1.1 のサーバーである Puma はヘッダーの終わりの空行と Content-Length などで1件の要求の範囲を決めています。</p>
          <p>TCP には、受信側が用意できるバッファーに合わせて送信量を抑えるフロー制御があります。受信するプロセスが読み取りを進めないと、送信側でも一度に書き込める量が制限され得ます。これはネットワークでパケットが失われて再送する処理と異なります。tcpdump の win（受信側が受け取れる量の通知）はこの仕組みで使う値です。大きな応答を遅いクライアントへ返す場合、Rails、Nginx、OS のどの段階がデータを一時保持するかによって、処理中のメモリーと接続を使う時間が変わります（<ChapterLink n={24} section="buffering" />）<Ref n={1} />。</p>
        </>
      ),
    },
    {
      id: "keepalive",
      title: "keep-alive と TIME_WAIT",
      body: (
        <>
          <p>HTTP/1.1 では1本の TCP 接続で複数の要求と応答を続けて送れます。これを持続的接続、または keep-alive と呼びます。要求ごとに接続を作り直すと、そのたびに3ウェイハンドシェイク（HTTPS なら TLS のハンドシェイクも）が必要になります <Ref n={16} />。curl に2つの URL を渡すと、2つ目の要求で接続を作り直すかが分かります。</p>
          <Code lang="bash" title="1回の curl で2つの URL を要求する（curl 8.14.1、Puma 8.0.2）" code={keepaliveRun} />
          <p>num_connects はその転送のために新しく作った接続の数です。2つ目は 0 で、local_port も 35728 のままなので、同じ接続を使い回しています <Ref n={17} />。Puma は次の要求が来るのを persistent_timeout（既定 65 秒）まで待ちます（<ChapterLink n={23} section="restart-timeout" />）。</p>
          <h3>TIME_WAIT</h3>
          <p>接続を先に閉じた側（先に FIN を送った側）のソケットは、最後の ACK を送った後もしばらく <Term en="TIME_WAIT">TIME-WAIT</Term> の状態で残ります。遅れて届いた古い接続のパケットを、同じアドレスとポートの組の新しい接続のものと取り違えないためと、最後の ACK が失われて相手が FIN を送り直したときに応答するためです <Ref n={1} />。ss では TIME-WAIT と表示されます。接続の閉じ方で、TIME-WAIT がどちらに残るかを比べました。</p>
          <Code lang="bash" title="200 回の要求の後の TIME-WAIT の数（Linux 5.15、Puma 8.0.2）" code={timeWaitRun} />
          <p>curl を別々に実行すると、curl が終了するときに先に接続を閉じるので、クライアント側に 200 本が残りました。<code>Connection: close</code> を付けると、Puma が応答を送った後に先に閉じるので、Puma 側に 200 本が残りました。keep-alive で 200 回の要求を1本の接続で送ると、TIME-WAIT は1本だけでした。この環境では、TIME-WAIT の接続は 60 秒あまりで消え、90 秒待つと 0 本になっていました（図 {figure(7)}）。</p>
          <Figure n={figure(7)} title="TIME-WAIT がどちらに残るか" caption="上の実験の結果を本数で描いた図です。Puma は 127.0.0.1:3000 で待ち受け、curl は同じコンテナで実行しました。">
            <TimeWaitFigure />
          </Figure>
          <p>TIME-WAIT の接続はアプリケーションの FD を使いません。カーネルの中に、送信元と宛先の組を覚えておくだけです。問題になりやすいのは、同じ相手に短い接続を大量に作るクライアント側です。同じ宛先への新しい接続には、TIME-WAIT が使っていない一時的なポートが必要で、この環境の範囲（32768〜60999）では 28,232 個です。Nginx から Puma へ、Rails から外部の API へ、要求ごとに接続を作り直していると、TIME-WAIT の数が増えます。Linux には条件付きで TIME-WAIT のポートを再利用する設定（tcp_tw_reuse）もありますが、まず接続を使い回せないかを検討します <Ref n={19} />。</p>
          <p>keep-alive で次の要求を待っている接続も、サーバーの FD とメモリーを使います。Puma ではその間の接続を reactor が預かります。ロードバランサーや Nginx と Puma の間で、どちらが先に接続を閉じるかの時間がかみ合わないと、閉じた直後の接続に要求を送ってしまうことがあります。この時間の関係は <ChapterLink n={25} section="timeouts" /> で扱います。</p>
        </>
      ),
    },
    {
      id: "udp",
      title: "UDP との違い",
      body: (
        <>
          <p><Term en="User Datagram Protocol">UDP</Term> は、IP の上で、ポート番号付きのデータグラム（1回に送るデータのかたまり）を送るプロトコルです。接続の手順も、届いたことの確認も、再送も、順序の保証もありません <Ref n={14} />。DNS の問い合わせ（<ChapterLink n={105} section="dns" />）や、HTTP/3 が使う QUIC が UDP の上で動きます。</p>
          <Code lang="ruby" title="udp.rb" code={udpRb} />
          <Code lang="text" title="実行結果と tcpdump（Ruby 4.0.9）" code={udpOut} />
          <p>tcpdump には SYN も ACK もなく、送った3つのデータグラムがそのまま3つのパケットとして並びました。受信側は1回の recvfrom で1つのデータグラムを受け取り、"abc" と "def" の境界が残っています。TCP の readpartial が2行をまとめて返したのとは逆です。8バイトのデータグラムを4バイトの指定で受け取ると、残りの "efgh" は捨てられました。</p>
          <p>待ち受けていない 5999 番に送った "hello" も、送信の時点ではエラーになりませんでした。相手のカーネルは ICMP の port unreachable を返し、connect 済みの UDP ソケットでは、それが次の受信の Errno::ECONNREFUSED として現れます <Ref n={14} />。届かなかったことを確実に知るには、アプリケーション側で応答を待ち、来なければ送り直す仕組みが要ります。DNS のクライアントがタイムアウトと再送を持つのはこのためです。</p>
          <div className="table-wrap">
            <table>
              <caption>TCP と UDP の比較</caption>
              <thead><tr><th scope="col">項目</th><th scope="col">TCP</th><th scope="col">UDP</th></tr></thead>
              <tbody>
                <tr><th scope="row">接続の手順</th><td>3ウェイハンドシェイクと FIN による終了</td><td>なし</td></tr>
                <tr><th scope="row">データの単位</th><td>境界のないバイト列</td><td>データグラムごと（境界が残る）</td></tr>
                <tr><th scope="row">再送と順序</th><td>カーネルが再送し、順序をそろえる</td><td>なし。必要ならアプリケーションが行う</td></tr>
                <tr><th scope="row">相手がいないとき</th><td>connect が RST で失敗する</td><td>送信は成功し、ICMP で後から分かることがある</td></tr>
                <tr><th scope="row">Rails の周辺での例</th><td>HTTP/1.1・HTTP/2、MySQL、Redis</td><td>DNS、HTTP/3（QUIC）、StatsD などのメトリクスの送信</td></tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: "timeouts",
      title: "どの区間で待っているかを判断する",
      body: (
        <>
          <p>接続を始める時間、接続できてから応答を読み始めるまでの時間、読み始めてから完了までの時間は別の値です。到達できない IP アドレスへの接続と、接続できるが DB を待ち続けるアプリケーションでは、同じ「画面が遅い」という見え方でも調べる場所が違います。プロキシの上流接続ログと、Rails に同じ要求が届いたかを合わせて確認すると範囲を狭められます。</p>
          <p>接続を始める時間には、この章で見た2つの待ちが入ります。ハンドシェイクの往復の時間と、accept キューがあふれて SYN を送り直す時間です。後者は 1 秒、3 秒のように再送の間隔に合わせて伸びるので、接続の時間の分布に段差として現れます。curl なら <code>{"-w '%{time_connect}'"}</code> で、接続の確立までの時間を区間として表示できます <Ref n={17} />。</p>
          <p>一つの層のタイムアウトを短くすれば、待ち続ける接続は早く終わります。ただし、上流でタイムアウトを返したときに、下流の Rails や DB が作業を止めたとは限りません。上流が再試行すると、先の要求もまだ動いている場合があります。タイムアウトは処理を中断する条件、同じ要求の再送を許せる条件、利用者へ返す応答と一緒に考えます。</p>
          <p>待ち行列も複数あります。OS の受け付け前の接続待ち（accept キュー）、Puma が要求を処理するスレッドを待つ時間（todo）、Active Record が DB 接続を待つ時間には、それぞれ別の制限があります。前の待ち行列の長さを変えただけで、後ろの処理能力が上がることはありません。レイテンシやエラー率が上がったときは、どの待ち行列に要求が残り続けるかを確認します。</p>
        </>
      ),
    },
    {
      id: "decisions",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章で見た値を、どの症状のときに確かめるかを表にまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">症状</th><th scope="col">確かめる値</th><th scope="col">考えられる原因</th></tr></thead>
              <tbody>
                <tr><th scope="row">接続の確立に 1 秒・3 秒かかる</th><td><code>nstat</code> の ListenOverflows、<code>ss -ltn</code> の Recv-Q</td><td>accept が止まっている、または追いつかない</td></tr>
                <tr><th scope="row">接続はすぐできるが応答が遅い</th><td>Puma の /stats の backlog と busy_threads</td><td>スレッドの空き待ち。処理時間か同時処理数の不足</td></tr>
                <tr><th scope="row">Nginx が 502 を返す</th><td>Nginx のエラーログの connect() の行</td><td>Puma が待ち受けていない（Connection refused）、ソケットの権限（Permission denied）</td></tr>
                <tr><th scope="row">TIME-WAIT が多い</th><td><code>ss -tan state time-wait</code> を送信元と宛先で分ける</td><td>要求ごとに接続を作り直している。どちらが先に閉じているか</td></tr>
                <tr><th scope="row">クライアントの IP がすべて 127.0.0.1</th><td>接続方法と X-Forwarded-For・X-Real-IP</td><td>Unix ドメインソケット経由で、ヘッダーを渡していない</td></tr>
              </tbody>
            </table>
          </div>
          <p>TCP か Unix ドメインソケットかは、Nginx と Puma を同じホストに置き続けるかで決めます。同じホストに置き、Puma に外から接続させないことを権限で管理したいなら Unix ドメインソケット、別のホストやコンテナに分ける可能性があるなら TCP が向いています。Unix ドメインソケットのほうが TCP/IP の処理が少ない分だけ速いという説明もありますが、Rails のアプリでは1件の処理時間のほうがはるかに長いので、速さだけで選ぶ理由にはなりにくいと考えます。</p>
          <p>accept キューの上限（backlog、somaxconn）を上げると、一時的に到着が集中したときに SYN を捨てずに済みます。一方で、キューに並んだ接続は処理されるまで待つだけなので、処理能力が足りない状態が続くなら、上限を上げても待ち時間が伸びるだけです。クライアントやロードバランサーのタイムアウトより長く待たせても、その接続は無駄になります。</p>
          <p>keep-alive は接続を作る時間と TIME-WAIT を減らす代わりに、待機中の接続の数を増やします。サーバーの前にロードバランサーや Nginx がある構成では、多数のブラウザーとの keep-alive は前段が持ち、前段から Puma への接続は少数を使い回すのが一般的です。</p>
          <p>関連する章：プロセスと FD は <ChapterLink n={103} />、DNS と TLS は <ChapterLink n={105} />、Nginx の upstream は <ChapterLink n={24} />、ロードバランサーとタイムアウトは <ChapterLink n={25} />、ブラウザーから Rails までの経路は <ChapterLink n={26} />、Puma と接続枠の設計は <ChapterLink n={113} /> で扱います。第6部の演習では、「<a href="#/linux/case08">Redisへの接続エラーを調査する</a>」と「<a href="#/linux/case42">フェイルオーバーのあと、書き込みだけがときどき失敗する</a>」で ss を使った接続の調べ方を練習できます。</p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Transmission Control Protocol (TCP)",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc9293.html",
      accessed: "2026-11-27",
      version: "RFC 9293",
      note: "TCP 接続の識別、確立、再送、終了、TIME-WAIT",
    },
    {
      title: "tcp(7)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man7/tcp.7.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "Linux の TCP ソケット、tcp_abort_on_overflow",
    },
    {
      title: "unix(7)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man7/unix.7.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "Unix ドメインソケットのアドレス、接続に必要な書き込みの許可",
    },
    {
      title: "Socket",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/Socket.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "Socket.pair、listen、connect_nonblock",
    },
    {
      title: "listen(2)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man2/listen.2.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "backlog は確立済みの接続の待ち行列の長さ、somaxconn による切り詰め、満杯のときの動作",
    },
    {
      title: "ss(8)",
      publisher: "Linux man-pages（iproute2）",
      url: "https://man7.org/linux/man-pages/man8/ss.8.html",
      accessed: "2026-11-27",
      version: "iproute2",
      note: "-t・-l・-a・-n・-x と状態による絞り込み",
    },
    {
      title: "tcpdump(1)",
      publisher: "The Tcpdump Group",
      url: "https://www.tcpdump.org/manpages/tcpdump.1.html",
      accessed: "2026-11-27",
      version: "tcpdump 4.99 で実行",
      note: "Flags の S・F・P・.、相対的な seq と ack の表示",
    },
    {
      title: "TCPServer",
      publisher: "Ruby Documentation",
      url: "https://docs.ruby-lang.org/en/4.0/TCPServer.html",
      accessed: "2026-11-27",
      version: "Ruby 4.0",
      note: "TCPServer.new と accept",
    },
    {
      title: "lib/puma/binder.rb",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/lib/puma/binder.rb`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "bind の backlog の既定値 1024、Unix ドメインソケットの umask と REMOTE_ADDR",
    },
    {
      title: "docs/stats.md",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/docs/stats.md`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "/stats の backlog と busy_threads の意味",
    },
    {
      title: "lib/puma/server.rb",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/lib/puma/server.rb`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "accept のループ（handle_servers）",
    },
    {
      title: "docs/restart.md",
      publisher: "puma/puma（GitHub）",
      url: `${PM}/docs/restart.md`,
      accessed: "2026-11-27",
      version: "Puma 8.0.2",
      note: "hot restart の間に接続したクライアントは待たされるが閉じられないこと",
    },
    {
      title: "Module ngx_http_upstream_module",
      publisher: "nginx.org",
      url: "https://nginx.org/en/docs/http/ngx_http_upstream_module.html",
      accessed: "2026-11-27",
      version: "nginx 1.30.6 で実行",
      note: "server unix: による Unix ドメインソケットの指定",
    },
    {
      title: "udp(7)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man7/udp.7.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "UDP の性質、ICMP によるエラーと connect 済みのソケット",
    },
    {
      title: "Computing TCP's Retransmission Timer",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc6298.html",
      accessed: "2026-11-27",
      version: "RFC 6298",
      note: "再送のタイマーの初期値 1 秒と、再送のたびに間隔を延ばすこと",
    },
    {
      title: "HTTP/1.1",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc9112.html",
      accessed: "2026-11-27",
      version: "RFC 9112",
      note: "持続的接続と Connection: close",
    },
    {
      title: "curl man page",
      publisher: "curl",
      url: "https://curl.se/docs/manpage.html",
      accessed: "2026-11-27",
      version: "curl 8.14.1 で実行",
      note: "--unix-socket、-w の num_connects・local_port・time_connect",
    },
    {
      title: "nstat(8)",
      publisher: "Linux man-pages（iproute2）",
      url: "https://man7.org/linux/man-pages/man8/nstat.8.html",
      accessed: "2026-11-27",
      version: "iproute2",
      note: "カーネルのネットワークの統計の差分",
    },
    {
      title: "IP Sysctl",
      publisher: "The Linux Kernel documentation",
      url: "https://docs.kernel.org/networking/ip-sysctl.html",
      accessed: "2026-11-27",
      version: "Linux",
      note: "somaxconn、tcp_max_syn_backlog、ip_local_port_range、tcp_tw_reuse",
    },
    {
      title: "HTTP/3",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc9114.html",
      accessed: "2026-11-27",
      version: "RFC 9114",
      note: "HTTP/3 は QUIC の上で動くこと",
    },
  ],
}

export default chapter
