import { useState } from 'react';

interface BounceStep {
  bounce: number;
  fall: number;
  rise: number;
  peak: number;
  cumulative: number;
}

function calculateBounceDistance(initialHeightMeters: number) {
  const MIN_HEIGHT_METERS = 0.0002; // 1/5 mm = 0.2 mm = 0.0002 m
  const BOUNCE_FACTOR = 2 / 3;

  const steps: BounceStep[] = [];
  let totalDistance = 0;
  let currentHeight = initialHeightMeters;
  let bounceNum = 0;

  // First fall
  totalDistance += currentHeight;
  steps.push({ bounce: 0, fall: currentHeight, rise: 0, peak: currentHeight, cumulative: totalDistance });

  while (true) {
    bounceNum++;
    const nextHeight = currentHeight * BOUNCE_FACTOR;
    if (nextHeight < MIN_HEIGHT_METERS) break;

    totalDistance += nextHeight * 2;
    steps.push({ bounce: bounceNum, fall: nextHeight, rise: nextHeight, peak: nextHeight, cumulative: totalDistance });
    currentHeight = nextHeight;
  }

  return { steps, totalDistance, totalBounces: bounceNum - 1 };
}

export default function App() {
  const [heightInput, setHeightInput] = useState('10');
  const [unit, setUnit] = useState('meters');
  const [showAll, setShowAll] = useState(false);

  const result = (() => {
    const val = parseFloat(heightInput);
    if (isNaN(val) || val <= 0) return null;
    let m: number;
    switch (unit) {
      case 'cm': m = val / 100; break;
      case 'mm': m = val / 1000; break;
      case 'feet': m = val * 0.3048; break;
      case 'inches': m = val * 0.0254; break;
      default: m = val;
    }
    return calculateBounceDistance(m);
  })();

  const fmt = (m: number) => {
    if (m >= 1000) return (m / 1000).toFixed(4) + ' km';
    if (m >= 1) return m.toFixed(6) + ' m';
    if (m >= 0.001) return (m * 100).toFixed(4) + ' cm';
    return (m * 1000).toFixed(4) + ' mm';
  };

  const visibleSteps = result ? (showAll ? result.steps : result.steps.slice(0, 20)) : [];

  const pythonCode = result
    ? `def calculate_bounce_distance(initial_height_meters):
    """
    Calculate total distance of a bouncing ball.
    Loses 1/3 height each bounce. Stops when bounce < 1/5 mm.
    """
    MIN_HEIGHT = 0.0002  # 1/5 mm in meters
    BOUNCE_FACTOR = 2 / 3  # retains 2/3 each bounce

    total_distance = 0
    current_height = initial_height_meters
    bounce_count = 0

    # First fall
    total_distance += current_height
    print(f"Drop: {current_height:.6f} m | Total: {total_distance:.6f} m")

    # Bounces
    while True:
        next_height = current_height * BOUNCE_FACTOR
        if next_height < MIN_HEIGHT:
            print(f"Bounce #{bounce_count+1}: {next_height:.6f} m < threshold -> STOP")
            break
        bounce_count += 1
        total_distance += next_height * 2  # rise + fall
        print(f"Bounce #{bounce_count}: peak={next_height:.6f} m | Total: {total_distance:.6f} m")
        current_height = next_height

    print(f"\\nTotal distance: {total_distance:.6f} meters")
    print(f"Total bounces: {bounce_count}")
    return total_distance, bounce_count

if __name__ == "__main__":
    calculate_bounce_distance(${result.steps[0].peak.toFixed(6)})`
    : '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #581c87, #0f172a)', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fde047, #f97316, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🏀 Bouncing Ball Distance Calculator
        </h1>
        <p style={{ color: '#d1d5db', marginTop: '0.75rem', fontSize: '1.1rem' }}>
          Ball loses <b style={{ color: '#fde047' }}>1/3</b> height each bounce, stops below <b style={{ color: '#fde047' }}>1/5 mm</b>
        </p>
      </header>

      <main style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1rem 4rem' }}>
        {/* Input */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>⚙️ Parameters</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="number"
              value={heightInput}
              onChange={e => setHeightInput(e.target.value)}
              min="0.001"
              step="any"
              style={{ flex: 1, minWidth: '150px', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.5rem', color: 'white', fontSize: '1rem' }}
              placeholder="Enter height..."
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0.5rem', color: 'white', fontSize: '1rem' }}
            >
              <option value="meters" style={{ background: '#1e293b' }}>meters</option>
              <option value="cm" style={{ background: '#1e293b' }}>cm</option>
              <option value="mm" style={{ background: '#1e293b' }}>mm</option>
              <option value="feet" style={{ background: '#1e293b' }}>feet</option>
              <option value="inches" style={{ background: '#1e293b' }}>inches</option>
            </select>
          </div>
        </div>

        {result && (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(5,150,105,0.2))', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(74,222,128,0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#86efac' }}>Total Distance</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{fmt(result.totalDistance)}</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>{result.totalDistance.toFixed(6)} meters</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(96,165,250,0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#93c5fd' }}>Number of Bounces</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{result.totalBounces}</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>before stopping</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(219,39,119,0.2))', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(192,132,252,0.3)' }}>
                <div style={{ fontSize: '0.875rem', color: '#d8b4fe' }}>Initial Height</div>
                <div style={{ fontSize: '1.875rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{fmt(result.steps[0].peak)}</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>drop height</div>
              </div>
            </div>

            {/* Visualization */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>📊 Bounce Visualization</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '200px', borderBottom: '2px solid rgba(74,222,128,0.5)', padding: '0 0.5rem 0.25rem', overflowX: 'auto' }}>
                {result.steps.slice(0, 40).map((step, i) => {
                  const maxH = result.steps[0].peak;
                  const pct = Math.max((step.peak / maxH) * 100, 2);
                  const opacity = 1 - (i / 40) * 0.7;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        minWidth: '8px',
                        maxWidth: '30px',
                        height: pct + '%',
                        background: i === 0 ? `rgba(239,68,68,${opacity})` : `rgba(250,204,21,${opacity})`,
                        borderRadius: '2px 2px 0 0',
                      }}
                      title={'Bounce #' + step.bounce + ': ' + fmt(step.peak)}
                    />
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                <span>Drop</span>
                <span>→ Bounce progression →</span>
                <span>Stop</span>
              </div>
            </div>

            {/* Python Code */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>🐍 Python Code</h2>
              <button
                onClick={() => navigator.clipboard.writeText(pythonCode)}
                style={{ marginBottom: '0.5rem', padding: '0.375rem 0.75rem', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '0.5rem', color: '#86efac', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                📋 Copy Code
              </button>
              <pre style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '0.5rem', padding: '1rem', overflowX: 'auto', fontSize: '0.875rem', fontFamily: 'monospace', color: '#e5e7eb', lineHeight: 1.6 }}>
                <code>{pythonCode}</code>
              </pre>
            </div>

            {/* Table */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>📋 Step-by-Step Breakdown</h2>
                {result.steps.length > 20 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    style={{ padding: '0.5rem 1rem', background: 'rgba(234,179,8,0.2)', border: '1px solid rgba(250,204,21,0.4)', borderRadius: '0.5rem', color: '#fde047', fontSize: '0.875rem', cursor: 'pointer' }}
                  >
                    {showAll ? 'Show Less' : 'Show All (' + result.steps.length + ')'}
                  </button>
                )}
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                      <th style={{ textAlign: 'left', padding: '0.75rem', color: '#d1d5db' }}>Event</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', color: '#d1d5db' }}>Fall (m)</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', color: '#d1d5db' }}>Rise (m)</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', color: '#d1d5db' }}>Peak (m)</th>
                      <th style={{ textAlign: 'right', padding: '0.75rem', color: '#d1d5db' }}>Cumulative (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSteps.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                        <td style={{ padding: '0.625rem 0.75rem' }}>
                          {s.bounce === 0 ? (
                            <span>🔴 Initial Drop</span>
                          ) : (
                            <span>🟡 Bounce #{s.bounce}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right', padding: '0.625rem 0.75rem', fontFamily: 'monospace' }}>{s.fall.toFixed(6)}</td>
                        <td style={{ textAlign: 'right', padding: '0.625rem 0.75rem', fontFamily: 'monospace' }}>{s.rise > 0 ? s.rise.toFixed(6) : '—'}</td>
                        <td style={{ textAlign: 'right', padding: '0.625rem 0.75rem', fontFamily: 'monospace' }}>{s.peak.toFixed(6)}</td>
                        <td style={{ textAlign: 'right', padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fde047' }}>{s.cumulative.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid rgba(250,204,21,0.5)', background: 'rgba(234,179,8,0.1)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#fde047' }}>TOTAL</td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {result.steps.reduce((a, s) => a + s.fall, 0).toFixed(6)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {result.steps.reduce((a, s) => a + s.rise, 0).toFixed(6)}
                      </td>
                      <td></td>
                      <td style={{ textAlign: 'right', padding: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', color: '#fde047', fontSize: '1.125rem' }}>
                        {result.totalDistance.toFixed(6)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {!showAll && result.steps.length > 20 && (
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', marginTop: '1rem' }}>
                  Showing first 20 of {result.steps.length} bounces
                </p>
              )}
            </div>
          </>
        )}

        {/* Math */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', marginTop: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>📐 The Math</h2>
          <p style={{ color: '#d1d5db', marginBottom: '1rem' }}>
            With bounce factor <b style={{ color: '#fde047' }}>r = 2/3</b> and initial height <b style={{ color: '#fde047' }}>H</b>:
          </p>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.8 }}>
            <div>Total = H + 2·H·r + 2·H·r² + 2·H·r³ + ...</div>
            <div style={{ color: '#9ca3af', marginTop: '0.5rem' }}>Geometric series → converges to:</div>
            <div style={{ color: '#86efac', marginTop: '0.5rem' }}>Total = H + 2Hr/(1-r) = H + 2H(2/3)/(1/3) = H + 4H = <b style={{ color: '#fde047' }}>5H</b></div>
            <div style={{ color: '#9ca3af', marginTop: '0.5rem' }}>(theoretical limit with infinite bounces)</div>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '1rem' }}>
            We stop at 0.2 mm threshold, so actual total is slightly less than 5H.
          </p>
        </div>
      </main>
    </div>
  );
}
