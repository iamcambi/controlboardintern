exports.handler = async function(event) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'API Key missing' }) };

    try {
        // Enforce an 8-second timeout so Netlify never hangs
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        // Direct passthrough to the fastest 8B flash model
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: event.body, // Pass exact frontend payload without re-parsing
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();

        // Fallback gracefully if Google throws an error
        if (!response.ok) throw new Error("API Error");

        return { statusCode: 200, body: JSON.stringify(data) };

    } catch (error) {
        // Instant fallback format if connection takes too long
        return { 
            statusCode: 200, 
            body: JSON.stringify({ 
                candidates: [{ content: { parts: [{ text: "TRANSMISSION EXPEDITED / SIGNAL TIMEOUT" }] } }] 
            }) 
        };
    }
};