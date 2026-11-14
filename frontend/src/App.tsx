
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useState } from 'react'
import EvidenceExplorer from './EvidenceExplorer'
import AnalyticsDashboard from './AnalyticsDashboard'
import './App.css'

type Investigation = {
  psi_id: string
  short_name: string
  name: string
  project_type?: string
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

type ResearchProfile = {
  background: string
  objectives: string[]
  methodology: string[]
  findings: string[]
  spaceRelevance: string
  limitations: string[]
  sources: {
    title: string
    url: string
  }[]
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const API_URL = `${API_BASE_URL}/api/investigations`
const EVIDENCE_API_URL = `${API_BASE_URL}/api/evidence`
const ASK_API_URL = `${API_BASE_URL}/api/ask`

// Verified research profile currently available locally.
const researchProfiles: Record<string, ResearchProfile> = {
  'PSI-159': {
    background:
      'Cool Flames Investigation with Gases (CFI-G) was part of NASA’s Advanced Combustion via Microgravity Experiments (ACME). It investigated cool-flame chemistry using gaseous fuels in microgravity. Cool flames are low-temperature combustion reactions that can be difficult to observe under ordinary conditions.',

    objectives: [
      'Observe non-premixed, spherical cool flames in microgravity.',
      'Study cool-flame chemistry using a porous spherical burner.',
      'Investigate combustion behaviour that can improve scientific understanding of fuel oxidation.',
      'Collect observations that can support the development of improved combustion models.'
    ],

    methodology: [
      'The investigation was conducted aboard the International Space Station.',
      'The experiment used the Combustion Integrated Rack.',
      'A porous spherical burner was used to study gaseous-fuel combustion.',
      'Optical diagnostics and imaging were used to observe faint cool-flame behaviour.',
      'The research examined gaseous fuels under controlled experimental conditions.'
    ],

    findings: [
      'Researchers reported observations of spherical, quasi-steady, burner-supported cool flames.',
      'The experiment demonstrated that cool-flame behaviour can be investigated in a microgravity environment.',
      'The observations contributed to the scientific understanding of low-temperature combustion.'
    ],

    spaceRelevance:
      'CFI-G primarily investigated fundamental combustion chemistry. Its findings can contribute to broader knowledge of flame behaviour in microgravity, which is relevant to understanding combustion in spacecraft environments. However, this experiment should not be interpreted as a direct test of spacecraft fire detection, suppression, or Moon and Mars habitat fire safety systems.',

    limitations: [
      'The investigation focused on gaseous-fuel cool flames, not every type of spacecraft fire.',
      'The findings do not independently validate a spacecraft fire suppression system.',
      'Microgravity experiments in the ISS environment do not reproduce all lunar or Martian surface conditions.',
      'The findings should be interpreted within the scope of the original experiment and its published research.'
    ],

    sources: [
      {
        title: 'NASA — Advanced Combustion via Microgravity Experiments',
        url: 'https://science.nasa.gov/biological-physical/investigations/acme/'
      },
      {
        title: 'NASA — Cool Flames Created During a First for ISS Research',
        url: 'https://www.nasa.gov/missions/station/'
      },
      {
        title: 'NASA Technical Reports Server',
        url: 'https://ntrs.nasa.gov/search?q=Cool%20Flames%20Investigation%20with%20Gases'
      }
    ]
  }
}

function App() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [selectedInvestigation, setSelectedInvestigation] =
    useState<Investigation | null>(null)

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
            fetch(EVIDENCE_API_URL)
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

  // Evidence linked to the selected investigation
  const relatedEvidence = evidence.filter(
    (item) =>
      item.psi_id?.trim().toUpperCase() ===
      selectedInvestigation?.psi_id?.trim().toUpperCase()
  )

  // Related investigations based on shared research categories
  const relatedInvestigations = selectedInvestigation
    ? investigations
      .filter(
        (item) =>
          item.psi_id.trim().toUpperCase() !==
          selectedInvestigation.psi_id.trim().toUpperCase()
      )
      .map((item) => {
        const selectedCategories = selectedInvestigation.category.map(
          (category) => category.trim().toLowerCase()
        )

        const sharedCategories = item.category.filter((category) =>
          selectedCategories.includes(category.trim().toLowerCase())
        )

        return {
          ...item,
          sharedCategories,
          matchCount: sharedCategories.length
        }
      })
      .filter((item) => item.matchCount > 0)
      .sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount
        }

        return a.short_name.localeCompare(b.short_name)
      })
    : []

  // Selected investigation research profile
  const selectedProfile = selectedInvestigation
    ? researchProfiles[selectedInvestigation.psi_id]
    : undefined

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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: question.trim(),
          top_k: 5
        })
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

  const exampleQuestions = [
    'How does smoke behave in microgravity?',
    'What NASA experiments studied fire suppression?',
    'Which investigations focus on fire detection?'
  ]

  function openInvestigation(item: Investigation) {
    setSelectedInvestigation(item)
  }

  function closeInvestigation() {
    setSelectedInvestigation(null)
  }

  return (
    <main className="emberscope-app" id="home">

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

        <div className="nav-links">
          <a href="#home" onClick={() => setSelectedInvestigation(null)}>
            Home
          </a>
          <a href="#analytics" onClick={() => setSelectedInvestigation(null)}>
            Analytics
          </a>
          <a href="#investigations" onClick={() => setSelectedInvestigation(null)}>
            Investigations
          </a>
          <a href="#evidence" onClick={() => setSelectedInvestigation(null)}>
            Evidence
          </a>
          <a href="#ask" onClick={() => setSelectedInvestigation(null)}>
            Ask SI
          </a>
        </div>

        <span className="nav-label">
          NASA FIRE SAFETY INTELLIGENCE
        </span>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-eyebrow">
            NASA MICROGRAVITY RESEARCH
          </span>

          <h1>
            Understanding Fire
            <br />
            <span>Beyond Earth.</span>
          </h1>

          <p>
            Explore NASA's microgravity combustion experiments
            and discover research insights for safer human
            space exploration.
          </p>

          <div className="hero-status">
            <span className="status-dot"></span>
            Research database connected
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <div className="dashboard-container">

        {/* Ask EmberScope */}
        <section className="ask-section" id="ask">
          <div className="section-heading">
            <span className="section-eyebrow">
              SI RESEARCH ASSISTANT
            </span>

            <h2>Ask EmberScope</h2>

            <p>
              Explore NASA fire safety research through
              evidence-based information retrieval.
            </p>
          </div>

          <div className="ask-panel">
            <label htmlFor="research-question">
              What would you like to explore?
            </label>

            <textarea
              id="research-question"
              className="ask-input"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask a question about NASA microgravity fire experiments..."
              rows={4}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  if (!asking) askAssistant()
                }
              }}
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
                {asking
                  ? 'Researching...'
                  : 'Ask Research Assistant →'}
              </button>
            </div>

            {askError && (
              <div className="error-message">
                {askError}
              </div>
            )}

            <div className="example-questions">
              <span>Explore with example questions</span>

              <div className="example-list">
                {exampleQuestions.map((example, index) => (
                  <button
                    key={index}
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

          {/* Assistant Answer */}
          {askResult && (
            <div className="assistant-answer">
              <div className="answer-header">
                <div>
                  <span className="section-eyebrow">
                    EMBERSCOPE AI
                  </span>
                  <h3>Research Response</h3>
                </div>

                <span className="ai-provider">
                  {askResult.ai_provider}
                </span>
              </div>

              <div className="answer-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {askResult.answer}
                </ReactMarkdown>
              </div>

              <div className="answer-metadata">
                <span>
                  Evidence matches: {askResult.total_matches}
                </span>

                <span>
                  Answer type: {askResult.answer_type}
                </span>

                <span>
                  Citations:{' '}
                  {askResult.citation_validation.citations_valid
                    ? 'Validated IDs'
                    : 'Not fully validated'}
                </span>
              </div>

              {askResult.matches.length > 0 && (
                <div className="answer-sources">
                  <h4>Retrieved Research Evidence</h4>

                  {askResult.matches.map((match) => (
                    <div
                      className="answer-source-card"
                      key={match.evidence_id}
                    >
                      <strong>
                        {match.evidence_id} · {match.source_title}
                      </strong>

                      <p>{match.claim}</p>

                      <span>
                        Investigation: {match.psi_id}
                      </span>

                      {match.source_url && (
                        <a
                          href={match.source_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Source ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Loading and Error */}
        {loading && (
          <div className="loading-state">
            Loading NASA research database...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Analytics Dashboard */}
        {!loading && !error && (
          <section id="analytics">
            <AnalyticsDashboard
              investigations={investigations}
              evidence={evidence}
            />
          </section>
        )}

        {/* Investigation Explorer */}
        {!loading && !error && (
          <section
            className="dashboard-section"
            id="investigations"
          >
            {!selectedInvestigation ? (
              <>
                <div className="section-heading">
                  <span className="section-eyebrow">
                    NASA RESEARCH DATABASE
                  </span>

                  <h2>Investigation Explorer</h2>

                  <p>
                    Explore curated NASA combustion investigations
                    and their fire safety research objectives.
                  </p>
                </div>

                {/* Search and Category Filter */}
                <div className="filter-panel">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search investigations by name or PSI ID..."
                    className="search-input"
                  />

                  <select
                    value={selectedCategory}
                    onChange={(event) =>
                      setSelectedCategory(event.target.value)
                    }
                    className="category-select"
                  >
                    <option value="All">All Categories</option>
                    <option value="Prevention">Prevention</option>
                    <option value="Detection">Detection</option>
                    <option value="Suppression">Suppression</option>
                  </select>
                </div>

                <div className="results-count">
                  Showing {filteredInvestigations.length} of{' '}
                  {investigations.length} curated investigations
                </div>

                <div className="investigation-grid">
                  {filteredInvestigations.map((item) => (
                    <article
                      className="investigation-card"
                      key={item.psi_id}
                    >
                      <span className="investigation-id">
                        {item.psi_id}
                      </span>

                      <h3>{item.short_name}</h3>

                      <p>{item.name}</p>

                      {item.project_type && (
                        <span className="project-type">
                          {item.project_type}
                        </span>
                      )}

                      <div className="category-tags">
                        {item.category.map((category) => (
                          <span
                            className={`category-tag ${category.toLowerCase()}`}
                            key={category}
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      <button
                        className="explore-button"
                        onClick={() => openInvestigation(item)}
                      >
                        Explore Investigation →
                      </button>
                    </article>
                  ))}
                </div>

                {filteredInvestigations.length === 0 && (
                  <div className="empty-state">
                    No matching investigations found.
                  </div>
                )}
              </>
            ) : (
              /* Complete Investigation Detail Page */
              <div className="detail-view">

                <button
                  className="back-button"
                  onClick={closeInvestigation}
                >
                  ← Back to Investigations
                </button>

                {/* Investigation Header */}
                <div className="detail-card">
                  <span className="section-eyebrow">
                    NASA INVESTIGATION PROFILE
                  </span>

                  <span className="investigation-id">
                    {selectedInvestigation.psi_id}
                  </span>

                  <h2>{selectedInvestigation.short_name}</h2>

                  <h3>{selectedInvestigation.name}</h3>

                  <div className="detail-meta">
                    {selectedInvestigation.project_type && (
                      <p>
                        <strong>Project Type:</strong>{' '}
                        {selectedInvestigation.project_type}
                      </p>
                    )}

                    <div className="category-tags">
                      {selectedInvestigation.category.map((category) => (
                        <span
                          className={`category-tag ${category.toLowerCase()}`}
                          key={category}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedInvestigation.doi && (
                    <p className="detail-doi">
                      <strong>DOI:</strong>{' '}
                      <a
                        href={`https://doi.org/${selectedInvestigation.doi}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {selectedInvestigation.doi} ↗
                      </a>
                    </p>
                  )}

                  {selectedInvestigation.materials &&
                    selectedInvestigation.materials.length > 0 && (
                      <div className="detail-info-block">
                        <h4>Materials</h4>
                        <ul>
                          {selectedInvestigation.materials.map((material) => (
                            <li key={material}>{material}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {selectedInvestigation.instruments &&
                    selectedInvestigation.instruments.length > 0 && (
                      <div className="detail-info-block">
                        <h4>Instruments</h4>
                        <ul>
                          {selectedInvestigation.instruments.map((instrument) => (
                            <li key={instrument}>{instrument}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>

                {/* Research Profile */}
                {selectedProfile ? (
                  <div className="research-profile">

                    <section className="research-block">
                      <span className="section-eyebrow">
                        RESEARCH OVERVIEW
                      </span>
                      <h3>Scientific Background</h3>
                      <p>{selectedProfile.background}</p>
                    </section>

                    <section className="research-block">
                      <span className="section-eyebrow">
                        RESEARCH GOALS
                      </span>
                      <h3>Research Objectives</h3>
                      <ul>
                        {selectedProfile.objectives.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="research-block">
                      <span className="section-eyebrow">
                        EXPERIMENTAL PROCESS
                      </span>
                      <h3>Experimental Methodology</h3>
                      <ul>
                        {selectedProfile.methodology.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="research-block">
                      <span className="section-eyebrow">
                        REPORTED OBSERVATIONS
                      </span>
                      <h3>Scientific Findings</h3>
                      <ul>
                        {selectedProfile.findings.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                      <p className="research-note">
                        Findings are presented as a summary of the
                        available research profile, not as a complete
                        reproduction of the original NASA publication.
                      </p>
                    </section>

                    <section className="research-block">
                      <span className="section-eyebrow">
                        SPACE EXPLORATION
                      </span>
                      <h3>Moon & Mars Relevance</h3>
                      <p>{selectedProfile.spaceRelevance}</p>
                    </section>

                    <section className="research-block">
                      <span className="section-eyebrow">
                        SCIENTIFIC CAUTION
                      </span>
                      <h3>Research Limitations</h3>
                      <ul>
                        {selectedProfile.limitations.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="research-block">
                      <span className="section-eyebrow">
                        SOURCE VERIFICATION
                      </span>
                      <h3>NASA Research Sources</h3>

                      <div className="research-source-list">
                        {selectedProfile.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {source.title} ↗
                          </a>
                        ))}
                      </div>
                    </section>

                  </div>
                ) : (
                  <div className="research-profile-pending">
                    <span className="section-eyebrow">
                      RESEARCH PROFILE
                    </span>

                    <h3>Detailed Research Profile Coming Soon</h3>

                    <p>
                      The investigation metadata is available in the
                      local database, but a complete, source-verified
                      scientific profile has not yet been added.
                    </p>

                    <p>
                      We do not generate unverified research findings.
                      This profile will be expanded when the original
                      NASA publications and datasets are reviewed.
                    </p>
                  </div>
                )}

                {/* Related Investigations */}
                <div className="related-evidence">
                  <span className="section-eyebrow">
                    EXPLORE CONNECTED RESEARCH
                  </span>

                  <h3>Related Investigations</h3>

                  <p>
                    These investigations share one or more research
                    categories with the current investigation.
                    This is category-based matching, not a verified
                    scientific relationship.
                  </p>

                  {relatedInvestigations.length > 0 ? (
                    <div className="investigation-grid">
                      {relatedInvestigations.map((item) => (
                        <article
                          className="investigation-card"
                          key={item.psi_id}
                        >
                          <span className="investigation-id">
                            {item.psi_id}
                          </span>

                          <h3>{item.short_name}</h3>

                          <p>{item.name}</p>

                          <div className="category-tags">
                            {item.category.map((category) => (
                              <span
                                className={`category-tag ${category.toLowerCase()}`}
                                key={category}
                              >
                                {category}
                              </span>
                            ))}
                          </div>

                          <span className="project-type">
                            {item.matchCount} shared{' '}
                            {item.matchCount === 1 ? 'category' : 'categories'}
                          </span>

                          <button
                            className="explore-button"
                            onClick={() => openInvestigation(item)}
                          >
                            Explore Investigation →
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="no-evidence-message">
                      No other investigation currently shares a research
                      category with this investigation in the local database.
                    </p>
                  )}
                </div>

                {/* Related Research Evidence */}
                <div className="related-evidence">
                  <span className="section-eyebrow">
                    LOCAL EVIDENCE DATABASE
                  </span>

                  <h3>Related Research Evidence</h3>

                  {relatedEvidence.length > 0 ? (
                    relatedEvidence.map((item) => (
                      <article
                        className="evidence-card"
                        key={item.evidence_id}
                      >
                        <span className="investigation-id">
                          {item.evidence_id}
                        </span>

                        <h4>{item.topic}</h4>

                        <p>{item.claim}</p>

                        <p>
                          <strong>Evidence Type:</strong>{' '}
                          {item.evidence_type}
                        </p>

                        <p>
                          <strong>Data Status:</strong>{' '}
                          {item.data_status}
                        </p>

                        {item.quantitative_result !== null && (
                          <p>
                            <strong>Quantitative Result:</strong>{' '}
                            {item.quantitative_result}
                          </p>
                        )}

                        <p>
                          <strong>Limitations:</strong>{' '}
                          {item.limitations}
                        </p>

                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Research Source ↗
                          </a>
                        )}

                        {item.source_doi && (
                          <p>
                            <strong>Source DOI:</strong>{' '}
                            <a
                              href={`https://doi.org/${item.source_doi}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.source_doi} ↗
                            </a>
                          </p>
                        )}
                      </article>
                    ))
                  ) : (
                    <p className="no-evidence-message">
                      No linked evidence is currently available in the
                      local database for this investigation. This does
                      not mean NASA has no published research or data
                      about it.
                    </p>
                  )}
                </div>

              </div>
            )}
          </section>
        )}

        {/* Evidence Explorer */}
        {!loading && !error && (
          <section id="evidence">
            <EvidenceExplorer evidence={evidence} />
          </section>
        )}

      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-icon">✦</span>
          EmberScope
        </div>

        <p>
          NASA Microgravity Fire Safety Intelligence Platform
        </p>

        <span>
          An independent research exploration project for NASA
          Space Apps Challenge 2026.
        </span>

        <small>
          Research data and interpretations should be understood
          within their documented evidence and limitations.
        </small>
      </footer>
    </main>
  )
}

export default App
