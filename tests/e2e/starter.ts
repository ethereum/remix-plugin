import { NightwatchBrowser } from 'nightwatch'

export = {
  'test': (browser: NightwatchBrowser) => {
    browser
      .url('http://www.google.com')
      .waitForElementVisible('body', 3000)
      .assert.title('Google')
      .end()
  }
}
