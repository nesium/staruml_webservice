define(function(require, exports, module) {
  var ExtUtils = app.getModule("utils/ExtensionUtils");
  var FileUtils = app.getModule("file/FileUtils");
  var fs = app.getModule("filesystem/FileSystem");
  var UML = app.getModule("uml/UML");

  function SwiftCodeGenerator() {}

  SwiftCodeGenerator.prototype.initialize = function() {
    var self = this;

    var filepath = ExtUtils.getModulePath(module, "../templates/SwiftClass.ejs");
    console.log(filepath);
    var file = fs.getFileForPath(filepath);
    return FileUtils.readAsText(file).done(function(data) {
      self.classTemplate = _.template(data);
    });
  }

  SwiftCodeGenerator.prototype.filenameForClassname = function(className) {
    return className + ".swift";
  }

  SwiftCodeGenerator.prototype.generateCodeForClass = function(elem) {
    var hasRequiredFields = false;

    var fields = _.chain(elem.attributes)
    .filter(function(attr) {
      return attr.visibility === UML.VK_PUBLIC;
    })
    .map(function(attr) {
      var field = this.swiftFieldFromAttribute(attr);
      if (!field.isOptional) {
        hasRequiredFields = true;
      }
      return field;
    }, this)
    .value();

    return this.classTemplate({
      className: elem.name,
      fields: fields,
      hasRequiredFields: hasRequiredFields
    });
  }

  SwiftCodeGenerator.prototype.swiftFieldFromAttribute = function(attr) {
    var isOptional = false;
    var type;

    if (attr.isID) {
      type = "ObjectID";
    } else {
      type = attr.getTypeString();

      if (type.substr(-1) === '?') {
        isOptional = true;
        type = str.substring(0, str.length - 1);
      }
    }

    return {
      name: attr.name,
      type: type,
      optional: isOptional,
      fullType: type + (isOptional ? '?' : ''),
      jsonType: type
    };
  }

  exports.Generator = SwiftCodeGenerator;
});