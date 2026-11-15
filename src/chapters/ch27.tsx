import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

function DeploymentFigure() {
  const rows = [
    ['① 新しい列を追加', '旧コードは title を使用', 'title / display_title（NULL可）'],
    ['② 両方に書くコードを配布', '全プロセスの切替完了を待つ', '旧列と新列を同じ更新で保存'],
    ['③ 過去の行を補完', '新規の更新は両方に書く', '未補完の行だけ分割して更新'],
    ['④ 読み取りを新列へ', '差分確認後に切替', '戻す期間中は旧列にも書く'],
    ['⑤ 旧列の利用を終了', '旧列を無視するコードを配布', '全プロセスの切替後に旧列を削除'],
  ]
  return <Svg id="27-1" w={760} h={422} label="列名の変更を段階的に行う模式図。列の追加、両方に書くコードの配布、既存行の補完、読み取りの切替、旧列の利用終了と削除の順に進む。各段階でWebとジョブの全プロセスの切替を確認する。">
    {rows.map(([a, b, c], i) => <g key={a}>
      <Box x={20} y={12 + i * 82} w={230} h={60} lines={[a, b]} fs={12} bold subTone="muted" />
      <Arrow x1={252} y1={42 + i * 82} x2={286} y2={42 + i * 82} />
      <Box x={290} y={12 + i * 82} w={450} h={60} lines={c} fs={13} fill="box4" />
      {i < 4 && <Arrow x1={135} y1={72 + i * 82} x2={135} y2={92 + i * 82} />}
    </g>)}
  </Svg>
}

function LockFigure() {
  return <Svg id="27-2" w={720} h={274} label="メタデータロック待ちの模式図。接続Aの未完了トランザクションがテーブルの定義を保護する。接続BのALTER TABLEは定義変更用のロックを待ち、さらに接続CのSELECTも待つことがある。Aを終了するとBが進める。">
    <Box x={20} y={18} w={200} h={64} lines={['接続A：トランザクション', 'SELECT 後も未完了']} fs={12} subTone="muted" />
    <Box x={260} y={18} w={200} h={64} lines={['接続B：ALTER TABLE', '定義変更用のロック待ち']} fs={12} fill="box5" subTone="muted" />
    <Box x={500} y={18} w={200} h={64} lines={['接続C：後続の SELECT', '待たされることがある']} fs={12} subTone="muted" />
    <Arrow x1={220} y1={50} x2={258} y2={50} dashed />
    <Arrow x1={460} y1={50} x2={498} y2={50} dashed />
    <T x={30} y={122}>待ち時間の確認：SHOW FULL PROCESSLIST</T>
    <T x={30} y={154} mono fs={12}>Waiting for table metadata lock</T>
    <Box x={20} y={186} w={680} h={68} lines={['LOCK=NONE でも、定義を切り替えるロックは必要', '長いトランザクションと待ち時間を確認してから変更する']} fs={13} fill="bg" subTone="muted" />
  </Svg>
}

function RecoveryFigure() {
  return <Svg id="27-3" w={720} h={260} label="マイグレーションの途中失敗の模式図。列の追加は成功し、続くSQLは失敗した。MySQLでは列が残る場合がある。適用済み一覧だけでなく実際のテーブルを確認し、継続・修正・復元の手順を選ぶ。">
    <Box x={20} y={20} w={190} h={62} lines={['1. 列の追加', '成功して残る']} fs={13} fill="box4" subTone="muted" />
    <Arrow x1={212} y1={51} x2={258} y2={51} />
    <Box x={260} y={20} w={190} h={62} lines={['2. 次の SQL', '失敗']} fs={13} fill="bg" subTone="danger" />
    <Arrow x1={452} y1={51} x2={498} y2={51} />
    <Box x={500} y={20} w={200} h={62} lines={['3. 状態を調査', 'テーブルと適用履歴を照合']} fs={12} subTone="muted" />
    <Box x={20} y={122} w={680} h={110} lines={['アプリを戻す：旧コードが現在の DB で動くか', 'DB 定義を戻す：逆の変更を実行できるか', 'データを戻す：バックアップなどから復元できるか']} fs={13} fill="bg" />
  </Svg>
}

const ch27: Chapter = {
  number: 27,
  part: 5,
  title: '安全なDBマイグレーション',
  summary: 'DBの構造変更を、動いているアプリケーションと両立させる手順を説明します。MySQLのDDLとロック、列の追加・削除、既存行の分割更新、索引と制約、失敗時の調査を具体例で扱います。',
  goals: [
    'マイグレーションの適用履歴と実際のDBの状態を区別できる',
    '旧コードと新コードが同時に動く期間を考え、変更の順序を組み立てられる',
    'MySQLのDDLの実行方式と、メタデータロック待ちを説明できる',
    '既存行を分割して更新し、途中からやり直せる条件を考えられる',
    '逆のマイグレーションとデータ復元の違いを説明できる',
  ],
  prerequisites: [11, 14, 15, 23],
  sections: [
    { id: 'basics', title: 'マイグレーションはDBの構造を変更するコード', body: <>
      <p><Term en="schema">スキーマ</Term>は、テーブル、列、型、索引、制約などのDBの構造です。Railsのマイグレーションは、その構造を変更するRubyのコードです。ファイルを保存しただけではDBは変わらず、対象の環境で実行するとSQLが送られます。本章では「何を変更するか」に加え「いつ、どのコードと組み合わせて変更するか」を扱います。</p>
      <p>Railsは、適用が完了したマイグレーションの番号を schema_migrations テーブルに記録します。番号は通常、ファイル名の先頭の日時です。db/schema.rb はDBの構造をRubyで表した記録で、業務データそのものを保存したバックアップではありません。DB固有の機能を記録したい場合はSQL形式の structure.sql も選べます。<Ref n={1} /></p>
      <Code lang="bash" title="開発用DBで適用状況と構造の変更を確認する" code={`
bin/rails generate migration AddDisplayTitleToArticles display_title:string
bin/rails db:migrate:status
bin/rails db:migrate
# 新規の変更が意図した列・型になっているか、db/schema.rb の差分も確認する
`} />
      <p>すでに共有環境で適用したファイルを編集しても、その番号が適用済みならRailsは再実行しません。変更履歴を作り直すのではなく、必要な修正を新しいマイグレーションとして追加します。ローカルで作ったばかりの変更を試す場合と、すでに利用者のデータが入った環境の変更は分けて考えます。</p>
      <Callout title="この章の実例の範囲"><p>実測は、業務アプリと接続しない検証用DBで行いました。Ruby 4.0.9、ActiveRecord 8.1.4.1、MySQL 8.4.13です。実測と明記していないコードは説明用です。小さなテーブルで成功したことは、本番と同じ時間や負荷で終わることを保証しません。</p></Callout>
    </> },
    { id: 'reversible', title: 'change・up/down と戻せるものの範囲', body: <>
      <p>change に書いた操作の逆をRailsが判断できる場合、ロールバックでは逆の操作が実行されます。例えば add_column の逆は列の削除です。up と down を使うと、適用時と戻すときの処理をそれぞれ書けます。逆の操作が分かることと、元のデータを取り戻せることは別です。<Ref n={1} /></p>
      <Code lang="ruby" title="列を追加するマイグレーションの例" code={`
class AddDisplayTitleToArticles < ActiveRecord::Migration[8.1]
  def change
    add_column :articles, :display_title, :string
  end
end
`} />
      <p>検証用の lab_articles テーブルでは、適用後に display_title が存在し、逆方向の実行後には存在しなくなることを確認しました。追加した列に値を書いていた場合、その値も削除されます。remove_column に型を添えて逆に列を作れるようにしても、消えた値までは復元されません。</p>
      <p>MySQLで ALTER TABLE などの構造変更を行うSQLを<Term en="Data Definition Language">DDL</Term>と呼びます。多くのDDLは実行中のトランザクションを暗黙に確定します。第15章の transaction で囲めば、複数のDDLがまとめて取り消される、とは考えられません。MySQLの「atomic DDL」も、1つの対応するDDL文の整合性を守る仕組みであり、マイグレーション全体をユーザーのROLLBACKで戻す機能ではありません。<Ref n={2} /><Ref n={7} /></p>
      <Code lang="text" title="隔離したDBでの実測：列の追加に続けて不正なSQLを実行" code={`
add_column :lab_articles, :display_title, :string  # 成功
execute "INVALID SQL FOR LAB"                     # 失敗
# 例外を捕捉した後の column_exists? => true
`} />
      <p>失敗したマイグレーションは途中まで作用している可能性があります。番号の適用状況だけを見て同じ処理を再実行すると、「列がすでに存在する」という別のエラーになります。まず実際の定義を調べます。</p>
    </> },
    { id: 'deploy-order', title: '列名を変えるときは複数回の変更に分ける', body: <>
      <p>デプロイでWebプロセスを順番に入れ替える間は、旧コードと新コードが同時に動きます。Sidekiqのワーカーや定期処理も、Webとは別に古いコードを実行していることがあります。title をいきなり display_title に改名すると、まだ title を読む旧コードは失敗します。</p>
      <p>そこで、先に使える構造を増やし、コードとデータを移してから不要な構造を減らします。この進め方は expand/contract と呼ばれます。図27-1は、名前を変えるために新しい列を追加する例です。矢印の各段階を、一度のデプロイに詰め込まずに進めます。<Ref n={6} /></p>
      <Figure n="27-1" title="列とコードを段階的に切り替える" caption="模式図。両方の列へ書く処理は、すべての書き込み経路で必要です。"><DeploymentFigure /></Figure>
      <p>新しい列は、まずNULLを許す状態で追加します。その後、両方の列に同じ値を書くコードを配布します。古い書き込み処理が残っていると、新しい列に値がある行でも旧列だけが変更されて不一致になります。Web・ジョブ・バッチの切替完了を確認してから、過去の行を補完します。</p>
      <Code lang="ruby" title="同じ更新で両方の列を保存する例" code={`
article.update!(title: new_title, display_title: new_title)
`} />
      <p>読み取り先を変える前に、NULLが残っていないか、両列の値が意図どおりかを確認します。NULLの補完だけでは、旧コードが動いていた間に生じた「両列に値はあるが異なる」行は直りません。この例ではtitleを正として、そのような行も分割して同期し、再度照合します。新コードに問題があって旧コードへ戻す期間は、旧列への書き込みも続けます。旧列の更新をやめた後は、旧コードへ戻すだけでは古い値を表示するため、どの段階まで戻せるかを先に決めます。</p>
    </> },
    { id: 'backfill', title: '既存のデータは分割して補完する', body: <>
      <p>すでに存在する行に、新しい列の値を補う処理を<Term en="backfill">バックフィル</Term>と呼びます。大量の行をマイグレーションの中で一度に更新すると、デプロイが長時間終わらず、行ロックも長く保持します。構造の変更と、大量のデータの更新を別の処理に分けると、負荷を見て止めたり再開したりできます。<Ref n={1} /></p>
      <Code lang="ruby" title="説明用：新列がNULLの行だけを、まとまりごとに補完する" code={`
# 通常の Article の検証やコールバックを持たない、作業専用のモデル
class BackfillArticle < ActiveRecord::Base
  self.table_name = "articles"
end

BackfillArticle.where(display_title: nil).in_batches(of: 500) do |batch|
  # 対象IDの取得後に別処理が書いた値も、UPDATE時の条件で保護する
  changed = batch.where(display_title: nil).update_all("display_title = title")
  puts "updated=#{changed}"
  sleep 0.1
end
`} />
      <p>500件と0.1秒は設定例です。1回の時間、DBの負荷を見て調整します。更新を複製する別のDB（レプリカ）がある構成では、そちらへの反映の遅れも確認します。全体を1つの transaction で囲むと、分割しても長いトランザクションになってしまいます。進捗は処理件数やIDの範囲で記録し、記事の内容などをログに出す必要はありません。</p>
      <p>この例は「両列へ書くコードが全プロセスに行き渡っている」「NULLは未処理を意味する」という前提です。値を意図的にNULLにする仕様なら、別の進捗管理が必要です。隔離したDBでは、未補完の2行がコピーされ、再実行しても新列に書かれた編集済みの値が上書きされないことを確認しました。</p>
      <p>update_all は検証とコールバックを呼びません（<ChapterLink n={14} />）。それが適切な更新かを判断し、必要な日時や関連データの更新は別途設計します。アプリの現在のモデルに依存したデータ更新を古いマイグレーションに埋め込むと、将来そのモデルが変わったときに再実行できなくなる点にも注意します。分割処理自体にも同時更新の競合があるため、条件と完了後の照合が必要です。<Ref n={8} /></p>
    </> },
    { id: 'ddl-locks', title: 'MySQLの変更方式とメタデータロック', body: <>
      <p>DDLの実行時間は、Railsのコードの行数では決まりません。MySQLがどの方式で変更するか、テーブルの大きさ、他の接続が何をしているかで変わります。ALGORITHM は変更方式を指定するオプションです。<Ref n={3} /></p>
      <div className="table-wrap"><table><thead><tr><th>方式</th><th>意味</th><th>注意点</th></tr></thead><tbody>
        <tr><td>INSTANT</td><td>対応する変更を、主に定義情報の更新で行う</td><td>すべての列変更に使えるわけではない。ロック待ちは起こり得る</td></tr>
        <tr><td>INPLACE</td><td>従来のテーブルコピー方式を避けて変更する</td><td>操作によっては内部でテーブルを再構築し、多くの時間や領域を使う</td></tr>
        <tr><td>COPY</td><td>変更後のテーブルへデータをコピーする</td><td>書き込みへの影響と作業領域を考慮する</td></tr>
      </tbody></table></div>
      <p>MySQLのオンラインDDLは、対応する構造変更を通常の読み書きと並行して進める仕組みです。ただし、テーブルの列などの定義を保護する<Term en="metadata lock">メタデータロック</Term>は必要です。行を更新していないSELECTでも、トランザクションが終わるまでこのロックを保持する場合があります。図27-2のように、待っているDDLが後続の処理を待たせることもあります。<Ref n={4} /></p>
      <Figure n="27-2" title="オンラインDDLでも起こるロック待ち" caption="模式図。破線は、一方の処理が他方を待たせる関係を表します。"><LockFigure /></Figure>
      <Code lang="sql" title="隔離したDBで確認した、待ち時間を制限する例" code={`
-- 接続A（SELECT後、まだトランザクションを終えない）
START TRANSACTION;
SELECT * FROM lab_articles;

-- 接続B
SET SESSION lock_wait_timeout = 1;
ALTER TABLE lab_articles ADD COLUMN extra_note VARCHAR(255), ALGORITHM=INSTANT;
-- 接続Aが保持するロックを待ち、エラー1205になった

-- 接続A：検証後に終了する
ROLLBACK;
`} />
      <p>この実測では1秒で待ちを打ち切りました。lock_wait_timeout はメタデータロックの待ち時間の設定で、行ロック用の innodb_lock_wait_timeout とは別です。また、DDLの作業時間全体の上限でもありません。接続に設定する値なので、接続をプールへ戻す運用では変更前の値へ戻す扱いも必要です。<Ref n={9} /></p>
    </> },
    { id: 'indexes-constraints', title: '索引・NOT NULL・一意制約を追加する', body: <>
      <p>索引を追加すると、検索条件によってはクエリが速くなります。ただし、索引の作成時には既存のデータを読みます。主キー以外の通常の索引（セカンダリー索引）を追加するとき、MySQLでは INPLACE と LOCK=NONE を明示できる場合があります。対応できない変更ならエラーになり、意図せずより強いロックの方式へ切り替わることを避けられます。対象のDBのバージョンと操作の組み合わせを確認します。<Ref n={3} /></p>
      <Code lang="sql" title="隔離した検証用テーブルで実行した例" code={`
ALTER TABLE lab_articles
  ADD INDEX idx_lab_title (title),
  ALGORITHM=INPLACE, LOCK=NONE;
`} />
      <p>LOCK=NONE は、主な処理中に読み書きを許す指定であり、メタデータロックが不要になる意味ではありません。Railsで execute を使うなら、逆のSQLを down に用意するか、戻せない理由を明示します。PostgreSQL向けの algorithm: :concurrently をMySQLにそのまま持ち込むこともできません。</p>
      <p>NOT NULL は、既存行の補完と、新たなNULLを書かないコードの配布が済んでから付けます。NULLが0件だった一時点の確認だけでは、確認直後の書き込みを防げません。MySQLのNOT NULLへの変更は、INPLACEでも再構築を伴う場合があり、単なる設定値の更新とは限りません。</p>
      <p>一意制約も同様です。第14章で見たとおり、アプリの uniqueness 検証だけでは同時登録を防げません。まず、どの組み合わせを一意にするかを決め、既存の重複を解消し、新しい重複が入らないよう書き込みを制御してから索引を作ります。作成に失敗したら、重複の再発や、文字列の比較規則（照合順序）も調べます。例えば、大文字と小文字を区別しない設定では、見た目が異なる文字列も同じ値と判定されます。<ChapterLink n={14} section="uniqueness" /></p>
      <Code lang="sql" title="会社内でコードを一意にする場合の、重複の調査例" code={`
SELECT company_id, external_code, COUNT(*) AS total
FROM articles
WHERE external_code IS NOT NULL
GROUP BY company_id, external_code
HAVING COUNT(*) > 1;
`} />
      <p>上の列は説明用です。NULLを許すことと一意であることは別の条件なので、NULLも禁止したいならNOT NULLを別途検討します。外部キーを追加するときも、参照先のない行の有無を先に確認します。制約を付ける前の調査と、DBが実際に制約を受け入れたことの確認を両方行います。</p>
    </> },
    { id: 'remove-columns', title: '列を削除する前にコードから参照をなくす', body: <>
      <p>削除予定の列をコードから参照しなくなったとしても、長く動いているプロセスは列の情報をキャッシュしています。Railsには、対象の列をモデルが扱わないよう指定する ignored_columns があります。削除を先に実行するのではなく、列を無視するコードを配布して全プロセスの切替を確認してから、列を削除します。<Ref n={5} /></p>
      <Code lang="ruby" title="旧列の利用を終えた段階でArticleモデルに指定する" code={`
class Article < ApplicationRecord
  self.ignored_columns += ["title"]
end
`} />
      <p>フォーム、ビュー、検索条件、並び順、直接書いたSQL、シリアライズ、バッチの参照も先に除きます。この指定は、SQL文字列の中の title を自動で直すものではありません。また、列をまだ必要とする旧コードへ戻す予定がある間は削除できません。</p>
      <p>strong_migrations は、危険になりやすい変更を見つけて説明する補助gemです。MySQLにも対応する確認項目がありますが、アプリ独自の書き込み経路や、本番のデータ量まで保証するものではありません。本章では補助として紹介し、参照した業務アプリへの導入や、このgemによる実行検証は行っていません。<Ref n={6} /></p>
    </> },
    { id: 'recovery', title: '失敗したら定義・データ・コードを分けて確認する', body: <>
      <p>失敗したときは、まずどのSQLまで成功したか、現在どのコードが動いているかを確認します。db:migrate:status、実行ログ、SHOW CREATE TABLE、索引と制約の情報を照合します。schema.rbは手元の記録なので、失敗した環境の実際の状態と一致するとは限りません。</p>
      <Figure n="27-3" title="途中失敗から復旧方法を選ぶ" caption="模式図。列が残る現象は、本章のMySQL検証でも確認しました。"><RecoveryFigure /></Figure>
      <p>問題が新しいコードだけにあり、DBは旧コードと互換なら、コードだけ戻す選択肢があります。一方、列を削除した後に旧コードへ戻しても動きません。DBの逆操作を実行する場合も、その操作でさらにデータを失わないか、実行に必要な時間とロックを確認します。</p>
      <p>削除・変換で失った値は、バックアップや更新履歴からの復元が必要です。バックアップの取得時点以降の更新をどう扱うかまで含めて復旧方法を考えます。適用履歴を手で書き換えて成功したことにする、エラーを無条件で無視する、といった対処では、環境ごとの状態の違いが残ります。</p>
      <p>事前検証では、本番に近いテーブル定義とデータ量を用意し、旧コード・新コードとの組み合わせを確かめます。所要時間だけでなく、待ち時間、追加領域、更新中の読み書き、失敗後の状態も観察します。変更を中止する条件と復旧担当を決めておくと、待ち続けるDDLを前に判断が遅れることを防げます。</p>
      <Callout kind="v72"><p>段階的なデプロイ、MySQLのDDL、ロック、データ復元という考え方はRails 7.2でも必要です。マイグレーションの継承元に書く [7.2] や [8.1] は、そのバージョンの互換動作を選ぶ指定です。既存ファイルの番号を一括で書き換えて新しいバージョンに合わせるものではありません。<Ref n={1} /></p></Callout>
    </> },
    { id: 'summary', title: 'まとめ', body: <ul>
      <li>スキーマの変更、データの補完、コードの切替を分け、旧コードが動く期間を考慮します。</li>
      <li>changeで逆操作ができても、削除されたデータが戻るとは限りません。MySQLではDDLの途中失敗後にも変更が残り得ます。</li>
      <li>バックフィルは分割し、同時更新を上書きしない条件と、再開・完了確認の方法を用意します。</li>
      <li>INPLACEやLOCK=NONEでも負荷とメタデータロック待ちは起こります。実際のDBのバージョンと変更内容で検証します。</li>
      <li>制約を付ける前に既存データと書き込み経路を整え、列を消す前に全プロセスから参照をなくします。</li>
    </ul> },
  ],
  sources: [
    { title: 'Active Record Migrations', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_migrations.html', accessed: '2026-11-12', version: 'Rails 8.1', note: '適用履歴、changeとup/down、スキーマの記録、データ更新を分離する考え方。' },
    { title: 'Statements That Cause an Implicit Commit', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/implicit-commit.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'ALTER TABLEなどの暗黙コミット。' },
    { title: 'Online DDL Operations', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: '索引追加、列変更、NOT NULLの方式と制約。' },
    { title: 'Online DDL Performance and Concurrency', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-performance.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'LOCK指定とメタデータロックによる待ち。' },
    { title: 'ActiveRecord::ModelSchema — ignored_columns=', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.1.4.1/activerecord/lib/active_record/model_schema.rb', accessed: '2026-11-12', version: 'Rails 8.1.4.1', note: 'ローカルの同版gemのソースで、列を無視してから削除する説明を確認。' },
    { title: 'strong_migrations README', publisher: 'ankane/strong_migrations（GitHub）', url: 'https://github.com/ankane/strong_migrations', accessed: '2026-11-12', note: '列の削除・変更・改名を段階化する方法、MySQLの検査項目。gemの実行検証は未実施。' },
    { title: 'Atomic Data Definition Statement Support', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/atomic-ddl.html', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'atomic DDLとユーザーのトランザクションの区別。' },
    { title: 'ActiveRecord::Batches', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1.0/classes/ActiveRecord/Batches.html', accessed: '2026-11-12', version: 'Rails 8.1.0', note: 'in_batchesによる分割と、同時更新による競合への注意。' },
    { title: 'Server System Variables — lock_wait_timeout', publisher: 'MySQL Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html#sysvar_lock_wait_timeout', accessed: '2026-11-12', version: 'MySQL 8.4', note: 'メタデータロックの待ち時間。' },
  ],
}
export default ch27
