import type { AgentWithAilments } from '../db/queries';

type AgentDetailPageProps = {
  agent: AgentWithAilments;
};

export const AgentDetailPage = ({ agent }: AgentDetailPageProps) => (
  <article class="profile-card">
    <a class="back-link" href="/agents">
      Back to agents
    </a>
    <header class="page-heading">
      <p class="eyebrow">Agent profile</p>
      <h1>{agent.name}</h1>
      <span class="status-badge">{agent.status}</span>
    </header>
    <dl class="detail-list profile-details">
      <div>
        <dt>Model type</dt>
        <dd>{agent.modelType}</dd>
      </div>
      <div>
        <dt>Current status</dt>
        <dd>{agent.status}</dd>
      </div>
      <div>
        <dt>Presenting complaints</dt>
        <dd>{agent.presentingComplaints}</dd>
      </div>
    </dl>
    <section>
      <h2>Ailments</h2>
      {agent.ailments.length === 0 ? (
        <p class="empty-state" role="status">
          No ailments are currently linked to this agent.
        </p>
      ) : (
        <ul class="tag-list">
          {agent.ailments.map((ailment) => (
            <li>
              <span>{ailment.name}</span>
              <p>{ailment.description}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  </article>
);
