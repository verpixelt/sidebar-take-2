import React from 'react';
import { createRoot } from 'react-dom/client';
import SidebarExample from './Sidebar.example';
import './main.css';

/**
 * Dev-server entry point only - not part of the shipped component.
 * Wraps the example in a minimal page shell so the sidebar has a layout
 * context. The filler paragraphs just make the page scroll, so the
 * sticky/fixed behaviour is visible.
 */
const DemoPage: React.FC = () => {
  const [variant, setVariant] = React.useState<'full' | 'icon'>('full');

  return (
    <div className="demo-layout">
      <SidebarExample key={variant} variant={variant} />
      <main className="demo-content">
        <h1>Sidebar Demo</h1>

        <div className="demo-switch" role="group" aria-label="Variante">
          {(['full', 'icon'] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={variant === value}
              onClick={() => setVariant(value)}
            >
              variant="{value}"
            </button>
          ))}
        </div>

        <p>
          <strong>full:</strong> die bisherige Variante. <strong>icon:</strong> schmale Leiste,
          die sich per Chevron neben dem Icon ausklappen lässt. Die Varianten unterscheiden sich
          nur oberhalb von 768px - darunter weichen beide dem schwebenden Disclosure-Button.
        </p>

        {Array.from({ length: 60 }, (_, i) => (
          <p key={i}>Platzhalterinhalt {i + 1}</p>
        ))}
      </main>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoPage />
  </React.StrictMode>,
);
