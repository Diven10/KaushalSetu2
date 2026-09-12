import { useState } from 'react';
import { api } from '../services/api';
import { useApiData } from '../hooks/useApiData';
import SectionHeader from '../components/common/SectionHeader';
import SimulationControl from '../components/simulator/SimulationControl';
import SimulationResult from '../components/simulator/SimulationResult';
import { SIMULATOR_SKILLS, SIMULATOR_INTERVENTIONS, SIMULATOR_HORIZONS, DEMO_SIMULATION } from '../data/mockGovernmentData';

export default function PolicySimulator() {
  const { data: districts, loading } = useApiData(() => api.getDistricts(), []);
  const [params, setParams] = useState({
    district: 'pune', skill: DEMO_SIMULATION.skill, intervention: DEMO_SIMULATION.intervention,
    quantity: DEMO_SIMULATION.quantity, horizon: DEMO_SIMULATION.horizon,
  });
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setRunning(true);
    try {
      const r = await api.runSimulation(params);
      setResult(r);
    } finally {
      setRunning(false);
    }
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--grey-500)' }}>Loading policy simulator…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
      <SectionHeader title="Policy What-If Simulator" subtitle="Test a hypothetical intervention and see its projected effect — not a guaranteed outcome" />

      <SimulationControl
        districts={districts}
        skills={SIMULATOR_SKILLS}
        interventions={SIMULATOR_INTERVENTIONS}
        horizons={SIMULATOR_HORIZONS}
        params={params}
        onChange={setParams}
        onRun={handleRun}
        running={running}
      />

      {result ? (
        <SimulationResult result={result} />
      ) : (
        <p style={{ fontSize: 13, color: 'var(--grey-500)' }}>
          Set the parameters above and run a simulation to see projected placement, employment, retention and skill-gap effects.
        </p>
      )}
    </div>
  );
}
