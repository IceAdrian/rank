export async function onRequest(context) {
    // 'context' enthält die Anfrage und die Verbindung zur Datenbank (env)
    const { request, env } = context;

    // 1. Wenn deine Webseite die aktuellen Daten abfragt:
    if (request.method === "GET") {
        // Lade die Daten aus dem KV-Speicher namens "LEHRER_KV"
        const data = await env.LEHRER_KV.get("ranking_alltime");
        
        // Wenn noch keine Daten da sind, gib ein leeres Objekt "{}" zurück
        return new Response(data || "{}", { 
            headers: { "Content-Type": "application/json" } 
        });
    }

    // 2. Wenn deine Webseite nach einem Duell neue Daten speichern will:
    if (request.method === "POST") {
        // Nimm die neuen Daten entgegen
        const newData = await request.text();
        
        // Speichere sie im KV-Speicher
        await env.LEHRER_KV.put("ranking_alltime", newData);
        
        return new Response("Erfolgreich gespeichert!", { status: 200 });
    }

    // Falls etwas anderes versucht wird (z.B. Löschen)
    return new Response("Nicht erlaubt", { status: 405 });
}
