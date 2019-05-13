/* eslint-disable no-console */
import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | dashboard', function(hooks) {
  setupApplicationTest(hooks);//Set up test context

  //Visiting /dashboard
  test('visiting /dashboard', async function(assert) {
    await visit('/dashboard');
    assert.equal(currentURL(), '/dashboard', 'Incorrect url');
  });
});
