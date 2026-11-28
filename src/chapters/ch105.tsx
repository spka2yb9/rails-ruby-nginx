import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(105)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

const tlsExample = `
(
  work=$(mktemp -d) || exit 1
  server_pid=
  cleanup() {
    if [ -n "$server_pid" ]; then
      kill "$server_pid" 2>/dev/null || true
      wait "$server_pid" 2>/dev/null || true
    fi
    rm -f "$work/key.pem" "$work/cert.pem" "$work/server.log"
    rmdir "$work"
  }
  trap cleanup EXIT
  openssl req -x509 -newkey rsa:2048 -noenc -days 1 \\
    -subj /CN=rails.test -addext 'subjectAltName=DNS:rails.test' \\
    -keyout "$work/key.pem" -out "$work/cert.pem" || exit 1
  openssl s_server -accept 127.0.0.1:8443 -www \\
    -key "$work/key.pem" -cert "$work/cert.pem" >"$work/server.log" 2>&1 &
  server_pid=$!

  check() {
    local status=0
    curl --noproxy '*' --max-time 5 -sS -o /dev/null \\
      -w 'HTTP %{http_code}\\n' "$@" || status=$?
    printf 'curl exit %s\\n' "$status"
  }
  check --retry 3 --retry-connrefused --retry-delay 1 \\
    --cacert "$work/cert.pem" --resolve rails.test:8443:127.0.0.1 \\
    https://rails.test:8443/
  check --resolve rails.test:8443:127.0.0.1 https://rails.test:8443/
  check --cacert "$work/cert.pem" --resolve other.test:8443:127.0.0.1 \\
    https://other.test:8443/
)
`

/* ---------- 図1 名前解決にかかわるサーバー ---------- */
function DnsFigure() {
  const num = (x: number, y: number, s: string) => <T x={x} y={y} fs={12} bold tone="acc">{s}</T>
  return (
    <Svg id={figure(1)} w={780} h={300} label="Ruby が getaddrinfo を呼ぶと、libc のスタブリゾルバーが /etc/nsswitch.conf、/etc/hosts、/etc/resolv.conf を読み、フルリゾルバーに UDP の53番で問い合わせる。フルリゾルバーはキャッシュになければ、ルートサーバー、com のサーバー、example.com の権威サーバーの順に問い合わせ、答えを TTL の間キャッシュしてスタブリゾルバーに返す。">
      <Box x={20} y={24} w={170} h={56} lines={['Ruby（Puma）', 'getaddrinfo を呼ぶ']} fs={12} bold subTone="muted" />
      <Box x={20} y={118} w={170} h={124} lines={['スタブリゾルバー', 'libc の関数', '/etc/nsswitch.conf', '/etc/hosts', '/etc/resolv.conf']} fs={12} bold subTone="muted" />
      <Box x={270} y={104} w={190} h={110} lines={['フルリゾルバー', '（再帰リゾルバー）', 'キャッシュ（TTL まで）', '例：1.1.1.1、VPC の DNS']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={540} y={16} w={220} h={56} lines={['ルートサーバー（.）', 'com は gtld-servers.net へ']} fs={12} bold subTone="muted" />
      <Box x={540} y={96} w={220} h={56} lines={['com のサーバー', 'example.com は cloudflare へ']} fs={12} bold subTone="muted" />
      <Box x={540} y={176} w={220} h={56} lines={['example.com の権威サーバー', 'www → 104.20.23.154 ほか']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={105} y1={80} x2={105} y2={116} />
      {num(112, 98, '①')}
      <Arrow x1={190} y1={160} x2={268} y2={150} />
      {num(214, 140, '②')}
      <T x={229} y={176} fs={10} anchor="middle" tone="muted">UDP 53 番</T>
      <Arrow x1={460} y1={128} x2={538} y2={52} />
      {num(486, 80, '③')}
      <Arrow x1={460} y1={150} x2={538} y2={128} />
      {num(492, 128, '④')}
      <Arrow x1={460} y1={176} x2={538} y2={200} />
      {num(492, 198, '⑤')}
      <Arrow x1={268} y1={196} x2={192} y2={206} dashed />
      {num(220, 216, '⑥')}
      <T x={20} y={268} fs={11}>② は答えを求める再帰的な問い合わせ、③〜⑤ は知っている範囲を答えてもらう反復的な問い合わせ</T>
      <T x={20} y={288} fs={11} tone="muted">⑥ で答えを TTL の間キャッシュする。キャッシュにあれば ③〜⑤ を省く。委任の情報（③④の答え）もキャッシュする</T>
    </Svg>
  )
}

/* ---------- 図2（段階送り）www.example.com を引く ---------- */
function DnsSnapshot({ i, active, record }: { i: number; active: number; record: string }) {
  const nodes = ['アプリ・スタブ', 'フルリゾルバー', 'ルート', 'com', '権威サーバー']
  const xs = [10, 150, 330, 460, 590]
  return (
    <Svg id={`${figure(2)}-${i}`} w={720} h={100} label={`${nodes[active]}が関わる段階。${record}`}>
      {nodes.map((n, k) => (
        <Box key={n} x={xs[k]} y={10} w={k === 0 ? 120 : 110} h={36} lines={n} fs={12} fill={k === active ? 'box5' : 'box'} accent={k === active} />
      ))}
      <Arrow x1={130} y1={28} x2={148} y2={28} accent={active === 1} />
      <Arrow x1={260} y1={28} x2={328} y2={28} accent={active === 2} dashed={active !== 2} />
      <Arrow d="M 215 46 L 215 56 L 515 56 L 515 48" accent={active === 3} dashed={active !== 3} />
      <Arrow d="M 235 46 L 235 64 L 645 64 L 645 48" accent={active === 4} dashed={active !== 4} />
      <T x={10} y={84} fs={12} mono>{record}</T>
    </Svg>
  )
}

const dnsSteps = [
  {
    label: '① スタブが設定を読む',
    detail: (
      <>
        <DnsSnapshot i={1} active={0} record="hosts: files dns / /etc/hosts に www.example.com はない" />
        <p>Ruby の <code>Addrinfo.getaddrinfo</code> は libc の getaddrinfo を呼びます。libc は <code>/etc/nsswitch.conf</code> の順（files、dns）に従い、まず <code>/etc/hosts</code> を探します。ここに名前があれば、DNS には問い合わせません。</p>
      </>
    ),
  },
  {
    label: '② フルリゾルバーに聞く',
    detail: (
      <>
        <DnsSnapshot i={2} active={1} record="127.0.0.11:53 へ A と AAAA の2つの質問を UDP で送る" />
        <p><code>/etc/resolv.conf</code> の nameserver に、A（IPv4）と AAAA（IPv6）の質問を送ります。Docker のコンテナでは 127.0.0.11 が Docker の DNS で、ホストのリゾルバーへ転送します。フルリゾルバーがキャッシュに有効な答えを持っていれば、③〜⑤ を省いて ⑥ に進みます。</p>
      </>
    ),
  },
  {
    label: '③ ルートに聞く',
    detail: (
      <>
        <DnsSnapshot i={3} active={2} record="com.  172800  IN  NS  a.gtld-servers.net.（ほか12台）" />
        <p>キャッシュにない場合、フルリゾルバーはルートサーバーに問い合わせます。ルートサーバーは www.example.com の答えを持たず、「com はこれらのサーバーに聞く」という委任の情報を返します。この情報の TTL は 172,800 秒（2日）で、フルリゾルバーは次から com のサーバーに直接聞けます。</p>
      </>
    ),
  },
  {
    label: '④ com のサーバーに聞く',
    detail: (
      <>
        <DnsSnapshot i={4} active={3} record="example.com.  172800  IN  NS  elliott.ns.cloudflare.com.（ほか1台）" />
        <p>com のサーバーも答えを持たず、example.com を管理する権威サーバー（この例では Cloudflare の2台）を返します。ドメインを登録した事業者の画面で設定する「ネームサーバー」が、ここで返る NS レコードです。</p>
      </>
    ),
  },
  {
    label: '⑤ 権威サーバーが答える',
    detail: (
      <>
        <DnsSnapshot i={5} active={4} record="www.example.com.  300  IN  A  104.20.23.154（ほか1件、aa フラグ付き）" />
        <p>権威サーバーは、自分が管理するゾーンのレコードを返します。応答の flags に aa（authoritative answer）が付き、TTL は設定した値（300 秒）そのままです。</p>
      </>
    ),
  },
  {
    label: '⑥ キャッシュして返す',
    detail: (
      <>
        <DnsSnapshot i={6} active={1} record="1 回目 TTL 225 → 5 秒後の 2 回目 TTL 220（キャッシュから）" />
        <p>フルリゾルバーは答えを TTL の間キャッシュし、スタブに返します。キャッシュから返す答えの TTL は残りの秒数なので、5 秒あけて問い合わせると 225 が 220 に減っていました。スタブ（glibc）は、この章の環境では答えをキャッシュしませんでした。</p>
      </>
    ),
  },
] as const

/* ---------- 図3 DNS を切り替えるときの時間 ---------- */
function TtlFigure() {
  const t0 = 190
  const t1 = 260
  const t2 = 560
  const end = 760
  return (
    <Svg id={figure(3)} w={780} h={252} label="T1 で TTL を3600秒から300秒に下げ、T1 から3600秒たった T2 でアドレスを新しいものに変える。T1 の直前に古い TTL で答えを保存したリゾルバーは、最長で T2 の頃まで旧アドレスを返す。T2 の直前に保存したリゾルバーは、最長300秒だけ旧アドレスを返す。旧サーバーは T2 から300秒以上たつまで応答を続ける。">
      <line x1={t1} y1={24} x2={t1} y2={236} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <line x1={t2} y1={24} x2={t2} y2={236} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <T x={t1} y={16} fs={11} anchor="middle" bold>T1：TTL を 300 に下げる</T>
      <T x={t2} y={16} fs={11} anchor="middle" bold>T2：アドレスを切り替える</T>
      <T x={10} y={52} fs={11}>権威 DNS の設定</T>
      <Box x={t0} y={38} w={t1 - t0} h={28} lines="3600・旧" fs={11} />
      <Box x={t1} y={38} w={t2 - t1} h={28} lines="TTL 300・旧アドレス" fs={11} />
      <Box x={t2} y={38} w={end - t2} h={28} lines="TTL 300・新アドレス" fs={11} fill="box5" />
      <T x={10} y={104} fs={11}>T1 の直前に保存した</T>
      <T x={10} y={120} fs={11}>リゾルバー</T>
      <Box x={t1 - 14} y={98} w={t2 - t1 + 4} h={28} lines="旧アドレスを最長 3600 秒返す" fs={11} dashed fill="bg" />
      <Box x={t2 - 10} y={98} w={end - t2 + 10} h={28} lines="新アドレス" fs={11} fill="box5" />
      <T x={10} y={160} fs={11}>T2 の直前に保存した</T>
      <T x={10} y={176} fs={11}>リゾルバー</T>
      <Box x={t2 - 10} y={154} w={70} h={28} lines="旧 300 秒" fs={11} dashed fill="bg" />
      <Box x={t2 + 60} y={154} w={end - t2 - 60} h={28} lines="新アドレス" fs={11} fill="box5" />
      <T x={10} y={214} fs={11}>旧サーバー</T>
      <Box x={t0} y={200} w={t2 + 110 - t0} h={28} lines="応答を続ける（T2 から 300 秒より長く）" fs={11} fill="box4" />
      <Box x={t2 + 110} y={200} w={end - t2 - 110} h={28} lines="停止" fs={11} fill="bg" />
    </Svg>
  )
}

/* ---------- 図4 TLS 1.3 のハンドシェイク ---------- */
function TlsFigure() {
  const cx = 200
  const sx = 580
  const msg = (y: number, fromClient: boolean, label: string, opts: { accent?: boolean; dashed?: boolean; mono?: boolean } = {}) => (
    <g key={label + y}>
      <T x={390} y={y - 2} fs={11} anchor="middle" mono={opts.mono}>{label}</T>
      <Arrow x1={fromClient ? cx : sx} y1={y + 4} x2={fromClient ? sx - 2 : cx + 2} y2={y + 16} accent={opts.accent} dashed={opts.dashed} />
    </g>
  )
  return (
    <Svg id={figure(4)} w={780} h={470} label="TCP の3ウェイハンドシェイクで1往復。次にクライアントが ClientHello（鍵交換の情報と SNI）を送り、サーバーが ServerHello を返す。ここから後のハンドシェイクは暗号化され、サーバーは EncryptedExtensions、Certificate、CertificateVerify、Finished を送る。クライアントは Finished を送り、続けて HTTP の要求を送れるので、TLS は1往復で済む。サーバーは HTTP の応答と NewSessionTicket を返す。">
      <Box x={cx - 80} y={14} w={160} h={42} lines={['クライアント', 'openssl s_client']} fs={12} bold subTone="muted" />
      <Box x={sx - 80} y={14} w={160} h={42} lines={['サーバー', 'Nginx 1.30.6']} fs={12} bold subTone="muted" />
      <line x1={cx} y1={56} x2={cx} y2={430} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <line x1={sx} y1={56} x2={sx} y2={430} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <rect x={cx + 6} y={208} width={sx - cx - 12} height={190} rx={6} fill="var(--fig-box5)" opacity={0.45} />
      <T x={sx + 16} y={214} fs={11} tone="acc" bold>ここから暗号化</T>
      {msg(80, true, 'SYN')}
      {msg(108, false, 'SYN+ACK')}
      {msg(136, true, 'ACK')}
      {msg(170, true, 'ClientHello（key_share・SNI shop.test）', { accent: true })}
      {msg(198, false, 'ServerHello（key_share X25519MLKEM768）', { accent: true })}
      {msg(236, false, 'EncryptedExtensions・Certificate', { accent: true })}
      {msg(264, false, 'CertificateVerify・Finished', { accent: true })}
      {msg(300, true, 'Finished', { accent: true })}
      {msg(328, true, 'HTTP の要求（GET /）')}
      {msg(366, false, 'HTTP の応答（200）')}
      {msg(394, false, 'NewSessionTicket × 2（再接続用）', { dashed: true })}
      <T x={20} y={110} fs={11} tone="muted">1 往復：TCP</T>
      <T x={20} y={200} fs={11} tone="muted">1 往復：TLS</T>
      <T x={20} y={330} fs={11} tone="muted">HTTP の要求は</T>
      <T x={20} y={346} fs={11} tone="muted">Finished に続けて送る</T>
      <T x={20} y={454} fs={11} tone="muted">s_client -msg の出力をもとにした図。互換のために送る ChangeCipherSpec は省略している</T>
    </Svg>
  )
}

/* ---------- 図5 証明書のチェーン ---------- */
function ChainFigure() {
  return (
    <Svg id={figure(5)} w={780} h={306} label="サーバーはサーバー証明書（shop.test、発行者は中間 CA）と中間 CA の証明書（発行者はルート CA）を送る。クライアントは信頼するルート CA の証明書を持っていて、署名をたどってルート CA に届くか、有効期間内か、SAN に URL のホスト名があるか、CertificateVerify で秘密鍵を持つと示したかを確かめる。中間 CA を送らないと21、自己署名で信頼していないと18、名前が違うと62の検証エラーになる。">
      <rect x={20} y={20} width={300} height={170} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={32} y={38} fs={12} bold>サーバーが送る（fullchain.pem）</T>
      <Box x={36} y={50} w={268} h={56} lines={['サーバー証明書', 'subject CN=shop.test・SAN shop.test', 'issuer 中間 CA']} fs={12} bold subTone="muted" />
      <Box x={36} y={122} w={268} h={56} lines={['中間 CA の証明書', 'subject Shop Test Intermediate CA', 'issuer ルート CA']} fs={12} bold subTone="muted" />
      <rect x={20} y={212} width={300} height={84} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={32} y={230} fs={12} bold>クライアントが持つ（信頼する CA）</T>
      <Box x={36} y={240} w={268} h={46} lines={['ルート CA の証明書', 'Shop Test Root CA（自己署名）']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={280} y1={120} x2={280} y2={108} accent />
      <Arrow x1={280} y1={238} x2={280} y2={180} accent />
      <T x={288} y={201} fs={11} tone="acc">署名をたどる</T>
      <T x={360} y={40} fs={12} bold>クライアントが確かめること</T>
      <T x={360} y={66} fs={12}>① 署名をたどって、信頼する CA に届くか</T>
      <T x={360} y={90} fs={12}>② 各証明書が有効期間内か</T>
      <T x={360} y={114} fs={12}>③ SAN に URL のホスト名があるか</T>
      <T x={360} y={138} fs={12}>④ CertificateVerify で秘密鍵を持つと示したか</T>
      <T x={360} y={184} fs={12} bold>この節の検証エラー（openssl の番号）</T>
      <T x={360} y={208} fs={12}>18：自己署名で、信頼する一覧にない</T>
      <T x={360} y={232} fs={12}>20・21：中間 CA を送っていない</T>
      <T x={360} y={256} fs={12}>62：URL のホスト名が SAN にない</T>
    </Svg>
  )
}

/* ---------- 図6 SNI で証明書を選ぶ ---------- */
function SniFigure() {
  return (
    <Svg id={figure(6)} w={780} h={250} label="3つのクライアントが同じ Nginx の443番に接続する。SNI に shop.test を入れると shop.test の証明書、admin.test を入れると admin.test の証明書が返る。SNI を送らないと default_server の shop.test の証明書が返る。">
      <Box x={20} y={24} w={200} h={44} lines={['-servername shop.test']} fs={12} mono />
      <Box x={20} y={92} w={200} h={44} lines={['-servername admin.test']} fs={12} mono />
      <Box x={20} y={160} w={200} h={44} lines={['-noservername（SNI なし）']} fs={12} mono />
      <rect x={300} y={14} width={460} height={224} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={314} y={32} fs={12} bold>Nginx（同じ IP アドレスの 443 番）</T>
      <Box x={420} y={48} w={320} h={60} lines={['server_name shop.test（default_server）', '証明書 CN=shop.test']} fs={12} bold subTone="muted" fill="box5" />
      <Box x={420} y={134} w={320} h={60} lines={['server_name admin.test', '証明書 CN=admin.test']} fs={12} bold subTone="muted" />
      <Arrow x1={220} y1={46} x2={418} y2={72} accent />
      <Arrow x1={220} y1={114} x2={418} y2={160} accent />
      <Arrow x1={220} y1={182} x2={418} y2={90} dashed />
      <T x={420} y={218} fs={11} tone="muted">名前が一致しなければ default_server を使う</T>
    </Svg>
  )
}

/* ---------- 図7 TLS をどこで終端するか ---------- */
function TerminationFigure() {
  const seg = (x1: number, x2: number, y: number, label: string, tls: boolean) => (
    <g key={`${x1}-${y}`}>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={tls ? 'var(--fig-accent)' : 'var(--fig-line)'} strokeWidth={tls ? 4 : 1.5} strokeDasharray={tls ? undefined : '5 4'} />
      <T x={(x1 + x2) / 2} y={y - 12} fs={11} anchor="middle" tone={tls ? 'acc' : 'muted'}>{label}</T>
    </g>
  )
  return (
    <Svg id={figure(7)} w={780} h={230} label="上の構成では、ブラウザーからロードバランサーまでが HTTPS で、ロードバランサーが TLS を終端し、Nginx へは HTTP、Nginx から Puma へは Unix ドメインソケットの HTTP で送る。下の構成では Nginx が TLS を終端し、Puma へは HTTP で送る。どちらも、TLS を終端したプロキシが X-Forwarded-Proto: https を付けて元のスキームを伝える。">
      <T x={20} y={22} fs={12} bold>ロードバランサーで終端する</T>
      <Box x={20} y={40} w={110} h={40} lines="ブラウザー" fs={12} />
      <Box x={240} y={40} w={140} h={40} lines={['ALB', '証明書を持つ']} fs={12} fill="box5" subTone="muted" />
      <Box x={470} y={40} w={110} h={40} lines="Nginx" fs={12} />
      <Box x={660} y={40} w={100} h={40} lines="Puma" fs={12} />
      {seg(130, 240, 60, 'HTTPS（TLS）', true)}
      {seg(380, 470, 60, 'HTTP', false)}
      {seg(580, 660, 60, 'HTTP（unix）', false)}
      <T x={20} y={122} fs={12} bold>Nginx で終端する</T>
      <Box x={20} y={140} w={110} h={40} lines="ブラウザー" fs={12} />
      <Box x={420} y={140} w={160} h={40} lines={['Nginx', '証明書を持つ']} fs={12} fill="box5" subTone="muted" />
      <Box x={660} y={140} w={100} h={40} lines="Puma" fs={12} />
      {seg(130, 420, 160, 'HTTPS（TLS）', true)}
      {seg(580, 660, 160, 'HTTP', false)}
      <T x={20} y={214} fs={11} tone="muted">太い線が TLS で保護される区間。終端したプロキシが X-Forwarded-Proto: https を付け、Rails はそれを信頼して元のスキームを知る</T>
    </Svg>
  )
}

const stubTrace = String.raw`
$ grep ^hosts /etc/nsswitch.conf
hosts:          files dns
$ grep -v '^#' /etc/resolv.conf
nameserver 127.0.0.11
options ndots:0
$ strace -f -e trace=openat,connect,sendmmsg,recvfrom -o dns.txt \
    ruby -rsocket -e 'p Addrinfo.getaddrinfo("www.example.com", 443, nil, :STREAM).map(&:ip_address)'
["104.20.23.154", "172.66.147.243", "2606:4700:10::6814:179a", "2606:4700:10::ac42:93f3"]
$ grep -v ENOENT dns.txt   （主な行だけ。引数の一部を省略）
180   openat(AT_FDCWD, "/etc/nsswitch.conf", O_RDONLY|O_CLOEXEC) = 5
180   openat(AT_FDCWD, "/etc/resolv.conf", O_RDONLY|O_CLOEXEC) = 5
180   openat(AT_FDCWD, "/etc/hosts", O_RDONLY|O_CLOEXEC) = 5
180   connect(5, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("127.0.0.11")}, 16) = 0
180   sendmmsg(5, [{... "\3www\7example\3com\0\0\1\0" ...}, {... "\3www\7example\3com\0\0\34\0" ...}], 2, MSG_NOSIGNAL) = 2
180   recvfrom(5, "\2141\201\200\0\1\0\2\0\0\0\0\3www\7example\3com\0\0\1\0"..., 2048, 0, {... "127.0.0.11"}, ...) = 65
180   recvfrom(5, "\0070\201\200\0\1\0\2\0\0\0\0\3www\7example\3com\0\0\34\0"..., 65536, 0, {... "127.0.0.11"}, ...) = 89
`

const digTrace = String.raw`
$ dig +trace @1.1.1.1 www.example.com A      （署名のレコードと NS の一部の行を省略）
.                   511616  IN  NS  a.root-servers.net.
（m.root-servers.net まで 13 行）
;; Received 525 bytes from 1.1.1.1#53(1.1.1.1) in 9 ms

com.                172800  IN  NS  a.gtld-servers.net.
（m.gtld-servers.net まで 13 行）
;; Received 1175 bytes from 199.7.91.13#53(d.root-servers.net) in 19 ms

example.com.        172800  IN  NS  hera.ns.cloudflare.com.
example.com.        172800  IN  NS  elliott.ns.cloudflare.com.
;; Received 510 bytes from 192.26.92.30#53(c.gtld-servers.net) in 89 ms

www.example.com.    300     IN  A   172.66.147.243
www.example.com.    300     IN  A   104.20.23.154
;; Received 183 bytes from 108.162.195.228#53(elliott.ns.cloudflare.com) in 9 ms
`

const digFull = String.raw`
$ dig @1.1.1.1 www.example.com A
; <<>> DiG 9.20.30-1~deb13u1-Debian <<>> @1.1.1.1 www.example.com A
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 3375
;; flags: qr rd ra ad; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;www.example.com.		IN	A

;; ANSWER SECTION:
www.example.com.	183	IN	A	172.66.147.243
www.example.com.	183	IN	A	104.20.23.154

;; Query time: 19 msec
;; SERVER: 1.1.1.1#53(1.1.1.1) (UDP)
;; WHEN: Fri Nov 27 12:22:31 UTC 2026
;; MSG SIZE  rcvd: 76
`

const digAuth = String.raw`
# 権威サーバーに直接聞く（+norecurse は再帰を頼まない指定）
$ dig @elliott.ns.cloudflare.com www.example.com A +norecurse
;; flags: qr aa; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1
www.example.com.	300	IN	A	172.66.147.243
www.example.com.	300	IN	A	104.20.23.154

# フルリゾルバーに 5 秒あけて2回聞く
$ dig @1.1.1.1 www.example.com A; sleep 5; dig @1.1.1.1 www.example.com A
;; flags: qr rd ra ad; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1
www.example.com.	225	IN	A	172.66.147.243
www.example.com.	220	IN	A	104.20.23.154       ← 2回目（5 秒減った）

# 存在しない名前
$ dig @1.1.1.1 no-such-host-x1.google.com A +noall +comments +authority
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 59732
google.com.		60	IN	SOA	ns1.google.com. dns-admin.google.com. 1030569573 900 900 1800 60
`

const digTypes = String.raw`
$ dig @1.1.1.1 +noall +answer example.com AAAA
example.com.		113	IN	AAAA	2606:4700:10::ac42:93f3
example.com.		113	IN	AAAA	2606:4700:10::6814:179a
$ dig @1.1.1.1 +noall +answer www.github.com A
www.github.com.		2317	IN	CNAME	github.com.
github.com.		6	IN	A	20.27.177.113
$ dig @1.1.1.1 +noall +answer gmail.com MX
gmail.com.		213	IN	MX	30 alt3.gmail-smtp-in.l.google.com.
gmail.com.		213	IN	MX	5 gmail-smtp-in.l.google.com.
gmail.com.		213	IN	MX	40 alt4.gmail-smtp-in.l.google.com.
gmail.com.		213	IN	MX	20 alt2.gmail-smtp-in.l.google.com.
gmail.com.		213	IN	MX	10 alt1.gmail-smtp-in.l.google.com.
$ dig @1.1.1.1 +noall +answer example.com TXT
example.com.		300	IN	TXT	"v=spf1 -all"
example.com.		300	IN	TXT	"_k2n1y4vw3qtb4skdx9e7dxt97qrmmq9"
`

const hostsRun = String.raw`
$ echo "127.0.0.1 shop.test" >> /etc/hosts
$ getent hosts shop.test                        # libc のスタブリゾルバーで引く
127.0.0.1       shop.test
$ ruby -rsocket -e 'p Addrinfo.getaddrinfo("shop.test", 443, nil, :STREAM).map(&:ip_address)'
["127.0.0.1"]
$ dig shop.test A +noall +comments | grep status  # dig は /etc/hosts を読まない
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 12909
`

const tlsMsg = String.raw`
$ openssl s_client -connect ag-105-nginx:443 -servername shop.test -CAfile root.pem -msg </dev/null \
    | grep -E '^(>>>|<<<).*(Handshake|ChangeCipherSpec)'
>>> TLS 1.3, Handshake [length 060a], ClientHello
<<< TLS 1.3, Handshake [length 04ba], ServerHello
<<< TLS 1.3, ChangeCipherSpec [length 0001]
<<< TLS 1.3, Handshake [length 000a], EncryptedExtensions
<<< TLS 1.3, Handshake [length 036a], Certificate
<<< TLS 1.3, Handshake [length 004f], CertificateVerify
<<< TLS 1.3, Handshake [length 0034], Finished
>>> TLS 1.3, ChangeCipherSpec [length 0001]
>>> TLS 1.3, Handshake [length 0034], Finished
<<< TLS 1.3, Handshake [length 0109], NewSessionTicket
<<< TLS 1.3, Handshake [length 0109], NewSessionTicket
$ openssl s_client -connect ag-105-nginx:443 -servername shop.test -CAfile root.pem </dev/null \
    | grep -E 'Negotiated TLS1.3 group|Peer signature type'
Peer signature type: ecdsa_secp256r1_sha256
Negotiated TLS1.3 group: X25519MLKEM768
`

const pkiScript = String.raw`
# make.sh：ルート CA → 中間 CA → サーバー証明書の3段の証明書を作る（OpenSSL 3.5）
set -e
cd /pki
# ルート CA（自分で自分に署名する）
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -noenc -days 30 \
  -subj "/CN=Shop Test Root CA" -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,keyCertSign,cRLSign" -keyout root.key -out root.pem
# 中間 CA（ルート CA が署名する）
openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -noenc -subj "/CN=Shop Test Intermediate CA" \
  -keyout inter.key -out inter.csr
openssl x509 -req -in inter.csr -CA root.pem -CAkey root.key -days 30 -out inter.pem \
  -extfile <(printf "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign")
# サーバー証明書（中間 CA が署名する）。shop.test と admin.test の2枚
for name in shop.test admin.test; do
  openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -noenc -subj "/CN=$name" \
    -keyout $name.key -out $name.csr
  openssl x509 -req -in $name.csr -CA inter.pem -CAkey inter.key -days 30 -out $name.pem \
    -extfile <(printf "subjectAltName=DNS:$name\nextendedKeyUsage=serverAuth")
  cat $name.pem inter.pem > $name.fullchain.pem    # サーバー証明書と中間 CA を続けて置く
done
# 自己署名のサーバー証明書（比較用）
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -noenc -days 30 \
  -subj "/CN=self.test" -addext "subjectAltName=DNS:self.test" -keyout self.key -out self.pem
`

const x509Out = String.raw`
$ openssl x509 -in shop.test.pem -noout -subject -issuer -dates -ext subjectAltName,extendedKeyUsage
subject=CN=shop.test
issuer=CN=Shop Test Intermediate CA
notBefore=Nov 27 12:23:32 2026 GMT
notAfter=Dec 27 12:23:32 2026 GMT
X509v3 Subject Alternative Name:
    DNS:shop.test
X509v3 Extended Key Usage:
    TLS Web Server Authentication
$ openssl x509 -in inter.pem -noout -subject -issuer -ext basicConstraints
subject=CN=Shop Test Intermediate CA
issuer=CN=Shop Test Root CA
X509v3 Basic Constraints: critical
    CA:TRUE, pathlen:0
`

const nginxTls = String.raw`
events {}
http {
  server {                                     # SNI が一致しないときに使う既定のサーバー
    listen 443 ssl default_server;
    server_name shop.test;
    ssl_certificate     /pki/shop.test.fullchain.pem;   # サーバー証明書 + 中間 CA
    ssl_certificate_key /pki/shop.test.key;
    return 200 "shop\n";
  }
  server {
    listen 443 ssl;
    server_name admin.test;
    ssl_certificate     /pki/admin.test.fullchain.pem;
    ssl_certificate_key /pki/admin.test.key;
    return 200 "admin\n";
  }
  server {                                     # 中間 CA を置き忘れた設定
    listen 8443 ssl;
    server_name shop.test;
    ssl_certificate     /pki/shop.test.pem;
    ssl_certificate_key /pki/shop.test.key;
    return 200 "shop (no intermediate)\n";
  }
  server {                                     # 自己署名の証明書
    listen 9443 ssl;
    server_name self.test;
    ssl_certificate     /pki/self.pem;
    ssl_certificate_key /pki/self.key;
    return 200 "self\n";
  }
}
`

const verifyRun = String.raw`
$ docker run -d --rm --name ag-105-nginx --network rbdemo \
    -v "$PWD/pki":/pki:ro -v "$PWD/nginx-tls.conf":/etc/nginx/nginx.conf:ro nginx:1.30.6
$ H=ag-105-nginx    # 以下、出力は検証に関係する行だけ

# 1. 自己署名の証明書。信頼する証明書を渡さない
$ openssl s_client -connect $H:9443 -servername self.test -verify_hostname self.test </dev/null
depth=0 CN=self.test
verify error:num=18:self-signed certificate
Verify return code: 18 (self-signed certificate)

# 2. 同じ証明書を -CAfile で「信頼する」と指定する
$ openssl s_client -connect $H:9443 -servername self.test -verify_hostname self.test -CAfile self.pem </dev/null
depth=0 CN=self.test
Verification: OK
Verify return code: 0 (ok)

# 3. 中間 CA つき。ルート CA を渡す
$ openssl s_client -connect $H:443 -servername shop.test -verify_hostname shop.test -CAfile root.pem </dev/null
depth=2 CN=Shop Test Root CA
depth=1 CN=Shop Test Intermediate CA
depth=0 CN=shop.test
Certificate chain
 0 s:CN=shop.test
   i:CN=Shop Test Intermediate CA
 1 s:CN=Shop Test Intermediate CA
   i:CN=Shop Test Root CA
Verification: OK
Verify return code: 0 (ok)

# 4. 中間 CA を置き忘れたサーバー。ルート CA を渡しても失敗する
$ openssl s_client -connect $H:8443 -servername shop.test -verify_hostname shop.test -CAfile root.pem </dev/null
depth=0 CN=shop.test
verify error:num=20:unable to get local issuer certificate
verify error:num=21:unable to verify the first certificate
Certificate chain
 0 s:CN=shop.test
   i:CN=Shop Test Intermediate CA
Verify return code: 21 (unable to verify the first certificate)

# 5. 証明書は正しいが、確かめる名前が違う
$ openssl s_client -connect $H:443 -servername shop.test -verify_hostname other.test -CAfile root.pem </dev/null
verify error:num=62:hostname mismatch
Verify return code: 62 (hostname mismatch)
`

const sniRun = String.raw`
$ for sn in shop.test admin.test; do
    openssl s_client -connect ag-105-nginx:443 -servername $sn -CAfile root.pem </dev/null 2>/dev/null \
      | grep -E '^(subject|issuer)='
  done
subject=CN=shop.test
issuer=CN=Shop Test Intermediate CA
subject=CN=admin.test
issuer=CN=Shop Test Intermediate CA
$ openssl s_client -connect ag-105-nginx:443 -noservername -CAfile root.pem </dev/null 2>/dev/null | grep '^subject='
subject=CN=shop.test
$ curl -s --cacert root.pem --resolve admin.test:443:172.29.0.9 https://admin.test/
admin
`

const timingRun = String.raw`
$ for i in 1 2 3; do
    curl -s -o /dev/null -w "DNS %{time_namelookup}  TCP %{time_connect}  TLS %{time_appconnect}  最初の1バイト %{time_starttransfer}  合計 %{time_total}\n" https://www.example.com/
  done
DNS 0.042796  TCP 0.052148  TLS 0.078371  最初の1バイト 0.117016  合計 0.117169
DNS 0.005606  TCP 0.015988  TLS 0.038541  最初の1バイト 0.068542  合計 0.068628
DNS 0.004492  TCP 0.012797  TLS 0.044049  最初の1バイト 0.059508  合計 0.059592
`

const sslRb = String.raw`
# actionpack/lib/action_dispatch/middleware/ssl.rb（67〜74 行目）
# :stopdoc: Default to 2 years as recommended on hstspreload.org.
HSTS_EXPIRES_IN = 63072000

PERMANENT_REDIRECT_REQUEST_METHODS = %w[GET HEAD] # :nodoc:

def self.default_hsts_options
  { expires: HSTS_EXPIRES_IN, subdomains: true, preload: false }
end
`

const chapter: Chapter = {
  number: 105,
  part: 5,
  title: "DNS と TLS で HTTPS を始める",
  summary: "名前から接続先を調べ、TLS で相手の身元を確認し、暗号化した HTTP を送るまでを説明します。dig と openssl s_client で、名前解決の流れ、証明書のチェーン、名前の検証、SNI を確かめます。",
  goals: [
    "スタブリゾルバー、フルリゾルバー、権威 DNS サーバー、TTL の役割を区別し、dig の出力を読む",
    "A・AAAA・CNAME・ALIAS・MX・TXT の使い分けを説明する",
    "TLS 1.3 の初回の接続と、証明書のチェーン・名前の検証・SNI を説明する",
    "TLS を終端する場所と、暗号化される区間を特定する",
  ],
  prerequisites: [94, 104],
  sections: [
    {
      id: "dns",
      title: "名前解決の流れ：スタブ・フルリゾルバー・権威サーバー",
      body: (
        <>
          <p>ブラウザーが <code>https://shop.example.com/</code> を開くとき、まず通信相手の IP アドレスが必要です。TCP の接続先は IP アドレスとポートで指定するからです（<ChapterLink n={104} section="layers" />）。<Term en="Domain Name System">DNS</Term> は、名前に対応する情報をネットワーク上から得る仕組みです。この節では、Ruby が www.example.com の IP アドレスを得るまでに、どのプログラムとサーバーが何をするかを、strace と dig で追います <Ref n={1} />。</p>
          <p>実験は Docker のコンテナ（Debian 13、dig 9.20.30、OpenSSL 3.5.7、curl 8.14.1）で行い、外部の DNS への問い合わせはインターネット上のサーバーに送っています。TTL などの値は実行した時点のもので、同じコマンドでも結果は変わります。</p>
          <h3>スタブリゾルバー</h3>
          <p>アプリケーションの中で名前を引くのは、libc（C の標準ライブラリ）の getaddrinfo などの関数です。この部分を<Term en="stub resolver">スタブリゾルバー</Term>と呼びます。スタブリゾルバーは自分では委任をたどらず、設定ファイルを読んで、決まったサーバーに答えを求めます。Ruby の <code>Addrinfo.getaddrinfo</code> を strace で追跡しました。</p>
          <Code lang="bash" title="Ruby から名前を引くときのシステムコール（Ruby 4.0.9、glibc）" code={stubTrace} />
          <p>libc は最初に <code>/etc/nsswitch.conf</code> を読み、hosts の行の順（files、dns）を決めます。次に <code>/etc/resolv.conf</code> で問い合わせ先（nameserver）を確かめ、<code>/etc/hosts</code> を探してから、127.0.0.11 の 53 番に UDP で質問を送りました。sendmmsg の1回で2つの質問を送っているのは、A（IPv4 のアドレス）と AAAA（IPv6 のアドレス）を同時に聞いているためです。質問の末尾の <code>\1</code> が A（種類の番号 1）、<code>\34</code> が AAAA（8進数の 34 で 28）を表します。2つの recvfrom がそれぞれの答えで、Ruby には4つのアドレスが返りました <Ref n={10} /><Ref n={11} />。127.0.0.11 は Docker がコンテナに用意する DNS で、ホストの設定に従って問い合わせを転送します。</p>
          <h3>フルリゾルバーと権威サーバー</h3>
          <p>スタブリゾルバーが問い合わせる先は<Term en="full-service resolver">フルリゾルバー</Term>（再帰リゾルバー）です。会社のネットワークや VPC の DNS、1.1.1.1 のような公開のサービスがこれに当たります。フルリゾルバーは有効な答えをキャッシュに持っていればそれを返し、なければルートサーバーから委任の情報をたどって、対象の名前を管理する<Term en="authoritative server">権威サーバー</Term>に問い合わせます。dig の <code>+trace</code> はこの委任をたどる手順を dig 自身が行って表示します <Ref n={9} />。</p>
          <Code lang="text" title="dig +trace（dig 9.20.30）" code={digTrace} />
          <p>1つ目のかたまりはルートサーバー（名前の末尾の「.」を管理するサーバー）の一覧です。2つ目はルートサーバーの1台（d.root-servers.net）が返した「com は a〜m.gtld-servers.net に聞く」という委任です。3つ目は com のサーバーが返した「example.com は Cloudflare の2台に聞く」という委任で、4つ目で権威サーバーが www.example.com の A レコードを返しました。最後の答えだけに TTL 300 の A レコードがあり、それより前は NS レコード（名前を管理するサーバーの一覧）です（図 {figure(1)}）。</p>
          <Figure n={figure(1)} title="名前解決にかかわるプログラムとサーバー" caption="キャッシュがない場合の模式図です。実際には OS やブラウザー、Docker の DNS などにもキャッシュや転送があり、委任の情報も再利用されます。">
            <DnsFigure />
          </Figure>
          <p>通常、クライアントは再帰リゾルバーと呼ばれる DNS サーバーに問い合わせます。リゾルバーが有効な結果を持っていれば、その結果を返せます。途中で得た委任の情報も TTL の間は再利用できるため、すべての問い合わせがルートから始まるわけではありません。上の例では com の委任の TTL が 172,800 秒（2日）なので、フルリゾルバーは2日間、ルートに聞かずに com のサーバーへ直接問い合わせられます。下の段階送りで、1回の名前解決の流れを順に確かめられます。</p>
          <Figure n={figure(2)} title="www.example.com を引く流れ（段階送り）" caption="この節の strace と dig の結果をもとにした概念モデルです。実際のフルリゾルバーはキャッシュの状態によって③④を省き、複数のサーバーに並行して問い合わせることもあります。">
            <Stepper steps={dnsSteps} />
          </Figure>
          <p>名前解決が成功すると、クライアントは得られた候補のアドレスに接続を試みます。DNS の応答があることと、接続できることは別です。さらに、接続できてもそのサーバーが目的のホスト名の正しい相手であることを確かめる手順が必要です。HTTPS ではその確認に TLS の証明書を使います。</p>
        </>
      ),
    },
    {
      id: "records",
      title: "レコードの種類：A・AAAA・CNAME・ALIAS・MX・TXT",
      body: (
        <>
          <p>DNS が返す情報の単位をレコード（リソースレコード）と呼びます。1つのレコードは、名前、TTL、クラス（インターネットでは IN）、種類、値の5つで書きます。Rails のアプリを公開するときに使う主な種類を、実際のドメインで引きました <Ref n={7} /><Ref n={8} />。</p>
          <Code lang="bash" title="種類を指定して引く（dig 9.20.30、フルリゾルバーは 1.1.1.1）" code={digTypes} />
          <div className="table-wrap">
            <table>
              <caption>Rails のアプリの公開でよく使うレコード</caption>
              <thead><tr><th scope="col">種類</th><th scope="col">値</th><th scope="col">使う場面</th></tr></thead>
              <tbody>
                <tr><th scope="row">A</th><td>IPv4 アドレス</td><td>サーバーやロードバランサーの IPv4 のアドレスを示す</td></tr>
                <tr><th scope="row">AAAA</th><td>IPv6 アドレス</td><td>IPv6 で接続できるようにする。A と両方を返すことが多い</td></tr>
                <tr><th scope="row">CNAME</th><td>別の名前</td><td>www.example.com を、事業者が管理する名前（ロードバランサーや CDN の名前）の別名にする</td></tr>
                <tr><th scope="row">ALIAS など</th><td>（DNS の事業者の機能）</td><td>ドメインの頂点（example.com）を、ロードバランサーなどの名前に向ける</td></tr>
                <tr><th scope="row">MX</th><td>優先度とメールサーバーの名前</td><td>そのドメイン宛てのメールの受け取り先</td></tr>
                <tr><th scope="row">TXT</th><td>文字列</td><td>SPF（送信してよいメールサーバー）や、ドメインの所有の確認</td></tr>
                <tr><th scope="row">NS・SOA</th><td>権威サーバーの名前・ゾーンの管理情報</td><td>委任と、存在しない名前の答えのキャッシュ時間</td></tr>
              </tbody>
            </table>
          </div>
          <p>www.github.com の答えは2行で、1行目の CNAME が「www.github.com は github.com の別名」であることを、2行目が github.com の A レコードを表します。フルリゾルバーは CNAME をたどって、最後の A レコードまでまとめて返します。CNAME と A の TTL は別々で、この例では CNAME が 2,317 秒、A が 6 秒でした。</p>
          <p>CNAME を置いた名前にはほかの種類のレコードを置けません <Ref n={1} />。ドメインの頂点（example.com）には NS と SOA が必ずあるので、頂点に CNAME は置けません。AWS の ALB のように IP アドレスが変わるロードバランサーに頂点を向けるために、DNS の事業者は独自の機能を用意しています。Route 53 のエイリアスレコードは問い合わせに対して ALB などの現在のアドレスを A や AAAA のレコードとして返します。そのため dig で見ても ALIAS という種類は現れず、A レコードが返ります <Ref n={16} />。ほかの事業者では ALIAS や ANAME と呼ぶ同様の機能があります。</p>
          <p>MX の数値は優先度で、メールを送る側は値の小さいサーバーから順に試します <Ref n={21} />。gmail.com の例では 5 の gmail-smtp-in.l.google.com が最初です。TXT の <code>v=spf1 -all</code> は SPF の書き方で、「このドメインからメールを送るサーバーはない」ことを表します <Ref n={20} />。Rails の Action Mailer で自社のドメインからメールを送るなら、送信に使うサービスが案内する SPF などのレコードを TXT で登録します（<ChapterLink n={19} />）。</p>
        </>
      ),
    },
    {
      id: "dig",
      title: "dig の出力と TTL・キャッシュ",
      body: (
        <>
          <p>dig は指定した DNS サーバーに質問を送り、返ってきたメッセージをほぼそのまま表示するコマンドです <Ref n={9} />。フルリゾルバー（1.1.1.1）に www.example.com の A を聞いた全体の出力を読みます。</p>
          <Code lang="text" title="dig の全体の出力（dig 9.20.30）" code={digFull} />
          <p>status の NOERROR は、名前が存在して答えを返せたことを表します。名前が存在しなければ NXDOMAIN、サーバーが答えを出せなければ SERVFAIL になります。flags の qr はこれが応答であること、rd は再帰を頼んだこと、ra はサーバーが再帰に応じられることを表します。ad は DNSSEC の検証が済んだことを示す印です。QUESTION SECTION が質問、ANSWER SECTION が答えで、2列目の 183 が TTL（秒）です。Query time は 19 ms で、SERVER の行から UDP で 1.1.1.1 に聞いたことが分かります <Ref n={7} />。</p>
          <p>同じ質問を権威サーバーに直接送ったときと、フルリゾルバーに続けて送ったときを比べました。</p>
          <Code lang="bash" title="権威サーバーとフルリゾルバーの答えの違い" code={digAuth} />
          <p>権威サーバーの答えには aa（authoritative answer）の印があり、TTL は設定値の 300 でした。フルリゾルバーの答えには aa がなく、TTL は 225、5 秒後に 220 でした。<Term en="TTL">TTL</Term>（Time To Live）は「この答えを何秒キャッシュしてよいか」を表し、キャッシュから返す答えでは残りの秒数になります。1.1.1.1 は少なくとも 75 秒前に権威サーバーから答えを得ていたと考えられます。</p>
          <p>存在しない名前を聞くと、status が NXDOMAIN になり、AUTHORITY SECTION に SOA レコードが付きました。フルリゾルバーは「この名前はない」という答えもキャッシュし、その時間は SOA の TTL（60）と SOA の最後の値（60）の小さいほうで決まります <Ref n={4} />。google.com は 60 秒ですが、1,800 秒のように長いドメインもあります。</p>
          <p>キャッシュは複数の場所にあります。フルリゾルバーのほかに、OS（systemd-resolved や nscd を使っている場合）、ブラウザー、Docker の DNS などがキャッシュすることがあります。この章のコンテナの glibc は答えをキャッシュせず、問い合わせのたびに 127.0.0.11 へ送っていました。Ruby のプロセスの中では Net::HTTP などが接続のたびに名前を引きます。</p>
        </>
      ),
    },
    {
      id: "dns-change",
      title: "DNS を切り替えるときに観測する",
      body: (
        <>
          <p>例えば、TTL が 3,600 秒のレコードを新しいアドレスへ変更する前に、TTL を 300 秒に下げるとします。既存のリゾルバーが変更直前に長い TTL でレコードを得ていた場合、残りの有効期間は最長で約 3,600 秒です。TTL を下げてから旧 TTL の期間を置いて切り替えると、通常の有効期限に従うリゾルバーでは、新しいアドレスに変わるまでの時間を短くできます（図 {figure(3)}）。切り替える直前に TTL を短くしても、長い TTL で保存済みの結果の期限は短くなりません。切り替え前に既存のキャッシュが期限切れになる時間を見込み、旧サーバーでも応答を続ければ、切り替え途中の利用者にも応答できます。</p>
          <Figure n={figure(3)} title="TTL を下げてからアドレスを切り替える" caption="時間の長さは比例していない模式図です。TTL を守らずに長くキャッシュするリゾルバーやクライアントもあるため、旧サーバーを止める時期は旧サーバーへの要求のログで決めます。">
            <TtlFigure />
          </Figure>
          <p>存在しない名前を問い合わせた結果も、前の節で見たとおりキャッシュされます。新しいホスト名を作る前に同じ名前を問い合わせると、そのリゾルバー経由でしばらく「名前がない」と返ることがあります。名前を追加した時刻だけで判断せず、権威 DNS のデータと、利用者の再帰リゾルバーが返しているデータを区別します。<code>dig @権威サーバー</code> と <code>dig @フルリゾルバー</code> を並べて実行すると、どちらが古いかを確かめられます。</p>
          <p>DNS のキャッシュが更新されても、接続を再利用しているクライアントは、開いている TCP 接続の相手へ引き続き要求を送る場合があります。DNS の TTL は既存接続を閉じる時刻を決めません。デプロイや移行では、DNS の変更後に旧サーバーが受けた要求を観測し、必要な時間だけ旧サーバーの応答を維持します。Rails から DB への接続も同じで、DB のフェイルオーバーで DNS が返すアドレスが変わっても、接続プールの古い接続は元のサーバーにつながったままのことがあります（第6部の演習「<a href="#/linux/case42">フェイルオーバーのあと、書き込みだけがときどき失敗する</a>」）。</p>
          <h3>/etc/hosts と dig の違い</h3>
          <p>dig は DNS のメッセージを直接送るコマンドで、libc のスタブリゾルバーを通りません。そのため <code>/etc/hosts</code> の内容は dig の結果に出ません。</p>
          <Code lang="bash" title="/etc/hosts に書いた名前を引く" code={hostsRun} />
          <p>getent と Ruby は libc を通るので <code>/etc/hosts</code> の 127.0.0.1 を返し、dig は DNS に聞いて NXDOMAIN を返しました。アプリケーションの接続先を調べるときは、アプリケーションと同じ経路で引く getent の結果も確かめます。「dig では正しいアドレスなのに、アプリだけが古い接続先に行く」ときは、<code>/etc/hosts</code> に古い行が残っていないかを疑います。この切り分けは第6部の演習「<a href="#/linux/case31">外部連携が2つとも落ちている</a>」で練習できます。</p>
          <Ref n={1} /><Ref n={4} />
        </>
      ),
    },
    {
      id: "tls",
      title: "TLS 1.3 のハンドシェイク",
      body: (
        <>
          <p>HTTPS は HTTP の通信に TLS による保護を加えます。TLS は通信内容を暗号化し、途中で内容が変更されていないかを確認し、通常はサーバーを認証します。<ChapterLink n={94} section="https" /> では curl で自己署名の証明書を拒否されるところまでを見ました。ここでは、TCP 上の TLS 1.3 で初めて接続し、前の接続の情報を使わず、クライアント証明書も使わない例で、どのメッセージがどの順に流れるかを確かめます <Ref n={2} />。</p>
          <p>検証用に、Nginx 1.30.6 のコンテナで HTTPS のサーバーを動かしました。証明書は次の節で作る3段のもの（ルート CA、中間 CA、shop.test のサーバー証明書）です。openssl s_client は TLS のクライアントとして接続し、<code>-msg</code> を付けると送受信したハンドシェイクのメッセージを表示します <Ref n={12} />。</p>
          <Code lang="bash" title="TLS 1.3 のハンドシェイクのメッセージ（OpenSSL 3.5.7、Nginx 1.30.6）" code={tlsMsg} />
          <p>&gt;&gt;&gt; がクライアントが送ったもの、&lt;&lt;&lt; が受け取ったものです。TCP 接続ができた後、クライアントは ClientHello を送り、利用できる暗号方式、鍵交換の候補と鍵の材料（key_share）、接続したいホスト名（SNI）を示します。サーバーが ServerHello で選択を伝えると、両端が共有する秘密を導き出すための情報がそろいます。この実験で選ばれた鍵交換は X25519MLKEM768 でした。従来の X25519 と、量子コンピューターへの対策として標準化された ML-KEM を組み合わせた方式で、ClientHello が 0x060a（1,546）バイトと大きいのはこの鍵の材料のためです。</p>
          <p>ServerHello より後のハンドシェイクは暗号化されます。サーバーは EncryptedExtensions（追加の設定）、Certificate（証明書のチェーン）、CertificateVerify（証明書に対応する秘密鍵で、ここまでのやり取りに署名したもの）、Finished（ここまでのやり取りが改ざんされていないことの確認）を続けて送ります。クライアントが Finished を返せば、すぐに HTTP の要求を送れます。TLS 1.3 の初回の接続は TCP の1往復に加えて TLS の1往復で済みます（図 {figure(4)}）。第三者が公開の情報を読んだだけで通信の鍵を再現できないように鍵交換を行います。</p>
          <Figure n={figure(4)} title="TCP 上の TLS 1.3 の初回の接続" caption="上の s_client の出力を、クライアントとサーバーの間の矢印として並べた図です。斜めの矢印の長さは実際の時間と比例していません。前の接続を再開する場合や、HelloRetryRequest が入る場合は手順が変わります。">
            <TlsFigure />
          </Figure>
          <p>ChangeCipherSpec は TLS 1.2 との互換のために送られるもので、TLS 1.3 では意味を持ちません。最後の NewSessionTicket は次に同じサーバーへ接続するときに、ハンドシェイクを短くするための情報です。CertificateVerify で使った署名方式は ecdsa_secp256r1_sha256 で、次の節で作った P-256 の鍵に対応しています。</p>
        </>
      ),
    },
    {
      id: "certificates",
      title: "証明書のチェーンと名前の検証",
      body: (
        <>
          <p>サーバー証明書は、「この公開鍵の持ち主は shop.test である」という内容に、認証局（CA）が署名したデータです。クライアントはサーバー証明書の署名を、署名した CA の証明書でたどり、自分が信頼する CA（OS やブラウザーが持つルート CA の一覧）に届くかを確かめます。多くの場合、ルート CA はサーバー証明書に直接は署名せず、間に中間 CA が入ります <Ref n={13} />。この関係を手元で再現するため、ルート CA、中間 CA、サーバー証明書の3段の証明書を作りました。</p>
          <Code lang="bash" title="make.sh（OpenSSL 3.5.7。nginx:1.30.6 のコンテナで実行）" code={pkiScript} />
          <Code lang="bash" title="サーバー証明書と中間 CA の証明書の中身" code={x509Out} />
          <p>サーバー証明書の issuer（発行者）は中間 CA で、中間 CA の issuer はルート CA です。中間 CA の basicConstraints の CA:TRUE は「ほかの証明書に署名してよい」こと、pathlen:0 は「その下にさらに CA を置かない」ことを表します。サーバー証明書の Subject Alternative Name（SAN）にある DNS:shop.test が名前の検証に使う値です。証明書の subject の CN は名前の検証には使わず、SAN を使います <Ref n={3} />。</p>
          <p>Nginx にはサーバー証明書と中間 CA の証明書をこの順に続けたファイル（fullchain）を ssl_certificate に指定しました。比較のため、中間 CA を置き忘れた設定（8443 番）と、自己署名の証明書を使う設定（9443 番）も用意しています <Ref n={15} />。</p>
          <Code lang="nginx" title="nginx-tls.conf（Nginx 1.30.6）" code={nginxTls} />
          <p>この Nginx に s_client で接続し、<code>-CAfile</code>（信頼する CA の証明書）と <code>-verify_hostname</code>（照合する名前）を変えて検証の結果を比べました。</p>
          <Code lang="bash" title="証明書を検証して成功する場合と失敗する場合（OpenSSL 3.5.7）" code={verifyRun} />
          <p>1では、サーバー証明書の発行者が自分自身で、信頼する一覧にもないため、18（self-signed certificate）で失敗しました。2では同じ証明書を -CAfile で信頼すると指定したので成功しました。<ChapterLink n={94} section="https" /> の curl の <code>--cacert</code> と同じことをしています。3は本番に近い形で、サーバーが送った2枚（depth 0 と 1）とクライアントが持つルート CA（depth 2）がつながり、成功しました。</p>
          <p>4は本番でも起きやすい失敗です。サーバーが中間 CA を送らないと、クライアントはルート CA を持っていても、サーバー証明書の発行者（中間 CA）の証明書を見つけられず、20（unable to get local issuer certificate）と21で失敗します。ブラウザーによっては以前に見た中間 CA を覚えていて開けてしまうことがあるため、curl や s_client で確かめます。5は証明書のチェーンは正しいものの、照合する名前（other.test）が SAN にないので、62（hostname mismatch）で失敗しました（図 {figure(5)}）。</p>
          <Figure n={figure(5)} title="証明書のチェーンとクライアントの確認" caption="この節で作った3段の証明書の関係です。実際のルート CA の一覧は OS やブラウザーが持ち、有効期間の確認や失効の確認の方法はクライアントによって違います。">
            <ChainFigure />
          </Figure>
          <p>クライアントは受け取った証明書の署名の連鎖を調べ、信頼する認証局につながるか、使用する時点で有効か、目的のホスト名と一致するかを確認します。サーバーは CertificateVerify により、証明書に対応する秘密鍵を持っていることを示します。証明書に名前があること、クライアントがその証明書を信頼すること、提示者が鍵を持つことには、それぞれ別の役割があります。</p>
        </>
      ),
    },
    {
      id: "sni",
      title: "SNI で証明書を選ぶ",
      body: (
        <>
          <p>同じ IP アドレスとポートで複数の Web サイトを提供するとき、サーバーは ClientHello を受け取った時点で、どのサイトの証明書を返すかを決める必要があります。HTTP の Host ヘッダーは TLS のハンドシェイクが終わるまで届かないからです。そこでクライアントは通常、ClientHello の <Term en="Server Name Indication">SNI</Term> に接続したいホスト名を入れます <Ref n={14} />。前の節の Nginx には 443 番に shop.test と admin.test の2つの server を置いています。</p>
          <Code lang="bash" title="SNI を変えて同じ 443 番に接続する" code={sniRun} />
          <p>SNI に shop.test を入れると shop.test の証明書、admin.test を入れると admin.test の証明書が返りました。SNI を送らない（<code>-noservername</code>）と、default_server にした shop.test の証明書が返りました。curl は URL のホスト名を SNI に入れるので、<code>--resolve</code> で接続先の IP アドレスだけを固定すれば、DNS を変える前に新しいサーバーの証明書を確かめられます（図 {figure(6)}）<Ref n={15} />。</p>
          <Figure n={figure(6)} title="SNI で Nginx の server と証明書を選ぶ" caption="この節の実験の構成です。Nginx は SNI の名前で server を選び、一致する server がなければ default_server を使います。">
            <SniFigure />
          </Figure>
          <p>証明書の検証に使う名前は、クライアントが接続するつもりだった名前です。DNS の名前解決先にたどり着いたことだけで、証明書の検証が済んだことにはなりません。SNI は ClientHello の中で暗号化されずに送られるので、経路上の機器からはアクセス先のホスト名が見えます（ClientHello を暗号化する拡張を使う場合を除く）。</p>
        </>
      ),
    },
    {
      id: "termination",
      title: "TLS をどこで終端するか",
      body: (
        <>
          <p>クライアントに対する TLS の相手は、証明書を提示して TLS の通信を終端するサーバーです。Nginx がこの相手になり、復号した HTTP を同じホスト上の Puma へ送る構成があります。別の構成ではロードバランサーが TLS を終端します。終端してから Rails へどのプロトコルを使うかは、その区間で個別に設定します（図 {figure(7)}）。</p>
          <Figure n={figure(7)} title="TLS を終端する場所と保護される区間" caption="2つの代表的な構成の模式図です。ロードバランサーから Nginx へも HTTPS で送る構成や、ロードバランサーが TLS を終端せずに TCP のまま転送する構成もあります。">
            <TerminationFigure />
          </Figure>
          <p>たとえば、ブラウザーからロードバランサーまでは HTTPS、ロードバランサーから Nginx も HTTPS、Nginx から Puma は Unix ドメインソケット上の HTTP という構成が成立します。最初と二番目の HTTPS は、独立した TLS の接続です。逆に、ロードバランサーからターゲットへ HTTP を送る設定なら、その区間は TLS で保護されません。アプリケーションの配置、組織の要件、どの装置を信頼するかを前提に方式を選びます。</p>
          <p>終端する場所によって、証明書を置く場所と更新の手順が変わります。AWS の ALB で終端するなら、証明書は ACM（AWS Certificate Manager）に置き、ALB のリスナーに設定します。Nginx で終端するなら、サーバーのファイルに置き、更新した後に Nginx に読み込み直させます。前の節で見た中間 CA の置き忘れは、Nginx のように証明書のファイルを自分で並べる構成で起きやすい失敗です。</p>
          <p>Rails がリダイレクト先を組み立てたり Cookie の属性を設定したりするときは、利用者が最初に使ったスキームが必要なことがあります。プロキシで HTTPS を終端する構成では、信頼できるプロキシが元のスキームを X-Forwarded-Proto などのヘッダーでアプリケーションへ伝えます。利用者が送った同名のヘッダーをそのまま採用すると、アプリケーションが誤ったスキームを認識するおそれがあるため、どのプロキシで値を設定するかを決めます。ヘッダーの受け渡しを誤ってリダイレクトが繰り返される例は <ChapterLink n={25} section="tls-proto" /> で扱います。</p>
          <p>DNS の変更と証明書の更新を同時に行うと、どちらに不備があっても HTTPS が開かなくなる可能性があります。DNS で返る候補、到達できる待ち受けポート、その接続で提示された証明書を切り分けて確認します。証明書の期限前に更新した後は、ファイルを保存した時刻だけでなく、実際に接続したサーバーが新しい証明書を提示することまで、<code>openssl s_client</code> の notAfter などで確認します。</p>
        </>
      ),
    },
    {
      id: "hsts",
      title: "HSTS と force_ssl",
      body: (
        <>
          <p>利用者がアドレス欄に <code>shop.example.com</code> とだけ入力すると、ブラウザーは最初に http で接続することがあります。この最初の要求は暗号化されていないので、経路上で書き換えられると、https へのリダイレクトそのものを届かなくされるおそれがあります。<Term en="HTTP Strict Transport Security">HSTS</Term> は、HTTPS の応答の Strict-Transport-Security ヘッダーで「このホストには、指定した秒数の間は https だけで接続すること」をブラウザーに覚えさせる仕組みです <Ref n={17} />。ブラウザーは覚えている間、http の URL を自分で https に書き換えて接続します。</p>
          <p>Rails の <code>config.force_ssl = true</code> は ActionDispatch::SSL を有効にし、http の要求の https へのリダイレクト、HSTS のヘッダーの付与、Cookie への secure 属性の付与を行います。HSTS の既定の有効期間は2年で、サブドメインも対象にします <Ref n={18} />。</p>
          <Code lang="ruby" title="ActionDispatch::SSL の HSTS の既定値（Rails 8.1.4.1）" href={`${GH}/actionpack/lib/action_dispatch/middleware/ssl.rb#L67-L74`} code={sslRb} />
          <p>includeSubDomains を付けた HSTS は、そのドメインのすべてのサブドメインに効きます。http でしか提供していない社内向けのサブドメインがあると、一度 HSTS を受け取ったブラウザーからは開けなくなります。preload（ブラウザーにあらかじめ組み込む一覧への登録）は、取り消しに時間がかかるため、すべてのサブドメインが HTTPS に対応してから検討します。実際のヘッダーの値と Cookie の属性の確かめ方は <ChapterLink n={21} section="host-ssl-csp" /> で扱います。</p>
          <p>Rails 8.1 の rails new が作る本番の設定（config/environments/production.rb）では、Kamal を使う既定の構成で <code>config.assume_ssl</code> と <code>config.force_ssl</code> の行がコメントになっています。<code>--skip-kamal</code> を付けて作ると、両方が有効な行になります <Ref n={19} />。assume_ssl は TLS を終端したプロキシの後ろで、すべての要求を https として扱う設定です。ロードバランサーのヘルスチェックが http で /up を呼ぶ構成では、force_ssl のリダイレクトでヘルスチェックが失敗することがあり、ssl_options の除外の設定で避けます。この失敗の例は第6部の演習「<a href="#/linux/case36">デプロイが終わらず、新しいタスクが入れ替わり続ける</a>」で扱います。</p>
        </>
      ),
    },
    {
      id: "failure",
      title: "接続開始時のエラーと遅延を区別する",
      body: (
        <>
          <p>名前解決エラーは相手の IP アドレスを得られない段階で起きます。TCP の接続失敗は、名前から得たアドレスに到達できない、対象ポートに受付側がいない、または経路上で通信が許可されない場合などに起きます。証明書エラーを出したクライアントは、通常、TLS の相手と接続開始の情報をやり取りした後で検証に失敗しています。HTTP の 404 はその後、HTTP の応答として返ります。</p>
          <p>curl の <code>-w</code> で、1回の要求の時間を区間に分けて表示できます <Ref n={5} />。表示される値は要求の開始からの累積の秒数です。同じ URL に3回要求しました。</p>
          <Code lang="bash" title="区間ごとの時間（curl 8.14.1、www.example.com）" code={timingRun} />
          <p>1回目は名前解決に 43 ms かかり、2回目以降は 4〜6 ms でした。2回目からは Docker の DNS かホストのリゾルバーのキャッシュから答えが返ったと考えられます。TCP の接続（TCP の値から DNS の値を引いた差）は約 8〜10 ms、TLS のハンドシェイク（TLS の値から TCP の値を引いた差）は約 23〜31 ms でした。TLS 1.3 の1往復に加えて、証明書の検証などの処理が入るためと考えられます。curl はコマンドごとに新しい接続を作るので、3回とも TCP と TLS の時間がかかっています。</p>
          <p>同じ URL に1回目は時間がかかり2回目は短い場合、DNS の回答をキャッシュした結果、TCP や TLS の接続を再利用した結果、HTTP の応答をキャッシュから受け取った結果のいずれも考えられます。計測するなら、初回か既存接続か、DNS をどこから引いたか、Rails までリクエストが届いたかを記録します。「2回目」という回数だけで速くなった層を決めることはできません。</p>
          <Code lang="text" title="新しく接続する場合に区別する時間" code={"名前解決 → TCP 接続 → TLS ハンドシェイク → HTTP の送受信"} />
          <p>遅延を比べる時は、各区間の開始・終了を同じクライアントで計測すると比較しやすくなります。新規接続を含む結果と、既存接続でのアプリケーション応答時間を同じ分布として合算すると、原因の切り分けが難しくなります。実際の利用者への影響を評価するときは両方を含む分布も確認します。</p>
          <h3>接続先 IP を固定して証明書を検証する</h3>
          <p>Bash、OpenSSL、curl を使い、ローカルの 8443 番ポートで HTTPS を試します。サーバーが提示する自己署名証明書の DNS 名は <code>rails.test</code> です。<code>--resolve</code> で接続先を <code>127.0.0.1</code> に固定しても、curl は URL のホスト名と証明書の DNS 名を照合します。<Ref n={5} /><Ref n={6} /></p>
          <Code lang="bash" title="同じ接続先で信頼する証明書とホスト名を変える" code={tlsExample} />
          <div className="table-wrap">
            <table>
              <caption>OpenSSL 4.1.0 と curl 8.23.0 での実行結果（章の前半の実験の OpenSSL 3.5.7・curl 8.14.1 とは版が違う）</caption>
              <thead><tr><th>URL のホスト名</th><th>証明書を curl に渡す</th><th>HTTP / 終了コード</th><th>結果</th></tr></thead>
              <tbody>
                <tr><td><code>rails.test</code></td><td>渡す</td><td>200 / 0</td><td>証明書を信頼でき、名前も一致</td></tr>
                <tr><td><code>rails.test</code></td><td>渡さない</td><td>000 / 60</td><td>自己署名証明書を信頼できない</td></tr>
                <tr><td><code>other.test</code></td><td>渡す</td><td>000 / 60</td><td>URL の名前が証明書と一致しない</td></tr>
              </tbody>
            </table>
          </div>
          <p><code>000</code> は curl が HTTP の応答を受け取れなかった場合の表示です。二つの失敗は同じ終了コードですが、エラー文には信頼できない証明書とホスト名の不一致がそれぞれ示されます。切り替え予定のサーバーを事前に確かめる場合も、公開予定の名前を URL に残すと、その名前で証明書が有効かを調べられます。</p>
        </>
      ),
    },
    {
      id: "decisions",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>HTTPS が開かないときは、名前解決、TCP の接続、TLS の検証、HTTP の応答の順に、どこで止まっているかを、次の表のコマンドで段階ごとに確かめます。</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col">段階</th><th scope="col">使うコマンド</th><th scope="col">確かめる値</th></tr></thead>
              <tbody>
                <tr><th scope="row">名前解決</th><td><code>getent hosts</code>、<code>dig @フルリゾルバー</code>、<code>dig @権威サーバー</code></td><td>/etc/hosts の行、status、TTL、権威とキャッシュの違い</td></tr>
                <tr><th scope="row">TCP の接続</th><td><code>{"curl -w '%{time_connect}'"}</code>、<code>ss -tn</code></td><td>接続できるか、接続までの時間</td></tr>
                <tr><th scope="row">TLS の検証</th><td><code>openssl s_client -servername -verify_hostname</code></td><td>Verify return code、Certificate chain、notAfter</td></tr>
                <tr><th scope="row">HTTP</th><td><code>curl -v --resolve</code></td><td>ステータスコード、Location、Strict-Transport-Security</td></tr>
              </tbody>
            </table>
          </div>
          <p>TTL は、短いほど切り替えが早く反映される一方で、フルリゾルバーが権威サーバーに問い合わせる回数が増え、利用者の名前解決の時間も平均すると長くなります。普段は長めにしておき、切り替えの予定が決まったら旧 TTL の期間だけ前に短くする、という手順が一般的です。</p>
          <p>TLS をロードバランサーで終端すると、証明書の管理と更新を AWS などの機能に任せられ、Nginx や Puma の設定が単純になります。一方で、ロードバランサーから後ろの区間は、別に TLS を設定しない限り暗号化されません。組織の要件で内部の通信も暗号化する必要があるなら、ロードバランサーから Nginx への区間にも TLS を設定し、証明書の管理の手間が増えることを見込みます。</p>
          <p>HSTS は、一度ブラウザーが受け取ると、サーバーの設定を戻しても有効期間が切れるまで残ります。最初は短い max-age で始め、すべてのサブドメインが HTTPS で動くことを確かめてから延ばす方法もあります。force_ssl を有効にする前に、ヘルスチェックや、http で届く内部の要求がないかを確かめます。</p>
          <p>関連する章：TCP とソケットは <ChapterLink n={104} />、HSTS と Cookie の属性は <ChapterLink n={21} section="host-ssl-csp" />、Nginx の設定は <ChapterLink n={24} />、ロードバランサーと TLS の終端は <ChapterLink n={25} />、ブラウザーから Rails までの経路は <ChapterLink n={26} />、コンテナと AWS の構成は <ChapterLink n={107} /> で扱います。第6部の演習「<a href="#/linux/case31">外部連携が2つとも落ちている</a>」では、dig、/etc/hosts、openssl を使った切り分けを練習できます。</p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Domain Names - Concepts and Facilities",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc1034.html",
      accessed: "2026-11-27",
      version: "RFC 1034",
      note: "DNS の委任、キャッシュ、名前解決、CNAME とほかのデータを同じ名前に置けないこと",
    },
    {
      title: "The Transport Layer Security (TLS) Protocol Version 1.3",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc8446.html",
      accessed: "2026-11-27",
      version: "RFC 8446",
      note: "ハンドシェイクのメッセージと暗号化",
    },
    {
      title: "Service Identity in TLS",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc9525.html",
      accessed: "2026-11-27",
      version: "RFC 9525",
      note: "ホスト名と証明書の照合、CN ではなく SAN を使うこと",
    },
    {
      title: "Negative Caching of DNS Queries",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc2308.html",
      accessed: "2026-11-27",
      version: "RFC 2308",
      note: "存在しない名前などに対する応答のキャッシュと SOA の値",
    },
    {
      title: "curl man page",
      publisher: "curl",
      url: "https://curl.se/docs/manpage.html",
      accessed: "2026-11-27",
      version: "curl 8.23.0 と 8.14.1 で実行",
      note: "--resolve、--cacert、終了コード 60、-w の time_namelookup など",
    },
    {
      title: "openssl-s_server",
      publisher: "OpenSSL",
      url: "https://docs.openssl.org/master/man1/openssl-s_server/",
      accessed: "2026-11-27",
      version: "OpenSSL 4.1.0 で実行",
      note: "待ち受けアドレスの指定とローカルでの HTTPS 応答",
    },
    {
      title: "Domain Names - Implementation and Specification",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc1035.html",
      accessed: "2026-11-27",
      version: "RFC 1035",
      note: "A・CNAME・MX・TXT・NS・SOA、メッセージのフラグと応答コード",
    },
    {
      title: "DNS Extensions to Support IP Version 6",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc3596.html",
      accessed: "2026-11-27",
      version: "RFC 3596",
      note: "AAAA レコード",
    },
    {
      title: "dig - DNS lookup utility",
      publisher: "BIND 9 Documentation",
      url: "https://bind9.readthedocs.io/en/stable/manpages.html#dig-dns-lookup-utility",
      accessed: "2026-11-27",
      version: "dig 9.20.30 で実行",
      note: "+trace、+norecurse、+noall・+answer などの表示の指定",
    },
    {
      title: "resolv.conf(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/resolv.conf.5.html",
      accessed: "2026-11-27",
      version: "glibc",
      note: "スタブリゾルバーの問い合わせ先の設定",
    },
    {
      title: "nsswitch.conf(5)",
      publisher: "Linux man-pages",
      url: "https://man7.org/linux/man-pages/man5/nsswitch.conf.5.html",
      accessed: "2026-11-27",
      version: "glibc",
      note: "hosts の行で /etc/hosts と DNS を引く順",
    },
    {
      title: "openssl-s_client",
      publisher: "OpenSSL",
      url: "https://docs.openssl.org/3.5/man1/openssl-s_client/",
      accessed: "2026-11-27",
      version: "OpenSSL 3.5.7 で実行",
      note: "-servername、-noservername、-verify_hostname、-CAfile、-msg",
    },
    {
      title: "Internet X.509 Public Key Infrastructure Certificate and CRL Profile",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc5280.html",
      accessed: "2026-11-27",
      version: "RFC 5280",
      note: "証明書のパスの検証、basicConstraints と pathLenConstraint、SAN",
    },
    {
      title: "Transport Layer Security (TLS) Extensions: Extension Definitions",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc6066.html",
      accessed: "2026-11-27",
      version: "RFC 6066",
      note: "SNI（server_name 拡張）",
    },
    {
      title: "Configuring HTTPS servers",
      publisher: "nginx.org",
      url: "https://nginx.org/en/docs/http/configuring_https_servers.html",
      accessed: "2026-11-27",
      version: "nginx 1.30.6 で実行",
      note: "証明書のチェーンの並べ方、SNI による server の選択",
    },
    {
      title: "Choosing between alias and non-alias records",
      publisher: "Amazon Route 53 Developer Guide",
      url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html",
      accessed: "2026-11-27",
      version: "Amazon Route 53",
      note: "エイリアスレコードはゾーンの頂点に作れ、A や AAAA として答えること",
    },
    {
      title: "HTTP Strict Transport Security (HSTS)",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc6797.html",
      accessed: "2026-11-27",
      version: "RFC 6797",
      note: "Strict-Transport-Security ヘッダー、max-age と includeSubDomains",
    },
    {
      title: "actionpack/lib/action_dispatch/middleware/ssl.rb",
      publisher: "rails/rails（GitHub）",
      url: `${GH}/actionpack/lib/action_dispatch/middleware/ssl.rb`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "force_ssl のリダイレクト、HSTS の既定値（2年、サブドメインを含む）",
    },
    {
      title: "railties/lib/rails/generators/rails/app/templates/config/environments/production.rb.tt",
      publisher: "rails/rails（GitHub）",
      url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/production.rb.tt`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "assume_ssl と force_ssl の行（Kamal の有無で変わる）",
    },
    {
      title: "Sender Policy Framework (SPF)",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc7208.html",
      accessed: "2026-11-27",
      version: "RFC 7208",
      note: "TXT レコードの v=spf1 と -all",
    },
    {
      title: "Simple Mail Transfer Protocol",
      publisher: "RFC Editor",
      url: "https://www.rfc-editor.org/rfc/rfc5321.html",
      accessed: "2026-11-27",
      version: "RFC 5321",
      note: "MX の優先度の値が小さいサーバーから試すこと",
    },
  ],
}

export default chapter
