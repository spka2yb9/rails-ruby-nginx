import { ChapterLink, Code } from '../components/content'
import { guide, primarySource, type Explanations } from './shared'

export const explanation16: Explanations = {
  sources: [
    primarySource('class Object（instance_variables・instance_variable_get・instance_variable_set）', 'Ruby Documentation', 'https://docs.ruby-lang.org/en/4.0/Object.html', 'Ruby 4.0'),
    primarySource('class Module（module_eval・include・ancestors）', 'Ruby Documentation', 'https://docs.ruby-lang.org/en/4.0/Module.html', 'Ruby 4.0'),
    guide('form_helpers', 'Action View Form Helpers'),
    primarySource('Cross-site scripting (XSS)', 'MDN Web Docs', 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS'),
  ],
  sections: {
    flow: cite => <>
      <p>
        「HTML と ERB のテンプレート」の節では、コントローラーのアクションで <code>@article</code> に入れた記事を、テンプレートの中で同じ名前で使いました。
        <code>@</code> で始まる変数（インスタンス変数）は、本来はそのオブジェクトの中でしか使えません。
        テンプレートを実行するのはコントローラーとは別のオブジェクト（この章ではビューのインスタンスと呼びます）なので、Rails は描画のたびに、コントローラーのインスタンス変数の名前と値を集め、ビューのインスタンスに同じ名前で設定し直します。
      </p>
      <p>
        このコピーにはインスタンス変数を名前で扱う Ruby のメソッドを使います。
        <code>instance_variables</code> は名前の一覧を返し、<code>instance_variable_get</code> は名前を指定して値を読み、<code>instance_variable_set</code> は名前を指定して値を設定します。
      </p>
      <Code lang="ruby" title="インスタンス変数を名前で読み書きする（Ruby 4.0.9 で実行）" code={`class ArticlesController
  def show
    @article = "記事1"
    @count = 8
  end
end

controller = ArticlesController.new
controller.show
controller.instance_variables               # => [:@article, :@count]
controller.instance_variable_get(:@article) # => "記事1"

view = Object.new
view.instance_variable_set(:@article, controller.instance_variable_get(:@article))
view.instance_variable_get(:@article)       # => "記事1"`} />
      <p>
        この節で読む <code>render_to_body</code>・<code>view_context</code>・<code>view_assigns</code> は、Rails がこのコピーと描画を行うメソッドです。どれも Rails の内部のメソッドで、アプリケーションのコードから直接呼ぶことはありません。{cite}
      </p>
    </>,
    lookup: () => <>
      <p>
        同じ show アクションでも、/articles/1 には HTML を、/articles/1.json には JSON を返したい場合があります。
        ブラウザーなどのクライアントは要求の Accept ヘッダーで受け取りたい形式を伝えます（<ChapterLink n={6} section="http-message" />）。
        Rails は要求の形式（format）・言語（locale）・派生（variant。スマートフォン用など、同じ形式の別の版）を条件にして、テンプレートのファイルを選びます。
        ファイル名の <code>show.html+phone.erb</code> は、アクションが show、形式が html、派生が phone、ERB で処理するファイル、という情報を名前に含めています。
      </p>
      <p>
        ファイル名をこれらの部分に分けるために、Rails は正規表現を使います。正規表現は文字列の形を表す書き方で、<code>{'(?<名前>…)'}</code> で囲んだ部分は、合った文字列から名前で取り出せます。
        この節で読む正規表現を簡単にした例です。
      </p>
      <Code lang="ruby" title="名前付きの部分で文字列を分ける（Ruby 4.0.9 で実行）" code={`pattern = /\\A(?<action>.*?)\\.(?<format>html|text)(?:\\+(?<variant>phone))?\\.(?<handler>erb)\\z/

m = "show.html+phone.erb".match(pattern)
m[:action]  # => "show"
m[:format]  # => "html"
m[:variant] # => "phone"
m[:handler] # => "erb"

"show.text.erb".match(pattern)[:variant] # => nil（派生の部分が無い）`} />
      <p>
        <code>\A</code> は文字列の先頭、<code>\z</code> は末尾、<code>.*?</code> は任意の文字の並び、<code>(?:…)?</code> は省略できる部分を表します。
        ファイルを置いたのにテンプレートが見つからないときは、ファイル名のどの部分が探索の条件と合っていないかを確かめます。
      </p>
    </>,
    compile: cite => <>
      <p>
        「HTML と ERB のテンプレート」の節の出力は、テンプレートの HTML の部分をそのまま並べ、<code>{'<%= %>'}</code> の位置に式の結果を入れたものでした。
        Rails はこれを描画のたびにテンプレートの文字を読み直して行うのではなく、最初の描画のときに、テンプレートを「HTML の文字列を足す」「式の結果を足す」を順に行う Ruby のメソッドに変換しておきます。
        この変換をコンパイルと呼びます。
      </p>
      <p>
        Ruby では文字列に書いたコードから、実行中にメソッドを定義できます。<code>module_eval</code> は渡した文字列を Ruby のコードとしてそのクラスの中で実行するメソッドです。
      </p>
      <Code lang="ruby" title="文字列からメソッドを定義する（Ruby 4.0.9 で実行）" code={`klass = Class.new
source = 'def greet(name) = "こんにちは、#{name}さん"'
klass.module_eval(source)

klass.instance_methods(false) # => [:greet]
klass.new.greet("Rails")      # => "こんにちは、Railsさん"`} />
      <p>
        この節では ERB から作ったコードの文字列を、Rails が同じ方法でメソッドにするところを確かめます。
        定義したメソッドを使い回しても、呼ぶたびに渡す値が違えば出力は変わります。コンパイルを1回で済ませることと、描画した HTML を保存して使い回すキャッシュ（<ChapterLink n={22} section="fragment" />）とは別のものです。
      </p>
      <p>
        この節には次の用語も出てきます。Mutex は、ある処理を同時に1つのスレッドだけが実行できるようにする Ruby のクラスです（スレッドは<ChapterLink n={23} section="thread" />）。
        ActiveSupport::Notifications は「テンプレートをコンパイルした」「描画した」などの出来事を、Rails が名前の付いたイベントとして知らせる仕組みで、イベントの名前を指定して記録できます（<ChapterLink n={22} section="notifications" />）。
        バックトレースは、例外が起きたときに表示される、そこまでに呼ばれたメソッドとファイル名・行番号の一覧です。{cite}
      </p>
    </>,
    'layout-partial': () => <>
      <p>
        「レイアウトとパーシャルの書き方」の節で、レイアウトの yield の位置にテンプレートの出力が入り、<code>render @articles</code> が記事の数だけパーシャルを描画することを見ました。
        この節ではその順番と、パーシャルに渡るローカル変数の決まり方を、Rails のコードで確かめます。
      </p>
      <p>
        <code>render @articles</code> の @articles は、<code>Article.order(:id).limit(3)</code> が返した ActiveRecord::Relation です。
        Relation は SQL の条件を持ったオブジェクトで、each などで中身が必要になったときに初めて SQL を実行します（<ChapterLink n={12} section="lazy" />）。
        そのため、「レイアウトとパーシャルの書き方」の節のログでは、index.html.erb の描画が始まった後に SELECT が出ていました。
        <code>to_partial_path</code> は、モデルのオブジェクトが自分を描画するパーシャルのパスを返すメソッドで、Article なら <code>"articles/article"</code> を返します。
      </p>
    </>,
    helpers: cite => <>
      <p>
        ヘルパーはモジュールに書いたメソッドです。モジュールはメソッドをまとめたもので、クラスに include すると、そのクラスのインスタンスからモジュールのメソッドを呼べます。
        <code>ancestors</code> はメソッドを探す順にクラスとモジュールを並べた配列を返します（<ChapterLink n={3} section="include" />）。
      </p>
      <Code lang="ruby" title="モジュールを include する（Ruby 4.0.9 で実行）" code={`module Greeting
  def hello = "こんにちは"
end

class View
  include Greeting
end

View.new.hello          # => "こんにちは"
View.ancestors.first(3) # => [View, Greeting, Object]`} />
      <p>
        Rails はビューのクラスに app/helpers のモジュールや、URL を作るヘルパーのモジュールを include します。この節で表示する祖先の一覧は、この仕組みで並んだものです。
        <code>Class.new</code> は名前の無いクラスを作るメソッドで、一覧の <code>{'#<Class:0x…>'}</code> はこの名前の無いクラスです。{cite}
      </p>
    </>,
    form: cite => <>
      <p>
        HTML のフォームは <code>{'<form>'}</code> 要素で、action 属性に送信先の URL を、method 属性に HTTP のメソッドを書きます。
        中の入力欄（<code>{'<input>'}</code> や <code>{'<textarea>'}</code>）は name 属性を持ち、送信するとブラウザーは「name=入力した値」を <code>&amp;</code> でつないで要求の本文に入れます。
        name が <code>article[title]</code> の入力欄なら、Rails の params では <code>params[:article][:title]</code> で取り出せます（<ChapterLink n={10} section="params" />）。
      </p>
      <p>
        応答のステータスコードは要求の結果を表す3桁の数字です（<ChapterLink n={6} section="http-message" />）。この節には次の3つが出てきます。
        200 は成功です。302 は「別の URL を取得し直してください」という指示（リダイレクト）で、移動先の URL は Location ヘッダーに入ります。422 は送られた内容を処理できなかったことを表します。
      </p>
      <p>
        form_with はモデルのオブジェクトからフォームの HTML を作るヘルパーです。保存前の記事なら送信先を /articles に、保存済みなら /articles/記事の id にし、入力欄の name を <code>article[title]</code> の形にします。
        ヘルパーが作る name、ルーティングが選ぶアクション、params の形、モデルに渡す属性が順につながって、1つの保存処理になります。{cite}
      </p>
    </>,
    escape: cite => <>
      <p>
        「HTML と ERB のテンプレート」の節で、<code>{'<%= %>'}</code> が <code>{'<'}</code> と <code>{'>'}</code> を <code>{'&lt;'}</code> と <code>{'&gt;'}</code> に置き換えて出力することを見ました。
        この置き換えをしないと何が起きるかの例です。コメントの本文に <code>{'<script>alert(1)</script>'}</code> と書いて投稿されたとします。
        テンプレートがこの本文をそのまま HTML に入れると、コメントを表示した人のブラウザーで、投稿者が書いた JavaScript が実行されます。
        このように、他人が入力した文字列を通じてページに JavaScript を入れられる攻撃を XSS（クロスサイトスクリプティング）と呼びます。
        エスケープしていれば、本文は「{'<script>alert(1)</script>'}」という文字として表示されるだけです。
      </p>
      <p>
        一方で、<code>link_to</code> が作る <code>{'<a>'}</code> タグのように、ヘルパーが組み立てた HTML はタグとして出力する必要があります。
        Rails はエスケープしなくてよい文字列に印を付けて区別します。この節の <code>html_safe?</code> はその印を調べるメソッドで、SafeBuffer は印の付いた文字列のクラスです。{cite}
      </p>
    </>,
    assets: () => <>
      <p>
        「CSS・JavaScript・画像を取りに来る要求」の節で、ブラウザーがアセットを HTML とは別の要求で取得し、2回目からはキャッシュから読むことを見ました。
        この節ではファイル名のダイジェストの作り方と、開発環境と本番環境でのファイルの返し方を扱います。
      </p>
      <p>
        ダイジェストの計算には SHA1 というハッシュ関数を使います。ハッシュ関数はどんな長さのデータからも決まった長さの値を計算する関数で、同じ内容からは同じ値が、少しでも違う内容からはまったく違う値が出ます。
      </p>
      <Code lang="ruby" title="内容が1語違うときの SHA1 の先頭8文字（Ruby 4.0.9 で実行）" code={`require "digest"
Digest::SHA1.hexdigest("body { color: red; }")[0, 8]  # => "9c507b84"
Digest::SHA1.hexdigest("body { color: blue; }")[0, 8] # => "a1d2ece7"`} />
      <p>
        この節には次の用語も出てきます。ミドルウェアは、要求がコントローラーに届く前に順に通る部品で、自分で応答を返すことも、次の部品に渡すこともできます（<ChapterLink n={6} section="middleware" />）。
        JavaScript のファイルは <code>import "…"</code> と書いて別のファイルを読み込めます（ES モジュール）。
        ファイルが多いと要求の数が増えるので、あらかじめ1つのファイルにまとめる（バンドルする）方法もあり、Node.js（ブラウザーの外で JavaScript を実行するプログラム）の上で動く esbuild などのツールを使います。
      </p>
    </>,
  },
}

export const explanation18: Explanations = {
  sources: [
    primarySource('Sidekiq — The Basics', 'Sidekiq', 'https://github.com/sidekiq/sidekiq/wiki/The-Basics'),
    primarySource('module JSON', 'Ruby Documentation', 'https://docs.ruby-lang.org/en/4.0/JSON.html', 'Ruby 4.0'),
    primarySource('Redis sorted sets', 'Redis', 'https://redis.io/docs/latest/develop/data-types/sorted-sets/', 'Redis 8'),
  ],
  sections: {
    overview: cite => <>
      <p>
        ここまでの3つの節で、perform_later がジョブを Redis のキューに入れてすぐに戻り、別のプロセスの Sidekiq が取り出して perform を実行することを見ました。
        ActiveJob が決めているのはジョブの書き方と投入の仕方で、ジョブを実際にどこに保存し、どのプロセスが実行するかは、アダプターで切り替えます。
        デモの開発環境は <code>config.active_job.queue_adapter = :sidekiq</code> で Sidekiq と Redis を使い、Rails 8 の新規のアプリケーションの本番環境は Solid Queue（「Solid Queue との違い」の節）を使います。
      </p>
      <p>
        Rails のプロセスと Sidekiq のプロセスはメモリーが別なので、Ruby のオブジェクトをそのまま渡せません。そこでジョブを JSON という文字列にして Redis に入れます。
        JSON は文字列・数値・配列・Hash などを決まった形式の文字列で表す書き方で、Ruby 以外の言語からも読めます。{cite}
      </p>
    </>,
    serialize: cite => <>
      <p>
        JSON で表せるのは、文字列・数値・true と false・null・配列・Hash（キーは文字列）だけです。Ruby の Symbol や Time のような値を JSON にして読み戻すと、別の型になります。
      </p>
      <Code lang="ruby" title="JSON にして読み戻す（Ruby 4.0.9 で実行）" code={`require "json"
data = { note: "メモ", tags: [:urgent], at: Time.utc(2026, 11, 16, 9, 0) }
json = JSON.generate(data)
# => {"note":"メモ","tags":["urgent"],"at":"2026-11-16 09:00:00 UTC"}
JSON.parse(json)
# => {"note" => "メモ", "tags" => ["urgent"], "at" => "2026-11-16 09:00:00 UTC"}`} />
      <p>
        読み戻すと、Hash のキーの Symbol（<code>:note</code>）と配列の中の Symbol（<code>:urgent</code>）は文字列になり、Time は時刻を書いた文字列になりました。
        perform に Symbol や Time や記事のオブジェクトを渡しても、実行する側で元の型に戻せるように、ActiveJob は JSON にする前に型の情報を書き足します。
        値を保存・転送できる形に変えることをシリアライズ、元に戻すことをデシリアライズと呼びます。{cite}
      </p>
    </>,
    sidekiq: cite => <>
      <p>
        Redis は値をキー（名前）ごとに保存します。この節に出てくる <code>queue:default</code>・<code>schedule</code>・<code>retry</code> は、Sidekiq が使うキーの名前です。
        値の種類には「キューとワーカー、Redis」の節で使ったリストのほかに、ZSET（ソート済みセット）があります。ZSET は値ごとにスコアという数値を持ち、スコアの小さい順に並びます。
      </p>
      <Code lang="text" title="ZSET に入れて、スコアで取り出す（redis-cli。Redis 8.10.3）" code={`$ redis-cli ZADD demo18:at 1794813000 jobB 1794812800 jobA 1794813200 jobC
(integer) 3
$ redis-cli ZRANGE demo18:at 0 -1 WITHSCORES     # スコアの小さい順に並ぶ
1) "jobA"
2) "1794812800"
3) "jobB"
4) "1794813000"
5) "jobC"
6) "1794813200"
$ redis-cli ZRANGEBYSCORE demo18:at -inf 1794812900   # スコアが 1794812900 以下のもの
1) "jobA"`} />
      <p>
        スコアに実行する時刻を入れておけば、「今の時刻以下のもの」を取り出すだけで、実行の時刻が来たジョブがわかります。
        時刻は UNIX 時刻（1970年1月1日 0時（UTC）からの秒数）で表します。1794812800 は 2026年11月16日 7時6分40秒（UTC）です。{cite}
      </p>
    </>,
    retry: () => <>
      <p>
        例外が起きたジョブを、時間をおいてもう一度実行することを再試行と呼びます。外部のサービスが一時的に応答しなかっただけなら、数秒後にやり直せば成功することがあります。
        一方で、記事が削除されたために起きた例外は、何度やり直しても成功しません。再試行を使い切っても成功しなかったジョブは、原因を調べられるように Dead という置き場所に残します。
      </p>
      <p>
        この節の待ち時間には揺らぎ（jitter）が足されます。揺らぎは毎回変わる乱数の秒数で、同時に失敗したジョブでも、再実行の時刻がジョブごとにずれます。
        <code>retry_on</code> と <code>discard_on</code> は、ジョブのクラスの中に書いて、例外の種類ごとに再試行するか捨てるかを決めるメソッドです（このような書き方は<ChapterLink n={5} section="class-macro" />）。
      </p>
    </>,
    transaction: () => <>
      <p>
        トランザクションは複数の SQL をまとめて、全部を確定する（COMMIT）か全部を取り消す（ROLLBACK）かのどちらかにする仕組みです（<ChapterLink n={38} section="transaction" />）。
        このデモの MySQL の設定では、COMMIT する前の変更は、その変更を行った接続から読めます。Sidekiq が別の接続で記事を探しても、まだ見つかりません。
      </p>
      <p>
        また、Redis へのジョブの投入はデータベースのトランザクションとは別の処理なので、後で ROLLBACK しても、投入したジョブは取り消されません。記事が存在しないまま、ジョブだけが残ることになります。
      </p>
    </>,
    idempotency: () => <>
      <p>
        同じ操作を何回行っても、1回行ったときと結果が同じになる性質を冪等（べきとう）と呼びます。
        たとえば、記事の status を "published" にする更新は、2回実行しても結果は同じです。記事の送信回数の列に1を足す更新は、2回実行すると2増えます。メールの送信は2回実行すると2通届きます。
        ジョブが2回実行されることがあるなら、後の2つのような処理には、2回目を防ぐ工夫が要ります。
      </p>
      <p>
        この節の TERM と SIGKILL は、OS がプロセスに送る停止の合図（シグナル）です。TERM は後始末をしてから終わるよう求め、SIGKILL はその場で強制的に終わらせます（シグナルは<ChapterLink n={23} section="cluster" />）。
      </p>
    </>,
  },
}

export const explanation19: Explanations = {
  sources: [guide('action_mailer_basics', 'Action Mailer Basics'), guide('active_storage_overview', 'Active Storage Overview')],
  sections: {
    mailer: cite => <>
      <p>
        「メーラーでメールを作って送る」の節では、メーラーがアクションで値を用意し、テンプレートで本文を作ることを見ました。
        この節では、メーラーのクラスがどのクラスを継承しているかをたどります。
        <code>class ArticleMailer &lt; ApplicationMailer</code> のように書く継承では、親のクラスに定義したメソッドを子のクラスでも使えます。
        コントローラーも <code>ArticlesController &lt; ApplicationController &lt; ActionController::Base</code> と親のクラスをたどれます（<ChapterLink n={10} section="hierarchy" />）。
      </p>
      <p>
        メールの中のリンクには <code>http://localhost:3000/articles/1</code> のような、ホスト名から始まる完全な URL が必要です。
        ブラウザーで開いたページなら、<code>/articles/1</code> のようなパスだけのリンクでも、ブラウザーが開いているサイトのホスト名を補います。
        メールソフトで開いたメールにはそのようなサイトが無いので、パスだけではどのサイトを開くか決まりません。{cite}
      </p>
    </>,
    deliver: cite => <>
      <p>
        「メーラーでメールを作って送る」の節では、<code>deliver_now</code> がメールを作って SMTP サーバーに渡し終えるまで戻らないことを見ました。
        Web の要求の処理の中でこれを呼ぶと、そのあいだ利用者は応答を待ちます。
        <code>deliver_later</code> はメールを送る処理をジョブにして後で実行させます。
        ジョブは後で実行する処理の単位で、引数と一緒に Redis などのキュー（実行を待つジョブを順に並べておく場所）に入れておき、Sidekiq などの別のプロセスが取り出して実行します（<ChapterLink n={18} section="overview" />）。
      </p>
      <p>
        キューには文字列や数値のような値しか入れられないので、Article のオブジェクトはそのままでは入りません。
        ActiveJob は ActiveRecord のオブジェクトを GlobalID という文字列に変えて保存し、ジョブを実行するときに、その文字列からデータベースの行を読み直します（<ChapterLink n={18} section="serialize" />）。
      </p>
      <Code lang="ruby" title="GlobalID の例（bin/rails runner で実行）" code={`gid = Article.find(1).to_global_id.to_s
puts "to_global_id: #{gid}"
a = GlobalID::Locator.locate(gid)
puts "locate: #{a.class} id=#{a.id} title=#{a.title}"
# => to_global_id: gid://demo/Article/1
# => locate: Article id=1 title=変更後のタイトル`} />
      <p>
        この節のコードの <code>@mail_message ||= …</code> は、<code>@mail_message</code> が nil のときだけ右辺を実行して代入する書き方で、2回目からは代入済みの値を返します。
        トランザクションは複数の SQL の変更をまとめて確定（COMMIT）するか取り消す仕組みで、COMMIT するまでは、ほかのデータベースの接続から変更が見えません（<ChapterLink n={38} section="transaction" />）。{cite}
      </p>
    </>,
    tables: cite => <>
      <p>
        「ファイルのアップロードと保存先」の節で見たとおり、ActiveStorage はファイルの中身をストレージのサービスに保存し、どのファイルがどの記事のものかをデータベースに記録します。
        記録には主に2つのテーブルを使います。active_storage_blobs の1行（blob）はファイル1つの情報で、保存先での名前、元のファイル名、種類、大きさなどを持ちます。
        active_storage_attachments の1行（attachment）は、どのレコードにどの blob が付いているかを表します。
      </p>
      <p>
        テーブルはマイグレーション（テーブルを作ったり変えたりする手順を書いた Ruby のファイル）を実行して作ります（<ChapterLink n={11} section="migration" />）。
        モデルの <code>has_one_attached</code> は関連を定義します。関連は <code>article.comments</code> のように、あるレコードから関係するレコードをたどれるようにする定義です（<ChapterLink n={13} section="basics" />）。
        添付したときの SQL の BEGIN から COMMIT までは1つのトランザクションで、COMMIT の後に実行するコールバック（after_create_commit）が解析のジョブを投入します（<ChapterLink n={14} section="after-commit" />）。{cite}
      </p>
    </>,
    serving: cite => <>
      <p>
        ビューに添付画像の URL を書いても、画像の中身は HTML に含まれません。ブラウザーは HTML を読んだ後、<code>img</code> タグの URL へ別の要求を送って画像を取得します。
        ActiveStorage が出力する URL は Rails の URL で、Rails がその要求を受け取ってから、画像を返す方法を決めます。
      </p>
      <p>
        リダイレクトは「別の URL を要求し直してほしい」と伝える応答です。ステータスコード 302 と、移動先の URL を入れた location ヘッダーを返すと、ブラウザーはその URL へ自動で要求を送り直します。
        CDN は配信するファイルの複製を利用者に近い多数のサーバーに置いて返すサービスで、同じファイルへの要求を Rails まで届けずに返せます。
        署名付きの ID の「署名」は、値が書き換えられていないことを確かめるための文字列です（<ChapterLink n={21} section="secrets" />）。{cite}
      </p>
    </>,
    'direct-upload': cite => <>
      <p>
        「ファイルのアップロードと保存先」の節の方法では、ファイルの中身がいったん Rails に届き、Rails がそれを保存先へ送ります。
        Nginx は Puma の前で要求を受け取るサーバーで、受け付ける要求の本文の大きさに上限があります（<ChapterLink n={24} section="body-size" />）。
        直接アップロードでは、ブラウザーの JavaScript が保存先にファイルを送る操作と、記事のフォームを送る操作を分けます。ファイルを送るときの PUT は、指定した URL の場所にデータを置く HTTP のメソッドです。
      </p>
      <p>
        最初の要求の checksum はファイルの中身から計算した短い文字列です。中身が少しでも違えばほぼ確実に別の値になるので、受け取った側で同じ計算をして、ファイルが途中で壊れていないかを確かめられます。
      </p>
      <Code lang="ruby" title="ファイルの中身の checksum（Ruby 4.0.9 で実行）" code={`require "digest"
data = File.binread("photo.png")
puts Digest::MD5.base64digest(data)   # => MS9xedQxVkemMP9iRzm9RQ==
data.setbyte(100, data.getbyte(100) ^ 1) # 100バイト目を1ビットだけ変える
puts Digest::MD5.base64digest(data)   # => 8PX+MJaqDskOIzeHNUffAw==`} />
      <p>
        MD5 はこのような短い値を計算する方法の1つで、Base64 はバイト列を英数字と記号で表す形式です。
        デモの cover.png の blob の checksum（It6Gda/qwhqLa3B3Vbi/Ow==）も、保存されたファイルの MD5 を Base64 で表した値と一致しました。{cite}
      </p>
    </>,
    variants: cite => <>
      <p>
        元の大きな画像をそのまま一覧に出す代わりに、表示用に縮小した画像を作ることがあります。
        バリアントはこうした変換後の画像です。元ファイル、変換内容の指定、生成した結果を区別して管理します。
        サイズの指定をコードに書くことと、実際に画像を加工して保存することは別の時点になり得ます。
      </p>
      <p>
        最初の取得時に変換する場合、その要求には画像の読み込みと加工の時間もかかります。
        2回目からは同じ変換済みの結果を利用できるため、初回と再利用時の動作を分けて見る必要があります。
        画像の加工そのものは、libvips や ImageMagick という画像を変換するためのライブラリやプログラムが行います。サーバーにそれらが入っていないと変換できません。{cite}
      </p>
    </>,
  },
}

export const explanation20: Explanations = {
  sources: [primarySource('Equality matchers', 'RSpec', 'https://rspec.info/features/3-13/rspec-expectations/built-in-matchers/equality/', 'RSpec 3.13'), guide('testing', 'Testing Rails Applications')],
  sections: {
    dsl: cite => <>
      <p>
        Ruby のメソッドは引数のほかに <code>do … end</code> のブロックを受け取れます。<code>describe "…" do … end</code> や <code>it "…" do … end</code> も、文字列とブロックを受け取るメソッドの呼び出しです（<ChapterLink n={4} section="block-yield" />）。
        RSpec はファイルを読む段階で、describe のブロックを実行して例を登録し、それぞれの例のブロックは後でまとめて実行します。
        この節では、その登録で作られるものが、Ruby のクラスとメソッドであることを確かめます。
      </p>
      <p>
        <code>let</code> は値を作るメソッドを定義します。作った値を覚えておき、2回目からは同じ値を返す書き方をメモ化と呼びます。Ruby では <code>@変数 ||= …</code> でよく書きます。
      </p>
      <Code lang="ruby" title="メモ化の例（Ruby 4.0.9 で実行）" code={`class Example
  def article
    @article ||= begin
      puts "記事を作る"
      "記事"
    end
  end
end

e = Example.new
puts e.article
puts e.article
puts Example.new.article
# => 記事を作る / 記事 / 記事 / 記事を作る / 記事`} />
      <p>
        同じインスタンスで2回呼ぶと「記事を作る」は1回だけ表示され、別のインスタンスではもう一度表示されました。let の値も1つの例の中では最初に作った値を返し、別の例では作り直されます。
        出力の ancestors は、クラスが継承している親のクラスと include したモジュールを、メソッドを探す順に並べた配列です。{cite}
      </p>
    </>,
    types: cite => <>
      <p>
        「テスト用の環境とデータベース」の節の例は、モデルのメソッドを直接呼んで確かめるテストでした。テストには、アプリケーションをどこから呼び出して確かめるかによっていくつかの種類があります。
        Rails のアプリケーションは、Puma のような HTTP サーバーが受け取った要求を、Rack という決まった形のメソッドの呼び出し（<code>call(env)</code>）で受け取ります。
        要求はまずミドルウェア（Cookie やセッションの処理など、要求の前後に処理を挟む部品）を順に通り、ルーティングでコントローラーのアクションに渡されます（<ChapterLink n={6} section="middleware" />）。
      </p>
      <p>
        request spec は HTTP サーバーを使わずに、この Rack の呼び出しをテストの中から直接行います。
        system spec は Capybara という道具でブラウザーを操作し、テストの中で起動した Puma に要求を送ります。既定のブラウザーは headless の Chrome（画面に表示せずに動く Chrome）です。
        <code>type:</code> の指定で、それぞれの呼び出し方に必要なメソッドを持つモジュールが include されます。{cite}
      </p>
    </>,
    transaction: cite => <>
      <p>
        「テスト用の環境とデータベース」の節では、1つ目の例で作った記事が、2つ目の例では0件に戻っていました。これはデータベースのトランザクションを使っています。
        トランザクションは複数の SQL の変更をまとめて扱う仕組みで、BEGIN で始め、COMMIT で変更を確定し、ROLLBACK で BEGIN からの変更をすべて取り消します（<ChapterLink n={38} section="transaction" />）。
        テスト環境で、記事を作った後に ROLLBACK しました。
      </p>
      <Code lang="ruby" title="RAILS_ENV=test bin/rails runner で実行（SQL のログを表示）" code={`puts "記事の数: #{Article.count}"
ActiveRecord::Base.transaction do
  Article.create!(title: "取り消す記事")
  puts "トランザクションの中: #{Article.count}"
  raise ActiveRecord::Rollback
end
puts "ROLLBACK の後: #{Article.count}"`} />
      <Code lang="text" title="出力（INSERT の列を省略）" code={`記事の数: 0
  TRANSACTION (0.3ms)  BEGIN
  Article Create (0.9ms)  INSERT INTO \`articles\` (\`title\`, …) VALUES ('取り消す記事', …)
トランザクションの中: 1
  TRANSACTION (5.0ms)  ROLLBACK
ROLLBACK の後: 0`} />
      <p>
        SAVEPOINT はトランザクションの途中に付ける印で、ROLLBACK TO SAVEPOINT でその印まで戻せます（<ChapterLink n={15} section="nested" />）。
        after_commit は COMMIT の後に自動で呼ばれるコールバックです（<ChapterLink n={14} section="after-commit" />）。
        接続は Rails と MySQL の間の通信路で、ActiveRecord は接続プールから1本ずつスレッドに貸し出します（<ChapterLink n={15} section="pool" />）。{cite}
      </p>
    </>,
    data: cite => <>
      <p>
        テストで使うデータを用意する方法には、fixtures と FactoryBot があります。
        fixtures はテーブルの行を名前付きで YAML（字下げで階層を表すデータの書き方）のファイルに並べます。
        FactoryBot はレコードの作り方（ファクトリー）を Ruby で定義しておき、例の中で <code>create</code> を呼んで作ります。
      </p>
      <Code lang="yaml" title="spec/fixtures/authors.yml（デモ）" code={`alice:
  name: Alice
  email: alice@example.com
bob:
  name: Bob
  email: bob@example.com`} />
      <Code lang="ruby" title="spec/factories/authors.rb（デモ）" code={`FactoryBot.define do
  factory :author do
    sequence(:name) { |n| "著者#{n}" }
    sequence(:email) { |n| "author#{n}@example.com" }
  end

  factory :article do
    title { "FactoryBot の記事" }
    author
  end
end`} />
      <p>
        fixtures の alice は authors テーブルの1行になり、例の中では <code>authors(:alice)</code> で読めます。
        ファクトリーの <code>sequence</code> は作るたびに番号を変えた値（著者1、著者2…）を作ります。article のファクトリーの <code>author</code> の行は、記事を作るときに著者も作ることを表します。{cite}
      </p>
    </>,
    'jobs-mail': cite => <>
      <p>
        ジョブは後で実行する処理の単位で、キューに入れておき、Sidekiq などの別のプロセスが取り出して実行します（<ChapterLink n={18} section="overview" />）。
        ジョブをキューに入れる部品をアダプターと呼び、テスト環境ではジョブを実行せずに記録するだけのテスト用のアダプターを使います。
        「ジョブを登録した」ことと「ジョブの処理が成功した」ことは別なので、登録したクラスと引数を確かめ、必要ならジョブを実行して結果も確かめます。
      </p>
      <p>
        メールは「テスト用の環境とデータベース」の節で見た <code>delivery_method = :test</code> により、送らずに <code>ActionMailer::Base.deliveries</code> の配列に入ります。
        <code>deliver_later</code> はメールを送るジョブを登録するだけなので（<ChapterLink n={19} section="deliver" />）、登録したことと、ジョブを実行して配列にメールが入ったことを分けて確かめます。{cite}
      </p>
    </>,
  },
}

export const explanation21: Explanations = {
  sources: [guide('security', 'Securing Rails Applications')],
  sections: {
    overview: cite => <>
      <p>
        Rails のアプリケーションが要求を受け取ると、要求はまずミドルウェアを順に通ります。ミドルウェアは要求の前後に処理を挟む部品で、Cookie やセッションの読み書きもここで行います（<ChapterLink n={6} section="middleware" />）。
        その後、ルーティングがコントローラーのアクションを呼び、アクションがモデルで SQL を実行し、ビューで HTML を作ります。
        Cookie と入力の節で見た攻撃は、それぞれ別の段階で起きます。CSRF はコントローラーが要求を受け付けるとき、一括代入はモデルに値を渡すとき、SQL インジェクションは SQL を作るとき、XSS はビューで HTML を作るときです。{cite}
      </p>
    </>,
    csrf: cite => <>
      <p>
        「Cookie・セッション・ログイン状態」の節で見たとおり、別のサイトのページから送らせた要求にも Cookie が付く場合があるので、Cookie だけでは利用者が自分で操作したかを判断できません。
        CSRF のトークンはこのサイトのページにだけ埋め込んでおく値です。フォームの隠しフィールド（画面に表示されないが一緒に送られる <code>input type="hidden"</code> の欄）と、ページの先頭の meta タグに入れます。
        別のサイトのページはこのサイトのページの中身を読めないので、正しいトークンを送れません。
        オリジンは「通信方式・ホスト名・ポート番号」の組で、<code>http://localhost:3300</code> と <code>https://evil.example</code> は別のオリジンです。Origin ヘッダーは、要求を送ったページのオリジンをブラウザーが入れるヘッダーです。
      </p>
      <p>
        この節のコードの XOR は2つのバイト列をビットごとに比べ、違えば1、同じなら0にした新しいバイト列を作る計算で、同じ値で2回 XOR すると元に戻ります。Base64 はバイト列を英数字と記号だけの文字列で表す形式です。
      </p>
      <Code lang="ruby" title="XOR と Base64（Ruby 4.0.9 で実行）" code={`require "base64"
require "securerandom"

token = "SECRET-TOKEN".b                          # サーバーが覚えている値
pad   = SecureRandom.random_bytes(token.bytesize) # 毎回作るランダムな値
xor = ->(a, b) { a.bytes.zip(b.bytes).map { |x, y| x ^ y }.pack("C*") }

masked = xor.(pad, token)
puts "Base64 にした値: #{Base64.strict_encode64(pad + masked)}"
puts "パッドでもう一度 XOR: #{xor.(pad, masked)}"
# 1回目 => Base64 にした値: LuHNNcn7GoeWooYtfaSOZ4yvN9PZ6cNj / パッドでもう一度 XOR: SECRET-TOKEN
# 2回目 => Base64 にした値: zJOu4FuNPCMhf8Tqn9btsh7ZEXduNIGk / パッドでもう一度 XOR: SECRET-TOKEN`} />
      <p>
        実行するたびに出力される値は変わりますが、パッドで XOR し直すと、どちらも同じ SECRET-TOKEN に戻りました。Rails のトークンも同じ方法で、表示のたびに違う値を出力します。
        HTTPS は通信を暗号化した HTTP です。422 は要求の内容を処理できなかったことを表すステータスコードです。{cite}
      </p>
    </>,
    xss: cite => <>
      <p>
        「入力が HTML や SQL として解釈される」の節では、<code>{'<%= %>'}</code> のエスケープで script タグを文字にできることを見ました。この節では、エスケープだけでは防げない場面を扱います。
        <code>javascript:</code> で始まる URL はリンクを押したときに、その後ろの JavaScript をページの中で実行させる書き方です。<code>{'<a href="javascript:alert(1)">'}</code> を押すと alert が動きます。
      </p>
      <p>
        JSON はデータを文字列で表す形式で、<code>{'<script>'}</code> タグの中にデータを埋め込むときにも使います。
        CSP（Content-Security-Policy）は、ページで実行してよいスクリプトの出どころをブラウザーに伝える応答ヘッダーです。nonce は応答ごとに作るランダムな値で、CSP に書いた nonce と同じ値の属性を持つ script タグだけが実行されます。{cite}
      </p>
    </>,
    sqli: cite => <>
      <p>
        「入力が HTML や SQL として解釈される」の節では、入力を SQL の文字列に埋め込むと、条件の形が変わることを見ました。
        プレースホルダーは SQL の中の <code>?</code> の位置に値を入れる書き方で、Rails が値を SQL の文字列として正しく書けるように変換してから入れます。この変換をクォートと呼びます。
      </p>
      <Code lang="ruby" title="プレースホルダーで作られる SQL（bin/rails runner で実行）" code={`puts Article.where("title = ?", "Rails入門").to_sql
puts Article.where("title = ?", "it's").to_sql
# => SELECT \`articles\`.* FROM \`articles\` WHERE (title = 'Rails入門')
# => SELECT \`articles\`.* FROM \`articles\` WHERE (title = 'it\\'s')`} />
      <p>
        値は <code>'</code> で囲まれ、値の中の <code>'</code> は <code>\'</code> に変えられて、文字列の終わりとは解釈されません。
        LIKE は文字列の一部が一致する行を探す SQL の条件で、<code>%</code> は0文字以上の任意の文字、<code>_</code> は任意の1文字を表します。<code>title LIKE '%Rails%'</code> は Rails を含むタイトルに当てはまります。
        <code>order</code> に渡すのは値ではなく列の名前なので、プレースホルダーでは渡せません。{cite}
      </p>
    </>,
    secrets: cite => <>
      <p>
        署名は、値が書き換えられていないかを確かめるために値に付ける文字列で、秘密の鍵から計算します。暗号化は、鍵が無ければ中身を読めないように値を変換することです。
        デモで、同じ値に署名した場合と、暗号化した場合を比べました。
      </p>
      <Code lang="text" title="bin/rails runner で、署名と暗号化を試した結果" code={`署名付きの値: InVzZXJfaWQ9NDIi--d4404caa7c690c747725a8c9a5b904fbddff0ef1
-- の前を Base64 で戻す: "user_id=42"
そのまま検証: "user_id=42"
中身を書き換えて検証: nil
暗号化した値: GRtZYzKXqKQkZROw--SmMmuaE3nDxLZsbV--XYjOKP3TZLL+YeFlZn2u/Q==
復号: "user_id=42"`} />
      <p>
        署名付きの値は、<code>--</code> の前を Base64 で戻すと中身（user_id=42）が読めますが、中身を書き換えると署名が合わず、検証の結果は nil になりました。暗号化した値は、鍵が無ければ中身を読めません。
        署名付きの Cookie は中身を読まれてもよい値に、暗号化した Cookie は中身を隠したい値に使います。
        PBKDF2 は1つの秘密の値と用途ごとの文字列（ソルト）から、用途ごとに別の鍵を作る計算の方法です。
        credentials は外部のサービスのパスワードなどを暗号化して config/credentials.yml.enc に保存する仕組みです。{cite}
      </p>
    </>,
    'host-ssl-csp': cite => <>
      <p>
        Host ヘッダーは要求の宛先のホスト名を入れるヘッダーです。<code>curl http://127.0.0.1:3300/up</code> は <code>Host: 127.0.0.1:3300</code> を送ります。ほかのヘッダーと同じく、送る側が書き換えられます。
        HTTPS は通信を暗号化した HTTP で、途中の経路で中身を読まれたり書き換えられたりするのを防ぎます。301 は「この URL は別の URL に移った」ことを表すリダイレクトのステータスコードです。
      </p>
      <p>
        HSTS（Strict-Transport-Security ヘッダー）は、「このサイトには今後、指定した期間は HTTPS だけで接続すること」をブラウザーに覚えさせるヘッダーです。Cookie の secure 属性はその Cookie を HTTPS の要求にだけ付けるようにする属性です。
        ロードバランサーは複数のサーバーの前に置いて要求を振り分けるサーバーで、HTTPS の暗号化をそこで解いて、後ろのサーバーには HTTP で転送する構成がよく使われます（<ChapterLink n={25} section="tls-proto" />）。X-Forwarded-Proto は、元の要求が http か https かを後ろのサーバーに伝えるヘッダーです。{cite}
      </p>
    </>,
    tools: cite => <>
      <p>
        ソースを解析するツールは、アプリケーションを動かさずに、コードの書き方から危険な箇所を探します。この章で見た、文字列を埋め込んだ SQL や <code>raw</code> の出力のような書き方を見つけられます。
        gem に見つかったセキュリティ上の問題（脆弱性）は、公開された一覧にまとめられています。Gemfile.lock の gem のバージョンをその一覧と照らし合わせると、更新が必要な gem がわかります。{cite}
      </p>
    </>,
  },
}

export const explanation22: Explanations = {
  sources: [guide('caching_with_rails', 'Caching with Rails: An Overview'), guide('debugging_rails_applications', 'Debugging Rails Applications — Logging'), primarySource('ActiveSupport::Notifications', 'Ruby on Rails API', 'https://api.rubyonrails.org/v8.0/classes/ActiveSupport/Notifications.html', 'Rails 8.0'), primarySource('module GC', 'Ruby Documentation', 'https://docs.ruby-lang.org/en/4.0/GC.html', 'Ruby 4.0')],
  sections: {
    breakdown: cite => <>
      <p>
        「応答時間とログの Completed の行」の節では、Completed の行の時間が curl で測った応答時間より短いことを見ました。測り始める位置と終わる位置が違えば、同じ要求でも時間は一致しません。
        この節では、Rails の中でその時間がどう測られているかを確かめます。
        Rails は SQL の実行やテンプレートの描画のたびに、処理の名前と、始まった時刻・終わった時刻を記録したイベントを発行します。ログはこのイベントを受け取って書かれます。
        イベントの中には別のイベントが入れ子になることがあり、たとえば描画のイベントの時間には、描画の途中で実行した SQL のイベントの時間も含まれます。そのため、すべての数字を単純に足せるわけではありません。{cite}
      </p>
    </>,
    notifications: cite => <>
      <p>
        処理の時間を測るには、開始と終了の時刻と、その処理を区別する名前が必要です。
        すべての処理にログを書くコードを直接入れる代わりに、処理をする側は「この処理が終わった」という知らせ（イベント）を出すだけにして、時間を測ってログに書く側がそれを受け取る作りにできます。
        イベントを受け取るように登録することを購読、イベントに添えるデータ（SQL の文字列やテンプレートのパスなど）をペイロードと呼びます。
        SQL を実行する側と、その SQL をログに書いたり時間を集計したりする側を分けているので、同じイベントをログ・Server-Timing・監視のサービスなどが別々に受け取れます。{cite}
      </p>
    </>,
    'db-memory': cite => <>
      <p>
        Ruby のプログラムは文字列やレコードを作るたびにメモリーを使います。使わなくなったオブジェクトのメモリーを回収して再び使えるようにする処理を GC（ガベージコレクション）と呼び、Ruby が自動で実行します。
        オブジェクトを多く作るほど、GC は多く動きます。
      </p>
      <Code lang="ruby" title="文字列を100万個作ったときの GC（Ruby 4.0.9 で実行）" code={`before = GC.count
1_000_000.times { |i| "記事#{i}" } # 文字列を100万個作り、すぐに使わなくなる
puts "GC が動いた回数: #{GC.count - before} 回"
puts "GC にかかった時間の合計: #{GC.stat(:time)} ms"
# => GC が動いた回数: 307 回
# => GC にかかった時間の合計: 76 ms`} />
      <p>
        EXPLAIN は、MySQL が SQL をどう実行するか（どの索引を使うか）を表示する命令で（<ChapterLink n={37} section="explain-rails" />）、索引は、列の値から行をすばやく探すためにデータベースが持つ表です（<ChapterLink n={37} section="what-is-index" />）。
        ロックは、ある行を同時に1つの処理だけが書き換えられるようにする仕組みで、ほかの処理はロックが外れるまで待ちます（<ChapterLink n={38} section="lock" />）。
        YJIT は Ruby の JIT コンパイラーで、プログラムの実行中に、よく実行される Ruby のコードを CPU が直接実行できる命令に変換して、次からはそれを実行します。{cite}
      </p>
    </>,
    'http-cache': cite => <>
      <p>
        「作った結果を保存して使い回すキャッシュ」の節では、Rails の中で計算の結果を保存しました。HTTP キャッシュは、ブラウザーなどが受け取った応答を保存しておき、次の要求で使い回す仕組みです。
        保存した応答をいつまで使ってよいか、使う前にサーバーに変更の有無を確かめるかを、要求と応答のヘッダーで伝えます。
      </p>
      <p>
        ETag は応答の内容を区別する値、Last-Modified は内容を最後に変更した日時です。
        ブラウザーが前回の ETag を If-None-Match ヘッダーで送り、サーバーが内容は変わっていないと判断すると、本文の無い 304（Not Modified）を返します。ブラウザーは保存しておいた本文を使います。
        送る量は減りますが、サーバーが変更の有無を判断するまでの処理は行われます。{cite}
      </p>
    </>,
    fragment: cite => <>
      <p>
        フラグメントキャッシュはページの一部を描画した結果の HTML を、キャッシュに保存して使い回す仕組みです。記事のタイトルの部分の HTML を保存しておけば、次の表示ではテンプレートの描画を省けます。
      </p>
      <p>
        「作った結果を保存して使い回すキャッシュ」の節で見たとおり、保存した結果は元のデータが変わっても自動では変わりません。
        フラグメントキャッシュでは、キーにレコードの id や更新日時を入れておき、記事が更新されたら別の値として扱って作り直します。
        利用者の権限や言語で表示が違う部分は、同じキーで保存すると別の利用者に同じ HTML が出るので、キーに含めるか、キャッシュする範囲から外します。{cite}
      </p>
    </>,
    'rails-cache': cite => <>
      <p>
        「作った結果を保存して使い回すキャッシュ」の節では、<code>Rails.cache.fetch</code> のヒット・ミスと有効期限を見ました。この節では、値をどこに保存するか（キャッシュストア）を比べます。
        Redis と Memcached はデータをメモリーに置いて読み書きさせる、データベースとは別のサーバーのプログラムです。
        プロセスのメモリーに保存する MemoryStore では、値はそのプロセスの中にしかありません。Redis などの別のサーバーに保存すると、複数のプロセスやサーバーから同じ値を読めます。
        TTL は Redis が値を消すまでの残り時間で、<code>expires_in</code> の値が使われます。{cite}
      </p>
    </>,
  },
}
