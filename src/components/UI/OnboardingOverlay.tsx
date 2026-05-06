import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/UI/Button';

const STEPS = [
  {
    icon: '🤖',
    title: 'Welcome to AITrack',
    body: 'Manage all your AI service accounts in one place — quota tracking, cooldown timers, and conversation notes. Everything stays on your machine. No cloud, no sync.',
  },
  {
    icon: '⏱️',
    title: 'Quota Tracker',
    body: 'Add AI services (Cursor, Windsurf, Copilot…) and the accounts you use for each. When a quota runs out, mark it "On Cooldown" and AITrack will notify you the moment it resets.',
  },
  {
    icon: '🧠',
    title: 'AI Vault',
    body: 'Store per-account notes — conversation titles, project context, API hints — so you always know which account has the conversation you need. Fully searchable.',
  },
];

interface OnboardingOverlayProps {
  onDone: () => void;
}

export function OnboardingOverlay({ onDone }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="onboarding-overlay">
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '36px',
          width: '420px',
          maxWidth: 'calc(100vw - 48px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
          animation: 'slideInUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          textAlign: 'center',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to AITrack"
      >
        {/* Icon */}
        <div style={{ fontSize: '52px', marginBottom: '16px', lineHeight: 1 }}>
          {current.icon}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
          {current.title}
        </h2>

        {/* Body */}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '28px' }}>
          {current.body}
        </p>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '24px' }}>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                width: i === step ? '20px' : '7px',
                height: '7px',
                borderRadius: '99px',
                background: i === step ? 'var(--blue)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                transition: 'all 250ms ease',
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDone}
            aria-label="Skip onboarding"
          >
            Skip
          </Button>
          <Button
            variant="primary"
            size="md"
            iconRight={!isLast ? <ChevronRight size={15} /> : undefined}
            onClick={() => {
              if (isLast) onDone();
              else setStep((p) => p + 1);
            }}
            aria-label={isLast ? "Get started" : "Next step"}
          >
            {isLast ? "Let's go! 🚀" : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
