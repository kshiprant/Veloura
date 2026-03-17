import AppShell from '../components/AppShell';

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="stack gap16">
        <div className="soft-card">
          <h2 className="page-title">Notifications</h2>
          <p className="muted small-text">Manage alerts and updates</p>
        </div>

        <div className="soft-card stack gap16">
          <label className="settings-row">
            <span>New matches</span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="settings-row">
            <span>New messages</span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="settings-row">
            <span>Likes received</span>
            <input type="checkbox" defaultChecked />
          </label>

          <label className="settings-row">
            <span>Product updates</span>
            <input type="checkbox" />
          </label>

          <label className="settings-row">
            <span>Email updates</span>
            <input type="checkbox" />
          </label>
        </div>
      </div>
    </AppShell>
  );
}
