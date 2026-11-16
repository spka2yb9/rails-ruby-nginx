import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation08 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const ZW = 'https://github.com/fxn/zeitwerk/blob/v2.8.3'

/* ---------- 図 8-1 require_relative とファイルの実行 ---------- */
function RequireFigure() {
  return (
    <Svg
      id="8-1"
      w={780}
      h={270}
      label="main.rb の1回目の require_relative greeter は greeter.rb を実行して true を返し、読み込んだファイルの絶対パスを $LOADED_FEATURES に記録する。2回目の require_relative は、$LOADED_FEATURES に記録があるので greeter.rb を実行せず false を返す。greeter.rb を実行すると Greeter クラスが定義されるので、main.rb の3行目で Greeter.new が使える"
    >
      <T x={20} y={20} bold fs={12.5} mono>
        main.rb
      </T>
      <Box
        x={20}
        y={32}
        w={340}
        h={96}
        lines={['p require_relative("greeter")  # true', 'p require_relative("greeter")  # false', 'puts Greeter.new.hello("佐藤")']}
        mono
        fs={11.5}
        align="start"
      />
      <T x={470} y={20} bold fs={12.5} mono>
        greeter.rb
      </T>
      <Box
        x={470}
        y={32}
        w={290}
        h={96}
        lines={['puts "greeter.rb を実行しています"', 'class Greeter', '  def hello(name) … end', 'end']}
        mono
        fs={11.5}
        fill="box5"
        align="start"
      />
      <Arrow x1={360} y1={64} x2={468} y2={64} />
      <T x={370} y={54} fs={11}>
        ① 実行する
      </T>
      <Box x={250} y={196} w={280} h={48} lines={['$LOADED_FEATURES', '["/ex/greeter.rb"]']} mono fs={12} fill="box4" subTone="muted" />
      <Arrow x1={615} y1={128} x2={532} y2={210} />
      <T x={580} y={176} fs={11}>
        読み込んだファイルを記録
      </T>
      <Arrow x1={150} y1={128} x2={248} y2={214} dashed />
      <T x={20} y={170} fs={11}>
        ② 2回目は記録を見て、
      </T>
      <T x={20} y={188} fs={11}>
        実行せずに false を返す
      </T>
    </Svg>
  )
}

/* ---------- 図 8-2 定数とクラス ---------- */
function ConstantFigure() {
  return (
    <Svg
      id="8-2"
      w={780}
      h={260}
      label="トップレベルで定義した定数は Object に属する。LIMIT には 3、Greeter には Greeter クラス、Admin には Admin モジュールが入る。Admin モジュールは自分の定数 Report を持ち、Admin::Report クラスが入る。Greeter や Admin::Report を参照すると、その定数に入ったクラスが返る。定義されていない Article を参照すると NameError になる"
    >
      <rect x={20} y={14} width={430} height={226} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={34} y={34} bold fs={12.5}>
        Object の定数（トップレベルで定義した定数）
      </T>
      <Box x={34} y={50} w={400} h={30} lines="LIMIT → 3" mono fs={12} align="start" fill="box4" />
      <Box x={34} y={88} w={400} h={30} lines="Greeter → Greeter クラス" mono fs={12} align="start" />
      <rect x={34} y={126} width={400} height={100} rx={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={46} y={144} mono fs={12}>
        Admin → Admin モジュール
      </T>
      <T x={58} y={168} fs={11} tone="muted">
        Admin の定数
      </T>
      <Box x={58} y={180} w={360} h={30} lines="Report → Admin::Report クラス" mono fs={12} align="start" />

      <T x={480} y={34} bold fs={12.5}>
        参照したときの結果
      </T>
      <Box x={480} y={50} w={280} h={30} lines="Greeter → Greeter クラス" mono fs={11.5} align="start" fill="bg" />
      <Box x={480} y={94} w={280} h={30} lines="Admin::Report → クラス" mono fs={11.5} align="start" fill="bg" />
      <Box x={480} y={138} w={280} h={44} lines={['Article', '→ NameError（uninitialized constant）']} mono fs={11.5} align="start" fill="bg" subTone="danger" />
      <T x={480} y={210} fs={11} tone="muted">
        クラスやモジュールを定義すると、
      </T>
      <T x={480} y={228} fs={11} tone="muted">
        その名前の定数にクラス・モジュールが入る
      </T>
    </Svg>
  )
}

/* ---------- 図 8-3 開発環境と本番環境で読み込む時点 ---------- */
function LoadTimingFigure() {
  const lane = (y: number, title: string, items: { t: string[]; fill: 'box' | 'box4' | 'box5' | 'bg' }[]) => (
    <g>
      <T x={20} y={y + 30} bold fs={12.5} mono>
        {title}
      </T>
      {items.map((it, i) => (
        <g key={i}>
          <Box x={130 + i * 160} y={y} w={146} h={60} lines={it.t} fs={11} fill={it.fill} subTone="muted" />
          {i < items.length - 1 && <Arrow x1={276 + i * 160} y1={y + 30} x2={288 + i * 160} y2={y + 30} />}
        </g>
      ))}
    </g>
  )
  return (
    <Svg
      id="8-3"
      w={780}
      h={250}
      label="development では、起動したときに app のファイルを1つも読み込まない。要求の処理中に Greeting を初めて参照したときに greeting.rb を読み込む。greeting.rb を書き換えると、次の要求の前に変更を見つけて読み込み直し、新しい内容が返る。production では、起動したときに app の26個のファイルをすべて読み込む。greeting.rb を書き換えても次の要求の応答は変わらず、再起動すると新しい内容になる"
    >
      {lane(20, 'development', [
        { t: ['起動', 'app/ は 0 個読み込み'], fill: 'box' },
        { t: ['要求1', 'Greeting を参照したとき', 'greeting.rb を読む'], fill: 'box5' },
        { t: ['greeting.rb を', '書き換える'], fill: 'box4' },
        { t: ['要求2', '変更を見つけて読み直す', '→ こんばんは'], fill: 'box5' },
      ])}
      {lane(120, 'production', [
        { t: ['起動', 'app/ の 26 個を', 'すべて読み込む'], fill: 'box5' },
        { t: ['要求1', '→ こんにちは'], fill: 'box' },
        { t: ['greeting.rb を', '書き換える'], fill: 'box4' },
        { t: ['要求2', '→ こんにちは', '（変わらない）'], fill: 'box' },
      ])}
      <T x={130} y={212} fs={11.5} tone="muted">
        production では、Puma を再起動したあとの要求で「こんばんは」になった
      </T>
      <T x={130} y={234} fs={11.5} tone="muted">
        個数は、bin/rails runner で起動直後に数えた app/ のファイルの数（デモのコピー）
      </T>
    </Svg>
  )
}

/* ---------- 図 8-4 setup 直後の autoload ---------- */
function SetupFigure() {
  const files = [
    { y: 50, t: 'app/models/', bold: true, x: 20 },
    { y: 80, t: 'article.rb', x: 40 },
    { y: 110, t: 'admin/', x: 40 },
    { y: 140, t: 'report.rb', x: 60, muted: true },
    { y: 170, t: 'shop.rb', x: 40 },
    { y: 200, t: 'shop/', x: 40 },
    { y: 230, t: 'item.rb', x: 60, muted: true },
  ]
  return (
    <Svg
      id="8-4"
      w={740}
      h={290}
      label="setup を実行した直後の状態。app/models の直下にある article.rb、admin ディレクトリ、shop.rb について、Object に autoload が設定される。Article は app/models/article.rb から読み込む。Admin はディレクトリ app/models/admin から作る。Shop は shop.rb と shop ディレクトリの両方があるので、shop.rb から読み込む明示的な名前空間として扱う。admin/report.rb と shop/item.rb には、この時点ではまだ autoload を設定しない"
    >
      <T x={20} y={22} fs={12} tone="muted">
        ファイル
      </T>
      {files.map((f) => (
        <T key={f.t + f.y} x={f.x} y={f.y} mono fs={12.5} bold={f.bold} tone={f.muted ? 'muted' : undefined}>
          {f.t}
        </T>
      ))}

      <T x={330} y={22} fs={12} tone="muted">
        Object に設定される autoload
      </T>
      <Box x={330} y={64} w={390} h={32} lines="Article → app/models/article.rb" mono fs={12} align="start" />
      <Box x={330} y={110} w={390} h={46} lines={['Admin → app/models/admin', '（ディレクトリ。参照されたらモジュールを作る）']} mono fs={12} align="start" subTone="muted" />
      <Box x={330} y={170} w={390} h={46} lines={['Shop → app/models/shop.rb', '（shop/ もあるので明示的な名前空間）']} mono fs={12} align="start" subTone="muted" />
      <Arrow x1={130} y1={80} x2={326} y2={80} dashed />
      <Arrow x1={110} y1={110} x2={326} y2={124} dashed />
      <Arrow x1={110} y1={170} x2={326} y2={184} dashed />
      <Arrow x1={100} y1={200} x2={326} y2={200} dashed />
      <T x={330} y={246} fs={12} tone="muted">
        report.rb と item.rb には、まだ autoload を設定しない
      </T>
      <T x={330} y={266} fs={12} tone="muted">
        （親の名前空間が作られたときに設定する）
      </T>
    </Svg>
  )
}

/* ---------- 図 8-5 Admin::Report を参照したときの流れ ---------- */
function AutoloadSeqFigure() {
  const cols = [
    { x: 90, name: 'アプリのコード' },
    { x: 290, name: 'Ruby（autoload）' },
    { x: 510, name: 'Kernel#require（Zeitwerk）' },
  ]
  return (
    <Svg
      id="8-5"
      w={760}
      h={400}
      label="アプリのコードが Admin を参照すると、Ruby は Object に設定された autoload を見つけ、ディレクトリのパスで Kernel#require を呼ぶ。Zeitwerk の require はディレクトリだと判断し、Module.new を Admin に設定し、admin ディレクトリの中身に autoload を設定する。次に Admin::Report を参照すると、Ruby は report.rb のパスで require を呼ぶ。Zeitwerk は元の require でファイルを実行し、Admin::Report が定義されたことを確かめる。定義されていなければ Zeitwerk::NameError を投げる"
    >
      {cols.map((c) => (
        <g key={c.name}>
          <Box x={c.x - 90} y={10} w={180} h={32} lines={c.name} fs={12} fill={c.name.startsWith('Kernel') ? 'box5' : 'box'} />
          <line x1={c.x} y1={42} x2={c.x} y2={392} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <T x={12} y={68} fs={12} bold>
        ①
      </T>
      <Arrow x1={90} y1={68} x2={286} y2={68} />
      <T x={188} y={57} fs={11.5} mono anchor="middle">
        Admin を参照
      </T>
      <Arrow x1={290} y1={98} x2={506} y2={98} />
      <T x={398} y={87} fs={11} mono anchor="middle">
        require(".../app/models/admin")
      </T>
      <Box x={520} y={112} w={230} h={68} lines={['ディレクトリなので', 'Module.new を Admin に設定し、', 'admin/ の中に autoload を設定']} fs={11.5} fill="bg" align="start" />

      <T x={12} y={214} fs={12} bold>
        ②
      </T>
      <Arrow x1={90} y1={214} x2={286} y2={214} />
      <T x={188} y={203} fs={11.5} mono anchor="middle">
        Admin::Report を参照
      </T>
      <Arrow x1={290} y1={244} x2={506} y2={244} />
      <T x={398} y={233} fs={11} mono anchor="middle">
        require(".../admin/report.rb")
      </T>
      <Box x={520} y={258} w={230} h={48} lines={['元の require で', 'report.rb を実行']} fs={11.5} fill="bg" align="start" />
      <Box x={520} y={316} w={230} h={48} lines={['Admin::Report が定義されたか確認', '（無ければ Zeitwerk::NameError）']} fs={11.5} fill="bg" align="start" subTone="danger" />
      <Arrow x1={506} y1={380} x2={94} y2={380} dashed />
      <T x={300} y={370} fs={11.5} anchor="middle" tone="muted">
        Admin::Report の値が返る
      </T>
    </Svg>
  )
}

/* ---------- 図 8-6 開発環境での再読み込み ---------- */
function ReloadFigure() {
  return (
    <Svg
      id="8-6"
      w={760}
      h={360}
      label="development でリクエストが来ると、まず ActionDispatch::Executor が executor の run を実行する。次に ActionDispatch::Reloader が、ファイル監視でファイルが変わったかを確かめる。変わっていれば、Zeitwerk の reload が読み込み済みの定数を remove_const で取り除き、$LOADED_FEATURES からファイルを消してから setup をやり直す。その後 to_prepare のコールバックを実行する。変わっていなければ何もしない。その後、ルーティングとコントローラーが実行され、参照された定数があらためてオートロードされる。応答の body が close されると complete が実行される"
    >
      <Box x={20} y={20} w={300} h={40} lines="ActionDispatch::Executor（run!）" mono fs={12} />
      <Arrow x1={170} y1={60} x2={170} y2={80} />
      <Box x={20} y={82} w={300} h={40} lines="ActionDispatch::Reloader（run!）" mono fs={12} />
      <Arrow x1={170} y1={122} x2={170} y2={142} />
      <Box x={60} y={144} w={220} h={44} lines={['ファイルが変わったか', '（ファイル監視の updated?）']} fs={12} fill="bg" subTone="muted" />

      <Arrow x1={280} y1={166} x2={366} y2={166} accent />
      <T x={322} y={156} fs={11.5} tone="acc" anchor="middle">
        はい
      </T>
      <Box x={370} y={130} w={370} h={150} fill="box5" lines={[]} />
      <T x={384} y={150} fs={12} bold>
        再読み込み
      </T>
      <T x={384} y={176} fs={12} mono>
        1. ActiveSupport::Dependencies.clear
      </T>
      <T x={384} y={200} fs={12} mono>
        2. Rails.autoloaders.main.reload
      </T>
      <T x={404} y={222} fs={11.5} tone="muted">
        remove_const と $LOADED_FEATURES の削除
      </T>
      <T x={404} y={242} fs={11.5} tone="muted">
        → setup で autoload を設定し直す
      </T>
      <T x={384} y={266} fs={12} mono>
        3. to_prepare のコールバック
      </T>

      <Arrow x1={170} y1={188} x2={170} y2={232} />
      <T x={178} y={210} fs={11.5} tone="muted">
        いいえ（何もしない）
      </T>
      <Box x={20} y={234} w={300} h={44} lines={['以降のミドルウェア・ルーティング', '・コントローラー']} fs={12} />
      <Arrow x1={368} y1={256} x2={324} y2={256} />
      <Arrow x1={170} y1={278} x2={170} y2={298} />
      <Box x={20} y={300} w={300} h={44} lines={['参照された定数を', 'あらためてオートロード']} fs={12} fill="bg" />
      <T x={370} y={318} fs={12} tone="muted">
        応答の body が close されると、Reloader と
      </T>
      <T x={370} y={338} fs={12} tone="muted">
        Executor の complete! が実行される
      </T>
    </Svg>
  )
}

/* ---------- 図 8-7 Executor の run と complete ---------- */
function ExecutorFigure() {
  return (
    <Svg
      id="8-7"
      w={740}
      h={250}
      label="Executor は、アプリケーションのコードを実行する前に run のコールバックを、実行した後に complete のコールバックを呼ぶ。run では実行コンテキストを用意し、ActiveRecord のクエリキャッシュを有効にする。complete では CurrentAttributes を消し、クエリキャッシュを無効にして中身を消し、トランザクション中でなければデータベース接続をプールに返す。開発環境では、オートロードと再読み込みを安全に行うためのロックも加わる"
    >
      <Box x={250} y={20} w={240} h={210} fill="bg" lines={[]} />
      <T x={370} y={40} anchor="middle" bold fs={12.5}>
        アプリケーションのコード
      </T>
      <T x={370} y={62} anchor="middle" fs={11.5} tone="muted">
        コントローラー、ジョブなど
      </T>
      <T x={370} y={128} anchor="middle" mono fs={12}>
        Rails.application
      </T>
      <T x={370} y={148} anchor="middle" mono fs={12}>
        .executor.wrap {'{ ... }'}
      </T>

      <Box x={20} y={70} w={200} h={130} fill="box" lines={[]} />
      <T x={32} y={90} bold fs={12.5}>
        run（実行前）
      </T>
      <T x={32} y={116} fs={11.5}>
        実行コンテキストを用意
      </T>
      <T x={32} y={140} fs={11.5}>
        クエリキャッシュを有効化
      </T>
      <T x={32} y={176} fs={11} tone="muted">
        開発環境：ロックを取得
      </T>
      <Arrow x1={220} y1={135} x2={248} y2={135} />

      <Box x={520} y={70} w={200} h={130} fill="box" lines={[]} />
      <T x={532} y={90} bold fs={12.5}>
        complete（実行後）
      </T>
      <T x={532} y={116} fs={11.5}>
        CurrentAttributes を消す
      </T>
      <T x={532} y={140} fs={11.5}>
        クエリキャッシュを消す
      </T>
      <T x={532} y={164} fs={11.5}>
        接続をプールに返す
      </T>
      <T x={532} y={186} fs={11} tone="muted">
        （トランザクション中を除く）
      </T>
      <Arrow x1={492} y1={135} x2={518} y2={135} />
    </Svg>
  )
}

const ch08: Chapter = {
  number: 8,
  part: 2,
  title: 'オートロードとリロード（Zeitwerk）',
  summary:
    'require でファイルを読み込むこと、クラスの名前が定数であること、Rails では require を書かずにクラスが使え、開発環境ではコードの変更が次の要求で反映され、本番環境では起動時にまとめて読み込むことを実際に動かして確かめてから、require を書かずにクラスが使える仕組みを、Zeitwerk の実装から説明します。ファイル名と定数名の対応、Module#autoload と Kernel#require の差し替え、本番環境の一括読み込み、開発環境の再読み込み、リクエスト処理の前後に準備と後片付けを行う Executor の役割が分かります。',
  goals: [
    'require がファイルを1回だけ実行することと、クラスの名前が定数であることを説明できる',
    '開発環境のオートロードとリロード、本番環境の一括読み込みで、ファイルが読み込まれる時点の違いを説明できる',
    'ファイルのパスから定数名が決まる規則と、オートロードの対象になるディレクトリを説明できる',
    'Zeitwerk が Module#autoload と Kernel#require を使って定数を読み込む流れを説明できる',
    'ディレクトリから名前空間のモジュールが作られる場合と、ファイルで名前空間を定義する場合の違いを理解する',
    '本番環境の一括読み込みと、開発環境の再読み込みの仕組みを説明できる',
    '初期化中に再読み込み対象の定数を参照できない理由と、代わりの書き方を説明できる',
    'Executor の run・complete で行われる処理を説明できる',
  ],
  prerequisites: [3, 7],
  sections: [
    {
      id: 'require-file',
      title: 'require でファイルを読み込む',
      body: (
        <>
          <p>
            Ruby では別のファイルに書いたクラスを使うには、先にそのファイルを読み込んで実行しておく必要があります。Greeter クラスを greeter.rb に書き、main.rb から使う例で確かめます。
          </p>
          <Code
            lang="ruby"
            title="greeter.rb"
            code={`
puts "greeter.rb を実行しています"

class Greeter
  def hello(name)
    "こんにちは、#{name}さん"
  end
end
`}
          />
          <Code
            lang="ruby"
            title="main_without.rb（読み込まずに使う）と main.rb（読み込んでから使う）"
            code={`
# main_without.rb
puts Greeter.new.hello("佐藤")

# main.rb
p require_relative("greeter")
p require_relative("greeter")
puts Greeter.new.hello("佐藤")
puts $LOADED_FEATURES.grep(/greeter/)
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
$ ruby main_without.rb
main_without.rb:1:in '<main>': uninitialized constant Greeter (NameError)

$ ruby main.rb
greeter.rb を実行しています
true
false
こんにちは、佐藤さん
/ex/greeter.rb
`}
          />
          <p>
            読み込まずに <code>Greeter</code> を使うと、Ruby は Greeter が何かを知らないので NameError（名前が見つからないときの例外）になりました。<code>require_relative("greeter")</code>{' '}
            は、このファイルと同じディレクトリの greeter.rb を探して実行します。実行すると <code>class Greeter</code> の定義が行われ、その後の行で Greeter が使えるようになります。
          </p>
          <p>
            2回目の <code>require_relative</code> では「greeter.rb を実行しています」が表示されず、<code>false</code> が返りました。Ruby は読み込んだファイルの絶対パスを{' '}
            <code>$LOADED_FEATURES</code> という配列に記録し、記録にあるファイルはもう一度実行しません
            <Ref n={15} />（図 8-1）。<code>require</code> も同じ働きで、こちらは自分のファイルの場所からではなく、読み込みパス（<code>$LOAD_PATH</code>
            ）に並んだディレクトリから探します。gem のファイルを読み込むときに使い、Bundler がその読み込みパスを準備します（<ChapterLink n={7} section="gems" />
            ）。
          </p>
          <Figure n="8-1" title="require_relative とファイルの実行" caption="main.rb と greeter.rb の実行結果をもとにした図。">
            <RequireFigure />
          </Figure>
          <p>
            普通の Ruby のプログラムでは、このように使うクラスのファイルを自分で読み込みます。読み込みを忘れたときのエラーは「uninitialized constant Greeter」でした。次の節ではこのエラーに出てくる constant（定数）とクラスの名前の関係を見ます。
          </p>
        </>
      ),
    },
    {
      id: 'constant',
      title: 'クラスの名前は定数',
      body: (
        <>
          <p>
            Ruby では大文字で始まる名前を定数と呼びます。<code>LIMIT = 3</code> のように値を入れて使い、変数と同じように名前で値を取り出します。<code>class Greeter</code>{' '}
            でクラスを定義すると、Ruby はクラスのオブジェクトを作り、それを <code>Greeter</code> という名前の定数に入れます。<code>Greeter.new</code> の <code>Greeter</code>{' '}
            は、この定数の参照です
            <Ref n={16} />（<ChapterLink n={2} section="class-is-object" />）。
          </p>
          <Code
            lang="ruby"
            title="constants.rb"
            code={`
LIMIT = 3                           # 大文字で始まる名前は定数
p LIMIT

class Greeter                       # Greeter という定数ができ、クラスが入る
end
p Greeter.class
p Object.const_defined?(:Greeter)
p Object.const_get("Greeter")       # 文字列の名前から定数の値を取り出す

module Admin
  class Report                      # Admin の中の定数 Report
  end
end
p Admin::Report
p Admin.constants

p Object.const_defined?(:Article)
begin
  Article                           # まだ無い定数を参照する
rescue NameError => e
  puts "#{e.class}: #{e.message}"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
3
Class
true
Greeter
Admin::Report
[:Report]
false
NameError: uninitialized constant Article
`}
          />
          <p>
            ファイルの一番外側（トップレベル）で定義した定数は、Object クラスに属します。<code>Object.const_defined?(:Greeter)</code> は Object にその定数があるかを調べ、
            <code>Object.const_get("Greeter")</code> は文字列で指定した名前の定数の値を返します
            <Ref n={17} />。<code>module Admin</code> の中で定義した Report は、Admin に属する定数になり、外からは <code>Admin::Report</code> と書いて参照します。このように、定数をまとめるモジュールを名前空間と呼びます（
            <ChapterLink n={3} section="module-basics" />
            ）。定義していない <code>Article</code> を参照すると、NameError になりました（図 8-2）。
          </p>
          <Figure n="8-2" title="定数とクラス" caption="constants.rb の実行結果をもとにした模式図。">
            <ConstantFigure />
          </Figure>
          <p>
            クラスの名前が定数なので、「Article を使う」ことは「Article という定数を参照する」ことです。定数がまだ無いときに、その名前からファイルを探して読み込めれば、require を書かなくても済みます。Rails
            はこの方法を使っています。次の節で、Rails のアプリケーションで確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'without-require',
      title: 'require を書かずにクラスを使う',
      body: (
        <>
          <p>
            デモのアプリケーションのコピーに、メッセージを返すだけのクラスと、それを使うコントローラーを追加しました。どちらのファイルにも <code>require</code> は書いていません。
          </p>
          <Code
            lang="ruby"
            title="app/models/greeting.rb と app/controllers/basics08_controller.rb（検証用）"
            code={`
# app/models/greeting.rb
class Greeting
  def self.message
    "こんにちは"
  end
end

# app/controllers/basics08_controller.rb
class Basics08Controller < ApplicationController
  def show
    render plain: "#{Greeting.message}\\n"
  end
end

# config/routes.rb に追加した行
get "basics08" => "basics08#show"
`}
          />
          <p>
            開発環境（development）の <code>bin/rails server</code> で起動し（手元の 3318 番のポートで受け付けるようにしています）、<code>/basics08</code> を要求すると「こんにちは」が返りました。Basics08Controller の中で{' '}
            <code>Greeting</code> を使えたのは、Rails が greeting.rb を読み込んだからです。読み込まれる時点を <code>bin/rails runner</code>（アプリケーションを読み込んでから Ruby
            のコードを実行するコマンド）で確かめました。
          </p>
          <Code
            lang="text"
            title="Greeting を参照する前と後の $LOADED_FEATURES（開発環境）"
            code={`
$ bin/rails runner 'p $LOADED_FEATURES.grep(/greeting/); puts Greeting.message; p $LOADED_FEATURES.grep(/greeting/)'
[]
こんにちは
["/c08/demo/app/models/greeting.rb"]
`}
          />
          <p>
            起動が終わった時点では greeting.rb はまだ読み込まれておらず、<code>Greeting</code> を初めて参照したときに読み込まれました。Rails は、<code>Greeting</code>{' '}
            という定数が必要になると、名前から app/models/greeting.rb を見つけて読み込みます。必要になった時点で自動で読み込むこの仕組みを、オートロードと呼びます
            <Ref n={1} />。
          </p>
          <p>サーバーを動かしたまま、greeting.rb のメッセージを書き換えて、もう一度要求しました。</p>
          <Code
            lang="text"
            title="ファイルを書き換える前と後の応答（開発環境。サーバーは再起動していない）"
            code={`
$ curl http://127.0.0.1:3318/basics08
こんにちは

（app/models/greeting.rb の "こんにちは" を "こんばんは" に書き換えて保存）

$ curl http://127.0.0.1:3318/basics08
こんばんは
`}
          />
          <p>
            サーバーを再起動しなくても、次の要求から新しい内容が返りました。開発環境の Rails は、要求を処理する前にアプリケーションのファイルが変わったかを調べ、変わっていれば読み込み済みのクラスを捨てて、次に参照されたときに読み込み直します
            <Ref n={1} />。この仕組みをリロード（再読み込み）と呼び、「環境ごとの設定」で見た <code>enable_reloading</code> が true のときに働きます（<ChapterLink n={7} section="environments" />
            ）。
          </p>
        </>
      ),
    },
    {
      id: 'boot-load',
      title: '本番環境は起動時にまとめて読み込む',
      body: (
        <>
          <p>
            本番環境（production）では読み込み方が違います。起動が終わった直後に、app/ の中のファイルがいくつ読み込まれているかを、開発環境と本番環境で数えました。
          </p>
          <Code
            lang="ruby"
            title="loaded08.rb（bin/rails runner -e 環境名 loaded08.rb で実行）"
            code={`
app_dir = Rails.root.join("app").to_s
loaded = $LOADED_FEATURES.select { |f| f.start_with?(app_dir) }
puts "#{Rails.env}: app/ のファイルのうち読み込み済み #{loaded.size} 個（app/ の .rb は全部で #{Dir.glob("#{app_dir}/**/*.rb").size} 個）"
`}
          />
          <Code
            lang="text"
            title="実行結果（デモのコピー）"
            code={`
development: app/ のファイルのうち読み込み済み 0 個（app/ の .rb は全部で 26 個）
production: app/ のファイルのうち読み込み済み 26 個（app/ の .rb は全部で 26 個）
`}
          />
          <p>
            開発環境では起動の時点で1つも読み込まれていませんが、本番環境では26個すべてが読み込まれていました。本番環境の <code>config.eager_load = true</code>{' '}
            により、起動の途中でアプリケーションのクラスをまとめて読み込むためです
            <Ref n={1} />。これを一括読み込み（eager loading）と呼びます。読み込むファイルが増えるので起動には時間がかかりますが、要求の処理中にファイルを読み込むことがなくなります。
          </p>
          <p>
            本番環境ではリロードも行いません。本番環境のサーバーで greeting.rb を書き換えても、応答は「こんにちは」のままで、サーバーを再起動すると「こんばんは」になりました（図 8-3）。本番環境に新しいコードを反映するには、サーバーを再起動します。
          </p>
          <Figure n="8-3" title="開発環境と本番環境で読み込む時点" caption="デモのコピー（Rails 8.1.4.1）での実測をもとにした図。">
            <LoadTimingFigure />
          </Figure>
          <p>
            どちらの環境でも、Rails はファイルの置き場所と名前から、どのファイルにどの定数が定義されているかを決めています。開発環境では Greeting を参照したときに greeting.rb を選ぶため、本番環境では起動時に全部のファイルを読んで定数ができたかを確かめるために、この対応を使います。次の節ではその名前の決まりを見ます。
          </p>
        </>
      ),
    },
    {
      id: 'naming',
      title: 'ファイル名と定数名の対応',
      body: (
        <>
          <p>
            この命名規則に基づく<Term en="autoload">オートロード</Term>を管理するのが、<Term>Zeitwerk</Term>という gem のローダー（どのディレクトリのファイルを管理し、いつ読み込むかを受け持つオブジェクト）です。
            Rails は2つのローダーを用意しています。<code>Rails.autoloaders.main</code> は再読み込みの対象になるコードを、<code>Rails.autoloaders.once</code> は一度だけ読み込むコードを扱います
            <Ref n={1} />。
          </p>
          <p>
            ローダーが管理するディレクトリを<Term en="autoload paths">オートロードパス</Term>と呼びます。デモのアプリケーションで <code>ActiveSupport::Dependencies.autoload_paths</code>{' '}
            を表示すると、次のようになりました（ActiveStorage などの Engine の分は省略）。
          </p>
          <Code
            lang="text"
            code={`
lib
app/controllers
app/controllers/concerns
app/helpers
app/jobs
app/mailers
app/models
app/models/concerns
`}
          />
          <p>
            app/ の直下のディレクトリと concerns がそれぞれ独立したオートロードパスです。lib は <code>config.autoload_lib</code> で加わります。各オートロードパスの中では、ファイルのパスが定数のパスに対応し、ディレクトリが名前空間になります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ファイル</th>
                  <th>定義すべき定数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>app/models/article.rb</code>
                  </td>
                  <td>
                    <code>Article</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>app/models/admin/report.rb</code>
                  </td>
                  <td>
                    <code>Admin::Report</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>app/controllers/admin/reports_controller.rb</code>
                  </td>
                  <td>
                    <code>Admin::ReportsController</code>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>app/models/concerns/taggable.rb</code>
                  </td>
                  <td>
                    <code>Taggable</code>（<code>Concerns::Taggable</code> ではない。concerns 自体がオートロードパスのため）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>lib/middleware/timing.rb</code>
                  </td>
                  <td>
                    <code>Middleware::Timing</code>（lib をオートロードの対象にしている場合）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>ファイル名から定数名への変換は、Rails の Inflector（単語の単数形・複数形や、大文字・小文字の形を変換する部品）が行います。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/autoloaders/inflector.rb（12〜18行目）"
            href={`${GH}/railties/lib/rails/autoloaders/inflector.rb#L12-L18`}
            code={`
      def self.camelize(basename, _abspath)
        @overrides[basename] || basename.camelize
      end

      def self.inflect(overrides)
        @overrides.merge!(overrides)
      end
`}
          />
          <p>
            既定では ActiveSupport の <code>String#camelize</code> を使うので、<code>html_parser.rb</code> は <code>HtmlParser</code> になります
            <Ref n={2} />。<code>HTMLParser</code> にしたい場合は、<code>ActiveSupport::Inflector.inflections</code> で <code>acronym "HTML"</code>（HTML を略語として大文字のまま扱う指定）を設定するか、
            <code>{'Rails.autoloaders.main.inflector.inflect("html_parser" => "HTMLParser")'}</code> のようにファイル名ごとに指定します
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'autoload',
      title: 'Module#autoload と setup',
      body: (
        <>
          <p>
            Zeitwerk は Ruby に組み込まれた <code>Module#autoload</code> を使います。<code>Object.autoload(:Article, "/path/article.rb")</code>{' '}
            を実行しておくと、<code>Article</code> が初めて参照されたときに Ruby がそのパスで <code>require</code> を呼び、ファイルを読み込みます
            <Ref n={3} />。
          </p>
          <p>
            Rails は初期化の Finisher（初期化の最後にまとめて実行する処理。<ChapterLink n={7} section="initializers" />）にある <code>setup_main_autoloader</code> で、オートロードパスをローダーに登録してから <code>setup</code> を呼びます。<code>setup</code>{' '}
            は各オートロードパスの直下にあるファイルとディレクトリを調べ、次のメソッドで autoload を設定します。
          </p>
          <Code
            lang="ruby"
            title="zeitwerk/lib/zeitwerk/loader.rb（497〜518行目）"
            href={`${ZW}/lib/zeitwerk/loader.rb#L497-L518`}
            code={`
    private def define_autoloads_for_dir(dir, mod, external:)
      @fs.ls(dir) do |basename, abspath, ftype|
        if ftype == :file
          if basename == @nsfile
            if external
              cpath = real_mod_name(mod)
              location = Object.const_source_location(cpath)&.join(':')
              location = nil if location&.empty?
              raise Zeitwerk::ConflictingNamespaceDefinitionError.new(cpath, location: location, conflicting_file: abspath)
            end
            next # Pass if this is a managed namespace, the nsfile was already probed when visiting the parent directory.
          end

          basename.delete_suffix!('.rb')
          cref = Cref.new(mod, cname_for(basename, abspath))
          visit_file(cref, abspath)
        else
          cref = Cref.new(mod, cname_for(basename, abspath))
          visit_subdir(cref, abspath, external:)
        end
      end
    end
`}
          />
          <p>
            ファイルなら拡張子を除いた名前を定数名に変換し、そのファイルのパスで autoload を設定します。ディレクトリなら、同じ名前の .rb ファイルでまだ autoload が設定されていなければ、ディレクトリのパスそのもので autoload
            を設定します（<code>visit_subdir</code>）。<code>Cref</code> は「どのモジュールの、どの名前の定数か」を表す Zeitwerk の内部クラスで、<code>autoload</code> メソッドは{' '}
            <code>@mod.autoload(@cname, abspath)</code> を呼ぶだけです
            <Ref n={4} />。<code>@nsfile</code> は Zeitwerk 2.8 で追加された、ディレクトリの中のファイルで名前空間を定義する機能の設定で、Rails は使っていません（既定値は nil）。
          </p>
          <p>
            どの autoload が設定されたかは、ローダーのログで確かめられます。デモのアプリケーションに <code>app/models/admin/report.rb</code>（<code>Admin::Report</code>）、
            <code>app/models/shop.rb</code>（<code>Shop</code>）、<code>app/models/shop/item.rb</code>（<code>Shop::Item</code>）を追加し、初期化の前に{' '}
            <code>Rails.autoloaders.main.logger</code> を設定して起動しました。
          </p>
          <Code
            lang="text"
            code={`
Zeitwerk@rails.main: autoload set for Admin, to be autovivified from app/models/admin
Zeitwerk@rails.main: autoload set for Article, to be loaded from app/models/article.rb
Zeitwerk@rails.main: autoload set for Shop, to be autovivified from app/models/shop
Zeitwerk@rails.main: earlier autoload for Shop discarded, it is actually an explicit namespace defined in app/models/shop.rb
Zeitwerk@rails.main: autoload set for Shop, to be loaded from app/models/shop.rb
`}
          />
          <Figure n="8-4" title="setup 直後の autoload" caption="上のログを図にしたもの。setup は各オートロードパスの直下だけを調べ、サブディレクトリの中身は親の名前空間が作られたときに調べる。">
            <SetupFigure />
          </Figure>
          <p>
            ディレクトリは名前の順に調べられるので、shop/ が shop.rb より先に見つかり、いったんディレクトリで autoload が設定されてから、shop.rb の発見で置き換えられています。setup の時点では、admin/
            と shop/ の中のファイルには autoload が設定されていません。起動時に調べるのは直下だけなので、ファイル数が多くても setup は短時間で終わります。
          </p>
        </>
      ),
    },
    {
      id: 'require-hook',
      title: '定数を参照したときの処理',
      body: (
        <>
          <p>
            オートロードが始まると、Ruby は <code>Kernel#require</code> を呼びます。Zeitwerk はこの <code>require</code> を独自のメソッドで置き換えています。
          </p>
          <Code
            lang="ruby"
            title="zeitwerk/lib/zeitwerk/core_ext/kernel.rb（23〜43行目）"
            href={`${ZW}/lib/zeitwerk/core_ext/kernel.rb#L23-L43`}
            code={`
  def require(path)
    if loader = Zeitwerk::Registry.autoloads.registered?(path)
      if path.end_with?('.rb')
        required = zeitwerk_original_require(path)
        loader.__on_file_autoloaded(path) if required
        required
      else
        loader.__on_dir_autoloaded(path)
        true
      end
    else
      required = zeitwerk_original_require(path)
      if required
        abspath = $LOADED_FEATURES.last
        if loader = Zeitwerk::Registry.autoloads.registered?(abspath)
          loader.__on_file_autoloaded(abspath)
        end
      end
      required
    end
  end
`}
          />
          <p>
            渡されたパスが Zeitwerk の登録したものなら、2つの場合に分かれます
            <Ref n={5} />。
          </p>
          <ul>
            <li>
              .rb ファイルの場合：元の <code>require</code>（<code>zeitwerk_original_require</code>）でファイルを実行し、<code>__on_file_autoloaded</code>{' '}
              で、期待した定数が本当に定義されたかを確かめます。定義されていなければ、<code>expected file ... to define constant ..., but didn't</code> というメッセージの{' '}
              <code>Zeitwerk::NameError</code> を投げます（<code>loader/callbacks.rb</code> の 9〜33 行目）。
            </li>
            <li>
              ディレクトリの場合：ディレクトリは <code>require</code> できないので、元の <code>require</code> は呼びません。<code>__on_dir_autoloaded</code> が <code>Module.new</code>{' '}
              を作って定数に設定し、そのディレクトリの中身に autoload を設定します（同じファイルの 52〜70 行目）
              <Ref n={6} />。ディレクトリから作られたこのモジュールを、Zeitwerk は<Term en="implicit namespace">暗黙の名前空間</Term>と呼びます。
            </li>
          </ul>
          <Figure n="8-5" title="Admin::Report を参照したときの流れ" caption="模式図。Admin のためのファイル（admin.rb）が無いので、Admin はディレクトリから作られたモジュールになる。">
            <AutoloadSeqFigure />
          </Figure>
          <p>デモのアプリケーションで実際に参照したときのログは次のとおりです。</p>
          <Code
            lang="text"
            code={`
--- Article を参照
Zeitwerk@rails.main: constant Article loaded from file app/models/article.rb
--- Admin::Report を参照
Zeitwerk@rails.main: module Admin autovivified from directory app/models/admin
Zeitwerk@rails.main: autoload set for Admin::Report, to be loaded from app/models/admin/report.rb
Zeitwerk@rails.main: constant Admin::Report loaded from file app/models/admin/report.rb
`}
          />
          <p>
            このとき <code>Admin.class</code> は <code>Module</code> でした。<code>Admin</code> に共通の処理を持たせたい場合は、<code>app/models/admin.rb</code> に{' '}
            <code>module Admin</code> を書きます。
          </p>
          <Callout kind="warn">
            <p>
              Zeitwerk による <code>require</code> の置き換えは <code>require_relative</code> には適用されません（kernel.rb のコメントに理由が書かれています）。オートロードパスの中のファイルを{' '}
              <code>require</code> や <code>require_relative</code> で読み込むと、Zeitwerk の管理とずれるので、オートロードの対象のファイルは定数の参照だけで読み込みます
              <Ref n={1} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'explicit-namespace',
      title: 'ファイルで定義した名前空間',
      body: (
        <>
          <p>
            <code>shop.rb</code> と <code>shop/</code> の両方がある場合、<code>Shop</code> は shop.rb で定義する<Term en="explicit namespace">明示的な名前空間</Term>になります。この場合、shop.rb
            を実行している途中、つまり <code>class Shop</code> の本体の中から <code>Shop::Item</code> を参照できる必要があります。
          </p>
          <Code
            lang="ruby"
            title="app/models/shop.rb（検証用）"
            code={`
class Shop
  ITEM_CLASS = Shop::Item   # クラス本体の中で子の定数を参照する
end
`}
          />
          <p>
            そのためには、<code>Shop</code> という定数が作られた直後に、shop/ の中身へ autoload を設定しなければなりません。Zeitwerk 2.7 以降は、定数が追加されたときに Ruby が呼ぶ{' '}
            <code>Module#const_added</code> を使っています。
          </p>
          <Code
            lang="ruby"
            title="zeitwerk/lib/zeitwerk/core_ext/module.rb（3〜20行目）"
            href={`${ZW}/lib/zeitwerk/core_ext/module.rb#L3-L20`}
            code={`
module Zeitwerk::ConstAdded # :nodoc:
  #: (Symbol) -> void
  def const_added(cname)
    if loader = Zeitwerk::Registry.explicit_namespaces.loader_for(self, cname)
      namespace = const_get(cname, false)
      cref = Zeitwerk::Cref.new(self, cname)

      unless namespace.is_a?(Module)
        raise Zeitwerk::Error, "#{cref} is expected to be a namespace, should be a class or module (got #{namespace.class})"
      end

      loader.__on_namespace_loaded(cref, namespace)
    end
    super
  end

  Module.prepend(self)
end
`}
          />
          <p>
            このモジュールを Module に <code>prepend</code>（<ChapterLink n={3} />）しているので、どのクラス・モジュールで定数が追加されても、まずこの <code>const_added</code>{' '}
            が呼ばれます。登録済みの明示的な名前空間なら、<code>__on_namespace_loaded</code> がそのディレクトリの中身に autoload を設定します
            <Ref n={7} />。ログでも、shop.rb の実行が終わる前に <code>Shop::Item</code> が読み込まれています。
          </p>
          <Code
            lang="text"
            code={`
--- Shop を参照
Zeitwerk@rails.main: autoload set for Shop::Item, to be loaded from app/models/shop/item.rb
Zeitwerk@rails.main: constant Shop::Item loaded from file app/models/shop/item.rb
Zeitwerk@rails.main: constant Shop loaded from file app/models/shop.rb
`}
          />
          <Callout kind="v72">
            <p>
              Rails 7.2.4 と 8.1.4.1 の railties は、どちらも zeitwerk を <code>~&gt; 2.6</code> で指定しています。Zeitwerk 2.7.0（2024年10月）で TracePoint の使用をやめて{' '}
              <code>const_added</code> に切り替え、Ruby 3.2 以上が必要になりました
              <Ref n={8} />。業務のアプリケーションの Ruby が 3.2 未満なら Zeitwerk は 2.6 系になり、明示的な名前空間の検出には TracePoint（Ruby の実行中に起きた出来事を検出して、登録した処理を呼ぶ仕組み）が使われます。規則と結果は同じです。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'eager-load',
      title: '本番環境の一括読み込み',
      body: (
        <>
          <p>
            production では <code>config.eager_load = true</code> なので、初期化の最後に Finisher の <code>eager_load!</code> が <code>Zeitwerk::Loader.eager_load_all</code>{' '}
            を呼び、管理しているファイルをすべて読み込みます（<ChapterLink n={7} />）。一括読み込みでも、ファイルの読み込みは定数の参照（<code>const_get</code>）で行われるので、定数名の確認も同じように行われます
            <Ref n={8} />。
          </p>
          <p>
            このため、ファイル名と定数名の食い違いは production の起動時に例外になります。<ChapterLink n={6} />の Timing ミドルウェアを <code>lib/middleware/timing.rb</code>{' '}
            に置き、<code>config.autoload_lib(ignore: %w[assets tasks])</code> のまま production で起動すると、次の例外で起動に失敗しました。
          </p>
          <Code
            lang="text"
            code={`
zeitwerk/loader/callbacks.rb:31:in 'Zeitwerk::Loader::Callbacks#on_file_autoloaded':
expected file /work/demo/lib/middleware/timing.rb to define constant Middleware::Timing, but didn't (Zeitwerk::NameError)
`}
          />
          <p>
            development では lib/middleware/timing.rb に対応する定数を参照するコードがないので、この誤りによる例外は起きません。開発環境で確かめるには <code>bin/rails zeitwerk:check</code>{' '}
            を使います。このタスクはアプリケーションを一括読み込みし、問題が無ければ <code>All is good!</code> と表示します
            <Ref n={1} />。上の構成では <code>expected file lib/middleware/timing.rb to define constant Middleware::Timing, but didn't</code> が表示され、<code>ignore</code> に{' '}
            <code>middleware</code> を加えると <code>All is good!</code> になりました。CI（変更を共有するたびにテストなどを自動で実行する仕組み）でこのタスクを実行すると、本番の起動時に初めて気付く事態を防げます。
          </p>
          <p>Zeitwerk にはディレクトリと名前空間の対応を変える設定もあります。</p>
          <ul>
            <li>
              <code>ignore</code>：そのファイル・ディレクトリを管理しない。自分で <code>require</code> するコードや、.rb 以外のファイルを置くディレクトリに使う。
            </li>
            <li>
              <code>collapse</code>：ディレクトリを名前空間として扱わない。<code>app/models/shapes/circle.rb</code> で <code>Circle</code> を定義したい場合など。
            </li>
            <li>
              <code>do_not_eager_load</code>：オートロードはするが、一括読み込みはしない。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'reload',
      title: '開発環境の再読み込み',
      body: (
        <>
          <p>
            development ではファイルを保存すると次のリクエストから変更が反映されます。Ruby のクラスを書き換えるのではなく、読み込み済みの定数を取り除いて、あらためてオートロードさせる仕組みです
            <Ref n={1} />。
          </p>
          <p>
            再読み込みを始めるのは、ミドルウェアの <code>ActionDispatch::Reloader</code> です（<ChapterLink n={6} />）。このクラスは <code>ActionDispatch::Executor</code> のサブクラスで、
            <code>Rails.application.reloader</code> の <code>run!</code> をリクエストの前に呼びます。<code>run!</code> は、まず <code>check</code>{' '}
            でファイルが変わったかを調べます。変わっていれば、初期化処理 <code>set_clear_dependencies_hook</code> が登録した次のコールバック（決まった時点で呼ばれるように登録しておく処理）が実行されます。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/finisher.rb（203〜219行目）"
            href={`${GH}/railties/lib/rails/application/finisher.rb#L203-L219`}
            code={`
        if config.reloading_enabled?
          if config.reload_classes_only_on_change
            reloader = config.file_watcher.new(*watchable_args, &callback)
            reloaders << reloader

            # Prepend this callback to have autoloaded constants cleared before
            # any other possible reloading, in case they need to autoload fresh
            # constants.
            app.reloader.to_run(prepend: true) do
              # In addition to changes detected by the file watcher, if routes
              # or i18n have been updated we also need to clear constants,
              # that's why we run #execute rather than #execute_if_updated, this
              # callback has to clear autoloaded constants after any update.
              class_unload! do
                reloader.execute
              end
            end
`}
          />
          <p>
            <code>config.file_watcher</code> の既定は、ファイルの更新時刻を比べる <code>ActiveSupport::FileUpdateChecker</code> です。<code>callback</code> の中で呼ばれる{' '}
            <code>ActiveSupport::Dependencies.clear</code> は <code>autoloader.reload</code> を呼び
            <Ref n={9} />、Zeitwerk の <code>reload</code> は <code>unload</code> と <code>setup</code> を順に実行します。<code>unload</code> は、読み込み済みの定数を{' '}
            <code>remove_const</code>（定数を取り除くメソッド）で取り除き、読み込んだファイルを <code>$LOADED_FEATURES</code> から消します。こうしておくと、次に定数が参照されたときに{' '}
            <code>require</code> がファイルをもう一度実行します（<code>loader.rb</code> の 166〜252 行目）
            <Ref n={10} />。
          </p>
          <Figure n="8-6" title="開発環境での再読み込み" caption="Rails 8.1.4.1 の ActionDispatch::Reloader・ActiveSupport::Reloader・Finisher の set_clear_dependencies_hook を読んでまとめた図。">
            <ReloadFigure />
          </Figure>
          <p>デモのアプリケーションで、ファイルの更新と再読み込みを試しました。</p>
          <Code
            lang="ruby"
            code={`
old = Article
a = Article.new
Article.object_id                    # => 5016
Rails.application.reloader.check!    # => false（変更前）
sleep 1.1; FileUtils.touch(Rails.root.join("app/models/article.rb"))
Rails.application.reloader.reloaded!
Rails.application.reloader.check!    # => true（変更後）
Rails.application.reloader.reload!
Object.autoload?(:Article)           # => ".../app/models/article.rb"（autoload に戻った）
Article.object_id                    # => 5176
a.class == Article                   # => false
a.class.name                         # => "Article"
`}
          />
          <p>
            再読み込みの後、<code>Article</code> は新しいクラスオブジェクトになりました。再読み込みの前に作った <code>a</code> のクラスは、名前は同じ <code>"Article"</code>{' '}
            でも古いクラスオブジェクトのままです。クラスオブジェクトを定数以外の場所（クラス変数、gem の設定、再読み込みされないクラスの中など）に保存すると、このような古いクラスが残ります
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'boot-time',
      title: '初期化中のオートロード',
      body: (
        <>
          <p>
            <code>config/initializers</code> のファイルから再読み込み対象の定数を参照すると、Rails 8.1.4.1 では次のようになりました。
          </p>
          <Code
            lang="text"
            code={`
# config/initializers/zz_ref.rb の中身: Article.table_name
/work/demo/config/initializers/zz_ref.rb:1:in '<main>': uninitialized constant Article (NameError)
`}
          />
          <p>
            <ChapterLink n={7} />で見たとおり、<code>load_config_initializers</code>（184個中136番目）は、main のローダーを準備する Finisher の <code>setup_main_autoloader</code>
            （171番目）より前に実行されます。そのため、初期化ファイルの時点では <code>Article</code> の autoload がまだ設定されていません。仮に読み込めたとしても、初期化ファイルは一度しか実行されないので、再読み込みの後は古いクラスを使い続けることになります
            <Ref n={1} />。
          </p>
          <p>Rails ガイドは、目的に応じて次の書き方を示しています。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>目的</th>
                  <th>書き方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>再読み込みのたびに設定し直したい</td>
                  <td>
                    <code>Rails.application.config.to_prepare {'{ ApiGateway.endpoint = "..." }'}</code>
                  </td>
                </tr>
                <tr>
                  <td>起動時に一度だけ確認したい</td>
                  <td>
                    <code>config.after_initialize {'{ ... }'}</code>
                  </td>
                </tr>
                <tr>
                  <td>gem にアプリのクラスを渡したい</td>
                  <td>
                    クラスではなく <code>"User"</code> のように名前の文字列を渡し、使う時点で <code>constantize</code>（文字列の名前から同じ名前の定数の値を取り出すメソッド）する
                  </td>
                </tr>
                <tr>
                  <td>再読み込みしないクラスとして初期化中に使いたい</td>
                  <td>
                    <code>config.autoload_once_paths</code> のディレクトリに置く（once のローダーが扱う）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ミドルウェアのように、一度登録したら再読み込みされない場所に渡すクラスは、再読み込みの対象にしても意味がありません。lib に置いて <code>require</code>{' '}
            で読み込み、オートロードの対象からは外します（<ChapterLink n={6} />の注意書き）。
          </p>
        </>
      ),
    },
    {
      id: 'executor',
      title: 'Executor の役割',
      body: (
        <>
          <p>
            ミドルウェアの <code>ActionDispatch::Executor</code> は、production でも使われます。<Term>Executor</Term>{' '}
            は、フレームワークがアプリケーションのコードを呼ぶたびに、その前後で決まった処理を実行する仕組みです。前に実行するものを run、後に実行するものを complete のコールバックと呼びます
            <Ref n={11} />。
          </p>
          <Code
            lang="ruby"
            title="actionpack/lib/action_dispatch/middleware/executor.rb（13〜31行目）"
            href={`${GH}/actionpack/lib/action_dispatch/middleware/executor.rb#L13-L31`}
            code={`
    def call(env)
      state = @executor.run!(reset: true)
      if response_finished = env["rack.response_finished"]
        response_finished << proc { state.complete! }
      end

      begin
        response = @app.call(env)

        if env["action_dispatch.report_exception"]
          error = env["action_dispatch.exception"]
          @executor.error_reporter.report(error, handled: false, source: "application.action_dispatch")
        end

        unless response_finished
          response << ::Rack::BodyProxy.new(response.pop) { state.complete! }
        end
        returned = true
        response
`}
          />
          <p>
            <code>complete!</code> を呼ぶのは、内側の <code>call</code> から戻ったときではありません。サーバーが <code>rack.response_finished</code>（応答を送り終えた後に呼ぶ処理を登録するための env の値。Rack 3 で追加）を提供していれば応答の送信が終わった後、そうでなければ body の <code>close</code> のときです。body をストリーミング（本文を作りながら少しずつ送ること）で書き出している間も、データベース接続などが使える状態を保つためです
            <Ref n={12} />。
          </p>
          <Figure n="8-7" title="Executor の run と complete" caption="Rails 8.1.4.1 で ActiveSupport・ActiveRecord の Railtie が登録しているコールバックの主なもの。">
            <ExecutorFigure />
          </Figure>
          <p>Rails 8.1.4.1 で登録されている主なコールバックは次のとおりです。</p>
          <ul>
            <li>
              ActiveSupport：run で実行コンテキストを用意し、complete で <code>ActiveSupport::CurrentAttributes.clear_all</code>（要求ごとの値を入れておく CurrentAttributes の値を消すメソッド）を呼ぶ（<code>active_support/railtie.rb</code>）。
            </li>
            <li>ActiveRecord のクエリキャッシュ（同じ SQL の結果を保存して、2回目はデータベースに問い合わせない仕組み）：run で有効にし、complete で無効にして中身を消す（<code>active_record/query_cache.rb</code>）。</li>
            <li>
              ActiveRecord の接続プール（データベースとの接続を作っておき、使い回すための置き場所）：complete で、トランザクション（複数の SQL をまとめて確定・取り消しする単位）の途中でなければ接続をプールに返す（<code>connection_pool.rb</code>）
              <Ref n={13} />。
            </li>
            <li>development：オートロードと再読み込みが同時に起きないようにするロック（<code>InterlockHook</code>）。</li>
          </ul>
          <p>
            同じリクエストの中で同じ SQL を2回実行しても2回目はデータベースに問い合わせないこと（<ChapterLink n={22} />）や、<code>Current.user</code>{' '}
            の値が次のリクエストに残らないことは、この仕組みによるものです。ActiveJob のジョブの実行も、Reloader を通して Executor で包まれます（<code>active_job/railtie.rb</code>）。自分でスレッドを作ってアプリケーションのコードを実行する場合は、
            <code>Rails.application.executor.wrap {'{ ... }'}</code> で包みます
            <Ref n={11} />。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>require・require_relative はファイルを実行し、読み込んだファイルを $LOADED_FEATURES に記録して2回目は実行しません。読み込んでいないクラスを使うと NameError になります。</li>
          <li>class でクラスを定義すると、クラス名の定数にクラスのオブジェクトが入ります。クラスを使うことは、その定数を参照することです。</li>
          <li>Rails の開発環境では、定数を初めて参照したときにファイルを読み込み（オートロード）、ファイルが変わると次の要求の前に読み込み直します（リロード）。本番環境では起動時にすべて読み込み、変更の反映には再起動が必要です。</li>
          <li>オートロードパスの中では、ファイルのパスが定数のパスに、ディレクトリが名前空間に対応します。変換は String#camelize と上書き設定で行われます。</li>
          <li>Zeitwerk の setup は、各オートロードパスの直下に Module#autoload を設定します。サブディレクトリの中身は、親の名前空間が作られたときに設定します。</li>
          <li>autoload が呼ぶ Kernel#require を Zeitwerk が置き換えており、ファイルなら定数が定義されたかを確かめ、ディレクトリならモジュールを作ります。</li>
          <li>ファイルで定義する名前空間は、Module#const_added で検出し、クラス本体の中から子の定数を参照できるようにします。</li>
          <li>production は起動時にすべて読み込み、命名の誤りは起動時の例外になります。bin/rails zeitwerk:check で事前に確かめられます。</li>
          <li>development は ActionDispatch::Reloader がファイルの変更を検出し、remove_const と setup のやり直しで再読み込みします。古いクラスオブジェクトを保存しないようにします。</li>
          <li>Executor は、リクエストやジョブの前後でクエリキャッシュ、接続の返却、CurrentAttributes の消去などを行います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Autoloading and Reloading Constants', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/autoloading_and_reloading_constants.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'main と once のローダー、autoload_lib と ignore、require を使わないこと、再読み込みと古いオブジェクト、初期化中のオートロードの扱い（to_prepare など）、zeitwerk:check、Inflector の設定。' },
    { title: 'railties/lib/rails/autoloaders/inflector.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/autoloaders/inflector.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'ファイル名を String#camelize で定数名に変換し、上書き設定を優先する実装。' },
    { title: 'Module#autoload', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html#method-i-autoload', accessed: '2026-11-11', version: 'Ruby 4.0', note: '定数が初めて参照されたときに指定したファイルを require する仕様。' },
    { title: 'lib/zeitwerk/loader.rb・lib/zeitwerk/cref.rb', publisher: 'fxn/zeitwerk（GitHub）', url: `${ZW}/lib/zeitwerk/loader.rb`, accessed: '2026-11-11', version: 'Zeitwerk 2.8.3', note: 'setup と define_autoloads_for_dir、visit_subdir。Cref#autoload が Module#autoload を呼ぶこと（cref.rb）。' },
    { title: 'lib/zeitwerk/core_ext/kernel.rb', publisher: 'fxn/zeitwerk（GitHub）', url: `${ZW}/lib/zeitwerk/core_ext/kernel.rb`, accessed: '2026-11-11', version: 'Zeitwerk 2.8.3', note: 'Kernel#require の置き換えと、その処理が require_relative には適用されないことの説明。' },
    { title: 'lib/zeitwerk/loader/callbacks.rb', publisher: 'fxn/zeitwerk（GitHub）', url: `${ZW}/lib/zeitwerk/loader/callbacks.rb`, accessed: '2026-11-11', version: 'Zeitwerk 2.8.3', note: 'on_file_autoloaded の定数の確認と Zeitwerk::NameError、on_dir_autoloaded のモジュール作成。' },
    { title: 'lib/zeitwerk/core_ext/module.rb', publisher: 'fxn/zeitwerk（GitHub）', url: `${ZW}/lib/zeitwerk/core_ext/module.rb`, accessed: '2026-11-11', version: 'Zeitwerk 2.8.3', note: 'Module#const_added による明示的な名前空間の検出。' },
    { title: 'CHANGELOG.md', publisher: 'fxn/zeitwerk（GitHub）', url: `${ZW}/CHANGELOG.md`, accessed: '2026-11-11', version: 'Zeitwerk 2.8.3', note: '2.7.0（2024-10-11）で TracePoint をやめ Ruby 3.2 以上が必要になったこと、2.8.0 の nsfile、2.6.0 のディレクトリの処理順。' },
    { title: 'activesupport/lib/active_support/dependencies.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/dependencies.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Dependencies.clear が autoloader.reload を呼ぶこと。' },
    { title: 'lib/zeitwerk/loader.rb（__unload・reload）', publisher: 'fxn/zeitwerk（GitHub）', url: `${ZW}/lib/zeitwerk/loader.rb#L166-L252`, accessed: '2026-11-11', version: 'Zeitwerk 2.8.3', note: 'unload が remove_const と $LOADED_FEATURES の削除を行い、reload が unload と setup を実行すること。' },
    { title: 'Threading and Code Execution in Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/threading_and_code_execution.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Executor の run・complete と既定のコールバック、executor.wrap の使い方。' },
    { title: 'actionpack/lib/action_dispatch/middleware/executor.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/executor.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'run! と、rack.response_finished または body の close で complete! を呼ぶ実装。ActionDispatch::Reloader はこのクラスのサブクラス（reloader.rb）。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Executor の complete でトランザクション外の接続をプールに返す ExecutorHooks。クエリキャッシュは query_cache.rb、CurrentAttributes の消去は active_support/railtie.rb。' },
    { title: 'module Kernel（require・require_relative）', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Kernel.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'require_relative がそのファイルのディレクトリを基準に読み込み、読み込み済みなら false を返すこと。読み込んだファイルの絶対パスを $LOADED_FEATURES に記録し、記録のあるファイルは読み込み直さないこと。実行例は Ruby 4.0.9 で実測。' },
    { title: '変数と定数', publisher: 'Ruby リファレンスマニュアル', url: 'https://docs.ruby-lang.org/ja/latest/doc/spec=2fvariables.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: '大文字で始まる識別子が定数であること。クラス定義式がクラス名の定数にクラスオブジェクトを代入し、クラス名の参照は定数の参照であること。' },
    { title: 'class Module（const_defined?・const_get・constants）', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Module.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: '名前を指定して定数の有無を調べる・値を取り出す・定数の一覧を返すメソッド。実行例は Ruby 4.0.9 で実測。' },
  ],
}

export default withExplanations(ch08, explanation08)
