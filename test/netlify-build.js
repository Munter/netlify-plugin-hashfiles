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
});
