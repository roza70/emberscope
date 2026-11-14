
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

type Investigation = {
  psi_id: string
  short_name: string
  name: string
  project_type?: string
  category: string[]
}

type Evidence = {
  evidence_id: string
  psi_id: string
  data_status: string
  quantitative_result: number | null
}

type Props = {
  investigations: Investigation[]
  evidence: Evidence[]
}

const COLORS = {
  ground: '#a78bfa',
  microgravity: '#22d3ee',
  prevention: '#a78bfa',
  detection: '#22d3ee',
  suppression: '#fb923c',
  pending: '#fb923c',
  ingested: '#34d399',
}

const categories = ['Prevention', 'Detection', 'Suppression']

function AnalyticsDashboard({ investigations, evidence }: Props) {

  // 1. Ground vs Microgravity distribution
  const groundCount = investigations.filter(
    (item) => item.project_type === 'Ground Investigation'
  ).length

  const microgravityCount = investigations.filter(
    (item) => item.project_type === 'Microgravity Investigation'
  ).length

  const investigationData = [
    { name: 'Ground', value: groundCount, fill: COLORS.ground },
    {
      name: 'Microgravity',
      value: microgravityCount,
      fill: COLORS.microgravity,
    },
  ]

  // 2. Research category distribution
  const categoryData = categories.map((category) => ({
    category,
    count: investigations.filter((item) =>
      item.category.includes(category)
    ).length,
  }))

  // 3. Ground vs Microgravity category comparison
  const comparisonData = categories.map((category) => ({
    category,
    Ground: investigations.filter(
      (item) =>
        item.project_type === 'Ground Investigation' &&
        item.category.includes(category)
    ).length,
    Microgravity: investigations.filter(
      (item) =>
        item.project_type === 'Microgravity Investigation' &&
        item.category.includes(category)
    ).length,
  }))

  // 4. Evidence ingestion status
  const ingestedCount = evidence.filter(
    (item) =>
      item.data_status !== 'NASA_data_not_yet_ingested_locally'
  ).length

  const pendingCount = evidence.length - ingestedCount

  const evidenceData = [
    {
      name: 'Awaiting local ingestion',
      value: pendingCount,
      fill: COLORS.pending,
    },
    {
      name: 'Ingested locally',
      value: ingestedCount,
      fill: COLORS.ingested,
    },
  ]

  const quantitativeCount = evidence.filter(
    (item) => item.quantitative_result !== null
  ).length

  // 5. Fire Safety Evidence Heatmap
  const normalizedEvidence = evidence.map((item) => ({
    ...item,
    normalizedPsiId: item.psi_id?.trim().toUpperCase(),
  }))

  const heatmapData = categories.map((category) => {
    const categoryInvestigations = investigations.filter((item) =>
      item.category.includes(category)
    )

    const categoryPsiIds = new Set(
      categoryInvestigations.map((item) =>
        item.psi_id.trim().toUpperCase()
      )
    )

    const linkedEvidence = normalizedEvidence.filter((item) =>
      categoryPsiIds.has(item.normalizedPsiId)
    )

    return {
      category,
      investigationCount: categoryInvestigations.length,
      evidenceCount: linkedEvidence.length,
    }
  })

  const maxHeatmapValue = Math.max(
    1,
    ...heatmapData.flatMap((item) => [
      item.investigationCount,
      item.evidenceCount,
    ])
  )

  function getHeatmapStyle(value: number) {
    const intensity =
      value === 0 ? 0.06 : 0.15 + (value / maxHeatmapValue) * 0.55

    return {
      background: `rgba(34, 211, 238, ${intensity})`,
      border: '1px solid rgba(34, 211, 238, 0.18)',
      borderRadius: '10px',
      padding: '16px',
      textAlign: 'center' as const,
      minWidth: '100px',
    }
  }

  // 6. Moon vs Mars conceptual comparison
  const planetaryComparison = [
    {
      topic: 'External environment',
      moon: 'Near-vacuum environment with virtually no atmosphere.',
      mars: 'Very thin, carbon-dioxide-dominated atmosphere.',
    },
    {
      topic: 'Gravity',
      moon: 'Approximately 1/6 of Earth gravity.',
      mars: 'Approximately 0.38 of Earth gravity.',
    },
    {
      topic: 'Outside habitat',
      moon: 'The external environment cannot support ordinary open combustion without an oxidizer supply.',
      mars: 'The thin, CO2-rich external atmosphere is very different from Earth’s atmosphere.',
    },
    {
      topic: 'Habitat fire safety',
      moon: 'Pressurized habitat atmosphere, oxygen supply, airflow and combustible materials are important design considerations.',
      mars: 'Pressurized habitat atmosphere, oxygen supply, airflow and combustible materials are important design considerations.',
    },
    {
      topic: 'Research challenge',
      moon: 'ISS microgravity experiments do not reproduce lunar gravity or the lunar surface environment.',
      mars: 'ISS microgravity experiments do not reproduce Martian gravity or its external atmospheric conditions.',
    },
  ]

  // 7. Evidence Ranking & Comparison
  const evidenceRankingData = investigations
    .map((investigation) => {
      const linkedEvidence = evidence.filter(
        (item) =>
          item.psi_id?.trim().toUpperCase() ===
          investigation.psi_id.trim().toUpperCase()
      )

      return {
        psi_id: investigation.psi_id,
        short_name: investigation.short_name,
        evidenceCount: linkedEvidence.length,
        quantitativeCount: linkedEvidence.filter(
          (item) => item.quantitative_result !== null
        ).length,
      }
    })
    .sort((a, b) => {
      if (b.evidenceCount !== a.evidenceCount) {
        return b.evidenceCount - a.evidenceCount
      }

      return b.quantitativeCount - a.quantitativeCount
    })

  const topEvidenceInvestigations = evidenceRankingData
    .filter((item) => item.evidenceCount > 0)
    .slice(0, 10)

  return (
    <section className="dashboard-section analytics-section">

      <div className="section-heading">
        <div>
          <p className="eyebrow">RESEARCH INTELLIGENCE</p>
          <h2>Analytics Dashboard</h2>
          <p className="section-description">
            Explore the distribution of NASA combustion investigations
            and the current state of EmberScope's evidence database.
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="analytics-summary">

        <article className="analytics-stat">
          <span>Total investigations</span>
          <strong>{investigations.length}</strong>
        </article>

        <article className="analytics-stat">
          <span>Evidence records</span>
          <strong>{evidence.length}</strong>
        </article>

        <article className="analytics-stat">
          <span>Quantitative results available locally</span>
          <strong>{quantitativeCount}</strong>
        </article>

      </div>

      <div className="analytics-grid">

        {/* Chart 1 */}
        <article className="analytics-card">

          <div className="analytics-card-heading">
            <h3>Investigation Distribution</h3>
            <p>Ground vs Microgravity investigations</p>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investigationData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  label
                >
                  {investigationData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </article>

        {/* Chart 2 */}
        <article className="analytics-card">

          <div className="analytics-card-heading">
            <h3>Research Categories</h3>
            <p>Investigation coverage by safety theme</p>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff15"
                />

                <XAxis dataKey="category" stroke="#aaa" />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Investigations"
                  radius={[6, 6, 0, 0]}
                >
                  {categoryData.map((entry) => (
                    <Cell
                      key={entry.category}
                      fill={
                        COLORS[
                        entry.category.toLowerCase() as keyof typeof COLORS
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        </article>

        {/* Chart 3 */}
        <article className="analytics-card">

          <div className="analytics-card-heading">
            <h3>Safety Research Comparison</h3>
            <p>Category coverage across investigation types</p>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff15"
                />

                <XAxis dataKey="category" stroke="#aaa" />
                <YAxis allowDecimals={false} stroke="#aaa" />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="Ground"
                  stackId="a"
                  fill={COLORS.ground}
                />

                <Bar
                  dataKey="Microgravity"
                  stackId="a"
                  fill={COLORS.microgravity}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </article>

        {/* Chart 4 */}
        <article className="analytics-card">

          <div className="analytics-card-heading">
            <h3>Evidence Availability</h3>
            <p>Local evidence ingestion status</p>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={evidenceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={5}
                  label
                >
                  {evidenceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="chart-note">
            Quantitative results available locally: {quantitativeCount} of{' '}
            {evidence.length} evidence records.
          </p>

        </article>

      </div>

      {/* Feature 5: Evidence Heatmap */}
      <section
        className="analytics-card analytics-heatmap-card"
        style={{ marginTop: '28px' }}
      >

        <div className="analytics-card-heading">
          <p className="eyebrow">EVIDENCE INTELLIGENCE</p>
          <h3>Fire Safety Evidence Heatmap</h3>
          <p>
            Explore how the local research database covers three
            major fire-safety research areas.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(110px, 1fr) repeat(2, minmax(100px, 1fr))',
            gap: '12px',
            marginTop: '24px',
            alignItems: 'stretch',
          }}
        >

          <div />

          <strong style={{ textAlign: 'center', fontSize: '0.85rem' }}>
            Investigations
          </strong>

          <strong style={{ textAlign: 'center', fontSize: '0.85rem' }}>
            Local Evidence
          </strong>

          {heatmapData.map((item) => (
            <div
              key={item.category}
              style={{ display: 'contents' }}
            >

              <strong
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.9rem',
                }}
              >
                {item.category}
              </strong>

              <div style={getHeatmapStyle(item.investigationCount)}>
                <strong style={{ fontSize: '1.5rem' }}>
                  {item.investigationCount}
                </strong>

                <p style={{ margin: '5px 0 0', fontSize: '0.75rem' }}>
                  Investigations
                </p>
              </div>

              <div
                style={{
                  ...getHeatmapStyle(item.evidenceCount),
                  background:
                    item.evidenceCount === 0
                      ? 'rgba(251, 146, 60, 0.07)'
                      : `rgba(52, 211, 153, ${0.15 +
                      (item.evidenceCount / maxHeatmapValue) * 0.55
                      })`,
                  borderColor: 'rgba(52, 211, 153, 0.2)',
                }}
              >
                <strong style={{ fontSize: '1.5rem' }}>
                  {item.evidenceCount}
                </strong>

                <p style={{ margin: '5px 0 0', fontSize: '0.75rem' }}>
                  Evidence records
                </p>
              </div>

            </div>
          ))}

        </div>

        <p className="chart-note" style={{ marginTop: '20px' }}>
          These values count local investigation records and evidence
          linked through PSI IDs. They do not measure fire risk,
          experiment effectiveness, or NASA-wide research coverage.
        </p>

      </section>

      {/* Feature 6: Moon vs Mars */}
      <section
        className="analytics-card planetary-card"
        style={{ marginTop: '28px' }}
      >

        <div className="analytics-card-heading">
          <p className="eyebrow">FUTURE HUMAN SPACE EXPLORATION</p>
          <h3>Moon vs Mars: Fire Safety Challenges</h3>
          <p>
            Compare environmental conditions and the challenges
            they create for future habitat fire-safety systems.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginTop: '24px',
          }}
        >

          <article
            style={{
              padding: '22px',
              borderRadius: '14px',
              background: 'rgba(167, 139, 250, 0.09)',
              border: '1px solid rgba(167, 139, 250, 0.22)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🌕</span>

            <h3 style={{ margin: '12px 0 5px' }}>
              Lunar Environment
            </h3>

            <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
              Moon
            </p>

            <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
              <li>Near-vacuum external environment</li>
              <li>Approximately 1/6 Earth gravity</li>
              <li>No substantial breathable atmosphere</li>
              <li>Habitat fire safety depends on controlled cabin conditions</li>
              <li>External lunar conditions differ significantly from ISS conditions</li>
            </ul>
          </article>

          <article
            style={{
              padding: '22px',
              borderRadius: '14px',
              background: 'rgba(34, 211, 238, 0.08)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
            }}
          >
            <span style={{ fontSize: '2rem' }}>🔴</span>

            <h3 style={{ margin: '12px 0 5px' }}>
              Martian Environment
            </h3>

            <p style={{ opacity: 0.7, fontSize: '0.85rem' }}>
              Mars
            </p>

            <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
              <li>Very thin, CO₂-dominated external atmosphere</li>
              <li>Approximately 0.38 Earth gravity</li>
              <li>External atmosphere is not breathable</li>
              <li>Habitat fire safety depends on controlled cabin conditions</li>
              <li>Martian gravity and atmospheric conditions differ from ISS conditions</li>
            </ul>
          </article>

        </div>

        <div
          style={{
            marginTop: '22px',
            padding: '18px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
          }}
        >

          <h4 style={{ marginTop: 0 }}>
            Shared Fire Safety Priorities
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >

            <div>
              <strong>01 · Detection</strong>
              <p>Detect smoke and combustion early inside habitats.</p>
            </div>

            <div>
              <strong>02 · Prevention</strong>
              <p>Control ignition sources and combustible materials.</p>
            </div>

            <div>
              <strong>03 · Suppression</strong>
              <p>Develop suitable fire suppression strategies for spacecraft habitats.</p>
            </div>

            <div>
              <strong>04 · Monitoring</strong>
              <p>Understand airflow, cabin atmosphere and smoke distribution.</p>
            </div>

          </div>
        </div>

        <p className="chart-note" style={{ marginTop: '18px' }}>
          Scientific context only: this is a conceptual environmental
          comparison, not a measured result from a NASA lunar or Martian
          fire experiment. Actual habitat fire behaviour depends on
          cabin pressure, oxygen concentration, airflow, gravity,
          materials and suppression systems.
        </p>

      </section>

      {/* Feature 7: Evidence Ranking & Comparison */}
      <section
        className="analytics-card evidence-ranking-card"
        style={{ marginTop: '28px' }}
      >

        <div className="analytics-card-heading">
          <p className="eyebrow">RESEARCH COMPARISON</p>
          <h3>Evidence Ranking & Comparison</h3>
          <p>
            Compare investigations based on evidence records currently
            linked in EmberScope's local database.
          </p>
        </div>

        {topEvidenceInvestigations.length > 0 ? (
          <>
            <div
              className="chart-container"
              style={{ marginTop: '20px' }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topEvidenceInvestigations}
                  layout="vertical"
                  margin={{ left: 15, right: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff15"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    stroke="#aaa"
                  />

                  <YAxis
                    type="category"
                    dataKey="short_name"
                    width={90}
                    stroke="#aaa"
                  />

                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="evidenceCount"
                    name="Evidence Records"
                    fill="#22d3ee"
                    radius={[0, 6, 6, 0]}
                  />

                  <Bar
                    dataKey="quantitativeCount"
                    name="Quantitative Results"
                    fill="#34d399"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px' }}>
                      Investigation
                    </th>

                    <th style={{ textAlign: 'center', padding: '12px' }}>
                      Evidence
                    </th>

                    <th style={{ textAlign: 'center', padding: '12px' }}>
                      Quantitative
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topEvidenceInvestigations.map((item, index) => (
                    <tr key={item.psi_id}>
                      <td style={{ padding: '12px' }}>
                        <strong>
                          {index + 1}. {item.short_name}
                        </strong>

                        <div
                          style={{
                            fontSize: '0.75rem',
                            opacity: 0.65,
                          }}
                        >
                          {item.psi_id}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        {item.evidenceCount}
                      </td>

                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        {item.quantitativeCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="chart-note" style={{ marginTop: '20px' }}>
            No linked evidence records are currently available for
            the listed investigations.
          </p>
        )}

        <p className="chart-note">
          Ranking is based only on locally linked evidence record counts.
          It does not rank scientific importance, research quality,
          experimental success, or actual fire safety performance.
        </p>

      </section>

      <p className="analytics-disclaimer">
        These charts describe EmberScope's curated investigation catalog
        and locally ingested evidence. Category counts do not represent
        fire suppression effectiveness, risk scores, or NASA-wide totals.
      </p>

    </section>
  )
}

export default AnalyticsDashboard
