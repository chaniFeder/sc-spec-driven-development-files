import type { AgentWithAilments } from '../db/queries';

type AgentsPageProps = {
  agents: AgentWithAilments[];
};

export const AgentsPage = ({ agents }: AgentsPageProps) => (
  <section>
    <header class="page-heading">
      <p class="eyebrow">Meet the clinic's residents</p>
      <h1>Agents</h1>
      <p>Browse agent profiles and the complaints they are working through.</p>
    </header>
    {agents.length === 0 ? (
      <p class="empty-state" role="status">
        No agents are currently listed.
      </p>
    ) : (
      <div class="card-grid">
        {agents.map((agent) => (
          <article class="agent-card">
            <header>
              <h2>
                <a href={`/agents/${agent.id}`}>{agent.name}</a>
              </h2>
              <span class="status-badge">{agent.status}</span>
            </header>
            <dl class="detail-list">
              <div>
                <dt>Model type</dt>
                <dd>{agent.modelType}</dd>
              </div>
              <div>
                <dt>Presenting complaints</dt>
                <dd>{agent.presentingComplaints}</dd>
              </div>
            </dl>
            <a href={`/agents/${agent.id}`}>View profile</a>
          </article>
        ))}
      </div>
    )}
  </section>
);
