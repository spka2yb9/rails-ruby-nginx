import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 87-2 直接呼び出す場合と、イベントを発行する場合 ---------- */
function DirectVsEventFigure() {
  const direct: [string, number, boolean][] = [
    ['PointGrant.create!', 50, false],
    ['WelcomeMailer（deliver_later）', 110, false],
    ['SlackNotifier.post', 170, false],
    ['紹介の特典（追加）', 230, true],
  ]
  const subs: [string, number, boolean][] = [
    ['ポイント', 50, false],
    ['メール', 110, false],
    ['Slack', 170, false],
    ['紹介の特典（追加）', 230, true],
  ]
  return (
    <Svg
      id="87-2"
      w={780}
      h={330}
      label="左は直接呼び出す場合。RegistrationsController の create が、ポイントの保存、ようこそのメール、Slack への通知、追加した紹介の特典をそれぞれ呼び出し、後の処理を足すたびに登録のコードとテストを変える。右はイベントを発行する場合。RegisterMember は MemberRegistered というイベントを ActiveSupport::Notifications に発行するだけで、ポイント、メール、Slack、紹介の特典の購読者がそれぞれイベントを受け取る。購読者は config/initializers/domain_events.rb にまとめ、後の処理を足すときはここに購読者を足す"
    >
      <T x={20} y={24} bold>
        直接呼び出す（パターンを使う前）
      </T>
      <T x={410} y={24} bold>
        イベントを発行する
      </T>
      <line x1={392} y1={10} x2={392} y2={320} stroke="var(--fig-line)" strokeDasharray="3 4" />
      <Box x={20} y={140} w={150} h={50} lines={['RegistrationsController', '#create']} fs={12} subTone="muted" />
      {direct.map(([name, y, added]) => (
        <g key={name}>
          <Box x={200} y={y} w={180} h={40} lines={name} fs={11.5} fill={added ? 'box5' : 'box'} dashed={added} />
          <Arrow x1={170} y1={165} x2={198} y2={y + 20} />
        </g>
      ))}
      <T x={20} y={296} fs={12} tone="danger">
        後の処理を足すたびに、登録のコードとテストを変える
      </T>
      <Box x={410} y={140} w={130} h={50} lines={['RegisterMember', '#call']} fs={12} subTone="muted" />
      <Box x={410} y={52} w={130} h={44} lines={['MemberRegistered', '起きた事実']} fs={11.5} fill="box5" subTone="muted" />
      <Arrow x1={475} y1={138} x2={475} y2={98} dashed />
      <Box x={556} y={140} w={88} h={50} lines={['Notifications', '（配る仕組み）']} fs={11} fill="box2" subTone="muted" />
      <Arrow x1={540} y1={165} x2={554} y2={165} />
      {subs.map(([name, y, added]) => (
        <g key={name}>
          <Box x={662} y={y} w={112} h={40} lines={[name, '購読者']} fs={10.5} fill={added ? 'box5' : 'box'} dashed={added} subTone="muted" />
          <Arrow x1={644} y1={165} x2={660} y2={y + 20} />
        </g>
      ))}
      <T x={410} y={296} fs={12} tone="acc">
        後の処理は、initializer に購読者を足すだけ
      </T>
      <T x={410} y={314} fs={11} tone="muted">
        RegisterMember とそのテストは変えない
      </T>
    </Svg>
  )
}

/* ---------- 図 87-3 同期の配信と非同期の配信 ---------- */
function SyncAsyncFigure() {
  const lanes: [number, string, 'box' | 'box2' | 'box4'][] = [
    [80, 'RegisterMember', 'box'],
    [235, 'Notifications', 'box2'],
    [390, 'ポイントの購読者', 'box'],
    [545, 'Redis（Sidekiq）', 'box4'],
    [700, 'ワーカー', 'box'],
  ]
  const [A, BUS, PT, Q, W] = lanes.map((l) => l[0])
  const msg = (y: number, from: number, to: number, text: string, opts: { dashed?: boolean; accent?: boolean } = {}) => (
    <g key={`${y}-${text}`}>
      <Arrow x1={from} y1={y} x2={to + (to > from ? -2 : 2)} y2={y} {...opts} />
      <T x={(from + to) / 2} y={y - 9} anchor="middle" fs={11}>
        {text}
      </T>
    </g>
  )
  return (
    <Svg
      id="87-3"
      w={780}
      h={466}
      label="RegisterMember は BEGIN し、会員を INSERT してから in_transaction の通知を出す。Notifications はポイントの購読者をその場で呼び、購読者は同じトランザクションでポイントを INSERT する。RegisterMember が COMMIT した後に after_commit の通知が出て、購読者がメールと Slack 通知のジョブを Redis に積み、応答はすぐに返る。後で Sidekiq のワーカーがジョブを取り出してメールを送り、Slack に投稿する。失敗したら retry_on でジョブを積み直す"
    >
      {lanes.map(([x, name, fill]) => (
        <g key={name}>
          <Box x={x - 70} y={10} w={140} h={32} lines={name} fill={fill} fs={12} />
          <line x1={x} y1={42} x2={x} y2={456} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      <rect x={A - 60} y={62} width={PT - A + 180} height={150} rx={6} fill="var(--fig-box2)" opacity={0.35} />
      <T x={A + 8} y={76} fs={11} tone="muted">
        1つのトランザクション
      </T>
      <T x={A + 8} y={100} fs={11}>
        BEGIN・会員を INSERT
      </T>
      {msg(132, A, BUS, 'in_transaction の通知')}
      {msg(162, BUS, PT, '購読者を呼ぶ')}
      <T x={PT + 8} y={188} fs={11}>
        ポイントを INSERT
      </T>
      <T x={A + 8} y={232} fs={11}>
        COMMIT
      </T>
      {msg(266, A, BUS, 'after_commit の通知')}
      <Arrow x1={BUS} y1={296} x2={Q - 2} y2={296} accent />
      <T x={BUS + 10} y={287} fs={11}>
        メールと Slack 通知のジョブを積む
      </T>
      <T x={A + 8} y={326} fs={11} tone="acc">
        すぐに応答を返す（302）
      </T>
      <line x1={20} y1={348} x2={760} y2={348} stroke="var(--fig-line)" strokeDasharray="1 5" />
      <T x={A + 8} y={366} fs={11} tone="muted">
        後で（Sidekiq のプロセス）
      </T>
      {msg(392, Q, W, 'ジョブを取り出す', { dashed: true })}
      <T x={W - 8} y={418} anchor="end" fs={11}>
        メールを送る・Slack に投稿する
      </T>
      <T x={W - 8} y={436} anchor="end" fs={11}>
        失敗したら retry_on で積み直す
      </T>
    </Svg>
  )
}

/* ---------- 図 87-1 コミットの前にジョブを積むと起きること ---------- */
const beforeCommitSteps: { db: string; queue: string; mail: string; bad: boolean }[] = [
  { db: 'BEGIN・会員とポイントを INSERT', queue: '', mail: '', bad: false },
  { db: '（トランザクションの中）', queue: 'deliver_later：メールのジョブ', mail: '', bad: false },
  { db: 'SlackNotifier.post が例外', queue: 'メールのジョブ', mail: '', bad: true },
  { db: 'ROLLBACK（会員もポイントもない）', queue: 'メールのジョブ（残る）', mail: '', bad: true },
  { db: '（会員はいない）', queue: 'ワーカーがジョブを実行', mail: 'ようこそのメールが届く', bad: true },
]

function BeforeCommitFigure() {
  const row = (i: number) => 52 + i * 52
  return (
    <Svg
      id="87-1"
      w={780}
      h={row(beforeCommitSteps.length) + 6}
      label="パターンを使う前の登録を、Slack に接続できない状態で実行した流れ。BEGIN の後に会員とポイントを INSERT し、トランザクションの中でメールのジョブを Redis に積む。続く Slack への投稿が例外になり、ROLLBACK される。会員とポイントは残らないが、Redis に積んだジョブは残り、ワーカーが実行すると、登録されていない人にようこそのメールが届く"
    >
      <T x={160} y={22} anchor="middle" bold>
        MySQL
      </T>
      <T x={430} y={22} anchor="middle" bold>
        Redis（Sidekiq のキュー）
      </T>
      <T x={660} y={22} anchor="middle" bold>
        メール
      </T>
      {beforeCommitSteps.map((s, i) => (
        <g key={s.db}>
          <T x={8} y={row(i) + 22} fs={11} tone="muted">
            {i + 1}
          </T>
          <Box x={30} y={row(i)} w={260} h={36} lines={s.db} fill="box4" fs={12} />
          {s.queue && <Box x={310} y={row(i)} w={240} h={36} lines={s.queue} fill={s.bad ? 'box5' : 'box'} fs={12} />}
          {s.mail && <Arrow x1={550} y1={row(i) + 18} x2={578} y2={row(i) + 18} />}
          {s.mail && <Box x={580} y={row(i)} w={180} h={36} lines={s.mail} fill="box5" fs={12} accent />}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 87-4 イベントを処理するタイミングと、途中で失敗したときに起きること ---------- */
const timingRows: { when: string[]; example: string[]; failure: string[]; use: string[]; bad?: boolean }[] = [
  {
    when: ['コミットの前', '同じトランザクションの中'],
    example: ['ポイントの付与', '（DB への書き込み）'],
    failure: ['会員の保存ごと取り消される。', '整合性は保たれる'],
    use: ['トランザクションが長くなる。', '外部への処理には使わない'],
  },
  {
    when: ['コミットの前に', 'DB の外へ（誤り）'],
    example: ['メールのジョブを', 'Redis に積む'],
    failure: ['会員がいないのに', 'メールが届く（図 87-1）'],
    use: ['使わない'],
    bad: true,
  },
  {
    when: ['コミットの後'],
    example: ['ジョブを積む', '外部の API を呼ぶ'],
    failure: ['積む前に止まると失われる。', 'その場で例外になると、', '登録済みなのにエラーを返す'],
    use: ['失われてもよい処理に使う。', '購読者はジョブを積むだけにする'],
  },
  {
    when: ['コミットの前に', '同じ DB に記録する'],
    example: ['送る予定の行を', '同じトランザクションで INSERT'],
    failure: ['会員と一緒に確定するか、', '一緒に取り消される'],
    use: ['Transactional Outbox。', '同じ DB の Solid Queue も同じ性質'],
  },
]

function TimingFigure() {
  const top = 40
  const step = 78
  const cols = [
    { x: 10, w: 150, title: '処理するタイミング', key: 'when' as const },
    { x: 168, w: 180, title: '処理の例', key: 'example' as const },
    { x: 356, w: 210, title: '途中で失敗したとき', key: 'failure' as const },
    { x: 574, w: 196, title: '使える場面と注意', key: 'use' as const },
  ]
  return (
    <Svg
      id="87-4"
      w={780}
      h={top + timingRows.length * step + 4}
      label={`イベントを処理するタイミングごとの比較。${timingRows.map((r) => `${r.when.join('')}：例は${r.example.join('')}。途中で失敗すると${r.failure.join('')}。${r.use.join('')}`).join('。')}`}
    >
      {cols.map((c) => (
        <T key={c.title} x={c.x + c.w / 2} y={24} anchor="middle" bold fs={12.5}>
          {c.title}
        </T>
      ))}
      {timingRows.map((r, i) => {
        const y = top + i * step
        return (
          <g key={r.when.join('')}>
            {cols.map((c) => (
              <Box
                key={c.key}
                x={c.x}
                y={y}
                w={c.w}
                h={step - 10}
                lines={r[c.key]}
                fs={11.5}
                fill={c.key === 'when' ? (r.bad ? 'none' : 'box5') : 'bg'}
                dashed={c.key === 'when' && r.bad}
              />
            ))}
          </g>
        )
      })}
    </Svg>
  )
}

const chapter: Chapter = {
  number: 51,
  part: 9,
  title: 'Domain Events：会員登録の後の処理を分ける',
  summary:
    '会員登録の処理にポイントの付与・ようこそのメール・社内の Slack への通知が並び、通知が1つ失敗すると登録まで失敗する場面から始めます。「会員が登録された」という事実を Data.define の不変のイベントにし、ActiveSupport::Notifications で発行と購読を分け、取り消せない処理をコミットの後にジョブで行う実装を Rails で作ります。ジョブキューと DB のトランザクションの関係、購読者が失敗したときの扱い、Rails 8.1 の Rails.event の位置付けも、MySQL・Redis・RSpec で確かめます。',
  goals: [
    '後の処理を直接呼ぶコードの問題を、変更の広がりと、失敗の影響の2つの観点で説明できる',
    '起きた事実を過去形の名前の不変のオブジェクト（Data.define）にし、ActiveSupport::Notifications で発行と購読のコードを書ける',
    'ジョブキュー（Active Job と Sidekiq）に積んだジョブが DB のトランザクションの外にあることと、Solid Queue を同じ DB に置いた場合との違いを説明できる',
    '購読者ごとに、同じトランザクションの中で行うか、コミットの後にジョブで行うかを決め、取り消せない処理をコミットの前に行わない',
    '購読者が例外を起こしたときに、ほかの購読者・トランザクション・呼び出し元がどうなるかを説明できる',
    'モデルのコールバック・Observer・wisper・Rails Event Store・Transactional Outbox・Rails.event との違いを踏まえて、採用するかを判断できる',
  ],
  prerequisites: [14, 18, 44],
  sections: [
    {
      id: 'scene',
      title: '会員登録の後の処理が増え、通知の失敗で登録まで失敗する',
      body: (
        <>
          <p>
            この章の題材は EC サイトの会員登録です。利用者が名前とメールアドレスを入力して登録すると、サイトは会員を保存し、その後で次の処理を行います。
          </p>
          <ul>
            <li>登録の特典として、500 ポイントを付与する（<code>point_grants</code> に1行を保存する）。</li>
            <li>「ご登録ありがとうございます」というようこそのメールを送る。</li>
            <li>
              社内の Slack のチャンネルに「新しい会員が登録しました」と投稿する。サポートの担当者が新しい会員に気づけるようにするためで、Slack の <Term en="Incoming Webhook">Incoming Webhook</Term>（決まった URL に JSON を POST するとチャンネルに投稿される仕組み）を使う。
            </li>
          </ul>
          <p>
            最初はポイントとメールだけでしたが、サポートの担当者からの依頼で Slack への通知を足しました。マーケティングの担当者からは、紹介した人への特典や、顧客管理のサービス（CRM）への登録も頼まれています。
          </p>
          <h3>登録の後の処理を、登録のアクションに順に書いたコード</h3>
          <Code
            lang="ruby"
            title="app/controllers/registrations_controller.rb（パターンを使う前）"
            code={`
class RegistrationsController < ApplicationController
  def create
    @member = Member.new(params.expect(member: [:name, :email]))
    Member.transaction do
      @member.save!
      PointGrant.create!(member: @member, points: 500, reason: "signup")
      WelcomeMailer.welcome(@member.email, @member.name).deliver_later
      SlackNotifier.post("新しい会員が登録しました: #{@member.name}")
    end
    redirect_to "/", notice: "登録しました"
  rescue ActiveRecord::RecordInvalid
    head :unprocessable_content
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/models/slack_notifier.rb"
            code={`
# 社内の Slack のチャンネルに投稿する（Incoming Webhook）
class SlackNotifier
  def self.post(text)
    Faraday.new(request: { timeout: 3, open_timeout: 2 }) { |f| f.response :raise_error }
      .post(ENV.fetch("SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/T000/B000/XXXX"),
            { text: }.to_json, "Content-Type" => "application/json")
  end
end
`}
          />
          <p>
            会員とポイントがそろって保存されるように、トランザクションで囲んでいます。メールは <code>deliver_later</code> でジョブにして、後で Sidekiq のワーカーが送ります。Slack への投稿はその場で HTTP の POST を送り、失敗したら Faraday の例外を投げます。
          </p>
          <h3>Slack に届かないときに登録する</h3>
          <p>
            Slack の Webhook の URL を接続できないアドレスにして、このアクションに POST しました。ジョブは Sidekiq のアダプターで Redis に積む設定にしています。その後、ワーカーの代わりに、キューに残ったジョブを1件実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13・Redis）"
            code={`
例外: Faraday::ConnectionFailed: Failed to open TCP connection to 127.0.0.1:9 (Connection refused - connect(2) for "127.0.0.1" port 9)
会員=0 ポイント=0
Redis のキュー default のジョブ: 1 件
  ActionMailer::MailDeliveryJob ["WelcomeMailer", "welcome", "deliver_now"]
送られたメール: to=["sato@example.com"] subject=ご登録ありがとうございます
`}
          />
          <p>
            Slack への投稿が例外になったので、トランザクションは ROLLBACK され、会員もポイントも残りませんでした。利用者にはエラーの画面が表示されます。社内向けの通知が届かなかっただけで、登録そのものが失敗しています。一方、トランザクションの中で積んだメールのジョブは Redis に残り、実行すると、登録されていない人にようこそのメールが届きました。
          </p>
          <Figure n="87-1" title="コミットの前にジョブを積むと起きること" caption="上の実行結果を、MySQL・Redis・メールの列に並べた図。上から下へ時間が進む。色を付けた枠は、ROLLBACK の後に残ったもの。">
            <BeforeCommitFigure />
          </Figure>
          <p>
            図 87-1 のとおり、MySQL の ROLLBACK は MySQL の中の変更だけを取り消します。Redis に積んだジョブは、MySQL のトランザクションの外にあるので残ります。
          </p>
          <h3>後の処理を足すと、登録のテストが壊れる</h3>
          <p>
            Slack への通知を足す前に、登録のリクエストのテストを書いていました。テストでは WebMock で外部への HTTP の通信を禁止しています。通知を足した後に、このテストを実行しました。
          </p>
          <Code
            lang="ruby"
            title="Slack への通知を足す前に書いた、登録のテスト"
            code={`
RSpec.describe "会員登録（パターンを使う前）", type: :request do
  it "会員とポイントを保存し、ようこそのメールを積む" do
    expect {
      post "/registrations", params: { member: { name: "佐藤", email: "sato@example.com" } }
    }.to have_enqueued_mail(WelcomeMailer, :welcome)
    expect(response).to have_http_status(:found)
    expect(PointGrant.pluck(:points)).to eq([500])
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec。ヘッダーの一覧は省略）"
            code={`
F

Failures:

  1) 会員登録（パターンを使う前） 会員とポイントを保存し、ようこそのメールを積む
     Failure/Error:
       Faraday.new(request: { timeout: 3, open_timeout: 2 }) { |f| f.response :raise_error }
         .post(ENV.fetch("SLACK_WEBHOOK_URL", "https://hooks.slack.com/services/T000/B000/XXXX"),
               { text: }.to_json, "Content-Type" => "application/json")

     WebMock::NetConnectNotAllowedError:
       Real HTTP connections are disabled. Unregistered request: POST https://hooks.slack.com/services/T000/B000/XXXX
       with body '{"text":"新しい会員が登録しました: 佐藤"}' with headers {…}
`}
          />
          <p>
            登録の仕様は何も変わっていないのに、登録のテストが Slack の存在を知らないために失敗しました。テストを直すには、Slack への POST をスタブにする行を登録のテストに足します。紹介の特典や CRM への登録を足すたびに、登録のアクションとそのテストを開いて変えることになります。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>① 登録の処理が後の処理をすべて知っています。後の処理を足すたびに、登録のアクションとそのテストを変えます。</li>
            <li>② 社内への通知のような、登録に必須ではない処理の失敗で、登録が失敗します。</li>
            <li>③ トランザクションの中で積んだジョブは、ROLLBACK されても Redis に残り、登録されていない人にメールが届きます。</li>
            <li>④ Slack の応答を待つ間（最大で接続に2秒、応答に3秒）、利用者への応答が遅れ、DB のトランザクションも開いたままになります。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'idea',
      title: '起きた事実をイベントにして、後の処理を購読者に分ける考え方',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="Domain Event">Domain Event</Term>（ドメインイベント）は、業務の中で起きた事実を表すオブジェクトです。「会員が登録された」「注文が確定した」のように、業務の担当者が気にかける出来事を、クラスとして明示します。Evans の DDD Reference は、ドメインイベントをドメインの専門家が気にかける起きたことと説明しています<Ref n={2} />。Fowler も、ドメインに影響する出来事を記録するものとして Domain Event を説明しています<Ref n={1} />。
          </p>
          <p>
            このパターンでは、事実を起こした処理（会員登録）がイベントを発行し、そのイベントに関心のある処理（ポイントの付与、メールの送信、Slack への通知）が<Term en="subscriber">購読者</Term>として受け取ります。イベントを購読者に配る仕組みを<Term en="event bus">イベントバス</Term>と呼びます。イベントバスはイベントの種類ごとに購読者を覚えておき、イベントが発行されたら、その種類の購読者を呼びます。この章の Rails の実装では、<code>ActiveSupport::Notifications</code> をイベントバスとして使います。発行する側は受け取る相手を指定しないので、登録の後にする処理を足すときに、登録の処理を変えずに済みます。
          </p>
          <h3>使う場面</h3>
          <p>
            最初は、登録の処理が後の処理を順に直接呼ぶ書き方で十分です。しかし後の処理は増えていき、CRM への登録、紹介した人への特典、管理者への通知などが加わるたびに、登録の処理を変えることになります（図 87-2 の左）。直接呼ぶ書き方では、失敗の影響も広がります。最初の節のとおり、Slack に接続できないだけで登録全体がエラーになりました。
          </p>
          <Figure n="87-2" title="直接呼び出す場合と、イベントを発行する場合" caption="左は最初の節のコード、右はこの章の Rails の実装の構成。破線の枠は、後から足す処理。">
            <DirectVsEventFigure />
          </Figure>
          <p>図 87-2 の右では、登録の処理はイベントを発行するだけで、後の処理は購読者として別の場所に並びます。次のような兆候があれば、Domain Events が必要になっている可能性があります。</p>
          <ul>
            <li>1つの業務の処理（登録、注文の確定など）の後に、関係の薄い処理がいくつも並んでいる</li>
            <li>後の処理を足すたびに、本体の処理とそのテストを変えている</li>
            <li>メールや外部の API の失敗で、本体の処理まで失敗している</li>
            <li>「この処理が終わったら、あれもする」という依頼が、同じメソッドに積み重なっている</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>本体の処理は、後の処理の都合を知らずに済ませたい。一方で、全体として何が起きるかは、どこかで追える必要がある。</li>
            <li>DB への書き込みは、本体と一緒に確定するか一緒に取り消したい。一方で、メールの送信や外部の API の呼び出しは、DB のトランザクションで取り消せない。</li>
            <li>時間のかかる処理や失敗しやすい処理は、本体の応答から切り離したい。一方で、切り離した処理が失われないようにする必要がある。</li>
            <li>イベントに多くのデータを載せると購読者は楽になるが、発行する側と受け取る側の結び付きが強くなる。</li>
          </ul>
          <h3>解決方法：起きた事実を、過去形の名前の不変のオブジェクトにする</h3>
          <p>
            イベントは、すでに起きたことを表します。そのため名前は過去形にします（<code>MemberRegistered</code>：会員が登録された）。Microsoft の .NET のマイクロサービスの説明も、イベントは過去に起きたことなので、クラス名を過去形の動詞で表すこと、起きたことは変わらないので変えられないクラスにすることを勧めています<Ref n={3} />。「メールを送れ」のような命令の名前にすると、発行する側が受け取る側の処理を決めていることになり、直接呼ぶ書き方と変わりません。
          </p>
          <p>
            Evans の DDD Reference によれば、ドメインイベントは過去の記録なので、ふつうは変えません。イベントは起きた時刻と、関係するエンティティの ID を持ちます。必要なら、イベント自体を見分ける ID も持たせ、同じイベントが2回届いたときに同じものだと分かるようにします<Ref n={2} />。この章の <code>MemberRegistered</code> は、イベントの ID、起きた時刻、会員の ID、メールアドレス、名前を持ちます。
          </p>
          <p>
            会員の ID だけを載せ、購読者が必要な値を DB から読む方法もあります。載せる値が少ないほど、発行する側と受け取る側の結び付きは弱くなります。一方で、購読者が DB から読む時点では、値がイベントの起きた時点から変わっていることがあります（たとえば、メールアドレスがすでに変更されている）。この章では、メールと通知に使う値を、登録した時点の値としてイベントに載せています。
          </p>
          <h3>解決方法：同期の配信と非同期の配信を使い分ける</h3>
          <ul>
            <li>同期の配信：発行した処理の中で、購読者をその場で呼びます。購読者が終わるまで、発行した処理は先に進みません。購読者が失敗すれば、発行した処理も失敗します。</li>
            <li>非同期の配信：発行した処理は、購読者の処理をジョブキューに積んで、すぐに先に進みます。ジョブキューの仕組みは<ChapterLink n={51} section="job-queue">「ジョブキューと DB のトランザクション」の節</ChapterLink>で説明します。</li>
          </ul>
          <p>
            この章では、DB への書き込み（ポイントの付与）は同期で、会員の保存と同じトランザクションの中で行います。メールの送信と Slack への通知は非同期にし、コミットの後にジョブとして積みます。メールの送信に時間がかかっても、Slack が止まっていても、登録の応答はすぐに返ります。
          </p>
          <Figure n="87-3" title="同期の配信と非同期の配信" caption="この章の RegisterMember の流れを、関係者ごとの列に並べた図。上から下へ時間が進む。薄い色の範囲が1つのトランザクション。点線より下は、応答を返した後に別のプロセスで起きること。">
            <SyncAsyncFigure />
          </Figure>
          <p>
            図 87-3 の上半分は1つのリクエストの中で起き、ポイントの購読者は会員の INSERT と同じトランザクションで動きます。COMMIT の後に積んだジョブは、下半分のとおり Sidekiq のワーカーが別のプロセスで実行します。
          </p>
          <h3>解決方法：イベントを処理するタイミングを決める</h3>
          <p>
            DB のトランザクションとイベントの処理の順序は、このパターンで最も間違えやすい点です。Microsoft の説明も、ドメインイベントをコミットの直前に配るか直後に配るかは、後の処理を同じトランザクションに含めるかどうかを決める重要な判断だとしています<Ref n={3} />。取り消せない処理（メールの送信、外部の API の呼び出し、DB の外のキューにジョブを積むこと）をコミットの前に行うと、最初の節の図 87-1 の問題が起きます。そのため、取り消せない処理はコミットの後に行います。
          </p>
          <p>
            ただし、コミットの後にも問題が残ります。コミットが終わってからジョブを積むまでの間にプロセスが止まると、会員は保存されたのにジョブは積まれず、メールは送られません。図 87-4 は処理するタイミングごとに、途中で失敗したときに起きることをまとめたものです。
          </p>
          <Figure n="87-4" title="イベントを処理するタイミングと、途中で失敗したときに起きること" caption="MSDP の第12章の比較を、この章の Rails の実装に合わせて直した図。2行目（破線の枠）は使ってはいけない方式。">
            <TimingFigure />
          </Figure>
          <p>
            図 87-4 の最後の行は、送る予定を業務のデータと同じトランザクションで DB に記録する方法で、<ChapterLink n={53} section="idea" />の Transactional Outbox で扱います。この章では、メールと Slack への通知は失われても登録に影響しない処理として、3行目のコミットの後の方式を使います。
          </p>
          <h3>解決方法：内部のイベントと外部に公開するイベントを分ける</h3>
          <p>
            同じアプリケーションの中で使うイベントと、ほかのサービスに送るイベントは、分けて考えます。Microsoft の説明は、前者をドメインイベント、後者を<Term en="integration event">統合イベント</Term>と呼び、統合イベントは変更が正しく保存された場合にだけ送るべきで、常に非同期で送るものだとしています<Ref n={3} />。外部に公開するイベントは、受け取る側が自分たちの管理の外にあるので、項目の名前や意味を後から変えにくくなります。内部のイベントの項目をそのまま外部に送らず、公開してよい項目だけを選んだ、別の形のイベントを作ります。
          </p>
          <h3>Observer との関係</h3>
          <p>
            GoF の <Term en="Observer">Observer</Term> パターンは、あるオブジェクトの状態が変わったことを、関心のあるほかのオブジェクトに知らせる仕組みです。Ruby の Observable のドキュメントも、Observer パターンを publish/subscribe とも呼ばれる仕組みとして説明しています<Ref n={17} />。Domain Events は、この考え方を業務の事実に当てはめたものです。違いは、Observer がオブジェクトの状態の変化を、そのオブジェクトに登録された相手に知らせるのに対し、Domain Events は起きた事実そのものをオブジェクトにし、イベントバスを通して配る点です。イベントがオブジェクトになっているので、ジョブに渡したり、DB に記録したり、ほかのサービスに送ったりできます。
          </p>
          <h3>イベントの連鎖は追いにくくなる</h3>
          <p>
            イベントを受け取った購読者が別のイベントを発行し、さらに別の購読者が動く、という連鎖が増えると、全体として何が起きるかがコードから読み取れなくなります。Fowler も、イベントによる通知は結び付きを弱くするが、複数の通知をまたぐ一連の流れはプログラムのどこにも明示されないので見えにくく、動いているシステムを観察しないと分からないことが多いと注意しています<Ref n={4} />。この章では、購読者の一覧を1つの initializer にまとめ、購読者からさらにイベントを発行しません。
          </p>
          <h3>構造</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">要素</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">責務</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">イベント</th>
                  <td><code>MemberRegistered</code>（app/events/member_registered.rb）</td>
                  <td>起きた事実を表す。過去形の名前で、変えられない</td>
                </tr>
                <tr>
                  <th scope="row">発行する処理</th>
                  <td><code>RegisterMember</code>（app/services/register_member.rb）</td>
                  <td>会員を保存し、イベントを作って発行する。購読者を知らない</td>
                </tr>
                <tr>
                  <th scope="row">イベントバス</th>
                  <td><code>DomainEvents.publish</code> と <code>ActiveSupport::Notifications</code></td>
                  <td>イベントの種類と呼ぶ時点（トランザクションの中か、コミットの後か）ごとに購読者を呼ぶ</td>
                </tr>
                <tr>
                  <th scope="row">購読者</th>
                  <td>config/initializers/domain_events.rb の各ブロック</td>
                  <td>イベントを受け取り、自分の処理をする。時間のかかる処理はジョブに渡す</td>
                </tr>
                <tr>
                  <th scope="row">ジョブキューとワーカー</th>
                  <td>Active Job・Sidekiq・Redis（<code>NotifyStaffJob</code>、メールのジョブ）</td>
                  <td>非同期の処理を積み、後で実行する。失敗したら実行し直す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            購読者の登録はアプリケーションを組み立てる1か所（この章では config/initializers/domain_events.rb）で行います。<ChapterLink n={40} section="rails-impl" />で、依存するオブジェクトを config/initializers の1か所で組み立てたのと同じ考え方です。
          </p>
        </>
      ),
    },
    {
      id: 'job-queue',
      title: 'ジョブキューと DB のトランザクション',
      body: (
        <>
          <h3>ジョブキューとは</h3>
          <p>
            <Term en="job queue">ジョブキュー</Term>は、後で実行する処理（ジョブ）をためておく場所です。処理を積む側は積んだらすぐに戻り、<Term en="worker">ワーカー</Term>と呼ぶ別のプロセスがジョブを取り出して実行します。失敗したジョブは決めた回数まで実行し直せます。Rails の Active Job のガイドは、時間がかかる処理や重要でない処理を HTTP のリクエストと応答から切り離し、バックグラウンドのキューで実行することで、Web のリクエストを速く保つと、目的を説明しています<Ref n={10} />。
          </p>
          <p>
            Rails では、Active Job がジョブを書くための共通の形を決め、実際にジョブを保存して実行する仕組み（キューのバックエンド）をアダプターで選びます。この本のアプリは Sidekiq を使います。Sidekiq の Wiki によると、<code>perform_async</code> などはジョブを表すハッシュを JSON の文字列にして Redis のキューに入れ、Sidekiq のサーバーのプロセスがキューからジョブを取り出して <code>perform</code> を呼びます<Ref n={11} />。キューとワーカーの仕組みは<ChapterLink n={18} section="queue-worker" />の「キューとワーカー、Redis」と<ChapterLink n={18} section="sidekiq" />の「Sidekiq の構成と Redis の中身」で、Active Job のジョブの書き方は<ChapterLink n={18} section="job-basics" />の「ActiveJob のジョブの書き方」で扱いました。
          </p>
          <p>この章の実装で登録の後に Redis に入ったジョブは、次のとおりです（イベントの ID と時刻は整えた）。</p>
          <Code
            lang="text"
            title="実行結果（Redis の Sidekiq のキューの中身。表示を整えた）"
            code={`
default: ActionMailer::MailDeliveryJob ["WelcomeMailer", "welcome", "deliver_now",
  {"args" => ["sato@example.com", "佐藤"], "_aj_ruby2_keywords" => ["args"]}]
notifications: NotifyStaffJob [{"event_id" => "fe366f3e-…", "occurred_at" => {"_aj_serialized" =>
  "ActiveJob::Serializers::TimeWithZoneSerializer", "value" => "2026-11-21T02:54:51.212766326+09:00",
  "time_zone" => "Asia/Tokyo"}, "member_id" => 1, "email" => "sato@example.com", "name" => "佐藤",
  "_aj_symbol_keys" => ["event_id", "occurred_at", "member_id", "email", "name"]}]
`}
          />
          <p>
            ジョブの引数は、Active Job が JSON にできる形に変えて保存します。Active Job のガイドが挙げる型（文字列・数値・Date・Time・TimeWithZone・ハッシュ・配列など）は渡せますが<Ref n={10} />、Data.define で作ったイベントをそのまま渡すと <code>ActiveJob::SerializationError: Unsupported argument type: MemberRegistered</code> になりました。この章では、イベントを <code>to_h</code> でハッシュにして渡し、ジョブの中でイベントを作り直します。
          </p>
          <h3>Redis に積んだジョブは、DB のトランザクションの外にある</h3>
          <p>
            Redis は MySQL とは別のサーバーなので、MySQL のトランザクションの ROLLBACK は Redis に積んだジョブを取り消しません。トランザクションの中で <code>deliver_later</code> を呼び、ロールバックしました。
          </p>
          <Code
            lang="ruby"
            title="トランザクションの中で積む場合と、コミットの後に積む場合"
            code={`
Member.transaction do
  WelcomeMailer.welcome("a@example.com", "A").deliver_later
  raise ActiveRecord::Rollback
end

Member.transaction do
  ActiveRecord.after_all_transactions_commit { WelcomeMailer.welcome("a@example.com", "A").deliver_later }
  raise ActiveRecord::Rollback
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Sidekiq のアダプター。各ブロックの前にキューを空にした）"
            code={`
enqueue_after_transaction_commit=false
トランザクションの中: Redis のジョブ 1 件
ロールバックの後: Redis のジョブ 1 件
after_all_transactions_commit・トランザクションの中: Redis のジョブ 0 件
after_all_transactions_commit・ロールバックの後: Redis のジョブ 0 件
`}
          />
          <p>
            このアプリ（<code>config.load_defaults 8.1</code>）では <code>enqueue_after_transaction_commit</code> が false なので、トランザクションの中の <code>deliver_later</code> は、その場で Redis にジョブを積み、ロールバックの後も残りました。<code>ActiveRecord.after_all_transactions_commit</code> に渡したブロックは、開いているトランザクションがすべてコミットされた後に呼ばれ、ロールバックされると呼ばれません<Ref n={9} />。ジョブのクラスで <code>self.enqueue_after_transaction_commit = true</code> にすると、トランザクションの中で <code>perform_later</code> を呼んでも、積むのをコミットの後まで遅らせます。Active Job のガイドは、どちらに頼っているか分からなければ、ApplicationJob で有効にするのが最も安全な既定だとしています<Ref n={10} />。トランザクションとジョブを積む時刻の関係は<ChapterLink n={18} section="transaction" />の「トランザクションと投入の時刻」でも扱いました。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2 で <code>config.load_defaults 7.2</code> にしたアプリでは、<code>enqueue_after_transaction_commit</code> が <code>:default</code> になり<Ref n={19} />、積むのをコミットの後まで遅らせるかをキューのアダプターが決めます<Ref n={20} />。Sidekiq のアダプターは遅らせる（true）と答えるので<Ref n={21} />、7.2 ではトランザクションの中の <code>deliver_later</code> がコミットの後に積まれ、この節の1つ目の実行結果とは違う動きになります。この章の Rails 8.1.4.1（<code>load_defaults 8.1</code>）では false で、その場で積まれました。7.2 から 8.x に上げて <code>load_defaults</code> を変えるときは、ApplicationJob で明示的に設定するか、<code>after_all_transactions_commit</code> で積む時点をコードに書いておきます。
            </p>
          </Callout>
          <h3>Solid Queue を同じ DB に置くと、ジョブを積むことも同じトランザクションに入る</h3>
          <p>
            Rails 8 の既定のキューのバックエンドの Solid Queue は、ジョブを DB のテーブルに保存します。Active Job のガイドによると、Solid Queue がアプリケーションと同じ DB を使う場合、ジョブを積むことは周りの Active Record のトランザクションの中で行われ、ロールバックすればジョブも積まれません。ただし、Rails 8 は Solid Queue を既定で別の DB に置き、ガイドはこの性質に頼らず <code>enqueue_after_transaction_commit</code> を使うことを勧めています<Ref n={10} />。Sidekiq と Solid Queue の違いは<ChapterLink n={18} section="solid-queue" />の「Solid Queue との違い」で扱いました。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">キューの置き場所</th>
                  <th scope="col">トランザクションの中で積んでロールバックすると</th>
                  <th scope="col">コミットの後に積む場合に残る問題</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Sidekiq（Redis）</th>
                  <td>ジョブは残る（この節の実行結果）</td>
                  <td>コミットの後、積む前にプロセスが止まる、Redis につながらないと、ジョブは積まれない</td>
                </tr>
                <tr>
                  <th scope="row">Solid Queue（別の DB。Rails 8 の既定）</th>
                  <td>ジョブは残る（別の DB の別のトランザクション）</td>
                  <td>同上</td>
                </tr>
                <tr>
                  <th scope="row">Solid Queue（アプリと同じ DB）</th>
                  <td>ジョブも取り消される</td>
                  <td>業務のデータとジョブが一緒に確定するので、この問題はない</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            表の最後の行の性質を、キューのバックエンドに頼らず業務のテーブルで作るのが、<ChapterLink n={53} section="idea" />の Transactional Outbox です。この章のメールと Slack への通知は、失われても登録に影響しないので、コミットの後に積む方式にしています。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装：ActiveSupport::Notifications で発行と購読を分ける',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  events/member_registered.rb       # イベント（Data.define）
  events/domain_events.rb           # 発行する時点を分けて、Notifications で配る
  services/register_member.rb       # 会員を保存し、イベントを発行する
  controllers/registrations_controller.rb
  jobs/notify_staff_job.rb          # Slack への通知（retry_on で再試行）
  mailers/welcome_mailer.rb
  models/member.rb・point_grant.rb・slack_notifier.rb
config/initializers/domain_events.rb  # 購読者の一覧
db/migrate/20261120000001_create_members_and_point_grants.rb
spec/events/domain_events_spec.rb・spec/services/register_member_spec.rb
spec/jobs/notify_staff_job_spec.rb・spec/requests/registrations_spec.rb
`}
          />
          <h3>マイグレーション</h3>
          <Code
            lang="ruby"
            title="db/migrate/20261120000001_create_members_and_point_grants.rb"
            code={`
class CreateMembersAndPointGrants < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :email, null: false, index: { unique: true }
      t.timestamps
    end
    create_table :point_grants do |t|
      t.references :member, null: false, foreign_key: true
      t.integer :points, null: false
      t.string :reason, null: false
      t.timestamps
      t.index [:member_id, :reason], unique: true # 同じ理由のポイントは1回だけ
    end
  end
end
`}
          />
          <p>
            <code>point_grants</code> の <code>[member_id, reason]</code> の一意索引は、登録の特典のポイントを同じ会員に2回付けないための制約です。購読者が何かの理由で2回呼ばれても、2回目は一意制約の違反になります。
          </p>
          <h3>イベントのクラス</h3>
          <Code
            lang="ruby"
            title="app/events/member_registered.rb"
            code={`
# 会員が登録された、という起きた事実。名前は過去形にし、Data で作って変えられないようにする
MemberRegistered = Data.define(:event_id, :occurred_at, :member_id, :email, :name) do
  def self.from(member)
    new(event_id: SecureRandom.uuid, occurred_at: Time.current,
        member_id: member.id, email: member.email, name: member.name)
  end
end
`}
          />
          <p>
            <code>Data.define</code> は決まった項目だけを持つ値のクラスを作ります。Ruby のドキュメントは、Data は項目に値を書き込むメソッドを持たず、不変の値を保存するためのものだと説明しています<Ref n={5} />。<code>app/events</code> のように app の下に作ったディレクトリは、Rails が自動で読み込む対象になります。作ったイベントが変えられないことを確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（Ruby 4.0.9）"
            code={`
frozen?=true respond_to?(:name=)=false
instance_variable_set => FrozenError
with(name: "鈴木") => 鈴木（元のイベントは 佐藤）
`}
          />
          <p>
            Data のオブジェクトは作った時点で凍結されていて、項目を書き換えるメソッドもありません。値を変えたイベントが必要なら、<code>with</code> で別のオブジェクトを作ります。購読者の1つがイベントを書き換えて、ほかの購読者に違う値が届くことは起きません。
          </p>
          <h3>発行する</h3>
          <Code
            lang="ruby"
            title="app/events/domain_events.rb"
            code={`
# ドメインイベントを ActiveSupport::Notifications で配る。
# 通知の名前の末尾で、購読者を呼ぶ時点を分ける
#   .in_transaction … 発行したトランザクションの中で、その場で呼ぶ
#   .after_commit   … 外側のトランザクションがすべてコミットされた後に呼ぶ。ロールバックしたら呼ばない
module DomainEvents
  def self.publish(event)
    name = event.class.name.underscore # MemberRegistered → "member_registered"
    ActiveSupport::Notifications.instrument("#{name}.in_transaction", event:)
    ActiveRecord.after_all_transactions_commit do
      ActiveSupport::Notifications.instrument("#{name}.after_commit", event:)
    end
  end
end
`}
          />
          <p>
            <code>ActiveSupport::Notifications</code> は、もともと処理の時間などを計測するための Rails の仕組みで、<code>instrument</code> で名前と値（ペイロード）を付けて通知し、<code>subscribe</code> で同じ名前の通知を受け取ります<Ref n={6} />。購読のブロックは、<code>instrument</code> を呼んだスレッドで、その場で呼ばれます（計測としての使い方は<ChapterLink n={22} section="notifications" />の「ActiveSupport::Notifications」）。そのため、トランザクションの中で <code>instrument</code> を呼べば、購読者の DB の変更も同じトランザクションに入ります。
          </p>
          <p>
            <code>DomainEvents.publish</code> は、1つのイベントを2回通知します。1回目はその場で <code>.in_transaction</code> の購読者に、2回目は <code>after_all_transactions_commit</code> でコミットの後に <code>.after_commit</code> の購読者に届けます。購読者は、購読する名前の末尾で、どちらの時点で呼ばれるかを選びます。トランザクションの外で発行した場合は、<code>after_all_transactions_commit</code> がブロックをすぐに呼ぶので、2つの通知が続けて出ます<Ref n={9} />。
          </p>
          <Code
            lang="ruby"
            title="app/services/register_member.rb・app/controllers/registrations_controller.rb"
            code={`
class RegisterMember
  # 会員を保存し、「会員が登録された」というイベントを発行する。登録の後に何が起きるかは知らない
  def call(name:, email:)
    Member.transaction do
      member = Member.create!(name:, email:)
      DomainEvents.publish(MemberRegistered.from(member))
      member
    end
  end
end

class RegistrationsController < ApplicationController
  def create
    attrs = params.expect(member: [:name, :email])
    RegisterMember.new.call(name: attrs[:name], email: attrs[:email])
    redirect_to "/", notice: "登録しました"
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    head :unprocessable_content
  end
end
`}
          />
          <p>
            コントローラーは HTTP の入力と応答だけを受け持ち、登録の手順は <code>RegisterMember</code> に移しました（Use Case の考え方は<ChapterLink n={44} section="idea" />）。<code>RegisterMember</code> はポイントもメールも Slack も知りません。
          </p>
          <h3>購読する</h3>
          <Code
            lang="ruby"
            title="config/initializers/domain_events.rb"
            code={`
# ドメインイベントの購読者の一覧。登録の後の処理を足すときは、ここに足す

# 同じトランザクションの中で行う。失敗したら会員の保存ごと取り消される
ActiveSupport::Notifications.subscribe("member_registered.in_transaction") do |notification|
  event = notification.payload[:event]
  PointGrant.create!(member_id: event.member_id, points: 500, reason: "signup")
end

# コミットの後に、ジョブとして積む。ジョブが失敗しても登録は取り消されない
ActiveSupport::Notifications.subscribe("member_registered.after_commit") do |notification|
  event = notification.payload[:event]
  WelcomeMailer.welcome(event.email, event.name).deliver_later
end

ActiveSupport::Notifications.subscribe("member_registered.after_commit") do |notification|
  NotifyStaffJob.perform_later(notification.payload[:event].to_h)
end
`}
          />
          <p>
            どのイベントで何が起きるかは、このファイルを読めば分かります。紹介の特典を足すなら、ここに購読のブロックを1つ足し、<code>RegisterMember</code> とそのテストは変えません。initializer はアプリの起動時に1回だけ読み込まれます。<code>PointGrant</code> や <code>NotifyStaffJob</code> は購読のブロックの中だけで参照しているので、クラスはブロックが呼ばれたときに探されます。起動の途中でアプリのクラスを読み込まないので、開発環境でコードを再読み込みしても、新しいクラスが使われます。
          </p>
          <h3>購読者からジョブに渡して非同期にする</h3>
          <Code
            lang="ruby"
            title="app/jobs/notify_staff_job.rb"
            code={`
# 社内の Slack に、新しい会員を知らせる
class NotifyStaffJob < ApplicationJob
  queue_as :notifications
  retry_on Faraday::Error, wait: 30.seconds, attempts: 5

  def perform(payload)
    event = MemberRegistered.new(**payload) # ジョブの引数のハッシュから、イベントを作り直す
    SlackNotifier.post("新しい会員が登録しました: #{event.name}（#{event.occurred_at.strftime('%H:%M')}）")
  end
end
`}
          />
          <p>
            <code>retry_on</code> は、指定した例外が起きたら、例外を外に出さずに同じジョブを後で実行し直すよう積み直します。<code>wait</code> の時間には既定で最大 15% のゆらぎが加わり、<code>attempts</code> の回数（最初の実行を含む）を使い切ると例外を外に出します<Ref n={15} />。その後は Sidekiq の再試行の仕組みに渡ります（<ChapterLink n={18} section="retry" />の「再試行と Dead」）。最初の節と同じく Slack に接続できない状態で、パターンを使った後の登録を実行しました。
          </p>
          <Code
            lang="text"
            title="実行結果（Sidekiq のアダプター。ジョブの ID と時刻を整え、ログの一部の行を省略した）"
            code={`
応答: 302
会員=1 ポイント=1
キュー default: ["ActionMailer::MailDeliveryJob"]
キュー notifications: ["NotifyStaffJob"]
Performing NotifyStaffJob (Job ID: 9f2e…) from Sidekiq(notifications) with arguments:
  {event_id: "37eb…", occurred_at: 2026-11-21 02:56:10 JST +09:00, member_id: 1, email: "sato@example.com", name: "佐藤"}
Retrying NotifyStaffJob (Job ID: 9f2e…) after 1 attempts in 32 seconds, due to a Faraday::ConnectionFailed
  (Failed to open TCP connection to 127.0.0.1:9 (Connection refused - connect(2) for "127.0.0.1" port 9)).
再試行の予定: NotifyStaffJob executions=1 33 秒後
会員=1（通知の失敗は登録に影響しない）
`}
          />
          <p>
            登録は 302 で成功し、会員とポイントが保存されました。Slack への通知のジョブは接続に失敗しましたが、<code>retry_on</code> が約 30 秒後の再試行を予定し、会員の登録には影響していません。
          </p>
          <h3>購読者が例外を起こしたとき</h3>
          <p>
            <code>ActiveSupport::Notifications</code> は、同じ名前に購読者が複数いる場合、1つが例外を起こしても残りの購読者を呼び、すべてを呼んだ後で例外を投げます。例外が1つならその例外を、複数なら <code>InstrumentationSubscriberError</code> にまとめて投げます<Ref n={7} />。2つと3つの購読者で確かめました。
          </p>
          <Code
            lang="text"
            title="実行結果（1つ目の購読者だけが例外を起こす場合と、1つ目と3つ目が例外を起こす場合）"
            code={`
RuntimeError: first failed
呼ばれた順: [:block, :first, :second]
ActiveSupport::Notifications::InstrumentationSubscriberError: Exception(s) occurred within instrumentation subscribers: RuntimeError, ArgumentError
  exceptions=["first failed", "third failed"]
呼ばれた順: [:first, :second, :third]
`}
          />
          <p>購読者の失敗は、呼ばれる時点によって扱いを変えます。</p>
          <ul>
            <li>
              <code>.in_transaction</code> の購読者の例外は、<code>instrument</code> から <code>RegisterMember</code> に伝わり、トランザクションが取り消されます。ポイントの付与に失敗したら会員も保存しない、という意図どおりの動きです。ほかの <code>.in_transaction</code> の購読者もすでに呼ばれていますが、DB への書き込みなら一緒に取り消されます。この時点の購読者には、取り消せない処理を書きません。
            </li>
            <li>
              <code>.after_commit</code> の購読者は、コミットの後に呼ばれます。ここでその場で例外が起きると、会員はすでに保存されているのに、<code>RegisterMember#call</code> は例外を投げます。下の実行結果のように、利用者はエラーを見て、もう一度登録しようとし、メールアドレスの一意制約の違反になります。そのため、<code>.after_commit</code> の購読者はジョブを積むだけにして、失敗しやすい処理はジョブの中で行い、ジョブの再試行に任せます。
            </li>
          </ul>
          <Code
            lang="text"
            title="実行結果（.after_commit に、その場で例外を起こす購読者を一時的に足した）"
            code={`
RegisterMember#call => RuntimeError: CRM に接続できません
会員=["佐藤", "田中"] Redis のジョブ 2 件
`}
          />
          <p>
            田中さんの会員は保存され、メールと Slack の2つのジョブも積まれましたが、<code>RegisterMember#call</code> は例外で終わりました。ジョブの中で失敗した場合は、最初の節の Slack の例のように、再試行と Sidekiq の Dead（再試行を使い切ったジョブの置き場所）で扱えます。Dead に入ったジョブは監視して、原因を直してから実行し直します。
          </p>
          <h3>実行して確かめる</h3>
          <Code
            lang="text"
            title="実行結果（RegisterMember#call の SQL と、積まれたジョブ。日時と ID を整えた）"
            code={`
TRANSACTION  BEGIN
Member Create  INSERT INTO \`members\` (\`name\`, \`email\`, \`created_at\`, \`updated_at\`) VALUES ('佐藤', 'sato@example.com', …)
Member Load  SELECT \`members\`.* FROM \`members\` WHERE \`members\`.\`id\` = 1 LIMIT 1
PointGrant Create  INSERT INTO \`point_grants\` (\`member_id\`, \`points\`, \`reason\`, …) VALUES (1, 500, 'signup', …)
TRANSACTION  COMMIT
Enqueued ActionMailer::MailDeliveryJob (Job ID: …) to Sidekiq(default) with arguments:
  "WelcomeMailer", "welcome", "deliver_now", {args: ["sato@example.com", "佐藤"]}
Enqueued NotifyStaffJob (Job ID: …) to Sidekiq(notifications) with arguments:
  {event_id: "fe36…", occurred_at: 2026-11-21 02:54:51 JST +09:00, member_id: 1, email: "sato@example.com", name: "佐藤"}
会員=1 ポイント=[500]

== 外側のトランザクションがロールバックする
会員=1 ポイント=1 Redis のジョブ 0 件
`}
          />
          <p>
            会員とポイントの INSERT は同じ BEGIN と COMMIT の間にあり、2つのジョブは COMMIT の後に積まれています。<code>Member Load</code> は、<code>PointGrant</code> の <code>belongs_to :member</code> が保存の前に会員の存在を確かめる SELECT です。<code>RegisterMember</code> をさらに外側のトランザクションの中で呼び、外側をロールバックした場合は、鈴木さんの会員もポイントも残らず、ジョブも積まれませんでした（会員=1 は、先に登録した佐藤さん）。<code>after_all_transactions_commit</code> は、外側のトランザクションのコミットまで待つからです。
          </p>
          <h3>Rails 8.1 の Rails.event</h3>
          <p>
            Rails 8.1 には、構造化したイベントを出す <code>Rails.event</code>（<code>ActiveSupport::EventReporter</code>）が加わりました<Ref n={12} />。手元の Rails 8.1.4.1 で、<code>Rails.event.notify(名前, 値)</code> が、<code>subscribe</code> で登録した購読者の <code>emit</code> をその場で呼ぶことを確かめました。購読者の例外の扱いは <code>raise_on_error</code> で決まり、true なら例外をそのまま投げて残りの購読者を呼ばず、false ならエラーレポーター（<code>Rails.error</code>）に報告して続けます<Ref n={13} />。Rails は起動時に <code>raise_on_error</code> を <code>config.consider_all_requests_local</code> と同じ値にするので<Ref n={14} />、通常は開発とテストの環境で true、本番で false になります。
          </p>
          <Code
            lang="text"
            title="実行結果（テストの環境。1つ目の購読者が例外を起こし、2つ目が受け取ったイベントを記録する）"
            code={`
Rails.event=ActiveSupport::EventReporter raise_on_error=true
notify => RuntimeError: 購読者で失敗
記録した購読者が受け取ったイベント: 0 件
raise_on_error=false: 受け取ったイベント 1 件、エラーレポーターへの報告 ["購読者で失敗"]
イベントの中身: name=member.registered payload={member_id: 1} keys=[:name, :payload, :tags, :context, :timestamp, :source_location]
`}
          />
          <p>
            <code>Rails.event</code> のイベントは、名前・値・タグ・コンテキスト・時刻・呼び出した場所を持つハッシュで、ログや監視のサービスに後から処理しやすい形で送るための仕組みです。本番の環境では購読者の例外を報告して処理を続けるので、ポイントの付与のように、失敗したら登録ごと取り消したい処理には向きません。イベントを保存して再送する仕組みもありません。この章では、業務の後の処理を動かすためには <code>ActiveSupport::Notifications</code> を使い、<code>Rails.event</code> は「会員が登録された」ことをログや分析に出す用途に限ります。Service Object の章での扱いは<ChapterLink n={33} section="design-patterns" />の「Rails で使う設計パターン」にもあります。
          </p>
          <h3>リファクタリングの順序</h3>
          <ol>
            <li>起きた事実を名前にする：「会員が登録された」を <code>MemberRegistered</code> にし、登録の処理がイベントを作るようにする。</li>
            <li>後の処理を分類する：DB の変更で本体と一緒に確定すべきもの（ポイント）と、取り消せない外部への処理（メール、Slack）に分ける。</li>
            <li>登録の手順をコントローラーから <code>RegisterMember</code> に移し、イベントを発行する。</li>
            <li>後の処理を購読者に移す：前者は <code>.in_transaction</code>、後者は <code>.after_commit</code> の購読者にし、initializer の1か所にまとめる。</li>
            <li>時間のかかる処理と失敗しやすい処理をジョブにする：Slack への通知を <code>NotifyStaffJob</code> にし、<code>retry_on</code> で実行し直す。</li>
            <li>登録のテストから、Slack のスタブなど後の処理の準備を消す。後の処理は、それぞれの購読者とジョブのテストで確かめる。</li>
          </ol>
          <h3>実務的な使用例</h3>
          <ul>
            <li>注文の確定の後の、在庫の引当の通知、ポイントの付与、配送の手配の依頼、分析用のログ。</li>
            <li>商品やレビューが変わったときの、検索用の表や検索エンジンの索引の作り直し（<ChapterLink n={50} section="rails-impl" />の参照用のモデル）。</li>
            <li>キャッシュの削除。データを変えた処理は、どのキャッシュがそのデータを使っているかを知らずに済みます。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <p>テストでは次の4つを確かめます。</p>
          <ul>
            <li>発行と購読：同じトランザクションの購読者が一緒に確定・取り消され、コミットの後の購読者はロールバックしたら呼ばれないこと。</li>
            <li>購読者の失敗：1つの購読者の例外で、ほかの購読者が呼ばれ、その後で例外が伝わること。</li>
            <li>ジョブ：積まれるジョブの種類と引数、ジョブの中での失敗と再試行。</li>
            <li>登録のテストが、後の処理（Slack）を知らずに書けること。</li>
          </ul>
          <Code
            lang="ruby"
            title="spec/services/register_member_spec.rb"
            code={`
require "rails_helper"

RSpec.describe RegisterMember do
  def register(name: "佐藤", email: "sato@example.com") = described_class.new.call(name:, email:)

  it "会員とポイントを同じトランザクションで保存し、コミットの後でメールと通知のジョブを積む" do
    member = nil
    expect { member = register }
      .to have_enqueued_mail(WelcomeMailer, :welcome).with("sato@example.com", "佐藤")
      .and have_enqueued_job(NotifyStaffJob).with(hash_including(member_id: kind_of(Integer), name: "佐藤"))

    expect(member.point_grants.pluck(:points, :reason)).to eq([[500, "signup"]])
  end

  it "外側のトランザクションがロールバックしたら、会員もポイントも残らず、ジョブも積まない" do
    expect {
      Member.transaction do
        register
        raise ActiveRecord::Rollback
      end
    }.not_to have_enqueued_job

    expect([Member.count, PointGrant.count]).to eq([0, 0])
  end

  it "同じトランザクションの購読者が失敗したら、会員の保存も取り消される" do
    allow(PointGrant).to receive(:create!).and_raise(ActiveRecord::RecordNotSaved, "ポイントを保存できません")

    expect {
      expect { register }.to raise_error(ActiveRecord::RecordNotSaved)
    }.not_to have_enqueued_job
    expect(Member.count).to eq(0)
  end

  it "同じメールアドレスで2回登録すると、2回目はポイントもジョブも作らない" do
    register
    expect {
      expect { register }.to raise_error(ActiveRecord::RecordNotUnique)
    }.not_to have_enqueued_job
    expect([Member.count, PointGrant.count]).to eq([1, 1])
  end
end
`}
          />
          <p>
            テストの環境では Active Job の :test アダプターを使うので、ジョブは実行されずに記録だけされます。<code>have_enqueued_mail</code> と <code>have_enqueued_job</code> は、ブロックの中で積まれたメールとジョブの種類と引数を確かめます（<ChapterLink n={20} section="jobs-mail" />の「ジョブとメールのテスト」）。例は RSpec の既定どおりテスト用のトランザクションの中で動きますが、<code>after_all_transactions_commit</code> のブロックは <code>RegisterMember</code> のトランザクションが終わった時点で呼ばれ、ジョブが積まれました。2つ目の例は外側のトランザクションをロールバックすると、そのブロックが呼ばれないことを確かめています。
          </p>
          <Code
            lang="ruby"
            title="spec/events/domain_events_spec.rb（抜粋）"
            code={`
RSpec.describe DomainEvents do
  # アプリの購読者と混ざらないように、テストだけで使うイベントを作る
  before { stub_const("SampleHappened", Data.define(:id)) }

  let(:calls) { [] }
  let!(:subscriptions) { [] }

  after { subscriptions.each { |s| ActiveSupport::Notifications.unsubscribe(s) } }

  def subscribe(name, &block) = subscriptions << ActiveSupport::Notifications.subscribe(name, &block)

  it "購読者の1つが例外を起こしても、ほかの購読者を呼び、その後で例外を伝える" do
    subscribe("sample_happened.in_transaction") { calls << :first; raise "first failed" }
    subscribe("sample_happened.in_transaction") { calls << :second }

    expect { described_class.publish(SampleHappened.new(id: 1)) }.to raise_error(RuntimeError, "first failed")
    expect(calls).to eq([:first, :second])
  end

  it "after_commit の購読者は、コミットの後に呼ばれ、ロールバックしたら呼ばれない" do
    subscribe("sample_happened.after_commit") { |n| calls << n.payload[:event].id }

    Member.transaction do
      described_class.publish(SampleHappened.new(id: 1))
      expect(calls).to eq([]) # まだコミットしていない
    end
    expect(calls).to eq([1])

    Member.transaction do
      described_class.publish(SampleHappened.new(id: 2))
      raise ActiveRecord::Rollback
    end
    expect(calls).to eq([1])
  end
  # …（イベントが変えられないことの例は省略）
end
`}
          />
          <p>
            イベントバスのテストでは、<code>stub_const</code> でテストの間だけの <code>SampleHappened</code> を作り、initializer のアプリの購読者が呼ばれないようにしています。テストで足した購読者は、<code>after</code> で <code>unsubscribe</code> して、ほかの例に残さないようにします。
          </p>
          <Code
            lang="ruby"
            title="spec/jobs/notify_staff_job_spec.rb・spec/requests/registrations_spec.rb"
            code={`
RSpec.describe NotifyStaffJob do
  let(:payload) do
    MemberRegistered.new(event_id: "e1", occurred_at: Time.zone.parse("2026-11-20 10:00"),
                         member_id: 1, email: "sato@example.com", name: "佐藤").to_h
  end

  it "イベントの値から、Slack に投稿する本文を作る" do
    slack = stub_request(:post, %r{hooks\\.slack\\.com})
      .with(body: { text: "新しい会員が登録しました: 佐藤（10:00）" }.to_json)
    described_class.perform_now(payload)
    expect(slack).to have_been_requested
  end

  it "Slack が 500 を返したら、例外を外に出さずに、同じ引数で再試行を積む" do
    stub_request(:post, %r{hooks\\.slack\\.com}).to_return(status: 500)
    expect { described_class.perform_now(payload) }
      .to have_enqueued_job(described_class).with(payload).on_queue("notifications")
  end
end

RSpec.describe "会員登録", type: :request do
  it "後続の処理を知らないので、Slack のスタブなしで登録のテストを書ける" do
    expect {
      post "/registrations", params: { member: { name: "佐藤", email: "sato@example.com" } }
    }.to have_enqueued_mail(WelcomeMailer, :welcome)
    expect(response).to have_http_status(:found)
    expect(PointGrant.pluck(:points)).to eq([500])
  end
end
`}
          />
          <p>
            Slack への通知はジョブのテストだけで確かめ、WebMock の <code>stub_request</code> で Slack の応答を決めています。リクエストのテストは最初の節で失敗したテストとほぼ同じですが、Slack のスタブがなくても通ります。登録のリクエストの中では、Slack への POST は送られず、ジョブが積まれるだけだからです。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。MySQL 8.4.13）"
            code={`
DomainEvents
  イベントは変えられない。値を変えるには with で別のイベントを作る
  購読者の1つが例外を起こしても、ほかの購読者を呼び、その後で例外を伝える
  after_commit の購読者は、コミットの後に呼ばれ、ロールバックしたら呼ばれない

NotifyStaffJob
  イベントの値から、Slack に投稿する本文を作る
  Slack が 500 を返したら、例外を外に出さずに、同じ引数で再試行を積む

環境
  MySQL 8.4 につながる

会員登録
  後続の処理を知らないので、Slack のスタブなしで登録のテストを書ける

RegisterMember
  会員とポイントを同じトランザクションで保存し、コミットの後でメールと通知のジョブを積む
  外側のトランザクションがロールバックしたら、会員もポイントも残らず、ジョブも積まない
  同じトランザクションの購読者が失敗したら、会員の保存も取り消される
  同じメールアドレスで2回登録すると、2回目はポイントもジョブも作らない

Finished in 0.17928 seconds (files took 0.91228 seconds to load)
11 examples, 0 failures
`}
          />
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
            <li>後の処理を足すときに、<code>RegisterMember</code> とそのテストを変えずに、initializer に購読者を足すだけで済みます。</li>
            <li>メールや Slack への通知を非同期にしたので、その失敗や遅さが登録に影響しません。最初の節では Slack に接続できないだけで登録が失敗しましたが、この章の実装では登録は 302 で成功し、通知は再試行に回りました。</li>
            <li>業務で起きたこと（会員が登録された）が、<code>MemberRegistered</code> という名前と項目で明示されます。</li>
            <li>登録の処理と後の処理を、別々にテストできます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>全体として何が起きるかが、<code>RegisterMember</code> を読んでも分かりません。購読者の一覧（initializer）を読む必要があります。</li>
            <li>購読者ごとに、同じトランザクションの中で行うか、コミットの後に行うかを決める必要があります。</li>
            <li>非同期にした処理は遅れて実行され、失敗すれば実行し直されます。同じジョブが2回実行されても問題がないようにする必要があります（<ChapterLink n={52} section="idea" />）。Slack への投稿が2回になることは許すが、ポイントは一意索引で2回付けない、のように処理ごとに決めます。</li>
            <li>コミットの後、ジョブを積む前にプロセスが止まると、メールと通知は失われます。失われては困る処理には、<ChapterLink n={53} section="idea" />の Transactional Outbox が必要です。</li>
            <li>ジョブキューとワーカーを動かし、失敗したジョブ（Sidekiq の Dead）を監視する運用が必要になります。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            イベントのクラスは DB なしでテストでき、ジョブはイベントのハッシュを渡すだけでテストできます。登録のテストは、後の処理のスタブを持たなくなりました。一方で、「登録したらメールが届く」という全体の流れは、<code>RegisterMember</code> のテスト（ジョブが積まれること）とジョブやメーラーのテスト（積まれたジョブが正しく動くこと）を組み合わせて確かめます。どちらか一方だけでは、購読の名前の書き間違いのような、つなぎ目の誤りを見落とします。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>イベントの連鎖が追いにくくなる</h3>
          <p>
            購読者をモデルのコールバック、複数の initializer、gem の設定などに散らばって登録すると、「会員が登録されたら何が起きるか」を調べるために、アプリ全体を検索することになります。<code>ActiveSupport::Notifications</code> の購読の名前は文字列なので、名前を書き間違えた購読者はエラーにならず、呼ばれないだけです。購読者は initializer の1つのファイルにまとめ、イベントの種類ごとに並べます。購読者が呼ばれることは、発行する処理のテスト（ジョブが積まれること）で確かめます。
          </p>
          <h3>コミットの前に、取り消せない処理をする</h3>
          <p>
            トランザクションの中でメールを送ったり、Redis のキューにジョブを積んだりすると、ROLLBACK されても取り消せません（最初の節の図 87-1）。<code>.in_transaction</code> の購読者に次のように書くのが典型的な誤りです。
          </p>
          <Code
            lang="ruby"
            title="誤用：トランザクションの中の購読者で、Redis にジョブを積む"
            code={`
ActiveSupport::Notifications.subscribe("member_registered.in_transaction") do |notification|
  event = notification.payload[:event]
  WelcomeMailer.welcome(event.email, event.name).deliver_later # コミットの前に Redis に入る
end
`}
          />
          <p>
            取り消せない処理は <code>.after_commit</code> の購読者で行うか、ジョブのクラスで <code>enqueue_after_transaction_commit</code> を有効にするか、同じ DB に記録する方法（<ChapterLink n={53} section="idea" />）で行います。
          </p>
          <h3>命令をイベントと呼ぶ</h3>
          <p>
            <code>SendWelcomeMail</code> のような命令の名前のイベントは、発行する側が受け取る側の処理を決めています。購読者は1つしかなく、登録の処理はメールを送らせるために発行しているので、直接呼ぶのと変わりません。起きた事実（<code>MemberRegistered</code>）を発行し、メールを送るかどうかは購読者が決めます。
          </p>
          <h3>購読者の結果に、発行する側が頼る</h3>
          <Code
            lang="ruby"
            title="誤用：発行した後に、購読者が作ったポイントを前提に処理を続ける"
            code={`
member = Member.create!(name:, email:)
DomainEvents.publish(MemberRegistered.from(member))
render json: { points: member.point_grants.sum(:points) } # 購読者がポイントを付けた前提
`}
          />
          <p>
            発行した後に、購読者が作ったデータを前提に処理を続けると、発行する側が購読者を知っていることになります。ポイントの購読者を外すと、登録の応答が変わります。その処理が登録に必要なら、イベントにせず <code>RegisterMember</code> の中で直接呼びます。
          </p>
          <h3>イベントの連鎖を深くする</h3>
          <p>
            ポイントの購読者が「ポイントが付与された」を発行し、その購読者が「会員のランクが上がった」を発行し、さらにその購読者が……という連鎖が深くなると、1つの登録で何が起きるかを追えなくなります<Ref n={4} />。<code>.in_transaction</code> の連鎖は、どこか1つの失敗で全体が取り消されるので、失敗の原因を探す範囲も広がります。一連の業務の流れとして読めるべき処理は、ユースケース（<code>RegisterMember</code>）に順に書きます。
          </p>
          <h3>内部のイベントをそのまま外部に公開する</h3>
          <Code
            lang="ruby"
            title="誤用：内部のイベントをそのまま外部の CRM に送る"
            code={`
ActiveSupport::Notifications.subscribe("member_registered.after_commit") do |notification|
  CrmSyncJob.perform_later(notification.payload[:event].to_h) # 内部の項目の名前がそのまま外部に出る
end
`}
          />
          <p>
            内部のイベントの項目を外部のサービスに送ると、内部で <code>name</code> を <code>full_name</code> に変えるだけで、外部のサービスが壊れます。メールアドレスのような個人情報を、必要のない相手に送ることにもなります。公開する形（統合イベント）は別に決め、公開してよい項目だけを選んで作ります<Ref n={3} />。
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
            <li>直接呼ぶ：後の処理が1つか2つで、増える予定がないなら、<code>RegisterMember</code> に順に書く方が読みやすく、追いやすくなります。Slack への通知は <code>ActiveRecord.after_all_transactions_commit {'{'} NotifyStaffJob.perform_later(…) {'}'}</code> と書けば、イベントにしなくてもコミットの後のジョブにできます。</li>
            <li>ジョブを直接積む：非同期にしたいだけなら、イベントバスを作らずに、ユースケースがコミットの後にジョブを積めば足ります。ジョブのクラスで <code>enqueue_after_transaction_commit</code> を有効にする方法もあります<Ref n={10} />。</li>
          </ul>
          <h3>モデルのコールバック</h3>
          <p>
            <code>Member</code> に <code>after_create_commit :notify_staff</code> と書いても、コミットの後に通知のジョブを積めます。Rails のガイドは、<code>after_commit</code> は DB のトランザクションに含まれない外部のシステムとやり取りするときに最も役立つと説明しています<Ref n={8} />（<ChapterLink n={14} section="after-commit" />の「after_save と after_commit」）。ただしコールバックは、そのモデルを保存するすべての処理で動きます。管理画面からの会員の一括登録や、テストのデータの作成でも、Slack に通知が飛びます。Domain Events は「会員登録という業務の操作」が発行するので、会員の行を作るたびではなく、登録の操作のときだけ購読者が動きます。コールバックに置く処理の選び方は<ChapterLink n={30} section="callback-design" />の「コールバックに置く処理を選ぶ」で扱いました。
          </p>
          <h3>Observer</h3>
          <p>
            Ruby の Observable のように、オブジェクトに相手を登録して状態の変化を知らせる方法もあります<Ref n={17} />。登録先がオブジェクトごとなので、Rails のモデルのように、リクエストのたびに作られるオブジェクトでは登録の手間がかかります。Domain Events は、起きた事実をイベントのオブジェクトにし、アプリ全体で1つのイベントバスを通して配ります。
          </p>
          <h3>gem：wisper と Rails Event Store</h3>
          <ul>
            <li>
              wisper：Ruby のオブジェクトに publish/subscribe の機能を加える小さなライブラリです。README は、ActiveRecord のコールバックや Observer の代わりに使えること、イベントを同期でも非同期でも配れること、Sidekiq や Active Job のアダプターがあることを説明しています<Ref n={16} />。発行するオブジェクトに購読者を登録する形と、アプリ全体の購読者（global listeners）を登録する形があります。
            </li>
            <li>
              Rails Event Store：イベントを発行・購読するだけでなく、DB に保存して後から読めるライブラリです。README は、publish/subscribe のイベントバス、同期と非同期の購読、監査のログ、参照用のモデルの作成、Event Sourcing などの用途を挙げています<Ref n={18} />。イベントを保存するので、障害の後に処理し直したり、何が起きたかを調べたりできます。
            </li>
          </ul>
          <p>
            この章の <code>DomainEvents</code> は、Rails に含まれる <code>ActiveSupport::Notifications</code> の上に10行ほどで作りました。イベントの種類と購読者が少ないうちはこれで足ります。イベントを保存したい、購読者ごとに非同期で配りたい、という要件が出てきたら、Rails Event Store を検討します。
          </p>
          <h3>Transactional Outbox との関係</h3>
          <p>
            この章の実装では、コミットの後、ジョブを積む前にプロセスが止まると、メールと通知が失われます。<ChapterLink n={53} section="idea" />の Transactional Outbox は、イベントを会員と同じトランザクションで DB の表に記録し、別の処理がその表から読んで確実に送るパターンです。CRM への登録のように、失われては困る後の処理は、<code>.after_commit</code> の購読者ではなく、<code>.in_transaction</code> の購読者で outbox の行を INSERT する形にします。Solid Queue をアプリと同じ DB に置く場合も、ジョブの行が同じトランザクションに入るので、同じ性質を持ちます（<ChapterLink n={51} section="job-queue">「ジョブキューと DB のトランザクション」の節</ChapterLink>）。
          </p>
          <h3>Rails.event</h3>
          <p>
            Rails 8.1 の <code>Rails.event</code> は、構造化したイベントをログや監視に出すための仕組みです。本番の環境では購読者の例外を報告して処理を続けるので、業務の後の処理を動かすイベントバスには使わず、「何が起きたか」を記録する用途に使います（<ChapterLink n={51} section="rails-impl">「Rails での実装」の節</ChapterLink>）。
          </p>
          <h3>関連するパターン</h3>
          <ul>
            <li>Use Case（<ChapterLink n={44} section="idea" />）：イベントを発行するのはユースケースです。何を同じトランザクションで行い、何をコミットの後に行うかを、ユースケースと購読の名前で決めます。</li>
            <li>Idempotency Key / Deduplication（<ChapterLink n={52} section="idea" />）：非同期の処理は実行し直されることがあるので、同じイベントを2回処理しても結果が変わらないようにします。イベントの ID はそのためのキーに使えます。</li>
            <li>Materialized View（<ChapterLink n={50} section="idea" />）：イベントを受け取って参照用のモデルを更新する方式があります。</li>
            <li>Event Sourcing：イベントの記録そのものを正しいデータとして保存し、今の状態をイベントから求める考え方です。この本では扱いません。</li>
          </ul>
          <h3>採用する条件</h3>
          <ul>
            <li>1つの業務の処理の後に、関係の薄い処理がいくつもあり、今後も増える</li>
            <li>後の処理の失敗や遅さを、本体の処理から切り離したい</li>
            <li>起きた事実を、アプリのほかの部分やほかのサービスに伝える必要がある</li>
          </ul>
          <h3>採用しない方がよい条件</h3>
          <ul>
            <li>後の処理が少なく、増える予定がない（直接呼ぶ方が読みやすい）</li>
            <li>後の処理の結果を、本体がその場で必要とする（直接呼ぶ）</li>
            <li>イベントの連鎖でしか表せないほど、流れが長く複雑になる（流れをユースケースの1か所に書く）</li>
          </ul>
          <h3>判断のチェックポイント</h3>
          <ol>
            <li>イベントの名前は、起きた事実を表す過去形か</li>
            <li>購読者ごとに、同じトランザクションで行うか、コミットの後に行うかを決めたか</li>
            <li>取り消せない処理を、コミットの前に行っていないか。<code>enqueue_after_transaction_commit</code> の設定を確かめたか</li>
            <li>コミットの後の購読者は、ジョブを積むだけにしているか</li>
            <li>コミットの後に処理が失われてもよいか。よくないなら Transactional Outbox を使うか</li>
            <li>非同期の処理が2回実行されても問題がないか</li>
            <li>購読者の一覧を、1か所で読めるようにしているか</li>
          </ol>
          <Callout kind="note" title="この章の例での判断">
            <p>
              ポイントの付与は、会員と一緒に確定しないと整合性が崩れるので、同じトランザクションの購読者にしました。ようこそのメールと Slack への通知は、遅れてもよく、送信を取り消せないので、コミットの後にジョブとして積みました。これらが失われても登録の業務には困らないので、この章の方式で足ります。CRM への登録のように失われては困る処理を足すときは、Transactional Outbox を使います。
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
          <li>Domain Events は、業務の中で起きた事実を過去形の名前の不変のオブジェクトにして発行するパターンです。発行する側は受け取る側を知らないので、後の処理を足すときに本体の処理とテストを変えずに済みます。</li>
          <li>Rails では、イベントを <code>Data.define</code> で作り、<code>ActiveSupport::Notifications</code> の <code>instrument</code> と <code>subscribe</code> で発行と購読をします。購読者は呼んだスレッドで、その場で呼ばれます。</li>
          <li>購読者の1つが例外を起こしても、Notifications はほかの購読者を呼び、その後で例外を伝えます。トランザクションの中の購読者の例外は、本体ごと取り消します。</li>
          <li>Sidekiq のジョブは Redis に積まれ、MySQL のトランザクションの外にあります。Rails 8.1 の既定ではトランザクションの中の <code>perform_later</code> はその場で積まれるので、取り消せない処理は <code>after_all_transactions_commit</code> などでコミットの後に積みます。Solid Queue をアプリと同じ DB に置けば、ジョブを積むことも同じトランザクションに入ります。</li>
          <li>コミットの後の購読者はジョブを積むだけにし、外部への通知などはジョブの中で行い、<code>retry_on</code> で実行し直します。</li>
          <li>コミットの後に処理が失われては困るなら Transactional Outbox を、2回実行されては困るなら冪等性キーや一意索引を組み合わせます。</li>
          <li>Rails 8.1 の <code>Rails.event</code> は構造化したログや監視のための仕組みで、業務の後の処理を動かすイベントバスとは用途が違います。</li>
          <li>後の処理が少なく増えないなら直接呼び、モデルのすべての保存で動かしたい処理ならコールバック、イベントを保存したいなら Rails Event Store を選びます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Domain Event', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/eaaDev/DomainEvent.html', accessed: '2026-11-13', version: '2005年12月12日', note: 'ドメインに影響する出来事を記録するものとしての Domain Event。' },
    { title: 'Domain-Driven Design Reference: Definitions and Pattern Summaries', publisher: 'Eric Evans／Domain Language', url: 'https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf', accessed: '2026-11-13', version: '2015年', note: 'ドメインイベントは専門家が気にかける起きたこと。不変、時刻、エンティティの ID、イベントの ID。' },
    { title: 'Domain events: Design and implementation（.NET Microservices: Architecture for Containerized .NET Applications）', publisher: 'Microsoft Learn', url: 'https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation', accessed: '2026-11-13', version: '2024年1月3日更新', note: '過去形の名前と不変のクラス、コミットの前に配るか後に配るかの判断、ドメインイベントと統合イベント。' },
    { title: 'What do you mean by “Event-Driven”?', publisher: 'Martin Fowler／martinfowler.com', url: 'https://martinfowler.com/articles/201701-event-driven.html', accessed: '2026-11-13', version: '2017年2月7日', note: 'イベントによる通知は結び付きを弱くするが、複数の通知をまたぐ流れが見えにくくなること。' },
    { title: 'class Data', publisher: 'Ruby 3.4 Documentation', url: 'https://docs.ruby-lang.org/en/3.4/Data.html', accessed: '2026-11-20', note: 'Data は項目に書き込むメソッドを持たず、不変の値を保存するためのものであること。' },
    { title: 'ActiveSupport::Notifications', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/Notifications.html', accessed: '2026-11-13', version: 'v8.1.4.1', note: '計測の API。instrument と subscribe。' },
    { title: 'activesupport/lib/active_support/notifications/fanout.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/notifications/fanout.rb#L8-L45`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '購読者の例外を集めて、すべての購読者を呼んだ後に投げること、複数なら InstrumentationSubscriberError にまとめること。' },
    { title: 'Active Record Callbacks（Transaction Callbacks）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_record_callbacks.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'after_commit は、DB のトランザクションに含まれない外部のシステムとやり取りするときに役立つこと。' },
    { title: 'activerecord/lib/active_record.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record.rb#L560-L591`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'after_all_transactions_commit が、すべてのトランザクションのコミット後にだけブロックを呼び、トランザクションがなければすぐに呼ぶこと。' },
    { title: 'Active Job Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_job_basics.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'バックグラウンドのジョブの目的、引数に使える型、Solid Queue を同じ DB に置くとジョブも同じトランザクションに入ること、Rails 8 は既定で別の DB に置くこと、enqueue_after_transaction_commit を勧めること。' },
    { title: 'The Basics', publisher: 'Sidekiq Wiki（GitHub）', url: 'https://github.com/sidekiq/sidekiq/wiki/The-Basics', accessed: '2026-11-20', note: 'クライアントがジョブを JSON にして Redis のキューに入れ、サーバーのプロセスが取り出して perform を呼ぶこと。' },
    { title: 'Ruby on Rails 8.1 Release Notes（Structured Event Reporting）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_1_release_notes.html', accessed: '2026-11-13', note: 'Rails.event による構造化されたイベントの出力が加わったこと。' },
    { title: 'activesupport/lib/active_support/event_reporter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/event_reporter.rb#L363-L401`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'notify が購読者の emit を順に呼び、raise_on_error が true なら例外を投げ、false ならエラーレポーターに報告して続けること。' },
    { title: 'railties/lib/rails/application/bootstrap.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/bootstrap.rb#L74-L77`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'Rails.event.raise_on_error を config.consider_all_requests_local と同じ値にすること。' },
    { title: 'activejob/lib/active_job/exceptions.rb（retry_on）', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/exceptions.rb#L16-L75`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'retry_on の wait・attempts（最初の実行を含む）・jitter（既定 15%）と、回数を使い切ったら例外を外に出すこと。' },
    { title: 'krisleech/wisper（README）', publisher: 'GitHub', url: 'https://github.com/krisleech/wisper', accessed: '2026-11-20', version: '3.0.0', note: 'publish/subscribe の小さなライブラリ。コールバックや Observer の代わり、同期・非同期の配信、Sidekiq・Active Job のアダプター、global listeners。' },
    { title: 'Observable', publisher: 'Ruby 3.3 Documentation', url: 'https://docs.ruby-lang.org/en/3.3/Observable.html', accessed: '2026-11-13', note: 'Observer パターン（publish/subscribe）の説明。' },
    { title: 'RailsEventStore/rails_event_store（README）', publisher: 'GitHub', url: 'https://github.com/RailsEventStore/rails_event_store', accessed: '2026-11-20', version: '3.2.0', note: 'イベントの発行・購読・保存・読み出しを行うライブラリ。同期と非同期の購読、監査のログ、参照用のモデル、Event Sourcing などの用途。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/railties/lib/rails/application/configuration.rb#L321-L328', accessed: '2026-11-20', version: 'Rails 7.2.4', note: 'load_defaults 7.2 で active_job.enqueue_after_transaction_commit を :default にすること。' },
    { title: 'activejob/lib/active_job/enqueue_after_transaction_commit.rb', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v7.2.4/activejob/lib/active_job/enqueue_after_transaction_commit.rb#L6-L24', accessed: '2026-11-20', version: 'Rails 7.2.4', note: ':default のときは、キューのアダプターの enqueue_after_transaction_commit? で、コミットの後まで遅らせるかを決めること。' },
    { title: 'lib/active_job/queue_adapters/sidekiq_adapter.rb', publisher: 'sidekiq/sidekiq（GitHub）', url: 'https://github.com/sidekiq/sidekiq/blob/v8.1.7/lib/active_job/queue_adapters/sidekiq_adapter.rb#L55-L60', accessed: '2026-11-20', version: 'Sidekiq 8.1.7', note: 'Sidekiq のアダプターの enqueue_after_transaction_commit? が true を返すこと。' },
  ],
}

export default chapter
