/* CASE 16 — Permission deniedの原因を探す */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};
files[APP + '/shared/config/master.key'] = 'e9c1a3f7b5d2086e4c7a9b1d3f5e7c09\n';
files[APP + '/shared/config/credentials.yml.enc'] = 'YkxQa0Z2S2RtVnpjM2RvY21RNlpHVmxjRE5s\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T09:14:02.114+09:00 #1433]  INFO -- : [11223344-5566-4778-899a-bbccddeeff00] Started GET "/projects" for 10.0.2.31 at 2026-09-14 09:14:02 +0900\n' +
'I, [2026-09-14T09:14:02.221+09:00 #1433]  INFO -- : [11223344-5566-4778-899a-bbccddeeff00] Completed 200 OK in 107ms (Views: 70.1ms | ActiveRecord: 14.2ms)\n';

files['/var/log/nginx/error.log'] =
'2026/09/14 16:41:08 [error] 781#781: *1420 connect() to unix:/var/www/myapp/shared/tmp/sockets/puma.sock failed (111: Connection refused) while connecting to upstream, client: 10.0.2.31, server: myapp.example.jp, request: "GET /projects HTTP/1.1"\n';

files['/home/deploy/ops-notes.md'] =
'# 作業メモ\n' +
'\n' +
'2026-09-13 18:40\n' +
'  credentials を再生成したので master.key を差し替えた。\n' +
'  deployユーザーだと書けなかったので sudo でコピーした。\n' +
'    sudo cp /tmp/master.key /var/www/myapp/shared/config/master.key\n' +
'  動作確認はしていない（翌朝やる）。\n';

/* 所有者・permission・読めるかどうかはCASEが宣言する */
var fsMeta = {};
fsMeta[APP + '/shared/config/master.key'] =
  { mode: '-rw-------', owner: 'root', group: 'root', denyRead: true };
fsMeta[APP + '/shared/config/credentials.yml.enc'] =
  { mode: '-rw-r--r--', owner: 'deploy', group: 'deploy' };
fsMeta[APP + '/shared/config/database.yml'] =
  { mode: '-rw-r-----', owner: 'deploy', group: 'deploy' };

window.LFR.scenarios.add({
  id: 'case16',
  level: 5,
  title: 'Permission deniedの原因を探す',
  subtitle: '誰が・何に・どの権限で触ろうとしているか',

  description:
'朝、サイトが 502 Bad Gateway になっていました。\n\n' +
'前日の夕方に credentials を再生成し、master.key を差し替える作業がありました。\n' +
'そのときは動作確認をしていません。\n\n' +
'production.log は前日9:14で止まっています。\n' +
'Pumaが起動できていないようです。\n\n' +
'起動できない理由を突き止めてください。\n' +
'なお、このCASEでは chmod 777 で解決しようとしないでください。\n' +
'なぜそれが悪手なのかも含めて考えてください。',

  learn: [
    { name: 'ls -l', cmd: 'ls -l /var/www/myapp/shared/config',
      desc: '権限調査の出発点です。1行はこう読みます。\n\n' +
            '  -rw-r--r--  1  deploy  deploy  206  Sep 14 12:00  application.rb\n' +
            '  └────┬───┘     └──┬─┘  └──┬─┘\n' +
            '    permission     所有者   グループ\n\n' +
            'permissionの10文字は「種別 + 所有者rwx + グループrwx + その他rwx」です。\n' +
            '  -rw-r--r--  所有者は読み書き、他は読みだけ（644）\n' +
            '  -rw-------  所有者だけ読み書き、他は一切不可（600）\n' +
            '  drwxr-xr-x  ディレクトリ（755）' },
    { name: 'whoami / id', cmd: 'whoami',
      desc: '自分が誰として実行しているかを確認します。\n' +
            '権限エラーは「ファイルの権限」だけでは判断できません。\n' +
            '「誰が触ろうとしているか」と必ずセットで考えてください。\n' +
            'Pumaはsystemdのunitで User=deploy として起動されます。' },
    { name: 'chown', cmd: 'chown deploy:deploy <ファイル>',
      desc: '所有者とグループを変更します（実行にはsudoが必要です）。\n' +
            '「アプリのユーザーが自分のファイルを触れない」という状況では、\n' +
            '権限を緩めるのではなく所有者を正すのが本筋の対応です。' },
    { name: 'chmod', cmd: 'chmod 600 <ファイル>',
      desc: '権限を変更します。数字は 読4 + 書2 + 実行1 の合計を\n' +
            '所有者・グループ・その他の順に3桁で書きます。\n\n' +
            '  600 所有者だけ読み書き（鍵ファイルはこれ）\n' +
            '  644 所有者は読み書き、他は読みだけ（設定ファイル）\n' +
            '  755 ディレクトリや実行ファイル\n\n' +
            '777 は「誰でも読み書き実行できる」という意味です。\n' +
            '本番で鍵や設定に777を付けるのは、鍵を玄関前に置くのと同じです。' },
    { name: 'journalctl', cmd: 'journalctl -u puma -n 20',
      desc: '起動に失敗した理由はここに残ります。\n' +
            'Errno::EACCES (Permission denied) の場合、\n' +
            'メッセージの中に「どのファイルを開こうとしたか」が必ず書かれています。\n' +
            'そのパスを ls -l で確認するのが次の一手です。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  fsMeta: fsMeta,
  now: '09:02:41',

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'failed', result: 'exit-code',
      since: 'Mon 2026-09-14 08:58:12 JST', ago: '4min 29s ago',
      mainPid: 9120, lastPid: 9120, exitCode: 1,
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  journal: {
    puma: [
      'Sep 13 18:22:04 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 14 08:58:10 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 08:58:11 production puma[9120]: bundler: failed to load command: puma',
      'Sep 14 08:58:11 production puma[9120]: Errno::EACCES: Permission denied @ rb_sysopen - /var/www/myapp/shared/config/master.key',
      'Sep 14 08:58:11 production puma[9120]:   from config/environment.rb:5:in `<main>\'',
      'Sep 14 08:58:12 production systemd[1]: puma.service: Main process exited, code=exited, status=1/FAILURE',
      'Sep 14 08:58:12 production systemd[1]: puma.service: Failed with result \'exit-code\'.'
    ]
  },

  processes: base.processes.filter(function (p) { return !/puma/.test(p.command); }),

  http: {
    'http://localhost/': {
      status: 502, reason: 'Bad Gateway',
      headers: { 'content-type': 'text/html', server: 'nginx/1.24.0' },
      body: '<html><head><title>502 Bad Gateway</title></head><body><center><h1>502 Bad Gateway</h1></center></body></html>\n'
    }
  },

  hints: [
    'production.log が増えていないということは、Railsが起動していません。\n' +
    '起動前の失敗なので、読むべきログは journalctl の方です。',

    'journalctl -u puma を読むと Errno::EACCES (Permission denied) が出ています。\n' +
    'メッセージの中に、開こうとして失敗したファイルのパスが書かれています。\n' +
    'そのファイルを ls -l で確認してください。',

    'ls -l /var/www/myapp/shared/config を実行して、\n' +
    'master.key の permission・所有者・グループを見てください。\n' +
    'そして whoami で、Pumaを動かしているユーザーが誰かを確認してください。\n' +
    '~/ops-notes.md に、前日の作業内容が残っています。'
  ],

  probes: [
    { key: 'readJournal', label: 'journalctlで起動失敗の理由を読んだ',
      test: function (c) { return /journalctl/.test(c); } },
    { key: 'foundEacces', label: 'Errno::EACCES を見つけた',
      test: function (c, res) { return /EACCES|Permission denied/.test(res.stdout + res.stderr); } },
    { key: 'checkedLsL', label: 'ls -l で所有者とpermissionを確認した',
      test: function (c, res) { return /ls\s+-[a-z]*l/.test(c) && /rw-------|root\s+root/.test(res.stdout); } },
    { key: 'sawRootOwner', label: 'master.key の所有者がrootだと確認した',
      test: function (c, res) { return /root\s+root/.test(res.stdout) && /master\.key/.test(res.stdout); } },
    { key: 'checkedWhoami', label: '自分が誰として実行しているか確認した',
      test: function (c) { return /\bwhoami\b|\bid\b/.test(c); } },
    { key: 'triedToRead', label: '実際に読めないことを確かめた',
      test: function (c, res) { return /master\.key/.test(c) && /Permission denied/.test(res.stderr); } },
    { key: 'readOpsNotes', label: '前日の作業メモを確認した',
      test: function (c, res) { return /sudo cp/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'readJournal',   weight: 8,  label: 'journalctlを読んだ' },
    { key: 'foundEacces',   weight: 12, label: 'EACCESが出ているファイルを特定した' },
    { key: 'checkedLsL',    weight: 14, label: 'ls -l で権限を確認した' },
    { key: 'sawRootOwner',  weight: 16, label: '所有者がrootになっていると気づいた' },
    { key: 'checkedWhoami', weight: 8,  label: '実行ユーザーを確認した' },
    { key: 'readOpsNotes',  weight: 8,  label: '前日の作業内容を確認した' }
  ],

  question: {
    text: 'Pumaが起動できない原因は？',
    choices: [
      'master.key の所有者がrootになっており、deployユーザーが読めない',
      'master.key が存在しない',
      'SECRET_KEY_BASE 環境変数が設定されていない',
      'ディスクが満杯で、ファイルを読み込めない'
    ],
    answer: 0,
    explain:
'journalctl -u puma に、開こうとして失敗したファイルがそのまま書かれています。\n\n' +
'  Errno::EACCES: Permission denied @ rb_sysopen - /var/www/myapp/shared/config/master.key\n\n' +
'そのファイルを ls -l で見ると、こうなっています。\n\n' +
'  $ ls -l /var/www/myapp/shared/config\n' +
'  -rw-r--r--  1 deploy deploy   47  credentials.yml.enc\n' +
'  -rw-r-----  1 deploy deploy  206  database.yml\n' +
'  -rw-------  1 root   root     33  master.key      ← これ\n\n' +
'master.key は 600（所有者だけ読み書き）で、所有者は root です。\n' +
'一方 Pumaは deploy ユーザーとして起動されます（whoami で確認できます）。\n' +
'所有者でもグループでもない deploy には、読む権限が1つもありません。\n\n' +
'実際に試すと、その場で分かります。\n\n' +
'  $ cat /var/www/myapp/shared/config/master.key\n' +
'  cat: /var/www/myapp/shared/config/master.key: Permission denied\n\n' +
'原因は ~/ops-notes.md に書かれています。\n\n' +
'  deployユーザーだと書けなかったので sudo でコピーした。\n' +
'    sudo cp /tmp/master.key /var/www/myapp/shared/config/master.key\n\n' +
'sudo でコピーしたため、新しいファイルの所有者が root になりました。\n\n' +
'--- ここからが大事です ---\n\n' +
'このとき chmod 777 master.key とすれば、たしかに動きます。\n' +
'しかしそれは「読めないなら全員に読ませればいい」という対応です。\n' +
'master.key は credentials を復号する鍵そのもので、\n' +
'漏れればDBのパスワードも外部APIのキーもすべて復号されます。\n' +
'サーバーに入った他のユーザーやプロセスからも読める状態にしてはいけません。\n\n' +
'正しい対応は、権限を緩めるのではなく所有者を正すことです。\n\n' +
'  sudo chown deploy:deploy /var/www/myapp/shared/config/master.key\n' +
'  sudo chmod 600 /var/www/myapp/shared/config/master.key\n\n' +
'600 のままで構いません。deploy が所有者になれば、deploy は読めます。\n\n' +
'権限エラーを見たら、反射的に chmod を打つ前に\n' +
'「誰が」「何を」「どうしたいのか」を ls -l と whoami で確認してください。',
    wrong: [
null,
'ファイルは存在します。\n' +
'ls -l /var/www/myapp/shared/config の一覧に master.key の行があります。\n\n' +
'存在しない場合のエラーは Errno::ENOENT (No such file or directory) です。\n' +
'今回は Errno::EACCES (Permission denied)、つまり\n' +
'「在るけれど触らせてもらえない」という別のエラーです。\n' +
'この2つは必ず区別してください。',
'SECRET_KEY_BASE は env で確認でき、設定されています。\n' +
'また、環境変数が未設定の場合のエラーは\n' +
'ArgumentError や KeyError であって、Errno::EACCES にはなりません。\n\n' +
'Errno::EACCES はOSがファイルアクセスを拒否したときのエラーです。\n' +
'エラークラスの種類から、問題のレイヤーを判断してください。',
'ディスクは満杯ではありません。df -h で / の使用率は46%です。\n\n' +
'容量不足のエラーは Errno::ENOSPC (No space left on device) です。\n' +
'今回は Errno::EACCES なので、容量ではなく権限の問題です。\n' +
'Errnoの種類は、そのまま原因の分類になります。'
    ]
  },

  route: {
    steps: [
      'production.log が止まっている＝起動前の失敗と判断する',
      'systemctl status / journalctl でPumaの終了理由を読む',
      'Errno::EACCES と、失敗したファイルのパスを読み取る',
      'そのファイルを ls -l で確認する（permission・所有者・グループ）',
      'whoami で実行ユーザーを確認し、読めない理由を確定する',
      '作業メモやデプロイ履歴で、いつそうなったかを確認する'
    ],
    commands: [
      'systemctl status puma',
      'journalctl -u puma -n 20',
      'ls -l /var/www/myapp/shared/config',
      'whoami',
      'cat /var/www/myapp/shared/config/master.key',
      'cat ~/ops-notes.md',
      'ls -l /var/www/myapp/shared',
      'df -h'
    ],
    note:
'ls -l から入って「1行だけ所有者が違う」と気づくルートでも構いません。\n' +
'権限まわりの調査は、ls -l と whoami の2つでほぼ完結します。\n' +
'そして対応は chmod で緩めるのではなく、chown で正すのが基本です。'
  }
});
})();
