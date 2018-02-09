import DS from 'ember-data';
const { attr, belongsTo } = DS;

export default DS.Model.extend({
  name: attr(),
  description: attr(),
  // markup: belongsTo('css-markup'),
  // css: belongsTo('css', { async: false, inverse: 'csses' }),
});