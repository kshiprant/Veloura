import AppShell from '../components/AppShell';

export default function PrivacySafetyPage() {
  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card">
          <h2 className="page-title">Privacy &amp; Safety</h2>
          <p className="muted small-text">Control profile visibility and safety preferences</p>
        </div>

        <div className="soft-card stack gap16">
          <label className="settings-row">
            <span>Show age</span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="settings-row">
            <span>Show city</span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="settings-row">
            <span>Show distance</span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="settings-row">
            <span>Show online status</span>
            <input type="checkbox" />
          </label>
        </div>

        <div className="soft-card">
          <h3>Safety</h3>
          <p className="muted small-text">
            Block, report, and visibility controls can be expanded here later.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
