import { principleSection } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 74-1 場面の構成：3つの帳票と ReportBuilder ---------- */
const sceneCallers = [
  { y: 36, lines: ['MonthlySalesReport（経理）', 'total_row'] },
  { y: 130, lines: ['PickingList（倉庫）', 'per_item・sort_by'] },
  { y: 224, lines: ['ProductSalesReport（営業）', 'group_by・sort_by・desc・total_row'] },
]
const sceneMethods = [
  { y: 44, h: 32, lines: ['to_csv（見出し・行・合計の行）'] },
  { y: 84, h: 32, lines: ['rows（分岐で行の作り方を選ぶ）'] },
  { y: 124, h: 32, lines: ['order_rows（1注文を1行）'] },
  { y: 164, h: 46, lines: ['item_rows（明細ごとに1行）', 'セット商品を中身に分ける'] },
  { y: 222, h: 32, lines: ['grouped（商品ごとに集計）'] },
]
const sceneTables = [
  { y: 40, name: 'orders' },
  { y: 96, name: 'order_items' },
  { y: 152, name: 'products' },
  { y: 208, name: 'bundle_items' },
]

function SceneFigure() {
  return (
    <Svg
      id="74-1"
      w={780}
      h={420}
      label="3つの帳票のクラスが共通の ReportBuilder を呼ぶ。経理の MonthlySalesReport は total_row を、倉庫の PickingList は per_item と sort_by を、営業の ProductSalesReport は group_by・sort_by・desc・total_row を渡す。ReportBuilder の中には、to_csv、分岐で行の作り方を選ぶ rows、1注文を1行にする order_rows、明細ごとに1行にしてセット商品を中身に分ける item_rows、商品ごとに集計する grouped がある。ReportBuilder は orders・order_items・products・bundle_items の4つのテーブルを読む。要望4で item_rows を変え、倉庫と営業の両方がそこを通る。11月の CSV の合計は、経理が16800、営業が9000で、営業の CSV からギフトセットが消えた。倉庫の出荷リストはセット商品を中身に分けた"
    >
      <T x={20} y={18} fs={12} bold>
        帳票（呼び出し側）
      </T>
      <T x={300} y={18} fs={12} bold>
        ReportBuilder（引数 7 個）
      </T>
      <T x={590} y={18} fs={12} bold>
        テーブル
      </T>
      {sceneCallers.map((c) => (
        <g key={c.lines[0]}>
          <Box x={20} y={c.y} w={240} h={56} lines={c.lines} fs={12} bold subTone="muted" />
          <Arrow x1={260} y1={c.y + 28} x2={298} y2={c.y + 28} />
        </g>
      ))}
      <Box x={300} y={30} w={230} h={236} />
      {sceneMethods.map((m) => (
        <Box
          key={m.lines[0]}
          x={316}
          y={m.y}
          w={198}
          h={m.h}
          lines={m.lines}
          fs={11}
          fill={m.lines.length > 1 ? 'box5' : 'bg'}
          subTone={m.lines.length > 1 ? 'danger' : undefined}
          mono={false}
        />
      ))}
      {sceneTables.map((t) => (
        <g key={t.name}>
          <Box x={590} y={t.y} w={170} h={34} lines={t.name} fs={12} fill="box4" mono />
          <Arrow x1={530} y1={t.y + 17} x2={588} y2={t.y + 17} dashed />
        </g>
      ))}
      <T x={300} y={286} fs={11} tone="danger">
        要望4で item_rows を変えた。倉庫と営業の両方がここを通る
      </T>
      <T x={20} y={320} fs={12} bold>
        11月の CSV
      </T>
      <Box x={20} y={334} w={240} h={46} lines={['経理の月次売上', '合計 16800']} fs={12} fill="bg" subTone="muted" />
      <Box x={280} y={334} w={230} h={46} lines={['倉庫の出荷リスト', 'セット商品を中身に分けた']} fs={12} fill="bg" subTone="muted" />
      <Box x={530} y={334} w={230} h={46} lines={['営業の商品別売上', '合計 9000。ギフトセットが消えた']} fs={12} fill="bg" subTone="danger" />
      <T x={20} y={404} fs={11} tone="muted">
        実線の矢印は呼び出し、破線の矢印はテーブルの参照。赤い文字は次の項で確かめる問題
      </T>
    </Svg>
  )
}

/* ---------- 図 74-2 帳票ごとに通る ReportBuilder の分岐 ---------- */
const branchRows: { line: number; cond: string; desc: string; cells: string[] }[] = [
  { line: 19, cond: '@total_row', desc: '合計の行を出す', cells: ['真', '偽', '真'] },
  { line: 26, cond: '@per_item || @group_by', desc: '明細から行を作る（偽なら1注文を1行）', cells: ['偽', '真', '真'] },
  { line: 27, cond: '@group_by', desc: '商品ごとに集計する', cells: ['偽', '偽', '真'] },
  { line: 28, cond: '@sort_by', desc: '並べ替える', cells: ['偽', '真', '真'] },
  { line: 29, cond: '@desc', desc: '逆の順にする', cells: ['偽', '偽', '真'] },
  { line: 42, cond: 'i.product.bundle_items.any?', desc: 'セット商品を中身に分ける（要望4）', cells: ['通らない', '真・偽', '真・偽'] },
]
const branchCols = [
  { x: 450, name: '経理' },
  { x: 556, name: '倉庫' },
  { x: 662, name: '営業' },
]

function BranchFigure() {
  return (
    <Svg
      id="74-2"
      w={780}
      h={376}
      label="Coverage で調べた、3つの帳票が ReportBuilder のどの分岐を通るか。19行の @total_row（合計の行）は経理と営業が真、倉庫が偽。26行の @per_item || @group_by（明細から行を作る）は倉庫と営業が真、経理が偽。27行の @group_by（商品ごとに集計）は営業だけが真。28行の @sort_by（並べ替え）は倉庫と営業が真。29行の @desc（逆の順）は営業だけが真。42行の bundle_items.any?（セット商品を中身に分ける）は経理は通らず、倉庫と営業が真と偽の両方を通る。営業がセット商品の分岐を通ることが問題。メソッドの中の26行のうち、経理は18行、倉庫は21行、営業は23行を通った。3つの帳票は、それぞれ違う組み合わせで分岐を通る"
    >
      <T x={20} y={28} fs={12} bold>
        分岐（ReportBuilder の行と条件）
      </T>
      {branchCols.map((c) => (
        <T key={c.name} x={c.x + 50} y={28} anchor="middle" fs={12} bold>
          {c.name}
        </T>
      ))}
      {branchRows.map((r, i) => {
        const y = 48 + i * 40
        return (
          <g key={r.line}>
            <Box x={20} y={y} w={420} h={34} lines={[`${r.line}行 ${r.cond}`, r.desc]} fs={11} fill="bg" subTone="muted" align="start" />
            {r.cells.map((v, j) => {
              const danger = r.line === 42 && j === 2
              return (
                <g key={branchCols[j].name}>
                  <rect
                    x={branchCols[j].x}
                    y={y}
                    width={100}
                    height={34}
                    rx={4}
                    fill={v === '偽' || v === '通らない' ? 'var(--fig-bg)' : 'var(--fig-box5)'}
                    stroke={danger ? 'var(--fig-danger)' : 'var(--fig-line)'}
                    strokeWidth={danger ? 2 : 1}
                  />
                  <T x={branchCols[j].x + 50} y={y + 17} anchor="middle" fs={12} tone={danger ? 'danger' : v === '通らない' ? 'muted' : undefined}>
                    {v}
                  </T>
                </g>
              )
            })}
          </g>
        )
      })}
      <Box x={20} y={300} w={420} h={34} lines="メソッドの中の 26 行のうち、通った行" fs={12} fill="bg" align="start" />
      {['18 行', '21 行', '23 行'].map((v, j) => (
        <Box key={branchCols[j].name} x={branchCols[j].x} y={300} w={100} h={34} lines={v} fs={12} fill="bg" />
      ))}
      <T x={20} y={358} fs={11} tone="muted">
        色の付いた欄は、真の枝を通ったもの（19〜29行は、その引数を指定したとき）。赤い枠は、営業が倉庫のための分岐を通っていること
      </T>
    </Svg>
  )
}

/* ---------- 図 74-3 誤った抽象化が育つ過程（Metz の手順と、この章の出来事） ---------- */
const growthRows: { metz: string; event: string[]; args: string; danger?: boolean }[] = [
  { metz: '1. A が重複を見つける', event: ['3つの帳票に、注文を CSV にする似たコード'], args: '' },
  { metz: '2. A が重複を取り出し、名前を付ける', event: ['ReportBuilder を作る（orders・columns）'], args: '2' },
  { metz: '3. A が重複を新しい抽象化に置き換える', event: ['3つの帳票が ReportBuilder を呼ぶ'], args: '2' },
  { metz: '4. 時間がたつ', event: [''], args: '' },
  { metz: '5. 今の抽象化がほぼ合う、新しい要件が来る', event: ['倉庫：明細ごとに、棚の順に並べたい'], args: '' },
  { metz: '6. B が引数を足し、その値で分岐する', event: ['per_item・sort_by を足す'], args: '4' },
  { metz: '7. 次の要件・引数・分岐をくり返す', event: ['group_by・desc・total_row を足す', 'セット商品の分岐を足す（引数は増えない）'], args: '7' },
  { metz: '8. あなたが登場する', event: ['営業の合計が経理と合わない理由を調べる'], args: '7', danger: true },
]

function GrowthFigure() {
  return (
    <Svg
      id="74-3"
      w={780}
      h={448}
      label="Sandi Metz の記事にある、誤った抽象化が育つ8つの手順と、この章の出来事の対応。1 A が重複を見つける：3つの帳票に注文を CSV にする似たコードがある。2 A が重複を取り出して名前を付ける：ReportBuilder を作り、引数は orders と columns の2個。3 A が重複を新しい抽象化に置き換える：3つの帳票が ReportBuilder を呼ぶ。4 時間がたつ。5 今の抽象化がほぼ合う新しい要件が来る：倉庫が明細ごとに棚の順に並べたいと頼む。6 B が引数を足し、その値で分岐する：per_item と sort_by を足し、引数は4個。7 次の要件・引数・分岐をくり返す：group_by・desc・total_row を足して引数は7個、セット商品の分岐も足すが引数は増えない。8 あなたが登場する：営業の合計が経理と合わない理由を調べる"
    >
      <T x={20} y={16} fs={12} bold>
        Metz の記事の手順
      </T>
      <T x={420} y={16} fs={12} bold>
        この章の ReportBuilder
      </T>
      <T x={742} y={16} anchor="middle" fs={12} bold>
        引数
      </T>
      {growthRows.map((r, i) => {
        const y = 30 + i * 48
        return (
          <g key={r.metz}>
            <Box x={20} y={y} w={370} h={40} lines={r.metz} fs={12} fill={i === 5 || i === 6 ? 'box5' : 'box'} align="start" />
            {r.event[0] && <Arrow x1={390} y1={y + 20} x2={418} y2={y + 20} dashed />}
            {r.event[0] && <Box x={420} y={y} w={290} h={40} lines={r.event} fs={11} fill="bg" align="start" />}
            {r.danger && <rect x={420} y={y} width={290} height={40} rx={6} fill="none" stroke="var(--fig-danger)" strokeWidth={2} />}
            <T x={742} y={y + 20} anchor="middle" fs={13} bold>
              {r.args}
            </T>
          </g>
        )
      })}
      <T x={20} y={430} fs={11} tone="muted">
        上から下へ時間が進む。左は Metz の記事の8つの手順を短くしたもの。色の付いた箱は、引数と分岐が増える手順
      </T>
    </Svg>
  )
}

/* ---------- 図 74-4 DRY・WET・AHA：いつまとめるか ---------- */
const wetCells = [
  { x: 190, w: 124, text: '書く', fill: 'bg' as const },
  { x: 320, w: 124, text: '写す（2回目まで）', fill: 'bg' as const },
  { x: 450, w: 124, text: 'まとめる', fill: 'box5' as const },
  { x: 580, w: 180, text: 'まとめた処理を使う', fill: 'bg' as const },
]

function WetAhaFigure() {
  return (
    <Svg
      id="74-4"
      w={780}
      h={384}
      label="同じ形のコードがある場所の数を横に、DRY・WET・AHA が何を問い、いつまとめるかを並べた図。DRY は同じ知識かを問い、1か所なら1か所に書き、同じ知識と分かれば場所の数によらず1か所にまとめる。WET は何回目かを問い、1回目は書き、2回目は写し、3回目でまとめ、4か所以上ではまとめた処理を使う。AHA は使い道と違いが分かったかを問い、回数では決めず、使い道と、違う所（引数にする所）が分かるまで写してよいとする。まとめた後に引数と分岐が増えたら、インライン化して戻す。この章の場面は3つの帳票がそろった時点でまとめたので WET の目安には合っていたが、使い道（会計・出荷・営業）が違った"
    >
      <T x={475} y={18} anchor="middle" fs={12} bold>
        同じ形のコードがある場所の数
      </T>
      {['1か所', '2か所', '3か所', '4か所以上'].map((label, i) => (
        <T key={label} x={i < 3 ? 252 + i * 130 : 670} y={42} anchor="middle" fs={12} tone="muted">
          {label}
        </T>
      ))}
      <Box x={20} y={60} w={160} h={64} lines={['DRY', '同じ知識か']} fs={12} bold subTone="muted" />
      <Box x={20} y={140} w={160} h={64} lines={['WET', '何回目か']} fs={12} bold subTone="muted" />
      <Box x={20} y={220} w={160} h={64} lines={['AHA', '使い道と違いが', '分かったか']} fs={12} bold fill="box5" subTone="muted" />
      <Box x={190} y={60} w={124} h={64} lines="1か所に書く" fs={12} fill="bg" />
      <Box x={320} y={60} w={440} h={64} lines={['同じ知識と分かれば、', '場所の数によらず1か所にまとめる']} fs={12} fill="bg" />
      {wetCells.map((c) => (
        <Box key={c.text} x={c.x} y={140} w={c.w} h={64} lines={c.text} fs={12} fill={c.fill} />
      ))}
      <Box x={190} y={220} w={570} h={64} lines={['回数では決めない', '使い道と、違う所（引数にする所）が分かるまで写してよい']} fs={12} fill="bg" bold subTone="muted" />
      <Box x={190} y={296} w={570} h={40} lines="まとめた後に引数と分岐が増えたら、インライン化して戻す（Metz の手順）" fs={12} fill="none" dashed />
      <T x={20} y={362} fs={12} tone="danger">
        この章の場面：3つの帳票がそろった時点でまとめた。WET の目安には合っていたが、使い道（会計・出荷・営業）が違った
      </T>
    </Svg>
  )
}

/* ---------- 図 74-5 誤った抽象化を戻す手順 ---------- */
const undoSteps: { lines: string[]; metz?: boolean; result?: string; ok?: boolean }[] = [
  { lines: ['手順1 3つの帳票の出力を spec で確かめる', '直す前は営業だけが失敗する'], result: '3 examples, 1 failure（営業）' },
  { lines: ['手順2 ReportBuilder の中身を3つの呼び出し側に写す', 'インライン化。渡していた引数の値を当てはめる'], metz: true },
  { lines: ['手順3 その帳票が通る分岐だけを残す', '通らない分岐は図 74-2 で確かめて消す'], metz: true, result: '3 examples, 1 failure（同じ失敗）' },
  { lines: ['手順4 通っていても、その帳票に要らない部分を消す', '営業のセット商品の分岐（倉庫の要望）を消す'], metz: true, result: '3 examples, 0 failures', ok: true },
  { lines: ['手順5 ReportBuilder を消す', '3つの帳票は、それぞれの行の作り方だけを持つ'] },
  { lines: ['手順6 3つを並べ、同じ知識だけを引数なしでまとめる', 'Order の scope・OrderItem#subtotal・ReportCsv'], result: '3 examples, 0 failures', ok: true },
]

function UndoFigure() {
  return (
    <Svg
      id="74-5"
      w={780}
      h={428}
      label="誤った抽象化を戻す6つの手順。手順1で3つの帳票の出力を spec で確かめ、直す前は営業だけが失敗する。手順2で ReportBuilder の中身を3つの呼び出し側に写し、渡していた引数の値を当てはめる。手順3でその帳票が通る分岐だけを残し、spec は同じ1件が失敗したまま。手順4で、通っていてもその帳票に要らない部分（営業のセット商品の分岐）を消し、spec はすべて通る。手順5で ReportBuilder を消す。手順6で3つを並べ、同じ知識だけを引数なしでまとめ（Order の scope、OrderItem#subtotal、ReportCsv）、spec はすべて通る。手順2から手順4が、Metz の記事にある3つの手順にあたる"
    >
      {undoSteps.map((s, i) => {
        const y = 20 + i * 62
        return (
          <g key={s.lines[0]}>
            <Box x={20} y={y} w={470} h={48} lines={s.lines} fs={12} fill={s.metz ? 'box5' : 'box'} bold subTone="muted" align="start" />
            {i < undoSteps.length - 1 && <Arrow x1={255} y1={y + 48} x2={255} y2={y + 60} />}
            {s.result && (
              <>
                <Arrow x1={490} y1={y + 24} x2={518} y2={y + 24} dashed />
                <T x={526} y={y + 24} fs={12} mono tone={s.ok ? 'acc' : 'danger'}>
                  {s.result}
                </T>
              </>
            )}
          </g>
        )
      })}
      <T x={20} y={396} fs={11} tone="muted">
        色の付いた箱は、Metz の記事にある3つの手順（インライン化する・通る部分を決める・要らない部分を消す）
      </T>
      <T x={20} y={414} fs={11} tone="muted">
        右の文字は、その手順の後に spec/reports を実行した結果
      </T>
    </Svg>
  )
}

/* ---------- 図 74-6 直す前と後：違いの置き場所と、依頼ごとに直すファイル ---------- */
const afterReports = [
  { y: 36, lines: ['MonthlySalesReport', '注文を1行ずつ・合計の行'] },
  { y: 96, lines: ['PickingList', '明細・セットを分ける・棚の順'] },
  { y: 156, lines: ['ProductSalesReport', '商品ごと・金額の多い順'] },
]
const afterShared = [
  { y: 30, h: 60, lines: ['Order の scope', 'counted_as_sales', 'ordered_in・to_ship_on'] },
  { y: 102, h: 34, lines: ['OrderItem#subtotal'] },
  { y: 148, h: 48, lines: ['ReportCsv.generate', '(headers, rows)'] },
]
const changeRows = [
  { y: 280, label: '倉庫：セット商品を中身に分ける', before: ['report_builder.rb を直す', '倉庫と営業の出力が変わる（営業は意図しない変更）'], after: ['picking_list.rb を直す', '倉庫の出力だけが変わる'] },
  { y: 358, label: '売上に数える状態に、配達済みを足す', before: ['経理と営業の where を2か所直す', '片方を忘れると、経理と営業の合計が合わない'], after: ['Order.counted_as_sales の1行を直す', '経理と営業がそろって変わる'] },
]

function CompareFigure() {
  return (
    <Svg
      id="74-6"
      w={780}
      h={448}
      label="直す前は、MonthlySalesReport・PickingList・ProductSalesReport の3つが ReportBuilder を呼び、帳票の違いは ReportBuilder の7個の引数と6か所の分岐にある。直した後は、3つの帳票がそれぞれ行の作り方（注文を1行ずつと合計の行、明細とセットの分解と棚の順、商品ごとと金額の多い順）を持ち、同じ知識だけを Order の scope（counted_as_sales・ordered_in・to_ship_on）、OrderItem#subtotal、ReportCsv.generate(headers, rows) にまとめて呼ぶ。倉庫の「セット商品を中身に分ける」という依頼では、直す前は report_builder.rb を直して倉庫と営業の出力が変わり、営業の変化は意図しないもの。直した後は picking_list.rb を直し、倉庫の出力だけが変わる。売上に数える状態に配達済みを足す依頼では、直す前は経理と営業の where を2か所直し、片方を忘れると合計が合わない。直した後は Order.counted_as_sales の1行を直し、経理と営業がそろって変わる"
    >
      <T x={10} y={14} bold>
        直す前
      </T>
      <T x={400} y={14} bold>
        直した後
      </T>
      <line x1={390} y1={6} x2={390} y2={232} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {['MonthlySalesReport', 'PickingList', 'ProductSalesReport'].map((name, i) => (
        <g key={name}>
          <Box x={14} y={40 + i * 56} w={176} h={40} lines={name} fs={11} bold />
          <Arrow x1={190} y1={60 + i * 56} x2={226} y2={96 + i * 20} />
        </g>
      ))}
      <Box x={228} y={60} w={150} h={112} lines={['ReportBuilder', '引数 7 個', '分岐 6 か所', '行の作り方 2 通り']} fs={12} fill="box5" bold subTone="muted" />
      <T x={14} y={214} fs={12} tone="danger">
        帳票の違いが、1つのクラスの引数と分岐にある
      </T>
      {afterReports.map((r) => (
        <g key={r.lines[0]}>
          <Box x={400} y={r.y} w={176} h={50} lines={r.lines} fs={11} bold subTone="muted" />
          <line x1={576} y1={r.y + 25} x2={590} y2={r.y + 25} stroke="var(--fig-line)" strokeWidth={1.5} />
        </g>
      ))}
      <line x1={590} y1={61} x2={590} y2={181} stroke="var(--fig-line)" strokeWidth={1.5} />
      {afterShared.map((s) => (
        <g key={s.lines[0]}>
          <Arrow x1={590} y1={s.y + s.h / 2} x2={610} y2={s.y + s.h / 2} />
          <Box x={612} y={s.y} w={158} h={s.h} lines={s.lines} fs={11} fill="box5" bold subTone="muted" />
        </g>
      ))}
      <T x={400} y={214} fs={12} tone="acc">
        違いは帳票ごとに書き、同じ知識は名前を付けて1か所に
      </T>
      <line x1={10} y1={238} x2={770} y2={238} stroke="var(--fig-line)" />
      <T x={10} y={258} bold>
        依頼ごとに、直すファイルと出力が変わる帳票
      </T>
      {changeRows.map((r) => (
        <g key={r.label}>
          <T x={14} y={r.y} fs={12}>
            {r.label}
          </T>
          <Box x={14} y={r.y + 10} w={366} h={44} lines={r.before} fs={12} fill="bg" subTone="danger" />
          <Box x={400} y={r.y + 10} w={370} h={44} lines={r.after} fs={12} fill="bg" subTone="acc" />
        </g>
      ))}
      <T x={10} y={436} fs={11} tone="muted">
        上段の矢印は呼び出し。下段の2つ目の依頼は「当てはめすぎたとき」の節で動かす
      </T>
    </Svg>
  )
}

/* ---------- 図 74-7 まとめるか、待つか、戻すか ---------- */
const judgeCells = [
  { x: 165, y: 30, fill: 'box5' as const, lines: ['まとめる', '業務の言葉で名前を付ける', '例：Order.counted_as_sales、', 'OrderItem#subtotal、ReportCsv'] },
  { x: 465, y: 30, fill: 'box' as const, lines: ['同じ部分だけを引数なしで切り出す', '違う所は呼び出し側に残す', '例：売上に数える注文は scope に、', '列と並べ方は各帳票に'] },
  { x: 165, y: 180, fill: 'box' as const, lines: ['写したまま待つ', '似ている場所をコメントに書き、', '両方にテストを置く', '例：要望4の前の、倉庫と営業の明細の行'] },
  { x: 465, y: 180, fill: 'box' as const, lines: ['まとめない', 'まとめてあれば、', 'インライン化して戻す', '例：ReportBuilder'] },
]

function JudgeFigure() {
  return (
    <Svg
      id="74-7"
      w={780}
      h={428}
      label="2つの軸で、まとめるか待つか戻すかを分けた図。縦の軸は、変わる理由が同じと分かっているか。横の軸は、まとめたときに呼び出し側ごとの引数や分岐が要るか。分かっていて引数や分岐が要らないなら、まとめて業務の言葉で名前を付ける（例は Order.counted_as_sales、OrderItem#subtotal、ReportCsv）。分かっていて引数や分岐が要るなら、同じ部分だけを引数なしで切り出し、違う所は呼び出し側に残す（例は、売上に数える注文は scope に、列と並べ方は各帳票に）。まだ分からず引数や分岐が要らないなら、写したまま待ち、似ている場所をコメントに書いて両方にテストを置く（例は要望4の前の、倉庫と営業の明細の行）。まだ分からず引数や分岐が要るなら、まとめない。まとめてあればインライン化して戻す（例は ReportBuilder）。縦の軸を先に判断する"
    >
      <Arrow x1={150} y1={330} x2={770} y2={330} />
      <Arrow x1={150} y1={330} x2={150} y2={14} />
      <T x={20} y={22} fs={12}>
        変わる理由が
      </T>
      <T x={20} y={40} fs={12}>
        同じと分かって
      </T>
      <T x={20} y={58} fs={12}>
        いるか
      </T>
      <T x={140} y={100} anchor="end" fs={12} tone="muted">
        分かっている
      </T>
      <T x={140} y={250} anchor="end" fs={12} tone="muted">
        まだ分からない
      </T>
      <T x={310} y={348} anchor="middle" fs={12} tone="muted">
        要らない
      </T>
      <T x={610} y={348} anchor="middle" fs={12} tone="muted">
        要る
      </T>
      <T x={770} y={370} anchor="end" fs={12}>
        まとめたときに、呼び出し側ごとの引数や分岐が要るか →
      </T>
      {judgeCells.map((c) => (
        <Box key={c.lines[0]} x={c.x} y={c.y} w={290} h={140} lines={c.lines} fs={12} fill={c.fill} bold subTone="muted" />
      ))}
      <T x={20} y={398} fs={11} tone="muted">
        縦の軸を先に判断する。分岐をいくつか足して様子を見るのはよいが、
      </T>
      <T x={20} y={416} fs={11} tone="muted">
        誤った抽象化と分かったら、早く手放すほうが苦労が少ない（Metz）
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 76,
  part: 8,
  title: 'AHA（拙速な抽象化を避ける）：3つの帳票を1つの ReportBuilder に押し込まない',
  summary:
    '経理・倉庫・営業の3つの帳票を1つの ReportBuilder にまとめた後、要望のたびに引数と分岐が増え、倉庫のための変更で営業の売上の合計が変わった場面から始めます。Kent C. Dodds の記事と Sandi Metz の「The Wrong Abstraction」で AHA の意味と WET との違いを確かめ、Metz の手順で ReportBuilder を3つの帳票に戻してから、同じ知識だけを引数のない scope と CSV の部品にまとめ直します。最後に、同じ知識まで写したままにしたときの食い違いを動かして確かめます。',
  goals: [
    '共通の処理に呼び出し側ごとの引数と分岐が増えると、1つの呼び出し側のための変更が別の呼び出し側の出力を変える理由を説明できる',
    'Dodds の「AHA Programming」と Metz の「The Wrong Abstraction」にある AHA の考え方と、誤った抽象化が育つ過程を説明できる',
    'WET が回数で、AHA が使い道と違いが分かったかで、まとめる時期を決めることを説明できる',
    'Metz の手順（インライン化し、通る部分を決め、要らない部分を消す）で誤った抽象化を戻し、同じ知識だけを引数なしでまとめ直せる',
    '同じ知識と分かっている重複は待たずにまとめる、という判断を、重複を残す判断と区別できる',
    'Active Record の scope と merge で、帳票ごとのクエリを名前の付いた部品の組み合わせとして書ける',
  ],
  prerequisites: [59, 60],
  sections: [
    {
      id: 'scene',
      title: '3つの帳票が共通の ReportBuilder を通り、倉庫の要望で営業の売上が変わる',
      body: (
        <>
          <p>
            この章では3つの帳票を1つのクラスで作るようにまとめたコードを例に、<Term en="Avoid Hasty Abstractions">AHA</Term>を扱います。AHA は Avoid Hasty Abstractions の略で、拙速な抽象化を避ける、という考え方です。まず、まとめたクラスに要望ごとの引数と分岐が増え、1つの帳票のための変更が別の帳票の出力を変えるところを動かして確かめます。
          </p>
          <h3>そもそも抽象化とは何か</h3>
          <p>
            この章では複数の場所にある似たコードから共通する部分を取り出し、1つのメソッドやクラスにして名前を付けることを<Term en="abstraction">抽象化</Term>と呼びます。たとえば、3つのクラスがそれぞれ「注文を読み、見出しの行を書き、注文を1件ずつ CSV の行にする」コードを持っているとします。この手順を ReportBuilder というクラスに移し、3つのクラスからは <code>ReportBuilder.new(…).to_csv</code> と呼ぶようにするのが抽象化です。
          </p>
          <p>
            抽象化すると、共通の手順を直すときに1か所を直せば済みます。一方で、呼び出し側ごとの違いを抽象化の側で引数と分岐として扱うようになると、1つの呼び出し側のために変えたコードを、ほかの呼び出し側も通ります。この章で確かめるのは、この2つ目の状態です。
          </p>
          <h3>そもそも何をする業務か</h3>
          <p>
            コーヒー豆と器具を売る通販サイトを考えます。管理画面から、業務のデータを決まった形式で一覧にした<Term en="report">帳票</Term>を CSV でダウンロードできます。帳票は次の3つで、使う部署と使い道が違います。
          </p>
          <ul>
            <li>経理の月次売上：翌月の初めに、前の月の売上を会計ソフトに取り込む。1つの注文を1行にし、最後に合計の行を置く</li>
            <li>
              倉庫の出荷リスト：出荷日の朝に印刷し、担当者が棚を回って出荷する商品を集める。この作業を<Term en="picking">ピッキング</Term>と呼びます。注文の明細を1行ずつ、棚の番号の順に並べる
            </li>
            <li>営業の商品別売上：月ごとに、どの商品がいくら売れたかを金額の多い順に見て、仕入れと販売の計画に使う</li>
          </ul>
          <p>
            商品には、コーヒー豆とマグカップを1つずつ箱に詰めたギフトセットがあります。ギフトセットは棚に置かず、出荷するときに中身を棚から集めて箱に詰めます。売上では、ギフトセットはギフトセットとして数えます。営業は、セットがいくつ売れたかを見て、次の仕入れを決めるからです。
          </p>
          <p>
            CSV の先頭には<Term en="byte order mark">BOM</Term>を付けています。BOM は文字列の先頭に置く印で、UTF-8 では3バイトです。このサイトでは、担当者が Excel で開いたときに文字化けしないように付けています。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261122000001_create_shop_tables.rb"
            code={`
class CreateShopTables < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.integer :price, null: false # 税込みの単価（円）
      t.string :location # 倉庫の棚番号。セット商品は棚に置かないので nil
    end
    create_table :bundle_items do |t| # セット商品の中身
      t.references :bundle, null: false, foreign_key: { to_table: :products }
      t.references :component, null: false, foreign_key: { to_table: :products }
      t.integer :quantity, null: false
    end
    create_table :orders do |t|
      t.string :number, null: false, index: { unique: true }
      t.string :customer_name, null: false
      t.date :ordered_on, null: false
      t.date :ship_on # 出荷する予定の日
      t.string :status, null: false # paid（入金済み）・shipped（出荷済み）・canceled（取り消し）
    end
    create_table :order_items do |t|
      t.references :order, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.integer :quantity, null: false
      t.integer :unit_price, null: false # 注文した時点の単価
    end
  end
end
`}
          />
          <p>
            モデルは関連だけを持ちます。Product は <code>has_many :bundle_items, foreign_key: :bundle_id</code> で、セット商品なら中身の商品を持ちます。動かすデータは2026年11月の4件の注文です（script/data.rb の <code>seed_shop</code> で作り直します）。1001 は青木さんのコーヒー豆2個（出荷済み）、1002 は井上さんのギフトセット2個とドリップバッグ1個、1003 は上田さんのマグカップ1個とコーヒー豆1個で、どちらも入金済みで11月30日に出荷します。1004 は取り消した注文です。
          </p>
          <h3>ReportBuilder ができるまで</h3>
          <p>
            最初は3つの帳票とも、1つの注文を1行にした一覧でした。3つのクラスには注文を読み、行を作り、CSV にする十数行のコードが似た形で書かれていました。開発者は同じ形のコードが3つあることに気づき、ReportBuilder にまとめました。そのときのコードと、3つの呼び出し方です。
          </p>
          <Code
            lang="ruby"
            title="script/history/report_builder_v1.rb（共通化した時点の ReportBuilder）"
            code={`
require "csv"

# 共通化した時点の ReportBuilder。3つの帳票は、どれも注文を1行ずつ並べていた
class ReportBuilder
  def initialize(orders, columns:)
    @orders = orders
    @columns = columns # { "見出し" => 行のキー }
  end

  def to_csv
    CSV.generate("\\uFEFF") do |csv| # Excel で開いたときに文字化けしないように BOM を付ける
      csv << @columns.keys
      rows.each { |row| csv << @columns.values.map { |key| row[key] } }
    end
  end

  private

  def rows
    @orders.includes(:order_items).map do |o|
      { number: o.number, ordered_on: o.ordered_on, ship_on: o.ship_on, customer: o.customer_name,
        amount: o.order_items.sum { |i| i.unit_price * i.quantity } }
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="script/v1.rb"
            code={`
# 共通化した時点の ReportBuilder と、そのときの3つの呼び出し（どれも1注文を1行にする）
require_relative "data"
load File.expand_path("history/report_builder_v1.rb", __dir__)
seed_shop
month = Date.new(2026, 11, 1).all_month

sales = ReportBuilder.new(Order.where(status: %w[paid shipped], ordered_on: month).order(:ordered_on, :number),
                          columns: { "注文番号" => :number, "注文日" => :ordered_on, "お客様" => :customer, "金額" => :amount })
picking = ReportBuilder.new(Order.where(status: "paid", ship_on: Date.new(2026, 11, 30)).order(:number),
                            columns: { "注文番号" => :number, "お客様" => :customer, "出荷日" => :ship_on })
product = ReportBuilder.new(Order.where(status: %w[paid shipped], ordered_on: month).order(:number),
                            columns: { "注文番号" => :number, "お客様" => :customer, "金額" => :amount })
{ "経理" => sales, "倉庫" => picking, "営業" => product }.each do |name, builder|
  puts "--- #{name}", builder.to_csv.delete_prefix("\\uFEFF")
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/v1.rb）"
            code={`
--- 経理
注文番号,注文日,お客様,金額
1001,2026-11-05,青木,3600
1002,2026-11-18,井上,9000
1003,2026-11-20,上田,4200
--- 倉庫
注文番号,お客様,出荷日
1002,井上,2026-11-30
1003,上田,2026-11-30
--- 営業
注文番号,お客様,金額
1001,青木,3600
1002,井上,9000
1003,上田,4200
`}
          />
          <p>
            3つの呼び出し側の違いは注文の絞り込みと列（<code>columns</code>）だけでした。ReportBuilder は2つの引数で3つの帳票を作れていて、重複のない、よい共通化に見えます。その後、次の要望が順に来ました。
          </p>
          <ol>
            <li>倉庫：注文の明細を1行ずつ、棚の順に並べてほしい。開発者は <code>per_item</code>（明細ごとに1行）と <code>sort_by</code>（並べ替えのキー）を足しました</li>
            <li>
              営業：商品ごとに集計し、金額の多い順に並べてほしい。<code>group_by</code> と <code>desc</code> を足しました。<code>group_by</code> を渡すと、ReportBuilder は明細の行を作ってから集計します
            </li>
            <li>経理と営業：最後に合計の行がほしい。<code>total_row</code> を足しました</li>
            <li>
              倉庫：セット商品は中身の商品に分けて出してほしい。セット商品には棚の番号がないので、出荷リストの棚の欄が空になっていました。開発者は引数を足さず、明細の行を作る <code>item_rows</code> を書き換えました。<code>per_item</code> を渡しているのは出荷リストだけなので、ほかの帳票には関係しないと考えたからです
            </li>
          </ol>
          <h3>今の ReportBuilder と3つの呼び出し側</h3>
          <Code
            lang="ruby"
            title="app/reports/report_builder.rb（直す前。図 74-2 の行番号はこのファイルの行）"
            code={`
require "csv"

# 3つの帳票（経理の月次売上・倉庫の出荷リスト・営業の商品別売上）が使う、共通の CSV の作成
class ReportBuilder
  def initialize(orders, columns:, per_item: false, group_by: nil, sort_by: nil, desc: false, total_row: false)
    @orders = orders
    @columns = columns # { "見出し" => 行のキー }
    @per_item = per_item
    @group_by = group_by
    @sort_by = sort_by
    @desc = desc
    @total_row = total_row
  end

  def to_csv
    CSV.generate("\\uFEFF") do |csv| # Excel で開いたときに文字化けしないように BOM を付ける
      csv << @columns.keys
      rows.each { |row| csv << @columns.values.map { |key| row[key] } }
      csv << ["合計", *Array.new(@columns.size - 2), rows.sum { |row| row[:amount] }] if @total_row
    end
  end

  private

  def rows
    list = @per_item || @group_by ? item_rows : order_rows
    list = grouped(list) if @group_by
    list = list.sort_by { |row| [row[@sort_by], row[:number].to_s] } if @sort_by
    @desc ? list.reverse : list
  end

  def order_rows
    @orders.includes(:order_items).map do |o|
      { number: o.number, ordered_on: o.ordered_on, customer: o.customer_name,
        amount: o.order_items.sum { |i| i.unit_price * i.quantity } }
    end
  end

  def item_rows
    @orders.includes(order_items: { product: { bundle_items: :component } }).flat_map do |o|
      o.order_items.flat_map do |i|
        if i.product.bundle_items.any? # 要望4（倉庫）：セット商品は中身の商品に分ける
          i.product.bundle_items.map do |b|
            { number: o.number, product: b.component.name, location: b.component.location,
              quantity: i.quantity * b.quantity, amount: 0 } # 倉庫では金額を使わない
          end
        else
          [{ number: o.number, product: i.product.name, location: i.product.location,
             quantity: i.quantity, amount: i.unit_price * i.quantity }]
        end
      end
    end
  end

  def grouped(list)
    list.group_by { |row| row[@group_by] }.map do |key, group|
      { @group_by => key, quantity: group.sum { |r| r[:quantity] }, amount: group.sum { |r| r[:amount] } }
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/reports/monthly_sales_report.rb・picking_list.rb・product_sales_report.rb（直す前）"
            code={`
# 経理：月次の売上 CSV。翌月の初めに会計ソフトに取り込む
class MonthlySalesReport
  def self.csv(month)
    orders = Order.where(status: %w[paid shipped], ordered_on: month.all_month).order(:ordered_on, :number)
    ReportBuilder.new(orders, columns: { "注文番号" => :number, "注文日" => :ordered_on, "お客様" => :customer, "金額" => :amount },
                              total_row: true).to_csv
  end
end

# 倉庫：出荷リスト。出荷日の朝に印刷し、棚の順に商品を集める
class PickingList
  def self.csv(date)
    orders = Order.where(status: "paid", ship_on: date)
    ReportBuilder.new(orders, columns: { "棚" => :location, "商品" => :product, "数量" => :quantity, "注文番号" => :number },
                              per_item: true, sort_by: :location).to_csv
  end
end

# 営業：商品別の売上。月ごとに、売れた商品を金額の多い順に並べる
class ProductSalesReport
  def self.csv(month)
    orders = Order.where(status: %w[paid shipped], ordered_on: month.all_month)
    ReportBuilder.new(orders, columns: { "商品" => :product, "数量" => :quantity, "金額" => :amount },
                              group_by: :product, sort_by: :amount, desc: true, total_row: true).to_csv
  end
end
`}
          />
          <Figure n="74-1" title="場面の構成：3つの帳票と ReportBuilder" caption="赤い文字は、次の項で確かめる問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 74-1 のとおり、3つの帳票は ReportBuilder に引数を渡すだけで、行の作り方はすべて ReportBuilder の中にあります。帳票ごとの違いは7個の引数と、<code>rows</code> の中の分岐で表しています。<code>item_rows</code> は出荷リストのためにセット商品を分けるように変えましたが、営業の ProductSalesReport も <code>group_by</code> を渡しているので、同じ <code>item_rows</code> を通ります。
          </p>
          <h3>動かして確かめる</h3>
          <p>11月のデータで3つの帳票を作り、CSV を表示しました。</p>
          <Code
            lang="ruby"
            title="script/scene.rb"
            code={`
# 3つの帳票を2026年11月のデータで作り、CSV を表示する（先頭の BOM は表示から除く）
require_relative "data"
seed_shop
month = Date.new(2026, 11, 1)
{ "経理：月次の売上（11月）" => MonthlySalesReport.csv(month),
  "倉庫：出荷リスト（11月30日）" => PickingList.csv(Date.new(2026, 11, 30)),
  "営業：商品別の売上（11月）" => ProductSalesReport.csv(month) }.each do |title, csv|
  puts "--- #{title}", csv.delete_prefix("\\uFEFF")
end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scene.rb）"
            code={`
--- 経理：月次の売上（11月）
注文番号,注文日,お客様,金額
1001,2026-11-05,青木,3600
1002,2026-11-18,井上,9000
1003,2026-11-20,上田,4200
合計,,,16800
--- 倉庫：出荷リスト（11月30日）
棚,商品,数量,注文番号
A-01,コーヒー豆,2,1002
A-01,コーヒー豆,1,1003
A-02,ドリップバッグ,1,1002
B-01,マグカップ,2,1002
B-01,マグカップ,1,1003
--- 営業：商品別の売上（11月）
商品,数量,金額
コーヒー豆,5,5400
マグカップ,3,2400
ドリップバッグ,1,1200
合計,,9000
`}
          />
          <p>
            出荷リストは井上さんのギフトセット2個をコーヒー豆2個とマグカップ2個に分け、棚の順に並べています。倉庫の要望どおりです。一方で、営業の商品別売上からはギフトセットの行が消え、コーヒー豆が5個、マグカップが3個になりました。合計は9000円で、同じ月の経理の16800円と合いません。セット商品の中身の行は <code>amount: 0</code> なので、ギフトセット2個の7800円が営業の集計から抜けています。
          </p>
          <p>要望4を入れる前の <code>item_rows</code> に戻した ReportBuilder と、今の ReportBuilder で、営業の CSV を比べました。</p>
          <Code
            lang="ruby"
            title="script/request4.rb（script/history/item_rows_before_request4.rb は、要望4の前の item_rows を定義し直すファイル）"
            code={`
# 要望4の前と後の ReportBuilder で、営業の商品別売上を作り、tmp に書き出す
require_relative "data"
seed_shop
month = Date.new(2026, 11, 1)
File.write("tmp/product_sales_after.csv", ProductSalesReport.csv(month).delete_prefix("\\uFEFF"))
load File.expand_path("history/item_rows_before_request4.rb", __dir__) # 要望4の前の item_rows に戻す
File.write("tmp/product_sales_before.csv", ProductSalesReport.csv(month).delete_prefix("\\uFEFF"))
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/request4.rb の後に diff -u tmp/product_sales_before.csv tmp/product_sales_after.csv）"
            code={`
@@ -1,6 +1,5 @@
 商品,数量,金額
-ギフトセット,2,7800
-コーヒー豆,3,5400
-マグカップ,1,2400
+コーヒー豆,5,5400
+マグカップ,3,2400
 ドリップバッグ,1,1200
-合計,,16800
+合計,,9000
`}
          />
          <p>
            倉庫のための変更で、営業の CSV が変わったことが分かります。倉庫の担当の開発者は出荷リストの spec を足して通ることを確かめましたが、営業の帳票の spec にはセット商品の注文がありませんでした。3つの帳票の出力を、同じ11月のデータで丸ごと確かめる spec を書き、直す前のコードで実行しました。
          </p>
          <Code
            lang="ruby"
            title="spec/reports/reports_spec.rb"
            code={`
require "rails_helper"
require Rails.root.join("script/data")

# 3つの帳票の CSV を、2026年11月のデータで丸ごと確かめる
RSpec.describe "帳票" do
  before { seed_shop }
  let(:month) { Date.new(2026, 11, 1) }
  def lines(csv) = csv.delete_prefix("\\uFEFF").lines(chomp: true)

  it "経理：入金済みと出荷済みの注文を1行ずつ並べ、最後に合計を出す" do
    expect(lines(MonthlySalesReport.csv(month))).to eq [
      "注文番号,注文日,お客様,金額", "1001,2026-11-05,青木,3600", "1002,2026-11-18,井上,9000",
      "1003,2026-11-20,上田,4200", "合計,,,16800"
    ]
  end

  it "倉庫：セット商品を中身に分け、棚の順に並べる" do
    expect(lines(PickingList.csv(Date.new(2026, 11, 30)))).to eq [
      "棚,商品,数量,注文番号", "A-01,コーヒー豆,2,1002", "A-01,コーヒー豆,1,1003",
      "A-02,ドリップバッグ,1,1002", "B-01,マグカップ,2,1002", "B-01,マグカップ,1,1003"
    ]
  end

  it "営業：セット商品はセットのまま数え、合計は経理と同じになる" do
    expect(lines(ProductSalesReport.csv(month))).to eq [
      "商品,数量,金額", "ギフトセット,2,7800", "コーヒー豆,3,5400", "マグカップ,1,2400",
      "ドリップバッグ,1,1200", "合計,,16800"
    ]
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（直す前のコードで bundle exec rspec spec/reports）"
            code={`
..F

Failures:

  1) 帳票 営業：セット商品はセットのまま数え、合計は経理と同じになる
     Failure/Error:
       …（省略）

       expected: ["商品,数量,金額", "ギフトセット,2,7800", "コーヒー豆,3,5400", "マグカップ,1,2400", "ドリップバッグ,1,1200", "合計,,16800"]
            got: ["商品,数量,金額", "コーヒー豆,5,5400", "マグカップ,3,2400", "ドリップバッグ,1,1200", "合計,,9000"]

       (compared using ==)
     # ./spec/reports/reports_spec.rb:25:in 'block (2 levels) in <top (required)>'

3 examples, 1 failure
`}
          />
          <h3>帳票ごとに通る分岐を調べる</h3>
          <p>
            どの帳票が ReportBuilder のどこを通っているかは、呼び出し側の引数を読んでも分かりにくいので、実行して数えました。プログラムのどの部分がテストや実行で通ったかを数えたものを<Term en="coverage">カバレッジ</Term>と呼びます。Ruby の標準ライブラリの Coverage は、どの行と、if や三項演算子のどちらの枝が何回実行されたかを数えます<Ref n={3} />。<code>Coverage.start(lines: true, branches: true)</code> で数え始め、<code>Coverage.result(stop: false, clear: true)</code> で、それまでの数を取り出して0に戻します<Ref n={3} />。帳票を1つ作るたびに数を取り出せば、帳票ごとの結果になります。
          </p>
          <Code
            lang="ruby"
            title="script/coverage.rb"
            code={`
# 3つの帳票が、ReportBuilder のどの分岐を通るかを Coverage で調べる
require "coverage"
require_relative "data"
file = Rails.root.join("app/reports/report_builder.rb").to_s
Coverage.start(lines: true, branches: true)
ReportBuilder # ここで読み込む
body = Coverage.result(stop: false, clear: true)[file][:lines].count(0) # 読み込みでは通らない、メソッドの中の行

seed_shop
month = Date.new(2026, 11, 1)
runs = { "経理" => -> { MonthlySalesReport.csv(month) },
         "倉庫" => -> { PickingList.csv(Date.new(2026, 11, 30)) },
         "営業" => -> { ProductSalesReport.csv(month) } }
results = runs.transform_values do |run|
  run.call
  Coverage.result(stop: false, clear: true)[file]
end

src = File.readlines(file)
results["経理"][:branches].each do |(_, _, line, *), arms|
  code = src[line - 1].sub(/\\s*#.*/, "").strip
  condition = code[/(?:if|unless) (.+)\\z/, 1] || code[/(?:\\A|= )([^=?]+?) \\?/, 1]
  names = arms.keys.map do |arm|
    runs.keys.select { |name| results[name][:branches].find { |(_, _, l, *), _| l == line }.last[arm] > 0 }.join("・")
  end
  puts "#{line}行 #{condition}", "  真のとき：#{names[0].presence || "なし"}　偽のとき：#{names[1].presence || "なし"}"
end
results.each { |name, r| puts "#{name}が通った行：メソッドの中の #{body} 行のうち #{r[:lines].count { |c| c.to_i > 0 }} 行" }
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/coverage.rb）"
            code={`
19行 @total_row
  真のとき：経理・営業　偽のとき：倉庫
26行 @per_item || @group_by
  真のとき：倉庫・営業　偽のとき：経理
27行 @group_by
  真のとき：営業　偽のとき：経理・倉庫
28行 @sort_by
  真のとき：倉庫・営業　偽のとき：経理
29行 @desc
  真のとき：営業　偽のとき：経理・倉庫
42行 i.product.bundle_items.any?
  真のとき：倉庫・営業　偽のとき：倉庫・営業
経理が通った行：メソッドの中の 26 行のうち 18 行
倉庫が通った行：メソッドの中の 26 行のうち 21 行
営業が通った行：メソッドの中の 26 行のうち 23 行
`}
          />
          <Figure n="74-2" title="帳票ごとに通る ReportBuilder の分岐" caption="script/coverage.rb の実行結果を表にした。行番号は直す前の report_builder.rb の行。">
            <BranchFigure />
          </Figure>
          <p>
            図 74-2 を横に読むと、6か所の分岐のどれについても、3つの帳票の通り方がそろっていないことが分かります。縦に読むと、3つの帳票は分岐をそれぞれ違う組み合わせで通っています。指定するかしないかで動きが変わる5つの引数（<code>per_item</code>・<code>group_by</code>・<code>sort_by</code>・<code>desc</code>・<code>total_row</code>）の組み合わせは32通りありますが、使っているのはこの3通りだけです。そして42行目のセット商品の分岐は、出荷リストのために足したものなのに、営業も真と偽の両方の枝を通っています。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>
              倉庫の要望で <code>item_rows</code> を変えたら、営業の出力が変わりました。ProductSalesReport は <code>per_item</code> を渡していないので、呼び出し側の引数を読むだけでは、<code>item_rows</code> を通ることが分かりません。
            </li>
            <li>
              ReportBuilder を変える人は、32通りの組み合わせのうちどれが使われているかを、3つの呼び出し側を読んで調べることになります。図 74-2 のように実行して数えないと、変更がどの帳票に届くかを確かめられません。
            </li>
            <li>
              セット商品の中身の行の <code>amount: 0</code> は「倉庫では金額を使わない」という1つの帳票の都合で書いた値ですが、営業の集計にそのまま入りました。
            </li>
            <li>
              3つの帳票は、変わる理由が違います。経理は会計ソフトへの取り込み、倉庫はピッキングの作業、営業は販売の計画の都合で変わります。ReportBuilder はこの3つのどの理由でも変わります。
            </li>
          </ul>
          <p>
            ReportBuilder は同じ形のコードが3つそろってからまとめたものでした。それでも、後から来た要望で、引数と分岐を増やす形に変わりました。次の節ではこのような状態を避けるための AHA という考え方と、できてしまった誤った抽象化を戻す手順を説明します。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'AHA の意味と由来：誤った抽象化より重複を選ぶ',
      body: (
        <>
          <h3>AHA の定義</h3>
          <p>
            AHA（拙速な抽象化を避ける）は似たコードを急いで1つにまとめず、不適切な共通化よりもはっきりした重複を許す考え方です。似たコードの使い道と、呼び出し側ごとに違う所（引数にする所）が分かってから抽象化する、という順序を勧めます。
          </p>
          <p>
            この章では呼び出し側ごとの引数と分岐を持つようになり、1つの呼び出し側のための変更がほかの呼び出し側にも届く共通の処理を、<Term en="wrong abstraction">誤った抽象化</Term>と呼びます。前の節の ReportBuilder がその例です。
          </p>
          <h3>Kent C. Dodds の「AHA Programming」（2020年）</h3>
          <p>
            AHA という名前は、Kent C. Dodds が2020年6月22日に公開した記事「AHA Programming」で説明されています。Dodds はこの頭字語を Cher Scarlett から聞いたと書き、Avoid Hasty Abstractions の略で、何かを発見したときの「Aha!」と同じように読むと説明しています<Ref n={1} />。Cher Scarlett がこの言葉を最初にどこで使ったかは、ここでは確かめられませんでした。本書では確かめられた最も早い資料としてこの記事を挙げます。
          </p>
          <p>
            記事は DRY と WET の両方に触れています。Dodds は DRY にはおおむね従っていて、重複の多いコードを引き継いだときに、同じ不具合を8か所で直したことがあると書いています<Ref n={1} />。一方で、Write Everything Twice の略としての WET は、DRY と同じように教条的で、決めすぎていると評しています。同じコードには重複よりも害の大きい行き過ぎた抽象化もありました。その処理は3か所よりずっと多くの場所で使われていましたが、抽象化の出来が悪く、重複のままのほうがよかったと書いています<Ref n={1} />。使われている場所の数が多くても、その抽象化が正しいとは限らない、という例です。
          </p>
          <p>
            Dodds は AHA を、Sandi Metz の「誤った抽象化より重複を選ぶ（prefer duplication over the wrong abstraction）」という言葉で説明し、もう1つの原則として「まず変更に備える（Optimize for change first）」を加えています。コードの将来はわからず、確かなのは変わるだろうということだけだ、という理由です<Ref n={1} />。そのうえで、重複したコードの使い道が分かったとかなりの自信を持てるまでは、重複を受け入れてよいと書いています。コードのどの部分が違っていて、どれを関数の引数にするとよいかは、そのコードが動く場所がいくつかできてから見えてくるからです<Ref n={1} />。
          </p>
          <p>
            早く抽象化した場合については、その関数が自分の使い道に合っていると考え、新しい使い道のたびにコードをそれに合わせて変えることになると書いています。これをくり返すと、抽象化はアプリ全体を if 文とループで書いたようなものになる、という説明です<Ref n={1} />。記事のまとめでは抽象化を始める時期について教条的にならず、正しいと感じたときに書き、そこまでは重複を恐れないことを勧め、AHA はいつ抽象化してよいかの厳密な決まりを与えずに、抽象化に注意を払うためのものだとしています<Ref n={1} />。
          </p>
          <h3>Sandi Metz の「The Wrong Abstraction」（2016年）</h3>
          <p>
            Sandi Metz は RailsConf 2014 の講演「All the Little Things」で「重複は、誤った抽象化よりはるかに安い（duplication is far cheaper than the wrong abstraction）」と述べ、まとめで「誤った抽象化より重複を選ぶ」ように勧めました。この部分への反響が大きかったため、Metz はニュースレターに書いた文章を、2016年1月20日にブログの記事「The Wrong Abstraction」として公開しています<Ref n={2} />。記事は、誤った抽象化ができあがるまでを8つの手順で説明しています<Ref n={2} />。図 74-3 はその手順とこの章の出来事を並べたものです。
          </p>
          <Figure n="74-3" title="誤った抽象化が育つ過程（Metz の手順と、この章の出来事）" caption="Metz の記事の手順を短くして、前の節の要望と対応させた。">
            <GrowthFigure />
          </Figure>
          <p>
            手順1〜3で、プログラマー A は重複を取り出して名前を付け、重複を新しい抽象化に置き換えます。この章では、共通化した時点の ReportBuilder がこれに当たり、この時点のコードには問題がありません。手順5で、今の抽象化がほぼ合う新しい要件が来ます。手順6のプログラマー B は今の抽象化を残さなければならないと感じます。ところが要件はどの場合にも同じではないので、引数を足し、その値で条件を分けて正しい動きをさせます。記事は、どの場合にも同じだった抽象化が、場合ごとに違う動きをするようになると書いています。手順7で、要件・引数・分岐の追加がくり返され、コードは理解できなくなります。手順8がそのコードを引き継いだ人の場面です<Ref n={2} />。
          </p>
          <p>
            Metz は、手順8の人がそれでも今のコードを変え続けてしまう理由も説明しています。すでにあるコードはそこにあるだけで、正しく必要なものに見えます。コードは費やした手間の結果なので、その価値を保ちたくなります。複雑で分かりにくいコードほど作るのに手間がかかったように見え、残したい気持ちが強くなります。Metz はこれを<Term en="sunk cost fallacy">埋没費用の誤り</Term>と呼んでいます<Ref n={2} />。すでに使った費用を惜しんで、今の判断を誤ることです。
          </p>
          <p>
            誤った抽象化への対処として、Metz は「いちばん早く前に進む方法は、戻ることだ（the fastest way forward is back）」と書き、次の手順を挙げています<Ref n={2} />。
          </p>
          <ol>
            <li>抽象化したコードを、呼び出し側すべてに<Term en="inline">インライン化</Term>する。インライン化とは、共通の処理に書いたコードを呼び出し側に書き戻すこと。これで重複が戻ってくる</li>
            <li>それぞれの呼び出し側で、渡していた引数から、その呼び出し側が実行する部分を決める</li>
            <li>その呼び出し側に要らない部分を消す</li>
          </ol>
          <p>
            これで抽象化と分岐の両方がなくなり、それぞれの呼び出し側には自分に要るコードだけが残ります。Metz はこうして戻すと、共通の抽象化を呼んでいるように見えた呼び出し側が、実際にはかなり違うコードを実行していたと分かることが多いと書いています。古い抽象化を取り除いた後で、重複を見直し、抽象化を取り出し直します<Ref n={2} />。前の節の図 74-2 は手順2で決める「その呼び出し側が実行する部分」を Coverage で数えたものに当たります。
          </p>
          <p>
            記事の結びでは共有のコードに引数を渡し、条件の分岐を足しているなら、その抽象化は誤っている、最初は正しかったかもしれないが、その時期は過ぎた、と書いています<Ref n={2} />。共通化した時点の ReportBuilder が正しく見えたことと、後から誤った抽象化になったことは、どちらもこの説明に合います。
          </p>
          <h3>WET との違い</h3>
          <p>
            <ChapterLink n={60} />（WET）は、2回目までは写して書き、3回目の例が来てからまとめる、という回数の目安でした。AHA は回数を決めません。まとめる時期を決めるのは、使い道と、呼び出し側ごとに違う所が分かったかどうかです。図 74-4 は、DRY・WET・AHA が何を問い、いつまとめるかを並べたものです。
          </p>
          <Figure n="74-4" title="DRY・WET・AHA：何を問い、いつまとめるか" caption="横は同じ形のコードがある場所の数。下の赤い文字はこの章の場面。">
            <WetAhaFigure />
          </Figure>
          <p>
            この章の場面では、ReportBuilder は3つの帳票がそろってからまとめたので、WET の目安には合っていました。それでも誤った抽象化になったのは、3つの帳票の使い道（会計ソフトへの取り込み・ピッキング・販売の計画）が最初から違い、後から来る要望もそれぞれの部署の都合によるものだったからです。共通化した時点で3つに共通していたのは「注文を読み、CSV にする」という手順の形だけで、どの注文をどの単位で行にするかは帳票ごとに決まっていました。AHA の問いに当てはめると、この時点でまとめてよかったのは CSV を書き出す部分くらいで、行の作り方は帳票ごとに書いておく、という判断になります。この形は次の節で直した後のコードと同じです。
          </p>
          <p>
            もう1つの違いはまとめた後の扱いです。WET の回数の目安が決めるのは、まとめる時期です。まとめた処理が誤っていたときの戻し方は、WET の章でも Metz の記事の手順を借りて扱いました。AHA では、Dodds が記事の最後に、誤った抽象化から抜け出す手順として Metz の記事を挙げているので、インライン化して戻すところまでを含めて考えます<Ref n={1} />。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何を判断するか</th>
                  <th scope="col">AHA との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DRY（<ChapterLink n={59} />）</th>
                  <td>同じ知識が複数の場所にあるか</td>
                  <td>同じ知識と分かっているものは DRY でまとめる。AHA が待つのは、同じ知識かどうかがまだ分からないとき</td>
                </tr>
                <tr>
                  <th scope="row">WET（<ChapterLink n={60} />）</th>
                  <td>同じ形のコードが何回目か</td>
                  <td>WET は回数で、AHA は使い道と違いが分かったかで、まとめる時期を決める</td>
                </tr>
                <tr>
                  <th scope="row">YAGNI（<ChapterLink n={58} />）</th>
                  <td>今は要らない機能を作っていないか</td>
                  <td>YAGNI は機能を、AHA は共通化の形（引数・分岐・名前）を、必要が分かるまで作らない</td>
                </tr>
                <tr>
                  <th scope="row">KISS（<ChapterLink n={57} />）</th>
                  <td>不必要に複雑になっていないか</td>
                  <td>引数と分岐が増えた抽象化は、KISS にも反する。インライン化すると、それぞれの呼び出し側は単純になる</td>
                </tr>
                <tr>
                  <th scope="row">SRP（<ChapterLink n={63} />）</th>
                  <td>モジュールを変える理由が1つか</td>
                  <td>変わる理由の違う呼び出し側を1つの抽象化にまとめると、その抽象化を変える理由が呼び出し側の数だけ増える</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            DRY と AHA は同じ重複に対して逆の変更を勧めることがあります。2つの原則のトレードオフは <ChapterLink n={93} section="dry-aha">終章の DRY と AHA の節</ChapterLink>で比べます。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: 'ReportBuilder を3つの帳票に戻し、同じ知識だけを引数なしでまとめ直す',
      body: (
        <>
          <h3>直す順序</h3>
          <p>
            Metz の手順に、前後の確認を足して6つの手順で直します。手順2〜4では1つの手順を終えるたびに spec を実行します。図 74-5 は手順と、それぞれの後に spec/reports を実行した結果です。
          </p>
          <ol>
            <li>3つの帳票の出力を、同じデータで丸ごと確かめる spec を用意する（前の節の reports_spec.rb）。直す前は営業だけが失敗する</li>
            <li>ReportBuilder の中身を3つの呼び出し側に写し、渡していた引数の値を当てはめる</li>
            <li>その帳票が通る分岐だけを残し、通らない分岐を消す。どの分岐を通るかは図 74-2 で確かめる</li>
            <li>通っていても、その帳票の要件ではない部分を消す。この手順は振る舞いを変えるので、ほかの手順と分けて spec で確かめる</li>
            <li>ReportBuilder を消す</li>
            <li>3つの帳票を並べ、同じ知識だと確かめられた所だけを、引数のない部品にまとめ直す</li>
          </ol>
          <Figure n="74-5" title="誤った抽象化を戻す手順" caption="手順2〜4が Metz の記事の3つの手順にあたる。">
            <UndoFigure />
          </Figure>
          <h3>手順2・3：呼び出し側にインライン化し、通る分岐だけを残す</h3>
          <p>
            営業の ProductSalesReport に ReportBuilder の中身を写し、<code>group_by: :product</code>・<code>sort_by: :amount</code>・<code>desc: true</code>・<code>total_row: true</code> を当てはめました。図 74-2 の営業の列を見ながら、通らない分岐（<code>order_rows</code> と、<code>@per_item</code> の判定）を消した結果です。
          </p>
          <Code
            lang="ruby"
            title="app/reports/product_sales_report.rb（インライン化した直後）"
            code={`
require "csv"

# 営業：商品別の売上。月ごとに、売れた商品を金額の多い順に並べる
class ProductSalesReport
  def self.csv(month)
    orders = Order.where(status: %w[paid shipped], ordered_on: month.all_month)
    columns = { "商品" => :product, "数量" => :quantity, "金額" => :amount }
    items = orders.includes(order_items: { product: { bundle_items: :component } }).flat_map do |o|
      o.order_items.flat_map do |i|
        if i.product.bundle_items.any? # 要望4（倉庫）：セット商品は中身の商品に分ける
          i.product.bundle_items.map do |b|
            { number: o.number, product: b.component.name, location: b.component.location,
              quantity: i.quantity * b.quantity, amount: 0 } # 倉庫では金額を使わない
          end
        else
          [{ number: o.number, product: i.product.name, location: i.product.location,
             quantity: i.quantity, amount: i.unit_price * i.quantity }]
        end
      end
    end
    rows = items.group_by { |row| row[:product] }.map do |key, group|
      { product: key, quantity: group.sum { |r| r[:quantity] }, amount: group.sum { |r| r[:amount] } }
    end
    rows = rows.sort_by { |row| [row[:amount], row[:number].to_s] }.reverse
    CSV.generate("\\uFEFF") do |csv| # Excel で開いたときに文字化けしないように BOM を付ける
      csv << columns.keys
      rows.each { |row| csv << columns.values.map { |key| row[key] } }
      csv << ["合計", *Array.new(columns.size - 2), rows.sum { |row| row[:amount] }]
    end
  end
end
`}
          />
          <p>
            経理の MonthlySalesReport と倉庫の PickingList にも、同じように写して、通る分岐だけを残しました。この時点では振る舞いを変えていないので、spec の結果は直す前と同じはずです。
          </p>
          <Code
            lang="text"
            title="実行結果（インライン化した直後に bundle exec rspec spec/reports）"
            code={`
..F

Failures:

  1) 帳票 営業：セット商品はセットのまま数え、合計は経理と同じになる
     …（省略。直す前と同じ失敗）

3 examples, 1 failure

Failed examples:

rspec ./spec/reports/reports_spec.rb:24 # 帳票 営業：セット商品はセットのまま数え、合計は経理と同じになる
`}
          />
          <p>
            失敗したのは直す前と同じ1件です。インライン化した ProductSalesReport を読むと、営業の帳票が実際に何をしているかが1つのファイルで分かります。注文を明細に分け、セット商品なら中身に分け、商品ごとに集計し、金額の順に並べています。ReportBuilder を呼んでいたときは、この流れを読むために7個の引数と <code>rows</code> の分岐を追う必要がありました。
          </p>
          <h3>手順4：通っていても、その帳票に要らない部分を消す</h3>
          <p>
            インライン化した営業のコードには、セット商品を中身に分ける分岐が残っています。営業はこの分岐を実際に通っていたので、手順3では消えません。Metz の手順の3つ目はその呼び出し側に要らない部分を消すことです<Ref n={2} />。セット商品を中身に分けるのは倉庫の要望で、営業はセット商品をセットのまま数えたいので、営業には要りません。行のキーのうち、営業の列にない <code>number</code> と <code>location</code> も消しました。
          </p>
          <Code
            lang="text"
            title="変更（diff -u）"
            code={`
--- app/reports/product_sales_report.rb（インライン化した直後）
+++ app/reports/product_sales_report.rb（セット商品の分岐を消した後）
@@ -5,17 +5,9 @@
   def self.csv(month)
     orders = Order.where(status: %w[paid shipped], ordered_on: month.all_month)
     columns = { "商品" => :product, "数量" => :quantity, "金額" => :amount }
-    items = orders.includes(order_items: { product: { bundle_items: :component } }).flat_map do |o|
-      o.order_items.flat_map do |i|
-        if i.product.bundle_items.any? # 要望4（倉庫）：セット商品は中身の商品に分ける
-          i.product.bundle_items.map do |b|
-            { number: o.number, product: b.component.name, location: b.component.location,
-              quantity: i.quantity * b.quantity, amount: 0 } # 倉庫では金額を使わない
-          end
-        else
-          [{ number: o.number, product: i.product.name, location: i.product.location,
-             quantity: i.quantity, amount: i.unit_price * i.quantity }]
-        end
+    items = orders.includes(order_items: :product).flat_map do |o|
+      o.order_items.map do |i|
+        { product: i.product.name, quantity: i.quantity, amount: i.unit_price * i.quantity }
       end
     end
     rows = items.group_by { |row| row[:product] }.map do |key, group|
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/reports）"
            code={`
...

Finished in 0.17208 seconds (files took 1.07 seconds to load)
3 examples, 0 failures
`}
          />
          <p>
            営業の spec が通りました。不具合の修正は要らない分岐を消すことだけで済みました。インライン化（手順2・3）は振る舞いを変えない変更で、この手順は振る舞いを変える変更です。実際の作業ではコミットを分けると、レビューする人がどちらの変更で何が変わったかを追えます。
          </p>
          <h3>手順5・6：3つを並べ、同じ知識だけをまとめ直す</h3>
          <p>
            ReportBuilder のファイルを消し、ReportBuilder への参照が残っていないことを grep で確かめました。次に、インライン化した3つの帳票を並べ、何が同じで何が違うかを書き出しました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">項目</th>
                  <th scope="col">経理（月次売上）</th>
                  <th scope="col">倉庫（出荷リスト）</th>
                  <th scope="col">営業（商品別売上）</th>
                  <th scope="col">判断</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">対象の注文</th>
                  <td>入金済み・出荷済みで、注文日がその月</td>
                  <td>入金済みで、出荷日がその日</td>
                  <td>経理と同じ</td>
                  <td>経理と営業の「売上に数える注文」は同じ知識なので、名前を付けてまとめる</td>
                </tr>
                <tr>
                  <th scope="row">明細の金額</th>
                  <td>単価 × 数量</td>
                  <td>使わない</td>
                  <td>単価 × 数量</td>
                  <td>同じ知識なので、OrderItem のメソッドにする</td>
                </tr>
                <tr>
                  <th scope="row">1行の単位</th>
                  <td>注文</td>
                  <td>明細（セットは中身に分ける）</td>
                  <td>商品（セットはセットのまま）</td>
                  <td>帳票ごとに違うので、それぞれに書く</td>
                </tr>
                <tr>
                  <th scope="row">並べ方</th>
                  <td>注文日・注文番号</td>
                  <td>棚・注文番号</td>
                  <td>金額の多い順</td>
                  <td>帳票ごとに違うので、それぞれに書く</td>
                </tr>
                <tr>
                  <th scope="row">合計の行</th>
                  <td>ある（4列目）</td>
                  <td>ない</td>
                  <td>ある（3列目）</td>
                  <td>1行の式で、列の位置が違うので、それぞれに書く</td>
                </tr>
                <tr>
                  <th scope="row">CSV の形</th>
                  <td>BOM・見出し・行</td>
                  <td>BOM・見出し・行</td>
                  <td>BOM・見出し・行</td>
                  <td>3つで同じで、引数は見出しと行だけで足りるので、まとめる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            まとめるのは、3つの帳票のどれにも引数や分岐を足さずに書ける所だけです。「売上に数える注文」は、経理と営業の合計が同じ月で一致しなければならないので、片方だけを変えることはありません。Order の <Term en="named scope">scope</Term>にしました。scope は名前を付けた検索の条件で、Active Record のクラスメソッドのように呼べ、ほかの scope や where と続けて書けます<Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb・order_item.rb（直した後）"
            code={`
class Order < ApplicationRecord
  has_many :order_items

  scope :counted_as_sales, -> { where(status: %w[paid shipped]) } # 売上に数える注文（経理と営業で同じ）
  scope :ordered_in, ->(month) { where(ordered_on: month.all_month) }
  scope :to_ship_on, ->(date) { where(status: "paid", ship_on: date) } # その日に出荷する注文
end

class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  def subtotal = unit_price * quantity
end
`}
          />
          <Code
            lang="ruby"
            title="app/reports/report_csv.rb"
            code={`
require "csv"

# 帳票の CSV を作る。見出しと行の配列を受け取るだけで、帳票ごとの違いは呼び出し側に書く
module ReportCsv
  BOM = "\\uFEFF".freeze # Excel で開いたときに文字化けしないように付ける

  def self.generate(headers, rows)
    CSV.generate(BOM.dup) do |csv| # CSV.generate は渡した文字列に書き足すので、複製を渡す
      csv << headers
      rows.each { |row| csv << row }
    end
  end
end
`}
          />
          <p>
            ReportCsv は見出しの配列と行の配列を受け取るだけで、帳票の種類を表す引数を持ちません。最初は <code>BOM = "\uFEFF"</code> を <code>CSV.generate(BOM)</code> にそのまま渡していて、spec の2件目以降が失敗しました。2件目の出荷リストの CSV の先頭に、1件目の経理の CSV が残っていたからです。<code>CSV.generate</code> は渡した文字列に CSV を書き足して返します。csv のドキュメントにも、渡した文字列は変更されるので、残したいときは <code>dup</code> を渡すように書かれています<Ref n={7} />。定数を <code>freeze</code> して複製を渡すようにしました。
          </p>
          <Code
            lang="ruby"
            title="app/reports/monthly_sales_report.rb・picking_list.rb・product_sales_report.rb（直した後）"
            code={`
# 経理：月次の売上 CSV。翌月の初めに会計ソフトに取り込む
class MonthlySalesReport
  HEADERS = %w[注文番号 注文日 お客様 金額].freeze

  def self.csv(month)
    orders = Order.counted_as_sales.ordered_in(month).includes(:order_items).order(:ordered_on, :number)
    rows = orders.map { |o| [o.number, o.ordered_on, o.customer_name, o.order_items.sum(&:subtotal)] }
    ReportCsv.generate(HEADERS, rows + [["合計", nil, nil, rows.sum(&:last)]])
  end
end

# 倉庫：出荷リスト。出荷日の朝に印刷し、棚の順に商品を集める
class PickingList
  HEADERS = %w[棚 商品 数量 注文番号].freeze

  def self.csv(date)
    items = OrderItem.joins(:order).merge(Order.to_ship_on(date)).includes(:order, product: { bundle_items: :component })
    rows = items.flat_map do |item|
      if item.product.bundle_items.any? # セット商品は、箱に詰める前に中身を棚から集める
        item.product.bundle_items.map { |b| [b.component.location, b.component.name, item.quantity * b.quantity, item.order.number] }
      else
        [[item.product.location, item.product.name, item.quantity, item.order.number]]
      end
    end
    ReportCsv.generate(HEADERS, rows.sort_by { |location, _, _, number| [location, number] })
  end
end

# 営業：商品別の売上。月ごとに、売れた商品を金額の多い順に並べる。セット商品はセットのまま数える
class ProductSalesReport
  HEADERS = %w[商品 数量 金額].freeze

  def self.csv(month)
    items = OrderItem.joins(:order).merge(Order.counted_as_sales.ordered_in(month)).includes(:product)
    rows = items.group_by(&:product).map { |product, list| [product.name, list.sum(&:quantity), list.sum(&:subtotal)] }
    rows = rows.sort_by { |name, _, amount| [-amount, name] }
    ReportCsv.generate(HEADERS, rows + [["合計", nil, rows.sum(&:last)]])
  end
end
`}
          />
          <p>
            出荷リストと商品別売上は、OrderItem から読み始め、<code>joins(:order)</code> で注文を結合し、<code>merge</code> で Order の scope を当てはめています。<code>merge</code> は結合したテーブルの条件に、別のモデルの名前付きの scope を使う方法として Rails Guides に載っています<Ref n={5} />。セット商品を分けるのは出荷リストだけで、コメントに理由を書きました。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/reports と bin/rails runner script/scene.rb。CSV は営業の部分だけ）"
            code={`
...

Finished in 0.26918 seconds (files took 1.29 seconds to load)
3 examples, 0 failures

--- 営業：商品別の売上（11月）
商品,数量,金額
ギフトセット,2,7800
コーヒー豆,3,5400
マグカップ,1,2400
ドリップバッグ,1,1200
合計,,16800
`}
          />
          <p>
            経理と倉庫の CSV は、前の節の実行結果と同じ内容でした。営業の合計は16800円になり、経理と一致しました。
          </p>
          <h3>直す前と後の比較</h3>
          <Figure n="74-6" title="直す前と後：違いの置き場所と、依頼ごとに直すファイル" caption="上段は呼び出しの形、下段は依頼ごとに直すファイルと、出力が変わる帳票。">
            <CompareFigure />
          </Figure>
          <p>
            図 74-6 の上段のとおり、直す前は帳票ごとの違いが ReportBuilder の引数と分岐にあり、直した後は帳票ごとの違いがそれぞれのクラスにあります。3つの帳票が呼ぶのは、引数で動きを切り替えない部品（Order の scope、<code>OrderItem#subtotal</code>、<code>ReportCsv.generate</code>）だけです。
          </p>
          <p>
            下段は、依頼が来たときに直すファイルです。倉庫の「セット商品を中身に分ける」は、直す前は report_builder.rb を直す依頼で、営業の出力まで変わりました。直した後は picking_list.rb だけを直し、ほかの2つの帳票はこのファイルを通りません。2つ目の依頼（売上に数える状態を足す）は、次の節で実際に動かします。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '同じ知識まで写したままにしたとき',
      body: (
        <>
          <p>
            AHA の「重複を許す」を、同じ知識だと分かっている重複にまで当てはめると、<ChapterLink n={59} />（DRY）の場面と同じ食い違いが起きます。この節では前の節の手順6で「売上に数える注文」をまとめなかった場合を動かして確かめます。
          </p>
          <h3>売上に数える注文の条件を、2つの帳票に写しておく</h3>
          <p>
            手順6で、開発者が「AHA に従って、急いでまとめない」と考え、経理と営業の帳票にそれぞれ <code>where(status: …)</code> を書いたままにしたとします。その後、配達の追跡を始めることになり、配達が済んだ注文の状態を delivered（配達済み）にしました。配達済みの注文も売上に数えます。開発者は経理の帳票の条件に delivered を足しましたが、営業の帳票の条件は直し忘れました。
          </p>
          <Code
            lang="ruby"
            title="script/overuse/duplicated_conditions.rb（当てはめすぎた例）"
            code={`
# 当てはめすぎた例：「売上に数える注文」の条件をまとめず、経理と営業の帳票にそれぞれ書いておく
class MonthlySalesReport
  def self.csv(month)
    orders = Order.where(status: %w[paid shipped delivered], ordered_on: month.all_month) # 配達済みを足した
                  .includes(:order_items).order(:ordered_on, :number)
    rows = orders.map { |o| [o.number, o.ordered_on, o.customer_name, o.order_items.sum(&:subtotal)] }
    ReportCsv.generate(HEADERS, rows + [["合計", nil, nil, rows.sum(&:last)]])
  end
end

class ProductSalesReport
  def self.csv(month)
    items = OrderItem.joins(:order).where(orders: { status: %w[paid shipped], ordered_on: month.all_month }) # 直し忘れた
                     .includes(:product)
    rows = items.group_by(&:product).map { |product, list| [product.name, list.sum(&:quantity), list.sum(&:subtotal)] }
    rows = rows.sort_by { |name, _, amount| [-amount, name] }
    ReportCsv.generate(HEADERS, rows + [["合計", nil, rows.sum(&:last)]])
  end
end
`}
          />
          <Code
            lang="ruby"
            title="script/delivered.rb"
            code={`
# 配達の追跡を始め、配達が済んだ注文を delivered にした後の、経理と営業の売上の合計
# 引数 overuse を付けると、条件を2つの帳票に写したままの版（script/overuse/duplicated_conditions.rb）で動かす
require_relative "data"
load File.expand_path("overuse/duplicated_conditions.rb", __dir__) if ARGV.first == "overuse"
seed_shop
Order.find_by!(number: "1001").update!(status: "delivered")
month = Date.new(2026, 11, 1)
total = ->(csv) { csv.lines.last.chomp.split(",").last }
puts "注文の状態：#{Order.order(:number).pluck(:number, :status).map { |n, s| "#{n} #{s}" }.join("、")}"
puts "経理の月次売上の合計：#{total.(MonthlySalesReport.csv(month))}"
puts "営業の商品別売上の合計：#{total.(ProductSalesReport.csv(month))}"
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/delivered.rb overuse）"
            code={`
注文の状態：1001 delivered、1002 paid、1003 paid、1004 canceled
経理の月次売上の合計：16800
営業の商品別売上の合計：13200
`}
          />
          <p>
            配達済みになった青木さんの注文（3600円）が、営業の集計から抜けました。ReportBuilder のときと同じく、経理と営業の合計が合わなくなっています。原因は逆で、ReportBuilder は違う知識を1つにまとめたために、この例は同じ知識を2か所に書いたために食い違いました。
          </p>
          <h3>scope の1行を直す</h3>
          <p>前の節で直したコードでは、売上に数える状態は Order の scope の1か所にあります。その1行を直し、同じスクリプトを引数なしで実行しました。</p>
          <Code
            lang="text"
            title="変更（diff -u）"
            code={`
--- app/models/order.rb
+++ app/models/order.rb（配達済みを足した後）
@@ -1,7 +1,7 @@
 class Order < ApplicationRecord
   has_many :order_items

-  scope :counted_as_sales, -> { where(status: %w[paid shipped]) } # 売上に数える注文（経理と営業で同じ）
+  scope :counted_as_sales, -> { where(status: %w[paid shipped delivered]) } # 売上に数える注文（経理と営業で同じ）
   scope :ordered_in, ->(month) { where(ordered_on: month.all_month) }
   scope :to_ship_on, ->(date) { where(status: "paid", ship_on: date) } # その日に出荷する注文
 end
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/delivered.rb）"
            code={`
注文の状態：1001 delivered、1002 paid、1003 paid、1004 canceled
経理の月次売上の合計：16800
営業の商品別売上の合計：16800
`}
          />
          <p>2つの帳票が同じ条件を使っていることを確かめる例を、reports_spec.rb に足しました。</p>
          <Code
            lang="ruby"
            title="spec/reports/reports_spec.rb（足した例）"
            code={`
  it "配達済みの注文も、経理と営業の両方で売上に数える" do
    Order.find_by!(number: "1001").update!(status: "delivered")
    expect([MonthlySalesReport.csv(month), ProductSalesReport.csv(month)].map { |csv| lines(csv).last })
      .to eq ["合計,,,16800", "合計,,16800"]
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/reports --format documentation）"
            code={`
帳票
  経理：入金済みと出荷済みの注文を1行ずつ並べ、最後に合計を出す
  倉庫：セット商品を中身に分け、棚の順に並べる
  営業：セット商品はセットのまま数え、合計は経理と同じになる
  配達済みの注文も、経理と営業の両方で売上に数える

Finished in 0.62547 seconds (files took 3.3 seconds to load)
4 examples, 0 failures
`}
          />
          <p>
            「売上に数える注文」は、経理と営業の合計が一致しなければならない値なので、片方だけを変えることがありません。引数なしで書け、<code>counted_as_sales</code> という業務の言葉の名前も付きます。使い道と違いがすでに分かっている重複なので、AHA が待つ対象ではありません。Dodds 自身も重複の多いコードで同じ不具合を8か所直した経験を、重複の問題として挙げていました<Ref n={1} />。
          </p>
          <h3>待つ・まとめる・戻すの目安</h3>
          <p>
            この章では、経理と営業の合計が合わないという同じ症状が、逆の2つの原因から起きました。違う知識をまとめた ReportBuilder と、同じ知識を写したままにした条件です。図 74-7 は似たコードを見つけたとき、またはすでにある共通の処理を見直すときに、まとめるか、待つか、戻すかを2つの軸で分けたものです。
          </p>
          <Figure n="74-7" title="まとめるか、待つか、戻すか" caption="模式図。縦の軸を先に判断する。">
            <JudgeFigure />
          </Figure>
          <p>
            縦の軸は「変わる理由が同じと分かっているか」で、DRY の問いと同じです。分かっているなら、横の軸に関係なく、同じ部分には名前を付けてまとめます。違う所があれば、その部分だけを呼び出し側に残します。経理と営業は、対象の注文は同じで、列と並べ方は違うので、scope だけをまとめました。
          </p>
          <p>
            まだ分からないときに AHA の判断が要ります。引数や分岐なしで書けても、使い道が違うなら写したまま待ちます。要望4の前の倉庫と営業の「明細を行にする」処理は、コードが同じで引数も要りませんでしたが、ピッキングと販売の計画という違う使い道のためのものでした。待つ間は、似ている場所をコメントに書き、両方にテストを置いておきます。まとめるために呼び出し側ごとの引数や分岐が要るなら、まとめません。すでにまとめてあるなら、Metz の手順でインライン化して戻します。
          </p>
          <p>
            Metz は、何が起きているかを知るために分岐をいくつか足して様子を見ることにも意味がある場合を認めたうえで、誤った抽象化は早く手放すほうが苦労が少ないと書いています<Ref n={2} />。次のような兆候があれば、共通の処理を戻すことを考えます。
          </p>
          <ul>
            <li>共通の処理の引数に、1つの呼び出し側しか渡さないものがある（ReportBuilder の <code>per_item</code>・<code>desc</code>）</li>
            <li>1つの呼び出し側のための変更で、別の呼び出し側のテストが失敗する、または出力が変わる</li>
            <li>呼び出し側の引数を読んでも、共通の処理のどの分岐を通るかが分からない</li>
            <li>「この帳票では使わない」のように、特定の呼び出し側を前提にしたコメントや値が、共通の処理の中にある（<code>amount: 0</code>）</li>
          </ul>
          <p>反対に、次のような兆候があれば、重複を待たずにまとめます。</p>
          <ul>
            <li>一致しなければならない値（経理と営業の売上の合計）を、2か所で別々に求めている</li>
            <li>片方だけを変える依頼が来ることがなく、変えるときは必ず両方を同じに変える</li>
            <li>引数なしで書け、業務の言葉で名前を付けられる（<code>counted_as_sales</code>）</li>
          </ul>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Active Record の scope・Rails Doctrine と AHA',
      body: (
        <>
          <h3>ReportBuilder の引数と、Rails・Ruby にある機能</h3>
          <p>
            ReportBuilder の引数を1つずつ見ると、多くは Active Record や Ruby の配列がメソッドとして持っている機能を、引数の値で呼び分けていました。図 74-8 は引数ごとに、直した後のコードで何を使ったかを並べたものです。
          </p>
          <Figure n="74-8" title="ReportBuilder の引数と、直した後に使ったもの" caption="直した後のコードで使ったものを並べた。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">ReportBuilder の引数</th>
                    <th scope="col">していたこと</th>
                    <th scope="col">直した後に使ったもの</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>orders</code>（呼び出し側で where を書いて渡す）</td>
                    <td>対象の注文を絞る</td>
                    <td>Order の scope（<code>counted_as_sales</code>・<code>ordered_in</code>・<code>to_ship_on</code>）</td>
                  </tr>
                  <tr>
                    <td><code>per_item</code></td>
                    <td>明細ごとに1行にする</td>
                    <td>OrderItem から読み始め、<code>joins</code> と <code>merge</code> で注文の条件を付ける</td>
                  </tr>
                  <tr>
                    <td><code>group_by</code></td>
                    <td>商品ごとに集計する</td>
                    <td>Ruby の <code>group_by</code> と <code>sum</code></td>
                  </tr>
                  <tr>
                    <td><code>sort_by</code>・<code>desc</code></td>
                    <td>並べ替える</td>
                    <td>Ruby の <code>sort_by</code>（並べ替えのキーを帳票ごとに書く）</td>
                  </tr>
                  <tr>
                    <td><code>total_row</code></td>
                    <td>最後に合計の行を足す</td>
                    <td>帳票ごとの1行（<code>rows.sum(&amp;:last)</code>）</td>
                  </tr>
                  <tr>
                    <td><code>columns</code></td>
                    <td>見出しと、行のハッシュのキーの対応</td>
                    <td>見出しの配列（<code>HEADERS</code>）と、行の配列</td>
                  </tr>
                  <tr>
                    <td>（引数なし）BOM と <code>CSV.generate</code></td>
                    <td>CSV の形</td>
                    <td><code>ReportCsv.generate(headers, rows)</code></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            引数で呼び分けていたときは、帳票を読む人は ReportBuilder の中を読まないと処理の順序が分かりませんでした。直した後は、それぞれの帳票のコードに、絞り込み・行の作り方・並べ方・合計がそのまま並んでいます。まとめたのは、図 74-8 の最後の行の CSV の形と、図 74-6 の Order の scope と <code>OrderItem#subtotal</code> だけです。
          </p>
          <h3>scope と merge：名前の付いた部品を呼び出し側で組み合わせる</h3>
          <p>
            Rails Guides は scope を、よく使うクエリを名前で呼べるようにする機能と説明し、scope の中身は ActiveRecord::Relation か nil を返すべきで、そうするとほかの scope などのメソッドを続けて呼べると書いています<Ref n={5} />。Rails 8.1.4.1 のソースでは、<code>scope</code> はモデルにその名前のクラスメソッドを定義し、Relation からも同じ名前で呼べるようにしています<Ref n={6} />。直した後の帳票が使う組み合わせの SQL を表示しました。
          </p>
          <Code
            lang="ruby"
            title="script/scopes.rb"
            code={`
# 名前の付いた scope を、帳票ごとに組み合わせたときの SQL
month = Date.new(2026, 11, 1)
puts Order.counted_as_sales.ordered_in(month).to_sql
puts OrderItem.joins(:order).merge(Order.counted_as_sales.ordered_in(month)).to_sql
puts OrderItem.joins(:order).merge(Order.to_ship_on(Date.new(2026, 11, 30))).to_sql
`}
          />
          <Code
            lang="text"
            title="実行結果（RAILS_ENV=development bin/rails runner script/scopes.rb。配達済みを足した後）"
            code={`
SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`status\` IN ('paid', 'shipped', 'delivered') AND \`orders\`.\`ordered_on\` BETWEEN '2026-11-01' AND '2026-11-30'
SELECT \`order_items\`.* FROM \`order_items\` INNER JOIN \`orders\` ON \`orders\`.\`id\` = \`order_items\`.\`order_id\` WHERE \`orders\`.\`status\` IN ('paid', 'shipped', 'delivered') AND \`orders\`.\`ordered_on\` BETWEEN '2026-11-01' AND '2026-11-30'
SELECT \`order_items\`.* FROM \`order_items\` INNER JOIN \`orders\` ON \`orders\`.\`id\` = \`order_items\`.\`order_id\` WHERE \`orders\`.\`status\` = 'paid' AND \`orders\`.\`ship_on\` = '2026-11-30'
`}
          />
          <p>
            1行目は経理、2行目は営業、3行目は倉庫の帳票が発行するクエリの条件です。<code>counted_as_sales</code> と <code>ordered_in</code> は引数で動きを切り替えず、組み合わせ方は呼び出し側に書いてあります。ReportBuilder の <code>per_item: true</code> と違い、呼び出し側のコードを読めば、どの条件で何を読んでいるかが分かります。帳票ごとのクエリが長くなったら、帳票ごとに Query Object（<ChapterLink n={33} section="query-objects" />）に移せます。そのときも Query Object は帳票ごとに作り、1つの Query Object を引数で切り替えて複数の帳票に使うことはしません。
          </p>
          <h3>Rails Doctrine：Convention over Configuration と、アプリに残る部分</h3>
          <p>
            Rails Doctrine の「Convention over Configuration」は、Web アプリを作るたびに出てくる判断の多くは1回決めれば足りるもので、それを Rails が規約として決めると説明しています。規約は判断の手間を減らすだけでなく、より深い抽象化を作る余地も与え、良い規約は幅広い使い方で役に立つと書いています<Ref n={4} />。同じ節は、作る価値のあるアプリの多くには、5% や 1% であっても、どこか固有の部分があり、規約から外れるべき時を見極めるのが難しい所だとも書いています<Ref n={4} />。
          </p>
          <p>
            本書ではこの説明を AHA と次のように結びつけます。テーブルと列の対応、関連、クエリの組み立て、CSV の書き出しは、多くのアプリで同じ使われ方をするので、Rails と Ruby がすでに抽象化しています。「何を売上に数えるか」「セット商品をどう出すか」は、このアプリに固有の部分です。ReportBuilder はこのアプリに固有の部分を、引数で切り替える汎用の部品にしようとしました。固有の部分は帳票ごとに書き、汎用の部分は Rails と Ruby の機能を直接使うと、引数で切り替える層が要らなくなります。
          </p>
          <Callout kind="note">
            <p>
              csv は Ruby 3.4 で default gem から bundled gem に変わりました<Ref n={8} />。Ruby 3.4 以降で動かす Rails アプリでは、Gemfile に <code>gem "csv"</code> を書きます。この章のアプリでは共有の gem の置き場所に入れないように、Ruby に同梱の csv 3.3.5 をアプリの vendor/gems/csv に写し、Gemfile に path で書きました。
            </p>
          </Callout>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={59} />（DRY）：同じ知識を1か所にする原則です。この章の「売上に数える注文」と <code>OrderItem#subtotal</code> は、DRY でまとめたものです。
            </li>
            <li>
              <ChapterLink n={60} section="apply" />（WET）：フォームの検証で、2つ目の時点の共通化を呼び出し側に戻しました。この章は3つ目の時点でまとめた後に誤った抽象化になった場面です。
            </li>
            <li>
              <ChapterLink n={63} />（SRP）：変わる理由の違う処理を1つのクラスに置かない原則です。ReportBuilder は経理・倉庫・営業の3つの理由で変わっていました。
            </li>
            <li>
              <ChapterLink n={41} />（Strategy / Policy）：帳票の種類がさらに増え、どれも同じメソッド名（<code>csv</code>）を持つなら、帳票の一覧から選んで呼ぶ形にできます。そのときも違いは引数にせず、帳票ごとのクラスに置いたままにします。
            </li>
            <li>
              <ChapterLink n={93} section="dry-aha" />（終章）：DRY と AHA が同じコードに逆の変更を勧める場面で、どちらを優先するかを比べます。
            </li>
          </ul>
        </>
      ),
    },
    principleSection({
      lead: (
        <>
          まとめる時期は例の数ではなく、使い道と呼び出し側ごとの違いが分かったかで決めます。この章では経理・倉庫・営業の3つの帳票を通していた ReportBuilder を呼び出し側に戻し、引数なしで書ける同じ知識だけをまとめ直しました。「売上に数える注文」のように変わる理由が同じと分かっている条件は、AHA を理由に写したままにしません。
        </>
      ),
      benefit: {
        text: <>直す前は、倉庫のためにセット商品を中身に分けると、営業の合計が 9000円になり、経理の 16800円と合わなくなった。戻した後は、帳票ごとの違いがそれぞれのクラスにあり、倉庫の同じ依頼は picking_list.rb だけを直す変更になった。営業の合計は 16800円になり、経理と一致した。</>,
        basis: <><ChapterLink n={76} section="scene" />、<ChapterLink n={76} section="apply" /></>,
      },
      cost: {
        text: <>1行の単位・並べ方・合計の行のように帳票ごとに違う部分は、3つのクラスに似た形で残る。似ている場所はコメントに書き、片方だけを変える依頼が来るかを、依頼のたびに確かめる必要がある。</>,
        basis: <ChapterLink n={76} section="apply" />,
      },
      alternative: {
        text: <>「売上に数える注文」は Order の scope（counted_as_sales）に、CSV の形は見出しと行だけを受け取る ReportCsv にまとめる。この条件を2つの帳票に写したままにした例では、配達済みの状態を足したときに青木さんの注文（3600円）が営業の集計から抜けた。scope にした後は1行の変更で両方に届いた。</>,
        basis: <ChapterLink n={76} section="overuse" />,
      },
      criterion: {
        text: <>共通の処理に、1つの呼び出し側しか渡さない引数（per_item・desc）があるか。1つの呼び出し側のための変更で、別の呼び出し側の出力が変わるか。反対に、一致しなければならない値を2か所で別々に求めていないか。</>,
        basis: <ChapterLink n={76} section="overuse" />,
      },
    }),
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>AHA（拙速な抽象化を避ける）は似たコードを急いで1つにまとめず、不適切な共通化よりもはっきりした重複を許す考え方です。使い道と、呼び出し側ごとに違う所が分かってから抽象化します。</li>
          <li>3つの帳票を1つの ReportBuilder にまとめた後、要望のたびに引数と分岐が増え、倉庫のための変更が営業の売上の合計を変えました。Coverage で数えると、3つの帳票は分岐をそれぞれ違う組み合わせで通っていました。</li>
          <li>AHA という名前は Kent C. Dodds の2020年の記事「AHA Programming」で説明され、Dodds はこの考え方を Sandi Metz の「誤った抽象化より重複を選ぶ」という言葉で説明しています。Metz は2016年の記事で、引数と分岐が増えて誤った抽象化が育つ過程を8つの手順で説明しました。</li>
          <li>WET は回数でまとめる時期を決め、AHA は使い道と違いが分かったかで決めます。3つの例がそろっていても、使い道が違えば誤った抽象化になります。</li>
          <li>誤った抽象化は、呼び出し側にインライン化し、それぞれが通る部分を決め、要らない部分を消して戻します。この章では営業に要らないセット商品の分岐を消すことで不具合も直りました。その後で、同じ知識だけを引数のない scope・メソッド・CSV の部品にまとめ直しました。</li>
          <li>同じ知識と分かっている重複（売上に数える注文の条件）を AHA を理由に写したままにすると、片方の直し忘れで合計が食い違います。変わる理由が同じと分かっているかを先に判断します。</li>
          <li>Active Record の scope と merge を使うと、帳票ごとのクエリを、引数で動きを切り替えない名前付きの部品の組み合わせとして書けます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'AHA Programming', publisher: 'kentcdodds.com / Kent C. Dodds', url: 'https://kentcdodds.com/blog/aha-programming', accessed: '2026-11-22', version: '2020年6月22日', note: 'AHA（Avoid Hasty Abstractions）の頭字語を Cher Scarlett から聞いたこと、読み方。重複の多いコードで同じ不具合を8か所直した経験。WET を DRY と同様に教条的で決めすぎていると評し、3か所より多く使われていても出来の悪い抽象化があったこと。Metz の「prefer duplication over the wrong abstraction」と「Optimize for change first」。使い道が分かったと自信を持てるまで重複を受け入れること、早く抽象化すると if 文とループの集まりになること。抽象化の時期について教条的にならないこと、AHA は厳密な決まりを与えないこと、誤った抽象化から抜け出す手順として Metz の記事を挙げていること。' },
    { title: 'The Wrong Abstraction', publisher: 'sandimetz.com / Sandi Metz', url: 'https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction', accessed: '2026-11-22', version: '2016年1月20日', note: 'RailsConf 2014 の講演「All the Little Things」での「duplication is far cheaper than the wrong abstraction」と「prefer duplication over the wrong abstraction」。ニュースレターに書いた文章をブログに再掲したこと。誤った抽象化が育つ8つの手順、埋没費用の誤り、the fastest way forward is back、インライン化して各呼び出し側が実行する部分を決め、要らない部分を消す手順、引数と分岐が増えた共有のコードの抽象化は誤っていること、分岐を足して様子を見ることにも意味がある場合があること。' },
    { title: 'Coverage', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Coverage.html', accessed: '2026-11-22', version: 'Ruby 4.0', note: '行と分岐の実行回数を数えること（lines・branches）、Coverage.result(stop:, clear:) で結果を取り出し、clear で数を0に戻すこと。' },
    { title: 'The Rails Doctrine（Convention over Configuration）', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: '1回決めれば足りる判断を規約として Rails が決めること、規約がより深い抽象化を作る余地を与え、良い規約は幅広い使い方で役に立つこと。多くのアプリには 5% や 1% の固有の部分があり、規約から外れる時を見極めるのが難しいこと。' },
    { title: 'Active Record Query Interface（Scopes・Merging of Scopes・Specifying Conditions on the Joined Tables）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html#scopes', accessed: '2026-11-22', version: 'Rails 8.1', note: 'scope はよく使うクエリを名前で呼べるようにし、中身は Relation か nil を返してほかの scope などを続けて呼べるようにすること、クラスメソッドのように呼べること。joins した先の条件に、別のモデルの名前付きの scope を merge で使えること。' },
    { title: 'activerecord/lib/active_record/scoping/named.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/scoping/named.rb#L154-L188`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'scope がモデルの特異クラスにその名前のメソッドを定義し、all._exec_scope の結果（Relation）を返すこと、generate_relation_method で Relation からも同じ名前で呼べるようにすること。' },
    { title: 'CSV.generate', publisher: 'ruby/csv のドキュメント', url: 'https://ruby.github.io/csv/CSV.html', accessed: '2026-11-22', note: '渡した文字列は CSV.generate によって変更されるので、残したいときは dup を渡すこと。手元の csv 3.3.5 の lib/csv.rb でも、渡した文字列を StringIO で包み、末尾に書き足すことを確かめた。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/NEWS_md.html', accessed: '2026-11-22', note: 'csv（3.3.2）が default gem から bundled gem に変わったこと。' },
  ],
}

export default chapter
