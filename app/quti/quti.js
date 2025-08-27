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
    // console.log(e)
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
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.fill()
    return this.ctx
  }
}

class ButtonWidget extends EmptyWidget {
  constructor(
    background,
    foreground,
    border_color,
    pressed_background,
    pressed_foreground,
    pressed_border_color,
    border_width,
    font,
    text,
    callback,
  ) {
    super()
    this.ctx = null
    this.background = background
    this.foreground = foreground
    this.border_color = border_color
    this.pressed_background = pressed_background
    this.pressed_foreground = pressed_foreground
    this.pressed_border_color = pressed_border_color
    this.border_width = border_width
    this.text = text
    this.callback = callback
    this.pressed = false
    this.font = font
  }
  init(ctx, width, height) {
    this.ctx = ctx
  }
  onResize(width, height) {
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height
  }
  draw() {
    if (this.pressed) this.ctx.fillStyle = this.pressed_background
    else this.ctx.fillStyle = this.background
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.fill()
    this.ctx.lineWidth = this.border_width
    if (this.pressed) this.ctx.strokeStyle = this.pressed_border_color
    else this.ctx.strokeStyle = this.border_color
    this.ctx.rect(
      this.border_width / 2,
      this.border_width / 2,
      this.ctx.canvas.width - this.border_width,
      this.ctx.canvas.height - this.border_width
    )
    this.ctx.stroke()
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "middle"
    if (this.pressed) this.ctx.fillStyle = this.pressed_foreground
    else this.ctx.fillStyle = this.foreground
    this.ctx.font = this.font
    this.ctx.fillText(this.text, this.ctx.canvas.width / 2, this.ctx.canvas.height / 2)
    return this.ctx
  }
  onMouseMove(x, y) {
    return "pointer"
  }
  onMouseDown(b) {
    this.pressed = true
  }
  onMouseUp(b) {
    this.callback(this)
    this.pressed = false
  }
}

class EntryWidget extends EmptyWidget {
  constructor(
    background,
    foreground,
    border_color,
    border_width,
    font,
    text,
    callback,
    align="center",
    baseline="middle",
    x=0.5,
    y=0.5
  ) {
    super()
    this.ctx = null
    this.background = background
    this.foreground = foreground
    this.border_width = border_width
    this.border_color = border_color
    this.text = text
    this.callback = callback
    this.pressed = false
    this.font = font
    this.align = align
    this.baseline = baseline
    this.x = x
    this.y = y
  }
  init(ctx, width, height) {
    this.ctx = ctx
  }
  onResize(width, height) {
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height
  }
  draw() {
    this.ctx.fillStyle = this.background
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.fill()
    this.ctx.lineWidth = this.border_width
    
    this.ctx.strokeStyle = this.border_color
    this.ctx.rect(
      this.border_width / 2,
      this.border_width / 2,
      this.ctx.canvas.width - this.border_width,
      this.ctx.canvas.height - this.border_width
    )
    this.ctx.stroke()
    
    this.ctx.textAlign = this.align
    this.ctx.textBaseline = this.baseline
    this.ctx.fillStyle = this.foreground
    this.ctx.font = this.font
    this.ctx.fillText(this.text, this.ctx.canvas.width * this.x, this.ctx.canvas.height * this.y)
    
    return this.ctx
  }
  onKeyDown(key) {
    if (key.length == 1) {
      this.text += key
    } else if (key == "Backspace") {
      if (this.text.length != 0)
        this.text = this.text.substring(0, this.text.length - 1)
    } else if (key == "Enter") {
      this.callback(this)
    }
  }
}

class LabelWidget extends EmptyWidget {
  constructor(
    background,
    foreground,
    font,
    text,
    align="center",
    baseline="middle",
    x=0.5,
    y=0.5
  ) {
    super()
    this.ctx = null
    this.background = background
    this.foreground = foreground
    this.text = text
    this.font = font
    this.align = align
    this.baseline = baseline
    this.x = x
    this.y = y
  }
  init(ctx, width, height) {
    this.ctx = ctx
  }
  onResize(width, height) {
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height
  }
  draw() {
    this.ctx.fillStyle = this.background
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.fill()
    this.ctx.textAlign = this.align
    this.ctx.textBaseline = this.baseline
    this.ctx.fillStyle = this.foreground
    this.ctx.font = this.font
    this.ctx.fillText(this.text, this.ctx.canvas.width * this.x, this.ctx.canvas.height * this.y)
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
    this.hover_child = null
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
    if (child.wanted_actual_size != null) {
      return child.wanted_actual_size
    }
    let total_size = this.getTotalWantedSize()
    if (total_size == 0) return this.primarySizeNoActuals()
    return child.wanted_size / total_size * this.primarySizeNoActuals()
  }
  mapChilds(callback) {
    let total_size = this.getTotalWantedSize()
    for (let child of this.children) {
      if (child.wanted_actual_size != null) {
        callback(child, child.wanted_actual_size)
      } else {
        callback(child, child.wanted_size / total_size * this.primarySizeNoActuals())
      }
    }
  }
  primarySizeNoActuals() {
    let size = this.primarySize()
    for (let child of this.children) {
      if (child.wanted_actual_size != null) {
        size -= child.wanted_actual_size
      }
    }
    return size
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
  pushChild(child, wanted_size=1, wanted_actual_size=null) {
    console.log("push child", child)
    if (wanted_actual_size != null) {
      child.wanted_actual_size = wanted_actual_size
      child.wanted_size = 0
    } else {
      child.wanted_actual_size = null
      child.wanted_size = wanted_size
    }
    
    if (this.inited) {
      let size = this.getActualSize(child)
      let [child_width, child_height] = this.sizeToSizes(size)

      console.log(child_width, child_height)
      
      child.init(
        createContext(child_width, child_height),
        child_width,
        child_height
      )
      
      this.mapChilds((c, s) => {
        let [child_width, child_height] = this.sizeToSizes(s)
      
        c.onResize(child_width, child_height)
      })
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
  onMouseMove(x, y) {
    // console.log("move", x, y)
    let pos = 0
    let found = false
    let res = null
    
    this.mapChilds((c, s) => {
      let [cx, cy] = this.posToPoses(pos)
      let [cw, ch] = this.sizeToSizes(s)

      if (x >= cx && y >= cy && x <= cx + cw && y <= cy + ch) {
        this.hover_child = c
        // console.log("hover", this.hover_child)
        res = c.onMouseMove(x - cx, y - cy)
        found = true
      }
      
      pos += s
    })

    if (!found) {
      this.hover_child = null
    }

    return res
  }
  onKeyDown(key) {
    if (this.hover_child != null) {
      this.hover_child.onKeyDown(key)
    }
  }
  onKeyUp(key) {
    if (this.hover_child != null) {
      this.hover_child.onKeyUp(key)
    }
  }
  onMouseDown(button) {
    if (this.hover_child != null) {
      this.hover_child.onMouseDown(button)
    }
  }
  onMouseUp(button) {
    if (this.hover_child != null) {
      this.hover_child.onMouseUp(button)
    }
  }
  onMouseWheel(y, x, z) {
    if (this.hover_child != null) {
      this.hover_child.onMouseWheel(y, x, z)
    }
  }
}

class ScrollableLayout extends StackLayout {
  constructor(step) {
    super()
    this.scroll_pos = 0
    this.step = step
    this.velocity = 0
  }
  pushChild(child, wanted_actual_size) {
    child.wanted_actual_size = wanted_actual_size
    
    if (this.inited) {
      let [child_width, child_height] = this.sizeToSizes(wanted_actual_size)
      
      child.init(
        createContext(child_width, child_height),
        child_width,
        child_height
      )
    }
    
    this.children.push(child)
  }
  init(ctx, width, height) {
    this.ctx = ctx
    this.width = width
    this.height = height

    for (let child of this.children) {
      let [child_width, child_height] = this.sizeToSizes(child.wanted_actual_size)

      child.init(
        createContext(child_width, child_height),
        child_width,
        child_height
      )
    }

    this.inited = true
  }
  onResize(width, height) {
    this.width = width
    this.height = height
    this.ctx.canvas.width = width
    this.ctx.canvas.height = height
    
    for (let child of this.children) {
      let [child_width, child_height] = this.sizeToSizes(child.wanted_actual_size)
      child.onResize(child_width, child_height)
    }
    
    this.draw()
  }
  draw() {
    this.ctx.fillStyle = "#000"
    this.ctx.rect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    this.ctx.fill()

    let total_size = 0
    
    for (let child of this.children) {
      total_size += child.wanted_actual_size
    }

    this.scroll_pos = Math.min(total_size - this.primarySize(), Math.max(0, this.scroll_pos + this.velocity))
    this.velocity /= 1.5
    // this.velocity = Math.round(this.velocity * 100) / 100
    // this.velocity = 0

    // if (0 < this.velocity < 0.1) this.velocity = 0
    // if (-0.1 < this.velocity < 0) this.velocity = 0

    if (total_size < this.primarySize()) {
      this.scroll_pos = 0
    }

    console.log(this.scroll_pos, total_size, this.primarySize())
      
    let pos = -this.scroll_pos
    
    for (let child of this.children) {
      let [x, y] = this.posToPoses(pos)
      drawContext(child.draw(), this.ctx, x, y)
      pos += child.wanted_actual_size
    }
    
    return this.ctx
  }
  onMouseMove(x, y) {
    let pos = -this.scroll_pos
    let found = false
    let res = null
    
    for (let child of this.children) {
      let [cx, cy] = this.posToPoses(pos)
      let [cw, ch] = this.sizeToSizes(child.wanted_actual_size)
      
      if (x >= cx && y >= cy && x <= cx + cw && y <= cy + ch) {
        this.hover_child = child
        res = child.onMouseMove(x - cx, y - cy)
        found = true
      }
      
      pos += child.wanted_actual_size
    }
    
    if (!found) {
      this.hover_child = null
    }

    return res
  }
  onMouseWheel(y, x, z) {
    if (y > 0) {
      this.velocity += this.step
    } else {
      this.velocity -= this.step
    }
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
      "onmousemove": (x,y) => this.child.onMouseMove(x,y),
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
