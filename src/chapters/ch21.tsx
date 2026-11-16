import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation21 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 21-1 要求の中の値はすべて送る側が決める ---------- */
function RequestPartsFigure() {
  const parts: [string, string][] = [
    ['URL・パス', 'POST /probe/echo/hello'],
    ['ヘッダー', 'User-Agent: my-script/1.0'],
    ['Cookie', 'Cookie: _demo_session=…'],
    ['フォームの値', 'article[title]=…&article[status]=published'],
  ]
  return (
    <Svg
      id="21-1"
      w={780}
      h={250}
      label="ブラウザーのフォームから送る場合も、curl やプログラムから送る場合も、要求の URL・ヘッダー・Cookie・フォームの値は、すべて送る側が自由に決められる。フォームに無い article[status] の欄も送れる。サーバーは届いた値をそのまま信用せず、受け取る値を決めて確かめる"
    >
      <Box x={20} y={40} w={170} h={50} lines={['ブラウザーのフォーム', '画面にある欄だけ']} fs={11.5} fill="bg" subTone="muted" />
      <Box x={20} y={120} w={170} h={50} lines={['curl・プログラム', '好きな値を付けられる']} fs={11.5} fill="box5" subTone="muted" accent />
      <Arrow x1={190} y1={65} x2={238} y2={95} />
      <Arrow x1={190} y1={145} x2={238} y2={115} />
      <rect x={240} y={20} width={390} height={190} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={256} y={40} bold fs={12}>
        HTTP の要求
      </T>
      {parts.map(([k, v], i) => (
        <g key={k}>
          <Box x={256} y={54 + i * 38} w={90} h={30} lines={k} fs={11} fill="box" />
          <T x={356} y={69 + i * 38} fs={10.5} mono>
            {v}
          </T>
        </g>
      ))}
      <Arrow x1={630} y1={105} x2={648} y2={105} />
      <Box x={650} y={70} w={110} h={70} lines={['Rails', '届いた値を', 'そのまま信用しない']} fs={11} fill="box" subTone="muted" />
      <T x={20} y={234} fs={11} tone="muted">
        画面に欄が無くても、送る側は article[status]=published のような値を足して送れる
      </T>
    </Svg>
  )
}

/* ---------- 図 21-2 Cookie によるログイン状態と、別のサイトからの要求 ---------- */
function CookieFlowFigure() {
  const msgs = [
    { y: 70, t: '① GET /probe/login（ログインの代わり）', back: false },
    { y: 106, t: '② set-cookie: _demo_session=…（暗号化した user_id 42）; httponly; samesite=lax', back: true },
    { y: 142, t: '③ GET /articles/1 と Cookie: _demo_session=…（自動で付ける）', back: false },
    { y: 178, t: '④ 応答（Rails は Cookie を復号して、user_id 42 の利用者からの要求だとわかる）', back: true },
  ]
  return (
    <Svg
      id="21-2"
      w={780}
      h={330}
      label="ログインすると、Rails は user_id を入れたセッションを暗号化し、set-cookie で _demo_session としてブラウザーに渡す。ブラウザーはその後の同じサイトへの要求に Cookie ヘッダーで自動で付け、Rails は復号して user_id 42 の利用者として処理する。別のサイトのページがこのサイトへ POST を送らせた場合、samesite=lax の Cookie は付かないが、同じドメインの別のサブドメインのページからなら付く。そのため Rails は CSRF のトークンでも確かめる"
    >
      <T x={60} y={20} anchor="middle" bold fs={12.5}>
        ブラウザー
      </T>
      <T x={720} y={20} anchor="middle" bold fs={12.5}>
        Rails
      </T>
      <line x1={60} y1={32} x2={60} y2={200} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={720} y1={32} x2={720} y2={200} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {msgs.map((m) => (
        <g key={m.t}>
          <Arrow x1={m.back ? 716 : 64} y1={m.y} x2={m.back ? 64 : 716} y2={m.y} dashed={m.back} />
          <T x={76} y={m.y - 10} fs={10.5}>
            {m.t}
          </T>
        </g>
      ))}
      <Box x={20} y={220} w={240} h={56} lines={['別のサイトのページ', 'このサイトへ POST を送らせる']} fs={11.5} fill="bg" subTone="danger" />
      <Arrow x1={260} y1={248} x2={318} y2={248} />
      <Box x={320} y={214} w={440} h={68} lines={['samesite=lax の Cookie は、別のサイトからの POST には付かない', '同じドメインの別のサブドメインのページからなら付く', '→ Rails は CSRF のトークンでも確かめる']} fs={11} fill="box" subTone="muted" />
      <T x={20} y={310} fs={11} tone="muted">
        Cookie は、受け取ったサイトへの要求に、ブラウザーが自動で付けて送る
      </T>
    </Svg>
  )
}

/* ---------- 図 21-3 入力が SQL や HTML として解釈される ---------- */
function InjectionFigure() {
  return (
    <Svg
      id="21-3"
      w={780}
      h={300}
      label="SQL の例では、WHERE (article_id = の後ろに入力を埋め込む。入力が 1 なら article_id = 1 で8件、入力が 1 OR 1=1 なら条件が常に真になり2975件が返る。値として渡すと article_id = 1 のままで8件。HTML の例では、入力の script タグを <%= %> で出すと &lt;script&gt; に変わって文字として表示され、raw で出すと script タグのまま出力されてブラウザーが実行する"
    >
      <T x={20} y={20} bold>
        SQL に埋め込む
      </T>
      <Box x={20} y={34} w={250} h={40} lines={'WHERE (article_id = 入力)'} mono fs={11} fill="box" />
      <Arrow x1={270} y1={54} x2={298} y2={54} />
      <Box x={300} y={30} w={300} h={22} lines={'入力 "1" → article_id = 1'} mono fs={10.5} fill="box4" />
      <T x={610} y={41} fs={11}>
        8 件
      </T>
      <Box x={300} y={56} w={300} h={22} lines={'入力 "1 OR 1=1" → 常に真'} mono fs={10.5} fill="bg" accent />
      <T x={610} y={67} fs={11} tone="danger">
        2975 件（全部）
      </T>
      <Box x={20} y={92} w={250} h={30} lines={'where(article_id: 入力)'} mono fs={11} fill="box5" />
      <Arrow x1={270} y1={107} x2={298} y2={107} />
      <Box x={300} y={96} w={300} h={22} lines={'"1 OR 1=1" → 整数の 1 に変換'} mono fs={10.5} fill="box4" />
      <T x={610} y={107} fs={11}>
        8 件
      </T>
      <T x={20} y={160} bold>
        HTML に出力する
      </T>
      <Box x={20} y={174} w={250} h={40} lines={'入力 <script>alert("XSS")</script>'} mono fs={10.5} fill="box" />
      <Arrow d="M270,186 L298,186" />
      <Arrow d="M270,204 L285,204 L285,242 L298,242" />
      <Box x={300} y={172} w={300} h={30} lines={'<%= %> → &lt;script&gt;…'} mono fs={10.5} fill="box5" />
      <T x={610} y={187} fs={11}>
        文字として表示
      </T>
      <Box x={300} y={228} w={300} h={30} lines={'<%= raw %> → <script>…'} mono fs={10.5} fill="bg" accent />
      <T x={610} y={243} fs={11} tone="danger">
        ブラウザーが実行
      </T>
      <T x={20} y={286} fs={11} tone="muted">
        入力の中の記号が SQL の命令や HTML のタグとして解釈されると、入力した人が SQL やページの動作を変えられる
      </T>
    </Svg>
  )
}

/* ---------- 図 21-5 CSRF トークンの発行と検証 ---------- */
function CsrfFigure() {
  return (
    <Svg
      id="21-5"
      w={780}
      h={330}
      label="ページを描画するとき、Rails はセッションに保存した32バイトのトークンを取り出す（無ければ作る）。毎回新しい32バイトのランダムなパッドを作り、トークンとの XOR を取ってパッドの後ろにつなぎ、Base64 にしてフォームの隠しフィールドと csrf-token のメタタグに入れる。POST を受けると、パラメーターの authenticity_token か X-CSRF-Token ヘッダーの値を Base64 で戻し、前半のパッドと後半の XOR を取ってトークンを復元し、セッションのトークンと比べる。Origin ヘッダーがあれば、要求の URL のオリジンと一致するかも確かめる。一致しなければ 422 になる。攻撃者のサイトはセッションのトークンを読めないので、正しい値を送れない"
    >
      <T x={20} y={20} bold>
        発行（GET でページを描画）
      </T>
      <Box x={20} y={34} w={200} h={46} lines={['セッション', '_csrf_token（32 バイト）']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow x1={220} y1={57} x2={258} y2={57} />
      <Box x={260} y={34} w={250} h={46} lines={['パッド（毎回ランダム 32 バイト）', '+ パッド XOR トークン → Base64']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={510} y1={57} x2={548} y2={57} />
      <Box x={550} y={26} w={210} h={62} lines={['<input name="authenticity_token">', '<meta name="csrf-token">', '（描画のたびに値が変わる）']} mono fs={10} fill="box5" subTone="muted" />
      <T x={20} y={130} bold>
        検証（POST などを受けたとき）
      </T>
      <Box x={20} y={146} w={220} h={46} lines={['authenticity_token パラメーター', 'または X-CSRF-Token ヘッダー']} fs={11} fill="box5" subTone="muted" />
      <Arrow x1={240} y1={169} x2={278} y2={169} />
      <Box x={280} y={146} w={230} h={46} lines={['Base64 を戻し、前半と後半の', 'XOR でトークンを復元']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={510} y1={169} x2={548} y2={169} />
      <Box x={550} y={146} w={210} h={46} lines={['セッションのトークンと比較', '（一定時間の比較）']} fs={11} fill="box" subTone="muted" />
      <Box x={280} y={216} w={230} h={46} lines={['Origin ヘッダーがあれば', 'request.base_url と一致するか']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={395} y1={192} x2={395} y2={214} />
      <Arrow x1={510} y1={239} x2={548} y2={239} />
      <Box x={550} y={216} w={210} h={46} lines={['不一致なら 422', 'InvalidAuthenticityToken']} fs={11} fill="bg" subTone="danger" />
      <T x={20} y={300} fs={11} tone="muted">
        攻撃者のサイトのページは、利用者のセッションのトークンも、このサイトの HTML も読めないので、正しい値を送れない
      </T>
    </Svg>
  )
}

/* ---------- 図 21-4 セキュリティ対策の適用箇所 ---------- */
function WhereFigure() {
  const rows = [
    { t: 'ミドルウェア', items: 'HostAuthorization（Host ヘッダー）、SSL（HTTPS への転送・HSTS・secure 属性）', fill: 'box' as const },
    { t: 'セッション・Cookie', items: '署名・暗号化（secret_key_base から鍵を作る）', fill: 'box' as const },
    { t: 'コントローラー', items: 'CSRF の検証（before_action）、Strong Parameters', fill: 'box2' as const },
    { t: 'モデル・Relation', items: 'プレースホルダーと値のクォート、order の列名の検査', fill: 'box' as const },
    { t: 'ビュー', items: '<%= %> の自動エスケープ、sanitize、to_json のエスケープ', fill: 'box' as const },
    { t: '応答ヘッダー', items: 'Content-Security-Policy（既定では未設定）', fill: 'bg' as const },
  ]
  return (
    <Svg
      id="21-4"
      w={780}
      h={rows.length * 48 + 30}
      label="要求が通る順に、セキュリティ対策の適用箇所を並べた。ミドルウェアでは HostAuthorization が Host ヘッダーを、SSL が HTTPS への転送と HSTS と Cookie の secure 属性を受け持つ。セッションと Cookie は secret_key_base から作った鍵で署名・暗号化される。コントローラーでは CSRF の検証と Strong Parameters、モデルではプレースホルダーと order の列名の検査、ビューでは自動エスケープ、応答ヘッダーでは Content-Security-Policy を使う。CSP は既定では設定されていない"
    >
      {rows.map((r, i) => {
        const y = 14 + i * 48
        return (
          <g key={r.t}>
            <Box x={20} y={y} w={170} h={38} lines={r.t} fs={12} bold fill={r.fill} />
            <T x={206} y={y + 19} fs={11.5}>
              {r.items}
            </T>
            {i < rows.length - 1 && <Arrow x1={105} y1={y + 38} x2={105} y2={y + 48} />}
          </g>
        )
      })}
    </Svg>
  )
}

const ch21: Chapter = {
  number: 21,
  part: 4,
  title: 'セキュリティ',
  summary:
    '利用者が送る値は自由に作れることと、Cookie とセッションでログイン状態を保つ仕組みを確かめ、一括代入・CSRF・XSS・SQL インジェクションがどんな攻撃かをデモで見てから、それらへの Rails の対策が、要求を処理するどの段階で適用されるかを、デモアプリケーションでの実測とソースで確かめます。secret_key_base と credentials、Host Authorization・force_ssl・CSP、Brakeman などの検査ツールも扱います。',
  goals: [
    '要求の URL・ヘッダー・Cookie・フォームの値を送る側が自由に作れることと、一括代入で起きることを説明できる',
    'Cookie とセッションでログイン状態を保つ仕組みと、それを利用する CSRF、入力が HTML や SQL として解釈される XSS と SQL インジェクションを、例を挙げて説明できる',
    'CSRF トークンの発行・マスク・検証の流れと、Origin の検査を説明できる',
    'link_to の href や to_json など、自動エスケープの外側で XSS を防ぐ方法を説明できる',
    'プレースホルダーと文字列への埋め込みの違い、order に生の文字列を渡したときの例外を説明できる',
    'secret_key_base から Cookie などの鍵が作られることと、credentials の仕組みを説明できる',
    'Host Authorization・force_ssl・CSP がどのミドルウェアや設定で有効になるかを説明できる',
    'Brakeman と bundler-audit で検出できるものを説明できる',
  ],
  prerequisites: [6, 10, 12, 16],
  sections: [
    {
      id: 'untrusted-input',
      title: '利用者が送る値は自由に作れる',
      body: (
        <>
          <p>
            Web アプリケーションへの攻撃とは、作り手が想定していない要求を送って、他人のデータを読んだり書き換えたり、許されていない操作をしたりすることです。攻撃の多くは、利用者から届いた値を、アプリケーションがそのまま信用して使うところから起きます。
          </p>
          <p>
            ブラウザーで記事のフォームを送ると、フォームにある欄の値だけが送られます。しかし、要求を送るのはブラウザーだけではありません。curl のようなコマンドやプログラムを使えば、フォームに無い欄の値も、好きなヘッダーも付けて送れます。デモの、送られた値をそのまま返すアクションに、curl
            で要求を送りました。
          </p>
          <Code
            lang="text"
            title="curl で送った要求と応答、開発環境のログ（Rails 8.1.4.1）"
            code={`
$ curl -X POST 'http://127.0.0.1:3300/probe/echo/hello' \\
    -d 'article[title]=下書きの記事' -d 'article[status]=published' \\
    -H 'User-Agent: my-script/1.0' -H 'Referer: https://example.com/admin'
{"article":{"title":"下書きの記事","status":"published"},"controller":"probe","action":"echo","title":"hello"}

Started POST "/probe/echo/hello" for 172.29.0.1 at 2026-11-16 07:10:04 +0000
Processing by ProbeController#echo as */*
  Parameters: {"article" => {"title" => "下書きの記事", "status" => "published"}, "title" => "hello"}
`}
          />
          <p>
            フォームに status（公開の状態）の欄が無くても、<code>article[status]=published</code> を送ればサーバーに届きます。User-Agent（使っているブラウザーの名前を伝えるヘッダー）や
            Referer（どのページから来たかを伝えるヘッダー）も、送る側が決めた値です。要求の URL・ヘッダー・Cookie・フォームの値はどれも、送る側が自由に作れます（図 21-1）。
          </p>
          <p>
            受け取った値をまとめてモデルに渡すことを一括代入と呼びます。一括代入では、作り手が変えさせるつもりのない列まで変わることがあります。デモの Article には status（draft・published・archived）の列があります。下書きを作るフォームに
            title の欄しか無くても、送られた値をすべてモデルに渡すと、公開の状態の記事が作られます。rails runner で確かめました。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行したコード"
            code={`
params = ActionController::Parameters.new(article: { title: "下書きの記事", status: "published" })
begin
  Article.new(params[:article])
rescue => e
  puts "そのまま渡す: #{e.class}"
end
a = Article.new(params[:article].permit!)
puts "permit! で全部を許可: status=#{a.status}"
b = Article.new(params.expect(article: [:title]))
puts "title だけを許可:     status=#{b.status}"
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
そのまま渡す: ActiveModel::ForbiddenAttributesError
permit! で全部を許可: status=published
title だけを許可:     status=draft
`}
          />
          <p>
            Rails は許可していない params をそのままモデルに渡すと ActiveModel::ForbiddenAttributesError にします
            <Ref n={11} />。<code>permit!</code> で全部を許可すると status も入り、公開の状態の記事になりました。<code>expect(article: [:title])</code> で受け取る属性を title
            だけにすると、status は既定値の draft のままでした。受け取る属性をコントローラーで1つずつ決めるこの仕組みを Strong Parameters と呼びます（<ChapterLink n={10} section="params" />
            ）。
          </p>
          <Figure n="21-1" title="要求の中の値はすべて送る側が決める" caption="デモで curl から送った要求と、そのときのログをもとにした模式図。">
            <RequestPartsFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'cookie-session',
      title: 'Cookie・セッション・ログイン状態',
      body: (
        <>
          <p>
            HTTP の要求は1回ごとに独立していて、サーバーは要求の中身だけでは、前の要求と次の要求が同じ利用者からのものかを区別できません。そこで Cookie を使います。Cookie は、サーバーが応答の
            Set-Cookie ヘッダーで渡した名前と値をブラウザーが保存し、同じサイトへのその後の要求の Cookie ヘッダーに付けて送り返す仕組みです
            <Ref n={6} />。
          </p>
          <p>デモには、セッションに <code>user_id = 42</code> を入れるだけのアクションがあります。ログインの代わりにこれを curl で要求しました。</p>
          <Code
            lang="text"
            title="curl -i http://127.0.0.1:3300/probe/login の応答（ヘッダーの一部と Cookie の値の一部を省略）"
            code={`
HTTP/1.1 200 OK
content-type: text/html
set-cookie: _demo_session=wsW1G2t12Srsb20sUHoWjIPduEuDQ5idtOCMpeNFoPBXwqNgUaWiDEE6L67%2F8e6m…--bhtZ7rrWUvZPYsGdQ6LeQA%3D%3D; path=/; httponly; samesite=lax
`}
          />
          <p>
            セッションは、Rails が Cookie を使って、要求をまたいで値を覚えておく仕組みです。コントローラーで <code>session[:user_id] = 42</code> のように書きます。Rails
            は既定では、セッションの中身全体を暗号化して、_demo_session という名前の Cookie に入れます（<ChapterLink n={10} section="cookies-session" />
            ）。この Cookie の値を、Rails の鍵で復号しました。
          </p>
          <Code
            lang="text"
            title="bin/rails runner で Cookie の値を復号した結果"
            code={`
Cookie の値の長さ: 372 バイト
サーバーが復号した中身: {"session_id" => "7edf16ecb96eb9b6d02af63f8358e77b", "user_id" => 42, "flash" => {"discard" => [], "flashes" => {"notice" => "ログインしました"}}}
1文字を書き換えた値: nil
`}
          />
          <p>
            Cookie の値はブラウザーの開発者ツールなどで見えますが、暗号化されているので中身は読めません。値を1文字でも書き換えると Rails は復号できず、空のセッションとして扱います。user_id を書き換えて他人になりすますことはできません。この
            Cookie を付けて別のページを要求すると、curl も Cookie ヘッダーで値を送り返しました。
          </p>
          <Code
            lang="text"
            title="curl -v -b '_demo_session=…' http://127.0.0.1:3300/articles/1 で送った要求の先頭（値を省略）"
            code={`
> GET /articles/1 HTTP/1.1
> Host: 127.0.0.1:3300
> Cookie: _demo_session=wsW1G2t12Srsb20sUHoWjIPduEuDQ5idtOCMpeNFoPBXwqNgUaWiDEE6L67%2F8e6m…
`}
          />
          <p>
            ログインした状態はこの仕組みで保ちます。ログインに成功したら、サーバーは利用者を区別する値を Cookie に入れ、その後の要求では Cookie の値から利用者を決めます（図
            21-2）。Rails 8 の <code>bin/rails generate authentication</code> が作るコードも、ログインのたびにデータベースの sessions テーブルに行を作り、その id を署名付きの Cookie
            に入れます
            <Ref n={10} />。
          </p>
          <Code
            lang="ruby"
            title="bin/rails generate authentication が作る app/controllers/concerns/authentication.rb（抜粋）"
            href={`${GH}/railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt`}
            code={`
    def find_session_by_cookie
      Session.find_by(id: cookies.signed[:session_id]) if cookies.signed[:session_id]
    end

    def start_new_session_for(user)
      user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
        Current.session = session
        cookies.signed.permanent[:session_id] = { value: session.id, httponly: true, same_site: :lax }
      end
    end
`}
          />
          <p>
            ブラウザーは Cookie を受け取ったサイトへの要求に、その Cookie を自動で付けます。利用者がログインしたまま別のサイトを開き、そのページがこのサイトへ POST
            を送らせた場合にも、条件によっては Cookie が付きます。サーバーから見ると、ログイン中の利用者が自分で送った要求と区別がつきません。これを利用した攻撃を CSRF（クロスサイトリクエストフォージェリ）と呼びます。たとえば攻撃者のページに次の
            HTML があると、開いた利用者のブラウザーが、記事1へのコメントを自動で送信します。
          </p>
          <Code
            lang="html"
            title="攻撃者のサイト（https://evil.example）のページの例"
            code={`
<form action="http://localhost:3300/articles/1/comments" method="post">
  <input type="hidden" name="comment[body]" value="攻撃者が書かせたコメント">
</form>
<script>document.forms[0].submit()</script>
`}
          />
          <p>
            上の set-cookie の <code>samesite=lax</code> は、別のサイトのページから送られる POST にはこの Cookie を付けないように、ブラウザーに指示する属性です
            <Ref n={7} />。Rails は load_defaults 6.1 以降、Cookie に既定でこの属性を付けます
            <Ref n={9} />。ただし SameSite の「サイト」は example.com のようなドメインの単位で、同じドメインの別のサブドメイン（blog.example.com と app.example.com など）のページは同じサイトとして扱われ、Cookie
            が付きます
            <Ref n={8} />。そのため Rails はこの属性だけに頼らず、「CSRF の対策」の節で見るトークンでも要求を確かめます。<code>httponly</code> はページの JavaScript からこの Cookie
            を読めないようにする属性です
            <Ref n={7} />。
          </p>
          <Figure n="21-2" title="Cookie によるログイン状態と、別のサイトからの要求" caption="デモでの curl の実測（set-cookie、Cookie の復号）と、MDN の Set-Cookie の説明をもとにした模式図。">
            <CookieFlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'injection',
      title: '入力が HTML や SQL として解釈される',
      body: (
        <>
          <p>
            アプリケーションは、利用者が入力した文字列を、HTML の一部として画面に出したり、SQL の一部としてデータベースに送ったりします。入力の中の記号が HTML のタグや SQL
            の命令として解釈されると、入力した人がページや SQL の動作を変えられます。
          </p>
          <p>
            まず HTML の例です。コメントの本文に <code>{'<script>alert("XSS")</script>'}</code> と書かれていた場合を、ERB の2通りの書き方で描画しました。
          </p>
          <Code
            lang="text"
            title="ApplicationController.render(inline: …) で描画した結果（bin/rails runner）"
            code={`
<%= body %>      → &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
<%= raw body %>  → <script>alert("XSS")</script>
`}
          />
          <p>
            <code>{'<%= %>'}</code> は、<code>{'<'}</code>・<code>{'>'}</code>・<code>"</code> を <code>&amp;lt;</code> などの文字参照（記号をそのまま文字として表示させる
            HTML の書き方）に変えて出力しました。これをエスケープと呼び、ブラウザーは入力を文字として表示します（<ChapterLink n={16} section="escape" />
            ）。<code>raw</code> を付けるとエスケープされず、ブラウザーは script タグとして JavaScript を実行します。コメントを読んだほかの利用者のブラウザーで、攻撃者が書いた JavaScript
            が動くことになります。このスクリプトはそのページの内容を読んだり、利用者のブラウザーから要求を送ったりできます。この攻撃を XSS（クロスサイトスクリプティング）と呼びます
            <Ref n={1} />。
          </p>
          <p>次は SQL の例です。記事の id でコメントを絞り込む SQL を、入力の文字列を埋め込んで作りました。</p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行したコード"
            code={`
[ "1", "1 OR 1=1" ].each do |input|
  rel = Comment.where("article_id = #{input}")
  puts "入力 #{input.inspect}"
  puts "  SQL: #{rel.to_sql}"
  puts "  件数: #{rel.count}"
end
puts "コメントの総数: #{Comment.count}"
rel = Comment.where(article_id: "1 OR 1=1")
puts "値として渡す: #{rel.to_sql} 件数: #{rel.count}"
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
入力 "1"
  SQL: SELECT \`comments\`.* FROM \`comments\` WHERE (article_id = 1)
  件数: 8
入力 "1 OR 1=1"
  SQL: SELECT \`comments\`.* FROM \`comments\` WHERE (article_id = 1 OR 1=1)
  件数: 2975
コメントの総数: 2975
値として渡す: SELECT \`comments\`.* FROM \`comments\` WHERE \`comments\`.\`article_id\` = 1 件数: 8
`}
          />
          <p>
            入力が "1" なら、記事1のコメント8件が返ります。入力が "1 OR 1=1" だと条件が <code>article_id = 1 OR 1=1</code> になり、<code>1=1</code>{' '}
            は常に真なので、すべての行が条件に当てはまって、全部のコメント（2975件）が返りました。同じ条件で <code>delete_all</code> を呼べば、すべてのコメントが消えます。入力が SQL
            の命令の一部として解釈されたためで、この攻撃を SQL インジェクションと呼びます
            <Ref n={1} />。<code>where(article_id: 入力)</code> のように値として渡すと、Rails は入力を article_id の値として扱います。article_id は整数の列なので、入力は整数に変換されて 1
            になり、条件の形は変わりませんでした（図 21-3）。
          </p>
          <p>
            一括代入、CSRF、XSS、SQL インジェクションのどれも、利用者から届いた値や要求を、アプリケーションが確かめずに使うことで起きます。Rails はそれぞれに対策を用意していて、多くは既定で有効です。次の節では、それらの対策が要求を処理するどの段階で行われるかを見ます。
          </p>
          <Figure n="21-3" title="入力が SQL や HTML として解釈される" caption="デモ（Rails 8.1.4.1、MySQL 8.4）での bin/rails runner の実測をもとにした模式図。">
            <InjectionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'overview',
      title: 'セキュリティ対策の適用箇所',
      body: (
        <>
          <p>
            Rails の主なセキュリティ対策は、要求の処理の各段に分かれています（図 21-4）。多くは既定で有効ですが、設定が必要なものや、コードの書き方によって保護が働かなくなるものもあります。この章では、デモのアプリケーション（開発環境）で、攻撃を防げる例と、保護が働かなくなるコードの書き方を確かめます。全体はセキュリティのガイド
            <Ref n={1} />
            にまとめられています。
          </p>
          <Figure n="21-4" title="セキュリティ対策の適用箇所" caption="Rails 8.1.4.1 の default_middleware_stack.rb・request_forgery_protection.rb などと Securing Rails Applications（ガイド）をもとにまとめた図。">
            <WhereFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>攻撃</th>
                  <th>Rails の対策</th>
                  <th>外れる書き方の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CSRF</td>
                  <td>トークンと Origin の検証</td>
                  <td>GET で状態を変える、skip_forgery_protection</td>
                </tr>
                <tr>
                  <td>XSS</td>
                  <td>ビューの自動エスケープ</td>
                  <td>raw・html_safe、link_to の href に利用者の値</td>
                </tr>
                <tr>
                  <td>SQL インジェクション</td>
                  <td>プレースホルダーと Hash の条件</td>
                  <td>where や order への文字列の埋め込み、Arel.sql</td>
                </tr>
                <tr>
                  <td>一括代入</td>
                  <td>Strong Parameters</td>
                  <td>permit! や、admin のような列の permit</td>
                </tr>
                <tr>
                  <td>Host ヘッダーの偽装</td>
                  <td>HostAuthorization</td>
                  <td>本番環境で config.hosts を設定しない</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'csrf',
      title: 'CSRF の対策',
      body: (
        <>
          <p>
            CSRF（<Term en="Cross-Site Request Forgery">クロスサイトリクエストフォージェリ</Term>）は、利用者がログインしたまま別のサイトを開いたときに、そのサイトのページから利用者のブラウザーに POST などを送らせる攻撃です。ブラウザーは Cookie
            を自動で付けるので、セッションだけでは本人の操作か区別できません。Rails は、ページに埋め込んだトークンを POST などで送り返させて、それを確かめます。デモで、コメントのフォームのページを2回表示し、POST を4通り送りました。
          </p>
          <Code
            lang="text"
            code={`
  meta(1回目)=VaBI7h8i7LnCviLIz-ivgAun…  form=xFLohoeW5vb0BxihuffndPyn…  meta(2回目)=POCIG47HuFj6TFde345ykewz…
  デコード後の長さ=64 バイト（パッド32 + 暗号化したトークン32）
  トークンなし         => 422
  フォームのトークン   => 302 http://localhost/articles/1
  X-CSRF-Token（2回目のmeta） => 302
  正しいトークン + Origin: https://evil.example => 422
  forgery_protection_origin_check=true per_form_csrf_tokens=true
    log: HTTP Origin header (https://evil.example) didn't match request.base_url (http://localhost)
`}
          />
          <p>
            トークンは表示のたびに値が変わりますが、どれも受け付けられました。セッションに保存した1つのトークンを、毎回違うランダムな値（パッド）で隠して出力しているからです。デモの設定は <code>per_form_csrf_tokens=true</code> なので、フォームのトークンは送信先のアクションとメソッドごとに作られ、メタタグのトークンはどの送信先にも使えます。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_controller/metal/request_forgery_protection.rb（470〜473行目、546〜551行目、635〜643行目）"
            href={`${GH}/actionpack/lib/action_controller/metal/request_forgery_protection.rb#L470-L473`}
            code={`
      def verified_request? # :doc:
        request.get? || request.head? || !protect_against_forgery? ||
          (valid_request_origin? && any_authenticity_token_valid?)
      end

      def mask_token(raw_token) # :doc:
        one_time_pad = SecureRandom.random_bytes(AUTHENTICITY_TOKEN_LENGTH)
        encrypted_csrf_token = xor_byte_strings(one_time_pad, raw_token)
        masked_token = one_time_pad + encrypted_csrf_token
        encode_csrf_token(masked_token)
      end

      def valid_request_origin? # :doc:
        if forgery_protection_origin_check
          # We accept blank origin headers because some user agents don't send it.
          raise InvalidAuthenticityToken, NULL_ORIGIN_MESSAGE if request.origin == "null"
          request.origin.nil? || request.origin == request.base_url
        else
          true
        end
      end
`}
          />
          <p>
            毎回値を変えるのは、HTTPS の圧縮を利用して秘密の値を推測する攻撃（BREACH）への対策です（ソースのコメント）。GET と HEAD は検証されないので、GET で状態を変える処理を作ると CSRF の対策が効きません。
            <code>forgery_protection_origin_check</code> は <code>load_defaults 5.0</code> 以降で true になり、Origin ヘッダーがあれば要求の URL のオリジンと一致するかも確かめます
            <Ref n={2} />。Turbo（<ChapterLink n={17} />
            ）は、メタタグのトークンを X-CSRF-Token ヘッダーに入れて送ります。
          </p>
          <p>
            検証に失敗すると、<code>load_defaults 5.2</code> 以降の既定（<code>default_protect_from_forgery</code> により ActionController::Base に <code>protect_from_forgery with: :exception</code> が付く）により InvalidAuthenticityToken になり、ShowExceptions が 422
            にします（<ChapterLink n={10} section="exceptions" />
            ）。ALB（AWS のロードバランサー）などで HTTPS を終端していて Rails が要求を http と判断すると、ブラウザーの Origin（https://…）と <code>request.base_url</code>（http://…）が一致せず、正しいトークンでも 422 になります。この切り分けは
            <ChapterLink n={25} />で扱います。
          </p>
          <Figure n="21-5" title="CSRF トークンの発行と検証" caption="Rails 8.1.4.1 の request_forgery_protection.rb を読み、デモでの実測で確かめてまとめた模式図。">
            <CsrfFigure />
          </Figure>
          <Callout kind="note" title="開発中のバージョンでの Sec-Fetch-Site の検査">
            <p>
              Rails の開発中のブランチ（未リリース）の request_forgery_protection.rb には、ブラウザーが送る <code>Sec-Fetch-Site</code> ヘッダー（same-origin・same-site・cross-site
              など）で要求の出どころを確かめ、トークンを使わない検証方法が追加されています
              <Ref n={3} />。8.1.4.1 には無く、まだリリースされていない内容なので、今後のバージョンで変わる可能性があります。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'xss',
      title: 'XSS の対策',
      body: (
        <>
          <p>
            <ChapterLink n={16} section="escape" />
            で見たとおり、<code>{'<%= %>'}</code> は html_safe? でない値をエスケープします。ただし、エスケープは「HTML の本文に文字列を入れる」場面の対策で、それ以外の場面では足りません。デモで確かめました。
          </p>
          <Code
            lang="text"
            code={`
  link_to("x", "javascript:alert(1)") => <a href="javascript:alert(1)">x</a>
  { s: "</script><script>" }.to_json => {"s":"\\u003c/script\\u003e\\u003cscript\\u003e"}
  CSP ヘッダー: nil
`}
          />
          <p>
            <code>link_to</code> は href の値の <code>"</code> などはエスケープしますが、<code>javascript:</code> で始まる URL はそのまま出力しました。利用者が入力した URL をリンクにする場合は、
            <code>http</code> か <code>https</code> で始まることを確かめてから使います。一方、<code>to_json</code> は <code>{'<'}</code> と <code>{'>'}</code> を{' '}
            <code>\u003c</code> などに変えるので、<code>{'<script>'}</code> の中に JSON を埋め込んでもタグが閉じられません（ActiveSupport の{' '}
            <code>escape_html_entities_in_json</code>、既定で true）。
          </p>
          <p>
            Content-Security-Policy（CSP）は、ブラウザーに実行してよいスクリプトの出どころを指示するヘッダーで、エスケープ漏れがあっても被害を抑えられます。新規のアプリケーションの
            <code>config/initializers/content_security_policy.rb</code> は全体がコメントになっていて、デモでもヘッダーは出力されていませんでした。設定するときは、importmap のインラインのスクリプトのために nonce
            を使います
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'sqli',
      title: 'SQL インジェクションの対策',
      body: (
        <>
          <p>
            <ChapterLink n={12} section="arel" />
            で見たとおり、mysql2 のアダプターは値をクォートして SQL の文字列に入れます。値として渡せばクォートされますが、文字列に埋め込むとクォートされません。
          </p>
          <Code
            lang="text"
            code={`
x = "' OR '1'='1"
  文字列に埋め込む : SELECT \`articles\`.* FROM \`articles\` WHERE (title = '' OR '1'='1')
  プレースホルダー : SELECT \`articles\`.* FROM \`articles\` WHERE (title = '\\' OR \\'1\\'=\\'1')
  Hash の条件      : SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`title\` = '\\' OR \\'1\\'=\\'1'
  件数: 埋め込み=10004 プレースホルダー=0
  order に生の文字列 => ActiveRecord::UnknownAttributeReference: Dangerous query method (method whose arguments are used as raw SQL) called with non-attribute argument(s): "title; DROP TABLE articles".
  order(params の値を列名として) => ActiveRecord::UnknownAttributeReference
  sanitize_sql_like => 100\\%\\_off
`}
          />
          <p>
            埋め込んだ場合は条件が常に真になり、全件（10004件）が返りました。<code>order</code> や <code>pluck</code> は、列名として解釈できない文字列を渡すと例外を投げます。並び順を利用者に選ばせる場合は、許可する列名の一覧と照らし合わせてから渡します。
            <code>Arel.sql</code> で包むとこの検査を外せますが、利用者の値を入れてはいけません。LIKE の検索では、<code>sanitize_sql_like</code> で <code>%</code> と <code>_</code> をエスケープします
            <Ref n={1} />。
          </p>
          <p>
            一括代入については、<ChapterLink n={10} section="params" />
            の Strong Parameters が対策です。<code>params.expect(comment: [:body])</code> のように受け取る属性を列挙し、管理者かどうかを表す列などを利用者が変えられないようにします。
          </p>
        </>
      ),
    },
    {
      id: 'secrets',
      title: 'secret_key_base と credentials',
      body: (
        <>
          <p>
            <ChapterLink n={10} section="cookies-session" />
            の署名・暗号化された Cookie の鍵は、<code>secret_key_base</code> から <code>Rails.application.key_generator</code>（PBKDF2）で用途ごとに作られます。署名付きの ID（ActiveStorage の
            URL、<ChapterLink n={19} section="serving" />
            ）や Turbo のストリーム名（<ChapterLink n={17} section="broadcast" />
            ）も同じ鍵から作られます。
          </p>
          <Code
            lang="text"
            code={`
  secret_key_base の出どころ（開発環境）: tmp/local_secret.txt 長さ=128
  credentials のキー: [:secret_key_base]
  key_generator.generate_key("authenticated encrypted cookie", 32) => 7f09ac6111ab53e5…
`}
          />
          <p>
            開発環境とテスト環境では、secret_key_base は tmp/local_secret.txt に自動で作られます。本番環境では、環境変数 <code>SECRET_KEY_BASE</code> か credentials の値を使います。credentials
            は config/credentials.yml.enc に暗号化して保存され、復号の鍵は config/master.key か環境変数 <code>RAILS_MASTER_KEY</code> で渡します
            <Ref n={1} />。master.key はリポジトリーに入れません。
          </p>
          <p>
            secret_key_base を変えると、それから作られたすべての鍵が変わります。既存のセッションの Cookie は読めなくなって全員がログアウトし、すでに配った署名付きの URL やストリーム名も無効になります。
          </p>
        </>
      ),
    },
    {
      id: 'host-ssl-csp',
      title: 'Host Authorization と force_ssl',
      body: (
        <>
          <p>HostAuthorization と SSL のミドルウェアは、設定があるときだけミドルウェアのスタックに入ります。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/default_middleware_stack.rb（16〜27行目から抜粋）"
            href={`${GH}/railties/lib/rails/application/default_middleware_stack.rb#L16-L27`}
            code={`
          unless Array(config.hosts).empty?
            middleware.use ::ActionDispatch::HostAuthorization, config.hosts, **config.host_authorization
          end

          if config.assume_ssl
            middleware.use ::ActionDispatch::AssumeSSL
          end

          if config.force_ssl
            middleware.use ::ActionDispatch::SSL, **config.ssl_options,
`}
          />
          <p>
            開発環境の <code>config.hosts</code> は localhost などを許可する一覧で、それ以外の Host の要求は 403 になりました。本番環境の既定値は空の配列で、HostAuthorization
            は入りません。Host ヘッダーは、コントローラーやビューでの URL の生成（<code>redirect_to</code> や <code>*_url</code> のヘルパー）に使われるので、本番環境でも <code>config.hosts</code> を設定します。
          </p>
          <Code
            lang="text"
            code={`
  Host: evil.example => 403 Blocked hosts: evil.example

（ActionDispatch::SSL を直接呼ぶ）
  http  => 301 location=https://example.com/articles?x=1
  https => 200 strict-transport-security=max-age=31556952; includeSubDomains   ← hsts: { expires: 1.year } を渡したので1年 set-cookie=["_s=1; path=/; httponly; secure"]
  http + X-Forwarded-Proto: https => 200
`}
          />
          <p>
            <code>config.force_ssl = true</code> で入る ActionDispatch::SSL は、http の要求を https に 301 で転送し、https の応答に HSTS のヘッダーを付け、Cookie に secure
            属性を付けます。HSTS の max-age の既定値は2年（63072000 秒、ssl.rb の <code>HSTS_EXPIRES_IN</code>）で、上の実測では1年を指定しています。X-Forwarded-Proto が https なら https の要求として扱います。ロードバランサーで HTTPS を終端する構成では、このヘッダーの受け渡しを誤るとリダイレクトが繰り返されます（
            <ChapterLink n={25} />
            ）。新規のアプリケーションの本番環境の設定には、<code>config.assume_ssl = true</code>（すべての要求を https とみなす）と <code>force_ssl</code> の両方が入っています。
          </p>
        </>
      ),
    },
    {
      id: 'tools',
      title: '検査ツール',
      body: (
        <>
          <p>
            Brakeman はソースを解析してセキュリティ上の問題を探すツールです<Ref n={5} />。デモのアプリケーションでは警告はありませんでした。検査のために、危険な書き方のコントローラーとビューを一時的に追加して実行しました（確認後に削除）。
          </p>
          <Code
            lang="ruby"
            title="一時的に追加したコード"
            code={`
class VulnController < ApplicationController
  def search
    @articles = Article.where("title = '#{params[:q]}'")
  end

  def go
    redirect_to params[:url], allow_other_host: true
  end
end
# app/views/vuln/search.html.erb
# <%= link_to "戻る", params[:back] %>
# <%= raw params[:q] %>
`}
          />
          <Code
            lang="text"
            code={`
Security Warnings: 4
Cross-Site Scripting: 2
Redirect: 1
SQL Injection: 1

Confidence: High   Check: LinkToHref          Message: Unsafe parameter value in \`link_to\` href
Confidence: High   Check: CrossSiteScripting  Message: Unescaped parameter value
Confidence: High   Check: SQL                 Message: Possible SQL injection
Confidence: Weak   Check: Redirect            Message: Possible unprotected redirect
`}
          />
          <p>
            Brakeman は追加した4か所をすべて検出しました。bundler-audit は Gemfile.lock
            の gem のバージョンを、既知の脆弱性の一覧と照らし合わせます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 の rails new も Gemfile に brakeman を入れますが、bundler-audit と、これらをまとめて実行する config/ci.rb は 8.1 で追加されました
              <Ref n={4} />。この章で見た CSRF・エスケープ・SQL・Host Authorization・SSL の仕組みは 7.2.4 でも同じです。
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
          <li>要求の URL・ヘッダー・Cookie・フォームの値は、送る側が自由に作れます。受け取った値をまとめてモデルに渡すと、作り手が変えさせるつもりのない列まで変わるので、Strong Parameters で受け取る属性を決めます。</li>
          <li>Rails はセッションを暗号化して Cookie に入れ、ブラウザーはその Cookie を同じサイトへの要求に自動で付けます。別のサイトのページから送らせた要求にも Cookie が付く場合があり、これを利用するのが CSRF です。</li>
          <li>入力の記号が HTML のタグや SQL の命令として解釈されると、XSS や SQL インジェクションになります。&lt;%= %&gt; のエスケープと、SQL に値として渡す書き方で防ぎます。</li>
          <li>CSRF のトークンはセッションの値を毎回違うパッドで隠して出力され、POST などで送り返された値と Origin ヘッダーが検証されます。GET は検証されません。</li>
          <li>自動エスケープは HTML の本文の対策です。link_to の href の javascript: は防がないので、URL は自分で確かめます。CSP は既定では設定されていません。</li>
          <li>SQL には値をプレースホルダーか Hash で渡します。order などは列名でない文字列を拒否します。</li>
          <li>Cookie・署名付き ID・ストリーム名の鍵は secret_key_base から作られ、変えるとすべて無効になります。</li>
          <li>HostAuthorization と SSL のミドルウェアは設定したときだけ入ります。本番環境でも config.hosts を設定します。</li>
          <li>Brakeman はソースから危険な書き方を検出し、bundler-audit は gem の既知の脆弱性を検出します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Securing Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/security.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'CSRF・XSS・SQL インジェクション・一括代入・Host Authorization・CSP（nonce）・credentials。' },
    { title: 'actionpack/lib/action_controller/metal/request_forgery_protection.rb・railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/request_forgery_protection.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'verified_request?・mask_token・valid_request_origin?、load_defaults 5.0 の forgery_protection_origin_check と per_form_csrf_tokens。' },
    { title: 'actionpack/lib/action_controller/metal/request_forgery_protection.rb（開発中のブランチ）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/fec707f56360ce14b1a3c24b4be5e8f3bc84e12f/actionpack/lib/action_controller/metal/request_forgery_protection.rb', accessed: '2026-11-11', version: '未リリース（main、コミット fec707f）', note: 'Sec-Fetch-Site ヘッダーによる検証（header_only・header_or_legacy_token）。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/Gemfile.tt・config/ci.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/ci.rb.tt`, accessed: '2026-11-11', version: 'Rails 8.1.4.1（7.2.4 と比較）', note: '8.1 の rails new が bundler-audit と config/ci.rb（Brakeman・bundler-audit を実行）を生成すること。' },
    { title: 'Brakeman', publisher: 'Brakeman Project', url: 'https://brakemanscanner.org/', accessed: '2026-11-11', version: 'Brakeman 8.1.0', note: 'Rails のソースを静的に解析してセキュリティ上の問題を報告するツール（デモで実行）。' },
    { title: 'Using HTTP cookies', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies', accessed: '2026-11-16', note: 'サーバーが Set-Cookie で渡した Cookie をブラウザーが保存し、その後の要求の Cookie ヘッダーで送り返すこと。デモで curl により確認。' },
    { title: 'Set-Cookie', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie', accessed: '2026-11-16', note: 'SameSite=Lax の Cookie は、別のサイトからの要求のうち、安全なメソッドのトップレベルの移動にだけ付き、POST には付かないこと。HttpOnly は JavaScript から Cookie を読めなくすること。' },
    { title: 'Site（用語集）', publisher: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Site', accessed: '2026-11-16', note: 'サイトは登録できるドメインの単位（と通信方式）で決まり、同じドメインのサブドメインは同じサイトになること。' },
    { title: 'Configuring Rails Applications（cookies_same_site_protection）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/configuring.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'load_defaults 6.1 で config.action_dispatch.cookies_same_site_protection が :lax になること。デモの set-cookie にも samesite=lax が付いた。' },
    { title: 'railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/authentication/templates/app/controllers/concerns/authentication.rb.tt`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'start_new_session_for が sessions テーブルに行を作り、その id を cookies.signed.permanent[:session_id] に入れること。' },
    { title: 'Action Controller Overview（Strong Parameters）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_controller_overview.html', accessed: '2026-11-16', version: 'Rails 8.1', note: '許可せずに一括代入すると ActiveModel::ForbiddenAttributesError になること、expect と permit!。デモで実測。' },
  ],
}

export default withExplanations(ch21, explanation21)
