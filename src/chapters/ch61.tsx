import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 42-1 場面の構成 ---------- */
function SceneFigure() {
  return (
    <Svg
      id="42-1"
      w={760}
      h={400}
      label="モバイルアプリが DELETE /api/v1/users/:id で Api::V1::UsersController の destroy を呼び、destroy は User の delete を呼ぶ。月次のバッチは User の update で会員ランクを付け直す。User は delete を論理削除に、update を保存とメールの送信に上書きしていて、delete は中で update を呼ぶ。User は users と invoices のテーブルを読み書きし、UserMailer でメールを送る。管理画面のまとめて退会は User.where(...).delete_all で users の行を直接消す。問題が起きる箇所は4つで、API が失敗しても 200 を返すこと、delete が論理削除であること、update がメールも送ること、delete_all が物理削除であること"
    >
      <Box x={10} y={36} w={170} h={50} lines={['モバイルアプリ', '退会の画面']} fs={12} fill="box4" subTone="muted" />
      <Box x={10} y={176} w={170} h={50} lines={['月次のバッチ', '会員ランクの付け直し']} fs={12} subTone="muted" />
      <Box x={10} y={300} w={170} h={50} lines={['管理画面', 'まとめて退会']} fs={12} subTone="muted" />

      <Box x={280} y={36} w={240} h={50} lines={['Api::V1::UsersController', 'destroy']} fs={12} mono />
      <Arrow x1={180} y1={61} x2={278} y2={61} />
      <T x={229} y={50} anchor="middle" fs={11} mono>
        DELETE
      </T>
      <T x={530} y={50} fs={12} tone="danger">
        ① 失敗しても 200 を返す
      </T>

      <Box x={280} y={150} w={240} h={110} lines={['User', 'delete → update を呼ぶ', 'update → 保存してメールを送る']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow x1={400} y1={86} x2={400} y2={148} />
      <T x={408} y={118} fs={11} mono>
        user.delete
      </T>
      <Arrow x1={180} y1={201} x2={278} y2={201} />
      <T x={229} y={190} anchor="middle" fs={11} mono>
        update
      </T>
      <T x={280} y={278} fs={12} tone="danger">
        ② delete が論理削除
      </T>
      <T x={410} y={278} fs={12} tone="danger">
        ③ update がメールも送る
      </T>

      <Box x={590} y={110} w={160} h={44} lines={['UserMailer', '変更のお知らせ']} fs={12} subTone="muted" />
      <Box x={590} y={176} w={160} h={36} lines="invoices テーブル" fs={12} fill="box4" />
      <Box x={590} y={232} w={160} h={36} lines="users テーブル" fs={12} fill="box4" />
      <Arrow x1={520} y1={170} x2={588} y2={136} />
      <Arrow x1={520} y1={196} x2={588} y2={194} />
      <Arrow x1={520} y1={232} x2={588} y2={248} />

      <Arrow d="M180,325 L670,325 L670,270" />
      <T x={300} y={314} fs={11} mono>
        User.where(id: ids).delete_all
      </T>
      <T x={300} y={346} fs={12} tone="danger">
        ④ リレーションの delete_all は Active Record のまま（物理削除）
      </T>
      <T x={10} y={384} fs={12} tone="muted">
        色の付いた User が、Active Record の delete と update を同じ名前で上書きしている
      </T>
    </Svg>
  )
}

/* ---------- 図 42-2 名前から予想される動作と実際の動作 ---------- */
function ExpectationFigure() {
  const rows: { call: string[]; expect: string[]; actual: string[] }[] = [
    { call: ['user.delete'], expect: ['行を DELETE 文で消す', 'コールバックは動かない'], actual: ['行を残して withdrawn_at を入れる', '変更のお知らせのメールも送る'] },
    { call: ['user.update(rank: "gold")'], expect: ['属性を代入して保存し、', 'true か false を返す'], actual: ['保存して、本人に', '「会員情報が変更されました」を送る'] },
    { call: ['user.update!(rank: "gold")'], expect: ['update と同じ保存をし、', '失敗したら例外を投げる'], actual: ['メールを送らない', '（update と動作が違う）'] },
    { call: ['User.where(id: ids)', '  .delete_all'], expect: ['user.delete を', 'まとめて行う'], actual: ['行を DELETE 文で消す', '（論理削除にならない）'] },
    { call: ['DELETE /api/v1/users/:id'], expect: ['成功なら 2xx、', '失敗なら 4xx が返る'], actual: ['未払いでも、存在しない', '会員でも 200 が返る'] },
    { call: ['退会の後の', 'GET /api/v1/users/:id'], expect: ['404 が返る'], actual: ['200 で会員の情報を返す'] },
  ]
  const top = 36
  const rh = 50
  const cx = [14, 250, 500]
  return (
    <Svg
      id="42-2"
      w={760}
      h={top + rows.length * rh + 8}
      label={`呼び出しごとに、名前から予想される動作と実際の動作を並べた表。${rows
        .map((r) => `${r.call.join('')} は、予想では${r.expect.join('')}、実際は${r.actual.join('')}`)
        .join('。')}`}
    >
      <T x={cx[0]} y={16} fs={12} bold>
        呼び出し
      </T>
      <T x={cx[1]} y={16} fs={12} bold>
        名前から予想される動作
      </T>
      <T x={cx[2]} y={16} fs={12} bold tone="danger">
        適用前のコードの実際の動作
      </T>
      <line x1={8} y1={top - 6} x2={752} y2={top - 6} stroke="var(--fig-line)" />
      {rows.map((r, i) => {
        const y = top + i * rh
        const cell = (lines: string[], x: number, opts: { mono?: boolean; tone?: 'danger' }) =>
          lines.map((t, j) => (
            <T key={j} x={x} y={y + rh / 2 + (j - (lines.length - 1) / 2) * 17 - 2} fs={12} mono={opts.mono} tone={opts.tone}>
              {t}
            </T>
          ))
        return (
          <g key={i}>
            <rect x={8} y={y} width={744} height={rh - 4} rx={4} fill={i % 2 === 0 ? 'var(--fig-box)' : 'none'} />
            {cell(r.call, cx[0], { mono: true })}
            {cell(r.expect, cx[1], {})}
            {cell(r.actual, cx[2], { tone: 'danger' })}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 42-3 Ruby と Rails の命名の規約 ---------- */
function NamingFigure() {
  const rows: { label: string[]; a: string[]; b?: string[]; note?: string[] }[] = [
    { label: ['? で終わる', '（Ruby）'], a: ['empty? / exists? / withdrawn?', '真偽値を返し、状態を変えない'], note: ['真偽値の代わりに nil 以外の値を', '返すメソッドもある（Ruby の文書）'] },
    { label: ['! で終わる', '（Ruby のコア）'], a: ['nums.sort', '新しい配列を返す。nums は変わらない'], b: ['nums.sort!', 'nums そのものを書き換える'] },
    { label: ['! で終わる', '（Rails）'], a: ['save / create / update', '失敗したら false を返す'], b: ['save! / create! / update!', '失敗したら例外を投げる'] },
    { label: ['find 系'], a: ['User.find_by(id: 0)', '見つからなければ nil'], b: ['User.find(0) / find_by!', 'RecordNotFound（応答は 404）'] },
    { label: ['delete と', 'destroy'], a: ['user.delete', 'DELETE 文だけ。コールバックなし'], b: ['user.destroy', 'コールバックと dependent を通す'] },
  ]
  const top = 34
  const rh = 64
  return (
    <Svg
      id="42-3"
      w={760}
      h={top + rows.length * rh + 4}
      label={`Ruby と Rails の命名の規約。${rows
        .map((r) => `${r.label.join('')}：${r.a.join('、')}${r.b ? `。対になる ${r.b.join('、')}` : ''}${r.note ? `。${r.note.join('')}` : ''}`)
        .join('。')}`}
    >
      <T x={14} y={14} fs={12} bold>
        規約
      </T>
      <T x={140} y={14} fs={12} bold>
        名前と動作
      </T>
      <T x={460} y={14} fs={12} bold>
        対になる名前と動作
      </T>
      {rows.map((r, i) => {
        const y = top + i * rh
        return (
          <g key={i}>
            {r.label.map((t, j) => (
              <T key={j} x={14} y={y + 26 + (j - (r.label.length - 1) / 2) * 17} fs={12} bold={j === 0} tone={j > 0 ? 'muted' : undefined}>
                {t}
              </T>
            ))}
            <Box x={140} y={y + 2} w={300} h={50} lines={r.a} fs={12} mono={false} subTone="muted" />
            {r.b && (
              <>
                <Arrow x1={442} y1={y + 27} x2={458} y2={y + 27} plain />
                <Box x={460} y={y + 2} w={290} h={50} lines={r.b} fs={12} fill="box2" subTone="muted" />
              </>
            )}
            {r.note && <Box x={460} y={y + 2} w={290} h={50} lines={r.note} fs={11} fill="none" dashed subTone="muted" />}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 42-5 直す前と後の比較 ---------- */
function BeforeAfterFigure() {
  const panels = [
    {
      x: 10,
      title: '適用前',
      methods: ['user.delete', 'user.update', 'user.update!', 'User.where.delete_all'],
      // [メソッドの行, 効果の行, 問題か]
      links: [
        [0, 0, true],
        [0, 1, true],
        [1, 0, false],
        [1, 1, true],
        [2, 0, false],
        [3, 2, true],
      ] as [number, number, boolean][],
      api: ['DELETE → 200（成功も失敗も）', '退会の後の GET → 200'],
      apiDanger: true,
    },
    {
      x: 392,
      title: '適用後',
      methods: ['user.withdraw!', 'user.change_email!', 'user.update / update!', 'user.delete / delete_all'],
      links: [
        [0, 0, false],
        [1, 0, false],
        [1, 1, false],
        [2, 0, false],
        [3, 2, false],
      ] as [number, number, boolean][],
      api: ['DELETE → 204・404・409', '退会の後の GET → 404'],
      apiDanger: false,
    },
  ]
  const my = [52, 112, 172, 232]
  const ey = [62, 142, 232]
  const effects = ['UPDATE users', 'メールを送る', 'DELETE FROM users']
  return (
    <Svg
      id="42-5"
      w={760}
      h={380}
      label="適用前は user.delete が users の UPDATE とメールの送信を行い、user.update も UPDATE とメールの送信を行い、user.update! は UPDATE だけを行い、User.where.delete_all は DELETE を行う。API は成功でも失敗でも 200 を返し、退会の後の GET も 200 を返す。適用後は user.withdraw! が UPDATE だけを行い、user.change_email! が UPDATE と変更前のアドレスへのメールを行い、update と update! は UPDATE だけを行い、delete と delete_all は Active Record のとおり DELETE を行う。API は 204・404・409 を返し、退会の後の GET は 404 を返す"
    >
      {panels.map((p) => (
        <g key={p.title}>
          <T x={p.x} y={16} bold>
            {p.title}
          </T>
          {p.methods.map((m, i) => (
            <Box key={m} x={p.x} y={my[i] - 18} w={170} h={36} lines={m} fs={11} mono accent={p.title === '適用後' && i < 2} />
          ))}
          {effects.map((e, i) => (
            <Box key={e} x={p.x + 228} y={ey[i] - 18} w={130} h={36} lines={e} fs={11} fill="box4" />
          ))}
          {p.links.map(([m, e, bad]) => (
            <g key={`${m}-${e}`}>
              <Arrow x1={p.x + 170} y1={my[m]} x2={p.x + 226} y2={ey[e]} />
              {bad && <circle cx={p.x + 198} cy={(my[m] + ey[e]) / 2} r={4} fill="var(--fig-danger)" />}
            </g>
          ))}
          <Box x={p.x} y={276} w={358} h={52} lines={p.api} fs={12} fill={p.apiDanger ? 'box' : 'box5'} subTone={p.apiDanger ? 'danger' : 'muted'} />
          {p.apiDanger && (
            <T x={p.x} y={262} fs={12} tone="danger">
              API の応答
            </T>
          )}
          {!p.apiDanger && (
            <T x={p.x} y={262} fs={12}>
              API の応答
            </T>
          )}
        </g>
      ))}
      <line x1={378} y1={6} x2={378} y2={340} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <T x={10} y={358} fs={12} tone="danger">
        ● 名前から予想されない処理
      </T>
      <T x={200} y={358} fs={12} tone="muted">
        適用後は、太い枠の2つの操作だけが業務の言葉の名前を持つ
      </T>
    </Svg>
  )
}

/* ---------- 図 42-6 当てはめすぎの判断 ---------- */
function DecisionFigure() {
  return (
    <Svg
      id="42-6"
      w={760}
      h={470}
      label="名前と API を決めるときの判断の流れ。まず、その名前が Ruby・Rails・HTTP の規約にある名前かを考える。規約にある名前で、規約の意味どおりに動くならそのまま使う。規約の意味と違う動作なら、規約の名前を使わず業務の言葉で別の名前を付ける。規約にない操作も業務の言葉で名前を付け、! と ? は規約の意味で使う。次に、対のメソッドや別名を足すかを考え、false を処理する画面のように呼び出し元が両方を必要とするときだけ足す。公開済みの API の慣習が標準と違うときは、同じバージョンの中では慣習に合わせ、新しいバージョンで標準に合わせる"
    >
      <Box x={250} y={10} w={260} h={38} lines="メソッド名・API の応答を決める" fs={12} bold />
      <Arrow x1={380} y1={48} x2={380} y2={74} />
      <Box x={170} y={76} w={420} h={50} lines={['その名前は Ruby・Rails・HTTP の規約にあるか', '（delete・update・find・save・DELETE など）']} fs={12} dashed subTone="muted" />
      <Arrow d="M170,101 L100,101 L100,158" />
      <T x={108} y={90} fs={11} tone="muted">
        ある
      </T>
      <Arrow d="M590,101 L660,101 L660,158" />
      <T x={620} y={90} fs={11} tone="muted">
        ない
      </T>
      <Box x={10} y={160} w={240} h={44} lines={['規約の意味どおりに動くか', '（戻り値・失敗の知らせ方・副作用）']} fs={12} dashed subTone="muted" />
      <Arrow d="M60,204 L60,250" />
      <T x={68} y={228} fs={11} tone="muted">
        動く
      </T>
      <Arrow d="M200,204 L200,250" />
      <T x={208} y={228} fs={11} tone="muted">
        違う
      </T>
      <Box x={10} y={252} w={110} h={44} lines={['そのまま', '規約の名前を使う']} fs={12} fill="box5" subTone="muted" />
      <Box x={130} y={252} w={180} h={60} lines={['規約の名前を使わず、', '業務の言葉で別の名前を', '付ける（withdraw!）']} fs={12} fill="box5" />
      <Box x={530} y={160} w={220} h={60} lines={['業務の言葉で名前を付け、', '! と ? は Rails の規約の', '意味で使う']} fs={12} fill="box5" />

      <Arrow d="M65,296 L65,350 L248,350" />
      <Arrow d="M220,312 L220,340 L248,340" />
      <Arrow d="M640,220 L640,345 L512,345" />
      <Box x={250} y={322} w={260} h={50} lines={['対のメソッドや別名を足すか', '（! なし・? 付きのメソッド、別名）']} fs={12} dashed subTone="muted" />
      <Arrow x1={380} y1={372} x2={380} y2={398} />
      <Box x={170} y={400} w={420} h={56} lines={['呼び出し元が両方を必要とするときだけ足す', '（false を受けて入力の画面を表示し直す、など）']} fs={12} fill="box5" subTone="muted" />

      <Box x={596} y={386} w={160} h={76} lines={['公開済みの API の', '慣習が標準と違う', '→ 同じバージョンでは慣習、', '新しいバージョンで標準']} fs={11} fill="none" dashed subTone="muted" />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 61,
  part: 8,
  title: 'POLA（驚き最小の原則）：メソッド名と API の振る舞いを予想どおりにする',
  summary:
    '会員の退会を例に、Active Record の delete を論理削除に上書きしたモデル、update の中でメールも送るモデル、失敗しても 200 を返す DELETE の API を動かし、名前から予想される動作との食い違いを確かめます。退会を withdraw!、メールアドレスの変更を change_email! に分け、API を 204・404・409 で応答するように直し、規約に合わせすぎた場合の判断も示します。',
  goals: [
    '名前や API から予想される動作と実際の動作が食い違うと、どんな不具合や問い合わせが起きるかを説明できる',
    'POLA の由来（Ruby の驚き最小の原則と Matz の説明、Rails Doctrine）と、「誰の驚きか」という問題を説明できる',
    'Ruby と Rails の命名の規約（? と !、find と find_by、save と save!、delete と destroy）に合わせてメソッド名を決められる',
    'HTTP のメソッドの意味と状態コード（204・404・409・422）に合わせて API の応答を決められる',
    'Active Record のメソッドを上書きしたコードを、呼び出し元を壊さずに直す順序を説明できる',
    '規約に合わせすぎて、使われない対のメソッドや失敗を見落とす呼び出しを増やす場合を見分けられる',
  ],
  prerequisites: [56, 10, 11, 14],
  sections: [
    {
      id: 'scene',
      title: '退会と会員情報の更新で、名前と動作が食い違うコード',
      body: (
        <>
          <p>
            この章では会員制の通販サイトの退会の処理を例に、POLA（驚き最小の原則）を扱います。メソッドや API の名前を見た人は、その名前から動作を予想して呼び出します。予想と実際の動作が違うと、呼び出した人は意図しない処理を実行し、そのことに気づかないまま本番に出します。
          </p>
          <h3>そもそも退会では何をするのか</h3>
          <p>
            会員が「退会する」ボタンを押すと、サイトはその会員をログインできない状態にし、会員の一覧や検索に出さないようにします。ただし、会員の行を DB から消すわけではありません。過去の請求書や注文の記録が会員の ID を参照しているので、行を消すと「誰への請求だったか」がわからなくなるからです。このように、行を消さずに「削除した」ことを列の値で表す方法を<Term en="soft delete">論理削除</Term>と呼びます。この章では、users テーブルの <code>withdrawn_at</code> 列（退会した日時）に日時を入れることを退会とします。これに対して、DELETE 文で行そのものを消すことを<Term en="hard delete">物理削除</Term>と呼びます。
          </p>
          <p>このサイトには、退会について次の決まりがあります。</p>
          <ul>
            <li>未払いの請求がある会員は退会できない。</li>
            <li>モバイルアプリの退会の画面は <code>DELETE /api/v1/users/:id</code> を呼び、結果を画面に表示する。</li>
            <li>管理画面には、問い合わせで頼まれた会員をまとめて退会させる機能がある。</li>
          </ul>
          <p>退会のほかに、毎月1回、購入金額に応じて会員ランク（regular・silver・gold）を付け直すバッチがあります。テーブルは会員の users と、請求の invoices の2つです。</p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_users.rb と 20261121000002_create_invoices.rb"
            code={`
class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.string :rank, null: false, default: "regular" # 会員ランク
      t.datetime :withdrawn_at                           # 退会した日時
      t.timestamps
    end
  end
end

class CreateInvoices < ActiveRecord::Migration[8.1]
  def change
    create_table :invoices do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :amount, null: false
      t.datetime :paid_at # 支払った日時（未払いなら NULL）
      t.timestamps
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/invoice.rb"
            code={`
class Invoice < ApplicationRecord
  belongs_to :user
  scope :unpaid, -> { where(paid_at: nil) }
end
`}
          />
          <h3>適用前のコード</h3>
          <p>
            User モデルには退会のための <code>delete</code> と、会員情報を更新する <code>update</code> を書いています。どちらも Active Record がもともと持っているメソッドを、同じ名前で上書き（オーバーライド）しています。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb（適用前）"
            code={`
class User < ApplicationRecord
  has_many :invoices

  # 退会の処理。行は残し、withdrawn_at に日時を入れる（論理削除）
  def delete
    update(withdrawn_at: Time.current)
  end

  # 会員情報を更新したら、本人に「会員情報が変更されました」のメールを送る
  def update(attributes)
    saved = super
    UserMailer.with(user: self).profile_changed.deliver_later if saved
    saved
  end
end
`}
          />
          <p>
            <code>delete</code> は行を消さずに withdrawn_at に現在の日時を入れます。<code>update</code> は <code>super</code>（Active Record の update）で保存し、保存できたら本人に「会員情報が変更されました」のメールを送ります。メールアドレスを他人に書き換えられたときに本人が気づけるよう、変更のお知らせを送りたかったのが、この上書きを書いた理由です。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/api/v1/users_controller.rb（適用前）と config/routes.rb"
            code={`
class Api::V1::UsersController < ActionController::API
  def show
    user = User.find(params[:id])
    render json: user.slice(:id, :name, :rank)
  end

  # 退会（DELETE /api/v1/users/:id）
  def destroy
    user = User.find_by(id: params[:id])
    if user.nil?
      render json: { ok: false, error: "not_found" }
    elsif user.invoices.unpaid.exists?
      render json: { ok: false, error: "未払いの請求があります" }
    else
      user.delete
      render json: { ok: true }
    end
  end
end

# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: %i[show destroy]
    end
  end
end
`}
          />
          <p>
            退会の API は、会員が見つからないときも、未払いの請求があるときも、<code>render json:</code> だけを呼んでいます。<code>render</code> に <code>status:</code> を渡さなければ、状態コードは 200（OK）になります。成功したかどうかは本文の <code>ok</code> の値でしか区別できません。
          </p>
          <Figure n="42-1" title="退会の処理に関係するクラス・テーブルと、問題が起きる箇所" caption="赤の文字が問題の起きる箇所。実線の矢印は呼び出しを表す。管理画面からの delete_all は User の上書きを通らずに users テーブルへ届く。">
            <SceneFigure />
          </Figure>
          <p>
            図 42-1 は、この場面の呼び出しの関係です。モバイルアプリ・月次のバッチ・管理画面の3つが User を使いますが、それぞれを書いた人は Rails の delete と update の動作を前提にしています。User の上書きを知っているのは、User を書いた人だけです。
          </p>
          <h3>動かして確かめる</h3>
          <p>
            script/scene.rb で会員を4人作り、鈴木さんに未払いの請求を1件付けてから、4つの操作を順に実行しました。メールは Active Job のテスト用のアダプターでその場で送信まで行い、送ったメールの宛先と件名を表示しています。API は、Rails の結合テストが使うセッション（<code>ActionDispatch::Integration::Session</code>）から呼びました。
          </p>
          <Code
            lang="ruby"
            title="script/scene.rb（抜粋）"
            code={`
puts "== 1. 会員ランクを付け直すバッチ（update を使う）"
User.find_each { |u| u.update(rank: "gold") }

puts "== 1'. 同じバッチを update! で書いた場合"
User.find_each { |u| u.update!(rank: "silver") }

puts "== 2. 佐藤さんの退会（user.delete）"
sato.delete

puts "== 3. 管理画面の「まとめて退会」（User.where(...).delete_all）"
ids = User.where(name: %w[高橋 田中]).ids
User.where(id: ids).delete_all

puts "== 4. 退会の API（DELETE /api/v1/users/:id）"
api = ActionDispatch::Integration::Session.new(Rails.application)
api.delete "/api/v1/users/#{suzuki.id}"
# …（省略。結果の表示）
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
== 1. 会員ランクを付け直すバッチ（update を使う）
送られたメール: 4通
  sato@example.com「会員情報が変更されました」
  suzuki@example.com「会員情報が変更されました」
  takahashi@example.com「会員情報が変更されました」
  tanaka@example.com「会員情報が変更されました」
== 1'. 同じバッチを update! で書いた場合
送られたメール: 0通
== 2. 佐藤さんの退会（user.delete）
User.exists?(1) => true / withdrawn_at => true
送られたメール: sato@example.com「会員情報が変更されました」
== 3. 管理画面の「まとめて退会」（User.where(...).delete_all）
User.where(id: [3, 4]).delete_all => 2
User.exists?(3) => false / 残った会員: ["佐藤", "鈴木"]
== 4. 退会の API（DELETE /api/v1/users/:id）
未払いがある鈴木さん: DELETE → 200 {"ok":false,"error":"未払いの請求があります"}（successful? => true）
存在しない ID: DELETE → 200 {"ok":false,"error":"not_found"}（successful? => true）
鈴木さんの withdrawn_at => nil
伊藤さん: DELETE → 200 {"ok":true}（successful? => true）
伊藤さん: GET    → 200 {"id":5,"name":"伊藤","rank":"regular"}
`}
          />
          <p>
            1では会員ランクを付け直しただけで、4人全員に「会員情報が変更されました」のメールが届きました。バッチを書いた人は update を「属性を保存するメソッド」と読んでいたので、メールが送られるとは予想していません。会員から見ると、自分では何も変えていないのに変更のお知らせが届くので、不正なログインを疑ってサポートに問い合わせることになります。
          </p>
          <p>
            1' では、同じバッチを <code>update!</code> で書くと、メールは送られませんでした。Active Record の update! は update を呼ばず、自分で <code>assign_attributes</code> と <code>save!</code> を呼ぶからです。<Ref n={7} />
            次のコードは Rails 8.1.4.1 のソースの該当する部分です。
          </p>
          <Code
            lang="ruby"
            title="activerecord-8.1.4.1/lib/active_record/persistence.rb（抜粋）"
            href={`${GH}/activerecord/lib/active_record/persistence.rb#L562-L581`}
            code={`
def update(attributes)
  with_transaction_returning_status do
    assign_attributes(attributes)
    save
  end
end

def update!(attributes)
  with_transaction_returning_status do
    assign_attributes(attributes)
    save!
  end
end
`}
          />
          <p>
            update を上書きしても update! の動作は変わりません。その結果、末尾の ! の有無でメールを送るかどうかが変わるという、名前からは読み取れない違いが生まれました。
          </p>
          <p>
            2では、佐藤さんの行は残り、withdrawn_at に日時が入りました。上書きした delete は中で update を呼んでいるので、退会した佐藤さんにも「会員情報が変更されました」のメールが届いています。
          </p>
          <p>
            3では、管理画面の「まとめて退会」を書いた人が、user.delete をまとめて行うつもりで <code>User.where(id: ids).delete_all</code> と書きました。モデルで上書きしたのはインスタンスの delete だけで、リレーションの <code>delete_all</code> は Active Record のままです。そのため2人の行は DELETE 文で消え、退会の記録も残りませんでした。請求のある会員なら外部キー制約で DELETE 文がエラーになりますが、請求のない会員の行は消え、元に戻せません。
          </p>
          <p>
            4では、未払いの請求がある場合も、存在しない ID の場合も、応答は 200 でした。<code>successful?</code> は応答のオブジェクトのメソッドで、状態コードが 200 番台なら true を返します。モバイルアプリが状態コードで成功を判断していると、3つの場合のすべてで「退会しました」と表示します。さらに、退会に成功した伊藤さんを GET すると、200 で会員の情報が返りました。DELETE が成功した後も同じ URL から会員を取得できるので、アプリが画面を読み込み直すと、退会した会員がまた表示されます。
          </p>
          <Figure n="42-2" title="名前から予想される動作と、適用前のコードの実際の動作" caption="右の列（赤）が、予想と食い違った動作。どの行も、コードそのものは書いたとおりに動いている。">
            <ExpectationFigure />
          </Figure>
          <p>
            図 42-2 は、6つの呼び出しについて、名前から予想される動作と実際の動作を並べたものです。中央の列の予想は Rails のドキュメントと HTTP の仕様に書かれている動作です。どの呼び出しも例外を出さずに終わっているので、テストやログからは食い違いに気づけません。
          </p>
          <h3>このコードの問題</h3>
          <ul>
            <li>Active Record の delete と update は、Rails を使う開発者の多くが動作を知っているメソッドです。同じ名前で別の動作に上書きすると、上書きを知らない人が書いたコードは予想と違う動作をします。</li>
            <li>上書きしたのはインスタンスの delete と update だけで、update!・delete_all のような関係するメソッドは Active Record のままです。似た名前のメソッドの間で動作がそろっていません。</li>
            <li>呼び出し側のコード（<code>u.update(rank: "gold")</code>）を読んでも、メールが送られることはわかりません。</li>
            <li>API は成功と失敗を同じ 200 で返しています。成功したかどうかを知るには本文の ok を読む必要があり、状態コードで判断するクライアントや監視の仕組みは失敗を数えられません。</li>
            <li>退会した後も、同じ URL の GET で会員を取得できます。</li>
          </ul>
          <p>どの問題も名前から予想される動作と実際の動作のずれから起きています。次の節で、このずれを避けるための原則 POLA を説明します。</p>
        </>
      ),
    },
    {
      id: 'meaning',
      title: 'POLA の意味と、Ruby の驚き最小の原則',
      body: (
        <>
          <h3>定義</h3>
          <p>
            POLA は<Term en="Principle of Least Astonishment">驚き最小の原則</Term>の略です。この部では次の定義で扱います。
          </p>
          <ul>
            <li>利用者や開発者の予想を裏切らない設計にする。</li>
            <li>命名や API の振る舞いに一貫性を持たせる。</li>
          </ul>
          <p>
            ここでの利用者は、画面を操作する会員だけではありません。メソッドを呼ぶ開発者、API を呼ぶモバイルアプリの開発者、状態コードを数える監視の仕組みも、名前や応答から動作を予想して使います。予想を裏切らないとは、名前・引数・戻り値・副作用・失敗したときの知らせ方が、使う人の知っている規約と一致していることです。一貫性を持たせるとは、同じ名前には同じ種類の動作をさせ、似た操作には同じ形で失敗を知らせることです。
          </p>
          <h3>由来：Ruby の驚き最小の原則と Matz の説明</h3>
          <p>
            Ruby のコミュニティでは、この考え方は Principle of Least Surprise（PoLS）と呼ばれ、Ruby の設計を説明する言葉として広まりました。ただし、Ruby の作者のまつもとゆきひろ（Matz）は、2003年9月に Bill Venners が行ったインタビュー「The Philosophy of Ruby」で、Ruby が驚き最小の原則に従っていると自分から言ったことはなく、Ruby を使った人たちが言い始めたと答えています。<Ref n={1} />
          </p>
          <p>
            同じインタビューで Matz は、人によって経歴が違い、Python から来た人と Perl から来た人では驚く点が違うと述べています。そのうえで、この原則は「Matz 自身の驚きが最小」という意味であり、「Ruby をよく学んだ後の驚きが最小」という意味だと説明しています。<Ref n={1} />
          </p>
          <p>
            Rails の設計思想をまとめた The Rails Doctrine も、「Optimize for programmer happiness」の柱でこの原則に触れています。DHH は、Ruby の対話型の環境が exit と quit のどちらでも終了することを驚き最小の例に挙げています。そのうえで、この原則は主観的なもので、「誰にとって驚きが最小なのか」という問いが残るので、Ruby のコミュニティでは使われなくなったと書いています。Rails は代わりに、DHH 自身がより大きく笑顔になる API を選ぶ「Principle of The Bigger Smile」で設計してきたと述べています。<Ref n={2} />
          </p>
          <p>
            2つの資料からわかるのは、「驚き」は読む人の経験によって変わるということです。そこでこの部では、POLA を「その名前や API を使う人が共有している規約から予想される動作に合わせる」と具体的に読み替えて使います。POLA を当てはめるときは、まず、使う人が共有している規約が何かを決めます。
          </p>
          <h3>予想を作る4つの規約</h3>
          <p>Rails のアプリで、読み手の予想を作る規約は主に次の4つです。</p>
          <ul>
            <li>Ruby の規約：? と ! の付け方、コアクラスのメソッドの名前</li>
            <li>Rails の規約：Active Record のメソッドの名前と動作、<code>resources</code> とアクションの対応、例外と状態コードの対応</li>
            <li>HTTP の規約：メソッドの意味（安全・冪等）と状態コード</li>
            <li>アプリとチームの規約：業務の言葉、既存のコードの書き方、公開済みの API の形</li>
          </ul>
          <p>
            Ruby の公式ドキュメントは、? で終わるメソッドは慣習として真偽値を返し、! で終わるメソッドは「危険」とみなされると説明しています。Ruby のコアライブラリでは、! は「! なしのメソッドと違ってレシーバーを書き換える」ことを表しますが、ほかのライブラリでもそうなるとは限らないとも書いています。<Ref n={3} />
            Rails は <code>save!</code> や <code>create!</code> のように「失敗したら例外を投げる」メソッドの名前に ! を付けています。図 42-3 は、この章で扱う命名の規約をまとめたものです。
          </p>
          <Figure n="42-3" title="Ruby と Rails の命名の規約" caption="2行目以降の左右の箱は、名前が対になるメソッド。1行目の右の点線の枠は補足。! の意味は Ruby のコアクラスと Rails で違う。">
            <NamingFigure />
          </Figure>
          <p>
            図 42-3 の各行は、名前の一部が動作の約束になっている例です。Rails の開発者は <code>find</code> を見れば「見つからなければ例外が出て、コントローラーなら 404 になる」と予想し、<code>delete</code> を見れば「コールバックを通らずに行が消える」と予想します。適用前の User はこの予想のうち delete と update の行を書き換えていました。
          </p>
          <h3>似た原則との違い</h3>
          <p>
            <Term en="Command Query Separation">コマンド・クエリ分離</Term>（CQS）は、Bertrand Meyer が著書『Object-Oriented Software Construction』で名付けた原則です。Martin Fowler は2005年の記事で、メソッドを「値を返し、観察できる状態を変えない問い合わせ（query）」と「状態を変え、値を返さない命令（command）」にはっきり分ける考え方として紹介しています。状態を変えるメソッドと変えないメソッドを分けておけば、問い合わせのメソッドはどこで何回呼んでも安心して使えるという理由です。<Ref n={4} />
            ? で終わるメソッドが状態を変えないことは、CQS の問い合わせに当たります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">原則</th>
                  <th scope="col">何をそろえるか</th>
                  <th scope="col">この章の例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">POLA</th>
                  <td>名前・戻り値・副作用・状態コードと、使う人の予想</td>
                  <td>delete が論理削除になる。DELETE が失敗しても 200 を返す</td>
                </tr>
                <tr>
                  <th scope="row">
                    Explicit over Implicit（<ChapterLink n={62} />）
                  </th>
                  <td>呼び出し側のコードから、実行される処理が読めること</td>
                  <td>update の呼び出しからは、メールの送信が読めない</td>
                </tr>
                <tr>
                  <th scope="row">CQS</th>
                  <td>状態を変える命令と、変えない問い合わせを分けること</td>
                  <td>withdrawn? は状態を変えず、withdraw! は値ではなく状態の変化を目的にする</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            update の中でメールを送る適用前のコードは、POLA と Explicit over Implicit の両方に反しています。POLA から見ると、update という名前から予想される動作より多くのことをするのが問題です。Explicit over Implicit から見ると、呼び出し側のコードを読んでもメールの送信がわからないのが問題です。名前を上書きしなくても、コールバックや default_scope を使うと、呼び出し側から処理が見えなくなります。この仕組みは<ChapterLink n={62} section="scene">次の章</ChapterLink>で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'apply',
      title: '名前を分け、HTTP の意味どおりに応答する',
      body: (
        <>
          <h3>直す順序</h3>
          <p>適用前のコードは本番で動いていて、上書きした delete と update を呼ぶコードがアプリのあちこちにあります。呼び出し元を壊さないように、次の順に直します。</p>
          <ol>
            <li>上書きしたメソッドの呼び出し元を探す。<code>grep -rn "\.delete\b" app lib</code> と <code>grep -rn "\.update(" app lib</code> の結果を、退会のつもりの呼び出しと、ほかの目的の呼び出しに分ける。</li>
            <li>退会のための <code>withdraw!</code> を用意し、退会のつもりの呼び出し元を書き換える。移行の間は、上書きした delete を「例外を投げる」定義に替え、直し漏れをテストで見つける。</li>
            <li>update の上書きを消し、お知らせのメールが必要な操作（メールアドレスの変更）を <code>change_email!</code> として用意する。</li>
            <li>API の応答を HTTP の意味どおりにする。モバイルアプリの判断も変わるので、アプリを公開する時期と合わせる。</li>
            <li>上書きした delete を消し、Active Record の delete に戻す。</li>
          </ol>
          <p>
            2で delete の上書きをすぐに消すと、直し漏れた <code>user.delete</code> は物理削除に変わります。退会のつもりの呼び出しが会員の行を消してしまうので、移行の間は次の delete を置きます。
          </p>
          <Code
            lang="ruby"
            title="app/models/user.rb（移行の間だけ置く delete。検証では script/transition.rb でクラスを開き直して足した）"
            code={`
class User
  # 移行の間だけ置く。呼び出し元を withdraw! に直し終えたら、このメソッドを消す
  def delete
    raise NotImplementedError, "User#delete は退会ではありません。退会には withdraw! を使ってください"
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/transition.rb。直し漏れた user.delete を呼んだ）"
            code={`
NotImplementedError: User#delete は退会ではありません。退会には withdraw! を使ってください
User.exists?(50) => true
`}
          />
          <p>
            直し漏れた呼び出しは例外になり、行は消えませんでした。例外を投げる delete も、Rails の delete とは違う動作です。直し漏れを見つけるための一時的なコードとして置き、呼び出し元をすべて直したら5で消します。
          </p>
          <h3>退会を withdraw! に分ける</h3>
          <Code
            lang="ruby"
            title="app/models/user.rb（適用後）"
            code={`
class User < ApplicationRecord
  class WithdrawalNotAllowed < StandardError; end

  has_many :invoices

  validates :name, :email, presence: true

  scope :active, -> { where(withdrawn_at: nil) }

  # 退会する。行は残し、withdrawn_at に日時を入れる。退会できないときは例外を投げる
  def withdraw!
    raise WithdrawalNotAllowed, "未払いの請求があります" if invoices.unpaid.exists?

    update!(withdrawn_at: Time.current)
  end

  def withdrawn?
    withdrawn_at.present?
  end

  # メールアドレスを変える。変更前のアドレスに、変更したことを知らせる
  def change_email!(new_email)
    old_email = email
    update!(email: new_email)
    UserMailer.with(user: self, old_email:).email_changed.deliver_later
  end
end
`}
          />
          <p>
            退会のメソッドは業務の言葉から <code>withdraw!</code>（退会する）と名付けました。Active Record のどのメソッドとも名前が重ならないので、読む人は Rails の知識から動作を推測せず、定義を読みに行きます。末尾の ! は、Rails の規約に合わせて「失敗したら例外を投げる」ことを表します。未払いの請求があれば <code>User::WithdrawalNotAllowed</code> を投げ、保存の失敗は update! が <code>ActiveRecord::RecordInvalid</code> で知らせます。
          </p>
          <p>
            <code>withdrawn?</code> は ? の規約どおりに真偽値を返し、状態を変えません。<code>withdrawn_at.present?</code> と書いて、日時ではなく true か false を返すようにしました。
          </p>
          <p>
            退会していない会員を取り出す条件は <code>scope :active</code> にまとめました。会員を探すコードは <code>User.active.find(id)</code> と書き、退会した会員を含めるかどうかを呼び出し側が選びます。User を常に退会していない会員に絞る default_scope を使わない理由は、<ChapterLink n={62} section="scene">次の章</ChapterLink>で扱います。
          </p>
          <p>
            delete と delete_all は上書きせず、Active Record のとおりの物理削除にしました。保存期間を過ぎた退会者の個人情報を消すときのように、物理削除が必要な場面もあるからです。どちらを使うかは名前を見て選べます。
          </p>
          <h3>update の上書きを消し、メールを送る操作に名前を付ける</h3>
          <p>
            update の上書きは消しました。update は Active Record のとおり、属性を代入して保存するだけです。お知らせが必要だったのは、メールアドレスが変わったときです。そこで、メールアドレスを変える操作を <code>change_email!</code> とし、その中で変更前のアドレスにお知らせを送ります。変更前のアドレスに送るのは、他人がアドレスを書き換えた場合に、本人が受け取れるアドレスに知らせるためです。
          </p>
          <Code
            lang="ruby"
            title="app/mailers/user_mailer.rb（適用後）"
            code={`
class UserMailer < ApplicationMailer
  def email_changed
    @user = params[:user]
    mail to: params[:old_email], subject: "メールアドレスが変更されました"
  end
end
`}
          />
          <p>
            change_email! という名前から、何を変える操作か、失敗したら例外を投げるかが読めます。お知らせのメールを送ることは名前に含めていません。メールアドレスの変更を本人に知らせるのは業務の決まりなので、メソッドの説明のコメントとテストに書きます。名前に「お知らせも送る」まで入れるかどうかの目安は、overuse の節で扱います。
          </p>
          <h3>API を HTTP の意味どおりに応答する</h3>
          <Code
            lang="ruby"
            title="app/controllers/api/v1/users_controller.rb（適用後）"
            code={`
class Api::V1::UsersController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "会員が見つかりません" }, status: :not_found
  end

  rescue_from User::WithdrawalNotAllowed do |e|
    render json: { error: e.message }, status: :conflict
  end

  def show
    user = User.active.find(params[:id])
    render json: user.slice(:id, :name, :rank)
  end

  # 退会（DELETE /api/v1/users/:id）
  def destroy
    User.active.find(params[:id]).withdraw!
    head :no_content
  end
end
`}
          />
          <p>
            退会できたら <code>head :no_content</code> で 204 を返します。RFC 9110 は、DELETE が成功したときの応答として、処理を受け付けただけで終わっていなければ 202、処理が終わって返す情報がなければ 204、処理が終わって状態を表す本文を返すなら 200 を送るべきだとしています。<Ref n={5} />
            200 そのものが誤りなのではありません。問題は失敗したときにも 200 を返していたことです。
          </p>
          <p>
            会員が見つからないときと退会済みのときは、<code>User.active.find</code> が <code>ActiveRecord::RecordNotFound</code> を投げ、<code>rescue_from</code> で 404 を返します。未払いの請求があるときは 409 Conflict を返します。RFC 9110 は 409 を、対象のリソースの今の状態と衝突するので要求を完了できないときの状態コードとし、利用者が衝突を解消して要求を送り直せる場面で使うとしています。<Ref n={5} />
            請求を支払えば退会できるので、この場面に当たります。422（Unprocessable Content）は、要求の本文の形式は正しいが内容を処理できないときの状態コードで、フォームの入力の検証に失敗したときなどに使います。<Ref n={5} />
          </p>
          <p>
            RFC 9110 は、DELETE の対象が実際に破棄されるかどうかは、サーバーの実装によって決まるとしています。<Ref n={5} />
            論理削除で行を残すことは、HTTP の DELETE の意味に反しません。ただし DELETE は、対象のリソースと URL の結び付きを外すことを求める要求です。成功した後の GET は 404 を返すのが、予想どおりの動作です。そこで show でも <code>User.active.find</code> を使い、退会した会員を返さないようにしました。
          </p>
          <Figure n="42-4" title="HTTP のメソッドと、予想される振る舞い" caption="RFC 9110 と RFC 5789 の定義をもとにまとめた。Rails のアクションは resources が対応させる名前。">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">メソッド</th>
                    <th scope="col">Rails のアクション</th>
                    <th scope="col">安全</th>
                    <th scope="col">冪等</th>
                    <th scope="col">成功したときの主な応答</th>
                    <th scope="col">失敗したときの例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">GET</th>
                    <td>index・show</td>
                    <td>○</td>
                    <td>○</td>
                    <td>200 と表現</td>
                    <td>404（ない・退会済み）</td>
                  </tr>
                  <tr>
                    <th scope="row">POST</th>
                    <td>create</td>
                    <td>−</td>
                    <td>−</td>
                    <td>201 と Location ヘッダー</td>
                    <td>422（入力の検証に失敗）</td>
                  </tr>
                  <tr>
                    <th scope="row">PUT</th>
                    <td>update</td>
                    <td>−</td>
                    <td>○</td>
                    <td>200 または 204</td>
                    <td>422、409（今の状態と衝突）</td>
                  </tr>
                  <tr>
                    <th scope="row">PATCH</th>
                    <td>update</td>
                    <td>−</td>
                    <td>−</td>
                    <td>200 または 204</td>
                    <td>422、409</td>
                  </tr>
                  <tr>
                    <th scope="row">DELETE</th>
                    <td>destroy</td>
                    <td>−</td>
                    <td>○</td>
                    <td>204、本文付きなら 200、受け付けただけなら 202</td>
                    <td>404、409（未払いがある）</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Figure>
          <p>
            図 42-4 の「安全」は、クライアントがサーバーの状態の変更を求めず、予想もしないことを表します。「冪等」は、同じ要求を何回送っても、サーバーへの意図した効果が1回送ったときと同じであることを表します。<Ref n={5} />
            PATCH は RFC 5789 で、安全でも冪等でもないとされています。<Ref n={6} />
            DELETE は冪等なので、2回目の DELETE で 404 が返っても、会員が退会済みというサーバーの状態は1回目の後と変わりません。冪等性は <ChapterLink n={83} section="meaning" /> で詳しく扱います。
          </p>
          <h3>実行結果</h3>
          <p>適用前と同じ会員と請求を作り、script/after.rb で同じ操作を実行しました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/after.rb）"
            code={`
== 1. 会員ランクを付け直すバッチ（update）
送られたメール: 0通
== 2. 佐藤さんがメールアドレスを変える（change_email!）
送られたメール: sato@example.com「メールアドレスが変更されました」
== 3. 退会（withdraw!）
佐藤さん: withdrawn? => true / User.exists? => true / User.active.exists? => false
鈴木さん: User::WithdrawalNotAllowed (未払いの請求があります) / withdrawn? => false
送られたメール: 0通
== 4. 管理画面の「まとめて退会」
User.where(id: [8, 9]).find_each(&:withdraw!) → 退会済み: [true, true] / 行の数: 2
== 5. 退会の API
未払いがある鈴木さん: DELETE → 409 {"error":"未払いの請求があります"}
存在しない ID: DELETE → 404 {"error":"会員が見つかりません"}
伊藤さん: DELETE → 204 （本文なし）
伊藤さん: GET    → 404 {"error":"会員が見つかりません"}
伊藤さん（2回目）: DELETE → 404 {"error":"会員が見つかりません"}
`}
          />
          <p>
            1では、会員ランクを付け直してもメールは送られません。2では、メールアドレスを変えたときだけ、変更前のアドレス（sato@example.com）にお知らせが届きました。3では、佐藤さんの行は残り、<code>User.active</code> からは外れています。鈴木さんは未払いの請求があるので例外になり、退会済みになりませんでした。退会ではメールを送りません。
          </p>
          <p>
            4の「まとめて退会」は、<code>User.where(id: ids).find_each(&amp;:withdraw!)</code> で1人ずつ withdraw! を呼ぶように直しました。2人とも行が残ったまま退会済みになっています。5の API は、未払いなら 409、存在しなければ 404、成功なら 204 を返し、退会の後の GET と2回目の DELETE は 404 になりました。
          </p>
          <p>この動作を RSpec で固定しました。</p>
          <Code
            lang="ruby"
            title="spec/requests/users_api_spec.rb"
            code={`
require "rails_helper"

RSpec.describe "退会の API", type: :request do
  let!(:user) { User.create!(name: "伊藤", email: "ito@example.com") }

  it "退会できたら 204 を返し、その後の GET は 404 になる" do
    delete "/api/v1/users/#{user.id}"
    expect(response).to have_http_status(:no_content)
    expect(user.reload).to be_withdrawn

    get "/api/v1/users/#{user.id}"
    expect(response).to have_http_status(:not_found)
  end

  it "未払いの請求があれば 409 と理由を返し、退会させない" do
    user.invoices.create!(amount: 3300)
    delete "/api/v1/users/#{user.id}"
    expect(response).to have_http_status(:conflict)
    expect(response.parsed_body).to eq("error" => "未払いの請求があります")
    expect(user.reload).not_to be_withdrawn
  end

  it "存在しない会員と退会済みの会員には 404 を返す" do
    delete "/api/v1/users/0"
    expect(response).to have_http_status(:not_found)

    user.withdraw!
    delete "/api/v1/users/#{user.id}"
    expect(response).to have_http_status(:not_found)
  end
end
`}
          />
          <Code
            lang="ruby"
            title="spec/models/user_spec.rb（抜粋）"
            code={`
RSpec.describe User do
  include ActiveJob::TestHelper

  let(:user) { User.create!(name: "佐藤", email: "sato@example.com") }

  describe "#update" do
    it "Active Record の update のとおり、保存するだけでメールを送らない" do
      expect { user.update(rank: "gold") }.not_to have_enqueued_mail
    end
  end

  describe "#change_email!" do
    it "変更前のアドレスに、変更のお知らせを送る" do
      expect { user.change_email!("sato.new@example.com") }
        .to have_enqueued_mail(UserMailer, :email_changed)
        .with(params: { user:, old_email: "sato@example.com" }, args: [])
      expect(user.reload.email).to eq "sato.new@example.com"
    end
  end
  # …（省略。withdraw! の3つの例）
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation）"
            code={`
環境
  MySQL 8.4 につながる

User
  #withdraw!
    行を残したまま退会済みにする
    未払いの請求があれば例外を投げ、退会済みにしない
    メールを送らない
  #update
    Active Record の update のとおり、保存するだけでメールを送らない
  #change_email!
    変更前のアドレスに、変更のお知らせを送る

退会の API
  退会できたら 204 を返し、その後の GET は 404 になる
  未払いの請求があれば 409 と理由を返し、退会させない
  存在しない会員と退会済みの会員には 404 を返す

Finished in 0.14689 seconds (files took 0.88387 seconds to load)
9 examples, 0 failures
`}
          />
          <Figure n="42-5" title="直す前と後で、呼び出しが実行する処理" caption="左右とも、左の列が呼び出し、右の列が DB とメールへの処理。赤い点の付いた矢印は、名前から予想されない処理を表す。">
            <BeforeAfterFigure />
          </Figure>
          <p>
            図 42-5 は、呼び出しごとに実行される処理を、直す前と後で比べたものです。適用前は、delete と update の2つの名前からメールの送信が起き、delete_all だけが物理削除をしていました。適用後は、Rails の名前（update・delete）は Rails のとおりに動き、業務の操作（withdraw!・change_email!）は業務の言葉の名前を持ちます。メールを送るのは change_email! だけです。
          </p>
          <h3>状態コードを変えるときは、API の利用者と時期を合わせる</h3>
          <p>
            応答を 200 から 409・404・204 に変えると、本文の ok を読んで判断していた古いモバイルアプリは、409 の本文に ok がないので判断を誤ります。利用者の端末に古いバージョンのアプリが残っている間は、<code>/api/v2</code> のように API のバージョンを分けるか、古いバージョンの応答を残す期間を決めてから切り替えます。公開済みの API を利用者を壊さずに変える手順は <ChapterLink n={92} /> で扱います。
          </p>
          <Callout kind="note" title="422 を表す記号の名前">
            <p>
              Rails 7.x のアプリでは、検証の失敗に <code>status: :unprocessable_entity</code> と書いていることがよくあります。Rack 3.1 以降では 422 の名前が Unprocessable Content に変わり、検証に使った Rack 3.2.8 では <code>:unprocessable_entity</code> を渡すと「非推奨なので :unprocessable_content を使ってください」という警告が出ました（値は 422 のまま）。<Ref n={16} />
              Rails 8.1.4.1 は、<code>ActionDispatch::Constants::UNPROCESSABLE_CONTENT</code> に、Rack のバージョンが 3.1 より前なら <code>:unprocessable_entity</code>、3.1 以降なら <code>:unprocessable_content</code> を入れ、scaffold の生成するコードもこの定数を使います。<Ref n={15} />
              Rack を上げるときは、自分で書いた記号も直します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'overuse',
      title: '規約に合わせすぎたとき',
      body: (
        <>
          <h3>「! 付きには ! なしも用意する」という決まり</h3>
          <p>
            直した後、チームで「Rails の save と save! に合わせて、! 付きの操作には ! なしのメソッドと、できるかどうかを返す ? のメソッドも用意する」という決まりを作ったとします。規約に合わせて名前をそろえれば、読む人が驚かないという考えです。この決まりに従って、User に次のメソッドを足しました。
          </p>
          <Code
            lang="ruby"
            title="script/overuse.rb（User と退会の API を開き直して足したメソッド）"
            code={`
# 「Rails の save と save! のように、! 付きの操作には ! なしと ? も用意する」という決まりで足したメソッド
class User
  def withdraw
    withdraw!
    true
  rescue WithdrawalNotAllowed
    false
  end

  def withdrawable?
    !withdrawn? && !invoices.unpaid.exists?
  end

  def change_email(new_email)
    change_email!(new_email)
    true
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    false
  end
end

# 後から別の人が書き換えた退会の API。! なしのほうが「普通の」名前に見えたので使った
class Api::V1::UsersController
  def destroy
    User.active.find(params[:id]).withdraw
    head :no_content
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/overuse.rb。未払いの請求がある会員で DELETE を呼んだ）"
            code={`
未払いがある鈴木さん: DELETE → 204（本文: なし）
鈴木さんの withdrawn? => false
`}
          />
          <p>
            退会できていないのに、API は 204 を返しました。! なしの withdraw は失敗すると false を返しますが、API を書き換えた人はその戻り値を見ていません。この章の初めに直した「失敗しても成功の応答を返す」問題が、規約に合わせるために足したメソッドから、もう一度起きました。
          </p>
          <p>
            Rails の save が false を返すのは、それを処理する呼び出し元があるからです。フォームの保存に失敗したら、コントローラーは false を受けて、エラーの内容と一緒に入力の画面を表示し直します。退会には、false を受けて何かを表示し直す呼び出し元がありません。呼び出し元のない ! なしのメソッドは失敗を見落とす書き方を用意しただけになりました。
          </p>
          <p>
            足したメソッドは保守の対象も増やします。<code>withdrawable?</code> は「退会済みなら false」を条件に含めていますが、withdraw! は退会済みかどうかを確かめていません。退会できる条件が2か所に分かれて書かれ、足した時点で食い違っています。名前をそろえても、動作がそろうとは限りません。
          </p>
          <h3>起きることをすべて名前に入れる</h3>
          <p>
            change_email! を <code>change_email_and_notify_old_address!</code> のように、起きることをすべて名前に入れる方法もあります。呼び出し側からメールの送信が読めるという利点はあります。一方で、変更の記録（監査ログ）を残す処理を足すたびに名前が長くなり、呼び出し元をすべて書き換えることになります。次の目安で分けます。
          </p>
          <ul>
            <li>操作の目的は、業務の言葉で名前にする（withdraw!・change_email!）。</li>
            <li>その操作で必ず起きる業務の決まり（変更前のアドレスへのお知らせ）は、メソッドの説明のコメントとテストに書く。</li>
            <li>呼び出し元によって起こすかどうかを選ぶ処理は、名前に含めず、引数や別のメソッドにして呼び出し側に書かせる。</li>
          </ul>
          <h3>既存の慣習と HTTP の規約が食い違うとき</h3>
          <p>
            社内の既存の API が、すべて「200 と本文の ok」で成功と失敗を返していたとします。新しい API だけ 409 を返すと、既存の API に慣れたアプリの開発者は驚きます。このように、チームの慣習と HTTP の規約が食い違う場合は、どちらの予想に合わせるかを決める必要があります。
          </p>
          <p>
            公開済みのバージョンの中では既存の慣習に合わせるほうが利用者は驚きません。バージョンの途中で一部の API だけ形を変えると、1つのバージョンの中に2つの形が混ざります。HTTP の規約に合わせるのは、新しいバージョンを作るときにまとめて行い、古いバージョンを残す期間を決めます。社内だけで使い、すべての呼び出し元を同時に直せる API なら、すぐに規約に合わせても構いません。
          </p>
          <Figure n="42-6" title="名前と API の応答を決めるときの判断" caption="点線の枠は判断、色の付いた箱は結論。右下の点線の枠は、公開済みの API で規約と慣習が食い違うときの扱い。">
            <DecisionFigure />
          </Figure>
          <p>
            図 42-6 は、この節の判断をまとめたものです。規約にある名前を使うなら、規約の意味どおりに動かします。違う動作をさせたいなら、規約の名前を上書きせずに、業務の言葉で別の名前を付けます。対のメソッドや別名は、規約をそろえる目的だけでは足さず、両方を必要とする呼び出し元があるときに足します。
          </p>
          <p>
            POLA の当てはめすぎは、「誰の予想か」を決めずに、思いつく規約のすべてに合わせようとすることから起きます。Matz は Perl から「同じことを複数の方法で書ける」という考え方を受け継ぎ、利用者に選ぶ自由を与えたいと述べています。<Ref n={1} />
            言語には経歴の違う多くの利用者がいるので、この考え方には理由があります。一方、アプリの中で同じ操作に複数の名前があると、grep で呼び出し元を探すときに名前の数だけ探すことになります。アプリのコードでは、1つの操作に1つの名前を付けるほうが、読み手の予想はそろいます。
          </p>
        </>
      ),
    },
    {
      id: 'rails',
      title: 'Rails の規約と POLA',
      body: (
        <>
          <h3>Active Record のメソッドの名前は規約になっている</h3>
          <p>
            Rails のメソッドの名前は動作の約束になっています。script/conventions.rb で、図 42-3 の規約を確かめました。<code>user</code> は email を入れずに作った、保存できない会員です。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/conventions.rb）"
            code={`
User.find(0)           => ActiveRecord::RecordNotFound
User.find_by(id: 0)    => nil
User.find_by!(id: 0)   => ActiveRecord::RecordNotFound
user.save              => false
user.save!             => ActiveRecord::RecordInvalid
user.withdrawn?        => false
nums.sort              => [[1, 2, 3], [3, 1, 2]]
nums.sort!             => [[1, 2, 3], [1, 2, 3]]
`}
          />
          <p>
            find は見つからなければ例外を投げ、find_by は nil を返し、find_by! は例外を投げました。Rails のガイドと API ドキュメントにも同じ動作が書かれています。<Ref n={9} /><Ref n={10} />
            save は false、save! は RecordInvalid でした。Ruby のコアクラスの sort! は配列そのものを書き換え、sort は書き換えません（2つ目の要素が、呼んだ後の nums）。
          </p>
          <p>
            delete と destroy の違いは、Active Record のソースのコメントに書かれています。delete は主キーを条件にした DELETE 文で行を消すだけでコールバックを実行せず、before_destroy・after_destroy のコールバックや dependent の指定を通したいなら destroy を使う、という説明です。<Ref n={8} />
            update と update! は、どちらも属性を代入してから、それぞれ save と save! を呼びます。<Ref n={7} />
            適用前の User の上書きは、この約束のうち delete の行と update の行を書き換えていました。
          </p>
          <h3>resources・状態コード・例外の対応</h3>
          <p>
            <code>resources :users</code> は、DELETE /users/:id を destroy アクションに対応させます。Rails のガイドは、resources が index・show・new・edit・create・update・destroy の7つのアクションへのルートをまとめて宣言すると説明しています。<Ref n={11} />
          </p>
          <p>
            <code>ActionController::API</code> を継承したコントローラーは、アクションの中で何も描画しなければ <code>head :no_content</code> を返します。<Ref n={12} />
            Rails 8.1.4.1 の scaffold が作る API のコントローラーの destroy は、<code>destroy!</code> を呼ぶだけで描画をしないので、応答は 204 になります。<Ref n={14} />
            この章の destroy でも <code>head :no_content</code> を省けますが、204 を返すことを読み手に示すために書きました。
          </p>
          <p>
            Active Record は例外の種類と状態コードの対応も登録しています。rescue_from で受けなかった例外は、この対応で状態コードに変わります。
          </p>
          <Code
            lang="ruby"
            title="activerecord-8.1.4.1/lib/active_record/railtie.rb（抜粋）"
            href={`${GH}/activerecord/lib/active_record/railtie.rb#L23-L28`}
            code={`
config.action_dispatch.rescue_responses.merge!(
  "ActiveRecord::RecordNotFound"   => :not_found,
  "ActiveRecord::StaleObjectError" => :conflict,
  "ActiveRecord::RecordInvalid"    => ActionDispatch::Constants::UNPROCESSABLE_CONTENT,
  "ActiveRecord::RecordNotSaved"   => ActionDispatch::Constants::UNPROCESSABLE_CONTENT
)
`}
          />
          <p>
            find が見つからないときは 404、楽観的ロックの衝突は 409、save! の検証の失敗は 422 になります。<Ref n={13} />
            ! の付いたメソッドで失敗を例外として知らせると、Rails のこの対応を通して、HTTP の状態コードも予想どおりになります。この章の withdraw! が投げる WithdrawalNotAllowed はアプリで作った例外なので、対応に含まれていません。そこで rescue_from で 409 に対応させました。例外と rescue_from の仕組みは <ChapterLink n={10} section="exceptions" /> で扱っています。
          </p>
          <h3>Rails Doctrine と規約</h3>
          <p>
            The Rails Doctrine の「Convention over Configuration」の柱は、Person クラスが people テーブルに対応するという規約があれば、同じ規約を <code>has_many :people</code> にも使えると説明し、規約は初心者が理由を知らなくても恩恵を受けられるものだと述べています。<Ref n={2} />
            Rails の開発者が共有している規約は、この章で言う「使う人の予想」そのものです。Rails のアプリでは、Rails の規約に合わせることが、POLA を当てはめる最初の手段になります。
          </p>
          <p>
            一方で、Doctrine は「Provide sharp knives」の柱で、Ruby では既存のクラスとメソッドを書き換えられることを挙げています。String#capitalize を上書きすると、手元のアプリでは動いても、元の動作に依存するほかのコードが壊れるという例です。Doctrine は、こうした機能を禁止するのではなく、規約と教育で正しく使うようにすると述べています。<Ref n={2} />
            適用前の User の delete と update の上書きは、Active Record のメソッドについてこれと同じことをしていました。上書きできることと、上書きしてよいことは別に判断します。
          </p>
          <p>
            Rails Doctrine と原則の対応は <ChapterLink n={56} section="rails-doctrine" /> で、Doctrine の9つの柱は <ChapterLink n={31} section="doctrine" /> で扱っています。
          </p>
          <h3>本書のほかの章との関係</h3>
          <ul>
            <li>
              公開や承認のような業務の操作を <code>publish!(actor:)</code> のような名前のメソッドにする考え方は、<ChapterLink n={14} section="callback-boundaries" /> で扱っています。この章の withdraw! と change_email! も同じ考え方です。
            </li>
            <li>名前を上書きしなくても、コールバックや default_scope で処理が呼び出し側から見えなくなる問題は <ChapterLink n={62} /> で扱います。</li>
            <li>DELETE の冪等性と、再試行で処理が二重にならないようにする方法は <ChapterLink n={83} /> で扱います。</li>
            <li>状態コードや項目名を、利用者を壊さずに変える手順は <ChapterLink n={92} /> で扱います。</li>
            <li>状態の遷移を <code>may_approve?</code> のような ? のメソッドで問い合わせる例は、<ChapterLink n={47} section="idea" /> にあります。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>POLA（驚き最小の原則）は、利用者や開発者の予想を裏切らない設計にし、命名や API の振る舞いに一貫性を持たせる原則です。予想とずれた動作は、例外を出さずに終わるので、テストやログから気づきにくくなります。</li>
            <li>「驚き」は読む人の経験で変わります。Matz は「Ruby をよく学んだ後の、Matz 自身の驚きが最小」という意味だと説明し、Rails Doctrine も「誰にとって驚きが最小か」という問いを挙げています。POLA を当てはめるときは、使う人が共有している規約（Ruby・Rails・HTTP・チーム）を先に決めます。</li>
            <li>Rails のメソッドの名前（delete と destroy、update と update!、find と find_by、? と !）は動作の約束です。同じ名前で別の動作に上書きせず、違う動作には業務の言葉で別の名前を付けます。</li>
            <li>API は HTTP の意味どおりに応答します。DELETE の成功には 204 か本文付きの 200、見つからなければ 404、今の状態と衝突するなら 409 を返し、成功した後の GET は 404 にします。</li>
            <li>本番で使われているメソッドの意味を変えるときは、呼び出し元を探し、新しい名前に移し、直し漏れを例外で見つけてから古い定義を消します。API の状態コードを変えるときは、利用者と時期を合わせます。</li>
            <li>規約に合わせるためだけに対のメソッドや別名を足すと、失敗を見落とす呼び出しや、食い違う条件が増えます。両方を必要とする呼び出し元があるときに足します。</li>
          </ul>
        </>
      ),
    },
  ],
  sources: [
    { title: 'The Philosophy of Ruby: A Conversation with Yukihiro Matsumoto, Part I', publisher: 'Artima / Bill Venners', url: 'https://www.artima.com/articles/the-philosophy-of-ruby', accessed: '2026-11-21', version: '2003年9月29日', note: 'Matz が驚き最小の原則を自分から主張したのではないこと、「Matz 自身の驚きが最小」「Ruby をよく学んだ後の驚きが最小」という意味であること、人の経歴によって驚く点が違うこと。Perl から同じことを複数の方法で書ける考え方を受け継いだこと。' },
    { title: 'The Rails Doctrine', publisher: 'Ruby on Rails / David Heinemeier Hansson', url: 'https://rubyonrails.org/doctrine', accessed: '2026-11-21', note: 'Optimize for programmer happiness の柱で、驚き最小の原則が主観的で「誰にとって」が問題になり使われなくなったこと、Principle of The Bigger Smile。Convention over Configuration の柱の Person と people の例、Provide sharp knives の柱の String#capitalize の上書きの例。' },
    { title: 'Methods（Method Names）', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/syntax/methods_rdoc.html', accessed: '2026-11-21', note: '? で終わるメソッドは慣習として真偽値を返すこと、! で終わるメソッドは危険とみなされ、コアライブラリではレシーバーを書き換える版を表すこと、ほかのライブラリでは成り立つとは限らないこと。' },
    { title: 'CommandQuerySeparation', publisher: 'martinfowler.com / Martin Fowler', url: 'https://martinfowler.com/bliki/CommandQuerySeparation.html', accessed: '2026-11-21', version: '2005年12月5日', note: 'CQS の名付け親が Bertrand Meyer であること、問い合わせと命令の定義、状態を変えるメソッドと変えないメソッドを分ける利点。' },
    { title: 'RFC 9110: HTTP Semantics', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9110.html', accessed: '2026-11-21', version: '2022年6月', note: '9.2.1 安全なメソッド、9.2.2 冪等なメソッド（PUT・DELETE・安全なメソッド）、9.3.5 DELETE（実際に破棄するかは実装による、成功時に 202・204・200 を送るべきこと）、15.5.10 409 Conflict、15.5.21 422 Unprocessable Content。' },
    { title: 'RFC 5789: PATCH Method for HTTP', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5789.html', accessed: '2026-11-21', version: '2010年3月', note: 'PATCH が安全でも冪等でもないこと。' },
    { title: 'activerecord/lib/active_record/persistence.rb（update と update!）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L562-L581`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'update! が update を呼ばず、assign_attributes と save! を呼ぶこと。' },
    { title: 'activerecord/lib/active_record/persistence.rb（delete と destroy）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/persistence.rb#L427-L460`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'delete は主キーで DELETE 文を実行するだけでコールバックを実行しないこと、コールバックと dependent を通すなら destroy を使うこと。' },
    { title: 'activerecord/lib/active_record/relation/finder_methods.rb（find・find_by・find_by!）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/finder_methods.rb#L85-L120`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'find が RecordNotFound を投げ、find_by が nil を返し、find_by! が RecordNotFound を投げること。' },
    { title: 'Active Record Query Interface', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'find が見つからないときに RecordNotFound を投げること、find_by! が find_by と違い例外を投げること。' },
    { title: 'Rails Routing from the Outside In', publisher: 'Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/routing.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'resources が7つのアクションへのルートを宣言し、HTTP のメソッドと URL をアクションに対応させること。' },
    { title: 'actionpack/lib/action_controller/metal/basic_implicit_render.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_controller/metal/basic_implicit_render.rb#L7-L15`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'アクションが何も描画しなければ head :no_content を返すこと。' },
    { title: 'activerecord/lib/active_record/railtie.rb（rescue_responses）', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/railtie.rb#L23-L28`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'RecordNotFound を 404、StaleObjectError を 409、RecordInvalid と RecordNotSaved を 422 に対応させること。' },
    { title: 'railties/lib/rails/generators/rails/scaffold_controller/templates/api_controller.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/scaffold_controller/templates/api_controller.rb.tt#L36-L39`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'API の scaffold の destroy が destroy! を呼ぶだけで描画しないこと。' },
    { title: 'actionpack/lib/action_dispatch/constants.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/constants.rb#L34-L38`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'Rack のバージョンが 3.1 より前なら :unprocessable_entity、3.1 以降なら :unprocessable_content を UNPROCESSABLE_CONTENT に入れること。' },
    { title: 'lib/rack/utils.rb（status_code）', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/lib/rack/utils.rb#L659-L687', accessed: '2026-11-21', version: 'Rack 3.2.8', note: ':unprocessable_entity が非推奨の記号として 422 に変換され、警告が出ること（検証環境でも警告を確かめた）。' },
  ],
}

export default chapter
