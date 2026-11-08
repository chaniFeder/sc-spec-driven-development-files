import type { ClinicDatabase } from './database';

export interface Ailment {
  id: string;
  name: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  modelType: string;
  status: string;
  presentingComplaints: string;
}

export interface AgentWithAilments extends Agent {
  ailments: Ailment[];
}

export interface AilmentWithAgents extends Ailment {
  agents: Pick<Agent, 'id' | 'name'>[];
}

export interface Therapy {
  id: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
}

export interface TherapyWithAilments extends Therapy {
  ailments: Ailment[];
}

interface AgentAilmentRow {
  agentId: string;
  id: string;
  name: string;
  description: string;
}

interface AilmentAgentRow {
  ailmentId: string;
  id: string;
  name: string;
}

interface TherapyAilmentRow {
  therapyId: string;
  id: string;
  name: string;
  description: string;
}

const agentSelect = `
  SELECT id, name, model_type AS modelType, status,
         presenting_complaints AS presentingComplaints
  FROM agents
`;

export function listAgents(database: ClinicDatabase): AgentWithAilments[] {
  const agents = database
    .prepare<[], Agent>(`${agentSelect} ORDER BY name`)
    .all();
  const ailmentsByAgent = new Map<string, Ailment[]>(
    agents.map(({ id }) => [id, []]),
  );
  const relationships = database
    .prepare<[], AgentAilmentRow>(
      `SELECT agent_ailments.agent_id AS agentId, ailments.id, ailments.name,
              ailments.description
       FROM agent_ailments
       JOIN ailments ON ailments.id = agent_ailments.ailment_id
       ORDER BY ailments.name`,
    )
    .all();

  for (const relationship of relationships) {
    ailmentsByAgent.get(relationship.agentId)?.push({
      id: relationship.id,
      name: relationship.name,
      description: relationship.description,
    });
  }

  return agents.map((agent) => ({
    ...agent,
    ailments: ailmentsByAgent.get(agent.id) ?? [],
  }));
}

export function getAgent(
  database: ClinicDatabase,
  id: string,
): AgentWithAilments | undefined {
  const agent = database.prepare<[string], Agent>(`${agentSelect} WHERE id = ?`).get(id);
  if (!agent) {
    return undefined;
  }

  const ailments = database
    .prepare<[string], Ailment>(
      `SELECT ailments.id, ailments.name, ailments.description
       FROM ailments
       JOIN agent_ailments ON agent_ailments.ailment_id = ailments.id
       WHERE agent_ailments.agent_id = ?
       ORDER BY ailments.name`,
    )
    .all(id);

  return { ...agent, ailments };
}

export function listAilments(
  database: ClinicDatabase,
): AilmentWithAgents[] {
  const ailments = database
    .prepare<[], Ailment>('SELECT id, name, description FROM ailments ORDER BY name')
    .all();
  const agentsByAilment = new Map<string, Pick<Agent, 'id' | 'name'>[]>(
    ailments.map(({ id }) => [id, []]),
  );
  const relationships = database
    .prepare<[], AilmentAgentRow>(
      `SELECT agent_ailments.ailment_id AS ailmentId, agents.id, agents.name
       FROM agent_ailments
       JOIN agents ON agents.id = agent_ailments.agent_id
       ORDER BY agents.name`,
    )
    .all();

  for (const relationship of relationships) {
    agentsByAilment.get(relationship.ailmentId)?.push({
      id: relationship.id,
      name: relationship.name,
    });
  }

  return ailments.map((ailment) => ({
    ...ailment,
    agents: agentsByAilment.get(ailment.id) ?? [],
  }));
}

const therapySelect = `
  SELECT id, name, description, category, duration_minutes AS durationMinutes
  FROM therapies
`;

export function listTherapies(
  database: ClinicDatabase,
): TherapyWithAilments[] {
  const therapies = database
    .prepare<[], Therapy>(`${therapySelect} ORDER BY name`)
    .all();
  const ailmentsByTherapy = new Map<string, Ailment[]>(
    therapies.map(({ id }) => [id, []]),
  );
  const relationships = database
    .prepare<[], TherapyAilmentRow>(
      `SELECT therapy_ailments.therapy_id AS therapyId, ailments.id, ailments.name,
              ailments.description
       FROM therapy_ailments
       JOIN ailments ON ailments.id = therapy_ailments.ailment_id
       ORDER BY ailments.name`,
    )
    .all();

  for (const relationship of relationships) {
    ailmentsByTherapy.get(relationship.therapyId)?.push({
      id: relationship.id,
      name: relationship.name,
      description: relationship.description,
    });
  }

  return therapies.map((therapy) => ({
    ...therapy,
    ailments: ailmentsByTherapy.get(therapy.id) ?? [],
  }));
}

export function getTherapy(
  database: ClinicDatabase,
  id: string,
): TherapyWithAilments | undefined {
  const therapy = database
    .prepare<[string], Therapy>(`${therapySelect} WHERE id = ?`)
    .get(id);
  if (!therapy) {
    return undefined;
  }

  const ailments = database
    .prepare<[string], Ailment>(
      `SELECT ailments.id, ailments.name, ailments.description
       FROM ailments
       JOIN therapy_ailments ON therapy_ailments.ailment_id = ailments.id
       WHERE therapy_ailments.therapy_id = ?
       ORDER BY ailments.name`,
    )
    .all(id);

  return { ...therapy, ailments };
}
