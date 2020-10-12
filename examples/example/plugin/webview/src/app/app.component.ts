import { Component } from '@angular/core';
import { RemixApi } from '@remixproject/plugin-api';
import { createClient } from '@remixproject/plugin-webview';

@Component({
  selector: 'engine-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'example-plugin-webview';
  ngOnInit() {
    const client = createClient<any, RemixApi>();
    client.onload(() => {
      console.log('Client connected to engine');
      client.on('theme', 'themeChanged', (theme) => console.log('theme', theme));
    });
  }
}
