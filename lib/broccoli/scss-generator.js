'use strict';

const path = require('path');
const fs = require('fs-extra');
const dss = require( 'dss' );
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const CachingWriter = require('broccoli-caching-writer');
const gitRepoVersion = require('git-repo-version');

module.exports = class ScssGenerator extends CachingWriter {
  constructor(inputNodes, options) {
    let defaults = {
      cacheInclude: [/\.js$/]
    };

    super(inputNodes, Object.assign(defaults, options));

    this.project = options.project;
    this.destDir = options.destDir;
  }

  build() {
    let project = this.project;
    let document =  this._generateScss(project);
  }

  _generateScss(project) {
    const data = [];

    this.inputPaths.forEach((path) => {
      const allScssFiles = walkSync(path, []);
      allScssFiles.forEach((filePath) => {
        const fileContents = fs.readFileSync(filePath);
        dss.parse( fileContents, {}, function (parsedObject) {
          // Output the parsed document
          // console.log(filePath, parsedObject);
          const jsonApi = convertToJsonApi(filePath, parsedObject);
          if (jsonApi.blocks.length !== 0) {
            data.push(jsonApi);
          }
        });
      });
    });

    const serializer = new JSONAPISerializer('project-css', {
      attributes: ['csses'],
      csses: {
        ref: 'id',
        attributes: ['blocks'],
        blocks: {
          ref: 'id',
          attributes: ['name', 'description']
        }
      }
    });

    const projectCss = {
      id: 'project-css',
      csses: data
    }
    console.log(projectCss);
    console.log('========================================================');
    const converted = serializer.serialize(projectCss);
    console.log(converted);

    // Write data
    let baseDir = path.join(this.outputPath, this.destDir);
    fs.ensureDirSync(path.join(baseDir, 'project-csses'));
    fs.writeJSONSync(path.join(baseDir, 'project-csses', 'ember-cli-addon-docs.json'), converted, 'utf-8');
  }
};

const convertToJsonApi = function(filePath, parsedObject) {
  if (parsedObject.blocks === undefined) {
    return null;
  }

  const json = {
    id: 'css-123', // TODO(Billy): used random id
    blocks: []
  };

  parsedObject.blocks.forEach((parsedBlock, index) => {
    const name = 'css-block-' + parsedBlock;

    const block = {
      id: 'css-block-' + parsedBlock.name + index, // TODO(Billy): used random id
      name: parsedBlock.name,
      description: parsedBlock.description
    };
    if (block.name) {
      json.blocks.push(block);
    }
  });

  return json;
}

const walkSync = function(dir, filelist, filter) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
        filelist = walkSync(dir + '/' + file, filelist);
    } else {
      if (file.endsWith('scss')) {
        filelist.push(dir + '/' + file);
      }
    }
  });
  return filelist;
};
