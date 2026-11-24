import { ChapterLink } from '../components/content'
import { guide, primarySource, type Explanations } from './shared'

const puma = primarySource('Puma README', 'Puma', 'https://puma.io/puma/file.README.html', 'Puma 8.0.2')

export const explanation23: Explanations = {
  sources: [puma, guide('tuning_performance_for_deployment', 'Tuning Performance for Deployment')],
  sections: {
    cluster: cite => <>
      <p>
        クラスタモードでは、Puma はワーカーを管理するプロセスを1つと、要求を処理するワーカーのプロセスを設定した数だけ起動します。管理するほうのプロセスをマスターと呼びます。
        マスターは fork でワーカーを作り、OS からのシグナルを受け取ってワーカーを止めたり作り直したりします。
        シグナルは OS を通じてプロセスに送る短い通知です。端末で Ctrl-C を押すと送られる SIGINT のように種類ごとに名前があり、受け取ったプロセスは種類に応じて終了や再起動などの処理をします。{cite}
      </p>
    </>,
    gvl: cite => <>
      <p>
        「スレッドと同時に進む処理」の節では、計算だけを続ける処理を3本のスレッドで実行しても速くなりませんでした。その原因が GVL です。
        ロックはある資源を同時に1つの処理だけが使えるようにする仕組みで、使っている処理が手放すまで、ほかの処理を待たせます。
        GVL は Ruby のコードの実行にかかるロックで、GVL を持っているスレッドだけが Ruby のコードを実行できます。
      </p>
      <p>
        I/O は DB、ネットワーク、ファイルとのデータの入出力です。I/O の応答を待つ間、スレッドは Ruby のコードを実行しないので GVL を手放し、その間に別のスレッドが GVL を取って進みます。
        この応答を待つ時間を I/O 待ちと呼びます。処理時間のうち I/O 待ちの割合が大きいほど、スレッドを増やす効果があります。{cite}
      </p>
    </>,
    sizing: cite => <>
      <p>
        Rails が MySQL に SQL を送るには、先に MySQL との接続を作ります。接続は1本ごとに MySQL の側でもメモリーを使うため、MySQL は同時に受け付ける接続の数に上限（max_connections）を設けています。
        接続を作るには時間がかかるので、ActiveRecord は作った接続を接続プールにためておき、要求を処理するスレッドに1本ずつ貸し出して使い回します。
        1本の接続を同時に使えるのは1つのスレッドだけなので、スレッドを増やすと、必要な接続の数も増えます。
      </p>
      <p>
        接続プールはプロセスごとにあります。たとえば、各ワーカーの接続プールが3接続で、ワーカーが2つなら、Puma だけで最大6接続を使います。
        Sidekiq のように別のプロセスで動くものの接続は、さらに別に数えます。{cite}
      </p>
    </>,
    preload: cite => <>
      <p>
        「プロセスとメモリー」の節で見たとおり、fork で作った子プロセスは、親プロセスのメモリーの内容を受け継ぎます。
        このとき Linux は、メモリーの内容をすぐに全部複製せず、ページ（OS がメモリーを管理する単位）ごとに、親と子で同じものを使わせます。
        どちらかがページを書き換えたときに初めて、そのページだけを複製します。この方式をコピーオンライトと呼びます。
      </p>
      <p>
        そのため、アプリケーションを読み込んでから fork すれば、読み込んだクラスやデータのうち書き換えない部分のメモリーを、複数のワーカーで共有できます。
        ここでの共有は、OS がメモリーの使用量を減らすためのものです。一方のプロセスで変数を書き換えても、もう一方のプロセスの変数は変わりません。
      </p>
      <p>
        Linux でプロセスのメモリーの量を見るときは、次の値を使います。Rss はそのプロセスが使っているメモリーの合計で、ほかのプロセスと共有しているページも含みます。
        Shared はそのうちほかのプロセスと共有している量、Private はそのプロセスだけが使っている量です。{cite}
      </p>
    </>,
    'restart-timeout': () => <>
      <p>
        タイムアウトは待つ時間の上限です。上限を過ぎると、待っていた側は待つのをやめ、エラーにしたり接続を切ったりします。
        Puma が待つものには、ワーカーからの状態の知らせ、クライアントから届く要求のデータ、同じ接続の次の要求などがあり、それぞれに別のタイムアウトがあります。
      </p>
    </>,
    'thread-safety': cite => <>
      <p>
        「スレッドと同時に進む処理」の節で見たとおり、同じプロセスのスレッドはメモリーを共有します。
        ある利用者の名前をクラスの属性へ保存し、応答を返すまでその値を使うと、別の要求を処理しているスレッドが同じ属性を書き換える可能性があります。
        メソッドの中のローカル変数はその実行だけの値ですが、クラスやグローバルな変数は複数の要求から参照されます。
        複数のスレッドから同時に使っても値が混ざらないことをスレッド安全と呼び、どの範囲で値を共有するかを確かめることが出発点になります。
      </p>
      <p>
        GVL があっても、要求全体が途中で切り替わらずに実行されるわけではありません。待ちの前に保存した値が、待ちから戻るまで同じとは限りません。
        Rails は、要求ごとの値を入れる CurrentAttributes と、要求の処理が終わったときにその値を消す Executor を用意しています。{cite}
      </p>
    </>,
  },
}

export const explanation24: Explanations = {
  sources: [
    primarySource('Development guide — Event loop', 'Nginx', 'https://nginx.org/en/docs/dev/development_guide.html#event_loop'),
    primarySource('RFC 9111: HTTP Caching', 'IETF', 'https://www.rfc-editor.org/rfc/rfc9111.html', 'RFC 9111'),
    primarySource('RFC 6455: The WebSocket Protocol', 'IETF', 'https://www.rfc-editor.org/rfc/rfc6455.html', 'RFC 6455'),
  ],
  sections: {
    'process-config': cite => <>
      <p>
        Puma のクラスタモードでは、ワーカーの中のスレッドが1件の要求を受け持ち、応答を書き終えるまでそのスレッドを使います（<ChapterLink n={23} section="cluster" />）。
        スレッドが3本なら、1つのワーカーが同時に処理できる要求は3件です。
      </p>
      <p>
        Nginx のワーカーは要求ごとにスレッドを用意しません。1つのワーカーが多数の接続を受け持ち、データが届いた接続や、書き込める状態になった接続を OS から知らされて、その接続の処理だけを進めます。
        データを待っている接続は後回しにします。たとえば、遅い回線のブラウザーへ応答を送っている間も、同じワーカーがほかの接続の要求を読み、Puma から届いた応答を受け取れます。
        このように、起きた出来事（イベント）に応じて処理を進める方式をイベント駆動と呼びます。{cite}
      </p>
    </>,
    location: () => <>
      <p>
        URL の http://127.0.0.1:8080/assets/application-8b441ae0.css のうち、/assets/application-8b441ae0.css の部分がパスです（Nginx の説明書では URI と呼びます）。
        location は要求のパスに応じて使う設定を分けるブロックです。<code>location /assets/</code> と書くと、パスが /assets/ で始まる要求に、そのブロックの中の設定が使われます。
        このように先頭の部分が一致するかで選ぶ指定を、接頭辞の指定と呼びます。
      </p>
      <p>
        <code>location = /up</code> のように = を付けると、パスが /up と完全に一致したときだけ使われます。
        <code>location ~ \.css$</code> のように ~ を付けると、正規表現（文字の並びのパターンを表す書き方。<code>\.css$</code> は「.css で終わる」）で指定できます。
        1つの要求に使われる location は1つだけです。/assets/application-8b441ae0.css は location / にも location /assets/ にも当てはまるので、どちらを使うかを次の規則で決めます。
      </p>
    </>,
    upstream: () => <>
      <p>
        「リバースプロキシとして Puma に転送する」の節の <code>proxy_pass http://puma:3000;</code> は、転送先をホスト名（puma）とポート番号（3000）で指定しました。
        この場合、Nginx は TCP で Puma に接続します。TCP はネットワークの先の相手にデータを順番どおりに届ける通信の方式で、HTTP の要求と応答はこの接続の上で送られます。
        Nginx と Puma を同じサーバーで動かすなら、Unix ソケットも使えます。Unix ソケットは同じコンピューターのプログラムどうしが、ファイルのパス（例：/app/tmp/sockets/puma.sock）を接続先にして通信する仕組みです。
      </p>
      <p>
        接続を作るたびに、接続を始めるためのやり取りの時間がかかります。
        1本の接続を閉じずに残し、次の要求も同じ接続で送る方式を keep-alive と呼びます（<ChapterLink n={23} section="restart-timeout" />）。
        この節では、Nginx から Puma への接続が要求ごとに作り直されているか、使い回されているかを確かめます。
      </p>
    </>,
    headers: () => <>
      <p>
        「リバースプロキシとして Puma に転送する」の節で見たとおり、Nginx は Puma への新しい接続で要求を送り直します。
        Nginx はブラウザーの要求のヘッダーをおおむねそのまま写しますが、Host などの一部のヘッダーは自分で決めた値に置き換えます。
        どのヘッダーにどんな値を入れて送るかを指定するのが proxy_set_header です。
      </p>
      <p>
        この節で扱うヘッダーは次のとおりです。Host はブラウザーが接続先として URL に書いたホスト名とポート番号（例：Host: 127.0.0.1:8080）です。
        X-Forwarded-For はプロキシを通るたびに、そのプロキシに接続してきた相手の IP アドレスが書き足されていくヘッダーで、Rails はここから元のブラウザーの IP アドレスを求めます。
        X-Forwarded-Proto はブラウザーが http と https のどちらで接続したかを伝えるヘッダーです。
        設定の中の $host や $scheme のように $ で始まる語は、Nginx が要求ごとに値を入れる変数です。たとえば $scheme には、Nginx が受けた接続が http か https かが入ります。
      </p>
    </>,
    static: cite => <>
      <p>
        <ChapterLink n={16} section="assets" /> で見たとおり、<code>bin/rails assets:precompile</code> は CSS や JavaScript を public/assets にファイルとして書き出し、ファイル名に内容から計算した文字列（ダイジェスト）を付けます。
        application-8b441ae0.css の 8b441ae0 がそれで、内容が変わると別の文字列になり、URL も変わります。
      </p>
      <p>
        ブラウザーは受け取ったファイルを手元に保存しておき（キャッシュ）、次に同じ URL が必要になったときに、サーバーに要求を送らずに使うことがあります。
        保存してよい期間は、応答の Cache-Control ヘッダーでサーバーが指示します。max-age=31536000 は、31536000 秒（365日）保存してよいという意味です。
        また、ブラウザーは要求の Accept-Encoding: gzip で、gzip で圧縮した本文を受け取れることを伝えます。後の実測のとおり、圧縮した本文を返す応答には Content-Encoding: gzip が付きます。{cite}
      </p>
    </>,
    buffering: () => <>
      <p>
        Rails が応答の本文を作り終えても、ブラウザーが本文を受け取り終えるまでには、回線の速さに応じた時間がかかります。
        たとえば、64MB の本文を毎秒 200KB で受け取るブラウザーは、受け取り終えるまでに5分以上かかります。
        Puma では応答を書き込むのも Rails を実行したスレッドなので、その間、そのスレッドはほかの要求を処理できません。
      </p>
      <p>
        バッファーは受け取ったデータを送り先に渡すまで一時的に置いておくメモリーやファイルです。
        Nginx が Puma からの応答をバッファーにすばやく受け取れば、Puma のスレッドはすぐに空き、ブラウザーへの送信は Nginx が続けます。
        「プロセスと設定の階層」の節で見たとおり、Nginx のワーカーは送信を待つ間もほかの接続を処理できます。
      </p>
    </>,
    'body-size': () => <>
      <p>
        要求の本文はヘッダーの後の空の行に続くデータです（「Web サーバーと HTTP の要求・応答」の節）。
        フォームに入力した値や、アップロードする画像のファイルは、POST の要求の本文として送られます。
        client_max_body_size は Nginx が受け付ける本文の大きさの上限で、1m は 1MB を表します。
        上限を超えると、Nginx は本文が大きすぎることを表すステータスコード 413 を返し、要求を Puma に転送しません。
      </p>
    </>,
    websocket: cite => <>
      <p>
        HTTP では、ブラウザーが要求を送ったときにだけ、サーバーが応答を返します。記事に新しいコメントが付いたことをサーバーからすぐに知らせるには、接続を開いたままにして、サーバーの側からもメッセージを送れる WebSocket を使います。
        ActionCable と、Turbo Streams によるページの更新は WebSocket で届きます。
      </p>
      <p>
        WebSocket の接続は HTTP の要求から始まります。ブラウザーは GET /cable の要求に Upgrade: websocket と Connection: Upgrade のヘッダーを付けて、この接続を WebSocket に切り替えたいと伝えます。
        サーバーがステータスコード 101（Switching Protocols）を返すと、それ以降は同じ接続で WebSocket のメッセージを双方向に送ります。
        Origin は要求を送ったページのスキーム・ホスト名・ポート番号（例：http://localhost:8080）を表すヘッダーで、サーバーはこれを見て、ほかのサイトのページからの接続を断れます。{cite}
      </p>
    </>,
  },
}

export const explanation25: Explanations = {
  sources: [guide('configuring', 'Configuring Rails Applications（force_ssl・assume_ssl）')],
  sections: {
    composition: () => <>
      <p>
        「ロードバランサーが要求を振り分ける」の節では、Nginx をロードバランサーとして使いました。
        AWS の ALB では受け付けるポートと通信の方式（たとえば HTTPS のポート 443）をリスナーとして設定し、振り分け先のサーバーをターゲットとしてターゲットグループに登録します。
        EC2 は AWS で借りられる仮想のサーバーで、この章の構成では EC2 の上で Nginx と Puma を動かし、そのサーバーを ALB のターゲットにします。
      </p>
      <p>
        この節のデモでは ALB の代わりの Nginx に自己署名の証明書（「HTTPS と TLS」の節）を設定して、HTTPS で受けます。
        X-Forwarded-For と X-Forwarded-Proto は、<ChapterLink n={24} section="headers" /> で見たとおり、元のクライアントの IP アドレスと、http と https のどちらで接続したかを後ろに伝えるヘッダーです。
        X-Forwarded-Port は、クライアントが接続したポート番号（ここでは 443）を伝えます。
      </p>
    </>,
    'tls-proto': cite => <>
      <p>
        リダイレクトはステータスコード 301 や 302 と Location ヘッダーで、ブラウザーに別の URL を開き直させる応答です（「ステータスコードと 502・504」の節）。
        config.force_ssl = true にすると、Rails は http で届いた要求に、同じパスの https の URL へのリダイレクトを返します。
        https で届いた要求はそのまま処理し、応答に HSTS のヘッダー（このサイトには今後 https で接続するようブラウザーに指示するヘッダー）を付けます（<ChapterLink n={21} section="host-ssl-csp" />）。
      </p>
      <p>
        Rails が「https で届いた」と判断する材料は、Puma が受けた接続の方式と、X-Forwarded-Proto などのヘッダーです。
        「HTTPS と TLS」の節で見たとおり、ロードバランサーが TLS を終端すると、Nginx や Puma への接続は http になります。
        そのため、ロードバランサーが付けた X-Forwarded-Proto: https が Rails まで届かないと、Rails はブラウザーが https で開いたページの要求も http と判断します。{cite}
      </p>
    </>,
    'client-ip': () => <>
      <p>
        「IP アドレスとポート」の節で見たとおり、Puma から見た接続の相手は1つ手前の Nginx です。
        Rails の request.remote_ip は、X-Forwarded-For を使って元のクライアントの IP アドレスを求めます。
        X-Forwarded-For はプロキシを通るたびに、そのプロキシが見た接続の相手の IP アドレスを右端に書き足すヘッダーです。
        たとえば、ブラウザー（203.0.113.7）→ ロードバランサー（10.0.1.25）→ Nginx → Puma の順に通ると、Rails には「203.0.113.7, 10.0.1.25」が届きます。
      </p>
      <p>
        ただし、ヘッダーはクライアントが自由に書けるので、ブラウザーが最初から X-Forwarded-For: 1.2.3.4 を付けて送ることもできます。
        プロキシはその値の右に書き足すので、左端の値は信頼できません。信頼できるのは、自分たちのプロキシが書き足した右側の値だけです。この節では、Rails がどこまでの値を信頼するかを確かめます。
      </p>
    </>,
    health: () => <>
      <p>
        「ロードバランサーが要求を振り分ける」の節で見たとおり、ヘルスチェックは、ロードバランサーが決まった間隔で各サーバーに送る確認の要求です。
        ALB ではターゲットグループごとに、確認に使うパス（/up など）、間隔、正常とみなすステータスコードを設定します。
        確認の要求も利用者の要求と同じように Nginx・Puma・Rails を通るので、Rails が返すステータスコードがそのまま判定に使われます。
      </p>
      <p>
        ルートは URL のパスとコントローラーのアクションを対応付ける設定です（<ChapterLink n={9} />）。
        rails new が作る config/routes.rb には <code>get "up" =&gt; "rails/health#show", as: :rails_health_check</code> の行があり、/up への要求は Rails::HealthController の show アクションが処理します。
      </p>
    </>,
    timeouts: () => <>
      <p>
        タイムアウトは待つ時間の上限です。上限を過ぎると、待っていた側は待つのをやめ、エラーを返したり接続を切ったりします。
        ロードバランサーと Nginx はどちらも後ろのサーバーの応答を待ちます。「ステータスコードと 502・504」の節では、Nginx が Puma の応答を3秒待ってやめ、504 を返しました。
        そのときも Rails は5秒かけて処理を最後まで続け、ログには 200 が残りました。
      </p>
      <p>
        keep-alive は1本の接続を閉じずに残し、次の要求にも使う方式です（<ChapterLink n={23} section="restart-timeout" />）。
        接続を残しておく時間にも上限があり、上限を過ぎた接続はどちらかの側が閉じます。ロードバランサーと後ろのサーバーの間では、この上限の長さの順番が 502 の原因になることがあります。
      </p>
    </>,
    triage: () => <>
      <p>
        「ステータスコードと 502・504」の節で見たとおり、502 と 504 は、要求を転送したサーバーが、転送先から応答を受け取れなかったときに自分で作るステータスコードです。
        この章の構成にはロードバランサーと Nginx の2つの転送するサーバーがあるので、まずどちらが作った 502・504 かを見分けます。
      </p>
      <p>
        手掛かりは各層のログです。アクセスログは要求ごとの1行の記録、エラーログは失敗の理由の記録です（<ChapterLink n={24} section="web-server" />）。
        まず、同じ時刻とパスの記録を前から順に探します。後ろの記録が見当たらないときは、前の層の接続エラーと突き合わせます。ヘルスチェックのようにログを抑えている要求や、まだ処理中で完了の行が出ていない要求もあります。
      </p>
    </>,
    'request-id': () => <>
      <p>
        要求 ID は1件の要求ごとに作る、ほかと重ならない文字列です。
        同じ ID を Nginx のアクセスログと Rails のログの両方に書いておけば、同じ時刻にほかの要求がたくさんあっても、1件の要求の記録だけを選び出せます。
        <ChapterLink n={24} section="reverse-proxy" /> の Rails のログで、各行の先頭にあった [29c5c0d9-…] が、Rails が付けた要求 ID です。
      </p>
    </>,
  },
}

export const explanation26: Explanations = {
  sources: [guide('rails_on_rack', 'Rails on Rack'), guide('action_controller_overview', 'Action Controller Overview'), guide('debugging_rails_applications', 'Debugging Rails Applications')],
  sections: {
    setup: cite => <>
      <p>
        「要求が通る部品」の節で見た部品を、次の構成で動かします。
        Rails のログには重要さの段階（ログレベル）があり、rails new が作る本番環境の設定では info です。info では、SQL の行や、テンプレートの描画を始めた行（Rendering …）は出ません。
        この章では各部品の動きをログで追うために、ログレベルを最も細かい debug にしています。
      </p>
      <p>
        パーシャルはビューの一部を別のファイルに分けたテンプレートで、記事のページではコメント1件分の HTML を comments/_comment.html.erb で作ります（<ChapterLink n={16} />）。
        turbo_stream_from は、ページを開いたまま新しいコメントなどを受け取るために、ブラウザーに WebSocket の接続を作らせる指定です。{cite}
      </p>
    </>,
    front: () => <>
      <p>
        ここで読むアクセスログは、デモのために項目を決めた書式です（<ChapterLink n={24} section="web-server" /> で見た公式イメージの書式とは違います）。
        lb_time と rt は、そのサーバーが要求を読み始めてから応答を送り終えるまでの秒数、urt は後ろのサーバー（Puma）の応答を待って受け取るまでの秒数です。
        upstream と upstream_status は転送先のアドレスと、転送先が返したステータスコード、xff は受け取った X-Forwarded-For、request_id は Nginx が要求ごとに作った ID です（<ChapterLink n={25} section="request-id" />）。
      </p>
    </>,
    rails: cite => <>
      <p>
        ミドルウェアは、Rails がアクションを呼ぶ前と後に、すべての要求に対して行う処理を1つずつ受け持つ部品です（<ChapterLink n={6} />）。
        1つのミドルウェアは自分の処理をしてから次のミドルウェアを呼び、戻ってきた応答にヘッダーを足すなどしてから、前のミドルウェアに返します。
        bin/rails middleware はその並び順を表示するコマンドで、要求は上から順に通り、応答は下から順に戻ります。{cite}
      </p>
    </>,
    response: () => <>
      <p>
        応答のヘッダーは、1つの部品がまとめて作るわけではありません。
        Rails のミドルウェアが Cookie や ETag などを付け、Nginx とロードバランサー役が Server や、設定で加えた X-Served-By を付け足します。
        ブラウザーには最後にまとめて届くので、どの部品が付けたヘッダーかは、ヘッダーの名前と各部品の設定から判断します。
      </p>
    </>,
    timing: () => <>
      <p>
        この節の時間は、どれも「ある時点から別の時点まで」の長さで、前の部品が測る時間には、後ろの部品で過ぎた時間が含まれます。
        たとえば、Nginx の rt（7ms）には Rails の処理の時間（Completed の 5ms）も含まれています。
        7ms と 5ms を足すと、Rails の5ms を二重に数えてしまいます。差の約2ms には、Rails の計測区間の前後で Nginx や Puma が行った処理や待ち時間が含まれます。
      </p>
    </>,
  },
}

export const explanation27: Explanations = {
  sources: [
    guide('active_record_migrations', 'Active Record Migrations'),
    primarySource('START TRANSACTION, COMMIT, and ROLLBACK Statements', 'MySQL Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/commit.html', 'MySQL 8.4'),
    primarySource('Locks Set by Different SQL Statements in InnoDB', 'MySQL Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', 'MySQL 8.4'),
    primarySource('Metadata Locking', 'MySQL Reference Manual', 'https://dev.mysql.com/doc/refman/8.4/en/metadata-locking.html', 'MySQL 8.4'),
  ],
  sections: {
    basics: cite => <>
      <p>
        『マイグレーションを書いて適用する』の節では、開発環境の DB に列を追加しました。Rails は環境（開発の development、テストの test、本番の production）ごとに別の DB を使います。
        <code>bin/rails db:migrate</code> は、指定が無ければ development の DB に適用します。別の環境に適用するときは、<code>bin/rails db:migrate RAILS_ENV=production</code> のように環境変数 RAILS_ENV で環境を指定します。
        開発環境で適用しても本番環境の DB の列は増えず、どのマイグレーションまで適用したかの記録も DB ごとに別々です。{cite}
      </p>
    </>,
    reversible: cite => <>
      <p>
        『マイグレーションを書いて適用する』の節の db:rollback では、add_column の逆の remove_column が実行され、列が消えました。
        この節では逆の操作で戻せるものの範囲と、構造の変更とトランザクションの関係を確かめます。
      </p>
      <p>
        トランザクションは複数の SQL を1つのまとまりとして扱う仕組みです。たとえば、注文の行を INSERT し、在庫の行を UPDATE する2つの SQL を1つのトランザクションにすると、
        最後に COMMIT すれば両方が確定し、途中で ROLLBACK すれば両方とも取り消されます。
        Rails では <code>transaction</code> のブロックの中で実行した SQL が1つのトランザクションになります（<ChapterLink n={15} section="transaction" />）。
        ALTER TABLE のような構造の変更がこの取り消しの対象になるかどうかは、データの変更とは違います。{cite}
      </p>
    </>,
    'deploy-order': cite => <>
      <p>
        『動いているアプリケーションのテーブルを変える』の節では、title 列を一度に display_title に改名すると、古いコードのプロセスが例外を出しました。
        この節では同じ改名を、古いコードのプロセスも新しいコードのプロセスも失敗させずに進める順序を考えます。
      </p>
      <p>
        古いプロセスは起動したときの列の一覧で動き続けるので、構造を変える前に、すべてのプロセスがその変更に対応したコードに入れ替わったことを確かめます。
        新しい列を NULL を許す状態で追加するのは、新しい列を知らない古いコードが行を INSERT しても、その列が NULL のまま保存できるようにするためです。{cite}
      </p>
    </>,
    backfill: cite => <>
      <p>
        この例の display_title は NULL を許し、既定値を指定せずに追加した列です。追加した時点では、以前からある記事の display_title は NULL です。既存の行に値を入れるには UPDATE を実行します。
        UPDATE は更新する行に行ロックをかけ、トランザクションが終わるまで、同じ行を更新しようとするほかの処理を待たせます。
        この例の MySQL は自動コミットが有効です。複数の SQL を transaction で囲まなければ、UPDATE は1文が終わるたびに確定します。
        1つの UPDATE で100万行を更新すると、その100万行は更新が終わるまでロックされたままです。{cite}
      </p>
      <p>
        in_batches は条件に合う行を主キーの順に一定の件数（この節の例では500件）ずつ取り出し、そのまとまりごとにブロックを実行するメソッドです。
        まとまりごとに UPDATE を分ければ、1回の UPDATE が更新する行は最大500件になり、その UPDATE が終わるとロックが外れます。{cite}
      </p>
    </>,
    'ddl-locks': cite => <>
      <p>
        『動いているアプリケーションのテーブルを変える』の節では、列の型を変える ALTER TABLE の間、UPDATE が Waiting for table metadata lock の状態で待ちました。
        メタデータロックはテーブルの定義（列や型）にかかるロックです。
        MySQL はトランザクションの中で使ったテーブルにメタデータロックをかけ、そのトランザクションが終わるまで持ち続けます。その間、ほかの接続はそのテーブルの定義を変えられません。{cite}
      </p>
      <p>
        メタデータロックは行の値を更新するときの行ロックとは対象が違います。ALTER TABLE は行ロックを待たなくても、そのテーブルを使っているほかの接続のトランザクションが終わるまで待つことがあります。
        DDL が遅いときは、実行している最中なのか、実行の前にほかの処理が終わるのを待っているのかを分けて調べます。{cite}
      </p>
    </>,
  },
}

export const explanation28: Explanations = {
  sources: [
    guide('debugging_rails_applications', 'Debugging Rails Applications'),
    rubyDocForDebug(),
    primarySource('Gemfile Reference（Groups）', 'RubyGems Guides', 'https://guides.rubygems.org/gemfile/'),
  ],
  sections: {
    workflow: cite => <>
      <p>
        『不具合の調査で確かめること』の節の /price では、数量2を送るたびに同じ 500 が返りました。
        同じ入力と操作で同じ結果が出るようにすることを再現と呼びます。再現できれば、ログを読み、止めて値を調べ、直した後に同じ要求を送って確かめられます。
      </p>
      <p>
        利用者からの報告は「保存できない」「エラーになる」のように短いことが多く、それだけでは検証で保存を断られたのか、例外で止まったのか、画面に反映されていないだけなのかが決まりません。
        行った操作、入力した値、期待した結果、実際の結果に分けて聞き取り、同じ条件を手元で作ります。{cite}
      </p>
    </>,
    environments: cite => <>
      <p>
        Gemfile は、アプリケーションが使う gem を並べたファイルです。<code>group :development, :test do … end</code> の中に書いた gem は、その環境（開発・テスト）でだけ読み込まれます。
        どのグループにも入れない gem はすべての環境で読み込まれます。Rails の config/application.rb の <code>Bundler.require(*Rails.groups)</code> が、今の環境のグループの gem を読み込みます。
        Gemfile.lock には、実際にインストールして使う gem のバージョンが、依存する gem も含めて記録されます。この節の表の「固定されたバージョン」は、Gemfile.lock から読んだものです。{cite}
      </p>
    </>,
    debug: cite => <>
      <p>
        『ブレークポイントで実行を止める』の節では、binding.break で止めて p・bt・c を使いました。この節では同じ debug gem を Rails で使う設定と、止めた後に1行ずつ進めるコマンドを扱います。
        bt で表示される #0・#1 の1行ずつは、呼び出し1回分の実行の状態で、これをフレームと呼びます。frame・up・down で調べるフレームを選ぶと、p はそのフレームの変数を表示します。{cite}
      </p>
    </>,
    exceptions: cite => <>
      <p>
        『例外とバックトレースを読む』の節で見たとおり、例外は rescue で受け止めなければ呼び出し元へ伝わり、Rails のエラーの応答になります。
        一方、rescue で受け止めて何もしないと、例外が起きたことは応答にもログにも出ません。この状態を、例外を握りつぶすと言います。
        例外が起きた位置で値が正しくないと分かっても、正しくない値を作った場所はもっと前の呼び出し元にあることがあります。
      </p>
      <p>
        すべての要求を止めると、正常なケースばかりに時間を使うことがあります。
        条件付きの停止は特定の引数やIDのときだけ止める方法です。
        例外発生時の停止と、例外になる前の特定条件での停止を使い分けると、同じ異常が繰り返される経路を絞れます。{cite}
      </p>
    </>,
    profiling: cite => <>
      <p>
        コンソールはその場で式を実行するための道具、デバッガは進行中の処理を止めて調べる道具です。
        プロファイラーはどの処理に時間などを使ったかを測ります。
        デバッガで止めた時間を含む要求の所要時間は、通常の速さを比べる測定には使えません。
      </p>
      <p>
        SQLの回数が多いのか、1回のSQLが遅いのか、SQL以外の処理が長いのかで、調査する場所を変えます。
        画面の全体時間だけで原因を決めず、内訳から次に測る対象を絞ります。
        その後、同じ条件で再測定して、変更が対象の時間へどう影響したかを確認します。{cite}
      </p>
    </>,
    regression: cite => <>
      <p>
        再現した不具合は同じ入力で期待する結果を確認する自動テストにできます。
        修正した例だけでなく、以前から正しかった入力も確認すると、変更で別のケースを崩していないか調べられます。
        修正前に失敗し、修正後に成功することが、テストが対象の問題を検出しているかの手掛かりになります。
      </p>
      <p>
        型の変換で修正する場合は、数字の文字列を受け付けるのか、不正な文字列や0以下をどう扱うのかも仕様です。
        例外を消すだけでなく、入力の範囲と期待する出力を決めることで、デバッグ時の観測を再発の検出へつなげられます。{cite}
      </p>
    </>,
  },
}

function rubyDocForDebug() {
  return primarySource('ruby/debug README', 'ruby/debug', 'https://github.com/ruby/debug')
}

export const explanation29: Explanations = {
  sources: [guide('upgrading_ruby_on_rails', 'Upgrading Ruby on Rails'), guide('configuring', 'Configuring Rails Applications — Versioned Default Values')],
  sections: {
    check: cite => <>
      <p>
        『バージョン番号の読み方』と『load_defaults が選ぶ既定値』の節で見たとおり、動いている Rails のバージョンは Gemfile.lock で決まり、設定の既定値は load_defaults の値で決まります。
        たとえば <code>config.load_defaults 7.2</code> は 7.2 までの既定値を使う指定で、Rails 本体を 7.2 にする命令ではありません。
        2つは別々に変わるので、両方を確かめます。config に個別に書いた設定は load_defaults の値より優先されるので、上書きしている設定も確かめます。
        この付録のサポート状況は2026年11月11日に確かめた情報です。{cite}
      </p>
    </>,
    'load-defaults': cite => <>
      <p>
        『load_defaults が選ぶ既定値』の節では、Regexp.timeout・escape_json_responses・yjit の3つを比べました。この節では 8.0 と 8.1 で変わる設定のすべてを、Rails のソースで確かめます。
      </p>
      <p>
        設定が選ぶのは動作の一部で、古いRailsの実装そのものに戻すわけではありません。
        新しいコードへ更新したことによる変化と、既定値を選び直したことによる変化を区別すると、不具合がどちらの変更で発生したかを調べやすくなります。{cite}
      </p>
    </>,
    'new-app': cite => <>
      <p>
        rails newはGemfileや設定ファイル、ディレクトリなどを生成するコマンドです。
        新しいRailsの生成結果が変わっても、既存アプリの同名ファイルが自動ですべて置き換わるわけではありません。
        そのため、新規アプリの標準構成と、更新した既存アプリの実際の構成は異なる場合があります。
      </p>
      <p>
        ジョブの保存先、アセットの配信、デプロイの道具などは、Rails本体とは別のgemや設定でも選びます。
        リリースノートの「既定になった」を読む際は、新規生成時の採用なのか、設定の既定値なのか、実装そのものの変更なのかを区別します。{cite}
      </p>
    </>,
    upgrade: cite => <>
      <p>
        バージョンを上げると、APIの変更だけでなく、依存するRubyやgemの条件が変わる場合があります。
        非推奨の警告は将来使えなくなる書き方などを知らせる情報です。
        現在のテストが成功していても、警告や本番の処理経路、設定差を確認する対象は残ります。
      </p>
      <p>
        更新する依存、生成ファイルとの差分、設定の既定値を分けて変更すれば、問題が出た変更を特定しやすくなります。
        設定を切り替えた後には、その設定に関わる要求、ジョブ、メールなどの経路で動作を確認します。
        DB変更を含む場合は、新旧のコードが共存する順序も合わせて扱います。{cite}
      </p>
    </>,
  },
}
