module.exports = (user) => {
  user.afterRemote('create', async (ctx) => {
    return await user.app.models.Cart.create({
      userId: ctx.result.id
    });
  });
};