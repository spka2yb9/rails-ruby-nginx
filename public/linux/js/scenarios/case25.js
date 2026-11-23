/* CASE 25 — 定期バッチが動いていない（cron / systemd timer） */
(function () {
'use strict';
var APP = '/var/www/myapp';

var files = {};

files[APP + '/shared/log/cron.log'] =
'/bin/sh: line 1: bundle: command not found\n' +
'/bin/sh: line 1: bundle: command not found\n' +
'/bin/sh: line 1: bundle: command not found\n' +
'/bin/sh: line 1: bundle: command not found\n';

files['/var/log/syslog'] =
'Sep 07 04:30:01 production CRON[41022]: (deploy) CMD (/usr/bin/bundle exec rails runner -e production "Report.weekly!" >> /var/www/myapp/shared/log/cron.log 2>&1)\n' +
'Sep 13 04:00:01 production CRON[48113]: (deploy) CMD (/usr/bin/find /var/www/myapp/shared/tmp/cache -type f -mtime +7 -delete)\n' +
'Sep 13 04:30:01 production CRON[48120]: (deploy) CMD (/usr/bin/bundle exec rails runner -e production "Report.weekly!" >> /var/www/myapp/shared/log/cron.log 2>&1)\n' +
'Sep 14 04:00:01 production CRON[52004]: (deploy) CMD (/usr/bin/find /var/www/myapp/shared/tmp/cache -type f -mtime +7 -delete)\n' +
'Sep 14 04:30:01 production CRON[52011]: (deploy) CMD (/usr/bin/bundle exec rails runner -e production "Report.weekly!" >> /var/www/myapp/shared/log/cron.log 2>&1)\n';

files['/home/deploy/.bashrc'] =
'# ~/.bashrc for deploy\n' +
'alias ll="ls -la"\n' +
'\n' +
'# rbenv（対話シェルでのみ読み込まれる）\n' +
'export PATH="$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"\n' +
'eval "$(rbenv init -)"\n' +
'\n' +
'cd /var/www/myapp/current\n';

files[APP + '/releases/20260914120000/app/models/report.rb'] =
'class Report < ApplicationRecord\n' +
'  def self.weekly!\n' +
'    # 週次レポートを集計して運営へメール送信する\n' +
'    ReportMailer.weekly(aggregate_last_week).deliver_now\n' +
'  end\n' +
'end\n';

files['/etc/systemd/system/sitemap.service'] =
'[Unit]\n' +
'Description=Generate sitemap.xml\n' +
'\n' +
'[Service]\n' +
'Type=oneshot\n' +
'User=deploy\n' +
'WorkingDirectory=/var/www/myapp/current\n' +
'# systemd timer では環境を明示的に与えている\n' +
'EnvironmentFile=/var/www/myapp/shared/config/app.env\n' +
'ExecStart=/home/deploy/.rbenv/shims/bundle exec rails runner -e production "Sitemap.generate!"\n';

files['/etc/systemd/system/sitemap.timer'] =
'[Unit]\n' +
'Description=Run sitemap generation daily\n' +
'\n' +
'[Timer]\n' +
'OnCalendar=*-*-* 03:00:00\n' +
'Persistent=true\n' +
'\n' +
'[Install]\n' +
'WantedBy=timers.target\n';

window.LFR.scenarios.add({
  id: 'case25',
  level: 9,
  title: '定期バッチが動いていない原因を探す',
  subtitle: 'cronの環境は、あなたのシェルとは別物',

  description:
'運営チームから連絡がありました。\n\n' +
'「毎週日曜の朝に届く週次レポートのメールが、3週間ほど届いていません」\n\n' +
'レポートは cron で `Report.weekly!` を実行して送っています。\n' +
'サーバーは正常に動いていて、他の機能に問題はありません。\n\n' +
'cron自体が動いていないのか、動いているけれど失敗しているのか。\n' +
'まずそこから切り分けてください。\n\n' +
'同じサーバーには systemd timer で動いているバッチもあります。\n' +
'そちらは正常です。何が違うのかも見てみてください。',

  learn: [
    { name: 'crontab -l', cmd: 'crontab -l',
      desc: 'そのユーザーに登録されているcronの一覧です。\n' +
            '書式は「分 時 日 月 曜日 コマンド」。曜日は0が日曜です。\n\n' +
            '  30 4 * * 0 …  → 毎週日曜 04:30\n\n' +
            '`crontab -l -u <user>` で他のユーザーのものも見られます（要権限）。\n' +
            'rootのcronとdeployのcronは別物なので、両方を確認してください。' },
    { name: 'cronが実行された記録', cmd: 'grep CRON /var/log/syslog',
      desc: 'cronデーモンは、実行のたびにsyslogへ記録を残します。\n\n' +
            '  CRON[52011]: (deploy) CMD (...)\n\n' +
            'この行があれば「cronは起動を試みた」ことが確定します。\n' +
            'つまり、そこから先（コマンドの実行）で失敗していると分かります。\n' +
            '行が無ければ、登録・曜日指定・cronデーモン自体を疑います。' },
    { name: 'cronの出力を残す', cmd: 'cat log/cron.log',
      desc: 'cronは実行結果を標準出力・標準エラーに出しますが、放っておくと\n' +
            'メールで送られるか（MAILTOが空なら）捨てられます。\n\n' +
            '  >> /path/to/cron.log 2>&1\n\n' +
            'この指定があれば、失敗の理由がファイルに残ります。\n' +
            '2>&1 は「標準エラーも標準出力と同じ場所へ」という意味で、\n' +
            'これが無いとエラーだけが消えます。定期実行には必ず付けてください。' },
    { name: 'cronの環境変数', cmd: 'cat ~/.bashrc',
      desc: 'ここが本題です。\n\n' +
            'cronはログインシェルを経由せずにコマンドを実行します。\n' +
            'つまり ~/.bashrc も ~/.bash_profile も読み込まれません。\n' +
            'PATHは最小限（だいたい /usr/bin:/bin）だけです。\n\n' +
            '手で打つと動くのにcronだと動かない、の原因はほぼこれです。' },
    { name: 'systemd timer と比べる', cmd: 'systemctl list-timers',
      desc: 'cronの代わりにsystemd timerを使う構成も一般的です。\n\n' +
            '  ・実行の成否が journalctl に残る（cronより追いやすい）\n' +
            '  ・EnvironmentFile で環境を明示できる\n' +
            '  ・Persistent=true でサーバー停止中の実行を取り戻せる\n\n' +
            'このサーバーでも sitemap.timer は正常に動いています。\n' +
            'unitファイルを読んで、cronとの違いを確認してください。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '10:12:40',

  crontab: {
    deploy: [
      '# m h  dom mon dow   command',
      'MAILTO=""',
      '0 4 * * * /usr/bin/find /var/www/myapp/shared/tmp/cache -type f -mtime +7 -delete',
      '30 4 * * 0 /usr/bin/bundle exec rails runner -e production "Report.weekly!" >> /var/www/myapp/shared/log/cron.log 2>&1'
    ]
  },

  timers: [
    { unit: 'sitemap.timer',                next: 'Tue 2026-09-15 03:00:00 JST', left: '16h 47min', last: 'Mon 2026-09-14 03:00:02 JST', passed: '7h 12min ago' },
    { unit: 'logrotate.timer',              next: 'Tue 2026-09-15 00:00:00 JST', left: '13h 47min', last: 'Mon 2026-09-14 00:00:02 JST', passed: '10h ago' },
    { unit: 'systemd-tmpfiles-clean.timer', next: 'Tue 2026-09-15 01:12:44 JST', left: '15h',       last: 'Mon 2026-09-14 01:12:44 JST', passed: '9h ago' }
  ],

  journal: {
    sitemap: [
      'Sep 14 03:00:02 production systemd[1]: Starting Generate sitemap.xml...',
      'Sep 14 03:00:41 production rails[51880]: Sitemap generated: 482913 urls',
      'Sep 14 03:00:41 production systemd[1]: sitemap.service: Deactivated successfully.',
      'Sep 14 03:00:41 production systemd[1]: Finished Generate sitemap.xml.'
    ]
  },

  services: {
    sitemap: {
      description: 'Generate sitemap.xml',
      status: 'inactive', sub: 'dead',
      since: 'Mon 2026-09-14 03:00:41 JST', ago: '7h 12min ago',
      mainPid: null,
      exec: '/home/deploy/.rbenv/shims/bundle exec rails runner -e production "Sitemap.generate!"'
    }
  },

  hints: [
    'まず「cronが実行を試みたのか」を確定させてください。\n' +
    'cronデーモンは実行のたびにsyslogへ記録を残します。\n' +
    '記録があるなら、cronは動いていてコマンド側が失敗しています。',

    'crontab -l を見ると、出力の保存先が指定されています。\n' +
    '  >> /var/www/myapp/shared/log/cron.log 2>&1\n' +
    'そのファイルを読んでください。失敗の理由がそのまま残っています。',

    'cron.log には bundle: command not found と出ています。\n' +
    '手で打てば bundle は動くのに、なぜ cron からだと見つからないのか。\n' +
    '~/.bashrc を読んでください。PATHがどこで設定されているかが分かります。\n' +
    'そして /etc/systemd/system/sitemap.service と比べてみてください。'
  ],

  probes: [
    { key: 'readCrontab', label: 'crontabの登録内容を確認した',
      test: function (c, res) { return /Report\.weekly/.test(res.stdout) && /crontab/.test(c); } },
    { key: 'sawCronRan', label: 'cronが実行を試みた記録を見つけた',
      test: function (c, res) { return /CRON\[\d+\]/.test(res.stdout); } },
    { key: 'readCronLog', label: 'cronの出力ログを読んだ',
      test: function (c, res) { return /command not found/.test(res.stdout); } },
    { key: 'foundPathIssue', label: 'PATHが原因だと突き止めた',
      test: function (c, res) { return /rbenv/.test(res.stdout) && /PATH/.test(res.stdout); } },
    { key: 'comparedTimer', label: 'systemd timer側の設定と比較した',
      test: function (c, res) { return /EnvironmentFile|\.rbenv\/shims/.test(res.stdout); } },
    { key: 'checkedTimers', label: 'timerの実行状況を確認した',
      test: function (c, res) { return /list-timers|sitemap/.test(c) && res.stdout.length > 0; } }
  ],

  evidence: [
    { key: 'readCrontab',     weight: 10, label: 'cronの登録内容を確認した' },
    { key: 'sawCronRan',      weight: 16, label: 'cronは動いていると確定させた' },
    { key: 'readCronLog',     weight: 18, label: '失敗の理由をログで確認した' },
    { key: 'foundPathIssue',  weight: 18, label: 'PATHの違いに辿り着いた' },
    { key: 'comparedTimer',   weight: 12, label: '正常に動いている側と比較した' },
    { key: 'checkedTimers',   weight: 8,  label: 'systemd timerも確認した' }
  ],

  question: {
    text: '週次レポートが届かない原因は？',
    choices: [
      'cronデーモンが停止していて、そもそも実行されていない',
      'cronから実行される環境にはPATHが引き継がれず、bundleコマンドが見つからずに失敗している',
      'crontabの曜日指定が間違っていて、日曜に実行されていない',
      'Sidekiqが停止していて、メール送信ジョブが処理されていない'
    ],
    answer: 1,
    explain:
'切り分けを2段階で行います。\n\n' +
'【1. cronは動いているのか】\n' +
'  $ grep CRON /var/log/syslog\n' +
'  Sep 14 04:30:01 production CRON[52011]: (deploy) CMD (/usr/bin/bundle exec rails runner ...)\n\n' +
'  記録があります。cronデーモンは動いていて、毎週ちゃんと実行を試みています。\n' +
'  つまり問題はcronではなく、その先のコマンドです。\n\n' +
'【2. コマンドはなぜ失敗したのか】\n' +
'  $ crontab -l\n' +
'  30 4 * * 0 /usr/bin/bundle exec rails runner -e production "Report.weekly!" >> .../cron.log 2>&1\n\n' +
'  出力の保存先が指定されているので、そこを読みます。\n\n' +
'  $ cat log/cron.log\n' +
'  /bin/sh: line 1: bundle: command not found\n\n' +
'  答えが書いてあります。bundle が見つかっていません。\n\n' +
'【なぜ手で打つと動くのか】\n' +
'  $ cat ~/.bashrc\n' +
'  export PATH="$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"\n' +
'  eval "$(rbenv init -)"\n\n' +
'  rbenvのPATHは ~/.bashrc で設定されています。\n' +
'  SSHしてシェルを開けば読み込まれるので、手で打つ bundle は動きます。\n\n' +
'  しかしcronは **ログインシェルを経由しません**。\n' +
'  ~/.bashrc も ~/.bash_profile も読まれず、PATHは最小限（だいたい /usr/bin:/bin）です。\n' +
'  そこに rbenv の shims は入っていないので、bundle が見つかりません。\n\n' +
'  なお crontab には /usr/bin/bundle と絶対パスで書かれていますが、\n' +
'  実体は ~/.rbenv/shims/bundle なので、このパスにファイルがありません。\n' +
'  「絶対パスで書いたから大丈夫」ではなく、正しい絶対パスである必要があります。\n\n' +
'【正常に動いている側と比べる】\n' +
'  $ cat /etc/systemd/system/sitemap.service\n' +
'  EnvironmentFile=/var/www/myapp/shared/config/app.env\n' +
'  ExecStart=/home/deploy/.rbenv/shims/bundle exec rails runner ...\n\n' +
'  こちらは shims の絶対パスを直接指定し、環境も EnvironmentFile で明示しています。\n' +
'  だから毎日きちんと動いています（systemctl list-timers と journalctl -u sitemap で確認できます）。\n\n' +
'【直し方】\n' +
'  cronのまま直すなら、どれかを選びます。\n\n' +
'  1) 正しい絶対パスにする\n' +
'     30 4 * * 0 /home/deploy/.rbenv/shims/bundle exec rails runner ...\n' +
'  2) ログインシェルを経由させる\n' +
'     30 4 * * 0 /bin/bash -lc "cd /var/www/myapp/current && bundle exec rails runner ..."\n' +
'  3) crontabの先頭でPATHを定義する\n' +
'     PATH=/home/deploy/.rbenv/shims:/usr/bin:/bin\n\n' +
'  いずれにせよ、>> log 2>&1 は必ず付けてください。\n' +
'  今回これが付いていたおかげで、3週間分の失敗理由が残っていました。\n' +
'  MAILTO="" で通知も切られていたので、これが無ければ何も手がかりがありませんでした。\n\n' +
'定期実行を作ったら、必ず一度は「cronから実行された結果」を確認してください。\n' +
'手で叩いて動いたことは、cronで動く保証になりません。',
    wrong: [
'cronデーモンは動いています。\n' +
'/var/log/syslog に、毎週きちんと実行された記録が残っています。\n\n' +
'  Sep 14 04:30:01 production CRON[52011]: (deploy) CMD (...)\n\n' +
'この行があるかどうかが、最初の切り分けポイントです。\n' +
'行があれば「cronは動いた、コマンドが失敗した」\n' +
'行が無ければ「登録されていない、曜日が違う、cronが止まっている」\n' +
'と、次に調べる場所がはっきり分かれます。',
null,
'曜日指定は正しいです。\n\n' +
'  30 4 * * 0   → 分30 時4 日* 月* 曜日0（日曜）\n\n' +
'cronの曜日は0が日曜、6が土曜です（7も日曜として扱われます）。\n' +
'そして実際に syslog には日曜04:30の実行記録が残っています。\n' +
'書式を疑う前に、まず実行記録の有無を確認してください。',
'Sidekiqは関係ありません。\n' +
'systemctl status sidekiq は active で、他のジョブは処理されています。\n\n' +
'そもそも今回は Report.weekly! の実行自体が始まっていません。\n' +
'cron.log に出ているのは bundle: command not found で、\n' +
'Railsが起動する前の段階で失敗しています。\n' +
'ジョブがキューに積まれてすらいないので、Sidekiqの出番はありません。'
    ]
  },

  route: {
    steps: [
      'cronの登録内容を確認する',
      'cronが実行を試みた記録があるかを確認する（syslog）',
      '記録がある＝コマンド側の失敗、と切り分ける',
      'cronの出力ログを読んで失敗理由を特定する',
      'なぜ手動では動くのかを ~/.bashrc で確認する',
      '正常に動いている systemd timer 側の設定と比較する'
    ],
    commands: [
      'crontab -l',
      'grep CRON /var/log/syslog',
      'cat log/cron.log',
      'cat ~/.bashrc',
      'ls -la /usr/bin/bundle',
      'systemctl list-timers',
      'cat /etc/systemd/system/sitemap.service',
      'journalctl -u sitemap -n 6',
      'cat app/models/report.rb'
    ],
    note:
'cron.log を先に読んで「command not found」に気づくルートでも構いません。\n' +
'覚えてほしい切り分けはこれです。\n' +
'「cronは動いたのか」→ syslog を見る。\n' +
'「コマンドは何を言ったのか」→ リダイレクト先のログを見る。\n' +
'この2つを確認せずに定期実行の不具合を追うと、必ず迷います。'
  }
});
})();
