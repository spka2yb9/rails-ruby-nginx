import type { ReactNode } from 'react'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T, type Fill } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const PUNDIT = 'https://github.com/varvet/pundit/blob/v2.5.2'

/* 図 49-1・49-2・49-4 で関心事ごとに使う色と名前 */
type Concern = 'auth' | 'state' | 'input' | 'save' | 'view'
const CONCERN: Record<Concern, { label: string; fill: Fill }> = {
  auth: { label: '権限', fill: 'box3' },
  state: { label: '注文の状態', fill: 'box5' },
  input: { label: '入力の検証', fill: 'box2' },
  save: { label: '保存', fill: 'box4' },
  view: { label: '表示の整形', fill: 'box' },
}

/* ---------- 図 49-1 場面の構成 ---------- */
function SceneFigure() {
  const blocks: { y: number; head: string; rows: { c: Concern; text: string; bad?: boolean }[] }[] = [
    {
      y: 20,
      head: 'Mypage::ShippingAddressesController#update（42行）',
      rows: [
        { c: 'auth', text: '注文した本人だけ（ほかは 403）' },
        { c: 'state', text: 'pending のときだけ変えられる' },
        { c: 'input', text: '全角を半角に・都道府県は47の一覧' },
        { c: 'save', text: '注文と履歴を1つのトランザクションで' },
        { c: 'view', text: 'JSON に「〒150-0001 …」を入れる' },
      ],
    },
    {
      y: 225,
      head: 'Admin::ShippingAddressesController#update（31行）',
      rows: [
        { c: 'auth', text: 'CS の担当者だけ' },
        { c: 'state', text: 'shipped でなければ変えられる', bad: true },
        { c: 'input', text: '全角の変換なし・都道府県は空でなければ', bad: true },
        { c: 'save', text: '注文だけ（履歴を残さない）', bad: true },
        { c: 'view', text: '通知の文と edit.html.erb の2か所で整形' },
      ],
    },
  ]
  const label = `会員はマイページとアプリから JSON で、CS の担当者は管理画面から HTML で配送先を変える。${blocks
    .map((b) => `${b.head}には、${b.rows.map((r) => `${CONCERN[r.c].label}：${r.text}${r.bad ? '（マイページと食い違う）' : ''}`).join('、')}が書かれている`)
    .join('。')}。マイページのアクションは orders と address_changes に書き込み、管理画面のアクションは orders だけに書き込む。CS の担当者がマイページの URL に送ると 403 になる`
  return (
    <Svg id="49-1" w={780} h={440} label={label}>
      <Box x={10} y={80} w={140} h={60} lines={['マイページ・アプリ', '会員（JSON）']} fs={12} fill="box4" subTone="muted" />
      <Box x={10} y={285} w={140} h={60} lines={['管理画面', 'CS の担当者（HTML）']} fs={12} fill="box4" subTone="muted" />
      <T x={10} y={366} fs={11} tone="danger">
        マイページの URL
      </T>
      <T x={10} y={382} fs={11} tone="danger">
        に送ると 403
      </T>
      <Arrow x1={150} y1={110} x2={173} y2={110} />
      <Arrow x1={150} y1={315} x2={173} y2={315} />
      {blocks.map((b) => (
        <g key={b.y}>
          <rect x={175} y={b.y} width={420} height={184} rx={8} fill="none" stroke="var(--fig-line)" />
          <T x={185} y={b.y + 18} fs={12} bold mono>
            {b.head}
          </T>
          {b.rows.map((r, i) => (
            <g key={r.c}>
              <Box x={185} y={b.y + 32 + i * 30} w={96} h={26} lines={CONCERN[r.c].label} fs={11} fill={CONCERN[r.c].fill} />
              <T x={292} y={b.y + 45 + i * 30} fs={12} tone={r.bad ? 'danger' : undefined}>
                {r.text}
              </T>
            </g>
          ))}
        </g>
      ))}
      <Box x={625} y={60} w={145} h={50} lines={['address_changes', '変更の履歴']} fs={12} fill="box4" subTone="muted" />
      <Box x={625} y={195} w={145} h={50} lines={['orders', '注文・配送先']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={595} y1={85} x2={623} y2={85} />
      <Arrow x1={595} y1={170} x2={623} y2={212} />
      <Arrow x1={595} y1={300} x2={623} y2={230} />
      <T x={625} y={128} fs={11} tone="danger">
        管理画面からは
      </T>
      <T x={625} y={144} fs={11} tone="danger">
        履歴が残らない
      </T>
      <T x={175} y={428} fs={12} tone="muted">
        赤い文字：マイページのアクションと食い違う箇所
      </T>
    </Svg>
  )
}

/* ---------- 図 49-2 アクションの中の関心事 ---------- */
function ConcernMapFigure() {
  const groups: { c: Concern; range: string; lines: string[] }[] = [
    { c: 'auth', range: '11〜15行', lines: ['order = Order.find(params[:order_id])', 'if order.user_id != current_user.id', '  return render json: {…}, status: :forbidden'] },
    { c: 'state', range: '16〜19行', lines: ['unless order.pending?', '  return render json: {…}, status: :unprocessable_content'] },
    {
      c: 'input',
      range: '21〜27行',
      lines: [
        'input = params.require(:shipping_address)',
        'postal_code = input[:postal_code].to_s.unicode_normalize(:nfkc).delete("-")',
        'errors << "郵便番号は…" unless postal_code.match?(/\\A\\d{7}\\z/)',
        'errors << "都道府県を…" unless PREFECTURES.include?(input[:prefecture])',
        'return render json: { errors: }, status: :unprocessable_content if errors.any?',
      ],
    },
    {
      c: 'save',
      range: '29〜35行',
      lines: [
        'before_address = "#{order.shipping_postal_code} …"',
        'Order.transaction do',
        '  order.update!(shipping_postal_code: postal_code, …)',
        '  AddressChange.create!(order:, changed_by: current_user, …)',
        'end',
      ],
    },
    { c: 'view', range: '37〜40行', lines: ['render json: {', '  message: "配送先を変更しました",', '  shipping_address: "〒#{postal_code[0, 3]}-#{postal_code[3, 4]} …" }'] },
  ]
  const placed: { g: (typeof groups)[number]; y: number; h: number }[] = []
  let y = 10
  for (const g of groups) {
    const h = g.lines.length * 18 + 10
    placed.push({ g, y, h })
    y += h + 8
  }
  return (
    <Svg
      id="49-2"
      w={780}
      h={y + 26}
      label={`直す前の Mypage::ShippingAddressesController#update の30行を、関心事ごとに色分けした。${groups
        .map((g) => `${g.range}は${CONCERN[g.c].label}`)
        .join('、')}。権限・注文の状態・入力の検証の3か所に、HTTP の応答を返す render がある`}
    >
      {placed.map(({ g, y: gy, h }) => (
        <g key={g.c}>
          <rect x={10} y={gy} width={760} height={h} rx={6} fill={`var(--fig-${CONCERN[g.c].fill})`} stroke="var(--fig-line)" />
          <T x={22} y={gy + 16} fs={12} bold>
            {CONCERN[g.c].label}
          </T>
          <T x={22} y={gy + 34} fs={11} tone="muted">
            {g.range}
          </T>
          {g.lines.map((line, i) => (
            <T key={line} x={140 + (line.length - line.trimStart().length) * 6.6} y={gy + 14 + i * 18} fs={11} mono>
              {line.trimStart()}
            </T>
          ))}
        </g>
      ))}
      <T x={10} y={y + 12} fs={12} tone="muted">
        行番号は app/controllers/mypage/shipping_addresses_controller.rb（直す前）のもの
      </T>
    </Svg>
  )
}

/* ---------- 図 49-3 Dijkstra の関心の分離と、この章の関心事 ---------- */
function DijkstraFigure() {
  const aspects: [Concern, string][] = [
    ['auth', '誰が変えてよいか'],
    ['state', '注文がまだ変えられる状態か'],
    ['input', '入力の形は正しいか'],
    ['save', '何をどう保存するか'],
    ['view', '結果をどう見せるか'],
  ]
  return (
    <Svg
      id="49-3"
      w={780}
      h={330}
      label={`左は Dijkstra の EWD447 の例。1つのプログラムを、正しいか、効率はよいか、そもそも望ましいかという側面に分け、ある日は1つの側面だけを考える。ほかの側面を無視するのではなく、その側面から見てほかの側面は関係がないと認めることだと書いている。右はこの章の配送先の変更を、${aspects
        .map(([, t]) => t)
        .join('、')}の5つの側面に分けたもの`}
    >
      <T x={10} y={18} bold>
        Dijkstra の例（EWD447、1974年）
      </T>
      <Box x={100} y={40} w={180} h={46} lines={['正しいか', 'ある日に、これだけを考える']} fs={12} fill="box5" subTone="muted" />
      <Box x={10} y={210} w={170} h={46} lines={['効率はよいか', '別の日に考える']} fs={12} fill="box5" subTone="muted" />
      <Box x={195} y={210} w={170} h={46} lines={['そもそも望ましいか', 'また別の機会に考える']} fs={12} fill="box5" subTone="muted" />
      <Box x={120} y={125} w={140} h={46} lines="1つのプログラム" fs={12} />
      <Arrow x1={190} y1={86} x2={190} y2={123} dashed />
      <Arrow x1={110} y1={210} x2={160} y2={173} dashed />
      <Arrow x1={270} y1={210} x2={220} y2={173} dashed />
      <T x={10} y={284} fs={12} tone="muted">
        1つの側面に注意を向ける。ほかの側面を無視するのではない
      </T>
      <T x={10} y={306} fs={12} mono tone="muted">
        "the separation of concerns"
      </T>

      <line x1={385} y1={8} x2={385} y2={322} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={400} y={18} bold>
        この章の配送先の変更
      </T>
      <Box x={405} y={135} w={130} h={50} lines={['配送先の変更', '1つの業務の操作']} fs={12} subTone="muted" />
      {aspects.map(([c, t], i) => (
        <g key={c}>
          <Box x={580} y={40 + i * 50} w={190} h={36} lines={t} fs={12} fill={CONCERN[c].fill} />
          <Arrow x1={580} y1={58 + i * 50} x2={537} y2={140 + i * 10} dashed />
        </g>
      ))}
      <T x={400} y={306} fs={12} tone="muted">
        側面ごとに、読む・直す・テストする単位を分ける
      </T>
    </Svg>
  )
}

/* ---------- 図 49-4 直す前と後 ---------- */
function BeforeAfterFigure() {
  const before: { y: number; head: string; rows: { c: Concern; text: string; bad?: boolean }[] }[] = [
    {
      y: 36,
      head: 'Mypage::…Controller（42行・JSON）',
      rows: [
        { c: 'auth', text: '権限：本人だけ' },
        { c: 'state', text: '注文の状態：pending だけ' },
        { c: 'input', text: '入力の検証：全角の変換・一覧' },
        { c: 'save', text: '保存：注文と履歴' },
        { c: 'view', text: '表示の整形：JSON の文字列' },
      ],
    },
    {
      y: 210,
      head: 'Admin::…Controller（31行・HTML）',
      rows: [
        { c: 'auth', text: '権限：CS の担当者だけ' },
        { c: 'state', text: '注文の状態：shipped 以外', bad: true },
        { c: 'input', text: '入力の検証：変換なし・空か', bad: true },
        { c: 'save', text: '保存：注文だけ', bad: true },
        { c: 'view', text: '表示の整形：通知の文とビュー' },
      ],
    },
  ]
  const entries: [number, string, string][] = [
    [40, 'Mypage::…Controller', '15行・JSON の応答'],
    [110, 'Admin::…Controller', '20行・HTML の応答'],
    [180, 'script/bulk_change.rb', 'コンソールから実行'],
  ]
  return (
    <Svg
      id="49-4"
      w={780}
      h={410}
      label="左の直す前は、マイページと管理画面の2つのアクションが、それぞれ権限・注文の状態・入力の検証・保存・表示の整形を自分の中に書いている。管理画面のほうは注文の状態・入力の検証・保存の3か所でマイページと食い違う。右の直した後は、マイページのコントローラー（15行）、管理画面のコントローラー（20行）、コンソールから実行する script/bulk_change.rb の3つの呼び出し元が、OrderPolicy（権限）、Order（入力の検証・注文の状態の規則・保存）、AddressHelper（表示の整形）を共通に使う。コントローラーには HTTP の入力と応答だけが残る"
    >
      <T x={10} y={16} bold>
        直す前
      </T>
      {before.map((b) => (
        <g key={b.y}>
          <rect x={10} y={b.y} width={330} height={160} rx={8} fill="none" stroke="var(--fig-line)" />
          <T x={20} y={b.y + 16} fs={11} bold mono>
            {b.head}
          </T>
          {b.rows.map((r, i) => (
            <g key={r.c}>
              <Box x={20} y={b.y + 30 + i * 25} w={310} h={21} lines={r.text} fs={11} fill={CONCERN[r.c].fill} align="start" />
              {r.bad && (
                <T x={322} y={b.y + 41 + i * 25} fs={11} anchor="end" tone="danger">
                  食い違う
                </T>
              )}
            </g>
          ))}
        </g>
      ))}
      <T x={10} y={392} fs={12} tone="danger">
        同じ関心事を2か所に書き、3か所で食い違った
      </T>

      <line x1={355} y1={6} x2={355} y2={404} stroke="var(--fig-line)" strokeDasharray="3 4" />

      <T x={370} y={16} bold>
        直した後
      </T>
      {entries.map(([ey, a, b]) => (
        <g key={a}>
          <Box x={370} y={ey} w={165} h={56} lines={[a, b]} fs={11} mono subTone="muted" />
          <Arrow x1={535} y1={ey + 28} x2={558} y2={ey + 28} />
        </g>
      ))}
      <T x={370} y={258} fs={11} tone="muted">
        呼び出し元には HTTP の入力と応答
      </T>
      <T x={370} y={274} fs={11} tone="muted">
        （コンソールでは出力）だけを書く
      </T>
      <rect x={560} y={28} width={210} height={300} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={572} y={44} fs={11} tone="muted">
        どの呼び出し元も同じものを使う
      </T>
      <Box x={572} y={58} w={186} h={50} lines={['OrderPolicy', '権限']} fs={12} fill="box3" subTone="muted" />
      <Box x={572} y={120} w={186} h={110} lines={['Order', '入力の検証', '注文の状態の規則', '保存（注文と履歴）']} fs={12} fill="box" bold subTone="muted" />
      <Box x={572} y={242} w={186} h={50} lines={['AddressHelper', '表示の整形']} fs={12} fill="box" subTone="muted" />
      <T x={370} y={392} fs={12} tone="acc">
        規則は1か所。どの呼び出し元からでも同じ結果になった
      </T>
    </Svg>
  )
}

/* ---------- 図 49-6 分けるかどうかの判断 ---------- */
function JudgeFigure() {
  return (
    <Svg
      id="49-6"
      w={760}
      h={440}
      label="横軸は同じ処理を呼び出す場所の数（左が1つ、右が画面・API・コンソール・ジョブなど複数）、縦軸は関心事ごとの規則の量（下が少ない、上が多い）。右上は置き場所を分ける領域で、この章の配送先の変更が入り、ポリシー・モデルのメソッド・ヘルパーに分ける。左上は呼び出し元が1つでも規則をモデルとポリシーに移す領域で、関心事ごとにテストを書け、別の呼び出し元が来たらそのまま使える。右下は Rails の標準の置き場所で足りる領域で、会員の名前の変更のように、モデルの validates がどの呼び出し元からの保存でも実行される。左下は Rails の標準の形のままにする領域で、メールマガジンの設定のようにコントローラーの update とモデルで書く。左下を Form・Policy・Service・Presenter に分けるのが当てはめすぎ"
    >
      <Arrow x1={110} y1={372} x2={110} y2={34} />
      <Arrow x1={110} y1={372} x2={745} y2={372} />
      <T x={118} y={24} fs={12} bold>
        関心事ごとの規則の量（権限の種類・状態の規則・入力の正規化）
      </T>
      <T x={102} y={60} fs={12} anchor="end" tone="muted">
        多い
      </T>
      <T x={102} y={344} fs={12} anchor="end" tone="muted">
        少ない
      </T>
      <T x={120} y={390} fs={12} tone="muted">
        1つ
      </T>
      <T x={740} y={390} fs={12} anchor="end" tone="muted">
        複数（画面・API・コンソール・ジョブ）
      </T>
      <T x={428} y={412} fs={12} anchor="middle" bold>
        同じ処理を呼び出す場所の数
      </T>
      <Box x={124} y={44} w={290} h={150} lines={['規則をモデルとポリシーに移す', '呼び出し元が1つでも、関心事ごとに', 'テストを書ける', '別の呼び出し元が来たらそのまま使う']} fs={12} bold subTone="muted" />
      <Box x={440} y={44} w={300} h={150} lines={['置き場所を分ける（この章）', '配送先の変更', 'ポリシー・モデルのメソッド・ヘルパー', 'どの呼び出し元からも同じ結果になる']} fs={12} bold accent subTone="muted" />
      <Box x={124} y={208} w={290} h={150} lines={['Rails の標準の形のまま', 'メールマガジンの設定', 'コントローラーの update と', 'モデルの validates']} fs={12} bold subTone="muted" />
      <Box x={440} y={208} w={300} h={150} lines={['Rails の標準の置き場所で足りる', '会員の名前の変更など', 'モデルの validates が', 'どの呼び出し元からの保存でも実行される']} fs={12} bold subTone="muted" />
      <T x={124} y={432} fs={12} tone="danger">
        左下を Form・Policy・Service・Presenter に分けるのが当てはめすぎ（例：Heavy::Newsletter…）
      </T>
    </Svg>
  )
}

/* ---------- 図 49-7 Rails の MVC と関心事の置き場所 ---------- */
function RailsFigure() {
  const notes: [string, string][] = [
    ['全リクエストに共通', 'ミドルウェア'],
    ['複数のアクションに共通', 'before_action'],
    ['受け付けるキー', 'Strong Parameters'],
    ['誰が変えてよいか', 'ポリシー'],
    ['検証・状態の規則・保存', 'モデル'],
    ['表示の整形', 'ビュー・ヘルパー'],
  ]
  const rows: ReactNode[] = []
  for (let i = 0; i < notes.length; i++) {
    const [k, v] = notes[i]
    rows.push(
      <g key={k}>
        <T x={10} y={240 + i * 26} fs={11}>
          {k}
        </T>
        <T x={278} y={240 + i * 26} fs={11} anchor="end" tone="acc">
          → {v}
        </T>
      </g>,
    )
  }
  return (
    <Svg
      id="49-7"
      w={780}
      h={430}
      label={`ブラウザーやアプリからのリクエストは、Rack のミドルウェア、ルーティングを通ってコントローラーに届く。コントローラーは before_action、params.expect、authorize、render と redirect_to を使い、権限の判断を Pundit のポリシーに任せる。コントローラーはモデル（normalizes と validates、change_shipping_address、保存とトランザクション）を呼び、モデルは MySQL に保存する。コントローラーはビューとヘルパー（ERB・JSON、AddressHelper、I18n の訳文）で応答を作る。関心事の置き場所：${notes
        .map(([k, v]) => `${k}は${v}`)
        .join('、')}。ポリシーは Rails の標準に含まれず gem で足す`}
    >
      <Box x={10} y={30} w={110} h={56} lines={['ブラウザー', 'アプリ']} fs={12} fill="box4" />
      <Arrow x1={120} y1={58} x2={143} y2={58} />
      <Box x={145} y={30} w={125} h={56} lines={['Rack の', 'ミドルウェア']} fs={12} />
      <Arrow x1={270} y1={58} x2={293} y2={58} />
      <Box x={295} y={30} w={105} h={56} lines={['ルーティング', 'routes.rb']} fs={12} subTone="muted" />
      <Arrow x1={400} y1={58} x2={423} y2={58} />
      <Box x={425} y={30} w={200} h={126} lines={['コントローラー', 'before_action', 'params.expect', 'authorize', 'render・redirect_to']} fs={12} bold subTone="muted" />
      <Arrow x1={625} y1={58} x2={648} y2={58} />
      <Box x={650} y={30} w={120} h={56} lines={['ポリシー', 'Pundit（gem）']} fs={12} fill="box3" dashed subTone="muted" />
      <Arrow x1={480} y1={156} x2={430} y2={208} />
      <Arrow x1={580} y1={156} x2={650} y2={208} />
      <Box x={300} y={210} w={230} h={110} lines={['モデル（Active Record）', 'normalizes・validates', 'change_shipping_address', '保存とトランザクション']} fs={12} bold subTone="muted" />
      <Box x={555} y={210} w={215} h={110} lines={['ビュー・ヘルパー', 'ERB・JSON', 'AddressHelper', 'I18n の訳文']} fs={12} bold subTone="muted" />
      <Arrow x1={415} y1={320} x2={415} y2={358} />
      <Box x={300} y={360} w={230} h={40} lines="MySQL" fs={12} fill="box4" />
      <T x={10} y={212} fs={12} bold>
        関心事の置き場所
      </T>
      {rows}
      <T x={555} y={348} fs={11} tone="muted">
        破線の箱は Rails の標準に
      </T>
      <T x={555} y={366} fs={11} tone="muted">
        含まれない（gem で足す）
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 68,
  part: 8,
  title: 'SoC（関心の分離）：1つのアクションに混ざった表示・検証・権限・保存を分ける',
  summary:
    '会員がマイページから注文の配送先を変えるアクションに、権限・注文の状態の規則・入力の検証・保存・表示の整形が混ざっていたため、CS の管理画面からは同じ処理を使えず、写して書いたアクションが3か所で食い違った例で、関心の分離（SoC）を扱います。関心事ごとにポリシー・モデル・ヘルパーへ置き場所を分け、2つの画面とコンソールから同じものを使う直し方と、分けすぎたときの費用、Rails の MVC との関係を示します。',
  goals: [
    '関心の分離（SoC）の「関心事」が、問題を考えるときの側面（誰が・どの状態で・どんな値を・どう保存し・どう見せるか）を指すことを、Dijkstra の EWD447 の説明とあわせて説明できる',
    '1つのアクションに関心事が混ざると、別の画面から同じ処理を使えず、写したコードが食い違うことを、実行結果をもとに説明できる',
    '権限と注文の状態の規則のように、同じ場所に書かれやすいが別の関心事であるものを見分けられる',
    '権限をポリシーに、入力の検証・状態の規則・保存をモデルに、表示の整形をヘルパーに移し、コントローラーを HTTP の入力と応答だけにできる',
    '規則が少なく呼び出し元が1つの処理をクラスに分けすぎたときの費用を説明し、分けるかどうかを判断できる',
    'Rails の MVC・Strong Parameters・Concern と関心の分離の関係を、Rails のガイドと Rails Doctrine をもとに説明できる',
  ],
  prerequisites: [10, 14, 63],
  sections: [
    {
      id: 'scene',
      title: '配送先を変えるアクションに5つの関心事が混ざり、管理画面で同じ処理を使えない',
      body: (
        <>
          <p>
            この章では、会員が注文の配送先を変える処理を例に、<Term en="Separation of Concerns、SoC">関心の分離</Term>を扱います。関心の分離は異なる責務や関心事を明確に分離するという原則です。<ChapterLink n={63} />（SRP）ではコードを変えるよう求める人（経理部・CS など）ごとにクラスを分けました。この章では1つの業務の操作を「誰が行ってよいか」「入力は正しいか」「どう保存するか」「どう見せるか」のような側面に分けて考え、側面ごとにコードの置き場所を決めます。2つの原則の違いは「意味と由来」の節で比べます。
          </p>
          <h3>そもそも配送先の変更とは</h3>
          <p>
            雑貨を売る EC サイトを考えます。お客さんが注文すると、サイトは倉庫に出荷を依頼し、倉庫の担当者が棚から商品を集めて箱に詰め、送り状を印刷して貼り、発送します。このサイトの注文の状態は次の3つです。
          </p>
          <ul>
            <li>pending：注文を受け付けた。倉庫はまだ作業を始めていない</li>
            <li>picking：倉庫で商品を集めている。送り状はすでに印刷した</li>
            <li>shipped：発送した</li>
          </ul>
          <p>
            引っ越しや贈り物の都合で、注文した後に届け先を変えたいお客さんがいます。このサイトでは、倉庫が作業を始める前（pending の間）なら、会員がマイページから配送先を変えられます。倉庫が作業を始めた後は、古い住所で送り状を印刷しているので変えられません。マイページの画面とスマートフォンのアプリは、同じ API を JSON で呼びます。
          </p>
          <p>
            電話で届け先の変更を頼まれることもあります。そのときは CS（カスタマーサポート）の担当者が、社内の管理画面から代わりに変えます。CS は「住所を変えたはずなのに届かない」という問い合わせに答えるために、いつ誰が配送先を何から何へ変えたかの履歴を見ます。注文と配送先は orders テーブルに、変更の履歴は address_changes テーブルに保存します。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_tables.rb"
            code={`
class CreateTables < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.string :role, null: false, default: "customer" # customer・support（CS の担当者）
      t.timestamps
    end

    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.string :number, null: false, index: { unique: true } # 注文番号（A-1001 など）
      t.string :status, null: false, default: "pending"       # pending・picking（倉庫で作業中）・shipped
      t.string :shipping_postal_code, null: false             # 郵便番号（ハイフンなしの7桁）
      t.string :shipping_prefecture, null: false
      t.string :shipping_address_line, null: false            # 市区町村・番地・建物名
      t.timestamps
    end

    create_table :address_changes do |t|
      t.references :order, null: false, foreign_key: true
      t.references :changed_by, null: false, foreign_key: { to_table: :users }
      t.string :before_address, null: false
      t.string :after_address, null: false
      t.timestamps
    end
  end
end
`}
          />
          <h3>マイページのアクション</h3>
          <p>最初に作られたのはマイページのアクションです。配送先を変えるための処理が1つのアクションにすべて書かれています。</p>
          <Code
            lang="ruby"
            title="app/controllers/mypage/shipping_addresses_controller.rb（直す前）"
            code={`
class Mypage::ShippingAddressesController < ApplicationController
  PREFECTURES = %w[北海道 青森県 岩手県 …].freeze # …（省略：47の都道府県）

  # PATCH /mypage/orders/:order_id/shipping_address（スマートフォンのアプリとマイページから JSON で呼ぶ）
  def update
    order = Order.find(params[:order_id])
    # 自分の注文だけ変更できる
    if order.user_id != current_user.id
      return render json: { error: "この注文の配送先は変更できません" }, status: :forbidden
    end
    # 倉庫が作業を始めた注文は変更できない
    unless order.pending?
      return render json: { error: "発送の準備に入ったため、配送先を変更できません" }, status: :unprocessable_content
    end

    input = params.require(:shipping_address)
    postal_code = input[:postal_code].to_s.unicode_normalize(:nfkc).delete("-")
    errors = []
    errors << "郵便番号は7桁の数字で入力してください" unless postal_code.match?(/\\A\\d{7}\\z/)
    errors << "都道府県を選んでください" unless PREFECTURES.include?(input[:prefecture])
    errors << "住所を入力してください" if input[:address_line].blank?
    return render json: { errors: }, status: :unprocessable_content if errors.any?

    before_address = "#{order.shipping_postal_code} #{order.shipping_prefecture}#{order.shipping_address_line}"
    Order.transaction do
      order.update!(shipping_postal_code: postal_code, shipping_prefecture: input[:prefecture],
                    shipping_address_line: input[:address_line].strip)
      AddressChange.create!(order:, changed_by: current_user, before_address:,
                            after_address: "#{postal_code} #{order.shipping_prefecture}#{order.shipping_address_line}")
    end

    render json: {
      message: "配送先を変更しました",
      shipping_address: "〒#{postal_code[0, 3]}-#{postal_code[3, 4]} #{order.shipping_prefecture}#{order.shipping_address_line}"
    }
  end
end
`}
          />
          <p>
            このアクションは上から順に、注文を探して本人の注文かを確かめ、注文が pending かを確かめます。次に、郵便番号の全角の数字とハイフンを半角にそろえてから、郵便番号・都道府県・住所を確かめます。<code>unicode_normalize(:nfkc)</code> は、文字列を Unicode の正規化形式 NFKC に変える String のメソッドで、全角の数字とハイフンは半角になります。最後に、注文と履歴を1つのトランザクションで保存し、郵便番号を「〒150-0001」の形にして JSON で返します。ログインの確かめ方（<code>current_user</code>）は ApplicationController に書いてあり、この章の検証用のアプリではパスワードの確認を省いています。
          </p>
          <h3>管理画面のアクション</h3>
          <p>
            次に、CS の担当者が電話の依頼を受けて配送先を変えられるように、管理画面を作ることになりました。担当した開発者はマイページのアクションを管理画面から使えないかを調べましたが、次の理由で使えませんでした。
          </p>
          <ul>
            <li>本人の注文かどうかの確認がアクションに書かれているので、CS の担当者が送ると 403 になる</li>
            <li>結果を JSON で返すので、HTML の画面にエラーを表示したり、編集画面に戻したりできない</li>
            <li>入力の検証と保存がアクションの中にあり、ほかの場所から呼べるメソッドになっていない</li>
          </ul>
          <p>そこで開発者はマイページのアクションを写し、管理画面に合わせて書き換えました。</p>
          <Code
            lang="ruby"
            title="app/controllers/admin/shipping_addresses_controller.rb（直す前）"
            code={`
# CS の担当者が、電話で依頼を受けて配送先を変える画面。マイページのアクションを写して書いた
class Admin::ShippingAddressesController < ApplicationController
  def edit
    return head :forbidden unless current_user.support?

    @order = Order.find(params[:order_id])
  end

  def update
    return head :forbidden unless current_user.support?

    @order = Order.find(params[:order_id])
    if @order.shipped?
      @errors = ["発送済みのため、配送先を変更できません"]
      return render :edit, status: :unprocessable_content
    end

    input = params.require(:shipping_address)
    postal_code = input[:postal_code].to_s.delete("-")
    @errors = []
    @errors << "郵便番号は7桁の数字で入力してください" unless postal_code.match?(/\\A\\d{7}\\z/)
    @errors << "都道府県を入力してください" if input[:prefecture].blank?
    @errors << "住所を入力してください" if input[:address_line].blank?
    return render :edit, status: :unprocessable_content if @errors.any?

    @order.update!(shipping_postal_code: postal_code, shipping_prefecture: input[:prefecture],
                   shipping_address_line: input[:address_line].strip)
    redirect_to edit_admin_order_shipping_address_path(@order),
                notice: "配送先を 〒#{postal_code[0, 3]}-#{postal_code[3, 4]} #{@order.shipping_prefecture}#{@order.shipping_address_line} に変更しました"
  end
end
`}
          />
          <p>
            書き換えるときに、次の違いが生まれました。開発者は「発送前なら変えられる」と考えて状態の確認を <code>shipped?</code> にし、都道府県を自由に入力する欄にしたので一覧の確認を外しました。全角の変換と履歴の保存は写し忘れました。郵便番号を「〒150-0001」の形にする処理は、通知の文と編集画面のビュー（edit.html.erb）の2か所に書きました。
          </p>
          <Figure n="49-1" title="場面の構成：2つのアクションと、食い違う箇所" caption="色は関心事の種類を表す（図 49-2・49-4 も同じ）。赤い文字はマイページのアクションと食い違う箇所。">
            <SceneFigure />
          </Figure>
          <p>
            図 49-1 はこの場面の構成です。会員と CS の担当者は別々のアクションを通って、同じ orders テーブルを書き換えます。2つのアクションはどちらも同じ5種類の処理を自分の中に持っていて、そのうち3つが食い違っています。
          </p>
          <h3>同じ入力を2つの画面に送る</h3>
          <p>
            食い違いを確かめるために、同じ入力をマイページと管理画面の両方に送り、応答の状態コードと保存された値を表示するスクリプトを書きました。ケースごとに注文を作り、終わったらトランザクションを巻き戻します。
          </p>
          <Code
            lang="ruby"
            title="script/compare.rb（抜粋）"
            code={`
# 同じ入力を、マイページ（JSON）と管理画面（HTML）に送り、応答と保存された値を比べる
# 実行：RAILS_ENV=test bin/rails runner script/compare.rb
CASES = [
  ["正しい入力", {}, "pending"],
  ["全角の郵便番号「１５０－０００１」", { postal_code: "１５０－０００１" }, "pending"],
  ["都道府県が「東京」", { prefecture: "東京" }, "pending"],
  ["倉庫で作業中（picking）の注文", {}, "picking"],
].freeze

# 1つのケースを1つの画面に送り、「応答の状態コード 保存された郵便番号と都道府県 履歴の件数」を返す
def run_case(path_name, user, input, status, customer)
  result = nil
  ActiveRecord::Base.transaction do
    order = Order.create!(user: customer, number: "A-1001", status:, shipping_postal_code: "1000001",
                          shipping_prefecture: "東京都", shipping_address_line: "千代田区千代田1-1")
    session = ActionDispatch::Integration::Session.new(Rails.application)
    session.post "/session", params: { email: user.email }
    params = { shipping_address: { postal_code: "150-0001", prefecture: "東京都", address_line: "渋谷区神宮前1-2-3" }.merge(input) }
    # …（省略：PATCH を送る。マイページには JSON で、管理画面には HTML を求めて送る）
    order.reload
    result = format("%d %s %s 履歴%d件", session.response.status, order.shipping_postal_code, order.shipping_prefecture, order.address_changes.count)
    raise ActiveRecord::Rollback
  end
  result
end
# …（省略：表を出力する）
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=test bin/rails runner script/compare.rb・直す前）"
            code={`
ケース                              マイページ（会員）            管理画面（CS）
正しい入力                          200 1500001 東京都 履歴1件    302 1500001 東京都 履歴0件
全角の郵便番号「１５０－０００１」  200 1500001 東京都 履歴1件    422 1000001 東京都 履歴0件
都道府県が「東京」                  422 1000001 東京都 履歴0件    302 1500001 東京 履歴0件
倉庫で作業中（picking）の注文       422 1000001 東京都 履歴0件    302 1500001 東京都 履歴0件

CS の担当者がマイページの URL に送ると：403 1000001 東京都 履歴0件
`}
          />
          <p>結果を行ごとに読みます。管理画面の 302 は変更に成功して編集画面へ移すときの状態コードです。</p>
          <ul>
            <li>正しい入力ではどちらも配送先を変えますが、管理画面からは履歴が残りません。CS が後で履歴を調べても、CS 自身が変えた記録が見つかりません。</li>
            <li>全角の郵便番号はマイページでは半角の7桁にそろえて受け付け、管理画面では 422 で拒みます。電話で聞き取った番号を全角で入力すると、CS の担当者だけが入力し直すことになります。</li>
            <li>都道府県の「東京」はマイページでは拒み、管理画面ではそのまま保存します。</li>
            <li>倉庫で作業中の注文はマイページでは変えられず、管理画面では変えられます。倉庫は古い住所で送り状を印刷しているので、DB の配送先と送り状の住所が食い違います。</li>
            <li>CS の担当者がマイページの URL に送ると 403 になります。マイページのアクションを管理画面から使えないことが、ここでも確かめられます。</li>
          </ul>
          <h3>アクションに混ざっている関心事</h3>
          <p>マイページのアクションの30行を、何について判断しているかで分けると図 49-2 になります。</p>
          <Figure n="49-2" title="マイページのアクションの中の関心事" caption="直す前のアクションを、何について判断している行かで色分けした。">
            <ConcernMapFigure />
          </Figure>
          <p>
            30行の中に、性質の違う5つの<Term en="concern">関心事</Term>が並んでいます。関心事とは問題を考えるときの1つの側面のことです。この章では次の5つを扱います。
          </p>
          <ul>
            <li>権限：この人がこの注文の配送先を変えてよいか</li>
            <li>注文の状態：この注文はまだ配送先を変えられる状態か</li>
            <li>入力の検証：送られた値は郵便番号・都道府県・住所として正しいか</li>
            <li>保存：何をどのテーブルに、どの単位（トランザクション）で書くか</li>
            <li>表示の整形：結果を利用者にどんな形の文字列で見せるか</li>
          </ul>
          <p>
            さらに、HTTP の応答を返す <code>render</code> が、権限・注文の状態・入力の検証の3か所に書かれています。そのため、入力の検証の規則だけを読みたい人も、JSON の形と状態コードの行を読み分ける必要があります。2つのアクションのファイルから、関心事ごとの行を grep で探すと次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（grep -rn で、権限・注文の状態・郵便番号の変換・整形の行を探した・直す前・抜粋）"
            code={`
app/views/admin/shipping_addresses/edit.html.erb:3:<p>現在：〒<%= @order.shipping_postal_code[0, 3] %>-<%= @order.shipping_postal_code[3, 4] %> …
app/controllers/mypage/shipping_addresses_controller.rb:13:    if order.user_id != current_user.id
app/controllers/mypage/shipping_addresses_controller.rb:17:    unless order.pending?
app/controllers/mypage/shipping_addresses_controller.rb:22:    postal_code = input[:postal_code].to_s.unicode_normalize(:nfkc).delete("-")
app/controllers/mypage/shipping_addresses_controller.rb:39:      shipping_address: "〒#{postal_code[0, 3]}-#{postal_code[3, 4]} #{order.shipping_prefec…
app/controllers/admin/shipping_addresses_controller.rb:4:    return head :forbidden unless current_user.support?
app/controllers/admin/shipping_addresses_controller.rb:10:    return head :forbidden unless current_user.support?
app/controllers/admin/shipping_addresses_controller.rb:13:    if @order.shipped?
app/controllers/admin/shipping_addresses_controller.rb:19:    postal_code = input[:postal_code].to_s.delete("-")
app/controllers/admin/shipping_addresses_controller.rb:29:                notice: "配送先を 〒#{postal_code[0, 3]}-#{postal_code[3, 4]} #{@order.shipping_p…
`}
          />
          <p>
            郵便番号を「〒150-0001」の形にする処理は3か所にあり、注文の状態と郵便番号の変換は2つのアクションで書き方が違います。郵便番号の規則を変えるときは、この一覧を自分で作って、すべての箇所を直す必要があります。
          </p>
          <p>
            テストも、5つの関心事をまとめて準備しないと書けません。マイページのアクションのテストは5件ありますが、郵便番号の全角の変換だけを確かめたいときでも、会員を作ってログインし、本人の pending の注文を用意して、JSON の PATCH を送る必要があります。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/mypage_shipping_addresses_spec.rb（直す前・抜粋）"
            code={`
RSpec.describe "マイページの配送先の変更", type: :request do
  let(:customer) { create_customer }
  let(:order) { create_order(customer) }

  def send_address(postal_code:, prefecture: "東京都", address_line: "渋谷区神宮前1-2-3")
    patch mypage_order_shipping_address_path(order),
          params: { shipping_address: { postal_code:, prefecture:, address_line: } }, as: :json
  end

  # 郵便番号の変換を確かめるだけでも、ログイン・本人の注文・作業前の状態をそろえて HTTP で送る
  before { log_in(customer) }

  it "全角の郵便番号をハイフンなしの7桁にして保存し、整形した住所を返す" do
    send_address(postal_code: "１５０－０００１")

    expect(response).to have_http_status(:ok)
    expect(order.reload.shipping_postal_code).to eq "1500001"
    expect(response.parsed_body["shipping_address"]).to eq "〒150-0001 東京都渋谷区神宮前1-2-3"
  end
  # …（省略：都道府県・履歴・倉庫で作業中・ほかの会員の4件）
end
`}
          />
          <p>
            <code>create_customer</code> と <code>create_order</code> は spec/support に置いた、会員と注文を作るメソッドです。管理画面のアクションには、写したときにテストが書かれませんでした。マイページのテストは5件とも通ります。
          </p>
          <h3>何が問題か</h3>
          <ul>
            <li>1つのアクションに5つの関心事と HTTP の応答が混ざっているので、別の画面から同じ処理を使えません。管理画面は写して書くことになり、写したコードは3か所で食い違いました。</li>
            <li>関心事ごとの規則（変えられる状態・郵便番号の形・履歴を残すこと）がアクションの中にしかないので、新しい呼び出し元（一括の変更のスクリプト、ジョブ、別の版の API のように、同じ処理を呼び出す場所）を作るたびに同じことが起きます。</li>
            <li>郵便番号の規則を変えるには、規則を書いた箇所を探して全部を直す必要があり、直し漏れを見つける仕組みがありません。</li>
            <li>1つの関心事だけを確かめるテストでも、ほかの関心事の準備（ログイン・本人の注文・注文の状態・JSON の形）が要ります。</li>
            <li>「倉庫が作業を始めたら変えられない」は CS にも当てはまる業務の規則ですが、本人かどうかの確認と並べて書かれていたため、管理画面を作った開発者は、画面ごとに決めてよい条件だと読み違えました。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'meaning',
      title: '側面ごとに分けて考え、分けて置く：関心の分離の意味と由来',
      body: (
        <>
          <h3>定義</h3>
          <p>
            関心の分離（SoC）は異なる責務や関心事を明確に分離するという原則です。ここでの関心事は問題を考えるときの側面、つまり「何について判断しているか」です。この章の配送先の変更では権限・注文の状態・入力の検証・保存・表示の整形の5つが関心事でした。
          </p>
          <p>「明確に分離する」には2つの段階があります。</p>
          <ul>
            <li>考えるときの分離：1つの側面を考えている間は、ほかの側面を持ち込まない。たとえば郵便番号の規則を決めるときは、誰が変えるかや JSON の形を考えない。</li>
            <li>コードの分離：1つの関心事を、ほかの関心事を読まずに読める・直せる・テストできる場所に置く。この章ではポリシー・モデル・ヘルパー・コントローラーに置き場所を分ける。</li>
          </ul>
          <p>
            この章で直すのはコードの分離ですが、その前に、混ざっている処理を関心事ごとに見分けて名前を付ける作業（図 49-2）が要ります。見分けられていない関心事は、ファイルを分けても同じ所に書かれたままになるからです。
          </p>
          <h3>由来：Dijkstra の EWD447（1974年）</h3>
          <p>
            関心の分離という言葉は、オランダの計算機科学者 Edsger W. Dijkstra が1974年8月30日の日付で書いた文書「On the role of scientific thought」（EWD447）に出てきます<Ref n={1} />。この文書は、テキサス大学オースティン校の E. W. Dijkstra Archive が書き起こしを公開しています。Dijkstra はこの文書で、知人への手紙から次の一節を引いています<Ref n={1} />。
          </p>
          <blockquote>
            <p>
              知的な考え方に特有なのは、自分が扱う題材の1つの側面を、その側面の一貫性のために切り離して深く調べようとすることだ。そのあいだ、自分が扱っているのは側面の1つだけだと承知している。プログラムは正しくなければならないと私たちは知っていて、その観点だけから調べることができる。効率もよくなければならないと知っていて、いわば別の日に効率を調べることができる。また別の機会に、そもそもそのプログラムが望ましいのか、望ましいならなぜかを問うこともある。これらの側面に同時に取り組んでも、得るものはない。これが、私がときどき「関心の分離」と呼んできたものである。完全にはできないとしても、考えを効果的に整理する方法として私が知っている唯一のものだ。
            </p>
            <p>
              原文：It is what I sometimes have called &quot;the separation of concerns&quot;, which, even if not perfectly possible, is yet the only available technique for effective ordering of one&apos;s thoughts, that I know of.
            </p>
          </blockquote>
          <p>
            Dijkstra は続けて、ある側面に注意を向けるとは、ほかの側面を無視することではなく、その側面から見ればほかの側面は関係がないという事実を正しく扱うことだと書いています<Ref n={1} />。この一節が述べているのは、プログラムのコードの分け方ではなく、考えを整理する方法です。
          </p>
          <p>
            文書の後半にはコードの分け方に近い例もあります。Dijkstra は業務のデータ処理のシステムでも、「必要を満たすものを作る」という1つの仕事を、「必要を満たすためにものが持つべき性質を述べること」と「述べた性質を持つと保証されたものを作ること」の2つに分ける必要があると書き、これも関心の分離と呼んでいます<Ref n={1} />。仕様を決めることと、仕様どおりに作ることを分けるという意味です。
          </p>
          <p>
            「私がときどき呼んできた」という書き方からは、Dijkstra がこの文書より前からこの言葉を使っていたことが読み取れます。Robert C. Martin は SRP についての2014年のブログ記事で、Dijkstra がこの文書で関心の分離という言葉を導入したと書いています<Ref n={2} />。本書では、EWD447 より前に Dijkstra がこの言葉を書いた資料は確かめていません。
          </p>
          <Figure n="49-3" title="Dijkstra の関心の分離と、この章の関心事" caption="左は EWD447 の例。右はこの章の配送先の変更を同じように側面に分けたもの。破線の矢印は「その側面から見る」ことを表す。">
            <DijkstraFigure />
          </Figure>
          <p>
            図 49-3 の左は Dijkstra の例、右はこの章の配送先の変更を同じように側面に分けたものです。Dijkstra は側面ごとに別の日に考えると書きました。これをコードに当てはめると、側面ごとに別のメソッドやファイルに置き、別々に読み、直し、テストできるようにすることになります。
          </p>
          <h3>「完全にはできない」という条件</h3>
          <p>
            Dijkstra は、関心の分離は完全にはできないとも書いています<Ref n={1} />。この章の例でも、5つの関心事は互いに関係しています。履歴に残す住所は入力の検証で半角にそろえた後の値で、表示の整形は保存された値を使い、権限の判断には注文の持ち主が要ります。関心の分離は関係を断つことではなく、1つの関心事を扱うときに、ほかの関心事のどこまでを知っていればよいかを小さく決めることです。たとえば直した後の表示の整形（AddressHelper）が知っているのは、Order の3つの列の名前だけで、権限や注文の状態の規則は知りません。
          </p>
          <h3>SRP との違い</h3>
          <p>
            <ChapterLink n={63} />で扱った SRP は、モジュールが変更される理由を1つに絞る原則で、Martin は変更の理由を、変更を求める人のことだと説明しています<Ref n={2} />。SRP が数えるのは「誰が変えるよう求めるか」で、SoC が数えるのは「何について判断しているか」です。2つの分け方は重なることが多いものの、同じではありません。この章の例で比べます。
          </p>
          <ul>
            <li>
              表示の整形は1つの関心事ですが、マイページの JSON の形はアプリの担当者が、管理画面の文言は CS が変えるよう求めます。SoC に沿って表示を検証や保存から分けた後、2つの画面の表示を1つのヘルパーで共有してよいかは、SRP の問い（同じ人が同じ理由で変えるか）で決めます。この章では「〒150-0001」の形はどちらの画面でも同じ規則なので、1つのヘルパーにしました。
            </li>
            <li>
              注文の状態の規則と保存は別の関心事ですが、どちらも倉庫の作業の流れと注文のデータの形に合わせて変わります。SRP の観点では同じ Order に置いてかまわないので、この章では Order の1つのメソッドの中に、状態の確認・検証・保存の段を順に書きました。
            </li>
          </ul>
          <p>
            SoC は「混ざっているものを見分けて分ける」ときの問いとして、SRP は「分けた後にどれを1つのモジュールにまとめるか」を決めるときの問いとして使えます。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・構造</th>
                  <th scope="col">何を基準に分ける・まとめるか</th>
                  <th scope="col">この章の例での見え方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">SoC（この章）</th>
                  <td>関心事（権限・検証・保存・表示など、何について判断しているか）</td>
                  <td>5つの関心事を、ポリシー・モデル・ヘルパー・コントローラーに分けて置く</td>
                </tr>
                <tr>
                  <th scope="row">SRP（<ChapterLink n={63} />）</th>
                  <td>変更を求める人</td>
                  <td>2つの画面の表示を1つのヘルパーで共有してよいかを、変更を求める人で決める</td>
                </tr>
                <tr>
                  <th scope="row">High Cohesion（<ChapterLink n={69} />）</th>
                  <td>関係の強い処理とデータを同じ所に集める</td>
                  <td>配送先の検証・状態の規則・保存を、配送先の列を持つ Order に集める</td>
                </tr>
                <tr>
                  <th scope="row">Low Coupling（<ChapterLink n={70} />）</th>
                  <td>モジュール同士の依存を少なくする</td>
                  <td>コントローラーが呼ぶのは、ポリシーの1つのメソッドと Order の1つのメソッドだけにする</td>
                </tr>
                <tr>
                  <th scope="row">Information Hiding（<ChapterLink n={73} />）</th>
                  <td>変わりやすい設計判断を隠す</td>
                  <td>郵便番号の正規化の方法を Order の中に置き、コントローラーからは見えないようにする</td>
                </tr>
                <tr>
                  <th scope="row">Separation of Policy and Mechanism（<ChapterLink n={87} />）</th>
                  <td>何をするかの判断と、どう実現するかを分ける</td>
                  <td>関心の分離の分け方の1つ。判断と実装という2つの側面で分ける</td>
                </tr>
                <tr>
                  <th scope="row">MVC（「Rails の機能・規約との関係」の節）</th>
                  <td>データ、表示、入力の受け取りを分ける Web アプリの構造</td>
                  <td>関心の分離を3つの層に当てはめた形。この章の5つの関心事は3つの層より細かい</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: '関心事ごとに置き場所を決め、2つの画面から同じものを使う',
      body: (
        <>
          <h3>直す順序</h3>
          <p>
            管理画面の食い違いをどちらに合わせるかは、開発者だけでは決められない業務の判断です。この章では倉庫と CS と相談して、マイページの規則（pending のときだけ変えられる・都道府県は47の一覧・全角を受け付ける・履歴を残す）にそろえると決めたものとして進めます。そのうえで、次の順に直します。
          </p>
          <ol>
            <li>今の振る舞いをテストで固定する（マイページの request spec の5件）</li>
            <li>入力の検証と正規化を Order に移す</li>
            <li>注文の状態の規則と保存を、Order のメソッドにする</li>
            <li>権限を OrderPolicy に移す</li>
            <li>表示の整形を AddressHelper に移す</li>
            <li>2つのコントローラーを、HTTP の入力と応答だけにする</li>
            <li>テストを関心事ごとのファイルに分ける</li>
          </ol>
          <p>
            2〜5 は今のアクションを残したまま新しい置き場所を足す作業です。6 でアクションを1つずつ新しい置き場所に切り替え、切り替えるたびにテストを実行します。
          </p>
          <h3>手順2：入力の検証と正規化を Order に移す</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後・入力の検証の部分）"
            code={`
class Order < ApplicationRecord
  PREFECTURES = %w[北海道 青森県 岩手県 …].freeze # …（省略：47の都道府県）

  belongs_to :user
  has_many :address_changes, dependent: :destroy
  enum :status, { pending: "pending", picking: "picking", shipped: "shipped" }

  # 入力の検証：値の形をそろえてから確かめる（どの画面から保存しても同じ）
  normalizes :shipping_postal_code, with: ->(code) { code.unicode_normalize(:nfkc).delete("-") }
  normalizes :shipping_address_line, with: ->(line) { line.strip }
  validates :shipping_postal_code, format: { with: /\\A\\d{7}\\z/, message: "は7桁の数字で入力してください" }
  validates :shipping_prefecture, inclusion: { in: PREFECTURES, message: "を選んでください" }
  validates :shipping_address_line, presence: { message: "を入力してください" }
  # …（省略：次の手順のメソッド）
end
`}
          />
          <Code
            lang="yaml"
            title="config/locales/ja.yml（config/application.rb に config.i18n.default_locale = :ja を足した）"
            code={`
ja:
  errors:
    format: "%{attribute}%{message}"
  activerecord:
    attributes:
      order:
        shipping_postal_code: 郵便番号
        shipping_prefecture: 都道府県
        shipping_address_line: 住所
`}
          />
          <p>
            <code>normalizes</code> は属性の値の形をそろえる処理を宣言するメソッドで、Rails 7.1 で Active Record に入りました<Ref n={3} />。宣言した処理は属性に値を代入するときと検証するときに実行されます<Ref n={4} />。そのため、どの画面から <code>shipping_postal_code</code> に「１５０－０００１」を代入しても、検証の前に「1500001」になります。<code>validates</code> の <code>message</code> と ja.yml の属性名から、<code>errors.full_messages</code> は「郵便番号は7桁の数字で入力してください」のような文になります。
          </p>
          <p>
            検証をモデルに置くと、コントローラーから保存するときだけでなく、コンソールやジョブから保存するときも同じ検証が実行されます。入力の検証を画面の処理から切り離して、注文のデータの規則として扱うということです。
          </p>
          <Callout kind="v72" title="Rails 7.2 と Rack 3.0 以前で動かすとき">
            <ul>
              <li><code>normalizes</code> は Rails 7.1 から使えるので、Rails 7.2 でも同じように書けます<Ref n={3} />。</li>
              <li>
                この章で使う <code>params.expect(shipping_address: [:postal_code, :prefecture, :address_line])</code> は Rails 8.0 で入ったメソッドで、<code>params.require(:shipping_address).permit(:postal_code, :prefecture, :address_line)</code> の代わりに使います<Ref n={5} />。Rails 7.2 では require と permit で書いてください。
              </li>
              <li>
                状態コード 422 を表すシンボルは、Rack 3.1 で <code>:unprocessable_entity</code> から <code>:unprocessable_content</code> に変わり、古いシンボルを使うと非推奨の警告が出るようになりました<Ref n={6} />。Rack 3.0 以前と組み合わせている Rails 7.x のアプリでは、<code>:unprocessable_entity</code> を使ってください。
              </li>
            </ul>
          </Callout>
          <h3>手順3：注文の状態の規則と保存を、Order のメソッドにする</h3>
          <Code
            lang="ruby"
            title="app/models/order.rb（直した後・配送先を変えるメソッド）"
            code={`
  # 業務の規則と保存：配送先を変え、変更の履歴を残す。倉庫が作業を始めた注文は変えられない
  def change_shipping_address(address, changed_by:)
    unless pending?
      errors.add(:base, "発送の準備に入ったため、配送先を変更できません")
      return false
    end

    before_address = address_for_history
    assign_attributes(shipping_postal_code: address[:postal_code], shipping_prefecture: address[:prefecture],
                      shipping_address_line: address[:address_line])
    return false if invalid?

    transaction do
      save!
      address_changes.create!(changed_by:, before_address:, after_address: address_for_history)
    end
    true
  end

  private

  def address_for_history = "#{shipping_postal_code} #{shipping_prefecture}#{shipping_address_line}"
`}
          />
          <p>
            <code>change_shipping_address</code> は、成功したら true を、失敗したら false を返し、失敗の理由を <code>errors</code> に入れます。Active Record の <code>save</code> と同じ返し方にしたので、呼び出し側は <code>save</code> の結果と同じように扱えます。メソッドの中は状態の確認・値の代入と検証・保存の3つの段に分かれています。
          </p>
          <p>
            注文の状態の規則を、権限と分けて Order に置いたのには理由があります。権限は「誰が」によって答えが変わりますが、「倉庫が作業を始めた注文は変えられない」は、誰が操作しても同じ答えになる注文の規則です。直す前のアクションでは2つが並んで書かれていたため、管理画面では状態の規則まで画面ごとに書き換えられました。Order に置けば、CS の担当者が操作するときにも同じ規則が使われます。
          </p>
          <h3>手順4：権限を OrderPolicy に移す</h3>
          <Code
            lang="ruby"
            title="app/policies/order_policy.rb・app/controllers/application_controller.rb・app/controllers/admin/base_controller.rb"
            code={`
# 権限：注文に対して、誰が何をしてよいか
class OrderPolicy < ApplicationPolicy
  # 配送先を変えてよいのは、注文した本人と CS の担当者
  def update_shipping_address? = user.support? || record.user_id == user.id
end

class ApplicationController < ActionController::Base
  include Pundit::Authorization

  before_action :require_login
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  # Pundit は current_user をポリシーの user として渡す
  def current_user = @current_user ||= User.find_by(id: session[:user_id])
  def require_login = (head :unauthorized unless current_user)

  def forbidden
    respond_to do |format|
      format.json { render json: { error: "この操作を行う権限がありません" }, status: :forbidden }
      format.html { render plain: "この操作を行う権限がありません", status: :forbidden }
    end
  end
end

# 管理画面に入れるのは CS の担当者だけ
class Admin::BaseController < ApplicationController
  before_action :require_support

  private

  def require_support = (head :forbidden unless current_user.support?)
end
`}
          />
          <p>
            Pundit は権限の判断をモデルごとの普通の Ruby のクラス（ポリシー）にまとめる gem です。ポリシーは利用者（<code>user</code>）と対象（<code>record</code>）を受け取り、<code>?</code> で終わるメソッドで許可するかを返します<Ref n={7} />。ApplicationPolicy は <code>bin/rails g pundit:install</code> で作りました。コントローラーで <code>authorize</code> を呼ぶと、許可されないときに <code>Pundit::NotAuthorizedError</code> が投げられ、ApplicationController の <code>rescue_from</code> が 403 を返します。Pundit の使い方の詳細は<ChapterLink n={41} section="pundit" />で説明しました。
          </p>
          <p>
            権限には2つの関心事が含まれていたことにも注意します。「管理画面に入れるか」は管理画面を使えるかどうかの判断で、管理画面のすべてのコントローラーに共通なので、Admin::BaseController の <code>before_action</code> に置きました。「この注文の配送先を変えてよいか」は注文についての判断で、どの画面から操作しても同じなので、OrderPolicy に置きました。
          </p>
          <h3>手順5：表示の整形を AddressHelper に移す</h3>
          <Code
            lang="ruby"
            title="app/helpers/address_helper.rb"
            code={`
# 表示の整形：画面・JSON・メールで同じ形にする
module AddressHelper
  # 「〒150-0001 東京都渋谷区神宮前1-2-3」の形にする
  def shipping_address_label(order)
    code = order.shipping_postal_code
    "〒#{code[0, 3]}-#{code[3, 4]} #{order.shipping_prefecture}#{order.shipping_address_line}"
  end
end
`}
          />
          <p>
            ヘルパーはビューで使うメソッドをまとめたモジュールです。Rails の既定の設定では、app/helpers のヘルパーはどのコントローラーのビューからも使えます<Ref n={8} />。コントローラーからは <code>helpers.shipping_address_label(order)</code> のように <code>helpers</code> を通して呼べます。<code>helpers</code> はビューのコンテキスト（<code>view_context</code>）を返すメソッドです<Ref n={9} />。郵便番号を「〒150-0001」の形にする処理は、JSON・管理画面の通知・編集画面のどれからも、このメソッドを使います。
          </p>
          <h3>手順6：コントローラーを、HTTP の入力と応答だけにする</h3>
          <Code
            lang="ruby"
            title="app/controllers/mypage/shipping_addresses_controller.rb（直した後）"
            code={`
# HTTP：マイページ（JSON）の入力を受け取り、結果を応答にする
class Mypage::ShippingAddressesController < ApplicationController
  def update
    order = authorize Order.find(params[:order_id]), :update_shipping_address?
    if order.change_shipping_address(address_params, changed_by: current_user)
      render json: { message: "配送先を変更しました", shipping_address: helpers.shipping_address_label(order) }
    else
      render json: { errors: order.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def address_params = params.expect(shipping_address: [:postal_code, :prefecture, :address_line])
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/admin/shipping_addresses_controller.rb（直した後）"
            code={`
# HTTP：管理画面（HTML）の入力を受け取り、結果を画面にする
class Admin::ShippingAddressesController < Admin::BaseController
  before_action :set_order

  def edit; end

  def update
    if @order.change_shipping_address(address_params, changed_by: current_user)
      redirect_to edit_admin_order_shipping_address_path(@order),
                  notice: "配送先を #{helpers.shipping_address_label(@order)} に変更しました"
    else
      render :edit, status: :unprocessable_content
    end
  end

  private

  def set_order = @order = authorize(Order.find(params[:order_id]), :update_shipping_address?)
  def address_params = params.expect(shipping_address: [:postal_code, :prefecture, :address_line])
end
`}
          />
          <p>
            <code>authorize</code> は許可されたときに渡したレコードを返すので<Ref n={7} />、<code>order = authorize Order.find(...)</code> のように1行で書けます。2つ目の引数の <code>:update_shipping_address?</code> は、呼ぶポリシーのメソッドの名前です。
          </p>
          <p>
            コントローラーに残ったのは、注文を探すこと、権限の確認を頼むこと、受け付けるキーを決めること、Order のメソッドを呼ぶこと、結果を応答にすることです。応答の形（JSON か HTML か、状態コード、どの画面に移すか）は画面ごとに違うので、それぞれのコントローラーに書きます。2つのコントローラーで同じなのは、呼ぶポリシーのメソッドと Order のメソッドの名前だけです。編集画面のビューもエラーの一覧を <code>@order.errors</code> から表示し、都道府県を一覧から選ぶ欄に直しました。
          </p>
          <h3>手順7：テストを関心事ごとのファイルに分ける</h3>
          <Code
            lang="ruby"
            title="spec/policies/order_policy_spec.rb・spec/models/order_spec.rb・spec/helpers/address_helper_spec.rb（抜粋）"
            code={`
RSpec.describe OrderPolicy do
  let(:customer) { create_customer }
  let(:order) { create_order(customer) }

  def allowed?(user) = OrderPolicy.new(user, order).update_shipping_address?

  it("注文した本人は配送先を変えられる") { expect(allowed?(customer)).to be true }
  it("ほかの会員は変えられない") { expect(allowed?(create_customer("鈴木"))).to be false }
  it("CS の担当者は変えられる") { expect(allowed?(create_support)).to be true }
end

RSpec.describe Order do
  let(:customer) { create_customer }
  let(:order) { create_order(customer) }
  let(:address) { { postal_code: "１５０－０００１", prefecture: "東京都", address_line: " 渋谷区神宮前1-2-3 " } }

  describe "#change_shipping_address" do
    it "郵便番号と住所の形をそろえて保存し、変更の履歴を残す" do
      expect(order.change_shipping_address(address, changed_by: customer)).to be true

      expect(order.reload).to have_attributes(shipping_postal_code: "1500001", shipping_address_line: "渋谷区神宮前1-2-3")
      expect(order.address_changes.last).to have_attributes(
        changed_by: customer, before_address: "1000001 東京都千代田区千代田1-1", after_address: "1500001 東京都渋谷区神宮前1-2-3"
      )
    end
    # …（省略：都道府県が一覧にない・倉庫で作業中の2件）
  end
end

RSpec.describe AddressHelper, type: :helper do
  it "郵便番号を〒と3桁-4桁の形にして、住所とつなげる" do
    order = Order.new(shipping_postal_code: "1500001", shipping_prefecture: "東京都", shipping_address_line: "渋谷区神宮前1-2-3")

    expect(helper.shipping_address_label(order)).to eq "〒150-0001 東京都渋谷区神宮前1-2-3"
  end
end
`}
          />
          <p>
            Order のテストはログインも HTTP のリクエストも使わずに、メソッドを直接呼んで確かめます。ポリシーのテストは利用者と注文の組み合わせだけを、ヘルパーのテストは保存しない Order の値だけを使います。request spec に残したのは、HTTP の関心事（状態コード・JSON のキー・画面の移動とエラーの表示）だけです。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation・配送先の変更の部分）"
            code={`
AddressHelper
  郵便番号を〒と3桁-4桁の形にして、住所とつなげる

Order
  #change_shipping_address
    郵便番号と住所の形をそろえて保存し、変更の履歴を残す
    都道府県の一覧にない値は受け付けず、何も保存しない
    倉庫が作業を始めた注文は変えられない

OrderPolicy
  注文した本人は配送先を変えられる
  ほかの会員は変えられない
  CS の担当者は変えられる

管理画面の配送先の変更
  変更できたら編集画面に戻し、整形した住所を知らせる
  検証に失敗したら 422 で編集画面にエラーを表示する
  会員は管理画面に入れない

マイページの配送先の変更
  変更できたら 200 と整形した住所を JSON で返す
  検証に失敗したら 422 とエラーの一覧を JSON で返す
  権限がなければ 403 を返す

Finished in 0.21856 seconds (files took 0.83087 seconds to load)
13 examples, 0 failures
`}
          />
          <Figure n="49-4" title="直す前と直した後" caption="色は関心事の種類。直した後の呼び出し元には、HTTP の入力と応答（コンソールでは出力）だけが残る。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 49-4 は直す前と直した後の比較です。直す前は、2つのアクションがそれぞれ5つの関心事を自分の中に持ち、そのうち3つが食い違っていました。直した後は、3つの呼び出し元が OrderPolicy・Order・AddressHelper を共通に使います。図 49-5 は関心事ごとの置き場所と、使った Rails の仕組み、変えるきっかけ、テストのファイルを並べたものです。
          </p>
          <Figure n="49-5" title="分けた後の置き場所" caption="変えるきっかけは例。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">関心事</th>
                    <th scope="col">置き場所</th>
                    <th scope="col">使う仕組み</th>
                    <th scope="col">変えるきっかけの例</th>
                    <th scope="col">テスト</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">HTTP の入力と応答</th>
                    <td>Mypage・Admin の各コントローラー</td>
                    <td>params.expect・render・redirect_to</td>
                    <td>画面や API の仕様</td>
                    <td>request spec</td>
                  </tr>
                  <tr>
                    <th scope="row">管理画面に入れるか</th>
                    <td>Admin::BaseController</td>
                    <td>before_action</td>
                    <td>管理画面を使う人の範囲</td>
                    <td>request spec</td>
                  </tr>
                  <tr>
                    <th scope="row">権限（この注文を変えてよいか）</th>
                    <td>app/policies/order_policy.rb</td>
                    <td>Pundit（gem）</td>
                    <td>CS の役割の変更</td>
                    <td>spec/policies</td>
                  </tr>
                  <tr>
                    <th scope="row">注文の状態の規則</th>
                    <td>Order#change_shipping_address</td>
                    <td>モデルのメソッド・errors</td>
                    <td>倉庫の作業の流れ</td>
                    <td>spec/models</td>
                  </tr>
                  <tr>
                    <th scope="row">入力の検証</th>
                    <td>Order の normalizes・validates</td>
                    <td>Active Record の正規化と検証・I18n</td>
                    <td>住所の形式</td>
                    <td>spec/models</td>
                  </tr>
                  <tr>
                    <th scope="row">保存</th>
                    <td>Order#change_shipping_address</td>
                    <td>transaction・has_many</td>
                    <td>履歴に残す項目</td>
                    <td>spec/models</td>
                  </tr>
                  <tr>
                    <th scope="row">表示の整形</th>
                    <td>app/helpers/address_helper.rb</td>
                    <td>ヘルパー（コントローラーからは helpers）</td>
                    <td>住所の表示の形</td>
                    <td>spec/helpers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <h3>同じ入力をもう一度2つの画面に送る</h3>
          <p>直す前と同じスクリプトを実行しました。</p>
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=test bin/rails runner script/compare.rb・直した後）"
            code={`
ケース                              マイページ（会員）            管理画面（CS）
正しい入力                          200 1500001 東京都 履歴1件    302 1500001 東京都 履歴1件
全角の郵便番号「１５０－０００１」  200 1500001 東京都 履歴1件    302 1500001 東京都 履歴1件
都道府県が「東京」                  422 1000001 東京都 履歴0件    422 1000001 東京都 履歴0件
倉庫で作業中（picking）の注文       422 1000001 東京都 履歴0件    422 1000001 東京都 履歴0件

CS の担当者がマイページの URL に送ると：200 1500001 東京都 履歴1件
`}
          />
          <p>
            4つのケースすべてで、2つの画面の保存された値と履歴が同じになりました。状態コードが 200 と 302、422 と 422 のように画面ごとに違うのは、HTTP の応答の形を画面ごとに決めているからです。
          </p>
          <p>
            最後の行は直す前の 403 から 200 に変わりました。OrderPolicy で「CS の担当者はどの注文でも配送先を変えてよい」と決めたので、CS の担当者はどちらの画面から操作しても同じ判断を受けます。マイページの URL を会員だけに使わせたい場合、それは注文についての判断ではなく、画面を使えるかどうかの判断なので、Admin::BaseController と同じように、マイページのコントローラーの <code>before_action</code> に書きます。
          </p>
          <h3>3つ目の呼び出し元：コンソールからまとめて変える</h3>
          <p>
            引っ越しの連絡を受けた会員の、発送前の注文の配送先を、CS の担当者がまとめて変えることになりました。HTTP を通さないスクリプトでも、同じポリシーと同じメソッドを使えます。
          </p>
          <Code
            lang="ruby"
            title="script/bulk_change.rb"
            code={`
# 引っ越しの連絡を受けた会員の、発送前の注文の配送先をまとめて変える（CS の担当者が実行する）
# 実行：bin/rails runner script/bulk_change.rb
support = User.find_by!(email: "sato@example.com")
customer = User.find_by!(email: "yamada@example.com")
address = { postal_code: "150-0001", prefecture: "東京都", address_line: "渋谷区神宮前1-2-3" }

customer.orders.where.not(status: "shipped").order(:number).each do |order|
  Pundit.authorize(support, order, :update_shipping_address?)
  if order.change_shipping_address(address, changed_by: support)
    puts "#{order.number}：変更した（履歴 #{order.address_changes.count}件）"
  else
    puts "#{order.number}：変更できない（#{order.errors.full_messages.join('、')}）"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/bulk_change.rb。A-1002 だけ picking）"
            code={`
A-1001：変更した（履歴 1件）
A-1002：変更できない（発送の準備に入ったため、配送先を変更できません）
A-1003：変更した（履歴 1件）
`}
          />
          <p>
            <code>Pundit.authorize</code> は、コントローラーの外で利用者・レコード・ポリシーのメソッド名を渡して権限を確かめるメソッドです<Ref n={10} />。倉庫で作業中の A-1002 は画面から操作したときと同じ規則と同じ文で拒まれ、変えた2件には履歴が残りました。直す前の形のままなら、このスクリプトのためにもう一度アクションを写すことになります。
          </p>
          <h3>保存済みのデータを確かめる</h3>
          <p>
            検証をモデルに移すと、配送先を変えるときだけでなく、Order を保存するすべての処理で同じ検証が実行されます。直す前の管理画面は都道府県の一覧を確かめていなかったので、一覧にない値がすでに保存されているかもしれません。その値を残したまま検証をモデルに移すと何が起きるかを確かめました。
          </p>
          <Code
            lang="ruby"
            title="script/legacy_check.rb"
            code={`
# 検証をモデルに移す前に保存された値が、移した後の保存を止めないかを確かめる
order = Order.find_by!(number: "A-1003")
order.update_column(:shipping_prefecture, "東京") # 直す前の管理画面が保存した値を再現する

puts "検証に通らない注文：#{Order.where.not(shipping_prefecture: Order::PREFECTURES).pluck(:number).join('、')}"
puts "倉庫の作業を始める：#{order.update(status: 'picking')}（#{order.errors.full_messages.join('、')}）"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/legacy_check.rb）"
            code={`
検証に通らない注文：A-1003
倉庫の作業を始める：false（都道府県を選んでください）
`}
          />
          <p>
            都道府県が「東京」の注文は、配送先とは関係のない状態の更新（倉庫の作業を始める）でも保存できなくなりました。検証をモデルに移す前に、検証の条件に合わない行を探し、正しい値に直しておきます。データを直す手順は<ChapterLink n={27} section="schema-and-data-repair" />で扱いました。
          </p>
          <h3>増えたもの</h3>
          <p>
            直した後は、OrderPolicy・AddressHelper・Admin::BaseController・ja.yml と、ポリシー・モデル・ヘルパーのテストのファイルが増えました。配送先の変更の流れ全体を読むには、コントローラー・ポリシー・モデル・ヘルパーの4つのファイルを開くことになります。この章の場面では呼び出し元が3つあり、関心事ごとの規則（役割による権限・状態の規則・全角の正規化・履歴）も多いので、増えたファイルの数より、食い違いを防ぐ効果のほうが大きくなりました。呼び出し元が1つで規則も少ない処理で同じことをすると、次の節のように、ファイルの数だけが増えます。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '関心事ごとのクラスに分けすぎたとき',
      body: (
        <>
          <h3>メールマガジンの設定を5つのクラスに分けたコード</h3>
          <p>
            配送先の変更を直した後、チームは更新の処理をすべて同じ形で書くことに決めました。会員がメールマガジンを受け取るかどうか（users テーブルの真偽値の列 newsletter）を変える処理も、入力の検証は Form、権限は Policy、保存は Service、表示の整形は Presenter のクラスに分けました。
          </p>
          <Code
            lang="ruby"
            title="app/forms・app/policies・app/services・app/presenters・app/controllers の heavy/（当てはめすぎの例）"
            code={`
# 入力の検証
class Heavy::NewsletterForm
  include ActiveModel::Model
  include ActiveModel::Attributes

  attribute :newsletter, :boolean
  validates :newsletter, inclusion: { in: [true, false] }
end

# 権限：自分の設定は自分だけが変えられる
class Heavy::NewsletterPolicy < ApplicationPolicy
  def update? = user == record
end

# 保存
class Heavy::UpdateNewsletter
  def initialize(user)
    @user = user
  end

  def call(form)
    return false if form.invalid?

    @user.update!(newsletter: form.newsletter)
    true
  end
end

# 表示の整形
class Heavy::NewsletterPresenter
  def initialize(user)
    @user = user
  end

  def as_json(*) = { newsletter: @user.newsletter }
end

# 関心事ごとにクラスを分けすぎた形
class Heavy::NewslettersController < ApplicationController
  def update
    authorize current_user, :update?, policy_class: Heavy::NewsletterPolicy
    form = Heavy::NewsletterForm.new(params.expect(user: [:newsletter]))
    if Heavy::UpdateNewsletter.new(current_user).call(form)
      render json: Heavy::NewsletterPresenter.new(current_user)
    else
      render json: { errors: form.errors.full_messages }, status: :unprocessable_content
    end
  end
end
`}
          />
          <p>比べるために、同じ処理を Rails の標準の形でも書きました。コントローラーが自分の会員の行を更新し、値を JSON で返します。</p>
          <Code
            lang="ruby"
            title="app/controllers/mypage/newsletters_controller.rb（Rails の標準の形）"
            code={`
# Rails の標準の形：コントローラーとモデルだけで書く
class Mypage::NewslettersController < ApplicationController
  def update
    current_user.update!(params.expect(user: [:newsletter]))
    render json: { newsletter: current_user.newsletter }
  end
end
`}
          />
          <p>
            どちらもテストは通ります。分けた形は5つのファイルで45行、テストは Form・Policy・Service・Presenter・request spec の5つのファイルです。標準の形はコントローラーの7行（モデルの User には何も足していません）と、request spec の1つのファイルです。
          </p>
          <h3>頻度を足すと8つのファイルを直す</h3>
          <p>
            次に、受け取る頻度（毎週・毎月）を選べるようにすることになりました。users テーブルに newsletter_frequency の列を足すマイグレーションは、どちらの形でも同じです。標準の形ではモデルに検証を1行足し、コントローラーで受け付けるキーと応答を直しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb・app/controllers/mypage/newsletters_controller.rb（頻度を足した後・標準の形）"
            code={`
class User < ApplicationRecord
  has_many :orders
  enum :role, { customer: "customer", support: "support" }
  validates :newsletter_frequency, inclusion: { in: %w[weekly monthly], message: "を選んでください" }
end

class Mypage::NewslettersController < ApplicationController
  def update
    if current_user.update(params.expect(user: [:newsletter, :newsletter_frequency]))
      render json: current_user.slice(:newsletter, :newsletter_frequency)
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_content
    end
  end
end
`}
          />
          <p>
            分けた形では Form に属性と検証を、Service に保存する列を、Presenter に返すキーを、コントローラーに受け付けるキーを足しました。直す前と後のファイルを v1 と v2 のディレクトリに写し、差分の量を比べました。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat v1 v2。上が標準の形、下が分けすぎた形。マイグレーションを除く）"
            code={`
 {v1 => v2}/app/controllers/mypage/newsletters_controller.rb |  7 +++++--
 {v1 => v2}/app/models/user.rb                               |  1 +
 {v1 => v2}/spec/requests/newsletters_spec.rb                | 18 +++++++++++++-----
 3 files changed, 19 insertions(+), 7 deletions(-)

 {v1 => v2}/app/controllers/heavy/newsletters_controller.rb |  2 +-
 {v1 => v2}/app/forms/heavy/newsletter_form.rb              |  2 ++
 {v1 => v2}/app/presenters/heavy/newsletter_presenter.rb    |  2 +-
 {v1 => v2}/app/services/heavy/update_newsletter.rb         |  2 +-
 {v1 => v2}/spec/heavy/newsletter_form_spec.rb              |  5 +++--
 {v1 => v2}/spec/heavy/newsletter_presenter_spec.rb         |  3 ++-
 {v1 => v2}/spec/heavy/newsletters_request_spec.rb          | 18 +++++++++++++-----
 {v1 => v2}/spec/heavy/update_newsletter_spec.rb            |  4 ++--
 8 files changed, 25 insertions(+), 13 deletions(-)
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/newsletters_spec.rb spec/heavy --format documentation・頻度を足した後）"
            code={`
メールマガジンの設定（Rails の標準の形）
  受け取る設定と頻度を保存して返す
  頻度が選べる値でなければ 422 を返す

Heavy::NewsletterForm
  真偽値と選べる頻度なら正しい
  空なら正しくない
  選べない頻度なら正しくない

Heavy::NewsletterPolicy
  自分の設定は変えられる
  ほかの会員の設定は変えられない

Heavy::NewsletterPresenter
  設定を Hash にする

メールマガジンの設定（分けすぎた形）
  受け取る設定と頻度を保存して返す
  頻度が選べる値でなければ 422 を返す

Heavy::UpdateNewsletter
  フォームの値を保存する

Finished in 0.13853 seconds (files took 1.02 seconds to load)
11 examples, 0 failures
`}
          />
          <p>
            標準の形で直したファイルは3つ、分けすぎた形では8つでした。分けすぎた形では5つのクラスのうち Policy 以外の4つと、そのテストの4つを直しています。「頻度を足す」という1つの要求が、入力・保存・表示のすべてに同時に関わるからです。関心事がいつも一緒に変わる処理では、関心事ごとにクラスを分けても1つの変更は1か所に収まらず、すべてのクラスを直すことになります。
          </p>
          <p>
            Heavy::NewsletterPolicy の判断（自分の行だけを変えられる）も、標準の形ではクラスを作らずに満たしています。コントローラーが <code>current_user</code> の行だけを更新するので、ほかの会員の行を変える経路がありません。利用者が渡した ID でほかの人の行を探さないようにする書き方は、<ChapterLink n={21} section="object-authorization" />で扱いました。
          </p>
          <h3>分けすぎの見分け方</h3>
          <ul>
            <li>1つの要求で、関心事ごとのクラスがすべて同時に変わる（この節の頻度の追加）</li>
            <li>分けたクラスを呼ぶのが1つのコントローラーだけで、ほかの呼び出し元から使われる予定もない</li>
            <li>クラスの中身が値を受け取って次へ渡すだけの数行になっている（UpdateNewsletter#call、NewsletterPresenter#as_json）</li>
            <li>権限のクラスが <code>current_user</code> から探す書き方で済む判断しかしていない</li>
            <li>検証がモデルではなく Form にあり、モデルを直接保存するほかの経路（コンソール・ジョブ）では検証が実行されない</li>
          </ul>
          <p>
            最後の点は配送先の変更で検証をモデルに置いた理由を、反対の側から見たものです。Form Object が向いているのは、1つの画面の入力が複数のモデルにまたがるときや、画面だけで使う入力の項目（利用規約への同意など）があるときです。使い分けは<ChapterLink n={33} section="model-form-objects" />で扱いました。
          </p>
          <h3>判断の目安</h3>
          <Figure n="49-6" title="置き場所を分けるかどうかの判断" caption="模式図。境目は目安で、同じ処理でもアプリの事情で位置が変わる。">
            <JudgeFigure />
          </Figure>
          <p>
            図 49-6 は置き場所を分けるかどうかを2つの軸で判断する目安です。横軸は同じ処理を呼び出す場所（呼び出し元）の数です。画面・API・コンソール・ジョブのように呼び出し元が増えるほど、関心事がアクションの中にあると写す回数が増えます。縦軸は関心事ごとの規則の量です。役割による権限・状態の規則・入力の正規化のように規則が多いほど、写したときに食い違う箇所が増えます。
          </p>
          <ul>
            <li>右上（呼び出し元が複数で、規則が多い）：この章の配送先の変更です。ポリシー・モデルのメソッド・ヘルパーに置き場所を分けます。</li>
            <li>左上（呼び出し元は1つで、規則が多い）：呼び出し元が1つでも、規則をモデルとポリシーに移すと、関心事ごとにテストを書けます。別の呼び出し元が来たら、そのまま使えます。</li>
            <li>右下（呼び出し元が複数で、規則が少ない）：会員の名前の変更のように、モデルに validates を置けば、どの呼び出し元から保存しても同じ検証が実行されます。ポリシーやヘルパーのクラスは要りません。</li>
            <li>左下（呼び出し元は1つで、規則が少ない）：メールマガジンの設定です。コントローラーの update とモデルの validates の、Rails の標準の形のままにします。ここを Form・Policy・Service・Presenter に分けるのが当てはめすぎです。</li>
          </ul>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">確かめること</th>
                  <th scope="col">置き場所を分ける方向の答え</th>
                  <th scope="col">今の形のままにする方向の答え</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>同じ処理の呼び出し元はいくつあるか</td>
                  <td>2つ以上ある、または写したコードがすでにある</td>
                  <td>1つで、ほかの呼び出し元の予定もない</td>
                </tr>
                <tr>
                  <td>関心事ごとの規則はどれくらいあるか</td>
                  <td>役割による権限、状態の規則、値の正規化がある</td>
                  <td>列の必須や真偽値だけ</td>
                </tr>
                <tr>
                  <td>1つの要求で、どの関心事が変わるか</td>
                  <td>1つの関心事だけ（郵便番号の規則だけ、表示の形だけ）</td>
                  <td>入力・保存・表示がいつも一緒に変わる</td>
                </tr>
                <tr>
                  <td>1つの関心事だけをテストしたいことがあるか</td>
                  <td>ある（権限の組み合わせ、正規化の種類が多い）</td>
                  <td>request spec の数件で全体を確かめられる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Dijkstra が書いた関心の分離は、1つの側面を考えている間はほかの側面を持ち込まない、という考え方の順序でした（図 49-3）。小さな処理では、アクションの中で行を分けたり、private メソッドに関心事の名前を付けたりするだけでも、読む人は1つの側面ずつ読めます。クラスやファイルを分けるのは、側面ごとに別々に使う・変える・テストする必要が出てきたときで十分です。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の MVC・標準の仕組みと関心の分離',
      body: (
        <>
          <h3>MVC は関心の分離を3つの層に当てはめた形</h3>
          <p>
            Rails のガイドは、Rails のコードは MVC（Model-View-Controller）の構造で整理されていると説明し、3つを次のように分けています<Ref n={11} />。
          </p>
          <ul>
            <li>Model：アプリのデータを扱う。多くの場合、データベースのテーブルに対応する</li>
            <li>View：応答を HTML・JSON・XML などの形式で描画する</li>
            <li>Controller：利用者の操作と、リクエストごとの処理の流れを扱う</li>
          </ul>
          <p>
            Action Controller のガイドは、コントローラーはモデルとビューの間にあり、モデルのデータをビューに渡し、利用者の入力を受け取ってモデルのデータを保存・更新すると説明しています<Ref n={12} />。Active Record のガイドは、モデルをデータと業務のロジックを表す層としています<Ref n={14} />。Action View のガイドは、Action View がモデルから取り出したデータを使って応答の本文を描画すると説明しています<Ref n={13} />。
          </p>
          <Figure n="49-7" title="Rails の MVC と、この章の関心事の置き場所" caption="実線の矢印はリクエストの処理の流れ。左の一覧は関心事と Rails で置く場所の対応。">
            <RailsFigure />
          </Figure>
          <p>
            図 49-7 は、リクエストが Rails の中を通る順序と、この章の関心事の置き場所を重ねたものです。入力の検証・注文の状態の規則・保存はモデルに、表示の整形はビューとヘルパーに、HTTP の入力と応答はコントローラーに置きました。権限は MVC の3つの層のどれにも当たらないので、この章では Pundit のポリシーを足しました。
          </p>
          <p>
            直す前のアクションはファイルとしては app/controllers にありましたが、中身にはモデルの関心事（検証・規則・保存）とビューの関心事（表示の整形）が入っていました。Rails が用意するのはディレクトリと仕組みで、何をどこに書くかは開発者が決めます。MVC のディレクトリに分かれていることだけでは、関心事が分かれていることにはなりません。
          </p>
          <h3>Rails の標準の仕組みで分けられる関心事</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">関心事</th>
                  <th scope="col">Rails の仕組み</th>
                  <th scope="col">この章での使い方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>すべてのリクエストに共通の処理（セッション・ログ）</td>
                  <td>Rack のミドルウェア（<ChapterLink n={6} section="middleware" />）</td>
                  <td>Rails の既定のミドルウェアが Cookie とセッションを扱う</td>
                </tr>
                <tr>
                  <td>複数のアクションに共通の確認（ログイン・管理画面に入れるか）</td>
                  <td>before_action（<ChapterLink n={10} section="before-action" />）</td>
                  <td>require_login・require_support</td>
                </tr>
                <tr>
                  <td>受け付けるキー</td>
                  <td>Strong Parameters</td>
                  <td>address_params の params.expect</td>
                </tr>
                <tr>
                  <td>値の正規化と検証</td>
                  <td>normalizes・validates（<ChapterLink n={14} section="validations" />）</td>
                  <td>Order の郵便番号・都道府県・住所</td>
                </tr>
                <tr>
                  <td>失敗の理由を呼び出し側に返す</td>
                  <td>errors</td>
                  <td>change_shipping_address が errors に理由を入れる</td>
                </tr>
                <tr>
                  <td>表示の整形と文言</td>
                  <td>ヘルパー・ビュー・I18n（<ChapterLink n={16} section="helpers" />）</td>
                  <td>AddressHelper・ja.yml</td>
                </tr>
                <tr>
                  <td>応答の形式</td>
                  <td>respond_to・render</td>
                  <td>403 を JSON と HTML で返し分ける</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>Strong Parameters：受け付けるキーをモデルからコントローラーへ移した</h3>
          <p>
            Rails 自身にも、関心事の置き場所を移した例があります。Rails 3 ではまとめて代入してよい属性をモデルに <code>attr_accessible</code> などで宣言していました。Rails 4.0 で、この仕組みは非推奨になり、代わりに Strong Parameters を使うことになりました<Ref n={17} />。
          </p>
          <p>
            Strong Parameters の元になった gem の README は、コントローラーのパラメーターは許可するまでモデルのまとめての代入に使えないと説明し、Rails 4 へ移る手順として、モデルから <code>attr_accessible</code> と <code>attr_protected</code> を消し、コントローラーごとに require と permit で許可するキーを書くように示しています<Ref n={16} />。同じ README は許可するキーを private メソッドにまとめておけば、利用者ごとに許可するキーを変えるようにそのメソッドを書き換えられるとも書いています<Ref n={16} />。
          </p>
          <p>
            どのキーを受け付けるかは、誰が・どの画面から送ったかで変わります。それを知っているのはリクエストを受けるコントローラーで、モデルが持つのはデータの規則です。この章でも、マイページと管理画面がそれぞれ <code>address_params</code> で受け付けるキーを決め、値の規則は Order に置きました。
          </p>
          <h3>Concern という名前</h3>
          <p>
            Rails のモデルとコントローラーには、app/models/concerns と app/controllers/concerns というディレクトリがあります。Rails Doctrine の「Provide sharp knives」の節は、Concern を Ruby のモジュールに薄い構文を足したもので、1つのクラスが、関係はあるが別々に理解できる複数の関心事を持てるように作られたと説明し、名前はそこから来ていると書いています<Ref n={15} />。同じ節は Concern を使えば概念を部分的に分けられるとも書いています<Ref n={15} />。
          </p>
          <p>
            Concern が分けるのは、1つのクラスのコードを読むときの単位です。Dijkstra の言う「1つの側面ずつ考える」ことには役立ちますが、Concern に移したメソッドは元のクラスのメソッドのままで、別の呼び出し元から別々に使ったり、ほかの関心事を用意せずにテストしたりする単位にはなりません。この章の権限と表示の整形は3つの呼び出し元から使い、別々にテストしたかったので、Order の Concern ではなく、ポリシーとヘルパーに置きました。Order 自身の規則が増えたとき（配送先の規則と取り消しの規則など）に、Order の中を関心事ごとのファイルに分けるのは Concern が向いている使い方です。Concern の使い分けは<ChapterLink n={31} section="concern" />と<ChapterLink n={63} section="rails" />で扱いました。
          </p>
          <h3>Rails Doctrine とヘルパー・Presenter</h3>
          <p>
            Rails Doctrine の「No one paradigm」の節は、ビューのテンプレートから取り出すヘルパーは1つの名前空間に入った関数の集まりで、互いにほとんど関わらない関数を置くにはそれが適していると書いています<Ref n={15} />。互いに関係する多くのメソッドとデータをまとめる Presenter が適している場合もあるが、それは多くないとも書き、モデルについては名前を選び、凝集を高め、結合を低くするオブジェクト指向の設計を行う層として扱っています<Ref n={15} />。
          </p>
          <p>
            この章の表示の整形は郵便番号と住所をつなぐ1つのメソッドだったので、Presenter のクラスではなくヘルパーにしました。1つの画面の表示のために、互いに呼び合うメソッドと値がいくつも必要になったときが、Presenter を考える時期です。
          </p>
          <p>
            同じ文書の「Value integrated systems」の節は、デスクトップの Web とネイティブのモバイルアプリで同じコントローラーとビューを使うことができると書いています<Ref n={15} />。この章のマイページの画面とスマートフォンのアプリも、1つの API を共有していました。共有できる部分を共有し、呼び出し元ごとにアクションを写さないという点で、この章の直し方と同じ方向です。
          </p>
          <h3>本書のほかの章</h3>
          <ul>
            <li>処理を置く場所の候補と選び方：<ChapterLink n={30} section="architecture-boundaries" /></li>
            <li>Pundit のポリシーの書き方と判断表、ほかの人の行を操作させない書き方：<ChapterLink n={41} section="pundit" />、<ChapterLink n={21} section="object-authorization" /></li>
            <li>Form Object を作る時期：<ChapterLink n={33} section="model-form-objects" /></li>
            <li>配送先の変更に、倉庫への連絡やメールの送信が加わり、手順が増えたときにまとめる Use Case：<ChapterLink n={44} /></li>
            <li>変更を求める人で分ける SRP、関係の強いものを集める High Cohesion、判断と実装を分ける Separation of Policy and Mechanism：<ChapterLink n={63} />、<ChapterLink n={69} />、<ChapterLink n={87} /></li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>配送先を変えるアクションに、権限・注文の状態・入力の検証・保存・表示の整形が混ざっていたので、管理画面からは同じ処理を使えず、写したアクションは状態の規則・入力の検証・履歴の保存の3か所で食い違いました。</li>
          <li>関心の分離（SoC）は異なる責務や関心事を明確に分離する原則です。Dijkstra は1974年の EWD447 で、1つの側面に注意を向けて別々に考えることを関心の分離と呼び、完全にはできないとしても、考えを効果的に整理する方法として自分が知る唯一のものだと書きました。</li>
          <li>SoC は「何について判断しているか」で分け、SRP は「誰が変えるよう求めるか」で分けます。権限と注文の状態の規則は、同じ場所に書かれやすい別の関心事です。</li>
          <li>権限をポリシーに、入力の検証・状態の規則・保存を Order のメソッドに、表示の整形をヘルパーに移し、コントローラーには HTTP の入力と応答だけを残すと、2つの画面とコンソールのスクリプトで同じ結果になりました。</li>
          <li>検証をモデルに移すと、すべての保存で同じ検証が実行されます。移す前に、検証の条件に合わない保存済みの行を探して直します。</li>
          <li>呼び出し元が1つで規則も少ない処理を Form・Policy・Service・Presenter に分けると、1つの要求で8つのファイルを直すことになりました。分けるかどうかは呼び出し元の数と関心事ごとの規則の量で判断します。</li>
          <li>Rails の MVC・before_action・Strong Parameters・validates・ヘルパーは、関心事ごとの置き場所です。どこに何を書くかは開発者が決めます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'EWD447: On the role of scientific thought', publisher: 'E. W. Dijkstra Archive（The University of Texas at Austin）', url: 'https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html', accessed: '2026-11-22', version: '1974年8月30日', note: '知人への手紙の引用（正しさ・効率・望ましさを別々に調べること、「私がときどき the separation of concerns と呼んできたもの」、完全にはできないとしても考えを整理する唯一の方法であること、側面に注意を向けるのはほかの側面を無視することではないこと）、仕様を述べることと仕様どおりに作ることを分ける例。' },
    { title: 'The Single Responsibility Principle', publisher: 'The Clean Code Blog / Robert C. Martin', url: 'https://blog.cleancoder.com/uncle-bob/2014/05/08/SingleReponsibilityPrinciple.html', accessed: '2026-11-22', version: '2014年5月8日', note: 'Dijkstra が EWD447 で The Separation of Concerns という言葉を導入したという記述、SRP は人についての原則であること。' },
    { title: 'Ruby on Rails 7.1 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/7_1_release_notes.html', accessed: '2026-11-22', note: 'ActiveRecord::Base.normalizes が Rails 7.1 で入ったこと。' },
    { title: 'activemodel/lib/active_model/attributes/normalization.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/attributes/normalization.rb#L76-L117`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem のソースで確認）', note: 'normalizes の処理が、属性に代入するときと検証するときに実行されること。Active Record は activerecord/lib/active_record/attributes.rb でこのモジュールを include している。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/8_0_release_notes.html', accessed: '2026-11-22', note: 'params.expect(table: [:attr]) が params.require(:table).permit(:attr) の代わりとして入ったこと。' },
    { title: 'CHANGELOG.md', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/CHANGELOG.md?plain=1#L289-L336', accessed: '2026-11-22', version: 'rack 3.2.8（手元の gem で確認）', note: 'Rack 3.1.0 で 422 の説明を更新し、古い状態コードのシンボルに非推奨の警告を出すようにしたこと。:unprocessable_entity を使うと :unprocessable_content を使うよう警告が出ることは、lib/rack/utils.rb と RSpec の実行で確かめた。' },
    { title: 'varvet/pundit（README）', publisher: 'GitHub', url: 'https://github.com/varvet/pundit', accessed: '2026-11-13', version: '2.5.2（gem に同梱の README で確認）', note: 'ポリシーが user と record を受け取り、? で終わるメソッドで判断を返すこと。authorize が渡したインスタンスを返すこと（gem に同梱の README で 2026-11-22 に確認）。' },
    { title: 'Configuring Rails Applications', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'config.action_controller.include_all_helpers を設定しないとき、すべてのヘルパーをどのコントローラーのビューでも使えること。' },
    { title: 'actionpack/lib/action_controller/metal/helpers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/helpers.rb#L124-L127`, accessed: '2026-11-22', version: 'Rails 8.1.4.1（手元の gem のソースで確認）', note: 'コントローラーの helpers が view_context を返し、ビューの外からヘルパーを呼べること。' },
    { title: 'lib/pundit.rb', publisher: 'varvet/pundit（GitHub）', url: `${PUNDIT}/lib/pundit.rb#L40-L51`, accessed: '2026-11-22', version: 'pundit 2.5.2（手元の gem のソースで確認）', note: 'Pundit.authorize(user, record, query) がコントローラーの外で権限を確かめるメソッドであること。' },
    { title: 'Getting Started with Rails', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/getting_started.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Rails のコードが MVC で整理されていること、Model・View・Controller がそれぞれ何を扱うか。' },
    { title: 'Action Controller Overview', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_controller_overview.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'コントローラーがモデルとビューの間にあり、モデルのデータをビューに渡し、利用者の入力でモデルを保存・更新すること。Strong Parameters と expect。' },
    { title: 'Action View Overview', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/action_view_overview.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'Action View が MVC の V で、コントローラーが取り出したデータを使って応答の本文を描画すること。' },
    { title: 'Active Record Basics', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_basics.html', accessed: '2026-11-22', version: 'Rails 8.1', note: 'モデルがデータと業務のロジックを表す層であること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '「Provide sharp knives」：Concern は1つのクラスが関係はあるが別々に理解できる複数の関心事を持てるようにする仕組みで、名前はそこから来ていること、概念を部分的に分けられること。「No one paradigm」：ヘルパーは関数の集まりで、それが適していること、Presenter が合う場面は多くないこと、モデルはオブジェクト指向の設計を行う層であること。「Value integrated systems」：デスクトップの Web とネイティブのアプリで同じコントローラーとビューを使えること。' },
    { title: 'rails/strong_parameters（README）', publisher: 'GitHub', url: 'https://github.com/rails/strong_parameters', accessed: '2026-11-22', note: 'パラメーターは許可するまでまとめての代入に使えないこと、private メソッドを利用者ごとに書き換えられること、Rails 4 へ移る手順でモデルの attr_accessible・attr_protected を消してコントローラーで許可すること。GitHub MCP で README を読んで確認した。' },
    { title: 'Ruby on Rails 4.0 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/4_0_release_notes.html', accessed: '2026-11-22', note: 'Rails 3 のまとめての代入の保護が非推奨になり、Strong Parameters を使うことになったこと。' },
  ],
}

export default chapter

