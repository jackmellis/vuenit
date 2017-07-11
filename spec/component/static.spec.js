import test from 'ava-spec';
import sinon from 'sinon';
import vuenit from '../../lib';

test('it should render a static component', t => {
  let C = {
    template : '<div><button><i>foo</i></button></div>'
  };
  let vm = vuenit.mount(C);

  let {$html} = vm;
  let containsButton = vm.$contains('button');

  t.truthy($html);
  t.is($html, '<div><button><i>foo</i></button></div>');
  t.true(containsButton);
});
