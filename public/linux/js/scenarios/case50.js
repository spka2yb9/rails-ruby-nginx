/* CASE 50 — セキュリティ更新のあと、何を再起動するか（needrestart と再起動の要否）
   unattended-upgrades が夜のうちに OpenSSL（libssl3）とカーネルを更新した。
   動いているプロセスは起動したときに読み込んだ古い libssl をメモリに持ったまま使い続ける。
   needrestart -b で、再起動が要るサービスと、カーネルの状態（KSTA）を確かめ、サービスを起動し直す。カーネルは再起動しないと変わらない */
(function () {
'use strict';
var APP = '/var/www/myapp';
var MIN = 60000, HOUR = 60 * MIN;
var LIB = '/usr/lib/x86_64-linux-gnu/libssl.so.3';
var KCUR = '5.15.0-125-generic', KEXP = '5.15.0-127-generic';

var upgradedAt = 0;   /* CASE を開いたときに決める */

function stamp(t) { var s = new Date(t + 9 * 3600000).toISOString(); return s.slice(0, 10) + ' ' + s.slice(11, 19) + ',' + s.slice(20, 23); }

var files = {};

files['/var/run/reboot-required'] = '*** System restart required ***\n';
files['/var/run/reboot-required.pkgs'] = 'linux-image-' + KEXP + '\nlinux-base\n';

files['/var/log/unattended-upgrades/unattended-upgrades.log'] = function () {
  var t = upgradedAt;
  return [
    stamp(t) + ' INFO Starting unattended upgrades script',
    stamp(t + 120) + ' INFO Allowed origins are: o=Ubuntu,a=jammy, o=Ubuntu,a=jammy-security, o=UbuntuESMApps,a=jammy-apps-security, o=UbuntuESM,a=jammy-infra-security',
    stamp(t + 6400) + ' INFO Packages that will be upgraded: libssl3 linux-generic linux-headers-generic linux-image-generic openssl',
    stamp(t + 6402) + ' INFO Writing dpkg log to /var/log/unattended-upgrades/unattended-upgrades-dpkg.log',
    stamp(t + 98000) + ' INFO All upgrades installed'
  ].join('\n') + '\n';
};

files['/home/deploy/notes/checklist.md'] =
'# 朝の確認で気づいたこと\n\n' +
'- サーバーに入ったら「*** System restart required ***」と出た\n' +
'- 夜のうちに、自動のセキュリティ更新（unattended-upgrades）が動いたらしい\n' +
'- サーバーを再起動するべきか、何を再起動すればよいかを確かめたい\n';

/* 古い libssl を使い続けているプロセス（削除されたファイルをメモリに持ったまま） */
var DEL = [
  ['nginx', 780, 'root', 'nginx'], ['nginx', 781, 'nginx', 'nginx'],
  ['ruby', 1421, 'deploy', 'puma'], ['ruby', 1433, 'deploy', 'puma'], ['ruby', 1434, 'deploy', 'puma'],
  ['ruby', 1502, 'deploy', 'sidekiq'], ['sshd', 612, 'root', 'ssh']
].map(function (r) { return { command: r[0], pid: r[1], user: r[2], fd: 'DEL', type: 'REG', size: '', path: LIB, service: r[3] }; });

/* systemctl restart したサービスは、新しい libssl を読み込んで起動する */
function refreshed(name) {
  return { onUp: function (st) {
    (st.libRefreshed = st.libRefreshed || {})[name] = true;
    st.openFiles = (st.openFiles || []).filter(function (f) { return f.service !== name; });
  } };
}

window.LFR.scenarios.add({
  id: 'case50',
  level: 17,
  title: 'セキュリティ更新のあと、何を再起動するか',
  subtitle: '古いライブラリを使い続けているプロセスと、カーネルの更新を見分ける',

  description:
'朝、本番サーバーに入ると「*** System restart required ***」と出ていました（~/notes/checklist.md）。\n' +
'夜のうちに、自動のセキュリティ更新が動いたようです。\n\n' +
'何が更新されたのか、どのプロセスを起動し直す必要があるのか、サーバーの再起動が要るのかを確かめ、\n' +
'今すぐできる分（サービスの再起動）を済ませてください。',

  learn: [
    { name: '何が更新されたか', cmd: 'grep "Packages that will be upgraded" /var/log/unattended-upgrades/unattended-upgrades.log',
      desc: 'unattended-upgrades は、何をしたかを /var/log/unattended-upgrades/unattended-upgrades.log に書きます。' },
    { name: '再起動が要るという印', cmd: 'cat /var/run/reboot-required.pkgs',
      desc: 'パッケージの更新で再起動が要るときに /var/run/reboot-required が作られ、\n' +
            'reboot-required.pkgs に、それを求めたパッケージが書かれます。' },
    { name: '動いているカーネル', cmd: 'uname -r',
      desc: '今動いているカーネルのバージョンです。新しいカーネルは、サーバーを再起動したときに使われます。' },
    { name: '起動し直す必要があるサービス', cmd: 'sudo needrestart -b',
      desc: 'needrestart はライブラリの更新のあとに、起動し直す必要があるサービスを調べます。-b は機械で読みやすい書式で一覧を出します（再起動はしません）。\n' +
            '  NEEDRESTART-KCUR  動いているカーネル\n' +
            '  NEEDRESTART-KEXP  インストールされている新しいカーネル\n' +
            '  NEEDRESTART-KSTA  1: 更新は無い、2: 互換のある更新が待っている、3: バージョンの更新が待っている（再起動が要る）\n' +
            '  NEEDRESTART-SVC   起動し直す必要があるサービス' },
    { name: 'プロセスが古いライブラリを使っているか', cmd: 'sudo lsof -p 780 | grep DEL',
      desc: 'ライブラリを更新すると、ファイルは新しいものに置き換わりますが、動いているプロセスは古いものをメモリに持ったまま使い続けます。\n' +
            'lsof の FD が DEL の行は、削除された（置き換えられた）ファイルを、そのプロセスがまだ使っていることを表します。' }
  ],

  startDirectory: APP + '/current',
  clock: 'now',
  files: files,
  kernel: KCUR,
  needrestart: { ver: '3.5', kcur: KCUR, kexp: KEXP, ksta: 3, services: ['nginx.service', 'puma.service', 'sidekiq.service', 'ssh.service'] },
  get openFiles() { upgradedAt = Math.floor((Date.now() - 3 * HOUR) / MIN) * MIN; return DEL.map(function (f) { var g = {}; Object.keys(f).forEach(function (k) { g[k] = f[k]; }); return g; }); },
  services: {
    nginx: { recovery: refreshed('nginx') },
    puma: { recovery: refreshed('puma') },
    sidekiq: { recovery: refreshed('sidekiq') },
    ssh: { description: 'OpenBSD Secure Shell server', status: 'active', sub: 'running', since: 'Mon 2026-09-07 10:02:05 JST', mainPid: 612, exec: '/usr/sbin/sshd -D', recovery: refreshed('ssh') }
  },

  hints: [
    'まず、夜のうちに何が更新されたかを確かめます。\n\n' +
    '  grep "Packages that will be upgraded" /var/log/unattended-upgrades/unattended-upgrades.log\n' +
    '  cat /var/run/reboot-required.pkgs',

    '更新されたのは OpenSSL のライブラリ（libssl3）とカーネルです。\n' +
    'needrestart -b で、起動し直す必要があるサービスと、カーネルの状態を確かめてください。',

    'nginx・puma・sidekiq・ssh を systemctl restart で起動し直し、もう一度 needrestart -b を見ます。\n' +
    'カーネルはサーバーを再起動しないと新しくなりません。再起動は、ALB から外してから、利用の少ない時間に行います。'
  ],

  probes: [
    { key: 'foundUpgrades', label: '更新されたパッケージ（libssl3 とカーネル）を確かめた',
      test: function (c, res) { return /unattended-upgrades/.test(c) && /libssl3/.test(res.stdout); } },
    { key: 'sawRebootPkgs', label: '再起動を求めたのがカーネルのパッケージだと確かめた',
      test: function (c, res) { return /reboot-required/.test(c) && /linux-image/.test(res.stdout); } },
    { key: 'sawKernel', label: '動いているカーネルが古いバージョンだと確かめた',
      test: function (c, res) { return /uname/.test(c) && /5\.15\.0-125/.test(res.stdout); } },
    { key: 'ranNeedrestart', label: 'needrestart で、起動し直す必要があるサービスを確かめた',
      test: function (c, res) { return /needrestart/.test(c) && /NEEDRESTART-SVC: nginx\.service/.test(res.stdout); } },
    { key: 'sawDeleted', label: 'プロセスが置き換えられた libssl を使い続けていることを確かめた',
      test: function (c, res) { return /lsof/.test(c) && /DEL/.test(res.stdout) && /libssl\.so\.3/.test(res.stdout); } },
    { key: 'restartedServices', label: 'サービスを起動し直し、残りがカーネルだけになったことを確かめた',
      test: function (c, res) { return /needrestart/.test(c) && /NEEDRESTART-KSTA: 3/.test(res.stdout) && !/NEEDRESTART-SVC/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'foundUpgrades',     weight: 10, label: '夜のうちに何が更新されたかを確かめた' },
    { key: 'sawRebootPkgs',     weight: 8,  label: '再起動を求めたパッケージを確かめた' },
    { key: 'sawKernel',         weight: 8,  label: '動いているカーネルのバージョンを確かめた' },
    { key: 'ranNeedrestart',    weight: 14, label: '起動し直す必要があるサービスを調べた' },
    { key: 'sawDeleted',        weight: 10, label: '古いライブラリを使い続けているプロセスを確かめた' },
    { key: 'restartedServices', weight: 14, label: 'サービスを起動し直し、残りがカーネルだけだと確かめた' }
  ],

  question: {
    text: 'セキュリティ更新のあとにすることとして正しいのは？',
    choices: [
      'パッケージは更新済みなので、何もしなくてよい',
      'libssl を使うサービス（nginx・Puma・Sidekiq・sshd）を起動し直し、新しいカーネルを使うためのサーバーの再起動は、計画して行う',
      'nginx だけを systemctl reload すれば、すべてのプロセスが新しい libssl を使う',
      'カーネルの更新を元に戻せば、再起動は要らない'
    ],
    answer: 1,
    explain:
'unattended-upgrades のログを見ると、夜のうちに libssl3（OpenSSL のライブラリ）とカーネルが更新されています。\n' +
'/var/run/reboot-required.pkgs には、カーネル（linux-image-' + KEXP + '）が書かれています。\n\n' +
'パッケージを更新しても、動いているプロセスは起動したときに読み込んだ古い libssl をメモリに持ったまま使い続けます。\n' +
'lsof で見ると、FD が DEL（置き換えられて削除されたファイル）の libssl.so.3 を、nginx・Puma・Sidekiq・sshd が使っています。\n' +
'このままでは、直した脆弱性が動いているプロセスには残ったままです。\n\n' +
'needrestart -b はそれを一覧にします。\n' +
'  NEEDRESTART-SVC   nginx.service / puma.service / sidekiq.service / ssh.service\n' +
'  NEEDRESTART-KSTA  3（カーネルのバージョンの更新が待っている）\n' +
'サービスは systemctl restart で起動し直せば、新しい libssl を読み込みます。\n' +
'nginx の reload は master のプロセスを残すので、ライブラリの入れ替えには restart が要ります。\n' +
'起動し直したあとの needrestart -b では、SVC の行が消え、KSTA 3（カーネル）だけが残ります。\n\n' +
'カーネルはサーバーを再起動しないと新しくなりません（uname -r は ' + KCUR + ' のまま）。\n' +
'Web サーバーなら、ALB のターゲットから外し、処理中のリクエストが終わるのを待ってから再起動し、\n' +
'戻ったことを確かめてからもう1台、という順で、利用の少ない時間に行います。\n\n' +
'--- このCASEで身につけてほしいこと ---\n\n' +
'1. ライブラリを更新しても、動いているプロセスは古いものを使い続ける。起動し直して初めて入れ替わる\n' +
'2. needrestart -b で、起動し直す必要があるサービスとカーネルの状態を確かめる\n' +
'3. カーネルの更新は、サーバーの再起動が要る。サービスを止めない手順を決めて行う\n' +
'4. 自動のセキュリティ更新を入れたら、「再起動が要るか」を毎朝確かめる手順も一緒に決める',
    wrong: [
'パッケージのファイルは新しくなっていますが、動いているプロセスは古い libssl を使い続けています（lsof の DEL）。\n' +
'起動し直すまで、直した脆弱性はそのプロセスに残ります。',
null,
'reload は nginx の master のプロセスを残し、Puma や Sidekiq には何もしません。\n' +
'needrestart が挙げたサービスを、それぞれ restart します。',
'カーネルの更新はセキュリティの修正です。戻すと、その修正も無くなります。\n' +
'新しいカーネルを使うために、計画して再起動します。'
    ]
  },

  route: {
    steps: [
      'メモで、何に気づいたかを確かめる',
      'unattended-upgrades のログと reboot-required.pkgs で、何が更新されたかを確かめる',
      '動いているカーネルと、needrestart -b の結果を確かめる',
      'lsof で、プロセスが置き換えられた libssl を使い続けていることを確かめる',
      'サービスを起動し直し、needrestart -b で残りがカーネルだけになったことを確かめる'
    ],
    commands: [
      'cat ~/notes/checklist.md',
      'grep "Packages that will be upgraded" /var/log/unattended-upgrades/unattended-upgrades.log',
      'cat /var/run/reboot-required.pkgs',
      'uname -r',
      'sudo needrestart -b',
      'sudo lsof -p 780 | grep DEL',
      'sudo systemctl restart nginx',
      'sudo systemctl restart puma',
      'sudo systemctl restart sidekiq',
      'sudo systemctl restart ssh',
      'sudo needrestart -b'
    ],
    note:
'ssh を起動し直しても、今つながっているセッションは切れません（新しい接続から新しい sshd が受け付けます）。\n' +
'それでも、作業中の画面とは別にもう1つセッションを開いておくと、何かあっても戻れます。'
  }
});
})();
