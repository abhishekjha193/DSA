import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../common/Card'

export default function BarChartCard({ title, data, dataKey, labelKey, color = 'var(--color-accent)', empty }) {
  return (
    <Card className="p-5">
      <h3 className="font-display text-sm font-semibold text-text-primary">{title}</h3>
      {!data || data.length === 0 ? (
        <div className="mt-8 flex h-40 items-center justify-center text-sm text-text-muted">
          {empty ?? 'No data yet'}
        </div>
      ) : (
        <div className="mt-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a3a" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#8b93a7', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey={labelKey}
                width={110}
                tick={{ fill: '#8b93a7', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#191f2b', border: '1px solid #232a3a', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#e8eaf1' }}
                cursor={{ fill: 'rgba(240,180,41,0.06)' }}
              />
              <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
