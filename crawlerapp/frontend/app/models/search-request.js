import DS from 'ember-data';

export default DS.Model.extend({
    url: DS.attr('string'),
    searchMethod: DS.attr('string'),
    depth: DS.attr('number'),
    keyword: DS.attr('string'),
});
