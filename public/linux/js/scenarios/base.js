/* 仮想 production サーバーの「ベースイメージ」
   ------------------------------------------------------------------
   全CASEが共有するCapistrano構成のRails本番環境。
   各CASEは差分（壊れたservice・追記するログ・増えるprocess）だけを書く。

   LFR.scenarios.merge(base, caseDef) で合成される。 */
(function () {
'use strict';

var RELEASE  = '20260914120000';
var PREV     = '20260913150000';
var APP      = '/var/www/myapp';
var REL      = APP + '/releases/' + RELEASE;
var PREV_REL = APP + '/releases/' + PREV;

/* ---------- 共通ファイル ---------- */
var files = {};

files[APP + '/shared/config/database.yml'] =
'production:\n' +
'  adapter: mysql2\n' +
'  encoding: utf8mb4\n' +
'  host: db.internal\n' +
'  database: myapp_production\n' +
'  username: myapp\n' +
'  password: <%= ENV["DATABASE_PASSWORD"] %>\n' +
'  pool: <%= ENV.fetch("RAILS_MAX_THREADS", 5) %>\n';

files[APP + '/shared/config/redis.yml'] =
'production:\n' +
'  url: redis://127.0.0.1:6379/0\n' +
'  timeout: 1\n';

files[APP + '/shared/config/puma.rb'] =
'#!/usr/bin/env puma\n' +
'directory "/var/www/myapp/current"\n' +
'rackup    "/var/www/myapp/current/config.ru"\n' +
'environment "production"\n' +
'\n' +
'pidfile "/var/www/myapp/shared/tmp/pids/puma.pid"\n' +
'state_path "/var/www/myapp/shared/tmp/pids/puma.state"\n' +
'stdout_redirect "/var/www/myapp/shared/log/puma.access.log", "/var/www/myapp/shared/log/puma.error.log", true\n' +
'\n' +
'threads 5, 5\n' +
'workers 2\n' +
'preload_app!\n' +
'bind "unix:///var/www/myapp/shared/tmp/sockets/puma.sock"\n';

files[APP + '/shared/tmp/pids/.keep'] = '';
files[APP + '/shared/tmp/sockets/.keep'] = '';

/* releaseの中身（Railsアプリ本体） */
files[REL + '/config/routes.rb'] =
'Rails.application.routes.draw do\n' +
'  root "top#index"\n' +
'  resources :projects, only: %i[index show]\n' +
'  resources :entries, only: %i[create]\n' +
'  namespace :company do\n' +
'    resources :projects\n' +
'  end\n' +
'  mount Sidekiq::Web => "/sidekiq"\n' +
'end\n';

files[REL + '/config/environments/production.rb'] =
'Rails.application.configure do\n' +
'  config.cache_classes = true\n' +
'  config.eager_load = true\n' +
'  config.log_level = :info\n' +
'  config.log_tags = [:request_id]\n' +
'  config.cache_store = :redis_cache_store, { url: ENV["REDIS_URL"] }\n' +
'  config.active_job.queue_adapter = :sidekiq\n' +
'end\n';

files[REL + '/config/application.rb'] =
'require_relative "boot"\n' +
'require "rails/all"\n' +
'\n' +
'module Myapp\n' +
'  class Application < Rails::Application\n' +
'    config.load_defaults 7.2\n' +
'    config.time_zone = "Tokyo"\n' +
'    config.i18n.default_locale = :ja\n' +
'  end\n' +
'end\n';

files[REL + '/app/controllers/projects_controller.rb'] =
'class ProjectsController < ApplicationController\n' +
'  def index\n' +
'    @projects = Rails.cache.fetch("projects/index", expires_in: 5.minutes) do\n' +
'      Project.published.includes(:company).limit(50).to_a\n' +
'    end\n' +
'  end\n' +
'\n' +
'  def show\n' +
'    @project = Project.published.find(params[:id])\n' +
'  end\n' +
'end\n';

files[REL + '/Gemfile'] =
'source "https://rubygems.org"\n' +
'ruby "3.3.4"\n' +
'\n' +
'gem "rails", "~> 7.2.1"\n' +
'gem "mysql2"\n' +
'gem "puma", "~> 6.4"\n' +
'gem "redis", "~> 5.0"\n' +
'gem "sidekiq", "~> 7.2"\n' +
'gem "aws-sdk-s3"\n';

files[REL + '/REVISION'] = 'e3f1c2a9b7d4e5f60718293a4b5c6d7e8f901234\n';
files[PREV_REL + '/REVISION'] = 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678\n';
files[PREV_REL + '/Gemfile'] = files[REL + '/Gemfile'];
files[PREV_REL + '/config/routes.rb'] = files[REL + '/config/routes.rb'];

files['/etc/nginx/sites-enabled/myapp.conf'] =
'upstream puma {\n' +
'  server unix:///var/www/myapp/shared/tmp/sockets/puma.sock fail_timeout=0;\n' +
'}\n' +
'\n' +
'server {\n' +
'  listen 80;\n' +
'  server_name myapp.example.jp;\n' +
'  root /var/www/myapp/current/public;\n' +
'\n' +
'  try_files $uri/index.html $uri @puma;\n' +
'\n' +
'  location @puma {\n' +
'    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n' +
'    proxy_set_header Host $http_host;\n' +
'    proxy_pass http://puma;\n' +
'  }\n' +
'}\n';

files['/home/deploy/.ssh/authorized_keys'] =
'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH8v2k1qLp0Zr3sTmXcQ9dWfYbNjK5eRgH7uV1oP2aXc deploy@ci\n';
files['/home/deploy/.rbenv/version'] = '3.3.4\n';
files['/home/deploy/deploy-notes.md'] =
'# 引き継ぎメモ\n' +
'\n' +
'- デプロイはCapistrano。`cap production deploy`\n' +
'- アプリは /var/www/myapp\n' +
'- ログは current/log/production.log\n' +
'- Puma / Sidekiq は systemd 管理\n';

files['/home/deploy/.bashrc'] =
'# ~/.bashrc for deploy\n' +
'alias ll="ls -la"\n' +
'cd /var/www/myapp/current\n';

/* ---------- Capistrano の symbolic link ---------- */
/* 宣言順に解決される（log -> shared/log を先に張ってから current を張る） */
var symlinks = {};
symlinks[REL + '/log']         = '/var/www/myapp/shared/log';
symlinks[REL + '/tmp']         = '/var/www/myapp/shared/tmp';
symlinks[REL + '/config/database.yml'] = '/var/www/myapp/shared/config/database.yml';
symlinks[APP + '/current']     = '/var/www/myapp/releases/' + RELEASE;

/* ---------- 正常時のprocess一覧 ---------- */
var processes = [
  { pid: 1,    user: 'root',   cpu: 0.0, mem: 0.3, vsz: 169356, rss: 13124, stat: 'Ss',  start: 'Sep07', time: '0:31', command: '/sbin/init' },
  { pid: 612,  user: 'root',   cpu: 0.0, mem: 0.2, vsz: 110152, rss: 8420,  stat: 'Ss',  start: 'Sep07', time: '0:02', command: 'sshd: /usr/sbin/sshd -D' },
  { pid: 780,  user: 'root',   cpu: 0.0, mem: 0.1, vsz: 55232,  rss: 5120,  stat: 'Ss',  start: 'Sep07', time: '0:11', command: 'nginx: master process /usr/sbin/nginx' },
  { pid: 781,  user: 'nginx',  cpu: 0.1, mem: 0.2, vsz: 55880,  rss: 7864,  stat: 'S',   start: 'Sep07', time: '1:02', command: 'nginx: worker process' },
  { pid: 1530, user: 'redis',  cpu: 0.3, mem: 1.1, vsz: 162740, rss: 45120, stat: 'Ssl', start: 'Sep07', time: '8:44', command: '/usr/bin/redis-server 127.0.0.1:6379' },
  { pid: 1421, user: 'deploy', cpu: 1.2, mem: 8.4, vsz: 1284932, rss: 344180, stat: 'Sl', start: 'Sep14', time: '0:21', command: 'puma 6.4.2 (unix:///var/www/myapp/shared/tmp/sockets/puma.sock) [myapp]' },
  { pid: 1433, user: 'deploy', cpu: 0.9, mem: 7.8, vsz: 1251104, rss: 318604, stat: 'Sl', start: 'Sep14', time: '0:18', command: 'puma: cluster worker 0: 1421 [myapp]' },
  { pid: 1434, user: 'deploy', cpu: 0.8, mem: 7.6, vsz: 1248832, rss: 312048, stat: 'Sl', start: 'Sep14', time: '0:17', command: 'puma: cluster worker 1: 1421 [myapp]' },
  { pid: 1502, user: 'deploy', cpu: 0.4, mem: 6.2, vsz: 1122304, rss: 254112, stat: 'Sl', start: 'Sep14', time: '0:09', command: 'sidekiq 7.2.0 myapp [0 of 10 busy]' }
];

/* ---------- systemd service ---------- */
var services = {
  nginx: {
    description: 'A high performance web server and a reverse proxy server',
    status: 'active', sub: 'running', since: 'Mon 2026-09-07 10:02:11 JST', mainPid: 780,
    exec: '/usr/sbin/nginx -g daemon on; master_process on;'
  },
  puma: {
    description: 'Puma HTTP Server for myapp (production)',
    status: 'active', sub: 'running', since: 'Mon 2026-09-14 12:00:31 JST', mainPid: 1421,
    exec: '/home/deploy/.rbenv/shims/bundle exec puma -C /var/www/myapp/shared/config/puma.rb'
  },
  sidekiq: {
    description: 'Sidekiq background worker for myapp (production)',
    status: 'active', sub: 'running', since: 'Mon 2026-09-14 12:00:40 JST', mainPid: 1502,
    exec: '/home/deploy/.rbenv/shims/bundle exec sidekiq -e production'
  },
  redis: {
    description: 'Advanced key-value store',
    status: 'active', sub: 'running', since: 'Mon 2026-09-07 10:02:14 JST', mainPid: 1530,
    exec: '/usr/bin/redis-server 127.0.0.1:6379'
  },
  mysql: {
    description: 'MySQL Community Server',
    status: 'active', sub: 'running', since: 'Mon 2026-09-07 10:02:09 JST', mainPid: 1180,
    exec: '/usr/sbin/mysqld'
  }
};

/* ---------- journalctl ---------- */
var journal = {
  puma: [
    'Sep 14 12:00:29 production systemd[1]: Starting Puma HTTP Server for myapp (production)...',
    'Sep 14 12:00:31 production puma[1421]: Puma starting in cluster mode...',
    'Sep 14 12:00:31 production puma[1421]: * Puma version: 6.4.2 ("The Eagle of Durango")',
    'Sep 14 12:00:31 production puma[1421]: *  Min threads: 5',
    'Sep 14 12:00:31 production puma[1421]: *  Max threads: 5',
    'Sep 14 12:00:31 production puma[1421]: *  Environment: production',
    'Sep 14 12:00:31 production puma[1421]: *   Master PID: 1421',
    'Sep 14 12:00:31 production puma[1421]: *      Workers: 2',
    'Sep 14 12:00:33 production puma[1421]: * Listening on unix:///var/www/myapp/shared/tmp/sockets/puma.sock',
    'Sep 14 12:00:33 production systemd[1]: Started Puma HTTP Server for myapp (production).'
  ],
  redis: [
    'Sep 07 10:02:14 production systemd[1]: Starting Advanced key-value store...',
    'Sep 07 10:02:14 production redis-server[1530]: Ready to accept connections tcp',
    'Sep 07 10:02:14 production systemd[1]: Started Advanced key-value store.'
  ],
  sidekiq: [
    'Sep 14 12:00:40 production systemd[1]: Started Sidekiq background worker for myapp (production).',
    'Sep 14 12:00:42 production sidekiq[1502]: Booting Sidekiq 7.2.0 with Sidekiq::RedisConnection::RedisAdapter',
    'Sep 14 12:00:43 production sidekiq[1502]: Starting processing, hit Ctrl-C to stop'
  ],
  nginx: [
    'Sep 07 10:02:11 production systemd[1]: Started A high performance web server and a reverse proxy server.'
  ],
  mysql: [
    'Sep 07 10:02:09 production systemd[1]: Started MySQL Community Server.'
  ]
};

/* ---------- listenしているport ---------- */
var ports = [
  { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 511, local: '0.0.0.0:80',        peer: '0.0.0.0:*',  pid: 780,  process: 'nginx' },
  { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 128, local: '0.0.0.0:22',        peer: '0.0.0.0:*',  pid: 612,  process: 'sshd' },
  { proto: 'tcp', state: 'LISTEN', recvq: 0, sendq: 511, local: '127.0.0.1:6379',    peer: '0.0.0.0:*',  pid: 1530, process: 'redis-server' }
];

/* ---------- システム統計 ---------- */
var system = {
  uptime:   { since: '7 days, 21:58', users: 1, load: [0.18, 0.22, 0.19] },
  cpu:      { cores: 4, us: 3.1, sy: 1.2, id: 95.1, wa: 0.4 },
  mem:      { total: 7823, used: 3120, free: 1042, shared: 62, buffCache: 3661, available: 4402 },
  swap:     { total: 2047, used: 0, free: 2047 }
};

/* ---------- ディスク ---------- */
var disk = {
  filesystems: [
    { fs: '/dev/nvme0n1p1', size: '40G', used: '18G', avail: '22G', usePct: 46, mount: '/' },
    { fs: 'tmpfs',          size: '3.9G', used: '0',   avail: '3.9G', usePct: 0,  mount: '/dev/shm' },
    { fs: '/dev/nvme0n1p15', size: '105M', used: '6.1M', avail: '99M', usePct: 6, mount: '/boot/efi' }
  ],
  /* du が返すサイズ（パス -> 人間可読サイズ）。未定義のパスはLifoの実サイズ */
  sizes: {}
};

/* ---------- 環境変数 ---------- */
var envVars = {
  RAILS_ENV: 'production',
  RACK_ENV: 'production',
  RAILS_MAX_THREADS: '5',
  RAILS_LOG_TO_STDOUT: '',
  REDIS_URL: 'redis://127.0.0.1:6379/0',
  DATABASE_PASSWORD: 'pr0d-db-pa55w0rd-DO-NOT-SHARE',
  SECRET_KEY_BASE: '8f3c1e9a7b5d2f4068c1a3e5d7b9f0c2a4e6d8b0f2c4a6e8d0b2f4c6a8e0d2b4',
  AWS_ACCESS_KEY_ID: 'AKIAIOSFODNN7EXAMPLE',
  AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  LANG: 'ja_JP.UTF-8'
};

/* ---------- HTTP応答（curl用） ---------- */
var http = {
  'http://localhost/':           { status: 200, reason: 'OK', headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' }, body: '<!DOCTYPE html><html><head><title>Myapp</title></head><body>...</body></html>\n' },
  'http://localhost/projects':   { status: 200, reason: 'OK', headers: { 'content-type': 'text/html; charset=utf-8', server: 'nginx/1.24.0' }, body: '<!DOCTYPE html><html><head><title>求人検索 | Myapp</title></head><body>...</body></html>\n' },
  'http://localhost/health':     { status: 200, reason: 'OK', headers: { 'content-type': 'application/json' }, body: '{"status":"ok"}\n' }
};

window.LFR = window.LFR || {};
window.LFR.base = {
  hostname: 'production',
  user: 'deploy',
  home: '/home/deploy',
  release: RELEASE,
  prevRelease: PREV,
  appRoot: APP,
  startDirectory: APP + '/current',
  files: files,
  symlinks: symlinks,
  fsMeta: {},
  processes: processes,
  services: services,
  journal: journal,
  ports: ports,
  system: system,
  disk: disk,
  envVars: envVars,
  http: http
};
})();
