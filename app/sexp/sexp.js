eval(readFile("/app/quti.js"))

function getFile(path) {
  let file = new ButtonWidget(
    "#000",
    "#fff",
    "#000",
    "darkgray",
    "#fff",
    "darkgray",
    2,
    "18px monospace",
    path.split("/").pop(),
    () => {
      executeCommand(["/app/zterm.js", "/app/kfc.js", path], terminal)
    },
    "left",
    "middle",
    0,
    0.5,
  )

  return file
}

function getFolder(path, name, vlayout, path_entry) {
  let file = new ButtonWidget(
    "#000",
    "#fff",
    "#000",
    "darkgray",
    "#fff",
    "darkgray",
    2,
    "18px monospace",
    name,
    () => {
      path_entry.text = simplifyPath(path)
      vlayout.removeChild(vlayout.children[1])
      vlayout.pushChild(getFiles(path, path_entry, vlayout), 1)
    },
  )

  return file
}

function getFiles(path, path_entry, vlayout) {
  let files = new ScrollableLayout(50).vertical()
  if (simplifyPath(path) != "/") {
    files.pushChild(getFolder(
      path+"/..",
      "../",
      vlayout,
      path_entry
    ), 30)
  }
  for (let subpath of listFiles(path)) {
    subpath = path + "/" + subpath
    if (isFolder(subpath)) {
      if (subpath.split("/").pop() == "")
        continue
      files.pushChild(getFolder(
        subpath,
        subpath.split("/").pop() + "/",
        vlayout,
        path_entry
      ), 30)
    } else {
      files.pushChild(getFile(subpath), 30)
    }
  }
  return files
}

async function main(args) {
  let path = terminal.cwd

  if (args.length > 1) {
    path = args[1]
  }
  
  let vlayout = new StackLayout().vertical()

  let path_entry = new EntryWidget(
    "gray",
    "white",
    "darkgray",
    2,
    "18px monospace",
    path,
    (t) => {
      vlayout.removeChild(vlayout.children[1])
      vlayout.pushChild(getFiles(t.text, path_entry, vlayout), 1)
    },
    "left",
    "middle",
    0,
    0.5
  )

  let files = getFiles(path, path_entry, vlayout)
  
  vlayout.pushChild(path_entry, null, 30)
  vlayout.pushChild(files, 1)

  let window = QutiWindow.builder()
    .child(vlayout)
    .width(500)
    .height(500)
    .title("sexp - files exploring")
    .app_id("sexp")
    .build()
  
  let spawned = window.spawn()
  await spawned.mainloop()

  return 0
}
