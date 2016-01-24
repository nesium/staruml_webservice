define(function(require, exports, module) {
  var Commands = app.getModule('command/Commands');
  var CommandManager = app.getModule("command/CommandManager");
  var MenuManager = app.getModule("menu/MenuManager");
  var ElementPickerDialog = app.getModule("dialogs/ElementPickerDialog");
  var FileSystem = app.getModule("filesystem/FileSystem");
  var Dialogs = app.getModule("dialogs/Dialogs");

  var Gen = require("WebserviceCodeGenerator");

  function handleGenerate(base, path, opts) {
    var result = new $.Deferred();

    // If base is not assigned, popup ElementPicker
    if (!base) {
      ElementPickerDialog.showDialog("Select a base model for code generation", null, type.UMLPackage)
        .done(function (buttonId, selected) {
          if (buttonId === Dialogs.DIALOG_BTN_OK && selected) {
            base = selected;

            if (!path) {
              selectFolderAndGenerate(base, path, opts, result);
            }
          }
        });
    } else {
      if (!path) {
        selectFolderAndGenerate(base, path, opts, result);
      } else {
        Gen.generate(base, path, opts).then(result.resolve, result.reject);
      }
    }

    return result.promise();
  }

  function selectFolderAndGenerate(base, path, opts, result) {
    FileSystem.showOpenDialog(false, true, "Select a target folder", null, null, function(err, files) {
      if (err) {
        result.reject(err);
        return;
      }

      if (files.length < 1) {
        result.reject(FileSystem.USER_CANCELED);
        return;
      }

      path = files[0];
      Gen.generate(base, path, opts).then(result.resolve, result.reject);
    });
  }

  var Cmd = {
    Wrapper: "webservice",
    Generate: "webservice.generate"
  };

  CommandManager.register("Webservice", Cmd.Wrapper, CommandManager.doNothing);
  CommandManager.register("Generate…", Cmd.Generate, handleGenerate);

  var menu = MenuManager.getMenu(Commands.TOOLS);
  var submenu = menu.addMenuItem(Cmd.Wrapper);
  submenu.addMenuItem(Cmd.Generate);
});