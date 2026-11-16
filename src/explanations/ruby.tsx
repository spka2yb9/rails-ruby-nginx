import { Code } from '../components/content'
import { guide, rubyDoc, type Explanations } from './shared'

export const explanation01: Explanations = {
  sources: [guide('getting_started', 'Getting Started with Rails'), rubyDoc('Method', 'Method — owner / source_location / super_method')],
  sections: {
    scope: cite => <>
      <p>
        記事の詳細画面を開くとき、ブラウザーは記事のURLへ要求を送ります。この要求がリクエストです。
        サーバーは要求を受け、記事のデータを取得して画面用のHTMLを作り、レスポンスとして返します。
        HTMLは見出しや段落などを記述する形式で、ブラウザーが解釈して画面に表示します。HTTPはこの要求と応答の規則です。
        HTTPSではTLSによって通信を暗号化します。
      </p>
      <p>
        Rubyはプログラミング言語、RailsはRubyでWebアプリを作るためのフレームワークです。
        フレームワークは要求を受ける処理、データの保存、画面の生成などに共通する仕組みと書き方を提供します。
        アプリ側には「どの記事を取得するか」「どの値を保存してよいか」といった、そのアプリの処理を書きます。
      </p>
      <p>
        Railsでは主に3つの役割に分けます。コントローラーが要求に対応する処理を進め、モデルがデータの取得・保存や業務上の条件を扱い、ビューが表示する内容を組み立てます。
        この分担をMVCと呼びます。記事を開く例なら、コントローラーが記事のIDを受け取り、モデルで記事を取得し、ビューでタイトルをHTMLにします。
        DBはデータを保存する仕組み、MySQLはその管理を行うソフトウェアです。
      </p>
      <p>
        コントローラーの処理に到達するまでにも、通信を受け付けるソフトウェアが動いています。
        PumaはHTTPを受けてRubyのアプリを呼ぶサーバーです。Nginxはその前で要求を転送したり、保存済みの画像やCSSを返したりできます。
        さらに複数のサーバーへ振り分けるロードバランサーを置く構成もあります。これらを同じ「サーバー」という言葉で済ませず、どの要求を誰が処理するかを区別します。{cite}
      </p>
    </>,
    gems: cite => <>
      <p>
        gemはRubyのライブラリを配布する単位です。Gemfileには使うgemとバージョンの条件を書き、Bundlerが依存するgemも含めた組み合わせを決めます。
        Gemfile.lockはそのとき解決された具体的なバージョンを記録するファイルです。「AがBに依存する」は、Aを動かすためにBも必要だという意味です。
      </p>
      <p>
        たとえば、メールを作る機能は本文を描画する機能も使います。メール用のgemだけで描画の実装を持ち直す代わりに、別のgemを利用できます。
        Railsもルーティング・DB操作・画面描画などのgemを組み合わせて動きます。アプリで呼んだメソッドの定義が、Gemfileに直接書いていない依存先のgemにある場合もあります。{cite}
      </p>
    </>,
    'find-source': cite => <>
      <p>
        ターミナルはコマンドを入力してプログラムを動かす画面です。Railsアプリのディレクトリで<code>bin/rails console</code>を実行すると、
        アプリのクラスを使いながらRubyの式を試せます。式の結果は戻り値と呼びます。ソースコードはその処理を定義したコードそのものです。
      </p>
      <Code lang="ruby" title="メソッドの実行と、メソッドの情報の取得" code={`class Greeting
  def text
    "こんにちは"
  end
end

greeting = Greeting.new
greeting.text             # => "こんにちは"
method = greeting.method(:text)
method.owner              # => Greeting`} />
      <p>
        <code>Greeting</code>はクラス、<code>Greeting.new</code>で作った個々のオブジェクトはインスタンスです。
        <code>greeting.text</code>は処理を実行します。一方、<code>greeting.method(:text)</code>は処理を実行せず、そのメソッドを表すオブジェクトを取り出します。
        <code>:text</code>はメソッド名を表すシンボルです。取り出したオブジェクトの<code>owner</code>は定義元を返し、<code>source_location</code>はRubyで定義されたファイルと行番号を返します。
      </p>
      <p>
        Railsの<code>save</code>にもこうして定義の情報を問い合わせられます。
        アプリのモデルに<code>def save</code>がなくても、親クラスや組み込まれたモジュールに定義があれば呼び出せます。
        その実際の定義元を調べることで、アプリの1行とRails内部の処理を結び付けられます。{cite}
      </p>
    </>,
    trace: cite => <>
      <p>
        ファイルに定義されたコードには、条件によって通る部分と通らない部分があります。
        たとえば保存できなかったときは、保存前の検証で止まったのか、DBへ問い合わせて失敗したのかで調べる場所が変わります。
        ログは実行時の記録、デバッガは実行を途中で止めて値を調べる道具です。
      </p>
      <p>
        メソッドAがBを、BがCを呼んで停止したなら、A→B→Cという呼び出しの履歴があります。これがコールスタックです。
        現在の変数とコールスタックを一緒に見ると、値がどこから来たかを調べられます。
        静的な定義場所の調査に、実際に通った経路の確認を加えることで、不具合が発生した処理を絞れます。{cite}
      </p>
    </>,
  },
}

export const explanation02: Explanations = {
  sources: [rubyDoc('syntax/calling_methods_rdoc', 'Calling Methods'), rubyDoc('syntax/methods_rdoc', 'Methods'), rubyDoc('syntax/modules_and_classes_rdoc', 'Modules and Classes')],
  sections: {
    'rails-syntax': cite => <>
      <p>
        Rubyのコードは値を作り、変数で参照し、メソッドを呼び出す形で読めます。
        <code>name = "rails"</code>では文字列のオブジェクトに<code>name</code>という変数から参照できるようにし、
        <code>name.upcase</code>ではその文字列に対して大文字へ変換するメソッドを呼びます。呼び出し先のオブジェクトをレシーバと呼びます。
        メソッドへ渡す値が引数、メソッドから返る値が戻り値です。
      </p>
      <Code lang="ruby" title="値を作り、メソッドへ渡し、戻り値を受け取る" code={`name = "rails"
upper = name.upcase
upper # => "RAILS"

names = ["Aki", "Mika"]
names.first # => "Aki"

options = { title: "Ruby", published: true }
options[:title] # => "Ruby"`} />
      <p>
        <code>[...]</code>は順序を持つArray、<code>{'{...}'}</code>はキーと値を対応付けるHashです。
        <code>:title</code>のようなシンボルは属性やメソッドなどの名前によく使います。
        <code>true</code>と<code>false</code>は真偽、<code>nil</code>は値がない状態などを表します。
        <code>=</code>は代入、<code>==</code>は比較です。Railsの設定やモデルの宣言も、これらの値とRubyのメソッド呼び出しを使っています。{cite}
      </p>
    </>,
    'object-contents': cite => <>
      <p>
        クラスはある種類のオブジェクトで使うメソッドを定義するものです。インスタンスはそのクラスから作った個々のオブジェクトです。
        メソッドはクラス側に定義し、それぞれのインスタンスの値は<code>@</code>で始まるインスタンス変数に保存できます。
      </p>
      <Code lang="ruby" title="同じメソッドを使い、別々の値を持つ" code={`class Note
  def initialize(title)
    @title = title
  end

  def title
    @title
  end
end

first = Note.new("Ruby")
second = Note.new("Rails")
first.title  # => "Ruby"
second.title # => "Rails"`} />
      <p>
        <code>new</code>で作成すると、<code>initialize</code>に引数が渡り、作られたインスタンスの<code>@title</code>に保存されます。
        <code>first.title</code>と<code>second.title</code>は同じ定義を実行しますが、読んでいる変数の持ち主が違うため結果も異なります。
        オブジェクトの構造を調べる際には、個々のデータと、共有するメソッドの定義を区別します。{cite}
      </p>
    </>,
    'class-is-object': cite => <>
      <p>
        <code>Note.new</code>も「オブジェクトにメソッドを呼ぶ」という形です。この場合のレシーバは<code>Note</code>です。
        <code>Note</code>という定数がクラスを表すオブジェクトを参照し、そのオブジェクトが<code>new</code>を実行して別のインスタンスを作ります。
        <code>first.class</code>が<code>Note</code>を返すのは、インスタンスから所属するクラスを参照できるためです。
      </p>
      <p>
        つまり、<code>Note</code>と<code>first</code>はどちらもオブジェクトですが役割が違います。
        <code>Note.class</code>でクラス自体の種類を調べることと、<code>first.class</code>でインスタンスの種類を調べることを分けると、ClassやObjectの関係を追えます。{cite}
      </p>
    </>,
    self: cite => <>
      <p>
        <code>first.title</code>の実行中は、メソッドの中の<code>self</code>が<code>first</code>の指すオブジェクトです。
        同じ定義でも<code>second.title</code>なら<code>self</code>は<code>second</code>の指すオブジェクトになります。
        <code>@title</code>はそのときの<code>self</code>の変数なので、インスタンスごとの値を取得できます。
      </p>
      <p>
        呼び出し先を省略した<code>title</code>も現在の<code>self</code>に対するメソッド呼び出しになります。
        ただし、<code>title = ...</code>はローカル変数への代入と解釈されます。属性へ代入するメソッドを呼びたい場合に<code>self.title = ...</code>と書くのは、この違いがあるためです。{cite}
      </p>
    </>,
    'method-lookup': cite => <>
      <p>
        継承は別のクラスで定義したメソッドを引き継ぐ仕組みです。
        <code>class Child &lt; Parent</code>は、<code>Child</code>の親クラスが<code>Parent</code>であることを示します。
        子にないメソッドも親にあれば実行でき、子に同じ名前を定義すれば子の処理を使います。後者をオーバーライドと呼びます。
      </p>
      <Code lang="ruby" title="定義がないメソッドを親から探す" code={`class Parent
  def label
    "親の定義"
  end
end

class Child < Parent
end

Child.new.label # => "親の定義"`} />
      <p>
        <code>Child.new</code>が作ったインスタンスに<code>label</code>を呼ぶと、まず子の定義を調べ、そこになければ親を調べます。
        <code>superclass</code>は直接の親クラス、<code>ancestors</code>は組み込まれたモジュールも含めた探索の並びを確認するメソッドです。
        クラスに書いていないメソッドをRailsのモデルで呼べることも、この探索に基づきます。{cite}
      </p>
    </>,
    'method-missing': cite => <>
      <p>
        メソッド名を書き間違えたときに発生する<code>NoMethodError</code>は、定義を探しても呼べるものがなかった結果です。
        ただしRubyには、見つからなかった呼び出しを<code>method_missing</code>で受け取る仕組みがあります。
        通常のメソッドの代わりに、指定された名前や引数を調べて処理を分けることもできます。
      </p>
      <p>
        そのため、見た目は<code>obj.foo</code>でも、<code>def foo</code>が存在する場合と、見つからなかった呼び出しを動的に処理する場合があります。
        「名前どおりの定義がない」ことだけで、必ず呼べないと判断できるわけではありません。{cite}
      </p>
    </>,
  },
}

export const explanation03: Explanations = {
  sources: [rubyDoc('syntax/modules_and_classes_rdoc', 'Modules and Classes'), rubyDoc('Module', 'Module — include / prepend / extend')],
  sections: {
    'module-basics': cite => <>
      <p>
        複数のクラスで同じメソッドを使いたい場合、そのためだけに同じ親クラスを継承すると、クラスの関係まで固定されます。
        たとえば記事にも通知にも表示用のラベルを付けたくても、どちらも「同じ種類のもの」として扱う必要があるとは限りません。
        共通の処理をモジュールにまとめ、必要なクラスへ組み込む方法があります。
      </p>
      <p>
        一方、<code>Admin::Report</code>と<code>Public::Report</code>のように、同じReportという名前を区別するためにもモジュールを使えます。
        <code>::</code>は、その名前の内側にある定数を指定する書き方です。処理の共有と名前の区分は、同じモジュールの別々の用途です。{cite}
      </p>
    </>,
    include: cite => <>
      <Code lang="ruby" title="モジュールに分けた処理をインスタンスから呼ぶ" code={`module Labelled
  def label
    "表示用ラベル"
  end
end

class Report
  include Labelled
end

Report.new.label # => "表示用ラベル"`} />
      <p>
        <code>Report</code>の本体に<code>def label</code>はありませんが、インスタンスから呼び出せます。
        <code>include</code>は、Reportのインスタンスでメソッドを探す経路にLabelledを加えます。メソッドをReportのソースへ文字としてコピーする操作ではありません。
        どこへ組み込まれたかは<code>Report.ancestors</code>で確かめられます。
      </p>
      <p>
        ここで調べたいのは、クラスにも同じ名前のメソッドがある場合の優先順位です。
        組み込み順が結果を変えるため、モジュールの一覧だけでなく、クラスに対して前後どちらに並ぶかが意味を持ちます。{cite}
      </p>
    </>,
    prepend: cite => <>
      <p>
        保存などの既存処理の前後に計測を加える場合、元の定義を呼びながら追加処理を実行したくなります。
        モジュール側の同名メソッドを先に呼び、その中から<code>super</code>で次の定義を呼べば、開始時刻の記録→元の処理→経過時間の記録という順にできます。
        <code>prepend</code>は、そのためにクラスより先にモジュールを探索させる組み込み方です。
      </p>
      <p>
        <code>include</code>と同じメソッドを組み込んでも、探索位置が変われば実行順が変わります。
        「同じ名前の定義が複数ある」ことと「どの定義が最初に実行される」ことを、別々に確かめる必要があります。{cite}
      </p>
    </>,
    super: cite => <>
      <Code lang="ruby" title="親の戻り値を利用して返す" code={`class Message
  def text
    "お知らせ"
  end
end

class ImportantMessage < Message
  def text
    "【重要】" + super
  end
end

ImportantMessage.new.text # => "【重要】お知らせ"`} />
      <p>
        子の<code>text</code>を実行し、<code>super</code>で親の<code>text</code>の結果を受け取ってから文字列を連結しています。
        この例では次の定義が親クラスにあります。モジュールが間に入ると、次の定義がモジュール側にある場合もあります。
        <code>super</code>は別のオブジェクトへ依頼するのではなく、同じレシーバで、現在の定義より後ろを探して実行を続けます。{cite}
      </p>
    </>,
    singleton: cite => <>
      <p>
        クラスにメソッドを定義すると、通常はそのクラスのすべてのインスタンスで使えます。
        特定の1つだけに処理を追加する場合は、<code>def obj.method_name</code>と書けます。
        これによって、ほかの同じクラスのオブジェクトまで変わることはありません。
      </p>
      <Code lang="ruby" title="同じクラスの2つのオブジェクトを区別する" code={`first = Object.new
second = Object.new

def first.label
  "この1つだけ"
end

first.label                  # => "この1つだけ"
second.respond_to?(:label)   # => false`} />
      <p>
        <code>respond_to?</code>は、その名前のメソッドを呼べるかを調べます。
        first専用の定義を通常のObjectクラスに置くとsecondにも見えてしまうため、Rubyは特異クラスという専用の定義先を使います。
        この保存先も探索経路に含めることで、通常のメソッドと同じ形で呼び出せます。{cite}
      </p>
    </>,
    'class-methods': cite => <>
      <p>
        <code>Article.find(1)</code>はArticleクラスに対する呼び出し、<code>article.save</code>は取得したインスタンスに対する呼び出しです。
        どちらも「オブジェクト.メソッド」という同じ形で、レシーバが違います。
        クラス本体の<code>self</code>はクラス自身なので、<code>def self.find</code>は、そのクラスという1つのオブジェクトにメソッドを定義します。
      </p>
      <p>
        その定義先がクラス自身の特異クラスです。<code>class &lt;&lt; self</code>は、現在のselfの特異クラスを開いて定義を書く構文です。
        したがって、インスタンス用の定義を調べる<code>Article.ancestors</code>と、Articleそのものへの呼び出しの定義を調べる経路は区別します。{cite}
      </p>
    </>,
    extend: cite => <>
      <p>
        モジュールにあるメソッドを<code>Report.new.label</code>から使いたいならinclude、
        <code>Report.label</code>から使いたいならReport自体へのextendが候補になります。
        extendもincludeもメソッドを組み込む操作ですが、組み込み先がクラスのインスタンス用か、指定したオブジェクト専用かで変わります。
      </p>
      <p>
        Railsのソースに<code>base.extend(ClassMethods)</code>が出てきたら、baseに入っているクラス自身へClassMethodsのメソッドを追加している、と対応付けられます。
        <code>ClassMethods</code>という名前自体が特別な構文ではなく、通常のモジュール名です。{cite}
      </p>
    </>,
  },
}

export const explanation04: Explanations = {
  sources: [rubyDoc('syntax/calling_methods_rdoc', 'Calling Methods — Blocks'), rubyDoc('syntax/methods_rdoc', 'Methods — Block Argument'), rubyDoc('Proc', 'Proc')],
  sections: {
    'block-yield': cite => <>
      <p>
        配列の値を1件ずつ表示したい場合、Rubyでは<code>each</code>へ処理を渡せます。
        ブロックはこのようにメソッドへ渡すコードのまとまりです。値だけを引数に渡す呼び出しに対し、ブロック付きの呼び出しでは「受け取った値に何をするか」も指定できます。
      </p>
      <Code lang="ruby" title="配列の要素をブロックで受け取る" code={`titles = ["Ruby", "Rails"]

titles.each do |title|
  puts title.upcase
end
# 表示:
# RUBY
# RAILS`} />
      <p>
        <code>|title|</code>はブロックの引数の名前です。eachは1回目に<code>"Ruby"</code>、2回目に<code>"Rails"</code>を渡します。
        <code>puts</code>は画面へ出力するメソッドです。繰り返す順序はeachが決め、各要素で何をするかは呼び出し側のブロックが決めます。
        自分で同じ形のメソッドを作るとき、渡されたブロックを実行するのが<code>yield</code>です。{cite}
      </p>
    </>,
    'block-to-proc': cite => <>
      <p>
        yieldなら受け取ったブロックをその場で実行できますが、変数へ保存して別の処理に渡したい場合もあります。
        Procは実行できる処理をオブジェクトとして保持するものです。数値を変数へ入れるのと同じように、処理を変数へ入れ、<code>call</code>で実行できます。
      </p>
      <Code lang="ruby" title="処理を作る時点と実行する時点" code={`double = proc { |number| number * 2 }
# ここでは計算をまだ実行していない

double.call(3) # => 6
double.call(5) # => 10`} />
      <p>
        仮引数の<code>&amp;block</code>はメソッドへ渡されたブロックをProcとして受け取る書き方です。
        呼び出し側の<code>&amp;double</code>は逆方向で、Procをブロックとして渡します。
        <code>&amp;</code>の意味は置く位置で変わるため、メソッドの定義側と呼び出し側を分けて読めます。{cite}
      </p>
    </>,
    closure: cite => <>
      <p>
        ローカル変数のスコープはその変数を参照できる範囲です。ブロックは書いた場所の外側のローカル変数も参照します。
        処理をProcにして後で実行しても、この参照関係が残ります。外の値を固定したコピーとは限らないことが、結果に影響します。
      </p>
      <Code lang="ruby" title="Procを作った後に外側の変数を変更する" code={`prefix = "記事: "
label = proc { |title| prefix + title }
label.call("Ruby") # => "記事: Ruby"

prefix = "下書き: "
label.call("Ruby") # => "下書き: Ruby"`} />
      <p>
        labelが参照するのは、Proc作成時の文字列だけではなくprefixという変数です。
        その変数が別の文字列を指すようになれば、実行結果も変わります。
        この性質があるため、ブロックを登録する場所と、実際に呼ばれる場所・時刻を区別します。{cite}
      </p>
    </>,
    'self-switch': cite => <>
      <p>
        ローカル変数の参照範囲と、<code>self</code>は別の情報です。
        通常のブロックは作成した場所のselfを使いますが、<code>instance_exec</code>は指定したオブジェクトをselfとしてブロックを実行できます。
        このとき、レシーバを省略したメソッド呼び出し先と、<code>@name</code>の持ち主が変わります。
      </p>
      <Code lang="ruby" title="ローカル変数を保ち、メソッドの呼び出し先を変える" code={`text = "rails"
suffix = "!"

text.instance_exec do
  upcase + suffix
end # => "RAILS!"`} />
      <p>
        ブロック内の<code>upcase</code>はtextが指す文字列への呼び出しです。一方、suffixは外側のローカル変数を参照します。
        この2つが同時に成立するため、selfを変えたからといって、ブロックの外のローカル変数まで見えなくなるわけではありません。{cite}
      </p>
    </>,
    dsl: cite => <>
      <p>
        <code>routes.rb</code>の<code>get</code>はRuby言語に最初からある予約語ではなく、Railsが用意するメソッドです。
        <code>draw do ... end</code>のブロック内でgetを呼べるのは、そのブロックをルート定義用のオブジェクトをselfとして実行するためです。
        一方、<code>{'scope :published, -> { where(published: true) }'}</code>では、条件を作る処理をlambdaとして渡します。
      </p>
      <p>
        同じブロック付きの見た目でも、受け取ってすぐに実行する場合と、登録して後で実行する場合があります。
        さらに、実行するときのselfを切り替える場合もあります。「何を登録するメソッドか」「どのオブジェクトで実行するか」が分かれば、DSLの短い記述を通常のRubyの呼び出しとして追えます。{cite}
      </p>
    </>,
  },
}

export const explanation05: Explanations = {
  sources: [rubyDoc('Module', 'Module — define_method / attr_reader'), guide('active_support_core_extensions', 'Active Support Core Extensions'), guide('active_record_callbacks', 'Active Record Callbacks')],
  sections: {
    send: cite => <>
      <p>
        <code>article.title</code>では、呼ぶメソッドの名前をコードに直接書きます。
        同じオブジェクトからtitleやbodyを選んで取得したいなら、名前を値として保持し、その値を使って呼び出すこともできます。
        たとえば<code>attribute = :title</code>とした場合、<code>article.public_send(attribute)</code>がtitleを呼びます。
      </p>
      <p>
        このように、実行中のデータを使って呼び出しや定義を変える手法をメタプログラミングと呼びます。
        名前を値にすることと、指定した名前を自由に実行してよいことは別です。
        privateな処理を呼べるかというメソッドの公開範囲と、入力として許可する名前の範囲を確認します。{cite}
      </p>
    </>,
    'define-method': cite => <>
      <p>
        <code>def title ... end</code>は、名前がコード上で決まっているメソッドを定義します。
        複数の属性に同じ形の読み取り処理を用意するときは、属性の一覧をもとにメソッドを生成できます。
        <code>define_method</code>は、名前を引数で受け取り、ブロックをそのメソッドの本体にします。
      </p>
      <Code lang="ruby" title="1つの定義から、呼べるメソッドを作る" code={`class Note
  define_method(:label) do
    "生成されたメソッド"
  end
end

Note.new.label # => "生成されたメソッド"`} />
      <p>
        クラスを定義する際にdefine_methodを実行してlabelを用意し、インスタンスからlabelを呼んだ際にブロックの本体が実行されます。
        Railsの属性メソッドでも、DBの列名から必要な名前を決めてメソッドを用意するため、モデルのファイルに定義を直接書かずに読み書きできます。{cite}
      </p>
    </>,
    'class-macro': cite => <>
      <p>
        Rubyはクラスの本体を上から評価します。そこに書いたメソッド呼び出しは、インスタンスを作る前に実行されます。
        一方、<code>def</code>で定義したメソッドの本体は、そのメソッドを呼ぶまで実行されません。
        Railsの宣言を読むには、この2つの時点を区別します。
      </p>
      <Code lang="ruby" title="Ruby標準の宣言もメソッド呼び出し" code={`class Note
  attr_reader :title

  def initialize(title)
    @title = title
  end
end

Note.new("クラスマクロ").title # => "クラスマクロ"`} />
      <p>
        <code>attr_reader :title</code>は、その場でタイトルを取得する操作ではありません。後でtitleを呼べるように読み取り用のメソッドを定義します。
        <code>has_many</code>や<code>before_action</code>もクラスを定義するときに呼ぶ通常のメソッドです。
        関連の情報や実行する処理を登録し、実際の取得やコールバックの実行は後の時点で行います。{cite}
      </p>
    </>,
    concern: cite => <>
      <p>
        モジュールの共通処理が別のモデルのメソッドを使う場合、組み込み先で関連や設定も宣言したくなります。
        たとえば、記事を公開する機能をまとめたモジュールが、公開日時のメソッドだけでなく、公開記事を検索するscopeも追加する場合です。
        インスタンス用のメソッドを組み込む操作に、クラスへの設定追加も合わせる必要があります。
      </p>
      <p>
        ActiveSupport::Concernはこうした組み込み時の処理やクラスメソッド、モジュール間の依存をまとめるための仕組みです。
        <code>included do ... end</code>は、モジュールを評価したその場でモデルへ設定するのではなく、組み込み先が決まったときの処理として保持されます。
        Rubyのincludedフックを直接書く形と比べると、何を後で実行するために保存しているかが分かります。{cite}
      </p>
    </>,
    callbacks: cite => <>
      <p>
        保存の前に値を整える、アクションの前にログインを確認するといった処理は、決まった時点に結び付けておくと複数の呼び出しで共有できます。
        このように登録して呼ばれる処理がコールバックです。登録と実行は別の操作で、<code>before_action :set_article</code>を書いた時点では記事を取得しません。
      </p>
      <p>
        共通の仕組みに必要なのは、「どのイベントか」「その前後のどちらか」「何を呼ぶか」の記録と、イベント発生時に記録を順に実行する処理です。
        <code>define_callbacks</code>はイベントを定義し、<code>set_callback</code>は処理を登録し、<code>run_callbacks</code>はイベント本体と前後の処理を実行します。
        コントローラーとモデルで名前が違っていても、この登録・実行の構造を共有できます。{cite}
      </p>
    </>,
  },
}
