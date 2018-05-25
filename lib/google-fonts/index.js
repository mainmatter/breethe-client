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
        <link rel="preload" href="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js" as="script">
        <link rel="preload" href="https://fonts.googleapis.com/css?family=Quicksand:500,700" as="style">
        <link rel="preload" href="https://fonts.gstatic.com/s/quicksand/v7/6xKodSZaM9iE8KbpRA_p2HcYT8L_FYzokA.woff2" as="font">
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
