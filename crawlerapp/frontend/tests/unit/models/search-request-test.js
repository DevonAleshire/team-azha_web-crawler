import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop'

module('Unit | Model | search request', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('search-request', {});
    assert.ok(model);
  });

  //TODO: Check if this actually does anything
  test('Search-request record created accurately', function (assert) {
    //Lookup Store
    let store = this.owner.lookup('service:store');
    
    //Create Record
    const searchRequest = run(() => store.createRecord('search-request', {
          url: 'url',
          searchMethod: 'bfs',
          depth: '0',
          keyword: 'key'
      }));
    
    //Verify Created Model Properties
    assert.ok(searchRequest);
    assert.equal(searchRequest.get('url'), 'url');
    assert.equal(searchRequest.get('searchMethod'), 'bfs');
    assert.equal(searchRequest.get('depth'), '0');
    assert.equal(searchRequest.get('keyword'), 'key');
  });
});
