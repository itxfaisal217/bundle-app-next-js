// src/pages/api/proxy.js
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "dummy",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "dummy",
  adminApiAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  isCustomStoreApp: true,
  apiVersion: LATEST_API_VERSION,
  hostName: process.env.SHOPIFY_STORE_DOMAIN.replace(/^https?:\/\//, ""),
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { body } = req;
    let { query, variables } = body;

    // sanitize variables
    variables = variables || {};

    if (variables.input && Array.isArray(variables.input.components)) {
      variables.input.components = variables.input.components.map((component) => {
        if (
          component.optionSelections == null ||
          !Array.isArray(component.optionSelections) ||
          component.optionSelections.length === 0
        ) {
          delete component.optionSelections;
        }
        return component;
      });
    }

    console.log("➡️ Query:", query);
    console.log("➡️ Variables:", JSON.stringify(variables, null, 2));

    const client = new shopify.clients.Graphql({
      session: {
        shop: process.env.SHOPIFY_STORE_DOMAIN,
        accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
      }
    });

    const response = await client.request(query, { variables });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: error.message, stack: error.stack });
  }
}
