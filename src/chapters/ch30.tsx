import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 33-1 注文の取り消しで処理を置く場所 ---------- */
function CancelPlacementFigure() {
  return (
    <Svg
      id="33-1"
      w={760}
      h={350}
      label="購入者の画面の OrdersController、管理画面の Admin::OrdersController、支払期限切れを処理する ExpireOrdersJob の3つの呼び出し元が、どれも同じ Order#cancel! を呼ぶ。Order#cancel! は取り消せる状態かを確かめ、在庫を戻して状態を更新し、同じトランザクションで確定する。保存先の MySQL は status の候補、数量が1以上であること、外部キーをモデルを通らない更新に対しても守る。取り消しメールはコミット後にジョブで送り、送信に失敗しても取り消しは残る"
    >
      <T x={20} y={22} bold fs={12.5}>
        呼び出し元
      </T>
      <T x={300} y={22} bold fs={12.5}>
        業務の規則
      </T>
      <T x={580} y={22} bold fs={12.5}>
        DB が守る条件
      </T>
      <Box x={20} y={40} w={220} h={52} lines={['購入者の画面', 'OrdersController#cancel']} fs={12} subTone="muted" />
      <Box x={20} y={120} w={220} h={52} lines={['管理画面', 'Admin::OrdersController#cancel']} fs={12} subTone="muted" />
      <Box x={20} y={200} w={220} h={52} lines={['支払期限切れの処理', 'ExpireOrdersJob']} fs={12} subTone="muted" />
      <Arrow x1={242} y1={66} x2={298} y2={116} />
      <Arrow x1={242} y1={146} x2={298} y2={146} />
      <Arrow x1={242} y1={226} x2={298} y2={176} />
      <Box
        x={300}
        y={90}
        w={240}
        h={112}
        lines={['Order#cancel!', '取り消せる状態かを確かめる', '在庫を戻し、状態を更新する', '同じトランザクションで確定する']}
        fill="box5"
        accent
        bold
        fs={12.5}
      />
      <Arrow x1={542} y1={146} x2={578} y2={146} />
      <Box x={580} y={90} w={160} h={112} lines={['MySQL', 'status の候補（CHECK）', 'quantity は 1 以上', '外部キー']} fill="box4" bold fs={12} subTone="muted" />
      <Arrow x1={420} y1={204} x2={420} y2={258} />
      <T x={430} y={231} fs={11} tone="muted">
        コミット後に投入
      </T>
      <Box x={300} y={260} w={240} h={48} lines={['取り消しメールのジョブ', '送信に失敗しても取り消しは残る']} fill="box4" fs={12} subTone="muted" />
      <T x={20} y={334} fs={11.5} tone="muted">
        呼び出し元は「どの注文を取り出すか」と応答だけを受け持ち、取り消しの条件は Order#cancel! の1か所に置く
      </T>
    </Svg>
  )
}

/* ---------- 図 33-2 complete! を分ける3つの案 ---------- */
function ThreePlansFigure() {
  type Fill = 'box' | 'box2' | 'box4' | 'box5'
  const col = (x0: number, title: string, top: string[], topFill: Fill, left: string[], right: string[], rightFill: Fill, notes: string[]) => (
    <g>
      <T x={x0 + 120} y={22} anchor="middle" bold fs={12.5}>
        {title}
      </T>
      <Box x={x0 + 30} y={40} w={180} h={50} lines={top} fill={topFill} accent={topFill === 'box5'} fs={12} subTone="muted" />
      <Arrow x1={x0 + 100} y1={92} x2={x0 + 66} y2={138} />
      <Arrow x1={x0 + 140} y1={92} x2={x0 + 174} y2={138} />
      <Box x={x0 + 8} y={140} w={112} h={50} lines={left} fs={11.5} subTone="muted" />
      <Box x={x0 + 122} y={140} w={112} h={50} lines={right} fill={rightFill} fs={11.5} subTone="muted" />
      {notes.map((n, i) => (
        <T key={n} x={x0 + 120} y={222 + i * 20} anchor="middle" fs={11} tone="muted">
          {n}
        </T>
      ))}
    </g>
  )
  return (
    <Svg
      id="33-2"
      w={760}
      h={270}
      label="注文の受付を3つの案で分けた構成。案A は Order#place! が状態を確かめて保存し、小計は OrderItem、割引額は Coupon が計算する。注文と明細の保存で完結する小さな処理に向く。案B は Order に組み込む Concern の Order::Placeable が受付の操作を持ち、価格の計算を Order::Pricing、金額と通貨の組を Money に分ける。呼び出し方を変えずに、DB なしで試せる計算を分けられる。案C は Service Object の Orders::Place が手順を進め、Order は状態の規則を、在庫と決済要求はそれぞれの処理を受け持つ。複数の呼び出し元で同じ手順を使い、外部決済や部分的な失敗がある場合に向く"
    >
      <line x1={255} y1={8} x2={255} y2={262} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <line x1={505} y1={8} x2={505} y2={262} stroke="var(--fig-line)" strokeDasharray="3 4" />
      {col(10, '案A モデルの操作を整える', ['Order#place!', '状態の確認と保存'], 'box5', ['OrderItem', '小計'], ['Coupon', '割引額'], 'box', ['注文と明細の保存で完結する', '小さく安定した注文処理'])}
      {col(260, '案B 関心事と計算を切り出す', ['Order::Placeable', 'Order に組み込む Concern'], 'box2', ['Order::Pricing', '価格の計算'], ['Money', '金額と通貨'], 'box', ['order.place! の呼び方は変えない', 'DB なしで試せる計算を分ける'])}
      {col(510, '案C 業務の手順を独立させる', ['Orders::Place', '手順を進める'], 'box5', ['Order', '状態の規則'], ['在庫・決済要求', '別々に失敗する'], 'box4', ['複数の呼び出し元で同じ手順を使う', '外部決済や部分的な失敗がある'])}
    </Svg>
  )
}

/* ---------- 図 33-3 EC サイトの関連 ---------- */
function AssociationFigure() {
  return (
    <Svg
      id="33-3"
      w={760}
      h={330}
      label="EC サイトの関連。Order は User を参照する。OrderItem は Order の一部として作られ、Product を参照する。Payment と Shipment は Order の一部として作られる。ShipmentItem は Shipment の一部として作られ、発送した OrderItem を参照し、数量を持つ。矢印は外部キーを持つ側から参照先へ向き、元の側が複数、先の側が1つ。実線は親なしでは意味を持たない記録、破線は独立して存在する相手への参照。どの関連も restrict_with_exception で、注文の履歴を削除しない"
    >
      <Box x={20} y={50} w={140} h={50} lines={['User', '利用者']} fs={12.5} subTone="muted" />
      <Box x={220} y={50} w={140} h={50} lines={['Order', 'user_id']} fill="box5" accent fs={12.5} subTone="muted" />
      <Box x={420} y={50} w={150} h={50} lines={['OrderItem', 'order_id・product_id']} fs={12.5} subTone="muted" />
      <Box x={620} y={50} w={120} h={50} lines={['Product', '商品']} fs={12.5} subTone="muted" />
      <Box x={20} y={170} w={140} h={50} lines={['Payment', 'order_id']} fs={12.5} subTone="muted" />
      <Box x={220} y={170} w={140} h={50} lines={['Shipment', 'order_id']} fs={12.5} subTone="muted" />
      <Box x={420} y={165} w={190} h={60} lines={['ShipmentItem', 'shipment_id・order_item_id', 'quantity']} fs={12.5} subTone="muted" />
      <Arrow x1={220} y1={75} x2={162} y2={75} dashed />
      <Arrow x1={420} y1={75} x2={362} y2={75} />
      <Arrow x1={570} y1={75} x2={618} y2={75} dashed />
      <Arrow x1={110} y1={170} x2={240} y2={102} />
      <Arrow x1={290} y1={170} x2={290} y2={102} />
      <Arrow x1={420} y1={195} x2={362} y2={195} />
      <Arrow x1={500} y1={165} x2={500} y2={102} dashed />
      <line x1={20} y1={262} x2={60} y2={262} stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={70} y={262} fs={11.5}>
        親（矢印の先）の一部として一緒に作られ、親なしでは意味を持たない記録
      </T>
      <line x1={20} y1={286} x2={60} y2={286} stroke="var(--fig-line)" strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={70} y={286} fs={11.5}>
        独立して存在する相手への参照
      </T>
      <T x={20} y={312} fs={11} tone="muted">
        矢印は外部キーを持つ側（複数）から参照先（1つ）へ向く。どの関連も dependent: :restrict_with_exception で、注文の履歴を削除しない
      </T>
    </Svg>
  )
}

/* ---------- 図 33-4 User に集める場合と分ける場合 ---------- */
function UserBoundaryFigure() {
  return (
    <Svg
      id="33-4"
      w={760}
      h={300}
      label="左は users テーブルに email、password_digest、会社名と会社での役割、請求先、プロフィール、契約の状態をすべて入れた場合。担当者が辞めて行を無効にすると、会社の契約や請求先の扱いも一緒に変わる。右は役割ごとに分けた場合。User はログインする人、Membership は User と Organization をつなぐ所属で、組織ごとの role を持つ。契約と請求先の Account は Organization に付き、任意の公開情報の Profile は User に付く。担当者が替わっても契約は Organization に残り、管理者かどうかは所属ごとに決まる"
    >
      <rect x={10} y={10} width={300} height={280} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={22} y={30} bold fs={12.5}>
        User に集めた場合
      </T>
      <Box
        x={30}
        y={50}
        w={260}
        h={150}
        lines={['users', 'email・password_digest', 'company_name・company_role', 'billing_address', 'profile_bio', 'contract_status']}
        mono
        fs={12}
        bold
        subTone="muted"
        align="start"
      />
      <T x={30} y={230} fs={11.5} tone="danger">
        担当者が辞めて行を無効にすると、
      </T>
      <T x={30} y={250} fs={11.5} tone="danger">
        会社の契約や請求先の扱いも一緒に変わる
      </T>
      <rect x={330} y={10} width={420} height={280} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={342} y={30} bold fs={12.5}>
        役割ごとに分けた場合
      </T>
      <Box x={350} y={60} w={110} h={46} lines={['User', 'ログインする人']} fs={12} subTone="muted" />
      <Box x={490} y={60} w={120} h={46} lines={['Membership', 'role（組織ごと）']} fill="box5" accent fs={12} subTone="muted" />
      <Box x={630} y={60} w={110} h={46} lines={['Organization', '組織']} fs={12} subTone="muted" />
      <Box x={630} y={160} w={110} h={46} lines={['Account', '契約・請求先']} fs={12} subTone="muted" />
      <Box x={350} y={160} w={110} h={46} lines={['Profile', '任意の公開情報']} dashed fs={12} subTone="muted" />
      <Arrow x1={490} y1={83} x2={462} y2={83} />
      <Arrow x1={610} y1={83} x2={628} y2={83} />
      <Arrow x1={685} y1={160} x2={685} y2={108} />
      <Arrow x1={405} y1={160} x2={405} y2={108} />
      <T x={350} y={240} fs={11.5} tone="acc">
        担当者が替わっても、契約は Organization に残る
      </T>
      <T x={350} y={260} fs={11.5} tone="acc">
        管理者かどうかは所属（Membership）ごとに決まる
      </T>
    </Svg>
  )
}

/* ---------- 図 33-5 注文の状態と許可する遷移 ---------- */
function OrderStateFigure() {
  const states = ['draft', 'pending', 'paid', 'shipped', 'completed']
  const events = ['place!', 'mark_paid!', 'ship!', 'complete!']
  return (
    <Svg
      id="33-5"
      w={760}
      h={290}
      label="注文の状態は draft、pending、paid、shipped、completed の順に進む。draft から pending へは place!、pending から paid へは mark_paid!、paid から shipped へは ship!、shipped から completed へは complete! で進む。draft と pending からは cancel! で cancelled へ進める。paid からは返金の手続き、shipped からは返品の手続きという別の記録で扱い、cancelled には戻さない。enum が決めるのは状態の名前と保存する値だけで、どの遷移を許すかはメソッドで決める"
    >
      {states.map((s, i) => (
        <Box key={s} x={20 + i * 150} y={60} w={100} h={40} lines={s} mono fs={12.5} />
      ))}
      {events.map((e, i) => (
        <g key={e}>
          <Arrow x1={122 + i * 150} y1={80} x2={168 + i * 150} y2={80} />
          <T x={145 + i * 150} y={46} anchor="middle" mono fs={11}>
            {e}
          </T>
        </g>
      ))}
      <Box x={95} y={170} w={110} h={40} lines="cancelled" mono fs={12.5} />
      <Arrow x1={70} y1={102} x2={128} y2={168} />
      <Arrow x1={220} y1={102} x2={172} y2={168} />
      <T x={150} y={134} anchor="middle" mono fs={11}>
        cancel!
      </T>
      <Box x={320} y={170} w={100} h={40} lines="返金の手続き" dashed fs={12} />
      <Box x={470} y={170} w={100} h={40} lines="返品の手続き" dashed fs={12} />
      <Arrow x1={370} y1={102} x2={370} y2={168} dashed />
      <Arrow x1={520} y1={102} x2={520} y2={168} dashed />
      <T x={20} y={246} fs={11.5}>
        enum が決めるのは6つの状態の名前と保存する値だけ。どの矢印を許すかは ship! や cancel! などのメソッドで決める
      </T>
      <T x={20} y={268} fs={11} tone="muted">
        破線は支払後・発送後の取り消しを cancelled に戻さず、返金や返品という別の記録として扱う流れ
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 30,
  part: 7,
  title: '責務分割とモデルの設計',
  summary:
    '処理をコントローラー・モデル・その他のオブジェクトのどこに置くかと、テーブル・関連・状態・コールバックの設計を、EC サイトの注文の例で判断します。',
  goals: [
    '書き換える理由と一緒に確定する範囲から、処理を置く場所を選べる',
    '大きくなったモデルを、モデルに残すものと切り出すものに分けて評価できる',
    'テーブルの分け方・関連・削除の方針を、身元・所有・寿命から決められる',
    '状態の集合と遷移の規則を分け、遷移をロックと履歴つきのメソッドにできる',
    'コールバックに置く処理と、明示的な操作に移す処理を区別できる',
  ],
  prerequisites: [10, 13, 14, 15, 18, 27],
  sections: [
    {
      id: 'design-basics',
      title: '設計で何を決めるのか',
      body: (
        <>
          <p>
            Rails のアプリでは、同じ機能を動かすコードの書き方がたいてい何通りもあります。設計とはその中から、後で仕様が変わったときや処理が途中で失敗したときに困らない書き方を選び、選んだ理由を説明できるようにする作業です。この章では EC サイトの注文を例に、処理をどのクラスに置くか、テーブルに何を保証させるかを決めます。
          </p>
          <p>
            例として、購入者が自分の注文を取り消せる機能を追加します。取り消せるのは支払い前の注文、つまり状態が <code>draft</code>（下書き）か <code>pending</code>（支払い待ち）の注文だけとします。最初の実装として、コントローラーのアクションに全部を書くと次のようになります。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（最初の実装）"
            code={`
class OrdersController < ApplicationController
  def cancel
    order = Order.find(params[:id])
    if order.status == "draft" || order.status == "pending"
      order.update!(status: "cancelled")
      order.items.each { |item| item.product.increment!(:stock, item.quantity) }
      OrderMailer.cancelled(order).deliver_now
      redirect_to order, notice: "注文を取り消しました"
    else
      redirect_to order, alert: "この注文は取り消せません"
    end
  end
end
`}
          />
          <p>
            このアクションは、1つの画面から呼ぶだけなら期待どおりに動きます。問題が出るのは取り消しを行う場所が増えたときです。運営者が管理画面から取り消す機能と、支払期限を過ぎた注文をジョブで取り消す機能を足すと、取り消せる状態の条件と在庫を戻す手順を3か所に書くことになり、1か所だけ直し忘れると、管理画面からは支払済みの注文も取り消せる、といった違いが生まれます。ほかにも次の問題があります。
          </p>
          <ul>
            <li>
              <code>Order.find(params[:id])</code> はほかの利用者の注文も取得でき、誰が取り消してよいかを確かめていません。
            </li>
            <li>状態の更新と在庫を戻す処理が別々に確定するので、途中で例外が起きると、取り消し済みなのに在庫が戻っていない注文が残ります。</li>
            <li>
              <code>deliver_now</code> はメールを送り終えるまで応答を返さず、送信に失敗すると、取り消しは確定したまま画面がエラーになります。
            </li>
            <li>同じ注文の取り消しが2回同時に届くと、両方が条件を通り、在庫が2回戻ることがあります。</li>
          </ul>
          <p>どれも、コードを書く前に決めておくべき事柄です。設計で決めるのは主に次の5つです。</p>
          <ol>
            <li>
              規則をどこに書くか。取り消せる状態の条件は、どの呼び出し元からでも同じように適用したいので、注文のモデルに <code>cancel!</code> として置きます。
            </li>
            <li>誰が実行してよいか。購入者は自分の注文だけ、運営者は担当する店舗の注文だけを扱います。</li>
            <li>一緒に確定する範囲。状態の更新と在庫を戻す処理は、同じトランザクションで確定します。</li>
            <li>DB に何を保証させるか。状態の値の候補や、数量が1以上であることは、モデルを通らない更新に対しても守らせます。</li>
            <li>失敗したときに何が残るか。メールは取り消しの確定後にジョブで送り、送信に失敗しても取り消しは取り消したままにします。</li>
          </ol>
          <p>決めた内容に沿って書き直すと、コントローラーは次の形になります。</p>
          <Code
            lang="ruby"
            title="app/controllers/orders_controller.rb（書き直した後）"
            code={`
class OrdersController < ApplicationController
  def cancel
    order = current_user.orders.find(params[:id])   # 自分の注文の中だけを探す
    order.cancel!(actor: current_user)
    redirect_to order, notice: "注文を取り消しました"
  rescue Order::InvalidTransition
    redirect_to order, alert: "この注文は取り消せません"
  end
end
`}
          />
          <p>
            取り消しの条件の確認、在庫を戻す処理、状態の更新は <code>Order#cancel!</code> に移りました。中身は後の「状態の集合と遷移の規則を分ける」の節で書きます。管理画面とジョブも同じ <code>cancel!</code> を呼べば、条件を変えるときに直すのは1か所です。
          </p>
          <p>
            図 33-1 は書き直した後に各処理をどこに置いたかを示したものです。左の3つの呼び出し元はどれも中央の <code>Order#cancel!</code> を呼び、取り消しの規則はそこに1か所だけあります。右の箱はモデルを通らない更新に対しても DB が守る条件、下の箱はコミットの後に行う処理で、ここで失敗しても取り消し自体は残ります。
          </p>
          <Figure n="33-1" title="注文の取り消しで処理を置く場所" caption="模式図。呼び出し元・業務の規則・DB の制約・コミット後の処理を、受け持つ範囲ごとに並べている。">
            <CancelPlacementFigure />
          </Figure>
          <p>
            1つのクラスが引き受ける仕事と、その仕事のために守る規則を、そのクラスの<Term en="responsibility">責務</Term>と呼びます。責務を分けるときの手がかりは、そのコードを書き換える理由（変更理由）です。HTTP の応答の形は画面の都合で変わり、取り消せる状態の条件は業務の決まりで変わり、メールの文面は運営の都合で変わります。書き換える理由が違うコードを1つのメソッドに混ぜると、1つの変更のために関係のない処理まで読んで確かめることになります。
          </p>
          <p>
            設計がうまくいっているかは、ファイルの数やクラスの種類では判断できません。仕様を1つ変えたときに直す場所の数、呼び出し元を増やしたときに同じ条件が適用されるか、失敗したときにどの記録が残るかを説明できるか、で確かめます。
          </p>
          <p>
            この章と続く3つの章では、こうした判断を順に扱います。この章では処理を置く場所の選び方と、モデルとテーブルの設計（大きくなったモデルの評価、テーブルの分け方、関連、状態、コールバック）を扱います。モデルの外に置く Service Object・Form Object・Query Object・Value Object と設計パターンは <ChapterLink n={33} /> で扱い、<ChapterLink n={34} /> では注文処理を段階的に育てながら、トランザクションと外部の決済サービスとの境界を決めます。<ChapterLink n={31} /> ではこれらの判断の背景にある、Rails の作者 DHH の考え方を原典から読みます。
          </p>
          <p>
            この章のコードは User（利用者）・Order（注文）・OrderItem（注文の明細）・Product（商品）などを持つ EC サイトの例です。モデルの実行結果は Ruby 4.0.9 と Active Record 8.1.4.1 を SQLite のメモリー上のデータベースにつないで確かめたもので、本書の他の章で使う MySQL とは SQL の引用符やロックの SQL（<code>FOR UPDATE</code>）が異なります。コントローラーの例は実行していない抜粋です。
          </p>
          <p>変更する理由ごとにクラスを分ける考え方（単一責任の原則）は <ChapterLink n={63} /> で、関心ごとに処理を分ける考え方（関心の分離）は <ChapterLink n={68} /> で扱います。</p>
        </>
      ),
    },
    {
      id: 'architecture-boundaries',
      title: '処理を置く場所の候補と選び方',
      body: (
        <>
          <p>
            Rails のアプリには、モデルとコントローラーのほかにも処理を置ける場所があります。HTTP の都合（パラメーターと応答）、業務の規則、データの保存、外部システムの都合、表示は、それぞれ書き換える理由が違うので、置き場所を分ける候補になります。一方で、注文とその明細は別のテーブルでも、一緒に検証して一緒に保存するひとまとまりです。テーブルの数、メソッドの行数、呼び出し元の数だけでは、クラスを分けるかどうかは決めません。
          </p>
          <p>
            まずは、モデルのメソッド・関連・スコープ・ヘルパーという Rails に元からある場所で書き、変更が関係のない処理まで波及する、呼び出し元ごとに同じ手順が複製される、外部サービスの障害を注文の保存から切り離せない、といった具体的な問題が出てから新しいクラスを作ります。次の表は置き場所の候補ごとに、任せるもの、任せないもの、導入を考える兆候をまとめたものです。<Ref n={1} />
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">置き場所</th>
                  <th scope="col">任せるもの</th>
                  <th scope="col">任せないもの</th>
                  <th scope="col">導入・利用を考える兆候</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">コントローラー</th>
                  <td>HTTP の入力の許可、認証済みの利用者、認可の適用、処理の呼び出し、応答</td>
                  <td>価格の計算、在庫の規則、外部 API の再試行</td>
                  <td>リクエストを受ける処理では常に使う。普通の CRUD ならモデルを直接呼ぶ</td>
                </tr>
                <tr>
                  <th scope="row">Active Record のモデル</th>
                  <td>保存する概念、関連、常に守る条件、業務の操作、意味のある検索</td>
                  <td>HTML の整形、<code>params</code>、外部 SDK の詳細、画面ごとの進行</td>
                  <td>データや状態に属する知識がある</td>
                </tr>
                <tr>
                  <th scope="row">Service Object</th>
                  <td>独立した業務手順の進行、複数の参加者の調整、成功と失敗の約束</td>
                  <td>各モデルの規則の複製、HTTP の応答</td>
                  <td>
                    手順や失敗の扱いがモデル1つに収まらない。<code>order.cancel!</code> で完結するなら不要
                  </td>
                </tr>
                <tr>
                  <th scope="row">Form Object</th>
                  <td>画面固有の入力、型の変換、項目をまたぐ検証、エラーの表示</td>
                  <td>どの経路でも守る業務規則の唯一の実装</td>
                  <td>画面の入力の単位が、保存するモデルの単位とずれた</td>
                </tr>
                <tr>
                  <th scope="row">Query Object</th>
                  <td>用途に名前が付く複雑な検索・集計</td>
                  <td>更新、副作用、認可を無視した全件の検索</td>
                  <td>スコープの組み合わせでは読めない条件が、独立して増えた</td>
                </tr>
                <tr>
                  <th scope="row">Value Object</th>
                  <td>値で等しさが決まる概念（金額と通貨、期間）、正規化、計算</td>
                  <td>DB での身元の管理、外部との入出力</td>
                  <td>生の数値や文字列のままで、同じ誤りが繰り返される</td>
                </tr>
                <tr>
                  <th scope="row">Presenter・Decorator</th>
                  <td>表示向けの整形、複数の値をまとめた表示</td>
                  <td>保存、認可、価格の決定</td>
                  <td>複数のビューで同じ表示の判断が増えた。ヘルパー・パーシャル・I18n で足りるなら不要</td>
                </tr>
                <tr>
                  <th scope="row">Policy</th>
                  <td>誰がどの対象に何をできるかの判断</td>
                  <td>状態の更新、入力の検証</td>
                  <td>ロール・所有者・組織の規則が繰り返し現れる</td>
                </tr>
                <tr>
                  <th scope="row">PORO</th>
                  <td>保存しない概念や計算</td>
                  <td>名前の無い雑多な処理の集まり</td>
                  <td>入力・出力・意味を持つ概念が見つかった</td>
                </tr>
                <tr>
                  <th scope="row">Concern</th>
                  <td>同じモデルの中の、意味でまとまった振る舞いと関連の宣言</td>
                  <td>独立したオブジェクトの代わり、関係のないコードの移し先</td>
                  <td>1つのモデルの中で、コードを意味ごとに整理したい</td>
                </tr>
                <tr>
                  <th scope="row">ジョブ</th>
                  <td>非同期の実行、再試行、実行時のデータの読み直し</td>
                  <td>すべての業務規則、HTTP の文脈への依存</td>
                  <td>遅い処理、別のプロセスでの実行、障害時の再試行が必要</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            PORO は Plain Old Ruby Object の略で、Active Record を継承しない普通の Ruby のクラスを指します。層の名前ではなくクラスの書き方を表す言葉で、Service Object も Value Object も PORO として書けます。Service・Form・Query・Value Object を作る条件と約束の書き方は、<ChapterLink n={33} section="service-contract">Service Object の契約</ChapterLink> から始まる各節で扱います。
          </p>
          <p>
            Service や Form、Query、Policy は、Rails が必ず用意する層ではありません。<code>app/services</code> のようなディレクトリを作るだけでは責務は分かれません。Rails は起動時に <code>app</code> の下にあるディレクトリをオートロードの対象にするので、<code>app/services/orders/cancel.rb</code> に <code>Orders::Cancel</code> を定義すれば、設定を足さずに読み込めます（<ChapterLink n={8} section="naming">ファイル名と定数名の対応</ChapterLink>）。<Ref n={11} />
          </p>

          <h3>認可と業務の条件は別に確かめる</h3>
          <p>
            次は運営者が管理画面から注文を取り消すコントローラーです。運営者はどの注文も検索できますが、取り消せるのは担当する店舗の注文だけとします。コントローラーは対象の注文を取り出し、Policy で操作の許可を確かめてから、モデルの操作を呼びます。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/admin/orders_controller.rb・app/policies/order_policy.rb"
            code={`
class Admin::OrdersController < Admin::BaseController
  def cancel
    order = Order.find(params[:id])
    return head :forbidden unless OrderPolicy.new(current_staff, order).cancel?

    order.cancel!(actor: current_staff)
    redirect_to admin_order_path(order)
  rescue Order::InvalidTransition
    head :conflict
  end
end

class OrderPolicy
  def initialize(staff, order)
    @staff = staff
    @order = order
  end

  # 運営者は、担当する店舗の注文だけを取り消せる
  def cancel?
    @staff.support? && @staff.shop_id == @order.shop_id
  end
end
`}
          />
          <p>
            Policy が答えるのは「この人がこの注文を扱ってよいか」、<code>cancel!</code> が答えるのは「この注文はいまの状態で取り消せるか」です。担当の運営者でも発送済みの注文は取り消せず、支払い前の注文でも担当外の運営者は取り消せないので、どちらか一方の確認では足りません。画面の取り消しボタンを隠すだけでは認可にならないことと、所有者やロールによる認可の書き方は <ChapterLink n={21} section="object-authorization">所有者・ロールとレコードの認可</ChapterLink> で扱いました。
          </p>

          <h3>表示の整形と共通の検証</h3>
          <p>
            表示の整形はまずヘルパーやパーシャルに書き、複数のビューで同じ注文について同じ判断（確定前なら「未確定」と表示する、など）を繰り返すようになったら、Presenter として切り出せます。
          </p>
          <Code
            lang="ruby"
            title="app/presenters/order_presenter.rb"
            code={`
class OrderPresenter
  def initialize(order, view:)
    @order = order
    @view = view
  end

  def placed_on
    @order.placed_at ? @view.l(@order.placed_at.to_date) : "未確定"
  end
end

# ビューでは <%= OrderPresenter.new(@order, view: self).placed_on %> のように使う
# placed_at が nil の注文     => "未確定"
# placed_at が 2026-11-20 の注文 => "2026-11-20"（I18n の date.formats.default による）
`}
          />
          <p>
            <code>l</code> はビューで使える日付・時刻の書式化のヘルパーで、Presenter はビューのオブジェクトを受け取って使います。表示の判断は Presenter に置き、注文を確定できるかどうかの判断はモデルに残します。複数のモデルで共通する検証を Validator にまとめる書き方（<code>ActiveModel::EachValidator</code>）は <ChapterLink n={14} section="validation-design">入力の検証と固有の規則を書く</ChapterLink> で扱いました。
          </p>

          <h3>Concern はモデルの中の整理に使う</h3>
          <p>
            Concern（<code>ActiveSupport::Concern</code> を使うモジュール）は、モデルの中のコードを意味ごとにまとめる仕組みです。次の Archivable は <code>archived_at</code> 列を持つモデルに、アーカイブ済みを除くスコープとアーカイブの操作を追加します。
          </p>
          <Code
            lang="ruby"
            title="app/models/concerns/archivable.rb"
            code={`
module Archivable
  extend ActiveSupport::Concern

  included do
    scope :unarchived, -> { where(archived_at: nil) }
  end

  def archive!
    update!(archived_at: Time.current)
  end
end

class Product < ApplicationRecord
  include Archivable
end

product.archive!            # products.archived_at を更新する
Product.unarchived.count    # アーカイブしていない商品の件数
`}
          />
          <p>
            Concern のメソッドは組み込んだモデルのインスタンスの上で動き、<code>archive!</code> は Product の <code>archived_at</code> を直接書き換えます。別のオブジェクトにも、別のトランザクションにもなりません。依存する相手を引数で受け取る独立したオブジェクトと違い、Concern は組み込み先の属性や、ほかの Concern が定義したメソッドを暗黙に使えるので、Concern 同士が互いのメソッドを呼び合うと、呼ぶ順や前提が読み取りにくくなります。
          </p>
          <p>
            Concern に名前を付けるなら、Archivable（アーカイブできる）や <code>Order::Cancellable</code>（取り消せる）のように、その関心事に必要な状態・操作・関連を集めます。大きいモデルからメソッドを移しただけの <code>OrderMethods</code> のようなモジュールは、ファイルを分けても変更するときに読む範囲は減りません。DHH は複数のモデルで共有する振る舞いと、1つのモデルの本質ではない一部分を Concern にまとめる使い方を示し、Concern が大きなモデルを分ける唯一の方法ではないとも書いています。<Ref n={2} /> Concern の仕組みは <ChapterLink n={5} section="concern">ActiveSupport::Concern の実装</ChapterLink>、Concern に移した後も残る依存の例は <ChapterLink n={31} section="concern">Concern の節</ChapterLink> で扱います。
          </p>

          <h3>ジョブには ID を渡して実行時に読み直す</h3>
          <Code
            lang="ruby"
            title="app/jobs/order_receipt_job.rb"
            code={`
class OrderReceiptJob < ApplicationJob
  def perform(order_id)
    order = Order.find(order_id)
    OrderMailer.receipt(order).deliver_now
  end
end
`}
          />
          <p>
            ジョブはリクエストとは別のプロセスで後から実行されるので、引数には注文の ID を渡し、実行時の状態を DB から読み直して使います（<ChapterLink n={18} section="serialize">ジョブの引数の変換</ChapterLink>）。リクエストの中で使った <code>current_user</code> やそのときの時刻はジョブの中では自動では使えないため、必要な値は引数で渡します。このジョブだけでは同じメールの重複送信は防げません。重複してよいか、送信の記録が必要かは、後の「コールバックに置く処理を選ぶ」の節と <ChapterLink n={18} section="idempotency">ジョブの冪等性</ChapterLink> で扱います。
          </p>
          <p>
            ここまでの場所のどれかにクラスを切り出したら、前と後で、仕様を1つ変えたときに直す場所と、呼び出し側が知る必要のある手順を比べます。取り消しを <code>Orders::Cancel</code> という Service Object に移しても、中身が <code>order.cancel!</code> を呼ぶだけなら、読む場所が1つ増えただけです。
          </p>
        </>
      ),
    },
    {
      id: 'fat-model',
      title: '大きくなったモデルを評価する',
      body: (
        <>
          <p>
            業務の規則をモデルに集めていくと、モデルのファイルは長くなります。メソッドと行数が多いモデルを<Term en="Fat Model">Fat Model</Term>と呼び、問題として扱う記事もありますが、行数だけでは変更しやすさを判断できません。100行でも HTTP の処理、決済サービスの SDK の呼び出し、HTML の組み立て、業務の規則が混ざったモデルは変更しにくく、500行でも1つの概念の操作がはっきり分かれていれば、すぐに困るとは限りません。見るのは次の4点です。
          </p>
          <ul>
            <li>書き換える理由がいくつ混ざっているか</li>
            <li>各メソッドがどの状態を前提にしているか</li>
            <li>保存すると、見えないところで何が起きるか（コールバックによる通知や、ほかのモデルの更新）</li>
            <li>1つの変更のために読む範囲がどこまで広がるか</li>
          </ul>
          <p>次の表はモデルの要素ごとに、モデルに置くのが自然な責務と見直す兆候を並べたものです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">モデルに置く自然な責務</th>
                  <th scope="col">見直す兆候</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">インスタンスメソッド</th>
                  <td>
                    <code>order.cancel!</code>、明細の小計、現在の状態に対する判断
                  </td>
                  <td>配送・販促・請求の手順まで知っている</td>
                </tr>
                <tr>
                  <th scope="row">クラスメソッド</th>
                  <td>
                    <code>Order.placed_between(from, to)</code> のような、モデルの集合への問い合わせ
                  </td>
                  <td>画面ごとの多数の絞り込みや、帳票の整形を含む</td>
                </tr>
                <tr>
                  <th scope="row">スコープ</th>
                  <td>小さく、ほかの条件と組み合わせられる検索</td>
                  <td>多数の JOIN や GROUP BY、意外な select や並び順を隠している</td>
                </tr>
                <tr>
                  <th scope="row">バリデーション</th>
                  <td>保存する値と関連が常に満たす条件</td>
                  <td>管理画面・CSV・API ごとのフラグで分岐が増える</td>
                </tr>
                <tr>
                  <th scope="row">コールバック</th>
                  <td>自分の属性の正規化など、どの保存経路でも同じ処理</td>
                  <td>保存すると課金・ほかのモデルの更新・通知が連鎖する</td>
                </tr>
                <tr>
                  <th scope="row">関連</th>
                  <td>所有と参照、関連の保存・削除の方針</td>
                  <td>便利だからという理由だけで、双方向・多段の関連が増える</td>
                </tr>
                <tr>
                  <th scope="row">Concern</th>
                  <td>同じモデルの「取り消し」「アーカイブ」などのまとまり</td>
                  <td>組み込む順に依存し、メソッドが暗黙に呼び合う</td>
                </tr>
                <tr>
                  <th scope="row">PORO</th>
                  <td>割引の計算や期間の判定など、独立した値と規則</td>
                  <td>切り出しても、元のモデルの属性を全部読むだけになっている</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            データベースを読み書きすることは、モデルから Service Object へ移す理由になりません。注文が保存済みの明細から合計を求めるのは、注文の責務として自然です。逆に、データベースを使わない計算でも、複数の契約条件にまたがる価格の方針は、独立した PORO にする価値があります。
          </p>

          <h3>明細の小計と注文の合計</h3>
          <p>
            明細は「注文時の単価 × 数量」を自分で計算し、注文は明細の小計を足し合わせます。<code>add_item</code> は商品の名前と現在の価格を明細に写して追加するメソッドです（写す理由は次の節で扱います）。
          </p>
          <Code
            lang="ruby"
            title="app/models/order_item.rb・order.rb（抜粋）"
            code={`
class OrderItem < ApplicationRecord
  belongs_to :order, inverse_of: :items
  belongs_to :product
  validates :quantity, numericality: { only_integer: true, greater_than: 0 }

  def subtotal_cents = unit_price_cents * quantity
end

class Order < ApplicationRecord
  has_many :items, class_name: "OrderItem", inverse_of: :order

  # 注文時点の商品名と単価を明細に写して追加する（保存はしない）
  def add_item(product, quantity:)
    items.build(product:, product_name: product.name,
                unit_price_cents: product.price_cents, quantity:)
  end

  def total_cents = items.sum(&:subtotal_cents)
end
`}
          />
          <p>
            保存済みの空の注文 <code>order</code> に、300 円のペン（<code>pen</code>）を2個追加して保存し、続けて 500 円のノート（<code>note</code>）を1個、保存せずに追加しました。その状態で2通りの方法で合計を求めた結果です。
          </p>
          <Code
            lang="ruby"
            title="実行結果（SQL はログから抜粋）"
            code={`
order.add_item(pen, quantity: 2)
order.save!
order.add_item(note, quantity: 1)   # まだ保存していない

order.total_cents
#   SELECT "order_items".* FROM "order_items" WHERE "order_items"."order_id" = ?
# => 1100

order.items.sum("unit_price_cents * quantity")
#   SELECT SUM(unit_price_cents * quantity) FROM "order_items" WHERE "order_items"."order_id" = ?
# => 600
`}
          />
          <p>
            Active Record の <code>sum</code> は、ブロックを渡すと明細を読み込んで Ruby で足し算し（<code>map(&amp;block).sum</code>）、ブロックが無ければ SQL の SUM を実行します。<Ref n={7} /> 関連の読み込みにはまだ保存していないノートの明細も含まれるので、ブロックの形の合計は 300 × 2 + 500 = 1100 になり、DB で集計した式の形は保存済みの明細だけの 600 になりました。確定前の買い物かごの合計を画面に出すならブロックの形、多数の注文の売上を集計するなら SQL の形、というように、未保存の明細を含めたいかと件数の多さで選びます。
          </p>

          <h3>complete! を3つの案で整理する</h3>
          <p>注文のモデルに、次のような1つのメソッドが育っていたとします。</p>
          <Code
            lang="ruby"
            code={`
class Order < ApplicationRecord
  def complete!
    # 在庫の確認、決済、ポイントの付与、クーポンの使用、メール、状態の更新
  end
end
`}
          />
          <p>
            分ける前に、<code>complete!</code> が「注文の受付」「支払いの完了」「配送の完了」のどれを指すのかを決めます。ここでは注文の受付を <code>place!</code>、支払いの完了を <code>mark_paid!</code>、全体の完了を <code>complete!</code> と呼び分けます。名前があいまいなまま分割すると、そのあいまいさが別のファイルに移るだけです。
          </p>
          <p>
            名前を決めたら、注文の受付（<code>place!</code>）の分け方を図 33-2 の3つの案で比べます。3つの列が3つの案で、各列の上の箱が呼び出し元から最初に呼ばれるもの、下の2つの箱がそこから使われるもの、いちばん下の文がその案の向く場面です。
          </p>
          <Figure n="33-2" title="注文の受付を分ける3つの案" caption="模式図。紫の箱は Concern（モジュール）、強調した箱は呼び出し元から最初に呼ばれるもの。">
            <ThreePlansFigure />
          </Figure>
          <ul>
            <li>
              案A（モデルの操作を整える）では、<code>order.place!</code> が状態を確かめて明細を保存し、小計は明細に、割引額はクーポンに計算させます。呼び出しが短く、注文が常に守る条件を Order の中で読めます。注文処理が小さく安定しているうちはこれで足ります。発送や外部決済まで同じメソッドで扱うと、Order が調整する相手が増え、1つの変更で読む範囲が広がります。
            </li>
            <li>
              案B（関心事と計算を切り出す）では、受付の操作を <code>Order::Placeable</code> という Concern に、価格の計算を <code>Order::Pricing</code> という PORO に、金額と通貨の組を Money に置きます。<code>order.place!</code> という呼び出し方を変えずに、モデルの中の整理と、DB なしで試せる計算を分けられます。Concern に移すだけでは依存は減らないので、独立した概念が無いなら private メソッドで足ります。
            </li>
            <li>
              案C（業務の手順を独立させる）では、<code>Orders::Place</code> という Service Object が在庫・決済の要求・クーポンを調整し、Order は状態の規則を守ります。管理画面・API・ジョブから同じ手順を使え、失敗と再実行を管理できます。その分、クラスの数と、呼び出し元との約束（引数・戻り値・失敗の表し方）が増えます。
            </li>
          </ul>
          <p>
            複数のモデルを操作していても、注文と明細が一緒に保存されるまとまりなら、案A で足ります。案C を選ぶ理由はテーブルの数ではなく独立した参加者・手順・失敗の扱いを Order から切り離したいことです。どの案でも、在庫を負の数にしない条件や、状態を進めてよい条件は、呼び出し元に書かせずに Order と DB に残します。案C の約束の決め方は <ChapterLink n={33} section="service-contract">Service Object の契約</ChapterLink> で、注文処理を段階を追って分けていく例は <ChapterLink n={34} section="refactoring-stages">3つの段階</ChapterLink> で扱います。
          </p>
          <p>
            37signals の Jorge Manrubia は、コントローラーから呼ぶ操作をモデルの公開メソッド（たとえば記録を完全に消す <code>recording.incinerate</code>）として用意し、その中の処理を Concern と小さなクラスに分ける構成を紹介しています。<Ref n={1} /> 呼び出し側から見えるモデルのメソッドと、その内側の分け方を区別すると、モデルが大きすぎるかを行数ではなく構造で評価できます（<ChapterLink n={31} section="model-api">モデルの API で業務の意味を表す</ChapterLink>）。
          </p>
        </>
      ),
    },
    {
      id: 'data-model',
      title: 'テーブルに何を保証させるか',
      body: (
        <>
          <p>
            モデルの設計はテーブルの設計と一緒に決まります。テーブルを分ける前に、扱う対象が「後から同じものとして追跡したい対象」かどうかを考えます。このような対象を<Term en="entity">エンティティ</Term>と呼びます。注文は、配送先や数量を変えても注文番号で同じ注文として追跡します。一方、注文に記録する配送先の住所は、注文した時点の値の写し（<Term en="snapshot">スナップショット</Term>）として保存できます。後で利用者が住所録を書き換えても、送った先の住所は変わってはいけないからです。画面の区切りごとにテーブルを作るのではなく、身元を持つか、履歴を残すか、誰が所有するか、独立して変わるかを手がかりに分けます。
          </p>
          <p>次の表はテーブルの分け方と列の表し方の選択肢で、同じ表し方でも要件によって適する場合と後で困る場合があります。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">選択</th>
                  <th scope="col">適する条件</th>
                  <th scope="col">便利でも後で困りやすい場合</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">同じテーブルに置く</th>
                  <td>作られる時期・所有者・アクセスの制御が同じで、常に一緒に扱う</td>
                  <td>任意の別の概念が増え、NULL と条件付きの検証で埋まる</td>
                </tr>
                <tr>
                  <th scope="row">1対1で分ける</th>
                  <td>任意のプロフィール、機密のデータ、独立した更新や保存期間</td>
                  <td>項目が多いだけで分けると、毎回の JOIN と同時の保存が必要になる</td>
                </tr>
                <tr>
                  <th scope="row">1対多</th>
                  <td>注文と明細、注文と決済の試行など、独立した子の集まり</td>
                  <td>「今は1件」を has_one に固定して、分割発送や再決済で崩れる</td>
                </tr>
                <tr>
                  <th scope="row">多対多（中間テーブル）</th>
                  <td>利用者と組織の所属など</td>
                  <td>一意索引が無く、同じ所属や権限が二重にできる</td>
                </tr>
                <tr>
                  <th scope="row">NULL を許す列</th>
                  <td>未確定・任意・該当なしを表す</td>
                  <td>NULL の意味が「未入力」「不明」「削除済み」で混ざる。必須の値に空文字を入れるのも同じ問題</td>
                </tr>
                <tr>
                  <th scope="row">enum・状態の列</th>
                  <td>有限で安定した状態の集合</td>
                  <td>真偽値の列を組み合わせて、ありえない状態を作る。逆に、独立して進む状態を1列に詰め込む</td>
                </tr>
                <tr>
                  <th scope="row">STI</th>
                  <td>同じ属性・関連・寿命を持つ下位の種類</td>
                  <td>種類に固有の NULL の列が増える。役割の変更がクラスの変更になる</td>
                </tr>
                <tr>
                  <th scope="row">ポリモーフィック関連</th>
                  <td>コメントの対象など、種類が違っても同じ操作をする</td>
                  <td>外部キー制約で参照先を保証できず、削除・JOIN・クラス名の変更が難しい</td>
                </tr>
                <tr>
                  <th scope="row">JSON の列</th>
                  <td>外部サービスから受け取った内容、項目がまばらな設定</td>
                  <td>検索・外部キー・一意性・集計に使う値を入れる。中身の形を決めなくてよくなるわけではない</td>
                </tr>
                <tr>
                  <th scope="row">serialize</th>
                  <td>既存の text 列との互換など、保存形式を指定する必要がある</td>
                  <td>Ruby のオブジェクトの形と DB が結び付き、SQL で検索しにくく、古い値を読めなくなる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            enum の値の割り当てと STI の基本は <ChapterLink n={27} section="model-data-design">状態・タイプ・日時・金額の列を選ぶ</ChapterLink>、ポリモーフィック関連の索引と参照の整合性は <ChapterLink n={13} section="polymorphic-association">複数種類のモデルを指す関連</ChapterLink> で扱いました。設計の判断として付け加えると、STI は利用者の「管理者」「顧客」「従業員」のように1人が複数を兼ねる役割には向かず、役割は所属（Membership）やロールの列で表すほうが自然なことが多くあります（後の「User に何を集めるか」の節）。ポリモーフィック関連の代わりには、対象ごとの中間テーブル、共通の親テーブル、Rails の <code>delegated_type</code>（共通の属性を親のテーブルに、種類ごとの属性を別のテーブルに置く方法）などがあり、表現の重複と DB による保証の強さが違います。<Ref n={3} />
          </p>

          <h3>JSON の列と serialize</h3>
          <p>
            MySQL の JSON 列は保存するときに JSON として正しいかを検査し、正しくない文書を拒否します。ただし JSON 列そのものには索引を作れず、値を取り出す生成列（ほかの列から計算される列）を作って、そこに索引を置きます。<Ref n={9} /> 頻繁に絞り込む状態・金額・外部サービスの ID は、普通の列にしたほうが NOT NULL や一意索引で制約を書けて、検索も単純になります。
          </p>
          <Code
            lang="ruby"
            title="決済サービスから届いた通知を残すテーブルの例"
            code={`
create_table :payment_events do |t|
  t.references :payment, null: false, foreign_key: true
  t.string :provider_event_id, null: false, index: { unique: true } # 重複の排除と検索に使う値は普通の列
  t.json :payload, null: false                                       # 受け取った内容の全体
  t.timestamps
end

# 既存の text 列に保存している設定だけ、保存形式を指定する
class StoreSetting < ApplicationRecord
  serialize :options, coder: JSON
end

StoreSetting.create!(options: { "locale" => "ja", "digest" => true })
# text 列に保存された値: {"locale":"ja","digest":true}
StoreSetting.first.options   # => {"locale" => "ja", "digest" => true}
`}
          />
          <p>
            DB の JSON 型の列は Rails が Ruby の Hash や Array と自動で変換するので、<code>serialize</code> を重ねる必要はなく、<code>serialize</code> は既存の text 列などに使います。Rails の API ドキュメントは YAML や Marshal のように任意の Ruby オブジェクトを保存できる形式を避け、Hash や文字列のような基本の値に変換して保存するよう勧めています。保存したクラスの属性名を後で変えると、古い行を正しく読めなくなるためです。<Ref n={8} /> JSON にする場合も、キーと値の型、中身の形のバージョン、古い形の値の読み方を決めておきます。
          </p>

          <h3>検証と DB 制約を組にする</h3>
          <p>
            モデルのバリデーションは利用者にどの入力をどう直せばよいかを伝え、DB の制約は同時の更新や、一括更新・別のプログラムなどモデルを通らない書き込みも含めて、最後に条件を守ります。両者は同じ条件の重複ではなく役割が違います（<ChapterLink n={27} section="relational-design">一つの事実をどのテーブルで持つか</ChapterLink>、<ChapterLink n={14} section="uniqueness">一意性の検証と競合</ChapterLink>）。ここでは注文の明細に何を保証させるかを要件から決めます。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/xxxx_harden_order_items.rb"
            code={`
class HardenOrderItems < ActiveRecord::Migration[8.1]
  def change
    change_column_null :order_items, :order_id, false
    change_column_null :order_items, :product_id, false
    change_column_null :order_items, :quantity, false
    change_column_null :order_items, :unit_price_cents, false
    add_foreign_key :order_items, :orders
    add_foreign_key :order_items, :products
    add_check_constraint :order_items, "quantity > 0", name: "order_items_positive_quantity"
    add_check_constraint :order_items, "unit_price_cents >= 0", name: "order_items_nonnegative_price"

    # 「1つの注文の中で、同じ商品は1行にまとめる」という要件のときだけ
    add_index :order_items, [:order_id, :product_id], unique: true
  end
end
`}
          />
          <p>
            <code>CHECK (quantity &gt; 0)</code> だけでは NULL を拒否できません。MySQL の CHECK 制約は式が FALSE になった行だけを拒否し、NULL を含んで結果が UNKNOWN になった行は通すためです。<Ref n={10} /> quantity に CHECK だけを付けたテーブルで試すと、NULL の行は保存でき、0 の行だけが拒否されました（SQLite で実行。CHECK と NULL の扱いは MySQL と同じです）。
          </p>
          <Code
            lang="ruby"
            title="実行結果（quantity に NOT NULL を付けていない場合）"
            code={`
conn = ActiveRecord::Base.connection
conn.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (1, 1, NULL, 300)")
conn.select_value("SELECT COUNT(*) FROM order_items WHERE quantity IS NULL")   # => 1

conn.execute("INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES (1, 1, 0, 300)")
# ActiveRecord::CheckViolation
`}
          />
          <p>
            マイグレーションの最後の複合一意索引は、要件によって正しくも誤りにもなります。「同じ商品を2個買ったら、1行の数量を2にする」なら正しい制約ですが、「同じ商品でも、刻印の文字や配送日が違えば別の明細にする」という要件なら、正しい注文を拒否します。制約は業務で何を一意とみなすかに合わせて決めます。既に動いているテーブルに制約を加えるときは、重複や NULL の補正、ロックの時間、制約の検証を分けて計画します（<ChapterLink n={27} section="indexes-constraints">索引・NOT NULL・一意制約を追加する</ChapterLink>）。
          </p>

          <h3>過去の事実をスナップショットで残す</h3>
          <p>
            明細の <code>product_name</code> と <code>unit_price_cents</code> は商品のテーブルにも同じ情報がある重複した値ですが、注文した時点の事実を残すために明細に写します。前の節の <code>add_item</code> で作った明細は、後から商品の価格を変えても影響を受けません。
          </p>
          <Code
            lang="ruby"
            title="実行結果（前の節の order と pen を使う）"
            code={`
pen.update!(price_cents: 350)
order.items.first.unit_price_cents   # => 300（注文時の単価）
pen.reload.price_cents               # => 350（現在の価格）
`}
          />
          <p>
            すべてを正規化して明細から商品の現在の名前と価格を参照すると、商品の情報を変えたときに過去の注文の明細や領収書まで変わってしまいます。商品名・単価・税率・配送先など、後で再現が必要なものを必要な範囲で写し、重複させた列には「どの時点の事実か」を名前やコメントで示します（例：<code>order_items.unit_price_cents</code> は注文時の単価）。
          </p>
        </>
      ),
    },
    {
      id: 'association-design',
      title: '関連の所有と参照を区別する',
      body: (
        <>
          <p>
            <code>has_many</code> や <code>belongs_to</code> は、相手のレコードを読み出すメソッドを作るだけでなく、どちらがどちらに依存するか、親を保存・削除したときに子をどう扱うかの方針も表します。外部キーは <code>belongs_to</code> を書く側のテーブルに置き、<code>has_one</code> を宣言するだけでは DB 上の1対1は保証されないので、子の外部キーに一意索引を付けます。これらの基本は <ChapterLink n={13} section="basics">関連の基本的な使い方</ChapterLink> と <ChapterLink n={13} section="association-lifecycle">一対一の関連と、親を消すときの方針</ChapterLink> で扱いました。<Ref n={3} /> この節では EC サイトの関連を例に、所有・削除・集合の方針を決めます。
          </p>
          <p>
            図 33-3 はこの節で設計する関連を示したものです。矢印は外部キーを持つテーブルから参照先へ向き、元の側が複数、先の側が1つです。実線は親の一部として一緒に作られ、親なしでは意味を持たない記録を、破線は独立して存在する相手への参照を表します。たとえば OrderItem は注文の明細なので Order へは実線、Product は注文と関係なく存在するので破線です。
          </p>
          <Figure n="33-3" title="EC サイトの関連" caption="模式図。箱の2行目は、そのテーブルが持つ外部キーの列。">
            <AssociationFigure />
          </Figure>
          <Code
            lang="ruby"
            title="app/models（抜粋）"
            code={`
class User < ApplicationRecord
  has_many :orders, dependent: :restrict_with_exception
end

class Order < ApplicationRecord
  belongs_to :user
  has_many :items, class_name: "OrderItem", inverse_of: :order,
                   dependent: :restrict_with_exception
  has_many :products, through: :items
  has_many :payments, dependent: :restrict_with_exception
  has_many :shipments, dependent: :restrict_with_exception
end

class OrderItem < ApplicationRecord
  belongs_to :order, inverse_of: :items
  belongs_to :product
end

class Product < ApplicationRecord
  has_many :order_items, dependent: :restrict_with_exception
end

class Payment < ApplicationRecord
  belongs_to :order
end

class Shipment < ApplicationRecord
  belongs_to :order
  has_many :shipment_items
end

class ShipmentItem < ApplicationRecord
  belongs_to :shipment
  belongs_to :order_item
end

# 注文がある利用者を削除しようとした結果
user.destroy
# ActiveRecord::DeleteRestrictionError: Cannot delete record because of dependent orders
`}
          />
          <p>
            この設計では注文の履歴を物理的に削除せず、商品も販売をやめたら削除せずに販売停止の状態にします。<code>restrict_with_exception</code> は、子が残っていれば親の削除を例外で止めるので、注文がある利用者を誤って削除する操作を検出できます。<code>dependent: :destroy</code> は下書きの添付ファイルのように本当に親と同じ寿命のデータに使い、決済や監査の履歴まで連鎖して消さないようにします。DB の外部キー制約の削除時の動作（ON DELETE）も、モデルの <code>dependent</code> と同じ方針にそろえます。退会した利用者の個人情報を消す必要があるなら、注文を削除するのではなく利用者の情報の匿名化と、注文に残す情報の範囲を別に設計します。
          </p>
          <p>
            Payment を作るときは、「注文1件につき1つの支払済みフラグ」なのか、決済の試行・承認・失敗・返金のどこまでを1行で表すのかを決めます。再決済があるなら、試行ごとに1行を作る1対多が自然です。分割発送では Shipment と OrderItem の間に数量を持つ ShipmentItem を置き、発送した数量の合計が注文の数量を超えないことを確かめます。
          </p>
          <p>次の表は関連の種類ごとに、使う条件と見送る場合をまとめたものです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">関連</th>
                  <th scope="col">使う条件</th>
                  <th scope="col">見送る場合</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">belongs_to</th>
                  <td>相手を指す外部キーを持つ</td>
                  <td>
                    <code>optional: true</code> を、検証を外す目的だけで付ける（参照の整合性を保証しなくなる）
                  </td>
                </tr>
                <tr>
                  <th scope="row">has_one</th>
                  <td>親に対して子が最大1件で、子が独立した意味を持つ</td>
                  <td>常に同時に必要な属性なら、同じテーブルでよい</td>
                </tr>
                <tr>
                  <th scope="row">has_many</th>
                  <td>独立して増える子や参照の集まり</td>
                  <td>件数に上限が無い関連を、ビューで全件表示する</td>
                </tr>
                <tr>
                  <th scope="row">has_many :through</th>
                  <td>中間の行が数量・役割・期限・検証を持つ</td>
                  <td>外部キー1つで足りるものを中間モデルにする</td>
                </tr>
                <tr>
                  <th scope="row">has_and_belongs_to_many</th>
                  <td>属性も振る舞いも無い単純な多対多</td>
                  <td>参加日時・権限・履歴が必要になると分かっている</td>
                </tr>
                <tr>
                  <th scope="row">ポリモーフィック</th>
                  <td>対象の種類が違っても、関係の意味が同じ</td>
                  <td>外部キーによる保証が重要、対象が少数に決まっている、対象ごとの例外が多い</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            単純なタグ付けで <code>has_and_belongs_to_many</code> を使う場合も、中間テーブルに外部キーと複合一意索引を付け、関係に属性が増えた時点で <code>has_many :through</code> に移します（2つの選び方は <ChapterLink n={13} section="association-lifecycle">一対一の関連と、親を消すときの方針</ChapterLink>）。<Ref n={3} />
          </p>

          <h3>user.orders.last.payment を評価する</h3>
          <p>
            「利用者の最新の注文の支払い」を表示する画面で、<code>user.orders.last.payment</code> と書いたコードを見かけたとします。問題はメソッドの連鎖の長さそのものではありません。この1行が何を意味するかを確かめます。
          </p>
          <ul>
            <li>「最新」は作成した日時か、注文を確定した日時か</li>
            <li>注文が1件も無いとき、どう表示するか</li>
            <li>決済の試行が複数あるとき、どれを使うか</li>
            <li>SQL を何回実行するか</li>
          </ul>
          <p>
            並び順を指定しない <code>last</code> は主キー（<code>implicit_order_column</code> を設定していればその列）で並べた最後の1件を返します。<Ref n={6} /> 次の例では、確定日時が新しい注文（id 1）、確定日時が古い注文（id 2）、確定前の下書き（id 3）を順に作り、id 1 の注文に、失敗と成功の2回の決済を記録しました。
          </p>
          <Code
            lang="ruby"
            title="実行結果"
            code={`
user.orders.last
#   SELECT "orders".* FROM "orders" WHERE "orders"."user_id" = ?
#     ORDER BY "orders"."id" DESC LIMIT ?
# => id 3 の注文（placed_at は nil。確定前の下書き）

user.orders.last.payment
# NoMethodError: undefined method 'payment' for an instance of Order
`}
          />
          <p>
            <code>last</code> が返したのは下書きでした。さらに、この設計の Order は <code>has_many :payments</code> なので <code>payment</code> というメソッドは無く、NoMethodError になります。<code>payment</code> と書いたコードは、注文に支払いが1件だけという前提（<code>has_one</code>）に立っています。意味を決めて書き直すと次のようになります。
          </p>
          <Code
            lang="ruby"
            title="実行結果"
            code={`
latest_order = user.orders.where.not(placed_at: nil)
                   .order(placed_at: :desc, id: :desc).first
latest_payment =
  if latest_order
    latest_order.payments.where(status: "succeeded")
                .order(processed_at: :desc, id: :desc).first
  end
#   SELECT "orders".* FROM "orders" WHERE "orders"."user_id" = ? AND "orders"."placed_at" IS NOT NULL
#     ORDER BY "orders"."placed_at" DESC, "orders"."id" DESC LIMIT ?
#   SELECT "payments".* FROM "payments" WHERE "payments"."order_id" = ? AND "payments"."status" = ?
#     ORDER BY "payments"."processed_at" DESC, "payments"."id" DESC LIMIT ?
# latest_order は id 1、latest_payment は成功した決済
`}
          />
          <p>
            確定日時が同じ注文があっても結果が1つに決まるように、<code>id</code> を2つ目の並び順に加えています。注文が無いときに備えて <code>if</code> で分けました。Ruby の <code>&amp;.</code> は直後の1回の呼び出ししか省略しないので、<code>latest_order&amp;.payments.where(...)</code> と書くと、注文が無いときに nil に対して <code>where</code> を呼んでエラーになります。
          </p>
          <p>
            1つの管理画面だけで使うなら、このように明示的に書けば足ります。同じ意味の「最新の成功した支払い」を複数の場所で使うなら、注文のメソッドや Query Object にまとめて、意味を1か所で決めます（<ChapterLink n={33} section="query-objects">Query Object の節</ChapterLink>）。<code>delegate</code> で <code>user.latest_payment</code> のような短い名前を付けても、SQL の回数や相手がいない場合の扱いは変わりません。一覧で注文ごとに同じ式を繰り返すと N+1 問題になるので、先読みや専用の集計を使います（<ChapterLink n={13} section="n-plus-one">N+1 問題</ChapterLink>）。
          </p>
        </>
      ),
    },
    {
      id: 'model-boundaries',
      title: 'User に何を集めるか',
      body: (
        <>
          <p>
            利用者に関するデータは User のモデルに集まりがちです。会員登録の画面で名前・メールアドレス・会社名・請求先をまとめて入力するなら、それらを <code>users</code> テーブルの列にするのが最も手早い書き方です。User、Profile、Account、Customer、Membership、Organization のような名前のモデルを増やすかどうかは名前だけでは決められないので、まずチームでそれぞれの言葉が何を指すかを決めます。ここでは User はログインする人、Organization は組織、Membership は人の組織への所属、Customer は請求上の顧客、Account は契約の単位とします。製品によっては Account がログイン ID を指すこともあるので、決めた意味を用語集に残します。
          </p>
          <p>1つのモデルに保つか分けるかは、次の観点で比べます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">観点</th>
                  <th scope="col">1つに保つ根拠</th>
                  <th scope="col">分ける根拠</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">作られる時期と廃止される時期</th>
                  <td>常に同時に作られ、同時に廃止される</td>
                  <td>ログインを止めた後も、請求先は残す必要がある</td>
                </tr>
                <tr>
                  <th scope="row">所有者</th>
                  <td>同じ人、同じ管理権限が所有する</td>
                  <td>組織の契約は、担当者が退職しても組織が持ち続ける</td>
                </tr>
                <tr>
                  <th scope="row">必須かどうか</th>
                  <td>ほぼ常に必要で、一緒にして意味を持つ</td>
                  <td>公開プロフィールは、登録後に任意で作る</td>
                </tr>
                <tr>
                  <th scope="row">件数の関係</th>
                  <td>実際の関係も1対1で変わらない</td>
                  <td>1人が複数の組織に所属し、組織ごとに役割が違う</td>
                </tr>
                <tr>
                  <th scope="row">検証の条件</th>
                  <td>常に同じ条件で成り立つ</td>
                  <td>顧客と社員で、必須の項目が大きく違う</td>
                </tr>
                <tr>
                  <th scope="row">更新の頻度</th>
                  <td>一緒に読み、一緒に更新する</td>
                  <td>大きなプロフィールと認証情報が、別々に頻繁に更新される</td>
                </tr>
                <tr>
                  <th scope="row">閲覧できる範囲</th>
                  <td>閲覧・編集できる人が同じ</td>
                  <td>認証情報・請求情報・公開情報で、見てよい人が違う</td>
                </tr>
                <tr>
                  <th scope="row">業務上の概念</th>
                  <td>名前は違っても、同じものを指している</td>
                  <td>契約する主体と、操作する人が別の存在</td>
                </tr>
                <tr>
                  <th scope="row">将来の変更</th>
                  <td>分ける必要があるというのは推測にすぎない</td>
                  <td>複数の会社への所属など、次の要件や既存の例外が具体的にある</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            User に集めると、テーブルと JOIN が少なく、個人向けの単純なサービスなら早く作れます。一方、<code>company_id</code>、<code>company_role</code>、請求先、プロフィール、契約の状態まですべて User に入れると、担当者が替わったときに、契約まで別の人に移ったように見えてしまいます。図 33-4 は同じ情報を User に集めた場合と、役割ごとに分けた場合を並べたものです。
          </p>
          <Figure n="33-4" title="User に集める場合と役割ごとに分ける場合" caption="模式図。右の矢印は外部キーを持つ側から参照先へ向く。破線の箱は任意の記録。">
            <UserBoundaryFigure />
          </Figure>
          <p>
            左では、会社名・会社での役割・契約が1人の行に入っているので、担当者が辞めて行を無効にすると、会社の契約の扱いも一緒に変わります。右では、契約と請求先（Account）は Organization に付き、人と組織のつながりは Membership の行として表します。管理者かどうかは Membership の <code>role</code> で、組織ごとに決まります。右の構成をコードにすると次のようになります。
          </p>
          <Code
            lang="ruby"
            title="app/models（抜粋）とマイグレーション"
            code={`
class Membership < ApplicationRecord
  belongs_to :user
  belongs_to :organization
  enum :role, { member: "member", admin: "admin" }, prefix: true, validate: true
  validates :user_id, uniqueness: { scope: :organization_id }
end

class Organization < ApplicationRecord
  has_many :memberships
  has_many :users, through: :memberships
end

class User < ApplicationRecord
  has_many :memberships
  has_many :organizations, through: :memberships

  def admin_of?(organization)
    memberships.exists?(organization:, role: "admin")
  end
end

# 同じ人の同じ組織への所属は1行だけ
create_table :memberships do |t|
  t.references :user, null: false, foreign_key: true, index: false
  t.references :organization, null: false, foreign_key: true
  t.string :role, null: false, default: "member"
  t.timestamps
  t.index [:user_id, :organization_id], unique: true
end
`}
          />
          <p>利用者をA社の管理者、B社の一般の所属として登録し、続けて同じ所属を二重に作ろうとした結果です。</p>
          <Code
            lang="ruby"
            title="実行結果"
            code={`
Membership.create!(user:, organization: company_a, role: :admin)
Membership.create!(user:, organization: company_b)
user.admin_of?(company_a)   # => true
user.admin_of?(company_b)   # => false

dup = Membership.new(user:, organization: company_a)
dup.valid?                  # => false
dup.errors.full_messages    # => ["User has already been taken"]

# 検証を通らない一括の挿入
Membership.insert_all!([{ user_id: user.id, organization_id: company_a.id, role: "member",
                          created_at: Time.current, updated_at: Time.current }])
# ActiveRecord::RecordNotUnique（一意索引が拒否した）
`}
          />
          <p>
            A社の管理者がB社でも管理者になるわけではないので、User 全体に付く <code>admin?</code> の真偽値だけでは判定しません。<code>uniqueness</code> の検証は利用者に理由を返すためのもので、検証を通らない <code>insert_all!</code> のような経路や同時の登録は、DB の一意索引が拒否します（<ChapterLink n={14} section="uniqueness">一意性の検証と競合</ChapterLink>）。<code>index: false</code> は <code>t.references</code> が <code>user_id</code> だけの索引を作るのを止める指定で、<code>user_id</code> での検索には先頭が <code>user_id</code> の複合索引を使えます。
          </p>
          <p>
            退会した所属の履歴を、同じテーブルに複数の行で残したくなることがあります。そうすると、<code>(user_id, organization_id)</code> の一意索引と両立しません。現在の所属と過去の所属を別のテーブルに分けるなど、制約を設計し直します。
          </p>
          <p>
            テーブルを分けるだけでは、情報の機密性は上がりません。請求情報を別のテーブルにしても、認可、画面に出す属性の選択、ログ、キャッシュ、CSV の出力で同じ範囲を適用しなければ、見えてはいけない人に見えます。また、独立した意味を持たない Profile まで分けると、作成に失敗したときにプロフィールだけ欠けた利用者ができたり、毎回の JOIN が増えたりします。分けることで減る変更の波及が、こうした費用を上回るかを比べて決めます。
          </p>
        </>
      ),
    },
    {
      id: 'state-management',
      title: '状態の集合と遷移の規則を分ける',
      body: (
        <>
          <p>
            注文は作られてから完了するまでにいくつかの状態を通ります。ここでは draft（下書き）→ pending（支払い待ち）→ paid（支払済み）→ shipped（発送済み）→ completed（完了）と進み、draft と pending からは cancelled（取り消し）へ進めるとします。ある状態から別の状態へ移ることを<Term en="state transition">状態遷移</Term>と呼びます。状態の名前を決めるだけでは設計は終わらず、支払済みの注文を取り消すには返金が必要か、発送済みの注文は取り消しではなく返品の手続きにするか、といった遷移の規則も決めます。
          </p>
          <p>
            図 33-5 はこの注文の状態と許可する遷移を示したもので、箱が状態、矢印が許可する遷移、矢印に添えた名前はその遷移で呼ぶメソッドです。破線は取り消しではなく返金・返品という別の手続きで扱う流れです。
          </p>
          <Figure n="33-5" title="注文の状態と許可する遷移" caption="模式図。この章の例で許可する遷移だけを矢印にしている。">
            <OrderStateFigure />
          </Figure>
          <p>
            Rails の enum は状態の名前と保存する値の対応を決め、<code>status_paid?</code> のような問い合わせのメソッドと <code>Order.status_paid</code> のようなスコープを作りますが、どの状態からどの状態へ進めてよいかは定義しません。図の矢印は enum ではなくモデルのメソッドで書きます。状態の表し方には次の選択肢があります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">表し方</th>
                  <th scope="col">得られるもの</th>
                  <th scope="col">費用と使う条件</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">整数の enum</th>
                  <td>既知の状態と値の対応、問い合わせのメソッドとスコープ</td>
                  <td>値の対応を明示して固定する。DB を直接見ると意味が読めない</td>
                </tr>
                <tr>
                  <th scope="row">文字列の列（文字列の enum）</th>
                  <td>DB を直接見ても意味が読め、ほかの言語のプログラムとも共有しやすい</td>
                  <td>状態の候補を CHECK 制約や検証で制限する</td>
                </tr>
                <tr>
                  <th scope="row">状態機械のライブラリ</th>
                  <td>遷移の表、遷移の条件、遷移に付随する処理を宣言できる</td>
                  <td>ライブラリのコールバック・保存・同時実行の扱いを理解する必要がある。遷移が少なければモデルのメソッドで足りる</td>
                </tr>
                <tr>
                  <th scope="row">遷移の履歴のテーブル</th>
                  <td>誰がいつ、なぜ状態を変えたかを残せる</td>
                  <td>現在の状態との整合、データ量、訂正の方法を決める。履歴を保存するだけでは、記録から状態を組み立てるイベントソーシングにはならない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            整数の enum の値を途中に挿入すると保存済みの値の意味が変わる問題は、<ChapterLink n={27} section="model-data-design">状態・タイプ・日時・金額の列を選ぶ</ChapterLink> で扱いました。この節の例では DB を直接見ても読める文字列の値を使います。
          </p>

          <h3>enum が自動で作る更新メソッド</h3>
          <p>
            enum は状態ごとに <code>status_shipped!</code> のような ! 付きのメソッドも作ります。中身は <code>update!(status: "shipped")</code> で、遷移の条件を確かめません。Rails 8.1 の enum.rb では、問い合わせのメソッドと更新のメソッドを、オプション <code>instance_methods</code> が真のときに一緒に定義しています。<Ref n={4} />
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/enum.rb（303〜312行目）"
            href={`${GH}/activerecord/lib/active_record/enum.rb#L303-L312`}
            code={`
          def define_enum_methods(name, value_method_name, value, scopes, instance_methods)
            if instance_methods
              # def active?() status_for_database == 0 end
              klass.send(:detect_enum_conflict!, name, "#{value_method_name}?")
              define_method("#{value_method_name}?") { public_send(:"#{name}_for_database") == value }

              # def active!() update!(status: 0) end
              klass.send(:detect_enum_conflict!, name, "#{value_method_name}!")
              define_method("#{value_method_name}!") { update!(name => value) }
            end
`}
          />
          <p>
            <code>instance_methods</code> を指定しない enum の Order で、下書きの注文に <code>status_shipped!</code> を呼ぶと、そのまま発送済みになりました。<code>instance_methods: false</code> を指定すると問い合わせと ! 付きのメソッドを作らなくなり、スコープ（<code>Order.status_shipped</code>）だけが残ります。<code>validate: true</code> は候補に無い値の代入を、例外ではなく検証エラーとして扱う指定です。<Ref n={4} />
          </p>
          <Code
            lang="ruby"
            title="実行結果"
            code={`
# instance_methods を指定しない enum の場合
draft_order.status_shipped!
draft_order.status                       # => "shipped"（条件を確かめずに更新された）

# instance_methods: false, validate: true を指定した場合（次のコードの Order）
order.respond_to?(:status_shipped!)      # => false
order.status = "unknown"
order.valid?                             # => false
order.errors.full_messages               # => ["Status is not included in the list"]
`}
          />

          <h3>遷移のメソッドと履歴</h3>
          <p>
            遷移は条件の確認と更新を1つのメソッドにまとめます。次の Order は発送の <code>ship!</code> と取り消しの <code>cancel!</code> を持ち、遷移のたびに履歴の行（OrderTransition）を作ります。実行者は購入者（User）と運営者（Staff）の2種類なので、OrderTransition はポリモーフィック関連 <code>belongs_to :actor, polymorphic: true, optional: true</code> で記録し、ジョブによる自動の取り消しでは nil にします。
          </p>
          <Code
            lang="ruby"
            title="app/models/order.rb（抜粋）"
            code={`
class Order < ApplicationRecord
  class InvalidTransition < StandardError; end

  has_many :transitions, class_name: "OrderTransition",
                         dependent: :restrict_with_exception
  enum :status, {
    draft: "draft", pending: "pending", paid: "paid",
    shipped: "shipped", completed: "completed", cancelled: "cancelled"
  }, prefix: true, instance_methods: false, validate: true

  def ship!(actor:)
    with_lock do
      next if status == "shipped"   # 同じ操作の再実行は、何もせずに成功とする
      raise InvalidTransition, "支払済みの注文だけ発送できます" unless status == "paid"

      transition_to!("shipped", actor:, shipped_at: Time.current)
    end
    self
  end

  def cancel!(actor:, reason: nil)
    with_lock do
      next if status == "cancelled"
      unless status.in?(%w[draft pending])
        raise InvalidTransition, "支払後の取り消しは返金の手続きで扱います"
      end

      transition_to!("cancelled", actor:, reason:)
    end
    self
  end

  private

  def transition_to!(to, actor:, reason: nil, **attributes)
    transitions.create!(from_status: status, to_status: to, actor:, reason:)
    update!(status: to, **attributes)
  end
end
`}
          />
          <p>
            この例は状態の遷移だけを示す最小の形で、在庫を戻す処理や予約の解放は省いています。次は、支払済みの注文 <code>order</code> に運営者 <code>staff</code> が <code>ship!</code> を2回呼び、続けて購入者 <code>user</code> が <code>cancel!</code> を呼び、最後に支払期限切れの下書き <code>expired</code> をジョブから取り消した結果です。
          </p>
          <Code
            lang="ruby"
            title="実行結果（SQLite のログ）"
            code={`
order.ship!(actor: staff)
#   BEGIN immediate TRANSACTION
#   SELECT "orders".* FROM "orders" WHERE "orders"."id" = ? LIMIT ?
#   INSERT INTO "order_transitions" ("order_id", "from_status", "to_status", "actor_type", "actor_id", "created_at") VALUES (...)
#   UPDATE "orders" SET "status" = ?, "shipped_at" = ?, "updated_at" = ? WHERE "orders"."id" = ?
#   COMMIT TRANSACTION

order.ship!(actor: staff)          # 2回目
#   BEGIN immediate TRANSACTION
#   SELECT "orders".* FROM "orders" WHERE "orders"."id" = ? LIMIT ?
#   COMMIT TRANSACTION
order.transitions.count            # => 1

order.cancel!(actor: user)
# Order::InvalidTransition: 支払後の取り消しは返金の手続きで扱います

expired.cancel!(actor: nil, reason: "支払期限切れ")   # ジョブからの取り消し
expired.transitions.pluck(:from_status, :to_status, :actor_type, :reason)
# => [["draft", "cancelled", nil, "支払期限切れ"]]
`}
          />
          <p>
            <code>with_lock</code> はトランザクションを始め、注文の行をロックしながら読み直してからブロックを実行します（<ChapterLink n={15} section="pessimistic">悲観的ロック</ChapterLink>）。MySQL では上のログの SELECT に <code>FOR UPDATE</code> が付き、SQLite はこの SQL を使わずに <code>BEGIN immediate</code> でデータベース全体への書き込みを順番待ちにします。読み直した最新の状態で条件を確かめるので、同じ注文に発送と取り消しが同時に届いても、片方はもう一方の確定を待ち、確定後の状態で判定されます。
          </p>
          <p>
            2回目の <code>ship!</code> は既に shipped なので何もせずに終わり、履歴も増えませんでした。ジョブの再試行や二重送信で同じ操作が2回届いても、結果が変わらないようにするためです。ブロックの中の <code>next</code> はブロックを抜けるだけで、トランザクションはそのままコミットされます。発送済みの注文への <code>cancel!</code> は InvalidTransition になりました。遷移の履歴（実行者、変更前と変更後の状態、理由、日時）は状態の更新と同じトランザクションで保存します。別々に保存すると、状態は変わったのに履歴が無い、という不整合が起こり得るからです。
          </p>
          <Callout kind="v72">
            この節で使った enum のオプション <code>instance_methods</code>・<code>validate</code> と、次の節の <code>normalizes</code>、前の節の <code>serialize</code> の <code>coder:</code> は、Rails 7.2.4 にも同じ形であります（activerecord 7.2.4 の gem のソースで確認）。
          </Callout>

          <h3>メソッドを用意しても残る更新の経路</h3>
          <p>
            <code>ship!</code> を用意しても、<code>order.update!(status: "shipped")</code> や <code>Order.update_all</code> で状態を直接書き換えることはできます。試すと、下書きの注文を <code>update!</code> で shipped にできました。Ruby のメソッドだけでは禁止できないので、次の手段を組み合わせます。
          </p>
          <ul>
            <li>
              <code>status</code> をコントローラーで許可するパラメーターに含めず、利用者の入力で状態を書き換えさせない
            </li>
            <li>状態を変える経路が ship! などのメソッドに限られているかを、コードレビューで確かめる</li>
            <li>
              DB に状態の候補を制限する CHECK 制約を付ける（例：<code>status IN ('draft', 'pending', 'paid', 'shipped', 'completed', 'cancelled')</code>）
            </li>
            <li>遷移を確かめるバリデーションを足す場合も、古い状態を読んだ同時の更新は防げないので、ロックと組み合わせる</li>
          </ul>

          <h3>状態の組み合わせが増えたら分ける</h3>
          <p>
            決済と配送が独立して進むようになると、1つの <code>status</code> 列に <code>paid_partially_shipped_refund_pending</code> のような組み合わせの状態が増えていきます。そうなったら Payment と Shipment がそれぞれの状態を持ち、Order は「すべての明細が発送され、支払いが確定したら完了」のように、全体の完了条件を定義します。分割発送では一部を発送した時点で Order 全体を shipped にせず、Shipment と明細の数量から全体の状態を決めます。在庫を予約している pending の注文を取り消すなら予約の解放も含めた手順が必要になり、それをモデルのメソッドで扱うか、進行役のクラスに分けるかは<ChapterLink n={34} section="workflow-contracts">受付の手順を Orders::Place に分ける段階</ChapterLink> で判断します。
          </p>
        </>
      ),
    },
    {
      id: 'callback-design',
      title: 'コールバックに置く処理を選ぶ',
      body: (
        <>
          <p>
            コールバックは保存の決まった時点で必ず実行する処理を、モデルに宣言する仕組みです（<ChapterLink n={14} section="callback-basics">保存の前後に処理を足すコールバック</ChapterLink>）。<code>after_create</code> や <code>after_update</code> はトランザクションの中で、<code>after_commit</code> はコミットの後で実行され、コミット後の処理が失敗しても確定したデータは取り消せません（<ChapterLink n={14} section="after-commit">after_save と after_commit</ChapterLink>）。この節ではそれを前提に、ある処理をコールバックに置くか、名前の付いたメソッドから明示的に呼ぶかを、その処理がどの保存経路でも必要か、失敗したときにどこで扱うか、の2つで判断します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">処理</th>
                  <th scope="col">コールバックに置ける条件</th>
                  <th scope="col">避ける条件と代わりの方法</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">自分の属性の正規化</th>
                  <td>前後の空白を除くなど、短く、結果が入力だけで決まる</td>
                  <td>外部 API による検証や、別のレコードの保存を混ぜない</td>
                </tr>
                <tr>
                  <th scope="row">データの整合性</th>
                  <td>自分の属性の整形を補助する</td>
                  <td>一意性・外部キー・負の数の禁止を、コールバックだけで保証しない。DB の制約と組み合わせる</td>
                </tr>
                <tr>
                  <th scope="row">導出した値</th>
                  <td>同じ入力から計算し直せて、計算が軽い自分の値</td>
                  <td>大量の集計や、別の業務の状態の更新は、明示的な処理や再集計に移す</td>
                </tr>
                <tr>
                  <th scope="row">メールの送信</th>
                  <td>すべての保存経路で通知が必要なら、after_commit からジョブに依頼する</td>
                  <td>画面の操作に固有の通知は、その操作のメソッドから送る。同期の送信は保存の応答時間と送信の障害を結び付ける</td>
                </tr>
                <tr>
                  <th scope="row">ジョブの投入</th>
                  <td>コミット後に対象を読めればよく、投入の失敗から回復する方法がある</td>
                  <td>「コミットしたら必ずキューに入る」とは仮定しない。保証が必要なら送信予定の記録を使う</td>
                </tr>
                <tr>
                  <th scope="row">外部 API の呼び出し</th>
                  <td>保存の流れに直接埋め込むのは原則として避ける</td>
                  <td>明示的な操作やジョブから、タイムアウトと再実行を管理して呼ぶ</td>
                </tr>
                <tr>
                  <th scope="row">別のモデルの更新</th>
                  <td>カウンターキャッシュなど、同じ所有の範囲の小さな連動</td>
                  <td>利用者を保存すると契約・ポイント・請求まで変わるなら、業務の手順として明示する</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>自分の属性は代入で整える</h3>
          <Code
            lang="ruby"
            title="app/models/profile.rb"
            code={`
class Profile < ApplicationRecord
  before_validation :strip_display_name

  private

  def strip_display_name
    self.display_name = display_name&.strip
  end
end
`}
          />
          <p>
            <code>before_validation</code> の中では属性に代入するだけで、保存は呼び出し元の <code>save</code> が行います。Rails 7.1 以降では、同じ処理を <code>normalizes :display_name, with: -&gt;(name) {'{'} name.strip {'}'}</code> とも書けます（<ChapterLink n={14} section="callback-boundaries">永続化の近くに置く処理と業務操作</ChapterLink>）。Rails ガイドもコールバックの中で <code>update</code> や <code>save</code> などオブジェクトに副作用を起こすメソッドを呼ばず、<code>before_create</code> や <code>before_update</code> までの時点で属性に直接代入するよう勧めています。<Ref n={5} /> 次はそれを守らなかった場合の例です。
          </p>
          <Code
            lang="ruby"
            title="失敗する例と実行結果"
            code={`
class Profile < ApplicationRecord
  after_update :mark_reviewed

  private

  def mark_reviewed
    update!(reviewed_at: Time.current)   # 保存の途中で、もう一度保存する
  end
end

profile.update!(display_name: "新しい名前")
#   BEGIN immediate TRANSACTION
#   UPDATE "profiles" SET "display_name" = ?, "updated_at" = ? WHERE "profiles"."id" = ?
#   UPDATE "profiles" SET "reviewed_at" = ?, "updated_at" = ? WHERE "profiles"."id" = ?
#   UPDATE "profiles" SET "reviewed_at" = ?, "updated_at" = ? WHERE "profiles"."id" = ?
#   …（after_update が呼ばれるたびに、また update! する）
`}
          />
          <p>
            <code>mark_reviewed</code> の <code>update!</code> も更新なので <code>after_update</code> がまた呼ばれ、<code>reviewed_at</code> の更新が繰り返されます。試したときは、繰り返しが続かないよう6回目の呼び出しで例外を起こして止め、トランザクション全体がロールバックされて <code>display_name</code> の変更も保存されませんでした。<code>reviewed_at</code> を同じ保存に含めたいなら、<code>before_update</code> で <code>self.reviewed_at = Time.current</code> と代入します。
          </p>

          <h3>after_commit の通知は、どの経路で動くか</h3>
          <p>次の Order は注文の行を作ったらコミット後に受付メールのジョブを投入します。注文を作ったら必ず受付メールを送る、という製品に限って使える書き方です。</p>
          <Code
            lang="ruby"
            title="app/models/order.rb（抜粋）"
            code={`
class Order < ApplicationRecord
  after_create_commit :enqueue_receipt

  private

  def enqueue_receipt
    OrderReceiptJob.perform_later(id)
  end
end
`}
          />
          <p>このモデルで、4つの経路から注文を作り、投入されたジョブの件数を数えました（Active Job のテスト用のアダプターで記録）。</p>
          <Code
            lang="ruby"
            title="実行結果"
            code={`
user.orders.create!(status: "pending")   # 投入されたジョブ：1件
user.orders.create!(status: "draft")     # 2件（下書きでも投入される）

Order.transaction do
  user.orders.create!(status: "pending")
  raise ActiveRecord::Rollback
end                                       # 2件のまま（ロールバックしたので投入されない）

Order.insert_all([{ user_id: user.id, status: "pending",
                    created_at: Time.current, updated_at: Time.current }])
                                          # 2件のまま（コールバックが動かない）
`}
          />
          <p>
            コールバックはどの画面やジョブから保存したかを区別しないので、下書きの作成でも受付のジョブが投入されました。下書きの作成、データの移行、管理画面での修正では受付メールを送りたくないなら、このコールバックは要件に合いません。その場合は、注文を受け付ける <code>place!</code> の中から明示的にジョブを投入します。逆に <code>insert_all</code> のようにコールバックを通らない一括の操作では、送るはずの通知が送られません。<Ref n={5} /> コールバックを書く前に、保存のどの経路で何を起こしたいかを一覧にします。
          </p>
          <p>
            <code>after_commit</code> を使うと、ロールバックした保存の通知は送られません。しかし、コミットの直後にプロセスが止まった場合や、キューに投入できなかった場合の通知漏れは残り、ジョブが再試行されれば同じメールが2回送られることもあります。コミットと同時に送信予定を DB に記録し、別の処理が配送する方法は <ChapterLink n={34} section="external-boundaries">外部決済・部分失敗・再実行の設計</ChapterLink> で扱います。トランザクションの中で <code>perform_later</code> を呼んだときの投入の時刻と、Rails 8.1 の <code>enqueue_after_transaction_commit</code> は <ChapterLink n={18} section="transaction">トランザクションと投入の時刻</ChapterLink> で扱いました。
          </p>

          <h3>コールバックの連鎖を整理する手順</h3>
          <p>既存のアプリで、保存するたびにコールバックが連鎖して何が起きるか分からなくなっている場合は、次の順に整理します。</p>
          <ol>
            <li>呼び出し元（画面・API・ジョブ・コンソールでの修正）ごとに、save → コールバック → 関連の保存 → さらにコールバック → 外部への処理、という流れを書き出す。</li>
            <li>その順序と、ロールバックしたときに何が残るかを、テストで固定する。</li>
            <li>自分の属性の正規化はコールバックに残す。</li>
            <li>独立した業務の操作（受付メール、ポイントの付与など）は、名前の付いたメソッドに移し、必要な呼び出し元から呼ぶ。</li>
            <li>外部への処理はコミットの後に、ジョブや送信予定の記録を通して行う。</li>
          </ol>
          <p>
            移行の途中で、古いコールバックと新しいメソッドの両方が同じ通知を送ると、メールが二重に届きます。コールバックを消す変更と、明示的な呼び出しを加える変更は同じリリースに入れ、通知が1回だけ送られることをテストで確かめます。DHH が Basecamp でコールバックをどう使っているかは <ChapterLink n={31} section="callbacks-current">コールバックの節</ChapterLink> で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>設計では規則を置く場所、実行してよい人、一緒に確定する範囲、DB に保証させる条件、失敗したときに残るものを決め、呼び出し元を増やしても同じ条件が適用されるかで確かめます。</li>
            <li>処理の置き場所は書き換える理由で分けます。まずモデルのメソッド・関連・スコープ・ヘルパーで書き、具体的な問題が出てから Service・Form・Query・Value Object などを作ります。</li>
            <li>大きくなったモデルは行数ではなく混ざった変更理由・状態の前提・隠れた副作用・読む範囲で評価し、complete! のような大きなメソッドは名前の意味を決めてから分け方の案を比べます。</li>
            <li>テーブルは身元・履歴・所有・独立した変更で分けます。バリデーションと DB 制約を組にし、制約は業務上の一意性に合わせ、過去の事実はスナップショットで残します。</li>
            <li>関連は所有と参照を区別し、削除の方針を寿命に合わせます。並び順を省いた last は業務上の「最新」と一致するとは限りません。</li>
            <li>User に集めるか分けるかは、作られる時期、所有者、件数の関係、閲覧できる範囲などで比べます。役割は組織ごとの所属として表せます。</li>
            <li>enum は状態の名前と値を決めるだけで、遷移の規則は決めません。遷移はロックの下でメソッドにまとめ、履歴を同じトランザクションで残します。</li>
            <li>コールバックにはどの保存経路でも必要な短い処理を置き、経路によって要否が変わる通知や外部への処理は、明示的な操作とコミット後の仕組みで扱います。</li>
          </ul>
          <p>
            次の <ChapterLink n={33} /> ではこの章でモデルの外に置く候補として挙げた Service Object・Form Object・Query Object・Value Object を、作る条件と約束の書き方から扱います。
          </p>
        </>
      ),
    },
  ],
  sources: [
    { title: 'Vanilla Rails is plenty', publisher: '37signals / Jorge Manrubia', url: 'https://dev.37signals.com/vanilla-rails-is-plenty/', accessed: '2026-11-20', note: 'コントローラーからモデルの公開メソッドを呼び、内部を Concern と PORO に分ける構成。Service 層を既定では作らず、複雑さに見合うときにクラスを追加すること。' },
    { title: 'Put chubby models on a diet with concerns', publisher: 'Signal v. Noise / DHH', url: 'https://signalvnoise.com/posts/3372-put-chubby-models-on-a-diet-with-concerns', accessed: '2026-11-20', note: '複数のモデルで共有する振る舞いと、1つのモデルの本質ではない一部分を Concern にまとめること。Concern が大きなモデルを分ける唯一の方法ではないこと。' },
    { title: 'Active Record Associations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/association_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: '外部キーを belongs_to 側に置くこと、has_one に一意索引が必要な場合があること、has_many :through と has_and_belongs_to_many の選び方、delegated_type。' },
    { title: 'activerecord/lib/active_record/enum.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/enum.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '! 付きのメソッドが update! を呼ぶこと、instance_methods・scopes・validate の各オプション。gem のソースで確認し、実行例は Rails 8.1.4.1 で実測。' },
    { title: 'Active Record Callbacks', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'コールバックの中で update や save を呼ばず属性に代入すること、コールバックを通らないメソッドの一覧、after_commit を外部システムとのやり取りに使うこと。' },
    { title: 'activerecord/lib/active_record/relation/finder_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/finder_methods.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'last が並び順の無い Relation を implicit_order_column か主キーで並べる ordered_relation と _order_columns。' },
    { title: 'activerecord/lib/active_record/relation/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/calculations.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'sum がブロックを受け取ると map(&block).sum を、受け取らないと SQL の集計を実行すること。' },
    { title: 'activerecord/lib/active_record/attribute_methods/serialization.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/attribute_methods/serialization.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'serialize の coder、DB の JSON 型には serialize が不要なこと、任意の型を保存できる形式を避け基本の値に変換して保存する推奨。' },
    { title: 'The JSON Data Type', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/json.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'JSON 列の自動の検査と、JSON 列には直接索引を作れず生成列の索引を使うこと。' },
    { title: 'CHECK Constraints', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/create-table-check-constraints.html', accessed: '2026-11-20', version: 'MySQL 8.4', note: 'CHECK の式が TRUE か UNKNOWN（NULL）なら制約を満たし、FALSE のときだけ違反になること。' },
    { title: 'Autoloading and Reloading Constants', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/autoloading_and_reloading_constants.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'app の下のディレクトリ（app/services など独自のものを含む）が自動でオートロードの対象になること。' },
  ],
}

export default chapter
