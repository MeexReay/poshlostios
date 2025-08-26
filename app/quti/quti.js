eval(readFile("/app/zcom.js"))

function createContext(width, height) {
  let canvas = document.createElement("canvas")
  canvas.width = width.toString()
  canvas.height = height.toString()
  let context = canvas.getContext("2d")
  // context.canvas = canvas
  return context
}

class EmptyWidget {
  constructor() { this.ctx = null }
  init(ctx, width, height) { this.ctx = ctx }
  onKeyDown(key) {}
  onKeyUp(key) {}
  onMouseDown(button) {}
  onMouseUp(button) {}
  onMouseMove(x, y) {}
  onMouseWheel(y, x, z) {}
  onResize(width, height) {}
  draw() { return this.ctx }
}

class ColorWidget extends EmptyWidget {
  constructor(color) {
    super()
    this.color = color
    this.ctx = null
  }
  init(ctx, width, height) {
    this.ctx = ctx
  }
  onResize(width, height) {
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height
  }
  draw() {
    this.ctx.fillStyle = this.color
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fill();
    return this.ctx
  }
}

class StackLayout extends EmptyWidget {
  constructor() {
    super()
    this.children = []
    this.inited = false
    this.ctx = null
  }
  pushChild(child) {
    if (this.inited) {
      let child_height = this.height / this.children.length

      child.init(createContext(this.width, child_height), this.width, child_height)
      
      for (let child2 of this.children) {
        child2.onResize(this.width, child_height)
      }
    }
    
    this.children.push(child)
  }
  removeChild(child) {
    this.children = this.children.filter(o => o != child)
  }
  init(ctx, width, height) {
    this.ctx = ctx
    this.width = width
    this.height = height
    
    let child_height = this.height / this.children.length

    for (let child of this.children) {
      child.init(createContext(this.width, child_height), this.width, child_height)
    }

    this.inited = true
    console.log(this)
  }
  onResize(width, height) {
    this.width = width
    this.height = height
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height

    let child_height = this.height / this.children.length
    
    for (let child of this.children) {
      child.onResize(this.width, child_height)
    }

    this.draw()
  }
  draw() {
    let child_height = this.height / this.children.length
    let child_y = 0
    
    for (let child of this.children) {
      this.ctx.drawImage(child.draw().canvas, 0, child_y)
      child_y += child_height
    }
    
    return this.ctx
  }
}

class QutiWindowBuilder {
  constructor() {
    this._title = "Unnamed Window"
    this._width = 500
    this._height = 500
    this._resizable = true
    this._app_id = this.title
    this._decorated = true
    this._child = new EmptyWidget()
  }

  title(title) { this._title = title; return this }
  width(width) { this._width = width; return this }
  height(height) { this._height = height; return this }
  resizable(resizable) { this._resizable = resizable; return this }
  app_id(app_id) { this._app_id = app_id; return this }
  decorated(decorated) { this._decorated = decorated; return this }
  child(child) { this._child = child; return this }

  build() {
    return new QutiWindow(
      this._title,
      this._width,
      this._height,
      this._resizable,
      this._app_id,
      this._decorated,
      this._child
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
      "onmouseup": o => this.child.onMouseUp(o),
      "onmousedown": o => this.child.onMouseDown(o),
      "onmousewheel": (x,y,z) => this.child.onMouseWheel(x,y,z),
      "onkeydown": o => this.child.onKeyDown(o),
      "onkeyup": o => this.child.onKeyUp(o),
      "onresize": (w,h) => this.child.onResize(w,h),
      "onupdate": () => this.child.draw(),
      "onsignal": (s) => {
        if (s == 9) {
          spawned.close()
        }
      },
    }
    
    let [wid, ctx] = createWindow(window)
    // let wobj = getWindow(wid)

    // ctx.canvas = wobj.canvas

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
  let layout = new StackLayout()
  layout.pushChild(new ColorWidget("#f00"))
  layout.pushChild(new ColorWidget("#0f0"))
  layout.pushChild(new ColorWidget("#00f"))
  let window = QutiWindow.builder()
    .child(layout)
    .build()
  let spawned = window.spawn()
  await spawned.mainloop()
  return 0
}
