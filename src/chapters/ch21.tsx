import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 21-2 CSRF トークンの発行と検証 ---------- */
function CsrfFigure() {
  return (
    <Svg
      id="21-2"
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

/* ---------- 図 21-1 対策が効く場所 ---------- */
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
      id="21-1"
      w={780}
      h={rows.length * 48 + 30}
      label="要求が通る順に、対策が効く場所を並べた。ミドルウェアでは HostAuthorization が Host ヘッダーを、SSL が HTTPS への転送と HSTS と Cookie の secure 属性を受け持つ。セッションと Cookie は secret_key_base から作った鍵で署名・暗号化される。コントローラーでは CSRF の検証と Strong Parameters、モデルではプレースホルダーと order の列名の検査、ビューでは自動エスケープ、応答ヘッダーでは Content-Security-Policy が効く。CSP は既定では設定されていない"
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
    'CSRF・XSS・SQL インジェクション・一括代入などへの Rails の対策が、要求の処理のどこで効いているかを、デモアプリケーションでの実測とソースで確かめます。secret_key_base と credentials、Host Authorization・force_ssl・CSP、Brakeman などの検査ツールも扱います。',
  goals: [
    'CSRF トークンの発行・マスク・検証の流れと、Origin の検査を説明できる',
    'link_to の href や to_json など、自動エスケープの外側で XSS を防ぐ方法を説明できる',
    'プレースホルダーと文字列への埋め込みの違い、order に生の文字列を渡したときの例外を説明できる',
    'secret_key_base から Cookie などの鍵が作られることと、credentials の仕組みを説明できる',
    'Host Authorization・force_ssl・CSP がどのミドルウェアや設定で効くかを説明できる',
    'Brakeman と bundler-audit で検出できるものを説明できる',
  ],
  prerequisites: [6, 10, 12, 16],
  sections: [
    {
      id: 'overview',
      title: '対策が効く場所',
      body: (
        <>
          <p>
            Rails の主なセキュリティ対策は、要求の処理の各段に分かれています（図 21-1）。多くは既定で有効ですが、設定が必要なものや、コードの書き方によって保護が働かなくなるものもあります。この章では、デモのアプリケーション（開発環境）で、攻撃を防げる例と、保護が働かなくなるコードの書き方を確かめます。全体はセキュリティのガイド
            <Ref n={1} />
            にまとめられています。
          </p>
          <Figure n="21-1" title="対策が効く場所" caption="Rails 8.1.4.1 の default_middleware_stack.rb・request_forgery_protection.rb などと Securing Rails Applications（ガイド）をもとにまとめた図。">
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
            ）。ALB などで HTTPS を終端していて Rails が要求を http と判断すると、ブラウザーの Origin（https://…）と <code>request.base_url</code>（http://…）が一致せず、正しいトークンでも 422 になります。この切り分けは
            <ChapterLink n={25} />で扱います。
          </p>
          <Figure n="21-2" title="CSRF トークンの発行と検証" caption="Rails 8.1.4.1 の request_forgery_protection.rb を読み、デモでの実測で確かめてまとめた模式図。">
            <CsrfFigure />
          </Figure>
          <Callout kind="note" title="開発中の版の Sec-Fetch-Site の検査">
            <p>
              Rails の開発中のブランチ（未リリース）の request_forgery_protection.rb には、ブラウザーが送る <code>Sec-Fetch-Site</code> ヘッダー（same-origin・same-site・cross-site
              など）で要求の出どころを確かめ、トークンを使わない検証方法が追加されています
              <Ref n={3} />。8.1.4.1 には無く、まだリリースされていない内容なので、今後の版で変わる可能性があります。
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
            の Strong Parameters が対策です。<code>params.expect(comment: [:body])</code> のように受け取る属性を列挙し、管理者の印のような列を利用者が変えられないようにします。
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
            Brakeman は、ソースを解析してセキュリティ上の問題を探すツールです<Ref n={5} />。デモのアプリケーションでは警告はありませんでした。検査のために、危険な書き方のコントローラーとビューを一時的に追加して実行しました（確認後に削除）。
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
            Brakeman は、追加した4か所をすべて検出しました。bundler-audit は、Gemfile.lock
            の gem の版を、既知の脆弱性の一覧と照らし合わせます。
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
  ],
}

export default ch21
