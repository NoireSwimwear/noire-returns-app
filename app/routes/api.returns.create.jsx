import { json } from "@remix-run/node";
import prisma from "../db.server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}

export async function action({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== "POST") {
    return json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders() },
    );
  }

  try {
    const body = await request.json();
    const { orderId, reason, customerEmail } = body;

    if (!orderId) {
      return json(
        { error: "Missing orderId" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        reason: reason || null,
        customerEmail: customerEmail || null,
        status: "pending",
      },
    });

    return json(
      {
        success: true,
        returnRequest,
      },
      { headers: corsHeaders() },
    );
  } catch (error) {
    console.error("Error in /api/returns/create:", error);

    return json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
