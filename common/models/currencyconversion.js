module.exports = (CurrencyConversion) => {
  CurrencyConversion.observe('loaded', async (ctx) => {
    const request = require('request-promise-native');
    await request.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json', (error, responce, body) => {
      if (ctx.data.price) {
        ctx.data.price *= JSON.parse(body)[0].rate;
      } else if (ctx.data.totalSum) {
        ctx.data.totalSum *= JSON.parse(body)[0].rate;
        ctx.data.totalSum = Math.round(ctx.data.totalSum);
      }
    });
  });
};