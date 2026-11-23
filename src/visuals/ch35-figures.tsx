import { Arrow, Box, Svg, T } from '../components/diagram'

/* 第11章（ID 35）SQL で表を読み書きする の図 */

/* ---------- 図 11-1 users テーブルの行・列・主キー ---------- */
export function UsersTableFigure() {
  const cols = [
    { name: 'id', w: 50 },
    { name: 'name', w: 80 },
    { name: 'email', w: 160 },
    { name: 'age', w: 50 },
    { name: 'department_id', w: 120 },
  ]
  const rows: (string[] | null)[] = [
    ['1', 'Alice', 'alice@example.com', '20', '1'],
    ['2', 'Bob', 'bob@example.com', '24', '1'],
    ['3', 'Carol', 'carol@example.com', '19', '2'],
    null,
    ['8', 'Hana', 'hana@example.com', '17', 'NULL'],
  ]
  const xs = cols.reduce<number[]>((acc, _c, i) => [...acc, i === 0 ? 20 : acc[i - 1] + cols[i - 1].w], [])
  const right = xs[4] + cols[4].w
  const rowY = (j: number) => 80 + j * 28
  return (
    <Svg
      id="11-1"
      w={780}
      h={300}
      label="サンプル DB の users テーブルを表にした図。列は id・name・email・age・department_id で、1行が1人の利用者を表す。id は主キーで、行を1つに特定する番号が入り、同じ値も NULL も入らない。Hana の行の department_id は NULL で、値が無いことを表す。department_id は departments テーブルの id を指す外部キーである"
    >
      <T x={xs[1] + cols[1].w / 2} y={20} fs={11.5} tone="acc" anchor="middle">
        列（column）
      </T>
      <Arrow x1={xs[1] + cols[1].w / 2} y1={28} x2={xs[1] + cols[1].w / 2} y2={48} accent />
      <T x={xs[4] + cols[4].w / 2} y={20} fs={11.5} anchor="middle">
        外部キー（departments の id を指す）
      </T>
      <Arrow x1={xs[4] + cols[4].w / 2} y1={28} x2={xs[4] + cols[4].w / 2} y2={48} />
      {cols.map((c, i) => (
        <g key={c.name}>
          <Box x={xs[i]} y={50} w={c.w} h={30} lines={c.name} mono fs={12} bold rx={0} fill={i === 0 ? 'box5' : 'box'} />
          {rows.map((r, j) =>
            r ? <Box key={j} x={xs[i]} y={rowY(j)} w={c.w} h={28} lines={r[i]} mono fs={12} rx={0} fill={i === 0 ? 'box5' : 'bg'} /> : null,
          )}
        </g>
      ))}
      <T x={(20 + right) / 2} y={rowY(3) + 14} fs={11.5} tone="muted" anchor="middle">
        …（id 4〜7 の4行）
      </T>
      <rect x={xs[1]} y={50} width={cols[1].w} height={rowY(5) - 50} fill="none" stroke="var(--fig-accent)" strokeWidth={2} strokeDasharray="5 4" />
      <rect x={20} y={rowY(2)} width={right - 20} height={28} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />
      <rect x={xs[4]} y={rowY(4)} width={cols[4].w} height={28} fill="none" stroke="var(--fig-accent)" strokeWidth={2} />

      <Arrow x1={540} y1={rowY(2) + 14} x2={484} y2={rowY(2) + 14} accent />
      <T x={546} y={rowY(2) + 6} fs={12} tone="acc">
        行（row）・レコード
      </T>
      <T x={546} y={rowY(2) + 24} fs={11.5}>
        1行が1人の利用者
      </T>
      <Arrow x1={540} y1={rowY(4) + 14} x2={484} y2={rowY(4) + 14} accent />
      <T x={546} y={rowY(4) + 6} fs={12} tone="acc">
        NULL：値が無い
      </T>
      <T x={546} y={rowY(4) + 24} fs={11.5}>
        0 とも空の文字列とも違う値
      </T>

      <Arrow x1={45} y1={258} x2={45} y2={rowY(5) + 2} />
      <T x={60} y={260} fs={12}>
        id は主キー：行を1つに特定する番号（同じ値も NULL も入らない）
      </T>
      <T x={20} y={288} fs={11} tone="muted">
        name・email・age は NULL を入れられない列（NOT NULL）、department_id は NULL を入れてよい列
      </T>
    </Svg>
  )
}

/* ---------- 図 11-2 サンプル DB の4つのテーブル ---------- */
export function SampleDbFigure() {
  return (
    <Svg
      id="11-2"
      w={780}
      h={340}
      label="サンプル DB の4つのテーブル。departments（3行）は id と name、users（8行）は id・name・email・age・department_id・created_at、orders（6行）は id・user_id・amount・status・created_at、accounts（3行）は id・user_id・balance を持ち、balance には 0 以上という CHECK 制約がある。users の department_id は departments の id を指し、NULL を入れてよい。orders と accounts の user_id は users の id を指し、NOT NULL である"
    >
      <Box x={20} y={40} w={200} h={86} lines={['departments（3行）', 'id INTEGER 主キー', 'name TEXT NOT NULL']} mono fs={12} bold subTone="muted" align="start" />
      <Box
        x={280}
        y={40}
        w={220}
        h={140}
        lines={['users（8行）', 'id INTEGER 主キー', 'name TEXT NOT NULL', 'email TEXT NOT NULL', 'age INTEGER NOT NULL', 'department_id INTEGER', 'created_at TEXT NOT NULL']}
        mono
        fs={12}
        bold
        fill="box5"
        subTone="muted"
        align="start"
      />
      <Box
        x={560}
        y={20}
        w={200}
        h={118}
        lines={['orders（6行）', 'id INTEGER 主キー', 'user_id INTEGER NOT NULL', 'amount INTEGER NOT NULL', 'status TEXT NOT NULL', 'created_at TEXT NOT NULL']}
        mono
        fs={12}
        bold
        subTone="muted"
        align="start"
      />
      <Box
        x={560}
        y={190}
        w={200}
        h={100}
        lines={['accounts（3行）', 'id INTEGER 主キー', 'user_id INTEGER NOT NULL', 'balance INTEGER NOT NULL', 'CHECK (balance >= 0)']}
        mono
        fs={12}
        bold
        subTone="muted"
        align="start"
      />
      <Arrow d="M280,144 L250,144 L250,83 L222,83" dashed />
      <Arrow d="M560,71 L530,71 L530,76 L502,76" dashed />
      <Arrow d="M560,240 L530,240 L530,76" dashed />
      <T x={20} y={150} fs={11}>
        department_id → departments.id
      </T>
      <T x={20} y={168} fs={11} tone="muted">
        （NULL を入れてよい）
      </T>
      <T x={538} y={164} fs={11}>
        user_id → users.id
      </T>
      <T x={20} y={312} fs={11} tone="muted">
        破線の矢印は外部キー（参照する列 → 参照される主キー）。実行欄は PRAGMA foreign_keys = ON で外部キーの検査を有効にしている
      </T>
      <T x={20} y={330} fs={11} tone="muted">
        id を書かずに INSERT すると、SQLite が番号を割り当てる（INTEGER PRIMARY KEY）
      </T>
    </Svg>
  )
}

/* ---------- 図 11-3 Active Record のメソッドから SQL を送り、結果を受け取る ---------- */
export function ArFlowFigure() {
  return (
    <Svg
      id="11-3"
      w={780}
      h={215}
      label="Ruby のコード User.where(age: 20..).order(age: :desc).pluck(:name) を実行すると、Active Record が SQL を組み立てて MySQL に送る。MySQL は users テーブルから条件に合う行を探して結果の行を返し、Active Record はそれを Ruby の値（ここでは名前の配列）にして返す。組み立てる SQL は to_sql で、送らずに確かめられる"
    >
      <Box x={20} y={40} w={210} h={80} lines={['User.where(age: 20..)', '  .order(age: :desc)', '  .pluck(:name)']} mono fs={12} align="start" />
      <Arrow x1={230} y1={80} x2={288} y2={80} />
      <Box x={290} y={40} w={170} h={80} lines={['Active Record', 'SQL を組み立てて送り、', '結果を Ruby の値にする']} fs={12} bold subTone="muted" />
      <Arrow x1={460} y1={64} x2={588} y2={64} />
      <T x={524} y={52} fs={11} anchor="middle">
        SQL を送る
      </T>
      <Arrow x1={588} y1={96} x2={462} y2={96} />
      <T x={524} y={110} fs={11} anchor="middle">
        結果の行
      </T>
      <Box x={590} y={40} w={170} h={80} lines={['MySQL 8.4', 'users テーブル']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={420} y1={120} x2={420} y2={148} dashed />
      <T x={428} y={134} fs={11} mono tone="muted">
        to_sql
      </T>
      <Box x={290} y={150} w={470} h={48} lines={['SELECT `users`.`name` FROM `users`', 'WHERE `users`.`age` >= 20 ORDER BY `users`.`age` DESC']} mono fs={11.5} fill="bg" align="start" />
      <Arrow d="M300,120 L300,136 L125,136 L125,148" />
      <Box x={20} y={150} w={210} h={48} lines={['戻り値', '["Grace", "Dave", "Eve", …]']} fs={12} fill="box5" subTone="muted" />
    </Svg>
  )
}

/* ---------- 図 11-4 書く順と処理の順 ---------- */
export function ClauseOrderFigure() {
  const top = ['SELECT name, age', 'FROM users', 'WHERE age >= 20', 'ORDER BY age DESC, id']
  const bottom = [
    ['FROM users', '8行を読む'],
    ['WHERE age >= 20', '6行が残る'],
    ['SELECT name, age', '2列にする'],
    ['ORDER BY age DESC, id', '年齢の大きい順に並べる'],
  ]
  const x = (i: number) => 20 + i * 190
  // 上の段の i 番目の句が、下の段の何番目にあたるか
  const to = [2, 0, 1, 3]
  return (
    <Svg
      id="11-4"
      w={780}
      h={250}
      label="上の段は SQL を書く順で、SELECT name, age、FROM users、WHERE age >= 20、ORDER BY age DESC, id の順に並ぶ。下の段は結果を説明するための処理の順で、FROM で users の8行を読み、WHERE で age が 20 以上の6行を残し、SELECT で name と age の2列にし、ORDER BY で年齢の大きい順に並べる。上の段と下の段の同じ句を破線で結んでいる"
    >
      <T x={20} y={22} bold>
        書く順
      </T>
      {top.map((t, i) => (
        <Box key={t} x={x(i)} y={36} w={170} h={40} lines={t} mono fs={12} fill="bg" />
      ))}
      {to.map((j, i) => (
        <Arrow key={i} x1={x(i) + 85} y1={76} x2={x(j) + 85} y2={144} dashed />
      ))}
      {bottom.map((b, i) => (
        <Box key={b[0]} x={x(i)} y={146} w={170} h={56} lines={b} mono={false} fs={12} fill={i === 1 ? 'box5' : 'box'} subTone="muted" />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={i} x1={x(i) + 170} y1={174} x2={x(i + 1) - 2} y2={174} />
      ))}
      <T x={20} y={226} bold>
        処理の順（実行欄の「論理的な処理順」）
      </T>
      <T x={20} y={244} fs={11} tone="muted">
        行の数はサンプル DB の users（8行）での値。実際の処理の手順は、データベースが実行計画として決める
      </T>
    </Svg>
  )
}

/* ---------- 図 11-5 バリデーションと DB の制約 ---------- */
export function TwoChecksFigure() {
  return (
    <Svg
      id="11-5"
      w={780}
      h={280}
      label="create! や save を呼ぶと、まず Rails のプロセスの中でバリデーションが値を検査し、失敗すると SQL を送らずに RecordInvalid の例外か false になる。通ると INSERT や UPDATE を MySQL に送り、MySQL が NOT NULL・外部キー・CHECK・一意の索引を検査する。違反すると NotNullViolation や InvalidForeignKey などの例外になってロールバックされ、通ると COMMIT で保存される。save(validate: false)・insert_all・update_all はバリデーションを通らずに SQL を送る"
    >
      <Box x={20} y={110} w={150} h={50} lines={['create!・save', 'update!']} mono fs={12} />
      <Arrow x1={170} y1={135} x2={218} y2={135} />
      <Box x={220} y={100} w={180} h={70} lines={['バリデーション', 'Rails のプロセスで検査', 'presence・numericality']} fs={12} bold subTone="muted" />
      <Arrow x1={400} y1={135} x2={458} y2={135} />
      <T x={429} y={122} fs={11} anchor="middle">
        SQL
      </T>
      <Box x={460} y={100} w={180} h={70} lines={['MySQL の制約', 'NOT NULL・外部キー', 'CHECK・一意の索引']} fs={12} bold fill="box4" subTone="muted" />
      <Arrow x1={640} y1={135} x2={678} y2={135} />
      <Box x={680} y={110} w={80} h={50} lines={['COMMIT', '保存']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={310} y1={170} x2={310} y2={208} dashed />
      <Box x={220} y={210} w={180} h={58} lines={['RecordInvalid（save は false）', 'INSERT・UPDATE を送らない', '理由は errors に入る']} fs={11.5} fill="bg" dashed subTone="muted" />
      <Arrow x1={550} y1={170} x2={550} y2={208} dashed />
      <Box x={460} y={210} w={180} h={58} lines={['NotNullViolation', 'InvalidForeignKey など', 'ROLLBACK']} fs={11.5} fill="bg" dashed subTone="muted" />
      <Arrow d="M95,110 C95,48 550,48 550,98" dashed accent />
      <T x={322} y={40} fs={11.5} tone="acc" anchor="middle">
        save(validate: false)・insert_all・update_all はバリデーションを通らない
      </T>
    </Svg>
  )
}

/* ---------- 図 11-6 モデルを通すメソッドと SQL を直接送るメソッド ---------- */
export function TwoPathsFigure() {
  return (
    <Svg
      id="11-6"
      w={780}
      h={256}
      label="update!・destroy・destroy_all はモデルを通すメソッドで、SELECT で行を読み込み、コールバック（update! はバリデーションも）を実行してから、1行ずつ UPDATE や DELETE を送る。update_all・delete・delete_all は SQL を直接送るメソッドで、行を読まず、バリデーションもコールバックも実行せずに、UPDATE や DELETE を1回だけ送る"
    >
      <T x={20} y={22} bold>
        モデルを通すメソッド
      </T>
      <Box x={20} y={36} w={170} h={64} lines={['update!・destroy', 'destroy_all']} mono fs={12} />
      <Arrow x1={190} y1={68} x2={228} y2={68} />
      <Box x={230} y={36} w={150} h={64} lines={['SELECT で', '行を読み込む']} fs={12} />
      <Arrow x1={380} y1={68} x2={418} y2={68} />
      <Box x={420} y={36} w={170} h={64} lines={['コールバックを実行', 'update! は検証も行う']} fs={12} fill="box5" subTone="muted" />
      <Arrow x1={590} y1={68} x2={628} y2={68} />
      <Box x={630} y={36} w={130} h={64} lines={['1行ずつ', 'UPDATE・DELETE']} fs={12} fill="box4" />

      <T x={20} y={142} bold>
        SQL を直接送るメソッド
      </T>
      <Box x={20} y={156} w={170} h={64} lines={['update_all・delete', 'delete_all']} mono fs={12} />
      <Arrow x1={190} y1={188} x2={628} y2={188} accent />
      <T x={409} y={176} fs={11.5} tone="acc" anchor="middle">
        行を読まず、検証もコールバックも実行しない
      </T>
      <Box x={630} y={156} w={130} h={64} lines={['1回の', 'UPDATE・DELETE']} fs={12} fill="box4" />
      <T x={20} y={246} fs={11} tone="muted">
        update_all・delete_all の WHERE は Relation の条件から作る。条件が無ければ、すべての行が対象になる
      </T>
    </Svg>
  )
}

/* ---------- Alice を参照する子の行と、2つの DELETE（番号なし） ---------- */
export function DeleteParentFigure() {
  const children = ['orders id 1', 'orders id 2', 'accounts id 1']
  return (
    <Svg
      id="ch35-delete-parent"
      w={780}
      h={280}
      label="実行欄で試した2つの DELETE と、users の行を参照する子の行。orders の id 1 と id 2、accounts の id 1 の3行は、user_id が 1 で、users の id 1 の Alice を参照している。DELETE FROM users WHERE id = 1 は、Alice を参照する子の行があるので FOREIGN KEY constraint failed で拒否され、Alice の行は残る。users の id 8 の Hana を参照する子の行は無いので、DELETE FROM users WHERE id = 8 は変更行数 1 で Hana の行を削除する"
    >
      <T x={20} y={20} bold>
        実行した SQL
      </T>
      <T x={300} y={20} bold>
        親の行（users）
      </T>
      <T x={540} y={20} bold>
        子の行（orders・accounts）
      </T>

      <Box x={20} y={72} w={230} h={48} lines={['DELETE FROM users', 'WHERE id = 1;']} mono fs={12} fill="bg" align="start" />
      <Arrow x1={250} y1={96} x2={298} y2={96} />
      <Box x={300} y={72} w={160} h={48} lines={['users id 1', 'Alice']} mono fs={12} fill="box5" subTone="muted" />
      <T x={20} y={140} fs={12} tone="danger">
        FOREIGN KEY constraint failed
      </T>
      <T x={20} y={160} fs={11.5} tone="muted">
        参照する子の行があるので拒否
      </T>
      <T x={20} y={178} fs={11.5} tone="muted">
        Alice の行は残る
      </T>

      {children.map((c, i) => (
        <g key={c}>
          <Box x={540} y={30 + i * 52} w={220} h={42} lines={[c, 'user_id = 1']} mono fs={12} fill="box4" subTone="muted" />
          <Arrow x1={540} y1={51 + i * 52} x2={462} y2={88 + i * 8} dashed />
        </g>
      ))}

      <Box x={20} y={204} w={230} h={48} lines={['DELETE FROM users', 'WHERE id = 8;']} mono fs={12} fill="bg" align="start" />
      <Arrow x1={250} y1={228} x2={298} y2={228} />
      <Box x={300} y={204} w={160} h={48} lines={['users id 8', 'Hana']} mono fs={12} fill="box4" subTone="muted" />
      <T x={20} y={268} fs={11.5} tone="muted">
        変更行数 1：Hana の行を削除
      </T>
      <T x={540} y={228} fs={11.5} tone="muted">
        user_id が 8 の子の行は無い
      </T>
    </Svg>
  )
}
