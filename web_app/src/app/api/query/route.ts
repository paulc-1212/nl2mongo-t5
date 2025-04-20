import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        console.log("Query:", query);
        if (!query) {
            return NextResponse.json({ error: 'Query is required and must be a non-empty string' }, { status: 400 })
        }

        const inferenceApiUrl = process.env.INFERENCE_API_URL;
        const serverTimeout = parseInt(process.env.SERVER_TIMEOUT || '', 10) || 12000;
        if (!inferenceApiUrl) {
            return NextResponse.json({ error: 'Inference API URL is not set' }, { status: 500 })
        }

        const inferenceResponse = await fetch(inferenceApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nlq: query }),
            signal: AbortSignal.timeout(serverTimeout)
        })

        if (!inferenceResponse.ok) {
            const errorResponse = await inferenceResponse.text();
            console.error("Error from inference API:", errorResponse);
            return NextResponse.json({ error: errorResponse || 'Error from inference API' }, { status: 500 })
        }

        const jsonResponse = await inferenceResponse.json();
        return NextResponse.json(jsonResponse, { status: 200 })
    }
    catch (error: any) {
        console.error("Error parsing JSON:", error.message);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}