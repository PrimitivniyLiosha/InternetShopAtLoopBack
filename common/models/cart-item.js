module.exports = (Cartitem) => {
  Cartitem.observe('before save', async (ctx) => {
    const product = await Cartitem.app.models.Product.findById(ctx.instance.productId);
    if (!product.isAvailable) {
      const error = new Error();
      error.status = 412;
      error.message = 'The product is out of stock';
      throw error;
    }
  });
};