import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation19 } from '../explanations/features'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 19-1 メールが届くまで ---------- */
function MailFlowFigure() {
  const cmds: [string, string][] = [
    ['EHLO localhost', '250'],
    ['MAIL FROM:<app@example.com>', '250'],
    ['RCPT TO:<reader@example.com>', '250'],
    ['DATA', '354（本文を送ってよい）'],
    ['ヘッダー・空行・本文、最後に「.」の行', '250（受け付けた）'],
    ['QUIT', '221（接続を閉じる）'],
  ]
  return (
    <Svg
      id="19-1"
      w={780}
      h={330}
      label="アプリケーションは送信用の SMTP サーバーに接続し、SMTP の手順でメールを渡す。送信用のサーバーは、宛先のアドレスのドメインのメールを受け取るサーバーを調べ、そこへ SMTP で渡す。受信者はメールソフトや Web メールで、そのサーバーに届いたメールを読む。下段は、アプリケーションと SMTP サーバーのやり取りで、EHLO、MAIL FROM、RCPT TO、DATA、メールの文字列と「.」の行、QUIT を順に送り、サーバーはそれぞれに 250・354・221 などの番号で応答する"
    >
      <Box x={20} y={30} w={150} h={56} lines={['アプリケーション', 'Rails・Net::SMTP']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={170} y1={58} x2={226} y2={58} />
      <T x={198} y={48} anchor="middle" fs={10.5} tone="muted" mono>
        SMTP
      </T>
      <Box x={228} y={30} w={170} h={56} lines={['送信用の SMTP サーバー', '送信サービスなど']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={398} y1={58} x2={454} y2={58} />
      <T x={426} y={48} anchor="middle" fs={10.5} tone="muted" mono>
        SMTP
      </T>
      <Box x={456} y={30} w={170} h={56} lines={['宛先のメールサーバー', 'example.com 用']} fs={12} fill="box" subTone="muted" />
      <Arrow x1={626} y1={58} x2={658} y2={58} />
      <Box x={660} y={30} w={100} h={56} lines={['受信者', 'メールソフト']} fs={12} fill="bg" subTone="muted" />
      <T x={20} y={112} fs={11} tone="muted">
        アプリケーションの処理は送信用のサーバーが 250 を返した時点で終わる。受信者に届いたかどうかはここではわからない
      </T>
      <rect x={20} y={130} width={740} height={186} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={36} y={150} bold fs={12}>
        アプリケーションが送る行
      </T>
      <T x={470} y={150} bold fs={12}>
        SMTP サーバーの応答
      </T>
      {cmds.map(([c, r], i) => (
        <g key={c}>
          <T x={36} y={176 + i * 22} fs={11.5} mono={i !== 4}>
            {c}
          </T>
          <Arrow x1={330} y1={176 + i * 22} x2={460} y2={176 + i * 22} dashed />
          <T x={470} y={176 + i * 22} fs={11.5} mono={false}>
            {r}
          </T>
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 19-2 メーラーがメールを作って送るまで ---------- */
function MailerFlowFigure() {
  return (
    <Svg
      id="19-2"
      w={780}
      h={250}
      label="ArticleMailer.with(article: 記事).published.deliver_now を呼ぶと、published アクションが @article を用意して mail で宛先と件名を決める。アクションと同じ名前のテキスト用と HTML 用のテンプレートから本文が作られ、2つの部分を持つ1通のメールになる。配送方法が smtp なら SMTP サーバーに送り、test ならテスト環境で ActionMailer::Base.deliveries の配列に入れる"
    >
      <Box x={20} y={20} w={250} h={44} lines={['ArticleMailer.with(article: 記事)', '.published.deliver_now']} mono fs={11} fill="box5" />
      <Arrow x1={145} y1={64} x2={145} y2={92} />
      <Box x={20} y={94} w={250} h={56} lines={['published アクション', '@article を用意', 'mail(to: …, subject: …)']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={270} y1={122} x2={318} y2={122} />
      <Box x={320} y={86} w={200} h={72} lines={['テンプレート', 'published.text.erb', 'published.html.erb', '（レイアウト mailer）']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={520} y1={122} x2={568} y2={122} />
      <Box x={570} y={86} w={190} h={72} lines={['1通のメール', 'ヘッダー（From・To・Subject）', 'text/plain の部分', 'text/html の部分']} fs={11} fill="box4" subTone="muted" />
      <Arrow d="M665,158 L665,180 L535,180 L535,192" />
      <Arrow d="M665,180 L700,180 L700,192" />
      <Box x={440} y={194} w={190} h={40} lines={[':smtp（既定）', 'SMTP サーバーへ送る']} fs={11} fill="bg" subTone="muted" />
      <Box x={640} y={194} w={120} h={40} lines={[':test', 'deliveries に入れる']} fs={11} fill="bg" subTone="muted" />
      <T x={20} y={190} fs={11} tone="muted">
        配送方法は config.action_mailer.delivery_method で決まる
      </T>
      <T x={20} y={210} fs={11} tone="muted">
        （rails new が作るテスト環境の設定は :test）
      </T>
    </Svg>
  )
}

/* ---------- 図 19-4 ファイルのアップロードと保存先 ---------- */
function UploadFigure() {
  return (
    <Svg
      id="19-4"
      w={780}
      h={290}
      label="ブラウザーは、file_field を含むフォームの値を multipart/form-data の形式で POST する。要求の本文は boundary の文字列で区切られ、title の値と、photo.png のファイル名・種類・中身のバイト列が入る。Rails の params では、ファイルは ActionDispatch::Http::UploadedFile になり、中身は一時ファイルに書かれている。一時ファイルは応答の後に消されるので、要求を処理している間に、サーバーのディスクかクラウドのストレージに保存し、どのファイルがどの記事のものかをデータベースに記録する"
    >
      <Box x={20} y={30} w={170} h={70} lines={['ブラウザー', 'form（enctype=', 'multipart/form-data）']} fs={11.5} fill="bg" subTone="muted" />
      <Arrow x1={190} y1={65} x2={268} y2={65} />
      <T x={229} y={55} anchor="middle" fs={10.5} tone="muted" mono>
        POST
      </T>
      <Box x={270} y={14} w={230} h={104} lines={['要求の本文', '--boundary', 'name="article[title]" … 写真の記事', '--boundary', 'filename="photo.png" … バイト列']} fs={10.5} fill="box4" subTone="muted" />
      <Arrow x1={500} y1={65} x2={548} y2={65} />
      <Box x={550} y={14} w={210} h={104} lines={['Rails（Puma）', 'params の cover は', 'UploadedFile', '中身は一時ファイル', '（応答の後に消される）']} fs={11.5} fill="box5" subTone="muted" />
      <Arrow d="M655,118 L655,150" plain />
      <Arrow d="M170,150 L680,150" plain />
      <Arrow x1={170} y1={150} x2={170} y2={178} />
      <Arrow x1={460} y1={150} x2={460} y2={178} />
      <Arrow x1={680} y1={150} x2={680} y2={178} />
      <T x={190} y={138} fs={10.5} tone="muted">
        要求を処理している間に保存する
      </T>
      <Box x={20} y={180} w={300} h={58} lines={['サーバーのディスク（storage/ など）', 'そのサーバーからしか読めない']} fs={11.5} fill="box" subTone="muted" />
      <Box x={340} y={180} w={240} h={58} lines={['クラウドのストレージ（S3 など）', 'どのサーバーからも読める']} fs={11.5} fill="box" subTone="muted" />
      <Box x={600} y={180} w={160} h={58} lines={['データベース', 'どの記事のファイルか']} fs={11.5} fill="box4" subTone="muted" />
      <T x={20} y={266} fs={11} tone="muted">
        ActiveStorage は、保存先への保存とデータベースへの記録をまとめて行う（保存先は config/storage.yml に書く）
      </T>
    </Svg>
  )
}

/* ---------- 図 19-3 deliver_later の処理経路 ---------- */
function DeliverFigure() {
  return (
    <Svg
      id="19-3"
      w={780}
      h={250}
      label="ArticleMailer.with(article: a).published は MessageDelivery を返すだけで、メールはまだ作られない。deliver_now ならその場でメーラーのアクションを実行してテンプレートを描画し、Mail::Message を SMTP などで送る。deliver_later なら、メーラー名・アクション名・params を ActionMailer::MailDeliveryJob の引数にしてキューに入れる。ジョブの実行時に、Sidekiq などのプロセスで同じ順に描画と送信が行われる。記事は GlobalID で渡るので、実行時のデータでメールが作られる"
    >
      <Box x={20} y={20} w={230} h={50} lines={['ArticleMailer.with(…).published', 'MessageDelivery（未処理）']} mono fs={11} fill="box" subTone="muted" />
      <Arrow x1={250} y1={36} x2={328} y2={36} />
      <T x={289} y={26} anchor="middle" fs={10.5} tone="muted" mono>
        deliver_now
      </T>
      <Box x={330} y={14} w={200} h={44} lines={['published アクションを実行', 'テンプレートを描画']} fs={11} fill="box" subTone="muted" />
      <Arrow x1={530} y1={36} x2={558} y2={36} />
      <Box x={560} y={14} w={200} h={44} lines={['Mail::Message', 'SMTP などで送信']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow d="M135,70 L135,140 L298,140" />
      <T x={142} y={110} fs={10.5} tone="muted" mono>
        deliver_later
      </T>
      <Box x={300} y={116} w={220} h={50} lines={['MailDeliveryJob を投入', '("ArticleMailer", "published", …)']} fs={11} fill="box2" subTone="muted" />
      <Arrow x1={520} y1={141} x2={548} y2={141} />
      <Box x={550} y={120} w={210} h={44} lines={['キュー（Redis など）', '第18章']} fs={11.5} fill="box4" subTone="muted" />
      <Arrow d="M655,164 L655,196 L520,196" />
      <Box x={300} y={176} w={220} h={44} lines={['ジョブの実行（別のプロセス）', 'deliver_now と同じ処理（上段）']} fs={11} fill="box" subTone="muted" />
      <T x={20} y={240} fs={11} tone="muted">
        params の ActiveRecord は GlobalID で渡るので、ジョブの実行時に読み直したデータでメールが作られる
      </T>
    </Svg>
  )
}

/* ---------- 図 19-5 ActiveStorage のテーブル ---------- */
function TablesFigure() {
  const cols = (x: number, y: number, title: string, rows: string[], fill: 'box' | 'box4' | 'box5', w = 220) => (
    <g>
      <rect x={x} y={y} width={w} height={26 + rows.length * 19} rx={6} fill={`var(--fig-${fill})`} stroke="var(--fig-line)" />
      <T x={x + 10} y={y + 14} bold fs={12} mono>
        {title}
      </T>
      <line x1={x} y1={y + 26} x2={x + w} y2={y + 26} stroke="var(--fig-line)" />
      {rows.map((r, i) => (
        <T key={r} x={x + 10} y={y + 37 + i * 19} fs={11} mono>
          {r}
        </T>
      ))}
    </g>
  )
  return (
    <Svg
      id="19-5"
      w={780}
      h={300}
      label="articles の行は、active_storage_attachments の record_type と record_id で参照される。attachments は name（cover）と blob_id を持ち、active_storage_blobs の行を指す。blobs はファイルの key、filename、content_type、byte_size、checksum、service_name、metadata を持ち、ファイルの本体はストレージのサービスに key の名前で保存される。variant を作ると、active_storage_variant_records に元の blob_id と変換内容のダイジェストが記録され、変換後のファイルは別の blob として、record_type が ActiveStorage::VariantRecord の attachment でつながる"
    >
      {cols(20, 30, 'articles', ['id = 1', 'title …'], 'box')}
      {cols(280, 20, 'active_storage_attachments', ['name = "cover"', 'record_type = "Article"', 'record_id = 1', 'blob_id = 1'], 'box', 240)}
      {cols(560, 20, 'active_storage_blobs', ['id = 1', 'key = "ov8aaow7…"', 'filename = "cover.png"', 'byte_size・checksum', 'service_name = "local"', 'metadata（解析結果）'], 'box4')}
      {cols(280, 190, 'active_storage_variant_records', ['blob_id = 1', 'variation_digest'], 'box5', 240)}
      <Arrow x1={278} y1={78} x2={242} y2={56} />
      <T x={252} y={98} fs={10} tone="muted">
        record
      </T>
      <Arrow x1={520} y1={110} x2={558} y2={80} />
      <Arrow d="M520,220 L540,220 L540,140 L558,140" dashed />
      <Box x={560} y={200} w={200} h={56} lines={['ストレージのサービス', 'storage/ov/8a/ov8aaow7…']} fs={11} fill="bg" subTone="muted" />
      <Arrow x1={660} y1={160} x2={660} y2={198} />
      <T x={20} y={280} fs={11} tone="muted">
        変換後のファイルは別の blob になり、record_type が "ActiveStorage::VariantRecord" の attachment で variant_records とつながる
      </T>
    </Svg>
  )
}

/* ---------- 図 19-6 リダイレクトとプロキシ ---------- */
function ModeFigure() {
  return (
    <Svg
      id="19-6"
      w={780}
      h={250}
      label="リダイレクト方式では、ブラウザーが /rails/active_storage/blobs/redirect/署名付きID/cover.png を要求すると、Rails は 5 分で期限が切れるストレージの URL に 302 でリダイレクトし、ブラウザーはストレージからファイルを直接取得する。プロキシ方式では、Rails がストレージからファイルを読んでブラウザーに返すので、転送の間 Puma のスレッドを使うが、CDN でキャッシュできる"
    >
      <T x={20} y={20} bold>
        リダイレクト方式（既定）
      </T>
      <Box x={20} y={36} w={120} h={40} lines="ブラウザー" fill="bg" />
      <Arrow x1={140} y1={50} x2={276} y2={50} />
      <T x={208} y={40} anchor="middle" fs={10} tone="muted" mono>
        GET …/redirect/…
      </T>
      <Box x={278} y={36} w={170} h={40} lines="Rails（Puma）" fill="box" />
      <Arrow x1={278} y1={66} x2={142} y2={66} dashed />
      <T x={208} y={80} anchor="middle" fs={10} tone="muted">
        302（期限 5 分の URL）
      </T>
      <Box x={560} y={36} w={200} h={40} lines="ストレージ（S3 など）" fill="box4" />
      <Arrow d="M80,76 L80,100 L660,100 L660,78" />
      <T x={370} y={112} anchor="middle" fs={10.5} tone="muted">
        ブラウザーが直接取得（Puma を通らない）
      </T>
      <T x={20} y={150} bold>
        プロキシ方式（rails_storage_proxy_path）
      </T>
      <Box x={20} y={166} w={120} h={40} lines="ブラウザー" fill="bg" />
      <Arrow x1={140} y1={186} x2={276} y2={186} both />
      <Box x={278} y={166} w={170} h={40} lines="Rails（Puma）" fill="box" />
      <Arrow x1={448} y1={186} x2={558} y2={186} both />
      <Box x={560} y={166} w={200} h={40} lines="ストレージ（S3 など）" fill="box4" />
      <T x={370} y={226} anchor="middle" fs={10.5} tone="muted">
        転送の間 Puma のスレッドを使う。CDN を前に置いてキャッシュさせる用途
      </T>
    </Svg>
  )
}

/* ---------- 図 19-7 直接アップロード ---------- */
function DirectFigure() {
  const lanes = [
    { x: 50, t: 'ブラウザー' },
    { x: 540, t: 'Rails' },
    { x: 730, t: 'ストレージ' },
  ]
  const msgs = [
    { a: 0, b: 1, y: 64, t: '① POST direct_uploads（ファイル名・サイズ・チェックサム）' },
    { a: 1, b: 0, y: 104, t: '② blob の行を作成。アップロード先の URL と signed_id を返す', dashed: true },
    { a: 0, b: 2, y: 144, t: '③ PUT でファイル本体を直接送る' },
    { a: 0, b: 1, y: 184, t: '④ フォームを送信（ファイルの代わりに signed_id）' },
  ]
  return (
    <Svg
      id="19-7"
      w={780}
      h={220}
      label="直接アップロードでは、ブラウザーがまず Rails の direct_uploads にファイル名・サイズ・チェックサムを POST する。Rails は blob の行を作り、署名付きのアップロード先の URL と signed_id を返す。ブラウザーはファイルをストレージに直接 PUT し、最後にフォームをファイルの代わりに signed_id を付けて送信する。ファイルの本体は Rails を通らない"
    >
      {lanes.map((l) => (
        <g key={l.t}>
          <T x={l.x} y={20} anchor="middle" bold fs={12.5}>
            {l.t}
          </T>
          <line x1={l.x} y1={32} x2={l.x} y2={206} stroke="var(--fig-line)" strokeDasharray="3 4" />
        </g>
      ))}
      {msgs.map((m) => {
        const x1 = lanes[m.a].x
        const x2 = lanes[m.b].x
        return (
          <g key={m.t}>
            <Arrow x1={x1} y1={m.y} x2={x2 + (x2 > x1 ? -4 : 4)} y2={m.y} dashed={m.dashed} accent={m.a === 0 && m.b === 2} />
            <T x={62} y={m.y - 10} fs={10.5} tone={m.a === 0 && m.b === 2 ? 'acc' : undefined}>
              {m.t}
            </T>
          </g>
        )
      })}
    </Svg>
  )
}

const ch19: Chapter = {
  number: 19,
  part: 4,
  title: 'メールとファイル添付',
  summary:
    'アプリケーションが SMTP サーバーにメールを渡す手順と、メーラーでメールを作って送る書き方を実際に動かして確かめてから、ActionMailer のメーラーがコントローラーと同じ描画の仕組みでメールを作ることと、deliver_now・deliver_later の違いを、投入されるジョブの中身とともに説明します。ファイルのアップロードで送られる要求と保存先を確かめた後、ActiveStorage のテーブル構造、ファイルの配信方式、直接アップロード、バリアントの生成とその注意点も扱います。',
  goals: [
    'アプリケーションが SMTP サーバーにメールを渡す手順と、その後メールが受信者に届くまでの流れを説明できる',
    'メーラーのクラスとテンプレートを書き、deliver_now で送ったときに作られるメール（ヘッダーとマルチパートの本文）を読み取れる',
    'メーラーが AbstractController::Base を継承し、テンプレートからマルチパートのメールを作ることを説明できる',
    'MessageDelivery が遅延して処理されることと、deliver_later が投入するジョブの中身を説明できる',
    'ファイルのアップロードで送られる multipart/form-data の要求と、受け取ったファイルを要求の間に保存する必要があることを説明できる',
    'ActiveStorage の3つのテーブルと、添付したときに実行される SQL とジョブを説明できる',
    'リダイレクト方式とプロキシ方式の配信の違いと、URL の有効期限を説明できる',
    '直接アップロードでファイルが Rails を通らない流れを説明できる',
    'バリアントが最初の要求で生成されることと、その負荷や安全上の注意を説明できる',
  ],
  prerequisites: [10, 16, 18],
  sections: [
    {
      id: 'mail-flow',
      title: 'メールが届くまで',
      body: (
        <>
          <p>
            Web アプリケーションは会員登録の確認、パスワードの再設定、新しい記事のお知らせなどでメールを送ります。メールは宛先（To）・差出人（From）・件名（Subject）などのヘッダーと、本文からなる文字列です。アプリケーションはこの文字列を作り、SMTP
            サーバーに渡します。SMTP（Simple Mail Transfer Protocol）はメールを送るときの通信の手順で、SMTP サーバーはこの手順でメールを受け取って宛先へ届けるプログラムです
            <Ref n={8} />。
          </p>
          <p>
            まず Rails を使わずに、Ruby の Net::SMTP でメールを送ってみます
            <Ref n={18} />。受け取った内容を表示するだけの検証用の SMTP サーバーを、smtp19 という名前のコンテナでポート 2525 に用意し、そこへ送りました。
          </p>
          <Code
            lang="ruby"
            title="send_mail.rb"
            code={`
require "net/smtp"

message = <<~MAIL
  From: app@example.com
  To: reader@example.com
  Subject: Hello

  This is the body.
MAIL

Net::SMTP.start("smtp19", 2525) do |smtp|
  smtp.send_message(message, "app@example.com", "reader@example.com")
end
puts "送信しました"
`}
          />
          <Code
            lang="text"
            title="検証用の SMTP サーバーの表示（C: はアプリケーションが送った行、S: はサーバーの応答。Ruby 4.0.9）"
            code={`
S: 220 smtp19 ready
C: EHLO localhost
S: 250 smtp19
C: MAIL FROM:<app@example.com>
S: 250 OK
C: RCPT TO:<reader@example.com>
S: 250 OK
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: From: app@example.com
C: To: reader@example.com
C: Subject: Hello
C:
C: This is the body.
C: .
S: 250 OK: queued
C: QUIT
S: 221 Bye
`}
          />
          <p>
            アプリケーションは接続すると EHLO で名乗り、MAIL FROM で差出人を、RCPT TO で宛先を伝えます。DATA の後にメールの文字列そのものを送り、「.」だけの行で終わりを示します。サーバーは1行ごとに番号で応答します。250
            は受け付けたこと、354 は本文を送ってよいこと、221 は接続を閉じることを表します
            <Ref n={8} />。送ったメールの文字列はヘッダーの行、空の行、本文の順に並んでいます
            <Ref n={9} />。
          </p>
          <p>
            実際の運用では、メールはいくつかのサーバーを経由して届きます（図 19-1）。アプリケーションが接続するのは、送信に使う SMTP サーバーです。メールの送信を請け負うサービスや、会社のメールサーバーを使います。送信用のサーバーは、宛先のアドレスの
            @ より後ろ（example.com）から、そのドメインのメールを受け取るサーバーを DNS（ドメイン名からサーバーの場所を調べる仕組み）で探し、そのサーバーへ同じく SMTP で渡します
            <Ref n={8} />。受信者はメールソフトや Web メールで、そのサーバーに届いたメールを読みます。アプリケーションの処理は、送信用のサーバーが 250
            を返した時点で終わります。受信者に届いたかどうかは、この時点ではわかりません。
          </p>
          <Figure n="19-1" title="メールが届くまで" caption="Net::SMTP と検証用の SMTP サーバーでの実測と、RFC 5321 をもとにした模式図。送信用のサーバーから先は実測していない。">
            <MailFlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'mailer-basics',
      title: 'メーラーでメールを作って送る',
      body: (
        <>
          <p>
            Rails では、メールを作って送る処理を ActionMailer の機能で書きます。送るメールの種類ごとに作るクラスをメーラーと呼び、app/mailers に置きます。メーラーは generate
            コマンドで作れます。ここでは <code>--pretend</code>（ファイルを作らずに、作るファイルの一覧だけを表示する指定）を付けて実行しました。
          </p>
          <Code
            lang="text"
            title="bin/rails generate mailer Notice greeting --pretend の出力"
            code={`
      create  app/mailers/notice_mailer.rb
      invoke  erb
      create    app/views/notice_mailer
      create    app/views/notice_mailer/greeting.text.erb
      create    app/views/notice_mailer/greeting.html.erb
      invoke  rspec
      create    spec/mailers/notice_mailer_spec.rb
      create    spec/fixtures/notice/greeting
      create    spec/mailers/previews/notice_mailer_preview.rb
`}
          />
          <p>
            NoticeMailer というクラスと、greeting というメールの本文のテンプレートが2つ作られます。.text.erb は文字だけの本文、.html.erb は HTML の本文のテンプレートです。rspec の行はテストのファイルと、ブラウザーでメールの表示を確かめるプレビューのファイルです
            <Ref n={1} />。
          </p>
          <p>デモのアプリケーションには、記事の公開を知らせる ArticleMailer があります。メーラーのクラスと、本文のテンプレートは次のとおりです。</p>
          <Code
            lang="ruby"
            title="app/mailers/application_mailer.rb と article_mailer.rb（デモ）"
            code={`
class ApplicationMailer < ActionMailer::Base
  default from: "from@example.com"
  layout "mailer"
end

class ArticleMailer < ApplicationMailer
  def published
    @article = params[:article]
    mail(to: "reader@example.com", subject: "記事「#{@article.title}」を公開しました")
  end
end
`}
          />
          <Code
            lang="erb"
            title="app/views/article_mailer/published.text.erb と published.html.erb（デモ）"
            code={`
<%= @article.title %> を公開しました。
記事を読む: <%= article_url(@article) %>

<p><%= @article.title %> を公開しました。</p>
<p><%= link_to "記事を読む", article_url(@article) %></p>
`}
          />
          <p>
            <code>default from:</code> は、このクラスを継承したメーラーが送るすべてのメールの差出人です。<code>published</code> がメールを作るメソッドで、メーラーのアクションと呼びます。
            <code>params[:article]</code> には、呼び出すときに <code>with</code> で渡した値が入ります。<code>mail</code> は宛先と件名を決め、アクションと同じ名前のテンプレートから本文を作ります。テンプレートの{' '}
            <code>@article</code> はアクションで代入したインスタンス変数です。
          </p>
          <p>
            送るときは、<code>with</code> で値を渡してアクションの名前のメソッドを呼び、<code>deliver_now</code> を呼びます。前の節の検証用の SMTP サーバーに送るように設定を変えて、rails
            runner（アプリケーションを読み込んで Ruby のコードを実行するコマンド）で実行しました。
          </p>
          <Code
            lang="ruby"
            title="bin/rails runner で実行したコード（ログを画面にも出す行などを省略）"
            code={`
ActionMailer::Base.smtp_settings = { address: "smtp19", port: 2525, enable_starttls_auto: false }
article = Article.find(1)
ArticleMailer.with(article: article).published.deliver_now
`}
          />
          <Code
            lang="text"
            title="ログ（一部を省略）"
            code={`
  Rendered article_mailer/published.html.erb within layouts/mailer (Duration: 2.9ms | GC: 0.0ms)
  Rendered article_mailer/published.text.erb within layouts/mailer (Duration: 1.4ms | GC: 0.0ms)
ArticleMailer#published: processed outbound mail in 447.7ms
Delivered mail 6afaab59bc979_1911ad894591@ce972af5af78.mail (187.5ms)
`}
          />
          <Code
            lang="text"
            title="検証用の SMTP サーバーが受け取った内容（一部を省略）"
            code={`
C: MAIL FROM:<from@example.com>
C: RCPT TO:<reader@example.com>
C: DATA
C: Date: Mon, 16 Nov 2026 07:06:01 +0000
C: From: from@example.com
C: To: reader@example.com
C: Subject: =?UTF-8?Q?=E8=A8=98=E4=BA=8B=E3=80=8C=E5=A4=89=E6=9B=B4=E5=BE=8C=E3=81=AE=E3=82=BF=E3=82=A4=E3=83=88=E3=83=AB=E3=80=8D=E3=82=92=E5=85=AC=E9=96=8B=E3=81=97=E3=81=BE=E3=81=97=E3=81=9F?=
C: MIME-Version: 1.0
C: Content-Type: multipart/alternative;
C:  boundary="--==_mimepart_6afaab59ae3e3_1911ad8944d9";
C:
C: ----==_mimepart_6afaab59ae3e3_1911ad8944d9
C: Content-Type: text/plain;
C: Content-Transfer-Encoding: base64
C:
C: 5aSJ5pu05b6M44Gu44K/44Kk44OI44OrIOOCkuWFrOmWi+OBl+OBvuOBl+OB
C: …
C: ----==_mimepart_6afaab59ae3e3_1911ad8944d9
C: Content-Type: text/html;
C: Content-Transfer-Encoding: quoted-printable
C: …
C: <p><a href=3D"http://localhost:3000/articles/1">=E8=A8=98=E4=BA=8B=E3=82=92=
C: …
C: ----==_mimepart_6afaab59ae3e3_1911ad8944d9--
C: .
`}
          />
          <p>
            From には <code>default</code> の値が、To と Subject には <code>mail</code> に渡した値が入りました。日本語の件名と本文は、メールで送れる文字だけで表すための形式に変換されています。件名の{' '}
            <code>=?UTF-8?Q?…?=</code>、本文の base64 と quoted-printable がその形式で、受信者のメールソフトが元の文字に戻して表示します
            <Ref n={10} />
            <Ref n={11} />。本文の base64 を元に戻すと「変更後のタイトル を公開しました。」と記事の URL になります（記事1のタイトルは「変更後のタイトル」です）。
          </p>
          <p>
            <code>Content-Type: multipart/alternative</code> は、同じ内容を別の形式で表した部分を並べたメールであることを表します。boundary
            の文字列で区切られた text/plain（文字だけの本文）と text/html（HTML の本文）の部分があり、受信者のメールソフトはどちらか一方を選んで表示します
            <Ref n={12} />（図 19-2）。
          </p>
          <p>
            ログの processed outbound mail はメールを作るのにかかった時間、Delivered mail は SMTP サーバーとのやり取りにかかった時間です。<code>deliver_now</code>{' '}
            は、この両方が終わるまで戻りません。メールをどこへ送るかは <code>config.action_mailer.delivery_method</code> で決まり、既定値は SMTP で送る <code>:smtp</code> です
            <Ref n={13} />。rails new が作るテスト環境の設定ファイルでは <code>:test</code> になっていて、メールを送らずに <code>ActionMailer::Base.deliveries</code>{' '}
            という配列に入れます
            <Ref n={14} />（<ChapterLink n={20} section="jobs-mail" />）。
          </p>
          <p>
            メーラーはアクションでインスタンス変数を用意し、アクションと同じ名前のテンプレートで本文を作ります。これはコントローラーが HTML の応答を作るときと同じ書き方です（
            <ChapterLink n={16} />
            ）。次の節では、メーラーとコントローラーが実際に同じクラスを継承していることを確かめます。
          </p>
          <Figure n="19-2" title="メーラーがメールを作って送るまで" caption="デモの ArticleMailer を検証用の SMTP サーバーに送った実測と、Rails 8.1.4.1 の設定の既定値をもとにした模式図。">
            <MailerFlowFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'mailer',
      title: 'メーラーの構造',
      body: (
        <>
          <p>デモのアプリケーションに、記事の公開を知らせるメーラーを作りました。</p>
          <Code
            lang="ruby"
            title="app/mailers/article_mailer.rb（デモ）"
            code={`
class ArticleMailer < ApplicationMailer
  def published
    @article = params[:article]
    mail(to: "reader@example.com", subject: "記事「#{@article.title}」を公開しました")
  end
end
`}
          />
          <p>メーラーのクラスの継承関係と、描画のモジュールを確かめました。</p>
          <Code
            lang="text"
            code={`
ArticleMailer < ApplicationMailer < ActionMailer::Base < AbstractController::Base
AbstractController::Rendering? true  ActionView::Layouts? true
`}
          />
          <p>
            ActionMailer::Base は、コントローラーと同じ AbstractController::Base を継承しています（<ChapterLink n={10} section="hierarchy" />
            ）。アクションの中のインスタンス変数がテンプレートで使えること、テンプレートの探索、レイアウト（layouts/mailer）は<ChapterLink n={16} />
            で見た仕組みのままです。違いは、<code>mail</code> がアクション名のテンプレートを形式ごとにすべて探し、見つかった分を1通のメールの部分（パート）にすることです。デモでは published.text.erb と published.html.erb
            を置いたので、マルチパートのメールになりました。
          </p>
          <Code
            lang="text"
            code={`
subject=記事「変更後のタイトル」を公開しました mime=multipart/alternative parts=["text/plain; charset=UTF-8", "text/html; charset=UTF-8"]
`}
          />
          <p>
            メールの中のリンクは <code>article_url(@article)</code> のように完全な URL で書きます。メールにはリクエストが無いので、ホスト名は{' '}
            <code>config.action_mailer.default_url_options</code> から取られます。設定が無いと、描画のときに <code>ActionView::Template::Error: Missing host to link to!</code> になりました。
          </p>
          <p>
            開発環境では、<code>ActionMailer::Preview</code> を継承したクラスを置くと、<code>/rails/mailers</code> でメールの表示を確かめられます
            <Ref n={1} />。デモでは rspec-rails（RSpec は<ChapterLink n={20} />）の既定の置き場所である spec/mailers/previews に置きました。
          </p>
        </>
      ),
    },
    {
      id: 'deliver',
      title: 'deliver_now と deliver_later',
      body: (
        <>
          <p>
            <code>ArticleMailer.with(article: a).published</code> は、メールを作らずに ActionMailer::MessageDelivery を返します。MessageDelivery は Mail::Message の代わりをするオブジェクトで、メッセージが必要になったときに初めてメーラーのアクションを実行します
            <Ref n={5} />。
          </p>
          <Code
            lang="ruby"
            title="actionmailer/lib/action_mailer/message_delivery.rb（33〜35行目、48〜50行目、104〜106行目）"
            href={`${GH}/actionmailer/lib/action_mailer/message_delivery.rb#L33-L50`}
            code={`
    def __getobj__ # :nodoc:
      @mail_message ||= processed_mailer.message
    end

    def processed?
      @processed_mailer || @mail_message
    end

    def deliver_later(options = {})
      enqueue_delivery :deliver_now, options
    end
`}
          />
          <p>
            デモで <code>processed?</code> を見ると、作った直後は nil で、<code>message</code> を呼んだ後はメーラーのインスタンス（真）になりました。<code>deliver_now</code>{' '}
            はその場でアクションを実行し、設定された配送方法（本番では SMTP など）で送ります。SMTP サーバーの応答を待つ間、Puma のスレッド（要求を処理する実行の流れ。<ChapterLink n={23} section="thread" />）は止まります。
          </p>
          <p>
            <code>deliver_later</code> はメールを作らず、ActionMailer::MailDeliveryJob を投入します。Redis に入ったジョブの引数は次のとおりです。
          </p>
          <Code
            lang="json"
            code={`
{
  "job_class": "ActionMailer::MailDeliveryJob",
  "queue_name": "default",
  "arguments": [
    "ArticleMailer",
    "published",
    "deliver_now",
    {
      "params": { "article": { "_aj_globalid": "gid://demo/Article/1" }, "_aj_symbol_keys": ["article"] },
      "args": [],
      "_aj_ruby2_keywords": ["params", "args"]
    }
  ]
}
`}
          />
          <p>
            保存されるのはメーラーの名前、アクションの名前、params と引数だけです。記事は GlobalID で渡るので、ジョブが実行されたときに記事を読み直して、その時点のデータでメールを描画します（図
            19-3）。投入の後で記事を変更すれば、変更後の内容が送られます。<ChapterLink n={18} section="transaction" />
            で見たとおり、トランザクションの中で <code>deliver_later</code> を呼ぶと、COMMIT 前にジョブが実行されて記事を見つけられないことがあります。
          </p>
          <p>
            キューの名前は default でした。ActionMailer の <code>deliver_later_queue_name</code> の既定値は :mailers ですが、<code>load_defaults 6.1</code> 以降では nil
            になり、ActiveJob の既定のキューが使われます
            <Ref n={2} />。Sidekiq を <code>-q mailers</code> などで起動している既存のアプリケーションでは、load_defaults を上げるとメールのジョブが別のキューに入るので確かめます。
          </p>
          <Figure n="19-3" title="deliver_later の処理経路" caption="Rails 8.1.4.1 の message_delivery.rb・mail_delivery_job.rb と、デモで投入されたジョブをもとにした模式図。">
            <DeliverFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'upload',
      title: 'ファイルのアップロードと保存先',
      body: (
        <>
          <p>
            記事に表紙の画像を付けるような機能では、利用者が自分のコンピューターにあるファイルを、ブラウザーからサーバーへ送ります。これをファイルのアップロードと呼びます。Rails のフォームでは <code>file_field</code> でファイルを選ぶ欄を作ります。次のフォームを描画しました。
          </p>
          <Code
            lang="erb"
            title="描画したフォーム"
            code={`
<%= form_with model: Article.new, url: "/articles" do |f| %>
  <%= f.text_field :title %>
  <%= f.file_field :cover %>
  <%= f.submit "保存" %>
<% end %>
`}
          />
          <Code
            lang="html"
            title="出力された HTML（改行を加えた）"
            code={`
<form enctype="multipart/form-data" action="/articles" accept-charset="UTF-8" method="post">
<input type="text" name="article[title]" id="article_title" />
<input type="file" name="article[cover]" id="article_cover" />
<input type="submit" name="commit" value="保存" data-disable-with="保存" />
</form>
`}
          />
          <p>
            <code>{'<input type="file">'}</code> がファイルを選ぶ欄です。<code>form_with</code> は、中に <code>file_field</code> があると、form タグに{' '}
            <code>enctype="multipart/form-data"</code> を付けます。ファイルを送るには、フォームの送り方をこの形式にする必要があります
            <Ref n={15} />。
          </p>
          <p>
            この形式でどんな要求が送られるかを確かめるため、届いた要求をそのまま表示する検証用のサーバーに、curl で同じ形式の要求を送りました。curl の <code>-F</code> はフォームの欄の名前と値を multipart/form-data
            で送る指定で、<code>@photo.png</code> はファイルの中身を送ることを表します。
          </p>
          <Code
            lang="text"
            title="curl -F 'article[title]=写真の記事' -F 'article[cover]=@photo.png' で送った要求（ファイルの中身は長さだけを表示）"
            code={`
POST /articles HTTP/1.1
Host: 127.0.0.1:8019
User-Agent: curl/8.23.0
Accept: */*
Content-Length: 651
Content-Type: multipart/form-data; boundary=------------------------fh9i1HGRnGthBaMrn7B3Zt

--------------------------fh9i1HGRnGthBaMrn7B3Zt
Content-Disposition: form-data; name="article[title]"

写真の記事
--------------------------fh9i1HGRnGthBaMrn7B3Zt
Content-Disposition: form-data; name="article[cover]"; filename="photo.png"
Content-Type: image/png

（ファイルの中身のバイト列 319 バイト）
--------------------------fh9i1HGRnGthBaMrn7B3Zt--
`}
          />
          <p>
            要求の本文は Content-Type ヘッダーの boundary の文字列で部分ごとに区切られています。1つ目の部分は title の値、2つ目の部分は photo.png で、元のファイル名、ファイルの種類（image/png）、ファイルの中身のバイト列が入っています
            <Ref n={16} />。ファイルの種類は送る側が付けた値なので、利用者が書き換えて送ることもできます。
          </p>
          <p>
            同じ要求をデモのアプリケーションに送ると、開発環境のログに次の行が出ました（送られた値をそのまま返すだけの検証用のアクションに送りました）。
          </p>
          <Code
            lang="text"
            title="開発環境のログ（Rails 8.1.4.1）"
            code={`
Started POST "/probe/echo/upload" for 172.29.0.1 at 2026-11-16 07:06:24 +0000
Processing by ProbeController#echo as */*
  Parameters: {"article" => {"title" => "写真の記事", "cover" => #<ActionDispatch::Http::UploadedFile:0x00007f7f24be0b90 @tempfile=#<Tempfile:/tmp/RackMultipart20261116-1-mzuh6u.png>, @content_type="image/png", @original_filename="photo.png", @headers="Content-Disposition: form-data; name=\\"article[cover]\\"; filename=\\"photo.png\\"\\r\\nContent-Type: image/png\\r\\n">}, "title" => "upload"}
`}
          />
          <p>
            <code>params[:article][:cover]</code> は ActionDispatch::Http::UploadedFile のオブジェクトになりました。<code>original_filename</code> は元のファイル名、
            <code>content_type</code> はファイルの種類で、ファイルの中身は一時ファイル（/tmp/RackMultipart…png）に書き出されています。一時ファイルは、応答を返し終えた後に Rack::TempfileReaper
            というミドルウェアが削除します
            <Ref n={17} />。ファイルを残すには、要求を処理している間に、別の場所へ保存します。
          </p>
          <p>
            保存先にはサーバーのディスクとクラウドのストレージがあります（図 19-4）。ディスクに保存すると手軽ですが、ファイルはそのサーバーの中にしかないので、サーバーが複数台あると、ほかのサーバーからは読めません。クラウドのストレージは Amazon
            S3 のように、ファイルを保存して後から取り出せるサービスで、どのサーバーからも同じファイルを読み書きできます。どちらに保存しても、どのファイルがどの記事のものかを、データベースに記録しておく必要があります。
          </p>
          <p>
            Rails の ActiveStorage は、保存先へのファイルの保存と、データベースへの記録をまとめて行う機能です。保存先は config/storage.yml に、サービスという単位で書きます
            <Ref n={4} />。
          </p>
          <Code
            lang="yaml"
            title="config/storage.yml（デモ。一部を省略）"
            code={`
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

# amazon:
#   service: S3
#   access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
#   secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
#   region: us-east-1
#   bucket: your_own_bucket-<%= Rails.env %>
`}
          />
          <p>
            <code>local</code> は Disk（サーバーのディスク）のサービスで、storage ディレクトリに保存します。<code>amazon</code> は S3 のサービスで、rails new
            が作るファイルではコメントになっています。どのサービスを使うかは環境ごとの設定ファイルで選び、デモの開発環境は <code>config.active_storage.service = :local</code> です。次の節では、ActiveStorage
            がファイルを添付したときに、データベースのどのテーブルに何を記録するかを確かめます。
          </p>
          <Figure n="19-4" title="ファイルのアップロードと保存先" caption="Rails 8.1.4.1 のデモでの実測（フォームの HTML、要求の本文、ログ）と、Rack 3.2.8 の tempfile_reaper.rb をもとにした模式図。">
            <UploadFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'tables',
      title: 'ActiveStorage のテーブル',
      body: (
        <>
          <p>
            ActiveStorage はファイルの情報をデータベースの3つのテーブルに、ファイルの本体をストレージのサービス（ローカルのディスク、S3 など）に保存します。<code>bin/rails active_storage:install</code>{' '}
            がテーブルを作るマイグレーションをコピーします。Article に表紙の画像を付けられるようにしました。
          </p>
          <Code
            lang="ruby"
            title="app/models/article.rb（デモ、抜粋）"
            code={`
class Article < ApplicationRecord
  has_one_attached :cover do |attachable|
    attachable.variant :thumb, resize_to_limit: [100, 100]
  end
end
`}
          />
          <p>
            <code>has_one_attached :cover</code> は、<code>cover_attachment</code>（has_one、ActiveStorage::Attachment）と <code>cover_blob</code>（has_one through）の関連を定義します
            <Ref n={3} />。記事のテーブルに列は追加されません。画像を添付したときの SQL と、投入されたジョブです。
          </p>
          <Code
            lang="text"
            code={`
BEGIN
SELECT active_storage_blobs.* … INNER JOIN active_storage_attachments …   （既存の添付を確認）
SELECT active_storage_attachments.* … WHERE record_id = 1 AND record_type = 'Article' …
INSERT INTO active_storage_blobs (key, filename, content_type, metadata, service_name, byte_size, checksum, created_at) VALUES ('ov8aaow7e2mjrsfdyd1vgfw…
INSERT INTO active_storage_attachments (name, record_type, record_id, blob_id, created_at) VALUES ('cover', 'Article', 1, 1, …)
UPDATE articles SET updated_at = …, lock_version = 10 WHERE id = 1 AND lock_version = 9
COMMIT
enqueued: ["ActiveStorage::AnalyzeJob(gid://demo/ActiveStorage::Blob/1)"]
blob: {"key" => "ov8aaow7e2mjrsfdyd1vgfwb9bzr", "filename" => "cover.png", "content_type" => "image/png", "byte_size" => 17983,
       "checksum" => "It6Gda/qwhqLa3B3Vbi/Ow==", "service_name" => "local", "metadata" => {"identified" => true}}
path: storage/ov/8a/ov8aaow7e2mjrsfdyd1vgfwb9bzr
`}
          />
          <p>
            blob の <code>key</code> はランダムな文字列で、ディスクのサービスでは先頭の4文字で2段のディレクトリを作って保存します。元のファイル名はファイルシステムに使われません。添付すると記事の updated_at
            も更新されます（<code>touch</code>。楽観的ロックの lock_version も増えています）。
          </p>
          <p>
            COMMIT の後、Attachment の <code>after_create_commit</code> が ActiveStorage::AnalyzeJob を投入しました。このジョブが画像の幅と高さなどを調べて metadata に書き込みます。解析と、後で述べる事前のバリアントの生成は ActiveJob
            で行われるので、Sidekiq などのワーカーが動いていないと metadata は埋まりません。
          </p>
          <Figure n="19-5" title="ActiveStorage のテーブル" caption="activestorage 8.1.4.1 のマイグレーションと、デモで添付・バリアントの生成をしたときに作られた行をもとにした図。">
            <TablesFigure />
          </Figure>
          <p>
            一覧で添付の有無を調べると、関連の N+1 になります（<ChapterLink n={13} section="n-plus-one" />
            ）。3件と30件の記事で確かめると、そのままでは記事ごとに attachments を読み、<code>with_attached_cover</code> を付けると件数を変えても同じ回数でした。
          </p>
          <Code
            lang="text"
            code={`
Article.where(id: ids).each { |x| x.cover.attached? }
Article.where(id: ids).with_attached_cover.each { |x| x.cover.attached? }

3件: そのまま 4 queries / with_attached_cover 7 queries
30件: そのまま 31 queries / with_attached_cover 7 queries
`}
          />
        </>
      ),
    },
    {
      id: 'serving',
      title: 'ファイルの配信方式',
      body: (
        <>
          <p>
            ビューで <code>url_for(article.cover)</code> や <code>rails_blob_path</code> を使うと、ストレージの URL ではなく、Rails の URL が出力されます。デモで要求をたどりました。
          </p>
          <Code
            lang="text"
            code={`
rails_blob_path: /rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsiZGF0YSI6MSwicHVyIjoiYmxvYl9pZCJ9fQ==--7410df37…/cover.png
GET => 302 location=http://localhost/rails/active_storage/disk/eyJfcmFpbHMiOnsiZGF0YSI6eyJrZXkiOiJvdjhh…（"exp":"2026-11-11T10:19:49.276Z"）…/cover.png
GET location => 200 {"content-type" => "image/png", "content-disposition" => "inline; filename=\\"cover.png\\"; …"} 17983B
`}
          />
          <p>
            1つ目の URL の中の <code>eyJ…--7410…</code> は、blob の id に署名を付けたもの（<Term en="signed_id">署名付き ID</Term>）です。この URL は期限が無く、HTML に埋め込んでキャッシュできます。RedirectController
            はこれを、期限付きのストレージの URL に 302 でリダイレクトします
            <Ref n={4} />。期限は <code>service_urls_expire_in</code> の既定値の5分で、デモの URL の exp も要求の5分後でした。
          </p>
          <Code
            lang="ruby"
            title="activestorage/app/controllers/active_storage/blobs/redirect_controller.rb（25〜32行目）"
            href={`${GH}/activestorage/app/controllers/active_storage/blobs/redirect_controller.rb#L25-L32`}
            code={`
class ActiveStorage::Blobs::RedirectController < ActiveStorage::BaseController
  include ActiveStorage::SetBlob

  def show
    expires_in ActiveStorage.service_urls_expire_in
    redirect_to @blob.url(disposition: params[:disposition]), allow_other_host: true
  end
end
`}
          />
          <p>
            S3 を使う場合、2回目の要求はブラウザーから S3 に直接送られ、Puma を通りません。一方、<code>rails_storage_proxy_path</code> を使うプロキシ方式では、Rails がストレージからファイルを読んでブラウザーに返します（図
            19-6）。CDN を前に置いてキャッシュさせる用途ですが、CDN にキャッシュが無い間は、大きなファイルの転送の間 Puma のスレッドを使います。
          </p>
          <Figure n="19-6" title="リダイレクト方式とプロキシ方式" caption="Active Storage Overview と activestorage 8.1.4.1 の blobs/redirect_controller.rb・proxy_controller.rb をもとにした模式図。">
            <ModeFigure />
          </Figure>
          <Callout kind="warn" title="URL を知っていれば誰でも取得できる">
            <p>
              ActiveStorage のコントローラーは、既定ではログインなどの確認をしません。8.1.4.1 の redirect_controller.rb のコメントにも、URL を知っていれば、アプリケーションの他の部分が認証を求めていてもファイルにアクセスできると書かれています
              <Ref n={6} />。利用者ごとに見せるファイルを制限する場合は、自分で確認をするコントローラーを書き、その中からファイルを返します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'direct-upload',
      title: '直接アップロード',
      body: (
        <>
          <p>
            フォームで普通にファイルを送ると、ファイルの本体が Nginx と Puma を通ります。受信そのものは Nginx と Puma の reactor が受け持ちますが（<ChapterLink n={23} section="cluster" />
            ）、Rails がファイルを S3 などに転送する間は Puma のスレッドがふさがります。大きなファイルは Nginx の{' '}
            <code>client_max_body_size</code> にも当たります（<ChapterLink n={24} />
            ）。<code>form.file_field :cover, direct_upload: true</code> と ActiveStorage の JavaScript を使うと、ブラウザーがストレージに直接ファイルを送ります
            <Ref n={4} />（図 19-7）。最初の要求を、デモで JSON を送って確かめました。
          </p>
          <Code
            lang="text"
            code={`
POST /rails/active_storage/direct_uploads  {"blob":{"filename":"photo.png","byte_size":17983,"checksum":"It6Gda/qwhqLa3B3Vbi/Ow==","content_type":"image/png"}}
=> 200 keys=["id", "key", "filename", "content_type", "metadata", "service_name", "byte_size", "checksum", "created_at", "signed_id", "direct_upload"]
   direct_upload: {"url" => "http://localhost/rails/active_storage/disk/eyJfcmFpbHMiOnsiZGF0YSI6eyJrZXkiOiJneGRu…", "headers" => {…}}
`}
          />
          <p>
            Rails はこの時点で blob の行だけを作り、アップロード先の署名付き URL を返します。S3 などのサービスでは、ブラウザーから別のドメインに PUT するので、バケットに CORS（別のドメインのページからの要求を許可する設定）が必要です。ファイルがアップロードされた後、フォームはファイルの代わりに{' '}
            <code>signed_id</code> を送り、コントローラーの <code>attach</code> がその blob を記事に結び付けます。フォームが送信されなかった blob は、どのレコードにも付かないまま残ります。
          </p>
          <Figure n="19-7" title="直接アップロードの流れ" caption="Active Storage Overview（Direct Uploads）と、デモでの direct_uploads の応答をもとにした模式図。">
            <DirectFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'variants',
      title: 'バリアントの生成',
      body: (
        <>
          <p>
            <code>article.cover.variant(:thumb)</code> は、縮小などの変換をした画像（バリアント）を表します。ビューで URL を出力した時点では変換されず、ブラウザーがその URL
            を初めて要求したときに、Representations::RedirectController が変換してからリダイレクトします
            <Ref n={4} />。デモで同じバリアントの URL を2回要求しました（変換には ImageMagick を使用。下の補足を参照）。
          </p>
          <Code
            lang="text"
            code={`
1回目 GET => 302 (58ms)
  SQL SELECT active_storage_variant_records.* … WHERE blob_id = 1 AND variation_digest = …
  SQL INSERT INTO active_storage_variant_records (blob_id, variation_digest) VALUES (1, 'uyx6Kcit1Aa78Mrn7bVgZ7OZn0Y=')
  SQL INSERT INTO active_storage_blobs (key, filename, content_type, …) VALUES ('t240hzi51g85e5s0n29mirq…
  SQL INSERT INTO active_storage_attachments (name, record_type, record_id, blob_id, …) VALUES ('image', 'ActiveStorage::VariantRecord', 1, 2, …)
2回目 GET => 302 (8ms)
variant_records: 1 blobs: 2
`}
          />
          <p>
            1回目は、元の画像をストレージから読み、変換し、結果を新しい blob としてストレージに書き込み、variant_records に記録しました。2回目は記録を見つけてすぐにリダイレクトしています。デモは 800×600
            の小さな画像なので 58ms でしたが、大きな写真をクラウドのストレージから読んで変換すると、その間 Puma のスレッドがふさがります。一覧のページに新しい画像が多数並ぶと、変換の要求が同時に来ます。
          </p>
          <p>次の方法で、要求の処理の中での変換を避けられます。</p>
          <ul>
            <li>
              <code>attachable.variant :thumb, resize_to_limit: [100, 100], preprocessed: true</code> とすると、添付の COMMIT の後に ActiveJob（ActiveStorage::TransformJob）で変換する
            </li>
            <li>変換に libvips を使う。ガイドによると、ImageMagick より最大で10倍速く、メモリーの使用量は10分の1程度です</li>
          </ul>
          <p>
            また、ガイドは、利用者が入力した値を変換のパラメーターに渡すことは安全でないとしています。変換の内容は、上の <code>:thumb</code> のように名前を付けてモデルに定義しておきます。
          </p>
          <Callout kind="note" title="デモの変換処理">
            <p>
              Rails 7.0 以降の既定の変換処理は libvips（<code>:vips</code>）ですが、デモの Docker イメージ（ruby:4.0）には libvips が無く ImageMagick があったので、
              <code>config.active_storage.variant_processor = :mini_magick</code> にしました。本番環境のイメージにどちらのライブラリが入っているかで、この設定を決めます。
            </p>
          </Callout>
          <Callout kind="v72">
            <p>
              テーブル構造、配信方式、直接アップロード、バリアントの仕組みは Rails 7.2.4 でも同じです。8.1 の系列では、MiniMagick が起動する ImageMagick に、扱える形式を制限するセキュリティの設定を Rails
              が適用するようになりました
              <Ref n={7} />。ImageMagick で独自の形式を扱っている場合は、8.1 に上げた後に変換が失敗しないか確かめます。メールについては、ActionMailer の主な処理（MessageDelivery・MailDeliveryJob）は 7.2.4 と同じです。
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
          <li>アプリケーションは SMTP の手順（EHLO・MAIL FROM・RCPT TO・DATA・QUIT）で送信用の SMTP サーバーにメールを渡し、そのサーバーが宛先のドメインのメールサーバーへ届けます。</li>
          <li>メーラーはアクションでインスタンス変数を用意し、同じ名前のテキスト用と HTML 用のテンプレートから、2つの部分を持つ1通のメールを作ります。deliver_now はメールを作って送り終えるまで戻りません。</li>
          <li>メーラーはコントローラーと同じ AbstractController::Base を継承し、テンプレートの形式ごとのパートからマルチパートのメールを作ります。</li>
          <li>メーラーのメソッドは MessageDelivery を返すだけで、メッセージが必要になったときにアクションを実行します。</li>
          <li>deliver_later は、メーラー名・アクション名・params（GlobalID）を MailDeliveryJob に入れ、実行時に描画して送ります。キューは load_defaults 6.1 以降は ActiveJob の既定のキューです。</li>
          <li>file_field を含むフォームは multipart/form-data で送られ、ファイルは一時ファイルを持つ UploadedFile として届きます。一時ファイルは応答の後に消されるので、ディスクかクラウドのストレージに保存し、データベースに記録します。</li>
          <li>ActiveStorage は blobs・attachments・variant_records の3つのテーブルを使い、添付の COMMIT の後に AnalyzeJob で解析します。一覧では with_attached_* で N+1 を避けます。</li>
          <li>既定のリダイレクト方式では、期限の無い Rails の URL から、期限5分のストレージの URL にリダイレクトします。URL を知っていれば誰でも取得できます。</li>
          <li>直接アップロードでは、ファイルの本体が Rails を通らずにストレージに送られます。</li>
          <li>バリアントは最初の要求で変換され、その間 Puma のスレッドを使います。preprocessed: true で事前に変換できます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Action Mailer Basics', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/action_mailer_basics.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'MessageDelivery、deliver_now と deliver_later、メールのプレビュー（/rails/mailers）。' },
    { title: 'railties/lib/rails/application/configuration.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/application/configuration.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'load_defaults 6.1 で action_mailer.deliver_later_queue_name = nil にすること（既定値 :mailers は queued_delivery.rb）。' },
    { title: 'activestorage/lib/active_storage/attached/model.rb・app/models/active_storage/attachment.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activestorage/lib/active_storage/attached/model.rb#L128-L129`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'has_one_attached が定義する関連と、Attachment の after_create_commit（解析・事前の変換のジョブ）。' },
    { title: 'Active Storage Overview', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/active_storage_overview.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'リダイレクト方式（期限5分）とプロキシ方式、直接アップロードと CORS、バリアントの遅延生成、libvips と ImageMagick の比較、利用者の入力を変換に渡さないこと。' },
    { title: 'actionmailer/lib/action_mailer/message_delivery.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/actionmailer/lib/action_mailer/message_delivery.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '__getobj__ での遅延処理、processed?、deliver_later と enqueue_delivery。' },
    { title: 'activestorage/app/controllers/active_storage/blobs/redirect_controller.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activestorage/app/controllers/active_storage/blobs/redirect_controller.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'service_urls_expire_in（既定5分）でのリダイレクトと、URL を知っていれば認証なしでアクセスできるという注意書き。' },
    { title: 'activestorage CHANGELOG', publisher: 'rails/rails（GitHub）', url: `${GH}/activestorage/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'MiniMagick が起動する ImageMagick にセキュリティの設定を適用するようにした変更。' },
    { title: 'RFC 5321: Simple Mail Transfer Protocol', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5321', accessed: '2026-11-16', version: 'RFC 5321', note: 'EHLO・MAIL・RCPT・DATA・QUIT の手順と応答の番号（250・354・221）、宛先のドメインのメールサーバーを DNS で探すこと。Net::SMTP と検証用の SMTP サーバーで実測。' },
    { title: 'RFC 5322: Internet Message Format', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5322', accessed: '2026-11-16', version: 'RFC 5322', note: 'メールはヘッダーの行、空の行、本文の順に並ぶこと。' },
    { title: 'RFC 2045: MIME Part One', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc2045', accessed: '2026-11-16', version: 'RFC 2045', note: '本文を base64・quoted-printable の形式に変換して送ること（Content-Transfer-Encoding）。' },
    { title: 'RFC 2047: MIME Part Three（ヘッダーの英数字以外の文字）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc2047', accessed: '2026-11-16', version: 'RFC 2047', note: '件名などのヘッダーの文字を =?UTF-8?Q?…?= の形式で表すこと。' },
    { title: 'RFC 2046: MIME Part Two（multipart/alternative）', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc2046', accessed: '2026-11-16', version: 'RFC 2046', note: 'multipart/alternative の各部分は同じ内容の別の表し方で、受け取った側はどれか1つを表示すること。boundary による区切り。' },
    { title: 'Configuring Rails Applications（config.action_mailer.delivery_method）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/configuring.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'delivery_method の既定値が :smtp であること。デモの開発環境でも :smtp（localhost の 25 番ポート）だった。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/environments/test.rb.tt`, accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: 'rails new が作るテスト環境の設定で delivery_method = :test になること。' },
    { title: 'Action View Form Helpers（Uploading Files）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/form_helpers.html', accessed: '2026-11-16', version: 'Rails 8.1', note: 'ファイルを送るフォームは enctype を multipart/form-data にする必要があり、form_with の中で file_field を使うと自動で付くこと。デモで出力を確認。' },
    { title: 'RFC 7578: Returning Values from Forms: multipart/form-data', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc7578', accessed: '2026-11-16', version: 'RFC 7578', note: 'boundary で区切った部分ごとに、欄の名前・ファイル名・種類・中身を入れること。curl -F で送った要求を実測。' },
    { title: 'rack: lib/rack/tempfile_reaper.rb', publisher: 'rack/rack（GitHub）', url: 'https://github.com/rack/rack/blob/v3.2.8/lib/rack/tempfile_reaper.rb', accessed: '2026-11-16', version: 'Rack 3.2.8', note: 'multipart の解析で作った一時ファイルを、応答の本文を閉じたときに削除すること。デモのミドルウェアの一覧にも Rack::TempfileReaper がある。' },
    { title: 'ruby/net-smtp', publisher: 'ruby/net-smtp（GitHub）', url: 'https://github.com/ruby/net-smtp', accessed: '2026-11-16', version: 'net-smtp 0.5.1（Ruby 4.0.9 に同梱）', note: 'Net::SMTP.start と send_message。' },
  ],
}

export default withExplanations(ch19, explanation19)
