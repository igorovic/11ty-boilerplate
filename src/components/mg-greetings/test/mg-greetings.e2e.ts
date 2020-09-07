import { newE2EPage } from '@stencil/core/testing';

describe('mg-greetings', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mg-greetings></mg-greetings>');

    const element = await page.find('mg-greetings');
    expect(element).toHaveClass('hydrated');
  });
});
