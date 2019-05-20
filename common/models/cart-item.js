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
    if (ctx.currentInstance.quantity >= 1) {
      const product = await app.models.Product.findById(ctx.currentInstance.productId);
      ctx.currentInstance.totalSum = product.price * ctx.currentInstance.quantity;

      if (!product.isAvailable) {
        throw new Error('Product is out of stock.', preconditionFailed);
      }
    } else if (ctx.currentInstance.quantity < 1) {
      throw new Error('Quantity should be more than zero.', preconditionFailed);
    }

    if (ctx.data && ctx.data.quantity >= 1) {
      const product = await app.models.Product.findById(ctx.data.productId);
      ctx.data.totalSum = product.price * ctx.data.quantity;

      if (!product.isAvailable) {
        throw new Error('Product is out of stock.', preconditionFailed);
      }
    } else if (ctx.data && ctx.data.quantity < 1) {
      throw new Error('Quantity should be more than zero.', preconditionFailed);
    }
  });
};