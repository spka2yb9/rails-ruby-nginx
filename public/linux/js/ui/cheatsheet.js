/* Linuxチートシート
   コマンド名ではなく「何をしたいか」から引く。                        */
(function () {
'use strict';

var SHEET = [
  { group: '立ち位置とファイル', items: [
    { want: '今いる場所を知りたい',                 cmd: 'pwd' },
    { want: 'ファイル一覧を見たい',                 cmd: 'ls -la' },
    { want: 'Railsアプリの場所へ移動したい',        cmd: 'cd /var/www/myapp/current' },
    { want: 'currentがどのreleaseを指しているか知りたい', cmd: 'readlink current' },
    { want: '設定ファイルを読みたい',               cmd: 'cat config/database.yml' },
    { want: '長いファイルをスクロールして読みたい', cmd: 'less log/production.log' },
    { want: '設定ファイルを編集したい',             cmd: 'sudo vi /etc/logrotate.d/rails' },
    { want: 'viから抜けたい（保存せず）',           cmd: ':q!' },
    { want: 'viで保存して抜けたい',                 cmd: ':wq' },
    { want: '編集前にバックアップを取りたい',       cmd: 'cp -p <file> <file>.bak' },
    { want: '巨大なファイルの先頭だけ見たい',       cmd: 'head -n 20 log/production.log' },
    { want: 'ファイルを探したい',                   cmd: 'find /var/www/myapp -name "*.log"' }
  ]},
  { group: 'Railsのログ', items: [
    { want: 'Railsログの最後を見たい',              cmd: 'tail -n 100 log/production.log' },
    { want: 'Railsログをリアルタイムで見たい',      cmd: 'tail -f log/production.log' },
    { want: 'ERRORだけ探したい',                    cmd: 'grep -n "ERROR" log/production.log' },
    { want: '大文字小文字を無視して探したい',       cmd: 'grep -i timeout log/production.log' },
    { want: '件数だけ数えたい',                     cmd: 'grep -c "Completed 500" log/production.log' },
    { want: '絞り込んでから末尾だけ見たい',         cmd: 'grep ERROR log/production.log | tail -n 20' },
    { want: '多い順にランキングしたい',             cmd: 'grep ERROR log/production.log | sort | uniq -c | sort -rn' },
    { want: 'ログの行数を知りたい',                 cmd: 'wc -l log/production.log' }
  ]},
  { group: 'プロセスとサービス', items: [
    { want: 'Pumaを探したい',                       cmd: 'ps aux | grep puma' },
    { want: 'プロセスIDだけ欲しい',                 cmd: 'pgrep -a puma' },
    { want: 'Pumaの状態を見たい',                   cmd: 'systemctl status puma' },
    { want: 'Pumaのログを見たい',                   cmd: 'journalctl -u puma' },
    { want: '落ちた理由を直近だけ見たい',           cmd: 'journalctl -u redis -n 30' },
    { want: 'サービス一覧を見たい',                 cmd: 'systemctl list-units' },
    { want: 'Sidekiqが動いているか見たい',          cmd: 'systemctl status sidekiq' }
  ]},
  { group: 'サーバーの状態', items: [
    { want: 'ディスク容量を確認したい',             cmd: 'df -h' },
    { want: '大きなディレクトリを探したい',         cmd: 'du -sh *' },
    { want: '大きい順に並べたい',                   cmd: 'du -sh * | sort -h' },
    { want: 'メモリを確認したい',                   cmd: 'free -h' },
    { want: '負荷を確認したい',                     cmd: 'uptime' },
    { want: 'CPUを食っているプロセスを見たい',      cmd: 'top' },
    { want: 'listenしているポートを見たい',         cmd: 'ss -lntp' },
    { want: 'アプリが応答するか確かめたい',         cmd: 'curl -I http://localhost/projects' }
  ]},
  { group: '本番サーバーへ入る', items: [
    { want: '本番サーバーへ入りたい',               cmd: 'aws ssm start-session --target i-0a7f3c9e1b5d2048f' },
    { want: 'インスタンスIDを調べたい',             cmd: 'aws ec2 describe-instances' },
    { want: '自分がAWS上で誰か確認したい',          cmd: 'aws sts get-caller-identity' },
    { want: 'deployユーザーに切り替えたい',         cmd: 'sudo su - deploy' },
    { want: 'アラートのrequest_idでログを引きたい', cmd: 'grep "<request_id>" log/production.log' }
  ]},
  { group: '復旧する', items: [
    { want: 'サービスを再起動したい',               cmd: 'sudo systemctl restart puma' },
    { want: 'ログを消さずに容量を空けたい',         cmd: 'truncate -s 0 log/production.log' },
    { want: 'ログのローテートを今すぐ回したい',     cmd: 'sudo logrotate -f /etc/logrotate.d/rails' },
    { want: 'logrotateの対象を実行せず確認したい', cmd: 'sudo logrotate -d /etc/logrotate.d/rails' },
    { want: '無停止でメモリを戻したい',             cmd: 'pumactl phased-restart' },
    { want: 'メンテナンスページを出したい',         cmd: 'touch /var/www/myapp/shared/tmp/maintenance.html' },
    { want: '前のreleaseへ戻したい',                cmd: 'ln -sfn releases/20260914120000 /var/www/myapp/current' },
    { want: 'メンテナンス中に自分だけ確認したい',   cmd: 'curl -I -H "X-Maintenance-Bypass: 1" http://localhost/' }
  ]},
  { group: 'Railsを運用する', items: [
    { want: '本番のデータを安全に調べたい',         cmd: 'rails console --sandbox' },
    { want: 'migrationの適用状況を見たい',          cmd: 'rails db:migrate:status' },
    { want: 'migrationを1つ戻したい',               cmd: 'rails db:rollback' },
    { want: '遅いクエリを探したい',                 cmd: 'tail -n 20 /var/log/mysql/slow.log' },
    { want: '実行中のクエリを見たい',               cmd: 'mysql -e "SHOW PROCESSLIST"' },
    { want: 'クエリの実行計画を見たい',             cmd: 'mysql -e "EXPLAIN SELECT ..."' },
    { want: '定期実行の登録を見たい',               cmd: 'crontab -l' },
    { want: 'systemd timerの実行状況を見たい',      cmd: 'systemctl list-timers' }
  ]},
  { group: '権限と環境変数', items: [
    { want: '所有者とpermissionを見たい',           cmd: 'ls -l log/' },
    { want: '環境変数を一覧したい',                 cmd: 'env' },
    { want: '特定の環境変数だけ見たい',             cmd: 'printenv RAILS_ENV' },
    { want: '秘密情報を表示せず有無だけ確かめたい', cmd: 'env | grep -c SECRET_KEY_BASE' }
  ]}
];

function mount(overlayEl, onInsert) {
  var esc = window.LFR.esc;
  var html = '<div class="sheet-head"><h2 id="reference-title">コマンド早見表</h2>' +
             (onInsert ? '<p class="muted">コマンドを選ぶと練習用ターミナルに入力されます。</p>' : '') +
             '<input id="sheet-q" type="search" aria-label="コマンドを目的や名前で検索" placeholder="目的や名前で検索　例：ログ"></div>';
  html += '<div class="sheet-body">';
  SHEET.forEach(function (g) {
    html += '<section class="sheet-group"><h3>' + esc(g.group) + '</h3><ul>';
    g.items.forEach(function (it) {
      html += '<li data-k="' + esc(g.group + ' ' + it.want + ' ' + it.cmd) + '">' +
              '<span class="want">' + esc(it.want) + '</span>' +
              (onInsert ? '<button class="cmd" data-cmd="' + esc(it.cmd) + '">' + esc(it.cmd) + '</button>' : '<code class="example-cmd">' + esc(it.cmd) + '</code>') + '</li>';
    });
    html += '</ul></section>';
  });
  html += '<p id="sheet-empty" role="status" hidden>一致するコマンドがありません。</p></div>';
  overlayEl.innerHTML = html;

  overlayEl.querySelectorAll('.cmd').forEach(function (b) {
    b.addEventListener('click', function () { onInsert(b.dataset.cmd); });
  });

  var q = overlayEl.querySelector('#sheet-q');
  q.addEventListener('input', function () {
    var v = q.value.trim().toLowerCase();
    overlayEl.querySelectorAll('.sheet-group').forEach(function (sec) {
      var any = false;
      sec.querySelectorAll('li').forEach(function (li) {
        var show = !v || li.dataset.k.toLowerCase().indexOf(v) >= 0;
        li.style.display = show ? '' : 'none';
        if (show) any = true;
      });
      sec.style.display = any ? '' : 'none';
    });
    overlayEl.querySelector('#sheet-empty').hidden = Array.from(overlayEl.querySelectorAll('.sheet-group')).some(function (g) { return g.style.display !== 'none'; });
  });
}

window.LFR = window.LFR || {};
window.LFR.Cheatsheet = { mount: mount, data: SHEET };
})();
