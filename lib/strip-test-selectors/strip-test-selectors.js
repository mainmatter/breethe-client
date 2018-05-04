/* eslint-env node */
'use strict';

const TEST_SELECTOR_PREFIX = /^data-test-.*/;

function isTestSelector(attribute) {
  return TEST_SELECTOR_PREFIX.test(attribute);
}

function filterPairs(pairs) {
  return pairs.filter(function(pair) {
    return !isTestSelector(pair.key);
  });
}

function filterAttributes(attributes) {
  return attributes.filter(function(attribute) {
    return !isTestSelector(attribute.name);
  });
}

module.exports = function() {
  return {
    name: 'strip-test-selectors',
    visitor: {
      ElementNode(node) {
        node.attributes = filterAttributes(node.attributes);
      },
      MustacheStatement(node) {
        node.hash.pairs = filterPairs(node.hash.pairs);
      },
      BlockStatement(node) {
        node.hash.pairs = filterPairs(node.hash.pairs);
      }
    }
  }
};
