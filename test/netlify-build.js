const { resolve } = require('path');
const stripAnsi = require('strip-ansi');
const expect = require('unexpected').clone().use(require('unexpected-set'));
const build = require('@netlify/build');

/**
 * Converts netlify-build log array to array of lines you would see on screen
 * @param {string[]} logs
 */
function unlogify(logs) {
  const logLines = [];

  for (const line of logs) {
    logLines.push(...stripAnsi(line).split('\n'));
  }

  return logLines;
}

describe('netlify-build', () => {
  it('should run with no configuration', async () => {
    const result = await build({
      cwd: resolve(__dirname, 'no-config'),
      buffer: false,
      debug: true,
    });

    expect(result, 'to satisfy', {
      success: true,
    });

    expect(
      unlogify(result.logs.stdout),
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

  it('should not touch sourcemaps or original sources', async () => {
    const result = await build({
      cwd: resolve(__dirname, 'sourcemaps'),
      buffer: true,
    });

    expect(result, 'to satisfy', {
      success: true,
    });

    const log = unlogify(result.logs.stdout).filter((l) => l.includes(' ==> '));

    expect(log, 'with set semantics', 'to satisfy', [
      'main.css ==> static/main.9321046687.css',
      'main.js ==> static/main.f7b60bafd3.js',
      'main.css.map ==> static/main.css.3884008286.map',
      'main.js.map ==> static/main.js.e2c404d6d5.map',
    ]);
  });
});
