/* eslint-disable no-console */
import { module, test } from 'qunit';
import { setupTest, setupRenderingTest } from 'ember-qunit';
import { click, fillIn, visit } from 'ember-test-helpers';

module('Unit | Route | dashboard', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:dashboard');
    assert.ok(route);
  });
});

module('Render test', function (hooks) {
  setupRenderingTest(hooks);
  //Search-request submit
  test('Search request is added to the request table', async function (assert) {
    await visit('/dashboard');
    await fillIn('#search-url', 'https://oregonstate.edu/');
    await click('button.btn')
    //TODO: Fix Fail
    assert.equal(this.element.querySelector('request-url').textContent, 'https://oregonstate.edu/', 'Stored url should match search request');
  })

})
