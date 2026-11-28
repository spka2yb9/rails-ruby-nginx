import { useState } from 'react'
import { FigureChoices, FigureFlow, StudyFigure } from '../visuals/study-figure'
import { ScenarioFigure } from './ExecutionFigures'

type Structure = { title: string; note: string; before: string[][]; after: string[][] }

const structures: Record<number, Structure> = {
  40: { title: '為替と時計を誰が選ぶか', note: '矢印は直接呼ぶ相手を示します。外部 API の内部は省いています。',
    before: [['換算処理', '本番の為替クライアント'], ['換算処理', 'システム時刻']],
    after: [['生成する場所', '為替クライアントを選ぶ', '換算処理に渡す'], ['換算処理', '受け取った為替・時計のメソッドを呼ぶ']] },
  42: { title: '決済会社を追加したときに直す場所', note: '矢印は呼び出しや変換の向きを表します。注文の永続化と再送は省いています。',
    before: [['注文処理', 'A 社の金額・項目・エラーを変換'], ['注文処理', 'B 社の金額・項目・エラーを変換']],
    after: [['注文処理', '共通の決済操作', '選んだ Adapter'], ['A 社 Adapter', 'A 社 API'], ['B 社 Adapter', 'B 社 API']] },
  43: { title: '要求の前後でログを取る場所', note: 'ログ用の前後処理だけを図にしています。応答の本文を遅延して送る場合の処理は省いています。',
    before: [['一覧アクション', '開始と終了を記録'], ['保存アクション', '開始と終了を記録']],
    after: [['要求', 'ミドルウェアで開始を記録', 'アクション'], ['応答', 'ミドルウェアで終了を記録', 'クライアント']] },
  44: { title: '参加申し込みの手順の置き場所', note: '矢印は処理の呼び出しです。認証と入力の検証は省いています。',
    before: [['Controller', '定員確認', '申し込み保存', '通知'], ['管理画面', '定員確認と保存を別に実装']],
    after: [['Controller と管理画面', '参加申し込み Use Case'], ['Use Case', '定員確認と保存', '通知の手配']] },
  48: { title: '請求書と明細をまとめて確定する構造', note: 'Unit of Work の概念と Rails の実装の対応です。Active Record が要求全体の変更を自動で追跡し、一括で保存する仕組みを表した図ではありません。',
    before: [['請求書を保存・確定', '明細を保存', '失敗して請求書だけが残る']],
    after: [['保存を指示する処理', '同じ transaction で請求書・明細を保存'], ['全部成功', 'COMMIT'], ['保存が失敗', 'ROLLBACK']] },
  50: { title: '毎回集計する場合と集計結果を保存する場合', note: '集計結果を別の表として管理する MySQL の例です。再集計中の更新や切り替えは省いています。',
    before: [['集計画面', '注文の表を毎回 GROUP BY', '結果を表示']],
    after: [['集計ジョブ', '注文の表から集計表を更新'], ['集計画面', '集計表を読む', '最終集計時刻と結果を表示']] },
  55: { title: '注文確定の実装に必要な境界を足す', note: '決済に失敗して再開する経路だけを示します。複数回の実行では同じ冪等性キーを使います。',
    before: [['注文確定', '注文を保存', '決済 API に同期で送信']],
    after: [['注文と送信予定を保存', 'コミット'], ['中継', '保存したキーで送信', '結果を反映']] },
  67: { title: '倉庫 API の変更がどこまで及ぶか', note: '倉庫 API の項目名が変わる場合の依存関係です。業務の取り決めも変われば Use Case 側にも修正が及びます。',
    before: [['在庫引き当て処理', '倉庫の SDK と応答形式']],
    after: [['在庫引き当て処理', '引き当ての取り決め'], ['Adapter', '引き当ての取り決めを実装', '倉庫の SDK を変換']] },
  70: { title: '会員データの保存形式への依存', note: '請求に必要な値が同じという前提です。公開する値の意味を変える場合は利用側と調整します。',
    before: [['請求処理', '会員モデルの内部列', '保存時の表記を解釈']],
    after: [['請求処理', '公開された請求先の値'], ['会員モデル', '保存した値を変換して返す']] },
}

export function StructureComparison({ chapter }: { chapter: number }) {
  const [stage, setStage] = useState(0)
  const structure = structures[chapter]
  const paths = stage ? structure.after : structure.before
  return (
    <StudyFigure title={structure.title} caption={structure.note}>
      <FigureChoices label="比較する構造" options={['変更前', '変更後']} selected={stage} onSelect={setStage} />
      {paths.map((path) => <FigureFlow key={path.join('-')} steps={path.map((name) => ({ label: name, detail: null }))} />)}
    </StudyFigure>
  )
}

export function DependencyStability() {
  const [incoming, setIncoming] = useState(4)
  const [outgoing, setOutgoing] = useState(1)
  const id = (incoming + outgoing) ? (outgoing / (incoming + outgoing)).toFixed(2) : '定義できない'
  return (
    <StudyFigure title="依存の数から不安定度を計算する" caption="依存する要素数を Ce、依存される要素数を Ca とし、I = Ce / (Ca + Ce) で計算します。ここでは依存の強さ、変更の頻度や費用は数えません。">
      <div className="sim-controls">
        <label>Money に依存する要素数 <output>{incoming}</output><input type="range" min={0} max={8} value={incoming} onChange={(e) => setIncoming(e.target.valueAsNumber)} /></label>
        <label>Money が依存する要素数 <output>{outgoing}</output><input type="range" min={0} max={8} value={outgoing} onChange={(e) => setOutgoing(e.target.valueAsNumber)} /></label>
      </div>
      <p aria-live="polite">不安定度 I = {id}</p>
    </StudyFigure>
  )
}

const designs = {
  state: { title: '2人が同じ申請を承認する', note: '承認済みへの遷移を行ロックで直列化する例です。通知の重複を防ぐ実装は省いています。', variants: [
    { name: '状態を読み直さない', steps: [['A と B が読み込む', '2人とも申請中の値を持つ。'], ['A が承認する', '承認済みになる。'], ['B が承認する', '古い申請中の値を使うと、承認後の処理をもう一度呼ぶ可能性がある。']] },
    { name: 'ロック中に状態を読み直す', steps: [['A が行をロック', 'A が状態を読み、承認する。B はロックを待つ。'], ['A がコミット', '承認済みになり、ロックが解放される。'], ['B が状態を再検査', 'すでに承認済みなので、ここでは遷移を実行しない。']] },
  ] },
  unlocked: { title: '後から保存した編集内容が上書きする場合', note: '原典の楽観ロックの段階図を、両方の画面が名前と価格を送る例に合わせています。部分更新の設定によっては上書きされる列は異なります。', variants: [
    { name: 'バージョン検査なし', steps: [['2人が編集を開始', '両方の画面が同じ商品名と300円を表示する。'], ['A が価格を保存', '価格を350円に更新する。'], ['B が名前を保存', 'B の画面から価格300円も送られ、350円が上書きされる。']] },
  ] },
  locked: { title: 'lock_version で古い入力を検出する場合', note: 'Rails の楽観ロックの例です。フォームが読み込んだときの lock_version を保存処理へ渡します。', variants: [
    { name: 'バージョン検査あり', steps: [['読み込み', 'A と B は lock_version が0の状態を取得する。'], ['A が保存', '更新条件のバージョン0に一致し、価格を更新してバージョン1にする。'], ['B は再編集が必要', 'バージョン0に一致する行がない。Rails が StaleObjectError を発生させる。']] },
  ] },
  domain: { title: '会員登録後の処理が失敗する場所', note: '原典のドメインイベントの段階図を、Rails の登録とジョブの例に合わせています。イベントを確実に保存する場合は Outbox の章を参照してください。', variants: [
    { name: '後続処理が成功', steps: [['会員を保存', '会員が登録済みになる。'], ['イベントを発行', '会員登録を知らせ、メールと集計の処理を分ける。'], ['後続処理を実行', '各ジョブが必要なデータを読み込む。']] },
    { name: 'メールの処理が失敗', steps: [['会員を保存', '会員の登録とメールの送信を分ける。'], ['メールで失敗', 'メール用のジョブが失敗する。'], ['再実行を判断', '送信済みと判定できる仕組みを使い、重複を防ぐ。']] },
  ] },
  double: { title: '応答を取り損ねて決済を再送する', note: '原典の二重請求の段階図に対応します。外部の決済処理は概念モデルです。', variants: [
    { name: 'キーを送らない', steps: [['送信', '注文の決済を要求する。'], ['応答が失われる', '決済サービスは請求を確定したが、アプリは応答を受け取れない。'], ['送り直す', '決済サービスが異なる要求として処理し、二重請求が起こる。']] },
  ] },
  keyed: { title: '同じ冪等性キーで決済をやり直す', note: '原典のキーを使う段階図に対応します。送り先が同じキーと内容に対し、最初の結果を返す仕様を仮定します。', variants: [
    { name: 'キーを同じ値で送る', steps: [['キーを記録', '注文に対応するキーを保存し、最初の決済要求に付ける。'], ['応答が失われる', '決済サービスにキーと請求結果が残る。'], ['同じキーで送り直す', '決済サービスが最初の結果を返し、新しい請求は行わない。']] },
  ] },
  outbox: { title: 'DB と通知先の片方だけが更新される場合', note: '原典の障害箇所を切り替える図に対応します。DB と CRM の間には同時に確定する仕組みがないと仮定します。', variants: [
    { name: '送信後にロールバック', steps: [['CRM へ送信', 'CRM は新しい値を保存する。'], ['DB をロールバック', '会員の更新は取り消され、DB に古い値が残る。']] },
    { name: '送信後にコミットできない', steps: [['CRM へ送信', 'CRM は新しい値を保存する。'], ['COMMIT を送る前に切断', 'DB が更新を取り消すと、CRM だけが新しくなる。']] },
    { name: 'コミット後に停止', steps: [['DB をコミット', 'DB に新しい値が残る。'], ['送信の前に停止', 'CRM には変更が届かず、DB と異なる。']] },
    { name: 'CRM が一時的に停止', steps: [['送信予定を DB に保存', '会員の変更と送信予定を同じトランザクションで確定する。'], ['中継の送信が失敗', '未送信行が DB に残る。'], ['回復後に送信', '同じイベント ID で再送する。前の更新が後から届く場合は、受信側で新旧を判定する。']] },
  ] },
} as const

export function DesignScenario({ id }: { id: keyof typeof designs }) {
  const scenario = designs[id]
  return <ScenarioFigure scenario={{ ...scenario, variants: [...scenario.variants] }} />
}
