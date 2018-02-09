import DS from 'ember-data';
const { hasMany } = DS;

export default DS.Model.extend({
  csses: hasMany('css', { async: false }) // TODO(Billy): make this async true after demo
});