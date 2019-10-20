const { resolve } = require('path');
const expect = require('unexpected');
const extractConfig = require('../lib/extractConfig');

const BUILD_DIR = resolve(__dirname, '../testdata/manypages');
const defaultConfig = {
  constants: {
    BUILD_DIR
  },
  pluginConfig: {}
};

describe('extractConfig', () => {
  it('should have the expected defaults', () => {
    expect(extractConfig(defaultConfig), 'to satisfy', {
      root: BUILD_DIR,
      canonicalRoot: undefined,
      staticDir: 'static',
      entryPoints: ['404.html', '500.html', 'index.html']
    });
  });

  it('should parse all options', () => {
    const config = {
      ...defaultConfig,
      pluginConfig: {
        canonicalRoot: 'https://netlify.com',
        staticDir: 'myStatic',
        entryPoints: ['index.html']
      }
    };
    expect(extractConfig(config), 'to satisfy', {
      canonicalRoot: 'https://netlify.com',
      staticDir: 'myStatic',
      entryPoints: ['index.html']
    });
  });

  it('should trim spaces and slashes from staticDir', () => {
    const config = {
      ...defaultConfig,
      pluginConfig: {
        staticDir: '  /myStatic// '
      }
    };
    expect(extractConfig(config), 'to satisfy', {
      staticDir: 'myStatic'
    });
  });

  it('should take multiple entry points', () => {
    const config = {
      ...defaultConfig,
      pluginConfig: {
        entryPoints: ['index.html', '404.html', 'subpage/index.html']
      }
    };
    expect(extractConfig(config), 'to satisfy', {
      entryPoints: ['index.html', '404.html', 'subpage/index.html']
    });
  });

  it('should expand entry point glob patterns', () => {
    const config = {
      ...defaultConfig,
      pluginConfig: {
        entryPoints: ['**/*.html']
      }
    };
    expect(extractConfig(config), 'to satisfy', {
      entryPoints: [
        '404.html',
        '500.html',
        'index.html',
        'subpage/index.html',
        'path/to/deep/file.html'
      ]
    });
  });
});
