import { Context, HttpRequest } from "@azure/functions";
import { withCorrelationContext } from "../shared/appinsights";

export default withCorrelationContext(async (context: Context, req: HttpRequest): Promise<void> => {
  context.log('HTTP trigger function processed a request.');
  const name = (req.query.name || (req.body && req.body.name));
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
  context.log(`function context.traceContext: ${JSON.stringify(context.traceContext)}`);
  // context.log(`appInsights.getCorrelationContext(): ${JSON.stringify(appInsights.getCorrelationContext())}`);
  if (req.method === "OPTIONS") {
    if (req.headers["webhook-request-origin"] === undefined) {
      context.log("Error during validation.");
    }
    context.res = {
      headers: {
        'Webhook-Allowed-Origin': req.headers["webhook-request-origin"],
        'WebHook-Allowed-Rate': '*'
      }
    };
  } else {
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: responseMessage
    };
  }
});
