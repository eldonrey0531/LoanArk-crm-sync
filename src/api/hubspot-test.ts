export default async function handler(req: any, res: any) {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
      },
    });

    if (response.ok) {
      res.status(200).json({ connected: true });
    } else {
      res.status(500).json({ connected: false });
    }
  } catch (error) {
    res.status(500).json({ connected: false, error });
  }
}
