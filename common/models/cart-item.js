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

  CartItem.addcartItem = async (quantity, productId, cartid) => {
    const Cart = await app.models.Cart.findById(cartid);
    const product = await app.models.Product.findById(productId);
    const cartItem = await CartItem.findOne({ where: { cartId: cartid, productId: productId } });

    if (quantity < 1) {
      throw new Error('Quantity should be more than zero.', preconditionFailed);
    }

    if (cartItem) {
      Cart.totalSum -= cartItem.totalSum;
      cartItem.quantity += quantity;
      CartItem.totalSum = product.price * cartItem.quantity;
      Cart.totalSum += CartItem.totalSum;
      await cartItem.save();
      await Cart.save();
    
      return 'cartItem has been added';
    } else {
      const totalSum = product.price * quantity;
      await CartItem.create({
        quantity: quantity,
        totalSum: totalSum,
        productId: productId,
        cartId: cartid
      });
      return 'cartItem has been created';
    }
  };

  CartItem.remoteMethod('addcartItem', {
    description: 'add cartItem',
    accepts: [{ arg: 'quantity', type: 'Number', },
              { arg: 'productId', type: 'string' },
              { arg: 'cartid', type: 'string' }],
    returns: { arg: 'message', type: 'string' },
    http: { verb: 'post' }
  });
};