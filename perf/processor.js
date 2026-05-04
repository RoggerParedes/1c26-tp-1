module.exports = {
  smallRequest: function (context, ee, next) {
    context.vars = context.vars || {};

    context.vars.baseCurrency = "USD";
    context.vars.counterCurrency = "ARS";
    context.vars.baseAccountId = 11;
    context.vars.counterAccountId = 10;
    context.vars.baseAmount = 100.0;
    context.vars.extraPayload = "x".repeat(2000);

    return next();
  },

  largeRequest: function (context, ee, next) {
    context.vars = context.vars || {};

    context.vars.baseCurrency = "USD";
    context.vars.counterCurrency = "ARS";
    context.vars.baseAccountId = 11;
    context.vars.counterAccountId = 10;
    context.vars.baseAmount = 1000.0;
    context.vars.extraPayload = "x".repeat(50000);

    return next();
  },
};
