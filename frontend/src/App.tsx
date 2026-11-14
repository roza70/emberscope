
import { useEffect, useState } from 'react'
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

const API_URL = 'http://127.0.0.1:8000/api/investigations'

function App() {
  const [investigations, setInvestigations] = useState<Investigation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    async function fetchInvestigations() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        setInvestigations(data.investigations)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load investigations.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchInvestigations()
  }, [])

  const filteredInvestigations = investigations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.psi_id.toLowerCase().includes(search.toLowerCase()) ||
      item.short_name.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  return (
    <main className="emberscope-app">
      <nav className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">✦</span>
          Ember<span>Scope</span>
        </a>
        <span className="nav-label">NASA FIRE SAFETY INTELLIGENCE</span>
      </nav>

      <section className="hero-section">
        <p className="eyebrow">NASA MICROGRAVITY RESEARCH</p>
        <h1>
          Understanding Fire
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

        {loading && (
          <p className="message">Loading NASA investigations...</p>
        )}

        {error && (
          <div className="error-message">
            <strong>Unable to load research data.</strong>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="result-count">
              Showing {filteredInvestigations.length} of {investigations.length} investigations
            </p>

            <div className="investigation-grid">
              {filteredInvestigations.map((item) => (
                <article className="investigation-card" key={item.psi_id}>
                  <div className="card-top">
                    <span className="psi-id">{item.psi_id}</span>
                    <span className="metadata-label">Metadata catalog</span>
                  </div>

                  <h3>{item.short_name}</h3>
                  <p className="card-name">{item.name}</p>

                  <div className="category-list">
                    {item.category.map((category) => (
                      <span className="category-tag" key={category}>
                        {category}
                      </span>
                    ))}
                  </div>

                  {item.materials && (
                    <p className="card-detail">
                      <strong>Materials:</strong> {item.materials.join(', ')}
                    </p>
                  )}

                  {item.instruments && (
                    <p className="card-detail">
                      <strong>Instruments:</strong> {item.instruments.join(', ')}
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
                      <span className="no-doi">DOI not added</span>
                    )}
                  </div>
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

      <footer className="footer">
        <p>EmberScope — NASA Microgravity Fire Safety Intelligence Platform</p>
        <span>Research-driven insights for safer space exploration.</span>
      </footer>
    </main>
  )
}

export default App
