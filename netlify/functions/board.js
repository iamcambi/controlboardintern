exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const body = JSON.parse(event.body || '{}');
    const userText = body.contents?.[0]?.parts?.[0]?.text || "Directive";

    // Local fallback generator so the app never fails if API issues occur
    function generateFallback(inputText) {
        const words = inputText.split(' ');
        return words.map((w, i) => i % 2 === 0 ? `${w}/${w.toUpperCase()}` : w).join(' ') + '/RESONANCE_SECURED';
    }

    // If API key is missing entirely, return fallback smoothly
    if (!API_KEY) {
        console.warn("GEMINI_API_KEY missing. Engaging local fallback.");
        return {
            statusCode: 200,
            body: JSON.stringify({
                candidates: [{
                    content: {
                        parts: [{ text: generateFallback(userText) }]
                    }
                }]
            })
        };
    }

    try {
        // Connected to the stable gemini-3.8-flash model endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();

        // If Google API returns an error status, fallback cleanly instead of crashing
        if (!response.ok) {
            console.error("Google Gemini API Error:", JSON.stringify(data));
            return {
                statusCode: 200,
                body: JSON.stringify({
                    candidates: [{
                        content: {
                            parts: [{ text: generateFallback(userText) }]
                        }
                    }]
                })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Serverless Function Network Error:", error);
        // Fallback response on network exceptions
        return {
            statusCode: 200,
            body: JSON.stringify({
                candidates: [{
                    content: {
                        parts: [{ text: "ASTRAL_PLANE / OFFLINE_RESONANCE_ACTIVE" }]
                    }
                }]
            })
        };
    }
};