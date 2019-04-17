module.exports = (user) => {
  user.afterRemote('create', async (ctx) => {
    await user.app.models.Cart.create({
      userId: ctx.result.id
    });
  });
};