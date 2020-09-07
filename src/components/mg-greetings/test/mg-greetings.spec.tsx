import { newSpecPage } from '@stencil/core/testing';
import { MgGreetings } from '../mg-greetings';

describe('mg-greetings', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MgGreetings],
      html: `<mg-greetings></mg-greetings>`,
    });
    expect(page.root).toEqualHtml(`
      <mg-greetings>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mg-greetings>
    `);
  });
});
