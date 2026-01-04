/**
 * Dummy panel for proof-of-concept testing
 * Demonstrates tab content with draggable functionality
 */

interface DummyPanelProps {
  params?: {
    title?: string;
    color?: string;
  };
}

export function DummyPanel({ params }: DummyPanelProps) {
  const title = params?.title || 'Panel';
  const color = params?.color || '#3b82f6';

  return (
    <div
      style={{
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          padding: '16px',
          backgroundColor: color,
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
        }}
      >
        {title}
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Drag Me!</h3>
        <p>
          This panel can be dragged to another zone. Try dragging the tab header to move
          this panel to a different zone.
        </p>
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          flex: 1,
        }}
      >
        <h4 style={{ marginTop: 0 }}>Panel Details</h4>
        <ul style={{ fontSize: '14px', color: '#6b7280' }}>
          <li>Title: {title}</li>
          <li>Color: {color}</li>
          <li>Timestamp: {new Date().toLocaleTimeString()}</li>
        </ul>
      </div>
    </div>
  );
}
