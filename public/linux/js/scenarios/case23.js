/* CASE 23 — カラム削除をダウンタイム無しで行う */
(function () {
'use strict';
var APP = '/var/www/myapp';
var REL = APP + '/releases/20260914120000';

var files = {};

files[REL + '/db/migrate/20260914090000_remove_status_from_entries.rb'] =
'class RemoveStatusFromEntries < ActiveRecord::Migration[7.2]\n' +
'  def change\n' +
'    remove_column :entries, :status, :string\n' +
'  end\n' +
'end\n';

files[REL + '/app/models/entry.rb'] =
'class Entry < ApplicationRecord\n' +
'  belongs_to :project\n' +
'  belongs_to :user\n' +
'\n' +
'  # 2026-09-14 追加予定: カラム削除の前にRailsから見えなくする\n' +
'  # self.ignored_columns += %w[status]\n' +
'\n' +
'  scope :active, -> { where(status: "active") }\n' +
'end\n';

files[REL + '/app/controllers/entries_controller.rb'] =
'class EntriesController < ApplicationController\n' +
'  def index\n' +
'    @entries = current_user.entries.active.order(created_at: :desc)\n' +
'  end\n' +
'end\n';

files['/home/deploy/release-plan.md'] =
'# リリース計画（#3412 entries.status の廃止）\n' +
'\n' +
'status カラムは使われなくなったので削除したい。\n' +
'\n' +
'## 今回のPRに入っているもの\n' +
'\n' +
'- db/migrate/20260914090000_remove_status_from_entries.rb（カラム削除）\n' +
'- ※ app/models/entry.rb の scope :active はまだ残っている\n' +
'- ※ app/controllers/entries_controller.rb も .active を呼んでいる\n' +
'\n' +
'## 気になっていること\n' +
'\n' +
'デプロイのとき、migrationとコードのどちらが先に反映されるのか？\n' +
'Pumaが再起動するまでは古いコードが動いているはず。\n';

files[APP + '/shared/log/production.log'] =
'I, [2026-09-14T18:02:11.114+09:00 #1433]  INFO -- : [cc11dd22-ee33-4ff4-8005-116622cc33dd] Started GET "/entries" for 10.0.2.31 at 2026-09-14 18:02:11 +0900\n' +
'I, [2026-09-14T18:02:11.226+09:00 #1433]  INFO -- : [cc11dd22-ee33-4ff4-8005-116622cc33dd] Completed 200 OK in 112ms (Views: 70.1ms | ActiveRecord: 14.2ms)\n';

function brokenHttp() {
  return {
    'http://localhost/': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>Myapp</title></head><body>...</body></html>\n'
    },
    'http://localhost/entries': {
      status: 500, reason: 'Internal Server Error',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><body><h1>We\'re sorry, but something went wrong.</h1></body></html>\n'
    }
  };
}
function okHttp() {
  return {
    'http://localhost/': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>Myapp</title></head><body>...</body></html>\n'
    },
    'http://localhost/entries': {
      status: 200, reason: 'OK',
      headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' },
      body: '<!DOCTYPE html><html><head><title>応募履歴 | Myapp</title></head><body>...</body></html>\n'
    }
  };
}

window.LFR.scenarios.add({
  id: 'case23',
  level: 8,
  title: 'カラム削除をダウンタイム無しで行う',
  subtitle: 'migrationとデプロイ、どちらが先に効くのか',

  description:
'使われなくなった entries.status カラムを削除するPRが用意されています。\n' +
'migrationファイルはすでに release の中に入っています。\n\n' +
'いまPumaは動いていて、/entries も正常に表示できています。\n\n' +
'この状態で `rails db:migrate` を実行してください。\n' +
'そして、その直後に何が起きるかを自分の目で確かめてください。\n\n' +
'※このCASEでは実際に migrate / rollback が実行できます。',

  learn: [
    { name: 'db:migrate:status', cmd: 'rails db:migrate:status',
      desc: '適用済み（up）と未適用（down）のmigrationを一覧します。\n' +
            'デプロイの前後で必ず確認します。\n' +
            '「このリリースで何がDBに適用されるのか」を把握しないまま出さないでください。' },
    { name: 'db:migrate', cmd: 'rails db:migrate',
      desc: '未適用のmigrationを順に実行します。\n' +
            'ここで重要なのは **実行した瞬間にDBのスキーマが変わる** ことです。\n' +
            'いま動いているPumaのプロセスには何の断りもありません。' },
    { name: 'db:rollback', cmd: 'rails db:rollback',
      desc: '直前のmigrationを1つ戻します。\n' +
            'ただし「戻せる」とは限りません。カラム削除を戻すとカラムは復活しますが、\n' +
            '**中に入っていたデータは戻りません**。\n' +
            'remove_column を本番で打つのが怖いのは、この非可逆性のためです。' },
    { name: 'ignored_columns', cmd: 'grep -n ignored_columns app/models/entry.rb',
      desc: 'Railsに「このカラムは無いものとして扱え」と伝える宣言です。\n\n' +
            '  self.ignored_columns += %w[status]\n\n' +
            'カラムがまだDBに存在していても、ActiveRecordはSELECT句に含めず、\n' +
            'モデルの属性としても持たなくなります。\n' +
            'これが2段階リリースの1段目で使う道具です。' },
    { name: 'curl で影響を見る', cmd: 'curl -I http://localhost/entries',
      desc: 'スキーマを変えたあと、実際の画面がどうなるかを確認します。\n' +
            'migrationは「成功した」と出ても、アプリが壊れていることがあります。' }
  ],

  startDirectory: APP + '/current',
  files: files,
  now: '18:05:40',

  rails: {
    version: '7.2.1',
    migrations: [
      { version: '20260901120000', name: 'CreateEntries',              up: true },
      { version: '20260903143000', name: 'AddIndexToEntries',          up: true },
      { version: '20260910110000', name: 'AddSalaryRangeToProjects',   up: true },
      { version: '20260914090000', name: 'RemoveStatusFromEntries',    up: false, seconds: '0.1284',
        /* 適用した瞬間、まだ古いコードを持っているPumaが壊れる */
        apply:  function (state) { state.http = brokenHttp(); state.schemaBroken = true; },
        revert: function (state) { state.http = okHttp();     state.schemaBroken = false; } }
    ]
  },

  services: {
    puma: {
      description: 'Puma HTTP Server for myapp (production)',
      status: 'active', sub: 'running',
      since: 'Mon 2026-09-14 12:00:31 JST', ago: '6h 5min ago',
      mainPid: 1421, tasks: 12, memory: '336.1M',
      exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb',
      recovery: {
        blockedBy: null,
        /* 再起動してもコードは .active を呼ぶままなので、カラムが無ければ壊れたまま */
        onUp: function (state) {
          state.http = state.schemaBroken ? brokenHttp() : okHttp();
          state.restartedAfterMigrate = true;
        },
        onDown: function (state) {}
      }
    }
  },

  http: okHttp(),

  hints: [
    'まず rails db:migrate:status で、これから何が適用されるのかを確認してください。\n' +
    '次に rails db:migrate を実行し、その直後に curl で /entries を叩いてください。',

    'migrateは成功したのに /entries が500になったはずです。\n' +
    'いま動いているPumaのコードは、まだ status カラムを参照しています\n' +
    '（app/models/entry.rb の scope :active）。\n\n' +
    'Pumaを再起動しても直りません。コード自体が古いままだからです。\n' +
    'まず rails db:rollback で戻してください。',

    '戻したら、順番を考え直してください。\n' +
    'app/models/entry.rb にコメントアウトされた行があります。\n\n' +
    '  # self.ignored_columns += %w[status]\n\n' +
    'これを使うと「DBにカラムがあるが、Railsからは見えない」状態を作れます。\n' +
    'その状態を先にデプロイしてから、次のリリースでカラムを削除します。'
  ],

  probes: [
    { key: 'checkedStatus', label: 'migrationの適用状況を確認した',
      test: function (c, res) { return /db:migrate:status/.test(c) && /RemoveStatusFromEntries/.test(res.stdout); } },
    { key: 'ranMigrate', label: 'db:migrate を実行した',
      test: function (c, res) { return /db:migrate\b/.test(c) && /migrated/.test(res.stdout); } },
    { key: 'sawBreakage', label: 'migrate直後に画面が壊れたことを確認した',
      test: function (c, res, rt) { return rt.state.schemaBroken && /500/.test(res.stdout + res.stderr); } },
    { key: 'restartDidNotHelp', label: '再起動しても直らないことを確認した',
      test: function (c, res, rt) { return rt.state.restartedAfterMigrate && rt.state.schemaBroken; } },
    { key: 'readCode', label: '古いコードがカラムを参照していることを確認した',
      test: function (c, res) { return /scope :active/.test(res.stdout); } },
    { key: 'rolledBackMigration', label: 'db:rollback で戻した',
      test: function (c, res, rt) { return /db:rollback/.test(c) && !rt.state.schemaBroken; } },
    { key: 'foundIgnoredColumns', label: 'ignored_columns という手段を見つけた',
      test: function (c, res) { return /ignored_columns/.test(res.stdout); } },
    { key: 'verifiedRecovered', label: '戻したあと画面が復旧したことを確認した',
      test: function (c, res, rt) { return !rt.state.schemaBroken && /200 OK/.test(res.stdout + res.stderr); } }
  ],

  evidence: [
    { key: 'checkedStatus',       weight: 8,  label: '適用状況を事前に確認した' },
    { key: 'ranMigrate',          weight: 10, label: 'migrationを実行した' },
    { key: 'sawBreakage',         weight: 16, label: '直後に壊れることを体験した' },
    { key: 'restartDidNotHelp',   weight: 10, label: '再起動では直らないと確認した' },
    { key: 'readCode',            weight: 12, label: '原因のコードを確認した' },
    { key: 'rolledBackMigration', weight: 16, label: 'rollbackで復旧させた' },
    { key: 'foundIgnoredColumns', weight: 12, label: '2段階リリースの手段を見つけた' },
    { key: 'verifiedRecovered',   weight: 10, label: '復旧を確認した' }
  ],

  question: {
    text: '本番でカラムを削除するときの正しい進め方は？',
    choices: [
      'db:migrate でカラムを削除してから、コードをデプロイする',
      '1回目のリリースで ignored_columns を追加したコードをデプロイし、2回目のリリースでカラムを削除する',
      'コードとmigrationを同じリリースに入れて、同時にデプロイする',
      '毎回メンテナンスページを出してから db:migrate する'
    ],
    answer: 1,
    explain:
'実際にやってみると、何が起きるかがはっきりします。\n\n' +
'  $ rails db:migrate\n' +
'  == 20260914090000 RemoveStatusFromEntries: migrated (0.1284s)\n' +
'  $ curl -I http://localhost/entries\n' +
'  HTTP/1.1 500 Internal Server Error\n\n' +
'migrationは成功しました。そして画面が壊れました。\n\n' +
'理由はコードにあります。\n\n' +
'  $ grep -n "status" app/models/entry.rb\n' +
'  scope :active, -> { where(status: "active") }\n\n' +
'いま動いているPumaは、まだ status カラムを参照するコードを持っています。\n' +
'DBからカラムが消えた瞬間、そのクエリは Unknown column で落ちます。\n\n' +
'ここで大事なのは、**Pumaを再起動しても直らない**ことです。\n' +
'再起動しても読み込まれるのは同じ（古い）コードなので、状況は変わりません。\n\n' +
'--- なぜ順番が問題になるのか ---\n\n' +
'デプロイは瞬間的ではありません。\n' +
'Capistranoの手順は「releaseを置く → migrate → currentを張り替え → 再起動」です。\n' +
'つまり **migrateが終わってから再起動が完了するまでのあいだ、\n' +
'古いコードが新しいスキーマに対して動く時間** が必ず存在します。\n' +
'サーバーが複数台あれば、この時間はさらに長くなります。\n\n' +
'カラムを消す変更は、この隙間で確実に壊れます。\n\n' +
'--- 2段階リリース ---\n\n' +
'  【1回目のリリース】コードだけ出す（DBは変えない）\n' +
'    class Entry < ApplicationRecord\n' +
'      self.ignored_columns += %w[status]\n' +
'    end\n' +
'    scope :active も含め、status を参照するコードをすべて消す\n\n' +
'    → この時点でカラムはまだDBにあるが、Railsは一切触らない\n' +
'    → 新旧どちらのコードが動いても壊れない\n\n' +
'  【2回目のリリース】migrationだけ出す\n' +
'    remove_column :entries, :status\n\n' +
'    → 誰も参照していないカラムを消すので、いつ実行しても安全\n\n' +
'この「コードを先に、スキーマを後に」という順序は、\n' +
'カラム削除・リネーム・NOT NULL追加など、後方互換でない変更すべてに当てはまります。\n' +
'（カラム追加は逆で、先にmigrate、後からコードでも壊れません）\n\n' +
'--- rollbackについて ---\n\n' +
'  $ rails db:rollback\n' +
'  == 20260914090000 RemoveStatusFromEntries: reverted\n\n' +
'今回は戻せました。ただしカラムは復活しても、**中に入っていたデータは戻りません**。\n' +
'remove_column を本番で打つのが怖いのは、この非可逆性のためです。\n' +
'「戻せるから大丈夫」とは考えないでください。',
    wrong: [
'これは今回まさに実行して、壊れた手順です。\n\n' +
'db:migrate でカラムを消した瞬間、まだ古いコードを持っているPumaが\n' +
'status を参照して500になります。\n' +
'コードのデプロイが完了するまでの数十秒〜数分、ユーザーはエラー画面を見ます。\n\n' +
'順序を逆にするだけでは解決しません。\n' +
'コードを先にデプロイしても、そのコードが status を参照していれば\n' +
'（今回の scope :active のように）結局同じです。\n' +
'「参照しないコード」を先に出す必要があります。',
null,
'同時にデプロイしても解決しません。\n\n' +
'Capistranoの手順は「release配置 → migrate → symlink張り替え → 再起動」です。\n' +
'migrateが終わった瞬間にスキーマは変わりますが、\n' +
'再起動が完了するまでは古いコードが動き続けます。\n' +
'この隙間で必ずエラーが出ます。\n\n' +
'サーバーが複数台ある構成なら、全台の再起動が終わるまで隙間は続きます。\n' +
'「同時」という状態は、現実のデプロイには存在しません。',
'メンテナンスページを出せば、確かにユーザーにエラーは見えません。\n' +
'実際、避けられないスキーマ変更ではその判断をすることもあります。\n\n' +
'ただし、カラム削除のためだけに毎回サービスを止めるのは割に合いません。\n' +
'ignored_columns を使えば止めずに済みますし、\n' +
'この方法を知らないと「スキーマ変更のたびにメンテナンス」になってしまいます。\n\n' +
'メンテナンスは、2段階リリースでも避けられない変更\n' +
'（大きなテーブルのALTERでロックが長時間かかる等）のための手段に取っておいてください。'
    ]
  },

  route: {
    steps: [
      '何が適用されるのかを事前に確認する（db:migrate:status）',
      'リリース計画とコードを読んで、影響を予想する',
      'db:migrate を実行する',
      '直後に画面を確認して、壊れたことを自分の目で見る',
      '再起動しても直らないことを確認する',
      '古いコードがカラムを参照していることを確認する',
      'db:rollback で戻し、復旧を確認する',
      'ignored_columns を使った2段階リリースの計画を立て直す'
    ],
    commands: [
      'cat ~/release-plan.md',
      'rails db:migrate:status',
      'cat db/migrate/20260914090000_remove_status_from_entries.rb',
      'grep -n "status" app/models/entry.rb',
      'curl -I http://localhost/entries',
      'rails db:migrate',
      'curl -I http://localhost/entries',
      'sudo systemctl restart puma',
      'curl -I http://localhost/entries',
      'rails db:rollback',
      'curl -I http://localhost/entries',
      'rails db:migrate:status',
      'grep -n "ignored_columns" app/models/entry.rb'
    ],
    note:
'先にコードを読んで「これは壊れるな」と予想してから migrate する順番が理想です。\n' +
'ただし一度は実際に壊して、rollbackで戻す経験をしておく価値があります。\n' +
'本番でこれをやると障害報告を書くことになるので、ここで済ませてください。'
  }
});
})();
