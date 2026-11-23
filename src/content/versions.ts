/** 本書が基準にするバージョン。各章の記述はこれに合わせる。 */
export const VERSIONS = {
  checked: '2026-11-11',
  items: [
    { name: 'Ruby on Rails', version: '8.1.4.1', note: '2026-11-04 リリース。Rails 7.2 との違いは各章の「Rails 7.2 との違い」と付録Aに記載' },
    { name: 'Ruby', version: '4.0.9', note: '2026-10-23 リリース（CRuby）' },
    { name: 'Puma', version: '8.0.2', note: 'Rails 8.1.4.1 の rails new で Gemfile.lock に記録されるバージョン' },
    { name: 'Rack', version: '3.2.8', note: '' },
    { name: 'Zeitwerk', version: '2.8.3', note: '' },
    { name: 'debug', version: '1.11.1', note: 'Rails の標準 Gemfile に含まれるデバッガ' },
    { name: 'Nginx', version: '1.30.6（stable）', note: 'mainline は 1.31.8' },
    { name: 'MySQL', version: '8.4.13', note: '第3部以降の実測に使用（Docker の mysql:8.4、接続は mysql2 0.5.7）' },
    { name: 'Sidekiq', version: '8.1.7', note: '第21章の実測に使用（Redis 8.10.3）' },
    { name: 'turbo-rails', version: '2.0.23', note: 'デモアプリで使用' },
    { name: 'rspec-rails', version: '8.1.0', note: '第23章の実測に使用（rspec-core 3.13.7）' },
  ],
}
