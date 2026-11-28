import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation15 } from '../explanations/database'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 25-1 アプリケーションと MySQL の接続 ---------- */
function ConnectionFigure() {
  const pairs = [
    { left: 'スレッド0', id: '260', y: 64 },
    { left: 'スレッド1', id: '259', y: 114 },
    { left: 'メインのスレッド', id: '262', y: 164 },
  ]
  return (
    <Svg
      id="25-1"
      w={760}
      h={320}
      label="rails runner のプロセスの3つのスレッドが、それぞれ別の接続（260・259・262）で MySQL のサーバーにつながっている。開発サーバーの Puma も接続 11 でつながっている。MySQL のサーバーは接続ごとに専用のスレッドで SQL を処理する。接続を作って閉じる処理は1回あたり約 4.19 ms、作った接続で SELECT 1 を送る処理は約 0.27 ms だった"
    >
      <rect x={20} y={20} width={240} height={190} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={32} y={40} bold fs={12.5}>
        rails runner のプロセス
      </T>
      <rect x={500} y={20} width={240} height={260} rx={8} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={512} y={40} bold fs={12.5}>
        MySQL のサーバー
      </T>
      {pairs.map((p) => (
        <g key={p.id}>
          <Box x={40} y={p.y} w={200} h={36} lines={p.left} fs={12} fill="box5" />
          <Arrow x1={242} y1={p.y + 18} x2={518} y2={p.y + 18} both />
          <T x={380} y={p.y + 8} anchor="middle" fs={11} tone="muted">
            {`接続 ${p.id}`}
          </T>
          <Box x={520} y={p.y} w={200} h={36} lines={`接続 ${p.id} を処理するスレッド`} fs={11.5} fill="box4" />
        </g>
      ))}
      <Box x={20} y={226} w={240} h={40} lines="Puma（開発サーバー）" fs={12} />
      <Arrow x1={262} y1={246} x2={518} y2={246} both />
      <T x={380} y={236} anchor="middle" fs={11} tone="muted">
        接続 11
      </T>
      <Box x={520} y={228} w={200} h={36} lines="接続 11 を処理するスレッド" fs={11.5} fill="box4" />
      <T x={20} y={300} fs={11.5} tone="muted">
        接続を作って SELECT 1 を送り閉じる：1回あたり 4.19 ms　作った接続で SELECT 1：1回あたり 0.27 ms
      </T>
    </Svg>
  )
}

/* ---------- 図 25-2 トランザクションのスタック ---------- */
function StackFigure() {
  return (
    <Svg
      id="25-2"
      w={760}
      h={290}
      label="接続ごとに TransactionManager があり、開いているトランザクションをスタックで管理する。一番下の RealTransaction は BEGIN と COMMIT に対応する。requires_new: true の内側のトランザクションは SavepointTransaction になり、SAVEPOINT と ROLLBACK TO SAVEPOINT に対応する。requires_new を指定しない内側の transaction は、新しいトランザクションを作らず、今のトランザクションにそのまま参加する。どちらのトランザクションも、最初の SQL を送るときまで BEGIN や SAVEPOINT を送らない"
    >
      <Box x={20} y={20} w={300} h={250} fill="bg" lines={[]} />
      <T x={32} y={40} bold fs={12.5}>
        接続の TransactionManager
      </T>
      <T x={32} y={60} fs={11.5} tone="muted">
        @stack（上が現在のトランザクション）
      </T>
      <Box x={50} y={80} w={240} h={56} lines={['SavepointTransaction', 'SAVEPOINT active_record_1']} mono fs={11.5} fill="box2" subTone="muted" />
      <Box x={50} y={146} w={240} h={56} lines={['RealTransaction', 'BEGIN … COMMIT']} mono fs={11.5} fill="box" subTone="muted" />
      <T x={50} y={232} fs={11.5}>
        SQL を送るまで BEGIN を遅らせる
      </T>
      <T x={50} y={252} fs={11.5} tone="muted">
        （空の transaction は何も送らない）
      </T>

      <Box x={380} y={20} w={360} h={110} fill="bg" lines={[]} />
      <T x={392} y={40} mono fs={11.5} bold>
        transaction do（外側）
      </T>
      <T x={406} y={64} mono fs={11.5}>
        transaction(requires_new: true) do
      </T>
      <T x={420} y={86} fs={11.5} tone="muted">
        → SavepointTransaction を積む
      </T>
      <T x={406} y={110} mono fs={11.5}>
        end
      </T>
      <Arrow x1={378} y1={86} x2={292} y2={108} dashed />

      <Box x={380} y={150} w={360} h={120} fill="bg" lines={[]} />
      <T x={392} y={170} mono fs={11.5} bold>
        transaction do（外側）
      </T>
      <T x={406} y={194} mono fs={11.5}>
        transaction do  # requires_new なし
      </T>
      <T x={420} y={216} fs={11.5} tone="muted">
        → 新しく積まずに外側に参加
      </T>
      <T x={420} y={238} fs={11.5} tone="danger">
        中で raise Rollback しても外側は COMMIT
      </T>
      <Arrow x1={378} y1={194} x2={292} y2={174} dashed />
    </Svg>
  )
}

/* ---------- 図 25-3 ロックの範囲と索引 ---------- */
function LockRangeFigure() {
  const row = (x: number, y: number, label: string, locked: boolean, hit = false) => (
    <Box x={x} y={y} w={140} h={26} lines={label} mono fs={11} rx={0} fill={hit ? 'box5' : locked ? 'box2' : 'bg'} />
  )
  return (
    <Svg
      id="25-3"
      w={760}
      h={290}
      label="T1 が FOR UPDATE で行をロックしている間に、T2 が別の行を UPDATE した結果。title には索引が無いので、WHERE title = 記事100 の FOR UPDATE は表全体を走査し、走査したすべての行をロックする。そのため T2 の id=9000 の UPDATE は、T1 が COMMIT するまで約0.8秒待たされた。author_id には索引があるので、WHERE author_id = 13 の FOR UPDATE は索引で読んだ行だけをロックし、別の著者の行を更新する T2 は待たずに終わった"
    >
      <T x={20} y={20} bold fs={12.5}>
        WHERE title = '記事100'（索引なし）
      </T>
      {row(20, 34, 'id=1', true)}
      {row(20, 60, 'id=2', true)}
      {row(20, 86, '…（全行）', true)}
      {row(20, 112, 'id=100 ← 一致', true, true)}
      {row(20, 138, 'id=9000', true)}
      <T x={176} y={60} fs={11.5}>
        走査した行をすべてロック
      </T>
      <T x={176} y={150} fs={11.5} tone="danger">
        T2 の id=9000 の UPDATE は
      </T>
      <T x={176} y={170} fs={11.5} tone="danger">
        T1 の COMMIT まで待った（0.20s → 1.02s）
      </T>

      <T x={420} y={20} bold fs={12.5}>
        WHERE author_id = 13（索引あり）
      </T>
      {row(420, 34, 'author_id=13 の行', true, true)}
      {row(420, 60, 'author_id=13 の行', true, true)}
      {row(420, 86, '…（475件）', true, true)}
      {row(420, 112, '他の著者の行', false)}
      {row(420, 138, 'id=1（他の著者）', false)}
      <T x={576} y={60} fs={11.5}>
        索引で読んだ範囲だけロック
      </T>
      <T x={576} y={150} fs={11.5} tone="acc">
        T2 の UPDATE は待たずに終了
      </T>
      <T x={576} y={170} fs={11.5} tone="acc">
        （0.20s → 0.22s）
      </T>
      <Box x={20} y={200} w={720} h={74} fill="bg" lines={[]} />
      <Box x={32} y={210} w={22} h={16} fill="box2" rx={2} lines={[]} />
      <T x={60} y={218} fs={11.5}>
        ロックされた行
      </T>
      <Box x={176} y={210} w={22} h={16} fill="box5" rx={2} lines={[]} />
      <T x={204} y={218} fs={11.5}>
        条件に一致し、ロックされた行
      </T>
      <Box x={410} y={210} w={22} h={16} fill="bg" rx={2} lines={[]} />
      <T x={438} y={218} fs={11.5}>
        ロックされていない行（模式図）
      </T>
      <T x={32} y={244} fs={11.5} tone="muted">
        MySQL のマニュアルによると、ロックは走査した索引のレコードに付き、適した索引が無く表全体を走査すると
      </T>
      <T x={32} y={262} fs={11.5} tone="muted">
        表のすべての行がロックされる
      </T>
    </Svg>
  )
}

/* ---------- 図 25-4 スレッドと接続プール ---------- */
function PoolFigure() {
  return (
    <Svg
      id="25-4"
      w={760}
      h={250}
      label="max_connections が 2 の接続プールに対して、3つのスレッドが同時に接続を求めた結果。T1 と T2 は接続を借りて SELECT SLEEP(2) を実行した。T3 は空いた接続を checkout_timeout の1秒待ったが得られず、ConnectionTimeoutError になった。プールの状態は size 2、busy 2、waiting 1 だった。T1 と T2 は2秒後に接続を返した"
    >
      <Box x={20} y={30} w={140} h={36} lines="T1" mono fs={12} />
      <Box x={20} y={86} w={140} h={36} lines="T2" mono fs={12} />
      <Box x={20} y={142} w={140} h={36} lines="T3" mono fs={12} fill="bg" />
      <Box x={300} y={20} w={200} h={170} fill="bg" lines={[]} />
      <T x={312} y={40} bold fs={12} mono>
        ConnectionPool
      </T>
      <T x={312} y={58} fs={11} tone="muted" mono>
        max_connections: 2
      </T>
      <Box x={320} y={70} w={160} h={34} lines="接続 1（busy）" fs={11.5} fill="box4" />
      <Box x={320} y={114} w={160} h={34} lines="接続 2（busy）" fs={11.5} fill="box4" />
      <T x={312} y={172} fs={11} tone="muted" mono>
        waiting: 1
      </T>
      <Arrow x1={160} y1={48} x2={318} y2={86} />
      <Arrow x1={160} y1={104} x2={318} y2={130} />
      <Arrow x1={160} y1={160} x2={298} y2={168} dashed />
      <T x={170} y={186} fs={11} tone="danger">
        1秒待って
      </T>
      <Box x={540} y={70} w={200} h={78} lines={['MySQL', '（接続ごとに1つの', 'サーバー側スレッド）']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={482} y1={87} x2={538} y2={100} />
      <Arrow x1={482} y1={131} x2={538} y2={118} />
      <Box x={20} y={204} w={720} h={36} lines="T3: ActiveRecord::ConnectionTimeoutError: could not obtain a connection from the pool within 1.000 seconds" mono fs={11} fill="bg" subTone="danger" />
    </Svg>
  )
}

/* ---------- transaction の分岐と例外の行き先（番号なし） ---------- */
function TransactionBranchFigure() {
  return (
    <Svg
      id="ch15-tx-branch"
      w={760}
      h={512}
      label="接続の transaction を呼ぶと、requires_new を指定しておらず、current_transaction.joinable? が true かを調べる。はいなら if の側に進み、今のトランザクションに参加して yield でブロックを実行するだけで、BEGIN・COMMIT・ROLLBACK を送らない。いいえ（最初の transaction や requires_new: true のとき）なら else の側に進み、within_new_transaction が begin_transaction で新しいトランザクションを始めてブロックを実行する。例外が出なければ commit_transaction で確定し、出れば rollback_transaction で取り消して同じ例外を投げ直す。一番外側のトランザクションなら COMMIT と ROLLBACK を送る。どちらの側でも、ブロックから出た例外はメソッド全体に付いた rescue ActiveRecord::Rollback に届く。ActiveRecord::Rollback はそこで消えて呼び出し元に伝わらず、ほかの例外は呼び出し元へ伝わる。if の側で投げた ActiveRecord::Rollback は、取り消しの SQL を送らずに消える"
    >
      <Box x={230} y={14} w={300} h={36} lines="接続の transaction を呼ぶ" fs={12.5} />
      <Arrow x1={380} y1={50} x2={380} y2={74} />
      <Box x={220} y={76} w={320} h={50} lines={['requires_new を指定していない', 'かつ current_transaction.joinable? が true']} fs={12} />
      <Arrow d="M 220 101 H 190 V 166" />
      <T x={198} y={138} fs={11.5}>
        はい
      </T>
      <Arrow d="M 540 101 H 570 V 166" />
      <T x={578} y={138} fs={11.5}>
        いいえ
      </T>

      <Box
        x={20}
        y={168}
        w={340}
        h={90}
        lines={['if の側：今のトランザクションに参加', 'トランザクションが開いていて requires_new なしのとき', 'yield でブロックを実行するだけ', 'BEGIN・COMMIT・ROLLBACK を送らない']}
        fs={12.5}
        fill="bg"
        subTone="muted"
      />
      <Box
        x={400}
        y={168}
        w={340}
        h={90}
        lines={['else の側：within_new_transaction', '最初の transaction や requires_new: true のとき', 'begin_transaction で新しいトランザクションを始める']}
        fs={12.5}
        fill="bg"
        subTone="muted"
      />

      <Arrow x1={570} y1={258} x2={570} y2={280} />
      <Box x={400} y={282} w={340} h={36} lines="ブロックを実行" fs={12.5} fill="bg" />
      <Arrow x1={482} y1={318} x2={482} y2={346} />
      <T x={490} y={332} fs={11.5}>
        例外なし
      </T>
      <Arrow x1={658} y1={318} x2={658} y2={346} />
      <T x={666} y={332} fs={11.5}>
        例外あり
      </T>
      <Box x={400} y={348} w={164} h={50} lines={['commit_transaction', '一番外側なら COMMIT']} fs={12.5} fill="bg" subTone="muted" />
      <Box x={576} y={348} w={164} h={50} lines={['rollback_transaction', '一番外側なら ROLLBACK']} fs={12.5} fill="bg" subTone="muted" />
      <Arrow x1={658} y1={398} x2={658} y2={446} />
      <T x={650} y={422} anchor="end" fs={11.5}>
        同じ例外を投げ直す
      </T>

      <Arrow x1={190} y1={258} x2={190} y2={446} accent />
      <T x={200} y={340} fs={11.5}>
        ブロックから例外が出たとき
      </T>
      <T x={200} y={360} fs={11.5} tone="danger">
        取り消しの SQL は送らない
      </T>

      <Box
        x={20}
        y={448}
        w={720}
        h={50}
        lines={['rescue ActiveRecord::Rollback（def に付いているので、メソッド全体が対象）', 'ActiveRecord::Rollback はここで消え、呼び出し元に伝わらない。ほかの例外は呼び出し元へ伝わる']}
        fs={12.5}
        fill="bg"
        subTone="muted"
      />
    </Svg>
  )
}

/* ---------- 借り方ごとの接続を持つ区間（番号なし） ---------- */
function LeaseFigure() {
  const bracket = (x1: number, x2: number, y: number) => <Arrow d={`M ${x1} ${y + 8} V ${y} H ${x2} V ${y + 8}`} plain />
  return (
    <Svg
      id="ch15-lease"
      w={760}
      h={350}
      label="1つのスレッドが接続を持っている区間を、借り方ごとに左から右への時間で示した図。まだ接続を借りていないときの with_connection は、ブロックの始めに checkout で借り、ブロックを抜けるときに release_connection で返す。ensure に書いてあるので、例外でも返却処理を通る。lease_connection は、借りていなければ checkout で借りて sticky を真にし、ブロックをまたいで接続を持ち続ける。通常のリクエストでは、トランザクションを終えていれば Executor が終了処理で返す。すでに接続を借りているときの with_connection は、lease_connection や外側の with_connection で借りた接続をそのままブロックに渡し、ブロックを抜けても返さない"
    >
      <T x={20} y={20} fs={11.5} tone="muted">
        借り方
      </T>
      <T x={240} y={20} fs={11.5} tone="muted">
        1つのスレッドの処理（左から右へ時間が進む）
      </T>

      <T x={20} y={74} mono bold fs={12}>
        with_connection
      </T>
      <T x={20} y={94} fs={11.5} tone="muted">
        まだ借りていないとき
      </T>
      <T x={460} y={44} anchor="middle" fs={11.5}>
        ブロック
      </T>
      {bracket(330, 590, 56)}
      <Arrow x1={240} y1={82} x2={330} y2={82} plain />
      <Arrow x1={590} y1={82} x2={740} y2={82} plain />
      <Box x={330} y={68} w={260} h={28} lines="接続を持つ" fs={11.5} fill="box4" />
      <T x={330} y={114} anchor="middle" mono fs={11.5}>
        checkout
      </T>
      <T x={590} y={114} anchor="middle" mono fs={11.5}>
        release_connection
      </T>
      <T x={590} y={132} anchor="middle" fs={11.5} tone="muted">
        ensure なので例外が起きても返す
      </T>

      <T x={20} y={184} mono bold fs={12}>
        lease_connection
      </T>
      <T x={20} y={204} mono fs={11.5} tone="muted">
        lease.sticky = true
      </T>
      <Arrow x1={240} y1={192} x2={330} y2={192} plain />
      <Arrow x1={620} y1={192} x2={740} y2={192} plain />
      <Box x={330} y={178} w={290} h={28} lines="ブロックをまたいで接続を持ち続ける" fs={11.5} fill="box4" />
      <T x={330} y={222} anchor="middle" fs={11.5}>
        借りていなければ checkout
      </T>
      <T x={620} y={222} anchor="middle" fs={11.5}>
        リクエストの終わりに Executor が返す
      </T>
      <T x={620} y={240} anchor="middle" fs={11.5} tone="muted">
        トランザクションを終えていれば
      </T>

      <T x={20} y={300} mono bold fs={12}>
        with_connection
      </T>
      <T x={20} y={320} fs={11.5} tone="muted">
        すでに借りているとき
      </T>
      <T x={500} y={266} anchor="middle" fs={11.5}>
        ブロック：持っている接続をそのまま渡す
      </T>
      {bracket(390, 610, 278)}
      <Box x={240} y={290} w={500} h={28} lines="前から持っている接続（lease_connection や外側の with_connection）" fs={11.5} fill="box4" />
      <T x={610} y={336} anchor="middle" fs={11.5}>
        ブロックを抜けても返さない
      </T>
    </Svg>
  )
}

const ch15: Chapter = {
  number: 15,
  part: 3,
  title: 'トランザクション・ロック・接続プール',
  summary:
    '2人が同じ行を更新するときは、どの接続で、いつ値を読んだかが結果を左右します。Rails が MySQL の接続を貸し出すところから、更新の衝突や接続の空き待ちが起きるところまでを追います。',
  goals: [
    '入れ子の transaction で、どの範囲の変更を取り消せるかを説明できる',
    '古い値に基づく更新を検出する方法と、行を先にロックして待たせる方法を選べる',
    '行のロックを待っている場合と、接続プールの空きを待っている場合を区別できる',
  ],
  prerequisites: [8, 14, 38],
  sections: [
    {
      id: 'db-connection',
      title: 'データベースとの接続',
      body: (
        <>
          <p>
            Rails のアプリケーションと MySQL は別々のプログラムです。デモでは、MySQL は Rails とは別のコンテナ（rbdemo-mysql）で動いています。SQL を送るには、まずアプリケーションが MySQL
            のサーバーにネットワークでつなぎ、ユーザー名とパスワードで認証を受けます。その後は、このつながりを通して SQL を送り、結果を受け取ります。このつながりを<Term en="connection">接続</Term>
            と呼びます。デモの Rails は mysql2 という gem（MySQL と通信するライブラリ）で接続を作ります。
          </p>
          <p>
            MySQL は接続ごとに番号を付け、接続ごとに専用のスレッドで認証と SQL の処理を行います
            <Ref n={9} />。スレッドは、1つのプロセス（実行中のプログラム）の中で同時に進められる処理の流れです（<ChapterLink n={23} section="thread" />
            ）。デモで、2つのスレッドがそれぞれ接続を借りて待っている間に、メインのスレッドから MySQL の PROCESSLIST（MySQL が受け付けている接続の一覧）を読みました。
            <code>CONNECTION_ID()</code> は今使っている接続の番号を返す MySQL の関数です。
          </p>
          <p>
            次のスクリプトは <code>Thread.new</code> で2つのスレッドを作ります。それぞれのスレッドは接続を借りて番号を表示し、借りたまま 1.5 秒待ちます。メインのスレッド（スクリプト自体を実行しているスレッド）は 0.5
            秒待ってから自分も接続を借りるので、その時点では3つのスレッドが同時に接続を使っています。<code>select_value</code> は、SQL の結果の1行目の1列目の値を返すメソッドです。
          </p>
          <Code
            lang="ruby"
            title="conn.rb（bin/rails runner で実行。PROCESSLIST を表示する部分は省略）"
            code={`
threads = 2.times.map do |i|
  Thread.new do
    ActiveRecord::Base.with_connection do |c|
      puts "スレッド#{i}: CONNECTION_ID() = #{c.select_value("SELECT CONNECTION_ID()")}"
      sleep 1.5
    end
  end
end
sleep 0.5
ActiveRecord::Base.with_connection do |c|
  puts "メインのスレッド: CONNECTION_ID() = #{c.select_value("SELECT CONNECTION_ID()")}"
  # information_schema.PROCESSLIST から、このコンテナ（172.29.0.4）からの接続を表示する
end
`}
          />
          <Code
            lang="text"
            title="実行結果（Rails 8.1.4.1・MySQL 8.4.13。最後の行の SQL は一部を省略）"
            code={`
スレッド1: CONNECTION_ID() = 259
スレッド0: CONNECTION_ID() = 260
メインのスレッド: CONNECTION_ID() = 262
MySQL の PROCESSLIST（このコンテナからの接続）:
  11 | 172.29.0.4:47660 | demo_development | Sleep | 
  259 | 172.29.0.4:56514 | demo_development | Sleep | 
  260 | 172.29.0.4:56516 | demo_development | Sleep | 
  262 | 172.29.0.4:56524 | demo_development | Query | SELECT ID, HOST, DB, COMMAND, INFO FROM information_schema.PROCESSLIST ...
`}
          />
          <p>
            PROCESSLIST の各行は左から接続の番号、接続元のアドレスとポート、データベース、状態、実行中の SQL です。2つのスレッドとメインのスレッドは、それぞれ別の接続（259・260・262）を使っていました。11 は同じコンテナで動いている開発サーバー（Puma）の接続です。COMMAND が Sleep
            の接続は、つながったまま次の SQL を待っています（図 25-1）。この例では、各スレッドは <code>with_connection</code> のブロックに入るときに接続を借り、抜けるときに返します。すでに接続を持つ場合の動作は「接続プール」の節で扱います。
          </p>
          <p>
            本番で SQL の応答が返ってこないときも、この一覧の COMMAND と実行中の SQL の列を見れば、どの接続が何を実行しているかを確かめられます。
          </p>
          <p>
            接続を作るには時間がかかります。mysql2 で、接続を作って <code>SELECT 1</code> を送ってから閉じる処理と、作っておいた接続で <code>SELECT 1</code> を送る処理を、200
            回ずつ実行して比べました。
          </p>
          <Code
            lang="text"
            title="conntime.rb の実行結果（デモの Rails のコンテナから MySQL のコンテナへ接続）"
            code={`
接続を作って SELECT 1 を送り、閉じる: 1回あたり 4.19 ms
作った接続で SELECT 1 を送る:         1回あたり 0.27 ms
`}
          />
          <p>
            接続を作る処理は、SQL を1つ送る処理の約15倍の時間がかかりました。そのため Rails は作った接続を閉じずに残しておき、後の SQL でも使います。この仕組みが接続プールです。
          </p>
          <p>
            接続には、その接続だけの状態があります。トランザクション（複数の変更をまとめて確定し、まとめて取り消す仕組み。<ChapterLink n={38} section="transaction" />
            ）も接続ごとにあり、ある接続で始めたトランザクションに、別の接続から送った SQL は入りません。上の例のように、Rails
            では同時に動くスレッドがそれぞれ別の接続を使うので、あるスレッドのトランザクションに、別のスレッドの SQL が入ることはありません。
          </p>
          <Figure n="25-1" title="アプリケーションと MySQL の接続" caption="上の2つの実行結果をもとにした図。">
            <ConnectionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'transaction',
      title: 'トランザクションの開始と終了',
      body: (
        <>
          <p>
            この節では、Rails のソースで2つのことを確かめます。1つは、transaction のブロックの中でもう一度 transaction を呼んだときに何が起きるかです。もう1つは、BEGIN と COMMIT をいつ送るかです。
          </p>
          <p>
            <code>ActiveRecord::Base.transaction</code> は、接続の <code>transaction</code> を呼びます。次の引用は、そのメソッドの引数と最後の分岐です。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb（355〜382行目、一部省略）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb#L355-L382`}
            code={`
      def transaction(requires_new: nil, isolation: nil, joinable: true, &block)
        # （テストを囲むトランザクションの中で isolation を扱う分岐は省略）

        if !requires_new && current_transaction.joinable?
          if isolation && current_transaction.isolation != isolation
            raise ActiveRecord::TransactionIsolationError, "cannot set isolation when joining a transaction"
          end
          yield current_transaction.user_transaction
        else
          within_new_transaction(isolation: isolation, joinable: joinable, &block)
        end
      rescue ActiveRecord::Rollback
        # rollbacks are silently swallowed
      end
`}
          />
          <p>
            すでにトランザクションが開いていて、<code>requires_new</code> を指定していなければ、新しいトランザクションを作らずに今のトランザクションに参加します。そうでなければ{' '}
            <code>within_new_transaction</code> で新しいトランザクションを始めます。ブロックの中で <code>ActiveRecord::Rollback</code> が投げられると、ここで捕捉され、呼び出し元には伝わりません
            <Ref n={1} />。引用の行とは次のように対応します。
          </p>
          <ul>
            <li>
              <code>current_transaction</code> は、その接続で今開いているトランザクションのうち、一番内側のものを返します。何も開いていないときは、<code>joinable?</code> が false を返す NullTransaction
              というオブジェクトを返します。そのため、最初の transaction は else の側に進みます。
            </li>
            <li>
              <code>joinable?</code> は、そのトランザクションに参加できるかを返します。通常の transaction で始めたものは true です。トランザクションが開いていて <code>requires_new</code> を渡していなければ if
              の側に進み、<code>yield</code> でブロックを実行するだけで終わります。BEGIN も COMMIT も ROLLBACK も送りません。「参加する」とは、この動作のことです。
            </li>
            <li>
              最後の <code>rescue ActiveRecord::Rollback</code> は <code>def</code> に直接付いているので、メソッド全体が対象です。if の側と else の側のどちらのブロックで例外が投げられても、ここで捕捉します。rescue
              の中にはコメントしか無いので、例外はここで消えます。
            </li>
          </ul>
          <p>
            else の側の <code>within_new_transaction</code>（transaction.rb）は、次の順に進みます。
          </p>
          <ol>
            <li>
              <code>begin_transaction</code> で、新しいトランザクションを始めます（下の引用）。
            </li>
            <li>ブロックを実行します。</li>
            <li>
              ブロックから例外が出たら、<code>rollback_transaction</code> でそのトランザクションを取り消し、同じ例外をもう一度投げます。例外が出なければ <code>commit_transaction</code>{' '}
              で確定します。一番外側のトランザクションなら、送る SQL は ROLLBACK と COMMIT です。
            </li>
          </ol>
          <p>
            取り消しの SQL を送るのは、else の側を通ったときだけです。if の側で参加したブロックの中で <code>ActiveRecord::Rollback</code>{' '}
            を投げると、取り消しの SQL は送られず、例外だけが消えます。この違いは「入れ子のトランザクション」の節で実行して確かめます。
          </p>
          <p>
            次の図は、上の引用の分岐を上から順にたどれるように並べたものです。中央の条件で左の if の側と右の else の側に分かれます。どちらの側でも、ブロックから出た例外は一番下の rescue に届きます。
          </p>
          <Figure
            title="transaction の分岐と例外の行き先"
            caption="Rails 8.1.4.1 の database_statements.rb と transaction.rb を読んでまとめた模式図。青の太い矢印は、参加したブロックで投げた ActiveRecord::Rollback が、取り消しの SQL を送らずに rescue で消える経路を表す。if の側で例外が出ずにブロックが終わる経路と、BEGIN・SAVEPOINT を送る時点（図 25-2）は省略した。"
          >
            <TransactionBranchFigure />
          </Figure>
          <p>
            トランザクションは、接続ごとの <code>TransactionManager</code> がスタックで管理しています。<code>begin_transaction</code> は、スタックが空なら <code>RealTransaction</code>（BEGIN と
            COMMIT）、すでに積まれていれば <code>SavepointTransaction</code>（SAVEPOINT）を積みます。SAVEPOINT は、トランザクションの途中に、そこまで戻れる位置を記録する SQL です。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/transaction.rb（527〜566行目、一部省略）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb#L527-L566`}
            code={`
      def begin_transaction(isolation: nil, joinable: true, _lazy: true)
        @connection.lock.synchronize do
          run_commit_callbacks = !current_transaction.joinable?
          transaction =
            if @stack.empty?
              RealTransaction.new(
                @connection,
                isolation: isolation,
                joinable: joinable,
                run_commit_callbacks: run_commit_callbacks
              )
            # （RestartParentTransaction の分岐は省略）
            else
              SavepointTransaction.new(
                @connection,
                "active_record_#{@stack.size}",
                current_transaction,
                isolation: isolation,
                joinable: joinable,
                run_commit_callbacks: run_commit_callbacks
              )
            end

          unless transaction.materialized?
            if @connection.supports_lazy_transactions? && lazy_transactions_enabled? && _lazy
              @has_unmaterialized_transactions = true
            else
              transaction.materialize!
            end
          end
          @stack.push(transaction)
          transaction
        end
      end
`}
          />
          <ul>
            <li>
              <code>@connection.lock.synchronize do … end</code> は、ブロックを同時に1つのスレッドだけが実行するようにします。1つの接続のスタックを、複数のスレッドが同時に書き換えないためです。
            </li>
            <li>
              <code>@stack</code> は、開いているトランザクションを順に入れた配列です。空なら RealTransaction を、そうでなければ SavepointTransaction を作ります。SavepointTransaction の2番目の引数{' '}
              <code>{'"active_record_#{@stack.size}"'}</code> は SAVEPOINT の名前で、すでに1つ積まれていれば active_record_1 になります。
            </li>
            <li>
              <code>materialize!</code> は、BEGIN（SavepointTransaction では SAVEPOINT）を MySQL へ送るメソッドです。<code>materialized?</code> は、送った後かどうかを返します。mysql2 の接続では{' '}
              <code>unless</code> の中の if の側に進み、<code>@has_unmaterialized_transactions = true</code> で「まだ送っていないトランザクションがある」と記録するだけで、何も送りません。
            </li>
            <li>
              最後に <code>@stack.push</code> でスタックに積みます。<code>isolation</code>・<code>joinable</code>・<code>run_commit_callbacks</code> は、作るオブジェクトにそのまま渡している値です。
            </li>
          </ul>
          <p>
            トランザクションのオブジェクトを作っても、すぐには BEGIN を送りません（<code>materialize!</code> を遅らせる）。最初の SQL を送るときに、まだ送っていない BEGIN や SAVEPOINT
            を先に送ります
            <Ref n={2} />。デモで中身の無い <code>ActiveRecord::Base.transaction {'{ }'}</code> を実行すると、SQL は1つも送られませんでした。<ChapterLink n={14} />で、BEGIN が INSERT
            の直前に送られていたのはこのためです。
          </p>
          <p>
            遅らせると、SQL を1つも送らずに終わるブロックでは、BEGIN と COMMIT の2回の送信が無くなります。ログを読むときは、BEGIN の行が <code>transaction do</code>{' '}
            の位置ではなく、ブロックの中の最初の SQL の直前に出ることに注意します。ブロックの先頭に時間のかかる Ruby の処理があっても、その間はまだトランザクションが始まっていません。
          </p>
          <p>
            図 25-2 は、左が接続のスタック、右上が <code>requires_new: true</code> を付けた入れ子、右下が付けない入れ子です。破線の矢印は、内側の transaction の SQL がスタックのどのトランザクションで実行されるかを指しています。
          </p>
          <Figure n="25-2" title="トランザクションのスタック" caption="Rails 8.1.4.1 の transaction.rb・database_statements.rb を読んでまとめた模式図。">
            <StackFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'nested',
      title: '入れ子のトランザクション',
      body: (
        <>
          <p>内側の transaction で <code>ActiveRecord::Rollback</code> を投げたとき、<code>requires_new</code> の有無で結果が変わります。</p>
          <Code
            lang="text"
            code={`
--- requires_new なし
ActiveRecord::Base.transaction do
  Article.find(1).update!(views_count: 111)
  ActiveRecord::Base.transaction { Article.find(2).update!(views_count: 222); raise ActiveRecord::Rollback }
end
  BEGIN
  SELECT ... WHERE id = 1 LIMIT 1
  UPDATE ... views_count = 111 ...
  SELECT ... WHERE id = 2 LIMIT 1
  UPDATE ... views_count = 222 ...
  COMMIT
結果: [[1, 111], [2, 222]]   # 内側も確定した

--- requires_new: true
  BEGIN
  SELECT ... WHERE id = 1 LIMIT 1
  UPDATE ... views_count = 333 ...
  SAVEPOINT active_record_1
  SELECT ... WHERE id = 2 LIMIT 1
  UPDATE ... views_count = 444 ...
  ROLLBACK TO SAVEPOINT active_record_1
  COMMIT
結果: [[1, 333], [2, 222]]   # 内側だけ取り消された
`}
          />
          <p>
            <code>requires_new</code> を付けない内側の transaction は外側に参加しているだけなので、内側の <code>ActiveRecord::Rollback</code>{' '}
            は内側で捕捉され、何も取り消されずに外側が COMMIT しました。内側だけを取り消したい場合は <code>requires_new: true</code> を付け、SAVEPOINT を使います。
            <code>ActiveRecord::Rollback</code> 以外の例外はブロックの外まで伝わり、外側のトランザクション全体がロールバックされます
            <Ref n={1} />。
          </p>
        </>
      ),
    },
    {
      id: 'isolation',
      title: '分離レベルの指定',
      body: (
        <>
          <p>
            Rails では <code>transaction(isolation: :read_committed)</code> のように、トランザクションごとに分離レベルを指定できます。指定すると、RealTransaction の <code>materialize!</code>{' '}
            が <code>begin_isolated_db_transaction</code> を呼び、BEGIN の前に <code>SET TRANSACTION ISOLATION LEVEL</code> を送ります
            <Ref n={2} />。この SQL は、次に始めるトランザクションの分離レベルを決めます（<ChapterLink n={38} section="isolation" />
            ）。
          </p>
          <p>
            分離レベルは、入れ子のトランザクション（SAVEPOINT）や、すでに開いているトランザクションに参加するときには指定できません
            <Ref n={2} />。「トランザクションの開始と終了」の節で見た database_statements.rb は、参加するときに今のトランザクションと違う分離レベルが指定されていると{' '}
            <code>TransactionIsolationError</code> を投げます。参加するときは新しいトランザクションを始めないので、SET TRANSACTION を送る時点がありません。SAVEPOINT
            も外側のトランザクションの途中に設ける位置なので、内側の範囲だけを別の分離レベルにはできません。MySQL でも、SET TRANSACTION はトランザクションの途中では実行できません。
          </p>
        </>
      ),
    },
    {
      id: 'optimistic',
      title: '楽観的ロック',
      body: (
        <>
          <p>
            <Term en="optimistic locking">楽観的ロック</Term>は、更新が衝突することはまれだと考え、衝突したときだけ検出する方法です。テーブルに <code>lock_version</code>{' '}
            という整数の列があると、ActiveRecord は自動で有効にします。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/locking/optimistic.rb（92〜122行目、一部省略）"
            href={`${GH}/activerecord/lib/active_record/locking/optimistic.rb#L92-L122`}
            code={`
        def _update_row(attribute_names, attempted_action = "update")
          return super unless locking_enabled?

          begin
            locking_column = self.class.locking_column
            lock_attribute_was = @attributes[locking_column]

            update_constraints = _query_constraints_hash

            attribute_names = attribute_names.dup if attribute_names.frozen?
            attribute_names << locking_column

            # （lock_version が nil の場合のエラーは省略）

            self[locking_column] += 1

            affected_rows = self.class._update_record(
              attributes_with_values(attribute_names),
              update_constraints
            )

            if affected_rows != 1
              raise ActiveRecord::StaleObjectError.new(self, attempted_action)
            end

            affected_rows
`}
          />
          <p>
            UPDATE の WHERE に読み込んだときの <code>lock_version</code> を入れ、値を1増やします。他の誰かが先に更新していれば WHERE に一致する行が無く、変更された行数が 0
            になるので <code>StaleObjectError</code> を投げます
            <Ref n={3} />。同じ記事を2つのオブジェクトに読み込んで、順に更新しました。
          </p>
          <Code
            lang="text"
            code={`
a1 = Article.find(4); a2 = Article.find(4)       # どちらも lock_version = 2
a1.update!(title: "A さんの変更")
  BEGIN
  UPDATE ... SET title = 'A さんの変更', ..., lock_version = 3 WHERE id = 4 AND lock_version = 2
  COMMIT
a2.update!(title: "B さんの変更")
  BEGIN
  UPDATE ... SET title = 'B さんの変更', ..., lock_version = 3 WHERE id = 4 AND lock_version = 2
  ROLLBACK
  => ActiveRecord::StaleObjectError: Attempted to update a stale object: Article.
`}
          />
          <p>
            フォームを開いてから保存するまでの間に他の人が更新した場合を検出できます。フォームに <code>lock_version</code> を隠し項目（画面には表示せずに、フォームと一緒に送る値）として入れて送り返すと、画面を開いた時点の値で比べられます。
            <code>StaleObjectError</code> を rescue して、最新の内容を読み直すよう利用者に伝えるのが一般的です。
          </p>
        </>
      ),
    },
    {
      id: 'pessimistic',
      title: '悲観的ロック',
      body: (
        <>
          <p>
            <Term en="pessimistic locking">悲観的ロック</Term>は、読む時点で行をロックし、他のトランザクションの更新を待たせる方法です。<code>Article.lock.find(5)</code> は{' '}
            <code>SELECT ... FOR UPDATE</code> を実行します。MySQL のマニュアルによると、FOR UPDATE はその行に UPDATE と同じロックを掛け、ロックはトランザクションの COMMIT
            かロールバックで解放されます
            <Ref n={4} />。
          </p>
          <p>
            lock と with_lock で送金の更新の消失を防ぐ例は <ChapterLink n={38} section="lost-update-fix" /> で確かめました。ここでは with_lock の実装と、ロックを待たない指定を見ます。レコードを読み込んだ後でロックするには{' '}
            <code>with_lock</code> を使います。
          </p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/locking/pessimistic.rb（97〜104行目）"
            href={`${GH}/activerecord/lib/active_record/locking/pessimistic.rb#L97-L104`}
            code={`
      def with_lock(*args)
        transaction_opts = args.extract_options!
        lock = args.present? ? args.first : true
        transaction(**transaction_opts) do
          lock!(lock)
          yield
        end
      end
`}
          />
          <p>
            <code>with_lock</code> はトランザクションを開始し、<code>lock!</code> で <code>reload(lock: true)</code>、つまり FOR UPDATE 付きで読み直してからブロックを実行します（同じファイルの
            69〜88 行目）。読み直すので、ブロックの中では最新の値を使えます。保存していない変更があるレコードで <code>lock!</code> を呼ぶと例外になります
            <Ref n={5} />。
          </p>
          <p>
            <code>lock</code> には SQL の文字列も渡せます。MySQL 8.4 の <code>FOR UPDATE NOWAIT</code> はロックを待たずにすぐ失敗し、<code>FOR UPDATE SKIP LOCKED</code>{' '}
            はロックされている行を結果から除きます
            <Ref n={4} />。T1 が id=6 をロックしている間に、T2 で試した結果は次のとおりです。
          </p>
          <Code
            lang="text"
            code={`
Article.lock("FOR UPDATE NOWAIT").find(6)
  => ActiveRecord::StatementInvalid: Mysql2::Error: Statement aborted because lock(s) could not be
     acquired immediately and NOWAIT is set
Article.where(id: 6..8).lock("FOR UPDATE SKIP LOCKED").pluck(:id)
  => [7, 8]
`}
          />
          <p>
            SKIP LOCKED は、複数のワーカー（処理待ちの仕事を取り出して実行するプロセスやスレッド）が処理待ちの行を重ならないように取り出す処理に使えます。
          </p>
        </>
      ),
    },
    {
      id: 'lock-index',
      title: 'ロックの範囲と索引',
      body: (
        <>
          <p>
            InnoDB の FOR UPDATE や UPDATE は、条件に一致した行だけでなく、検索の途中で走査した索引のレコードにロックを掛けます。適した索引が無く表全体を走査すると、表のすべての行がロックされます
            <Ref n={6} />。T1 が FOR UPDATE を実行している間に、T2 が別の行を UPDATE して確かめました。
          </p>
          <Code
            lang="text"
            code={`
--- 索引の無い列（title）で FOR UPDATE
 0.01s T1  Article.where(title: "記事100").lock.to_a   （1件）
 0.20s T2  別の行 id=9000 を UPDATE
 1.01s T1  COMMIT
 1.02s T2  UPDATE 完了                                  （T1 の COMMIT まで待った）
--- 索引のある列（author_id）で FOR UPDATE
 0.01s T1  Article.where(author_id: 13).lock.to_a      （475件）
 0.20s T2  別の著者の行 id=1 を UPDATE
 0.22s T2  UPDATE 完了                                  （待たなかった）
 1.01s T1  COMMIT
`}
          />
          <Figure n="25-3" title="ロックの範囲と索引" caption="上の実行結果を図にしたもの。ロックの種類（レコードロック、ギャップロック、ネクストキーロック）の区別は省略している。">
            <LockRangeFigure />
          </Figure>
          <p>
            一致したのは1件なのに、索引が無いために全行がロックされ、無関係な行の UPDATE が待たされました。悲観的ロックや、条件付きの <code>update_all</code>・<code>delete_all</code>{' '}
            を使う問い合わせは、EXPLAIN で索引が使われることを確かめておきます（<ChapterLink n={37} section="explain-rails" />
            ）。
          </p>
        </>
      ),
    },
    {
      id: 'pool',
      title: '接続プール',
      body: (
        <>
          <p>
            ActiveRecord の<Term en="connection pool">接続プール</Term>が貸し出せる本数は、データベースへの接続設定を書く <code>config/database.yml</code> で決めます。Rails 8.1 の新規アプリケーションには次の行があります。
          </p>
          <Code
            lang="yaml"
            title="config/database.yml（rails new -d mysql で生成）"
            code={`
default: &default
  adapter: mysql2
  encoding: utf8mb4
  max_connections: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
`}
          />
          <p>
            <code>max_connections</code> は、1つのプールで開く接続の上限です。接続を借りるときに空きが無ければ <code>checkout_timeout</code>（既定 5 秒）まで待ち、それでも得られなければ{' '}
            <code>ActiveRecord::ConnectionTimeoutError</code> になります。使われていない接続は <code>idle_timeout</code>（既定 300 秒）を過ぎると閉じられます
            <Ref n={7} />。デモでは <code>max_connections=2&amp;checkout_timeout=1</code> を DATABASE_URL に付け、3つのスレッドから同時に接続を借りて 2 秒の SELECT を実行しました。
          </p>
          <Code
            lang="text"
            code={`
 0.00s T1  接続を取得
 0.05s T2  接続を取得
pool.stat => {size: 2, connections: 2, busy: 2, dead: 0, idle: 0, waiting: 1, checkout_timeout: 1.0}
 1.10s T3  ActiveRecord::ConnectionTimeoutError: could not obtain a connection from the pool within
           1.000 seconds (waited 1.000 seconds); all pooled connections were in use
 2.02s T1  接続を返す
 2.06s T2  接続を返す
`}
          />
          <p>
            <code>pool.stat</code> を読むと、開いた2本がどちらも使用中（<code>busy: 2</code>）で、空きは 0、待っているスレッドが1つ（<code>waiting: 1</code>）です。
            待っていた T3 は開始から 1.10 秒の時点で例外になりました。最初の返却は 2.02 秒です。T3 は接続を借りられず、自分の SELECT を MySQL に送るところまで進めませんでした。
          </p>
          <Figure n="25-4" title="スレッドと接続プール" caption="上の実行結果を図にしたもの。">
            <PoolFigure />
          </Figure>
          <p>接続の借り方には2つあります。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb（357〜362行目、452〜471行目）"
            href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L452-L471`}
            code={`
      def lease_connection
        lease = connection_lease
        lease.connection ||= checkout
        lease.sticky = true
        lease.connection
      end

      def with_connection(prevent_permanent_checkout: false)
        lease = connection_lease
        sticky_was = lease.sticky
        lease.sticky = false if prevent_permanent_checkout

        if lease.connection
          begin
            yield lease.connection
          ensure
            lease.sticky = sticky_was if prevent_permanent_checkout
          end
        else
          begin
            yield lease.connection = checkout
          ensure
            lease.sticky = sticky_was if prevent_permanent_checkout
            release_connection(lease) unless lease.sticky
          end
        end
      end
`}
          />
          <p>
            <code>lease.connection</code> には、実行中のスレッドやファイバーが借りた接続が入ります。<code>with_connection</code> の <code>if lease.connection</code> は、すでに借りている接続をそのままブロックに渡す経路です。
            空なら <code>else</code> で新たに借り、通常はブロックを抜けるときに <code>release_connection</code> で返します。<code>ensure</code> に書いてあるので、ブロックで例外が起きても返却処理を通ります。
          </p>
          <p>
            <code>lease_connection</code> は <code>sticky</code> を真にして、ブロックをまたいで使うために接続を保持します。通常のリクエストでトランザクションを終えていれば、借りたままの接続は<ChapterLink n={8} />の Executor が終了処理で返します。
            Rails 7.2 以降は <code>ActiveRecord::Base.connection</code> の代わりに、この2つのどちらかを使うよう案内されています。<Ref n={7} />
          </p>
          <p>
            次の図は、1つのスレッドが接続を持っている区間を、借り方ごとに緑の帯で示したものです。上から、まだ接続を借りていないときの <code>with_connection</code>、<code>lease_connection</code>、すでに接続を借りているときの{' '}
            <code>with_connection</code> の順に並べています。帯の右端が接続を返す時点で、3段目の帯はブロックを抜けた後も続きます。
          </p>
          <Figure
            title="借り方ごとの接続を持つ区間"
            caption="上の引用と本文をもとにした模式図。緑の帯は接続を持っている区間、帯の上の線は with_connection のブロックの範囲を表す。prevent_permanent_checkout を指定したときの sticky の扱いは省略した。"
          >
            <LeaseFigure />
          </Figure>
          <p>
            プールの上限を決めるには、同じプロセスで同時に何本の接続が必要になるかを考えます。たとえば Puma の3スレッドが同じ DB を同時に使うなら、上限2本では上の T3 のように待つスレッドが出ます。
            ワーカーを増やすとワーカーごとにプールができます。各プールの上限と、MySQL サーバー全体が受け付ける上限（デモでは 151）を合わせて見積もる例は<ChapterLink n={23} section="sizing" />にあります。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 が生成する database.yml では、同じ設定を <code>pool:</code> と書きます。8.1 では <code>pool</code> が <code>max_connections</code> に改名され、
              <code>min_connections</code>・<code>keepalive</code>・<code>max_age</code> が追加されました
              <Ref n={8} />。8.1 でも <code>pool:</code> は読まれます（<code>hash_config.rb</code> の <code>max_connections</code> が <code>:pool</code> を代わりに読む）。
              <code>with_connection</code> と <code>lease_connection</code> は 7.2 にもあります。
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
          <li>アプリケーションは MySQL に接続してから SQL を送ります。MySQL は接続ごとに専用のスレッドで処理し、接続を作るには SQL を1つ送るより長い時間がかかるので、Rails は接続を使い回します。</li>
          <li>トランザクションは接続ごとの TransactionManager がスタックで管理し、BEGIN や SAVEPOINT は最初の SQL を送るときまで遅らせます。</li>
          <li>requires_new なしの内側の transaction は外側に参加するだけで、内側の ActiveRecord::Rollback では何も取り消されません。</li>
          <li>分離レベルを指定すると、Rails は BEGIN の前に SET TRANSACTION ISOLATION LEVEL を送ります。入れ子のトランザクションや、開いているトランザクションに参加するときには指定できません。</li>
          <li>楽観的ロックは lock_version を WHERE に入れて衝突を StaleObjectError で検出し、悲観的ロックは FOR UPDATE で他のトランザクションを待たせます。with_lock は FOR UPDATE で読み直してからブロックを実行します。</li>
          <li>ロックは走査した索引のレコードに掛かるので、索引が無いと無関係な行の更新まで待たされます。</li>
          <li>接続プールに空きが無いスレッドは、SQL を送る前に checkout_timeout まで待ちます。各プロセスが同時に使う接続数と、MySQL 側の上限を合わせて見積もります。</li>
          <li>BEGIN・COMMIT・ROLLBACK の動作、更新の消失、行のロックの待ち、分離レベルごとの読み取りの違い、ロック待ちのタイムアウトとデッドロックは、<ChapterLink n={38} />で扱いました。</li>
          <li>DBの列や索引を変更するときのロックとデプロイの順序は、<ChapterLink n={27} />で扱います。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/database_statements.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'transaction の requires_new と参加、ActiveRecord::Rollback を捕捉して呼び出し元に伝えない処理、分離レベルの指定の条件。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/transaction.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/transaction.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'TransactionManager の begin_transaction、RealTransaction と SavepointTransaction の materialize!、遅延した BEGIN。' },
    { title: 'activerecord/lib/active_record/locking/optimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/optimistic.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'lock_version を WHERE に入れて1増やし、変更行数が1でなければ StaleObjectError にする _update_row。' },
    { title: 'Locking Reads', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'FOR UPDATE・FOR SHARE の動作、NOWAIT と SKIP LOCKED、ロックが COMMIT かロールバックで解放されること。' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'lock! と with_lock の実装。' },
    { title: 'Locks Set by Different SQL Statements in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-locks-set.html', accessed: '2026-11-11', version: 'MySQL 8.4', note: 'ロックが走査した索引のレコードに掛かり、適した索引が無いと表のすべての行がロックされること。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'max_connections・checkout_timeout・idle_timeout などの設定、lease_connection と with_connection、checkout。既定値は database_configurations/hash_config.rb。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '8.1 で keepalive・max_age・min_connections が追加され、pool が max_connections に改名されたこと。' },
    { title: 'Connection Interfaces（Client Connection Thread Management）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/connection-interfaces.html', accessed: '2026-11-16', version: 'MySQL 8.4', note: '接続ごとに専用のスレッドを割り当て、そのスレッドが認証と要求の処理を行うこと。実行例は MySQL 8.4.13 で実測。' },
  ],
}

export default withExplanations(ch15, explanation15)
