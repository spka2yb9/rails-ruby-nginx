import { Arrow, Box, Svg, T } from '../components/diagram'

/* 第19章（ID 37）インデックスと実行計画 の図 */

/* ---------- 図 19-1 表とインデックス ---------- */
const TABLE_ROWS = [
  ['1', 'Alice', '20'],
  ['2', 'Bob', '24'],
  ['3', 'Carol', '19'],
  ['4', 'Dave', '32'],
  ['5', 'Eve', '28'],
  ['6', 'Frank', '20'],
  ['7', 'Grace', '35'],
  ['8', 'Hana', '17'],
]
const AGE_INDEX = [
  ['17', '8'],
  ['19', '3'],
  ['20', '1'],
  ['20', '6'],
  ['24', '2'],
  ['28', '5'],
  ['32', '4'],
  ['35', '7'],
]

export function TableAndIndexFigure() {
  const y = (i: number) => 60 + i * 26
  return (
    <Svg
      id="19-1"
      w={760}
      h={340}
      label="左は users テーブルで、行は id の順に 1 から 8 まで並ぶ。右は age 列のインデックスで、age の値と行の id の組を age の小さい順に並べている（17 と 8、19 と 3、20 と 1、20 と 6、24 と 2、28 と 5、32 と 4、35 と 7）。WHERE age = 20 では、インデックスで 20 の位置を探し、項目が持つ id の 1 と 6 で表の行を読む"
    >
      <T x={20} y={22} bold fs={12.5}>
        users テーブル（id の順に格納）
      </T>
      <Box x={20} y={34} w={50} h={26} lines="id" mono fs={11.5} rx={0} fill="box4" />
      <Box x={70} y={34} w={90} h={26} lines="name" mono fs={11.5} rx={0} fill="box4" />
      <Box x={160} y={34} w={50} h={26} lines="age" mono fs={11.5} rx={0} fill="box4" />
      {TABLE_ROWS.map(([id, name, age], i) => {
        const hit = age === '20'
        return (
          <g key={id}>
            <Box x={20} y={y(i)} w={50} h={26} lines={id} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
            <Box x={70} y={y(i)} w={90} h={26} lines={name} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
            <Box x={160} y={y(i)} w={50} h={26} lines={age} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
          </g>
        )
      })}

      <T x={480} y={22} bold fs={12.5}>
        age 列のインデックス（age の順）
      </T>
      <Box x={480} y={34} w={60} h={26} lines="age" mono fs={11.5} rx={0} fill="box4" />
      <Box x={540} y={34} w={90} h={26} lines="行の id" fs={11.5} rx={0} fill="box4" />
      {AGE_INDEX.map(([age, id], i) => {
        const hit = age === '20'
        return (
          <g key={`${age}-${id}`}>
            <Box x={480} y={y(i)} w={60} h={26} lines={age} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
            <Box x={540} y={y(i)} w={90} h={26} lines={id} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
          </g>
        )
      })}
      <T x={640} y={138} fs={11.5} tone="acc">
        ① 20 の位置を探す
      </T>
      <Arrow x1={478} y1={125} x2={213} y2={73} accent />
      <Arrow x1={478} y1={151} x2={213} y2={203} accent />
      <T x={240} y={244} fs={11.5} tone="acc">
        ② 項目の id（1・6）で表の行を読む
      </T>
      <T x={20} y={296} fs={11.5} tone="muted">
        SQLite：インデックスの各項目は、行の位置として rowid（INTEGER PRIMARY KEY の id）を持つ
      </T>
      <T x={20} y={318} fs={11.5} tone="muted">
        MySQL（InnoDB）：行は主キーの順のインデックスに入っていて、ほかのインデックスの各項目は主キーの値を持つ
      </T>
    </Svg>
  )
}

/* ---------- 番号なしの図：B-tree での age = 20 の探索 ---------- */
const ROOT_CELLS = [
  { x: 180, label: '20 より小さい' },
  { x: 320, label: '20 以上 28 未満' },
  { x: 460, label: '28 以上' },
]
const LEAVES = [
  { x: 60, rows: AGE_INDEX.slice(0, 2) },
  { x: 320, rows: AGE_INDEX.slice(2, 5) },
  { x: 580, rows: AGE_INDEX.slice(5) },
]

export function BTreeFigure() {
  return (
    <Svg
      id="13-btree"
      w={780}
      h={300}
      label="age 列のインデックスを、1ページに3項目までと仮定して B-tree の形にした図。上に根のページが1つあり、20 より小さい、20 以上 28 未満、28 以上の3つの区切りから、下の3つの葉のページを指している。左の葉のページには age 17 と 19、中央には 20、20、24、右には 28、32、35 の項目が age の順に入っている。WHERE age = 20 では、根のページで 20 を区切りの値と比べて中央の葉のページに進み、20 の項目2つ（行の id は 1 と 6）を読み、次の 24 で読み終える。読むページは根と中央の葉の2ページ"
    >
      <T x={180} y={22} fs={11.5} tone="acc">
        ① 根のページ：20 を区切りの値と比べ、進む葉のページを1つに決める
      </T>
      {ROOT_CELLS.map((c, i) => (
        <Box key={c.x} x={c.x} y={38} w={140} h={30} lines={c.label} fs={11.5} rx={0} fill={i === 1 ? 'box5' : 'box4'} accent={i === 1} />
      ))}
      {LEAVES.map((leaf, i) => {
        const hit = i === 1
        return (
          <g key={leaf.x}>
            <Arrow x1={ROOT_CELLS[i].x + 70} y1={70} x2={leaf.x + 70} y2={126} accent={hit} />
            <Box x={leaf.x} y={128} w={60} h={24} lines="age" mono fs={11.5} rx={0} fill="box4" />
            <Box x={leaf.x + 60} y={128} w={80} h={24} lines="行の id" fs={11.5} rx={0} fill="box4" />
            {leaf.rows.map(([age, id], j) => (
              <g key={id}>
                <Box x={leaf.x} y={152 + j * 24} w={60} h={24} lines={age} mono fs={11.5} rx={0} fill={age === '20' ? 'box5' : 'bg'} />
                <Box x={leaf.x + 60} y={152 + j * 24} w={80} h={24} lines={id} mono fs={11.5} rx={0} fill={age === '20' ? 'box5' : 'bg'} />
              </g>
            ))}
          </g>
        )
      })}
      <T x={20} y={252} fs={11.5} tone="acc">
        ② 葉のページ：age の順に並んだ項目から 20 の2項目（id 1・6）を読み、次の 24 で読み終える
      </T>
      <T x={20} y={276} fs={11.5} tone="muted">
        読むページは根と中央の葉の2ページ。左右の葉のページは読まない
      </T>
    </Svg>
  )
}

/* ---------- 図 19-2 全件の走査とインデックスでの探索 ---------- */
const EMAILS = ['alice', 'bob', 'carol', 'dave', 'eve', 'frank', 'grace', 'hana']

export function ScanAndSearchFigure() {
  const y = (i: number) => 36 + i * 26
  const steps: Record<number, string> = { 3: '① dave と比べる → 前半へ', 1: '② bob と比べる → 前半へ', 0: '③ 一致 → id 1 の行を読む' }
  return (
    <Svg
      id="19-2"
      w={800}
      h={330}
      label="左はインデックスが無い場合で、users の8行を先頭から順に読み、email が alice@example.com かを8回確かめる。一致した後も最後の行まで確かめる。右は email のインデックスがある場合で、email の順に並んだ8個の値の真ん中の dave と比べて前半に絞り、次に bob と比べて前半に絞り、3回目の比較で alice に一致し、id 1 の行を読む。10,008 行では全件の走査が 10,008 行の確認、二分探索のモデルが 13 回の比較になる"
    >
      <T x={20} y={18} bold fs={12.5}>
        インデックスなし：全件の走査（SCAN users）
      </T>
      {EMAILS.map((e, i) => (
        <g key={e}>
          <Box x={20} y={y(i)} w={210} h={24} lines={`${e}@example.com`} mono fs={11} rx={0} fill={i === 0 ? 'box5' : 'bg'} />
          <T x={242} y={y(i) + 12} fs={11} tone={i === 0 ? 'acc' : 'muted'}>
            {i === 0 ? `確認 ${i + 1}（一致）` : `確認 ${i + 1}`}
          </T>
        </g>
      ))}
      <T x={20} y={262} fs={11.5}>
        一致した後も、ほかに一致する行が無いか最後まで確かめる：8 回
      </T>

      <T x={420} y={18} bold fs={12.5}>
        インデックスあり：二分探索（SEARCH … USING INDEX）
      </T>
      {EMAILS.map((e, i) => (
        <g key={e}>
          <Box x={420} y={y(i)} w={180} h={24} lines={`${e}@example.com`} mono fs={11} rx={0} fill={i === 0 ? 'box5' : i in steps ? 'box' : 'bg'} accent={i in steps} />
          {i in steps && (
            <T x={612} y={y(i) + 12} fs={11} tone="acc">
              {steps[i]}
            </T>
          )}
        </g>
      ))}
      <T x={420} y={262} fs={11.5}>
        email の順に並んでいるので、3 回の比較で位置が決まる
      </T>
      <T x={20} y={304} fs={12} tone="muted">
        10,008 行にすると：全件の走査は 10,008 行を確かめ、二分探索のモデルは 13 回の比較で済む（実行欄の比較図の値）
      </T>
    </Svg>
  )
}

/* ---------- 図 19-3 複合インデックス (age, name) ---------- */
const AGE_NAME = [
  ['17', 'Hana', '8'],
  ['19', 'Carol', '3'],
  ['20', 'Alice', '1'],
  ['20', 'Frank', '6'],
  ['24', 'Bob', '2'],
  ['28', 'Eve', '5'],
  ['32', 'Dave', '4'],
  ['35', 'Grace', '7'],
]

export function CompositeFigure() {
  const y = (i: number) => 60 + i * 26
  return (
    <Svg
      id="19-3"
      w={780}
      h={330}
      label="複合インデックス (age, name) の項目は age の順に並び、同じ age の中では name の順に並ぶ。A の WHERE age = 20 は連続した2項目を読み、B の WHERE age = 20 AND name = 'Alice' は1項目を読む。どちらも SEARCH になる。C の WHERE name = 'Alice' は、name が age ごとに並んでいるだけで全体では Hana、Carol、Alice、Frank、Bob の順なので位置を決められず、SCAN users になる"
    >
      <T x={70} y={22} bold fs={12.5}>
        インデックス (age, name) の項目
      </T>
      <Box x={70} y={34} w={50} h={26} lines="age" mono fs={11.5} rx={0} fill="box4" />
      <Box x={120} y={34} w={80} h={26} lines="name" mono fs={11.5} rx={0} fill="box4" />
      <Box x={200} y={34} w={50} h={26} lines="id" mono fs={11.5} rx={0} fill="box4" />
      {AGE_NAME.map(([age, name, id], i) => {
        const hit = age === '20'
        return (
          <g key={id}>
            <Box x={70} y={y(i)} w={50} h={26} lines={age} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
            <Box x={120} y={y(i)} w={80} h={26} lines={name} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} accent={name === 'Alice'} />
            <Box x={200} y={y(i)} w={50} h={26} lines={id} mono fs={11.5} rx={0} fill={hit ? 'box5' : 'bg'} />
          </g>
        )
      })}
      <Arrow d="M 64 113 L 56 113 L 56 163 L 64 163" plain accent />
      <T x={44} y={138} fs={12} bold tone="acc">
        A
      </T>
      <Arrow d="M 40 113 L 32 113 L 32 137 L 40 137" plain accent />
      <T x={20} y={125} fs={12} bold tone="acc">
        B
      </T>
      <Box x={116} y={56} w={88} h={216} fill="none" dashed lines={[]} />
      <T x={160} y={288} fs={12} bold anchor="middle" tone="danger">
        C
      </T>

      <Box
        x={290}
        y={36}
        w={470}
        h={74}
        fill="box"
        align="start"
        fs={11.5}
        bold
        lines={['A：WHERE age = 20', 'age が 20 の項目は連続している → 2 項目を読む', 'SEARCH users USING INDEX idx_users_age_name (age=?)']}
      />
      <Box
        x={290}
        y={124}
        w={470}
        h={74}
        fill="box"
        align="start"
        fs={11.5}
        bold
        lines={["B：WHERE age = 20 AND name = 'Alice'", 'age 20 の中は name の順 → 1 項目を読む', 'SEARCH users USING INDEX idx_users_age_name (age=? AND name=?)']}
      />
      <Box
        x={290}
        y={212}
        w={470}
        h={92}
        fill="bg"
        dashed
        align="start"
        fs={11.5}
        bold
        lines={["C：WHERE name = 'Alice'", 'name は age ごとに並ぶだけなので、全体では', 'Hana, Carol, Alice, Frank, Bob, … の順', '→ 位置を決められない：SCAN users']}
      />
    </Svg>
  )
}

/* ---------- 番号なしの図：範囲の条件と IN の条件で読む項目 ---------- */
function AgeNameRows({ x, y, fillOf }: { x: number; y: (i: number) => number; fillOf: (i: number) => 'box5' | 'bg' }) {
  return (
    <>
      <Box x={x} y={y(0) - 26} w={44} h={26} lines="age" mono fs={11.5} rx={0} fill="box4" />
      <Box x={x + 44} y={y(0) - 26} w={74} h={26} lines="name" mono fs={11.5} rx={0} fill="box4" />
      <Box x={x + 118} y={y(0) - 26} w={40} h={26} lines="id" mono fs={11.5} rx={0} fill="box4" />
      {AGE_NAME.map(([age, name, id], i) => (
        <g key={id}>
          <Box x={x} y={y(i)} w={44} h={26} lines={age} mono fs={11.5} rx={0} fill={fillOf(i)} />
          <Box x={x + 44} y={y(i)} w={74} h={26} lines={name} mono fs={11.5} rx={0} fill={fillOf(i)} />
          <Box x={x + 118} y={y(i)} w={40} h={26} lines={id} mono fs={11.5} rx={0} fill={fillOf(i)} />
        </g>
      ))}
    </>
  )
}

export function RangeAndInFigure() {
  const y = (i: number) => 92 + i * 26
  return (
    <Svg
      id="ch37-range-in"
      w={780}
      h={400}
      label="複合インデックス (age, name) の8項目で、2つの条件のそれぞれで読む項目を比べた図。左の WHERE age BETWEEN 20 AND 25 AND name = 'Alice' では、age が 20 から 25 の3項目（20 Alice、20 Frank、24 Bob）をすべて読み、name を1項目ずつ確かめて Alice の項目だけが一致する。右の WHERE age IN (20, 21) AND name = 'Alice' では、(20, 'Alice') と (21, 'Alice') の組ごとに位置を探し、(20, 'Alice') の1項目を読む。(21, 'Alice') の項目は無い。MySQL の users（20,008 行）では、rows の見積もりが範囲の条件で 2003、IN の条件で 2 になった"
    >
      <T x={20} y={20} bold fs={12.5}>
        範囲の条件
      </T>
      <T x={20} y={44} mono fs={11.5}>
        WHERE age BETWEEN 20 AND 25 AND name = 'Alice'
      </T>
      <AgeNameRows x={20} y={y} fillOf={(i) => (i >= 2 && i <= 4 ? 'box5' : 'bg')} />
      <T x={190} y={y(2) + 13} fs={11.5} tone="acc">
        name 一致
      </T>
      <T x={190} y={y(3) + 13} fs={11.5} tone="muted">
        name 不一致
      </T>
      <T x={190} y={y(4) + 13} fs={11.5} tone="muted">
        name 不一致
      </T>
      <Arrow d={`M 266 ${y(2)} L 274 ${y(2)} L 274 ${y(5)} L 266 ${y(5)}`} plain accent />
      <T x={284} y={y(3) + 3} fs={11.5} tone="acc">
        age で決まる範囲
      </T>
      <T x={284} y={y(3) + 23} fs={11.5} tone="acc">
        3項目を読む
      </T>
      <T x={20} y={328} fs={11.5}>
        age が 20〜25 の項目をすべて読み、
      </T>
      <T x={20} y={348} fs={11.5}>
        name は1項目ずつ確かめる
      </T>

      <T x={410} y={20} bold fs={12.5}>
        IN の条件
      </T>
      <T x={410} y={44} mono fs={11.5}>
        WHERE age IN (20, 21) AND name = 'Alice'
      </T>
      <AgeNameRows x={410} y={y} fillOf={(i) => (i === 2 ? 'box5' : 'bg')} />
      <Arrow x1={600} y1={y(2) + 13} x2={572} y2={y(2) + 13} accent />
      <T x={606} y={y(2) + 13} fs={11.5} tone="acc">
        ① (20, 'Alice') → 1項目
      </T>
      <Arrow x1={600} y1={y(4)} x2={572} y2={y(4)} accent />
      <T x={606} y={y(4)} fs={11.5} tone="muted">
        ② (21, 'Alice') → 項目なし
      </T>
      <T x={410} y={328} fs={11.5}>
        age と name の組ごとに位置を探すので、
      </T>
      <T x={410} y={348} fs={11.5}>
        読むのは一致する項目だけ
      </T>

      <T x={20} y={382} fs={11.5} tone="muted">
        MySQL の users（20,008 行）では、rows の見積もりが範囲の条件で 2003、IN の条件で 2 になった（上の表）
      </T>
    </Svg>
  )
}

/* ---------- 図 19-4 Relation#explain の流れ ---------- */
export function ExplainFlowFigure() {
  const boxes = [
    { x: 20, lines: ['User.where(…)', '.explain'], fill: 'box' as const, mono: true },
    { x: 172, lines: ['ExplainProxy を返す', '（SQL はまだ', '送らない）'], fill: 'box' as const },
    { x: 324, lines: ['inspect で', 'exec_queries を実行し', '送った SQL を集める'], fill: 'box' as const },
    { x: 476, lines: ['集めた SQL ごとに', 'EXPLAIN を付けて', 'MySQL で実行'], fill: 'box4' as const },
    { x: 628, lines: ['表の形に整えた', '文字列'], fill: 'box5' as const },
  ]
  return (
    <Svg
      id="19-4"
      w={780}
      h={190}
      label="User.where(…).explain は ExplainProxy を返し、この時点では SQL を送らない。inspect が呼ばれると exec_queries で SELECT を実行し、その間に送った SQL を集める。集めた SQL ごとに EXPLAIN を付けて MySQL で実行し、結果を表の形に整えた文字列にする。コンソールは戻り値を inspect で表示するので、explain を呼ぶだけで実行計画が表示される"
    >
      {boxes.map((b, i) => (
        <g key={i}>
          <Box x={b.x} y={30} w={132} h={86} lines={b.lines} fill={b.fill} fs={11.5} mono={b.mono} />
          {i < boxes.length - 1 && <Arrow x1={b.x + 134} y1={73} x2={b.x + 150} y2={73} />}
        </g>
      ))}
      <T x={20} y={148} fs={11.5} tone="muted">
        コンソール（bin/rails console）は戻り値を inspect で表示するので、explain を呼ぶだけで実行計画が出る。
      </T>
      <T x={20} y={170} fs={11.5} tone="muted">
        スクリプトで puts すると ExplainProxy の文字列になるので、puts relation.explain.inspect のように書く。
      </T>
    </Svg>
  )
}
