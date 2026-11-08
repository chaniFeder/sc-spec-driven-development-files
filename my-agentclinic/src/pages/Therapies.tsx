import type { TherapyWithAilments } from '../db/queries';

type TherapiesPageProps = {
  therapies: TherapyWithAilments[];
};

export const TherapiesPage = ({ therapies }: TherapiesPageProps) => (
  <section>
    <header class="page-heading">
      <p class="eyebrow">Fictional care approaches</p>
      <h1>Therapies</h1>
      <p>Explore sessions and the fictional ailments they are associated with.</p>
    </header>
    {therapies.length === 0 ? (
      <p class="empty-state" role="status">
        No therapies are currently listed.
      </p>
    ) : (
      <div class="card-grid">
        {therapies.map((therapy) => (
          <article class="therapy-card">
            <p class="eyebrow">{therapy.category}</p>
            <h2>
              <a href={`/therapies/${therapy.id}`}>{therapy.name}</a>
            </h2>
            <p>{therapy.description}</p>
            <p>{therapy.durationMinutes} minutes</p>
            <h3>May help with</h3>
            {therapy.ailments.length === 0 ? (
              <p class="empty-state" role="status">
                No ailments are currently associated with this therapy.
              </p>
            ) : (
              <ul>
                {therapy.ailments.map((ailment) => (
                  <li>{ailment.name}</li>
                ))}
              </ul>
            )}
            <a href={`/therapies/${therapy.id}`}>View therapy</a>
          </article>
        ))}
      </div>
    )}
  </section>
);

type TherapyDetailPageProps = {
  therapy: TherapyWithAilments;
};

export const TherapyDetailPage = ({ therapy }: TherapyDetailPageProps) => (
  <article class="profile-card">
    <a class="back-link" href="/therapies">
      Back to therapies
    </a>
    <header class="page-heading">
      <p class="eyebrow">{therapy.category}</p>
      <h1>{therapy.name}</h1>
      <p>{therapy.description}</p>
    </header>
    <dl class="detail-list profile-details">
      <div>
        <dt>Duration</dt>
        <dd>{therapy.durationMinutes} minutes</dd>
      </div>
      <div>
        <dt>May help with</dt>
        <dd>
          {therapy.ailments.length === 0
            ? 'No associated ailments'
            : therapy.ailments.map(({ name }) => name).join(', ')}
        </dd>
      </div>
    </dl>
    <section>
      <h2>Associated ailments</h2>
      {therapy.ailments.length === 0 ? (
        <p class="empty-state" role="status">
          No ailments are currently associated with this therapy.
        </p>
      ) : (
        <ul class="tag-list">
          {therapy.ailments.map((ailment) => (
            <li>
              <span>{ailment.name}</span>
              <p>{ailment.description}</p>
            </li>
          ))}
        </ul>
      )}
      <a href="/agents">Choose an agent to explore appointments</a>
    </section>
  </article>
);
