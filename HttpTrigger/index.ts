import { Context, HttpRequest } from "@azure/functions";
import { EventGridPublisherClient, AzureKeyCredential } from "@azure/eventgrid";
import { withCorrelationContext } from '../shared/appinsights';

export default withCorrelationContext(async (context: Context, req: HttpRequest): Promise<void> => {
  context.log('HTTP trigger function processed a request.');
  const name = (req.query.name || (req.body && req.body.name));
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
  context.log(`function context.traceContext: ${JSON.stringify(context.traceContext)}`);
  // context.log(`appInsights.getCorrelationContext(): ${JSON.stringify(appInsights.getCorrelationContext())}`);
  
  const client = new EventGridPublisherClient(
    process.env["EVENTGRID_ENDPOINT"],
    "CloudEvent",
    new AzureKeyCredential(process.env["EVENTGRID_ACCESS_KEY"])
  );

  await client.send([
    {
      type: "azure.sdk.eventgrid.samples.cloudevent",
      source: "/azure/sdk/eventgrid/samples/sendEventSample",
      data: {
        message: "this is a sample event"
      },
    },
  ], {
    requestOptions: {
      customHeaders: {
        'ce-traceparent': context.traceContext.traceparent,
        'traceparent': context.traceContext.traceparent,
      }
    }
  });

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage
  };

});