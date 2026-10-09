exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Grab the hidden key from Netlify's environment variables
    const API_KEY = process.env.GEMINI_API_KEY;
    const body = JSON.parse(event.body);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed to connect to the Astral Plane' }) 
        };
    }
};