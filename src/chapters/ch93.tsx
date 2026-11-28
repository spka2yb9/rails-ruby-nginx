import { principleConflicts } from './principle-judgment'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 91-1 送料無料の基準：3つの書き方で、どのコードがどの値を読むか ---------- */
function DryAhaFigure() {
  return (
    <Svg
      id="91-1"
      w={780}
      h={290}
      label="送料無料の基準を 3,000円から 5,000円に上げた後の、3つの書き方の比較。書き方1はカートの表示が 3_000、注文の確定が 5_000 をそれぞれ自分の中に持ち、小計 4,000円でカートには送料無料と出るのに確定の送料は 500円になる。書き方2はカートの表示・注文の確定・クーポンの条件が1つの定数 MINIMUM_AMOUNT を読み、表示と送料は合うが、クーポン WELCOME300 の条件まで 5,000円になって使えなくなる。書き方3はカートの表示と注文の確定が ShippingPolicy の FREE_FROM を読み、クーポンは coupons 表の minimum_amount を読むので、表示と送料が合い、クーポンも使える"
    >
      <T x={20} y={20} bold>
        書き方1：2か所に書いた
      </T>
      <Box x={20} y={40} w={104} h={40} lines={['カートの表示', 'CartView']} fs={11} subTone="muted" />
      <Box x={20} y={96} w={104} h={40} lines={['注文の確定', 'Checkout']} fs={11} subTone="muted" />
      <Box x={144} y={40} w={96} h={40} lines={['3_000', '直し忘れた']} fs={11} fill="box4" mono subTone="danger" />
      <Box x={144} y={96} w={96} h={40} lines={['5_000', '変えた']} fs={11} fill="box4" mono subTone="muted" />
      <Arrow x1={124} y1={60} x2={142} y2={60} dashed />
      <Arrow x1={124} y1={116} x2={142} y2={116} dashed />

      <T x={275} y={20} bold>
        書き方2：同じ数をまとめた
      </T>
      <Box x={275} y={40} w={104} h={40} lines={['カートの表示', 'CartView']} fs={11} subTone="muted" />
      <Box x={275} y={96} w={104} h={40} lines={['注文の確定', 'Checkout']} fs={11} subTone="muted" />
      <Box x={275} y={152} w={104} h={40} lines={['クーポンの条件', 'CouponRule']} fs={11} subTone="muted" />
      <Box x={399} y={92} w={110} h={48} lines={['MINIMUM_AMOUNT', '5_000']} fs={11} fill="box4" mono subTone="muted" />
      <Arrow x1={379} y1={60} x2={397} y2={104} dashed />
      <Arrow x1={379} y1={116} x2={397} y2={116} dashed />
      <Arrow x1={379} y1={172} x2={397} y2={128} dashed />

      <T x={530} y={20} bold>
        書き方3：知識ごとに分けた
      </T>
      <Box x={530} y={40} w={104} h={40} lines={['カートの表示', 'CartView']} fs={11} subTone="muted" />
      <Box x={530} y={96} w={104} h={40} lines={['注文の確定', 'Checkout']} fs={11} subTone="muted" />
      <Box x={530} y={152} w={104} h={40} lines={['クーポンの条件', 'Coupon']} fs={11} subTone="muted" />
      <Box x={650} y={64} w={110} h={48} lines={['ShippingPolicy', 'FREE_FROM 5_000']} fs={11} fill="box5" mono subTone="muted" />
      <Box x={650} y={148} w={110} h={48} lines={['coupons 表', 'minimum_amount']} fs={11} fill="box4" mono subTone="muted" />
      <Arrow x1={634} y1={60} x2={648} y2={80} dashed />
      <Arrow x1={634} y1={116} x2={648} y2={96} dashed />
      <Arrow x1={634} y1={172} x2={648} y2={172} dashed />

      <T x={20} y={214} fs={12} tone="danger">
        カート「送料無料」
      </T>
      <T x={20} y={234} fs={12} tone="danger">
        確定の送料 500円（食い違う）
      </T>
      <T x={275} y={214} fs={12}>
        表示と送料は合う
      </T>
      <T x={275} y={234} fs={12} tone="danger">
        WELCOME300 が使えなくなる
      </T>
      <T x={530} y={214} fs={12} tone="acc">
        表示と送料が合う
      </T>
      <T x={530} y={234} fs={12} tone="acc">
        WELCOME300 も使える
      </T>
      <T x={20} y={272} fs={12} tone="muted">
        破線の矢印は値の参照。結果は小計 4,000円のカートで、送料無料の基準を 5,000円に上げた後のもの
      </T>
    </Svg>
  )
}

/* ---------- 図 91-2 DRY と AHA：まとめるかどうかの問い ---------- */
function DryAhaJudgeFigure() {
  return (
    <Svg
      id="91-2"
      w={780}
      h={390}
      label="似たコードや同じ値を見つけたときに、DRY でまとめるか AHA で重複のまま残すかを決める問いの流れ。問1は、片方を変えたらもう片方も必ず同じに変えるか。はいなら DRY で1か所にまとめ、業務の言葉で名前を付ける。いいえなら、たまたま同じ値なので別々に書く。わからないなら問2へ進む。問2は、同じ形の例が3つ以上あり、違いを引数やフラグなしで書けるか。はいならまとめ、いいえなら AHA に従って重複のまま残し、例が増えたら問2に戻る。どの道を通っても、まとめた後に呼び出し側ごとのフラグや分岐が増えたら、呼び出し側へインライン化して戻す"
    >
      <Box x={170} y={16} w={440} h={52} lines={['問1 片方を変えたら、もう片方も必ず同じに変えるか', '（変える理由と、変えると決める人が同じか）']} fs={12} fill="box5" bold subTone="muted" />
      <Arrow d="M300,68 L135,108" />
      <Arrow x1={390} y1={68} x2={390} y2={108} />
      <Arrow d="M480,68 L645,108" />
      <T x={190} y={80} anchor="middle" fs={12} tone="acc">
        はい
      </T>
      <T x={398} y={90} fs={12} tone="acc">
        わからない
      </T>
      <T x={590} y={80} anchor="middle" fs={12} tone="acc">
        いいえ
      </T>
      <Box x={20} y={110} w={230} h={62} lines={['DRY：1か所にまとめる', '業務の言葉で名前を付ける', '例：ShippingPolicy::FREE_FROM']} fs={12} bold subTone="muted" />
      <Box x={275} y={110} w={230} h={62} lines={['問2 同じ形の例が3つ以上あり、', '違いを引数やフラグなしで', '書けるか']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={530} y={110} w={230} h={62} lines={['別々に書く（たまたま同じ値）', '同じ数でも定数を分ける', '例：クーポンの最低金額']} fs={12} bold subTone="muted" />
      <Arrow d="M340,172 L265,214" />
      <Arrow d="M440,172 L515,214" />
      <T x={290} y={196} anchor="end" fs={12} tone="acc">
        はい
      </T>
      <T x={490} y={196} fs={12} tone="acc">
        いいえ
      </T>
      <Box x={150} y={216} w={230} h={56} lines={['まとめる', '問1の「はい」と同じに扱う']} fs={12} bold subTone="muted" />
      <Box x={400} y={216} w={230} h={56} lines={['AHA：重複のまま残す', '例が増えたら問2に戻る']} fs={12} bold subTone="muted" />
      <Arrow d="M400,236 L390,236 L390,174" dashed />
      <Box x={20} y={300} w={740} h={52} lines={['まとめた後も見直す：呼び出し側ごとのフラグや分岐が増えてきたら、', '抽象化を呼び出し側へインライン化して戻し、もう一度問1から考える']} fs={12} dashed subTone="muted" />
      <T x={20} y={376} fs={12} tone="muted">
        問1は DRY の章の判断（変更の理由が同じか）、問2と最後の見直しは AHA の章の判断に対応する
      </T>
    </Svg>
  )
}

/* ---------- 図 91-3 KISS と OCP：種類を足す頻度と、違いを書くファイルの数 ---------- */
function KissOcpJudgeFigure() {
  return (
    <Svg
      id="91-3"
      w={780}
      h={400}
      label="KISS と OCP のどちらに寄せるかを2つの軸で分けた図。横軸は種類を足す頻度（これまでに足された回数と、予定されている依頼）、縦軸は種類による違いを書くファイルの数。左下は足す頻度が低く違いが1つのファイルに収まる場合で、case 文のままにして else で例外を投げる。この章の配送方法（3種類・1ファイル）がここに入る。右下は足す頻度が高く違いが1つのファイルの場合で、違いが値だけなら Hash の一覧1つで足りる。左上は足す頻度が低く違いが複数のファイルに分かれる場合で、case 文のまま、すべての種類を回すテストで足し忘れを見つける。右上は足す頻度が高く違いが複数のファイルに分かれる場合で、種類ごとのクラスと一覧から選ぶ構造にする。どの位置でも、一覧のすべての種類を回すテストを置く"
    >
      <Arrow x1={110} y1={340} x2={760} y2={340} />
      <Arrow x1={110} y1={340} x2={110} y2={20} />
      <T x={760} y={360} anchor="end" fs={12}>
        種類を足す頻度（これまでの回数と、予定されている依頼） →
      </T>
      <T x={20} y={28} fs={12}>
        違いを書く
      </T>
      <T x={20} y={46} fs={12}>
        ファイルの数
      </T>
      <T x={100} y={300} anchor="end" fs={12} tone="muted">
        1つ
      </T>
      <T x={100} y={100} anchor="end" fs={12} tone="muted">
        複数
      </T>
      <T x={130} y={356} fs={12} tone="muted">
        少ない
      </T>
      <T x={740} y={326} anchor="end" fs={12} tone="muted">
        多い
      </T>
      <Box x={130} y={190} w={300} h={130} lines={['case 文のまま（KISS）', '足し忘れは else の例外で止める', 'この章の配送方法', '（3種類・違いは1つのファイル）']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={450} y={190} w={300} h={130} lines={['case 文か、Hash の一覧1つ', '違いが値だけなら一覧で足りる', '足すたびに1つのファイルを直す']} fs={12} bold subTone="muted" />
      <Box x={130} y={40} w={300} h={130} lines={['case 文のまま', '種類を足す依頼がまれなら、', 'すべての種類を回すテストで', '足し忘れを見つける']} fs={12} bold subTone="muted" />
      <Box x={450} y={40} w={300} h={130} lines={['種類ごとのクラスと一覧（OCP）', '足すときはクラスと一覧の1行', '支払い方法の章の形', '（違いが4つの場所に出ていた）']} fs={12} bold subTone="muted" />
      <T x={20} y={388} fs={12} tone="muted">
        どの位置でも、一覧のすべての種類を回すテストを置く。境目の数は決まっていないので、チームで決める
      </T>
    </Svg>
  )
}

/* ---------- 図 91-4 YAGNI と DIP：外部の SDK に取り決めを挟む3つの段階 ---------- */
function YagniDipFigure() {
  return (
    <Svg
      id="91-4"
      w={780}
      h={380}
      label="外部の依存先にどこまで取り決めを挟むかを3つの段階で示した図。段階0は直接使う形で、Active Record、Time.current、Rails.logger、自分たちの値オブジェクトなど、変更を自分たちか Rails が決める依存はここにとどめる。この章の書き方A もこの形。段階0から段階1へは、外部の会社が変更を決める依存で、業務のクラスから呼ぶときに上がる。段階1は SDK を呼ぶコードを1つのクラスに集め、外から渡せるようにする形で、この章の書き方B の VendorSmsSender。SDK の更新で直すのはこのクラスだけになる。段階1から段階2へは、2社目の採用が決まった、または Fake と本物の違いで不具合が出たときに上がる。段階2は取り決めを共通のテストで確かめ、複数の実装を持つ形で、倉庫の章の形。YAGNI は、上がる条件が今あるときだけ上がることを求め、DIP は外部の SDK を段階1まで上げておくと後から挟む費用が小さいことを示す"
    >
      <Box x={20} y={230} w={230} h={100} lines={['段階0：直接使う', 'Active Record・Time.current', 'Rails.logger・値オブジェクト', 'この章の書き方A']} fs={12} bold subTone="muted" />
      <Box x={275} y={140} w={230} h={100} lines={['段階1：1つのクラスに集め、', '外から渡せるようにする', 'VendorSmsSender（書き方B）', 'SDK の更新はこのクラスだけ']} fs={12} fill="box5" bold subTone="muted" />
      <Box x={530} y={50} w={230} h={100} lines={['段階2：取り決めと複数の実装', 'shared_examples で取り決めを確かめる', '2社目の Adapter・Fake', '倉庫の章の形']} fs={12} bold subTone="muted" />
      <Arrow d="M135,230 L135,190 L273,190" accent />
      <Arrow d="M390,140 L390,100 L528,100" accent />
      <T x={20} y={140} fs={12}>
        上がる条件
      </T>
      <T x={20} y={158} fs={12} tone="muted">
        外部の会社が変更を決め、
      </T>
      <T x={20} y={176} fs={12} tone="muted">
        業務のクラスから呼ぶ
      </T>
      <T x={275} y={40} fs={12}>
        上がる条件
      </T>
      <T x={275} y={58} fs={12} tone="muted">
        2社目の採用が決まった、
      </T>
      <T x={275} y={76} fs={12} tone="muted">
        Fake と本物の違いで不具合が出た
      </T>
      <Box x={530} y={190} w={230} h={64} lines={['YAGNI', '上がる条件が今あるときだけ上がる']} fs={12} dashed bold subTone="muted" />
      <Box x={530} y={270} w={230} h={64} lines={['DIP', '外部の SDK は段階1まで上げると', '後から挟む費用が小さい']} fs={12} dashed bold subTone="muted" />
      <T x={20} y={364} fs={12} tone="muted">
        Ruby では取り決めを基底クラスで書かなくても、キーワード引数の既定値で外から渡せる（段階1の費用は小さい）
      </T>
    </Svg>
  )
}

/* ---------- 図 91-5 書き方C：依存先ごとの失敗の扱い ---------- */
function FailFastFigure() {
  const rows: { caller: string[]; dep: string[]; how: string[]; report: string[]; stop: boolean }[] = [
    { caller: ['商品ページ', 'show'], dep: ['商品', 'MySQL'], how: ['止める：例外のまま', '見つからなければ 404、ほかは 500'], report: ['Executor が報告', 'handled: false'], stop: true },
    { caller: ['商品ページ', 'show'], dep: ['在庫 API'], how: ['続ける：Rails.error.handle', 'unknown にして購入ボタンを出さない'], report: ['handle が報告', 'handled: true'], stop: false },
    { caller: ['商品ページ', 'show'], dep: ['おすすめ API'], how: ['続ける：Rails.error.handle', 'おすすめを空にして表示する'], report: ['handle が報告', 'handled: true'], stop: false },
    { caller: ['注文の確定', 'create'], dep: ['在庫 API'], how: ['止める：rescue_from', '503 を返し、注文を作らない'], report: ['report で報告', 'handled: true'], stop: true },
  ]
  return (
    <Svg
      id="91-5"
      w={780}
      h={350}
      label="書き方C で、呼び出し元と依存先の組ごとに、失敗したときの扱いと報告の仕方を並べた図。商品ページが読む MySQL の商品は、例外のままにして、見つからなければ 404、ほかは 500 にし、Executor が handled: false として報告する。商品ページが呼ぶ在庫 API は、Rails.error.handle で在庫を unknown にして購入ボタンを出さず、handled: true として報告する。商品ページが呼ぶおすすめ API は、Rails.error.handle でおすすめを空にして表示を続け、handled: true として報告する。注文の確定が呼ぶ在庫 API は、rescue_from で 503 を返して注文を作らず、report で報告する。止める行は Fail Fast、続ける行は Graceful Degradation に当たり、どの行も失敗を Rails.error に報告する"
    >
      <T x={20} y={22} bold>
        呼び出し元
      </T>
      <T x={190} y={22} bold>
        依存先
      </T>
      <T x={335} y={22} bold>
        失敗したときの扱い
      </T>
      <T x={630} y={22} bold>
        報告
      </T>
      {rows.map((r, i) => {
        const y = 40 + i * 68
        return (
          <g key={i}>
            <Box x={20} y={y} w={150} h={52} lines={r.caller} fs={12} subTone="muted" />
            <Box x={190} y={y} w={125} h={52} lines={r.dep} fs={12} fill="box4" subTone="muted" />
            <Box x={335} y={y} w={275} h={52} lines={r.how} fs={12} fill={r.stop ? 'box5' : 'box'} bold subTone="muted" />
            <Box x={630} y={y} w={130} h={52} lines={r.report} fs={11} fill="box2" subTone="muted" />
            <Arrow x1={170} y1={y + 26} x2={188} y2={y + 26} />
            <Arrow x1={315} y1={y + 26} x2={333} y2={y + 26} plain />
            <Arrow x1={610} y1={y + 26} x2={628} y2={y + 26} dashed />
          </g>
        )
      })}
      <T x={20} y={330} fs={12} tone="muted">
        紫の箱の行は Fail Fast（処理を止めて失敗を伝える）、ほかの行は Graceful Degradation（代わりの値で続ける）。どの行も報告する
      </T>
    </Svg>
  )
}

/* ---------- 図 91-7 2つのテストが依存するものと、2つの変更での結果 ---------- */
function EncapsulationFigure() {
  return (
    <Svg
      id="91-7"
      w={780}
      h={290}
      label="Cart の公開メソッド total と private メソッド bulk_discount に対して、2つのテストがどこに依存するかと、2つの変更での結果を示した図。テストB は公開メソッドの total を呼び、テストA は send で private の bulk_discount を直接呼ぶ。振る舞いを変えないリファクタリングでは、テストA は NoMethodError で失敗し、直す必要のない警告になる。テストB は成功する。振る舞いを壊した変更では、テストA は成功して不具合を見逃し、テストB は 3700 と 4300 の違いで失敗して不具合を見つける"
    >
      <Box x={150} y={30} w={230} h={180} fill="bg" />
      <T x={164} y={48} bold>
        Cart
      </T>
      <Box x={170} y={64} w={190} h={44} lines="公開：total・subtotal" fs={12} fill="box5" />
      <Box x={170} y={144} w={190} h={44} lines="private：bulk_discount" fs={12} dashed />
      <Arrow x1={265} y1={108} x2={265} y2={142} />
      <Box x={20} y={64} w={110} h={44} lines={['テストB', 'total を呼ぶ']} fs={12} bold subTone="muted" />
      <Box x={20} y={144} w={110} h={44} lines={['テストA', 'send で呼ぶ']} fs={12} bold subTone="muted" />
      <Arrow x1={130} y1={86} x2={168} y2={86} accent />
      <Arrow x1={130} y1={166} x2={168} y2={166} />
      <T x={20} y={234} fs={12} tone="danger">
        テストA は private の名前と引数に依存する
      </T>
      <T x={20} y={254} fs={12} tone="acc">
        テストB は公開した振る舞いだけに依存する
      </T>

      <T x={572} y={44} anchor="middle" fs={12} bold>
        テストA（send）
      </T>
      <T x={700} y={44} anchor="middle" fs={12} bold>
        テストB（total）
      </T>
      <Box x={410} y={60} w={100} h={72} lines={['振る舞いを', '変えない変更']} fs={12} fill="box2" />
      <Box x={410} y={142} w={100} h={72} lines={['振る舞いを', '壊した変更']} fs={12} fill="box2" />
      <Box x={515} y={60} w={115} h={72} fill="bg" />
      <T x={572} y={80} anchor="middle" fs={12} tone="danger" bold>
        失敗
      </T>
      <T x={572} y={98} anchor="middle" fs={11} mono>
        NoMethodError
      </T>
      <T x={572} y={116} anchor="middle" fs={11} tone="danger">
        直す必要のない警告
      </T>
      <Box x={640} y={60} w={120} h={72} fill="bg" />
      <T x={700} y={86} anchor="middle" fs={12} bold>
        成功
      </T>
      <T x={700} y={106} anchor="middle" fs={11} tone="acc">
        テストを直さずに済む
      </T>
      <Box x={515} y={142} w={115} h={72} fill="bg" />
      <T x={572} y={168} anchor="middle" fs={12} bold>
        成功
      </T>
      <T x={572} y={188} anchor="middle" fs={11} tone="danger">
        不具合を見逃す
      </T>
      <Box x={640} y={142} w={120} h={72} fill="bg" />
      <T x={700} y={162} anchor="middle" fs={12} tone="acc" bold>
        失敗
      </T>
      <T x={700} y={180} anchor="middle" fs={11} mono>
        3700 ≠ 4300
      </T>
      <T x={700} y={198} anchor="middle" fs={11} tone="acc">
        不具合を見つける
      </T>
      <T x={410} y={254} fs={12} tone="muted">
        右の4つの結果は、上の2回の実行結果をまとめたもの
      </T>
    </Svg>
  )
}

/* ---------- 図 91-10 原則同士がぶつかったときの判断の流れ ---------- */
function JudgeFlowFigure() {
  const steps: { y: number; h: number; lines: string[]; fill?: 'box5'; note: string[] }[] = [
    { y: 20, h: 48, lines: ['1 困っていることを具体的に書く', '直す箇所の数・値の食い違い・障害・テストの壊れ方'], note: ['例：基準を上げたら、カートの表示と', '確定の送料が食い違った'] },
    { y: 88, h: 48, lines: ['2 損なわれている目的を決める', '理解しやすい・変更しやすい・正しく動き続ける'], note: ['例：変更しやすい（直し忘れ）と', '正しく動き続ける（金額の食い違い）'] },
    { y: 156, h: 48, lines: ['3 その目的のための原則を選ぶ', '各章の「当てはめすぎたとき」の目安も読む'], note: ['例：DRY（同じ知識を1か所に）'] },
    { y: 224, h: 52, lines: ['4 反対側の原則が防ぐ問題は、', 'このコードで今起きているか'], fill: 'box5', note: ['例：AHA が防ぐ問題（違う知識を', 'まとめる）は、クーポンで起きるか'] },
  ]
  return (
    <Svg
      id="91-10"
      w={780}
      h={520}
      label="原則同士がぶつかったときの判断の流れ。1、困っていることを具体的に書く（直す箇所の数、値の食い違い、障害、テストの壊れ方）。2、損なわれている目的を、理解しやすい、変更しやすい、正しく動き続けるの中から決める。3、その目的のための原則を選び、各章の当てはめすぎの目安も読む。4、反対側の原則が防ぐ問題が、このコードで今起きているかを確かめる。起きていなければ小さい方の変更にとどめ、起きていれば両方の損失を比べて決める。5、テストで振る舞いを固定してから直し、PR に判断の理由と見直す条件を書く。6、変更の実績が増えたら、もう一度1から判断する。右側には、この章の送料無料の基準の例を添えている"
    >
      {steps.map((s) => (
        <g key={s.y}>
          <Box x={20} y={s.y} w={440} h={s.h} lines={s.lines} fs={12} fill={s.fill ?? 'box'} bold subTone="muted" />
          {s.note.map((t, i) => (
            <T key={t} x={500} y={s.y + 16 + i * 18} fs={11} tone="muted">
              {t}
            </T>
          ))}
        </g>
      ))}
      <Arrow x1={240} y1={68} x2={240} y2={86} />
      <Arrow x1={240} y1={136} x2={240} y2={154} />
      <Arrow x1={240} y1={204} x2={240} y2={222} />
      <Arrow d="M150,276 L115,306" />
      <Arrow d="M330,276 L365,306" />
      <T x={120} y={290} anchor="end" fs={12} tone="acc">
        起きていない
      </T>
      <T x={360} y={290} fs={12} tone="acc">
        起きている
      </T>
      <Box x={20} y={308} w={210} h={56} lines={['小さい方の変更にとどめる', '例：case 文・SDK を直接呼ぶ']} fs={12} bold subTone="muted" />
      <Box x={250} y={308} w={210} h={56} lines={['両方の損失を比べて決める', '例：基準とクーポンを分ける']} fs={12} bold subTone="muted" />
      <Arrow d="M125,364 L125,382" />
      <Arrow d="M355,364 L355,382" />
      <Box x={20} y={384} w={440} h={48} lines={['5 テストで振る舞いを固定してから直す', 'PR に判断の理由と、見直す条件を書く']} fs={12} bold subTone="muted" />
      <T x={500} y={400} fs={11} tone="muted">
        例：すべての配送方法を回すテスト、
      </T>
      <T x={500} y={418} fs={11} tone="muted">
        「違いがほかのファイルに出たら一覧にする」と書く
      </T>
      <Arrow x1={240} y1={432} x2={240} y2={450} />
      <Box x={20} y={452} w={440} h={40} lines="6 変更の実績が増えたら、もう一度1から判断する" fs={12} dashed />
      <Arrow d="M460,472 L478,472 L478,44 L462,44" dashed />
      <T x={20} y={510} fs={12} tone="muted">
        右の例は、この章の送料無料の基準（DRY と AHA）と配送方法（KISS と OCP）から取った
      </T>
    </Svg>
  )
}

/* ---------- 図 91-11 さらに学ぶ4つの領域と、本書の章 ---------- */
function FurtherFigure() {
  const rows: { area: string[]; book: string[] }[] = [
    { area: ['1 プログラミングの原則', 'KISS・YAGNI・DRY・AHA'], book: ['この部（第8部）の各章とこの終章', 'DHH の思想・設計（Rails Doctrine）'] },
    { area: ['2 オブジェクト指向設計', 'SOLID・GoF・DI'], book: ['第9部 MSDP（DI・Strategy・Adapter ほか15のパターン）', 'Service・Form・Query・Value Object と設計パターン'] },
    { area: ['3 ソフトウェアアーキテクチャ', '層・境界・ドメインのモデル'], book: ['責務分割とモデルの設計（アーキテクチャの境界）', '注文処理を段階的に育てる設計（Rails Way と DDD）', 'Use Case / Application Service'] },
    { area: ['4 分散システムと運用', '冪等性・整合性・耐障害性'], book: ['非同期処理（冪等性・再試行）、LB 配下の構成と障害対応', 'Idempotency Key・Transactional Outbox・Retry with Backoff', '冪等性・可観測性の原則の章'] },
  ]
  return (
    <Svg
      id="91-11"
      w={780}
      h={440}
      label="この部の後に学ぶ4つの領域と、続きを読める本書の章を結んだ図。1 プログラミングの原則は、この部の各章とこの終章、DHH の思想・設計の章（Rails Doctrine）。2 オブジェクト指向設計と設計パターンは、第9部 MSDP の15のパターンの章と、Service・Form・Query・Value Object と設計パターンの章。3 ソフトウェアアーキテクチャは、責務分割とモデルの設計の章のアーキテクチャの境界の節、注文処理を段階的に育てる設計の章の Rails Way と DDD の節、Use Case / Application Service の章。4 分散システムと運用設計は、非同期処理の章の冪等性と再試行、ロードバランサー配下の構成と障害対応の章、Idempotency Key・Transactional Outbox・Retry with Backoff の章、冪等性と可観測性の原則の章"
    >
      {rows.map((r, i) => {
        const y = 20 + i * 100
        return (
          <g key={r.area[0]}>
            <Box x={20} y={y} w={210} h={84} lines={r.area} fs={12} fill="box2" bold subTone="muted" />
            <Box x={260} y={y} w={500} h={84} lines={r.book} fs={12} align="start" />
            <Arrow x1={230} y1={y + 42} x2={258} y2={y + 42} />
          </g>
        )
      })}
      <T x={20} y={428} fs={12} tone="muted">
        右の箱は本書の章（章へのリンクは節の表にある）。本書の外の資料（書籍・論文）も節の表に示す
      </T>
    </Svg>
  )
}

/* ---------- 図 91-6 Fail Fast と Graceful Degradation：機能ごとの判断（表） ---------- */
function FailFastTable() {
  const rows: [string, string, string, string][] = [
    ['注文の確定・決済・在庫の引き当て', '処理を止め、利用者に失敗を伝える。データを作らない', 'Fail Fast', 'rescue_from で 503 や 422 を返し、Rails.error.report で報告する'],
    ['購入に関わる情報の表示（在庫・届く日）', 'ページは表示し、確かめられない情報は「確認できない」と示して購入の操作を止める', '両方（表示は続け、購入は止める）', 'Rails.error.handle の fallback を「不明」を表す値にする'],
    ['補助の表示（おすすめ・レビューの件数・閲覧履歴）', '代わりの表示（空・既定の文言）で続ける', 'Graceful Degradation', 'Rails.error.handle(Faraday::Error, fallback: -> { [] })'],
    ['起動に必要な設定（API キー・接続先）', '起動を止める', 'Fail Fast', 'ENV.fetch、credentials の fetch'],
    ['自分たちのコードの誤り（NoMethodError など）', '捕まえない。全体の例外ハンドラーで 500 にして報告する', 'Fail Fast', 'rescue する例外のクラスを、外部の失敗（Faraday::Error など）に限る'],
    ['起きないはずの状態（前提の破れ）', '開発とテストでは止め、本番では報告して続ける', '両方（環境で分ける）', 'Rails.error.unexpected'],
  ]
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">機能・処理</th>
            <th scope="col">失敗したときの扱い</th>
            <th scope="col">寄せる原則</th>
            <th scope="col">Rails での書き方</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b, c, d]) => (
            <tr key={a}>
              <th scope="row">{a}</th>
              <td>{b}</td>
              <td>{c}</td>
              <td>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ---------- 図 91-8 Encapsulation とテストのしやすさ：テストしたくなったときの判断（表） ---------- */
function EncapsulationTable() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">テストしたくなった状況</th>
            <th scope="col">方法</th>
            <th scope="col">例</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">private メソッドが、公開メソッドの計算の一部になっている</th>
            <td>公開メソッドの結果で確かめる。境目の値（2個と3個）を公開メソッドの入力で選ぶ</td>
            <td>Cart#total で割引を確かめる（この節）</td>
          </tr>
          <tr>
            <th scope="row">private の分岐が多く、公開メソッドを通すとテストの準備が重い</th>
            <td>業務の言葉で名前を付けられる概念なら、別のクラスに切り出し、そのクラスの公開メソッドとしてテストする</td>
            <td>割引の規則が増えたら、Item#bulk_discount や割引のクラスに移す</td>
          </tr>
          <tr>
            <th scope="row">テストのデータを用意するために、内部を書き換えたい</th>
            <td>公開した操作でデータを作る。作れないなら、公開した操作が足りないか、1つの操作が多くを行いすぎている</td>
            <td>
              残高を charge! で用意する（<ChapterLink n={71} section="overuse" />）
            </td>
          </tr>
          <tr>
            <th scope="row">外部への送信や現在時刻の影響を確かめたい</th>
            <td>依存先を外から渡して差し替える。現在時刻は travel_to で固定する</td>
            <td>
              FakeSmsSender を渡す（<ChapterLink n={93} section="yagni-dip" />）
            </td>
          </tr>
          <tr>
            <th scope="row">ほかのモジュールの判断が変わるたびに、テストが壊れる</th>
            <td>テストも呼び出し側の1つとして、公開した操作の結果だけを確かめる</td>
            <td>
              配送業者の表を隠したモジュール（<ChapterLink n={73} section="apply" />）
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/* ---------- 図 91-9 特に重要な10原則と章の対応（表） ---------- */
const TOP10: { ids: number[]; name: string; subject: string; over: string; pair: string }[] = [
  { ids: [57], name: 'KISS', subject: '3種類のクーポンのためのルールエンジンで、評価の順番によって割引が二重にかかった', over: '必要な検証まで省く。行数を減らすために詰め込む', pair: 'KISS と OCP' },
  { ids: [58], name: 'YAGNI', subject: '日本円しか扱わないのに、使わない多通貨の仕組みまで税率の変更のたびに直していた', over: '注文した時点の価格と税率の記録や、テストまで省く', pair: 'YAGNI と DIP' },
  { ids: [59], name: 'DRY', subject: '税込み価格の計算が4か所にあり、同じ注文が3通りの金額になった', over: '税込みの単価と適格請求書の消費税額のように、違う知識をまとめる', pair: 'DRY と AHA' },
  { ids: [63], name: 'SRP', subject: '経理の依頼で変えた金額の計算が、通知のメールの金額まで変えた', over: '同じ担当の変更が多くのファイルに散らばる', pair: 'なし' },
  { ids: [69, 70], name: 'High Cohesion / Low Coupling', subject: '期間の計算が散らばって境界の日の扱いが食い違った。会員の列名の変更で請求・メール・集計が止まった', over: '分けすぎて読むファイルが増える。依存を見えなくする仕組みを足しすぎる', pair: 'YAGNI と DIP' },
  { ids: [76], name: 'AHA', subject: '共通化した帳票のクラスにオプションと分岐が増え、1つの帳票の変更が別の帳票を変える', over: '同じ知識まで重複のまま残し、片方を直し忘れる', pair: 'DRY と AHA' },
  { ids: [71], name: 'Encapsulation', subject: '5か所の update(balance: …) で、残高がマイナスになり履歴と食い違った', over: '規則のない属性まで隠す。テストのためだけに内部を開ける', pair: 'Encapsulation とテストのしやすさ' },
  { ids: [62], name: 'Explicit over Implicit', subject: 'default_scope で集計の件数が合わず、コールバックでデータの移行中にメールが届いた', over: 'Rails の規約で済む所まで、すべてを明示しようとする', pair: 'なし' },
  { ids: [79], name: 'Fail Fast', subject: 'API キーが無いまま起動して最初の決済で nil のエラーになり、save の false を見ずにデータが欠けた', over: '補助の機能の失敗まで止めて、ページ全体を 500 にする', pair: 'Fail Fast と Graceful Degradation' },
  { ids: [90], name: 'Measure Before Optimizing', subject: '遅い原因を推測で JSON の生成と決めて直したが、実際は N+1 のクエリだった', over: '計測を理由に、原因がわかっている修正まで後回しにする', pair: 'なし' },
]

function Top10Table() {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">番号</th>
            <th scope="col">原則</th>
            <th scope="col">章の題材（起きた問題）</th>
            <th scope="col">当てはめすぎの兆候</th>
            <th scope="col">この章の組</th>
            <th scope="col">章</th>
          </tr>
        </thead>
        <tbody>
          {TOP10.map((r, i) => (
            <tr key={r.name}>
              <td>{i + 1}</td>
              <th scope="row">{r.name}</th>
              <td>{r.subject}</td>
              <td>{r.over}</td>
              <td>{r.pair}</td>
              <td>
                {r.ids.map((id, j) => (
                  <span key={id}>
                    {j > 0 && '、'}
                    <ChapterLink n={id} />
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const chapter: Chapter = {
  number: 93,
  part: 8,
  title: '原則同士のトレードオフと、さらに学ぶ領域',
  summary:
    '送料無料の基準・配送方法・SMS の送信・商品ページ・カートの割引の5つの場面で、DRY と AHA、KISS と OCP、YAGNI と DIP、Fail Fast と Graceful Degradation、Encapsulation とテストのしやすさのそれぞれについて、両方の書き方を Rails で動かして比べ、どちらを優先するかの目安を示します。最後に特に重要な10原則と3つの目的を振り返り、この先に学ぶ4つの領域を本書の章と本書の外の書籍・論文に分けて示します。',
  goals: [
    '原則同士のトレードオフとは何かを、同じコードに対して2つの原則が逆の変更を勧める例で説明できる',
    'DRY と AHA、KISS と OCP、YAGNI と DIP について、どちらを優先するかを「変える理由が同じか」「違いを書く場所の数」「変更を誰が決めるか」などの問いで判断できる',
    '外部の API が失敗したときに、機能ごとに処理を止めるか続けるかを決め、Rails.error.handle・record・report と rescue_from で書き分けられる',
    'private メソッドを send で呼ぶテストが、リファクタリングで壊れ、不具合を見逃すことを実行結果で説明し、公開された振る舞いを通じてテストを書ける',
    '特に重要な10原則と3つの目的を、この部の章と結び付けて振り返れる',
    'プログラミングの原則の先に学ぶ4つの領域（原則・オブジェクト指向設計・アーキテクチャ・分散システムと運用）について、本書の章と本書の外の書籍・論文を挙げられる',
  ],
  prerequisites: [56, 59, 64, 67, 71],
  sections: [
    {
      id: 'dry-aha',
      title: 'DRY と AHA：送料無料の基準を変えたとき',
      body: (
        <>
          <h3>そもそも、原則同士がぶつかるとは</h3>
          <p>
            この部の各章では1つの原則に反したコードを動かして問題を確かめ、原則に沿って直しました。実際のコードでは、2つの原則が同じ箇所について反対の変更を勧めることがあります。例として、EC サイトの「送料無料の基準（小計 3,000円以上）」と「クーポン WELCOME300 の条件（小計 3,000円以上の注文で300円引き）」を考えます。どちらもコードに 3,000 という同じ数を書いています。
          </p>
          <p>
            DRY（<ChapterLink n={59} />）は同じ知識を複数の場所に書かないように勧めます。この勧めに従うと、3,000 を1つの定数にまとめたくなります。AHA（<ChapterLink n={76} />）は似ているだけのものを急いで1つにまとめないように勧めます。この勧めに従うと、2つの 3,000 は別々に残したくなります。どちらの原則も、当てはまる場面では正しい判断の基準です。この章では同じコードに対して2つの原則が逆の変更を勧める関係を、原則同士の<Term en="trade-off">トレードオフ</Term>と呼びます。トレードオフとは、一方を優先すると、もう一方が守ろうとしている利点の一部を失う関係です。
          </p>
          <p>
            序章（<ChapterLink n={56} section="what-is-principle" />）ではこの部で比べる5組を挙げました。この章では5組のそれぞれについて、同じ要件を2通りまたは3通りに書いた Rails のコードを動かし、どちらを優先するかの目安を図か表で示します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">組</th>
                  <th scope="col">場面</th>
                  <th scope="col">比べる書き方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DRY と AHA</th>
                  <td>送料無料の基準を変える</td>
                  <td>2か所に書く／同じ数を1つにまとめる／知識ごとに分ける</td>
                </tr>
                <tr>
                  <th scope="row">KISS と OCP</th>
                  <td>配送方法を足す</td>
                  <td>case 文／配送方法ごとのクラスと一覧</td>
                </tr>
                <tr>
                  <th scope="row">YAGNI と DIP</th>
                  <td>SMS 送信会社の SDK を更新する</td>
                  <td>業務のクラスから SDK を直接呼ぶ／SDK を1つのクラスに集めて外から渡す</td>
                </tr>
                <tr>
                  <th scope="row">Fail Fast と Graceful Degradation</th>
                  <td>商品ページが使う外部 API が止まる</td>
                  <td>どの失敗も止める／どの失敗も続ける／機能ごとに分ける</td>
                </tr>
                <tr>
                  <th scope="row">Encapsulation とテストのしやすさ</th>
                  <td>カートの割引の計算を直す</td>
                  <td>private メソッドを send で呼ぶテスト／公開メソッドを通すテスト</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            コードはこの部のほかの章と同じ環境（Ruby 4.0.9、Rails 8.1.4.1、MySQL 8.4.13、RSpec）で、5組を1つのアプリケーションにまとめて動かしました。比べるために同じ処理を書き方ごとに別の名前空間（Copied・Merged など）に置いています。
          </p>
          <h3>場面：送料無料の基準を 5,000円に上げる</h3>
          <p>
            このサイトのカートの画面には「あと 1,000円で送料無料」のような案内が出ます。注文を確定するときには、小計が基準以上なら送料 0円、未満なら 500円を請求します。運営担当から「送料無料の基準を 3,000円から 5,000円に上げたい。クーポンの条件は変えない」という依頼が来ました。この依頼を、3つの書き方のコードでそれぞれ反映した後の状態を比べます。
          </p>
          <h3>書き方1：基準を2か所に書いた</h3>
          <p>最初の書き方では、カートの案内（CartView）と注文の確定（Checkout）が、それぞれ基準の数を自分の中に持っています。開発者は確定の送料だけを 5,000円に直し、カートの案内を直し忘れました。</p>
          <Code
            lang="ruby"
            title="app/models/copied/cart_view.rb・app/models/copied/checkout.rb"
            code={`# 書き方1：送料無料の基準を、カートの表示と注文の確定の2か所に書いた（DRY に反する）
module Copied
  class CartView
    def initialize(subtotal) = @subtotal = subtotal

    def shipping_message
      rest = 3_000 - @subtotal # 基準を変えたときに、ここを直し忘れた
      rest.positive? ? "あと#{rest}円で送料無料" : "送料無料"
    end
  end
end

module Copied
  class Checkout
    def initialize(subtotal) = @subtotal = subtotal

    def shipping_fee = @subtotal >= 5_000 ? 0 : 500 # 基準を 3,000円から 5,000円に変えた
  end
end`}
          />
          <h3>書き方2：同じ数を1つの定数にまとめた</h3>
          <p>
            2つ目の書き方では、以前の開発者が「3,000 が3か所にあるのは DRY に反する」と考えて、送料無料の基準とクーポンの条件を1つの定数 MINIMUM_AMOUNT にまとめていました。今回の開発者はこの定数を 5,000 に直しました。
          </p>
          <Code
            lang="ruby"
            title="app/models/merged.rb・app/models/merged/coupon_rule.rb"
            code={`# 書き方2：同じ「3,000円以上」を1つの定数にまとめた（DRY を当てはめすぎた）
module Merged
  MINIMUM_AMOUNT = 5_000 # 送料無料の基準を 3,000円から 5,000円に変えた
end

module Merged
  # クーポン WELCOME300 は「3,000円以上の注文で300円引き」。同じ数なので MINIMUM_AMOUNT を使った
  class CouponRule
    def usable?(subtotal) = subtotal >= MINIMUM_AMOUNT
  end
end

# …（Merged::CartView と Merged::Checkout は、3_000 の代わりに MINIMUM_AMOUNT を読む。省略）`}
          />
          <h3>書き方3：知識ごとに分けた</h3>
          <p>
            3つ目の書き方では送料無料の基準を ShippingPolicy に1か所だけ書き、カートの案内と注文の確定の両方がそれを使います。クーポンの最低金額は、クーポンごとに運営担当が決める値なので、coupons テーブルの minimum_amount 列に持たせます。
          </p>
          <Code
            lang="ruby"
            title="app/models/shipping_policy.rb・cart_view.rb・checkout.rb・coupon.rb"
            code={`# 書き方3：送料無料の基準という1つの知識を1か所に置く。クーポンの最低金額とは分ける
module ShippingPolicy
  FREE_FROM = 5_000
  FEE = 500

  def self.fee_for(subtotal) = subtotal >= FREE_FROM ? 0 : FEE
  def self.rest_for_free(subtotal) = [FREE_FROM - subtotal, 0].max
end

class CartView
  def initialize(subtotal) = @subtotal = subtotal

  def shipping_message
    rest = ShippingPolicy.rest_for_free(@subtotal)
    rest.positive? ? "あと#{rest}円で送料無料" : "送料無料"
  end
end

class Checkout
  def initialize(subtotal) = @subtotal = subtotal

  def shipping_fee = ShippingPolicy.fee_for(@subtotal)
end

# クーポンの最低金額は、クーポンごとに運営担当が決める値。送料の基準とは別の知識なので列に持つ
class Coupon < ApplicationRecord
  validates :code, presence: true, uniqueness: true
  validates :discount, :minimum_amount, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def usable?(subtotal) = subtotal >= minimum_amount
end`}
          />
          <h3>動かして比べる</h3>
          <p>小計 4,000円のカートで、3つの書き方のカートの案内・確定の送料・クーポンを使えるかを表示しました。</p>
          <Code
            lang="ruby"
            title="spec/models/dry_aha_spec.rb"
            code={`require "rails_helper"

# 送料無料の基準を 3,000円から 5,000円に上げた後、小計 4,000円のカートで3つの書き方を比べる
RSpec.describe "DRY と AHA：送料無料の基準を変えた後", type: :model do
  let(:subtotal) { 4_000 }

  it "書き方1（2か所に書いた）：カートの表示と確定の送料が食い違う" do
    message = Copied::CartView.new(subtotal).shipping_message
    fee = Copied::Checkout.new(subtotal).shipping_fee
    puts "  書き方1 カート「#{message}」 確定の送料 #{fee}円"
    expect([message, fee]).to eq ["送料無料", 500]
  end

  it "書き方2（同じ数をまとめた）：クーポンの条件まで変わる" do
    message = Merged::CartView.new(subtotal).shipping_message
    fee = Merged::Checkout.new(subtotal).shipping_fee
    usable = Merged::CouponRule.new.usable?(subtotal)
    puts "  書き方2 カート「#{message}」 確定の送料 #{fee}円 WELCOME300 を使えるか #{usable}"
    expect(usable).to be false
  end

  it "書き方3（知識ごとに分けた）：送料の変更がクーポンに及ばない" do
    coupon = Coupon.create!(code: "WELCOME300", discount: 300, minimum_amount: 3_000)
    message = CartView.new(subtotal).shipping_message
    fee = Checkout.new(subtotal).shipping_fee
    puts "  書き方3 カート「#{message}」 確定の送料 #{fee}円 WELCOME300 を使えるか #{coupon.usable?(subtotal)}"
    expect([message, fee, coupon.usable?(subtotal)]).to eq ["あと1000円で送料無料", 500, true]
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/dry_aha_spec.rb --format documentation）"
            code={`DRY と AHA：送料無料の基準を変えた後
  書き方1 カート「送料無料」 確定の送料 500円
  書き方1（2か所に書いた）：カートの表示と確定の送料が食い違う
  書き方2 カート「あと1000円で送料無料」 確定の送料 500円 WELCOME300 を使えるか false
  書き方2（同じ数をまとめた）：クーポンの条件まで変わる
  書き方3 カート「あと1000円で送料無料」 確定の送料 500円 WELCOME300 を使えるか true
  書き方3（知識ごとに分けた）：送料の変更がクーポンに及ばない

3 examples, 0 failures`}
          />
          <p>
            書き方1ではカートに「送料無料」と表示したのに、確定の画面で 500円の送料を請求しました。利用者から見ると、表示と請求が食い違っています。書き方2では、カートの案内と送料は合いましたが、運営担当が変えないと言ったクーポンの条件まで 5,000円になり、4,000円の注文で WELCOME300 を使えなくなりました。書き方3だけが依頼どおりの結果になりました。図 91-1 は3つの書き方で、どのコードがどの値を読んでいるかを並べたものです。
          </p>
          <Figure n="91-1" title="送料無料の基準を変えた後の3つの書き方" caption="上の実行結果をもとにした図。書き方3の紫の箱が、送料無料の基準を1か所に置いた ShippingPolicy。">
            <DryAhaFigure />
          </Figure>
          <h3>どちらを優先するか</h3>
          <p>
            書き方1は DRY を当てはめなかったために起きた失敗で、書き方2は DRY を当てはめすぎた（AHA に反した）ために起きた失敗です。失敗の向きは逆ですが、2つを分けた問いは同じです。それは「片方を変えたら、もう片方も必ず同じに変えるか」という問いです。カートの案内と確定の送料は、どちらも送料無料の基準という1つの知識を使うので、必ず一緒に変わります。クーポンの最低金額はクーポンごとに運営担当が決める値で、送料の方針とは別の理由で変わります。DRY の章でも、送料無料の基準とクーポンの最低金額を、たまたま同じ数になった例として挙げました（<ChapterLink n={59} section="overuse" />）。
          </p>
          <p>
            DRY を提唱した Hunt と Thomas は、DRY が対象にするのはコードの見た目の重複ではなく、知識の重複だと書いています<Ref n={1} />。AHA の側では、Sandi Metz が「重複は誤った抽象化よりはるかに安い」と書き、引数と条件の分岐が増えた抽象化は、呼び出し側のそれぞれにインライン化して重複に戻すよう勧めています<Ref n={2} />。Kent C. Dodds は AHA（Avoid Hasty Abstractions）という名前で、抽象化を始める時期を教条的に決めず、抽象化が適切だと感じられるまでは重複を恐れない考え方をまとめました<Ref n={3} />。つまり DRY は「同じ知識かどうか」を問い、AHA は「同じ知識だと判断できる材料がそろっているか」を問います。
          </p>
          <p>
            図 91-2 は似たコードや同じ値を見つけたときに、まとめるかどうかを決める問いの順です。問1に「はい」と答えられるものは DRY でまとめ、「いいえ」と答えられるものは同じ数でも別々に書きます。答えられないときは問2に進み、例が増えるまで重複のまま残します。
          </p>
          <Figure n="91-2" title="DRY と AHA：まとめるかどうかの問い" caption="問1は DRY の章、問2と最後の見直しは WET と AHA の章の判断に対応する。">
            <DryAhaJudgeFigure />
          </Figure>
          <p>
            まとめた後の名前も判断の材料になります。書き方3の ShippingPolicy::FREE_FROM は「送料無料の基準」と業務の言葉で読めます。書き方2の MINIMUM_AMOUNT は、何の最低金額なのかを名前で言えません。業務の言葉で名前を付けられないのは、違う知識を1つにまとめた兆候です。問2の「3つ以上」は WET の章で扱った Rule of Three（<ChapterLink n={60} section="meaning" />）の目安で、例が2つのうちは、共通点が偶然なのか規則なのかを見分けにくいことによります。AHA の章（<ChapterLink n={76} section="meaning" />）では、例の数よりも、使い道と違いが分かったかどうかでまとめる時期を決めます。問2の後半の「違いを引数やフラグなしで書けるか」が、その判断に当たります。
          </p>
        </>
      ),
    },
    {
      id: 'kiss-ocp',
      title: 'KISS と OCP：配送方法を足すとき',
      body: (
        <>
          <h3>場面：3種類の配送方法</h3>
          <p>
            このサイトでは注文するときに配送方法を3つから選べます。配送方法によって、画面に出す名前・送料・届く日が違います。通常便の送料は前の節の ShippingPolicy で決まります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">配送方法（id）</th>
                  <th scope="col">送料</th>
                  <th scope="col">届く日</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>通常便（standard）</td>
                  <td>500円（小計 5,000円以上は無料）</td>
                  <td>注文の3日後</td>
                </tr>
                <tr>
                  <td>お急ぎ便（express）</td>
                  <td>900円</td>
                  <td>注文の翌日</td>
                </tr>
                <tr>
                  <td>店舗受け取り（store_pickup）</td>
                  <td>0円</td>
                  <td>注文の2日後</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            KISS（<ChapterLink n={57} />）に従うと、3種類の違いは1つのクラスの case 文に書けば足ります。OCP（<ChapterLink n={64} />）に従うと、配送方法を足すときに既存のコードを書き換えずに済むよう、配送方法ごとのクラスを作って一覧から選ぶ形にします。2通りに書いて比べます。
          </p>
          <h3>書き方A：case 文（KISS を優先）</h3>
          <Code
            lang="ruby"
            title="app/models/delivery.rb"
            code={`# 書き方A（KISS）：配送方法による違いを、1つのクラスの case 文に書く
class Delivery
  KINDS = %w[standard express store_pickup].freeze

  def initialize(kind) = @kind = kind

  def label
    case @kind
    when "standard" then "通常便"
    when "express" then "お急ぎ便"
    when "store_pickup" then "店舗受け取り"
    else raise ArgumentError, "unknown delivery: #{@kind}"
    end
  end

  def fee(subtotal)
    case @kind
    when "standard" then ShippingPolicy.fee_for(subtotal)
    when "express" then 900
    when "store_pickup" then 0
    else raise ArgumentError, "unknown delivery: #{@kind}"
    end
  end

  def arrives_on(ordered_on)
    case @kind
    when "standard" then ordered_on + 3
    when "express" then ordered_on + 1
    when "store_pickup" then ordered_on + 2
    else raise ArgumentError, "unknown delivery: #{@kind}"
    end
  end
end`}
          />
          <p>どの case 文にも else で例外を投げる行を置きました。知らない配送方法が来たら、nil を返して先へ進まずに、その場で止まります。</p>
          <h3>書き方B：配送方法ごとのクラスと一覧（OCP を優先）</h3>
          <Code
            lang="ruby"
            title="app/models/delivery_method.rb・app/models/delivery_method/standard.rb"
            code={`# 書き方B（OCP）：配送方法ごとのクラスを作り、一覧から選ぶ。
# どの配送方法も id・label・fee(subtotal)・arrives_on(ordered_on) に応答する
module DeliveryMethod
  ALL = [Standard.new, Express.new, StorePickup.new].index_by(&:id).freeze

  def self.fetch(id) = ALL.fetch(id)
end

class DeliveryMethod::Standard
  def id = "standard"
  def label = "通常便"
  def fee(subtotal) = ShippingPolicy.fee_for(subtotal)
  def arrives_on(ordered_on) = ordered_on + 3
end

# …（express.rb・store_pickup.rb も同じ形。省略）`}
          />
          <p>
            この形は OCP の章の支払い方法（PaymentMethod::ALL）と同じです。一覧の ALL に並べたクラスだけが使える配送方法で、並び順もこの1行で決まります。
          </p>
          <h3>動かして比べる</h3>
          <p>一覧のすべての配送方法について、2つの書き方が同じ結果を返すかを確かめ、読む量を数えました。数えるのには KISS の章で作った script/complexity.rb（コメントと空行を除いた行数と、分岐の数を数えるスクリプト）を使っています。</p>
          <Code
            lang="ruby"
            title="spec/models/kiss_ocp_spec.rb"
            code={`require "rails_helper"

RSpec.describe "KISS と OCP：配送方法", type: :model do
  let(:ordered_on) { Date.new(2026, 11, 21) }

  # 一覧のすべての配送方法について、2つの書き方が同じ結果を返すことを確かめる（契約のテストも兼ねる）
  Delivery::KINDS.each do |kind|
    it "#{kind}：書き方A と書き方B が同じ結果を返す" do
      a = Delivery.new(kind)
      b = DeliveryMethod.fetch(kind)
      row = ->(d) { [d.label, d.fee(4_000), d.fee(6_000), d.arrives_on(ordered_on).to_s] }
      puts "  #{kind.ljust(12)} A #{row.(a).inspect}"
      expect(row.(b)).to eq row.(a)
    end
  end

  it "2つの書き方の一覧が同じ種類を持つ" do
    expect(DeliveryMethod::ALL.keys).to eq Delivery::KINDS
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/kiss_ocp_spec.rb と ruby script/complexity.rb）"
            code={`  standard     A ["通常便", 500, 0, "2026-11-24"]
  express      A ["お急ぎ便", 900, 900, "2026-11-22"]
  store_pickup A ["店舗受け取り", 0, 0, "2026-11-23"]

4 examples, 0 failures

$ ruby script/complexity.rb app/models/delivery.rb
app/models/delivery.rb                     28 行  分岐  9
合計                                         28 行  分岐  9  ファイル 1  クラス・モジュール 1

$ ruby script/complexity.rb app/models/delivery_method.rb app/models/delivery_method/standard.rb \\
    app/models/delivery_method/express.rb app/models/delivery_method/store_pickup.rb
app/models/delivery_method.rb               4 行  分岐  0
app/models/delivery_method/standard.rb      6 行  分岐  0
app/models/delivery_method/express.rb       6 行  分岐  0
app/models/delivery_method/store_pickup.rb    6 行  分岐  0
合計                                         22 行  分岐  0  ファイル 4  クラス・モジュール 4`}
          />
          <p>
            2つの書き方は同じ結果を返しました。行数は書き方B のほうが少なく、分岐もありません。一方で、配送方法の違いを全部読むには、書き方B では4つのファイルを開きます。書き方A は1つのファイルの中で、3つの配送方法の送料や届く日を上下に並べて見比べられます。
          </p>
          <h3>4つ目の配送方法を足す</h3>
          <p>コンビニ受け取り（送料 300円、注文の4日後）を足す依頼が来ました。2つの書き方で足した差分です。</p>
          <Code
            lang="text"
            title="変更の差分（git diff --no-index で、3種類のときのファイルと比べた）"
            code={`--- a/three/app/models/delivery.rb
+++ b/four/app/models/delivery.rb
-  KINDS = %w[standard express store_pickup].freeze
+  KINDS = %w[standard express store_pickup konbini_pickup].freeze
 …
     when "store_pickup" then "店舗受け取り"
+    when "konbini_pickup" then "コンビニ受け取り"
 …
     when "store_pickup" then 0
+    when "konbini_pickup" then 300
 …
     when "store_pickup" then ordered_on + 2
+    when "konbini_pickup" then ordered_on + 4

--- /dev/null
+++ b/four/app/models/delivery_method/konbini_pickup.rb
+class DeliveryMethod::KonbiniPickup
+  def id = "konbini_pickup"
+  def label = "コンビニ受け取り"
+  def fee(_subtotal) = 300
+  def arrives_on(ordered_on) = ordered_on + 4
+end

--- a/three/app/models/delivery_method.rb
+++ b/four/app/models/delivery_method.rb
-  ALL = [Standard.new, Express.new, StorePickup.new].index_by(&:id).freeze
+  ALL = [Standard.new, Express.new, StorePickup.new, KonbiniPickup.new].index_by(&:id).freeze

$ git diff --no-index --stat three four
 {three => four}/app/models/delivery.rb                         | 5 ++++-
 /dev/null => four/app/models/delivery_method/konbini_pickup.rb | 6 ++++++
 {three => four}/app/models/delivery_method.rb                  | 2 +-
 3 files changed, 11 insertions(+), 2 deletions(-)`}
          />
          <p>
            書き方A は既存のファイル1つの4か所を書き換えました。書き方B は新しいファイルを1つ作り、既存のファイルは一覧の1行だけを書き換えました。OCP の言う「既存のコードを変えずに拡張する」は、書き方B では一覧の1行を除いて成り立っています。ただし、この大きさでは差は小さく、どちらも1回の変更で読み切れます。
          </p>
          <p>足し忘れたときの違いも確かめました。書き方A で arrives_on の when を1行書き忘れた場合と、書き方B で KonbiniPickup の arrives_on を書き忘れた場合に、上の spec を実行した結果です。</p>
          <Code
            lang="text"
            title="実行結果（足し忘れたファイルに置き換えて bundle exec rspec spec/models/kiss_ocp_spec.rb を2回）"
            code={`# 書き方A で arrives_on の when "konbini_pickup" を書き忘れた
  1) KISS と OCP：配送方法 konbini_pickup：書き方A と書き方B が同じ結果を返す
     Failure/Error: else raise ArgumentError, "unknown delivery: #{@kind}"

     ArgumentError:
       unknown delivery: konbini_pickup

5 examples, 1 failure

# 書き方B で KonbiniPickup#arrives_on を書き忘れた
  1) KISS と OCP：配送方法 konbini_pickup：書き方A と書き方B が同じ結果を返す
     Failure/Error: row = ->(d) { [d.label, d.fee(4_000), d.fee(6_000), d.arrives_on(ordered_on).to_s] }

     NoMethodError:
       undefined method 'arrives_on' for an instance of DeliveryMethod::KonbiniPickup

5 examples, 1 failure`}
          />
          <p>
            どちらの足し忘れも一覧のすべての配送方法を回すテストで見つかりました。書き方A は else の例外、書き方B は NoMethodError で止まります。足し忘れを防いでいるのは case 文かクラスかではなく、一覧を回すテストのほうです。
          </p>
          <h3>どちらを優先するか</h3>
          <p>
            この場面の差は違いを書く場所の数と、種類を足す頻度で決まります。図 91-3 はこの2つを軸にした目安です。この章の配送方法は、違いが1つのファイルに収まり、足す依頼もまれなので、左下の case 文が向いています。OCP の章の支払い方法では、違いが手数料・支払い期限・メールの案内・画面の選択肢の4つの場所に分かれ、種類も順に増えてきたので、右上の形にしました（<ChapterLink n={64} section="overuse" />）。
          </p>
          <Figure n="91-3" title="KISS と OCP：種類を足す頻度と、違いを書くファイルの数" caption="模式図。OCP の章の判断の図と同じ軸を、違いを書くファイルの数で言い換えた。">
            <KissOcpJudgeFigure />
          </Figure>
          <p>
            KISS の章では、種類が7つに増えても case 文に足し続けたメソッドの分岐が 19 になる例を示しました（<ChapterLink n={57} section="overuse" />）。case 文で始めて、違いが複数のファイルに広がったときや、種類ごとに使う値と計算が違ってきたときに書き方B に移ります。移るときは、先に一覧のすべての種類を回すテストを置き、そのテストが通るまま case 文を種類ごとのクラスに置き換えます。この置き換えは Fowler のリファクタリングのカタログでは Replace Conditional with Polymorphism（条件分岐をポリモーフィズムに置き換える）と呼ばれています<Ref n={4} />。反対に、増える見込みのない種類のために最初から書き方B を作ると、読むファイルが増えるだけで KISS と YAGNI に反します。
          </p>
        </>
      ),
    },
    {
      id: 'yagni-dip',
      title: 'YAGNI と DIP：SMS 送信会社の SDK を使うとき',
      body: (
        <>
          <h3>場面：発送したら SMS で知らせる</h3>
          <p>
            商品を発送したら、注文した人の携帯電話に SMS で知らせることになりました。SMS の送信会社は1社で、その会社が配っている Ruby の SDK（API を呼ぶためのライブラリ。gem として入れる）を使います。この章では SDK の代わりに、同じ形のクラスを lib/sms_vendor に置きました。v1 は <code>send_message(to:, text:)</code> で送り、v2 ではメソッドの名前が <code>deliver(phone:, body:)</code> に変わります。環境変数 SMS_SDK に v2 を入れると v2 として読み込みます。
          </p>
          <Code
            lang="ruby"
            title="lib/sms_vendor.rb・lib/sms_vendor/client_v1.rb"
            code={`# SMS 送信会社の SDK の代わり（本物の gem の形をまねた）。SMS_SDK=v2 で v2 の SDK として読み込む
module SmsVendor
  Client = ENV["SMS_SDK"] == "v2" ? ClientV2 : ClientV1
end

module SmsVendor
  # v1：send_message(to:, text:)
  class ClientV1
    def initialize(api_key:) = @api_key = api_key

    def send_message(to:, text:)
      raise ArgumentError, "invalid phone" unless to.match?(/\\A0\\d{9,10}\\z/)

      { "status" => "queued", "to" => to, "length" => text.size } # 本物は HTTP で送信会社の API を呼ぶ
    end
  end
end

# …（client_v2.rb は deliver(phone:, body:) を持つ。省略）`}
          />
          <p>
            YAGNI（<ChapterLink n={58} />）に従うと、送信会社が1社のうちは、業務のクラスから SDK を直接呼べば足ります。DIP（<ChapterLink n={67} />）に従うと、発送の通知という業務の方針を、特定の会社の SDK に直接依存させないようにします。
          </p>
          <h3>書き方A：業務のクラスが SDK を直接呼ぶ（YAGNI を優先）</h3>
          <Code
            lang="ruby"
            title="app/models/direct/shipment_notice.rb・spec/models/direct_shipment_notice_spec.rb"
            code={`# 書き方A（YAGNI を優先）：発送の通知が SMS の SDK を直接呼ぶ
module Direct
  class ShipmentNotice
    def initialize(order) = @order = order

    def deliver
      client = SmsVendor::Client.new(api_key: ENV.fetch("SMS_API_KEY", "test-key"))
      client.send_message(to: @order.phone, text: "ご注文 #{@order.id} の商品を発送しました")
    end
  end
end

RSpec.describe Direct::ShipmentNotice, type: :model do
  let(:order) { Order.new(id: 42, phone: "09012345678") }

  it "SDK の send_message に電話番号と本文を渡す" do
    client = instance_double(SmsVendor::Client)
    allow(SmsVendor::Client).to receive(:new).and_return(client)
    expect(client).to receive(:send_message).with(to: "09012345678", text: "ご注文 42 の商品を発送しました")

    described_class.new(order).deliver
  end
end`}
          />
          <p>
            テストでは SDK を本当に呼ばないように、<code>instance_double</code> で作った代わりのオブジェクトを <code>SmsVendor::Client.new</code> から返しています。instance_double は、スタブしたメソッドが本物のクラスにあるかと、引数の形が合うかを確かめるテストダブルです<Ref n={7} />。
          </p>
          <h3>書き方B：SDK を1つのクラスに集め、外から渡す（DIP を優先）</h3>
          <Code
            lang="ruby"
            title="app/models/shipment_notice.rb・app/models/vendor_sms_sender.rb"
            code={`# 書き方B（DIP を優先）：発送の通知は「SMS を送るもの」に依存し、SDK を知らない
class ShipmentNotice
  def initialize(order, sms: VendorSmsSender.new)
    @order = order
    @sms = sms
  end

  def deliver = @sms.deliver(to: @order.phone, body: "ご注文 #{@order.id} の商品を発送しました")
end

# SDK を呼ぶのはこのクラスだけ。SDK の更新で直すのはここになる
class VendorSmsSender
  def initialize(client: SmsVendor::Client.new(api_key: ENV.fetch("SMS_API_KEY", "test-key")))
    @client = client
  end

  def deliver(to:, body:) = @client.send_message(to:, text: body)
end`}
          />
          <Code
            lang="ruby"
            title="spec/support/fake_sms_sender.rb・spec/models/shipment_notice_spec.rb・spec/models/vendor_sms_sender_spec.rb"
            code={`# テストで使う SMS の送り手。送った内容を覚えるだけ
class FakeSmsSender
  attr_reader :sent

  def initialize = @sent = []
  def deliver(to:, body:) = @sent << { to:, body: }
end

# SMS の送り手が守る取り決め。VendorSmsSender と FakeSmsSender の両方で確かめる
RSpec.shared_examples "SMS の送り手" do
  it "deliver(to:, body:) に応答する" do
    expect { sender.deliver(to: "09012345678", body: "テスト") }.not_to raise_error
  end
end

RSpec.describe ShipmentNotice, type: :model do
  it "SMS の送り手に電話番号と本文を渡す" do
    sms = FakeSmsSender.new
    described_class.new(Order.new(id: 42, phone: "09012345678"), sms:).deliver
    expect(sms.sent).to eq [{ to: "09012345678", body: "ご注文 42 の商品を発送しました" }]
  end
end

RSpec.describe VendorSmsSender, type: :model do
  it_behaves_like "SMS の送り手" do
    let(:sender) { described_class.new }
  end
end

RSpec.describe FakeSmsSender do
  it_behaves_like "SMS の送り手" do
    let(:sender) { described_class.new }
  end
end`}
          />
          <p>
            ShipmentNotice は <code>deliver(to:, body:)</code> に応答するオブジェクトなら何でも受け取ります。Ruby ではこの取り決めを基底クラスやインターフェースとして書かなくても、キーワード引数の既定値で本物を渡し、テストでは FakeSmsSender を渡せます。取り決めは <code>shared_examples</code>（複数のクラスで同じテストを使う RSpec の機能）で、本物と Fake の両方について確かめています<Ref n={8} />。
          </p>
          <h3>SDK を v2 に上げる</h3>
          <p>送信会社から、v1 の提供を終えるので v2 に上げてほしいと連絡が来ました。SDK を v2 にしてテストを実行します。</p>
          <Code
            lang="text"
            title="実行結果（SMS_SDK=v2 bundle exec rspec spec/models/direct_shipment_notice_spec.rb spec/models/shipment_notice_spec.rb spec/models/vendor_sms_sender_spec.rb）"
            code={`F.F.

Failures:

  1) Direct::ShipmentNotice SDK の send_message に電話番号と本文を渡す
     Failure/Error: expect(client).to receive(:send_message).with(to: "09012345678", text: "ご注文 42 の商品を発送しました")
       the SmsVendor::ClientV2 class does not implement the instance method: send_message

  2) VendorSmsSender behaves like SMS の送り手 deliver(to:, body:) に応答する
     Failure/Error: expect { sender.deliver(to: "09012345678", body: "テスト") }.not_to raise_error

       expected no Exception, got #<NoMethodError: undefined method 'send_message' for an instance of SmsVendor::ClientV2> with backtrace:
         # ./app/models/vendor_sms_sender.rb:7:in 'VendorSmsSender#deliver'
 …（省略）

4 examples, 2 failures`}
          />
          <p>
            書き方A では、業務のクラス Direct::ShipmentNotice のテストが失敗しました。instance_double が、v2 の SDK に send_message が無いことを見つけています。書き方B では、失敗したのは VendorSmsSender の取り決めのテストだけで、業務のクラス ShipmentNotice のテストは通りました。v2 に合わせて直した差分の大きさは次のとおりです。
          </p>
          <Code
            lang="text"
            title="実行結果（git diff --no-index --stat で、直す前と後のファイルを比べた。直した後は SMS_SDK=v2 で 4 examples, 0 failures）"
            code={` {v1 => v2}/app/models/direct/shipment_notice.rb       | 2 +-
 {v1 => v2}/app/models/vendor_sms_sender.rb            | 2 +-
 {v1 => v2}/spec/models/direct_shipment_notice_spec.rb | 4 ++--
 3 files changed, 4 insertions(+), 4 deletions(-)`}
          />
          <p>
            書き方A は業務のクラスとそのテストの2ファイル、書き方B は VendorSmsSender の1行だけを直しました。この例では SMS を送るクラスが1つなので差は1ファイルです。発送・入金の確認・パスワードの再設定のように SMS を送る業務のクラスが増えると、書き方A では SDK の更新のたびにその数だけ業務のクラスとテストを直すことになります。
          </p>
          <h3>先に作る費用</h3>
          <Code
            lang="text"
            title="実行結果（ruby script/complexity.rb で、2つの書き方のファイルを数えた）"
            code={`app/models/direct/shipment_notice.rb        9 行  分岐  0
合計                                          9 行  分岐  0  ファイル 1  クラス・モジュール 2

app/models/shipment_notice.rb               7 行  分岐  0
app/models/vendor_sms_sender.rb             6 行  分岐  0
spec/support/fake_sms_sender.rb            10 行  分岐  0
合計                                         23 行  分岐  0  ファイル 3  クラス・モジュール 3`}
          />
          <p>
            書き方B は SDK の更新では有利でしたが、最初に書く量は書き方A の約2.5倍で、ファイルも3つに増えました。SDK を呼ぶ業務のクラスが1つで、送信会社を替える予定も無いうちは、書き方A でも SDK の更新で直すのは2ファイルです。
          </p>
          <h3>どちらを優先するか</h3>
          <p>
            Martin は DIP を「上位のモジュールは下位のモジュールに依存してはならない。どちらも抽象に依存すべきである」と書きました<Ref n={6} />。Fowler は、YAGNI が当てはまるのは見込みの機能のために作る仕組みだけで、ソフトウェアを変更しやすくするための作業には当てはまらないと書いています<Ref n={5} />。この2つを合わせると、判断の分かれ目は「取り決めを挟むことが、見込みの機能なのか、変更しやすくする作業なのか」になります。
          </p>
          <p>
            図 91-4 は依存先にどこまで取り決めを挟むかを3つの段階に分けたものです。変更を自分たちか Rails が決める依存（Active Record・現在時刻・ログ）は段階0にとどめます。DIP の章ではこれらまで取り決めの後ろに置いたために、列を1つ使うだけで4つのファイルを直す例を示しました（<ChapterLink n={67} section="overuse" />）。外部の会社が変更を決める SDK を業務のクラスから呼ぶなら、段階1（書き方B）の費用は Ruby では小さく、SDK の更新の影響を1つのクラスに収められます。取り決めを共通のテストで確かめ、複数の実装を持つ段階2は、2社目の採用が決まったときや、Fake と本物の違いで不具合が出たときに上がります。
          </p>
          <Figure n="91-4" title="YAGNI と DIP：外部の依存先に取り決めを挟む3つの段階" caption="模式図。DIP の章の判断の図（変更を誰が決めるか・差し替える必要の大きさ）を、段階として並べ直した。">
            <YagniDipFigure />
          </Figure>
          <p>
            YAGNI の章の判断の目安は「必要になる確かさ」と「後から足す費用」の2つでした（<ChapterLink n={58} section="overuse" />）。SDK の更新は、送信会社が決めるので、いつかは確実に起きます。後から段階1に移す費用は、SDK を直接呼ぶ業務のクラスの数に比例して増えます。この2つの問いに答えると、書き方A から始めた場合でも、SDK を呼ぶ業務のクラスが2つ目になった時点が段階1に移る目安になります。
          </p>
        </>
      ),
    },
    {
      id: 'failfast-graceful',
      title: 'Fail Fast と Graceful Degradation：商品ページが使う外部 API が止まったとき',
      body: (
        <>
          <h3>場面：商品ページと注文の確定が外部 API を呼ぶ</h3>
          <p>
            このサイトの商品ページには商品の名前と価格のほかに、在庫の有無とおすすめの商品を表示します。名前と価格は自分たちの MySQL の products テーブルから読みます。在庫は倉庫の会社が提供する在庫 API に、おすすめは別の会社が提供するおすすめ API に、ページを表示するたびに問い合わせます。注文を確定する処理でも、在庫 API に在庫を問い合わせてから注文を作ります。
          </p>
          <p>
            Fail Fast（<ChapterLink n={79} />）は問題を見つけたらその場で処理を止め、失敗を見える形で伝えるよう勧めます。Graceful Degradation（<ChapterLink n={91} />）は、一部の機能が失敗しても、できる範囲でサービスを続けるよう勧めます。外部 API が応答しないとき、前者に従えばページの表示を止め、後者に従えば表示を続けることになります。2つの API のクライアントは次の形です。
          </p>
          <Code
            lang="ruby"
            title="app/clients/stock_client.rb"
            code={`# 倉庫の在庫 API のクライアント。1秒で応答がなければ Faraday::TimeoutError
class StockClient
  def initialize
    @conn = Faraday.new(url: ENV.fetch("STOCK_API_URL", "http://stock.example.test"), request: { timeout: 1 }) do |f|
      f.response :raise_error
    end
  end

  def available(sku) = JSON.parse(@conn.get("/stocks/#{sku}").body).fetch("available")
end

# …（recommendation_client.rb も同じ形。for(sku) がおすすめの商品の SKU の配列を返す。省略）`}
          />
          <p>
            <code>f.response :raise_error</code> を付けると、Faraday は 4xx と 5xx の応答を例外にします。待ち時間を過ぎたときや接続できないときも例外になります。どの例外も Faraday::Error のサブクラスです。このクライアントを使う商品ページを、3通りに書いて比べます。
          </p>
          <h3>書き方A：どの失敗でも止める（Fail Fast だけを優先）</h3>
          <Code
            lang="ruby"
            title="app/controllers/strict/products_controller.rb"
            code={`# 書き方A（Fail Fast だけ）：どの外部 API が失敗しても、そのまま例外にする
class Strict::ProductsController < ApplicationController
  def show
    product = Product.find(params[:id])
    render json: {
      name: product.name, price: product.price,
      available: StockClient.new.available(product.sku),
      recommendations: RecommendationClient.new.for(product.sku)
    }
  end
end`}
          />
          <p>どちらかの API が失敗すると、例外がアクションの外へ出て、ページ全体が 500 になります。</p>
          <h3>書き方B：どの失敗でも続ける（Graceful Degradation だけを優先）</h3>
          <Code
            lang="ruby"
            title="app/controllers/lenient/products_controller.rb"
            code={`# 書き方B（Graceful Degradation を当てはめすぎ）：どの失敗も握りつぶして表示を続ける
class Lenient::ProductsController < ApplicationController
  def show
    product = Product.find(params[:id])
    available = begin
      StockClient.new.available(product.sku)
    rescue StandardError
      true # ページを止めないために「在庫あり」として扱う
    end
    recommendations = begin
      RecommendationClient.new.for(product.sku)
    rescue StandardError
      []
    end
    render json: { name: product.name, price: product.price, available:, recommendations: }
  end
end`}
          />
          <p>どちらの API が失敗しても例外を捕まえ、決めておいた値で表示を続けます。在庫 API が失敗したときは、ページを止めないために「在庫あり」として扱っています。</p>
          <h3>書き方C：機能ごとに、止めるか続けるかを決める</h3>
          <Code
            lang="ruby"
            title="app/controllers/products_controller.rb・app/controllers/orders_controller.rb"
            code={`# 書き方C：補助の機能（おすすめ）は代わりの表示で続け、購入に関わる在庫は「確認できない」と表示して買わせない。
# どちらも失敗は Rails.error に報告する
class ProductsController < ApplicationController
  def show
    product = Product.find(params[:id])
    stock = Rails.error.handle(Faraday::Error, fallback: -> { "unknown" }, context: { sku: product.sku }) do
      StockClient.new.available(product.sku) ? "in_stock" : "out_of_stock"
    end
    recommendations = Rails.error.handle(Faraday::Error, fallback: -> { [] }, context: { sku: product.sku }) do
      RecommendationClient.new.for(product.sku)
    end
    render json: { name: product.name, price: product.price, stock:, purchasable: stock == "in_stock", recommendations: }
  end
end

# 注文の確定（Fail Fast）：在庫を確認できなければ注文を作らず、503 を返す
class OrdersController < ApplicationController
  rescue_from Faraday::Error do |error|
    Rails.error.report(error, context: { action: "orders#create" })
    render json: { error: "在庫を確認できないため、注文を受け付けられませんでした" }, status: :service_unavailable
  end

  def create
    product = Product.find(params[:product_id])
    unless StockClient.new.available(product.sku)
      return render json: { error: "在庫がありません" }, status: :unprocessable_content
    end

    order = product.orders.create!(quantity: params[:quantity])
    render json: { id: order.id }, status: :created
  end
end`}
          />
          <p>
            <code>Rails.error.handle</code> は、ブロックの中で起きた例外のうち、引数に書いたクラスの例外だけを捕まえます。捕まえた例外を Rails のエラーの報告の仕組み（Rails.error）に handled: true（アプリが処理した失敗）として報告し、fallback に渡した処理の結果を返します<Ref n={10} />
            <Ref n={11} />。報告を受け取るのは Rails.error.subscribe で登録した購読者で、エラーを監視するサービスの gem などが購読者を登録します。書き方C ではおすすめの失敗を空の配列に、在庫の失敗を unknown（確認できない）に置き換えて表示を続け、在庫を確認できない商品は購入できない（purchasable: false）として返します。注文の確定は rescue_from で Faraday::Error を受け取り、Rails.error.report で報告してから 503（一時的に処理できない）を返します。注文は作りません。
          </p>
          <h3>動かして比べる</h3>
          <p>
            request spec で、WebMock（HTTP の要求を横取りして、決めた応答や失敗を返すライブラリ）を使って API の失敗を再現しました。<code>to_timeout</code> は Net::HTTP に接続の待ち時間切れ（Net::OpenTimeout）を起こさせます<Ref n={16} />。Faraday はこれを Faraday::ConnectionFailed に変えます。テストの環境の既定（show_exceptions が :rescuable）では Faraday の例外が応答にならずに spec へそのまま出てくるので、本番と同じく 500 の応答に変える設定を加えています。
          </p>
          <Code
            lang="ruby"
            title="spec/requests/failfast_graceful_spec.rb"
            code={`require "rails_helper"
require "webmock/rspec"

RSpec.describe "Fail Fast と Graceful Degradation：商品ページ", type: :request do
  # Rails.error に報告されたエラーを集める購読者
  let(:reports) { [] }
  let(:subscriber) do
    Class.new do
      def initialize(list) = @list = list
      def report(error, handled:, severity:, context:, source:) = @list << "#{error.class.name}(handled: #{handled})"
    end.new(reports)
  end
  # …（商品 MUG-01 の作成、stock_url と recommend_url、Rails.error.subscribe、
  #     捕まえなかった例外を本番と同じく 500 の応答にする設定は省略）

  def show_all(label)
    { "書き方A" => "/strict/products/#{product.id}", "書き方B" => "/lenient/products/#{product.id}",
      "書き方C" => "/products/#{product.id}" }.to_h do |name, path|
      reports.clear
      get path
      body = response.status == 200 ? response.parsed_body.except("name", "price") : "（ページを表示できない）"
      puts "  #{label} #{name}: #{response.status} #{body} 報告 #{reports.size}件 #{reports.join(" ")}"
      [name, response.status]
    end
  end

  it "おすすめ API がタイムアウトしたとき" do
    stub_request(:get, stock_url).to_return(body: { available: true }.to_json)
    stub_request(:get, recommend_url).to_timeout
    expect(show_all("おすすめが失敗")).to eq("書き方A" => 500, "書き方B" => 200, "書き方C" => 200)
  end

  it "在庫 API がタイムアウトしたとき（実際の在庫は 0）" do
    stub_request(:get, stock_url).to_timeout
    stub_request(:get, recommend_url).to_return(body: { items: ["MUG-02"] }.to_json)
    expect(show_all("在庫が失敗")).to eq("書き方A" => 500, "書き方B" => 200, "書き方C" => 200)
  end

  it "注文の確定で在庫 API がタイムアウトしたとき" do
    stub_request(:get, stock_url).to_timeout
    post "/orders", params: { product_id: product.id, quantity: 1 }, as: :json
    puts "  注文の確定: #{response.status} #{response.parsed_body} 作られた注文 #{Order.count}件 報告 #{reports.join(" ")}"
    expect(response).to have_http_status(:service_unavailable)
    expect(Order.count).to eq 0
  end
end`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/requests/failfast_graceful_spec.rb --format documentation）"
            code={`Fail Fast と Graceful Degradation：商品ページ
  おすすめが失敗 書き方A: 500 （ページを表示できない） 報告 1件 Faraday::ConnectionFailed(handled: false)
  おすすめが失敗 書き方B: 200 {"available" => true, "recommendations" => []} 報告 0件
  おすすめが失敗 書き方C: 200 {"stock" => "in_stock", "purchasable" => true, "recommendations" => []} 報告 1件 Faraday::ConnectionFailed(handled: true)
  おすすめ API がタイムアウトしたとき
  在庫が失敗 書き方A: 500 （ページを表示できない） 報告 1件 Faraday::ConnectionFailed(handled: false)
  在庫が失敗 書き方B: 200 {"available" => true, "recommendations" => ["MUG-02"]} 報告 0件
  在庫が失敗 書き方C: 200 {"stock" => "unknown", "purchasable" => false, "recommendations" => ["MUG-02"]} 報告 1件 Faraday::ConnectionFailed(handled: true)
  在庫 API がタイムアウトしたとき（実際の在庫は 0）
  注文の確定: 503 {"error" => "在庫を確認できないため、注文を受け付けられませんでした"} 作られた注文 0件 報告 Faraday::ConnectionFailed(handled: true)
  注文の確定で在庫 API がタイムアウトしたとき

3 examples, 0 failures`}
          />
          <p>
            書き方A は、おすすめという補助の機能が失敗しただけで、在庫も価格も読めていたページを表示できませんでした。書き方B はどちらの失敗でもページを表示しましたが、在庫 API が失敗したときに available: true を返しました。実際の在庫が0でも、利用者には在庫があるように見え、購入の手続きに進めます。しかも報告は0件なので、在庫 API が止まっていることに開発者が気づけません。書き方C はページを表示したうえで、確かめられなかった在庫を「確認できない」と示して購入の操作を止め、失敗を1件ずつ報告しました。注文の確定は 503 を返し、注文を作りませんでした。図 91-5 は書き方C で呼び出し元と依存先の組ごとに決めた扱いです。
          </p>
          <Figure n="91-5" title="書き方C：呼び出し元と依存先の組ごとの、失敗したときの扱い" caption="上の実行結果をもとにした図。同じ在庫 API でも、商品ページは表示を続け、注文の確定は止める。">
            <FailFastFigure />
          </Figure>
          <h3>どちらを優先するか</h3>
          <p>
            Fail Fast という呼び名を広めた Jim Shore の記事は、問題を自動的に回避するソフトウェアは、エラーの後も動き続け、後になって奇妙な形で失敗する（failing slowly）と書いています<Ref n={9} />。同じ記事は、利用者の前でプログラムが落ちることも適切ではないとして、予期しない例外を受け取って開発者に知らせる全体の例外ハンドラーを置き、それ以外の場所ではすべての例外を捕まえるハンドラーを避けるよう勧めています<Ref n={9} />。書き方B の <code>rescue StandardError</code> は、この「すべての例外を捕まえるハンドラー」に当たります。外部 API の失敗だけでなく、メソッド名の書き間違い（NoMethodError）のような自分たちのコードの誤りまで「在庫あり」に変えてしまいます。
          </p>
          <p>
            Rails では、捕まえなかった例外を 500 の応答に変えるミドルウェアと Rails.error が、全体の例外ハンドラーの役目をします。書き方A の報告は、リクエストの処理を囲むミドルウェア（ActionDispatch::Executor）が handled: false（アプリが処理しなかった失敗）として送ったものです<Ref n={12} />。ただし、見つからないレコードの例外（404 になる ActiveRecord::RecordNotFound）のように、500 にならない例外は報告しません<Ref n={10} />。
          </p>
          <p>
            書き方C の分け方は次の2つの問いで決めました。1つ目は、失敗の原因が外部のサービスか、自分たちのコードの誤りかです。表示を続ける対象は外部のサービスの失敗に限ります。<code>Rails.error.handle</code> は例外のクラスを書かないと StandardError とそのサブクラスの例外をすべて捕まえるので、Faraday::Error のように外部の失敗を表すクラスを書きます<Ref n={11} />。2つ目は、その情報が無くても、ページや操作の目的を果たせるかです。おすすめが無くても商品は買えるので、表示を続けます。在庫を確かめられないまま注文を受けると、在庫の無い注文が残るので、注文の確定は止めます。商品ページはその中間で、表示は続け、購入の操作だけを止めました。図 91-6 は機能の種類ごとに2つの問いに答えた結果です。
          </p>
          <Figure n="91-6" title="Fail Fast と Graceful Degradation：機能ごとの判断" caption="この章の商品ページと注文の確定を、機能の種類に広げた表。">
            <FailFastTable />
          </Figure>
          <p>
            表の最後の行の <code>Rails.error.unexpected</code> は、起きないはずの状態（前提が破れた状態）を見つけたときに呼ぶメソッドです。開発とテストでは例外を投げて処理を止め、本番では報告だけをして処理を続けます<Ref n={10} />
            <Ref n={11} />。止めるかどうかは、config.consider_all_requests_local が true の環境かどうかで決まります。新しく作ったアプリでは開発とテストの環境で true、本番の環境で false です<Ref n={13} />。同じ前提の破れを、開発中は Fail Fast で見つけ、本番では Graceful Degradation で利用者への影響を抑える使い方です。
          </p>
          <p>
            2つの原則は反対の方向を勧めますが、どちらに従う場合でも失敗を報告する点は同じです。続ける側で報告を省くと、書き方B のように、利用者には在庫があるように見えたまま、開発者は在庫 API が止まっていることを知りません。それぞれの書き方は Fail Fast の章の Rails の節（<ChapterLink n={79} section="rails" />）と、Graceful Degradation の章の直し方（<ChapterLink n={91} section="apply" />）で詳しく扱っています。
          </p>
          <Callout kind="v72" title="Rails.error.unexpected は Rails 7.2 から">
            <p>
              Rails.error の handle・record・report は Rails 7.1 のガイドにも載っていますが、unexpected は 7.1 のガイドには無く、7.2 のガイドから載っています<Ref n={14} />
              <Ref n={15} />。Rails 7.1 以前のアプリでは、開発とテストでは例外を投げ、本番では Rails.error.report で報告する分岐を自分で書きます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'encapsulation-testing',
      title: 'Encapsulation とテストのしやすさ：カートの割引を確かめるテスト',
      body: (
        <>
          <h3>場面：同じ商品を3個以上買うと1割引く</h3>
          <p>
            このサイトには同じ商品を3個以上買うと、その商品の代金から10%を引く「まとめ買い割引」があります。カートの合計を計算する Cart は、小計（subtotal）と合計（total）を公開し、割引の計算（bulk_discount）を private にしています。Encapsulation（<ChapterLink n={71} />）に従い、外から使う操作だけを公開した形です。
          </p>
          <Code
            lang="ruby"
            title="app/models/cart.rb"
            code={`# カートの合計。同じ商品を3個以上買うと、その商品の代金から10%引く（1円未満は切り捨て）
class Cart
  Item = Data.define(:name, :price, :quantity)

  def initialize(items) = @items = items

  def subtotal = @items.sum { it.price * it.quantity }

  def total = subtotal - @items.sum { bulk_discount(it.price, it.quantity) }

  private

  def bulk_discount(price, quantity) = quantity >= 3 ? price * quantity / 10 : 0
end`}
          />
          <p>
            Item は Data.define で作った値だけを持つ小さなクラスです。ブロックの中の <code>it</code> は名前を付けずにブロックの引数を指す Ruby 3.4 からの書き方です<Ref n={18} />。
          </p>
          <p>
            割引の規則をテストで直接確かめたいと考えると、private の bulk_discount を呼びたくなります。Ruby では <code>send</code> を使うと private のメソッドも外から呼べます（<code>public_send</code> は public のメソッドだけを呼びます）<Ref n={17} />。テストを書きやすくするために send で private のメソッドを呼ぶテストと、公開した total を通すテストの2通りを書きました。
          </p>
          <h3>書き方A：private のメソッドを send で呼ぶテスト</h3>
          <Code
            lang="ruby"
            title="spec/models/cart_private_spec.rb"
            code={`require "rails_helper"

# 書き方A：private メソッドを send で呼んでテストする
RSpec.describe Cart, "（private メソッドのテスト）", type: :model do
  it "3個以上なら代金の10%を引く" do
    expect(Cart.new([]).send(:bulk_discount, 1_000, 3)).to eq 300
  end

  it "2個までは引かない" do
    expect(Cart.new([]).send(:bulk_discount, 1_000, 2)).to eq 0
  end
end`}
          />
          <h3>書き方B：公開した total を通すテスト</h3>
          <Code
            lang="ruby"
            title="spec/models/cart_spec.rb"
            code={`require "rails_helper"

# 書き方B：公開された振る舞い（total）を通じてテストする
RSpec.describe Cart, type: :model do
  let(:mug) { Cart::Item.new(name: "マグカップ", price: 1_000, quantity: 3) }
  let(:plate) { Cart::Item.new(name: "小皿", price: 800, quantity: 2) }

  it "3個以上の商品は代金の10%を引いた合計になる" do
    expect(Cart.new([mug]).total).to eq 2_700
  end

  it "2個までの商品は引かない" do
    expect(Cart.new([plate]).total).to eq 1_600
  end

  it "商品ごとに判断する" do
    expect(Cart.new([mug, plate]).total).to eq 4_300
  end
end`}
          />
          <p>
            書き方B では割引の境目（2個と3個）を、total に渡す商品の数量で選んでいます。3つ目の例はマグカップ3個（3,000円から300円引き）と小皿2個（1,600円。引かない）を一緒に買うと 4,300円になることを確かめています。今のコードでは、2つのファイルの5つの例はすべて通ります（5 examples, 0 failures）。
          </p>
          <h3>2つの変更で比べる</h3>
          <p>1つ目の変更は振る舞いを変えないリファクタリングです。割引の計算は商品ごとに決まるので、計算を Item に移しました。</p>
          <Code
            lang="ruby"
            title="app/models/cart.rb（変更1：割引の計算を Item に移した。振る舞いは同じ）"
            code={`class Cart
  Item = Data.define(:name, :price, :quantity) do
    def amount = price * quantity
    def bulk_discount = quantity >= 3 ? amount / 10 : 0
  end

  def initialize(items) = @items = items

  def subtotal = @items.sum(&:amount)

  def total = subtotal - @items.sum(&:bulk_discount)
end`}
          />
          <Code
            lang="text"
            title="実行結果（変更1の後に bundle exec rspec spec/models/cart_private_spec.rb spec/models/cart_spec.rb --format documentation）"
            code={`Cart （private メソッドのテスト）
  3個以上なら代金の10%を引く (FAILED - 1)
  2個までは引かない (FAILED - 2)
Cart
  3個以上の商品は代金の10%を引いた合計になる
  2個までの商品は引かない
  商品ごとに判断する

Failures:

  1) Cart （private メソッドのテスト） 3個以上なら代金の10%を引く
     Failure/Error: expect(Cart.new([]).send(:bulk_discount, 1_000, 3)).to eq 300

     NoMethodError:
       undefined method 'bulk_discount' for an instance of Cart
 …（2) も同じ NoMethodError。省略）

5 examples, 2 failures`}
          />
          <p>2つ目の変更は規則を「カート全体で3個以上」と読み違えて total を書き換えたものです。これは不具合です。</p>
          <Code
            lang="ruby"
            title="app/models/cart.rb（変更2：規則を読み違えた。total だけを書き換え、bulk_discount は元のまま）"
            code={`  # 「カート全体で3個以上」と読み違えて書き換えた
  def total
    count = @items.sum(&:quantity)
    subtotal - @items.sum { bulk_discount(it.price, count) }
  end`}
          />
          <Code
            lang="text"
            title="実行結果（変更2の後に同じコマンド）"
            code={`Cart （private メソッドのテスト）
  3個以上なら代金の10%を引く
  2個までは引かない
Cart
  3個以上の商品は代金の10%を引いた合計になる
  2個までの商品は引かない
  商品ごとに判断する (FAILED - 1)

Failures:

  1) Cart 商品ごとに判断する
     Failure/Error: expect(Cart.new([mug, plate]).total).to eq 4_300

       expected: 4300
            got: 3700

       (compared using ==)

5 examples, 1 failure`}
          />
          <p>
            変更1では、振る舞いが同じなのに書き方A の2つの例が NoMethodError で失敗しました。直すべき不具合は無いので、この失敗に応えるにはテストを書き直すしかありません。変更2では、書き方A は2つとも通りました。bulk_discount 自体は元のままで、1,000円の商品3個なら300円を返すからです。不具合は、total が bulk_discount に渡す数量のほうにあります。書き方B はマグカップと小皿を一緒に買う例で、小皿にまで割引がかかった 3,700円を見つけました。図 91-7 は、2つのテストが依存しているものと、2つの変更での結果をまとめたものです。
          </p>
          <Figure n="91-7" title="2つのテストが依存するものと、2つの変更での結果" caption="上の2回の実行結果をもとにした図。テストA は private の名前と引数に、テストB は公開した total の結果に依存する。">
            <EncapsulationFigure />
          </Figure>
          <h3>どちらを優先するか</h3>
          <p>
            この組で優先するのは、「テストのためだけに内部の実装を公開せず、公開された振る舞いを通じてテストする」ことです。書き方A は bulk_discount を public にはしていませんが、send でテストを private の名前と引数に結び付けました。テストも Cart を使う呼び出し側の1つです。カプセル化は「内部を変えても、呼び出し側を直さずに済む」ことを守るための原則なので、send で内部を呼ぶテストでは、この利点が得られません。その結果、変更1では直す必要のない失敗が出て、変更2では不具合を見逃しました。
          </p>
          <p>
            反対に、カプセル化を守ったためにテストが書きにくくなることもあります。private のメソッドの分岐が多いと、公開したメソッドを通して全部の分岐を通すには、たくさんのテストのデータを用意することになります。このときは send で呼ぶ代わりに、その計算に業務の言葉で名前を付けられるかを考えます。名前を付けられるなら、別のクラスに切り出し、そのクラスの公開したメソッドとしてテストします。変更1の Item#bulk_discount は、その形です。図 91-8 はテストしたくなった状況ごとの方法です。
          </p>
          <Figure n="91-8" title="Encapsulation とテストのしやすさ：テストしたくなったときの方法" caption="どの行も、private を send で呼ぶ代わりに、公開した操作でテストする。">
            <EncapsulationTable />
          </Figure>
          <p>
            Rails のテストでも考え方は同じです。request spec はコントローラーの private メソッドを呼ばずに、HTTP の要求と応答で確かめます。前の節の商品ページの例も応答のステータスコードと本文、Rails.error への報告を確かめました。どの層にテストを置くかは、テストの章（<ChapterLink n={20} section="test-strategy" />）と DHH の思想の章（<ChapterLink n={31} section="behavior-tests" />）で扱っています。
          </p>
        </>
      ),
    },
    {
      id: 'top10-review',
      title: '特に重要な10原則の振り返り',
      body: (
        <>
          <p>
            序章（<ChapterLink n={56} section="top10" />）ではほとんどの変更で判断に使う10原則を挙げました。図 91-9 は10原則のそれぞれについて、各章の最初の節で起きた問題、当てはめすぎたときに現れる兆候、この章で比べた組を並べたものです。
          </p>
          <Figure n="91-9" title="特に重要な10原則と章の対応" caption="番号は序章の表と同じ順。High Cohesion と Low Coupling は1つにまとめて数える。右端の欄から各章へ移動できる。">
            <Top10Table />
          </Figure>
          <p>
            「この章の組」の列を見ると、この章の5組のどれにも、10原則のうち1つ以上が入っています。DRY と AHA は両方が10原則で、KISS・YAGNI・Fail Fast・Encapsulation は組の片方です。よく使う原則ほど、ほかの原則とぶつかる場面にも多く出会います。
          </p>
          <p>
            「当てはめすぎの兆候」の列は、組の反対側の原則が防ごうとしている問題と重なります。DRY の当てはめすぎ（違う知識をまとめる）は AHA が防ぐ問題で、AHA の当てはめすぎ（同じ知識を重複のまま残す）は DRY が防ぐ問題です。Fail Fast の当てはめすぎ（補助の機能の失敗でページ全体を 500 にする）は、この章の書き方A で実際に起きました。レビューで10原則のどれかを理由に変更を求められたら、先にこの列を読み、変更の後のコードが当てはめすぎの状態にならないかを確かめます。
          </p>
          <p>
            「なし」と書いた SRP・Explicit over Implicit・Measure Before Optimizing も、ほかの原則とぶつからないわけではありません。序章で触れたように、SRP に沿ってクラスを分けすぎると、KISS に反して読むファイルが増えます。この章ではよく話題になる5組を選んで比べましたが、ぶつかる組はほかにもあります。
          </p>
        </>
      ),
    },
    {
      id: 'purposes-review',
      title: '原則を適用する目的の振り返り',
      body: (
        <>
          <p>
            序章（<ChapterLink n={56} section="purposes" />）では原則を当てはめる目的を、理解しやすいこと・変更しやすいこと・正しく動き続けることの3つにまとめました。この章の5組で、それぞれの原則が何を守ったかを、実行結果をもとに並べます。かっこの中が対応する目的です。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">組</th>
                  <th scope="col">片方の原則が守ったもの</th>
                  <th scope="col">もう片方の原則が守ったもの</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">DRY と AHA</th>
                  <td>DRY：カートの案内と確定の送料を食い違わせない。基準を変えるときに直すのは1か所（正しく動き続ける・変更しやすい）</td>
                  <td>AHA：送料の基準を変えても、クーポンの条件は変わらない（変更しやすい・正しく動き続ける）</td>
                </tr>
                <tr>
                  <th scope="row">KISS と OCP</th>
                  <td>KISS：3つの配送方法の違いを1つのファイルで見比べられる（理解しやすい）</td>
                  <td>OCP：4つ目を足すときの既存のファイルの変更が、一覧の1行で済む（変更しやすい）</td>
                </tr>
                <tr>
                  <th scope="row">YAGNI と DIP</th>
                  <td>YAGNI：最初に書くのが9行・1ファイルで済む（理解しやすい）</td>
                  <td>DIP：SDK の更新で直すのが VendorSmsSender の1行で済む（変更しやすい）</td>
                </tr>
                <tr>
                  <th scope="row">Fail Fast と Graceful Degradation</th>
                  <td>Fail Fast：在庫を確かめられない注文を作らない（正しく動き続ける：不正なデータを作らない）</td>
                  <td>Graceful Degradation：おすすめ API が止まっても商品ページを表示する（正しく動き続ける：障害の影響を小さく抑える）</td>
                </tr>
                <tr>
                  <th scope="row">Encapsulation とテストのしやすさ</th>
                  <td>Encapsulation：Cart の内部を変えても、テストを含む呼び出し側を直さずに済む（変更しやすい）</td>
                  <td>公開した振る舞いのテスト：割引の不具合を見つける（正しく動き続ける）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            KISS と OCP、YAGNI と DIP、Encapsulation とテストのしやすさの3組では、2つの原則が違う目的を守っています。DRY と AHA、Fail Fast と Graceful Degradation の2組は同じ目的を守りますが、対象が違います。DRY は同じ知識を使う箇所どうしの食い違いを防ぎ、AHA は違う知識どうしが一緒に変わってしまうことを防ぎます。Fail Fast は不正なデータを作らないことを、Graceful Degradation は障害の影響を小さく抑えることを守ります。
          </p>
          <p>
            どちらの原則を優先するかは、このコードで今どの目的が損なわれているかを具体的に書き出すと決めやすくなります。図 91-10 はこの章の5組で使った判断の流れをまとめたものです。
          </p>
          <Figure n="91-10" title="原則同士がぶつかったときの判断の流れ" caption="右の例は、この章の送料無料の基準（DRY と AHA）と配送方法（KISS と OCP）から取った。">
            <JudgeFlowFigure />
          </Figure>
          <p>
            図 91-10 の4番目は、この章の5組で繰り返し使った問いです。反対側の原則が防ぐ問題がこのコードで今起きていなければ、小さい方の変更にとどめます。配送方法の case 文と、SDK を直接呼ぶ書き方A がその例です。起きていれば、両方の損失を比べます。送料無料の基準では表示と請求の食い違い（DRY の側の損失）と、クーポンの条件の変化（AHA の側の損失）の両方が実際に起きたので、知識ごとに分ける書き方3を選びました。
          </p>
          <p>
            5番目の「見直す条件」は、判断が変わる条件を先に書いておくことです。原則の判断は変更の実績や依頼の見込みによって変わります。序章で書いたように、原則を当てはめないと決めたときも、その理由を PR の説明に書きます（<ChapterLink n={56} section="what-is-principle" />）。次のように書いておくと、後で読む人が、いつ書き方を変えればよいかを判断できます。
          </p>
          <Code
            lang="text"
            title="PR の説明の例（配送方法を足す PR）"
            code={`コンビニ受け取りを配送方法に足しました。

- 配送方法は Delivery の case 文のままにしています（KISS）。配送方法による違いは
  app/models/delivery.rb の中に収まっていて、配送方法を足すのは今回が最初です。
- spec/models/kiss_ocp_spec.rb で、一覧のすべての配送方法の名前・送料・届く日を確かめています。
- 見直す条件：配送方法による違いが Delivery の外（メールの文面・画面の選択肢など）にも
  必要になったら、配送方法ごとのクラスと一覧の形に移します（OCP）。`}
          />
        </>
      ),
    },
    {
      id: 'further',
      title: 'さらに学ぶ領域',
      body: (
        <>
          <p>
            この部の原則は、1つのメソッドやクラスの書き方から、モジュールの分け方までを判断する基準でした。この先は扱う範囲を次の4つの領域に広げて学べます。図 91-11 は4つの領域と、続きを読める本書の章を結んだものです。
          </p>
          <Figure n="91-11" title="さらに学ぶ4つの領域と、本書の章" caption="右の箱は本書の章。章へのリンクと本書の外の資料は、下の表に示す。">
            <FurtherFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">領域</th>
                  <th scope="col">本書の章</th>
                  <th scope="col">本書の外の資料</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1 プログラミングの原則</th>
                  <td>
                    この部の各章（<ChapterLink n={57} />〜<ChapterLink n={92} />）、DHH の思想（<ChapterLink n={31} section="doctrine" />）
                  </td>
                  <td>
                    『The Pragmatic Programmer』20周年記念版（Thomas・Hunt、2019年）<Ref n={19} />、『A Philosophy of Software Design』第2版（Ousterhout、2021年）<Ref n={20} />、『Refactoring』第2版（Fowler、2018年）<Ref n={21} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">2 オブジェクト指向設計</th>
                  <td>
                    第9部の序章（<ChapterLink n={39} />）と各パターンの章、Service・Form・Query・Value Object と設計パターン（<ChapterLink n={33} section="design-patterns" />）
                  </td>
                  <td>
                    『Practical Object-Oriented Design』第2版（Metz、2018年）<Ref n={22} />、『Design Patterns』（Gamma ほか、1994年）<Ref n={23} />、論文「On the Criteria To Be Used in Decomposing Systems into Modules」（Parnas、1972年）<Ref n={24} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">3 ソフトウェアアーキテクチャ</th>
                  <td>
                    アーキテクチャの境界（<ChapterLink n={30} section="architecture-boundaries" />）、Rails Way と DDD（<ChapterLink n={34} section="rails-way-ddd" />）、<ChapterLink n={44} />、<ChapterLink n={55} />
                  </td>
                  <td>
                    『Patterns of Enterprise Application Architecture』（Fowler ほか、2002年）<Ref n={25} />、『Domain-Driven Design』（Evans、2003年）<Ref n={27} />
                  </td>
                </tr>
                <tr>
                  <th scope="row">4 分散システムと運用</th>
                  <td>
                    ジョブの冪等性（<ChapterLink n={18} section="idempotency" />）、タイムアウト（<ChapterLink n={25} section="timeouts" />）、本番の観測（<ChapterLink n={25} section="production-observability" />）、<ChapterLink n={52} />、<ChapterLink n={53} />、<ChapterLink n={54} />、<ChapterLink n={83} />、<ChapterLink n={89} />、<ChapterLink n={91} />
                  </td>
                  <td>
                    『Release It!』第2版（Nygard、2018年）<Ref n={28} />、『Site Reliability Engineering』（Google）<Ref n={29} />、『Designing Data-Intensive Applications』（Kleppmann。日本語訳『データ指向アプリケーションデザイン』2019年）<Ref n={30} />、論文「Time, Clocks, and the Ordering of Events in a Distributed System」（Lamport、1978年）<Ref n={31} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <h3>1. プログラミングの原則</h3>
          <p>
            この部の原則には、上の書籍で名前が付いたものや、詳しく説明されたものがあります。『The Pragmatic Programmer』は DRY を名付けた本です<Ref n={1} />。『Refactoring』は Replace Conditional with Polymorphism のような、振る舞いを変えずにコードの形を変える手順をカタログにしています（KISS と OCP の節で、case 文から配送方法ごとのクラスに移す手順として使いました）。『A Philosophy of Software Design』の第2版には、Robert C. Martin の『Clean Code』の考え方と比べる節が加わり、メソッドの長さやコメントの役割について2人の意見が大きく違うことが書かれています<Ref n={20} />。同じ問題について違う意見を読み比べると、この章で見たように、原則が条件によって役立ったり逆効果になったりすることを確かめられます。
          </p>
          <h3>2. オブジェクト指向設計</h3>
          <p>
            原則は判断の基準で、具体的なクラスの形までは決めません（<ChapterLink n={56} section="layers" />）。形の候補を示すのが設計パターンで、本書の第9部では15のパターンを Rails で動かしました。『Practical Object-Oriented Design』は Ruby の例で、1つのクラスに何を置くか、オブジェクト同士の柔軟なインターフェース、ダックタイピング、継承とコンポジション、費用に見合うテストの設計を扱います<Ref n={22} />。YAGNI と DIP の節で、取り決めを基底クラスにせず、キーワード引数の既定値で本物と Fake を渡し分けたのは、ダックタイピングを使った書き方です。Parnas の論文は変わりやすい設計判断を1つずつ隠すようにモジュールを分けることを提案した論文で、情報隠蔽（<ChapterLink n={73} />）のもとになりました<Ref n={24} />。
          </p>
          <h3>3. ソフトウェアアーキテクチャ</h3>
          <p>
            アーキテクチャはアプリケーション全体をどの層や境界に分けるかの決定です。『Patterns of Enterprise Application Architecture』は、業務のアプリケーションの層の分け方、業務の処理（ドメインロジック）の置き方、その処理とリレーショナル DB の結び付け方などを、40ほどのパターンとして説明しています<Ref n={25} />。Rails のモデルと同じ名前の Active Record も、この本のパターンの1つで、テーブルの1行を表し、DB の読み書きと業務の処理を1つのオブジェクトに持たせる形です<Ref n={26} />。『Domain-Driven Design』は、複雑な業務の領域（ドメイン）を扱うソフトウェアの設計の進め方を体系的にまとめた本です<Ref n={27} />。本書では注文処理を育てる章で Rails Way と DDD の考え方を比べています（<ChapterLink n={34} section="rails-way-ddd" />）。
          </p>
          <h3>4. 分散システムと運用</h3>
          <p>
            ジョブの再試行、外部 API の失敗、複数のサーバーの間のデータの整合性は、1つのプロセスの中のコードの書き方だけでは決まりません。この章の Fail Fast と Graceful Degradation の節でも、外部 API が失敗することを前提に、機能ごとの扱いを決めました。『Release It!』第2版は、本番で動き続けるシステムのための安定性のパターンとして、タイムアウト・サーキットブレーカー・バルクヘッドなどを扱います<Ref n={28} />。『Site Reliability Engineering』は Google の SRE（サイト信頼性エンジニアリング）の本で、リスクの受け入れ方、サービスレベル目標（SLO）、分散システムの監視、過負荷への対処、障害の連鎖への対処などの章があり、Web で読めます<Ref n={29} />。『Designing Data-Intensive Applications』は、データを保存・処理するさまざまな仕組みの考え方とトレードオフを比べる本です<Ref n={30} />。Lamport の論文は分散システムで「ある出来事が別の出来事より前に起きた」という関係を定め、論理時計を使って出来事に順序を付ける方法を示しました<Ref n={31} />。
          </p>
          <p>
            どの領域から読むかは図 91-10 の1番目と同じく、いま困っていることから決めます。クラスやモジュールの分け方で迷っているなら2、アプリケーション全体の層や境界なら3、ジョブの二重実行や外部 API の障害なら4から読みます。
          </p>
        </>
      ),
    },
    principleConflicts,
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <ul>
            <li>原則同士のトレードオフは、同じコードに対して2つの原則が逆の変更を勧める関係である。どちらの原則も、当てはまる場面では正しい判断の基準である。</li>
            <li>DRY と AHA は「片方を変えたら、もう片方も必ず同じに変えるか」で分ける。送料無料の基準とクーポンの最低金額は同じ 3,000円でも別の知識で、1つの定数にまとめるとクーポンの条件まで変わった。</li>
            <li>KISS と OCP は種類による違いを書くファイルの数と、種類を足す頻度で決める。足し忘れを見つけたのは、case 文かクラスかではなく、一覧のすべての種類を回すテストだった。</li>
            <li>YAGNI と DIP は依存先の変更を誰が決めるかで分ける。外部の会社が変える SDK は1つのクラスに集めて外から渡すと、SDK の更新で直す範囲がそのクラスに限られる。自分たちか Rails が決める依存は直接使う。</li>
            <li>Fail Fast と Graceful Degradation は機能ごとに決める。外部の失敗に限り、無くても目的を果たせる機能は代わりの値で続け、注文のようにデータを作る処理は止める。どちらの場合も Rails.error に報告する。</li>
            <li>Encapsulation とテストのしやすさでは、private のメソッドを send で呼ばず、公開した振る舞いでテストする。send で呼ぶテストは振る舞いを変えないリファクタリングで失敗し、total の不具合を見逃した。</li>
            <li>迷ったときは、損なわれている目的（理解しやすい・変更しやすい・正しく動き続ける）を書き出し、反対側の原則が防ぐ問題が今起きているかを確かめ、判断の理由と見直す条件を PR に書く。この先は原則・オブジェクト指向設計・アーキテクチャ・分散システムと運用の4つの領域に広げて学べる。</li>
          </ul>
        </>
      ),
    },
  ],
  sources: [
    { title: 'The Pragmatic Programmer, 20th Anniversary Edition（抜粋「DRY—The Evils of Duplication」）', publisher: 'The Pragmatic Bookshelf', url: 'https://media.pragprog.com/titles/tpp20/dry.pdf', accessed: '2026-11-21', version: '2019年9月刊（書籍ページ https://pragprog.com/titles/tpp20/ ）', note: 'DRY が対象にするのはコードの見た目の重複ではなく、知識と意図の重複であること。DRY を名付けた本であること。' },
    { title: 'The Wrong Abstraction', publisher: 'sandimetz.com / Sandi Metz', url: 'https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction', accessed: '2026-11-21', version: '2016年1月20日', note: '重複は誤った抽象化よりはるかに安いこと。引数と条件の分岐が増えた抽象化は、呼び出し側すべてにインライン化して重複に戻す手順。' },
    { title: 'AHA Programming', publisher: 'kentcdodds.com / Kent C. Dodds', url: 'https://kentcdodds.com/blog/aha-programming', accessed: '2026-11-21', version: '2020年6月22日', note: 'AHA（Avoid Hasty Abstractions）。抽象化を始める時期を教条的に決めず、適切だと感じられるまで重複を恐れないこと。' },
    { title: 'Replace Conditional with Polymorphism', publisher: 'refactoring.com / Martin Fowler', url: 'https://refactoring.com/catalog/replaceConditionalWithPolymorphism.html', accessed: '2026-11-13', version: '『Refactoring』第2版（2018年刊）のカタログ', note: '条件分岐をポリモーフィズムに置き換えるリファクタリングの名前（KISS と OCP の節で case 文から配送方法ごとのクラスに移す手順）。' },
    { title: 'Yagni', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/bliki/Yagni.html', accessed: '2026-11-22', version: '2015年5月26日', note: 'YAGNI が当てはまるのは見込みの機能のために作る仕組みだけで、ソフトウェアを変更しやすくするための作業には当てはまらないこと。' },
    { title: 'The Dependency Inversion Principle', publisher: 'Robert C. Martin / The C++ Report（テキサス大学の教員のサイトに置かれた複製）', url: 'https://cs.utexas.edu/~downing/papers/DIP-1996.pdf', accessed: '2026-11-21', version: '1996年', note: '上位のモジュールは下位のモジュールに依存してはならず、どちらも抽象に依存すべきであるという原則の文。' },
    { title: 'Using an instance double', publisher: 'RSpec Mocks', url: 'https://rspec.info/features/3-13/rspec-mocks/verifying-doubles/instance-doubles/', accessed: '2026-11-20', version: 'rspec-mocks 3.13', note: 'instance_double が、スタブしたメソッドが本物のクラスにあるかと、引数の形を確かめること（SDK を v2 に上げたときの失敗）。' },
    { title: 'Shared examples', publisher: 'RSpec Core', url: 'https://rspec.info/features/3-13/rspec-core/example-groups/shared-examples/', accessed: '2026-11-21', version: 'rspec-core 3.13', note: 'shared_examples で定義した例を it_behaves_like で複数のクラスに使うこと。' },
    { title: 'Fail Fast', publisher: 'Jim Shore / IEEE Software（martinfowler.com に置かれた記事の PDF）', url: 'https://martinfowler.com/ieeeSoftware/failFast.pdf', accessed: '2026-11-22', version: '2004年9・10月号の設計のコラム（編集は Martin Fowler）', note: '問題を自動的に回避するソフトウェアは failing slowly になること。fail fast するシステムは immediately and visibly に失敗すること。クラッシュは適切でなく、全体の例外ハンドラーを置き、それ以外の場所ではすべての例外を捕まえるハンドラーを避けること。' },
    { title: 'Error Reporting in Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/error_reporting.html', accessed: '2026-11-22', version: 'Rails 8.1（v8.1.4）', note: 'handle・record・report・unexpected の4つのメソッド。handle が例外を報告して握りつぶし fallback の結果を返すこと。unexpected が本番では報告して続け、開発とテストでは別の例外にして止めること。HTTP の要求で rescue_responses にある例外（500 にならないもの）は報告しないこと。' },
    { title: 'activesupport/lib/active_support/error_reporter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/error_reporter.rb#L79-L155`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'handle は例外のクラスを書かないと StandardError（DEFAULT_RESCUE）を捕まえ、handled: true で報告して fallback を呼ぶこと。record は handled: false で報告して投げ直すこと。unexpected は debug_mode なら UnexpectedError を投げ、そうでなければ handled: true で報告すること。' },
    { title: 'actionpack/lib/action_dispatch/middleware/executor.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionpack/lib/action_dispatch/middleware/executor.rb#L13-L37`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'リクエストの処理で起きた例外を、Executor のミドルウェアが handled: false で報告すること。' },
    { title: 'railties/lib/rails/application/bootstrap.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/bootstrap.rb#L66-L72`, accessed: '2026-11-22', version: 'Rails 8.1.4.1', note: 'config.consider_all_requests_local が true のとき Rails.error.debug_mode を true にすること（unexpected が止めるかどうかの条件）。新しいアプリの設定で開発とテストが true、本番が false であることは、検証のアプリの config/environments で確かめた。' },
    { title: 'Error Reporting in Rails Applications（Rails 7.1 版）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v7.1/error_reporting.html', accessed: '2026-11-22', version: 'v7.1.6', note: 'handle・record・report の説明があり、unexpected の説明が無いこと。' },
    { title: 'Error Reporting in Rails Applications（Rails 7.2 版）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v7.2/error_reporting.html', accessed: '2026-11-22', version: 'v7.2.4', note: 'Rails.error.unexpected の説明（Reporting Unexpected Errors）が載っていること。' },
    { title: 'WebMock', publisher: 'bblimke/webmock（GitHub）', url: 'https://github.com/bblimke/webmock', accessed: '2026-11-20', version: '3.36.0 を使用', note: 'stub_request・to_return・to_timeout。to_timeout が Net::HTTP に Net::OpenTimeout を発生させることは gem のソース（http_lib_adapters/net_http.rb）で、faraday-net_http 3.5.0 がそれを Faraday::ConnectionFailed に変えることも gem のソースと実行結果で確かめた。' },
    { title: 'Object#send・Object#public_send', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Object.html#method-i-public_send', accessed: '2026-11-21', note: 'public_send は public のメソッドだけを呼ぶこと（send は private も呼べることは Ruby 4.0.9 で実行して確かめた）。' },
    { title: 'Ruby 3.4.0 Released', publisher: 'ruby-lang.org', url: 'https://www.ruby-lang.org/en/news/2024/12/25/ruby-3-4-0-released/', accessed: '2026-11-22', version: '2024年12月25日', note: '名前を付けずにブロックの引数を指す it が Ruby 3.4 で加わったこと。' },
    { title: 'The Pragmatic Programmer, 20th Anniversary Edition', publisher: 'David Thomas, Andrew Hunt / The Pragmatic Bookshelf', url: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/', accessed: '2026-11-22', version: '2019年9月刊', note: 'さらに学ぶ資料（プログラミングの原則）。書名・著者・刊行年。' },
    { title: 'A Philosophy of Software Design（Software Design Book）', publisher: 'John Ousterhout / Stanford University', url: 'https://web.stanford.edu/~ouster/cgi-bin/aposd.php', accessed: '2026-11-22', version: '第2版（2021年7月）', note: '第2版で、メソッドの長さやコメントの役割などについて Robert Martin の Clean Code と比べる節が加わったこと。' },
    { title: 'Refactoring: Improving the Design of Existing Code, 2nd Edition', publisher: 'Martin Fowler / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/refactoring-improving-the-design-of-existing-code-9780134757599', accessed: '2026-11-22', version: '2018年11月19日刊', note: 'さらに学ぶ資料（プログラミングの原則）。書名・著者・刊行年。' },
    { title: 'Practical Object-Oriented Design: An Agile Primer Using Ruby, 2nd Edition', publisher: 'Sandi Metz / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/practical-object-oriented-design-an-agile-primer-using-9780134456478', accessed: '2026-11-22', version: '2018年8月22日刊', note: 'さらに学ぶ資料。扱う内容（1つのクラスに何を置くか、柔軟なインターフェース、ダックタイピング、継承、コンポジション、費用に見合うテスト）は著者のサイト https://www.poodr.com/ の説明で確かめた。' },
    { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', publisher: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides／Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/design-patterns-elements-of-reusable-object-oriented-9780201633610', accessed: '2026-11-13', version: '1994年10月刊（著作権表記1995年）', note: 'さらに学ぶ資料（オブジェクト指向設計）。書名・著者・刊行年。' },
    { title: 'On the Criteria To Be Used in Decomposing Systems into Modules', publisher: 'D. L. Parnas / Communications of the ACM（アイントホーフェン工科大学の教員のサイトに置かれた複製）', url: 'https://www.win.tue.nl/~wstomv/edu/2ip30/references/criteria_for_modularization.pdf', accessed: '2026-11-21', version: '1972年12月号（Vol. 15, No. 12）', note: '難しい設計判断や変わりやすい設計判断を並べ、それぞれを隠すようにモジュールを分けるという提案。' },
    { title: 'Patterns of Enterprise Application Architecture', publisher: 'Martin Fowler / martinfowler.com（書籍の紹介ページ）', url: 'https://martinfowler.com/books/eaa.html', accessed: '2026-11-22', version: '2002年', note: '40ほどのパターンの参照部分と、層の分け方・ドメインロジックの置き方・リレーショナル DB との結び付け方などの主題。' },
    { title: 'Active Record', publisher: 'martinfowler.com / Martin Fowler（Patterns of Enterprise Application Architecture のカタログ）', url: 'https://martinfowler.com/eaaCatalog/activeRecord.html', accessed: '2026-11-21', note: 'Active Record パターンの定義（テーブルの行を表し、DB へのアクセスを内部で行い、業務のロジックを加えるオブジェクト）。' },
    { title: 'Domain-Driven Design: Tackling Complexity in the Heart of Software', publisher: 'Eric Evans / Addison-Wesley（InformIT の書籍ページ）', url: 'https://www.informit.com/store/domain-driven-design-tackling-complexity-in-the-heart-9780321125217', accessed: '2026-11-22', version: '2003年8月20日刊（著作権表記2004年）', note: '複雑な領域を扱うソフトウェアのためのドメイン駆動設計を体系的に示す本であること。' },
    { title: 'Release It! Second Edition: Design and Deploy Production-Ready Software', publisher: 'Michael Nygard / The Pragmatic Bookshelf', url: 'https://pragprog.com/titles/mnee2/release-it-second-edition/', accessed: '2026-11-22', version: '2018年1月刊', note: '目次の安定性のパターンに Timeouts・Circuit Breaker・Bulkheads があること。' },
    { title: 'Site Reliability Engineering（Table of Contents）', publisher: 'Google（sre.google）', url: 'https://sre.google/sre-book/table-of-contents/', accessed: '2026-11-22', note: 'Embracing Risk・Service Level Objectives・Monitoring Distributed Systems・Handling Overload・Addressing Cascading Failures の章があること。https://sre.google/books/ で Web で読めること。' },
    { title: 'データ指向アプリケーションデザイン（Designing Data-Intensive Applications の日本語訳）', publisher: 'Martin Kleppmann 著、斉藤太郎 監訳、玉川竜司 訳 / オライリー・ジャパン', url: 'https://www.oreilly.co.jp/books/9784873118703/', accessed: '2026-11-22', version: '2019年7月18日発行', note: '書名・副題（信頼性、拡張性、保守性の高い分散システム設計の原理）・発行日。原書の紹介ページ https://dataintensive.net/ で、さまざまな仕組みの考え方とトレードオフを比べる本であることを確かめた。' },
    { title: 'Time, Clocks, and the Ordering of Events in a Distributed System', publisher: 'Leslie Lamport / Communications of the ACM（DOI）', url: 'https://doi.org/10.1145/359545.359563', accessed: '2026-11-22', version: '1978年7月号（Vol. 21, No. 7）558〜565ページ', note: '分散システムで「ある出来事が別の出来事より前に起きた」関係が半順序を定めること、論理時計で出来事に全順序を付けるアルゴリズム（Crossref の書誌情報の要旨で確かめた）。' },
  ],
}

export default chapter
