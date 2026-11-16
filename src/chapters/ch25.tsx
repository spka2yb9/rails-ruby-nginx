import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation25 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const AWS = 'https://docs.aws.amazon.com/elasticloadbalancing/latest/application'

/* ---------- 図 25-1 ヘッダーの受け渡し ---------- */
function HeadersFigure() {
  const hops = [
    { x: 20, t: 'ブラウザー', s: '203.0.113.7（例）' },
    { x: 215, t: 'ALB', s: 'TLS を終端' },
    { x: 410, t: 'Nginx', s: 'try_files・proxy_pass' },
    { x: 605, t: 'Puma・Rails', s: 'RemoteIp・SSL など' },
  ]
  return (
    <Svg
      id="25-1"
      w={780}
      h={300}
      label="ブラウザーは ALB に HTTPS で接続する。ALB は TLS を終端し、Nginx には HTTP で、X-Forwarded-For にブラウザーの IP を加え、X-Forwarded-Proto に https を入れて送る。Nginx は X-Forwarded-For に ALB の IP を加え、X-Forwarded-Proto は ALB の値をそのまま渡し、X-Request-Id に自分で作った ID を入れて Puma に送る。Rails は RemoteIp で X-Forwarded-For から信頼するプロキシの IP を除いてクライアントの IP を求め、X-Forwarded-Proto で https の要求と判断し、X-Request-Id をログの印に使う"
    >
      {hops.map((h, i) => (
        <g key={h.t}>
          <Box x={h.x} y={20} w={155} h={50} lines={[h.t, h.s]} fs={12} fill={i === 3 ? 'box5' : i === 0 ? 'bg' : 'box'} subTone="muted" />
          {i < hops.length - 1 && <Arrow x1={h.x + 155} y1={45} x2={hops[i + 1].x - 2} y2={45} />}
        </g>
      ))}
      <T x={192} y={88} anchor="middle" fs={10.5} tone="muted">
        HTTPS
      </T>
      <T x={387} y={88} anchor="middle" fs={10.5} tone="muted">
        HTTP
      </T>
      <T x={582} y={88} anchor="middle" fs={10.5} tone="muted">
        HTTP
      </T>
      <Box x={215} y={110} w={350} h={74} lines={['ALB → Nginx', 'X-Forwarded-For: 203.0.113.7', 'X-Forwarded-Proto: https　X-Amzn-Trace-Id: Root=1-…']} mono fs={10.5} fill="box4" align="start" />
      <Box x={410} y={196} w={350} h={74} lines={['Nginx → Puma', 'X-Forwarded-For: 203.0.113.7, 10.0.1.25（ALB）', 'X-Forwarded-Proto: https　X-Request-Id: 89e6d2…']} mono fs={10.5} fill="box4" align="start" />
      <T x={20} y={140} fs={11} tone="muted">
        X-Forwarded-Proto を $scheme で
      </T>
      <T x={20} y={158} fs={11} tone="muted">
        上書きすると http になる
      </T>
      <T x={20} y={288} fs={11} tone="muted">
        IP アドレスは説明のための例。デモでは Docker のネットワークの 172.29.0.0/16 のアドレスになった
      </T>
    </Svg>
  )
}

/* ---------- 図 25-2 タイムアウトの関係 ---------- */
function TimeoutFigure() {
  const x0 = 170
  const s = 7 // 1秒あたりの幅
  return (
    <Svg
      id="25-2"
      w={780}
      h={300}
      label="ALB のアイドルタイムアウトの既定値は60秒、Nginx の proxy_read_timeout の既定値も60秒で、Puma には要求の処理時間の上限が無い。デモでは、ロードバランサー役の Nginx のタイムアウトを5秒にして、8秒かかる要求を送った。ロードバランサーは5秒で 504 を返し、後段の Nginx のログには 499（クライアントが接続を閉じた）が残り、Rails は処理を続けて8秒後に 200 で完了とログに書いた"
    >
      <T x={20} y={20} bold>
        既定値（目安）
      </T>
      {[
        { t: 'ALB のアイドルタイムアウト', v: 60 },
        { t: 'Nginx proxy_read_timeout', v: 60 },
      ].map((r, i) => (
        <g key={r.t}>
          <T x={x0 - 8} y={46 + i * 28} anchor="end" fs={11}>
            {r.t}
          </T>
          <rect x={x0} y={36 + i * 28} width={r.v * s} height={18} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
          <T x={x0 + r.v * s + 6} y={46 + i * 28} fs={10.5} tone="muted">
            {`${r.v} 秒`}
          </T>
        </g>
      ))}
      <T x={x0 - 8} y={102} anchor="end" fs={11}>
        Puma
      </T>
      <T x={x0} y={102} fs={10.5} tone="muted">
        要求の処理時間の上限は無い（worker_timeout は別物）
      </T>
      <T x={20} y={146} bold>
        デモ：LB のタイムアウトを 5 秒にして 8 秒かかる要求を送る
      </T>
      {[0, 2, 4, 6, 8, 10].map((t) => (
        <g key={t}>
          <line x1={x0 + t * 40} y1={160} x2={x0 + t * 40} y2={262} stroke="var(--fig-line)" strokeDasharray="2 4" opacity={0.6} />
          <T x={x0 + t * 40} y={272} anchor="middle" fs={10} tone="muted">
            {`${t}s`}
          </T>
        </g>
      ))}
      <T x={x0 - 8} y={176} anchor="end" fs={11}>
        LB（応答 504）
      </T>
      <rect x={x0} y={166} width={5 * 40} height={18} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={x0 + 5 * 40 + 6} y={176} fs={10.5} tone="danger">
        5.006s で 504
      </T>
      <T x={x0 - 8} y={206} anchor="end" fs={11}>
        Nginx（ログ 499）
      </T>
      <rect x={x0} y={196} width={5 * 40} height={18} rx={3} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={x0 + 5 * 40 + 6} y={206} fs={10.5} tone="muted">
        LB が切断 → 499
      </T>
      <T x={x0 - 8} y={236} anchor="end" fs={11}>
        Rails（ログ 200）
      </T>
      <rect x={x0} y={226} width={8 * 40} height={18} rx={3} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={x0 + 8 * 40 + 6} y={236} fs={10.5} tone="muted">
        8001ms で Completed 200
      </T>
    </Svg>
  )
}

/* ---------- 図 25-3 502・504 の切り分け ---------- */
function TriageFigure() {
  return (
    <Svg
      id="25-3"
      w={780}
      h={430}
      label="502 か 504 かを受けたら、まずどの層が応答を作ったかを確かめる。ALB のアクセスログで target_status_code が - なら ALB が作った応答で、Nginx の応答なら Nginx のアクセスログに同じ要求がある。ALB が作った 502 は、ターゲットが接続を拒否・切断した場合で、Nginx の keep-alive がアイドルタイムアウトより短い場合も含む。ALB が作った 504 は、ターゲットへの接続が10秒以内にできないか、アイドルタイムアウトまで応答が無い場合。Nginx が作った 502 は、Puma への接続の失敗（connect() failed）か、処理中の切断（upstream prematurely closed connection）。Nginx が作った 504 は upstream timed out。Rails のログに同じ要求の Completed があれば、処理は最後まで続いている"
    >
      <Box x={250} y={14} w={280} h={40} lines="502 / 504 を受けた" fs={13} bold fill="box5" />
      <Arrow x1={390} y1={54} x2={390} y2={74} />
      <Box x={190} y={76} w={400} h={46} lines={['どの層が応答を作ったか', 'ALB の target_status_code・Nginx のアクセスログ']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={290} y1={122} x2={190} y2={152} />
      <Arrow x1={490} y1={122} x2={590} y2={152} />
      <T x={24} y={140} fs={10.5} tone="muted">
        ALB（target_status_code が -）
      </T>
      <T x={756} y={140} anchor="end" fs={10.5} tone="muted">
        Nginx（アクセスログにある）
      </T>
      <Box x={20} y={154} w={360} h={112} lines={['502：ターゲットが接続を拒否・切断した', '　・Nginx が止まっている', '　・keep-alive がアイドルタイムアウトより短い', '504：10 秒以内に接続できない（Nginx が無い）', '　 　またはアイドルタイムアウトまで応答が無い']} fs={11} fill="box" align="start" />
      <Box x={400} y={154} w={360} h={112} lines={['502：connect() failed（Puma が止まっている）', '502：upstream prematurely closed connection', '　 　（処理中にワーカーが落ちた）', '504：upstream timed out', '　 　（proxy_read_timeout まで応答が無い）']} fs={11} fill="box" align="start" />
      <Arrow x1={200} y1={266} x2={330} y2={300} />
      <Arrow x1={580} y1={266} x2={450} y2={300} />
      <Box x={190} y={302} w={400} h={46} lines={['X-Request-Id で Rails のログを探す', 'Started はあるか、Completed はあるか']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={390} y1={348} x2={390} y2={366} />
      <Box x={20} y={368} w={360} h={46} lines={['Started が無い：Puma まで届いていない', 'スレッドの空き待ち・Puma の停止・SSL のリダイレクト']} fs={11} fill="bg" subTone="muted" />
      <Box x={400} y={368} w={360} h={46} lines={['Completed が遅い：Rails の処理が遅い', '前段が切った後も処理は続いている']} fs={11} fill="bg" subTone="muted" />
    </Svg>
  )
}

const ch25: Chapter = {
  number: 25,
  part: 5,
  title: 'ロードバランサー配下の構成と障害の切り分け',
  summary:
    'ALB の後ろに Nginx と Puma を置く構成で、TLS の終端、クライアントの IP、X-Forwarded-Proto と force_ssl、ヘルスチェック、各層のタイムアウトがどう関係するかを、ロードバランサー役の Nginx を前に置いて再現します。502 と 504 の原因の切り分け方と、X-Request-Id でログを突き合わせる方法も扱います。',
  goals: [
    'TLS を終端するロードバランサーの後ろで、X-Forwarded-Proto を正しく渡さないと force_ssl がリダイレクトを繰り返す理由を説明できる',
    'X-Forwarded-For と RemoteIp・trusted_proxies、Nginx の real_ip でクライアントの IP を求める仕組みを説明できる',
    '/up のヘルスチェックが force_ssl のリダイレクトで失敗する場合と、その対処を説明できる',
    'ALB・Nginx・Puma のタイムアウトの関係と、前段が切っても Rails の処理が続くことを説明できる',
    '502 と 504 を、どの層が応答を作ったかから切り分けられる',
    'X-Request-Id で Nginx と Rails のログを突き合わせられる',
  ],
  prerequisites: [6, 21, 23, 24],
  sections: [
    {
      id: 'composition',
      title: '構成とヘッダーの受け渡し',
      body: (
        <>
          <p>
            業務の構成は、ALB（Application Load Balancer）が HTTPS を受けて TLS を終端し（<Term en="TLS termination">TLS の終端</Term>：暗号化を解いて HTTP にすること）、EC2 などの Nginx に HTTP で転送し、Nginx が Puma に転送する形です。ALB はローカルで動かせないので、この章では Nginx 1.30.6
            をもう1つ起動して ALB の代わりにしました。自己署名の証明書で HTTPS を受け、ALB と同じように X-Forwarded-For・X-Forwarded-Proto・X-Forwarded-Port を付けて、
            <ChapterLink n={24} />
            の Nginx に転送します。タイムアウトは、確かめやすいように5秒にしています。
          </p>
          <Code
            lang="nginx"
            title="lb.conf（ロードバランサー役の Nginx、デモ）"
            code={`
server {
    listen 443 ssl;
    ssl_certificate     /lb/cert.pem;
    ssl_certificate_key /lb/key.pem;

    location / {
        proxy_pass http://rbdemo-nginx:80;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Port 443;
        proxy_set_header X-Amzn-Trace-Id "Root=1-$request_id";   # ALB の追跡用ヘッダーの代わり
        proxy_read_timeout 5s;   # ALB のアイドルタイムアウト（既定 60 秒）の代わりに短くした
        add_header X-Served-By lb always;
    }
}
`}
          />
          <p>
            ALB の説明書によると、ALB は X-Forwarded-For が無ければクライアントの IP で作り、あれば末尾に追加します（既定の append モード）。X-Forwarded-Proto には、クライアントが ALB
            に接続したプロトコル（http か https）を入れます
            <Ref n={1} />。どのヘッダーが Rails のどこで使われるかは図 25-1 のとおりです。後段の Nginx の設定は、Host を <code>$http_host</code> にし、<code>X-Request-Id $request_id</code>{' '}
            を加えた以外は前章と同じです。
          </p>
          <Figure n="25-1" title="ヘッダーの受け渡し" caption="ALB の説明書（X-Forwarded headers）と、デモの3段の構成での実測をもとにした模式図。">
            <HeadersFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'tls-proto',
      title: 'TLS の終端と force_ssl のリダイレクトの繰り返し',
      body: (
        <>
          <p>
            Rails を <code>force_ssl = true</code>、<code>assume_ssl = false</code> にして、後段の Nginx を前章の設定のまま（<code>X-Forwarded-Proto $scheme</code>）にすると、次のようになりました。
          </p>
          <Code
            lang="text"
            code={`
$ curl -sk -L --max-redirs 4 https://127.0.0.1:8443/articles/1
最終: 301 リダイレクト 4 回 https://127.0.0.1:8443/articles/1

HTTP/1.1 301 Moved Permanently
location: https://127.0.0.1:8443/articles/1      ← 同じ URL へのリダイレクト
X-Served-By: app-nginx
X-Served-By: lb

Rails のログに出た /articles/1 の行: 0
`}
          />
          <p>
            ブラウザーは HTTPS で接続していますが、後段の Nginx は ALB から HTTP で受けているので、<code>$scheme</code> は http です。Nginx は ALB が付けた{' '}
            <code>X-Forwarded-Proto: https</code> を http で上書きし、Rails は http の要求と判断して https の同じ URL にリダイレクトします。ブラウザーではリダイレクトが繰り返されてエラーになります。
          </p>
          <p>
            Rails のログに1行も出ていないことにも注意します。リダイレクトする ActionDispatch::SSL は、ログを書く Rails::Rack::Logger より前のミドルウェアです（<ChapterLink n={6} section="rails-stack" />
            ）。ログに何も無いのにリダイレクトされるときは、ミドルウェアの段階で返された応答を疑います。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/ssl.rb（88〜98行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/ssl.rb#L88-L98`}
            code={`
    def call(env)
      request = Request.new env

      if request.ssl?
        @app.call(env).tap do |status, headers, body|
          set_hsts_header! headers
          flag_cookies_as_secure! headers if @secure_cookies && !@exclude.call(request)
        end
      else
        return redirect_to_https request unless @exclude.call(request)
        @app.call(env)
`}
          />
          <p>対処は2通りあります。</p>
          <ul>
            <li>
              後段の Nginx で <code>proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;</code> とし、ALB の値をそのまま渡す。デモではこれで 200 になり、Rails の{' '}
              <code>request.ssl?</code> が true、<code>request.url</code> が https://… になった
            </li>
            <li>
              Rails で <code>config.assume_ssl = true</code> にする。ActionDispatch::AssumeSSL が、すべての要求を https として扱う
            </li>
          </ul>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/assume_ssl.rb（コメントを除く）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/assume_ssl.rb`}
            code={`
  class AssumeSSL
    def initialize(app)
      @app = app
    end

    def call(env)
      env["HTTPS"] = "on"
      env["HTTP_X_FORWARDED_PORT"] = "443"
      env["HTTP_X_FORWARDED_PROTO"] = "https"
      env["rack.url_scheme"] = "https"
      @app.call(env)
    end
  end
`}
          />
          <p>
            新規のアプリケーションの本番環境の設定ファイルには、両方（<code>assume_ssl</code> と <code>force_ssl</code>）が true で入っています。assume_ssl は、ALB を通らずに届いた要求も https
            とみなすので、Puma や Nginx に外から直接届かないネットワークの構成であることが前提です。X-Forwarded-Proto がずれると、<ChapterLink n={21} section="csrf" />
            の Origin の検査でも、正しいトークンの POST が 422 になります。
          </p>
        </>
      ),
    },
    {
      id: 'client-ip',
      title: 'クライアントの IP',
      body: (
        <>
          <p>X-Forwarded-Proto を直した設定で、Rails が受け取ったヘッダーと <code>request.remote_ip</code> を表示しました。</p>
          <Code
            lang="text"
            code={`
HTTP_X_FORWARDED_FOR="172.29.0.1, 172.29.0.6"     ← ブラウザー（Docker のホスト）、ロードバランサー
HTTP_X_FORWARDED_PROTO="https"
request.remote_ip=172.29.0.1 request.ssl?=true request.url=https://127.0.0.1:8443/lab/headers

（クライアントが X-Forwarded-For: 1.2.3.4 を付けて送った場合）
HTTP_X_FORWARDED_FOR="1.2.3.4, 172.29.0.1, 172.29.0.6"
request.remote_ip=1.2.3.4                          ← 偽の値が採用された
`}
          />
          <p>
            ActionDispatch::RemoteIp は、X-Forwarded-For を右（自分に近い側）から見て、信頼するプロキシの IP を取り除き、最初に残った IP をクライアントの IP とします。既定で信頼するのは、プライベートな IP
            アドレスの範囲です
            <Ref n={2} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/remote_ip.rb（40〜49行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/remote_ip.rb#L40-L49`}
            code={`
    TRUSTED_PROXIES = [
      "127.0.0.0/8",    # localhost IPv4 range, per RFC-3330
      "::1",            # localhost IPv6
      "fc00::/7",       # private IPv6 range fc00::/7
      "10.0.0.0/8",     # private IPv4 range 10.x.x.x
      "172.16.0.0/12",  # private IPv4 range 172.16.0.0 .. 172.31.255.255
      "192.168.0.0/16", # private IPv4 range 192.168.x.x
      "169.254.0.0/16", # link-local IPv4 range 169.254.x.x
      "fe80::/10",      # link-local IPv6 range fe80::/10
    ].map { |proxy| IPAddr.new(proxy) }
`}
          />
          <p>
            デモでは、本物のクライアント（172.29.0.1）もプライベートな IP なので、プロキシとして取り除かれ、その左の偽の値 1.2.3.4 が残りました。インターネットからの要求ではクライアントの IP
            はグローバルなアドレスなので、そこで止まり、偽の値は使われません。ただし、社内のネットワークや VPN のようにプライベートな IP から来る利用者は、自分で付けた X-Forwarded-For で IP を偽れます。IP
            でアクセスを制限する機能があるなら、<code>config.action_dispatch.trusted_proxies</code> を実際のロードバランサーと Nginx の範囲だけにします。デモで2台の IP だけを指定すると、偽の値は使われなくなりました。
          </p>
          <Code
            lang="text"
            code={`
（trusted_proxies = [ロードバランサー 172.29.0.6, Nginx 172.29.0.5]）
HTTP_X_FORWARDED_FOR="1.2.3.4, 172.29.0.1, 172.29.0.6"
request.remote_ip=172.29.0.1
`}
          />
          <p>
            Nginx のアクセスログの <code>$remote_addr</code> は、直前の接続の相手（ロードバランサー）の IP です。Nginx の realip モジュールを使うと、信頼するアドレスから来た要求について、X-Forwarded-For
            からクライアントの IP を復元して $remote_addr に入れます
            <Ref n={3} />。
          </p>
          <Code
            lang="text"
            code={`
（realip なし）172.29.0.6 xff="172.29.0.1" "GET /lab/headers HTTP/1.1" 200 …

set_real_ip_from 172.29.0.6;
real_ip_header X-Forwarded-For;
real_ip_recursive on;

（realip あり）172.29.0.1 xff="1.2.3.4, 172.29.0.1" "GET /lab/headers HTTP/1.1" 200 …
`}
          />
          <p>
            realip を使うと、<code>$proxy_add_x_forwarded_for</code> が加える IP も復元した値になります。デモでは Rails に届く X-Forwarded-For の末尾がロードバランサーではなくクライアントの IP（
            <code>"1.2.3.4, 172.29.0.1, 172.29.0.1"</code>）になりました。Rails の remote_ip の結果は変わりませんが、ログを読むときに混乱しないよう、どちらで IP を復元するかを決めておきます。
          </p>
        </>
      ),
    },
    {
      id: 'health',
      title: 'ヘルスチェック（/up）',
      body: (
        <>
          <p>
            ALB は登録したターゲットに定期的に要求を送り、応答のコードで正常かどうかを判断します。説明書によると、既定の間隔は30秒、タイムアウトは5秒、正常とみなすのは連続5回の成功、異常とみなすのは連続2回の失敗で、正常とみなすコードは
            200 です
            <Ref n={4} />。Rails 7.1 以降の新規のアプリケーションには、<code>/up</code> のルートと Rails::HealthController があります。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/health_controller.rb（コメントを除く、抜粋）"
            href={`${GH}/railties/lib/rails/health_controller.rb`}
            code={`
  class HealthController < ActionController::Base
    rescue_from(Exception) { render_down }

    def show
      render_up
    end
    # render_up は緑、render_down は赤の HTML（または JSON）を返し、render_down は 500
`}
          />
          <p>
            <code>show</code> は何も確かめずに 200 を返します。アプリケーションが起動して要求を処理できることはわかりますが、DB に接続できるかは確かめません。DB
            なども確かめたい場合は、独自のアクションを作るかを決めます。
          </p>
          <p>ヘルスチェックは、ALB からターゲット（Nginx）に HTTP で直接送られ、X-Forwarded-Proto は付きません。force_ssl だけを有効にした状態で、同じように送りました。</p>
          <Code
            lang="text"
            code={`
（force_ssl=true、assume_ssl=false）
$ curl -D - http://127.0.0.1:8080/up
HTTP/1.1 301 Moved Permanently
location: https://127.0.0.1:8080/up        ← 200 でないので、ALB は異常と判断する

（force_ssl=true、assume_ssl=true）
ヘルスチェック（http で直接）: 200
`}
          />
          <p>
            301 が返るので、ALB はターゲットを異常と判断します。説明書によると、異常なターゲットには要求が送られなくなりますが、ターゲットグループのすべてが異常になった場合は、ALB は正常・異常の判定にかかわらずすべてのターゲットに要求を送ります（fail open）
            <Ref n={4} />。いずれにしても、デプロイのときの入れ替えなどで、ヘルスチェックの結果が判断に使えなくなります。assume_ssl を有効にするか、production.rb のコメントにある{' '}
            <code>config.ssl_options = &#123; redirect: &#123; exclude: -&gt;(request) &#123; request.path == "/up" &#125; &#125; &#125;</code> で /up をリダイレクトの対象から外します。
          </p>
          <p>
            <ChapterLink n={21} section="host-ssl-csp" />
            のとおり本番環境で <code>config.hosts</code> を設定する場合も注意します。ALB のヘルスチェックの Host にはターゲットの IP アドレスが入るので、/up が HostAuthorization で 403 になります。production.rb
            のコメントにある <code>config.host_authorization = &#123; exclude: -&gt;(request) &#123; request.path == "/up" &#125; &#125;</code> で /up を検査の対象から外します。
          </p>
          <p>
            また、新規のアプリケーションの本番環境には <code>config.silence_healthcheck_path = "/up"</code> があり、Rails::Rack::SilenceRequest が /up のログを出しません。デモでも、/up
            の要求のログは1行もありませんでした。30秒ごとの要求でログが埋まらないための設定ですが、ヘルスチェックの失敗を調べるときは、Rails のログではなく Nginx のアクセスログを見ます。
          </p>
        </>
      ),
    },
    {
      id: 'timeouts',
      title: 'タイムアウトの関係',
      body: (
        <>
          <p>
            ALB のアイドルタイムアウトの既定値は60秒で、その間データの送受信が無いと接続を閉じます
            <Ref n={5} />。Nginx の proxy_read_timeout の既定値も60秒です（<ChapterLink n={24} section="websocket" />
            ）。Puma には要求の処理時間の上限がありません（<ChapterLink n={23} section="restart-timeout" />
            ）。ロードバランサー役のタイムアウトを5秒にして、8秒かかる要求を送りました。
          </p>
          <Code
            lang="text"
            code={`
$ curl -sk -D - "https://127.0.0.1:8443/lab/slow?s=8"
HTTP/1.1 504 Gateway Time-out  Server: nginx/1.30.6  X-Served-By: lb   経過 5.01s

（ロードバランサー役の error.log）
upstream timed out (110: Connection timed out) while reading response header from upstream, … upstream: "http://172.29.0.5:80/…"
（ロードバランサー役の access.log）
172.29.0.1 "GET /lab/slow?s=8 HTTP/1.1" 504 lb_time=5.006 upstream=172.29.0.5:80 upstream_status=504
（後段の Nginx の access.log）
172.29.0.6 xff="172.29.0.1" "GET /lab/slow?s=8 HTTP/1.1" 499 request_id=b07c47fe380d1468dd0ec1a4fa4bb9c6 rt=5.005 urt=5.005
（Rails のログ）
[b07c47fe380d1468dd0ec1a4fa4bb9c6] Started GET "/lab/slow?s=8" for 172.29.0.1 at 2026-11-11 11:04:06 +0000
[b07c47fe380d1468dd0ec1a4fa4bb9c6] Completed 200 OK in 8001ms
`}
          />
          <p>
            ブラウザーは5秒で 504 を受け取りましたが、Rails は処理を続けて8秒後に 200 と記録しました。後段の Nginx の 499 は、応答を返す前にクライアント（ここではロードバランサー）が接続を閉じたときに Nginx
            がログに記録するコードで、HTTP の標準のコードではありません。Rails のログだけを見ると成功に見えるので、利用者が見たエラーとログが食い違います（図 25-2）。前段がタイムアウトしても、DB の更新などは最後まで実行されるので、利用者が再送すると二重に実行されることもあります。
          </p>
          <p>
            keep-alive の接続を閉じるタイミングにも順序があります。ALB の説明書は、アプリケーション側のアイドルタイムアウトを ALB のものより長くするよう勧めています。アプリケーションが先に接続を閉じると、ALB
            がそれに気づく前に要求を送り、502 になることがあるからです
            <Ref n={5} />。ALB の次が Nginx なら Nginx の <code>keepalive_timeout</code>（公式イメージの設定では65秒）、Nginx を置かずに Puma なら <code>persistent_timeout</code>（既定 65 秒）が、ALB の60秒より長くなっています。ALB
            のアイドルタイムアウトを延ばすときは、これらも合わせて延ばします。
          </p>
          <Figure n="25-2" title="タイムアウトの関係" caption="既定値は ALB と Nginx の説明書による。下段はデモ（ロードバランサー役のタイムアウトを5秒にした）での実測。">
            <TimeoutFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'triage',
      title: '502 と 504 の切り分け',
      body: (
        <>
          <p>デモで、各層を止めたり遅くしたりして、どの層が何を返すかを記録しました。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>状況</th>
                  <th>ブラウザーが受けた応答</th>
                  <th>応答を作った層のログ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Puma が止まっている</td>
                  <td>502（X-Served-By: app-nginx）</td>
                  <td>
                    Nginx：<code>connect() failed (113: No route to host) while connecting to upstream</code>
                  </td>
                </tr>
                <tr>
                  <td>処理中にワーカーのプロセスが落ちた（kill -9）</td>
                  <td>502（app-nginx）</td>
                  <td>
                    Nginx：<code>upstream prematurely closed connection while reading response header from upstream</code>。Puma のマスターはワーカーを作り直した
                  </td>
                </tr>
                <tr>
                  <td>後段の Nginx の proxy_read_timeout を超えた（この行だけ 3 秒に変更）</td>
                  <td>504（app-nginx）</td>
                  <td>
                    Nginx：<code>upstream timed out (110: Connection timed out) while reading response header from upstream</code>
                  </td>
                </tr>
                <tr>
                  <td>ロードバランサーのタイムアウト（5秒）を超えた</td>
                  <td>504（lb のみ）</td>
                  <td>ロードバランサー：upstream timed out。後段の Nginx には 499、Rails には 200</td>
                </tr>
                <tr>
                  <td>後段の Nginx が止まっている</td>
                  <td>504（lb のみ）</td>
                  <td>
                    ロードバランサー：<code>upstream timed out (110: Connection timed out) while connecting to upstream</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモのロードバランサー役は Nginx なので、Puma が止まっている場合の「接続できない」は 502、接続の待ちのタイムアウトは 504 になりました。ALB の説明書は、502 と 504 の原因を次のように挙げています
            <Ref n={6} />。
          </p>
          <ul>
            <li>502：ターゲットへの接続の試みに TCP の RST が返った、要求の処理中にターゲットが接続を閉じた（keep-alive の時間がアイドルタイムアウトより短い場合を含む）、応答が不正、応答ヘッダーが 32KB を超えた、など</li>
            <li>504：接続のタイムアウト（10秒）までにターゲットに接続できない、接続できたがアイドルタイムアウトまでに応答が無い、Content-Length が実際の本文より大きい、など</li>
          </ul>
          <p>
            切り分けでは、まずどの層が応答を作ったかを確かめます（図 25-3）。ALB のアクセスログでは、<code>target_status_code</code> はターゲットが応答を返した場合だけ記録され、そうでなければ{' '}
            <code>-</code> になります。<code>target_processing_time</code> が -1 なら、ALB は要求をターゲットに送れなかったか、アイドルタイムアウトまで応答が無かったことを表します
            <Ref n={7} />。ターゲットが応答を返していれば、Nginx のアクセスログと error.log で、Nginx が作った応答か Puma の応答かを確かめます。最後に、Rails のログで同じ要求の Started と Completed を探します。
          </p>
          <Figure n="25-3" title="502・504 の切り分け" caption="ALB の説明書（Troubleshoot・Access logs）と、デモで各層を止めたり遅くしたりした結果をもとにまとめた手順。">
            <TriageFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'request-id',
      title: 'X-Request-Id でログを突き合わせる',
      body: (
        <>
          <p>
            各層のログを同じ要求で突き合わせるには、要求ごとの ID を各層で記録します。デモの後段の Nginx は、<code>$request_id</code>（Nginx が要求ごとに作る16バイトの乱数の16進表記<Ref n={10} />）を X-Request-Id
            ヘッダーで Puma に渡し、自分のアクセスログにも書きました。Rails の ActionDispatch::RequestId は、受け取った X-Request-Id を、記号を除いて255文字までに切り詰めてから要求の ID
            として使います
            <Ref n={8} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/request_id.rb（31〜44行目から抜粋）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb#L31-L44`}
            code={`
    def call(env)
      req = ActionDispatch::Request.new env
      req.request_id = make_request_id(req.get_header(@env_header))
      @app.call(env).tap { |_status, headers, _body| headers[@header] = req.request_id }
    end

    private
      def make_request_id(request_id)
        if request_id.presence
          request_id.gsub(/[^\\w\\-@]/, "").first(255)
        else
          internal_request_id
        end
      end
`}
          />
          <p>
            本番環境の設定ファイルの <code>config.log_tags = [ :request_id ]</code> により、Rails のログの各行の先頭にこの ID が付きます。前節の 504 の例では、Nginx のアクセスログの{' '}
            <code>request_id=b07c47fe380d1468dd0ec1a4fa4bb9c6</code> と、Rails のログの <code>[b07c47fe380d1468dd0ec1a4fa4bb9c6]</code> が一致しました。応答の X-Request-Id
            ヘッダーにも同じ値が返るので、利用者から受け取ったエラー画面の情報からも辿れます。
          </p>
          <p>
            ALB は、要求に <code>X-Amzn-Trace-Id</code> ヘッダーを付け、アクセスログにも記録します
            <Ref n={9} />。Nginx の log_format に <code>$http_x_amzn_trace_id</code> を加えれば、ALB のアクセスログとも突き合わせられます。
          </p>
          <Callout kind="v72">
            <p>
              RemoteIp・SSL・AssumeSSL・RequestId・/up の HealthController は Rails 7.2.4 にもあります（AssumeSSL と /up は 7.1 から）。<code>silence_healthcheck_path</code>{' '}
              による /up のログの抑制は 8.0 から（railties の 8.0.0 の CHANGELOG）なので、7.2 のアプリケーションでは /up の要求も Rails のログに出ます。
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
          <li>ALB が TLS を終端する構成では、後段の Nginx が X-Forwarded-Proto を $scheme で上書きすると、force_ssl が同じ URL へのリダイレクトを繰り返します。このリダイレクトは Rails のログに出ません。</li>
          <li>ALB の値をそのまま渡すか、assume_ssl を有効にします。assume_ssl は、外から直接届かない構成が前提です。</li>
          <li>RemoteIp は X-Forwarded-For から信頼するプロキシ（既定ではプライベートな IP）を除いてクライアントの IP を求めます。プライベートな IP から来る利用者はクライアントの IP を偽れるので、必要なら trusted_proxies を絞ります。</li>
          <li>/up は何も確かめずに 200 を返します。force_ssl のリダイレクトでヘルスチェックが失敗しないよう、assume_ssl か ssl_options の exclude を使います。</li>
          <li>ALB と Nginx の既定のタイムアウトは60秒で、Puma には上限がありません。前段が 504 を返しても Rails の処理は続き、ログには 200 が残ります。</li>
          <li>502・504 は、ALB の target_status_code、Nginx のアクセスログと error.log、Rails のログの順に、どの層が応答を作ったかを確かめて切り分けます。</li>
          <li>Nginx の $request_id を X-Request-Id で渡すと、Nginx と Rails のログを同じ ID で突き合わせられます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'HTTP headers and Application Load Balancers（X-Forwarded headers）', publisher: 'AWS Documentation', url: `${AWS}/x-forwarded-headers.html`, accessed: '2026-11-11', version: '—', note: 'X-Forwarded-For の append・preserve・remove（既定は append）と、X-Forwarded-Proto・X-Forwarded-Port。' },
    { title: 'actionpack/lib/action_dispatch/middleware/remote_ip.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/remote_ip.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'TRUSTED_PROXIES（プライベートな IP の範囲）、calculate_ip、trusted_proxies の指定。' },
    { title: 'Module ngx_http_realip_module', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_realip_module.html', accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'set_real_ip_from・real_ip_header・real_ip_recursive。' },
    { title: 'Health checks for Application Load Balancer target groups', publisher: 'AWS Documentation', url: `${AWS}/target-group-health-checks.html`, accessed: '2026-11-11', version: '—', note: 'ヘルスチェックの既定値（間隔30秒、タイムアウト5秒、正常5回、異常2回、成功のコード200）。' },
    { title: 'Edit attributes for your Application Load Balancer（Connection idle timeout）', publisher: 'AWS Documentation', url: `${AWS}/edit-load-balancer-attributes.html`, accessed: '2026-11-11', version: '—', note: 'アイドルタイムアウトの既定値60秒と、アプリケーションのアイドルタイムアウトをそれより長くする理由（502）。' },
    { title: 'Troubleshoot your Application Load Balancers', publisher: 'AWS Documentation', url: `${AWS}/load-balancer-troubleshooting.html`, accessed: '2026-11-11', version: '—', note: 'HTTP 502・503・504 の原因の一覧（接続のタイムアウト10秒を含む）。' },
    { title: 'Access logs for your Application Load Balancer', publisher: 'AWS Documentation', url: `${AWS}/load-balancer-access-logs.html`, accessed: '2026-11-11', version: '—', note: 'target_status_code が - になる条件、target_processing_time が -1 になる条件。' },
    { title: 'actionpack/lib/action_dispatch/middleware/request_id.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/request_id.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '受け取った X-Request-Id の使い方（記号を除いて255文字まで）と、応答への付与。' },
    { title: 'Request tracing for your Application Load Balancer', publisher: 'AWS Documentation', url: `${AWS}/load-balancer-request-tracing.html`, accessed: '2026-11-11', version: '—', note: 'X-Amzn-Trace-Id の追加とアクセスログへの記録。' },
    { title: 'Module ngx_http_core_module（Embedded Variables）', publisher: 'nginx.org', url: 'https://nginx.org/en/docs/http/ngx_http_core_module.html#var_request_id', accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: '$request_id が16バイトの乱数の16進表記であること。' },
  ],
}

export default withExplanations(ch25, explanation25)
