import { json } from "@remix-run/node";
import prisma from "../db.server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
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

  return json(
    { error: "Method not allowed" },
    { status: 405, headers: corsHeaders() },
  );
}

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId) {
      return json(
        { error: "Missing orderId" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const returnRequest = await prisma.returnRequest.findFirst({
      where: {
        orderId: String(orderId),
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

    return json(
      {
        hasReturnInProgress: Boolean(returnRequest),
        orderId,
      },
      { headers: corsHeaders() },
    );
  } catch (error) {
    console.error("Error in api.returns.check:", error);

    return json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
