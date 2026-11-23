/* CASE 13 — Capistranoのcurrentがどのreleaseを向いているか確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';
var RELS = ['20260910110000', '20260912094500', '20260913150000', '20260914120000', '20260914153000'];
var SHAS = {
  '20260910110000': '4b1c7e9a0d2f35681a4c7e90b3d6f829c1a4e7b0',
  '20260912094500': '9a0d2f3568e14b7c1a4e7b03d6f829c1a4e7b0d2',
  '20260913150000': 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
  '20260914120000': 'e3f1c2a9b7d4e5f60718293a4b5c6d7e8f901234',
  '20260914153000': '7d4b9e1fa2c83506e9d1b4f7a0c25839e6b1d0c4'
};

var files = {};
RELS.forEach(function (r) {
  files[APP + '/releases/' + r + '/REVISION'] = SHAS[r] + '\n';
  files[APP + '/releases/' + r + '/config/routes.rb'] =
    'Rails.application.routes.draw do\n  root "top#index"\n  resources :projects\nend\n';
});
files[APP + '/releases/20260913150000/log/.keep'] = '';

files['/home/deploy/deploy.log'] =
'15:31:02 deploy:symlink:release\n' +
'      ✔ 01 deploy@production 0.184s\n' +
'15:31:40 deploy:published\n' +
'15:33:10 [!] 障害発生の報告あり\n' +
'15:35:22 cap production deploy:rollback\n' +
'      ✔ deploy:rollback:cleanup\n' +
'      ✔ deploy:rollback:log_revision\n' +
'15:35:51 rollback完了\n';

files['/home/deploy/handover.md'] =
'# 当番への引き継ぎ\n' +
'\n' +
'15:31 に 20260914153000 をデプロイしたが、直後に応募フォームでエラーが多発。\n' +
'15:35 に rollback を実行した。\n' +
'どのreleaseへ戻ったかは各自で確認すること（自分は帰ります）。\n';

window.LFR.scenarios.add({
  id: 'case13',
  level: 4,
  title: 'currentがどのreleaseを向いているか確認する',
  subtitle: 'current / releases / shared と symbolic link',

  description:
'夕方、前の当番からこう引き継がれました。\n\n' +
'「15:31にデプロイしたけど、応募フォームでエラーが出たのでロールバックした。\n' +
'  どのreleaseに戻ったかは確認してない。あとよろしく」\n\n' +
'あなたはこれから障害報告を書かなければなりません。\n' +
'「現在稼働しているのはどのreleaseか」を、推測ではなく事実として確定させてください。\n\n' +
'サーバーには5つのreleaseが残っています。',

  learn: [
    { name: 'Capistranoの3点セット', cmd: 'ls -la /var/www/myapp',
      desc: 'Capistrano構成には必ずこの3つがあります。\n\n' +
            '  releases/  デプロイのたびに作られる実体。名前はデプロイ時刻。\n' +
            '  shared/    デプロイしても消えないもの（log / tmp / config）。\n' +
            '  current    「今これが本番」を指す symbolic link。\n\n' +
            'デプロイとは、新しいreleaseを作り、最後に current を張り替える操作です。\n' +
            'ロールバックとは、current を1つ前のreleaseへ張り直す操作です。\n' +
            'どちらも一瞬で終わり、失敗しても前に戻せるのがこの構成の利点です。' },
    { name: 'symbolic link とは', cmd: 'ls -la /var/www/myapp',
      desc: 'ファイルやディレクトリへの「参照」です。実体ではありません。\n' +
            'ls -l の行頭が l になり、行末に -> 参照先 が付きます。\n\n' +
            '  lrwxrwxrwx  current -> releases/20260914120000\n\n' +
            'cd current でリンク先へ移動できるので、普段は実体と区別せず使えます。\n' +
            'だからこそ「今どこを指しているか」を意識的に確認する必要があります。' },
    { name: 'readlink', cmd: 'readlink current',
      desc: 'リンクが指している先だけを1行で返します。\n' +
            'ls -la の出力から目で探すより確実で、スクリプトにも組み込めます。\n' +
            '-f を付けると、リンクを辿り切った絶対パスになります。' },
    { name: 'ls -la releases', cmd: 'ls -la releases',
      desc: 'サーバーに残っているreleaseの一覧です。\n' +
            'ディレクトリ名がデプロイ時刻なので、並べるだけで履歴になります。\n' +
            'Capistranoは :keep_releases の数だけ残し、古いものから削除します。' },
    { name: 'REVISION', cmd: 'cat current/REVISION',
      desc: 'そのreleaseがどのGitコミットから作られたかが書かれています。\n' +
            '障害報告に「稼働中のコミット」を書くときは、この値を使います。' }
  ],

  startDirectory: APP,
  files: files,
  now: '17:12:05',

  /* ロールバック済み。currentは最新ではなく1つ前を指している */
  symlinks: (function () {
    var m = {};
    m[APP + '/releases/20260913150000/log'] = APP + '/shared/log';
    m[APP + '/releases/20260913150000/tmp'] = APP + '/shared/tmp';
    m[APP + '/current'] = APP + '/releases/20260913150000';
    return m;
  })(),

  journal: {
    puma: [
      'Sep 14 15:31:38 production systemd[1]: Started Puma HTTP Server for myapp (production).',
      'Sep 14 15:35:48 production systemd[1]: Stopping Puma HTTP Server for myapp (production)...',
      'Sep 14 15:35:50 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
      'Sep 14 15:35:51 production systemd[1]: Started Puma HTTP Server for myapp (production).'
    ]
  },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 15:35:51 JST', ago: '1h 36min ago',
      mainPid: 1421, tasks: 12, memory: '331.4M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
    }
  },

  hints: [
    '「たぶん1つ前のreleaseに戻ったはず」で報告を書いてはいけません。\n' +
    'currentが実際にどこを指しているかは、コマンドで確定できます。',

    'ls -la /var/www/myapp を実行してください。\n' +
    'current の行だけ行頭が l になっていて、-> の後ろに指し先が書かれています。\n' +
    'そのうえで ls -la releases で、サーバーにあるreleaseを一覧してください。',

    'readlink current を使えば一発です。\n' +
    'さらに cat current/REVISION で、稼働中のコミットSHAまで確定できます。\n' +
    'ロールバック先が「1つ前」とは限らないことに注意してください。'
  ],

  probes: [
    { key: 'listedReleases', label: 'releaseの一覧を確認した',
      test: function (c, res) { return /20260910110000/.test(res.stdout) && /20260914153000/.test(res.stdout); } },
    { key: 'readCurrentLink', label: 'currentの指す先を確認した',
      test: function (c, res) { return /current ->/.test(res.stdout) || (/readlink/.test(c) && /2026/.test(res.stdout)); } },
    { key: 'sawRollbackTarget', label: 'ロールバック先が20260913150000だと確認した',
      test: function (c, res) { return /20260913150000/.test(res.stdout); } },
    { key: 'sawRevisionSha', label: 'REVISIONでコミットSHAまで確定させた',
      test: function (c, res) { return /a1b2c3d4e5f6/.test(res.stdout); } },
    { key: 'readDeployLog', label: 'デプロイ/ロールバックの履歴を確認した',
      test: function (c, res) { return /rollback/i.test(res.stdout); } }
  ],

  evidence: [
    { key: 'listedReleases',    weight: 10, label: 'releaseの一覧を確認した' },
    { key: 'readCurrentLink',   weight: 18, label: 'currentの指す先をコマンドで確認した' },
    { key: 'sawRollbackTarget', weight: 14, label: '実際のロールバック先を特定した' },
    { key: 'sawRevisionSha',    weight: 12, label: 'REVISIONでコミットまで確定させた' },
    { key: 'readDeployLog',     weight: 8,  label: 'デプロイ履歴で経緯を確認した' }
  ],

  question: {
    text: '現在稼働しているのはどのrelease？',
    choices: [
      'releases/20260914153000（15:31にデプロイした最新のrelease）',
      'releases/20260914120000（今日の昼にデプロイしたrelease）',
      'releases/20260913150000（昨日の夕方にデプロイしたrelease）',
      'releases/20260912094500（2日前のrelease）'
    ],
    answer: 2,
    explain:
'ls -la /var/www/myapp を実行すると、current の行はこうなっています。\n\n' +
'  lrwxrwxrwx  deploy deploy  current -> releases/20260913150000\n\n' +
'readlink current でも同じ答えが1行で返ります。\n\n' +
'  releases/20260913150000\n\n' +
'REVISIONでコミットまで確定できます。\n\n' +
'  $ cat current/REVISION\n' +
'  a1b2c3d4e5f60718293a4b5c6d7e8f9012345678\n\n' +
'ここで重要なのは「1つ前に戻ったはず」という思い込みを持たないことです。\n' +
'releasesには5つ残っていて、時系列ではこうなっています。\n\n' +
'  20260910110000\n' +
'  20260912094500\n' +
'  20260913150000   ← いまここ\n' +
'  20260914120000   ← 本来の「1つ前」\n' +
'  20260914153000   ← ロールバック前に動いていたrelease\n\n' +
'実際に戻っているのは2つ前です。\n' +
'rollbackを続けて実行したのか、手動で張り替えたのかは分かりませんが、\n' +
'いずれにせよ「たぶん1つ前」で報告していたら間違えていました。\n\n' +
'ついでに構成の意味も押さえておきます。\n\n' +
'  releases/  実体。デプロイのたびに増える\n' +
'  shared/    log / tmp / config など、releaseをまたいで残すもの\n' +
'  current    symbolic link。これを張り替えることが「切り替え」\n\n' +
'ls -la current/ を見ると、log や tmp や config/database.yml も\n' +
'symbolic linkになっていて、すべて shared を指しています。\n' +
'だからreleaseが入れ替わっても、ログも設定も引き継がれます。',
    wrong: [
'20260914153000 は、15:31にデプロイして障害が出たreleaseです。\n' +
'~/deploy.log にも 15:35 に rollback が実行された記録があります。\n\n' +
'ディレクトリとしては残っていますが、current はここを指していません。\n' +
'readlink current で確認してください。\n' +
'「releasesに存在する＝稼働している」ではありません。',
'20260914120000 は「順番としては1つ前」ですが、current はここを指していません。\n\n' +
'これがこのCASEで一番ありがちな間違いです。\n' +
'ロールバックが必ず1つ前に戻るとは限りません（複数回実行されることもあります）。\n' +
'readlink current で実際の値を確認してください。',
null,
'20260912094500 は2日前のreleaseで、current はここを指していません。\n' +
'ls -la releases で並べたときの位置関係だけで判断せず、\n' +
'readlink current が返す実際の値を見てください。'
    ]
  },

  route: {
    steps: [
      'アプリのルートへ移動する',
      'ls -la で current / releases / shared の3点を確認する',
      'current の行が symbolic link であることを確認する',
      'readlink current で指し先を確定させる',
      'ls -la releases で全releaseを並べ、位置関係を把握する',
      'cat current/REVISION でコミットまで確定させる'
    ],
    commands: [
      'cd /var/www/myapp',
      'ls -la',
      'readlink current',
      'readlink -f current',
      'ls -la releases',
      'cat current/REVISION',
      'ls -la current',
      'cat ~/deploy.log',
      'cat ~/handover.md'
    ],
    note:
'ls -la の出力から目で読み取っても、readlink で1行で取っても構いません。\n' +
'障害報告に書く値は、必ずコマンドの出力をそのまま引き写してください。\n' +
'「たぶんこれ」で書いた1行が、後の調査全体を狂わせます。'
  }
});
})();
