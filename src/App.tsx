import { useState, useMemo } from 'react';

interface BounceStep {
  bounceNumber: number;
  fallDistance: number;
  riseDistance: number;
  peakHeight: number;
  cumulativeDistance: number;
}

interface CalculationResult {
  steps: BounceStep[];
  totalDistance: number;
  totalBounces: number;
  initialHeight: number;
  minHeightMeters: number;
}

function calculateBounceDistance(initialHeightMeters: number): CalculationResult {
  const MIN_HEIGHT_METERS = 0.0002; // 1/5 mm = 0.2 mm = 0.0002 m
  const BOUNCE_FACTOR = 2 / 3; // loses 1/3 of height each bounce

  const steps: BounceStep[] = [];
  let totalDistance = 0;
  let currentHeight = initialHeightMeters;
  let bounceNumber = 0;

  // First fall
  totalDistance += currentHeight;
  steps.push({
    bounceNumber: 0,
    fallDistance: currentHeight,
    riseDistance: 0,
    peakHeight: currentHeight,
    cumulativeDistance: totalDistance,
  });

  // Subsequent bounces
  while (true) {
    bounceNumber++;
    const nextHeight = currentHeight * BOUNCE_FACTOR;

    if (nextHeight < MIN_HEIGHT_METERS) {
      break;
    }

    // Ball rises and falls the same distance
    const riseAndFall = nextHeight * 2;
    totalDistance += riseAndFall;

    steps.push({
      bounceNumber,
      fallDistance: nextHeight,
      riseDistance: nextHeight,
      peakHeight: nextHeight,
      cumulativeDistance: totalDistance,
    });

    currentHeight = nextHeight;
  }

  return {
    steps,
    totalDistance,
    totalBounces: bounceNumber - 1,
    initialHeight: initialHeightMeters,
    minHeightMeters: MIN_HEIGHT_METERS,
  };
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(4)} km`;
  } else if (meters >= 1) {
    return `${meters.toFixed(6)} m`;
  } else if (meters >= 0.001) {
    return `${(meters * 100).toFixed(4)} cm`;
  } else {
    return `${(meters * 1000).toFixed(4)} mm`;
  }
}

function App() {
  const [heightInput, setHeightInput] = useState<string>('10');
  const [unit, setUnit] = useState<string>('meters');
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);

  const result = useMemo(() => {
    const value = parseFloat(heightInput);
    if (isNaN(value) || value <= 0) return null;

    let heightInMeters: number;
    switch (unit) {
      case 'cm':
        heightInMeters = value / 100;
        break;
      case 'mm':
        heightInMeters = value / 1000;
        break;
      case 'feet':
        heightInMeters = value * 0.3048;
        break;
      case 'inches':
        heightInMeters = value * 0.0254;
        break;
      default:
        heightInMeters = value;
    }

    return calculateBounceDistance(heightInMeters);
  }, [heightInput, unit]);

  const displayedSteps = result
    ? showAllSteps
      ? result.steps
      : result.steps.slice(0, 20)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="py-8 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
          🏀 Bouncing Ball Distance Calculator
        </h1>
        <p className="mt-3 text-gray-300 text-lg max-w-2xl mx-auto">
          Calculate the total distance a ball travels when dropped from a height,
          bouncing and losing <span className="text-yellow-300 font-semibold">1/3</span> of its height each time,
          until the bounce is less than <span className="text-yellow-300 font-semibold">1/5 mm</span>.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-16">
        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-3xl">⚙️</span> Parameters
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Drop Height
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  min="0.001"
                  step="any"
                  className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter height..."
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="meters" className="bg-slate-800">meters</option>
                  <option value="cm" className="bg-slate-800">cm</option>
                  <option value="mm" className="bg-slate-800">mm</option>
                  <option value="feet" className="bg-slate-800">feet</option>
                  <option value="inches" className="bg-slate-800">inches</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400">Bounce Factor</p>
                <p className="text-xl font-bold text-yellow-300">Retains 2/3 of height each bounce</p>
                <p className="text-sm text-gray-400 mt-1">Stop threshold: &lt; 0.2 mm (1/5 mm)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md rounded-2xl p-6 border border-green-400/30">
                <div className="text-sm text-green-300 font-medium">Total Distance</div>
                <div className="text-3xl font-bold text-white mt-2">{formatDistance(result.totalDistance)}</div>
                <div className="text-sm text-gray-400 mt-1">{result.totalDistance.toFixed(6)} meters</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-md rounded-2xl p-6 border border-blue-400/30">
                <div className="text-sm text-blue-300 font-medium">Number of Bounces</div>
                <div className="text-3xl font-bold text-white mt-2">{result.totalBounces}</div>
                <div className="text-sm text-gray-400 mt-1">before stopping</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-6 border border-purple-400/30">
                <div className="text-sm text-purple-300 font-medium">Initial Height</div>
                <div className="text-3xl font-bold text-white mt-2">{formatDistance(result.initialHeight)}</div>
                <div className="text-sm text-gray-400 mt-1">drop height</div>
              </div>
            </div>

            {/* Visual Animation */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-3xl">📊</span> Bounce Visualization
              </h2>
              <BounceVisualization steps={result.steps} />
            </div>

            {/* Python Code */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-3xl">🐍</span> Python Code
              </h2>
              <PythonCode heightMeters={result.initialHeight} />
            </div>

            {/* Step-by-step Table */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <span className="text-3xl">📋</span> Step-by-Step Breakdown
                </h2>
                {result.steps.length > 20 && (
                  <button
                    onClick={() => setShowAllSteps(!showAllSteps)}
                    className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/40 rounded-lg text-yellow-300 text-sm font-medium transition-colors"
                  >
                    {showAllSteps ? 'Show Less' : `Show All (${result.steps.length})`}
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-3 text-gray-300 font-medium">Event</th>
                      <th className="text-right py-3 px-3 text-gray-300 font-medium">Fall (m)</th>
                      <th className="text-right py-3 px-3 text-gray-300 font-medium">Rise (m)</th>
                      <th className="text-right py-3 px-3 text-gray-300 font-medium">Peak Height (m)</th>
                      <th className="text-right py-3 px-3 text-gray-300 font-medium">Cumulative (m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSteps.map((step, idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/5' : ''} hover:bg-white/10 transition-colors`}
                      >
                        <td className="py-2.5 px-3">
                          {step.bounceNumber === 0 ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-red-400"></span>
                              Initial Drop
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                              Bounce #{step.bounceNumber}
                            </span>
                          )}
                        </td>
                        <td className="text-right py-2.5 px-3 font-mono">{step.fallDistance.toFixed(6)}</td>
                        <td className="text-right py-2.5 px-3 font-mono">
                          {step.riseDistance > 0 ? step.riseDistance.toFixed(6) : '—'}
                        </td>
                        <td className="text-right py-2.5 px-3 font-mono">{step.peakHeight.toFixed(6)}</td>
                        <td className="text-right py-2.5 px-3 font-mono font-bold text-yellow-300">
                          {step.cumulativeDistance.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-yellow-400/50 bg-yellow-500/10">
                      <td className="py-3 px-3 font-bold text-yellow-300">TOTAL</td>
                      <td className="text-right py-3 px-3 font-mono font-bold">
                        {result.steps.reduce((sum, s) => sum + s.fallDistance, 0).toFixed(6)}
                      </td>
                      <td className="text-right py-3 px-3 font-mono font-bold">
                        {result.steps.reduce((sum, s) => sum + s.riseDistance, 0).toFixed(6)}
                      </td>
                      <td></td>
                      <td className="text-right py-3 px-3 font-mono font-bold text-yellow-300 text-lg">
                        {result.totalDistance.toFixed(6)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {!showAllSteps && result.steps.length > 20 && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Showing first 20 of {result.steps.length} bounces. Click "Show All" to see everything.
                </p>
              )}
            </div>
          </>
        )}

        {/* Formula Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 mt-8 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-3xl">📐</span> The Math
          </h2>
          <div className="space-y-4 text-gray-300">
            <p>
              When a ball is dropped from height <span className="text-yellow-300 font-mono font-bold">H</span> and
              each bounce retains <span className="text-yellow-300 font-mono font-bold">2/3</span> of the previous height:
            </p>
            <div className="bg-black/30 rounded-lg p-4 font-mono text-sm md:text-base overflow-x-auto">
              <p>Total Distance = H + 2·H·(2/3) + 2·H·(2/3)² + 2·H·(2/3)³ + ...</p>
              <p className="mt-2 text-gray-400">This is a geometric series that converges to:</p>
              <p className="mt-2 text-green-300">Total Distance = H + 2H·(2/3) / (1 - 2/3) = H + 4H = <span className="text-yellow-300 font-bold">5H</span></p>
              <p className="mt-2 text-gray-400">(theoretically, with infinite bounces)</p>
            </div>
            <p className="text-sm text-gray-400">
              However, we stop when the bounce height falls below 0.2 mm (1/5 mm),
              so the actual total will be slightly less than 5H.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function BounceVisualization({ steps }: { steps: BounceStep[] }) {
  const maxSteps = Math.min(steps.length, 30);
  const displaySteps = steps.slice(0, maxSteps);
  const maxHeight = steps[0]?.peakHeight || 1;

  return (
    <div className="relative">
      {/* Ground line */}
      <div className="flex items-end gap-1 h-64 border-b-2 border-green-400/50 px-2 pb-1 overflow-x-auto">
        {displaySteps.map((step, idx) => {
          const heightPercent = (step.peakHeight / maxHeight) * 100;
          const opacity = 1 - (idx / maxSteps) * 0.7;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-[20px] max-w-[40px]">
              <div
                className="w-full rounded-t-sm transition-all duration-300"
                style={{
                  height: `${Math.max(heightPercent, 2)}%`,
                  backgroundColor: idx === 0
                    ? `rgba(239, 68, 68, ${opacity})`
                    : `rgba(250, 204, 21, ${opacity})`,
                }}
                title={`Bounce #${step.bounceNumber}: ${formatDistance(step.peakHeight)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Drop</span>
        <span>→ Bounce progression →</span>
        <span>Stop</span>
      </div>
      {steps.length > 30 && (
        <p className="text-center text-gray-400 text-sm mt-2">
          Showing first 30 bounces (of {steps.length} total)
        </p>
      )}
    </div>
  );
}

function PythonCode({ heightMeters }: { heightMeters: number }) {
  const pythonCode = `def calculate_bounce_distance(initial_height_meters):
    """
    Calculate the total distance a ball travels when dropped from a height,
    bouncing and losing 1/3 of its height each time,
    until the bounce height is less than 1/5 mm (0.0002 m).
    
    Args:
        initial_height_meters: The initial drop height in meters
    
    Returns:
        tuple: (total_distance, number_of_bounces, list_of_steps)
    """
    MIN_HEIGHT = 0.0002  # 1/5 mm in meters (stopping threshold)
    BOUNCE_FACTOR = 2 / 3  # Ball retains 2/3 of height each bounce
    
    total_distance = 0
    current_height = initial_height_meters
    bounce_count = 0
    steps = []
    
    # First fall (initial drop)
    total_distance += current_height
    steps.append({
        'bounce': 0,
        'fall': current_height,
        'rise': 0,
        'peak_height': current_height,
        'cumulative': total_distance
    })
    
    print(f"Initial drop: height = {current_height:.6f} m, "
          f"distance = {total_distance:.6f} m")
    
    # Subsequent bounces
    while True:
        next_height = current_height * BOUNCE_FACTOR
        
        if next_height < MIN_HEIGHT:
            print(f"\\nBounce #{bounce_count + 1}: height = {next_height:.6f} m "
                  f"< {MIN_HEIGHT} m → STOPPING")
            break
        
        bounce_count += 1
        rise_and_fall = next_height * 2
        total_distance += rise_and_fall
        
        steps.append({
            'bounce': bounce_count,
            'fall': next_height,
            'rise': next_height,
            'peak_height': next_height,
            'cumulative': total_distance
        })
        
        print(f"Bounce #{bounce_count}: peak = {next_height:.6f} m, "
              f"rise+fall = {rise_and_fall:.6f} m, "
              f"total = {total_distance:.6f} m")
        
        current_height = next_height
    
    print(f"\\n{'='*50}")
    print(f"Total bounces: {bounce_count}")
    print(f"Total distance traveled: {total_distance:.6f} meters")
    print(f"{'='*50}")
    
    return total_distance, bounce_count, steps


# Example usage
if __name__ == "__main__":
    height = ${heightMeters}  # meters
    total_dist, bounces, steps = calculate_bounce_distance(height)
    
    print(f"\\nBall dropped from {height} meters")
    print(f"Traveled {total_dist:.6f} meters in {bounces} bounces")
    print(f"\\nNote: Theoretical limit (infinite bounces) = {5 * height:.6f} meters")`;

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={() => navigator.clipboard.writeText(pythonCode)}
          className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 rounded-lg text-green-300 text-xs font-medium transition-colors"
        >
          📋 Copy Code
        </button>
      </div>
      <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200 leading-relaxed">
        <code>{pythonCode}</code>
      </pre>
    </div>
  );
}

export default App;
