/* eslint-env node */
'use strict';

module.exports = {
  name: 'google-fonts',

  isDevelopingAddon() {
    return true;
  },

  contentFor(type, config) {
    if (type === 'head') {
      return `
        <link href="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" rel="script">
        <link href="https://fonts.googleapis.com/css?family=Quicksand:500,700" rel="stylesheet">
      `;
    } else if (type === 'body-footer') {
      return `
        <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
        <script>
          WebFont.load({
            google: {
              families: ['Quicksand:500,700']
            }
          });
        </script>
      `;
    }
  }
};
