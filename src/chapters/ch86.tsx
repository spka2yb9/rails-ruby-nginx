import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 67-1 送料の計算に関係するクラスと、問題のある箇所 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="67-1"
      w={780}
      h={452}
      label="送料の計算に関係するクラスと、問題のある箇所。CartsHelper の free_shipping_message は、5_000 から Order の subtotal を引き、残りが 0 以下なら送料無料と出す。Order の calc_ship は、小計が 5000 より大きければ 0、それ以外は 600 を返す。calc_ship は Order の total、注文の確認のメールのビュー、経理に渡す一覧を作る OrderExportJob から呼ばれる。old_calc_ship はどこからも呼ばれていない。明細は MySQL の orders と line_items に保存する。問題は4つある。送料無料の境目の比べ方が Order と CartsHelper で違うこと、5000 という数字が3か所にあること、使っていないメソッドがあること、境目の 5,000円のテストがないこと"
    >
      <Box
        x={20}
        y={10}
        w={740}
        h={48}
        dashed
        fill="bg"
        lines={['問い合わせ：小計がちょうど 5,000円の注文', 'カートには「送料無料」と出たのに、確認のメールでは送料が 600円']}
        fs={12}
        bold
        subTone="danger"
      />
      <Box
        x={20}
        y={96}
        w={220}
        h={104}
        lines={['CartsHelper', '#free_shipping_message', 'rest = 5_000 - subtotal', 'rest <= 0 なら「送料無料」']}
        fs={12}
        bold
        subTone="muted"
      />
      <Box
        x={290}
        y={86}
        w={290}
        h={150}
        fill="box5"
        align="start"
        lines={['Order（app/models/order.rb）', 'subtotal：明細の金額の合計', 'calc_ship：st > 5000 なら 0、', '　　　　　それ以外は 600', 'total：subtotal + calc_ship', 'old_calc_ship：2024年3月までの送料']}
        fs={12}
        bold
        subTone="muted"
      />
      <Box x={620} y={86} w={140} h={50} lines={['OrderMailer', '確認のメール']} fs={12} bold subTone="muted" />
      <Box x={620} y={160} w={140} h={50} lines={['OrderExportJob', '経理に渡す一覧']} fs={12} bold subTone="muted" />
      <Arrow x1={240} y1={148} x2={288} y2={148} />
      <T x={244} y={140} fs={10} tone="muted">
        subtotal
      </T>
      <Arrow x1={620} y1={111} x2={582} y2={111} />
      <Arrow x1={620} y1={185} x2={582} y2={185} />
      <T x={586} y={78} fs={10} tone="muted">
        calc_ship を呼ぶ
      </T>
      <Box x={290} y={276} w={290} h={40} fill="box4" lines="orders・line_items（MySQL）" fs={12} />
      <Arrow x1={435} y1={236} x2={435} y2={274} />
      <T x={28} y={157} fs={13} tone="danger" bold>
        ②
      </T>
      <T x={28} y={174} fs={13} tone="danger" bold>
        ①
      </T>
      <T x={538} y={153} fs={13} tone="danger" bold>
        ①②
      </T>
      <T x={556} y={204} fs={13} tone="danger" bold>
        ③
      </T>
      <T x={20} y={354} fs={12} tone="danger">
        ① 送料無料の境目の比べ方が、Order（{'>'}）と CartsHelper（{'<='}）で違う
      </T>
      <T x={20} y={378} fs={12} tone="danger">
        ② 境目の数字が3か所にある（calc_ship と old_calc_ship の 5000、CartsHelper の 5_000）
      </T>
      <T x={20} y={402} fs={12} tone="danger">
        ③ old_calc_ship はどこからも呼ばれていない
      </T>
      <T x={20} y={426} fs={12} tone="danger">
        ④ テストは小計 3,000円と 8,000円の例だけで、境目の 5,000円の例がない
      </T>
    </Svg>
  )
}

/* ---------- 図 67-2 修正にリファクタリングを混ぜた PR の差分 ---------- */
const bigRows = [
  { file: 'app/helpers/carts_helper.rb', add: 4, del: 6, note: '' },
  { file: 'app/mailers/order_mailer.rb', add: 6, del: 2, note: '書式だけの変更' },
  { file: 'app/models/line_item.rb', add: 3, del: 0, note: '振る舞いを変える検証' },
  { file: 'app/models/order.rb', add: 7, del: 14, note: 'st > 5000 の行が消える' },
  { file: 'app/models/shipping_fee.rb（新規）', add: 27, del: 0, note: '>= は新しいファイルに' },
  { file: 'app/views/order_mailer/confirmation.text.erb', add: 1, del: 1, note: '' },
  { file: 'spec/models/line_item_spec.rb（新規）', add: 9, del: 0, note: '' },
  { file: 'spec/models/order_spec.rb', add: 2, del: 2, note: '' },
  { file: 'spec/models/shipping_fee_spec.rb（新規）', add: 17, del: 0, note: '' },
]

function BigPrFigure() {
  const rowY = (i: number) => 52 + i * 26
  const unit = 5
  const barX = 388
  return (
    <Svg
      id="67-2"
      w={780}
      h={402}
      label="バグの修正にリファクタリングを混ぜた PR の差分を、ファイルごとの足した行と消した行の棒で示した。9つのファイルで76行を足し25行を消した。最も大きいのは新しい shipping_fee.rb の27行。order.rb では st > 5000 の行が消え、修正にあたる >= は新しい shipping_fee.rb の中にある。line_item.rb には振る舞いを変える検証が入り、order_mailer.rb は書式だけを変えた。変更しなかった order_export_job.rb には calc_ship の呼び出しが残り、実行すると NoMethodError になる。同じ時期に order.rb を変えていたポイントの PR とは1か所で衝突した。比べると、修正だけの PR は2つのファイルで5行を足し1行を消した"
    >
      <T x={20} y={20} fs={12} bold>
        バグの修正にリファクタリングを混ぜた PR（git diff --stat）
      </T>
      <T x={barX} y={38} fs={10} tone="acc">
        ■ 足した行
      </T>
      <T x={barX + 70} y={38} fs={10} tone="danger">
        ■ 消した行
      </T>
      {bigRows.map((r, i) => (
        <g key={r.file}>
          <T x={20} y={rowY(i) + 8} fs={11} mono>
            {r.file}
          </T>
          <rect x={barX} y={rowY(i)} width={r.add * unit} height={14} fill="var(--fig-accent)" />
          <rect x={barX + r.add * unit} y={rowY(i)} width={r.del * unit} height={14} fill="var(--fig-danger)" />
          <T x={barX + (r.add + r.del) * unit + 6} y={rowY(i) + 8} fs={10} tone="muted">
            {`+${r.add} −${r.del}`}
          </T>
          {r.note && (
            <T x={760} y={rowY(i) + 8} fs={10} tone="danger" anchor="end">
              {r.note}
            </T>
          )}
        </g>
      ))}
      <line x1={20} y1={rowY(9) - 6} x2={760} y2={rowY(9) - 6} stroke="var(--fig-line)" strokeOpacity={0.4} />
      <T x={20} y={rowY(9) + 12} fs={12} bold>
        9 files changed, 76 insertions(+), 25 deletions(-)
      </T>
      <T x={20} y={rowY(9) + 40} fs={12} tone="danger">
        ・変えなかった app/jobs/order_export_job.rb に calc_ship が残り、実行すると NoMethodError
      </T>
      <T x={20} y={rowY(9) + 64} fs={12} tone="danger">
        ・同じ時期に order.rb の total を変えたポイントの PR と、1か所で衝突する
      </T>
      <T x={20} y={rowY(9) + 92} fs={12}>
        比べると、修正だけの PR は 2 files changed, 5 insertions(+), 1 deletion(-)
      </T>
    </Svg>
  )
}

/* ---------- 図 67-3 技術的負債が増える過程と減る過程 ---------- */
const debtRows = [
  {
    name: ['修正だけを', '続ける'],
    cells: [
      ['境目の数字：3か所', '使っていないメソッド：1', '境目のテスト：0件'],
      ['境目の数字：3か所', '使っていないメソッド：1', '境目のテスト：1件'],
      ['境目の数字：3か所（値が2種類）', '使っていないメソッド：1', '5,500円でカートとメールが違う'],
    ],
    bad: true,
  },
  {
    name: ['触った所を', '少し良くする'],
    cells: [
      ['境目の数字：3か所', '使っていないメソッド：1', '境目のテスト：0件'],
      ['境目の数字：1か所（定数）', '使っていないメソッド：0', '境目のテスト：5件'],
      ['境目の数字：1か所（定数）', '使っていないメソッド：0', 'カートとメールが一致する'],
    ],
    bad: false,
  },
]

function DebtFigure() {
  const colX = [150, 360, 570]
  const rowY = [64, 214]
  return (
    <Svg
      id="67-3"
      w={780}
      h={372}
      label="この章のアプリで、送料無料の境目に関する負債がどう変わったかを、2つの進め方で比べた。始めはどちらも、境目の数字が3か所、使っていないメソッドが1つ、境目のテストが0件。修正だけを続けると、バグの修正の後も境目の数字は3か所、使っていないメソッドは1つのままで、境目のテストが1件増えただけだった。しきい値を6,000円に変えた後は、境目の数字は3か所のまま値が2種類になり、小計5,500円の注文でカートとメールの表示が違った。触った所を少し良くすると、バグの修正の後に境目の数字は定数の1か所、使っていないメソッドは0、境目のテストは5件になり、しきい値を変えた後もカートとメールが一致した"
    >
      {['今のコード', 'バグの修正の後', 'しきい値を 6,000円に変えた後'].map((h, c) => (
        <T key={h} x={colX[c] + 100} y={24} fs={12} bold anchor="middle">
          {h}
        </T>
      ))}
      {debtRows.map((r, ri) => (
        <g key={r.name[0]}>
          <T x={20} y={rowY[ri] + 42} fs={12} bold tone={r.bad ? 'danger' : 'acc'}>
            {r.name[0]}
          </T>
          <T x={20} y={rowY[ri] + 60} fs={12} bold tone={r.bad ? 'danger' : 'acc'}>
            {r.name[1]}
          </T>
          {r.cells.map((lines, c) => (
            <g key={c}>
              <Box
                x={colX[c]}
                y={rowY[ri]}
                w={200}
                h={100}
                fill={c === 0 ? 'box' : r.bad ? 'bg' : 'box5'}
                lines={lines}
                fs={11}
                align="start"
              />
              {c > 0 && <Arrow x1={colX[c] - 10} y1={rowY[ri] + 50} x2={colX[c] - 1} y2={rowY[ri] + 50} />}
            </g>
          ))}
        </g>
      ))}
      <line x1={20} y1={190} x2={770} y2={190} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={342} fs={11} tone="muted">
        「境目の数字」は 5000・5_000・6000 と書いた場所の数。「境目のテスト」は小計 4,999円・5,000円・5,001円の例の数。
      </T>
      <T x={20} y={362} fs={11} tone="muted">
        どの値も、この章のアプリ（scene 節と apply 節のコード）で数えた。
      </T>
    </Svg>
  )
}

/* ---------- 図 67-4 PR に含めてよい改善の範囲 ---------- */
const scopeRings = [
  { x: 20, y: 30, w: 740, h: 362, label: '関係のないファイル' },
  { x: 50, y: 74, w: 680, h: 278, label: '送料の機能のほかのファイル（CartsHelper・メールのビュー・経理の一覧のジョブ）' },
  { x: 80, y: 118, w: 620, h: 176, label: 'order.rb（直すメソッドのあるファイル）' },
  { x: 110, y: 162, w: 560, h: 90, label: 'calc_ship（直すメソッド）' },
]

function ScopeFigure() {
  return (
    <Svg
      id="67-4"
      w={780}
      h={426}
      label="バグの修正の PR に含めてよい改善の範囲を、直すメソッドから外へ4つの層で示した。直すメソッドの calc_ship では、> を >= に直すことと、変数 st をやめて 5000・600 を定数にすることをこの PR に入れる。同じファイルの order.rb では、使っていない old_calc_ship を消すことをこの PR に入れる。送料の機能のほかのファイルでは、CartsHelper の 5_000 を定数にすることはこの PR に入れ、calc_ship の改名と ShippingFee クラスへの抽出は別の PR にする。関係のないファイルの LineItem の検証やファイル全体の書式は、この PR に入れない"
    >
      {scopeRings.map((r, i) => (
        <g key={r.label}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={10} fill={i === 3 ? 'var(--fig-box5)' : i === 0 ? 'var(--fig-bg)' : 'var(--fig-box)'} stroke="var(--fig-line)" strokeOpacity={i === 3 ? 1 : 0.6} />
          <T x={r.x + 14} y={r.y + 22} fs={12} bold>
            {r.label}
          </T>
        </g>
      ))}
      <T x={130} y={208} fs={12}>
        ・{'>'} を {'>='} に直す（コミット3）
      </T>
      <T x={130} y={232} fs={12}>
        ・変数 st をやめ、5000・600 を定数にする（コミット2）
      </T>
      <T x={650} y={220} fs={12} tone="acc" bold anchor="end">
        この PR
      </T>
      <T x={100} y={276} fs={12}>
        ・使っていない old_calc_ship を消す（コミット2）
      </T>
      <T x={680} y={276} fs={12} tone="acc" bold anchor="end">
        この PR
      </T>
      <T x={70} y={314} fs={12}>
        ・CartsHelper の 5_000 を定数にする（コミット2）
      </T>
      <T x={710} y={314} fs={12} tone="acc" bold anchor="end">
        この PR
      </T>
      <T x={70} y={334} fs={12}>
        ・calc_ship の改名（呼び出し元が3か所）、ShippingFee クラスへの抽出
      </T>
      <T x={710} y={334} fs={12} tone="muted" bold anchor="end">
        別の PR
      </T>
      <T x={40} y={374} fs={12}>
        ・LineItem の検証を足す、ファイル全体の書式を変える
      </T>
      <T x={740} y={374} fs={12} tone="danger" bold anchor="end">
        入れない
      </T>
      <T x={20} y={416} fs={11} tone="muted">
        内側ほど、直す行に近い。コミット2の変更は、テストを変えずに全部が通ることで、振る舞いが変わらないことを確かめた（図 67-5）。
      </T>
    </Svg>
  )
}

/* ---------- 図 67-5 コミットの分け方 ---------- */
const commits = [
  {
    title: 'コミット1',
    what: ['今の振る舞いを', 'テストに書く'],
    diff: 'spec 2 files, +16',
    result: ['11 examples,', '0 failures'],
    hat: 0,
  },
  {
    title: 'コミット2',
    what: ['振る舞いを変えずに', '整える'],
    diff: 'app 2 files, +6 −12',
    result: ['テストは変えずに', '11 examples, 0 failures'],
    hat: 0,
  },
  {
    title: 'コミット3',
    what: ['バグを直す', '（> を >=）'],
    diff: 'app +2 −2, spec +4',
    result: ['足した例が失敗', '→ 直して 12 examples'],
    hat: 1,
  },
  {
    title: '別の PR',
    what: ['calc_ship を', 'shipping_fee に改名'],
    diff: '5 files, +22 −10',
    result: ['古い名前は', '非推奨の警告を出す'],
    hat: 0,
  },
]

function CommitsFigure() {
  const colX = (i: number) => 20 + i * 190
  return (
    <Svg
      id="67-5"
      w={780}
      h={360}
      label="バグの修正の PR を3つのコミットに分け、改名は別の PR にした。コミット1は今の振る舞いをテストに書き、spec の2つのファイルに16行を足し、11の例がすべて通った。コミット2は振る舞いを変えずに整え、app の2つのファイルで6行を足し12行を消し、テストを変えずに11の例が通った。コミット3はバグを直し、app で2行、spec で4行を変え、足した例が先に失敗し、直した後は12の例が通った。コミット1と2は振る舞いを保つ変更、コミット3は振る舞いを変える変更。別の PR で calc_ship を shipping_fee に改名し、5つのファイルで22行を足し10行を消し、古い名前は非推奨の警告を出す"
    >
      <rect x={14} y={20} width={386} height={26} rx={4} fill="var(--fig-box4)" />
      <T x={207} y={33} fs={11} anchor="middle">
        振る舞いを保つ変更（テストは変えない、または足すだけ）
      </T>
      <rect x={404} y={20} width={182} height={26} rx={4} fill="var(--fig-box2)" />
      <T x={495} y={33} fs={11} anchor="middle">
        振る舞いを変える変更
      </T>
      <rect x={594} y={20} width={172} height={26} rx={4} fill="var(--fig-box4)" />
      <T x={680} y={33} fs={11} anchor="middle">
        振る舞いを保つ変更
      </T>
      <line x1={590} y1={14} x2={590} y2={300} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={66} fs={11} tone="muted">
        バグの修正の PR
      </T>
      <T x={600} y={66} fs={11} tone="muted">
        次の PR
      </T>
      {commits.map((c, i) => (
        <g key={c.title}>
          <Box x={colX(i)} y={76} w={170} h={76} fill={c.hat === 1 ? 'box5' : 'box'} lines={[c.title, ...c.what]} fs={12} bold subTone="muted" />
          <Box x={colX(i)} y={166} w={170} h={34} fill="bg" lines={c.diff} fs={11} mono />
          <Box x={colX(i)} y={214} w={170} h={48} fill={c.hat === 1 ? 'box5' : 'box4'} lines={c.result} fs={11} />
          {i < 3 && <Arrow x1={colX(i) + 170} y1={114} x2={colX(i) + 188} y2={114} />}
        </g>
      ))}
      <T x={20} y={290} fs={11} tone="muted">
        2段目は git diff --stat の要約、3段目は bundle exec rspec の結果。
      </T>
      <T x={20} y={318} fs={12}>
        コミット2でテストを変えずに全部が通れば、整えた変更が振る舞いを変えていないと確かめられる。
      </T>
      <T x={20} y={342} fs={12}>
        コミット3の差分は2行なので、レビューする人はバグの修正だけを読める。
      </T>
    </Svg>
  )
}

/* ---------- 図 67-6 直す前と後：その後の変更の手間 ---------- */
const compareRows = [
  {
    head: 'バグの修正の差分',
    before: ['2 files, +5 −1'],
    after: ['4 files, +26 −12（コミット3つ）'],
  },
  {
    head: 'ポイントの PR との統合',
    before: ['衝突なし'],
    after: ['衝突なし'],
  },
  {
    head: 'しきい値を 6,000円に変える',
    before: ['grep "5000" に出ない 5_000 を変え忘れる', 'テストは 8 examples, 0 failures', '5,500円：カートは「送料無料」、メールは 600円'],
    after: ['定数の1行を変える', '境目のテストが CartsHelper と Order で落ちる', '5,500円：カートは「あと500円」、メールは 600円'],
  },
  {
    head: '使っていないメソッド',
    before: ['old_calc_ship が grep の結果に出る'],
    after: ['なし'],
  },
]

function CompareFigure() {
  const heights = [36, 36, 74, 36]
  const ys: number[] = []
  let y = 52
  for (const h of heights) {
    ys.push(y)
    y += h + 10
  }
  return (
    <Svg
      id="67-6"
      w={780}
      h={300}
      label="修正だけの PR と、触った所を少し良くした PR を、その後の変更で比べた。バグの修正の差分は、修正だけなら2つのファイルで5行を足し1行を消し、少し良くした PR は4つのファイルで26行を足し12行を消した。ポイントの PR との統合は、どちらも衝突しなかった。しきい値を6,000円に変えるとき、修正だけの場合は grep 5000 に出ない 5_000 を変え忘れ、テストは8件とも通り、小計5,500円の注文でカートは送料無料、メールは送料600円と食い違った。少し良くした場合は定数の1行を変え、境目のテストが CartsHelper と Order の両方で落ち、5,500円の注文でカートはあと500円、メールは送料600円と一致した。使っていないメソッドは、修正だけなら grep の結果に出続け、少し良くした場合はなくなった"
    >
      <T x={200} y={30} fs={13} bold>
        修正だけの PR
      </T>
      <T x={490} y={30} fs={13} bold>
        触った所を少し良くした PR
      </T>
      {compareRows.map((r, i) => (
        <g key={r.head}>
          <T x={20} y={ys[i] + heights[i] / 2} fs={12} bold>
            {r.head}
          </T>
          <Box x={190} y={ys[i]} w={280} h={heights[i]} fill="bg" lines={r.before} fs={11} align="start" />
          <Box x={480} y={ys[i]} w={290} h={heights[i]} fill="box5" lines={r.after} fs={11} align="start" />
        </g>
      ))}
      <T x={20} y={290} fs={11} tone="muted">
        どちらもこの章のアプリで実行した結果。統合は git merge-file で、図 67-2 の PR は同じ相手と1か所で衝突した。
      </T>
    </Svg>
  )
}

/* ---------- 図 67-7 ついでの改善を入れるかの目安 ---------- */
const judgeCells = [
  { x: 110, y: 30, fill: 'box5' as const, lines: ['この PR のコミットに入れる', '名前・定数・使っていない', 'コードの削除'] },
  { x: 440, y: 30, fill: 'box' as const, lines: ['別の PR にする', '改名・クラスの抽出。', 'TODO や Issue に残す'] },
  { x: 110, y: 172, fill: 'box4' as const, lines: ['先にテストを足してから', '入れる（コミット1）'] },
  { x: 440, y: 172, fill: 'box' as const, lines: ['この PR には入れない', '性能の変更は計測から、', '書式は専用の PR で'] },
]

function JudgeFigure() {
  return (
    <Svg
      id="67-7"
      w={780}
      h={390}
      label="ついでの改善を入れるかの目安。横軸は今回の変更からの距離で、左が直すメソッドや同じファイル、右がほかのファイルや関係のない所。縦軸は、振る舞いが変わらないことをテストで確かめられるかで、上が確かめられる、下が確かめられない。左上はこの PR のコミットに入れる（名前、定数、使っていないコードの削除）。右上は別の PR にし、TODO や Issue に残す（改名、クラスの抽出）。左下は先にテストを足してから入れる。右下はこの PR には入れず、性能の変更は計測から、書式は専用の PR で進める。SQL の sum への書き換えは、同じファイルの変更でテストも通ったが、保存前の注文をテストしていなかったので、実際には左下にあった"
    >
      <Arrow x1={100} y1={330} x2={770} y2={330} />
      <Arrow x1={100} y1={330} x2={100} y2={20} />
      <T x={440} y={352} anchor="middle" fs={12}>
        今回の変更からの距離
      </T>
      <T x={110} y={374} fs={11} tone="muted">
        直すメソッド・同じファイル
      </T>
      <T x={770} y={374} fs={11} tone="muted" anchor="end">
        ほかのファイル・関係のない所
      </T>
      <T x={14} y={140} fs={12}>
        テストで
      </T>
      <T x={14} y={158} fs={12}>
        確かめられるか
      </T>
      <T x={14} y={50} fs={11} tone="muted">
        できる
      </T>
      <T x={14} y={300} fs={11} tone="muted">
        できない
      </T>
      {judgeCells.map((c) => (
        <Box key={`${c.x}-${c.y}`} x={c.x} y={c.y} w={320} h={130} fill={c.fill} lines={c.lines} fs={13} bold subTone="muted" />
      ))}
      <circle cx={400} cy={140} r={7} fill="var(--fig-danger)" />
      <Arrow x1={400} y1={148} x2={400} y2={258} dashed />
      <T x={410} y={278} fs={11} tone="danger" anchor="end">
        SQL の sum：テストは通ったが、
      </T>
      <T x={410} y={294} fs={11} tone="danger" anchor="end">
        保存前の注文を確かめていなかった（overuse 節）
      </T>
    </Svg>
  )
}

/* ---------- 図 67-8 名前の変更を3つの PR に分ける ---------- */
const renameSteps = [
  {
    title: 'PR 1：バグの修正',
    lines: ['名前は変えず、TODO を残す', 'bin/rails notes に出る'],
  },
  {
    title: 'PR 2：新しい名前を足す',
    lines: ['shipping_fee を定義し、', 'calc_ship は alias と deprecate', 'メールのビューとテストを直す'],
  },
  {
    title: 'PR 3：古い名前を消す',
    lines: ['警告の出た呼び出し元を直し、', 'alias と deprecate を消す'],
  },
]

function RenameFigure() {
  return (
    <Svg
      id="67-8"
      w={780}
      h={336}
      label="calc_ship を shipping_fee に改名する作業を3つの PR に分けた。PR 1 はバグの修正で、名前は変えずに TODO を残し、bin/rails notes で一覧できる。PR 2 は新しい名前の shipping_fee を定義し、calc_ship は alias_method と deprecate で残し、メールのビューとテストを新しい名前に直す。変え忘れた経理の一覧のジョブは動き続け、DEPRECATION WARNING に呼び出し元のファイルと行が出る。PR 3 は警告の出た呼び出し元を直し、alias と deprecate を消す。比べると、図 67-2 の PR は一度に名前を変え、変え忘れた呼び出し元が NoMethodError になった"
    >
      {renameSteps.map((s, i) => (
        <g key={s.title}>
          <Box x={20 + i * 255} y={20} w={230} h={110} fill={i === 1 ? 'box5' : 'box'} lines={[s.title, ...s.lines]} fs={12} bold subTone="muted" />
          {i < 2 && <Arrow x1={250 + i * 255} y1={75} x2={273 + i * 255} y2={75} />}
        </g>
      ))}
      <Box x={275} y={162} w={485} h={56} fill="bg" dashed lines={['経理の一覧のジョブ（変え忘れた呼び出し元）は動き続け、', 'DEPRECATION WARNING に order_export_job.rb:5 が出る']} fs={12} />
      <Arrow x1={390} y1={130} x2={390} y2={160} />
      <Arrow x1={650} y1={162} x2={650} y2={132} dashed />
      <T x={658} y={150} fs={10} tone="muted">
        直す場所がわかる
      </T>
      <line x1={20} y1={240} x2={760} y2={240} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={20} y={266} fs={12} tone="danger">
        図 67-2 の PR：一度に名前を変え、変え忘れた OrderExportJob を実行すると NoMethodError
      </T>
      <T x={20} y={294} fs={11} tone="muted">
        PR 2 の結果は、この章のアプリで bundle exec rspec と bin/rails runner を実行して確かめた。
      </T>
      <T x={20} y={316} fs={11} tone="muted">
        PR 3 は、警告が出なくなったことを確かめてから出す。
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 86,
  part: 8,
  title: 'Boy Scout Rule：バグの修正のついでに、触った所を少しだけ良くする',
  summary:
    '送料無料の境目のバグを直す場面で、修正に大きなリファクタリングを混ぜた PR と、修正だけを続けた PR の両方を動かし、レビューできない差分と、残った小さな問題から同じ種類のバグがまた起きることを確かめます。Robert C. Martin の『Clean Code』（2008年）と Fowler の記事で原則の定義を確かめ、修正の PR をテスト・整理・修正の3つのコミットに分けて直します。最後に、ついでの改善が振る舞いを変える例と、deprecate・bin/rails notes など Rails で小さな改善を続けるための機能を扱います。',
  goals: [
    '技術的負債とリファクタリング（外から見た振る舞いを変えずに構造を変えること）を、具体的なコードで説明できる',
    'Boy Scout Rule の定義と由来（『Clean Code』と『97 Things Every Programmer Should Know』）、Fowler の機会を見てのリファクタリングとの関係を説明できる',
    'バグの修正の PR に含めてよい改善の範囲を、直す行からの距離と、振る舞いが変わらないことをテストで確かめられるかで判断できる',
    '修正の PR を「テストを書く」「振る舞いを変えずに整える」「振る舞いを変える」のコミットに分け、各コミットを RSpec で確かめられる',
    '公開しているメソッドの名前を、deprecate を使って複数の PR に分けて変えられる',
  ],
  prerequisites: [11, 20, 58, 59],
  sections: [
    {
      id: 'scene',
      title: '送料無料の境目のバグを直す PR と、直されずに残る小さな問題',
      body: (
        <>
          <p>
            この章では、送料の計算のバグを直す場面を例に、<Term en="Boy Scout Rule">ボーイスカウト・ルール</Term>を扱います。Boy Scout Rule は触ったコードを以前より少し良い状態にして戻し、技術的負債を少しずつ減らしていく、という原則です。まず、修正に大きなリファクタリングを混ぜた PR と、修正だけを続けた PR の両方を動かし、それぞれで何が起きるかを確かめます。
          </p>
          <h3>そもそもリファクタリングと技術的負債とは</h3>
          <p>次の2つのメソッドは、書き方は違いますが、どんな小計を渡しても同じ送料を返します。</p>
          <Code
            lang="ruby"
            title="同じ振る舞いの2つの書き方"
            code={`
# 書き方1
def calc_ship
  st = subtotal
  if st > 5000
    0
  else
    600
  end
end

# 書き方2
FREE_SHIPPING_THRESHOLD = 5_000
SHIPPING_FEE = 600

def calc_ship
  subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
end
`}
          />
          <p>
            書き方1を書き方2に変えても、送料の計算の結果は変わりません。変わるのは、数字の意味が名前で読めることと、境目の金額を変えるときに直す場所が定数の1行になることです。このように、外から見た振る舞いを変えずに、コードの内部の構造を変えることを<Term en="refactoring">リファクタリング</Term>と呼びます<Ref n={8} />。
          </p>
          <p>
            反対に、意味の読めない変数名、何か所にも書かれた同じ数字、どこからも呼ばれないメソッドは、今は正しく動いていても、次にコードを変える人の手間と誤りを増やします。こうした状態を<Term en="technical debt">技術的負債</Term>と呼びます。借金の利子のように、直さずに置いておくほど、その後の変更のたびに余分な時間がかかるという意味の言葉です。
          </p>
          <p>
            チームの開発では、コードの変更を<Term en="commit">コミット</Term>（変更の1単位の記録）に分けて記録し、いくつかのコミットをまとめた<Term en="pull request">プルリクエスト（PR）</Term>をほかの開発者がレビューしてから、main ブランチに取り込みます。Boy Scout Rule は PR を出すたびに、触ったコードを少し良くしておく、という進め方です。どこまでを1つの PR に入れるかが、この章の問題になります。
          </p>
          <h3>送料の計算と、問い合わせ</h3>
          <p>
            EC サイトの送料は、注文の小計（明細の金額の合計）が 5,000円以上なら無料、それより少なければ全国一律 600円です。2024年4月に送料を 800円から 600円に下げたとき、開発者は calc_ship を新しく書き、それまでのメソッドを old_calc_ship という名前で残しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（直す前）"
            code={`
class Order < ApplicationRecord
  has_many :line_items, dependent: :destroy

  def subtotal
    line_items.sum { |li| li.unit_price * li.quantity }
  end

  # 送料
  def calc_ship
    st = subtotal
    if st > 5000
      0
    else
      600
    end
  end

  def total
    subtotal + calc_ship
  end

  # 2024年3月までの送料（800円）
  def old_calc_ship
    subtotal >= 5000 ? 0 : 800
  end
end
`}
          />
          <p>カートの画面には送料無料まであといくら買えばよいかを出します。この表示はヘルパーで作っています。</p>
          <Code
            lang="ruby"
            title="app/helpers/carts_helper.rb（直す前）"
            code={`
module CartsHelper
  # カートの画面に出す、送料無料までの残りの金額
  def free_shipping_message(order)
    rest = 5_000 - order.subtotal
    if rest <= 0
      "送料無料"
    else
      "あと#{rest.to_fs(:delimited)}円で送料無料"
    end
  end
end
`}
          />
          <p>
            calc_ship は Order の total のほかに、注文の確認のメールのビュー（<code>app/views/order_mailer/confirmation.text.erb</code>）と、経理に渡す注文の一覧をタブ区切りのファイルに書き出すジョブ（<code>OrderExportJob</code>）から呼ばれています。テストには小計 3,000円と 8,000円の送料、合計、ヘルパーの表示（小計 3,800円と 6,000円）、メールの本文の例があり、すべて通っています。
          </p>
          <p>
            ある日、カスタマーサポートに「カートには送料無料と出ていたのに、確認のメールでは送料が 600円になっている」という問い合わせが来ました。小計がちょうど 5,000円の注文です。同じ注文を作って、カートの表示とメールの本文を出すスクリプトで再現しました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/bug_report.rb）"
            code={`
小計: 5000円
カートの表示: 送料無料
確認のメール:
小計：5,000円
送料：600円
合計：5,600円
`}
          />
          <Figure n="67-1" title="送料の計算に関係するクラスと、問題のある箇所" caption="実線の矢印はメソッドの呼び出し。①〜④は、この節で扱う問題。">
            <SceneFigure />
          </Figure>
          <p>
            図 67-1 のとおり、送料無料かどうかの判断が2か所にあります。Order の calc_ship は <code>st {'>'} 5000</code>（5,000円より大きい）で比べ、CartsHelper は <code>rest {'<='} 0</code>（5,000円以上）で比べているので、ちょうど 5,000円のときだけ結果が食い違いました。バグそのものは <code>{'>'}</code> を <code>{'>='}</code> に変えれば直ります。ただ、その周りには、同じ数字が3か所にあること、使っていないメソッドがあること、境目のテストがないことという、小さな問題が残っています。
          </p>
          <h3>修正にリファクタリングを混ぜた PR</h3>
          <p>
            担当の開発者はバグを直すついでに送料のコードをまとめて書き直しました。送料の計算を ShippingFee という新しいクラスに移し、calc_ship を shipping_fee に改名し、old_calc_ship を消し、LineItem に数量の検証を足し、メーラーの書式も整えました。Order の差分は次のようになります。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index で取った order.rb の差分）"
            code={`
@@ -2,25 +2,18 @@ class Order < ApplicationRecord
   has_many :line_items, dependent: :destroy

   def subtotal
-    line_items.sum { |li| li.unit_price * li.quantity }
+    line_items.sum { |item| item.unit_price * item.quantity }
   end

-  # 送料
-  def calc_ship
-    st = subtotal
-    if st > 5000
-      0
-    else
-      600
-    end
+  def shipping
+    ShippingFee.new(subtotal)
   end

-  def total
-    subtotal + calc_ship
+  def shipping_fee
+    shipping.amount
   end

-  # 2024年3月までの送料（800円）
-  def old_calc_ship
-    subtotal >= 5000 ? 0 : 800
+  def total
+    subtotal + shipping_fee
   end
 end
`}
          />
          <p>
            バグの原因だった <code>if st {'>'} 5000</code> の行は消えた行の中にあり、直した比べ方 <code>subtotal {'>='} FREE_THRESHOLD</code> は新しいファイル shipping_fee.rb の中にあります。レビューする人は2つのファイルを見比べないと、境目の扱いが変わったことに気づけません。PR 全体の差分は次のとおりです。
          </p>
          <Figure n="67-2" title="修正にリファクタリングを混ぜた PR の差分" caption="git diff --stat の結果を棒にした。右端の赤い文字はレビューで見落としやすい変更。">
            <BigPrFigure />
          </Figure>
          <p>
            図 67-2 の9つのファイルには、バグの修正、新しいクラス、改名、振る舞いを変える検証、書式だけの変更が混ざっています。RSpec は 11 examples, 0 failures で通りました。しかし、この PR で変えなかったファイルに、古い名前の呼び出しが残っていました。経理の一覧を作るジョブにはテストがなかったので、RSpec では見つかりません。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/export_orders.rb。2行目以降は一部を省略）"
            code={`
/work/gems/ruby/4.0.0/gems/activemodel-8.1.4.1/lib/active_model/attribute_methods.rb:512:in 'ActiveModel::AttributeMethods#method_missing': undefined method 'calc_ship' for an instance of Order (NoMethodError)
	from /work/gems/ruby/4.0.0/gems/activerecord-8.1.4.1/lib/active_record/attribute_methods.rb:497:in 'ActiveRecord::AttributeMethods#method_missing'
	from /work/ch86big/app/jobs/order_export_job.rb:5:in 'block in OrderExportJob#perform'
	# …（省略）
`}
          />
          <p>
            同じ時期に、別の開発者がポイントで支払う機能を作っていて、Order の total を <code>subtotal + calc_ship - used_points</code> に変えるブランチを開いていました。そのブランチの order.rb と、この PR の order.rb を、元の order.rb を共通の祖先として git merge-file で統合しました。
          </p>
          <Code
            lang="text"
            title="実行結果（git merge-file -p big.rb base.rb points.rb。終了コードは 1 で、衝突は1か所）"
            code={`
<<<<<<< big.rb
  def shipping_fee
    shipping.amount
=======
  # 使ったポイントを合計から引く
  def total
    subtotal + calc_ship - used_points
>>>>>>> points.rb
  end
`}
          />
          <p>
            この PR は order.rb のほとんどの行を書き換えたので、total に1行を足しただけのブランチとも衝突しました。衝突を解くときには、ポイントのブランチが使っている calc_ship が、もう存在しないことにも気づく必要があります。
          </p>
          <h3>修正だけを続けた PR</h3>
          <p>
            この経験から、チームは「バグの修正の PR には修正だけを入れる」と決めました。同じバグを直す PR の差分はorder.rb の1行と境目のテストの4行です（2 files changed, 5 insertions(+), 1 deletion(-)）。
          </p>
          <Code
            lang="text"
            title="実行結果（修正だけの PR の差分。diff -u）"
            code={`
   def calc_ship
     st = subtotal
-    if st > 5000
+    if st >= 5000
       0
     else
       600
`}
          />
          <p>
            RSpec は 8 examples, 0 failures で通り、小計 5,000円の注文の送料は 0円になりました。レビューもすぐに終わりました。3か月後、送料無料の境目を 6,000円に上げることになり、別の開発者が担当しました。まず、5000 と書かれた場所を探しました。
          </p>
          <Code
            lang="text"
            title='実行結果（grep -rn "5000" app）'
            code={`
app/models/order.rb:11:    if st >= 5000
app/models/order.rb:24:    subtotal >= 5000 ? 0 : 800
`}
          />
          <p>
            2行目は使われていない old_calc_ship なので、開発者は1行目だけを 6000 に変え、テストの境目の例も 6,000円に直しました。CartsHelper は <code>5_000</code> と書いてあるので、grep に出ませんでした。RSpec は 8 examples, 0 failures で通りました。小計 5,500円の注文で同じスクリプトを実行した結果です。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/bug_report.rb 5500）"
            code={`
小計: 5500円
カートの表示: 送料無料
確認のメール:
小計：5,500円
送料：600円
合計：6,100円
`}
          />
          <p>
            最初の問い合わせと同じ種類の食い違いが、別の金額で起きました。修正だけの PR は、それぞれは小さく正しい変更でした。それでも、同じ数字が別の書き方で2か所に残り、使っていないメソッドが grep の結果に出て、ヘルパーに境目のテストがないままだったので、次の変更でバグが入りました。
          </p>
          <p>
            1つ目の PR は触った所より広く書き直したために、レビューできず、変え忘れと衝突を生みました。2つ目のやり方は触った所の小さな問題を残したために、次の変更で同じバグを生みました。Boy Scout Rule はこの2つの間で、どこまで直すかを決めるための原則です。
          </p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'Boy Scout Rule の意味と由来：チェックアウトしたときより少しきれいにして戻す',
      body: (
        <>
          <h3>Boy Scout Rule の定義</h3>
          <p>
            Boy Scout Rule は触ったコードを以前より少し良い状態にする、という原則です。1回ごとの改善は小さくてよく、それを毎回続けることで、技術的負債を継続的に減らします。前の節の例に当てはめると、次のようになります。
          </p>
          <ul>
            <li>「触ったコード」はバグを直すために開いた calc_ship と、その周りの order.rb、同じ境目を扱う CartsHelper です。送料と関係のない LineItem や、ほかの開発者が変えている所は含みません。</li>
            <li>「少し良い状態」は境目の数字を定数にする、使っていない old_calc_ship を消す、境目のテストを足す、といった変更です。送料の計算を新しいクラスに作り直すことは、少しの範囲を超えています。</li>
            <li>「以前より」は、誰が書いたコードかに関係なく、自分が触る前の状態と比べます。</li>
          </ul>
          <h3>『Clean Code』（2008年）の第1章</h3>
          <p>
            Robert C. Martin は2008年に出版した『Clean Code: A Handbook of Agile Software Craftsmanship』の第1章に「The Boy Scout Rule」という節を置きました<Ref n={1} />。コードはうまく書くだけでは足りず、時間がたっても読みやすく保つ必要がある、時間とともにコードが劣化していくのは誰もが見てきたので、それを防ぐために自分から動く必要がある、と書いたうえで、アメリカのボーイスカウトには「キャンプ場を、来たときよりもきれいにして去る」という簡単な決まりがあり、それを自分たちの仕事にも当てはめられる、と述べています<Ref n={1} />。
          </p>
          <p>
            節の中心の文は、全員がコードをチェックアウトしたとき（作業のために取り出したとき）より少しきれいにしてチェックインすれば、コードが劣化することはない、というものです。きれいにするのは大きなことでなくてよいとして、変数の名前を1つ良くする、少し大きすぎる関数を1つ分ける、小さな重複を1つ消す、複雑な if 文を1つ整理する、という例を挙げています<Ref n={1} />。この決まりは、ボーイスカウトを始めた Robert Stephenson Smyth Baden-Powell がスカウトに残した最後のメッセージ「この世界を、来たときより少し良くして去るよう努めなさい」を言い換えたものだと、脚注に書かれています<Ref n={1} />。
          </p>
          <p>
            この章で確かめられた資料のうち、Boy Scout Rule をプログラミングの原則として書いたものでは、この本が最も古いものです。Martin がこれより前に講演や記事で同じことを述べていたかどうかは、確かめていません。
          </p>
          <h3>『97 Things Every Programmer Should Know』（2010年）の小論</h3>
          <p>
            Kevlin Henney が編集し O'Reilly が2010年に出版した『97 Things Every Programmer Should Know』にも、Martin は「The Boy Scout Rule」という小論を書いています<Ref n={2} />。この小論は決まりを「モジュールは、チェックアウトしたときよりきれいにしてチェックインする」と書き直し、元の作者が誰であっても、どんなに小さくてもモジュールを良くする努力をしよう、と呼びかけています<Ref n={2} />。
          </p>
          <ul>
            <li>チェックインする前にモジュールを完全にする必要はなく、チェックアウトしたときより少し良くすれば足りる。</li>
            <li>そのためには、モジュールに足すコードはきれいに書き、そのうえで、チェックインする前にほかに少なくとも1つをきれいにする。</li>
            <li>例として、変数の名前を1つ良くする、長い関数を2つに分ける、循環した依存を断ち切る、方針と詳細を分けるためのインターフェースを足す、を挙げる。</li>
            <li>この決まりを全員が守れば、システムは変わっていくにつれて少しずつ良くなり、個人が自分の担当の部分だけでなく、チームがシステム全体を気にかけるようになる。</li>
          </ul>
          <p>
            方針と詳細を分けることは<ChapterLink n={87} />で扱います。この小論は CC BY-NC-SA 3.0 で公開され、GitHub のリポジトリでも読めます<Ref n={2} />。
          </p>
          <h3>Fowler の機会を見てのリファクタリング</h3>
          <p>
            Martin Fowler は2011年の記事「Opportunistic Refactoring」で、リファクタリングを工程の中の特別な作業にせず、コードを整える必要があればいつでもどこでも、誰でも行う作業にすることを勧めています。わかりにくいコードを見つけたら、その場で、少なくとも数分のうちに直す。これはよくキャンプ場の決まり（camp site rule）と呼ばれ、コードを見つけたときより良い状態にして去ることだと説明しています<Ref n={3} />。この記事はほかにも次のことを書いています<Ref n={3} />。
          </p>
          <ul>
            <li>機会は新しい機能を作るときやバグを直すときのいろいろな場面にある。作り始める前に、既存のクラスの API を変えておけば作業が楽になるとわかったら、先にそれを直す（準備のためのリファクタリング）。</li>
            <li>別の作業の途中で機会に気づいたら、今の考えを中断せずにメモしておき、同じ日のうちに、作業を終えたことにする前に戻ってくる。</li>
            <li>1つを直すと別の問題が見つかり、きりがなくなる危険がある。いつ切り上げるかには良い判断が必要で、理想の形にするのは次に来たときに回してもよい。</li>
            <li>いつも少しずつ良くしていれば、それを繰り返すうちに、よく手を入れる場所が大きく良くなる。そこは、きれいなコードの価値が最も高い場所でもある。</li>
            <li>テストの弱い所を触るときは、深入りしすぎない範囲でテストを1つ2つ足すのは理にかなっている。</li>
            <li>コードの持ち主を厳しく決めることや、フィーチャーブランチは、この種のリファクタリングを妨げる。ブランチが数日より長く続くと、統合が難しくなるからである。</li>
          </ul>
          <p>
            前の節の大きな PR は1つ目の危険（直し始めて止まらなくなること）と、最後の問題（ほかのブランチとの衝突）の両方に当たりました。また、Fowler は作業している所から離れた場所の問題でも、別の日に回すとその日は来ないことが多いので、今直すことを勧めています<Ref n={3} />。PR とレビューで進めるチームでは、離れた場所の改善はバグの修正の PR に混ぜず、別の小さな PR にしてすぐに出す、という形で取り入れられます。
          </p>
          <h3>2つの帽子：振る舞いを保つ変更と、機能を変える変更</h3>
          <p>
            Fowler は2015年の記事で、Kent Beck の「2つの帽子」というたとえを紹介しています。プログラミングをしている人は、リファクタリングをしているか、機能を足しているかのどちらかの状態にあります。リファクタリングをしているときは、どの変更も外から見える振る舞いを保ち、テストは通ったままです。機能を足しているときは、テストを足し、既存のテストを落としもするので、作業の見通しが立てにくくなります<Ref n={4} />。同じ記事は Beck の「まず変更を簡単にし、それから簡単な変更をする」という言葉も引いています<Ref n={4} />。
          </p>
          <p>
            バグの修正も送料の結果を変えるので機能を変える側の変更です。整える変更と同じコミットに入れると、テストが落ちたときに、どちらの変更が原因かを切り分けられません。次の節では、この2つを別のコミットに分けます。
          </p>
          <h3>技術的負債という言葉</h3>
          <p>
            技術的負債の言葉は、Ward Cunningham が1992年の OOPSLA の経験報告「The WyCash Portfolio Management System」で使った借金のたとえから来ています。初めて書いたコードを出荷するのは借金をするようなもので、すぐに書き直して返すなら、少しの借金は開発を速くする。危ないのは返さないときで、正しくないコードの上で使う時間は、すべてその借金の利子になる、と書いています<Ref n={6} />。
          </p>
          <p>Boy Scout Rule はこの借金を触った場所で少しずつ返していく進め方です。前の節の2つの進め方で、送料無料の境目に関する負債がどう変わったかを、この章のアプリで数えました。</p>
          <Figure n="67-3" title="技術的負債が増える過程と減る過程" caption="上の行は scene 節の修正だけの PR、下の行は apply 節で直した PR。">
            <DebtFigure />
          </Figure>
          <p>
            図 67-3 の上の行では、バグを直しても負債はほとんど減らず、次の変更で食い違いになりました。下の行では、バグの修正の PR で、境目の数字が定数の1か所になり、使っていないメソッドがなくなり、境目のテストが5件になったので、次の変更が定数の1行で済み、テストがヘルパーとモデルの両方を確かめました。
          </p>
          <h3>似た原則との違い</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則・考え方</th>
                  <th scope="col">何を勧めるか</th>
                  <th scope="col">Boy Scout Rule との関係</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">割れ窓を放置しない（『達人プログラマー』）</th>
                  <td>悪い設計、誤った判断、質の悪いコードを、見つけたときに直す<Ref n={7} /></td>
                  <td>放置された問題がさらに問題を呼ぶ、という同じ動機。Boy Scout Rule は触ったモジュールを戻すときに少し良くする、という単位で書いている</td>
                </tr>
                <tr>
                  <th scope="row">機会を見てのリファクタリング（Fowler）</th>
                  <td>わかりにくいコードに気づいたら、その場で直す<Ref n={3} /></td>
                  <td>同じ考え方。Fowler 自身が camp site rule と呼ばれると書いている</td>
                </tr>
                <tr>
                  <th scope="row">準備のためのリファクタリング</th>
                  <td>機能を足す前に、足しやすい構造に直す<Ref n={4} /></td>
                  <td>この章のコミット2（境目を定数にしてからバグを直す）はこの形</td>
                </tr>
                <tr>
                  <th scope="row">YAGNI（<ChapterLink n={58} />）</th>
                  <td>今必要のない機能を作らない</td>
                  <td>使っていないメソッドを消すことは、YAGNI にも合う。将来のための ShippingFee のクラスを先に作ることは、少しの改善の範囲を超え、YAGNI にも反する</td>
                </tr>
                <tr>
                  <th scope="row">DRY（<ChapterLink n={59} />）</th>
                  <td>同じ知識を複数の場所に持たない</td>
                  <td>境目の数字の重複は DRY の問題。Boy Scout Rule はそれを直す時期を「その場所を触ったとき」に決める</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'apply',
      title: 'バグの修正の PR を、テスト・整理・修正の3つのコミットに分ける',
      body: (
        <>
          <p>
            scene 節の直す前のコードから、もう一度バグの修正の PR を作ります。手順は4つです。触る範囲を決め、今の振る舞いをテストに書き、振る舞いを変えずに整え、最後にバグを直します。手順2〜4はそれぞれ1つのコミットにします。
          </p>
          <h3>手順1：触る範囲を決める</h3>
          <p>最初に、直すメソッドがどこから呼ばれているかを調べます。</p>
          <Code
            lang="text"
            title='実行結果（grep -rn "calc_ship" app。直す前のコード）'
            code={`
app/views/order_mailer/confirmation.text.erb:2:送料：<%= @order.calc_ship.to_fs(:delimited) %>円
app/jobs/order_export_job.rb:5:    lines = orders.map { |o| [o.id, o.subtotal, o.calc_ship, o.total].join("\\t") }
app/models/order.rb:9:  def calc_ship
app/models/order.rb:19:    subtotal + calc_ship
app/models/order.rb:23:  def old_calc_ship
`}
          />
          <p>
            calc_ship は Order の total、メールのビュー、経理の一覧のジョブの3か所から呼ばれています。この結果と図 67-1 の問題をもとに、この PR に入れる改善を決めました。
          </p>
          <Figure n="67-4" title="バグの修正の PR に含めてよい改善の範囲" caption="内側の四角ほど、直す行に近い。右端はその改善をどの PR で行うか。">
            <ScopeFigure />
          </Figure>
          <ul>
            <li>境目の数字を定数にし、CartsHelper もその定数を使うようにします。CartsHelper の比べ方はバグの片側なので、同じ境目の知識として今回の範囲に入れます。</li>
            <li>使っていない old_calc_ship を消します。grep の結果に出て、境目を変える人を迷わせるからです。</li>
            <li>calc_ship を shipping_fee に改名するのは、別の PR にします。呼び出し元が3か所あり、ポイントのブランチのように、ほかの開発者の作業中のコードも calc_ship を呼んでいるからです。</li>
            <li>ShippingFee クラスへの抽出はしません。送料の規則は今は1つだけで、クラスを分ける理由になる2つ目の規則がまだないからです（<ChapterLink n={58} />）。</li>
            <li>LineItem の検証を足すこととファイル全体の書式を変えることは、送料のバグと関係がないので入れません。</li>
          </ul>
          <h3>手順2：今の振る舞いをテストに書く（コミット1）</h3>
          <p>
            整える前に、境目の前後の振る舞いをテストに書きます。モデルには小計 4,999円と 5,001円、ヘルパーには 4,999円とちょうど 5,000円の例を足しました。
          </p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb と spec/helpers/carts_helper_spec.rb（足した例）"
            code={`
  # spec/models/order_spec.rb
  it "小計が 4,999円なら送料は 600円" do
    expect(order_of(4999).calc_ship).to eq(600)
  end

  it "小計が 5,001円なら送料は無料" do
    expect(order_of(5001).calc_ship).to eq(0)
  end

  # spec/helpers/carts_helper_spec.rb
  it "小計が 4,999円なら、あと 1円と出す" do
    expect(helper.free_shipping_message(order_of(4999))).to eq("あと1円で送料無料")
  end

  it "小計がちょうど 5,000円なら、送料無料と出す" do
    expect(helper.free_shipping_message(order_of(5000))).to eq("送料無料")
  end
`}
          />
          <p>
            モデルの「ちょうど 5,000円」の例は、ここでは足しません。今のコードの 5,000円の振る舞いはバグそのものなので、送料 600円を正しい値としてテストに書くことになるからです。この例は手順4で、正しい値（0円）を書いて足します。このコミットの後の RSpec は 11 examples, 0 failures でした。
          </p>
          <h3>手順3：振る舞いを変えずに整える（コミット2）</h3>
          <p>old_calc_ship を消す前に、呼び出しがないことを確かめます。</p>
          <Code
            lang="text"
            title='実行結果（grep -rn "old_calc_ship" app spec lib script config）'
            code={`
app/models/order.rb:23:  def old_calc_ship
`}
          />
          <p>
            定義の行だけが出ました。文字列からメソッドを呼ぶ <code>send</code> などを使っていると grep では見つからないので、メソッド名を組み立てる箇所がないことも確かめておきます。このアプリにはありませんでした。整えた差分は次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（コミット2の差分。git diff --no-index）"
            code={`
--- a/s1/app/helpers/carts_helper.rb
+++ b/s2/app/helpers/carts_helper.rb
@@ -1,7 +1,7 @@
 module CartsHelper
   # カートの画面に出す、送料無料までの残りの金額
   def free_shipping_message(order)
-    rest = 5_000 - order.subtotal
+    rest = Order::FREE_SHIPPING_THRESHOLD - order.subtotal
     if rest <= 0
       "送料無料"
     else
--- a/s1/app/models/order.rb
+++ b/s2/app/models/order.rb
@@ -1,4 +1,7 @@
 class Order < ApplicationRecord
+  FREE_SHIPPING_THRESHOLD = 5_000 # 送料無料になる小計の境目
+  SHIPPING_FEE = 600
+
   has_many :line_items, dependent: :destroy

   def subtotal
@@ -6,21 +9,12 @@ class Order < ApplicationRecord
   end

   # 送料
+  # TODO: calc_ship を shipping_fee に改名する（メールと経理の一覧から呼ばれているので、別の PR で）
   def calc_ship
-    st = subtotal
-    if st > 5000
-      0
-    else
-      600
-    end
+    subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
   end

   def total
     subtotal + calc_ship
   end
-
-  # 2024年3月までの送料（800円）
-  def old_calc_ship
-    subtotal >= 5000 ? 0 : 800
-  end
 end
`}
          />
          <p>
            calc_ship の比べ方はわざと <code>{'>'}</code> のまま残しています。CartsHelper の <code>rest {'<='} 0</code> と比べ方をそろえると、どちらか一方の振る舞いが変わるからです。このコミットは振る舞いを変えないことだけを目的にしているので、比べ方を変えるのは次のコミットにします。テストは1行も変えずに、RSpec は 11 examples, 0 failures のままでした。テストを変えずに通ったことが、このコミットが振る舞いを変えていないことの確認になります。
          </p>
          <h3>手順4：バグを直す（コミット3）</h3>
          <p>先に、正しい振る舞いをテストに書きます。</p>
          <Code
            lang="ruby"
            title="spec/models/order_spec.rb（足した例）"
            code={`
  it "小計がちょうど 5,000円なら送料は無料" do
    expect(order_of(5000).calc_ship).to eq(0)
  end
`}
          />
          <Code
            lang="text"
            title="実行結果（コードを直す前に bundle exec rspec spec/models/order_spec.rb）"
            code={`
Failures:

  1) Order 小計がちょうど 5,000円なら送料は無料
     Failure/Error: expect(order_of(5000).calc_ship).to eq(0)

       expected: 0
            got: 600

       (compared using ==)
     # ./spec/models/order_spec.rb:19:in 'block (2 levels) in <top (required)>'

Finished in 0.09603 seconds (files took 0.79494 seconds to load)
6 examples, 1 failure
`}
          />
          <p>足した例が問い合わせと同じ値（600円）で失敗することを確かめてから、比べ方を直します。</p>
          <Code
            lang="text"
            title="実行結果（コミット3の app の差分。git diff --no-index）"
            code={`
--- a/s2/app/models/order.rb
+++ b/s3/app/models/order.rb
@@ -1,5 +1,5 @@
 class Order < ApplicationRecord
-  FREE_SHIPPING_THRESHOLD = 5_000 # 送料無料になる小計の境目
+  FREE_SHIPPING_THRESHOLD = 5_000 # 小計がこの金額以上なら送料無料
   SHIPPING_FEE = 600

   has_many :line_items, dependent: :destroy
@@ -11,7 +11,7 @@ class Order < ApplicationRecord
   # 送料
   # TODO: calc_ship を shipping_fee に改名する（メールと経理の一覧から呼ばれているので、別の PR で）
   def calc_ship
-    subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
+    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
   end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation と、bin/rails runner script/bug_report.rb）"
            code={`
CartsHelper
  小計が 3,800円なら、あと 1,200円と出す
  小計が 4,999円なら、あと 1円と出す
  小計がちょうど 5,000円なら、送料無料と出す
  小計が 6,000円なら、送料無料と出す

OrderMailer
  注文の確認のメールに、小計・送料・合計を書く

Order
  小計が 3,000円なら送料は 600円
  小計が 4,999円なら送料は 600円
  小計がちょうど 5,000円なら送料は無料
  小計が 5,001円なら送料は無料
  小計が 8,000円なら送料は無料
  合計は小計と送料の和

環境
  MySQL 8.4 につながる

12 examples, 0 failures

小計: 5000円
カートの表示: 送料無料
確認のメール:
小計：5,000円
送料：0円
合計：5,000円
`}
          />
          <Figure n="67-5" title="コミットの分け方" caption="上の帯は、そのコミットが振る舞いを保つ変更か、変える変更か。">
            <CommitsFigure />
          </Figure>
          <p>
            図 67-5 のように、振る舞いを保つ変更（コミット1と2）と、振る舞いを変える変更（コミット3）を分けました。PR 全体の差分は4つのファイルで26行を足し12行を消したもので、修正だけの PR より大きくなります。それでも、レビューする人はコミットを1つずつ読めば、コミット2ではテストが変わっていないこと、コミット3では2行だけが変わったことを確かめられます。
          </p>
          <h3>PR の説明と、残した問題</h3>
          <p>PR の説明にはコミットごとに何をしたかと、何をしなかったかを書きます。</p>
          <Code
            lang="text"
            title="PR の説明（例）"
            code={`
小計がちょうど 5,000円の注文に送料 600円がかかるバグを直します。

- コミット1：境目（4,999円・5,000円・5,001円）の今の振る舞いをテストに書きました
- コミット2：境目の数字を Order の定数にし、CartsHelper もそれを使うようにしました。
  使っていない old_calc_ship を消しました。振る舞いは変えていません（テストを変えずに通ります）
- コミット3：calc_ship の比べ方を > から >= に直し、5,000円の例を足しました

しなかったこと：calc_ship の shipping_fee への改名（呼び出し元が3か所あるので、別の PR にします。TODO を残しました）
`}
          />
          <p>
            コードに残した TODO は <code>bin/rails notes</code> で一覧できます。既定では TODO・FIXME・OPTIMIZE の3つの印を探します<Ref n={14} />。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails notes）"
            code={`
app/models/order.rb:
  * [12] [TODO] calc_ship を shipping_fee に改名する（メールと経理の一覧から呼ばれているので、別の PR で）
`}
          />
          <h3>直した後の変更</h3>
          <p>
            この PR の order.rb を、scene 節のポイントのブランチと git merge-file で統合すると、終了コードは 0 で、衝突はありませんでした。この PR は calc_ship の名前を変えず、total の行にも触れていないからです。
          </p>
          <p>3か月後に境目を 6,000円に上げるときは、定数の1行を変えます。</p>
          <Code
            lang="text"
            title="実行結果（境目を変えた差分と、テストの数字を直す前の bundle exec rspec。失敗の詳細は省略）"
            code={`
-  FREE_SHIPPING_THRESHOLD = 5_000 # 小計がこの金額以上なら送料無料
+  FREE_SHIPPING_THRESHOLD = 6_000 # 小計がこの金額以上なら送料無料

12 examples, 5 failures
Failed examples:
rspec ./spec/helpers/carts_helper_spec.rb:10 # CartsHelper 小計が 3,800円なら、あと 1,200円と出す
rspec ./spec/helpers/carts_helper_spec.rb:14 # CartsHelper 小計が 4,999円なら、あと 1円と出す
rspec ./spec/helpers/carts_helper_spec.rb:18 # CartsHelper 小計がちょうど 5,000円なら、送料無料と出す
rspec ./spec/models/order_spec.rb:18 # Order 小計がちょうど 5,000円なら送料は無料
rspec ./spec/models/order_spec.rb:22 # Order 小計が 5,001円なら送料は無料
`}
          />
          <p>
            境目を書いたテストが CartsHelper と Order の両方で落ちました。2か所とも定数に従って新しい境目で動いたということです。テストの金額を新しい境目に合わせて直すと、12 examples, 0 failures になり、小計 5,500円の注文は次のようになりました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/bug_report.rb 5500）"
            code={`
小計: 5500円
カートの表示: あと500円で送料無料
確認のメール:
小計：5,500円
送料：600円
合計：6,100円
`}
          />
          <Figure n="67-6" title="修正だけの PR と、触った所を少し良くした PR の比較" caption="左は scene 節の修正だけの PR、右はこの節の PR。どちらもその後に同じ変更をした結果。">
            <CompareFigure />
          </Figure>
          <p>
            図 67-6 のとおり、バグの修正の時点では、右の PR のほうが差分は大きくなります。その代わり、次にしきい値を変えた人は定数の1行を変えればよく、変え忘れた場所はテストの失敗として現れました。左の PR では、テストがすべて通ったまま、カートとメールの表示が食い違いました。
          </p>
        </>
      ),
    },
    {
      id: 'overuse',
      title: 'ついでの改善が振る舞いを変え、PR を広げるとき',
      body: (
        <>
          <p>
            Boy Scout Rule を守ろうとすると、触った所に見つけた問題をすべて直したくなります。ここでは、振る舞いを変えないつもりで入れた改善が振る舞いを変えた例と、改善を義務にしたときに起きることを扱います。
          </p>
          <h3>N+1 を減らすつもりで、合計を SQL に変えた</h3>
          <p>
            前の節のコミット2を作るとき、開発者が subtotal も「整えて」いたとします。明細の数だけ Ruby で掛け算をするより、SQL で合計したほうが速いと考え、次のように1行を変えました。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（ついでに変えた subtotal）"
            code={`
  def subtotal
    line_items.sum("unit_price * quantity") # N+1 を減らすため SQL で合計する
  end
`}
          />
          <p>
            RSpec は 12 examples, 0 failures で通りました。テストは変えていないので、コミット2の確かめ方では振る舞いを変えていないことになります。次のスクリプトで、保存する前の注文（カートの確認画面で作る注文）の小計と、経理の一覧を作るときに発行される SELECT の数を、直す前と後で比べました。
          </p>
          <Code
            lang="ruby"
            title="script/compare_subtotal.rb"
            code={`
# 保存前の注文（カートの確認画面）と、経理の一覧で、小計の求め方を比べる
cart = Order.new(email: "a@example.com")
cart.line_items.build(product_name: "紅茶", unit_price: 3200, quantity: 1)
cart.line_items.build(product_name: "焼き菓子", unit_price: 2000, quantity: 1)
puts "保存前の注文: 小計 #{cart.subtotal}円、送料 #{cart.calc_ship}円"

3.times do |i|
  order = Order.create!(email: "#{i}@example.com")
  order.line_items.create!(product_name: "紅茶", unit_price: 1000, quantity: 1)
end
selects = 0
counter = ->(*, payload) { selects += 1 if payload[:sql].start_with?("SELECT") }
ActiveSupport::Notifications.subscribed(counter, "sql.active_record") do
  OrderExportJob.perform_now(Date.current)
end
puts "経理の一覧（注文3件）を作るときの SELECT: #{selects}回"
Order.destroy_all
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/compare_subtotal.rb。上はブロックの sum、下は SQL の sum）"
            code={`
保存前の注文: 小計 5200円、送料 0円
経理の一覧（注文3件）を作るときの SELECT: 2回

保存前の注文: 小計 0円、送料 600円
経理の一覧（注文3件）を作るときの SELECT: 14回
`}
          />
          <p>2つの点で振る舞いが変わりました。</p>
          <ul>
            <li>
              保存する前の注文の小計が 0円になり、送料が 600円になりました。ブロックを渡した sum は読み込んだ明細の配列を Ruby で合計し、まだ保存していない明細も数えます。引数に式を渡した sum は SQL の SUM を発行し、保存した明細だけを数えます。注文そのものが保存されていないときは、空のスコープで計算して 0 を返します<Ref n={16} />。
            </li>
            <li>
              経理の一覧のジョブの SELECT が2回から14回に増えました。ジョブは <code>includes(:line_items)</code> で明細を先に読み込んでいますが、SQL の sum は読み込んだ明細を使わずに毎回 SUM を発行します。1件の注文につき、subtotal・calc_ship・total の中で subtotal が4回呼ばれるので、3件で12回の SUM が増えました。includes で先に読み込む仕組みは<ChapterLink n={13} section="includes" />で扱いました。
            </li>
          </ul>
          <p>
            テストは保存した注文だけを使っていたので、どちらの変化も確かめていませんでした。「テストを変えずに通った」ことが振る舞いを保った確認になるのは、変えた所の振る舞いをテストが確かめているときだけです。速さを理由にした変更は振る舞いの変わりうる変更として扱い、計測してから別の PR で行います（<ChapterLink n={90} />）。
          </p>
          <h3>改善を毎回の義務にしたとき</h3>
          <p>
            「どの PR にも、改善を1つ以上入れる」とチームで決めると、改善の対象を探して、直す必要のない所まで変えるようになります。よく起きるのは、次のような変更です。
          </p>
          <ul>
            <li>触っていないファイルの書式や書き方を変える。差分が増え、同じファイルを変えているほかのブランチと衝突します。scene 節の大きな PR は order.rb の書式と構成を変えたため、total に1行を足しただけのブランチと衝突しました。</li>
            <li>好みの書き方に変える。if 文を三項演算子に、ブロック変数の li を item に、といった変更は、読みやすさが同じなら、レビューの時間を使うだけです。</li>
            <li>すぐに消すコードを整える。削除の予定がある機能のコードは、整えても次に読む人がいません。</li>
          </ul>
          <p>
            Rails 本体も見た目だけの変更を受け付けていません。Rails への貢献の手引きは、安定性・機能・テストのしやすさに何も加えない見た目だけの変更は、一般に受け入れないと書いています<Ref n={5} />。Boy Scout Rule が求めるのは、コードを読みやすく変えやすくする変更で、変更の量を増やすことではありません。
          </p>
          <h3>判断の目安</h3>
          <Figure n="67-7" title="ついでの改善を入れるかの目安" caption="模式図。横軸は今回の変更からの距離、縦軸は振る舞いが変わらないことをテストで確かめられるか。">
            <JudgeFigure />
          </Figure>
          <p>図 67-7 の4つの場所は次のように使い分けます。</p>
          <ul>
            <li>左上（直す所に近く、テストで確かめられる）：この PR の、振る舞いを保つコミットに入れます。名前の変更、定数への置き換え、使っていないコードの削除がここに入ります。</li>
            <li>左下（直す所に近いが、テストがない）：先にテストを足してから入れます。この章のコミット1がこれに当たります。SQL の sum への書き換えも、保存前の注文のテストがなかったので、実際にはここにありました。</li>
            <li>右上（直す所から遠いが、テストで確かめられる）：別の PR にします。忘れないよう TODO や Issue に残し、Fowler が勧めるように、日を置かずに出します<Ref n={3} />。</li>
            <li>右下（直す所から遠く、テストもない）：この PR には入れません。性能の変更は計測から、書式の変更は専用の PR で、大きな構造の変更は計画を立てて進めます。</li>
          </ul>
          <p>
            迷ったときは、その改善をこの PR から外したら、バグの修正のレビューが楽になるかを考えます。楽になるなら外し、別の PR にします。Fowler も、いつ切り上げるかには判断が必要で、理想の形にするのは次に来たときでもよいと書いています<Ref n={3} />。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'deprecate・bin/rails notes・rubocop と、Rails の変更の進め方',
      body: (
        <>
          <h3>公開しているメソッドの名前を deprecate で変える</h3>
          <p>
            apply 節で別の PR に回した calc_ship の改名を、Active Support の <code>deprecate</code> を使って進めます。deprecate は指定したメソッドを定義し直し、呼ばれるたびに<Term en="deprecation warning">非推奨の警告</Term>を出してから元のメソッドを呼ぶようにします<Ref n={10} /><Ref n={11} />。非推奨の警告は「この機能は将来消すので、別のものに移ってほしい」と呼び出し元に知らせるための警告です。
          </p>
          <p>最初に、アプリの警告を出すための deprecator を作り、Rails.application.deprecators に登録します。</p>
          <Code
            lang="ruby"
            title="config/initializers/deprecators.rb"
            code={`
# アプリの中で名前を変えるメソッドの、非推奨の警告を出す
Rails.application.deprecators[:shop] = ActiveSupport::Deprecation.new("2027-04", "Shop")
`}
          />
          <p>
            ActiveSupport::Deprecation.new の引数は、消す予定の時期と、警告の文に入る名前です。Rails.application.deprecators に登録すると、環境ごとの設定（config.active_support.deprecation）がこの deprecator にも適用されます<Ref n={12} />。次に、新しい名前でメソッドを定義し、古い名前を別名として残して非推奨にします。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（PR 2）"
            code={`
class Order < ApplicationRecord
  FREE_SHIPPING_THRESHOLD = 5_000 # 小計がこの金額以上なら送料無料
  SHIPPING_FEE = 600

  has_many :line_items, dependent: :destroy

  def subtotal
    line_items.sum { |li| li.unit_price * li.quantity }
  end

  def shipping_fee
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  end
  alias_method :calc_ship, :shipping_fee
  deprecate calc_ship: :shipping_fee, deprecator: Rails.application.deprecators[:shop]

  def total
    subtotal + shipping_fee
  end
end
`}
          />
          <p>
            <code>calc_ship: :shipping_fee</code> は calc_ship を非推奨にし、代わりに shipping_fee を使うよう警告の文に書く、という指定です<Ref n={11} />。この PR では、メールのビューと Order のテストを新しい名前に変えました。経理の一覧のジョブにはテストがなかったので、呼び出しを変える前に、今の振る舞いを確かめるテストを足しました。
          </p>
          <Code
            lang="ruby"
            title="spec/jobs/order_export_job_spec.rb"
            code={`
require "rails_helper"

RSpec.describe OrderExportJob, type: :job do
  it "その日の注文を、ID・小計・送料・合計のタブ区切りで書き出す" do
    order = Order.create!(email: "a@example.com")
    order.line_items.create!(product_name: "紅茶", unit_price: 5000, quantity: 1)
    path = OrderExportJob.perform_now(Date.current)
    expect(path.read).to eq("#{order.id}\\t5000\\t0\\t5000\\n")
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/jobs）"
            code={`
DEPRECATION WARNING: calc_ship is deprecated and will be removed from Shop 2027-04 (use shipping_fee instead) (called from block in OrderExportJob#perform at /work/ch86/app/jobs/order_export_job.rb:5)
.

Finished in 0.07682 seconds (files took 1.02 seconds to load)
1 example, 0 failures
`}
          />
          <p>
            ジョブは古い名前のまま動き、警告に呼び出し元のファイルと行が出ました。テストの環境では警告を標準エラー出力に出す設定（<code>config.active_support.deprecation = :stderr</code>）になっているからです<Ref n={13} />。次の PR 3 で、この行を shipping_fee に変え、警告が出なくなったことを確かめてから、alias_method と deprecate を消します。
          </p>
          <Figure n="67-8" title="名前の変更を3つの PR に分ける" caption="PR 2 で古い名前を残すので、変え忘れた呼び出し元も動き続け、警告で場所がわかる。">
            <RenameFigure />
          </Figure>
          <p>
            図 67-8 の手順にすると、どの PR も小さく、途中で取り込んでもアプリは動きます。古い名前を残しておく期間は、ポイントのブランチのように、作業中のほかのブランチが古い名前を呼んでいても動きます。
          </p>
          <Callout kind="warn" title="本番の環境の既定では非推奨の警告を出さない">
            <p>
              Rails 8.1 の新しいアプリの config/environments/production.rb には <code>config.active_support.report_deprecations = false</code> があり、このとき Rails はすべての deprecator の警告を出さない設定にします<Ref n={13} />。本番のログを見ても、古い名前の呼び出し元は見つかりません。呼び出し元はテストと開発の環境の警告で探します。このため、テストのない呼び出し元には、名前を変える前にテストを足します。
            </p>
          </Callout>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 でも、<code>deprecate</code> は同じく deprecator: を必須の引数として受け取り、Rails.application.deprecators もあります<Ref n={17} />。7.2 で作ったアプリの config/environments/test.rb と development.rb には、<code>config.active_support.disallowed_deprecation = :raise</code> と <code>config.active_support.disallowed_deprecation_warnings = []</code> の行があります。PR 3 の後に <code>disallowed_deprecation_warnings</code> に <code>[/calc_ship/]</code> のような条件を入れると、古い名前を呼ぶコードを新しく書いたときに、警告ではなく例外にできます。8.1 のテンプレートではこの2行がなくなりましたが、設定そのものは 8.1.4.1 でも読み込まれます<Ref n={13} /><Ref n={17} />。
            </p>
          </Callout>
          <h3>TODO と bin/rails notes</h3>
          <p>
            apply 節では、改名を別の PR に回し、コードに TODO を残しました。<code>bin/rails notes</code> は既定では app・config・db・lib・test のディレクトリから、TODO・FIXME・OPTIMIZE の印のついたコメントを集めて表示します。<code>bin/rails notes -a FIXME</code> のように印を指定でき、<code>Rails::SourceAnnotationExtractor::Annotation.register_tags</code> で独自の印を足すこともできます<Ref n={14} />。TODO は残した理由と、どの PR で直すかを書いておくと、後で読んだ人が直してよいかを判断できます。Issue で管理しているチームなら、Issue の番号を書きます。
          </p>
          <h3>書式は rubocop-rails-omakase に任せ、専用の PR でそろえる</h3>
          <p>
            Rails 7.2 と 8.1 の <code>rails new</code> は、Gemfile に rubocop-rails-omakase を入れ、.rubocop.yml と bin/rubocop を作ります<Ref n={15} /><Ref n={17} />。書式の決まりをツールに任せると、レビューで書式の好みを指摘し合う必要がなくなります。
          </p>
          <p>
            既存のアプリに RuboCop を入れたり、決まりを変えたりしたときは、全体の書式をそろえる変更を、それだけの PR にします。バグの修正の PR では、変更したファイルを指定して <code>bin/rubocop app/models/order.rb</code> のように実行し、触っていないファイルの書式は変えません。書式だけの差分が混ざると、図 67-2 のように、レビューする人が読む行が増え、ほかのブランチとの衝突も増えるからです。
          </p>
          <h3>Rails Doctrine との関係</h3>
          <p>
            Rails Doctrine の「Exalt beautiful code」は、美しいコードはそれ自体に価値があり、積極的に追い求めるべきだと述べています。同時に、美しいコードがいつもほかの関心事に勝つわけではないが、優先順位を決めるときにはほかの関心事と並べて考えるべきだ、とも書いています<Ref n={9} />。Boy Scout Rule も同じで、コードを良くすることは、バグの修正を早く安全に届けることと並べて判断します。
          </p>
          <p>
            「Progress over stability」は、Rails が成長し続けるには、ときには既存のやり方を壊して変える必要があると述べる一方で、それは不要な痛みを与えてよいという許可ではない、と書いています<Ref n={9} />。Rails は互換性のない変更の前に非推奨の警告を出し、次のバージョンで消すという進め方をとっています。この節の PR 2 と PR 3 は同じ進め方をアプリの中の名前の変更に当てはめたものです。Rails のアップグレードで非推奨の警告を消していく手順は、<ChapterLink n={29} section="upgrade" />で扱いました。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              <ChapterLink n={20} section="test-strategy" />：整える前に足すテストを、モデル・ヘルパー・ジョブのどの層に置くかを扱いました。
            </li>
            <li>
              <ChapterLink n={59} />（DRY）と<ChapterLink n={58} />（YAGNI）：境目の数字の重複を消すこと、使っていないメソッドを消すことは、この2つの原則に沿った改善です。
            </li>
            <li>
              <ChapterLink n={90} />（Measure Before Optimizing）：SQL の sum のような速さのための変更を、計測してから行う方法を扱います。
            </li>
            <li>
              <ChapterLink n={92} />（Backward Compatibility）：アプリの外の利用者がいる API や列の名前を、利用者を壊さずに変える方法を扱います。この章の deprecate はアプリの中の呼び出し元に対する同じ考え方です。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Boy Scout Rule は触ったコードを以前より少し良い状態にして戻し、技術的負債を継続的に減らす原則です。Martin は『Clean Code』（2008年）で、変数の名前を1つ良くする、小さな重複を1つ消す、といった小さな改善を例に挙げました。</li>
          <li>修正に大きなリファクタリングを混ぜた PR は、バグの修正の行が差分の中で見えにくくなり、変え忘れた呼び出し元の NoMethodError と、ほかのブランチとの衝突を生みました。</li>
          <li>修正だけを続けた PR は同じ数字の重複と使っていないメソッドを残し、次の変更でカートとメールの食い違いを再び起こしました。</li>
          <li>バグの修正の PR は今の振る舞いをテストに書く、振る舞いを変えずに整える、振る舞いを変える、のコミットに分けます。整えるコミットは、テストを変えずに全部が通ることで確かめます。</li>
          <li>PR に入れる改善は直す行からの距離と、振る舞いが変わらないことをテストで確かめられるかで決めます。遠い改善は別の PR にし、TODO や Issue に残します。</li>
          <li>テストが通っても、変えた所の振る舞いをテストが確かめていなければ、振る舞いを保った確認にはなりません。SQL の sum への書き換えは保存前の注文の小計と、発行される SELECT の数を変えました。</li>
          <li>公開しているメソッドの名前は、deprecate で古い名前を残して複数の PR で変えます。本番の既定では警告が出ないので、呼び出し元はテストと開発の環境の警告で探します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Clean Code: A Handbook of Agile Software Craftsmanship', publisher: 'Robert C. Martin / Prentice Hall（InformIT の書籍ページと、同じページからダウンロードできる見本の PDF）', url: 'https://www.informit.com/store/clean-code-a-handbook-of-agile-software-craftsmanship-9780132350884', accessed: '2026-11-22', version: '2008年8月1日刊（書籍ページの表記）。見本の PDF の第1章14〜15ページ', note: '第1章の「The Boy Scout Rule」の節：コードは時間がたっても読みやすく保つ必要があること、アメリカのボーイスカウトの「キャンプ場を来たときよりきれいにして去る」という決まり、全員がチェックアウトしたときより少しきれいにしてチェックインすればコードは劣化しないこと、小さな改善の4つの例、Baden-Powell の最後のメッセージを言い換えたという脚注。' },
    { title: 'The Boy Scout Rule（97 Things Every Programmer Should Know）', publisher: 'Robert C. Martin / Kevlin Henney 編、O\'Reilly。97-things/97-things-every-programmer-should-know（GitHub）', url: 'https://github.com/97-things/97-things-every-programmer-should-know/blob/ff7e0cfb5f86976d2d04eb779fee9c0334025321/en/thing_08/README.md', accessed: '2026-11-22', version: '書籍は2010年刊（Open Library の ISBN 9780596809485 の書誌で確認）。本文は CC BY-NC-SA 3.0', note: '「モジュールはチェックアウトしたときよりきれいにしてチェックインする」という書き直し、元の作者に関係なく良くすること、完全にする必要はなく少し良くすれば足りること、足すコードはきれいに書きほかに1つ以上をきれいにすること、改善の例（変数名、長い関数の分割、循環した依存、方針と詳細を分けるインターフェース）、チームがシステム全体を気にかけるようになること。' },
    { title: 'Opportunistic Refactoring', publisher: 'Martin Fowler（martinfowler.com の bliki）', url: 'https://martinfowler.com/bliki/OpportunisticRefactoring.html', accessed: '2026-11-22', version: '2011年11月1日', note: 'リファクタリングを機会があればいつでも誰でも行う作業にすること、camp site rule と呼ばれること、準備のためのリファクタリング、途中で気づいたらメモして同じ日に戻ること、切り上げる判断が必要で次に来たときに回してよいこと、よく手を入れる場所が良くなること、テストを1つ2つ足すこと、離れた場所の改善も別の日に回さないこと、コードの持ち主の制限とフィーチャーブランチが妨げになること。' },
    { title: 'An example of preparatory refactoring', publisher: 'Martin Fowler（martinfowler.com）', url: 'https://martinfowler.com/articles/preparatory-refactoring-example.html', accessed: '2026-11-22', version: '2015年1月5日', note: '囲み記事「The Two Hats」：Kent Beck の2つの帽子のたとえ（リファクタリングの帽子では振る舞いを保ちテストは通ったまま、機能を足す帽子ではテストを足し既存のテストを落とす）。準備のためのリファクタリングと、Beck の「make the change easy, then make the easy change」。' },
    { title: 'Contributing to Ruby on Rails（Follow the Coding Conventions の前の段落）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/contributing_to_ruby_on_rails.html#follow-the-coding-conventions', accessed: '2026-11-22', note: '安定性・機能・テストのしやすさに何も加えない見た目だけの変更は、一般に受け入れないこと（理由として rails/rails#13771 のコメントにリンクしている）。' },
    { title: 'The WyCash Portfolio Management System（OOPSLA \'92 Experience Report）', publisher: 'Ward Cunningham（c2.com）', url: 'http://c2.com/doc/oopsla92.html', accessed: '2026-11-22', version: '1992年3月26日', note: '初めて書いたコードを出荷するのは借金のようなもので、すぐ書き直して返せば開発を速くすること、返さないときが危なく、正しくないコードの上で使う時間が利子になること。' },
    { title: 'Pragmatic Programmer Tips', publisher: 'The Pragmatic Bookshelf', url: 'https://pragprog.com/tips/', accessed: '2026-11-22', version: '『The Pragmatic Programmer』20th Anniversary Edition の Tip 5', note: '「Don\'t Live with Broken Windows」：悪い設計、誤った判断、質の悪いコードを見つけたときに直すこと。' },
    { title: 'Refactoring', publisher: 'Martin Fowler（refactoring.com）', url: 'https://refactoring.com/', accessed: '2026-11-22', note: 'リファクタリングは、外から見た振る舞いを変えずに既存のコードの内部の構造を変える手法で、振る舞いを保つ小さな変換の積み重ねであること。リファクタリングが日々のプログラミングの一部であること。' },
    { title: 'The Rails Doctrine', publisher: 'rubyonrails.org / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-22', note: 'Exalt beautiful code（美しいコードに価値があるが、いつもほかの関心事に勝つわけではないこと）と、Progress over stability（変えるために壊すことがあるが、不要な痛みを与える許可ではないこと）。' },
    { title: 'activesupport/lib/active_support/core_ext/module/deprecation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/module/deprecation.rb#L17-L24`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Module#deprecate が deprecator: を受け取り、deprecate_methods を呼ぶこと。' },
    { title: 'activesupport/lib/active_support/deprecation/method_wrappers.rb と reporting.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/deprecation/method_wrappers.rb#L35-L50`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'deprecate_methods がメソッドを定義し直し、警告を出してから元のメソッドを呼ぶこと、ハッシュで渡した値を警告の文に使うこと。reporting.rb の115〜122行目で、値が Symbol のときに「(use 〜 instead)」を付けること。' },
    { title: 'activesupport/lib/active_support/deprecation/deprecators.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/deprecation/deprecators.rb#L34-L37`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'Deprecators#[]= が、集まりに設定された behavior などを追加した deprecator にも適用すること。railties/lib/rails/application.rb の242〜246行目で Rails.application.deprecators を定義していること。' },
    { title: 'activesupport/lib/active_support/railtie.rb（active_support.deprecation_behavior）', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/railtie.rb#L89-L107`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'report_deprecations が false のときすべての deprecator を silenced にすること、そうでなければ deprecation・disallowed_deprecation・disallowed_deprecation_warnings を適用すること。railties の production.rb.tt の58〜59行目に report_deprecations = false、test.rb.tt の46〜47行目に deprecation = :stderr があること。' },
    { title: 'railties/lib/rails/source_annotation_extractor.rb と commands/notes/notes_command.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/source_annotation_extractor.rb#L71-L90`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: '既定で探すディレクトリが app・config・db・lib・test で、既定の印が OPTIMIZE・FIXME・TODO であること、register_directories と register_tags で探す場所と印を足せること。notes_command.rb の8行目で -a（--annotations）で印を指定できること。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/Gemfile.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/Gemfile.tt#L67-L70`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'skip_rubocop でなければ rubocop-rails-omakase を Gemfile に入れること。同じ templates の rubocop.yml.tt が rubocop-rails-omakase の設定を継承し、bin/rubocop.tt があること。' },
    { title: 'activerecord/lib/active_record/relation/calculations.rb と associations/collection_proxy.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/calculations.rb#L171-L177`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'sum にブロックを渡すと map してから Ruby で合計し、渡さないと calculate（SQL）になること。collection_proxy.rb の724〜726行目で、関連が null_scope?（collection_association.rb の308〜310行目。持ち主が未保存で外部キーがない）のときは空のスコープで計算すること。' },
    { title: 'Rails 7.2.4 の activesupport・railties', publisher: 'rails/rails（GitHub。rubygems.org の gem で確認）', url: 'https://github.com/rails/rails/blob/v7.2.4/activesupport/lib/active_support/core_ext/module/deprecation.rb#L17-L24', accessed: '2026-11-22', version: 'Rails 7.2.4', note: 'Module#deprecate が 8.1.4.1 と同じく deprecator: を受け取ること。railties の application.rb の239行目に deprecators があること。test.rb.tt の57〜61行目と development.rb.tt の55〜59行目に disallowed_deprecation と disallowed_deprecation_warnings の行があること。Gemfile.tt の42〜45行目で rubocop-rails-omakase を入れること。' },
  ],
}

export default chapter
