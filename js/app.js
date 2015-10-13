var parser,
    sourceCode,
    pegedit_opts,
    return_val = [],
    remove_child_objs,
    traverse,
    symbol_table,
    debug = {};

$('document').ready( function() {
  initializeFoundation();

  var editor = initializeAceEditor('editor'),
      terminal = initializeAceEditor('terminal'),
      contents_uri = 'https://api.github.com/repos/bekroogle/cspotrun-grammar/contents/cspotrun.pegjs';

  buildParserFromRepo(contents_uri);
  setAceOptions(editor, terminal);

  initializeButtonHandlers(editor,terminal);
});

var initializeFoundation = function() {
  $(document).foundation();
};

var buildParserFromRepo = function(uri) {
  $.get(uri, function(repo) {
    parser = PEG.buildParser(atob(repo.content));
  });
};

var initializeAceEditor = function(id) {
  var aceElement = ace.edit(id);
  $('#' + id).height(window.innerHeight);
  return aceElement;
};

var setAceOptions = function(editor, terminal) {
  setEditorOptions(editor);
  setTerminalOptions(terminal);
};

var setEditorOptions = function(id) {
  id.setTheme('ace/theme/monokai');
  id.getSession().setMode('ace/mode/python');
};

var setTerminalOptions = function(terminal) {
  terminal.setTheme('ace/theme/chrome');
  terminal.setOption('showGutter', false);
  terminal.setReadOnly(true);
};

var initializeButtonHandlers = function(input, output) {
  $('#run-btn').click( function(evt) {
    evt.preventDefault();

    if (!parser) { buildParserFromRepo(); }
    runProgram(input,output);
  });
};

var runProgram = function(input,output) {
  var ast = parser.parse(input.getValue());
  output.setValue(traverse(ast),-1);
};
