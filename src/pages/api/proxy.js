import fetch from "node-fetch";

export default async function handler(req, res) {
  const { method, body } = req;

  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Always hit GraphQL endpoint for bundles
    const url = `https://learning-faisal-217.myshopify.com/admin/api/2024-07/graphql.json`;

    const response = await fetch(url, {
      method: "POST", // GraphQL is always POST
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      },
      body: JSON.stringify(body), // body should contain { query, variables }
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("JSON parse error:", responseText);
      throw e;
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
