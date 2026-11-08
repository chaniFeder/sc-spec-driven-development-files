import type { AilmentWithAgents } from '../db/queries';

type AilmentsPageProps = {
  ailments: AilmentWithAgents[];
};

export const AilmentsPage = ({ ailments }: AilmentsPageProps) => (
  <section>
    <header class="page-heading">
      <p class="eyebrow">The clinic's fictional catalog</p>
      <h1>Ailments</h1>
      <p>Explore the challenges agents have brought to the clinic.</p>
    </header>
    {ailments.length === 0 ? (
      <p class="empty-state" role="status">
        No ailments are currently listed.
      </p>
    ) : (
      <div class="card-grid">
        {ailments.map((ailment) => (
          <article class="ailment-card">
            <h2>{ailment.name}</h2>
            <p>{ailment.description}</p>
            <h3>Associated agents</h3>
            {ailment.agents.length === 0 ? (
              <p class="empty-state" role="status">
                No agents are currently linked to this ailment.
              </p>
            ) : (
              <ul>
                {ailment.agents.map((agent) => (
                  <li>
                    <a href={`/agents/${agent.id}`}>{agent.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    )}
  </section>
);
