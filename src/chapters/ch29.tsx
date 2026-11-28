import type { Chapter } from '../content/types'
import { withExplanations } from '../explanations/shared'
import { explanation29 } from '../explanations/operations'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T, TextBg } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 A-1 バージョン番号の読み方 ---------- */
function VersionFigure() {
  const parts = [
    ['8', 'メジャー'],
    ['1', 'マイナー'],
    ['4', 'パッチ'],
    ['1', 'セキュリティ修正'],
  ]
  const series = [
    ['8.1.0', '2025-10-22'],
    ['8.1.1', '2025-10-28'],
    ['8.1.2', '2026-01-08'],
    ['8.1.2.1', '2026-03-23'],
    ['8.1.3', '2026-03-24'],
    ['8.1.3.1', '2026-07-29'],
    ['8.1.4', '2026-09-24'],
    ['8.1.4.1', '2026-11-04'],
  ]
  return (
    <Svg
      id="A-1"
      w={780}
      h={262}
      label="8.1.4.1 は、左からメジャー 8、マイナー 1、パッチ 4、セキュリティ修正の 1。8.1 系列は 8.1.0（2025-10-22）から、8.1.1、8.1.2、8.1.2.1、8.1.3、8.1.3.1、8.1.4、8.1.4.1（2026-11-04）の順に公開された。4つ目の数字が付くのはセキュリティ修正だけのバージョン"
    >
      {parts.map(([d, name], i) => (
        <g key={name}>
          <Box x={120 + i * 140} y={14} w={70} h={44} lines={d} fs={22} bold fill={i === 3 ? 'box5' : 'box'} />
          {i < 3 && (
            <T x={120 + i * 140 + 98} y={44} fs={22} bold>
              .
            </T>
          )}
          <T x={155 + i * 140} y={76} fs={11.5} anchor="middle">
            {name}
          </T>
        </g>
      ))}
      <T x={28} y={118} bold fs={12}>
        8.1 系列のバージョン（rubygems.org の公開日）
      </T>
      {series.map(([v, date], i) => (
        <g key={v}>
          <Box x={28 + i * 92} y={132} w={80} h={46} lines={[v, date]} fs={11} fill={v.split('.').length === 4 ? 'box5' : 'box'} subTone="muted" />
          {i < series.length - 1 && <Arrow x1={108 + i * 92} y1={155} x2={118 + i * 92} y2={155} />}
        </g>
      ))}
      <rect x={28} y={206} width={14} height={12} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <T x={48} y={212} fs={11}>
        系列の最初のリリースと、バグ修正のパッチ
      </T>
      <rect x={330} y={206} width={14} height={12} fill="var(--fig-box5)" stroke="var(--fig-line)" />
      <T x={350} y={212} fs={11}>
        直前のバージョンにセキュリティ修正だけを加えたもの
      </T>
      <T x={28} y={244} fs={11} tone="muted">
        {'Gemfile の "~> 8.1.4" は 8.1.4 以上 8.2 未満を表し、Gemfile.lock に実際に使うバージョンが記録される'}
      </T>
    </Svg>
  )
}

/* ---------- 図 A-2 サポート期間 ---------- */
function SupportFigure() {
  // 2024-01 を 0 とした月の位置
  const x0 = 130
  const mw = 11 // 1か月の幅
  const m = (y: number, mo: number, d = 1) => x0 + ((y - 2024) * 12 + (mo - 1) + (d - 1) / 30) * mw
  const rows = [
    { v: '7.2', rel: [2024, 8, 9], bug: [2025, 8, 9], sec: [2026, 8, 9], note: '方針から計算（公式ページに記載なし）' },
    { v: '8.0', rel: [2024, 11, 7], bug: [2026, 5, 7], sec: [2026, 11, 7], note: '公式ページの記載' },
    { v: '8.1', rel: [2025, 10, 22], bug: [2026, 10, 10], sec: [2027, 10, 10], note: '公式ページの記載' },
  ]
  const today = m(2026, 11, 11)
  const fmt = (d: number[]) => d.map((n, i) => (i === 0 ? String(n) : String(n).padStart(2, '0'))).join('-')
  return (
    <Svg
      id="A-2"
      w={780}
      h={250}
      label="Rails 7.2、8.0、8.1 のサポート期間。7.2 は 2024年8月9日に公開され、方針どおりならバグ修正は 2025年8月9日まで、セキュリティ修正は 2026年8月9日まで。8.0 は 2024年11月7日に公開され、公式ページではバグ修正が 2026年5月7日まで、セキュリティ修正が 2026年11月7日まで。8.1 は 2025年10月22日に gem が公開され、公式ページではバグ修正が 2026年10月10日まで、セキュリティ修正が 2027年10月10日まで。2026年11月11日の時点で、セキュリティ修正の期間内にあるのは 8.1 だけ"
    >
      {[2024, 2025, 2026, 2027, 2028].map((y) => (
        <g key={y}>
          <line x1={m(y, 1)} y1={24} x2={m(y, 1)} y2={196} stroke="var(--fig-line)" strokeDasharray="2 4" opacity={0.6} />
          <T x={m(y, 1) + 4} y={18} fs={10.5} tone="muted">
            {String(y)}
          </T>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = 40 + i * 52
        const a = m(r.rel[0], r.rel[1], r.rel[2])
        const b = m(r.bug[0], r.bug[1], r.bug[2])
        const c = m(r.sec[0], r.sec[1], r.sec[2])
        return (
          <g key={r.v}>
            <T x={20} y={y + 10} bold fs={12.5}>
              {`Rails ${r.v}`}
            </T>
            <rect x={a} y={y} width={b - a} height={20} fill="var(--fig-box4)" stroke="var(--fig-line)" />
            <rect x={b} y={y} width={c - b} height={20} fill="var(--fig-box2)" stroke="var(--fig-line)" strokeDasharray={i === 0 ? '4 3' : undefined} />
            <TextBg x={x0} y={y + 32} text={`${fmt(r.rel)} 〜 ${fmt(r.sec)}（${r.note}）`} fs={9.5} />
            <T x={x0} y={y + 32} fs={9.5} tone="muted">
              {`${fmt(r.rel)} 〜 ${fmt(r.sec)}（${r.note}）`}
            </T>
          </g>
        )
      })}
      <line x1={today} y1={28} x2={today} y2={196} stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={today + 4} y={206} fs={10.5} tone="acc">
        2026-11-11
      </T>
      <rect x={20} y={222} width={14} height={12} fill="var(--fig-box4)" stroke="var(--fig-line)" />
      <T x={40} y={228} fs={11}>
        バグ修正とセキュリティ修正
      </T>
      <rect x={240} y={222} width={14} height={12} fill="var(--fig-box2)" stroke="var(--fig-line)" />
      <T x={260} y={228} fs={11}>
        セキュリティ修正だけ
      </T>
    </Svg>
  )
}

/* ---------- 図 A-3 アップグレードの順 ---------- */
function UpgradeFigure() {
  const steps = [
    { t: 'Ruby を上げる', s: '8.x は 3.2 以上' },
    { t: '7.x の最新パッチ', s: '非推奨の警告を消す' },
    { t: '7.2 の最新パッチ', s: 'app:update' },
    { t: '8.0 の最新パッチ', s: 'app:update' },
    { t: '8.1 の最新パッチ', s: 'app:update' },
  ]
  return (
    <Svg
      id="A-3"
      w={780}
      h={200}
      label="アップグレードは、まず Ruby を上げ、次に今の Rails の最新のパッチ版に上げて非推奨の警告を消し、それから 7.2、8.0、8.1 と1つずつ上げる。各段階で bin/rails app:update を実行し、作られた new_framework_defaults のファイルの設定を1つずつ有効にして、全部を有効にしたら config.load_defaults の値を上げてファイルを消す"
    >
      {steps.map((st, i) => {
        const x = 14 + i * 154
        return (
          <g key={st.t}>
            <Box x={x} y={30} w={138} h={50} lines={[st.t, st.s]} fs={11.5} fill={i === 0 ? 'bg' : 'box'} subTone="muted" />
            {i < steps.length - 1 && <Arrow x1={x + 138} y1={55} x2={x + 152} y2={55} />}
          </g>
        )
      })}
      <rect x={322} y={100} width={442} height={84} rx={8} fill="none" stroke="var(--fig-accent)" strokeDasharray="5 4" />
      <T x={334} y={118} fs={11.5} tone="acc">
        各段階でくり返すこと
      </T>
      <T x={334} y={140} fs={11}>
        1. Gemfile のバージョン指定を変えて bundle update rails、テストを通す
      </T>
      <T x={334} y={158} fs={11}>
        2. new_framework_defaults_X_Y.rb の設定を1つずつ有効にしてデプロイ
      </T>
      <T x={334} y={176} fs={11}>
        3. すべて有効にしたら config.load_defaults を X.Y にしてファイルを消す
      </T>
    </Svg>
  )
}

const ch29: Chapter = {
  number: 29,
  part: 12,
  title: 'Rails 7.2→8.x の主な違いとサポート状況',
  summary:
    'バージョン番号（メジャー・マイナー・パッチ）の読み方、セキュリティ修正とサポート期間、load_defaults が選ぶ既定値を確かめてから、Rails 7.2・8.0・8.1 のサポート期間と、2026年11月11日時点の状況を公式の情報から整理します。load_defaults 8.0・8.1 で変わる設定、rails new の既定の変化（Propshaft、Solid Queue・Cache・Cable、Kamal、Thruster、認証のジェネレーター）、本書の各章で見た 7.2 との違い、アップグレードの手順をまとめます。',
  goals: [
    'バージョン番号のメジャー・マイナー・パッチと4つ目の数字の意味を説明し、Gemfile の範囲と Gemfile.lock の違いを説明できる',
    'サポート期間が終わった系列では脆弱性が直らないことを、セキュリティ勧告の例から説明できる',
    'Rails のサポートの方針と、7.2・8.0・8.1 のサポート期間を説明できる',
    'Rails のバージョンと load_defaults の値の違いを説明し、load_defaults 8.0・8.1 で変わる設定を挙げられる',
    'rails new の既定の変化が既存のアプリケーションには自動で入らないことを説明できる',
    'Kamal と Thruster が、ALB と Nginx の構成とどう関係するかを説明できる',
    '1つずつバージョンを上げるアップグレードの手順を説明できる',
  ],
  prerequisites: [],
  sections: [
    {
      id: 'version-numbers',
      title: 'バージョン番号の読み方',
      body: (
        <>
          <p>
            Rails のバージョンは 8.1.4.1 のように点で区切った数字で表します。動いているアプリケーションのバージョンは <code>bin/rails -v</code> で確かめられます。デモのアプリケーションで実行しました。
          </p>
          <Code
            lang="text"
            code={`
$ bin/rails -v
Rails 8.1.4.1
$ bin/rails runner 'p Rails.gem_version.segments'
[8, 1, 4, 1]
`}
          />
          <p>
            左から順に、メジャーバージョン（8）、マイナーバージョン（1）、パッチバージョン（4）で、4つ目の数字（1）はセキュリティ修正のためのバージョンに付きます（図 A-1）。Rails
            のメンテナンスの方針はそれぞれを次のように決めています<Ref n={1} />。
          </p>
          <ul>
            <li>パッチ（8.1.3 → 8.1.4）：バグの修正だけで、新しい機能や API の変更を含まない</li>
            <li>マイナー（8.0 → 8.1）：新しい機能を含み、API が変わることがある。互換性の無い変更は前のバージョンで非推奨の警告を出してから行う</li>
            <li>メジャー（7.2 → 8.0）：マイナーと同じく新しい機能と API の変更を含む。マイナーとの違いは変更の大きさ</li>
            <li>4つ目の数字（8.1.4 → 8.1.4.1）：直前のバージョンに、セキュリティの修正だけを加えたもの</li>
          </ul>
          <p>
            8.0 や 8.1 のように、メジャーとマイナーが同じバージョンの集まりを<Term en="release series">系列</Term>と呼びます。gem を公開するサイトの rubygems.org で、8.1 系列のバージョンを確かめました<Ref n={12} />。
          </p>
          <Code
            lang="text"
            title="rubygems.org の rails の 8.1 系列（公開日。2026-11-16 に確認）"
            code={`
8.1.0    2025-10-22
8.1.1    2025-10-28
8.1.2    2026-01-08
8.1.2.1  2026-03-23
8.1.3    2026-03-24
8.1.3.1  2026-07-29
8.1.4    2026-09-24
8.1.4.1  2026-11-04
`}
          />
          <p>
            アプリケーションが使う Rails のバージョンは Gemfile と Gemfile.lock で決まります。デモの Gemfile の <code>gem "rails", "~&gt; 8.1.4", "&gt;= 8.1.4.1"</code>{' '}
            は、使ってよいバージョンの範囲の指定で、<code>~&gt; 8.1.4</code> は「8.1.4 以上、8.2 未満」を表します<Ref n={13} />。この範囲から実際に選んだバージョンが Gemfile.lock に記録され、デモでは{' '}
            <code>rails (8.1.4.1)</code> でした。範囲の上限が 8.2 未満なので、<code>bundle update rails</code> を実行しても 8.1 系列の中でしか上がりません。
          </p>
          <Figure n="A-1" title="バージョン番号の読み方" caption="Rails の Maintenance Policy と rubygems.org の公開日（2026-11-16 に確認）をもとにした図。">
            <VersionFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'security-support',
      title: 'セキュリティ修正とサポートの終了',
      body: (
        <>
          <p>
            <Term en="vulnerability">脆弱性</Term>は、攻撃する人に、本来できないはずのこと（他人のデータを読む、利用者のブラウザーで任意のスクリプトを動かすなど）を許してしまう不具合です。脆弱性を直す変更をセキュリティ修正と呼びます。Rails
            の開発者は脆弱性を直したバージョンを公開し、その内容を GitHub のセキュリティ勧告で知らせます。
          </p>
          <p>
            2026年11月4日に公開された 8.1.4.1 と 8.0.5.2 は、セキュリティ修正のためのバージョンです。そのうちの1つの勧告 GHSA-gmj8-hvj3-49mw は、Action Pack のセッションの保存方式のうち CookieStore
            以外が、セッションの Cookie に SameSite 属性（ほかのサイトから送られる要求に、その Cookie を付けるかどうかを決める属性）を付けていなかった問題です。影響を受けるのは、8.1 系列の 8.1.4.1 より前のバージョンと、8.0.5.2 より前のすべてのバージョンで、修正されたのは 8.1.4.1
            と 8.0.5.2 です<Ref n={11} />。7.2 系列も影響を受ける範囲に入りますが、修正したバージョンは出ていません。
          </p>
          <p>
            新しいバージョンが公開される期間を<Term en="support period">サポート期間</Term>と呼びます。Rails
            の方針では、マイナーバージョンの各系列は、最初のリリースから1年間はバグの修正を、2年間はセキュリティの修正を受けます。2年を過ぎた系列はサポートの終了（end-of-life、EOL）となり、脆弱性が見つかっても新しいバージョンは出ません。EOL
            の系列を使い続けるなら、修正は自分の責任で行うことになり、方針はサポート中の系列に上げることを勧めています<Ref n={1} />。7.2
            系列のセキュリティ修正の期間は、方針どおりなら 2026年8月9日に終わっています。上の勧告の問題は、7.2 のまま使うアプリケーションでは、自分で直すかサポート中の系列に上げるまで残ります。
          </p>
          <p>
            業務のアプリケーションでは、使っている系列がサポート期間の中にあるかどうかで、次に上げるバージョンと時期を決めます。各系列の期間は『サポートの方針と期間』の節で扱います。
          </p>
        </>
      ),
    },
    {
      id: 'load-defaults-basics',
      title: 'load_defaults が選ぶ既定値',
      body: (
        <>
          <p>
            Rails には、アプリケーションが設定しなかったときに使う値（既定値）があります。新しいバージョンの Rails では既定値をより安全な値や速い値に変えることがあります。ただし、Rails
            を上げただけで既存のアプリケーションの動きが変わらないように、どのバージョンの既定値を使うかを config/application.rb の <code>config.load_defaults</code> で選びます
            <Ref n={5} />。デモの config/application.rb には次の行があります。
          </p>
          <Code
            lang="ruby"
            title="config/application.rb（デモ。24行目とその上のコメント）"
            code={`
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1
`}
          />
          <p>
            コメントのとおり、rails new はアプリケーションを作ったときの Rails のバージョンをこの行に書きます。同じ Rails 8.1.4.1 で、load_defaults に渡す値だけを変えた小さなアプリケーションを起動し、3つの設定の値を比べました。
          </p>
          <Code
            lang="ruby"
            title="defaults.rb（デモの Gemfile の gem で実行）"
            code={`
# 使い方: ruby defaults.rb 7.2
# 同じ Rails で、load_defaults に渡すバージョンだけを変えたアプリケーションを起動し、設定の値を表示する
require "bundler/setup"
require "rails"
require "action_controller/railtie"

class LabApp < Rails::Application
  config.root = __dir__
  config.load_defaults ARGV[0]
  config.eager_load = false
  config.logger = Logger.new(nil)
  config.secret_key_base = "lab"
end
LabApp.initialize!

puts format("Rails %s / load_defaults %s: yjit=%-5s Regexp.timeout=%-4s escape_json_responses=%s",
  Rails.version, ARGV[0], LabApp.config.yjit.inspect, Regexp.timeout.inspect,
  ActionController::Base.escape_json_responses.inspect)
`}
          />
          <Code
            lang="text"
            title="RAILS_ENV=development で 7.2・8.0・8.1 を渡した結果"
            code={`
Rails 8.1.4.1 / load_defaults 7.2: yjit=true  Regexp.timeout=nil  escape_json_responses=true
Rails 8.1.4.1 / load_defaults 8.0: yjit=true  Regexp.timeout=1.0  escape_json_responses=true
Rails 8.1.4.1 / load_defaults 8.1: yjit=false Regexp.timeout=1.0  escape_json_responses=false
`}
          />
          <p>
            Rails は同じ 8.1.4.1 でも、load_defaults 7.2 では Regexp.timeout（正規表現の照合にかける時間の上限）が nil（上限なし）で、8.0 にすると1秒になりました。escape_json_responses（render
            json: の応答で HTML の記号をエスケープするか）と、開発環境の yjit（Ruby の実行を速くする YJIT を有効にするか。<ChapterLink n={22} section="db-memory" />
            ）は、8.1 で false になりました。load_defaults にはメジャーとマイナーまでのバージョンを渡し、そのバージョンまでに変わった既定値がまとめて使われます。次の節では業務のアプリケーションで Rails
            のバージョンと load_defaults の値を確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'check',
      title: '業務のアプリケーションで確かめること',
      body: (
        <>
          <p>この付録を読む前に、業務のアプリケーションで次の2つを確かめます。</p>
          <Code
            lang="bash"
            code={`
$ bin/rails -v                                  # 動いている Rails の版
$ grep -n "load_defaults" config/application.rb  # 既定値の世代
`}
          />
          <p>
            Rails のバージョンを上げても、<code>config.load_defaults</code> の値を変えなければ、設定の既定値は古いバージョンのままです（<ChapterLink n={7} section="app-class" />
            ）。たとえば Rails 8.1 で <code>load_defaults 7.0</code> のアプリケーションは、7.0 までの既定値で動きます。この付録では、バージョンそのものの違い（コードの変更）と、load_defaults
            で選べる既定値の違いを分けて書きます。
          </p>
        </>
      ),
    },
    {
      id: 'support',
      title: 'サポートの方針と期間',
      body: (
        <>
          <p>Rails のメンテナンスの方針は次のとおりです<Ref n={1} />。</p>
          <ul>
            <li>バグ修正：各マイナーバージョン（7.2、8.0 など）の最初のリリースから1年</li>
            <li>セキュリティ修正：最初のリリースから2年。期間が終わると end-of-life（EOL）で、新しいバージョンは出ない</li>
            <li>新機能を含むバージョンはおよそ半年ごとの公開を目指し、1年間新しいバージョンが出なかった場合は、前のバージョンのサポート期間を次のバージョンが出るまで延長する</li>
          </ul>
          <p>2026年11月11日に、rubygems.org の公開日と公式のメンテナンスのページを確かめました。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>バージョン</th>
                  <th>最初の公開（rubygems.org）</th>
                  <th>最新のパッチ</th>
                  <th>バグ修正</th>
                  <th>セキュリティ修正</th>
                  <th>必要な Ruby</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>7.2</td>
                  <td>2024-08-09</td>
                  <td>7.2.4（2026-09-24）</td>
                  <td>2025-08-09 まで（方針から計算）</td>
                  <td>2026-08-09 まで（方針から計算）</td>
                  <td>3.1 以上</td>
                </tr>
                <tr>
                  <td>8.0</td>
                  <td>2024-11-07</td>
                  <td>8.0.5.2（2026-11-04）</td>
                  <td>2026-05-07 まで（ページの記載）</td>
                  <td>2026-11-07 まで（ページの記載）</td>
                  <td>3.2 以上</td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>2025-10-22</td>
                  <td>8.1.4.1（2026-11-04）</td>
                  <td>2026-10-10 まで（ページの記載）</td>
                  <td>2027-10-10 まで（ページの記載）</td>
                  <td>3.2 以上</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            公式のメンテナンスのページに載っている「サポート中の版」は 8.1 と 8.0 だけで、7.2 は載っていません
            <Ref n={2} />。必要な Ruby のバージョンは gem の情報とアップグレードのガイドによります
            <Ref n={3} />。表と図 A-2 から、次のことがわかります。
          </p>
          <ul>
            <li>2026年11月11日の時点で、セキュリティ修正の期間内にあるのは 8.1 だけです。8.0 はページの記載では4日前（11月7日）に終わっています。</li>
            <li>
              7.2 は方針どおりなら 2026年8月9日でセキュリティ修正も終わっていますが、その後の 2026年9月24日に 7.2.4 が公開されています。GitHub のリリースの説明を見ると、内容はバグ修正だけで、期間外に公開された理由は書かれていません
              <Ref n={4} />。今後も 7.2 の新しいバージョンが出ると期待はできません。
            </li>
            <li>
              8.1 の期限は、ページでは10月10日起点になっていますが、gem の公開は10月22日でした。また、8.1 のバグ修正の期限（2026年10月10日）は過ぎていますが、8.2 はまだ公開されていません。方針の「1年間新しい版が出なければ延長する」が当てはまる状況ですが、延長後の期限はページに書かれていません。
            </li>
          </ul>
          <Figure n="A-2" title="サポート期間" caption="Rails の Maintenance Policy（rubyonrails.org、2026-11-11 に確認）と rubygems.org の公開日をもとにした図。7.2 の期限は方針から計算した値。">
            <SupportFigure />
          </Figure>
          <Callout kind="warn" title="期限の数字の扱い">
            <p>
              サポートの期限は、公式のページで更新されます。この付録の数字は 2026年11月11日に確かめたものです。業務で判断するときは、その時点の rubyonrails.org/maintenance を確かめます。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'load-defaults',
      title: 'load_defaults 8.0・8.1 で変わる設定',
      body: (
        <>
          <p>railties の configuration.rb の <code>load_defaults</code> には、バージョンごとに変わる設定が並んでいます。8.0 と 8.1 の部分は次のとおりです。</p>
          <Code
            lang="ruby"
            title="railties/lib/rails/application/configuration.rb（335〜367行目）"
            href={`${GH}/railties/lib/rails/application/configuration.rb#L335-L367`}
            code={`
        when "8.0"
          load_defaults "7.2"

          if respond_to?(:action_dispatch)
            action_dispatch.strict_freshness = true
          end

          Regexp.timeout ||= 1 if Regexp.respond_to?(:timeout=)
        when "8.1"
          load_defaults "8.0"

          # Development and test environments tend to reload code and
          # redefine methods (e.g. mocking), hence YJIT isn't generally
          # faster in these environments.
          self.yjit = !Rails.env.local?

          if respond_to?(:action_controller)
            action_controller.escape_json_responses = false
            action_controller.action_on_path_relative_redirect = :raise
          end

          if respond_to?(:active_record)
            active_record.raise_on_missing_required_finder_order_columns = true
          end

          if respond_to?(:active_support)
            active_support.escape_js_separators_in_json = false
          end

          if respond_to?(:action_view)
            action_view.render_tracker = :ruby
            action_view.remove_hidden_field_autocomplete = true
          end
`}
          />
          <p>各設定の意味は、設定のガイドと 8.1 の new_framework_defaults のファイルの説明によります<Ref n={5} /><Ref n={6} />。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>バージョン</th>
                  <th>設定</th>
                  <th>変わること</th>
                  <th>関係する章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>8.0</td>
                  <td>
                    <code>action_dispatch.strict_freshness = true</code>
                  </td>
                  <td>応答に ETag と Last-Modified の両方があるとき、ETag だけで鮮度を判断する（RFC 7232）。fresh_when は両方を付ける</td>
                  <td>
                    <ChapterLink n={22} section="http-cache" />
                  </td>
                </tr>
                <tr>
                  <td>8.0</td>
                  <td>
                    <code>Regexp.timeout = 1</code>
                  </td>
                  <td>正規表現の照合が1秒を超えたら例外にする（Ruby 3.2 以上。照合に時間のかかる入力による攻撃への対策）</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>yjit = !Rails.env.local?</code>
                  </td>
                  <td>開発環境とテスト環境以外で YJIT を有効にする（7.2 では全環境で true）</td>
                  <td>
                    <ChapterLink n={22} section="db-memory" />
                  </td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>action_controller.escape_json_responses = false</code>
                  </td>
                  <td>render json: で HTML の記号などをエスケープしない</td>
                  <td>
                    <ChapterLink n={21} section="xss" />
                  </td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>action_controller.action_on_path_relative_redirect = :raise</code>
                  </td>
                  <td>
                    <code>redirect_to "example.com"</code> のような先頭が / でない相対の URL を例外にする（オープンリダイレクトの対策）
                  </td>
                  <td>
                    <ChapterLink n={21} />
                  </td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>active_record.raise_on_missing_required_finder_order_columns = true</code>
                  </td>
                  <td>並び順の列（主キーなど）が無いモデルで、order の無い first などを例外にする</td>
                  <td>
                    <ChapterLink n={12} />
                  </td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>active_support.escape_js_separators_in_json = false</code>
                  </td>
                  <td>JSON で U+2028・U+2029 をエスケープしない</td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>action_view.render_tracker = :ruby</code>
                  </td>
                  <td>テンプレートの依存関係（キャッシュのダイジェストに使う）を Ruby のパーサーで調べる</td>
                  <td>
                    <ChapterLink n={22} section="fragment" />
                  </td>
                </tr>
                <tr>
                  <td>8.1</td>
                  <td>
                    <code>action_view.remove_hidden_field_autocomplete = true</code>
                  </td>
                  <td>ヘルパーが作る hidden の input に autocomplete="off" を付けない</td>
                  <td>
                    <ChapterLink n={16} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>escape_json_responses の影響を、デモのアプリケーション（load_defaults 8.1）で確かめました。</p>
          <Code
            lang="text"
            code={`
load_defaults=8.1
escape_json_responses=false
render json:  "{\\"s\\":\\"</script><script>&\\u2028\\"}"
to_json:      "{\\"s\\":\\"\\\\u003c/script\\\\u003e\\\\u003cscript\\\\u003e\\\\u0026\\u2028\\"}"
Regexp.timeout=1.0 strict_freshness=true yjit=false
`}
          />
          <p>
            <code>render json:</code> の応答では <code>{'</script>'}</code> がそのまま出力され、<code>to_json</code> では <code>{'\\u003c'}</code> などに変わりました。<ChapterLink n={21} section="xss" />
            で見たとおり、ビューの <code>{'<script>'}</code> の中に埋め込む JSON は <code>to_json</code> で作るので影響はありませんが、JSON の応答を HTML に埋め込んで使っているコードがあれば、8.1 の既定にする前に確かめます。
          </p>
          <Callout kind="v72">
            <p>
              Rails 7.2.4 の <code>load_defaults "7.2"</code> には、<code>active_job.enqueue_after_transaction_commit = :default</code> がありました。8.1 ではこの設定が削除され、ジョブのクラスごとの設定（既定は
              false）になっています。7.2 の既定のまま Sidekiq を使っていたアプリケーションでは、8.1 に上げるとトランザクションの中の投入の時刻が変わります（<ChapterLink n={18} section="transaction" />
              ）。
            </p>
          </Callout>
        </>
      ),
    },
    {
      id: 'new-app',
      title: 'rails new の既定の変化',
      body: (
        <>
          <p>
            Rails 8.0 のリリースノートは、主な変更として Kamal 2、Thruster、Solid Cable、Solid Cache、Solid Queue、Propshaft の既定化、認証のジェネレーターを挙げています
            <Ref n={7} />。rails new が作る Gemfile のテンプレートを 7.2.4 と 8.1.4.1 で比べると、次の行が増えていました（7.2.4 にだけあった Ruby 3.2 未満向けの行は消えています）。
          </p>
          <Code
            lang="text"
            code={`
> gem "solid_cache"
> gem "solid_queue"
> gem "solid_cable"                  （ActionCable を使う場合）
> gem "kamal", require: false
> gem "thruster", require: false
> gem "image_processing", "~> 1.2"
>   gem "bundler-audit", require: false   （development・test）
`}
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>項目</th>
                  <th>7.2 の rails new</th>
                  <th>8.1 の rails new</th>
                  <th>章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>アセット</td>
                  <td>Sprockets（--asset-pipeline の既定）</td>
                  <td>Propshaft</td>
                  <td>
                    <ChapterLink n={16} section="assets" />
                  </td>
                </tr>
                <tr>
                  <td>ジョブのバックエンド（本番）</td>
                  <td>指定なし（設定はコメント）</td>
                  <td>Solid Queue</td>
                  <td>
                    <ChapterLink n={18} section="solid-queue" />
                  </td>
                </tr>
                <tr>
                  <td>キャッシュストア（本番）</td>
                  <td>設定はコメント</td>
                  <td>Solid Cache</td>
                  <td>
                    <ChapterLink n={22} section="rails-cache" />
                  </td>
                </tr>
                <tr>
                  <td>デプロイ</td>
                  <td>Dockerfile（CMD は rails server）</td>
                  <td>Kamal（config/deploy.yml）、Dockerfile の CMD は thrust 経由</td>
                  <td>次節</td>
                </tr>
                <tr>
                  <td>認証</td>
                  <td>なし</td>
                  <td>
                    <code>bin/rails generate authentication</code>（8.0 から）
                  </td>
                  <td>—</td>
                </tr>
                <tr>
                  <td>検査</td>
                  <td>brakeman</td>
                  <td>brakeman・bundler-audit・config/ci.rb</td>
                  <td>
                    <ChapterLink n={21} section="tools" />
                  </td>
                </tr>
                <tr>
                  <td>config/puma.rb</td>
                  <td colSpan={2}>同じ（スレッド3、ワーカーは WEB_CONCURRENCY）</td>
                  <td>
                    <ChapterLink n={23} section="sizing" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            これらは新しく作るアプリケーションの既定です。既存のアプリケーションの Rails を 8.1 に上げても、Sprockets が Propshaft に、Sidekiq が Solid Queue
            に置き換わることはありません。<code>bin/rails app:update</code> は設定ファイルの差分を対話的に示しますが、Gemfile のライブラリは変えません。使うかどうかは、それぞれ別に判断します。
          </p>
        </>
      ),
    },
    {
      id: 'kamal-thruster',
      title: 'Kamal と Thruster の位置付け',
      body: (
        <>
          <p>
            Kamal はデプロイのためのツールです。README によると、Docker のコンテナとして動くアプリケーションを、SSH でつないだサーバーに配置し、kamal-proxy でコンテナを切り替えて停止時間なしに入れ替えます
            <Ref n={8} />。Thruster は Puma の前で動く HTTP/2 のプロキシで、README は、HTTP/2、Let's Encrypt による TLS の証明書の自動の取得、公開アセットの HTTP キャッシュ、X-Sendfile と圧縮を機能として挙げています
            <Ref n={9} />。8.1 の rails new が作る Dockerfile は、Thruster の上で Puma を起動します。
          </p>
          <Code
            lang="text"
            title="railties/lib/rails/generators/rails/app/templates/Dockerfile.tt（128〜130行目）"
            href={`${GH}/railties/lib/rails/generators/rails/app/templates/Dockerfile.tt#L128-L130`}
            code={`
# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 80
CMD ["./bin/thrust", "./bin/rails", "server"]
`}
          />
          <p>
            本書が扱った ALB と Nginx の構成と比べると、Thruster は<ChapterLink n={24} />の Nginx の役割（アセットの配信とキャッシュのヘッダー、圧縮）の一部を、1つのコンテナの中で受け持ちます。kamal-proxy
            は、コンテナの入れ替えとヘルスチェック（/up）を受け持ちます。すでに ALB と Nginx で運用している構成では、これらに置き換える必要はありません。新しく小さな構成を作る場合や、コンテナにまとめたい場合に選べる方法です。
          </p>
          <p>
            実際の配備手順は、<ChapterLink n={32} />の<span id="capistrano-deploy"><ChapterLink n={32} section="capistrano-deploy">Capistrano でのリリース切り替え</ChapterLink></span>と<span id="container-deploy"><ChapterLink n={32} section="container-deploy">Kamal でのコンテナの配備</ChapterLink></span>で確認できます。
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      title: '本書の各章で見た 7.2 との違い',
      body: (
        <>
          <p>各章の「Rails 7.2 との違い」の枠の内容を、アップグレードのときに影響が出やすい順にまとめます。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>違い</th>
                  <th>バージョン</th>
                  <th>影響</th>
                  <th>章</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>enqueue_after_transaction_commit のアプリケーション全体の設定と3値の削除</td>
                  <td>8.1</td>
                  <td>トランザクションの中でジョブを投入する時刻が変わる</td>
                  <td>
                    <ChapterLink n={14} section="after-commit" />・<ChapterLink n={18} section="transaction" />
                  </td>
                </tr>
                <tr>
                  <td>存在しないコントローラーを指すルートが 404 ではなく 500</td>
                  <td>8.1</td>
                  <td>エラーの監視の分類が変わる</td>
                  <td>
                    <ChapterLink n={9} section="dispatch" />
                  </td>
                </tr>
                <tr>
                  <td>Rails 本体の sidekiq のアダプターが非推奨（Sidekiq 7.3.3 以上の gem のアダプターを使う）</td>
                  <td>8.1</td>
                  <td>Sidekiq のバージョンによっては警告が出る</td>
                  <td>
                    <ChapterLink n={18} section="sidekiq" />
                  </td>
                </tr>
                <tr>
                  <td>database.yml の pool が max_connections に改名（pool も読まれる）</td>
                  <td>8.1</td>
                  <td>設定の名前。min_connections などが追加</td>
                  <td>
                    <ChapterLink n={15} section="pool" />
                  </td>
                </tr>
                <tr>
                  <td>ImageMagick にセキュリティの設定を適用</td>
                  <td>8.1 の系列</td>
                  <td>独自の形式の変換が失敗することがある</td>
                  <td>
                    <ChapterLink n={19} section="variants" />
                  </td>
                </tr>
                <tr>
                  <td>params.expect の追加</td>
                  <td>8.0</td>
                  <td>require と permit より安全な書き方が使える</td>
                  <td>
                    <ChapterLink n={10} section="params" />
                  </td>
                </tr>
                <tr>
                  <td>silence_healthcheck_path（/up のログの抑制）、LazyRouteSet</td>
                  <td>8.0</td>
                  <td>/up のログの量、開発環境の起動</td>
                  <td>
                    <ChapterLink n={6} />・<ChapterLink n={25} section="health" />
                  </td>
                </tr>
                <tr>
                  <td>only_columns、Relation の model（klass は別名）、関連の deprecated: オプション</td>
                  <td>8.1</td>
                  <td>新しい書き方が使える。既存のコードはそのまま動く</td>
                  <td>
                    <ChapterLink n={11} />・<ChapterLink n={12} />・<ChapterLink n={13} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Rails 本体の sidekiq のアダプターは、8.1.4.1 の activejob で「Rails 8.2 で削除する。Sidekiq 7.3.3 以上の gem のアダプターを使う」という非推奨の警告を出します
            <Ref n={10} />。Sidekiq の gem が 7.3.3 以上なら、gem 側のアダプターが Rails のものを置き換えるので警告は出ません（<ChapterLink n={18} section="sidekiq" />
            ）。この表以外の、ビューの描画、ActiveRecord の読み込み、テストのトランザクション、セキュリティの仕組み、ActionCable の処理などは、各章で 7.2.4 のソースと比べて同じであることを確かめています。
          </p>
        </>
      ),
    },
    {
      id: 'upgrade',
      title: 'アップグレードの手順',
      body: (
        <>
          <p>アップグレードのガイドは、次の手順を勧めています<Ref n={3} />。</p>
          <ol>
            <li>テストを用意して通す（テストの範囲が狭ければ、変わった部分を手で確かめる必要がある）</li>
            <li>Ruby と Rails は別々に上げる。先に Ruby を上げられるところまで上げる</li>
            <li>今のバージョンの最新のパッチ版に上げ、テストと非推奨の警告を直す</li>
            <li>次のマイナーバージョンの最新のパッチ版に上げる。これを1つずつくり返す</li>
            <li>
              各段階で <code>bin/rails app:update</code> を実行し、作られた <code>config/initializers/new_framework_defaults_X_Y.rb</code> の設定を1つずつ有効にする。すべて有効にしたら{' '}
              <code>config.load_defaults</code> を X.Y にしてファイルを消す
            </li>
          </ol>
          <p>
            業務のアプリケーションが 7.x のどこかで、Ruby が 3.2 未満なら、まず Ruby を 3.2 以上にします。そのうえで 7.2 → 8.0 → 8.1 と進めます（図 A-3）。8.0 から 8.1 への変更点としてガイドに挙げられているのは、schema.rb
            の列がアルファベット順に並ぶようになったことです。ただし、この並べ替えは 8.1.4 で取り消されました
            <Ref n={14} />。本書の基準の 8.1.4.1 では、schema.rb の列はマイグレーションで追加した順に並びます。8.1.0〜8.1.3 で schema.rb を書き出すと列がアルファベット順に並ぶので、その版を経由して上げる場合は、schema.rb の差分がいったん大きくなります。
          </p>
          <Figure n="A-3" title="アップグレードの順" caption="Upgrading Ruby on Rails（ガイド）の手順をもとにした図。">
            <UpgradeFigure />
          </Figure>
          <p>
            本番で Ruby を更新するときは、新版の Ruby で Puma を起動して要求を渡します。転送先を替えながら稼働を続ける具体例は
            <ChapterLink n={23} section="ruby-upgrade">Ruby 更新時の Puma とトラフィックの切り替え</ChapterLink>を参照してください。
          </p>
          <p>
            第5部の構成（Puma・Nginx・ALB）は Rails のバージョンとは独立しています。Puma と Nginx は、それぞれの gem・パッケージのバージョンに対応する説明書に従って確かめます（<ChapterLink n={23} />・
            <ChapterLink n={24} section="upstream" />
            ）。
          </p>
        </>
      ),
    },
    {
      id: 'dual-boot',
      title: "アップグレード前後を同じコードで確かめる",
      body: (
        <>
          <p>
            Rails の版を上げるとき、アプリのコードを共通にし、依存を選んで現行版と次の版の両方を起動する方法を dual boot と呼びます。たとえば <code>Gemfile.next</code> とそのロックファイルを用意し、次の版で使う入口を CI に足せます。既存のロックファイルを切り替えずに両方を並べられるので、テストの差で依存更新の影響が見えます。Bootboot のように分岐を管理する方法もあります。<Ref n={15} /><Ref n={3} />
          </p>
          <Code
            lang="bash"
            title={"テスト用 DB を準備した環境での実行例"}
            code={`
bundle exec rspec
BUNDLE_GEMFILE=Gemfile.next bundle install
BUNDLE_GEMFILE=Gemfile.next bundle exec rspec
`}
          />
          <p>
            現行版の非推奨警告から直し、次の版で発生した差を小さく確認します。<code>bin/rails app:update</code> で提示される設定にはアプリ固有の変更もあるので、差分ごとに採用します。既定値の切り替え、Rails gem の更新、Ruby の入れ替えを別々の変更として検証すると、問題が出たときに戻す対象がわかります。一部へ配備している間も残る構成でピーク時の要求を処理できるか確かめ、対象を広げる前に新旧のエラーや応答を比べます（<ChapterLink n={23} section="ruby-upgrade">新しい Ruby での切り替え</ChapterLink>）。<Ref n={3} />
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>8.1.4.1 はメジャー 8・マイナー 1・パッチ 4 で、4つ目の数字はセキュリティ修正だけのバージョンです。サポート期間を過ぎた系列には、脆弱性が見つかっても修正したバージョンが出ません。</li>
          <li>load_defaults は、どのバージョンの既定値を使うかを選ぶ設定で、同じ Rails でも値によって設定の値が変わります。</li>
          <li>Rails はバグ修正が1年、セキュリティ修正が2年です。2026年11月11日の時点で、セキュリティ修正の期間内にあるのは 8.1 だけです。</li>
          <li>7.2 は公式のページのサポート中の一覧に無く、2026年9月の 7.2.4 はバグ修正だけのバージョンです。今後の新しいバージョンは期待できません。</li>
          <li>バージョンを上げても、load_defaults を上げなければ既定値は変わりません。8.0 と 8.1 の load_defaults で変わる設定は合わせて9つで、render json: のエスケープや相対の URL へのリダイレクトなどが含まれます。</li>
          <li>Propshaft、Solid Queue・Cache・Cable、Kamal、Thruster は新しく作るアプリケーションの既定で、既存のアプリケーションには自動で入りません。</li>
          <li>アップグレードは Ruby を先に上げ、Rails は最新のパッチ版を経由して1つずつ上げ、new_framework_defaults のファイルで既定値を1つずつ切り替えます。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Maintenance Policy for Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/maintenance_policy.html', accessed: '2026-11-11', version: '—', note: 'バグ修正1年・セキュリティ修正2年、EOL、1年間新しいバージョンが出なければ延長すること。' },
    { title: 'Ruby on Rails Maintenance Policy', publisher: 'rubyonrails.org', url: 'https://rubyonrails.org/maintenance', accessed: '2026-11-11', version: '—', note: 'サポート中のバージョンの一覧（8.1・8.0）と期限。' },
    { title: 'Upgrading Ruby on Rails', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/upgrading_ruby_on_rails.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '必要な Ruby のバージョン、1つずつ上げる手順、app:update と new_framework_defaults、8.0→8.1 の schema.rb の列の並び。' },
    { title: 'Release 7.2.4', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/releases/tag/v7.2.4', accessed: '2026-11-11', version: 'Rails 7.2.4', note: '2026-09-24 公開、内容はバグ修正。' },
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/configuring.html', accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'load_defaults のバージョンごとの既定値と、各設定の説明。' },
    { title: 'railties/lib/rails/generators/rails/app/templates/config/initializers/new_framework_defaults_8_1.rb.tt', publisher: 'rails/rails（GitHub）', url: `${GH}/railties/lib/rails/generators/rails/app/templates/config/initializers/new_framework_defaults_8_1.rb.tt`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: '8.1 の新しい既定値の説明と例。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-11', version: 'Rails 8.0', note: 'Kamal 2、Thruster、Solid Cable・Cache・Queue、Propshaft の既定化、認証のジェネレーター。' },
    { title: 'Kamal README', publisher: 'basecamp/kamal（GitHub）', url: 'https://github.com/basecamp/kamal/blob/v2.12.0/README.md', accessed: '2026-11-11', version: 'Kamal 2.12.0', note: 'コンテナのアプリケーションを SSH でサーバーに配置し、kamal-proxy で停止時間なしに切り替えること。' },
    { title: 'Thruster README', publisher: 'basecamp/thruster（GitHub）', url: 'https://github.com/basecamp/thruster/blob/v0.1.27/README.md', accessed: '2026-11-11', version: 'Thruster 0.1.27', note: 'HTTP/2、Let\'s Encrypt、公開アセットのキャッシュ、X-Sendfile と圧縮、Puma のプロセスの管理。' },
    { title: 'activejob/lib/active_job/queue_adapters/sidekiq_adapter.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activejob/lib/active_job/queue_adapters/sidekiq_adapter.rb`, accessed: '2026-11-11', version: 'Rails 8.1.4.1', note: 'Rails 本体の sidekiq のアダプターが Rails 8.2 で削除される予定という非推奨の警告。' },
    { title: 'Action Pack: Missing SameSite attribute on session cookies from Action Pack session stores（GHSA-gmj8-hvj3-49mw）', publisher: 'rails/rails（GitHub Security Advisories）', url: 'https://github.com/rails/rails/security/advisories/GHSA-gmj8-hvj3-49mw', accessed: '2026-11-16', version: 'Rails 8.1.4.1・8.0.5.2', note: '影響を受けるバージョン（8.1.0.beta1 以上 8.1.4.1 未満、8.0.5.2 未満）と修正されたバージョン。問題の内容は actionpack 8.1.4.1 の CHANGELOG でも確認。' },
    { title: 'rails versions', publisher: 'rubygems.org', url: 'https://rubygems.org/gems/rails/versions', accessed: '2026-11-16', version: '—', note: '8.1 系列の各バージョンの公開日（rubygems.org の API で確認）。' },
    { title: 'Gemfile Reference', publisher: 'RubyGems Guides', url: 'https://guides.rubygems.org/gemfile/', accessed: '2026-11-16', version: '—', note: '~> の範囲（~> 2.0.3 は 2.0.3 以上 2.1 未満）。' },
    { title: 'activerecord CHANGELOG（Rails 8.1.4）', publisher: 'rails/rails（GitHub）', url: 'https://github.com/rails/rails/blob/v8.1.4.1/activerecord/CHANGELOG.md', accessed: '2026-11-16', version: 'Rails 8.1.4.1', note: '8.1.0 で入った schema.rb の列のアルファベット順の並べ替えを、8.1.4 で取り消したこと。' },
    { title: "Bootboot", publisher: "Shopify/bootboot", url: "https://github.com/Shopify/bootboot", accessed: "2026-11-20", note: "依存を切り替えて同じアプリを複数の版で動かす。" },
  ],
}

export default withExplanations(ch29, explanation29)
