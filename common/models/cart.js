module.exports = (Cart) => {
  Cart.deleteCartItems = async (cartid) => {
    const Cart = await app.models.Cart;
    const cartItem = await app.models.CartItem.find({ where: { cartId: cartid } });
    const cart = await Cart.findById(cartid);

    for (let item of cartItem) {
      cart.totalSum -= item.totalSum;
      await cart.save();
    }

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