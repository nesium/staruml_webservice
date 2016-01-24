define(function(require, exports, module) {
  function BookshelfCodeGenerator() {}

  BookshelfCodeGenerator.prototype.initialize = function() {
    var result = new $.Deferred();
    return result.resolve();
  }

  BookshelfCodeGenerator.prototype.filenameForClassname = function(className) {
    return className + ".js";
  }

  BookshelfCodeGenerator.prototype.generateCodeForClass = function(elem) {
    return "Hello from BookshelfCodeGenerator";
  }

  exports.Generator = BookshelfCodeGenerator;
});