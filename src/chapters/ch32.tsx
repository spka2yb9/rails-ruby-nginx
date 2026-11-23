import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { DeploymentComparisonFigure } from '../visuals/deployment-figures'
import { chapterNumber } from '../content/label'

// 図番号は表示上の章番号から作る（章の並びが変わっても本文の図番号と一致させる）
const F = chapterNumber(32)

const CAP = 'https://github.com/capistrano/capistrano/blob/v3.20.1'
const SSHKIT = 'https://github.com/capistrano/sshkit/blob/v1.25.1'
const BUNDLER = 'https://github.com/capistrano/bundler/blob/v2.2.0'
const CRAILS = 'https://github.com/capistrano/rails/blob/v1.7.0'
const RBENV = 'https://github.com/capistrano/rbenv/blob/v2.2.0'
const CPUMA = 'https://github.com/seuros/capistrano-puma/blob/v8.1.0'
const CSIDEKIQ = 'https://github.com/seuros/capistrano-sidekiq/blob/v3.2.0'
const RAILS = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 30-1 配備先のディレクトリ ---------- */
function ReleaseLayoutFigure() {
  const shared = ['config/master.key', 'log/', 'storage/', 'tmp/pids/ など', 'public/assets/', 'public/system/']
  return (
    <Svg
      id={`${F}-1`}
      w={780}
      h={420}
      label="/srv/articles の下に current、repo、revisions.log、releases、shared がある。current は releases の中の最も新しい 20261120094457 を指すシンボリックリンクで、Nginx と Puma は current の下を参照する。新しいリリースの中の master.key や log などは shared の下のファイルとディレクトリへのリンクで、gem は shared/bundle に入る"
    >
      <T x={20} y={20} bold fs={12.5}>
        /srv/articles（deploy_to）
      </T>
      <Box x={20} y={44} w={170} h={56} lines={['Nginx・Puma', 'current の下を参照']} fs={12} bold subTone="muted" />
      <Arrow x1={105} y1={100} x2={105} y2={146} dashed />
      <Box x={20} y={148} w={170} h={50} lines={['current', 'シンボリックリンク']} fill="box5" accent fs={12} bold subTone="muted" />
      <Box x={20} y={248} w={170} h={50} lines={['repo/', 'Git のミラー']} fill="box4" fs={12} bold subTone="muted" />
      <Box x={20} y={328} w={170} h={50} lines={['revisions.log', '配備と切り戻しの記録']} fill="box4" fs={12} bold subTone="muted" />

      <rect x={226} y={36} width={306} height={276} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={240} y={56} bold fs={12}>
        releases/
      </T>
      <Box x={246} y={74} w={270} h={46} lines={['20261120093900', '以前のリリース']} fs={11.5} mono subTone="muted" />
      <Box x={246} y={132} w={270} h={46} lines={['20261120094115', '以前のリリース']} fs={11.5} mono subTone="muted" />
      <Box x={246} y={190} w={270} h={108} lines={['20261120094457', 'app/・config/・Gemfile.lock', 'REVISION・REVISION_TIME', '.bundle/config']} fill="box5" accent fs={11.5} mono subTone="muted" />
      <Arrow d="M190,173 C218,173 218,244 244,244" dashed accent />
      <T x={240} y={334} fs={11} tone="muted">
        名前は配備を始めた時刻（UTC）の14桁
      </T>
      <T x={240} y={354} fs={11} tone="muted">
        keep_releases を超えた古いものは削除される
      </T>

      <rect x={566} y={36} width={196} height={372} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={580} y={56} bold fs={12}>
        shared/
      </T>
      {shared.map((s, i) => (
        <Box key={s} x={580} y={70 + i * 42} w={168} h={32} lines={s} fill="box4" fs={11.5} mono />
      ))}
      <Box x={580} y={326} w={168} h={46} lines={['bundle/', 'BUNDLE_PATH で参照']} fill="box4" dashed fs={11.5} mono subTone="muted" />
      <Arrow d="M516,244 C540,244 545,190 578,190" dashed />
      <T x={524} y={290} fs={10.5} tone="muted">
        リンク
      </T>
    </Svg>
  )
}

/* ---------- 図 30-2 配備の段階とフック ---------- */
const flowRows: { stage: string; core: string[]; plugin: string[]; accent?: boolean }[] = [
  { stage: 'ステージの読み込み後', core: ['（本体の処理はない）'], plugin: ['rbenv:validate・rbenv:map_bins', 'bundler:map_bins・set_rails_env'] },
  { stage: 'starting', core: ['deploy:check（git:check、shared の作成、', 'linked_files の確認）、前回の REVISION の読み取り'], plugin: ['after: sidekiq:quiet（TSTP）'] },
  { stage: 'started', core: ['（フック用の空のタスク）'], plugin: [] },
  { stage: 'updating', core: ['git:create_release（新しいリリースを展開）', 'REVISION の書き込み、shared へのリンク'], plugin: [] },
  { stage: 'updated', core: ['（フック用の空のタスク）'], plugin: ['before: bundler:install', 'after: compile_assets・migrate・sidekiq:stop'] },
  { stage: 'publishing', core: ['symlink:release（current を新しいリリースへ）'], plugin: [], accent: true },
  { stage: 'published', core: ['（フック用の空のタスク）'], plugin: ['after: puma:smart_restart・sidekiq:start'] },
  { stage: 'finishing', core: ['cleanup（keep_releases を超えたリリースを削除）'], plugin: [] },
  { stage: 'finished', core: ['log_revision（revisions.log に追記）'], plugin: [] },
]

function DeployFlowFigure() {
  const top = 44
  const step = 58
  const failY = top + flowRows.length * step + 10
  return (
    <Svg
      id={`${F}-2`}
      w={800}
      h={failY + 60}
      label="cap production deploy はステージの読み込み後に rbenv と bundler の準備をし、starting、started、updating、updated、publishing、published、finishing、finished の順に進む。starting で deploy:check、updating で新しいリリースの展開とリンク、publishing で current の切り替え、finishing で古いリリースの削除、finished で revisions.log への追記を行う。プラグインは updated の前に bundler:install、updated の後にアセット・マイグレーション・Sidekiq の停止、published の後に Puma の再起動と Sidekiq の起動を加える。途中で失敗すると deploy:failed が呼ばれ、capistrano-sidekiq は Sidekiq を起動し直す"
    >
      <T x={20} y={22} bold fs={12}>
        段階（deploy:〜）
      </T>
      <T x={190} y={22} bold fs={12}>
        Capistrano 本体のタスク
      </T>
      <T x={530} y={22} bold fs={12}>
        プラグインが加えるタスク
      </T>
      {flowRows.map((r, i) => {
        const y = top + i * step
        return (
          <g key={r.stage}>
            <Box x={20} y={y} w={150} h={44} lines={r.stage} fill="bg" fs={12} bold mono={i > 0} />
            {i < flowRows.length - 1 && <Arrow x1={95} y1={y + 44} x2={95} y2={y + step - 1} />}
            <Box x={190} y={y} w={320} h={44} lines={r.core} fill={r.accent ? 'box5' : 'box'} accent={r.accent} fs={11} />
            {r.plugin.length > 0 && <Box x={530} y={y} w={252} h={44} lines={r.plugin} fill="box2" fs={11} />}
          </g>
        )
      })}
      <Box x={20} y={failY} w={150} h={44} lines="deploy:failed" fill="bg" dashed fs={12} bold mono />
      <Box x={190} y={failY} w={320} h={44} lines="途中で失敗したときに呼ばれる空のタスク" dashed fs={11} />
      <Box x={530} y={failY} w={252} h={44} lines="after: sidekiq:restart" fill="box2" dashed fs={11} />
    </Svg>
  )
}

/* ---------- 図 30-3 失敗と切り戻しの状態 ---------- */
function RollbackFigure() {
  const panels = [
    { x: 20, title: '公開の前に失敗（migrate など）', to: 'old', fresh: 'releases/ に残る', notes: ['current は前のリリースのまま', '失敗したリリースは releases/ に残る', 'revisions.log に記録されない'] },
    { x: 280, title: '公開の後に失敗（再起動・確認）', to: 'new', fresh: '新しいリリース', notes: ['current は新しいリリースを指す', 'Puma が新しいコードを読み込んでいる', 'revisions.log に記録されない'] },
    { x: 540, title: 'deploy:rollback の後', to: 'old', fresh: 'tar.gz にして削除', notes: ['current を戻して Puma を再起動', '戻したリリースは releases/ から消える', 'DB に適用した変更は残る'] },
  ]
  return (
    <Svg
      id={`${F}-4`}
      w={780}
      h={330}
      label="左は公開の前に失敗したとき。current は前のリリース 094115 を指したままで、失敗した 094134 は releases に残る。中央は公開の後に失敗したとき。current は新しいリリース 094134 を指し、Puma も新しいコードを読み込んでいる。右は deploy:rollback の後。current は 094115 に戻り、094134 は tar.gz にまとめて releases から削除される。DB に適用した変更は残る"
    >
      {panels.map((p, i) => (
        <g key={p.title}>
          <T x={p.x} y={20} bold fs={12}>
            {p.title}
          </T>
          <Box x={p.x + 70} y={40} w={100} h={34} lines="current" fill="box5" fs={12} bold mono />
          <Box x={p.x} y={112} w={220} h={40} lines={['…094115', '前のリリース']} fs={11.5} mono subTone="muted" />
          {i === 2 ? (
            <Box x={p.x} y={170} w={220} h={40} lines={['rolled-back-release-', '…094134.tar.gz']} fill="box4" fs={11} mono />
          ) : (
            <Box x={p.x} y={170} w={220} h={40} lines={['…094134', p.fresh]} fill={i === 0 ? 'bg' : 'box'} dashed={i === 0} fs={11.5} mono subTone={i === 0 ? 'danger' : 'muted'} />
          )}
          {p.to === 'old' ? (
            <Arrow x1={p.x + 120} y1={74} x2={p.x + 120} y2={110} dashed accent />
          ) : (
            <Arrow d={`M${p.x + 170},57 C${p.x + 240},57 ${p.x + 244},190 ${p.x + 222},190`} dashed accent />
          )}
          {p.notes.map((n, j) => (
            <T key={n} x={p.x} y={240 + j * 22} fs={11} tone={i === 2 && j === 2 ? 'danger' : 'muted'}>
              {n}
            </T>
          ))}
        </g>
      ))}
    </Svg>
  )
}

/* ---------- 図 30-4 ALB の配下で1台ずつ再起動する ---------- */
function RollingFigure() {
  const steps = [['① ALB から外す', 'ドレインを待つ'], ['② Puma を', '起動し直す'], ['③ /up が', '200 を返すか確認'], ['④ ALB に戻す', '正常の判定を待つ']]
  const lane = (y: number, name: string) => (
    <g>
      <T x={140} y={y - 12} bold fs={12}>
        {name}
      </T>
      {steps.map((s, i) => (
        <g key={s[0]}>
          <Box x={140 + i * 158} y={y} w={148} h={56} lines={s} fill={i === 1 ? 'box5' : 'box'} fs={11.5} />
          {i < steps.length - 1 && <Arrow x1={288 + i * 158} y1={y + 28} x2={296 + i * 158} y2={y + 28} />}
        </g>
      ))}
    </g>
  )
  return (
    <Svg
      id={`${F}-3`}
      w={780}
      h={300}
      label="ALB の配下にある app1 と app2 で、1台ずつ順に処理する。app1 では ALB から外してドレインを待ち、Puma を起動し直し、/up が 200 を返すことを確かめ、ALB に戻して正常と判定されるまで待つ。その後 wait の秒数だけ待ってから app2 で同じ手順を行う。current の切り替えは、この処理の前に全台で済んでいる"
    >
      <Box x={20} y={112} w={100} h={60} lines={['ALB', '転送先を管理']} fill="box4" fs={12} bold subTone="muted" />
      <Arrow x1={120} y1={128} x2={140} y2={74} dashed plain />
      <Arrow x1={120} y1={158} x2={140} y2={214} dashed plain />
      {lane(46, 'app1')}
      <Arrow d="M688,102 L688,130 L214,130 L214,184" />
      <T x={300} y={122} fs={10.5} tone="muted">
        wait の秒数だけ待って次の台へ（in: :sequence）
      </T>
      {lane(186, 'app2')}
      <T x={20} y={276} fs={11} tone="muted">
        current の切り替え（publishing）は、この処理の前に全台で済んでいる。途中で失敗すると、残りの台には進まない
      </T>
    </Svg>
  )
}

/* ---------- 配備で使う2種類の SSH 接続（番号なし） ---------- */
function SshConnectionsFigure() {
  return (
    <Svg
      id="ch32-ssh"
      w={780}
      h={312}
      label="1つ目の接続は、cap を実行する端末から配備先の app1・app2 への SSH で、コマンドを実行する。配備先の deploy ユーザーの authorized_keys に、配備する人と CI の公開鍵を登録する。2つ目の接続は、配備先から Git のホストへの SSH で、repo を更新する。2つ目の接続の鍵は、forward_agent: true で配備する人の鍵を転送して使うか、読み取り専用のデプロイキーの秘密鍵を各配備先に置く"
    >
      <Box x={20} y={30} w={170} h={64} lines={['cap を実行する端末', '開発者の PC・CI']} fs={12} bold subTone="muted" />
      <Box x={305} y={30} w={170} h={64} lines={['配備先 app1・app2', 'deploy ユーザー']} fs={12} bold subTone="muted" />
      <Box x={590} y={30} w={170} h={64} lines={['Git のホスト', 'リポジトリ']} fill="box4" fs={12} bold subTone="muted" />
      <Arrow x1={190} y1={62} x2={303} y2={62} />
      <T x={247} y={48} anchor="middle" fs={12} bold>
        ① SSH
      </T>
      <T x={247} y={78} anchor="middle" fs={11.5} tone="muted">
        コマンドを実行
      </T>
      <Arrow x1={475} y1={62} x2={588} y2={62} accent />
      <T x={532} y={48} anchor="middle" fs={12} bold tone="acc">
        ② SSH
      </T>
      <T x={532} y={78} anchor="middle" fs={11.5} tone="muted">
        repo/ の更新
      </T>
      <Arrow x1={390} y1={94} x2={390} y2={120} dashed plain />
      <Box x={305} y={120} w={170} h={48} lines={['~/.ssh/authorized_keys', '配備する人と CI の公開鍵']} fill="box4" fs={11.5} subTone="muted" />
      <T x={20} y={204} bold fs={12}>
        ② の鍵を用意する方法（どちらか一方）
      </T>
      <Box x={20} y={220} w={360} h={52} lines={['forward_agent: true', '配備する人の鍵で、配備先から Git のホストに接続']} fs={11.5} bold subTone="muted" />
      <Box x={400} y={220} w={360} h={52} lines={['デプロイキー', '読み取り専用の鍵を登録し、秘密鍵を各配備先に置く']} fs={11.5} bold subTone="muted" />
      <T x={20} y={292} fs={11.5} tone="muted">
        管理者を信頼できない配備先には転送しない
      </T>
      <T x={400} y={292} fs={11.5} tone="muted">
        CI から配備するとき、CI の鍵を転送せずに済む
      </T>
    </Svg>
  )
}

/* ---------- capistrano.log の1行目と、各部分を作ったコード（番号なし） ---------- */
const commandParts: { src: string[]; part: string; plugin?: boolean }[] = [
  { src: ['within current_path do', 'puma.rake'], part: 'cd /srv/articles/current &&' },
  { src: ['rbenv:map_bins の default_env', 'capistrano-rbenv'], part: 'export RBENV_ROOT="$HOME/.rbenv" RBENV_VERSION="4.0.9"', plugin: true },
  { src: ['with rails_env: fetch(:rails_env) do', 'puma.rake'], part: 'RAILS_ENV="production" ;' },
  { src: ['rbenv:map_bins の command_map', 'capistrano-rbenv'], part: '$HOME/.rbenv/bin/rbenv exec', plugin: true },
  { src: ['execute :bundle, :exec, :pumactl, …', 'puma.rake'], part: 'bundle exec pumactl -S …/puma.state phased-restart' },
]

function CommandPartsFigure() {
  const top = 40
  const step = 56
  return (
    <Svg
      id="ch32-command-parts"
      w={780}
      h={top + commandParts.length * step}
      label="capistrano.log の1行目を前から順に区切ると、cd /srv/articles/current は puma.rake の within current_path、export RBENV_ROOT と RBENV_VERSION は capistrano-rbenv の rbenv:map_bins が設定した default_env、RAILS_ENV は puma.rake の with rails_env:、rbenv exec の前置きは rbenv:map_bins が設定した command_map、bundle exec pumactl 以降は puma.rake の execute の引数から作られる"
    >
      <T x={20} y={20} bold fs={12}>
        部分を作ったコード・設定
      </T>
      <T x={350} y={20} bold fs={12}>
        capistrano.log の1行目（前から順に）
      </T>
      {commandParts.map((p, i) => {
        const y = top + i * step
        return (
          <g key={p.part}>
            <Box x={20} y={y} w={290} h={44} lines={p.src} fill={p.plugin ? 'box2' : 'box'} fs={11.5} mono subTone="muted" />
            <Arrow x1={310} y1={y + 22} x2={348} y2={y + 22} />
            <Box x={350} y={y} w={410} h={44} lines={p.part} fill="bg" fs={11.5} mono align="start" />
          </g>
        )
      })}
    </Svg>
  )
}

/* ---------- 再起動と確認を別々の on に書いた場合と同じ on に書いた場合（番号なし） ---------- */
function OnBlocksFigure() {
  const frame = (x: number, y: number, w: number, h: number, name: string) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={x + 10} y={y + 16} fs={11.5} mono tone="muted">
        {name}
      </T>
    </g>
  )
  const heads = (x0: number) => (
    <g>
      <T x={x0 + 85} y={46} anchor="middle" bold fs={12}>
        app1
      </T>
      <T x={x0 + 265} y={46} anchor="middle" bold fs={12}>
        app2
      </T>
    </g>
  )
  return (
    <Svg
      id="ch32-on-blocks"
      w={780}
      h={324}
      label="左は再起動と確認を別々の on に書いた実行例。puma:phased_restart の on で app1、app2 の順に Puma を入れ替えた後、deploy:verify_release の on で app1 の応答を確かめて失敗し、止まった。このとき app1 と app2 はどちらも 500 を返していた。右は同じ on roles(:app), in: :sequence のブロックに書いた場合。app1 で Puma を入れ替えて応答を確かめ、失敗するとそこで止まり、app2 では再起動も確認も実行しない"
    >
      <T x={20} y={18} bold fs={12}>
        別々の on に書いた場合（実行例）
      </T>
      {heads(20)}
      {frame(20, 60, 350, 140, 'puma:phased_restart')}
      <Box x={30} y={88} w={150} h={40} lines="① Puma を入れ替え" fs={12} />
      <Box x={210} y={148} w={150} h={40} lines="② Puma を入れ替え" fs={12} />
      <Arrow d="M180,108 L285,108 L285,146" />
      {frame(20, 208, 350, 78, 'deploy:verify_release')}
      <Box x={30} y={236} w={150} h={42} lines={['③ 応答を確認', '失敗して止まる']} fs={12} subTone="danger" />
      <Arrow d="M285,188 L285,257 L182,257" />
      <T x={20} y={308} fs={11.5} tone="danger">
        止まったとき、app1・app2 とも 500 を返していた
      </T>

      <T x={410} y={18} bold fs={12}>
        同じ on に書いた場合
      </T>
      {heads(410)}
      {frame(410, 60, 350, 226, 'on roles(:app), in: :sequence')}
      <Box x={420} y={88} w={150} h={40} lines="① Puma を入れ替え" fs={12} />
      <Arrow x1={495} y1={128} x2={495} y2={146} />
      <Box x={420} y={148} w={150} h={42} lines={['② 応答を確認', '失敗して止まる']} fs={12} subTone="danger" />
      <Box x={600} y={236} w={150} h={42} lines={['再起動と確認を', '実行しない']} fill="bg" dashed fs={12} subTone="muted" />
      <T x={410} y={308} fs={11.5} tone="muted">
        app2 の Puma は入れ替えていない
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 32,
  part: 5,
  title: 'Capistrano でのアプリケーションの配備',
  summary:
    'サーバー上に新しいコードを置いても、動いている Puma は以前のコードで応答を続けます。Capistrano の配備ログを読み、ファイルの準備、参照先の切り替え、プロセスの再起動を順に確かめます。',
  goals: [
    '配備先に毎回作るファイルと、リリースをまたいで使い続けるファイルを区別できる',
    '配備ログから、どのサーバーで何が終わり、どの段階で失敗したかを見つけられる',
    '前のコードへ切り戻すとき、稼働中のプロセスと DB に何が残るかを確認できる',
  ],
  prerequisites: [18, 23, 24, 25],
  sections: [
    {
      id: 'capistrano-deploy',
      title: '配備で行う作業と Capistrano の役割',
      body: (
        <>
          <p>
            書いたコードを本番のサーバーに置き、動いているアプリケーションを新しいコードに切り替える作業を<Term>配備</Term>（デプロイ）と呼びます。この章では、ALB の後ろの仮想マシン（VM）で Nginx と Puma が動く構成（
            <ChapterLink n={25} section="composition">ロードバランサー配下の構成</ChapterLink>）に、記事アプリの新しいコードを Capistrano で配る手順を扱います。
          </p>
          <h3>手作業で配備するとき</h3>
          <p>
            記事一覧の表示を直したコードが Git に入ったとします。次は、利用者の要求を受けているサーバーにその変更を反映します。下の例では、手元の端末から <code>ssh</code> で配備先に接続します。2行目以降はそのサーバー上で実行するコマンドです。
          </p>
          <p>
            この例では記事アプリを <code>/srv/articles</code> に置き、Linux でサービスの起動・停止を管理する systemd に Puma を登録しています。最後の <code>systemctl restart</code> で、新しいコードを読む Puma に入れ替わります。
          </p>
          <Code
            lang="bash"
            title="手作業での配備の例（1台分）"
            code={`
ssh deploy@app1.example.org
cd /srv/articles
git pull origin main                              # 新しいコードを取得
bundle install                                    # Gemfile.lock の gem を入れる
RAILS_ENV=production bin/rails assets:precompile  # CSS や JavaScript を public/assets に書き出す
RAILS_ENV=production bin/rails db:migrate         # DB の構造を変える
sudo systemctl restart puma.service               # Puma に新しいコードを読み込ませる
`}
          />
          <p>この手順には次の問題があります。</p>
          <ul>
            <li>
              <code>git pull</code> は、Puma が読み込んでいるディレクトリのファイルをその場で書き換えます。途中で <code>bundle install</code> が失敗すると、新しいコードと古い gem が混ざったディレクトリが残ります。
            </li>
            <li>前のコードに戻すには、どのコミットだったかを調べて <code>git checkout</code> し、gem とアセットを作り直します。</li>
            <li>台数分同じ操作を繰り返し、マイグレーションは1台だけ、Puma は1台ずつといった順序も担当者が覚えておくことになります。</li>
            <li>いつ誰がどのコミットを配備したかが、サーバーに残りません。</li>
          </ul>
          <h3>Capistrano が行うこと</h3>
          <p>
            <Term>Capistrano</Term> は手元の PC や CI から SSH で各サーバーに接続し、決まったコマンドを決まった順に実行する Ruby のツールです。この章では2026年11月時点の最新版の Capistrano 3.20.1 を使います
            <Ref n={23} />。手作業との違いは次の3点です。
          </p>
          <ol>
            <li>
              配備のたびに <code>releases/</code> の下にディレクトリを作り、そこにコードを展開します。このディレクトリを<Term en="release">リリース</Term>と呼びます。稼働中のディレクトリは書き換えず、準備が済んでから <code>current</code> というシンボリックリンクのリンク先を新しいリリースに替えます。
            </li>
            <li>準備・公開・後片付けの段階を決まった順に進め、各段階の前後にプラグインや自作のタスクを加えられます。gem の導入、アセットの作成、マイグレーション、Puma の再起動は、プラグインのタスクとして加えます。</li>
            <li>
              配備したコミットを <code>revisions.log</code> と各リリースの <code>REVISION</code> ファイルに記録し、<code>deploy:rollback</code> で <code>current</code> を前のリリースに戻せます
              <Ref n={1} />
              <Ref n={2} />。
            </li>
          </ol>
          <h3>Capistrano が行わないこと</h3>
          <p>
            Capistrano は用意済みのサーバーにアプリケーションを配る道具です。OS のパッケージ、Ruby 本体、Nginx の設定、systemd のユニットファイル、MySQL のクライアントライブラリ、deploy ユーザーと SSH の鍵は、Capistrano を動かす前に別の手段で用意します。
            構築の手順を Ansible などの構成管理ツールや手順書に残しておけば、新しいサーバーにも同じ構成を作れます。Ruby のバージョンを上げるときも、新しい Ruby を各サーバーに入れる作業は Capistrano の外で行います（
            <ChapterLink n={32} section="ruby-gems">Ruby と gem をそろえる</ChapterLink>）。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">作業</th>
                  <th scope="col">担当</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>OS・Ruby・Nginx・systemd のユニット・DB クライアントの導入</td>
                  <td>構成管理ツールや手順書（Capistrano の外）</td>
                </tr>
                <tr>
                  <td>コードの取得と展開、共有ファイルへのリンク、<code>current</code> の切り替え、古いリリースの削除</td>
                  <td>Capistrano 本体</td>
                </tr>
                <tr>
                  <td>gem の導入、アセットの作成、マイグレーション</td>
                  <td>capistrano-bundler・capistrano-rails</td>
                </tr>
                <tr>
                  <td>Puma・Sidekiq の再起動</td>
                  <td>capistrano3-puma・capistrano-sidekiq、または自作のタスク</td>
                </tr>
                <tr>
                  <td>新しいリリースが正しく応答するかの確認</td>
                  <td>自作のタスク（本体とこれらのプラグインには無い）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            capistrano3-puma の <code>puma:install</code> のように systemd のユニットファイルを書き出すタスクもありますが、サーバーごとに一度だけ実行する準備の作業で、毎回の配備には含まれません
            <Ref n={15} />。
          </p>
        </>
      ),
    },
    {
      id: 'release-layout',
      title: 'サーバー上のディレクトリ構成',
      body: (
        <>
          <p>
            配備先で <code>/srv/articles/current</code> を開くと、今回使う版のファイルが見えます。この <code>current</code> は別のディレクトリを指す名前（シンボリックリンク）です。配備では新しい版を別の場所に用意して、最後にこの名前が指す先を替えます。設定の <code>deploy_to</code> は、これらをまとめて置く場所で、この例では <code>/srv/articles</code> です。
          </p>
          <p>
            この章の実行例は Docker の3台のコンテナで確かめたものです。cap を実行する ctl と、SSH で接続する配備先の app1・app2 を用意し、配備先に Ruby 4.0.9 と rbenv を入れて、Rails 8.1.4.1 の記事アプリ（DB は SQLite の最小構成）を配りました。設定ファイルは
            <ChapterLink n={32} section="capistrano-config">次の節</ChapterLink>で示します。下は配備を4回行った後の app1 です。
          </p>
          <Code
            lang="text"
            title="app1 の /srv/articles（ls -l の抜粋）"
            code={`
$ ls -l /srv/articles
lrwxrwxrwx 1 deploy deploy   37 Nov 20 09:39 current -> /srv/articles/releases/20261120093914
drwxrwxr-x 5 deploy deploy 4096 Nov 20 09:39 releases
drwxrwxr-x 7 deploy deploy 4096 Nov 20 09:39 repo
-rw-rw-r-- 1 deploy deploy  397 Nov 20 09:39 revisions.log
drwxrwxr-x 8 deploy deploy 4096 Nov 20 09:37 shared
$ ls /srv/articles/releases
20261120093835
20261120093900
20261120093914
`}
          />
          <ul>
            <li>
              <code>releases/</code> には配備ごとに1つリリースを作ります。名前は配備を始めた時刻（UTC）の年月日時分秒を並べた14桁です。<code>keep_releases</code> を3にしているので、4回のうち最も古い1つは削除されています。
            </li>
            <li>
              <code>ls -l</code> の <code>current -&gt; …/20261120093914</code> は、current を通ってファイルを開くと、末尾が 093914 のリリースの中を読むという意味です。Nginx の <code>root</code> や Puma の作業ディレクトリには、<code>current</code> の下のパスを指定します。
            </li>
            <li>
              <code>repo/</code> は Git リポジトリのミラー（作業ツリーの無い bare リポジトリ）です。配備のたびに clone し直さずにここを更新し、<code>git archive</code> でリリースに展開します。
            </li>
            <li>
              <code>shared/</code> にはリリースをまたいで使うファイルとディレクトリを置き、各リリースからシンボリックリンクで参照します。
            </li>
            <li>
              <code>revisions.log</code> は配備と切り戻しの履歴です
              <Ref n={1} />
              <Ref n={8} />。
            </li>
          </ul>
          <Figure n={`${F}-1`} title="配備先のディレクトリとリンク" caption="実行例の app1 で、さらに配備を重ねた後の状態をもとにした模式図。破線の矢印はシンボリックリンクや設定による参照を表す。">
            <ReleaseLayoutFigure />
          </Figure>
          <p>
            図{F}-1はリリースごとに作られるものと、配備しても残るものを分けて示すために置きました。左の <code>current</code> から出る破線が、稼働中のリリースへのリンクです。中央の <code>releases/</code> は配備のたびに増え、右の <code>shared/</code> は残ります。
            新しいリリースの <code>config/master.key</code> や <code>log</code> は <code>shared/</code> へのリンクで、gem は <code>shared/bundle</code> に入ります。
          </p>
          <p>
            どのコミットを配備したかは、<code>revisions.log</code> と各リリースの <code>REVISION</code> に残ります。<code>git archive</code> で展開したリリースには <code>.git</code> が無いので、リリースの中では <code>git log</code> を使えません。<code>REVISION_TIME</code> にはコミットの時刻が UNIX 時間（1970年からの秒数）で入ります
            <Ref n={7} />。
          </p>
          <Code
            lang="text"
            title="配備の記録（app1、4回目の配備の後）"
            code={`
$ cat /srv/articles/revisions.log
Branch main (at db1b92cddbdaf4f687985b1a4129648b42a10f04) deployed as release 20261120093658 by
Branch main (at 6c0c79ff136dbd0b430ca0b7a685ce61957a5aa7) deployed as release 20261120093835 by dev
Branch main (at df73d0fbc3fe207c6b452bb47cf7c1cc51d94ab6) deployed as release 20261120093900 by dev
Branch main (at 967f743f452786da4a0eb65f450a96ca2b8a1e70) deployed as release 20261120093914 by dev
$ cat /srv/articles/current/REVISION
967f743f452786da4a0eb65f450a96ca2b8a1e70
`}
          />
          <p>
            1行目の末尾が空なのは、1回目の配備で cap を実行したシェルに環境変数 <code>USER</code> が無かったためです。<code>by</code> の後には cap を実行した利用者の名前（既定では <code>USER</code> の値）が入ります
            <Ref n={9} />。
          </p>
        </>
      ),
    },
    {
      id: 'capistrano-config',
      title: '導入と設定ファイル',
      body: (
        <>
          <h3>Gemfile に加える</h3>
          <p>Capistrano とプラグインはアプリケーションの Gemfile に加えます。</p>
          <Code
            lang="ruby"
            title="Gemfile（追加する部分）"
            code={`
group :development do
  gem "capistrano", "~> 3.20", require: false
  gem "capistrano-rbenv", "~> 2.2", require: false
  gem "capistrano-bundler", "~> 2.2", require: false
  gem "capistrano-rails", "~> 1.7", require: false
end
`}
          />
          <p>
            Capistrano は開発者の PC や CI で動かす道具で、本番の Rails プロセスは使いません。<code>development</code> グループに入れておけば、<code>development</code> と <code>test</code> を除いて実行する配備先の <code>bundle install</code> では入りません。
            <code>require: false</code> は開発環境で Rails を起動したときに <code>Bundler.require</code> でこれらの gem を読み込まないための指定です。cap コマンドは設定を <code>Capfile</code> から読み込みます。
          </p>
          <h3>cap install が作るファイル</h3>
          <Code
            lang="text"
            title="bundle exec cap install の出力（ctl で実行）"
            code={`
mkdir -p config/deploy
create config/deploy.rb
create config/deploy/staging.rb
create config/deploy/production.rb
mkdir -p lib/capistrano/tasks
create Capfile
Capified
`}
          />
          <p>
            <code>config/deploy/staging.rb</code> と <code>production.rb</code> は<Term en="stage">ステージ</Term>のファイルです。ステージは本番やステージングのような配備先ごとの設定で、<code>cap production deploy</code> の <code>production</code> がその名前です。
            cap は共通の <code>config/deploy.rb</code> を読んだ後に <code>config/deploy/production.rb</code> を読みます。作るステージは <code>cap install STAGES=staging,production</code> のように選べます
            <Ref n={4} />
            <Ref n={10} />。
          </p>
          <h3>Capfile</h3>
          <Code
            lang="ruby"
            title="Capfile（実行例で使ったもの）"
            code={`
require "capistrano/setup"     # ステージのタスク（cap production …）を作る
require "capistrano/deploy"    # deploy と deploy:* のタスクを読み込む

require "capistrano/scm/git"
install_plugin Capistrano::SCM::Git

require "capistrano/rbenv"
require "capistrano/bundler"
require "capistrano/rails/assets"
require "capistrano/rails/migrations"

Dir.glob("lib/capistrano/tasks/*.rake").each { |r| import r }
`}
          />
          <p>
            <code>capistrano/scm/git</code> はリポジトリの取得に Git を使うプラグインで、<code>install_plugin</code> でフックを登録します。assets と migrations は <code>require "capistrano/rails"</code> の1行でまとめて読み込むこともでき、この1行は capistrano/bundler も読み込みます。
            最後の行が <code>lib/capistrano/tasks</code> の自作のタスクを読み込みます
            <Ref n={9} />
            <Ref n={13} />。
          </p>
          <h3>config/deploy.rb</h3>
          <Code
            lang="ruby"
            title="config/deploy.rb（実行例で使ったもの）"
            code={`
lock "~> 3.20.1"

set :application, "articles"
set :repo_url, "git://ctl/articles.git"   # 実際の運用では git@github.com:… など
set :deploy_to, "/srv/articles"
set :branch, ENV.fetch("BRANCH", "main")

set :rbenv_type, :user
set :rbenv_ruby, "4.0.9"

append :linked_files, "config/master.key"
append :linked_dirs, "log", "storage", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system"

set :keep_releases, 3
set :bundle_version, 4
set :conditionally_migrate, true
`}
          />
          <p>
            <code>lock</code> には、この設定が想定する Capistrano のバージョンを書きます。合わないバージョンで実行すると止まります。<code>set</code> は変数に値を入れ、<code>append</code> は配列の変数に値を足します。
            capistrano-rails が <code>linked_dirs</code> に <code>public/assets</code> を足すように、プラグインも同じ変数を使うので、配列は <code>set</code> で上書きせずに <code>append</code> で足します
            <Ref n={10} />
            <Ref n={13} />。
          </p>
          <p>
            既定値にも注意します。<code>deploy_to</code> を書かないと <code>/var/www/アプリケーション名</code>、<code>branch</code> を書かないと <code>master</code> になるので、<code>main</code> で開発しているリポジトリでは <code>branch</code> を必ず設定します。<code>keep_releases</code> の既定値は5です
            <Ref n={9} />。ほかの値は該当する節で説明します。
          </p>
          <h3>config/deploy/production.rb</h3>
          <Code
            lang="ruby"
            title="config/deploy/production.rb（実行例で使ったもの）"
            code={`
server "app1", user: "deploy", roles: %w[app web db]
server "app2", user: "deploy", roles: %w[app web]

set :ssh_options, {
  keys: %w[/root/.ssh/id_ed25519],
  forward_agent: false,
  auth_methods: %w[publickey],
}
`}
          />
          <p>
            ステージのファイルには、そのステージのサーバーと、ステージだけで変える値を書きます。<code>config/deploy.rb</code> と同じ <code>set</code> も書け、ステージの値が後から読まれます。
          </p>
        </>
      ),
    },
    {
      id: 'servers-roles',
      title: 'サーバーとロール、SSH の接続',
      body: (
        <>
          <p>
            <code>server</code> の <code>roles</code> に書く<Term en="role">ロール</Term>は、タスクを実行するサーバーを選ぶための名前です。Capistrano の説明書は <code>app</code> と <code>db</code> を「プレースホルダー」と呼び、意味はプラグインを使ったときに決まると書いています
            <Ref n={4} />。主なプラグインの既定値では、次のタスクがロールで実行先を選びます。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">ロール</th>
                  <th scope="col">そのロールを使うタスク（既定値）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>web</code></th>
                  <td>capistrano-rails のアセットの作成（<code>assets_roles</code>）、capistrano3-puma の Puma の操作（<code>puma_role</code>）</td>
                </tr>
                <tr>
                  <th scope="row"><code>db</code></th>
                  <td>capistrano-rails のマイグレーション（<code>migration_role</code>）。実行するのは primary の1台だけ</td>
                </tr>
                <tr>
                  <th scope="row"><code>worker</code></th>
                  <td>capistrano-sidekiq の Sidekiq の操作（<code>sidekiq_roles</code>）</td>
                </tr>
                <tr>
                  <th scope="row"><code>app</code></th>
                  <td>本体と上のプラグインの既定では使わない。自作のタスクでアプリのプロセスを操作するときに使うことが多い</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            アセットは <code>web</code> の台でしか作られないので、Nginx と Puma を同じ台に置くこの章の構成では、各台に <code>web</code> と <code>app</code> の両方を付けます
            <Ref n={13} />
            <Ref n={15} />
            <Ref n={16} />。
          </p>
          <h3>primary と no_release</h3>
          <p>
            <code>db</code> ロールはマイグレーションを実行する台を選ぶ名前で、MySQL が動くサーバーを指すものではありません。マイグレーションはリリースのディレクトリで <code>rake db:migrate</code> を実行するので、コードが配られる台に付けます。
            次の例では説明のためにわざと MySQL のサーバー db1 にも <code>db</code> を付けています。
          </p>
          <Code
            lang="ruby"
            title="ロールの選び方を確かめるステージの例"
            code={`
server "app1", user: "deploy", roles: %w[app web db]
server "app2", user: "deploy", roles: %w[app web]
server "worker1", user: "deploy", roles: %w[worker]
server "db1", user: "deploy", roles: %w[db], primary: true, no_release: true
`}
          />
          <Code
            lang="text"
            title="同じステージで、ロールを選ぶメソッドの戻り値を表示した結果"
            code={`
roles(:app)          ["app1", "app2"]
roles(:db)           ["app1", "db1"]
primary(:db)         db1
release_roles(:all)  ["app1", "app2", "worker1"]
release_roles(:db)   ["app1"]
`}
          />
          <p>
            <code>roles(:db)</code> は <code>db</code> を持つすべての台を返し、<code>primary(:db)</code> は <code>primary: true</code> を付けた台を、無ければ最初に書いた台を返します。<code>no_release: true</code> を付けた台は <code>release_roles</code> から除かれます。
            コードの展開、リンク、<code>current</code> の切り替え、古いリリースの削除といった本体のタスクは <code>release_roles</code> を使うので、db1 にはリリースが作られません
            <Ref n={7} />
            <Ref n={10} />。
          </p>
          <p>
            一方、capistrano-rails のマイグレーションは <code>primary(:db)</code> の1台で実行するので、この例のままではリリースの無い db1 が実行先になります。実際の設定では db1 を書かず、app1 だけに <code>db</code> を付けます
            <Ref n={13} />。
          </p>
          <h3>タスクの中で実行先を選ぶ</h3>
          <p>
            タスクの中では <code>on roles(:app) do … end</code> のように、ブロックを実行する台を指定します。<code>on</code> は渡された台のそれぞれに SSH で接続し、既定では全台で同時にブロックを実行します。
            cap に <code>--roles=web</code> や <code>--hosts=app2</code> を付けるか環境変数 <code>ROLES</code> を設定すると、<code>on</code> が受け取った台のうち条件に合う台だけで実行します
            <Ref n={6} />
            <Ref n={10} />
            <Ref n={11} />。
          </p>
          <h3>SSH の接続と Git の鍵</h3>
          <p>配備では2種類の SSH 接続を使います。</p>
          <ol>
            <li>
              cap を実行する PC や CI から配備先への接続です。配備先の deploy ユーザーの <code>~/.ssh/authorized_keys</code> に、配備する人や CI の公開鍵を1行ずつ登録し、ファイルの権限を0600、<code>.ssh</code> ディレクトリを0700にします
              <Ref n={5} />。
            </li>
            <li>
              配備先から Git のホストへの接続です。<code>git:check</code> の <code>git ls-remote</code> や <code>repo/</code> の clone と更新は配備先で実行されるので、配備先がリポジトリを読める必要があります。
            </li>
          </ol>
          <p>
            2つ目の接続には2つの方法があります。<code>forward_agent: true</code> で SSH のエージェント転送を使うと、配備する人の鍵で配備先から Git のホストに接続できます。ただし Capistrano の説明書は、管理者を信頼できないサーバーにはエージェントを転送しないよう書いています。
            もう一つは、読み取り専用の<Term en="deploy key">デプロイキー</Term>をリポジトリに登録し、その秘密鍵を各配備先に置く方法です。CI から配備するときも、この方法なら CI の鍵を配備先へ転送せずに済みます
            <Ref n={5} />。
          </p>
          <p>
            次の図は、配備で使う2つの接続を、接続を始める側から相手への矢印で表したものです。上の段の①は端末から配備先へ、②は配備先から Git のホストへの接続です。下の段には、②で使う鍵を用意する2つの方法を並べました。
          </p>
          <Figure title="配備で使う2種類の SSH 接続" caption="模式図。実線の矢印は、接続を始める側から相手への向きを表す。②は配備先から始まる接続なので、太い青の矢印にした。破線は、配備先の deploy ユーザーの ~/.ssh に置くファイルを表す。">
            <SshConnectionsFigure />
          </Figure>
          <p>
            Capistrano は SSHKit を通して Ruby の net-ssh で接続し、<code>~/.ssh/config</code> の設定も読み込みます。<code>cap install</code> が作る <code>config/deploy.rb</code> には、初めて接続する前にホスト鍵を手で確かめるための <code>verify_host_key</code> の設定例がコメントで入っています。
            なお、Git のプラグインが配備先に置く <code>git:wrapper</code> のスクリプトは <code>StrictHostKeyChecking=no</code> を付けて ssh を呼ぶので、配備先から Git のホストへの接続ではホスト鍵を確かめません
            <Ref n={8} />
            <Ref n={9} />
            <Ref n={11} />。
          </p>
        </>
      ),
    },
    {
      id: 'deploy-flow',
      title: '配備の流れとフック',
      body: (
        <>
          <p>
            <code>cap production deploy</code> を実行すると、Capistrano は <code>deploy</code> タスクを実行します。このタスクは8つのタスクを決まった順に呼ぶだけです。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/framework.rake（Capistrano 3.20.1、抜粋）"
            href={`${CAP}/lib/capistrano/tasks/framework.rake`}
            code={`
  desc "Publish the release."
  task :publishing do
  end

  desc "Published"
  task :published do
  end
# （中略）
desc "Deploy a new release."
task :deploy do
  set(:deploying, true)
  %w{ starting started
      updating updated
      publishing published
      finishing finished }.each do |task|
    invoke "deploy:#{task}"
  end
end
`}
          />
          <p>
            framework.rake の8つのタスクは、どれも中身が空です。Capistrano のタスクは Rake のタスクなので、同じ名前のタスクを別のファイルでもう一度定義すると、後から定義した処理が続けて実行されます。deploy.rake はこの仕組みで、5つの段階に実際の処理を加えています
            <Ref n={7} />。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/deploy.rake（Capistrano 3.20.1、抜粋）"
            href={`${CAP}/lib/capistrano/tasks/deploy.rake`}
            code={`
namespace :deploy do
  task :starting do
    invoke "deploy:print_config_variables" if fetch(:print_config_variables, false)
    invoke "deploy:check"
    invoke "deploy:set_previous_revision"
    invoke "deploy:set_previous_revision_time"
  end
# （中略）
  task updating: :new_release_path do
    invoke "deploy:set_current_revision"
    invoke "deploy:set_current_revision_time"
    invoke "deploy:symlink:shared"
  end
# （中略）
  task :publishing do
    invoke "deploy:symlink:release"
  end

  task :finishing do
    invoke "deploy:cleanup"
  end
# （中略）
  task :finished do
    invoke "deploy:log_revision"
  end
`}
          />
          <p>
            <code>started</code>・<code>updated</code>・<code>published</code> には本体の処理がありません。説明書はこれらを、自作のタスクを流れに加えるためのタスクと説明しています
            <Ref n={2} />。
          </p>
          <h3>フックの登録</h3>
          <p>
            あるタスクの前後に別のタスクを実行させることを<Term en="hook">フック</Term>と呼びます。<code>before "deploy:updated", "bundler:install"</code> と書くと、<code>deploy:updated</code> の前に <code>bundler:install</code> が実行されます。<code>after</code> は元のタスクの処理が終わった後に実行させます。
            Git のプラグインは新しいリリースのパスを決める <code>deploy:new_release_path</code> の後にコードの展開を加えています
            <Ref n={8} />
            <Ref n={10} />。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/scm/git.rb（Capistrano 3.20.1、抜粋）"
            href={`${CAP}/lib/capistrano/scm/git.rb`}
            code={`
  def register_hooks
    after "deploy:new_release_path", "git:create_release"
    before "deploy:check", "git:check"
    before "deploy:set_current_revision", "git:set_current_revision"
    before "deploy:set_current_revision_time", "git:set_current_revision_time"
  end
`}
          />
          <p>プラグインも同じ方法でタスクを加えます。capistrano-bundler と capistrano-rails は次のように登録しています。</p>
          <Code
            lang="ruby"
            title="capistrano-bundler 2.2.0 の hooks.cap と、capistrano-rails 1.7.0 の assets.rake・migrations.rake（抜粋）"
            href={`${CRAILS}/lib/capistrano/tasks/assets.rake`}
            code={`
# capistrano-bundler: lib/capistrano/tasks/hooks.cap
before 'deploy:updated', 'bundler:install'
before 'deploy:reverted', 'bundler:install'

# capistrano-rails: lib/capistrano/tasks/assets.rake
after 'deploy:updated', 'deploy:compile_assets'
after 'deploy:updated', 'deploy:cleanup_assets'
after 'deploy:updated', 'deploy:normalize_assets'
after 'deploy:reverted', 'deploy:rollback_assets'

# capistrano-rails: lib/capistrano/tasks/migrations.rake
after 'deploy:updated', 'deploy:migrate'
`}
          />
          <p>
            capistrano-rbenv と capistrano-bundler は、ステージのタスク（<code>production</code>）の後に、コマンドの前置きを準備するタスクを加えます。capistrano3-puma は <code>deploy:published</code> の後に Puma の再起動を加え、capistrano-sidekiq は複数の段階に Sidekiq の操作を加えます
            <Ref n={12} />
            <Ref n={13} />
            <Ref n={14} />
            <Ref n={15} />
            <Ref n={16} />。
          </p>
          <Figure n={`${F}-2`} title="配備の段階と、プラグインが加えるタスク" caption="Capistrano 3.20.1 と、capistrano-rbenv 2.2.0・capistrano-bundler 2.2.0・capistrano-rails 1.7.0・capistrano3-puma 8.1.0・capistrano-sidekiq 3.2.0 のソースをもとにまとめた図。">
            <DeployFlowFigure />
          </Figure>
          <p>
            図{F}-2は本体の処理とプラグインの処理がどの段階で実行されるかを1枚で見るために置きました。左の列を上から読むと時間の順になり、中央の列が本体、右の列がプラグインの処理です。<code>before:</code> はその段階の前、<code>after:</code> は後に実行されます。
            色を付けた <code>publishing</code> で <code>current</code> が新しいリリースを指し、それより上の処理は稼働中のリリースに手を加えずに新しいリリースを準備します。
          </p>
          <h3>current の切り替え</h3>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/deploy.rake の deploy:symlink:release（Capistrano 3.20.1）"
            href={`${CAP}/lib/capistrano/tasks/deploy.rake`}
            code={`
    desc "Symlink release to current"
    task :release do
      on release_roles :all do
        tmp_current_path = release_path.parent.join(current_path.basename)
        execute :ln, "-s", release_path, tmp_current_path
        execute :mv, tmp_current_path, current_path.parent
      end
    end
`}
          />
          <p>
            新しいリリースへのリンクを <code>releases/current</code> にいったん作り、それを <code>/srv/articles</code> に <code>mv</code> します。同じファイルシステムの中の <code>mv</code> はファイル名を付け替える操作（rename）なので、<code>current</code> が無い瞬間を作らずにリンク先が替わります。
          </p>
          <h3>実際の配備のログ</h3>
          <p>
            次はマイグレーションを1つ加えたコミットを配備したときの出力の抜粋です。段階ごとに経過時間とタスク名が出て、その下に配備先で実行したコマンドが番号付きで並びます。チェックマーク（✔）の行はコマンドを実行した台とかかった時間です（一部の ✔ の行を省きました）。
          </p>
          <Code
            lang="text"
            title="USER=dev bundle exec cap production deploy の出力（抜粋）"
            code={`
00:00 git:create_release
      01 mkdir -p /srv/articles/releases/20261120093914
      02 git archive main | /usr/bin/env tar -x -f - -C /srv/articles/releases/20261120093914
00:00 deploy:set_current_revision
      01 echo "967f743f452786da4a0eb65f450a96ca2b8a1e70" > REVISION
（中略：shared へのリンクと bundle config）
00:02 bundler:install
      The Gemfile's dependencies are satisfied, skipping installation
      The Gemfile's dependencies are satisfied, skipping installation
00:02 deploy:assets:precompile
      01 $HOME/.rbenv/bin/rbenv exec bundle exec rake assets:precompile
    ✔ 01 deploy@app2 1.691s
    ✔ 01 deploy@app1 1.816s
00:04 deploy:assets:backup_manifest
      01 mkdir -p /srv/articles/releases/20261120093914/assets_manifest_backup
      02 cp /srv/articles/releases/20261120093914/public/assets/.manifest.json /srv/articles/releases/20261120093914/assets_manifest_backup
00:04 deploy:migrate
      [deploy:migrate] Checking changes in db
      [deploy:migrate] Run \`rake db:migrate\`
00:04 deploy:migrating
      01 $HOME/.rbenv/bin/rbenv exec bundle exec rake db:migrate
      01 == 20261120093913 AddBodyToArticles: migrating ================================
      01 -- add_column(:articles, :body, :text)
    ✔ 01 deploy@app1 1.846s
00:06 deploy:symlink:release
      01 ln -s /srv/articles/releases/20261120093914 /srv/articles/releases/current
      02 mv /srv/articles/releases/current /srv/articles
00:06 puma:phased_restart
      01 $HOME/.rbenv/bin/rbenv exec bundle exec pumactl -S /srv/articles/shared/tmp/pids/puma.state phased-restart
      01 Command phased-restart sent success
      01 Command phased-restart sent success
00:09 deploy:cleanup
      Keeping 3 of 4 deployed releases on app1
      Keeping 3 of 4 deployed releases on app2
      01 rm -rf /srv/articles/releases/20261120093658
00:09 deploy:log_revision
      01 echo "Branch main (at 967f743f452786da4a0eb65f450a96ca2b8a1e70) deployed as release 20261120093914 by dev" >> /srv/articles/revisions.log
`}
          />
          <ul>
            <li>
              <code>bundler:install</code> は先に <code>bundle check</code> を実行し、必要な gem がそろっていれば <code>bundle install</code> を省きます。
            </li>
            <li>
              アセットは <code>web</code> を持つ app1 と app2 の両方で作られ、マイグレーションは <code>primary(:db)</code> の app1 だけで実行されています。
            </li>
            <li>
              <code>conditionally_migrate</code> を有効にすると、新しいリリースと <code>current</code> の <code>db</code> ディレクトリを <code>diff -qr</code> で比べ、違いがあるときだけ <code>db:migrate</code> を実行します。比べる範囲は <code>db/migrate</code> だけでなく、<code>db</code> ディレクトリ全体です。
              マイグレーションを含まない前の配備では <code>Skip `deploy:migrate` (nothing changed in db)</code> と表示されて省かれました
              <Ref n={13} />。
            </li>
            <li>
              <code>puma:phased_restart</code> はこの実行例のために作った自作のタスクです（<ChapterLink n={32} section="custom-tasks">独自タスクの書き方</ChapterLink>）。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'shared-files',
      title: 'linked_files・linked_dirs と shared の中身',
      body: (
        <>
          <p>
            リリースは配備のたびに新しく作られるので、そこに置いたファイルは次のリリースから見えません。リポジトリに入れないファイルや、リリースをまたいで残したいディレクトリは <code>shared/</code> に置き、各リリースからリンクします。
            リリースのディレクトリからの相対パスで、ファイルは <code>linked_files</code>、ディレクトリは <code>linked_dirs</code> に書きます
            <Ref n={1} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">パス</th>
                  <th scope="col">shared に置く理由</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>config/master.key</code>（環境別なら <code>config/credentials/production.key</code>）</td>
                  <td>credentials を復号する鍵で、リポジトリに入れない</td>
                </tr>
                <tr>
                  <td><code>log</code></td>
                  <td>ファイルに書くログを、リリースを替えても続けて残す</td>
                </tr>
                <tr>
                  <td><code>storage</code></td>
                  <td>Active Storage のローカルのディスクの保存先。SQLite を使う場合はその DB ファイル</td>
                </tr>
                <tr>
                  <td><code>tmp/pids</code>・<code>tmp/sockets</code>・<code>tmp/cache</code></td>
                  <td>PID ファイル、Puma の状態ファイルと制御用ソケット、キャッシュをリリースの間で引き継ぐ</td>
                </tr>
                <tr>
                  <td><code>public/system</code></td>
                  <td>アップロードしたファイルを <code>public/</code> の下に保存するアプリケーションの保存先</td>
                </tr>
                <tr>
                  <td><code>public/assets</code></td>
                  <td>capistrano-rails が自動で加える。切り替えの前に描画したページが参照する古いアセットも残す</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            gem の置き場所 <code>shared/bundle</code> は <code>linked_dirs</code> ではなく、Bundler の設定 <code>BUNDLE_PATH</code> で指定します（
            <ChapterLink n={32} section="ruby-gems">Ruby と gem をそろえる</ChapterLink>）。
          </p>
          <Code
            lang="text"
            title="新しいリリースの中のリンク（app1、ls -l の抜粋）"
            code={`
log -> /srv/articles/shared/log
storage -> /srv/articles/shared/storage
config/master.key -> /srv/articles/shared/config/master.key
public/assets -> /srv/articles/shared/public/assets
public/system -> /srv/articles/shared/public/system
tmp/cache -> /srv/articles/shared/tmp/cache
tmp/pids -> /srv/articles/shared/tmp/pids
tmp/sockets -> /srv/articles/shared/tmp/sockets
`}
          />
          <p>
            リンクは <code>updating</code> の段階の <code>deploy:symlink:shared</code> が作ります。<code>linked_dirs</code> や <code>linked_files</code> に書いたパスがリポジトリにも入っていると、リリースの中のそのディレクトリやファイルは削除されてリンクに置き換わります
            <Ref n={7} />。
          </p>
          <h3>deploy:check で確かめること</h3>
          <p>
            <code>deploy:check</code> は <code>starting</code> の段階で毎回実行され、単独でも実行できます。<code>git ls-remote</code> でリポジトリに接続できるかを確かめ、<code>shared/</code>・<code>releases/</code>・<code>linked_dirs</code> のディレクトリを作り、<code>linked_files</code> のファイルが <code>shared/</code> にあるかを確かめます。
            初めての配備の前に実行すると、置き忘れたファイルが分かります
            <Ref n={7} />。
          </p>
          <Code
            lang="text"
            title="bundle exec cap production deploy:check の出力（master.key を置く前、抜粋）"
            code={`
00:00 git:check
      01 git ls-remote git://ctl/articles.git HEAD
      01 db1b92cddbdaf4f687985b1a4129648b42a10f04	HEAD
00:00 deploy:check:directories
      01 mkdir -p /srv/articles/shared /srv/articles/releases
00:00 deploy:check:linked_dirs
      01 mkdir -p /srv/articles/shared/log /srv/articles/shared/storage /srv/articles/shared/tmp/pids （略） /srv/articles/shared/public/assets
00:00 deploy:check:make_linked_dirs
      01 mkdir -p /srv/articles/shared/config
00:00 deploy:check:linked_files
      ERROR linked file /srv/articles/shared/config/master.key does not exist on app1
      ERROR linked file /srv/articles/shared/config/master.key does not exist on app2
`}
          />
          <p>
            <code>deploy:check</code> はディレクトリを作りますが、<code>master.key</code> のような秘密の値を含むファイルは作りません。各台の <code>shared/config/master.key</code> に権限0600で置く作業は、構成管理ツールや手作業で行います。実行例では <code>scp</code> で置いてから、もう一度 <code>deploy:check</code> を実行しました。
          </p>
          <p>
            環境変数 <code>RAILS_MASTER_KEY</code> があれば、Rails は鍵のファイルよりその値を優先します。<code>bin/rails credentials:edit --environment production</code> で作る環境別の credentials では、鍵が <code>config/credentials/production.key</code> になるので、<code>linked_files</code> にもそのパスを書きます
            <Ref n={18} />（<ChapterLink n={21} section="secrets">secret_key_base と credentials</ChapterLink>）。
          </p>
          <h3>shared は台ごとにある</h3>
          <p>
            <code>shared/</code> は台ごとにあり、ほかの台とは共有されません。実行例の1回目の配備では、トップページで記事の件数を数えていたため、app2 だけが 500 を返し、ログに <code>SELECT COUNT(*) FROM "articles"</code> の失敗が出ました。
            マイグレーションは app1 だけで実行されるので、app2 の <code>shared/storage</code> にある SQLite の DB には表が無かったためです。全台から接続する MySQL を使う本番の構成では、この問題は起きません。
          </p>
          <p>
            アップロードしたファイルも同じで、app1 の <code>shared/storage</code> に保存した画像は app2 から読めません。複数台で同じファイルを読むには、Active Storage の保存先を S3 などのオブジェクトストレージにします（<ChapterLink n={19} section="upload">ファイルのアップロードと保存先</ChapterLink>）。
            1台の構成でも、アップロード先を <code>linked_dirs</code> に入れ忘れると、新しいリリースからはそれまでのファイルが見えません。ファイルは古いリリースの中に残りますが、<code>keep_releases</code> を超えるとリリースごと削除されます。
          </p>
          <p>
            <code>shared/public/assets</code> には、配備のたびに新しいアセットが足されます。<code>set :keep_assets, 2</code> のように設定すると、配備のたびに <code>assets:clean</code> で古いアセットを消します。既定値は <code>nil</code> で、消しません
            <Ref n={13} />。Nginx が <code>current/public</code> からアセットを配る設定は、<ChapterLink n={24} section="static">静的ファイルの配信</ChapterLink>で扱いました。
          </p>
        </>
      ),
    },
    {
      id: 'ruby-gems',
      title: 'Ruby と gem をそろえる',
      body: (
        <>
          <h3>rbenv で Ruby を選ぶ</h3>
          <p>
            SSHKit は、ログインシェルでも対話型でもない SSH のセッションでコマンドを実行します。そのため <code>~/.bashrc</code> で <code>PATH</code> に足した rbenv の設定は読み込まれず、<code>ruby</code> や <code>bundle</code> が OS の別の Ruby を指すことがあります
            <Ref n={11} />。capistrano-rbenv は Ruby に関わるコマンドの前に <code>rbenv exec</code> を付け、使う Ruby を環境変数で渡します。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/rbenv.rake（capistrano-rbenv 2.2.0、抜粋）"
            href={`${RBENV}/lib/capistrano/tasks/rbenv.rake`}
            code={`
  task :map_bins do
    SSHKit.config.default_env.merge!({ rbenv_root: fetch(:rbenv_path), rbenv_version: fetch(:rbenv_ruby) })
    rbenv_prefix = fetch(:rbenv_prefix, proc { "#{fetch(:rbenv_path)}/bin/rbenv exec" })
    SSHKit.config.command_map[:rbenv] = "#{fetch(:rbenv_path)}/bin/rbenv"

    fetch(:rbenv_map_bins).uniq.each do |command|
      SSHKit.config.command_map.prefix[command.to_sym].unshift(rbenv_prefix)
    end
  end
end

Capistrano::DSL.stages.each do |stage|
  after stage, 'rbenv:validate'
  after stage, 'rbenv:map_bins'
end
`}
          />
          <p>
            rbenv の場所は、<code>rbenv_type</code> が <code>:user</code> なら <code>$HOME/.rbenv</code>、<code>:system</code> なら <code>/usr/local/rbenv</code> です。前置きが付くのは <code>rbenv_map_bins</code> の <code>rake gem bundle ruby rails</code> で、capistrano3-puma と capistrano-sidekiq が <code>puma</code>・<code>pumactl</code>・<code>sidekiq</code> を足します
            <Ref n={14} />
            <Ref n={15} />
            <Ref n={16} />。実行例のログの <code>$HOME/.rbenv/bin/rbenv exec bundle exec rake assets:precompile</code> は、この前置きと capistrano-bundler の <code>bundle exec</code> が付いた形です。
          </p>
          <p>
            <code>rbenv:validate</code> は <code>rbenv_ruby</code> の Ruby が配備先に入っているかを確かめ、入っていないバージョンを指定すると次のように止まります。
          </p>
          <Code
            lang="text"
            title="rbenv_ruby を入っていない 4.0.10 にして deploy:check を実行した結果"
            code={`
00:00 rbenv:validate
      WARN  rbenv: 4.0.10 is not installed or not found in $HOME/.rbenv/versions/4.0.10 on app1
`}
          />
          <p>
            <code>rbenv_ruby</code> の値は環境変数 <code>RBENV_VERSION</code> として渡り、rbenv はリリースの <code>.ruby-version</code> よりこちらを優先します。<code>rbenv_ruby</code> を書かなければ、配備先の rbenv が <code>.ruby-version</code> などからバージョンを決めます
            <Ref n={14} />
            <Ref n={19} />。README は <code>File.read('.ruby-version').strip</code> で値を読む例を示していますが、読むのは cap を実行した手元のファイルで、配備するコミットのファイルではありません。手元と違うブランチを配備すると、2つの値がずれることがあります。
          </p>
          <h3>gem の置き場所</h3>
          <p>
            capistrano-bundler の <code>bundler:config</code> は新しいリリースの <code>.bundle/config</code> に Bundler の設定を書きます。実行例では次の設定が入りました。
          </p>
          <Code
            lang="text"
            title="/srv/articles/current/.bundle/config"
            code={`
BUNDLE_DEPLOYMENT: "true"
BUNDLE_PATH: "/srv/articles/shared/bundle"
BUNDLE_WITHOUT: "development:test"
`}
          />
          <p>
            gem は <code>shared/bundle/ruby/4.0.0</code> のように、Ruby の ABI のバージョンごとのディレクトリに入り、リリースが替わっても同じディレクトリを使います。実行例の1回目の配備では <code>bundle install --jobs 4 --quiet</code> に app1 で約72秒、app2 で約73秒かかりました。
          </p>
          <p>
            Ruby 4.0 に付属する Bundler 4.0.20 では、<code>bundle_version</code> を既定の2のままにすると <code>bundle config --local deployment true</code> の形で設定し、サブコマンドの無い <code>bundle config</code> は非推奨だという警告が出ました。
            <code>set :bundle_version, 4</code> にすると <code>bundle config set --local …</code> の形になり、警告は出なくなりました
            <Ref n={12} />。
          </p>
          <h3>Ruby を上げる配備の手順</h3>
          <p>
            Ruby のバージョンを上げるときは、Capistrano の外の作業と配備を次の順で進めます。Puma 側の切り替え方は<ChapterLink n={23} section="ruby-upgrade">Ruby 更新時の Puma とトラフィックの切り替え</ChapterLink>で扱ったので、ここでは Capistrano のタスクとのつなぎ方を見ます。
          </p>
          <ol>
            <li>
              新しい Ruby を構成管理ツールなどで全台に入れます。切り戻せるように古い Ruby は残します。入れ忘れた台があれば、配備の最初の <code>rbenv:validate</code> で止まります。
            </li>
            <li>
              <code>.ruby-version</code>、Gemfile の <code>ruby</code> の指定、<code>Gemfile.lock</code> を新しい Ruby に合わせてコミットし、<code>rbenv_ruby</code> も同じ値にします。
            </li>
            <li>
              配備すると、<code>bundler:install</code> が新しい ABI のディレクトリ（3.4 から 4.0 なら <code>shared/bundle/ruby/4.0.0</code>）にすべての gem を入れます。初回の配備と同じくらい時間がかかり、配備先の CPU も使います。アセットの作成とマイグレーションも新しい Ruby で実行されます。
            </li>
            <li>
              Puma はマスターから起動し直します。phased restart で作られるワーカーは古い Ruby のマスターから fork されるので、古い Ruby のままです。古い Ruby 用の gem の置き場所に新しい <code>Gemfile.lock</code> の gem が無ければ、ワーカーの起動にも失敗します。
              capistrano3-puma を使うなら、この配備だけ <code>puma_phased_restart</code> を無効にして <code>systemctl restart</code> を使い、ALB の配下なら1台ずつ外して起動し直します（<ChapterLink n={32} section="multi-host">複数台での実行と ALB</ChapterLink>）。
            </li>
            <li>
              Sidekiq は capistrano-sidekiq が停止してから起動するので、新しい Ruby で動きます。起動後はログやアプリケーションの応答で、Ruby のバージョンを確かめます。
            </li>
          </ol>
          <Callout kind="note" title="systemd のユニットが選ぶ Ruby">
            capistrano3-puma のユニットのテンプレートでは、<code>ExecStart</code> は <code>rbenv exec bundle exec puma</code> の形で書き出され、<code>rbenv_ruby</code> の値（<code>RBENV_VERSION</code>）は入りません。<code>puma_service_unit_env_vars</code> で指定しなければ、Puma の Ruby は作業ディレクトリ <code>current</code> の <code>.ruby-version</code> で決まります。
            Capistrano のタスクと Puma で同じ Ruby を使うように、<code>rbenv_ruby</code> と <code>.ruby-version</code> は同じ値にします
            <Ref n={15} />。
          </Callout>
        </>
      ),
    },
    {
      id: 'restart-services',
      title: 'Puma と Sidekiq の再起動を配備につなぐ',
      body: (
        <>
          <p>
            <code>current</code> を新しいリリースに替えても、起動済みの Puma と Sidekiq は古いコードで動き続けます。deploy.rake には <code>deploy:restart</code> という空のタスクがありますが、配備の流れからは呼ばれません。再起動はプラグインか自作のタスクで、<code>deploy:published</code> の後に加えます
            <Ref n={7} />。
          </p>
          <h3>capistrano3-puma</h3>
          <Code
            lang="ruby"
            title="capistrano3-puma 8.1.0 を使う設定"
            code={`
# Capfile（capistrano/rbenv より後に読み込む）
require "capistrano/puma"
install_plugin Capistrano::Puma
install_plugin Capistrano::Puma::Systemd

# config/deploy.rb
set :puma_phased_restart, true   # 配備のたびに phased restart を使う
`}
          />
          <p>
            capistrano3-puma の現行版は Puma を systemd のサービスとして操作します。最初に各台で <code>cap production puma:install</code> を一度実行し、ユニットファイルを書き出して有効にします。既定ではユーザー単位のユニットを <code>~/.config/systemd/user/</code> に置き、deploy ユーザーがログアウトしてもサービスが動き続けるように <code>sudo loginctl enable-linger</code> を実行します。
            <code>set :puma_systemctl_user, :system</code> にすると、<code>/etc/systemd/system/</code> のユニットを sudo で操作します。ユニットの名前は <code>articles_puma_production</code> のように「アプリケーション名_puma_ステージ名」です
            <Ref n={15} />。
          </p>
          <p>
            書き出されるユニットは <code>Type=notify</code> で、<code>WorkingDirectory</code> が <code>current</code>、<code>ExecReload</code> が <code>/bin/kill -USR1 $MAINPID</code> です。Puma は <code>SIGUSR1</code> を受けると phased restart を行います（<ChapterLink n={23} section="puma-commands">Puma のコマンドと再起動方式</ChapterLink>）。
            Puma の操作に使うロールは既定で <code>web</code> です
            <Ref n={15} />。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/systemd.rake（capistrano3-puma 8.1.0、抜粋）"
            href={`${CPUMA}/lib/capistrano/tasks/systemd.rake`}
            code={`
  desc 'Restarts or reloads Puma service via systemd'
  task :smart_restart do
    if fetch(:puma_phased_restart)
      invoke 'puma:reload'
    else
      invoke 'puma:restart'
    end
  end

  desc 'Restart Puma service via systemd'
  task :restart do
    on roles(fetch(:puma_role)) do
      git_plugin.execute_systemd("restart", fetch(:puma_service_unit_name))
    end
  end
`}
          />
          <p>
            <code>Capistrano::Puma::Systemd</code> は <code>deploy:published</code> の後に <code>puma:smart_restart</code> を登録します。<code>puma_phased_restart</code> が有効なら <code>puma:reload</code> で <code>systemctl reload</code>（phased restart）を、無効なら <code>puma:restart</code> で <code>systemctl restart</code>（停止して起動）を実行します。
            既定値は無いので、何も書かなければ <code>systemctl restart</code> です。<code>puma:reload</code> は、サービスが動いていなければ <code>restart</code> に切り替えます
            <Ref n={15} />。
          </p>
          <p>
            phased restart を使えるのは、<code>preload_app!</code> を無効にし、<code>prune_bundler</code> を設定した、ワーカーが2つ以上のクラスタの構成です。Puma 本体を更新するときや Ruby を上げるときは <code>restart</code> を使います。どちらの場合も、Puma が起動しただけでは、アプリケーションが正しく応答するかは分からないので、応答の確認は自作のタスクで加えます。
          </p>
          <h3>自作のタスクで systemctl を呼ぶ</h3>
          <p>
            プラグインを使わず、構成管理ツールで作った <code>puma.service</code> を自作のタスクで操作することもできます。次の例は <code>app</code> の台で1台ずつ <code>systemctl reload</code> を実行します。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/puma.rake（systemd を使う構成の例）"
            code={`
namespace :puma do
  desc "Puma のワーカーを順に入れ替える"
  task :reload do
    on roles(:app), in: :sequence, wait: 5 do
      execute :sudo, :systemctl, :reload, "puma.service"
    end
  end
end

after "deploy:published", "puma:reload"
`}
          />
          <p>
            Capistrano 本体の既定のタスクは sudo を使いません。sudo を使う場合は、deploy ユーザーがパスワードなしで実行できるコマンドを、sudoers で <code>systemctl reload puma.service</code> などに限ります。説明書もパスワードなしの sudo を安易に許可しないよう書いています
            <Ref n={5} />。この例と前の capistrano3-puma の設定は、systemd の無いこの章の Docker の環境では動かしていません。
          </p>
          <h3>Sidekiq の停止と起動の順序</h3>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/sidekiq.rake（capistrano-sidekiq 3.2.0、抜粋）"
            href={`${CSIDEKIQ}/lib/capistrano/tasks/sidekiq.rake`}
            code={`
namespace :sidekiq do
  task :add_default_hooks do
    after 'deploy:starting', 'sidekiq:quiet' if Rake::Task.task_defined?('sidekiq:quiet')
    after 'deploy:updated', 'sidekiq:stop'
    after 'deploy:reverted', 'sidekiq:stop'
    after 'deploy:published', 'sidekiq:start'
    after 'deploy:published', 'sidekiq:mark_deploy' if fetch(:sidekiq_mark_deploy, false)
    after 'deploy:failed', 'sidekiq:restart'
  end
`}
          />
          <p>
            capistrano-sidekiq 3.2.0 も Sidekiq を systemd のサービスとして操作し、<code>worker</code> ロールの台で実行します。capistrano3-puma と capistrano-sidekiq を加えた設定で <code>cap production deploy --dry-run</code> を実行すると、次のコマンドが並びました。<code>--dry-run</code> は実行するコマンドを表示するだけで、配備先では実行しません
            <Ref n={16} />。
          </p>
          <Code
            lang="text"
            title="2つのプラグインを加えた cap production deploy --dry-run の出力（抜粋）"
            code={`
00:00 sidekiq:quiet
      01 /bin/systemctl --user kill -s TSTP articles_sidekiq_production
（中略：コードの展開、bundler:install、アセット）
00:00 deploy:migrate
      [deploy:migrate] Checking changes in db
      [deploy:migrate] Skip \`deploy:migrate\` (nothing changed in db)
00:00 sidekiq:stop
      01 /bin/systemctl --user stop articles_sidekiq_production.service
00:00 deploy:symlink:release
      01 ln -s /srv/articles/releases/20261120094836 /srv/articles/releases/current
      02 mv /srv/articles/releases/current /srv/articles
00:00 puma:restart
      01 /bin/systemctl --user restart articles_puma_production
00:00 sidekiq:start
      01 /bin/systemctl --user start articles_sidekiq_production.service
`}
          />
          <p>
            Sidekiq は <code>TSTP</code> を受けると新しいジョブの取り出しをやめ、処理中のジョブは続けます。<code>TERM</code> を受けると起動時の <code>-t</code> の時間（既定は25秒）のうちに終了し、終わらなかったジョブは Redis に戻されて、後で再び実行されます
            <Ref n={17} />（<ChapterLink n={18} section="job-operations">Sidekiq の停止・監視とキューの移行</ChapterLink>）。capistrano-sidekiq の順序から、次のことが分かります。
          </p>
          <ul>
            <li>
              <code>starting</code> の直後から新しいジョブを取り出さないので、gem の導入、アセットの作成、マイグレーションの間はジョブが Redis にたまります。
            </li>
            <li>
              <code>sidekiq:stop</code> から <code>sidekiq:start</code> までは Sidekiq のプロセスがありません。この間に積まれたジョブは、新しいコードの Sidekiq が処理します。
            </li>
            <li>
              古いコードの Web が積んだジョブを新しいコードのワーカーが処理し、phased restart の間は新旧の Web が同時にジョブを積みます。ジョブのクラス名や引数を変えるときは、新旧どちらのコードでも処理できる形にします（<ChapterLink n={27} section="deploy-order">列名を変えるときは複数回の変更に分ける</ChapterLink>）。
            </li>
            <li>
              停止の期限を過ぎたジョブは再実行されるので、何度実行しても結果が変わらないように書きます（<ChapterLink n={18} section="idempotency" />）。
            </li>
            <li>
              配備が失敗すると <code>deploy:failed</code> の後に <code>sidekiq:restart</code> が実行され、その時点の <code>current</code> のコードで Sidekiq が起動します。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'custom-tasks',
      title: '独自タスクの書き方',
      body: (
        <>
          <p>
            自作のタスクは <code>lib/capistrano/tasks/*.rake</code> に Rake の書き方で置きます。タスクの中で <code>on</code> に実行先を渡し、ブロックの中で SSHKit のメソッドを使ってコマンドを組み立てます。
            次の例は、公開後に各台の Puma が <code>current</code> の <code>REVISION</code> と同じコミットを返すようになったかを確かめるタスクです。実行例のトップページはリリースの名前とコミットの先頭7文字を <code>release=… revision=…</code> の形で返すようにしてあります。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/verify.rake（実行例で使ったもの）"
            code={`
namespace :deploy do
  desc "current の REVISION を返すようになるまで各ホストで待つ"
  task :verify_release do
    next if dry_run?
    on roles(:app), in: :sequence do |host|
      expected = capture(:cat, current_path.join("REVISION"))[0, 7]
      verified = false
      15.times do
        body = capture(:curl, "-s", "http://127.0.0.1:3000/", raise_on_non_zero_exit: false)
        verified = body.include?("revision=#{expected}")
        break if verified
        sleep 1
      end
      raise "#{host}: revision=#{expected} の応答を確認できません" unless verified
      info "#{host}: revision=#{expected} を確認しました"
    end
  end
end

after "puma:phased_restart", "deploy:verify_release"
`}
          />
          <Code
            lang="text"
            title="配備の出力（このタスクの部分）"
            code={`
00:09 deploy:verify_release
      app1: revision=12cef3c を確認しました
      app2: revision=12cef3c を確認しました
`}
          />
          <p>
            <code>capture</code> はコマンドの標準出力を文字列で返し、<code>raise</code> で例外を出すと配備はそこで止まります。<code>desc</code> を付けたタスクは <code>cap -T</code> の一覧に出ます。SSHKit の主なメソッドは次のとおりです
            <Ref n={11} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">メソッド</th>
                  <th scope="col">何をするか</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>execute(:cmd, 引数…)</code></th>
                  <td>コマンドを実行する。終了ステータスが0以外なら例外を出す</td>
                </tr>
                <tr>
                  <th scope="row"><code>test(…)</code></th>
                  <td>コマンドを実行し、成功したかを true・false で返す。例外は出さない</td>
                </tr>
                <tr>
                  <th scope="row"><code>capture(…)</code></th>
                  <td>コマンドの標準出力を返す。前後の空白は取り除く</td>
                </tr>
                <tr>
                  <th scope="row"><code>within(パス) {"{ … }"}</code></th>
                  <td>ブロックの中のコマンドの前に <code>cd パス &amp;&amp;</code> を付ける。ディレクトリが無ければ例外を出す</td>
                </tr>
                <tr>
                  <th scope="row"><code>with(rails_env: "production") {"{ … }"}</code></th>
                  <td>環境変数を設定してコマンドを実行する</td>
                </tr>
                <tr>
                  <th scope="row"><code>as(:user) {"{ … }"}</code></th>
                  <td><code>sudo -u</code> で別の利用者として実行する</td>
                </tr>
                <tr>
                  <th scope="row"><code>upload!</code>・<code>download!</code></th>
                  <td>ファイルを転送する</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <code>within</code>・<code>with</code>・<code>as</code> と rbenv や bundler の前置きが付くのは、<code>execute</code> などの最初の引数をシンボルで渡したときだけです。<code>execute "bundle exec rake db:migrate"</code> のように空白を含む1つの文字列で渡すと、SSHKit はその文字列をそのまま実行します
            <Ref n={11} />。次は実行例の <code>log/capistrano.log</code> に残った記録です。
          </p>
          <Code
            lang="text"
            title="log/capistrano.log（抜粋）"
            code={`
 DEBUG [9aab27f2] Command: cd /srv/articles/current && ( export RBENV_ROOT="$HOME/.rbenv" RBENV_VERSION="4.0.9" RAILS_ENV="production" ; $HOME/.rbenv/bin/rbenv exec bundle exec pumactl -S /srv/articles/shared/tmp/pids/puma.state phased-restart )
 DEBUG [4f2295a6] Command: ( export RBENV_ROOT="$HOME/.rbenv" RBENV_VERSION="4.0.9" ; /usr/bin/env curl -s http://127.0.0.1:3000/ )
`}
          />
          <p>
            1行目は後で示す puma.rake の <code>execute :bundle</code> の記録です。<code>within current_path</code> が <code>cd</code> に、<code>with rails_env:</code> が <code>RAILS_ENV</code> の <code>export</code> に、<code>bundle</code> が capistrano-rbenv の前置き付きのコマンドになっています。2行目は verify.rake の <code>curl</code> で、前置きの無いコマンドは <code>/usr/bin/env curl</code> になります。
          </p>
          <p>
            次の図は、1行目のコマンドを前から順に区切って縦に並べたものです。右の列を上からつなげると1行目になります。左の列は、それぞれの部分を作ったコードや設定です。
          </p>
          <Figure title="capistrano.log の1行目と、各部分を作ったコード" caption="上の capistrano.log の1行目と、puma.rake・rbenv.rake のコードをもとにした図。灰色の箱は puma.rake に書いた部分、橙の箱は capistrano-rbenv の rbenv:map_bins が設定した部分。括弧 ( ) を省き、puma.state までのパスを … で短くした。">
            <CommandPartsFigure />
          </Figure>
          <h3>ほかのタスクを呼ぶ</h3>
          <p>
            タスクの中から別のタスクを実行するには <code>invoke "deploy:check"</code> と書きます。1回の cap の実行の中では同じタスクは1回しか実行されず、2回目の <code>invoke</code> は警告を出して実行を省きます。もう一度実行させるには <code>invoke!</code> を使います。
            <code>before</code> や <code>after</code> の1つ目に渡すタスクは、その行を読み込む時点で定義済みである必要があります。2つ目に渡すタスクは実行の時点で探され、見つからなければ例外になります
            <Ref n={10} />。
          </p>
          <h3>何度実行しても同じ結果になるタスク</h3>
          <p>
            配備は、失敗した後に同じ内容でやり直すことがあります。途中まで処理が進んだ台でもう一度実行しても困らないように、タスクを書きます。本体のタスクも <code>mkdir -p</code> でディレクトリを作り、リンクがすでにあれば作り直さないようにしています。
            次の例は実行例で Puma を操作するために作ったタスクです。この環境には systemd が無いので、Puma が動いていなければ起動し、動いていれば <code>pumactl phased-restart</code> を送ります。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/puma.rake（実行例で使ったもの）"
            code={`
namespace :puma do
  desc "Puma のワーカーを順に入れ替える（未起動なら起動する）"
  task :phased_restart do
    on roles(:app), in: :sequence, wait: 2 do
      within current_path do
        with rails_env: fetch(:rails_env) do
          if test("[ -S #{shared_path}/tmp/pids/pumactl.sock ]")
            execute :bundle, :exec, :pumactl, "-S", shared_path.join("tmp/pids/puma.state"), "phased-restart"
          else
            execute :bundle, :exec, :setsid, :puma, "-C", "config/puma.rb",
                    ">>", shared_path.join("log/puma.log"), "2>&1", "<", "/dev/null", "&"
          end
        end
      end
    end
  end
end

after "deploy:published", "puma:phased_restart"
`}
          />
          <p>
            Puma の制御用ソケットがあるかを <code>test</code> で確かめ、結果によってコマンドを変えています。1回目の配備では Puma を起動し、2回目以降は phased restart を送りました。この Puma は <code>config/puma.rb</code> で <code>directory</code> を <code>/srv/articles/current</code> にし、状態ファイルと制御用ソケットを <code>shared/tmp/pids</code> に置いています（
            <ChapterLink n={23} section="puma-commands">Puma のコマンドと再起動方式</ChapterLink>）。
          </p>
        </>
      ),
    },
    {
      id: 'operations',
      title: '実行時の操作と確認',
      body: (
        <>
          <Code
            lang="bash"
            title="よく使う cap のコマンド"
            code={`
bundle exec cap -T                                # タスクの一覧
bundle exec cap production deploy:check           # 接続と共有ファイルの確認
bundle exec cap production deploy --dry-run       # 実行するコマンドを表示する
bundle exec cap production doctor                 # 設定と gem のバージョンを表示する
BRANCH=12cef3c bundle exec cap production deploy  # コミットを指定して配備する
bundle exec cap production puma:restart --hosts=app2
bundle exec cap production deploy:rollback
`}
          />
          <p>
            <code>cap -T</code> は <code>desc</code> の付いたタスクを一覧します。実行例の設定では <code>deploy:*</code>・<code>git:*</code>・<code>bundler:*</code>・<code>doctor:*</code> と自作の <code>puma:phased_restart</code> が並びました。<code>-p</code>（<code>--print-config-variables</code>）を付けて配備すると、始める前に設定の変数をすべて表示します
            <Ref n={10} />。
          </p>
          <h3>--dry-run で確かめられること</h3>
          <p>
            <code>--dry-run</code> は SSHKit のバックエンドを Printer に切り替え、コマンドを表示するだけで配備先には接続しません。段階の順序やフックの並びは確かめられますが、<code>test</code> は常に true を、<code>capture</code> は空の文字列を返すので、その結果で分岐する処理は実際の配備とは別の分岐に進みます
            <Ref n={10} />
            <Ref n={11} />。
          </p>
          <Code
            lang="text"
            title="cap production deploy --dry-run の出力（抜粋）"
            code={`
00:00 deploy:set_current_revision
      01 echo "" > REVISION
（中略）
00:00 bundler:install
      The Gemfile's dependencies are satisfied, skipping installation
      The Gemfile's dependencies are satisfied, skipping installation
`}
          />
          <p>
            <code>REVISION</code> に書く値は <code>capture</code> で得るので空になり、<code>bundle check</code> は <code>test</code> なので成功した扱いです。<code>verify_release</code> は、最初の版では <code>--dry-run</code> のときも <code>curl</code> を15回繰り返し、空の応答に REVISION が含まれないので例外を出して止まりました。そこで先頭に <code>next if dry_run?</code> を加えています。
          </p>
          <h3>doctor と配備するコミットの指定</h3>
          <Code
            lang="text"
            title="cap production doctor:servers と doctor:gems の出力"
            code={`
Servers (2)
    deploy@app1 [:app, :web, :db]
    deploy@app2 [:app, :web]

Gems
    capistrano         3.20.1
    airbrussh          1.6.2
    rake               13.4.2
    sshkit             1.25.1
    net-ssh            8.1.2
    capistrano-bundler 2.2.0
    capistrano-rails   1.7.0
    capistrano-rbenv   2.2.0
`}
          />
          <p>
            <code>doctor</code> はこのほかに、設定の変数の値と Ruby の環境も表示します。配備がうまくいかないときは、まずここでロールと gem のバージョンを確かめます。
          </p>
          <p>
            Git のプラグインは <code>branch</code> の値を <code>git archive</code> と <code>git rev-list</code> にそのまま渡します。<code>repo/</code> はすべてのブランチとタグを持つミラーなので、<code>branch</code> にはタグやコミットのハッシュも指定できます
            <Ref n={8} />。実行例では <code>set :branch, ENV.fetch("BRANCH", "main")</code> にしておき、<code>BRANCH=12cef3c</code> で配備しました。<code>revisions.log</code> には次の行が残りました。
          </p>
          <Code lang="text" code={`Branch 12cef3c (at 12cef3c76a9fc0e299acd66658715e221a4c0f63) deployed as release 20261120094457 by dev`} />
          <h3>ログと同時実行</h3>
          <p>
            画面の出力は要約で、実行したコマンドの全文と出力は手元の <code>log/capistrano.log</code> に残ります。配備が失敗すると、画面に <code>** DEPLOY FAILED</code> と、このログの最後の20行が出ます
            <Ref n={9} />。
          </p>
          <p>
            Capistrano 3.20.1 の <code>deploy</code> には、同時に始まった別の配備を止める処理がありません。2人が同時に配備すると、<code>current</code> の切り替えや Puma の再起動が交互に起きます。配備は CI の決まったジョブか決まった作業用のサーバーから実行します。GitHub Actions なら、<code>concurrency</code> で同じグループのジョブを同時に1つに限れます
            <Ref n={7} />
            <Ref n={22} />。
          </p>
        </>
      ),
    },
    {
      id: 'multi-host',
      title: '複数台での実行と ALB',
      body: (
        <>
          <p>
            <code>on</code> は既定では渡された台のすべてで同時にブロックを実行し、全台が終わるまで次へ進みません。本体のタスクはほとんどがこの既定のまま書かれているので、各段階は全台で同時に進み、<code>publishing</code> の <code>current</code> の切り替えも全台でほぼ同時に起きます。
            実行の仕方は <code>in:</code> で選べます
            <Ref n={11} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">指定</th>
                  <th scope="col">動き</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row"><code>in: :parallel</code>（既定）</th>
                  <td>全台で同時に実行する。台数の上限は無い</td>
                </tr>
                <tr>
                  <th scope="row"><code>in: :sequence, wait: 5</code></th>
                  <td>1台ずつ実行し、台と台の間で <code>wait</code> 秒（既定は2秒）待つ。途中の台で例外が出ると、残りの台では実行しない</td>
                </tr>
                <tr>
                  <th scope="row"><code>in: :groups, limit: 2, wait: 5</code></th>
                  <td><code>limit</code> 台（既定は2台）ずつ同時に実行し、組と組の間で待つ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Git のプラグインは <code>in: :groups</code> と <code>git_max_concurrent_connections</code>（既定は10）で、Git のホストに同時に接続する台数を抑えています
            <Ref n={8} />。
          </p>
          <h3>段階ごとのフックでは止められない例</h3>
          <p>
            実行例では、Puma を1台ずつ入れ替える <code>puma:phased_restart</code> の後に、応答を確かめる <code>deploy:verify_release</code> をフックしていました。トップページで例外を出すコミットを配備すると、次のようになりました。
          </p>
          <Code
            lang="text"
            title="例外を出すコミットを配備したときの出力（抜粋）"
            code={`
00:04 puma:phased_restart
      01 $HOME/.rbenv/bin/rbenv exec bundle exec pumactl -S /srv/articles/shared/tmp/pids/puma.state phased-restart
      01 Command phased-restart sent success
      01 Command phased-restart sent success
（中略）
SSHKit::Runner::ExecuteError: Exception while executing as deploy@app1: app1: revision=c403240 の応答を確認できません (SSHKit::Runner::ExecuteError)
（中略）
** DEPLOY FAILED
`}
          />
          <p>
            <code>pumactl phased-restart</code> は、Puma にシグナルを送った時点で成功を返します。2つのタスクは別々の <code>on</code> なので、app1 と app2 の両方で Puma を入れ替えてから確認が始まりました。確認は app1 で失敗して止まりましたが、このとき app1 も app2 もトップページに 500 を返していました。
            再起動と確認を1台ずつ組にして実行するには、両方を同じ <code>on … in: :sequence</code> のブロックに書きます。
          </p>
          <p>
            次の図は、2つの書き方で処理が進む順を左右に並べたものです。どちらも左の列が app1、右の列が app2 で、丸数字の順に実行されます。破線の枠が1つの <code>on</code> のブロックです。
          </p>
          <Figure title="再起動と確認を別々の on に書く場合と、同じ on に書く場合" caption="左は上の実行例の出力をもとにした図、右は本文の説明をもとにした模式図。どちらも in: :sequence で1台ずつ処理し、例外が出ると残りの台には進まない。台と台の間の wait は省略した。">
            <OnBlocksFigure />
          </Figure>
          <h3>ALB から1台ずつ外して再起動する</h3>
          <p>
            ALB の配下では、再起動する台を先に ALB の転送先から外し、処理中のリクエストが終わるのを待ってから Puma を起動し直します。phased restart を使えない Ruby の更新などで、この手順を使います（<ChapterLink n={25} section="health">ヘルスチェック（/up）</ChapterLink>、
            <ChapterLink n={23} section="ruby-upgrade">Ruby 更新時の Puma とトラフィックの切り替え</ChapterLink>）。次のタスクは cap を実行する端末から AWS CLI で ALB を操作する例です。ALB の無い Docker の環境では動かしていません。
          </p>
          <Code
            lang="ruby"
            title="lib/capistrano/tasks/rolling.rake（AWS CLI で ALB を操作する例）"
            code={`
# config/deploy/production.rb で各台に instance_id を書いておく
#   server "app1", user: "deploy", roles: %w[app web db], instance_id: "i-0aaa1111"
#   set :target_group_arn, "arn:aws:elasticloadbalancing:…:targetgroup/articles/…"

namespace :deploy do
  desc "ALB から1台ずつ外して Puma を起動し直す"
  task :rolling_restart do
    tg = fetch(:target_group_arn)
    on roles(:app), in: :sequence, wait: 10 do |host|
      target = "Id=#{host.properties.fetch(:instance_id)}"
      run_locally do
        execute :aws, :elbv2, "deregister-targets", "--target-group-arn", tg, "--targets", target
        execute :aws, :elbv2, :wait, "target-deregistered", "--target-group-arn", tg, "--targets", target
      end
      execute :sudo, :systemctl, :restart, "puma.service"
      execute :curl, "--retry", "10", "--retry-connrefused", "--retry-delay", "1",
              "-fsS", "-o", "/dev/null", "http://127.0.0.1:3000/up"
      run_locally do
        execute :aws, :elbv2, "register-targets", "--target-group-arn", tg, "--targets", target
        execute :aws, :elbv2, :wait, "target-in-service", "--target-group-arn", tg, "--targets", target
      end
    end
  end
end

after "deploy:published", "deploy:rolling_restart"
`}
          />
          <p>
            <code>server</code> に書いた <code>instance_id</code> のような独自の値は <code>host.properties.fetch(:instance_id)</code> で読めます。<code>run_locally</code> のブロックは、配備先ではなく cap を実行している端末でコマンドを実行します。この2点は実行例のコンテナで ALB を操作しないタスクを作って確かめました。
            <code>aws elbv2 wait target-deregistered</code> は15秒ごとに状態を問い合わせて登録解除が終わるまで待ち、40回確かめても終わらなければ終了ステータス255で終わるので、そこで配備が止まります。<code>target-in-service</code> も同じ間隔で、正常と判定されるまで待ちます
            <Ref n={20} />
            <Ref n={21} />。
          </p>
          <Figure n={`${F}-3`} title="ALB の配下で1台ずつ再起動する" caption="rolling.rake の処理の順序を表した模式図。in: :sequence で1台ずつ処理し、台の間で wait の秒数だけ待つ。">
            <RollingFigure />
          </Figure>
          <p>
            図{F}-3は1台の中の4つの手順と、台から台へ進む順序を分けて示すために置きました。横に並んだ①から④が1台の中の手順で、②の再起動はその台が利用者のリクエストを受けていない間に行います。app1 の④が終わると、矢印に沿って app2 の①へ進みます。
            途中で例外が出るとその台は ALB から外れたまま残り、残りの台には進まないので、原因を調べてから手で ALB に戻すか、前のリリースに切り戻します。
          </p>
          <p>
            capistrano3-puma と組み合わせるときは、<code>install_plugin Capistrano::Puma::Systemd, load_hooks: false</code> のようにフックを読み込まない指定をして、<code>puma:smart_restart</code> が全台で同時に実行されないようにします
            <Ref n={15} />。
          </p>
        </>
      ),
    },
    {
      id: 'capistrano-rollback',
      title: '失敗したときの状態と切り戻し',
      body: (
        <>
          <p>
            配備の途中でタスクが失敗すると、Capistrano はそこで止まり、後の段階のタスクは実行しません。<code>deploy</code> の実行中なら、止まる前に <code>deploy:failed</code> を呼びます。サーバーに何が残るかは、失敗した段階で変わります
            <Ref n={10} />。
          </p>
          <h3>公開の前に失敗したとき</h3>
          <p>
            実行例で、例外を出すマイグレーションを含むコミットを配備しました。<code>deploy:migrating</code> の <code>rake</code> が終了ステータス1を返し、配備は止まりました。
          </p>
          <Code
            lang="text"
            title="失敗した後の app1"
            code={`
$ ls -l /srv/articles/current
lrwxrwxrwx 1 deploy deploy 37 Nov 20 09:39 /srv/articles/current -> /srv/articles/releases/20261120093900
$ ls /srv/articles/releases
20261120093835
20261120093900
20261120094013
$ tail -1 /srv/articles/revisions.log
dev rolled back to release 20261120093900
`}
          />
          <p>
            <code>current</code> は前のリリースを指したままで、Puma も前のリリースで応答し続けました。新しいリリース <code>20261120094013</code> は <code>releases/</code> に残り、<code>revisions.log</code> には何も足されていません（最後の行は、その前に行った切り戻しの記録です）。
            ただし、DB の変更は残ることがあります。MySQL では DDL がトランザクションで取り消されないので、複数の変更を含むマイグレーションが途中で失敗すると、それまでの変更は適用されたまま残ります（<ChapterLink n={27} section="recovery" />）。
          </p>
          <h3>公開の後に失敗したとき</h3>
          <p>
            <ChapterLink n={32} section="multi-host">前の節</ChapterLink>の例外を出すリリースは、<code>publishing</code> の後の確認で止まりました。このとき <code>current</code> は新しいリリースを指し、Puma もそのコードを読み込んで 500 を返していました。この配備も <code>revisions.log</code> には記録されません。
            記録は最後の <code>finished</code> の段階で書くので、<code>revisions.log</code> の最後の行が <code>current</code> のリリースとは限りません。
          </p>
          <Figure n={`${F}-4`} title="失敗した段階と切り戻しの後の状態" caption="実行例の app1 での実測をもとにした模式図。094115 が前のリリース、094134 が例外を出す新しいリリース。">
            <RollbackFigure />
          </Figure>
          <p>
            図{F}-4 の左と中央は、どちらも配備が失敗した状態です。左では <code>current</code> は以前の版を指したまま、中央ではすでに新しい版を指しています。エラーの行を見た後は、各サーバーで <code>current</code> のリンク先と、実際に応答している Puma の版を照合します。
          </p>
          <p>
            右の例で切り戻したのは、コードの参照先と再起動したプロセスです。配備の途中で DB に追加した列は残ります。以前のコードでその DB を読み書きできるかは、別に確かめます。
          </p>
          <h3>deploy:rollback が行うこと</h3>
          <Code
            lang="ruby"
            title="framework.rake の rollback と、deploy.rake の rollback_release_path・cleanup_rollback（Capistrano 3.20.1、抜粋）"
            href={`${CAP}/lib/capistrano/tasks/deploy.rake`}
            code={`
  task :rollback do
    %w{ starting started
        reverting reverted
        publishing published
        finishing_rollback finished }.each do |task|
      invoke "deploy:#{task}"
    end
  end
# （中略）
  task :rollback_release_path do
    on release_roles(:all) do
      releases = capture(:ls, "-xt", releases_path).split
      if releases.count < 2
        error t(:cannot_rollback)
        exit 1
      end

      rollback_release = ENV["ROLLBACK_RELEASE"]
      index = rollback_release.nil? ? 1 : releases.index(rollback_release)
# （中略）
  task :cleanup_rollback do
    on release_roles(:all) do
      last_release = capture(:ls, "-xt", releases_path).split.first
      last_release_path = releases_path.join(last_release)
      if test "[ \`readlink #{current_path}\` != #{last_release_path} ]"
        execute :tar, "-czf",
                deploy_path.join("rolled-back-release-#{last_release}.tar.gz"),
                last_release_path
        execute :rm, "-rf", last_release_path
`}
          />
          <p>
            <code>deploy:rollback</code> は <code>updating</code>・<code>updated</code> の代わりに <code>reverting</code>・<code>reverted</code> を、<code>finishing</code> の代わりに <code>finishing_rollback</code> を実行します。<code>reverting</code> で戻る先を決め、<code>publishing</code> で <code>current</code> を替え、<code>finishing_rollback</code> で最も新しいリリースを tar.gz にまとめて削除します
            <Ref n={3} />
            <Ref n={7} />。公開の後に失敗した状態から切り戻したときの出力が次です。
          </p>
          <Code
            lang="text"
            title="bundle exec cap production deploy:rollback の出力（抜粋）"
            code={`
00:01 bundler:install
      The Gemfile's dependencies are satisfied, skipping installation
      The Gemfile's dependencies are satisfied, skipping installation
00:02 deploy:assets:restore_manifest
      01 cp /srv/articles/releases/20261120094115/assets_manifest_backup/.manifest.json /srv/articles/releases/20261120094115/public/assets/.manifest.json
00:02 deploy:symlink:release
      01 ln -s /srv/articles/releases/20261120094115 /srv/articles/releases/current
      02 mv /srv/articles/releases/current /srv/articles
00:03 puma:phased_restart
      01 $HOME/.rbenv/bin/rbenv exec bundle exec pumactl -S /srv/articles/shared/tmp/pids/puma.state phased-restart
00:08 deploy:verify_release
      app1: revision=12cef3c を確認しました
      app2: revision=12cef3c を確認しました
00:11 deploy:cleanup_rollback
      01 tar -czf /srv/articles/rolled-back-release-20261120094134.tar.gz /srv/articles/releases/20261120094134
      02 rm -rf /srv/articles/releases/20261120094134
00:11 deploy:log_revision
      01 echo "dev rolled back to release 20261120094115" >> /srv/articles/revisions.log
`}
          />
          <ul>
            <li>
              戻る先は <code>releases/</code> を更新時刻の新しい順に並べた2番目で、<code>current</code> の1つ前とは限りません。公開の前に失敗した状態で切り戻すと、2番目は <code>current</code> 自身なので、<code>current</code> は変わらず、失敗したリリースだけが tar.gz になって削除されました。
              戻る先を選ぶには <code>ROLLBACK_RELEASE=20261120093900</code> のようにリリースの名前を渡します。
            </li>
            <li>
              <code>public/assets</code> は全リリースで共有しているので、マニフェスト（アセットの論理名とハッシュ付きのファイル名の対応表）は最後に作ったリリースのものになっています。切り戻しでは各リリースに保存した <code>assets_manifest_backup</code> からマニフェストを書き戻します。
            </li>
            <li>
              <code>bundler:install</code> は <code>deploy:reverted</code> の前にも実行され、戻る先の <code>Gemfile.lock</code> の gem がそろっているかを確かめます。
            </li>
            <li>
              <code>deploy:published</code> にフックした Puma の再起動と確認は、切り戻しでも実行されます。capistrano-sidekiq は <code>deploy:reverted</code> の後に Sidekiq を停止し、<code>deploy:published</code> の後に起動します
              <Ref n={16} />。
            </li>
          </ul>
          <h3>DB は戻らない</h3>
          <p>
            Capistrano の説明書は、capistrano-rails は切り戻しでアセットを直すが、マイグレーションには何もしないと書いています
            <Ref n={3} />。実行例でも、列 <code>body</code> を加えたリリースから前のリリースへ戻した後、DB は次の状態でした。
          </p>
          <Code
            lang="text"
            title="切り戻した後に current で bin/rails runner を実行した結果"
            code={`
["id", "title", "created_at", "updated_at", "body"]
20261120093913
`}
          />
          <p>
            1行目が <code>articles</code> の列、2行目が適用済みのマイグレーションの最新のバージョンです。コードは <code>body</code> を使わないリリースに戻りましたが、列とマイグレーションの記録は残っています。切り戻した先のリリースが今の DB で動くように、DB の変更は新旧どちらのコードでも動く段階に分けておきます（
            <ChapterLink n={27} section="deploy-order">列名を変えるときは複数回の変更に分ける</ChapterLink>）。マイグレーションも戻す必要があるときは、切り戻しとは別に、影響を確かめてから行います（
            <ChapterLink n={27} section="backup-restore">バックアップと復元</ChapterLink>）。
          </p>
          <p>
            説明書は、切り戻すより問題のコミットを取り消すコミットを配備し直すほうがよい場合が多いとも書いています。<code>deploy:failed</code> に自動の切り戻しを加えることもできますが、十分に試さないと危険だという注意があります。切り戻しの手順は必要になる前に試しておきます
            <Ref n={3} />。
          </p>
          <h3>keep_releases と cleanup</h3>
          <p>
            <code>finishing</code> の <code>deploy:cleanup</code> は、名前が14桁の数字のリリースを数え、新しいものから <code>keep_releases</code> 個を残して残りを削除します。<code>current</code> のリリースは古くても削除しません。公開の前に失敗したリリースも数に入り、残す枠を1つ使います。
            実行例のログの <code>Keeping 3 of 4 deployed releases</code> は、4つのうち3つを残したという表示です
            <Ref n={7} />。
          </p>
          <p>
            切り戻せるのは残っているリリースまでです。リリースごとにアプリケーションのコードが入るので、残す数を増やすとディスクを使います（gem とアセットは <code>shared/</code> にあり、リリースごとには増えません）。切り戻しで作った <code>rolled-back-release-….tar.gz</code> は <code>deploy_to</code> の直下に置かれ、<code>deploy:cleanup</code> では消えません。
            実行例でも2つ残ったので、ディスクの残りを見て削除します。
          </p>
        </>
      ),
    },
    {
      id: 'container-deploy',
      title: 'Kamal でコンテナを配備する',
      body: (
        <>
          <p>
            Kamal はアプリケーションと Ruby などの実行環境をコンテナイメージにまとめ、サーバーへ配備するツールです。Rails 8 の初期設定と Thruster の役割は、<ChapterLink n={29} section="kamal-thruster">Kamal と Thruster の位置付け</ChapterLink>で確認できます。<Ref n={27} />
          </p>
          <p>
            Kamal の設定は <code>config/deploy.yml</code> から確認できます。 <code>servers</code> で Web とジョブなどの役割を分け、<code>image</code> と <code>registry</code> でイメージの配布先、<code>proxy</code> で接続先や TLS を設定します。<code>accessories</code> は DB などアプリとは別のライフサイクルを持つコンテナの設定です。秘密情報の参照は <code>.kamal/secrets</code> などに配置し、実値を公開用設定ファイルへ書きません。<Ref n={24} />
          </p>
          <p>
            サーバーを構成する <code>kamal setup</code> の後は <code>kamal deploy</code> で更新を行えます。kamal-proxy は新しい Web コンテナがヘルスチェックに合格してから受け付け先を切り替え、旧コンテナに残った通信の終了を待ちます。アプリ側は <code>/up</code> などの確認経路を実際の設定で応答させます。デプロイ先で TLS を終端する位置、Rails の <code>force_ssl</code>・<code>assume_ssl</code>、DB の接続先、静的ファイルをどこから配るかも構成に合わせます（<ChapterLink n={25} section="health">ヘルスチェック</ChapterLink>、<ChapterLink n={24} section="static">静的ファイルの配信</ChapterLink>）。<Ref n={25} /><Ref n={26} />
          </p>
          <p>
            Rails 8 の Solid Queue・Solid Cache・Solid Cable は、ジョブ・キャッシュ・WebSocket の配信にリレーショナル DB を使う構成を選べます。動かすサービスは減らせますが、DB の接続・I/O・容量が必要になります。キュー用やキャッシュ用の DB を分けるか、既存の Redis とジョブ基盤を残すかは、実際の負荷と運用に合わせます。<Ref n={27} /><Ref n={28} /><Ref n={29} /><Ref n={30} />
          </p>
          <h3>リリースを順番に確かめる</h3>
          <p>
            CI でテストしたリビジョンから同じイメージを作り、まずステージングで DB 変更・主要画面・ジョブを確認します。Kamal では行き先を分け、<code>kamal deploy -d staging</code> のように指定できます。本番は同時リリースを直列にし、起動ログ、主要なリクエスト、エラー率を見て先へ進みます。異常があれば <code>kamal rollback &lt;version&gt;</code> などでアプリを前の版に戻すことを検討し、戻す版が今の DB を使えることを確認します。DB やファイルの復元は配備とは別の作業です。<Ref n={25} /><Ref n={31} />（<ChapterLink n={27} section="backup-restore">バックアップと復元</ChapterLink>）。
          </p>
          <p>
            次の図は Capistrano と Kamal で新しいバージョンを使い始める操作と、アプリケーションを戻す操作を並べたものです。どちらでも、アプリケーションを戻したときに DB の変更は戻りません。
          </p>
          <DeploymentComparisonFigure />
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Capistrano は用意済みのサーバーに SSH で接続し、決まった順にコマンドを実行してアプリケーションを配ります。Ruby 本体、Nginx、systemd のユニットなどは構成管理ツールや手順書で用意します。</li>
          <li>
            配備先には <code>releases/</code>・<code>current</code>・<code>shared/</code>・<code>repo/</code>・<code>revisions.log</code> ができます。新しいリリースを準備してから <code>current</code> のリンク先を替え、リリースをまたいで使うファイルは <code>linked_files</code>・<code>linked_dirs</code> で <code>shared/</code> にリンクします。
          </li>
          <li>
            ロールはタスクの実行先を選ぶ名前で、アセットは <code>web</code>、マイグレーションは <code>primary(:db)</code> の1台、Sidekiq は <code>worker</code> で実行されます。<code>db</code> はリリースのある台に付けます。
          </li>
          <li>
            配備は starting から finished までの8段階で進み、<code>current</code> は <code>publishing</code> で替わります。gem・アセット・マイグレーションは <code>updated</code> の前後に、Puma と Sidekiq の起動は <code>published</code> の後にフックされます。
          </li>
          <li>
            Ruby を上げる配備では全台に新しい Ruby を先に入れ、<code>rbenv_ruby</code> と <code>.ruby-version</code> をそろえ、Puma はマスターから起動し直します。gem は <code>shared/bundle</code> の ABI のバージョンごとのディレクトリに入り直します。
          </li>
          <li>
            自作のタスクは <code>on</code> と SSHKit の <code>execute</code>・<code>test</code>・<code>capture</code> で書き、コマンドはシンボルで渡し、再実行しても同じ結果になるようにします。ALB の配下では外す・再起動・確認・戻すを同じ <code>in: :sequence</code> のブロックで1台ずつ行います。
          </li>
          <li>
            公開の前の失敗では <code>current</code> は前のリリースのまま、公開の後の失敗では新しいリリースを指します。<code>deploy:rollback</code> は <code>current</code>・Puma・アセットのマニフェストを戻しますが、DB は戻しません。
          </li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Structure', publisher: 'Capistrano Documentation', url: 'https://capistranorb.com/documentation/getting-started/structure/', accessed: '2026-11-20', version: 'Capistrano 3', note: 'current、releases、repo、revisions.log、shared の役割と deploy_to。' },
    { title: 'Flow', publisher: 'Capistrano Documentation', url: 'https://capistranorb.com/documentation/getting-started/flow/', accessed: '2026-11-20', version: 'Capistrano 3', note: '配備と切り戻しの段階、started・updated などのフック用のタスク、プラグインが加えるタスク。' },
    { title: 'Rollbacks', publisher: 'Capistrano Documentation', url: 'https://capistranorb.com/documentation/getting-started/rollbacks/', accessed: '2026-11-20', version: 'Capistrano 3', note: 'deploy:rollback の流れ、ROLLBACK_RELEASE、切り戻したリリースの tar.gz、マイグレーションを戻さないこと、配備し直す方法と deploy:failed の注意。' },
    { title: 'Preparing Your Application', publisher: 'Capistrano Documentation', url: 'https://capistranorb.com/documentation/getting-started/preparing-your-application/', accessed: '2026-11-20', version: 'Capistrano 3', note: 'cap install が作るファイル、web・app・db のロールと、app・db がプレースホルダーであること。' },
    { title: 'Authentication & Authorisation', publisher: 'Capistrano Documentation', url: 'https://capistranorb.com/documentation/getting-started/authentication-and-authorisation/', accessed: '2026-11-20', version: 'Capistrano 3', note: 'authorized_keys と権限、SSH エージェント転送の注意、デプロイキー、パスワードなしの sudo の注意。' },
    { title: 'Role Filtering', publisher: 'Capistrano Documentation', url: 'https://capistranorb.com/documentation/advanced-features/role-filtering/', accessed: '2026-11-20', version: 'Capistrano 3', note: 'ROLES、--roles、set :filter による絞り込み。' },
    { title: 'lib/capistrano/tasks/deploy.rake・framework.rake', publisher: 'capistrano/capistrano（GitHub）', url: `${CAP}/lib/capistrano/tasks/deploy.rake`, accessed: '2026-11-20', version: 'Capistrano 3.20.1', note: '8つの段階、deploy:check、リンクの作成、current の切り替え、cleanup、rollback、REVISION と revisions.log の書き込み、空の deploy:restart と deploy:failed。' },
    { title: 'lib/capistrano/scm/git.rb・scm/tasks/git.rake', publisher: 'capistrano/capistrano（GitHub）', url: `${CAP}/lib/capistrano/scm/git.rb`, accessed: '2026-11-20', version: 'Capistrano 3.20.1', note: 'Git のフックの登録、ミラーの clone と更新、git archive による展開、git:wrapper、in: :groups と git_max_concurrent_connections。' },
    { title: 'lib/capistrano/defaults.rb・templates', publisher: 'capistrano/capistrano（GitHub）', url: `${CAP}/lib/capistrano/defaults.rb`, accessed: '2026-11-20', version: 'Capistrano 3.20.1', note: 'branch・deploy_to・keep_releases の既定値、cap install が作る Capfile と deploy.rb、log/capistrano.log、verify_host_key の設定例。' },
    { title: 'lib/capistrano/dsl.rb・dsl/env.rb・dsl/task_enhancements.rb・application.rb', publisher: 'capistrano/capistrano（GitHub）', url: `${CAP}/lib/capistrano/dsl.rb`, accessed: '2026-11-20', version: 'Capistrano 3.20.1', note: 'invoke と invoke!、on、release_roles、before と after、deploy:failed の呼び出し、--dry-run・--roles・--hosts・-p、cap install の STAGES。' },
    { title: 'SSHKit README', publisher: 'capistrano/sshkit（GitHub）', url: `${SSHKIT}/README.md`, accessed: '2026-11-20', version: 'SSHKit 1.25.1', note: 'execute・test・capture・within・with・as、最初の引数が文字列のときの扱い、parallel・sequence・groups、非ログインのセッション、~/.ssh/config。runners と backends/printer.rb の既定値と動作も参照。' },
    { title: 'lib/capistrano/tasks/bundler.cap・hooks.cap', publisher: 'capistrano/bundler（GitHub）', url: `${BUNDLER}/lib/capistrano/tasks/bundler.cap`, accessed: '2026-11-20', version: 'capistrano-bundler 2.2.0', note: 'bundler:config と bundler:install、bundle_path などの既定値、bundle_version による bundle config set、フックの位置。' },
    { title: 'lib/capistrano/tasks/assets.rake・migrations.rake', publisher: 'capistrano/rails（GitHub）', url: `${CRAILS}/lib/capistrano/tasks/assets.rake`, accessed: '2026-11-20', version: 'capistrano-rails 1.7.0', note: 'アセットの作成とマニフェストの退避・復元、public/assets の追加、keep_assets、migration_role と primary、conditionally_migrate。' },
    { title: 'lib/capistrano/tasks/rbenv.rake・README', publisher: 'capistrano/rbenv（GitHub）', url: `${RBENV}/lib/capistrano/tasks/rbenv.rake`, accessed: '2026-11-20', version: 'capistrano-rbenv 2.2.0', note: 'rbenv:validate と rbenv:map_bins、rbenv_type・rbenv_ruby・rbenv_map_bins、.ruby-version を使う場合。' },
    { title: 'capistrano3-puma: README・lib/capistrano/puma・tasks/systemd.rake・templates/puma.service.erb', publisher: 'seuros/capistrano-puma（GitHub）', url: `${CPUMA}/lib/capistrano/tasks/systemd.rake`, accessed: '2026-11-20', version: 'capistrano3-puma 8.1.0', note: 'install_plugin、puma:install とユーザー単位のユニット、smart_restart・reload・restart、published の後のフック、load_hooks、ユニットの ExecStart・ExecReload・Type=notify。' },
    { title: 'capistrano-sidekiq: README・tasks/sidekiq.rake・tasks/systemd.rake', publisher: 'seuros/capistrano-sidekiq（GitHub）', url: `${CSIDEKIQ}/lib/capistrano/tasks/sidekiq.rake`, accessed: '2026-11-20', version: 'capistrano-sidekiq 3.2.0', note: 'quiet・stop・start・restart のフックと TSTP、worker ロール、systemd での操作。' },
    { title: 'Deployment', publisher: 'sidekiq/sidekiq Wiki', url: 'https://github.com/sidekiq/sidekiq/wiki/Deployment', accessed: '2026-11-20', note: 'TSTP を配備の早い段階で送ること、TERM と -t の既定値25秒、終わらなかったジョブを Redis に戻すこと。' },
    { title: 'railties/lib/rails/commands/credentials/USAGE', publisher: 'rails/rails（GitHub）', url: `${RAILS}/railties/lib/rails/commands/credentials/USAGE`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'master.key をコミットしないこと、RAILS_MASTER_KEY の優先、環境別の credentials と鍵のパス。' },
    { title: 'rbenv(1)', publisher: 'rbenv', url: 'https://rbenv.org/man/rbenv.1', accessed: '2026-11-20', note: 'RBENV_VERSION と .ruby-version による Ruby の版の選び方。' },
    { title: 'aws elbv2 wait target-deregistered', publisher: 'AWS CLI Command Reference', url: 'https://docs.aws.amazon.com/cli/latest/reference/elbv2/wait/target-deregistered.html', accessed: '2026-11-20', note: '15秒ごとの問い合わせと、40回で終了ステータス255になること。' },
    { title: 'aws elbv2 wait target-in-service', publisher: 'AWS CLI Command Reference', url: 'https://docs.aws.amazon.com/cli/latest/reference/elbv2/wait/target-in-service.html', accessed: '2026-11-20', note: '正常と判定されるまで待つこと。' },
    { title: 'Control the concurrency of workflows and jobs', publisher: 'GitHub Docs', url: 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency', accessed: '2026-11-20', note: '同じ concurrency グループで同時に動くジョブは1つまでであること。' },
    { title: 'capistrano versions', publisher: 'RubyGems.org', url: 'https://rubygems.org/gems/capistrano/versions', accessed: '2026-11-20', note: '3.20.1（2026-05-16）が最新版であること。プラグインの版も RubyGems.org で確認した。' },
    { title: 'Configuration Overview', publisher: 'Kamal Documentation', url: 'https://kamal-deploy.org/docs/configuration/overview/', accessed: '2026-11-20', version: 'Kamal 2', note: '配備先、イメージ、環境の設定。' },
    { title: 'kamal deploy', publisher: 'Kamal Documentation', url: 'https://kamal-deploy.org/docs/commands/deploy/', accessed: '2026-11-20', version: 'Kamal 2', note: 'コンテナの構築、転送、起動と切り替え。' },
    { title: 'Kamal Proxy', publisher: 'basecamp/kamal-proxy', url: 'https://github.com/basecamp/kamal-proxy', accessed: '2026-11-20', note: '起動確認、通信の切り替えとドレイン。' },
    { title: 'Rails 8: No PaaS Required', publisher: 'Ruby on Rails', url: 'https://rubyonrails.org/2024/11/7/rails-8-no-paas-required', accessed: '2026-11-20', version: 'Rails 8.0', note: 'Rails 8 のデプロイ、Solid 系の gem と認証ジェネレーター。' },
    { title: 'Solid Queue', publisher: 'rails/solid_queue', url: 'https://github.com/rails/solid_queue', accessed: '2026-11-20', note: 'ワーカー、ディスパッチャー、スケジューラー、優先度・同時実行と定期実行。' },
    { title: 'Solid Cache', publisher: 'rails/solid_cache', url: 'https://github.com/rails/solid_cache', accessed: '2026-11-20', note: 'DB をキャッシュストアに使う構成。' },
    { title: 'Solid Cable', publisher: 'rails/solid_cable', url: 'https://github.com/rails/solid_cable', accessed: '2026-11-20', note: 'DB による Action Cable の配信。' },
    { title: 'kamal rollback', publisher: 'Kamal Documentation', url: 'https://kamal-deploy.org/docs/commands/rollback/', accessed: '2026-11-20', version: 'Kamal 2', note: '以前のアプリのイメージへ戻す方法。' },
  ],
}

export default chapter
