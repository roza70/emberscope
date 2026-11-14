
import { useEffect, useState } from "react";

interface Evidence {
  evidence_id: string;
  psi_id: string;
  topic: string;
  evidence_type: string;
  claim: string;
  source_title: string;
  source_doi: string | null;
  data_status: string;
  quantitative_result: string | number | null;
  limitations: string;
}

function EvidenceExplorer() {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/evidence")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load evidence");
        }
        return response.json();
      })
      .then((data) => {
        setEvidence(data.evidence);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load research evidence.");
        setLoading(false);
      });
  }, []);

  return (
    <section className="evidence-section">
      <div className="section-heading">
        <div>
          <p className="section-eyebrow">RESEARCH KNOWLEDGE BASE</p>
          <h2>Scientific Evidence Explorer</h2>
          <p>
            Explore research findings, investigation objectives and
            scientific limitations.
          </p>
        </div>

        <span className="evidence-count">
          {evidence.length} Evidence Records
        </span>
      </div>

      {loading && <p>Loading research evidence...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && evidence.length === 0 && (
        <p>No evidence records available yet.</p>
      )}

      <div className="evidence-grid">
        {evidence.map((item) => (
          <article className="evidence-card" key={item.evidence_id}>
            <div className="evidence-card-top">
              <span className="evidence-topic">{item.topic}</span>
              <span className="evidence-id">{item.psi_id}</span>
            </div>

            <h3>{item.evidence_type.replaceAll("_", " ")}</h3>

            <p className="evidence-claim">{item.claim}</p>

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
            </div>

            <div className="evidence-detail">
              <strong>Quantitative Result</strong>
              <p>
                {item.quantitative_result ?? "Not available in local dataset"}
              </p>
            </div>

            <div className="evidence-limitation">
              <strong>Research Limitation</strong>
              <p>{item.limitations}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EvidenceExplorer;
