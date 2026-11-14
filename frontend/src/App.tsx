import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'
import EvidenceExplorer from './EvidenceExplorer'
import './App.css'

type Investigation = {
  psi_id: string
  short_name: string
  name: string
  category: string[]
  doi?: string
  materials?: string[]
  instruments?: string[]
  metadata_only: boolean
}

type Evidence = {
  evidence_id: string
  psi_id: string
  topic: string
  evidence_type: string
  claim: string
  source_title: string
  source_doi: string | null
  source_url?: string
  data_status: string
  quantitative_result: number | null
  limitations: string
}

type AskMatch = Evidence & {
  relevance_score: number
}


type CitationValidation = {
  citations_found: boolean
  citations_valid: boolean
  verified_evidence_ids: string[]
  invalid_evidence_ids: string[]
}

type AskResponse = {
  question: string
  answer: string
  total_matches: number
  matches: AskMatch[]
  ai_provider: string
  answer_type: string
  citation_validation: CitationValidation
}

const API_URL = 'http://127.0.0.1:8000/api/investigations'
const EVIDENCE_API_URL = 'http://127.0.0.1:8000/api/evidence'
const ASK_API_URL = 'http://127.0.0.1:8000/api/ask'

function App() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [selectedInvestigation, setSelectedInvestigation] =
    useState<Investigation | null>(null)

  // Ask EmberScope states
  const [question, setQuestion] = useState('')
  const [askResult, setAskResult] = useState<AskResponse | null>(null)
  const [asking, setAsking] = useState(false)
  const [askError, setAskError] = useState('')

  // Fetch investigations and evidence
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')

        const [investigationResponse, evidenceResponse] =
          await Promise.all([
            fetch(API_URL),
            fetch(EVIDENCE_API_URL),
          ])

        if (!investigationResponse.ok) {
          throw new Error(
            `Investigation API error: ${investigationResponse.status}`
          )
        }

        if (!evidenceResponse.ok) {
          throw new Error(
            `Evidence API error: ${evidenceResponse.status}`
          )
        }

        const investigationData = await investigationResponse.json()
        const evidenceData = await evidenceResponse.json()

        setInvestigations(investigationData.investigations)
        setEvidence(evidenceData.evidence)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load research data.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Search and category filtering
  const filteredInvestigations = investigations.filter((item) => {
    const searchTerm = search.toLowerCase()

    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) ||
      item.psi_id.toLowerCase().includes(searchTerm) ||
      item.short_name.toLowerCase().includes(searchTerm)

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  // Evidence belonging to the selected investigation
  const relatedEvidence = evidence.filter(
    (item) => item.psi_id === selectedInvestigation?.psi_id
  )

  // Ask EmberScope Research Assistant
  async function askAssistant() {
    if (!question.trim()) {
      setAskError('Please enter a research question.')
      return
    }

    try {
      setAsking(true)
      setAskError('')
      setAskResult(null)

      const response = await fetch(ASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          top_k: 5,
        }),
      })

      if (!response.ok) {
        throw new Error(`Assistant API error: ${response.status}`)
      }

      const data: AskResponse = await response.json()
      setAskResult(data)

    } catch (err) {
      setAskError(
        err instanceof Error
          ? err.message
          : 'Could not connect to EmberScope Assistant.'
      )
    } finally {
      setAsking(false)
    }
  }

  // Example questions
  const exampleQuestions = [
    'How does smoke behave in microgravity?',
    'What NASA experiments studied fire suppression?',
    'Which investigations focus on fire detection?',
  ]

  return (
    <main className="emberscope-app">

      {/* Navigation */}
      <nav className="navbar">
        <a
          className="brand"
          href="#home"
          onClick={() => setSelectedInvestigation(null)}
        >
          <span className="brand-icon">✦</span>
          Ember<span>Scope</span>
        </a>

        <span className="nav-label">
          NASA FIRE SAFETY INTELLIGENCE
        </span>
      </nav>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <p className="eyebrow">
          NASA MICROGRAVITY RESEARCH
        </p>

        <h1>
          Understanding <span className="fire-gradient">Fire</span>
          <br />
          <span>Beyond Earth.</span>
        </h1>
        <p className="hero-description">
          Explore NASA's microgravity combustion experiments and discover
          research insights for safer human space exploration.
        </p>

        <div className="hero-status">
          <span className="status-dot"></span>
          Research database connected
        </div>
      </section>

      {/* Ask EmberScope Research Assistant */}
      <section className="dashboard-section ask-section" id="ask">

        <div className="section-heading">
          <div>
            <p className="eyebrow">SI RESEARCH ASSISTANT</p>
            <h2>Ask EmberScope</h2>

            <p className="section-description">
              Explore NASA fire safety research through evidence-based
              information retrieval.
            </p>
          </div>

          <div className="total-card">
            <strong>SI</strong>
            <span>Assistant</span>
          </div>
        </div>

        <div className="ask-panel">

          <label htmlFor="research-question">
            What would you like to research?
          </label>

          <textarea
            id="research-question"
            className="ask-input"
            placeholder="Example: How does smoke behave in microgravity?"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !asking
              ) {
                event.preventDefault()
                askAssistant()
              }
            }}
            rows={3}
          />

          <div className="ask-controls">
            <span className="ask-hint">
              Press Enter to ask · Shift + Enter for a new line
            </span>

            <button
              className="ask-button"
              onClick={askAssistant}
              disabled={asking}
            >
              {asking ? 'Researching...' : 'Ask EmberScope →'}
            </button>
          </div>

          {/* Example questions */}
          <div className="example-questions">
            <p>Try asking:</p>

            <div className="example-list">
              {exampleQuestions.map((example) => (
                <button
                  key={example}
                  className="example-question"
                  onClick={() => {
                    setQuestion(example)
                    setAskError('')
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Loading state */}
        {asking && (
          <div className="assistant-loading">
            <span className="status-dot"></span>
            Searching NASA research evidence...
          </div>
        )}

        {/* Error state */}
        {askError && (
          <div className="error-message">
            <strong>Research request unsuccessful.</strong>
            <p>{askError}</p>
          </div>
        )}

        {/* Assistant response */}
        {askResult && !asking && (
          <div className="assistant-results">

            <div className="assistant-answer">
              <p className="eyebrow">EMBERSCOPE RESEARCH RESPONSE</p>

              <h3>{askResult.question}</h3>

              <div className="markdown-answer">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {askResult.answer}
                </ReactMarkdown>
              </div>

              <div className="total-card">
                <strong>{askResult.total_matches}</strong>
                <span>Evidence matches</span>
              </div>
            </div>

            {/* Matching evidence */}
            <div className="assistant-evidence">

              <div className="section-heading">
                <div>
                  <p className="eyebrow">RETRIEVED NASA RECORDS</p>
                  <h3>Relevant Research Evidence</h3>
                </div>
              </div>

              {askResult.matches.length > 0 ? (
                <div className="evidence-grid">

                  {askResult.matches.map((item) => (
                    <article
                      className="evidence-card"
                      key={item.evidence_id}
                    >

                      <div className="card-top">
                        <span className="psi-id">
                          {item.psi_id}
                        </span>

                        <span className="metadata-label">
                          {item.topic}
                        </span>
                      </div>

                      <h3>{item.source_title}</h3>

                      <p>{item.claim}</p>

                      <p className="card-detail">
                        <strong>Evidence type:</strong>{' '}
                        {item.evidence_type.replaceAll('_', ' ')}
                      </p>

                      <p className="card-detail">
                        <strong>Relevance score:</strong>{' '}
                        {item.relevance_score}
                      </p>

                      <p className="card-detail">
                        <strong>Data status:</strong>{' '}
                        {item.data_status.replaceAll('_', ' ')}
                      </p>

                      {item.quantitative_result !== null && (
                        <p className="card-detail">
                          <strong>Quantitative result:</strong>{' '}
                          {item.quantitative_result}
                        </p>
                      )}

                      <p className="card-detail">
                        <strong>Limitations:</strong>{' '}
                        {item.limitations}
                      </p>

                      {item.source_doi && (
                        <p className="card-detail">
                          <strong>DOI:</strong>{' '}
                          {item.source_doi}
                        </p>
                      )}

                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open NASA research source ↗
                        </a>
                      )}

                    </article>
                  ))}

                </div>
              ) : (
                <p className="message">
                  No matching evidence was found in the local database.
                </p>
              )}

            </div>

            <p className="assistant-disclaimer">
              Research note: Retrieved records may describe investigation
              objectives rather than verified experimental findings.
              Always review the original NASA source and listed limitations.
            </p>

          </div>
        )}

      </section>

      {/* Investigation Detail View */}
      {selectedInvestigation ? (
        <section className="dashboard-section detail-section">

          <button
            className="back-button"
            onClick={() => setSelectedInvestigation(null)}
          >
            ← Back to Investigations
          </button>

          <p className="eyebrow">
            INVESTIGATION DETAILS · {selectedInvestigation.psi_id}
          </p>

          <h2>{selectedInvestigation.short_name}</h2>

          <h3>{selectedInvestigation.name}</h3>

          <div className="category-list">
            {selectedInvestigation.category.map((category) => (
              <span className="category-tag" key={category}>
                {category}
              </span>
            ))}
          </div>

          {/* Investigation Information */}
          <div className="detail-card">
            <h3>Research Information</h3>

            <p>
              <strong>Investigation ID:</strong>{' '}
              {selectedInvestigation.psi_id}
            </p>

            <p>
              <strong>Short Name:</strong>{' '}
              {selectedInvestigation.short_name}
            </p>

            <p>
              <strong>Data Availability:</strong>{' '}
              {selectedInvestigation.metadata_only
                ? 'Metadata catalog only'
                : 'Additional data available in project'}
            </p>

            {selectedInvestigation.materials && (
              <p>
                <strong>Materials:</strong>{' '}
                {selectedInvestigation.materials.join(', ')}
              </p>
            )}

            {selectedInvestigation.instruments && (
              <p>
                <strong>Instruments:</strong>{' '}
                {selectedInvestigation.instruments.join(', ')}
              </p>
            )}

            {selectedInvestigation.doi && (
              <p>
                <strong>NASA Research Source:</strong>{' '}
                <a
                  href={`https://doi.org/${selectedInvestigation.doi}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View DOI ↗
                </a>
              </p>
            )}
          </div>

          {/* Related Evidence */}
          <div className="detail-evidence">
            <div className="section-heading">
              <div>
                <p className="eyebrow">RESEARCH RECORDS</p>
                <h3>Related Evidence</h3>
              </div>

              <div className="total-card">
                <strong>{relatedEvidence.length}</strong>
                <span>Records</span>
              </div>
            </div>

            {relatedEvidence.length > 0 ? (
              <div className="evidence-grid">
                {relatedEvidence.map((item) => (
                  <article
                    className="evidence-card"
                    key={item.evidence_id}
                  >
                    <div className="card-top">
                      <span className="psi-id">
                        {item.topic}
                      </span>

                      <span className="metadata-label">
                        {item.evidence_type.replaceAll('_', ' ')}
                      </span>
                    </div>

                    <p>{item.claim}</p>

                    <p className="card-detail">
                      <strong>Source:</strong>{' '}
                      {item.source_title}
                    </p>

                    <p className="card-detail">
                      <strong>Data status:</strong>{' '}
                      {item.data_status.replaceAll('_', ' ')}
                    </p>

                    {item.quantitative_result !== null && (
                      <p className="card-detail">
                        <strong>Quantitative result:</strong>{' '}
                        {item.quantitative_result}
                      </p>
                    )}

                    <p className="card-detail">
                      <strong>Limitations:</strong>{' '}
                      {item.limitations}
                    </p>

                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open research source ↗
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="message">
                No related evidence records are currently available.
              </p>
            )}
          </div>

        </section>
      ) : (

        /* Main Investigation Explorer */
        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <p className="eyebrow">RESEARCH LIBRARY</p>
              <h2>Investigation Explorer</h2>

              <p className="section-description">
                Explore NASA Physical Sciences Informatics investigations.
              </p>
            </div>

            <div className="total-card">
              <strong>{investigations.length}</strong>
              <span>Investigations</span>
            </div>
          </div>

          {/* Search and Category Filter */}
          <div className="toolbar">
            <input
              className="search-input"
              type="search"
              placeholder="Search by name, ID or experiment..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              className="category-select"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              <option value="Prevention">Prevention</option>
              <option value="Detection">Detection</option>
              <option value="Suppression">Suppression</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <p className="message">
              Loading NASA investigations...
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="error-message">
              <strong>Unable to load research data.</strong>
              <p>{error}</p>

              <button onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          )}

          {/* Investigation Cards */}
          {!loading && !error && (
            <>
              <p className="result-count">
                Showing {filteredInvestigations.length} of{' '}
                {investigations.length} investigations
              </p>

              <div className="investigation-grid">
                {filteredInvestigations.map((item) => (
                  <article
                    className="investigation-card"
                    key={item.psi_id}
                  >
                    <div className="card-top">
                      <span className="psi-id">
                        {item.psi_id}
                      </span>

                      <span className="metadata-label">
                        Metadata catalog
                      </span>
                    </div>

                    <h3>{item.short_name}</h3>

                    <p className="card-name">
                      {item.name}
                    </p>

                    <div className="category-list">
                      {item.category.map((category) => (
                        <span
                          className="category-tag"
                          key={category}
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    {item.materials && (
                      <p className="card-detail">
                        <strong>Materials:</strong>{' '}
                        {item.materials.join(', ')}
                      </p>
                    )}

                    {item.instruments && (
                      <p className="card-detail">
                        <strong>Instruments:</strong>{' '}
                        {item.instruments.join(', ')}
                      </p>
                    )}

                    <div className="card-footer">
                      {item.doi ? (
                        <a
                          href={`https://doi.org/${item.doi}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View DOI ↗
                        </a>
                      ) : (
                        <span className="no-doi">
                          DOI not added
                        </span>
                      )}
                    </div>

                    <button
                      className="explore-button"
                      onClick={() => {
                        setSelectedInvestigation(item)
                      }}
                    >
                      Explore Investigation →
                    </button>

                  </article>
                ))}
              </div>

              {filteredInvestigations.length === 0 && (
                <p className="message">
                  No investigations match your search.
                </p>
              )}
            </>
          )}

        </section>
      )}

      {/* Scientific Evidence Explorer */}
      {!selectedInvestigation && <EvidenceExplorer />}

      {/* Footer */}
      <footer className="footer">
        <p>
          EmberScope — NASA Microgravity Fire Safety Intelligence Platform
        </p>

        <span>
          Research-driven insights for safer space exploration.
        </span>
      </footer>

    </main>
  )
}

export default App
