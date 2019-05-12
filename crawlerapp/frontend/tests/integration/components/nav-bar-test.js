import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | nav-bar', function(hooks) {
  setupRenderingTest(hooks);
  const componentTextContent = 'Team Azha Web Crawler\n      \n        About';
  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{nav-bar}}`);
    assert.equal(this.element.textContent.trim(), componentTextContent);

    // Template block usage:
    // await render(hbs`
    //   {{#nav-bar}}
    //   temp block text
    //   {{/nav-bar}}
    // `);

    // assert.equal(this.element.textContent.trim(), componentTextContent);
  });
});
