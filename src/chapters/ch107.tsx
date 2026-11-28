import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(107)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const TPL = `${GH}/railties/lib/rails/generators/rails/app/templates`

/* ---------- 図1 ホストのカーネルとコンテナ ---------- */
function NamespaceFigure() {
  const container = (x: number, title: string, rows: string[]) => (
    <g>
      <rect x={x} y={14} width={360} height={232} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={x + 12} y={32} bold>{title}</T>
      {rows.map((r, i) => (
        <Box key={i} x={x + 12} y={46 + i * 39} w={336} h={33} lines={r} fs={12} fill={i === 4 ? 'box5' : 'box'} align="start" />
      ))}
      <Arrow x1={x + 180} y1={246} x2={x + 180} y2={264} />
    </g>
  )
  return (
    <Svg id={figure(1)} w={780} h={314} label="2つのコンテナはそれぞれ自分の PID、ホスト名、ネットワーク、マウントしたファイルの一覧を持ち、cgroup でメモリーなどの上限を決められる。どちらもホストと同じ1つの Linux カーネルにシステムコールを送る。">
      {container(20, 'コンテナ ag-107-ns（alpine で sleep）', [
        'PID：sleep が PID 1（ホストでは PID 32050）',
        'UTS：ホスト名は 967fe776c8c6',
        'ネットワーク：自分の lo と eth0',
        'マウント：イメージのファイル＋書き込み層',
        'cgroup：メモリーの上限 256MiB（--memory）',
      ])}
      {container(400, 'コンテナ web（Rails のイメージ）', [
        'PID：bin/thrust が PID 1、その子に Puma',
        'UTS：別のホスト名',
        'ネットワーク：別の IP アドレスとポート 80',
        'マウント：/rails と /usr/local/bundle',
        'cgroup：CPU とメモリーの上限',
      ])}
      <Box x={20} y={266} w={740} h={40} lines="Linux カーネル（ホストと全コンテナで1つ。uname -r はどこでも 5.15.167.4）" fill="box4" bold />
    </Svg>
  )
}

/* ---------- 図2 命令とレイヤー、ビルドのキャッシュ ---------- */
function LayerFigure() {
  const rows: [string, string, string][] = [
    ['FROM alpine:latest', '8.42MB', '再利用（変更なし）'],
    ['RUN apk add --no-cache curl', '5.28MB', 'CACHED（再利用）'],
    ['COPY app.rb /app/app.rb', '13B', '作り直す（app.rb が変わった）'],
    ['RUN echo "built" > /app/BUILD_INFO', '6B', '作り直す（前の層が変わった）'],
    ['CMD ["cat", "/app/BUILD_INFO"]', '0B（設定だけ）', '設定を書き直す'],
  ]
  return (
    <Svg id={figure(2)} w={780} h={300} label="Dockerfile の命令ごとに層ができる。v1 では alpine が 8.42MB、apk add が 5.28MB、COPY が 13B、echo が 6B、CMD は 0B。app.rb だけを変えた v2 では、apk add までは CACHED として再利用し、COPY とその後ろの命令を作り直した。">
      <T x={20} y={22} bold fs={12}>Dockerfile の命令（上から順に実行）</T>
      <T x={360} y={22} bold fs={12}>v1 の層の大きさ</T>
      <T x={520} y={22} bold fs={12}>app.rb を変えた v2</T>
      {rows.map(([cmd, size, v2], i) => (
        <g key={i}>
          <Box x={20} y={36 + i * 44} w={330} h={36} lines={cmd} fs={12} mono align="start" />
          <Box x={360} y={36 + i * 44} w={150} h={36} lines={size} fs={12} fill="box4" />
          <Box x={520} y={36 + i * 44} w={240} h={36} lines={v2} fs={12} fill={i >= 2 ? 'box5' : 'bg'} accent={i === 2 || i === 3} />
        </g>
      ))}
      <T x={20} y={262} fs={11.5} tone="muted">history の SIZE は、その命令で増えたファイルの大きさ。CMD は設定だけでファイルを持たない</T>
      <T x={20} y={282} fs={11.5} tone="muted">ある命令の層を作り直すと、それより後ろの命令もすべて作り直す（v2 の実行結果）</T>
    </Svg>
  )
}

/* ---------- 図3 書き込み層とボリューム ---------- */
function StorageFigure() {
  return (
    <Svg id={figure(3)} w={780} h={276} label="同じイメージから起動したコンテナ a と b は、読み取り専用のイメージの層を共有し、書き込み層はそれぞれ別に持つ。a が作った note.txt は b からは見えず、a を削除すると消える。ボリュームはコンテナとは別に残り、v1 が書いた orders.txt を v2 が読めた。">
      <T x={20} y={20} bold>同じイメージから起動した2つのコンテナ</T>
      <Box x={20} y={36} w={170} h={50} lines={['コンテナ a', 'note.txt を読める']} fs={12} bold subTone="muted" />
      <Box x={210} y={36} w={170} h={50} lines={['コンテナ b', 'No such file']} fs={12} bold subTone="muted" />
      <Box x={20} y={100} w={170} h={50} lines={['a の書き込み層', 'A /app/note.txt']} fs={12} fill="box5" />
      <Box x={210} y={100} w={170} h={50} lines={['b の書き込み層', '変更なし']} fs={12} fill="bg" dashed />
      <Box x={20} y={164} w={360} h={50} lines={['イメージの層（読み取り専用）', 'a と b が同じファイルを使う']} fs={12} fill="box2" subTone="muted" />
      <T x={20} y={236} fs={11.5} tone="muted">docker rm で a を消すと、a の書き込み層も消える</T>
      <T x={20} y={256} fs={11.5} tone="muted">新しく起動したコンテナの /app は BUILD_INFO と app.rb だけ</T>

      <T x={410} y={20} bold>ボリューム ag107-data</T>
      <Box x={410} y={36} w={160} h={50} lines={['コンテナ v1', 'orders.txt に書く']} fs={12} bold subTone="muted" />
      <Arrow x1={570} y1={61} x2={598} y2={61} />
      <Box x={600} y={36} w={160} h={50} lines={['v1 を削除（--rm）', 'コンテナは残らない']} fs={12} fill="bg" dashed />
      <Box x={600} y={100} w={160} h={50} lines={['コンテナ v2', 'order 1001 を読む']} fs={12} bold subTone="muted" />
      <Box x={410} y={164} w={350} h={50} lines={['ボリューム ag107-data', '/var/lib/docker/volumes/ag107-data/_data']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={490} y1={86} x2={490} y2={162} dashed />
      <Arrow x1={680} y1={150} x2={680} y2={162} dashed />
      <T x={410} y={236} fs={11.5} tone="muted">コンテナを消してもボリュームは残り、別のコンテナに付けられる</T>
      <T x={410} y={256} fs={11.5} tone="muted">ただし、このホストの中だけ。別のホストからは読めない</T>
    </Svg>
  )
}

/* ---------- 図4 マルチステージビルド ---------- */
function MultiStageFigure() {
  return (
    <Svg id={figure(4)} w={780} h={300} label="base ステージは ruby:4.0.9-slim に実行用のパッケージと環境変数を足す。build ステージは base にコンパイル用のパッケージを足して gem を入れ、アプリのコードを写してアセットをプリコンパイルする。最終ステージは base から作り直し、rails ユーザーで build ステージの /usr/local/bundle と /rails だけを写す。">
      <Box x={250} y={14} w={280} h={56} lines={['base', 'ruby:4.0.9-slim＋実行に使うパッケージ']} fs={12} bold subTone="muted" fill="box2" />
      <Arrow x1={330} y1={70} x2={200} y2={110} />
      <Arrow x1={450} y1={70} x2={580} y2={110} />
      <T x={228} y={92} fs={11} tone="muted" anchor="end">FROM base AS build</T>
      <T x={556} y={92} fs={11} tone="muted">FROM base</T>
      <Box x={20} y={112} w={350} h={140} fs={12} bold subTone="muted" fill="bg" dashed lines={[
        'build（最終イメージには入らない段階）',
        '＋ build-essential・git などコンパイル用',
        'bundle install（ネイティブ拡張をビルド）',
        'COPY . .／bootsnap precompile',
        'assets:precompile（SECRET_KEY_BASE_DUMMY=1）',
      ]} />
      <Box x={410} y={112} w={350} h={140} fs={12} bold subTone="muted" fill="box" lines={[
        '最終ステージ（配布するイメージ）',
        'USER 1000:1000（rails ユーザー）',
        'COPY --from=build /usr/local/bundle',
        'COPY --from=build /rails',
        'ENTRYPOINT docker-entrypoint／CMD thrust',
      ]} />
      <Arrow x1={370} y1={182} x2={408} y2={182} accent />
      <T x={20} y={272} fs={11.5} tone="muted">build ステージのコンパイラーやヘッダーファイルは写さないので、最終イメージに入らない</T>
      <T x={20} y={290} fs={11.5} tone="muted">実測（rails new store -d mysql）：build ステージのイメージ 1.03GB、最終イメージ 465MB</T>
    </Svg>
  )
}

/* ---------- 図5 消したファイルが前の層に残る ---------- */
function SecretLayerFigure() {
  return (
    <Svg id={figure(5)} w={780} h={256} label="3つの層のうち、2番目の COPY の層に master.key が入っている。3番目の RUN rm の層には削除の印 .wh.master.key が入り、コンテナから見た /app/config は空になる。しかし docker save で2番目の層を取り出すと master.key の中身を読める。">
      <T x={20} y={20} bold fs={12}>ag107-secret:v1 の層（下から順に重なる）</T>
      <Box x={20} y={36} w={400} h={46} fs={12} align="start" mono lines={['3. RUN … rm /app/config/master.key', '中身：app/config/.wh.master.key（削除の印）']} />
      <Box x={20} y={90} w={400} h={46} fs={12} align="start" mono fill="box5" accent lines={['2. COPY master.key /app/config/master.key', '中身：app/config/master.key（31 バイト）']} />
      <Box x={20} y={144} w={400} h={46} fs={12} align="start" mono fill="box2" lines={['1. FROM alpine:latest', '中身：Alpine のファイル一式（8.42MB）']} />
      <Box x={450} y={36} w={310} h={60} fs={12} lines={['コンテナから見た /app/config', '空（3 の印が 2 のファイルを隠す）']} bold subTone="muted" />
      <Box x={450} y={116} w={310} h={60} fs={12} lines={['docker save で取り出した 2 の層', '0123456789abcdef-demo-not-real']} bold subTone="danger" accent />
      <Arrow x1={420} y1={59} x2={448} y2={66} />
      <Arrow x1={420} y1={113} x2={448} y2={146} accent />
      <T x={20} y={214} fs={11.5} tone="muted">docker history には ARG の値も残る：RUN |1 API_TOKEN=tok_demo_123 /bin/sh -c …</T>
      <T x={20} y={236} fs={11.5} tone="muted">消したファイルは前の層に残るので、イメージを取得できる人は誰でも取り出せる</T>
    </Svg>
  )
}

/* ---------- 図6 AWS の構成 ---------- */
function AwsFigure() {
  const az = (ax: number, zone: string, pub: string, app: string, data: string, db: string, cache: string) => (
    <g>
      <rect x={ax} y={128} width={284} height={440} rx={8} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={ax + 12} y={552} fs={12} bold>{`AZ ${zone}`}</T>
      <rect x={ax + 10} y={156} width={264} height={104} rx={6} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={ax + 36} y={236} fs={11}>{`パブリック ${pub}`}</T>
      <Box x={ax + 20} y={180} w={120} h={40} lines="ALB ノード" fs={12} />
      <Box x={ax + 148} y={180} w={120} h={40} lines="NAT ゲートウェイ" fs={11} />
      <T x={ax + 36} y={250} fs={10.5} tone="muted">0.0.0.0/0 → インターネットゲートウェイ</T>
      <rect x={ax + 10} y={270} width={264} height={104} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={ax + 36} y={284} fs={11}>{`プライベート ${app}`}</T>
      <Box x={ax + 20} y={294} w={120} h={44} lines={['Web タスク', 'Puma']} fs={12} subTone="muted" fill="box5" />
      <Box x={ax + 148} y={294} w={120} h={44} lines={['ジョブのタスク', 'Sidekiq']} fs={12} subTone="muted" />
      <T x={ax + 36} y={360} fs={10.5} tone="muted">0.0.0.0/0 → NAT ゲートウェイ</T>
      <rect x={ax + 10} y={384} width={264} height={104} rx={6} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={ax + 36} y={398} fs={11}>{`DB 用 ${data}`}</T>
      <Box x={ax + 20} y={408} w={120} h={44} lines={['Aurora', db]} fs={12} subTone="muted" fill="box4" />
      <Box x={ax + 148} y={408} w={120} h={44} lines={['ElastiCache', cache]} fs={12} subTone="muted" fill="box4" />
      <T x={ax + 36} y={474} fs={10.5} tone="muted">VPC 内（local）の経路だけ</T>
    </g>
  )
  return (
    <Svg id={figure(6)} w={780} h={620} label="リージョンの中の VPC に、2つのアベイラビリティーゾーンがあり、それぞれにパブリックサブネット、アプリ用のプライベートサブネット、DB 用のサブネットがある。ブラウザーの接続はインターネットゲートウェイを通って各ゾーンの ALB ノードに届き、ALB が Web タスクに転送する。Web タスクは Aurora のライターに、ジョブのタスクは ElastiCache に接続する。プライベートサブネットからインターネットへの接続は NAT ゲートウェイを通る。S3、CloudWatch、ECR、Parameter Store は VPC の外にあるリージョンのサービスで、タスクから接続する。">
      <Box x={280} y={8} w={220} h={36} lines="ブラウザー（インターネット）" fs={12} bold />
      <rect x={8} y={56} width={764} height={556} rx={10} fill="none" stroke="var(--fig-line)" />
      <T x={20} y={72} fs={12} bold>リージョン（例：ap-northeast-1）</T>
      <rect x={20} y={86} width={600} height={516} rx={8} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={32} y={104} fs={12} bold>VPC 10.0.0.0/16</T>
      <Box x={250} y={92} w={180} h={28} lines="インターネットゲートウェイ" fs={12} fill="box4" />
      {az(32, 'ap-northeast-1a', '10.0.101.0/24', '10.0.1.0/24', '10.0.21.0/24', 'ライター', 'プライマリー')}
      {az(324, 'ap-northeast-1c', '10.0.102.0/24', '10.0.2.0/24', '10.0.22.0/24', 'リーダー', 'レプリカ')}
      <Box x={42} y={500} w={556} h={30} lines="Aurora のクラスターボリューム（各 AZ にデータの複製を持つ）" fs={11} fill="box4" dashed />
      <T x={32} y={586} fs={11} tone="muted">実線：接続を始める向き（応答は同じ接続で戻る）　破線：VPC の外にある AWS のサービスへの接続</T>
      <Arrow x1={390} y1={44} x2={360} y2={90} accent />
      <Arrow d="M300,120 L112,178" accent />
      <Arrow d="M380,120 L404,178" accent />
      <Arrow x1={58} y1={220} x2={58} y2={292} accent />
      <Arrow x1={350} y1={220} x2={350} y2={292} accent />
      <Arrow x1={58} y1={338} x2={58} y2={406} />
      <Arrow d="M380,338 L166,408" />
      <Arrow x1={290} y1={338} x2={290} y2={406} />
      <Arrow x1={290} y1={294} x2={290} y2={222} />
      <Arrow d="M240,180 L340,122" />
      <Box x={632} y={128} w={128} h={44} lines={['ECR', 'イメージ']} fs={12} subTone="muted" fill="box4" />
      <Box x={632} y={190} w={128} h={44} lines={['S3', '添付ファイル']} fs={12} subTone="muted" fill="box4" />
      <Box x={632} y={252} w={128} h={44} lines={['CloudWatch', 'ログ・メトリクス']} fs={12} subTone="muted" fill="box4" />
      <Box x={632} y={314} w={128} h={44} lines={['Parameter Store', '秘密情報']} fs={12} subTone="muted" fill="box4" />
      <T x={632} y={380} fs={11} tone="muted">VPC の外にある</T>
      <T x={632} y={396} fs={11} tone="muted">リージョンのサービス</T>
      <Arrow d="M594,306 L630,214" dashed />
      <Arrow d="M594,326 L630,276" dashed />
    </Svg>
  )
}

/* ---------- 図7 1件の要求とセキュリティグループ（段階送り） ---------- */
const sgSteps = [
  {
    label: '1. 名前解決',
    detail: (
      <p>
        ブラウザーが <code>shop.example.com</code> を名前解決すると、DNS のレコードが ALB の DNS 名を指し、ALB の DNS 名は有効にした AZ ごとのノードの IP アドレスに解決されます。ブラウザーはそのうちの1つに TCP で接続します。ここまではセキュリティグループの判定がありません。
      </p>
    ),
  },
  {
    label: '2. ALB が受ける',
    detail: (
      <p>
        ブラウザーから ALB のノードへの 443 番ポートの接続は、ALB に付けた <code>alb-sg</code> の受信ルール「TCP 443、送信元 0.0.0.0/0」で許可されます。ALB は TLS を終端し、リスナーのルールで転送先のターゲットグループを選びます。ここで ALB とブラウザーの間の接続（フロントエンド）ができます。
      </p>
    ),
  },
  {
    label: '3. Web タスクへ転送',
    detail: (
      <p>
        ALB はターゲットグループに登録された Web タスクの ENI のプライベート IP アドレスへ、新しい接続（バックエンド）で HTTP を送ります。タスクに付けた <code>web-sg</code> の受信ルール「TCP 80、送信元 alb-sg」により、alb-sg を付けたネットワークインターフェースから来た接続だけが通ります。ALB のノードは AZ をまたいで転送することもあります。
      </p>
    ),
  },
  {
    label: '4. DB に問い合わせる',
    detail: (
      <p>
        Puma のスレッドが Active Record の接続プールから接続を借り、Aurora のクラスターエンドポイントの 3306 番ポートに SQL を送ります。DB に付けた <code>db-sg</code> の受信ルール「TCP 3306、送信元 web-sg」で許可されます。接続プールは接続を使い回すので、この TCP 接続は要求のたびに作られるとは限りません。
      </p>
    ),
  },
  {
    label: '5. S3 に保存する',
    detail: (
      <p>
        添付ファイルを Active Storage で S3 に保存するときは、タスクが S3 の HTTPS のエンドポイントに接続します。プライベートサブネットのルートテーブルに S3 用のゲートウェイエンドポイントの経路があれば NAT ゲートウェイを通りません。送信ルールは既定ですべて許可です。S3 が受け付けるかどうかは、セキュリティグループではなく、タスクロールの IAM のポリシーで決まります。
      </p>
    ),
  },
  {
    label: '6. 応答が戻る',
    detail: (
      <p>
        DB の結果、タスクの HTTP の応答、ALB からブラウザーへの応答は、どれも相手が始めた接続の上を逆向きに流れます。セキュリティグループはステートフルなので、許可した受信の接続に対する応答は送信ルールに関係なく出られ、自分が始めた接続への応答は受信ルールに関係なく入れます。
      </p>
    ),
  },
]

/* ---------- 図8 ローリング更新の時系列（段階送り） ---------- */
type Cell = '' | 'serve' | 'boot' | 'drain' | 'stop'
const rolloutRows: { name: string; cells: Cell[] }[] = [
  { name: '旧タスク 1', cells: ['serve', 'serve', 'serve', 'drain', 'stop'] },
  { name: '旧タスク 2', cells: ['serve', 'serve', 'serve', 'drain', 'stop'] },
  { name: '新タスク 1', cells: ['', 'boot', 'serve', 'serve', 'serve'] },
  { name: '新タスク 2', cells: ['', 'boot', 'serve', 'serve', 'serve'] },
]
const rolloutPhases = ['旧版だけ', '新タスク起動中', '両方に転送', '旧タスクを登録解除', '新版だけ']
const rolloutCounts = ['2', '4', '4', '4', '2']

function RolloutFigure({ step }: { step: number }) {
  const p = [140, 270, 400, 530, 650, 760]
  const rowY = [44, 82, 120, 158]
  const cell = (kind: Cell, i: number, r: number) => {
    const x = p[i] + 2
    const w = p[i + 1] - p[i] - 4
    const y = rowY[r]
    if (kind === 'serve') return <Box x={x} y={y} w={w} h={26} lines="要求を受ける" fs={11} fill={r < 2 ? 'box' : 'box5'} />
    if (kind === 'boot') return <Box x={x} y={y} w={w} h={26} lines="起動・ヘルスチェック" fs={11} fill="bg" dashed />
    if (kind === 'drain') return <Box x={x} y={y} w={w} h={26} lines="draining" fs={10.5} mono fill="bg" dashed />
    if (kind === 'stop') return <T x={x + 4} y={y + 13} fs={10.5} tone="muted">SIGTERM で停止</T>
    return null
  }
  const label = `desiredCount 2、minimumHealthyPercent 100、maximumPercent 200 のローリング更新の段階 ${step + 1}「${rolloutPhases[step]}」。タスク数は ${rolloutCounts.slice(0, step + 1).join('、')} と変わってきた。`
  return (
    <Svg id={`${figure(8)}-${step + 1}`} w={780} h={264} label={label}>
      <rect x={p[step]} y={6} width={p[step + 1] - p[step]} height={206} rx={4} fill="var(--fig-box5)" opacity={0.35} />
      {rolloutPhases.map((ph, i) => (
        <T key={i} x={(p[i] + p[i + 1]) / 2} y={22} fs={11} anchor="middle" bold={i === step} tone={i > step ? 'muted' : undefined}>{ph}</T>
      ))}
      {p.slice(1, 5).map((x, i) => (
        <line key={i} x1={x} y1={32} x2={x} y2={210} stroke="var(--fig-line)" strokeDasharray="3 3" />
      ))}
      {rolloutRows.map((row, r) => (
        <g key={row.name}>
          <T x={20} y={rowY[r] + 13} fs={12}>{row.name}</T>
          {row.cells.map((kind, i) => (i <= step ? <g key={i}>{cell(kind, i, r)}</g> : null))}
        </g>
      ))}
      <T x={20} y={200} fs={12}>タスク数</T>
      {rolloutCounts.map((c, i) =>
        i <= step ? (
          <T key={i} x={(p[i] + p[i + 1]) / 2} y={200} fs={13} anchor="middle" bold>{c}</T>
        ) : null,
      )}
      <T x={20} y={232} fs={11} tone="muted">desiredCount 2、minimumHealthyPercent 100、maximumPercent 200 の例（各段階の長さは実際の比率ではない）</T>
      <T x={20} y={252} fs={11} tone="muted">4 タスクが動く間は、DB の接続枠とサブネットの IP アドレスも 4 タスク分使う</T>
    </Svg>
  )
}

const rolloutSteps = [
  {
    label: '1. 旧版だけ',
    detail: (
      <>
        <RolloutFigure step={0} />
        <p>サービスを新しいタスク定義のリビジョンで更新した時点です。旧タスク2つが ALB から要求を受けていて、タスク数は desiredCount と同じ 2 です。</p>
      </>
    ),
  },
  {
    label: '2. 新タスク起動中',
    detail: (
      <>
        <RolloutFigure step={1} />
        <p>maximumPercent が 200 なので、タスクは 4 つまで動かせます。ECS は新タスクを2つ起動し、タスク数は 4 になります。Rails の読み込みや DB への接続が終わり、ALB のヘルスチェックに合格するまで、ALB は新タスクに要求を送りません。その間も旧タスク2つが要求を受けます。</p>
      </>
    ),
  },
  {
    label: '3. 両方に転送',
    detail: (
      <>
        <RolloutFigure step={2} />
        <p>新タスクがヘルスチェックに合格すると、ALB は旧タスクと新タスクの両方に要求を送ります。この期間は旧版と新版のコードが同じ DB を使うので、片方のコードだけが扱えるスキーマの変更をすると、入れ替え中にエラーが起こります。</p>
      </>
    ),
  },
  {
    label: '4. 旧タスクを登録解除',
    detail: (
      <>
        <RolloutFigure step={3} />
        <p>正常なタスクが 4 つになったので、minimumHealthyPercent 100 の下限（2 つ）を下回らずに旧タスクを止められます。ECS は旧タスクをターゲットグループから登録解除し（draining）、ALB は旧タスクに新しい要求を送らなくなります。処理中の要求が終わるのを待ってから、旧タスクに SIGTERM を送ります。</p>
      </>
    ),
  },
  {
    label: '5. 新版だけ',
    detail: (
      <>
        <RolloutFigure step={4} />
        <p>Puma は SIGTERM を受けると新しい接続の受け付けを止め、処理中の要求を終えてから終了します。stopTimeout を過ぎても終わらなければ SIGKILL で止められます。新タスク2つだけが残り、タスク数は desiredCount の 2 に戻ります。</p>
      </>
    ),
  },
]

/* ---------- 図9 EC2＋Capistrano と ECS Fargate ---------- */
function PlacementFigure() {
  const server = (x: number, lines: string[]) => <Box x={x} y={96} w={170} h={130} lines={lines} fs={11.5} bold subTone="muted" />
  return (
    <Svg id={figure(9)} w={780} h={330} label="左は EC2 と Capistrano の構成で、ALB の後ろの EC2 の web-1 と web-2 にそれぞれ Nginx、Puma、Sidekiq があり、cap production deploy が SSH で各台にリリースを置く。OS の更新やディスクの空きは運用者が管理する。右は ECS on Fargate の構成で、ALB の後ろに web サービスのタスクが2つ、別に worker サービスのタスクがある。ECR に push したイメージとタスク定義の新しいリビジョンでサービスを更新し、ホストと OS は AWS が管理する。">
      <rect x={10} y={10} width={375} height={310} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={22} y={30} bold>EC2＋Capistrano（サーバーを管理する）</T>
      <Box x={130} y={44} w={140} h={32} lines="ALB" fs={12} fill="box4" />
      <Arrow x1={180} y1={76} x2={107} y2={94} />
      <Arrow x1={220} y1={76} x2={288} y2={94} />
      {server(22, ['EC2 web-1（AZ a）', 'Nginx → Puma', 'Sidekiq（systemd）', '/var/www/myapp/current', 'ログはファイル＋logrotate'])}
      {server(203, ['EC2 web-2（AZ c）', 'Nginx → Puma', 'Sidekiq（systemd）', '/var/www/myapp/current', 'ログはファイル＋logrotate'])}
      <Box x={22} y={240} w={351} h={66} fs={11.5} bold subTone="muted" fill="box2" lines={['cap production deploy', 'SSH で各台にリリースを置き current を切り替える', 'OS の更新・再起動・ディスクの空きは運用者が管理']} />
      <Arrow x1={107} y1={240} x2={107} y2={228} dashed />
      <Arrow x1={288} y1={240} x2={288} y2={228} dashed />

      <rect x={395} y={10} width={375} height={310} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={407} y={30} bold>ECS on Fargate（タスクの数と中身を指定する）</T>
      <Box x={502} y={44} w={170} h={32} lines="ALB（ターゲットは IP）" fs={12} fill="box4" />
      <Arrow x1={560} y1={76} x2={492} y2={94} />
      {server(407, ['web サービス', 'タスク ×2（AZ a・c）', 'thrust → Puma', 'ログ：標準出力→CloudWatch', 'ターゲットグループに登録'])}
      {server(588, ['worker サービス', 'タスク ×1', 'sidekiq', 'ログ：標準出力→CloudWatch', 'ALB には登録しない'])}
      <Box x={407} y={240} w={351} h={66} fs={11.5} bold subTone="muted" fill="box2" lines={['イメージを ECR に push', 'タスク定義の新しいリビジョンでサービスを更新', 'ホストと OS の更新は AWS が受け持つ（Fargate）']} />
      <Arrow x1={492} y1={240} x2={492} y2={228} dashed />
      <Arrow x1={673} y1={240} x2={673} y2={228} dashed />
    </Svg>
  )
}

const nsRun = `
$ docker run -d --name ag-107-ns --memory 256m alpine:latest sleep 60
$ docker exec ag-107-ns ps -o pid,comm
PID   COMMAND
    1 sleep
    7 ps
$ docker inspect ag-107-ns --format 'host PID={{.State.Pid}}'
host PID=32050
$ docker exec ag-107-ns hostname
967fe776c8c6
$ docker exec ag-107-ns uname -r
5.15.167.4-microsoft-standard-WSL2
$ uname -r                      # ホストで実行
5.15.167.4-microsoft-standard-WSL2
`

const layerDockerfile = `
FROM alpine:latest
RUN apk add --no-cache curl
COPY app.rb /app/app.rb
RUN echo "built" > /app/BUILD_INFO
CMD ["cat", "/app/BUILD_INFO"]
`

const layerHistory = `
$ docker build -q -t ag107-layers:v1 .
$ docker image history ag107-layers:v1
IMAGE          CREATED         CREATED BY                                      SIZE
c9836bea3ef6   1 second ago    CMD ["cat" "/app/BUILD_INFO"]                   0B
<missing>      1 second ago    RUN /bin/sh -c echo "built" > /app/BUILD_INF…   6B
<missing>      4 seconds ago   COPY app.rb /app/app.rb # buildkit              13B
<missing>      4 seconds ago   RUN /bin/sh -c apk add --no-cache curl # bui…   5.28MB
<missing>      5 months ago    CMD ["/bin/sh"]                                 0B
<missing>      5 months ago    ADD alpine-minirootfs-3.24.1-x86_64.tar.gz /…   8.42MB
$ docker image inspect ag107-layers:v1 --format '{{len .RootFS.Layers}}'
4
`

const layerRebuild = `
$ echo 'puts "hello, again"' > app.rb
$ docker build --progress=plain -t ag107-layers:v2 . 2>&1 | grep -A1 '^#[0-9]* \\['
#5 [2/4] RUN apk add --no-cache curl
#5 CACHED
#7 [3/4] COPY app.rb /app/app.rb
#7 DONE 0.1s
#8 [4/4] RUN echo "built" > /app/BUILD_INFO
#8 DONE 1.4s
`

const writableRun = `
$ docker run -d --name ag-107-a ag107-layers:v1 sleep 300
$ docker run -d --name ag-107-b ag107-layers:v1 sleep 300
$ docker exec ag-107-a sh -c 'echo "from a" > /app/note.txt'
$ docker exec ag-107-a cat /app/note.txt
from a
$ docker exec ag-107-b cat /app/note.txt
cat: can't open '/app/note.txt': No such file or directory
$ docker diff ag-107-a
C /app
A /app/note.txt
$ docker diff ag-107-b
$ docker rm -f ag-107-a
$ docker run --rm ag107-layers:v1 ls /app
BUILD_INFO
app.rb
`

const volumeRun = `
$ docker volume create ag107-data
$ docker run --rm --name ag-107-v1 -v ag107-data:/data alpine:latest \\
    sh -c 'echo "order 1001" > /data/orders.txt'
$ docker run --rm --name ag-107-v2 -v ag107-data:/data alpine:latest cat /data/orders.txt
order 1001
$ docker volume inspect ag107-data --format '{{.Mountpoint}}'
/var/lib/docker/volumes/ag107-data/_data
`

const networkRun = `
$ docker network create ag107-net
$ docker run -d --rm --name ag-107-db --network ag107-net alpine:latest sleep 120
$ docker run --rm --network ag107-net alpine:latest sh -c \\
    'getent hosts ag-107-db; grep nameserver /etc/resolv.conf'
192.168.80.2      ag-107-db  ag-107-db
nameserver 127.0.0.11

# 既定のブリッジ（--network を付けない）では名前を引けない
$ docker run -d --rm --name ag-107-db2 alpine:latest sleep 120
$ docker run --rm alpine:latest sh -c 'getent hosts ag-107-db2 || echo "not resolved"'
not resolved

# ネットワークなし：ループバックしかない
$ docker run --rm --network none alpine:latest ip -4 addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    inet 127.0.0.1/8 scope host lo
`

const dockerfileBase = `
# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=4.0.9
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \\
    apt-get install --no-install-recommends -y curl default-mysql-client libjemalloc2 libvips && \\
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \\
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment variables and enable jemalloc for reduced memory usage and latency.
ENV RAILS_ENV="production" \\
    BUNDLE_DEPLOYMENT="1" \\
    BUNDLE_PATH="/usr/local/bundle" \\
    BUNDLE_WITHOUT="development" \\
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"
`

const dockerfileBuild = `
# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems
RUN apt-get update -qq && \\
    apt-get install --no-install-recommends -y build-essential default-libmysqlclient-dev git libvips libyaml-dev pkg-config && \\
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY vendor/* ./vendor/
COPY Gemfile Gemfile.lock ./

RUN bundle install && \\
    rm -rf ~/.bundle/ "\${BUNDLE_PATH}"/ruby/*/cache "\${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \\
    # -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
    bundle exec bootsnap precompile -j 1 --gemfile

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times.
# -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
RUN bundle exec bootsnap precompile -j 1 app/ lib/

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile
`

const dockerfileFinal = `
# Final stage for app image
FROM base

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \\
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash
USER 1000:1000

# Copy built artifacts: gems, application
COPY --chown=rails:rails --from=build "\${BUNDLE_PATH}" "\${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
`

const entrypoint = `
#!/bin/bash -e

# If running the rails server then create or migrate existing database
if [ "\${@: -2:1}" == "./bin/rails" ] && [ "\${@: -1:1}" == "server" ]; then
  ./bin/rails db:prepare
fi

exec "\${@}"
`

const imageSizes = `
$ docker build -t ag107-store:v1 .
$ docker build --target build -t ag107-store:build .
$ docker image ls --format '{{.Repository}}:{{.Tag}}  {{.Size}}' | grep -E 'ag107-store|ruby:4.0.9-slim'
ag107-store:build  1.03GB
ag107-store:v1     465MB
ruby:4.0.9-slim    173MB
$ docker run --rm --entrypoint '' ag107-store:v1 sh -c 'id; which gcc || echo "gcc なし"'
uid=1000(rails) gid=1000(rails) groups=1000(rails)
gcc なし
`

const serverRun = `
$ docker run -d --name ag-107-web --network rbdemo -p 8107:80 \\
    -e DB_HOST=rbdemo-mysql -e STORE_DATABASE_PASSWORD=pass \\
    -e SECRET_KEY_BASE=$(openssl rand -hex 64) ag107-store:v2
$ docker logs ag-107-web 2>&1 | grep -E 'Created database|Puma starting|Listening' | head -4
Created database 'ag_107'
Created database 'ag_107_cache'
Puma starting in single mode...
* Listening on http://0.0.0.0:3000
$ curl -s -o /dev/null -w '%{http_code}\\n' http://localhost:8107/up
200
$ docker top ag-107-web -o pid,ppid,cmd
`

const secretDockerfile = `
FROM alpine:latest
ARG API_TOKEN
COPY master.key /app/config/master.key
RUN echo "token=$API_TOKEN" > /tmp/used && rm /app/config/master.key /tmp/used
CMD ["ls", "-la", "/app/config"]
`

const secretRun = `
$ echo "0123456789abcdef-demo-not-real" > master.key
$ docker build -q --build-arg API_TOKEN=tok_demo_123 -t ag107-secret:v1 .
$ docker run --rm ag107-secret:v1
total 12
drwxr-xr-x    1 root     root          4096 Nov 27 11:14 .
drwxr-xr-x    1 root     root          4096 Nov 27 11:14 ..
$ docker image history --no-trunc --format '{{.Size}}\\t{{.CreatedBy}}' ag107-secret:v1 | head -4
0B   CMD ["ls" "-la" "/app/config"]
0B   RUN |1 API_TOKEN=tok_demo_123 /bin/sh -c echo "token=$API_TOKEN" > /tmp/used && rm /app/config/master.key /tmp/used # buildkit
31B  COPY master.key /app/config/master.key # buildkit
0B   ARG API_TOKEN
$ docker save ag107-secret:v1 -o image.tar && tar -xf image.tar
$ tar -tvf fbf23d7b…/layer.tar          # COPY の層
-rw-r--r-- 0/0              31 2026-11-27 20:14 app/config/master.key
$ tar -xOf fbf23d7b…/layer.tar app/config/master.key
0123456789abcdef-demo-not-real
$ tar -tvf 6e779d95…/layer.tar          # RUN rm の層
-rw------- 0/0               0 2026-11-27 20:14 app/config/.wh.master.key
`

const buildSecret = `
# syntax=docker/dockerfile:1
FROM alpine:latest
RUN --mount=type=secret,id=api_token \\
    echo "token length: $(wc -c < /run/secrets/api_token)" > /build-note
CMD ["cat", "/build-note"]

$ printf 'tok_demo_123' > token.txt
$ docker build -q --secret id=api_token,src=token.txt -t ag107-secret:v2 .
$ docker run --rm ag107-secret:v2
token length: 12
$ docker image history --no-trunc --format '{{.Size}}\\t{{.CreatedBy}}' ag107-secret:v2 | head -2
0B   CMD ["cat" "/build-note"]
17B  RUN /bin/sh -c echo "token length: $(wc -c < /run/secrets/api_token)" > /build-note # buildkit
`

const ecsSecrets = `
{
  "family": "shop-web",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::111122223333:role/shopTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::111122223333:role/shopTaskRole",
  "containerDefinitions": [{
    "name": "web",
    "image": "111122223333.dkr.ecr.ap-northeast-1.amazonaws.com/shop:4c5d6e7",
    "portMappings": [{ "containerPort": 80 }],
    "environment": [{ "name": "DB_HOST", "value": "shop.cluster-xxxx.ap-northeast-1.rds.amazonaws.com" }],
    "secrets": [
      { "name": "RAILS_MASTER_KEY",
        "valueFrom": "arn:aws:ssm:ap-northeast-1:111122223333:parameter/shop/production/rails_master_key" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": { "awslogs-group": "/ecs/shop-web", "awslogs-region": "ap-northeast-1",
                   "awslogs-stream-prefix": "web" }
    }
  }]
}
`

const routeTables = `
# パブリックサブネット（10.0.101.0/24、10.0.102.0/24）のルートテーブル
送信先            ターゲット
10.0.0.0/16      local                    # VPC の中
0.0.0.0/0        igw-0123456789abcdef0    # それ以外はインターネットゲートウェイ

# アプリ用プライベートサブネット（AZ a の 10.0.1.0/24）のルートテーブル
10.0.0.0/16      local
0.0.0.0/0        nat-0aaaaaaaaaaaaaaaa    # 同じ AZ の NAT ゲートウェイ
pl-61a54008      vpce-0bbbbbbbbbbbbbbbb   # S3 のプレフィックスリスト → ゲートウェイエンドポイント

# DB 用サブネット（10.0.21.0/24、10.0.22.0/24）のルートテーブル
10.0.0.0/16      local                    # VPC の外への経路を持たない
`

const sgRules = `
セキュリティグループ  向き  プロトコル・ポート  相手
alb-sg               受信  TCP 443             0.0.0.0/0（インターネット）
web-sg               受信  TCP 80              alb-sg
worker-sg            受信  （ルールなし）       ―
db-sg                受信  TCP 3306            web-sg、worker-sg
cache-sg             受信  TCP 6379            web-sg、worker-sg
（すべて）            送信  すべて              0.0.0.0/0（作成時の既定のルール）
`

const chapter: Chapter = {
  number: 107,
  part: 5,
  title: "コンテナと AWS の本番構成",
  summary: "Docker のイメージ・レイヤー・ボリューム・ネットワークを実際に動かして確かめ、rails new が作る Dockerfile を読みます。AWS の VPC・サブネット・セキュリティグループと ALB・RDS・ElastiCache・S3・CloudWatch の役割と通信の向きを整理し、EC2＋Capistrano と ECS Fargate の構成を比べます。",
  goals: [
    "イメージ、レイヤー、コンテナ、ボリューム、ネットワークを、docker の実行結果から説明できる",
    "rails new の Dockerfile の段階ごとに、何を作り、何を最終イメージに残すかを説明できる",
    "秘密情報をイメージに入れたときに取り出せる理由と、実行時に渡す方法を説明できる",
    "VPC・サブネット・ルートテーブル・セキュリティグループで、どの通信をどちら向きに許すかを読める",
    "EC2＋Capistrano と ECS Fargate の違いを、配備・プロセス管理・OS 更新・ログの点から比べて選べる",
  ],
  prerequisites: [103, 104, 105, 106],
  sections: [
    {
      id: "isolation",
      title: "コンテナで動くプロセスとホストの関係",
      body: (
        <>
          <p>
            Rails アプリを本番のサーバーで動かすには、アプリのコードのほかに、Ruby 4.0.9、Gemfile.lock に書かれた gem、mysql2 gem が使う MySQL のクライアントライブラリ、画像を変換する libvips などがそのサーバーに入っている必要があります。これらをサーバーごとに手作業や構成管理のツールで入れる方法では、開発者の PC、CI、本番のサーバーで入っているバージョンが少しずつ違うことがあり、手元では動くのに本番では gem のビルドに失敗する、といった差が出ます。
          </p>
          <p>
            <Term en="container image">コンテナイメージ</Term>（以下、イメージ）は、アプリのコードと、それを動かすのに必要な Ruby・gem・ライブラリのファイル、起動するコマンドなどの設定をまとめたものです。<Term en="container">コンテナ</Term>はイメージのファイルを使って起動したプロセスです。同じイメージを CI でも本番でも使えば、Ruby と gem のバージョンは同じになります。
          </p>
          <p>
            コンテナは仮想マシンと違い、OS のカーネルを自分では持ちません。Alpine Linux のイメージで <code>sleep</code> を動かすコンテナを起動し、中とホストから同じプロセスを見比べました（Docker Engine 20.10.17、WSL2 の Linux 5.15 上で実行）<Ref n={1} />。
          </p>
          <Code lang="bash" title="名前空間とカーネルを確かめる（実行結果つき）" code={nsRun} />
          <p>
            コンテナの中で <code>ps</code> を実行すると、<code>sleep</code> が PID 1、<code>ps</code> 自身が PID 7 でした。ホストで <code>docker inspect</code> を実行すると、同じ <code>sleep</code> はホストでは PID 32050 です。ホスト名もホストとは別の値（コンテナ ID の先頭）になっています。一方、<code>uname -r</code> が返すカーネルのバージョンはコンテナの中とホストで同じです。コンテナの中のプロセスもホストの Linux カーネルにシステムコールを送って動いています。
          </p>
          <p>
            この見え方の違いは Linux の<Term en="namespace">名前空間</Term>が作ります。名前空間は、プロセス番号の一覧、ホスト名、ネットワークのインターフェース、マウントしているファイルシステムなどを、プロセスのグループごとに別々に見せるカーネルの機能です。<code>--memory 256m</code> で指定したメモリーの上限は、cgroup（プロセスのグループごとにリソースの利用量を集計し制限する機能）で設定されます。cgroup と、ホストから見たプロセスのメモリーの読み方は<ChapterLink n={103} section="memory" />にあります。
          </p>
          <Figure n={figure(1)} title="ホストのカーネルとコンテナ" caption="上の実行結果をもとにした模式図。右のコンテナは、後で動かす Rails のイメージを例にしたもの。名前空間には、ここに挙げたほかにユーザーや IPC などの種類もある。">
            <NamespaceFigure />
          </Figure>
          <p>
            Rails の運用で PID 1 が関係するのは、コンテナを止めるときです。<code>docker stop</code> や ECS のタスクの停止では、まずコンテナの PID 1 に SIGTERM が送られ、決められた時間内に終わらなければ SIGKILL で強制的に止められます。PID 1 がシェルのままで Puma や Sidekiq がその子プロセスになっていると、シェルがシグナルを子に伝えないため、Puma が処理中の要求を終えてから止まる手順を踏めない場合があります。後で読む Rails の <code>bin/docker-entrypoint</code> が最後に <code>exec</code> を使うのは、起動するコマンド自身を PID 1 にするためです。
          </p>
          <p>同じイメージから、実行するコマンドだけを変えて複数のコンテナを起動できます。</p>
          <Code lang="text" title={"同じ Rails イメージを使う二つのプロセス"} code={"Web コンテナ      → ./bin/thrust ./bin/rails server（Puma）\nジョブ処理コンテナ → bundle exec sidekiq"} />
          <p>これは Puma と Sidekiq の gem を含むイメージの例です。Web 用とジョブ用のコンテナを分ければ、それぞれの数を独立して変えられます。停止の手順や監視はそれぞれに必要です。</p>
        </>
      ),
    },
    {
      id: "layers",
      title: "イメージのレイヤーとビルドのキャッシュ",
      body: (
        <>
          <p>
            イメージは <code>Dockerfile</code> というファイルに書いた命令から <code>docker build</code> で作ります。<code>FROM</code> で元にするイメージを選び、<code>RUN</code> でコマンドを実行し、<code>COPY</code> で手元のファイルをイメージに写します。ファイルを変える命令はそれぞれ1つの<Term en="layer">レイヤー</Term>（層）を作ります。レイヤーは、その命令の前後で増えたり変わったりしたファイルの差分です。次の Dockerfile でイメージを作り、<code>docker image history</code> で層を見ました。
          </p>
          <Code lang="text" title="Dockerfile（ag107-layers）" code={layerDockerfile} />
          <Code lang="bash" title="層の一覧（実行結果。COMMENT の列は省略）" code={layerHistory} />
          <p>
            下の2行は元にした <code>alpine:latest</code> の層で、ADD でファイル一式（8.42MB）を入れています。その上に、<code>apk add</code> で curl を入れた層（5.28MB）、<code>COPY</code> で app.rb を写した層（13B）、<code>RUN echo</code> でファイルを作った層（6B）が重なります。<code>CMD</code> は起動時のコマンドという設定だけを持ち、ファイルの層を作らないので 0B です。<code>RootFS.Layers</code> の数はファイルを持つ4つの層の数と一致しました。
          </p>
          <p>
            コンテナを起動すると、Docker はこれらの層を下から順に重ねて、1つのファイルシステムに見せます。同じホストで同じ層を使うイメージが複数あっても、層のファイルは1つだけ保存されます。レジストリからイメージを取得するときも、ホストにない層だけを転送します<Ref n={7} />。
          </p>
          <p>次に、app.rb の中身だけを変えて同じ Dockerfile をビルドし直しました。</p>
          <Code lang="bash" title="app.rb を変えてビルドし直す（実行結果）" code={layerRebuild} />
          <p>
            <code>apk add</code> の層は <code>CACHED</code> と表示され、前回の層をそのまま使いました。<code>COPY app.rb</code> は写すファイルの中身が変わったので作り直し、その後ろの <code>RUN echo</code> は命令が同じでも作り直しています。ビルドのキャッシュは、ある命令より前の層がすべて同じで、命令とその入力（COPY するファイルの中身など）も同じときだけ使われます。一度作り直しが起きると、それより後ろの命令はすべて実行し直します。
          </p>
          <Figure n={figure(2)} title="Dockerfile の命令とレイヤー、ビルドのキャッシュ" caption="上の2回のビルドの実行結果を並べたもの。">
            <LayerFigure />
          </Figure>
          <p>
            この規則から、変わる頻度の低いものを Dockerfile の前に、頻度の高いものを後ろに書きます。Rails アプリでは、gem の一覧（Gemfile と Gemfile.lock）は毎回のデプロイでは変わりませんが、アプリのコードは毎回変わります。後で読む rails new の Dockerfile も、Gemfile と Gemfile.lock だけを先に写して <code>bundle install</code> を実行し、その後で <code>COPY . .</code> でコード全体を写しています。コードだけを変えたビルドでは、時間のかかる gem のインストールにキャッシュが使われます。
          </p>
        </>
      ),
    },
    {
      id: "container-storage",
      title: "コンテナの書き込み層とボリューム",
      body: (
        <>
          <p>
            イメージの層は読み取り専用です。コンテナがファイルを作ったり変えたりすると、その変更はコンテナごとに作られる<Term en="writable container layer">書き込み層</Term>に入ります。前の節の <code>ag107-layers:v1</code> から2つのコンテナを起動し、片方だけでファイルを作りました<Ref n={7} />。
          </p>
          <Code lang="bash" title="書き込み層はコンテナごとに分かれる（実行結果）" code={writableRun} />
          <p>
            a で作った <code>/app/note.txt</code> は、同じイメージから起動した b からは見えません。<code>docker diff</code> はイメージの層と比べたコンテナの変更を表示し、<code>A</code> は追加、<code>C</code> は変更を表します。a を削除した後に同じイメージから起動し直すと、<code>/app</code> にはイメージに入っていた2つのファイルしかありません。コンテナを消すと書き込み層も消えます。
          </p>
          <p>
            コンテナを消しても残したいデータは、<Term en="volume">ボリューム</Term>に置きます。ボリュームは Docker が管理するディレクトリで、コンテナの指定したパスにマウントします<Ref n={2} />。
          </p>
          <Code lang="bash" title="ボリュームのデータはコンテナを消しても残る（実行結果）" code={volumeRun} />
          <p>
            v1 は書き込んだ後に <code>--rm</code> で削除されましたが、同じボリュームを付けた v2 は <code>order 1001</code> を読めました。ボリュームの実体はこのホストの <code>/var/lib/docker/volumes/</code> の下にあります。そのため、別のホストで動くコンテナからは読めません。ホストの故障に備えたバックアップや、別のホストへの移動は、ボリュームとは別に用意します。
          </p>
          <Figure n={figure(3)} title="書き込み層とボリュームの寿命" caption="上の2つの実行結果をもとにした模式図。書き込み層は、実際にはストレージドライバー（overlay2 など）がイメージの層の上に重ねて作る。">
            <StorageFigure />
          </Figure>
          <p>Rails アプリをコンテナで動かすときは、アプリが書き込むファイルを次の3つに分けて考えます。</p>
          <ul>
            <li>
              消えてよいもの：<code>tmp/pids</code> や <code>tmp/cache</code> などです。コンテナを作り直すたびに空から始まっても動作は変わりません。
            </li>
            <li>
              ログ：rails new が作る <code>config/environments/production.rb</code> は <code>config.logger = ActiveSupport::TaggedLogging.logger(STDOUT)</code> で、ログをファイルではなく標準出力に書きます。標準出力は Docker のログドライバーが受け取り、ECS では CloudWatch Logs に送れます（後の節）。
            </li>
            <li>
              残す必要があるもの：利用者がアップロードした添付ファイルなどです。Active Storage の <code>:local</code> サービスは <code>storage/</code> に書くので、タスクを置き換えると消え、別のタスクからも読めません。本番では S3 などのサービスに保存します。
            </li>
          </ul>
          <p>
            DB のデータもコンテナの外に置きます。本書の検証環境では MySQL をコンテナ（rbdemo-mysql）で動かしていますが、本番では RDS や Aurora を使い、バックアップと障害時の切り替えを AWS に任せる構成が多くあります。
          </p>
        </>
      ),
    },
    {
      id: "container-network",
      title: "コンテナのネットワークと名前解決",
      body: (
        <>
          <p>
            コンテナは自分のネットワーク名前空間を持ち、自分の IP アドレスとポートの一覧を持ちます。Docker でユーザーが作ったネットワーク（ユーザー定義のブリッジ）に複数のコンテナをつなぐと、コンテナ名を名前解決して互いの IP アドレスを得られます<Ref n={10} />。
          </p>
          <Code lang="bash" title="ネットワークと名前解決（実行結果）" code={networkRun} />
          <p>
            <code>ag107-net</code> につないだコンテナからは、<code>ag-107-db</code> という名前が 192.168.80.2 に解決されました。コンテナの <code>/etc/resolv.conf</code> は 127.0.0.11 を DNS サーバーに指定しており、これは Docker がユーザー定義のネットワークに用意する DNS サーバーです。<code>--network</code> を付けずに起動したコンテナは既定のブリッジにつながり、コンテナ名を名前解決できませんでした。<code>--network none</code> ではループバックのインターフェースしかなく、外へ通信できません。
          </p>
          <p>
            本書の検証環境では、Rails のコンテナと MySQL のコンテナを <code>rbdemo</code> という同じネットワークにつなぎ、Rails の設定では DB のホスト名を <code>rbdemo-mysql</code> と書いています。ホストの外からコンテナのポートに接続するには、<code>-p 8107:80</code> のようにホストのポートとコンテナのポートを対応づけます。名前解決と TCP 接続のしくみは<ChapterLink n={105} section="dns" />と<ChapterLink n={104} section="tcp" />で扱っています。
          </p>
          <p>
            ECS の Fargate では、ネットワークの形が Docker のブリッジとは違います。Fargate のタスクは <code>awsvpc</code> というネットワークモードで動き、タスクごとに VPC のサブネットの ENI（Elastic Network Interface。仮想的なネットワークインターフェース）とプライベート IP アドレスを1つ受け取ります。同じタスクの中のコンテナ同士は <code>localhost</code> で通信します<Ref n={24} />。タスクが VPC の中の1台のマシンのように IP アドレスを持つので、後で扱うセキュリティグループもタスクの ENI に付けます。ALB のターゲットグループも、EC2 のインスタンスではなくタスクの IP アドレスを登録する <code>ip</code> 型にします。
          </p>
        </>
      ),
    },
    {
      id: "dockerfile",
      title: "rails new が作る Dockerfile を読む",
      body: (
        <>
          <p>
            Rails 8.1.4.1 の <code>rails new store -d mysql</code>（Ruby 4.0.9）が作った Dockerfile を、3つのステージ（段階）に分けて読みます。1つの Dockerfile に <code>FROM</code> を複数書き、前のステージで作ったファイルを後のステージに写す方法を<Term en="multi-stage build">マルチステージビルド</Term>と呼びます<Ref n={8} /><Ref n={11} />。
          </p>
          <Code lang="text" title="Dockerfile（10〜28行目：base ステージ）" href={`${TPL}/Dockerfile.tt`} code={dockerfileBase} />
          <p>
            base ステージはほかの2つのステージの元になります。<code>ruby:4.0.9-slim</code> は Debian に Ruby だけを入れた小さめのイメージです。そこに実行時に必要なパッケージを入れます。<code>curl</code> はヘルスチェックなどに、<code>default-mysql-client</code> は mysql コマンドに、<code>libjemalloc2</code> はメモリーの割り当てを jemalloc に替えるために、<code>libvips</code> は Active Storage の画像の変換に使います。<code>rm -rf /var/lib/apt/lists …</code> を同じ <code>RUN</code> の中で実行しているのは、パッケージの一覧を層に残さないためです。別の <code>RUN</code> で消しても、前の層にファイルが残ります（「秘密情報」の節で確かめます）。<code>ENV</code> の <code>BUNDLE_WITHOUT="development"</code> は、development グループの gem を入れない指定です。
          </p>
          <Code lang="text" title="Dockerfile（30〜55行目：build ステージ）" href={`${TPL}/Dockerfile.tt`} code={dockerfileBuild} />
          <p>
            build ステージは gem とアセットを作るための段階です。mysql2 などネイティブ拡張を持つ gem は、インストール時に C のコードをコンパイルするので、コンパイラー（build-essential）や MySQL のヘッダーファイル（default-libmysqlclient-dev）が要ります。前の節で見たとおり、Gemfile と Gemfile.lock を先に写して <code>bundle install</code> を実行し、<code>COPY . .</code> は後にしています。
          </p>
          <p>
            最後の <code>SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile</code> は、CSS や JavaScript などのアセットを production 用にまとめて <code>public/assets</code> に書き出します。Rails は production で起動するときに <code>secret_key_base</code> を必要としますが、ビルドの時点では本物の値（credentials を復号する <code>RAILS_MASTER_KEY</code>）を渡したくありません。<code>SECRET_KEY_BASE_DUMMY</code> を設定すると、Rails はこのコマンドの間だけ仮の値を使います。本物の鍵がビルドの環境やイメージに入らないようにするための指定です。
          </p>
          <Code lang="text" title="Dockerfile（60〜77行目：最終ステージ）" href={`${TPL}/Dockerfile.tt`} code={dockerfileFinal} />
          <p>
            最終ステージは <code>FROM base</code> からもう一度始めます。build ステージで入れたコンパイラーやヘッダーファイルは引き継がず、<code>COPY --from=build</code> で、インストール済みの gem（<code>/usr/local/bundle</code>）と、アセットをプリコンパイルしたアプリのディレクトリ（<code>/rails</code>）だけを写します。gem のネイティブ拡張は build ステージですでにコンパイル済みなので、実行時にはコンパイラーが要りません。build ステージだけを <code>--target build</code> で別にビルドして大きさを比べました。
          </p>
          <Code lang="bash" title="段階ごとのイメージの大きさ（実行結果）" code={imageSizes} />
          <p>
            build ステージまで含んだイメージは 1.03GB、最終イメージは 465MB でした。差の大部分はコンパイラーや開発用のヘッダーファイル、gem のビルドで使った一時ファイルです。最終イメージで <code>gcc</code> を探すと見つかりません。イメージが小さいと、新しいタスクを起動するときにレジストリから取得するデータが減るので、起動までの時間を短くできます（この差はここでは測っていません）。使わないプログラムが少ないほど、脆弱性の調査や更新の対象も減ります。
          </p>
          <p>
            <code>USER 1000:1000</code> は、以降の命令とコンテナのプロセスを root ではなく <code>rails</code> ユーザーで実行する指定です。実行結果の <code>id</code> も uid=1000 でした。アプリに脆弱性があってコマンドを実行されても、root の権限で動いている場合よりできることが限られます。<code>COPY --chown=rails:rails</code> で、写したファイルの所有者もこのユーザーにしています。
          </p>
          <Figure n={figure(4)} title="rails new の Dockerfile の3つの段階" caption="Dockerfile と上の実行結果をもとにした図。大きさは docker image ls の表示（圧縮前）。">
            <MultiStageFigure />
          </Figure>
          <p>
            <code>ENTRYPOINT</code> に指定した <code>bin/docker-entrypoint</code> は、コンテナの起動時に <code>CMD</code> の前で必ず実行されるスクリプトです。
          </p>
          <Code lang="bash" title="bin/docker-entrypoint（rails new が生成）" href={`${TPL}/docker-entrypoint.tt`} code={entrypoint} />
          <p>
            起動するコマンドの最後の2つの引数が <code>./bin/rails</code> と <code>server</code> のときだけ <code>db:prepare</code> を実行します。<code>db:prepare</code> は、DB がなければ作ってスキーマを読み込み、あれば未実行のマイグレーションを実行します。<code>sidekiq</code> や <code>rails console</code> を起動するときは実行しません。最後の <code>exec "$&#123;@&#125;"</code> は、スクリプトのプロセスを指定したコマンドに置き換えるので、<code>CMD</code> の <code>./bin/thrust</code> が PID 1 になります。Thruster は Puma の前で動く HTTP のプロキシで、本書の ALB と Nginx の構成との関係は<ChapterLink n={29} section="kamal-thruster" />にあります。
          </p>
          <p>
            このイメージを検証環境の MySQL につないで起動しました。DB 名を <code>ag_107</code> にするために config/database.yml の production の DB 名だけを変えてビルドし直し（<code>ag107-store:v2</code>）、<code>RAILS_MASTER_KEY</code> の代わりに <code>SECRET_KEY_BASE</code> を環境変数で渡しています。
          </p>
          <Code lang="bash" title="Rails のイメージを起動する（実行結果）" code={serverRun} />
          <p>
            ログから、<code>bin/docker-entrypoint</code> の <code>db:prepare</code> が DB を作ってから Puma が起動したことがわかります。Thruster はポート 80 で受けて、ポート 3000 の Puma に転送しています。<code>/up</code> は rails new の config/routes.rb にあるヘルスチェック用の経路で、アプリが起動して例外なく応答できれば 200 を返します。ALB のヘルスチェックの設定に使えます。ただし、本番で <code>db:prepare</code> を Web のコンテナの起動ごとに実行すると、複数のタスクが同時にマイグレーションを始める場合があります。ECS では、マイグレーションを1回だけ実行する専用のタスクに分ける運用もあります（<a href="#/linux/case37">第6部の演習「マイグレーションを run-task で一度だけ流す」</a>）。
          </p>
        </>
      ),
    },
    {
      id: "secrets",
      title: "イメージに秘密情報を入れない",
      body: (
        <>
          <p>
            Rails の <code>config/master.key</code> は credentials を復号する鍵で、DB のパスワードや外部 API の鍵を読むのに使います。この鍵をイメージに入れると、イメージを取得できる人なら誰でも鍵を取り出せます。Dockerfile で鍵を写した後、別の <code>RUN</code> で消した場合にどうなるかを試しました（鍵の中身はデモ用の文字列）。
          </p>
          <Code lang="text" title="Dockerfile（ag107-secret:v1）" code={secretDockerfile} />
          <Code lang="bash" title="消したはずの鍵を取り出す（実行結果。tar のディレクトリ名は一部省略）" code={secretRun} />
          <p>
            コンテナの中の <code>/app/config</code> は空で、鍵は消えたように見えます。しかし <code>docker save</code> でイメージを tar に書き出し、<code>COPY</code> の層の <code>layer.tar</code> を開くと、鍵の中身を読めました。後の <code>RUN rm</code> の層には、ファイルの代わりに <code>.wh.master.key</code> という空のファイルが入っています。これは「下の層のこのファイルを見せない」という削除の印（whiteout）で、下の層のファイル自体は残っています。<code>--build-arg</code> で渡した値も、<code>docker image history</code> の <code>RUN</code> の行に <code>API_TOKEN=tok_demo_123</code> として表示されました。
          </p>
          <Figure n={figure(5)} title="消したはずの master.key が残る仕組み" caption="上の実行結果をもとにした図。層の中身は docker save で書き出した tar の一覧。">
            <SecretLayerFigure />
          </Figure>
          <p>秘密情報をイメージに入れないために、次の3つを組み合わせます。</p>
          <ul>
            <li>
              ビルドに送るファイルから外す：<code>docker build</code> は、カレントディレクトリのファイルをビルドの入力（ビルドコンテキスト）として送ります。rails new が作る <code>.dockerignore</code> には <code>/config/master.key</code>、<code>/config/credentials/*.key</code>、<code>/.env*</code> が書かれており、<code>COPY . .</code> でもこれらは写されません<Ref n={12} />。
            </li>
            <li>
              ビルド中にだけ使う値は、BuildKit のシークレットとして渡す：<code>RUN --mount=type=secret</code> で、その <code>RUN</code> の間だけ <code>/run/secrets/</code> にファイルとして見せられます<Ref n={9} />。
            </li>
            <li>実行時に必要な値は、コンテナを起動するときに環境変数などで渡す：イメージは環境ごとに同じものを使い、本番の鍵は本番で起動するときだけ渡します。</li>
          </ul>
          <Code lang="bash" title="ビルドのシークレットは層に残らない（実行結果）" code={buildSecret} />
          <p>
            ビルド中には値を読めた（長さ 12）一方で、<code>history</code> にはコマンドの文字列しか残らず、値は表示されませんでした。
          </p>
          <p>
            ECS では、タスク定義の <code>secrets</code> に Secrets Manager のシークレットか Systems Manager の Parameter Store のパラメーターを指定すると、コンテナの起動時に値を取り出して環境変数として渡します<Ref n={25} />。値を取り出すのはタスク実行ロール（ECS がイメージの取得やログの送信に使う IAM ロール）です。次はその指定の例です（ARN などの値は例）。
          </p>
          <Code lang="json" title="タスク定義の例（抜粋。実行していない設定例）" code={ecsSecrets} />
          <p>
            AWS のドキュメントは、シークレットの値を変えたら、新しいデプロイを強制するかタスクを起動し直さないと新しい値を取り出さない、と説明しています<Ref n={25} />。動いているタスクの環境変数は起動した時点の値のままです。また、環境変数の値は <code>docker inspect</code> やプロセスの環境（<code>/proc/PID/environ</code>）から読めるので、同じドキュメントは環境変数より漏えいしにくい方法（ファイルとして渡すなど）も挙げています。EC2 で systemd の EnvironmentFile から値を読む構成で、値を変えた後に何が起きるかは<a href="#/linux/case44">第6部の演習「Parameter Store の値を変えたのに、メールが送れないまま」</a>で確かめられます。credentials の仕組みそのものは<ChapterLink n={21} section="secrets" />にあります。
          </p>
        </>
      ),
    },
    {
      id: "aws",
      title: "AWS の基本構成：リージョン・VPC・サブネット・ルートテーブル",
      body: (
        <>
          <p>
            ここからは、作ったイメージを AWS で動かす構成を読みます。AWS のデータセンターは地域ごとに<Term en="Region">リージョン</Term>（例：東京の ap-northeast-1）にまとまっており、リージョンは互いに独立して動くよう設計されています。1つのリージョンには、互いに隔離された複数の<Term en="Availability Zone">アベイラビリティーゾーン</Term>（AZ。例：ap-northeast-1a）があります。AWS のドキュメントは、EC2 のインスタンスを複数の AZ に分けて起動すれば、リージョンの中の1か所の障害からアプリを守れると説明しています<Ref n={13} />。
          </p>
          <p>
            <Term en="Virtual Private Cloud">VPC</Term> は、リージョンの中に作る自分専用の仮想ネットワークで、<code>10.0.0.0/16</code> のように IP アドレスの範囲を決めて作ります。VPC の中を、AZ ごとに<Term en="subnet">サブネット</Term>（IP アドレスの範囲を分けたもの）に区切ります。サブネットは1つの AZ の中に収まり、AZ をまたげません<Ref n={14} />。EC2 のインスタンス、Fargate のタスク、RDS の DB インスタンス、ALB のノードは、どれもいずれかのサブネットに IP アドレスを持って置かれます。
          </p>
          <p>
            サブネットから出ていく通信の行き先は、そのサブネットに対応づけた<Term en="route table">ルートテーブル</Term>が決めます。ルートテーブルの各行は送信先の範囲とターゲットの組で、すべてのルートテーブルに VPC の中への <code>local</code> の経路があります。送信先に複数の行が当てはまるときは、範囲がもっとも狭い行（最長一致）が使われます<Ref n={15} />。
          </p>
          <Code lang="text" title={`図 ${figure(6)} の構成のルートテーブルの例（ID は例）`} code={routeTables} />
          <p>
            AWS のドキュメントは、サブネットの種類をルートテーブルの経路で区別しています<Ref n={14} />。<code>0.0.0.0/0</code>（VPC の外すべて）の経路が<Term en="internet gateway">インターネットゲートウェイ</Term>に向いているサブネットがパブリックサブネットで、そこに置いたリソースはパブリック IP アドレスがあればインターネットと直接通信できます。インターネットゲートウェイへの直接の経路を持たないサブネットがプライベートサブネットで、インターネットに出るには NAT ゲートウェイを通します。VPC の外への経路をまったく持たないサブネットは、隔離されたサブネット（isolated subnet）と呼ばれます。図 {figure(6)} では DB 用のサブネットをこの形にしています。
          </p>
          <p>
            <Term en="NAT gateway">NAT ゲートウェイ</Term>は、プライベートサブネットのインスタンスが VPC の外のサービスに接続できるようにし、外からはそのインスタンスへの接続を始められないようにするサービスです。パブリックサブネットに作り、Elastic IP アドレス（固定のパブリック IP アドレス）を付けます<Ref n={16} />。NAT ゲートウェイは作った AZ の中で冗長化されますが、1つの NAT ゲートウェイを全 AZ で共有すると、その AZ の障害でほかの AZ のリソースもインターネットに出られなくなります。そのため AWS のドキュメントは、AZ ごとに NAT ゲートウェイを作り、同じ AZ の NAT ゲートウェイを使うように経路を設定することを勧めています<Ref n={16} />。Rails のタスクが外部の決済 API やメールの送信サービスに接続する場合、この経路を通ります。
          </p>
          <Figure n={figure(6)} title="AWS 上の Rails の構成と通信の向き" caption="2つの AZ にまたがる構成の例（模式図）。ALB はクロスゾーン負荷分散が既定で有効なので、AZ a のノードから AZ c の Web タスクにも転送する（図では省略）。ジョブのタスクから ElastiCache、Web タスクから ElastiCache への矢印なども一部を省略した。S3 にはゲートウェイエンドポイント、ECR・CloudWatch・Parameter Store には NAT ゲートウェイか VPC のインターフェースエンドポイントを経由して接続する。">
            <AwsFigure />
          </Figure>
          <p>
            図 {figure(6)} の矢印は、接続を始める向きです。ブラウザーから始まる接続はインターネットゲートウェイを通って ALB のノードまでしか入らず、Web タスクのあるプライベートサブネットには ALB が別の接続を張ります。Web タスクが DB に接続するとき、DB は応答を返すだけで、DB からタスクへ接続を始めることはありません。プライベートサブネットのタスクから外への接続は NAT ゲートウェイを通り、外から NAT ゲートウェイを通ってタスクに接続を始めることはできません。どの区間で誰が接続を始めるかがわかると、ルートテーブルとセキュリティグループに何を書けばよいかが決まります。
          </p>
          <p>
            ALB だけで要求の転送と TLS の終端を受け持つ構成もあります。ALB の後ろに Nginx を置く場合は、アプリに届く前のバッファリングや配信のルールなど、Nginx にどの処理を任せるかを決めます。段階が増えるほど、通信の制限時間とログも段階ごとに管理します（<ChapterLink n={25} section="load-balancer" />、<ChapterLink n={24} section="reverse-proxy" />）。
          </p>
        </>
      ),
    },
    {
      id: "security-groups",
      title: "セキュリティグループで通信の向きと相手を絞る",
      body: (
        <>
          <p>
            <Term en="security group">セキュリティグループ</Term>は、関連づけたリソース（EC2 のインスタンス、Fargate のタスクの ENI、RDS、ALB など）に届く通信と出ていく通信を許可するルールの集まりです<Ref n={17} />。受信のルールには送信元・ポートの範囲・プロトコルを、送信のルールには送信先・ポートの範囲・プロトコルを書きます。ルールは許可だけを書き、拒否は書けません。どのルールにも当てはまらない通信は通りません。
          </p>
          <p>
            セキュリティグループは<Term en="stateful">ステートフル</Term>です。AWS のドキュメントは、インスタンスから送った要求に対する応答は受信ルールに関係なく届き、許可した受信の通信に対する応答は送信ルールに関係なく出ていける、と説明しています<Ref n={17} />。このため、ルールは「どちらが接続を始めるか」の向きだけで書けば足ります。Web タスクから DB への接続を許すなら、DB のセキュリティグループに受信ルールを書き、DB からタスクへの応答のためのルールは書きません。
          </p>
          <p>
            送信元には IP アドレスの範囲のほかに、別のセキュリティグループを指定できます。次の表は図 {figure(6)} の構成の例です。
          </p>
          <Code lang="text" title="セキュリティグループのルールの例" code={sgRules} />
          <p>
            <code>db-sg</code> の受信ルールの送信元を <code>web-sg</code> にすると、「web-sg を付けたネットワークインターフェースから来た 3306 番ポートへの接続」だけを許可します。Web タスクの数が増えたり、置き換えで IP アドレスが変わったりしても、新しいタスクに web-sg が付いていればルールを変える必要がありません。送信元を <code>10.0.1.0/24</code> のような IP アドレスの範囲で書くと、別の AZ のサブネット（10.0.2.0/24）に置いたタスクは入れません。この違いで1台だけが DB に接続できなくなる障害は、<a href="#/linux/case45">第6部の演習「web-2 だけが DB につながらない」</a>で調べられます。
          </p>
          <Figure n={figure(7)} title="1件の要求が通る経路とセキュリティグループの判定" caption="段階ごとに、どの接続を誰が始め、どのルールで許可されるかを示す概念モデル。実際には ALB とタスクの間の接続は複数の要求で使い回され、DB の接続も接続プールで使い回される。">
            <Stepper steps={sgSteps} />
          </Figure>
          <p>
            サブネット単位で通信を制御するネットワーク ACL という仕組みもあります。ネットワーク ACL はステートレスで、応答の向きのルールも書く必要があります。新しい VPC の既定のネットワーク ACL はすべての通信を許可しており、AWS のドキュメントは、多くの場合はセキュリティグループで要件を満たせると説明しています<Ref n={14} />。
          </p>
        </>
      ),
    },
    {
      id: "managed-services",
      title: "ALB・RDS と Aurora・ElastiCache・S3・CloudWatch の役割",
      body: (
        <>
          <p>図 {figure(6)} の各サービスが何を受け持ち、どこに置かれ、誰がどのポートに接続するかを表にまとめます。</p>
          <div className="table-wrap">
            <table>
              <caption>図 {figure(6)} の構成のサービスと通信の向き</caption>
              <thead><tr><th>サービス</th><th>受け持つこと</th><th>置く場所</th><th>接続を始める側 → ポート</th></tr></thead>
              <tbody>
                <tr><td>ALB</td><td>HTTPS を受けて TLS を終端し、Web タスクに転送する</td><td>2つ以上の AZ のパブリックサブネット</td><td>ブラウザー → 443、ALB → タスクの 80</td></tr>
                <tr><td>EC2 または Fargate</td><td>Puma と Sidekiq のプロセスを動かす</td><td>アプリ用のプライベートサブネット</td><td>タスク → DB・キャッシュ・外部 API</td></tr>
                <tr><td>RDS・Aurora</td><td>MySQL 互換の DB。注文などの業務データを保存する</td><td>DB 用のサブネット（DB サブネットグループ）</td><td>タスク → 3306</td></tr>
                <tr><td>ElastiCache</td><td>Redis 互換のキャッシュやキュー</td><td>DB 用のサブネット</td><td>タスク → 6379</td></tr>
                <tr><td>S3</td><td>添付ファイルなどのオブジェクトを保存する</td><td>VPC の外（リージョンのサービス）</td><td>タスク → 443（ゲートウェイエンドポイント経由）</td></tr>
                <tr><td>CloudWatch</td><td>メトリクス・アラーム・ログを集める</td><td>VPC の外（リージョンのサービス）</td><td>ECS のログドライバー → 443</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            ALB（Application Load Balancer）は、有効にした AZ ごとにノードを作るので、2つ以上の AZ のサブネットを指定する必要があります<Ref n={18} />。ALB は要求を処理するとき、ブラウザーとの接続（フロントエンド）と、ターゲットとの接続（バックエンド）の2つを持ちます。そのため ALB のセキュリティグループは、リスナーのポート（443）での受信と、ターゲットのポートとヘルスチェックのポートへの送信の両方を許可する必要があります<Ref n={18} />。リスナー、ルール、ターゲットグループ、ヘルスチェックの考え方は<ChapterLink n={25} section="health" />で扱っています<Ref n={4} />。
          </p>
          <p>
            RDS の DB インスタンスは、DB サブネットグループ（DB を置いてよいサブネットの集まり）の中のサブネットに置かれます。DB サブネットグループには2つ以上の AZ のサブネットを入れます。Multi-AZ 配置で切り替えが起きたときに別の AZ に待機系を作れるようにするためです<Ref n={5} />。Aurora の DB クラスターは、1つのライター（読み書きを受け持つ DB インスタンス）と最大 15 のリーダー（Aurora レプリカ）と、複数の AZ にまたがるクラスターボリュームからなり、各 AZ がデータの複製を持ちます<Ref n={19} />。ライターが使えなくなると、Aurora はリーダーの1つをライターに切り替えます。AWS のドキュメントは、切り替えで DB の IP アドレスが変わるので、接続には IP アドレスではなく DNS 名（エンドポイント）を使うよう勧めています<Ref n={5} />。切り替えの後に Rails の古い接続が書き込みに失敗する状況は<a href="#/linux/case42">第6部の演習「フェイルオーバーのあと、書き込みだけがときどき失敗する」</a>で、DB の接続数の上限は<a href="#/linux/case40">「ときどき Too many connections が出る」</a>で扱います。MySQL サーバーそのものの仕組みは<ChapterLink n={106} section="mysql" />にあります。
          </p>
          <p>
            ElastiCache は、AWS が管理するメモリー上のデータストアで、Valkey・Memcached・Redis OSS のエンジンを選べます。容量を自動で調整するサーバーレスと、ノードの種類と数を自分で選ぶノードベースのクラスターがあります<Ref n={20} />。Rails のキャッシュと Sidekiq のキューを同じ Redis に置くと何が起きるかは、<ChapterLink n={106} section="redis" />と<a href="#/linux/case49">第6部の演習「予約した公開のジョブが、まとめて消えた」</a>で確かめられます。
          </p>
          <p>
            S3 はファイルをオブジェクトとして保存するサービスで、VPC の外にあります。プライベートサブネットから S3 に接続するとき、S3 用のゲートウェイエンドポイントを作ってルートテーブルに経路を足すと、インターネットゲートウェイや NAT ゲートウェイを通らずに接続でき、ゲートウェイエンドポイントには追加の料金がかかりません<Ref n={21} />。S3 が要求を受け付けるかどうかは、セキュリティグループではなく IAM のポリシー（タスクロールやバケットポリシー）で決まります。権限が足りずに保存だけが失敗する状況は<a href="#/linux/case43">第6部の演習「履歴書のアップロードだけが AccessDenied になる」</a>にあります。
          </p>
          <p>
            CloudWatch は、AWS のリソースとアプリのメトリクスを集め、しきい値を超えたら通知や自動の操作をするアラームを設定できるサービスです。CloudWatch Logs は、ログをロググループとログストリームに分けて保存し、検索できます<Ref n={22} />。ECS のタスク定義で <code>awslogs</code> のログドライバーを指定すると、コンテナの標準出力と標準エラー出力がそのまま CloudWatch Logs に送られます<Ref n={23} />。Rails 8.1 の production のログが標準出力に出るのは、この形に合わせた設定です。ログを request_id で追う手順は<a href="#/linux/case34">第6部の演習「CloudWatch Logs で、通知のリクエストを追う」</a>、アラームが鳴らなかった原因を調べる手順は<a href="#/linux/case48">「30分サイトが落ちていたのに、アラームが鳴らなかった」</a>で扱います。
          </p>
        </>
      ),
    },
    {
      id: "rollout",
      title: "ヘルスチェックを使った置き換え",
      body: (
        <>
          <p>
            ECS のサービスは指定した数（desiredCount）のタスクを動かし続けます。新しいイメージを使うタスク定義のリビジョンでサービスを更新すると、ローリング更新では古いタスクを新しいタスクに順に置き換えます<Ref n={6} />。置き換えの間に動かすタスクの数は2つの値で決まります。<code>minimumHealthyPercent</code> は、デプロイ中に動いていて正常なタスクの数の下限を desiredCount に対する割合で表し、切り上げます。<code>maximumPercent</code> は、動かすタスクの数の上限を同じく割合で表し、切り捨てます。たとえば desiredCount が 2、minimumHealthyPercent が 100、maximumPercent が 200 なら、正常なタスクを 2 つより減らさず、最大 4 つまで動かせるので、新しいタスクを 2 つ起動してから古いタスクを止めます。
          </p>
          <p>次の図ではこの例のローリング更新を5つの段階に分け、各タスクの状態とタスクの数がどう変わるかを順に確かめられます。</p>
          <Figure n={figure(8)} title="ローリング更新で旧版と新版が並ぶ期間（段階送り）" caption="ターゲットの状態とタスクの数の変化を示す概念モデル。実際には2つの新タスクが同時にヘルスチェックに合格するとは限らず、合格するまでの時間や登録解除の待ち時間は設定とアプリによって変わる。">
            <Stepper steps={rolloutSteps} />
          </Figure>
          <p>
            新しいタスクは起動しただけではまだ要求に応答できない場合があります。Rails の読み込みや DB への接続が終わり、ALB のヘルスチェックに合格してから、ALB は新しいタスクに転送し始めます。古いタスクを止めるときは、まずターゲットグループから登録を解除して新しい要求を送らないようにし（draining）、処理中の要求が終わるのを待ってから SIGTERM を送ります。Puma は SIGTERM を受けると新しい接続の受け付けを止め、処理中の要求を終えてから終了します。決められた時間（ECS のコンテナの stopTimeout）を過ぎると SIGKILL で止められるので、Sidekiq の終了待ちの時間との関係を合わせて設定します（<a href="#/linux/case39">第6部の演習「デプロイのあと、処理中だったジョブが消えた」</a>）。
          </p>
          <p>
            新しいタスクが起動しては止まる、ヘルスチェックに合格せず入れ替わりが終わらない、といった失敗は、ECS のサービスのイベントと停止したタスクの理由から調べます。ECS にはデプロイの失敗を検知して前のリビジョンに戻すデプロイサーキットブレーカーと、CloudWatch のアラームで失敗を判断する方法があります<Ref n={6} />。起動し直した回数、ヘルスチェックの状態、置き換わる間のエラー率を別々に観測すると、入れ替えのどこで失敗したかがわかります。調査の手順は<a href="#/linux/case35">第6部の演習「デプロイしたのに、新しいタスクが起動しては止まる」</a>と<a href="#/linux/case36">「デプロイが終わらず、新しいタスクが入れ替わり続ける」</a>で練習できます。
          </p>
          <p>
            古いタスクと新しいタスクは同じ DB を使うため、片方のコードだけが扱えるスキーマへの変更を同時に行うと、入れ替え中にエラーが起こります。列名を変える場合には、先に新しい列を追加し、両方を扱うコードの配布とデータ移行を経て、古いコードが消えてから不要な列を削除する、という手順があります。コードを元に戻してもスキーマやデータが自動的に戻るわけではありません。戻すときに古いコードが動く条件を先に決めておきます（<ChapterLink n={27} section="live-change" />）。
          </p>
        </>
      ),
    },
    {
      id: "boundaries",
      title: "障害の範囲と容量を考える",
      body: (
        <>
          <p>
            Web タスクを別々の AZ に置くと、1つの AZ に障害が起きても、残った AZ のタスクで要求を処理する構成にできます。このとき、残ったタスクの数で必要な処理量をまかなえるか、DB・キャッシュ・NAT ゲートウェイが同じ AZ の障害に耐える構成になっているかを、それぞれ確認します。Web タスクが2つの AZ にあっても、NAT ゲートウェイが AZ a にしかなければ、AZ a の障害で AZ c のタスクも外部 API に接続できなくなります。Aurora のライターが AZ a にあれば、切り替えが終わるまでの間は書き込みができません。
          </p>
          <p>
            タスク数を増やすと Web 側の処理能力が増える場合があります。ただし、全タスクの接続プールの上限の合計が DB の上限を超えると、待つ場所がアプリから DB に移るだけになります。図 {figure(8)} のとおり、ローリング更新の間はタスクが一時的に desiredCount の2倍になり、接続数の見積もりもその分増やす必要があります。ワーカー数・スレッド数・接続プールから接続数を計算する方法は<ChapterLink n={23} section="sizing" />と<ChapterLink n={113} section="capacity" />にあります。
          </p>
          <p>
            サブネットの IP アドレスの数も容量の1つです。Fargate のタスクは1つにつき1つの IP アドレスを使い、ALB は規模を広げるときのために、各サブネットに少なくとも8個の空きアドレスと <code>/27</code> 以上の範囲を必要とします<Ref n={18} /><Ref n={24} />。RDS も障害時の切り替えや保守のために、DB サブネットグループの各サブネットに予備のアドレスを必要とします<Ref n={5} />。サブネットを小さく切りすぎると、デプロイ中にタスクを増やせなくなります。
          </p>
          <p>
            イメージを共有しても、実行時の環境変数、シークレット、接続先のサービスは環境ごとに異なります。問題を再現するときは、どのイメージのダイジェスト、どのタスク定義のリビジョン、どの DB のスキーマで動いていたかを対応づけます。ECS はサービスのデプロイの最初に、タスク定義のイメージのタグをダイジェストに解決し、同じサービスのタスクが同じイメージで動くようにします<Ref n={6} />。どのコードが動いているかを ALB からサービス、タスク定義、ECR の順にたどる手順は<a href="#/linux/case33">第6部の演習「ECS上の本番で、どのコードが動いているか確かめる」</a>にあります。
          </p>
        </>
      ),
    },
    {
      id: "placement",
      title: "EC2＋Capistrano と ECS Fargate を比べて選ぶ",
      body: (
        <>
          <p>
            Rails アプリを AWS で動かす代表的な構成として、EC2 のインスタンスに Nginx・Puma・Sidekiq を入れて Capistrano で配備する構成と、イメージを ECS の Fargate で動かす構成を比べます。第6部の演習はこの両方を使います。EC2 と Capistrano の構成では、サーバーに入ってリリースのディレクトリやプロセスを調べます（<a href="#/linux/case13">「currentがどのreleaseを向いているか確認する」</a>、<a href="#/linux/case14">「古いPuma processが残っていないか確認する」</a>、<a href="#/linux/case20">「メンテナンスページを出してロールバックする」</a>など）。ECS の構成では、AWS CLI でサービスとタスクを調べます（<a href="#/linux/case33">「ECS上の本番で、どのコードが動いているか確かめる」</a>から<a href="#/linux/case39">「デプロイのあと、処理中だったジョブが消えた」</a>までの演習）。
          </p>
          <Figure n={figure(9)} title="EC2＋Capistrano と ECS on Fargate の構成" caption="同じ Rails アプリを2つの方法で動かした場合の模式図。DB・キャッシュ・S3 などは両方に共通なので省略した。">
            <PlacementFigure />
          </Figure>
          <div className="table-wrap">
            <table>
              <caption>EC2＋Capistrano と ECS on Fargate の違い</caption>
              <thead><tr><th>観点</th><th>EC2＋Capistrano</th><th>ECS on Fargate</th></tr></thead>
              <tbody>
                <tr><td>配備する単位</td><td>Git のリビジョン。各サーバーで <code>bundle install</code> やアセットのビルドを実行し、<code>current</code> のリンクを切り替える</td><td>イメージ。CI でビルドして ECR に push し、タスク定義の新しいリビジョンでサービスを更新する</td></tr>
                <tr><td>Ruby と gem の入れ方</td><td>サーバーに入れる（rbenv など）。サーバーごとの差が出ないよう管理する</td><td>イメージに入っている。Ruby の更新もイメージの作り直しで行う</td></tr>
                <tr><td>プロセスの管理</td><td>systemd が Puma と Sidekiq を起動・再起動する</td><td>ECS のサービスがタスクの数を保ち、止まったタスクを起動し直す</td></tr>
                <tr><td>OS とホストの更新</td><td>運用者がパッケージを更新し、必要なプロセスやサーバーを再起動する</td><td>AWS が Fargate のプラットフォームを更新し、新しいタスクから新しいものを使う</td></tr>
                <tr><td>ログ</td><td>サーバーのファイルに書き、logrotate で回す。必要なら CloudWatch エージェントで送る</td><td>標準出力を awslogs で CloudWatch Logs に送る</td></tr>
                <tr><td>サーバーでの調査</td><td>Session Manager や SSH でサーバーに入り、ps・ss・journalctl などを使う</td><td>ECS Exec で動いているコンテナでコマンドを実行する。ホストには入れない</td></tr>
                <tr><td>台数の変更</td><td>サーバーを作り、Capistrano の設定と ALB に追加する</td><td>desiredCount を変える。自動スケーリングも設定できる</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            EC2 の構成では、サーバーが長く動き続けるので、OS の更新とディスクの空き、プロセスの状態を運用者が管理します。セキュリティ更新の後にどのプロセスを再起動するかを判断する手順は<a href="#/linux/case50">第6部の演習「セキュリティ更新のあと、何を再起動するか」</a>にあります。サーバーへの接続には Session Manager を使え、受信のポートを開けず、踏み台のサーバーや SSH の鍵を管理しなくて済みます<Ref n={28} />。Capistrano のリリースのディレクトリ、共有ファイル、ロールバックの手順は<ChapterLink n={32} section="capistrano-deploy" />で詳しく扱っています。
          </p>
          <p>
            Fargate の構成では、AWS のドキュメントのとおり、コンテナを動かすサーバー（EC2 のクラスター）の用意・設定・台数の調整が要りません。カーネルやランタイムの更新は Fargate のプラットフォームのリビジョンとして提供され、新しく起動したタスクは最新のリビジョンで動きます。脆弱なリビジョンで動いているタスクは、AWS が止めて置き換える（リタイア）ことがあります<Ref n={26} />。その代わりに、イメージのビルドと ECR への配布、タスク実行ロールとタスクロールの権限、タスク定義、VPC のエンドポイントや NAT ゲートウェイといった、EC2 の構成にはなかった設定が増えます。動いているコンテナを調べるには ECS Exec を使います。ECS Exec は Systems Manager の Session Manager を使ってコンテナに接続するので、受信のポートや SSH の鍵は要らず、タスクロールに Session Manager の権限が必要です<Ref n={27} />（<a href="#/linux/case38">第6部の演習「本番の rails console を ECS Exec で開く」</a>）。
          </p>
          <p>次は、EC2＋Capistrano と ECS Fargate のどちらを選ぶかを決めるときの判断の目安です。費用や人数の条件は組織ごとに違うので、一般的な傾向として読んでください。</p>
          <ul>
            <li>
              EC2＋Capistrano が合う場合：サーバーが1〜数台で、すでに Capistrano と systemd での運用手順がそろっている。Linux のサーバーの管理に慣れた人がいる。サーバーに入って調べる作業が多く、ホストのファイルやプロセスに直接触れたい。
            </li>
            <li>
              ECS Fargate が合う場合：タスクの数を負荷やデプロイに合わせて頻繁に変える。OS の更新や台数の管理にかける時間を減らしたい。開発・CI・本番で同じイメージを使い、環境の差をなくしたい。Web とジョブなど役割ごとに台数と設定を分けたい。
            </li>
            <li>
              どちらでも必要なこと：注文などのデータと添付ファイルを、プロセスやサーバーの寿命から切り離して保存する。新旧のコードが同時に動いても壊れない DB の変更の手順を決める。DB の接続数の上限をデプロイ中の台数で見積もる。ログとメトリクスを、サーバーやタスクが消えた後も残る場所に送る。
            </li>
          </ul>
          <p>
            どちらの構成でも、障害時の停止時間、更新の頻度、運用する人数と経験を基準に比べます。Rails 8 には、イメージを SSH でつないだサーバーに配置する Kamal という方法もあり、EC2 にコンテナで配備する中間の構成として選べます（<ChapterLink n={32} section="container-deploy" />）。
          </p>
          <p>
            関連する章：<ChapterLink n={103} />（プロセスとメモリー）、<ChapterLink n={25} />（ロードバランサー）、<ChapterLink n={26} />（ログで要求を追う）、<ChapterLink n={32} />（デプロイと再起動）、<ChapterLink n={27} />（稼働中の DB を変更する）、<ChapterLink n={113} />（Puma と接続枠の設計）。
          </p>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "Running containers",
      publisher: "Docker",
      url: "https://docs.docker.com/engine/containers/run/",
      accessed: "2026-11-27",
      version: "Docker Engine",
      note: "コンテナの起動と名前空間",
    },
    {
      title: "Volumes",
      publisher: "Docker",
      url: "https://docs.docker.com/engine/storage/volumes/",
      accessed: "2026-11-27",
      version: "Docker Engine",
      note: "コンテナの外にデータを保存する仕組み",
    },
    {
      title: "What is Amazon ECS?",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html",
      accessed: "2026-11-27",
      version: "Amazon ECS",
      note: "タスク、サービス、コンテナの関係",
    },
    {
      title: "What is an Application Load Balancer?",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
      accessed: "2026-11-27",
      version: "Elastic Load Balancing",
      note: "リスナー、ルール、ターゲットグループ",
    },
    {
      title: "Working with a DB instance in a VPC",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_VPC.WorkingWithRDSInstanceinaVPC.html",
      accessed: "2026-11-27",
      version: "Amazon RDS",
      note: "DB サブネットグループは2つ以上の AZ、切り替えで IP アドレスが変わるので DNS 名で接続する、各サブネットに予備のアドレスを残す",
    },
    {
      title: "Deploy Amazon ECS services by replacing tasks",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html",
      accessed: "2026-11-27",
      version: "Amazon ECS",
      note: "minimumHealthyPercent（切り上げ）と maximumPercent（切り捨て）、サーキットブレーカー、イメージのダイジェストの解決",
    },
    {
      title: "Storage drivers",
      publisher: "Docker",
      url: "https://docs.docker.com/engine/storage/drivers/",
      accessed: "2026-11-27",
      version: "Docker Engine",
      note: "イメージのレイヤー、コンテナの書き込み層、コピーオンライト、層の共有",
    },
    {
      title: "Multi-stage builds",
      publisher: "Docker",
      url: "https://docs.docker.com/build/building/multi-stage/",
      accessed: "2026-11-27",
      version: "Docker Build",
      note: "FROM を複数書き、COPY --from で前の段階の成果物を写す",
    },
    {
      title: "Build secrets",
      publisher: "Docker",
      url: "https://docs.docker.com/build/building/secrets/",
      accessed: "2026-11-27",
      version: "Docker Build（BuildKit）",
      note: "RUN --mount=type=secret で、ビルド中だけ秘密情報を使う",
    },
    {
      title: "Bridge network driver",
      publisher: "Docker",
      url: "https://docs.docker.com/engine/network/drivers/bridge/",
      accessed: "2026-11-27",
      version: "Docker Engine",
      note: "ユーザー定義のブリッジではコンテナ名で名前解決できる（既定のブリッジではできない）",
    },
    {
      title: "railties/lib/rails/generators/rails/app/templates/Dockerfile.tt",
      publisher: "Rails（GitHub）",
      url: `${TPL}/Dockerfile.tt`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "rails new が作る Dockerfile の base・build・最終ステージ",
    },
    {
      title: "railties/lib/rails/generators/rails/app/templates/dockerignore.tt と docker-entrypoint.tt",
      publisher: "Rails（GitHub）",
      url: `${TPL}/dockerignore.tt`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: ".dockerignore が master.key と .env を除外すること、docker-entrypoint が rails server のときだけ db:prepare を実行すること",
    },
    {
      title: "Regions and Zones",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html",
      accessed: "2026-11-27",
      version: "Amazon EC2",
      note: "リージョンは互いに隔離され、AZ はリージョンの中の隔離された複数の場所。複数の AZ に分けると1か所の障害から守れる",
    },
    {
      title: "Subnets for your VPC",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html",
      accessed: "2026-11-27",
      version: "Amazon VPC",
      note: "サブネットは1つの AZ に収まる。パブリック・プライベート・隔離されたサブネットの区別、ネットワーク ACL",
    },
    {
      title: "Subnet route tables",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html",
      accessed: "2026-11-27",
      version: "Amazon VPC",
      note: "local の経路、0.0.0.0/0 → インターネットゲートウェイ、最長一致",
    },
    {
      title: "NAT gateway basics",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html",
      accessed: "2026-11-27",
      version: "Amazon VPC",
      note: "NAT ゲートウェイは AZ ごとに作り、同じ AZ のものを使う。外から接続を始められない",
    },
    {
      title: "Control traffic to your AWS resources using security groups",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html",
      accessed: "2026-11-27",
      version: "Amazon VPC",
      note: "セキュリティグループはステートフルで、許可のルールだけを持つ",
    },
    {
      title: "Application Load Balancers",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/application-load-balancers.html",
      accessed: "2026-11-27",
      version: "Elastic Load Balancing",
      note: "2つ以上の AZ のサブネット、/27 と8個の空きアドレス、フロントエンドとバックエンドの接続、セキュリティグループのルール",
    },
    {
      title: "Amazon Aurora DB clusters",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/Aurora.Overview.html",
      accessed: "2026-11-27",
      version: "Amazon Aurora",
      note: "ライター、最大 15 の Aurora レプリカ、複数の AZ にまたがるクラスターボリューム、自動の切り替え",
    },
    {
      title: "What is Amazon ElastiCache?",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html",
      accessed: "2026-11-27",
      version: "Amazon ElastiCache",
      note: "Valkey・Memcached・Redis OSS、サーバーレスとノードベースのクラスター",
    },
    {
      title: "Gateway endpoints for Amazon S3",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints-s3.html",
      accessed: "2026-11-27",
      version: "AWS PrivateLink",
      note: "インターネットゲートウェイや NAT なしで S3 に接続でき、追加の料金がかからない",
    },
    {
      title: "What is Amazon CloudWatch?",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html",
      accessed: "2026-11-27",
      version: "Amazon CloudWatch",
      note: "メトリクス、アラーム、CloudWatch Logs のロググループとログストリーム",
    },
    {
      title: "Send Amazon ECS logs to CloudWatch",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/using_awslogs.html",
      accessed: "2026-11-27",
      version: "Amazon ECS",
      note: "awslogs ログドライバーはコンテナの STDOUT と STDERR を CloudWatch Logs に送る",
    },
    {
      title: "Amazon ECS task networking options for Fargate",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-task-networking.html",
      accessed: "2026-11-27",
      version: "Amazon ECS（Fargate）",
      note: "タスクごとの ENI とプライベート IP、イメージの取得に必要な経路（NAT か VPC エンドポイント）、ターゲットの種類は ip",
    },
    {
      title: "Pass sensitive data to an Amazon ECS container",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/specifying-sensitive-data.html",
      accessed: "2026-11-27",
      version: "Amazon ECS",
      note: "secrets で Secrets Manager と Parameter Store の値を環境変数として渡す。値を変えたら新しいタスクが必要",
    },
    {
      title: "Architect for AWS Fargate for Amazon ECS",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html",
      accessed: "2026-11-27",
      version: "AWS Fargate",
      note: "サーバーを管理せずにコンテナを動かす。プラットフォームのリビジョンとタスクのリタイア",
    },
    {
      title: "Monitor Amazon ECS containers with ECS Exec",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec.html",
      accessed: "2026-11-27",
      version: "Amazon ECS",
      note: "受信のポートや SSH の鍵なしでコンテナにコマンドを実行する。Session Manager とタスクロールの権限",
    },
    {
      title: "AWS Systems Manager Session Manager",
      publisher: "AWS",
      url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html",
      accessed: "2026-11-27",
      version: "AWS Systems Manager",
      note: "受信のポート、踏み台、SSH の鍵なしでインスタンスに接続し、操作を記録する",
    },
  ],
}

export default chapter
