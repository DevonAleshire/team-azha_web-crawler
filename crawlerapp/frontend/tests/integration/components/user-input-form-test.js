import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | user-input-form', function (hooks) {
  setupRenderingTest(hooks);

  test('user-input-form renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    //ACT
    await render(hbs`{{user-input-form}}`);

    assert.equal(this.element.textContent.trim(), '');
  });

  test('Pending Implementation', async function (assert) {
    // Template block usage:
    // await render(hbs`
    //     {{#user-input-form}}
    //       template block text
    //     {{/user-input-form}}`);

    // assert.equal(this.element.textContent.trim(), 'template block text');
    assert(false, true);
  })

  //TODO: Figure out how to mock transitionTo ?
  test('user-input-form form submit', async function (assert) {

    this.set('url', 'url');
    this.set('searchMethod', 'dfs');
    this.set('depth', '10');
    this.set('keyword', 'key');
    await render(hbs`{{user-input-form model=model}}`);
    await click('.btn')

    assert.equal(this.get('url'), '');
  });
});
