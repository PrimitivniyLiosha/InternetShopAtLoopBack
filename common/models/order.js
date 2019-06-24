module.exports = (Order) => {
  Order.createOrder = async (userId) => {
    const cart = await app.models.Cart.findOne({ where: { userId: userId } });
    const cartItem = await app.models.CartItem.find({ where: { cartId: cart.id } });
    const user = await app.models.user.findById(userId);
    const order = await Order.create({
      totalSum: cart.totalSum,
      ownerId: user.id
    });

    await app.models.Email.send({
      to: 'lex.frol2020@gmail.com',
      from: '',
      subject: 'Zakusochnaya',
      html: `Hello,${user.username},Thanks for buying in our shop.TotalSum of you order is ${order.totalSum}`
    });

    for (let item of cartItem) {
      item.orderId = order.id;
      item.cartId = null;

      await item.save();
    }

    cart.totalSum = 0;

    await cart.save();

    return 'order has been created';
  };
  
  Order.remoteMethod('createOrder', {
    description: 'Create Order',
    accepts: { arg: 'userId', type: 'string' },
    returns: { arg: 'message', type: 'string' },
    http: { verb: 'post' }
  });
};