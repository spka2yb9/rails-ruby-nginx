import { ChapterLink, Code } from '../components/content'
import { guide, primarySource, rubyDoc, type Explanations } from './shared'

export const explanation01: Explanations = {
  sources: [
    guide('getting_started', 'Getting Started with Rails'),
    rubyDoc('Method', 'Method — owner / source_location / super_method'),
    { title: 'Gemfiles', publisher: 'RubyGems Guides（Bundler）', url: 'https://guides.rubygems.org/gemfile/', accessed: '2026-11-16', note: 'Gemfile の gem の行とバージョンの条件（~> の意味）、Bundler.require。' },
    { title: 'bundle install', publisher: 'RubyGems Guides（Bundler コマンドリファレンス）', url: 'https://guides.rubygems.org/command-reference/bundle-install/', accessed: '2026-11-16', note: 'bundle install が依存関係を解決して Gemfile.lock に書き、次からはそのバージョンを使うこと。' },
    { title: 'module Kernel（require・caller）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Kernel.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'require が Ruby のファイルを読み込むこと、caller が実行中の呼び出しの履歴を返すこと。' },
  ],
  sections: {
    scope: cite => <>
      <p>
        この節では本番環境で1つの要求が通るソフトウェアを、ブラウザーの側から順に示します。その説明に出てくる語のうち、ここまでに出ていないものを先に説明します。
      </p>
      <p>
        IP アドレスは、ネットワークにつながったコンピューターを区別する番号で、「HTTP の要求と応答」の節の 127.0.0.1 もその1つです。
        静的ファイルはデモの HTML の head にある /icon.png のように、要求のたびに内容が変わらず、ファイルをそのまま返せばよいものです。
        rails new で作ったアプリケーションでは public ディレクトリに置きます。/articles の HTML のように、要求のたびに Rails が作る応答とは分けて扱います。{cite}
      </p>
      <p>
        プロセスは実行中のプログラム、スレッドはプロセスの中で命令を順に実行する流れです。
        Puma は複数のプロセスと、各プロセスの中の複数のスレッドを使って、複数の要求を同時に処理します（<ChapterLink n={23} section="process" />）。
        Rack は、Puma のような Web サーバーが Ruby のアプリケーションを呼び出すときの、メソッドの名前と引数・戻り値の形を決めた規約です（<ChapterLink n={6} />）。
        Redis はデータをメモリーに置いて読み書きするデータベースです（<ChapterLink n={18} />）。
      </p>
    </>,
    gems: cite => <>
      <p>
        gem は Ruby のライブラリを配布するときのまとまりです。Rails も rails という名前の gem として配布されています。
        アプリケーションで使う gem は Gemfile に書き、rails new が作った Gemfile には次の行があります。
      </p>
      <Code lang="ruby" title="Gemfile（rails new が作ったものの一部）" code={`gem "rails", "~> 8.1.4", ">= 8.1.4.1"`} />
      <p>
        <code>gem</code> の後ろは gem の名前と、使ってよいバージョンの条件です。<code>"~&gt; 8.1.4"</code> は 8.1.4 以上 8.2 未満、<code>"&gt;= 8.1.4.1"</code> は 8.1.4.1 以上を表します。
        Bundler は gem の組み合わせを決めてインストールするツールで、<code>bundle install</code> を実行すると、Gemfile の条件と、gem どうしの依存（ある gem が動くのに必要な別の gem）を満たすバージョンを選んでインストールし、選んだバージョンを Gemfile.lock に書きます。
        次に bundle install を実行したときは、Gemfile を変えていなければ Gemfile.lock のバージョンを使います。
      </p>
      <Code lang="text" title="Gemfile.lock（rails new が作ったものの一部）" code={`    rails (8.1.4.1)
      actioncable (= 8.1.4.1)
      actionmailbox (= 8.1.4.1)
      actionmailer (= 8.1.4.1)
      actionpack (= 8.1.4.1)
      actiontext (= 8.1.4.1)
      actionview (= 8.1.4.1)
      activejob (= 8.1.4.1)
      activemodel (= 8.1.4.1)
      activerecord (= 8.1.4.1)
      activestorage (= 8.1.4.1)
      activesupport (= 8.1.4.1)
      bundler (>= 1.15.0)
      railties (= 8.1.4.1)`} />
      <p>
        rails (8.1.4.1) の下に並ぶのは、rails gem が依存している gem です。Gemfile に書いたのは rails だけでも、これらの gem も一緒にインストールされます。
      </p>
      <p>
        インストールした gem のコードは、require で読み込んでから使います。require はライブラリのファイルを読み込むメソッドで、読み込んだファイルが定義したクラスやメソッドが、その後で使えるようになります。
        activesupport gem の blank?（空の文字列や nil なら true を返すメソッド）で確かめました。respond_to? は、そのメソッドを呼べるかどうかを返すメソッドです。
      </p>
      <Code lang="ruby" title="ruby で実行（activesupport 8.1.4.1 をインストールした環境）" code={`"".respond_to?(:blank?)   # => false
require "active_support"
require "active_support/core_ext/object/blank"
"".respond_to?(:blank?)   # => true
"  ".blank?               # => true`} />
      <p>
        Rails のアプリケーションでは gem を一つずつ自分で require しません。rails new が作る config/application.rb では、<code>require "rails/all"</code> が Rails の gem を読み込み、
        <code>Bundler.require(*Rails.groups)</code> が Gemfile に書いた gem をまとめて読み込みます。{cite}
      </p>
      <Code lang="ruby" title="config/application.rb（rails new が作ったものの一部）" code={`require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)`} />
    </>,
    'find-source': cite => <>
      <p>
        ターミナルはコマンドを入力してプログラムを動かす画面です。Rails のアプリケーションのディレクトリで <code>bin/rails console</code> を実行すると、アプリケーションのクラスを使いながら Ruby の式を1行ずつ試せます。
        「rails new で作るアプリケーション」の節で使った <code>bin/rails runner</code> は、同じようにアプリケーションを読み込んだうえで、渡したコードを実行して終わります。
        次の greeting.rb で、メソッドの定義場所を調べるメソッドを試しました。
      </p>
      <Code lang="ruby" title="greeting.rb（# => の後ろは p で表示した値）" code={`class Greeting
  def text
    "こんにちは"
  end
end

class PoliteGreeting < Greeting
  def text
    super + "。よろしくお願いします"
  end
end

greeting = PoliteGreeting.new
greeting.text                    # => "こんにちは。よろしくお願いします"
m = greeting.method(:text)
m.owner                          # => PoliteGreeting
m.source_location                # => ["greeting.rb", 8]
m.super_method.owner             # => Greeting
m.super_method.source_location   # => ["greeting.rb", 2]
m.super_method.super_method      # => nil
"".method(:upcase).source_location  # => nil`} />
      <p>
        class で定義した Greeting と PoliteGreeting はクラス、<code>PoliteGreeting.new</code> で作ったオブジェクトはインスタンスです（<ChapterLink n={2} section="class-instance" />）。
        <code>class PoliteGreeting &lt; Greeting</code> は、PoliteGreeting が Greeting のメソッドを受け継ぐ（継承する）ことを表します。
        PoliteGreeting の text の中の <code>super</code> は、受け継いだ Greeting の text を呼び、その戻り値に文字列を足しています。
      </p>
      <p>
        <code>greeting.text</code> はメソッドを実行しますが、<code>greeting.method(:text)</code> はメソッドを実行せず、そのメソッドを表すオブジェクトを返します（<code>:text</code> はメソッドの名前を表すシンボルです）。
        返ったオブジェクトの owner は定義したクラス、source_location は定義したファイルと行番号、super_method は super で呼ばれる次のメソッドを返します。
        String の upcase のように、Ruby の処理系の中に C 言語で書かれたメソッドでは、source_location は nil です。
      </p>
      <p>
        Rails のメソッドの多くは、クラスではなくモジュールに定義されています。モジュールはメソッドをまとめて定義しておき、複数のクラスに組み込んで使うためのものです（<ChapterLink n={3} />）。
        組み込まれたモジュールのメソッドどうしも super でつながっていて、この節の後半ではその順番を super_method でたどります。{cite}
      </p>
    </>,
    trace: cite => <>
      <p>
        ファイルに書かれたコードには、条件によって通る部分と通らない部分があります。
        たとえば記事を保存できなかったときは、保存前の検証で止まったのか、データベースへの書き込みで失敗したのかで、調べる場所が変わります。
        ログは実行時の記録、デバッガは実行を途中で止めて変数の値などを調べる道具です。
      </p>
      <p>
        メソッドの中で別のメソッドを呼ぶと、呼んだ側のメソッドは、呼ばれた側が終わるまで途中で止まって待ちます。Ruby の caller はいまの位置に来るまでの呼び出しの履歴を返すメソッドです。
        次の callstack.rb では3つのメソッドを順に呼んだ先で履歴を表示しました。
      </p>
      <Code lang="ruby" title="callstack.rb" code={`def show_article
  find_article
end

def find_article
  load_row
end

def load_row
  puts caller(0)
end

show_article`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`callstack.rb:10:in 'Object#load_row'
callstack.rb:6:in 'Object#find_article'
callstack.rb:2:in 'Object#show_article'
callstack.rb:13:in '<main>'`} />
      <p>
        上の行ほど新しい呼び出しで、13行目の show_article の呼び出しから、2行目と6行目を経て10行目に来たことが分かります（<code>&lt;main&gt;</code> はファイルの一番外側です）。
        この履歴をコールスタックと呼びます。デバッガの bt コマンドで表示する呼び出しの履歴や、エラーのときに表示されるバックトレースも、同じ形式です。
        定義場所の調査に、実際に通った経路の確認を加えると、不具合が起きた処理を絞り込めます。{cite}
      </p>
    </>,
  },
}

export const explanation02: Explanations = {
  sources: [rubyDoc('syntax/calling_methods_rdoc', 'Calling Methods'), rubyDoc('syntax/methods_rdoc', 'Methods'), rubyDoc('syntax/modules_and_classes_rdoc', 'Modules and Classes')],
  sections: {
    'object-contents': cite => <>
      <p>
        「クラスとインスタンス」の節の Note は、initialize で受け取ったタイトルを @title に入れ、title メソッドで返すクラスでした。
        この節では、インスタンスが値をどこに持ち、メソッドの定義がどこにあるかを、Ruby のメソッドで取り出して確かめます。{cite}
      </p>
    </>,
    'class-is-object': cite => <>
      <p>
        大文字で始まる名前は定数です。<code>LIMIT = 3</code> のように値を入れると、その後は LIMIT と書いてその値を使えます。
        <code>class Note</code> と書くと、Ruby はクラスを表すオブジェクトを作り、Note という定数に入れます。
        「クラスとインスタンス」の節の <code>Note.new("Ruby")</code> は、この定数が指すオブジェクトに new を呼ぶ式で、「クラスの本体で呼ぶメソッド」の節のクラスメソッド label も、同じオブジェクトに対して呼んでいました。
      </p>
      <p>
        この節では、クラスを表すオブジェクトがどのクラスのインスタンスかを調べます。
        結果に出てくる Module はモジュール（メソッドをまとめて定義し、クラスに組み込んで使うもの。<ChapterLink n={3} />）を表すクラスです。{cite}
      </p>
    </>,
    self: cite => <>
      <p>
        「クラスとインスタンス」の節では、first.title と second.title が同じ title メソッドを実行し、それぞれ自分の @title を返しました。
        メソッドの実行中に、いま呼び出しの対象になっているオブジェクトを self と呼びます。
        first.title の実行中は self が first で、second.title の実行中は self が second です。@title はそのときの self のインスタンス変数を指します。
      </p>
      <p>
        レシーバを省略した呼び出しは、self に対する呼び出しになります。「クラスの本体で呼ぶメソッド」の節で、本体に書いた label "メモ帳" が Note.label として呼ばれたのは、クラスの本体では self がそのクラスだからです。
        ただし、<code>title = ...</code> のようにレシーバを省略して代入の形で書くと、メソッドの呼び出しではなく、ローカル変数への代入として扱われます。{cite}
      </p>
    </>,
    'method-lookup': cite => <>
      <p>
        「クラスとインスタンス」の節では、Memo のインスタンスで、Memo に書いていない title を呼べました。
        Ruby は呼ばれたメソッドをまず Memo で探し、見つからなければ親クラスの Note で探します。
        この節ではこの探す順番を、親クラスのさらに親までたどって確かめます。{cite}
      </p>
    </>,
    'method-missing': cite => <>
      <p>
        「オブジェクトとメソッドの呼び出し」の節で <code>10.upcase</code> が NoMethodError になったのは、Integer のオブジェクトに対して upcase の定義を探しても、見つからなかったためです。
        ただし Ruby には、見つからなかった呼び出しを <code>method_missing</code> というメソッドで受け取る仕組みがあります。
        method_missing を定義すると、呼ばれた名前や引数を調べて、処理を分けることもできます。
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
        「モジュールを include してメソッドを共有する」の節では、複数のクラスでメソッドを共有するためにモジュールを使いました。
        モジュールにはもう1つ、クラスの名前を区別する使い方があります。
        同じ Report という名前のクラスでも、別々のモジュールの中に定義すれば、別のクラスとして扱えます。
      </p>
      <Code lang="ruby" title="モジュールで名前を区別する（Ruby 4.0.9 で実行）" code={`module Admin
  class Report
    def title = "管理者向けの集計"
  end
end

module Public
  class Report
    def title = "公開用の集計"
  end
end

Admin::Report.new.title  # => "管理者向けの集計"
Public::Report.new.title # => "公開用の集計"`} />
      <p>
        <code>::</code>は、モジュールの中に定義したクラスや定数（大文字で始まる名前に入れた値）を指定する書き方です。
        Rails の<code>ActiveRecord::Base</code>と<code>ActionController::Base</code>はどちらも Base という名前のクラスですが、ActiveRecord と ActionController という別々のモジュールの中にあるので区別できます。{cite}
      </p>
    </>,
    include: cite => <>
      <p>
        「モジュールを include してメソッドを共有する」の節で見たとおり、include したモジュールは ancestors のクラスのすぐ後ろに入ります。
        この節では1つのクラスに複数のモジュールを include したときの並び方と、モジュールとクラスに同じ名前のメソッドがあるときにどちらが先に見つかるかを確かめます。{cite}
      </p>
    </>,
    prepend: cite => <>
      <p>
        保存などの既存処理の前後に計測を加える場合、元の定義を呼びながら追加処理を実行したくなります。
        モジュール側の同名メソッドを先に呼び、その中から<code>super</code>で次の定義を呼べば、開始時刻の記録→元の処理→経過時間の記録という順にできます。
        <code>prepend</code>は、そのためにクラスより先にモジュールを探索させる組み込み方です。
      </p>
      <p>
        <code>include</code>と<code>prepend</code>のどちらで組み込んでも、モジュールに書くメソッドは同じです。
        違うのは、ancestors の中でモジュールが入る位置です。
        クラスにも同じ名前のメソッドがあるとき、<code>include</code>ではクラスの定義が先に実行され、<code>prepend</code>ではモジュールの定義が先に実行されます。{cite}
      </p>
    </>,
    super: cite => <>
      <p>
        「継承でメソッドを受け継ぐ」の節では、子クラスの greeting の中の<code>super</code>で、親クラスの greeting を呼び、その戻り値に文字列を付け足しました。
        その例では、次に見つかる定義が親クラスにありました。クラスとその親クラスの間にモジュールが入っていると、次の定義がモジュールにある場合もあります。
        この節ではその場合の呼ばれ方と、super に引数を渡す書き方を確かめます。{cite}
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
        label の定義を Object クラスに置くと、second からも呼べてしまいます。
        そのため Ruby は first のためだけのクラスを作り、label をそこに定義します。このクラスを特異クラスと呼びます。
        メソッドを探すときは特異クラスを最初に調べるので、<code>first.label</code>は普通のメソッドと同じ書き方で呼べます。{cite}
      </p>
    </>,
    'class-methods': cite => <>
      <p>
        「クラスに対して呼ぶメソッド」の節では、<code>def self.table</code>で Book のクラスメソッドを定義しました。
        Ruby ではクラスもオブジェクトで、Book というクラスは Class クラスのインスタンスです（<ChapterLink n={2} section="class-is-object" />）。
        そのため<code>def self.table</code>は Book という1つのオブジェクトだけにメソッドを定義する書き方で、前の節の<code>def obj.greet</code>と同じ形です。
      </p>
      <p>
        インスタンスメソッドを探す順番は<code>Article.ancestors</code>で調べられますが、<code>Article.find</code>のようなクラスメソッドを探す順番は別にあります。
        この節では、クラスメソッドがクラスの特異クラスに定義されることと、その探す順番を確かめます。{cite}
      </p>
    </>,
    extend: cite => <>
      <p>
        「モジュールを include してメソッドを共有する」の節では、Greeting を User に include して、<code>User.new.hello</code>のようにインスタンスから hello を呼びました。
        <code>User.hello</code>のようにクラスに対して呼びたいときは、User 自体に extend します。
        extend も include もモジュールのメソッドを使えるようにする操作ですが、include はクラスのインスタンスに、extend は指定したオブジェクトだけにメソッドを加えます。
      </p>
      <p>
        Rails のソースに<code>base.extend(ClassMethods)</code>が出てきたら、base に入っているクラスに ClassMethods のメソッドをクラスメソッドとして加えている、と読めます。
        <code>ClassMethods</code>は特別な構文ではなく、普通のモジュールの名前です。{cite}
      </p>
    </>,
  },
}

export const explanation04: Explanations = {
  sources: [rubyDoc('syntax/calling_methods_rdoc', 'Calling Methods — Blocks'), rubyDoc('syntax/methods_rdoc', 'Methods — Block Argument'), rubyDoc('Proc', 'Proc')],
  sections: {
    'block-yield': cite => <>
      <p>
        「メソッドにブロックを渡す」の節では、each や map にブロックを渡しました。each はメソッドの中で、受け取ったブロックを要素ごとに実行しています。
        自分で定義するメソッドでも、呼び出し側から渡されたブロックを実行できます。そのために使うのが<code>yield</code>です。
        yield に値を渡すと、ブロックの引数（<code>|n|</code>など）がその値を受け取ります。{cite}
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
        仮引数（<code>def</code>の括弧の中に書く、引数を受け取る変数）の<code>&amp;block</code>はメソッドへ渡されたブロックをProcとして受け取る書き方です。
        呼び出し側の<code>&amp;double</code>は逆方向で、Procをブロックとして渡します。
        <code>&amp;</code>の意味は置く位置で変わるため、メソッドの定義側と呼び出し側を分けて読めます。{cite}
      </p>
    </>,
    closure: cite => <>
      <p>
        「ローカル変数が見える範囲」の節で見たとおり、ブロックの中からはブロックを書いた場所の外のローカル変数を読み書きできます。
        処理を Proc にして後で実行しても、この参照の関係は残ります。Proc が持つのは外の値のコピーではなく変数そのものなので、作った後で変数を変えると結果も変わります。
      </p>
      <Code lang="ruby" title="Procを作った後に外側の変数を変更する" code={`prefix = "記事: "
label = proc { |title| prefix + title }
label.call("Ruby") # => "記事: Ruby"

prefix = "下書き: "
label.call("Ruby") # => "下書き: Ruby"`} />
      <p>
        labelが参照するのは、Procを作った時点の文字列ではなく、prefixという変数です。
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
        DSL（ドメイン固有言語）はルーティングの定義やモデルの関連のように、特定の用途の内容を短く書けるように作った書き方です。
        Rails の DSL は Ruby のメソッド呼び出しでできています（<ChapterLink n={5} section="dsl-intro" />）。
      </p>
      <p>
        <code>routes.rb</code>の<code>get</code>はRuby言語に最初からある予約語ではなく、Railsが用意するメソッドです。
        <code>draw do ... end</code>のブロック内でgetを呼べるのは、そのブロックをルート定義用のオブジェクトをselfとして実行するためです。
        一方、<code>{'scope :published, -> { where(published: true) }'}</code>では、条件を作る処理をlambdaとして渡します。
      </p>
      <p>
        <code>where</code>は SQL をすぐには実行せず、条件を持ったオブジェクトを返します。このオブジェクトを Relation と呼びます。
        Relation は検索の条件や並び順を集めておき、結果が必要になったときに SQL を組み立てて実行します（<ChapterLink n={12} section="lazy" />）。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行（デモのアプリ）" code={`relation = Article.where(published: true)
relation.class  # => Article::ActiveRecord_Relation
relation.to_sql # => "SELECT \`articles\`.* FROM \`articles\` WHERE \`articles\`.\`published\` = TRUE"`} />
      <p>
        同じブロック付きの見た目でも、受け取ってすぐに実行する場合と、登録して後で実行する場合があります（「Rails でブロックを書く場面」の節）。
        さらに、実行するときのselfを切り替える場合もあります。「何を登録するメソッドか」「どのオブジェクトで実行するか」が分かれば、DSLの短い記述を通常のRubyの呼び出しとして追えます。{cite}
      </p>
    </>,
  },
}

export const explanation05: Explanations = {
  sources: [
    rubyDoc('Module', 'Module — define_method / attr_reader'), guide('active_support_core_extensions', 'Active Support Core Extensions'), guide('active_record_callbacks', 'Active Record Callbacks'),
    primarySource('ActiveRecord::Timestamp', 'Ruby on Rails API', 'https://api.rubyonrails.org/v8.1.4.1/classes/ActiveRecord/Timestamp.html', 'Rails 8.1.4.1'),
    primarySource('ActiveRecord::Reflection::ClassMethods（reflect_on_association）', 'Ruby on Rails API', 'https://api.rubyonrails.org/v8.1.4.1/classes/ActiveRecord/Reflection/ClassMethods.html', 'Rails 8.1.4.1'),
  ],
  sections: {
    send: cite => <>
      <p>
        <code>article.title</code>では、呼ぶメソッドの名前をコードに直接書きます。
        同じオブジェクトからtitleやbodyを選んで取得したいなら、名前を値として保持し、その値を使って呼び出すこともできます。
        たとえば<code>attribute = :title</code>とした場合、<code>article.public_send(attribute)</code>がtitleを呼びます。
      </p>
      <p>
        「実行するとメソッドができる」の節では、実行中にメソッドを作る側のメタプログラミングを見ました。名前を値として持ち、その名前でメソッドを呼ぶのも、メタプログラミングの1つです。
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
        「実行するとメソッドができる」の節で見たとおり、Ruby はクラスの本体を上から実行し、本体に書いた attr_accessor や has_many はその時点で実行されます。
        一方、<code>def</code>で定義したメソッドの本体は、そのメソッドを呼ぶまで実行されません。Rails の宣言を読むときは、この2つの時点を区別します。
      </p>
      <p>
        この節では宣言で受け取った設定をどこに保存するかを扱います。インスタンス変数（<code>@</code>で始まる変数）は self が指すオブジェクトに属します。
        クラスの本体や<code>def self.</code>の中では self はクラスなので、そこで作ったインスタンス変数はクラスというオブジェクトに属します。これをクラスのインスタンス変数と呼びます。{cite}
      </p>
    </>,
    'class-attribute': cite => <>
      <p>
        Rails には、クラスごとに持ち、子クラスが親クラスの値を引き継ぐ設定があります。たとえば record_timestamps は、保存するときに created_at と updated_at を自動で入れるかどうかの設定で、
        ActiveRecord::Timestamp の中で class_attribute を使って定義されています。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行（デモのアプリ）" code={`ActiveRecord::Base.record_timestamps # => true
Comment.record_timestamps = false
Comment.record_timestamps            # => false
Article.record_timestamps            # => true（親の値のまま）
ActiveRecord::Base.record_timestamps # => true（親は変わらない）`} />
      <p>
        Comment で false を代入しても、Article と ActiveRecord::Base の値は true のままでした。この節では、この動きを特異クラスに定義したメソッド（<ChapterLink n={3} section="class-methods" />）と、
        ブロックが外の変数を参照し続けるクロージャ（<ChapterLink n={4} section="closure" />）で実現している実装を読みます。{cite}
      </p>
    </>,
    concern: cite => <>
      <p>
        複数のモデルで使う処理をモジュールにまとめると、インスタンスメソッドのほかに、組み込み先のクラスで scope や関連も宣言したくなります。
        たとえば、記事を公開する機能をまとめたモジュールが、公開日時のメソッドだけでなく、公開記事を検索するscopeも追加する場合です。
        インスタンス用のメソッドを組み込む操作に、クラスへの設定追加も合わせる必要があります。
      </p>
      <Code lang="ruby" title="Concern を使ったモジュールの書き方の例" code={`# app/models/concerns/publishable.rb
module Publishable
  extend ActiveSupport::Concern

  included do
    scope :published, -> { where.not(published_at: nil) }
  end

  class_methods do
    def latest_published = published.order(published_at: :desc).first
  end

  def published? = published_at.present?
end

# app/models/article.rb
class Article < ApplicationRecord
  include Publishable
end`} />
      <p>
        included のブロックに書いた scope は、Article のクラス本体に書いたときと同じように実行されます。class_methods のブロックの中のメソッドは
        <code>Article.latest_published</code>のように呼ぶクラスメソッドになり、それ以外の def は<code>article.published?</code>のように呼ぶインスタンスメソッドになります。
      </p>
      <p>
        ActiveSupport::Concernはこうした組み込み時の処理やクラスメソッド、モジュール間の依存をまとめるための仕組みです。
        <code>included do ... end</code>は、モジュールを評価したその場でモデルへ設定するのではなく、組み込み先が決まったときの処理として保持されます。
        Rubyのincludedフックを直接書く形と比べると、何を後で実行するために保存しているかが分かります。
        rails new で作ったアプリには app/models/concerns と app/controllers/concerns というディレクトリがあり、Concern を使ったモジュールを置く場所になっています。{cite}
      </p>
    </>,
    callbacks: cite => <>
      <p>
        保存の前に値を整える、アクションの前にログインを確認するといった処理は、決まった時点に結び付けておくと複数の呼び出しで共有できます。
        このように登録して呼ばれる処理がコールバックです。登録と実行は別の操作で、<code>before_action :set_article</code>を書いた時点では記事を取得しません。
        モデルの before_validation（検査の前に呼ばれるコールバック）で確かめます。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行（デモのアプリ）" code={`class Article05 < ApplicationRecord
  self.table_name = "articles"
  before_validation { puts "before_validation: title=#{title.inspect}"; self.title = title.to_s.strip }
end
puts "クラスの定義が終わった"
a = Article05.new(title: "  コールバック  ")
a.valid?
p a.title
# 出力:
# クラスの定義が終わった
# before_validation: title="  コールバック  "
# "コールバック"`} />
      <p>
        before_validation の行はクラスの定義のときに実行されますが、ブロックはそのとき実行されず、valid? を呼んだときに実行されて、title の前後の空白を取り除きました。
      </p>
      <p>
        共通の仕組みに必要なのは、「どのイベントか」「その前後のどちらか」「何を呼ぶか」の記録と、イベント発生時に記録を順に実行する処理です。
        <code>define_callbacks</code>はイベントを定義し、<code>set_callback</code>は処理を登録し、<code>run_callbacks</code>はイベント本体と前後の処理を実行します。
        コントローラーとモデルで名前が違っていても、この登録・実行の構造を共有できます。{cite}
      </p>
    </>,
    'rails-dsl': cite => <>
      <p>
        has_many は、comments などの関連メソッドのほかに Reflection も作ります。Reflection は関連の名前、相手のクラス、外部キーの列名などを持つオブジェクトで、
        <code>reflect_on_association</code>で取り出せます。
      </p>
      <Code lang="ruby" title="bin/rails runner で実行（デモのアプリ）" code={`r = Article.reflect_on_association(:comments)
r.class       # => ActiveRecord::Reflection::HasManyReflection
r.name        # => :comments
r.klass.name  # => "Comment"
r.foreign_key # => "article_id"`} />
      <p>
        comments メソッドで記事のコメントを読むとき、Rails はこの情報から comments テーブルと article_id 列を使う SQL を組み立てます。{cite}
      </p>
    </>,
  },
}
