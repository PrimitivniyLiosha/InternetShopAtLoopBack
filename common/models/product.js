module.exports = (Product) => {
  function Error (message, statusCode) {
    this.message = message;
    this.statusCode = statusCode;
  }
    
  const preconditionFailed = 412;

  Product.beforeRemote('create', async (ctx) => {
    if (ctx.args.data && ctx.args.data.price < 1) {
      throw new Error('Price should be more than zero.', preconditionFailed);
    }
  });
  
  Product.observe('before save', async (ctx) => {
    if (ctx.data && ctx.data.price < 1) {
      throw new Error('Price should be more than zero.', preconditionFailed);
    }
  });

  Product.observe('after save', async (ctx) => {
    const cartItem = await app.models.CartItem.find({ where: { productId: ctx.instance.id } });
    if (cartItem) {
      for (let item of cartItem) {
        if (item.cartId !== null) {
          const cart = await app.models.Cart.findById(item.cartId);
          cart.totalSum -= item.totalSum;
          item.totalSum = item.quantity * ctx.instance.price;
          cart.totalSum += item.totalSum;
      
          await item.save();
          await cart.save();
        }
      }
    }
  });
};