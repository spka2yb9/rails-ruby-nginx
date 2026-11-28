import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 65-1 場面の構成 ---------- */
function SceneFigure() {
  const rows: { y: number; lines: string[]; accent?: boolean }[] = [
    { y: 44, lines: ['OrdersController#confirm', 'rescue SokoLink::ApiError'] },
    { y: 104, lines: ['ConfirmOrderJob', 'retry_on SokoLink::ApiError'] },
    { y: 164, lines: ['Order#confirm!・#cancel!（注文の確定の規則）', 'SokoLink::Client.new・reserve・OutOfStockError'], accent: true },
    { y: 240, lines: ['spec（3つのファイル）', 'instance_double(SokoLink::Client)・Reservation'] },
  ]
  return (
    <Svg
      id="65-1"
      w={760}
      h={384}
      label="アプリの OrdersController#confirm は SokoLink::ApiError を rescue し、ConfirmOrderJob は retry_on SokoLink::ApiError を書き、Order#confirm! と #cancel! は SokoLink::Client を作って reserve と cancel を呼び、OutOfStockError を rescue する。3つのテストは instance_double(SokoLink::Client) と SokoLink::Reservation を使う。どれも SokoLink の SDK 1.4 に直接依存し、SDK が倉庫 API と通信する。SDK の名前を書いているファイルはアプリに3つ、テストに3つあり、SDK を更新すると6つとも直す"
    >
      <rect x={10} y={28} width={400} height={276} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={20} y={16} fs={12} tone="muted">
        アプリ（このサイトのコード）
      </T>
      {rows.map((r) => (
        <Box key={r.y} x={30} y={r.y} w={360} h={46} lines={r.lines} fs={12} accent={r.accent} subTone="danger" />
      ))}
      {rows.map((r, i) => (
        <Arrow key={`a${r.y}`} x1={390} y1={r.y + 23} x2={468} y2={160 + i * 10} />
      ))}
      <Box x={470} y={140} w={130} h={70} lines={['SokoLink SDK', '1.4（gem）']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={600} y1={175} x2={638} y2={175} />
      <Box x={640} y={140} w={110} h={70} lines={['倉庫 API', 'SokoLink 社']} fs={12} fill="box4" subTone="muted" />
      <T x={20} y={330} fs={12} tone="danger">
        SDK の名前を書いているファイル：アプリに3つ、テストに3つ
      </T>
      <T x={20} y={352} fs={12} tone="danger">
        SDK を更新すると、注文の規則が変わらなくても6つとも直す
      </T>
    </Svg>
  )
}

/* ---------- 図 65-3 依存の向き（逆転の前と後） ---------- */
function DirectionFigure() {
  return (
    <Svg
      id="65-3"
      w={760}
      h={420}
      label="適用前は、上位の Order#confirm! が下位の SokoLink::Client（SDK 1.4）に依存し、依存の矢印が上位から下位へ境界を越える。SDK は倉庫 API を呼ぶ。SDK が変わると Order も変わる。適用後は、Order#confirm! は上位の側に置いた取り決め Inventory だけを使い、下位の Inventory::SokoLinkWarehouse が Inventory を満たす。境界を越える矢印は下位から上位へ向く。SokoLinkWarehouse が SDK を使い、SDK が倉庫 API を呼ぶ。SDK が変わっても Order は変わらない"
    >
      <T x={20} y={18} bold>
        適用前
      </T>
      <T x={20} y={46} fs={12} tone="muted">
        上位：注文の側
      </T>
      <Box x={40} y={62} w={200} h={50} lines={['Order#confirm!', '注文の確定の規則']} fs={12} subTone="muted" />
      <line x1={20} y1={150} x2={365} y2={150} stroke="var(--fig-line)" strokeDasharray="6 4" />
      <T x={365} y={140} fs={11} anchor="end" tone="muted">
        境界
      </T>
      <T x={20} y={168} fs={12} tone="muted">
        下位：倉庫の側
      </T>
      <Arrow x1={140} y1={112} x2={140} y2={186} />
      <T x={150} y={128} fs={12} tone="danger">
        上位が下位に依存する
      </T>
      <Box x={40} y={188} w={200} h={50} lines={['SokoLink::Client', 'SDK 1.4']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={140} y1={238} x2={140} y2={286} />
      <Box x={40} y={288} w={200} h={44} lines="倉庫 API" fs={12} fill="box4" />
      <T x={20} y={372} fs={12} tone="danger">
        SDK が変わると Order も変わる
      </T>

      <line x1={385} y1={8} x2={385} y2={410} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={405} y={18} bold>
        適用後
      </T>
      <T x={405} y={46} fs={12} tone="muted">
        上位：注文の側
      </T>
      <Box x={410} y={62} w={160} h={50} lines={['Order#confirm!', '注文の確定の規則']} fs={12} subTone="muted" />
      <Box x={596} y={62} w={156} h={50} lines={['Inventory', '倉庫の取り決め']} fs={12} fill="box2" dashed bold subTone="muted" />
      <Arrow x1={570} y1={87} x2={594} y2={87} />
      <line x1={400} y1={150} x2={755} y2={150} stroke="var(--fig-line)" strokeDasharray="6 4" />
      <T x={405} y={168} fs={12} tone="muted">
        下位：倉庫の側
      </T>
      <Box x={596} y={188} w={156} h={50} lines={['SokoLinkWarehouse', 'Adapter']} fs={12} accent subTone="muted" />
      <Arrow x1={674} y1={188} x2={674} y2={114} dashed accent />
      <T x={664} y={128} fs={12} anchor="end" tone="acc">
        満たす（下位から上位へ）
      </T>
      <Arrow x1={674} y1={238} x2={674} y2={266} />
      <Box x={596} y={268} w={156} h={44} lines={['SokoLink::Client', 'SDK']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={674} y1={312} x2={674} y2={336} />
      <Box x={596} y={338} w={156} h={36} lines="倉庫 API" fs={12} fill="box4" />
      <T x={405} y={372} fs={12} tone="acc">
        SDK が変わっても Order は変わらない
      </T>
    </Svg>
  )
}

/* ---------- 図 65-4 上位の方針・取り決め・下位の詳細 ---------- */
function LayersFigure() {
  const cols: { x: number; head: string; fill: 'box5' | 'box2' | 'box4'; dashed?: boolean; items: string[][]; mono?: boolean; foot: string }[] = [
    {
      x: 10,
      head: '上位の方針（Order）',
      fill: 'box5',
      items: [['全商品を引き当てたら確定する'], ['1つでも足りなければ入荷待ち'], ['取り消したら引き当てを戻す'], ['倉庫が止まっていたら', '503 を返す・再試行する']],
      foot: '変えるのは：店の運営の決定',
    },
    {
      x: 275,
      head: '取り決め（Inventory）',
      fill: 'box2',
      dashed: true,
      items: [['reserve(order_ref:, lines:)'], ['→ Reserved か Shortage'], ['release(reservation_id)'], ['接続できない', '→ Inventory::Unavailable']],
      mono: true,
      foot: '上位が決め、上位の側に置く',
    },
    {
      x: 540,
      head: '下位の詳細（SokoLink の SDK）',
      fill: 'box4',
      items: [
        ['引き当てのメソッド', 'reserve → reservations.create'],
        ['明細のキー', 'sku・qty → item_code・quantity'],
        ['在庫不足の返し方', '例外 → state "rejected"'],
        ['接続できないときの例外', 'ApiError → Errors::Unavailable'],
      ],
      foot: '変えるのは：倉庫会社の SDK の更新',
    },
  ]
  return (
    <Svg
      id="65-4"
      w={780}
      h={300}
      label={`注文の確定を3つに分けた。${cols.map((c) => `${c.head}：${c.items.map((i) => i.join('')).join('、')}。${c.foot}`).join('。')}。上位の方針は取り決めを使い、下位の詳細は取り決めを満たす`}
    >
      {cols.map((c) => (
        <g key={c.head}>
          <Box x={c.x} y={10} w={230} h={36} lines={c.head} fs={12} fill={c.fill} dashed={c.dashed} bold />
          {c.items.map((it, i) => (
            <Box key={it[0]} x={c.x} y={58 + i * 48} w={230} h={40} lines={it} fs={11} fill="bg" align="start" mono={c.mono} />
          ))}
          <T x={c.x + 115} y={270} fs={12} anchor="middle" tone="muted">
            {c.foot}
          </T>
        </g>
      ))}
      <Arrow x1={240} y1={28} x2={273} y2={28} />
      <T x={256} y={48} fs={11} anchor="middle" tone="muted">
        使う
      </T>
      <Arrow x1={540} y1={28} x2={507} y2={28} dashed />
      <T x={524} y={48} fs={11} anchor="middle" tone="muted">
        満たす
      </T>
    </Svg>
  )
}

/* ---------- 図 65-5 DIP と DI の違い ---------- */
function DipDiFigure() {
  const cells: { x: number; y: number; lines: string[]; accent?: boolean }[] = [
    { x: 200, y: 52, lines: ['適用前の Order#confirm!', 'SokoLink::Client.new を中で呼ぶ', 'テスト：Client.new を書き換える', 'SDK 2.0：Order とテストを直す'] },
    { x: 490, y: 52, lines: ['DI だけを使った版', 'confirm!(client: SokoLink::Client.new)', 'テスト：SDK の代役を引数で渡す', 'SDK 2.0：Order とテストを直す'] },
    { x: 200, y: 204, lines: ['Service Locator', '取り決めに依存し、実装は', 'メソッドの中で設定から取り出す', '依存先が引数に現れない'] },
    { x: 490, y: 204, lines: ['この章の直した形', 'confirm!(warehouse: …)', 'テスト：Fake を引数で渡す', 'SDK 2.0：Adapter だけを直す'], accent: true },
  ]
  return (
    <Svg
      id="65-5"
      w={780}
      h={380}
      label="横に DI を使うかどうか、縦に DIP に沿うかどうかを取った4つの組み合わせ。DI なしで DIP に沿わないのは適用前の Order#confirm! で、SDK のクライアントを中で作り、SDK 2.0 で Order とテストを直す。DI ありで DIP に沿わないのは DI だけを使った版で、SDK の代役を引数で渡せるが、SDK 2.0 で Order とテストを直す。DI なしで DIP に沿うのは Service Locator で、取り決めに依存するが実装をメソッドの中で設定から取り出すので、依存先が引数に現れない。DI ありで DIP に沿うのはこの章の直した形で、テストでは Fake を引数で渡し、SDK 2.0 では Adapter だけを直す"
    >
      <Box x={200} y={10} w={280} h={34} lines="DI なし：クラスの中で用意する" fs={12} fill="box5" bold />
      <Box x={490} y={10} w={280} h={34} lines="DI あり：引数で受け取る" fs={12} fill="box5" bold />
      <Box x={10} y={52} w={180} h={144} lines={['DIP に沿わない', '（SDK の形に依存）']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={10} y={204} w={180} h={144} lines={['DIP に沿う', '（取り決めに依存）']} fs={12} fill="box5" bold subTone="muted" />
      {cells.map((c) => (
        <Box key={`${c.x}-${c.y}`} x={c.x} y={c.y} w={280} h={144} lines={c.lines} fs={11} bold accent={c.accent} align="start" subTone="muted" />
      ))}
      <T x={10} y={368} fs={12} tone="muted">
        DI は依存先の受け取り方（配線）、DIP は依存先の形を決める
      </T>
    </Svg>
  )
}

/* ---------- 図 65-6 SDK 2.0 への更新で直したファイル ---------- */
function ChangeScopeFigure() {
  const before: [string, string][] = [
    ['app/models/order.rb', '+8 −5'],
    ['app/controllers/orders_controller.rb', '+1 −1'],
    ['app/jobs/confirm_order_job.rb', '+1 −1'],
    ['spec/models/order_spec.rb', '+11 −7'],
    ['spec/requests/orders_spec.rb', '+3 −3'],
    ['spec/jobs/confirm_order_job_spec.rb', '+1 −1'],
  ]
  const after: [string, string][] = [
    ['app/models/order.rb', ''],
    ['app/models/inventory.rb', ''],
    ['app/controllers/orders_controller.rb', ''],
    ['app/jobs/confirm_order_job.rb', ''],
    ['config/initializers/warehouse.rb', ''],
    ['app/adapters/inventory/soko_link_warehouse.rb', '+12 −8'],
    ['spec/models/order_spec.rb', ''],
    ['spec/requests/orders_spec.rb', ''],
    ['spec/jobs/confirm_order_job_spec.rb', ''],
    ['spec/support/（Fake と共通のテスト）', ''],
    ['spec/adapters/soko_link_warehouse_spec.rb', '+8 −7'],
  ]
  return (
    <Svg
      id="65-6"
      w={780}
      h={400}
      label={`SDK を 2.0 に更新したときに直したファイル。適用前は ${before.map(([f, d]) => `${f}（${d}）`).join('、')} の6つで、注文の確定の規則の書き方も rescue から if に変わった。適用後は ${after.filter(([, d]) => d).map(([f, d]) => `${f}（${d}）`).join('、')} の2つだけで、Order・コントローラー・ジョブ・取り決め・組み立てる場所・ほかのテストは変更なし`}
    >
      <T x={10} y={16} bold>
        適用前：直したファイル 6つ
      </T>
      {before.map(([f, d], i) => (
        <g key={f}>
          <Box x={10} y={34 + i * 32} w={290} h={26} lines={f} fs={11} mono align="start" />
          <T x={310} y={47 + i * 32} fs={12} tone="danger" mono>
            {d}
          </T>
        </g>
      ))}
      <T x={10} y={248} fs={12} tone="danger">
        注文の確定の規則の書き方も
      </T>
      <T x={10} y={266} fs={12} tone="danger">
        rescue から if に変わった
      </T>

      <line x1={380} y1={6} x2={380} y2={394} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={395} y={16} bold>
        適用後：直したファイル 2つ
      </T>
      {after.map(([f, d], i) => (
        <g key={f}>
          <Box x={395} y={34 + i * 32} w={310} h={26} lines={f} fs={11} mono align="start" accent={!!d} fill={d ? 'box' : 'bg'} />
          <T x={712} y={47 + i * 32} fs={12} tone={d ? 'acc' : 'muted'} mono={!!d}>
            {d || '変更なし'}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 65-7 取り決めを挟むかの判断 ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="65-7"
      w={760}
      h={440}
      label="横軸は変更を決めるのは誰か（左が自分たちと Rails、右が外部の会社）、縦軸は差し替える必要（下が実装は1つ、上が複数の実装やテストでの置き換え）。右上は取り決めと Adapter を作る領域で、倉庫・決済・SMS の SDK や外部の API のクライアントが入る。右下は SDK を1つのクラスに集める領域で、1社だけで替える予定のない外部が入り、取り決めの明文化は2社目が来たときに行う。左上は Rails の部品の設定で替える領域で、Active Job・Action Mailer・Rails.cache が入る。左下はそのまま依存する領域で、Active Record・Time.current・Ruby の標準ライブラリ・自分たちの値オブジェクトが入る。左下に取り決めを挟むのが当てはめすぎで、例は Heavy::OrderRepository と Heavy::Clock"
    >
      <Arrow x1={110} y1={372} x2={110} y2={34} />
      <Arrow x1={110} y1={372} x2={745} y2={372} />
      <T x={118} y={24} fs={12} bold>
        差し替える必要（実装の数・テストでの置き換え）
      </T>
      <T x={102} y={60} fs={12} anchor="end" tone="muted">
        多い
      </T>
      <T x={102} y={344} fs={12} anchor="end" tone="muted">
        少ない
      </T>
      <T x={120} y={390} fs={12} tone="muted">
        自分たち・Rails
      </T>
      <T x={740} y={390} fs={12} anchor="end" tone="muted">
        外部の会社
      </T>
      <T x={428} y={412} fs={12} anchor="middle" bold>
        変更を決めるのは誰か
      </T>
      <Box x={124} y={44} w={290} h={150} lines={['Rails の部品を設定で替える', 'Active Job・Action Mailer', 'Rails.cache・DB のアダプター', '取り決めは Rails が持っている']} fs={12} bold subTone="muted" />
      <Box x={440} y={44} w={300} h={150} lines={['取り決め＋Adapter（この章）', '倉庫・決済・SMS の SDK', '外部の API のクライアント', 'テストでは Fake を渡す']} fs={12} bold accent subTone="muted" />
      <Box x={124} y={208} w={290} h={150} lines={['そのまま依存する', 'Active Record・Time.current', 'Ruby の標準ライブラリ', '自分たちの値オブジェクト']} fs={12} bold subTone="muted" />
      <Box x={440} y={208} w={300} h={150} lines={['SDK を1つのクラスに集める', '1社だけで、替える予定がない外部', '取り決めを別に書くのは', '2社目が来たとき・テストで困ったとき']} fs={12} bold subTone="muted" />
      <T x={124} y={432} fs={12} tone="danger">
        左下に取り決めを挟むのが当てはめすぎ（例：Heavy::OrderRepository・Heavy::Clock）
      </T>
    </Svg>
  )
}

/* ---------- 図 65-8 Active Job のアダプターとこの章の倉庫 ---------- */
function RailsFigure() {
  return (
    <Svg
      id="65-8"
      w={780}
      h={330}
      label="上の段は Rails の Active Job。ConfirmOrderJob が perform_later を呼び、ActiveJob::Base がキューに入れる。Active Job は enqueue と enqueue_at に応答するという取り決めを持ち、SidekiqAdapter（sidekiq の gem が提供）、TestAdapter、AsyncAdapter などがそれを満たす。どれを使うかは config.active_job.queue_adapter で選び、test では :test を使う。下の段はこの章の倉庫。OrdersController と ConfirmOrderJob が Order#confirm! を呼び、Order は取り決め Inventory を使う。Inventory::SokoLinkWarehouse とテストの FakeWarehouse がそれを満たす。どれを使うかは config/initializers/warehouse.rb で作って config.x.warehouse に入れる"
    >
      <T x={10} y={16} bold>
        Rails の Active Job
      </T>
      <Box x={10} y={50} w={150} h={50} lines={['ConfirmOrderJob', 'perform_later']} fs={12} mono />
      <Arrow x1={160} y1={75} x2={188} y2={75} />
      <Box x={190} y={50} w={150} h={50} lines={['ActiveJob::Base', 'キューに入れる']} fs={12} subTone="muted" />
      <Arrow x1={340} y1={75} x2={368} y2={75} />
      <Box x={370} y={50} w={180} h={50} lines={['取り決め', 'enqueue・enqueue_at']} fs={12} fill="box2" dashed bold subTone="muted" />
      <Box x={590} y={34} w={180} h={32} lines="SidekiqAdapter（sidekiq）" fs={11} />
      <Box x={590} y={72} w={180} h={32} lines="TestAdapter（activejob）" fs={11} />
      <Box x={590} y={110} w={180} h={32} lines="AsyncAdapter など" fs={11} />
      <Arrow x1={590} y1={50} x2={552} y2={64} dashed />
      <Arrow x1={590} y1={88} x2={552} y2={78} dashed />
      <Arrow x1={590} y1={126} x2={552} y2={92} dashed />
      <T x={370} y={160} fs={11} mono tone="muted">
        config.active_job.queue_adapter = :sidekiq（test では :test）
      </T>

      <line x1={10} y1={180} x2={770} y2={180} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={10} y={198} bold>
        この章の倉庫
      </T>
      <Box x={10} y={226} w={150} h={50} lines={['OrdersController', 'ConfirmOrderJob']} fs={12} mono />
      <Arrow x1={160} y1={251} x2={188} y2={251} />
      <Box x={190} y={226} w={150} h={50} lines={['Order#confirm!', '注文の確定の規則']} fs={12} subTone="muted" />
      <Arrow x1={340} y1={251} x2={368} y2={251} />
      <Box x={370} y={226} w={180} h={50} lines={['Inventory', 'reserve・release']} fs={12} fill="box2" dashed bold subTone="muted" />
      <Box x={590} y={212} w={180} h={32} lines="SokoLinkWarehouse" fs={11} accent />
      <Box x={590} y={254} w={180} h={32} lines="FakeWarehouse（テスト）" fs={11} />
      <Arrow x1={590} y1={228} x2={552} y2={242} dashed />
      <Arrow x1={590} y1={270} x2={552} y2={262} dashed />
      <T x={370} y={312} fs={11} mono tone="muted">
        config/initializers/warehouse.rb → config.x.warehouse
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 67,
  part: 8,
  title: 'DIP（依存性逆転の原則）：在庫の引き当てを倉庫 API のクライアントに直接依存させない',
  summary:
    '注文を確定するときに外部の倉庫で在庫を引き当てる処理を例に、注文の規則が倉庫会社の SDK に直接依存していると、SDK の更新で注文のコードとテストを直すことになる様子を動かして確かめます。注文の側で倉庫への取り決めを決め、SDK を呼ぶコードを Adapter に集めて依存の向きを逆にし、DI（依存先を外から渡す手法）との違いと、取り決めを挟みすぎたときの費用を示します。',
  goals: [
    '上位の方針・下位の詳細・抽象という DIP の用語を、Rails のコードの具体的なクラスに当てはめて説明できる',
    'Martin の2つの定義文と「逆転」の意味を、呼び出しの向きと依存の向きの違いとして説明できる',
    'DIP（依存先の形を決める原則）と DI（依存先を外から受け取る手法）の違いを、DI だけでは SDK の更新で壊れる例で説明できる',
    '取り決めを上位の側に置き、Adapter・組み立てる場所・Fake・共通のテストで DIP に沿った構造に直せる',
    '実装が1つで自分たちや Rails が変更を決める依存先に取り決めを挟むと、手間だけが増えることを判断できる',
    'Active Job のキューのアダプターが DIP に沿った構造であることを、Rails のソースで確かめられる',
  ],
  prerequisites: [18, 20, 33],
  sections: [
    {
      id: 'scene',
      title: '注文の確定が倉庫の SDK を直接呼ぶコードと、SDK の更新で起きること',
      body: (
        <>
          <p>
            この章では、注文を確定するときに外部の倉庫で在庫を引き当てる処理を例に、<Term en="Dependency Inversion Principle">依存性逆転の原則</Term>（DIP）を扱います。DIP は上位の方針を具体的な実装に直接依存させず、適切な抽象に依存させるという原則です。依存先を外から渡す手法の Dependency Injection（<ChapterLink n={40} />）や、外部の SDK をアプリの取り決めに合わせる Adapter（<ChapterLink n={42} />）と一緒に使われることが多く、名前も似ています。この章では、DIP は依存の向きを決める原則で、DI と Adapter はその向きを作るための手法だという違いを、動かしたコードで確かめます。
          </p>
          <h3>そもそも在庫の引き当てとは</h3>
          <p>
            雑貨を売る EC サイトを考えます。このサイトは商品を自社で保管せず、倉庫会社の SokoLink（本書の架空の会社）に預けています。お客さんが注文して決済が終わると、サイトは倉庫会社に「この注文のために、この商品をこの数だけ取り置いてください」と依頼します。この依頼を在庫の<Term en="reservation">引き当て</Term>と呼びます。引き当てた商品はほかの注文に回されず、出荷の作業に進みます。
          </p>
          <p>
            倉庫会社は引き当てを受け付ける Web API と、その API を Ruby から呼ぶための <Term en="Software Development Kit">SDK</Term> を gem として提供しています。SDK は API の URL・認証・JSON の形を内部で扱い、<code>client.reserve(...)</code> のようなメソッドで API を呼べるようにするライブラリです。
          </p>
          <p>このサイトでは注文の確定について次の規則を決めています。</p>
          <ul>
            <li>注文の全商品を引き当てられたら、注文を確定（confirmed）にし、倉庫が返した引き当て番号を保存する</li>
            <li>1つでも在庫が足りなければ、何も引き当てずに注文を入荷待ち（backordered）にし、足りない商品コードを保存する</li>
            <li>確定した注文を取り消したら、倉庫の引き当ても取り消す</li>
            <li>倉庫に接続できないときは、画面からの確定なら 503 を返し、ジョブからの確定なら時間をおいて再試行する</li>
          </ul>
          <p>これらは店の業務の規則で、倉庫会社がどんな SDK を出しているかとは関係なく決まります。注文と明細は次のテーブルに保存します。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_orders.rb"
            code={`
class CreateOrders < ActiveRecord::Migration[8.1]
  def change
    create_table :orders do |t|
      t.string :status, null: false, default: "pending" # pending・confirmed・backordered・canceled
      t.string :reservation_id                           # 倉庫の引き当て番号
      t.string :shortage_skus                            # 在庫が足りなかった商品コード（カンマ区切り）
      t.boolean :gift_wrap, null: false, default: false  # ギフト包装
      t.timestamps
    end

    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.string :sku, null: false
      t.integer :quantity, null: false
      t.timestamps
    end
  end
end
`}
          />
          <h3>SDK を直接呼ぶコード</h3>
          <p>最初のコードは Order モデルの <code>confirm!</code> の中で SDK のクライアントを作り、SDK のメソッドを呼んでいます。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（適用前）"
            code={`
class Order < ApplicationRecord
  has_many :items, class_name: "OrderItem", dependent: :destroy
  enum :status, { pending: "pending", confirmed: "confirmed", backordered: "backordered", canceled: "canceled" }

  # 注文を確定する。全商品の在庫を倉庫で引き当てられたら確定し、1つでも足りなければ入荷待ちにする
  def confirm!
    client = SokoLink::Client.new(api_key: ENV["SOKO_LINK_API_KEY"])
    reservation = client.reserve(ref: "order-#{id}", items: items.map { { sku: it.sku, qty: it.quantity } })
    update!(status: :confirmed, reservation_id: reservation.id)
  rescue SokoLink::OutOfStockError => e
    update!(status: :backordered, shortage_skus: e.skus.join(","))
  end

  # 確定した注文を取り消し、倉庫の引き当てを戻す
  def cancel!
    SokoLink::Client.new(api_key: ENV["SOKO_LINK_API_KEY"]).cancel(reservation_id) if confirmed?
    update!(status: :canceled)
  end
end
`}
          />
          <p>
            <code>confirm!</code> は SDK 1.4 の <code>SokoLink::Client</code> を作り、<code>reserve</code> に注文の番号と、商品コード（<code>sku</code>）と数量（<code>qty</code>）の配列を渡します。SDK 1.4 は在庫が1つでも足りないと何も引き当てずに <code>SokoLink::OutOfStockError</code> を投げるので、それを <code>rescue</code> で受けて入荷待ちにします。ブロックの中の <code>it</code> は Ruby 3.4 で入った、ブロックの引数を指す名前です<Ref n={11} />。<code>items.map {'{ it.sku }'}</code> は <code>items.map {'{ |item| item.sku }'}</code> と同じ意味です。
          </p>
          <Callout kind="v72" title="Rails 7.2（Ruby 3.3 以前）で動かすとき">
            <p>
              Rails 7.2 は Ruby 3.1 以上で動きますが、<code>it</code> は Ruby 3.4 から、この章で後に使う <code>Data.define</code> は Ruby 3.2 からの機能です<Ref n={12} />
              <Ref n={11} />。Ruby 3.3 以前では <code>it</code> の代わりに <code>|item|</code> のようにブロックの引数に名前を付け、Ruby 3.1 では <code>Data.define</code> の代わりに <code>Struct.new(..., keyword_init: true)</code> を使ってください。
            </p>
          </Callout>
          <p>画面から確定するコントローラーと、決済の後にバックグラウンドで確定するジョブも、SDK の例外のクラスを名前で書いています。</p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb・app/jobs/confirm_order_job.rb（適用前）"
            code={`
class OrdersController < ApplicationController
  def confirm
    order = Order.find(params[:id])
    order.confirm!
    render json: { status: order.status }
  rescue SokoLink::ApiError
    render json: { error: "倉庫に接続できません。時間をおいてもう一度お試しください" }, status: :service_unavailable
  end
end

# 決済が終わった注文を、裏側で確定する
class ConfirmOrderJob < ApplicationJob
  retry_on SokoLink::ApiError, wait: :polynomially_longer, attempts: 5

  def perform(order)
    order.confirm!
  end
end
`}
          />
          <p>
            テストは <code>SokoLink::Client.new</code> をテストの間だけ書き換えて、<code>instance_double</code>（RSpec の代役で、本物のクラスにあるメソッドだけを受け付ける）を返すようにしています。代役の種類と書き方は<ChapterLink n={40} section="test-doubles" />で説明します。
          </p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（適用前・抜粋）"
            code={`
RSpec.describe Order do
  let(:order) do
    Order.create!(items: [OrderItem.new(sku: "TSHIRT-M", quantity: 2), OrderItem.new(sku: "MUG-01", quantity: 1)])
  end
  let(:client) { instance_double(SokoLink::Client) }

  before { allow(SokoLink::Client).to receive(:new).and_return(client) }

  it "全商品を引き当てられたら確定する" do
    allow(client).to receive(:reserve).and_return(SokoLink::Reservation.new(id: "rsv_1", status: "RESERVED"))

    order.confirm!

    expect(order).to be_confirmed
    expect(order.reservation_id).to eq "rsv_1"
    expect(client).to have_received(:reserve)
      .with(ref: "order-#{order.id}", items: [{ sku: "TSHIRT-M", qty: 2 }, { sku: "MUG-01", qty: 1 }])
  end

  it "1つでも足りなければ入荷待ちにする" do
    allow(client).to receive(:reserve).and_raise(SokoLink::OutOfStockError.new(["MUG-01"]))

    order.confirm!

    expect(order).to be_backordered
    expect(order.shortage_skus).to eq "MUG-01"
  end
  # …（省略：取り消しのテスト）
end
`}
          />
          <p>
            request spec（コントローラーの 503）とジョブのテスト（再試行の予約）も、同じように <code>SokoLink::ApiError</code> を投げる代役を使っています。SDK 1.4 では5件のテストがすべて通ります。
          </p>
          <Figure n="65-1" title="場面の構成：SDK の名前を書いている箇所" caption="赤い文字は SDK のクラス名・メソッド名を書いている箇所。太い枠は注文の確定の規則を持つ Order。">
            <SceneFigure />
          </Figure>
          <p>
            図 65-1 はこの場面のクラスと、SDK の名前を書いている箇所です。注文の確定の規則を持つ Order だけでなく、コントローラー・ジョブ・3つのテストが SDK のクラスを直接使っています。SDK の名前を書いているファイルは、アプリとテストを合わせて6つです。
          </p>
          <h3>SDK を 2.0 に更新すると</h3>
          <p>倉庫会社が SDK 2.0 を出し、1.x の保守を終えると知らせてきました。2.0 の変更点は図 65-2 のとおりです。</p>
          <Figure n="65-2" title="SokoLink の SDK 1.4 と 2.0 の違い" caption="本書の架空の SDK。vendor/sdks に置いた SDK のコードで動かした。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">項目</th>
                    <th scope="col">1.4</th>
                    <th scope="col">2.0</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">引き当て</th>
                    <td><code>client.reserve(ref:, items:)</code></td>
                    <td><code>client.reservations.create(external_ref:, lines:)</code></td>
                  </tr>
                  <tr>
                    <th scope="row">明細のキー</th>
                    <td><code>sku</code>・<code>qty</code></td>
                    <td><code>item_code</code>・<code>quantity</code></td>
                  </tr>
                  <tr>
                    <th scope="row">在庫が足りないとき</th>
                    <td><code>SokoLink::OutOfStockError</code> を投げる</td>
                    <td><code>state</code> が <code>"rejected"</code> の Reservation を返す（<code>shortages</code> に商品コード）</td>
                  </tr>
                  <tr>
                    <th scope="row">取り消し</th>
                    <td><code>client.cancel(id)</code></td>
                    <td><code>client.reservations.release(id)</code></td>
                  </tr>
                  <tr>
                    <th scope="row">接続できないとき</th>
                    <td><code>SokoLink::ApiError</code></td>
                    <td><code>SokoLink::Errors::Unavailable</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            この章の検証用のアプリでは環境変数 <code>SOKO_LINK_SDK</code> で読み込む SDK を切り替え、Gemfile で SDK のバージョンを上げた状態を再現しました。2.0 を読み込んでテストを実行した結果が次です。
          </p>
          <Code
            lang="text"
            title="実行結果（SOKO_LINK_SDK=v2 bundle exec rspec）"
            code={`
An error occurred while loading ./spec/jobs/confirm_order_job_spec.rb.
Failure/Error: retry_on SokoLink::ApiError, wait: :polynomially_longer, attempts: 5

NameError:
  uninitialized constant SokoLink::ApiError
# ./app/jobs/confirm_order_job.rb:3:in '<class:ConfirmOrderJob>'

Finished in 0.00004 seconds (files took 0.92716 seconds to load)
0 examples, 0 failures, 1 error occurred outside of examples
`}
          />
          <p>
            ジョブのクラスを読み込む時点で <code>retry_on SokoLink::ApiError</code> が NameError になり、テストは1件も実行されませんでした。ジョブのテストを除いて実行すると、残りの4件もすべて失敗します。
          </p>
          <Code
            lang="text"
            title="実行結果（SOKO_LINK_SDK=v2 bundle exec rspec spec/models spec/requests・抜粋）"
            code={`
  1) Order 全商品を引き当てられたら確定する
     Failure/Error: allow(client).to receive(:reserve).and_return(SokoLink::Reservation.new(id: "rsv_1", status: "RESERVED"))
     ArgumentError:
       unknown keywords: status

  2) Order 1つでも足りなければ入荷待ちにする
     NameError:
       uninitialized constant SokoLink::OutOfStockError

  3) Order 確定した注文を取り消すと、引き当てを戻す
     Failure/Error: allow(client).to receive(:cancel).and_return(true)
       the SokoLink::Client class does not implement the instance method: cancel

  4) 注文の確定 倉庫に接続できなければ 503 を返し、注文は確定しない
     NameError:
       uninitialized constant SokoLink::ApiError

4 examples, 4 failures
`}
          />
          <p>店の規則は1つも変わっていません。それでも、2.0 に合わせて直すと次の差分になりました。</p>
          <Code
            lang="text"
            title="実行結果（2.0 に合わせて直した後の git diff --stat）"
            code={`
 app/controllers/orders_controller.rb |  2 +-
 app/jobs/confirm_order_job.rb        |  2 +-
 app/models/order.rb                  | 13 ++++++++-----
 spec/jobs/confirm_order_job_spec.rb  |  2 +-
 spec/models/order_spec.rb            | 18 +++++++++++-------
 spec/requests/orders_spec.rb         |  6 +++---
 6 files changed, 25 insertions(+), 18 deletions(-)
`}
          />
          <p>
            Order を直した差分では、在庫が足りないときの判断が <code>rescue SokoLink::OutOfStockError</code> から <code>if reservation.state == "held"</code> に変わりました。「1つでも足りなければ入荷待ち」という店の規則の書き方が、SDK が在庫不足を例外で返すか戻り値で返すかで変わっています。
          </p>
          <h3>何が問題か</h3>
          <p>
            問題は SDK の更新そのものではありません。外部のライブラリは外部の都合で変わります。問題は、店の規則を書いた Order が、倉庫会社の SDK のメソッド名・引数の名前・例外のクラスを直接書いていることです。そのため、次のことが起きます。
          </p>
          <ul>
            <li>倉庫会社が決めた変更のために、店の規則のコードとテストまで直すことになる。直す範囲を SDK の変更点の一覧から予測しにくい</li>
            <li>店の規則をテストするのに、SDK のクラス（Client・Reservation・OutOfStockError）の形を知る必要がある</li>
            <li>倉庫会社を替える、または2社を併用するときに、Order・コントローラー・ジョブのすべてを書き換える</li>
          </ul>
          <p>
            Robert C. Martin は、変更が依存しているモジュールに次々と波及して変えにくい状態を硬さ（rigidity）、1か所の変更で関係の無い所が壊れる状態をもろさ（fragility）、望む部分を不要な詳細から切り離せず再利用できない状態を移植しにくさ（immobility）と呼び、その原因をモジュール同士の依存に求めました<Ref n={1} />。この場面では、SDK の更新で6つのファイルを直したことが硬さにあたります。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '上位の方針を下位の詳細ではなく抽象に依存させる',
      body: (
        <>
          <h3>依存性逆転の原則の定義</h3>
          <p>
            依存性逆転の原則（DIP）は上位の方針を具体的な実装に直接依存させず、適切な抽象に依存させるという原則です。この定義に出てくる言葉は、この章では次の意味で使います。
          </p>
          <ul>
            <li>
              <Term en="high-level module">上位のモジュール</Term>（上位の方針）：アプリが何をするかを決めるコード。この章では、全商品を引き当てたら確定し、1つでも足りなければ入荷待ちにする <code>Order#confirm!</code> です。
            </li>
            <li>
              <Term en="low-level module">下位のモジュール</Term>（下位の詳細）：上位の方針をどう実現するかの具体的な実装。倉庫の API の URL、SDK のメソッド名、例外のクラスです。
            </li>
            <li>
              <Term en="abstraction">抽象</Term>：上位が下位に求めることだけを決めた取り決め。Ruby では「このメソッドに応答し、この値を返す」という約束と、その約束で使う値と例外のクラスで表します。
            </li>
            <li>依存する：あるコードが別のコードの名前（クラス名・メソッド名・定数）を書いていて、相手が変わると自分も直す必要がある関係です。</li>
          </ul>
          <p>Martin は1996年の記事で、この原則を次の2つの文にまとめました<Ref n={1} />。</p>
          <ol>
            <li>上位のモジュールは下位のモジュールに依存してはならない。どちらも抽象に依存すべきである（High level modules should not depend upon low level modules. Both should depend upon abstractions.）</li>
            <li>抽象は詳細に依存してはならない。詳細が抽象に依存すべきである（Abstractions should not depend upon details. Details should depend upon abstractions.）</li>
          </ol>
          <p>
            2つ目の文は抽象を作るときの注意でもあります。SDK のメソッドをそのまま写した取り決め（<code>reserve(ref:, items:)</code> に <code>sku</code> と <code>qty</code> を渡す）を作っても、その取り決めは SDK という詳細に依存しています。SDK 2.0 で引数の名前が変われば、取り決めも変わります。取り決めは上位の方針の言葉（注文の番号と、商品コードごとの数量）で書きます。
          </p>
          <h3>由来：Martin の1996年の記事</h3>
          <p>
            DIP は、Robert C. Martin が雑誌 The C++ Report の連載 Engineering Notebook の3回目の記事「The Dependency Inversion Principle」（1996年）で名付けた原則です<Ref n={1} />。Martin はこの記事で、前の2回で扱った開放閉鎖の原則（OCP）とリスコフの置換原則（LSP）を厳密に使ったときに生まれる構造を、1つの原則としてまとめたと説明しています<Ref n={1} />。
          </p>
          <p>
            記事の例はキーボードから読んだ文字をプリンターに書き出す Copy というプログラムです。Copy がキーボードを読む関数とプリンターに書く関数を直接呼ぶと、ディスクに書き出す場面では Copy を再利用できず、出力先を足すたびに Copy の中の if 文が増えます。Martin は Copy に抽象的な Reader と Writer を使わせ、キーボードとプリンターの実装を Reader と Writer に合わせることで、Copy を詳細から切り離しました<Ref n={1} />。C の標準ライブラリの <code>getchar</code> と <code>putchar</code> も、装置の違いを stdio.h の抽象で隠しているので同じ構造だと書いています<Ref n={1} />。
          </p>
          <h3>何が「逆転」するのか</h3>
          <p>
            Martin は「逆転」という言葉を使った理由を次のように説明しています。構造化分析・設計のような従来の手法では、上位のモジュールが下位のモジュールを呼ぶ階層を作り、上位が下位に依存する構造になりやすい。よく設計されたオブジェクト指向のプログラムの依存の構造は、それに対して逆になっている<Ref n={1} />。つまり、呼び出しの向きと依存の向きが同じになるのが従来の構造で、DIP に沿った構造では依存の向きだけが逆になります。
          </p>
          <p>
            Martin は続けて、アプリの重要な方針と業務のモデルを持つのは上位のモジュールなのに、上位が下位に依存すると、下位の変更が上位に変更を強いると書き、本来は上位が下位に変更を強いる側であるべきだと述べています<Ref n={1} />。この章の場面では、倉庫会社の SDK の更新（下位の変更）が、注文の確定の規則（上位）の書き方を変えさせていました。
          </p>
          <Figure n="65-3" title="依存の向き（逆転の前と後）" caption="実線の矢印は使う（名前を書いている）関係、破線の矢印は取り決めを満たす関係。横の破線は上位と下位の境界。">
            <DirectionFigure />
          </Figure>
          <p>
            図 65-3 はこの章の注文の確定で依存の向きを比べたものです。左の適用前では、Order が SDK を直接使い、依存の矢印が上位から下位へ境界を越えています。右の適用後では、Order は注文の側に置いた取り決め Inventory だけを使い、SDK を使う <code>Inventory::SokoLinkWarehouse</code> が Inventory を満たします。境界を越える矢印は下位から上位へ向きます。
          </p>
          <p>
            処理の呼び出しの順は適用後も Order → SokoLinkWarehouse → SDK → 倉庫 API のままです。変わったのは、どのコードがどのコードの名前を書いているかという依存の向きだけです。また、取り決めを上位の側に置くことも、向きを逆にするための条件です。取り決めを SDK の側に置くと、SDK を替えるときに取り決めも替わり、上位は結局 SDK の変更の影響を受けます。
          </p>
          <h3>上位の方針と下位の詳細を分ける</h3>
          <Figure n="65-4" title="上位の方針・取り決め・下位の詳細" caption="下位の詳細の列は、SDK 1.4 から 2.0 への変更を矢印で示した。">
            <LayersFigure />
          </Figure>
          <p>
            図 65-4 はこの章の処理を上位の方針・取り決め・下位の詳細の3つに分けたものです。上位の方針を変えるのは店の運営の決定で、下位の詳細を変えるのは倉庫会社の SDK の更新です。2つは変わる理由も時期も違います。真ん中の取り決めにはどちらの変更でも変わりにくいことだけを書きます。下位の詳細の列にある4つの変更は、どれも取り決めの列に現れません。
          </p>
          <p>
            Martin の記事には、方針の層（Policy Layer）が仕組みの層を使い、仕組みの層が道具の層（Utility Layer）を使う構造で、方針の層が一番下の層の変更の影響まで受けるという例もあります。依存は推移するので、方針の層は道具の層に間接的に依存するからです。Martin は下の層ごとに抽象を置き、各層が抽象だけを使うようにすることで、この推移的な依存を断ちました<Ref n={1} />。
          </p>
          <h3>DIP と DI の違い</h3>
          <p>
            DIP と DI（Dependency Injection、依存性の注入）は名前が似ていて、一緒に使うことも多いので、混同されがちです。DI は、クラスが使う依存先をクラスの中で作らずに、<code>initialize</code> やメソッドの引数で外から受け取る手法です。Martin Fowler は、DI で大切なのは依存先の構成（どの実装を使うかの設定）を利用から分けることだと述べています<Ref n={2} />。一方 DIP は、上位のコードがどんな形の相手に依存するかについての原則です。
          </p>
          <p>違いを確かめるために、DI だけを使った版を書きました。SDK のクライアントを引数で受け取るので、テストでは代役を引数で渡せます。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（DI だけを使った版・抜粋）"
            code={`
  # DI だけを使った版：SDK のクライアントを引数で受け取る（既定値は本物）
  def confirm!(client: SokoLink::Client.new(api_key: ENV["SOKO_LINK_API_KEY"]))
    reservation = client.reserve(ref: "order-#{id}", items: items.map { { sku: it.sku, qty: it.quantity } })
    update!(status: :confirmed, reservation_id: reservation.id)
  rescue SokoLink::OutOfStockError => e
    update!(status: :backordered, shortage_skus: e.skus.join(","))
  end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/order_di_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Order do
  let(:order) { Order.create!(items: [OrderItem.new(sku: "MUG-01", quantity: 1)]) }

  it "1つでも足りなければ入荷待ちにする（SDK のクライアントの代役を引数で渡す）" do
    client = instance_double(SokoLink::Client)
    allow(client).to receive(:reserve).and_raise(SokoLink::OutOfStockError.new(["MUG-01"]))

    order.confirm!(client:)

    expect(order).to be_backordered
  end
end
`}
          />
          <p>このテストは SDK 1.4 では通りますが、SDK 2.0 では次のように失敗します。</p>
          <Code
            lang="text"
            title="実行結果（SOKO_LINK_SDK=v2 bundle exec rspec spec/models/order_di_spec.rb）"
            code={`
F

Failures:

  1) Order 1つでも足りなければ入荷待ちにする（SDK のクライアントの代役を引数で渡す）
     Failure/Error: allow(client).to receive(:reserve).and_raise(SokoLink::OutOfStockError.new(["MUG-01"]))

     NameError:
       uninitialized constant SokoLink::OutOfStockError
     # ./spec/models/order_di_spec.rb:8:in 'block (2 levels) in <top (required)>'

1 example, 1 failure
`}
          />
          <p>
            依存先を引数で受け取っても、Order が SDK の <code>reserve</code> と <code>OutOfStockError</code> を書いていることは変わりません。そのため、SDK の更新で同じように Order とテストを直すことになります。Brett L. Schuchert は Martin Fowler のサイトの記事で、DI は依存先をどう手に入れるか（配線）の問題で、DIP は依存先がどんな形か（抽象の水準）の問題であり、別のことを扱うと整理しています<Ref n={3} />。同じ記事は DI でデータベースの接続をゲームのプログラムに注入する例を挙げ、DI ではあっても、問題の領域よりずっと低い水準の依存先を注入しているので望ましくないと書いています<Ref n={3} />。
          </p>
          <Figure n="65-5" title="DIP と DI の違い" caption="横は依存先の受け取り方（DI を使うか）、縦は依存先の形（DIP に沿うか）。太い枠がこの章の直した形。">
            <DipDiFigure />
          </Figure>
          <p>
            図 65-5 は DI を使うかどうかと、DIP に沿うかどうかの組み合わせを並べたものです。右上の DI だけを使った版は、テストで代役を渡せますが、SDK を更新すると Order とテストを直すことになる点は変わりません。左下は、Order が取り決めには依存しているものの、実装をメソッドの中で設定から取り出す書き方です。これは Service Locator と呼ばれ、どの依存先を使うかがメソッドの中を読まないとわかりません（<ChapterLink n={40} section="anti-patterns" />）。この章では右下のように、取り決めに依存する形（DIP）と、その実装を引数で受け取る形（DI）を組み合わせます。
          </p>
          <p>
            DIP の説明で <Term en="Inversion of Control">制御の反転</Term>（IoC）という言葉が出てくることもあります。Schuchert は IoC を、どちらが呼び出しを始めるか（自分のコードがフレームワークを呼ぶのか、フレームワークが自分のコードを呼び返すのか）の問題として、DIP と区別しています<Ref n={3} />。Rails がリクエストを受けてコントローラーのアクションを呼ぶのは IoC の例で、依存の向きとは別の話です。
          </p>
          <h3>似た原則・パターンとの違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・パターン</th>
                  <th scope="col">何を決めるか</th>
                  <th scope="col">この章との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">OCP（<ChapterLink n={64} />）</th>
                  <td>既存のコードを変えずに振る舞いを足せるようにする</td>
                  <td>Order が取り決めに依存していれば、倉庫会社を足すときに Order を変えずに Adapter を足せる。DIP は OCP を実現する構造の1つ</td>
                </tr>
                <tr>
                  <th scope="row">LSP（<ChapterLink n={65} />）</th>
                  <td>置き換えた実装が、元の約束を守る</td>
                  <td>SokoLinkWarehouse と FakeWarehouse が同じ取り決めを守ることを、共通のテストで確かめる</td>
                </tr>
                <tr>
                  <th scope="row">ISP（<ChapterLink n={66} />）</th>
                  <td>使わないメソッドへの依存を強制しない</td>
                  <td>取り決めには Order が使う reserve と release だけを書く</td>
                </tr>
                <tr>
                  <th scope="row">Stable Dependencies Principle（<ChapterLink n={75} />）</th>
                  <td>変わりやすいものから、変わりにくいものへ依存する</td>
                  <td>取り決めは SDK より変わりにくいので、SDK を使う側から取り決めへ依存させる</td>
                </tr>
                <tr>
                  <th scope="row">Adapter（<ChapterLink n={42} />）</th>
                  <td>外部のインターフェースを、使う側の取り決めに合わせて変換するパターン</td>
                  <td>DIP の取り決めを満たす具体的な部品</td>
                </tr>
                <tr>
                  <th scope="row">Dependency Injection（<ChapterLink n={40} />）</th>
                  <td>依存先を外から受け取る手法</td>
                  <td>取り決めを満たす実装を Order に渡す方法</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '注文の側で倉庫の取り決めを決め、SDK を呼ぶコードを1つのクラスに集める',
      body: (
        <>
          <h3>直す順序</h3>
          <p>SDK 1.4 のまま、次の順に直します。</p>
          <ol>
            <li>Order が倉庫に求めることを、注文の言葉で取り決めとして書く（<code>Inventory</code>）</li>
            <li>取り決めを満たす Adapter を作り、SDK を呼ぶコードをそこへ移す（<code>Inventory::SokoLinkWarehouse</code>）</li>
            <li>組み立てる場所で Adapter を作り、設定に入れる（<code>config/initializers/warehouse.rb</code>）</li>
            <li>Order・コントローラー・ジョブが、SDK の名前ではなく取り決めの名前を使うように直す</li>
            <li>テストを取り決めを満たす Fake で書き直し、Fake と Adapter が同じ取り決めを守ることを共通のテストで確かめる</li>
          </ol>
          <p>
            1〜3 は既存のコードを変えずに足せます。4 では呼び出し側を1つずつ切り替え、切り替えるたびにテストを実行します。SDK の更新は、この作業が終わってから行います。構造を直す作業と SDK を更新する作業を同時に行うと、テストが失敗したときに、どちらが原因かを切り分けにくくなるからです。
          </p>
          <h3>1. 取り決めを書く</h3>
          <Code
            lang="ruby"
            title="app/models/inventory.rb"
            code={`
# 注文の確定が倉庫に求めることを、注文の側の言葉で決めた取り決め（抽象）。
# 倉庫の実装は次の2つのメソッドに応答する。
#   reserve(order_ref:, lines:)  lines は { "商品コード" => 数量 }。
#     全商品を引き当てたら Reserved を返す。1つでも足りなければ、何も引き当てずに Shortage を返す
#   release(reservation_id)      引き当てを取り消す
# 倉庫に接続できないときは、どちらのメソッドも Inventory::Unavailable を投げる
module Inventory
  Reserved = Data.define(:reservation_id)
  Shortage = Data.define(:skus)
  class Unavailable < StandardError; end
end
`}
          />
          <p>
            Ruby には Java の interface のような宣言が無いので、取り決めはコメントと、取り決めで使う値・例外のクラスで表します。<code>Data.define</code> は指定した名前の値を持ち、作った後に値を変えられないクラスを作る Ruby の機能です<Ref n={10} />。<code>Reserved</code> は引き当てに成功した結果、<code>Shortage</code> は在庫が足りなかった結果です。
          </p>
          <p>
            在庫不足を例外ではなく戻り値にしたのは、在庫不足が業務の上で普通に起きる結果で、障害ではないからです。倉庫に接続できないことは障害なので、例外 <code>Inventory::Unavailable</code> にしました。このファイルには SokoLink の名前が1つも出てきません。<code>lines</code> も SDK の <code>sku</code>・<code>qty</code> の配列ではなく商品コードと数量の Hash にしています。取り決めは app/models に置き、注文の側のコードとして扱います。
          </p>
          <h3>2. SDK を呼ぶコードを Adapter に集める</h3>
          <Code
            lang="ruby"
            title="app/adapters/inventory/soko_link_warehouse.rb（SDK 1.4 用）"
            code={`
# 倉庫の取り決め（Inventory）を、SokoLink の SDK 1.x で満たす。SDK の名前を知っているのはこのクラスだけ
class Inventory::SokoLinkWarehouse
  def initialize(client:)
    @client = client
  end

  def reserve(order_ref:, lines:)
    reservation = @client.reserve(ref: order_ref, items: lines.map { |sku, qty| { sku:, qty: } })
    Inventory::Reserved.new(reservation_id: reservation.id)
  rescue SokoLink::OutOfStockError => e
    Inventory::Shortage.new(skus: e.skus)
  rescue SokoLink::ApiError => e
    raise Inventory::Unavailable, e.message
  end

  def release(reservation_id)
    @client.cancel(reservation_id)
  rescue SokoLink::ApiError => e
    raise Inventory::Unavailable, e.message
  end
end
`}
          />
          <p>
            Adapter は取り決めの形（商品コードと数量の Hash）を SDK の形（<code>sku</code>・<code>qty</code> の配列）に変え、SDK の結果と例外を取り決めの値と例外に変えます。SDK の名前を書いているのはこのクラスだけです。app/adapters のように app/ の下に作ったディレクトリは、設定を足さなくても Rails が自動で読み込みます。Adapter の書き方と、変換で気を付けることは<ChapterLink n={42} section="rails-impl" />で詳しく説明します。
          </p>
          <h3>3. 組み立てる場所</h3>
          <Code
            lang="ruby"
            title="config/initializers/warehouse.rb"
            code={`
# 組み立てる場所：倉庫の取り決めを満たす実装を作り、config.x に入れる
Rails.application.config.to_prepare do
  Rails.configuration.x.warehouse =
    Inventory::SokoLinkWarehouse.new(client: SokoLink::Client.new(api_key: ENV["SOKO_LINK_API_KEY"]))
end
`}
          />
          <p>
            どの実装を使うかを決めるコードは、アプリの起動時に1か所で実行します。<code>config.x</code> はアプリが独自の設定を入れられる場所で、<code>to_prepare</code> は起動時と、開発環境でコードを再読み込みするたびに実行されるブロックです<Ref n={9} />。app/ の下のクラスは再読み込みされるので、initializer から直接参照せずに <code>to_prepare</code> の中で作ります。本番で API キーが無いときに起動を止める方法などは、<ChapterLink n={40} section="rails-impl" />で説明します。
          </p>
          <h3>4. Order・コントローラー・ジョブを取り決めに依存させる</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb（適用後）"
            code={`
class Order < ApplicationRecord
  has_many :items, class_name: "OrderItem", dependent: :destroy
  enum :status, { pending: "pending", confirmed: "confirmed", backordered: "backordered", canceled: "canceled" }

  # 注文を確定する。全商品の在庫を倉庫で引き当てられたら確定し、1つでも足りなければ入荷待ちにする
  # warehouse: 倉庫の取り決め（Inventory）を満たすオブジェクト
  def confirm!(warehouse: Rails.configuration.x.warehouse)
    case warehouse.reserve(order_ref: "order-#{id}", lines: items.to_h { [it.sku, it.quantity] })
    in Inventory::Reserved(reservation_id:)
      update!(status: :confirmed, reservation_id:)
    in Inventory::Shortage(skus:)
      update!(status: :backordered, shortage_skus: skus.join(","))
    end
  end

  # 確定した注文を取り消し、倉庫の引き当てを戻す
  def cancel!(warehouse: Rails.configuration.x.warehouse)
    warehouse.release(reservation_id) if confirmed?
    update!(status: :canceled)
  end
end
`}
          />
          <p>
            <code>confirm!</code> は <code>warehouse:</code> の引数で取り決めを満たすオブジェクトを受け取り、省略したときは組み立てる場所で作った実装を使います。<code>case ... in</code> は Ruby のパターンマッチで、<code>Data.define</code> で作った値はクラスと中身の名前で場合分けできます<Ref n={10} />。店の規則（確定・入荷待ち・取り消し）は、SDK の形と関係なく、取り決めの2つの結果だけで書けました。
          </p>
          <p>コントローラーとジョブは、SDK の例外の代わりに取り決めの例外を書きます。変えたのはそれぞれ1行です。</p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb・app/jobs/confirm_order_job.rb（適用後・変えた行）"
            code={`
  rescue Inventory::Unavailable          # OrdersController#confirm

  retry_on Inventory::Unavailable, wait: :polynomially_longer, attempts: 5   # ConfirmOrderJob
`}
          />
          <h3>5. テスト：Fake と、取り決めの共通のテスト</h3>
          <p>Order のテストでは取り決めをメモリー上の在庫で満たす代役（Fake）を使います。</p>
          <Code
            lang="ruby"
            title="spec/support/fake_warehouse.rb"
            code={`
# 倉庫の取り決め（Inventory）を、メモリー上の在庫で満たす代役（Fake）
class FakeWarehouse
  attr_reader :released

  def initialize(stock: {}, down: false)
    @stock = stock.dup
    @down = down
    @released = []
    @seq = 0
  end

  def reserve(order_ref:, lines:)
    raise Inventory::Unavailable, "倉庫が停止中" if @down

    short = lines.select { |sku, qty| @stock.fetch(sku, 0) < qty }.keys
    return Inventory::Shortage.new(skus: short) if short.any?

    lines.each { |sku, qty| @stock[sku] -= qty }
    Inventory::Reserved.new(reservation_id: "fake-#{@seq += 1}")
  end

  def release(reservation_id)
    raise Inventory::Unavailable, "倉庫が停止中" if @down

    @released << reservation_id
  end

  def available(sku) = @stock.fetch(sku, 0)
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（適用後・抜粋）"
            code={`
  it "1つでも足りなければ入荷待ちにし、ほかの商品も引き当てない" do
    warehouse = FakeWarehouse.new(stock: { "TSHIRT-M" => 5, "MUG-01" => 0 })

    order.confirm!(warehouse:)

    expect(order).to be_backordered
    expect(order.shortage_skus).to eq "MUG-01"
    expect(warehouse.available("TSHIRT-M")).to eq 5
  end
`}
          />
          <p>
            Order のテストは SDK のクラスを1つも書いていません。代役が本物と違う振る舞いをすると、テストは通るのに本番では失敗するので、Fake と Adapter が同じ取り決めを守ることを共通のテスト（RSpec の <code>shared_examples</code>）で確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/support/warehouse_contract.rb"
            code={`
# 倉庫の取り決め（Inventory）を満たすかを確かめる。使う側で warehouse を定義する。
# 在庫は TSHIRT-M が 5、MUG-01 が 0 の状態にしておく
RSpec.shared_examples "倉庫の取り決め" do
  it "全商品の在庫があれば、引き当て番号の入った Reserved を返す" do
    result = warehouse.reserve(order_ref: "order-1", lines: { "TSHIRT-M" => 2 })
    expect(result).to be_a(Inventory::Reserved)
    expect(result.reservation_id).to be_present
  end

  it "1つでも足りなければ、足りない商品コードの入った Shortage を返す" do
    result = warehouse.reserve(order_ref: "order-1", lines: { "TSHIRT-M" => 2, "MUG-01" => 1 })
    expect(result).to eq Inventory::Shortage.new(skus: ["MUG-01"])
  end

  it "引き当てを取り消せる" do
    expect { warehouse.release("rsv_1") }.not_to raise_error
  end
end
`}
          />
          <p>
            Adapter のテストでは WebMock（外部への HTTP の通信を止め、登録した応答を返す gem）で SokoLink の API を置き換え、同じ <code>shared_examples</code> を当てます。WebMock の使い方は<ChapterLink n={40} section="test" />、2つの Adapter に同じテストを当てる方法は<ChapterLink n={42} section="test" />で説明します。
          </p>
          <Code
            lang="ruby"
            title="spec/adapters/soko_link_warehouse_spec.rb（SDK 1.4 用・抜粋）"
            code={`
RSpec.describe Inventory::SokoLinkWarehouse do
  let(:warehouse) { described_class.new(client: SokoLink::Client.new(api_key: "test-key")) }
  let(:base) { "https://api.soko-link.example/v1" }

  context "SokoLink の在庫が TSHIRT-M 5・MUG-01 0 のとき" do
    before do
      stock = { "TSHIRT-M" => 5, "MUG-01" => 0 }
      # SokoLink 1.x の API：足りなければ 409 と、足りない商品コードを返す
      stub_request(:post, "#{base}/reservations").to_return do |req|
        short = JSON.parse(req.body)["items"].select { stock.fetch(it["sku"], 0) < it["qty"] }.map { it["sku"] }
        if short.any?
          { status: 409, body: { skus: short }.to_json }
        else
          { status: 201, body: { id: "rsv_1", status: "RESERVED" }.to_json }
        end
      end
      stub_request(:delete, "#{base}/reservations/rsv_1").to_return(status: 204)
    end

    it_behaves_like "倉庫の取り決め"
    # …（省略：SDK に渡す値の確認）
  end

  it "SokoLink が 503 を返したら Inventory::Unavailable を投げる" do
    stub_request(:post, "#{base}/reservations").to_return(status: 503)

    expect { warehouse.reserve(order_ref: "order-1", lines: { "TSHIRT-M" => 1 }) }
      .to raise_error(Inventory::Unavailable)
  end
end
`}
          />
          <p>
            request spec では <code>Rails.configuration.x.warehouse</code> をテストの間だけ <code>FakeWarehouse.new(down: true)</code> に替えて、503 を返すことを確かめます。request spec で WebMock を使って SokoLink の HTTP を置き換えると、request spec に SokoLink の URL を書くことになり、SDK の更新で request spec も直すことになるからです。
          </p>
          <Code
            lang="text"
            title="実行結果（SOKO_LINK_SDK=v1 bundle exec rspec --format documentation）"
            code={`
Inventory::SokoLinkWarehouse
  SokoLink が 503 を返したら Inventory::Unavailable を投げる
  SokoLink の在庫が TSHIRT-M 5・MUG-01 0 のとき
    SDK に注文の番号と、商品コードごとの数量を渡す
    behaves like 倉庫の取り決め
      全商品の在庫があれば、引き当て番号の入った Reserved を返す
      1つでも足りなければ、足りない商品コードの入った Shortage を返す
      引き当てを取り消せる

ConfirmOrderJob
  倉庫の障害で失敗したら、再試行を予約する

FakeWarehouse
  behaves like 倉庫の取り決め
    全商品の在庫があれば、引き当て番号の入った Reserved を返す
    1つでも足りなければ、足りない商品コードの入った Shortage を返す
    引き当てを取り消せる

Order
  全商品を引き当てられたら確定する
  1つでも足りなければ入荷待ちにし、ほかの商品も引き当てない
  確定した注文を取り消すと、引き当てを戻す

注文の確定
  倉庫に接続できなければ 503 を返し、注文は確定しない

Finished in 0.21599 seconds (files took 1.09 seconds to load)
13 examples, 0 failures
`}
          />
          <h3>もう一度 SDK を 2.0 に更新する</h3>
          <p>構造を直した後で、SDK を 2.0 に更新してテストを実行しました。</p>
          <Code
            lang="text"
            title="実行結果（SOKO_LINK_SDK=v2 bundle exec rspec・抜粋）"
            code={`
     NameError:
       uninitialized constant SokoLink::OutOfStockError
     # ./app/adapters/inventory/soko_link_warehouse.rb:10:in 'Inventory::SokoLinkWarehouse#reserve'
     # --- Caused by: ---
     # NoMethodError:
     #   undefined method 'reserve' for an instance of SokoLink::Client

13 examples, 5 failures

Failed examples:

rspec ./spec/adapters/soko_link_warehouse_spec.rb:32 # Inventory::SokoLinkWarehouse SokoLink が 503 を返したら …
rspec ./spec/adapters/soko_link_warehouse_spec.rb:24 # Inventory::SokoLinkWarehouse … SDK に注文の番号と、商品コードごとの数量を渡す
rspec './spec/adapters/soko_link_warehouse_spec.rb[1:1:1:1]' # … behaves like 倉庫の取り決め 全商品の在庫があれば …
rspec './spec/adapters/soko_link_warehouse_spec.rb[1:1:1:2]' # … behaves like 倉庫の取り決め 1つでも足りなければ …
rspec './spec/adapters/soko_link_warehouse_spec.rb[1:1:1:3]' # … behaves like 倉庫の取り決め 引き当てを取り消せる
`}
          />
          <p>失敗したのは Adapter のテストの5件だけで、Order・コントローラー・ジョブのテストは通っています。Adapter を 2.0 に合わせて直します。</p>
          <Code
            lang="ruby"
            title="app/adapters/inventory/soko_link_warehouse.rb（SDK 2.0 用）"
            code={`
# 倉庫の取り決め（Inventory）を、SokoLink の SDK 2.x で満たす。SDK の名前を知っているのはこのクラスだけ
class Inventory::SokoLinkWarehouse
  def initialize(client:)
    @client = client
  end

  def reserve(order_ref:, lines:)
    reservation = @client.reservations.create(
      external_ref: order_ref, lines: lines.map { |sku, qty| { item_code: sku, quantity: qty } }
    )
    if reservation.state == "held"
      Inventory::Reserved.new(reservation_id: reservation.id)
    else
      Inventory::Shortage.new(skus: reservation.shortages)
    end
  rescue SokoLink::Errors::Unavailable => e
    raise Inventory::Unavailable, e.message
  end

  def release(reservation_id)
    @client.reservations.release(reservation_id)
  rescue SokoLink::Errors::Unavailable => e
    raise Inventory::Unavailable, e.message
  end
end
`}
          />
          <p>
            Adapter のテストも WebMock に登録する URL（<code>/v2/reservations</code>）と JSON のキーを 2.0 に合わせました。直した後の差分と、テストの結果は次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --stat と SOKO_LINK_SDK=v2 bundle exec rspec）"
            code={`
 app/adapters/inventory/soko_link_warehouse.rb | 20 ++++++++++++--------
 spec/adapters/soko_link_warehouse_spec.rb     | 15 ++++++++-------
 2 files changed, 20 insertions(+), 15 deletions(-)

13 examples, 0 failures
`}
          />
          <Figure n="65-6" title="SDK 2.0 への更新で直したファイル（適用前と適用後）" caption="git diff --stat の行数。+ は足した行、− は消した行。適用後の Fake と共通のテストは spec/support の2つのファイル。">
            <ChangeScopeFigure />
          </Figure>
          <p>
            図 65-6 は SDK 2.0 への更新で直したファイルを、適用前と適用後で比べたものです。適用前は6つのファイルを直し、店の規則の書き方まで変わりました。適用後は Adapter とそのテストの2つだけで、注文の規則のコードとテストは変わっていません。SDK を 2.0 に替えても、組み立てる場所（initializer）のコードは変わっていません。
          </p>
          <p>
            代わりに増えたものもあります。取り決め・Adapter・組み立てる場所・Fake・共通のテストの5つのファイルと、形を変換するコードです。SDK の形と取り決めの形が違うので、変換を誤ると、Adapter のテストを書かない限り本番で初めて気付くことになります。この費用に見合うかどうかは、次の節で考えます。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '取り決めを挟みすぎたとき',
      body: (
        <>
          <h3>DB・時計・ログにまで取り決めを挟んだコード</h3>
          <p>
            DIP に慣れると、すべての依存先に取り決めを挟みたくなります。次のコードは倉庫に加えて、Active Record・現在時刻・ログにも取り決めを挟んだ注文の確定です。Active Record のモデルを、データだけを持つ <code>OrderEntity</code> に詰め替えて使います。
          </p>
          <Code
            lang="ruby"
            title="app/services/heavy/（当てはめすぎの例・抜粋）"
            code={`
# order_entity.rb：注文を Active Record から切り離した値
Heavy::OrderEntity = Data.define(:id, :status, :lines, :reservation_id, :shortage_skus)

# order_repository.rb：注文の読み書きの取り決め。実装は ActiveRecordOrderRepository の1つだけ
class Heavy::OrderRepository
  def find(id) = raise(NotImplementedError)
  def save(entity) = raise(NotImplementedError)
end

# active_record_order_repository.rb
class Heavy::ActiveRecordOrderRepository < Heavy::OrderRepository
  def find(id)
    order = Order.includes(:items).find(id)
    Heavy::OrderEntity.new(id: order.id, status: order.status, lines: order.items.to_h { [it.sku, it.quantity] },
                           reservation_id: order.reservation_id, shortage_skus: order.shortage_skus)
  end
  # …（省略：save）
end

# clock.rb：現在時刻の取り決め。実装は SystemClock の1つだけ
class Heavy::Clock
  def now = raise(NotImplementedError)
end

class Heavy::SystemClock < Heavy::Clock
  def now = Time.current
end

# confirm_order.rb
class Heavy::ConfirmOrder
  def initialize(warehouse:, orders: Heavy::ActiveRecordOrderRepository.new,
                 clock: Heavy::SystemClock.new, logger: Rails.logger)
    @warehouse = warehouse
    @orders = orders
    @clock = clock
    @logger = logger
  end

  def call(order_id)
    order = @orders.find(order_id)
    result = @warehouse.reserve(order_ref: "order-#{order.id}", lines: order.lines)
    @logger.info("[confirm] order=#{order.id} at=#{@clock.now.iso8601} result=#{result.class.name}")
    case result
    in Inventory::Reserved(reservation_id:)
      @orders.save(order.with(status: "confirmed", reservation_id:))
    in Inventory::Shortage(skus:)
      @orders.save(order.with(status: "backordered", shortage_skus: skus.join(",")))
    end
  end
end
`}
          />
          <p>
            テストでは <code>Heavy::OrderRepository</code> を継承した <code>FakeOrderRepository</code> に <code>OrderEntity</code> を入れて渡します。このコードでもテストは通り、Order を DB から切り離せたように見えます。
          </p>
          <h3>列を1つ使うだけで4つのファイルを直す</h3>
          <p>
            ギフト包装の注文では、包装の資材（商品コード WRAP-01）も倉庫で引き当てることになりました。orders テーブルにはすでに <code>gift_wrap</code> の列があります。前の節で直した形では、Order に private メソッドを1つ足すだけで済みます。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（ギフト包装を足した差分）"
            code={`
-    case warehouse.reserve(order_ref: "order-#{id}", lines: items.to_h { [it.sku, it.quantity] })
+    case warehouse.reserve(order_ref: "order-#{id}", lines: warehouse_lines)
 …
+  private
+
+  # 倉庫で引き当てる商品コードと数量。ギフト包装なら包装の資材も引き当てる
+  def warehouse_lines
+    lines = items.to_h { [it.sku, it.quantity] }
+    gift_wrap? ? lines.merge("WRAP-01" => 1) : lines
+  end
`}
          />
          <Code
            lang="text"
            title="実行結果（git diff --stat。テストを1件足した）"
            code={`
 app/models/order.rb       | 10 +++++++++-
 spec/models/order_spec.rb |  9 +++++++++
 2 files changed, 18 insertions(+), 1 deletion(-)
`}
          />
          <p>当てはめすぎた形で、ConfirmOrder に同じ判断を書いてテストを実行すると、次のように失敗します。</p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/services・抜粋）"
            code={`
  1) Heavy::ConfirmOrder 全商品を引き当てられたら確定する
     Failure/Error: lines = order.gift_wrap ? order.lines.merge("WRAP-01" => 1) : order.lines

     NoMethodError:
       undefined method 'gift_wrap' for an instance of Heavy::OrderEntity
     # ./app/services/heavy/confirm_order.rb:13:in 'Heavy::ConfirmOrder#call'

2 examples, 2 failures
`}
          />
          <p>
            OrderEntity に <code>gift_wrap</code> が無いからです。OrderEntity の定義、ActiveRecordOrderRepository の詰め替え、テストで作る OrderEntity を直して、ようやく通ります。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --stat）"
            code={`
 app/services/heavy/active_record_order_repository.rb |  3 ++-
 app/services/heavy/confirm_order.rb                  |  3 ++-
 app/services/heavy/order_entity.rb                   |  2 +-
 spec/services/heavy/confirm_order_spec.rb            | 15 ++++++++++++++-
 4 files changed, 19 insertions(+), 4 deletions(-)
`}
          />
          <p>
            Active Record も <code>Time.current</code> も <code>Rails.logger</code> も、このアプリで別の実装に替える予定がありません。変わるとしても Rails の更新に合わせてアプリ全体で対応するものです。取り決めを挟んでも守れる変更が無く、列を足すたびに詰め替えのコードを直す手間だけが増えています。<code>Heavy::Clock</code> もテストでは Rails の <code>travel_to</code>（テストの間だけ現在時刻を置き換える）で足ります。
          </p>
          <h3>判断の目安</h3>
          <Figure n="65-7" title="取り決めを挟むかの判断" caption="模式図。境目は目安で、同じ依存先でもアプリの事情で位置が変わる。">
            <JudgeFigure />
          </Figure>
          <p>
            図 65-7 は依存先を2つの軸で分け、取り決めを挟むかを判断する目安です。横軸はその依存先の変更を誰が決めるかです。外部の会社が決める SDK や API は、こちらの都合と関係なく変わります。縦軸は差し替える必要の大きさです。複数の実装を使い分ける場合や、テストで通信・課金・送信を避けたい場合は、差し替える必要が大きくなります。
          </p>
          <p>
            右上の倉庫・決済・SMS の SDK は、この章のように取り決めと Adapter を作る効果が大きい領域です。右下の、1社だけで替える予定も無い外部のサービスでは、まず SDK を呼ぶコードを1つのクラスに集めるところまでにします。それだけでも SDK の更新で直す範囲は1つのクラスに収まり、費用は小さく済みます。取り決めを別のファイルに書き、Fake と共通のテストを作るのは、2社目が来たときや、テストで困ったときでも間に合います。左上の Active Job などは Rails がすでに取り決めを持っているので、自分で書く必要はありません（次の節）。左下の Active Record・現在時刻・Ruby の標準ライブラリ・自分たちの値オブジェクトには、そのまま依存します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">取り決めを挟む効果が大きい</th>
                  <th scope="col">効果が小さい（そのまま依存する）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">変更を決めるのは</th>
                  <td>外部の会社（SDK・API の仕様）</td>
                  <td>自分たち、または Rails</td>
                </tr>
                <tr>
                  <th scope="row">実装の数</th>
                  <td>複数ある、または替える予定がある</td>
                  <td>1つで、替える予定が無い</td>
                </tr>
                <tr>
                  <th scope="row">テストでの扱い</th>
                  <td>通信・課金・送信を避けたい</td>
                  <td>本物を使っても速く、結果が決まる（DB・計算）</td>
                </tr>
                <tr>
                  <th scope="row">使う場所</th>
                  <td>業務の規則を書いたコードが直接使う</td>
                  <td>1つのクラスの中でしか使わない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            YAGNI（<ChapterLink n={58} />）は今必要の無い仕組みを作らないという原則です。2社目の倉庫会社を想定して取り決めを先に作ると、YAGNI と DIP が対立します。この2つの原則の釣り合いの取り方は、<ChapterLink n={93} section="yagni-dip" />で両方の書き方を比べて考えます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の機能と DIP：Active Job のアダプターと Rails Doctrine',
      body: (
        <>
          <h3>Active Job のキューのアダプター</h3>
          <p>
            Rails 自身にも、上位の取り決めに下位の実装を合わせる構造があります。Active Job はジョブを宣言して、キューのバックエンド（Sidekiq、Solid Queue など）で実行する Rails の仕組みです。Rails のガイドは、Active Job がよくある非同期の処理のために、一貫した上位のインターフェースを提供すると説明しています<Ref n={5} />。ジョブのクラスは <code>perform_later</code> を呼ぶだけで、ジョブがどのキューのシステムに入るかをコードに書きません。
          </p>
          <Code
            lang="ruby"
            title="activejob-8.1.4.1/lib/active_job/queue_adapters/abstract_adapter.rb"
            href={`${GH}/activejob/lib/active_job/queue_adapters/abstract_adapter.rb#L5-L23`}
            code={`
    # = Active Job Abstract Adapter
    #
    # Active Job supports multiple job queue systems. ActiveJob::QueueAdapters::AbstractAdapter
    # forms the abstraction layer which makes this possible.
    class AbstractAdapter
      attr_accessor :stopping

      def enqueue(job)
        raise NotImplementedError
      end

      def enqueue_at(job, timestamp)
        raise NotImplementedError
      end
      # …（省略）
`}
          />
          <p>
            コメントには、AbstractAdapter が、Active Job が複数のキューのシステムを扱えるようにする抽象の層だと書かれています<Ref n={6} />。実装は <code>enqueue</code>（すぐに実行するジョブを入れる）と <code>enqueue_at</code>（時刻を指定して入れる）を用意します。設定に <code>:sidekiq</code> のような名前を書くと、Rails は <code>ActiveJob::QueueAdapters.lookup</code> で <code>SidekiqAdapter</code> を探して作ります。名前ではなくオブジェクトを渡したときは、そのオブジェクトが <code>enqueue</code> と <code>enqueue_at</code> に応答するかだけを確かめます<Ref n={7} />。
          </p>
          <Code
            lang="ruby"
            title="activejob-8.1.4.1/lib/active_job/queue_adapter.rb（抜粋）"
            href={`${GH}/activejob/lib/active_job/queue_adapter.rb#L49-L76`}
            code={`
      def queue_adapter=(name_or_adapter)
        case name_or_adapter
        when Symbol, String
          queue_adapter = ActiveJob::QueueAdapters.lookup(name_or_adapter).new
          queue_adapter.try(:check_adapter)
          assign_adapter(name_or_adapter.to_s, queue_adapter)
        else
          if queue_adapter?(name_or_adapter)
            adapter_name = ActiveJob.adapter_name(name_or_adapter).underscore
            assign_adapter(adapter_name, name_or_adapter)
          else
            raise ArgumentError
          end
        end
      end
      # …（省略）
        QUEUE_ADAPTER_METHODS = [:enqueue, :enqueue_at].freeze

        def queue_adapter?(object)
          QUEUE_ADAPTER_METHODS.all? { |meth| object.respond_to?(meth) }
        end
`}
          />
          <p>
            Sidekiq の gem（8.1.7）は、自分で <code>ActiveJob::QueueAdapters::SidekiqAdapter</code> を定義しています。Rails の側に同じ名前のクラスがあれば取り除いてから、AbstractAdapter を親にしたクラスを作り、<code>enqueue</code> と <code>enqueue_at</code> を実装します<Ref n={8} />。下位の詳細（Sidekiq）が上位の取り決め（Active Job が決めたメソッド）に合わせて実装を提供しているので、DIP の2つ目の文のとおりの形です。
          </p>
          <p>本書の検証用のアプリで、設定で選ばれた実装を test と development の環境で表示しました。</p>
          <Code
            lang="ruby"
            title="script/adapters.rb"
            code={`
# Rails が設定で選ぶ実装（アダプター）を表示する
puts "Rails.env:            #{Rails.env}"
puts "Active Job:           #{ConfirmOrderJob.queue_adapter.class}"
puts "Action Mailer:        #{ActionMailer::Base.delivery_method}"
puts "Rails.cache:          #{Rails.cache.class}"
puts "Active Record:        #{ActiveRecord::Base.connection.class}"
puts "倉庫（この章）:       #{Rails.configuration.x.warehouse.class}"
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/adapters.rb を test と development で）"
            code={`
Rails.env:            test
Active Job:           ActiveJob::QueueAdapters::TestAdapter
Action Mailer:        test
Rails.cache:          ActiveSupport::Cache::NullStore
Active Record:        ActiveRecord::ConnectionAdapters::Mysql2Adapter
倉庫（この章）:       Inventory::SokoLinkWarehouse

Rails.env:            development
Active Job:           ActiveJob::QueueAdapters::SidekiqAdapter
Action Mailer:        smtp
Rails.cache:          ActiveSupport::Cache::MemoryStore
Active Record:        ActiveRecord::ConnectionAdapters::Mysql2Adapter
倉庫（この章）:       Inventory::SokoLinkWarehouse
`}
          />
          <p>
            ConfirmOrderJob のコードは同じで、test では TestAdapter に、development では SidekiqAdapter に入ります。メールの送り方（<code>delivery_method</code>）、キャッシュの保存先（キャッシュストア）、データベースのアダプターも、設定で実装を選ぶ同じ構造です。これらは Rails がすでに取り決めを持っているので、アプリで取り決めを書き足す必要はありません。図 65-7 の左上の領域です。
          </p>
          <Figure n="65-8" title="Active Job のアダプターと、この章の倉庫" caption="破線の箱は取り決め、破線の矢印は取り決めを満たす関係。">
            <RailsFigure />
          </Figure>
          <p>
            図 65-8 は Active Job とこの章の倉庫を並べたものです。どちらも、使う側は取り決めだけを使い、実装は取り決めを満たし、どれを使うかは設定で決めます。違うのは取り決めを決めた側で、Active Job では Rails が、倉庫ではこのアプリが決めています。倉庫への取り決めはこのアプリの業務の言葉で書くもので、Rails や倉庫会社が用意してくれるものではありません。
          </p>
          <h3>Ruby のダックタイピングと取り決め</h3>
          <p>
            Ruby には interface の宣言が無く、オブジェクトの種類はクラスではなくどのメソッドに応答するかで判断します。この考え方をダックタイピングと呼びます。Active Job も、渡されたオブジェクトが <code>enqueue</code> と <code>enqueue_at</code> に応答するかで確かめていました。この章の Inventory も取り決めをコメントで書き、守っているかを共通のテストで確かめました。
          </p>
          <p>
            AbstractAdapter のように、<code>NotImplementedError</code> を投げる基底クラスを作る書き方もあります。メソッドの書き忘れには気付きやすくなりますが、基底クラスだけでは、戻り値の種類や例外の約束まで守っているかはわかりません。取り決めの中身を確かめるには、この章の <code>shared_examples</code> のような、振る舞いのテストが必要です。小さな取り決めに分ける考え方は ISP の章（<ChapterLink n={66} />）で扱います。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine は、DHH が Rails の設計の考え方をまとめた文書です。その項目「The menu is omakase」は、Rails は標準のフレームワークとライブラリの組み合わせを用意するが、一部を別のものに替えることもでき、ただし替えることを求めないと書いています<Ref n={4} />。Active Job のアダプターはこの「替えられるが、替えなくてよい」の例です。
          </p>
          <p>
            一方、項目「Value integrated systems」は、統合されたシステムでは不要な抽象の多くを省けると書いています<Ref n={4} />。Rails のアプリで Active Record や Rails の部品にまで取り決めを挟むと、この考え方に反し、「取り決めを挟みすぎたとき」の節で見た詰め替えの手間が生まれます。本書では、取り決めを挟む場所を、外部の会社の都合で変わるものとの境目に絞り、Rails の部品には直接依存することを勧めます。
          </p>
          <h3>本書のほかの章</h3>
          <ul>
            <li>依存先を外から渡す書き方、組み立てる場所、テストの代役の種類：<ChapterLink n={40} section="rails-impl" />、<ChapterLink n={40} section="test-doubles">同じ章の「テストダブルの種類と RSpec での書き方」の節</ChapterLink></li>
            <li>外部の SDK をアプリの取り決めに合わせる Adapter と、2つの Adapter に同じテストを当てる方法：<ChapterLink n={42} section="rails-impl" />、<ChapterLink n={42} section="test">同じ章の「2つの Adapter に同じテストを当てる」の節</ChapterLink></li>
            <li>依存性注入と Adapter の短い紹介：<ChapterLink n={33} section="dependency-injection" />、<ChapterLink n={33} section="adapters">同じ章の Adapter の節</ChapterLink></li>
            <li>処理をモデル・サービス・外部の境界のどこに置くか：<ChapterLink n={30} section="architecture-boundaries" /></li>
            <li>変わりやすいものから変わりにくいものへ依存する Stable Dependencies Principle：<ChapterLink n={75} /></li>
            <li>YAGNI と DIP のトレードオフ：<ChapterLink n={93} section="yagni-dip" /></li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          取り決めを挟むのは、変更を外部の会社が決め、差し替える必要が大きい依存先です。この章では倉庫会社の SDK を呼ぶコードを Adapter に集め、Order には注文の側で決めた取り決めだけを使わせました。自分たちや Rails が変更を決める DB・現在時刻・ログには、取り決めを挟みません。
        </>
      ),
      benefit: {
        text: <>SDK 2.0 への更新で直すファイルが、Order・コントローラー・ジョブとそのテストの6つから、Adapter とそのテストの2つになった。Order のテストは SDK のクラスを1つも書かず、メモリー上の在庫で取り決めを満たす Fake で動く。</>,
        basis: <><ChapterLink n={67} section="scene" />、<ChapterLink n={67} section="apply" /></>,
      },
      cost: {
        text: <>取り決め・Adapter・組み立てる場所・Fake・共通のテストの5つのファイルと、SDK の形を取り決めの形に変換するコードが増えた。変換を誤ると、Adapter のテストを書かない限り本番で初めて気付く。</>,
        basis: <ChapterLink n={67} section="apply" />,
      },
      alternative: {
        text: <>1社だけで替える予定も無い外部のサービスは、まず SDK を呼ぶコードを1つのクラスに集めるところまでにする。それだけでも SDK の更新で直す範囲は1つのクラスに収まる。DB・時計・ログにまで取り決めを挟んだ例では、列を1つ使うだけで4つのファイルを直すことになった。</>,
        basis: <ChapterLink n={67} section="overuse" />,
      },
      criterion: {
        text: <>その依存先の変更を決めるのは外部の会社か、自分たちや Rails か。実装が複数あるか、替える予定があるか。テストで通信・課金・送信を避けたいか。業務の規則を書いたコードが直接使っているか。</>,
        basis: <ChapterLink n={67} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>店の規則を書いた Order が倉庫会社の SDK を直接使っていると、SDK 2.0 への更新で、規則が変わらないのに Order・コントローラー・ジョブとそのテストの6つのファイルを直すことになりました。</li>
          <li>DIP は上位の方針を下位の詳細に依存させず、どちらも抽象に依存させる原則です。Martin が1996年に、抽象は詳細に依存せず詳細が抽象に依存する、という文とあわせて名付けました。</li>
          <li>「逆転」するのは依存の向きで、呼び出しの向きは変わりません。取り決めを上位の側に置き、上位の言葉で書くことが条件です。</li>
          <li>DI は依存先の受け取り方、DIP は依存先の形を決めます。SDK のクライアントを引数で受け取るだけでは、SDK の更新で同じようにテストが失敗しました。</li>
          <li>取り決め・Adapter・組み立てる場所・Fake・共通のテストに分けると、SDK 2.0 への更新で直すのは Adapter とそのテストの2つになりました。</li>
          <li>実装が1つで、自分たちや Rails が変更を決める依存先（Active Record・現在時刻・ログ）に取り決めを挟むと、列を1つ使うだけで4つのファイルを直す手間が増えます。</li>
          <li>Active Job のキューのアダプターは、Rails が持つ取り決めに Sidekiq などが実装を合わせる、DIP に沿った構造です。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'The Dependency Inversion Principle', publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）', url: 'https://cs.utexas.edu/~downing/papers/DIP-1996.pdf', accessed: '2026-11-21', version: '1996年（連載 Engineering Notebook の3回目。前回の LSP の記事は1996年3月）', note: '原則の2つの文、OCP と LSP から導いたこと、Copy の例と stdio.h、「逆転」という言葉の理由、上位が下位に変更を強いるべきだという主張、硬さ・もろさ・移植しにくさ、層の推移的な依存。' },
    { title: 'Inversion of Control Containers and the Dependency Injection pattern', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/articles/injection.html', accessed: '2026-11-13', version: '2004年1月23日', note: 'DI で大切なのは依存先の構成を利用から分けること。' },
    { title: 'DIP in the Wild', publisher: 'martinfowler.com / Brett L. Schuchert', url: 'https://martinfowler.com/articles/dipInTheWild.html', accessed: '2026-11-21', version: '2013年5月1日（5月21日に加筆）', note: 'DI は配線、IoC は呼び出しを始める側、DIP は依存先の形（抽象の水準）の問題であること。DB の接続を注入する例。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: '「The menu is omakase」の、替えられるが替えることを求めないという記述。「Value integrated systems」の、統合されたシステムでは不要な抽象を省けるという記述。' },
    { title: 'Active Job Basics', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_job_basics.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'Active Job がキューのバックエンドで実行するジョブを宣言する仕組みで、一貫した上位のインターフェースを提供すること。' },
    { title: 'activejob/lib/active_job/queue_adapters/abstract_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/queue_adapters/abstract_adapter.rb#L5-L23`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'AbstractAdapter が複数のキューのシステムを扱う抽象の層で、enqueue と enqueue_at を求めること。' },
    { title: 'activejob/lib/active_job/queue_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/queue_adapter.rb#L49-L76`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: '名前なら lookup でアダプターを作り、オブジェクトなら enqueue と enqueue_at に応答するかだけを確かめること。' },
    { title: 'lib/active_job/queue_adapters/sidekiq_adapter.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb#L36-L80', accessed: '2026-11-21', version: 'sidekiq 8.1.7（手元の gem のソースで確認）', note: 'Sidekiq の gem が Rails の SidekiqAdapter を取り除き、AbstractAdapter を親にした自分の SidekiqAdapter で enqueue と enqueue_at を実装すること。' },
    { title: 'Configuring Rails Applications', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'config.x による独自の設定、to_prepare が起動時と開発環境の再読み込みのたびに実行されること。' },
    { title: 'class Data', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-21', note: 'Data が変更できない値を持つクラスを作り、deconstruct・deconstruct_keys でパターンマッチに使えること。Ruby 3.2 で入ったことは Ruby 3.2 の NEWS で確認した。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-21', note: 'ブロックの引数を指す it が Ruby 3.4 で入ったこと。' },
    { title: 'NEWS for Ruby 3.2.0', publisher: 'Ruby 3.2 Documentation', url: 'https://docs.ruby-lang.org/en/3.2/NEWS_md.html', accessed: '2026-11-21', note: 'Data が Ruby 3.2 で入ったこと。' },
  ],
}

export default chapter
