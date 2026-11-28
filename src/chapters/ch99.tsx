import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 設定ファイルとフックが実行される順序 ---------- */
function LoadOrderFigure() {
  const steps = [
    { lines: ['[1] application.rb', 'クラス本体'], value: 'application.rb' },
    { lines: ['[2] environments/', 'development.rb'], value: 'development.rb' },
    { lines: ['[3]', 'before_initialize'], value: 'development.rb' },
    { lines: ['[4] initializers/', 'greeting.rb'], value: 'development.rb' },
    { lines: ['[6]', 'to_prepare'], value: '（表示なし）' },
    { lines: ['[5]', 'after_initialize'], value: 'development.rb' },
  ]
  return (
    <Svg id="99-2" w={780} h={258} label="development 環境での起動の順序。[1] application.rb のクラス本体、[2] environments/development.rb、[3] before_initialize、[4] config/initializers/greeting.rb、[6] to_prepare、[5] after_initialize の順に実行された。x.greeting は [2] で development.rb に上書きされ、その後は変わらない。[2] と [3] の間でロガーが作られるので、[4] で log_level を代入しても Rails.logger のレベルは変わらなかった">
      <T x={20} y={16} fs={12} tone="muted">起動の順序（左から右へ）</T>
      {steps.map((s, i) => (
        <g key={i}>
          <Box x={20 + i * 124} y={30} w={118} h={50} lines={s.lines} fs={11} mono fill={i === 3 ? 'box5' : 'box'} />
          <Box x={20 + i * 124} y={104} w={118} h={30} lines={s.value} fs={11} mono={s.value !== '（表示なし）'} fill="box4" />
          {i < steps.length - 1 && <Arrow x1={138 + i * 124} y1={55} x2={144 + i * 124} y2={55} />}
        </g>
      ))}
      <T x={20} y={96} fs={11} tone="muted">x.greeting の値</T>
      <Arrow x1={265} y1={28} x2={265} y2={160} plain dashed accent />
      <Box x={150} y={164} w={330} h={28} lines="[2] と [3] の間でロガーを作り、log_level を読む" fs={12} accent />
      <T x={20} y={218} fs={12}>[4] で config.log_level = :warn を代入しても、[5] で見た Rails.logger.level は 0（debug）のまま</T>
      <T x={20} y={240} fs={11} tone="muted">to_prepare は after_initialize より先に実行された（Rails 8.1.4.1・development）</T>
    </Svg>
  )
}

/* ---------- 図 config_for が shared と環境のキーを合わせる ---------- */
function ConfigForFigure() {
  return (
    <Svg id="99-3" w={760} h={252} label="config/delivery.yml には shared に timeout 5 と retries 2、development に base_url、test に base_url と retries 0、production に ERB で環境変数を読む base_url がある。config_for は shared と現在の環境のキーを合わせ、development では timeout 5・retries 2・localhost:4000、test では retries が 0 に上書きされ、production では環境変数の値が入る">
      <Box x={20} y={20} w={330} h={190} fs={12} mono align="start" fill="box4" lines={[
        'shared:', '  timeout: 5', '  retries: 2', 'development:', '  base_url: http://localhost:4000', 'test:',
        '  base_url: http://delivery.test', '  retries: 0', 'production:', '  base_url: <%= ENV["DELIVERY_API_URL"] %>',
      ]} />
      <Box x={420} y={20} w={320} h={52} lines={['development', 'timeout 5・retries 2・localhost:4000']} fs={12} bold subTone="muted" />
      <Box x={420} y={89} w={320} h={52} lines={['test', 'timeout 5・retries 0・delivery.test']} fs={12} bold subTone="muted" />
      <Box x={420} y={158} w={320} h={52} lines={['production', 'timeout 5・retries 2・DELIVERY_API_URL の値']} fs={12} bold subTone="muted" accent />
      <Arrow x1={352} y1={115} x2={418} y2={46} />
      <Arrow x1={352} y1={115} x2={418} y2={115} />
      <Arrow x1={352} y1={115} x2={418} y2={184} />
      <T x={20} y={234} fs={12}>ERB はファイル全体を評価する。production の行に ENV.fetch を書くと、development でも実行される</T>
    </Svg>
  )
}

/* ---------- 図 環境ごとに読む credentials のファイルと鍵 ---------- */
function CredentialsFigure() {
  const row = (y: number, label: string, key: string[], file: string[], value: string[], fail = false) => (
    <g key={y}>
      <T x={20} y={fail ? y + 14 : y + 22} fs={12} bold>{label}</T>
      <Box x={170} y={y} w={180} h={44} lines={key} fs={11.5} mono={!fail} dashed={fail} fill="box" />
      <Arrow x1={350} y1={y + 22} x2={378} y2={y + 22} />
      <Box x={380} y={y} w={230} h={44} lines={file} fs={11.5} mono fill="box4" />
      <Arrow x1={610} y1={y + 22} x2={638} y2={y + 22} />
      <Box x={640} y={y} w={130} h={44} lines={value} fs={11.5} mono fill={fail ? 'none' : 'box5'} accent={fail} />
    </g>
  )
  return (
    <Svg id="99-4" w={780} h={250} label="development と test は config/master.key で config/credentials.yml.enc を復号し、api_key は global-key だった。production は config/credentials/production.key で production.yml.enc を復号し、api_key は prod-key だった。production.key がないと master.key で production.yml.enc を復号しようとして InvalidMessage の例外になった">
      <T x={170} y={18} fs={11.5} tone="muted">復号に使う鍵</T>
      <T x={380} y={18} fs={11.5} tone="muted">暗号化したファイル</T>
      <T x={640} y={18} fs={11.5} tone="muted">api_key の値</T>
      {row(30, 'development・test', ['config/master.key'], ['config/credentials.yml.enc'], ['global-key'])}
      {row(90, 'production', ['config/credentials/', 'production.key'], ['config/credentials/', 'production.yml.enc'], ['prod-key'])}
      {row(150, 'production', ['production.key なし', '→ master.key を使う'], ['config/credentials/', 'production.yml.enc'], ['InvalidMessage'], true)}
      <T x={20} y={182} fs={11} tone="muted">（鍵なし）</T>
      <T x={20} y={220} fs={11.5}>環境別のファイルがあると、共通のファイルとは合わせずに環境別のファイルだけを読む</T>
      <T x={20} y={240} fs={11.5} tone="muted">環境変数 RAILS_MASTER_KEY があれば、鍵のファイルより優先して使う</T>
    </Svg>
  )
}

/* ---------- 図 Gemfile と Gemfile.lock の構造 ---------- */
function LockFigure() {
  return (
    <Svg id="99-5" w={760} h={310} label="Gemfile には rails、puma、sqlite3 など6個の gem と許すバージョンの範囲を書く。bundle install が解決した結果の Gemfile.lock には、GEM の specs に全 gem のバージョンと依存、PLATFORMS に対象の OS と CPU、DEPENDENCIES に Gemfile の指定の写し、CHECKSUMS に gem ファイルのハッシュ、BUNDLED WITH に Bundler のバージョンが入る">
      <T x={20} y={22} bold>Gemfile（人が書く）</T>
      <Box x={20} y={34} w={330} h={86} fs={12} mono align="start" fill="box" lines={['gem "rails", "~> 8.1.4", ">= 8.1.4.1"', 'gem "puma", ">= 5.0"', 'gem "sqlite3", ">= 2.1"', '# ほか3個']} />
      <Arrow x1={350} y1={77} x2={438} y2={56} />
      <T x={395} y={96} anchor="middle" fs={11} mono tone="muted">bundle</T>
      <T x={395} y={110} anchor="middle" fs={11} mono tone="muted">install</T>
      <Box x={440} y={18} w={300} h={74} fs={12} mono align="start" fill="box4" lines={['GEM … specs:', '    puma (8.0.2)', '      nio4r (~> 2.0)', '    rack (3.2.8)']} />
      <Box x={440} y={98} w={300} h={40} fs={12} mono align="start" fill="box4" lines={['PLATFORMS', '  x86_64-linux-gnu など8種類']} />
      <Box x={440} y={144} w={300} h={58} fs={12} mono align="start" fill="box4" lines={['DEPENDENCIES', '  puma (>= 5.0)', '  rails (~> 8.1.4, >= 8.1.4.1)']} />
      <Box x={440} y={208} w={300} h={40} fs={12} mono align="start" fill="box4" lines={['CHECKSUMS', '  puma (8.0.2) sha256=c8ed87…']} />
      <Box x={440} y={254} w={300} h={40} fs={12} mono align="start" fill="box4" lines={['BUNDLED WITH', '  4.0.20']} />
      <T x={20} y={150} fs={12}>GEM：解決した全 gem のバージョンと依存（90行）</T>
      <T x={20} y={174} fs={12}>PLATFORMS：解決の対象にした OS と CPU</T>
      <T x={20} y={198} fs={12}>DEPENDENCIES：Gemfile の指定の写し</T>
      <T x={20} y={222} fs={12}>CHECKSUMS：gem ファイルのハッシュ値</T>
      <T x={20} y={246} fs={12}>BUNDLED WITH：書き出した Bundler</T>
      <T x={20} y={280} fs={11} tone="muted">右は rails new した直後の</T>
      <T x={20} y={298} fs={11} tone="muted">Gemfile.lock の抜粋（Bundler 4.0.20）</T>
    </Svg>
  )
}

/* ---------- 図 バージョンの条件が許す範囲 ---------- */
function RequirementFigure() {
  const ticks = ['8.0.9', '8.1.3', '8.1.4', '8.1.4.1', '8.1.9', '8.2.0', '9.0.0']
  const tx = (i: number) => 220 + i * 88
  const rows = [
    { req: '~> 8.1', range: '8.1 以上 9.0 未満', from: 264, to: 704, ok: [1, 2, 3, 4, 5] },
    { req: '~> 8.1.4', range: '8.1.4 以上 8.2 未満', from: 396, to: 616, ok: [2, 3, 4] },
    { req: '~> 8.1.4, >= 8.1.4.1', range: '8.1.4.1 以上 8.2 未満', from: 484, to: 616, ok: [3, 4] },
    { req: '~> 8.1.4.0', range: '8.1.4.0 以上 8.1.5 未満', from: 396, to: 528, ok: [2, 3] },
  ]
  return (
    <Svg id="99-6" w={790} h={250} label="7つのバージョンに対して4つの条件を調べた。~> 8.1 は 8.1.3 から 8.2.0 まで、~> 8.1.4 は 8.1.4、8.1.4.1、8.1.9、~> 8.1.4, >= 8.1.4.1 は 8.1.4.1 と 8.1.9、~> 8.1.4.0 は 8.1.4 と 8.1.4.1 を満たした">
      <g data-figcheck="off">
        {ticks.map((t, i) => (
          <g key={t}>
            <T x={tx(i)} y={22} anchor="middle" fs={11} mono>{t}</T>
            <Arrow x1={tx(i)} y1={32} x2={tx(i)} y2={210} plain dashed />
          </g>
        ))}
      </g>
      {rows.map((r, ri) => {
        const y = 56 + ri * 42
        return (
          <g key={r.req}>
            <T x={20} y={y} fs={12} mono>{r.req}</T>
            <T x={20} y={y + 16} fs={11} tone="muted">{r.range}</T>
            <rect x={r.from} y={y - 5} width={r.to - r.from} height={10} rx={5} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            {ticks.map((_, i) => (
              <circle key={i} cx={tx(i)} cy={y} r={4.5} fill={r.ok.includes(i) ? 'var(--fig-accent)' : 'var(--fig-bg)'} stroke="var(--fig-line)" />
            ))}
          </g>
        )
      })}
      <T x={20} y={236} fs={11} tone="muted">● は条件を満たすバージョン、○ は満たさないバージョン。Ruby 4.0.9 の Gem::Requirement#satisfied_by? で確かめた</T>
    </Svg>
  )
}

/* ---------- 図 設定の値が決まる順（段階送り） ---------- */
const bootStages: string[][] = [
  ['load_defaults', '8.1'],
  ['application.rb', 'の残りの行'],
  ['environments/', 'development.rb'],
  ['ロガーを作る', 'before_initialize'],
  ['initializers/', 'greeting.rb'],
  ['to_prepare', 'after_initialize'],
]
const bootRows = ['config.yjit', 'config.x.greeting', 'config.log_level', 'Rails.logger.level']

function BootSnapshot({ at, values, changed }: { at: number; values: string[]; changed: number[] }) {
  return (
    <Svg
      id={`${figureNumber(99, 8)}-${at + 1}`}
      w={760}
      h={210}
      label={`起動の${at + 1}番目の段階「${bootStages[at].join(' ')}」を実行した後の値。${bootRows.map((r, i) => `${r} は ${values[i]}`).join('、')}`}
    >
      {bootStages.map((lines, i) => (
        <g key={i}>
          <Box x={10 + i * 124} y={10} w={116} h={46} lines={lines} fs={10.5} mono={i !== 3} fill={i === at ? 'box5' : i < at ? 'box' : 'bg'} accent={i === at} bold={i === at} />
          {i < bootStages.length - 1 && <Arrow x1={126 + i * 124} y1={33} x2={133 + i * 124} y2={33} />}
        </g>
      ))}
      <T x={10} y={74} fs={11} tone="muted">この段階を実行した後の値（development）</T>
      {bootRows.map((name, i) => (
        <g key={name}>
          <Box x={10} y={88 + i * 30} w={200} h={26} lines={name} fs={11} mono fill="box4" />
          <Box x={216} y={88 + i * 30} w={534} h={26} lines={values[i]} fs={11} mono fill={changed.includes(i) ? 'box5' : 'bg'} accent={changed.includes(i)} />
        </g>
      ))}
    </Svg>
  )
}

type Candidate = { lines: string[]; used?: boolean }
function PrioritySnapshot({ id, rows }: { id: number; rows: { name: string; chain: Candidate[] }[] }) {
  return (
    <Svg
      id={`${figureNumber(99, 8)}-${id}`}
      w={760}
      h={30 + rows.length * 70}
      label={rows.map((r) => `${r.name}は ${r.chain.map((c) => c.lines.join('')).join('、')} の順に探し、この章の実行では ${r.chain.find((c) => c.used)?.lines.join('') ?? 'なし'} が使われた`).join('。')}
    >
      <T x={10} y={14} fs={11} tone="muted">左から順に探し、最初に見つかったものを使う（強調はこの章の実行で使われたもの）</T>
      {rows.map((r, i) => (
        <g key={r.name}>
          <Box x={10} y={30 + i * 70} w={150} h={54} lines={r.name} fs={11.5} bold fill="box4" />
          {r.chain.map((c, k) => (
            <g key={k}>
              <Box x={180 + k * 196} y={30 + i * 70} w={176} h={54} lines={c.lines} fs={11} mono fill={c.used ? 'box5' : 'bg'} accent={c.used} />
              {k < r.chain.length - 1 && <Arrow x1={356 + k * 196} y1={57 + i * 70} x2={374 + k * 196} y2={57 + i * 70} />}
            </g>
          ))}
        </g>
      ))}
    </Svg>
  )
}

const configSteps = [
  {
    label: 'load_defaults',
    detail: (
      <>
        <BootSnapshot at={0} values={['false', '（未設定）', ':debug', '（ロガーはまだない）']} changed={[0]} />
        <p>application.rb のクラス本体の先頭で <code>config.load_defaults 8.1</code> を呼ぶと、5.0 から 8.1 までの各バージョンの既定値が古い順に適用されます。<code>yjit</code> は 7.2 の既定値で true になり、8.1 の既定値 <code>!Rails.env.local?</code> で false に変わります。<code>log_level</code> は Rails の初期値の <code>:debug</code> のままです。</p>
      </>
    ),
  },
  {
    label: 'application.rb',
    detail: (
      <>
        <BootSnapshot at={1} values={['false', '"application.rb"', ':debug', '（ロガーはまだない）']} changed={[1]} />
        <p>クラス本体の残りの行が実行され、<code>x.greeting</code> に "application.rb" が入ります。ここに書いた値はすべての環境に共通です。</p>
      </>
    ),
  },
  {
    label: 'development.rb',
    detail: (
      <>
        <BootSnapshot at={2} values={['false', '"development.rb"', ':debug', '（ロガーはまだない）']} changed={[1]} />
        <p>現在の環境と同じ名前の <code>config/environments/development.rb</code> だけが読まれます。同じ項目に代入したので、<code>x.greeting</code> は "development.rb" に上書きされます。</p>
      </>
    ),
  },
  {
    label: 'ロガーを作る',
    detail: (
      <>
        <BootSnapshot at={3} values={['false', '"development.rb"', ':debug', '0（debug）']} changed={[3]} />
        <p>環境設定のファイルを読んだ直後に、Rails はロガーを作ります。このときの <code>log_level</code> が <code>:debug</code> なので、<code>Rails.logger.level</code> は debug を表す 0 になりました。続く <code>before_initialize</code> のブロックで表示した <code>x.greeting</code> も "development.rb" です。</p>
      </>
    ),
  },
  {
    label: 'initializers',
    detail: (
      <>
        <BootSnapshot at={4} values={['false', '"development.rb"', ':warn', '0（debug のまま）']} changed={[2]} />
        <p>config/initializers のファイルが実行されます。greeting.rb で <code>config.log_level = :warn</code> を代入すると、設定の値は <code>:warn</code> に変わりました。ロガーはすでに作られているので、<code>Rails.logger.level</code> は 0 のままです。</p>
      </>
    ),
  },
  {
    label: 'after_initialize',
    detail: (
      <>
        <BootSnapshot at={5} values={['false', '"development.rb"', ':warn', '0（debug のまま）']} changed={[]} />
        <p><code>to_prepare</code> のブロックが先に、<code>after_initialize</code> のブロックが後に実行されました。<code>after_initialize</code> で表示した値が、起動を終えた時点の値です。設定の値は <code>:warn</code> でも、動いているロガーのレベルは 0 です。</p>
      </>
    ),
  },
  {
    label: 'credentials',
    detail: (
      <>
        <PrioritySnapshot
          id={7}
          rows={[
            { name: '読むファイル', chain: [{ lines: ['config/credentials/', 'production.yml.enc'], used: true }, { lines: ['config/', 'credentials.yml.enc'] }] },
            { name: '復号の鍵', chain: [{ lines: ['環境変数', 'RAILS_MASTER_KEY'] }, { lines: ['config/credentials/', 'production.key'], used: true }, { lines: ['config/', 'master.key'] }] },
          ]}
        />
        <p>credentials の値はここまでの設定ファイルとは別の、暗号化したファイルから読みます。production では <code>config/credentials/production.yml.enc</code> があればそれだけを読み、共通の <code>credentials.yml.enc</code> の値とは合わせませんでした（<code>api_key</code> は "prod-key"）。復号の鍵は環境変数 <code>RAILS_MASTER_KEY</code>、<code>config/credentials/production.key</code>、<code>config/master.key</code> の順に探します。production.key を移動すると、master.key で復号しようとして <code>InvalidMessage</code> の例外になりました。</p>
      </>
    ),
  },
  {
    label: '環境変数',
    detail: (
      <>
        <PrioritySnapshot
          id={8}
          rows={[
            { name: 'secret_key_base', chain: [{ lines: ['環境変数', 'SECRET_KEY_BASE'] }, { lines: ['credentials の', 'secret_key_base'], used: true }, { lines: ['tmp/local_secret.txt', '（development・test）'] }] },
            { name: 'DB の接続先', chain: [{ lines: ['環境変数', 'DATABASE_URL'], used: true }, { lines: ['config/', 'database.yml'] }] },
          ]}
        />
        <p>次の値は、環境変数があればファイルに書いた値より先に使われます。<code>secret_key_base</code> は <code>SECRET_KEY_BASE</code>、credentials の値、development と test だけで使う <code>tmp/local_secret.txt</code> の順に探します。この章の production の実行では環境変数を渡していないので、credentials の値（先頭が 8cec3e19）が使われました。データベースの接続先は <code>DATABASE_URL</code> を渡すと storage/check-target.sqlite3 に変わり、外すと database.yml の storage/test.sqlite3 でした。</p>
      </>
    ),
  },
]

const chapter: Chapter = {
  number: 99,
  part: 2,
  title: 'Rails の設定・環境・依存関係',
  summary: '設定値の置き場所を選び、同じコードが開発・テスト・本番で異なる動作をする理由を説明します。rails new した最小のアプリで、環境の切り替え、設定の読み込み順、credentials の暗号化、Gemfile.lock の変化を実行して確かめます。',
  goals: [
    'development・test・production の違いと、Rails.env が決まる手順を説明できる',
    '共通設定・環境設定・initializer・config.x・config_for の読み込み順と使い分けを説明できる',
    '環境変数と credentials を使い分け、環境別の credentials が読まれる条件を説明できる',
    'Gemfile と Gemfile.lock の役割、~> の範囲、bundle install・update・outdated の違いを説明できる',
  ],
  prerequisites: [1, 95],
  sections: [
    { id: 'environments', title: '開発・テスト・本番の環境', body: <>
      <p>記事を保存するモデルは、開発中に動かしても、テストを実行しても、本番で要求を受けても同じコードです。ただし、使うデータベースや、コードを書き換えたときの動作まで同じにする必要はありません。開発中は書き換えたコードがすぐ反映されるほうが便利で、本番では起動時にすべてのコードを読み込んで速く動くほうが望ましく、テストでは毎回同じ条件で実行できることが必要です。Rails はこの動作用途の違いを<Term>環境</Term>として区別します<Ref n={1} />。</p>
      <p>環境は名前で指定します。<code>rails new</code> したアプリには development・test・production の3つがあり、それぞれ <code>config/environments/</code> に同じ名前の設定ファイルがあります。現在の環境は <code>Rails.env</code> で確認できます。Rails は環境変数の <code>RAILS_ENV</code>、なければ <code>RACK_ENV</code> を読み、どちらもなければ development にします<Ref n={5} />。</p>
      <Code lang="ruby" title="railties/lib/rails.rb（74〜76行目）" href={`${GH}/railties/lib/rails.rb#L74-L76`} code={`
def env
  @_env ||= ActiveSupport::EnvironmentInquirer.new(ENV["RAILS_ENV"].presence || ENV["RACK_ENV"].presence || "development")
end
`} />
      <p>この章の実験には、<code>rails new demo --minimal</code> で作り、SQLite を使う最小のアプリを使いました。Ruby 4.0.9・Rails 8.1.4.1・Bundler 4.0.20 の Docker コンテナで実行しています。環境ごとに、<code>Rails.env</code> と、Active Record が選んだデータベースを表示しました。</p>
      <Code lang="ruby" title="script/show_env.rb" code={`
db = ActiveRecord::Base.connection_db_config
puts "Rails.env=#{Rails.env} production?=#{Rails.env.production?} local?=#{Rails.env.local?} database=#{db.database}"
`} />
      <Code lang="text" title="環境を切り替えて実行した結果" code={`
$ RAILS_ENV=development bin/rails runner script/show_env.rb
Rails.env=development production?=false local?=true database=storage/development.sqlite3
$ RAILS_ENV=test bin/rails runner script/show_env.rb
Rails.env=test production?=false local?=true database=storage/test.sqlite3
$ RAILS_ENV=production bin/rails runner script/show_env.rb
Rails.env=production production?=true local?=false database=storage/production.sqlite3

$ env -u RAILS_ENV -u RACK_ENV bin/rails runner 'puts Rails.env'
development
$ env -u RAILS_ENV RACK_ENV=production bin/rails runner 'puts Rails.env'
production
$ bin/rails runner -e test 'puts Rails.env'
test
`} />
      <p><code>Rails.env</code> は文字列のように使え、<code>production?</code> のように環境名に <code>?</code> を付けたメソッドで判定できます。<code>local?</code> は development と test のときに true を返します。環境変数を何も指定しないと development になり、<code>RAILS_ENV</code> がなければ <code>RACK_ENV</code> が使われました。<code>bin/rails</code> のコマンドでは <code>-e</code> でも指定できます。データベースは <code>config/database.yml</code> の環境名のキーから選ばれ、環境ごとに別のファイルになりました。</p>
      <Figure n={figureNumber(99, 1)} title="環境ごとの一般的な用途" caption="表は生成直後の Rails アプリを読むための目安です。各プロジェクトで変更できます。設定値の実測は「環境ごとの設定」の節にあります。"><div className="table-wrap"><table><thead><tr><th scope="col">環境</th><th scope="col">用途</th><th scope="col">確認する設定</th></tr></thead><tbody>
        <tr><td>development</td><td>作業中の変更を確かめる</td><td>コードの再読み込み、エラーの詳細表示、開発用 DB</td></tr>
        <tr><td>test</td><td>自動テストの条件をそろえる</td><td>テスト用 DB、バックグラウンドジョブとメールのアダプター</td></tr>
        <tr><td>production</td><td>利用者からの要求を受ける</td><td>起動時の読み込み、詳細を公開しないエラー応答、外部サービスの接続先</td></tr>
      </tbody></table></div></Figure>
      <p>環境ごとに <code>enable_reloading</code> や <code>eager_load</code> の値がどう変わるかは、<ChapterLink n={7} section="environments" />で3つの環境の値を並べて確かめています。この章では、値をどこに書き、どう選ぶかを扱います。</p>
      <p>環境名は自分で増やせますが、名前を指定するだけでは動きません。<code>RAILS_ENV=staging</code> で起動すると、次のエラーになりました。</p>
      <Code lang="text" title="RAILS_ENV=staging bin/rails runner 'puts Rails.env' の出力（一部）" code={`
config.eager_load is set to nil. Please update your config/environments/*.rb files accordingly:

  * development - set it to false
  * test - set it to false (unless you use a tool that preloads your test environment)
  * production - set it to true

…: The \`staging\` database is not configured for the \`staging\` environment.
`} />
      <p><code>config/environments/staging.rb</code> がないので <code>eager_load</code> が設定されず、<code>database.yml</code> にも <code>staging</code> のキーがありません。環境を増やすと、環境設定のファイル、データベースの設定、環境別の credentials、Gemfile のグループなど、環境名で分けたものすべてに項目が必要になります。本番の確認用のサーバーは、環境を増やさずに production として起動し、接続先や送信先を環境変数で本番と別にする方法もあります。どちらの場合も、確認用のアプリが本番のデータベースやメールの送信先に接続しないことを、接続先の名前で確かめます。</p>
      <p>テストはレコードを作成し、終了時に変更を取り消したりテーブルを空にしたりします。接続先を誤ると、実際の利用者のデータを変更しかねません。環境を切り替えるコマンドでは <code>Rails.env</code> に加え、接続先のホストとデータベース名を確認します。</p>
    </> },
    { id: 'configuration', title: '共通設定・環境設定・初期化処理', body: <>
      <p>Rails の設定は主に次の3か所に書きます<Ref n={1} />。</p>
      <ul>
        <li><code>config/application.rb</code>：すべての環境に共通の設定。<code>class Application &lt; Rails::Application</code> の本体に <code>config.○○ = 値</code> の形で書きます。</li>
        <li><code>config/environments/環境名.rb</code>：その環境だけの設定。現在の環境と同じ名前のファイルだけが読まれ、<code>application.rb</code> と同じ項目を書いた場合はこちらの値が残ります。</li>
        <li><code>config/initializers/*.rb</code>：起動時に1回実行する初期化のファイル。すべての環境で実行されます。gem ごとの設定などをファイルに分けて置きます。</li>
      </ul>
      <p>これらのファイルが実行される順序を確かめるため、デモのアプリの各ファイルに、アプリ独自の値 <code>config.x.greeting</code> を代入して表示する行を足しました。<code>before_initialize</code>・<code>after_initialize</code>・<code>to_prepare</code> は、初期化の決まった時点で実行するブロックを登録するメソッドです。</p>
      <Code lang="ruby" title="足した行（config/application.rb のクラス本体、development.rb、initializers/greeting.rb）" code={`
# config/application.rb
config.x.greeting = "application.rb"
puts "[1] application.rb             x.greeting=#{config.x.greeting}"
config.before_initialize { puts "[3] before_initialize          x.greeting=#{config.x.greeting}" }
config.after_initialize do
  puts "[5] after_initialize           x.greeting=#{config.x.greeting}"
  puts "    config.log_level=#{config.log_level.inspect} Rails.logger.level=#{Rails.logger.level}"
end
config.to_prepare { puts "[6] to_prepare" }

# config/environments/development.rb の configure ブロック内
config.x.greeting = "development.rb"
puts "[2] environments/development.rb x.greeting=#{config.x.greeting}"

# config/initializers/greeting.rb
puts "[4] initializers/greeting.rb   x.greeting=#{Rails.configuration.x.greeting}"
Rails.application.config.log_level = :warn
`} />
      <Code lang="text" title="bin/rails runner script/show_env.rb の出力（development）" code={`
[1] application.rb             x.greeting=application.rb
[2] environments/development.rb x.greeting=development.rb
[3] before_initialize          x.greeting=development.rb
[4] initializers/greeting.rb   x.greeting=development.rb
[6] to_prepare
[5] after_initialize           x.greeting=development.rb
    config.log_level=:warn Rails.logger.level=0
Rails.env=development production?=false local?=true database=storage/development.sqlite3
`} />
      <Figure n={figureNumber(99, 2)} title="設定ファイルとフックが実行される順序" caption="上の実行結果をもとにした図です。各ファイルが初期化のどの処理の中で読まれるかは、起動の内部を扱う章で確かめています。">
        <LoadOrderFigure />
      </Figure>
      <p><code>application.rb</code> の値は <code>development.rb</code> で上書きされ、initializer の時点では上書き後の値が読めました。<code>to_prepare</code> は <code>after_initialize</code> より先に表示されています。注目するのは最後の行です。initializer で <code>config.log_level = :warn</code> を代入したので設定の値は <code>:warn</code> になりましたが、<code>Rails.logger.level</code> は debug を表す 0 のままでした。ロガーは環境設定のファイルを読んだ直後に作られ、そのときの <code>log_level</code> で決まります。initializer はその後に実行されるので、代入しても動いているロガーには反映されません。</p>
      <p>このように、設定の項目には、読まれる時点が決まっているものがあります。ロガー、キャッシュストア、ミドルウェアの構成などは、initializer より前に使われるので、<code>application.rb</code> か環境設定のファイルに書きます。どの項目がどの時点で読まれるかは <ChapterLink n={7} section="config-files" />で、initializer の並び順は <ChapterLink n={7} section="initializers" />で、railties のソースから確かめています。この章では、迷ったら <code>application.rb</code> と環境設定のファイルに書き、gem のクラスを設定するコードだけを initializer に置く、という目安で十分です。</p>
      <p><Term>initializer</Term> のファイルでは、ライブラリの設定や、アプリ全体で使うオブジェクトを登録します。初期化の途中でアプリケーションの自動再読み込みの対象のクラスを保持すると、ファイルを変更した後に古いクラスへの参照が残ることがあります。起動時に1回だけでよい処理と、再読み込みに合わせて行う処理を区別します。後者には <code>to_prepare</code> を使い、ブロックが複数回実行されても結果が壊れない書き方にします。</p>
      <p>外部サービスと通信する設定を initializer に追加するときは、起動に通信が必要かを考えます。API の URL の読み取りと書式の検査だけを先に行い、実際の接続は要求を処理する時点に遅らせる設計もあります。この場合、配備時には設定の不足に気づけ、外部 API が一時的に応答しなくても、外部連携と無関係な要求はアプリケーションで処理できます。</p>
    </> },
    { id: 'custom-config', title: 'アプリ独自の設定：config.x と config_for', body: <>
      <p>外部 API の URL やタイムアウトの秒数のように、アプリ独自の設定値を置く場所として、Rails は <code>config.x</code> を用意しています<Ref n={1} />。<code>config.x.delivery.timeout = 5</code> のように、<code>x</code> の後に任意の名前を2段まで続けて代入でき、どこからでも <code>Rails.configuration.x.delivery.timeout</code> で読めます。前の節の <code>config.x.greeting</code> もこの使い方でした。</p>
      <p>値が多いときや、環境ごとに違うときは、YAML のファイルにまとめて <code>config_for</code> で読み込めます。<code>config_for(:delivery)</code> は <code>config/delivery.yml</code> を読み、<code>shared</code> のキーと現在の環境のキーを合わせたものを返します<Ref n={6} />。</p>
      <Code lang="yaml" title="config/delivery.yml" code={`
shared:
  timeout: 5
  retries: 2

development:
  base_url: http://localhost:4000

test:
  base_url: http://delivery.test
  retries: 0

production:
  base_url: <%= ENV["DELIVERY_API_URL"] %>
`} />
      <Code lang="ruby" title="config/application.rb のクラス本体に足した行と、script/show_config.rb" code={`
config.x.delivery = config_for(:delivery)

# script/show_config.rb
d = Rails.configuration.x.delivery
puts "env=#{Rails.env} delivery=#{d.to_h.inspect} class=#{d.class}"
puts "timeout=#{d.timeout.inspect} missing=#{d.missing.inspect} x.nothing=#{Rails.configuration.x.nothing.inspect}"
begin
  d.missing!
rescue => e
  puts "missing! => #{e.class}: #{e.message}"
end
`} />
      <Code lang="text" title="3つの環境で実行した結果" code={`
env=development delivery={timeout: 5, retries: 2, base_url: "http://localhost:4000"} class=ActiveSupport::OrderedOptions
timeout=5 missing=nil x.nothing=#<ActiveSupport::OrderedOptions {}>
missing! => KeyError: :missing is blank
env=test delivery={timeout: 5, retries: 0, base_url: "http://delivery.test"} class=ActiveSupport::OrderedOptions
env=production delivery={timeout: 5, retries: 2, base_url: "https://delivery.example"} class=ActiveSupport::OrderedOptions

$ RAILS_ENV=production bin/rails runner 'p Rails.configuration.x.delivery.base_url'
nil
`} />
      <p>test では <code>retries</code> が <code>shared</code> の 2 から 0 に上書きされ、production では起動時に渡した <code>DELIVERY_API_URL=https://delivery.example</code> が入りました（図 {figureNumber(99, 3)}）。返り値は <code>ActiveSupport::OrderedOptions</code> で、ハッシュのキーをメソッドのように呼べます<Ref n={15} />。存在しないキーを読むと例外にならずに <code>nil</code> が返り、<code>config.x</code> の未設定の名前は空の <code>OrderedOptions</code> を返しました。キー名を書き間違えても気づきにくいので、必須の値は <code>missing!</code> のように末尾に <code>!</code> を付けて読むと、値が空のときに <code>KeyError</code> になります。最後の実行のように、production で環境変数を渡し忘れると <code>base_url</code> は <code>nil</code> になり、起動は成功します。</p>
      <Figure n={figureNumber(99, 3)} title="config_for が shared と環境のキーを合わせる" caption="上の config/delivery.yml と実行結果をもとにした図。shared と環境のキーは deep_merge で合わせるので、入れ子のハッシュも1段ずつ上書きされます。">
        <ConfigForFigure />
      </Figure>
      <p>最初は production の行を <code>{'<%= ENV.fetch("DELIVERY_API_URL") %>'}</code> と書いていました。<code>fetch</code> なら、本番で環境変数がないときに起動を止められると考えたためです。ところが、環境変数を渡さずに development で起動すると、次の例外で起動できませんでした。</p>
      <Code lang="text" title="production の行に ENV.fetch を書いたときの development の起動" code={`
/work/demo/config/delivery.yml:13:in 'fetch': key not found: "DELIVERY_API_URL" (KeyError)
	from /work/demo/config/delivery.yml:13:in '<main>'
	…
	from /usr/local/bundle/gems/railties-8.1.4.1/lib/rails/application.rb:291:in 'Rails::Application#config_for'
`} />
      <p><code>config_for</code> は、ファイル全体を ERB として評価してから YAML として読み、その後で現在の環境のキーを取り出します。そのため、production の行の ERB も development で実行されます。本番でだけ必須の値は、YAML の中では <code>ENV[...]</code> で読み、<code>config/environments/production.rb</code> か、その値を使う直前で <code>!</code> 付きのメソッドや <code>presence</code> で確かめます。</p>
      <p><code>config.x</code> と <code>config_for</code> はどちらも設定をコードの中の1か所に集める機能です。値そのものを秘密にする機能はありません。YAML に API キーを書くとリポジトリに入るので、秘密の値は後の節の credentials か環境変数で渡します。</p>
    </> },
    { id: 'load-defaults', title: 'load_defaults で既定値をそろえる', body: <>
      <p>Rails は新しいバージョンで、設定の既定値を変えることがあります。既定値をそのまま変えると、アップグレードしたアプリの動作が予告なく変わります。そこで Rails は、新しい既定値を <code>config.load_defaults</code> の引数のバージョンに結び付けています<Ref n={9} />。<code>rails new</code> は <code>application.rb</code> に、生成したときの Rails のバージョンを書きます。</p>
      <Code lang="ruby" title="config/application.rb（rails new が書いた行）" code={`
config.load_defaults 8.1
`} />
      <p><code>load_defaults 8.1</code> は、8.1 で変わった既定値だけでなく、5.0 から 8.1 までの各バージョンの既定値を古い順に適用します。その仕組みは <ChapterLink n={7} section="app-class" />で railties のソースから読んでいます。ここでは、引数を 8.0 と 8.1 にしたときに値がどう違うかを、デモのアプリで比べました。<code>application.rb</code> の行を <code>config.load_defaults ENV.fetch("DEFAULTS", "8.1")</code> に変えて、development で実行しています。</p>
      <Code lang="text" title="DEFAULTS=8.0 と 8.1 で設定を表示した結果" code={`
loaded=8.0 yjit=true  relative_redirect=:log   escape_json=nil   render_tracker=nil
loaded=8.1 yjit=false relative_redirect=:raise escape_json=false render_tracker=:ruby
`} />
      <p>8.1 では、パスの相対指定のリダイレクトを例外にする設定（<code>action_on_path_relative_redirect</code>）が <code>:raise</code> になり、JSON の応答で一部の文字をエスケープしない設定などが加わりました。<code>yjit</code> は、8.1 の既定値が <code>!Rails.env.local?</code> なので development では false です。8.0 で <code>nil</code> の項目は、<code>load_defaults</code> が値を設定せず、各フレームワークの古い動作のままになる項目です。</p>
      <p>Rails をアップグレードするときは、<code>load_defaults</code> の数字を一度に上げず、次の順に進める方法が Rails のガイドで示されています<Ref n={9} />。<code>bin/rails app:update</code> を実行すると、<code>config/initializers/new_framework_defaults_8_1.rb</code> のように、新しい既定値を1行ずつコメントにしたファイルが作られます。コメントを1つずつ外して動作を確かめ、すべて有効にできたら <code>load_defaults</code> の数字を上げてそのファイルを消します。数字を上げずに Rails のバージョンだけ上げた状態でも、アプリは古い既定値で動きます。そのまま長く放置すると、新しい既定値を前提にした gem や記事の説明と動作が合わなくなります。バージョンごとの違いは <ChapterLink n={29} />にまとめています。</p>
    </> },
    { id: 'env-vars', title: '環境変数で値を渡す', body: <>
      <p><Term>環境変数</Term>はプロセスを起動するときに外から渡す名前と値の組です。シェルで <code>DELIVERY_API_URL=https://… bin/rails server</code> と書いたり、Docker の <code>-e</code>、systemd のユニットファイルの <code>Environment=</code>、配備ツールの設定で指定したりします。Ruby では <code>ENV</code> から読めます<Ref n={14} />。同じコードとコンテナイメージを、環境変数だけ変えて検証用と本番用に使い分けられるので、接続先や外部サービスの URL を渡すのに向いています。</p>
      <p>環境変数の値は常に文字列です。<code>FEATURE_X=false</code> と <code>RETRY=3x</code> を渡して、Ruby で読みました。</p>
      <Code lang="ruby" title="env_demo.rb と実行結果（docker run -e FEATURE_X=false -e RETRY=3x ruby:4.0 ruby env_demo.rb）" code={`
v = ENV["FEATURE_X"]
p v                                          # => "false"
puts(v ? "if で見ると有効" : "if で見ると無効")  # => if で見ると有効
p ActiveModel::Type::Boolean.new.cast(v)     # => false
p ENV["RETRY"], ENV["RETRY"].to_i            # => "3x", 3
p Integer(ENV["RETRY"], exception: false)    # => nil
ENV.fetch("DELIVERY_API_URL")                # => KeyError: key not found: "DELIVERY_API_URL"
p ENV.fetch("DELIVERY_API_URL", "http://localhost:4000")  # => "http://localhost:4000"
`} />
      <p>Ruby では <code>nil</code> と <code>false</code> 以外はすべて真なので、文字列の <code>"false"</code> は <code>if</code> で有効と判定されました。真偽値として使うときは <code>ActiveModel::Type::Boolean</code> のように、<code>"false"</code> や <code>"0"</code> を false にする変換を通します。<code>to_i</code> は <code>"3x"</code> を 3 にして誤りを隠すので、数値の検査には <code>Integer(…, exception: false)</code> を使い、<code>nil</code> なら起動を止めるといった扱いを決めます。<code>ENV.fetch</code> は、値がないときに例外を起こすか、2つ目の引数の既定値を返します。</p>
      <p>既定値を付けるかどうかは、その値がないときに代わりの動作を許すかで決めます。開発環境で外部サービスの代わりにローカルの URL を使ってよいなら、既定値を付けます。本番で必須の値に既定値を付けると、渡し忘れても起動が成功し、最初の要求で誤った接続先に送ります。この場合は既定値を付けず、起動時に止めます。外部連携を使わないプロセス（ジョブの実行プロセスなど）も同じアプリを起動するなら、その連携を使う手前で検証する設計もあります。</p>
      <Code lang="ruby" title="config/environments/production.rb の設定ブロック内" code={`
config.x.delivery.base_url = ENV.fetch("DELIVERY_API_URL")
`} />
      <p>データベースの接続先は <code>DATABASE_URL</code> でも渡せます。<code>config/database.yml</code> にも設定があるときは両方を合わせ、同じ項目は原則として URL 側が優先されます。<code>url:</code> を <code>database.yml</code> に明示して接続先を指定する方法もあります。実際にどちらが使われたかは、最後の「実際に適用された値を確かめる」の節の方法で確かめます。</p>
      <p>環境変数を指定したこと自体で値が暗号化されるわけではありません。同じマシンで動く別のプロセスや、診断のために環境変数を一覧で出力する機能から、値が見えることがあります。API キーのような値を環境変数で渡す場合は、配備基盤の秘密管理サービスに保存し、ログや診断の出力に値が含まれる経路を確認します。接続先の URL に認証情報が含まれる場合、その URL も秘密として扱います。</p>
    </> },
    { id: 'credentials', title: '秘密の値を credentials に置く', body: <>
      <p>Rails の <Term>credentials</Term> は秘密の値を暗号化したファイルに保存し、アプリの起動後に復号して読む機能です<Ref n={2} />。暗号化したファイル（<code>config/credentials.yml.enc</code>）はリポジトリに入れ、復号の鍵（<code>config/master.key</code>）はリポジトリに入れずに配備環境へ別に渡します。<code>rails new</code> は両方を作ります。鍵のファイルは <code>.gitignore</code> に書いて、リポジトリに含めません。</p>
      <Code lang="text" title="credentials の中身と、暗号化したファイル（値の一部を省略）" code={`
$ bin/rails credentials:show
secret_key_base: 3f2962af57b1…

$ cat config/credentials.yml.enc
9HRgSbeVi+kmZmdHHETQSJ+m8Oh178l4P8OuBZJFyIoG7CInwmeuy/droMoAUZhnFP7k3KK9…--…--…
`} />
      <p><code>credentials:show</code> は鍵で復号した YAML を表示します。<code>rails new</code> の直後は、Cookie の署名や暗号化の鍵を作るための <code>secret_key_base</code> だけが入っています（<ChapterLink n={21} section="secrets" />）。暗号化したファイルは、暗号文・初期化ベクトル・認証タグを <code>--</code> でつないだ1行で、鍵がなければ中身を読めません。値を足すときは <code>bin/rails credentials:edit</code> を実行します。環境変数 <code>EDITOR</code> のエディターで復号した一時ファイルが開き、保存すると暗号化し直して <code>.enc</code> のファイルを更新します。</p>
      <p>環境ごとに別の credentials も作れます。実験では、エディターの代わりに、一時ファイルの末尾に YAML を書き足す小さな Ruby スクリプトを <code>EDITOR</code> に指定しました。共通の credentials に <code>delivery.api_key: global-key</code> を、production 用に <code>prod-key</code> を足しています。</p>
      <Code lang="text" title="bin/rails credentials:edit --environment production の出力（一部）" code={`
Adding config/credentials/production.key to store the encryption key: 4f2e3b8e…

Save this in a password manager your team can access.

If you lose the key, no one, including you, can access anything encrypted with it.

      create  config/credentials/production.key
IMPORTANT: Don't commit config/credentials/production.key. Add this to your ignore file:
/config/credentials/*.key

Editing config/credentials/production.yml.enc...
File encrypted and saved.
`} />
      <p>production 用の鍵 <code>config/credentials/production.key</code> と、暗号化したファイル <code>production.yml.enc</code> が作られました。新しく作った production の credentials には、共通のものとは別の <code>secret_key_base</code> が入っていました。3つの環境で <code>api_key</code> と <code>secret_key_base</code> の先頭を表示しました。</p>
      <Code lang="text" title="各環境で credentials を読んだ結果" code={`
$ bin/rails runner 'p [Rails.env, Rails.application.credentials.dig(:delivery, :api_key),
                       Rails.application.credentials.secret_key_base.to_s[0,8]]'
["development", "global-key", "3f2962af"]
["test", "global-key", "3f2962af"]
["production", "prod-key", "8cec3e19"]

# production.key を移動して production で実行
…'ActiveSupport::Messages::Codec#catch_and_raise': AEAD authentication tag verification failed (ActiveSupport::MessageEncryptor::InvalidMessage)

# RAILS_MASTER_KEY に誤った鍵を渡して production で実行
…'ActiveSupport::Messages::Codec#catch_and_raise': AEAD authentication tag verification failed (ActiveSupport::MessageEncryptor::InvalidMessage)
`} />
      <Figure n={figureNumber(99, 4)} title="環境ごとに読む credentials のファイルと鍵" caption="上の実行結果と railties の credentials_defaults をもとにした図です。">
        <CredentialsFigure />
      </Figure>
      <p>production は <code>production.yml.enc</code> だけを読み、共通のファイルの値とは合わせませんでした。共通のファイルにだけ書いた値は、production からは読めません。<code>secret_key_base</code> も production 用のものに変わるので、共通のファイルから環境別のファイルに切り替えると、本番で発行済みの Cookie のセッションは復号できなくなり、利用者はログインし直します。</p>
      <p>鍵のファイルを移動すると、例外が起きました。Rails は環境別の鍵のファイルがなければ <code>config/master.key</code> を使います<Ref n={7} />。共通の鍵で production 用のファイルを復号しようとして、認証タグが合わずに失敗しています。誤った鍵を <code>RAILS_MASTER_KEY</code> で渡したときも同じ例外です。どちらの場合も「鍵が見つからない」という表示にならないので、<code>InvalidMessage</code> を見たら、使われた鍵のファイルと環境変数を確かめます。</p>
      <Code lang="ruby" title="railties/lib/rails/application/configuration.rb（643〜650行目）" href={`${GH}/railties/lib/rails/application/configuration.rb#L643-L650`} code={`
def credentials_defaults
  content_path = root.join("config/credentials/#{Rails.env}.yml.enc")
  content_path = root.join("config/credentials.yml.enc") if !content_path.exist?

  key_path = root.join("config/credentials/#{Rails.env}.key")
  key_path = root.join("config/master.key") if !key_path.exist?

  { content_path: content_path, key_path: key_path }
end
`} />
      <p>本番の <code>secret_key_base</code> は、環境変数 <code>SECRET_KEY_BASE</code> があればそれを、なければ credentials の値を使います<Ref n={8} />。development と test でどちらもなければ、Rails が <code>tmp/local_secret.txt</code> に作った値を使います。</p>
      <p>暗号化したファイルと鍵を同じ場所に置くと、その場所にアクセスできる人が復号できます。リポジトリを読める人と本番の鍵を持つ人の範囲を分けたいなら、環境別の credentials にして、本番の鍵だけを配備環境に渡します。秘密を誤ってログやリポジトリに出したときは、記録を削除してもすでに読み取られた値を使えます。値を失効させ、新しい値に更新してから、古い値で接続できないことを確認します。アプリ側で扱う秘密の範囲は <ChapterLink n={21} section="secrets" />で扱います。</p>
    </> },
    { id: 'dependencies', title: 'Gemfile と Gemfile.lock', body: <>
      <p>Ruby のライブラリを配る単位を<Term>gem</Term>と呼びます。<code>Gemfile</code> には Rails やデータベースのアダプターなど、アプリが直接使う gem と、許すバージョンの範囲を書きます<Ref n={12} />。Bundler は、各 gem がさらに必要とする gem の条件も調べ、すべての条件を満たすバージョンの組み合わせを決めます。決めた結果を書いたファイルが <code>Gemfile.lock</code> です<Ref n={3} />。<code>require</code> と <code>bundle exec</code> が読み込みパスをどう変えるかは <ChapterLink n={7} section="gems" />で扱います。</p>
      <Code lang="ruby" title="Gemfile（rails new demo --minimal が作ったもの。コメントを省略）" code={`
source "https://rubygems.org"

gem "rails", "~> 8.1.4", ">= 8.1.4.1"
gem "propshaft"
gem "sqlite3", ">= 2.1"
gem "puma", ">= 5.0"
gem "tzinfo-data", platforms: %i[ windows jruby ]

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
end
`} />
      <p><code>gem</code> の後ろは gem の名前と、使ってよいバージョンの条件です。条件を書かない <code>propshaft</code> はどのバージョンでもよいという意味です。<code>platforms:</code> は、その gem を入れる Ruby の実装や OS を絞ります。<code>tzinfo-data</code> はタイムゾーンの情報を持たない Windows などでだけ使います。<code>group</code> は用途で gem を分け、<code>require:</code> は <code>Bundler.require</code> が gem を読み込むときのファイル名を指定します。</p>
      <p>Gemfile に書いたのは6個ですが、<code>bundle install</code> が作った <code>Gemfile.lock</code> には、依存する gem を含めて90行の gem が並びました。</p>
      <Code lang="text" title="Gemfile.lock（抜粋）" code={`
GEM
  remote: https://rubygems.org/
  specs:
    puma (8.0.2)
      nio4r (~> 2.0)
    racc (1.8.1)
    rack (3.2.8)

PLATFORMS
  aarch64-linux-gnu
  x86_64-linux-gnu
  …（8種類）

DEPENDENCIES
  debug
  propshaft
  puma (>= 5.0)
  rails (~> 8.1.4, >= 8.1.4.1)
  sqlite3 (>= 2.1)
  tzinfo-data

CHECKSUMS
  puma (8.0.2) sha256=c8ed871dfbbe66448ea9ffd46692342d9804d4071522b52b5331b7b6e7b686fb

BUNDLED WITH
  4.0.20
`} />
      <Figure n={figureNumber(99, 5)} title="Gemfile と Gemfile.lock の構造" caption="デモのアプリの Gemfile と Gemfile.lock をもとにした図です。">
        <LockFigure />
      </Figure>
      <p><code>GEM</code> の <code>specs</code> では、字下げが4つの行が選ばれた gem とそのバージョン、6つの行がその gem の依存の条件です。puma 8.0.2 は nio4r の 2.x を必要とし、選ばれた nio4r の行は別にあります。<code>PLATFORMS</code> はどの OS と CPU 向けに解決したかの一覧です。<code>DEPENDENCIES</code> は Gemfile の指定の写しで、Gemfile が変わったかを Bundler が判定するのに使います。<code>CHECKSUMS</code> には gem のファイルのハッシュ値が入り、ダウンロードした gem が記録と同じ内容かを確かめます。</p>
      <p>アプリでは、開発・CI・配備で同じ組み合わせを使えるよう、Gemfile と Gemfile.lock の両方をリポジトリに入れます。ロックファイルが有効な状態で <code>bundle install</code> すると、新しいバージョンが公開されていても、ロック済みの組み合わせをインストールします。開発者のマシンが macOS の arm64、本番が Linux の x86_64 のように異なる場合は、<code>PLATFORMS</code> に両方があるかを確かめます。足りないときは <code>bundle lock --add-platform x86_64-linux</code> のように追加します。</p>
      <p>ロックファイルで gem の組み合わせは固定できますが、それだけで Ruby 本体が同じになるわけではありません。<code>.ruby-version</code>（デモでは <code>ruby-4.0.9</code>）を読むバージョン管理ツールや、コンテナイメージの指定で Ruby をそろえます。C で書かれた拡張を含む gem では、ビルドに必要なライブラリの有無も配備の成否に関わります。<code>bundle install</code> の失敗を調べるときは、依存関係を解けない場合と、決めた gem を対象環境でインストールできない場合を区別します。</p>
      <p>開発用やテスト用の gem は、本番で読み込む必要がないことがあります。グループを指定しても本番のインストールから外れるとは限りません。インストール時の <code>without</code> 設定（<code>BUNDLE_WITHOUT=development:test</code> など）と、起動時に <code>Bundler.require(*Rails.groups)</code> がどのグループを読み込むかの両方を確認します。</p>
    </> },
    { id: 'versions', title: 'バージョンの指定と ~>', body: <>
      <p>gem のバージョンは <code>8.1.4.1</code> のように、点で区切った数字の並びです。多くの gem は先頭から順にメジャー・マイナー・パッチと呼ぶ<Term>セマンティックバージョニング</Term>の考え方に沿って番号を付けます。互換性のない変更でメジャーを、機能の追加でマイナーを、不具合の修正でパッチを上げます。ただし、これは gem の作者の約束で、RubyGems が強制するものではありません。Rails のように4つ目の数字を使う gem もあります。</p>
      <p>Gemfile の条件で最もよく使うのが <code>~&gt;</code> です。<code>~&gt; 8.1.4</code> は「8.1.4 以上、最後の数字を除いた 8.1 の次の 8.2 未満」を表し、悲観的なバージョン制約とも呼ばれます<Ref n={13} />。デモのアプリで、4つの条件を7つのバージョンに当てはめました。</p>
      <Code lang="ruby" title="script/requirement.rb と実行結果" code={`
versions = %w[8.0.9 8.1.3 8.1.4 8.1.4.1 8.1.9 8.2.0 9.0.0]
[["~> 8.1"], ["~> 8.1.4"], ["~> 8.1.4", ">= 8.1.4.1"], ["~> 8.1.4.0"]].each do |req|
  r = Gem::Requirement.new(*req)
  ok = versions.select { |v| r.satisfied_by?(Gem::Version.new(v)) }
  puts format("%-26s %s", req.join(", "), ok.join(" "))
end

# ~> 8.1                     8.1.3 8.1.4 8.1.4.1 8.1.9 8.2.0
# ~> 8.1.4                   8.1.4 8.1.4.1 8.1.9
# ~> 8.1.4, >= 8.1.4.1       8.1.4.1 8.1.9
# ~> 8.1.4.0                 8.1.4 8.1.4.1
`} />
      <Figure n={figureNumber(99, 6)} title="バージョンの条件が許す範囲" caption="上の実行結果を数直線に並べた図です。目盛りの間隔はバージョンの差の大きさを表しません。">
        <RequirementFigure />
      </Figure>
      <p><code>~&gt; 8.1</code> は数字が2つなので、最後の 1 を除いた 8 の次の 9.0 未満まで許し、8.2.0 も含みました。<code>~&gt; 8.1.4</code> は 8.2 未満なので、8.1 の範囲のパッチだけを受け入れます。<code>rails new</code> が書く <code>"~&gt; 8.1.4", "&gt;= 8.1.4.1"</code> は、2つの条件の両方を満たすバージョン、つまり 8.1.4.1 以上 8.2 未満です。<code>~&gt; 8.1.4.0</code> のように数字を1つ増やすと、範囲は 8.1.5 未満に狭まります。数字の個数で範囲が変わるので、<code>~&gt;</code> を書くときは、最後の数字を除いた部分が上限を決めることを確かめます。</p>
      <p>条件の書き方は、その gem のバージョンの付け方と、更新のときにどこまで確かめるかで決めます。Rails 本体のように、マイナーバージョンの更新で設定やアップグレードの作業が要るものは、<code>~&gt; 8.1.4</code> のようにマイナーまで固定します。条件を書かない gem や <code>&gt;= 5.0</code> だけの gem は、<code>bundle update</code> で大きく上がることがあります。次の節の実験では、<code>"&gt;= 5.0"</code> を指定した puma が、8.0 から 8.1 に上がりました。</p>
    </> },
    { id: 'bundle-commands', title: 'bundle install・update・outdated の違い', body: <>
      <p>Bundler の主なコマンドは、ロックファイルを書き換えるかどうかで分かれます。<code>bundle install</code> は Gemfile.lock に記録された組み合わせをインストールし、Gemfile が変わった部分だけを解決し直します。<code>bundle update</code> は、指定した gem（指定しなければすべて）を、Gemfile の条件の範囲で新しいバージョンに解決し直します<Ref n={10} />。<code>bundle outdated</code> は何も変えずに、新しいバージョンがある gem を一覧にします<Ref n={11} />。</p>
      <p>Gemfile に <code>gem "faraday", "~&gt; 2.14.0"</code> を足して <code>bundle install</code> すると、faraday と、それが必要とする2つの gem がロックファイルに加わりました。ほかの gem のバージョンは変わっていません。</p>
      <Code lang="text" title="gem を1つ足した bundle install と、Gemfile.lock の差分（CHECKSUMS を省略）" code={`
Fetching faraday 2.14.4
Fetching faraday-net_http 3.4.4
Fetching net-http 0.10.0
Installing faraday 2.14.4
Installing faraday-net_http 3.4.4
Installing net-http 0.10.0

>     faraday (2.14.4)
>       faraday-net_http (>= 2.0, < 3.5)
>       json
>       logger
>     faraday-net_http (3.4.4)
>       net-http (~> 0.5)
>     net-http (0.10.0)
>       net-protocol (>= 0.3.0)
>       uri (>= 0.11.1)
>   faraday (~> 2.14.0)
`} />
      <p>CI や本番の配備では、ロックファイルを書き換えないことを保証したい場面があります。<code>BUNDLE_FROZEN=true</code>（または <code>bundle config set frozen true</code>）を設定すると、Gemfile とロックファイルが合わないときに Bundler は解決をせずに止まります<Ref n={3} />。faraday を足した Gemfile を、元のロックファイルのまま試しました。</p>
      <Code lang="text" title="BUNDLE_FROZEN=true bundle install の出力" code={`
The dependencies in your gemfile changed, but the lockfile can't be updated
because frozen mode is set

You have added to the Gemfile:
* faraday (~> 2.14.0)

Run \`bundle install\` elsewhere and add the updated Gemfile.lock to version
control.
$ echo $?
16
`} />
      <p>終了コードは 16 で、CI はここで失敗として止まります。ロックファイルの更新を忘れたまま Gemfile だけを変えたコミットを、配備の前に見つけられます。</p>
      <p>次に、デモのアプリで更新できる gem を調べました。</p>
      <Code lang="text" title="bundle outdated と bundle outdated --only-explicit の出力（2026年11月27日に実行）" code={`
$ bundle outdated
Gem     Current  Latest  Requested  Groups   Release Date
marcel  1.2.1    2.1.0
nio4r   2.7.4    2.7.5
puma    8.0.2    8.1.3   >= 5.0     default  2026-11-24
rack    3.2.8    3.2.9

$ bundle outdated --only-explicit
Gem   Current  Latest  Requested  Groups   Release Date
puma  8.0.2    8.1.3   >= 5.0     default  2026-11-24
`} />
      <p><code>Requested</code> の列に Gemfile の条件が出る puma は Gemfile に直接書いた gem で、ほかの3つは依存で入った gem です。<code>--only-explicit</code> を付けると、Gemfile に書いた gem だけに絞れます。古いものがあると終了コードは 1 になりました。続けて、<code>bundle update</code> の範囲の指定を変えて実行し、毎回ロックファイルを元に戻して差分を比べました。</p>
      <Figure n={figureNumber(99, 7)} title="bundle update の指定とロックファイルの変化" caption="デモのアプリで、同じ Gemfile.lock から始めて実行した結果です。">
        <div className="table-wrap"><table><thead><tr><th scope="col">コマンド</th><th scope="col">puma</th><th scope="col">nio4r</th><th scope="col">rack</th><th scope="col">marcel</th></tr></thead><tbody>
          <tr><td><code>bundle install</code>（Gemfile を変えない）</td><td>8.0.2</td><td>2.7.4</td><td>3.2.8</td><td>1.2.1</td></tr>
          <tr><td><code>bundle update --conservative puma</code></td><td>8.1.3</td><td>2.7.4</td><td>3.2.8</td><td>1.2.1</td></tr>
          <tr><td><code>bundle update puma</code></td><td>8.1.3</td><td>2.7.5</td><td>3.2.8</td><td>1.2.1</td></tr>
          <tr><td><code>bundle update --patch</code></td><td>8.0.5</td><td>2.7.5</td><td>3.2.9</td><td>1.2.1</td></tr>
          <tr><td><code>bundle update</code>（すべて）</td><td>8.1.3</td><td>2.7.5</td><td>3.2.9</td><td>1.2.1</td></tr>
        </tbody></table></div>
      </Figure>
      <p><code>bundle update puma</code> は puma だけでなく、puma が依存する nio4r も上げました。依存する gem も更新の対象にするためです。<code>--conservative</code> を付けると、名前を指定した gem だけを上げ、共有する依存は条件を満たす限り元のままにします。<code>--patch</code> はすべての gem をパッチの範囲だけで上げるので、puma は 8.1.3 ではなく 8.0.5 になりました<Ref n={10} />。marcel は <code>bundle outdated</code> で 2.1.0 が出ていましたが、どの更新でも 1.2.1 のままでした。Gemfile.lock を見ると、activestorage 8.1.4.1 が <code>marcel (~&gt; 1.0)</code> を必要としています。最新のバージョンが一覧に出ても、依存の条件が許さなければ更新されません。</p>
      <p>更新の作業では、範囲を絞ったコマンドから使います。セキュリティの修正を取り込むだけなら、対象の gem を <code>--conservative</code> で上げ、差分がその gem だけであることを確かめます。まとめて上げるときは、ロックファイルの差分でバージョンが上がった gem を一覧にし、各 gem の変更履歴を読み、関連する機能のテストを実行します。<code>bundle update</code> を引数なしで実行すると多くの gem が同時に変わり、不具合が出たときに原因の gem を絞り込みにくくなります。</p>
    </> },
    { id: 'verify', title: '実際に適用された値を確かめる', body: <>
      <p>「設定ファイルに値がある」と「実行中のプロセスがその値を使う」は別の事実です。設定の節で見た <code>log_level</code> のように、設定の値が変わっても、動いているオブジェクトに反映されないこともあります。本番の設定を変更するときは、どのプロセスに値を渡したか、起動時にだけ読む設定か、再起動や配備が済んだかを確かめます。アプリケーションサーバーとジョブの実行プロセスは別々に起動する場合があるので、どちらにも必要な設定を配ります。調査で値を表示する場合は、秘密の値の中身を表示する代わりに「設定あり」といった判定だけを記録できます。</p>
      <Code lang="bash" title="依存関係と環境の確認" code={`
bundle check
RAILS_ENV=test bin/rails runner 'puts Rails.env'
`} />
      <p><code>bundle check</code> は Gemfile.lock の gem がすべてインストールされているかを調べます<Ref n={16} />。デモでは <code>The Gemfile's dependencies are satisfied</code> と表示されました。<code>rails runner</code> は Rails を起動して短い Ruby コードを実行します。本番の実行と同じ設定を読んでいるかを調べる際は、別のシェルで値を確認するだけでなく、本番プロセスと同じ環境変数や実行ユーザーを使っているかも確認します。</p>
      <h3>環境名と接続先を別々に確認する</h3>
      <p>デモのアプリでテスト環境の接続設定を比べます。<code>config/database.yml</code> の <code>test:</code> は <code>storage/test.sqlite3</code> を指しています。先頭のコマンドは実行するプロセスの環境から <code>DATABASE_URL</code> を外し、次のコマンドは別のファイルを指す URL を渡します。</p>
      <Code lang="bash" title="環境名、アダプター、データベース名を表示する" code={`env -u DATABASE_URL RAILS_ENV=test bin/rails runner '
  config = ActiveRecord::Base.connection_db_config
  puts [Rails.env, config.adapter, config.database].join(":")
'
# test:sqlite3:storage/test.sqlite3

DATABASE_URL=sqlite3:storage/check-target.sqlite3 RAILS_ENV=test bin/rails runner '
  config = ActiveRecord::Base.connection_db_config
  puts [Rails.env, config.adapter, config.database].join(":")
'
# test:sqlite3:storage/check-target.sqlite3`} />
      <p>どちらも環境名は <code>test</code> です。2つ目では <code>DATABASE_URL</code> に指定したファイルが接続先に選ばれました<Ref n={4} />。この方法で分かるのは Active Record が選んだ設定で、実際に接続できるかは DB を使う処理を別に実行して確かめます。本番の調査で出力する項目も、接続パスワードなどを含まないものに絞ります。</p>
      <p>この章で確かめた、設定の値が決まる順を図 {figureNumber(99, 8)} にまとめます。段階 1〜6 は development で1回起動したときの順序で、段階を進めると各時点で4つの値がどう変わるかを確かめられます。段階 7・8 には秘密の値と接続先を読むときに探す候補とその順番を示しました。</p>
      <Figure n={figureNumber(99, 8)} title="設定の値が決まる順（段階送り）" caption="この章の実行結果（development の起動の順序と値、production の credentials、test の接続先）と、railties の credentials_defaults・secret_key_base、Active Support の EncryptedFile#key をもとにした概念モデルです。実際の起動ではこれらの段階の間に gem やフレームワークの初期化も多数実行されます。段階 7・8 で強調した候補はこの章の実行で使われたもので、渡した環境変数やファイルの有無によって変わります。">
        <Stepper steps={configSteps} />
      </Figure>
      <p>本番用の外部 API の URL をテストが使ってしまう事例では、テストでも読める本番の秘密を先に減らせます。環境別の credentials にすれば、test 環境は production の鍵を持たないので、本番の API キーを読めません。テスト環境では呼び出しを偽のクライアントに差し替え、少数の連携テストだけを専用環境で動かす方法があります。通信の境界を差し替える方法は <ChapterLink n={101} section="tests">外部 API を使うコードの検証</ChapterLink>につながります。</p>
      <p>設定を変えた後に動作を確かめる際は、配備のログでどの設定が適用されたかを追えるようにします。実行環境、アプリのバージョン、秘密を含まない接続先の識別名などがあると、同じ URL への要求が異なる結果を返す理由を調べられます。開発環境のログで設定を確認できても、別のプロセスの実行状態までは分かりません。</p>
    </> },
    { id: 'judgment', title: '判断基準とトレードオフ', body: <>
      <p>設定値の置き場所は、値が秘密か、環境ごとに変わるか、誰がいつ変えるかで選びます。次の表はこの章で扱った置き場所を比べたものです。</p>
      <Figure n={figureNumber(99, 9)} title="値の性質と置き場所" caption="一般的な目安です。暗号化したファイルを保存する場合も、復号の鍵の発行・配備・失効を管理します。"><div className="table-wrap"><table><thead><tr><th scope="col">値の例</th><th scope="col">置き場所</th><th scope="col">変える方法と代償</th></tr></thead><tbody>
        <tr><td>処理の既定値（タイムアウトの秒数など）</td><td><code>application.rb</code>、<code>config.x</code>、<code>config_for</code> の <code>shared</code></td><td>コードレビューして配備。変更履歴が残る</td></tr>
        <tr><td>環境ごとに違うが秘密でない値（開発用の URL など）</td><td>環境設定のファイル、<code>config_for</code> の環境のキー</td><td>同上。本番の値をリポジトリに書くと、検証用の環境と取り違えやすい</td></tr>
        <tr><td>配備先ごとに違う接続先</td><td>環境変数</td><td>配備基盤の設定を変えて再起動。値は文字列で、渡し忘れの検査が要る</td></tr>
        <tr><td>API キー・パスワード</td><td>credentials（環境別）、または配備基盤の秘密管理</td><td>新しいキーを配備し、古いキーを失効。credentials は鍵の管理が要る</td></tr>
        <tr><td>gem のバージョン</td><td>Gemfile と Gemfile.lock</td><td><code>bundle update</code> と差分の確認。範囲を広げると更新の影響も広がる</td></tr>
      </tbody></table></div></Figure>
      <p>credentials と環境変数は、秘密の値の置き場所としてどちらも使えます。credentials は値がリポジトリに入るので、どの値をいつ変えたかがコミットの履歴に残り、配備基盤に渡すのは鍵1つで済みます。その代わり、値を変えるにはコミットと配備が必要で、鍵を持つ人は全部の値を読めます。環境変数や配備基盤の秘密管理は、コードを配備し直さずに値だけを入れ替えられ、値ごとに読める人を分けられます。その代わり、どの値がどこに設定されているかがリポジトリから見えないので、必須の値の一覧を README や起動時の検査で示します。</p>
      <p>環境別の credentials は、開発者が本番の秘密を読めないようにしたいときに使います。共通の credentials だけなら鍵が1つで済みますが、その鍵を持つ開発者は本番の API キーも読めます。前の節で見たように、環境別にすると共通の値は読まれないので、production 用のファイルに必要な値をすべて書きます。</p>
      <p>依存関係の更新は頻度と1回の幅のどちらを取るかの判断です。こまめに範囲を絞って更新すると1回の差分は小さく、原因を絞り込みやすくなりますが、更新する回数は増えます。まとめて更新すると作業の回数は減りますが、メジャーバージョンをまたぐ変更が重なり、Rails 本体のアップグレードのように <code>load_defaults</code> の見直しまで必要になることがあります。どちらの場合も、ロックファイルの差分をレビューの対象にし、CI では frozen の設定でロックファイルとの不一致を止めます。</p>
    </> },
    { id: 'related', title: '関連する章', body: <>
      <p>この章では設定と依存関係の使い方と判断を扱いました。起動の内部や、秘密の値の扱いの詳細はほかの章にあります。</p>
      <ul>
        <li><ChapterLink n={7} section="environments" />：3つの環境で設定の値を実測し、並べて比べます。</li>
        <li><ChapterLink n={7} section="gems" />：<code>require</code> と <code>bundle exec</code> が読み込みパスに何を加えるかを確かめます。</li>
        <li><ChapterLink n={7} section="app-class" />：<code>load_defaults</code> が各バージョンの既定値を順に適用する仕組みを読みます。</li>
        <li><ChapterLink n={7} section="config-files" />と<ChapterLink n={7} section="initializers" />：設定ファイルが初期化のどの時点で読まれるかを、railties のソースで追います。</li>
        <li><ChapterLink n={21} section="secrets" />：<code>secret_key_base</code> から Cookie の暗号化の鍵を作る仕組みを扱います。</li>
        <li><ChapterLink n={101} section="tests" />：外部 API の接続先をテストで差し替えます。</li>
        <li><ChapterLink n={29} />：Rails のバージョンごとの違いをまとめています。</li>
      </ul>
    </> },
  ],
  sources: [
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-27', version: 'Rails 8.1', note: '設定ファイル、config.x、config_for、データベースの接続設定、初期化の順序' },
    { title: 'Securing Rails Applications: Custom Credentials', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/security.html#custom-credentials', accessed: '2026-11-27', version: 'Rails 8.1', note: 'credentials の暗号化、復号鍵、環境別の credentials' },
    { title: 'bundle-install', publisher: 'Bundler', url: 'https://bundler.io/man/bundle-install.1.html', accessed: '2026-11-27', version: 'Bundler 4.0', note: '依存の解決、ロックされた構成のインストール、frozen' },
    { title: 'ActiveRecord::ConnectionHandling#connection_db_config', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/ConnectionHandling.html#method-i-connection_db_config', accessed: '2026-11-27', version: 'Rails 8.1', note: 'Active Record が選んだ接続設定を確認する' },
    { title: 'railties/lib/rails.rb', publisher: 'GitHub rails/rails', url: `${GH}/railties/lib/rails.rb#L74-L76`, accessed: '2026-11-27', version: 'v8.1.4.1', note: 'Rails.env を RAILS_ENV、RACK_ENV、development の順に決める' },
    { title: 'railties/lib/rails/application.rb', publisher: 'GitHub rails/rails', url: `${GH}/railties/lib/rails/application.rb#L286-L307`, accessed: '2026-11-27', version: 'v8.1.4.1', note: 'config_for が ERB を評価し、shared と環境のキーを合わせる' },
    { title: 'railties/lib/rails/application/configuration.rb（credentials_defaults）', publisher: 'GitHub rails/rails', url: `${GH}/railties/lib/rails/application/configuration.rb#L643-L650`, accessed: '2026-11-27', version: 'v8.1.4.1', note: '環境別の credentials と鍵のファイルの選び方' },
    { title: 'railties/lib/rails/application/configuration.rb（secret_key_base）', publisher: 'GitHub rails/rails', url: `${GH}/railties/lib/rails/application/configuration.rb#L523-L532`, accessed: '2026-11-27', version: 'v8.1.4.1', note: 'SECRET_KEY_BASE、credentials、ローカルの値の優先順' },
    { title: 'Upgrading Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/upgrading_ruby_on_rails.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'load_defaults と new_framework_defaults を使ったアップグレードの手順' },
    { title: 'bundle-update', publisher: 'Bundler', url: 'https://bundler.io/man/bundle-update.1.html', accessed: '2026-11-27', version: 'Bundler 4.0', note: '--conservative、--patch と依存の更新' },
    { title: 'bundle-outdated', publisher: 'Bundler', url: 'https://bundler.io/man/bundle-outdated.1.html', accessed: '2026-11-27', version: 'Bundler 4.0', note: '更新できる gem の一覧と --only-explicit' },
    { title: 'Gemfile', publisher: 'Bundler', url: 'https://bundler.io/man/gemfile.5.html', accessed: '2026-11-27', version: 'Bundler 4.0', note: 'gem、group、platforms、require の書き方' },
    { title: 'Patterns: Pessimistic version constraint', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/patterns/#pessimistic-version-constraint', accessed: '2026-11-27', note: '~> の範囲とセマンティックバージョニング' },
    { title: 'ENV', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/ENV.html', accessed: '2026-11-27', version: 'Ruby 4.0', note: '環境変数の値が文字列であること、ENV.fetch' },
    { title: 'ActiveSupport::OrderedOptions', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/OrderedOptions.html', accessed: '2026-11-27', version: 'Rails 8.1', note: 'キーをメソッドで読む、! 付きで空の値を例外にする' },
    { title: 'bundle-check', publisher: 'Bundler', url: 'https://bundler.io/man/bundle-check.1.html', accessed: '2026-11-27', version: 'Bundler 4.0', note: 'Gemfile の依存がインストール済みかを調べる' },
    { title: 'activesupport/lib/active_support/encrypted_file.rb（EncryptedFile#key）', publisher: 'GitHub rails/rails', url: `${GH}/activesupport/lib/active_support/encrypted_file.rb#L52-L54`, accessed: '2026-11-28', version: 'v8.1.4.1', note: '復号の鍵を環境変数 RAILS_MASTER_KEY、鍵のファイルの順に探す' },
  ],
}

export default chapter
