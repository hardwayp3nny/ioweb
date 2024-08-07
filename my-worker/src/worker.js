addEventListener('fetch', event => {
  const { request } = event;
  const { url, method } = request;

  if (url.endsWith('/data/processor-data') && method === 'GET') {
    return event.respondWith(handleGetRequest());
  } else if (url.endsWith('/data/mining-data') && method === 'PUT') {
    return event.respondWith(handlePutRequest(request));
  } else {
    return event.respondWith(new Response('Not found', { status: 404 }));
  }
});

async function handleGetRequest() {
  try {
    const value = await MINING_DATA.get('trend', { type: 'json' });
    return new Response(JSON.stringify(value), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (err) {
    return new Response('Error fetching data', {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}

async function handlePutRequest(request) {
  try {
    const body = await request.json();
    await MINING_DATA.put('trend', JSON.stringify(body));
    return new Response('Data saved', {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (err) {
    return new Response('Error saving data', {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
}
