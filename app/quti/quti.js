eval(readFile("/app/zcom.js"))

function createContext(width, height) {
  let canvas = document.createElement("canvas")
  canvas.width = width.toString()
  canvas.height = height.toString()
  let context = canvas.getContext("2d")
  return context
}

function drawContext(src, dest, x , y) {
  try {
    dest.drawImage(src.canvas, x, y)
  } catch (e) {
    console.log(e)
  }
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
    this.direction = "h"
  }
  horizontal() {
    this.direction = "h"
    return this
  }
  vertical() {
    this.direction = "v"
    return this
  }
  getTotalWantedSize() {
    let total_size = 0
    for (let child of this.children)
      total_size += child.wanted_size
    return total_size
  }
  getActualSize(child) {
    let total_size = this.getTotalWantedSize()
    return child.wanted_size / total_size * this.primarySize()
  }
  mapChilds(callback) {
    let total_size = this.getTotalWantedSize()
    for (let child of this.children)
      callback(child, child.wanted_size / total_size * this.primarySize())
  }
  primarySize() {
    if (this.direction == "v")
      return this.height
    return this.width
  }
  sizeToSizes(size) {
    if (this.direction == "v")
      return [this.width, size]
    return [size, this.height]
  }
  posToPoses(size) {
    if (this.direction == "v")
      return [0, size]
    return [size, 0]
  }
  pushChild(child, wanted_size=1) {
    child.wanted_size = wanted_size
    
    if (this.inited) {
      let size = this.getActualSize(child)
      let [child_width, child_height] = this.sizeToSizes(size)
      
      child.init(
        createContext(child_width, child_height),
        child_width,
        child_height
      )
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

    this.mapChilds((c, s) => {
      console.log(c, s)
      let [child_width, child_height] = this.sizeToSizes(s)

      c.init(
        createContext(child_width, child_height),
        child_width,
        child_height
      )
    })

   this.inited = true
  }
  onResize(width, height) {
    this.width = width
    this.height = height
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height
    
    this.mapChilds((c, s) => {
      let [child_width, child_height] = this.sizeToSizes(s)
      
      c.onResize(child_width, child_height)
    })

    this.draw()
  }
  draw() {
    let pos = 0
    
    this.mapChilds((c, s) => {
      let [x, y] = this.posToPoses(pos)
      drawContext(c.draw(), this.ctx, x, y)
      pos += s
    })
    
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
  let hlayout = new StackLayout()
  hlayout.pushChild(new ColorWidget("#f00"), 1)
  hlayout.pushChild(new ColorWidget("#0f0"), 0.5)
  let vlayout = new StackLayout().vertical()
  vlayout.pushChild(new ColorWidget("#f00"), 1)
  vlayout.pushChild(new ColorWidget("#0f0"), 0.5)
  vlayout.pushChild(new ColorWidget("#00f"), 0.25)
  hlayout.pushChild(vlayout, 1)
  let window = QutiWindow.builder()
    .child(hlayout)
    .build()
  let spawned = window.spawn()
  await spawned.mainloop()
  return 0
}
