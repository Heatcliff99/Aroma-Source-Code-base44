import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const ENTITY_MAP = {
  enquiry: 'Enquiry',
  booking: 'Booking',
  custom_bouquet: 'CustomBouquet',
  feedback: 'Feedback',
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { type, data } = body || {};
    const entityName = ENTITY_MAP[type];
    if (!entityName || !data || typeof data !== 'object') {
      return Response.json({ error: 'Invalid submission' }, { status: 400 });
    }

    const created = await base44.asServiceRole.entities[entityName].create(data);

    return Response.json({ ok: true, id: created.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}


================================================================================
END OF EXPORT
