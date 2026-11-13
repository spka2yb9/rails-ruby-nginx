import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg } from '../components/diagram'

function InvestigationFigure() {
  const rows = [
    ['再現する', '入力・実行環境・操作順を固定する'],
    ['止めて観察する', '例外、値、型、呼び出し元を確認する'],
    ['原因を絞る', '期待と実際が最初に違う位置を探す'],
    ['修正して確かめる', '再現ケースと周辺ケースをテストする'],
  ]
  return <Svg id="28-1" w={700} h={332} label="調査の進め方。条件を固定して再現し、値や呼び出し元を観察し、期待と実際が分かれる箇所を特定して修正する。最後に同じ条件と周辺条件でテストする。">
    {rows.map(([a, b], i) => <g key={a}>
      <Box x={20} y={14 + i * 80} w={180} h={58} lines={a} fs={14} bold />
      <Arrow x1={202} y1={43 + i * 80} x2={238} y2={43 + i * 80} />
      <Box x={240} y={14 + i * 80} w={440} h={58} lines={b} fs={13} fill="box4" />
      {i < 3 && <Arrow x1={110} y1={72 + i * 80} x2={110} y2={92 + i * 80} />}
    </g>)}
  </Svg>
}

function FramesFigure() {
  return <Svg id="28-2" w={700} h={294} label="呼び出し履歴の模式図。コントローラーがサービスを呼び、サービスの掛け算でTypeErrorが発生する。呼び出しごとの実行状態をフレームと呼び、上のフレームへ移って入力の由来を調べる。">
    <Box x={20} y={18} w={300} h={62} lines={['#2 コントローラー', 'フォームから quantity = "2"']} fs={13} subTone="muted" />
    <Arrow x1={170} y1={80} x2={170} y2={110} />
    <Box x={20} y={112} w={300} h={62} lines={['#1 PriceCalculator#total', 'unit_price = 1200 / quantity = "2"']} fs={12} subTone="muted" />
    <Arrow x1={170} y1={174} x2={170} y2={204} />
    <Box x={20} y={206} w={300} h={62} lines={['#0 Integer#*', '型が合わず TypeError']} fs={13} fill="bg" subTone="danger" />
    <Box x={370} y={68} w={310} h={160} lines={['bt：呼び出し履歴を一覧にする', 'frame / up：調べる呼び出しを選ぶ', 'p quantity.class：型を確かめる', '例外の行だけでなく、入力の由来も追う']} fs={12} fill="box5" />
  </Svg>
}

function ToolsFigure() {
  const rows = [
    ['値や分岐がおかしい', 'debug / pry-byebug', '停止して、値と型を調べる'],
    ['例外画面から調べたい', 'better_errors / web-console', '呼び出し履歴と変数を確認'],
    ['SQL の繰り返しが気になる', 'Bullet', 'N+1 と不要な先読みの候補'],
    ['応答が遅い', 'rack-mini-profiler', '時間のかかる処理を絞る'],
    ['メールの内容がおかしい', 'letter_opener_web', '保存したメールを表示する'],
  ]
  return <Svg id="28-3" w={760} h={352} label="症状と道具の対応。値や分岐にはdebugやpry-byebug、例外画面にはbetter_errorsやweb-console、SQLの繰り返しにはBullet、性能にはrack-mini-profiler、メールの確認にはletter_opener_webを使う。">
    {rows.map(([a, b, c], i) => <g key={a}>
      <Box x={20} y={12 + i * 68} w={230} h={54} lines={a} fs={12.5} />
      <Arrow x1={252} y1={39 + i * 68} x2={286} y2={39 + i * 68} />
      <Box x={290} y={12 + i * 68} w={450} h={54} lines={[b, c]} fs={12.5} fill="box4" subTone="muted" />
    </g>)}
  </Svg>
}

const ch28: Chapter = {
  number: 28,
  part: 5,
  title: 'Railsのデバッグ実践と調査用gem',
  summary: '不具合の再現から変数・呼び出し履歴の調査、修正の確認までを追います。debugに加え、業務アプリで確認したPry、Better Errors、Bullet、rack-mini-profiler、メール確認とログ・例外調査の道具を使い分けます。',
  goals: [
    '再現条件を固定し、例外・ログ・値から原因を絞り込める',
    'debugとpry-byebugで停止、ステップ実行、変数と呼び出し履歴の確認ができる',
    'ブラウザーの例外画面、SQLの検出、性能計測の道具を目的に応じて選べる',
    'メール・ログ・例外通知から不具合を調べる際の範囲と注意点を説明できる',
    '修正を再現テストに残し、検証した範囲と未確認の範囲を区別できる',
  ],
  prerequisites: [1, 10, 13, 18, 19, 20, 22],
  sections: [
    { id: 'workflow', title: '再現条件を固定して、期待と実際を比べる', body: <>
      <p>デバッグでは、期待した結果と実際の結果が分かれた位置を探し、なぜそうなったかを確かめます。第1章では調査用のコマンドを紹介しました。本章では、どの場面で何を調べ、修正の確認までどう進めるかを扱います。</p>
      <p>最初に、操作順、入力、期待する結果、実際の結果を揃えます。同じ画面でも、利用者の権限、データの状態、環境変数、実行しているコードの版によって動きが変わります。ローカルで作った架空のデータで再現できれば、調べる範囲を狭められます。失敗したリクエストやジョブを識別するIDは、複数のログを結び付ける手掛かりになります。</p>
      <Figure n="28-1" title="再現から修正確認まで" caption="模式図。観察で仮説が外れたら、条件を整理して調べ直します。"><InvestigationFigure /></Figure>
      <p>値がおかしいのか、例外が発生したのか、応答が遅いのかで道具を選びます。停止するデバッガは値の調査に向きますが、止めた時間が混ざるので応答時間の測定には向きません。ログを増やす場合も、調べたい値と期間を絞ります。<Ref n={1} /></p>
    </> },
    { id: 'environments', title: '教材の環境と、参照した業務アプリの構成', body: <>
      <p>教材のdebugの例はRuby 4.0.9とdebug 1.11.1で確認しました。一方、参照した業務アプリはRuby 3.4.8、Rails 8.1.2です。以下は2026年11月12日にGemfile・Gemfile.lockと設定から確認した構成です。業務アプリのコードやデータを例として転載せず、以下の調査例は独立した小さな題材を使います。</p>
      <div className="table-wrap"><table><thead><tr><th>gemと固定された版</th><th>役割</th><th>Gemfile上の範囲</th></tr></thead><tbody>
        <tr><td>pry 0.16.0 / pry-byebug 3.12.0 / pry-rails 0.3.11</td><td>対話的な調査とステップ実行</td><td>pry-byebugは開発・テスト、pry-railsはグループ指定なし</td></tr>
        <tr><td>better_errors 2.10.1 / binding_of_caller 1.0.1</td><td>例外画面と呼び出しごとの変数</td><td>開発・テスト</td></tr>
        <tr><td>web-console 4.2.1</td><td>ブラウザー内のRubyコンソール</td><td>開発</td></tr>
        <tr><td>bullet 8.1.0</td><td>N+1や不要な先読みの検出</td><td>開発・テスト</td></tr>
        <tr><td>rack-mini-profiler 4.0.1</td><td>リクエストとSQLの性能調査</td><td>開発</td></tr>
        <tr><td>letter_opener_web 3.0.0</td><td>メールの確認</td><td>開発・テスト・ステージング</td></tr>
        <tr><td>honeybadger 6.3.0 / lograge 0.14.0</td><td>例外通知とログの整理</td><td>グループ指定なし</td></tr>
      </tbody></table></div>
      <p>Gemfileのグループ指定は、実際にその環境で機能が有効であることまで保証しません。Bundlerの除外設定、初期化処理、ミドルウェアの順序も確認します。業務アプリにはdebugの直接指定はなく、Pry系が宣言されていました。debugとpry-byebugは、同じ停止位置に両方を差し込まず、調査ごとに使う道具を決めます。</p>
      <Callout title="確認済みの範囲"><p>業務アプリのDocker Compose環境で、上表の解決済みバージョンとpry-byebug・better_errorsの読み込みを確認しました。Pryの停止・ステップ実行も独立したRubyファイルで確認しています。ブラウザー内のgemの画面、メール配信、外部への例外送信は実行していません。設定例は各gemの公式資料と照合しています。</p></Callout>
    </> },
    { id: 'debug', title: 'debugで止めて、値と型を確認する', body: <>
      <p>次の計算処理は、単価と数量を掛け、送料500円を加える例です。数量に文字列の "2" が渡ると例外になります。フォームなどから受け取った値を、想定した型のまま使っていないか調べます。<Term en="breakpoint">ブレークポイント</Term>は、実行を一時停止する位置や条件のことです。</p>
      <Code lang="ruby" title="lib/price_calculator.rb：不具合を再現する小さな例" code={`
class PriceCalculator
  def total(unit_price, quantity)
    subtotal = unit_price * quantity
    subtotal + 500
  end
end
`} />
      <Code lang="ruby" title="debugを使用する開発・テスト環境のGemfileの例" code={`
group :development, :test do
  gem "debug", require: "debug/prelude"
end
`} />
      <Code lang="ruby" title="停止位置を入れる場合：totalの先頭に一時的に追加" code={`
binding.break
# debugger も binding.break の別名
`} />
      <p>Railsで読み込んだdebugを使う場合は、端末からリクエスト処理やテストを起動し、その端末に出る (rdbg) プロンプトで操作します。普通のRubyファイルなら require "debug" が必要です。教材の実測では、クラスを定義した後に停止し、メソッドへのブレークポイントを設定してから計算を呼びました。<Ref n={2} /></p>
      <Code lang="text" title="debug 1.11.1の実測から、確認に必要な部分を抜粋" code={`
(rdbg) break PriceCalculator#total
(rdbg) continue
# totalに入り、掛け算の行の前で停止
(rdbg) p quantity
=> "2"
(rdbg) p quantity.class
=> String
(rdbg) bt
#0 PriceCalculator#total(unit_price=1200, quantity="2")
#1 <main>
`} />
      <p>文字列に数字が入っていることと、整数であることは違います。次に呼び出し元でその値がどこから来たかを確認します。その場で quantity = 2 と書き換えると処理が進む場合がありますが、それは停止中の状態を変えただけです。元のコードを修正したことにはならないので、再実行とテストが必要です。</p>
      <div className="table-wrap"><table><thead><tr><th>debugのコマンド</th><th>調べること</th></tr></thead><tbody>
        <tr><td>next / n</td><td>呼び出したメソッドの内部へ入らず、次の行へ進む</td></tr>
        <tr><td>step / s</td><td>呼び出したメソッドの内部も追う</td></tr>
        <tr><td>finish / fin</td><td>現在のメソッドを抜けるまで進む</td></tr>
        <tr><td>continue / c</td><td>次の停止条件まで実行する</td></tr>
        <tr><td>bt / frame / up / down</td><td>呼び出し履歴を表示し、調べる実行状態を選ぶ</td></tr>
        <tr><td>p 式</td><td>選択中の実行状態で値を評価して表示する</td></tr>
      </tbody></table></div>
    </> },
    { id: 'exceptions', title: '例外と条件付きブレークポイントで範囲を絞る', body: <>
      <p>大量のリクエストやループのすべてで止めると、目的の状態へたどり着くのに時間がかかります。debugは、停止条件を付けたり、特定の例外が発生した時点で止めたりできます。次の例は、メソッドの引数が文字列である場合にだけ止める指定です。<Ref n={2} /></p>
      <Code lang="text" title="debugの条件付き停止と例外の捕捉" code={`
(rdbg) break PriceCalculator#total if: quantity.is_a?(String)
(rdbg) catch TypeError
(rdbg) continue
`} />
      <p>catch TypeError は、TypeErrorが発生した時点を調べます。後でrescueされる例外でも止まるため、「レスポンスは返るが内部で失敗を握りつぶしている」ケースの調査にも使えます。実測では Integer#* の中で停止し、btでPriceCalculatorへ戻る経路を確認できました。</p>
      <p>呼び出し1回ごとの変数や実行位置を持つ状態を<Term en="stack frame">フレーム</Term>と呼びます。図28-2は、Rubyだけの実測例をRailsのコントローラーから呼ぶ構成へ広げた模式図です。例外が出た最深部だけでなく、入力を渡した側も調べます。</p>
      <Figure n="28-2" title="例外から入力の由来をたどる" caption="模式図。実際のフレーム番号はライブラリや停止位置によって変わります。"><FramesFigure /></Figure>
      <p>Rails内部へ進みたいときは、<ChapterLink n={1} />の owner・source_location と、停止中の呼び出し履歴を組み合わせます。全メソッドを順に追うより、期待と実際が分かれる処理の入口に停止位置を置く方が、調べる範囲を限定できます。条件式も実行されるコードなので、DBへの更新など副作用のある式は使いません。</p>
    </> },
    { id: 'pry', title: 'pry-byebugとpry-rails：既存アプリの道具を使う', body: <>
      <p>Pryは、Rubyの式を対話的に実行し、オブジェクトやメソッドを調べるコンソールです。Pry単体と、実行を1行ずつ進める機能は区別します。pry-byebugはPryにステップ実行と呼び出し履歴の移動を追加し、pry-railsはRails consoleへの組み込みやRails向けの調査コマンドを提供します。<Ref n={3} /><Ref n={4} /><Ref n={5} /></p>
      <Code lang="ruby" title="pry-byebugを使う場合：totalの先頭で停止する" code={`
require "pry-byebug" # RailsでBundlerが読み込み済みなら不要
class PriceCalculator
  def total(unit_price, quantity)
    binding.pry
    subtotal = unit_price * quantity
    subtotal + 500
  end
end
PriceCalculator.new.total(1200, 2)
`} />
      <Code lang="text" title="Ruby 3.4.8・pry-byebug 3.12.0での確認例" code={`
[1] pry(...)> quantity
=> 2
[2] pry(...)> quantity.class
=> Integer
[3] pry(...)> next
[3] pry(...)> subtotal
=> 2400
[4] pry(...)> continue
# メソッドの戻り値は2900
`} />
      <p>debugでは n・s・c の短縮形を使えますが、pry-byebugでは同じ短縮形を当然に使えるとは限りません。既定では変数名との衝突を避けるため短縮形がなく、next・step・continueのように書きます。使用中のプロンプトが (rdbg) か pry かを確認します。<Ref n={4} /></p>
      <Code lang="text" title="Pryとpry-railsの調査コマンドの例" code={`
show-source PriceCalculator#total
ls PriceCalculator
show-models
show-routes --grep articles
`} />
      <p>show-source はメソッドの実装を読み、ls はメソッドなどを一覧にします。show-modelsとshow-routesはpry-railsの機能です。これらのコマンドは普通のRubyの式ではなく、Pryのプロンプトで使います。アプリの構造確認には便利ですが、全モデルを読み込むことがあるため、大きなアプリでは対象を絞るか通常のRailsコマンドも使います。</p>
      <h3>Docker Composeで入力できる端末を使う</h3>
      <Code lang="bash" title="appサービスを持つ開発環境での起動例" code={`
# consoleやテストを対話できる端末で起動する
# 起動済みの必要な開発用サービスに接続する設定を前提とする
docker compose run --rm app bundle exec rails console
docker compose run --rm app bundle exec rspec spec/services/price_calculator_spec.rb
`} />
      <p>サーバーのログを眺めるだけでは、別プロセスに出たPryの入力先にはなりません。停止位置を通るプロセスの標準入力につながった端末が必要です。参照したCompose設定には、端末を割り当てる tty と、標準入力を開いておく stdin_open がありました。ただし、-dを付けてバックグラウンドで起動したサーバーへ接続する方法は、実際の起動コマンドやプロセス管理によって異なります。まずconsoleや単独のspecで再現すると、入力先を揃えやすくなります。</p>
    </> },
    { id: 'browser-tools', title: 'better_errors・binding_of_caller・web-console', body: <>
      <p>better_errorsは、例外のソース位置、呼び出し履歴、変数を調べやすいエラー画面を提供します。binding_of_callerは、呼び出し履歴にある実行状態へアクセスするための補助gemです。この2つを組み合わせると、各フレームで変数を確認したりRubyの式を評価したりできます。<Ref n={6} /></p>
      <p>web-consoleは、ブラウザー内にRubyの対話コンソールを表示するgemです。エラー時だけでなく、ビューに一時的にconsoleを置いて、そのビューで参照できる値を調べる使い方もあります。第16章のテンプレートの変数が想定どおりか調べる場面に向きます。<Ref n={7} /></p>
      <Code lang="erb" title="web-consoleを有効にした開発環境での、一時的な調査例" code={`
<% console %>
`} />
      <p>例えば、画面に値が出ないときは、変数がnilなのか、空の配列なのか、別のオブジェクトなのかを確認します。consoleで式を実行して結果が分かれば、次に値を設定したコントローラーへ調査を戻します。エラーを捕捉した時点の変数を見ることと、その前の処理をステップ実行することは違います。</p>
      <Callout kind="warn"><p>これらのコンソールはサーバー上でRubyを実行できます。教材の例はローカル開発用です。参照アプリの許可IP設定をそのまま複製せず、Docker越しに使う場合も必要な接続元に限定します。両方を入れた場合にどちらのエラー画面が出るかは、実際のミドルウェア構成で確認します。調査のために本番のエラー画面を公開する運用にはしません。</p></Callout>
    </> },
    { id: 'bullet', title: 'BulletでN+1を見つけ、SQLで修正を確認する', body: <>
      <p>Bulletは、関連の読み込み方を監視し、N+1や使われなかった先読み、counter_cacheが使えそうな場面を通知します。すべてのSQLの性能を判定する機能ではありません。<ChapterLink n={13} section="n-plus-one-check" />で見たSQLログの確認と組み合わせます。<Ref n={8} /></p>
      <Code lang="ruby" title="開発環境の最小設定例" code={`
# config/environments/development.rb
config.after_initialize do
  Bullet.enable = true
  Bullet.bullet_logger = true
  Bullet.rails_logger = true
  Bullet.add_footer = true
end
`} />
      <p>一覧で記事ごとにauthorを読んだときの警告なら、その一覧の取得処理を探します。preload(:author)などで必要な関連をまとめて取得し、同じ画面・同じデータで再確認します。警告が消えたことに加え、SQLの回数と表示内容を確かめます。先読みが多すぎるという警告なら、表示に必要な関連を見直します。</p>
      <p>参照アプリは、開発環境でログと画面への通知を有効にし、テスト環境では Bullet.raise = true を指定していました。ただしraiseの指定だけで、すべての種類のspecが自動的に監視対象になるわけではありません。リクエストのミドルウェアを通らないサービスのspecなどでは、検出を開始して結果を通知する範囲を用意します。</p>
      <Code lang="ruby" title="ミドルウェアを通さない単独spec向けの監視範囲の例" code={`
# Bullet.enable = true / Bullet.raise = true をテスト環境で設定済み
# 通常のリクエストの監視と二重に囲まない
RSpec.describe "記事一覧の関連読み込み" do
  it "N+1の警告を出さない" do
    # この位置で、著者の異なる記事を複数件用意しておく
    Bullet.start_request
    begin
      Article.preload(:author).limit(5).each { |article| article.author&.name }
      Bullet.perform_out_of_channel_notifications if Bullet.notification?
    ensure
      Bullet.end_request
    end
  end
end
`} />
      <p>検出できるデータを用意しないと、問題のあるコードでもテストが通ります。また参照アプリには、特定のspecで検出を無効にする指定もありました。例外指定を増やして警告を消す前に、検出の根拠と許容する理由を確認します。strict_loadingはRailsの関連の遅延読み込みを制限し、Bulletは監視結果から候補を通知する、という違いがあります。</p>
    </> },
    { id: 'profiling', title: 'rack-mini-profilerで遅い処理を絞り込む', body: <>
      <p>処理にかかった時間を測り、内訳を調べることを<Term en="profiling">プロファイリング</Term>と呼びます。rack-mini-profilerは、HTMLページに処理時間の表示を加え、SQLなどの内訳を確認する道具です。参照アプリでは開発環境のGemfileに含まれていました。<Ref n={9} /></p>
      <Code lang="ruby" title="開発環境への導入例：DBのgemより後に置く" code={`
gem "mysql2"
group :development do
  gem "rack-mini-profiler"
end
`} />
      <p>遅い画面を開き、まずSQLに時間がかかるのか、それ以外の処理に時間がかかるのかを分けます。同じSQLが多数あればN+1を疑い、1回のSQLが遅ければ実行計画や索引を調べます。Ruby側の処理に時間がかかるなら、呼び出しごとの内訳を見る段階へ進みます。具体的な計測の考え方は<ChapterLink n={22} />と共通です。</p>
      <p>呼び出しの積み重なりと時間の割合を帯で表した図を<Term en="flame graph">フレームグラフ</Term>と呼びます。rack-mini-profilerでこの表示を使うにはstackprofなどの追加gemが必要です。メモリーの内訳にはmemory_profilerを追加できます。参照アプリのGemfileでは両者の直接指定は確認していないため、本章では追加候補として紹介します。<Ref n={9} /></p>
      <p>初回の読み込み、キャッシュ、データ量で時間は変わります。同じ条件で複数回測り、計測用ツール自体の負荷も考慮します。処理時間が短くなっても、必要な関連を落として表示が欠けていれば改善にはなりません。修正後は機能の確認と性能の確認を両方行います。</p>
      <Figure n="28-3" title="症状に合わせた調査用gemの選択" caption="用途の対応図。すべてを同時に使う必要はありません。"><ToolsFigure /></Figure>
    </> },
    { id: 'mail', title: 'letter_opener_webでメールを確認する', body: <>
      <p>メールの宛先や本文を調べるときは、実際に外へ送る前に、開発環境で生成結果を確認します。letter_opener_webは保存されたメールをブラウザーで読むための画面を提供します。delivery_methodを :letter_opener_web にすると、メールをこの仕組みに渡します。<Ref n={10} /></p>
      <Code lang="ruby" title="ローカル開発環境の設定例" code={`
# config/environments/development.rb
config.action_mailer.delivery_method = :letter_opener_web

# config/routes.rb の routes.draw 内
if Rails.env.development?
  mount LetterOpenerWeb::Engine, at: "/letter_opener"
end
`} />
      <p>参照アプリにも、この配信方法と /letter_opener のルートがありました。教材では開発環境だけに限定した例を示しています。差出人、宛先、件名、本文、リンク先を確認し、HTML版とテキスト版に差がないかを調べます。ここで表示できても、外部メールサービスが受信先へ届けることまで確認できたわけではありません。</p>
      <p>deliver_laterを使う場合は、<ChapterLink n={18} />のジョブが実際に動いて初めてメールが生成されます。別コンテナでジョブを実行する構成では、生成側と閲覧側が保存場所を共有する必要があります。画面に何もないときは、Mailerだけでなく、ジョブの実行と保存先まで追います。保存したメールにも個人情報が入り得るので、教材の検証には架空の宛先と本文を使います。</p>
    </> },
    { id: 'logs-errors', title: 'LogrageとHoneybadgerでリクエスト・例外を追う', body: <>
      <p>停止できない環境では、ログと例外の記録が調査の出発点になります。Logrageは、Railsのリクエストに関するログを整理して出力するgemです。参照アプリでは本番用の設定にJSON形式が指定されていました。時刻、リクエストID、処理名、ステータス、所要時間などを使い、関係する記録を検索します。<Ref n={11} /></p>
      <Code lang="ruby" title="説明用：リクエストIDを付けるLogrageの設定例" code={`
config.lograge.enabled = true
config.lograge.formatter = Lograge::Formatters::Json.new
config.lograge.custom_payload do |controller|
  { request_id: controller.request.request_id }
end
`} />
      <p>Honeybadgerは例外の発生を記録・通知する仕組みです。例外の種類と呼び出し履歴、発生した版、関連する処理の情報を見て再現条件を探します。参照アプリにも、捕捉した例外をnotifyする呼び出しがありました。本章の調査では外部への送信はしていません。<Ref n={12} /></p>
      <Code lang="ruby" title="説明用：捕捉した例外に、調査に必要な情報だけを添える" code={`
begin
  ExternalService.sync_catalog
rescue ExternalService::Timeout => error
  Honeybadger.notify(error, context: { operation: "catalog_sync" })
  raise
end
`} />
      <p>例の外部サービスと例外クラスは仮の名前です。自動通知される例外を手動でも送ると重複する場合があるので、アプリの通知設定と捕捉方法に合わせます。contextは例外に添える情報です。リクエストの全パラメーター、Cookie、トークン、認証情報、メール本文などを一括で渡さず、必要な識別情報を選びます。例のraiseは例外を再送出します。これを取り除いて例外を握りつぶすと、ジョブの再試行など元の制御も変えてしまいます。</p>
    </> },
    { id: 'regression', title: '修正をテストに残して、調査を終える', body: <>
      <p>計算例では、数量として整数と数字の文字列を受け取り、不正な文字列と0以下を拒否する仕様にします。単価は整数で渡す前提です。to_iだけでは "abc" が0になるなど不正な入力を見逃すため、変換に失敗したときに例外になるIntegerを使います。</p>
      <Code lang="ruby" title="lib/price_calculator.rb：仕様を明示した修正例" code={`
class PriceCalculator
  def total(unit_price, quantity)
    quantity = Integer(quantity.to_s, 10)
    raise ArgumentError, "quantity must be positive" unless quantity.positive?
    unit_price * quantity + 500
  end
end
`} />
      <Code lang="ruby" title="spec/services/price_calculator_spec.rb：不具合の再発を検出する例" code={`
require "spec_helper"
require_relative "../../lib/price_calculator"

RSpec.describe PriceCalculator do
  subject(:calculator) { described_class.new }

  it "数字の文字列を数量として扱う" do
    expect(calculator.total(1200, "2")).to eq(2900)
  end

  it "整数の数量も扱う" do
    expect(calculator.total(1200, 2)).to eq(2900)
  end

  it "不正な数量を拒否する" do
    ["abc", "", "0", "-1"].each do |quantity|
      expect { calculator.total(1200, quantity) }.to raise_error(ArgumentError)
    end
  end
end
`} />
      <p>この3つのテストは、Ruby 4.0.9で修正前に2件が失敗し、修正後にはすべて通ることを確認しました。修正前の失敗を確かめると、元の不具合を検出できるテストになっているか判断できます。必要ならリクエストのテストも追加し、不正な入力にどう応答するかを確認します。単独のRubyのテストが通っても、コントローラーでのエラー処理まで確認したことにはなりません。</p>
      <p>最後に、一時的なbinding.break・binding.pry・consoleや詳細ログを取り除きます。停止によってタイムアウトやロック待ちが起きていた場合は、通常の速度で再実行します。「どの条件で再現したか」「どの値が期待と違ったか」「どのテストで修正を確認したか」を残すと、同じ症状が出たときの調査にも使えます。</p>
      <Callout kind="v72"><p>ここで扱うgemはRailsとは別に版が決まります。Rails 7.2から8.xへ上げる場合も、debuggerのコマンドや検出gemの対応状況はGemfile.lockと各gemの資料で確認します。Ruby 3.4で動いたpry-byebugを、そのままRuby 4.0でも確認済みとは扱いません。</p></Callout>
    </> },
    { id: 'summary', title: 'まとめ', body: <ul>
      <li>再現条件を固定し、値と型、例外、呼び出し元から期待と実際の違いを調べます。</li>
      <li>debugとpry-byebugのプロンプトやコマンドを区別し、入力できる端末で使います。</li>
      <li>Better Errors・web-consoleは例外や変数、Bulletは関連読み込み、rack-mini-profilerは処理時間の調査に使います。</li>
      <li>メールの生成・保存・実配送、ログの記録・例外の外部通知は、それぞれ別に確認します。</li>
      <li>元の不具合を再現するテストと周辺ケースを確かめ、一時的な停止位置を除いて調査を終えます。</li>
    </ul> },
  ],
  sources: [
    { title: 'Debugging Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/debugging_rails_applications.html', accessed: '2026-11-12', version: 'Rails 8.1', note: 'ログ、debug、web-consoleによる調査。' },
    { title: 'ruby/debug README', publisher: 'ruby/debug（GitHub）', url: 'https://github.com/ruby/debug', accessed: '2026-11-12', note: '停止、条件付きブレークポイント、catch、フレームの移動。教材での実測は1.11.1。' },
    { title: 'Pry README', publisher: 'pry/pry（GitHub）', url: 'https://github.com/pry/pry', accessed: '2026-11-12', note: 'binding.pry、show-source、ls、対話的なオブジェクト調査。' },
    { title: 'pry-byebug README', publisher: 'deivid-rodriguez/pry-byebug（GitHub）', url: 'https://github.com/deivid-rodriguez/pry-byebug', accessed: '2026-11-12', note: 'ステップ実行、フレーム移動、短縮形の扱い。実測は3.12.0。' },
    { title: 'pry-rails README', publisher: 'pry/pry-rails（GitHub）', url: 'https://github.com/pry/pry-rails', accessed: '2026-11-12', note: 'Rails consoleへの組み込み、show-models、show-routes。' },
    { title: 'Better Errors README', publisher: 'BetterErrors/better_errors（GitHub）', url: 'https://github.com/BetterErrors/better_errors', accessed: '2026-11-12', note: 'エラー画面、binding_of_callerによる高度な機能、開発環境での利用。' },
    { title: 'Web Console README', publisher: 'rails/web-console（GitHub）', url: 'https://github.com/rails/web-console', accessed: '2026-11-12', note: 'console、許可する接続元、任意のRubyコードを実行できること。' },
    { title: 'Bullet README', publisher: 'flyerhzm/bullet（GitHub）', url: 'https://github.com/flyerhzm/bullet', accessed: '2026-11-12', note: '検出対象、通知設定、RSpecなどでの検出範囲の管理。' },
    { title: 'rack-mini-profiler README', publisher: 'MiniProfiler/rack-mini-profiler（GitHub）', url: 'https://github.com/MiniProfiler/rack-mini-profiler', accessed: '2026-11-12', note: '処理時間とSQL、追加のstackprof・memory_profiler、gemの読み込み順。' },
    { title: 'letter_opener_web README', publisher: 'fgrehm/letter_opener_web（GitHub）', url: 'https://github.com/fgrehm/letter_opener_web', accessed: '2026-11-12', note: 'delivery_method、閲覧ルート、保存場所。' },
    { title: 'Lograge README', publisher: 'roidrage/lograge（GitHub）', url: 'https://github.com/roidrage/lograge', accessed: '2026-11-12', note: 'JSON形式、custom_payload、Railsのログの整理。' },
    { title: 'Honeybadger for Ruby', publisher: 'Honeybadger Docs', url: 'https://docs.honeybadger.io/lib/ruby/', accessed: '2026-11-12', note: '例外通知、context、機密情報のフィルタリングへの案内。外部送信は未実施。' },
  ],
}
export default ch28
