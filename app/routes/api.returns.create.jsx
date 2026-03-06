import { json } from "@remix-run/node";
import prisma from "../db.server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}

export async function loader() {
  return json(
    { error: "Method not allowed" },
    { status: 405, headers: corsHeaders() },
  );
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

    const existingReturn = await prisma.returnRequest.findFirst({
      where: {
        orderId,
        status: {
          in: [
            "pending",
            "approved",
            "in_progress",
            "pickup_requested",
            "pickup_scheduled",
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingReturn) {
      return json(
        {
          success: false,
          error: "A return request already exists for this order",
          returnRequest: existingReturn,
        },
        { status: 409, headers: corsHeaders() },
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
      { status: 201, headers: corsHeaders() },
    );
  } catch (error) {
    console.error("Error creating return request:", error);

    return json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
