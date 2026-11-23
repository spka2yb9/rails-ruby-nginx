import type { Chapter } from '../content/types'
import { ChapterLink, Code, Figure, Ref, Term } from '../components/content'
import { Arrow, Box, Svg, T } from '../components/diagram'
import { SqlLab } from '../components/SqlLab'

const GH = 'https://github.com/rails/rails/blob/v8.1.4.1'
const MYSQL = 'https://dev.mysql.com/doc/refman/8.4/en'

/* ---------- 図の部品：表の形に並べたセル ---------- */
const JP = /[ぁ-んァ-ヶ一-龥（）・→]/
type CellFill = 'bg' | 'box' | 'box2' | 'box4' | 'box5'

interface GridProps {
  x: number
  y: number
  widths: number[]
  head: string[]
  rows: string[][]
  rh?: number
  fs?: number
  fill?: (r: number, c: number) => CellFill
  dashed?: (r: number, c: number) => boolean
}

function Grid({ x, y, widths, head, rows, rh = 24, fs = 11.5, fill, dashed }: GridProps) {
  const xs = widths.map((_, i) => x + widths.slice(0, i).reduce((a, b) => a + b, 0))
  return (
    <g>
      {head.map((h, c) => (
        <Box key={`h${c}`} x={xs[c]} y={y} w={widths[c]} h={rh} lines={h} mono={!JP.test(h)} fs={fs} rx={0} fill="bg" bold />
      ))}
      {rows.map((row, r) =>
        row.map((v, c) => (
          <Box
            key={`${r}-${c}`}
            x={xs[c]}
            y={y + rh * (r + 1)}
            w={widths[c]}
            h={rh}
            lines={v}
            mono={!JP.test(v)}
            fs={fs}
            rx={0}
            fill={fill?.(r, c) ?? 'box'}
            dashed={dashed?.(r, c)}
          />
        )),
      )}
    </g>
  )
}

/* ---------- 図 12-1 サンプル DB の3つのテーブルと外部キー ---------- */
function TablesFigure() {
  const users = [
    ['1', 'Alice', '20', '1'],
    ['1', 'Bob', '24', '2'],
    ['2', 'Carol', '19', '3'],
    ['2', 'Dave', '32', '4'],
    ['2', 'Eve', '28', '5'],
    ['1', 'Frank', '20', '6'],
    ['3', 'Grace', '35', '7'],
    ['NULL', 'Hana', '17', '8'],
  ]
  const orders = [
    ['1', '1', '15000', 'paid'],
    ['1', '2', '3000', 'pending'],
    ['2', '3', '8000', 'paid'],
    ['3', '4', '20000', 'paid'],
    ['5', '5', '12000', 'pending'],
    ['5', '6', '4000', 'paid'],
  ]
  const rowY = (i: number) => 80 + 24 * i
  return (
    <Svg
      id="12-1"
      w={780}
      h={356}
      label="departments（Engineering・Sales・Design の3行）、users（8行）、orders（6行）。users の department_id は departments の id を指し、Hana だけ NULL。orders の user_id は users の id を指し、Alice と Eve には注文が2件ずつ、Bob と Carol には1件ずつあり、Dave・Frank・Grace・Hana を指す注文は無い"
    >
      <T x={10} y={28} bold>
        departments（部署）
      </T>
      <T x={240} y={28} bold>
        users（ユーザー）
      </T>
      <T x={560} y={28} bold>
        orders（注文）
      </T>
      <Grid
        x={10}
        y={44}
        widths={[96, 32]}
        head={['name', 'id']}
        fs={11}
        rows={[
          ['Engineering', '1'],
          ['Sales', '2'],
          ['Design', '3'],
        ]}
      />
      <Grid
        x={240}
        y={44}
        widths={[96, 56, 36, 30]}
        head={['department_id', 'name', 'age', 'id']}
        fs={11}
        rows={users}
        fill={(r, c) => (c === 0 ? (r === 7 ? 'box4' : 'box5') : 'box')}
        dashed={(r, c) => r === 7 && c === 0}
      />
      <Grid x={560} y={44} widths={[56, 30, 56, 64]} head={['user_id', 'id', 'amount', 'status']} fs={11} rows={orders} fill={(_, c) => (c === 0 ? 'box5' : 'box')} />
      {users.slice(0, 7).map((u, k) => (
        <Arrow key={`d${k}`} x1={238} y1={rowY(k)} x2={140} y2={rowY(Number(u[0]) - 1)} dashed />
      ))}
      {orders.map((o, j) => (
        <Arrow key={`o${j}`} x1={558} y1={rowY(j)} x2={460} y2={rowY(Number(o[0]) - 1)} dashed />
      ))}
      <T x={232} y={246} anchor="end" fs={11} tone="muted">
        department_id の値が
      </T>
      <T x={232} y={262} anchor="end" fs={11} tone="muted">
        指す部署
      </T>
      <T x={509} y={240} anchor="middle" fs={11} tone="muted">
        user_id の値が
      </T>
      <T x={509} y={256} anchor="middle" fs={11} tone="muted">
        指すユーザー
      </T>
      <T x={10} y={292} fs={12}>
        users.department_id → departments.id：1つの部署に複数のユーザー（1対多）。Hana は NULL（部署なし）
      </T>
      <T x={10} y={314} fs={12}>
        orders.user_id → users.id：1人に0件以上の注文（1対多）。Dave・Frank・Grace・Hana を指す注文は無い
      </T>
      <T x={10} y={336} fs={11} tone="muted">
        色を付けた列が外部キーで、「多」の側のテーブルに置く。列の並びは、矢印を見やすくするために入れ替えている
      </T>
    </Svg>
  )
}

/* ---------- 図 12-2 INNER JOIN・LEFT JOIN・CROSS JOIN の結果の行 ---------- */
function JoinKindsFigure() {
  const rows = [
    ['Alice', '1', '15000'],
    ['Alice', '2', '3000'],
    ['Bob', '3', '8000'],
    ['Carol', '4', '20000'],
    ['Dave', 'NULL', 'NULL'],
    ['Eve', '5', '12000'],
    ['Eve', '6', '4000'],
    ['Frank', 'NULL', 'NULL'],
    ['Grace', 'NULL', 'NULL'],
    ['Hana', 'NULL', 'NULL'],
  ]
  const unmatched = (r: number) => rows[r][1] === 'NULL'
  const names = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Hana']
  return (
    <Svg
      id="12-2"
      w={780}
      h={310}
      label="左：users u LEFT JOIN orders o の結果10行。ON に一致した6行が INNER JOIN の結果で、Alice と Eve は2行ずつ。注文の無い Dave・Frank・Grace・Hana の4行は右側の列が NULL で、LEFT JOIN だけに出る。右：users CROSS JOIN departments は、8人と3部署のすべての組み合わせで24行になる"
    >
      <T x={10} y={18} mono fs={10.5}>
        users u LEFT JOIN orders o ON u.id = o.user_id
      </T>
      <Grid
        x={10}
        y={34}
        widths={[70, 56, 70]}
        head={['u.name', 'o.id', 'o.amount']}
        rows={rows}
        fs={11}
        fill={(r) => (unmatched(r) ? 'box4' : 'box')}
        dashed={(r) => unmatched(r)}
      />
      <Box x={222} y={58} w={22} h={16} fill="box" rx={2} />
      <T x={252} y={66} fs={12}>
        ON に一致した組（6行）
      </T>
      <T x={252} y={85} fs={11} tone="muted">
        INNER JOIN の結果はこの6行だけ
      </T>
      <Box x={222} y={110} w={22} h={16} fill="box4" dashed rx={2} />
      <T x={252} y={118} fs={12}>
        相手の無い左側の行（4行）
      </T>
      <T x={252} y={137} fs={11} tone="muted">
        右側の列は NULL。LEFT JOIN だけが残す
      </T>
      <T x={222} y={176} fs={12}>
        Alice と Eve は注文が2件なので
      </T>
      <T x={222} y={194} fs={12}>
        2行ずつ
      </T>
      <T x={222} y={226} fs={12}>
        users は8行でも、結果は
      </T>
      <T x={222} y={244} fs={12}>
        INNER JOIN 6行・LEFT JOIN 10行
      </T>
      <T x={500} y={18} mono fs={10.5}>
        users u CROSS JOIN departments d
      </T>
      <Box x={500} y={34} w={56} h={24} fill="bg" rx={0} />
      {['Engineering', 'Sales', 'Design'].map((d, c) => (
        <Box key={d} x={556 + c * 70} y={34} w={70} h={24} lines={d} mono fs={10} rx={0} fill="bg" bold />
      ))}
      {names.map((n, r) => (
        <g key={n}>
          <Box x={500} y={58 + r * 24} w={56} h={24} lines={n} mono fs={10.5} rx={0} fill="bg" />
          {[0, 1, 2].map((c) => (
            <Box key={c} x={556 + c * 70} y={58 + r * 24} w={70} h={24} rx={0} fill="box" />
          ))}
        </g>
      ))}
      <T x={500} y={270} fs={12}>
        マス1つが結果の1行。8 × 3 = 24 行
      </T>
      <T x={500} y={290} fs={11} tone="muted">
        ON が無いので、すべての組み合わせを作る
      </T>
    </Svg>
  )
}

/* ---------- 図 12-3 右側の表の条件を WHERE に置くか ON に置くか ---------- */
function OnWhereFigure() {
  const whereRows = [
    ['Alice', '1', 'paid', 'TRUE'],
    ['Alice', '2', 'pending', 'FALSE'],
    ['Bob', '3', 'paid', 'TRUE'],
    ['Carol', '4', 'paid', 'TRUE'],
    ['Dave', 'NULL', 'NULL', 'UNKNOWN'],
    ['Eve', '5', 'pending', 'FALSE'],
    ['Eve', '6', 'paid', 'TRUE'],
    ['Frank', 'NULL', 'NULL', 'UNKNOWN'],
    ['Grace', 'NULL', 'NULL', 'UNKNOWN'],
    ['Hana', 'NULL', 'NULL', 'UNKNOWN'],
  ]
  const onRows = [
    ['Alice', '1', 'paid'],
    ['Bob', '3', 'paid'],
    ['Carol', '4', 'paid'],
    ['Dave', 'NULL', 'NULL'],
    ['Eve', '6', 'paid'],
    ['Frank', 'NULL', 'NULL'],
    ['Grace', 'NULL', 'NULL'],
    ['Hana', 'NULL', 'NULL'],
  ]
  return (
    <Svg
      id="12-3"
      w={780}
      h={370}
      label="左の (1) は、LEFT JOIN の結果10行に WHERE o.status = 'paid' を判定する。paid の4行は TRUE、pending の2行は FALSE、注文の無い4人の行は NULL との比較なので UNKNOWN になり、TRUE の4行だけが残る。右の (2) は、status = 'paid' を ON に入れる。pending の注文は組にならず、8人全員が残り、paid の注文が無い人は NULL になる"
    >
      <T x={10} y={18} bold>
        (1) 条件を WHERE に書く：4行
      </T>
      <T x={10} y={38} mono fs={10.5}>
        LEFT JOIN orders o ON u.id = o.user_id
      </T>
      <T x={10} y={54} mono fs={10.5}>
        WHERE o.status = &apos;paid&apos;
      </T>
      <Grid
        x={10}
        y={68}
        widths={[62, 44, 66, 96]}
        head={['u.name', 'o.id', 'o.status', 'WHERE の判定']}
        rows={whereRows}
        fs={11}
        fill={(r) => (whereRows[r][3] === 'TRUE' ? 'box5' : 'bg')}
        dashed={(r) => whereRows[r][3] !== 'TRUE'}
      />
      <T x={10} y={354} fs={12}>
        残るのは TRUE の行だけ。注文の無い4人の行も消える
      </T>
      <T x={400} y={18} bold>
        (2) 条件を ON に書く：8行
      </T>
      <T x={400} y={38} mono fs={10.5}>
        LEFT JOIN orders o ON u.id = o.user_id
      </T>
      <T x={400} y={54} mono fs={10.5}>
        {'                 AND o.status = '}&apos;paid&apos;
      </T>
      <Grid
        x={400}
        y={68}
        widths={[62, 44, 66]}
        head={['u.name', 'o.id', 'o.status']}
        rows={onRows}
        fs={11}
        fill={(r) => (onRows[r][1] === 'NULL' ? 'box4' : 'box')}
        dashed={(r) => onRows[r][1] === 'NULL'}
      />
      <T x={400} y={306} fs={12}>
        ON に合う注文が無い行も、LEFT JOIN が NULL で残す
      </T>
      <T x={400} y={328} fs={11} tone="muted">
        pending の注文（id 2・5）は ON の条件に合わないので組にならない
      </T>
    </Svg>
  )
}

/* ---------- 図 12-4 GROUP BY でグループに分けて集計する ---------- */
function GroupFigure() {
  const groups = [
    { key: '1', members: ['Alice（20）', 'Bob（24）', 'Frank（20）'], agg: ['3', '3', '21.33…'] },
    { key: '2', members: ['Carol（19）', 'Dave（32）', 'Eve（28）'], agg: ['3', '3', '26.33…'] },
    { key: '3', members: ['Grace（35）'], agg: ['1', '1', '35'] },
    { key: 'NULL', members: ['Hana（17）'], agg: ['1', '0', '17'] },
  ]
  return (
    <Svg
      id="12-4"
      w={780}
      h={392}
      label="users の8行を department_id の値で4つのグループに分ける。1 は Alice・Bob・Frank、2 は Carol・Dave・Eve、3 は Grace、NULL は Hana。グループごとに COUNT(*)、COUNT(department_id)、AVG(age) を計算し、グループ1つが結果の1行になる。NULL のグループの COUNT(department_id) は 0"
    >
      <T x={10} y={18} mono fs={10.5}>
        SELECT department_id, COUNT(*), COUNT(department_id), AVG(age) FROM users GROUP BY department_id
      </T>
      {groups.map((g, i) => {
        const x = 10 + i * 190
        return (
          <g key={g.key}>
            <Box x={x} y={36} w={178} h={170} fill="bg" />
            <Box x={x} y={36} w={178} h={26} lines={`department_id = ${g.key}`} mono fs={11.5} fill={g.key === 'NULL' ? 'box5' : 'box2'} bold />
            {g.members.map((m, k) => (
              <T key={m} x={x + 14} y={80 + k * 20} fs={12}>
                {m}
              </T>
            ))}
            <T x={x + 14} y={150} fs={10.5} mono tone="muted">
              {`COUNT(*) = ${g.agg[0]}`}
            </T>
            <T x={x + 14} y={168} fs={10.5} mono tone="muted">
              {`COUNT(department_id) = ${g.agg[1]}`}
            </T>
            <T x={x + 14} y={186} fs={10.5} mono tone="muted">
              {`AVG(age) = ${g.agg[2]}`}
            </T>
            <Arrow x1={x + 89} y1={208} x2={240 + i * 24} y2={238} />
          </g>
        )
      })}
      <Grid
        x={150}
        y={240}
        widths={[110, 80, 160, 130]}
        head={['department_id', 'COUNT(*)', 'COUNT(department_id)', 'AVG(age)']}
        rows={groups.map((g) => [g.key, ...g.agg])}
        fs={11}
        fill={(r) => (r === 3 ? 'box5' : 'box')}
      />
      <T x={10} y={378} fs={12}>
        グループ1つが結果の1行になる。NULL の行もひとつのグループになり、COUNT(department_id) は NULL を数えないので 0
      </T>
    </Svg>
  )
}

/* ---------- 図 12-5 論理的な処理順と、各段階で残る行・グループ ---------- */
function OrderFigure() {
  const steps = [
    { name: 'FROM', arg: 'users', count: '8行', note: ['users の全行'] },
    { name: 'WHERE', arg: 'age >= 20', count: '6行', note: ['Carol（19）と', 'Hana（17）を除く'] },
    { name: 'GROUP BY', arg: 'department_id', count: '3グループ', note: ['1：3人、2：2人', '3：1人'] },
    { name: 'HAVING', arg: 'COUNT(*) >= 2', count: '2グループ', note: ['部署3（1人）を', '除く'] },
    { name: 'SELECT', arg: '列を決める', count: '2行', note: ['部署と人数', '（user_count）'] },
    { name: 'ORDER BY', arg: 'user_count DESC', count: '2行', note: ['人数の多い順に', '並べる'] },
  ]
  const ar = [['User'], ['where("age >= ?",', '20)'], ['group(', ':department_id)'], ['having("COUNT(*)', ' >= ?", 2)'], ['select(…)', 'または count'], ['order(', 'user_count: :desc)']]
  return (
    <Svg
      id="12-5"
      w={790}
      h={300}
      label="論理的な処理順。FROM users で8行、WHERE age >= 20 で6行（Carol と Hana を除く）、GROUP BY department_id で3グループ、HAVING COUNT(*) >= 2 で2グループ（部署3を除く）、SELECT で部署と人数の列を決め、ORDER BY で人数の多い順に並べる。下段は対応する Active Record のメソッドで、where、group、having、select または count、order"
    >
      <T x={10} y={16} fs={11} tone="muted">
        書く順：SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY　／　図の順：意味を考えるときの論理的な処理順
      </T>
      {steps.map((s, i) => {
        const x = 10 + i * 130
        const hot = s.name === 'WHERE' || s.name === 'HAVING'
        return (
          <g key={s.name}>
            <Box x={x} y={32} w={120} h={52} lines={[s.name, s.arg]} fs={11.5} bold fill={hot ? 'box5' : 'box'} accent={hot} subTone="muted" />
            {i < steps.length - 1 && <Arrow x1={x + 121} y1={58} x2={x + 129} y2={58} />}
            <Box x={x} y={96} w={120} h={30} lines={s.count} fs={12.5} fill="bg" bold />
            {s.note.map((n, k) => (
              <T key={n} x={x + 60} y={146 + k * 18} fs={11} anchor="middle" tone="muted">
                {n}
              </T>
            ))}
            <Box x={x} y={226} w={120} h={46} lines={ar[i]} mono fs={10} fill="box2" />
          </g>
        )
      })}
      <T x={10} y={208} fs={11.5}>
        Active Record のメソッド（呼ぶ順番は自由。Rails が SQL の句の順に並べる）
      </T>
    </Svg>
  )
}

/* ---------- 図 12-6 IN のサブクエリと相関 EXISTS ---------- */
function SubqueryFigure() {
  const rows = [
    ['Alice', '1', 'id 1（15000）', 'TRUE'],
    ['Bob', '2', 'なし', 'FALSE'],
    ['Carol', '3', 'id 4（20000）', 'TRUE'],
    ['Dave', '4', 'なし', 'FALSE'],
    ['Eve', '5', 'id 5（12000）', 'TRUE'],
    ['Frank', '6', 'なし', 'FALSE'],
    ['Grace', '7', 'なし', 'FALSE'],
    ['Hana', '8', 'なし', 'FALSE'],
  ]
  return (
    <Svg
      id="12-6"
      w={760}
      h={330}
      label="左：IN のサブクエリ。内側の SELECT user_id FROM orders WHERE amount >= 10000 を1回評価して集合 1・3・5 を作り、外側の users の id がその集合に含まれる行を選ぶ。結果は Alice・Carol・Eve。右：相関 EXISTS。外側の users の行ごとに u.id を当てはめた内側の SELECT を考え、1万円以上の注文が1件以上あれば TRUE。Alice・Carol・Eve が TRUE、ほかの5人は FALSE"
    >
      <T x={10} y={18} bold>
        IN：内側の結果は1つの集合
      </T>
      <Box x={10} y={34} w={330} h={30} lines="SELECT user_id FROM orders WHERE amount >= 10000" mono fs={10.5} fill="box2" />
      <Arrow x1={175} y1={66} x2={175} y2={90} />
      <Box x={110} y={92} w={130} h={30} lines="{1, 3, 5}" mono fs={12.5} fill="box5" accent />
      <Arrow x1={175} y1={124} x2={175} y2={148} />
      <Box x={10} y={150} w={330} h={30} lines="SELECT * FROM users WHERE id IN (内側の結果)" mono fs={10.5} fill="box" />
      <Arrow x1={175} y1={182} x2={175} y2={206} />
      <T x={175} y={222} anchor="middle" fs={12.5}>
        Alice（1）・Carol（3）・Eve（5）
      </T>
      <T x={10} y={258} fs={11.5} tone="muted">
        内側は外側を参照しないので、単独で実行できる。
      </T>
      <T x={10} y={278} fs={11.5} tone="muted">
        外側のどの行にも同じ集合を使う
      </T>
      <T x={380} y={18} bold>
        相関 EXISTS：外側の行ごとに内側を考える
      </T>
      <T x={380} y={38} mono fs={10}>
        EXISTS (SELECT 1 FROM orders o
      </T>
      <T x={380} y={54} mono fs={10}>
        {'  WHERE o.user_id = u.id AND o.amount >= 10000)'}
      </T>
      <Grid
        x={380}
        y={70}
        widths={[58, 40, 150, 80]}
        head={['u.name', 'u.id', '内側で見つかる注文', 'EXISTS']}
        rows={rows}
        fs={11}
        fill={(r) => (rows[r][3] === 'TRUE' ? 'box5' : 'bg')}
      />
      <T x={380} y={308} fs={12}>
        1行以上見つかれば TRUE。Bob の注文（8000）は条件に合わない
      </T>
    </Svg>
  )
}

/* ---------- 図 12-7 NOT IN と NULL ---------- */
function NotInFigure() {
  const rows = [
    ['Engineering', '1', 'TRUE', 'UNKNOWN', 'UNKNOWN → 除外', 'TRUE → 残る'],
    ['Sales', '2', 'FALSE', 'UNKNOWN', 'FALSE → 除外', 'FALSE → 除外'],
    ['Design', '3', 'TRUE', 'UNKNOWN', 'UNKNOWN → 除外', 'TRUE → 残る'],
  ]
  return (
    <Svg
      id="12-7"
      w={760}
      h={226}
      label="20歳未満のユーザーの department_id は 2（Carol）と NULL（Hana）。id NOT IN (2, NULL) は id <> 2 AND id <> NULL と同じで、id <> NULL が常に UNKNOWN なので、Engineering と Design は UNKNOWN、Sales は FALSE になり、どの部署も残らない。NOT EXISTS では Engineering と Design が TRUE で残り、Sales は Carol がいるので FALSE"
    >
      <T x={10} y={18} fs={12}>
        内側：SELECT department_id FROM users WHERE age &lt; 20 → 2（Carol）、NULL（Hana）
      </T>
      <Grid
        x={10}
        y={36}
        widths={[100, 34, 84, 96, 140, 150]}
        head={['departments', 'id', 'id <> 2', 'id <> NULL', 'NOT IN (2, NULL)', 'NOT EXISTS（相関）']}
        rows={rows}
        fs={11}
        fill={(r, c) => (c === 5 && rows[r][5].startsWith('TRUE') ? 'box5' : c >= 4 ? 'bg' : 'box')}
        dashed={(r, c) => c === 4 || (c === 5 && !rows[r][5].startsWith('TRUE'))}
      />
      <T x={10} y={160} fs={12}>
        NOT IN (2, NULL) は「id &lt;&gt; 2 AND id &lt;&gt; NULL」と同じ。id &lt;&gt; NULL は常に UNKNOWN なので、TRUE になる部署は無い
      </T>
      <T x={10} y={182} fs={12}>
        NOT EXISTS は「その部署の20歳未満のユーザーが1人もいないか」を見る。Hana の NULL はどの部署の id とも一致しない
      </T>
      <T x={10} y={206} fs={11} tone="muted">
        WHERE は TRUE の行だけを残す。FALSE と UNKNOWN の行は結果に出ない
      </T>
    </Svg>
  )
}

/* ---------- 番号なし図 includes と where で読み込まれる関連の範囲 ---------- */
function IncludesWhereFigure() {
  const hot = (r: number) => (r === 0 || r === 3 ? 'box5' : 'box')
  return (
    <Svg
      id="ch36-includes-where"
      w={780}
      h={392}
      label="左は1つ目の includes と where。users LEFT OUTER JOIN orders の10行を WHERE orders.status = 'paid' で絞り、残った4行（Alice と注文1、Bob と3、Carol と4、Eve と6）からレコードを作るので、Alice の u.orders は注文1だけ、Eve は注文6だけになる。右は2つ目のサブクエリと includes。SQL 1 で paid の注文がある4人（id 1・2・3・5）を選び、SQL 2 で orders を user_id IN (1, 2, 3, 5) の条件だけで読むので6件すべてが入り、Alice は注文1と2、Eve は注文5と6になる"
    >
      <T x={10} y={16} bold fs={12}>
        1つ目：includes と where（SQL 1回）
      </T>
      <Box x={10} y={34} w={320} h={30} lines="users LEFT OUTER JOIN orders：10行" fs={12} />
      <Arrow x1={170} y1={66} x2={170} y2={96} />
      <T x={180} y={81} mono fs={11}>
        WHERE orders.status = &apos;paid&apos;
      </T>
      <Grid x={100} y={98} widths={[80, 60]} head={['u.name', 'o.id']} rows={[['Alice', '1'], ['Bob', '3'], ['Carol', '4'], ['Eve', '6']]} rh={22} />
      <T x={252} y={164} fs={11.5} tone="muted">
        残った4行
      </T>
      <Arrow x1={170} y1={210} x2={170} y2={240} />
      <T x={180} y={225} fs={11.5}>
        残った行からレコードを作る
      </T>
      <Grid x={70} y={242} widths={[80, 120]} head={['User', 'u.orders の id']} rows={[['Alice', '1'], ['Bob', '3'], ['Carol', '4'], ['Eve', '6']]} rh={22} fill={hot} />
      <T x={10} y={374} fs={12}>
        pending の注文（id 2・5）は入らない
      </T>

      <T x={420} y={16} bold fs={12}>
        2つ目：サブクエリと includes（SQL 2回）
      </T>
      <Box x={420} y={34} w={350} h={44} lines={['SQL 1：users を IN のサブクエリで絞る', 'paid の注文がある4人（id 1・2・3・5）']} fs={12} subTone="muted" />
      <Arrow x1={595} y1={80} x2={595} y2={110} />
      <Box x={420} y={112} w={350} h={44} lines={['SQL 2：orders WHERE user_id IN (1, 2, 3, 5)', 'status では絞らないので6件すべて']} fs={12} subTone="muted" />
      <Arrow x1={595} y1={158} x2={595} y2={240} />
      <T x={605} y={199} fs={11.5}>
        ユーザーごとに注文を入れる
      </T>
      <Grid x={495} y={242} widths={[80, 120]} head={['User', 'u.orders の id']} rows={[['Alice', '1, 2'], ['Bob', '3'], ['Carol', '4'], ['Eve', '5, 6']]} rh={22} fill={hot} />
      <T x={420} y={374} fs={12}>
        4人の注文がすべて入る
      </T>
    </Svg>
  )
}

/* ---------- 番号なし図 RelationHandler#call の判定 ---------- */
function RelationHandlerFigure() {
  return (
    <Svg
      id="ch36-relation-handler"
      w={780}
      h={410}
      label="relation_handler.rb の call の判定を上から順に並べた図。まず value.eager_loading? が真なら JOIN を含む問い合わせに作り直す。次に value.select_values.empty? を判定し、偽（select あり）なら select で指定した列を使う。1つ目の例の Order.where(…).select(:user_id) は SELECT orders.user_id になる。真（select なし）なら model.composite_primary_key? を判定し、真なら ArgumentError、偽なら主キーの列を select する。2つ目の例の User.where(department_id: 2) は SELECT users.id、注意点の例の Order.where(amount: 10000..) は SELECT orders.id になり、users.id を注文の id と比べる。最後に attribute.in(value.arel) が「外側の列 IN (内側の SELECT)」の条件を作る"
    >
      <Box x={250} y={10} w={280} h={32} lines="value.eager_loading?" mono fs={12} />
      <Arrow x1={532} y1={26} x2={570} y2={26} />
      <T x={551} y={14} anchor="middle" fs={11.5}>
        はい
      </T>
      <Box x={572} y={10} w={198} h={32} lines="JOIN を含む問い合わせに作り直す" fs={11.5} />
      <Arrow d="M671,42 L671,62 L394,62" />
      <Arrow x1={390} y1={42} x2={390} y2={80} />
      <T x={382} y={56} anchor="end" fs={11.5}>
        いいえ
      </T>

      <Box x={250} y={82} w={280} h={32} lines="value.select_values.empty?" mono fs={12} />
      <Arrow d="M250,98 L170,98 L170,144" />
      <T x={162} y={122} anchor="end" fs={11.5}>
        いいえ（select あり）
      </T>
      <Arrow d="M530,98 L550,98 L550,144" />
      <T x={558} y={122} fs={11.5}>
        はい（select なし）
      </T>

      <Box x={40} y={146} w={260} h={32} lines="select で指定した列を使う" fs={12} />
      <T x={75} y={200} mono fs={11} tone="muted">
        1つ目：Order.where(…).select(:user_id)
      </T>
      <T x={75} y={218} mono fs={11}>
        → SELECT orders.user_id
      </T>
      <Arrow d="M60,178 L60,356 L248,356" />

      <Box x={420} y={146} w={260} h={32} lines="model.composite_primary_key?" mono fs={12} />
      <Arrow d="M680,162 L725,162 L725,206" />
      <T x={702} y={152} anchor="middle" fs={11.5}>
        はい
      </T>
      <Box x={650} y={208} w={120} h={32} fill="bg" />
      <T x={710} y={224} anchor="middle" mono fs={11.5} tone="danger">
        ArgumentError
      </T>
      <Arrow x1={520} y1={178} x2={520} y2={206} />
      <T x={528} y={192} fs={11.5}>
        いいえ
      </T>
      <Box x={420} y={208} w={200} h={32} lines="主キーの列を select する" fs={12} />
      <T x={455} y={260} mono fs={11} tone="muted">
        2つ目：User.where(department_id: 2)
      </T>
      <T x={455} y={278} mono fs={11}>
        → SELECT users.id
      </T>
      <T x={455} y={302} mono fs={11} tone="muted">
        注意点：Order.where(amount: 10000..)
      </T>
      <T x={455} y={320} mono fs={11} tone="danger">
        → SELECT orders.id（注文の id と比べる）
      </T>
      <Arrow x1={440} y1={240} x2={440} y2={338} />

      <Box x={250} y={340} w={280} h={32} lines="attribute.in(value.arel)" mono fs={12} fill="box5" />
      <T x={390} y={394} anchor="middle" fs={12}>
        「外側の列 IN (内側の SELECT)」の条件を作る
      </T>
    </Svg>
  )
}

const chapter: Chapter = {
  number: 36,
  part: 3,
  title: 'JOIN・集計・サブクエリ',
  summary:
    '利用者一覧に部署名を表示したり、注文の件数を利用者ごとに数えたりするには、複数の表を一緒に使います。表を結ぶ列に注目して、SQL を実行したときにどの行が残るかを確かめます。',
  goals: [
    '対応する部署や注文がない人を一覧に残すかどうかで JOIN を選べる',
    '行を絞る WHERE と、人数や合計を求めた後で絞る HAVING を使い分けられる',
    '別の問い合わせの結果を条件に使い、同じ条件を Active Record でも書ける',
  ],
  prerequisites: [35],
  sections: [
    {
      id: 'why-join',
      title: 'なぜテーブルを分けて JOIN でつなぐのか',
      body: (
        <>
          <p>
            ユーザーの一覧に部署名を表示し、各ユーザーの注文の金額も並べたいとします。1つの表で済ませるなら、users の行に部署名の列や「注文1の金額」「注文2の金額」のような列を持たせることになります。すると、部署名を変えるときにその部署のユーザーの行をすべて書き換えなければならず、注文の件数は人によって0件から何十件まで変わるので、列の数も決められません。
          </p>
          <p>
            そこで、部署・ユーザー・注文を別々のテーブルに保存し、行どうしの関係は相手の行の id を入れた列で表します。この列を<Term en="foreign key">外部キー</Term>と呼びます。この章の実行欄のサンプル DB では、users の department_id が departments の id を、orders の user_id が users の id を指しています。id のように行を1つに決める列（主キー）とテーブルの基本は<ChapterLink n={35} section="database" />で扱いました。
          </p>
          <Code
            lang="sql"
            title="サンプル DB のテーブル定義（public/sql/database/schema.js から。accounts は省略）"
            code={`
PRAGMA foreign_keys = ON;
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
  age INTEGER NOT NULL, department_id INTEGER REFERENCES departments(id),
  created_at TEXT NOT NULL DEFAULT '2026-01-01'
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT '2026-01-01'
);
`}
          />
          <p>
            REFERENCES は外部キー制約で、存在しない部署の id を department_id に入れようとすると DB が拒否します（SQLite では <code>PRAGMA foreign_keys = ON</code> で検査が有効になります）。users の department_id には NOT NULL が無いので、部署に属さないユーザーも保存でき、サンプルデータでは Hana の department_id が NULL です。orders の user_id は NOT NULL なので注文は必ずどれかのユーザーに属しますが、注文が1件も無いユーザー（Dave・Frank・Grace・Hana）はいます。
          </p>
          <Figure n="12-1" title="サンプル DB の3つのテーブルと外部キー" caption="実行欄のサンプル DB（public/sql/database/seed.js）の行をもとにした図。accounts は省略。">
            <TablesFigure />
          </Figure>
          <p>
            図 12-1 は3つのテーブルの行と、外部キーが指す行を示しています。この章の結果はどれもこの8人と6件の注文から計算されるので、最初に全体を載せました。点線の矢印1本が外部キーの値1つに当たり、矢印が多く集まる行ほど JOIN したときに結果の行が増えます。たとえば Alice（id 1）と Eve（id 5）には注文が2件ずつあるので、users と orders を JOIN すると2行ずつになります。
          </p>
          <p>
            Rails では外部キーを持つ側のモデルに belongs_to を、指される側に has_many を書きます（関連の宣言と内部の仕組みは
            <ChapterLink n={13} section="basics" />
            ）。この章では同じ構造のテーブルを MySQL 8.4.13 に作り、Ruby 4.0.9・Rails 8.1.4.1 の Active Record から問い合わせた結果を載せます。モデルは次のとおりです。
          </p>
          <Code
            lang="ruby"
            title="この章で使うモデル"
            code={`
class Department < ApplicationRecord
  has_many :users
end

class User < ApplicationRecord
  belongs_to :department, optional: true   # department_id が NULL のユーザーを許す
  has_many :orders
  has_many :paid_orders, -> { where(status: "paid") }, class_name: "Order"   # JOIN の節で使う
end

class Order < ApplicationRecord
  belongs_to :user
end
`}
          />
          <p>
            User の paid_orders は、orders と同じ orders テーブルを指す関連に条件を足したものです。第2引数の <code>{'-> { where(status: "paid") }'}</code> が関連に付ける絞り込みの条件で、<code>user.paid_orders</code> は status が paid の注文だけを返します。関連の名前 paid_orders からはモデルのクラスを決められないので、<code>class_name: &quot;Order&quot;</code> でクラスを指定しています。
          </p>
          <p>
            MySQL のテーブルは create_table と、外部キー制約を付けた t.references で作りました。id は Rails の既定の bigint で、データは実行欄と同じ id と値で入れています。
          </p>
        </>
      ),
    },
    {
      id: 'lab-views',
      title: '実行欄の可視化で確かめること',
      body: (
        <>
          <p>
            この章の実行欄では、SQL の実行結果の下に「SQLの構造と内部処理」が表示されます。実行欄は jinzai-draft-histery の教材「RailsエンジニアのためのSQL/データベース」の画面で、入力・実行・サンプルDB初期化の操作は<ChapterLink n={35} section="lab" />で説明しました。次の節からは SQL を実行するたびに、この表示で行がどの段階で増え、どの段階で減ったかを確かめます。この章で使う表示は次のとおりです。
          </p>
          <ul>
            <li>
              記述順：入力した SQL を MySQL の文法で解析し（node-sql-parser<Ref n={21} />
              ）、句ごとに並べたものです。ORDER BY の ASC・DESC を省略すると <code>null</code> と表示されますが、実行は昇順です。
            </li>
            <li>
              論理的な処理順：FROM・WHERE・GROUP BY などのボタンを押すと、その段階までの句だけを残した SELECT を作り直して実行し、その時点の行を表示します。作り直した SQL は「この段階のプレビューSQL」で読めます。FROM の段階の表の <code>id:1</code> のような列は、2つ目の表にある同じ名前の列（orders の id など）です。
            </li>
            <li>
              JOIN: 行の対応：ON の条件だけで組み合わせた行を、各表の主キーと name 列を使って「users の id と name ↔ orders の id」のように並べます。WHERE を適用する前の対応で、相手の無い側は「NULL · no match」と表示されます。
            </li>
            <li>GROUP BY: 行をグループへ：WHERE を通過した行を、GROUP BY のキーの値ごとに箱へ分けます。</li>
            <li>Subquery: 内側の結果 → 外側の条件／表：SQL の中の別の SELECT を取り出して単独で実行し、その結果を表示します。</li>
          </ul>
          <p>これらは理解のために SELECT を分解して実行し直した表示で、DB が実際に処理する順番や回数（実行計画）ではありません。次の制限があります。</p>
          <ul>
            <li>
              表示の上限は、実行結果が200行、段階表示が40行、JOIN の対応が30行です。グループの図は WHERE を通過した行の先頭200行から、最大20グループ・各6行を抜き出します。COUNT などの集計値は DB が全件から計算し、実行結果と GROUP BY の段階の表に出ます。
            </li>
            <li>
              段階表示の対象は基本的な SELECT で、WITH（CTE）・UNION・ウィンドウ関数を含む SQL は最終結果だけを表示します（どれもこの章の本文では使わない構文です）。MySQL の文法で解析できない SQL は可視化されませんが、SQLite で実行され、結果は表示されます。
            </li>
            <li>複数の SQL を続けて書くと、最後の SELECT を、すべてを実行した後の DB の状態で可視化します。RANDOM() のような関数は、段階ごとの再実行で値が変わることがあります。</li>
            <li>SQL はブラウザーのメインスレッド（画面の描画とクリックへの応答も受け持つ処理の流れ）で実行され、中断できません。大きな表どうしの CROSS JOIN のような重い SQL は、ブラウザーの操作を長く止めることがあります。</li>
            <li>
              サンプル DB は同じページの実行欄で共有しています。結果が本文と違うときは「サンプルDB初期化」で最初の状態に戻します。各テーブルの列と先頭30行は「Index と実行計画・Table / Schema の一覧」で確認できます（実行計画は
              <ChapterLink n={37} />
              ）。
            </li>
          </ul>
          <p>
            実行欄の SQL は sql.js（SQLite を JavaScript で動かすライブラリ）に含まれる SQLite 3.49.1 で実行されるので<Ref n={20} />、記述順の表示が MySQL の文法によるものでも、結果は SQLite のものです。MySQL 8.4 との違いは「MySQL 8.4 と実行欄の SQLite の違い」の節にまとめます。
          </p>
        </>
      ),
    },
    {
      id: 'join',
      title: 'JOIN：関連する行を横につなぐ',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>JOIN は2つのテーブルの行を条件に合うものどうしで組み合わせ、横につないで1つの表にします。ユーザー名と注文の金額を並べる SQL は次のとおりです。</p>
          <Code
            lang="sql"
            code={`
SELECT u.name, o.id AS order_id, o.amount
FROM users u INNER JOIN orders o ON u.id = o.user_id;
`}
          />
          <p>
            FROM の後に2つのテーブルを <code>INNER JOIN</code> で並べ、ON の後に組み合わせる条件を書きます。<code>users u</code> の u はこの SQL の中だけで使うテーブルの<Term>別名</Term>で、どちらの表にもある id 列を <code>u.id</code>・<code>o.id</code> のように区別します。<code>o.id AS order_id</code> の AS は結果の列に名前を付けます。JOIN の種類は次のとおりです。
          </p>
          <ul>
            <li>INNER JOIN：ON の条件に合う組だけを結果にします。相手の無い行は出ません。</li>
            <li>LEFT JOIN（LEFT OUTER JOIN）：左側（FROM で先に書いた表）の行をすべて残し、相手の無い行では右側の表の列を NULL（値が無いことを表す特別な値）にします。</li>
            <li>CROSS JOIN：条件を付けず、すべての組み合わせを作ります。8行と3行なら 8 × 3 = 24 行です。</li>
          </ul>
          <p>どの JOIN でも、結果の行は組み合わせの数だけできます。1人に注文が2件あれば、その人は結果に2行現れます。</p>
          <p>
            図 12-1 のデータで、users の行ごとに ON の条件 <code>u.id = o.user_id</code> に合う orders の行を探すと、次の表になります。右の2列は、その users の行から作られる結果の行の数です。
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>users の行</th>
                  <th>user_id が一致する orders の行</th>
                  <th>INNER JOIN</th>
                  <th>LEFT JOIN</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alice（id 1）</td>
                  <td>id 1・id 2</td>
                  <td>2行</td>
                  <td>2行</td>
                </tr>
                <tr>
                  <td>Bob（id 2）</td>
                  <td>id 3</td>
                  <td>1行</td>
                  <td>1行</td>
                </tr>
                <tr>
                  <td>Carol（id 3）</td>
                  <td>id 4</td>
                  <td>1行</td>
                  <td>1行</td>
                </tr>
                <tr>
                  <td>Dave（id 4）</td>
                  <td>なし</td>
                  <td>0行</td>
                  <td>1行（orders の列は NULL）</td>
                </tr>
                <tr>
                  <td>Eve（id 5）</td>
                  <td>id 5・id 6</td>
                  <td>2行</td>
                  <td>2行</td>
                </tr>
                <tr>
                  <td>Frank・Grace・Hana（id 6〜8）</td>
                  <td>なし</td>
                  <td>0行ずつ</td>
                  <td>1行ずつ（orders の列は NULL）</td>
                </tr>
                <tr>
                  <td>合計</td>
                  <td>6件</td>
                  <td>6行</td>
                  <td>10行</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>INNER JOIN と LEFT JOIN の違いは、一致する orders の行が無い4人の行を結果に入れるかどうかだけです。次の実行欄で、この行数を実際の結果と比べます。</p>

          <h3>実行欄で試す</h3>
          <SqlLab lesson="JOIN" title="SQL を実行する：JOIN" />
          <p>実行欄には Example の「LEFT JOIN」のサンプルが入力されています。実行して次の点を確かめます。</p>
          <ol>
            <li>実行結果は10行で、Alice と Eve は2行ずつ、Dave・Frank・Grace・Hana は order_id と amount が NULL の1行ずつです。</li>
            <li>「JOIN: 行の対応」の Dave などの行の右端は「NULL · no match」で、一致する orders の行が無かったことを表します。</li>
            <li>
              論理的な処理順の FROM を押すと、JOIN した直後の10行（users と orders の全列）が表示されます。この段階では Alice の注文が id 2、1 の順に表示され、ORDER BY を押すと u.id、o.id の順に並びます。
            </li>
            <li>Example で「INNER JOIN」を選び、「サンプルSQL挿入」を押してから実行すると6行になります。「CROSS JOIN」では users と departments のすべての組み合わせの24行になります。</li>
          </ol>
          <p>
            元の教材の課題は INNER・LEFT・CROSS を切り替えて対応図と行数を比べ、LEFT では注文の無いユーザーに注目することです。続けて、LEFT JOIN の右側の表（orders）に条件を付けた次の2つの SQL を、1つずつ入力して実行します。
          </p>
          <Code
            lang="sql"
            code={`
-- (1) 条件を WHERE に書く
SELECT u.name, o.id AS order_id, o.status
FROM users u LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 'paid'
ORDER BY u.id, o.id;

-- (2) 条件を ON に書く
SELECT u.name, o.id AS order_id, o.status
FROM users u LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'paid'
ORDER BY u.id, o.id;
`}
          />
          <p>
            (1) は4行で、注文の無い4人の行と、pending（未払い）の注文の行が消えます。論理的な処理順の WHERE を押すと、10行が4行に減るところを確認できます。(2) は8行で、8人全員が残り、paid（支払い済み）の注文が無い Dave などは order_id が NULL です。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            JOIN は左の表の各行について ON の条件が真になる右の表の行を探し、見つかった組ごとに1行を作ります。図 12-2 の左は LEFT JOIN の結果の10行で、実線の6行が ON に一致した組、つまり INNER JOIN の結果です。点線の4行は相手が無かった左側の行で、LEFT JOIN だけが右側の列を NULL にして残します
            <Ref n={4} />
            <Ref n={1} />。右の CROSS JOIN は ON が無いので、users の8行と departments の3行のすべての組（24行）ができます。
          </p>
          <Figure n="12-2" title="INNER JOIN・LEFT JOIN・CROSS JOIN の結果の行" caption="実行欄のサンプル（LEFT JOIN・CROSS JOIN）の結果をもとにした図。MySQL 8.4.13 でも同じ行が返った。">
            <JoinKindsFigure />
          </Figure>
          <p>
            図のとおり、結果の行の数は左の表の行の数ではなく、組み合わせの数で決まります。users は8行ですが、INNER JOIN の結果は6行、LEFT JOIN の結果は10行です。
          </p>
          <p>
            ON と WHERE の違いは条件を判定する時点にあります。ON の条件は組を作るときに使われ、一致しなかった左側の行は LEFT JOIN が NULL の行として残します。WHERE は組み合わせが終わった後の行を判定します。NULL の行では <code>o.status = &apos;paid&apos;</code> が NULL と &apos;paid&apos; の比較になり、結果は真でも偽でもない UNKNOWN（不明）です。WHERE は真の行だけを残すので、NULL の行は消えます。図 12-3 は (1) の10行の判定と (2) の結果を並べたものです。MySQL のマニュアルも、ON は表をつなぐ条件に、WHERE は結果に含める行を選ぶ条件に使うのが一般的だと説明しています<Ref n={4} />。
          </p>
          <Figure n="12-3" title="右側の表の条件を WHERE に置く場合と ON に置く場合" caption="実行欄で (1)・(2) を実行した結果をもとにした図。判定の列は説明のために加えた。">
            <OnWhereFigure />
          </Figure>

          <h3>Active Record ではこう書く</h3>
          <p>
            関連を宣言したモデルでは、<code>joins(:orders)</code> が INNER JOIN、<code>left_joins(:orders)</code>（<code>left_outer_joins</code> の別名）が LEFT OUTER JOIN の SQL を作り、ON の条件は関連の外部キー（user_id）から組み立てられます<Ref n={14} />。以下のコードでは、<code>#</code> の行が実行された SQL、<code>=&gt;</code> の行が戻り値です。
          </p>
          <Code
            lang="ruby"
            title="MySQL 8.4.13・Rails 8.1.4.1 での実行結果"
            code={`
User.joins(:orders).pluck(:name, "orders.id", "orders.amount")
# SELECT \`users\`.\`name\`, \`orders\`.\`id\`, \`orders\`.\`amount\` FROM \`users\`
#   INNER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
# => [["Alice", 1, 15000], ["Alice", 2, 3000], ["Bob", 3, 8000],
#     ["Carol", 4, 20000], ["Eve", 5, 12000], ["Eve", 6, 4000]]

User.left_joins(:orders).order(:id, "orders.id").pluck(:name, "orders.id", "orders.amount")
# SELECT \`users\`.\`name\`, \`orders\`.\`id\`, \`orders\`.\`amount\` FROM \`users\`
#   LEFT OUTER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#   ORDER BY \`users\`.\`id\` ASC, orders.id
# => [["Alice", 1, 15000], ["Alice", 2, 3000], ["Bob", 3, 8000], ["Carol", 4, 20000],
#     ["Dave", nil, nil], ["Eve", 5, 12000], ["Eve", 6, 4000],
#     ["Frank", nil, nil], ["Grace", nil, nil], ["Hana", nil, nil]]
`}
          />
          <p>
            SQL の NULL は Ruby の nil になります。JOIN した表の列は <code>&quot;orders.id&quot;</code> のように表名を付けて指定します。<code>:name</code> や <code>:id</code> のようにシンボルで書いた列は、Rails が呼び出し元のモデルの表名を付けて <code>`users`.`id`</code> にするためです。users と orders のどちらにもある id は、シンボルでは users の列になります。
          </p>
          <p>
            JOIN した表の条件は <code>where(orders: {'{ status: "paid" }'})</code> のようにハッシュで書けます<Ref n={15} />。外側のキー orders が表の名前で、内側のハッシュがその表の列と値です。この条件は WHERE 句に入るので、LEFT JOIN と組み合わせると (1) と同じく NULL の行が消えます。ON に条件を入れるには、最初の節で宣言した条件付きの関連 paid_orders を JOIN します。
          </p>
          <Code
            lang="ruby"
            code={`
User.left_joins(:orders).where(orders: { status: "paid" }).order(:id, "orders.id").pluck(:name, "orders.id")
# SELECT \`users\`.\`name\`, \`orders\`.\`id\` FROM \`users\`
#   LEFT OUTER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#   WHERE \`orders\`.\`status\` = 'paid' ORDER BY \`users\`.\`id\` ASC, orders.id
# => [["Alice", 1], ["Bob", 3], ["Carol", 4], ["Eve", 6]]

User.left_joins(:paid_orders).order(:id, "orders.id").pluck(:name, "orders.id")
# SELECT \`users\`.\`name\`, \`orders\`.\`id\` FROM \`users\`
#   LEFT OUTER JOIN \`orders\` ON \`orders\`.\`status\` = 'paid' AND \`orders\`.\`user_id\` = \`users\`.\`id\`
#   ORDER BY \`users\`.\`id\` ASC, orders.id
# => [["Alice", 1], ["Bob", 3], ["Carol", 4], ["Dave", nil], ["Eve", 6],
#     ["Frank", nil], ["Grace", nil], ["Hana", nil]]
`}
          />
          <p>
            JOIN では、関連のスコープの条件が ON 句に入りました。「注文が1件も無いユーザー」は、LEFT JOIN して右側の主キーが NULL の行を選ぶと求められます（MySQL のマニュアルにもこの例があります<Ref n={4} />
            ）。Rails では <code>where.missing</code> がこの SQL を作り、反対の <code>where.associated</code> は INNER JOIN と IS NOT NULL の条件を作ります<Ref n={14} />
            <Ref n={15} />。
          </p>
          <Code
            lang="ruby"
            code={`
User.where.missing(:orders).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\` LEFT OUTER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#   WHERE \`orders\`.\`id\` IS NULL
# => ["Dave", "Frank", "Grace", "Hana"]

User.where.associated(:orders).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\` INNER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#   WHERE \`orders\`.\`id\` IS NOT NULL
# => ["Alice", "Alice", "Bob", "Carol", "Eve", "Eve"]
`}
          />
          <p>
            where.associated の結果に Alice と Eve が2回ずつ出るのは、INNER JOIN の結果が注文の数だけ行を持つからです。belongs_to の関連も JOIN でき、関連で表せない CROSS JOIN などは joins に SQL の文字列を渡します<Ref n={14} />。
          </p>
          <Code
            lang="ruby"
            code={`
User.left_joins(:department).order(:id).pluck(:name, "departments.name")
# SELECT \`users\`.\`name\`, \`departments\`.\`name\` FROM \`users\`
#   LEFT OUTER JOIN \`departments\` ON \`departments\`.\`id\` = \`users\`.\`department_id\`
#   ORDER BY \`users\`.\`id\` ASC
# => [["Alice", "Engineering"], ["Bob", "Engineering"], ["Carol", "Sales"], ["Dave", "Sales"],
#     ["Eve", "Sales"], ["Frank", "Engineering"], ["Grace", "Design"], ["Hana", nil]]

User.joins("CROSS JOIN departments").count
# SELECT COUNT(*) FROM \`users\` CROSS JOIN departments
# => 24
`}
          />
          <p>部署の無い Hana は <code>joins(:department)</code> では結果から消え、left_joins では部署名が nil になります。</p>

          <h3>注意点</h3>
          <ul>
            <li>
              has_many の関連を joins すると、親のレコードが相手の数だけ重複します。<code>User.joins(:orders).count</code> は 6、<code>distinct</code> を付けると 4 でした（下のコード）。Rails ガイドも、一意にしたいときは distinct を使うよう説明しています<Ref n={14} />。IN や EXISTS のサブクエリでも重複を避けられます。
            </li>
            <li>LEFT JOIN の右側の表の条件を where に書くと、INNER JOIN と同じ結果になることがあります。相手の無い行も残すなら、条件を ON に入れます。</li>
            <li>JOIN の結果の順序は ORDER BY を書かない限り決まりません。</li>
          </ul>
          <Code
            lang="ruby"
            code={`
User.joins(:orders).count            # => 6
# SELECT COUNT(*) FROM \`users\` INNER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
User.joins(:orders).distinct.count   # => 4
# SELECT COUNT(DISTINCT \`users\`.\`id\`) FROM \`users\` INNER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
`}
          />
        </>
      ),
    },
    {
      id: 'join-loading',
      title: 'joins と includes・eager_load の違い',
      body: (
        <>
          <p>
            元の教材は、N+1 対策の includes は関連の読み込み方を変える機能で、単純な JOIN と同じものではないと注意しています。N+1 は、一覧の各行で関連を読むたびに SQL が実行され、回数が件数に比例して増える問題です（
            <ChapterLink n={13} section="n-plus-one" />
            ）。joins は SQL に JOIN を足すメソッドで、includes と eager_load は後で使う関連のレコードを先にまとめて読み込むメソッドです。ここでは3つのメソッドが実行する SQL と作られるレコードを、各ユーザーの注文の件数（<code>u.orders.size</code>）で比べます。
          </p>
          <Code
            lang="ruby"
            code={`
User.joins(:orders).distinct.order(:id).map { |u| [u.name, u.orders.size] }
# SELECT DISTINCT \`users\`.* FROM \`users\` INNER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#   ORDER BY \`users\`.\`id\` ASC
# SELECT COUNT(*) FROM \`orders\` WHERE \`orders\`.\`user_id\` = 1
# SELECT COUNT(*) FROM \`orders\` WHERE \`orders\`.\`user_id\` = 2
# SELECT COUNT(*) FROM \`orders\` WHERE \`orders\`.\`user_id\` = 3
# SELECT COUNT(*) FROM \`orders\` WHERE \`orders\`.\`user_id\` = 5
# => [["Alice", 2], ["Bob", 1], ["Carol", 1], ["Eve", 2]]

User.includes(:orders).order(:id).map { |u| [u.name, u.orders.size] }
# SELECT \`users\`.* FROM \`users\` ORDER BY \`users\`.\`id\` ASC
# SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`user_id\` IN (1, 2, 3, 4, 5, 6, 7, 8)
# => [["Alice", 2], ["Bob", 1], ["Carol", 1], ["Dave", 0], ["Eve", 2], ["Frank", 0], ["Grace", 0], ["Hana", 0]]

User.eager_load(:orders).order(:id).map { |u| [u.name, u.orders.size] }
# SELECT \`users\`.\`id\` AS t0_r0, \`users\`.\`name\` AS t0_r1, ...（users の残りの列）,
#        \`orders\`.\`id\` AS t1_r0, \`orders\`.\`user_id\` AS t1_r1, ...（orders の残りの列）
#   FROM \`users\` LEFT OUTER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\` ORDER BY \`users\`.\`id\` ASC
# => [["Alice", 2], ["Bob", 1], ["Carol", 1], ["Dave", 0], ["Eve", 2], ["Frank", 0], ["Grace", 0], ["Hana", 0]]
`}
          />
          <ul>
            <li>
              joins は SQL に JOIN を加えて行を絞るだけで、orders のレコードを読み込みません。<code>u.orders.size</code> は、関連が読み込み済みなら読み込んだレコードの数を返し、読み込んでいなければ COUNT の SQL を実行します。そのため <code>u.orders.size</code> がユーザーごとに COUNT を実行しました（4人で4回）。結果は注文のあるユーザーだけです。
            </li>
            <li>
              includes はこの例では JOIN を使わず、users を読んだ後に orders を IN でまとめて読みました（関連を別の SELECT で読む preload と同じ動き）。SQL はユーザーの人数に関係なく2回です。注文の無いユーザーも含まれます。
            </li>
            <li>
              eager_load は LEFT OUTER JOIN の SQL 1回で両方を読み、結果の10行からユーザー8件とそれぞれの注文を組み立てました。SQL の <code>t0_r0</code>・<code>t1_r0</code> は Rails が付けた列の別名で、t0 が users、t1 が orders、r の後の数字がその表の中での列の番号です。users と orders のどちらにもある id も、この別名で区別して読み取れます。
            </li>
          </ul>
          <p>
            orders を条件にだけ使い、注文のレコードを画面に出さないなら joins で足ります。一覧の各行で <code>u.orders</code> を読むなら includes を付けて、ユーザーごとの SQL を無くします（使い分けは
            <ChapterLink n={13} section="joins" />
            ）。
          </p>
          <p>
            includes は関連の表を条件や並び順に使うと eager_load と同じ JOIN の SQL に切り替わり（判定は
            <ChapterLink n={13} section="includes" />
            ）、条件に合わない関連のレコードは読み込まれません。
          </p>
          <Code
            lang="ruby"
            code={`
User.includes(:orders).where(orders: { status: "paid" }).order(:id).map { |u| [u.name, u.orders.map(&:id)] }
# SELECT \`users\`.\`id\` AS t0_r0, ... FROM \`users\` LEFT OUTER JOIN \`orders\` ON \`orders\`.\`user_id\` = \`users\`.\`id\`
#   WHERE \`orders\`.\`status\` = 'paid' ORDER BY \`users\`.\`id\` ASC
# => [["Alice", [1]], ["Bob", [3]], ["Carol", [4]], ["Eve", [6]]]

User.where(id: Order.where(status: "paid").select(:user_id)).includes(:orders).order(:id)
    .map { |u| [u.name, u.orders.map(&:id)] }
# SELECT \`users\`.* FROM \`users\` WHERE \`users\`.\`id\` IN
#   (SELECT \`orders\`.\`user_id\` FROM \`orders\` WHERE \`orders\`.\`status\` = 'paid') ORDER BY \`users\`.\`id\` ASC
# SELECT \`orders\`.* FROM \`orders\` WHERE \`orders\`.\`user_id\` IN (1, 2, 3, 5)
# => [["Alice", [1, 2]], ["Bob", [3]], ["Carol", [4]], ["Eve", [5, 6]]]
`}
          />
          <p>
            1つ目では、Alice の注文は2件あるのに <code>u.orders</code> には paid の1件（id 1）しか入っていません。WHERE が JOIN の結果の行を絞った後で、残った行からレコードを組み立てるからです。paid の注文があるユーザーの注文をすべて表示したいなら、2つ目のように絞り込みをサブクエリにして読み込みと分けます。Rails ガイドも、読み込む関連に条件を付けることはできるが、この種の問い合わせには joins を使う方法を勧めると書いています<Ref n={14} />。
          </p>
          <p>次の図は、上の2つの書き方で u.orders に入る注文が決まるまでを、上から順に並べたものです。左が1つ目、右が2つ目で、下段の表を見比べると Alice と Eve の注文の数が違います。</p>
          <Figure title="includes と where で読み込まれる注文" caption="上のコードの実行結果をもとにした模式図。左の4行は図 12-3 の (1) と同じ行。色を付けた行は2つの書き方で u.orders の中身が違うユーザー。">
            <IncludesWhereFigure />
          </Figure>
        </>
      ),
    },
    {
      id: 'group-by',
      title: 'GROUP BY：行をグループにまとめて集計する',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            <Term>集約関数</Term>は複数の行から1つの値を計算する関数で、COUNT(*) は行の数、SUM(列) は合計、AVG(列) は平均、MAX(列)・MIN(列) は最大・最小を返します。GROUP BY を書かずに使うと、WHERE を通過した行全体が1つのまとまりになり、結果は1行です。
          </p>
          <Code
            lang="sql"
            code={`
SELECT COUNT(*), COUNT(department_id), COUNT(DISTINCT department_id) FROM users;
-- 結果：8 | 7 | 3
`}
          />
          <p>
            COUNT(*) は行の数（8）、COUNT(department_id) は department_id が NULL でない行の数（Hana を除く7）、COUNT(DISTINCT department_id) は NULL 以外の異なる値の数（3）です<Ref n={2} />
            <Ref n={6} />。GROUP BY を書くと、指定した列の値が同じ行が1つのグループになり、集約関数はグループごとに計算されます。結果はグループごとに1行です。
          </p>
          <Code
            lang="sql"
            code={`
SELECT department_id, COUNT(*) AS user_count
FROM users
GROUP BY department_id;
`}
          />
          <p>department_id はグループごとに値が1つに決まるので SELECT に書けますが、集約関数で包んでいないほかの列（name など）は値が1つに決まりません。この列の扱いは DB によって異なり、注意点で説明します。</p>

          <h3>実行欄で試す</h3>
          <SqlLab lesson="GROUP BY" title="SQL を実行する：GROUP BY" />
          <p>Example の「部署ごとの人数」が入力されています。実行して次の点を確かめます。</p>
          <ol>
            <li>実行結果は4行で、department_id が NULL・1・2・3 のグループの人数は 1・3・3・1 です。NULL もひとつのグループになります。</li>
            <li>「GROUP BY: 行をグループへ」では、1 の箱に Alice・Bob・Frank が、NULL の箱に Hana が入っています。メンバーの行の NULL は空欄で表示されます。</li>
            <li>論理的な処理順の GROUP BY を押すと、8行がグループごとの4行になり、この時点の集約値も表示されます。</li>
            <li>Example で「平均とNULL」を選んで実行すると、部署ごとの平均年齢（AVG(age)）と、NULL のグループだけ 0 になる non_null（COUNT(department_id)）が表示されます。</li>
          </ol>
          <p>元の教材の課題に沿って、1つ目のサンプルの <code>COUNT(*)</code> を <code>AVG(age)</code> に書き換えて実行すると、グループの図は変わらず、各グループから計算する値だけが変わります。</p>
          <p>
            グループの図の「表示対象内 COUNT」は図に入れた行の数で、SQL が COUNT(department_id) を計算していても行数を表示します。そのため「平均とNULL」の NULL のグループでは、図の COUNT は 1、実行結果の non_null は 0 です。図は先頭200行から作るので、行が多いと全件の集計値とも一致しません。集計値は実行結果か GROUP BY の段階の表で確かめます。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            図 12-4 は users の8行を department_id でグループに分け、各グループから集約値を計算する流れです。上段の箱がグループ、下段の表が SELECT の結果で、箱1つが結果の1行になることと、NULL の行もひとつのグループになることを示しています。
          </p>
          <Figure n="12-4" title="GROUP BY でグループに分けて集計する" caption="実行欄の「平均とNULL」に COUNT(*) を加えた SQL の結果をもとにした図。AVG(age) の値は、SQLite では 21.333333333333332、MySQL 8.4.13 では 21.3333 だった。">
            <GroupFigure />
          </Figure>
          <p>
            NULL どうしは通常の比較（=）では等しいと判定されませんが、GROUP BY では1つのグループにまとまります。SQLite のマニュアルは行をグループに分けるときは NULL どうしを等しいとみなすと書き<Ref n={1} />
            、MySQL のマニュアルも GROUP BY では2つの NULL を等しいとみなすと書いています<Ref n={7} />。
          </p>
          <p>
            COUNT(列) が NULL を数えないのは、COUNT(X) が X が NULL でない値の数を返すと定められているからで、AVG と SUM も NULL を除いて計算します<Ref n={2} />
            <Ref n={6} />。元の教材の確認問題は「COUNT(age) が数えるのは何か」で、答えは「age が NULL でない行」です。全行を数えるのは COUNT(*)、異なる値の数は COUNT(DISTINCT age) です。サンプル DB の age は NOT NULL なので COUNT(age) は COUNT(*) と同じ 8 になり、違いを見るには department_id を使います。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>
            <code>group</code> で GROUP BY を付けて <code>count</code>・<code>sum</code>・<code>average</code>・<code>maximum</code>・<code>minimum</code> で集計すると、グループのキーと集計値のハッシュが返ります<Ref n={14} />
            <Ref n={16} />。
          </p>
          <Code
            lang="ruby"
            code={`
User.group(:department_id).count
# SELECT COUNT(*) AS \`count_all\`, \`users\`.\`department_id\` AS \`users_department_id\`
#   FROM \`users\` GROUP BY \`users\`.\`department_id\`
# => {nil => 1, 1 => 3, 2 => 3, 3 => 1}

User.group(:department_id).count(:department_id)
# SELECT COUNT(\`users\`.\`department_id\`) AS \`count_department_id\`, ... GROUP BY \`users\`.\`department_id\`
# => {nil => 0, 1 => 3, 2 => 3, 3 => 1}

User.group(:department_id).average(:age)
# SELECT AVG(\`users\`.\`age\`) AS \`average_age\`, ... GROUP BY \`users\`.\`department_id\`
# => {nil => 0.17e2, 1 => 0.213333e2, 2 => 0.263333e2, 3 => 0.35e2}

User.group(:department_id).maximum(:age)
# => {nil => 17, 1 => 24, 2 => 32, 3 => 35}

Order.group(:user_id).sum(:amount)
# SELECT SUM(\`orders\`.\`amount\`) AS \`sum_amount\`, \`orders\`.\`user_id\` AS \`orders_user_id\`
#   FROM \`orders\` GROUP BY \`orders\`.\`user_id\`
# => {1 => 18000, 2 => 8000, 3 => 20000, 5 => 16000}
`}
          />
          <ul>
            <li>
              ハッシュのキーはグループの値で、NULL のグループは nil です。SQL の <code>count_all</code> や <code>users_department_id</code> は、Rails が結果を読み取るために付けた列の別名です。元の教材の例 <code>User.group(:department_id).count</code> は、部署 ID をキーにしたこのハッシュを返します。
            </li>
            <li>
              average の値は BigDecimal で、<code>0.213333e2</code> は 21.3333 です。MySQL は整数の列の AVG を DECIMAL で返します<Ref n={6} />。実行欄の SQLite の AVG は 21.333333333333332 のような浮動小数点数です<Ref n={2} />。
            </li>
            <li>
              注文の無いユーザー（id 4・6・7・8）は sum のハッシュにキーがありません。<code>sums = Order.group(:user_id).sum(:amount)</code> としておき、表示するときは <code>sums.fetch(user.id, 0)</code> のように既定値を決めます。
            </li>
          </ul>
          <p>複数の列で group するとキーは値の配列になり、JOIN した表の列でもグループを作れます。</p>
          <Code
            lang="ruby"
            code={`
Order.group(:user_id, :status).count
# => {[1, "paid"] => 1, [1, "pending"] => 1, [2, "paid"] => 1, [3, "paid"] => 1,
#     [5, "pending"] => 1, [5, "paid"] => 1}

User.joins(:department).group("departments.name").count
# SELECT COUNT(*) AS \`count_all\`, \`departments\`.\`name\` AS \`departments_name\` FROM \`users\`
#   INNER JOIN \`departments\` ON \`departments\`.\`id\` = \`users\`.\`department_id\`
#   GROUP BY \`departments\`.\`name\`
# => {"Engineering" => 3, "Sales" => 3, "Design" => 1}
`}
          />
          <p>2つ目は INNER JOIN なので、部署の無い Hana は数えられません。集計値をハッシュではなくレコードの属性として受け取るには、select で集約関数の列に AS で別名を付けます。</p>
          <Code
            lang="ruby"
            code={`
Department.left_joins(:users)
          .select("departments.*", "COUNT(users.id) AS users_count")
          .group(:id).order(:id)
          .map { |d| [d.name, d.users_count] }
# SELECT departments.*, COUNT(users.id) AS users_count FROM \`departments\`
#   LEFT OUTER JOIN \`users\` ON \`users\`.\`department_id\` = \`departments\`.\`id\`
#   GROUP BY \`departments\`.\`id\` ORDER BY \`departments\`.\`id\` ASC
# => [["Engineering", 3], ["Sales", 3], ["Design", 1]]
`}
          />
          <p>
            ユーザーのいない部署があれば、相手の無い行の users.id は NULL なので、users_count が 0 の行として残ります。<code>COUNT(*)</code> と書くと、相手の無い行も1行と数えるので、ユーザーのいない部署が 1 になります。GROUP BY が departments.id だけでも departments.* を SELECT できる理由は、次の注意点で説明します。
          </p>

          <h3>注意点</h3>
          <p>GROUP BY に無く、集約関数でも包んでいない列を SELECT に書くと、実行欄の SQLite と MySQL 8.4 で結果が変わります。次の SQL を実行欄で試し、MySQL の結果と比べます。</p>
          <Code
            lang="text"
            code={`
SELECT department_id, name, COUNT(*) FROM users GROUP BY department_id;

実行欄（SQLite）：4行が返る。name はグループの中のどれか1行の値
  NULL | Hana  | 1
  1    | Alice | 3
  2    | Carol | 3
  3    | Grace | 1

MySQL 8.4.13：
  ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains
  nonaggregated column 'ch36.users.name' which is not functionally dependent on columns in
  GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
`}
          />
          <p>
            SQLite はこのような列（bare column）の値をグループの中の1行から取ります。SQLite のマニュアルは、どの行かは決まっておらず、これは SQLite 独自の拡張で多くの DB はエラーにすると書いています<Ref n={1} />。MySQL 8.4 は ONLY_FULL_GROUP_BY（MySQL が受け付ける SQL の範囲を切り替える設定 sql_mode の値の1つ）が既定で有効で、SELECT・HAVING・ORDER BY に、GROUP BY に無く GROUP BY の列から値が1つに決まる（関数従属する）とも言えない列があると拒否します<Ref n={5} />。上の Department の例が通ったのは、GROUP BY の departments.id が主キーで、主キーが決まれば同じ行の name も1つに決まるからです。元の教材も、SQLite で許される SQL が MySQL の ONLY_FULL_GROUP_BY では拒否されることがあると注意しています。
          </p>
          <p>ERROR 1055 が出たら、エラーに書かれた列（上の例では name）でグループから何を取り出したいかを決めて、SQL を直します。</p>
          <ul>
            <li>
              グループの中の最大や最小の値でよければ、<code>MAX(name)</code> のように集約関数で包みます。
            </li>
            <li>
              その列でもグループを分けたいなら、<code>GROUP BY department_id, name</code> のように GROUP BY に加えます。グループの単位が部署から「部署と名前の組」に変わるので、名前がすべて異なるこの例では8人が1人ずつのグループになり、COUNT(*) はどれも 1 です。
            </li>
            <li>
              グループの中のどの行の値でもよければ、MySQL の関数 <code>ANY_VALUE(name)</code> で包みます<Ref n={5} />。
            </li>
          </ul>
          <p>Active Record でも、SELECT や ORDER BY に GROUP BY に無い列が入ると同じエラーになります。</p>
          <Code
            lang="ruby"
            code={`
User.group(:department_id).to_a
# SELECT \`users\`.* FROM \`users\` GROUP BY \`users\`.\`department_id\`
# ActiveRecord::StatementInvalid: Mysql2::Error: Expression #1 of SELECT list is not in GROUP BY clause
#   and contains nonaggregated column 'ch36.users.id' ...

User.select(:department_id, "COUNT(*) AS user_count").group(:department_id).first
# SELECT \`users\`.\`department_id\`, COUNT(*) AS user_count FROM \`users\`
#   GROUP BY \`users\`.\`department_id\` ORDER BY \`users\`.\`id\` ASC LIMIT 1
# ActiveRecord::StatementInvalid: Mysql2::Error: Expression #1 of ORDER BY clause is not in GROUP BY clause ...
`}
          />
          <p>
            1つ目は group だけを付けて読み込み、SELECT が <code>users.*</code> のままになった例です。Rails ガイドの <code>Order.group(&quot;status&quot;)</code> の例も同じ形の SQL です<Ref n={14} />。group を付けた Relation は、count などの集計のメソッドで終えるか、2つ目のように select で GROUP BY の列と集約関数だけを指定します。2つ目は、first が並び順の無い Relation に主キーの ORDER BY を足したため拒否された例で、<code>order(:department_id).first</code> のように並び順を指定すれば実行できます。
          </p>
          <p>
            JOIN と集計を組み合わせるときは、COUNT が何の行を数えているかを確かめます。次の <code>joins(users: :orders)</code> は、departments に users を JOIN し、その users に orders を JOIN する書き方です。注文のあるユーザーの人数を部署ごとに求めるつもりで書いた1つ目と、数える対象を指定した2つ目を比べます。
          </p>
          <Code
            lang="ruby"
            code={`
Department.joins(users: :orders).group("departments.name").count
# SELECT COUNT(*) AS \`count_all\`, \`departments\`.\`name\` AS \`departments_name\` FROM \`departments\`
#   INNER JOIN \`users\` ON ... INNER JOIN \`orders\` ON ... GROUP BY \`departments\`.\`name\`
# => {"Engineering" => 3, "Sales" => 3}

Department.joins(users: :orders).group("departments.name").distinct.count("users.id")
# SELECT COUNT(DISTINCT \`users\`.\`id\`) AS \`count_users_id\`, ... GROUP BY \`departments\`.\`name\`
# => {"Engineering" => 2, "Sales" => 2}
`}
          />
          <ul>
            <li>
              JOIN してから集計すると、COUNT(*) は JOIN した後の行を数えます。上の Engineering の 3 は人数ではなく、Alice の2件と Bob の1件の注文の数です。人数なら <code>distinct.count(&quot;users.id&quot;)</code> とします。SUM も JOIN で増えた行の分だけ同じ値を重ねて足すことがあります。
            </li>
            <li>グループの順序は ORDER BY を書かない限り決まりません。<code>group(:department_id).order(:department_id).count</code> のように指定します（count の別名を使った <code>order(count_all: :desc)</code> も動きました）。</li>
            <li>対象の行が無いと、SQL の SUM・AVG・MAX は NULL を返します。Rails の sum はこれを 0 にし、average と maximum は nil を返しました。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'having',
      title: 'HAVING：集計した後のグループを絞り込む',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            WHERE はグループにまとめる前の1行ずつを判定し、HAVING は GROUP BY でまとめた後のグループを判定するので、COUNT(*) のような集約関数の値を条件に使えます。次の SQL は「20歳以上のユーザーが2人以上いる部署」を、人数の多い順に返します。
          </p>
          <Code
            lang="sql"
            code={`
SELECT department_id, COUNT(*) AS user_count
FROM users
WHERE age >= 20
GROUP BY department_id
HAVING COUNT(*) >= 2
ORDER BY user_count DESC;
`}
          />
          <p>
            書くときは SELECT が先頭ですが、意味を考えるときは <code>FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</code> の順に処理されるとみなします。この順番を<Term>論理的な処理順</Term>と呼びます。WHERE の時点ではグループが無く人数（COUNT(*)）が決まっていないので、「人数が2人以上」は HAVING に書きます。ORDER BY は SELECT の後なので、SELECT で付けた別名 user_count を使えます。
          </p>

          <h3>実行欄で試す</h3>
          <SqlLab lesson="HAVING" title="SQL を実行する：HAVING" />
          <ol>
            <li>入力済みのサンプルを実行すると、結果は department_id が 1（3人）と 2（2人）の2行です。</li>
            <li>
              論理的な処理順のボタンを左から押すと、FROM で8行、WHERE で6行（19歳の Carol と17歳の Hana が消える）、GROUP BY で3グループ（1は3人、2は2人、3は1人）、HAVING で2グループ（Grace だけの部署3が消える）になります。
            </li>
            <li>「GROUP BY: 行をグループへ」には部署3の箱も表示されます。この図は WHERE を通過した行を分けたもので、HAVING を適用する前の状態です。</li>
          </ol>
          <p>
            元の教材の課題は WHERE の年齢と HAVING の人数を変え、どの段階で行やグループが消えるかをボタンで追うことです。たとえば WHERE を <code>age &gt;= 25</code> にすると、WHERE の段階で Dave・Eve・Grace の3行になり、HAVING の後には部署2だけが残ります。
          </p>

          <h3>なぜそうなるか</h3>
          <p>図 12-5 はこのサンプルの各段階で残る行とグループの数を、対応する Active Record のメソッドと並べたものです。行を減らす WHERE とグループを減らす HAVING が別の段階にあることを、数の変化で示しています。</p>
          <Figure n="12-5" title="論理的な処理順と、各段階で残る行・グループ" caption="実行欄の HAVING のサンプルで、論理的な処理順のボタンを順に押した結果をもとにした図。">
            <OrderFigure />
          </Figure>
          <p>
            この順番は SQL の意味を説明するための論理的な順番で、DB が実際に処理する順番ではありません。SQLite のマニュアルは、段階に分けた説明は説明のためのもので、どの DB もその手順どおりに処理する必要はないと書いています<Ref n={1} />。
          </p>
          <p>
            元の教材の確認問題は「部署の人数で絞るのはどれか」で、選択肢は <code>WHERE COUNT(*) &gt;= 2</code>・<code>HAVING COUNT(*) &gt;= 2</code>・<code>ORDER BY COUNT(*) &gt;= 2</code> です。人数は集約した後に決まるので、答えは HAVING です。WHERE に集約関数を書くと、実行欄の SQLite は「misuse of aggregate: COUNT()」、MySQL 8.4.13 は「ERROR 1111 (HY000): Invalid use of group function」で拒否しました。ORDER BY に書いた比較は並べ替えのキーになるだけで、グループは減りません。
          </p>

          <h3>Active Record ではこう書く</h3>
          <Code
            lang="ruby"
            code={`
User.where("age >= ?", 20).group(:department_id).having("COUNT(*) >= ?", 2).count
# SELECT COUNT(*) AS \`count_all\`, \`users\`.\`department_id\` AS \`users_department_id\` FROM \`users\`
#   WHERE (age >= '20') GROUP BY \`users\`.\`department_id\` HAVING (COUNT(*) >= '2')
# => {1 => 3, 2 => 2}
`}
          />
          <p>
            元の教材の Rails の例をそのまま実行した結果です。where・group・having を呼ぶ順番は自由で、Rails が SQL の句の順に並べます。
          </p>
          <p>
            値が <code>&apos;20&apos;</code>・<code>&apos;2&apos;</code> と引用符付きなのは、MySQL のアダプター（Active Record の中で MySQL 向けの SQL の書き方を受け持つ部分）が <code>?</code> に渡した数値を文字列として埋め込むからで、Rails のドキュメントは問い合わせを操作する攻撃を防ぐためと説明しています<Ref n={18} />。比べる列 age は数値の列なので、MySQL は &apos;20&apos; を数値に変換して比べ、結果は変わりません。範囲のハッシュ <code>where(age: 20..)</code> なら <code>`users`.`age` &gt;= 20</code> と引用符なしで書かれました。
          </p>
          <p>SQL のサンプルと同じ2列を、人数の多い順に受け取ることもできます。</p>
          <Code
            lang="ruby"
            code={`
User.select(:department_id, "COUNT(*) AS user_count")
    .where("age >= ?", 20).group(:department_id)
    .having("COUNT(*) >= ?", 2).order(user_count: :desc)
    .map { |u| [u.department_id, u.user_count] }
# SELECT \`users\`.\`department_id\`, COUNT(*) AS user_count FROM \`users\` WHERE (age >= '20')
#   GROUP BY \`users\`.\`department_id\` HAVING (COUNT(*) >= '2') ORDER BY \`user_count\` DESC
# => [[1, 3], [2, 2]]
`}
          />
          <p>
            戻り値は User のインスタンスの配列ですが、中身は部署ごとの集計の行で、<code>u.id</code> は nil です。Rails ガイドの having の例も、select の別名で集計値を読んでいます<Ref n={14} />。user_count は users の列ではないので、Rails は表名を付けずに <code>`user_count`</code> と書きました。
          </p>

          <h3>注意点</h3>
          <ul>
            <li>
              集約関数を使わない条件は WHERE に書きます。MySQL のマニュアルは、HAVING は結果をクライアントに送る直前に最適化なしで適用されると書き、WHERE に書くべき条件を HAVING に書かないよう注意しています<Ref n={8} />。
            </li>
            <li>
              <code>HAVING user_count &gt;= 2</code> のような SELECT の別名は、MySQL 8.4.13 でも実行欄の SQLite でも使えました。MySQL のマニュアルによると、これは MySQL の拡張で、標準 SQL の HAVING で参照できるのは GROUP BY の列と集約関数の中の列です<Ref n={8} />。
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'subquery',
      title: 'サブクエリ：SELECT の結果を条件や表として使う',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            <Term en="subquery">サブクエリ</Term>は SQL の中に括弧で囲んで書いた別の SELECT で、置く場所によって使い方が変わります。
          </p>
          <ul>
            <li>WHERE の IN の右側：内側の SELECT が返した値の集合に、外側の行の値が含まれるかを判定します。</li>
            <li>
              FROM の中：内側の結果を1つの表として扱い、外側でさらに絞り込みます。この表を<Term en="derived table">導出表</Term>と呼び、MySQL では別名が必須です<Ref n={12} />。
            </li>
            <li>EXISTS の右側：内側の SELECT が1行以上返すかどうかを判定します。</li>
          </ul>
          <Code
            lang="sql"
            code={`
-- 1万円以上の注文があるユーザー（IN）
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount >= 10000);

-- ユーザーごとの注文の合計を表にして、1万円以上を選ぶ（FROM の中）
SELECT user_id, total
FROM (SELECT user_id, SUM(amount) AS total FROM orders GROUP BY user_id) AS totals
WHERE total >= 10000;

-- 1万円以上の注文があるユーザー（相関 EXISTS）
SELECT u.name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id AND o.amount >= 10000);
`}
          />
          <p>
            3つ目の内側の SELECT は外側の列 <code>u.id</code> を参照しています。外側の行を参照するサブクエリを<Term en="correlated subquery">相関サブクエリ</Term>と呼び<Ref n={11} />
            、外側の行ごとに u.id が変わるので内側の結果も行ごとに変わります。1つ目の内側は外側を参照しないので、単独で実行できます。1つ目と3つ目は同じユーザーを返します。
          </p>
          <p>
            3つ目の <code>SELECT 1</code> は、見つかった行ごとに定数の 1 を返す書き方です。EXISTS は内側に行があるかどうかだけを判定し、列の値を使わないので、列の代わりに 1 と書いています。
          </p>

          <h3>実行欄で試す</h3>
          <SqlLab lesson="Subquery" title="SQL を実行する：Subquery" />
          <ol>
            <li>入力済みの「WHERE IN」を実行すると、「Subquery: 内側の結果 → 外側の条件／表」に内側の SELECT とその結果（user_id が 1・3・5）が表示されます。実行結果は Alice・Carol・Eve の3行です。</li>
            <li>
              Example の「FROM内Subquery」を実行すると、記述順の FROM は「(Subquery) AS totals」になり、論理的な処理順の FROM の段階に内側の結果（4人分の合計）が表として表示されます。WHERE の段階で合計 8000 の user_id 2 が消え、3行が残ります。
            </li>
            <li>「相関EXISTS」を実行すると、サブクエリの欄に「相関Subquery: 外側の行を参照するため単独では実行できません」と表示されます。内側は外側の u.id が決まらないと実行できないからです。結果は WHERE IN と同じ3人です。</li>
          </ol>
          <p>
            元の教材の課題も IN の内側の結果を確かめてから FROM 内のサブクエリと相関 EXISTS を試す順番です。FROM の中のサブクエリから <code>AS totals</code> を消しても実行欄の SQLite は同じ結果を返しますが、MySQL 8.4.13 では「ERROR 1248 (42000): Every derived table must have its own alias」で拒否されました。
          </p>

          <h3>なぜそうなるか</h3>
          <p>
            図 12-6 は同じ3人を求める IN（左）と相関 EXISTS（右）を並べたものです。左の内側の結果は1つの集合（1・3・5）で、外側のどの行にも同じ集合を使います。右は外側の行ごとに u.id を当てはめた内側の SELECT を考え、1行以上あれば TRUE、0行なら FALSE です。
          </p>
          <Figure n="12-6" title="IN のサブクエリと相関 EXISTS" caption="実行欄の「WHERE IN」と「相関EXISTS」の結果をもとにした図。右の表は外側の行ごとの判定を説明のために書き出したもの。">
            <SubqueryFigure />
          </Figure>
          <p>
            EXISTS は内側の SELECT が返す行があるかどうかだけを見て、SELECT の後に書いた列や値は結果に影響しません<Ref n={10} />
            <Ref n={3} />。元の教材の確認問題「EXISTS が判定するのは何か」の答えは「内側の結果が1行以上あるか」で、<code>SELECT 1</code> の 1 を比べるわけでも、内側の列の合計や先頭の値を使うわけでもありません。
          </p>
          <p>
            この図も理解のための分解です。SQLite のマニュアルは、相関サブクエリは結果が必要になるたびに評価し直し、相関の無いサブクエリは1回だけ評価して使い回すと説明しています<Ref n={3} />。MySQL のオプティマイザーは、IN や EXISTS のサブクエリを準結合（semijoin）に変換して JOIN に近い方法で処理することがあります<Ref n={13} />。元の教材も、内側を先に実行する図は学習用の分解で、実際には結合への書き換えなどが行われる場合があると書いています。実際の処理は実行計画で確かめます（
            <ChapterLink n={37} />
            ）。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>where のハッシュの値に Relation（まだ実行していない問い合わせ）を渡すと、Rails は IN のサブクエリにします。元の教材の例を実行した結果です。</p>
          <Code
            lang="ruby"
            code={`
User.where(id: Order.where("amount >= ?", 10000).select(:user_id)).pluck(:id, :name)
# SELECT \`users\`.\`id\`, \`users\`.\`name\` FROM \`users\`
#   WHERE \`users\`.\`id\` IN (SELECT \`orders\`.\`user_id\` FROM \`orders\` WHERE (amount >= '10000'))
# => [[1, "Alice"], [3, "Carol"], [5, "Eve"]]

Order.where(user_id: User.where(department_id: 2)).pluck(:id)
# SELECT \`orders\`.\`id\` FROM \`orders\`
#   WHERE \`orders\`.\`user_id\` IN (SELECT \`users\`.\`id\` FROM \`users\` WHERE \`users\`.\`department_id\` = 2)
# => [4, 5, 6]
`}
          />
          <p>
            IN のサブクエリは users の1行ごとに、id が内側の集合に含まれるかを判定するだけです。注文が何件あってもユーザーは1回しか結果に出ないので、<code>joins(:orders)</code> で Alice と Eve が2回ずつ出たような重複は起きません。
          </p>
          <p>内側の Relation に select が無いときは、その表の主キー（2つ目では users.id）が SELECT されます。Rails 8.1.4.1 では次の部分の処理です<Ref n={17} />。</p>
          <Code
            lang="ruby"
            title="activerecord/lib/active_record/relation/predicate_builder/relation_handler.rb（6〜21行目）"
            href={`${GH}/activerecord/lib/active_record/relation/predicate_builder/relation_handler.rb#L6-L21`}
            code={`
      def call(attribute, value)
        if value.eager_loading?
          value = value.send(:apply_join_dependency)
        end

        if value.select_values.empty?
          model = value.model
          if model.composite_primary_key?
            raise ArgumentError, "Cannot map composite primary key #{model.primary_key} to #{attribute.name}"
          else
            value = value.select(value.table[model.primary_key])
          end
        end

        attribute.in(value.arel)
      end
`}
          />
          <p>
            引数の attribute は where のキーに書いた外側の列（2つ目の例では orders.user_id）、value は値に渡した Relation（<code>User.where(department_id: 2)</code>）です。
          </p>
          <ul>
            <li>
              <code>value.eager_loading?</code> の3行は、内側の Relation に eager_load が付いているか、includes が JOIN に切り替わる場合に、JOIN を含む問い合わせへ作り直す処理です。この節の例は該当しません。
            </li>
            <li>
              <code>value.select_values</code> は select に渡した列の配列です。<code>empty?</code> が真なら、内側の Relation で select を呼んでいません。
            </li>
            <li>
              <code>composite_primary_key?</code> は、主キーが複数の列でできているモデルで真になります。1つの列と比べる IN には使えないので、ArgumentError にしています。
            </li>
            <li>
              <code>value.select(value.table[model.primary_key])</code> が、内側の表の主キーの列を select に指定する行です。2つ目の例の内側が <code>SELECT `users`.`id`</code> になったのは、この行の結果です。
            </li>
            <li>
              最後の <code>attribute.in(value.arel)</code> が「外側の列 IN (内側の SELECT)」の条件を作ります。<code>value.arel</code> は、Relation を SQL の文字列にする前の内部の表現です（
              <ChapterLink n={12} section="arel" />
              ）。
            </li>
          </ul>
          <p>
            select を省くと主キーが使われるので、外側の列と比べたい列が内側の主キーでないとき（1つ目の例の orders.user_id）は select が必要です。付け忘れた場合の結果は注意点に載せます。
          </p>
          <p>次の図は、call の判定を上から順に並べ、この節の2つの例と注意点の例がどちらの経路を通るかを書き込んだものです。経路は value.select_values.empty? の判定で左右に分かれます。</p>
          <Figure title="where に Relation を渡したときの call の判定" caption="relation_handler.rb の call の判定を上から順に並べた模式図。例ごとに、1行目が where に渡した Relation、2行目が内側の SELECT の列。eager_loading? はこの節の例では偽。">
            <RelationHandlerFigure />
          </Figure>
          <p>どちらの例も SQL は1回で、内側の Relation は SQL の文字列に組み込まれるだけです。pluck で id の配列を先に取り出すと、SQL が2回になり、id の数だけ IN のリストが長くなります。</p>
          <Code
            lang="ruby"
            code={`
ids = Order.where(amount: 10000..).pluck(:user_id)
# SELECT \`orders\`.\`user_id\` FROM \`orders\` WHERE \`orders\`.\`amount\` >= 10000
User.where(id: ids).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\` WHERE \`users\`.\`id\` IN (1, 3, 5)
`}
          />
          <p>
            FROM の中のサブクエリは from で書き、第2引数が別名です。下の <code>Order.from(totals, :totals)</code> は、Order の問い合わせの FROM を orders テーブルから、totals という別名を付けたサブクエリに置き換えます。where の total と pluck の totals.user_id は、どちらもサブクエリの結果の列です。SELECT は既定の <code>`orders`.*</code> のままなので、外側で読む列は select や pluck で指定します<Ref n={15} />。
          </p>
          <Code
            lang="ruby"
            code={`
totals = Order.select(:user_id, "SUM(amount) AS total").group(:user_id)
Order.from(totals, :totals).where("total >= ?", 10000).pluck("totals.user_id", "totals.total")
# SELECT \`totals\`.\`user_id\`, \`totals\`.\`total\`
#   FROM (SELECT \`orders\`.\`user_id\`, SUM(amount) AS total FROM \`orders\` GROUP BY \`orders\`.\`user_id\`) totals
#   WHERE (total >= '10000')
# => [[1, 18000], [3, 20000], [5, 16000]]

Order.group(:user_id).having("SUM(amount) >= ?", 10000).sum(:amount)
# SELECT SUM(\`orders\`.\`amount\`) AS \`sum_amount\`, \`orders\`.\`user_id\` AS \`orders_user_id\`
#   FROM \`orders\` GROUP BY \`orders\`.\`user_id\` HAVING (SUM(amount) >= '10000')
# => {1 => 18000, 3 => 20000, 5 => 16000}
`}
          />
          <p>この例は2つ目のように HAVING でも同じ結果になります。FROM の中のサブクエリは集計した結果をさらに JOIN したり、もう一度集計したりするときに使います。</p>
          <p>
            Rails 8.1 には EXISTS 用のメソッドがありません（引数なしの where に続けて呼べるのは not・associated・missing の3つです）<Ref n={15} />。EXISTS は条件の文字列の <code>?</code> に Relation を渡して書けます。Rails 8.1.4.1 の sanitization.rb は、<code>?</code> に Relation が渡されるとその SQL（to_sql の結果）を埋め込みます<Ref n={18} />。
          </p>
          <Code
            lang="ruby"
            code={`
User.where("EXISTS (?)", Order.select(1).where("orders.user_id = users.id").where(amount: 10000..)).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\` WHERE (EXISTS (SELECT 1 FROM \`orders\`
#   WHERE (orders.user_id = users.id) AND \`orders\`.\`amount\` >= 10000))
# => ["Alice", "Carol", "Eve"]
`}
          />
          <p>
            内側の <code>&quot;orders.user_id = users.id&quot;</code> が外側の users を参照する相関の条件です。<code>Order.where(...).arel.exists</code> を where に渡してもほぼ同じ SQL（SELECT 1 の代わりに <code>`orders`.*</code>）になりましたが、Arel（Active Record が SQL を組み立てるために内部で使うライブラリ）の SelectManager は Rails の公開 API の文書に含まれない（:nodoc:）クラスです<Ref n={19} />。この章では、文字列の <code>?</code> に Relation を渡す上の書き方を使います。
          </p>
          <p>名前の似た <code>exists?</code> は、条件に合う行があるかを true・false で返し、呼ぶたびに SQL を1回実行する別のメソッドです（find の SELECT は省略）。</p>
          <Code
            lang="ruby"
            code={`
User.find(4).orders.exists?
# SELECT 1 AS one FROM \`orders\` WHERE \`orders\`.\`user_id\` = 4 LIMIT 1
# => false
`}
          />
          <p>一覧のループの中で exists? を呼ぶとユーザーごとに SQL が実行されるので、注文のあるユーザーを SQL 1回で選ぶなら、EXISTS のサブクエリや where(id: ...) を使います。</p>

          <h3>注意点</h3>
          <ul>
            <li>
              内側の select を付け忘れると主キーどうしを比べる SQL になります。<code>User.where(id: Order.where(amount: 10000..))</code> は <code>`users`.`id` IN (SELECT `orders`.`id` ...)</code> になり、注文の id（1・4・5）と同じ id のユーザー（Alice・Dave・Eve）を返しました。エラーにならないので、生成された SQL を確かめます。
            </li>
            <li>NOT IN は、内側の結果に NULL があると1行も返らないことがあります（次の節）。</li>
          </ul>
        </>
      ),
    },
    {
      id: 'not-and-null',
      title: '否定の条件と NULL：where.not・NOT IN・NOT EXISTS',
      body: (
        <>
          <h3>SQL の構文と考え方</h3>
          <p>
            NULL は値が無いことを表すので、<code>department_id &lt;&gt; 1</code> のような比較は NULL の行で UNKNOWN になります（図 12-3 の WHERE の判定と同じ）。WHERE は真の行だけを残すので、否定の条件を書くと NULL の行は条件に合う側にも合わない側にも入りません。NULL かどうかは IS NULL・IS NOT NULL で調べます（
            <ChapterLink n={35} section="where" />
            ）。
          </p>
          <Code
            lang="sql"
            code={`
SELECT name FROM users WHERE department_id <> 1;
-- Carol・Dave・Eve・Grace（Hana は出ない）

SELECT name FROM users WHERE department_id <> 1 OR department_id IS NULL;
-- Carol・Dave・Eve・Grace・Hana
`}
          />
          <p>NOT IN のサブクエリでも同じことが起きます。「20歳未満のユーザーがいない部署」を NOT IN と NOT EXISTS で書きます。</p>
          <Code
            lang="sql"
            code={`
-- NOT IN：0行
SELECT name FROM departments
WHERE id NOT IN (SELECT department_id FROM users WHERE age < 20);

-- NOT EXISTS：Engineering と Design
SELECT d.name FROM departments d
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.department_id = d.id AND u.age < 20);
`}
          />

          <h3>実行欄で試す</h3>
          <p>この節には実行欄を置きません。サンプル DB はページの中で共有しているので、1つ前の「SQL を実行する：Subquery」の実行欄に上の2つの SQL を入力して実行します。</p>
          <ol>
            <li>NOT IN の結果は0行です。サブクエリの欄を見ると、内側の結果は department_id が 2（19歳の Carol）と NULL（17歳の Hana）の2行です。</li>
            <li>論理的な処理順の WHERE を押すと、FROM の段階の3行がすべて消えています。</li>
            <li>NOT EXISTS の結果は Engineering と Design の2行です。相関サブクエリなので、サブクエリの欄には単独では実行できないと表示されます。</li>
          </ol>

          <h3>なぜそうなるか</h3>
          <p>
            <code>id NOT IN (2, NULL)</code> は <code>id &lt;&gt; 2 AND id &lt;&gt; NULL</code> と同じ意味です（MySQL のマニュアルは NOT IN を <code>&lt;&gt; ALL</code> の別名と説明しています<Ref n={9} />
            ）。AND は両方が TRUE のときだけ TRUE になり、どちらかが FALSE なら FALSE、残りの組み合わせでは UNKNOWN です。<code>id &lt;&gt; NULL</code> は常に UNKNOWN なので、AND の結果は FALSE か UNKNOWN で、TRUE にはなりません。SQLite のマニュアルの表でも、右側に NULL を含み左側の値が見つからないとき、NOT IN の結果は NULL です<Ref n={3} />。
          </p>
          <Figure n="12-7" title="NOT IN と NOT EXISTS の判定" caption="実行欄で NOT IN と NOT EXISTS の SQL を実行した結果をもとに、部署ごとの判定を書き出した図。">
            <NotInFigure />
          </Figure>
          <p>
            図 12-7 は部署ごとの判定で、内側に NULL が1つ入るだけで NOT IN と NOT EXISTS の結果が分かれることを示しています。NOT EXISTS はその部署に該当するユーザーが1人もいないかを見るので、Hana の NULL はどの部署とも一致しない行として扱われるだけです。元の教材も、NOT IN は内側に NULL がある場合の UNKNOWN に注意するよう書いています。
          </p>

          <h3>Active Record ではこう書く</h3>
          <p>
            where.not はハッシュの条件を否定した SQL を作り、値が1つなら <code>!=</code>、配列やサブクエリなら NOT IN になります。Rails ガイドと API ドキュメントは、NULL を許す列に NULL 以外の値で where.not を書くと、その列が NULL のレコードは返らないと注意しています<Ref n={14} />
            <Ref n={15} />。
          </p>
          <Code
            lang="ruby"
            code={`
User.where.not(department_id: 1).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\` WHERE \`users\`.\`department_id\` != 1
# => ["Carol", "Dave", "Eve", "Grace"]

User.where.not(department_id: 1).or(User.where(department_id: nil)).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\`
#   WHERE (\`users\`.\`department_id\` != 1 OR \`users\`.\`department_id\` IS NULL)
# => ["Hana", "Carol", "Dave", "Eve", "Grace"]

User.where.not(department_id: 1, age: 20).pluck(:name)
# SELECT \`users\`.\`name\` FROM \`users\` WHERE NOT (\`users\`.\`department_id\` = 1 AND \`users\`.\`age\` = 20)
# => ["Bob", "Carol", "Dave", "Eve", "Grace", "Hana"]
`}
          />
          <p>
            3つ目のように複数の条件を渡すと全体を NOT で包むので、両方に当てはまる Alice と Frank だけが除かれます。Hana が残るのは、<code>department_id = 1</code> が UNKNOWN でも <code>age = 20</code> が FALSE なので AND が FALSE になり、NOT で TRUE になるからです。
          </p>
          <Code
            lang="ruby"
            code={`
Department.where.not(id: User.where("age < ?", 20).select(:department_id)).pluck(:name)
# SELECT \`departments\`.\`name\` FROM \`departments\`
#   WHERE \`departments\`.\`id\` NOT IN (SELECT \`users\`.\`department_id\` FROM \`users\` WHERE (age < '20'))
# => []

Department.where.not(id: User.where("age < ?", 20).where.not(department_id: nil).select(:department_id)).pluck(:name)
# ... NOT IN (SELECT \`users\`.\`department_id\` FROM \`users\`
#             WHERE (age < '20') AND \`users\`.\`department_id\` IS NOT NULL)
# => ["Engineering", "Design"]

Department.where("NOT EXISTS (?)",
                 User.select(1).where("users.department_id = departments.id").where("age < ?", 20)).pluck(:name)
# SELECT \`departments\`.\`name\` FROM \`departments\` WHERE (NOT EXISTS (SELECT 1 FROM \`users\`
#   WHERE (users.department_id = departments.id) AND (age < '20')))
# => ["Engineering", "Design"]
`}
          />
          <p>
            where.not にサブクエリを渡すと NOT IN になり、内側に NULL があると空の結果になりました。内側で <code>where.not(department_id: nil)</code> によって NULL を除くか、NOT EXISTS で書けば、Engineering と Design が返ります。内側の列が NOT NULL なら、この問題は起きません。たとえば orders.user_id は NOT NULL なので、<code>User.where.not(id: Order.select(:user_id))</code> は Dave・Frank・Grace・Hana を返し、<code>where.missing(:orders)</code> と同じ結果でした。
          </p>

          <h3>注意点</h3>
          <p>否定の条件を書くときは、対象の列が NULL を許すかをスキーマで確かめます。NULL の行も含めるなら <code>.or(User.where(department_id: nil))</code> のように明示し、NOT IN の内側の列が NULL を許すなら、NULL を除くか NOT EXISTS や where.missing で書きます。</p>
          <p>
            NOT IN の結果が0件になる動作は、内側の SELECT が NULL を1つでも返すようになった時点から始まり、エラーは出ません。上の例では、部署の無い20歳未満のユーザーが Hana 1人いるだけで、どの部署も返りませんでした。NULL の行が無いテストデータでは再現しないので、内側の列が NULL を許すかどうかを列の定義で確かめます。
          </p>
        </>
      ),
    },
    {
      id: 'mysql-sqlite',
      title: 'MySQL 8.4 と実行欄の SQLite の違い',
      body: (
        <>
          <p>この章の SQL を実行欄の SQLite 3.49.1 と MySQL 8.4.13 で実行し、結果が異なったものをまとめます。MySQL のエラーは MySQL 8.4.13 で実際に表示されたものです。</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>確かめた SQL</th>
                  <th>実行欄（SQLite 3.49.1）</th>
                  <th>MySQL 8.4.13</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>GROUP BY に無い列を SELECT（<code>SELECT department_id, name, COUNT(*) … GROUP BY department_id</code>）</td>
                  <td>グループ内のどれか1行の値を返す<Ref n={1} /></td>
                  <td>ONLY_FULL_GROUP_BY により ERROR 1055<Ref n={5} /></td>
                </tr>
                <tr>
                  <td>整数の列の AVG（<code>AVG(age)</code>）</td>
                  <td>浮動小数点数（21.333333333333332）<Ref n={2} /></td>
                  <td>DECIMAL（21.3333）。Rails の average は BigDecimal<Ref n={6} /></td>
                </tr>
                <tr>
                  <td>WHERE に集約関数（<code>WHERE COUNT(*) &gt;= 2</code>）</td>
                  <td>misuse of aggregate: COUNT()</td>
                  <td>ERROR 1111 Invalid use of group function</td>
                </tr>
                <tr>
                  <td>FROM の中のサブクエリに別名を付けない</td>
                  <td>実行できる</td>
                  <td>ERROR 1248 Every derived table must have its own alias<Ref n={12} /></td>
                </tr>
                <tr>
                  <td>HAVING で SELECT の別名を使う（<code>HAVING user_count &gt;= 2</code>）</td>
                  <td>実行できる</td>
                  <td>実行できる（MySQL の拡張）<Ref n={8} /></td>
                </tr>
                <tr>
                  <td>FULL OUTER JOIN</td>
                  <td>実行できる<Ref n={1} /></td>
                  <td>構文エラー（ERROR 1064）</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            表の最後の FULL OUTER JOIN は、左右どちらの表についても、相手の無い行を NULL で補って残す JOIN です<Ref n={1} />。LEFT JOIN が残すのは左側の表の相手の無い行だけでした。MySQL 8.4.13 では構文エラーになるので、この章の本文では使っていません。
          </p>
          <p>
            GROUP BY を使う SQL は、実行欄でエラーにならなくても、MySQL 8.4 の既定の設定（ONLY_FULL_GROUP_BY が有効）では拒否されることがあります。Rails のアプリケーションでは、開発環境の MySQL で実行するか、<code>to_sql</code> で生成された SQL を確かめてから使います。
          </p>
        </>
      ),
    },
    {
      id: 'summary',
      title: 'まとめ',
      body: (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SQL</th>
                  <th>Active Record（Rails 8.1）</th>
                  <th>戻り値と注意点</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>INNER JOIN</code>
                  </td>
                  <td>
                    <code>joins(:orders)</code>
                  </td>
                  <td>Relation。相手の数だけレコードが重複する</td>
                </tr>
                <tr>
                  <td>
                    <code>LEFT OUTER JOIN</code>
                  </td>
                  <td>
                    <code>left_joins(:orders)</code>
                  </td>
                  <td>右側の表の条件を where に書くと NULL の行が消える</td>
                </tr>
                <tr>
                  <td>
                    <code>LEFT JOIN … WHERE orders.id IS NULL</code>
                  </td>
                  <td>
                    <code>where.missing(:orders)</code>
                  </td>
                  <td>相手の無いレコード</td>
                </tr>
                <tr>
                  <td>
                    <code>GROUP BY</code> と集約関数
                  </td>
                  <td>
                    <code>group(:department_id).count</code>・<code>sum</code>・<code>average</code>
                  </td>
                  <td>キーと集計値のハッシュ。NULL のキーは nil、average は BigDecimal</td>
                </tr>
                <tr>
                  <td>
                    <code>HAVING</code>
                  </td>
                  <td>
                    <code>having(&quot;COUNT(*) &gt;= ?&quot;, 2)</code>
                  </td>
                  <td>集約した後のグループを絞る。行の条件は where に書く</td>
                </tr>
                <tr>
                  <td>
                    <code>IN (SELECT …)</code>
                  </td>
                  <td>
                    <code>where(id: Order.where(…).select(:user_id))</code>
                  </td>
                  <td>SQL は1回。select が無いと主キーが使われる</td>
                </tr>
                <tr>
                  <td>
                    <code>FROM (SELECT …) AS t</code>
                  </td>
                  <td>
                    <code>from(relation, :t)</code>
                  </td>
                  <td>外側で読む列を select や pluck で指定する</td>
                </tr>
                <tr>
                  <td>
                    <code>EXISTS (SELECT …)</code>
                  </td>
                  <td>
                    <code>where(&quot;EXISTS (?)&quot;, relation)</code>
                  </td>
                  <td>専用のメソッドは無い。exists? は true・false を返す別のメソッド</td>
                </tr>
                <tr>
                  <td>
                    <code>NOT IN (SELECT …)</code>
                  </td>
                  <td>
                    <code>where.not(id: relation)</code>
                  </td>
                  <td>内側に NULL があると空になる</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>joins は行を絞るだけで、関連を読み込むのは includes・preload・eager_load です。行の条件は WHERE、集約値の条件は HAVING に書きます。</p>
        </>
      ),
    },
  ],
  sources: [
    { title: 'The SELECT statement', publisher: 'SQLite', url: 'https://www.sqlite.org/lang_select.html', accessed: '2026-11-20', version: 'SQLite 3.49.1（実行欄の sql.js 1.13.0）', note: 'LEFT・RIGHT・FULL JOIN で追加される NULL の行、グループ分けで NULL どうしを等しいとみなすこと、bare column の値がグループ内の任意の行から取られること（SQLite 独自の拡張）、段階に分けた説明は説明のためで処理の手順ではないこと。' },
    { title: 'Built-in Aggregate Functions', publisher: 'SQLite', url: 'https://www.sqlite.org/lang_aggfunc.html', accessed: '2026-11-20', version: 'SQLite 3.49.1', note: 'count(X) が NULL でない値の数、count(*) が行の数を返すこと。avg が NULL を除き、整数でも浮動小数点数を返すこと。count(DISTINCT X)。' },
    { title: 'SQL Language Expressions（IN・EXISTS・Correlated Subqueries）', publisher: 'SQLite', url: 'https://www.sqlite.org/lang_expr.html', accessed: '2026-11-20', version: 'SQLite 3.49.1', note: 'IN・NOT IN の結果の表（右側に NULL を含む場合）、EXISTS が行の有無だけを見ること、相関サブクエリの再評価。' },
    { title: 'JOIN Clause', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/join.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'LEFT JOIN で一致しない右側の列が NULL になること、相手の無い行を IS NULL で探す例、ON と WHERE の使い分け、JOIN・CROSS JOIN・INNER JOIN が MySQL では構文上同じこと。実行例は MySQL 8.4.13 で実測。' },
    { title: 'MySQL Handling of GROUP BY', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/group-by-handling.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'ONLY_FULL_GROUP_BY が既定で有効で、GROUP BY に無く関数従属もしない列を拒否すること。主キーで GROUP BY した場合の関数従属、ANY_VALUE()。' },
    { title: 'Aggregate Function Descriptions', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/aggregate-functions.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'COUNT(expr) が NULL でない値の数を返すこと、AVG・SUM が整数などの正確な数値の引数に DECIMAL を返すこと。' },
    { title: 'Working with NULL Values', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/working-with-null.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'GROUP BY では2つの NULL を等しいとみなすこと。' },
    { title: 'SELECT Statement', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/select.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'HAVING は結果を送る直前に最適化なしで適用されること、WHERE に書くべき条件を HAVING に書かないこと、HAVING で SELECT の列を参照できるのは MySQL の拡張であること。' },
    { title: 'Subqueries with ANY, IN, or SOME', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/any-in-some-subqueries.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'IN が = ANY の別名で、NOT IN が <> ALL の別名であること。' },
    { title: 'Subqueries with EXISTS or NOT EXISTS', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/exists-and-not-exists-subqueries.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'サブクエリが1行でも返せば EXISTS が TRUE になること、EXISTS のサブクエリの SELECT の列は無視されること。' },
    { title: 'Correlated Subqueries', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/correlated-subqueries.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: '外側の表を参照するサブクエリを相関サブクエリと呼ぶこと。' },
    { title: 'Derived Tables', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/derived-tables.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'FROM の中のサブクエリ（導出表）に名前が必要なこと。別名の無い SQL の ERROR 1248 は MySQL 8.4.13 で実測。' },
    { title: 'Optimizing IN and EXISTS Subquery Predicates with Semijoin Transformations', publisher: 'MySQL 8.4 Reference Manual', url: `${MYSQL}/semijoins.html`, accessed: '2026-11-20', version: 'MySQL 8.4', note: 'オプティマイザーが IN・EXISTS のサブクエリを準結合に変換し、複数の実行方法から選ぶこと。' },
    { title: 'Active Record Query Interface', publisher: 'Ruby on Rails Guides', url: 'https://guides.rubyonrails.org/v8.1/active_record_querying.html', accessed: '2026-11-20', version: 'Rails 8.1', note: 'joins（INNER JOIN、重複と distinct）、left_outer_joins、where.associated・where.missing、group と count、having（where はグループ化の前、having は後）、where.not と NULL、読み込む関連に条件を付ける場合の LEFT OUTER JOIN、計算メソッド。実行例は Rails 8.1.4.1 で実測。' },
    { title: 'activerecord/lib/active_record/relation/query_methods.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/query_methods.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'WhereChain の not（NULL を許す列の注意）・associated・missing、where で JOIN した表の条件を書く方法、from の第2引数（別名）、group、having。' },
    { title: 'activerecord/lib/active_record/relation/calculations.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/calculations.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'group と count を組み合わせるとキーと件数のハッシュを返し、複数の列ではキーが配列になること。execute_grouped_calculation が列の別名（count_all など）を付けること。' },
    { title: 'activerecord/lib/active_record/relation/predicate_builder/relation_handler.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/relation/predicate_builder/relation_handler.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'where の値の Relation を IN のサブクエリにし、select が無ければ主キーを SELECT すること。' },
    { title: 'activerecord/lib/active_record/sanitization.rb・connection_adapters/mysql/quoting.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/active_record/sanitization.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: '? に渡した Relation を to_sql で埋め込むこと（replace_bind_variable）。MySQL では数値のパラメーターを文字列として引用すること（sanitize_sql_array の説明と mysql/quoting.rb の cast_bound_value）。' },
    { title: 'activerecord/lib/arel/select_manager.rb', publisher: 'rails/rails（GitHub）', url: `${GH}/activerecord/lib/arel/select_manager.rb`, accessed: '2026-11-20', version: 'Rails 8.1.4.1', note: 'SelectManager#exists が EXISTS の節点を作ること。Arel の SelectManager が :nodoc: であること。' },
    { title: 'sql.js documentation', publisher: 'sql.js', url: 'https://sql.js.org/documentation/', accessed: '2026-11-20', version: 'sql.js 1.13.0', note: '実行欄の SQL を実行する SQLite のライブラリ。同梱の SQLite のバージョン（3.49.1）は実行欄で sqlite_version() を実行して確認。' },
    { title: 'node-sql-parser', publisher: 'GitHub', url: 'https://github.com/taozhi8833998/node-sql-parser', accessed: '2026-11-20', version: 'node-sql-parser 5.3.8', note: '実行欄で SQL を MySQL の文法で解析し、記述順と段階表示を作るライブラリ。' },
  ],
}

export default chapter
