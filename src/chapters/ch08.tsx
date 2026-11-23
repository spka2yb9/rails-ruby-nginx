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
      <T x={190} y={370} fs={11.5} anchor="middle" tone="muted">
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

/* ---------- Shop を参照したときの処理の順とログ ---------- */
function ShopNestingFigure() {
  const logs = [
    { y: 202, n: 'ログの1行目', t: 'autoload set for Shop::Item', from: 217, x1: 450 },
    { y: 275, n: 'ログの2行目', t: 'constant Shop::Item loaded', from: 290, x1: 450 },
    { y: 362, n: 'ログの3行目', t: 'constant Shop loaded', from: 377, x1: 470 },
  ]
  return (
    <Svg
      id="ch08-shop-nesting"
      w={780}
      h={410}
      label="Shop を参照すると、autoload が shop.rb を require し、shop.rb の実行が始まる。class Shop の行で Ruby が定数 Shop を作ると、本体の実行より前に const_added(:Shop) が呼ばれ、shop/ の中に autoload が設定される。ここでログの1行目が出る。続いて class Shop の本体が実行され、ITEM_CLASS = Shop::Item の行で item.rb が実行される。ここでログの2行目が出る。shop.rb の実行が終わった後に Shop が定義されたかが確かめられ、ログの3行目が出る"
    >
      <T x={20} y={20} fs={11.5} tone="muted">
        処理（上から下へ時間の順）
      </T>
      <T x={500} y={20} fs={11.5} tone="muted">
        出るログ
      </T>
      <Box x={20} y={32} w={450} h={46} lines={['Shop を参照する', 'autoload が shop.rb を require する']} fs={12.5} subTone="muted" />
      <Arrow x1={245} y1={78} x2={245} y2={96} />
      <rect x={20} y={98} width={450} height={236} rx={8} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={34} y={118} bold fs={12.5}>
        shop.rb を実行している間
      </T>
      <Box x={40} y={130} w={410} h={44} lines={['class Shop の行', 'Ruby が定数 Shop を作る']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={245} y1={174} x2={245} y2={190} />
      <Box x={40} y={192} w={410} h={50} lines={['const_added(:Shop)（本体の実行より前）', 'shop/ の中に autoload を設定する']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={245} y1={242} x2={245} y2={258} />
      <Box x={40} y={260} w={410} h={60} lines={['class Shop の本体を実行', 'ITEM_CLASS = Shop::Item の行で', 'item.rb を実行する']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={245} y1={334} x2={245} y2={352} />
      <Box x={20} y={354} w={450} h={46} lines={['shop.rb の実行が終わった後', 'Shop が定義されたかを確かめる']} fs={12.5} subTone="muted" />
      {logs.map((l) => (
        <g key={l.n}>
          <T x={500} y={l.y - 6} fs={11.5} tone="muted">
            {l.n}
          </T>
          <Box x={500} y={l.y} w={260} h={30} lines={l.t} mono fs={11.5} fill="box4" align="start" />
          <Arrow x1={l.x1} y1={l.from} x2={498} y2={l.from} dashed />
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 再読み込みの前後で Article と a が指すクラス ---------- */
function ReloadObjectsFigure() {
  const rows = [
    { y: 40, title: '再読み込みの前', note: 'Article と a.class は同じクラス（object_id 5016）' },
    { y: 124, title: 'reload! の直後', note: 'remove_const で定数を取り除き、autoload を設定し直した（autoload?(:Article) はパスを返す）' },
    { y: 208, title: 'Article を参照した後', note: 'article.rb をもう一度実行して新しいクラスができた。a.class == Article は false' },
  ]
  return (
    <Svg
      id="ch08-reload-objects"
      w={780}
      h={290}
      label="再読み込みのコードの3つの時点で、定数 Article と変数 a が指すクラスを比べた図。再読み込みの前は、定数 Article と a.class が同じクラス（object_id 5016）を指す。reload! の直後は、定数 Article が取り除かれて autoload が設定し直され、a は古いクラス 5016 を指したまま。Article を参照した後は、article.rb がもう一度実行されて新しいクラス（object_id 5176）ができ、定数 Article はそれを指す。a は古いクラスを指し続けるので、a.class == Article は false になる"
    >
      <T x={240} y={24} anchor="middle" fs={11.5} tone="muted">
        Object の定数
      </T>
      <T x={415} y={24} anchor="middle" fs={11.5} tone="muted">
        新しいクラス
      </T>
      <T x={570} y={24} anchor="middle" fs={11.5} tone="muted">
        古いクラス
      </T>
      <T x={715} y={24} anchor="middle" fs={11.5} tone="muted">
        変数 a
      </T>
      {rows.map((r, i) => (
        <g key={r.title}>
          <T x={20} y={r.y + 27} bold fs={12.5}>
            {r.title}
          </T>
          {i === 1 ? (
            <Box x={160} y={r.y} w={160} h={46} lines="Article は無い" fs={12.5} fill="bg" dashed />
          ) : (
            <Box x={160} y={r.y} w={160} h={46} lines="Article" mono fs={12.5} fill="bg" />
          )}
          {i === 0 && <Arrow x1={320} y1={r.y + 23} x2={508} y2={r.y + 23} dashed />}
          {i === 2 && (
            <>
              <Arrow x1={320} y1={r.y + 23} x2={348} y2={r.y + 23} dashed accent />
              <Box x={350} y={r.y} w={130} h={46} lines={['Article クラス', 'object_id 5176']} fs={12} fill="box5" />
            </>
          )}
          <Box x={510} y={r.y} w={120} h={46} lines={['Article クラス', 'object_id 5016']} fs={12} />
          <Box x={670} y={r.y} w={90} h={46} lines={['a', 'インスタンス']} fs={12} fill="box4" />
          <Arrow x1={670} y1={r.y + 23} x2={632} y2={r.y + 23} dashed />
          <T x={160} y={r.y + 64} fs={11.5} tone="muted">
            {r.note}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 初期化ファイルから参照する時点 ---------- */
function BootOrderFigure() {
  return (
    <Svg
      id="ch08-boot-order"
      w={780}
      h={262}
      label="config/initializers のファイルから ApiGateway を参照する2つの書き方で、参照する時点を比べた図。Rails は136番目で config/initializers のファイルを実行し、171番目で main のローダーを準備して autoload を設定する。直接書くと、136番目の時点で ApiGateway を参照するので、autoload がまだ無く NameError になる。to_prepare に書くと、136番目ではブロックを登録するだけで、ローダーの準備の後にブロックが実行され、ApiGateway を参照できる。開発環境では、ファイルが変わった後の再読み込みのたびにブロックがもう一度実行され、新しいクラスに設定し直す"
    >
      <T x={20} y={65} bold fs={12.5}>
        Rails の処理
      </T>
      <Box x={130} y={30} w={190} h={62} lines={['136番目', 'config/initializers の', 'ファイルを実行']} fs={12} />
      <Arrow x1={320} y1={61} x2={348} y2={61} />
      <Box x={350} y={30} w={190} h={62} lines={['171番目', 'main のローダーを準備し、', 'autoload を設定する']} fs={12} />
      <Arrow x1={540} y1={61} x2={568} y2={61} />
      <Box x={570} y={30} w={190} h={62} lines={['開発環境で', 'ファイルが変わった後の', '再読み込み']} fs={12} />

      <T x={20} y={136} bold fs={12.5}>
        誤り
      </T>
      <T x={20} y={156} fs={11.5} tone="muted">
        直接書く
      </T>
      <Box x={130} y={110} w={190} h={60} lines={['ApiGateway を参照する', 'autoload がまだ無いので', 'NameError']} fs={12.5} fill="bg" subTone="danger" />

      <T x={20} y={214} bold fs={12.5}>
        正しい
      </T>
      <T x={20} y={234} fs={11.5} tone="muted" mono>
        to_prepare
      </T>
      <Box x={130} y={188} w={190} h={60} lines={['ブロックを登録するだけ', 'ApiGateway は参照しない']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={320} y1={218} x2={348} y2={218} />
      <Box x={350} y={188} w={190} h={60} lines={['ローダーの準備の後に実行', 'ApiGateway を参照できる']} fs={12.5} fill="box5" subTone="muted" />
      <Arrow x1={540} y1={218} x2={568} y2={218} />
      <Box x={570} y={188} w={190} h={60} lines={['再読み込みのたびに実行', '新しいクラスに設定し直す']} fs={12.5} fill="box5" subTone="muted" />
    </Svg>
  )
}

const ch08: Chapter = {
  number: 8,
  part: 2,
  title: 'オートロードとリロード（Zeitwerk）',
  summary:
    'Rails では、コントローラーに require を書かなくても Article を使えます。ファイル名とクラス名の対応を手掛かりに、初めて参照したとき、ファイルを書き換えたとき、本番で起動したときの違いを調べます。',
  goals: [
    'クラス名から、Rails がどのファイルを探すかを説明できる',
    'まとめて読む場合と必要になった時点で読む場合を、読み込みのログで見分けられる',
    '開発中のリロード後に古いクラスを参照し続ける例を読み、要求の前後に Rails が行う準備と後片付けを説明できる',
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
            <Ref n={14} />（図 8-1）。<code>require</code> も同じ働きで、こちらは自分のファイルの場所からではなく、読み込みパス（<code>$LOAD_PATH</code>
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
            <Ref n={15} />（<ChapterLink n={2} section="class-is-object" />）。
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
            <Ref n={16} />。<code>module Admin</code> の中で定義した Report は、Admin に属する定数になり、外からは <code>Admin::Report</code> と書いて参照します。このように、定数をまとめるモジュールを名前空間と呼びます（
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
            を表示すると、次のようになりました（ActiveStorage などの Engine の分は省略）。Engine は、gem が自分のモデルやコントローラーをアプリケーションに加えるための仕組みです（
            <ChapterLink n={7} section="railtie" />
            ）。手元のアプリケーションでは <code>bin/rails runner 'puts ActiveSupport::Dependencies.autoload_paths'</code> で表示できます。
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
            app/ の直下のディレクトリと concerns がそれぞれ独立したオートロードパスです。lib は <code>config.autoload_lib</code> で加わります。rails new が生成する config/application.rb には{' '}
            <code>config.autoload_lib(ignore: %w[assets tasks])</code> と書かれていて、lib をオートロードパスに加え、<code>ignore</code> に挙げた lib/assets と lib/tasks を対象から外します。
          </p>
          <p>
            各オートロードパスの中では、ファイルのパスが定数のパスに対応し、ディレクトリが名前空間になります。オートロードパス自身は名前空間になりません。app/models/article.rb が定義する定数は{' '}
            <code>Models::Article</code> ではなく <code>Article</code> です。
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
          <p>
            ファイル名から定数名への変換は、Rails の Inflector（単語の単数形・複数形や、大文字・小文字の形を変換する部品）が行います。変換の規則と、規則と違う名前を使いたいときの設定がどこで使われるかを確かめるために、Zeitwerk
            から呼ばれるメソッドを読みます。
          </p>
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
          <ul>
            <li>
              <code>camelize(basename, _abspath)</code>：Zeitwerk がファイルやディレクトリを見つけるたびに呼ぶメソッドです。<code>basename</code> は拡張子を除いた名前（<code>"article_comment"</code>
              ）、<code>_abspath</code> は絶対パスです。引数名の先頭の <code>_</code> は、受け取っても使わない引数に付ける Ruby の書き方です。
            </li>
            <li>
              <code>@overrides[basename] || basename.camelize</code>：<code>@overrides</code> は上書きの設定を入れたハッシュです。そのファイル名の設定があればその値を返します。設定が無ければ{' '}
              <code>@overrides[basename]</code> は <code>nil</code> なので、<code>||</code> の右側の <code>basename.camelize</code> の結果を返します。
            </li>
            <li>
              <code>inflect(overrides)</code>：渡されたハッシュを <code>@overrides</code> に加えます。上書きの設定を登録するときに呼びます。
            </li>
          </ul>
          <p>
            既定では ActiveSupport の <code>String#camelize</code> を使うので、<code>html_parser.rb</code> は <code>HtmlParser</code> になります
            <Ref n={2} />。<code>HTMLParser</code> にしたい場合は、<code>ActiveSupport::Inflector.inflections</code> で <code>acronym "HTML"</code>（HTML を略語として大文字のまま扱う指定）を設定するか、
            <code>{'Rails.autoloaders.main.inflector.inflect("html_parser" => "HTMLParser")'}</code> のようにファイル名ごとに指定します
            <Ref n={1} />。前者は <code>camelize</code> の結果を変え、後者は上の <code>@overrides</code> に入ります。Rails ガイドは、前者を config/initializers/inflections.rb に、後者を
            config/initializers/zeitwerk.rb に書く例を示しています。
          </p>
          <p>
            ファイル名と中の定義が規則に合っていないと、定数を参照したときに例外になります。<code>html_parser.rb</code> に <code>class HTMLParser</code> と書き、上の設定をしていない場合を、Zeitwerk
            のローダーだけを使って確かめました。参照する名前によって、例外のメッセージが変わります。
          </p>
          <Code
            lang="text"
            title="html_parser.rb に class HTMLParser と書いたときの例外（Zeitwerk 2.8.3、Ruby 4.0.9）"
            code={`
HTMLParser を参照したとき
NameError: uninitialized constant HTMLParser

HtmlParser を参照したとき
Zeitwerk::NameError: expected file /zw/app/html_parser.rb to define constant HtmlParser, but didn't
`}
          />
          <p>
            1つ目は、最初の節で require を忘れたときと同じメッセージです。ファイル名から決まった名前は <code>HtmlParser</code> なので、<code>HTMLParser</code>{' '}
            という名前に対応するファイルは無いものとして扱われます。2つ目は、<code>HtmlParser</code> のために html_parser.rb を実行したのに、その名前の定数が定義されなかったという意味です。この2つがどこで出るかは「定数を参照したときの処理」の節で見ます。
          </p>
          <p>同じ食い違いは、略語のほかに次のような場合にも起きます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ファイル</th>
                  <th>ファイルに書いた定義</th>
                  <th>規則から決まる定数</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>app/models/user_profiles.rb</code>
                  </td>
                  <td>
                    <code>class UserProfile</code>
                  </td>
                  <td>
                    <code>UserProfiles</code>（ファイル名が複数形のまま定数名になる）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>app/models/admin/report.rb</code>
                  </td>
                  <td>
                    <code>class Report</code>
                  </td>
                  <td>
                    <code>Admin::Report</code>（admin ディレクトリが名前空間になる）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>app/models/concerns/taggable.rb</code>
                  </td>
                  <td>
                    <code>module Concerns::Taggable</code>
                  </td>
                  <td>
                    <code>Taggable</code>（concerns はオートロードパスなので名前空間にならない）
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
            「require でファイルを読み込む」の節の greeter.rb を、<code>require_relative</code> の代わりに <code>autoload</code> で読み込んで確かめます。
          </p>
          <Code
            lang="ruby"
            title="autoload_demo.rb"
            code={`
Object.autoload(:Greeter, "/ex/greeter.rb")   # 登録するだけ。まだ実行しない

p Object.autoload?(:Greeter)
p $LOADED_FEATURES.grep(/greeter/)
puts Greeter.new.hello("佐藤")                # Greeter を初めて参照する
p Object.autoload?(:Greeter)
p $LOADED_FEATURES.grep(/greeter/)
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
"/ex/greeter.rb"
[]
greeter.rb を実行しています
こんにちは、佐藤さん
nil
["/ex/greeter.rb"]
`}
          />
          <p>
            出力の1行目と2行目は、Greeter を参照する前の状態です。<code>Object.autoload?(:Greeter)</code> は登録したパスを返し、<code>$LOADED_FEATURES</code> に greeter.rb はまだありません。3行目の「greeter.rb
            を実行しています」は <code>Greeter.new</code> の行で表示されたもので、ファイルはこの行で初めて実行されました。読み込みが済むと <code>autoload?</code> は <code>nil</code> を返し、
            <code>$LOADED_FEATURES</code> に greeter.rb が加わります。main.rb では <code>require_relative</code> を書いた行でファイルが実行されましたが、<code>autoload</code>{' '}
            では定数を参照した行で実行されます。
          </p>
          <p>
            Rails は初期化の Finisher（初期化の最後にまとめて実行する処理。<ChapterLink n={7} section="initializers" />）にある <code>setup_main_autoloader</code> で、オートロードパスをローダーに登録してから <code>setup</code> を呼びます。<code>setup</code>{' '}
            は各オートロードパスの直下にあるファイルとディレクトリを調べ、次のメソッドで autoload を設定します。どの定数にどのパスを登録するかを、ディレクトリの中身から決めている箇所です。
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
          <ul>
            <li>
              <code>define_autoloads_for_dir(dir, mod, external:)</code>：<code>dir</code> の直下を調べ、見つけた定数の autoload を <code>mod</code> に設定します。オートロードパスの直下を調べるときの{' '}
              <code>mod</code> は Object です。
            </li>
            <li>
              <code>@fs.ls(dir) do |basename, abspath, ftype|</code>：<code>dir</code> の直下にある .rb ファイルとディレクトリを、名前の順に1つずつブロックに渡します。<code>basename</code> は名前（
              <code>"article.rb"</code>）、<code>abspath</code> は絶対パス、<code>ftype</code> は <code>:file</code> か <code>:directory</code> です。
            </li>
            <li>
              <code>if basename == @nsfile</code> から <code>next</code> まで：<code>@nsfile</code> を設定したときだけ通る分岐です。Rails は設定しないので通りません。
            </li>
            <li>
              <code>basename.delete_suffix!('.rb')</code>：<code>"article.rb"</code> を <code>"article"</code> にします。
            </li>
            <li>
              <code>cname_for(basename, abspath)</code>：前の節の Inflector の <code>camelize</code> を呼び、結果をシンボルにして返します。<code>"article"</code> からは <code>:Article</code>{' '}
              になります。
            </li>
            <li>
              <code>visit_file(cref, abspath)</code>：その定数がまだ定義されておらず、autoload も設定されていなければ、<code>abspath</code> で autoload を設定します。同じ名前のディレクトリで設定済みのときは、ファイルのパスで設定し直します。
            </li>
            <li>
              <code>external:</code>：<code>mod</code> が Object のように Zeitwerk の管理の外で定義されたものかどうかを渡す引数です。<code>@nsfile</code> の検査にだけ使われます。
            </li>
          </ul>
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
          <ul>
            <li>
              <code>autoload set for Article, to be loaded from app/models/article.rb</code>：Article に、article.rb のパスで autoload を設定しました。
            </li>
            <li>
              <code>autoload set for Admin, to be autovivified from app/models/admin</code>：Admin に、ディレクトリのパスで autoload を設定しました。autovivify は、参照されたときにモジュールを自動で作ることを指す Zeitwerk
              の用語です。作る処理は次の節で見ます。
            </li>
            <li>
              <code>earlier autoload for Shop discarded</code> とその次の行：Shop にディレクトリで設定した autoload を取り消し、shop.rb のパスで設定し直しました。
            </li>
          </ul>
          <p>
            手元のアプリケーションで同じログを見るには、config/application.rb の <code>load_defaults</code> の行より後に <code>Rails.autoloaders.log!</code>{' '}
            と書いて起動します。ログは標準出力（ターミナル）に表示されます。NameError を調べるときに、その定数の autoload がどのファイルに設定されたか、または設定されなかったかを、このログで確かめられます。
          </p>
          <p>
            図 8-4 は、このログの時点で Object に設定されている autoload です。左がファイル、右が autoload で、矢印は「このファイルやディレクトリから、この autoload を設定した」ことを表します。admin/ と shop/
            の中にある report.rb と item.rb からは矢印が出ていません。
          </p>
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
            前の節のログには、ディレクトリのパスで設定した autoload がありました（Admin）。ディレクトリは Ruby のファイルとして実行できません。この節では、ディレクトリで設定した autoload から Admin
            がどう作られるかと、「expected file ... to define constant ..., but didn't」という例外がどこで出るかを見ます。
          </p>
          <p>
            オートロードが始まると、Ruby は <code>Kernel#require</code> を呼びます。普段書いている <code>require</code> は Kernel モジュールのメソッドで、どのオブジェクトからも呼べます（
            <ChapterLink n={2} section="kernel" />
            ）。Zeitwerk はこの <code>require</code> を独自のメソッドで置き換えています。
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
          <ul>
            <li>
              <code>Zeitwerk::Registry.autoloads.registered?(path)</code>：Zeitwerk が autoload に設定したパスの一覧から <code>path</code> を探し、設定したローダーを返します。一覧に無ければ <code>nil</code> を返します。
              <code>if loader = ...</code> は、戻り値を <code>loader</code> に入れ、その値が <code>nil</code> でなければ中に進む書き方です。
            </li>
            <li>
              <code>zeitwerk_original_require(path)</code>：置き換える前の <code>require</code> です。Zeitwerk は置き換える前に、元のメソッドへこの別名を付けています。戻り値は最初の節で見たとおり、ファイルを実行したら{' '}
              <code>true</code>、読み込み済みなら <code>false</code> です。
            </li>
            <li>
              外側の <code>else</code> より後：<code>require "json"</code> のように、Zeitwerk が設定していないパスが渡された場合です。元の <code>require</code> をそのまま呼びます。<code>$LOADED_FEATURES.last</code>{' '}
              は今読み込まれたファイルの絶対パスです。それが Zeitwerk の設定したファイルだったときだけ、次に説明する確認をします。
            </li>
          </ul>
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
          <p>
            図 8-5 は、admin.rb が無い状態で <code>Admin::Report</code> を参照したときの流れです。① で Admin がディレクトリから作られ、② で report.rb が読み込まれます。右の列が、上の <code>require</code> の中で行われる処理です。
          </p>
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
            <code>Admin::Report</code> を参照した後の3行のうち、1行目の autovivified は図の ① の <code>Module.new</code> です。2行目で admin/ の中の report.rb に autoload が設定され、3行目が ② の読み込みです。setup
            のログには無かった <code>Admin::Report</code> の autoload は、Admin が作られた後に設定されています。
          </p>
          <p>
            このとき <code>Admin.class</code> は <code>Module</code> でした。<code>Admin</code> に共通の処理を持たせたい場合は、<code>app/models/admin.rb</code> に{' '}
            <code>module Admin</code> を書きます。
          </p>
          <p>
            ここまでの内容から、定数が見つからないときの例外は2種類あり、出している所が違うことが分かります。メッセージを見ればどちらかを判断でき、確かめる場所が決まります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>メッセージ</th>
                  <th>起きていること</th>
                  <th>確かめること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>uninitialized constant Foo (NameError)</code>
                  </td>
                  <td>Ruby が出す例外。Foo という定数が無く、その名前の autoload も設定されていない</td>
                  <td>
                    ファイルがオートロードパスの中にあるか。ファイル名とディレクトリ名から決まる定数名が、参照した名前と同じか（複数形、略語、名前空間）。初期化ファイルの中で参照していないか（「初期化中のオートロード」の節）
                  </td>
                </tr>
                <tr>
                  <td>
                    <code>expected file ... to define constant Foo, but didn't (Zeitwerk::NameError)</code>
                  </td>
                  <td>
                    Zeitwerk の <code>__on_file_autoloaded</code> が出す例外。autoload は設定されていて、ファイルも実行したが、Foo が定義されなかった
                  </td>
                  <td>メッセージにあるファイルを開き、class や module の名前と入れ子を、メッセージにある定数名と比べる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Callout kind="warn">
            <p>
              Zeitwerk による <code>require</code> の置き換えは <code>require_relative</code> には適用されません（kernel.rb のコメントに理由が書かれています）。Ruby の <code>require_relative</code> は{' '}
              <code>require</code> を呼ばずにファイルを読み込むので、上のメソッドを通りません。そのため、定数が定義されたかの確認も、読み込んだことの記録も行われません。オートロードパスの中のファイルを{' '}
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
            前の節の Admin にはディレクトリしか無く、Zeitwerk がモジュールを作りました。この節では、モデルの Shop を <code>app/models/shop.rb</code> に書き、Shop に関係するクラスを{' '}
            <code>app/models/shop/item.rb</code> に <code>Shop::Item</code> として置く構成を見ます。モデルのファイルと同じ名前のディレクトリを作り、そのモデルに関係するクラスをまとめるときの形です。
          </p>
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
            図 8-4 で見たとおり、setup の直後には <code>Shop::Item</code> の autoload が設定されていません。Admin のときは Zeitwerk が自分でモジュールを作ったので、作った直後に中身の autoload を設定できました。Shop は shop.rb の{' '}
            <code>class Shop</code> の行で Ruby が作るので、Zeitwerk は作られた時点を別の方法で知る必要があります。autoload の設定が <code>ITEM_CLASS = Shop::Item</code> の行より遅れると、この行は NameError になります。
          </p>
          <p>
            そのためには、<code>Shop</code> という定数が作られた直後に、shop/ の中身へ autoload を設定しなければなりません。Zeitwerk 2.7 以降は、定数が追加されたときに Ruby が呼ぶ{' '}
            <code>Module#const_added</code> を使っています。このメソッドが呼ばれる時点を、Zeitwerk と同じ形の小さなコードで確かめます。
          </p>
          <Code
            lang="ruby"
            title="const_added.rb"
            code={`
module Watch
  def const_added(cname)
    puts "const_added: #{self}::#{cname}"
    super
  end
  Module.prepend(self)
end

class Shop
  puts "class Shop の本体を実行しています"
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
const_added: Object::Shop
class Shop の本体を実行しています
`}
          />
          <p>
            <code>const_added</code> は、定数が追加されたモジュールを <code>self</code>、定数名のシンボルを引数として呼ばれます。トップレベルの <code>class Shop</code> では <code>self</code> が Object、
            <code>cname</code> が <code>:Shop</code> です。出力の順から、<code>class Shop</code> の本体が実行されるより前に呼ばれることが分かります。Zeitwerk の実装は次のとおりです。
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
          <ul>
            <li>
              <code>#: (Symbol) -&gt; void</code>：引数と戻り値の型を書いたコメントです。実行には関係しません。
            </li>
            <li>
              <code>Zeitwerk::Registry.explicit_namespaces.loader_for(self, cname)</code>：setup が「同じ名前の .rb ファイルとディレクトリの両方がある」と判断した定数の一覧から、追加された定数を探します。一覧にあればそのローダーを返します。一覧に無ければ{' '}
              <code>nil</code> を返すので、ほとんどの定数では何もせずに <code>super</code> へ進みます。
            </li>
            <li>
              <code>const_get(cname, false)</code>：追加された定数の値（Shop クラス）を取り出します。<code>false</code> は、親クラスなどをさかのぼって探さない指定です。
            </li>
            <li>
              <code>unless namespace.is_a?(Module)</code>：値がクラスでもモジュールでもなければ例外にします。クラスは Module のサブクラスなので、<code>class Shop</code> はこの検査を通ります。
            </li>
            <li>
              <code>loader.__on_namespace_loaded(cref, namespace)</code>：shop/ の中身を調べ、Shop に autoload を設定します。前の節でディレクトリからモジュールを作った直後に呼ばれるのと同じ処理です。
            </li>
            <li>
              <code>super</code>：Ruby にもともとある <code>const_added</code> を呼びます。
            </li>
          </ul>
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
          <p>
            1行目は <code>const_added</code> から設定された <code>Shop::Item</code> の autoload、2行目は <code>ITEM_CLASS = Shop::Item</code> の行での読み込みです。3行目の「constant Shop loaded」は shop.rb
            の実行が最後まで終わってから出るので、<code>Shop::Item</code> の行より後になります。
          </p>
          <p>
            次の図は、Shop を参照してから shop.rb の実行が終わるまでを、上から時間の順に並べたものです。大きな枠の中が shop.rb を実行している間で、右の列は各時点で出るログの行です。
          </p>
          <Figure
            title="Shop を参照したときの処理の順とログ"
            caption="上のログをもとにした模式図。破線の矢印は、その時点で右のログの行が出ることを表す。ログの行は、先頭の Zeitwerk@rails.main: とファイルのパスを省略した。"
          >
            <ShopNestingFigure />
          </Figure>
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
            に置き、<code>config.autoload_lib(ignore: %w[assets tasks])</code> のまま production で起動すると、次の例外で起動に失敗しました。timing.rb が定義しているのは、トップレベルの <code>class Timing</code>{' '}
            です。
          </p>
          <Code
            lang="text"
            code={`
zeitwerk/loader/callbacks.rb:31:in 'Zeitwerk::Loader::Callbacks#on_file_autoloaded':
expected file /work/demo/lib/middleware/timing.rb to define constant Middleware::Timing, but didn't (Zeitwerk::NameError)
`}
          />
          <p>
            メッセージは「定数を参照したときの処理」の節で見た <code>Zeitwerk::NameError</code> と同じ形です。lib がオートロードパスなので、lib/middleware/timing.rb から決まる定数は{' '}
            <code>Middleware::Timing</code> です。一括読み込みがこのファイルを実行しても、定義されるのは <code>Timing</code> なので、定数の確認に失敗しました。1行目の <code>callbacks.rb:31</code>{' '}
            は、その確認をしている <code>on_file_autoloaded</code> の位置です。
          </p>
          <p>
            開発環境では動いていたのに本番環境の起動で失敗するのは、読み込むファイルの範囲が違うためです。開発環境で読み込まれるのは、参照された定数のファイルだけです。development では
            lib/middleware/timing.rb に対応する定数を参照するコードがないので、この誤りによる例外は起きません。開発環境で確かめるには <code>bin/rails zeitwerk:check</code>{' '}
            を使います。このタスクはアプリケーションを一括読み込みし、問題が無ければ <code>All is good!</code> と表示します
            <Ref n={1} />。上の構成では <code>expected file lib/middleware/timing.rb to define constant Middleware::Timing, but didn't</code> が表示され、<code>ignore</code> に{' '}
            <code>middleware</code> を加えると <code>All is good!</code> になりました。CI（変更を共有するたびにテストなどを自動で実行する仕組み）でこのタスクを実行すると、本番の起動時に初めて気付く事態を防げます。
          </p>
          <p>
            直し方は、そのファイルをどう読み込みたいかで決まります。オートロードで読み込むファイルなら、ファイルの場所か定数名を変えて規則に合わせます。ミドルウェアのように自分で <code>require</code>{' '}
            して読み込むファイルなら、<code>ignore</code> でオートロードの対象から外します（「初期化中のオートロード」の節）。
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
          <p>
            lib の中のディレクトリを外すときは、ここまでの例のように <code>config.autoload_lib</code> の <code>ignore</code> に書きます。<code>collapse</code> はローダーのメソッドで、Rails ガイドは config/initializers のファイルに{' '}
            <code>{'Rails.autoloaders.main.collapse("#{Rails.root}/app/models/shapes")'}</code> のように呼ぶ例を示しています。
          </p>
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
            再読み込みを始めるのは、ミドルウェアの <code>ActionDispatch::Reloader</code> です（<ChapterLink n={6} />）。このクラスは <code>ActionDispatch::Executor</code>（「Executor の役割」の節で見ます）のサブクラスで、
            <code>Rails.application.reloader</code> の <code>run!</code> をリクエストの前に呼びます。<code>run!</code> は、まず <code>check</code>{' '}
            でファイルが変わったかを調べます。変わっていれば、初期化処理 <code>set_clear_dependencies_hook</code> が登録した次のコールバック（決まった時点で呼ばれるように登録しておく処理）が実行されます。
          </p>
          <p>
            図 8-6 の左の列が、リクエストごとに通る順です。「ファイルが変わったか」が上の <code>check</code> で、「はい」のときだけ右の再読み込みに進みます。次に引用するのは、ファイルの監視を用意し、変更があったときの処理を登録している箇所です。
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
          <ul>
            <li>
              <code>config.reloading_enabled?</code>：<code>enable_reloading</code> の値を返します。rails new が生成する設定では、開発環境だけが true です。
            </li>
            <li>
              <code>config.reload_classes_only_on_change</code>：ファイルが変わったときだけ再読み込みする設定です。既定は true です。
            </li>
            <li>
              <code>config.file_watcher.new(*watchable_args, &amp;callback)</code>：ファイルを監視するオブジェクトを作ります。<code>watchable_args</code> は監視するファイルとディレクトリで、オートロードパスのディレクトリにある .rb
              ファイルが入ります。<code>callback</code> は引用した範囲の少し前で定義されている lambda（後で呼ぶ処理を入れたオブジェクト。<ChapterLink n={4} section="proc-lambda" />
              ）で、変更があったときに実行する処理です。
            </li>
            <li>
              <code>reloaders &lt;&lt; reloader</code>：作ったオブジェクトを、監視するオブジェクトの一覧に加えます。<code>check</code> はこの一覧の <code>updated?</code> を呼び、1つでも変更があれば true を返します。
            </li>
            <li>
              <code>app.reloader.to_run(prepend: true) do ... end</code>：ブロックを、Reloader の run のコールバックの先頭に登録します。<code>check</code> が true を返したリクエストで、ほかのコールバックより先に実行されます。
            </li>
            <li>
              <code>class_unload! do reloader.execute end</code>：<code>reloader.execute</code> が <code>callback</code> を呼びます。<code>class_unload!</code> は、その前後で before_class_unload と after_class_unload
              のコールバックを実行します。
            </li>
          </ul>
          <p>
            <code>config.file_watcher</code> の既定は、ファイルの更新時刻を比べる <code>ActiveSupport::FileUpdateChecker</code> です。<code>callback</code> の中で呼ばれる{' '}
            <code>ActiveSupport::Dependencies.clear</code> は <code>autoloader.reload</code> を呼び
            <Ref n={9} />、Zeitwerk の <code>reload</code> は <code>unload</code> と <code>setup</code> を順に実行します。<code>unload</code> は、読み込み済みの定数を{' '}
            <code>remove_const</code>（定数を取り除くメソッド）で取り除き、読み込んだファイルを <code>$LOADED_FEATURES</code> から消します。こうしておくと、次に定数が参照されたときに{' '}
            <code>require</code> がファイルをもう一度実行します（<code>loader.rb</code> の 166〜252 行目）
            <Ref n={10} />。再読み込みの後には <code>to_prepare</code> のコールバックが実行されます（図 8-6 の 3）。次の節で使います。
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
          <ul>
            <li>
              <code>a = Article.new</code>：再読み込みの前のクラスから、インスタンスを作っておきます。
            </li>
            <li>
              <code>Rails.application.reloader.check!</code>：ファイル監視に変更があったかを尋ねます。変更の前は false です。
            </li>
            <li>
              <code>FileUtils.touch(...)</code>：article.rb の中身は変えずに、更新時刻だけを新しくします。既定のファイル監視は更新時刻を比べるので、これで変更があったと判定されます。直前の <code>sleep 1.1</code>{' '}
              は、更新時刻が前の値と確実に変わるように入れています。
            </li>
            <li>
              <code>reloaded!</code>：再読み込みが必要かどうかの記録を消す、Reloader の内部のメソッドです。
            </li>
            <li>
              <code>reload!</code>：リクエストを待たずに、その場で再読み込みを実行します。
            </li>
            <li>
              <code>Object.autoload?(:Article)</code>：パスが返りました。定数 Article は取り除かれ、「Module#autoload と setup」の節の autoload_demo.rb で登録の直後に見たのと同じ、参照を待つ状態に戻っています。
            </li>
            <li>
              <code>Article.object_id</code>：この参照で article.rb がもう一度実行され、新しいクラスが作られました。値が 5016 から 5176 に変わったので、前とは別のオブジェクトです。
            </li>
          </ul>
          <p>
            再読み込みの後、<code>Article</code> は新しいクラスオブジェクトになりました。再読み込みの前に作った <code>a</code> のクラスは、名前は同じ <code>"Article"</code>{' '}
            でも古いクラスオブジェクトのままです。クラスオブジェクトを定数以外の場所（クラス変数、gem の設定、再読み込みされないクラスの中など）に保存すると、このような古いクラスが残ります
            <Ref n={1} />。
          </p>
          <p>
            次の図は、上のコードの3つの時点で、定数 Article と変数 a がどのクラスを指しているかを、上の行から順に並べたものです。古いクラスの列を上から下へ見ると、a は最後まで object_id 5016 のクラスを指しています。
          </p>
          <Figure
            title="再読み込みの前後で Article と a が指すクラス"
            caption="上のコードの結果をもとにした模式図。破線の矢印は参照を表し、定数からは定数に入っているクラスを、a からは a.class が返すクラスを指す。破線の箱は、定数が無いことを表す。"
          >
            <ReloadObjectsFigure />
          </Figure>
          <p>業務では、次のような形でこの仕組みに出会います。</p>
          <ul>
            <li>
              ファイルを保存したのに動作が変わらない：再読み込みされるのは、オートロードパスの中のファイルです。config/application.rb、config/initializers のファイル、オートロードの対象から外した lib/middleware
              のファイルは起動時に一度実行されるだけなので、変更したらサーバーを再起動します。
            </li>
            <li>
              <code>bin/rails console</code> で古いコードのまま動く：コンソールではファイル監視が働きません。<code>reload!</code> と入力すると再読み込みされます。再読み込みの前に変数へ入れたオブジェクトは、上の{' '}
              <code>a</code> と同じく古いクラスのままです。
            </li>
            <li>
              開発環境でだけ、直したはずのメソッドが古い動作をする、Article のインスタンスなのに <code>is_a?(Article)</code> が false になる：再読み込みされない場所に、古いクラスオブジェクトが保存されています。保存しない書き方は次の節で見ます。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'boot-time',
      title: '初期化中のオートロード',
      body: (
        <>
          <p>
            外部のサービスの接続先のように、起動したときにアプリケーションのクラスへ設定しておきたい値があります。起動時に実行されるファイルは <code>config/initializers</code> にあるので、そこでクラスを参照する書き方を思い付きます。
          </p>
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
            メッセージは、最初の節で require を忘れたときと同じ「uninitialized constant」です。app/models/article.rb は正しい場所にありますが、参照した時点が早すぎます。
          </p>
          <p>
            <ChapterLink n={7} />で見たとおり、<code>load_config_initializers</code>（184個中136番目）は、main のローダーを準備する Finisher の <code>setup_main_autoloader</code>
            （171番目）より前に実行されます。そのため、初期化ファイルの時点では <code>Article</code> の autoload がまだ設定されていません。仮に読み込めたとしても、初期化ファイルは一度しか実行されないので、再読み込みの後は古いクラスを使い続けることになります
            <Ref n={1} />。
          </p>
          <Callout kind="note">
            <p>
              Rails 6.0 と 6.1 では、同じ書き方をしても例外にならず、読み込んだ定数を取り除いたうえで <code>DEPRECATION WARNING: Initialization autoloaded the constant ...</code>{' '}
              という警告を出していました。Rails 7.0 からは NameError になります。古いバージョンのアプリケーションでこの警告を見たときも、原因と直し方はこの節と同じです。
            </p>
          </Callout>
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
            1行目の書き方を、誤った書き方と並べます。<code>ApiGateway</code> は app/ の下に置いた、再読み込みの対象のクラスとします。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/api_gateway.rb"
            code={`
# 誤り：初期化ファイルの実行中に ApiGateway を参照するので NameError になる
ApiGateway.endpoint = "https://example.com"

# 正しい：ブロックを登録するだけで、この時点では ApiGateway を参照しない
Rails.application.config.to_prepare do
  ApiGateway.endpoint = "https://example.com"
end
`}
          />
          <p>
            <code>to_prepare</code> のブロックは、初期化ファイルを読み込んだ時点では実行されません。実行されるのは、起動時に main のローダーの準備が終わった後（<ChapterLink n={7} section="config-files" />
            ）と、開発環境で再読み込みが起きるたびです（図 8-6 の 3）。再読み込みで作り直された <code>ApiGateway</code> は article.rb の例と同じく新しいクラスオブジェクトで、前に設定した <code>endpoint</code>{' '}
            の値を持っていません。<code>to_prepare</code> に書いておくと、そのたびに設定し直されます。<code>after_initialize</code> のブロックは起動時に1回だけ実行されるので、必要なデータがあるかの確認のように、再読み込みの後にやり直す必要が無い処理に使います。
          </p>
          <p>
            次の図は、上の2つの書き方で ApiGateway を参照する時点を、Rails の処理の順に左から並べたものです。一番上の行が Rails の処理で、その下の2行が2つの書き方です。
          </p>
          <Figure
            title="初期化ファイルから参照する時点"
            caption="左から右へ時間の順に並べた模式図で、ほかの初期化処理は省略した。番号は、initialize! が実行する184個の初期化処理の中の順番。"
          >
            <BootOrderFigure />
          </Figure>
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
          <p>
            次のソースでは、run と complete がリクエストの処理のどの時点で実行されるかを確かめます。<code>@executor</code> は <code>Rails.application.executor</code>、<code>@app</code>{' '}
            は内側のミドルウェアです。
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
          <ul>
            <li>
              <code>state = @executor.run!(reset: true)</code>：run のコールバックを実行します。戻り値の <code>state</code> は、後で <code>complete!</code> を呼ぶためのオブジェクトです。
            </li>
            <li>
              <code>response_finished &lt;&lt; proc {'{ state.complete! }'}</code>：<code>env["rack.response_finished"]</code> は、応答を送り終えた後に呼ぶ処理を入れる配列です。サーバーがこの配列を用意していれば、
              <code>complete!</code> を呼ぶ処理を加えます。この行では登録するだけで、まだ呼びません。
            </li>
            <li>
              <code>response = @app.call(env)</code>：内側のミドルウェアとコントローラーを実行します。<code>response</code> は状態コード、ヘッダー、body の3要素の配列です（
              <ChapterLink n={6} section="rack-contract" />
              ）。
            </li>
            <li>
              <code>env["action_dispatch.report_exception"]</code> の3行：env に記録された例外を、エラーの報告先（<code>error_reporter</code>）に渡します。run と complete には関係しません。
            </li>
            <li>
              <code>response &lt;&lt; ::Rack::BodyProxy.new(response.pop) {'{ state.complete! }'}</code>：<code>response.pop</code> で配列の最後の body を取り出し、<code>Rack::BodyProxy</code>{' '}
              で包んで配列に戻します。BodyProxy は、body の <code>close</code> が呼ばれたときにブロックを実行します。
            </li>
            <li>
              <code>returned = true</code>：ここまで例外が起きずに進んだことの記録です。引用の後に続く <code>ensure</code> は、<code>returned</code> が設定されておらず <code>response_finished</code>{' '}
              も無いときに <code>complete!</code> を呼びます。内側で例外が起きた場合も、complete のコールバックは実行されます。
            </li>
          </ul>
          <p>
            <code>complete!</code> を呼ぶのは、内側の <code>call</code> から戻ったときではありません。サーバーが <code>rack.response_finished</code>（応答を送り終えた後に呼ぶ処理を登録するための env の値。Rack 3 で追加）を提供していれば応答の送信が終わった後、そうでなければ body の <code>close</code> のときです。body をストリーミング（本文を作りながら少しずつ送ること）で書き出している間も、データベース接続などが使える状態を保つためです
            <Ref n={12} />。
          </p>
          <Figure n="8-7" title="Executor の run と complete" caption="Rails 8.1.4.1 で ActiveSupport・ActiveRecord の Railtie が登録しているコールバックの主なもの。">
            <ExecutorFigure />
          </Figure>
          <p>
            Rails 8.1.4.1 で登録されている主なコールバックは次のとおりです。図 8-7 は、左が run、右が complete で、中央のアプリケーションのコードをこの2つが挟むことを表しています。
          </p>
          <ul>
            <li>
              ActiveSupport：run で実行コンテキスト（実行中のコントローラーやジョブを、エラーの報告などから参照できるように入れておく場所）を用意し、complete で <code>ActiveSupport::CurrentAttributes.clear_all</code>（要求ごとの値を入れておく CurrentAttributes の値を消すメソッド）を呼ぶ（<code>active_support/railtie.rb</code>）。
            </li>
            <li>ActiveRecord のクエリキャッシュ（同じ SQL の結果を保存して、2回目はデータベースに問い合わせない仕組み）：run で有効にし、complete で無効にして中身を消す（<code>active_record/query_cache.rb</code>）。</li>
            <li>
              ActiveRecord の接続プール（データベースとの接続を作っておき、使い回すための置き場所）：complete で、トランザクション（複数の SQL をまとめて確定・取り消しする単位）の途中でなければ接続をプールに返す（<code>connection_pool.rb</code>）
              <Ref n={13} />。
            </li>
            <li>
              development：オートロードと再読み込みが同時に起きないようにするロック（<code>InterlockHook</code>）。ロックは、ある処理が終わるまでほかのスレッドの処理を待たせる仕組みです。アプリケーションのコードを実行している途中でクラスが取り除かれないように、run
              で取り、complete で返します。
            </li>
          </ul>
          <p>
            同じリクエストの中で同じ SQL を2回実行しても2回目はデータベースに問い合わせないこと（<ChapterLink n={22} />）や、<code>Current.user</code>{' '}
            の値が次のリクエストに残らないことは、この仕組みによるものです。ActiveJob のジョブの実行も、Reloader を通して Executor で包まれます（<code>active_job/railtie.rb</code>）。自分でスレッドを作ってアプリケーションのコードを実行する場合は、
            <code>Rails.application.executor.wrap {'{ ... }'}</code> で包みます
            <Ref n={11} />。
          </p>
          <p>
            スレッドは、1つのプロセスの中で複数の処理を並行して進める単位です（<ChapterLink n={23} section="thread" />
            ）。コントローラーやジョブの中のコードは Rails が Executor で包んで呼ぶので、<code>wrap</code> を書く必要はありません。書くのは、<code>Thread.new</code>{' '}
            などで自分で作ったスレッドの中から、モデルなどのアプリケーションのコードを呼ぶときです。
          </p>
          <Code
            lang="ruby"
            title="自分で作ったスレッドでアプリケーションのコードを実行する"
            code={`
Thread.new do
  Rails.application.executor.wrap do
    puts Article.count   # アプリケーションのコード
  end
end
`}
          />
          <p>
            <code>wrap</code> はブロックの前に run のコールバックを、後に complete のコールバックを実行します。包まずに書くと、そのスレッドでは上の一覧の処理が実行されません。レビューで <code>Thread.new</code>{' '}
            の中にモデルの呼び出しを見つけたら、<code>executor.wrap</code> で包まれているかを確かめます（<ChapterLink n={23} section="thread-safety" />）。
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
          <li>「uninitialized constant」は、その名前の autoload が設定されていないときに Ruby が出す例外です。「expected file ... to define constant ..., but didn't」は、ファイルを実行しても期待した定数が定義されなかったときに Zeitwerk が出す例外です。</li>
          <li>production は起動時にすべて読み込み、命名の誤りは起動時の例外になります。bin/rails zeitwerk:check で事前に確かめられます。</li>
          <li>development は ActionDispatch::Reloader がファイルの変更を検出し、remove_const と setup のやり直しで再読み込みします。古いクラスオブジェクトを保存しないようにします。</li>
          <li>config/initializers のファイルは main のローダーの準備より前に実行されるので、再読み込み対象の定数を参照すると NameError になります。再読み込みのたびに設定し直す処理は to_prepare に書きます。</li>
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
