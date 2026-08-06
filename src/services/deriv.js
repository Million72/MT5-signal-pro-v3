const WS_URL = 'wss://ws.binaryws.com/websockets/v3?app_id=1089';

let socket = null;
let subscriptions = {};
let candleCallbacks = {};
let reconnectTimer = null;

export function connectDeriv() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('[Deriv] Connected');
    // Resubscribe all
    Object.keys(subscriptions).forEach(symbol => {
      subscribeCandles(symbol, subscriptions[symbol].callback);
    });
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.error) {
      console.error('[Deriv] Error:', data.error.message);
      return;
    }

    // Handle candle response
    if (data.msg_type === 'candles' || data.msg_type === 'ohlc') {
      const symbol = data.echo_req?.ticks_history || data.echo_req?.ticks;
      if (symbol && candleCallbacks[symbol]) {
        const candles = data.candles || data.ohlc?.candles || [];
        candleCallbacks[symbol](candles);
      }
    }

    // Handle tick subscription
    if (data.msg_type === 'tick') {
      const symbol = data.tick?.symbol;
      if (symbol && candleCallbacks[symbol]) {
        // We aggregate ticks into 1-min candles ourselves
        // This is a simplified version
      }
    }

    // Handle subscription confirmation
    if (data.msg_type === 'candles') {
      console.log('[Deriv] Subscribed to candles');
    }
  };

  socket.onclose = () => {
    console.log('[Deriv] Disconnected');
    reconnectTimer = setTimeout(connectDeriv, 5000);
  };

  socket.onerror = (err) => {
    console.error('[Deriv] Socket error');
  };
}

export function subscribeCandles(symbol, callback) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    subscriptions[symbol] = { callback };
    connectDeriv();
    return;
  }

  subscriptions[symbol] = { callback };
  candleCallbacks[symbol] = callback;

  socket.send(JSON.stringify({
    ticks_history: symbol,
    granularity: 60, // 1 minute
    count: 100,
    end: 'latest',
    style: 'candles',
    subscribe: 1,
  }));
}

export function disconnectDeriv() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (socket) socket.close();
  socket = null;
  subscriptions = {};
  candleCallbacks = {};
    }
