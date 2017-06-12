const require_all = require('require-all');

/** @factory
 *  @description search for all Models and expose them
 */
module.exports = require_all({
  dirname     :  __dirname,
  filter      :  /(.+Model)\.js$/,
});