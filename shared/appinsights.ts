import * as appInsights from 'applicationinsights';
appInsights.setup(process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"])
    .setAutoDependencyCorrelation(true)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C);
// appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = process.env.WEBSITE_SITE_NAME || 'Web';
// If running in Azure App service or Azure functions the SDK will automatically populate the cloud role when following code is added:
appInsights.defaultClient.setAutoPopulateAzureProperties(true);
appInsights.start();

export function withCorrelationContext(httpTriggerFunction) {
    // Default export wrapped with Application Insights FaaS context propagation
    return async (context, req) => {
        context.log(`wrapper req: ${JSON.stringify(req)}`);
        context.log(`wrapper context.traceContext: ${JSON.stringify(context.traceContext)}`);
        context.log(`wrapper appInsights.getCorrelationContext(): ${JSON.stringify(appInsights.getCorrelationContext())}`);
        // Start an AI Correlation Context using the provided Function context
        const correlationContext = appInsights.startOperation(context, req);
        context.log(`wrapper appInsights.startOperation(context, req): ${JSON.stringify(correlationContext)}`);
        context.log(`wrapper appInsights.getCorrelationContext(): ${JSON.stringify(appInsights.getCorrelationContext())}`);
        // Wrap the Function runtime with correlationContext
        return appInsights.wrapWithCorrelationContext(async () => {
            // Run the Function
            const result = await httpTriggerFunction(context, req);
            appInsights.defaultClient.flush();
            return result;
        }, correlationContext)();
    };
}