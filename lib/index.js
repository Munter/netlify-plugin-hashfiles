const { resolve, relative } = require('path');
const { outputFile } = require('fs-extra');
const AssetGraph = require('assetgraph');
const hashfiles = require('assetgraph-hashfiles');

const excludedRelationTypes = [
  'JavaScriptFetch',
  'HtmlDnsPrefetchLink',
  'HtmlPreconnectLink',
  'SourceMapSource',
];

const canonicalRoot = process.env.URL;

module.exports = {
  onPostBuild: async ({
    constants: { PUBLISH_DIR },
    inputs: { entryPoints, staticDir },
  }) => {
    const root = PUBLISH_DIR;
    const trimmedStaticDir = staticDir.trim().replace(/^\/*|\/*$/g, '');

    const graph = new AssetGraph({ root, canonicalRoot });

    await graph.logEvents();
    await graph.loadAssets(entryPoints);

    await graph.populate({
      followRelations: {
        crossorigin: false,
        type: { $nin: excludedRelationTypes },
      },
    });

    const pathMap = new Map();

    for (const asset of graph.findAssets({ isLoaded: true, isInline: false })) {
      pathMap.set(asset, asset.url.replace('file://', '').split('?')[0]);
    }

    console.log(
      'assets',
      graph
        .findAssets({ isLoaded: true, isInline: false })
        .map(({ type, url }) => ({ type, url }))
    );

    console.log(
      'relations',
      graph.findRelations().map(({ type, href }) => ({ type, href }))
    );

    await hashfiles(graph, { trimmedStaticDir });

    const result = [];

    for (const asset of graph.findAssets({ isLoaded: true, isInline: false })) {
      const from = pathMap.get(asset);
      const to = asset.url.replace('file://', '').split('?')[0];

      console.log(asset.urlOrDescription, { from, to });

      if (from !== to) {
        result.push({
          from,
          to,
        });
      }
    }

    await graph.writeAssetsToDisc({ isLoaded: true }, root);

    const immutableHeaders = `
/${trimmedStaticDir}/*
  cache-control: public
  cache-control: max-age=31536000
  cache-control: immutable
`;

    await outputFile(resolve(root, '_headers'), immutableHeaders, {
      flag: 'a',
    });

    if (result.length) {
      console.log('** hashfiles moved files: **');
      console.log(
        result
          .map(
            ({ from, to }) =>
              `${relative(root, from)} ==> ${relative(root, to)}`
          )
          .join('\n')
      );
    } else {
      console.log('** hashfiles moved no files **');
    }
  },
};
