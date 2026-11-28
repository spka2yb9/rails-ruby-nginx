import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation07 } from '../explanations/request'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 13-1 起動から要求の受け付けまで ---------- */
function BootTimelineFigure() {
  return (
    <Svg
      id="13-1"
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

/* ---------- 図 13-2 Gemfile から require まで ---------- */
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
      id="13-2"
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

/* ---------- 図 13-3 環境ごとに使われる設定ファイル ---------- */
function EnvFilesFigure() {
  const envs = [
    { name: 'development', file: 'development.rb', values: ['enable_reloading: true', 'eager_load: false'] },
    { name: 'test', file: 'test.rb', values: ['enable_reloading: false', 'eager_load: false'] },
    { name: 'production', file: 'production.rb', values: ['enable_reloading: false', 'eager_load: true'] },
  ]
  const cx = (i: number) => 150 + i * 210
  return (
    <Svg
      id="13-3"
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

/* ---------- 図 13-4 起動時のファイルの読み込み順 ---------- */
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
      id="13-4"
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

/* ---------- 図 13-5 Railtie・Engine・Application ---------- */
function RailtieFigure() {
  return (
    <Svg
      id="13-5"
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

/* ---------- 図 13-6 initialize! で実行される初期化処理 ---------- */
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
      id="13-6"
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

/* ---------- 図 13-7 on_load のブロックが実行される時点 ---------- */
function OnLoadFigure() {
  return (
    <Svg
      id="13-7"
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

/* ---------- config.名前 の呼び出しと method_missing の分岐（番号なし） ---------- */
function ConfigMissingFigure() {
  const branches = [
    { x: 110, label: 'はい' },
    { x: 307, label: 'いいえ' },
    { x: 489, label: 'はい' },
    { x: 658, label: 'いいえ' },
  ]
  return (
    <Svg
      id="ch07-config-missing"
      w={760}
      h={414}
      label="config.名前 を呼んだとき、config にその名前のメソッドが無いと method_missing が呼ばれる。名前が = で終わる代入のとき、after_initialize のように config の実際のメソッドと同じ名前なら NoMethodError になり、それ以外は @@options に保存する。config.force_sll = true のような綴りの誤りもエラーにならずに保存される。= で終わらない参照のとき、その名前が @@options にあれば保存された値を返し、無ければ super を呼んで NoMethodError になる。@@options はクラス変数のハッシュで、すべての Railtie とアプリケーションの config で共有される"
    >
      <Box x={230} y={14} w={300} h={44} lines={['config.名前 を呼ぶ', '定義されたメソッドが無いと method_missing']} fs={12.5} subTone="muted" />
      <Arrow x1={380} y1={58} x2={380} y2={86} />
      <Box x={255} y={88} w={250} h={36} lines="名前が = で終わる？（代入）" fs={12} />
      <Arrow d="M255,106 H190 V158" />
      <T x={206} y={96} fs={11.5}>
        はい
      </T>
      <Arrow d="M505,106 H570 V158" />
      <T x={516} y={96} fs={11.5}>
        いいえ（参照）
      </T>
      <Box x={40} y={160} w={300} h={44} lines={['config のメソッドと同じ名前？', 'actual_method?(key)']} fs={12.5} subTone="muted" />
      <Box x={420} y={160} w={300} h={44} lines={['その名前が @@options にある？', '@@options.key?(name)']} fs={12.5} subTone="muted" />
      {branches.map((b) => (
        <g key={b.x}>
          <Arrow x1={b.x} y1={204} x2={b.x} y2={234} />
          <T x={b.x + 8} y={220} fs={11.5}>
            {b.label}
          </T>
        </g>
      ))}

      <Box x={20} y={236} w={180} h={88} fill="bg" lines={[]} />
      <T x={110} y={258} anchor="middle" fs={12} tone="danger" mono>
        NoMethodError
      </T>
      <T x={110} y={280} anchor="middle" fs={11.5}>
        代入させない
      </T>
      <T x={110} y={302} anchor="middle" fs={11.5} tone="muted">
        after_initialize などの名前
      </T>

      <Box x={212} y={236} w={190} h={88} fill="box5" lines={[]} />
      <T x={307} y={254} anchor="middle" fs={12} bold>
        @@options に保存
      </T>
      <T x={307} y={274} anchor="middle" fs={11.5} mono>
        config.my_gem = …
      </T>
      <T x={307} y={292} anchor="middle" fs={11.5} mono>
        config.force_sll = true
      </T>
      <T x={307} y={312} anchor="middle" fs={11.5} tone="danger">
        綴りの誤りもエラーにならない
      </T>

      <Box x={414} y={236} w={150} h={88} lines={[]} />
      <T x={489} y={268} anchor="middle" fs={12}>
        保存された値を返す
      </T>
      <T x={489} y={290} anchor="middle" fs={11.5} mono>
        config.my_gem
      </T>

      <Box x={576} y={236} w={164} h={88} fill="bg" lines={[]} />
      <T x={658} y={258} anchor="middle" fs={12} mono>
        super を呼ぶ
      </T>
      <T x={658} y={280} anchor="middle" fs={12} tone="danger" mono>
        NoMethodError
      </T>
      <T x={658} y={302} anchor="middle" fs={11.5} tone="muted">
        保存されていない名前
      </T>

      <Arrow x1={307} y1={324} x2={307} y2={354} dashed />
      <T x={315} y={340} fs={11.5} tone="muted">
        書く
      </T>
      <Arrow x1={489} y1={324} x2={489} y2={354} dashed />
      <T x={497} y={340} fs={11.5} tone="muted">
        読む
      </T>
      <Box x={212} y={356} w={352} h={44} fill="box4" lines={['@@options（クラス変数のハッシュ）', 'すべての Railtie とアプリケーションの config で共有']} fs={12.5} subTone="muted" />
    </Svg>
  )
}

/* ---------- config に書く時点と、値を読む初期化処理（番号なし） ---------- */
function ConfigTimingFigure() {
  type Row = { n: string[]; write?: boolean; lines: string[]; fill?: 'box4' | 'box5'; notes?: { text: string; tone: 'muted' | 'acc' | 'danger' }[] }
  const rows: Row[] = [
    { n: ['initialize!', 'より前'], write: true, lines: ['config/application.rb', 'クラス本体の config.…'], fill: 'box4', notes: [{ text: 'initialize! の中のすべての処理が読む', tone: 'muted' }] },
    { n: ['10〜13'], write: true, lines: ['config/environments/production.rb', '環境名のファイル'], fill: 'box4', notes: [{ text: '14 番以降のすべての処理が読む', tone: 'muted' }] },
    { n: ['14〜41'], lines: ['initialize_logger・initialize_cache', 'config.log_level・config.cache_store を読む'] },
    { n: ['42〜135'], lines: ['my_gem.setup（Engine でない Railtie）', 'config.my_gem.enabled を読む'] },
    {
      n: ['136'],
      write: true,
      lines: ['config/initializers/*.rb', 'load_config_initializers が辞書順に load'],
      fill: 'box5',
      notes: [
        { text: '136 番より前の処理は、この値を読まない', tone: 'danger' },
        { text: '137 番以降の処理は、この値を読む', tone: 'acc' },
      ],
    },
    { n: ['173'], lines: ['build_middleware_stack', 'config.middleware を読む'] },
    { n: ['178'], lines: ['finisher_hook', 'after_initialize のブロックを実行'] },
  ]
  const top = 40
  const pitch = 54
  const rowH = 42
  return (
    <Svg
      id="ch07-config-timing"
      w={760}
      h={top + rows.length * pitch + 6}
      label="デモのアプリケーションの初期化処理の番号の順に、config に値を書くファイルと、その値を読む初期化処理を上から並べた図。config/application.rb のクラス本体は initialize! より前に実行され、その値は initialize! の中のすべての処理が読む。config/environments の環境名のファイルは 10〜13 番で読み込まれ、その値は 14 番以降のすべての処理が読む。14〜41 番の Bootstrap の initialize_logger と initialize_cache は config.log_level と config.cache_store を読む。Engine でない Railtie の初期化処理である my_gem.setup は 42〜135 番に並び、config.my_gem.enabled を読む。config/initializers のファイルは 136 番の load_config_initializers で辞書順に読み込まれるので、136 番より前の処理はその値を読まない。173 番の build_middleware_stack は config.middleware を読み、178 番の finisher_hook は after_initialize のブロックを実行する。この2つは 137 番以降なので、config/initializers で書いた値を読む"
    >
      <T x={62} y={18} anchor="middle" fs={12} tone="muted">
        番号（実行順）
      </T>
      <T x={120} y={18} fs={12} tone="muted">
        config に値を書くファイル
      </T>
      <T x={430} y={18} fs={12} tone="muted">
        config の値を読む初期化処理
      </T>
      {rows.map((r, i) => {
        const y = top + i * pitch
        const cy = y + rowH / 2
        return (
          <g key={r.lines[0]}>
            {r.n.map((s, j) => (
              <T key={s} x={62} y={cy + (j - (r.n.length - 1) / 2) * 18} anchor="middle" fs={r.n.length > 1 ? 11.5 : 12.5} bold={r.n.length === 1} mono={j === 0}>
                {s}
              </T>
            ))}
            <Box x={r.write ? 120 : 430} y={y} w={r.write ? 290 : 310} h={rowH} lines={r.lines} fill={r.fill ?? 'box'} fs={12.5} mono subTone="muted" />
            {r.notes?.map((note, j) => (
              <T key={note.text} x={430} y={cy + (j - ((r.notes?.length ?? 1) - 1) / 2) * 20} fs={11.5} tone={note.tone}>
                {note.text}
              </T>
            ))}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 初期化ファイルが ActiveRecord::Base を先に参照した場合（番号なし） ---------- */
function EarlyTouchFigure() {
  return (
    <Svg
      id="ch07-early-touch"
      w={780}
      h={366}
      label="config/initializers に zz1_touch.rb がある場合と無い場合を比べた図。どちらも 136 番より前に、active_record.set_configs が on_load(:active_record) でブロックを登録している。zz1_touch.rb がある場合は、136 番の load_config_initializers の中で zz1_touch.rb が ActiveRecord::Base を参照した時点で ActiveRecord::Base が読み込まれ、set_configs のブロックがその場で実行されて table_name_prefix に空文字列を渡す。その後に zz2_conf.rb が config に app_ を書いても、ブロックは実行済みなので渡されず、起動後の table_name_prefix は空文字列のままになる。zz1_touch.rb が無い場合は、zz2_conf.rb が app_ を書いた後、config/initializers のファイルをすべて読み込んだ後で ActiveRecord::Base が読み込まれ、set_configs のブロックが app_ を渡す。起動後の table_name_prefix は app_ になる"
    >
      <T x={20} y={18} fs={12} tone="muted">
        横軸：時間の流れ
      </T>
      <T x={20} y={40} fs={11.5} tone="muted">
        どちらも、136 番より前に active_record.set_configs が on_load(:active_record) でブロックを登録している
      </T>
      <T x={345} y={64} anchor="middle" fs={11.5} tone="muted">
        load_config_initializers（136 番）
      </T>
      <T x={665} y={64} anchor="middle" fs={11.5} tone="muted">
        config/initializers の後
      </T>

      {/* zz1_touch.rb あり */}
      <T x={20} y={130} fs={12.5} bold mono>
        zz1_touch.rb
      </T>
      <T x={20} y={150} fs={12.5} bold>
        あり
      </T>
      <rect x={140} y={76} width={410} height={128} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <Box x={152} y={86} w={185} h={44} lines={['zz1_touch.rb', 'ActiveRecord::Base を参照']} fs={12.5} subTone="muted" />
      <Arrow x1={244} y1={130} x2={244} y2={150} accent />
      <T x={236} y={141} anchor="end" fs={11.5} tone="acc">
        その場で実行
      </T>
      <Box x={152} y={152} w={185} h={44} lines={['ActiveRecord::Base の読み込み', 'set_configs が "" を渡す']} fs={11.5} fill="box5" accent />
      <Arrow x1={337} y1={108} x2={351} y2={108} />
      <Box x={353} y={86} w={185} h={44} lines={['zz2_conf.rb', 'config に "app_" を書く']} fs={12.5} subTone="muted" />
      <T x={445} y={160} anchor="middle" fs={11.5} tone="danger">
        ブロックは実行済みなので
      </T>
      <T x={445} y={180} anchor="middle" fs={11.5} tone="danger">
        "app_" は渡されない
      </T>
      <Arrow x1={538} y1={108} x2={568} y2={108} />
      <Box x={570} y={86} w={190} h={44} lines={['起動後の table_name_prefix', '""（既定値のまま）']} fs={12.5} fill="bg" subTone="danger" />

      {/* zz1_touch.rb なし */}
      <T x={20} y={278} fs={12.5} bold mono>
        zz1_touch.rb
      </T>
      <T x={20} y={298} fs={12.5} bold>
        なし
      </T>
      <rect x={140} y={224} width={410} height={128} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <Box x={152} y={234} w={185} h={44} fill="none" dashed lines={[]} />
      <T x={244} y={256} anchor="middle" fs={11.5} tone="muted">
        zz1_touch.rb を置かない
      </T>
      <Box x={353} y={234} w={185} h={44} lines={['zz2_conf.rb', 'config に "app_" を書く']} fs={12.5} subTone="muted" />
      <Arrow x1={538} y1={256} x2={568} y2={256} />
      <Box x={570} y={234} w={190} h={44} lines={['ActiveRecord::Base の読み込み', 'set_configs が "app_" を渡す']} fs={11.5} fill="box5" accent />
      <Arrow x1={665} y1={278} x2={665} y2={298} />
      <Box x={570} y={300} w={190} h={44} lines={['起動後の table_name_prefix', '"app_"']} fs={12.5} fill="bg" subTone="acc" />
    </Svg>
  )
}

const ch07: Chapter = {
  number: 7,
  part: 2,
  title: 'Rails の起動と初期化',
  summary:
    'bin/rails server を実行してから、最初の記事を表示できるまでに何が準備されるのでしょうか。ファイルを読み込む順をたどり、自分の設定がいつアプリケーションに反映されるかを確かめます。',
  goals: [
    '起動時に一度だけ行う準備と、要求のたびに動く処理を区別できる',
    'Gemfile.lock と環境別の設定ファイルが、それぞれ何を決めるかを説明できる',
    'gem とアプリが登録した初期化処理の順を追い、必要なクラスが読み込まれてから設定を適用できる',
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
            は読み込んだ機能を設定に沿って準備するメソッドで、環境ごとの設定ファイルや初期化ファイルもここで読み込まれます（図 13-1）。<code>bin/rails server</code>{' '}
            はこの3つの段階の後に Puma を起動して要求を待ちます。次の節では、最初の2つの段階に関わる gem と Bundler を見ます。
          </p>
          <Figure n="13-1" title="起動から要求の受け付けまで" caption="上の2つの実行結果をもとにした図。秒と個数は開発環境での実測値。">
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
            Rails は起動時に、Gemfile.lock で選んだ gem を読み込めるようにします。デモで使う Rack 3.2.8 の場所は <code>/work/gems/gems/rack-3.2.8</code> です。Gemfile の指定と Gemfile.lock の管理は <ChapterLink n={99} /> で扱います。
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
            Bundler は Gemfile の条件を満たすバージョンを選び、Gemfile.lock に記録します。字下げを見ると、どの gem が別の gem を必要とするかが分かります。
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
            このように Bundler は、使える gem を Gemfile.lock に書かれた gem とバージョンに限ります（図 13-2）。Gemfile.lock を Git などで共有しておけば、開発者の手元でも本番のサーバーでも同じバージョンの gem が使われます。Rails
            では、config/boot.rb の <code>require "bundler/setup"</code> がこの準備をし、config/application.rb の <code>Bundler.require(*Rails.groups)</code> が Gemfile の gem
            をまとめて <code>require</code> します
            <Ref n={16} />。そのため、アプリケーションのコードに <code>require "sidekiq"</code> のように書かなくても、Gemfile に書いた gem のクラスを使えます。どのファイルがどの順に読み込まれるかは「起動時に読み込まれるファイル」の節で見ます。
          </p>
          <Figure n="13-2" title="Gemfile から require まで" caption="デモのアプリケーション（Bundler 4.0.20）での数をもとにした図。">
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
            <code>（環境: production）</code> と表示され、どの環境でも実行されることを確かめられました（図 13-3）。
          </p>
          <Figure n="13-3" title="環境ごとに使われる設定ファイル" caption="デモのアプリケーション（Rails 8.1.4.1）での値。test の eager_load は、環境変数 CI があると true になる。">
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
            このように Puma を直接起動すると、Puma は設定ファイルを読んだ後に <code>config.ru</code> を評価（Ruby のコードとして実行）します（<ChapterLink n={6} />
            ）。そこから Rails のファイルが図 13-4 の順に読み込まれます。
          </p>
          <Figure n="13-4" title="起動時のファイルの読み込み順" caption="Rails 8.1.4.1 の rails new が生成するファイルに沿った順。1と9は Puma が評価する config.ru の中、8が初期化処理の本体。">
            <BootFilesFigure />
          </Figure>
          <p>生成されるファイルの中身は次のとおりです（コメントを除く）。図 13-4 の番号と見比べながら、config.ru から順に読みます。</p>
          <Code
            lang="ruby"
            title="config.ru"
            code={`
require_relative "config/environment"

run Rails.application
Rails.application.load_server
`}
          />
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
            <code>require_relative</code> は、その行を書いたファイルの場所を起点にした相対パスでファイルを読み込むメソッドです。<code>require</code>{' '}
            と同じく、読み込み済みのファイルはもう一度実行しません
            <Ref n={14} />。config.ru の1行目が environment.rb を、environment.rb の1行目が application.rb を、application.rb の1行目が boot.rb を読み込みます。3つのファイルは1行目で次のファイルを読み込み、その読み込みが終わってから2行目に進みます。そのため、2行目以降が実行される順は boot.rb、application.rb、environment.rb、config.ru です。図 13-4 の4番から9番がこの順に当たります。
          </p>
          <p>
            boot.rb の1行目は、環境変数 BUNDLE_GEMFILE が設定されていないときに、アプリケーションの Gemfile の絶対パスを入れます（<code>||=</code> は、左辺が nil か false のときだけ代入する書き方です）。Bundler は、この環境変数に書かれたパスの Gemfile を使います。
          </p>
          <p>
            <code>bundler/setup</code> は Gemfile.lock に書かれたバージョンの gem だけが <code>require</code> できるように読み込みパス（<code>$LOAD_PATH</code>）を設定し、<code>bootsnap/setup</code>{' '}
            はファイルの検索結果やコンパイル結果をキャッシュ（一度求めた結果を保存して、次から使い回すこと）して起動を速くします。rails new の既定の application.rb には <code>require "rails/all"</code> と書かれ、ActiveRecord・ActiveStorage・ActionController・ActionView・ActionMailer・ActiveJob・ActionCable
            などの Railtie や Engine を定義するファイルを順に <code>require</code> します
            <Ref n={2} />。Railtie と Engine は、フレームワークや gem が起動時の処理と設定を Rails に登録するためのクラスで、次の節で説明します。デモのアプリケーションは Rails のフレームワークの一部を外して作ったので（<ChapterLink n={1} section="versions" />
            ）、使うフレームワークのファイルを1つずつ <code>require</code> しています。<code>Bundler.require(*Rails.groups)</code> は、Gemfile のうち default グループと現在の環境のグループの gem を <code>require</code> します。sidekiq のような gem
            が自分の Railtie を定義するのはこの時点です。
          </p>
          <p>
            グループは Gemfile の中で gem をどの環境で使うかを分ける書き方です。<code>Rails.groups</code> は、development で起動したときは{' '}
            <code>[:default, "development"]</code> を返します（<code>railties/lib/rails.rb</code> の 113〜122 行目）。次の Gemfile では、puma はどの環境でも <code>require</code> され、debug は development と test
            でだけ <code>require</code> されます。<code>require: false</code> を付けた gem は、どの環境でも <code>Bundler.require</code> の対象になりません。
          </p>
          <Code
            lang="ruby"
            title="Gemfile のグループの例（説明用）"
            code={`
gem "puma", ">= 5.0"            # group の指定が無い gem は default グループ

group :development, :test do
  gem "debug"                   # development と test でだけ require される
end

gem "rubocop", require: false   # Bundler.require では require されない
`}
          />
          <p>
            手元では動くコードが、本番で <code>NameError: uninitialized constant</code> になることがあります。そのときは、使っている gem が Gemfile の <code>group :development</code>{' '}
            の中に入っていないか、<code>require: false</code> が付いていないかを確かめます。production で起動すると <code>Rails.groups</code> に development が入らないので、その gem は <code>require</code>{' '}
            されず、gem のクラスの定数が定義されません。
          </p>
          <p>
            application.rb の <code>class Application</code> の中の3行は設定です。<code>load_defaults</code> は「アプリケーションクラスの定義と load_defaults」の節で扱います。<code>autoload_lib</code>{' '}
            は lib ディレクトリのクラスを自動で読み込む対象に加える設定です（<ChapterLink n={8} />）。<code>config.generators.system_tests = nil</code> は、<code>bin/rails generate</code>{' '}
            がシステムテストのファイルを作らないようにします。
          </p>
          <p>
            <code>bin/rails server</code> で起動した場合は、まず <code>bin/rails</code> が <code>config/boot.rb</code> を読み込み、サーバーのコマンドが Rackup::Server（rackup gem の、Rack アプリケーションを Web サーバーで起動するクラス）のサブクラスである{' '}
            <code>Rails::Server</code> を作り、<code>config/application.rb</code> を <code>require</code> してからサーバーを起動します。サーバーが <code>config.ru</code>{' '}
            を評価した後の流れは図 13-4 の2番以降と同じです
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
          <p>Railtie という名前を知らなくても、次の所ですでに Railtie を使っています。</p>
          <ul>
            <li>
              config/application.rb の <code>require "rails/all"</code>（デモでは <code>require "active_record/railtie"</code> などの8行）は、各フレームワークの Railtie や Engine を定義するファイルを読み込みます。
            </li>
            <li>
              config/application.rb や config/environments のファイルに書く <code>config.active_record.…</code> や <code>config.action_mailer.…</code> は、それぞれのフレームワークの Railtie が用意した設定です。
            </li>
            <li>
              Gemfile に gem を足すだけで、その gem の設定や rake タスクが使えるようになるのは、gem が Railtie を定義していて、<code>Bundler.require</code> のときにそのファイルが読み込まれるためです。
            </li>
            <li>
              config/application.rb の <code>class Application {'<'} Rails::Application</code> は、アプリケーション自身を Engine の一種として定義しています。アプリケーションの app/ や config/routes.rb は、Engine
              から継承した仕組みで読み込まれます。
            </li>
          </ul>
          <p>
            gem が Railtie を定義するコードは、次のような形です。クラス本体に書いた <code>config.…</code> の行はファイルを <code>require</code> した時点で実行され、<code>initializer</code> と{' '}
            <code>rake_tasks</code> に渡したブロックは、登録だけされて後で実行されます。
          </p>
          <Code
            lang="ruby"
            title="gem が定義する Railtie の例（説明用。my_gem という架空の gem）"
            code={`
module MyGem
  class Railtie < Rails::Railtie
    # config.my_gem.enabled の形で読み書きできる設定を用意する
    config.my_gem = ActiveSupport::OrderedOptions.new
    config.my_gem.enabled = true

    # 起動時に実行する処理を、名前を付けて登録する（初期化処理）
    initializer "my_gem.setup" do |app|
      MyGem.enabled = app.config.my_gem.enabled
    end

    # bin/rails のタスクを登録する
    rake_tasks do
      load "my_gem/tasks.rake"
    end
  end
end
`}
          />
          <p>
            アプリケーションの側では、config/application.rb か config/environments のファイルに <code>config.my_gem.enabled = false</code> と書くと、この gem の設定を変えられます。gem
            の初期化メソッドをアプリケーションのコードから呼ぶ行は要りません。config/initializers のファイルに書いた場合にこの例で反映されない理由は、「設定ファイルが読まれる時点」の節で説明します。Engine の例として、Rails ガイドは認証の機能を提供する Devise を挙げています。Engine は gem の中に app/controllers や app/views
            を持てるので、gem の中のコントローラーやビューを、アプリケーションのものと同じように使えます。
          </p>
          <Figure n="13-5" title="Railtie・Engine・Application のクラス階層" caption="デモのアプリケーション（rails/all のうち ActionMailbox・ActionText などを除いたものと propshaft を読み込む構成）で読み込まれた Railtie の一部。ActionView::Railtie は名前に反して Engine のサブクラスである。">
            <RailtieFigure />
          </Figure>
          <p>
            Railtie のクラスメソッドのうち、インスタンスの作り方と並び順に関わる部分を引用します。確かめるのは、Railtie がいくつも読み込まれたときに、どの順に並ぶかです。この並び順は、後の節で見る初期化処理の実行順に関わります。
          </p>
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
          <ul>
            <li>
              引用した4つのメソッドは <code>class {'<<'} self</code> の中に書かれたクラスメソッドです（<ChapterLink n={3} section="class-methods" />）。<code>ActiveRecord::Railtie.instance</code>{' '}
              のように、クラスに対して呼びます。
            </li>
            <li>
              <code>@instance ||= new</code> は、<code>@instance</code> が nil なら <code>new</code> でインスタンスを作って入れ、2回目からは入っているものを返します。
            </li>
            <li>
              <code>configure</code> は、インスタンスの側の <code>configure</code>（同じファイルの 254〜256 行目）にブロックを渡します。インスタンスの側は、ブロックを自分の上で{' '}
              <code>instance_eval</code> します（<ChapterLink n={4} section="self-switch" />）。config/environments/production.rb の <code>Rails.application.configure do ... end</code>{' '}
              の中で <code>config</code> と書くとアプリケーションの config を指すのは、ブロックの中の self がアプリケーションのインスタンスになるためです。
            </li>
            <li>
              <code>inherited(subclass)</code> は、<code>class Railtie {'<'} Rails::Railtie</code> のようにサブクラスが定義されたときに Ruby が呼ぶメソッドです。<code>increment_load_index</code>
              （同じファイルの 205〜208 行目）は、すべての Railtie で共有するカウンターを1増やし、その値をサブクラスの <code>@load_index</code> に入れます。
            </li>
            <li>
              <code>{'<=>'}</code> は、並べ替えのときに2つの要素のどちらが前かを決めるメソッドです。<code>load_index</code> の小さいほう、つまり先に定義された Railtie が前になります。
            </li>
          </ul>
          <p>
            Railtie の <code>new</code> は private で、各クラスのインスタンスは <code>instance</code> で作られる1つだけです。<code>inherited</code> フック（<ChapterLink n={3} />
            ）でサブクラスが定義された順に番号を振り、<code>{'<=>'}</code> でその番号を比べます
            <Ref n={3} />。<code>Rails::Railtie.subclasses</code> はこの順に並ぶので、Railtie の並び順は「Railtie を定義するファイルが <code>require</code>{' '}
            された順」になります。デモのアプリケーションでは、<code>Rails.application.railties</code> は I18n::Railtie、ActiveSupport::Railtie、ActionDispatch::Railtie、ActiveModel::Railtie、GlobalID::Railtie、ActiveJob::Railtie、ActionController::Railtie、ActiveRecord::Railtie、ActionMailer::Railtie、Propshaft::Railtie、ActionView::Railtie、ActiveStorage::Engine、ActionCable::Engine
            の順でした。
          </p>
          <p>
            各 Railtie の <code>config</code> は Railtie::Configuration のインスタンスで、メソッドが定義されていない名前の代入と参照を <code>method_missing</code>（<ChapterLink n={2} />
            ）で受け取ります。次の引用で、<code>config.my_gem = ...</code> のように、Rails が知らない名前に代入したときに何が起きるかを確かめます。
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
          <ul>
            <li>
              Ruby では、<code>config.my_gem = 値</code> は <code>my_gem=</code> という名前のメソッドの呼び出しです。config にこの名前のメソッドは無いので、<code>method_missing</code> が{' '}
              <code>name</code> に <code>:my_gem=</code>、<code>args</code> に値の配列を受け取ります。
            </li>
            <li>
              <code>name.end_with?("=")</code> が真なら代入です。<code>name[0..-2]</code> で末尾の <code>=</code> を除いた <code>:my_gem</code> をキーにして、<code>@@options</code>{' '}
              というハッシュに値を保存します。
            </li>
            <li>
              <code>actual_method?(key)</code> は、<code>after_initialize</code> のように config に実際に定義されたメソッドと同じ名前かを調べます。同じ名前なら、代入させずに NoMethodError にします。
            </li>
            <li>
              <code>elsif</code> の行は参照です。<code>config.my_gem</code> のように <code>=</code> の無い名前で呼ばれ、その名前が <code>@@options</code> に保存されていれば、値を返します。
            </li>
            <li>
              どちらでもなければ <code>super</code> を呼び、通常の NoMethodError になります。
            </li>
          </ul>
          <p>
            この実装から、設定の名前を打ち間違えたときの動作が分かります。代入はどんな名前でも保存されるので、<code>config.force_sll = true</code> のように名前を間違えてもエラーになりません。どこからも読まれない値が保存されるだけで、<code>force_ssl</code>{' '}
            は変わりません。設定を書いたのに動作が変わらないときは、まず名前の綴りを確かめます。保存されていない名前を参照したときは NoMethodError になります。
          </p>
          <p>
            値の保存先 <code>@@options</code> はクラス変数（<code>@@</code> で始まり、そのクラスとサブクラスで共有される変数）なので、すべての Railtie とアプリケーションの config が同じハッシュを共有します
            <Ref n={4} />。ActiveRecord::Railtie はクラス本体で <code>config.active_record = ActiveSupport::OrderedOptions.new</code> を実行しており（OrderedOptions は、ハッシュのように値を入れ、<code>.xxx</code> の形のメソッドで読み書きできるオブジェクト）、アプリケーションの{' '}
            <code>config.active_record.xxx = ...</code> はこのオブジェクトに値を書き込みます。
          </p>
          <p>
            次の図は、<code>config.名前</code> の呼び出しが method_missing のどの分岐に進むかを、上から順にたどれるようにしたものです。下の段の4つの箱には、この節に出てきた呼び出しの例を、進む分岐ごとに書いています。
          </p>
          <Figure title="config.名前 の呼び出しと method_missing の分岐" caption="上の引用（configuration.rb の 99〜111 行目）を図にしたもの。実線の矢印は判定の流れ、破線の矢印は @@options への保存と参照を表す。">
            <ConfigMissingFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'app-class',
      title: 'アプリケーションクラスの定義と load_defaults',
      body: (
        <>
          <p>
            この節では、config/application.rb の <code>class Application {'<'} Rails::Application</code> の行と、その中の <code>config.load_defaults 8.1</code>{' '}
            の行が実行されたときに何が起きるかを見ます。どちらも rails new が書く行で、Rails のバージョンを上げる作業では <code>load_defaults</code> の数字を変えるかどうかを判断することになります。
          </p>
          <p>
            <code>class Application {'<'} Rails::Application</code> を実行した時点で、Rails::Application の <code>inherited</code> が呼ばれます。<code>inherited</code>{' '}
            は、サブクラスが定義されたときに Ruby が親クラスに対して呼ぶメソッドで、引数の <code>base</code> には定義されたサブクラス（デモでは Demo::Application）が入ります（<ChapterLink n={3} section="hooks" />
            ）。
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
            の 44〜46 行目）。config/environment.rb の <code>Rails.application.initialize!</code> や config.ru の <code>run Rails.application</code> が、クラス名の Demo::Application
            を書かずにアプリケーションを指せるのは、この記録があるためです。
          </p>
          <p>
            クラス本体の <code>config.load_defaults 8.1</code> は、Rails の各バージョンで変わった設定の既定値をまとめて設定するメソッドです。バージョンごとの <code>when</code> 節が1つ前のバージョンの{' '}
            <code>load_defaults</code> を呼ぶので、8.1 を指定すると 5.0 から 8.1 までの既定値が古い順に適用されます。次の引用は、<code>case target_version.to_s</code>{' '}
            で始まる分岐のうち、8.1 を指定したときに実行される部分です。8.1 で何の値が変わるかを確かめます。
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
          <ul>
            <li>
              <code>load_defaults "8.0"</code> が、1つ前のバージョンの分岐を先に実行する行です。8.0 の分岐も先頭で 7.2 を呼ぶので、古いバージョンの既定値から順に書き込まれます。
            </li>
            <li>
              このメソッドは config のメソッドなので、<code>self.yjit = ...</code> は <code>config.yjit = ...</code> と書くのと同じです。<code>action_controller.escape_json_responses = false</code> は{' '}
              <code>config.action_controller.escape_json_responses = false</code> と同じです。
            </li>
            <li>
              <code>if respond_to?(:action_controller)</code> のような条件は、そのフレームワークを読み込んだアプリケーションでだけ値を書くためのものです。
            </li>
          </ul>
          <p>
            <code>load_defaults</code> は config に値を書くだけで、フレームワークのクラスには触れません。<code>respond_to?(:active_record)</code> は、ActiveRecord::Railtie が読み込まれて{' '}
            <code>config.active_record</code> が定義されているかを確かめています
            <Ref n={6} />。書いた値が実際のクラスに反映されるのは、後で説明する初期化処理と on_load のときです。
          </p>
          <p>
            <code>load_defaults</code> は呼ばれた時点で値を代入するだけなので、同じ設定を後から代入すれば上書きできます。application.rb のクラス本体で <code>load_defaults</code>{' '}
            の行より後に書いた設定、config/environments のファイル、config/initializers のファイルに書いた設定は、どれも <code>load_defaults</code> より後に実行されるので、そちらの値が残ります。逆に、<code>load_defaults</code>{' '}
            の行より前に書いた設定は、<code>load_defaults</code> が同じ設定を持っていれば上書きされます。rails new が生成する application.rb では、<code>load_defaults</code> の行がクラス本体の先頭にあります。レビューでは、追加した設定がその行より後にあるかを確かめます。
          </p>
          <Callout kind="note">
            <p>
              業務のアプリケーションの <code>load_defaults</code> の値が Rails 本体のバージョンより古いことがあります。その場合は、新しいバージョンで変わった既定値が適用されていません。Rails ガイドの設定の章には、バージョンごとに{' '}
              <code>load_defaults</code> で変わる値の一覧があります
              <Ref n={7} />。
            </p>
            <p>
              Rails のバージョンを上げるときに <code>bin/rails app:update</code> を実行すると、<code>config/initializers/new_framework_defaults_8_1.rb</code>{' '}
              のような名前のファイルが作られます。新しい既定値が1つずつコメントにして書かれたファイルで、コメントを外した設定だけが新しい値になります。すべての設定を新しい値で動かせると確かめてから、このファイルを消して{' '}
              <code>load_defaults</code> の数字を上げます（ファイルの先頭のコメントにこの手順が書かれています）。
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
            <code>initializer "名前" do ... end</code> と書いて登録します。「Railtie・Engine・Application」の節の MyGem::Railtie では、<code>initializer "my_gem.setup" do |app| ... end</code>{' '}
            がこれに当たります。
          </p>
          <p>
            ここでいう初期化処理は、config/initializers ディレクトリのファイルとは別のものです。初期化処理は Railtie のクラスに登録された名前付きのブロックで、デモのアプリケーションには184個あります。config/initializers
            のファイルは、そのうちの1つである <code>load_config_initializers</code> という初期化処理の中で読み込まれます（次の節）。この節では、184個がどの順に実行されるかを見ます。業務では、gem
            の設定が効かないときや、起動中の例外のバックトレースに初期化処理の名前が出たときに、その処理が config/initializers のファイルより前か後かを調べるために使います。
          </p>
          <p>登録するメソッドは次のとおりです。引数の <code>before</code> と <code>after</code> がどう扱われるかを確かめます。</p>
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
          <ul>
            <li>
              <code>name</code> は初期化処理の名前、<code>opts</code> は <code>before: :別の名前</code> や <code>after: :別の名前</code> を受け取るハッシュ、<code>&blk</code>{' '}
              は <code>do ... end</code> で渡したブロックです（<ChapterLink n={4} section="block-to-proc" />）。
            </li>
            <li>
              <code>initializers</code> は、このクラスに登録済みの初期化処理の一覧です。<code>initializers.last&.name</code> は、一覧の最後の要素の名前を返します。<code>&.</code>{' '}
              は、一覧が空で <code>last</code> が nil のときに、エラーにせず nil を返す書き方です。
            </li>
            <li>
              3行目は <code>after</code> の指定が無いときに、直前に登録した初期化処理の名前を <code>after</code> に入れます。ただし、<code>before</code>{' '}
              に同じクラスの登録済みの名前が指定されているときは入れません。
            </li>
            <li>
              最後に、名前・<code>before</code>・<code>after</code>・ブロックをまとめた Initializer のオブジェクトを作り、一覧に加えます。ブロックはこの時点では実行されません。
            </li>
          </ul>
          <p>
            各初期化処理は名前、ブロック、<code>before</code>・<code>after</code> を持ちます。<code>after</code> を指定しなければ、同じクラスで直前に登録した初期化処理の名前が入ります。つまり、1つのクラスの中では書いた順に実行され、別のクラスの初期化処理との前後関係は{' '}
            <code>before:</code>・<code>after:</code> で指定します
            <Ref n={8} />。
          </p>
          <p>
            次に、config/environment.rb が呼ぶ <code>initialize!</code> の本体を読みます。確かめるのは、実行する初期化処理の一覧をどこから集めているかです。一覧は、次のように3つをつないだものです。
          </p>
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
          <ul>
            <li>
              <code>initialize!</code> の1行目は、2回呼ばれたときに例外を出します。初期化はプロセスの中で1回だけです。
            </li>
            <li>
              <code>run_initializers(group, self)</code> の <code>self</code> はアプリケーションのインスタンスです。この値が、初期化処理のブロックの引数（<code>do |app|</code> の <code>app</code>）になります。
            </li>
            <li>
              <code>initializers</code> の <code>+</code> は一覧をつなぐ演算で、書いた順に Bootstrap、Railtie、Finisher と並びます。<code>super</code> は Engine
              から継承した、アプリケーション自身の初期化処理の一覧です。
            </li>
          </ul>
          <p>
            Bootstrap は最初に行う準備（ロガー、キャッシュ、オートローダーなど）、<code>railties_initializers</code> は各 Railtie と Engine、アプリケーション自身の初期化処理、Finisher
            は最後にまとめて行う処理です
            <Ref n={5} />。<code>railties_initializers</code>（同じファイルの 612〜622 行目）は、読み込まれた Railtie と Engine の初期化処理を並び順につなぎ、既定ではアプリケーション自身の初期化処理を最後に置きます。この一覧を{' '}
            <code>run_initializers</code> が並べ替えて実行します。
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
          <ul>
            <li>
              <code>initializers</code> が返すのは Collection（Rails::Initializable::Collection）のオブジェクトです。Collection は初期化処理の一覧を持つクラスで、同じファイルの 37〜98 行目に定義されています。
            </li>
            <li>
              <code>tsort_each</code> は、並べ替えた順に初期化処理を1つずつブロックに渡します。
            </li>
            <li>
              <code>belongs_to?(group)</code> は、その初期化処理を今回の <code>initialize!</code> で実行するかを調べます。<code>initializer</code> に <code>group:</code>{' '}
              を付けなければ :default になり、<code>initialize!</code> も既定では :default を渡すので、通常はすべて実行されます。<code>group: :all</code> は、どの group を渡されても実行するという指定です（同じファイルの 19〜21 行目）。
            </li>
          </ul>
          <p>
            <code>tsort_each</code> は Ruby の tsort ライブラリ（<Term en="topological sort">トポロジカルソート</Term>）のメソッドです。トポロジカルソートは、「A は B より後」という前後関係の集まりから、すべての関係を満たす1列の順を作る並べ替えです。「この初期化処理より先に実行すべきもの」を先に出しながら、一覧を前から順にたどります。Rails
            8.1 の Collection は、<code>before</code>・<code>after</code> を名前で引けるハッシュに登録しており、依存先を名前で解決します（同じファイルの 63〜79 行目）。そのため、複数の Engine
            に同じ名前の初期化処理（<code>set_load_path</code> など）があると、それらは続けて実行されます。<code>initializer.run</code> はブロックを Railtie のインスタンスの上で{' '}
            <code>instance_exec</code> します（<ChapterLink n={4} />）。初期化処理のブロックの中で <code>config</code> や <code>paths</code> と書くと、そのブロックを登録した Railtie や Engine
            のメソッドが呼ばれるのはこのためです。
          </p>
          <p>
            tsort の動作を、Rails を使わない小さなプログラムで確かめます。Collection と同じく、<code>TSort</code> を include して2つのメソッドを定義します。3つの処理を、実行したい順とは違う順に登録しました。
          </p>
          <Code
            lang="ruby"
            title="tsort07.rb"
            code={`
require "tsort"

class Steps
  include TSort

  # deps は「処理の名前 => それより先に実行する処理の名前の配列」のハッシュ
  def initialize(deps)
    @deps = deps
  end

  # すべての処理を、登録した順に1つずつブロックに渡す
  def tsort_each_node(&block)
    @deps.each_key(&block)
  end

  # name より先に実行する処理を、1つずつブロックに渡す
  def tsort_each_child(name, &block)
    @deps[name].each(&block)
  end
end

steps = Steps.new({
  "ミドルウェアを組み立てる" => ["設定ファイルを読む"],
  "ロガーを作る" => [],
  "設定ファイルを読む" => ["ロガーを作る"],
})
steps.tsort_each { |name| puts name }
`}
          />
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
ロガーを作る
設定ファイルを読む
ミドルウェアを組み立てる
`}
          />
          <p>
            <code>tsort_each</code> は、登録順で先頭の「ミドルウェアを組み立てる」から始めます。その前に実行する「設定ファイルを読む」を先に出そうとし、さらにその前の「ロガーを作る」を先に出します。その結果、登録した順とは逆の順で出力されました。Rails
            の Collection では、<code>tsort_each_node</code> が登録された初期化処理を順に渡し、<code>tsort_each_child</code> が <code>before</code>・<code>after</code>{' '}
            で決まる「先に実行する初期化処理」を渡します。
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
          <p>
            1行目の <code>tsort_each.to_a</code> は、並べ替えた後の初期化処理を配列にします。コメントの番号はこの配列の添字（0 から始まる位置）で、小さいほど先に実行されます。図 13-6
            は、この184個を上の帯に左から右へ並べ、4つの区間に分けたものです。下の4つの箱が各区間の主な処理で、帯の 136 の位置の矢印が、config/initializers のファイルを読み込む{' '}
            <code>load_config_initializers</code> です。
          </p>
          <p>
            自分のアプリケーションでは、<code>bin/rails initializers</code> で同じ順の一覧を表示できます。1行が「初期化処理を持つクラス.初期化処理の名前」の形で、実行される順に並びます。gem
            の初期化処理の行が、アプリケーションのクラスの <code>load_config_initializers</code> の行より上にあれば、その処理は config/initializers のファイルより前に実行されます。
          </p>
          <Figure n="13-6" title="initialize! で実行される初期化処理" caption="デモのアプリケーション（Rails 8.1.4.1）で tsort_each の順に並べた184個を、4つの区間に分けた図。区間の名前は本書によるもの。番号は読み込む gem によって変わる。">
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
            で、<code>config/initializers/*.rb</code> は <code>load_config_initializers</code> で読み込まれます。次の引用で、2つの初期化処理がどのファイルをどの順に読み込むかを確かめます。
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
          <ul>
            <li>
              どちらも Rails::Engine のクラス本体に書かれた初期化処理です。Rails::Application は Engine を継承しているので、アプリケーションもこの2つを持ちます。
            </li>
            <li>
              <code>paths["config/environments"]</code> は、アプリケーションでは config/environments ディレクトリの、現在の環境の名前のファイル（production なら production.rb）を指します（<code>railties/lib/rails/engine/configuration.rb</code>{' '}
              の 96 行目）。<code>existent</code> は実際に存在するファイルだけを配列で返し、それを <code>require</code> します。
            </li>
            <li>
              <code>config.paths["config/initializers"]</code> は、config/initializers 以下の拡張子が .rb のファイルすべてを指します。サブディレクトリの中のファイルも含みます（同じファイルの 97 行目）。
            </li>
            <li>
              <code>load_config_initializer</code>（<code>engine.rb</code> の 690〜694 行目）は、渡されたファイルを <code>load</code> で実行します。
            </li>
          </ul>
          <p>
            <code>load_environment_config</code> は <code>before: :load_environment_hook</code> を指定しているので、Bootstrap より前に実行されます。ロガーやキャッシュの設定を環境別ファイルに書けるのはこのためです。Bootstrap
            の <code>initialize_logger</code> は <code>config.logger</code> と <code>config.log_level</code> を読んで <code>Rails.logger</code> を用意し、<code>initialize_cache</code> は{' '}
            <code>config.cache_store</code> を読んで <code>Rails.cache</code> を作ります（<code>railties/lib/rails/application/bootstrap.rb</code> の 34〜64 行目、80〜91 行目）。環境別のファイルがその前に読み込まれているので、production.rb
            に書いた値がここで使われます。
            <code>config/initializers</code> のファイルは、パスを <code>sort</code> した順（ファイル名の辞書順）に <code>load</code>（require と違い、呼ぶたびにファイルを実行するメソッド）されます
            <Ref n={10} />。Rails ガイドは、初期化ファイルの間に依存がある場合は1つのファイルにまとめることを勧めています
            <Ref n={7} />。
          </p>
          <p>
            読み込まれる時点が違うので、同じ <code>config</code> への代入でも、書くファイルによって反映されるかどうかが変わります。デモのアプリケーションの番号で並べると次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>書く場所</th>
                  <th>実行される時点</th>
                  <th>書いた値を読める初期化処理</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>config/application.rb のクラス本体</td>
                  <td>initialize! より前</td>
                  <td>すべて</td>
                </tr>
                <tr>
                  <td>config/environments の環境名のファイル</td>
                  <td>10〜13 番</td>
                  <td>14 番の Bootstrap 以降のすべて</td>
                </tr>
                <tr>
                  <td>config/initializers のファイル</td>
                  <td>136 番</td>
                  <td>137 番以降（ミドルウェアの組み立て、一括読み込み、after_initialize など）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            たとえば、config/initializers のファイルに <code>Rails.application.config.cache_store = :memory_store</code> と書いても、<code>Rails.cache</code> は変わりません。<code>Rails.cache</code>{' '}
            を作る <code>initialize_cache</code> は Bootstrap（14〜41 番）の中にあり、136 番の時点では実行が終わっているためです。<code>config.log_level</code>{' '}
            も同じです。この2つは config/application.rb か config/environments のファイルに書きます。一方、<code>config.middleware.use</code> でミドルウェアを足す行（<ChapterLink n={6} section="customize" />
            ）は config/initializers に書いても反映されます。ミドルウェアを組み立てる <code>build_middleware_stack</code> が 173 番で、136 番より後だからです。
          </p>
          <p>
            「Railtie・Engine・Application」の節の MyGem::Railtie も同じ理由で説明できます。<code>my_gem.setup</code> は Engine でない Railtie の初期化処理で、<code>before</code>・<code>after</code>{' '}
            の指定がありません。Engine でない Railtie の初期化処理は、一覧の中でアプリケーションの初期化処理より前に並ぶので、<code>my_gem.setup</code> はアプリケーションの{' '}
            <code>load_config_initializers</code> より前に実行されます。config/initializers のファイルで <code>config.my_gem.enabled</code> を変えても、<code>my_gem.setup</code>{' '}
            はすでに元の値を読み終えています。gem の設定を config/initializers に書いても効かないときは、<code>bin/rails initializers</code> でその gem の初期化処理の位置を確かめます。gem
            の側は、設定の値を読む処理を <code>after_initialize</code> や <code>on_load</code> のブロックの中に書けば、config/initializers のファイルより後に値を読めます。ActiveRecord::Railtie の{' '}
            <code>active_record.set_configs</code> がこの形です（次の節）。
          </p>
          <p>
            次の図は、デモのアプリケーションの番号の順に、config に値を書くファイル（左の列）と、その値を読む初期化処理（右の列）を上から並べたものです。136 番の config/initializers より上にある処理は、config/initializers で書いた値を読みません。
          </p>
          <Figure title="config に書く時点と、値を読む初期化処理" caption="番号はデモのアプリケーションのもの。my_gem.setup は架空の gem の初期化処理で、Engine でない Railtie の初期化処理が並ぶ範囲に置いた。読む処理は本文で挙げたものだけを載せた。">
            <ConfigTimingFigure />
          </Figure>
          <p>
            Rails には、初期化の途中に処理を差し込むための5つのイベントがあります
            <Ref n={7} />。<code>config.after_initialize do ... end</code> のように、config のイベントと同じ名前のメソッドにブロックを渡して登録します。config/application.rb のクラス本体、config/environments
            のファイル、Railtie のクラス本体に書けます。config/initializers のファイルでは <code>Rails.application.config.after_initialize do ... end</code>{' '}
            と書きます。デモのアプリケーションでの位置と合わせて表にまとめます。
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
            <code>ActiveSupport.on_load(:active_record) {'{ ... }'}</code> は、「ActiveRecord::Base の読み込みが終わったらこのブロックを実行する」という予約です。既存のアプリケーションの config/initializers のファイルや、gem の導入手順に載っているコードに出てきます。すべてのモデルにモジュールを include する処理を例にして、直接参照する書き方と on_load を使う書き方を並べます。
          </p>
          <Code
            lang="ruby"
            title="config/initializers/my_extension.rb（説明用。MyExtension は架空のモジュール）"
            code={`
# 直接参照する書き方。この行を実行した時点で ActiveRecord::Base が読み込まれる
ActiveRecord::Base.include(MyExtension)

# on_load を使う書き方。ブロックは ActiveRecord::Base が読み込まれたときに実行される
ActiveSupport.on_load(:active_record) do
  include MyExtension
end
`}
          />
          <p>
            on_load のブロックの中では self が ActiveRecord::Base になるので、<code>include MyExtension</code> は <code>ActiveRecord::Base.include(MyExtension)</code>{' '}
            と同じ結果になります。違いは実行される時点です。<code>:active_record</code> はフックの名前で、どのクラスの読み込みに対応するかは Rails の側で決まっています。
          </p>
          <p>
            実装は ActiveSupport::LazyLoadHooks にあります。次の引用で、ブロックがどこに保存され、いつ、どのオブジェクトを self にして実行されるかを確かめます。
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
          <ul>
            <li>
              <code>@load_hooks</code> と <code>@loaded</code> は、<code>:active_record</code> のような名前をキーにしたハッシュで、値は配列です（同じファイルの 46〜47 行目）。<code>@load_hooks[name]</code>{' '}
              には登録されたブロックが、<code>@loaded[name]</code> にはその名前で読み込みが終わったクラスが入ります。
            </li>
            <li>
              <code>on_load</code> の最初の3行は、読み込みが終わったクラスがすでにあれば、そのクラスに対してブロックをすぐに実行します。まだ無ければ <code>@loaded[name]</code>{' '}
              は空の配列なので、何も実行しません。最後の行でブロックを保存します。
            </li>
            <li>
              <code>run_load_hooks</code> は、読み込みが終わったクラス（<code>base</code>）を <code>@loaded</code> に記録してから、保存されているブロックを登録順に実行します。
            </li>
            <li>
              <code>execute_hook</code>（同じファイルの 91〜103 行目）は、<code>base</code> がクラスかモジュールなら <code>base.class_eval(&block)</code> でブロックを実行します。<code>class_eval</code>{' '}
              はブロックの中の self をそのクラスにするメソッドです（<ChapterLink n={4} section="self-switch" />）。
            </li>
          </ul>
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
          <ul>
            <li>
              1行目の <code>{'-> { ... }'}</code> は、後で呼ぶ処理を変数に入れる書き方（lambda。<ChapterLink n={4} section="proc-lambda" />）で、<code>loaded.call</code>{' '}
              で実行します。中身は、読み込み済みのファイルの一覧 <code>$LOADED_FEATURES</code> に active_record/base.rb があるか、つまり ActiveRecord::Base を定義するファイルが読み込み済みかを true か false で返します。
            </li>
            <li>2行目はこの初期化ファイルが実行された時点で ActiveRecord::Base が読み込み済みかを表示します。</li>
            <li>3行目は self を表示するブロックを on_load で登録します。<code>[on_load]</code> の行が出た位置が、ブロックが実行された時点です。</li>
            <li>4行目は after_initialize の時点で ActiveRecord::Base が読み込み済みかを表示します。</li>
          </ul>
          <p>
            出力のうち <code>[script]</code> で始まる2行はスクリプトが表示した行で、<code>initialize!</code> が終わった直後と、<code>Article.first</code> を実行した直後を示します。development と production
            で、<code>[on_load]</code> の行の位置を比べます。
          </p>
          <Code
            lang="text"
            title="実行結果（== の行は環境の名前）"
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
          <Figure n="13-7" title="on_load のブロックが実行される時点" caption="上の実行結果を図にしたもの。development では最初にモデルを参照したとき、production では初期化中の一括読み込みのときに ActiveRecord::Base が読み込まれる。">
            <OnLoadFigure />
          </Figure>
          <p>
            どちらの環境でも、1行目の <code>[initializer]</code> は false です。config/initializers のファイルが実行される時点では、ActiveRecord::Base はまだ読み込まれていません。<code>[on_load] self=ActiveRecord::Base</code>{' '}
            の行から、ブロックの中の self が ActiveRecord::Base であることも確かめられます。
          </p>
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
            <code>table_name_prefix</code> は、モデルに対応するテーブル名の前に付ける文字列の設定です。コメントの最後の2行が結果です。zz1_touch.rb があると、zz2_conf.rb が <code>"app_"</code>{' '}
            を書く前に ActiveRecord::Base が読み込まれます。<code>active_record.set_configs</code> が登録したブロックは、その時点の <code>config.active_record</code> の値を ActiveRecord::Base
            に渡します。後から書いた <code>"app_"</code> は渡されず、既定値の空文字列のままになりました。zz1_touch.rb を置かなければ、ブロックは config/initializers のファイルをすべて読み込んだ後に実行されるので、<code>"app_"</code>{' '}
            が渡されます。
          </p>
          <p>
            次の図は、zz1_touch.rb がある場合（上の段）と無い場合（下の段）を、左から時間の順に並べたものです。中央の枠が 136 番の load_config_initializers です。set_configs のブロックは、上の段では枠の中で zz2_conf.rb より前に、下の段では枠の後に実行されます。
          </p>
          <Figure title="ActiveRecord::Base を先に参照した場合の table_name_prefix" caption="上の実験の結果を図にしたもの。config/initializers のファイルは辞書順に読み込まれる。zz1_touch.rb が無い場合に ActiveRecord::Base が読み込まれる時点は、図 13-7 のとおり環境によって変わる。">
            <EarlyTouchFigure />
          </Figure>
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
          <p>
            Finisher は、<code>initialize!</code> の一覧の最後につながれる初期化処理のまとまりです（デモでは 170〜183 番）。config/initializers のファイルまで読み込んだ後の設定を使って、ミドルウェアを組み立て、必要ならアプリケーションのクラスをまとめて読み込み、after_initialize
            のブロックを実行します。「環境ごとの設定」の節で見た production.rb の <code>config.eager_load = true</code> が使われるのはここです。
          </p>
          <p>
            Finisher の初期化処理のうち、一括読み込みと after_initialize の部分を引用します。<code>config.eager_load</code> の値で何が変わるかと、after_initialize がどの時点で実行されるかを確かめます。
          </p>
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
          <ul>
            <li>
              <code>initializer :eager_load! do |app|</code> の <code>app</code> はアプリケーションのインスタンスです。<code>if config.eager_load</code>{' '}
              が偽なら、この初期化処理は何もしません。development でモデルが最初に参照されるまで読み込まれないのはこのためです。
            </li>
            <li>
              <code>ActiveSupport.run_load_hooks(:before_eager_load, self)</code> は、前の節で見た <code>run_load_hooks</code> です。<code>config.before_eager_load</code>{' '}
              で登録されたブロックをここで実行します。
            </li>
            <li>
              <code>Zeitwerk::Loader.eager_load_all</code> の Zeitwerk は、Rails がクラスのファイルを自動で読み込むために使う gem です（<ChapterLink n={8} />
              ）。この行が、app/models や app/controllers などのファイルをすべて読み込みます。
            </li>
            <li>
              <code>Rails.eager_load!</code> は、Rails モジュールが持つクラスのうち、使うときまで読み込まない指定になっているもの（Rails::HealthController など）を読み込みます。
            </li>
            <li>
              <code>config.eager_load_namespaces.each(&:eager_load!)</code> は、配列の各要素に対して <code>eager_load!</code> を呼びます。<code>eager_load_namespaces</code> に入っているのは、ActiveRecord
              のようなフレームワークのモジュールと Engine です。ActiveRecord::Railtie のクラス本体には <code>config.eager_load_namespaces {'<<'} ActiveRecord</code> の行があります。
            </li>
            <li>
              <code>if config.reloading_enabled?</code> の部分は、一括読み込みとコードの再読み込みの両方を有効にした場合に、再読み込みのたびに一括読み込みをやり直すためのものです。
            </li>
            <li>
              <code>finisher_hook</code> は <code>:after_initialize</code> の名前で <code>run_load_hooks</code> を呼びます。<code>config.after_initialize</code>{' '}
              で登録されたブロックは、ここで実行されます。<code>eager_load!</code> の次に登録されているので、一括読み込みより後です。
            </li>
          </ul>
          <p>
            <code>config.eager_load</code> が true（production の既定）のとき、<code>Zeitwerk::Loader.eager_load_all</code> が app/ 以下などのファイルをすべて読み込みます
            <Ref n={13} />。リクエストを受ける前に全部のクラスを読み込んでおくことには、次の利点があります。スレッドは1つのプロセスの中で並行して進む処理の単位で、Puma
            は複数のスレッドでリクエストを同時に処理します（<ChapterLink n={23} section="thread" />）。
          </p>
          <ul>
            <li>リクエストの処理中にファイルを読み込まないので、複数のスレッドが同時に同じ定数を読み込む状況が起きない。</li>
            <li>ファイル名と定数名の食い違いなどの誤りが、起動時に例外として見つかる（<ChapterLink n={8} />）。</li>
            <li>Puma のクラスタモード（アプリケーションのプロセスを複数動かす設定）で親プロセスが読み込んでから fork（実行中のプロセスを複製して子プロセスを作ること）すると、読み込んだコードのメモリーを子プロセスと共有できる（<ChapterLink n={23} />）。</li>
          </ul>
          <p>
            2つ目の利点はエラーの調査で使います。手元の development では起動できるのに、production や CI（図 13-3 のとおり、環境変数 CI があると test でも eager_load が true になります）でだけ起動時に例外が出ることがあります。そのときは、一括読み込みで初めて読み込まれたファイルが原因かを疑います。例外のバックトレースに <code>railties/lib/rails/application/finisher.rb</code>{' '}
            の 79 行目前後（上の引用の <code>eager_load!</code> のブロックの中）が含まれていれば、この初期化処理の中で起きた例外です。
          </p>
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
