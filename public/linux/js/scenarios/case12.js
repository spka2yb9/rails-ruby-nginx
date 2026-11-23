/* CASE 12 — デプロイしたコードが本当に反映されているか確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var OLD = APP + '/releases/20260914120000';
var NEW = APP + '/releases/20260914153000';

var files = {};

/* 現行release（古い）— 給与レンジの表示が無い */
files[OLD + '/app/views/projects/_card.html.erb'] =
'<article class="project-card">\n' +
'  <h3><%= link_to project.title, project_path(project) %></h3>\n' +
'  <p class="company"><%= project.company.name %></p>\n' +
'  <p class="area"><%= project.area_name %></p>\n' +
'</article>\n';
files[OLD + '/REVISION'] = 'e3f1c2a9b7d4e5f60718293a4b5c6d7e8f901234\n';

/* 新しいrelease — 今朝マージした「給与レンジ表示」が入っている */
files[NEW + '/app/views/projects/_card.html.erb'] =
'<article class="project-card">\n' +
'  <h3><%= link_to project.title, project_path(project) %></h3>\n' +
'  <p class="company"><%= project.company.name %></p>\n' +
'  <p class="area"><%= project.area_name %></p>\n' +
'  <p class="salary"><%= project.salary_range %></p>\n' +
'</article>\n';
files[NEW + '/REVISION'] = '7d4b9e1fa2c83506e9d1b4f7a0c25839e6b1d0c4\n';
files[NEW + '/Gemfile'] = window.LFR.base.files[OLD + '/Gemfile'];
files[NEW + '/config/routes.rb'] = window.LFR.base.files[OLD + '/config/routes.rb'];

files['/home/deploy/deploy.log'] =
'00:00 deploy:updating\n' +
'      01 mkdir -p /var/www/myapp/releases/20260914153000\n' +
'      ✔ 01 deploy@production 0.412s\n' +
'00:12 bundler:install\n' +
'      ✔ 01 deploy@production 11.902s\n' +
'00:31 deploy:assets:precompile\n' +
'      ✔ 01 deploy@production 42.118s\n' +
'00:74 deploy:symlink:release\n' +
'      01 ln -s /var/www/myapp/releases/20260914153000 /var/www/myapp/releases/current\n' +
'      01 mv /var/www/myapp/releases/current /var/www/myapp\n' +
'      01 mv: cannot move ... : Interrupted system call\n' +
'cap aborted!\n' +
'SSHKit::Runner::ExecuteError: Exception while executing as deploy@production: mv exit status: 1\n' +
'\n' +
'Tasks: TOP => deploy:symlink:release\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T15:36:02.114+09:00 #1433]  INFO -- : [f0e1d2c3-b4a5-4968-8779-0a1b2c3d4e5f] Started GET "/projects" for 10.0.2.31 at 2026-09-14 15:36:02 +0900\n' +
'I, [2026-09-14T15:36:02.116+09:00 #1433]  INFO -- : [f0e1d2c3-b4a5-4968-8779-0a1b2c3d4e5f] Processing by ProjectsController#index as HTML\n' +
'I, [2026-09-14T15:36:02.214+09:00 #1433]  INFO -- : [f0e1d2c3-b4a5-4968-8779-0a1b2c3d4e5f] Rendered projects/_card.html.erb (Duration: 12.1ms)\n' +
'I, [2026-09-14T15:36:02.220+09:00 #1433]  INFO -- : [f0e1d2c3-b4a5-4968-8779-0a1b2c3d4e5f] Completed 200 OK in 106ms (Views: 68.2ms | ActiveRecord: 14.1ms)\n';

window.LFR.scenarios.add({
  id: 'case12',
  level: 4,
  title: 'デプロイしたコードが本当に反映されているか確認する',
  subtitle: 'エラーが出ない不具合を、サーバー上の事実で確かめる',

  description:
'今朝、求人カードに「給与レンジ」を表示する修正をデプロイしました。\n' +
'デプロイのログは途中でエラーらしき行が出ていましたが、\n' +
'サイトは普通に動いているので、そのままにしていました。\n\n' +
'ところがブラウザで確認しても、給与レンジが表示されません。\n' +
'スーパーリロードしても、別のブラウザで見ても同じです。\n\n' +
'500エラーも502も出ていません。ログにもエラーは1行もありません。\n' +
'「本当にそのコードが本番に載っているのか」を、サーバー上で確認してください。',

  learn: [
    { name: 'readlink', cmd: 'readlink current',
      desc: 'symbolic linkが指している先を表示します。\n' +
            'Capistrano構成では、current がどのreleaseを指しているかが\n' +
            '「今どのコードが動いているか」そのものです。\n' +
            '-f を付けると、リンクを最後まで辿った絶対パスになります。' },
    { name: 'ls -la releases', cmd: 'ls -la releases',
      desc: 'サーバーに存在するreleaseの一覧です。\n' +
            'ディレクトリ名はデプロイ時刻（YYYYMMDDHHMMSS）なので、\n' +
            '最新のデプロイがどれかは名前を見れば分かります。' },
    { name: 'cat REVISION', cmd: 'cat current/REVISION',
      desc: 'CapistranoはデプロイしたGitのコミットSHAを REVISION に書き出します。\n' +
            '「今動いているコードのコミットは何か」を1行で確認できる、\n' +
            '本番調査でいちばん手軽な照合方法です。' },
    { name: 'ファイルの中身を直接見る', cmd: 'grep -n "salary" current/app/views/projects/_card.html.erb',
      desc: '最終手段にして最強の確認方法です。\n' +
            '「修正した行が、今動いているファイルに存在するか」を直接見ます。\n' +
            '推測の余地がありません。' },
    { name: 'diff', cmd: 'diff releases/20260914120000/app/views/projects/_card.html.erb releases/20260914153000/app/views/projects/_card.html.erb',
      desc: '2つのファイルの差分を出します。\n' +
            'releaseどうしを比べれば、「何が入って何が入っていないか」が分かります。' }
  ],

  startDirectory: APP,
  files: files,
  now: '15:38:44',

  journal: {
    puma: [
      'Sep 14 15:34:52 production systemd[1]: Stopping Puma HTTP Server for myapp (production)...',
      'Sep 14 15:34:53 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 15:34:55 production puma[1421]: * Listening on unix:///var/www/myapp/shared/tmp/sockets/puma.sock',
      'Sep 14 15:34:55 production systemd[1]: Started Puma HTTP Server for myapp (production).'
    ]
  },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 15:34:55 JST', ago: '3min 49s ago',
      mainPid: 1421, tasks: 12, memory: '336.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  hints: [
    'ブラウザ側を疑う前に、サーバー側の事実を確認しましょう。\n' +
    '「今動いているコードがどれか」を特定できれば、話が早くなります。',

    'まず ls -la releases でサーバーにあるreleaseを一覧してください。\n' +
    '次に readlink current で、currentがどれを指しているかを確認してください。\n' +
    'この2つが一致しているでしょうか。',

    '最後は中身を直接見て確定させます。\n\n' +
    '  grep -n "salary" current/app/views/projects/_card.html.erb\n' +
    '  grep -n "salary" releases/20260914153000/app/views/projects/_card.html.erb\n\n' +
    '~/deploy.log にデプロイがどこで止まったかも残っています。'
  ],

  probes: [
    { key: 'listedReleases', label: 'releaseの一覧を確認した',
      test: function (c, res) { return /20260914153000/.test(res.stdout); } },
    { key: 'readCurrentLink', label: 'currentの指す先を確認した',
      test: function (c, res) { return /readlink/.test(c) || /current ->/.test(res.stdout); } },
    { key: 'sawMismatch', label: 'currentが最新releaseを指していないと気づいた',
      test: function (c, res, rt) {
        var all = rt.investigation.commands.join(' ');
        return /readlink|ls\s+-la/.test(all) && /20260914120000/.test(res.stdout);
      } },
    { key: 'checkedFileContent', label: '実ファイルの中身で確認した',
      test: function (c, res) { return /salary/.test(c) || /salary_range/.test(res.stdout); } },
    { key: 'sawRevision', label: 'REVISIONのコミットSHAを比較した',
      test: function (c, res) { return /REVISION/.test(c) && res.stdout.length > 8; } },
    { key: 'sawDeployLog', label: 'デプロイが途中で失敗していたことを確認した',
      test: function (c, res) { return /cap aborted|symlink:release/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'listedReleases',     weight: 10, label: 'releaseの一覧を確認した' },
    { key: 'readCurrentLink',    weight: 12, label: 'currentの指す先を確認した' },
    { key: 'sawMismatch',        weight: 16, label: 'currentと最新releaseのズレに気づいた' },
    { key: 'checkedFileContent', weight: 14, label: '実ファイルの中身まで確認した' },
    { key: 'sawRevision',        weight: 8,  label: 'REVISIONで照合した' },
    { key: 'sawDeployLog',       weight: 8,  label: 'デプロイログで失敗箇所を確認した' }
  ],

  question: {
    text: '修正が反映されていない原因として最も可能性が高いものは？',
    choices: [
      'ブラウザやCDNのキャッシュが古いHTMLを返している',
      'currentが古いreleaseを指したままで、新しいreleaseに切り替わっていない',
      'デプロイ後にPumaを再起動していないため、古いコードがメモリに残っている',
      'assets:precompile が実行されておらず、CSSとJSが古い'
    ],
    answer: 1,
    explain:
'サーバー上の事実を3つ並べると、答えは1つに決まります。\n\n' +
'  $ ls -la releases\n' +
'  drwxr-xr-x  20260913150000\n' +
'  drwxr-xr-x  20260914120000\n' +
'  drwxr-xr-x  20260914153000   ← 今朝のデプロイで作られた新しいrelease\n\n' +
'  $ readlink current\n' +
'  releases/20260914120000      ← currentは古い方を指したまま\n\n' +
'  $ grep -n "salary" current/app/views/projects/_card.html.erb\n' +
'  （何も出ない）\n' +
'  $ grep -n "salary" releases/20260914153000/app/views/projects/_card.html.erb\n' +
'  5:  <p class="salary"><%= project.salary_range %></p>\n\n' +
'修正したコードはサーバーに届いています。ただし current から見えていません。\n' +
'REVISIONを比べても別のコミットです。\n\n' +
'  current/REVISION                        e3f1c2a9...\n' +
'  releases/20260914153000/REVISION        7d4b9e1f...\n\n' +
'理由は ~/deploy.log に残っています。\n\n' +
'  00:74 deploy:symlink:release\n' +
'  mv: cannot move ... : Interrupted system call\n' +
'  cap aborted!\n\n' +
'Capistranoは「releaseを展開 → bundle install → assets:precompile → currentを張り替え」\n' +
'の順に進みます。今回は最後のsymlink張り替えの手前で失敗しました。\n' +
'その結果、新しいreleaseは存在するのに、稼働しているのは古いrelease、\n' +
'という中途半端な状態になっています。\n\n' +
'デプロイが途中で失敗したとき「サイトは動いているから大丈夫」と判断するのは危険です。\n' +
'動いているのは前のバージョンだから、というだけかもしれません。\n' +
'デプロイ後は readlink current と cat current/REVISION を確認する習慣をつけてください。',
    wrong: [
'キャッシュではありません。\n' +
'production.log を見ると、リクエストのたびに\n' +
'Rendered projects/_card.html.erb が記録されています。\n' +
'つまりHTMLは毎回サーバーで生成されており、キャッシュから返されていません。\n\n' +
'そして決定的なのは、current が指しているファイルの中身に\n' +
'salary_range という文字列が存在しないことです。\n' +
'キャッシュを消しても、無いものは表示されません。',
null,
'Pumaは再起動されています。\n' +
'journalctl -u puma に 15:34:53 の Starting / Started が記録されていて、\n' +
'systemctl status puma の since も 15:34:55 です。\n\n' +
'ただし、再起動しても current が古いreleaseを指していれば、\n' +
'読み込まれるのは古いコードです。\n' +
'「再起動したのに変わらない」ときは、次に current を疑ってください。',
'assets（CSSやJS）の問題ではありません。\n' +
'今回の修正はERBテンプレートで、サーバー側でHTMLを生成する部分です。\n' +
'precompileの有無に関係なく、テンプレートが新しければ出力は変わります。\n\n' +
'そもそも deploy.log を見ると assets:precompile は ✔ で成功しており、\n' +
'失敗したのはその後の deploy:symlink:release です。'
    ]
  },

  route: {
    steps: [
      'サーバーに存在するreleaseを一覧する（ls -la releases）',
      'currentがどれを指しているか確認する（readlink current）',
      '最新releaseとcurrentがズレていることに気づく',
      '修正内容が入っているファイルを直接見て確定させる（grep）',
      'REVISIONのコミットSHAで照合する',
      'デプロイログで、どの工程で止まったかを確認する'
    ],
    commands: [
      'cd /var/www/myapp',
      'ls -la releases',
      'readlink current',
      'cat current/REVISION',
      'cat releases/20260914153000/REVISION',
      'grep -n "salary" current/app/views/projects/_card.html.erb',
      'grep -n "salary" releases/20260914153000/app/views/projects/_card.html.erb',
      'tail -n 12 ~/deploy.log',
      'systemctl status puma'
    ],
    note:
'grepでファイルの中身を直接見るルートから入っても構いません。\n' +
'「本当に反映されているか」は、最終的にファイルの中身で確定させるのが最も確実です。\n' +
'ブラウザ側を疑うのは、サーバー側の事実を確認したあとで十分です。'
  }
});
})();
