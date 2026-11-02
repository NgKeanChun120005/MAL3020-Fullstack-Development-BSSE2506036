// emitter.js is responsible for emitting events to connected clients via Socket.IO.
// It provides functions to emit new orders and order status updates to specific rooms.

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

// Emits a new order event to the 'kitchen' room, notifying kitchen staff of a new order.
function emitNewOrder(order) {
  if (!ioInstance) return;
  ioInstance.to('kitchen').emit('order:new', {
    _id: order._id,
    customerId: order.customerId,
    items: order.items,
    total: order.total,
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt
  });
}

// Emits an order status update event to the specific order room, notifying relevant clients of the status change.
function emitOrderStatus(order) {
  if (!ioInstance) return;
  ioInstance.to(`order:${order._id}`).emit('order:status', {
    _id: order._id,
    status: order.status,
    updatedAt: order.updatedAt
  });
}

module.exports = { setIO, emitNewOrder, emitOrderStatus };