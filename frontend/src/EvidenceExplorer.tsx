
interface Evidence {
  evidence_id: string
  psi_id: string
  topic: string
  evidence_type: string
  claim: string
  source_title: string
  source_doi: string | null
  source_url?: string
  data_status: string
  quantitative_result: string | number | null
  limitations: string
}

interface EvidenceExplorerProps {
  evidence: Evidence[]
}

function EvidenceExplorer({ evidence }: EvidenceExplorerProps) {
  return (
    <section className="evidence-section">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">
            RESEARCH KNOWLEDGE BASE
          </p>

          <h2>Scientific Evidence Explorer</h2>

          <p>
            Explore research findings, investigation objectives
            and scientific limitations.
          </p>
        </div>

        <span className="evidence-count">
          {evidence.length} Evidence Records
        </span>
      </div>

      {evidence.length === 0 ? (
        <p>No evidence records available yet.</p>
      ) : (
        <div className="evidence-grid">
          {evidence.map((item) => (
            <article
              className="evidence-card"
              key={item.evidence_id}
            >
              <div className="evidence-card-top">
                <span className="evidence-topic">
                  {item.topic}
                </span>

                <span className="evidence-id">
                  {item.psi_id}
                </span>
              </div>

              <h3>
                {item.evidence_type.replaceAll('_', ' ')}
              </h3>

              <p className="evidence-claim">
                {item.claim}
              </p>

              <div className="evidence-detail">
                <strong>Source</strong>
                <p>{item.source_title}</p>

                {item.source_doi && (
                  <a
                    href={`https://doi.org/${item.source_doi}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View DOI ↗
                  </a>
                )}

                {!item.source_doi && item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Source ↗
                  </a>
                )}
              </div>

              <div className="evidence-detail">
                <strong>Data Availability</strong>
                <p>
                  {item.data_status ===
                    'NASA_data_not_yet_ingested_locally'
                    ? 'Not yet ingested into local database'
                    : item.data_status.replaceAll('_', ' ')}
                </p>
              </div>

              <div className="evidence-detail">
                <strong>Quantitative Result</strong>

                <p>
                  {item.quantitative_result ??
                    'Not available in local dataset'}
                </p>
              </div>

              <div className="evidence-limitation">
                <strong>Research Limitation</strong>
                <p>{item.limitations}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default EvidenceExplorer
