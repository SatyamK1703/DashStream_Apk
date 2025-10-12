function normalizeResponse(response) {
  let bookingPayload = null;
  if (response.data && typeof response.data === 'object') {
    if (!Array.isArray(response.data) && ('_id' in response.data || 'id' in response.data)) {
      bookingPayload = response.data;
    }
    if (!bookingPayload && response.data.booking) {
      bookingPayload = response.data.booking;
    }
    if (!bookingPayload && response.data.data) {
      const maybe = response.data.data;
      if (maybe && (maybe._id || maybe.id || maybe.booking)) {
        bookingPayload = maybe.booking ?? maybe;
      }
    }
  }
  if (!bookingPayload && response.booking) bookingPayload = response.booking;
  if (bookingPayload) {
    return {
      ...response,
      data: bookingPayload,
    };
  }
  return response;
}

const samples = [
  { status: 'success', data: { _id: '1', bookingId: 'B1' } },
  { status: 'success', booking: { _id: '2', bookingId: 'B2' } },
  { status: 'success', data: { booking: { _id: '3', bookingId: 'B3' } } },
  { status: 'success', data: { data: { _id: '4', bookingId: 'B4' } } },
  { status: 'success', data: { results: 1 } },
];

samples.forEach((s, i) => {
  const out = normalizeResponse(s);
  console.log(i, '->', out.data && out.data.bookingId ? out.data.bookingId : (out.data && out.data._id) || null);
});
