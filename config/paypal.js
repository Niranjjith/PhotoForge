import paypal from "@paypal/checkout-server-sdk";

// PayPal Client ID and Secret from environment variables
const clientId = process.env.PAYPAL_CLIENT_ID || "AXJNJlnWdCi3zsB4ABAu4JvjZk_8sIK_jGXKeUP2CLr8_ZkG6yNXSGYn1VvrBOwvFfZNFVuRECwOfDh7";
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "EMcPbxzxggFxhor2oBOx1VjF9_NUnkmyRDcLAzwWZp5CpD5XzM-CvHK1J9HEyV7jUCh5NuYeBWx4pKWo";

// Use sandbox environment (change to production for live)
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
// For production, use:
// const environment = new paypal.core.LiveEnvironment(clientId, clientSecret);

const client = new paypal.core.PayPalHttpClient(environment);

export default client;

