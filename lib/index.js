const { resolve, relative } = require('path');
const { unlink, outputFile } = require('fs-extra');
const AssetGraph = require('assetgraph');
const hashfiles = require('assetgraph-hashfiles');
const { isFile } = require('path-type');

const excludedRelationTypes = ['JavaScriptFetch'];

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

    await hashfiles(graph, { trimmedStaticDir });

    const result = [];

    for (const asset of graph.findAssets({ isLoaded: true, isInline: false })) {
      const from = pathMap.get(asset);
      const to = asset.url.replace('file://', '').split('?')[0];

      if (from !== to) {
        result.push({
          from,
          to,
        });
      }
    }

    const deletePromises = Promise.all(result.map((r) => deleteFile(r.from)));

    const writePromise = await graph.writeAssetsToDisc(
      { isLoaded: true },
      root
    );

    const immutableHeaders = `
/${trimmedStaticDir}/*
  cache-control: public
  cache-control: max-age=31536000
  cache-control: immutable
`;

    const headersPromise = outputFile(
      resolve(root, '_headers'),
      immutableHeaders,
      { flag: 'a' }
    );

    await Promise.all([deletePromises, writePromise, headersPromise]);

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

const deleteFile = async function (filePath) {
  if (!(await isFile(filePath))) {
    return;
  }

  await unlink(filePath);
};
