import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation08 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const ZW = 'https://github.com/fxn/zeitwerk/blob/v2.8.3'

/* ---------- 図 8-1 setup 直後の autoload ---------- */
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
      id="8-1"
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

/* ---------- 図 8-2 Admin::Report を参照したときの流れ ---------- */
function AutoloadSeqFigure() {
  const cols = [
    { x: 90, name: 'アプリのコード' },
    { x: 290, name: 'Ruby（autoload）' },
    { x: 510, name: 'Kernel#require（Zeitwerk）' },
  ]
  return (
    <Svg
      id="8-2"
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

/* ---------- 図 8-3 開発環境での再読み込み ---------- */
function ReloadFigure() {
  return (
    <Svg
      id="8-3"
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

/* ---------- 図 8-4 Executor の run と complete ---------- */
function ExecutorFigure() {
  return (
    <Svg
      id="8-4"
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
    'require を書かずにクラスが使える仕組みを、Zeitwerk の実装から説明します。ファイル名と定数名の対応、Module#autoload と Kernel#require の差し替え、本番環境の一括読み込み、開発環境の再読み込み、リクエスト処理の前後に準備と後片付けを行う Executor の役割が分かります。',
  goals: [
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
      id: 'naming',
      title: 'ファイル名と定数名の対応',
      body: (
        <>
          <p>
            この命名規則に基づく<Term en="autoload">オートロード</Term>を管理するのが、<Term>Zeitwerk</Term>という gem のローダーです。
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
          <p>ファイル名から定数名への変換は、Rails の Inflector が行います。</p>
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
            <Ref n={2} />。<code>HTMLParser</code> にしたい場合は、<code>ActiveSupport::Inflector.inflections</code> で <code>acronym "HTML"</code> を設定するか、
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
            Rails は初期化の Finisher にある <code>setup_main_autoloader</code> で、オートロードパスをローダーに登録してから <code>setup</code> を呼びます。<code>setup</code>{' '}
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
          <Figure n="8-1" title="setup 直後の autoload" caption="上のログを図にしたもの。setup は各オートロードパスの直下だけを調べ、サブディレクトリの中身は親の名前空間が作られたときに調べる。">
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
          <Figure n="8-2" title="Admin::Report を参照したときの流れ" caption="模式図。Admin のためのファイル（admin.rb）が無いので、Admin はディレクトリから作られたモジュールになる。">
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
              <Ref n={8} />。業務のアプリケーションの Ruby が 3.2 未満なら Zeitwerk は 2.6 系になり、明示的な名前空間の検出には TracePoint が使われます。規則と結果は同じです。
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
            <code>middleware</code> を加えると <code>All is good!</code> になりました。CI でこのタスクを実行すると、本番の起動時に初めて気付く事態を防げます。
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
            でファイルが変わったかを調べます。変わっていれば、初期化処理 <code>set_clear_dependencies_hook</code> が登録した次のコールバックが実行されます。
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
            <code>remove_const</code> で取り除き、読み込んだファイルを <code>$LOADED_FEATURES</code> から消します。こうしておくと、次に定数が参照されたときに{' '}
            <code>require</code> がファイルをもう一度実行します（<code>loader.rb</code> の 166〜252 行目）
            <Ref n={10} />。
          </p>
          <Figure n="8-3" title="開発環境での再読み込み" caption="Rails 8.1.4.1 の ActionDispatch::Reloader・ActiveSupport::Reloader・Finisher の set_clear_dependencies_hook を読んでまとめた図。">
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
                    クラスではなく <code>"User"</code> のように名前の文字列を渡し、使う時点で <code>constantize</code> する
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
            <code>complete!</code> を呼ぶのは、内側の <code>call</code> から戻ったときではありません。サーバーが <code>rack.response_finished</code>（応答を送り終えた後に呼ぶ処理を登録するための env の値。Rack 3 で追加）を提供していれば応答の送信が終わった後、そうでなければ body の <code>close</code> のときです。body をストリーミングで書き出している間も、データベース接続などが使える状態を保つためです
            <Ref n={12} />。
          </p>
          <Figure n="8-4" title="Executor の run と complete" caption="Rails 8.1.4.1 で ActiveSupport・ActiveRecord の Railtie が登録しているコールバックの主なもの。">
            <ExecutorFigure />
          </Figure>
          <p>Rails 8.1.4.1 で登録されている主なコールバックは次のとおりです。</p>
          <ul>
            <li>
              ActiveSupport：run で実行コンテキストを用意し、complete で <code>ActiveSupport::CurrentAttributes.clear_all</code> を呼ぶ（<code>active_support/railtie.rb</code>）。
            </li>
            <li>ActiveRecord のクエリキャッシュ：run で有効にし、complete で無効にして中身を消す（<code>active_record/query_cache.rb</code>）。</li>
            <li>
              ActiveRecord の接続プール：complete で、トランザクションの途中でなければ接続をプールに返す（<code>connection_pool.rb</code>）
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
  ],
}

export default withExplanations(ch08, explanation08)
