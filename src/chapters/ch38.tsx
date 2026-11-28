import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { SqlLab } from '../components/SqlLab'
import {
  DeadlockFigure,
  IsolationFigure,
  LockMatrixFigure,
  LostUpdateFigure,
  MvccFigure,
  NestedRetryFigure,
  NextKeyFigure,
  TransactionEndFigure,
  TransferFigure,
} from '../visuals/ch38-figures'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const MYSQL = 'https://dev.mysql.com/doc/refman/8.4/en'

/* Rails のログに出る SQL。バッククォートを含むので、通常の文字列で組み立てる */
const sel = (id: number, tail = '') => 'SELECT `accounts`.* FROM `accounts` WHERE `accounts`.`id` = ' + id + ' LIMIT 1' + tail
const upd = (id: number, v: number) => 'UPDATE `accounts` SET `accounts`.`balance` = ' + v + ' WHERE `accounts`.`id` = ' + id
const updAll = (id: number, set: string, extra = '') => 'UPDATE `accounts` SET ' + set + ' WHERE `accounts`.`id` = ' + id + extra
const countSql = (tail = '') => "SELECT COUNT(*) FROM `accounts` WHERE (balance >= '9000')" + tail

const chapter: Chapter = {
  number: 38,
  part: 3,
  title: 'トランザクションと同時実行',
  summary:
    '口座から代金を引いた直後に処理が止まったら、送金はどうなるでしょうか。2人が同じ口座を同時に更新する例を1操作ずつ進め、どの変更が残り、どちらの処理が待つかを観察します。',
  goals: [
    '送金の2つの更新をまとめ、失敗したときに両方を取り消せる理由を説明できる',
    '2つの処理が同じ残高を読んで更新を失う順番と、ロックで防ぐ方法を説明できる',
    'ほかの処理の変更が見える時点と、互いにロックを待って先に進めなくなる条件を見分けられる',
  ],
  prerequisites: [35, 37],
  sections: [
    {
      id: 'why-transaction',
      title: '複数の更新をまとめる理由',
      body: (
        <>
          <p>
            銀行の送金を例にします。<ChapterLink n={35} />のサンプル DB の accounts テーブルは口座を表し、列は id（口座の番号）・user_id（口座を持つ利用者の id）・balance（残高）です。balance
            には「0 以上」という CHECK 制約が付いていて、残高が 0 未満になる変更は DB がエラーにします。口座1から口座2へ 1000 を送るには、次の2つの UPDATE を実行します。
          </p>
          <Code
            lang="sql"
            title="口座1から口座2へ 1000 を送る"
            code={`
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
`}
          />
          <p>
            1つ目の UPDATE の後、2つ目を送る前にアプリケーションでエラーが起きたとします。MySQL は特に指定しなければ、SQL の文を1つ実行するたびにその変更を確定します。この動作を
            <Term en="autocommit">自動コミット</Term>と呼び、新しい接続では有効です
            <Ref n={1} />。接続は Rails のアプリケーションや mysql コマンドが MySQL に SQL を送り、結果を受け取る通信の経路です。1つ目の UPDATE はすでに確定しているので、口座1は 9000 に減り、口座2は 10000 のままで、送った 1000 はどの口座にもありません。
          </p>
          <p>
            Rails で <code>from.update!(…)</code> と <code>to.update!(…)</code> を、transaction のブロックで囲まずに続けて書いた場合も同じです。2つの <code>update!</code> の間で例外が起きると、1つ目の UPDATE だけが確定して残ります。
          </p>
          <p>
            複数の変更を1つのまとまりとして扱う仕組みが<Term en="transaction">トランザクション</Term>です。BEGIN（START TRANSACTION と同じ）で始めると、その後の変更は COMMIT
            を送るまで確定しません。COMMIT はまとまりの中の変更をすべて確定し、ROLLBACK はすべて取り消します
            <Ref n={2} />。2つの UPDATE を BEGIN と COMMIT の間に置けば、途中で失敗しても ROLLBACK で両方を取り消せます。Rails では <code>transaction do … end</code> のブロックが BEGIN と COMMIT・ROLLBACK
            を送ります（「Transaction」の節）。
          </p>
          <p>この章の実験では MySQL 8.4.13 にサンプル DB と同じ構造のテーブルを作りました。口座1・2の残高は 10000、口座3は 8000 です。</p>
          <Code
            lang="sql"
            title="実験に使ったテーブル（MySQL 8.4.13）"
            code={`
CREATE TABLE accounts (
  id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id bigint NOT NULL,
  balance int NOT NULL,
  CONSTRAINT balance_non_negative CHECK (balance >= 0),
  CONSTRAINT fk_accounts_users FOREIGN KEY (user_id) REFERENCES users (id)
);
INSERT INTO accounts (id, user_id, balance) VALUES (1, 1, 10000), (2, 2, 10000), (3, 3, 8000);
`}
          />
          <p>mysql コマンドで、2つの UPDATE の後に ROLLBACK を送りました。</p>
          <Code
            lang="text"
            title="BEGIN から ROLLBACK まで（mysql コマンド。表の枠線と実行時間は省略）"
            code={`
mysql> BEGIN;
mysql> UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
Query OK, 1 row affected
mysql> UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
Query OK, 1 row affected
mysql> SELECT id, balance FROM accounts WHERE id IN (1, 2);
|  1 |    9000 |
|  2 |   11000 |
mysql> ROLLBACK;
mysql> SELECT id, balance FROM accounts WHERE id IN (1, 2);
|  1 |   10000 |
|  2 |   10000 |
`}
          />
          <p>
            トランザクションの中の SELECT には自分の UPDATE の結果（9000 と 11000）が見え、ROLLBACK の後は2つとも取り消されて 10000 に戻りました。図 20-1
            はトランザクションを使わない場合と、ROLLBACK・COMMIT で終える場合の結果を並べたものです。1000 がどこにも無い状態が残るのは、左の列だけです。
          </p>
          <Figure n="20-1" title="送金とトランザクション" caption="上の実行結果と、自動コミットの動作をまとめた図。">
            <TransferFigure />
          </Figure>
          <p>
            COMMIT する前の変更は、ほかの接続からは見えません。口座1だけが減った途中の状態を、ほかの利用者が読むことはありません（「Isolation Level」の節）。
          </p>
        </>
      ),
    },
    {
      id: 'concurrent-updates',
      title: '同じ行を同時に更新すると起きること',
      body: (
        <>
          <p>
            Web アプリケーションは複数のリクエストを同時に処理します。同じ利用者がボタンを2回押したときや、リクエストとジョブが同じ行を更新するときには、同じ行を扱う処理が重なります。Rails を動かす Puma
            は、複数のプロセス（実行中のプログラム）と、各プロセスの中の複数のスレッド（1つのプログラムの中で並行して進む処理の流れ）でリクエストを処理します（
            <ChapterLink n={23} section="app-server" />
            ）。Sidekiq のジョブも別のプロセスで動きます。
          </p>
          <p>
            スレッドはそれぞれ別の接続で MySQL とやり取りし、トランザクションは接続ごとにあります（
            <ChapterLink n={15} section="db-connection" />
            ）。あるスレッドが BEGIN を送っても、別の接続を使うほかのスレッドの SQL はそのトランザクションに入りません。1つの接続で MySQL とやり取りしている間の状態を
            <Term en="session">セッション</Term>と呼び、この章では同時に動く2つのセッションを A・B と呼びます。
          </p>
          <p>
            同じ口座から 1000 ずつ送金するリクエストが2つ、ほぼ同時に届いた場合を、Active Record（Rails 8.1.4.1、mysql2 0.5.7、Ruby 4.0.9）の2つのスレッドで再現しました。次の lib.rb
            は各実験で共通に使う準備で、thread は名前を付けたスレッドで接続を1つ借りてブロックを実行する補助メソッドです。
          </p>
          <Code
            lang="ruby"
            title="lib.rb（この章の実験で共通に使う準備。ログの整形と、残高を戻す処理は省略）"
            code={`
require "active_record"

# 接続先の host・username・password は省略。max_connections は1つのプロセスで開く接続の上限
ActiveRecord::Base.establish_connection(adapter: "mysql2", database: "bank", max_connections: 5)
ActiveRecord::Base.logger = ActiveSupport::Logger.new($stdout)

class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end
class Account < ApplicationRecord; end

# 名前を付けたスレッドで、接続を1つ借りてブロックを実行する
def thread(name, delay = 0, &block)
  Thread.new do
    Thread.current[:name] = name
    sleep delay
    ActiveRecord::Base.with_connection { block.call }
  rescue => e
    say "#{e.class}: #{e.message}" # say は経過秒とスレッドの名前を付けて表示する
  end
end
`}
          />
          <p>thread メソッドの中の各行は次のように働きます。</p>
          <ul>
            <li>
              <code>Thread.new do … end</code> はブロックを新しいスレッドで実行します。呼び出した側はブロックの終わりを待たずに次の行へ進むので、<code>thread("A") {'{ … }'}</code> と{' '}
              <code>thread("B") {'{ … }'}</code> を続けて書くと、2つのブロックが同時に進みます。
            </li>
            <li>
              <code>Thread.current[:name] = name</code> は実行中のスレッドに名前を覚えさせます。ログの各行に A・B を表示するために使います。
            </li>
            <li>
              <code>sleep delay</code> は始める時刻をずらします。<code>thread("B", 0.1)</code> と書くと、B は A より 0.1 秒遅れて始まります。
            </li>
            <li>
              <code>with_connection</code> は Active Record が持つ接続を1つ借りてブロックを実行し、終わると返します。A と B は別の接続を借りるので、別のセッションになります。Puma
              の2つのスレッドが別々のリクエストを処理している状態と同じです。
            </li>
          </ul>
          <p>
            送金の処理は口座を2つ読み、Ruby で計算した残高を <code>update!</code> で保存します。全体をトランザクションで囲み、<code>sleep 0.3</code> でその間のほかの処理を表しました。最後の{' '}
            <code>[a, b].each(&amp;:join)</code> は2つのスレッドが終わるまで待ちます。
          </p>
          <Code
            lang="ruby"
            title="lost.rb"
            code={`
def transfer(from_id, to_id, amount)
  Account.transaction do
    from = Account.find(from_id)
    to = Account.find(to_id)
    sleep 0.3 # 画面の表示や別の処理をしている間
    from.update!(balance: from.balance - amount)
    to.update!(balance: to.balance + amount)
  end
end

a = thread("A") { transfer(1, 2, 1000) }
b = thread("B", 0.1) { transfer(1, 2, 1000) } # 0.1 秒遅れて始める
[a, b].each(&:join)
`}
          />
          <Code
            lang="text"
            title="実行結果（口座1・2は 10000 から始めた）"
            code={`
 0.02s A  TRANSACTION (0.3ms)  BEGIN
 0.03s A  Account Load (0.4ms)  ${sel(1)}
 0.03s A  Account Load (0.4ms)  ${sel(2)}
 0.10s B  TRANSACTION (0.2ms)  BEGIN
 0.10s B  Account Load (0.6ms)  ${sel(1)}
 0.10s B  Account Load (0.2ms)  ${sel(2)}
 0.34s A  Account Update (1.2ms)  ${upd(1, 9000)}
 0.34s A  Account Update (0.4ms)  ${upd(2, 11000)}
 0.35s A  TRANSACTION (14.7ms)  COMMIT
 0.41s B  Account Update (2.1ms)  ${upd(1, 9000)}
 0.41s B  Account Update (0.6ms)  ${upd(2, 11000)}
 0.41s B  TRANSACTION (0.4ms)  COMMIT
最後の残高: [[1, 9000], [2, 11000], [3, 8000]]
`}
          />
          <p>
            ログの各行は左から、実験を始めてからの経過秒、スレッドの名前、Rails のログです。Rails のログは「モデル名と操作（SQL にかかった時間）SQL」の形で、SQL が終わった時点で出ます。
          </p>
          <p>
            A も B も、相手が保存する前に口座1の残高 10000 を読みました。<code>update!</code> は Ruby で計算した 9000 をそのまま書くので、B は A の書き込みを同じ 9000 で上書きしました（図
            20-2）。2回の送金はどちらも成功したのに、口座1は 8000 ではなく 9000 です。同じ行を読んで書き戻す処理が重なり、先の更新が失われる現象を<Term en="lost update">更新の消失</Term>
            と呼びます。
          </p>
          <Figure n="20-2" title="同時の送金で更新が消える" caption="上の実行結果を、口座1について図にしたもの。">
            <LostUpdateFigure />
          </Figure>
          <p>
            トランザクションはほかのセッションが同じ行を読むことを止めないので、囲んでも防げませんでした。MySQL の通常の SELECT は読んだ行にロックを掛けません
            <Ref n={10} />。防ぐには、ほかのセッションを待たせるロックを使うか、DB にある現在の値から計算する UPDATE を書きます。Rails での書き方は <code>lock</code>・<code>with_lock</code>・条件付きの{' '}
            <code>update_all</code> で、「送金で更新の消失を防ぐ書き方」の節で3つを比べます。この章では Transaction、Lock、Isolation Level、MVCC、Deadlock
            の順に、SQL の層での動きをシミュレーターで確かめてから、MySQL と Active Record で実際に送られる SQL を見ます。
          </p>
        </>
      ),
    },
    {
      id: 'simulator',
      title: 'シミュレーターの画面と操作',
      body: (
        <>
          <p>
            2つのセッションの動きは各節の実行欄で試せます。実行欄は教材「RailsエンジニアのためのSQL/データベース」の Transaction Simulator を組み込んだもので、MySQL の InnoDB
            を参考にした簡略なモデルです。InnoDB は MySQL が既定で使うストレージエンジン（テーブルの行を保存し、読み書きする部分）で、トランザクションとロックも InnoDB
            が処理します。シミュレーターは<ChapterLink n={35} />〜<ChapterLink n={37} />の SQL Editor のサンプル DB とは別に、accounts の2行（id が 1 と 2、残高はどちらも
            10,000）だけを持ちます。実行欄ごとに独立していて、ページを再読み込みすると初期化されます。
          </p>
          <p>実行欄は上から次の部分でできています。</p>
          <ul>
            <li>
              再現シナリオ：「シナリオ」で手順を選び、「初期化して開始」の後に「次のステップ」を押すと1操作ずつ進みます。状態の欄には「2 / 4 完了 · 次: Tx A — UPDATE …」のように進み具合が出ます。実行欄はその節のシナリオを選んだ状態で表示されます。開始するとシミュレーターは初期化されますが、選んでおいた分離レベルは残ります。
            </li>
            <li>
              Transaction A・B：セッションごとに、Isolation Level（BEGIN の前に選ぶ）、BEGIN・COMMIT・ROLLBACK のボタン、1文だけ書ける「セッションSQL」と「SQL実行」（Ctrl + Enter
              でも実行できる）があります。「SELECT」「S LOCK」「X LOCK」のボタンは、入力欄に <code>SELECT balance FROM accounts WHERE id = 1;</code> と、その末尾に FOR SHARE・FOR UPDATE
              を付けた文を入れます。その下に状態（IDLE・ACTIVE・WAITING・COMMITTED・ROLLED BACK）、トランザクションの番号（A#1 など）、Snapshot、保持している Lock、直前の結果、未コミットの変更が出ます。
            </li>
            <li>Lock Table：Resource（accounts:1 は id が 1 の行）、Type（S LOCK・X LOCK）、Owner、State（HELD は持っている、WAITING は待っている）の一覧です。</li>
            <li>Wait-for Graph：待ちの関係を矢印で示します。「B waits for A」は、B が A のロックの解放を待っていることを表します。</li>
            <li>MVCC · 確定Versionと読み取り結果：行ごとの確定した Version と、未確定の値です。「← Tx A の直近SELECT」は、A が最後の SELECT で読んだものを示します。</li>
            <li>操作ログ：実行した操作と結果の記録です。</li>
          </ul>
          <p>
            S LOCK・X LOCK と Lock Table・Wait-for Graph は「Lock」の節、Snapshot は「Isolation Level」の節、Version は「MVCC」の節で、シナリオを進めながら説明します。
          </p>
          <p>
            セッションSQL に書けるのは、BEGIN・COMMIT・ROLLBACK、id を等号で指定した SELECT（列は balance・id・*。FOR UPDATE・FOR SHARE・LOCK IN SHARE MODE を付けられる）、balance
            に数値を代入するか加減算する UPDATE です。それ以外の文はエラーになります。「Simulator初期化（2行とも10,000へ）」で初期の状態に戻ります。
          </p>
          <p>
            シミュレーターは gap ロック・next-key ロック（行と行の間の隙間に掛けるロック）、Phantom、範囲の検索、古いバージョンの回収、ロック待ちのタイムアウト、データの永続化を再現しません。SERIALIZABLE
            は行単位の S ロックだけを使う限られたモデルです。デッドロックは検出して表示しますが、取り消すトランザクションは利用者が ROLLBACK のボタンで選びます（MySQL は自動で選びます）。これらの違いは各節で
            MySQL と Rails での実測と比べます。gap ロックと Phantom は「Isolation Level」の節、古いバージョンの回収は「MVCC」の節、ロック待ちのタイムアウトは「Deadlock」の節で扱います。
          </p>
          <Callout kind="note" title="SQL Editor の BEGIN">
            <p>
              <ChapterLink n={35} />〜<ChapterLink n={37} />の SQL Editor でも BEGIN・COMMIT・ROLLBACK を実行できますが、SQLite の1つの接続で動くので、2つのトランザクションを同時には動かせません。複数の文をまとめて実行して途中でエラーになっても、それより前の文は自動では取り消されません。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'transaction',
      title: 'Transaction：まとめて確定し、まとめて取り消す',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>トランザクションは複数の変更をひとまとまりにし、全体を確定（COMMIT）するか全体を取り消す（ROLLBACK）かのどちらかにします。</p>
          <Code
            lang="sql"
            code={`
BEGIN;                -- START TRANSACTION と同じ
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
COMMIT;               -- 取り消すときは ROLLBACK;
`}
          />
          <p>
            トランザクションが守る性質は、頭文字を取って ACID と呼ばれます
            <Ref n={3} />。Atomicity（原子性）はまとまりの中の変更がすべて確定するかすべて取り消されること、Consistency（一貫性）は CHECK
            制約などの決まりを満たした状態を保つこと、Isolation（分離性）は同時に動くトランザクションが互いの途中の状態をどこまで見るかを分離レベルで決めること、Durability（永続性）は COMMIT
            した変更がサーバーの停止などで失われないことです。分離レベルは「Isolation Level」の節で扱い、この節では Atomicity を確かめます。
          </p>

          <h3>シミュレーターで試す</h3>
          <SqlLab lesson="Transaction" title="シミュレーターで試す：Transaction" />
          <p>「送金 · まとめて確定」のシナリオで「初期化して開始」を押し、「次のステップ」を4回押します。A が BEGIN し、口座1を 1000 減らし、口座2を 1000 増やして COMMIT します。</p>
          <ol>
            <li>
              3回目の後（COMMIT の前）、A の欄に「未コミット: accounts:1 → 9000 / accounts:2 → 11000」と出ます。MVCC の欄では各行の「Version 0 · balance = 10000」の上に「未確定 ·
              A#1」の値が出て、Lock Table には accounts:1 と accounts:2 の X LOCK（Tx A・HELD）が出ます。Version は確定した値に付く番号で、初期値が Version 0 です。X LOCK
              は行を変更したトランザクションが COMMIT か ROLLBACK まで持つロックで、次の節で説明します。
            </li>
            <li>4回目の COMMIT で両方の行に Version 1（created by A#1）が増え、Lock Table は空になります。2つの変更が1回の COMMIT で確定しました。</li>
          </ol>
          <p>続けて、次の操作も試します。</p>
          <ul>
            <li>もう一度開始して3回進め、A の ROLLBACK を押します。新しい Version は作られず、ロックも消え、残高は 10000 のままです。</li>
            <li>COMMIT の前に B で BEGIN、「SELECT」、「SQL実行」の順に押します。B は待たずに「SELECT accounts:1 → 10000 · Version 0」を読み、A の未確定の変更は見えません。</li>
            <li>
              COMMIT の前に A のセッションSQL で <code>UPDATE accounts SET balance = balance - 20000 WHERE id = 1;</code> を実行します。残高が 0
              未満になるので「UPDATE失敗」になりますが、A は ACTIVE のままで、前の2つの UPDATE も残ります。
            </li>
          </ul>

          <h3>なぜそうなるか</h3>
          <p>
            引き落としだけが成功すると口座の合計が合わなくなるので、Atomicity によって2つの UPDATE を両方確定するか、両方取り消すかにします。ROLLBACK
            が取り消すのは、そのトランザクションの未確定の変更だけです。ほかのトランザクションがすでに COMMIT した変更は取り消さず、最初の UPDATE だけを残すこともしません（途中までを取り消すには SAVEPOINT
            を使います。<ChapterLink n={15} section="nested" />
            ）。
          </p>
          <p>文がエラーになったときは、その文だけが取り消され、トランザクションは続きます。CHECK 制約で確かめました。</p>
          <Code
            lang="text"
            title="CHECK 制約の違反（mysql コマンド。表の枠線と実行時間は省略）"
            code={`
mysql> BEGIN;
mysql> UPDATE accounts SET balance = balance + 20000 WHERE id = 2;
Query OK, 1 row affected
mysql> UPDATE accounts SET balance = balance - 20000 WHERE id = 1;
ERROR 3819 (HY000): Check constraint 'balance_non_negative' is violated.
mysql> SELECT id, balance FROM accounts WHERE id IN (1, 2);
|  1 |   10000 |
|  2 |   30000 |
mysql> ROLLBACK;
`}
          />
          <p>
            2つ目の UPDATE はエラー 3819 になりましたが、1つ目（口座2の 30000）は残っています。ここで COMMIT すると、口座2だけが増えた状態が確定します。エラーの後はアプリケーションが ROLLBACK
            を送ります（MySQL のマニュアルも、重複キーのエラーなどで取り消されるのはその文だけだと説明しています
            <Ref n={4} />
            ）。シミュレーターで「UPDATE失敗」の後も A が ACTIVE のままだったのは、この動作に合わせたものです。Durability はシミュレーターでは再現せず、データはブラウザーのメモリーにあるので再読み込みで消えます。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>
            Active Record では <code>transaction</code> のブロックで範囲を決めます。<code>ApplicationRecord.transaction</code> と <code>Account.transaction</code>{' '}
            は同じトランザクションを使います。トランザクションはモデルごとではなく、DB の接続ごとにあるためです
            <Ref n={17} />。1件の <code>save</code> や <code>destroy</code> は Rails がトランザクションで囲みますが
            <Ref n={17} />
            、2つのレコードの更新を1つにまとめるには、自分で <code>transaction</code> のブロックを書きます。lib.rb の Account で、口座1・2を 10000 に戻してから実行しました。
          </p>
          <Code
            lang="ruby"
            title="成功した場合と、途中で例外が起きた場合（ログの時刻は省略）"
            code={`
from = Account.find(1)
to = Account.find(2)
Account.transaction do
  from.update!(balance: from.balance - 1000)
  to.update!(balance: to.balance + 1000)
end
#   TRANSACTION (0.7ms)  BEGIN
#   Account Update (2.9ms)  ${upd(1, 9000)}
#   Account Update (0.9ms)  ${upd(2, 11000)}
#   TRANSACTION (15.7ms)  COMMIT

# 残高を 10000 に戻してから
from = Account.find(1)
to = Account.find(2)
Account.transaction do
  from.update!(balance: from.balance - 1000)
  raise "送金先の処理で失敗"
  to.update!(balance: to.balance + 1000)
end
#   TRANSACTION (0.7ms)  BEGIN
#   Account Update (2.8ms)  ${upd(1, 9000)}
#   TRANSACTION (5.7ms)  ROLLBACK
# => RuntimeError: 送金先の処理で失敗

Account.order(:id).pluck(:id, :balance) # => [[1, 10000], [2, 10000], [3, 8000]]
from.balance                            # => 9000（Ruby のオブジェクトの値）
`}
          />
          <p>
            ブロックが最後まで進むと COMMIT が、例外が起きると ROLLBACK が送られ、例外はそのままブロックの外へ伝わりました
            <Ref n={17} />。BEGIN が最初の UPDATE の直前に送られているのは、Rails が BEGIN を最初の SQL まで遅らせるためで、中身の無い <code>Account.transaction {'{ }'}</code> は SQL
            を送りません（<ChapterLink n={15} section="transaction" />
            ）。
          </p>
          <p>
            例外を外へ伝えずに取り消すには <code>ActiveRecord::Rollback</code> を投げます。ROLLBACK が送られ、<code>transaction</code> は nil を返しました
            <Ref n={17} />。
          </p>
          <Code
            lang="ruby"
            code={`
result = Account.transaction do
  Account.where(id: 1).update_all("balance = balance - 1000")
  raise ActiveRecord::Rollback
end
#   TRANSACTION (0.3ms)  BEGIN
#   Account Update All (1.3ms)  ${updAll(1, 'balance = balance - 1000')}
#   TRANSACTION (3.7ms)  ROLLBACK
result # => nil
`}
          />
          <p>
            Rails 8.1 では、CHECK 制約の違反（MySQL のエラー 3819）は <code>ActiveRecord::CheckViolation</code> になります
            <Ref n={21} />。mysql コマンドで試した2つの UPDATE を、ブロックの中で実行しました。
          </p>
          <Code
            lang="ruby"
            code={`
Account.transaction do
  Account.where(id: 2).update_all("balance = balance + 20000")
  Account.where(id: 1).update_all("balance = balance - 20000")
end
#   TRANSACTION (0.5ms)  BEGIN
#   Account Update All (1.3ms)  ${updAll(2, 'balance = balance + 20000')}
#   Account Update All (1.3ms)  ${updAll(1, 'balance = balance - 20000')}
#   TRANSACTION (4.6ms)  ROLLBACK
# => ActiveRecord::CheckViolation: Mysql2::Error: Check constraint 'balance_non_negative' is violated.

Account.order(:id).pluck(:id, :balance) # => [[1, 10000], [2, 10000], [3, 8000]]
`}
          />
          <p>MySQL だけなら1つ目の UPDATE が残る場面ですが、例外がブロックの外へ出るときに Rails が ROLLBACK を送るので、2つとも取り消されました。</p>

          <h3>注意点</h3>
          <ul>
            <li>
              取り消されるのは DB の変更だけです。例外の例でも、Ruby のオブジェクトの <code>from.balance</code> は 9000 のままでした。DB の値は <code>reload</code> で読み直します
              <Ref n={17} />。
            </li>
            <li>
              メールの送信、外部の API の呼び出し、Redis へのジョブの投入は ROLLBACK で取り消せないので、COMMIT の後で行います（<ChapterLink n={18} section="transaction" />、
              <ChapterLink n={34} section="transaction-design" />）。
            </li>
            <li>
              ブロックの中で <code>ActiveRecord::StatementInvalid</code>（CheckViolation などの親のクラス）を rescue して処理を続けないようにします
              <Ref n={17} />。MySQL ではエラーの後もトランザクションが続くので、COMMIT まで進むと途中までの変更が確定します。次のコードでは、2つ目の <code>update_all</code> の CheckViolation
              をブロックの中の rescue で止めています。例外がブロックの外へ出ないので、Rails はブロックの終わりで COMMIT を送ります。mysql コマンドの実験で見たとおり MySQL には1つ目の UPDATE
              が残っているので、口座2だけが増えた状態が確定します。DB のエラーは <code>transaction</code> のブロックの外で rescue します。
            </li>
          </ul>
          <Code
            lang="ruby"
            title="書いてはいけない例：ブロックの中で DB のエラーを rescue して続ける"
            code={`
Account.transaction do
  Account.where(id: 2).update_all("balance = balance + 20000")
  begin
    Account.where(id: 1).update_all("balance = balance - 20000")
  rescue ActiveRecord::StatementInvalid
    # 何もせずに続けると、ブロックは最後まで進み、COMMIT が送られる
  end
end
`}
          />
          <p>
            次の図は、ブロックの中で例外が起きたかどうかと、起きた例外をどこで捕まえたかによって、Rails が送る SQL と DB に残る変更がどう分かれるかをまとめたものです。左の列の問いを上から順にたどり、「はい」「いいえ」の矢印で右の列の結果に進みます。
          </p>
          <Figure title="ブロックの終わり方と送られる SQL" caption="この節の実行結果をもとにした図。紫の箱は例外がブロックの外へ出て ROLLBACK が送られる所を表す。">
            <TransactionEndFigure />
          </Figure>
          <Callout kind="v72">
            <p>
              <code>ActiveRecord::CheckViolation</code> は Rails 8.1.0 で追加された例外のクラスです
              <Ref n={25} />。Rails 7.2 では CHECK 制約の違反は <code>ActiveRecord::StatementInvalid</code> として投げられます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'lock',
      title: 'Lock：S ロックと X ロック',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            「同じ行を同時に更新すると起きること」の節では、A が口座1を読んでから書くまでの間に B も同じ行を読めたので、更新が消えました。A が読んだ時点で B を待たせれば、B は A の COMMIT
            の後の残高を読みます。この「待たせる」ために使うのがロックで、Rails では <code>Account.lock.find(1)</code> や <code>account.with_lock</code> と書きます。この節では、先に SQL
            でロックの種類と待ち方を確かめます。
          </p>
          <p>
            <Term en="lock">ロック</Term>は同じデータへの競合する操作を順番に進める仕組みです。InnoDB は行の単位でロックを掛け、行のロックには2種類あります
            <Ref n={5} />。
          </p>
          <ul>
            <li>
              <Term en="shared lock">S ロック（共有ロック）</Term>：行を読むためのロックで、ほかのトランザクションも同じ行の S ロックを同時に持てます。
            </li>
            <li>
              <Term en="exclusive lock">X ロック（排他ロック）</Term>：行を更新・削除するためのロックで、持っている間、ほかのトランザクションは同じ行の S ロックも X ロックも得られません。
            </li>
          </ul>
          <p>
            両立しないロックを要求した側は、ロックが手放されるまで待ちます。これを<Term en="lock wait">ロック待ち</Term>と呼びます。ロックは COMMIT か ROLLBACK まで持ち続けます
            <Ref n={6} />。
          </p>
          <Code
            lang="sql"
            code={`
-- 読んだ行に S ロック（LOCK IN SHARE MODE は古い書き方で、同じ意味）
SELECT balance FROM accounts WHERE id = 1 FOR SHARE;
-- 読んだ行に X ロック
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- 変更する行に X ロック
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
-- 通常の SELECT はロックを取らない
SELECT balance FROM accounts WHERE id = 1;
`}
          />
          <p>
            FOR SHARE・FOR UPDATE を付けた SELECT を<Term en="locking read">ロック読み取り</Term>と呼び、BEGIN で始めたトランザクションの中で使います。自動コミットのままでは文が終わるとトランザクションも終わり、ロックはすぐに手放されます
            <Ref n={6} />。図 20-3 は、A の持つロック（左の列）と B が要求するロック（上の行）の組み合わせごとに、B が待つかどうかをまとめたものです。
          </p>
          <Figure n="20-3" title="S ロックと X ロックの両立" caption="MySQL 8.4 のマニュアル（InnoDB Locking・Locking Reads）をもとにまとめた図。">
            <LockMatrixFigure />
          </Figure>

          <h3>シミュレーターで試す</h3>
          <SqlLab lesson="Lock" title="シミュレーターで試す：Lock" />
          <p>「Lock Wait · 解放で再開」のシナリオで「初期化して開始」を押し、「次のステップ」を進めます。</p>
          <ol>
            <li>2ステップ目で A が口座1を 5000 に UPDATE し、Lock Table に accounts:1 の X LOCK（Tx A・HELD）が出ます。</li>
            <li>
              4ステップ目で B が同じ行を UPDATE すると、B は WAITING になります。Lock Table に X LOCK（Tx B・WAITING）が増え、Wait-for Graph に「B waits for A」の矢印が、B の欄に「waiting
              for: accounts:1」「held / queued by: Tx A」が出ます。
            </li>
            <li>
              5ステップ目の A の COMMIT で、操作ログに「Lock解放を検知 → 待機していたSQLを自動再開」と出て B の UPDATE が進み、A が確定した 5000 から 1000 を引いて「5000 →
              4000」になります。6ステップ目の B の COMMIT で Version 2 · balance = 4000 ができます。
            </li>
          </ol>
          <p>次に「Shared Lock · 共存と競合」を選んで開始し、7ステップを進めます。</p>
          <ol>
            <li>3・4ステップ目で A と B が同じ行を FOR SHARE で読み、accounts:1 の S LOCK が2つ（Tx A・Tx B、どちらも HELD）並びます。</li>
            <li>5ステップ目で A が UPDATE すると、X ロックが B の S ロックと両立しないので A が WAITING になり、「A waits for B」の矢印が出ます。</li>
            <li>6ステップ目の B の COMMIT で A の UPDATE が再開し、A のロックは X LOCK に変わります。7ステップ目の A の COMMIT で Version 1 · balance = 5000 ができます。</li>
          </ol>
          <p>
            最後に「Simulator初期化」を押し、A で BEGIN、「X LOCK」、「SQL実行」の順に押します（SELECT … FOR UPDATE）。B で BEGIN、「SELECT」、「SQL実行」と押すと、B は待たずに 10000
            を読みます。B で「S LOCK」「SQL実行」と押すと WAITING になります。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            S ロック同士は両立するので、別々のトランザクションが同じ行を同時に FOR SHARE で読めます。X ロックは S とも X とも両立しないので、後から要求した側が待ちます。待っている文はエラーにならず、ロックが手放されると続きから実行されます。B
            の UPDATE が A の確定した 5000 から計算したのは、UPDATE が最新の確定済みの行を対象にするためです（「MVCC」の節）。
          </p>
          <p>
            通常の SELECT は X ロックのある行でも待たずに確定済みのバージョンを読みます（一貫性読み取り。「MVCC」の節）。分離レベルが SERIALIZABLE のときだけは、トランザクションの中の通常の SELECT も S
            ロックを取るので待ちます。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>
            <code>lock</code> を付けた検索は <code>SELECT … FOR UPDATE</code> を送ります
            <Ref n={19} />。「同じ行を同時に更新すると起きること」の節の送金を <code>Account.lock.find</code> で読むように変えて実行し、途中で、ロックの状態を表す{' '}
            <code>performance_schema.data_locks</code> を3つ目の接続から読みました
            <Ref n={7} />。
          </p>
          <Code
            lang="ruby"
            title="locked.rb（lib.rb を読み込んで実行）"
            code={`
def transfer_locked(from_id, to_id, amount)
  Account.transaction do
    from = Account.lock.find(from_id)
    to = Account.lock.find(to_id)
    sleep 0.3
    from.update!(balance: from.balance - amount)
    to.update!(balance: to.balance + amount)
  end
end

a = thread("A") { transfer_locked(1, 2, 1000) }
b = thread("B", 0.1) { transfer_locked(1, 2, 1000) }
`}
          />
          <Code
            lang="text"
            title="実行結果（口座1・2は 10000 から始めた。data_locks の接続の番号はスレッドの名前に置き換えた）"
            code={`
 0.02s A  TRANSACTION (0.5ms)  BEGIN
 0.03s A  Account Load (0.4ms)  ${sel(1, ' FOR UPDATE')}
 0.03s A  Account Load (0.4ms)  ${sel(2, ' FOR UPDATE')}
 0.10s B  TRANSACTION (0.2ms)  BEGIN
 0.20s data_locks:
        A | accounts | - | TABLE | IX | GRANTED | -
        A | accounts | PRIMARY | RECORD | X,REC_NOT_GAP | GRANTED | 1
        A | accounts | PRIMARY | RECORD | X,REC_NOT_GAP | GRANTED | 2
        B | accounts | - | TABLE | IX | GRANTED | -
        B | accounts | PRIMARY | RECORD | X,REC_NOT_GAP | WAITING | 1
 0.34s A  Account Update (0.6ms)  ${upd(1, 9000)}
 0.34s A  Account Update (0.3ms)  ${upd(2, 11000)}
 0.35s A  TRANSACTION (16.7ms)  COMMIT
 0.35s B  Account Load (249.9ms)  ${sel(1, ' FOR UPDATE')}
 0.35s B  Account Load (0.4ms)  ${sel(2, ' FOR UPDATE')}
 0.66s B  Account Update (0.5ms)  ${upd(1, 8000)}
 0.66s B  Account Update (0.3ms)  ${upd(2, 12000)}
 0.67s B  TRANSACTION (13.0ms)  COMMIT
最後の残高: [[1, 8000], [2, 12000], [3, 8000]]
`}
          />
          <p>
            data_locks の各行は左から、ロックを持つ（または待つ）セッション、テーブル、索引、対象（TABLE は表、RECORD は行）、種類、状態（GRANTED は持っている、WAITING
            は待っている）、行の主キーの値です。索引はインデックスのことで（<ChapterLink n={37} section="what-is-index" />）、PRIMARY は主キーのインデックスです。InnoDB
            の行のロックはインデックスのレコードに掛かるので、どのインデックスの上のロックかが表示されます。A は口座1・2の X ロックを持ち、B は口座1の X ロックを待っていて、シミュレーターの Lock Table の HELD・WAITING と同じ状態です。X,REC_NOT_GAP
            は行の前の隙間を含まない、行だけの X ロックです。TABLE の IX は行に X ロックを掛ける前に表に掛ける<Term en="intention lock">インテンションロック</Term>で、シミュレーターには出てきません
            <Ref n={5} />。
          </p>
          <p>
            B の <code>SELECT … FOR UPDATE</code> は「Account Load (249.9ms)」で、A の COMMIT まで約 0.25 秒待ちました。B は A の COMMIT 後の値を読んだので、最後の残高は 8000 と 12000
            で、更新の消失は起きていません。Rails のログは SQL が終わった時点で出るので、B が 0.10 秒ごろに送った FOR UPDATE の行は、待ちが終わった 0.35 秒に出ています。時刻の順に並べ直すと次のようになります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">時刻</th>
                  <th scope="col">A</th>
                  <th scope="col">B</th>
                  <th scope="col">口座1の確定した残高</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">0.03s</th>
                  <td>口座1・2を FOR UPDATE で読む（10000）。2行の X ロックを持つ</td>
                  <td></td>
                  <td>10000</td>
                </tr>
                <tr>
                  <th scope="row">0.10s</th>
                  <td>sleep 0.3 の途中</td>
                  <td>口座1の FOR UPDATE を送る。A の X ロックと両立しないので待つ</td>
                  <td>10000</td>
                </tr>
                <tr>
                  <th scope="row">0.34s</th>
                  <td>口座1に 9000、口座2に 11000 を書く</td>
                  <td>待っている</td>
                  <td>10000（9000 は未確定）</td>
                </tr>
                <tr>
                  <th scope="row">0.35s</th>
                  <td>COMMIT。ロックを手放す</td>
                  <td>FOR UPDATE の結果が返る。読んだ残高は 9000</td>
                  <td>9000</td>
                </tr>
                <tr>
                  <th scope="row">0.66s</th>
                  <td></td>
                  <td>9000 から 1000 を引いた 8000 を書く</td>
                  <td>9000（8000 は未確定）</td>
                </tr>
                <tr>
                  <th scope="row">0.67s</th>
                  <td></td>
                  <td>COMMIT</td>
                  <td>8000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ロックなしの実行（図 20-2）では B は 0.10 秒に 10000 を読みましたが、ここでは同じ読み取りが A の COMMIT の後まで待たされています。<code>lock</code> を付けても、検索が{' '}
            <code>transaction</code> のブロックの外にあると A は読んだ直後にロックを手放すので、B を待たせられません（この節の注意点）。
          </p>
          <p>S ロックで読むには、<code>lock("FOR SHARE")</code> のように句を文字列で渡します。シミュレーターの「Shared Lock」と同じ手順で実行しました。</p>
          <Code
            lang="ruby"
            title="share.rb（data_locks を表示する部分は省略）"
            code={`
a = thread("A") do
  Account.transaction do
    Account.lock("FOR SHARE").find(1)
    sleep 0.3
    Account.where(id: 1).update_all("balance = 5000")
  end
end
b = thread("B", 0.1) do
  Account.transaction do
    Account.lock("FOR SHARE").find(1)
    sleep 0.6
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
 0.01s A  TRANSACTION (0.3ms)  BEGIN
 0.02s A  Account Load (0.3ms)  ${sel(1, ' FOR SHARE')}
 0.10s B  TRANSACTION (0.1ms)  BEGIN
 0.10s B  Account Load (0.5ms)  ${sel(1, ' FOR SHARE')}
 0.50s data_locks:
        A | accounts | - | TABLE | IS | GRANTED | -
        A | accounts | - | TABLE | IX | GRANTED | -
        A | accounts | PRIMARY | RECORD | S,REC_NOT_GAP | GRANTED | 1
        A | accounts | PRIMARY | RECORD | X,REC_NOT_GAP | WAITING | 1
        B | accounts | - | TABLE | IS | GRANTED | -
        B | accounts | PRIMARY | RECORD | S,REC_NOT_GAP | GRANTED | 1
 0.70s B  TRANSACTION (0.3ms)  COMMIT
 0.70s A  Account Update All (382.8ms)  ${updAll(1, 'balance = 5000')}
 0.72s A  TRANSACTION (10.9ms)  COMMIT
`}
          />
          <p>
            A と B は同じ行の S ロック（S,REC_NOT_GAP）を同時に持ち、A の UPDATE の X ロックは B の COMMIT まで約 0.38 秒待ちました。TABLE の IS は行に S
            ロックを掛ける前に表に掛けるインテンションロックです
            <Ref n={5} />。A は FOR SHARE の後に UPDATE も送ったので、IS と IX の両方を持っています。
          </p>

          <h3>注意点</h3>
          <ul>
            <li>
              ロック読み取りはトランザクションの中で使います。トランザクションの外の <code>Account.lock.find(1)</code> は、文が終わるとロックも手放すので、ほかのセッションを待たせません。
            </li>
            <li>ロックを持つ時間が長いほど待つ処理が増えるので、トランザクションの中で外部の API の応答を待たないようにします（<ChapterLink n={34} section="transaction-design" />）。</li>
            <li>
              ロックは検索で走査した索引のレコードに掛かり、適した索引が無いと条件に合わない行までロックされます（<ChapterLink n={37} section="what-is-index" />、<ChapterLink n={15} section="lock-index" />
              ）。
            </li>
            <li>
              この節の <code>lock</code> のように、読む時点でロックを取ってほかの処理を待たせる方法を、Rails のドキュメントは悲観的ロック（pessimistic locking）と呼びます
              <Ref n={19} />。lock_version で衝突を見つける楽観的ロックは別の仕組みです。テーブルに lock_version という整数の列を持たせ、UPDATE の WHERE
              に読んだときの lock_version を入れます。ほかの処理が先に保存して値が変わっていると UPDATE は 0 行になり、Rails は <code>ActiveRecord::StaleObjectError</code>{' '}
              を投げます。読む時点ではロックを取らないので、読んでから保存するまでの間にほかの処理を待たせません（<ChapterLink n={15} section="optimistic" />）。<code>FOR UPDATE NOWAIT</code> と <code>SKIP LOCKED</code> は
              <ChapterLink n={15} section="pessimistic" />で扱います。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'lost-update-fix',
      title: '送金で更新の消失を防ぐ書き方',
      body: (
        <>
          <p>
            送金で更新の消失を防ぐ Active Record の書き方は3つあります。どれも口座1・2が 10000 の状態から、A と B が同時に口座1から 1000 ずつ送って確かめました。
          </p>
          <h3>1. lock で読んでから計算する</h3>
          <p>
            前の節の <code>transfer_locked</code> です。読む時点で X ロックを取るので、B は A の COMMIT を待ってから、その後の値で計算します。最後の残高は 8000 と 12000 でした。
          </p>
          <h3>2. with_lock で読み直す</h3>
          <p>
            読み込み済みのレコードをロックするには <code>with_lock</code> を使います。with_lock はトランザクションを始め、<code>lock!</code> でレコードを <code>SELECT … FOR UPDATE</code>{' '}
            で読み直してからブロックを実行します
            <Ref n={23} />。
          </p>
          <Code
            lang="ruby"
            title="with_lock.rb"
            code={`
def withdraw(id, amount, hold = 0)
  account = Account.find(id)
  say "読んだ残高 #{account.balance}"
  sleep 0.1
  account.with_lock do
    say "ロック後の残高 #{account.balance}"
    sleep hold # A はロックを持ったまま 0.3 秒待つ
    account.update!(balance: account.balance - amount)
  end
end

a = thread("A") { withdraw(1, 1000, 0.3) }
b = thread("B", 0.15) { withdraw(1, 1000) }
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
 0.02s A  Account Load (0.3ms)  ${sel(1)}
 0.03s A  読んだ残高 10000
 0.13s A  TRANSACTION (0.4ms)  BEGIN
 0.13s A  Account Load (1.1ms)  ${sel(1, ' FOR UPDATE')}
 0.13s A  ロック後の残高 10000
 0.15s B  Account Load (0.4ms)  ${sel(1)}
 0.15s B  読んだ残高 10000
 0.25s B  TRANSACTION (0.4ms)  BEGIN
 0.43s A  Account Update (0.9ms)  ${upd(1, 9000)}
 0.44s A  TRANSACTION (14.0ms)  COMMIT
 0.44s B  Account Load (190.3ms)  ${sel(1, ' FOR UPDATE')}
 0.44s B  ロック後の残高 9000
 0.45s B  Account Update (0.4ms)  ${upd(1, 8000)}
 0.46s B  TRANSACTION (11.8ms)  COMMIT
最後の残高: [[1, 8000], [2, 10000], [3, 8000]]
`}
          />
          <p>
            B は with_lock の前に 10000 を読んでいましたが、with_lock が読み直したので、ロック後の残高は A の COMMIT 後の 9000 になり、最後は 8000 でした。<code>lock!</code>{' '}
            は、保存していない変更があるレコードでは例外になります
            <Ref n={23} />。
          </p>
          <Code
            lang="ruby"
            code={`
account = Account.find(1)
account.balance = 1
Account.transaction { account.lock! }
# => RuntimeError: Locking a record with unpersisted changes is not supported. Use \`save\` to persist
#    the changes, or \`reload\` to discard them explicitly. Changed attributes: "balance".
`}
          />
          <h3>3. 条件付きの UPDATE で DB の値から計算する</h3>
          <p>
            <code>UPDATE accounts SET balance = balance - 1000</code> のように、DB の現在の値から計算させる方法です。<code>update_all</code> は変更した行の数を返すので、WHERE
            に「残高が足りる」という条件を入れ、0 行なら残高不足の例外にします。<code>update_all(["balance = balance - ?", amount])</code> のように配列で渡すと、<code>where("balance &gt;= ?", amount)</code>{' '}
            と同じく <code>?</code> の位置に amount の値が入ります。
          </p>
          <Code
            lang="ruby"
            title="atomic.rb"
            code={`
class InsufficientBalance < StandardError; end

def transfer_atomic(from_id, to_id, amount)
  Account.transaction do
    changed = Account.where(id: from_id).where("balance >= ?", amount)
                     .update_all(["balance = balance - ?", amount])
    raise InsufficientBalance, "残高が足りません" unless changed == 1
    sleep 0.3
    Account.where(id: to_id).update_all(["balance = balance + ?", amount])
  end
end

a = thread("A") { transfer_atomic(1, 2, 1000) }
b = thread("B", 0.1) { transfer_atomic(1, 2, 1000) }
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
 0.06s A  TRANSACTION (2.4ms)  BEGIN
 0.08s A  Account Update All (0.6ms)  ${updAll(1, "balance = balance - '1000'", " AND (balance >= '1000')")}
 0.10s B  TRANSACTION (0.1ms)  BEGIN
 0.38s A  Account Update All (0.7ms)  ${updAll(2, "balance = balance + '1000'")}
 0.40s A  TRANSACTION (11.2ms)  COMMIT
 0.40s B  Account Update All (296.5ms)  ${updAll(1, "balance = balance - '1000'", " AND (balance >= '1000')")}
 0.70s B  Account Update All (0.6ms)  ${updAll(2, "balance = balance + '1000'")}
 0.72s B  TRANSACTION (13.8ms)  COMMIT
最後の残高: [[1, 8000], [2, 12000], [3, 8000]]
`}
          />
          <p>
            B の1つ目の UPDATE は A の X ロックを待ち（296.5ms）、A の COMMIT 後の 9000 から 1000 を引きました。UPDATE は最新の確定済みの行で WHERE
            を評価するので、残高が足りるかどうかも COMMIT 後の値で判断されます。続けて 5000 ずつ送ると、B の UPDATE は 0 行になり、InsufficientBalance で ROLLBACK しました。口座1は 8000
            から始まり、A の COMMIT 後は 3000 です。B の UPDATE は A のロックを待った後、3000 に対して <code>balance &gt;= '5000'</code> を評価したので、条件に合う行がありませんでした。
          </p>
          <Code
            lang="text"
            title="5000 ずつ送った場合（口座1は 8000 から始まる）"
            code={`
 0.00s A  TRANSACTION (0.3ms)  BEGIN
 0.00s A  Account Update All (1.1ms)  ${updAll(1, "balance = balance - '5000'", " AND (balance >= '5000')")}
 0.10s B  TRANSACTION (0.5ms)  BEGIN
 0.30s A  Account Update All (0.5ms)  ${updAll(2, "balance = balance + '5000'")}
 0.32s A  TRANSACTION (12.6ms)  COMMIT
 0.32s B  Account Update All (218.9ms)  ${updAll(1, "balance = balance - '5000'", " AND (balance >= '5000')")}
 0.32s B  TRANSACTION (0.2ms)  ROLLBACK
 0.32s B  InsufficientBalance: 残高が足りません
最後の残高: [[1, 3000], [2, 17000], [3, 8000]]
`}
          />
          <p>
            ログの <code>'1000'</code> は、MySQL のアダプターが <code>?</code> に入れた数値を文字列にしてから引用したものです（<code>cast_bound_value</code>
            <Ref n={24} />
            ）。実測でも残高は正しく減りました。
          </p>
          <p>3つの書き方と楽観的ロックを比べます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">書き方</th>
                  <th scope="col">送る SQL</th>
                  <th scope="col">向いている場合</th>
                  <th scope="col">注意すること</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">lock・lock!・with_lock</th>
                  <td>SELECT … FOR UPDATE の後に UPDATE</td>
                  <td>読んだ値で判断する処理を1つの UPDATE に書けないとき</td>
                  <td>ロックを持つ時間を短くし、複数の行は同じ順でロックする</td>
                </tr>
                <tr>
                  <th scope="row">条件付きの update_all</th>
                  <td>UPDATE … SET balance = balance - ? WHERE … AND balance &gt;= ?</td>
                  <td>計算と条件を1つの UPDATE に書けるとき</td>
                  <td>検証とコールバックを通らない（<ChapterLink n={14} section="skip" />）。メモリー上のオブジェクトは古い値のまま</td>
                </tr>
                <tr>
                  <th scope="row">楽観的ロック（lock_version）</th>
                  <td>UPDATE … WHERE id = ? AND lock_version = ?</td>
                  <td>衝突がまれで、画面を開いてから保存するまでが長いとき</td>
                  <td>衝突すると StaleObjectError になるので、やり直し方を決める（<ChapterLink n={15} section="optimistic" />）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            CHECK 制約（balance &gt;= 0）があれば、どの経路の更新でも負の残高は保存されません。在庫を減らす処理での条件付きの UPDATE は<ChapterLink n={34} section="transaction-design" />
            で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'isolation',
      title: 'Isolation Level：ほかのトランザクションの変更の見え方',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            <Term en="isolation level">分離レベル</Term>は、同時に動くほかのトランザクションの変更が、自分の読み取りにどう見えるかを決める設定です。InnoDB は READ UNCOMMITTED・READ
            COMMITTED・REPEATABLE READ・SERIALIZABLE に対応し、既定は REPEATABLE READ です
            <Ref n={8} />。Rails の <code>transaction</code> のブロックは、指定しなければ DB の既定のレベルで動きます。ここまでの節の実験は、すべて REPEATABLE READ で実行したものです。
          </p>
          <Code
            lang="sql"
            code={`
-- 今の分離レベルを確かめる（実験の MySQL 8.4.13 では REPEATABLE-READ）
SELECT @@transaction_isolation;

-- 次の1つのトランザクションだけを READ COMMITTED にする
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
BEGIN;

-- この接続のこれ以降のトランザクションを READ COMMITTED にする
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
`}
          />
          <p>
            SESSION も GLOBAL も付けない SET TRANSACTION は次の1つのトランザクションだけを対象にし、トランザクションの途中では実行できません
            <Ref n={9} />。レベルの違いは次の3つの現象で説明されます。
          </p>
          <ul>
            <li>
              <Term en="dirty read">Dirty Read</Term>：B がまだ COMMIT していない変更（残高 5000）を A が読むことです。B が ROLLBACK すると、A は一度も確定しなかった値を読んだことになります。
            </li>
            <li>
              <Term en="non-repeatable read">Non-repeatable Read</Term>：A が同じ行を2回読む間に B が更新して COMMIT し、10000 が 5000 に変わることです。
            </li>
            <li>
              <Term en="phantom">Phantom</Term>：A が「残高が 9000 以上の口座」のような条件で2回読む間に、B が条件に合う行を INSERT して COMMIT し、行が増えることです
              <Ref n={11} />。
            </li>
          </ul>
          <p>InnoDB の通常の SELECT（ロック読み取りでない SELECT）で起きるかどうかは次のとおりです。「実測」はこの節の後半で確かめたものです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">分離レベル</th>
                  <th scope="col">Dirty Read</th>
                  <th scope="col">Non-repeatable Read</th>
                  <th scope="col">Phantom</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">READ UNCOMMITTED</th>
                  <td>起きる（実測）</td>
                  <td>起きる</td>
                  <td>起きる</td>
                </tr>
                <tr>
                  <th scope="row">READ COMMITTED</th>
                  <td>起きない</td>
                  <td>起きる（実測）</td>
                  <td>起きる（実測）</td>
                </tr>
                <tr>
                  <th scope="row">REPEATABLE READ（既定）</th>
                  <td>起きない</td>
                  <td>起きない（実測）</td>
                  <td>起きない（実測）。ロック読み取りは最新の行を読む</td>
                </tr>
                <tr>
                  <th scope="row">SERIALIZABLE</th>
                  <td>起きない</td>
                  <td>起きない</td>
                  <td>起きない。通常の SELECT もロック読み取りになる</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>シミュレーターで試す</h3>
          <SqlLab lesson="Isolation Level" title="シミュレーターで試す：Isolation Level" />
          <p>
            「Isolation / MVCC · 読み直し比較」のシナリオです。A の Isolation Level を選んでから開始し、最後まで進めます。A が口座1を読み、B が 5000 に UPDATE して COMMIT した後、A
            がもう一度読みます。READ COMMITTED と REPEATABLE READ で繰り返し、A の最後の結果を比べます。最後のステップの後も A のトランザクションは続いているので、繰り返すときは A の COMMIT
            を押してから Isolation Level を選び直し、「初期化して開始」を押します。
          </p>
          <p>
            結果の表示に出る Snapshot（スナップショット）は、トランザクションが通常の SELECT で読む対象にしている、ある時点で確定していた内容です。「Version ≤ 0」は Version 0
            までの値が見え、それより後に確定した Version 1 は見えないことを表します。
          </p>
          <ul>
            <li>READ COMMITTED：2回目は「SELECT accounts:1 → 5000 · Version 1 / 文ごとの最新の確定版」です。</li>
            <li>REPEATABLE READ：2回目も「SELECT accounts:1 → 10000 · Version 0 / 最初の一貫性読み取り時のSnapshot」で、A の Snapshot は「Version ≤ 0」です。</li>
            <li>
              SERIALIZABLE：手順が9ステップになります。A の SELECT が S ロックを取るので、4ステップ目の B の UPDATE が WAITING になり、6ステップ目の A の COMMIT で再開します。最後に A
              が新しいトランザクションで読むと 5000 です。
            </li>
            <li>
              READ UNCOMMITTED：このシナリオでは B の COMMIT の後に読むので 5000 です。未確定の値を読む様子は A を READ UNCOMMITTED のまま「Dirty Read ·
              未確定値とROLLBACK」で確かめます。B の UPDATE の直後の A の SELECT は「SELECT accounts:1 → 5000 · Version pending / Dirty Read · 他Txの未コミット更新」で、B の ROLLBACK
              の後は 10000 に戻ります。
            </li>
          </ul>
          <p>図 20-4 は4つのレベルの結果をまとめたものです。左が操作の順序、右が A の2回目の値です。</p>
          <Figure n="20-4" title="分離レベルによる読み直しの違い" caption="シミュレーターと、後に示す MySQL 8.4.13 での実測の結果をまとめた図。">
            <IsolationFigure />
          </Figure>

          <h3>なぜそうなるか</h3>
          <p>
            READ COMMITTED は SELECT の文ごとに新しい<Term en="snapshot">スナップショット</Term>（その時点で確定している内容）を作るので、ほかのトランザクションが COMMIT
            した後には結果が変わります。REPEATABLE READ は最初の読み取りで作ったスナップショットを終わりまで使います
            <Ref n={8} />。どちらも BEGIN の時点の値を読むわけではありません。
          </p>
          <p>
            SERIALIZABLE では、InnoDB がトランザクションの中の通常の SELECT を SELECT … FOR SHARE に変えます
            <Ref n={8} />。読んだ行に S ロックが付くので、B の UPDATE は A が終わるまで待ちます。READ UNCOMMITTED の SELECT は、未確定の値を読むことがあります。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>
            <code>transaction(isolation: :read_committed)</code> のように指定でき、値は <code>:read_uncommitted</code>・<code>:read_committed</code>・<code>:repeatable_read</code>・
            <code>:serializable</code> です。mysql2・trilogy・postgresql のアダプターが対応しています
            <Ref n={18} />。シミュレーターと同じ手順を、A のレベルを変えて実行しました。
          </p>
          <Code
            lang="ruby"
            title="isolation.rb"
            code={`
def read1 = Account.find(1).balance

def scenario(level)
  options = level ? { isolation: level } : {}
  a = thread("A") do
    Account.transaction(**options) do
      say "1回目 → #{read1}"
      sleep 0.4
      say "2回目 → #{read1}"
    end
    say "COMMIT 後 → #{read1}"
  end
  b = thread("B", 0.1) do
    Account.transaction { Account.where(id: 1).update_all("balance = 5000") }
  end
  [a, b].each(&:join)
end

scenario(nil)              # 既定（REPEATABLE READ）
scenario(:read_committed)
scenario(:serializable)
`}
          />
          <p>
            <code>def read1 = …</code> は本体が1つの式だけのメソッドを1行で定義する Ruby の書き方で、read1 は口座1を検索して残高を返します。<code>transaction(**options)</code> は options
            のハッシュをキーワード引数として渡します。level が nil のときは空のハッシュなので、引数なしの <code>Account.transaction</code> と同じです。A は 0.4 秒空けて2回読み、その間に B が口座1を 5000
            に変えて COMMIT します。
          </p>
          <Code
            lang="text"
            title="実行結果（毎回、口座1を 10000 に戻してから実行。COMMIT 後の SELECT などのログは一部を省略）"
            code={`
--- 既定（REPEATABLE READ）
 0.02s A  TRANSACTION (0.3ms)  BEGIN
 0.05s A  Account Load (0.5ms)  ${sel(1)}
 0.05s A  1回目 → 10000
 0.12s B  TRANSACTION (0.1ms)  BEGIN
 0.12s B  Account Update All (0.7ms)  ${updAll(1, 'balance = 5000')}
 0.14s B  TRANSACTION (15.1ms)  COMMIT
 0.45s A  Account Load (0.6ms)  ${sel(1)}
 0.45s A  2回目 → 10000
 0.46s A  TRANSACTION (0.2ms)  COMMIT
 0.46s A  COMMIT 後 → 5000
--- READ COMMITTED
 0.00s A  TRANSACTION (0.3ms)  SET TRANSACTION ISOLATION LEVEL READ COMMITTED
 0.00s A  TRANSACTION (0.2ms)  BEGIN
 0.00s A  Account Load (1.1ms)  ${sel(1)}
 0.00s A  1回目 → 10000
 0.12s B  TRANSACTION (8.8ms)  BEGIN
 0.12s B  Account Update All (9.6ms)  ${updAll(1, 'balance = 5000')}
 0.13s B  TRANSACTION (11.3ms)  COMMIT
 0.41s A  Account Load (1.9ms)  ${sel(1)}
 0.41s A  2回目 → 5000
 0.41s A  TRANSACTION (0.4ms)  COMMIT
 0.41s A  COMMIT 後 → 5000
--- SERIALIZABLE
 0.00s A  TRANSACTION (0.2ms)  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
 0.00s A  TRANSACTION (0.2ms)  BEGIN
 0.00s A  Account Load (1.3ms)  ${sel(1)}
 0.00s A  1回目 → 10000
 0.11s B  TRANSACTION (0.2ms)  BEGIN
 0.41s A  Account Load (0.5ms)  ${sel(1)}
 0.41s A  2回目 → 10000
 0.41s A  TRANSACTION (0.6ms)  COMMIT
 0.41s A  COMMIT 後 → 10000
 0.41s B  Account Update All (302.5ms)  ${updAll(1, 'balance = 5000')}
 0.42s B  TRANSACTION (11.2ms)  COMMIT
`}
          />
          <p>
            レベルを指定すると、Rails は BEGIN の前に <code>SET TRANSACTION ISOLATION LEVEL</code> を送ります
            <Ref n={21} />。2回目の値は REPEATABLE READ で 10000、READ COMMITTED で 5000 で、シミュレーターと同じでした。SERIALIZABLE では B の UPDATE が約 0.3 秒待ち、A の COMMIT
            の直後に終わりました（A の COMMIT 後の値が 10000 なのは、B がまだ終わっていなかったためです）。READ UNCOMMITTED では、A が B の ROLLBACK 前の 5000 を読みました。
          </p>
          <Code
            lang="text"
            title="READ UNCOMMITTED（B は UPDATE の 0.25 秒後に ActiveRecord::Rollback で取り消す）"
            code={`
 0.00s B  TRANSACTION (0.7ms)  BEGIN
 0.02s B  Account Update All (18.7ms)  ${updAll(1, 'balance = 5000')}
 0.10s A  TRANSACTION (0.7ms)  SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
 0.10s A  TRANSACTION (0.2ms)  BEGIN
 0.10s A  Account Load (1.4ms)  ${sel(1)}
 0.11s A  B の ROLLBACK 前 → 5000
 0.28s B  TRANSACTION (3.4ms)  ROLLBACK
 0.41s A  Account Load (0.5ms)  ${sel(1)}
 0.41s A  B の ROLLBACK 後 → 10000
`}
          />
          <p>
            Phantom はシミュレーターでは再現しないので、MySQL で確かめました。口座1・2が 10000、口座3が 8000 なので、「残高が 9000 以上」の件数は最初は 2 です。A が2回数える間に、B が残高 9500
            の口座を INSERT して COMMIT します。
          </p>
          <Code
            lang="ruby"
            title="phantom.rb（1つ目の実行。2つ目以降は A の分離レベルと読み方を変えた）"
            code={`
def rich(relation = Account) = relation.where("balance >= ?", 9000).count

a = thread("A") do
  Account.transaction(isolation: :read_committed) do
    say "件数 → #{rich}"
    sleep 0.4
    say "件数 → #{rich}"
  end
end
b = thread("B", 0.1) { Account.create!(user_id: 3, balance: 9500) }
`}
          />
          <Code
            lang="text"
            title="実行結果（ログは一部を省略）"
            code={`
--- READ COMMITTED
 0.01s A  Account Count (0.9ms)  ${countSql()}
 0.01s A  件数 → 2
 0.12s B  Account Create (1.1ms)  INSERT INTO \`accounts\` (\`user_id\`, \`balance\`) VALUES (3, 9500)
 0.13s B  TRANSACTION (12.6ms)  COMMIT
 0.41s A  件数 → 3

--- REPEATABLE READ（2回目の後に lock("FOR SHARE") でも数える）
 0.00s A  件数 → 2
 0.12s B  TRANSACTION (15.7ms)  COMMIT
 0.40s A  件数 → 2
 0.40s A  Account Count (0.3ms)  ${countSql(' FOR SHARE')}
 0.40s A  FOR SHARE の件数 → 3

--- REPEATABLE READ（最初から FOR SHARE で数える）
 0.00s A  FOR SHARE の件数 → 2
 0.10s B  TRANSACTION (0.2ms)  BEGIN
 0.25s data_locks:
        A | accounts | - | TABLE | IS | GRANTED | -
        A | accounts | PRIMARY | RECORD | S | GRANTED | supremum pseudo-record
        A | accounts | PRIMARY | RECORD | S | GRANTED | 1
        A | accounts | PRIMARY | RECORD | S | GRANTED | 2
        A | accounts | PRIMARY | RECORD | S | GRANTED | 3
        B | accounts | - | TABLE | IX | GRANTED | -
        B | accounts | PRIMARY | RECORD | X,INSERT_INTENTION | WAITING | supremum pseudo-record
 0.40s A  FOR SHARE の件数 → 2
 0.40s A  TRANSACTION (0.2ms)  COMMIT
 0.40s B  Account Create (302.3ms)  INSERT INTO \`accounts\` (\`user_id\`, \`balance\`) VALUES (3, 9500)
`}
          />
          <p>
            READ COMMITTED では2回目が 3 になり、Phantom が起きました。REPEATABLE READ の通常の SELECT は 2 のままで、同じトランザクションの FOR SHARE は最新の内容を読んで 3 でした。
          </p>
          <p>
            最初から FOR SHARE で数えると、B の INSERT は A の COMMIT まで約 0.3 秒待ちました。data_locks で REC_NOT_GAP の付かない S は、行とその前の隙間をまとめてロックする
            <Term en="next-key lock">next-key ロック</Term>で、supremum pseudo-record は最後の行より後ろの隙間を表す仮の行です
            <Ref n={5} />。balance に索引が無いので A は全行と隙間をロックし、B が行を入れる前に隙間に掛ける X,INSERT_INTENTION が待たされています。InnoDB はこの next-key ロックで Phantom
            を防ぎます
            <Ref n={11} />。
          </p>
          <p>
            次の図は最初から FOR SHARE で数えたときの data_locks を、PRIMARY 索引のレコードと隙間の並びに置き直したものです。上の段が A の持つロック、中の段が索引のレコードと隙間、下の段が待っている B の INSERT です。
          </p>
          <Figure title="next-key ロックと隙間" caption="上の実行結果の data_locks を図にしたもの。破線の箱は隙間と仮の行を表す。TABLE の IS・IX は省略している。">
            <NextKeyFigure />
          </Figure>
          <p>分離レベルは新しく始めるトランザクションにだけ指定できます。開いているトランザクションに参加するときに指定すると例外になります。</p>
          <Code
            lang="ruby"
            code={`
Account.transaction do
  Account.find(1)
  Account.transaction(isolation: :read_committed) { }
end
#   TRANSACTION (0.1ms)  BEGIN
#   Account Load (0.6ms)  ${sel(1)}
#   TRANSACTION (0.2ms)  ROLLBACK
# => ActiveRecord::TransactionIsolationError: cannot set isolation when joining a transaction
`}
          />

          <h3>注意点</h3>
          <ul>
            <li>
              既定の REPEATABLE READ では、<code>transaction</code> のブロックの中で一度読んだ行を通常の検索で読み直しても、その間にほかの処理が COMMIT
              した変更は見えません（上の実測の「2回目 → 10000」）。ブロックの中で「ほかのリクエストやジョブが更新したはずの値が古い」という調査では、最初の検索がどの時点で実行されたかを確かめます。
            </li>
            <li>
              既定の分離レベルは DB の設定で決まり、MySQL では <code>SELECT @@transaction_isolation</code> で確かめます。すべての接続で変えるには、database.yml の <code>variables</code> に{' '}
              <code>transaction_isolation: "READ-COMMITTED"</code> を書きます（実測で <code>@@SESSION.transaction_isolation</code> が READ-COMMITTED になりました）。読み取りの結果とロックの範囲が変わるので、アプリケーション全体で確かめてから変えます。
            </li>
            <li>
              リクエストやジョブの中ではクエリキャッシュ（同じ SELECT の結果を Rails が覚えておく仕組み）が有効で、同じ <code>Account.find(1)</code> の2回目は SQL
              を送らずに1回目の結果を返します（<ChapterLink n={12} section="query-cache" />）。<code>ActiveRecord::Base.cache</code> の中で試すと、2回目は「CACHE Account Load」になり、
              <code>lock</code> を付けた SELECT は毎回 SQL を送りました。
            </li>
            <li>シミュレーターは Phantom・範囲の検索・gap ロックを再現せず、SERIALIZABLE は行単位の S ロックだけの限られたモデルです。</li>
          </ul>
          <Callout kind="v72">
            <p>
              Rails 8.1.0 で、ブロックの中で始まるトランザクションの分離レベルを変える <code>ActiveRecord.with_transaction_isolation_level(:read_committed) {'{ … }'}</code>{' '}
              と、指定された分離レベルを返す <code>current_transaction.isolation</code> が追加されました
              <Ref n={25} />。Rails 7.2 ではトランザクションごとに <code>isolation:</code> を指定します。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'mvcc',
      title: 'MVCC：行のバージョンとスナップショット',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            前の節の REPEATABLE READ の A は、行の値が 5000 に変わった後でも 10000 を読みました。InnoDB は行を変更するとき、変更前の行を作り直すための情報を undo ログに残すためです
            <Ref n={12} />。行に複数のバージョンがあるように扱い、トランザクションごとに読めるバージョンを選ぶ方法を <Term en="Multi-Version Concurrency Control">MVCC</Term> と呼びます。
          </p>
          <p>
            ロックを取らない通常の SELECT はスナップショットを読みます。これを<Term en="consistent read">一貫性読み取り</Term>と呼び、表にロックを掛けないので、ほかのトランザクションは同時に同じ行を変更できます
            <Ref n={10} />。REPEATABLE READ のスナップショットは、BEGIN の時点ではなく最初の一貫性読み取りの時点で作られます。BEGIN と同時に作るには START TRANSACTION WITH CONSISTENT
            SNAPSHOT で始めます
            <Ref n={2} />。
          </p>
          <p>
            ロック読み取り（FOR SHARE・FOR UPDATE）と UPDATE・DELETE は、最新の確定済みの行を対象にします。自分の変更は確定する前でも自分の SELECT から見えます
            <Ref n={10} />。トランザクションの中のすべての SQL が、同じスナップショットを見るわけではありません。
          </p>
          <Code
            lang="sql"
            code={`
SELECT balance FROM accounts WHERE id = 1;            -- 一貫性読み取り（スナップショット）
SELECT balance FROM accounts WHERE id = 1 FOR SHARE;  -- ロック読み取り（最新の確定済みの行）
START TRANSACTION WITH CONSISTENT SNAPSHOT;          -- BEGIN と同時にスナップショットを作る
`}
          />

          <h3>シミュレーターで試す</h3>
          <SqlLab lesson="MVCC" title="シミュレーターで試す：MVCC" />
          <p>
            Isolation Level の節と同じ「読み直し比較」のシナリオです。A を REPEATABLE READ のまま開始し、6ステップ進めます。MVCC の欄の accounts.id = 1 には「Version 0 · balance =
            10000」と、その上に「Version 1 · balance = 5000」（created by B#2）が並び、Version 0 に「← Tx A の直近SELECT」が付きます。続けて次の順に操作します。
          </p>
          <ol>
            <li>B で BEGIN、「SELECT」、「SQL実行」と押します。新しく始めた B は Version 1 の 5000 を読み、同じ行の別のバージョンを A と B が読んでいる状態になります。</li>
            <li>A で「S LOCK」「SQL実行」と押すと「5000 · Version 1 / Locking Read · 最新の確定版」になり、A の印も Version 1 に移ります。</li>
            <li>A で「SELECT」「SQL実行」と押すと、また「10000 · Version 0」です。Snapshot は「Version ≤ 0」のままです。</li>
            <li>
              A のセッションSQL で <code>UPDATE accounts SET balance = balance - 1000 WHERE id = 1;</code> を実行すると「5000 → 4000（未コミット / X LOCK）」で、最新の 5000 から引いています。
            </li>
            <li>A で「SELECT」「SQL実行」と押すと「4000 · Version pending / 自分の未コミット更新」です。B で「SQL実行」を押しても、B は 5000 のままです。</li>
            <li>A の COMMIT で「Version 2 · balance = 4000」（created by A#1）ができます。</li>
          </ol>
          <p>
            スナップショットが作られる時点も確かめます。「Simulator初期化」を押して A と B で BEGIN し、B で <code>UPDATE accounts SET balance = 5000 WHERE id = 1;</code> を実行して COMMIT
            します。その後に A で「SELECT」「SQL実行」と押すと、A は 5000（Version 1）を読み、Snapshot は「Version ≤ 1」になります。スナップショットが A の最初の SELECT のときに作られたためです。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            A のスナップショットは最初の SELECT の時点（Version 0 まで）で作られたので、その後に B が COMMIT した Version 1 は A の通常の SELECT からは見えず、後から始めた B は Version 1
            を読みます。トランザクションごとに違うバージョンを読めるので、通常の SELECT は更新を待たず、更新も通常の SELECT を待ちません。
          </p>
          <p>
            ロック読み取りと UPDATE は最新の確定済みのバージョンを対象にするので、A の UPDATE は 5000 から 1000 を引き、B の確定した変更を上書きしませんでした。自分の UPDATE の結果は REPEATABLE READ
            でも自分から見えるので、スナップショットで読む値と自分の変更を分けて考えます。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>Active Record の通常の検索は一貫性読み取り、<code>lock</code> を付けた検索はロック読み取りです。シミュレーターと同じ手順を MySQL で実行しました。</p>
          <Code
            lang="ruby"
            title="mvcc.rb"
            code={`
def read1(relation = Account) = relation.find(1).balance

a = thread("A") do
  Account.transaction do
    say "通常の SELECT → #{read1}"
    sleep 0.4
    say "通常の SELECT → #{read1}"
    say "FOR SHARE → #{read1(Account.lock('FOR SHARE'))}"
    say "通常の SELECT → #{read1}"
    Account.where(id: 1).update_all("balance = balance - 1000")
    say "通常の SELECT → #{read1}"
  end
end
b = thread("B", 0.1) do
  Account.transaction { Account.where(id: 1).update_all("balance = 5000") }
end
`}
          />
          <Code
            lang="text"
            title="実行結果（口座1は 10000 から始めた）"
            code={`
 0.01s A  TRANSACTION (0.4ms)  BEGIN
 0.02s A  Account Load (0.3ms)  ${sel(1)}
 0.03s A  通常の SELECT → 10000
 0.10s B  TRANSACTION (0.2ms)  BEGIN
 0.11s B  Account Update All (0.9ms)  ${updAll(1, 'balance = 5000')}
 0.12s B  TRANSACTION (9.0ms)  COMMIT
 0.43s A  Account Load (0.5ms)  ${sel(1)}
 0.43s A  通常の SELECT → 10000
 0.43s A  Account Load (0.3ms)  ${sel(1, ' FOR SHARE')}
 0.43s A  FOR SHARE → 5000
 0.43s A  Account Load (0.3ms)  ${sel(1)}
 0.43s A  通常の SELECT → 10000
 0.43s A  Account Update All (0.4ms)  ${updAll(1, 'balance = balance - 1000')}
 0.43s A  Account Load (0.2ms)  ${sel(1)}
 0.43s A  通常の SELECT → 4000
 0.45s A  TRANSACTION (18.2ms)  COMMIT
最後の残高: [[1, 4000], [2, 10000], [3, 8000]]
`}
          />
          <p>
            FOR SHARE で 5000 を読んだ直後でも、通常の SELECT は 10000 を返しました。UPDATE は最新の 5000 から 1000 を引き、その後の通常の SELECT は自分の変更の 4000 を返しました。図 20-5
            は口座1のバージョンと、A の3種類の読み取りがどれを対象にしたかを表したものです。
          </p>
          <Figure n="20-5" title="行のバージョンとスナップショット" caption="上の実行結果をもとにした模式図。InnoDB の read view と undo ログの実際の構造は省略している。">
            <MvccFigure />
          </Figure>
          <p>
            スナップショットが作られる時点も確かめました。Rails の transaction は BEGIN を最初の SQL の直前まで遅らせるので、A のスレッドが借りた接続 <code>c</code> に BEGIN を直接送りました。
            <code>c.execute("…")</code> は渡した SQL の文字列をそのまま MySQL に送るメソッドです。モデルを通さないので、ログの行には「Account Load」のような名前が付きません。
          </p>
          <Code
            lang="text"
            title="A は BEGIN（または START TRANSACTION WITH CONSISTENT SNAPSHOT）の 0.3 秒後に最初の SELECT を送る。B は 0.1 秒に口座1を 5000 にして確定する"
            code={`
--- c.execute("BEGIN")
 0.00s A  (0.1ms)  BEGIN
 0.11s B  Account Update All (9.7ms)  ${updAll(1, 'balance = 5000')}
 0.30s A  (0.4ms)  SELECT balance FROM accounts WHERE id = 1
 0.30s A  最初の SELECT → 5000

--- c.execute("START TRANSACTION WITH CONSISTENT SNAPSHOT")
 0.00s A  (0.2ms)  START TRANSACTION WITH CONSISTENT SNAPSHOT
 0.11s B  Account Update All (7.5ms)  ${updAll(1, 'balance = 5000')}
 0.30s A  (0.4ms)  SELECT balance FROM accounts WHERE id = 1
 0.30s A  最初の SELECT → 10000
`}
          />
          <p>
            BEGIN で始めると、BEGIN の後に B が確定した 5000 が A の最初の SELECT で見え、START TRANSACTION WITH CONSISTENT SNAPSHOT で始めると 10000 でした。Rails の transaction
            のブロックでは、スナップショットはブロックの中の最初の通常の SELECT の時点で作られます。
          </p>

          <h3>注意点</h3>
          <ul>
            <li>
              REPEATABLE READ で読んだ値から計算して書き戻すと、ほかのトランザクションが確定した変更を上書きします。読んだ値で判断して更新するときは、<code>lock</code> で読むか条件付きの UPDATE
              を使います（「送金で更新の消失を防ぐ書き方」の節）。
            </li>
            <li>
              長いトランザクションがあると、InnoDB はその読み取りに要る古いバージョンを消せません。MySQL のマニュアルは一貫性読み取りだけのトランザクションも定期的に COMMIT するよう勧めています。COMMIT
              しないと undo ログを消せず、ロールバックセグメント（undo ログを入れる領域）が大きくなりすぎることがあります
              <Ref n={12} />。トランザクションの範囲は必要な処理だけに絞ります。
            </li>
            <li>
              シミュレーターの Version は COMMIT ごとに1増える学習用の番号で、InnoDB の read view（InnoDB が内部で持つスナップショットのデータ）と undo ログを簡略化したものです。MVCC の欄の印は直近の SELECT
              の履歴で、分離レベルを変えたり、ほかのトランザクションが COMMIT したりしただけでは動きません。古いバージョンを消す処理（purge）も再現しません。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'deadlock',
      title: 'Deadlock：待ちの循環と再試行',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            2つのトランザクションが互いに相手のロックを待つと、どちらも進めなくなります。これを<Term en="deadlock">デッドロック</Term>と呼びます
            <Ref n={13} />。A が口座1→2、B が口座2→1の順に更新すると起きます。
          </p>
          <Code
            lang="sql"
            code={`
-- A                                                -- B
BEGIN;                                              BEGIN;
UPDATE accounts SET balance = 9000 WHERE id = 1;
                                                    UPDATE accounts SET balance = 8000 WHERE id = 2;
UPDATE accounts SET balance = 9000 WHERE id = 2;   -- B のロックを待つ
                                                    UPDATE accounts SET balance = 8000 WHERE id = 1;
                                                    -- A のロックを待つ → 待ちが循環する
`}
          />
          <p>
            「待っている側 → ロックを持っている側」の矢印で待ちの関係を表した図を Wait-for Graph と呼びます。A→B と B→A がそろって矢印が循環すればデッドロックで、トランザクションが2つでも起きます。長く待っていても循環が無ければロック待ちで、待ち時間の長さではデッドロックかどうかを区別できません。
          </p>
          <p>
            InnoDB はデッドロックを自動で検出し（innodb_deadlock_detect。既定で有効）、一方を犠牲（victim）に選んでロールバックします。選ぶのは小さいトランザクションで、大きさは INSERT・UPDATE・DELETE
            した行の数で決めます
            <Ref n={14} />。犠牲になった側はエラー 1213（Deadlock found when trying to get lock; try restarting transaction）を受け取り、トランザクション全体が取り消されます
            <Ref n={4} />。
          </p>
          <p>
            デッドロックでないロック待ちは、innodb_lock_wait_timeout（既定 50 秒）を超えるとエラー 1205（Lock wait timeout exceeded; try restarting
            transaction）になり、取り消されるのは待っていた文だけです。全体を取り消すには、サーバーを --innodb-rollback-on-timeout で起動します
            <Ref n={16} />
            <Ref n={4} />。
          </p>

          <h3>シミュレーターで試す</h3>
          <SqlLab lesson="Deadlock" title="シミュレーターで試す：Deadlock" />
          <p>「Deadlock · 待機の循環」のシナリオで開始し、6ステップ目まで進めます。</p>
          <ol>
            <li>
              5ステップ目で、口座1をロックした A が口座2を UPDATE しようとして WAITING になります。Wait-for Graph に「A waits for B」が出て、「Lock Waitが発生しています。循環がなければ、この状態だけではDeadlockではありません。」と表示されます。
            </li>
            <li>
              6ステップ目で、口座2をロックした B が口座1を UPDATE しようとして WAITING になり、「B waits for A」が加わって「DEADLOCK DETECTED · A → B → A」と表示されます。Lock Table には HELD
              と WAITING の X LOCK が2つずつ並びます。
            </li>
            <li>B の ROLLBACK を押すと、B の未確定の変更とロックが手放され、A の UPDATE が自動で再開します。A の COMMIT で、両方の行に「Version 1 · balance = 9000」ができます。</li>
          </ol>
          <p>
            次に「同じ順番でロックを取る」を選び、「初期化して開始」を押します。A と B はどちらも口座1、口座2の順に更新します。4ステップ目では B が口座1のロックを待ち、矢印は B から A へ向かいます。6ステップ目で A がコミットすると、待っていた B の更新が自動で再開します。最後まで進めると両方のトランザクションが確定します。順番をそろえてもロック待ちは残りますが、A と B の間に待ちの循環は生じません。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            A は口座1、B は口座2のロックを持ったまま相手の行を要求したので、待ちが循環し、どちらかがロックを手放すまで進めません。シミュレーターは観察のために犠牲を選ばず、利用者が ROLLBACK で選びますが、InnoDB
            は検出した時点で自動で一方をロールバックします。
          </p>
          <p>
            対策は3つあります。複数の行を毎回同じ順序（例えば id の小さい順）でロックすること、トランザクションを短くしてロックを持つ時間を減らすこと、デッドロックで失敗したらトランザクション全体をやり直すことです。MySQL
            のマニュアルもやり直せるようにしておくこと、トランザクションを小さく短くすること、同じ順序で操作することを勧めています
            <Ref n={15} />。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>口座1→2 と口座2→1 の送金を、2つのスレッドで同時に実行しました。</p>
          <Code
            lang="ruby"
            title="deadlock.rb"
            code={`
def transfer(from_id, to_id, amount)
  Account.transaction do
    Account.where(id: from_id).update_all(["balance = balance - ?", amount])
    sleep 0.3
    Account.where(id: to_id).update_all(["balance = balance + ?", amount])
  end
end

a = thread("A") { transfer(1, 2, 1000) }
b = thread("B", 0.1) { transfer(2, 1, 500) }
`}
          />
          <Code
            lang="text"
            title="実行結果（口座1・2は 10000 から始めた）"
            code={`
 0.03s A  TRANSACTION (0.3ms)  BEGIN
 0.04s A  Account Update All (1.7ms)  ${updAll(1, "balance = balance - '1000'")}
 0.11s B  TRANSACTION (0.8ms)  BEGIN
 0.11s B  Account Update All (1.6ms)  ${updAll(2, "balance = balance - '500'")}
 0.41s A  Account Update All (72.8ms)  ${updAll(2, "balance = balance + '1000'")}
 0.42s B  Account Update All (5.9ms)  ${updAll(1, "balance = balance + '500'")}
 0.42s B  TRANSACTION (0.2ms)  ROLLBACK
 0.42s B  ActiveRecord::Deadlocked: Mysql2::Error: Deadlock found when trying to get lock; try restarting transaction
 0.43s A  TRANSACTION (17.5ms)  COMMIT
最後の残高: [[1, 9000], [2, 11000], [3, 8000]]
`}
          />
          <p>
            ログは SQL が終わった順に出るので、A の2つ目の UPDATE（72.8ms）は、送った時刻より後の 0.41 秒に出ています。送った時刻の順に並べると次のようになります。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">時刻</th>
                  <th scope="col">A（口座1 → 口座2）</th>
                  <th scope="col">B（口座2 → 口座1）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">0.04s</th>
                  <td>口座1を UPDATE。口座1の X ロックを持つ</td>
                  <td></td>
                </tr>
                <tr>
                  <th scope="row">0.11s</th>
                  <td>sleep 0.3 の途中</td>
                  <td>口座2を UPDATE。口座2の X ロックを持つ</td>
                </tr>
                <tr>
                  <th scope="row">0.34s ごろ</th>
                  <td>口座2の UPDATE を送る。B の X ロックを待つ</td>
                  <td>sleep 0.3 の途中</td>
                </tr>
                <tr>
                  <th scope="row">0.41s</th>
                  <td>待っている</td>
                  <td>口座1の UPDATE を送る。A の X ロックを待つことになり、待ちが循環する</td>
                </tr>
                <tr>
                  <th scope="row">0.41〜0.42s</th>
                  <td>B のロックが手放され、口座2の UPDATE が終わる</td>
                  <td>InnoDB が B をロールバックする。UPDATE はエラー 1213 で返る</td>
                </tr>
                <tr>
                  <th scope="row">0.42〜0.43s</th>
                  <td>COMMIT</td>
                  <td>Rails が ROLLBACK を送り、Deadlocked がブロックの外へ出る</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            B の2つ目の UPDATE でデッドロックになり、Rails は MySQL のエラー 1213 を <code>ActiveRecord::Deadlocked</code> に変換しました。B のブロックからは例外が出て ROLLBACK が送られ、A
            はロックを得て COMMIT したので、残高は A の送金だけが反映された 9000 と 11000 です。直後に SHOW ENGINE INNODB STATUS を実行すると、LATEST DETECTED DEADLOCK
            の欄に、2つのトランザクションが持つロックと待つロック、ロールバックしたトランザクションが出ていました。
          </p>
          <Code
            lang="text"
            title="SHOW ENGINE INNODB STATUS の LATEST DETECTED DEADLOCK（抜粋。行の内容の16進表示は「主キーが 1 の行」のように書き換えた）"
            code={`
*** (1) TRANSACTION:
TRANSACTION 1981, ACTIVE 0 sec starting index read
LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s), undo log entries 1
UPDATE \`accounts\` SET balance = balance + '1000' WHERE \`accounts\`.\`id\` = 2
*** (1) HOLDS THE LOCK(S):
RECORD LOCKS ... index PRIMARY of table \`bank\`.\`accounts\` trx id 1981 lock_mode X locks rec but not gap
  （主キーが 1 の行）
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS ... index PRIMARY of table \`bank\`.\`accounts\` trx id 1981 lock_mode X locks rec but not gap waiting
  （主キーが 2 の行）

*** (2) TRANSACTION:
TRANSACTION 1982, ACTIVE 0 sec starting index read
LOCK WAIT 3 lock struct(s), heap size 1128, 2 row lock(s), undo log entries 1
UPDATE \`accounts\` SET balance = balance + '500' WHERE \`accounts\`.\`id\` = 1
*** (2) HOLDS THE LOCK(S):
  （主キーが 2 の行の X ロック）
*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
  （主キーが 1 の行の X ロックを待つ）

*** WE ROLL BACK TRANSACTION (2)
`}
          />
          <p>
            (1) が A、(2) が B で、どちらも undo log entries が 1（変更した行が1行）でした。InnoDB は (2) をロールバックしました。すべてのデッドロックを MySQL のエラーログに残すには
            innodb_print_all_deadlocks を有効にします
            <Ref n={13} />。
          </p>
          <p>この出力は、トランザクションごとに次の3か所を読みます。</p>
          <ul>
            <li>TRANSACTION の下の SQL：待たされていた文です。(1) は口座2の UPDATE、(2) は口座1の UPDATE です。</li>
            <li>
              HOLDS THE LOCK(S)：そのトランザクションが持っているロックです。「lock_mode X locks rec but not gap」は data_locks の X,REC_NOT_GAP と同じで、行だけの X ロックを表します。
            </li>
            <li>WAITING FOR THIS LOCK TO BE GRANTED：待っているロックです。(1) が待つ行（主キー 2）を (2) が持ち、(2) が待つ行（主キー 1）を (1) が持っているので、待ちが循環しています。</li>
          </ul>
          <p>
            本番の環境で ActiveRecord::Deadlocked が記録されたときは、この欄の2つの SQL がアプリケーションのどの処理から送られたかを探し、それぞれの処理が行をロックする順序を比べます。順序が逆になっている組が見つかれば、後で示すように順序をそろえます。
          </p>
          <p>デッドロックでトランザクション全体が取り消されることを、SQL を直接送って確かめました。犠牲になった B は ROLLBACK を送る前に、最初に変更した口座2を読みます。</p>
          <Code
            lang="text"
            title="接続に SQL を直接送った場合（c.execute。B は例外を捕まえた後で口座2を読む）"
            code={`
 0.00s A  (0.3ms)  BEGIN
 0.00s A  (0.5ms)  UPDATE accounts SET balance = balance - 1000 WHERE id = 1
 0.11s B  (0.4ms)  BEGIN
 0.11s B  (0.6ms)  UPDATE accounts SET balance = balance - 500 WHERE id = 2
 0.41s A  (104.7ms)  UPDATE accounts SET balance = balance + 1000 WHERE id = 2
 0.41s B  (7.6ms)  UPDATE accounts SET balance = balance + 500 WHERE id = 1
 0.41s B  ActiveRecord::Deadlocked: Mysql2::Error: Deadlock found when trying to get lock; try restarting transaction
 0.41s B  (0.4ms)  SELECT balance FROM accounts WHERE id = 2
 0.41s B  ROLLBACK を送る前に id=2 を読む → 10000
 0.43s A  (21.2ms)  COMMIT
`}
          />
          <p>
            B の最初の UPDATE（10000 → 9500）は、ROLLBACK を送る前に取り消されていました。ロック待ちのタイムアウトでは結果が違います。B の innodb_lock_wait_timeout を 2 秒にし、A
            が口座1を FOR UPDATE でロックしたまま 3 秒待つ間に確かめました。
          </p>
          <Code
            lang="text"
            title="ロック待ちのタイムアウト（接続に SQL を直接送った場合。A のログは一部を省略）"
            code={`
 0.00s A  Account Load (0.7ms)  ${sel(1, ' FOR UPDATE')}
 0.10s B  (0.2ms)  BEGIN
 0.10s B  (0.5ms)  UPDATE accounts SET balance = balance - 500 WHERE id = 2
 2.10s B  (2001.1ms)  UPDATE accounts SET balance = balance + 500 WHERE id = 1
 2.10s B  ActiveRecord::LockWaitTimeout: Mysql2::Error::TimeoutError: Lock wait timeout exceeded; try restarting transaction
 2.10s B  (0.7ms)  SELECT balance FROM accounts WHERE id = 2
 2.10s B  id=2 を読む → 9500
 2.11s B  (6.8ms)  ROLLBACK
`}
          />
          <p>
            タイムアウトで取り消されたのは待っていた UPDATE だけで、口座2の 9500 は残り、トランザクションも続いていました。Rails の transaction のブロックでは、どちらの場合も例外がブロックの外へ出るときに
            ROLLBACK を送るので、ブロックの中の変更はすべて取り消されます。
          </p>
          <Code
            lang="text"
            title="同じタイムアウトを transaction のブロックの中で起こした場合"
            code={`
 0.11s B  TRANSACTION (0.4ms)  BEGIN
 0.11s B  Account Update All (2.8ms)  ${updAll(2, 'balance = balance - 500')}
 2.12s B  Account Update All (2005.7ms)  ${updAll(1, 'balance = balance + 500')}
 2.13s B  TRANSACTION (9.1ms)  ROLLBACK
 2.13s B  ActiveRecord::LockWaitTimeout: Mysql2::Error::TimeoutError: Lock wait timeout exceeded; try restarting transaction
最後の残高: [[1, 10000], [2, 10000], [3, 8000]]
`}
          />
          <p>
            Active Record の例外と MySQL のエラーの対応は次のとおりです
            <Ref n={21} />
            <Ref n={22} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">MySQL のエラー</th>
                  <th scope="col">Active Record の例外</th>
                  <th scope="col">親のクラス</th>
                  <th scope="col">MySQL が取り消す範囲</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">1213 ER_LOCK_DEADLOCK</th>
                  <td>ActiveRecord::Deadlocked</td>
                  <td>TransactionRollbackError（その親は StatementInvalid）</td>
                  <td>トランザクション全体</td>
                </tr>
                <tr>
                  <th scope="row">1205 ER_LOCK_WAIT_TIMEOUT</th>
                  <td>ActiveRecord::LockWaitTimeout</td>
                  <td>StatementInvalid</td>
                  <td>待っていた文だけ（既定）</td>
                </tr>
                <tr>
                  <th scope="row">3819 ER_CHECK_CONSTRAINT_VIOLATED</th>
                  <td>ActiveRecord::CheckViolation</td>
                  <td>StatementInvalid</td>
                  <td>エラーになった文だけ</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            ロック待ちの上限は database.yml の <code>variables</code> で設定でき、接続するときに <code>SET @@SESSION.innodb_lock_wait_timeout = 5</code> のような SQL が送られます
            <Ref n={21} />。
          </p>
          <Code
            lang="yaml"
            title="config/database.yml（抜粋）"
            code={`
default: &default
  adapter: mysql2
  variables:
    innodb_lock_wait_timeout: 5
`}
          />
          <h3>再試行の書き方</h3>
          <p>デッドロックで失敗したら、トランザクション全体を最初からやり直します。回数に上限を付け、少し間を空けます。</p>
          <Code
            lang="ruby"
            title="retry.rb（transfer は上の deadlock.rb と同じ）"
            code={`
def with_deadlock_retry(attempts: 3)
  tries = 0
  begin
    tries += 1
    yield
  rescue ActiveRecord::Deadlocked => e
    raise if tries >= attempts
    say "#{e.class} → #{tries} 回目の失敗。やり直す"
    sleep(rand(0.05..0.1) * tries)
    retry
  end
end

a = thread("A") { with_deadlock_retry { transfer(1, 2, 1000) } }
b = thread("B", 0.1) { with_deadlock_retry { transfer(2, 1, 500) } }
`}
          />
          <p>
            <code>yield</code> は渡されたブロック（ここでは transfer の呼び出し）を実行します。rescue の中の <code>retry</code> は <code>begin</code> の行から実行し直す Ruby の構文です。<code>raise if tries &gt;= attempts</code>{' '}
            は3回目も失敗したら同じ例外を呼び出し元へ投げ直します。<code>sleep(rand(0.05..0.1) * tries)</code> は 0.05〜0.1 秒の乱数に失敗の回数を掛けた時間だけ待ちます。待つ時間をばらつかせるのは、同時に失敗した処理が同じ時刻にやり直して、また衝突することを減らすためです。transfer
            の中の <code>Account.transaction</code> が一番外側のトランザクションなので、やり直しのたびに BEGIN から始まります。
          </p>
          <Code
            lang="text"
            title="実行結果"
            code={`
 0.05s A  TRANSACTION (0.5ms)  BEGIN
 0.07s A  Account Update All (1.4ms)  ${updAll(1, "balance = balance - '1000'")}
 0.11s B  TRANSACTION (0.5ms)  BEGIN
 0.11s B  Account Update All (1.6ms)  ${updAll(2, "balance = balance - '500'")}
 0.42s A  Account Update All (42.4ms)  ${updAll(2, "balance = balance + '1000'")}
 0.42s B  Account Update All (11.3ms)  ${updAll(1, "balance = balance + '500'")}
 0.42s B  TRANSACTION (0.3ms)  ROLLBACK
 0.42s B  ActiveRecord::Deadlocked → 1 回目の失敗。やり直す
 0.43s A  TRANSACTION (9.5ms)  COMMIT
 0.51s B  TRANSACTION (9.3ms)  BEGIN
 0.51s B  Account Update All (11.4ms)  ${updAll(2, "balance = balance - '500'")}
 0.81s B  Account Update All (0.5ms)  ${updAll(1, "balance = balance + '500'")}
 0.82s B  TRANSACTION (10.9ms)  COMMIT
最後の残高: [[1, 9500], [2, 10500], [3, 8000]]
`}
          />
          <p>B は1回目に失敗し、約 0.1 秒後のやり直しで成功しました。残高は、2つの送金がどちらも反映された 9500 と 10500 です。</p>
          <p>
            やり直すのは一番外側のトランザクションです。外側の中で内側だけをやり直すとどうなるかを確かめました。口座4（残高 0）を加え、B は外側のトランザクションで口座4に 100
            を入れた後、内側で送金を再試行します。A には先に口座3を2回更新させ、InnoDB が B を犠牲に選ぶようにしました。
          </p>
          <Code
            lang="ruby"
            title="nested_retry.rb（A は口座3を2回更新してから transfer(1, 2, 1000) と同じ順で更新する）"
            code={`
b = thread("B", 0.1) do
  Account.transaction do
    Account.where(id: 4).update_all("balance = balance + 100")
    with_deadlock_retry { transfer(2, 1, 500) } # 内側の transaction は外側に参加する
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（A のログは一部を省略）"
            code={`
 0.11s B  TRANSACTION (0.2ms)  BEGIN
 0.11s B  Account Update All (0.8ms)  ${updAll(4, 'balance = balance + 100')}
 0.11s B  Account Update All (0.3ms)  ${updAll(2, "balance = balance - '500'")}
 0.41s A  Account Update All (99.1ms)  ${updAll(2, 'balance = balance + 1000')}
 0.42s B  Account Update All (12.6ms)  ${updAll(1, "balance = balance + '500'")}
 0.42s B  ActiveRecord::Deadlocked → 1 回目の失敗。やり直す
 0.46s A  TRANSACTION (44.4ms)  COMMIT
 0.52s B  Account Update All (36.7ms)  ${updAll(2, "balance = balance - '500'")}
 0.84s B  Account Update All (20.9ms)  ${updAll(1, "balance = balance + '500'")}
 0.84s B  TRANSACTION (0.3ms)  COMMIT
最後の残高: [[1, 9500], [2, 10500], [3, 8002], [4, 0]]
`}
          />
          <p>
            MySQL は B のトランザクション全体を取り消したので、口座4への 100 も消えています。それでも内側の再試行は続き、やり直した2つの UPDATE はトランザクションの外で1文ずつ確定しました（再試行の後の
            information_schema.innodb_trx に、B の接続のトランザクションはありませんでした。innodb_trx は実行中のトランザクションの一覧を返す表です）。外側のブロックは例外を出さずに COMMIT まで進みましたが、口座4は 0 のままです。Rails の API
            ドキュメントも TransactionRollbackError（Deadlocked の親のクラス）を入れ子のブロックの中で rescue しないよう求め、一番外側のブロックの外でなら rescue できるとしています
            <Ref n={22} />。
          </p>
          <p>
            次の図は、nested_retry.rb の B が送った SQL を左の列に時刻の順で並べ、そのときに Rails と MySQL がそれぞれトランザクションをどう扱っていたかを中と右の列に示したものです。Rails の枠は COMMIT の行まで続きますが、MySQL の「トランザクションの中」の枠はデッドロックの行で終わります。
          </p>
          <Figure
            title="内側で再試行したときの Rails と MySQL の状態"
            caption="上の実行結果と innodb_trx の確認をもとにした図。SQL は「UPDATE 口座2 −500」のように簡略に書き、A の SQL は省略している。破線の枠は MySQL の側でトランザクションが無い区間を表す。"
          >
            <NestedRetryFigure />
          </Figure>
          <p>
            ログでは、B のやり直しの UPDATE（0.52s）の前に BEGIN がありません。内側の <code>Account.transaction</code> は外側のトランザクションに参加するだけで、外側のブロックはまだ終わっていないので、Rails は BEGIN
            を送り直しません。一方、MySQL の側ではデッドロックの時点でトランザクションが終わっています。そのため、やり直しの UPDATE は自動コミットで1文ずつ確定しました。再試行は次のように外側の{' '}
            <code>transaction</code> のブロック全体を囲む位置に置きます。こう書くと、やり直しのたびに口座4の UPDATE から実行されます。
          </p>
          <Code
            lang="ruby"
            title="再試行を一番外側のトランザクションの外に置く"
            code={`
with_deadlock_retry do
  Account.transaction do
    Account.where(id: 4).update_all("balance = balance + 100")
    transfer(2, 1, 500)
  end
end
`}
          />
          <p>
            続けて、ロックを取る順序をそろえる書き方を試しました。送金元か送金先かにかかわらず、id の小さい口座から lock で読みます。次のコードの <code>[from_id, to_id].sort</code> は2つの id
            を小さい順に並べ、<code>map</code> がその順に1件ずつ <code>SELECT … FOR UPDATE</code> を送ります。<code>index_by(&amp;:id)</code> は読んだレコードを id
            をキーにしたハッシュにまとめる Active Support のメソッドで、<code>locked[from_id]</code> で送金元のレコードを取り出せます。B の <code>transfer_ordered(2, 1, 500)</code>{' '}
            でも、ロックの順は口座1、口座2です。
          </p>
          <Code
            lang="ruby"
            title="ordered.rb"
            code={`
def transfer_ordered(from_id, to_id, amount)
  Account.transaction do
    # 主キーの小さい順にロックを取る
    locked = [from_id, to_id].sort.map { |id| Account.lock.find(id) }.index_by(&:id)
    sleep 0.3
    locked[from_id].update!(balance: locked[from_id].balance - amount)
    locked[to_id].update!(balance: locked[to_id].balance + amount)
  end
end

a = thread("A") { transfer_ordered(1, 2, 1000) }
b = thread("B", 0.1) { transfer_ordered(2, 1, 500) }
`}
          />
          <Code
            lang="text"
            title="実行結果"
            code={`
 0.00s A  TRANSACTION (0.3ms)  BEGIN
 0.00s A  Account Load (1.0ms)  ${sel(1, ' FOR UPDATE')}
 0.02s A  Account Load (0.9ms)  ${sel(2, ' FOR UPDATE')}
 0.10s B  TRANSACTION (0.3ms)  BEGIN
 0.32s A  Account Update (1.5ms)  ${upd(1, 9000)}
 0.33s A  Account Update (3.8ms)  ${upd(2, 11000)}
 0.35s A  TRANSACTION (17.8ms)  COMMIT
 0.36s B  Account Load (260.7ms)  ${sel(1, ' FOR UPDATE')}
 0.36s B  Account Load (0.5ms)  ${sel(2, ' FOR UPDATE')}
 0.67s B  Account Update (0.7ms)  ${upd(2, 10500)}
 0.67s B  Account Update (0.4ms)  ${upd(1, 9500)}
 0.68s B  TRANSACTION (12.1ms)  COMMIT
最後の残高: [[1, 9500], [2, 10500], [3, 8000]]
`}
          />
          <p>
            B は口座1の FOR UPDATE で A の COMMIT まで待ちましたが（260.7ms）、デッドロックにはならず、2つの送金がどちらも反映されました。図 20-6 は逆の順と同じ順でロックした場合の待ちの関係を比べたもので、矢印の向きはシミュレーターの
            Wait-for Graph と同じです。
          </p>
          <Figure n="20-6" title="待ちの循環とロックの順序" caption="上の2つの実行結果をもとにした図。">
            <DeadlockFigure />
          </Figure>

          <h3>注意点</h3>
          <ul>
            <li>
              再試行するブロックは、何度実行しても結果が同じになるように（冪等に）書きます。ブロックの中でメールを送ったりジョブを投入したりするとやり直すたびに繰り返されるので、DB の外の処理は COMMIT
              の後に行います（<ChapterLink n={18} section="idempotency" />）。
            </li>
            <li>
              FOR SHARE で読んでから同じ行を UPDATE する処理が2つ同時に動くと、互いの S ロックを待ってデッドロックになります。A と B が口座1を <code>lock("FOR SHARE")</code> で読んでそれぞれ{' '}
              <code>update_all</code> した実験では、B が ActiveRecord::Deadlocked になりました。後で更新する行は最初から <code>lock</code>（FOR UPDATE）で読みます。
            </li>
            <li>
              索引の無い条件のロック読み取りや UPDATE は多くの行をロックし、デッドロックも起きやすくなります。MySQL のマニュアルも走査する索引のレコードが減るように索引を付けることを勧めています
              <Ref n={15} />。
            </li>
            <li>
              Rails のテストは既定で各テストをトランザクションで囲むので、テストの中の transaction は外側に参加します。再試行をテストするときは、そのテストだけトランザクションで囲む設定を外します（
              <ChapterLink n={20} section="transaction" />
              <Ref n={22} />
              ）。
            </li>
            <li>シミュレーターはロック待ちのタイムアウトを再現しません。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
        <p>この章で確かめた SQL と MySQL の動作は、Active Record の次の書き方と例外に対応します。</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">SQL・MySQL の動作</th>
                <th scope="col">Active Record での書き方</th>
                <th scope="col">扱った節</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">BEGIN … COMMIT</th>
                <td>
                  <code>Account.transaction do … end</code>。ブロックが最後まで進むと COMMIT を送る
                </td>
                <td>Transaction</td>
              </tr>
              <tr>
                <th scope="row">ROLLBACK</th>
                <td>
                  ブロックの外へ例外が出ると送られる。例外を外へ伝えずに取り消すときは <code>raise ActiveRecord::Rollback</code>
                </td>
                <td>Transaction</td>
              </tr>
              <tr>
                <th scope="row">SELECT … FOR UPDATE（X ロック）</th>
                <td>
                  <code>Account.lock.find(id)</code>、読み込み済みのレコードには <code>account.lock!</code> と <code>account.with_lock {'{ … }'}</code>
                </td>
                <td>Lock、送金で更新の消失を防ぐ書き方</td>
              </tr>
              <tr>
                <th scope="row">SELECT … FOR SHARE（S ロック）</th>
                <td>
                  <code>Account.lock("FOR SHARE").find(id)</code>
                </td>
                <td>Lock</td>
              </tr>
              <tr>
                <th scope="row">UPDATE … SET balance = balance - ? WHERE … AND balance &gt;= ?</th>
                <td>
                  <code>where(…).update_all([…])</code>。戻り値は変更した行の数
                </td>
                <td>送金で更新の消失を防ぐ書き方</td>
              </tr>
              <tr>
                <th scope="row">SET TRANSACTION ISOLATION LEVEL …</th>
                <td>
                  <code>transaction(isolation: :read_committed)</code>
                </td>
                <td>Isolation Level</td>
              </tr>
              <tr>
                <th scope="row">エラー 1213（デッドロック）</th>
                <td>
                  <code>ActiveRecord::Deadlocked</code>。一番外側の transaction のブロックごと再試行する
                </td>
                <td>Deadlock</td>
              </tr>
              <tr>
                <th scope="row">エラー 1205（ロック待ちのタイムアウト）</th>
                <td>
                  <code>ActiveRecord::LockWaitTimeout</code>
                </td>
                <td>Deadlock</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul>
          <li>MySQL は既定で文ごとに確定します。複数の変更は BEGIN から COMMIT までのトランザクションにまとめ、失敗したら ROLLBACK で全体を取り消します。</li>
          <li>トランザクションの中でエラーになった文は、その文だけが取り消されます。Rails の transaction のブロックは、例外が外へ出るときに ROLLBACK を送ります。</li>
          <li>読んだ値を Ruby で計算して書き戻すと、同時の更新で更新の消失が起きます。トランザクションだけでは防げないので、lock・with_lock で読むか、条件付きの update_all で DB の値から計算します。</li>
          <li>S ロック同士は両立し、X ロックは S とも X とも両立しません。ロックは COMMIT か ROLLBACK まで持ち続けます。</li>
          <li>InnoDB の既定は REPEATABLE READ で、通常の SELECT は最初の読み取りのスナップショットを読みます。ロック読み取りと UPDATE は最新の確定済みの行を対象にします。</li>
          <li>デッドロックでは InnoDB が一方をロールバックし、Rails では ActiveRecord::Deadlocked になります。ロックの順序をそろえ、一番外側のトランザクション全体を再試行します。</li>
          <li>
            transaction の入れ子と SAVEPOINT、楽観的ロック、ロックの範囲と索引、接続プールは<ChapterLink n={15} />で扱います。
          </li>
        </ul>
        </>
      ),
    },
  ],
  sources: [
    { title: 'autocommit, Commit, and Rollback', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-autocommit-commit-rollback.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: '新しい接続は自動コミット（autocommit）が有効で、文ごとに確定すること。' },
    { title: 'START TRANSACTION, COMMIT, and ROLLBACK Statements', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/commit.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'BEGIN が START TRANSACTION の別名であること、COMMIT と ROLLBACK の動作、WITH CONSISTENT SNAPSHOT。' },
    { title: 'InnoDB and the ACID Model', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/mysql-acid.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'ACID（Atomicity・Consistency・Isolation・Durability）。' },
    { title: 'InnoDB Error Handling', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-error-handling.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'デッドロックではトランザクション全体、ロック待ちのタイムアウトと重複キーのエラーでは文だけが取り消されること。実行例は MySQL 8.4.13 で実測。' },
    { title: 'InnoDB Locking', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-locking.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'S ロックと X ロックの両立、インテンションロック、レコードロック・ギャップロック・next-key ロック、supremum。' },
    { title: 'Locking Reads', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-locking-reads.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'FOR SHARE・FOR UPDATE のロック、LOCK IN SHARE MODE との関係、ロックが COMMIT かロールバックで解放されること、自動コミットが無効のときだけロック読み取りができること。' },
    { title: 'The data_locks Table', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/performance-schema-data-locks-table.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'performance_schema.data_locks の LOCK_TYPE・LOCK_MODE・LOCK_STATUS・LOCK_DATA の意味。' },
    { title: 'Transaction Isolation Levels', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-transaction-isolation-levels.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: '既定が REPEATABLE READ であること、4つのレベルの読み取りとロック、SERIALIZABLE で通常の SELECT が FOR SHARE に変わること。' },
    { title: 'SET TRANSACTION Statement', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/set-transaction.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'SESSION・GLOBAL を付けない SET TRANSACTION が次の1つのトランザクションだけを対象にし、トランザクションの途中では実行できないこと。' },
    { title: 'Consistent Nonlocking Reads', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-consistent-read.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: '一貫性読み取りがロックを掛けないこと、REPEATABLE READ のスナップショットが最初の読み取りで作られること、自分の変更が見えること、DML はスナップショットに従わないこと。' },
    { title: 'Phantom Rows', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-next-key-locking.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'Phantom の定義と、next-key ロックで防ぐこと。' },
    { title: 'InnoDB Multi-Versioning', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-multi-versioning.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: '古いバージョンの情報を undo ログ（ロールバックセグメント）に残すこと、定期的に COMMIT しないと undo ログを消せないこと。' },
    { title: 'Deadlocks in InnoDB', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-deadlocks.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'デッドロックの定義と、innodb_print_all_deadlocks。' },
    { title: 'Deadlock Detection', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-deadlock-detection.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: '自動の検出と、INSERT・UPDATE・DELETE した行の数で小さいトランザクションを犠牲に選ぶこと。' },
    { title: 'How to Minimize and Handle Deadlocks', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-deadlocks-handling.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'やり直しに備えること、トランザクションを小さく短くすること、同じ順序で操作すること、索引を付けること。' },
    { title: 'InnoDB Startup Options and System Variables', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/innodb-parameters.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'innodb_lock_wait_timeout の既定が 50 秒で、タイムアウトでは文だけが取り消されること。innodb_rollback_on_timeout、innodb_deadlock_detect。' },
    { title: 'ActiveRecord::Transactions::ClassMethods', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Transactions/ClassMethods.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'トランザクションが接続ごとであること、例外で ROLLBACK して伝えること、ActiveRecord::Rollback、オブジェクトの値が戻らないこと、StatementInvalid を rescue しないこと。実行例は Rails 8.1.4.1 で実測。' },
    { title: 'ActiveRecord::ConnectionAdapters::DatabaseStatements#transaction', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/ConnectionAdapters/DatabaseStatements.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'isolation に指定できる値、TransactionIsolationError になる条件、対応するアダプター。' },
    { title: 'ActiveRecord::Locking::Pessimistic', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveRecord/Locking/Pessimistic.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'lock・lock!・with_lock と、ロックの句を文字列で渡す方法。' },
    { title: 'Active Record Query Interface（Locking Records for Update）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'lock が FOR UPDATE を送ること、lock に SQL の句を渡せること、with_lock。' },
    { title: 'activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'translate_exception（1213 → Deadlocked、1205 → LockWaitTimeout、3819 → CheckViolation）、begin_isolated_db_transaction、configure_connection の variables。' },
    { title: 'activerecord/lib/active_record/errors.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/errors.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'TransactionRollbackError・Deadlocked・LockWaitTimeout・CheckViolation の親のクラスと、入れ子のブロックで rescue しないこと、トランザクションで囲むテストの注意。' },
    { title: 'activerecord/lib/active_record/locking/pessimistic.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/locking/pessimistic.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'lock! が reload(lock:) で読み直し、保存していない変更があると例外にすること。with_lock の実装。' },
    { title: 'activerecord/lib/active_record/connection_adapters/mysql/quoting.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/connection_adapters/mysql/quoting.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'cast_bound_value が数値を文字列にしてから引用すること。' },
    { title: 'activerecord/CHANGELOG.md', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/CHANGELOG.md`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '8.1.0 で CheckViolation、ActiveRecord.with_transaction_isolation_level、current_transaction.isolation が追加されたこと。' },
  ],
}

export default chapter
