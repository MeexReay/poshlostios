eval(readFile("/app/quti.js"))

async function main(args) {
  let output = new LabelWidget(
    "#000",
    "#fff",
    "22px monospace",
    "output here",
    "left",
    "middle",
    0,
    0.5
  )

  let input = new EntryWidget(
    "gray",
    "white",
    "darkgray",
    2,
    "18px monospace",
    "input here",
    (t) => {
      output.text = t.text
    },
    "left",
    "middle",
    0,
    0.5
  )

  let files = new ScrollableLayout().vertical()
  files.pushChild(output, 50)
  
  let vlayout = new StackLayout().vertical()
  vlayout.pushChild(input, null, 30)
  vlayout.pushChild(files, 1)

  let window = QutiWindow.builder()
    .child(vlayout)
    .width(500)
    .height(100)
    .title("sexp - files exploring")
    .app_id("sexp")
    .build()
  
  let spawned = window.spawn()
  await spawned.mainloop()

  return 0
}
