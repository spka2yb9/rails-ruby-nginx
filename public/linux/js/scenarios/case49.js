/* CASE 49 — 予約した公開のジョブが、まとめて消えた（Redis の maxmemory-policy）
   1台の Redis（127.0.0.1:6379/0）を、Sidekiq のキューと Rails のキャッシュの両方が使っている。
   maxmemory-policy が allkeys-lru なので、メモリが上限に達すると、キャッシュだけでなく Sidekiq のキー（予約ジョブの schedule）も消される。
   Sidekiq は起動するときに、noeviction 以外なら警告を出している（lib/sidekiq/cli.rb） */
(function () {
'use strict';
var APP = '/var/www/myapp';
var REL = APP + '/releases/20260914120000';
var HOME = '/home/deploy';
var MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;

var stopAt = 0, bootAt = 0;   /* メンテナンスで Sidekiq を止めていた間（CASE を開いたときに決める） */
function hhmm(t) { return new Date(t + 9 * 3600000).toISOString().slice(11, 16); }

function jstClock(t) { var s = new Date(t + 9 * 3600000).toUTCString().split(' '); return s[2] + ' ' + Number(s[1]) + ' ' + s[4]; }

var files = {};

files[HOME + '/notes/maintenance.md'] = function () {
  return '# 昨夜のメンテナンス\n\n' +
    '- ' + hhmm(stopAt) + '〜' + hhmm(bootAt) + '、DB の大きなテーブルを作り直すため、Sidekiq を止めていた（sudo systemctl stop sidekiq）\n' +
    '- Puma は動かしたまま。その間、検索エンジンのクローラーのアクセスが多かった\n';
};

files[HOME + '/support/inquiry.md'] =
'# サポートからの連絡\n\n' +
'- 求人の「公開日時の予約」（指定した日時に公開する機能）が、昨夜から動いていない企業が何社もある\n' +
'- Sidekiq の管理画面（/sidekiq）を見ると、Scheduled（予約中のジョブ）が 3件しかない。いつもは数百件ある\n' +
'- Retries にも Dead にも、それらしいジョブは無い\n';

files['/etc/redis/redis.conf'] =
'bind 127.0.0.1 -::1\n' +
'port 6379\n' +
'daemonize yes\n' +
'supervised systemd\n' +
'logfile /var/log/redis/redis-server.log\n' +
'databases 16\n' +
'save 3600 1 300 100 60 10000\n' +
'dir /var/lib/redis\n\n' +
'############################## MEMORY MANAGEMENT ################################\n\n' +
'# メモリの上限。これを超えると maxmemory-policy に従ってキーを消す（noeviction なら書き込みをエラーにする）\n' +
'maxmemory 512mb\n' +
'maxmemory-policy allkeys-lru\n';

files[REL + '/config/environments/production.rb'] =
'Rails.application.configure do\n' +
'  config.cache_classes = true\n' +
'  config.eager_load = true\n\n' +
'  # 1年前にキャッシュを入れたとき、既にある Redis をそのまま使った\n' +
'  config.cache_store = :redis_cache_store, { url: ENV.fetch("REDIS_URL"), expires_in: 1.day }\n\n' +
'  config.active_job.queue_adapter = :sidekiq\n' +
'end\n';

files[REL + '/config/initializers/sidekiq.rb'] =
'Sidekiq.configure_server do |config|\n' +
'  config.redis = { url: ENV.fetch("REDIS_URL") }\n' +
'end\n\n' +
'Sidekiq.configure_client do |config|\n' +
'  config.redis = { url: ENV.fetch("REDIS_URL") }\n' +
'end\n';

files[REL + '/app/jobs/job_publish_job.rb'] =
'# 求人を、予約した日時に公開する\n' +
'#   JobPublishJob.set(wait_until: job.publish_at).perform_later(job.id)\n' +
'class JobPublishJob < ApplicationJob\n' +
'  queue_as :default\n\n' +
'  def perform(job_id)\n' +
'    job = Job.find(job_id)\n' +
'    job.publish! if job.scheduled? && job.publish_at <= Time.current\n' +
'  end\n' +
'end\n';

/* メンテナンスで止めて、朝に起動し直したときのログ。noeviction でないので警告を出している */
function sidekiqJournal() {
  var L = [], t = bootAt;
  var head = function (at, pid) { return jstClock(at) + ' production ' + (pid ? 'sidekiq[1502]: ' : 'systemd[1]: '); };
  var log = function (at, lv, s) { return head(at, true) + new Date(at).toISOString() + ' pid=1502 tid=2ag ' + lv + ': ' + s; };
  L.push(head(stopAt) + 'Stopping Sidekiq background worker for myapp (production)...');
  var old = function (at, s) { return jstClock(at) + ' production sidekiq[1491]: ' + new Date(at).toISOString() + ' pid=1491 tid=2ag INFO: ' + s; };
  L.push(old(stopAt + 20, 'Shutting down'));
  L.push(old(stopAt + 3000, 'Bye!'));
  L.push(head(stopAt + 3100) + 'Stopped Sidekiq background worker for myapp (production).');
  L.push(head(t - 2000) + 'Starting Sidekiq background worker for myapp (production)...');
  L.push(log(t, 'INFO', 'Booted Rails 7.2.1 application in production environment'));
  L.push(log(t + 50, 'INFO', 'Upgrade to Sidekiq Pro for more features and support: https://sidekiq.org'));
  L.push(log(t + 80, 'WARN', ''));
  L.push(head(t + 80, true));
  L.push(head(t + 80, true) + 'WARNING: Your Redis instance will evict Sidekiq data under heavy load.');
  L.push(head(t + 80, true) + "The 'noeviction' maxmemory policy is recommended (current policy: 'allkeys-lru').");
  L.push(head(t + 80, true) + 'See: https://github.com/sidekiq/sidekiq/wiki/Using-Redis#memory');
  L.push(head(t + 80, true));
  L.push(head(t + 900) + 'Started Sidekiq background worker for myapp (production).');
  return L;
}

window.LFR.scenarios.add({
  id: 'case49',
  level: 17,
  title: '予約した公開のジョブが、まとめて消えた',
  subtitle: 'Sidekiq とキャッシュが同じ Redis を使っているときの、メモリの上限と消し方の決まりを確かめる',

  description:
'サポートから連絡がありました（~/support/inquiry.md）。\n' +
'求人の「公開日時の予約」が動いていないそうです。予約中のジョブがほとんど無くなっています。\n' +
'失敗した記録（Retries・Dead）にもありません。\n\n' +
'昨夜はメンテナンスで、数時間 Sidekiq を止めていました（~/notes/maintenance.md）。\n' +
'このサーバーでは、Puma・Sidekiq と同じサーバーで Redis（127.0.0.1:6379）が動いています。\n' +
'ジョブがどこへ行ったのかを突き止め、これ以上消えないようにしてください。',

  learn: [
    { name: 'Sidekiq の起動時の警告', cmd: 'journalctl -u sidekiq | grep -A3 WARNING',
      desc: 'Sidekiq は起動するときに Redis の設定を確かめ、maxmemory-policy が noeviction でなければ警告を出します。' },
    { name: 'Redis の使用量と上限', cmd: 'redis-cli INFO memory',
      desc: 'used_memory_human が今使っているメモリ、maxmemory_human が上限、maxmemory_policy が上限に達したときの決まりです。\n' +
            '  noeviction    書き込みをエラーにする（キーは消さない）\n' +
            '  allkeys-lru   すべてのキーから、最近使われていないものを消す\n' +
            '  volatile-lru  有効期限（TTL）が付いたキーから、最近使われていないものを消す' },
    { name: '消されたキーの数', cmd: 'redis-cli INFO stats | grep evicted_keys',
      desc: 'evicted_keys は上限に達したために消したキーの数（Redis が起動してからの合計）です。' },
    { name: 'キーの数と有効期限', cmd: 'redis-cli INFO keyspace',
      desc: 'db0:keys=… はキーの数、expires=… はそのうち有効期限の付いたキーの数です。\n' +
            'Rails のキャッシュ（expires_in を付けたもの）は有効期限付き、Sidekiq のキューや予約ジョブは有効期限なしです。' },
    { name: '予約中のジョブの数', cmd: 'redis-cli ZCARD schedule',
      desc: 'Sidekiq は予約中のジョブを schedule という1つのキー（ソート済みセット）に入れています。\n' +
            'キーごと消されると、予約中のジョブがすべて無くなります。' },
    { name: '設定を変える', cmd: 'redis-cli CONFIG SET maxmemory-policy volatile-lru',
      desc: 'CONFIG SET は動いている Redis の設定をその場で変えます。再起動すると redis.conf の値に戻るので、redis.conf も直します。' }
  ],

  startDirectory: APP + '/current',
  clock: 'now',
  files: files,
  journal: {
    /* CASE を開くたびに、時刻を今から決め直す */
    get sidekiq() { bootAt = Math.floor((Date.now() - 4 * HOUR) / MIN) * MIN; stopAt = bootAt - 6 * HOUR; return sidekiqJournal(); }
  },
  redis: {
    dbsize: 1203344,
    info: {
      server: { redis_version: '7.2.4', redis_mode: 'standalone', os: 'Linux 5.15.0-125-generic x86_64', process_id: 1530, tcp_port: 6379, uptime_in_days: 14 },
      memory: { used_memory: 536823104, used_memory_human: '511.95M', used_memory_peak_human: '512.00M', maxmemory: 536870912, maxmemory_human: '512.00M', maxmemory_policy: 'allkeys-lru', mem_fragmentation_ratio: '1.07' },
      stats: { total_connections_received: 48213, total_commands_processed: 902318841, expired_keys: 1840211, evicted_keys: 184213, keyspace_hits: 61028811, keyspace_misses: 9128834 },
      keyspace: { db0: 'keys=1203344,expires=1201876,avg_ttl=41922013' }
    },
    config: { maxmemory: '536870912', 'maxmemory-policy': 'allkeys-lru', 'maxmemory-samples': '5' },
    sizes: { schedule: 3, retry: 0, dead: 0, 'queue:default': 0, 'queue:mailers': 0 }
  },

  hints: [
    'まず Sidekiq のログを見てください。起動したときに、Redis について何か言っています。\n\n' +
    '  journalctl -u sidekiq | grep -A3 WARNING',

    'Redis のメモリと、消されたキーの数を確かめます。\n\n' +
    '  redis-cli INFO memory\n' +
    '  redis-cli INFO stats | grep evicted_keys\n\n' +
    'この Redis を、ほかに何が使っているかを config/environments/production.rb で確かめてください。',

    'すぐにできる手当ては、有効期限の付いたキー（キャッシュ）だけを消す決まり（volatile-lru）に変えることです。\n' +
    'redis-cli CONFIG SET で変え、/etc/redis/redis.conf も同じ値に直します。'
  ],

  probes: [
    { key: 'sawWarning', label: 'Sidekiq が起動時に、Redis がデータを消しうると警告していたことを見つけた',
      test: function (c, res) { return /journalctl/.test(c) && /will evict Sidekiq data/.test(res.stdout); } },
    { key: 'sawMemoryFull', label: 'Redis のメモリが上限に達していて、allkeys-lru だと確かめた',
      test: function (c, res) { return /redis-cli/.test(c) && /maxmemory_policy:allkeys-lru|"allkeys-lru"/.test(res.stdout); } },
    { key: 'sawEvicted', label: 'Redis がキーを消していたことを確かめた',
      test: function (c, res) { return /redis-cli/.test(c) && /evicted_keys:\d+/.test(res.stdout); } },
    { key: 'sawSharedRedis', label: 'キャッシュと Sidekiq が同じ Redis を使っていることを確かめた',
      test: function (c, res) { return /production\.rb|cache_store/.test(c) && /redis_cache_store/.test(res.stdout); } },
    { key: 'sawSchedule', label: '予約中のジョブ（schedule）がほとんど残っていないことを確かめた',
      test: function (c, res) { return /redis-cli/.test(c) && /schedule/i.test(c) && /\(integer\) 3\b/.test(res.stdout); } },
    { key: 'changedPolicy', label: '動いている Redis の決まりを volatile-lru（か noeviction）に変えた',
      test: function (c, res) { return /redis-cli/.test(c) && /CONFIG\s+GET/i.test(c) && /"(volatile-lru|noeviction)"/.test(res.stdout); } },
    { key: 'persisted', label: 'redis.conf も同じ値に直した',
      test: function (c, res) { return /redis\.conf/.test(c) && /^maxmemory-policy (volatile-lru|noeviction)/m.test(res.stdout); } }
  ],

  evidence: [
    { key: 'sawWarning',     weight: 10, label: 'Sidekiq の起動時の警告を見つけた' },
    { key: 'sawMemoryFull',  weight: 12, label: 'Redis のメモリと、消し方の決まりを確かめた' },
    { key: 'sawEvicted',     weight: 10, label: 'キーが消されていたことを確かめた' },
    { key: 'sawSharedRedis', weight: 10, label: 'キャッシュと Sidekiq が同じ Redis だと気づいた' },
    { key: 'sawSchedule',    weight: 8,  label: '予約中のジョブが消えていることを確かめた' },
    { key: 'changedPolicy',  weight: 10, label: 'Redis の決まりを変えた' },
    { key: 'persisted',      weight: 6,  label: 'redis.conf にも反映した' }
  ],

  question: {
    text: '予約中のジョブが消えた理由は？',
    choices: [
      'Sidekiq の予約ジョブには有効期限があり、期限が過ぎたので Redis から消えた',
      'キャッシュと同じ Redis を使っていて、メモリが上限に達したとき、allkeys-lru の決まりで予約ジョブのキー（schedule）も消された',
      'Redis が再起動して、メモリの中身がすべて消えた',
      'Sidekiq のプロセスが落ちていて、予約ジョブが実行されずに捨てられた'
    ],
    answer: 1,
    explain:
'Sidekiq はメンテナンスのあとに起動したとき、こう警告しています。\n\n' +
'  WARNING: Your Redis instance will evict Sidekiq data under heavy load.\n' +
"  The 'noeviction' maxmemory policy is recommended (current policy: 'allkeys-lru').\n\n" +
'Redis のメモリは上限（512MB）に達していて、maxmemory-policy は allkeys-lru です。\n' +
'allkeys-lru は上限に達すると、すべてのキーの中から最近使われていないものを消します。\n' +
'evicted_keys が 18万を超えていて、実際に消し続けています。\n\n' +
'config/environments/production.rb を見ると、Rails のキャッシュ（redis_cache_store）も同じ REDIS_URL の Redis を使っています。\n' +
'キャッシュのキーが増えてメモリが上限に達し、Redis は「最近使われていないキー」を消し続けています。\n' +
'予約中のジョブは、Sidekiq が schedule という1つのキーにまとめて入れています。\n' +
'Sidekiq が動いている間は、数秒ごとにこのキーを読むので、消す候補にはなりにくいキーです。\n' +
'ところが、メンテナンスで Sidekiq を止めていた6時間は、誰もこのキーを読み書きしませんでした。\n' +
'その間もクローラーのアクセスでキャッシュが増え続け、schedule は消す候補になり、キーごと消されました。\n' +
'消されたジョブは失敗ではないので、Retries にも Dead にも残りません。\n\n' +
'すぐにできる手当ては、maxmemory-policy を volatile-lru にすることです。\n' +
'volatile-lru は有効期限の付いたキーだけを消します。キャッシュは expires_in: 1.day で全部に有効期限が付いていて（keyspace の expires がほぼ keys と同じ）、\n' +
'Sidekiq のキューや予約ジョブには有効期限がありません。\n' +
'noeviction にすると、メモリが上限に達したときに書き込みがエラーになり、キャッシュだけでなくジョブを積むこともできなくなります。\n' +
'1台の Redis を共有しているうちは、noeviction にはできません。\n\n' +
'本来の形はキャッシュ用の Redis を別に立て（allkeys-lru）、Sidekiq の Redis を noeviction にすることです。\n' +
'消えた予約は DB の求人（公開予約中で、まだ公開されていないもの）から積み直します。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. 消えたジョブが Retries にも Dead にも無いなら、Redis からデータが消されていないかを疑う\n' +
'2. Redis の maxmemory-policy と evicted_keys を確かめる\n' +
'3. Sidekiq のデータとキャッシュは、消してよいかどうかが違うので、別の Redis に分ける\n' +
'4. 起動時の WARNING は読み流さない。Sidekiq は noeviction 以外で警告を出している',
    wrong: [
'Sidekiq の予約ジョブ（schedule）には有効期限がありません。予約した日時まで残り続けます。\n' +
'消えたのは、Redis がメモリの上限に達して消したためです（evicted_keys）。',
null,
'Redis の uptime_in_days は 14 で、この2週間は再起動していません。止めていたのは Sidekiq だけです。\n' +
'それに、再起動しても redis.conf の save の設定でディスクから読み直します。',
'Sidekiq は朝に起動し直していて、今は動いています。止めていた間の予約ジョブも、起動すれば実行されるはずでした。\n' +
'予約ジョブは実行される前に Redis から消えていました。'
    ]
  },

  route: {
    steps: [
      'サポートの連絡とメンテナンスの記録で、予約中のジョブが失敗の記録も残さずに減っていることと、Sidekiq を止めていた時間を確かめる',
      'Sidekiq の起動時の警告を見つける',
      'Redis のメモリ・消し方の決まり・消されたキーの数・キーの有効期限を確かめる',
      'キャッシュと Sidekiq が同じ Redis を使っていることを確かめる',
      '決まりを volatile-lru に変え、redis.conf にも反映する'
    ],
    commands: [
      'cat ~/support/inquiry.md',
      'cat ~/notes/maintenance.md',
      'journalctl -u sidekiq | grep -A3 WARNING',
      'redis-cli INFO memory',
      'redis-cli INFO stats | grep evicted_keys',
      'redis-cli INFO keyspace',
      'redis-cli ZCARD schedule',
      'grep -n cache_store /var/www/myapp/current/config/environments/production.rb',
      'grep -n REDIS_URL /var/www/myapp/current/config/initializers/sidekiq.rb',
      'redis-cli CONFIG SET maxmemory-policy volatile-lru',
      'redis-cli CONFIG GET maxmemory-policy',
      "sudo sed -i 's/^maxmemory-policy allkeys-lru/maxmemory-policy volatile-lru/' /etc/redis/redis.conf",
      'grep ^maxmemory /etc/redis/redis.conf'
    ],
    note:
'volatile-lru はキャッシュ用の Redis を分けるまでの手当てです。\n' +
'分けたら、Sidekiq の Redis は noeviction にし、メモリの使用量に監視を付けてください。'
  }
});
})();
