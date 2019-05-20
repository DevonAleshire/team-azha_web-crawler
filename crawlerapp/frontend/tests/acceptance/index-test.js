import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dashboard', function(hooks) {
  setupApplicationTest(hooks);

  //Visiting default path Index
  test('visiting index default transitions to dashboard', async function(assert) {
    await visit('/');
    assert.equal(currentURL(), '/dashboard', 'Incorrect default url');
  });
});
