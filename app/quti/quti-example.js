eval(readFile("/app/quti.js"))

async function main(args) {
  let output = new LabelWidget(
    "#000",
    "#fff",
    "22px monospace",
    "output here",
  )

  let input = new EntryWidget(
    "#000",
    "#fff",
    "#fff",
    5,
    "22px monospace",
    "input here",
    (t) => {
      output.text = t.text
    }
  )

  let submit = new ButtonWidget(
    "#000",
    "#fff",
    "#fff",
    "#fff",
    "#000",
    "#000",
    5,
    "22px monospace",
    "submit",
    () => {
      output.text = input.text
    }
  )

  let vlayout = new StackLayout().vertical()
  let hlayout = new StackLayout().horizontal()
  hlayout.pushChild(input, 2)
  hlayout.pushChild(submit, 1)
  vlayout.pushChild(hlayout, 1)
  vlayout.pushChild(output, 1)

  let window = QutiWindow.builder()
    .child(vlayout)
    .width(500)
    .height(100)
    .title("wow dialog window submit output input!!")
    .build()
  
  let spawned = window.spawn()
  await spawned.mainloop()

  return 0
}

