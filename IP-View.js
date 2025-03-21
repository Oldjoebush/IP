// This code assumes that you have a KV namespace called 'VISITOR_LOGS' set up.

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url);
    
    // If the request is to view the logs, fetch and display them
    if (url.pathname === '/view-logs') {
        const log = await VISITOR_LOGS.get('visitor-log', 'text');
        
        if (log) {
            return new Response(log, { status: 200, headers: { 'Content-Type': 'text/plain' } });
        } else {
            return new Response('No logs found.', { status: 404 });
        }
    }

    // For all other requests, log the visitor IP
    const ip = request.headers.get('CF-Connecting-IP');

    // Get the existing logs from Workers KV
    let log = await VISITOR_LOGS.get('visitor-log', 'text');

    // If no logs exist, initialize it as an empty string
    if (!log) {
        log = '';
    }

    // Append the new IP address and timestamp to the logs
    const newLog = `${log}IP: ${ip} - Date: ${new Date().toISOString()}\n`;

    // Save the updated logs back to Workers KV
    await VISITOR_LOGS.put('visitor-log', newLog);

    // Return a basic response
    return new Response('IP Logged');
}
