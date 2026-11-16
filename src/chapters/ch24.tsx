import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation24 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const NG = 'https://nginx.org/en/docs'

/* ---------- 図 24-1 nginx.conf の階層 ---------- */
function HierarchyFigure() {
  return (
    <Svg
      id="24-1"
      w={780}
      h={330}
      label="nginx.conf の一番外側（main）には worker_processes などのプロセスの設定があり、events ブロックに worker_connections がある。http ブロックには MIME タイプやログの設定があり、conf.d の設定ファイルを include する。その中の upstream ブロックが Puma のアドレスを、server ブロックが待ち受けるポートと root を決める。server の中の location ブロックが URI ごとの処理を決める。下の階層は上の階層の設定を引き継ぐが、proxy_set_header や add_header は、下の階層で1つでも書くと上の階層の値を引き継がない"
    >
      <rect x={20} y={14} width={740} height={300} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={32} bold mono fs={12}>
        main（nginx.conf の一番外側）
      </T>
      <T x={320} y={32} fs={11} tone="muted" mono>
        worker_processes auto; error_log …; pid …;
      </T>
      <Box x={32} y={44} w={300} h={30} lines="events { worker_connections 1024; }" mono fs={11} fill="box" align="start" />
      <rect x={32} y={84} width={716} height={220} rx={8} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={44} y={102} bold mono fs={12}>
        http
      </T>
      <T x={100} y={102} fs={11} tone="muted" mono>
        include mime.types; access_log …; keepalive_timeout 65; include conf.d/*.conf;
      </T>
      <Box x={44} y={116} w={210} h={56} lines={['upstream app', 'server rbdemo-puma:3000;']} mono fs={11} fill="box4" subTone="muted" />
      <rect x={270} y={116} width={466} height={176} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={282} y={134} bold mono fs={12}>
        server
      </T>
      <T x={346} y={134} fs={11} tone="muted" mono>
        listen 80; server_name _; root /app/public;
      </T>
      <Box x={282} y={148} w={140} h={40} lines={['location /assets/', '直接返す']} mono fs={10.5} fill="box2" subTone="muted" />
      <Box x={432} y={148} w={140} h={40} lines={['location /cable', 'WebSocket']} mono fs={10.5} fill="box2" subTone="muted" />
      <Box x={582} y={148} w={140} h={40} lines={['location /', 'try_files']} mono fs={10.5} fill="box2" subTone="muted" />
      <Box x={582} y={198} w={140} h={40} lines={['location @app', 'proxy_pass']} mono fs={10.5} fill="box2" subTone="muted" />
      <Arrow x1={652} y1={188} x2={652} y2={196} />
      <Arrow d="M582,218 L260,218 L260,160 L256,160" dashed />
      <T x={282} y={258} fs={11} tone="muted">
        下の階層は上の設定を引き継ぐ。ただし proxy_set_header・add_header は、
      </T>
      <T x={282} y={276} fs={11} tone="muted">
        その階層に1つでも書くと、上の階層の値を引き継がない
      </T>
    </Svg>
  )
}

/* ---------- 図 24-2 要求の振り分け ---------- */
function RoutingFigure() {
  const rows = [
    { u: '/assets/application-8b441ae0.css', l: 'location /assets/', r: 'public/assets から返す（200、1年キャッシュ）', fill: 'box4' as const },
    { u: '/assets/nothing.css', l: 'location /assets/', r: 'ファイルが無い → 404（Rails には渡さない）', fill: 'bg' as const },
    { u: '/robots.txt', l: 'location / → try_files', r: 'public/robots.txt があるので返す', fill: 'box4' as const },
    { u: '/articles/1', l: 'location / → @app', r: 'ファイルが無いので Puma へ', fill: 'box5' as const },
    { u: '/cable', l: 'location /cable', r: 'Upgrade を付けて Puma へ（WebSocket）', fill: 'box5' as const },
  ]
  return (
    <Svg
      id="24-2"
      w={780}
      h={rows.length * 46 + 40}
      label="デモの設定で、要求の URI ごとに選ばれた location と処理を並べた。/assets/ で始まる要求は location /assets/ が選ばれ、ファイルがあれば Nginx が返し、無ければ 404 を返して Rails には渡さない。/robots.txt は location / の try_files で public のファイルが見つかり、Nginx が返す。/articles/1 はファイルが無いので名前付きの location @app に移り、Puma に渡される。/cable は location /cable が選ばれ、Upgrade ヘッダーを付けて Puma に渡される"
    >
      <T x={20} y={18} bold fs={12}>
        要求の URI
      </T>
      <T x={300} y={18} bold fs={12}>
        選ばれた location
      </T>
      <T x={500} y={18} bold fs={12}>
        処理
      </T>
      {rows.map((r, i) => {
        const y = 30 + i * 46
        return (
          <g key={r.u}>
            <Box x={20} y={y} w={262} h={36} lines={r.u} mono fs={11} fill="bg" align="start" />
            <Arrow x1={282} y1={y + 18} x2={296} y2={y + 18} />
            <Box x={298} y={y} w={190} h={36} lines={r.l} mono fs={11} fill="box2" />
            <Arrow x1={488} y1={y + 18} x2={498} y2={y + 18} />
            <Box x={500} y={y} w={262} h={36} lines={r.r} fs={10.5} fill={r.fill} />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 24-3 バッファリングの有無 ---------- */
function BufferFigure() {
  return (
    <Svg
      id="24-3"
      w={780}
      h={290}
      label="proxy_buffering が on なら、Nginx は Puma から応答をできるだけ速く受け取り、メモリーや一時ファイルに保存してから、遅いクライアントにゆっくり送る。Puma のスレッドはすぐに次の要求を処理できる。off なら、Nginx は受け取った分をそのままクライアントに送るので、クライアントが遅いと Puma のスレッドは応答を書き終わるまでふさがる。デモでは、3つのスレッドがすべてふさがり、別の要求が空きを 8.6 秒待った"
    >
      <T x={20} y={20} bold>
        proxy_buffering on（既定）
      </T>
      <Box x={20} y={34} w={150} h={44} lines={['Puma のスレッド', 'すぐに空く']} fs={11.5} fill="box5" subTone="muted" />
      <Arrow x1={170} y1={56} x2={278} y2={56} accent />
      <T x={224} y={46} anchor="middle" fs={10.5} tone="acc">
        速く送る
      </T>
      <Box x={280} y={30} w={230} h={52} lines={['Nginx', 'メモリーと一時ファイルに保存']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={510} y1={56} x2={608} y2={56} dashed />
      <T x={559} y={46} anchor="middle" fs={10.5} tone="muted">
        ゆっくり
      </T>
      <Box x={610} y={34} w={150} h={44} lines={['遅いクライアント', '200KB/s']} fs={11.5} fill="bg" subTone="muted" />
      <T x={20} y={104} fs={11} tone="muted" mono>
        6秒後: busy_threads=0 / 別の要求 /lab/info 200 0.002s（3秒後に送った要求も 0.003s）
      </T>
      <T x={20} y={150} bold>
        proxy_buffering off
      </T>
      <Box x={20} y={164} w={150} h={44} lines={['Puma のスレッド', '書き終わるまで占有']} fs={11.5} fill="box5" subTone="danger" />
      <Arrow x1={170} y1={186} x2={278} y2={186} dashed />
      <Box x={280} y={160} w={230} h={52} lines={['Nginx', '受け取った分をそのまま送る']} fs={11.5} fill="box" subTone="muted" />
      <Arrow x1={510} y1={186} x2={608} y2={186} dashed />
      <Box x={610} y={164} w={150} h={44} lines={['遅いクライアント', '200KB/s']} fs={11.5} fill="bg" subTone="muted" />
      <T x={20} y={234} fs={11} tone="muted" mono>
        3秒後: busy_threads=3 / 別の要求 /lab/info 200 8.569s（空きスレッドを待った）
      </T>
      <T x={20} y={268} fs={11} tone="muted">
        デモ：Puma 1ワーカー・3スレッド、64MB の応答を 200KB/s のクライアント3つで受け取る
      </T>
    </Svg>
  )
}

const ch24: Chapter = {
  number: 24,
  part: 5,
  title: 'Nginx のリバースプロキシ設定',
  summary:
    'Rails の前段に置く Nginx の設定を、各行が何をしているかがわかるように、実際に Nginx 1.30.6 と Puma を動かして確かめます。設定の階層と location の選択、upstream と proxy_pass、proxy_set_header、静的ファイルの配信、遅いクライアントのために Puma のスレッドがふさがらないようにするバッファリング、client_max_body_size、WebSocket のプロキシを扱います。',
  goals: [
    'nginx.conf の main・events・http・server・location の階層と、設定の引き継ぎの例外を説明できる',
    'location の選択の順と、try_files で静的ファイルと Rails に振り分ける仕組みを説明できる',
    'proxy_set_header の Host・X-Forwarded-For・X-Forwarded-Proto が Rails のどこに影響するかを説明できる',
    'アセットを Nginx から返す設定と、キャッシュのヘッダー・圧縮の扱いを説明できる',
    'proxy_buffering で、遅いクライアントのために Puma のスレッドがふさがらないようにする仕組みを説明できる',
    'client_max_body_size の 413 と、WebSocket のプロキシに必要な設定を説明できる',
  ],
  prerequisites: [16, 17, 23],
  sections: [
    {
      id: 'process-config',
      title: 'プロセスと設定の階層',
      body: (
        <>
          <p>
            Nginx は1つのマスターのプロセスと複数のワーカーのプロセスで動きます。マスターは設定を読んでワーカーを管理し、要求を処理するのはワーカーです
            <Ref n={1} />。Puma と違い、1つのワーカーがイベント駆動で多数の接続を同時に扱います。Docker の公式イメージ（nginx:1.30.6）で起動して、プロセスを確かめました。
          </p>
          <Code
            lang="text"
            code={`
nginx: master process nginx -g daemon off;
nginx: worker process
nginx: worker process
nginx: worker process
nginx: worker process          ← worker_processes auto（CPU 4 つ）
`}
          />
          <p>公式イメージの /etc/nginx/nginx.conf は次のとおりです（コメントを除く）。</p>
          <Code
            lang="nginx"
            title="/etc/nginx/nginx.conf（nginx:1.30.6 のイメージ）"
            code={`
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    include /etc/nginx/conf.d/*.conf;
}
`}
          />
          <p>
            設定は、一番外側（main）、<code>events</code>、<code>http</code>、その中の <code>server</code>、さらにその中の <code>location</code> という階層になっています（図
            24-1）。Rails のための設定は、conf.d に置いた次のファイルに書きました。この章の実測はすべてこの設定（と一部を変えたもの）で行っています。
          </p>
          <Code
            lang="nginx"
            title="conf.d/default.conf（デモ）"
            code={`
upstream app {
    server rbdemo-puma:3000;
}

server {
    listen 80;
    server_name _;
    root /app/public;

    # ダイジェスト付きのアセットは Nginx が直接返す
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        gzip_static on;
        try_files $uri =404;
    }

    # ActionCable の WebSocket
    location /cable {
        proxy_pass http://app;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # public のファイルがあれば返し、無ければ Rails へ
    location / {
        try_files $uri @app;
    }

    location @app {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-Start "t=\${msec}";
    }
}
`}
          />
          <p>
            下の階層は上の階層の設定を引き継ぎます。ただし、<code>proxy_set_header</code> は「その階層に proxy_set_header が1つも無い場合に限り」上の階層の値を引き継ぎます
            <Ref n={2} />（add_header も同じです）。server に2行、location に1行だけ書いた設定で確かめました。
          </p>
          <Code
            lang="text"
            code={`
server {
    proxy_set_header X-Forwarded-Proto $scheme;               # server のレベル
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    location /lab/headers { proxy_pass http://app; proxy_set_header Host $host; }
    location / { proxy_pass http://app; }
}

== /lab/headers（location で Host だけを書いた）
HTTP_HOST="127.0.0.1"   HTTP_X_FORWARDED_FOR=nil   HTTP_X_FORWARDED_PROTO=nil
== /lab/echo（location / では何も書いていない）
HTTP_HOST="app"         HTTP_X_FORWARDED_FOR="172.29.0.1"   HTTP_X_FORWARDED_PROTO="http"
`}
          />
          <p>
            location で Host を1行書いただけで、server の X-Forwarded-For と X-Forwarded-Proto が送られなくなりました。location に proxy_set_header を書くときは、必要なものをすべて書き直します。
          </p>
          <Figure n="24-1" title="nginx.conf の階層" caption="nginx:1.30.6 のイメージの nginx.conf とデモの conf.d/default.conf をもとにした図。">
            <HierarchyFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'location',
      title: 'location の選択',
      body: (
        <>
          <p>Nginx の説明書によると、要求に合う location は次の順に探されます。</p>
          <ul>
            <li>
              文字列（接頭辞）の location のうち、最も長く一致するものを選んで覚えておく。<code>=</code>（完全一致）が一致すればそこで終わり、<code>^~</code>{' '}
              が付いたものが最長の一致なら正規表現を調べない
            </li>
            <li>
              正規表現の location（<code>~</code>・<code>~*</code>）を設定ファイルに書いた順に調べ、最初に一致したものを使う
            </li>
            <li>正規表現が1つも一致しなければ、覚えておいた接頭辞の location を使う</li>
          </ul>
          <p>
            正規表現を使わなければ、「最も長く一致する接頭辞」で決まります。デモの設定で、要求ごとに選ばれた location をヘッダー（<code>X-Location</code>）に出して確かめました
            <Ref n={3} />。
          </p>
          <Code
            lang="text"
            code={`
/assets/application-8b441ae0.css   HTTP/1.1 200 OK  X-Location: assets  Cache-Control: public, max-age=31536000, immutable
/assets/nothing.css                HTTP/1.1 404 Not Found  X-Location: assets
/robots.txt                        HTTP/1.1 200 OK  X-Location: root
/up                                HTTP/1.1 200 OK  X-Location: app
/articles/1                        HTTP/1.1 200 OK  X-Location: app
/cable                             HTTP/1.1 404 Not Found  X-Location: cable   ← WebSocket でない GET なので Rails が 404
`}
          />
          <p>
            <code>location /</code> の <code>try_files $uri @app</code> は、root の下に要求のパスと同じファイルがあれば返し、無ければ名前付きの location（<code>@app</code>
            ）に処理を移します。public/robots.txt は Nginx が返し、/articles/1 は Puma に渡りました（図 24-2）。/assets/ の location は <code>try_files $uri =404</code>{' '}
            なので、ファイルが無ければ Rails に渡さずに 404 を返します。デプロイの途中で古いページが新しいダイジェストのファイルを要求したときなどに、Rails に無駄な要求を送らないためです。
          </p>
          <Figure n="24-2" title="要求の振り分け" caption="デモの設定（Nginx 1.30.6）で、要求ごとに選ばれた location を X-Location ヘッダーで確かめた結果。">
            <RoutingFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'upstream',
      title: 'upstream と proxy_pass',
      body: (
        <>
          <p>
            <code>upstream app</code> は Puma のアドレスに名前を付け、<code>proxy_pass http://app;</code> がそこへ要求を送ります。デモの Nginx と Puma は別のコンテナなので TCP で接続しました。同じサーバーで動かす場合は、Puma
            を Unix ソケットで待ち受けさせ（<code>bind "unix:///app/tmp/sockets/puma.sock"</code>）、<code>server unix:/app/tmp/sockets/puma.sock;</code> と書く構成もよく使われます。Puma
            の説明書の Nginx の設定例も Unix ソケットを使っています
            <Ref n={4} />。
          </p>
          <p>
            Nginx から Puma への接続が使い回されているかを、Puma で見た相手のポート番号で確かめました。Nginx 1.30.6 の既定の設定のまま、12回要求しています。
          </p>
          <Code
            lang="text"
            code={`
      9 peer_port=36990        ← 同じ接続を使い回している
      1 peer_port=36994
      1 peer_port=37006
      1 peer_port=37008        ← 最初の数回は、Nginx のワーカーごとに新しい接続を作る
SERVER_PROTOCOL="HTTP/1.1"
`}
          />
          <p>
            説明書によると、Nginx 1.29.7 から <code>proxy_http_version</code> の既定値が 1.0 から 1.1 に変わり、upstream への接続を保持する <code>keepalive</code>{' '}
            も既定で有効（32本）になりました
            <Ref n={2} />
            <Ref n={5} />。Nginx のワーカーは4つあり、それぞれが自分の接続を持つので、最初の数回は新しい接続が作られています。
          </p>
          <Callout kind="warn" title="Nginx 1.29.7 より前の場合">
            <p>
              1.29.7 より前の Nginx では、既定のまま設定すると HTTP/1.0 で接続し、要求ごとに接続を作って閉じます。接続を使い回すには、upstream に <code>keepalive 32;</code>、location に{' '}
              <code>proxy_http_version 1.1;</code> と <code>proxy_set_header Connection "";</code> を書きます。業務の環境では <code>nginx -v</code> でバージョンを確かめ、そのバージョンの説明書の既定値で判断します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'headers',
      title: 'proxy_set_header',
      body: (
        <>
          <p>
            Nginx は元の要求の Host ヘッダーをそのまま転送しません。既定では <code>proxy_set_header Host $proxy_host;</code>、つまり proxy_pass に書いた名前（ここでは <code>app</code>
            ）を送ります
            <Ref n={2} />。Rails の側で受け取った値を、Puma のアクションで表示しました。
          </p>
          <Code
            lang="text"
            code={`
== Host を指定しない
HTTP_HOST="app"          request.url=http://app/lab/headers
== proxy_set_header Host $host;
HTTP_HOST="127.0.0.1"    request.url=http://127.0.0.1/lab/headers
== Puma に直接（比較用）
HTTP_HOST="127.0.0.1:3200"
`}
          />
          <p>
            Host が <code>app</code> のままだと、<code>redirect_to</code> や <code>*_url</code> のヘルパーが作る URL が http://app/… になり、本番環境で <code>config.hosts</code>{' '}
            を設定していれば HostAuthorization に 403 で拒否されます（<ChapterLink n={21} section="host-ssl-csp" />
            ）。<code>$host</code> は要求の Host ヘッダーからポート番号を除いた値で、<code>$http_host</code> は Host ヘッダーそのままです。デモはポート 8080 で受けているので、$host
            ではポート番号が落ちました。通常の 80・443 番で公開する場合は、どちらでも同じになります。後で見る WebSocket では、この違いが問題になります。
          </p>
          <p>その他のヘッダーは Rails の次の部分に使われます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>設定</th>
                  <th>Rails の側</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>X-Forwarded-For $proxy_add_x_forwarded_for</code>
                  </td>
                  <td>
                    <code>request.remote_ip</code>（ActionDispatch::RemoteIp）。Nginx が受け取った X-Forwarded-For の後ろに、接続してきた相手の IP を足す。ロードバランサーがある場合は<ChapterLink n={25} />
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>X-Forwarded-Proto $scheme</code>
                  </td>
                  <td>
                    <code>request.ssl?</code>・<code>request.url</code> のスキーム。force_ssl のリダイレクトと CSRF の Origin の検査に使われる
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>X-Request-Start "t=$&#123;msec&#125;"</code>
                  </td>
                  <td>Nginx が要求を受け取った時刻。Puma の説明書は、これと Rails が処理を始めた時刻の差で、スレッドの空きを待った時間を計ることを勧めている</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            デモでは <code>HTTP_X_FORWARDED_FOR="172.29.0.1"</code>、<code>HTTP_X_REQUEST_START="t=1794394142.962"</code> が届き、<code>request.remote_ip</code>{' '}
            は Nginx のコンテナの IP（REMOTE_ADDR）ではなく、ブラウザー側の IP（172.29.0.1）になりました。Nginx のアドレスが RemoteIp の信頼するプロキシ（プライベートな IP アドレス）に含まれるからです。
          </p>
        </>
      ),
    },
    {
      id: 'static',
      title: '静的ファイルとアセット',
      body: (
        <>
          <p>
            assets:precompile で public/assets に出力したファイル（<ChapterLink n={16} section="assets" />
            ）は、Nginx が直接返します。デモで /assets/ のファイルを要求したとき、Puma のログに /assets/ の要求は1件もありませんでした。ファイル名にダイジェストが入っているので、内容が変われば URL
            も変わります。そのため <code>Cache-Control: public, max-age=31536000, immutable</code> で、ブラウザーに1年間保存させても問題ありません。
          </p>
          <p>
            <code>gzip_static on</code> は、要求されたファイルの隣に .gz のファイルがあれば、それを Content-Encoding: gzip で返す設定です
            <Ref n={6} />。デモで確かめました。
          </p>
          <Code
            lang="text"
            code={`
$ ls public/assets | grep -c '\\.gz$'
0                                              ← Propshaft は .gz を作らない
GET /assets/turbo.min-9fd88cd5.js（Accept-Encoding: gzip） → Content-Length: 105579（圧縮なし）

$ gzip -k -9 public/assets/turbo.min-9fd88cd5.js
GET /assets/turbo.min-9fd88cd5.js（Accept-Encoding: gzip） → Content-Length: 28542  Content-Encoding: gzip
`}
          />
          <p>
            Propshaft は圧縮しない（<ChapterLink n={16} section="assets" />
            ）ので、gzip_static を書いただけでは何も変わりません。デプロイの手順で .gz を作るか、Nginx の <code>gzip on;</code> と <code>gzip_types</code>{' '}
            で要求のたびに圧縮するか、前段の CDN に圧縮させます。Sprockets は、README によると既定で CSS や JavaScript の .gz も作るので<Ref n={8} />、Sprockets のアプリケーションでは gzip_static がそのまま効きます。
          </p>
        </>
      ),
    },
    {
      id: 'buffering',
      title: 'バッファリングと Puma のスレッド',
      body: (
        <>
          <p>
            <ChapterLink n={23} section="cluster" />
            で見たとおり、Puma は応答の書き込みを Rails を実行したスレッドで行います。回線の遅いクライアントに大きな応答を返すと、送り終わるまでそのスレッドがふさがります。Nginx の{' '}
            <code>proxy_buffering</code>（既定で on）は、Puma からの応答をできるだけ速く受け取ってメモリーや一時ファイルに保存し、クライアントには Nginx が送ります
            <Ref n={2} />。
          </p>
          <p>
            Puma をワーカー1・スレッド3 にして、64MB の応答を 200KB/s で受け取るクライアントを3つ動かし、3秒ごとに別の要求（/lab/info）の時間を測りました（Docker のネットワークの中から実行）。
          </p>
          <Code
            lang="text"
            code={`
== proxy_buffering on（既定）
3秒後: Puma busy_threads=3 backlog=0 / 別の要求 /lab/info 200 0.003084s
6秒後: Puma busy_threads=0 backlog=0 / 別の要求 /lab/info 200 0.002463s
9秒後: Puma busy_threads=0 backlog=0 / 別の要求 /lab/info 200 0.002536s
== proxy_buffering off
3秒後: Puma busy_threads=3 backlog=0 / 別の要求 /lab/info 200 8.568964s
6秒後: Puma busy_threads=2 backlog=0 / 別の要求 /lab/info 200 0.003191s
9秒後: Puma busy_threads=2 backlog=0 / 別の要求 /lab/info 200 0.006094s
`}
          />
          <p>
            Puma の統計は数秒おきに更新されるので、少し遅れて表示されます。buffering on では、3つの大きな応答を Nginx がすぐに受け取ったので、6秒後にはスレッドがすべて空き、別の要求もすぐに処理されました。off
            では3つのスレッドが応答の書き込みでふさがり、3秒後に送った要求は空きを 8.6 秒待ちました（図 24-3）。その後スレッドが1つ空いた理由は確かめていませんが、残りの2つは書き込みを続けています。
          </p>
          <p>
            要求の側も同じで、<code>proxy_request_buffering</code>（既定で on）により、Nginx が要求の本文を受け取り終えてから Puma に送ります。Puma 自身も reactor のスレッドで要求を読み切ってからスレッドに渡すので、遅いアップロードでスレッドがふさがることはありません。
          </p>
          <p>
            <code>ActionController::Live</code> や Server-Sent Events のように少しずつ送る応答は、バッファリングされると届かなくなります。その応答だけ Rails で{' '}
            <code>X-Accel-Buffering: no</code> のヘッダーを付けると、Nginx はその応答のバッファリングをやめます
            <Ref n={2} />。
          </p>
          <Figure n="24-3" title="バッファリングの有無" caption="Nginx 1.30.6・Puma 8.0.2（1ワーカー・3スレッド）での実測をもとにした模式図。">
            <BufferFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'body-size',
      title: 'client_max_body_size',
      body: (
        <>
          <p>
            <code>client_max_body_size</code> は要求の本文の上限で、既定値は 1m（1MB）です
            <Ref n={3} />。2MB の本文を POST しました。
          </p>
          <Code
            lang="text"
            code={`
$ curl -X POST --data-binary @2mb.bin http://127.0.0.1:8080/lab/headers
413
<title>413 Request Entity Too Large

（Nginx の error.log）
[error] 21#21: *2 client intended to send too large body: 2097152 bytes, client: 172.29.0.1, server: _, request: "POST /lab/headers HTTP/1.1", host: "127.0.0.1:8080"
`}
          />
          <p>
            Nginx が 413 を返し、Rails には要求が届いていません。Rails のログに何も出ないので、画像のアップロードが「たまに失敗する」ときは Nginx の error.log を確かめます。ファイルをアップロードする画面があるなら、上限をその用途に合わせて上げるか、ActiveStorage の直接アップロード（
            <ChapterLink n={19} section="direct-upload" />
            ）で Nginx を通さないようにします。
          </p>
        </>
      ),
    },
    {
      id: 'websocket',
      title: 'WebSocket のプロキシ',
      body: (
        <>
          <p>
            WebSocket は HTTP/1.1 の Upgrade の仕組みで接続を切り替えます。Upgrade と Connection は隣の相手との間だけで意味を持つヘッダー（<Term en="hop-by-hop header">ホップバイホップのヘッダー</Term>）なので、Nginx はクライアントから受け取っても Puma
            に転送しません。説明書は、次のように明示的に設定するよう書いています
            <Ref n={7} />。
          </p>
          <Code
            lang="nginx"
            title="nginx.org の WebSocket proxying の例"
            code={`
location /chat/ {
    proxy_pass http://backend;
    # proxy_http_version 1.1; # before version 1.29.7
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
`}
          />
          <p>本番環境の設定の Puma の前に Nginx を置き、Chrome で記事のページ（turbo_stream_from を含む）を開いて、/cable の接続を3通りの設定で確かめました。</p>
          <Code
            lang="text"
            code={`
== Upgrade あり、Host $host
socketerror Error during WebSocket handshake: Unexpected response code: 404
（Rails のログ）Request origin not allowed: http://localhost:8080
              Failed to upgrade to WebSocket (REQUEST_METHOD: GET, HTTP_CONNECTION: upgrade, HTTP_UPGRADE: websocket)
== Upgrade あり、Host $http_host
ws← {"type":"welcome"}
ws← {"identifier":"{\\"channel\\":\\"Turbo::StreamsChannel\\",…
（Rails のログ）Successfully upgraded to WebSocket (REQUEST_METHOD: GET, HTTP_CONNECTION: upgrade, HTTP_UPGRADE: websocket)
== Upgrade なし
socketerror Error during WebSocket handshake: Unexpected response code: 404
（Rails のログ）Failed to upgrade to WebSocket (REQUEST_METHOD: GET, HTTP_CONNECTION: , HTTP_UPGRADE: )
`}
          />
          <p>
            Upgrade のヘッダーが無いと、ActionCable は WebSocket の要求と認めず 404 を返します（<ChapterLink n={17} section="actioncable" />
            ）。Upgrade があっても、Host を $host にした設定では Origin の検査で拒否されました。本番環境では allowed_request_origins を設定していないので、ActionCable は Origin と Host
            が同じかどうかで判断します（<code>allow_same_origin_as_host</code>、既定で true）。ブラウザーの Origin は http://localhost:8080 で、$host はポート番号を落とした localhost
            なので一致しませんでした。<code>$http_host</code> にすると接続できました。本番環境では、allowed_request_origins に公開する URL を書いておくのが確実です。
          </p>
          <p>
            説明書によると、プロキシ先から60秒間データが来ないと、Nginx は WebSocket の接続を閉じます（<code>proxy_read_timeout</code>
            ）。ActionCable はサーバーから3秒ごとに ping を送るので、この既定値のままで切れません。
          </p>
          <Callout kind="v72">
            <p>
              この章の Rails 側の挙動（RemoteIp、ActionCable の Origin の検査、Propshaft が .gz を作らないこと）は Rails 7.2.4 でも同じです。7.2 で Sprockets
              を使っているアプリケーションでは、既定で .gz も作られるので gzip_static が効きます（<ChapterLink n={16} section="assets" />
              ）。Nginx の既定値は、Rails ではなく Nginx のバージョンで決まります（上の注意を参照）。
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
          <li>Nginx はマスターと複数のワーカーで動き、設定は main・events・http・server・location の階層です。proxy_set_header と add_header は、その階層に1つでも書くと上の値を引き継ぎません。</li>
          <li>location は最も長く一致する接頭辞で選ばれ、try_files で public のファイルと Rails（@app）に振り分けます。アセットは Rails に渡さず 404 にします。</li>
          <li>Host を指定しないと proxy_pass の名前が Rails に届きます。$host はポート番号を含まず、$http_host は含みます。</li>
          <li>Nginx 1.29.7 以降は、upstream に HTTP/1.1 で接続を使い回すのが既定です。それより前のバージョンでは明示的に設定します。</li>
          <li>Propshaft は .gz を作らないので、gzip_static を効かせるには自分で圧縮するか、gzip on を使います。</li>
          <li>proxy_buffering（既定で on）は、遅いクライアントに応答を送る間、Puma のスレッドがふさがるのを防ぎます。</li>
          <li>client_max_body_size（既定 1MB）を超えると Nginx が 413 を返し、Rails にはログが残りません。</li>
          <li>WebSocket には Upgrade と Connection の転送が必要です。Origin の検査のために、Host の扱いか allowed_request_origins を合わせます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Beginner’s Guide', publisher: 'nginx.org', url: `${NG}/beginners_guide.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'マスターとワーカーのプロセス、設定の階層とブロック。' },
    { title: 'Module ngx_http_proxy_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_proxy_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'proxy_set_header の既定値（Host $proxy_host）と継承の条件、proxy_http_version の既定値が 1.29.7 から 1.1、proxy_buffering と X-Accel-Buffering、proxy_read_timeout 60s。' },
    { title: 'Module ngx_http_core_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_core_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'location の選択の順、try_files、client_max_body_size の既定値 1m。' },
    { title: 'Puma: docs/nginx.md', publisher: 'puma/puma（GitHub）', url: 'https://github.com/puma/puma/blob/v8.0.2/docs/nginx.md', accessed: '2026-11-11', version: 'Puma 8.0.2', note: 'Unix ソケットの upstream を使う Nginx の設定例。' },
    { title: 'Module ngx_http_upstream_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_upstream_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'keepalive が 1.29.7 から既定で有効（32本、local）になったこと。' },
    { title: 'Module ngx_http_gzip_static_module', publisher: 'nginx.org', url: `${NG}/http/ngx_http_gzip_static_module.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: '.gz の付いたファイルを事前に圧縮したものとして返すこと。' },
    { title: 'WebSocket proxying', publisher: 'nginx.org', url: `${NG}/http/websocket.html`, accessed: '2026-11-11', version: 'nginx 1.30（説明書は最新の版）', note: 'Upgrade と Connection が hop-by-hop で転送されないこと、設定例、60秒でデータが無ければ閉じること。' },
    { title: 'Sprockets README（Gzip）', publisher: 'rails/sprockets（GitHub）', url: 'https://github.com/rails/sprockets/blob/v4.4.1/README.md#gzip', accessed: '2026-11-11', version: 'Sprockets 4.4.1', note: 'コンパイルしたファイルの .gz を既定で作ること（CSS・JavaScript・SVG）。' },
  ],
}

export default withExplanations(ch24, explanation24)
