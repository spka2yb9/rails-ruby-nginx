import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

/* ---------- 図 108-1 3つの段階の構成 ---------- */
function StagesFigure() {
  const col = (i: number) => 10 + i * 260
  const W = 244
  const txBox = (x: number, y: number, h: number, label: string) => (
    <>
      <rect x={x} y={y} width={W} height={h} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={x + 10} y={y + 14} fs={11} tone="acc">
        {label}
      </T>
    </>
  )
  return (
    <Svg
      id="108-1"
      w={780}
      h={424}
      label="段階1は、PlaceOrder が1つのトランザクションで在庫の引き当て、決済、注文の保存を行い、コミットの後でメールのジョブを入れる。段階2は、トランザクションを2つに分け、1つ目で在庫の引き当てと決済待ちの注文の作成、その外で決済（注文ごとの payment_key を冪等性キーにし、一時的な失敗は再試行）、2つ目で支払い済みへの変更と outbox_events への書き込みを行う。中継の処理が確認メールを送る。段階3は、さらに注文の二重送信を request_key で見分け、決済待ちのまま止まった注文を再開するジョブを加える"
    >
      {['段階1：最小の構成', '段階2：決済をトランザクションの外へ', '段階3：二重送信と再開'].map((t, i) => (
        <T key={t} x={col(i)} y={22} bold fs={13}>
          {t}
        </T>
      ))}
      {/* 段階1 */}
      <Box x={col(0)} y={40} w={W} h={40} lines={['PlaceOrder（Use Case）', 'Money（Value Object）']} fs={11} fill="box5" subTone="muted" />
      {txBox(col(0), 96, 150, '1つのトランザクション')}
      <Box x={col(0) + 12} y={120} w={W - 24} h={30} lines="在庫の引き当て（条件付き UPDATE）" fs={11} />
      <Box x={col(0) + 12} y={158} w={W - 24} h={30} lines="決済（外部の API）" fs={11} fill="box4" />
      <Box x={col(0) + 12} y={196} w={W - 24} h={30} lines="注文の保存（paid）" fs={11} />
      <Box x={col(0)} y={262} w={W} h={30} lines="コミットの後で deliver_later" fs={11} />
      <T x={col(0)} y={316} fs={11} tone="danger">
        決済の後に失敗すると、決済だけが残る
      </T>
      <T x={col(0)} y={334} fs={11} tone="danger">
        決済が遅いと、在庫の行のロックを持ち続ける
      </T>
      <T x={col(0)} y={352} fs={11} tone="danger">
        二重送信で、注文と決済が2つできる
      </T>
      <T x={col(0)} y={370} fs={11} tone="danger">
        ジョブの投入に失敗すると、メールが消える
      </T>

      {/* 段階2 */}
      {txBox(col(1), 40, 70, 'トランザクション1')}
      <Box x={col(1) + 12} y={64} w={W - 24} h={36} lines="在庫の引き当て・決済待ちの注文" fs={11} />
      <Box x={col(1)} y={124} w={W} h={52} lines={['決済（トランザクションの外）', 'payment_key で冪等、一時的な失敗は再試行']} fs={11} fill="box4" subTone="muted" />
      {txBox(col(1), 190, 70, 'トランザクション2')}
      <Box x={col(1) + 12} y={214} w={W - 24} h={36} lines="paid にする・outbox_events に書く" fs={11} />
      <Arrow x1={col(1) + W / 2} y1={110} x2={col(1) + W / 2} y2={122} />
      <Arrow x1={col(1) + W / 2} y1={176} x2={col(1) + W / 2} y2={188} />
      <Box x={col(1)} y={274} w={W} h={40} lines={['outbox の中継の処理', '確認メールを送る（少なくとも1回）']} fs={11} subTone="muted" />
      <Arrow x1={col(1) + W / 2} y1={260} x2={col(1) + W / 2} y2={272} dashed />
      <T x={col(1)} y={328} fs={11} tone="acc">
        状態：pending_payment
      </T>
      <T x={col(1) + 33} y={344} fs={11} tone="acc">
        → paid／payment_failed
      </T>
      <T x={col(1)} y={368} fs={11} tone="danger">
        二重送信はまだ防げない
      </T>
      <T x={col(1)} y={386} fs={11} tone="danger">
        決済待ちのまま止まった注文が残る
      </T>

      {/* 段階3 */}
      <Box x={col(2)} y={40} w={W} h={40} lines={['request_key の一意索引', '同じキーなら同じ注文を返す']} fs={11} fill="box5" subTone="muted" />
      <Box x={col(2)} y={94} w={W} h={40} lines={['段階2の流れ', 'トランザクション1 → 決済 → トランザクション2']} fs={11} subTone="muted" />
      <Box x={col(2)} y={148} w={W} h={40} lines={['ResumePendingOrdersJob', '決済待ちの注文を同じキーで決済し直す']} fs={11} fill="box5" subTone="muted" />
      <T x={col(2)} y={286} fs={11} tone="acc">
        どこで止まっても、やり直せば
      </T>
      <T x={col(2)} y={304} fs={11} tone="acc">
        正しい状態にたどり着く
      </T>
      <line x1={col(1) - 8} y1={10} x2={col(1) - 8} y2={400} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={col(2) - 8} y1={10} x2={col(2) - 8} y2={400} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={390} y={416} anchor="middle" fs={11} tone="muted">
        破線の枠＝1つの DB トランザクション。赤い文字＝その段階で残る問題
      </T>
    </Svg>
  )
}

/* ---------- 図 108-2 全体の流れと、各パターンが働く位置 ---------- */
function SequenceFigure() {
  const lanes: [number, string, 'box' | 'box4' | 'box5'][] = [
    [175, 'ブラウザー', 'box4'],
    [315, 'PlaceOrder', 'box5'],
    [470, 'MySQL', 'box4'],
    [610, '決済サービス', 'box4'],
    [725, '中継の処理', 'box'],
  ]
  const [B, U, D, P, R] = lanes.map((l) => l[0])
  // at：ラベルを矢印の中央ではなく、始点の側（from）か終点の側（to）に寄せる。数値ならその x を中央にする。途中の縦線と重ねないため
  const msg = (y: number, from: number, to: number, text: string, opts: { dashed?: boolean; accent?: boolean; tone?: 'danger'; at?: 'from' | 'to' | number } = {}) => {
    const { at, tone, ...arrow } = opts
    const dir = to > from ? 1 : -1
    const lx = typeof at === 'number' ? at : at === 'from' ? from + dir * 10 : at === 'to' ? to - dir * 14 : (from + to) / 2
    const anchor = at === undefined || typeof at === 'number' ? 'middle' : (at === 'from') === (dir > 0) ? 'start' : 'end'
    return (
      <g key={`${y}-${text}`}>
        <Arrow x1={from} y1={y} x2={to + (to > from ? -2 : 2)} y2={y} {...arrow} />
        <T x={lx} y={y - 9} anchor={anchor} fs={11} tone={tone}>
          {text}
        </T>
      </g>
    )
  }
  const tag = (y: number, text: string) => (
    <g key={`tag-${y}`}>
      <rect x={8} y={y - 10} width={6} height={20} fill="var(--fig-accent)" opacity={0.6} />
      <T x={18} y={y} fs={10} tone="acc">
        {text}
      </T>
    </g>
  )
  const tx = (y: number, h: number, label: string) => (
    <>
      <rect x={U - 8} y={y} width={D - U + 70} height={h} rx={6} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={U + 6} y={y + 13} fs={10} tone="acc">
        {label}
      </T>
    </>
  )
  return (
    <Svg
      id="108-2"
      w={780}
      h={592}
      label="ブラウザーが request_key を付けて注文を送る。PlaceOrder は、同じキーの注文がないかを MySQL で調べる。トランザクション1で、在庫を条件付きの UPDATE で引き当て、決済待ちの注文を作る。トランザクションの外で、注文の payment_key を冪等性キーにして決済サービスに決済を頼み、一時的な失敗なら待ち時間を延ばして再試行する。トランザクション2で、今の状態が決済待ちであることを条件に支払い済みにし、確認メールのメッセージを outbox_events に書く。結果をブラウザーに返す。後で、中継の処理が outbox_events からメッセージを取り出して確認メールを送り、再開のジョブが決済待ちのまま止まった注文を決済し直す"
    >
      {lanes.map(([x, name, fill]) => (
        <g key={name}>
          <Box x={x - 50} y={10} w={100} h={30} lines={name} fill={fill} fs={12} mono={name === 'PlaceOrder'} />
          <line x1={x} y1={40} x2={x} y2={532} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {msg(70, B, U, 'POST（request_key 付き）')}
      {tag(70, 'Idempotency Key')}
      {msg(102, U, D, '同じキーの注文はあるか')}
      {tag(102, 'Idempotency Key')}
      {tx(116, 94, 'トランザクション1')}
      {msg(156, U, D, '在庫を引き当てる')}
      {tag(156, '条件付き UPDATE')}
      {msg(190, U, D, '決済待ちの注文を作る')}
      {tag(190, 'Value Object・状態')}
      {msg(236, U, P, 'charge（payment_key）', { at: 'from' })}
      {tag(236, 'Adapter・Key')}
      {msg(266, P, U, '503・タイムアウト', { dashed: true, tone: 'danger', at: 'from' })}
      {msg(298, U, P, '待ち時間を延ばして再試行', { accent: true, at: 'from' })}
      {tag(298, 'Retry with Backoff')}
      {msg(328, P, U, 'Succeeded（payment_id）', { dashed: true, at: (U + D) / 2 })}
      {tx(342, 94, 'トランザクション2')}
      {msg(382, U, D, '決済待ちなら paid にする')}
      {tag(382, 'State Machine')}
      {msg(416, U, D, 'outbox_events に書く')}
      {tag(416, 'Outbox')}
      {msg(462, U, B, '注文（paid）', { dashed: true })}
      <line x1={U - 10} y1={484} x2={772} y2={484} stroke="var(--fig-line)" strokeDasharray="1 5" />
      <T x={U + 6} y={498} fs={10} tone="muted">
        後で（別のプロセス）
      </T>
      {msg(522, R, D, '未送信を取り出して送る', { accent: true, at: 'to' })}
      {tag(522, 'Outbox')}
      {tag(550, 'Retry・Key')}
      <Box x={U - 50} y={538} w={772 - (U - 50)} h={24} lines="ResumePendingOrdersJob：5分たった決済待ちの注文を、同じ payment_key で決済し直す" fs={11} fill="box5" />
      <T x={390} y={582} anchor="middle" fs={10} tone="muted">
        PlaceOrder は決済サービス・待つ処理・乱数・時計をコンストラクターで受け取る（Dependency Injection）。破線の枠＝トランザクション
      </T>
    </Svg>
  )
}

/* ---------- 図 108-3 障害が起きる箇所ごとの振る舞い ---------- */
const failureRows: { what: string[]; how: string[]; pattern: string[]; result: string[]; open?: boolean }[] = [
  { what: ['同じ注文が2回送られる', '（二度押し・再送）'], how: ['同じ request_key の注文を返す。同時なら', '一意索引で片方が RecordNotUnique になり、', '先の注文を返す'], pattern: ['Idempotency Key'], result: ['注文は1つ、決済も1回'] },
  { what: ['トランザクション1の途中で', '失敗（在庫不足など）'], how: ['ROLLBACK される。決済はまだしていない'], pattern: ['Use Case', '条件付き UPDATE'], result: ['何も残らない'] },
  { what: ['決済サービスが 503 を返す・', 'タイムアウトする'], how: ['payment_key を付けたまま、待ち時間を延ばして', '再試行する'], pattern: ['Retry with Backoff', 'Idempotency Key'], result: ['決済は1回だけ'] },
  { what: ['再試行しても一時的な失敗が', '続く'], how: ['pending_payment のまま返し、画面に', '「決済を確認中」と出す。再開のジョブが', '後で決済し直す'], pattern: ['State Machine'], result: ['後で paid か', 'payment_failed'] },
  { what: ['カードが使えない（拒否）'], how: ['再試行しない。payment_failed にして在庫を戻す'], pattern: ['State Machine'], result: ['在庫は元に戻る'] },
  { what: ['決済の後、トランザクション2', 'の前にプロセスが止まる'], how: ['再開のジョブが同じ payment_key で決済し直す。', '決済サービスは前の結果を返す'], pattern: ['Idempotency Key'], result: ['二重に決済せず', 'paid になる'] },
  { what: ['トランザクション2が2つの', '処理で同時に動く'], how: ['「pending_payment なら」を条件にした UPDATE で、', '片方だけが記録する'], pattern: ['条件付き UPDATE', 'State Machine'], result: ['outbox の行は1つ'] },
  { what: ['メールサーバーが止まっている'], how: ['outbox_events の行が未送信のまま残り、', '中継の処理が後で送る'], pattern: ['Transactional', 'Outbox'], result: ['メールは遅れて届く', '（2回届くことはある）'] },
  { what: ['決済サービスが 500 を返す', '（決済されたかわからない）'], how: ['この章のコードでは扱わない。決済されたかを', '確かめるまで、注文を再開の対象から外す'], pattern: ['Idempotency Key', 'の注意'], result: ['確かめた結果で paid', 'か payment_failed'], open: true },
]

function FailuresFigure() {
  const cols = [
    { x: 10, w: 172, key: 'what' as const, head: '起きること' },
    { x: 186, w: 296, key: 'how' as const, head: 'この章のコードの振る舞い' },
    { x: 486, w: 138, key: 'pattern' as const, head: '働くパターン' },
    { x: 628, w: 148, key: 'result' as const, head: '結果' },
  ]
  const rowH = (r: (typeof failureRows)[number]) => Math.max(r.what.length, r.how.length, r.pattern.length, r.result.length) * 15 + 14
  let y = 36
  const rows: { r: (typeof failureRows)[number]; top: number }[] = []
  for (const r of failureRows) {
    rows.push({ r, top: y })
    y += rowH(r) + 4
  }
  return (
    <Svg
      id="108-3"
      w={780}
      h={y + 6}
      label={`障害が起きる箇所ごとの振る舞い。${failureRows.map((r) => `${r.what.join('')}：${r.how.join('')}。働くパターンは${r.pattern.join('')}。結果は${r.result.join('')}`).join('。')}`}
    >
      {cols.map((c) => (
        <T key={c.head} x={c.x + 8} y={18} bold fs={12}>
          {c.head}
        </T>
      ))}
      {rows.map(({ r, top }) => (
        <g key={r.what.join('')}>
          {cols.map((c) => (
            <Box
              key={c.key}
              x={c.x}
              y={top}
              w={c.w}
              h={rowH(r)}
              lines={r[c.key]}
              fs={11}
              align="start"
              fill={r.open ? 'none' : c.key === 'pattern' ? 'box2' : c.key === 'result' ? 'box5' : 'box'}
              dashed={r.open}
              rx={4}
            />
          ))}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 108-4 パターンを入れすぎたコードとの比較 ---------- */
const tooMuchRows: [string, string[], string[]][] = [
  ['依存の組み立て', ['DI コンテナの gem を入れ、すべてのクラスを', '登録して取り出す'], ['コンストラクターの引数で受け取る。既定値は', 'Payments.gateway（Dependency Injection）']],
  ['決済サービス', ['決済会社ごとの Strategy と、それを選ぶ', 'Factory を作る'], ['決済会社は1社なので、取り決め1つと Adapter 1つ。', '2社目が決まったら Adapter を足す']],
  ['後の処理', ['イベントバスを作り、「注文が確定した」から', '在庫・決済・メールをイベントの連鎖で動かす'], ['流れは PlaceOrder に順に書く。確実に伝えたい', 'メールだけ outbox_events に書く']],
  ['注文の状態', ['AASM で3つの状態と遷移を定義し、', 'コールバックで在庫やメールを動かす'], ['状態は3つで遷移も少ないので、enum と、', '状態を条件にした UPDATE で守る']],
  ['DB への書き込み', ['Repository と Unit of Work を作り、', '注文と明細をまとめて保存する'], ['Active Record の create! と update_all を、', '短いトランザクション2つの中で使う']],
  ['注文の一覧', ['一覧のために集計表（Materialized View）を', '作り、注文の確定のたびに更新する'], ['元の表を読んで十分に速いので作らない']],
  ['読む人の手間', ['流れを追うのに、10以上のファイルを', '行き来する'], ['place_order.rb と、そこから呼ぶモデルの', 'メソッドを読めば全体がわかる']],
]

function TooMuchFigure() {
  const H = 46
  const top = 36
  return (
    <Svg
      id="108-4"
      w={780}
      h={top + tooMuchRows.length * (H + 6) + 4}
      label={`パターンを入れすぎたコードと、この章のコードの比較。${tooMuchRows.map(([k, a, b]) => `${k}：入れすぎたコードは${a.join('')}。この章のコードは${b.join('')}`).join('。')}`}
    >
      <T x={18} y={18} bold fs={12}>
        観点
      </T>
      <T x={138} y={18} bold fs={12} tone="danger">
        入れすぎたコード
      </T>
      <T x={458} y={18} bold fs={12} tone="acc">
        この章のコード
      </T>
      {tooMuchRows.map(([k, a, b], i) => {
        const y = top + i * (H + 6)
        return (
          <g key={k}>
            <Box x={10} y={y} w={116} h={H} lines={k} fs={12} bold fill="bg" rx={4} />
            <Box x={130} y={y} w={316} h={H} lines={a} fs={11} align="start" fill="none" dashed rx={4} />
            <Arrow x1={446} y1={y + H / 2} x2={448} y2={y + H / 2} plain />
            <Box x={450} y={y} w={320} h={H} lines={b} fs={11} align="start" fill="box5" rx={4} />
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 55,
  part: 9,
  title: 'パターンの組み合わせ：注文の確定を組み立てる',
  summary:
    '在庫の引き当て・外部の決済・注文の保存・確認メールからなる注文の確定を、第9部のパターンを組み合わせて Rails で組み立てます。Use Case と Value Object だけの最小の構成から始め、問題を RSpec で確かめてから、決済をトランザクションの外に出す段階、二重送信と止まった注文の再開に備える段階へ進みます。障害が起きる箇所ごとの振る舞いと、パターンを入れすぎたコードとの違いも確かめます。',
  goals: [
    '最小の構成から始め、具体的な問題をテストで確かめてからパターンを足す進め方を説明できる',
    '外部の決済を DB のトランザクションの外に置き、トランザクションを2つに分ける理由と順序を説明できる',
    '注文の状態、決済の冪等性キー、一時的な失敗の再試行、outbox を、注文の確定の中のどの位置で使うかを説明できる',
    '二重送信と、決済待ちのまま止まった注文を、一意索引と再開のジョブで扱える',
    '障害が起きる箇所ごとに、どのパターンがどう働き、何が残るかを説明できる',
    'パターンを入れすぎた設計と比べて、どこで止めるか、次のパターンをいつ足すかを判断できる',
  ],
  prerequisites: [34, 44, 46, 47, 52, 53, 54],
  sections: [
    {
      id: 'overview',
      title: 'この章の題材と進め方',
      body: (
        <>
          <p>
            この章の題材は EC サイトの注文の確定です。<ChapterLink n={34} />でも同じ題材を扱いましたが、進め方が違います。<ChapterLink n={34} />は、1つのアクションに書かれた処理を、Rails の標準機能（モデルのメソッド・トランザクション・ロック）から順に直していく流れでした。この章は、第9部で学んだパターンを組み合わせて1つの処理を組み立てる流れで、各パターンが処理のどの位置で働くかと、障害が起きたときにどのパターンが何を守るかに注目します。トランザクションの範囲の決め方、在庫の条件付きの UPDATE、外部の API をトランザクションの中で呼んだときのロックの待ちの実測、outbox の配送役のリース、Webhook と照合は<ChapterLink n={34} />で扱ったので、この章では繰り返さずにリンクします。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col"><ChapterLink n={34} /></th>
                  <th scope="col">この章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">出発点</th>
                  <td>コントローラーの1つのアクションに全部を書いたコード</td>
                  <td>Use Case と Value Object だけの最小の構成</td>
                </tr>
                <tr>
                  <th scope="row">段階の分け方</th>
                  <td>モデルのメソッド → 進行役のクラス → 外部決済と再実行</td>
                  <td>決済が中にある1つのトランザクション → 2つのトランザクション → 二重送信と再開</td>
                </tr>
                <tr>
                  <th scope="row">外部の決済の結果</th>
                  <td>課金のジョブ・Webhook・照合のジョブで反映する</td>
                  <td>注文の処理の中で受け取り、止まった注文だけを再開のジョブで決済し直す</td>
                </tr>
                <tr>
                  <th scope="row">注目すること</th>
                  <td>Rails の標準機能でどこまで直せるか、トランザクションをどこで開始するか</td>
                  <td>各パターンが処理のどの位置で働くか、障害の箇所ごとに何が残るか、どこで止めるか</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>注文の確定では、次の4つを行います。</p>
          <ol>
            <li>在庫を引き当てる：注文された個数だけ在庫を減らす。在庫より多くは売らない。</li>
            <li>決済する：外部の決済サービスにカードでの支払いを頼む。</li>
            <li>注文を保存する：注文と明細を DB に保存する。</li>
            <li>確認メールを送る：支払いが済んだことを利用者に知らせる。</li>
          </ol>
          <p>
            進め方で大切なのは、パターンを最初から全部入れないことです。第9部の序章（<ChapterLink n={39} section="principles" />）のとおり、まず問題を確かめ、その問題を解決するパターンだけを足します。図 108-1 はこの章でたどる3つの段階です。
          </p>
          <Figure n="108-1" title="3つの段階の構成" caption="各段階の構成と、その段階で残る問題をまとめた模式図。">
            <StagesFigure />
          </Figure>
          <p>
            図 108-1 の左から順に、段階1は Use Case と Value Object だけの構成で、決済が1つのトランザクションの中にあります。段階2はトランザクションを2つに分けて、決済をその間に置きます。段階3は<Term en="double submission">二重送信</Term>（ボタンの二度押しや通信の再送で、同じ注文が2回届くこと）と、途中で止まった注文の再開に備えます。各列の下の赤い文字が、その段階で残る問題で、次の段階はその問題だけを解決します。
          </p>
          <h3>使う表と、決済サービスの取り決め</h3>
          <p>
            表は利用者（users）、商品（products）、注文（orders）、注文の明細（order_items）、段階2からの outbox（outbox_events）です。金額は円の整数で持ち、Ruby の中では Money で計算します。Money は<ChapterLink n={46} section="money" />で作ったクラスから、この章で使う部分だけを抜き出しました。
          </p>
          <Code lang="ruby" title="app/models/money.rb" code={`
# 金額。amount は通貨の最小単位の整数（円なら1円）。この章で使う部分だけを書いた
Money = Data.define(:amount, :currency) do
  def self.zero(currency) = new(amount: 0, currency:)

  def +(other)
    raise ArgumentError, "通貨が違います: #{currency} と #{other.currency}" unless other.currency == currency

    with(amount: amount + other.amount)
  end

  def *(quantity) = with(amount: amount * Integer(quantity))
end
`} />
          <p>
            外部の決済サービスは呼び出すメソッドの取り決めとして定義します（<ChapterLink n={42} />）。カードが使えないといった拒否は、業務上起こりうる結果なので戻り値（<code>Declined</code>）で返します。通信の失敗・タイムアウト・503 のように時間をおけば成功しうる失敗は、例外（<code>PaymentUnavailableError</code>）にします。<ChapterLink n={42} /> の <code>Payments::Unavailable</code> と同じ役割の例外で、この章では MSDP の終章に合わせた名前にしています。再試行するのは、この例外だけです。タイムアウトの場合は、決済されたかどうかもわかりません。
          </p>
          <Code lang="ruby" title="app/adapters/payments.rb" code={`
# 決済サービスの取り決め。gateway は charge(idempotency_key:, amount:) に応答し、
# Succeeded か Declined を返す。amount は Money。同じ idempotency_key の要求は、何度送っても1回だけ決済する
module Payments
  # カードが使えないなどの拒否は、業務上起こりうる結果なので戻り値で返す
  Succeeded = Data.define(:payment_id)
  Declined = Data.define(:reason)
  # 通信の失敗・タイムアウト・503 など、時間をおけば成功しうる失敗。タイムアウトでは決済されたかどうかもわからない
  class PaymentUnavailableError < StandardError; end

  # 使う決済サービスの Adapter。config/initializers で決済会社の SDK を包んだものを設定する（テストでは代役）
  mattr_accessor :gateway
end
`} />
          <p>
            決済会社の SDK を包んで取り決めに合わせる Adapter は、この章では作らず、テストでは代役を使います。HTTP 500（決済されたかどうかがわからない応答）は、この章のコードでは扱いません。扱い方は<ChapterLink n={55} section="stage2" />の最後で説明します。
          </p>
        </>
      ),
    },
    {
      id: 'stage1',
      title: '段階1：Use Case と Value Object だけで始める',
      body: (
        <>
          <p>
            最初の構成は注文の確定の手順を1つのクラスにまとめる Use Case（<ChapterLink n={44} />）と、金額の Value Object（<ChapterLink n={46} />）だけです。決済サービスはコンストラクターの引数で受け取ります（<ChapterLink n={40} />）。在庫は、条件付きの UPDATE（<code>WHERE stock &gt;= ?</code>）の1文で引き当てます（<ChapterLink n={34} section="transaction-design" />、<ChapterLink n={49} section="stock-update" />）。
          </p>
          <Code lang="ruby" title="app/services/place_order.rb（段階1）" code={`
# ユースケース「注文を確定する」（段階1：Use Case と Value Object だけの最小の構成）
class PlaceOrder
  Line = Data.define(:product_id, :quantity)
  class PaymentDeclined < StandardError; end

  # 決済サービスは外から受け取る（テストでは代役を渡す）
  def initialize(payment: Payments.gateway)
    @payment = payment
  end

  def call(user:, lines:)
    order = ApplicationRecord.transaction do
      total = Money.zero(:JPY)
      items = lines.map do |line|
        product = Product.reserve!(line.product_id, line.quantity)
        total += product.price_money * line.quantity
        { product:, quantity: line.quantity, unit_price: product.price }
      end
      # ① 外部の決済を、DB のトランザクションの中で呼ぶ
      result = @payment.charge(idempotency_key: SecureRandom.uuid, amount: total)
      raise PaymentDeclined, result.reason.to_s if result.is_a?(Payments::Declined) # ROLLBACK で在庫も戻る

      user.orders.create!(total: total.amount, status: "paid", payment_id: result.payment_id, items_attributes: items)
    end
    OrderMailer.confirmation(order.id).deliver_later # ② コミットの後でメールのジョブを入れる
    order
  end
end
`} />
          <Code lang="ruby" title="app/models/product.rb（段階1）" code={`
class Product < ApplicationRecord
  class OutOfStock < StandardError; end

  def price_money = Money.new(amount: price, currency: :JPY)

  # 在庫は1文の条件付き UPDATE で引き当てる。MySQL には RETURNING がないので、更新した後で読み直す
  def self.reserve!(id, quantity)
    changed = where(id:).where("stock >= ?", quantity)
                        .update_all(["stock = stock - ?, updated_at = ?", quantity, Time.current])
    raise OutOfStock, "在庫が足りません: #{id}" unless changed == 1

    find(id)
  end
end
`} />
          <p>
            PostgreSQL なら <code>UPDATE ... RETURNING price</code> で、引き当てと単価の読み出しを1文で行えます。MySQL 8.4 の UPDATE には RETURNING 句がなく、戻り値は変更した行の数です<Ref n={4} />。そこで <code>update_all</code> が返す行の数で引き当てを確かめ、同じトランザクションの中で <code>find</code> し直します。引き当てた行は UPDATE のロックがかかったままなので、読み直すまでの間に価格を変えられることはありません。
          </p>
          <p>
            コントローラーやモデルのコールバックに直接書いた場合と比べると、決済サービスを代役に替えてテストでき、金額を Money で計算するので通貨の取り違えを防げます。在庫の引き当てと注文の保存は、1つのトランザクションにまとまっています。<code>script/flow.rb</code> で、DB に送った SQL と決済サービスの呼び出しを順に表示しました。
          </p>
          <Code lang="text" title="段階1の実行結果（bin/rails runner script/flow.rb。ID は 1 に整えた）" code={`
== 段階1：注文を確定する
  BEGIN
  UPDATE products SET stock = stock - '2' WHERE products.id = 1 AND (stock >= '2')
  （決済サービス）charge(idempotency_key: 36877eba…, amount: 600)
  INSERT INTO orders VALUES (1, 600, 'paid', 'pay-1', '…', '…')
  INSERT INTO order_items VALUES (1, 1, 2, 300)
  COMMIT
=> status=paid total=600 stock=8 投入されたジョブ=["ActionMailer::MailDeliveryJob"]
`} />
          <p>決済の呼び出しが BEGIN と COMMIT の間にあります。この構成には、次の問題が残ります。</p>
          <ul>
            <li>① 外部の決済を、DB のトランザクションの中で呼んでいます。決済の後に DB の処理が失敗すると、トランザクションは取り消されますが、決済は取り消せません。決済サービスの応答が遅いと、その間ずっと在庫の行のロックと DB の接続を持ち続けます（実測は<ChapterLink n={34} section="transaction-design" />の「外部の API をトランザクションの中で呼ぶと」）。</li>
            <li>② 確認メールのジョブを、コミットの後に入れています。ジョブの投入（Sidekiq なら Redis への書き込み）に失敗すると、注文は残るのにメールは送られず、送り直す手がかりも DB に残りません。</li>
            <li>③ 注文のボタンが2回押されると、注文が2つ作られ、2回決済されます。</li>
          </ul>
          <p>
            ①と③をテストで確かめます。決済サービスの代役は同じキーの要求を1回だけ決済し、次の呼び出しで起こす失敗（503・決済されたのに応答が届かないタイムアウト・拒否）を順に指定できます。
          </p>
          <Code lang="ruby" title="spec/support/fake_payment_gateway.rb" code={`
# 決済サービスの代役。同じキーの要求は1回だけ決済する。failures に、次の呼び出しで起こす失敗を順に入れる
class FakePaymentGateway
  attr_reader :charges # キーごとの決済。{ payment_id:, amount: }
  attr_accessor :failures # :temporary（503）・:timeout（決済はされたが応答が届かない）・:decline（拒否）

  def initialize
    @charges = {}
    @failures = []
    @lock = Mutex.new # 二重送信のテストでは、2つのスレッドから同時に呼ばれる
  end

  def charge(idempotency_key:, amount:)
    @lock.synchronize do
      failure = failures.shift
      raise Payments::PaymentUnavailableError, "503 Service Unavailable" if failure == :temporary
      return Payments::Declined.new(reason: :card_declined) if failure == :decline

      charge = charges[idempotency_key] ||= { payment_id: "pay-#{charges.size + 1}", amount: amount.amount }
      raise Payments::PaymentUnavailableError, "応答がタイムアウトしました" if failure == :timeout

      Payments::Succeeded.new(payment_id: charge[:payment_id])
    end
  end
end
`} />
          <Code lang="ruby" title="spec/services/place_order_spec.rb（段階1）" code={`
require "rails_helper"

RSpec.describe PlaceOrder do
  let(:payment) { FakePaymentGateway.new }
  let(:user) { User.create!(name: "佐藤") }
  let!(:tea) { Product.create!(name: "緑茶", price: 300, stock: 10) }

  def line(quantity) = PlaceOrder::Line.new(product_id: tea.id, quantity:)

  it "決済の後に DB の処理が失敗すると、注文がないのに決済だけが残る" do
    # 数量0の明細は、在庫の更新（stock >= 0）を通り、決済の後の明細の保存で失敗する
    expect { described_class.new(payment:).call(user:, lines: [line(0)]) }
      .to raise_error(ActiveRecord::RecordInvalid)

    expect([Order.count, tea.reload.stock]).to eq([0, 10]) # 注文と在庫はロールバックされた
    expect(payment.charges.size).to eq(1)                   # 決済は取り消されない
  end

  it "同じ注文を2回送ると、注文が2つでき、2回決済される" do
    2.times { described_class.new(payment:).call(user:, lines: [line(2)]) }

    expect([Order.count, payment.charges.size, tea.reload.stock]).to eq([2, 2, 6])
  end
end
`} />
          <Code lang="text" title="実行結果（bundle exec rspec --format documentation）" code={`
PlaceOrder
  決済の後に DB の処理が失敗すると、注文がないのに決済だけが残る
  同じ注文を2回送ると、注文が2つでき、2回決済される

Finished in 0.12971 seconds (files took 1.16 seconds to load)
2 examples, 0 failures
`} />
          <p>
            数量 0 の明細は在庫の条件（<code>stock &gt;= 0</code>）を通り、決済の後の <code>create!</code> で OrderItem の検証に失敗しました。注文と在庫はロールバックされましたが、決済は1件残っています。この例は決済の前に入力を検証すれば防げます。ただし、決済の後で DB の接続が切れる、デッドロックで失敗するといった障害は、入力の検証では防げません。
          </p>
          <Callout kind="note" title="段階1で止めてよい場合">
            <p>
              決済を外部に頼まない（代金引換だけ、社内の決済の仕組みが同じ DB にある）場合や、注文の数が少なく、決済と注文の食い違いを人が直せる場合は、段階1で十分です。次の段階に進むのは、上の問題が実際に困る場合だけです。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'stage2',
      title: '段階2：外部の決済をトランザクションの外に出す',
      body: (
        <>
          <p>取り消せない外部の処理は、DB のトランザクションの中で呼びません。トランザクションを2つに分け、決済をその間に置きます。</p>
          <ol>
            <li>トランザクション1：在庫を引き当て、注文を「決済待ち」の状態で作る。コミットすると、在庫の行のロックは解放される。</li>
            <li>トランザクションの外：決済サービスに決済を頼む。</li>
            <li>トランザクション2：注文を「支払い済み」にし、確認メールのメッセージを outbox_events に書く。</li>
          </ol>
          <p>
            この順序にすると、決済の前に失敗した場合は、お金は動いていません。トランザクション1の途中なら何も残らず、コミットの後なら決済待ちの注文が残るだけです。決済の後に失敗した場合も、決済待ちの注文が残ります。この注文は後で決済をやり直せば正しい状態にできます。そのためには、決済をやり直しても二重に決済されないことが必要です。
          </p>
          <p>
            段階2と段階3のコードは、同じ <code>app/services/place_order.rb</code> にあります。この節では、そのうち段階2にあたる部分を示します。
          </p>
          <h3>注文の状態</h3>
          <p>
            注文は決済待ち（<code>pending_payment</code>）、支払い済み（<code>paid</code>）、決済失敗（<code>payment_failed</code>）の3つの状態を持ちます。許される遷移は決済待ちから支払い済みへと、決済待ちから決済失敗への2つだけです。状態の遷移は、今の状態を条件にした UPDATE（<code>WHERE status = 'pending_payment'</code>）で行います。2つの処理が同時に遷移させようとしても、条件に合うのは先に UPDATE した1つだけです。
          </p>
          <Code lang="ruby" title="db/migrate/20261120000001_create_tables.rb（orders の部分）" code={`
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.string :request_key, null: false # 画面が注文ごとに作るキー。二重送信を見分ける
      t.string :payment_key, null: false, index: { unique: true } # 決済サービスに渡す冪等性キー
      t.integer :total, null: false # 円
      t.string :status, null: false
      t.string :payment_id
      t.timestamps
      t.index [:user_id, :request_key], unique: true
      t.index [:status, :created_at] # 再開のジョブが決済待ちの注文を探す
      t.check_constraint "status IN ('pending_payment', 'paid', 'payment_failed')", name: "orders_status_valid"
    end
`} />
          <Code lang="ruby" title="app/models/order.rb" code={`
class Order < ApplicationRecord
  belongs_to :user
  has_many :items, class_name: "OrderItem"
  accepts_nested_attributes_for :items

  # 決済待ち → 支払い済み／決済失敗。ほかの遷移はない
  enum :status, { pending_payment: "pending_payment", paid: "paid", payment_failed: "payment_failed" }

  def total_money = Money.new(amount: total, currency: :JPY)

  # 今の状態を条件にした UPDATE で状態を変える。別の処理が先に変えていれば false
  def change_status(from:, to:, **attributes)
    self.class.where(id:, status: from).update_all(status: to, updated_at: Time.current, **attributes) == 1
  end
end
`} />
          <p>
            <code>enum</code> は状態の名前で <code>pending_payment?</code> のような判定のメソッドとスコープを作ります<Ref n={5} />。状態の値は DB の CHECK 制約でも3つに限ります。<code>change_status</code> の <code>update_all</code> は1文の UPDATE を送り、変更した行の数を返します。検証とコールバックは動かず、<code>updated_at</code> も自動では更新されないので、自分で渡しています<Ref n={6} />。
          </p>
          <p>
            これは Explicit State Machine（<ChapterLink n={47} />）の考え方を、条件付きの UPDATE で守る形です。状態が3つで遷移も少ないので、AASM のような状態機械の gem（<ChapterLink n={47} section="aasm" />）は使いません。発送・キャンセル・返金のように状態と遷移が増えたら、遷移の表を持つ形に移ります。
          </p>
          <h3>在庫を先に引き当ててから決済する</h3>
          <p>
            トランザクション1では、決済より先に在庫を引き当てて注文を作ります。順序を逆にして決済を先にすると、決済が済んだ後で在庫が足りないとわかったときに、返金という別の外部の操作が必要になります。在庫を先に引き当てれば、在庫不足はトランザクション1のロールバックだけで済み、お金は動きません。
          </p>
          <p>
            その代わり、決済待ちの注文は在庫を押さえたままになります。拒否されたら決済失敗にして在庫を戻し、一時的な失敗が続いたら再開のジョブが決着させます。決済待ちのまま長く残る注文があると、その分の在庫が売れなくなるので、後の節で説明するように件数を監視します。<ChapterLink n={34} section="external-boundaries" />では、予約の行（InventoryReservation）に期限を持たせる方法も扱いました。
          </p>
          <Code lang="ruby" title="app/services/place_order.rb（トランザクション1）" code={`
  private

  def reserve(user:, request_key:, lines:)
    ApplicationRecord.transaction do
      total = Money.zero(:JPY)
      items = lines.map do |line|
        product = Product.reserve!(line.product_id, line.quantity)
        total += product.price_money * line.quantity
        { product:, quantity: line.quantity, unit_price: product.price }
      end
      user.orders.create!(request_key:, payment_key: SecureRandom.uuid, total: total.amount,
                          status: :pending_payment, items_attributes: items)
    end
  end
end
`} />
          <h3>決済の冪等性キーと再試行</h3>
          <p>
            決済サービスに渡す冪等性キー（<ChapterLink n={52} />）には、トランザクション1で注文に保存した <code>payment_key</code>（UUID）を使います。同じ注文の決済は何度頼んでも1回だけになります。Stripe のドキュメントは、冪等性キーを使えば、接続のエラーが起きたときに2つ目のオブジェクトを作るおそれなしに要求を繰り返せると説明し、キーには V4 の UUID か、衝突しないだけの十分なランダムさを持つ文字列を使うよう勧めています<Ref n={1} />。
          </p>
          <p>
            MSDP の終章は注文の ID（UUID）をそのままキーにしていました。Rails の注文の ID は MySQL の連番なので、開発環境や検証環境で DB を作り直すと同じ番号が使われ、同じ決済サービスのアカウントに同じキーを送ってしまうことがあります。そこで、注文とは別に UUID の列を持たせました。
          </p>
          <p>
            決済サービスが 503 を返したりタイムアウトしたりした場合は、<ChapterLink n={54} />の <code>RetryWithBackoff::Retrier</code> で再試行します。最初の1回を含めて3回まで、待ち時間は 0.2 秒から倍にして Full Jitter をかけ、利用者を待たせるので全体で3秒までにします。再試行するのは <code>PaymentUnavailableError</code> だけで、拒否（<code>Declined</code>）は戻り値なので再試行の対象になりません。1回ごとのタイムアウトは決済サービスを呼ぶ Adapter の側で付けます（<ChapterLink n={54} section="rails-impl" />）。
          </p>
          <p>
            Retrier は期限までの残り秒数をブロックに渡しますが、この章の <code>charge</code> の取り決めは MSDP の終章に合わせて残り時間を受け取らないので、ブロックでは使っていません。そのため3秒の期限が止めるのは次の試行を始めることだけで、試行の途中で3秒を過ぎることはあります。画面の応答時間を厳密に抑えるなら、<code>charge</code> に <code>timeout:</code> を加え、<ChapterLink n={54} /> の <code>CarrierClient#status</code> と同じように残り時間を1回ごとのタイムアウトに使います。
          </p>
          <Code lang="ruby" title="app/services/place_order.rb（決済と結果の記録）" code={`
# ユースケース「注文を確定する」。DB のトランザクションを2つに分け、外部の決済はその間で呼ぶ
class PlaceOrder
  Line = Data.define(:product_id, :quantity)

  # 決済の再試行：最初の1回を含めて3回まで、待ち時間は 0.2 秒から倍にする。画面を待たせるので全体で3秒まで
  RETRY_POLICY = RetryWithBackoff::Policy.new(max_attempts: 3, base: 0.2, cap: 1, deadline: 3)
  RETRY_ONLY_UNAVAILABLE = lambda do |error|
    RetryWithBackoff::Failure.new(retryable: error.is_a?(Payments::PaymentUnavailableError))
  end

  # 決済サービスと、再試行の待つ処理・乱数・時計を外から受け取る（テストでは代役を渡す）
  def initialize(payment: Payments.gateway, **retrier_deps)
    @payment = payment
    @retrier_deps = retrier_deps
  end
  # …（省略。call は段階3で示す）

  # 決済して結果を記録する。決済待ちのまま止まった注文を再開するときにも呼ぶ
  def complete_payment(order)
    return order unless order.reload.pending_payment?

    result = begin
      RetryWithBackoff::Retrier.new(policy: RETRY_POLICY, classify: RETRY_ONLY_UNAVAILABLE, **@retrier_deps).call do
        # 冪等性キーは注文ごとに1つ。再試行しても、再開しても、決済は1回だけになる
        @payment.charge(idempotency_key: order.payment_key, amount: order.total_money)
      end
    rescue Payments::PaymentUnavailableError
      return order # 一時的な失敗が続いた：決済待ちのまま残し、再開のジョブに任せる
    end

    case result
    in Payments::Succeeded(payment_id:)
      # トランザクション2：支払い済みにし、確認メールのメッセージを outbox に書く
      ApplicationRecord.transaction do
        next unless order.change_status(from: :pending_payment, to: :paid, payment_id:) # 別の処理が先に記録した

        OutboxEvent.create!(event_type: "order.paid", payload: { order_id: order.id })
      end
    in Payments::Declined
      # 拒否は再試行しない。決済失敗にして在庫を戻す
      ApplicationRecord.transaction do
        next unless order.change_status(from: :pending_payment, to: :payment_failed)

        order.items.each { |item| Product.release!(item.product_id, item.quantity) }
      end
    end
    order.reload
  end
`} />
          <p>
            一時的な失敗が続いたときは、注文を決済待ちのまま残して返し、画面には「決済を確認中」と表示します。拒否されたときは決済失敗にして在庫を戻します。支払い済みにするときは、同じトランザクションで outbox_events に確認メールのメッセージを書きます（<ChapterLink n={53} />）。<code>complete_payment</code> の最初の <code>order.reload</code> は、再開のジョブから呼ばれたときに、ほかの処理が先に記録した状態を読むためのものです。2つのトランザクションの中の <code>next</code> は、<code>change_status</code> が false（別の処理が先に記録した）のときにブロックを抜けるためのもので、何も変更せずにコミットします。
          </p>
          <p>
            確認メールは、outbox の中継の処理が送ります。中継の処理は<ChapterLink n={53} />と同じ作りで、送り先がメールになるだけなので、この章のコードには含めていません。複数の中継の処理が同じ行を送らないようにするリースは<ChapterLink n={34} section="external-boundaries" />でも扱いました。
          </p>
          <h3>結果がわからない失敗（HTTP 500）は扱わない</h3>
          <p>
            どの失敗を一時的とみなすかは、決済サービスの仕様に合わせて決めます。Stripe の API v1 は、冪等性キーを付けた要求への 500 の応答も保存し、同じキーで再試行すると保存した応答を返します<Ref n={1} />。500 の後に同じキーで再試行しても、同じ 500 が返るだけです。Stripe は、500 が返った要求の結果は不確定として扱い、元の結果がわかるまでは新しいキーで再試行しないよう求めています<Ref n={2} />。
          </p>
          <p>
            このような結果がわからない失敗は、この章のコードでは扱っていません。扱うには、500 を <code>PaymentUnavailableError</code> にせず別の例外にし、注文を「決済の結果を確認中」のような別の状態にして、再開のジョブの対象から外します。そのうえで、決済されたかどうかを決済サービスの記録や Webhook で確かめてから、支払い済みか決済失敗に進めます。照合の進め方は<ChapterLink n={34} section="external-boundaries" />と<ChapterLink n={52} section="delivery-guarantees" />で扱いました。
          </p>
        </>
      ),
    },
    {
      id: 'stage3',
      title: '段階3：二重送信と、止まった注文の再開',
      body: (
        <>
          <h3>注文の二重送信</h3>
          <p>
            注文のボタンが2回押されたり、通信のエラーでブラウザーが注文を送り直したりすると、同じ注文が2回届きます。注文の画面はフォームを表示するときに UUID を作って隠し項目の <code>request_key</code> に入れ、送り直すときも同じ値を使います。サーバーは、同じ利用者の同じキーの注文がすでにあれば、新しく作らずにその注文を返します。
          </p>
          <Code lang="ruby" title="app/services/place_order.rb（call）" code={`
  def call(user:, request_key:, lines:)
    # 1. 同じキーの注文があれば、新しく作らずにその注文を返す（二重送信）
    existing = user.orders.find_by(request_key:)
    return existing if existing

    # 2. トランザクション1：在庫の引き当てと、決済待ちの注文の作成
    order = begin
      reserve(user:, request_key:, lines:)
    rescue ActiveRecord::RecordNotUnique
      return user.orders.find_by!(request_key:) # 同じキーの要求が同時に来て、先に作られていた
    end

    # 3. トランザクションの外で決済し、トランザクション2で結果を記録する
    complete_payment(order)
  end
`} />
          <p>
            2つの要求がほぼ同時に届くと、どちらも「まだない」と判断して作ろうとします。orders の <code>(user_id, request_key)</code> の一意索引により、後の INSERT は失敗し、Rails は <code>ActiveRecord::RecordNotUnique</code> を投げます<Ref n={7} />。トランザクション1はロールバックされるので、後の要求が引き当てた在庫も戻ります。その後で、先に作られた注文を読み直して返します。2つのスレッドから、それぞれ別の DB 接続で同時に送りました。
          </p>
          <Code lang="text" title="実行結果（bin/rails runner script/flow.rb の後半。ID は 1 に整えた）" code={`
== 2: 同じキーの2つの要求が同時に届く（A と B は別の DB 接続）
  A: SELECT orders.* FROM orders WHERE orders.user_id = 1 AND orders.request_key = 'k-1' LIMIT 1
  A: BEGIN
  A: UPDATE products SET stock = stock - '2' WHERE products.id = 1 AND (stock >= '2')
  B: SELECT orders.* FROM orders WHERE orders.user_id = 1 AND orders.request_key = 'k-1' LIMIT 1
  B: BEGIN
  A: INSERT INTO orders VALUES (1, 'k-1', '(UUID)', 600, 'pending_payment', NULL, '…', '…')
  A: INSERT INTO order_items VALUES (1, 1, 2, 300)
  A: COMMIT
  B: UPDATE products SET stock = stock - '2' WHERE products.id = 1 AND (stock >= '2')
  A: SELECT orders.* FROM orders WHERE orders.id = 1 LIMIT 1
  A: （決済サービス）charge(idempotency_key: a261db1b…, amount: 600)
  A: BEGIN
  B: INSERT INTO orders VALUES (1, 'k-1', '(UUID)', 600, 'pending_payment', NULL, '…', '…')
  A: UPDATE orders SET orders.status = 'paid', orders.payment_id = 'pay-1' WHERE orders.id = 1 AND orders.status = 'pending_payment'
  A: INSERT INTO outbox_events VALUES ('(UUID)', 'order.paid', '{\\"order_id\\":1}', NULL, '…', '…')
  B: ROLLBACK
  B: SELECT orders.* FROM orders WHERE orders.user_id = 1 AND orders.request_key = 'k-1' LIMIT 1
  A: COMMIT
  A: SELECT orders.* FROM orders WHERE orders.id = 1 LIMIT 1
=> 返した注文の ID=[1, 1] 状態=["paid", "pending_payment"] 注文の数=1 決済=1回 stock=8
`} />
          <p>
            B の在庫の UPDATE は、A が同じ商品の行をロックしていたので、A の COMMIT まで待ちました。その後の B の INSERT は一意索引に違反し、B のトランザクションは ROLLBACK され、B は A の注文を返しました。B が読んだ時点では A はまだ決済中だったので、B の画面には「決済を確認中」が表示され、再読み込みすると支払い済みになります。注文は1件、決済は1回、在庫は 10 から 8 に減っただけです。
          </p>
          <p>
            この章のコードは、同じキーの注文を見つけたら、届いた明細が前と同じかどうかを確かめずにその注文を返します。説明を短くするために省きました。実務では、明細から作ったハッシュを注文と一緒に保存し、違えば 422 を返します（<ChapterLink n={52} />、<ChapterLink n={34} section="refactoring-stages" />の「二重送信を防ぐ」）。
          </p>
          <h3>画面と API への応答</h3>
          <p>
            PlaceOrder が返す注文の状態ごとに、HTTP の応答を選びます。この章では JSON を返す API で書きました。支払い済みなら 201、決済の結果がまだわからない決済待ちなら 202（Accepted。受け付けたが処理が終わっていない）、拒否なら 422、在庫不足なら 409 です。決済待ちを受け取った画面は「決済を確認中」と表示し、少し後で注文の状態を読み直します。
          </p>
          <Code lang="ruby" title="app/controllers/orders_controller.rb" code={`
# 注文の確定の API。結果の状態ごとに、HTTP の応答を選ぶ
class OrdersController < ActionController::API
  def create
    order = PlaceOrder.new.call(user: current_user, request_key: params.expect(:request_key), lines:)
    case order.status
    when "paid"
      render json: { id: order.id, status: order.status }, status: :created
    when "pending_payment" # 決済の結果がまだわからない。画面は「決済を確認中」と表示し、後で状態を読み直す
      render json: { id: order.id, status: order.status }, status: :accepted
    when "payment_failed"
      render json: { id: order.id, status: order.status, error: "カードが使えませんでした" }, status: :unprocessable_content
    end
  rescue Product::OutOfStock => e
    render json: { error: e.message }, status: :conflict
  end

  private

  def lines
    params.expect(lines: [[:product_id, :quantity]]).map do |line|
      PlaceOrder::Line.new(product_id: Integer(line[:product_id]), quantity: Integer(line[:quantity]))
    end
  end

  # この章の検証では、認証の代わりにヘッダーで利用者を指定する
  def current_user = User.find(request.headers.fetch("X-User-Id"))
end
`} />
          <Code lang="ruby" title="spec/requests/orders_spec.rb" code={`
require "rails_helper"

RSpec.describe "POST /orders", type: :request do
  let(:payment) { FakePaymentGateway.new }
  let(:user) { User.create!(name: "佐藤") }
  let!(:tea) { Product.create!(name: "緑茶", price: 300, stock: 10) }

  before do
    allow(Payments).to receive(:gateway).and_return(payment)
    allow(Kernel).to receive(:sleep) # 決済の再試行の待ち時間は、実際には待たない
  end

  def post_order(request_key: "k-1", quantity: 2)
    post "/orders", params: { request_key:, lines: [{ product_id: tea.id, quantity: }] },
                    headers: { "X-User-Id" => user.id.to_s }, as: :json
    [response.status, response.parsed_body]
  end

  it "支払い済みなら 201、同じ request_key で送り直すと同じ注文を返す" do
    first = post_order
    again = post_order

    expect(first).to eq([201, { "id" => Order.last.id, "status" => "paid" }])
    expect(again).to eq(first)
    expect(payment.charges.size).to eq(1)
  end

  it "決済の結果がわからないまま再試行を使い切ったら 202（決済待ち）" do
    payment.failures = %i[temporary temporary temporary]

    status, body = post_order
    expect([status, body["status"]]).to eq([202, "pending_payment"])
  end

  it "拒否は 422、在庫不足は 409" do
    payment.failures = [:decline]

    expect(post_order.first).to eq(422)
    expect(post_order(request_key: "k-2", quantity: 11)).to eq([409, { "error" => "在庫が足りません: #{tea.id}" }])
  end
end
`} />
          <p>
            <code>params.expect(:request_key)</code> は、<code>request_key</code> がなければ 400 を返し、配列やハッシュが送られた場合も受け付けません。<code>lines: [[:product_id, :quantity]]</code> の二重の配列は、ハッシュの配列を受け取るという指定です。
          </p>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で加わったメソッドです<Ref n={8} />。Rails 7.2 では <code>params.require(:request_key)</code> と <code>params.permit(lines: [:product_id, :quantity]).require(:lines)</code> で同じ値を取り出します。
            </p>
          </Callout>
          <p>
            コントローラーは HTTP の入力を Use Case の引数に変え、結果を HTTP の応答に変えるだけで、在庫・決済・状態の規則は持ちません。同じ <code>request_key</code> で送り直したリクエストには、1回目と同じ 201 と同じ注文が返り、決済は1回のままでした。PlaceOrder の既定の再試行は <code>Kernel.sleep</code> で待つので、リクエストのテストでは <code>allow(Kernel).to receive(:sleep)</code> で待たないようにしています。Retrier は待つ処理を作るときに <code>Kernel.method(:sleep)</code> で取り出すので、差し替えた後の <code>sleep</code> が使われます。
          </p>
          <h3>止まった注文の再開</h3>
          <p>
            決済の後、トランザクション2の前にプロセスが止まると、決済待ちの注文が残ります。決済の一時的な失敗が続いた場合も同じです。定期的に動くジョブが、決済待ちのまま一定の時間がたった注文を探し、決済からやり直します。
          </p>
          <Code lang="ruby" title="app/jobs/resume_pending_orders_job.rb" code={`
# 決済待ちのまま一定の時間がたった注文を、決済からやり直す。5分ごとに実行する（定期実行の登録は省略）
class ResumePendingOrdersJob < ApplicationJob
  def perform(older_than: 5.minutes.ago)
    place_order = PlaceOrder.new
    Order.pending_payment.where(created_at: ...older_than).find_each do |order|
      place_order.complete_payment(order)
    rescue StandardError => e
      Rails.error.report(e) # 1件が失敗しても、残りの注文の再開は続ける
    end
  end
end
`} />
          <p>
            決済の冪等性キーは注文に保存した <code>payment_key</code> なので、すでに決済されていれば、決済サービスは前の結果を返します。ただし、キーを保存しておく期間には限りがあります。Stripe（API v1）は、キーを少なくとも 24 時間保持した後で削除することがあり、削除された後に同じキーで送った要求は新しい要求として扱われます<Ref n={1} /><Ref n={2} />。再開のジョブは、この期間より十分に短い間隔で動かし、期間を過ぎても決済待ちの注文は、再開せずに照合の対象にします。定期実行の登録は<ChapterLink n={18} section="recurring-jobs" />で扱いました。
          </p>
          <p>
            再開のジョブと元の処理が同時にトランザクション2を実行しても、状態を条件にした UPDATE のおかげで、記録するのは片方だけです。outbox_events の行も1つしか書かれません。
          </p>
          <h3>テスト</h3>
          <p>
            決済サービスの代役（FakePaymentGateway）と、<ChapterLink n={54} section="test" />の FakeTime・FixedRandom を使います。失敗は代役の <code>failures</code> に、次の呼び出しで起こす順に入れます。待つ処理は FakeTime に記録されるだけなので、再試行のテストも実際には待ちません。
          </p>
          <Code lang="ruby" title="spec/services/place_order_spec.rb" code={`
require "rails_helper"

RSpec.describe PlaceOrder do
  let(:payment) { FakePaymentGateway.new }
  let(:time) { FakeTime.new }
  let(:place_order) { described_class.new(payment:, sleeper: time.sleeper, random: FixedRandom.new(0.5), clock: time.clock) }
  let(:user) { User.create!(name: "佐藤") }
  let!(:tea) { Product.create!(name: "緑茶", price: 300, stock: 10) }

  def line(quantity) = PlaceOrder::Line.new(product_id: tea.id, quantity:)
  def stock = tea.reload.stock

  it "注文を確定すると、在庫が減り、1回だけ決済され、確認メールのメッセージが outbox に入る" do
    order = place_order.call(user:, request_key: "k-1", lines: [line(2)])

    expect([order.status, order.total, stock, payment.charges.size]).to eq(["paid", 600, 8, 1])
    expect(OutboxEvent.pluck(:event_type, :payload)).to eq([["order.paid", { "order_id" => order.id }]])
  end

  it "在庫が足りなければ、何も残さず、決済もしない" do
    expect { place_order.call(user:, request_key: "k-1", lines: [line(11)]) }.to raise_error(Product::OutOfStock)
    expect([Order.count, stock, payment.charges.size]).to eq([0, 10, 0])
  end

  it "決済の一時的な失敗は、待ち時間を延ばして再試行する。応答が届かなかった決済も、同じキーなので二重にならない" do
    payment.failures = %i[temporary timeout]
    order = place_order.call(user:, request_key: "k-1", lines: [line(1)])

    expect(order.status).to eq("paid")
    expect(time.sleeps).to eq([0.1, 0.2]) # 0.2秒 × 2^(n-1) × 乱数 0.5
    expect(payment.charges.size).to eq(1)
  end

  it "カードが使えないときは再試行せず、注文を決済失敗にして在庫を戻す" do
    payment.failures = [:decline]
    order = place_order.call(user:, request_key: "k-1", lines: [line(3)])

    expect([order.status, stock, time.sleeps, OutboxEvent.count]).to eq(["payment_failed", 10, [], 0])
  end

  it "同じキーで2回送ると、2回目は1回目の注文を返す" do
    first = place_order.call(user:, request_key: "k-1", lines: [line(2)])
    second = place_order.call(user:, request_key: "k-1", lines: [line(2)])

    expect(second.id).to eq(first.id)
    expect([Order.count, stock, payment.charges.size]).to eq([1, 8, 1])
  end

  it "記録の処理が2回動いても、状態を条件にした UPDATE で、outbox の行は1つだけ" do
    payment.failures = %i[timeout timeout timeout] # 決済はされたが、3回とも応答が届かない
    order = place_order.call(user:, request_key: "k-1", lines: [line(1)])
    expect(order.status).to eq("pending_payment")

    stale = Order.find(order.id) # 再開のジョブと元の処理が、同じ注文を決済待ちとして読んだ
    2.times { place_order.complete_payment(stale) }

    expect([stale.status, payment.charges.size, OutboxEvent.count]).to eq(["paid", 1, 1])
  end
end
`} />
          <p>
            最後のテストは、再開のジョブと元の処理が同じ注文を決済待ちとして読んだ場面を、同じオブジェクトで <code>complete_payment</code> を2回呼んで再現しています。2回目は <code>reload</code> で支払い済みとわかるので、決済も outbox の書き込みもしません。<code>reload</code> の後で2つの処理が同時に記録しようとした場合も、状態を条件にした UPDATE で片方だけが記録します。
          </p>
          <Code lang="ruby" title="spec/services/place_order_concurrency_spec.rb" code={`
require "rails_helper"

# 2つのスレッドがそれぞれの DB 接続でコミットするので、テストのトランザクションを使わない
RSpec.describe PlaceOrder, "二重送信" do
  self.use_transactional_tests = false

  let(:payment) { FakePaymentGateway.new }
  let(:user) { User.create!(name: "佐藤") }
  let!(:tea) { Product.create!(name: "緑茶", price: 300, stock: 10) }

  after { [OutboxEvent, OrderItem, Order, Product, User].each(&:delete_all) }

  it "同じキーで2つの要求が同時に届いても、注文は1つで、決済も在庫の引き当ても1回" do
    lines = [PlaceOrder::Line.new(product_id: tea.id, quantity: 2)]
    threads = 2.times.map do
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do
          PlaceOrder.new(payment:).call(user:, request_key: "k-1", lines:)
        end
      end
    end
    a, b = threads.map(&:value)

    expect(a.id).to eq(b.id)
    expect([tea.reload.stock, payment.charges.size, Order.count]).to eq([8, 1, 1])
  end
end
`} />
          <p>
            このテストは2つのスレッドから同じ request_key で PlaceOrder を呼び、注文が1つ、決済が1回、在庫の減りが2個分だけであることを確かめます。どちらのスレッドが先に INSERT するかは実行のたびに変わりますが、結果は同じになります。2つのスレッドが別々の DB 接続でコミットするので、このファイルではテストのトランザクション（<ChapterLink n={20} section="transaction" />）を使わず、終わった後で表を空にしています。
          </p>
          <Code lang="ruby" title="spec/jobs/resume_pending_orders_job_spec.rb" code={`
require "rails_helper"

RSpec.describe ResumePendingOrdersJob, type: :job do
  let(:payment) { FakePaymentGateway.new }
  let(:user) { User.create!(name: "佐藤") }
  let!(:tea) { Product.create!(name: "緑茶", price: 300, stock: 10) }

  before { allow(Payments).to receive(:gateway).and_return(payment) }

  it "決済の後、記録する前に止まった注文を、同じキーで決済し直して記録する。二重に決済しない" do
    payment.failures = %i[timeout timeout timeout] # 決済はされたが、3回とも応答が届かない
    place_order = PlaceOrder.new(payment:, sleeper: ->(_) {})
    order = place_order.call(user:, request_key: "k-1", lines: [PlaceOrder::Line.new(product_id: tea.id, quantity: 1)])
    expect(order.status).to eq("pending_payment")

    travel 6.minutes do
      described_class.perform_now
    end

    expect([order.reload.status, payment.charges.size, OutboxEvent.count]).to eq(["paid", 1, 1])
  end

  it "決済待ちになってから5分たっていない注文には触れない" do
    payment.failures = %i[temporary temporary temporary]
    order = PlaceOrder.new(payment:, sleeper: ->(_) {}).call(user:, request_key: "k-1",
                                                             lines: [PlaceOrder::Line.new(product_id: tea.id, quantity: 1)])

    travel 4.minutes do
      described_class.perform_now
    end

    expect([order.reload.status, payment.charges.size]).to eq(["pending_payment", 0])
  end
end
`} />
          <p>
            再開のジョブのテストでは、決済はされたのに応答が3回とも届かない状態を作り、注文を決済待ちで残します。<code>travel 6.minutes</code> で時刻を6分進めてからジョブを実行すると、ジョブは同じ <code>payment_key</code> で決済し直し、代役は前の決済の結果を返すので、決済は1件のまま注文が支払い済みになります。4分しか進めない場合は、ジョブはその注文に触れません。
          </p>
          <Code lang="text" title="実行結果（bundle exec rspec --format documentation。MySQL 8.4）" code={`
ResumePendingOrdersJob
  決済の後、記録する前に止まった注文を、同じキーで決済し直して記録する。二重に決済しない
  決済待ちになってから5分たっていない注文には触れない

POST /orders
  支払い済みなら 201、同じ request_key で送り直すと同じ注文を返す
  決済の結果がわからないまま再試行を使い切ったら 202（決済待ち）
  拒否は 422、在庫不足は 409

PlaceOrder 二重送信
  同じキーで2つの要求が同時に届いても、注文は1つで、決済も在庫の引き当ても1回

PlaceOrder
  注文を確定すると、在庫が減り、1回だけ決済され、確認メールのメッセージが outbox に入る
  在庫が足りなければ、何も残さず、決済もしない
  決済の一時的な失敗は、待ち時間を延ばして再試行する。応答が届かなかった決済も、同じキーなので二重にならない
  カードが使えないときは再試行せず、注文を決済失敗にして在庫を戻す
  同じキーで2回送ると、2回目は1回目の注文を返す
  記録の処理が2回動いても、状態を条件にした UPDATE で、outbox の行は1つだけ

Finished in 0.41788 seconds (files took 0.88833 seconds to load)
12 examples, 0 failures
`} />
        </>
      ),
    },
    {
      id: 'sequence',
      title: '全体の流れと、各パターンが働く位置',
      body: (
        <>
          <p>図 108-2 は段階3の注文の確定の全体の流れです。左端の印はその箇所で働いているパターンです。</p>
          <Figure n="108-2" title="注文の確定の全体の流れと、各パターンが働く位置" caption="段階3のコードの流れをまとめた模式図。決済は2つのトランザクションの間にある。">
            <SequenceFigure />
          </Figure>
          <p>
            図 108-2 の上から、二重送信の確認、トランザクション1、決済と再試行、トランザクション2、ブラウザーへの応答と進み、点線より下は別のプロセスで後から動く処理です。決済サービスとのやり取りはどのトランザクションの枠にも入っていません。同じ流れを SQL で見ると次のとおりです。
          </p>
          <Code lang="text" title="実行結果（bin/rails runner script/flow.rb の前半。ID は 1 に整えた）" code={`
== 1: 注文を確定する（request_key: k-1）
  SELECT orders.* FROM orders WHERE orders.user_id = 1 AND orders.request_key = 'k-1' LIMIT 1
  BEGIN
  UPDATE products SET stock = stock - '2' WHERE products.id = 1 AND (stock >= '2')
  INSERT INTO orders VALUES (1, 'k-1', '(UUID)', 600, 'pending_payment', NULL, '…', '…')
  INSERT INTO order_items VALUES (1, 1, 2, 300)
  COMMIT
  SELECT orders.* FROM orders WHERE orders.id = 1 LIMIT 1
  （決済サービス）charge(idempotency_key: 9d84e7be…, amount: 600)
  BEGIN
  UPDATE orders SET orders.status = 'paid', orders.payment_id = 'pay-1' WHERE orders.id = 1 AND orders.status = 'pending_payment'
  INSERT INTO outbox_events VALUES ('(UUID)', 'order.paid', '{\\"order_id\\":1}', NULL, '…', '…')
  COMMIT
  SELECT orders.* FROM orders WHERE orders.id = 1 LIMIT 1
=> status=paid total=600 stock=8 outbox=["order.paid"]
`} />
          <p>
            段階1の実行結果と比べると、決済の呼び出しが2組の BEGIN と COMMIT の間に移っています。<code>script/flow.rb</code> は <code>sql.active_record</code> の通知を購読して SQL を表示し、決済サービスの代役が呼ばれたときに1行を表示するスクリプトです（通知の購読は<ChapterLink n={22} section="notifications" />）。この章で使ったパターンと、その役割は次のとおりです。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">パターン</th>
                  <th scope="col">この章での役割</th>
                  <th scope="col">コードの場所</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Dependency Injection（<ChapterLink n={40} />）</th>
                  <td>決済サービス・待つ処理・乱数・時計をコンストラクターで受け取り、テストで差し替える</td>
                  <td><code>PlaceOrder#initialize</code></td>
                </tr>
                <tr>
                  <th scope="row">Adapter（<ChapterLink n={42} />）</th>
                  <td>注文の処理は、決済サービスを <code>charge</code> だけを持つ取り決めを通して呼ぶ。本番では決済会社の SDK を包んだ Adapter を設定する</td>
                  <td><code>Payments</code></td>
                </tr>
                <tr>
                  <th scope="row">Use Case（<ChapterLink n={44} />）</th>
                  <td>注文の確定の手順と、トランザクションの範囲を1つのクラスにまとめる</td>
                  <td><code>PlaceOrder#call</code></td>
                </tr>
                <tr>
                  <th scope="row">Value Object（<ChapterLink n={46} />）</th>
                  <td>合計を Money で計算する</td>
                  <td><code>Money</code></td>
                </tr>
                <tr>
                  <th scope="row">Explicit State Machine（<ChapterLink n={47} />）の考え方</th>
                  <td>注文の3つの状態と、許される2つの遷移を決め、今の状態を条件にした UPDATE で守る（gem は使わない）</td>
                  <td><code>Order#change_status</code></td>
                </tr>
                <tr>
                  <th scope="row">条件付きの UPDATE（<ChapterLink n={49} section="stock-update" />）</th>
                  <td>在庫を1文で引き当て、負にしない</td>
                  <td><code>Product.reserve!</code></td>
                </tr>
                <tr>
                  <th scope="row">Idempotency Key（<ChapterLink n={52} />）</th>
                  <td>注文の二重送信を <code>request_key</code> で見分ける。決済を <code>payment_key</code> で二重にしない</td>
                  <td><code>PlaceOrder#call</code>・<code>#complete_payment</code></td>
                </tr>
                <tr>
                  <th scope="row">Transactional Outbox（<ChapterLink n={53} />）</th>
                  <td>確認メールのメッセージを、支払い済みへの変更と同じトランザクションで記録する</td>
                  <td><code>OutboxEvent</code></td>
                </tr>
                <tr>
                  <th scope="row">Retry with Backoff（<ChapterLink n={54} />）</th>
                  <td>決済の一時的な失敗だけを、待ち時間を延ばして全体で3秒まで再試行する</td>
                  <td><code>PlaceOrder::RETRY_POLICY</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'failures',
      title: 'どこで障害が起きたら何が起こるか',
      body: (
        <>
          <p>
            第9部の序章の原則の1つは、障害と再実行を設計に含めることでした（<ChapterLink n={39} section="principles" />）。図 108-3 は、障害が起きる箇所ごとに、この章のコードの振る舞いと結果をまとめたものです。
          </p>
          <Figure n="108-3" title="障害が起きる箇所ごとの振る舞い" caption="段階3のコードについてまとめた表。破線の行（500 の応答）は、この章のコードでは扱っていない。">
            <FailuresFigure />
          </Figure>
          <p>
            図 108-3 の上の8行の箇所では、どこで止まっても、やり直せば正しい状態にたどり着き、二重の決済も、決済だけが残る状態も起きません。1〜7行目は、前の節のテストと実行結果で確かめた振る舞いです。8行目の中継の処理は、この章のコードに含めていません（<ChapterLink n={53} />）。この結果は、次の3つの性質の組み合わせで成り立っています。
          </p>
          <ul>
            <li>取り消せない処理（決済、メール）を、DB のトランザクションの中で行わない。</li>
            <li>やり直しても結果が変わらない。決済は冪等性キーで、状態の変更は今の状態を条件にした UPDATE で、二重に行われない。</li>
            <li>途中で止まったことが、DB の状態（決済待ちの注文、未送信の outbox_events の行）として残り、後で見つけてやり直せる。</li>
          </ul>
          <p>
            ただし、確認メールは2回届くことがあります。outbox の中継の処理が保証できるのは少なくとも1回の配信で、メールを送った後、送信済みの記録をする前に止まると、同じメールがもう一度送られます（<ChapterLink n={52} section="delivery-guarantees" />）。2回届いても困らない文面にするか、メールの送信サービスが重複を扱えるかを確かめます。
          </p>
          <p>
            どの行でも、問題が起きたことは DB の状態として残ります。そこで、残った状態を監視します。たとえば「作ってから 30 分たっても決済待ちの注文」「作ってから 10 分たっても送っていない outbox_events の行」の件数を定期的に数え、0 でなければ担当者に知らせます。再開のジョブが例外を <code>Rails.error.report</code> に送っているのも、1件ずつの失敗に気付くためです。再開を何度試しても決済待ちのままの注文は、決済サービスの管理画面で確かめて、人が決着させます。
          </p>
          <p>
            最後の行の 500 の応答は前の節で説明したとおり、この章のコードでは扱っていません。決済サービスの仕様によって、どの応答が「結果がわからない」にあたるかが変わるので、Adapter を作るときに決済サービスのドキュメントで確かめ、その失敗を別の例外と別の状態で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'too-much',
      title: 'パターンを入れすぎたコードとの比較',
      body: (
        <>
          <p>この章では、使わなかったパターンもあります。図 108-4 は、同じ注文の確定に、第9部のパターンをできるだけ多く入れたコードと比べたものです。</p>
          <Figure n="108-4" title="パターンを入れすぎたコードとの比較" caption="左は、まだ起きていない変更に備えて部品を入れたコード。右は、この章の段階3のコード。">
            <TooMuchFigure />
          </Figure>
          <p>入れすぎたコードのファイルの構成は、たとえば次のようになります。</p>
          <Code lang="text" code={`
app/
  services/place_order.rb               # 手順の大半はイベントの発行
  repositories/order_repository.rb      # Active Record を包み直しただけ
  units_of_work/order_unit_of_work.rb
  strategies/payments/stripe_strategy.rb
  factories/payment_strategy_factory.rb # 選ぶ相手は1社だけ
  events/order_placed.rb
  subscribers/reserve_stock_subscriber.rb
  subscribers/charge_payment_subscriber.rb
  subscribers/send_confirmation_subscriber.rb
  models/order.rb                       # AASM の定義と、遷移のコールバック
config/initializers/container.rb        # すべてのクラスを登録する
`} />
          <p>
            それぞれの部品には理由があるように見えます。しかし、決済会社は1社しかなく、確定の後の処理は確認メールだけで、注文の状態は3つしかありません。注文の確定の流れを読むには、イベントの購読者を含めて10以上のファイルを行き来することになり、トランザクションの範囲や、決済がトランザクションの外にあることも、1か所を読んでもわかりません。まだ起きていない変更のための部品は、読む人と変更する人の手間を増やします。
          </p>
          <p>
            Fowler は YAGNI（You Aren't Gonna Need It。将来必要になると見込んだ機能を今は作らないこと）の説明で、まだ使われない機能のために先に書くコード（presumptive feature）の費用を挙げています。その機能が結局いらなかった場合は、分析・実装・テストにかけた手間（cost of build）が無駄になります。必要だった場合でも、そのコードがあることでソフトウェアの変更やデバッグが難しくなり、ほかの機能を作る費用が増えます（cost of carry）<Ref n={3} />。
          </p>
          <p>この章の構成にさらにパターンを足す条件は、次のとおりです。</p>
          <ul>
            <li>決済会社が2社になったら、Adapter を足し、どちらを使うかを設定で選ぶ（<ChapterLink n={42} />）。注文ごとに決済会社を選ぶなら、選び方を Strategy にする（<ChapterLink n={41} />）。</li>
            <li>注文の確定の後の処理（ポイントの付与、在庫の補充の依頼）が増えたら、ドメインイベントを入れる（<ChapterLink n={51} />）。</li>
            <li>注文の状態や遷移が増えたら（発送、キャンセル、返金）、遷移の表を持つ状態機械の形にする（<ChapterLink n={47} />）。</li>
            <li>注文を保存する処理がほかにも増え、保存の手順をまとめたくなったら Repository（<ChapterLink n={44} section="repository" />）、複数の集約をまとめて保存するなら Unit of Work（<ChapterLink n={48} />）を検討する。</li>
            <li>注文の一覧や売上の集計が遅くなったら、集計表を作る（<ChapterLink n={50} />）。</li>
            <li>HTTP の共通の処理（認証、ログ）が増えたら、ミドルウェアにまとめる（<ChapterLink n={43} />）。</li>
          </ul>
          <p>
            どの条件も、パターンの名前ではなく、コードに現れる兆候で書いています。兆候が現れてから、その兆候を解決するパターンだけを足します。足すときは、この章と同じ手順を踏みます。まず兆候が引き起こす不具合や変更の手間をテストか実行結果で確かめ、次にパターンを足し、同じテストで直ったことを確かめます。直したい問題をテストで示せないなら、そのパターンはまだ必要ありません。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'この章と第9部のまとめ',
      body: (
        <>
          <h3>この章のまとめ</h3>
          <ul>
            <li>最小の構成（Use Case と Value Object）から始め、具体的な問題をテストで確かめてから、その問題を解決するパターンを足します。</li>
            <li>取り消せない外部の処理は、DB のトランザクションの外に置きます。トランザクションを2つに分け、間の状態（pending_payment）を DB に残します。</li>
            <li>状態の遷移は、今の状態を条件にした UPDATE で守ります。2つの処理が同時に記録しようとしても、記録するのは片方だけです。</li>
            <li>外部への要求は冪等性キーでやり直せるようにし、一時的な失敗だけを再試行します。キーは注文ごとに UUID で作って保存し、MySQL の連番は使いません。</li>
            <li>二重送信は一意索引と RecordNotUnique で見分け、途中で止まった注文は DB に残った状態から再開のジョブで再開します。</li>
            <li>障害が起きる箇所を1つずつ挙げ、それぞれで何が起き、何が残るかを確かめます。HTTP 500 のような結果がわからない失敗は、別の状態として扱う必要があります。</li>
            <li>まだ起きていない変更のための部品は入れず、次のパターンを足す条件を兆候で決めておきます。</li>
          </ul>
          <h3>第9部のまとめ</h3>
          <p>
            第9部では MSDP のカタログの15のパターンを、具体的な場面で起きる問題から始めて Rails のコードで実装しました。どのパターンも「この問題が起きたら、この形で解決する」という組です。パターンの名前を覚えることより、各章の最初の節に書いた兆候（同じ手順が複数の場所に書かれている、テストのために外部のサービスを書き換えている、再試行の回数を誰も把握していない、など）に気付けることが大切です。兆候から章を引くには、序章の一覧（<ChapterLink n={39} section="symptoms" />）を使ってください。主な兆候と、対応するパターンを次の表にまとめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">コードに現れる兆候</th>
                  <th scope="col">パターン</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>クラスの中で外部 API のクライアントを作ったり現在時刻を直接読んだりしていて、テストのたびに差し替えの工夫が要る</td><td>Dependency Injection（<ChapterLink n={40} />）</td></tr>
                <tr><td>料金や権限などのルールが増えるたびに、同じ形の if や case が長くなる</td><td>Strategy / Policy（<ChapterLink n={41} />）</td></tr>
                <tr><td>外部サービスの応答の項目名やエラーコードが、業務のコードのあちこちに出てくる</td><td>Adapter（<ChapterLink n={42} />）</td></tr>
                <tr><td>認証・ログ・エラー処理を、コントローラーの各アクションに同じように書いている</td><td>Middleware Chain（<ChapterLink n={43} />）</td></tr>
                <tr><td>1つの業務操作の手順が、コントローラーとモデルのあちこちに散らばっている</td><td>Use Case（<ChapterLink n={44} />）</td></tr>
                <tr><td>計算のテストを書くのに、DB やテストダブルの準備が必要になる</td><td>Functional Core, Imperative Shell（<ChapterLink n={45} />）</td></tr>
                <tr><td>金額・期間・メールアドレスの検証が、使う場所ごとに書かれている</td><td>Value Object（<ChapterLink n={46} />）</td></tr>
                <tr><td>状態を複数の真偽値のフラグで表していて、ありえない組み合わせが起きる</td><td>Explicit State Machine（<ChapterLink n={47} />）</td></tr>
                <tr><td>複数の行を変更する処理が途中で失敗すると、一部の行だけが保存される</td><td>Unit of Work（<ChapterLink n={48} />）</td></tr>
                <tr><td>2人が同時に編集すると、後から保存した人の内容で上書きされる</td><td>Optimistic Locking（<ChapterLink n={49} />）</td></tr>
                <tr><td>一覧やダッシュボードを表示するたびに、重い集計をしている</td><td>Materialized View（<ChapterLink n={50} />）</td></tr>
                <tr><td>1つの操作の後に、メール・ポイントの付与・分析などの処理が増え続ける</td><td>Domain Events（<ChapterLink n={51} />）</td></tr>
                <tr><td>ボタンの連打や通信の再送で、決済やメールの送信が2回実行される</td><td>Idempotency Key（<ChapterLink n={52} />）</td></tr>
                <tr><td>DB は更新されたのに、ほかのシステムへの通知が届かないことがある</td><td>Transactional Outbox（<ChapterLink n={53} />）</td></tr>
                <tr><td>外部 API の一時的なエラーで処理全体が失敗する。または、再試行が相手の負荷をさらに上げる</td><td>Retry with Backoff（<ChapterLink n={54} />）</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            兆候があることは、パターンが必要であることの証拠ではありません。この章の注文の確定でも、状態が3つしかないので状態機械の gem は使わず、保存する処理が1つなので Repository も作りませんでした。兆候に気付いたら、まず問題をテストか実行結果で確かめ、Rails の標準の機能で足りるかを調べます。
          </p>
          <p>
            Rails には、パターンと同じ役割を持つ標準の機能が多くあります。Active Record のトランザクションと楽観的ロック、Active Job の <code>retry_on</code>、<code>enum</code>、<code>ActiveSupport::Notifications</code> などです。パターンを入れる前に、Rails の標準の機能で足りないかを確かめ、足りない部分だけをパターンで補います。各章の「ほかの方法との使い分けと採用の判断」の節が、その判断の材料です。
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: 'Idempotent requests', publisher: 'Stripe API Reference', url: 'https://docs.stripe.com/api/idempotent_requests', accessed: '2026-11-13', note: '冪等性キーで要求を安全にやり直せること、同じキーの再試行には 500 も含めて保存した最初の結果を返すこと（API v1）、キーには V4 UUID など十分にランダムな値を勧めること、24時間以上たったキーは削除されることがあること。' },
    { title: 'Advanced error handling（Idempotency）', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/error-low-level', accessed: '2026-11-20', version: 'API v1 の説明', note: '500 が返った要求の結果は不確定として扱い、元の結果がわかるまで新しいキーで再試行しないこと、キーを少なくとも24時間保持すること、24時間を過ぎても結果が不明なら照合すること。' },
    { title: 'Yagni', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/bliki/Yagni.html', accessed: '2026-11-13', version: '2015年5月26日', note: '今は必要のない機能を先に作る費用（cost of build と cost of carry）。' },
    { title: 'UPDATE Statement', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/update.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'UPDATE の構文に RETURNING 句がないこと、UPDATE が変更した行の数を返すこと。' },
    { title: 'ActiveRecord::Enum', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Enum.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'enum が状態ごとの判定メソッドとスコープを作ること。' },
    { title: 'ActiveRecord::Relation#update_all', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Relation.html#method-i-update_all', accessed: '2026-11-20', version: 'Rails 8.1', note: '1文の UPDATE を送り、コールバックと検証を動かさないこと、updated_at を自動で更新しないこと、変更した行の数を返すこと。' },
    { title: 'ActiveRecord::RecordNotUnique', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/RecordNotUnique.html', accessed: '2026-11-20', version: 'Rails 8.1', note: '一意制約の違反で投げられる例外であること。' },
    { title: 'actionpack/CHANGELOG.md（Rails 8.0.0）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.0.0/actionpack/CHANGELOG.md', accessed: '2026-11-20', version: 'Rails 8.0.0', note: 'params.expect が加わったこと、二重の配列でハッシュの配列を指定すること、不正な形の値で 400 を返すこと。' },
  ],
}

export default chapter
