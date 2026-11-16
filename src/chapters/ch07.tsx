import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation07 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 7-1 起動から要求の受け付けまで ---------- */
function BootTimelineFigure() {
  return (
    <Svg
      id="7-1"
      w={780}
      h={240}
      label="bin/rails server を実行すると、起動時に1回だけ、config/boot.rb で Bundler を準備し（0.12 秒、読み込み済みのファイル228個）、config/application.rb で gem を読み込み（0.36 秒、1282個）、initialize! で設定と初期化処理を実行する（0.43 秒、1447個）。その後 Puma が要求を待ち、要求が届くたびに Rails を呼ぶ。この部分は要求ごとに繰り返す"
    >
      <T x={20} y={20} fs={12} tone="muted">
        起動時に1回だけ
      </T>
      <line x1={20} y1={32} x2={470} y2={32} stroke="var(--fig-line)" />
      <T x={500} y={20} fs={12} tone="muted">
        要求ごとに繰り返す
      </T>
      <line x1={500} y1={32} x2={760} y2={32} stroke="var(--fig-line)" />
      <Box x={20} y={56} w={140} h={74} lines={['config/boot.rb', 'Bundler の準備', '0.12 秒・228 個']} fs={11} mono subTone="muted" />
      <Arrow x1={160} y1={93} x2={172} y2={93} />
      <Box x={174} y={56} w={156} h={74} lines={['config/application.rb', 'gem の読み込み', '0.36 秒・1282 個']} fs={11} mono subTone="muted" />
      <Arrow x1={330} y1={93} x2={342} y2={93} />
      <Box x={344} y={56} w={126} h={74} lines={['initialize!', '設定と初期化処理', '0.43 秒・1447 個']} fs={11} mono fill="box5" subTone="muted" />
      <Arrow x1={470} y1={93} x2={498} y2={93} />
      <Box x={500} y={66} w={110} h={54} lines={['Puma が', '要求を待つ']} fs={12} />
      {['要求1 → Rails', '要求2 → Rails', '…'].map((t, i) => (
        <g key={t}>
          <Box x={650} y={44 + i * 36} w={110} h={28} lines={t} fs={11.5} fill={i < 2 ? 'box4' : 'bg'} />
          <Arrow x1={610} y1={93} x2={648} y2={58 + i * 36} />
        </g>
      ))}
      <T x={20} y={170} fs={11.5} tone="muted">
        秒と個数は、起動を始めてからの経過時間と、読み込み済みのファイルの数（boot_steps07.rb の実測。開発環境）
      </T>
      <T x={20} y={194} fs={11.5} tone="muted">
        config/environments と config/initializers のファイルは initialize! の中で読み込まれる
      </T>
      <T x={20} y={218} fs={11.5} tone="muted">
        要求のたびに Gemfile の読み込みや初期化をやり直すことはない
      </T>
    </Svg>
  )
}

/* ---------- 図 7-2 Gemfile から require まで ---------- */
function BundlerFigure() {
  const steps = [
    { y: 14, lines: ['Gemfile', 'gem "rails"・gem "puma" など 16 個'], fill: 'box4' as const },
    { y: 104, lines: ['Gemfile.lock', 'rack (3.2.8) など 90 個の gem とバージョン'], fill: 'box4' as const },
    { y: 194, lines: ['$LOAD_PATH（読み込みパス）', '…/gems/rack-3.2.8/lib など 113 個'], fill: 'box' as const },
    { y: 284, lines: ['…/rack-3.2.8/lib/rack.rb を実行', '2回目の require は false を返す'], fill: 'box5' as const },
  ]
  const labels = ['bundle install（依存する gem を含めてバージョンを決める）', 'bundler/setup・bundle exec', 'require "rack"']
  return (
    <Svg
      id="7-2"
      w={780}
      h={346}
      label="Gemfile にはアプリケーションが使う gem を書く。bundle install が依存する gem も含めてバージョンを決め、Gemfile.lock に書く。デモでは90個。bundler/setup または bundle exec は、Gemfile.lock の gem の lib ディレクトリを $LOAD_PATH に加える。require rack は $LOAD_PATH から rack.rb を探して実行する。Gemfile.lock に無い gem は $LOAD_PATH に入らないので、require すると LoadError になる"
    >
      {steps.map((s, i) => (
        <g key={s.lines[0]}>
          <Box x={20} y={s.y} w={360} h={50} lines={s.lines} fs={12} mono={i < 3} fill={s.fill} subTone="muted" />
          {i < labels.length && (
            <>
              <Arrow x1={200} y1={s.y + 50} x2={200} y2={s.y + 88} />
              <T x={212} y={s.y + 70} fs={11.5} mono={i === 2}>
                {labels[i]}
              </T>
            </>
          )}
        </g>
      ))}
      <T x={420} y={210} fs={11.5}>
        Gemfile.lock に無い gem（csv など）の
      </T>
      <T x={420} y={230} fs={11.5}>
        ディレクトリは入らない
      </T>
      <T x={420} y={250} fs={11.5} tone="danger">
        → require すると LoadError
      </T>
      <T x={420} y={120} fs={11.5} tone="muted">
        どのコンピューターでも同じバージョンの
      </T>
      <T x={420} y={140} fs={11.5} tone="muted">
        gem が使われる
      </T>
      <T x={420} y={300} fs={11.5} tone="muted">
        Rails では config/application.rb の
      </T>
      <T x={420} y={320} fs={11.5} tone="muted">
        Bundler.require が Gemfile の gem を require する
      </T>
    </Svg>
  )
}

/* ---------- 図 7-3 環境ごとに使われる設定ファイル ---------- */
function EnvFilesFigure() {
  const envs = [
    { name: 'development', file: 'development.rb', values: ['enable_reloading: true', 'eager_load: false'] },
    { name: 'test', file: 'test.rb', values: ['enable_reloading: false', 'eager_load: false'] },
    { name: 'production', file: 'production.rb', values: ['enable_reloading: false', 'eager_load: true'] },
  ]
  const cx = (i: number) => 150 + i * 210
  return (
    <Svg
      id="7-3"
      w={780}
      h={316}
      label="config/application.rb と config/initializers のファイルは、development、test、production のどの環境でも読み込まれる。config/environments の中では、RAILS_ENV などで選んだ環境の名前のファイルだけが読み込まれ、application.rb の設定より優先される。デモでは、development は enable_reloading が true で eager_load が false、test はどちらも false、production は enable_reloading が false で eager_load が true"
    >
      {envs.map((e, i) => (
        <T key={e.name} x={cx(i) + 100} y={20} fs={13} bold anchor="middle" mono>
          {e.name}
        </T>
      ))}
      <T x={130} y={64} fs={11.5} anchor="end" tone="muted">
        全環境で共通
      </T>
      <Box x={150} y={44} w={620} h={40} lines="config/application.rb" mono fs={12} />
      <T x={130} y={122} fs={11.5} anchor="end" tone="muted">
        環境ごとに1つ
      </T>
      {envs.map((e, i) => (
        <Box key={e.file} x={cx(i)} y={100} w={200} h={44} lines={['config/environments/', e.file]} mono fs={11.5} fill="box5" />
      ))}
      <T x={130} y={180} fs={11.5} anchor="end" tone="muted">
        全環境で共通
      </T>
      <Box x={150} y={160} w={620} h={40} lines="config/initializers/*.rb（起動時に1回実行）" mono fs={12} />
      <T x={130} y={236} fs={11.5} anchor="end" tone="muted">
        デモの値
      </T>
      {envs.map((e, i) => (
        <Box key={e.name + 'v'} x={cx(i)} y={216} w={200} h={44} lines={e.values} mono fs={11} fill="bg" />
      ))}
      <T x={20} y={282} fs={11} tone="muted">
        環境は RAILS_ENV や -e で選ぶ（bin/rails server の既定は development）
      </T>
      <T x={20} y={302} fs={11} tone="muted">
        環境別のファイルの値は、application.rb の値より優先される
      </T>
    </Svg>
  )
}

/* ---------- 図 7-4 起動時のファイルの読み込み順 ---------- */
function BootFilesFigure() {
  const steps: { file: string; what: string; fill?: 'box' | 'box4' | 'box5' }[] = [
    { file: 'config.ru', what: 'Puma が Rack::Builder で評価する', fill: 'box4' },
    { file: 'config/environment.rb', what: 'require_relative "application"' },
    { file: 'config/application.rb', what: 'require_relative "boot"' },
    { file: 'config/boot.rb', what: 'bundler/setup・bootsnap/setup で読み込みパスを準備' },
    { file: 'config/application.rb', what: '各フレームワークの Railtie を require（rails new の既定は rails/all）' },
    { file: 'config/application.rb', what: 'Bundler.require で Gemfile の gem を require' },
    { file: 'config/application.rb', what: 'class Application < Rails::Application（設定を記録）' },
    { file: 'config/environment.rb', what: 'Rails.application.initialize!（初期化処理を順に実行）', fill: 'box5' },
    { file: 'config.ru', what: 'run Rails.application（Rack アプリとして登録）', fill: 'box4' },
  ]
  const top = 44
  const rowH = 30
  const gap = 8
  return (
    <Svg
      id="7-4"
      w={760}
      h={top + steps.length * (rowH + gap) + 20}
      label="Puma が config.ru を評価すると、config/environment.rb、config/application.rb、config/boot.rb の順に require される。boot.rb で Bundler と Bootsnap を準備した後、application.rb に戻り、各フレームワークの Railtie を require し、Bundler.require で gem を読み込み、Application クラスを定義する。environment.rb に戻って Rails.application.initialize! を実行し、最後に config.ru の run で Rails.application を Rack アプリとして登録する。bin/rails server の場合は、先に config/boot.rb と config/application.rb を読み込んでから config.ru を評価する"
    >
      <T x={20} y={18} fs={12} tone="muted">
        順
      </T>
      <T x={56} y={18} fs={12} tone="muted">
        実行中のファイル
      </T>
      <T x={290} y={18} fs={12} tone="muted">
        行われること
      </T>
      {steps.map((s, i) => {
        const y = top + i * (rowH + gap)
        return (
          <g key={i}>
            <T x={28} y={y + rowH / 2} anchor="middle" fs={12.5} bold>
              {String(i + 1)}
            </T>
            <Box x={50} y={y} w={220} h={rowH} lines={s.file} mono fs={12} fill={s.fill ?? 'box'} align="start" />
            <T x={290} y={y + rowH / 2} fs={12.5}>
              {s.what}
            </T>
            {i < steps.length - 1 && <Arrow x1={160} y1={y + rowH} x2={160} y2={y + rowH + gap - 1} />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 7-5 Railtie・Engine・Application ---------- */
function RailtieFigure() {
  return (
    <Svg
      id="7-5"
      w={760}
      h={330}
      label="Rails::Railtie を Rails::Engine が継承し、Rails::Engine を Rails::Application が継承する。アプリケーションの Demo::Application は Rails::Application を継承する。Railtie を直接継承するものとして ActiveRecord::Railtie、ActionController::Railtie、ActiveJob::Railtie などがある。Engine を継承するものとして ActiveStorage::Engine、ActionCable::Engine、ActionView::Railtie がある。それぞれのクラスはインスタンスを1つだけ持ち、すべてのインスタンスの config は同じ設定の保存場所を共有する"
    >
      <Box x={290} y={14} w={180} h={36} lines="Rails::Railtie" mono bold />
      <Box x={290} y={104} w={180} h={36} lines="Rails::Engine" mono bold />
      <Box x={290} y={194} w={180} h={36} lines="Rails::Application" mono bold />
      <Box x={290} y={276} w={180} h={36} lines="Demo::Application" mono fill="box5" />
      <Arrow x1={380} y1={102} x2={380} y2={52} />
      <Arrow x1={380} y1={192} x2={380} y2={142} />
      <Arrow x1={380} y1={274} x2={380} y2={232} />

      <Box x={20} y={64} w={220} h={118} fill="bg" />
      <T x={32} y={82} fs={12} tone="muted">
        Railtie を直接継承
      </T>
      <T x={32} y={104} mono fs={12}>
        ActiveRecord::Railtie
      </T>
      <T x={32} y={124} mono fs={12}>
        ActionController::Railtie
      </T>
      <T x={32} y={144} mono fs={12}>
        ActiveJob::Railtie
      </T>
      <T x={32} y={166} fs={12} tone="muted">
        ほか I18n、ActiveSupport など
      </T>
      <Arrow d="M240,80 C262,70 270,48 288,36" />

      <Box x={520} y={150} w={220} h={100} fill="bg" />
      <T x={532} y={168} fs={12} tone="muted">
        Engine を継承
      </T>
      <T x={532} y={190} mono fs={12}>
        ActiveStorage::Engine
      </T>
      <T x={532} y={210} mono fs={12}>
        ActionCable::Engine
      </T>
      <T x={532} y={230} mono fs={12}>
        ActionView::Railtie
      </T>
      <Arrow d="M520,170 C500,150 490,130 472,124" />

      <T x={520} y={34} fs={12}>
        各クラスのインスタンスは1つ（instance）
      </T>
      <T x={520} y={56} fs={12}>
        config の値は全インスタンスで共有
      </T>
      <T x={520} y={78} fs={12} tone="muted">
        矢印は継承（子 → 親）
      </T>
    </Svg>
  )
}

/* ---------- 図 7-6 initialize! で実行される初期化処理 ---------- */
function InitTimelineFigure() {
  const phases: { from: number; to: number; title: string; items: string[]; fill: 'box' | 'box2' | 'box4' | 'box5' }[] = [
    { from: 0, to: 13, title: '環境別の設定', items: ['deprecator の登録', 'load_environment_config', '→ config/environments/'], fill: 'box4' },
    { from: 14, to: 41, title: 'Bootstrap', items: ['ロガー、キャッシュ', '読み込みパスの設定', 'bootstrap_hook'], fill: 'box' },
    { from: 42, to: 169, title: '各 Railtie・Engine', items: ['active_record.* など', 'load_config_initializers', '→ config/initializers/'], fill: 'box2' },
    { from: 170, to: 183, title: 'Finisher', items: ['ミドルウェアの組み立て', 'eager_load!', 'finisher_hook'], fill: 'box5' },
  ]
  const x0 = 20
  const total = 184
  const width = 760
  const sx = (n: number) => x0 + (n / total) * width
  const bw = 184
  return (
    <Svg
      id="7-6"
      w={800}
      h={260}
      label="デモのアプリケーションでは initialize! が184個の初期化処理を実行した。0番から13番は環境別の設定で、load_environment_config が config/environments の設定ファイルを読み込む。14番から41番は Bootstrap で、ロガーやキャッシュ、読み込みパスを設定し、bootstrap_hook で終わる。42番から169番は各 Railtie と Engine の初期化処理で、136番目にアプリケーションの load_config_initializers が config/initializers のファイルを読み込む。170番から183番は Finisher で、ミドルウェアの組み立て、eager_load!、after_initialize を実行する finisher_hook などがある"
    >
      <line x1={x0} y1={40} x2={x0 + width} y2={40} stroke="var(--fig-line)" strokeWidth={1.5} />
      {[0, 14, 42, 136, 170, 184].map((n) => (
        <g key={n}>
          <line x1={sx(n)} y1={34} x2={sx(n)} y2={46} stroke="var(--fig-line)" strokeWidth={1.5} />
          <T x={sx(n)} y={22} anchor="middle" fs={11.5} tone={n === 136 ? 'acc' : 'muted'} mono>
            {String(n)}
          </T>
        </g>
      ))}
      {phases.map((p) => (
        <rect key={p.title} x={sx(p.from)} y={52} width={sx(p.to + 1) - sx(p.from)} height={16} fill={`var(--fig-${p.fill})`} stroke="var(--fig-line)" />
      ))}
      <Arrow x1={sx(136)} y1={88} x2={sx(136)} y2={70} accent />
      {phases.map((p, i) => {
        const bx = 20 + i * (bw + 8)
        return (
          <g key={p.title}>
            <Box x={bx} y={110} w={bw} h={136} fill={p.fill} lines={[]} />
            <T x={bx + 12} y={128} bold fs={12.5}>
              {p.title}
            </T>
            <T x={bx + 12} y={148} fs={11} tone="muted" mono>
              {`${p.from}〜${p.to} 番`}
            </T>
            {p.items.map((it, j) => (
              <T key={it} x={bx + 12} y={174 + j * 22} fs={11.5} mono={/^[a-z_→]/.test(it) && !it.includes('、')}>
                {it}
              </T>
            ))}
            <line x1={bx + bw / 2} y1={108} x2={(sx(p.from) + sx(p.to + 1)) / 2} y2={69} stroke="var(--fig-line)" strokeDasharray="3 3" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 7-7 on_load のブロックが実行される時点 ---------- */
function OnLoadFigure() {
  return (
    <Svg
      id="7-7"
      w={760}
      h={270}
      label="development と production で、on_load(:active_record) のブロックが実行される時点を比べた図。どちらも config/initializers の中で on_load によりブロックを登録する。development では initialize! と after_initialize が終わった後、アプリのコードが Article を初めて参照したときに ActiveRecord::Base が読み込まれ、その最後の run_load_hooks でブロックが実行される。production では initialize! の途中の eager_load! で ActiveRecord::Base が読み込まれるため、ブロックは after_initialize より前に実行される"
    >
      <T x={20} y={20} fs={12} tone="muted">
        横軸：時間の流れ
      </T>
      {[
        { y: 50, env: 'development', loadX: 650, loadLabel: 'Article を初めて参照' },
        { y: 160, env: 'production', loadX: 375, loadLabel: 'eager_load!（Finisher）' },
      ].map((r) => (
        <g key={r.env}>
          <T x={20} y={r.y + 18} bold fs={13}>
            {r.env}
          </T>
          <rect x={130} y={r.y} width={410} height={36} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
          <T x={140} y={r.y + 18} fs={12}>
            initialize!
          </T>
          <Box x={212} y={r.y + 5} w={120} h={26} lines="on_load で登録" fs={11.5} fill="box2" />
          <Box x={420} y={r.y + 5} w={114} h={26} lines="after_initialize" fs={10.5} fill="box" mono />
          <Box x={r.loadX - 70} y={r.y + 60} w={170} h={30} lines={r.loadLabel} fs={11.5} fill="box4" />
          <Arrow x1={r.loadX} y1={r.y + 58} x2={r.loadX} y2={r.y + 38} accent />
          <T x={r.loadX + 8} y={r.y - 8} fs={11.5} tone="acc">
            ブロックを実行
          </T>
          <line x1={540} y1={r.y + 18} x2={750} y2={r.y + 18} stroke="var(--fig-line)" strokeDasharray="4 4" />
          <T x={546} y={r.y + 6} fs={11} tone="muted">
            リクエスト処理など
          </T>
        </g>
      ))}
    </Svg>
  )
}

const ch07: Chapter = {
  number: 7,
  part: 2,
  title: 'Rails の起動と初期化',
  summary:
    'bin/rails server を実行してから要求を受け付けるまでの段階、gem・Bundler・require の関係、development・test・production の環境と設定ファイルの役割を実際に動かして確かめてから、config.ru から Rails.application.initialize! までにどのファイルがどの順で読み込まれ、Railtie・Engine・Application がどう組み合わさって初期化処理が並べられるかを説明します。設定ファイルが読まれる時点と、ActiveSupport.on_load を使う理由が分かります。',
  goals: [
    'bin/rails server の起動時に1回だけ行う準備と、要求ごとに行う処理を区別できる',
    'Gemfile・Gemfile.lock・bundle exec・require の関係と、環境ごとの設定ファイルの役割を説明できる',
    '起動時に config.ru・environment.rb・application.rb・boot.rb が読み込まれる順を説明できる',
    'Railtie・Engine・Application の継承関係と、それぞれが持つ役割を説明できる',
    '初期化処理（initializer）の before・after と tsort による並べ替えを理解する',
    'config/environments と config/initializers が読まれる時点と、5つの初期化イベントの順を説明できる',
    'ActiveSupport.on_load の仕組みと、初期化中にモデルの基底クラスを参照してはいけない理由を説明できる',
  ],
  prerequisites: [5, 6],
  sections: [
    {
      id: 'boot-overview',
      title: 'bin/rails server を実行したときに起きること',
      body: (
        <>
          <p>
            <code>bin/rails server</code> を実行してから、要求を受け付けられるようになるまでの間に、Rails は次の準備をします。使う gem（インストールして使う Ruby
            のライブラリ）の一覧を確かめる、gem とアプリケーションの設定のファイルを読み込む、設定に沿って各機能を準備する、の3つです。準備が終わると Puma
            が要求を待ち始め、要求が届くたびに Rails のコードを呼びます（<ChapterLink n={6} section="web-server" />
            ）。準備は起動時に1回だけ行い、要求ごとには繰り返しません。
          </p>
          <p>
            これを確かめるため、デモのアプリケーションのコピーに、1行だけ表示する初期化ファイル（起動時に実行するファイル。「環境ごとの設定」の節で扱います）を置いて起動し、curl
            で記事のページを2回要求しました。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/basics07.rb（検証用）"
            code={`
puts "[basics07] config/initializers/basics07.rb を実行しました（環境: #{Rails.env}）"
`}
          />
          <Code
            lang="text"
            title="bin/rails server の出力（Rails 8.1.4.1・Puma 8.0.2。SQL のログなどを省略）"
            code={`
=> Booting Puma
=> Rails 8.1.4.1 application starting in development
=> Run \`bin/rails server --help\` for more startup options
[basics07] config/initializers/basics07.rb を実行しました（環境: development）
Puma starting in single mode...
* Puma version: 8.0.2 ("Into the Arena")
* Ruby version: ruby 4.0.9 (2026-10-23 revision 3e93b23afc) +PRISM [x86_64-linux]
*  Min threads: 3
*  Max threads: 3
*  Environment: development
*          PID: 1
* Listening on http://0.0.0.0:3000
Use Ctrl-C to stop
Started GET "/articles/1" for 172.29.0.1 at 2026-11-16 07:13:26 +0000
Processing by ArticlesController#show as */*
  Parameters: {"id" => "1"}
Completed 200 OK in 93ms (Views: 28.8ms | ActiveRecord: 13.2ms (2 queries, 0 cached) | GC: 0.0ms)


Started GET "/articles/2" for 172.29.0.1 at 2026-11-16 07:13:26 +0000
Processing by ArticlesController#show as */*
  Parameters: {"id" => "2"}
Completed 200 OK in 9ms (Views: 4.4ms | ActiveRecord: 1.5ms (2 queries, 0 cached) | GC: 0.0ms)
`}
          />
          <p>
            <code>[basics07]</code> の行は、Puma が <code>Listening on</code> を表示して要求を受け付け始める前に1回だけ出ています。その後の2件の要求（<code>Started GET</code>{' '}
            から <code>Completed</code> まで）では出ていません。初期化ファイルは起動時に実行され、要求のたびには実行されないことが分かります。
          </p>
          <p>
            起動の準備にかかる時間を段階ごとに測りました。<code>bin/rails server</code> が行う準備のうち、Rails の部分だけを順に実行するスクリプトです。<code>$LOADED_FEATURES</code>{' '}
            は、<code>require</code> で読み込んだファイルの一覧を入れた配列で、その要素の数で読み込んだファイルの数が分かります
            <Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            title="boot_steps07.rb（デモのアプリケーションのディレクトリに置いて ruby boot_steps07.rb で実行）"
            code={`
# 起動の段階ごとに、経過時間・読み込み済みのファイルの数・段階の名前を表示する
def now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
STARTED = now
def report(label)
  printf("%5.2f 秒  %4d 個  %s\\n", now - STARTED, $LOADED_FEATURES.size, label)
end

report("開始")
require_relative "config/boot"
report("config/boot.rb（Bundler の準備）")
require_relative "config/application"
report("config/application.rb（gem の読み込み）")
Rails.application.initialize!
report("initialize!（初期化）")
`}
          />
          <Code
            lang="text"
            title="実行結果（開発環境。時間は実行のたびに変わる）"
            code={`
 0.00 秒    56 個  開始
 0.12 秒   228 個  config/boot.rb（Bundler の準備）
 0.36 秒  1282 個  config/application.rb（gem の読み込み）
 0.43 秒  1447 個  initialize!（初期化）
`}
          />
          <p>
            config/boot.rb では、Bundler という gem が、使う gem の一覧を確かめて読み込みの準備をします。config/application.rb では、Rails 本体と Gemfile に書いた gem
            のファイルを読み込みます。読み込んだファイルが約1000個増えた、いちばん大きな段階です。<code>Rails.application.initialize!</code>{' '}
            は読み込んだ機能を設定に沿って準備するメソッドで、環境ごとの設定ファイルや初期化ファイルもここで読み込まれます（図 7-1）。<code>bin/rails server</code>{' '}
            はこの3つの段階の後に Puma を起動して要求を待ちます。次の節では、最初の2つの段階に関わる gem と Bundler を見ます。
          </p>
          <Figure n="7-1" title="起動から要求の受け付けまで" caption="上の2つの実行結果をもとにした図。秒と個数は開発環境での実測値。">
            <BootTimelineFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'gems',
      title: 'gem と Bundler と require',
      body: (
        <>
          <p>
            gem は Ruby のライブラリを名前とバージョンを付けて配布する形式です。gem のプログラムは gem のディレクトリの中の lib ディレクトリに置かれます
            <Ref n={15} />。デモの環境では、Rack の 3.2.8 は <code>/work/gems/gems/rack-3.2.8</code> にインストールされています。
          </p>
          <p>
            Ruby のプログラムからライブラリを使うには <code>require</code> を呼びます。<code>require "rack"</code> は読み込みパス（<code>$LOAD_PATH</code>
            という配列に入ったディレクトリの一覧）から rack.rb を探して実行し、<code>true</code> を返します。同じファイルが読み込み済みなら、もう一度は実行せずに <code>false</code>{' '}
            を返します
            <Ref n={14} />。次のスクリプトを、そのままの <code>ruby</code> と、Bundler の <code>bundle exec</code> を付けた場合とで実行しました。
          </p>
          <Code
            lang="ruby"
            title="require07.rb"
            code={`
puts "rack を含む読み込みパス: #{$LOAD_PATH.grep(/rack-\\d/).inspect}"
p defined?(Rack)
p require("rack")
p require("rack")
p defined?(Rack)
puts $LOADED_FEATURES.grep(%r{/rack\\.rb\\z})
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9・Bundler 4.0.20）"
            code={`
$ ruby require07.rb
rack を含む読み込みパス: []
nil
true
false
"constant"
/work/gems/gems/rack-3.2.8/lib/rack.rb

$ bundle exec ruby require07.rb
rack を含む読み込みパス: ["/work/gems/gems/rack-3.2.8/lib"]
nil
true
false
"constant"
/work/gems/gems/rack-3.2.8/lib/rack.rb
`}
          />
          <p>
            どちらも、1回目の <code>require</code> が <code>true</code>、2回目が <code>false</code> を返し、読み込んだ後は <code>Rack</code> という定数（クラスやモジュールの名前）が使えるようになりました。違いは読み込む前の <code>$LOAD_PATH</code> です。<code>ruby</code> だけで実行したときは rack の lib ディレクトリが入っておらず、<code>require</code> の時点で RubyGems（Ruby に付属する gem
            の管理の仕組み）がインストール済みの gem から rack を探して加えました。<code>bundle exec</code> を付けると、実行を始める前から入っていました。
          </p>
          <p>
            <code>bundle exec</code> が加えるディレクトリは、Gemfile と Gemfile.lock で決まります。Gemfile はアプリケーションが使う gem を書くファイルで、デモでは16個の gem を書いています。
          </p>
          <Code
            lang="ruby"
            title="Gemfile（デモ。先頭の一部）"
            code={`
source "https://rubygems.org"

gem "rails", "~> 8.1.4", ">= 8.1.4.1"
gem "propshaft"
gem "sqlite3", ">= 2.1"
gem "mysql2"
gem "puma", ">= 5.0"
`}
          />
          <p>
            <code>bundle install</code> を実行すると、Bundler は Gemfile の gem と、それらが依存する gem のバージョンを決めて、Gemfile.lock に書き込みます。<code>~&gt; 8.1.4</code>{' '}
            のような書き方は、使ってよいバージョンの範囲の指定です。
          </p>
          <Code
            lang="text"
            title="Gemfile.lock（デモ。一部を抜き出し）"
            code={`
GEM
  remote: https://rubygems.org/
  specs:
    …
    puma (8.0.2)
      nio4r (~> 2.0)
    racc (1.8.1)
    rack (3.2.8)
    …
    rails (8.1.4.1)
      actioncable (= 8.1.4.1)
      actionmailbox (= 8.1.4.1)
      …
      railties (= 8.1.4.1)
`}
          />
          <p>
            字下げが1段の行が gem とそのバージョン、2段の行はその gem が依存する gem です。puma 8.0.2 は nio4r を、rails 8.1.4.1 は同じバージョンの actionpack などを必要とします。Gemfile
            には16個しか書いていませんが、<code>bundle list</code> で数えると、依存する gem を含めて90個でした。<code>bundle exec</code> と、それと同じ準備をする{' '}
            <code>require "bundler/setup"</code> は、この90個の gem の、Gemfile.lock に書かれたバージョンのディレクトリを <code>$LOAD_PATH</code> に加えます
            <Ref n={16} />
            <Ref n={17} />。デモで <code>$LOAD_PATH</code> の要素を数えると、<code>ruby</code> だけでは8個、<code>bundle exec</code> では113個でした。
          </p>
          <p>Gemfile.lock に無い gem は、インストールされていても使えません。Ruby 4.0 に付属する csv で確かめました。</p>
          <Code
            lang="text"
            title="Gemfile.lock に無い gem を require する（エラーの表示は一部を省略）"
            code={`
$ ruby -e 'require "csv"; puts CSV::VERSION'
3.3.5
$ bundle exec ruby -e 'require "csv"; puts CSV::VERSION'
-e:1: warning: csv used to be loaded from the standard library, but is not part of the default gems since Ruby 3.4.0.
You can add csv to your Gemfile or gemspec to fix this error.
/usr/local/lib/ruby/4.0.0/bundled_gems.rb:60:in 'Kernel.require': cannot load such file -- csv (LoadError)
`}
          />
          <p>
            このように Bundler は、使える gem を Gemfile.lock に書かれた gem とバージョンに限ります（図 7-2）。Gemfile.lock を Git などで共有しておけば、開発者の手元でも本番のサーバーでも同じバージョンの gem が使われます。Rails
            では、config/boot.rb の <code>require "bundler/setup"</code> がこの準備をし、config/application.rb の <code>Bundler.require(*Rails.groups)</code> が Gemfile の gem
            をまとめて <code>require</code> します
            <Ref n={16} />。そのため、アプリケーションのコードに <code>require "sidekiq"</code> のように書かなくても、Gemfile に書いた gem のクラスを使えます。どのファイルがどの順に読み込まれるかは「起動時に読み込まれるファイル」の節で見ます。
          </p>
          <Figure n="7-2" title="Gemfile から require まで" caption="デモのアプリケーション（Bundler 4.0.20）での数をもとにした図。">
            <BundlerFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'environments',
      title: '環境ごとの設定',
      body: (
        <>
          <p>
            Rails は1つのアプリケーションを、目的に合わせて3つの環境で動かします。開発者が手元でコードを書きながら動かす development、自動テストを実行するときの test、利用者に使ってもらう本番の
            production です
            <Ref n={7} />。今の環境は <code>Rails.env</code> で分かります。環境は環境変数（プログラムの外から渡す設定の値）の RAILS_ENV か、コマンドの <code>-e</code>{' '}
            で選び、<code>bin/rails server</code> の既定は development です
            <Ref n={18} />。
          </p>
          <p>
            環境によって何が変わるかを確かめるため、設定の値を表示するスクリプトを、<code>bin/rails runner</code>（アプリケーションを読み込んでから Ruby のコードを実行するコマンド）で3つの環境で実行しました。
          </p>
          <Code
            lang="ruby"
            title="env_values07.rb"
            code={`
c = Rails.application.config
puts "Rails.env                   = #{Rails.env}"
puts "enable_reloading            = #{c.enable_reloading}"
puts "eager_load                  = #{c.eager_load}"
puts "consider_all_requests_local = #{c.consider_all_requests_local}"
puts "log_level                   = #{c.log_level}"
puts "force_ssl                   = #{c.force_ssl.inspect}"
`}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>設定</th>
                  <th>development</th>
                  <th>test</th>
                  <th>production</th>
                  <th>意味</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>enable_reloading</code>
                  </td>
                  <td>true</td>
                  <td>false</td>
                  <td>false</td>
                  <td>コードを変えたら、次の要求から反映する（<ChapterLink n={8} />）</td>
                </tr>
                <tr>
                  <td>
                    <code>eager_load</code>
                  </td>
                  <td>false</td>
                  <td>false</td>
                  <td>true</td>
                  <td>起動時にアプリケーションのクラスをまとめて読み込む（<ChapterLink n={8} />）</td>
                </tr>
                <tr>
                  <td>
                    <code>consider_all_requests_local</code>
                  </td>
                  <td>true</td>
                  <td>true</td>
                  <td>false</td>
                  <td>例外が起きたとき、詳しい内容をエラーの画面に出す</td>
                </tr>
                <tr>
                  <td>
                    <code>log_level</code>
                  </td>
                  <td>debug</td>
                  <td>debug</td>
                  <td>info</td>
                  <td>ログに出す内容の細かさ。debug は SQL なども出す</td>
                </tr>
                <tr>
                  <td>
                    <code>force_ssl</code>
                  </td>
                  <td>false</td>
                  <td>false</td>
                  <td>true</td>
                  <td>HTTP の要求を HTTPS（暗号化した HTTP）へ移動させる（<ChapterLink n={6} section="rails-stack" />）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            開発中はコードを書き換えてすぐに試せるように、本番では速く安全に動くように、値が分けられています。これらの値は次の3か所で決めます
            <Ref n={7} />。
          </p>
          <ul>
            <li>
              <code>config/application.rb</code>：すべての環境に共通の設定。
            </li>
            <li>
              <code>config/environments/development.rb</code>・<code>test.rb</code>・<code>production.rb</code>：その環境だけの設定。選んだ環境の名前のファイルだけが読み込まれ、application.rb
              と同じ設定を書いた場合はこちらが優先されます。
            </li>
            <li>
              <code>config/initializers/*.rb</code>：起動時に1回実行する初期化ファイル。すべての環境で実行されます。gem ごとの設定などをファイルに分けて置きます。
            </li>
          </ul>
          <p>rails new が作る production.rb の先頭は次のとおりです。コメントにも、application.rb の設定より優先されることが書かれています。</p>
          <Code
            lang="ruby"
            title="config/environments/production.rb（デモ。先頭の一部）"
            code={`
Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot for better performance and memory savings (ignored by Rake tasks).
  config.eager_load = true

  # Full error reports are disabled.
  config.consider_all_requests_local = false
`}
          />
          <p>
            「bin/rails server を実行したときに起きること」の節の basics07.rb は、test と production で runner を実行したときにも <code>[basics07] … （環境: test）</code>、
            <code>（環境: production）</code> と表示され、どの環境でも実行されることを確かめられました（図 7-3）。
          </p>
          <Figure n="7-3" title="環境ごとに使われる設定ファイル" caption="デモのアプリケーション（Rails 8.1.4.1）での値。test の eager_load は、環境変数 CI があると true になる。">
            <EnvFilesFigure />
          </Figure>
          <p>
            ここまでで、起動の3つの段階と、そこで読み込まれる設定ファイルの役割を見ました。本番環境では <code>bin/rails server</code> を使わずに Puma を直接起動することもあります。次の節からは、起動したときにどのファイルがどの順に読み込まれ、初期化の処理がどう並べられるかを、Rails のソースコードとともに追います。
          </p>
        </>
      ),
    },
    {
      id: 'boot-files',
      title: '起動時に読み込まれるファイル',
      body: (
        <>
          <p>
            本番環境で <code>bundle exec puma -C config/puma.rb</code> のように Puma を直接起動すると、Puma は設定ファイルを読んだ後に <code>config.ru</code> を評価（Ruby のコードとして実行）します（<ChapterLink n={6} />
            ）。そこから Rails のファイルが図 7-4 の順に読み込まれます。
          </p>
          <Figure n="7-4" title="起動時のファイルの読み込み順" caption="Rails 8.1.4.1 の rails new が生成するファイルに沿った順。1と9は Puma が評価する config.ru の中、8が初期化処理の本体。">
            <BootFilesFigure />
          </Figure>
          <p>生成されるファイルの中身は次のとおりです（コメントを除く）。</p>
          <Code
            lang="ruby"
            title="config/environment.rb"
            code={`
require_relative "application"

Rails.application.initialize!
`}
          />
          <Code
            lang="ruby"
            title="config/boot.rb"
            code={`
ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
`}
          />
          <Code
            lang="ruby"
            title="config/application.rb（デモ）"
            code={`
require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module Demo
  class Application < Rails::Application
    config.load_defaults 8.1
    config.autoload_lib(ignore: %w[assets tasks middleware])
    config.generators.system_tests = nil
  end
end
`}
          />
          <p>
            <code>bundler/setup</code> は Gemfile.lock に書かれたバージョンの gem だけが <code>require</code> できるように読み込みパス（<code>$LOAD_PATH</code>）を設定し、<code>bootsnap/setup</code>{' '}
            はファイルの検索結果やコンパイル結果をキャッシュ（一度求めた結果を保存して、次から使い回すこと）して起動を速くします。rails new の既定の application.rb には <code>require "rails/all"</code> と書かれ、ActiveRecord・ActiveStorage・ActionController・ActionView・ActionMailer・ActiveJob・ActionCable
            などの Railtie や Engine を定義するファイルを順に <code>require</code> します
            <Ref n={2} />。デモのアプリケーションは ActionMailbox・ActionText・Minitest を外して作ったので（<ChapterLink n={1} section="versions" />
            ）、使うフレームワークのファイルを1つずつ <code>require</code> しています。<code>Bundler.require(*Rails.groups)</code> は、Gemfile のうち default グループと現在の環境のグループの gem を <code>require</code> します。sidekiq のような gem
            が自分の Railtie を定義するのはこの時点です。
          </p>
          <p>
            <code>bin/rails server</code> で起動した場合は、まず <code>bin/rails</code> が <code>config/boot.rb</code> を読み込み、サーバーのコマンドが Rackup::Server（rackup gem の、Rack アプリケーションを Web サーバーで起動するクラス）のサブクラスである{' '}
            <code>Rails::Server</code> を作り、<code>config/application.rb</code> を <code>require</code> してからサーバーを起動します。サーバーが <code>config.ru</code>{' '}
            を評価した後の流れは図 7-4 の2番以降と同じです
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'railtie',
      title: 'Railtie・Engine・Application',
      body: (
        <>
          <p>
            <Term>Railtie</Term> は、gem やフレームワークが Rails の初期化に処理を追加するためのクラスです。Railtie のサブクラスは、初期化処理（initializer）、設定（config）、rake タスク（<code>bin/rails db:migrate</code> のようにコマンドで実行する処理）、ジェネレーター（<code>bin/rails generate</code> でファイルを作る機能）、コンソールやサーバーの起動時に実行するブロックを登録できます。
            <Term>Engine</Term> は Railtie のサブクラスで、app/ や config/routes.rb などのディレクトリ構成を持つ部品です。アプリケーション本体の Rails::Application も Engine
            のサブクラスです。
          </p>
          <Figure n="7-5" title="Railtie・Engine・Application のクラス階層" caption="デモのアプリケーション（rails/all のうち ActionMailbox・ActionText などを除いたものと propshaft を読み込む構成）で読み込まれた Railtie の一部。ActionView::Railtie は名前に反して Engine のサブクラスである。">
            <RailtieFigure />
          </Figure>
          <p>Railtie のクラスメソッドのうち、インスタンスの作り方と並び順に関わる部分を引用します。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/railtie.rb（182〜200行目）"
            href={`${GH}/railties/lib/rails/railtie.rb#L182-L200`}
            code={`
      def instance
        @instance ||= new
      end

      # Allows you to configure the railtie. This is the same method seen in
      # Railtie::Configurable, but this module is no longer required for all
      # subclasses of Railtie so we provide the class method here.
      def configure(&block)
        instance.configure(&block)
      end

      def <=>(other) # :nodoc:
        load_index <=> other.load_index
      end

      def inherited(subclass)
        subclass.increment_load_index
        super
      end
`}
          />
          <p>
            Railtie の <code>new</code> は private で、各クラスのインスタンスは <code>instance</code> で作られる1つだけです。<code>inherited</code> フック（<ChapterLink n={3} />
            ）でサブクラスが定義された順に番号を振り、<code>{'<=>'}</code> でその番号を比べます
            <Ref n={3} />。<code>Rails::Railtie.subclasses</code> はこの順に並ぶので、Railtie の並び順は「Railtie を定義するファイルが <code>require</code>{' '}
            された順」になります。デモのアプリケーションでは、<code>Rails.application.railties</code> は I18n::Railtie、ActiveSupport::Railtie、ActionDispatch::Railtie、ActiveModel::Railtie、GlobalID::Railtie、ActiveJob::Railtie、ActionController::Railtie、ActiveRecord::Railtie、ActionMailer::Railtie、Propshaft::Railtie、ActionView::Railtie、ActiveStorage::Engine、ActionCable::Engine
            の順でした。
          </p>
          <p>
            各 Railtie の <code>config</code> は Railtie::Configuration のインスタンスで、メソッドが定義されていない名前の代入と参照を <code>method_missing</code>（<ChapterLink n={2} />
            ）で受け取ります。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/railtie/configuration.rb（99〜111行目）"
            href={`${GH}/railties/lib/rails/railtie/configuration.rb#L99-L111`}
            code={`
      def method_missing(name, *args, &blk)
        if name.end_with?("=")
          key = name[0..-2].to_sym
          if actual_method?(key)
            raise NoMethodError.new("Cannot assign to \`#{key}\`, it is a configuration method")
          end
          @@options[key] = args.first
        elsif @@options.key?(name)
          @@options[name]
        else
          super
        end
      end
`}
          />
          <p>
            値の保存先 <code>@@options</code> はクラス変数（<code>@@</code> で始まり、そのクラスとサブクラスで共有される変数）なので、すべての Railtie とアプリケーションの config が同じハッシュを共有します
            <Ref n={4} />。ActiveRecord::Railtie はクラス本体で <code>config.active_record = ActiveSupport::OrderedOptions.new</code> を実行しており（OrderedOptions は、ハッシュのように値を入れ、<code>.xxx</code> の形のメソッドで読み書きできるオブジェクト）、アプリケーションの{' '}
            <code>config.active_record.xxx = ...</code> はこのオブジェクトに値を書き込みます。
          </p>
        </>
      ),
    },
    {
      id: 'app-class',
      title: 'アプリケーションクラスの定義と load_defaults',
      body: (
        <>
          <p>
            <code>class Application {'<'} Rails::Application</code> を実行した時点で、Rails::Application の <code>inherited</code> が呼ばれます。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application.rb（69〜76行目）"
            href={`${GH}/railties/lib/rails/application.rb#L69-L76`}
            code={`
      def inherited(base)
        super
        Rails.app_class = base
        # lib has to be added to $LOAD_PATH unconditionally, even if it's in the
        # autoload paths and config.add_autoload_paths_to_load_path is false.
        add_lib_to_load_path!(find_root(base.called_from))
        ActiveSupport.run_load_hooks(:before_configuration, base)
      end
`}
          />
          <p>
            定義されたクラスを <code>Rails.app_class</code> に記録し、アプリケーションの lib/ を <code>$LOAD_PATH</code> に加え、<code>before_configuration</code>{' '}
            のフック（決まった時点で呼ばれるように登録しておく処理）を実行します。この後でクラス本体が評価されます
            <Ref n={5} />。<code>Rails.application</code> は <code>app_class.instance</code> を返すメソッドで、ここでアプリケーションのインスタンスが1つ作られます（<code>railties/lib/rails.rb</code>{' '}
            の 44〜46 行目）。
          </p>
          <p>
            クラス本体の <code>config.load_defaults 8.1</code> は、Rails の各バージョンで変わった設定の既定値をまとめて設定するメソッドです。バージョンごとの <code>when</code> 節が1つ前のバージョンの{' '}
            <code>load_defaults</code> を呼ぶので、8.1 を指定すると 5.0 から 8.1 までの既定値が古い順に適用されます。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/configuration.rb（343〜367行目）"
            href={`${GH}/railties/lib/rails/application/configuration.rb#L343-L367`}
            code={`
        when "8.1"
          load_defaults "8.0"

          # Development and test environments tend to reload code and
          # redefine methods (e.g. mocking), hence YJIT isn't generally
          # faster in these environments.
          self.yjit = !Rails.env.local?

          if respond_to?(:action_controller)
            action_controller.escape_json_responses = false
            action_controller.action_on_path_relative_redirect = :raise
          end

          if respond_to?(:active_record)
            active_record.raise_on_missing_required_finder_order_columns = true
          end

          if respond_to?(:active_support)
            active_support.escape_js_separators_in_json = false
          end

          if respond_to?(:action_view)
            action_view.render_tracker = :ruby
            action_view.remove_hidden_field_autocomplete = true
          end
`}
          />
          <p>
            <code>load_defaults</code> は config に値を書くだけで、フレームワークのクラスには触れません。<code>respond_to?(:active_record)</code> は、ActiveRecord::Railtie が読み込まれて{' '}
            <code>config.active_record</code> が定義されているかを確かめています
            <Ref n={6} />。書いた値が実際のクラスに反映されるのは、後で説明する初期化処理と on_load のときです。
          </p>
          <Callout kind="note">
            <p>
              業務のアプリケーションの <code>load_defaults</code> の値が Rails 本体のバージョンより古いことがあります。その場合は、新しいバージョンで変わった既定値が適用されていません。Rails ガイドの設定の章には、バージョンごとに{' '}
              <code>load_defaults</code> で変わる値の一覧があります
              <Ref n={7} />。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'initializers',
      title: '初期化処理の登録と並べ替え',
      body: (
        <>
          <p>
            <code>Rails.application.initialize!</code> は、登録された<Term en="initializer">初期化処理</Term>を順に実行するメソッドです。初期化処理は、Railtie のクラス本体で{' '}
            <code>initializer "名前" do ... end</code> と書いて登録します。登録するメソッドは次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/initializable.rb（130〜136行目）"
            href={`${GH}/railties/lib/rails/initializable.rb#L130-L136`}
            code={`
      def initializer(name, opts = {}, &blk)
        raise ArgumentError, "A block must be passed when defining an initializer" unless blk
        opts[:after] ||= initializers.last&.name unless initializers.has?(opts[:before])
        initializers << Initializer.new(
          name, nil, before: opts[:before], after: opts[:after], group: opts[:group], &blk
        )
      end
`}
          />
          <p>
            各初期化処理は名前、ブロック、<code>before</code>・<code>after</code> を持ちます。<code>after</code> を指定しなければ、同じクラスで直前に登録した初期化処理の名前が入ります。つまり、1つのクラスの中では書いた順に実行され、別のクラスの初期化処理との前後関係は{' '}
            <code>before:</code>・<code>after:</code> で指定します
            <Ref n={8} />。
          </p>
          <p>アプリケーションが実行する初期化処理の一覧は、次のように3つをつないだものです。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application.rb（436〜447行目）"
            href={`${GH}/railties/lib/rails/application.rb#L436-L447`}
            code={`
    def initialize!(group = :default) # :nodoc:
      raise "Application has been already initialized." if @initialized
      run_initializers(group, self)
      @initialized = true
      self
    end

    def initializers # :nodoc:
      Bootstrap.initializers_for(self) +
      railties_initializers(super) +
      Finisher.initializers_for(self)
    end
`}
          />
          <p>
            Bootstrap は最初に行う準備（ロガー、キャッシュ、オートローダーなど）、<code>railties_initializers</code> は各 Railtie と Engine、アプリケーション自身の初期化処理、Finisher
            は最後にまとめて行う処理です
            <Ref n={5} />。この一覧を <code>run_initializers</code> が並べ替えて実行します。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/initializable.rb（100〜106行目）"
            href={`${GH}/railties/lib/rails/initializable.rb#L100-L106`}
            code={`
    def run_initializers(group = :default, *args)
      return if instance_variable_defined?(:@ran)
      initializers.tsort_each do |initializer|
        initializer.run(*args) if initializer.belongs_to?(group)
      end
      @ran = true
    end
`}
          />
          <p>
            <code>tsort_each</code> は Ruby の tsort ライブラリ（<Term en="topological sort">トポロジカルソート</Term>）のメソッドです。「この初期化処理より先に実行すべきもの」を先に出しながら、一覧を前から順にたどります。Rails
            8.1 の Collection は、<code>before</code>・<code>after</code> を名前で引けるハッシュに登録しており、依存先を名前で解決します（同じファイルの 63〜79 行目）。そのため、複数の Engine
            に同じ名前の初期化処理（<code>set_load_path</code> など）があると、それらは続けて実行されます。<code>initializer.run</code> はブロックを Railtie のインスタンスの上で{' '}
            <code>instance_exec</code> します（<ChapterLink n={4} />）。
          </p>
          <p>デモのアプリケーションで、実行順に並べた初期化処理を数えると184個でした。主なものの位置は次のとおりです。</p>
          <Code
            lang="ruby"
            code={`
list = Rails.application.initializers.tsort_each.to_a
list.size # => 184
# 番号と、名前・初期化処理を持つクラス（一部）
#  10–13  load_environment_config      各 Engine とアプリケーション
#  14     load_environment_hook        Bootstrap の先頭
#  41     bootstrap_hook               Bootstrap の最後
# 136     load_config_initializers     Demo::Application
# 173     build_middleware_stack       Finisher
# 177     eager_load!                  Finisher
# 178     finisher_hook                Finisher
`}
          />
          <Figure n="7-6" title="initialize! で実行される初期化処理" caption="デモのアプリケーション（Rails 8.1.4.1）で tsort_each の順に並べた184個を、4つの区間に分けた図。区間の名前は本書によるもの。番号は読み込む gem によって変わる。">
            <InitTimelineFigure />
          </Figure>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 の Collection は Array のサブクラスで、依存先を毎回 <code>select</code> で探していました
              <Ref n={9} />。並べ替えの規則は同じです。Bootstrap には、8.1 で追加された <code>initialize_event_reporter</code> がありません。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'config-files',
      title: '設定ファイルが読まれる時点',
      body: (
        <>
          <p>
            アプリケーションの設定ファイルは、それぞれ決まった初期化処理の中で読み込まれます。<code>config/environments/production.rb</code> などは Engine の <code>load_environment_config</code>{' '}
            で、<code>config/initializers/*.rb</code> は <code>load_config_initializers</code> で読み込まれます。
          </p>
          <Code
            lang="ruby"
            title="railties/lib/rails/engine.rb（564〜568行目、643〜647行目）"
            href={`${GH}/railties/lib/rails/engine.rb#L564-L568`}
            code={`
    initializer :load_environment_config, before: :load_environment_hook, group: :all do
      paths["config/environments"].existent.each do |environment|
        require environment
      end
    end

    initializer :load_config_initializers do
      config.paths["config/initializers"].existent.sort.each do |initializer|
        load_config_initializer(initializer)
      end
    end
`}
          />
          <p>
            <code>load_environment_config</code> は <code>before: :load_environment_hook</code> を指定しているので、Bootstrap より前に実行されます。ロガーやキャッシュの設定を環境別ファイルに書けるのはこのためです。
            <code>config/initializers</code> のファイルは、パスを <code>sort</code> した順（ファイル名の辞書順）に <code>load</code>（require と違い、呼ぶたびにファイルを実行するメソッド）されます
            <Ref n={10} />。Rails ガイドは、初期化ファイルの間に依存がある場合は1つのファイルにまとめることを勧めています
            <Ref n={7} />。
          </p>
          <p>
            Rails には、初期化の途中に処理を差し込むための5つのイベントがあります
            <Ref n={7} />。デモのアプリケーションでの位置と合わせて表にまとめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>イベント</th>
                  <th>実行される時点</th>
                  <th>位置（番号）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>before_configuration</code>
                  </td>
                  <td>Application クラスを定義した直後、クラス本体の評価より前</td>
                  <td>initialize! より前</td>
                </tr>
                <tr>
                  <td>
                    <code>before_initialize</code>
                  </td>
                  <td>Bootstrap の最後の bootstrap_hook</td>
                  <td>41</td>
                </tr>
                <tr>
                  <td>
                    <code>to_prepare</code>
                  </td>
                  <td>全 Railtie の初期化処理とミドルウェアの組み立ての後。開発環境ではコードを再読み込みするたびにも実行</td>
                  <td>176（run_prepare_callbacks）</td>
                </tr>
                <tr>
                  <td>
                    <code>before_eager_load</code>
                  </td>
                  <td>一括読み込みの直前（eager_load が有効な場合のみ）</td>
                  <td>177（eager_load!）</td>
                </tr>
                <tr>
                  <td>
                    <code>after_initialize</code>
                  </td>
                  <td>Finisher の finisher_hook（この後にルートの準備などの5つが続く）</td>
                  <td>178</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>config.after_initialize do ... end</code> に書いた処理は、config/initializers のファイルがすべて読み込まれ、production では一括読み込みも終わった後に実行されます。
          </p>
        </>
      ),
    },
    {
      id: 'on-load',
      title: 'ActiveSupport.on_load',
      body: (
        <>
          <p>
            <code>ActiveSupport.on_load(:active_record) {'{ ... }'}</code> は、「ActiveRecord::Base の読み込みが終わったらこのブロックを実行する」という予約です。実装は ActiveSupport::LazyLoadHooks
            にあります。
          </p>
          <Code
            lang="ruby"
            title="activesupport/lib/active_support/lazy_load_hooks.rb（60〜80行目）"
            href={`${GH}/activesupport/lib/active_support/lazy_load_hooks.rb#L60-L80`}
            code={`
    def on_load(name, options = {}, &block)
      @loaded[name].each do |base|
        execute_hook(name, base, options, block)
      end

      @load_hooks[name] << [block, options]
    end

    # Executes all blocks registered to +name+ via on_load, using +base+ as the
    # evaluation context.
    #
    #   ActiveSupport.run_load_hooks(:active_record, ActiveRecord::Base)
    #
    # In the case of the above example, it will execute all hooks registered
    # for +:active_record+ within the class +ActiveRecord::Base+.
    def run_load_hooks(name, base = Object)
      @loaded[name] << base
      @load_hooks[name].each do |hook, options|
        execute_hook(name, base, options, hook)
      end
    end
`}
          />
          <p>
            <code>on_load</code> はブロックを名前ごとの配列に保存し、すでにその名前の読み込みが終わっていればすぐに実行します。<code>run_load_hooks</code> は、保存されたブロックを{' '}
            <code>base</code> の上で <code>class_eval</code> して実行します（同じファイルの 91〜103 行目）
            <Ref n={11} />。ActiveRecord::Base を定義するファイルの最後の行は <code>ActiveSupport.run_load_hooks(:active_record, Base)</code> です（<code>active_record/base.rb</code> の 336
            行目）。ActionController::Base にも同じ形の <code>:action_controller</code> フックがあります。
          </p>
          <p>
            Rails のフレームワーク自身も、設定の反映にこの仕組みを使っています。ActiveRecord::Railtie の <code>active_record.set_configs</code> は、<code>config.active_record</code>{' '}
            の各値を <code>on_load(:active_record)</code> のブロックの中で ActiveRecord::Base の setter に渡します
            <Ref n={12} />。実行される時点を確かめるため、デモのアプリケーションに次の初期化ファイルを置き、<code>config/environment.rb</code> を読み込んでから <code>Article.first</code>{' '}
            を実行するスクリプトを動かしました。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/zz_onload.rb（検証用）"
            code={`
loaded = -> { $LOADED_FEATURES.any? { |f| f.end_with?("active_record/base.rb") } }
puts "[initializer] AR::Base loaded? #{loaded.call}"
ActiveSupport.on_load(:active_record) { puts "[on_load] self=#{self}" }
Rails.application.config.after_initialize { puts "[after_initialize] AR::Base loaded? #{loaded.call}" }
`}
          />
          <Code
            lang="text"
            code={`
== development
[initializer] AR::Base loaded? false
[after_initialize] AR::Base loaded? false
[script] initialize! finished
[on_load] self=ActiveRecord::Base
[script] after Article.first
== production
[initializer] AR::Base loaded? false
[on_load] self=ActiveRecord::Base
[after_initialize] AR::Base loaded? true
[script] initialize! finished
[script] after Article.first
`}
          />
          <Figure n="7-7" title="on_load のブロックが実行される時点" caption="上の実行結果を図にしたもの。development では最初にモデルを参照したとき、production では初期化中の一括読み込みのときに ActiveRecord::Base が読み込まれる。">
            <OnLoadFigure />
          </Figure>
          <p>
            development では、初期化が終わっても ActiveRecord::Base は読み込まれておらず、<code>Article</code> を初めて参照したときにブロックが実行されました。production では、Finisher の{' '}
            <code>eager_load!</code> がアプリケーションのモデルを読み込む過程で ActiveRecord::Base も読み込まれ、after_initialize より前にブロックが実行されました。
          </p>
          <p>
            初期化ファイルの中で ActiveRecord::Base を直接参照すると、その時点で ActiveRecord::Base が読み込まれ、<code>:active_record</code>{' '}
            のフックがその場で実行されます。すると、それより後に読み込まれる初期化ファイルで <code>config.active_record</code> に書いた値は、フックの実行に間に合いません。次の2つの初期化ファイルで確かめました。
          </p>
          <Code
            lang="ruby"
            code={`
# config/initializers/zz1_touch.rb
ActiveRecord::Base.logger            # ActiveRecord::Base を参照する

# config/initializers/zz2_conf.rb（辞書順で zz1 の後に読み込まれる）
Rails.application.config.active_record.table_name_prefix = "app_"

# 起動後の ActiveRecord::Base.table_name_prefix
#   zz1_touch.rb あり => ""
#   zz1_touch.rb なし => "app_"
`}
          />
          <p>
            Rails ガイドは、クラスに直接設定したい場合は初期化ファイルの中で on_load を使い、初期化が終わる前にクラスをオートロードしないように求めています<Ref n={7} />。理由は対象によって違います。ActiveRecord::Base のようなフレームワークのクラスは、早く読み込むと上の実験のように後の設定が反映されず、起動も遅くなります。ApplicationRecord や ApplicationController
            のようなアプリケーションのクラスは再読み込みの対象で、初期化中に参照すると再読み込みと両立しません（<ChapterLink n={8} section="reload" />
            ）。業務のアプリケーションで gem の設定ファイルがフレームワークのクラスを直接参照していたら、<code>on_load</code> で囲めるかを確認します。
          </p>
        </>
      ),
    },
    {
      id: 'finisher',
      title: 'Finisher と一括読み込み',
      body: (
        <>
          <p>Finisher の初期化処理のうち、一括読み込みと after_initialize の部分を引用します。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/finisher.rb（76〜94行目）"
            href={`${GH}/railties/lib/rails/application/finisher.rb#L76-L94`}
            code={`
      initializer :eager_load! do |app|
        if config.eager_load
          ActiveSupport.run_load_hooks(:before_eager_load, self)
          Zeitwerk::Loader.eager_load_all
          Rails.eager_load!
          config.eager_load_namespaces.each(&:eager_load!)

          if config.reloading_enabled?
            app.reloader.after_class_unload do
              Rails.autoloaders.main.eager_load
            end
          end
        end
      end

      # All initialization is done, including eager loading in production
      initializer :finisher_hook do
        ActiveSupport.run_load_hooks(:after_initialize, self)
      end
`}
          />
          <p>
            <code>config.eager_load</code> が true（production の既定）のとき、<code>Zeitwerk::Loader.eager_load_all</code> が app/ 以下などのファイルをすべて読み込みます
            <Ref n={13} />。リクエストを受ける前に全部のクラスを読み込んでおくことには、次の利点があります。
          </p>
          <ul>
            <li>リクエストの処理中にファイルを読み込まないので、複数のスレッドが同時に同じ定数を読み込む状況が起きない。</li>
            <li>ファイル名と定数名の食い違いなどの誤りが、起動時に例外として見つかる（<ChapterLink n={8} />）。</li>
            <li>Puma のクラスタモードで親プロセスが読み込んでから fork（実行中のプロセスを複製して子プロセスを作ること）すると、読み込んだコードのメモリーを子プロセスと共有できる（<ChapterLink n={23} />）。</li>
          </ul>
          <p>
            Finisher には、このほかに <code>build_middleware_stack</code>（<ChapterLink n={6} />）、ルートを読み込む準備をする <code>set_routes_reloader_hook</code>（<ChapterLink n={9} />
            ）、開発環境の再読み込みに関わる <code>set_clear_dependencies_hook</code>（<ChapterLink n={8} />）などがあります。最後の <code>enable_yjit</code> は、<code>config.yjit</code>{' '}
            が true なら YJIT（実行中の Ruby のコードを機械語に変換して速くする、Ruby に組み込まれた仕組み）を有効にします。load_defaults 8.1 では、development と test 以外の環境（<code>Rails.env.local?</code> が false の環境）で true になります。
          </p>
          <p>
            <code>initialize!</code> が終わると <code>config/environment.rb</code> の実行が終わり、<code>config.ru</code> に戻って <code>run Rails.application</code> が実行されます。続く{' '}
            <code>Rails.application.load_server</code> は、Railtie が <code>server do ... end</code> で登録した、サーバーとして起動するときだけ必要な処理を実行します。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>bin/rails server は、Bundler の準備、gem の読み込み、initialize! の3つの段階を起動時に1回だけ行い、その後は要求のたびに Rails のコードを呼びます。</li>
          <li>require は $LOAD_PATH からファイルを探して1回だけ実行します。Bundler は Gemfile.lock に書かれたバージョンの gem だけを $LOAD_PATH に加え、Bundler.require が Gemfile の gem をまとめて require します。</li>
          <li>環境は development・test・production の3つで、config/application.rb が共通の設定、config/environments の環境名のファイルがその環境だけの設定、config/initializers が起動時に1回実行する初期化ファイルです。</li>
          <li>Puma が評価する config.ru から、environment.rb → application.rb → boot.rb の順に読み込まれ、environment.rb の initialize! で初期化が行われます。</li>
          <li>Rails::Railtie を Engine が、Engine を Application が継承します。各 Railtie のインスタンスは1つで、config の値はクラス変数で共有されます。</li>
          <li>load_defaults はクラス本体の評価中に config へ既定値を書くだけで、実際のクラスへの反映は初期化処理と on_load で行われます。</li>
          <li>初期化処理は Bootstrap・各 Railtie・Finisher の順につながれ、before・after と tsort で並べ替えられて実行されます。</li>
          <li>config/environments は Bootstrap より前に、config/initializers は各 Railtie の初期化処理の中で辞書順に、after_initialize は Finisher の終わり近く（finisher_hook）で実行されます。</li>
          <li>on_load は、クラスの読み込みが終わったときに実行するブロックを予約します。初期化中に ActiveRecord::Base などを直接参照すると、後の設定が反映されなくなります。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Rails Initialization Process', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/initialization.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'bin/rails から Rails::Server（Rackup::Server のサブクラス）が起動するまでの流れ、config/boot.rb の役割。' },
    { title: 'railties/lib/rails/all.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/all.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'rails/all が require する Railtie・Engine の一覧。' },
    { title: 'railties/lib/rails/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/railtie.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Railtie の instance、inherited による並び順、subclasses。' },
    { title: 'railties/lib/rails/railtie/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/railtie/configuration.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'config の値をクラス変数 @@options に保存する method_missing。' },
    { title: 'railties/lib/rails/application.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Application の inherited、initialize!、initializers（Bootstrap・railties・Finisher）。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'load_defaults のバージョンごとの分岐。' },
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/configuring.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'バージョンごとの既定値、初期化ファイルの読み込み順と依存の扱い、5つの初期化イベント、初期化中にクラスをオートロードせず lazy load hook を使うこと。' },
    { title: 'railties/lib/rails/initializable.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/initializable.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'initializer の登録、after の既定値、Collection と tsort による並べ替え、run_initializers。' },
    { title: 'railties/lib/rails/initializable.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/railties/lib/rails/initializable.rb', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '7.2 の Collection が Array のサブクラスで、依存先を select で探す実装（8.1.4.1 との差分で確認）。' },
    { title: 'railties/lib/rails/engine.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/engine.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'load_environment_config と load_config_initializers。' },
    { title: 'activesupport/lib/active_support/lazy_load_hooks.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/lazy_load_hooks.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'on_load と run_load_hooks の実装。' },
    { title: 'activerecord/lib/active_record/railtie.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railtie.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'config.active_record の値を on_load で ActiveRecord::Base に渡す active_record.set_configs。' },
    { title: 'railties/lib/rails/application/finisher.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/finisher.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'eager_load! と finisher_hook。' },
    { title: 'module Kernel（require・require_relative）', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Kernel.html', accessed: '2026-11-16', version: 'Ruby 4.0', note: 'require が $LOAD_PATH からファイルを探して読み込み、読み込み済みなら false を返すこと。読み込んだファイルの絶対パスが $LOADED_FEATURES に加わること。実行例は Ruby 4.0.9 で実測。' },
    { title: 'What is a gem?', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/what-is-a-gem/', accessed: '2026-11-16', note: 'gem が名前・バージョン・プラットフォームを持ち、lib ディレクトリにコードを置くこと。' },
    { title: 'How to use Bundler with Ruby（Bundler.setup・Bundler.require）', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/bundler_setup/', accessed: '2026-11-16', version: 'Bundler 4.0', note: 'bundler/setup が Gemfile の gem を require できるように読み込みパスを設定すること。Bundler.require がグループを指定して gem を require すること。' },
    { title: 'bundle exec', publisher: 'RubyGems Guides（Bundler コマンドリファレンス）', url: 'https://guides.rubygems.org/command-reference/bundle-exec/', accessed: '2026-11-16', version: 'Bundler 4.0', note: 'Gemfile に書いた gem を require できる状態でコマンドを実行すること。実行例は Bundler 4.0.20 で実測。' },
    { title: 'The Rails Command Line', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/command_line.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'bin/rails server の環境を -e で変えられ、既定は development であること。bin/rails runner。' },
  ],
}

export default withExplanations(ch07, explanation07)
