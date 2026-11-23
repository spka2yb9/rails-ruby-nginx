import { ChapterLink, Code } from '../components/content'
import { guide, primarySource, type Explanations } from './shared'

export const explanation06: Explanations = {
  sources: [guide('rails_on_rack', 'Rails on Rack'), primarySource('module Enumerable（inject）', 'Ruby Documentation', 'https://docs.ruby-lang.org/en/4.0/Enumerable.html', 'Ruby 4.0')],
  sections: {
    'rack-contract': cite => <>
      <p>
        ここまでの3つの節で、Web サーバーは HTTP の文字の並びを読み書きし、アプリケーションは要求の内容から応答の内容を作ることを見ました。
        Puma と Rails の間では、要求は Ruby のハッシュ、応答は Ruby の配列として受け渡されます。
        たとえば応答の <code>[200, {`{ "content-type" => "text/plain" }`}, ["Hello"]]</code> は3要素の配列で、1つ目が状態コード、2つ目のハッシュがヘッダー、3つ目の <code>["Hello"]</code> が本文です。
        本文を文字列の配列にしているのは、長い本文を部分に分けて順に渡せるようにするためです。
        Puma はこの配列を受け取り、「HTTP の要求と応答」の節で見た形の文字の並びにして送ります。{cite}
      </p>
    </>,
    'server-and-app': cite => <>
      <p>
        「Web サーバーが受け持つこと」の節の小さなサーバーでは、要求を読み取る処理と、応答の内容を作る処理が1つのプログラムに入っていました。
        Puma と Rails では、この2つが別のオブジェクトに分かれています。
        Puma が Rails を呼ぶのは新たな HTTP の通信ではなく、同じ Ruby のプロセス（実行中のプログラム）の中でのメソッド呼び出しです。
        Rails が返した3要素を Puma が HTTP の応答の形に直してソケットに書き込むので、Rails はソケットを直接扱いません。{cite}
      </p>
    </>,
    middleware: cite => <>
      <p>
        「要求と応答の間に処理を挟む」の節の Announce を Rack の取り決めに合わせて書き直すと、次の Timing の形になります。
        違いは、受け取る値が Rack の env になることと、返す配列がヘッダーを含む3要素になることです。
        Timing は内側を呼ぶ前と後で時計の値を読み、その差を経過時間としてヘッダーに書き込みます。
        <code>Process.clock_gettime(Process::CLOCK_MONOTONIC)</code> は時計の値を秒で返すメソッドで、2回呼んだ値の差が経過時間になります。{cite}
      </p>
    </>,
    'rails-stack': cite => <>
      <p>
        「要求と応答の間に処理を挟む」の節で、A が B を、B がアプリを呼ぶと、要求は外側から、応答は内側から順に処理されることを見ました。
        Rails はこの形でミドルウェアを20個以上重ねています。重ねたミドルウェアの並びをミドルウェアスタックと呼びます。
        入るミドルウェアは環境によって変わります。Rails には開発中に使う development、テストを実行するときの test、本番で動かす production の3つの環境があり、環境ごとに設定が違います（第7章）。
      </p>
      <p>
        例外を HTTP のエラー応答に変えるミドルウェアは、内側の処理の呼び出しを begin と rescue の間に書きます。
        静的ファイル（public ディレクトリにある、そのまま返すファイル）を返せたときは、内側を呼ばずにその場で応答を返すミドルウェアもあります。
        そのため、並びの順によって、どのミドルウェアの例外や応答を扱えるかが変わります。{cite}
      </p>
    </>,
    build: cite => <>
      <p>
        A・B・アプリを組み合わせるときは、まずアプリを作り、それを B に渡し、その B を A に渡します。
        wrap.rb の <code>Announce.new("A", Announce.new("B", app))</code> でも、内側の B を先に作ってから A に渡していました。
        完成した一番外側の A だけを Web サーバーに渡せば、A.call から全体を実行できます。設定に書く並びと、オブジェクトを作る順が逆になるのはこのためです。
      </p>
      <p>
        Ruby の <code>inject</code> は配列の要素を前から順に取り出し、前の回の結果と合わせて1つの値にまとめるメソッドです。
        <code>{'[1, 2, 3].inject(0) { |sum, x| sum + x }'}</code> は、0+1、1+2、3+3 と計算して 6 を返します。
        後で見る build はこの inject を使って、ミドルウェアを内側から1つずつ new して重ねます。
      </p>
      <p>
        Rails.application.call は、要求のたびにミドルウェアを作り直す処理ではありません。組み立て済みの一番外側のミドルウェアの call に、要求を渡す呼び出しです。
        最後のルーティングも同じ call の取り決めでつながっているので、Puma から見た呼び出し方を変えずに、間にミドルウェアを足せます。{cite}
      </p>
    </>,
  },
}

export const explanation07: Explanations = {
  sources: [guide('initialization', 'The Rails Initialization Process'), guide('configuring', 'Configuring Rails Applications')],
  sections: {
    'boot-files': cite => <>
      <p>
        「bin/rails server を実行したときに起きること」の節で見た3つの段階は、それぞれ決まったファイルで行われます。
        config/boot.rb が Bundler を準備し、config/application.rb が gem を読み込み、config/environment.rb が <code>Rails.application.initialize!</code> を呼びます。
        この節では、Puma が起動するときに、これらのファイルがどの順に読み込まれるかを追います。
      </p>
      <p>
        本番環境では、Puma を <code>bin/rails server</code> からではなく、<code>bundle exec puma -C config/puma.rb</code> のように直接起動することがあります。
        <code>bundle exec</code> は「gem と Bundler と require」の節で見たとおり、Gemfile.lock の gem だけを使える状態でコマンドを実行します。<code>-C</code> は Puma の設定ファイルを指定するオプションです。
        <code>config.ru</code> は、Web サーバーが起動時に読み込み、どの Rack アプリケーションを動かすかを決める Ruby のファイルです（第6章）。{cite}
      </p>
    </>,
    railtie: cite => <>
      <p>
        DBを使う機能、メールの機能、追加したgemは、それぞれ起動時に設定したい処理を持つことがあります。
        アプリが各gemの初期化メソッドを1つずつ手書きで呼ぶ方式では、gemを追加するたびに起動処理も変更する必要があります。
        RailsではRailtieを通じて、gem側から設定や初期化処理を登録できます。
      </p>
      <p>
        Engineはその仕組みにルートやモデルなどのアプリに近い構成を持たせたものです。Applicationはアプリ全体を表します。
        小さな起動時の拡張から、画面やルートを含む拡張、アプリ本体へと役割が広がりますが、初期化処理を登録して実行する基本の仕組みを共有しています。{cite}
      </p>
    </>,
    initializers: cite => <>
      <p>
        初期化処理には順序が必要です。たとえば、ある設定を読む処理はその設定を作る処理より後でなければ動きません。
        <code>initializer "名前" do ... end</code>は、後で呼ぶ処理に名前を付けて登録する書き方です。
        登録した時点でブロックの本体をすべて実行するのではなく、initialize!の際に順序を決めて呼びます。
      </p>
      <p>
        <code>before:</code>や<code>after:</code>は別の名前の初期化処理に対する前後関係を指定します。
        ファイルが何行目に書かれているかだけで順序を判断できないのは、複数のRailtieやEngineの登録を集めてから、この依存関係を解決するためです。{cite}
      </p>
    </>,
    'config-files': cite => <>
      <p>
        「環境ごとの設定」の節で見たとおり、<code>config/application.rb</code> はすべての環境に共通の設定、<code>config/environments</code> の環境名のファイルはその環境だけの設定、
        <code>config/initializers/*.rb</code> は起動時に1回実行する初期化ファイルです。
        この節では、それぞれが初期化のどの時点で読み込まれるかを見ます。
      </p>
      <p>
        「initializerという名前のファイル」と「Rails内部で名前付き登録された初期化処理」は同一ではありません。
        initializersディレクトリのファイル群も、Railsが登録している特定の初期化処理から読み込まれます。
        そのため、ディレクトリ内のファイルの順番だけでなく、全体のどの段階で読み込むかが設定の有効範囲を決めます。{cite}
      </p>
    </>,
    'on-load': cite => <>
      <p>
        起動の早い時点では、すべてのクラスが読み込み済みとは限りません。
        あるクラスを変更したいだけなのに、その場で定数を参照して強制的に読み込むと、本来の読み込み時点より前に処理を始めることがあります。
        そこで「その機能の準備ができたら実行する」という形で、処理を先に登録できます。
      </p>
      <p>
        <code>ActiveSupport.on_load(:active_record)</code>のブロックはActiveRecord::Baseの読み込み完了に結び付きます。
        まだなら後で実行し、すでに完了していれば登録時に実行されます。読み込むタイミングを呼び出し元で固定せず、対象の機能が利用できる時点に合わせられます。{cite}
      </p>
    </>,
  },
}

export const explanation08: Explanations = {
  sources: [guide('autoloading_and_reloading_constants', 'Autoloading and Reloading Constants')],
  sections: {
    naming: cite => <>
      <p>
        「require を書かずにクラスを使う」の節では、Greeting を参照したときに Rails が app/models/greeting.rb を読み込みました。
        Rails がファイルを見つけられるのは、クラスの名前とファイルの置き場所が、次のように決まった形で対応しているからです。
      </p>
      <Code lang="text" title="ファイルの置き場所と定義する名前" code={`app/models/article.rb
  → Article

app/models/article_comment.rb
  → ArticleComment

app/controllers/admin/articles_controller.rb
  → Admin::ArticlesController`} />
      <p>
        ファイル名は小文字の単語を _ でつなぎ、定数名はそれぞれの単語の先頭を大文字にしてつなぎます。
        admin ディレクトリは名前空間の Admin になり、その中のファイルは <code>Admin::ArticlesController</code> のように Admin の中の定数を定義します（「クラスの名前は定数」の節）。
        この対応があるので、Article を使うファイルごとに require を書かずに済みます。{cite}
      </p>
    </>,
    autoload: cite => <>
      <p>
        「クラスの名前は定数」の節の最後で、定数がまだ無いときに、名前からファイルを探して読み込めれば require を書かずに済むと述べました。
        そのためには、定数が使われる前に「この名前が必要になったら、このファイルを読む」という対応を登録しておきます。
        Ruby に組み込まれた <code>Module#autoload</code> はこの登録を行うメソッドで、登録した時点ではファイルを実行せず、定数が初めて使われた時点で読み込みます。
      </p>
      <p>
        Zeitwerk はディレクトリを調べ、ファイル名から定数名を求めて、この autoload に登録します。
        そのため、ローダーの setup でディレクトリを調べる段階と、Article を参照して article.rb を実行する段階は別です。
        ファイルを置いただけの状態、autoload に登録された状態、実際に読み込まれた状態を分けて追えます。{cite}
      </p>
    </>,
    'eager-load': cite => <>
      <p>
        「本番環境は起動時にまとめて読み込む」の節で、本番環境では起動時に app/ のファイルがすべて読み込まれることを確かめました。
        この節では、その一括読み込みを Rails と Zeitwerk のどの処理が行うかを見ます。
      </p>
      <p>
        一括読み込みでも、ファイル名と定数名の対応は使われます。オートロードと同じく、ファイルを読み込んだ後に、名前から期待した定数が定義されたかを確かめるからです。
        何を読み込むかは Rails の設定（<code>config.eager_load</code> など）と、Zeitwerk が管理するディレクトリの両方で決まります。{cite}
      </p>
    </>,
    reload: cite => <>
      <p>
        「require を書かずにクラスを使う」の節で、開発環境では greeting.rb を書き換えると、次の要求から新しい内容が返ることを確かめました。
        Rails のリロードは読み込み済みのクラスの中身を書き換えるのではありません。管理している定数を取り除き、同じ名前が次に参照されたときにファイルを読み込み直します。
      </p>
      <p>
        古いArticleクラスを別の変数に保存しておくと、定数Articleが新しいクラスを参照するようになっても、その変数は古いクラスを指し続けます。
        名前が同じであることと、Rubyのオブジェクトとして同一であることは別です。
        再読み込み対象のクラスを長期間保持する設定が問題になるのは、この参照の違いがあるためです。{cite}
      </p>
    </>,
    executor: cite => <>
      <p>
        コントローラーのアクションを書くとき、使い終わったデータベースの接続を返す処理や、前の要求で入れた値を消す処理は書きません。
        こうした処理は、Rails がアクションを呼ぶ前と後に実行しています。
        要求の前には、クエリの結果のキャッシュなどを使える状態にします。要求の後には、例外が起きた場合も含めて後片付けをして、前の要求の値が次の要求に残らないようにします。
        Executor は、この前後の処理を登録しておき、アプリケーションのコードを呼ぶたびに実行する仕組みです。
      </p>
      <p>
        前の節の再読み込みも、アプリケーションのコードがいつ実行中かを知る必要があります。古いクラスを使って処理している途中でそのクラスを取り除くと、処理の前半と後半で別のクラスを使うことになるからです。
        そのため開発環境では、ファイル名と定数名の対応を扱うローダーに加えて、Executor が実行の始まりと終わりを記録します。
        本番環境では再読み込みをしませんが、実行の前後の処理は同じように必要なので、Executor は本番環境でも働きます。{cite}
      </p>
    </>,
  },
}

export const explanation09: Explanations = {
  sources: [guide('routing', 'Rails Routing from the Outside In')],
  sections: {
    dsl: cite => <>
      <p>
        routes.rb に書く <code>get</code> や <code>resources</code> は、Ruby のメソッドの呼び出しです。<code>Rails.application.routes</code>{' '}
        は、アプリケーションのルートをすべて持つ RouteSet のオブジェクトで、routes.rb はその <code>draw</code> メソッドにブロックを渡しています。
        draw はルートを登録するメソッドを持つ Mapper のオブジェクトを作り、ブロックの中の self をそのオブジェクトに切り替えて、instance_exec でブロックを実行します。
        そのため、ブロックの中の <code>get</code> は Mapper の get メソッドの呼び出しになります。素の Ruby で同じ形を作ると、次のようになります（<ChapterLink n={4} section="dsl" />）。
      </p>
      <Code lang="ruby" title="instance_exec.rb と実行結果（Ruby 4.0.9）" code={`class Recorder
  def initialize = @routes = []
  attr_reader :routes
  def get(path, to:) = @routes << "GET #{path} → #{to}"
end

r = Recorder.new
r.instance_exec do
  get "/articles", to: "articles#index"
  get "/articles/:id", to: "articles#show"
end
puts r.routes
# GET /articles → articles#index
# GET /articles/:id → articles#show`} />
      <p>
        <code>def get(path, to:) = ...</code> は、本体が1つの式だけのメソッドを1行で定義する書き方です。<code>instance_exec</code> のブロックの中では self が r
        になるので、ブロックの中の <code>get</code> は r の get メソッドを呼びます。最後の2行の出力は、ブロックに書いた2行が <code>@routes</code> に記録されたことを示します。
      </p>
      <p>
        この節のコードには次の用語も出てきます。collection と member は resources が作るルートの分け方で、collection は記事の全体を対象にするルート（<code>/articles</code>{' '}
        の index と create）、member は1件の記事を対象にするルート（<code>/articles/:id</code> の show・update・destroy）です。scope と namespace
        は複数のルートのパスやコントローラーの名前の前に、同じものをまとめて付け足す書き方です。たとえば <code>namespace :admin</code> のブロックの中に書いた{' '}
        <code>resources :articles</code> は /admin/articles というパスと Admin::ArticlesController を使います。
      </p>
      <p>
        構文木は文字列を部品に分け、部品の組み合わせを木の形で表したものです。<code>Journey::Parser.parse("/articles/:id(.:format)")</code>{' '}
        の結果を、部品の種類と値で表示すると次のようになりました。Cat は2つの部品が続くこと、Slash と Literal と Dot は決まった文字、Symbol は値が入る部分、Group は省略できる部分を表します。{cite}
      </p>
      <Code lang="text" title="/articles/:id(.:format) の構文木（bin/rails runner で表示）" code={`Cat
  Slash "/"
  Cat
    Literal "articles"
    Cat
      Slash "/"
      Cat
        Symbol ":id"
        Group
          Cat
            Dot "."
            Symbol ":format"`} />
    </>,
    route: cite => <>
      <p>
        「ルーティングが決めること」の節で見たとおり、1つのルートはメソッド、パスの形、呼び出すコントローラーとアクションを持ちます。Rails の中では、ルートは Journey::Route
        のオブジェクトとして保存され、要求が来るたびに routes.rb を実行し直すことはしません。この節のコードには、保存したルートすべてのパターンをまとめた状態遷移表（simulator）も出てきます。
      </p>
      <p>
        状態遷移表は入力を先頭から1つずつ読み、読んだ値に応じて次の状態へ進む規則を表にしたものです。/articles、/articles/new、/articles/:id の3つのルートなら、パスを /
        で区切った部分を順に読み、次のように進みます。
      </p>
      <Code lang="text" title="3つのルートをまとめた状態遷移（説明のために簡単にした例）" code={`状態0 ──"articles"──→ 状態1（ここで読み終われば /articles）
状態1 ──"new"────────→ 状態2（ここで読み終われば /articles/new と /articles/:id）
状態1 ──それ以外─────→ 状態3（ここで読み終われば /articles/:id）`} />
      <p>
        パスを1回読み終えたときの状態から、合う可能性のあるルートがまとめて分かります。ルートを1つずつ試す方法と比べ、ルートの数が増えても、読む回数はパスの長さで決まります。
        内部用のルートの説明に出てくる ActionCable は、ブラウザーとサーバーの接続をつないだままにして、サーバーから画面へ変更を送る Rails の機能です。{cite}
      </p>
    </>,
    recognize: cite => <>
      <p>
        Puma は要求を受け取ると、要求の情報を env というハッシュに入れて、Rails のアプリケーションの <code>call(env)</code>{' '}
        を呼びます。アプリケーションは状態コード、ヘッダー、本文の3つを配列にして返します。この取り決めを Rack と呼びます（<ChapterLink n={6} section="rack-contract" />）。
        Rails のアプリケーションは受け取った要求を、ミドルウェア（要求の前後に共通の処理をする部品）に外側から順に通し、最後に RouteSet の call を呼びます。この最後に呼ばれるものをエンドポイントと呼びます（
        <ChapterLink n={6} section="rails-stack" />）。
      </p>
      <p>
        この節のコードの <code>recognize(req) do |route, parameters| ... end</code> は、recognize にブロックを渡し、recognize が候補のルートごとに yield
        でブロックを呼ぶ形です（<ChapterLink n={4} section="block-yield" />）。HEAD は GET と同じ要求を送り、応答の本文を除いてヘッダーだけを返させるメソッドです。constraints
        はルートに付ける追加の条件で、「ルートの順序」の節で例を見ます。x-cascade は Rails が使う応答のヘッダーで、値が pass のときは「このルートでは処理しないので、次の候補を試す」ことを表します。{cite}
      </p>
    </>,
    dispatch: cite => <>
      <p>
        ルートの <code>"articles#show"</code> は、登録のときに controller の <code>"articles"</code> と action の <code>"show"</code>{' '}
        に分けて保存されます。要求がルートに合うと、Dispatcher（ルートとコントローラーの間で受け渡しをするオブジェクト）が、controller の名前からクラスを求めます。
        文字列からクラスを求めるには constantize を使います。constantize は文字列と同じ名前の定数を探して返すメソッドで（クラスの名前も定数です）、<code>"ArticlesController".constantize</code>{' '}
        は ArticlesController のクラスを返します。名前に合う定数が無ければ、NameError（定義されていない名前を使ったときの例外）になります。
      </p>
      <p>
        development では、定数が初めて使われたときに、名前に対応するファイル（ArticlesController なら app/controllers/articles_controller.rb）を読み込みます。この仕組みをオートロードと呼びます（
        <ChapterLink n={8} section="naming" />）。状態コードの 404 は「求められたものが無い」、500 は「サーバーの中で誤りが起きた」ことを表します。{cite}
      </p>
    </>,
    'url-generation': cite => <>
      <p>
        「URL ヘルパーでパスを作る」の節で使った article_path は、routes.rb を実行するときに Rails が定義するメソッドです。プログラムの中で名前を決めてメソッドを定義するには{' '}
        <code>define_method</code> を使います（<ChapterLink n={5} section="define-method" />）。この節のコードは名前の無いモジュール（<code>Module.new</code>{' '}
        で作ったモジュール）にメソッドを定義し、そのモジュールをコントローラーやビューに include します。include はモジュールのメソッドをクラスのインスタンスから呼べるようにします（
        <ChapterLink n={3} section="include" />）。同じ流れを素の Ruby で書くと次のようになります。
      </p>
      <Code lang="ruby" title="helpers_module.rb と実行結果（Ruby 4.0.9）" code={`helpers = Module.new
helpers.define_method(:article_path) { |id| "/articles/#{id}" }
p helpers                     # => #<Module:0x00007f134cb7dc00>

class View
end
View.include(helpers)
p View.new.article_path(1)    # => "/articles/1"`} />
      <p>
        <code>#&lt;Module:0x…&gt;</code> は、名前の無いモジュールを表示したものです。ヘルパーが返すのは文字列で、リンク先のアクションをその場で実行するわけではありません。利用者がリンクを開くと新しい要求が届き、もう一度ルーティングが行われます。{cite}
      </p>
    </>,
    mount: cite => <>
      <p>
        Rack のアプリケーションは <code>call(env)</code> というメソッドを持ち、状態コード、ヘッダー、本文の配列を返すオブジェクトです（<ChapterLink n={6} section="rack-contract" />
        ）。lambda も call で呼べるので、次の lambda は Rack のアプリケーションとして使えます。
      </p>
      <Code lang="ruby" code={`->(env) { [200, { "content-type" => "text/plain" }, ["OK"]] }`} />
      <p>
        Rails のアプリケーションの中に、別の Rack のアプリケーションを組み込むこともできます。この節に出てくる Sidekiq は時間のかかる処理を要求とは別のプロセスで実行する gem
        で（<ChapterLink n={18} section="sidekiq" />）、管理画面を Rack のアプリケーションとして持っています。Engine はルートやコントローラーを持ち、Rails のアプリケーションに組み込める部品です（
        <ChapterLink n={7} section="railtie" />）。
      </p>
      <p>
        env の SCRIPT_NAME と PATH_INFO は、要求のパスを2つに分けて持つ値です。SCRIPT_NAME はアプリケーションが組み込まれた位置までのパス、PATH_INFO はそこから後ろのパスです。Rack::MockRequest
        はテスト用のクラスで、ネットワークを使わずに Rack のアプリケーションへ要求を送れます。{cite}
      </p>
    </>,
  },
}

export const explanation10: Explanations = {
  sources: [guide('action_controller_overview', 'Action Controller Overview'), guide('layouts_and_rendering', 'Layouts and Rendering in Rails')],
  sections: {
    hierarchy: cite => <>
      <p>
        「before_action でアクションの前に処理を入れる」の節の最後で見たとおり、ArticlesController で使った params や render は、継承とモジュールを通して受け継いだメソッドです。
        <code>class ArticlesController &lt; ApplicationController</code> の <code>&lt;</code> は継承を表し、親クラスのメソッドを子クラスのインスタンスから呼べるようにします。モジュールを
        include したクラスでは、モジュールのメソッドも呼べます。<code>ancestors</code> はメソッドを探す順にクラスとモジュールを並べた配列を返します（
        <ChapterLink n={2} section="rails-ancestors" />、<ChapterLink n={3} section="include" />）。素の Ruby で確かめます。
      </p>
      <Code lang="ruby" title="ancestors.rb と実行結果（Ruby 4.0.9）" code={`module Greeting
  def hello = "こんにちは"
end

class Base
  include Greeting
  def params = { id: "1" }
end

class ArticlesController < Base
  def show = "show で params[:id] = #{params[:id]}"
end

p ArticlesController.ancestors.take(3)  # => [ArticlesController, Base, Greeting]
c = ArticlesController.new
p c.show                                # => "show で params[:id] = 1"
p c.hello                               # => "こんにちは"`} />
      <p>
        ArticlesController に params を定義していなくても、親クラスの Base の params を呼べました。この節に出てくる ActionMailer はメールを送るための Rails の機能（
        <ChapterLink n={19} section="mailer" />）、CSRF はほかのサイトのページから利用者のブラウザーを使って勝手に送信させる攻撃です（<ChapterLink n={21} section="csrf" />）。{cite}
      </p>
    </>,
    dispatch: cite => <>
      <p>
        ルーティングの Dispatcher は、<code>ArticlesController.dispatch</code> のように、クラスに対してメソッドを呼びます（クラスメソッド）。クラスメソッドの中で <code>new</code>{' '}
        を呼んでコントローラーのインスタンスを作り、そのインスタンスの dispatch（インスタンスメソッド）がアクションを実行します。この節のコードに出てくる <code>send</code>{' '}
        は、メソッドの名前を文字列やシンボルで受け取って、そのメソッドを呼ぶメソッドです（<ChapterLink n={5} section="send" />）。アクションの名前はルートから文字列で届くので、send で呼べます。
      </p>
      <Code lang="ruby" title="send.rb と実行結果（Ruby 4.0.9）" code={`class ArticlesController
  def show = "show を実行"
end
c = ArticlesController.new
name = "show"
p c.send(name)   # => "show を実行"`} />
      <p>
        <code>def process(action, ...)</code> の <code>...</code> は、残りの引数をまとめて受け取り、次のメソッドにそのまま渡す書き方です。<code>alias send_action send</code>{' '}
        は、send に send_action という別の名前を付けます。flash は次の要求まで残しておくメッセージを入れる場所です。<code>redirect_to @article, notice: "作成しました"</code>{' '}
        と書くと、移動先の画面で <code>flash[:notice]</code> として読めます。flash の中身はセッションに保存されます。before_action（「before_action でアクションの前に処理を入れる」の節）を呼ぶのも、この節の
        process_action の連鎖です。{cite}
      </p>
    </>,
    params: cite => <>
      <p>
        「ルーティングが決めること」（<ChapterLink n={9} section="routing-role" />）と「render と redirect_to」の節で見たとおり、params には、パスの値（id）、クエリ文字列の値（preview）、フォームから送られた値（article）が入ります。
        フォームの値は要求の本文に入って届きます。記事の作成のフォームを curl で送ったとき、要求は次のようになりました。
      </p>
      <Code lang="text" title="フォームを送る要求（curl --trace-ascii の出力から、要求の行・Content-Type・本文を抜き出したもの）" code={`POST /articles HTTP/1.1
Content-Type: application/x-www-form-urlencoded

article[title]=%E3%83%AB%E3%83%BC%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%81%AE%E5%9F%BA%E6%9C%AC&commit=%E4%BD%9C%E6%88%90`} />
      <p>
        本文は <code>名前=値</code> を <code>&amp;</code> でつないだ形で、日本語は <code>%E3%83%AB</code> のような記号の並びに置き換えて送ります。Content-Type
        は本文の形式を表すヘッダーで、application/x-www-form-urlencoded はこのフォームの形式、application/json は JSON の形式です。Rails は Content-Type を見て本文を読み取り、params に入れます。
      </p>
      <p>
        この節に出てくる一括代入は、<code>Article.new(title: "…", body: "…")</code> のように、ハッシュで複数の属性をまとめてモデルに入れることです。モデルに管理者かどうかを表す admin
        という属性があるとき、params をそのまま渡すと、利用者がフォームに無い <code>article[admin]=1</code> を足して送った場合に admin も代入されます。Strong Parameters
        は、permit や expect で許可したキーだけをモデルに渡せるようにして、これを防ぎます。状態コードの 400 は、要求の形が正しくないという意味です。値の型の変換、モデルの検証、その利用者が操作してよいかの確認は、Strong
        Parameters とは別に行います。{cite}
      </p>
    </>,
    render: cite => <>
      <p>
        「コントローラーとアクション」の節で見たとおり、render を書かないアクションでは、アクションと同じ名前のテンプレートが使われます。この節ではその仕組みと、テンプレートが無いときの動きを見ます。
        要求の Accept ヘッダーは受け取りたいデータの種類を表します。ブラウザーがページを開くときは text/html（HTML）を求め、JavaScript から呼ぶ API では application/json（JSON）を求めることがよくあります。
      </p>
      <p>
        この節に出てくる状態コードの 406 は、求められた種類で応答を作れないこと、204 は成功したが本文が無いことを表します。<code>head :no_content</code>{' '}
        は本文を付けずに状態コードだけを返すメソッドです。{cite}
      </p>
    </>,
    exceptions: cite => <>
      <p>
        例外は、処理を続けられない誤りが起きたことを表す Ruby のオブジェクトです。<code>raise</code> で例外を発生させると、その後のコードは実行されず、<code>begin</code>{' '}
        の中なら、例外の種類が合う <code>rescue</code> に移ります。rescue が無ければ、呼び出し元のメソッドへ順にさかのぼります。
      </p>
      <Code lang="ruby" title="rescue.rb と実行結果（Ruby 4.0.9）" code={`def find_article(id)
  raise ArgumentError, "記事 #{id} はありません" if id > 3
  "記事#{id}"
end

begin
  puts find_article(1)
  puts find_article(9)
  puts "ここは実行されない"
rescue ArgumentError => e
  puts "rescue した: #{e.class}: #{e.message}"
end
# 記事1
# rescue した: ArgumentError: 記事 9 はありません`} />
      <p>
        Rails のコントローラーでは例外の種類ごとの処理を <code>rescue_from</code> で登録できます。デモのアプリケーションの ProbeController は、記事が見つからないときに Article.find
        が発生させる ActiveRecord::RecordNotFound を、not_found メソッドで処理しています。
      </p>
      <Code lang="ruby" title="app/controllers/probe_controller.rb（一部）" code={`class ProbeController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  def find_rescued
    Article.find(999_999)
  end

  private
    def not_found
      render plain: "見つかりません（rescue_from）", status: :not_found
    end
end`} />
      <p>
        rescue_from で処理しない例外は、コントローラーの外のミドルウェアまで伝わり、エラーの画面になります。development では誤りの場所を示す詳しい画面、production では public/404.html や
        public/500.html のような、前もって用意したページが返ります。状態コードの 404 は見つからない、400 は要求の形が正しくない、422 は送られた内容を処理できない、500
        はサーバーの中で誤りが起きたことを表します。{cite}
      </p>
    </>,
    'cookies-session': cite => <>
      <p>
        「Cookie とセッションでログインを覚える」の節で、セッションの中身が暗号化されて _demo_session という Cookie に入ることを見ました。この節ではその Cookie
        をどこで読み書きし、どう守るかを見ます。署名は値と秘密の鍵から計算した文字列を値に付けたものです。鍵を知らない人が値を書き換えると署名と合わなくなるので、書き換えを見つけられます。暗号化は、鍵を知らない人が中身を読めないように値を変換することです。
      </p>
      <p>
        この節に出てくる secret_key_base は、アプリケーションごとの秘密の文字列で、署名と暗号化の鍵はこれから作られます（<ChapterLink n={21} section="secrets" />
        ）。ソルトは同じ secret_key_base から用途ごとに違う鍵を作るために混ぜる文字列、AES-256-GCM は暗号化の方式の名前です。{cite}
      </p>
    </>,
  },
}
