import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mg-greetings',
  styleUrl: 'mg-greetings.css',
  shadow: false,
})
export class MgGreetings {

  render() {
    return (
      <Host>
        <div class="text-purple-600">Hello there</div>
      </Host>
    );
  }

}
