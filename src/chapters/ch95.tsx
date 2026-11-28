import { figureNumber } from '../content/label'
import type { Chapter } from '../content/types'
import { Callout, ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const RD = 'https://docs.ruby-lang.org/en/4.0'

/* ---------- 図 1 変数とオブジェクト ---------- */
function VariableFigure() {
  return (
    <Svg id={figureNumber(95, 1)} w={780} h={220}
      label="左は copy = title と copy に文字列を追加した後の状態。変数 title と copy は同じ String のオブジェクト「Rails 入門（第2版）」を指している。右は続けて title = 42 を実行した後の状態。title は Integer の 42 を指し、copy は元の String を指したまま">
      <T x={20} y={20} bold fs={12}>{'① copy = title と copy << "（第2版）" の後'}</T>
      <Box x={20} y={50} w={100} h={36} lines="title" mono />
      <Box x={20} y={120} w={100} h={36} lines="copy" mono />
      <Box x={170} y={74} w={200} h={60} lines={['String のオブジェクト', '"Rails 入門（第2版）"']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={120} y1={68} x2={168} y2={94} />
      <Arrow x1={120} y1={138} x2={168} y2={114} />
      <line x1={390} y1={10} x2={390} y2={180} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <T x={410} y={20} bold fs={12}>② 続けて title = 42 を実行した後</T>
      <Box x={410} y={50} w={100} h={36} lines="title" mono />
      <Box x={410} y={120} w={100} h={36} lines="copy" mono />
      <Box x={560} y={36} w={200} h={50} lines={['Integer のオブジェクト', '42']} fs={12} fill="box5" subTone="muted" accent />
      <Box x={560} y={110} w={200} h={60} lines={['String のオブジェクト', '"Rails 入門（第2版）"']} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={510} y1={68} x2={558} y2={62} accent />
      <Arrow x1={510} y1={138} x2={558} y2={140} />
      <T x={20} y={202} fs={11} tone="muted">{'変数はオブジェクトを指す名前。代入は指す先を変え、<< は指しているオブジェクトそのものを書き換える'}</T>
    </Svg>
  )
}

/* ---------- 図 3 Float の 0.57 ---------- */
function FloatFigure() {
  return (
    <Svg id={figureNumber(95, 3)} w={780} h={270}
      label="十進の 0.57 は Float では表せないので、0.57 と書くと最も近い 0.56999999999999995115 が入る。直前の Float は 0.56999999999999984013、直後は 0.57000000000000006217。この値に 100 を掛けると 56.99999999999999289 になり、to_i で 56 になる。BigDecimal で 0.57 に 100 を掛けると十進の 57 になり、to_i で 57 になる">
      <T x={494} y={36} anchor="middle" fs={12} tone="acc">十進の 0.57（Float では表せない）</T>
      <line x1={80} y1={100} x2={700} y2={100} stroke="var(--fig-line)" />
      <line x1={494} y1={46} x2={494} y2={100} stroke="var(--fig-accent)" strokeDasharray="4 3" />
      <T x={120} y={74} anchor="middle" fs={12}>直前の Float</T>
      <T x={380} y={74} anchor="middle" fs={12} bold>0.57 と書くと入る値</T>
      <T x={640} y={74} anchor="middle" fs={12}>直後の Float</T>
      <circle cx={120} cy={100} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <circle cx={380} cy={100} r={6} fill="var(--fig-box5)" stroke="var(--fig-accent)" strokeWidth={2} />
      <circle cx={640} cy={100} r={5} fill="var(--fig-bg)" stroke="var(--fig-line)" />
      <T x={120} y={124} anchor="middle" fs={11} mono>0.56999999999999984013</T>
      <T x={380} y={124} anchor="middle" fs={11} mono>0.56999999999999995115</T>
      <T x={640} y={124} anchor="middle" fs={11} mono>0.57000000000000006217</T>
      <T x={20} y={152} fs={11} tone="muted">隣り合う Float の間隔はこの付近で約 1.1 × 10^-16。0.57 と書くと、十進の 0.57 に最も近い Float が選ばれる</T>
      <Box x={20} y={176} w={200} h={34} lines="0.57 * 100" mono fs={12} />
      <Arrow x1={220} y1={193} x2={256} y2={193} />
      <Box x={258} y={176} w={232} h={34} lines="56.99999999999999289" mono fs={12} />
      <Arrow x1={490} y1={193} x2={526} y2={193} />
      <Box x={528} y={176} w={232} h={34} lines="to_i で 56（1 小さい）" fs={12} fill="box5" accent />
      <Box x={20} y={222} w={200} h={34} lines={'BigDecimal("0.57") * 100'} mono fs={11} />
      <Arrow x1={220} y1={239} x2={256} y2={239} />
      <Box x={258} y={222} w={232} h={34} lines="0.57e2（十進の 57）" fs={12} />
      <Arrow x1={490} y1={239} x2={526} y2={239} />
      <Box x={528} y={222} w={232} h={34} lines="to_i で 57" fs={12} />
    </Svg>
  )
}

/* ---------- 図 5 文字列リテラルの状態 ---------- */
function StringStateFigure() {
  const col = (x: number, head: string, state: string[], result: string[], danger?: boolean, monoHead?: boolean) => (
    <g>
      <T x={x + 110} y={24} anchor="middle" bold fs={monoHead ? 11 : 12} mono={monoHead}>{head}</T>
      <Box x={x} y={40} w={220} h={40} lines={'s = "draft"'} mono fs={12} />
      <Arrow x1={x + 110} y1={80} x2={x + 110} y2={106} />
      <Box x={x} y={108} w={220} h={46} lines={state} fs={12} fill="box4" subTone="muted" />
      <Arrow x1={x + 110} y1={154} x2={x + 110} y2={188} />
      <T x={x + 118} y={171} fs={11} tone="muted">{'s << "!" を実行'}</T>
      <Box x={x} y={190} w={220} h={56} lines={result} fs={12} fill={danger ? 'box5' : 'box'} accent={danger} subTone="muted" />
    </g>
  )
  return (
    <Svg id={figureNumber(95, 5)} w={780} h={290}
      label="Ruby 4.0.9 で文字列リテラルを書き換えたときの3つの場合。マジックコメントがないファイルでは、リテラルは凍結されていないが凍結予定の状態で、書き換えられる。-W:deprecated を付けたときだけ警告が出る。frozen_string_literal: true のファイルではリテラルが凍結されていて FrozenError になる。+ や dup や String.new で作った複製は凍結されておらず、警告なしで書き換えられる">
      {col(20, 'マジックコメントなし（既定）', ['frozen? は false', '凍結予定の文字列'], ['書き換えられる', '-W:deprecated のときだけ警告'])}
      {col(280, '# frozen_string_literal: true', ['frozen? は true', '同じリテラルは同じオブジェクト'], ['FrozenError', "can't modify frozen String"], true, true)}
      {col(540, '+s・s.dup・String.new(s)', ['frozen? は false', '凍結されていない複製'], ['書き換えられる', '警告は出ない'], false, true)}
      <T x={20} y={272} fs={11} tone="muted">--enable=frozen-string-literal を付けて起動すると、マジックコメントのないファイルも中央の列と同じ動作になる</T>
    </Svg>
  )
}

/* ---------- 図 6 配列の共有と dup ---------- */
function SharedFigure() {
  return (
    <Svg id={figureNumber(95, 6)} w={780} h={305}
      label="変数 tags は Array を指す。article が指す Hash の tags の値も同じ Array を指す。article.dup で作った h2 は別の Hash だが、その tags の値も同じ Array を指している。そのため h2[:tags] に nginx を追加すると、tags と article[:tags] からも nginx が見える">
      <Box x={20} y={30} w={150} h={36} lines="tags" mono />
      <Box x={20} y={110} w={150} h={36} lines="article" mono />
      <Box x={20} y={200} w={150} h={36} lines="h2 = article.dup" mono fs={12} />
      <Box x={230} y={90} w={210} h={76} lines={['Hash（article）', 'id: 42', 'title: "Rails 入門"', 'tags: →']} fs={12} align="start" />
      <Box x={230} y={190} w={210} h={76} lines={['Hash（dup で作った複製）', 'id: 42', 'title: "Rails 入門"', 'tags: →']} fs={12} align="start" fill="box2" />
      <Box x={520} y={96} w={240} h={70} lines={['Array（1つだけ）', '["ruby", "rails", "http",', ' "sql", "nginx"]']} fs={12} align="start" fill="box4" accent />
      <Arrow x1={170} y1={48} x2={518} y2={108} />
      <Arrow x1={170} y1={128} x2={228} y2={128} />
      <Arrow x1={170} y1={218} x2={228} y2={226} />
      <Arrow x1={440} y1={153} x2={518} y2={142} accent />
      <Arrow x1={440} y1={253} x2={518} y2={160} accent />
      <T x={20} y={290} fs={11} tone="muted">{'h2[:tags] << "nginx" は Array を書き換えるので、tags・article[:tags]・h2[:tags] のどれから読んでも nginx が見える'}</T>
    </Svg>
  )
}

/* ---------- 図 7 真偽の判定と nil? ・ blank? ---------- */
function TruthFigure() {
  const values = ['nil', 'false', '0', '""', '"  "', '[]', '{}', '"false"']
  const rows: { label: string; hit: boolean[]; yes: string; no: string }[] = [
    { label: 'if・&&・|| での判定', hit: [true, true, false, false, false, false, false, false], yes: '偽', no: '真' },
    { label: 'x.nil?', hit: [true, false, false, false, false, false, false, false], yes: 'true', no: 'false' },
    { label: 'x.blank?', hit: [true, true, false, true, true, true, true, false], yes: 'true', no: 'false' },
  ]
  const x0 = 170
  const cw = 74
  return (
    <Svg id={figureNumber(95, 7)} w={780} h={200}
      label="8つの値を3つの方法で判定した結果。if では nil と false だけが偽で、0、空文字列、空白だけの文字列、空配列、空ハッシュ、文字列の false は真。nil? が true になるのは nil だけ。Active Support の blank? は nil、false、空文字列、空白だけの文字列、空配列、空ハッシュで true になり、0 と文字列の false では false になる">
      {values.map((v, i) => (
        <T key={v} x={x0 + i * cw + cw / 2} y={24} anchor="middle" mono fs={12}>{v}</T>
      ))}
      {rows.map((row, r) => (
        <g key={row.label}>
          <T x={16} y={60 + r * 40} fs={12} mono={r > 0}>{row.label}</T>
          {row.hit.map((hit, i) => (
            <g key={i}>
              <rect x={x0 + i * cw + 3} y={42 + r * 40} width={cw - 6} height={34} rx={4} fill={hit ? 'var(--fig-box5)' : 'var(--fig-bg)'} stroke={hit ? 'var(--fig-accent)' : 'var(--fig-line)'} />
              <T x={x0 + i * cw + cw / 2} y={59 + r * 40} anchor="middle" fs={12}>{hit ? row.yes : row.no}</T>
            </g>
          ))}
        </g>
      ))}
      <T x={16} y={176} fs={11} tone="muted">色の付いたセルが「偽」または true。if で偽になるのは nil と false だけ。blank? は Active Support が追加するメソッド</T>
    </Svg>
  )
}

/* ---------- 図 9 &. と ||= の評価の順 ---------- */
function NilFlowFigure() {
  return (
    <Svg id={figureNumber(95, 9)} w={780} h={268}
      label="左は article.author&.name の評価。article.author を評価し、結果が nil なら name を呼ばずに式の値を nil にする。nil でなければ、false であっても name を呼ぶ。右は @user ||= find_user の評価。@user を読み、nil か false なら find_user を呼んで結果を代入する。そうでなければ @user をそのまま返し、右辺は評価しない">
      <T x={20} y={20} bold mono fs={12}>article.author&amp;.name</T>
      <Box x={30} y={36} w={320} h={36} lines="article.author を評価する" fs={12} />
      <Arrow x1={190} y1={72} x2={190} y2={92} />
      <Box x={30} y={94} w={320} h={36} lines="結果は nil か" fs={12} fill="box2" />
      <Arrow x1={140} y1={130} x2={100} y2={168} />
      <Arrow x1={240} y1={130} x2={280} y2={168} />
      <T x={96} y={146} fs={11} tone="muted">はい</T>
      <T x={268} y={146} fs={11} tone="muted">いいえ</T>
      <Box x={20} y={170} w={160} h={50} lines={['name を呼ばない', '式の値は nil']} fs={12} fill="box5" subTone="muted" />
      <Box x={200} y={170} w={160} h={50} lines={['name を呼ぶ', 'false でも呼ぶ']} fs={12} subTone="muted" />
      <line x1={390} y1={10} x2={390} y2={230} stroke="var(--fig-line)" strokeDasharray="4 4" />
      <T x={410} y={20} bold mono fs={12}>@user ||= find_user</T>
      <Box x={420} y={36} w={330} h={36} lines="@user を読む" fs={12} />
      <Arrow x1={585} y1={72} x2={585} y2={92} />
      <Box x={420} y={94} w={330} h={36} lines="nil または false か" fs={12} fill="box2" />
      <Arrow x1={535} y1={130} x2={495} y2={168} />
      <Arrow x1={635} y1={130} x2={675} y2={168} />
      <T x={491} y={146} fs={11} tone="muted">はい</T>
      <T x={663} y={146} fs={11} tone="muted">いいえ</T>
      <Box x={410} y={170} w={170} h={50} lines={['find_user を呼び', '結果を @user に代入']} fs={12} fill="box5" subTone="muted" />
      <Box x={590} y={170} w={170} h={50} lines={['@user をそのまま返す', '右辺は評価しない']} fs={12} subTone="muted" />
      <T x={20} y={248} fs={11} tone="muted">a&amp;.b.c は a が nil のとき .c を nil に対して呼ぶ</T>
      <T x={410} y={248} fs={11} tone="muted">find_user が nil を返すと、次の呼び出しでも再び呼ぶ</T>
    </Svg>
  )
}

/* ---------- 図 10 params の値の型 ---------- */
function ParamsFigure() {
  return (
    <Svg id={figureNumber(95, 10)} w={780} h={275}
      label="GET /articles/42?page=2 の要求を Rails が解析し、params の id と page はどちらも文字列になる。page はアプリのコードで Integer(params[:page], 10) で整数の 2 にしてから範囲を確かめる。id は Article.find に渡すと列の型に合わせて 42 に変換され、WHERE id = 42 の SQL になる。変換できない値は、Integer では例外か nil、find では該当行がなければ RecordNotFound になる">
      <Box x={20} y={20} w={210} h={50} lines={['要求の URL', 'GET /articles/42?page=2']} fs={12} subTone="muted" />
      <Arrow x1={230} y1={45} x2={268} y2={45} />
      <Box x={270} y={20} w={230} h={50} lines={['ルーティングとクエリの解析', 'Rails が params を作る']} fs={12} subTone="muted" />
      <Arrow x1={500} y1={45} x2={538} y2={45} />
      <Box x={540} y={20} w={220} h={50} lines={['params（値はすべて文字列）', 'id: "42"、page: "2"']} fs={12} fill="box4" subTone="muted" accent />
      <Arrow x1={600} y1={70} x2={405} y2={118} />
      <Arrow x1={650} y1={70} x2={650} y2={118} />
      <Box x={290} y={120} w={230} h={56} lines={['Integer(params[:page], 10)', 'アプリのコードで変換 → 2']} fs={12} subTone="muted" />
      <Box x={540} y={120} w={220} h={56} lines={['Article.find(params[:id])', '列の型で変換 → 42']} fs={12} subTone="muted" />
      <Arrow x1={405} y1={176} x2={405} y2={208} />
      <Arrow x1={650} y1={176} x2={650} y2={208} />
      <Box x={290} y={210} w={230} h={50} lines={['page は Integer の 2', '1〜100 の範囲かを確かめる']} fs={12} fill="box5" subTone="muted" />
      <Box x={540} y={210} w={220} h={50} lines={['SQL: WHERE id = 42', 'LIMIT 1']} fs={12} mono fill="box5" subTone="muted" />
      <Box x={20} y={120} w={250} h={140} dashed align="start" fs={11} lines={['変換できない値のとき', 'Integer("abc", 10) は ArgumentError', '  exception: false なら nil', 'find は該当する行がなければ', '  RecordNotFound（既定で 404）']} />
    </Svg>
  )
}

const chapter: Chapter = {
  number: 95,
  part: 1,
  title: 'Ruby の基本文法とデータ型',
  summary: '記事の題名や価格、公開状態を表す小さなプログラムを Ruby 4.0.9 で実行し、値の種類、変数、条件式、メソッドの書き方を確かめます。Rails のコードでよく見る params[:id]、&.、||= も、何を返すかを実行して読みます。',
  goals: [
    '値を表す主なクラス（Integer・Float・BigDecimal・String・Symbol・Array・Hash・Range・nil・true・false）を使い分ける',
    '金額の計算で Float を避ける理由を、実行結果から説明できる',
    'nil と false だけが偽になる規則をもとに、条件式と &.、||= の動きを読める',
    '位置引数とキーワード引数を持つメソッドを定義し、引数の誤りで出る例外を読める',
    'params から受け取った文字列を、使う直前に必要な型へ変換できる',
  ],
  prerequisites: [],
  sections: [
    { id: 'values', title: '値と変数', body: <>
      <p>Ruby のプログラムはテキストファイルに書き、<code>ruby ファイル名</code> で実行します。1行ずつ試すなら、対話的に式を評価する irb も使えます。この章の例は Docker の <code>ruby:4.0</code> イメージ（Ruby 4.0.9）で次のように実行し、出力をそのまま載せています<Ref n={1} />。</p>
      <Code lang="bash" title="この章の例の実行方法" code={`
$ docker run --rm -v "$PWD":/work -w /work ruby:4.0 ruby values.rb
`} />
      <p>出力には <code>p</code> と <code>puts</code> の2つのメソッドを使います。<code>p</code> は値を Ruby のコードに近い形で表示するので、文字列は引用符付き、nil は <code>nil</code> と表示されます。<code>puts</code> は値を文字列にして表示するので、引用符は付かず、nil は空行になります。コードの中の <code>{'# =>'}</code> の後ろはその式の値を <code>p</code> で表示した結果です。</p>
      <Code lang="ruby" title="values.rb" code={`
title = "Rails 入門"
copy = title
p title.class
p copy.equal?(title)
copy << "（第2版）"
p title
title = 42
p title.class
p copy
p 7 / 2
p 7.0 / 2
p 7.fdiv(2)
p 7 % 3
p -7 / 2
p 2 ** 100
p (2 ** 100).class
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
String
true
"Rails 入門（第2版）"
Integer
"Rails 入門（第2版）"
3
3.5
3.5
1
-4
1267650600228229401496703205376
Integer
`} />
      <p><code>title = "Rails 入門"</code> はローカル変数 <code>title</code> に文字列を代入します。Ruby には変数を宣言するキーワードも型の指定もなく、最初に代入した時点で変数ができます<Ref n={3} />。変数は値そのものではなく、値（オブジェクト）を指す名前です。<code>copy = title</code> は文字列を複製せず、同じオブジェクトをもう一つの名前で指します。<code>equal?</code> は2つが同じオブジェクトかを調べるメソッドで、結果は true でした。</p>
      <p>そのため <code>copy &lt;&lt; "（第2版）"</code> で文字列の末尾に追加すると、<code>title</code> から読んでも「（第2版）」が付いています。<code>&lt;&lt;</code> は指しているオブジェクトそのものを書き換えるからです。一方、続けて <code>title = 42</code> を実行すると、<code>title</code> は Integer の 42 を指すようになり、<code>copy</code> は元の文字列を指したままです。代入は変数が指す先を変えるだけで、元のオブジェクトには触れません（図 {figureNumber(95, 1)}）。</p>
      <Figure n={figureNumber(95, 1)} title="変数はオブジェクトを指す名前" caption="values.rb の前半を図にした模式図。CRuby では小さな整数をオブジェクトの領域に置かずに値として埋め込む（即値）が、Integer は書き換えられないので、Ruby のコードからは他のオブジェクトと同じように扱える。">
        <VariableFigure />
      </Figure>
      <p>同じ変数が文字列も整数も指せるので、値の種類（型）は実行時に決まります。TypeScript のように代入の時点で型を検査する仕組みは Ruby 本体にはありません。題名を引数で受け取るメソッドでは、期待する型や値がないときの扱いを呼び出し元との約束として決め、テストで確かめます。</p>
      <p>数値の計算で他の言語と結果が違いやすいのは整数の割り算です。整数同士の <code>7 / 2</code> は小数部を捨てて <code>3</code> を返します。小数の結果が必要なら一方を <code>7.0</code> のように Float にするか、<code>fdiv</code> を使います。負の数では <code>-7 / 2</code> が <code>-4</code> になりました。Ruby の整数除算は小さいほうへ丸めるためで、0 の方向へ切り捨てる C や Java（結果は -3）とは異なります<Ref n={12} />。<code>2 ** 100</code> のように桁数が大きくなっても、Integer は自動的に必要な桁を確保し、クラスは Integer のままです。</p>
      <Figure n={figureNumber(95, 2)} title="この章で扱う値と Ruby のクラス" caption="コードに直接書いた値をリテラルと呼ぶ。BigDecimal はリテラルの書き方がなく、BigDecimal(&quot;0.57&quot;) のようにメソッドで作る。"><div className="table-wrap"><table><thead><tr><th>例</th><th>クラス</th><th>用途</th></tr></thead><tbody>
        <tr><td><code>42</code></td><td>Integer</td><td>件数、識別子、通貨の最小単位で数えた金額</td></tr>
        <tr><td><code>0.25</code></td><td>Float</td><td>割合や計測値など、近似値でよい小数</td></tr>
        <tr><td><code>BigDecimal("0.57")</code></td><td>BigDecimal</td><td>十進の小数を正確に扱いたい金額や数量</td></tr>
        <tr><td><code>"Rails"</code></td><td>String</td><td>表示する文字列、外部から受け取った文字列</td></tr>
        <tr><td><code>:published</code></td><td>Symbol</td><td>状態やキーなど、プログラム内で使う名前</td></tr>
        <tr><td><code>["ruby", "rails"]</code></td><td>Array</td><td>順序がある値の並び</td></tr>
        <tr><td><code>{'{ id: 42 }'}</code></td><td>Hash</td><td>キーと値の対応</td></tr>
        <tr><td><code>1..10</code></td><td>Range</td><td>値の範囲</td></tr>
        <tr><td><code>true</code> / <code>false</code></td><td>TrueClass / FalseClass</td><td>真偽</td></tr>
        <tr><td><code>nil</code></td><td>NilClass</td><td>値がない状態</td></tr>
      </tbody></table></div></Figure>
    </> },
    { id: 'objects', title: 'すべての値はオブジェクトで、式は値を返す', body: <>
      <p>Java の <code>int</code> や <code>null</code> はオブジェクトではなく、メソッドを呼べません。Ruby では、整数も nil も true もそれぞれクラスを持つオブジェクトです。オブジェクトはデータと、そのデータに対してできる操作（メソッド）をまとめたもので、どのメソッドを呼べるかはクラスで決まります。<code>class</code> はコード中の定義を始めるキーワードとしても現れますが、<code>42.class</code> のようにピリオドの直後に書くとメソッドの呼び出しです。</p>
      <Code lang="ruby" title="objects.rb" code={`
p nil.class
p nil.to_a
p nil.to_s
p true.class
p 3.class.ancestors
x = if 3 > 2 then "大きい" else "小さい" end
p x
r = def hello = "hi"
p r
p(puts("出力"))
p (y = 5)
p 3.times.to_a
p Integer.class
begin
  nil.upcase
rescue NoMethodError => e
  puts e.message
end
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
NilClass
[]
""
TrueClass
[Integer, Numeric, Comparable, Object, Kernel, BasicObject]
"大きい"
:hello
出力
nil
5
[0, 1, 2]
Class
undefined method 'upcase' for nil
`} />
      <p>nil は NilClass のオブジェクトで、<code>to_a</code> や <code>to_s</code> を持っています<Ref n={19} />。<code>3.class.ancestors</code> は Integer のメソッドを探すときにたどるクラスとモジュールの並びです。<code>Comparable</code> は大小比較のメソッドをまとめたモジュールで、Integer はこれを取り込んでいます。メソッドを探す順序は <ChapterLink n={2} section="method-lookup" />で扱います。クラスそのものも <code>Integer.class</code> が <code>Class</code> を返すオブジェクトです。</p>
      <p>Ruby では、ほとんどの構文が値を返す式です。<code>if</code> は選ばれた分岐の最後の式の値を返すので、その結果を変数に代入できます。<code>def</code> は定義したメソッドの名前をシンボル（<code>:hello</code>）で返し、代入式は代入した値を返します。<code>puts</code> は文字列を表示しますが、戻り値は nil です。メソッドの最後に <code>puts</code> を書くと、そのメソッドの戻り値も nil になります（<ChapterLink n={95} section="methods" />）。</p>
      <p>最後の行の <code>undefined method 'upcase' for nil</code> は、nil に対して文字列のメソッドを呼んだときの NoMethodError のメッセージです。Rails の開発ではこの形のエラーがよく発生します。原因はメソッドの名前ではなく、メソッドを呼んだオブジェクト（<code>.</code> の前に書いたもの。レシーバと呼ぶ）が nil だったことにあります。<code>find_by</code> が該当する行を見つけられなかった、ハッシュに期待したキーがなかった、関連先が設定されていなかった、などが典型です。どこで nil が入ったかを調べる方法と、nil があり得る場面での書き方は「nil を扱う書き方」の節で扱います。</p>
      <p>クラスを自分で定義する方法、インスタンスとインスタンス変数は <ChapterLink n={2} section="class-instance" />で学びます。この章では標準のクラスのオブジェクトを使うことに絞ります。</p>
    </> },
    { id: 'numbers', title: '数値：Integer・Float・BigDecimal', body: <>
      <p>Ruby の数値には整数の Integer、浮動小数点数の Float、十進の小数を扱う BigDecimal などがあります。Integer は桁数に上限がなく、件数や ID、円単位の金額を正確に扱えます。Float は IEEE 754 の倍精度（64 ビット）の2進数で値を表すため、十進の 0.1 や 0.57 を正確には表せません<Ref n={10} />。金額の計算で Float を使うとどうなるかを確かめます。</p>
      <Code lang="ruby" title="money.rb" code={`
require "bigdecimal"
require "bigdecimal/util"
p 0.1 + 0.2
p 0.1 + 0.2 == 0.3
p format("%.20f", 0.1)
p 0.57 * 100
p (0.57 * 100).to_i
prices = [0.1] * 10
p prices.sum
p prices.reduce(:+)
a = BigDecimal("0.57")
p a * 100
p (a * 100).to_i
p BigDecimal("0.1") + BigDecimal("0.2") == BigDecimal("0.3")
p "0.57".to_d
p BigDecimal("1") / 3
p (BigDecimal("1") / 3 * 3).to_s("F")
p BigDecimal("2178.5").round.to_i
p BigDecimal("2178.5").round(0, :half_even).to_i
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9、bigdecimal 4.1.3）" code={`
0.30000000000000004
false
"0.10000000000000000555"
56.99999999999999
56
1.0
0.9999999999999999
0.57e2
57
true
0.57e0
0.33333333333333333333333333333333e0
"0.99999999999999999999999999999999"
2179
2178
`} />
      <p><code>0.1 + 0.2</code> は <code>0.30000000000000004</code> になり、<code>0.3</code> と比べると false でした。<code>format("%.20f", 0.1)</code> で小数点以下20桁まで表示すると、0.1 と書いた Float には <code>0.10000000000000000555</code> という値が入っていることが分かります。十進の 0.1 に最も近い2進数の値が選ばれ、わずかな差が残ります。</p>
      <p>金額で問題になるのは <code>0.57 * 100</code> の行です。0.57 ドルをセントにするつもりで100を掛けると <code>56.99999999999999</code> になり、<code>to_i</code> は小数部を捨てるので <code>56</code> になりました。57セントのはずが56セントになり、1セント足りません（図 {figureNumber(95, 3)}）。<code>round</code> を使えばこの例は 57 になりますが、計算の途中で何度も丸めると結果がどこでずれたかを追いにくくなります。</p>
      <Figure n={figureNumber(95, 3)} title="Float の 0.57 が実際に持つ値" caption="数直線は値の並びを示す模式図で、間隔は実際の比率ではない。各値は format(&quot;%.20f&quot;, x) と prev_float・next_float で求めた。下の2行は money.rb の実行結果。">
        <FloatFigure />
      </Figure>
      <p>同じ0.1を10個足しても、<code>sum</code> は <code>1.0</code>、<code>reduce(:+)</code> は <code>0.9999999999999999</code> を返しました。Array の <code>sum</code> は Float を足すときに誤差を補正する計算方法（Kahan-Babuska の補正つき加算）を使い、<code>reduce(:+)</code> は前から順に <code>+</code> を呼ぶためです<Ref n={20} />。足し方で結果が変わる値は、請求額のように1円単位で一致させる値には使えません。</p>
      <p>BigDecimal は数値を十進で保持します。<code>BigDecimal("0.57") * 100</code> は <code>0.57e2</code>（0.57 × 10² で、十進の 57）になり、<code>to_i</code> も 57 でした<Ref n={11} />。表示の <code>0.57e2</code> は BigDecimal の inspect の書式で、<code>to_s("F")</code> を使うと <code>"57.0"</code> のように表示されます。BigDecimal は文字列から作ります。<code>"0.57".to_d</code> のように <code>bigdecimal/util</code> が追加する変換も使えます。ただし、計算済みの Float を BigDecimal に変えても、それまでに入った誤差は消えません。</p>
      <p>BigDecimal でも、割り切れない割り算では有限の桁で丸めます。<code>BigDecimal("1") / 3 * 3</code> は 1 ではなく 0.999… でした。また <code>round</code> の既定は四捨五入で、2178.5 は 2179 になります。<code>:half_even</code>（偶数への丸め。銀行丸めとも呼ぶ）を指定すると 2178 です。税額の端数を切り捨てるか四捨五入するかは型が決めてくれないので、仕様として決めてコードに書きます。</p>
      <p>bigdecimal は Ruby 3.4 から標準ライブラリではなく bundled gem（Ruby と一緒に配布されるが、gem として読み込むもの）になりました<Ref n={8} />。Rails のアプリでは Active Support が bigdecimal に依存しているので、Gemfile.lock に入ります。Rails の decimal 型の列の値は Active Model の型変換で BigDecimal になります<Ref n={18} />。属性の型を変換する仕組みは <ChapterLink n={11} section="types" />、金額を値オブジェクトとして表す設計は <ChapterLink n={33} section="value-objects" />で扱います。</p>
      <Code lang="ruby" title="円単位の整数で計算する（結果は # => の後ろ）" code={`
price = 1980
tax = (price * 10).div(100)     # => 198
price + tax                     # => 2178
1999 * 8 / 100                  # => 159（159.92 の小数部を捨てた）
(1999 * 8).fdiv(100)            # => 159.92
`} />
      <p>円のように小数部を持たない通貨では、金額を整数で持つ方法もよく使われます。この場合も割り算では小数部が捨てられるので、端数の扱いはやはり仕様で決めます。通貨が複数ある場合は、通貨ごとに最小単位の桁数が違う点に注意します（米ドルは1セント = 0.01ドル）。</p>
      <Figure n={figureNumber(95, 4)} title="金額の表し方の比較" caption="どれを選んでも、端数を丸める位置と方法は仕様として決める必要がある。"><div className="table-wrap"><table><thead><tr><th>表し方</th><th>計算の正確さ</th><th>注意すること</th><th>Rails の列の型の例</th></tr></thead><tbody>
        <tr><td>Integer（最小単位で数える）</td><td>足し算・掛け算は正確</td><td>割り算で小数部が捨てられる。通貨ごとに最小単位が違う</td><td><code>integer</code>・<code>bigint</code></td></tr>
        <tr><td>BigDecimal</td><td>十進の小数を正確に保持する</td><td>割り切れない割り算は有限の桁で丸める。Float から作ると Float の誤差が入る</td><td><code>decimal</code>（precision と scale を指定）</td></tr>
        <tr><td>Float</td><td>十進の多くの小数を近似する</td><td>足し方や丸めの位置で結果が変わる。等しいかの比較が成り立たないことがある</td><td><code>float</code>（金額には使わない）</td></tr>
      </tbody></table></div></Figure>
    </> },
    { id: 'strings', title: '文字列とシンボル', body: <>
      <p>文字列はダブルクォートかシングルクォートで囲んで書きます。ダブルクォートの中では <code>{'#{式}'}</code> で式の値を埋め込め（式展開）、<code>\n</code> のようなエスケープも改行として解釈されます。シングルクォートの中ではどちらもそのままの文字として扱います<Ref n={2} />。</p>
      <Code lang="ruby" title="strings.rb" code={`
name = "佐藤"
p "こんにちは、#{name}さん"
p 'こんにちは、#{name}さん'
p 'Rails 入門'.length
p 'Rails 入門'.bytesize
p "Rails 入門".encoding
a = "Ruby"
b = a + " 4.0"
p [a, b]
c = a.dup
c << " 4.0"
p [a, c]
p :draft.equal?(:draft)
p "draft".equal?("draft")
p "draft".to_sym
p :draft.to_s
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
"こんにちは、佐藤さん"
"こんにちは、\\#{name}さん"
8
12
#<Encoding:UTF-8>
["Ruby", "Ruby 4.0"]
["Ruby", "Ruby 4.0"]
true
false
:draft
"draft"
`} />
      <p>シングルクォートの文字列は <code>{'#{name}'}</code> を展開しないので、<code>p</code> は <code>#</code> の前に <code>\</code> を付けて「そのままの文字」と表示しました。<code>length</code> は文字数、<code>bytesize</code> はバイト数を返します。ソースファイルの文字列は UTF-8 で、日本語の「入門」は1文字3バイトなので、8文字で12バイトになります。MySQL の <code>VARCHAR(255)</code> の 255 は文字数ですが、HTTP ヘッダーの長さや外部 API の上限がバイト数で決まっている場合は <code>bytesize</code> で数えます。</p>
      <p>Ruby の文字列は書き換えられるオブジェクトです。<code>a + " 4.0"</code> は新しい文字列を作って返すので <code>a</code> は変わりません。<code>&lt;&lt;</code> はレシーバの文字列そのものに追加します。上の例では <code>dup</code> で複製してから追加したので、<code>a</code> は元のままでした。</p>
      <h3>文字列リテラルの凍結（Ruby 4.0 の動作）</h3>
      <p>凍結（freeze）したオブジェクトは書き換えられず、書き換えようとすると FrozenError が発生します。Ruby にはソースに書いた文字列リテラルを最初から凍結する設定があり、その既定値は変わりつつあります。Ruby 3.4 で、マジックコメント（ファイルの先頭に書いて解釈の方法を指定するコメント）のないファイルの文字列リテラルを書き換えると、非推奨の警告を出せるようになりました<Ref n={8} />。Ruby 4.0.9 でどう動くかを、同じファイルを起動方法を変えて実行して確かめました。</p>
      <Code lang="ruby" title="chilled.rb（マジックコメントなし）" code={`
$stdout.sync = true   # 警告（標準エラー出力）と p の出力の順をそろえる
s = "draft"
p s.frozen?
s << "!"
p s
p "draft".equal?("draft")
`} />
      <Code lang="ruby" title="frozen.rb（マジックコメントあり）" code={`
# frozen_string_literal: true
$stdout.sync = true
s = "draft"
p s.frozen?
p "draft".equal?("draft")
p (+s).frozen?
p s.dup.frozen?
p "id=#{42}".frozen?
s << "!"
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9。標準エラー出力も含む）" code={`
$ ruby chilled.rb
false
"draft!"
false
$ ruby -W:deprecated chilled.rb
false
chilled.rb:4: warning: literal string will be frozen in the future (run with --debug-frozen-string-literal for more information)
"draft!"
false
$ ruby --enable=frozen-string-literal chilled.rb
true
chilled.rb:4:in '<main>': can't modify frozen String: "draft" (FrozenError)
$ ruby frozen.rb
true
true
false
false
false
frozen.rb:9:in '<main>': can't modify frozen String: "draft" (FrozenError)
`} />
      <p>Ruby 4.0.9 でも、マジックコメントのないファイルの文字列リテラルは凍結されていませんでした。<code>frozen?</code> は false を返し、<code>&lt;&lt;</code> で書き換えられます。<code>-W:deprecated</code>（または <code>-w</code>）を付けたときだけ「将来凍結される」という警告が出ます。Ruby のドキュメントはこのように凍結されていないが書き換えると警告を出せる状態を chilled と呼んでいます<Ref n={9} />。<code>--enable=frozen-string-literal</code> を付けて起動すると、同じファイルでも書き換えた行で FrozenError になりました。</p>
      <p>ファイルの先頭に <code># frozen_string_literal: true</code> を書くと、そのファイルの文字列リテラルは凍結され、同じ内容のリテラルは同じオブジェクトになります（<code>equal?</code> が true）<Ref n={7} />。書き換えたい文字列は <code>+s</code>（凍結されていれば複製を返す単項の +）、<code>dup</code>、<code>String.new</code> で凍結されていない複製を作ります。<code>{'"id=#{42}"'}</code> のように式展開を含むリテラルは、マジックコメントがあっても凍結されません（図 {figureNumber(95, 5)}）。</p>
      <Figure n={figureNumber(95, 5)} title="文字列リテラルを書き換えたときの結果（Ruby 4.0.9）" caption="chilled.rb と frozen.rb の実行結果をまとめた図。マジックコメントはそれを書いたファイルにだけ効く。">
        <StringStateFigure />
      </Figure>
      <p>警告文には、文字列リテラルが将来凍結されると書かれています。リテラルを書き換えずに新しい文字列を作る書き方（<code>+</code> や式展開）にしておけば、既定が変わっても動作は変わりません。既存のコードがリテラルを書き換えていないかは、テストを <code>RUBYOPT=-W:deprecated</code> を付けて実行し、警告が出る行を探すことで調べられます。</p>
      <h3>シンボル</h3>
      <p><code>:draft</code> のようにコロンで始まる値はシンボル（Symbol）で、名前を表すオブジェクトです。同じ名前のシンボルはプログラムの実行中ずっと同じ1つのオブジェクトです。文字列の <code>"draft"</code> は、マジックコメントがなければ書くたびに別のオブジェクトになります（上の結果の true と false）。シンボルは書き換えられず、<code>to_s</code> で文字列に、文字列は <code>to_sym</code> でシンボルに変換できます。Rails では状態の名前、ハッシュのキー、列名、メソッド名をシンボルで渡すことが多くあります。<code>%i[show edit]</code> のようなシンボルの配列の書き方は <ChapterLink n={2} section="rails-syntax" />で扱います。</p>
    </> },
    { id: 'collections', title: '配列・ハッシュ・範囲', body: <>
      <p><Term>配列</Term>（Array）は順序がある値の集まりです。Ruby では最初の要素の添字が <code>0</code> なので、タグ一覧 <code>tags</code> の最初は <code>tags[0]</code> で取れます。<Term>ハッシュ</Term>（Hash）はキーと値の対応を持ちます。記事の題名を <code>article[:title]</code> で取り出す場合は、数値の位置を覚えずに項目名を指定できます。任意のキーをもつ設定値や、API の応答を受け取るときにもこの形を使います<Ref n={13} />。</p>
      <Code lang="ruby" title="collections.rb" code={`
tags = ["ruby", "rails", "http"]
p tags[0]
p tags[-1]
p tags[10]
p tags.first(2)
tags << "sql"
p tags
article = { id: 42, title: "Rails 入門", tags: tags }
p article[:author]
begin
  article.fetch(:author)
rescue KeyError => e
  puts "#{e.class}: #{e.message}"
end
p article.fetch(:author, "未設定")
p article.key?(:author)
counts = Hash.new(0)
%w[ruby rails ruby].each { |t| counts[t] += 1 }
p counts
p({ "title" => "x" }[:title])
h2 = article.dup
h2[:tags] << "nginx"
p article[:tags]
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
"ruby"
"http"
nil
["ruby", "rails"]
["ruby", "rails", "http", "sql"]
nil
KeyError: key not found: :author
"未設定"
false
{"ruby" => 2, "rails" => 1}
nil
["ruby", "rails", "http", "sql", "nginx"]
`} />
      <p>負の添字は末尾から数えるので、<code>tags[-1]</code> は最後の要素です。範囲外の <code>tags[10]</code> は例外ではなく nil を返します。<code>first(2)</code> は先頭の2件を新しい配列で返します。</p>
      <p>ハッシュにキーがなければ <code>article[:author]</code> は nil を返します。キーが存在して値が nil の場合も戻り値は同じなので、両者を区別するには <code>key?</code> を使います。必須のキーを <code>fetch</code> で取り出し、既定値を指定しなければ、キーが欠けた時点で KeyError が発生します。欠けたキーを後の処理まで持ち越さずにその場で見つけられます。例外が起きたときの扱いは <ChapterLink n={96} section="exceptions">例外処理</ChapterLink>で学びます。<code>Hash.new(0)</code> はキーがないときに 0 を返すハッシュで、件数を数える処理に使えます。</p>
      <p><code>:title</code> は Symbol、<code>"title"</code> は String です。普通の Hash では別のキーとして扱うので、文字列のキーで作ったハッシュを <code>[:title]</code> で引くと nil でした。標準の <code>JSON.parse</code> が返す Hash のキーは既定で String です（<code>symbolize_names: true</code> を渡すとシンボルになります）。Rails の <code>params</code> のように文字列とシンボルのどちらでも取り出せる入れ物もあるので、呼び出し元から何が渡るかを確認してからアクセス方法を決めます。</p>
      <p><code>article[:tags]</code> と <code>tags</code> は同じ配列を指します。<code>dup</code> はハッシュの外側だけを複製し、値として入っている配列は複製しません。そのため <code>h2[:tags] &lt;&lt; "nginx"</code> は、<code>tags</code> と <code>article[:tags]</code> から見ても nginx が追加された状態にしました（図 {figureNumber(95, 6)}）。呼び出し元から渡された配列やハッシュを書き換える処理では、その副作用を呼び出し元が期待しているかを確認します。入れ子の要素も独立させたい場合は、その要素も別に複製します。</p>
      <Figure n={figureNumber(95, 6)} title="dup で複製したハッシュと、共有されたままの配列" caption="collections.rb の後半を図にした模式図。dup が複製するのはレシーバのオブジェクトだけで、中に入っているオブジェクトは同じものを指す（浅い複製）。">
        <SharedFigure />
      </Figure>
      <h3>範囲（Range）</h3>
      <p><code>1..5</code> は1から5までの範囲を表す Range のオブジェクトです。点が2つなら終わりを含み、3つの <code>1...5</code> は終わりを含みません。終わりを省略した <code>1..</code> は上限のない範囲です<Ref n={14} />。</p>
      <Code lang="ruby" title="範囲の例（# => の後ろは p で表示した値）" code={`
(1..5).to_a           # => [1, 2, 3, 4, 5]
(1...5).to_a          # => [1, 2, 3, 4]
(1...5).include?(5)   # => false
(1..).first(3)        # => [1, 2, 3]
(1..10).step(3).to_a  # => [1, 4, 7, 10]
("a".."e").to_a       # => ["a", "b", "c", "d", "e"]
(10..1).to_a          # => []（始まりが終わりより大きいと空）
`} />
      <p>Rails では範囲を検索条件に渡すと SQL の比較になります。MySQL 8.4.13 の記事テーブルで <code>to_sql</code> を表示すると、<code>Article.where(views: 10..)</code> は <code>WHERE `articles`.`views` &gt;= 10</code>、<code>Article.where(views: 1...10)</code> は <code>WHERE `articles`.`views` &gt;= 1 AND `articles`.`views` &lt; 10</code> になりました。終わりを含むかどうかが SQL の <code>&lt;=</code> と <code>&lt;</code> の違いになるので、日付の範囲で「月末まで」を表すときは点の数を確認します。検索条件の組み立ては <ChapterLink n={12} section="where-order-limit" />で扱います。</p>
    </> },
    { id: 'conditions', title: '真と偽を判定する', body: <>
      <p>Ruby の条件式で偽と判定する値は <code>false</code> と <code>nil</code> だけです<Ref n={4} />。数値の <code>0</code>、空文字列、空配列はいずれも真と判定します。JavaScript では <code>0</code> や <code>""</code> が偽になり、Python では空のリストが偽になるので、他の言語から来た人が誤りやすい規則です。実際に8つの値を判定しました。</p>
      <Code lang="ruby" title="truthy.rb" code={`
[nil, false, true, 0, "", [], {}, "false", 0.0].each do |v|
  puts format("%-8s %s", v.inspect, v ? "真" : "偽")
end
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
nil      偽
false    偽
true     真
0        真
""       真
[]       真
{}       真
"false"  真
0.0      真
`} />
      <p>文字列に1文字以上入っているかを調べるなら <code>empty?</code>、数値の正負を調べるなら <code>positive?</code> のように、目的に合うメソッドを使います。Rails のコードでよく見る <code>blank?</code> と <code>present?</code> は、Ruby 本体ではなく Active Support が追加するメソッドです<Ref n={17} />。<code>blank?</code> は nil、false、空文字列、空白だけの文字列、空の配列とハッシュで true を返します（図 {figureNumber(95, 7)}）。<code>"".presence</code> は nil、<code>"Ruby".presence</code> は <code>"Ruby"</code> を返すので、空なら既定値を使う処理を <code>params[:q].presence || "すべて"</code> のように書けます。入力値がない場合と空の場合を区別するかは、入力の契約によって決まります。</p>
      <Figure n={figureNumber(95, 7)} title="if・nil?・blank? の判定の違い" caption="truthy.rb と、Active Support 8.1.4.1 を読み込んで blank? を呼んだ結果をまとめた。">
        <TruthFigure />
      </Figure>
      <h3>if・unless・case</h3>
      <Code lang="ruby" title="cases.rb" code={`
def views_label(views)
  case views
  when nil     then "未集計"
  when 0       then "なし"
  when 1..99   then "少ない"
  when Integer then "多い"
  else              "不明"
  end
end
p [nil, 0, 42, 1200, "12"].map { |v| views_label(v) }
p (1..99) === 42
p Integer === "12"

published = false
p(published ? "公開中" : "下書き")
puts "下書きです" unless published
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
["未集計", "なし", "少ない", "多い", "不明"]
true
false
"下書き"
下書きです
`} />
      <p><code>case</code> は <code>when</code> に書いた値の <code>===</code> メソッドに対象の値を渡し、最初に真を返した分岐を実行します。<code>===</code> の意味はクラスごとに違い、Range なら範囲に含まれるか、Integer のようなクラスならそのクラスのオブジェクトか、数値や文字列なら等しいかを調べます。そのため <code>when 1..99</code> や <code>when Integer</code> と書けます。文字列の <code>"12"</code> はどの分岐にも当てはまらず「不明」になりました。<code>else</code> を書かずに、どの分岐にも当てはまらなければ <code>case</code> の値は nil です。</p>
      <p><code>if</code> と <code>case</code> は値を返すので、変数に代入したりメソッドの結果として返したりできます。<code>unless</code> は条件が偽のときに実行する <code>if</code> の逆で、<code>puts "下書きです" unless published</code> のように文の後ろに置く書き方（修飾子）もよく使います。<code>条件 ? 真のときの値 : 偽のときの値</code> は三項演算子です。条件と実行結果が対になる処理では、評価結果を一か所で受け取ると、すべての分岐が何を返すかを比べられます。</p>
      <p><code>&amp;&amp;</code> と <code>||</code> は結果に不要な場合に右辺を評価しません。<code>count &amp;&amp; count.positive?</code> は <code>count</code> が nil なら右辺を実行しません。また、<code>&amp;&amp;</code> と <code>||</code> は true や false ではなく、最後に評価した値そのものを返します。<code>value || default</code> は <code>value</code> が false の場合にも既定値を選ぶので、明示的な false を設定値として扱う場合は、<code>nil?</code> やキーの有無を使って判断します。</p>
      <h3>同じ操作を繰り返す</h3>
      <p><code>while</code> は条件を評価し、真の間に本体を繰り返します。一覧の中身を順に処理したい場合は、配列の <code>each</code> が使えます。<code>while</code> では終了条件と、終わりに向けて値を変える処理をコードに書きます。配列を <code>each</code> で処理する場合は Ruby が次の要素を渡すので、要素の位置を表す数を変更する必要がありません。</p>
      <Code lang="ruby" title="繰り返しの例" code={`
remaining = 3
while remaining.positive?
  puts remaining
  remaining -= 1
end

["Ruby", "Rails"].each do |title|
  puts title
end

3.times { |i| print i, " " }
puts
[3, 0, 5, -1, 8].each do |n|
  next if n.zero?
  break if n.negative?
  print n, " "
end
puts
p [1, 2].each { |n| n * 10 }
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
3
2
1
Ruby
Rails
0 1 2
3 5
[1, 2]
`} />
      <p>最初の繰り返しは <code>3</code>、<code>2</code>、<code>1</code> を順に表示します。<code>remaining</code> が <code>0</code> になってから条件を評価すると結果が偽になり、終了します。<code>each</code> では <code>do</code> と <code>end</code> の中へ、一度に一つずつ題名が渡ります。このようにメソッドに渡す処理を<Term>ブロック</Term>と呼び、<code>{'{ |i| ... }'}</code> の形でも書けます。<code>times</code> は整数のメソッドで、0 から回数より1少ない数までをブロックに渡します。</p>
      <p><code>next</code> はその回の残りを飛ばして次の要素へ進み、<code>break</code> は繰り返し全体を終えます。0 を飛ばし、-1 で止まったので、表示は 3 と 5 だけです。最後の行のとおり、<code>each</code> はブロックの戻り値を集めず、レシーバの配列をそのまま返します。題名を表示する代わりに変換した結果を集めたい場合は、<ChapterLink n={96} section="each">Enumerable の章</ChapterLink>で <code>map</code> などとの違いを比べられます。ブロックの仕組みは <ChapterLink n={4} section="block-basics" />で扱います。</p>
    </> },
    { id: 'methods', title: 'メソッドの引数と戻り値', body: <>
      <p><code>def</code> と <code>end</code> の間にメソッドを定義します。引数は呼び出し元から受け取る値です。<code>def price_label(amount, currency = "円")</code> の <code>amount</code> は位置引数で、呼び出すときに書いた順に値が入ります。<code>currency = "円"</code> のように既定値を書いた位置引数は省略できます。<code>title:</code> のように名前の後ろにコロンを付けた引数は<Term>キーワード引数</Term>で、呼び出す側で <code>title: "Rails 入門"</code> と名前を付けて渡すので、値の役割が分かります。既定値のないキーワード引数は必須です<Ref n={5} />。</p>
      <Code lang="ruby" title="article_label.rb（# => の後ろは p で表示した値）" code={`
def article_label(title:, published: false)
  return "題名なし" if title.empty?

  status = published ? "公開中" : "下書き"
  "[#{status}] #{title}"
end

p article_label(title: "Rails 入門")                   # => "[下書き] Rails 入門"
p article_label(title: "Rails 入門", published: true)   # => "[公開中] Rails 入門"
`} />
      <p><code>published: false</code> は、指定がないときの既定値が <code>false</code> であることを表します。途中で <code>return</code> を実行した場合は、その時点でメソッドを抜けます。<code>return</code> を実行する分岐を通らなければ、最後に評価した式が戻り値です。この例では末尾の文字列が戻り値になります。</p>
      <Figure n={figureNumber(95, 8)} title="題名を表示するメソッドの分岐" caption="早い段階で返したときは、後続の式は評価しない。"><div className="table-wrap"><table><thead><tr><th>引数の状態</th><th>メソッドが評価する式</th><th>戻り値</th></tr></thead><tbody>
        <tr><td>題名が空</td><td>先頭の <code>return</code></td><td>題名なし</td></tr>
        <tr><td>題名あり、非公開</td><td>状態を下書きとして末尾の式を評価</td><td>[下書き] と題名</td></tr>
        <tr><td>題名あり、公開済み</td><td>状態を公開中として末尾の式を評価</td><td>[公開中] と題名</td></tr>
      </tbody></table></div></Figure>
      <p>位置引数とキーワード引数を組み合わせたメソッドで、渡し方を誤ったときに何が起きるかを確かめます。</p>
      <Code lang="ruby" title="methods.rb" code={`
def price_label(amount, currency = "円", tax_included: true, note:)
  label = "#{amount}#{currency}"
  label += "（税込）" if tax_included
  "#{label} #{note}"
end

p price_label(1980, note: "送料別")
p price_label(10, "ドル", tax_included: false, note: "")
[
  -> { price_label(note: "x") },
  -> { price_label(1980) },
  -> { price_label(1980, note: "x", color: "red") },
  -> { price_label(1, "円", "x", note: "y") },
].each do |call|
  call.call
rescue ArgumentError => e
  puts "ArgumentError: #{e.message}"
end

def empty_title?(title) = title.strip.empty?
p empty_title?("  ")
def log_title(title)
  puts title
end
p log_title("Ruby")
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
"1980円（税込） 送料別"
"10ドル "
ArgumentError: wrong number of arguments (given 0, expected 1..2; required keyword: note)
ArgumentError: missing keyword: :note
ArgumentError: unknown keyword: :color
ArgumentError: wrong number of arguments (given 3, expected 1..2; required keyword: note)
true
Ruby
nil
`} />
      <p>例の <code>{'-> { ... }'}</code> は処理をあとで呼び出せる形で作る書き方（lambda）で、ここでは4通りの誤った呼び出しを順に試すために使っています。メッセージから、それぞれ何が誤りかが読み取れます。<code>expected 1..2</code> は位置引数を1個か2個受け取ることを、<code>missing keyword: :note</code> は必須のキーワード引数がないことを、<code>unknown keyword: :color</code> は定義にない名前を渡したことを示します。どれも呼び出した時点で ArgumentError になるので、引数の誤りはメソッドの本体が動く前に見つかります。ただし、渡した値の型までは検査しません。<code>published:</code> に文字列の <code>"false"</code> を渡すと、その文字列は条件式で真と判定されます。JSON の真偽値やフォームの文字列など、入力元によって値が異なる場合は、メソッドを呼ぶ側で合意した型にそろえます。</p>
      <p><code>def empty_title?(title) = title.strip.empty?</code> は、本体が1つの式だけのメソッドを1行で書く書き方です（Ruby 3.0 以降）。名前の末尾の <code>?</code> は真偽を返すメソッドに付けます。<code>!</code> は同じ名前のメソッドが2つあるとき、レシーバを書き換えるほうや失敗を例外で知らせるほうに付ける慣習で、Rails の <code>save</code> と <code>save!</code> もこの例です。</p>
      <p>最後の <code>log_title</code> は題名を表示しますが、戻り値は nil でした。末尾の <code>puts</code> の戻り値が nil だからです。文字列を返すつもりで末尾に <code>puts</code> を書くと、呼び出し元は期待した値を受け取れません。表示用の文字列を返すメソッドと、出力するメソッドを分けておけば、記事一覧を HTML にする場合も画面に返す前にラベルの戻り値をテストできます。</p>
      <p>最後の引数に <code>name: 値</code> を並べたときに <code>{'{}'}</code> を省略できる書き方や、残りの引数をまとめて受け取る <code>*args</code> と <code>**options</code> は <ChapterLink n={2} section="rails-syntax" />で扱います。呼び出したメソッドがどのクラスに定義されているかは <ChapterLink n={2} section="class-instance">クラスとインスタンス</ChapterLink>から学べます。短い処理を引数のように渡す Rails の書き方には、<ChapterLink n={4} section="block-basics">ブロック</ChapterLink>の仕組みが必要です。</p>
    </> },
    { id: 'nil-safety', title: 'nil を扱う書き方：&. と ||=', body: <>
      <p>Rails のコードでは、値がないことを nil で表す場面が多くあります。<code>find_by</code> は該当する行がなければ nil を返し、<code>belongs_to</code> の関連先が任意なら <code>article.author</code> も nil になり得ます。nil に対してメソッドを呼ぶと NoMethodError になるので、Ruby には nil を扱うための短い書き方があります。ここでは記事と著者を、属性を持つ小さなクラスを作る <code>Struct</code> で表して試します。</p>
      <Code lang="ruby" title="nilsafe.rb" code={`
Author = Struct.new(:name)
Article = Struct.new(:title, :author)
a1 = Article.new("Ruby", Author.new("佐藤"))
a2 = Article.new("Rails", nil)
p a1.author&.name
p a2.author&.name
begin
  a2.author.name
rescue NoMethodError => e
  puts "NoMethodError: #{e.message}"
end
p a2.author&.name&.upcase
p a2.author&.name.upcase rescue puts "&. の後ろの .upcase: #{$!.message}"
p false&.to_s

x = nil
x ||= "既定値"
p x
flag = false
flag ||= true
p flag

h = { user: { profile: { name: "佐藤" } } }
p h.dig(:user, :profile, :name)
p h.dig(:user, :address, :city)
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
"佐藤"
nil
NoMethodError: undefined method 'name' for nil
nil
&. の後ろの .upcase: undefined method 'upcase' for nil
"false"
"既定値"
true
"佐藤"
nil
`} />
      <p><code>&amp;.</code> は safe navigation 演算子と呼ばれ、レシーバが nil のときはメソッドを呼ばずに nil を返します。呼び出しを飛ばしたときは、メソッドに渡す引数も評価しません<Ref n={6} />。<code>a2.author&amp;.name</code> は nil、<code>&amp;.</code> を使わない <code>a2.author.name</code> は NoMethodError でした。</p>
      <p>注意する点が2つあります。1つ目は、<code>&amp;.</code> が飛ばすのはその1回の呼び出しだけだということです。<code>a2.author&amp;.name.upcase</code> では、<code>a2.author&amp;.name</code> が nil になった後、その nil に対して <code>.upcase</code> を呼び、NoMethodError になりました。JavaScript の <code>a?.b.c</code> は a が null なら残り全体を飛ばしますが、Ruby では続く呼び出しにもそれぞれ <code>&amp;.</code> を付けます。2つ目は、<code>&amp;.</code> が見るのは nil かどうかだけで、<code>false&amp;.to_s</code> は <code>to_s</code> を呼んで <code>"false"</code> を返したことです（図 {figureNumber(95, 9)} の左）。</p>
      <p><code>x ||= 値</code> は「x が nil か false なら値を代入する」という代入です。<code>x || (x = 値)</code> とほぼ同じ動作で、x が真なら右辺を評価しません<Ref n={3} />。false も置き換えるので、<code>flag ||= true</code> は false を true にしました。Rails では要求ごとに一度だけ調べた値をインスタンス変数に保存しておく（メモ化する）ために使われます。</p>
      <Code lang="ruby" title="memo.rb" code={`
class Controller
  attr_reader :calls
  def initialize = @calls = 0
  def find_user
    @calls += 1
    nil   # ログインしていない利用者
  end
  def current_user_or
    @current_user ||= find_user
  end
  def current_user_defined
    return @current_user2 if defined?(@current_user2)
    @current_user2 = find_user
  end
end
c = Controller.new
3.times { c.current_user_or }
p c.calls
c2 = Controller.new
3.times { c2.current_user_defined }
p c2.calls
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9）" code={`
3
1
`} />
      <p><code>@current_user ||= find_user</code> は、<code>find_user</code> が nil を返すと3回とも <code>find_user</code> を呼びました。nil を保存しても次の呼び出しで「nil だから代入する」と判定されるためです（図 {figureNumber(95, 9)} の右）。<code>find_user</code> が DB を検索するなら、ログインしていない利用者の要求では同じ SQL を何度も実行します。nil や false も結果として保存したい場合は、<code>defined?(@current_user2)</code> でインスタンス変数に代入済みかを調べる書き方にすると、呼び出しは1回でした。</p>
      <Figure n={figureNumber(95, 9)} title="&. と ||= を評価する順" caption="nilsafe.rb と memo.rb の結果をもとにした流れ図。">
        <NilFlowFigure />
      </Figure>
      <p>入れ子のハッシュから値を取り出すときは、<code>dig</code> が途中のどこかで nil になった時点で nil を返します。<code>h[:user][:address][:city]</code> と書くと、<code>h[:user][:address]</code> が nil なので、その次の <code>[:city]</code> で NoMethodError になります。</p>
      <p>これらの書き方は nil を例外にしないので、nil があってはならない場所で使うと誤りを隠します。記事に著者が必ずいる仕様なのに <code>article.author&amp;.name</code> と書くと、データの不整合があっても画面に空欄が出るだけで、どこで著者が欠けたかを調べる手がかりが残りません。nil が仕様として起こり得る場所だけで <code>&amp;.</code> を使い、必ずあるはずの値は <code>fetch</code> や <code>find</code>（見つからなければ例外）で取り出します。</p>
    </> },
    { id: 'practice', title: 'Rails に届いた入力を扱う', body: <>
      <p>ここまでの文法を、Rails のコントローラーでよく見る書き方と結び付けます。コントローラーの <code>params</code> は Hash ではなく、ActionController::Parameters というクラスのオブジェクトです<Ref n={16} />。actionpack 8.1.4.1 を読み込んで、<code>/articles/42?page=2</code> にフォームの値が付いた要求で作られる params に近いものを作りました。</p>
      <Code lang="ruby" title="params.rb" code={`
require "action_controller"
params = ActionController::Parameters.new(
  "id" => "42", "page" => "2",
  "article" => { "title" => "Rails 入門", "admin" => "1" }
)
p params[:id]
p params["id"]
p params[:id].class
p params[:article].class
p params[:missing]
p params.fetch(:page, "1")
begin
  params.require(:comment)
rescue ActionController::ParameterMissing => e
  puts "#{e.class}: #{e.message}"
end
permitted = params.require(:article).permit(:title)
p permitted.to_h
p params.dig(:article, :title)

id = 42
title = "Rails 入門"
p({ id:, title: })
p({ :id => 42 } == { id: 42 })
`} />
      <Code lang="text" title="実行結果（Ruby 4.0.9、actionpack 8.1.4.1）" code={`
"42"
"42"
String
ActionController::Parameters
nil
"2"
ActionController::ParameterMissing: param is missing or the value is empty or invalid: comment
{"title" => "Rails 入門"}
"Rails 入門"
{id: 42, title: "Rails 入門"}
true
`} />
      <p><code>params[:id]</code> と <code>params["id"]</code> はどちらも <code>"42"</code> を返しました。Parameters はキーを文字列で保持し、シンボルで引いても同じ値を返します。値のクラスは String です。URL のパスやクエリ文字列、フォームから届いた値は、数字に見えても文字列のままです。入れ子の値も Parameters で、<code>dig</code> や <code>fetch</code> もハッシュと同じように使えます。<code>require</code> は指定したキーがなければ ActionController::ParameterMissing を発生させ、<code>permit</code> は許可した属性だけを残します（<code>admin</code> は消えています）。params の作られ方と、許可する属性の決め方は <ChapterLink n={10} section="params" />で扱います。</p>
      <p>Rails のコードでは、ハッシュを短く書く記法が重なって現れます。<code>{'{ id: 42 }'}</code> はキーがシンボルのハッシュで、古い書き方の <code>{'{ :id => 42 }'}</code> と同じです。Ruby 3.1 からは、キーと同じ名前の変数があれば値を省略して <code>{'{ id:, title: }'}</code> と書けます<Ref n={15} />。<code>render json: {'{ id:, title: }'}</code> は、変数 id と title の値を持つハッシュを JSON にします。<code>redirect_to @article, notice: "保存しました"</code> のように、最後の引数の <code>{'{}'}</code> を省略して <code>名前: 値</code> を並べる書き方もあります。</p>
      <p>文字列で届いた値は数値を期待する処理のすぐ手前で型を変換し、許す範囲を決めます。そうすれば、文字列のまま計算したり、ページ数に負数を使ったりする誤りを防げます。<code>"abc".to_i</code> が <code>0</code> を返すように、変換メソッドによって扱いが異なります。<code>Integer("abc", 10, exception: false)</code> は、変換できなければ nil を返します。第2引数の <code>10</code> は十進数として読む指定で、省略すると <code>"0x1A"</code> のような16進の表記も受け付けます。</p>
      <Code lang="ruby" title="page_number.rb（# => の後ろは p で表示した値）" code={`
def page_number(raw)
  return nil unless raw.is_a?(String)

  number = Integer(raw, 10, exception: false)
  number if number && number.between?(1, 100)
end

p page_number("2")       # => 2
p page_number("abc")     # => nil
p page_number("101")     # => nil
`} />
      <p>この例はクエリ文字列から渡された文字列だけを対象にし、1から100までのページ番号を返します。<code>Integer</code> が許す文字の範囲は、アプリの入力規則と必ずしも一致しません。半角数字だけに制限したいときは変換前に書式も確かめます。値がなければ1ページ目を表示し、不正な値にはエラーを返す設計なら、欠落と変換失敗を同じ結果として扱う今回の例をそのまま使わず、呼び出し側でも理由を区別できる返り値を選びます。</p>
      <p>一方、<code>Article.find(params[:id])</code> は文字列のままで動きます。Active Record は条件に渡された値を列の型に合わせて変換するからです。MySQL 8.4.13 で <code>Article.find("42")</code> を実行すると、SQL は <code>WHERE `articles`.`id` = 42 LIMIT 1</code> になりました。属性への代入も同じで、integer 型の <code>views</code> に <code>"15"</code> を代入すると Integer の 15 になります（図 {figureNumber(95, 10)}）。アプリのコードで計算に使う値は自分で変換し、Active Record に渡す値は列の型による変換に任せる、と分けて考えると読みやすくなります。</p>
      <Figure n={figureNumber(95, 10)} title="URL から届いた値の型が変わる場所" caption="params.rb と MySQL 8.4.13 での Article.find(&quot;42&quot;) の実行結果をもとにした流れ図。ルーティングと params の作られ方は簡略化している。">
        <ParamsFigure />
      </Figure>
      <p>入力値の比較では値を変換する前と後を区別します。<code>"2" == 2</code> は偽ですが、文字列を整数に変換した後の <code>2 == 2</code> は真です。<code>=</code> は代入、<code>==</code> は値の種類に応じた比較に使います。値が一致するかを調べる処理では、変数にどの型が入るかをコードとテストで確かめます。</p>
      <p>JSON で受け取る場合には数値として届くこともあります。受け取り方を変えても、アプリ内部で扱うページ番号を同じ型と範囲にそろえれば、表示やデータベースへの問い合わせは入力元に依存しません。モデルの属性を更新する処理では、値をどの型として使うかに加え、どの属性をリクエストから変更できるかも決めます。一覧のページ番号はリクエストで受け取っても、利用者の管理権限を同じ方法で受け入れることはできません。入力の変換、保存できる値の条件、変更してよい属性は別々の検査です。</p>
    </> },
    { id: 'tradeoffs', title: '判断基準とトレードオフ', body: <>
      <p>この章で見た書き方には、同じ目的に複数の選択肢があります。どれを選ぶかの判断の材料をまとめます。表の「判断の目安」は本書の推奨で、チームの規約がある場合はそちらを優先します。</p>
      <Figure n={figureNumber(95, 11)} title="選択肢と判断の目安" caption="判断の目安は設計上の意見。事実として確かめた動作は各節の実行結果を参照。"><div className="table-wrap"><table><thead><tr><th>場面</th><th>選択肢</th><th>判断の目安</th></tr></thead><tbody>
        <tr><td>金額を計算する</td><td>Integer（最小単位）、BigDecimal、Float</td><td>Float は使わない。単一通貨で小数部のない金額なら Integer、税率や単価に小数があるなら BigDecimal。どちらでも端数処理を仕様で決める</td></tr>
        <tr><td>ハッシュから値を取る</td><td><code>h[:key]</code>、<code>h.fetch(:key)</code>、<code>h.fetch(:key, 既定値)</code></td><td>必ずあるはずのキーは <code>fetch</code> で取り、欠けたら例外にする。任意のキーは既定値付きの <code>fetch</code> で既定値を明示する</td></tr>
        <tr><td>ハッシュのキー</td><td>Symbol、String</td><td>コードの中で作るハッシュは Symbol。外部から来た JSON は String のまま扱うか、境界で一度だけ変換する</td></tr>
        <tr><td>nil かもしれない値</td><td><code>&amp;.</code>、<code>if</code> で分岐、例外にする</td><td>仕様で nil があり得る場所だけ <code>&amp;.</code>。あってはならない nil は例外にして早く見つける</td></tr>
        <tr><td>一度だけ計算する</td><td><code>||=</code>、<code>defined?</code></td><td>結果が nil や false になり得るなら <code>defined?</code> を使う</td></tr>
        <tr><td>文字列を数値にする</td><td><code>to_i</code>、<code>Integer(s, 10)</code></td><td>入力の検査では <code>Integer</code>。<code>to_i</code> は "abc" を 0 にするので、誤った入力を 0 と区別できない</td></tr>
        <tr><td>文字列リテラル</td><td>マジックコメントを書く、書かない</td><td>新しく書くファイルではリテラルを書き換えないコードにする。マジックコメントを書くかはチームで統一する</td></tr>
      </tbody></table></div></Figure>
      <p>多くの行に共通するのは、値がない場合や想定外の値が来た場合に、その場で例外にするか、既定値に置き換えて続けるかという選択です。既定値に置き換えると画面は表示され続けますが、誤りが後の処理まで運ばれ、原因の場所から離れたところで気づくことになります。例外にすると要求は失敗しますが、ログに原因の行が残ります。どちらを選ぶかは、その値が欠けたときに処理を続けてよいかで決めます。例外を発生させた後の扱いは <ChapterLink n={96} section="boundaries" />で考えます。</p>
      <Callout kind="note" title="型の検査を補う方法">
        <p>Ruby 本体は実行前に型を検査しませんが、型の情報を書く RBS と、それを使って検査する Steep などの道具があります。この本では扱いません。この章のように、境界で値を変換して範囲を確かめ、RSpec で入力の種類ごとの結果をテストする方法でも、多くの型の誤りを見つけられます。</p>
      </Callout>
      <h3>関連する章</h3>
      <ul>
        <li>クラスの定義、インスタンス変数、メソッドの探索：<ChapterLink n={2} section="class-instance" />、<ChapterLink n={2} section="method-lookup" /></li>
        <li>Rails のコードの省略記法（シンボルの配列、括弧の省略、<code>*args</code> と <code>**options</code>）：<ChapterLink n={2} section="rails-syntax" /></li>
        <li>ブロックと yield：<ChapterLink n={4} section="block-basics" /></li>
        <li>配列とハッシュを加工するメソッドと例外処理：<ChapterLink n={96} /></li>
        <li>params の作られ方と許可する属性：<ChapterLink n={10} section="params" /></li>
        <li>列の型と属性の型変換（decimal と BigDecimal）：<ChapterLink n={11} section="types" /></li>
        <li>金額を値オブジェクトで表す設計：<ChapterLink n={33} section="value-objects" /></li>
      </ul>
    </> },
  ],
  sources: [
    { title: 'Ruby Syntax', publisher: 'Ruby Documentation', url: `${RD}/syntax_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'リテラル、代入、条件式、メソッドの構文の一覧。実行例は Ruby 4.0.9 で実測。' },
    { title: 'Literals', publisher: 'Ruby Documentation', url: `${RD}/syntax/literals_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '文字列リテラルの引用符と式展開、シンボル、範囲、ハッシュのリテラル。' },
    { title: 'Assignment', publisher: 'Ruby Documentation', url: `${RD}/syntax/assignment_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'ローカル変数が代入で作られること、||= などの省略形の代入。' },
    { title: 'Control Expressions', publisher: 'Ruby Documentation', url: `${RD}/syntax/control_expressions_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'if・unless・case・while と、nil と false だけが偽であること。' },
    { title: 'Methods', publisher: 'Ruby Documentation', url: `${RD}/syntax/methods_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '位置引数、既定値、キーワード引数、戻り値、1行のメソッド定義。' },
    { title: 'Calling Methods', publisher: 'Ruby Documentation', url: `${RD}/syntax/calling_methods_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'safe navigation 演算子 &. がレシーバが nil のとき呼び出しと引数の評価を飛ばすこと。' },
    { title: 'Code Comments（Magic Comments）', publisher: 'Ruby Documentation', url: `${RD}/syntax/comments_rdoc.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'frozen_string_literal の指定、既定値、--enable=frozen-string-literal、式展開を含むリテラルは凍結しないこと。' },
    { title: 'NEWS for Ruby 3.4.0', publisher: 'Ruby Documentation', url: `${RD}/NEWS/NEWS-3_4_0_md.html`, accessed: '2026-11-27', version: 'Ruby 3.4.0', note: 'マジックコメントのないファイルの文字列リテラルを書き換えると非推奨の警告を出せること（-W:deprecated）。bigdecimal が bundled gem になったこと。' },
    { title: 'class String', publisher: 'Ruby Documentation', url: `${RD}/String.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '+string が凍結済みや chilled の文字列の複製を返すこと、length と bytesize。' },
    { title: 'class Float', publisher: 'Ruby Documentation', url: `${RD}/Float.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'Float が倍精度の浮動小数点数で、十進の小数を近似すること。prev_float・next_float。' },
    { title: 'class BigDecimal', publisher: 'Ruby Documentation', url: `${RD}/BigDecimal.html`, accessed: '2026-11-27', version: 'Ruby 4.0（bigdecimal 4.1.3 で実測）', note: '十進の任意精度の数値、文字列からの生成、round の丸め方法。' },
    { title: 'class Integer', publisher: 'Ruby Documentation', url: `${RD}/Integer.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '整数除算の結果、fdiv、div、桁数の上限がないこと。' },
    { title: 'class Hash', publisher: 'Ruby Documentation', url: `${RD}/Hash.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '[] と fetch と key?、既定値、dig、dup。' },
    { title: 'class Range', publisher: 'Ruby Documentation', url: `${RD}/Range.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: '.. と ... の違い、終わりのない範囲、step。' },
    { title: 'NEWS for Ruby 3.1.0', publisher: 'Ruby Documentation', url: `${RD}/NEWS/NEWS-3_1_0_md.html`, accessed: '2026-11-27', version: 'Ruby 3.1.0', note: 'ハッシュリテラルとキーワード引数で値を省略できるようになったこと。' },
    { title: 'ActionController::Parameters', publisher: 'Ruby on Rails API', url: 'https://api.rubyonrails.org/v8.1/classes/ActionController/Parameters.html', accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: '文字列とシンボルのどちらのキーでも引けること、require・permit・fetch・dig。' },
    { title: 'Active Support Core Extensions（blank? and present?）', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_support_core_extensions.html#blank-questionmark-and-present-questionmark', accessed: '2026-11-27', version: 'Rails 8.1', note: 'blank? が true になる値と presence。' },
    { title: 'activemodel/lib/active_model/type/decimal.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activemodel/lib/active_model/type/decimal.rb`, accessed: '2026-11-27', version: 'Rails 8.1.4.1', note: 'decimal 型の値を BigDecimal に変換すること（65行目付近の BigDecimal(value, precision ...)）。' },
    { title: 'class NilClass', publisher: 'Ruby Documentation', url: `${RD}/NilClass.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'nil が NilClass のオブジェクトで、to_a・to_s などを持つこと。' },
    { title: 'class Array（sum）', publisher: 'Ruby Documentation', url: `${RD}/Array.html`, accessed: '2026-11-27', version: 'Ruby 4.0', note: 'Array#sum の実装（ドキュメントに表示される C のソース）が Float の加算に Kahan-Babuska の補正つき加算を使うこと。' },
  ],
}

export default chapter
