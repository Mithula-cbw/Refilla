export function SkeletonLoader() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '20px',
      gap: '14px',
      background: 'var(--bg-primary)',
    }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="skeleton-block" style={{ width: '160px', height: '22px' }} />
        <div className="skeleton-block" style={{ width: '100px', height: '30px' }} />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            border: '1px solid var(--border)',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', background: 'var(--bg-secondary)',
          }}>
            <div className="skeleton-block" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            <div className="skeleton-block" style={{ width: `${80 + i * 30}px`, height: '16px' }} />
            <div style={{ flex: 1 }} />
            <div className="skeleton-block" style={{ width: '60px', height: '20px', borderRadius: '99px' }} />
          </div>

          {/* Card rows */}
          {i < 3 && (
            <div style={{ padding: '12px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2].map((j) => (
                <div
                  key={j}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '8px',
                    border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
                  }}
                >
                  <div className="skeleton-block" style={{ width: '9px', height: '9px', borderRadius: '50%' }} />
                  <div className="skeleton-block" style={{ width: `${120 + j * 40}px`, height: '14px' }} />
                  <div style={{ flex: 1 }} />
                  <div className="skeleton-block" style={{ width: '70px', height: '20px', borderRadius: '99px' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
