module.exports = (user) => {
  user.afterRemote('create', async (ctx) => {
    await app.models.Cart.create({
      userId: ctx.result.id
    });
  });
};