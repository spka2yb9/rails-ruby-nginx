/* カリキュラム定義
   実装済みCASEは js/scenarios/*.js にデータがあるもの。
   ここは「目次」であって、演習の中身は持たない。                       */
(function () {
'use strict';

var CURRICULUM = [
  { level: 0, name: '本番環境へ入る', cases: [
    { id: 'case00',  title: '本番サーバーへ入る（Session Manager）',   learn: 'aws ssm / whoami / su' },
    { id: 'case00b', title: '監視の通知からサーバーへ降りる',           learn: 'request_id / grep / 時刻の突き合わせ' }
  ]},
  { level: 1, name: 'Railsサーバーの中を移動する', cases: [
    { id: 'case01', title: 'Railsアプリがどこにあるか確認する', intro: 'アプリの場所を確かめる', learn: 'pwd / cd / ls' },
    { id: 'case02', title: 'Railsの設定ファイルを確認する', intro: '設定からデータベースの接続先を読む', learn: 'ls / cat' },
    { id: 'case03', title: '大量のRailsログから目的のエラーを探す', intro: 'ログからエラーを数える', learn: 'tail / grep' }
  ]},
  { level: 2, name: 'Railsの障害を調査する', cases: [
    { id: 'case04', title: 'Railsで発生した500エラーの原因を探す', intro: '500エラーの原因を切り分ける', learn: 'tail / systemctl' },
    { id: 'case05', title: 'Railsへのリクエストをリアルタイムで追う',  learn: 'tail -f / Ctrl+C' },
    { id: 'case06', title: 'Pumaが動いているか確認する',               learn: 'ps aux / pgrep / systemctl / journalctl' },
    { id: 'case07', title: 'Sidekiqがジョブを処理していない原因を探す', learn: 'systemctl / journalctl / ps / Redis' },
    { id: 'case08', title: 'Redisへの接続エラーを調査する',            learn: 'ss / systemctl / journalctl / curl' }
  ]},
  { level: 3, name: 'Linuxサーバー自体を調査する', cases: [
    { id: 'case09', title: 'サーバーが急に重くなった原因を探す',       learn: 'top / free -h / uptime' },
    { id: 'case10', title: 'ディスク容量不足を調査する',               learn: 'df -h / du -sh / du -sh *' },
    { id: 'case11', title: '特定ポートを使用しているprocessを調査する', learn: 'ss -lntp' }
  ]},
  { level: 4, name: 'デプロイを調査する', cases: [
    { id: 'case12', title: 'デプロイしたコードが反映されているか確認する', learn: 'ls -la / cat REVISION / git log' },
    { id: 'case13', title: 'currentがどのreleaseを向いているか確認する',   learn: 'ls -la / readlink' },
    { id: 'case14', title: '古いPuma processが残っていないか確認する',     learn: 'ps aux / pgrep / systemctl' },
    { id: 'case15', title: 'Pumaが起動できなかった原因をjournalctlから探す', learn: 'journalctl -u puma' }
  ]},
  { level: 5, name: '権限・環境設定', cases: [
    { id: 'case16', title: 'Permission deniedの原因を探す',            learn: 'ls -l / chmod / chown' },
    { id: 'case17', title: 'Railsが必要な環境変数を読み込めているか確認する', learn: 'env / printenv / echo' }
  ]},
  { level: 6, name: '総合障害演習', cases: [
    { id: 'final',  title: 'デプロイ直後から502が発生している',        learn: 'これまで全部' }
  ]},
  { level: 7, name: '復旧する', cases: [
    { id: 'case18', title: 'サービスを安全に再起動する',                learn: 'systemctl restart / unit / sudo' },
    { id: 'case19', title: 'ディスクを空けてPumaを復旧させる',          learn: 'truncate / logrotate / restart' },
    { id: 'case20', title: 'メンテナンスページを出してロールバックする', learn: 'maintenance / ln -sfn / restart' },
    { id: 'case21', title: 'メモリを無停止でリフレッシュする',           learn: 'pumactl phased-restart / cron' },
    { id: 'case27', title: '設定ファイルを直して再発を止める',            learn: 'vi / cp -p / logrotate -d' }
  ]},
  { level: 8, name: 'Railsを運用する', cases: [
    { id: 'case22', title: '本番のrails consoleで安全に調べる',          learn: 'rails console --sandbox / count / pluck' },
    { id: 'case23', title: 'カラム削除をダウンタイム無しで行う',          learn: 'db:migrate / db:rollback / 2段階リリース' },
    { id: 'case24', title: '遅いページの原因をDB側から突き止める',        learn: 'slow log / SHOW PROCESSLIST / EXPLAIN' }
  ]},
  { level: 9, name: '定期実行と検索基盤', cases: [
    { id: 'case25', title: '定期バッチが動いていない原因を探す',            learn: 'crontab / syslog / systemd timer' },
    { id: 'case26', title: '検索に新しい求人が出てこない',                  learn: 'curl / OpenSearch / alias' }
  ]},
  { level: 10, name: 'ログとファイルを掘る', cases: [
    { id: 'case28', title: '大量のアクセスログから傾向を出す',          learn: 'awk / sort / uniq -c / zgrep' },
    { id: 'case29', title: '容量は空いているのに書き込めない',          learn: 'df -i / find / lsof' }
  ]},
  { level: 11, name: 'プロセスとネットワークを深く見る', cases: [
    { id: 'case30', title: 'Too many open files を直す',                learn: '/proc / ulimit / unit / daemon-reload' },
    { id: 'case31', title: '外部連携が2つとも落ちている',                learn: 'dig / /etc/hosts / openssl' },
    { id: 'case32', title: '長時間の作業が途中で止まっていた',           learn: 'HUP / tmux / nohup' }
  ]},
  { level: 12, name: 'AWS上の構成を調べる', cases: [
    { id: 'case33', title: 'ECS上の本番で、どのコードが動いているか確かめる', learn: 'aws ecs / ecr / elbv2 / --query' },
    { id: 'case34', title: 'CloudWatch Logs で、通知のリクエストを追う',     learn: 'aws logs tail / filter-log-events' }
  ]},
  { level: 13, name: 'コンテナのデプロイと障害対応', cases: [
    { id: 'case35', title: 'デプロイしたのに、新しいタスクが起動しては止まる', learn: 'deployments / stoppedReason / exitCode / ロールバック' },
    { id: 'case36', title: 'デプロイが終わらず、新しいタスクが入れ替わり続ける', learn: 'describe-target-health / force_ssl と /up' },
    { id: 'case37', title: 'マイグレーションを run-task で一度だけ流す',       learn: 'run-task / --network-configuration / wait tasks-stopped' },
    { id: 'case38', title: '本番の rails console を ECS Exec で開く',          learn: 'execute-command / タスクロール / iam put-role-policy' },
    { id: 'case39', title: 'デプロイのあと、処理中だったジョブが消えた',       learn: 'SIGTERM / stopTimeout / Sidekiq の timeout' }
  ]},
  { level: 14, name: 'Aurora を運用する', cases: [
    { id: 'case40', title: 'ときどき Too many connections が出る',            learn: 'max_connections / processlist / 最大 ACU と再起動' },
    { id: 'case41', title: '消してしまった下書きを、特定時点への復元で戻す',  learn: 'restore-db-cluster-to-point-in-time / date -u / mysqldump' },
    { id: 'case42', title: 'フェイルオーバーのあと、書き込みだけがときどき失敗する', learn: 'describe-events / dig / ss -tnp / phased-restart' }
  ]},
  { level: 15, name: '権限・秘密情報・変更の記録', cases: [
    { id: 'case43', title: '履歴書のアップロードだけが AccessDenied になる',   learn: 'get-role-policy / simulate-principal-policy / put-role-policy' },
    { id: 'case44', title: 'Parameter Store の値を変えたのに、メールが送れないまま', learn: 'get-parameter-history / /proc/PID/environ / EnvironmentFile' },
    { id: 'case45', title: 'web-2 だけが DB につながらない',                     learn: 'describe-security-groups / cloudtrail lookup-events' }

  ]},
  { level: 16, name: 'エッジ・バッチ・監視', cases: [
    { id: 'case46', title: '一部のお客さまだけ 403 になる',                       learn: 'wafv2 get-sampled-requests / レートベースルール / update-ip-set' },
    { id: 'case47', title: '夜間の Salesforce 連携のバッチが失敗した',             learn: 'batch describe-jobs / exitCode 137 / --container-overrides' },
    { id: 'case48', title: '30分サイトが落ちていたのに、アラームが鳴らなかった',     learn: 'describe-alarms / TreatMissingData / HTTPCode_ELB_5XX_Count' }

  ]},
  { level: 17, name: 'EC2 サーバーを保守する', cases: [
    { id: 'case49', title: '予約した公開のジョブが、まとめて消えた',               learn: 'redis-cli INFO / maxmemory-policy / evicted_keys' },
    { id: 'case50', title: 'セキュリティ更新のあと、何を再起動するか',             learn: 'needrestart -b / lsof の DEL / uname -r' }
  ]}
];

var topics = [
  { name: 'サーバーに入って障害を調べる', description: '接続、ログ、サービスの状態から、どこで処理が止まったかを探ります。', levels: [0, 1, 2, 3, 4, 5, 6] },
  { name: 'アプリを復旧し、日々の運用を行う', description: '障害の原因をつかんだあと、復旧の前後で動作を確かめます。', levels: [7, 8, 9] },
  { name: 'Linuxの動作を詳しく調べる', description: '基本のログ調査で絞りきれないとき、ファイルや通信の状態を読みます。', levels: [10, 11] },
  { name: 'AWS上のRailsアプリを運用する', description: 'AWSの練習環境で、コンテナ、データベース、権限や監視の設定を調べます。', levels: [12, 13, 14, 15, 16, 17] }
];

var intro = CURRICULUM.flatMap(function (level) { return level.cases; })
  .filter(function (c) { return c.intro; });

/* 選択欄と「次の演習」で同じ順序を使う。入門の4件は先頭に一度だけ並ぶ。 */
var groups = [{ name: '入門コース', cases: intro }].concat(topics.map(function (topic) {
  var cases = CURRICULUM.filter(function (lv) { return topic.levels.includes(lv.level); })
    .flatMap(function (lv) { return lv.cases; })
    .filter(function (c) { return !c.intro; });
  return { name: topic.name, cases: cases };
}));

function readyIds() {
  return groups.flatMap(function (group) { return group.cases; })
    .filter(function (c) { return window.LFR.scenarios.def(c.id); })
    .map(function (c) { return c.id; });
}

window.LFR = window.LFR || {};
window.LFR.Lessons = { curriculum: CURRICULUM, topics: topics, groups: groups, intro: intro, readyIds: readyIds };
})();
