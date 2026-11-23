import { useState } from 'react'
import { FigureChoices, FigureFlow, StudyFigure } from './study-figure'

const restartPlans = [
  {
    name: 'restart',
    entry: 'Nginx の転送先',
    premise: '同じ Ruby で Puma を起動し直す例です。Linux 上の CRuby で待受ソケットを引き継ぐ構成を想定します。',
    stages: [
      { name: '更新前', destination: '同じ待受先', puma: '旧 Puma が動作中', request: '新しいリクエストは旧版が処理します。' },
      { name: '終了を待つ', destination: '同じ待受先', puma: '旧 Puma が処理中のリクエストを終える', request: 'Puma が起動し直すまで、新しい接続が待つことがあります。' },
      { name: '起動を待つ', destination: '引き継いだ待受ソケット', puma: 'マスターが起動し直し、新ワーカーを起動する', request: 'Rails の起動を待ちます。プロキシのタイムアウトを超えるとエラーになることがあります。' },
      { name: '再開', destination: '同じ待受先', puma: '新ワーカーが要求を処理できる', request: '起動後のリクエストは新版が処理します。' },
    ],
  },
  {
    name: 'phased-restart',
    entry: 'Nginx の転送先',
    premise: 'クラスタで2ワーカーを使う例です。アプリの更新には preload_app! を無効にし、prune_bundler を使います。入れ替え中に稼働するワーカーの余力も必要です。',
    stages: [
      { name: '更新前', destination: '同じ待受先', puma: '同じマスターの下で旧ワーカーが2つ稼働', request: '旧ワーカーのいずれかが処理します。' },
      { name: '1つ目を入れ替える', destination: '同じ待受先', puma: '旧ワーカー1は処理を終えて停止。新ワーカー1が起動中', request: '新しいリクエストを引き続き受けるのは旧ワーカー2です。' },
      { name: '新旧が同時に動く', destination: '同じ待受先', puma: '新ワーカー1と旧ワーカー2が稼働', request: 'この段階では、どちらの版も同じ DB で動ける必要があります。' },
      { name: '2つ目を入れ替える', destination: '同じ待受先', puma: '旧ワーカー2は処理を終えて停止。新ワーカー2が起動中', request: '新しいリクエストを引き続き受けるのは新ワーカー1です。' },
      { name: '完了', destination: '同じ待受先', puma: '同じマスターの下で新ワーカーが2つ稼働', request: 'ワーカーのアプリは新版です。マスターが動く Ruby は更新前のままです。' },
    ],
  },
  {
    name: 'Ruby 更新・1台',
    entry: 'Nginx の転送先',
    premise: '1台に旧 Puma と新 Puma を並べられる場合の例です。待受先と PID ファイルなどのパスを分け、メモリーと DB 接続数に余裕を確保します。',
    stages: [
      { name: '更新前', destination: '旧 Puma のポート 3000', puma: '旧 Ruby で旧 Puma が動作中', request: '旧 Puma がリクエストを処理します。' },
      { name: '新しい Ruby で起動', destination: '旧 Puma のポート 3000', puma: '新 Ruby で別の Puma をポート 3001 に起動し、直接動作確認', request: '確認中も、利用者のリクエストは旧 Puma が受けます。' },
      { name: '転送先を切り替える', destination: '新 Puma のポート 3001', puma: 'Nginx を再読み込みし、旧 Puma も残す', request: '切り替え後の新規接続は新版へ進み、切り替え前の処理は旧版で続きます。' },
      { name: '旧 Puma を止める', destination: '新 Puma のポート 3001', puma: '旧側の処理が終わり、新 Puma が動作中', request: '旧側の処理の終了と新版の応答を確認してから、旧 Puma を停止します。' },
    ],
  },
  {
    name: 'Ruby 更新・複数台',
    entry: 'ALB の転送先',
    premise: '2台のサーバー A・B がある構成で、先に A を更新します。1台だけでも通常のリクエストを処理できることが前提です。',
    stages: [
      { name: '更新前', destination: 'サーバー A と B', puma: '両方とも旧 Ruby', request: 'A と B にリクエストを振り分けます。' },
      { name: 'A を外す', destination: '新規の転送先は B', puma: 'A は処理中のリクエストの完了を待つ', request: 'A に新しいリクエストを送りません。A の登録解除が終わるまで待ちます。' },
      { name: 'A を更新して確認', destination: 'サーバー B のみ', puma: 'A で新 Ruby の Puma を起動して動作確認', request: 'A の確認中も、利用者のリクエストは B が受けます。' },
      { name: 'A を戻す', destination: '正常と判定された A と B', puma: 'A は新 Ruby、B は旧 Ruby', request: '両方にリクエストを振り分け、応答とエラー率を確認してから B の更新に進みます。' },
    ],
  },
]

export function PumaRestartFigure() {
  const [selection, setSelection] = useState({ plan: 0, stage: 0 })
  const plan = restartPlans[selection.plan]
  const stage = plan.stages[selection.stage]

  return (
    <StudyFigure
      title="Puma を入れ替える間のリクエストの行き先"
      caption="本文の再起動・切り替え手順を簡略化した模式図。順に段階を選ぶと、新しい要求の転送先と、先に受けた要求をどこで処理するかを追えます。"
    >
      <FigureChoices label="再起動・更新の方法" options={restartPlans.map(item => item.name)} selected={selection.plan}
        onSelect={index => setSelection({ plan: index, stage: 0 })} />
      <p className="study-premise">{plan.premise}</p>
      <FigureChoices label="切り替えの段階" options={plan.stages.map(item => item.name)} selected={selection.stage}
        onSelect={index => setSelection({ plan: selection.plan, stage: index })} />
      <FigureFlow steps={[
        { label: '新しいリクエスト', detail: '利用者から到着' },
        { label: plan.entry, detail: stage.destination, tone: 'accent' },
        { label: 'Puma の状態', detail: stage.puma },
      ]} />
      <p className="study-result" aria-live="polite">{stage.request}</p>
    </StudyFigure>
  )
}

export function DeploymentComparisonFigure() {
  return (
    <StudyFigure
      title="配備で切り替えるものと切り戻すもの"
      caption="本文の VM 配備とコンテナ配備の比較。アプリを戻したあとも、戻した版が現在の DB スキーマで動くことを確認します。"
    >
      <div className="study-grid">
        <div className="study-card study-comparison">
          <strong>Capistrano</strong>
          <dl>
            <dt>配るもの</dt>
            <dd><code>releases/</code> のリリースディレクトリ</dd>
            <dt>新版を使う</dt>
            <dd><code>current</code> を新版へ向け、再起動で Puma に新版を読み込ませる</dd>
            <dt>アプリを戻す</dt>
            <dd><code>current</code> を旧版へ戻し、再起動で Puma に旧版を読み込ませる</dd>
          </dl>
        </div>
        <div className="study-card study-comparison">
          <strong>Kamal</strong>
          <dl>
            <dt>配るもの</dt>
            <dd>アプリと実行環境を含むコンテナイメージ</dd>
            <dt>新版を使う</dt>
            <dd>ヘルスチェックに通った新版コンテナへ転送する</dd>
            <dt>アプリを戻す</dt>
            <dd>以前の版のイメージへ切り戻す</dd>
          </dl>
        </div>
      </div>
    </StudyFigure>
  )
}
