import { NextResponse } from "next/server";

const serverTimeout = parseInt(process.env.SERVER_TIMEOUT || '', 10) || 12000;
const inferenceApiUrl = process.env.INFERENCE_API_URL;
const queryApiUrl = process.env.QUERY_API_URL;

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json([{ error: 'Query is required and must be a non-empty string' }], { status: 400 })
        }

        if (!inferenceApiUrl || !queryApiUrl) {
            console.error("Inference API URL or Query API URL is not set");
            return NextResponse.json([{ error: 'Inference API URL and/or Query API URL is not set' }], { status: 500 })
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
            return NextResponse.json([{ error: errorResponse || 'Error from inference API' }], { status: 500 })
        }

        const inferenceJsonResponse = await inferenceResponse.json();

        if (!inferenceJsonResponse.parsed_query) {
            console.error("Inference response is missing parsed_query field", inferenceJsonResponse);
            return NextResponse.json([{ error: 'Data missing some fields from inference API' }], { status: 500 })
        }

        const queryResponse = await fetch(queryApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inferenceJsonResponse.parsed_query),
            signal: AbortSignal.timeout(serverTimeout)
        })

        if (!queryResponse.ok) {
            const errorResponse = await queryResponse.text();
            console.error("Error from query API:", errorResponse);
            return NextResponse.json([{ error: errorResponse || 'Error from query API' }], { status: 500 })
        }

        const queryJsonResponse = await queryResponse.json();
        if (!queryJsonResponse || !Array.isArray(queryJsonResponse)) {
            console.error("Query response is not an array:", queryJsonResponse);
            return NextResponse.json([{ error: 'Query response is not an array' }], { status: 500 })  
        }

        if(!queryJsonResponse.length) {
            console.error("Query response is empty:", queryJsonResponse);
            return NextResponse.json([{ error: '0 results. Review your query and be more specific.' }], { status: 500 })
        }

        return NextResponse.json({content: queryJsonResponse, stats:inferenceJsonResponse}, { status: 200 })
    }
    catch (error: unknown) {
        console.error("Error parsing JSON:", error);
        return NextResponse.json([{ error: 'Something went wrong' }], { status: 500 })
    }
}