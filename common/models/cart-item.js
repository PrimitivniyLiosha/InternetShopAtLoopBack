module.exports = (CartItem) => {
  function Error (message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
  }

  const preconditionFailed = 412;

  CartItem.beforeRemote('create', async (ctx) => {
    if (ctx.args.data && ctx.args.data.quantity >= 1) {
      const product = await app.models.Product.findById(ctx.args.data.productId);
      ctx.args.data.totalSum = product.price * ctx.args.data.quantity;

      if (!product.isAvailable || ctx.args.data.quantity < 1) {
        throw new Error('Product unavailable or indicated unacceptable quantity.', preconditionFailed);
      }
    }
  });

  CartItem.observe('before save', async (ctx) => {
    if (ctx.instance && ctx.instance.quantity >= 1) {
      const product = await app.models.Product.findById(ctx.instance.productId);
      ctx.instance.totalSum = product.price * ctx.instance.quantity;

      if (!product.isAvailable) {
        throw new Error('Product is out of stock.', preconditionFailed);
      }

      const cart = await app.models.Cart.findById(ctx.instance.cartId);
      cart.totalSum += ctx.instance.totalSum;
      await cart.save();
    } else if (ctx.instance && ctx.instance.quantity < 1) {
      throw new Error('Quantity should be more than zero.', preconditionFailed);
    }
    
    if (ctx.currentInstance && ctx.currentInstance.quantity >= 1) {
      const product = await app.models.Product.findById(ctx.currentInstance.productId);
      ctx.data.totalSum = product.price * ctx.data.quantity;
      
      if (!product.isAvailable) {
        throw new Error('Product is out of stock.', preconditionFailed);
      }
      if (ctx.data.quantity < 1) {
        throw new Error('Quantity should be more than zero.', preconditionFailed);
      }

      const cart = await app.models.Cart.findById(ctx.currentInstance.cartId);
      cart.totalSum -= ctx.currentInstance.totalSum;
      cart.totalSum += product.price * ctx.data.quantity;
      await cart.save();
    }
  });

  CartItem.delById = async (CartItemId) => {
    const Cart = app.models.Cart;
    const cartItem = await CartItem.findById(CartItemId);

    const cart = await Cart.findById(cartItem.cartId);
    cart.totalSum -= cartItem.totalSum;

    await CartItem.destroyById(CartItemId);
    await cart.save();
    
    return 'cartItem has been deleted';
  };

  CartItem.remoteMethod('delById', {
    description: 'delete cartItem',
    accepts: { arg: 'CartItemId', type: 'string' },
    returns: { arg: 'message', type: 'string' },
    http: { verb: 'delete' }
  });
};