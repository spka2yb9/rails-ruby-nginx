import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 84-1 その場で書き込む方式と Unit of Work の比較 ---------- */
function ImmediateVsUowFigure() {
  const row = (i: number) => 44 + i * 56
  const left: { op: string[]; res: string[]; state: 'ok' | 'ng' | 'skip' }[] = [
    { op: ['設計の数量を 3 に', 'update!'], res: ['UPDATE → COMMIT', '確定した'], state: 'ok' },
    { op: ['保守を削除', 'destroy!'], res: ['DELETE → COMMIT', '確定した'], state: 'ok' },
    { op: ['研修を追加（数量 0）', 'create!'], res: ['検証エラー', '例外で中断'], state: 'ng' },
    { op: ['合計を保存', 'update!(total:)'], res: ['実行されない'], state: 'skip' },
  ]
  return (
    <Svg
      id="84-1"
      w={780}
      h={396}
      label="左は明細を1件ずつ保存するコード。設計の数量の UPDATE と保守の DELETE はそれぞれその場で確定し、研修の追加が検証エラーで失敗すると合計の保存は実行されない。設計 3×2000 だけが残り、合計は 3000 のままで、明細から計算すると 6000 になる。右は Unit of Work。設計の数量の変更、保守の削除の印、研修の追加はメモリー上のオブジェクトを変えるだけで、最後の save! で BEGIN、請求書の UPDATE、明細の DELETE、UPDATE、INSERT、COMMIT を1つのトランザクションで実行する。途中で失敗したら ROLLBACK し、何も残らない"
    >
      <T x={20} y={20} bold>
        明細を1件ずつ保存する（scene のコード）
      </T>
      <T x={410} y={20} bold>
        Unit of Work（Rails では autosave と save!）
      </T>
      <line x1={390} y1={8} x2={390} y2={388} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {left.map((r, i) => (
        <g key={r.op[0]}>
          <Box x={20} y={row(i)} w={160} h={42} lines={r.op} fs={12} subTone="muted" dashed={r.state === 'skip'} fill={r.state === 'skip' ? 'none' : 'box'} />
          <Arrow x1={180} y1={row(i) + 21} x2={204} y2={row(i) + 21} dashed={r.state === 'skip'} />
          <Box
            x={206}
            y={row(i)}
            w={164}
            h={42}
            lines={r.res}
            fs={12}
            fill={r.state === 'ok' ? 'box4' : r.state === 'ng' ? 'box5' : 'none'}
            dashed={r.state === 'skip'}
            accent={r.state === 'ng'}
            subTone={r.state === 'ng' ? 'danger' : 'acc'}
          />
        </g>
      ))}
      <Box x={20} y={row(4) + 4} w={350} h={58} lines={['残った状態（1回目の保存の後）', '設計 3×2000 だけ。保守は消え、研修はない', '合計 3000（明細から計算すると 6000）']} fs={12} fill="none" subTone="danger" bold />
      {['設計の数量を 3 に', '保守に削除の印', '研修を追加'].map((op, i) => (
        <g key={op}>
          <Box x={410} y={row(i)} w={150} h={42} lines={op} fs={12} />
          <Arrow x1={560} y1={row(i) + 21} x2={584} y2={row(i) + 21} dashed />
          <T x={590} y={row(i) + 21} fs={12} tone="muted">
            メモリー上で変えるだけ
          </T>
        </g>
      ))}
      <Box x={410} y={row(3) + 40} w={150} h={42} lines={['save!', '（commit に当たる）']} fs={12} fill="box5" accent subTone="muted" />
      <Arrow x1={560} y1={row(3) + 61} x2={584} y2={row(3) + 61} accent />
      <Box
        x={586}
        y={row(3) - 10}
        w={174}
        h={142}
        lines={['BEGIN', 'UPDATE 請求書（合計）', 'DELETE 明細（保守）', 'UPDATE 明細（設計）', 'INSERT 明細（研修）', 'COMMIT']}
        fs={12}
        fill="box4"
        align="start"
      />
      <T x={410} y={row(6) + 26} fs={12} tone="acc">
        途中で失敗したら ROLLBACK し、何も残らない
      </T>
    </Svg>
  )
}

/* ---------- 図 84-2 変更の追跡の2つの方法 ---------- */
function ChangeTrackingFigure() {
  const col = (x: number, title: string, top: string[], mid: string[], label1: string, label2: string, good: string, bad: string, mono: boolean) => (
    <g>
      <T x={x} y={20} bold>
        {title}
      </T>
      <Box x={x} y={36} w={350} h={44} lines={top} fs={12} subTone="muted" />
      <Arrow x1={x + 40} y1={80} x2={x + 40} y2={112} />
      <T x={x + 52} y={96} fs={11} mono={mono}>
        {label1}
      </T>
      <Box x={x} y={114} w={350} h={44} lines={mid} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={x + 40} y1={158} x2={x + 40} y2={190} />
      <T x={x + 52} y={174} fs={11}>
        {label2}
      </T>
      <Box x={x} y={192} w={350} h={34} lines="INSERT・UPDATE・DELETE" fs={12} fill="box4" />
      <T x={x} y={246} fs={12} tone="acc">
        {good}
      </T>
      <T x={x} y={266} fs={12} tone="danger">
        {bad}
      </T>
    </g>
  )
  return (
    <Svg
      id="84-2"
      w={780}
      h={346}
      label="変更の追跡の2つの方法。1つ目は明示的に登録する方法で、業務のコードが registerNew・registerDirty・registerDeleted で Unit of Work に知らせ、commit で一覧から SQL を作る。比べる処理はいらないが、知らせ忘れた変更は書き込まれない。2つ目はスナップショットと比べる方法で、読み込んだ時点の値を写しておき、commit で今の値と比べて変わったものだけを書き込む。知らせなくてよいが、読み込んだ数だけ比べる手間が増える。Rails の Active Record は2つ目を1つのオブジェクトの中だけで行い、複数のオブジェクトの一覧は持たない"
    >
      {col(20, '① 明示的に登録する', ['業務のコード', '明細を作る・変える・削除する'], ['Unit of Work の一覧', '新規・変更・削除のオブジェクト'], 'registerNew・registerDirty・registerDeleted', 'commit', '比べる処理がいらない', '知らせ忘れた変更は書き込まれない', true)}
      {col(410, '② スナップショットと比べる', ['読み込み', '読み込んだ時点の値（スナップショット）を写す'], ['commit で今の値と比べる', '変わったオブジェクト・列を見つける'], '業務のコードはオブジェクトを変えるだけ', '変わったものだけ', '知らせなくてよい', '読み込んだ数だけ比べる手間が増える', false)}
      <Box
        x={20}
        y={286}
        w={740}
        h={48}
        lines={['Rails の Active Record：②を1つのオブジェクトの中だけで行う（changes・部分更新）', '複数のオブジェクトの一覧は持たず、save を呼んだオブジェクトと autosave の関連だけを書き込む']}
        fs={12}
        fill="bg"
        bold
        subTone="muted"
      />
    </Svg>
  )
}

/* ---------- 図 84-3 Identity Map がない場合とある場合 ---------- */
function IdentityMapFigure() {
  return (
    <Svg
      id="84-3"
      w={780}
      h={292}
      label="左は Identity Map がない場合で、Rails の動き。InvoiceLine.find(1) を2回呼ぶと、同じ行から別々のオブジェクト x と y ができる。x で数量を、y で単価を変えて保存すると、別の列なので両方残るが、同じ列なら後の save が勝つ。y は x の変更を知らない。右は Identity Map がある場合。2回目の読み込みでは覚えたオブジェクトを返すので、変更は1つのオブジェクトに集まる"
    >
      <T x={20} y={20} bold>
        Identity Map がない（Rails の動き）
      </T>
      <T x={410} y={20} bold>
        Identity Map がある
      </T>
      <line x1={390} y1={8} x2={390} y2={284} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={125} y={36} w={150} h={44} lines={['invoice_lines', 'id = 1 の行']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={165} y1={80} x2={100} y2={126} dashed />
      <Arrow x1={235} y1={80} x2={300} y2={126} dashed />
      <T x={40} y={100} fs={11} mono>
        find(1)
      </T>
      <T x={300} y={100} fs={11} mono>
        find(1)
      </T>
      <Box x={20} y={128} w={160} h={50} lines={['x（1つ目）', 'quantity を 3 に']} fs={12} subTone="muted" />
      <Box x={210} y={128} w={160} h={50} lines={['y（2つ目）', 'unit_price を 2500 に']} fs={12} subTone="muted" />
      <Box
        x={20}
        y={200}
        w={350}
        h={76}
        lines={['同じ行が2つのオブジェクトになる', '別の列なら両方残る。同じ列なら後の save が勝つ', 'y は x の変更を知らない（y.quantity は 1 のまま）']}
        fs={12}
        fill="none"
        bold
        subTone="danger"
      />
      <Box x={420} y={36} w={150} h={44} lines={['invoice_lines', 'id = 1 の行']} fs={12} fill="box4" subTone="muted" />
      <Box x={600} y={36} w={160} h={44} lines={['Identity Map', '1 → このオブジェクト']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={495} y1={80} x2={540} y2={126} dashed />
      <Arrow x1={680} y1={80} x2={640} y2={126} plain />
      <Box x={470} y={128} w={240} h={50} lines={['InvoiceLine（1つだけ）', 'quantity と unit_price を変える']} fs={12} accent subTone="muted" />
      <Box
        x={410}
        y={200}
        w={350}
        h={76}
        lines={['2回目の読み込みでは、覚えたオブジェクトを返す', '変更は1つのオブジェクトに集まる', '1つの業務の操作（リクエスト）の間だけ使う']}
        fs={12}
        fill="none"
        bold
        subTone="acc"
      />
    </Svg>
  )
}

/* ---------- 図 84-4 請求書の集約と保存の範囲 ---------- */
function AggregateFigure() {
  return (
    <Svg
      id="84-4"
      w={780}
      h={352}
      label="請求書の集約と保存の範囲。InvoicesController#update は invoice.update を呼び、請求書（ルート）と明細行（設計、新規の研修、削除の印を付けた保守）を1回の save! で保存する。これが1つの集約で、1つのトランザクションになる。別の請求書は別の集約で、明細を移す move_line_to! だけが2つの集約の save! を1つのトランザクションで囲む。ルートを通らずに明細の update! を直接呼ぶと、その明細だけが確定し、合計とずれる"
    >
      <Box x={20} y={40} w={170} h={48} lines={['InvoicesController', '#update']} fs={12} subTone="muted" />
      <Arrow x1={190} y1={64} x2={256} y2={64} />
      <T x={216} y={52} anchor="middle" fs={11} mono>
        update
      </T>
      <rect x={244} y={22} width={250} height={244} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={256} y={34} fs={11} tone="acc">
        集約：1回の save! で保存する範囲
      </T>
      <Box x={258} y={44} w={222} h={56} lines={['Invoice（ルート）', '合計の計算・発行済みの確認', '明細の検証をまとめる']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow d="M276,100 L276,234" plain />
      {[
        { y: 116, t: 'InvoiceLine 設計（変更）', d: false },
        { y: 158, t: 'InvoiceLine 研修（新規）', d: false },
        { y: 200, t: 'InvoiceLine 保守（削除の印）', d: true },
      ].map((l) => (
        <g key={l.t}>
          <Arrow x1={276} y1={l.y + 17} x2={292} y2={l.y + 17} plain />
          <Box x={292} y={l.y} w={188} h={34} lines={l.t} fs={12} dashed={l.d} />
        </g>
      ))}
      <rect x={530} y={22} width={230} height={150} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={542} y={34} fs={11} tone="acc">
        別の集約：翌月分の請求書
      </T>
      <Box x={544} y={44} w={202} h={46} lines={['Invoice 2（ルート）', '発行前なら変更できる']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow d="M560,90 L560,123 L574,123" plain />
      <Box x={574} y={106} w={172} h={34} lines="InvoiceLine 点検" fs={12} />
      <Box x={244} y={292} w={516} h={48} lines={['move_line_to!：transaction の中で請求書と請求書 2 を save!', '2つの集約を1つのトランザクションにするのは、この操作だけ']} fs={12} fill="bg" bold subTone="muted" />
      <Arrow x1={369} y1={292} x2={369} y2={268} />
      <Arrow x1={645} y1={292} x2={645} y2={174} />
      <Box x={20} y={190} w={170} h={48} lines={['別の処理', 'line.update!(…)']} fs={12} fill="none" dashed subTone="muted" />
      <Arrow x1={190} y1={214} x2={290} y2={133} />
      <T x={20} y={258} fs={11} tone="danger">
        ルートを通らずに明細だけを確定する
      </T>
      <T x={20} y={276} fs={11} tone="danger">
        → 合計と明細がずれる
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 48,
  part: 9,
  title: 'Unit of Work：請求書と明細行をまとめて保存する',
  summary:
    '1回の業務の操作で行った追加・変更・削除を覚えておき、最後に1つのトランザクションで書き込む Unit of Work を、請求書と明細行の編集で説明します。Rails の Active Record は Unit of Work ではないので自作はせず、集約を決めたうえで has_many の autosave・accepts_nested_attributes_for・transaction で「一部だけが保存される」問題を解きます。',
  goals: [
    '明細を1件ずつ保存するコードで、途中で失敗したときに何が残るかを、SQL のログから説明できる',
    'Unit of Work の目的・構造と、変更の見つけ方（明示的な登録とスナップショット）・Identity Map の役割を説明できる',
    '集約を決め、1回の保存で一緒に書き込む範囲を、請求書と明細行の例で説明できる',
    'Active Record が Unit of Work ではない理由（オブジェクトごとの変更の追跡、Identity Map がないこと、SQL をその場で送ること）を、実行結果で説明できる',
    'has_many の autosave: true・mark_for_destruction・accepts_nested_attributes_for で1つの集約をまとめて保存し、複数の集約は transaction で囲める',
    '途中の失敗で何も残らないことを、RSpec と SQL のログで確かめられる',
  ],
  prerequisites: [13, 15],
  sections: [
    {
      id: 'scene',
      title: '請求書の明細を1件ずつ保存すると起きること',
      body: (
        <>
          <h3>請求書と明細行</h3>
          <p>
            この章では請求書の編集画面を例にします。請求書は取引先に「何をいくつ、いくらで提供したので、合計でいくら支払ってください」と伝える書類です。1枚の請求書には品目ごとの行があり、この行を明細行と呼びます。明細行は品目（設計・保守など）、数量、単価を持ち、請求書の合計は、すべての明細行の「数量 × 単価」を足した金額です。金額は円の整数で持ちます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">テーブル</th>
                  <th scope="col">主な列</th>
                  <th scope="col">内容</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>invoices</code></th>
                  <td><code>customer</code>・<code>total</code>・<code>issued_at</code></td>
                  <td>請求書。<code>total</code> は明細行の合計、<code>issued_at</code> は取引先に発行した日時</td>
                </tr>
                <tr>
                  <th scope="row"><code>invoice_lines</code></th>
                  <td><code>invoice_id</code>・<code>description</code>・<code>quantity</code>・<code>unit_price</code></td>
                  <td>明細行。数量は1以上（CHECK 制約）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            編集画面では、担当者が既存の明細の数量を変え、不要な明細の「削除」の欄を選び、新しい明細の行を足してから「保存」を押します。1回の「保存」で、明細の変更・削除・追加と、それに合わせた合計の更新が必要になります。
          </p>
          <h3>明細を1件ずつ保存するコントローラー</h3>
          <p>最初のコードはフォームの行を1つずつ処理し、行ごとに明細を保存しています。</p>
          <Code
            lang="ruby"
            title="app/models/invoice.rb（パターンを使う前）"
            code={`
class Invoice < ApplicationRecord
  has_many :lines, class_name: "InvoiceLine", dependent: :destroy
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/invoices_controller.rb（パターンを使う前）"
            code={`
class InvoicesController < ApplicationController
  def update
    @invoice = Invoice.find(params[:id])
    invoice_params[:lines].each_value do |row| # フォームの1行ずつ
      attrs = row.slice(:description, :quantity, :unit_price)
      if row[:id].blank?
        @invoice.lines.create!(attrs)                     # その場で INSERT して確定する
      elsif row[:_destroy] == "1"
        @invoice.lines.find(row[:id]).destroy!            # その場で DELETE して確定する
      else
        @invoice.lines.find(row[:id]).update!(attrs)      # その場で UPDATE して確定する
      end
    end
    @invoice.update!(total: @invoice.lines.sum("quantity * unit_price")) # 最後に合計を保存する
    redirect_to invoice_path(@invoice)
  end

  private

  def invoice_params
    params.expect(invoice: [lines: [[:id, :description, :quantity, :unit_price, :_destroy]]])
  end
end
`}
          />
          <p>
            id のない行は <code>create!</code>、削除の欄が選ばれた行は <code>destroy!</code>、それ以外の行は <code>update!</code> で保存し、最後に明細の合計を SQL の SUM で計算し直して請求書に保存します。明細の数量が1以上であることは、InvoiceLine の検証（<code>validates :quantity, numericality: {'{'} only_integer: true, greater_than: 0 {'}'}</code>）と DB の CHECK 制約で確かめます。
          </p>
          <h3>実行して確かめる</h3>
          <p>
            設計（1 × 2,000 円）と保守（1 × 1,000 円）の2行で、合計 3,000 円の請求書を用意しました。この請求書に、設計の数量を 3 に変え、保守を削除し、研修（単価 500 円）を追加する内容を送ります。研修の数量は誤って 0 と入力しています。続けて、研修の数量を 2 に直してもう一度送りました。リクエストは <code>rails runner</code> から <code>ActionDispatch::Integration::Session</code> で送り、SQL のログを表示しています。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。所要時間と日時の値は省略）"
            code={`
== 保存の前: 合計=3000 明細=["設計 1×2000", "保守 1×1000"] 明細から計算した合計=3000
== 1回目の保存
    Invoice Load  SELECT \`invoices\`.* FROM \`invoices\` WHERE \`invoices\`.\`id\` = 1 LIMIT 1
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1 AND \`invoice_lines\`.\`id\` = 1 LIMIT 1
    TRANSACTION  BEGIN
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = 3, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 1
    TRANSACTION  COMMIT
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1 AND \`invoice_lines\`.\`id\` = 2 LIMIT 1
    TRANSACTION  BEGIN
    InvoiceLine Destroy  DELETE FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 2
    TRANSACTION  COMMIT
応答: 422
== 1回目の後: 合計=3000 明細=["設計 3×2000"] 明細から計算した合計=6000
== 研修の数量を 2 に直して、もう一度保存
応答: 404
== 2回目の後: 合計=3000 明細=["設計 3×2000"] 明細から計算した合計=6000
`}
          />
          <p>
            1回目の保存では、設計の UPDATE と保守の DELETE が、それぞれ BEGIN と COMMIT で確定しました。研修の <code>create!</code> は検証で失敗して <code>ActiveRecord::RecordInvalid</code> を投げ、合計の <code>update!</code> は実行されていません。利用者には 422 のエラーの画面が表示されますが、DB には設計の数量 3 と保守の削除が残り、請求書の合計は 3,000 円のままです。明細から計算すると 6,000 円なので、請求書の合計と明細が合いません。
          </p>
          <p>
            2回目の保存では、保守の行がもう削除されているので <code>find</code> が <code>ActiveRecord::RecordNotFound</code> を投げ、404 になりました。利用者が入力を直しても保存できず、研修はまだ追加されていません。
          </p>
          <p>
            <code>save!</code>・<code>update!</code>・<code>destroy!</code> は、呼ばれるたびに自分のトランザクションを開いて確定します<Ref n={9} />。トランザクションの外の SQL は、MySQL の既定の autocommit のもとで1文ずつ確定し、後から ROLLBACK では取り消せません<Ref n={5} />。BEGIN・COMMIT・ROLLBACK の動きは<ChapterLink n={38} section="transaction" />で、Rails が BEGIN を送る仕組みは<ChapterLink n={15} section="transaction" />で扱いました。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>1回の保存の途中で失敗すると、先に確定した変更だけが残り、請求書の合計と明細が合わなくなります。</li>
            <li>利用者が入力を直して送り直しても、すでに反映された変更とぶつかって失敗します（ここでは 404）。</li>
            <li>明細の検証の失敗が、書き込みの途中で初めてわかります。研修の数量の誤りは、設計と保守を書き込んだ後で見つかりました。</li>
            <li>合計の計算がコントローラーにあります。管理画面や API で明細を変えるときにも同じ計算を書き写す必要があり、書き忘れた経路では合計がずれます。</li>
          </ul>
          <p>
            次の節では、1回の操作で変えたものを覚えておき、最後にまとめて書き込むという Unit of Work の考え方を見ます。そのうえで、Rails では Unit of Work を自作せずに、autosave とトランザクションで同じ問題を解きます。
          </p>
        </>
      ),
    },
    {
      id: 'idea',
      title: 'Unit of Work の考え方：変更を覚えておき、最後にまとめて書き込む',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Unit of Work">Unit of Work</Term> は、1つの業務の操作の間に、DB に影響する変更（新しいオブジェクトの追加、既存のオブジェクトの変更、削除）を記録しておき、操作の最後にまとめて書き込むパターンです。Fowler は、業務のトランザクションが影響したオブジェクトの一覧を持ち、変更の書き込みと同時実行の問題の解決を取りまとめるもの、と定義しています<Ref n={1} />。ここでの「業務のトランザクション」は DB のトランザクションではなく、「請求書を編集して保存する」のような、利用者から見た1回の操作を指します。
          </p>
          <p>
            業務のコードは、オブジェクトのメソッドを呼んで明細を足したり数量を変えたりするだけで、SQL を書きません。操作が終わったら <code>commit</code> を1回呼びます。Unit of Work は、作業が終わった時点で DB を変えるために必要なことを割り出し<Ref n={1} />、INSERT・UPDATE・DELETE を1つのトランザクションで実行します。
          </p>
          <h3>使う場面</h3>
          <p>
            Fowler は、オブジェクトを変えるたびに DB を変える方法について、小さな呼び出しが多くなって遅くなること、操作全体の間トランザクションを開いておく必要があり、複数のリクエストにまたがる操作では現実的でないことを挙げています<Ref n={1} />。前の節のコントローラーは、明細を変えるたびに DB を変えていました。次のような兆候があれば、まとめて保存する仕組みが必要になっています。
          </p>
          <ul>
            <li>1回の「保存」で、明細や関連する行を1件ずつ別々に INSERT・UPDATE・DELETE している</li>
            <li>途中で失敗したときに、どこまで保存されたかを調べて、手作業で直したことがある</li>
            <li>合計や件数のように、ほかの行から計算する値を、操作のたびに何度も書き込んでいる</li>
            <li>どのメソッドがいつ DB に書き込むのかが、コードを追わないとわからない</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>業務のコードは、DB への書き込みの順序やトランザクションを意識せずに、オブジェクトの操作として書きたい。</li>
            <li>1回の操作で変えた内容は、すべて保存されるか、何も保存されないかのどちらかにしたい。</li>
            <li>変わっていないものまで書き込むのは無駄で、変わったものを書き忘れてはいけない。</li>
            <li>同じ行を2つのオブジェクトとして読み込むと、どちらの内容を書き込むべきか決められなくなる。</li>
          </ul>
          <h3>解決方法：記録して、最後にまとめて書き込む</h3>
          <p>Unit of Work は次の3つを行います。</p>
          <ol>
            <li>読み込み：DB から読んだオブジェクトを覚えておきます。</li>
            <li>記録：業務のコードがオブジェクトを追加・変更・削除しても、その場では SQL を実行しません。</li>
            <li>commit：記録した変更から INSERT・UPDATE・DELETE を求め、1つのトランザクションで実行します。1つでも失敗したら ROLLBACK し、何も保存しません。変更がなければ、SQL を実行しません。</li>
          </ol>
          <Figure n="84-1" title="その場で書き込む方式と Unit of Work の比較" caption="左は scene の実行結果、右は rails-impl の節で autosave を使った実行結果を並べた図。">
            <ImmediateVsUowFigure />
          </Figure>
          <p>
            図 84-1 の左は、前の節のコードが SQL を確定した順番です。上の2つは研修の失敗より前に確定しているので取り消されず、合計の保存は実行されません。右では、3つの操作はメモリー上のオブジェクトを変えるだけで、最後の1回で BEGIN から COMMIT までをまとめて実行します。右の SQL の並びは、この章の Rails の実装（rails-impl の節）が実際に送った順番です。
          </p>
          <h3>変更の見つけ方</h3>
          <p>
            Unit of Work が「何が変わったか」を知る方法は2つあります。1つは、オブジェクトを作ったとき、変えたとき、削除するときに、そのことを業務のコードから Unit of Work に知らせる（登録する）方法です。Fowler のカタログの図には、このための <code>registerNew</code>・<code>registerDirty</code>・<code>registerClean</code>・<code>registerDeleted</code> と、<code>commit</code>・<code>rollback</code> の操作が並んでいます<Ref n={1} />。もう1つは、読み込んだ時点の値を写しておき、commit のときに今の値と比べる方法です。写しておいた値を<Term en="snapshot">スナップショット</Term>と呼びます。
          </p>
          <Figure n="84-2" title="変更の追跡の2つの方法" caption="Fowler の説明と MSDP の Ruby の例をもとにした模式図。下の段は、この章の active-record の節で確かめる Rails の動き。">
            <ChangeTrackingFigure />
          </Figure>
          <p>
            図 84-2 の左の方法は、比べる処理がいらない代わりに、知らせ忘れた変更が書き込まれません。右の方法は、業務のコードが知らせなくてよい代わりに、読み込んだオブジェクトが多いほど比べる手間が増えます。下の段のとおり、Rails の Active Record は右の方法を1つのオブジェクトの中だけで行います（active-record の節で実行して確かめます）。
          </p>
          <h3>Identity Map</h3>
          <p>
            同じ行を2回読み込んで別々のオブジェクトを2つ作ると、それぞれに加えた変更のどちらを書き込むべきか決められません。<Term en="Identity Map">Identity Map</Term> は、1つの業務の操作の中で読み込んだオブジェクトを、ID をキーにした表（Map）に覚えておき、2回目からは DB を読まずに同じオブジェクトを返す仕組みです。Fowler は、同じ記録を2つのオブジェクトに読み込むと、両方を更新したときに正しく書き込むのが難しくなること、同じデータを何度も読む無駄も省けることを挙げています<Ref n={2} />。
          </p>
          <Figure n="84-3" title="Identity Map がない場合とある場合" caption="左は active-record の節の実行結果をもとにした図。InvoiceLine.find(1) を2回呼んで、2つのオブジェクトで別々の列を変えた。">
            <IdentityMapFigure />
          </Figure>
          <p>
            図 84-3 の左が Rails の動きです。<code>InvoiceLine.find(1)</code> を2回呼ぶと、同じ行から別々のオブジェクト x と y ができ、y は x の変更を知りません。右のように Identity Map があれば、2回目の読み込みで同じオブジェクトが返り、変更は1つのオブジェクトに集まります。Identity Map を使う範囲は、1つの業務の操作（Web アプリケーションなら1つのリクエスト）の間だけです。アプリケーション全体で共有すると、ほかのリクエストの変更が反映されない古いオブジェクトを返し続けます。
          </p>
          <h3>書き込みの順序</h3>
          <p>
            commit では DB の制約を満たす順序で SQL を実行します。MySQL は、外部キーの参照先の行がない子の行の INSERT を拒否します。ON DELETE を指定しない外部キーの既定の動き（NO ACTION）は InnoDB では RESTRICT と同じで、子の行が残っている親の行の DELETE を拒否します<Ref n={6} />。そのため、新しい親は子より先に INSERT し、親を削除するときは子を先に DELETE します。一意制約のある列で「同じ値の行を削除して追加し直す」場合も、削除を先にしないと、追加の時点で一意制約に違反します。
          </p>
          <p>
            MSDP の Ruby の例が実行する順序は、明細の削除 → 明細の変更 → 明細の追加 → 請求書の更新です。Rails の autosave の順序は、rails-impl の節でログを見て確かめます。
          </p>
          <h3>Unit of Work と DB のトランザクションの違い</h3>
          <p>
            DB のトランザクションは、DB の中で複数の SQL をまとめて確定するか取り消す仕組みです。Unit of Work は、アプリケーションの中でオブジェクトに加えた変更を記録し、どの SQL をどの順に実行するかを決める仕組みで、commit のときに DB のトランザクションを使います。
          </p>
          <p>
            開いている時間の長さも異なり、Unit of Work を使えば、業務の操作の間ずっと DB のトランザクションを開いておく必要はなく、トランザクションは commit の短い間だけ開きます。読み込んでから commit するまでの間に、ほかの人が同じ行を変えた場合の扱いは、<ChapterLink n={49} section="idea" />の楽観的ロックで扱います。Fowler の定義が「同時実行の問題の解決」を含むのはこのためです<Ref n={1} />。
          </p>
          <h3>構造</h3>
          <p>
            MSDP の Ruby の例は Unit of Work を自分で書いています。各要素と、Rails で同じ役割を受け持つものを並べると次のようになります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">MSDP の Ruby の例</th>
                  <th scope="col">この章の Rails の実装</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Unit of Work</th>
                  <td><code>UnitOfWork</code></td>
                  <td>なし。1つの集約は親の <code>save!</code>、複数の集約は <code>transaction</code></td>
                  <td>読み込んだオブジェクトを覚え、commit で変更を求めて書き込む</td>
                </tr>
                <tr>
                  <th scope="row">Identity Map</th>
                  <td><code>@identity_map</code></td>
                  <td>なし（読むたびに別のオブジェクト）</td>
                  <td>同じ ID のオブジェクトを1つだけにする</td>
                </tr>
                <tr>
                  <th scope="row">変更の内容</th>
                  <td><code>ChangeSet</code></td>
                  <td>各オブジェクトの <code>changes</code> と <code>marked_for_destruction?</code></td>
                  <td>追加・変更・削除する行を分けて持つ</td>
                </tr>
                <tr>
                  <th scope="row">集約のルート</th>
                  <td><code>Invoice</code>（PORO）</td>
                  <td><code>Invoice</code>（<code>has_many :lines, autosave: true</code>）</td>
                  <td>明細の追加・変更・削除を受け付け、合計を計算する</td>
                </tr>
                <tr>
                  <th scope="row">業務の操作</th>
                  <td><code>Ch09.edit_invoice</code></td>
                  <td><code>InvoicesController#update</code></td>
                  <td>読み込み、操作、保存の順に呼ぶ。SQL を書かない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>MSDP の Unit of Work の中心は、読み込みと commit の2つのメソッドです。</p>
          <Code
            lang="ruby"
            title="MSDP の Ruby の例（examples/ruby/lib/ch09/after/unit_of_work.rb の抜粋。pg gem で PostgreSQL に SQL を送る）"
            code={`
class UnitOfWork
  def load_invoice(id)
    @identity_map[id] ||= begin # 同じ請求書を2回読んでも、同じオブジェクトを返す
      # …（省略：請求書と明細行を SELECT して Invoice を作る）
      Invoice.new(id:, customer: row["customer"], lines:).tap { @snapshots[id] = snapshot(it) }
    end
  end

  # 変更をすべて1つのトランザクションで書き込む。1つでも失敗したら、全部を取り消す
  def commit
    set = changes # スナップショットと今の値を比べる。DB には何もしない
    return set if set.empty?

    @conn.transaction do |tx|
      set.delete_line_ids.each { tx.exec_params("DELETE FROM invoice_lines WHERE id = $1", [it]) }
      # …（省略：明細の UPDATE、明細の INSERT、請求書の UPDATE を、この順に実行する）
    end
    @identity_map.each { |id, invoice| @snapshots[id] = snapshot(invoice) } # 書き込んだ値を新しい基準にする
    set
  end
end
`}
          />
          <p>
            <code>load_invoice</code> は読み込んだ請求書を Identity Map（<code>@identity_map</code>）とスナップショット（<code>@snapshots</code>）に覚えます。<code>commit</code> はスナップショットと今の値を比べて変更を求め、<code>@conn.transaction</code> のブロックの中で書き込むので、例外が起きれば ROLLBACK されます。
          </p>
          <h3>Rails で Unit of Work を自作しない理由</h3>
          <p>Rails のアプリケーションでこのクラスを自分で作らない理由は、次のとおりです。</p>
          <ul>
            <li>
              Active Record のモデルは、どのオブジェクトも自分の <code>save</code>・<code>update!</code>・<code>destroy!</code> を持ちます。Unit of Work を作っても、ほかのコードがモデルの保存メソッドや <code>update_all</code> を呼べば、Unit of Work を通らずに書き込まれます。この問題は anti-patterns の節の「commit の前に別の方法で書き込む」で確かめます。
            </li>
            <li>
              MSDP の例のように SQL を直接送ると、モデルの検証・コールバック・<code>updated_at</code> の更新・楽観的ロックを通りません。かといって Unit of Work が各モデルの <code>save!</code> を呼ぶなら、それは次に示す autosave とトランザクションで書けます。自作すると、書き込みの順序、Identity Map の範囲、関連の扱いを自分で決めて保守することになります。
            </li>
            <li>
              「すべて保存するか、何も保存しないか」は、1つの集約の中なら has_many の <code>autosave: true</code> と親の <code>save!</code> で、複数の集約なら <code>ActiveRecord::Base.transaction</code> で満たせます。
            </li>
          </ul>
          <p>
            以降の節では、まず何を一緒に保存するか（集約）を決め、次に Active Record が変更をどこまで追跡するかを確かめ、そのうえで autosave とトランザクションで実装します。
          </p>
        </>
      ),
    },
    {
      id: 'aggregate',
      title: '集約：一緒に保存するまとまりを決める',
      body: (
        <>
          <p>
            どのオブジェクトをまとめて保存するかは、<Term en="aggregate">集約</Term>で決めます。集約は、一緒に整合性を保つ必要のあるオブジェクトのまとまりで、外からは代表のオブジェクト（集約のルート）だけを通して操作します。Evans の DDD Reference（書籍『Domain-Driven Design』のパターンの要約）は、集約について次のことを挙げています<Ref n={4} />。
          </p>
          <ul>
            <li>集約ごとに境界を決める。</li>
            <li>集約の外のオブジェクトには、ルートへの参照だけを持たせる。</li>
            <li>集約の規則は、ルートが守る。</li>
            <li>トランザクションも、集約と同じ境界で区切る。</li>
          </ul>
          <p>
            この章では、請求書（Invoice）がルートで、明細行（InvoiceLine）は請求書を通してだけ変更します。請求書のルートが守る規則は次の3つです。
          </p>
          <ul>
            <li>請求書の合計は、明細の「数量 × 単価」の合計と等しい。</li>
            <li>発行した請求書（<code>issued_at</code> がある請求書）は、明細も含めて変更しない。</li>
            <li>明細の数量は1以上で、単価は0以上（明細の検証を、請求書の保存のときにまとめて行う）。</li>
          </ul>
          <Figure n="84-4" title="請求書の集約と保存の範囲" caption="rails-impl の節のコードの構成をまとめた模式図。破線の枠が集約で、1回の save! の範囲。">
            <AggregateFigure />
          </Figure>
          <p>
            図 84-4 の左の枠が請求書の集約です。コントローラーは請求書の <code>update</code> を1回呼び、変更した設計、新しい研修、削除の印を付けた保守を、請求書と一緒に1つのトランザクションで保存します。右の枠は翌月分の請求書で、別の集約です。明細を別の請求書へ移す <code>move_line_to!</code> だけは2つの集約を変えるので、下の段のとおり transaction で2つの <code>save!</code> を囲みます。左下のように、ほかの処理が明細の <code>update!</code> を直接呼ぶと、ルートの規則（合計の計算と発行済みの確認）を通らずに明細だけが確定します。
          </p>
          <h3>集約の境界の決め方</h3>
          <ul>
            <li>同じ規則でつながっているものを、同じ集約に入れます。合計と明細は「合計 = 明細の和」という規則でつながっているので、同じ集約です。</li>
            <li>
              別々に変わってよいものは、別の集約にします。取引先の住所や商品の単価表は、請求書とは別に変わります。請求書はそれらを ID などで参照し、自分の中に持つのは請求した時点の値（品目名・単価）です。
            </li>
            <li>集約は小さくします。集約が大きいと、1回の保存で書き込む行とロックする行が増え、同時に編集する人とぶつかりやすくなります。</li>
          </ul>
          <p>
            Rails では、ルートのモデルに <code>has_many ... autosave: true</code> を書き、子の追加・変更・削除をルートの <code>save</code> にまとめることで集約を表します。Ruby には、子のモデルを外から保存させない仕組みはありません。「明細の保存は請求書を通す」という約束は、コードレビューとテストで守ります。
          </p>
        </>
      ),
    },
    {
      id: 'active-record',
      title: 'Active Record が Unit of Work ではない理由',
      body: (
        <>
          <p>
            Fowler の Active Record パターンは、表の1行を包み、DB へのアクセスと業務の処理を同じオブジェクトに持たせるものです<Ref n={3} />。Rails の <code>ActiveRecord::Base</code> はこの考え方に沿っていて、各オブジェクトが自分の <code>save</code> を持ち、呼んだ時点でその行を書き込みます（<ChapterLink n={11} section="record-pattern" />）。複数のオブジェクトの変更を一覧にして、まとめて書き込む仕組みはありません。この節では、その違いを4つの実行結果で確かめます。
          </p>
          <Callout kind="note" title="原典との定義のずれ">
            <p>
              Fowler のカタログでは、Active Record と Unit of Work は別のパターンです。Active Record は1行を1つのオブジェクトが保存するパターン、Unit of Work は複数のオブジェクトの変更を取りまとめて書き込むパターンです。Rails の ORM の名前が Active Record なので、Rails の save や transaction を「Unit of Work」と呼ぶ説明を見かけますが、MSDP のカタログと本書では区別します。この章で Rails の機能を指すときは、autosave・トランザクションと呼びます。
            </p>
          </Callout>
          <h3>同じ行を読むたびに別のオブジェクトができる</h3>
          <p>
            Rails は Identity Map を持ちません。Rails 4.0 のリリースノートには、IdentityMap を取り除いたことが書かれています<Ref n={11} />。同じ請求書を2回読みました。コントローラーの中と同じく、クエリキャッシュ（同じリクエストの中で、同じ SELECT の結果を再利用する仕組み。<ChapterLink n={12} section="query-cache" />）を有効にしています。
          </p>
          <Code
            lang="text"
            title="実行結果（1. 同じ行を2回読む）"
            code={`
ActiveRecord::Base.cache do
  a = Invoice.find(1)
  b = Invoice.find(1)
end
    Invoice Load  SELECT \`invoices\`.* FROM \`invoices\` WHERE \`invoices\`.\`id\` = 1 LIMIT 1
    CACHE Invoice Load  SELECT \`invoices\`.* FROM \`invoices\` WHERE \`invoices\`.\`id\` = 1 LIMIT 1
a.equal?(b) => false  a == b => true
`}
          />
          <p>
            2回目の SELECT は DB に送られず、キャッシュした結果の行が使われました（ログの CACHE）。それでもオブジェクトは毎回作られるので、<code>equal?</code>（同じオブジェクトか）は false です。<code>==</code> が true なのは、Active Record がクラスと id が同じレコードを等しいと判定するためで、同じオブジェクトだからではありません。
          </p>
          <h3>変更の追跡は1つのオブジェクトの中だけ</h3>
          <p>
            同じ明細を2つのオブジェクト x と y に読み込み、x では数量を、y では単価を変えて、順に保存しました。
          </p>
          <Code
            lang="text"
            title="実行結果（2. 別々の列を変える、3. 同じ列を変える）"
            code={`
x = InvoiceLine.find(1); y = InvoiceLine.find(1)
x.quantity = 3; y.unit_price = 2500
x.changes => {"quantity" => [1, 3]}
y.changes => {"unit_price" => [2000, 2500]}
x.save!; y.save!
    TRANSACTION  BEGIN
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = 3, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 1
    TRANSACTION  COMMIT
    TRANSACTION  BEGIN
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`unit_price\` = 2500, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 1
    TRANSACTION  COMMIT
DB: {"quantity" => 3, "unit_price" => 2500}  y.quantity => 1

x.update!(quantity: 5); y.update!(quantity: 4)
DB: {"quantity" => 4}
`}
          />
          <p>
            各オブジェクトは、読み込んだときの値を覚えていて、<code>changes</code> で変わった属性を返します<Ref n={10} />。<code>save!</code> の UPDATE には、変わった列と <code>updated_at</code> だけが入りました。保存する列を変わったものに絞る仕組みを部分更新（partial updates）と呼び、<code>attribute_names_for_partial_updates</code> が変わった列の名前を返します<Ref n={14} />（仕組みは<ChapterLink n={11} section="dirty" />で扱いました）。これは、1つのオブジェクトの中で読み込んだ値と今の値を比べる、図 84-2 の右の方法です。
          </p>
          <p>
            部分更新なので、x と y が別の列を変えた場合は両方の変更が残りました。ただし y は x の変更を知らず、<code>y.quantity</code> は 1 のままです。同じ列を変えた場合は、後に保存した y の値 4 が残り、x の 5 は消えました。後の保存が先の変更を消すこの現象と、その防ぎ方は<ChapterLink n={49} section="scene" />で扱います。
          </p>
          <h3>親の save が書き込む子の範囲</h3>
          <p>
            請求書の save で明細も保存されるかは、<code>has_many</code> の <code>autosave</code> の指定で変わります。scene の節の Invoice（autosave を指定しない）で、関連の配列から取り出した設計の数量を変え、研修を <code>build</code> してから請求書を <code>save!</code> しました。
          </p>
          <Code
            lang="text"
            title="実行結果（autosave を指定しない has_many）"
            code={`
invoice = Invoice.find(1)
invoice.lines.find { it.description == "設計" }.quantity = 3
invoice.lines.build(description: "研修", quantity: 2, unit_price: 500)
invoice.save!
    TRANSACTION  BEGIN
    InvoiceLine Create  INSERT INTO \`invoice_lines\` (\`invoice_id\`, \`description\`, \`quantity\`, \`unit_price\`, \`created_at\`, \`updated_at\`) VALUES (1, '研修', 2, 500, …, …)
    TRANSACTION  COMMIT
合計=3000 明細=["設計 1×2000", "保守 1×1000", "研修 2×500"] 明細から計算した合計=4000
`}
          />
          <p>
            新しい研修は INSERT されましたが、設計の数量の変更は保存されていません。Rails の API ドキュメントのとおり、autosave を宣言しない関連では、新しい子は親と一緒に保存され、変更した既存の子は保存されません<Ref n={7} />。<code>autosave: true</code> を付けると、変更した子と新しい子を保存し、<code>mark_for_destruction</code> で削除の印を付けた子を削除します。親と子の保存と削除は、すべて1つのトランザクションの中で行われます<Ref n={7} />。どの子を保存するかを決めるのは次のメソッドです。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/autosave_association.rb（298〜306行目）"
            href={`${GH}/activerecord/lib/active_record/autosave_association.rb#L298-L306`}
            code={`
      def associated_records_to_validate_or_save(association, new_record, autosave)
        if new_record || custom_validation_context?
          association && association.target
        elsif autosave
          association.target.find_all(&:changed_for_autosave?)
        else
          association.target.find_all(&:new_record?)
        end
      end
`}
          />
          <p>
            対象になるのは <code>association.target</code>、つまり親が関連の配列として読み込んで持っているオブジェクトだけです。autosave のときは、その中で新しいもの・変更があるもの・削除の印があるもの（<code>changed_for_autosave?</code>）を選びます。親の知らないオブジェクトは対象になりません。autosave: true の Invoice で確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（4. 明細だけを変えたときの請求書、5. 別に読み込んだ明細）"
            code={`
invoice = Invoice.find(1)
detached = invoice.lines.first # 関連を読み込んでいないので、別の SELECT で1件を読む
detached.quantity = 3
lines.first で取り出した明細を変更: invoice.changed_for_autosave? => false
invoice.lines.find { it.description == "設計" }.quantity = 3 # ブロックの find は関連を読み込む
invoice.changed? => false  invoice.changed_for_autosave? => true

invoice = Invoice.find(1); invoice.lines.load
line = InvoiceLine.find(1) # invoice.lines の中のオブジェクトとは別
line.quantity = 9
invoice.save!
DB: 設計の数量 => 1
`}
          />
          <p>
            関連を読み込んでいない状態の <code>invoice.lines.first</code> は、<code>LIMIT 1</code> の SELECT を別に送り、関連の配列に入らないオブジェクトを返します。関連の配列から探すのは、読み込み済みか、配列に新しいオブジェクトや変更のあるオブジェクトがある場合などに限られます<Ref n={15} />。そのため、<code>first</code> で取り出した明細を変えても、請求書は変更があると判断しません。ブロックを渡した <code>find</code> は関連の配列を読み込んでから探すので、そこで変えた明細は <code>changed_for_autosave?</code> に反映されます。請求書自身の属性は変わっていないので、<code>changed?</code> は false のままです。
          </p>
          <p>
            5 では、<code>InvoiceLine.find(1)</code> で別に読み込んだオブジェクトを変えてから請求書を保存しましたが、数量は 1 のままでした。Unit of Work は、業務の操作の中で読み込んだすべてのオブジェクトを覚えています。Rails の autosave は、親が関連の配列として持つオブジェクトしか見ません。
          </p>
          <h3>トランザクションの中の SQL は、その場で送られる</h3>
          <p>
            Unit of Work は commit まで SQL を送りません。Rails のトランザクションは、ブロックの中の SQL をその場で送り、確定を COMMIT まで延ばします。
          </p>
          <Code
            lang="text"
            title="実行結果（6. トランザクションの中で2件を更新する）"
            code={`
Invoice.transaction do
  InvoiceLine.find(1).update!(quantity: 3)
  InvoiceLine.where(id: 1).pick(:quantity) # トランザクションの中で読む
  InvoiceLine.find(2).update!(quantity: 2)
end
    TRANSACTION  BEGIN
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 1 LIMIT 1
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = 3, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 1
    InvoiceLine Pluck  SELECT \`invoice_lines\`.\`quantity\` FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 1 LIMIT 1
  （トランザクションの中で読む）設計の数量 => 3
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 2 LIMIT 1
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = 2, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 2
    TRANSACTION  COMMIT
`}
          />
          <p>
            1件目の UPDATE はその場で送られ、同じ接続で読むと数量 3 が見えます。ほかの接続からは COMMIT まで見えず、UPDATE した行のロックは COMMIT まで続きます（<ChapterLink n={38} section="lock" />、<ChapterLink n={38} section="isolation" />）。違いをまとめます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">Unit of Work</th>
                  <th scope="col">Rails の Active Record</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">変更を記録する範囲</th>
                  <td>業務の操作で読み込んだすべてのオブジェクト</td>
                  <td>各オブジェクトが自分の変更だけ（<code>changes</code>）。autosave は関連の配列の中だけ</td>
                </tr>
                <tr>
                  <th scope="row">SQL を送る時点</th>
                  <td>commit のとき</td>
                  <td>save を呼んだとき。トランザクションの中でも、その場で送る</td>
                </tr>
                <tr>
                  <th scope="row">Identity Map</th>
                  <td>あり</td>
                  <td>なし。読むたびに別のオブジェクト</td>
                </tr>
                <tr>
                  <th scope="row">まとめて確定する範囲</th>
                  <td>1回の commit</td>
                  <td>親の save と autosave の関連（1つの集約）、または transaction のブロック</td>
                </tr>
                <tr>
                  <th scope="row">書き込みの順序</th>
                  <td>Unit of Work が決める</td>
                  <td>親 → 削除の印の子 → 残りの子を配列の順（rails-impl の節）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：autosave とトランザクションでまとめて保存する',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  controllers/invoices_controller.rb   # invoice.update(invoice_params) の1回で保存する
  models/invoice.rb                    # 集約のルート。autosave・合計の計算・発行済みの確認
  models/invoice_line.rb               # 明細行の検証と小計
  views/invoices/edit.html.erb         # fields_for で明細の行を並べる
db/migrate/20261120000001_create_invoices.rb
spec/models/invoice_spec.rb
spec/requests/invoices_spec.rb
`}
          />
          <p>新しいディレクトリは作りません。Unit of Work に当たるクラスもありません。</p>
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261120000001_create_invoices.rb"
            code={`
class CreateInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :invoices do |t|
      t.string :customer, null: false
      t.integer :total, null: false, default: 0 # 明細行の合計（円）
      t.datetime :issued_at                      # 発行した日時。発行後は変更しない
      t.timestamps
    end

    create_table :invoice_lines do |t|
      t.references :invoice, null: false, foreign_key: true
      t.string :description, null: false
      t.integer :quantity, null: false
      t.integer :unit_price, null: false # 単価（円）
      t.timestamps
    end
    add_check_constraint :invoice_lines, "quantity > 0", name: "invoice_lines_quantity_positive"
  end
end
`}
          />
          <p>
            明細の数量は、モデルの検証に加えて CHECK 制約でも1以上に限ります。モデルの検証は利用者にわかるエラーを返すためのもので、CHECK 制約は <code>update_all</code> のように検証を通らない書き込みでも条件を守るためのものです（<ChapterLink n={14} section="skip" />）。外部キーは <code>ON DELETE</code> を指定していないので、明細が残っている請求書は DB が削除を拒否します。
          </p>
          <h3>モデル</h3>
          <Code
            lang="ruby"
            title="app/models/invoice.rb"
            code={`
class Invoice < ApplicationRecord
  # 請求書が集約のルート。明細行は請求書の save で一緒に保存・削除する
  has_many :lines, class_name: "InvoiceLine", inverse_of: :invoice,
                   dependent: :destroy, autosave: true
  accepts_nested_attributes_for :lines, allow_destroy: true

  validates :customer, presence: true
  validate :not_issued, on: :update
  before_save :recalculate_total

  # 明細行を別の請求書へ移す。2つの集約を1つのトランザクションで保存する
  def move_line_to!(other, line_id)
    line = lines.find { it.id == line_id } or raise ActiveRecord::RecordNotFound
    line.mark_for_destruction
    other.lines.build(line.attributes.slice("description", "quantity", "unit_price"))
    transaction do
      save!
      other.save!
    end
  end

  private

  def recalculate_total
    self.total = lines.reject(&:marked_for_destruction?).sum(&:subtotal)
  end

  # 発行した請求書は、明細も含めて変更しない
  def not_issued
    errors.add(:base, "発行済みの請求書は変更できません") if issued_at_in_database.present?
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/invoice_line.rb"
            code={`
class InvoiceLine < ApplicationRecord
  belongs_to :invoice
  validates :description, presence: true
  validates :quantity, numericality: { only_integer: true, greater_than: 0 }
  validates :unit_price, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def subtotal = quantity * unit_price
end
`}
          />
          <p>Invoice の各行は、次のことをしています。</p>
          <ul>
            <li>
              <code>autosave: true</code>：請求書を保存するときに、関連の配列の中で変更・追加・削除の印がある明細を保存・削除します。<code>inverse_of</code> を付けると、<code>build</code> した明細の <code>invoice</code> が同じ請求書のオブジェクトを指します。
            </li>
            <li>
              <code>accepts_nested_attributes_for :lines, allow_destroy: true</code>：<code>lines_attributes</code> でフォームの行を受け取ります。id のない行は <code>build</code>、id のある行は既存の明細への代入、<code>_destroy</code> が真の行は削除の印になります<Ref n={8} />。このメソッドは関連の <code>autosave</code> を自動で有効にします<Ref n={8} /><Ref n={13} />。
            </li>
            <li>
              <code>before_save :recalculate_total</code>：削除の印がない明細から合計を計算します。autosave の子の保存は親の <code>after_create</code>・<code>after_update</code> のコールバックで行われるので<Ref n={12} />、<code>before_save</code> はその前に動き、メモリー上の明細から合計を求めます。合計はどの保存の経路でも必要な値なので、コントローラーではなくルートに置きます。
            </li>
            <li>
              <code>validate :not_issued, on: :update</code>：DB に保存されている <code>issued_at</code> を見て、発行済みなら保存を止めます。明細だけを変えた場合も、請求書の検証は動きます。
            </li>
          </ul>
          <h3>コントローラーとフォーム</h3>
          <Code
            lang="ruby"
            title="app/controllers/invoices_controller.rb"
            code={`
class InvoicesController < ApplicationController
  # …（省略：show と edit は Invoice.find(params[:id]) だけ）

  def update
    @invoice = Invoice.find(params[:id])
    if @invoice.update(invoice_params) # 請求書と明細を1つのトランザクションで保存する
      redirect_to invoice_path(@invoice)
    else
      render :edit, status: :unprocessable_content
    end
  end

  private

  def invoice_params
    params.expect(invoice: [:customer, lines_attributes: [[:id, :description, :quantity, :unit_price, :_destroy]]])
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/invoices/edit.html.erb"
            code={`
<ul id="errors"><% @invoice.errors.full_messages.each do |message| %><li><%= message %></li><% end %></ul>
<%= form_with model: @invoice do |form| %>
  <%= form.fields_for :lines do |line_form| %>
    <%= line_form.text_field :description %>
    <%= line_form.number_field :quantity %>
    <%= line_form.number_field :unit_price %>
    <% if line_form.object.persisted? %><%= line_form.check_box :_destroy %><% end %>
  <% end %>
  <%= form.submit "保存" %>
<% end %>
`}
          />
          <p>
            <code>fields_for</code> は、<code>invoice[lines_attributes][0][quantity]</code> のような名前で明細の行を送ります。フォームの組み立て方と許可するパラメーターの形は<ChapterLink n={16} section="nested-form" />で扱いました。<code>update</code> は属性の代入と保存を1つのトランザクションの中で行い、検証に失敗すれば false を返します。
          </p>
          <p>
            <code>lines_attributes</code> の id は、その請求書の明細の中から探されます。ほかの請求書の明細の id を送ると <code>ActiveRecord::RecordNotFound</code> になり、ほかの請求書の明細は変わりません（test の節の5つ目のテスト）。
          </p>
          <h3>発行される SQL の順序</h3>
          <p>scene の節と同じ内容を、<code>lines_attributes</code> の形で送りました。</p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4。所要時間と日時の値は省略）"
            code={`
== 保存の前: 合計=3000 明細=["設計 1×2000", "保守 1×1000"] 明細から計算した合計=3000
== 1回目の保存（研修の数量が 0）
    Invoice Load  SELECT \`invoices\`.* FROM \`invoices\` WHERE \`invoices\`.\`id\` = 1 LIMIT 1
    TRANSACTION  BEGIN
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1 AND \`invoice_lines\`.\`id\` IN (1, 2)
    TRANSACTION  ROLLBACK
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1
応答: 422 <ul id="errors"><li>Lines quantity must be greater than 0</li></ul>
== 後: 合計=3000 明細=["設計 1×2000", "保守 1×1000"] 明細から計算した合計=3000
== 研修の数量を 2 に直して、もう一度保存
    Invoice Load  SELECT \`invoices\`.* FROM \`invoices\` WHERE \`invoices\`.\`id\` = 1 LIMIT 1
    TRANSACTION  BEGIN
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1 AND \`invoice_lines\`.\`id\` IN (1, 2)
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1
    Invoice Update  UPDATE \`invoices\` SET \`invoices\`.\`total\` = 7000, \`invoices\`.\`updated_at\` = … WHERE \`invoices\`.\`id\` = 1
    InvoiceLine Destroy  DELETE FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 2
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = 3, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 1
    InvoiceLine Create  INSERT INTO \`invoice_lines\` (\`invoice_id\`, \`description\`, \`quantity\`, \`unit_price\`, \`created_at\`, \`updated_at\`) VALUES (1, '研修', 2, 500, …, …)
    TRANSACTION  COMMIT
応答: 302
== 後: 合計=7000 明細=["設計 3×2000", "研修 2×500"] 明細から計算した合計=7000
`}
          />
          <p>
            1回目は、明細の検証が保存の前に失敗したので、INSERT・UPDATE・DELETE を1つも送らずに ROLLBACK しました。エラーは請求書の <code>errors</code> に「Lines quantity must be greater than 0」として集まり、編集画面が 422 で返ります。最後の SELECT は、編集画面を描くときに明細を読み直したものです。DB は保存の前と同じなので、利用者は数量を直してそのまま送り直せます。
          </p>
          <p>
            2回目は、BEGIN から COMMIT までに、請求書の UPDATE（合計 7,000）、保守の DELETE、設計の UPDATE、研修の INSERT が入りました。親の UPDATE が先なのは、子の保存が親の <code>after_update</code> のコールバックだからです<Ref n={12} />。子の中では、削除の印を付けたものを先にすべて DELETE し、残りを関連の配列の順に UPDATE・INSERT します。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/autosave_association.rb（430〜460行目）"
            href={`${GH}/activerecord/lib/active_record/autosave_association.rb#L419-L463`}
            code={`
          if records = associated_records_to_validate_or_save(association, new_record_before_save, autosave)
            if autosave
              records_to_destroy = records.select(&:marked_for_destruction?)
              records_to_destroy.each { |record| association.destroy(record) }
              records -= records_to_destroy
            end

            records.each do |record|
              next if record.destroyed?

              saved = true

              if autosave != false && (new_record_before_save || record.new_record?)
                association.set_inverse_instance(record)

                if autosave
                  saved = association.insert_record(record, false)
                elsif !reflection.nested?
                  # …（省略：autosave を指定しない場合）
                end
              elsif autosave
                saved = record.save(validate: false)
              end

              raise(RecordInvalid.new(association.owner)) unless saved
            end
          end
`}
          />
          <p>
            子の検証は親の検証のときに済んでいるので、子の保存は <code>validate: false</code> で行います。新しい請求書を作る場合は、親の INSERT が先なので、子の INSERT には請求書の id が入ります。削除の印を付けた子を先に DELETE するので、同じ値の明細を削除して追加し直しても、一意制約に先にぶつかることはありません。
          </p>
          <h3>書き込みの途中で DB がエラーを返したとき</h3>
          <p>
            検証を通っても、DB の制約で書き込みが失敗することがあります。検証を飛ばす <code>save!(validate: false)</code> で、保守の数量を -1 にして保存しました。
          </p>
          <Code
            lang="text"
            title="実行結果（研修を追加し、保守の数量を -1 にして save!(validate: false)）"
            code={`
    TRANSACTION  BEGIN
    Invoice Update  UPDATE \`invoices\` SET \`invoices\`.\`total\` = 2000, \`invoices\`.\`updated_at\` = … WHERE \`invoices\`.\`id\` = 1
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = -1, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 2
    TRANSACTION  ROLLBACK
=> ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'invoice_lines_quantity_positive' is violated.
合計=3000 明細=["設計 1×2000", "保守 1×1000"] 明細から計算した合計=3000
`}
          />
          <p>
            請求書の UPDATE は送られた後でしたが、明細の UPDATE が CHECK 制約に違反した時点で ROLLBACK され、合計も 3,000 に戻りました。研修の INSERT は送られていません。Rails のトランザクションは SQL をその場で送るので、途中まで実行してから取り消す、という動きになります。
          </p>
          <h3>複数の集約をまとめて保存する</h3>
          <p>
            請求先を間違えた明細を、同じ取引先の翌月分の請求書へ移す操作を考えます。移す元と移す先の2つの集約を変えるので、親の <code>save!</code> 1回では足りません。移す先の請求書が発行済みの場合に、トランザクションなしで2回 <code>save!</code> した結果（A）と、<code>move_line_to!</code> の結果（B）を比べました。
          </p>
          <Code
            lang="ruby"
            title="A：トランザクションなしで2回 save! する"
            code={`
line = from.lines.find { it.description == "保守" }
line.mark_for_destruction
to.lines.build(line.attributes.slice("description", "quantity", "unit_price"))
from.save!
to.save!
`}
          />
          <Code
            lang="text"
            title="実行結果（移す先の請求書 2 は発行済み）"
            code={`
== A: トランザクションなしで2回 save!
  => ActiveRecord::RecordInvalid: Validation failed: 発行済みの請求書は変更できません
  請求書1: 合計=2000 明細=["設計 1×2000"] 明細から計算した合計=2000
  請求書2: 合計=0 明細=[] 明細から計算した合計=0
== B: move_line_to!
  => ActiveRecord::RecordInvalid: Validation failed: 発行済みの請求書は変更できません
  請求書1: 合計=3000 明細=["設計 1×2000", "保守 1×1000"] 明細から計算した合計=3000
  請求書2: 合計=0 明細=[] 明細から計算した合計=0
`}
          />
          <p>
            A では、移す元の <code>save!</code> が確定した後で移す先の <code>save!</code> が失敗し、保守の明細がどちらの請求書からも消えました。それぞれの請求書の中では合計と明細が合っていますが、取引先に請求する明細が1行なくなっています。B では、<code>transaction</code> のブロックの中で例外が起きたので、移す元の DELETE と合計の UPDATE も取り消されました。移す先が未発行の場合の SQL は次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（C：move_line_to!。移す先は未発行）"
            code={`
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1
    TRANSACTION  BEGIN
    Invoice Update  UPDATE \`invoices\` SET \`invoices\`.\`total\` = 2000, \`invoices\`.\`updated_at\` = … WHERE \`invoices\`.\`id\` = 1
    InvoiceLine Destroy  DELETE FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 2
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 2
    Invoice Update  UPDATE \`invoices\` SET \`invoices\`.\`total\` = 1000, \`invoices\`.\`updated_at\` = … WHERE \`invoices\`.\`id\` = 2
    InvoiceLine Create  INSERT INTO \`invoice_lines\` (\`invoice_id\`, \`description\`, \`quantity\`, \`unit_price\`, \`created_at\`, \`updated_at\`) VALUES (2, '保守', 1, 1000, …, …)
    TRANSACTION  COMMIT
  請求書1: 合計=2000 明細=["設計 1×2000"] 明細から計算した合計=2000
  請求書2: 合計=1000 明細=["保守 1×1000"] 明細から計算した合計=1000
`}
          />
          <p>
            BEGIN と COMMIT は1組だけです。<code>save!</code> もトランザクションを開きますが、外側の <code>transaction</code> がすでに開いているので、新しいトランザクションを作らずに外側に参加します（<ChapterLink n={15} section="nested" />）。<code>transaction</code> はモデルのクラスやインスタンスから呼んでも、<code>ActiveRecord::Base.transaction</code> と同じく DB の接続のトランザクションを開きます<Ref n={9} />。
          </p>
          <p>
            2つの集約を1つのトランザクションにするのは、この例のように「片方だけ確定すると業務の記録がなくなる」操作に限ります。理由は anti-patterns の節の「1回の commit に何でも入れる」で確かめます。
          </p>
          <h3>子に直接 update!・create! すると</h3>
          <p>
            autosave を付けても、子のモデルの保存メソッドを直接呼べば、その場で1件ずつ確定します。設計の明細に <code>update!(quantity: 5)</code> を呼んでから、数量 0 の研修を <code>invoice.lines.create!</code> で作ると、create! は失敗しますが設計の数量 5 は残り、合計は 3,000 のままでした（test の節の4つ目のテスト）。scene の節のコードと同じ結果です。autosave で親の <code>save!</code> にまとめられるのは、親の関連の配列の中で変えた子だけです。
          </p>
          <h3>リファクタリングの手順</h3>
          <p>scene の節のコードから、次の順に直しました。</p>
          <ol>
            <li>集約を決めます。一緒に保存するのは請求書と明細行で、ルートは請求書です。</li>
            <li>has_many に <code>autosave: true</code> と <code>inverse_of</code> を付け、<code>accepts_nested_attributes_for</code> でフォームの行を受け取れるようにします。</li>
            <li>合計の計算と発行済みの確認を、ルートの <code>before_save</code> と <code>validate</code> に移します。</li>
            <li>コントローラーから、明細ごとの <code>create!</code>・<code>update!</code>・<code>destroy!</code> と合計の計算を消し、<code>@invoice.update(invoice_params)</code> の1回にします。フォームの名前を <code>lines</code> から <code>lines_attributes</code> に変えます。</li>
            <li>複数の集約を変える操作は、ルートのメソッド（または Service）にまとめ、<code>transaction</code> で囲みます。</li>
            <li>途中の失敗で何も残らないことを、テストで確かめます。</li>
          </ol>
          <Callout kind="v72">
            <p>
              autosave で保存する子を選ぶ処理（<code>save_collection_association</code>・<code>associated_records_to_validate_or_save</code>）、<code>accepts_nested_attributes_for</code> が autosave を有効にする処理、関連の配列から探す条件（<code>find_from_target?</code>）は、Rails 7.2.2.2 のソースと同じです。違うのは次の点です。<code>params.expect</code> は Rails 8.0 で加わったメソッドで<Ref n={16} />、7.2 では <code>params.require(:invoice).permit(:customer, lines_attributes: [:id, :description, :quantity, :unit_price, :_destroy])</code> と書きます。CHECK 制約の違反は 8.1 で加わった <code>ActiveRecord::CheckViolation</code> になり、7.2 では <code>ActiveRecord::StatementInvalid</code> です。ブロックの <code>it</code> は Ruby 3.4 からで（<ChapterLink n={4} section="block-to-proc" />）、それより前の Ruby では <code>{'{'} |line| line.id == line_id {'}'}</code> と書きます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <p>
            モデルのテストで、まとめて保存すること、途中の失敗で何も残らないこと、比べるための例として子に直接保存すると1件ずつ確定することを確かめます。リクエストのテストで、フォームから送った内容が1回で保存されることを確かめます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/invoice_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Invoice do
  let!(:invoice) do
    described_class.create!(customer: "山田商店", lines_attributes: [
      { description: "設計", quantity: 1, unit_price: 2000 },
      { description: "保守", quantity: 1, unit_price: 1000 },
    ])
  end

  def saved_lines = invoice.reload.lines.order(:id).pluck(:description, :quantity)

  it "メモリー上で追加・変更・削除の印を付け、save! の1回で保存する" do
    invoice.reload
    invoice.lines.build(description: "研修", quantity: 2, unit_price: 500)  # 追加
    invoice.lines.find { it.description == "設計" }.quantity = 3           # 変更
    invoice.lines.find { it.description == "保守" }.mark_for_destruction   # 削除の印

    expect { invoice.save! }.not_to change(InvoiceLine, :count) # 1件追加・1件削除
    expect(saved_lines).to eq([["設計", 3], ["研修", 2]])
    expect(invoice.total).to eq(7000)
  end

  it "明細の1つでも検証に失敗したら、何も保存しない" do
    invoice.reload
    invoice.lines.build(description: "研修", quantity: 2, unit_price: 500)
    invoice.lines.find { it.description == "設計" }.quantity = 0

    expect(invoice.save).to be(false)
    expect(invoice.errors.full_messages).to eq(["Lines quantity must be greater than 0"])
    expect(saved_lines).to eq([["設計", 1], ["保守", 1]])
    expect(invoice.total).to eq(3000)
  end

  it "書き込みの途中で DB がエラーを返したら、先に送った SQL も取り消す" do
    invoice.reload
    invoice.lines.build(description: "研修", quantity: 2, unit_price: 500)
    invoice.lines.find { it.description == "保守" }.quantity = -1 # 検証を飛ばして CHECK 制約で失敗させる

    expect { invoice.save!(validate: false) }.to raise_error(ActiveRecord::CheckViolation)
    expect(saved_lines).to eq([["設計", 1], ["保守", 1]])
    expect(invoice.total).to eq(3000)
  end

  it "比べるための例：明細に直接 update!・create! すると、その場で1件ずつ確定する" do
    design = invoice.lines.find_by!(description: "設計")
    design.update!(quantity: 5) # この時点で DB に確定する
    expect { invoice.lines.create!(description: "研修", quantity: 0, unit_price: 500) }
      .to raise_error(ActiveRecord::RecordInvalid)

    expect(saved_lines).to eq([["設計", 5], ["保守", 1]]) # 先の変更だけが残る
    expect(invoice.total).to eq(3000)                   # 合計は明細と合わない
  end

  it "ほかの請求書の明細の id を渡すと、RecordNotFound になる" do
    other = described_class.create!(customer: "佐藤工務店", lines_attributes: [{ description: "点検", quantity: 1, unit_price: 800 }])

    expect { invoice.update(lines_attributes: [{ id: other.lines.first.id, quantity: 9 }]) }
      .to raise_error(ActiveRecord::RecordNotFound)
    expect(other.lines.first.reload.quantity).to eq(1)
  end

  describe "#move_line_to!" do
    let!(:next_invoice) { described_class.create!(customer: "山田商店") }
    let(:line_id) { invoice.lines.find_by!(description: "保守").id }

    it "2つの請求書の明細と合計を、1つのトランザクションで保存する" do
      invoice.move_line_to!(next_invoice, line_id)

      expect(saved_lines).to eq([["設計", 1]])
      expect(invoice.total).to eq(2000)
      expect(next_invoice.reload.lines.pluck(:description)).to eq(["保守"])
      expect(next_invoice.total).to eq(1000)
    end

    it "移す先が発行済みなら、移す元の削除も取り消す" do
      next_invoice.update!(issued_at: Time.current)

      expect { invoice.move_line_to!(next_invoice, line_id) }
        .to raise_error(ActiveRecord::RecordInvalid, /発行済みの請求書は変更できません/)
      expect(saved_lines).to eq([["設計", 1], ["保守", 1]])
      expect(invoice.total).to eq(3000)
      expect(next_invoice.reload.lines).to be_empty
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/invoices_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "請求書の編集", type: :request do
  let!(:invoice) do
    Invoice.create!(customer: "山田商店", lines_attributes: [
      { description: "設計", quantity: 1, unit_price: 2000 },
      { description: "保守", quantity: 1, unit_price: 1000 },
    ])
  end
  let(:design) { invoice.lines.find_by!(description: "設計") }
  let(:support) { invoice.lines.find_by!(description: "保守") }

  def patch_lines(training_quantity)
    patch invoice_path(invoice), params: { invoice: { lines_attributes: {
      "0" => { id: design.id, description: "設計", quantity: 3, unit_price: 2000 },
      "1" => { id: support.id, _destroy: "1" },
      "2" => { description: "研修", quantity: training_quantity, unit_price: 500 },
    } } }
  end

  it "1行でも入力に誤りがあれば、何も保存せずに編集画面を 422 で返す" do
    patch_lines(0)

    expect(response).to have_http_status(:unprocessable_content)
    expect(response.body).to include("Lines quantity must be greater than 0")
    expect(invoice.reload.total).to eq(3000)
    expect(invoice.lines.order(:id).pluck(:description, :quantity)).to eq([["設計", 1], ["保守", 1]])
  end

  it "誤りを直して送り直すと、追加・変更・削除と合計をまとめて保存する" do
    patch_lines(0)
    patch_lines(2)

    expect(response).to redirect_to(invoice_path(invoice))
    expect(invoice.reload.total).to eq(7000)
    expect(invoice.lines.order(:id).pluck(:description, :quantity)).to eq([["設計", 3], ["研修", 2]])
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
Invoice
  メモリー上で追加・変更・削除の印を付け、save! の1回で保存する
  明細の1つでも検証に失敗したら、何も保存しない
  書き込みの途中で DB がエラーを返したら、先に送った SQL も取り消す
  比べるための例：明細に直接 update!・create! すると、その場で1件ずつ確定する
  ほかの請求書の明細の id を渡すと、RecordNotFound になる
  #move_line_to!
    2つの請求書の明細と合計を、1つのトランザクションで保存する
    移す先が発行済みなら、移す元の削除も取り消す

環境
  MySQL 8.4 につながる

請求書の編集
  1行でも入力に誤りがあれば、何も保存せずに編集画面を 422 で返す
  誤りを直して送り直すと、追加・変更・削除と合計をまとめて保存する

Finished in 0.34534 seconds (files took 3.38 seconds to load)
10 examples, 0 failures
`}
          />
          <p>各テストで確かめていることは次のとおりです（「環境」は検証用のアプリが MySQL 8.4 につながることの確認です）。</p>
          <ul>
            <li>1つ目：メモリー上の追加・変更・削除の印が、<code>save!</code> の1回で保存されること。件数が変わらないのは、1件追加して1件削除したためです。合計も <code>before_save</code> で 7,000 になります。</li>
            <li>2つ目：明細の1つが検証に失敗したら、<code>save</code> が false を返し、どの明細も合計も変わらないこと。エラーは請求書の <code>errors</code> に集まります。</li>
            <li>3つ目：DB の制約で書き込みの途中に失敗しても、先に送った請求書の UPDATE が取り消されること。</li>
            <li>4つ目：比べるための例です。子の <code>update!</code> と <code>create!</code> は1件ずつ確定し、先の変更だけが残って合計と合わなくなること。</li>
            <li>5つ目：<code>lines_attributes</code> でほかの請求書の明細を変えられないこと。</li>
            <li>6・7つ目：<code>move_line_to!</code> が2つの集約をまとめて保存し、移す先が発行済みなら移す元の変更も取り消すこと。</li>
            <li>リクエストのテスト：フォームの形（<code>lines_attributes</code> の添字つきの行）で送った内容が、誤りがあれば何も保存されず 422 になり、直して送り直せば1回で保存されること。</li>
          </ul>
          <p>
            rspec-rails の既定の <code>use_transactional_fixtures = true</code> では、各テストが1つのトランザクションの中で動き、テストの中の <code>save!</code> や <code>transaction</code> は SAVEPOINT になります（<ChapterLink n={20} section="transaction" />）。3つ目や7つ目のように内側で失敗した場合も、SAVEPOINT まで戻るので、ロールバックの結果をテストの中で確かめられます。ほかの接続から見える状態（COMMIT した後の状態）は、このテストでは確かめていません。その確認は scene や rails-impl の節の <code>rails runner</code> の実行結果で行いました。
          </p>
        </>
      ),
    },
    {
      id: 'consequences',
      title: '効果と代償',
      body: (
        <>
          <h3>得られるもの</h3>
          <ul>
            <li>1回の保存で変えた内容が、すべて保存されるか、何も保存されないかのどちらかになります。scene の節の「合計と明細が合わない」「送り直すと 404」は起きません。</li>
            <li>明細の検証が書き込みの前に行われるので、入力の誤りを、DB を変える前に利用者へ返せます。</li>
            <li>コントローラーから SQL と合計の計算が消え、<code>@invoice.update(invoice_params)</code> の1行になります。合計の計算はルートにあるので、管理画面や API から保存しても同じ規則が適用されます。</li>
            <li>変わった明細と変わった列だけを書き込み、請求書の UPDATE も1回です。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>どの子が保存されるかが、関連の配列に入っているかで決まります。<code>invoice.lines.first</code> や <code>InvoiceLine.find</code> で取り出したオブジェクトを変えても保存されないことを、チームで共有しておく必要があります。</li>
            <li>保存のときの SQL の数と順序が、コードからは見えにくくなります。親の UPDATE → 子の DELETE → 子の UPDATE・INSERT の順になることは、ログで確かめます。</li>
            <li><code>before_save</code> の合計の計算は、明細を読み込んでいなければ SELECT を1回送ります。明細が数千行ある集約では、保存のたびにすべてを読むことになるので、集約の大きさを見直します。</li>
            <li>子に直接 <code>update!</code> する経路を、Ruby の言語の仕組みでは禁止できません。規約とレビュー、テストで守ります。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            集約の規則がルートのモデルにまとまるので、保存の経路が増えても規則を書き写す必要がありません。テストでは、メモリー上で集約を組み立てて <code>save</code> を1回呼び、DB の結果とエラーの内容を確かめます。トランザクションの中で失敗させるテストは、SAVEPOINT の範囲で書けます。複数の接続から見える状態や、同時に保存したときの動きを確かめるには、<code>use_transactional_fixtures</code> を使わない別のテストか、<code>rails runner</code> での実行が必要です。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <p>MSDP の4つのアンチパターンを、Rails の autosave とトランザクションの書き方に置き換えて、それぞれ実行しました。</p>
          <h3>Unit of Work を長く使い続ける：読み込んだ請求書を使い回す</h3>
          <p>
            Unit of Work（や ORM の Identity Map）をアプリケーション全体で共有すると、古いオブジェクトが残り続け、ほかのリクエストの変更が反映されません。Rails では、読み込んだ請求書をクラスの変数やキャッシュに入れて、リクエストをまたいで使い回すと同じことが起きます。
          </p>
          <Code
            lang="ruby"
            title="避ける書き方：プロセスの中で請求書を覚えておく"
            code={`
module InvoiceCache
  def self.fetch(id) = (@invoices ||= {})[id] ||= Invoice.includes(:lines).find(id)
end

InvoiceCache.fetch(1)                       # 1つ目のリクエストで読み込んで覚える
Invoice.find(1).update!(lines_attributes: [{ description: "研修", quantity: 2, unit_price: 500 }]) # 別の利用者が追加
cached = InvoiceCache.fetch(1)              # 2つ目のリクエスト：覚えたものを返す
cached.lines.build(description: "交通費", quantity: 1, unit_price: 300)
cached.save!
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
合計=3300 明細=["設計 1×2000", "保守 1×1000", "研修 2×500", "交通費 1×300"] 明細から計算した合計=4300
`}
          />
          <p>
            覚えておいた請求書は、別の利用者が追加した研修を知りません。交通費を足して保存すると、古い明細から計算した 3,300 円が合計として保存され、DB の明細から計算した 4,300 円と合わなくなりました。請求書はリクエストごとに読み込み、編集の画面を開いてから保存するまでに別の人が変えた場合は、楽観的ロックで検出します（<ChapterLink n={49} section="idea" />）。画面の操作の間 DB のトランザクションを開いておく書き方も、同じ理由で避けます。
          </p>
          <h3>commit の前に別の方法で書き込む：save! の前に update_all を呼ぶ</h3>
          <p>
            Unit of Work を使っている途中で、同じ行を SQL で直接更新すると、差分の計算が合わなくなります。Rails では、メモリー上で請求書を変えている間に、同じ明細を <code>update_all</code> や <code>update_column</code> で書き換えると起きます。
          </p>
          <Code
            lang="ruby"
            title="避ける書き方：メモリー上の変更と、別の方法の書き込みを混ぜる"
            code={`
invoice = Invoice.includes(:lines).find(1)
invoice.lines.find { it.description == "設計" }.quantity = 2
InvoiceLine.where(invoice_id: 1, description: "保守").update_all(quantity: 4) # 別の方法で書き込む
invoice.save!
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
合計=5000 明細=["設計 2×2000", "保守 4×1000"] 明細から計算した合計=8000
`}
          />
          <p>
            <code>update_all</code> は検証とコールバックを通らずに1文の UPDATE を送り、メモリー上の保守のオブジェクトは数量 1 のままです。<code>save!</code> の合計の計算はメモリー上の値を使うので 5,000 円になり、DB の明細から計算した 8,000 円と合いません。集約の中の書き込みは、ルートの <code>save</code> にまとめます。<code>update_all</code> が必要な一括の処理（<ChapterLink n={14} section="skip" />）は、集約を読み込んで編集する処理とは別に実行し、合計もその SQL の中で計算し直します。
          </p>
          <h3>集約の中の一部だけを保存する：明細に直接 update! する</h3>
          <p>
            明細行だけを別の処理で保存すると、合計と明細行がずれます。test の節の4つ目のテストのとおり、明細に直接 <code>update!</code> すると、その明細だけが確定し、請求書の <code>before_save</code> も発行済みの確認も動きません。
          </p>
          <Code
            lang="ruby"
            title="避ける書き方と直した書き方"
            code={`
# 避ける：ルートを通らない。合計は変わらず、発行済みの請求書の明細も変えられる
InvoiceLine.find(line_id).update!(quantity: 5)

# 直す：ルートの関連の配列から取り出して変え、ルートを保存する
invoice = Invoice.find(invoice_id)
invoice.lines.find { it.id == line_id }.quantity = 5
invoice.save!
`}
          />
          <p>
            active-record の節で見たとおり、関連を読み込まずに <code>invoice.lines.first</code> で取り出した明細も、関連の配列に入らないので保存されません。ブロックを渡す <code>find</code>、<code>includes(:lines)</code>、<code>lines.load</code> で配列を読み込んでから変えます。
          </p>
          <h3>1回の commit に何でも入れる：関係のない請求書を1つのトランザクションにする</h3>
          <p>
            関係のない複数の集約を1つのトランザクションにまとめると、ロックの範囲が広がり、同時に動くほかの処理とぶつかりやすくなります。月末に未発行の請求書をまとめて発行する処理を、1つのトランザクションで書きました。2件目の請求書は、すでに発行済みです。
          </p>
          <Code
            lang="ruby"
            title="避ける書き方：全件を1つのトランザクションで発行する"
            code={`
now = Time.current
Invoice.transaction do
  Invoice.order(:id).each { |inv| inv.update!(issued_at: now) } # 3件を1つのトランザクションで
end
`}
          />
          <Code
            lang="ruby"
            title="直した書き方：1件ずつ確定する"
            code={`
Invoice.where(issued_at: nil).find_each do |invoice|
  invoice.update!(issued_at: now) # 1件ごとに BEGIN〜COMMIT
rescue ActiveRecord::RecordInvalid => e
  Rails.logger.warn("請求書 #{invoice.id} を発行できません: #{e.message}")
end
`}
          />
          <Code
            lang="text"
            title="実行結果（請求書 2 は発行済み、1 と 3 は未発行）"
            code={`
== 1つのトランザクションで発行する
  => Validation failed: 発行済みの請求書は変更できません
  発行済み: [2]
== 1件ずつ確定する
  発行済み: [1, 2, 3]
`}
          />
          <p>
            1つのトランザクションでは、2件目の失敗で1件目の発行も取り消され、3件目は実行されませんでした。請求書どうしには「一緒に発行しないと困る」という規則がないので、1件ずつ確定すれば、発行できる請求書は発行されます。1つのトランザクションのままだと、最初に UPDATE した行のロックを最後の COMMIT まで持ち続けることになり、その間に同じ請求書の編集画面で保存すると、その保存はロックが外れるまで待たされます。件数が多いほど、待つ時間は長くなります。
          </p>
          <p>
            Evans も、集約の境界でトランザクションを区切り、境界をまたぐ更新は非同期に扱うよう書いています<Ref n={4} />。メールの送信や外部の API の呼び出しをトランザクションの中に入れると、応答を待つ間もロックを持ち続け、ロールバックしても送ったメールは取り消せません（<ChapterLink n={34} section="transaction-design" />）。発行の後に続く処理（取引先へのメール、会計システムへの連携）は、コミットの後に別の処理として実行します。その切り分け方は <ChapterLink n={51} section="idea" /> の Domain Events と <ChapterLink n={53} section="idea" /> の Transactional Outbox で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法：全体をトランザクションで囲む</h3>
          <p>
            scene の節のコントローラーのまま、ループと合計の保存を <code>Invoice.transaction do ... end</code> で囲むだけでも、途中の失敗で何も残らなくなります。同じ内容を送ると、設計の UPDATE と保守の DELETE は送られた後に ROLLBACK され、応答は 422、DB は保存の前のままでした。直して送り直すと 302 になり、合計 7,000 で保存されました。
          </p>
          <Code
            lang="text"
            title="実行結果（scene のコントローラーを Invoice.transaction で囲んだ場合）"
            code={`
== 1回目の保存
    Invoice Load  SELECT \`invoices\`.* FROM \`invoices\` WHERE \`invoices\`.\`id\` = 1 LIMIT 1
    TRANSACTION  BEGIN
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1 AND \`invoice_lines\`.\`id\` = 1 LIMIT 1
    InvoiceLine Update  UPDATE \`invoice_lines\` SET \`invoice_lines\`.\`quantity\` = 3, \`invoice_lines\`.\`updated_at\` = … WHERE \`invoice_lines\`.\`id\` = 1
    InvoiceLine Load  SELECT \`invoice_lines\`.* FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`invoice_id\` = 1 AND \`invoice_lines\`.\`id\` = 2 LIMIT 1
    InvoiceLine Destroy  DELETE FROM \`invoice_lines\` WHERE \`invoice_lines\`.\`id\` = 2
    TRANSACTION  ROLLBACK
応答: 422
== 1回目の後: 合計=3000 明細=["設計 1×2000", "保守 1×1000"] 明細から計算した合計=3000
== 研修の数量を 2 に直して、もう一度保存
応答: 302
== 2回目の後: 合計=7000 明細=["設計 3×2000", "研修 2×500"] 明細から計算した合計=7000
`}
          />
          <p>
            変更を記録する仕組みがいらず、最も手軽です。ただし、コントローラーに保存の手順と合計の計算が残り、検証の失敗は書き込みの途中でわかります（研修の失敗の前に UPDATE と DELETE を送っています）。保存の経路が1つで、明細の数が少ない画面なら、この方法で足ります。
          </p>
          <h3>Rails の標準機能との使い分け</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">機能</th>
                  <th scope="col">向いている場合</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>has_many ..., autosave: true</code></th>
                  <td>1つの集約の子をメモリー上で変えて、親の <code>save</code> で保存する</td>
                  <td>保存されるのは関連の配列に入っている子だけ。削除は <code>mark_for_destruction</code></td>
                </tr>
                <tr>
                  <th scope="row"><code>accepts_nested_attributes_for</code></th>
                  <td>画面のフォームから親子をまとめて受け取る</td>
                  <td>autosave を有効にする。削除を受けるには <code>allow_destroy: true</code>。ほかの親の子の id は RecordNotFound</td>
                </tr>
                <tr>
                  <th scope="row"><code>ActiveRecord::Base.transaction</code></th>
                  <td>複数の集約や、関連でつながらない複数のモデルをまとめて確定する</td>
                  <td>SQL はその場で送られ、行のロックは COMMIT まで続く。範囲は業務の規則で決める</td>
                </tr>
                <tr>
                  <th scope="row">Form Object（<ChapterLink n={33} section="model-form-objects" />）</th>
                  <td>1つの画面の入力が複数のモデルにまたがり、フォームの形とモデルの形が違う</td>
                  <td>保存は transaction の中で各モデルの <code>save!</code> を呼ぶ。集約の規則はモデルに残す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>関連するパターン</h3>
          <ul>
            <li>
              Repository（<ChapterLink n={44} section="repository" />）：集約の読み込みと保存を受け持つオブジェクトです。Repository の save を集約ごとに呼ぶ設計なら、1回の save が1つのトランザクションになり、Unit of Work がなくても集約の単位で保存できます。Rails では、集約のルートのモデルとその autosave がこの役割を兼ねます。
            </li>
            <li>
              Optimistic Locking（<ChapterLink n={49} section="idea" />）：読み込んでから保存するまでの間に、ほかの人が同じ行を変えていないかを確かめます。Fowler の Unit of Work の定義に同時実行の問題の解決が含まれるのは、このためです<Ref n={1} />。集約で使う場合は、ルートの請求書に版番号を持たせます。
            </li>
            <li>
              Transactional Outbox（<ChapterLink n={53} section="idea" />）：集約の保存と、外部に送るメッセージの記録を、同じトランザクションで行うパターンです。
            </li>
            <li>
              Domain Events（<ChapterLink n={51} section="idea" />）：集約の保存の後に続く処理を、イベントで切り分けます。続く処理を同じトランザクションで行うか、コミットの後に行うかは、処理ごとに決めます。
            </li>
          </ul>
          <h3>採用する条件</h3>
          <ul>
            <li>1回の業務の操作で、親と子など複数の行を追加・変更・削除する</li>
            <li>変えた内容が、すべて保存されるか何も保存されないかのどちらかである必要がある</li>
            <li>親の値（合計・件数・状態）が子から決まり、子と一緒に保存しないとずれる</li>
          </ul>
          <p>Rails では、これらの条件のときに、集約を決めて autosave と transaction で実装します。Unit of Work のクラスは作りません。</p>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>1つの操作で1行しか書き込まない（親の <code>save</code> だけで足りる）</li>
            <li>大量の行を一度に更新する（集約を読み込まずに、<code>update_all</code> や <code>insert_all</code> の1文で書く方が速い。検証とコールバックを通らないことを前提に、条件を SQL と DB の制約で守る）</li>
            <li>関係のない複数の集約をまとめようとしている（1件ずつ確定するか、後続の処理を非同期にする）</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>一緒に保存すべきまとまり（集約）とルートを決めたか</li>
            <li>ルートの has_many に <code>autosave: true</code>（または <code>accepts_nested_attributes_for</code>）を付け、子の変更を関連の配列の中で行っているか</li>
            <li>保存の前に、同じ行を <code>update_all</code> や子の <code>update!</code> で書き込んでいないか</li>
            <li>複数の集約を1つのトランザクションにする理由を、業務の規則で説明できるか</li>
            <li>読み込んだオブジェクトを、リクエストをまたいで使い回していないか</li>
            <li>途中で失敗したときに何も残らないことを、テストで確かめたか</li>
          </ol>
          <Callout kind="note" title="自分で作るか、Rails の機能を使うか">
            <p>
              MSDP の例は、仕組みを理解するために Unit of Work を自分で書いています。Rails のアプリケーションでは、この章のとおり autosave とトランザクションを使います。この章の実装では gem を追加していません。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>明細を1件ずつ <code>update!</code>・<code>destroy!</code>・<code>create!</code> すると、途中で失敗したときに先に確定した変更だけが残り、合計と明細が合わなくなります。送り直しも失敗します。</li>
          <li>Unit of Work は、業務の操作の間に行った追加・変更・削除を記録し、最後に1つのトランザクションでまとめて書き込むパターンです。変更の見つけ方には明示的な登録とスナップショットとの比較があり、Identity Map は同じ行を1つのオブジェクトにします。</li>
          <li>まとめて保存する範囲は集約で決めます。請求書がルートで、明細は請求書を通してだけ変更し、合計と発行済みの確認はルートが受け持ちます。</li>
          <li>Rails の Active Record は Unit of Work ではありません。変更の追跡は1つのオブジェクトの中だけで、Identity Map はなく、SQL は save を呼んだときに送られます。</li>
          <li>1つの集約は、has_many の <code>autosave: true</code>・<code>mark_for_destruction</code>・<code>accepts_nested_attributes_for</code> と親の <code>save</code> で、1つのトランザクションで保存します。SQL は親 → 削除の印の子 → 残りの子の順です。</li>
          <li>autosave が保存するのは、親の関連の配列に入っている子だけです。子に直接 <code>update!</code> したり、<code>lines.first</code> や別の <code>find</code> で取り出したオブジェクトを変えたりすると、集約の規則を通りません。</li>
          <li>複数の集約は <code>ActiveRecord::Base.transaction</code> で囲みますが、片方だけ確定すると困る操作に限ります。関係のない請求書や、メール・外部の API はトランザクションに入れません。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Unit of Work', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）', url: 'https://martinfowler.com/eaaCatalog/unitOfWork.html', accessed: '2026-11-13', version: '書籍は2002年11月刊', note: 'Unit of Work の定義、変更のたびに書き込む方法の問題、registerNew などの操作（カタログの図）。' },
    { title: 'Identity Map', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）', url: 'https://martinfowler.com/eaaCatalog/identityMap.html', accessed: '2026-11-13', version: '書籍は2002年11月刊', note: '同じ記録を2つのオブジェクトに読み込む問題と、同じデータを何度も読む無駄。' },
    { title: 'Active Record', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html', accessed: '2026-11-13', version: '書籍は2002年11月刊', note: '表の1行を包み、DB へのアクセスと業務の処理を持つオブジェクト。' },
    { title: 'Domain-Driven Design Reference: Definitions and Pattern Summaries', publisher: 'Domain Language / Eric Evans', url: 'https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf', accessed: '2026-11-13', version: '2015年', note: '集約の定義、ルート、トランザクションの境界、境界をまたぐ更新を非同期に扱うこと。' },
    { title: 'START TRANSACTION, COMMIT, and ROLLBACK Statements', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/commit.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '既定の autocommit では各文が1つのトランザクションとして確定し、ROLLBACK で取り消せないこと。' },
    { title: 'FOREIGN KEY Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-foreign-keys.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: '参照先のない子の INSERT を拒否すること、ON DELETE の既定は NO ACTION で InnoDB では RESTRICT と同じこと。' },
    { title: 'ActiveRecord::AutosaveAssociation', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/AutosaveAssociation.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'autosave: true と mark_for_destruction、保存と削除が1つのトランザクションで行われること、autosave を宣言しないと変更した既存の子は保存されないこと。' },
    { title: 'ActiveRecord::NestedAttributes::ClassMethods', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/NestedAttributes/ClassMethods.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'accepts_nested_attributes_for が autosave を有効にすること、allow_destroy と _destroy、id のない行は新しく作ること。' },
    { title: 'ActiveRecord::Transactions::ClassMethods', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Transactions/ClassMethods.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'save と destroy がトランザクションで包まれること、transaction のブロック。' },
    { title: 'ActiveModel::Dirty', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveModel/Dirty.html', accessed: '2026-11-13', version: 'Rails 8.1', note: '属性の変更の追跡（changed?・changes）。' },
    { title: 'Ruby on Rails 4.0 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/4_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 4.0', note: 'Active Record から IdentityMap を取り除いたこと。' },
    { title: 'activerecord/lib/active_record/autosave_association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/autosave_association.rb#L189-L199`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'has_many の autosave の保存が after_create・after_update のコールバックで行われること。' },
    { title: 'activerecord/lib/active_record/nested_attributes.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/nested_attributes.rb#L353-L362`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'accepts_nested_attributes_for が reflection.autosave = true を設定すること。' },
    { title: 'activerecord/lib/active_record/attribute_methods/dirty.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/attribute_methods/dirty.rb#L233-L247`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '部分更新で、変わった列の名前だけを UPDATE に使うこと。' },
    { title: 'activerecord/lib/active_record/associations/collection_association.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/associations/collection_association.rb#L312-L318`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '関連の配列から探す条件（読み込み済み、新しいか変更のあるオブジェクトがある場合など）。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.0', note: 'params.expect が加わり、params.require(...).permit(...) の代わりに使えること。' },
  ],
}

export default chapter
