define(function(require, exports, module) {
  var async = app.getModule("utils/Async");
  var fs = app.getModule("filesystem/FileSystem");
  var fsUtils = app.getModule("file/FileUtils");

  var SwiftCodeGen = require("generators/SwiftCodeGenerator").Generator;
  var BookshelfCodeGen = require("generators/BookshelfCodeGenerator").Generator;

  var generators = [
    new SwiftCodeGen(),
    new BookshelfCodeGen()
  ];

  function generate(elem, path, opts) {
    return async.doInParallel(generators, function(gen) {
      return gen.initialize();
    }, false).then(generateCodeForElement(elem, path, opts));
  }

  function generateCodeForElement(elem, path, opts) {
    var result = new $.Deferred();

    if (elem instanceof type.UMLModel) {
      async.doSequentially(elem.ownedElements, function(child) {
        return generate(child, path, opts);
      }, false).then(result.resolve, result.reject);

      return result.promise();
    }

    if (elem instanceof type.UMLPackage) {
      path = path + "/" + elem.name;

      var directory = fs.getDirectoryForPath(path);
      directory.create(function (err, stat) {
        if (err) {
          result.reject(err);
          return;
        }

        async.doSequentially(elem.ownedElements, function(child) {
          return generate(child, path, opts);
        }, false).then(result.resolve, result.reject);
      });

      return result.promise();
    }

    if (elem instanceof type.UMLClass) {
      if (elem.stereotype === "annotationType") {
        return result.resolve();
      }
      generateCodeForClass(elem, path);
    }

    return result.resolve();
  }

  function generateCodeForClass(elem, path) {
    var result = $.Deferred();
    async.doSequentially(generators, function(gen) {
      var exportResult = $.Deferred();
      var filepath = path + "/" + gen.filenameForClassname(elem.name);
      var file = fs.getFileForPath(filepath);
      console.log(filepath);
      fsUtils.writeText(file, gen.generateCodeForClass(elem), true)
        .then(exportResult.resolve, exportResult.reject);
      return exportResult.promise();
    }, false).then(result.resolve, result.reject);
    return result.promise();
  }

  exports.generate = generate;
});