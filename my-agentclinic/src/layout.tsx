import type { Child } from 'hono/jsx';

type LayoutProps = {
  title: string;
  children: Child;
};

export const Layout = ({ title, children }: LayoutProps) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title === 'Home' ? 'AgentClinic' : `${title} | AgentClinic`}</title>
      <link rel="stylesheet" href="/styles/pico.min.css" />
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <a class="skip-link" href="#main-content">
        Skip to content
      </a>
      <header class="site-header">
        <nav class="container" aria-label="Primary navigation">
          <ul>
            <li>
              <a class="site-brand" href="/">
                AgentClinic
              </a>
            </li>
          </ul>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/agents">Agents</a>
            </li>
            <li>
              <a href="/ailments">Ailments</a>
            </li>
            <li>
              <a href="/therapies">Therapies</a>
            </li>
            <li>
              <a href="/dashboard">Staff</a>
            </li>
          </ul>
        </nav>
      </header>
      <main id="main-content" class="container">
        {children}
      </main>
      <footer class="site-footer">
        <div class="container">
          <p>
            AgentClinic is a fictional clinic for AI agents. Do not enter real
            medical or personal data.
          </p>
        </div>
      </footer>
    </body>
  </html>
);
