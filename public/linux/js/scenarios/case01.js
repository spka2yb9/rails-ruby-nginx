/* CASE 01 — Railsアプリがどこにあるか確認する */
(function () {
'use strict';
var APP = '/var/www/myapp';

window.LFR.scenarios.add({
  id: 'case01',
  manual: { title: 'GNU Coreutils · pwd', url: 'https://www.gnu.org/software/coreutils/manual/coreutils.html#pwd-invocation' },
  level: 1,
  title: 'Railsアプリがサーバーのどこにあるか確認する',
  subtitle: 'この練習用サーバーで、いま使われているRailsのコードの置き場所を見つけましょう。',

  description:
'Railsアプリの運用を引き継ぎました。このチームでは、コードを公開するたびに別のディレクトリ（フォルダー）に保存し、使う版を切り替えています。\n\n' +
'サーバーには作業用ユーザー deploy でログイン済みです。いま使われている版のディレクトリを同僚に伝えてください。',

  guide: [
    { title: '自分がいる場所を表示する', why: 'ターミナルは、文字でコンピューターに指示を出す画面です。まず pwd で今いるディレクトリの名前を尋ねます。',
      commands: ['pwd'], read: '/home/deploy と表示されたら、そこが作業の出発点です。先頭の / は、サーバー内の場所を一番上から表す目印です。' },
    { title: 'アプリのディレクトリに移動する', why: 'この教材では /var/www/myapp にアプリを置いています。cd に続けて行き先を書くと、作業する場所が変わります。',
      commands: ['cd /var/www/myapp', 'pwd'], read: 'cd が成功すると通常は何も表示されません。続けて pwd を実行し、表示が /var/www/myapp に変わったことを確かめます。' },
    { title: '稼働中のコードを指す矢印を探す', why: 'ls は中身を一覧にします。-l でリンクの行き先まで表示し、-a で隠しファイルも含めます。まとめて -la と書けます。',
      commands: ['ls -la'], read: 'current の行を探します。矢印（->）の右側が、現在使っている版のディレクトリです。末尾の数字を回答の選択肢と照らし合わせましょう。' }
  ],

  learn: [
    { name: 'pwd', cmd: 'pwd',
      desc: '今いるディレクトリの絶対パスを表示します。\n' +
            '相対パスでcatやtailを打つ前に、必ず立ち位置を確認する癖をつけてください。\n' +
            'ファイルが見つからないときは、最初にこの場所を確認できます。' },
    { name: 'ls', cmd: 'ls',
      desc: 'ディレクトリの中身を一覧します。\n' +
            'まずは素のlsで「何があるか」を掴みます。' },
    { name: 'ls -la', cmd: 'ls -la',
      desc: '-l で1行1ファイルの詳細（permission・所有者・サイズ・更新時刻）、\n' +
            '-a で . から始まる隠しファイルも表示します。\n\n' +
            'Capistrano構成では、-l を付けないと見えないものがあります。\n' +
            'current が実体のディレクトリなのか、それともどこかを指す矢印なのかは、\n' +
            'current の行末で確かめられます。' },
    { name: 'cd', cmd: 'cd /var/www/myapp',
      desc: 'ディレクトリを移動します。\n' +
            'cd .. で1つ上、cd - で直前のディレクトリ、cd だけでホームに戻ります。\n' +
            '本番では「移動して、pwdで確認して、lsで見る」を1セットにすると事故が減ります。' }
  ],

  startDirectory: '/home/deploy',

  hints: [
    'まず pwd で今どこに居るかを確認しましょう。\n' +
    'Railsアプリは、たいてい /var/www か /srv か /opt の下に置かれています。',

    '/var/www/myapp まで降りて ls -la を実行してみてください。\n' +
    'current / releases / shared という3つが並んでいたら、それはCapistrano構成です。',

    'ls -la /var/www/myapp を実行すると、current の行だけ書式が違うはずです。\n' +
    '行頭の文字と、行末の -> に注目してください。'
  ],

  probes: [
    { key: 'sawCapistranoTree', label: 'Capistranoのディレクトリ構成を確認した',
      test: function (c, res) { return /current/.test(res.stdout) && /releases/.test(res.stdout); } },
    { key: 'sawSymlink', label: 'currentがsymbolic linkであることを見た',
      test: function (c, res) { return /current ->|lrwxrwxrwx/.test(res.stdout) || /readlink/.test(c); } },
    { key: 'movedIntoApp', label: 'アプリのディレクトリまで移動した',
      test: function (c, res, rt) { return /^\s*cd\b/.test(c) && rt.cwd().indexOf(APP) === 0; } }
  ],

  evidence: [
    { key: 'exploredFs',          weight: 10, label: 'ls / cd でサーバーの中を歩いた' },
    { key: 'sawCapistranoTree',   weight: 15, label: 'current / releases / shared を見つけた' },
    { key: 'sawSymlink',          weight: 20, label: 'current が symbolic link だと確認した' },
    { key: 'movedIntoApp',        weight: 15, label: 'アプリのディレクトリへ移動した' }
  ],

  question: {
    text: '今まさに稼働しているRailsアプリの「コードの実体」があるのはどこ？',
    choices: [
      '/var/www/myapp',
      '/var/www/myapp/current（ここにファイルの実体が置かれている）',
      '/var/www/myapp/releases/20260914120000',
      '/var/www/myapp/shared'
    ],
    answer: 2,
    explain:
'ls -la /var/www/myapp を実行すると、current の行だけ形が違います。\n\n' +
'  lrwxrwxrwx  deploy deploy  current -> releases/20260914120000\n' +
'  drwxr-xr-x  deploy deploy  releases\n' +
'  drwxr-xr-x  deploy deploy  shared\n\n' +
'行頭の l は symbolic link（シンボリックリンク）を表します。\n' +
'つまり current はディレクトリそのものではなく、releases/20260914120000 を指す矢印です。\n\n' +
'Capistranoは、デプロイのたびに releases/<タイムスタンプ>/ へコードを展開し、\n' +
'最後に current の矢印を新しいreleaseへ張り替えます。\n' +
'これによって「切り替えが一瞬で終わる」「失敗したら前のreleaseへ戻せる」を実現しています。\n\n' +
'普段の作業では current を使って構いません。\n' +
'ただし「どのreleaseが本番なのか」を答えるべき場面では、実体の側を見る必要があります。',
    wrong: [
'/var/www/myapp はアプリの置き場所の親ディレクトリで、\n' +
'この中に current / releases / shared が並んでいます。\n' +
'コードそのものはここには置かれていません。',
null,
null,
'shared には、デプロイしても消えてはいけないものが置かれています。\n' +
'log / tmp / config（database.ymlやmaster.keyなど）です。\n' +
'releaseごとに作り直されないため、各releaseからsymbolic linkで共有されています。\n' +
'アプリのコードはここではありません。'
    ]
  },

  route: {
    steps: [
      '自分の立ち位置を確認する（pwd）',
      'アプリの置き場所まで降りる（cd /var/www/myapp）',
      '詳細表示で中身を見る（ls -la）',
      'current の行頭が l で、-> が付いていることに気づく',
      'リンク先の release が実体だと分かる'
    ],
    commands: [
      'pwd',
      'cd /var/www/myapp',
      'ls',
      'ls -la',
      'readlink current',
      'ls -la releases',
      'cd current && pwd'
    ],
    note:
'readlink current を使えば一発でリンク先が分かりますし、\n' +
'ls -la releases から最新のタイムスタンプを読む方法もあります。\n' +
'どのルートでも構いません。'
  }
});
})();
