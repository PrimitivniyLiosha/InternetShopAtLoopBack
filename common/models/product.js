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
      throw new Error('Quantity should be more than zero.', preconditionFailed);
    }
  });

  Product.observe('after save', async (ctx) => {
    const cartItem = await app.models.CartItem.find({ where: { productId: ctx.instance.id } });
    if (cartItem) {
      for (let i = 0; i < cartItem.length; i++) {
        const value = cartItem[i];
        const cart = await app.models.Cart.findById(value.cartId);
          
        cart.totalSum -= value.totalSum;
        value.totalSum = value.quantity * ctx.instance.price;
        cart.totalSum += value.totalSum;
  
        await value.save();
        await cart.save();
      }
    }
  });
};