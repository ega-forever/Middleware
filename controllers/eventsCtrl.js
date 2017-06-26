const _ = require('lodash'),
  utils = require('web3/lib/utils/utils.js'),
  mongoose = require('mongoose');

/**
 * @module events Controller
 * @description initialize all events for smartContracts,
 * @param contracts - instances of smartContracts
 * @param web3 - initialized web3 instance
 * and prepare collections in mongo for them
 * @returns {{eventModels, signatures}}
 */

module.exports = (contracts, web3) => {

  let eventModels = _.chain(contracts)
    .map(value => //fetch all events
      _.chain(value).get('abi')
        .filter({type: 'event'})
        .value()
    )
    .flatten()
    .uniqBy('name') //remove duplicates
    .transform((result, ev) => { //build mongo model, based on event definition from abi
      result[ev.name] = mongoose.model(ev.name, new mongoose.Schema(
        _.chain(ev.inputs)
          .transform((result, obj) => {
            result[obj.name] = {
              type: new RegExp(/uint/).test(obj.type) ?
                Number : mongoose.Schema.Types.Mixed
            };
          }, {})
          .merge({
            network: {type: String},
            created: {type: Date, required: true, default: Date.now}
          })
          .value()
      ));
    }, {})
    .value();

  let signatures = _.chain(contracts) //transform event definition to the following object {encoded_event_signature: event_definition}
    .values()
    .map(c => c.abi)
    .flattenDeep()
    .filter({type: 'event'})
    .transform((result, ev) => {
      result[web3.sha3(utils.transformToFullName(ev))] = ev;
    }, {})
    .value();

  return {eventModels, signatures};

};