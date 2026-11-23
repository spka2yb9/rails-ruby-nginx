/* CASE 09 — サーバーが急に重くなった原因を探す */
(function () {
'use strict';
var APP = '/var/www/myapp';
var base = window.LFR.base;

var files = {};
var log = [];
for (var i = 0; i < 24; i++) {
  var mm = String(40 + Math.floor(i / 3)).padStart(2, '0');
  var ss = String((i * 7) % 60).padStart(2, '0');
  var t = '2026-09-14T14:' + mm + ':' + ss + '.' + String(100 + i * 29).slice(0, 3) + '+09:00';
  var rid = 'd' + (i * 69621).toString(16).padStart(6, '0') + '-2b3c-4d5e-8f60-718293a4b5c6';
  var ms = 4200 + i * 340;
  log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Started GET "/projects" for 10.0.2.' + (10 + i) + ' at 2026-09-14 14:' + mm + ':' + ss + ' +0900');
  log.push('I, [' + t + ' #1433]  INFO -- : [' + rid + '] Completed 200 OK in ' + ms + 'ms (Views: ' + Math.round(ms * 0.2) + '.1ms | ActiveRecord: ' + Math.round(ms * 0.1) + '.4ms)');
}
files[APP + '/shared/log/production.log'] = log.join('\n') + '\n';

files[APP + '/shared/log/sidekiq.log'] =
'2026-09-14T14:05:02.118Z pid=1502 tid=a12 class=ProjectReindexJob jid=91f2a7e40d9c INFO: start\n' +
'2026-09-14T14:12:44.902Z pid=1502 tid=a12 class=ProjectReindexJob jid=91f2a7e40d9c INFO: still running\n' +
'2026-09-14T14:31:08.441Z pid=1502 tid=a12 class=ProjectReindexJob jid=91f2a7e40d9c INFO: still running\n' +
'2026-09-14T14:44:19.077Z pid=1502 tid=a12 class=ProjectReindexJob jid=91f2a7e40d9c INFO: still running\n';

window.LFR.scenarios.add({
  id: 'case09',
  level: 3,
  title: 'サーバーが急に重くなった原因を探す',
  subtitle: 'CPU・メモリ・swap・load average の読み方',

  description:
'「サイトの表示がとても遅い」という報告が相次いでいます。\n\n' +
'エラーにはなりません。500も502も出ていません。\n' +
'ただ、いつもは0.1秒で返るページが、4〜10秒かかります。\n\n' +
'SSHして操作していても、コマンドの反応そのものがもたつきます。\n\n' +
'エラーが出ていないので、Railsのログを見るだけでは原因が分かりません。\n' +
'サーバーそのものの状態を確認してください。',

  learn: [
    { name: 'uptime', cmd: 'uptime',
      desc: '稼働時間と load average を1行で表示します。\n' +
            'load average は「実行待ちのプロセス数」の1分/5分/15分平均です。\n\n' +
            '目安はCPUコア数です。4コアなら 4.0 前後で「ちょうど飽和」。\n' +
            'それを大きく超えていれば、何かが順番待ちになっています。\n' +
            '1分値だけ高ければ今始まった問題、15分値も高ければ継続中の問題です。' },
    { name: 'free -h', cmd: 'free -h',
      desc: 'メモリの使用状況です。-h で人間が読める単位になります。\n\n' +
            '見るべきは used ではなく **available** です。\n' +
            'buff/cache はOSが勝手に使っているキャッシュで、必要なら解放されます。\n' +
            'availableが極端に少なく、Swapのusedが増えていたら、メモリ不足です。' },
    { name: 'top', cmd: 'top',
      desc: '負荷の内訳とプロセスごとの使用量を見ます。\n\n' +
            '%Cpu(s) の内訳が重要です。\n' +
            '  us … ユーザープロセスの計算\n' +
            '  sy … カーネルの処理\n' +
            '  id … アイドル（余っている）\n' +
            '  wa … I/O待ち（ディスクやswapの読み書き待ち）\n\n' +
            'wa が高いときは、CPUが忙しいのではなく「待たされて」います。' },
    { name: 'ps aux', cmd: 'ps aux | sort -k4 -rn | head',
      desc: '%MEM（4列目）で並べ替えれば、メモリを食っているプロセスが上に来ます。\n' +
            'topが使えない環境でも同じことができます。' },
    { name: 'swapという概念', cmd: 'free -h',
      desc: 'メモリが足りなくなると、OSは使っていないメモリの中身をディスクへ退避します。\n' +
            'これがswapです。ディスクはメモリより桁違いに遅いため、\n' +
            'swapが動き始めた瞬間にサーバー全体が急激に遅くなります。\n' +
            'エラーは出ないのに全部が遅い、という症状の典型的な原因です。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '14:48:31',

  system: {
    uptime: { since: '7 days, 22:41', users: 1, load: [14.22, 11.87, 6.40] },
    cpu:    { cores: 4, us: 11.2, sy: 9.8, id: 2.6, wa: 76.1 },
    mem:    { total: 7823, used: 7420, free: 118, shared: 74, buffCache: 285, available: 121 },
    swap:   { total: 2047, used: 1893, free: 154 }
  },

  processes: base.processes.map(function (p) {
    var q = {}; Object.keys(p).forEach(function (k) { q[k] = p[k]; });
    if (/sidekiq/.test(p.command)) {
      q.cpu = 92.4; q.mem = 41.8; q.vsz = 4821504; q.rss = 3268112;
      q.stat = 'Rl'; q.time = '38:12';
      q.command = 'sidekiq 7.2.0 myapp [1 of 10 busy]';
    } else if (/puma: cluster worker/.test(p.command)) {
      q.cpu = 3.1; q.mem = 8.2; q.rss = 334880; q.stat = 'Sl';
    }
    return q;
  }),

  hints: [
    'エラーが出ていない「遅い」は、アプリではなくサーバーの資源が原因のことが多いです。\n' +
    'CPU・メモリ・ディスク、どれが足りていないのかを順に確認しましょう。\n' +
    'まずは負荷の全体像を1行で見られるコマンドから。',

    'uptime の load average と、free -h の available / Swap を見てください。\n' +
    'load average はコア数（このサーバーは4コア）と比べて判断します。\n' +
    'コア数は top の %Cpu(s) 行でも確認できます。',

    'top を実行して %Cpu(s) の内訳を見てください。\n' +
    'us（計算）が高いのか、wa（I/O待ち）が高いのかで、原因はまったく違います。\n' +
    'あわせて、どのプロセスが %MEM を占めているかも確認してください。'
  ],

  probes: [
    { key: 'sawLoadAverage', label: 'load average を確認した',
      test: function (c, res) { return /load average/.test(res.stdout); } },
    { key: 'sawSwapUsed', label: 'swapが使われていることを確認した',
      test: function (c, res) { return /Swap:/.test(res.stdout) && /1\.8Gi|1893/.test(res.stdout); } },
    { key: 'sawLowAvailable', label: 'availableメモリがほぼ無いことを確認した',
      test: function (c, res) { return /free\b/.test(c) && /121|118Mi/.test(res.stdout); } },
    { key: 'sawIowait', label: 'I/O待ち（wa）が高いことを確認した',
      test: function (c, res) { return /%Cpu\(s\)/.test(res.stdout) && /76\.1 wa/.test(res.stdout); } },
    { key: 'sawMemHog', label: 'メモリを大量に使っているプロセスを特定した',
      test: function (c, res) { return /41\.8|3268112/.test(res.stdout); } }
  ],

  evidence: [
    { key: 'sawLoadAverage',  weight: 10, label: 'load average を確認した' },
    { key: 'sawLowAvailable', weight: 14, label: '空きメモリがほぼ無いことを確認した' },
    { key: 'sawSwapUsed',     weight: 16, label: 'swapが使われ始めていることを確認した' },
    { key: 'sawIowait',       weight: 12, label: 'CPUがI/O待ちであることを確認した' },
    { key: 'sawMemHog',       weight: 12, label: 'メモリを食っているプロセスを特定した' }
  ],

  question: {
    text: 'サーバーが重くなっている原因として最も可能性が高いものは？',
    choices: [
      'CPUを使い切るほど重い計算処理が走っている',
      'メモリが枯渇してswapが発生し、I/O待ちで全体が遅くなっている',
      'ディスクの空き容量が無くなっている',
      'ネットワークが輻輳していて、外部APIへの通信が詰まっている'
    ],
    answer: 1,
    explain:
'3つの数字が同じことを指しています。\n\n' +
'1) uptime\n' +
'   load average: 14.22, 11.87, 6.40\n' +
'   このサーバーは4コアなので、飽和の目安は4.0前後。14は明らかな過負荷です。\n' +
'   さらに 1分値(14.22) > 15分値(6.40) なので、いま進行中で悪化しています。\n\n' +
'2) free -h\n' +
'   Mem:  total 7.6Gi / available **121Mi**\n' +
'   Swap: total 2.0Gi / used **1.8Gi**\n' +
'   availableがほぼ空で、swapを1.8GBも使っています。メモリが足りていません。\n\n' +
'3) top\n' +
'   %Cpu(s): 11.2 us, 9.8 sy, 2.6 id, **76.1 wa**\n' +
'   us（計算）は11%しかありません。CPUは忙しいのではなく、76%も「待って」います。\n' +
'   この wa は、swapの読み書きでディスクI/Oが詰まっているときの典型的な形です。\n\n' +
'そして原因のプロセスも見えます。\n\n' +
'  sidekiq 7.2.0 myapp  %MEM 41.8  RSS 3268112（約3.2GB）\n' +
'  log/sidekiq.log → ProjectReindexJob が14:05から40分以上 still running\n\n' +
'再インデックスのジョブが大量のレコードを一度にメモリへ載せ、\n' +
'サーバーのメモリを食い潰してswapを誘発しています。\n\n' +
'覚えておくべき読み方は「load averageはコア数と比べる」\n' +
'「メモリはusedではなくavailableを見る」「waが高いときCPUは犯人ではない」の3つです。',
    wrong: [
'CPUを使い切っているなら、top の %Cpu(s) は us が高くなります。\n' +
'しかし実際の値は 11.2 us で、CPUの計算そのものは空いています。\n' +
'高いのは wa（76.1）、つまりI/Oの完了待ちです。\n\n' +
'load averageが高いのは事実ですが、load averageには\n' +
'「CPU待ち」だけでなく「I/O待ち」のプロセスも含まれます。\n' +
'数字が高い＝CPU不足、と短絡しないでください。',
null,
'ディスク容量は問題ありません。df -h を実行すると / の使用率は46%です。\n' +
'空き容量不足なら、書き込みエラー（ENOSPC）としてログに現れます。\n\n' +
'ただし「ディスクが遅い」という点では近い指摘です。\n' +
'今回遅いのはswapの読み書きであって、空き容量の不足ではありません。\n' +
'（容量不足そのものはCASE 10で扱います）',
'外部通信が詰まっているなら、Railsのログに Net::OpenTimeout などの\n' +
'タイムアウト例外や、特定のエンドポイントだけ遅い偏りが出ます。\n\n' +
'しかし今回はエラーが1件も出ておらず、すべてのページが一様に遅くなっています。\n' +
'SSHでのコマンド操作自体ももたつくという症状も、\n' +
'アプリの外部通信ではなくサーバー資源の問題を示しています。'
    ]
  },

  route: {
    steps: [
      '「エラーは出ないが全部遅い」＝サーバー資源を疑う',
      'load average を見る（uptime）→ 4コアに対して14',
      'メモリを見る（free -h）→ available 121Mi / Swap used 1.8Gi',
      'CPUの内訳を見る（top）→ wa 76.1%、usは11%',
      'どのプロセスが食っているかを見る（top / ps aux）',
      'そのプロセスのログで何をしているか確認する'
    ],
    commands: [
      'uptime',
      'free -h',
      'top',
      'ps aux | grep sidekiq',
      'df -h',
      'tail -n 10 log/sidekiq.log',
      'tail -n 6 log/production.log'
    ],
    note:
'top から入って「waが異常に高い」と先に気づくルートでも構いません。\n' +
'3つの数字（load / available / wa）が同じ結論を指しているかを\n' +
'確かめてから判断できていれば、それが良い調査です。'
  }
});
})();
