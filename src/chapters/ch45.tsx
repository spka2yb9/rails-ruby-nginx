import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'

/* ---------- 図 98-1 副作用の位置 ---------- */
function SideEffectsFigure() {
  const before: [string, boolean][] = [
    ['plan を読む（SELECT plans）', true],
    ['Date.today を読む', true],
    ['日数と日割りの額を計算する', false],
    ['update!・charges.create!', true],
    ['PaymentGateway#charge（HTTP）', true],
  ]
  return (
    <Svg
      id="98-1"
      w={780}
      h={372}
      label="適用前は、Subscription#change_plan! の中で、プランの読み込み、Date.today の読み取り、日数と日割りの額の計算、保存、決済の呼び出しが順に並び、計算が副作用の間にある。適用後は、ChangePlan が値を読み込み、PlanChange.decide が判断を Data で返し、ChangePlan がその判断に従って保存と決済を行う"
    >
      <T x={20} y={20} bold>
        適用前：Subscription#change_plan!
      </T>
      {before.map(([label, effect], i) => (
        <Box key={label} x={20} y={38 + i * 48} w={300} h={36} lines={label} fs={12} fill={effect ? 'box4' : 'box'} accent={!effect} bold={!effect} />
      ))}
      {before.slice(0, -1).map((_, i) => (
        <Arrow key={i} x1={170} y1={74 + i * 48} x2={170} y2={84 + i * 48} />
      ))}
      <T x={20} y={296} fs={12} tone="danger">
        計算が DB・時計・決済の間にある
      </T>
      <T x={20} y={316} fs={12} tone="muted">
        額を確かめるには DB・travel_to・WebMock が要る
      </T>

      <line x1={350} y1={10} x2={350} y2={330} stroke="var(--fig-line)" />

      <T x={370} y={20} bold>
        適用後：ChangePlan（シェル）と PlanChange（コア）
      </T>
      <Box x={370} y={38} w={390} h={56} lines={['ChangePlan：読み込む（副作用）', 'subscription.plan・new_plan・Date.current']} fs={12} fill="box4" bold subTone="muted" />
      <Arrow x1={565} y1={94} x2={565} y2={128} />
      <T x={575} y={112} fs={11} tone="muted">
        値を渡す
      </T>
      <Box
        x={370}
        y={130}
        w={390}
        h={74}
        lines={['PlanChange.decide（純粋な関数）', '金額・日付・真偽値 → 判断の Data', 'UpgradeNow・DowngradeAtPeriodEnd・Rejected']}
        fs={12}
        accent
        bold
        subTone="muted"
      />
      <Arrow x1={565} y1={204} x2={565} y2={238} dashed />
      <T x={575} y={222} fs={11} tone="muted">
        判断（Data）が返る
      </T>
      <Box x={370} y={240} w={390} h={56} lines={['ChangePlan：判断に従って書き込む（副作用）', 'case/in → update!・charges.create!・決済']} fs={12} fill="box4" bold subTone="muted" />
      <T x={20} y={356} fs={12} tone="muted">
        色付きの箱は外部とのやり取り（副作用）、強調の枠は計算と判断
      </T>
    </Svg>
  )
}

/* ---------- 図 98-2 コアとシェルの配置 ---------- */
function CoreShellFigure() {
  return (
    <Svg
      id="98-2"
      w={780}
      h={300}
      label="中心に純粋な関数のコア PlanChange（decide と prorate）があり、その周りをシェル ChangePlan が囲む。シェルの外に、MySQL、時計（Date.current と config.time_zone）、決済サービス、呼び出し元のコントローラーやジョブがある。外部とやり取りするのはシェルだけで、コアは値を受け取って値を返す"
    >
      <rect x={160} y={24} width={460} height={248} rx={110} fill="var(--fig-box)" stroke="var(--fig-line)" />
      <rect x={280} y={96} width={220} height={110} rx={50} fill="var(--fig-bg)" stroke="var(--fig-accent)" strokeWidth={2} />
      <T x={390} y={52} anchor="middle" bold>
        シェル（ChangePlan）
      </T>
      <T x={390} y={124} anchor="middle" bold>
        コア（PlanChange）
      </T>
      <T x={390} y={150} anchor="middle" fs={12} mono>
        decide
      </T>
      <T x={390} y={172} anchor="middle" fs={12} mono>
        prorate
      </T>
      <T x={390} y={240} anchor="middle" fs={12} tone="muted">
        読み込み → コアを呼ぶ → 判断に従って書き込む
      </T>
      <Box x={10} y={54} w={136} h={48} lines={['MySQL', 'plans・subscriptions']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={10} y={196} w={136} h={48} lines={['時計', 'Date.current（Tokyo）']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={634} y={54} w={136} h={48} lines={['決済サービス', 'PaymentGateway']} fs={12} fill="box4" bold subTone="muted" />
      <Box x={634} y={196} w={136} h={48} lines={['呼び出し元', 'コントローラー・ジョブ']} fs={12} bold subTone="muted" />
      <Arrow x1={196} y1={86} x2={148} y2={80} />
      <Arrow x1={196} y1={212} x2={148} y2={218} />
      <Arrow x1={584} y1={86} x2={632} y2={80} />
      <Arrow x1={632} y1={218} x2={584} y2={212} />
      <T x={390} y={290} anchor="middle" fs={12} tone="muted">
        外部とやり取りするのはシェルだけ。コアは値を受け取り、値を返す
      </T>
    </Svg>
  )
}

/* ---------- 図 98-3 日割りの計算の例 ---------- */
function ProrationFigure() {
  const x0 = 70
  const x1 = 690
  const day = (n: number) => x0 + ((x1 - x0) * n) / 30
  return (
    <Svg
      id="98-3"
      w={780}
      h={286}
      label="請求期間は11月1日から12月1日の前日までの30日。11月21日にベーシック（月額1,000円）からプロ（月額3,000円）に変更すると、残りは11月21日から30日までの10日。差額2,000円に30分の10を掛けると666.66…円で、1円未満を切り捨てて666円を請求する。日本時間の11月21日8時に UTC の Date.today を使うと11月20日になり、残りを11日として733円を請求してしまう"
    >
      <line x1={x0} y1={90} x2={x1} y2={90} stroke="var(--fig-line)" strokeWidth={2} />
      <rect x={day(20)} y={78} width={day(30) - day(20)} height={24} fill="var(--fig-box5)" stroke="var(--fig-accent)" />
      {[0, 20, 30].map((n) => (
        <line key={n} x1={day(n)} y1={78} x2={day(n)} y2={102} stroke="var(--fig-line)" strokeWidth={2} />
      ))}
      <T x={day(0)} y={60} anchor="middle" fs={12}>
        11/1（期間の初日）
      </T>
      <T x={day(20)} y={60} anchor="middle" fs={12} tone="acc">
        11/21（変更した日）
      </T>
      <T x={day(30)} y={60} anchor="middle" fs={12}>
        12/1（次の請求日）
      </T>
      <T x={(day(0) + day(20)) / 2} y={120} anchor="middle" fs={12} tone="muted">
        使い終わった20日
      </T>
      <T x={(day(20) + day(30)) / 2} y={120} anchor="middle" fs={12} tone="acc">
        残り10日
      </T>
      <T x={390} y={152} anchor="middle" fs={13}>
        (3,000円 − 1,000円) × 10日 ÷ 30日 = 666.66…円 → 切り捨てて 666円
      </T>
      <line x1={x0} y1={208} x2={x1} y2={208} stroke="var(--fig-line)" strokeWidth={1} strokeDasharray="4 4" />
      <rect x={day(19)} y={198} width={day(30) - day(19)} height={20} fill="var(--fig-box5)" stroke="var(--fig-line)" strokeDasharray="4 3" />
      <line x1={day(19)} y1={194} x2={day(19)} y2={222} stroke="var(--fig-line)" strokeWidth={2} />
      <T x={day(19)} y={184} anchor="middle" fs={12} tone="danger">
        11/20
      </T>
      <T x={390} y={244} anchor="middle" fs={12} tone="danger">
        日本時間 11/21 8:00 に UTC の Date.today を使うと 11/20 になり、残り11日 → 733円
      </T>
      <T x={390} y={268} anchor="middle" fs={12} tone="muted">
        期間の終わりの日（次の請求日）は期間に含めない
      </T>
    </Svg>
  )
}

/* ---------- 図 98-4 コアとシェルのテストの分担 ---------- */
function TestSplitFigure() {
  const cols = [
    { x: 20, w: 150, head: '対象' },
    { x: 174, w: 250, head: '確かめること' },
    { x: 428, w: 170, head: '使うもの' },
    { x: 602, w: 158, head: '件数と実行時間' },
  ]
  const rows: { cells: string[][]; fill: 'box' | 'box4' | 'bg'; tone?: 'muted' }[] = [
    {
      cells: [['コア', 'PlanChange'], ['判断の種類・期間の境界・月の日数', '1,096日すべての日割りの性質'], ['日付と整数だけ', 'DB なし・Rails なし'], ['10件', '0.017秒（読み込み 0.07秒）']],
      fill: 'box',
    },
    {
      cells: [['シェル', 'ChangePlan', 'コントローラー'], ['判断に従った保存と決済・文言', '既定の today が日本時間の今日か'], ['MySQL・WebMock', 'travel_to'], ['4件', '0.16秒（読み込み 0.9秒）']],
      fill: 'box4',
    },
    {
      cells: [['使う前のテスト', 'change_plan!'], ['日割りの額（5つの日付）'], ['MySQL・WebMock', 'travel_to'], ['5件', '0.18秒（読み込み 0.9秒）']],
      fill: 'bg',
      tone: 'muted',
    },
  ]
  return (
    <Svg
      id="98-4"
      w={780}
      h={236}
      label="テストの分担。コア PlanChange のテストは、判断の種類・期間の境界・月の日数と、1,096日すべての日割りの性質を、日付と整数だけで確かめ、DB も Rails も読み込まない。10件が0.017秒、読み込みは0.07秒。シェル ChangePlan とコントローラーのテストは、判断に従った保存と決済と文言、既定の today が日本時間の今日かを、MySQL・WebMock・travel_to を使って4件で確かめ、0.16秒、読み込み0.9秒。パターンを使う前のテストは、日割りの額を5つの日付で確かめるのに MySQL・WebMock・travel_to が必要で、0.18秒、読み込み0.9秒"
    >
      {cols.map((c) => (
        <T key={c.head} x={c.x + c.w / 2} y={18} anchor="middle" fs={12} bold>
          {c.head}
        </T>
      ))}
      {rows.map((r, i) => (
        <g key={i}>
          {r.cells.map((lines, j) => (
            <Box key={j} x={cols[j].x} y={34 + i * 62} w={cols[j].w} h={54} lines={lines} fs={12} fill={r.fill} bold={j === 0} subTone="muted" dashed={r.tone === 'muted'} />
          ))}
        </g>
      ))}
      <T x={20} y={226} fs={12} tone="muted">
        実行時間は bundle exec rspec の Finished の行（Rails 8.1.4.1・MySQL 8.4・Ruby 4.0.9。環境で変わる）
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 45,
  part: 9,
  title: 'Functional Core, Imperative Shell：プラン変更の日割り計算を副作用から分ける',
  summary:
    'サブスクリプションのプラン変更を例に、日割りの計算と「値上げか値下げか」の判断を、DB・時刻・決済を使わないモジュール PlanChange（コア）に分け、読み込みと書き込みを ChangePlan（シェル）に集めます。今日の日付とタイムゾーンをシェルで決めて引数で渡し、コアのテストが DB なしで速く動くことと、シェルの少数の統合テストを確かめます。',
  goals: [
    '純粋な関数と副作用の意味を説明し、Rails のコードの中の副作用（SQL・現在時刻・HTTP）を見分けられる',
    '計算と副作用が混ざったモデルのメソッドを、コア（判断）とシェル（読み込みと書き込み）に分けられる',
    '判断の結果を Data.define の値で返し、シェルが case/in で書き込みを選ぶ形に書ける',
    'Date.today・Date.current・Time.zone.today の違いを説明し、「今日」をどのタイムゾーンで決めるかをシェルで明示できる',
    'コアのテストを DB なしの表と性質で書き、シェルは少数の統合テストで確かめる分担を説明できる',
    'モデルのメソッド・コールバック・Use Case と比べて、コアとシェルに分けるかを判断できる',
  ],
  prerequisites: [20, 44],
  sections: [
    {
      id: 'scene',
      title: 'プラン変更の日割り請求が、日本時間の朝だけ多くなる',
      body: (
        <>
          <p>
            この章では、月額で使うサービスの契約のプラン変更を例にします。このような定期の契約を<Term en="subscription">サブスクリプション</Term>
            と呼びます。会員は月額1,000円のベーシックか、月額3,000円のプロのどちらかを契約しています。料金は月ごとの請求期間に対して前払いで、請求期間は毎月1日から翌月1日の前日までです。翌月1日を次の請求日と呼びます。
          </p>
          <p>プランを変えるときの規則は次のとおりです。</p>
          <ul>
            <li>値上げ（ベーシックからプロ）は、すぐに切り替えます。請求期間の残りの日数に応じて、月額の差額を日割りして請求します。</li>
            <li>値下げ（プロからベーシック）は、次の請求日に切り替える予定にします。すでに払った今月分は返金しません。</li>
            <li>同じプランへの変更や、請求期間の外の日付での変更は受け付けません。</li>
          </ul>
          <p>
            日割り（プロレーション）は使える日数の割合で金額を計算することです。11月21日にベーシックからプロへ変えると、残りは11月21日から30日までの10日で、11月は30日あります。差額の2,000円に30分の10を掛けると666.66…円になり、1円未満を切り捨てて666円を請求します。実在の決済サービスの Stripe は既定では秒単位で日割りし、日などの単位にも変更できます<Ref n={1} />。この章では日単位で計算します。
          </p>
          <Code
            lang="ruby"
            title="db/migrate/20261121000001_create_plans_and_subscriptions.rb"
            code={`
class CreatePlansAndSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.timestamps
    end

    create_table :plans do |t|
      t.string :name, null: false
      t.integer :monthly_price, null: false # 円
      t.timestamps
    end

    create_table :subscriptions do |t|
      t.references :member, null: false, foreign_key: true
      t.references :plan, null: false, foreign_key: true
      t.references :scheduled_plan, foreign_key: { to_table: :plans } # 期間の終わりに切り替える予定のプラン
      t.date :period_start, null: false # 請求期間の初日
      t.date :period_end, null: false   # 次の請求日（期間に含めない）
      t.timestamps
    end

    create_table :charges do |t|
      t.references :subscription, null: false, foreign_key: true
      t.integer :amount, null: false
      t.string :description, null: false
      t.timestamps
    end
  end
end
`}
          />
          <p>
            期間の初日と次の請求日は <code>date</code> 型の列です。MySQL の DATE 型は時刻を持たない日付で<Ref n={2} />、タイムゾーンによる変換もありません。
          </p>
          <h3>パターンを使う前のコード</h3>
          <p>
            最初のコードでは、プラン変更を Subscription のメソッドに書いています。決済は外部の決済サービスの API を Faraday（HTTP のクライアントの gem）で呼ぶ PaymentGateway が行います。
          </p>
          <Code
            lang="ruby"
            title="app/models/subscription.rb（パターンを使う前。関連の定義は省略）"
            code={`
# パターンを使う前：日割りの計算・今日の日付・保存・決済が1つのメソッドにある
class Subscription < ApplicationRecord
  def change_plan!(new_plan)
    return if plan_id == new_plan.id

    if new_plan.monthly_price > plan.monthly_price
      total_days = (period_end - period_start).to_i
      remaining_days = (period_end - Date.today).to_i # 今日の日付をその場で読む
      amount = (new_plan.monthly_price - plan.monthly_price) * remaining_days / total_days

      transaction do
        update!(plan: new_plan, scheduled_plan: nil)
        charges.create!(amount:, description: "#{new_plan.name} への変更（日割り）")
      end
      PaymentGateway.new.charge(customer_id: member_id, amount:)
    else
      update!(scheduled_plan: new_plan) # 値下げは期間の終わりに切り替える
    end
  end
end
`}
          />
          <Code
            lang="ruby"
            title="app/clients/payment_gateway.rb"
            code={`
# 外部の決済サービスの API を呼ぶクラス
class PaymentGateway
  def initialize(url: ENV.fetch("PAYMENT_API_URL", "https://payments.example.com"))
    @conn = Faraday.new(url:) do |f|
      f.request :json
      f.response :raise_error
    end
  end

  def charge(customer_id:, amount:)
    @conn.post("/v1/charges", { customer_id:, amount:, currency: "jpy" })
  end
end
`}
          />
          <h3>動かして確かめる</h3>
          <p>
            11月の請求期間のベーシックの契約を、日本時間の3つの時刻にプロへ変えました。アプリの <code>config.time_zone</code> は Tokyo、サーバーのプロセスの環境変数 TZ は UTC です。この章の検証環境のコンテナも TZ=UTC で動かしています。時刻は <code>travel_to</code> で固定し、決済の API は WebMock（HTTP の通信を差し替える gem）で受けて、送られた額を記録しています。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/scene.rb）"
            code={`
ENV['TZ']=UTC  config.time_zone=Tokyo
日本時間 2026-11-21 10:00 に変更: Date.today=2026-11-21 請求の記録=[666] 決済に送った額=[666]
日本時間 2026-11-21 08:00 に変更: Date.today=2026-11-20 請求の記録=[733] 決済に送った額=[733]
日本時間 2026-12-02 10:00 に変更: Date.today=2026-12-02 請求の記録=[-67] 決済に送った額=[-67]
`}
          />
          <p>
            日本時間の10時に変えると666円でしたが、同じ日の8時に変えると733円を請求しました。<code>Date.today</code> はプロセスのタイムゾーン（ここでは UTC）の今日を返すので、日本時間の0時から9時の前までは前日の日付になり、残りの日数が1日多く数えられたためです。12月2日に変えた場合は、期間を過ぎているのに計算を続け、-67円を決済に送りました。月の初めに次の請求期間へ進める処理が遅れていると、この状態が起きます。
          </p>
          <h3>テストを書く</h3>
          <p>日割りの額を確かめるテストを、このメソッドに対して書くと次のようになります。</p>
          <Code
            lang="ruby"
            title="before/spec/subscription_change_plan_spec.rb（パターンを使う前のコードのテスト）"
            code={`
require "rails_helper"
require "webmock/rspec"

RSpec.describe "Subscription#change_plan!（パターンを使う前）" do
  include ActiveSupport::Testing::TimeHelpers

  let(:basic) { Plan.create!(name: "ベーシック", monthly_price: 1000) }
  let(:pro) { Plan.create!(name: "プロ", monthly_price: 3000) }
  let(:member) { Member.create!(name: "佐藤", email: "sato@example.com") }
  before { stub_request(:post, "https://payments.example.com/v1/charges") }

  [
    ["11月の初日", [2026, 11, 1], [2026, 12, 1], "2026-11-01 10:00", 2000],
    ["11月21日", [2026, 11, 1], [2026, 12, 1], "2026-11-21 10:00", 666],
    ["11月の最終日", [2026, 11, 1], [2026, 12, 1], "2026-11-30 10:00", 66],
    ["2月（28日）の15日", [2027, 2, 1], [2027, 3, 1], "2027-02-15 10:00", 1000],
    ["1月（31日）の31日", [2027, 1, 1], [2027, 2, 1], "2027-01-31 10:00", 64],
  ].each do |label, from, to, at, expected|
    it "#{label}に値上げすると #{expected}円を請求する" do
      sub = Subscription.create!(member:, plan: basic, period_start: Date.new(*from), period_end: Date.new(*to))
      travel_to(Time.zone.parse(at)) { sub.change_plan!(pro) }

      expect(sub.charges.pluck(:amount)).to eq [expected]
      expect(WebMock).to have_requested(:post, "https://payments.example.com/v1/charges")
        .with(body: hash_including("amount" => expected))
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec before/spec/subscription_change_plan_spec.rb）"
            code={`
.....

Finished in 0.18329 seconds (files took 0.94219 seconds to load)
5 examples, 0 failures
`}
          />
          <p>
            5件とも通りましたが、日割りの額という1つの計算を確かめるのに、会員・2つのプラン・契約の4つのレコード、時刻の固定、決済の HTTP の差し替えが必要です。額は戻り値ではなく、charges の行と決済への HTTP の本文としてしか外に出てこないので、テストはその2か所を調べています。テストの時刻をすべて10時にしていたので、朝8時のずれも、期間の外の負の額も見つかりませんでした。
          </p>
          <p>このコードには、次の問題があります。</p>
          <ul>
            <li>日割りの計算が、プランの読み込み（SQL）と保存・決済の間にあり、計算だけを呼び出せません。</li>
            <li>「今日」をメソッドの中で <code>Date.today</code> から読むので、どのタイムゾーンの今日かがコードから分からず、テストでは時刻の固定が必要です。</li>
            <li>今日が請求期間の中にあるかを確かめていません。</li>
            <li>「値下げは期間の終わりに切り替える」という規則が、else の中の <code>update!</code> として書かれていて、規則を確かめるにも DB の行を調べる必要があります。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'idea',
      title: '計算と判断をコアに、副作用をシェルに集める',
      body: (
        <>
          <h3>目的</h3>
          <p>
            <Term en="pure function">純粋な関数</Term>
            は、同じ引数を渡せば必ず同じ結果を返し、呼ばれる前からあるオブジェクトや変数を変更しない関数です<Ref n={3} />
            <Ref n={4} />。値を返す以外に関数の外へ影響を与える動作（DB への書き込み、外部の API の呼び出し、メールの送信、ファイルやログへの出力）を<Term en="side effect">副作用</Term>
            と呼びます。DB の値、現在時刻、乱数のように関数の外にあるものを読む処理も、同じ引数で呼んでも結果が変わるので純粋ではありません。この章では、外にあるものを読む処理も副作用に含めます。前の節の <code>change_plan!</code> では、<code>plan</code>（SQL）、<code>Date.today</code>、<code>update!</code>、<code>PaymentGateway#charge</code> が副作用です。
          </p>
          <p>Rails のコードでは、次のものが副作用に当たります。見た目は属性を読むだけでも、副作用を含むことがあります。</p>
          <ul>
            <li>DB の読み書き：<code>find</code>・<code>where</code>・<code>count</code>、まだ読み込んでいない関連（<code>subscription.plan</code>・<code>event.registrations</code>）、<code>save</code>・<code>update!</code>。</li>
            <li>時計：<code>Time.current</code>・<code>Date.today</code>・<code>Date.current</code>、現在時刻を基準にする <code>1.day.ago</code> のような書き方。</li>
            <li>乱数：<code>rand</code>・<code>SecureRandom.uuid</code>。</li>
            <li>外部とのやり取り：HTTP の呼び出し、メールの送信、ジョブの投入、<code>Rails.cache</code>、ログの出力。</li>
            <li>アプリの設定や環境変数の読み取り：<code>ENV</code>・<code>Rails.configuration</code>。実行する環境によって値が変わります。</li>
          </ul>
          <p>
            <Term>Functional Core, Imperative Shell</Term>
            （以下 FCIS）は、プログラムを純粋な関数で書いた中心の部分（コア）と、副作用を扱う外側の部分（シェル）に分けるパターンです。名前は、Gary Bernhardt が 2012 年に公開したスクリーンキャストの題名です。「関数型（functional）」は純粋な関数を組み合わせて書くこと、「命令型（imperative）」は状態を変える命令を順に書くことを指します。Bernhardt は、関数型のコアの周りを命令型のシェルが囲み、シェルがコアの作った値に基づいて標準入出力・データベース・ネットワークを操作すると説明しています<Ref n={5} />。
          </p>
          <p>
            目的は、計算と判断を副作用から切り離し、テストしやすく、読みやすくすることです。Bernhardt は、関数型の部分は多くの場合テストダブル（テストで本物の代わりに渡すオブジェクト）なしで単独にテストでき、シェルの条件分岐が少なくなることを利点に挙げています<Ref n={5} />。
          </p>
          <h3>使う場面</h3>
          <p>
            業務のコードには、料金の計算、期間や締め切りの判定、入力の検証、データの変換など、本来は引数だけから結果が決まる処理が多くあります。Rails では、そうした計算がモデルのメソッドやコールバックの中で、関連の読み込み、<code>Time.current</code>、<code>save</code>、外部の API の呼び出しの間に書かれることがよくあります。そうなると、計算を1つ確かめるために、レコードの作成・時刻の固定・HTTP の差し替えを用意することになります。次のような兆候があれば、FCIS が必要になっている可能性があります。
          </p>
          <ul>
            <li>計算のテストを書くのに、レコードをいくつも作り、<code>travel_to</code> や WebMock を使っている。</li>
            <li>計算の途中で <code>Date.today</code> や <code>Time.current</code> を読んでいて、月末・月の変わり目・うるう年のテストが書きにくい。</li>
            <li>メソッドが値を返さず、保存や HTTP の本文を通してしか結果が分からない。</li>
            <li>条件分岐のそれぞれの分岐の中に、DB の更新や外部の API の呼び出しがある。</li>
          </ul>
          <h3>設計上の制約</h3>
          <ul>
            <li>コアを純粋にしたい。一方で、コアに必要なデータはすべて引数で渡すので、シェルで先に読み込む。使わないかもしれないデータまで読む場合がある。</li>
            <li>判断の結果をデータで返したい。一方で、判断の種類ごとにクラスを定義する手間が増える。</li>
            <li>シェルを単純にしたい。一方で、外部の応答を見て次の処理を決める場合は、読み込み・判断・書き込みを1回で済ませられない。</li>
            <li>今日の日付のように実行するたびに変わる値も、コアの引数にしたい。一方で、引数が増え、どのタイムゾーンのどの時点の値を使うかをシェルで決める必要がある。</li>
            <li>コアは、シェルが読み込んだ時点の値で判断する。一方で、読み込んでから書き込むまでの間に、別のリクエストが同じ契約を変更することがある。</li>
            <li>判断をコアに集めたい。一方で、書き込みの途中の失敗（保存は成功したが決済に失敗した）は、2つの副作用の間で起きる問題なので、コアでは解決できない。</li>
          </ul>
          <h3>解決方法</h3>
          <p>FCIS は次の2つの部分で構成します。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">部分</th>
                  <th scope="col">この章の例</th>
                  <th scope="col">受け持つこと</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">コア（Functional Core）</th>
                  <td>
                    <code>PlanChange.decide</code>・<code>PlanChange.prorate</code>（app/models/plan_change.rb）
                  </td>
                  <td>金額・日付・真偽値を受け取り、計算と判断の結果を値で返す。副作用を持たない</td>
                </tr>
                <tr>
                  <th scope="row">シェル（Imperative Shell）</th>
                  <td>
                    <code>ChangePlan</code>（app/services/change_plan.rb）と、それを呼ぶコントローラー
                  </td>
                  <td>DB から値を読み、今日の日付を決め、コアを呼び、返った判断に従って保存と決済を行う</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>シェルの処理は次の3段の形になります。</p>
          <ol>
            <li>読み込む：DB から契約とプランを読み、今日の日付を決める（副作用）。</li>
            <li>判断する：読み込んだ値をコアに渡し、判断の結果を値で受け取る（純粋な関数）。</li>
            <li>書き込む：判断の結果に従って、保存と決済を行う（副作用）。</li>
          </ol>
          <p>
            Mark Seemann は、この「副作用 → 純粋な関数 → 副作用」の形を、純粋でない部分（impure）で純粋な部分（pure）を挟むことから Impureim sandwich と呼んでいます<Ref n={6} />。後の記事では、Impureim sandwich を、コードを FCIS の構成にすると多くの場合に利点があることを示す形だと説明しています<Ref n={7} />。
          </p>
          <p>
            コアは「決済を呼ぶ」「保存する」とは書かず、「すぐ切り替えて666円を請求する」「12月1日に切り替える予定にする」「期間の外なので変更しない」という判断を値として返します。シェルは、その値の種類ごとに決まった副作用を実行するだけです。判断がコアに集まるので、シェルには条件分岐がほとんど残りません。
          </p>
          <p>コアとシェルは次のように分けます。</p>
          <ul>
            <li>コアの引数は値だけにする：数値、文字列、Date、Data で作った値。Active Record のオブジェクトや、呼ぶと外部とやり取りするオブジェクト（決済のクライアント、時計）は渡さない。</li>
            <li>コアの戻り値も値にする：判断の種類と、請求額や切り替える日のような、書き込みに必要な値を入れる。</li>
            <li>コアは引数を書き換えない：変更後の値が必要なら、新しい値として作って返す。</li>
            <li>シェルが受け持つのは、読み込み、今日の日付の決定、書き込みとその順序、レコードが見つからないときの例外である。</li>
          </ul>
          <p>
            今日の日付は、実行するたびに変わる値です。コアの中で読むとコアは純粋でなくなるので、シェルで決めて引数で渡します。前の節の問題は、どのタイムゾーンの「今日」かをコードのどこでも決めていなかったことでした。FCIS では、それを決める場所がシェルの1か所になります。
          </p>
          <Callout title="Dependency Injection との違い">
            <p>
              Dependency Injection（<ChapterLink n={40} section="idea" />）は、依存先を引数で受け取り、テストでは代わりのオブジェクトに替えます。FCIS は、コアから依存先そのものをなくすので、コアのテストでは何も替える必要がありません。2つは組み合わせて使います。この章のシェル ChangePlan は、決済のクライアントをコンストラクターの引数で受け取っています。
            </p>
          </Callout>
          <h3>構造</h3>
          <Figure n="98-1" title="副作用の位置" caption="左は前の節の change_plan!、右はこの章で分けた後の ChangePlan と PlanChange。">
            <SideEffectsFigure />
          </Figure>
          <p>
            図 98-1 は、副作用がどこにあるかを適用の前後で比べたものです。左では、計算（強調の枠）が SQL と時計の読み取りの後、保存と決済の前にあります。右では、副作用がシェルの最初と最後に集まり、計算と判断はコアにまとまります。
          </p>
          <Figure n="98-2" title="コアとシェルの配置" caption="矢印はシェルと外部の間のやり取り。コアは外部と直接やり取りしない。">
            <CoreShellFigure />
          </Figure>
          <p>
            図 98-2 はコアとシェルの関係です。MySQL・時計・決済サービスとやり取りするのはシェルだけで、コアはシェルから値を受け取り、値を返します。呼び出し元のコントローラーやジョブは、シェルを呼びます。
          </p>
          <Figure n="98-3" title="日割りの計算の例" caption="上はコアが行う計算。下は、日本時間の朝に UTC の Date.today を「今日」として渡した場合。">
            <ProrationFigure />
          </Figure>
          <p>
            図 98-3 の上はコアが行う日割りの計算です。次の請求日は期間に含めないので、11月21日から30日までの10日が残りです。下は、前の節で 733円を請求した場合で、渡した「今日」が1日早かったために残りが11日になりました。コアの計算は正しくても、シェルが渡す日付が誤っていれば結果は誤ります。日付をどのタイムゾーンで決めるかは、シェルの設計の問題です。
          </p>
        </>
      ),
    },
    {
      id: 'rails-impl',
      title: 'Rails での実装',
      body: (
        <>
          <h3>ファイルの置き場所</h3>
          <Code
            lang="text"
            code={`
app/
  models/plan_change.rb          # コア。Active Record を継承しない普通の Ruby のモジュール
  services/change_plan.rb        # シェル。読み込み・コアの呼び出し・書き込み
  controllers/subscription_plans_controller.rb  # 判断を画面の文言に変える
  clients/payment_gateway.rb     # 決済サービスの API を呼ぶ
  models/subscription.rb         # 関連の定義だけになる
  models/plan.rb・member.rb・charge.rb
spec/
  models/plan_change_spec.rb     # コアのテスト（rails_helper を読み込まない）
  services/change_plan_spec.rb   # シェルの統合テスト（MySQL・WebMock）
  requests/subscription_plans_spec.rb
`}
          />
          <p>
            コアは Active Record を継承しない普通の Ruby のモジュール（PORO：Plain Old Ruby Object）として app/models に置きます。app/models は DB のテーブルを持つクラスだけの場所ではなく、業務の概念を表すクラスを置く場所として扱います（<ChapterLink n={33} section="domain-application-service" />）。
          </p>
          <h3>コア：判断を Data で返す</h3>
          <Code
            lang="ruby"
            title="app/models/plan_change.rb"
            code={`
# Functional Core：プラン変更の判断と日割りの計算。
# 引数の値（金額・日付・真偽値）だけから結果を決め、DB・時計・決済を使わない。結果は Data で返す
module PlanChange
  UpgradeNow = Data.define(:amount, :remaining_days, :period_days) # すぐ切り替え、差額を日割りで請求する
  DowngradeAtPeriodEnd = Data.define(:effective_on)               # 期間の終わり（次の請求日）に切り替える
  Rejected = Data.define(:reason)                                 # 変更しない（:same_plan・:outside_period）

  module_function

  # 残りの日数（today を含み、period_end を含まない）で月額の差額を日割りし、1円未満を切り捨てる
  def prorate(monthly_difference, today:, period_start:, period_end:)
    (monthly_difference * (period_end - today) / (period_end - period_start)).floor
  end

  def decide(current_price:, new_price:, same_plan:, today:, period_start:, period_end:)
    return Rejected.new(reason: :same_plan) if same_plan
    return Rejected.new(reason: :outside_period) unless (period_start...period_end).cover?(today)
    return DowngradeAtPeriodEnd.new(effective_on: period_end) if new_price <= current_price

    UpgradeNow.new(
      amount: prorate(new_price - current_price, today:, period_start:, period_end:),
      remaining_days: (period_end - today).to_i,
      period_days: (period_end - period_start).to_i
    )
  end
end
`}
          />
          <p>
            判断の結果は種類ごとに <code>Data.define</code> で作った値のクラスにしました。<code>Data</code> は決まった項目だけを持つ読み取り専用のクラスを作り、<code>==</code> は項目の値で比べます。パターンマッチ（<code>case/in</code>）で項目を取り出すための <code>deconstruct_keys</code> も持っています<Ref n={8} />。UpgradeNow は請求額に加えて残りの日数と期間の日数を持つので、シェルは請求の説明文を作るときに日数を計算し直す必要がありません。
          </p>
          <p>
            <code>module_function</code> を書いた後のメソッドは、<code>PlanChange.decide(...)</code> のように、インスタンスを作らずにモジュール名に続けて呼べます。<code>Date</code> どうしの引き算は日数を <code>Rational</code>（誤差のない分数）で返すので<Ref n={9} />、掛け算と割り算を分数のまま行い、最後に <code>floor</code> で1円未満を切り捨てます。期間に含まれるかは、終わりを含まない範囲 <code>...</code> の <code>cover?</code> で確かめます。前の節で負の額を送った12月2日は、ここで <code>:outside_period</code> になります。
          </p>
          <p>
            このモジュールは Rails の機能を1つも使っていません。<code>Date</code> と <code>Data</code> は Ruby の標準のクラスです。そのため、テストでは rails_helper を読み込まずにこのファイルだけを読み込めます。
          </p>
          <h3>日付とタイムゾーン</h3>
          <p>
            「今日」を得る方法は Rails に3つあり、どのタイムゾーンで日付を決めるかが違います。アプリの <code>config.time_zone</code> は、アプリの既定のタイムゾーンを決め、Active Record のタイムゾーンの扱いを有効にする設定です<Ref n={10} />。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">書き方</th>
                  <th scope="col">どのタイムゾーンの今日か</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">
                    <code>Date.today</code>
                  </th>
                  <td>Ruby の標準のメソッド。プロセスのタイムゾーン（環境変数 TZ など）での今日</td>
                </tr>
                <tr>
                  <th scope="row">
                    <code>Time.zone.today</code>
                  </th>
                  <td>
                    <code>Time.zone</code>（既定は <code>config.time_zone</code>）での今日
                  </td>
                </tr>
                <tr>
                  <th scope="row">
                    <code>Date.current</code>
                  </th>
                  <td>
                    <code>Time.zone</code> が設定されていれば <code>Time.zone.today</code>、なければ <code>Date.today</code>
                    <Ref n={11} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>TZ が UTC のプロセスで、日本時間の11月21日8時に固定して3つを比べました。</p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/tz.rb の一部）"
            code={`
ENV TZ="UTC" Time.zone=Tokyo
travel_to(2026-11-21 08:00:00 +0900): Time.now=2026-11-20 23:00:00 +0000 Date.today=2026-11-20 Date.current=2026-11-21 Time.zone.today=2026-11-21
`}
          />
          <p>
            <code>Date.today</code> だけが11月20日を返しました。<code>travel_to</code> は <code>Time.now</code> と <code>Date.today</code> を差し替えますが<Ref n={12} />、<code>Date.today</code> の差し替えは指定した時刻をプロセスのタイムゾーンに直してから日付にします<Ref n={13} />。そのため、テストでも本番と同じずれが再現されます。前の節のテストが通ったのは、時刻をすべて10時にしていたからです。
          </p>
          <p>
            この章のシェルは <code>Date.current</code> で日本時間の今日を決めます。会員ごとにタイムゾーンを持つサービスなら、<code>Time.find_zone!(member.time_zone).today</code> のように会員のタイムゾーンで決めます。どちらにしても、決めるのはシェルで、コアは渡された Date だけを使います。
          </p>
          <p>
            なお、<code>date</code> 型の列は日付のまま保存されますが、<code>datetime</code> 型の列は、Rails が UTC に直して保存します（<code>config.active_record.default_timezone</code> の既定は <code>:utc</code><Ref n={10} />）。MySQL の DATETIME 型はタイムゾーンを持たないので<Ref n={2} />、SQL で日本時間の日付ごとに集計するときは、9時間ずらしてから日付にします。請求期間のような「日付」は、この章のように <code>date</code> 型で持つと、タイムゾーンの変換を考えずに済みます。
          </p>
          <h3>シェル：読み込み・判断・書き込み</h3>
          <Code
            lang="ruby"
            title="app/services/change_plan.rb"
            code={`
# Imperative Shell：DB から値を読み、PlanChange で判断し、判断に従って保存と決済を行う
class ChangePlan
  def initialize(gateway: PaymentGateway.new)
    @gateway = gateway
  end

  # today は日本時間（config.time_zone）の日付。テストでは任意の日付を渡せる
  def call(subscription, new_plan, today: Date.current)
    decision = PlanChange.decide(
      current_price: subscription.plan.monthly_price,
      new_price: new_plan.monthly_price,
      same_plan: subscription.plan_id == new_plan.id,
      today:,
      period_start: subscription.period_start,
      period_end: subscription.period_end
    )

    case decision
    in PlanChange::UpgradeNow[amount:, remaining_days:, period_days:]
      ApplicationRecord.transaction do
        subscription.update!(plan: new_plan, scheduled_plan: nil)
        subscription.charges.create!(amount:, description: "#{new_plan.name} への変更（#{remaining_days}/#{period_days}日分）")
      end
      @gateway.charge(customer_id: subscription.member_id, amount:)
    in PlanChange::DowngradeAtPeriodEnd
      subscription.update!(scheduled_plan: new_plan)
    in PlanChange::Rejected
      # 何も書き込まない
    end
    decision
  end
end
`}
          />
          <p>
            1段目では、Active Record のオブジェクトから月額・日付・真偽値を取り出してコアに渡します。<code>subscription.plan</code> を読むときに SQL が実行されますが、それはシェルの中です。2段目はコアの呼び出しだけです。3段目は <code>case/in</code> で判断の種類を分け、決まった書き込みを行います。<code>UpgradeNow[amount:, …]</code> は、Data の項目を同じ名前のローカル変数に取り出すパターンです。どの <code>in</code> にも当てはまらない値が来ると <code>NoMatchingPatternError</code> が起きるので、コアに判断の種類を足してシェルの対応を書き忘れると、その判断が初めて返ったときに気づけます。
          </p>
          <p>
            メソッドは判断の値を返します。コントローラーはそれを見て画面の文言を選べます（たとえば <code>Rejected</code> の <code>reason</code> が <code>:outside_period</code> なら「請求期間の更新中です。しばらくしてからお試しください」）。前の節と同じ3つの時刻で動かしました。
          </p>
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/after.rb）"
            code={`
日本時間 2026-11-21 10:00: Date.current=2026-11-21 #<data PlanChange::UpgradeNow amount=666, remaining_days=10, period_days=30>
  請求の記録=[666] 決済に送った額=[666]
日本時間 2026-11-21 08:00: Date.current=2026-11-21 #<data PlanChange::UpgradeNow amount=666, remaining_days=10, period_days=30>
  請求の記録=[666] 決済に送った額=[666]
日本時間 2026-12-02 10:00: Date.current=2026-12-02 #<data PlanChange::Rejected reason=:outside_period>
  請求の記録=[] 決済に送った額=[]
`}
          />
          <p>朝8時も666円になり、期間の外の変更は記録も決済も行わずに断りました。</p>
          <h3>呼び出し元：判断を画面の文言に変える</h3>
          <p>
            コントローラーもシェルの一部です。ChangePlan が返した判断の値を、もう一度 <code>case/in</code> で分けて画面の文言に変えます。<code>Rejected[reason: :same_plan]</code> のように、項目の値まで指定して分けられます。
          </p>
          <Code
            lang="ruby"
            title="app/controllers/subscription_plans_controller.rb"
            code={`
# シェルの一部。ChangePlan を呼び、返った判断を画面の文言に変える
class SubscriptionPlansController < ApplicationController
  def update
    subscription = Subscription.find(params[:subscription_id]) # 実際はログイン中の会員の契約から探す
    new_plan = Plan.find(params.expect(:plan_id))

    message =
      case ChangePlan.new.call(subscription, new_plan)
      in PlanChange::UpgradeNow[amount:] then "#{new_plan.name} に変更しました。差額 #{amount}円を請求します"
      in PlanChange::DowngradeAtPeriodEnd[effective_on:] then "#{effective_on.month}月#{effective_on.day}日から #{new_plan.name} に変わります"
      in PlanChange::Rejected[reason: :same_plan] then "すでに #{new_plan.name} を契約しています"
      in PlanChange::Rejected[reason: :outside_period] then "請求期間の更新中です。しばらくしてからお試しください"
      end
    redirect_to subscription_path(subscription), notice: message
  end
end
`}
          />
          <p>
            判断が値なので、文言を決めるために DB を読み直したり、金額を計算し直したりする必要がありません。値下げの文言の「12月1日」も、コアが返した <code>effective_on</code> をそのまま使っています。今日の日付は ChangePlan の既定の <code>Date.current</code> に任せ、コントローラーは日付を決めません。日付を決める場所を1か所にしておくと、会員ごとのタイムゾーンに変えるときも ChangePlan だけを直せば済みます。
          </p>
          <Callout kind="v72">
            <p>
              <code>params.expect</code> は Rails 8.0 で追加されたメソッドです<Ref n={16} />。Rails 7.2 では <code>params.require(:plan_id)</code> と書きます。この章のそのほかのコード（<code>Date.current</code>・<code>travel_to</code>・<code>Data.define</code>）は 7.2 でも同じように動きます。<code>Data.define</code> は Ruby 3.2 以降で使えます。
            </p>
          </Callout>
          <Callout kind="note" title="FCIS が解決しないこと">
            <p>
              シェルは、契約を読み込んでから書き込むまでの間に、別のリクエストが同じ契約を変えることを防ぎません。プランの変更が同時に起きうるなら、読み込みの前に <code>subscription.lock!</code> で行をロックするか（<ChapterLink n={15} section="pessimistic" />）、<code>lock_version</code> の列で書き込みの時点に検出します（<ChapterLink n={49} section="idea" />）。また、このシェルは保存をコミットした後で決済を呼ぶので、決済が失敗するとプランは変わったまま請求だけが残ります。外部の決済と保存の順序、結果が不明なときの扱いは<ChapterLink n={34} section="external-boundaries" />で扱いました。どちらも2つの副作用の間の問題なので、コアの書き方では解決しません。
            </p>
          </Callout>
          <h3>直していく順序</h3>
          <ol className="steps">
            <li>計算を取り出す：日数と日割りの額の計算を、金額と日付を引数に受け取る <code>PlanChange.prorate</code> にし、<code>change_plan!</code> から呼ぶ。この時点で、計算のテストを DB なしで書ける。</li>
            <li>今日の日付を引数にする：<code>Date.today</code> の代わりに、呼び出し元で <code>Date.current</code> から決めた日付を渡す。朝8時のずれはここで直る。</li>
            <li>判断を値にする：値上げ・値下げ・変更しないの判断と、期間の外の確認を <code>PlanChange.decide</code> にまとめ、Data で返す。</li>
            <li>シェルを判断の実行だけにする：<code>change_plan!</code> を ChangePlan に移し、条件分岐を判断の種類による <code>case/in</code> に置き換える。</li>
            <li>テストを移す：計算と判断のテストをコアに対して書き、シェルのテストは判断の種類ごとの少数の統合テストに減らす。前の節のテストは削除する。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'test',
      title: 'テストと動作の確認',
      body: (
        <>
          <h3>コアのテスト：DB なしの表</h3>
          <p>
            コアのテストは rails_helper を読み込まず、<code>require_relative</code> でコアのファイルだけを読み込みます。Rails も MySQL も起動しないので、レコードの作成も時刻の固定も要りません。入力と期待する出力の組を表にして並べます。
          </p>
          <Code
            lang="ruby"
            title="spec/models/plan_change_spec.rb"
            code={`
# コアのテスト。rails_helper を読み込まず、DB にもつながない
require "date"
require_relative "../../app/models/plan_change"

RSpec.describe PlanChange do
  describe ".decide" do
    base = { current_price: 1000, new_price: 3000, same_plan: false,
             period_start: Date.new(2026, 11, 1), period_end: Date.new(2026, 12, 1) }

    [
      ["期間の初日に値上げ", { today: Date.new(2026, 11, 1) }, PlanChange::UpgradeNow.new(amount: 2000, remaining_days: 30, period_days: 30)],
      ["11月21日に値上げ", { today: Date.new(2026, 11, 21) }, PlanChange::UpgradeNow.new(amount: 666, remaining_days: 10, period_days: 30)],
      ["期間の最終日に値上げ", { today: Date.new(2026, 11, 30) }, PlanChange::UpgradeNow.new(amount: 66, remaining_days: 1, period_days: 30)],
      ["次の請求日（期間の外）", { today: Date.new(2026, 12, 1) }, PlanChange::Rejected.new(reason: :outside_period)],
      ["期間を過ぎた後", { today: Date.new(2026, 12, 2) }, PlanChange::Rejected.new(reason: :outside_period)],
      ["値下げ", { today: Date.new(2026, 11, 21), current_price: 3000, new_price: 1000 }, PlanChange::DowngradeAtPeriodEnd.new(effective_on: Date.new(2026, 12, 1))],
      ["同じ月額の別プラン", { today: Date.new(2026, 11, 21), new_price: 1000 }, PlanChange::DowngradeAtPeriodEnd.new(effective_on: Date.new(2026, 12, 1))],
      ["同じプラン", { today: Date.new(2026, 11, 21), same_plan: true }, PlanChange::Rejected.new(reason: :same_plan)],
    ].each do |label, input, expected|
      it label do
        expect(described_class.decide(**base, **input)).to eq expected
      end
    end
  end

  describe ".prorate" do
    it "2月（28日）・うるう年の2月（29日）・31日の月で、期間の日数で割る" do
      feb = { period_start: Date.new(2027, 2, 1), period_end: Date.new(2027, 3, 1) }
      leap_feb = { period_start: Date.new(2028, 2, 1), period_end: Date.new(2028, 3, 1) }
      jan = { period_start: Date.new(2027, 1, 1), period_end: Date.new(2027, 2, 1) }

      expect(described_class.prorate(2000, today: Date.new(2027, 2, 15), **feb)).to eq 1000
      expect(described_class.prorate(2000, today: Date.new(2028, 2, 15), **leap_feb)).to eq 1034
      expect(described_class.prorate(2000, today: Date.new(2027, 1, 31), **jan)).to eq 64
    end

    it "2026〜2028年のすべての月のすべての日で、0円以上・差額以下で、日が進むほど増えない" do
      (2026..2028).flat_map { |y| (1..12).map { |m| Date.new(y, m, 1) } }.each do |start|
        finish = start.next_month
        amounts = (start...finish).map { |today| described_class.prorate(2000, today:, period_start: start, period_end: finish) }

        expect(amounts).to all(be_between(0, 2000))
        expect(amounts.first).to eq 2000
        expect(amounts.each_cons(2)).to all(satisfy { |a, b| a >= b })
      end
    end
  end
end
`}
          />
          <p>
            判断の結果は Data なので、<code>eq</code> で期待する値と項目ごとに比べられます。月末・2月・うるう年・期間の境界は、Date を渡すだけで書けます。
          </p>
          <p>
            最後の例は、個々の入力と出力の組の代わりに、どの入力でも成り立つべき性質を確かめています。2026年から2028年の36か月のすべての日（1,096日）について、日割りの額が0円以上で差額以下であること、期間の初日は差額の全額であること、日が進むほど額が増えないことを確かめます。このように性質を確かめるテストを<Term en="property-based testing">性質に基づくテスト</Term>
            と呼び、ふつうは乱数で多数の入力を作るライブラリを使います。ここでは入力の範囲が小さいので、すべての日を列挙しました。コアは副作用を持たないので、1,000 回以上呼んでもテストは速く終わります。
          </p>
          <Code
            lang="text"
            title="実行結果（bundle exec rspec spec/models/plan_change_spec.rb --format documentation）"
            code={`
PlanChange
  .decide
    期間の初日に値上げ
    11月21日に値上げ
    期間の最終日に値上げ
    次の請求日（期間の外）
    期間を過ぎた後
    値下げ
    同じ月額の別プラン
    同じプラン
  .prorate
    2月（28日）・うるう年の2月（29日）・31日の月で、期間の日数で割る
    2026〜2028年のすべての月のすべての日で、0円以上・差額以下で、日が進むほど増えない

Finished in 0.01676 seconds (files took 0.06818 seconds to load)
10 examples, 0 failures
`}
          />
          <p>
            10件が0.017秒で終わり、ファイルの読み込みも0.07秒でした。scene の節のパターンを使う前のテストは、5件に0.18秒、Rails と rails_helper の読み込みに0.94秒かかっていました。件数を増やすと差はさらに広がります。前のテストは1件ごとに4つのレコードを作るので、1,096日を同じ方法で確かめるには、4,000件以上の INSERT が必要です。
          </p>
          <h3>シェルのテスト：少数の統合テスト</h3>
          <p>
            シェルのテストは本物の MySQL と WebMock を使い、判断の種類ごとに正しい書き込みが行われるかを確かめます。計算はコアのテストで確かめ済みなので、額の組み合わせは繰り返しません。
          </p>
          <Code
            lang="ruby"
            title="spec/services/change_plan_spec.rb"
            code={`
require "rails_helper"
require "webmock/rspec"

# シェルの統合テスト。DB と決済の HTTP を使い、判断の種類ごとに書き込みを確かめる
RSpec.describe ChangePlan do
  include ActiveSupport::Testing::TimeHelpers

  let(:basic) { Plan.create!(name: "ベーシック", monthly_price: 1000) }
  let(:pro) { Plan.create!(name: "プロ", monthly_price: 3000) }
  let(:subscription) do
    Subscription.create!(member: Member.create!(name: "佐藤", email: "sato@example.com"), plan: basic,
                         period_start: Date.new(2026, 11, 1), period_end: Date.new(2026, 12, 1))
  end
  let!(:payments) { stub_request(:post, "https://payments.example.com/v1/charges") }

  it "値上げならプランを替え、請求を記録し、決済に同じ額を送る" do
    described_class.new.call(subscription, pro, today: Date.new(2026, 11, 21))

    expect(subscription.reload.plan).to eq pro
    expect(subscription.charges.pluck(:amount, :description)).to eq [[666, "プロ への変更（10/30日分）"]]
    expect(payments.with(body: hash_including("amount" => 666))).to have_been_requested.once
  end

  it "値下げなら期間の終わりの切り替えを予定し、決済を呼ばない" do
    subscription.update!(plan: pro)
    described_class.new.call(subscription, basic, today: Date.new(2026, 11, 21))

    expect(subscription.reload).to have_attributes(plan: pro, scheduled_plan: basic)
    expect(payments).not_to have_been_requested
  end

  it "today を省略すると、日本時間の今日で計算する（UTC ではまだ前日の朝 8 時）" do
    travel_to(Time.zone.parse("2026-11-21 08:00")) do
      described_class.new.call(subscription, pro)
    end

    expect(subscription.charges.pluck(:amount)).to eq [666]
  end
end
`}
          />
          <p>
            最初の2つは、今日の日付を引数で渡しています。時刻を固定するのは3つ目だけで、これはシェルが既定でどのタイムゾーンの今日を使うかを確かめるテストです。シェルの <code>today:</code> を <code>Date.today</code> に変えて実行すると、3つ目は 733円になって失敗します。
          </p>
          <p>コントローラーのテストは、判断の値が文言に変わることだけを、2つの判断で確かめます。</p>
          <Code
            lang="ruby"
            title="spec/requests/subscription_plans_spec.rb"
            code={`
require "rails_helper"
require "webmock/rspec"

RSpec.describe "プランの変更", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:basic) { Plan.create!(name: "ベーシック", monthly_price: 1000) }
  let(:pro) { Plan.create!(name: "プロ", monthly_price: 3000) }
  let(:subscription) do
    Subscription.create!(member: Member.create!(name: "佐藤", email: "sato@example.com"), plan: pro,
                         period_start: Date.new(2026, 11, 1), period_end: Date.new(2026, 12, 1))
  end

  it "判断を画面の文言に変える" do
    travel_to(Time.zone.parse("2026-11-21 10:00")) do
      patch "/subscriptions/#{subscription.id}/plan", params: { plan_id: basic.id }
      expect(flash[:notice]).to eq "12月1日から ベーシック に変わります"

      patch "/subscriptions/#{subscription.id}/plan", params: { plan_id: pro.id }
      expect(flash[:notice]).to eq "すでに プロ を契約しています"
    end
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bundle exec rspec --format documentation。コアとシェルを一緒に実行）"
            code={`
PlanChange
  .decide
    …（省略）
  .prorate
    …（省略）

プランの変更
  判断を画面の文言に変える

ChangePlan
  値上げならプランを替え、請求を記録し、決済に同じ額を送る
  値下げなら期間の終わりの切り替えを予定し、決済を呼ばない
  today を省略すると、日本時間の今日で計算する（UTC ではまだ前日の朝 8 時）

Finished in 0.17347 seconds (files took 0.92253 seconds to load)
14 examples, 0 failures
`}
          />
          <Figure n="98-4" title="コアとシェルのテストの分担" caption="件数と時間は、この章のアプリで計測した値。下の段は scene の節のパターンを使う前のテスト。">
            <TestSplitFigure />
          </Figure>
          <p>
            図 98-4 はテストの分担と、この章で計測した件数と時間をまとめたものです。規則の組み合わせはコアのテストで数多く確かめ、シェルは判断の種類ごとの少数の統合テストにします。シェルのテストを減らしすぎると、別のプランを読む・保存を忘れるといったシェルの誤りを見つけられないので、判断の種類ごとに少なくとも1件は本物の DB で確かめます。テストの層の分け方は<ChapterLink n={20} section="test-strategy" />でも扱いました。
          </p>
        </>
      ),
    },
    {
      id: 'consequences',
      title: '効果と代償',
      body: (
        <>
          <h3>得られるもの</h3>
          <ul>
            <li>計算と判断のテストを、DB も時刻の固定も使わない入力と出力の表で書けます。テストは速く、読みやすくなります。</li>
            <li>月末・2月・うるう年・期間の境界のような場面を、Date を渡すだけでテストでき、すべての日を列挙するような性質のテストも書けます。</li>
            <li>どのタイムゾーンの「今日」を使うかが、シェルの1か所に書かれます。</li>
            <li>シェルの条件分岐が判断の種類による <code>case/in</code> だけになり、どの判断のときにどの副作用が起きるかを1か所で読めます。</li>
            <li>コアは Rails に依存しないので、管理画面での見積もりの表示、請求の一括計算のジョブなど、別の呼び出し元からも同じ計算を使えます。</li>
          </ul>
          <h3>増える複雑さ</h3>
          <ul>
            <li>判断の結果を表すクラス（UpgradeNow・DowngradeAtPeriodEnd・Rejected）が増えます。</li>
            <li>コアに必要な値をシェルで先に読み込むので、場合によっては使わない値も読み込みます。</li>
            <li>外部の応答を見て次の処理を決める場合は、読み込み・判断・書き込みを何度か繰り返す構造になります。</li>
            <li>同時の変更と、書き込みの途中の失敗には、シェルの側で別に対策が要ります。</li>
          </ul>
          <h3>保守性とテストのしやすさへの影響</h3>
          <p>
            日割りの方法や値下げの扱いのような業務の規則を変えるときは、多くの場合コアだけを直し、コアのテストの表を書き換えれば確かめられます。決済サービスの呼び出し方や保存先の変更は、シェルだけの変更で済みます。テストの大部分はコアのテストになるので全体が速くなり、WebMock の設定や作るレコードの変更でテストが壊れることも減ります。一方、シェルのテストは少数なので、シェルの読み込みや書き込みの誤りは、その少数の統合テストで確かめる必要があります。
          </p>
        </>
      ),
    },
    {
      id: 'anti-patterns',
      title: 'よくある誤用',
      body: (
        <>
          <h3>コアの中で外部を使う</h3>
          <Code
            lang="ruby"
            title="誤用の例：コアの中で今日の日付と設定を読む"
            code={`
module PlanChange
  module_function

  def decide(current_price:, new_price:, same_plan:, period_start:, period_end:)
    today = Date.current                                  # 時計を読む
    limit = Rails.configuration.x.max_proration_amount    # アプリの設定を読む
    # …（省略）
  end
end
`}
          />
          <p>
            コアの中で <code>Date.current</code> を読むと、同じ引数でも日によって結果が変わり、テストには <code>travel_to</code> が要ります。<code>Date.current</code> は Active Support のメソッドなので、コアのテストで Rails を読み込む必要も出てきます。設定値やリポジトリ、決済のクライアントも同じです。コアに必要なものは、すべて値として引数で受け取ります。
          </p>
          <h3>ORM のオブジェクトをコアに渡す</h3>
          <Code
            lang="ruby"
            title="誤用の例：Active Record のオブジェクトを受け取るコア（script/orm_core.rb）"
            code={`
module PlanChangeFromRecords
  module_function

  def decide(subscription, new_plan, today:)
    PlanChange.decide(
      current_price: subscription.plan.monthly_price, # 関連を読む
      new_price: new_plan.monthly_price,
      same_plan: subscription.plan_id == new_plan.id,
      today:, period_start: subscription.period_start, period_end: subscription.period_end
    )
  end
end
`}
          />
          <Code
            lang="text"
            title="実行結果（bin/rails runner script/orm_core.rb）"
            code={`
#<data PlanChange::UpgradeNow amount=666, remaining_days=10, period_days=30>
コアの呼び出しの中で実行された SQL: 1件
  SELECT \`plans\`.* FROM \`plans\` WHERE \`plans\`.\`id\` = 29 LIMIT 1
`}
          />
          <p>
            Active Record のオブジェクトは、関連を初めて読んだときに SQL を実行します。コアに渡すと、コアの中で気づかないうちに副作用が起き、テストでは関連先のレコードまで DB に作る必要があります。関連を事前に読み込んであるかどうかで、SQL が実行されたりされなかったりもします。コアには、必要な値（金額・日付・ID）だけを渡すか、値だけを持つ Data に変えてから渡します。
          </p>
          <h3>判断を細かく分けすぎる</h3>
          <Code
            lang="ruby"
            title="誤用の例：シェルとコアが何度も往復する"
            code={`
step = PlanChange.first_step(same_plan: …)
if step == :need_prices
  step = PlanChange.compare(current_price: subscription.plan.monthly_price, new_price: new_plan.monthly_price)
  if step == :need_period
    step = PlanChange.check_period(today:, period_start: subscription.period_start, period_end: subscription.period_end)
    # …（省略）
`}
          />
          <p>
            コアが「次に何を読むか」まで細かく返し、シェルがそれを受けてまたコアを呼ぶと、シェルに条件分岐が戻り、判断の順序がシェルとコアに分かれます。プランの月額も期間も1回の読み込みで得られる値なので、まとめて読み込んで1回の <code>decide</code> に渡します。
          </p>
          <h3>すべてを純粋にしようとする</h3>
          <p>
            決済サービスの応答（成功・カードの拒否・結果が不明）によって次の手順が大きく変わる処理まで無理にコアに入れると、「決済の結果を待つ」「再試行する」といった状態を表す判断の型が増え、シェルとコアの往復が増えます。純粋にする価値が高いのは、規則が多く、テストの場面が多い計算と判断です。単純な読み込みと保存だけの処理（<code>subscription.update!(scheduled_plan: new_plan)</code> など）は、シェルにそのまま書きます。外部の応答を待つ手順は、<ChapterLink n={34} section="external-boundaries" />のようにジョブと状態の列で組み立てます。
          </p>
          <h3>タイムゾーンを決めずに「今日」を渡す</h3>
          <Code
            lang="ruby"
            title="誤用の例：シェルが Date.today を渡す"
            code={`
ChangePlan.new.call(subscription, new_plan, today: Date.today)
`}
          />
          <p>
            コアに日付を引数で渡すようにしても、シェルが <code>Date.today</code> を渡せば、scene の節と同じく日本時間の朝に 733円を請求します。サーバーやコンテナのタイムゾーンは、アプリのコードからは見えない設定で、環境によって変わります。どのタイムゾーンの日付を使うかを、シェルで <code>Date.current</code>（アプリのタイムゾーン）や会員のタイムゾーンとして明示します。
          </p>
        </>
      ),
    },
    {
      id: 'alternatives',
      title: 'ほかの方法との使い分け',
      body: (
        <>
          <h3>より単純な方法</h3>
          <ul>
            <li>
              計算だけを関数に取り出す：判断を値で返すところまでせず、日割りの計算だけを <code>PlanChange.prorate</code> に取り出すだけでも、最も複雑な部分を DB なしでテストできます。rails-impl の節の手順の1と2がこれに当たります。規則が増えてから判断の値に進めば足ります。
            </li>
            <li>
              モデルのメソッドにする：<code>Subscription#proration_for(new_plan, today:)</code> のように、自分の属性と引数だけから額を返すメソッドなら、モデルに置いても純粋に近い形で書けます。テストではレコードを保存せずに <code>Subscription.new(…)</code> で作ったオブジェクトを使えます。ただし、メソッドの中で <code>plan</code> のような関連を読むと SQL が実行されるので、関連の値も引数で受け取るか、呼ぶ前に読み込んでおきます。
            </li>
            <li>
              テストダブルでテストする：計算が単純で場面も少ないなら、決済のクライアントを差し替えてテストするだけで足ります（<ChapterLink n={40} section="test-doubles" />）。
            </li>
          </ul>
          <h3>コールバックで計算する場合</h3>
          <p>
            日割りの額を <code>before_save</code> のようなコールバックで計算する書き方もあります。コールバックはオブジェクトの作成・保存・更新などの決まった時点で自動で呼ばれる処理です<Ref n={14} />。保存のたびに自動で動くので、どの操作で計算が実行されるかをコードの呼び出し元から読み取れず、計算を確かめるにもレコードを保存するテストが必要になります。管理画面で別の属性を直しただけでも計算が走り、請求が作られることもあります。コールバックに置くのは、どの経路で保存しても必ず成り立たせたい、そのレコードの中で完結する処理（値の正規化など）に限ります（<ChapterLink n={30} section="callback-design" />）。
          </p>
          <h3>ほかのパターンとの違い</h3>
          <ul>
            <li>
              Use Case / Application Service（<ChapterLink n={44} section="idea" />）：ユースケースは読み込み・トランザクション・保存・メールの手順を調整するので、FCIS のシェルの役割に近くなります。違いは目的で、ユースケースは手順を1か所にまとめること、FCIS は計算と判断を副作用から切り離すことを目指します。2つは組み合わせられます。前の章の <code>Event#rejection_reason_for</code> は、中で <code>registrations.count</code> を実行するので純粋ではありません。申し込みの数と締め切りを引数で受け取るように変えれば、規則をコアとして DB なしでテストできます。ただし、定員を守るにはロックを取った後に数える必要があるので、数を読む位置はユースケース（シェル）が決めます。
            </li>
            <li>
              Value Object（<ChapterLink n={46} section="idea" />）：金額を整数の円ではなく Money のような値のクラスで表すと、コアの引数と戻り値の誤用（単位や通貨の取り違え）を防げます。Value Object も外部とやり取りしないので、コアの中で使えます。
            </li>
            <li>
              Explicit State Machine（<ChapterLink n={47} section="idea" />）：状態の遷移を「現在の状態と出来事から次の状態を返す」純粋な関数として書くと、遷移の規則がコアになります。
            </li>
            <li>
              Bernhardt は講演「Boundaries」で、単純な値をデータを持つためだけでなく、コンポーネントやサブシステムの間の境界として使う考え方を説明しています<Ref n={15} />。コアとシェルの間を Data の値だけで受け渡すこの章の形は、この考え方に沿っています。
            </li>
          </ul>
          <h3>採用の判断</h3>
          <p>次の条件に当てはまるときは、コアとシェルに分けます。</p>
          <ul>
            <li>料金・日付・期間・在庫の引当てなど、規則が多く、テストの場面が多い計算や判断がある。</li>
            <li>その計算が、SQL・現在時刻・外部の API の呼び出しの間に書かれていて、テストにレコードや時刻の固定や HTTP の差し替えが必要になっている。</li>
            <li>日付の境界や現在時刻、タイムゾーンによって結果が変わる。</li>
          </ul>
          <p>次の条件に当てはまるときは、分けないほうが小さく書けます。</p>
          <ul>
            <li>処理のほとんどが読み込みと保存で、計算や判断がほとんどない。</li>
            <li>外部の応答を見ながら手順を進める処理で、判断を値にまとめると型が複雑になる。</li>
            <li>計算が単純で、レコードを使うテストでも十分に確かめられる。</li>
          </ul>
          <p>分けた後は、次の点を確かめます。</p>
          <ol>
            <li>コアは引数だけから結果を決めているか。外部・現在時刻・設定・乱数・Active Record の関連を使っていないか。</li>
            <li>コアは引数を書き換えず、新しい値を返しているか。</li>
            <li>シェルに計算や複雑な条件判断が残っていないか。</li>
            <li>コアのテストが rails_helper も DB も使わずに動くか。</li>
            <li>どのタイムゾーンの「今日」を使うかを、シェルで明示しているか。</li>
          </ol>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <ul>
          <li>Functional Core, Imperative Shell は、計算と判断を純粋な関数のコアにまとめ、DB・時計・外部の API とのやり取りをシェルに集めるパターンです。</li>
          <li>シェルは「読み込む → コアで判断する → 判断に従って書き込む」の3段で書き、条件分岐は判断の種類による <code>case/in</code> だけにします。</li>
          <li>コアは判断の結果を <code>Data.define</code> の値で返し、Active Record のオブジェクトではなく、金額・日付・真偽値を引数で受け取ります。</li>
          <li>今日の日付もコアの引数にし、どのタイムゾーンの日付かをシェルで決めます。<code>Date.today</code> はプロセスのタイムゾーン、<code>Date.current</code> は <code>config.time_zone</code> の今日を返します。</li>
          <li>請求期間のような日付は <code>date</code> 型の列で持つと、タイムゾーンの変換を考えずに済みます。</li>
          <li>コアのテストは rails_helper も DB も使わずに表と性質で書け、この章では10件が0.017秒で終わりました。シェルは判断の種類ごとの少数の統合テストで確かめます。</li>
          <li>同時の変更と、保存と決済の間の失敗は、コアでは解決しません。シェルの側でロックや処理の順序を設計します。</li>
        </ul>
      ),
    },
  ],
  sources: [
    { title: 'Prorations', publisher: 'Stripe Documentation', url: 'https://docs.stripe.com/billing/subscriptions/prorations', accessed: '2026-11-13', note: '既定では秒単位で日割りし、日などの単位に変更できること。' },
    { title: 'Date and Time Data Types（The DATE, DATETIME, and TIMESTAMP Types）', publisher: 'MySQL 8.4 Reference Manual', url: 'https://dev.mysql.com/doc/refman/8.4/en/datetime.html', accessed: '2026-11-21', version: 'MySQL 8.4', note: 'DATE 型は時刻を持たない日付であること、TIMESTAMP だけがタイムゾーンの変換を行い DATETIME は行わないこと。' },
    { title: 'Keeping Components Pure', publisher: 'React', url: 'https://react.dev/learn/keeping-components-pure', accessed: '2026-11-13', note: '純粋な関数の2つの性質（既存のものを変えない、同じ入力なら同じ出力）。' },
    { title: 'Pure', publisher: 'HaskellWiki', url: 'https://wiki.haskell.org/Pure', accessed: '2026-11-13', version: '2026年7月18日更新', note: '純粋な関数は引数以外に依存しないこと。' },
    { title: 'Functional Core, Imperative Shell', publisher: 'Gary Bernhardt／Destroy All Software', url: 'https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell', accessed: '2026-11-13', version: '2012年7月12日', note: 'コアとシェルの説明と、テストダブルなしでテストでき、シェルの条件分岐が減るという利点。' },
    { title: 'Impureim sandwich', publisher: 'Mark Seemann／ploeh blog', url: 'https://blog.ploeh.dk/2020/03/02/impureim-sandwich/', accessed: '2026-11-13', version: '2020年3月2日', note: '純粋でない処理で純粋な関数を挟む形。' },
    { title: "What's a sandwich?", publisher: 'Mark Seemann／ploeh blog', url: 'https://blog.ploeh.dk/2023/10/09/whats-a-sandwich/', accessed: '2026-11-13', version: '2023年10月9日', note: 'Impureim sandwich と FCIS の関係。' },
    { title: 'Data', publisher: 'Ruby Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Data.html', accessed: '2026-11-21', version: 'Ruby 4.0', note: 'メンバーを書き換えるメソッドを持たない値のクラスであること、== と to_h、パターンマッチ用の deconstruct・deconstruct_keys を持つこと。動作は Ruby 4.0.9 で確認。' },
    { title: 'class Date', publisher: 'Ruby 4.0 Documentation', url: 'https://docs.ruby-lang.org/en/4.0/Date.html#method-i-2D', accessed: '2026-11-13', note: 'Date どうしの引き算が日数を Rational で返すこと。' },
    { title: 'Configuring Rails Applications', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/configuring.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'config.time_zone がアプリの既定のタイムゾーンを決め Active Record のタイムゾーンの扱いを有効にすること、config.active_record.default_timezone の既定が :utc であること。' },
    { title: 'activesupport/lib/active_support/core_ext/date/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/core_ext/date/calculations.rb#L47-L50`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'Date.current が Time.zone があれば Time.zone.today、なければ Date.today を返すこと。' },
    { title: 'ActiveSupport::Testing::TimeHelpers', publisher: 'Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActiveSupport/Testing/TimeHelpers.html', accessed: '2026-11-21', version: 'Rails 8.1', note: 'travel・travel_to が Time.now・Date.today・DateTime.now を差し替え、テストの終わりに元に戻すこと。' },
    { title: 'activesupport/lib/active_support/testing/time_helpers.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activesupport/lib/active_support/testing/time_helpers.rb#L170-L190`, accessed: '2026-11-21', version: 'Rails 8.1.4.1', note: 'travel_to が指定した時刻を getlocal でプロセスのタイムゾーンに直し、その日付で Date.today を差し替えること。' },
    { title: 'Active Record Callbacks', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_callbacks.html', accessed: '2026-11-13', version: 'Rails 8.1', note: 'コールバックはオブジェクトの作成・保存などの時点で呼ばれること。' },
    { title: 'Boundaries', publisher: 'Gary Bernhardt／Destroy All Software（SCNA 2012 の講演）', url: 'https://www.destroyallsoftware.com/talks/boundaries', accessed: '2026-11-13', version: '2012年', note: '単純な値をコンポーネントの境界として使う考え方。' },
    { title: 'Ruby on Rails 8.0 Release Notes', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/8_0_release_notes.html', accessed: '2026-11-20', version: 'Rails 8.0', note: 'params#expect が追加され、params.require(:table).permit(:attr) に代わる書き方になったこと。' },
  ],
}

export default chapter
