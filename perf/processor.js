module.exports = {
  smallRequest: function (context, ee, next) {
    context.vars = context.vars || {};

    context.vars.baseCurrency = "USD";
    context.vars.counterCurrency = "ARS";
    context.vars.baseAccountId = "client-base";
    context.vars.counterAccountId = "client-counter";
    context.vars.baseAmount = 10;
    context.vars.extraPayload = "x".repeat(2000);

    return next();
  },

  largeRequest: function (context, ee, next) {
    context.vars = context.vars || {};

    context.vars.baseCurrency = "USD";
    context.vars.counterCurrency = "ARS";
    context.vars.baseAccountId = "client-base";
    context.vars.counterAccountId = "client-counter";
    context.vars.baseAmount = 10;
    context.vars.extraPayload = "x".repeat(50000);

    return next();
  },
};
