const { resolve } = require('path');
const stripAnsi = require('strip-ansi');
const expect = require('unexpected');
const build = require('@netlify/build');

describe('netlify-build', () => {
  it('should run with no configuration', async () => {
    const result = await build({
      cwd: resolve(__dirname, 'no-config'),
      buffer: true,
    });

    expect(result, 'to satisfy', {
      success: true,
    });

    expect(
      result.logs.stdout.map(stripAnsi),
      'to contain',
      '** hashfiles moved files: **',
      'main.css ==> static/main.6d8fdb5bf3.css'
    );
  });

  it('should not throw when the publish directory is missing', async () => {
    const result = await build({
      cwd: resolve(__dirname, 'no-publish-dir'),
      buffer: true,
    });

    expect(result, 'to satisfy', {
      success: true,
    });
  });
});
