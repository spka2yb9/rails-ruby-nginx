import { Code } from '../components/content'
import { guide, primarySource, type Explanations } from './shared'

export const explanation06: Explanations = {
  sources: [guide('rails_on_rack', 'Rails on Rack'), primarySource('HTTP Semantics', 'IETF', 'https://www.rfc-editor.org/rfc/rfc9110.html', 'RFC 9110')],
  sections: {
    'rack-contract': cite => <>
      <p>
        ブラウザーがURLを開くと、HTTPメソッドとパスなどを含む要求を送ります。
        <code>GET /articles/1</code>なら「この記事を取得する」という要求です。応答には成功や失敗を示すステータス、
        データの種類などを伝えるヘッダー、画面のHTMLなどの本文が含まれます。GETは取得、POSTはデータの送信などに使うHTTPメソッドです。
      </p>
      <Code lang="text" title="HTTP/1.1の要求と応答を短くした例" code={`GET /articles/1 HTTP/1.1
Host: example.test

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

<h1>Rubyの記事</h1>`} />
      <p>
        前半が要求、後半が応答です。<code>200</code>は成功、Content-Typeは本文の種類を表します。
        この通信上の情報をRubyの処理へ渡すには、パスやヘッダーをRubyの値へ変える必要があります。
        その受け渡しの規則がRackです。Webサーバー側が要求をHashにし、アプリ側はステータス・ヘッダー・本文を返します。
      </p>
      <p>
        たとえば応答の<code>[200, {`{ "content-type" => "text/plain" }`}, ["Hello"]]</code>は、外側が3要素の配列です。
        内側のHashがヘッダー、<code>["Hello"]</code>が本文です。本文を文字列の配列にしているのは、本文の各部分を順に渡せる形にするためです。
        通信上は文字やバイト列でも、PumaからRailsへ渡す段階ではRubyのオブジェクトとして扱われます。{cite}
      </p>
    </>,
    'server-and-app': cite => <>
      <p>
        Webサーバーの仕事には通信相手との接続を保つこと、要求を読み取ること、応答を書き込むことがあります。
        それに対し、記事を取得してHTMLを作る仕事はアプリ側です。
        ソケットはOSが用意する通信の接続口で、Rubyのメソッド呼び出しとは異なります。
      </p>
      <p>
        ブラウザーやNginxからPumaへはHTTPのデータが届きます。Pumaはそれを解析して<code>env</code>を作り、
        <code>app.call(env)</code>でアプリを呼びます。ここは新たなHTTP通信ではなく、同じRubyプロセス内のメソッド呼び出しです。
        返された3要素をPumaがHTTPの応答に変えて接続へ書き込むため、アプリはソケットへの書き込みを直接実装せずに済みます。{cite}
      </p>
    </>,
    middleware: cite => <>
      <p>
        <code>before</code>という処理で開始時刻を記録し、アプリを実行してから<code>after</code>で経過時間を出したい場合を考えます。
        アプリごとに同じコードを書く代わりに、内側のアプリを呼ぶオブジェクトを1つ追加できます。
        そのオブジェクトもcallを持ち、同じ形の引数を受けて同じ形の応答を返せば、Webサーバーからは通常のアプリとして呼べます。
      </p>
      <p>
        この中間のオブジェクトがミドルウェアです。<code>@app.call(env)</code>の前が前処理、戻ってきた後が後処理になります。
        <code>status, headers, body = @app.call(env)</code>は、返された配列の3要素を別々の変数に受け取る多重代入です。
        返ってきたheadersへ値を加え、同じ3要素の形で返せば、内側のアプリを変えずに応答を加工できます。{cite}
      </p>
    </>,
    'rails-stack': cite => <>
      <p>
        ミドルウェアを複数置くと、外側が次のミドルウェアを呼び、さらにその内側を呼ぶ形になります。
        A→B→アプリの順で呼んだ場合、結果はアプリ→B→Aの順で戻ります。
        最初に要求を見るものが応答を最後に加工する関係です。この並びをミドルウェアスタックと呼びます。
      </p>
      <p>
        例外をHTTPのエラー応答に変えるミドルウェアなら、内側の処理を呼ぶ範囲を例外処理で囲みます。
        静的ファイルを返せた場合は内側へ進まず、その場で応答を返すものもあります。
        一覧に出る順番は単なる分類ではなく、どの処理を囲み、どこまでの例外や応答を扱えるかに関わります。{cite}
      </p>
    </>,
    build: cite => <>
      <p>
        A・B・アプリを組み合わせるときは、まずアプリを作り、Bへ渡し、そのBをAへ渡します。
        完成した一番外側のAだけをWebサーバーへ渡すと、A.callから全体を実行できます。
        設定上の並びと、オブジェクトを組み立てる順番が逆になるのはこのためです。
      </p>
      <p>
        Rails.application.callは、要求のたびにすべてのミドルウェアを作り直す処理ではありません。
        組み立てられた経路へ要求を渡す呼び出しです。最後のルーティングも同じcallの規約で接続されるため、Pumaから見た呼び出し口を変えずに内部の構成を追加できます。{cite}
      </p>
    </>,
  },
}

export const explanation07: Explanations = {
  sources: [guide('initialization', 'The Rails Initialization Process'), guide('configuring', 'Configuring Rails Applications')],
  sections: {
    'boot-files': cite => <>
      <p>
        <code>bin/rails server</code>を実行すると、Rubyのプログラムが起動し、設定やライブラリを読み込んで要求を待ち受けます。
        この準備が初期化です。要求が1件来るたびに、Gemfileの読み込みからすべてをやり直すわけではありません。
        起動時に決めることと、要求ごとに行うことを分けると、設定ファイルが関わる時点を整理できます。
      </p>
      <p>
        gemのインストールはファイルを利用できる場所へ配置する操作で、<code>require</code>は実行中のRubyへ定義を読み込む操作です。
        BundlerはGemfile.lockに沿ったgemを使えるようにします。<code>bundle exec puma</code>は、そのアプリのgemの組み合わせでPumaを実行するコマンドです。
        <code>config.ru</code>は、Pumaなどが起動するRackアプリを指定するファイルです。ここからRailsの準備が呼ばれます。{cite}
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
        <code>config/application.rb</code>はアプリ全体、<code>config/environments/*.rb</code>は開発・テスト・本番などの環境ごとの設定です。
        <code>config/initializers/*.rb</code>には、起動時に実行する追加の設定処理を置きます。
        環境はそれぞれdevelopment・test・productionという名前で区別します。
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
        Rubyのファイルにクラスを書いても、そのファイルが読み込まれていなければ定義は使えません。
        Railsではアプリの決まったディレクトリにファイルを置き、名前の規則をそろえることで、クラスが必要になった時点の読み込みを任せられます。
        この必要時の読み込みがオートロードです。
      </p>
      <Code lang="text" title="ファイルの置き場所と定義する名前" code={`app/models/article.rb
  → Article

app/models/article_comment.rb
  → ArticleComment

app/controllers/admin/articles_controller.rb
  → Admin::ArticlesController`} />
      <p>
        <code>Article</code>はクラス名であり、Rubyでは定数として参照します。定数は先頭が大文字の名前です。
        <code>Admin::ArticlesController</code>は、Adminという名前空間の中の定数です。
        ファイル名を小文字とアンダースコア、定数名を単語の先頭を大文字にした形で対応付けるため、Articleを使うコードごとにrequireを書かずに済みます。{cite}
      </p>
    </>,
    autoload: cite => <>
      <p>
        自動読み込みを行うには、クラスを実行する前に「この名前が必要になったら、このファイルを読む」という対応を登録しておく必要があります。
        Ruby標準の<code>autoload</code>はその登録を行います。登録時点ではファイルのクラス本体を実行せず、定数を使う時点で読み込みます。
      </p>
      <p>
        Zeitwerkはディレクトリを調べ、ファイル名から定数名を求め、Rubyのautoloadへ登録します。
        したがって、ローダーのsetupでディレクトリを調べる段階と、Articleを参照してarticle.rbを実行する段階は別です。
        ファイルを配置しただけなのか、読み込み予約があるのか、実際に読み込まれたのかを分けて追えます。{cite}
      </p>
    </>,
    'eager-load': cite => <>
      <p>
        必要な定数だけ読む方式では、初めてその機能を使う要求の中でファイル読み込みが発生します。
        一括読み込みは管理対象のファイルを先に読み、要求を処理する前に定義を用意する方式です。
        本番でどのタイミングに読み込みを済ませるかが、起動時間と初回利用時の処理に関わります。
      </p>
      <p>
        どちらの方式も、同じクラス定義を実行して利用可能にする点は共通です。
        オートロードを使わず一括読み込みをしたからといって、ファイル名と定数名の対応が不要になるわけではありません。
        Railsの設定とZeitwerkの管理対象の両方が、何を読み込むかを決めます。{cite}
      </p>
    </>,
    reload: cite => <>
      <p>
        開発中はサーバーを起動したままモデルのファイルを書き換えます。
        変更を次の要求へ反映するには、以前の定義を使い続けず、ファイルを再び評価する必要があります。
        Railsのリロードは管理している定数を取り除き、同じ名前を次に参照したときに読み込み直す形で行います。
      </p>
      <p>
        古いArticleクラスを別の変数に保存しておくと、定数Articleが新しいクラスを参照するようになっても、その変数は古いクラスを指し続けます。
        名前が同じであることと、Rubyのオブジェクトとして同一であることは別です。
        再読み込み対象のクラスを長期間保持する設定が問題になるのは、この参照の違いがあるためです。{cite}
      </p>
    </>,
    executor: cite => <>
      <p>
        アプリのコードを実行する際には、要求の前後でDB接続やキャッシュなどの状態を整える処理も必要です。
        例外が起きた場合でも終了後の処理を行い、前の要求の状態を次の要求へ持ち越さないようにします。
        Executorはこの実行前後の処理をまとめる仕組みです。
      </p>
      <p>
        再読み込みを行う側から見ると、古いクラスを使って処理中のコードとの調整も必要になります。
        そのため、ファイル名の対応を作るローダーだけでなく、アプリがいつ実行中かを管理する仕組みも関わります。
        本番では再読み込みをしなくても、実行前後の状態管理は必要です。{cite}
      </p>
    </>,
  },
}

export const explanation09: Explanations = {
  sources: [guide('routing', 'Rails Routing from the Outside In')],
  sections: {
    dsl: cite => <>
      <p>
        URLの<code>https://example.test/articles/1?preview=true</code>では、example.testがホスト名、
        <code>/articles/1</code>がパス、<code>preview=true</code>がクエリ文字列です。
        ルーティングはHTTPメソッドとパスなどから処理の行き先を決めます。
        同じパスでも、GETなら表示、PATCHなら更新というように別の処理へ対応付けられます。
      </p>
      <Code lang="ruby" title="1つのURLと1つの処理を対応付ける" code={`Rails.application.routes.draw do
  get "/articles/:id", to: "articles#show", as: :article
end`} />
      <p>
        <code>GET /articles/1</code>なら、ArticlesControllerのshowというアクションを呼ぶ定義です。
        アクションは要求を処理するコントローラーのメソッドです。変化する<code>:id</code>の部分には<code>"1"</code>が入り、
        アクションから<code>params[:id]</code>で取り出せます。asで付けた名前はパスを組み立てるヘルパーにも使います。
      </p>
      <p>
        <code>resources :articles</code>は、一覧・詳細・作成・更新・削除などのルートをまとめて登録します。
        登録しただけではアクションを実行せず、後から要求が来たときの対応が用意されます。
        drawがルート定義用のオブジェクトをselfとしてブロックを実行することで、そのオブジェクトのgetやresourcesを、呼び出し先を省略して使えます。{cite}
      </p>
    </>,
    route: cite => <>
      <p>
        ルートには「受け付けるHTTPメソッド」「一致させるパスの形」「値として取り出す部分」「呼び出し先」を記録する必要があります。
        <code>/articles/:id</code>は固定の文字列だけではなく、変化する部分を含むパターンです。
        Railsは、この定義を要求が来るたびにRubyのソースから読み直すのではなく、照合に使うオブジェクトとして保持します。
      </p>
      <p>
        Journeyはこのパスの解析や照合を担当する実装です。構文木はパスを文字列のまま扱う代わりに、固定部分や変化する部分を構造として表したものです。
        Routeの中の<code>app</code>は一致した後に呼ぶ処理です。
        こうして条件と行き先を同じルートへまとめることで、照合から実行へ進めます。{cite}
      </p>
    </>,
    recognize: cite => <>
      <p>
        ルートの登録は起動や再読み込みの際に行い、照合は各リクエストに対して行います。
        たとえばGETと<code>/articles/1</code>が届いたら、まずパスに合い得るルートを選び、HTTPメソッドや制約も満たすかを調べます。
        ルート数が増えると、すべてに同じ処理を繰り返すのではなく、候補を絞るための内部構造が重要になります。
      </p>
      <p>
        照合結果には行き先だけでなく<code>id</code>のようにパスから取り出した値も含まれます。
        RouteSetはcallでRackの要求を受け取り、照合を担当するルーターへ渡し、一致したルートのappを呼びます。
        単に文字列を比べて終わるのではなく、呼び出しに使える情報を作る処理までがルーティングです。{cite}
      </p>
    </>,
    dispatch: cite => <>
      <p>
        <code>"articles#show"</code>は、文字列の中に直接メソッド本体が入っているわけではありません。
        登録時にコントローラー名とアクション名へ分け、要求が一致した後で、コントローラーのクラスと呼ぶアクションを決めます。
        <code>path_parameters</code>は、このようなパスの照合で決まった値を保持する情報です。
      </p>
      <p>
        Dispatcherはルーティングの照合結果をコントローラーへ渡す役割です。
        ルーティングの条件を解釈する処理と、コントローラーのインスタンスを作ってアクションを実行する処理を分けることで、Rackアプリを直接呼ぶルートなども同じ照合に組み込めます。{cite}
      </p>
    </>,
    'url-generation': cite => <>
      <p>
        受け取ったパスから処理を決めるのとは逆に、ビューなどでは行き先からパスを作る必要があります。
        名前付きルートがあれば、<code>article_path(1)</code>から<code>"/articles/1"</code>を作れます。
        <code>article_url(1)</code>はホスト名などを含めたURLを作り、メールの中のリンクなどで使います。
      </p>
      <p>
        ヘルパーが生成するのは文字列であり、リンク先のアクションをその場で実行するわけではありません。
        HTMLへその文字列を埋め込み、利用者がリンクを開いて新しい要求を送ったときに、再びルーティングの照合が行われます。
        登録した1つの定義を、要求の認識とURLの生成の両方向で利用している関係です。{cite}
      </p>
    </>,
  },
}

export const explanation10: Explanations = {
  sources: [guide('action_controller_overview', 'Action Controller Overview'), guide('layouts_and_rendering', 'Layouts and Rendering in Rails')],
  sections: {
    hierarchy: cite => <>
      <p>
        コントローラーのアクションには入力を受け取り、必要なモデルを操作し、応答を決める処理を書きます。
        記事の詳細表示なら、パスから記事のIDを受け取り、その記事を取得してビューへ渡します。
        <code>articles</code>テーブルに対象の行がある場合、基本形は次のようになります。
      </p>
      <Code lang="ruby" title="app/controllers/articles_controller.rbの基本形" code={`class ArticlesController < ApplicationController
  def show
    @article = Article.find(params[:id])
  end
end`} />
      <p>
        <code>Article.find</code>はIDからレコードを取得し、結果を<code>@article</code>へ代入します。
        paramsやビューの描画をこのファイルに定義していないのに使えるのは、ApplicationControllerやその親クラス、組み込まれたモジュールの機能を引き継ぐためです。
        アプリが書く1つのshowの前後には、その共通処理が加わります。{cite}
      </p>
    </>,
    dispatch: cite => <>
      <p>
        ルーティングから渡ってくるのは、呼ぶコントローラーのクラス、アクションの名前、要求と応答の情報です。
        クラスに対する呼び出しを受け、要求を担当するインスタンスへ情報を渡し、showなどのメソッドを実行します。
        <code>dispatch</code>は、これらを受け渡して実行を進めるための内部の呼び出し口です。
      </p>
      <p>
        <code>before_action :set_article</code>のような設定がある場合は、showを呼ぶ前に登録した処理を実行します。
        例外処理や計測も同じアクションの実行を囲みます。複数のモジュールがprocess_actionを定義しsuperで次を呼ぶため、1つのアクションへ共通処理を重ねられます。{cite}
      </p>
    </>,
    params: cite => <>
      <p>
        <code>GET /articles/1?preview=true</code>なら、パスからid、クエリ文字列からpreviewという値を受け取ります。
        フォームやJSONの要求では本文にも値が入ります。paramsはその入力をアクションから扱うためのオブジェクトです。
        パスの<code>1</code>やフォームの数字が最初からRubyの整数になるとは限りません。
      </p>
      <Code lang="ruby" title="入力の構造と、まとめて渡す項目の選択" code={`# 入力が article: { title: "Ruby", published: "1" } の形の場合
attributes = params.require(:article).permit(:title)
# titleだけをモデルへの一括代入の対象にする`} />
      <p>
        <code>require</code>は必要なキーを取り出し、<code>permit</code>は許可する項目を指定します。
        Strong Parametersは、管理者用の項目などを想定外にまとめて代入させないための仕組みです。
        値の型への変換、モデルの検証、本人の記事を編集してよいかという認可は、それぞれ別に確認します。{cite}
      </p>
    </>,
    render: cite => <>
      <p>
        renderはテンプレートやJSONなどを使って今回の要求の応答を作ります。
        showが記事を取得するだけなら、通常はアクションと同名の<code>app/views/articles/show.html.erb</code>が描画されます。
        これを暗黙の描画と呼びます。コントローラーのインスタンス変数をビューへ渡し、HTMLなどを作って応答の本文にします。
      </p>
      <p>
        <code>redirect_to</code>は、別のURLを開くようブラウザーへ応答する処理です。
        保存後に詳細画面へ移動する場合、保存への要求と、リダイレクト先の詳細表示への要求は別になります。
        renderでは同じ要求の中で表示を作り、リダイレクトでは次の要求を発生させるため、どのアクションで値が用意されたかも変わります。{cite}
      </p>
    </>,
    'cookies-session': cite => <>
      <p>
        HTTPの各要求だけでは、前の要求と同じ利用者かをアプリが継続して識別する仕組みはありません。
        Cookieは、サーバーから渡された値をブラウザーが保存し、後の要求で送る仕組みです。
        セッションはログイン中の利用者のIDなど、要求をまたいで必要な情報を扱います。
      </p>
      <p>
        RailsのCookieStoreでは、セッションの値を暗号化したCookieに保存します。
        アクションでsessionへ値を代入した後、応答へCookieの情報を書き込み、次の要求で読み取る処理が必要です。
        コントローラーのsessionやcookiesというAPIの前後に、ミドルウェアによる読み込みと書き出しがある関係です。{cite}
      </p>
    </>,
  },
}
