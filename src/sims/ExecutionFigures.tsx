import { useState } from 'react'
import { StudyFigure, FigureChoices } from '../visuals/study-figure'
import { Stepper } from './Stepper'

export function MethodLookup({ classMethods }: { classMethods?: boolean }) {
  const [composition, setComposition] = useState(classMethods ? 2 : 0)
  const orders = [
    ['Article', 'Labels', 'Base', 'Object', 'Kernel', 'BasicObject'],
    ['Labels', 'Article', 'Base', 'Object', 'Kernel', 'BasicObject'],
    ['Article の特異クラス', 'Labels', 'Base の特異クラス', 'Object の特異クラス', 'BasicObject の特異クラス', 'Class', 'Module', 'Object', 'Kernel', 'BasicObject'],
  ]
  const methodOwner = composition === 0 ? 'Article' : composition === 1 ? 'Labels' : 'Article の特異クラス'
  return (
    <StudyFigure title="モジュールを組み込むとメソッドの探索順はどう変わるか" caption="Article は Base を継承します。Article、Labels、Base が同名の label を定義する場合を示します。extend では、Article と Base の特異クラスが label を定義します。 refinements、可視性、super を使う場合の続きは省いています。">
      <FigureChoices label="Labels の組み込み方" options={['include', 'prepend', 'extend']} selected={composition} onSelect={setComposition} />
      <p>呼び出し <code>{composition === 2 ? 'Article.label' : 'Article.new.label'}</code></p>
      <ol>{orders[composition].map((name) => <li key={name}>
        <code>{name}</code>{name === methodOwner && <strong> ここで label が見つかる</strong>}
      </li>)}</ol>
    </StudyFigure>
  )
}

type Scenario = {
  title: string
  note: string
  variants: { name: string; steps: readonly (readonly [string, string])[] }[]
}

const execution: Record<string, Scenario> = {
  rack: {
    title: 'Rack のミドルウェアを通る順序',
    note: '外側のログ用ミドルウェアと内側の制限用ミドルウェアを置いた模式図です。ストリーミング応答と例外処理は省いています。',
    variants: [
      { name: '要求を通す', steps: [['ログ（往路）', '外側のミドルウェアが env を受け取り、内側の call を呼ぶ。'], ['制限の判定', '要求を受け付け、Rails の call を呼ぶ。'], ['Rails', 'アプリが status・headers・body の3つを返す。'], ['ログ（復路）', '外側で応答のステータスと処理時間を記録する。']] },
      { name: '制限で応答する', steps: [['ログ（往路）', '外側のミドルウェアが内側の call を呼ぶ。'], ['429 を返す', '制限のミドルウェアが Rails を呼ばずに応答の3要素を返す。'], ['ログ（復路）', '外側は429を記録して、その応答を返す。']] },
    ],
  },
  boot: {
    title: 'Rails が起動時に実行する処理',
    note: '一般的な Rails アプリの順序です。初期化ブロックの細かい並びは依存関係やアプリの設定で変わります。',
    variants: [
      { name: '本番環境', steps: [['Bundler', 'config/boot.rb が Gemfile の依存を使えるようにする。'], ['設定', 'アプリケーションクラスと環境設定を読み込む。'], ['初期化', 'Railtie やアプリの initializer を依存順に実行する。'], ['Eager load', '設定された定数をまとめて読み込み、要求を待つ。']] },
      { name: '開発環境', steps: [['Bundler', 'config/boot.rb が Gemfile の依存を使えるようにする。'], ['設定', '開発用の設定と initializer を読み込む。'], ['定数参照', '起動時に読み込まれていない定数を参照すると、Zeitwerk が対応するファイルを読み込む。']] },
    ],
  },
  gc: {
    title: '参照を外すとオブジェクトを回収できるか',
    note: '到達可能性だけを示します。実際の CRuby には世代別 GC、保守的に保持される参照、増分処理があり、GC の時期もこの図とは異なります。',
    variants: [
      { name: '配列に保持する', steps: [['参照を作る', 'オブジェクトを配列に入れ、その配列をグローバル変数に保持する。'], ['ローカル変数を外す', '配列からは同じオブジェクトに到達できる。'], ['マーク', '到達できるので回収対象に含めない。']] },
      { name: 'すべての参照を外す', steps: [['参照を作る', 'ローカル変数からオブジェクトを参照する。'], ['参照を外す', '同じオブジェクトを指す参照がほかにない。'], ['回収', 'ルートから到達できないと判定されたオブジェクトを回収できる。ヒープの解放が RSS の減少に直結するとは限らない。']] },
    ],
  },
  gvl: {
    title: '2つのスレッドが動く順序',
    note: '同じ Ractor 内の CRuby スレッドの例です。スケジューラーの切り替え時刻とネイティブ拡張の動作は省いています。',
    variants: [
      { name: '両方とも Ruby の計算', steps: [['A が実行', 'A が GVL を持ち、Ruby の命令を実行する。'], ['切り替え', 'A が GVL を手放すと、B が処理を進められる。'], ['B が実行', 'B が Ruby の命令を実行する。A と B の Ruby コードは同時には走らない。']] },
      { name: 'A がソケットを待つ', steps: [['A が要求を送る', 'A がソケットへ要求を送り、I/O を待つ。'], ['B が実行', 'A が待っている間に B が GVL を取得して Ruby の命令を実行する。'], ['A の I/O が完了', 'A が Ruby の処理を再開するには GVL が必要。']] },
    ],
  },
  zeitwerk: {
    title: 'パスから期待される定数を求める',
    note: 'app/models が読み込みのルートで、標準の変換規則を使う場合です。名前空間や頭字語は設定で変えられます。',
    variants: [
      { name: '対応する定数を定義する', steps: [['パス', 'app/models/billing/invoice.rb がある。'], ['定数の名前', 'billing は Billing、invoice は Invoice に変換される。'], ['読み込み', 'Billing::Invoice を参照すると対応するファイルを読み込み、定数を使える。']] },
      { name: '異なる定数を定義する', steps: [['パス', 'app/models/billing/invoice.rb がある。'], ['定数の名前', 'ファイルには Billing::Invoice が必要。'], ['読み込み時のエラー', 'Billing::Bill だけを定義すると期待された定数がなく、Zeitwerk::NameError が発生する。']] },
    ],
  },
  routing: {
    title: '同じパスでメソッドだけを変える',
    note: 'resources :articles が定義された例です。制約、名前空間、拡張子、認可は省いています。',
    variants: [
      { name: 'GET /articles', steps: [['要求', '記事一覧を取得する。'], ['ルートの照合', 'GET と /articles に合うルートが見つかる。'], ['アクション', 'ArticlesController#index を呼ぶ。']] },
      { name: 'POST /articles', steps: [['要求', '記事を作成する。'], ['ルートの照合', 'POST と /articles に合う別のルートが見つかる。'], ['アクション', 'ArticlesController#create を呼ぶ。']] },
    ],
  },
  callbacks: {
    title: '保存の成否でどのコールバックまで進むか',
    note: '新規レコードを save する場合です。独自のコールバックやネストしたトランザクションは省いています。',
    variants: [
      { name: '有効な入力', steps: [['検証', 'validation の前後のコールバックを実行し、入力が検証を通る。'], ['保存', 'before_save と before_create の後で INSERT を発行する。'], ['保存後', 'after_create と after_save を実行する。'], ['確定後', 'トランザクションが確定してから after_commit を実行する。']] },
      { name: '入力が検証を通らない', steps: [['検証', 'バリデーションが errors に理由を追加する。'], ['保存を中止', 'INSERT に進まず save が false を返す。save! を使うと例外になる。']] },
    ],
  },
  cache: {
    title: '更新前後でキャッシュキーを比べる',
    note: '変更時刻をキーのバージョンに使う例です。期限切れ、並行更新、HTTP キャッシュの再検証は省いています。',
    variants: [
      { name: '値が変わらない', steps: [['最初の取得', 'v1 の値を DB から読み、キーに対応する値を保存する。'], ['次の取得', 'v1 のキーが変わらず、保存済みの値を再利用できる。']] },
      { name: '値を更新する', steps: [['更新前', 'v1 のキーで表示内容を保存している。'], ['更新を確定', 'レコードの更新でキーのバージョンが v2 に変わる。'], ['次の取得', 'v2 の値がないため、更新済みデータから値を作って保存する。']] },
    ],
  },
  jobs: {
    title: 'ジョブをキューへ入れる時点と再試行',
    note: 'Web の DB とキューは別にあり、ジョブはコミット後に投入する設定とします。配信回復の詳細はジョブ基盤によって異なります。',
    variants: [
      { name: '保存してから通知する', steps: [['DB へ保存', '注文のデータをコミットする。'], ['ジョブを投入', '注文の ID を持つジョブをキューへ入れる。'], ['ジョブを実行', 'ワーカーが注文を取り出して通知する。']] },
      { name: '最初の送信が失敗する', steps: [['コミット・投入', '注文が確定し、ジョブがキューに残る。'], ['一時的な失敗', '通知先からの応答を得られず、次の実行が予約される。'], ['再試行', '前の通知が届いていても結果が重複しないよう、同じ識別子で送る。']] },
    ],
  },
  tcp: {
    title: 'TCP で接続を確立する',
    note: '通常の3ウェイハンドシェイクの例です。再送、データを含む SYN、接続の終了処理は扱いません。',
    variants: [
      { name: 'ポートでサーバーが待ち受ける', steps: [['SYN', 'クライアントが接続を要求する。'], ['SYN + ACK', '待ち受けているサーバーが要求を受け取ったことを返す。'], ['ACK', 'クライアントがサーバーへの確認を返す。接続上でデータを送受信できる。']] },
      { name: 'ポートが閉じている', steps: [['SYN', 'クライアントが接続を要求する。'], ['RST', '接続先が到達可能で、そのポートに待ち受けがなければ、通常は TCP リセットが返る。']] },
    ],
  },
  dns: {
    title: '名前解決で問い合わせ先を変える',
    note: '再帰リゾルバーの例です。実際には OS 側などにもキャッシュがあり、委任の情報も再利用できます。',
    variants: [
      { name: '回答がキャッシュにある', steps: [['問い合わせ', 'クライアントがリゾルバーに名前を問い合わせる。'], ['キャッシュから応答', '有効期限内の回答を返す。']] },
      { name: '回答がキャッシュにない', steps: [['問い合わせ', 'クライアントがリゾルバーに名前を問い合わせる。'], ['委任をたどる', 'リゾルバーが必要に応じてルートと TLD の DNS から権威 DNS を見つける。'], ['回答を保存する', '権威 DNS の回答をクライアントに返し、TTL に従ってキャッシュする。']] },
    ],
  },
  proxy: {
    title: 'どの接続で処理が止まったか',
    note: 'Nginx がリバースプロキシとして単一の upstream に転送する例です。再試行やエラーページの設定によって結果は変わります。',
    variants: [
      { name: 'upstream が接続を拒否', steps: [['Nginx が接続を試す', '要求を転送するため upstream に接続する。'], ['502', '接続が拒否され、有効な upstream 応答を取得できない。']] },
      { name: 'upstream の応答を待ちすぎた', steps: [['接続は成立', 'upstream が接続を受け取る。'], ['504', '応答ヘッダーを待つ間にタイムアウトする。']] },
      { name: 'クライアントが先に切断', steps: [['処理中', 'Nginx は upstream の応答を待つ。'], ['ログに 499', 'クライアントが先に切断したことを Nginx がログに記録する。クライアントが受け取る応答コードではない。']] },
    ],
  },
}

export function ScenarioFigure({ scenario }: { scenario: Scenario }) {
  const [choice, setChoice] = useState(0)
  return (
    <StudyFigure title={scenario.title} caption={scenario.note}>
      {scenario.variants.length > 1 && <FigureChoices label="条件" options={scenario.variants.map((variant) => variant.name)} selected={choice} onSelect={setChoice} />}
      <Stepper key={choice} steps={scenario.variants[choice].steps.map(([label, detail]) => ({ label, detail }))} />
    </StudyFigure>
  )
}

export function ExecutionFigure({ id }: { id: string }) {
  return <ScenarioFigure scenario={execution[id]} />
}
