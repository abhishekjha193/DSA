import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../common/Card'
import { DIFFICULTY_COLOR } from '../../constants'

export default function DifficultyChart({ data }) {
  const hasData = data && data.length > 0

  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-semibold text-text-primary">Questions by Difficulty</h3>
      {!hasData ? (
        <div className="mt-8 flex h-40 items-center justify-center text-sm text-text-muted">No data yet</div>
      ) : (
        <div className="mt-2 flex items-center gap-4">
          <div className="h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="count" nameKey="difficulty" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.difficulty} fill={DIFFICULTY_COLOR[entry.difficulty] ?? '#565f74'} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#191f2b', border: '1px solid #232a3a', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((entry) => (
              <div key={entry.difficulty} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DIFFICULTY_COLOR[entry.difficulty] }} />
                <span className="text-text-secondary">{entry.difficulty}</span>
                <span className="ml-auto font-medium text-text-primary">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
