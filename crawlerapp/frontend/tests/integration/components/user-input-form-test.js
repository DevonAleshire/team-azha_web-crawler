import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | user-input-form', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    await render(hbs`{{user-input-form model=model}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#user-input-form}}
        template block text
      {{/user-input-form}}`);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });

  test('user-input-form form submit', async function(assert){
    
    this.set('url', 'url');
    this.set('searchMethod', 'dfs');
    this.set('depth', '10');
    this.set('keyword', 'key');
    await render(hbs`{{user-input-form model=model}}`);
    await click('.btn')

    assert.equal(this.get('url'), '');
  });
});
