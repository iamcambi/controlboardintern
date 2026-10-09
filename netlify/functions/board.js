exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        console.error("GEMINI_API_KEY is missing from Netlify environment variables.");
        return { statusCode: 500, body: JSON.stringify({ error: 'API Key not configured' }) };
    }

    try {
        const body = JSON.parse(event.body);

        // Updated to use the active gemini-3.8-flash model endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();

        if (!response.ok) {
            console.error("Google Gemini API Error:", JSON.stringify(data));
            return { statusCode: response.status, body: JSON.stringify(data) };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Serverless Function Error:", error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: error.message || 'Failed to connect to the Astral Plane' }) 
        };
    }
};