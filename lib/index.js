const { promisify } = require('util');
const { resolve, relative } = require('path');
const appendFile = promisify(require('fs').appendFile);
const deleteFile = promisify(require('fs').unlink);
const extractConfig = require('./extractConfig');
const AssetGraph = require('assetgraph');
const hashfiles = require('assetgraph-hashfiles');
const configSchema = require('./config.schema.json');

const excludedRelationTypes = ['JavaScriptFetch'];

module.exports = {
  name: 'hashfiles',

  config: configSchema,

  postBuild: async config => {
    const { root, canonicalRoot, entryPoints, staticDir } = extractConfig(
      config
    );

    const graph = new AssetGraph({ root, canonicalRoot });

    await graph.logEvents();
    await graph.loadAssets(entryPoints);

    await graph.populate({
      followRelations: {
        crossorigin: false,
        type: { $nin: excludedRelationTypes }
      }
    });

    const pathMap = new Map();

    for (const asset of graph.findAssets({ isLoaded: true, isInline: false })) {
      pathMap.set(asset, asset.url.replace('file://', '').split('?')[0]);
    }

    await hashfiles(graph, { staticDir });

    const result = [];

    for (const asset of graph.findAssets({ isLoaded: true, isInline: false })) {
      const from = pathMap.get(asset);
      const to = asset.url.replace('file://', '').split('?')[0];

      if (from !== to) {
        result.push({
          from,
          to
        });
      }
    }

    const deletePromises = Promise.all(result.map(r => deleteFile(r.from)));

    const writePromise = await graph.writeAssetsToDisc(
      { isLoaded: true },
      root
    );

    const immutableHeaders = `
/${staticDir}/*
  cache-control: public
  cache-control: max-age=31536000
  cache-control: immutable
`;

    const headersPromise = appendFile(
      resolve(root, '_headers'),
      immutableHeaders
    );

    await Promise.all(deletePromises, writePromise, headersPromise);

    console.log('** hashfiles moved files: **');
    console.log(
      result
        .map(
          ({ from, to }) => `${relative(root, from)} ==> ${relative(root, to)}`
        )
        .join('\n')
    );

    return result;
  }
};
