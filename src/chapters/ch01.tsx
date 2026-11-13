import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 1-1 本番構成と本書の章 ---------- */
function ArchitectureFigure() {
  return (
    <Svg
      id="1-1"
      w={620}
      h={566}
      label="本番構成の模式図。上から順に、ブラウザー、ALB（第25章）、Nginx（第24章）、Puma（第23章）、Rails アプリケーションが並ぶ。Rails アプリケーションの中は Rack ミドルウェア（第6章）、ルーティング（第9章）、コントローラー（第10章）、ActiveRecord（第3部）と ActionView（第16章）の順に処理が進む。ActiveRecord は MySQL に SQL を送る。右側では Rails が Redis にジョブを登録し、Sidekiq（第18章）がそれを取り出して実行し、MySQL にアクセスする"
    >
      <Box x={30} y={16} w={380} h={40} lines="ブラウザー（クライアント）" fill="bg" />
      <Arrow x1={220} y1={56} x2={220} y2={80} />
      <T x={230} y={68} fs={12} tone="muted">HTTPS</T>
      <Box x={30} y={80} w={380} h={44} lines={['ALB（ロードバランサー）', 'TLS を終端し、サーバーに振り分ける']} bold subTone="muted" />
      <T x={400} y={102} fs={12} anchor="end" tone="acc">第25章</T>
      <Arrow x1={220} y1={124} x2={220} y2={148} />
      <T x={230} y={136} fs={12} tone="muted">HTTP</T>
      <Box x={30} y={148} w={380} h={44} lines={['Nginx', '静的ファイルを返し、それ以外を Puma へ転送']} bold subTone="muted" />
      <T x={400} y={170} fs={12} anchor="end" tone="acc">第24章</T>
      <Arrow x1={220} y1={192} x2={220} y2={216} />
      <T x={230} y={204} fs={12} tone="muted">HTTP</T>
      <Box x={30} y={216} w={380} h={44} lines={['Puma', 'ワーカー（プロセス）× スレッドで実行']} bold subTone="muted" />
      <T x={400} y={238} fs={12} anchor="end" tone="acc">第23章</T>
      <Arrow x1={220} y1={260} x2={220} y2={284} />
      <T x={230} y={272} fs={12} tone="muted">Rack の呼び出し（call）</T>

      <rect x={30} y={284} width={380} height={202} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={46} y={300} bold>Rails アプリケーション</T>
      <T x={400} y={300} fs={12} anchor="end" tone="acc">第2〜4部</T>
      <Box x={50} y={316} w={340} h={28} lines="Rack ミドルウェア（第6章）" />
      <Arrow x1={220} y1={344} x2={220} y2={358} />
      <Box x={50} y={358} w={340} h={28} lines="ルーティング（第9章）" />
      <Arrow x1={220} y1={386} x2={220} y2={400} />
      <Box x={50} y={400} w={340} h={28} lines="コントローラー（第10章）" />
      <Arrow x1={132} y1={428} x2={132} y2={442} />
      <Arrow x1={307} y1={428} x2={307} y2={442} />
      <Box x={50} y={442} w={165} h={28} lines="ActiveRecord（第3部）" fs={12} />
      <Box x={225} y={442} w={165} h={28} lines="ActionView（第16章）" fs={12} />

      <Arrow x1={132} y1={470} x2={132} y2={510} />
      <T x={140} y={494} fs={12} tone="muted">SQL</T>
      <Box x={50} y={510} w={165} h={40} lines="MySQL" fill="box4" />

      <Arrow x1={410} y1={336} x2={460} y2={336} />
      <T x={435} y={324} fs={12} anchor="middle" tone="muted">登録</T>
      <Box x={460} y={316} w={140} h={40} lines="Redis" fill="box4" />
      <Arrow x1={530} y1={356} x2={530} y2={400} />
      <T x={538} y={378} fs={12} tone="muted">取り出し</T>
      <Box x={460} y={400} w={140} h={48} lines={['Sidekiq', '第18章']} bold subTone="acc" />
      <Arrow d="M530,448 V530 H217" />
      <T x={540} y={490} fs={12} tone="muted">SQL</T>
    </Svg>
  )
}

/* ---------- 図 1-2 Rails を構成する gem の依存関係 ---------- */
function GemDependencyFigure() {
  return (
    <Svg
      id="1-2"
      w={640}
      h={330}
      label="Rails 8.1.4.1 を構成する gem の実行時の依存関係。最上段に railties、actioncable、actionmailer、activestorage がある。railties と actioncable は actionpack に依存する。actionmailer は actionpack、actionview、activejob に依存する。activestorage は actionpack、activerecord、activejob に依存する。中段の actionpack は actionview に、activerecord は activemodel に依存する。最下段の activesupport には全 gem が依存する"
    >
      <Box x={20} y={20} w={135} h={40} lines="railties" mono />
      <Box x={172} y={20} w={135} h={40} lines="actioncable" mono />
      <Box x={324} y={20} w={135} h={40} lines="actionmailer" mono />
      <Box x={476} y={20} w={144} h={40} lines="activestorage" mono />

      <Box x={80} y={115} w={140} h={40} lines="actionpack" mono />
      <Box x={430} y={115} w={150} h={40} lines="activerecord" mono />

      <Box x={20} y={205} w={150} h={40} lines="actionview" mono />
      <Box x={245} y={205} w={150} h={40} lines="activejob" mono />
      <Box x={470} y={205} w={150} h={40} lines="activemodel" mono />

      <Box x={20} y={280} w={600} h={36} lines="activesupport（すべての gem が依存する。矢印は省略）" fill="box5" />

      <Arrow x1={87} y1={60} x2={120} y2={113} />
      <Arrow x1={239} y1={60} x2={182} y2={113} />
      <Arrow x1={350} y1={60} x2={214} y2={113} />
      <Arrow x1={372} y1={60} x2={166} y2={203} />
      <Arrow x1={398} y1={60} x2={322} y2={203} />
      <Arrow x1={540} y1={60} x2={520} y2={113} />
      <Arrow d="M490,60 C 410,70 405,170 362,203" />
      <Arrow d="M500,60 L 224,142" />
      <Arrow x1={505} y1={155} x2={540} y2={203} />
    </Svg>
  )
}

/* ---------- 図 1-3 process_action の super の連鎖 ---------- */
const processActionChain: [string, string][] = [
  ['ActiveRecord::Railties::ControllerRuntime', 'DB の処理時間の集計をリセット'],
  ['ActionController::ParamsWrapper', 'JSON などのパラメーターをラップ'],
  ['ActionController::Instrumentation', '計測イベントを発行'],
  ['ActionController::Rescue', '例外を rescue_from の処理へ渡す'],
  ['AbstractController::Callbacks', 'before_action などを実行'],
  ['ActionController::Rendering', 'リクエストのフォーマットを設定'],
  ['AbstractController::Base', 'アクションのメソッドを呼ぶ'],
]

function ProcessActionChainFigure() {
  const top = 16
  const step = 52
  return (
    <Svg
      id="1-3"
      w={640}
      h={top + step * processActionChain.length - 4}
      label={`ApplicationController#process_action を呼んだときに super でたどられる7つの定義。上から順に ${processActionChain.map(([m, r]) => `${m}（${r}）`).join('、')}`}
    >
      {processActionChain.map(([mod, role], i) => {
        const y = top + i * step
        return (
          <g key={mod}>
            <Box x={20} y={y} w={340} h={34} lines={mod} mono fs={12} fill={i === 6 ? 'box' : 'box2'} />
            <T x={376} y={y + 17} fs={12.5}>
              {role}
            </T>
            {i < processActionChain.length - 1 && (
              <>
                <Arrow x1={190} y1={y + 34} x2={190} y2={y + step} />
                <T x={200} y={y + 43} fs={11} tone="muted" mono>
                  super
                </T>
              </>
            )}
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 図 1-4 本書の図の凡例 ---------- */
function LegendFigure() {
  return (
    <Svg
      id="1-4"
      w={600}
      h={250}
      label="本書の図の凡例。灰色の箱はクラス・プロセス・構成要素、橙の箱はモジュール、青の箱は特異クラス、緑の箱はデータ・外部のサービス、紫の箱は特に注目してほしい要素、破線の箱は省略したものや概念上の要素を表す。実線の矢印は処理や呼び出しの流れ、破線の矢印は参照や所属、太い青の矢印は図の中で注目する経路を表す"
    >
      <Box x={20} y={16} w={170} h={40} lines="クラス・プロセス" />
      <Box x={215} y={16} w={170} h={40} lines="モジュール" fill="box2" />
      <Box x={410} y={16} w={170} h={40} lines="特異クラス" fill="box3" />
      <Box x={20} y={72} w={170} h={40} lines="データ・外部のサービス" fill="box4" fs={12} />
      <Box x={215} y={72} w={170} h={40} lines="注目してほしい要素" fill="box5" />
      <Box x={410} y={72} w={170} h={40} lines="省略・概念上の要素" fill="bg" dashed />

      <Arrow x1={30} y1={150} x2={150} y2={150} />
      <T x={170} y={150}>処理・呼び出しの流れ</T>
      <Arrow x1={30} y1={186} x2={150} y2={186} dashed />
      <T x={170} y={186}>参照・所属（superclass、クラスへの参照など）</T>
      <Arrow x1={30} y1={222} x2={150} y2={222} accent />
      <T x={170} y={222}>図の中で注目する経路</T>
    </Svg>
  )
}

const ch01: Chapter = {
  number: 1,
  part: 1,
  title: '全体像とソースコードの調べ方',
  summary:
    'ブラウザーからデータベースまでの構成要素と、それぞれを扱う章を示します。あわせて、Rails や Ruby のメソッドがどこで定義されているかを自分で調べる方法を説明します。',
  goals: [
    '本番環境でリクエストが通る構成要素（ロードバランサー、Nginx、Puma、Rails、MySQL）と、それぞれを扱う章を対応付けられる',
    'Rails を構成する gem の役割と依存関係を説明できる',
    '本書の基準バージョンと、Rails 7.2 との違いの示し方を理解する',
    'owner・source_location・super_method を使い、メソッドの定義場所と呼び出し順を自分で特定できる',
    'debug gem と TracePoint を使い、実行中の処理を追跡できる',
  ],
  prerequisites: [],
  sections: [
    {
      id: 'scope',
      title: '本書が扱う構成要素',
      body: (
        <>
          <p>
            業務で Rails アプリを改修するとき、多くの場合はコントローラーやモデルのコードだけを読んでいます。しかし、ブラウザーが送ったリクエストは、アプリのコードに届くまでにいくつものソフトウェアを通ります。Rails
            の内部でも、アプリのコードが呼ばれる前後に多くの処理が実行されます。本書はこの経路全体を対象にし、それぞれの段階で何が起きているかを、Ruby
            の言語仕様と Rails の実際のソースコードに基づいて説明します。
          </p>
          <p>
            図1-1 は、ロードバランサーの後ろに Nginx と Puma を置く構成で、1つのリクエストがどこを通るかを示したものです。各要素の右上に、その要素を詳しく扱う章を書いています。
          </p>
          <Figure n="1-1" title="本番構成と本書の章" caption="模式図。サーバーの台数、Puma のワーカー数、DB の構成は省略しています。">
            <ArchitectureFigure />
          </Figure>
          <p>図の上から順に、各要素の役割を簡単に説明します。</p>
          <ul>
            <li>
              <Term en="Application Load Balancer">ALB</Term>：AWS のロードバランサーです。ブラウザーとの HTTPS 通信（TLS）をここで終わらせ、復号した HTTP
              リクエストを複数のサーバーに振り分けます。後ろのサーバーには、元のクライアントの IP アドレスや、元の通信が HTTPS だったことをヘッダーで伝えます（
              <ChapterLink n={25} />）。
            </li>
            <li>
              <Term>Nginx</Term>：各サーバーの前段で HTTP を受け取ります。画像や CSS などの静的ファイルは自分で返し、それ以外のリクエストを Puma に転送します。このように、受け取ったリクエストを後ろのサーバーに転送するサーバーを
              <Term en="reverse proxy">リバースプロキシ</Term>と呼びます（<ChapterLink n={24} />）。
            </li>
            <li>
              <Term>Puma</Term>：Ruby で書かれたアプリケーションサーバーです。HTTP リクエストを解析し、Rails アプリを Ruby のメソッド呼び出しとして実行します。複数のプロセス（ワーカー）と、各プロセス内の複数のスレッドで、同時に複数のリクエストを処理します（
              <ChapterLink n={23} />）。
            </li>
            <li>
              Rails アプリケーション：Puma から Rack という規約に従って呼び出されます。リクエストはまずミドルウェアの列を通り、ルーティングで行き先のコントローラーとアクションが決まり、コントローラーがモデル（ActiveRecord）とビュー（ActionView）を使ってレスポンスを作ります（第2部〜第4部）。
            </li>
            <li>MySQL：ActiveRecord が SQL を送るデータベースです（第3部）。</li>
            <li>
              Redis と Sidekiq：時間のかかる処理（メール送信など）をリクエストとは別に実行する仕組みです。Rails はジョブを Redis に登録し、別プロセスの Sidekiq が取り出して実行します（
              <ChapterLink n={18} />）。
            </li>
          </ul>
          <p>
            第1部では、この構成の説明に入る前に Ruby のオブジェクトモデルを扱います。Rails の内部コードは、モジュールの組み込み、特異クラス、ブロック、メタプログラミングといった Ruby
            の機能を多用しています。たとえば、モデルに書く <code>has_many :comments</code> は Ruby のメソッド呼び出しであり、その実行結果としてクラスにメソッドが追加されます。この仕組みを説明できるようにすることが第1部の目的です。
          </p>
        </>
      ),
    },
    {
      id: 'gems',
      title: 'Rails を構成する gem',
      body: (
        <>
          <p>
            Gemfile に書く <code>gem "rails"</code> の rails gem 自体には、ほとんどコードがありません。rails gem は Rails を構成する12個の gem に依存していて、それらがまとめてインストールされます
            <Ref n={10} />。本書で扱う gem と役割を次の表に示します。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>gem</th>
                  <th>主な役割</th>
                  <th>主に扱う章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>activesupport</code>
                  </td>
                  <td>
                    コア拡張（<code>blank?</code> や時刻の計算など）、<code>ActiveSupport::Concern</code>、<code>ActiveSupport::Callbacks</code>、計測用の通知など、他のすべての gem
                    が使う共通部品
                  </td>
                  <td>第5章ほか</td>
                </tr>
                <tr>
                  <td>
                    <code>activemodel</code>
                  </td>
                  <td>バリデーション、属性の型変換、変更の追跡など、データベースに依存しないモデルの機能</td>
                  <td>第11章、第14章</td>
                </tr>
                <tr>
                  <td>
                    <code>activerecord</code>
                  </td>
                  <td>データベースとのやり取り（テーブルとクラスの対応付け、SQL の生成、トランザクション）</td>
                  <td>第3部</td>
                </tr>
                <tr>
                  <td>
                    <code>actionpack</code>
                  </td>
                  <td>
                    ミドルウェア・ルーティング・リクエストとレスポンス（<code>ActionDispatch</code>）と、コントローラー（<code>ActionController</code>、<code>AbstractController</code>）
                  </td>
                  <td>第6章、第9章、第10章</td>
                </tr>
                <tr>
                  <td>
                    <code>actionview</code>
                  </td>
                  <td>テンプレートの探索と描画、ヘルパー</td>
                  <td>第16章</td>
                </tr>
                <tr>
                  <td>
                    <code>activejob</code>
                  </td>
                  <td>非同期ジョブの共通インターフェース</td>
                  <td>第18章</td>
                </tr>
                <tr>
                  <td>
                    <code>actionmailer</code>、<code>activestorage</code>
                  </td>
                  <td>メール送信、ファイル添付</td>
                  <td>第19章</td>
                </tr>
                <tr>
                  <td>
                    <code>actioncable</code>
                  </td>
                  <td>WebSocket による双方向通信</td>
                  <td>第17章</td>
                </tr>
                <tr>
                  <td>
                    <code>railties</code>
                  </td>
                  <td>
                    <code>Rails::Application</code>、初期化処理、<code>rails</code> コマンド、ジェネレーター。各 gem を1つのアプリケーションにまとめる
                  </td>
                  <td>第7章</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            残りの <code>actiontext</code>（リッチテキスト）と <code>actionmailbox</code>（メールの受信）は本書の対象外です。
          </p>
          <p>
            図1-2 は、これらの gem が実行時にどの gem に依存しているかを示したものです。各 gem の gemspec に書かれた依存関係（開発時だけの依存を除く）から作りました
            <Ref n={10} />
            <Ref n={11} />。
          </p>
          <Figure
            n="1-2"
            title="Rails 8.1.4.1 を構成する gem の実行時の依存関係"
            caption="矢印は「依存する側 → 依存される側」。activesupport への矢印と、本書で扱わない actiontext・actionmailbox は省略しています。"
          >
            <GemDependencyFigure />
          </Figure>
          <p>図から読み取れることを3点挙げます。</p>
          <ol>
            <li>
              activesupport はすべての gem から使われます。<code>ActiveSupport::Concern</code> や <code>ActiveSupport::Callbacks</code> は、コントローラーにもモデルにも出てくるため、
              <ChapterLink n={5} />で先に説明します。
            </li>
            <li>
              railties は activerecord に依存していません。ActiveRecord は、自分の側に「Rails アプリに組み込まれるための設定」（Railtie）を持ち、アプリの初期化時にそれが読み込まれることで Rails
              と結び付きます。このため、Rails アプリから ActiveRecord を外すこともできます。この仕組みは<ChapterLink n={7} />で説明します。
            </li>
            <li>actionpack は actionview に依存しています。コントローラーの描画処理が ActionView を呼び出すためです。</li>
          </ol>
          <Callout title="依存関係の確かめ方">
            <p>
              インストール済みの gem の依存関係は <code>gem dependency actionpack -v 8.1.4.1</code> で表示できます。開発時だけの依存には <code>development</code> と付くので、実行時の依存と区別できます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'versions',
      title: '基準バージョンと Rails 7.2 との違いの示し方',
      body: (
        <>
          <p>本書の記述は、2026年11月11日時点の次のバージョンを基準にしています。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ソフトウェア</th>
                  <th>バージョン</th>
                  <th>リリース日</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ruby on Rails</td>
                  <td>8.1.4.1</td>
                  <td>
                    2026-11-04 <Ref n={1} />
                  </td>
                </tr>
                <tr>
                  <td>Ruby（CRuby）</td>
                  <td>4.0.9</td>
                  <td>
                    2026-10-23 <Ref n={2} />
                  </td>
                </tr>
                <tr>
                  <td>Nginx</td>
                  <td>1.30.6（stable）</td>
                  <td>
                    2026-10-14 <Ref n={3} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Puma、Rack など、その他のソフトウェアの版は<a href="#/">目次ページの「対象バージョン」</a>に載せています。本文のサンプルコードは、Ruby 4.0.9 と Rails 8.1.4.1
            の環境で実行して出力を確認しました。オブジェクトの ID のように実行ごとに変わる値は、手元の結果と一致しません。
          </p>
          <h3>Rails のバージョン番号とサポート期間</h3>
          <p>
            Rails のバージョンは「メジャー.マイナー.パッチ」の3つの数字で表し、セキュリティ修正だけを含むリリースには4つ目の数字を付けます（8.1.4.1 は 8.1.4 にセキュリティ修正を加えた版です）。Rails
            ではマイナーバージョン（8.0 から 8.1 など）でも互換性のない変更が入ることがあり、その場合は前の版で非推奨の警告が出ます
            <Ref n={4} />。
          </p>
          <p>
            公式のメンテナンスポリシーでは、各マイナーバージョンは最初のリリースから1年間バグ修正を、2年間セキュリティ修正を受けます。新しいマイナーバージョンが1年以上出なかった場合は、次の版が出るまで前の版のサポートを延長するとされています
            <Ref n={4} />。業務で使っている Rails 7.x の各版がいつまでサポートされるかは、付録Aで扱います。
          </p>
          <h3>Rails 7.2 との違いの示し方</h3>
          <p>
            業務のアプリは Rails 7.x 系です。本書は Rails 8.1 を基準に書きますが、Rails 7.2 と挙動や既定値が異なる箇所には、次のような枠で違いを示します。7.2
            より前の版との違いは、影響の大きいものだけを補足します。
          </p>
          <Callout kind="v72">
            <p>この枠には、Rails 7.2 で同じ処理がどう動くか、どの版でいつ変わったかを書きます。</p>
          </Callout>
          <p>
            1つ注意があります。Rails をバージョンアップしても、<code>config/application.rb</code> の <code>config.load_defaults</code>{' '}
            に古い版の番号が書かれていると、一部の設定は古い版の既定値のまま動きます。そのため、Rails 8.1 にアップグレードしたアプリでも、設定によっては Rails 7.2
            と同じ挙動をします。<code>load_defaults</code> の仕組みは<ChapterLink n={7} />で説明します。
          </p>
          <Callout kind="note" title="本書のデモのアプリケーション">
            <p>
              各章の実測は、Docker の ruby:4.0 イメージから起動したコンテナ内で <code>rails new</code> した Rails 8.1.4.1 のアプリケーション（以下、デモのアプリケーション）で行いました。ActionMailbox・ActionText・Minitest
              を外して作り、章が進むにつれてモデルや gem を加えています。第2部までは SQLite、第3部からは MySQL 8.4 につなぎ、第4部で Sidekiq・Redis・turbo-rails・ActiveStorage・RSpec を、第5部で本番環境の
              Puma と Nginx の設定を加えました。各章では、その時点のモデルや設定を示してから実測します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'find-source',
      title: 'メソッドの定義場所を調べる',
      body: (
        <>
          <p>
            アプリのコードから呼んでいるメソッドの多くは、アプリの中ではなく Rails の gem の中で定義されています。Ruby には、メソッドを表すオブジェクトを取り出し、その定義場所を調べるメソッドが用意されています
            <Ref n={5} />。
          </p>
          <ul>
            <li>
              <code>obj.method(:name)</code>：オブジェクト <code>obj</code> に対して呼ばれるメソッドを、<code>Method</code> オブジェクトとして取り出します。private メソッドも取り出せます。
            </li>
            <li>
              <code>Klass.instance_method(:name)</code>：クラス <code>Klass</code> のインスタンスに対して呼ばれるメソッドを、インスタンスを作らずに取り出します（<code>UnboundMethod</code>）。
            </li>
            <li>
              <code>owner</code>：そのメソッドが定義されているクラスまたはモジュールを返します。
            </li>
            <li>
              <code>source_location</code>：定義されているファイル名と行番号を返します。C で実装されたメソッドでは <code>nil</code> になります。
            </li>
            <li>
              <code>super_method</code>：そのメソッドの中で <code>super</code> を呼んだときに呼ばれる、次のメソッドを返します。次が無ければ <code>nil</code> です。
            </li>
          </ul>
          <p>
            次の例では、<code>has_many :comments</code> を書いた <code>Article</code> モデルで、<code>has_many</code> と <code>comments</code> の定義場所を調べています。
          </p>
          <Code
            lang="ruby"
            title="bin/rails console（Rails 8.1.4.1、ファイルパスの gem ディレクトリ部分は省略）"
            code={`
# app/models/article.rb
#   class Article < ApplicationRecord
#     has_many :comments
#   end

Article.method(:has_many).owner
# => ActiveRecord::Associations::ClassMethods
Article.method(:has_many).source_location
# => [".../activerecord-8.1.4.1/lib/active_record/associations.rb", 1427]

Article.instance_method(:comments).owner
# => Article::GeneratedAssociationMethods
Article.instance_method(:comments).source_location
# => [".../activerecord-8.1.4.1/lib/active_record/associations/builder/association.rb", 104]
`}
          />
          <p>
            <code>has_many</code> は <code>ActiveRecord::Associations::ClassMethods</code> というモジュールに定義されています。一方、<code>comments</code> は Article
            クラスにも、Rails のどのファイルにも、そのままの形では書かれていません。<code>has_many</code> を呼んだときに <code>Article::GeneratedAssociationMethods</code>{' '}
            というモジュールの中に作られたメソッドです。モジュールがクラスのメソッドとして使える理由は<ChapterLink n={3} />、メソッドが実行時に作られる仕組みは
            <ChapterLink n={5} />で説明します。
          </p>
          <h3>super でたどられる順序を調べる</h3>
          <p>
            Rails では、同じ名前のメソッドが複数のモジュールに定義され、それぞれが <code>super</code> で次の定義を呼ぶ形がよく使われます。<code>super_method</code>{' '}
            を繰り返し呼ぶと、その順序を一覧にできます。次の例は、コントローラーがアクションを実行するときに呼ばれる <code>process_action</code> を調べたものです。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
m = ApplicationController.instance_method(:process_action)
while m
  path, line = m.source_location
  puts "#{m.owner}  #{path.sub(%r{.*/gems/}, '')}:#{line}"
  m = m.super_method
end
`}
          />
          <Code
            lang="text"
            title="出力"
            code={`
ActiveRecord::Railties::ControllerRuntime  activerecord-8.1.4.1/lib/active_record/railties/controller_runtime.rb:34
ActionController::ParamsWrapper  actionpack-8.1.4.1/lib/action_controller/metal/params_wrapper.rb:257
ActionController::Instrumentation  actionpack-8.1.4.1/lib/action_controller/metal/instrumentation.rb:59
ActionController::Rescue  actionpack-8.1.4.1/lib/action_controller/metal/rescue.rb:35
AbstractController::Callbacks  actionpack-8.1.4.1/lib/abstract_controller/callbacks.rb:265
ActionController::Rendering  actionpack-8.1.4.1/lib/action_controller/metal/rendering.rb:197
AbstractController::Base  actionpack-8.1.4.1/lib/abstract_controller/base.rb:220
`}
          />
          <p>
            <code>process_action</code> という1つのメソッド名に対して7つの定義があり、上から順に呼ばれます。各定義は自分の処理をしてから <code>super</code>{' '}
            を呼び、最後の <code>AbstractController::Base</code> がアクションのメソッド（<code>index</code> や <code>show</code>）を呼び出します。図1-3 は、各定義が何をしているかをソースから読み取って並べたものです。
          </p>
          <Figure n="1-3" title="ApplicationController#process_action の super の連鎖" caption="右側の説明は、各定義のソースを読んで要約したものです。">
            <ProcessActionChainFigure />
          </Figure>
          <p>
            たとえば、<code>before_action</code> で登録した処理は5番目の <code>AbstractController::Callbacks</code> で実行されます。その外側の4番目に{' '}
            <code>ActionController::Rescue</code> があるため、<code>before_action</code> の中で発生した例外も <code>rescue_from</code>{' '}
            で処理できます。この順序がどう決まるかは<ChapterLink n={3} />、それぞれの処理の中身は<ChapterLink n={10} />で扱います。
          </p>
          <h3>gem のソースファイルを開く</h3>
          <p>アプリが使っている gem のソースは、Bundler のコマンドで場所を調べられます。</p>
          <Code
            lang="bash"
            code={`
# gem がインストールされているディレクトリを表示する
bundle info activerecord --path

# 環境変数 EDITOR（または BUNDLER_EDITOR）に設定したエディタで gem のディレクトリを開く
bundle open activerecord
`}
          />
          <p>
            <code>bundle info --path</code> は gem のパスを表示し<Ref n={6} />、<code>bundle open</code> はそのディレクトリをエディタで開きます
            <Ref n={7} />。手元のファイルはアプリが実際に読み込んでいる版なので、業務のアプリ（Rails 7.x）で調べるときは、本書が引用する 8.1.4.1 のソースと行番号や内容が異なることがあります。
          </p>
          <p>
            本書で Rails のソースを引用するときは、コードの見出しに GitHub 上の該当ファイルへのリンクを付けます。リンク先はタグ <code>v8.1.4.1</code>{' '}
            に固定しているので、Rails の開発が進んでもリンク先の内容は変わりません。
          </p>
        </>
      ),
    },
    {
      id: 'trace',
      title: '実行中の処理を追う',
      body: (
        <>
          <p>
            定義場所が分かっても、実際にどの順序で呼ばれ、そのとき変数に何が入っているかは、実行してみないと分からないことがあります。ここでは、実行中の処理を追う2つの方法を紹介します。
          </p>
          <p>不具合の再現から修正確認までの具体的な手順と、Pry・Better Errors・Bulletなどの使い分けは<ChapterLink n={28} />で扱います。</p>
          <h3>debug gem で止めて調べる</h3>
          <p>
            Rails 7 以降で新しく作ったアプリの Gemfile には、Ruby 公式のデバッガである debug gem が入っています
            <Ref n={9} />。Rails 8.1.4.1 の <code>rails new</code> で作った Gemfile では次のように書かれています。
          </p>
          <Code
            lang="ruby"
            title="Gemfile（rails new が生成した部分）"
            code={`
group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
end
`}
          />
          <p>
            止めたい行に <code>debugger</code>（<code>binding.break</code> の別名）を書き、その行を通るリクエストを送ると、<code>bin/rails server</code>{' '}
            を実行している端末でデバッガのプロンプトが開きます
            <Ref n={8} />
            <Ref n={9} />。プロンプトでは Ruby の式を評価できるほか、次のようなコマンドが使えます
            <Ref n={8} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>コマンド</th>
                  <th>動作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>s</code>（step）
                  </td>
                  <td>次に止まれる位置まで進む。メソッド呼び出しがあればその中に入る</td>
                </tr>
                <tr>
                  <td>
                    <code>n</code>（next）
                  </td>
                  <td>次の行まで進む。メソッド呼び出しの中には入らない</td>
                </tr>
                <tr>
                  <td>
                    <code>fin</code>（finish）
                  </td>
                  <td>現在のメソッドが終わるまで進む</td>
                </tr>
                <tr>
                  <td>
                    <code>c</code>（continue）
                  </td>
                  <td>次のブレークポイントまで実行を続ける</td>
                </tr>
                <tr>
                  <td>
                    <code>bt</code>（backtrace）
                  </td>
                  <td>現在位置までの呼び出し履歴を表示する。<code>bt /regexp/</code> で絞り込める</td>
                </tr>
                <tr>
                  <td>
                    <code>i</code>（info）
                  </td>
                  <td>現在選択しているメソッド呼び出しの実行状態（フレーム）にあるローカル変数・インスタンス変数・定数を表示する</td>
                </tr>
                <tr>
                  <td>
                    <code>l</code>（list）、<code>whereami</code>
                  </td>
                  <td>現在位置の周辺のソースを表示する</td>
                </tr>
                <tr>
                  <td>
                    <code>b Klass#method</code>（break）
                  </td>
                  <td>指定したメソッドが呼ばれたときに止まるブレークポイントを設定する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Rails の内部を調べるときは、アプリのアクションに <code>debugger</code> を置いて止め、<code>bt</code> で呼び出し履歴を見るのが手軽です。履歴には、Puma
            からミドルウェア、ルーティング、コントローラーを経てアクションに至るまでのメソッドが並びます。この履歴の各行が何をしているかを説明することが、第2部の内容です。
          </p>
          <h3>TracePoint で呼ばれたメソッドを記録する</h3>
          <p>
            <code>TracePoint</code> は、メソッドの呼び出しや例外の発生などのイベントが起きるたびにブロックを実行する Ruby の標準機能です
            <Ref n={12} />。次の例は、<code>Article.published</code> の実行中に呼ばれた Ruby のメソッドを記録します（<code>:call</code> は Ruby で定義されたメソッドの呼び出しを表すイベントです。C
            で実装されたメソッドは <code>:c_call</code> という別のイベントになります）。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行"
            code={`
Article.published # 初回だけ起きる準備処理を先に済ませる
calls = []
trace = TracePoint.new(:call) do |tp|
  calls << "#{tp.defined_class}##{tp.method_id}  #{tp.path.sub(%r{.*/gems/}, '')}:#{tp.lineno}"
end
trace.enable { Article.published }
puts calls.size
puts calls.first(5)
`}
          />
          <Code
            lang="text"
            title="出力（1行目のクラス名の括弧内は省略）"
            code={`
108
#<Class:Article(...)>#published  activerecord-8.1.4.1/lib/active_record/scoping/named.rb:174
ActiveRecord::Scoping::Named::ClassMethods#all  activerecord-8.1.4.1/lib/active_record/scoping/named.rb:22
ActiveRecord::Scoping::ClassMethods#current_scope  activerecord-8.1.4.1/lib/active_record/scoping.rb:25
#<Class:ActiveRecord::Scoping::ScopeRegistry>#current_scope  activerecord-8.1.4.1/lib/active_record/scoping.rb:77
#<Class:ActiveRecord::Scoping::ScopeRegistry>#instance  activerecord-8.1.4.1/lib/active_record/scoping.rb:80
`}
          />
          <p>
            <code>scope :published, -&gt; {'{ where(published: true) }'}</code> と1行書いただけの処理でも、108回の Ruby メソッド呼び出しが起きています。1行目の{' '}
            <code>#&lt;Class:Article(...)&gt;</code> は「Article クラスの特異クラス」を表す表記で、<code>published</code> がクラスメソッドとして定義されていることを示しています。特異クラスは
            <ChapterLink n={3} />で、<code>scope</code> の中のブロックが、検索条件や並び順を保持するオブジェクト（Relation）を self として実行される仕組みは<ChapterLink n={4} />で説明します。
          </p>
          <Callout kind="warn">
            <p>
              <code>debugger</code> の行を残したままデプロイしないよう注意してください。また、<code>TracePoint</code>{' '}
              を有効にしている間は、すべてのメソッド呼び出しでブロックが実行されるため処理が大幅に遅くなります。調査はコンソールや開発環境で、範囲を絞って行います。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'conventions',
      title: '本書の読み方と図の凡例',
      body: (
        <>
          <h3>章の構成</h3>
          <p>
            各章は「この章で学ぶこと」と前提となる章から始まり、基本的な概念、内部の仕組み、具体例と図解、例外や比較の順に進みます。最後に要点をまとめ、参考資料を載せます。確認問題や演習はありません。
          </p>
          <h3>コードの表記</h3>
          <ul>
            <li>
              <code># =&gt;</code> の後ろには、その式の戻り値（または <code>p</code> で表示される内容）を書きます。
            </li>
            <li>
              Rails や Ruby のソースを引用するときは、見出しにファイル名と行番号を書き、バージョンを固定した GitHub へのリンクを付けます。引用中のコメントは原文のままです。途中の行を省略した箇所には{' '}
              <code># ...（省略）</code> と書きます。
            </li>
            <li>アプリ側のサンプルコードは、説明に必要な部分だけを示します。</li>
          </ul>
          <p>引用の例を示します。見出しのリンクから GitHub 上の該当行を開けます。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/associations.rb（1427〜1430行）"
            href={`${GH}/activerecord/lib/active_record/associations.rb#L1427-L1430`}
            code={`
        def has_many(name, scope = nil, **options, &extension)
          reflection = Builder::HasMany.build(self, name, scope, options, &extension)
          Reflection.add_reflection(self, name, reflection)
        end
`}
          />
          <h3>図の凡例</h3>
          <p>本書の図は、次の凡例に従って描いています。とくに断りがない限り、すべての章で共通です。</p>
          <Figure n="1-4" title="本書の図の凡例" caption="色だけでなく、箱の中のラベルでも種類が分かるように描いています。">
            <LegendFigure />
          </Figure>
          <p>
            図の多くは、仕組みを説明するための模式図です。クラスの数やモジュールの並びを省略している場合は、図の説明文にその旨を書きます。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>リクエストは ALB → Nginx → Puma → Rails（ミドルウェア → ルーティング → コントローラー → モデル・ビュー）→ MySQL の順に通ります。本書はこの経路全体を扱います。</li>
          <li>
            rails gem は12個の gem に依存しています。activesupport はすべての gem から使われ、railties は activerecord に依存せず、Railtie を通じて各 gem と結び付きます。
          </li>
          <li>本書の基準は Rails 8.1.4.1、Ruby 4.0.9、Nginx 1.30.6 です。Rails 7.2 との違いは専用の枠で示します。</li>
          <li>
            <code>owner</code> と <code>source_location</code> で定義場所を、<code>super_method</code> で <code>super</code> の呼び出し順を調べられます。<code>process_action</code>{' '}
            には7つの定義があり、モジュールの並び順に従って呼ばれます。
          </li>
          <li>
            実行中の様子は、debug gem（<code>debugger</code> と <code>bt</code> など）や <code>TracePoint</code> で追えます。
          </li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Release 8.1.4.1', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/releases/tag/v8.1.4.1', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Rails 8.1.4.1 のリリース日（2026-11-04）と変更内容。' },
    { title: 'Ruby 4.0.9 Released', publisher: 'ruby-lang.org', url: 'https://www.ruby-lang.org/en/news/2026/10/23/ruby-4-0-9-released/', accessed: '2026-11-11', version: 'Ruby 4.0.9', note: 'Ruby 4.0.9 のリリース日。' },
    { title: 'nginx news: 2026', publisher: 'nginx.org', url: 'https://nginx.org/2026.html', accessed: '2026-11-11', note: '安定版 1.30.6（2026-10-14）と mainline 1.31.8（2026-10-21）のリリース。' },
    { title: 'Maintenance Policy for Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/maintenance_policy.html', accessed: '2026-11-11', note: 'バージョン番号の意味、バグ修正1年・セキュリティ修正2年の方針、サポート延長の条件。' },
    { title: 'class Method', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Method.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: 'owner、source_location、super_method の仕様。' },
    { title: 'bundle info', publisher: 'RubyGems Guides（Bundler コマンドリファレンス）', url: 'https://guides.rubygems.org/command-reference/bundle-info/', accessed: '2026-11-11', note: '--path オプション。' },
    { title: 'bundle open', publisher: 'RubyGems Guides（Bundler コマンドリファレンス）', url: 'https://guides.rubygems.org/command-reference/bundle-open/', accessed: '2026-11-11', note: 'EDITOR または BUNDLER_EDITOR で gem のディレクトリを開く。' },
    { title: 'ruby/debug README', publisher: 'ruby/debug（GitHub）', url: 'https://github.com/ruby/debug', accessed: '2026-11-11', version: 'debug 1.11.1', note: 'binding.break と別名 debugger、step・next・finish・continue・bt・info などのコマンド。' },
    { title: 'Debugging Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/debugging_rails_applications.html', accessed: '2026-11-11', version: 'Rails 8.1', note: 'Rails 7 以降の新規アプリの Gemfile に debug gem が含まれること、debugger でセッションに入る方法。' },
    { title: 'rails 8.1.4.1', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/rails/versions/8.1.4.1', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'rails gem の実行時依存（12個の gem と bundler）。' },
    { title: 'actionpack 8.1.4.1', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/actionpack/versions/8.1.4.1', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'actionpack の実行時依存（actionview、activesupport など）。他の gem も同様に gem dependency コマンドで確認した。' },
    { title: 'class TracePoint', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/TracePoint.html', accessed: '2026-11-11', version: 'Ruby 4.0', note: ':call と :c_call イベント、defined_class・method_id・path・lineno。' },
  ],
}

export default ch01
