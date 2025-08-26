eval(readFile("/app/zcom.js"))

class EmptyWidget {
  constructor() {}
  init(ctx, width, height) {}
  onKeyDown(key) {}
  onKeyUp(key) {}
  onMouseDown(button) {}
  onMouseUp(button) {}
  onMouseMove(x, y) {}
  onMouseWheel(y, x, z) {}
  onResize(width, height) {}
  draw() {}
}

class QutiWindowBuilder {
  constructor() {
    this.title = "Unnamed Window"
    this.width = 500
    this.height = 500
    this.resizable = true
    this.app_id = this.title
    this.decorated = true
    this.child = new EmptyWidget()
  }

  title(title) { this.title = title; return this }
  width(width) { this.width = width; return this }
  height(height) { this.height = height; return this }
  resizable(resizable) { this.resizable = resizable; return this }
  app_id(app_id) { this.app_id = app_id; return this }
  decorated(decorated) { this.decorated = decorated; return this }
  child(child) { this.child = child; return this }

  build() {
    return new QutiWindow(
      this.title,
      this.width,
      this.height,
      this.resizable,
      this.app_id,
      this.decorated,
      this.child
    )
  }
}

class QutiWindow {
  constructor (
    title,
    width,
    height,
    resizable,
    app_id,
    decorated,
    child
  ) {
    this.title = title
    this.width = width
    this.height = height
    this.resizable = resizable
    this.app_id = app_id
    this.decorated = decorated
    this.child = child
  }

  spawn() {
    let spawned = new SpawnedQutiWindow(this, null)
    
    let window = {
      "title": this.title,
      "width": this.width,
      "height": this.height,
      "app_id": this.app_id,
      "decorated": this.decorated,
      "resizable": this.resizable,
      "onmouseup": this.child.onMouseUp,
      "onmousedown": this.child.onMouseDown,
      "onmousewheel": this.child.onMouseWheel,
      "onkeydown": this.child.onKeyDown,
      "onkeyup": this.child.onKeyUp,
      "onresize": this.child.onResize,
      "onupdate": this.child.draw,
      "onsignal": (s) => {
        if (s == 9) {
          spawned.close()
        }
      },
    }
    
    let [wid, ctx] = createWindow(window)

    this.child.init(ctx, this.width, this.height)

    spawned.wid = wid
    
    return spawned
  }
  
  static builder() {
    return new QutiWindowBuilder()
  }
}

class SpawnedQutiWindow {
  constructor (window, wid) {
    this.window = window
    this.wid = wid
    this.running = true
  }

  async mainloop() {
    while (this.running && graphics_canvas != null) {
      await new Promise(resolve =>
        setTimeout(resolve, 10))
      this.window.child.draw()
    }
    this.close()
  }

  close() {
    this.running = false
    closeWindow(this.wid)
  }
}

async function main(args) {
  let window = QutiWindow.builder().build()
  let spawned = window.spawn()
  await spawned.mainloop()
}
