module.exports = (Cart) => {
  Cart.deleteCartItems = async (cartid) => {
    const Cart = await app.models.Cart;
    const cart = await Cart.findById(cartid);

    cart.totalSum = 0;
    await cart.save();

    await app.models.CartItem.destroyAll({ cartId: cartid });
    return 'cartItems has been deleted';
  };

  Cart.remoteMethod('deleteCartItems', {
    description: 'delete CartItems on Cart',
    accepts: { arg: 'cartid', type: 'string' },
    returns: { arg: 'message', type: 'string' },
    http: { verb: 'delete' }
  });
};