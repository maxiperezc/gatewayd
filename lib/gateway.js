var nconf = require('../config/nconf');
var cold_wallet_address = nconf.get('gateway_cold_wallet');
var hot_wallet = nconf.get('gateway_hot_wallet');

var api = require("ripple-gateway-data-sequelize-adapter");

/**
* Record the deposit of an asset
*
* @param {string} currency
* @param {decimal} amount 
* @param {intenger} external_account_id 
* @param {function(err, deposit)} callback
* @returns {Deposit}
*/

function recordDeposit(opts, fn) {

  api.externalTransactions.create({
    external_account_id: opts.external_account_id,
    currency: opts.currency,
    amount: opts.amount,
    deposit: true,
    status: 'queued'
  }, fn); 

}

/**
* Finalize a deposit after processing
*
* @param {integer} id
* @param {integer} ripple_transaction_id 
* @param {function(err, deposit)} callback
* @returns {Deposit}
*/

function finalizeDeposit(opts, fn) {

  api.externalTransactions.update({ 
    id: opts.id,
    ripple_transaction_id: opts.ripple_transaction_id,
    status: "processed"
  }, fn);

}

/**
* List unprocessed deposits
*
* @param {function(err, deposit)} callback
* @returns [Deposit]
*/

function listQueuedDeposits(fn) {

  api.externalTransactions.readAll({
    deposit: true,
    status: 'queued'
  }, fn);

}

/**
* Add a payment to the outgoing queue
*
* @param {string} to_currency 
* @param {decimal} to_amount
* @param {integer} ripple_transaction_id 
* @param {function(err, deposit)} callback
* @returns [Deposit]
*/

function enqueueOutgoingPayment(opts, fn) {
 
  api.rippleTransactions.create({
    to_amount: opts.to_amount,
    to_currency: opts.to_currency,
    to_issuer: cold_wallet_address,
    from_amount: opts.to_amount,
    from_currency: opts.to_currency,
    from_issuer: cold_wallet_address,
    to_address_id: opts.to_address_id,
    from_address_id: 2,
    transaction_state: 'outgoing'
  }, fn);
    
}

module.exports = {
  deposits: {
    record: recordDeposit,
    listQueued: listQueuedDeposits,
    finalize: finalizeDeposit 
  },
  withdrawals: {

  },
  payments: {
    enqueueOutgoing: enqueueOutgoingPayment
  }
} 
