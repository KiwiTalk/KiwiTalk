if (nw.App.argv.includes('--dev')) {
  nw.Window.open(
    'localhost:3000',
    {
      new_instance: false,
      frame: false
    },
    function(win) {}
  );
} else {
  nw.Window.open(
    'build/index.html',
    {
      new_instance: false,
      frame: false
    },
    function(win) {}
  );
}