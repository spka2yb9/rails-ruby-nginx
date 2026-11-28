import type { Chapter } from '../content/types'
import { chapterNumber } from '../content/label'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { Stepper } from '../sims/Stepper'

const figure = (n: number) => `${chapterNumber(106)}-${n}`
const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const SQ = 'https://github.com/sidekiq/sidekiq/blob/v8.1.7'

/* ---------- コード例と実行結果 ---------- */

const threadsRb = `
require "mysql2"

def connect = Mysql2::Client.new(host: "ag-106-mysql", username: "root", password: "pass")

admin = connect # 確認用の接続
status = lambda do |label|
  rows = admin.query(<<~SQL).map { |r| "#{r['Variable_name']}=#{r['Value']}" }
    SHOW GLOBAL STATUS
    WHERE Variable_name IN ('Threads_connected', 'Threads_cached', 'Threads_created')
  SQL
  puts "#{label.ljust(14)} #{rows.join(' ')}"
end

status.("確認用の1本だけ")
clients = 3.times.map { connect }
status.("3本を追加")
puts "id  | thread_id | os_tid | command"
admin.query(<<~SQL).each { |r| puts r.values.join(" | ") }
  SELECT PROCESSLIST_ID, THREAD_ID, THREAD_OS_ID, PROCESSLIST_COMMAND
  FROM performance_schema.threads
  WHERE NAME = 'thread/sql/one_connection'
  ORDER BY PROCESSLIST_ID
SQL
clients.each(&:close)
sleep 0.5
status.("3本を切断")
clients = 3.times.map { connect }
status.("もう一度3本")
`

const threadsOut = `
確認用の1本だけ  Threads_cached=0 Threads_connected=1 Threads_created=1
3本を追加        Threads_cached=0 Threads_connected=4 Threads_created=4
id  | thread_id | os_tid | command
9 | 46 | 165 | Query
10 | 47 | 166 | Sleep
11 | 48 | 167 | Sleep
12 | 49 | 168 | Sleep
3本を切断        Threads_cached=3 Threads_connected=1 Threads_created=4
もう一度3本      Threads_cached=0 Threads_connected=4 Threads_created=4
`

const poolRb = `
require "active_record"
require "mysql2"

# max_connections=10 で起動した MySQL に、権限の少ないユーザー app で接続する
DB = { adapter: "mysql2", host: "ag-106-mysql", username: "app", password: "app",
       database: "ag_106", max_connections: 4 } # Rails 側のプールの上限は 4

# preload_app と同じく、fork の前にライブラリを読み込み、接続は閉じておく
ActiveRecord::Base.establish_connection(DB)
ActiveRecord::Base.connection_pool.with_connection { |c| c.select_value("SELECT 1") }
ActiveRecord::Base.connection_pool.disconnect!

T0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
def at = format("%.1fs", Process.clock_gettime(Process::CLOCK_MONOTONIC) - T0)

# Puma のワーカー3つの代わりに、子プロセスを3つ作る。各4スレッドが同時に SQL を送る
pids = 3.times.map do |w|
  fork do
    sleep 0.5 * w
    ActiveRecord::Base.establish_connection(DB)
    4.times.map { |t|
      Thread.new do
        ActiveRecord::Base.connection_pool.with_connection do |c|
          c.select_value("SELECT SLEEP(2)")
          puts "#{at} ワーカー#{w} スレッド#{t}: 成功"
        end
      rescue => e
        puts "#{at} ワーカー#{w} スレッド#{t}: #{e.class}: #{e.message.lines.first.strip}"
      end
    }.each(&:join)
  end
end
pids.each { Process.wait(_1) }
# 最後に root で SHOW GLOBAL STATUS の Max_used_connections と
# Connection_errors_max_connections を表示する（省略）
`

const poolOut = `
1.3s ワーカー2 スレッド3: ActiveRecord::ConnectionNotEstablished: Too many connections
1.3s ワーカー2 スレッド2: ActiveRecord::ConnectionNotEstablished: Too many connections
2.1s ワーカー0 スレッド0〜3: 成功（4行を1行にまとめた）
2.6s ワーカー1 スレッド0〜3: 成功（同上）
3.2s ワーカー2 スレッド0: 成功
3.2s ワーカー2 スレッド1: 成功
Connection_errors_max_connections=4 Max_used_connections=11
`

const retryRb = `
        def retryable_connection_error?(exception)
          (exception.is_a?(ConnectionNotEstablished) && !exception.is_a?(ConnectionNotDefined)) ||
            exception.is_a?(ConnectionFailed)
        end
`

const bufpoolSql = `
-- 再起動直後（items のページがバッファープールにない状態）で同じ全件走査を2回実行する
SELECT COUNT(*) AS items_pages_in_pool FROM information_schema.INNODB_BUFFER_PAGE
 WHERE TABLE_NAME = '\`ag_106\`.\`items\`';
SHOW GLOBAL STATUS LIKE 'Innodb_pages_read';
SELECT SUM(LENGTH(body)) FROM ag_106.items WHERE name LIKE '%9%';
SHOW GLOBAL STATUS LIKE 'Innodb_pages_read';
SELECT SUM(LENGTH(body)) FROM ag_106.items WHERE name LIKE '%9%';
SHOW GLOBAL STATUS LIKE 'Innodb_pages_read';
SELECT COUNT(*) AS items_pages_in_pool FROM information_schema.INNODB_BUFFER_PAGE
 WHERE TABLE_NAME = '\`ag_106\`.\`items\`';
`

const bufpoolOut = `
items_pages_in_pool                 0
Innodb_pages_read                 856
SUM(LENGTH(body))            26208640   1 row in set (2.19 sec)   ← 1回目
Innodb_pages_read                5627   ← 4,771 ページをディスクから読んだ
SUM(LENGTH(body))            26208640   1 row in set (0.42 sec)   ← 2回目
Innodb_pages_read                5627   ← 増えていない
items_pages_in_pool              4764
`

const writeRb = `
require "mysql2"

db = Mysql2::Client.new(host: "ag-106-mysql", username: "root", password: "pass", database: "ag_106")
db.query("DROP TABLE IF EXISTS events")
db.query("CREATE TABLE events (id BIGINT PRIMARY KEY AUTO_INCREMENT, payload VARCHAR(100) NOT NULL)")

def counters(db)
  s = db.query(<<~SQL).to_h { |r| [r["Variable_name"], r["Value"].to_i] }
    SHOW GLOBAL STATUS WHERE Variable_name IN
      ('Innodb_os_log_fsyncs', 'Innodb_redo_log_current_lsn', 'Innodb_buffer_pool_pages_dirty')
  SQL
  binlog = db.query(<<~SQL).first["COUNT_WRITE"]
    SELECT COUNT_WRITE FROM performance_schema.file_summary_by_event_name
    WHERE EVENT_NAME = 'wait/io/file/sql/binlog'
  SQL
  s.merge("binlog_writes" => binlog)
end

def run(db, label, flush:, sync:, one_tx:)
  db.query("SET GLOBAL innodb_flush_log_at_trx_commit = #{flush}")
  db.query("SET GLOBAL sync_binlog = #{sync}")
  before = counters(db)
  t = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  db.query("BEGIN") if one_tx
  1000.times { |i| db.query("INSERT INTO events (payload) VALUES ('order-#{i}')") }
  db.query("COMMIT") if one_tx
  # 経過時間と、before からの各カウンターの増分を表示する（表示部分は省略）
end

run(db, "A 1件ずつ COMMIT（1 / 1）", flush: 1, sync: 1, one_tx: false)
run(db, "B 1000件を1回の COMMIT（1 / 1）", flush: 1, sync: 1, one_tx: true)
run(db, "C 1件ずつ COMMIT（2 / 0）", flush: 2, sync: 0, one_tx: false)
`

const writeOut = `
                                   時間     redo の fsync  binlog の write  redo の量      dirty ページ
A 1件ずつ COMMIT（1 / 1）         20.47 秒   1508 回        1000 回          340794 バイト  298
B 1000件を1回の COMMIT（1 / 1）    0.26 秒     37 回          15 回           74890 バイト  302
C 1件ずつ COMMIT（2 / 0）          0.83 秒      3 回        1000 回          306111 バイト  306

（2回目）A 19.37 秒・1489 回 / B 0.37 秒・46 回 / C 0.79 秒・0 回
`

const binlogOut = `
mysql> UPDATE events SET payload = 'order-1 paid' WHERE id = 2;
mysql> SHOW BINLOG EVENTS IN 'binlog.000003';
Pos  Event_type      End_log_pos  Info
4    Format_desc     127          Server ver: 8.4.13, Binlog ver: 4
127  Previous_gtids  158
158  Anonymous_Gtid  237          SET @@SESSION.GTID_NEXT= 'ANONYMOUS'
237  Query           323          BEGIN
323  Table_map       385          table_id: 92 (ag_106.events)
385  Update_rows     462          table_id: 92 flags: STMT_END_F
462  Xid             493          COMMIT /* xid=6075 */
`

const observeRb = `
# Customer 50件、Order 200件を作った後（作成部分は省略）
root.query("TRUNCATE TABLE performance_schema.events_statements_summary_by_digest")

# 注文一覧を10回表示したつもりで、N+1 の読み方と includes の読み方を実行する
10.times { Order.order(:id).limit(20).each { |o| o.customer.name } }
10.times { Order.includes(:customer).order(:id).limit(20).each { |o| o.customer.name } }

root.query(<<~SQL).each { |r| puts format("%5d 回 %8.2f ms %6d 行  %s", *r.values) }
  SELECT COUNT_STAR, SUM_TIMER_WAIT / 1e9 AS ms, SUM_ROWS_EXAMINED, DIGEST_TEXT
  FROM performance_schema.events_statements_summary_by_digest
  WHERE SCHEMA_NAME = 'ag_106' AND DIGEST_TEXT LIKE 'SELECT%'
  ORDER BY COUNT_STAR DESC LIMIT 4
SQL
`

const observeOut = `
  200 回    56.17 ms    200 行  SELECT \`customers\` . * FROM \`customers\` WHERE \`customers\` . \`id\` = ? LIMIT ?
   20 回    67.30 ms    400 行  SELECT \`orders\` . * FROM \`orders\` ORDER BY \`orders\` . \`id\` ASC LIMIT ?
   10 回    11.61 ms    200 行  SELECT \`customers\` . * FROM \`customers\` WHERE \`customers\` . \`id\` IN (...)

SHOW PROCESSLIST（User が app の行。Id・User・Host・db・Command・Time・Info の順）
16 | app | 172.29.0.7:… | ag_106 | Sleep | 0 | nil
`

const redisBlockRb = `
require "redis-client"

r = RedisClient.new(host: "ag-106-redis", read_timeout: 10)
r.call("FLUSHALL")
r.call("DEBUG", "POPULATE", 1_000_000, "ag106:item") # 100万個のキーを作る
r.call("SLOWLOG", "RESET")

# 別のプロセスが 20 ミリ秒ごとに PING を送り、応答までの時間を記録する
def watch_ping(seconds)
  fork do
    c = RedisClient.new(host: "ag-106-redis", read_timeout: 10)
    # seconds 秒のあいだ PING を送り、中央値と最大値を表示する（省略）
  end
end

pid = watch_ping(3)
sleep 0.5
n = r.call("KEYS", "ag106:item:*").size              # 1回のコマンドで全件
Process.wait(pid)

pid = watch_ping(3)
sleep 0.5
cursor = "0"
loop do                                              # 1000 件ずつ何回にも分ける
  cursor, keys = r.call("SCAN", cursor, "MATCH", "ag106:item:*", "COUNT", 1000)
  break if cursor == "0"
end
Process.wait(pid)
# 経過時間と SLOWLOG GET の内容も表示する（省略）
`

const redisBlockOut = `
KEYS ag106:item:* を1回実行
  PING 117 回: 中央値 0.3 ms、最大 530.2 ms
  KEYS: 1000000 件、1874 ms（クライアントが結果を受け取り終えるまで）
  SLOWLOG に記録された KEYS の実行時間: 514 ms
SCAN で 1000 件ずつ最後まで読む
  PING 135 回: 中央値 0.3 ms、最大 23.1 ms
  SCAN: 1000000 件、1000 回の呼び出し、合計 3551 ms
  SLOWLOG に記録された SCAN: 5 回、最長 19.1 ms
`

const redisTypesRb = `
require "active_support"
require "active_support/cache"
require "active_support/cache/redis_cache_store"
require "sidekiq"

URL = "redis://ag-106-redis:6379/0"
r = RedisClient.new(url: URL)
r.call("FLUSHALL")

# Rails のキャッシュに商品一覧の HTML を60秒保存する
cache = ActiveSupport::Cache::RedisCacheStore.new(url: URL, namespace: "ag106")
cache.write("products/index", "<ul>…</ul>", expires_in: 60)

# Sidekiq のジョブを、すぐ実行するもの1件、1時間後に実行するもの1件登録する
Sidekiq.configure_client { |c| c.redis = { url: URL } }
class ReceiptMailJob
  include Sidekiq::Job
  def perform(order_id) = nil
end
ReceiptMailJob.perform_async(42)
ReceiptMailJob.perform_in(3600, 43)

r.call("SCAN", "0", "COUNT", 100)[1].sort.each do |key|
  puts format("%-26s %-5s TTL %-3d %s", key, r.call("TYPE", key), r.call("TTL", key),
              r.call("OBJECT", "ENCODING", key))
end
`

const redisTypesOut = `
ag106:products/index       string TTL 60  raw
queue:default              list  TTL -1  listpack
queues                     set   TTL -1  listpack
schedule                   zset  TTL -1  skiplist

LRANGE queue:default 0 -1 → {"retry":true,"queue":"default","args":[42],"class":"ReceiptMailJob","jid":"b700fa0f6c8fdc22dab347a9","created…
ZRANGE schedule の score → 1795783576.005435（2026-11-27 12:46:16 UTC に実行）
`

const persistSh = `
# 設定ごとに使い捨ての Redis を起動し、order:1 と order:2 を書く
#   RDB の行だけ、ここで BGSAVE を1回実行する
# order:3 を書き、1.5 秒待ってから docker kill（SIGKILL）で強制終了し、docker start で起動し直す
run "永続化なし" --save "" --appendonly no
run "RDB"        --save "" --appendonly no      # BGSAVE だけで保存する
run "AOF"        --save "" --appendonly yes --appendfsync everysec
`

const persistOut = `
[永続化なし] 強制終了して起動し直した後のキー:
[RDB] 強制終了して起動し直した後のキー: order:1 order:2
[AOF] 強制終了して起動し直した後のキー: order:1 order:2 order:3

AOF の行で強制終了する前の /data/appendonlydir:
appendonly.aof.1.base.rdb
appendonly.aof.1.incr.aof
appendonly.aof.manifest
`

const evictRb = `
POLICY = ARGV.fetch(0) # noeviction・allkeys-lru・volatile-lru
r.call("FLUSHALL")
r.call("CONFIG", "SET", "maxmemory", "0")
r.call("CONFIG", "SET", "maxmemory-policy", POLICY)

300.times { |i| PublishJob.perform_in(3600 + i * 60, i) } # 公開を予約したジョブ300件

# 今の使用量より 2MB だけ多い上限にする
limit = used_memory + 2 * 1024 * 1024
r.call("CONFIG", "SET", "maxmemory", limit)

failed = 0
cache = ActiveSupport::Cache::RedisCacheStore.new(url: URL, namespace: "ag106", compress: false,
  error_handler: ->(exception:, **) { failed += 1 })
2000.times { |i| cache.write("products/#{i}", "x" * 2000, expires_in: 600) } # 2KB を2000件

PublishJob.perform_in(7200, 999) # 上限に達した後にもう1件予約する
# 失敗件数、残ったキャッシュのキー数、ZCARD schedule、evicted_keys を表示する（省略）
`

const evictOut = `
[noeviction]
  キャッシュの書き込みの失敗: 1037 件（Redis::OutOfMemoryError: OOM command not allowed when used memory > 'maxmemory'.）
  残ったキャッシュのキー: 963 件
  予約ジョブ（schedule の要素数）: 300 件
  evicted_keys: 0
  上限に達した後のジョブの登録: RedisClient::OutOfMemoryError
[allkeys-lru]
  キャッシュの書き込みの失敗: 0 件
  残ったキャッシュのキー: 979 件
  予約ジョブ（schedule の要素数）: 1 件
  evicted_keys: 1045
  上限に達した後のジョブの登録: 登録できた
[volatile-lru]
  キャッシュの書き込みの失敗: 0 件
  残ったキャッシュのキー: 960 件
  予約ジョブ（schedule の要素数）: 301 件
  evicted_keys: 1063
  上限に達した後のジョブの登録: 登録できた
`

const sidekiqWarn = `
      maxmemory_policy = info["maxmemory_policy"]
      if maxmemory_policy != "noeviction" && maxmemory_policy != ""
        # Redis Enterprise Cloud returns "" for their policy 😳
        logger.warn <<~EOM


          WARNING: Your Redis instance will evict Sidekiq data under heavy load.
          The 'noeviction' maxmemory policy is recommended (current policy: '#{maxmemory_policy}').
          See: https://github.com/sidekiq/sidekiq/wiki/Using-Redis#memory

        EOM
      end
`

const redisExample = `
docker run --rm --network none redis:8 sh -eu -c '
  redis-server --bind 127.0.0.1 --save "" --appendonly no >/tmp/redis.log &
  for attempt in 1 2 3 4 5; do
    if redis-cli ping 2>/dev/null | grep -qx PONG; then break; fi
    sleep 1
  done
  redis-cli ping | grep -qx PONG
  stats() {
    redis-cli --raw INFO stats | tr -d "\\r" |
      grep -E "^(keyspace_hits|keyspace_misses|evicted_keys):"
  }
  printf "%s\\n" before
  stats
  redis-cli GET demo:products >/dev/null
  redis-cli SET demo:products sample >/dev/null
  redis-cli GET demo:products >/dev/null
  redis-cli GET demo:products >/dev/null
  printf "%s\\n" after
  stats
'
`

/* ---------- 図1 mysqld の中の構成 ---------- */
function ServerFigure() {
  return (
    <Svg id={figure(1)} w={780} h={420} label="Puma、Sidekiq、mysql コマンドがそれぞれ TCP で mysqld に接続する。mysqld は1つのプロセスで、接続1本ごとに接続スレッドを割り当て、切断後のスレッドはスレッドキャッシュで待つ。接続スレッドは SQL を解析して実行計画を選び、InnoDB のバッファープールのページを読み書きし、変更をログバッファーに書く。InnoDB のバックグラウンドのスレッドが、ディスクのデータファイルと redo ログに書き出す。binlog は接続スレッドがコミットのときに書く。">
      <Box x={20} y={40} w={170} h={40} lines={['Puma ワーカー', '接続プール（3本）']} fs={12} subTone="muted" />
      <Box x={20} y={90} w={170} h={40} lines={['Sidekiq', '接続プール']} fs={12} subTone="muted" />
      <Box x={20} y={140} w={170} h={40} lines={['mysql コマンド', '運用の確認']} fs={12} subTone="muted" />
      <rect x={220} y={14} width={540} height={300} rx={8} fill="none" stroke="var(--fig-line)" strokeWidth={1.5} />
      <T x={232} y={28} fs={12} bold>mysqld（1つのプロセス）</T>
      <Box x={240} y={40} w={150} h={40} lines={['接続スレッド', 'id 10']} fs={12} subTone="muted" fill="box5" />
      <Box x={240} y={90} w={150} h={40} lines={['接続スレッド', 'id 11']} fs={12} subTone="muted" fill="box5" />
      <Box x={240} y={140} w={150} h={40} lines={['接続スレッド', 'id 12']} fs={12} subTone="muted" fill="box5" />
      <Box x={240} y={196} w={150} h={44} lines={['スレッドキャッシュ', '切断後のスレッド']} fs={12} subTone="muted" fill="bg" dashed />
      <Arrow x1={190} y1={60} x2={238} y2={60} />
      <Arrow x1={190} y1={110} x2={238} y2={110} />
      <Arrow x1={190} y1={160} x2={238} y2={160} />
      <Box x={410} y={40} w={150} h={140} lines={['SQL の処理', '構文と権限の確認', '実行計画を選ぶ', '行を読み書きする']} fs={12} subTone="muted" />
      <Arrow x1={390} y1={60} x2={408} y2={60} />
      <Arrow x1={390} y1={110} x2={408} y2={110} />
      <Arrow x1={390} y1={160} x2={408} y2={160} />
      <rect x={576} y={34} width={172} height={268} rx={6} fill="none" stroke="var(--fig-line)" strokeDasharray="5 4" />
      <T x={588} y={48} fs={12} bold>InnoDB</T>
      <Box x={586} y={60} w={152} h={62} lines={['バッファープール', '16KB のページ', '既定 128MB']} fs={12} subTone="muted" fill="box4" />
      <Box x={586} y={134} w={152} h={40} lines={['ログバッファー', 'redo レコード']} fs={12} subTone="muted" fill="box4" />
      <Box x={586} y={190} w={152} h={62} lines={['バックグラウンドの', 'スレッド（33本）', '書き出し・fsync']} fs={12} subTone="muted" />
      <Arrow x1={560} y1={92} x2={584} y2={92} />
      <Arrow x1={560} y1={154} x2={584} y2={154} />
      <T x={20} y={372} fs={12} bold>ディスク（/var/lib/mysql）</T>
      <Box x={240} y={350} w={150} h={44} lines={['ag_106/events.ibd', 'テーブルと索引']} fs={12} subTone="muted" fill="box4" />
      <Box x={410} y={350} w={150} h={44} lines={['#innodb_redo/', 'redo ログ']} fs={12} subTone="muted" fill="box4" />
      <Box x={586} y={350} w={152} h={44} lines={['binlog.00000N', 'バイナリログ']} fs={12} subTone="muted" fill="box4" />
      <Arrow x1={620} y1={252} x2={330} y2={348} />
      <Arrow x1={650} y1={252} x2={500} y2={348} />
      <Arrow d="M485,180 L485,290 L640,290 L640,348" dashed />
      <T x={20} y={260} fs={11} tone="muted">実線：データの流れ</T>
      <T x={20} y={278} fs={11} tone="muted">破線：コミット時に</T>
      <T x={20} y={294} fs={11} tone="muted">接続スレッドが書く</T>
    </Svg>
  )
}

/* ---------- 図2 接続の枠 ---------- */
function SlotFigure() {
  const owner = ['W0', 'W0', 'W0', 'W0', 'W1', 'W1', 'W1', 'W1', 'W2', 'W2']
  const fill = { W0: 'box', W1: 'box2', W2: 'box5' } as const
  return (
    <Svg id={figure(2)} w={780} h={270} label="max_connections を 10 にした MySQL の接続の枠。ワーカー0 と ワーカー1 がそれぞれ4本、ワーカー2 が2本を使い、10本がふさがる。ワーカー2 の残り2本のスレッドは ERROR 1040 Too many connections で拒否される。11本目の予備の枠は CONNECTION_ADMIN の権限を持つアカウントだけが使える。">
      <T x={20} y={20} fs={12} bold>MySQL の接続の枠（max_connections = 10、予備 1）</T>
      {owner.map((o, i) => (
        <Box key={i} x={20 + i * 62} y={36} w={56} h={44} lines={[`${i + 1}`, o]} fs={12} subTone="muted" fill={fill[o as keyof typeof fill]} />
      ))}
      <Box x={20 + 10 * 62} y={36} w={120} h={44} lines={['11（予備）', 'root だけ']} fs={12} subTone="muted" fill="bg" dashed />
      <Box x={20} y={100} w={14} h={14} fill="box" />
      <T x={40} y={107} fs={11}>W0：ワーカー0（0.0 秒に4本）</T>
      <Box x={250} y={100} w={14} h={14} fill="box2" />
      <T x={270} y={107} fs={11}>W1：ワーカー1（0.5 秒に4本）</T>
      <Box x={480} y={100} w={14} h={14} fill="box5" />
      <T x={500} y={107} fs={11}>W2：ワーカー2（1.0 秒に2本だけ）</T>
      <Box x={20} y={136} w={330} h={48} lines={['ワーカー2 のスレッド2・3', 'ERROR 1040 Too many connections']} fs={12} subTone="danger" fill="box3" accent />
      <T x={370} y={152} fs={11} tone="muted">10本の枠に空きがないので、</T>
      <T x={370} y={168} fs={11} tone="muted">プールの待ちではなく、接続の時点で MySQL に拒否される</T>
      <T x={20} y={210} fs={11} tone="muted">Rails 8.1.4.1 は 0.1 秒後にもう1回接続を試す（connection_retries の既定 1）ので、拒否は4回と数えられた</T>
      <T x={20} y={230} fs={11} tone="muted">拒否される接続も一時的に数えられ、Max_used_connections は 11 になった</T>
      <T x={20} y={250} fs={11} tone="muted">実行例 pool.rb の結果を枠の並びで示した模式図。どの番号の枠をどのワーカーが使うかは実際には決まっていない</T>
    </Svg>
  )
}

/* ---------- 図3 バッファープールのページの一覧（段階送り） ---------- */
function LruRow({ n, pages, mark = [], note }: { n: number; pages: string[]; mark?: string[]; note: string }) {
  const x = (i: number) => 40 + i * 86
  return (
    <Svg id={`${figure(3)}-${n}`} w={780} h={150} label={`8ページに縮めた一覧。先頭から ${pages.join('、')} の順で、前の5ページが new サブリスト、後ろの3ページが old サブリスト。${note}`}>
      <T x={x(0)} y={20} fs={12} bold>new サブリスト（5/8）</T>
      <T x={x(5)} y={20} fs={12} bold>old サブリスト（3/8）</T>
      {pages.map((p, i) => (
        <Box key={i} x={x(i)} y={34} w={82} h={44} lines={p} fs={13} fill={mark.includes(p) ? 'box3' : i < 5 ? 'box5' : 'box4'} accent={mark.includes(p)} />
      ))}
      <line x1={x(5) - 2} y1={28} x2={x(5) - 2} y2={86} stroke="var(--fig-accent)" strokeDasharray="4 3" />
      <T x={x(0)} y={102} fs={11} tone="muted">先頭（最近使った）</T>
      <T x={x(5) - 2} y={102} fs={11} tone="muted" anchor="middle">中間点</T>
      <T x={x(7) + 82} y={102} fs={11} tone="muted" anchor="end">末尾</T>
      <T x={x(0)} y={134} fs={12}>{note}</T>
    </Svg>
  )
}

function PoolBar() {
  const w = (pages: number) => Math.round((pages / 8192) * 700)
  return (
    <Svg id={`${figure(3)}-6`} w={780} h={130} label="bufpool.sql の1回目の走査の後のバッファープール。8,192 ページのうち、items 表のページが 4,764、空きページが 2,430 で、残りはほかのページ。空きページがあるので追い出しは起きていない。">
      <T x={40} y={20} fs={12} bold>バッファープール 8,192 ページ（128MB）</T>
      <Box x={40} y={34} w={w(4764)} h={44} lines={['items 表のページ', '4,764']} fs={12} subTone="muted" fill="box5" />
      <Box x={40 + w(4764)} y={34} w={700 - w(4764) - w(2430)} h={44} lines="そのほか" fs={11} fill="box" />
      <Box x={740 - w(2430)} y={34} w={w(2430)} h={44} lines={['空きページ', '2,430']} fs={12} subTone="muted" fill="bg" dashed />
      <T x={40} y={110} fs={12}>空きページが残っているので、読み込んでも追い出しは起きない</T>
    </Svg>
  )
}

const lruSteps = [
  {
    label: '初めの状態',
    detail: (
      <>
        <LruRow n={1} pages={['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']} note="空きページがなく、8ページがすべて使われている" />
        <p>ページの一覧は先頭側の new サブリスト（全体の 5/8）と末尾側の old サブリスト（3/8）に分かれ、その境目を中間点と呼びます。この図では一覧を8ページに縮め、空きページがない状態から始めます。</p>
      </>
    ),
  },
  {
    label: '新しいページを読む',
    detail: (
      <>
        <LruRow n={2} pages={['P1', 'P2', 'P3', 'P4', 'P5', 'X', 'P6', 'P7']} mark={['X']} note="末尾の P8 を追い出し、X を中間点（old の先頭）に入れた" />
        <p>SELECT が、バッファープールにないページ X を必要としました。空きがないので、末尾の P8 を追い出して場所を作ります。ディスクから読んだ X は、一覧の先頭ではなく中間点に入ります。P6 と P7 は1つずつ末尾に近づきます。</p>
      </>
    ),
  },
  {
    label: '1 秒以内にもう一度読む',
    detail: (
      <>
        <LruRow n={3} pages={['P1', 'P2', 'P3', 'P4', 'P5', 'X', 'P6', 'P7']} mark={['X']} note="最初の読み込みから 1 秒以内なので、X は old に残る" />
        <p>全件走査は、1つのページに入っている行を続けて読むので、同じページを短い間に何度も読みます。最初に読まれてから <code>innodb_old_blocks_time</code>（既定 1000 ミリ秒）より前の読み込みでは、ページは new に移りません。</p>
      </>
    ),
  },
  {
    label: '1 秒より後に読む',
    detail: (
      <>
        <LruRow n={4} pages={['X', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7']} mark={['X', 'P5']} note="X が new の先頭へ移り、押し出された P5 が old に入った" />
        <p>1 秒より後に X がもう一度読まれると、X は new の先頭に移ります。new が1ページ増えた分、new の末尾にあった P5 が中間点を越えて old に入り、new と old の割合が保たれます。</p>
      </>
    ),
  },
  {
    label: '大きな表を1回だけ読む',
    detail: (
      <>
        <LruRow n={5} pages={['X', 'P1', 'P2', 'P3', 'P4', 'S3', 'S2', 'S1']} mark={['S1', 'S2', 'S3']} note="old の P5・P6・P7 を追い出し、new の5ページは残った" />
        <p>mysqldump や集計のバッチが大きな表を1回だけ読み、S1・S2・S3 を順に読み込んだとします。どれも中間点に入り、1 秒以内の読み込みしかないので old に留まります。追い出されたのは old にあった P5・P6・P7 で、new にあったよく使うページは残りました。</p>
      </>
    ),
  },
  {
    label: 'この章の実験',
    detail: (
      <>
        <PoolBar />
        <p>bufpool.sql の実験では、バッファープールは 8,192 ページ（128MB）でした。1回目の全件走査で items 表のページ 4,764 個が入った後も、空きページが 2,430 個残っていました。空きページがある間は、ページを読み込んでも追い出しは起きません。2回目の走査では、ディスクから読んだページは 0 でした。</p>
      </>
    ),
  },
]

/* ---------- 図4 コミットの書き込みの順序 ---------- */
function CommitFigure() {
  const lanes = [362, 456, 550, 644, 738]
  const heads: [string, string][] = [['接続', 'スレッド'], ['バッファー', 'プール'], ['redo ログ', 'ファイル'], ['binlog', 'ファイル'], ['データ', 'ファイル']]
  const steps: { y: number; text: string; from: number; to: number; accent?: boolean; dashed?: boolean }[] = [
    { y: 84, text: '① 行を書き換え、ページを dirty にする', from: 0, to: 1 },
    { y: 116, text: '② 変更を redo レコードにする', from: 0, to: 2 },
    { y: 148, text: '③ COMMIT：redo を書いて fsync（prepare）', from: 0, to: 2, accent: true },
    { y: 180, text: '④ binlog に書いて fsync', from: 0, to: 3, accent: true },
    { y: 212, text: '⑤ commit を確定し、OK を返す', from: 0, to: 2 },
    { y: 250, text: '⑥ 後でページクリーナーが書き出す', from: 1, to: 4, dashed: true },
  ]
  return (
    <Svg id={figure(4)} w={780} h={300} label="1件の INSERT を自動コミットで実行したときの書き込みの順序。接続スレッドがバッファープールのページを書き換え、変更を redo レコードにする。COMMIT では redo を書いて fsync し、binlog に書いて fsync し、InnoDB で commit を確定してからクライアントに OK を返す。データファイルへの書き出しは後でページクリーナーが行う。">
      {heads.map((h, i) => (
        <Box key={i} x={lanes[i] - 40} y={14} w={80} h={40} lines={h} fs={11} fill={i === 0 ? 'box' : 'box4'} />
      ))}
      {steps.map((s, i) => (
        <g key={i}>
          <T x={20} y={s.y} fs={11.5}>{s.text}</T>
          <Arrow x1={lanes[s.from]} y1={s.y} x2={lanes[s.to] - 4} y2={s.y} accent={s.accent} dashed={s.dashed} />
        </g>
      ))}
      <T x={20} y={284} fs={11} tone="muted">innodb_flush_log_at_trx_commit=1、sync_binlog=1（既定）の場合の模式図。グループコミットや内部の XA の細部は省略した</T>
    </Svg>
  )
}

/* ---------- 図5 クラッシュした時点と復旧（段階送り） ---------- */
const crashSteps = [
  {
    label: '① の後',
    detail: <p>バッファープールのページを書き換えただけで、redo も binlog もディスクに届いていません。クライアントにはまだ OK を返していません。クラッシュ後に起動すると、この変更はどこにも残っていません。クライアントはエラーを受け取り、注文は保存されていない状態です。</p>,
  },
  {
    label: '③ の後',
    detail: <p>redo には prepare の状態で書かれていますが、binlog にはまだありません。MySQL は起動時に binlog を読み、binlog にない prepare 済みのトランザクションをロールバックします。クライアントには OK を返していないので、保存されていないという結果とクライアントの認識は一致します。</p>,
  },
  {
    label: '④ の後',
    detail: <p>binlog には書かれましたが、InnoDB の commit の確定と OK の返却の前に止まりました。MySQL は起動時に binlog から xid を集め、binlog に書かれていた prepare 済みのトランザクションを InnoDB で commit させます。binlog を受け取るレプリカと元のサーバーで、データが食い違わないようにするための順序です。クライアントは応答を受け取れませんが、行は保存されています。</p>,
  },
  {
    label: '⑤ の後',
    detail: <p>OK を返した後、データファイルにページを書き出す前に止まりました。データファイルには古いページが残っていますが、起動時に InnoDB が redo ログを読み、変更をページに適用し直します。fsync 済みの redo があるので、OK を返したトランザクションは失われません。</p>,
  },
  {
    label: '設定 2 / 0',
    detail: <p>innodb_flush_log_at_trx_commit=2 と sync_binlog=0 では、③④ の fsync を待たずに OK を返します。MySQL のプロセスだけが落ちた場合は OS が書き込みを続けますが、OS やマシンが止まると、最後の約1秒の redo と、まだディスクに届いていない binlog を失う場合があります。OK を返した注文が消える、レプリカと元のサーバーの内容が食い違う、という結果になり得ます。</p>,
  },
]

/* ---------- 図6 KEYS が他のクライアントを待たせる ---------- */
function BlockFigure() {
  const x0 = 170
  const sc = 0.36 // 1ms あたりの幅
  const pings = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280]
  const after = [900, 920, 940, 960, 980, 1000, 1020, 1040, 1060, 1080, 1100, 1120, 1140, 1160, 1180, 1200, 1220, 1240, 1260, 1280, 1300]
  const scan = Array.from({ length: 34 }, (_, i) => i * 45)
  return (
    <Svg id={figure(6)} w={780} h={250} label="1つ目の行では、クライアント A の KEYS が 514 ミリ秒実行される。その間に送ったクライアント B の PING は KEYS が終わるまで待ち、530 ミリ秒後に応答を受け取る。2つ目の行では、SCAN を 1000 件ずつ何度も実行する。SCAN の1回は長くても 19 ミリ秒で、その合間に PING が処理されるので、PING の待ちは最大 23 ミリ秒だった。">
      <T x={20} y={20} fs={12} bold>KEYS を1回実行</T>
      <T x={20} y={46} fs={11}>A：KEYS</T>
      <Box x={x0 + 300 * sc} y={36} w={514 * sc} h={22} lines="KEYS の実行 514 ms" fs={11} fill="box5" />
      <T x={20} y={76} fs={11}>B：PING</T>
      {pings.map((t) => <rect key={t} x={x0 + t * sc} y={68} width={2} height={16} fill="var(--fig-line)" />)}
      <Box x={x0 + 310 * sc} y={66} w={530 * sc} h={20} lines="PING が 530 ms 待つ" fs={11} fill="bg" dashed />
      {after.map((t) => <rect key={t} x={x0 + t * sc} y={68} width={2} height={16} fill="var(--fig-line)" />)}
      <T x={20} y={116} fs={12} bold>SCAN を 1000 件ずつ</T>
      <T x={20} y={142} fs={11}>A：SCAN</T>
      {scan.map((t) => <rect key={t} x={x0 + t * sc} y={134} width={6} height={16} fill="var(--fig-box5)" stroke="var(--fig-line)" />)}
      <T x={20} y={172} fs={11}>B：PING</T>
      {scan.map((t) => <rect key={t} x={x0 + (t + 20) * sc} y={164} width={2} height={16} fill="var(--fig-line)" />)}
      <line x1={x0} y1={196} x2={x0 + 1500 * sc} y2={196} stroke="var(--fig-line)" />
      {[0, 250, 500, 750, 1000, 1250, 1500].map((t) => (
        <g key={t}>
          <line x1={x0 + t * sc} y1={192} x2={x0 + t * sc} y2={200} stroke="var(--fig-line)" />
          <T x={x0 + t * sc} y={210} fs={10.5} anchor="middle" tone="muted">{`${t} ms`}</T>
        </g>
      ))}
      <T x={20} y={236} fs={11} tone="muted">Redis 8.10.3、キー 100 万個。KEYS と PING の長さは2回目の測定値。SCAN の行の間隔は模式的なもの（1回は最長 19 ms）</T>
    </Svg>
  )
}

/* ---------- 図7 Rails のキャッシュと Sidekiq のキー ---------- */
function KeysFigure() {
  return (
    <Svg id={figure(7)} w={780} h={280} label="Rails の RedisCacheStore は ag106:products/index という string のキーを TTL 60 秒で書く。Sidekiq の perform_async は queues という set にキューの名前を加え、queue:default という list にジョブの JSON を入れる。perform_in は schedule という sorted set に、実行時刻を score にしてジョブを入れる。Sidekiq のワーカーは queue:default から BRPOP で取り出し、スケジューラーは時刻が来たジョブを schedule から queue:default に移す。">
      <Box x={20} y={30} w={170} h={44} lines={['Rails.cache.write', 'RedisCacheStore']} fs={12} subTone="muted" />
      <Box x={20} y={120} w={170} h={44} lines={['perform_async', 'Sidekiq::Client']} fs={12} subTone="muted" />
      <Box x={20} y={196} w={170} h={44} lines={['perform_in', 'Sidekiq::Client']} fs={12} subTone="muted" />
      <Box x={270} y={30} w={250} h={44} lines={['ag106:products/index', 'string・TTL 60 秒']} fs={12} subTone="muted" fill="box4" />
      <Box x={270} y={90} w={250} h={40} lines={['queues', 'set（キューの名前）']} fs={12} subTone="muted" fill="box4" />
      <Box x={270} y={142} w={250} h={44} lines={['queue:default', 'list（ジョブの JSON）・TTL なし']} fs={12} subTone="muted" fill="box4" />
      <Box x={270} y={200} w={250} h={44} lines={['schedule', 'zset（score は実行時刻）・TTL なし']} fs={12} subTone="muted" fill="box4" />
      <Arrow x1={190} y1={52} x2={268} y2={52} />
      <Arrow x1={190} y1={136} x2={268} y2={112} />
      <Arrow x1={190} y1={148} x2={268} y2={162} />
      <Arrow x1={190} y1={218} x2={268} y2={222} />
      <Box x={600} y={142} w={160} h={44} lines={['Sidekiq のワーカー', 'BRPOP で取り出す']} fs={12} subTone="muted" />
      <Box x={600} y={200} w={160} h={44} lines={['Sidekiq の', 'スケジューラー']} fs={12} subTone="muted" />
      <Arrow x1={520} y1={164} x2={598} y2={164} />
      <Arrow x1={520} y1={222} x2={598} y2={222} />
      <Arrow x1={600} y1={206} x2={524} y2={180} dashed />
      <T x={20} y={266} fs={11} tone="muted">TYPE・TTL・OBJECT ENCODING の実行結果（Redis 8.10.3、Sidekiq 8.1.7）をもとにした図。破線は時刻が来たジョブの移動</T>
    </Svg>
  )
}

/* ---------- 図8 退避ポリシーごとに残ったもの ---------- */
function EvictFigure() {
  const rows = [
    { name: 'noeviction', note: '上限を超える書き込みを拒否', jobs: 300, cache: 963, text1: '予約ジョブ 300 件（追加の1件は失敗）', text2: 'キャッシュ 963 件・書き込みの失敗 1,037 件' },
    { name: 'allkeys-lru', note: 'すべてのキーから追い出す', jobs: 1, cache: 979, text1: '予約ジョブ 1 件（300 件が消えた）', text2: 'キャッシュ 979 件・追い出し 1,045 件' },
    { name: 'volatile-lru', note: 'TTL のあるキーから追い出す', jobs: 301, cache: 960, text1: '予約ジョブ 301 件', text2: 'キャッシュ 960 件・追い出し 1,063 件' },
  ]
  return (
    <Svg id={figure(8)} w={780} h={290} label="予約ジョブ300件を入れた Redis の上限を2MB多いだけにし、2KB のキャッシュを2000件書いた。noeviction では予約ジョブ300件が残り、キャッシュは963件で1037件の書き込みが失敗し、追加のジョブの登録も失敗した。allkeys-lru では予約ジョブの schedule のキーが追い出され、残ったのは後から入れた1件だった。volatile-lru では TTL のあるキャッシュのキーだけが追い出され、予約ジョブは301件残った。">
      <T x={20} y={18} fs={12} bold>上限に達した後に残ったもの（予約ジョブ 300 件の後に、2KB のキャッシュを 2,000 件書いた）</T>
      {rows.map((r, i) => {
        const y = 52 + i * 72
        return (
          <g key={r.name}>
            <T x={20} y={y} fs={12} bold mono>{r.name}</T>
            <T x={20} y={y + 20} fs={11} tone="muted">{r.note}</T>
            <rect x={200} y={y - 9} width={Math.max(2, (r.jobs / 301) * 200)} height={16} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <T x={410} y={y} fs={11}>{r.text1}</T>
            <rect x={200} y={y + 13} width={(r.cache / 2000) * 200} height={16} fill="var(--fig-box5)" stroke="var(--fig-line)" />
            <T x={410} y={y + 21} fs={11}>{r.text2}</T>
          </g>
        )
      })}
      <T x={20} y={262} fs={11} tone="muted">棒の長さ：予約ジョブは 301 件、キャッシュは 2,000 件を全体とした割合。redis_evict.rb の実行結果（Redis 8.10.3）</T>
      <T x={20} y={280} fs={11} tone="muted">allkeys-lru で消えたのは、300 件をまとめて持つ schedule という1つのキー</T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 106,
  part: 5,
  title: "MySQL サーバーと Redis",
  summary: "MySQL サーバーが接続をスレッドで処理し、ページをバッファープールに置き、redo ログと binlog に書いてからコミットを返す流れを、実際に動かして確かめます。Redis が1つのスレッドでコマンドを処理する仕組み、データ構造、永続化、メモリーの上限と追い出しを、Rails のキャッシュと Sidekiq のキーで調べます。",
  goals: [
    "MySQL の接続・スレッド・max_connections と、Rails の接続プールの上限の関係を説明できる",
    "バッファープール、redo ログ、binlog が、読み込みとコミットのどこで使われるかを説明できる",
    "SHOW PROCESSLIST・SHOW STATUS・performance_schema で、接続・ページ・SQL の状態を読める",
    "Redis で遅いコマンドがほかのクライアントを待たせる理由と、RDB・AOF で残るデータの範囲を説明できる",
    "キャッシュとジョブのキューで、maxmemory-policy と Redis の分け方を決められる",
  ],
  prerequisites: [35, 38, 104],
  sections: [
    {
      id: "mysql",
      title: "MySQL サーバーは接続ごとにスレッドで SQL を処理する",
      body: (
        <>
          <p>Rails のアプリが「MySQL に接続する」と言うとき、接続先は <code>mysqld</code> というプログラムのプロセスです。mysqld はサーバーの上で動き続け、ネットワークから届く接続を待ちます。Rails は mysql2 gem を使い、TCP の 3306 番ポートに接続して、ユーザー名とパスワードで認証を受けてから SQL を送ります。本書の検証環境では、MySQL 8.4.13 をコンテナで動かしています。この章で設定を変える実験は、共有の rbdemo-mysql ではなく、自分用に起動した MySQL 8.4.13（コンテナ名 ag-106-mysql）で行いました。</p>
          <p>MySQL 8.4 の Community 版は既定（<code>thread_handling = one-thread-per-connection</code>）で、クライアントの接続1本ごとに専用のスレッドを割り当てます。その接続から届いた SQL は、このスレッドが構文の確認から結果の送信まで実行します。同じ接続の SQL は1つずつ順に処理され、別の接続の SQL は別のスレッドで同時に進みます。Rails のスレッドが接続プールから接続を借りて SQL を送る仕組みは<ChapterLink n={15} section="pool" />で扱いました。ここでは、その接続を受ける MySQL 側を見ます。<Ref n={14} /></p>
          <h3>接続を増やしてスレッドを数える</h3>
          <p>mysql2 gem で接続を1本ずつ開き、MySQL の状態を表すカウンター（ステータス変数）と、performance_schema の threads 表を読みました。performance_schema は、MySQL がサーバーの中で起きていることを表として見せる仕組みです。</p>
          <Code lang="ruby" title="threads.rb（Ruby 4.0.9、mysql2 0.5.7）" code={threadsRb} />
          <Code lang="text" title="実行結果" code={threadsOut} />
          <p><code>Threads_connected</code> は今つながっている接続の数、<code>Threads_created</code> は起動してから接続用に作ったスレッドの数です。3本を追加すると、どちらも4になりました。threads 表の <code>THREAD_OS_ID</code> は Linux のスレッド ID で、接続1本ごとに別の OS のスレッドがあることがわかります。Query の行（id 9）は表を読んでいる確認用の接続自身で、ほかの3本は SQL を送っていないので Sleep です。</p>
          <p>3本を切断した後も <code>Threads_cached</code> が3になり、スレッドは消えずに残りました。もう一度3本を接続すると、<code>Threads_created</code> は4のままで、残っていたスレッドが使われています。切断した接続のスレッドを <code>thread_cache_size</code> の数まで残しておき、次の接続に使う仕組みをスレッドキャッシュと呼びます。スレッドを作る処理を接続のたびに行わずに済みます。<code>thread_cache_size</code> を設定しなければ、MySQL は起動するときに 8 + max_connections / 100 の式で値を決めます（割り算の小数点以下は切り捨て、上限は 100）。MySQL 8.4.13 で確かめると、max_connections が既定の 151 なら 9、後の節の実験と同じ 10 で起動すると 8 でした。Rails の接続プールは接続を開いたまま使い回すので、通常は接続とスレッドの作成が頻繁には起きません。<Ref n={13} /><Ref n={14} /></p>
          <p>接続とは別に、InnoDB（MySQL 8.4 の既定のストレージエンジン。表のデータを保存し、トランザクションを扱う部分）も自分のスレッドを動かしています。このサーバーの threads 表で TYPE が BACKGROUND の行は 33 本あり、<code>log_writer_thread</code>・<code>log_flusher_thread</code>（redo ログの書き込みと fsync）、<code>page_flush_coordinator_thread</code>（変更したページの書き出し）、<code>io_read_thread</code>・<code>io_write_thread</code>（4本ずつ）などでした。後の節で扱う書き込みの多くは、これらのスレッドが SQL の実行とは別に行います。<Ref n={1} /></p>
          <Figure n={figure(1)} title="mysqld の中の構成" caption="threads.rb の実行結果と performance_schema.threads をもとにした模式図。実際には undo ログ、doublewrite バッファー、一時表なども mysqld が扱う。">
            <ServerFigure />
          </Figure>
          <p>接続が増えると、スレッドの数と、接続ごとに確保する領域（ソートや結合の作業用のバッファーなど）が増えます。また、同時に SQL を実行している接続（<code>Threads_running</code>）が CPU のコア数を大きく超えると、各 SQL が CPU を待つ時間が増えます。<code>Threads_connected</code> が多くても、ほとんどが Sleep なら MySQL の CPU はあまり使われていません。接続の数と、実行中の SQL の数は分けて見ます。</p>
        </>
      ),
    },
    {
      id: "connections",
      title: "max_connections と Rails の接続プール",
      body: (
        <>
          <p>Rails 8.1 の config/database.yml にある <code>max_connections</code> と、MySQL の <code>max_connections</code> は名前が同じですが、別の上限です。Rails の値は1つのプロセスの接続プールが開ける接続の数です。MySQL の値はサーバー全体で受け付ける接続の数で、MySQL 8.4 の既定は 151 です。Puma のワーカーごと、Sidekiq のプロセスごとにプールがあるので、MySQL に向かう接続の数は各プロセスのプールの上限を足した値まで増え得ます。見積もりの計算は<ChapterLink n={23} section="sizing" />と<ChapterLink n={113} section="capacity" />にあります。ここでは、合計が MySQL の上限を超えたときに何が起きるかを確かめます。<Ref n={14} /></p>
          <p>MySQL を <code>--max-connections=10</code> で起動し、管理権限のないユーザー app を作りました。Puma のワーカー3つの代わりに子プロセスを3つ作り、それぞれプールの上限を 4 にして、4本のスレッドから同時に2秒かかる SQL を送ります。合計の上限は 3 × 4 = 12 本で、MySQL の 10 を超えます。</p>
          <Code lang="ruby" title="pool.rb（Active Record 8.1.4.1）" code={poolRb} />
          <Code lang="text" title="実行結果（並べ替えて一部をまとめた）" code={poolOut} />
          <p>ワーカー0 とワーカー1 は4本ずつ接続でき、ワーカー2 は2本だけ接続できました。残りの2本のスレッドは 1.3 秒の時点で <code>ActiveRecord::ConnectionNotEstablished: Too many connections</code> になりました。これは MySQL が接続を拒否したエラー（ERROR 1040）です。プールの上限に達したときの <code>ActiveRecord::ConnectionTimeoutError</code> とは違い、<code>checkout_timeout</code> まで待たずにすぐ失敗します。プールの空きを待つ場合は Rails のプロセスの中で待ち、MySQL の上限を超えた場合は MySQL が接続を拒否します。</p>
          <p>拒否されたのは2本なのに、<code>Connection_errors_max_connections</code>（上限のために拒否した接続の数）は 4 でした。Rails 8.1.4.1 のアダプターは、接続を確立できなかったときに <code>connection_retries</code>（既定 1）の回数だけ、0.1 秒待ってから接続し直します。再試行の対象かどうかは次のメソッドで決まり、<code>ConnectionNotEstablished</code> は対象です。<Ref n={18} /></p>
          <Code lang="ruby" title="activerecord/lib/active_record/connection_adapters/abstract_adapter.rb（1142〜1145行目）" href={`${GH}/activerecord/lib/active_record/connection_adapters/abstract_adapter.rb#L1142-L1145`} code={retryRb} />
          <p>DB の設定に <code>connection_retries: 0</code> を加えて同じ実験をすると、<code>Connection_errors_max_connections</code> は 2 になりました。MySQL の拒否の回数を見るときは、アプリ側の再試行で数が増えることを考えに入れます。</p>
          <p><code>Max_used_connections</code>（起動してから同時に使われた接続の最大数）は、上限の 10 ではなく 11 でした。MySQL は <code>max_connections</code> より1本多く接続を受け付け、この1本を <code>CONNECTION_ADMIN</code> の権限を持つアカウント用に取っておきます。上限まで接続がふさがっても、管理者が接続して SHOW PROCESSLIST で原因を調べられるようにするためです。app の接続を 10 本開いた状態で app からもう1本接続すると ERROR 1040 になり、それだけで <code>Max_used_connections</code> は 11 になりました。拒否される接続も一時的に数えられるので、この値が <code>max_connections</code> + 1 なら、上限に達した時刻があったと読めます。アプリのユーザーには CONNECTION_ADMIN を与えず、予備の1本を管理用に残します。<Ref n={5} /></p>
          <Figure n={figure(2)} title="接続の枠とワーカーごとのプール" caption="pool.rb の実行結果をもとにした模式図。">
            <SlotFigure />
          </Figure>
          <p>エラーを止めるために MySQL の <code>max_connections</code> を上げると、受け付ける接続とスレッドの数が増え、接続ごとの領域を合わせたメモリーも増えます。Aurora Serverless v2 では、<code>max_connections</code> の既定値がインスタンスを起動したときの最大 ACU（容量の単位）で決まります。最大 ACU を下げた後の再起動で上限が小さくなり、Too many connections が出るようになった例を、第6部の演習<a href="#/linux/case40">「ときどき Too many connections が出る」</a>で調べられます。上限を上げる前に、各プロセスのプールの上限の合計、Sidekiq やバッチの接続、デプロイ中に一時的に増えるプロセスの分を数え、プールを小さくできないかも確かめます。</p>
        </>
      ),
    },
    {
      id: "buffer-pool",
      title: "InnoDB のバッファープール",
      body: (
        <>
          <p>InnoDB は表と索引のデータを、ページという固定の大きさの単位でファイルに保存します。ページの大きさは <code>innodb_page_size</code> で、このサーバーでは 16,384 バイト（16KB）です。行を読むには、その行が入っているページをメモリーに読み込む必要があります。読み込んだページを置いておくメモリーの領域が<Term en="buffer pool">バッファープール</Term>で、MySQL 8.4 の既定の大きさは 128MB です。同じページを次に読むときは、ディスクを読まずにバッファープールのページを使います。B-Tree の索引がページの木になっていることは<ChapterLink n={37} section="index" />で扱いました。<Ref n={6} /></p>
          <h3>同じ全件走査を2回実行する</h3>
          <p>200,000 行（データ 74.6MB）の items 表を作り、MySQL を再起動してバッファープールを空にしてから、索引を使えない条件の SELECT を2回続けて実行しました。<code>Innodb_pages_read</code> は、InnoDB がディスクから読んだページの数の累計です。</p>
          <Code lang="sql" title="bufpool.sql（mysql -vvv で実行）" code={bufpoolSql} />
          <Code lang="text" title="実行結果（1回目の測定。必要な行だけを抜き出した）" code={bufpoolOut} />
          <p>1回目の SELECT の前後で <code>Innodb_pages_read</code> は 4,771 増え、2回目では増えませんでした。終わった後には items 表のページ 4,764 個がバッファープールにありました（4,764 × 16KB ≒ 74.4MB で、表の大きさとほぼ同じです）。2回目は、すべてのページをメモリーから読んでいます。同じ測定を3回行うと、1回目は 1.56〜5.48 秒、2回目は 0.42〜1.42 秒で、3回とも2回目のほうが短くなりました。時間は同じマシンで動いているほかの処理の影響で大きくばらつくので、比べるときはページの数を見ます。2回目にかかった時間は、ページの中の行を1行ずつ条件と比べる CPU の処理です。</p>
          <p>バッファープールに空きがないときは、使われていないページから追い出して場所を作ります。InnoDB はページの一覧を、よく使うページを置く new サブリストと、読み込んだばかりのページを置く old サブリストに分けます。old は全体の 3/8 です。ディスクから読んだページは old の先頭（中間点）に入り、old にある間にもう一度読まれると new の先頭に移ります。ただし、最初に読まれてから <code>innodb_old_blocks_time</code>（既定 1000 ミリ秒）より前の読み込みでは移りません。1回の全件走査は同じページを短い間に何度も読むので、走査で読んだページは old に留まり、追い出されるのも old からです。mysqldump や集計のバッチが大きな表を一度読んだだけで、よく使うページがバッファープールから追い出されないようにする仕組みです。今回の実験では空きページが 2,430 個残っていたので、追い出しは起きていません。<Ref n={6} /></p>
          <p>次の図では、ページを読み込んだときに一覧の中でページがどう動くかを段階を追って確かめられます。</p>
          <Figure n={figure(3)} title="バッファープールのページの一覧（段階送り）" caption="一覧を8ページに縮め、読み込み・new への移動・追い出しの順を示した概念モデル。MySQL 8.4 のマニュアルの説明と bufpool.sql の結果をもとにしている。実際にはバッファープールが複数のインスタンスに分かれてそれぞれが一覧を持ち、ページは数千以上ある。new の中で読まれたページを先頭に移さない場合があるなどの細部は省いた。">
            <Stepper steps={lruSteps} />
          </Figure>
          <p>MySQL を再起動すると、バッファープールは空から始まります。ただし既定では、停止するときにバッファープールにあったページの番号の一部をファイル（データディレクトリの <code>ib_buffer_pool</code>）に書き、起動した後にそのページを読み込み直します（<code>innodb_buffer_pool_dump_at_shutdown</code> と <code>innodb_buffer_pool_load_at_startup</code>）。今回の実験では、空の状態から測るために停止の前に前者を OFF にしました。障害による切り替えやメモリーの小さいインスタンスへの変更の直後には、バッファープールに目的のページがなく、普段より読み込みが遅いことがあります。</p>
          <p>大きさの目安について、MySQL 8.4 のマニュアルは、MySQL だけを動かすサーバーでは物理メモリーの 80% までを割り当てることが多いと説明しています。本番で読み込みの多くがバッファープールで済んでいるかは、<code>Innodb_buffer_pool_read_requests</code>（ページを読もうとした回数）と <code>Innodb_buffer_pool_reads</code>（バッファープールになくディスクから読んだ回数）の増分を比べて調べます。最初に試した測定では、4,764 ページを読み込んだのに <code>Innodb_buffer_pool_reads</code> は 99 しか増えませんでした。続けて読まれると判断したページを先読み（read-ahead）でまとめて読んだ場合は、この値に数えないためと考えられます。ディスクから読んだページの総数は <code>Innodb_pages_read</code> で確かめます。<Ref n={6} /><Ref n={13} /></p>
        </>
      ),
    },
    {
      id: "write-path",
      title: "コミットは redo ログと binlog に書いてから返る",
      body: (
        <>
          <p>行を更新すると、InnoDB はまずバッファープールのページを書き換えます。書き換えた後、まだファイルに書き出していないページを dirty ページと呼びます。コミットのたびに dirty ページをデータファイルに書き出すと、表のあちこちのページへの書き込みが必要になり、時間がかかります。そこで InnoDB は変更の内容を<Term en="redo log">redo ログ</Term>というファイルに順に追記し、ディスクに確実に届けてからコミットを返します。ページの書き出しは後でまとめて行います。電源が切れてもデータファイルに書かれていない変更は、起動時に redo ログから適用し直します。MySQL 8.4 の redo ログはデータディレクトリの <code>#innodb_redo</code> にあり、合計の大きさは <code>innodb_redo_log_capacity</code>（このサーバーでは既定の 100MB）です。<Ref n={9} /></p>
          <p>MySQL にはもう1つ、<Term en="binary log">binlog</Term> というログがあります。日本語ではバイナリログとも呼びます。binlog は InnoDB ではなく MySQL のサーバー側が書くログで、コミットした変更を順に記録します。レプリカ（複製先のサーバー）はこの binlog を受け取って同じ変更を適用し、バックアップから戻した後には binlog を再実行して特定の時点まで戻せます。MySQL 8.4 では binlog は既定で有効で、このサーバーの <code>binlog_format</code> は ROW（変更した行の内容を記録する形式）でした。<Ref n={8} /></p>
          <Figure n={figure(4)} title="1件の INSERT がコミットされるまでの書き込み" caption="MySQL 8.4 のマニュアル（binlog と InnoDB の2相コミット、innodb_flush_log_at_trx_commit）をもとにした模式図。">
            <CommitFigure />
          </Figure>
          <p>コミットで何回ディスクに書くかは、2つの設定で決まります。<code>innodb_flush_log_at_trx_commit</code> が既定の 1 なら、コミットごとに redo を書き込んで fsync（OS に、ファイルの内容をディスクに書き終えるまで待つよう求めるシステムコール）します。2 ならコミットごとに書き込みますが、fsync は1秒に1回です。<code>sync_binlog</code> が既定の 1 なら、binlog もコミットごとに fsync します。0 なら fsync を OS に任せます。1000 行を3つの方法で INSERT して、時間とカウンターの増分を測りました。<Ref n={7} /><Ref n={8} /></p>
          <Code lang="ruby" title="write_path.rb（表示部分を省略）" code={writeRb} />
          <Code lang="text" title="実行結果（WSL2 の Docker、同じ測定を2回）" code={writeOut} />
          <p>A は Rails で <code>Order.create</code> を 1000 回呼んだ場合に近く、1件ごとにコミットします。redo の fsync は約 1,500 回で、1回のコミットに約 20 ミリ秒かかりました。コミットは 1000 回なのに fsync が多いのは、binlog を使うサーバーでは1件のコミットで redo を2回書くからです。1回目は図 {figure(4)} の ③ の prepare の記録で、binlog に書く直前に fsync を待ちます。2回目は ⑤ で commit を確定したことの記録で、MySQL 8.4 はこの記録の fsync をコミットの処理の中では待ちません。redo を書き出すバックグラウンドのスレッドが後で fsync し、次のコミットの ③ の fsync と1回にまとまることもあるので、回数は 1000 と 2000 の間になります。<Ref n={20} />binlog を止めて（<code>--skip-log-bin</code>）起動した MySQL 8.4.13 で同じ 1000 件を入れると、redo の fsync は 1,089〜1,111 回で、ほぼコミットの数と同じでした。この環境（WSL2 の上の Docker）では fsync が遅く、時間の大部分は fsync を待つ時間です。速いストレージではこの差は小さくなりますが、コミットの数だけ fsync を待つ点は同じです。B は同じ 1000 行を1つのトランザクションで入れたもので、0.26〜0.37 秒でした。fsync は 37〜46 回、binlog の書き込みは 15 回で、コミットが1回なのでディスクへの同期も大きく減ります。redo の量も少なくなっています（A の約 34 万バイトに対して約 7.5 万バイト）。</p>
          <p>C は設定を 2 と 0 にして1件ずつコミットしたもので、0.79〜0.83 秒でした。速くなった理由は fsync を待たずに OK を返すからです。マニュアルは、2 の場合に fsync されていないトランザクションはクラッシュで失われ得ると説明しています。MySQL のプロセスだけが落ちた場合は OS が書き込みを続けられますが、OS やマシンが止まると最後の約1秒の変更を失い得ます。また、レプリケーションでトランザクションの永続性と一貫性を保つには、<code>sync_binlog=1</code> と <code>innodb_flush_log_at_trx_commit=1</code> を使うよう勧めています。注文のように、OK を返した後に消えてはいけないデータを扱う DB では既定の 1 と 1 を使い、大量の INSERT はトランザクションや <code>insert_all</code> でまとめてコミットの数を減らすのが一般的です。<ChapterLink n={100} />で、まとめて書き込む方法を扱っています。<Ref n={7} /></p>
          <h3>dirty ページとチェックポイント</h3>
          <p>実行結果の dirty ページは測定の直後にまだ 300 個前後ありました。コミットは終わっていても、データファイルにはまだ書かれていないページです。バックグラウンドのページクリーナーがこれらを書き出し、書き出しが済んだ位置までの redo は復旧に不要になります。この位置をチェックポイントと呼びます。測定の後、redo の現在の位置（<code>Innodb_redo_log_current_lsn</code>）は 31,074,523、チェックポイント（<code>Innodb_redo_log_checkpoint_lsn</code>）は 30,336,259 で、約 74 万バイト分の変更がまだデータファイルに反映されていませんでした。更新が多すぎて redo の容量が足りなくなると、InnoDB はページの書き出しを急ぐ必要があり、その間の書き込みが遅くなることがあります（この章では測っていません）。</p>
          <p>ページの書き出しの途中で電源が切れると、16KB のページの一部だけが新しい内容になることがあります。InnoDB は、ページをデータファイルに書く前に doublewrite バッファー（データディレクトリの <code>#ib_16384_0.dblwr</code> など）に書き、起動時に壊れたページを見つけたらそこから戻します。<Ref n={10} /></p>
          <h3>binlog に記録される内容</h3>
          <p>1行を UPDATE して、binlog のイベントを表示しました。</p>
          <Code lang="text" title="SHOW BINLOG EVENTS の実行結果（Log_name の列を省略）" code={binlogOut} />
          <p>1つのトランザクションは BEGIN、対象の表の定義（Table_map）、変更した行（Update_rows）、COMMIT（Xid）のイベントとして並びます。Xid はトランザクションの番号で、クラッシュからの復旧で使います。MySQL 8.4 では、binlog と InnoDB の両方に同じトランザクションを記録するために、内部で2相コミットを行います。起動時には binlog の最後のファイルから xid を集め、binlog に書かれていた prepare 済みのトランザクションを InnoDB で commit させ、それ以外はロールバックします。次の図で、止まった時点ごとの結果を確かめてください。binlog を読んで変更を外部に送る CDC は<ChapterLink n={53} section="alternatives" />、Aurora で特定の時点に戻す手順は第6部の演習<a href="#/linux/case41">「消してしまった下書きを、特定時点への復元で戻す」</a>にあります。<Ref n={8} /></p>
          <Figure n={figure(5)} title="クラッシュした時点ごとに残るもの" caption={<>図 {figure(4)} の番号の直後に MySQL のサーバーが止まった場合の概念モデル。マニュアルの説明をもとにしたもので、この章ではクラッシュを起こす実験はしていない。</>}>
            <Stepper steps={crashSteps} />
          </Figure>
        </>
      ),
    },
    {
      id: "observe",
      title: "SHOW PROCESSLIST・SHOW STATUS・performance_schema で見えるもの",
      body: (
        <>
          <p>MySQL の状態を調べる方法はいくつかあり、それぞれ見える範囲が違います。<code>SHOW PROCESSLIST</code> は今つながっている接続の一覧で、1行が1本の接続です。列は左から、接続の番号（Id）、ユーザー、接続元のアドレスとポート、使っている DB、状態（Command）、その状態になってからの秒数（Time）、細かい状態（State）、実行中の SQL（Info）です。Rails の接続プールが開いている接続は、SQL を送っていない間は Command が Sleep です。Sleep の Time が長いのはプールの接続としては普通です。Command が Query で Time が大きい行は、長く実行中の SQL です。State が <code>Waiting for table metadata lock</code> の行は、表の構造の変更とほかのトランザクションが待ち合っている状態で、<ChapterLink n={27} section="live-change" />で実際に見ています。<Ref n={12} /></p>
          <p><code>SHOW GLOBAL STATUS</code> は、起動してからの累計や現在の値を返すカウンターの一覧です。累計の値は、2つの時刻で読んで差を取って使います。この章で使ったものを表にまとめます。<Ref n={13} /></p>
          <div className="table-wrap">
            <table>
              <caption>この章で読んだステータス変数</caption>
              <thead><tr><th>変数</th><th>意味</th><th>この章で見たこと</th></tr></thead>
              <tbody>
                <tr><td><code>Threads_connected</code></td><td>今の接続の数</td><td>3本を追加すると 1 から 4</td></tr>
                <tr><td><code>Threads_running</code></td><td>今 SQL を実行している接続の数</td><td>接続の数との違いを見る</td></tr>
                <tr><td><code>Threads_created</code>・<code>Threads_cached</code></td><td>作ったスレッドの累計・待機中のスレッド</td><td>再接続でスレッドが使い回された</td></tr>
                <tr><td><code>Max_used_connections</code></td><td>同時に使われた接続の最大数</td><td>上限 10 で 11（予備の枠まで）</td></tr>
                <tr><td><code>Connection_errors_max_connections</code></td><td>上限のために拒否した接続の累計</td><td>Rails の再試行の分も数えられた</td></tr>
                <tr><td><code>Innodb_pages_read</code></td><td>ディスクから読んだページの累計</td><td>1回目の走査で 4,771、2回目で 0</td></tr>
                <tr><td><code>Innodb_os_log_fsyncs</code></td><td>redo ログの fsync の累計</td><td>1件ずつのコミットで約 1,500</td></tr>
                <tr><td><code>Innodb_buffer_pool_pages_dirty</code></td><td>書き出していないページの数</td><td>コミットの後も約 300</td></tr>
              </tbody>
            </table>
          </div>
          <p>どの SQL がどれだけ実行されたかは、performance_schema の <code>events_statements_summary_by_digest</code> で調べられます。MySQL は SQL の値の部分を <code>?</code> に置き換えた形（ダイジェスト）にまとめ、ダイジェストごとに実行回数や合計時間を数えます。Customer と Order の2つのモデルで、注文一覧を N+1 の読み方と includes の読み方で 10 回ずつ表示したつもりの処理を実行し、集計を読みました。<Ref n={11} /></p>
          <Code lang="ruby" title="observe.rb（抜粋）" code={observeRb} />
          <Code lang="text" title="実行結果" code={observeOut} />
          <p>1行目は注文1件ごとに顧客を読む SQL で、10 回の表示で 200 回実行されています。値が違っても同じ形の SQL は1つのダイジェストにまとまるので、実行回数の多い行から N+1 を見つけられます（<ChapterLink n={13} section="n-plus-one" />）。3行目は includes で発行された IN の SQL で、10 回だけです。<code>SUM_TIMER_WAIT</code> はピコ秒（1 兆分の 1 秒）単位なので、1e9 で割ってミリ秒にしています。集計は MySQL の起動から累積するので、測る前に <code>TRUNCATE TABLE</code> で空にしました。ロックの待ちは同じ performance_schema の <code>data_locks</code> 表で調べられます（<ChapterLink n={38} section="lock" />）。遅い SQL をスロークエリログから探して EXPLAIN で調べる手順は、第6部の演習<a href="#/linux/case24">「遅いページの原因をDB側から突き止める」</a>で練習できます。</p>
          <p>MySQL から見えないものもあります。Rails のスレッドがプールの空きを待っている時間は、まだ SQL を送っていないので、PROCESSLIST にも performance_schema にも現れません。プールの待ちは <code>ActiveRecord::Base.connection_pool.stat</code> の <code>waiting</code> など、アプリ側で測ります（<ChapterLink n={113} section="verify" />）。</p>
        </>
      ),
    },
    {
      id: "redis",
      title: "Redis は1つのスレッドでコマンドを順に処理する",
      body: (
        <>
          <p>Redis はキーを指定して値を読み書きするデータストアです。値をメモリーに置いて処理し、必要に応じてディスクにも保存します。サーバーは <code>redis-server</code> というプロセスで、クライアントは TCP の 6379 番ポートに接続して <code>SET</code> や <code>GET</code> などのコマンドを送ります。Rails のキャッシュ（RedisCacheStore）や Sidekiq は、redis-client gem などでこのサーバーに接続します。この章の Redis は Redis 8.10.3 で、設定を変える実験は自分用に起動したコンテナ ag-106-redis で行いました。</p>
          <p>Redis のドキュメントは、Redis が「ほぼ1つのスレッド」で動くと説明しています。1つのスレッドが、多くのクライアントの接続を epoll（Linux で、複数のソケットのうち読み書きできるものを知らせる仕組み）で見張り、届いたコマンドを1つずつ実行して応答を返します。この繰り返しをイベントループと呼びます。<code>INFO server</code> の <code>multiplexing_api</code> は epoll で、ソケットの読み書きを別のスレッドに分ける <code>io-threads</code> は既定の 1 でした。ディスクへの書き込みの一部は別のスレッドで行いますが、コマンドの実行は1つのスレッドが順に行います。<code>GET</code> や <code>SET</code> は短い時間で終わるので、1つのスレッドでも多くのクライアントに応答できます。<Ref n={15} /></p>
          <p>その代わり、1つのコマンドが長く実行されると、その間はほかのクライアントのコマンドがすべて待ちます。キーを 100 万個作り、パターンに合うキーを全部返す <code>KEYS</code> を実行している間に、別のプロセスから 20 ミリ秒ごとに <code>PING</code> を送りました。次に、同じキーを <code>SCAN</code> で 1000 件ずつ読む場合と比べました。</p>
          <Code lang="ruby" title="redis_block.rb（抜粋。redis-client 0.31.0）" code={redisBlockRb} />
          <Code lang="text" title="実行結果（2回目の測定）" code={redisBlockOut} />
          <p>Redis が KEYS の実行に使った時間は、SLOWLOG（設定した時間より長くかかったコマンドの記録）で 514 ミリ秒でした。その間に送った PING は 530 ミリ秒待ってから応答を受け取っています。PING の処理自体は 0.3 ミリ秒ほどなので、待ち時間のほとんどは KEYS の終わりを待つ時間です。クライアントが KEYS の結果を受け取り終えるまでの 1,874 ミリ秒には、100 万個のキー名の転送と Ruby での変換も含まれます。1回目の測定では、KEYS が 1,385 ミリ秒、PING の最大の待ちが 1,410 ミリ秒で、同じ関係でした。</p>
          <p>SCAN はカーソル（次にどこから読むかを表す値）を受け取り、指定した件数の目安だけキーを返すコマンドです。1000 回に分けたので合計の時間は KEYS より長くなりましたが、1回の SCAN は長くても 19 ミリ秒で、その合間にほかのクライアントのコマンドが実行されます。PING の待ちは最大 23 ミリ秒でした。Redis のドキュメントは、本番の環境で KEYS を使うことが遅延のよくある原因で、KEYS はデバッグのためだけに使い、SCAN などで少しずつ読むよう説明しています。<Ref n={15} /></p>
          <Figure n={figure(6)} title="KEYS の間、ほかのクライアントのコマンドが待つ" caption="redis_block.rb の測定値をもとにした模式図。">
            <BlockFigure />
          </Figure>
          <p>この実験で、キーを作る <code>DEBUG POPULATE</code> も1秒以上かかり、redis-client の読み取りの制限時間（既定 1 秒）を超えて <code>RedisClient::ReadTimeoutError</code> になったので、制限時間を 10 秒にしました。本番では Rails や Sidekiq の Redis クライアントにも制限時間があるので、誰かが長いコマンドを実行すると、ほかのアプリの読み書きが制限時間を超えて失敗することがあります。要素の多い集合の演算、大きなキーの削除（別のスレッドで解放する <code>UNLINK</code> があります）、同じ秒に大量のキーの期限が切れる場合なども、ドキュメントに遅延の原因として挙げられています。</p>
        </>
      ),
    },
    {
      id: "data-types",
      title: "データ構造と、Rails・Sidekiq が使うキー",
      body: (
        <>
          <p>Redis の値には型があります。文字列（string）、末尾や先頭に追加して取り出せるリスト（list）、重複のない集合（set）、要素ごとに score という数値を持ち score の順に並ぶ集合（sorted set、zset）、フィールドと値の組を持つハッシュ（hash）などです。コマンドは型ごとに用意されていて、list には <code>LPUSH</code> や <code>BRPOP</code>、zset には <code>ZADD</code> や <code>ZRANGEBYSCORE</code> を使います。<Ref n={16} /></p>
          <p>Rails のキャッシュと Sidekiq が実際にどのキーを作るかを確かめました。RedisCacheStore で値を1件書き、Sidekiq 8.1.7 のクライアントでジョブを2件登録してから、キーごとに型・残りの有効期間（TTL）・内部の表現（OBJECT ENCODING）を表示しています。</p>
          <Code lang="ruby" title="redis_types.rb" code={redisTypesRb} />
          <Code lang="text" title="実行結果" code={redisTypesOut} />
          <p>キャッシュのキーは <code>namespace</code> に指定した <code>ag106:</code> が先頭に付いた string で、TTL は <code>expires_in</code> の 60 秒です。<code>perform_async</code> はキューの名前を <code>queues</code> という set に加え、ジョブの内容を JSON にして <code>queue:default</code> という list に <code>LPUSH</code> で入れます。Sidekiq のワーカーのプロセスは、この list から <code>BRPOP</code>（要素が来るまで待って取り出すコマンド）でジョブを取り出します。<code>perform_in</code> は、実行する時刻（1970 年からの秒数）を score にして <code>schedule</code> という zset に <code>ZADD</code> で入れます。Sidekiq のスケジューラーが定期的にこの zset を調べ、時刻が来たジョブを queue の list に移します。<Ref n={17} /></p>
          <Figure n={figure(7)} title="Rails のキャッシュと Sidekiq が Redis に作るキー" caption="redis_types.rb の実行結果と Sidekiq 8.1.7 の client.rb・fetch.rb をもとにした図。">
            <KeysFigure />
          </Figure>
          <p>Sidekiq のキーはどれも TTL が -1（期限なし）です。キャッシュは期限が切れたら消えてよく、消えても DB から作り直せます。ジョブのキーは処理されるまで残っている必要があり、消えるとジョブを失います。予約したジョブが何百件あっても、<code>schedule</code> は1つのキーです。この違いが、次の節以降で扱う永続化と追い出しの設定に関わります。OBJECT ENCODING の listpack や skiplist は Redis が要素の数や大きさに応じて選ぶ内部の表現で、アプリから見たコマンドの動作は変わりません。</p>
        </>
      ),
    },
    {
      id: "durability",
      title: "RDB と AOF で残るデータの範囲",
      body: (
        <>
          <p>Redis のデータはメモリーにあるので、プロセスが止まると、ディスクに保存していない分は消えます。保存の方法は2つあります。RDB はある時点のデータ全体をスナップショットとして1つのファイル（<code>dump.rdb</code>）に書く方法です。<code>save 60 1000</code>（60 秒の間に 1000 個以上のキーが変わったら保存）のような条件か、<code>BGSAVE</code> コマンドで、子プロセスを fork して書きます。AOF は、データを変えるコマンドを受け付けるたびにファイルに追記し、起動時にそれを実行し直してデータを作り直す方法です。AOF の fsync は <code>appendfsync</code> で決め、既定の everysec では1秒に1回です。<Ref n={3} /></p>
          <p>保存の設定を3通りにした Redis にキーを書き、SIGKILL で強制終了してから起動し直して、残ったキーを調べました。</p>
          <Code lang="bash" title="永続化の設定ごとに強制終了する（手順の要約）" code={persistSh} />
          <Code lang="text" title="実行結果（Redis 8.10.3）" code={persistOut} />
          <p>保存しない設定では、キーは1つも残りませんでした。RDB では、<code>BGSAVE</code> の後に書いた order:3 が失われ、スナップショットの時点のキーだけが残りました。ドキュメントは、RDB だけの場合は最後のスナップショットから後の数分間のデータを失う前提でいるよう説明しています。AOF では3つとも残りました。ここでは強制終了の前に 1.5 秒待ったので、everysec の fsync が済んでいます。ドキュメントによれば、everysec では障害で最大1秒分の書き込みを失い得ます。Redis 7.0 以降の AOF は、ディレクトリ（<code>appendonlydir</code>）の中の、ベースのファイル、追記のファイル、それらを記録するマニフェストに分かれています。ドキュメントは、PostgreSQL に近い安全性が必要なら RDB と AOF の両方を使うよう勧めています。<Ref n={3} /></p>
          <p>復旧が必要なデータでは、「ファイルがある」「レプリカがある」「バックアップから戻せる」という状態を分けて考えます。レプリカは元のサーバーへの書き込みを後から受け取るので、切り替えの直前の書き込みがレプリカに届いていないことがあります。バックアップには、削除や誤った更新の前の時点まで戻れることが必要です。どの障害で何を戻すかを決めると、必要な保存方法と、それを確かめる試験を選べます。</p>
          <p>キャッシュだけを置く Redis なら、永続化しない構成も選べます。注文を MySQL に保存し、Redis のキャッシュは MySQL から作り直せる値だけにしていれば、Redis のデータを失っても注文は残ります。ただし、再起動の直後は多くの要求が同時にキャッシュミスになり、MySQL に問い合わせが集まります。復旧で失うデータの種類と、復旧の直後に MySQL が処理できる量は、別々に見積もります。ジョブのキューを置く Redis では、失ったジョブを作り直せるか、外部への送信などの処理を再試行しても安全かも決めておきます（<ChapterLink n={18} section="idempotency" />）。</p>
        </>
      ),
    },
    {
      id: "eviction",
      title: "maxmemory と退避ポリシー",
      body: (
        <>
          <p>Redis が使うメモリーの上限は <code>maxmemory</code> で決めます。64 ビットの環境の既定は 0 で、上限がありません。上限を設定すると、データを増やすコマンドが来たときに使用量を調べ、上限を超えていれば <code>maxmemory-policy</code>（退避ポリシー）に従って処理します。主なポリシーは次のとおりです。<Ref n={2} /></p>
          <div className="table-wrap">
            <table>
              <caption>主な退避ポリシー（Redis のドキュメントから抜粋）</caption>
              <thead><tr><th>ポリシー</th><th>上限を超えたときの動作</th></tr></thead>
              <tbody>
                <tr><td><code>noeviction</code></td><td>キーを追い出さず、データを増やすコマンドをエラーにする。読み取りはできる。既定値</td></tr>
                <tr><td><code>allkeys-lru</code></td><td>すべてのキーから、最後に使われてから最も長いキーを追い出す</td></tr>
                <tr><td><code>allkeys-lfu</code></td><td>すべてのキーから、使われる頻度の低いキーを追い出す</td></tr>
                <tr><td><code>volatile-lru</code></td><td>TTL を設定したキーの中から、最後に使われてから最も長いキーを追い出す</td></tr>
                <tr><td><code>volatile-ttl</code></td><td>TTL を設定したキーの中から、残りの有効期間が最も短いキーを追い出す</td></tr>
              </tbody>
            </table>
          </div>
          <p>volatile で始まるポリシーは、TTL を設定したキーがなければ noeviction と同じ動作になります。LRU は正確な順序を持たず、キーをいくつか（<code>maxmemory-samples</code>、既定 5）選んで、その中で最後に使われてから最も長いものを追い出す近似です。ドキュメントは、キャッシュで特に理由がなければ allkeys-lru を勧めています。一方、volatile-lru などは1つの Redis でキャッシュと消えてはいけないキーを扱う場合に役立つが、できれば Redis を2つに分けることを考えるよう書いています。<Ref n={2} /></p>
          <h3>予約ジョブとキャッシュを同じ Redis に置いて上限に達する</h3>
          <p>Sidekiq で公開を予約したジョブを 300 件登録し、その時点の使用量より 2MB だけ多い上限を設定しました。そこに RedisCacheStore で 2KB の値を 2,000 件（約 4MB）書き、最後にもう1件ジョブを予約しました。RedisCacheStore は既定で 1KB を超える値を圧縮するので、メモリーを確実に使うように <code>compress: false</code> を指定しています。キャッシュの値には <code>expires_in</code> で TTL を付けました。</p>
          <Code lang="ruby" title="redis_evict.rb（抜粋）" code={evictRb} />
          <Code lang="text" title="実行結果（ポリシーごとに別々に実行）" code={evictOut} />
          <p>noeviction では、上限を超えた後のキャッシュの書き込み 1,037 件がエラーになりました。RedisCacheStore は Redis のエラーを例外にせず、<code>error_handler</code> に渡して <code>write</code> の戻り値を偽にします（redis_cache_store.rb の <code>failsafe</code>、498〜503行目）。そのため要求の処理は続き、キャッシュに保存されないだけです。一方、Sidekiq の <code>perform_in</code> は <code>RedisClient::OutOfMemoryError</code> を発生させました。アプリの中でジョブを登録する処理は、Redis のメモリーが足りないと例外で失敗します。予約済みの 300 件は残っています。<Ref n={19} /></p>
          <p>allkeys-lru では、書き込みの失敗はなく、キャッシュのキー 1,045 個が追い出されました。予約ジョブは 300 件から 1 件になりました。残った1件は上限に達した後に予約したジョブです。300 件のジョブは <code>schedule</code> という1つのキーに入っていて、キャッシュを書き始める前から使われていなかったので、最後に使われてから最も長いキーとして、まとめて追い出されました。エラーは出ないので、気づくのはジョブが実行されなかった後です。第6部の演習<a href="#/linux/case49">「予約した公開のジョブが、まとめて消えた」</a>はこの状況を EC2 のサーバーで調べます。</p>
          <p>volatile-lru では TTL のあるキャッシュのキーだけが追い出され、予約ジョブは 301 件すべて残りました。ただし、キャッシュを <code>expires_in</code> なしで書く箇所があると、そのキーは追い出しの対象にならず、TTL のあるキーを追い出しきった後は noeviction と同じくエラーになります。</p>
          <Figure n={figure(8)} title="退避ポリシーごとに、上限に達した後に残ったもの" caption="redis_evict.rb の実行結果をもとにした図。追い出されるキーは近似の LRU で選ばれるので、実行するたびに件数は少し変わる。">
            <EvictFigure />
          </Figure>
          <p>Sidekiq は起動するときに Redis の設定を読み、ポリシーが noeviction でなければ警告をログに出します。<Ref n={17} /></p>
          <Code lang="ruby" title="sidekiq/lib/sidekiq/cli.rb（80〜91行目）" href={`${SQ}/lib/sidekiq/cli.rb#L80-L91`} code={sidekiqWarn} />
          <p>キャッシュの上限と追い出しの設定は<ChapterLink n={22} section="rails-cache" />でも扱っています。</p>
        </>
      ),
    },
    {
      id: "roles",
      title: "キャッシュとジョブのキューを同じ Redis に置く場合",
      body: (
        <>
          <p>前の節の結果から、キャッシュとジョブのキューでは Redis に求める設定が逆になります。キャッシュは上限に達したら古いキーを追い出して書き込みを続けたいので allkeys-lru が合い、永続化もなくてよい場合が多いです。ジョブのキューはキーを1つも失いたくないので noeviction が合い、再起動で失わないように AOF などで永続化します。1つの Redis では <code>maxmemory-policy</code> を1つしか選べないので、両方を満たせません。</p>
          <p>同じ Redis に置くと、設定のほかにも共有するものがあります。コマンドを実行するスレッドは1つなので、キャッシュの大きな値の読み書きや遅いコマンドが続くと、Sidekiq のジョブの取り出しも待ちます。メモリーの上限もキャッシュとジョブで分け合います。<code>redis://…/0</code> と <code>/1</code> のように論理 DB の番号を分けても、同じプロセスなので、スレッド、メモリーの上限、ポリシー、障害は分かれません。AWS の ElastiCache を使う場合も、キャッシュ用とキュー用でクラスターを分ければ、それぞれに合ったパラメーターと大きさを選べます。</p>
          <p>Redis を1つにまとめる場合は、すべてのキャッシュに <code>expires_in</code> を付けて volatile-lru にし、ジョブの最大の量とキャッシュに使える量を足した値よりも <code>maxmemory</code> を十分に大きくし、<code>evicted_keys</code> と使用量を監視します。この方法は運用するサービスを増やさない代わりに、TTL を付け忘れた書き込みや想定外のジョブの増加で上の実験と同じ状況になる、という条件付きの構成です。</p>
          <p>Redis のデータは MySQL のトランザクションに含まれません。注文を保存するトランザクションの中でジョブを登録すると、トランザクションがロールバックしても Redis のジョブは残り、存在しない注文に対してジョブが動くことがあります。逆に、コミットした後に登録しようとして Redis のエラーで失敗すると、注文はあるのにジョブがない状態になります。登録の時点と失敗したときの扱いは<ChapterLink n={18} section="transaction" />で、DB の中に送る予定を記録しておく方法は<ChapterLink n={53} />で扱っています。</p>
        </>
      ),
    },
    {
      id: "metrics",
      title: "キャッシュのミスと DB の混雑を切り分ける",
      body: (
        <>
          <p>Rails が商品一覧を表示するとき、キャッシュに値がなければ MySQL を読み、組み立てた結果を Redis に保存する構成を考えます。Redis のキーが追い出されたり再起動で消えたりしてキャッシュミスが増えると、MySQL への問い合わせが増えます。SQL の内容が同じでも、同時に実行する数が増えると MySQL の応答は遅くなる場合があります。</p>
          <p>Redis の <code>INFO stats</code> では、キーを読めた回数（<code>keyspace_hits</code>）、キーがなかった回数（<code>keyspace_misses</code>）、上限のために追い出したキーの数（<code>evicted_keys</code>）を確認できます。ドキュメントは、hits ÷（hits ＋ misses）をキャッシュから返せた割合として使い、割合が想定より低ければ evicted_keys を、それも少なければ期限切れの数（<code>expired_keys</code>）を確かめるよう説明しています。<Ref n={2} /><Ref n={4} /></p>
          <h3>キャッシュの読み取り前後でカウンターを比べる</h3>
          <p>Docker の使い捨てコンテナ内で、まだ保存していないキーを読みます。そのキーに値を保存してから二度読み直し、コマンド実行前後のカウンターを比べます。</p>
          <Code lang="bash" title="隔離した Redis の INFO stats を二度取得する" code={redisExample} />
          <div className="table-wrap">
            <table>
              <caption>Redis 8.10.3 での実行結果</caption>
              <thead><tr><th>カウンター</th><th>実行前</th><th>実行後</th><th>この例で増えた件数</th></tr></thead>
              <tbody>
                <tr><td><code>keyspace_hits</code></td><td>0</td><td>2</td><td>値を読み出せた 2 件</td></tr>
                <tr><td><code>keyspace_misses</code></td><td>0</td><td>1</td><td>値がなかった 1 件</td></tr>
                <tr><td><code>evicted_keys</code></td><td>0</td><td>0</td><td>メモリー上限による追い出し 0 件</td></tr>
              </tbody>
            </table>
          </div>
          <p>メモリーの上限でキーを追い出した件数が増えなくても、未登録のキーや期限切れのキーの読み取りはミスになります。Redis のカウンターはサーバー全体の集計なので、Sidekiq などほかの用途の読み取りも含まれます。特定の一覧のキャッシュを調べるときは、Rails 側でキャッシュを読む箇所と結果を記録します（<ChapterLink n={22} section="notifications" />）。</p>
          <p>本番で一覧の表示の遅れを調べるときは、再起動をまたがない同じ時間帯の差分を取り、一覧へのリクエストの数、キャッシュミスの数、MySQL の側のカウンター（<code>Questions</code> や、前の節の digest の集計で一覧の SQL の実行回数）を比べます。キャッシュミスと一覧の SQL の回数が同じ時間帯に増えていれば、DB の混雑はキャッシュの減少から来ている可能性が高くなります。SQL の回数が変わらずに1回あたりの時間だけが延びているなら、ロックの待ちやバッファープールにないページの読み込みなど、MySQL の中を調べます。</p>
          <p>MySQL のバッファープールにも、よく読むページが残っています。Redis のキャッシュを失っても、MySQL のページがバッファープールにあれば、ディスクの読み込みは急には増えないことがあります。その場合も、SQL の実行と結果の転送、Rails での組み立ての CPU は増えます。キャッシュを増やす案と SQL を改善する案を比べるときは、それぞれでどの処理が減るのかを、どの負荷を下げたいのかと対応づけて考えます。</p>
          <Ref n={4} />
        </>
      ),
    },
    {
      id: "decisions",
      title: "判断基準とトレードオフ",
      body: (
        <>
          <p>この章の実験から、設定を決めるときの目安をまとめます。値はこの章の環境（4 コアの WSL2 の上の Docker、MySQL 8.4.13、Redis 8.10.3）で測ったもので、本番のハードウェアや AWS のマネージドサービスでは時間の大きさが変わります。どの処理が待ちを生むかという関係は同じです。</p>
          <ul>
            <li>MySQL の <code>max_connections</code>：Web・ジョブ・運用で動かすプロセスについてプールの上限を足し、そこにデプロイ中に一時的に増える分と管理用の余裕を足して決めます。Too many connections が出たときは、上限を上げる前に、どのプロセスの接続が多いかを PROCESSLIST の接続元で数え、プールが大きすぎないかを確かめます。上限を上げると、スレッドとメモリーが増えるのに加え、同時に実行する SQL が増えて1つずつが遅くなる場合があります。</li>
            <li>バッファープール：よく読む表と索引のページが入るかを、<code>Innodb_buffer_pool_reads</code> の増え方で判断します。読み込みが多いのにメモリーを増やせない場合は、読むページを減らす索引や SQL の改善（<ChapterLink n={37} />）が先です。</li>
            <li><code>innodb_flush_log_at_trx_commit</code> と <code>sync_binlog</code>：注文や支払いを扱う DB では既定の 1 と 1 にします。書き込みが遅いときは、設定を緩めるより先に、まとめてコミットしてコミットの回数を減らします。2 や 0 は最後の約1秒を失っても作り直せるデータに限られる、というのが本書の考えです。</li>
            <li>調べる道具：今の接続と止まっている SQL は PROCESSLIST、時間帯の変化は SHOW GLOBAL STATUS の差分、SQL ごとの回数と時間は performance_schema の digest の集計を使います。</li>
            <li>Redis のコマンド：本番で KEYS や、要素の多いキーを一度に返すコマンドを使わず、SCAN 系のコマンドで少しずつ読みます。SLOWLOG で長いコマンドを確かめます。</li>
            <li>Redis の分け方：キャッシュは allkeys-lru で永続化なし、ジョブのキューは noeviction で AOF を有効にして、別々の Redis にするのが分かりやすい構成です。1つにまとめるなら、キャッシュにすべて TTL を付けて volatile-lru にし、使用量と evicted_keys を監視します。</li>
          </ul>
          <p>関連する章と演習：<ChapterLink n={15} section="pool" />、<ChapterLink n={23} section="sizing" />、<ChapterLink n={113} />、<ChapterLink n={37} />、<ChapterLink n={38} />、<ChapterLink n={22} section="rails-cache" />、<ChapterLink n={18} section="sidekiq" />、<ChapterLink n={107} />。第6部では、<a href="#/linux/case07">「Sidekiqがジョブを処理していない原因を探す」</a>、<a href="#/linux/case08">「Redisへの接続エラーを調査する」</a>、<a href="#/linux/case24">「遅いページの原因をDB側から突き止める」</a>、<a href="#/linux/case40">「ときどき Too many connections が出る」</a>、<a href="#/linux/case49">「予約した公開のジョブが、まとめて消えた」</a>で、この章の内容を本番に近い状態で調べられます。</p>
          <Callout kind="note" title="RDS・Aurora・ElastiCache の場合">
            <p>AWS のマネージドサービスでは、<code>max_connections</code>、<code>innodb_flush_log_at_trx_commit</code>、<code>maxmemory-policy</code> などをパラメーターグループで設定し、OS のファイルやプロセスには直接触れません。Aurora はストレージの仕組みが通常の MySQL と違い、redo とページの書き出しの流れもこの章の図とは異なります。この章の内容は、設定の意味とカウンターの読み方として使ってください。構成の全体は<ChapterLink n={107} section="managed-services" />にあります。</p>
          </Callout>
        </>
      ),
    },
  ],
  sources: [
    {
      title: "The InnoDB Storage Engine",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "トランザクション、バッファープール、redo ログ",
    },
    {
      title: "Key eviction",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/develop/reference/eviction/",
      accessed: "2026-11-27",
      version: "Redis 8 系",
      note: "maxmemory、退避ポリシーの一覧、近似の LRU と maxmemory-samples、allkeys-lru の推奨と Redis を分ける勧め、ヒットの割合の計算",
    },
    {
      title: "Redis persistence",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/",
      accessed: "2026-11-27",
      version: "Redis 8 系",
      note: "RDB と AOF、appendfsync everysec で失い得る範囲、Redis 7.0 以降の複数ファイルの AOF、両方を使う勧め",
    },
    {
      title: "INFO",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/commands/info/",
      accessed: "2026-11-27",
      version: "Redis 8 系",
      note: "keyspace_hits、keyspace_misses、evicted_keys の定義",
    },
    {
      title: "Too many connections",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/too-many-connections.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "max_connections + 1 本目を CONNECTION_ADMIN の権限を持つアカウントに取っておくこと",
    },
    {
      title: "Buffer Pool",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "中間点への挿入、old サブリスト 3/8、走査への対策、専用サーバーで物理メモリーの 80% まで",
    },
    {
      title: "InnoDB Startup Options and System Variables",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "innodb_flush_log_at_trx_commit の 0・1・2 の意味と、sync_binlog=1 との組み合わせの推奨。innodb_buffer_pool_size の既定 128MB",
    },
    {
      title: "The Binary Log",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/binary-log.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "binlog の用途（レプリケーションと復旧）、既定で有効、sync_binlog、InnoDB との2相コミットとクラッシュ後の処理",
    },
    {
      title: "Redo Log",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-redo-log.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "redo ログの役割、innodb_redo_log_capacity、#innodb_redo ディレクトリ",
    },
    {
      title: "Doublewrite Buffer",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/innodb-doublewrite-buffer.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "ページをデータファイルに書く前に doublewrite の領域に書き、復旧に使うこと",
    },
    {
      title: "Performance Schema Statement Digests and Sampling",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/performance-schema-statement-digests.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "SQL を正規化したダイジェストと events_statements_summary_by_digest",
    },
    {
      title: "SHOW PROCESSLIST Statement",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/show-processlist.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "PROCESSLIST の各列の意味",
    },
    {
      title: "Server Status Variables",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/server-status-variables.html",
      accessed: "2026-11-27",
      version: "MySQL 8.4",
      note: "Threads_*、Max_used_connections、Connection_errors_max_connections、Innodb_pages_read などの定義",
    },
    {
      title: "Server System Variables",
      publisher: "MySQL",
      url: "https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html",
      accessed: "2026-11-28",
      version: "MySQL 8.4",
      note: "max_connections（既定 151）、thread_cache_size（既定値は 8 + max_connections / 100、上限 100）、thread_handling。実行例は MySQL 8.4.13 で実測",
    },
    {
      title: "Diagnosing latency issues",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/",
      accessed: "2026-11-27",
      version: "Redis 8 系",
      note: "ほぼ1つのスレッドで要求を順に処理すること、遅いコマンドがほかのクライアントを待たせること、本番での KEYS と SCAN、SLOWLOG",
    },
    {
      title: "Redis data types",
      publisher: "Redis",
      url: "https://redis.io/docs/latest/develop/data-types/",
      accessed: "2026-11-27",
      version: "Redis 8 系",
      note: "string・list・set・sorted set・hash の型",
    },
    {
      title: "sidekiq/lib/sidekiq/client.rb・fetch.rb・cli.rb",
      publisher: "Sidekiq（GitHub）",
      url: `${SQ}/lib/sidekiq/client.rb#L286-L301`,
      accessed: "2026-11-27",
      version: "Sidekiq 8.1.7",
      note: "schedule への ZADD、queues への SADD、queue:<名前> への LPUSH（client.rb 286〜301行目）、BRPOP での取り出し（fetch.rb 48行目）、noeviction 以外のときの警告（cli.rb 80〜91行目）",
    },
    {
      title: "activerecord/lib/active_record/connection_adapters/abstract_adapter.rb",
      publisher: "Rails（GitHub）",
      url: `${GH}/activerecord/lib/active_record/connection_adapters/abstract_adapter.rb#L716-L750`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "reconnect! が connection_retries（既定 1）の回数だけ 0.1 秒ずつ待って接続し直すこと、retryable_connection_error?",
    },
    {
      title: "activesupport/lib/active_support/cache/redis_cache_store.rb",
      publisher: "Rails（GitHub）",
      url: `${GH}/activesupport/lib/active_support/cache/redis_cache_store.rb#L498-L503`,
      accessed: "2026-11-27",
      version: "Rails 8.1.4.1",
      note: "failsafe が Redis のエラーを error_handler に渡して既定の戻り値を返すこと",
    },
    {
      title: "mysql-server: sql/binlog.cc（MYSQL_BIN_LOG::prepare）・storage/innobase/trx/trx0trx.cc（trx_commit_in_memory）",
      publisher: "MySQL（GitHub）",
      url: "https://github.com/mysql/mysql-server/blob/mysql-8.4.13/sql/binlog.cc",
      accessed: "2026-11-28",
      version: "MySQL 8.4.13",
      note: "binlog の prepare で HA_IGNORE_DURABILITY を設定し、prepare の redo を binlog の書き込みの直前にまとめて fsync すること。InnoDB はこの指定があるとき commit の redo の fsync を待たないこと。binlog あり・なしの fsync の回数は MySQL 8.4.13 で実測",
    },
  ],
}

export default chapter
