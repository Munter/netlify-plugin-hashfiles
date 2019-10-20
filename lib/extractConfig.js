const globby = require('globby');

/**
 * @return {{
 *   root: string,
 *   canonicalRoot?: string,
 *   entryPoints: string[],
 *   staticDir: string
 * }}
 */
module.exports = function extractConfig({
  constants: { BUILD_DIR },
  pluginConfig: {
    canonicalRoot,
    entryPoints = ['*.html'],
    staticDir = 'static'
  }
}) {
  /** @type {string} */
  const root = BUILD_DIR;

  const resolvedEntryPoints = globby.sync(entryPoints, { cwd: root });

  const trimmedStaticDir = staticDir.trim().replace(/^\/*|\/*$/g, '');

  const config = {
    root,
    canonicalRoot,
    entryPoints: resolvedEntryPoints,
    staticDir: trimmedStaticDir
  };

  return config;
};
