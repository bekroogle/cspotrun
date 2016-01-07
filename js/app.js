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

  // This is just to get global access to these
  // variables for debugging:
  debug.editor = editor;
  debug.terminal = terminal;

  buildParserFromRepo(contents_uri);
  setAceOptions(editor, terminal);

  loadEditorContent(editor);

  createEventHandlers(editor,terminal);

  $(window).on('resize', function() {
    setAceHeight('editor');
    setAceHeight('terminal');
  });
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
  setAceHeight(id);
  return aceElement;
};

var setAceHeight = function(id, val) {
  if (val === undefined) {
    $('#' + id).height(window.innerHeight-$('nav').height());
  } else {
    $('#' + id).height(val);
  }
};

var setAceOptions = function(editor, terminal) {
  setEditorOptions(editor);
  setTerminalOptions(terminal);
};

var setEditorOptions = function(id) {
  id.setTheme('ace/theme/monokai');
  id.getSession().setMode('ace/mode/cspotrun');
};

var setTerminalOptions = function(terminal) {
  terminal.setTheme('ace/theme/chrome');
  terminal.setOption('showGutter', false);
  terminal.setReadOnly(true);
};

var loadEditorContent = function(editor) {
  if (localStorage.hasOwnProperty('editorContent')) {
    editor.setValue(localStorage.getItem('editorContent'));
  }
};

var createEventHandlers = function(editor, terminal) {
  createAceEventHandlers(editor, terminal);
  createButtonHandlers(editor, terminal);
};

var createAceEventHandlers = function(editor, terminal) {
  editor.getSession().on('change', function(e) {
    localStorage.setItem('editorContent', editor.getValue());
  });
};

var createButtonHandlers = function(input, output) {
  $('#run-btn').click( function(evt) {
    evt.preventDefault();

    if (!parser) { buildParserFromRepo(); }

    runProgram(input,output);
    showTerminal(input, output);
  });

  $('#clear-term-btn').click( function(evt) {
    evt.preventDefault();
    output.setValue('', -1);
  });

  $('#close-term-btn').click( function(evt) {
    evt.preventDefault();
    hideTerminal();
  });
};

var showTerminal = function() {
  setAceHeight('editor', window.innerHeight / 2);
  setAceHeight('terminal', window.innerHeight / 2);
  $('#output').removeClass('hidden');
};

var hideTerminal = function() {
  setAceHeight('editor');
  $('#output').addClass('hidden');
}

var runProgram = function(input,output) {
  var parseResults = tryParse(input, output);
  if (typeof parseResults != 'string') {
    input.getSession().$annotations.push(parseResults);
    input.getSession().setAnnotations(input.getSession().$annotations);
    aceAppend(output, parseResults.type +' at row: '+ parseResults.row +
      ', column: '+ parseResults.column +' => '+ parseResults.text)
  } else {
    aceAppend(output, parseResults);
  }
};
var aceAppend = function(id, value) {
  id.setValue(id.getValue() +'\n'+ value);
}
var tryParse = function(input, output) {
  try {
    input.getSession().clearAnnotations();
    var ast = parser.parse(input.getValue());
    return traverse(ast);
  } catch (exn) {
    return {
      column: exn.column,
      row: exn.line - 1,
      type: 'error',
      raw: exn.message,
      text: exn.message
    };
  }
};
