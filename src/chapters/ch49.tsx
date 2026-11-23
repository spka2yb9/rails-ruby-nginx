import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 85-1・85-2 2人の同時の編集のタイムライン ---------- */
interface Step {
  who: 'sato' | 'suzuki'
  /** read：DB から画面へ読む。write：画面から DB へ書く */
  dir: 'read' | 'write'
  user: string[]
  db: string[]
  /** 競合を知らせる戻りの矢印 */
  reply?: boolean
  /** 問題が起きた段階 */
  danger?: string
}

const SATO = { x: 10, w: 200 }
const DB = { x: 280, w: 220 }
const SUZUKI = { x: 570, w: 200 }
const ROW = 80
const BOX_H = 58
const rowY = (i: number) => 44 + i * ROW

function Timeline({ id, steps, label }: { id: string; steps: Step[]; label: string }) {
  const h = rowY(steps.length - 1) + BOX_H + (steps.some((s) => s.danger) ? 34 : 14)
  return (
    <Svg id={id} w={780} h={h} label={label}>
      <T x={SATO.x + SATO.w / 2} y={20} anchor="middle" bold>
        佐藤さんの画面
      </T>
      <T x={DB.x + DB.w / 2} y={20} anchor="middle" bold>
        DB の商品の行
      </T>
      <T x={SUZUKI.x + SUZUKI.w / 2} y={20} anchor="middle" bold>
        鈴木さんの画面
      </T>
      {steps.map((s, i) => {
        const y = rowY(i)
        const cy = y + BOX_H / 2
        const lane = s.who === 'sato' ? SATO : SUZUKI
        const ux = s.who === 'sato' ? SATO.x + SATO.w : SUZUKI.x
        const dx = s.who === 'sato' ? DB.x : DB.x + DB.w
        const dir = s.who === 'sato' ? 1 : -1
        return (
          <g key={i}>
            <Box x={lane.x} y={y} w={lane.w} h={BOX_H} lines={s.user} fs={12} subTone="muted" />
            <Box x={DB.x} y={y} w={DB.w} h={BOX_H} lines={s.db} fill="box4" fs={12} subTone={s.danger ? 'danger' : 'muted'} accent={!!s.danger} />
            {s.dir === 'read' ? (
              <Arrow x1={dx} y1={cy} x2={ux + dir * 2} y2={cy} dashed />
            ) : s.reply ? (
              <>
                <Arrow x1={ux} y1={cy - 10} x2={dx - dir * 2} y2={cy - 10} />
                <Arrow x1={dx} y1={cy + 10} x2={ux + dir * 2} y2={cy + 10} dashed accent />
              </>
            ) : (
              <Arrow x1={ux} y1={cy} x2={dx - dir * 2} y2={cy} />
            )}
            {s.danger && (
              <T x={DB.x + DB.w / 2} y={y + BOX_H + 18} anchor="middle" fs={12} tone="danger" bold>
                {s.danger}
              </T>
            )}
          </g>
        )
      })}
    </Svg>
  )
}

const LOST_UPDATE: Step[] = [
  { who: 'sato', dir: 'read', user: ['1. 編集画面を開く', '緑茶・300 円'], db: ['SELECT', '緑茶・300 円'] },
  { who: 'suzuki', dir: 'read', user: ['2. 編集画面を開く', '緑茶・300 円'], db: ['SELECT', '緑茶・300 円'] },
  { who: 'sato', dir: 'write', user: ['3. 価格を 350 円にして保存'], db: ['UPDATE price = 350', '→ 緑茶・350 円'] },
  {
    who: 'suzuki',
    dir: 'write',
    user: ['4. 名前を変えて保存', 'フォームの価格は 300 円'],
    db: ['UPDATE name = …, price = 300', '→ 緑茶（静岡）・300 円'],
    danger: '佐藤さんが保存した 350 円が消えた（エラーは出ない）',
  },
]

const OPTIMISTIC: Step[] = [
  { who: 'sato', dir: 'read', user: ['1. 編集画面を開く', '300 円・lock_version 0'], db: ['SELECT', '緑茶・300 円・版 0'] },
  { who: 'suzuki', dir: 'read', user: ['2. 編集画面を開く', '300 円・lock_version 0'], db: ['SELECT', '緑茶・300 円・版 0'] },
  { who: 'sato', dir: 'write', user: ['3. 350 円にして保存', 'lock_version 0 を送る'], db: ['UPDATE … WHERE lock_version = 0', '1件 → 350 円・版 1'] },
  { who: 'suzuki', dir: 'write', reply: true, user: ['4. 名前を変えて保存', '0 を送る → 409'], db: ['UPDATE … WHERE lock_version = 0', '0件（今は版 1）→ 変えない'] },
  { who: 'suzuki', dir: 'write', user: ['5. 項目ごとに選んで保存', 'lock_version 1 を送る'], db: ['UPDATE … WHERE lock_version = 1', '1件 → 緑茶（静岡）・350 円・版 2'] },
]

/* ---------- 図 85-3 楽観的ロック・悲観的ロック・1文の更新の比較 ---------- */
function LockComparisonFigure() {
  const cols = [
    { x: 150, w: 200, head: '防ぎ方' },
    { x: 356, w: 130, head: '競合したとき' },
    { x: 492, w: 150, head: '向いている場面' },
    { x: 648, w: 122, head: '注意' },
  ]
  const rows: { name: string[]; cells: string[][] }[] = [
    {
      name: ['楽観的ロック', 'lock_version'],
      cells: [
        ['保存の UPDATE の WHERE で', '読んだときの版番号を確かめる'],
        ['0件 → StaleObjectError', '409・412 で知らせる'],
        ['画面をまたぐ編集', '競合がまれ'],
        ['競合の画面と', '版番号の受け渡し'],
      ],
    },
    {
      name: ['悲観的ロック', 'lock!・with_lock'],
      cells: [
        ['SELECT … FOR UPDATE で', '読む時点で行をロックする'],
        ['後の処理は', 'COMMIT まで待つ'],
        ['1つのトランザクションで', '読んで判断して書く'],
        ['画面をまたげない', '待ちとデッドロック'],
      ],
    },
    {
      name: ['1文の更新', '条件付きの UPDATE'],
      cells: [
        ['SET stock = stock - ?', 'WHERE stock >= ?'],
        ['0件 → OutOfStock', '待ちは UPDATE の間だけ'],
        ['今の値から計算できる', '在庫の減算・件数の加算'],
        ['ほかの表を見る判断は', '書きにくい'],
      ],
    },
  ]
  return (
    <Svg
      id="85-3"
      w={780}
      h={262}
      label="3つの方式の比較。楽観的ロックは保存の UPDATE の WHERE で読んだときの lock_version を確かめ、0件なら StaleObjectError にして 409 や 412 で知らせる。画面をまたぐ編集で競合がまれな場合に向き、競合の画面と版番号の受け渡しが必要。悲観的ロックは SELECT FOR UPDATE で読む時点で行をロックし、後の処理は COMMIT まで待つ。1つのトランザクションで読んで判断して書く処理に向き、画面をまたげず、待ちとデッドロックに注意する。1文の更新は SET stock = stock - ? WHERE stock >= ? のように条件付きの UPDATE で書き、0件なら在庫不足にする。今の値から新しい値を計算できる在庫の減算や件数の加算に向き、ほかの表を見る判断は書きにくい"
    >
      {cols.map((c) => (
        <T key={c.head} x={c.x + c.w / 2} y={18} anchor="middle" bold fs={12}>
          {c.head}
        </T>
      ))}
      {rows.map((r, i) => {
        const y = 32 + i * 76
        return (
          <g key={r.name[0]}>
            <Box x={10} y={y} w={134} h={68} lines={r.name} fs={12} fill="box5" bold subTone="muted" />
            {r.cells.map((cell, j) => (
              <Box key={j} x={cols[j].x} y={y} w={cols[j].w} h={68} lines={cell} fs={11} fill={j === 3 ? 'bg' : 'box'} />
            ))}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 85-4 ETag と If-Match による条件付きの更新 ---------- */
function EtagFigure() {
  const C = 90
  const S = 390
  const D = 680
  const msg = (y: number, from: number, to: number, text: string, opts: { dashed?: boolean; danger?: boolean } = {}) => (
    <g key={`${y}-${text}`}>
      <Arrow x1={from} y1={y} x2={to + (to > from ? -2 : 2)} y2={y} dashed={opts.dashed} />
      <T x={(from + to) / 2} y={y - 10} anchor="middle" fs={12} mono tone={opts.danger ? 'danger' : undefined}>
        {text}
      </T>
    </g>
  )
  return (
    <Svg
      id="85-4"
      w={780}
      h={460}
      label="ETag と If-Match による条件付きの更新。クライアントが GET で商品を読むと、API サーバーは lock_version 0 を ETag v0 として返す。ほかの人の保存で lock_version が 1 になる。クライアントが If-Match v0 を付けて PATCH すると、サーバーは lock_version 0 を条件に UPDATE し、0件なので 412 と最新の内容と ETag v1 を返す。If-Match v1 で送り直すと更新でき、ETag v2 が返る。If-Match を付けない PATCH には 428 を返す"
    >
      {[
        [C, 'クライアント'],
        [S, 'API サーバー（Rails）'],
        [D, 'MySQL'],
      ].map(([x, name]) => (
        <g key={name}>
          <Box x={(x as number) - 80} y={8} w={160} h={32} lines={name as string} fs={12} fill={x === D ? 'box4' : 'box'} />
          <line x1={x} y1={40} x2={x} y2={452} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {msg(74, C, S, 'GET /api/products/1')}
      {msg(104, S, D, 'SELECT（lock_version 0）')}
      {msg(134, S, C, '200  ETag: "v0"', { dashed: true })}
      <Box x={D - 100} y={150} w={190} h={30} lines="ほかの人の保存で版 1 になる" fill="box5" fs={12} />
      {msg(214, C, S, 'PATCH  If-Match: "v0"')}
      {msg(244, S, D, 'UPDATE … WHERE lock_version = 0')}
      {msg(274, D, S, '0件', { dashed: true })}
      {msg(304, S, C, '412・最新の内容・ETag: "v1"', { dashed: true, danger: true })}
      {msg(344, C, S, 'PATCH  If-Match: "v1"')}
      {msg(374, S, C, '200  ETag: "v2"', { dashed: true })}
      {msg(414, C, S, 'PATCH（If-Match なし）')}
      {msg(444, S, C, '428', { dashed: true, danger: true })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 49,
  part: 9,
  title: 'Optimistic Locking：商品の同時編集と在庫の減算',
  summary:
    '行に版番号（lock_version）を持たせ、保存の UPDATE で「読んだときから版番号が変わっていないこと」を確かめる Optimistic Locking を、管理画面の商品の同時編集で説明します。画面と API で版番号を受け渡す方法、競合したときに 409 と項目を選び直す画面を返す方法、在庫の減算を条件付きの UPDATE で書く方法を、MySQL の REPEATABLE READ での実測とともに扱います。',
  goals: [
    '2人が同じ商品を編集したときに、後の保存が先の変更を消す流れを、SQL のログから説明できる',
    'lock_version をフォームの隠し項目で受け渡し、StaleObjectError を 409 と項目を選び直す画面に変えられる',
    'MySQL の REPEATABLE READ で、SELECT はスナップショットを読み、UPDATE は最新の行に働くことを、同時の更新の結果から説明できる',
    '在庫の減算を条件付きの UPDATE で書き、update_counters・lock!・lock_version との違いと使い分けを説明できる',
    'API で ETag と If-Match を使い、412 と 428 を返す更新を書ける。stale?・fresh_when が GET 用であることを説明できる',
    '楽観的ロック・悲観的ロック・1文の更新を、処理の性質に合わせて選べる',
  ],
  prerequisites: [15, 38],
  sections: [
    {
      id: 'scene',
      title: '2人が同じ商品を編集し、2つの注文が同じ在庫を減らす',
      body: (
        <>
          <h3>商品の編集と在庫の減算</h3>
          <p>
            この章では EC サイトの商品を例にします。管理画面では、担当者が商品の編集画面を開き、名前や価格を変えて「保存」を押します。画面を開くとき（GET の edit）と保存するとき（PATCH の update）は別々の HTTP リクエストで、その間に数分かかることもあり、2つのリクエストの間、DB のトランザクションは開いていません。一方、利用者が注文すると、注文の処理が商品の在庫を減らします。在庫の減算は1つのリクエストの中で終わりますが、同じ商品の注文が同時に届くことがあります。
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
                  <th scope="row"><code>products</code></th>
                  <td><code>name</code>・<code>price</code>・<code>stock</code></td>
                  <td>商品。価格は円の整数、在庫は CHECK 制約で 0 以上。rails-impl の節で <code>lock_version</code> を加える</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>パターンを使わないコード</h3>
          <Code
            lang="ruby"
            title="app/models/product.rb（パターンを使う前）"
            code={`
class Product < ApplicationRecord
  validates :name, presence: true
  validates :price, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  # 在庫を減らす。読み込んだときの在庫から計算した値で上書きする
  def reserve!(quantity)
    raise "在庫が不足しています" if stock < quantity
    update!(stock: stock - quantity)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb（パターンを使う前）"
            code={`
class ProductsController < ApplicationController
  def edit
    @product = Product.find(params[:id])
  end

  def update
    @product = Product.find(params[:id])
    if @product.update(product_params) # フォームの全項目で上書きする
      redirect_to edit_product_path(@product), notice: "保存しました"
    else
      render :edit, status: :unprocessable_content
    end
  end

  private

  def product_params
    params.expect(product: [:name, :price])
  end
end
`}
          />
          <p>編集画面のフォームには、名前と価格の入力欄があります。保存のリクエストはフォームに表示されていた値を全項目そのまま送ります。</p>
          <h3>2人が同じ商品を編集する</h3>
          <p>
            緑茶（300 円）の編集画面を、佐藤さんと鈴木さんが続けて開きました。佐藤さんは価格を 350 円にして保存し、その後で鈴木さんが名前を「緑茶（静岡）」に変えて保存します。2人の操作は <code>rails runner</code> から2つの <code>ActionDispatch::Integration::Session</code> で送り、フォームに表示された値をそのまま送り返しています。ログの各行は経過秒、操作した人、Rails のログです。
          </p>
          <Code
            lang="text"
            title="実行結果（A：2人の編集。Rails 8.1.4.1・MySQL 8.4。所要時間と日時の値は省略）"
            code={`
0.25s 佐藤    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.27s 佐藤  画面の値 {"name" => "緑茶", "price" => "300"}
0.27s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.28s 鈴木  画面の値 {"name" => "緑茶", "price" => "300"}
0.28s 佐藤    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.28s 佐藤    TRANSACTION  BEGIN
0.29s 佐藤    Product Update  UPDATE \`products\` SET \`products\`.\`price\` = 350, \`products\`.\`updated_at\` = … WHERE \`products\`.\`id\` = 1
0.29s 佐藤    TRANSACTION  COMMIT
0.30s 佐藤  応答 302
0.30s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.30s 鈴木    TRANSACTION  BEGIN
0.30s 鈴木    Product Update  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）', \`products\`.\`price\` = 300, \`products\`.\`updated_at\` = … WHERE \`products\`.\`id\` = 1
0.31s 鈴木    TRANSACTION  COMMIT
0.31s 鈴木  応答 302
最後の行: ["緑茶（静岡）", 300, 5]
`}
          />
          <Figure n="85-1" title="後の保存が先の変更を消すタイムライン" caption="上の実行結果を、上から下へ時間が進む図にしたもの。実線の矢印は書き込み、破線の矢印は読み込み。">
            <Timeline
              id="85-1"
              steps={LOST_UPDATE}
              label="佐藤さんと鈴木さんが、価格 300 円の緑茶の編集画面を順に開く。佐藤さんが価格を 350 円にして保存する。その後、鈴木さんが名前を緑茶（静岡）に変えて保存すると、フォームの価格 300 円も書き込まれ、佐藤さんの 350 円が消える。エラーは出ない"
            />
          </Figure>
          <p>
            図 85-1 のとおり、鈴木さんの保存の UPDATE には、名前と一緒に価格 300 が入りました。Rails の部分更新（変わった列だけを UPDATE する仕組み。<ChapterLink n={11} section="dirty" />）は、保存のリクエストで読み込んだ値（350）とフォームの値（300）を比べるので、300 を変更として書き込みます。どちらの応答も 302 で、佐藤さんの 350 円は誰にも知らされずに消えました。後から保存した更新が先の更新を消すこの現象を<Term en="lost update">更新の消失</Term>と呼びます（<ChapterLink n={38} section="concurrent-updates" />）。
          </p>
          <h3>2つの注文が同時に在庫を減らす</h3>
          <p>
            在庫 5 の緑茶に、2つの注文が 0.1 秒違いで届いた場合を、2つのスレッド（それぞれ別の DB 接続）で再現しました。どちらもトランザクションの中で商品を読み、0.3 秒後（注文の確認などの処理の間）に <code>reserve!(1)</code> を呼びます。
          </p>
          <Code
            lang="text"
            title="実行結果（B：2つの注文。各スレッドは Product.transaction の中で find・sleep 0.3・reserve!(1) を実行）"
            code={`
0.34s 注文1    TRANSACTION  BEGIN
0.34s 注文1    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.34s 注文1  在庫 5 を読む
0.44s 注文2    TRANSACTION  BEGIN
0.44s 注文2    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.44s 注文2  在庫 5 を読む
0.64s 注文1    Product Update  UPDATE \`products\` SET \`products\`.\`stock\` = 4, \`products\`.\`updated_at\` = … WHERE \`products\`.\`id\` = 1
0.65s 注文1    TRANSACTION  COMMIT
0.65s 注文1  注文を確定
0.74s 注文2    Product Update  UPDATE \`products\` SET \`products\`.\`stock\` = 4, \`products\`.\`updated_at\` = … WHERE \`products\`.\`id\` = 1
0.76s 注文2    TRANSACTION  COMMIT
0.76s 注文2  注文を確定
最後の在庫: 4
`}
          />
          <p>
            2つの注文はどちらも在庫 5 を読み、Ruby で計算した 4 を書きました。2つ売れたのに在庫は 1 しか減っていません。トランザクションで囲んでいても、MySQL はエラーを出しませんでした。同じ現象を送金の例で確かめた節が<ChapterLink n={38} section="concurrent-updates" />で、防ぐ書き方（ロック・条件付きの UPDATE）は<ChapterLink n={38} section="lost-update-fix" />、<ChapterLink n={15} section="optimistic" />と<ChapterLink n={15} section="pessimistic" />で扱いました。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>画面を開いた後にほかの人が保存したかを確かめず、フォームの全項目で上書きします。先の変更はエラーもなく消えます。</li>
            <li>在庫を、読み込んだ値から計算した値で上書きします。同時の注文で、減らした数の一部が消えます。</li>
            <li>編集は2つのリクエストにまたがるので、画面を開いてから保存するまでの間、DB のトランザクションもロックも続いていません。</li>
          </ul>
          <p>
            この章では、仕組みの説明は既存の章に任せ、パターンとしての設計に重点を置きます。画面とサーバーの間で版番号をどう受け渡すか、競合したときに利用者に何を見せるか、在庫のように今の値から計算できる更新をどう書くかです。
          </p>
        </>
      ),
    },
    {
      id: 'idea',
      title: 'Optimistic Locking の考え方：読んだときの版番号を条件に更新する',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Optimistic Locking">Optimistic Locking</Term>（楽観的ロック）は、同じデータを複数の人や処理が同時に更新するときに、後から保存しようとした側の更新を止めて、競合を知らせるパターンです。保存する前にデータをロックしてほかの人を待たせるのではなく、保存するときに「読んだ後にほかの人が変更していないか」を確かめます。Fowler のカタログでは David Rice が Optimistic Offline Lock として説明しており、保存する変更がほかのセッション（別の利用者による一連の操作）の変更と競合していないかを確かめ、競合していればその業務の処理を取り消すパターンです<Ref n={1} />。
          </p>
          <p>
            「楽観」という名前は、競合はめったに起きないと見込んで、競合したときだけ対処する方針から来ています。競合が多いと見込み、先にロックを取ってほかの人を待たせる方針は「悲観」ロックと呼ばれます<Ref n={1} /><Ref n={2} />。
          </p>
          <h3>使う場面</h3>
          <p>
            Rice は、1つの業務の処理が複数のシステムトランザクション（DB のトランザクション）にまたがると、DB だけでは矛盾を防げず、更新の消失が起こりうると述べています<Ref n={1} />。商品の編集は「画面を開く」と「保存する」の2つのリクエストにまたがるので、この場面に当たります。次のような兆候があれば、このパターンが必要です。
          </p>
          <ul>
            <li>「保存したはずの変更が消えた」という問い合わせがあるが、ログにはエラーが出ていない</li>
            <li>編集画面で、開いた時点の値をそのまま全部の列に書き戻している</li>
            <li>在庫や残高を、読んだ値から計算して <code>update!(stock: 計算した値)</code> で上書きしている</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>ほかの人の変更を、知らせずに消してはいけない。一方で、編集している間ずっとほかの人を待たせると、作業が止まる。</li>
            <li>画面を開いてから保存するまでの間、DB のトランザクションやロックを持ち続けることはできない。</li>
            <li>競合を見つけたときに、どちらの変更を残すかは業務によって違い、コードだけでは決められないことが多い。</li>
            <li>競合のたびに利用者にやり直しを求めると、競合が多い場面では使いにくくなる。</li>
          </ul>
          <h3>解決方法：版番号を WHERE で確かめる</h3>
          <p>
            行に<Term en="version number">版番号</Term>の列を持たせ、更新のたびに1つ増やします。Rails では <code>lock_version</code> という名前の整数の列を加えると、Active Record が自動でこの処理を行います<Ref n={3} />。読み込むときは版番号も一緒に受け取り、保存するときは次の UPDATE を送ります。
          </p>
          <Code
            lang="sql"
            title="版番号を確かめる UPDATE（Rails が送る形）"
            code={`
UPDATE products SET name = ?, lock_version = 1  -- 版番号を1つ増やす
 WHERE id = 1 AND lock_version = 0               -- 0 は読み込んだときの版番号
`}
          />
          <p>
            読み込んだ後にほかの人が保存していれば、版番号は増えているので、WHERE に合う行はありません。Rails は更新した行の数が 1 でなければ <code>ActiveRecord::StaleObjectError</code> を投げます<Ref n={11} />。確かめることと書き込むことが1つの UPDATE の中で行われるので、確かめた後、書き込む前にほかの人が割り込むことはありません。Rice も、確かめることと更新することは1つのシステムトランザクションの中で行う必要があるとしています<Ref n={1} />。
          </p>
          <Figure n="85-2" title="lock_version で検出するタイムライン" caption="rails-impl の節の実行結果をもとにした図。青い破線の矢印は、409 と最新の内容を返すことを表す。">
            <Timeline
              id="85-2"
              steps={OPTIMISTIC}
              label="佐藤さんと鈴木さんが、lock_version 0 の緑茶の画面を開く。佐藤さんが lock_version 0 を条件に更新し、1件が更新されて版は 1 になる。鈴木さんも lock_version 0 を条件に更新するが、今は版 1 なので0件になり、409 と最新の内容を受け取る。鈴木さんは項目ごとに残す値を選び、lock_version 1 を条件に保存し直し、版は 2 になる"
            />
          </Figure>
          <p>
            図 85-2 は図 85-1 と同じ流れに lock_version を加えたものです。鈴木さんの保存は0件になり、佐藤さんの 350 円は残ります。鈴木さんは最新の内容を見て、項目ごとに残す値を選んでから、最新の版番号で保存し直します。
          </p>
          <h3>競合したときの対応</h3>
          <p>競合を見つけた後の対応は、業務に合わせて決めます。</p>
          <ul>
            <li>利用者に知らせて選んでもらう：最新の内容と利用者の入力を並べて見せ、残す値を選んでもらいます。管理画面の編集では、まずこの方法を考えます。この章の rails-impl の節はこの方法です。</li>
            <li>自動でやり直す：最新の値を読み直して計算し直せば済む処理（在庫を1つ減らす、など）であれば、プログラムが読み込みから再実行できます。ただし、利用者が画面で判断した内容を、確かめずに再実行してはいけません（anti-patterns の節）。</li>
            <li>項目ごとに合わせる：変更した項目が重ならなければ両方を残す方法もありますが、利用者が開いたときの値を覚えておく必要があり、作りが複雑になります。必要になるまで採用しません。</li>
          </ul>
          <h3>ほかの方式との比較</h3>
          <p>同時の更新を防ぐ方法は、楽観的ロックだけではありません。図 85-3 は悲観的ロックと1文の更新を加えた3つの方式を比べたものです。</p>
          <Figure n="85-3" title="楽観的ロック・悲観的ロック・1文の更新の比較" caption="この章の各節の実行結果をもとにまとめた表。">
            <LockComparisonFigure />
          </Figure>
          <p>
            悲観的ロックは <code>SELECT ... FOR UPDATE</code> で行をロックし、ほかのトランザクションの更新をロックが外れるまで待たせます<Ref n={4} />。1つのリクエストの中で終わる短い処理には使えますが、画面を開いている間ロックを持ち続けることはできません。Rice も、DB のトランザクションは長く開いておくことに向いていないと述べ、画面をまたぐ場合はまず楽観的ロックを試すよう勧めています<Ref n={2} />。在庫の減算のように新しい値を今の値から計算できる更新は、1つの条件付きの UPDATE で書けます。この場合は版番号も明示的なロックもいりません（stock-update の節）。
          </p>
          <h3>構造</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の Rails の実装</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">版番号の列</th>
                  <td><code>products.lock_version</code></td>
                  <td>更新のたびに1つ増える。行がどの時点の内容かを表す</td>
                </tr>
                <tr>
                  <th scope="row">読み込みと受け渡し</th>
                  <td><code>edit</code> とフォームの隠し項目、API の <code>ETag</code></td>
                  <td>内容と一緒に版番号を渡し、保存のときに送り返してもらう</td>
                </tr>
                <tr>
                  <th scope="row">条件付きの更新</th>
                  <td><code>update</code>（Active Record の楽観的ロック）</td>
                  <td>送り返された版番号と同じときだけ更新し、版番号を増やす。0件なら StaleObjectError</td>
                </tr>
                <tr>
                  <th scope="row">競合の応答</th>
                  <td>409 と項目を選び直す画面、API では 412 と最新の内容</td>
                  <td>最新の内容と最新の版番号を返し、利用者が判断して保存し直せるようにする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>画面とサーバーの間で版番号を受け渡す</h3>
          <p>
            画面を開くときと保存するときのリクエストは別々なので、読み込んだときの版番号を、保存のリクエストで送り返してもらう必要があります。HTML のフォームなら隠し項目（<code>&lt;input type="hidden"&gt;</code>）に入れます。Rails の API ドキュメントも、リクエストをまたいで楽観的ロックを使うには <code>lock_version</code> をフォームの隠し項目に入れるよう勧めています<Ref n={3} />。HTTP の API では、<code>ETag</code> ヘッダーと <code>If-Match</code> ヘッダーで同じことをします（etag の節）。
          </p>
          <p>
            確かめるべきなのは「利用者が画面を開いたときの版番号」です。保存のリクエストでサーバーが行を読み直すと、そのときの版番号は最新なので、条件は必ず合います（anti-patterns の節）。
          </p>
        </>
      ),
    },
    {
      id: 'isolation',
      title: '分離レベルと同時の更新：MySQL の REPEATABLE READ で確かめる',
      body: (
        <>
          <p>
            <Term en="isolation level">分離レベル</Term>は、同時に動くほかのトランザクションの変更がどこまで見えるかを決める設定です。MSDP は PostgreSQL の既定の READ COMMITTED と、REPEATABLE READ で競合したときのエラー（SQLSTATE 40001）で説明しています<Ref n={6} />。この本の検証環境の MySQL 8.4 では、<code>SELECT @@transaction_isolation</code> の結果は REPEATABLE-READ で、同時の更新での振る舞いも PostgreSQL と違います。分離レベルの4つの種類とスナップショットの仕組みは<ChapterLink n={38} section="isolation" />と<ChapterLink n={38} section="mvcc" />で扱ったので、ここでは楽観的ロックと在庫の減算に関係する点を実測します。
          </p>
          <p>
            要点は1つです。InnoDB の REPEATABLE READ では、通常の SELECT はトランザクションで最初に読んだときのスナップショットを読みますが、UPDATE と DELETE はほかのトランザクションが確定した最新の行に働きます<Ref n={5} />。
          </p>
          <h3>読んで計算して書くと、エラーにならずに更新が消える</h3>
          <p>
            scene の節の B では、2つの注文がトランザクションの中で在庫 5 を読み、どちらも 4 を書きました。2つ目の注文の UPDATE は、1つ目が確定した行（在庫 4）に働きましたが、SET の値は Ruby で計算した 4 なので、結果は 4 です。PostgreSQL の REPEATABLE READ では、読んだ後にほかのトランザクションが更新した行を更新しようとするとエラー（40001）になり、アプリケーションはやり直しを求められます<Ref n={6} />。MySQL の REPEATABLE READ では、このときエラーになりません。分離レベルに頼らず、条件付きの UPDATE・楽観的ロック・悲観的ロックのどれかで防ぎます。
          </p>
          <h3>条件付きの UPDATE は最新の行に対して条件を評価する</h3>
          <p>
            在庫 1 の商品で、注文1がトランザクションの中で在庫を読んだ後、注文2が条件付きの UPDATE で最後の1個を減らして確定しました。その後で、注文1も同じ条件付きの UPDATE を送ります。
          </p>
          <Code
            lang="text"
            title="実行結果（REPEATABLE READ。在庫 1）"
            code={`
0.51s 注文1    TRANSACTION  BEGIN
0.51s 注文1    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.51s 注文1  在庫 1 を読む
0.62s 注文2    Product Update All  UPDATE \`products\` SET stock = stock - '1' WHERE \`products\`.\`id\` = 1 AND (stock >= '1')
0.62s 注文2  在庫を1つ減らして確定
0.81s 注文1    Product Update All  UPDATE \`products\` SET stock = stock - '1' WHERE \`products\`.\`id\` = 1 AND (stock >= '1')
0.81s 注文1  更新した行 0
0.81s 注文1    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.81s 注文1  もう一度読む 在庫 1
0.81s 注文1    TRANSACTION  COMMIT
最後の在庫: 0
`}
          />
          <p>
            注文1のスナップショットでは在庫は 1 のままで、UPDATE の後に読み直しても 1 が見えました。それでも UPDATE は最新の在庫 0 に対して <code>stock &gt;= 1</code> を評価し、更新した行は 0 でした。MySQL のマニュアルも、スナップショットは SELECT に適用され、DML（UPDATE・DELETE）には必ずしも適用されないと説明しています<Ref n={5} />。条件付きの UPDATE と楽観的ロックの UPDATE が REPEATABLE READ でも正しく働くのは、このためです。ほかのトランザクションがその行をロックしている間は、UPDATE はロックが外れるまで待ってから条件を評価します（<ChapterLink n={34} section="transaction-design" />の「トランザクションだけでは在庫の競合を防げない」）。
          </p>
          <h3>楽観的ロックが競合した後に、同じトランザクションで読み直すと</h3>
          <p>
            鈴木さんの保存をトランザクションの中で行い、商品を読んだ後に佐藤さんが価格を変えて確定しました。鈴木さんは <code>StaleObjectError</code> を rescue して、最新の内容を読み直します。
          </p>
          <Code
            lang="text"
            title="実行結果（REPEATABLE READ。鈴木さんは Product.transaction の中で find・sleep 0.3・update!）"
            code={`
0.07s 鈴木    TRANSACTION  BEGIN
0.07s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.08s 鈴木  読んだ値 {"price" => 300, "lock_version" => 0}
0.18s 佐藤    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.18s 佐藤    TRANSACTION  BEGIN
0.18s 佐藤    Product Update  UPDATE \`products\` SET \`products\`.\`price\` = 350, \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 1 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
0.19s 佐藤    TRANSACTION  COMMIT
0.19s 佐藤  価格を 350 にして確定
0.39s 鈴木    Product Update  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）', \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 1 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
0.39s 鈴木  => ActiveRecord::StaleObjectError
0.39s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.39s 鈴木  同じトランザクションで読み直す {"price" => 300, "lock_version" => 0}
0.39s 鈴木    TRANSACTION  COMMIT
0.39s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.39s 鈴木  トランザクションの後で読み直す {"price" => 350, "lock_version" => 1}
`}
          />
          <p>
            鈴木さんの UPDATE は最新の行（lock_version 1）に対して <code>lock_version = 0</code> を評価し、StaleObjectError になりました。ところが、同じトランザクションの中で読み直すと、スナップショットの価格 300・lock_version 0 が返りました。この値を「最新の内容」として画面に出し、lock_version 0 をフォームに入れると、利用者がもう一度保存しても必ず競合します。最新の内容は、トランザクションが終わってから読みます。この章のコントローラーが rescue して読み直すのは、<code>update</code> が自分で開いたトランザクションを抜けた後なので、返す値は最新の値（350・1）です。<code>around_action</code> などでアクション全体をトランザクションで囲んでいる場合は、この問題が起きます。
          </p>
          <h3>SERIALIZABLE に上げると</h3>
          <p>scene の節の B と同じ「読んで計算して書く」処理を、分離レベル SERIALIZABLE のトランザクションで実行しました。</p>
          <Code
            lang="text"
            title="実行結果（Product.transaction(isolation: :serializable)。在庫 5）"
            code={`
0.07s 注文1    TRANSACTION  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
0.07s 注文1    TRANSACTION  BEGIN
0.07s 注文1    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.07s 注文1  在庫 5 を読む
0.17s 注文2    TRANSACTION  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
0.17s 注文2    TRANSACTION  BEGIN
0.17s 注文2    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.17s 注文2  在庫 5 を読む
0.47s 注文2    Product Update  UPDATE \`products\` SET \`products\`.\`stock\` = 4, \`products\`.\`updated_at\` = … WHERE \`products\`.\`id\` = 1
0.47s 注文2    TRANSACTION  ROLLBACK
0.47s 注文2  => ActiveRecord::Deadlocked: Mysql2::Error: Deadlock found when trying to get lock; try restarting transaction
0.47s 注文1    Product Update  UPDATE \`products\` SET \`products\`.\`stock\` = 4, \`products\`.\`updated_at\` = … WHERE \`products\`.\`id\` = 1
0.48s 注文1    TRANSACTION  COMMIT
0.48s 注文1  注文を確定
最後の在庫: 4
`}
          />
          <p>
            SERIALIZABLE では、InnoDB がトランザクションの中の通常の SELECT を <code>SELECT ... FOR SHARE</code> に変えるので（<ChapterLink n={38} section="isolation" />）、2つの注文がどちらも共有ロックを持ちます。注文1の UPDATE は注文2の共有ロックを待ち、注文2の UPDATE は注文1の共有ロックを待つので、デッドロックになりました。InnoDB はデッドロックを自動で検出し、片方のトランザクションをロールバックします<Ref n={7} />。ログは SQL が終わった時点で出るので、注文1の UPDATE は注文2のロールバックの後に表示されています。在庫は正しく 4 ですが、注文2は <code>ActiveRecord::Deadlocked</code> で失敗し、最初からやり直す必要があります。MySQL のマニュアルも、デッドロックで失敗したトランザクションをもう一度実行できるよう備えておくよう求めています<Ref n={8} />。
          </p>
          <div className="table-wrap">
            <table>
              <caption>MySQL 8.4（InnoDB）で、同時の更新がどうなったか</caption>
              <thead>
                <tr>
                  <th scope="col">書き方</th>
                  <th scope="col">REPEATABLE READ（既定）</th>
                  <th scope="col">SERIALIZABLE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">読んで計算して書く</th>
                  <td>エラーにならず、更新が消える</td>
                  <td>デッドロックで片方が失敗する。やり直しが必要</td>
                </tr>
                <tr>
                  <th scope="row">条件付きの UPDATE</th>
                  <td>最新の行に対して条件を評価する</td>
                  <td>同じ（この章では SERIALIZABLE で使う理由がない）</td>
                </tr>
                <tr>
                  <th scope="row">楽観的ロック（lock_version）</th>
                  <td>最新の行の版番号と比べ、0件なら StaleObjectError。同じトランザクションの SELECT はスナップショットのまま</td>
                  <td>読んだ行に共有ロックが付くので、ロックの待ちとデッドロックが加わる</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'stock-update',
      title: '在庫の減算は条件付きの UPDATE で書く',
      body: (
        <>
          <p>
            在庫の減算は、新しい値を今の値から計算できます。この場合は版番号を使わず、「在庫が足りるときだけ減らす」という条件を UPDATE の WHERE に書きます。この章の <code>Product#reserve!</code> は次のとおりです（<ChapterLink n={34} section="transaction-design" />と同じ形です）。
          </p>
          <Code
            lang="ruby"
            title="app/models/product.rb（reserve! の部分）"
            code={`
  # 在庫を減らす。条件付きの UPDATE 1文で、足りるときだけ減らす。
  # SQL の文字列で書くので lock_version は増えない（管理画面の編集と競合させない）
  def reserve!(quantity)
    raise ArgumentError, "quantity must be a positive integer" unless quantity.is_a?(Integer) && quantity.positive?

    changed = self.class.where(id: id).where("stock >= ?", quantity)
                  .update_all(["stock = stock - ?, updated_at = ?", quantity, Time.current])
    raise OutOfStock, "在庫が不足しています" unless changed == 1
  end
`}
          />
          <h3>3つの書き方で、10件の注文を同時に送る</h3>
          <p>
            在庫 5 の商品に、10 のスレッドから同時に1つずつ注文しました。条件付きの UPDATE（<code>reserve!</code>）、条件のない <code>update_counters</code>、悲観的ロック（<code>with_lock</code> の中で在庫を確かめて <code>update!</code>）の3つです。
          </p>
          <Code
            lang="ruby"
            title="比べた3つの書き方（各スレッドで1回ずつ実行）"
            code={`
Product.find(1).reserve!(1)                           # 条件付きの UPDATE
Product.update_counters(1, stock: -1)                 # 条件のない加減算

product = Product.find(1)                             # 悲観的ロック
product.with_lock do
  raise Product::OutOfStock, "在庫が不足しています" if product.stock < 1
  product.update!(stock: product.stock - 1)
end
`}
          />
          <Code
            lang="text"
            title="実行結果（各書き方の前に在庫を 5 に戻した。失敗した注文ごとの行は省略）"
            code={`
reserve!（条件付きの UPDATE）: {"ok" => 5, "Product::OutOfStock" => 5}  最後の在庫=0
update_counters（条件なし）    : {"ok" => 5, "ActiveRecord::CheckViolation" => 5}  最後の在庫=0
with_lock（悲観的ロック）      : {"Product::OutOfStock" => 5, "ok" => 5}  最後の在庫=0

== 発行される SQL（1回分）
Product Update All  UPDATE \`products\` SET stock = stock - '1', updated_at = … WHERE \`products\`.\`id\` = 1 AND (stock >= '1')
Product Update All  UPDATE \`products\` SET \`products\`.\`stock\` = COALESCE(\`products\`.\`stock\`, 0) - 1, \`products\`.\`lock_version\` = COALESCE(\`products\`.\`lock_version\`, 0) + 1 WHERE \`products\`.\`id\` = 1
TRANSACTION  BEGIN
Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1 FOR UPDATE
Product Update  UPDATE \`products\` SET \`products\`.\`stock\` = 2, \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 2 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 1
TRANSACTION  COMMIT
`}
          />
          <p>3つとも在庫は 0 で止まりましたが、止まり方が違います。</p>
          <ul>
            <li>
              <code>reserve!</code>：在庫が足りないときは WHERE に合う行がなく、<code>update_all</code> が 0 を返すので <code>OutOfStock</code> にしました。DB に送る文は1つで、行のロックは UPDATE の間だけです。
            </li>
            <li>
              <code>update_counters</code>：<code>stock = COALESCE(stock, 0) - 1</code> の加減算なので、同時に実行しても減らした数は消えません。ただし在庫が足りるかを確かめないので、6件目からは CHECK 制約（<code>stock &gt;= 0</code>）の違反で止まりました。<code>decrement!</code> も同じ <code>update_counters</code> を使います。CHECK 制約がなければ、在庫は負になります。
            </li>
            <li>
              <code>with_lock</code>：<code>SELECT ... FOR UPDATE</code> で読み直してから判断するので、後の注文はロックが外れるまで待ち、順番に処理されます<Ref n={4} />。判断にほかの表の情報（1人あたりの購入数の上限を注文の履歴から数える、など）が要る場合はこの書き方を選びます。ロックを持っている間に外部の API を呼ぶと、ほかの注文がすべて待たされます（<ChapterLink n={34} section="transaction-design" />）。
            </li>
          </ul>
          <h3>lock_version との関係</h3>
          <p>
            上の SQL を見ると、<code>update_counters</code> だけが <code>lock_version</code> を1つ増やしています。<code>update_all</code> にハッシュを渡すと、楽観的ロックが有効なモデルでは lock_version を増やす式が自動で加わります。SQL の文字列や配列を渡したときは加わりません<Ref n={13} />。<code>update_counters</code> は内部でハッシュを渡すので、増えます。これが管理画面の編集にどう影響するかを確かめました。編集画面を開いた（lock_version を読んだ）後に注文が入り、その後で価格を保存します。
          </p>
          <Code
            lang="text"
            title="実行結果（フォームは名前・価格・lock_version。4 だけはフォームに在庫も入れた）"
            code={`
== 3. 管理画面で商品を開いている間に注文が入る
reserve! の後で価格を保存 => 成功 ["緑茶", 350, 4, 1]
update_counters の後で価格を保存 => ActiveRecord::StaleObjectError
== 4. 管理画面のフォームに在庫も入れていた場合
reserve! の後で価格と在庫を保存 => ["緑茶", 350, 5, 1]
`}
          />
          <ul>
            <li><code>reserve!</code> は lock_version を変えないので、価格の保存は成功しました。フォームに在庫がないので、部分更新で在庫の列は書かれず、注文で減った 4 が残ります。</li>
            <li><code>update_counters</code> は lock_version を増やすので、担当者は在庫に触れていないのに競合になりました。注文が多い商品では、管理画面の保存がほとんど失敗します。</li>
            <li>フォームに在庫も入れていた場合は、画面を開いたときの在庫 5 が送られ、lock_version は一致するので保存に成功し、注文で減らした分が消えました。</li>
          </ul>
          <p>
            このことから、在庫は商品の編集フォームに入れず、注文での減算や入荷での加算のように増減の量で更新します。棚卸しで在庫の数を直接直す必要があるなら、商品の編集とは別の操作にします。在庫の減算は SQL の文字列で書いて lock_version を変えず、名前や価格の編集とは競合させません。
          </p>
          <div className="table-wrap">
            <table>
              <caption>在庫の更新の書き方の使い分け</caption>
              <thead>
                <tr>
                  <th scope="col">書き方</th>
                  <th scope="col">使う場面</th>
                  <th scope="col">lock_version</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>where("stock &gt;= ?", n).update_all(["stock = stock - ?", n])</code></th>
                  <td>足りるときだけ減らす。注文の減算</td>
                  <td>変えない</td>
                </tr>
                <tr>
                  <th scope="row"><code>update_counters</code>・<code>increment!</code>・<code>decrement!</code></th>
                  <td>条件のない加減算。入荷の加算、閲覧数</td>
                  <td>増やす（ハッシュを渡すため）</td>
                </tr>
                <tr>
                  <th scope="row"><code>lock!</code>・<code>with_lock</code></th>
                  <td>ほかの表の情報を読んで判断してから書く。短い処理に限る</td>
                  <td>save で増やす</td>
                </tr>
                <tr>
                  <th scope="row"><code>lock_version</code> とフォーム</th>
                  <td>利用者が画面で判断する編集</td>
                  <td>save で増やし、WHERE で確かめる</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'etag',
      title: 'API での ETag と If-Match',
      body: (
        <>
          <p>
            スマートフォンのアプリや別のシステムが JSON の API で商品を編集する場合は、フォームの隠し項目の代わりに HTTP のヘッダーで版番号を受け渡します。<Term en="ETag">ETag</Term> は、サーバーが応答に付けるヘッダーで、リソースのその時点の版を表す値（エンティティタグ）を入れます。<Term en="If-Match">If-Match</Term> は、クライアントがリクエストに付けるヘッダーで、「サーバーにあるリソースの今の ETag がこの値と一致するときだけ処理する」ことを求めます。
          </p>
          <p>
            HTTP の仕様（RFC 9110）は、If-Match を、複数のクライアントが同じリソースを同時に更新するときの更新の消失を防ぐために使うと説明しています。条件が偽なら処理を行わず、412（Precondition Failed）を返せます。また、If-Match の比較には強い比較を使うと定めています。強い比較では、<code>W/</code> の付いた弱い ETag は一致しません<Ref n={9} />。If-Match のない更新を受け付けないサーバーは、428（Precondition Required）を返します<Ref n={10} />。
          </p>
          <h3>stale? と fresh_when は GET 用</h3>
          <p>
            Rails の <code>stale?</code> と <code>fresh_when</code> は、応答に ETag や Last-Modified を付け、リクエストの <code>If-None-Match</code> や <code>If-Modified-Since</code> と一致すれば 304（Not Modified）を返す機能です<Ref n={14} />。ブラウザーのキャッシュを確かめる GET のためのもので、既定の ETag は <code>W/</code> の付いた弱い ETag です<Ref n={15} />。リクエストの側で Rails が読むのは If-None-Match と If-Modified-Since だけで、If-Match は読みません<Ref n={15} />。Rack の <code>Rack::ConditionalGet</code> ミドルウェアも、GET と HEAD だけを対象にします<Ref n={16} />。更新の条件は、コントローラーに自分で書きます。
          </p>
          <h3>If-Match を確かめるコントローラー</h3>
          <Code
            lang="ruby"
            title="app/controllers/api/products_controller.rb"
            code={`
class Api::ProductsController < ActionController::API
  def show
    product = Product.find(params[:id])
    response.headers["ETag"] = etag_for(product)
    render json: json_for(product)
  end

  def update
    product = Product.find(params[:id])
    if_match = request.headers["If-Match"]
    return head :precondition_required if if_match.blank? # 428：If-Match のない更新は受け付けない

    version = if_match[/\\A"v(\\d+)"\\z/, 1] or return head :precondition_failed
    product.update!(params.expect(product: [:name, :price]).merge(lock_version: version))
    response.headers["ETag"] = etag_for(product)
    render json: json_for(product)
  rescue ActiveRecord::StaleObjectError
    latest = Product.find(params[:id])
    response.headers["ETag"] = etag_for(latest)
    render json: { error: "precondition_failed", latest: json_for(latest) },
           status: :precondition_failed # 412
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
  end

  private

  # 在庫は注文で lock_version を変えずに変わるので、この表現に含めない
  def json_for(product) = product.slice(:id, :name, :price)

  # 版番号を強い ETag にする（If-Match は強い比較なので W/ を付けない）
  def etag_for(product) = %("v#{product.lock_version}")
end
`}
          />
          <p>
            ETag は <code>"v0"</code> のように lock_version から作り、If-Match から取り出した番号を <code>lock_version</code> に代入して保存します。代入した値が UPDATE の WHERE に入るので、フォームの隠し項目と同じ仕組みで競合を検出できます。この例が受け付けるのは1つのタグだけで、<code>*</code> や複数のタグの並び、弱い ETag は 412 です。
          </p>
          <p>
            強い ETag は、表現（応答の本文）が変わるたびに変わる必要があります。在庫は <code>reserve!</code> で lock_version を変えずに変わるので、この API の表現には含めず、在庫は別のリソースで返します。在庫を含めたまま lock_version を ETag にすると、在庫が変わっても同じ ETag になり、If-None-Match の GET が古い在庫で 304 を返します。
          </p>
          <Figure n="85-4" title="ETag と If-Match による条件付きの更新" caption="下の実行結果を図にしたもの。実線の矢印は要求、破線の矢印は応答。">
            <EtagFigure />
          </Figure>
          <Code
            lang="text"
            title="実行結果（ActionDispatch::Integration::Session で送った）"
            code={`
GET /api/products/1 => 200 ETag: "v0" {"id":1,"name":"緑茶","price":300}
（ほかの人が価格を 350 にして保存）
PATCH If-Match: "v0" => 412 ETag: "v1" {"error":"precondition_failed","latest":{"id":1,"name":"緑茶","price":350}}
PATCH（If-Match なし） => 428 ETag: -
PATCH If-Match: "v1" => 200 ETag: "v2" {"id":1,"name":"緑茶（静岡）","price":350}
PATCH If-Match: W/"v2" => 412 ETag: -
GET If-None-Match: "v2" => 304 ETag: "v2"
`}
          />
          <p>
            図 85-4 のとおり、古い ETag の PATCH は 412 と最新の内容と新しい ETag を受け取り、クライアントは利用者に確かめてから新しい ETag で送り直します。If-Match のない PATCH は 428 です。最後の行の 304 は、自分で設定した ETag に対して <code>Rack::ConditionalGet</code> が返したもので、GET のキャッシュの確認にも同じ ETag を使えています。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：lock_version を画面と受け渡し、競合を 409 で返す',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  controllers/products_controller.rb       # StaleObjectError を 409 と選び直しの画面にする
  controllers/api/products_controller.rb   # ETag と If-Match（etag の節）
  models/product.rb                        # 検証と reserve!（stock-update の節）
  views/products/edit.html.erb             # lock_version の隠し項目と、競合したときの選択肢
db/migrate/20261120000002_add_lock_version_to_products.rb
spec/models/product_locking_spec.rb
spec/models/product_concurrency_spec.rb
spec/requests/products_spec.rb
`}
          />
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261120000002_add_lock_version_to_products.rb"
            code={`
class AddLockVersionToProducts < ActiveRecord::Migration[8.1]
  def change
    # lock_version という名前の整数の列があると、Active Record は楽観的ロックを使う
    add_column :products, :lock_version, :integer, null: false, default: 0
  end
end
`}
          />
          <p>
            既存の行は lock_version 0 から始まります。<code>null: false</code> と既定値を付けるのは、lock_version が NULL だと版番号として比べられないためです。Rails 8.1 は lock_version が nil の行を保存しようとすると、原因を示すエラーを投げます<Ref n={11} />。列の名前を変えたいときは、モデルで <code>self.locking_column = :列名</code> を指定します<Ref n={3} />。
          </p>
          <h3>フォームに lock_version を入れる</h3>
          <Code
            lang="erb"
            title="app/views/products/edit.html.erb"
            code={`
<% if @mine %>
  <p id="conflict">ほかの人が先に保存しました。値が違う項目は、残す値を選んでからもう一度保存してください。</p>
<% end %>
<ul id="errors"><% @product.errors.full_messages.each do |message| %><li><%= message %></li><% end %></ul>
<%= form_with model: @product do |form| %>
  <%= form.hidden_field :lock_version %>
  <% %w[name price].each do |attr| %>
    <% if @mine && @mine[attr].to_s != @product[attr].to_s %>
      <fieldset>
        <legend><%= Product.human_attribute_name(attr) %></legend>
        <label><%= form.radio_button attr, @product[attr] %> 最新の内容：<%= @product[attr] %></label>
        <label><%= form.radio_button attr, @mine[attr] %> あなたの入力：<%= @mine[attr] %></label>
      </fieldset>
    <% else %>
      <%= form.label attr %> <%= form.text_field attr %>
    <% end %>
  <% end %>
  <%= form.submit "保存" %>
<% end %>
`}
          />
          <p>
            <code>form.hidden_field :lock_version</code> が画面を開いたときの版番号をフォームに入れます。競合したとき（<code>@mine</code> があるとき）は、最新の内容と利用者の入力が違う項目だけを、2つの選択肢のラジオボタンにします。<code>radio_button</code> はオブジェクトの値と同じ選択肢を選んだ状態で表示するので、最初に選ばれているのは「最新の内容」です。利用者が何も選び直さずに保存しても、ほかの人の変更は消えません。
          </p>
          <h3>コントローラー</h3>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb"
            code={`
class ProductsController < ApplicationController
  def edit
    @product = Product.find(params[:id])
  end

  def update
    @product = Product.find(params[:id])
    if @product.update(product_params) # WHERE に画面を開いたときの lock_version が入る
      redirect_to edit_product_path(@product), notice: "保存しました"
    else
      render :edit, status: :unprocessable_content
    end
  rescue ActiveRecord::StaleObjectError
    @mine = product_params.except(:lock_version) # 利用者が送った内容
    @product = Product.find(params[:id])         # 最新の内容と、最新の lock_version
    render :edit, status: :conflict
  end

  private

  def product_params
    params.expect(product: [:name, :price, :lock_version])
  end
end
`}
          />
          <p>
            scene の節のコードとの違いは、許可するパラメーターに <code>:lock_version</code> を加えたことと、<code>StaleObjectError</code> の rescue です。フォームから送られた lock_version を代入すると、Rails は代入した値を UPDATE の WHERE に使います。代入していなければ、読み込んだときの値を使います<Ref n={12} />。
          </p>
          <p>
            rescue では、利用者の入力を <code>@mine</code> に取っておき、商品を読み直して最新の内容と最新の lock_version を <code>@product</code> にします。<code>update</code> が開いたトランザクションはもう終わっているので、読み直した値は確定した最新の値です（isolation の節）。応答は 409（Conflict）にし、検証エラーの 422 と分けます。利用者がこの画面から保存すると、最新の lock_version で送られるので、選んだ値で保存できます。
          </p>
          <h3>動かして確かめる</h3>
          <p>scene の節の A と同じ操作を、lock_version を加えた後のコードで行いました。続けて、鈴木さんが名前は自分の入力、価格は最新の内容を選んで保存します。</p>
          <Code
            lang="text"
            title="実行結果（所要時間と日時の値は省略。HTML は 409 の応答の本文の抜粋で、authenticity_token は省略）"
            code={`
0.16s 佐藤    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.18s 佐藤  画面の値 {"lock_version" => "0", "name" => "緑茶", "price" => "300"}
0.18s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.18s 鈴木  画面の値 {"lock_version" => "0", "name" => "緑茶", "price" => "300"}
0.18s 佐藤    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.19s 佐藤    TRANSACTION  BEGIN
0.19s 佐藤    Product Update  UPDATE \`products\` SET \`products\`.\`price\` = 350, \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 1 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
0.19s 佐藤    TRANSACTION  COMMIT
0.20s 佐藤  応答 302
0.20s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.20s 鈴木    TRANSACTION  BEGIN
0.20s 鈴木    Product Update  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）', \`products\`.\`price\` = 300, \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 1 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
0.20s 鈴木    TRANSACTION  ROLLBACK
0.20s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.20s 鈴木  応答 409
<p id="conflict">ほかの人が先に保存しました。値が違う項目は、残す値を選んでからもう一度保存してください。</p>
  <input type="hidden" value="1" name="product[lock_version]" id="product_lock_version" />
      <fieldset>
        <legend>Name</legend>
        <label><input type="radio" value="緑茶" checked="checked" name="product[name]" id="product_name_緑茶" /> 最新の内容：緑茶</label>
        <label><input type="radio" value="緑茶（静岡）" name="product[name]" id="product_name_緑茶静岡" /> あなたの入力：緑茶（静岡）</label>
      </fieldset>
      <fieldset>
        <legend>Price</legend>
        <label><input type="radio" value="350" checked="checked" name="product[price]" id="product_price_350" /> 最新の内容：350</label>
        <label><input type="radio" value="300" name="product[price]" id="product_price_300" /> あなたの入力：300</label>
      </fieldset>
== 鈴木さんが名前は自分の入力、価格は最新の内容を選んで保存
送る値 {"lock_version" => "1", "name" => "緑茶（静岡）", "price" => "350"}
0.20s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.20s 鈴木    TRANSACTION  BEGIN
0.21s 鈴木    Product Update  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）', \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 2 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 1
0.21s 鈴木    TRANSACTION  COMMIT
0.21s 鈴木  応答 302
最後の行: ["緑茶（静岡）", 350, 5, 2]
`}
          />
          <p>
            鈴木さんの最初の UPDATE は <code>lock_version = 0</code> を条件にしたので0件になり、ROLLBACK して 409 を返しました。画面には lock_version 1 の隠し項目と、名前・価格の2つの選択肢が出ています。名前は「あなたの入力」、価格は「最新の内容」を選んで保存すると、UPDATE は <code>lock_version = 1</code> を条件に1件を更新しました。価格は変わっていないので部分更新で SET に入らず、名前と lock_version だけが書かれています。
          </p>
          <h3>リファクタリングの手順</h3>
          <ol>
            <li>同時に更新されうる表と列を挙げます。管理画面で編集する表、在庫や残高のように計算して上書きしている列です。</li>
            <li>今の値から計算できる更新は、条件付きの UPDATE 1文にします（<code>reserve!</code>）。その列は編集フォームから外します。</li>
            <li>画面をまたぐ編集の表に <code>lock_version</code> の列を加えます（既存の行は 0）。</li>
            <li>フォームの隠し項目に lock_version を入れ、許可するパラメーターに加えます。API では ETag と If-Match で受け渡します。</li>
            <li><code>StaleObjectError</code> を rescue し、トランザクションの外で最新の内容を読み直して、409（API は 412）と選び直しの画面を返します。</li>
            <li>2つのオブジェクト・2つのセッションで競合を再現するテストを書きます。</li>
          </ol>
          <Callout kind="v72">
            <p>
              楽観的ロックの UPDATE（<code>_update_row</code>）と、代入した lock_version を WHERE に使う処理（<code>_lock_value_for_database</code>）は Rails 7.2.2.2 でも同じで、違いは 8.1 で lock_version が nil のときのエラーが加わったことだけです。<code>update_all</code> にハッシュを渡すと lock_version を増やす処理も 7.2.2.2 にあります。<code>params.expect</code> は Rails 8.0 で加わったメソッドなので、7.2 では <code>params.require(:product).permit(:name, :price, :lock_version)</code> と書きます<Ref n={18} />。CHECK 制約の違反は 7.2 では <code>ActiveRecord::CheckViolation</code> ではなく <code>ActiveRecord::StatementInvalid</code> です。
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
            競合は同じ行を2つのオブジェクトに読み込み、順に保存するだけで再現できます。スレッドやタイミングに頼らないので、毎回同じ結果になります。同時に動く注文と REPEATABLE READ の振る舞いを確かめるには別々の DB 接続が必要なので、テストごとのトランザクションを使わないテストに分けます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/product_locking_spec.rb"
            code={`
require "rails_helper"

RSpec.describe Product do
  let!(:product) { described_class.create!(name: "緑茶", price: 300, stock: 5) }

  it "同じ行を読んだ2つのオブジェクトのうち、後から保存した方は StaleObjectError になる" do
    for_sato = described_class.find(product.id)
    for_suzuki = described_class.find(product.id)

    for_sato.update!(price: 350) # UPDATE ... WHERE id = ? AND lock_version = 0 で、lock_version を 1 にする
    expect { for_suzuki.update!(name: "緑茶（静岡）") }.to raise_error(ActiveRecord::StaleObjectError)
    expect(product.reload).to have_attributes(name: "緑茶", price: 350, lock_version: 1)
  end

  it "画面から送られた lock_version を代入すると、その値で確かめる" do
    product.update!(price: 350) # ほかの人が先に保存した（lock_version は 1）
    latest = described_class.find(product.id)

    expect { latest.update!(name: "緑茶（静岡）", lock_version: 0) }.to raise_error(ActiveRecord::StaleObjectError)
    expect(latest.update!(name: "緑茶（静岡）", lock_version: 1)).to be(true)
  end

  it "reserve! は lock_version を変えず、update_counters は lock_version を1つ増やす" do
    expect { product.reserve!(1) }.not_to(change { product.reload.lock_version })
    expect { described_class.update_counters(product.id, stock: -1) }.to change { product.reload.lock_version }.by(1)
    expect(product.stock).to eq(3)
  end

  it "在庫が足りなければ OutOfStock にし、在庫を変えない" do
    expect { product.reserve!(6) }.to raise_error(Product::OutOfStock)
    expect(product.reload.stock).to eq(5)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/product_concurrency_spec.rb"
            code={`
require "rails_helper"

# 別々の DB 接続で同時に動かすので、テストごとのトランザクションを使わない
RSpec.describe Product, "同時の更新" do
  self.use_transactional_tests = false
  after { described_class.delete_all }

  let!(:product) { described_class.create!(name: "緑茶", price: 300, stock: 5) }

  def in_thread(&block)
    Thread.new { ActiveRecord::Base.connection_pool.with_connection(&block) }
  end

  it "8件の注文が同時に reserve!(1) しても、成功するのは在庫の数だけ" do
    results = 8.times.map do
      in_thread do
        described_class.find(product.id).reserve!(1)
        :ok
      rescue Product::OutOfStock
        :out_of_stock
      end
    end.map(&:value)

    expect(results.tally).to eq(ok: 5, out_of_stock: 3)
    expect(product.reload.stock).to eq(0)
  end

  it "REPEATABLE READ でも、条件付きの UPDATE は最新の行に対して条件を評価する" do
    product.update!(stock: 1)
    read, committed = Queue.new, Queue.new
    first = in_thread do
      described_class.transaction do
        seen = described_class.find(product.id).stock # スナップショットを作る
        read << true
        committed.pop # もう1つの注文が確定するまで待つ
        changed = described_class.where(id: product.id).where("stock >= ?", 1)
                                 .update_all(["stock = stock - ?", 1])
        [seen, changed, described_class.find(product.id).stock]
      end
    end
    read.pop
    in_thread { described_class.find(product.id).reserve!(1) }.join
    committed << true

    # 読んだ在庫は 1、UPDATE は 0 件、同じトランザクションで読み直すとスナップショットの 1
    expect(first.value).to eq([1, 0, 1])
    expect(product.reload.stock).to eq(0)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/products_spec.rb（商品の編集の部分。API の部分は省略）"
            code={`
RSpec.describe "商品の編集", type: :request do
  let!(:product) { Product.create!(name: "緑茶", price: 300, stock: 5) }

  it "古い lock_version で保存すると 409 で、値が違う項目を選ぶ画面を返す" do
    product.update!(price: 350) # ほかの人が先に保存した（lock_version は 1）

    patch product_path(product), params: { product: { name: "緑茶（静岡）", price: 300, lock_version: 0 } }

    expect(response).to have_http_status(:conflict)
    expect(response.body).to include("ほかの人が先に保存しました")
    expect(response.body).to include('value="1" name="product[lock_version]"')       # 最新の lock_version
    expect(response.body).to include('value="350" checked="checked" name="product[price]"') # 最新の内容を選んだ状態
    expect(response.body).to include("あなたの入力：緑茶（静岡）")
    expect(product.reload).to have_attributes(name: "緑茶", price: 350)
  end

  it "選び直した内容を最新の lock_version で送ると保存できる" do
    product.update!(price: 350)

    patch product_path(product), params: { product: { name: "緑茶（静岡）", price: 350, lock_version: 1 } }

    expect(response).to redirect_to(edit_product_path(product))
    expect(product.reload).to have_attributes(name: "緑茶（静岡）", price: 350, lock_version: 2)
  end

  it "入力の誤りは 422 で、競合とは分けて返す" do
    patch product_path(product), params: { product: { name: "", price: 300, lock_version: 0 } }

    expect(response).to have_http_status(:unprocessable_content)
    expect(product.reload.lock_version).to eq(0)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/requests/products_spec.rb（API の部分）"
            code={`
RSpec.describe "商品の API", type: :request do
  let!(:product) { Product.create!(name: "緑茶", price: 300, stock: 5) }

  def patch_name(headers = {})
    patch api_product_path(product), params: { product: { name: "緑茶（静岡）" } }, headers:, as: :json
  end

  it "If-Match が古ければ 412 と最新の内容を返す" do
    product.update!(price: 350)
    patch_name("If-Match" => '"v0"')

    expect(response).to have_http_status(:precondition_failed)
    expect(response.parsed_body.dig("latest", "price")).to eq(350)
    expect(response.headers["ETag"]).to eq('"v1"')
    expect(product.reload.name).to eq("緑茶")
  end

  it "If-Match がなければ 428、弱い ETag なら 412" do
    patch_name
    expect(response).to have_http_status(:precondition_required)

    patch_name("If-Match" => 'W/"v0"')
    expect(response).to have_http_status(:precondition_failed)
    expect(product.reload.name).to eq("緑茶")
  end
  # …（省略：GET の ETag、If-Match が一致したときの 200）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
Product 同時の更新
  8件の注文が同時に reserve!(1) しても、成功するのは在庫の数だけ
  REPEATABLE READ でも、条件付きの UPDATE は最新の行に対して条件を評価する

Product
  同じ行を読んだ2つのオブジェクトのうち、後から保存した方は StaleObjectError になる
  画面から送られた lock_version を代入すると、その値で確かめる
  reserve! は lock_version を変えず、update_counters は lock_version を1つ増やす
  在庫が足りなければ OutOfStock にし、在庫を変えない

環境
  MySQL 8.4 につながる

商品の編集
  古い lock_version で保存すると 409 で、値が違う項目を選ぶ画面を返す
  選び直した内容を最新の lock_version で送ると保存できる
  入力の誤りは 422 で、競合とは分けて返す

商品の API
  GET は lock_version を強い ETag で返す
  If-Match が今の版と一致すれば更新し、新しい ETag を返す
  If-Match が古ければ 412 と最新の内容を返す
  If-Match がなければ 428、弱い ETag なら 412

Finished in 0.32884 seconds (files took 0.90542 seconds to load)
14 examples, 0 failures
`}
          />
          <p>テストで確かめていることは次のとおりです（「環境」は検証用のアプリが MySQL 8.4 につながることの確認です）。</p>
          <ul>
            <li>モデルのテスト：2つのオブジェクトで後の保存が StaleObjectError になること、代入した lock_version で確かめること、<code>reserve!</code> と <code>update_counters</code> の lock_version の違い、在庫不足のときに在庫を変えないこと。</li>
            <li>同時の更新のテスト：8つのスレッドの注文のうち成功するのは在庫の5件だけであること。<code>Queue</code> で順番を決め、スナップショットで在庫 1 が見えていても、条件付きの UPDATE は 0 件になること。</li>
            <li>リクエストのテスト：409 の画面に最新の lock_version と、最新の内容を選んだ状態の選択肢が出ること、最新の lock_version で送り直すと保存できること、入力の誤りは 422 になること。API は 412・428 と ETag の値。</li>
          </ul>
          <p>
            同時の更新のテストは、別々の接続が互いの確定した変更を見る必要があるので、<code>use_transactional_tests = false</code> にして、終わった後に行を消しています（<ChapterLink n={20} section="transaction" />）。ランダムな順序で3回実行し、3回とも通ることを確かめました。
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
            <li>ほかの人の変更を、知らせずに消すことがなくなります。競合したときは、利用者が最新の内容を見て判断できます。</li>
            <li>ロックを持たないので、編集画面を開いている間にほかの人を待たせません。競合がまれなら、ほとんどの保存はそのまま成功します。</li>
            <li>確かめる処理は UPDATE の WHERE だけで、Rails では <code>lock_version</code> の列とフォームの隠し項目で実現できます。REPEATABLE READ でも READ COMMITTED でも同じ形で働きます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>競合したときの画面（最新の内容と入力の比較、選び直し）と、API の 412・428 の扱いを作る必要があります。</li>
            <li>版番号を、画面・API・保存の処理の間で受け渡す必要があります。許可するパラメーターから lock_version が漏れると、確かめられなくなります（anti-patterns の節）。</li>
            <li>lock_version を増やす更新（<code>update_counters</code> など）と増やさない更新（SQL の文字列の <code>update_all</code>）を区別して設計する必要があります。</li>
            <li>競合が多い場面では保存の失敗が続きます。Rice も、長い業務の処理で競合が多いと、利用者が作業を終えた最後に失敗を知ることになると指摘しています<Ref n={2} />。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            競合は2つのオブジェクトを順に保存するだけで再現でき、リクエストのテストでも古い lock_version を送るだけで 409 の画面を確かめられます。DB の振る舞い（スナップショットと最新の行の違い）に依存する部分だけを、別々の接続のテストに分けます。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <p>MSDP の5つのアンチパターンを、Rails のコードで実行しました。どれも緑茶（300 円、lock_version 0）から始めています。</p>
          <h3>読んでから確かめて、別の文で書き込む</h3>
          <Code
            lang="ruby"
            title="避ける書き方：SELECT で版番号を確かめてから update_all する"
            code={`
def save_checked(id, version, attrs)
  current = Product.where(id: id).pick(:lock_version)
  raise ActiveRecord::StaleObjectError if current != version
  sleep 0.2 # 検証用：確かめてから書くまでの間
  Product.where(id: id).update_all(attrs.merge(lock_version: version + 1))
end
# 佐藤さんは save_checked(1, 0, price: 350)、鈴木さんは 0.1 秒後に save_checked(1, 0, name: "緑茶（静岡）", price: 300)
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
0.27s 佐藤  保存した
0.37s 鈴木  保存した
最後の行: ["緑茶（静岡）", 300, 5, 1]
`}
          />
          <p>
            2人とも SELECT の時点では lock_version 0 だったので確かめに通り、後から書いた鈴木さんの 300 円が残りました。確かめる文と書き込む文の間に、ほかの人が保存できます。版番号は、書き込む UPDATE の WHERE で確かめます。Active Record の <code>update</code> は、版番号を UPDATE の WHERE に入れて送るので、この問題は起きません。
          </p>
          <h3>版番号をサーバーで読み直す</h3>
          <Code
            lang="ruby"
            title="避ける書き方：保存のリクエストで読んだ lock_version を使う"
            code={`
product = Product.find(1)                       # 鈴木さんの保存のリクエスト（佐藤さんの保存の後）
product.update(name: "緑茶（静岡）", price: 300) # フォームに lock_version がない
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
TRANSACTION  BEGIN
Product Update  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）', \`products\`.\`price\` = 300, \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 2 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 1
TRANSACTION  COMMIT
最後の行: ["緑茶（静岡）", 300, 5, 2]
`}
          />
          <p>
            WHERE には lock_version 1 が入りましたが、これは保存のリクエストで読んだ最新の値なので、条件は必ず合います。lock_version の列があっても、許可するパラメーターに <code>:lock_version</code> がなかったり、フォームに隠し項目がなかったりすると、この状態になります。確かめるべきなのは利用者が画面を開いたときの版番号なので、画面やクライアントから送り返してもらいます。
          </p>
          <h3>競合したら自動で上書きし直す</h3>
          <Code
            lang="ruby"
            title="避ける書き方：StaleObjectError で読み直して retry する"
            code={`
attrs = { name: "緑茶（静岡）", price: 300 }
begin
  product.update!(attrs)
rescue ActiveRecord::StaleObjectError
  product.reload # 最新の lock_version を読む
  retry          # 同じ入力で上書きし直す
end
`}
          />
          <Code
            lang="text"
            title="実行結果（product は佐藤さんが保存する前に読んだもの）"
            code={`
最後の行: ["緑茶（静岡）", 300, 5, 2]
`}
          />
          <p>
            1回目は競合しましたが、読み直した lock_version で同じ入力を保存し直したので、佐藤さんの 350 円は消えました。楽観的ロックを入れる前と同じ結果です。Rails の <code>reload</code> の API ドキュメントにも、StaleObjectError で reload して retry する例があります<Ref n={17} />。この書き方が使えるのは、ブロックの中で最新の値から計算し直す処理（在庫を1つ減らす、など）だけです。利用者が画面で判断した内容は、利用者に確かめてもらってから保存します。
          </p>
          <h3>0件を確かめない</h3>
          <Code
            lang="ruby"
            title="避ける書き方：update_all・update_columns の戻り値を見ない（佐藤さんが先に保存し、lock_version は 1）"
            code={`
Product.where(id: 1, lock_version: 0).update_all(name: "緑茶（静岡）")

product = Product.find(1).tap { _1.lock_version = 0 } # 画面から送られた古い lock_version
product.update_columns(name: "緑茶（静岡）")
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
Product Update All  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）', \`products\`.\`lock_version\` = COALESCE(\`products\`.\`lock_version\`, 0) + 1 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
update_all の戻り値 0
Product Update  UPDATE \`products\` SET \`products\`.\`name\` = '緑茶（静岡）' WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
update_columns の戻り値 false
最後の行: ["緑茶", 350, 5, 1]
`}
          />
          <p>
            どちらも WHERE に lock_version が入り、0件で何も変えませんでしたが、例外は出ません。<code>update_all</code> は更新した行の数（0）を返し、<code>update_columns</code> は WHERE に lock_version を入れたうえで、更新した行が1でなければ false を返すだけです<Ref n={20} />。戻り値を見ずに「保存しました」と表示すると、利用者の変更は保存されていないのに、利用者には成功と伝わります。<code>update_columns</code> は成功しても lock_version を増やさないので、ほかの人の画面では競合を検出できません。手で書いた更新では、戻り値が 1 でなければ競合として扱います。
          </p>
          <h3>画面をまたいでロックを持つ</h3>
          <Code
            lang="ruby"
            title="避ける書き方：編集画面を開くときに FOR UPDATE でロックする"
            code={`
def edit
  @product = Product.lock.find(params[:id]) # ほかの人の保存を止めたつもり
end
`}
          />
          <Code
            lang="text"
            title="実行結果（佐藤さんが編集画面を開いた 0.1 秒後に、鈴木さんが保存した）"
            code={`
0.53s 佐藤    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1 FOR UPDATE
0.53s 佐藤  編集画面を表示した
0.63s 鈴木    Product Load  SELECT \`products\`.* FROM \`products\` WHERE \`products\`.\`id\` = 1 LIMIT 1
0.63s 鈴木    TRANSACTION  BEGIN
0.63s 鈴木    Product Update  UPDATE \`products\` SET \`products\`.\`price\` = 320, \`products\`.\`updated_at\` = …, \`products\`.\`lock_version\` = 1 WHERE \`products\`.\`id\` = 1 AND \`products\`.\`lock_version\` = 0
0.64s 鈴木    TRANSACTION  COMMIT
0.64s 鈴木  保存した（待たなかった）
`}
          />
          <p>
            トランザクションの外の <code>SELECT ... FOR UPDATE</code> は、autocommit のもとでその文だけのトランザクションになり、文が終わるとロックは外れます。鈴木さんの保存は待たずに進みました。ロックを本当に保存まで持ち続けるには、DB のトランザクションを複数のリクエストにまたがって開いておく必要があり、Web アプリケーションではできません。「編集中」の印を列に保存する方法（Rice の Pessimistic Offline Lock<Ref n={2} />）は、利用者が画面を閉じたときに印が残るので、印の期限と解除の手段も作ることになります。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分けと採用の判断',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>1文の更新：新しい値を今の値から計算できるなら、条件付きの UPDATE で足ります。版番号もロックもいりません（stock-update の節）。</li>
            <li>
              変更した項目だけを書き込む：利用者が変えた項目だけを送れば、別々の項目の編集は消し合いません。Rails の部分更新は、サーバーで読み込んだ値とフォームの値を比べるので、フォームが全項目を送る場合は先の変更を消します（scene の節）。同じ項目を2人が変えた場合も、後から保存した値が残ります。
            </li>
          </ul>
          <h3>ほかの方式</h3>
          <ul>
            <li>
              悲観的ロック（<code>lock!</code>・<code>with_lock</code>）：1つのトランザクションの中で読んで判断して書く処理で、競合が多い場合に使います（図 85-3）。画面をまたぐ場合のために、Rice はアプリケーションでロックを管理する Pessimistic Offline Lock も説明しています<Ref n={2} />。
            </li>
            <li>
              分離レベルを上げる：MySQL で SERIALIZABLE にすると、読んで計算して書く処理はデッドロックで片方が失敗します（isolation の節）。失敗したトランザクションをやり直す処理が必要で、やり直しの間隔の決め方は <ChapterLink n={54} section="idea" /> の Retry with Backoff で扱います。
            </li>
          </ul>
          <h3>似た考え方との違い</h3>
          <ul>
            <li>
              Unit of Work（<ChapterLink n={48} section="idea" />）：変更をまとめて1つのトランザクションで書き込むパターンで、書き込みのときに版番号を確かめることが多いパターンです。Rails で集約に使うなら、ルートに lock_version を置きます。Rails は変更のない行を UPDATE しないので<Ref n={19} />、子だけを変えたときにルートの版番号を確かめるには、ルートの列（合計など）も一緒に変わるようにします。
            </li>
            <li>
              Idempotency Key（<ChapterLink n={52} section="idea" />）：同じ要求が2回届いたときに、2回目を実行しないためのパターンです。楽観的ロックは、別々の人の別々の変更がぶつかることを防ぎます。
            </li>
          </ul>
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
                  <th scope="row"><code>lock_version</code>（楽観的ロック）</th>
                  <td>画面を開いてから保存するまでに時間がかかる編集</td>
                  <td>隠し項目と許可するパラメーター。<code>update_columns</code> は版番号を増やさない</td>
                </tr>
                <tr>
                  <th scope="row"><code>lock!</code>・<code>with_lock</code>・<code>lock</code></th>
                  <td>1つのリクエストの中で読んで判断して書く</td>
                  <td>トランザクションの中で使う。外部の API を呼ばない</td>
                </tr>
                <tr>
                  <th scope="row">条件付きの <code>update_all</code></th>
                  <td>在庫の減算など、今の値から計算できる更新</td>
                  <td>検証とコールバックを通らない。戻り値を確かめる</td>
                </tr>
                <tr>
                  <th scope="row"><code>update_counters</code>・<code>increment!</code></th>
                  <td>条件のない加減算</td>
                  <td>lock_version を増やす。上限・下限は CHECK 制約で守る</td>
                </tr>
                <tr>
                  <th scope="row"><code>stale?</code>・<code>fresh_when</code></th>
                  <td>GET の応答のキャッシュの確認（304）</td>
                  <td>If-Match は扱わない。既定の ETag は弱い ETag</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>採用する条件</h3>
          <ul>
            <li>画面を開いてから保存するまでの間に、ほかの人が同じデータを変更しうる</li>
            <li>競合はまれで、競合したときに利用者がやり直せる</li>
            <li>保存の前にロックを取って、ほかの人を待たせることができない（リクエストをまたぐ）</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>新しい値を今の値から計算できる（在庫の減算、件数の加算）。条件付きの UPDATE で足りる</li>
            <li>競合が頻繁に起きる（同じ行を多くの人が同時に更新する）。悲観的ロックや、処理を1か所に集める設計を考える</li>
            <li>データを1人しか編集しない（自分のプロフィールなど）。ただし、同じ人が複数のタブで編集する場合はある</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>同じ行を同時に更新しうるのは、どの画面と処理か</li>
            <li>新しい値を、今の値から1つの UPDATE で計算できないか。その列を編集フォームから外したか</li>
            <li>版番号を、画面やクライアントから送り返してもらっているか（サーバーで読み直していないか）</li>
            <li>手で書いた更新で、更新した行の数が 1 でないときに競合として扱っているか</li>
            <li>競合したときに、利用者に何を見せ、どう保存し直してもらうか決めたか（409・412 の応答）</li>
            <li>lock_version を増やす更新と増やさない更新を、意図して選んでいるか</li>
          </ol>
          <Callout kind="note" title="この章の2つの例の選び方">
            <p>
              商品の編集は、画面を開いてから保存するまでに時間がかかり、利用者が内容を判断するので、楽観的ロックを使います。在庫の減算は、1つのリクエストの中で終わり、新しい値を今の値から計算できるので、条件付きの UPDATE を使います。在庫は編集フォームに入れません。
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
          <li>更新の消失は、後から保存した人が、画面を開いた時点の値で先の変更を上書きすることで起きます。エラーにならないので気づきにくく、Rails の部分更新もフォームが全項目を送ると防げません。</li>
          <li>楽観的ロックは、版番号（<code>lock_version</code>）を UPDATE の WHERE で確かめ、0件なら競合として扱います。Rails は StaleObjectError を投げます。</li>
          <li>版番号はフォームの隠し項目や ETag・If-Match で、画面やクライアントから送り返してもらいます。サーバーで読み直した版番号では確かめられません。</li>
          <li>競合したら 409（API は 412）と最新の内容を返し、利用者に項目ごとに選んでもらいます。利用者の入力を自動で保存し直してはいけません。</li>
          <li>MySQL の REPEATABLE READ では、SELECT はスナップショットを読み、UPDATE は最新の行に働きます。読んで計算して書く処理はエラーにならずに更新が消え、条件付きの UPDATE と楽観的ロックは正しく働きます。競合の後の最新の内容は、トランザクションの外で読みます。</li>
          <li>在庫の減算は条件付きの UPDATE で書きます。SQL の文字列の <code>update_all</code> は lock_version を変えず、ハッシュを渡す <code>update_all</code> や <code>update_counters</code> は増やします。在庫は編集フォームに入れません。</li>
          <li>Rails の stale?・fresh_when は GET の 304 のための機能です。If-Match による更新の条件は自分で書き、強い ETag と 412・428 を返します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Optimistic Offline Lock', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ、David Rice 執筆）', url: 'https://martinfowler.com/eaaCatalog/optimisticOfflineLock.html', accessed: '2026-11-13', version: '書籍は2002年11月刊', note: '競合を見つけて業務の処理を取り消すこと、確かめることと更新を1つのシステムトランザクションで行うこと、更新の消失。' },
    { title: 'Pessimistic Offline Lock', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ、David Rice 執筆）', url: 'https://martinfowler.com/eaaCatalog/pessimisticOfflineLock.html', accessed: '2026-11-13', version: '書籍は2002年11月刊', note: '長いトランザクションの問題、まず楽観的ロックを試すこと、競合が多いと最後に失敗を知ること、アプリケーションで管理するロック。' },
    { title: 'ActiveRecord::Locking::Optimistic', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Locking/Optimistic.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'lock_version の列で楽観的ロックが有効になること、StaleObjectError、リクエストをまたぐにはフォームの隠し項目に入れること、locking_column。' },
    { title: 'ActiveRecord::Locking::Pessimistic', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Locking/Pessimistic.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'lock と with_lock が SELECT ... FOR UPDATE で行をロックすること。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-consistent-read.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'スナップショットは SELECT に適用され、UPDATE・DELETE はほかのトランザクションが確定した行に働くこと。' },
    { title: 'Transaction Isolation', publisher: 'PostgreSQL 18 Documentation', url: 'https://www.postgresql.org/docs/18/transaction-iso.html', accessed: '2026-11-13', note: 'PostgreSQL の既定は READ COMMITTED、REPEATABLE READ で読んだ後に更新された行を更新すると 40001 のエラーになり、やり直しが必要なこと（MSDP の説明との比較に使用）。' },
    { title: 'Deadlock Detection', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlock-detection.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'InnoDB がデッドロックを自動で検出し、トランザクションをロールバックすること。' },
    { title: 'How to Minimize and Handle Deadlocks', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks-handling.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'デッドロックで失敗したトランザクションをもう一度実行できるよう備えること。' },
    { title: 'RFC 9110 HTTP Semantics（8.8.3 ETag、13.1.1 If-Match、15.5.13 412 Precondition Failed）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-13', version: '2022年6月', note: 'If-Match は更新の消失を防ぐために使い、強い比較で評価すること、条件が偽なら 412 を返せること。' },
    { title: 'RFC 6585 Additional HTTP Status Codes（428 Precondition Required）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc6585.html', accessed: '2026-11-13', version: '2012年4月', note: '条件付きのリクエストを求める 428。' },
    { title: 'activerecord/lib/active_record/locking/optimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/optimistic.rb#L92-L129`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '_update_row が lock_version を増やし、更新した行が 1 でなければ StaleObjectError を投げること、lock_version が nil のときのエラー。' },
    { title: 'activerecord/lib/active_record/locking/optimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/optimistic.rb#L141-L159`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '代入した lock_version を WHERE に使い、代入していなければ読み込んだときの値を使うこと。' },
    { title: 'activerecord/lib/active_record/relation.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation.rb#L619-L629`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'update_all にハッシュを渡すと lock_version を増やす式を加え、文字列のときは加えないこと。' },
    { title: 'actionpack/lib/action_controller/metal/conditional_get.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/conditional_get.rb#L38-L70`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'fresh_when が ETag・Last-Modified を設定し、If-None-Match・If-Modified-Since が一致すれば 304 を返すこと、etag: は弱い ETag であること。' },
    { title: 'actionpack/lib/action_dispatch/http/cache.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/http/cache.rb#L8-L30`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'リクエストで読むのは If-Modified-Since と If-None-Match だけであること。弱い ETag の生成は同じファイルの 259〜265 行目。' },
    { title: 'rack/lib/rack/conditional_get.rb', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/lib/rack/conditional_get.rb#L28-L31', accessed: '2026-11-20', version: 'Rack 3.2.8', note: 'Rack::ConditionalGet が GET と HEAD だけを対象にすること。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L757-L770`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'reload の API ドキュメントにある、StaleObjectError で reload して retry する例。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.0', note: 'params.expect が加わり、params.require(...).permit(...) の代わりに使えること。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L932-L941`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '保存する属性がなければ UPDATE を送らない（_update_row を呼ばない）こと。' },
    { title: 'activerecord/lib/active_record/persistence.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L640-L651`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'update_columns が WHERE に lock_version を含め、更新した行が 1 のときだけ true を返し、lock_version を増やさないこと。' },
  ],
}

export default chapter
