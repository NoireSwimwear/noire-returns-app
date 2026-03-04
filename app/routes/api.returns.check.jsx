import { json } from "@remix-run/node";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
  };
}

// 🔥 PRE-FLIGHT
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

// 🔥 GET
export async function loader({ request }) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    return json(
      { error: "Missing orderId" },
      { status: 400, headers: corsHeaders() },
    );
  }

  // 👇 TEMP TEST (ca sa vedem ca merge)
  return json({ hasReturnInProgress: true }, { headers: corsHeaders() });
}
