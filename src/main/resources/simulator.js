'use strict';

let canvas;
let worldMap;
let lastClickedLocation = { lat: 0, lng: 0 };
const mappa = new Mappa('Leaflet');
const mapOptions = {
  lat: 0,
  lng: 0,
  zoom: 3,
  style: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
}
const colors = {
  key: [255, 255, 0],
  value: [255],
  background: [0, 0, 75, 125],
  progressBar: [65, 245, 240],
  mouseSelectionCreateBg: [0, 150, 0, 100],
  mouseSelectionCreateCh: [10, 120, 20],
  mouseSelectionDeleteBg: [100, 100, 100, 100],
  mouseSelectionDeleteCh: [25, 25, 25],
};
const command = {
  demand: {
    amount: { // min, max must be in powers of 10
      value: 1000,
      min: 1,
      max: 100000
    },
    rate: { // min, max must be in powers of 10
      value: 1000,
      min: 100,
      max: 100000
    }
  },
  supply: {
    amount: { // min, max must be in powers of 10
      value: 1000,
      min: 100,
      max: 100000
    },
    rate: { // min, max must be in powers of 10
      value: 1000,
      min: 100,
      max: 100000
    }
  },
  prompt: 'd - Demand, s - Supply'
};

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  worldMap = mappa.tileMap(mapOptions);
  worldMap.overlay(canvas, mapReady);
  worldMap.onChange(mapChanged);

  grid.resize();
  commandReset();
}

function draw() {
  clear();
  drawZoomAndMouseLocation();
  drawCommandInput();
  drawMouseDemandSelection();
  drawMouseSupplySelection();
}

function drawZoomAndMouseLocation() {
  const latLng = worldMap.pixelToLatLng(mouseX, mouseY);
  const lat = latLng.lat.toFixed(8);
  const lng = latLng.lng.toFixed(8);
  const height = 1.2;
  const border = 0.2;
  const keyColor = color(colors.key);
  const valueColor = color(colors.value);
  const bgColor = color(colors.background);

  Label()
    .setX(2).setY(0.1).setW(5).setH(height)
    .setBorder(border)
    .setKey('Zoom')
    .setValue(19 - worldMap.zoom())
    .setBgColor(bgColor)
    .setKeyColor(keyColor)
    .setValueColor(valueColor)
    .draw();
  Label()
    .setX(7.05).setY(0.1).setW(8).setH(height)
    .setBorder(border)
    .setKey('Lat')
    .setValue(lat)
    .setBgColor(bgColor)
    .setKeyColor(keyColor)
    .setValueColor(valueColor)
    .draw();
  Label()
    .setX(15.1).setY(0.1).setW(8).setH(height)
    .setBorder(border)
    .setKey('Lng')
    .setValue(lng)
    .setBgColor(bgColor)
    .setKeyColor(keyColor)
    .setValueColor(valueColor)
    .draw();
}

function drawCommandInput() {
  const x =grid.ticksHorizontal - 15;
  const y = 0.1;
  const height = 1.1;
  const width = 14;
  const border = 0.2;
  const keyColor = color(colors.key);
  const bgColor = color(colors.background);

  Label()
    .setX(x).setY(y).setW(width).setH(height)
    .setBorder(border)
    .setKey(command.prompt)
    .setBgColor(bgColor)
    .setKeyColor(keyColor)
    .draw();

  drawSliders(x, y, height, width, border);
}

function drawSliders(x, y, height, width, border) {
  if (command.isCreate || command.isDelete) {
    let amount;
    let rate;
    if (command.isDemand) {
      amount = command.demand.amount;
      rate = command.demand.rate;
    } else {
      amount = command.supply.amount;
      rate = command.supply.rate;
    }

    if (command.isCreate) {
      drawSlider(x, y + height + border, height * 3, width, border, 'Amount', amount.value, amount.min, amount.max);
      drawSlider(x, y + height * 4 + border * 2, height * 3, width, border, 'Rate', rate.value, rate.min, rate.max);
    } else {
      drawSlider(x, y + height + border, height * 3, width, border, 'Rate', rate.value, rate.min, rate.max);
    }
  }
}

function drawSlider(x, y, height, width, border, label, value, min, max) {
  const keyColor = color(colors.key);
  const bgColor = color(colors.background);
  const barColor = color(colors.progressBar);
  const valueColor = color(colors.value);
  Slider()
    .setX(x).setY(y).setW(width).setH(height)
    .setBorder(border * 2)
    .setMin(min).setMax(max)
    .setValue(value)
    .setValueColor(valueColor)
    .setBgColor(bgColor)
    .setBarColor(barColor)
    .setLabel(label)
    .setLabelColor(keyColor)
    .setLabelW(3)
    .draw();
}

function mouseSelectionDiameter() {
  return Math.min(windowWidth, windowHeight) / 10;
}

function mouseSelectionRadius() {
  return mouseSelectionDiameter() / 2;
}

function drawMouseDemandSelection() {
  if (command.isDemand && (command.isCreate || command.isDelete)) {
    const diameter = mouseSelectionDiameter();
    noStroke();
    fill(command.isCreate ? color(0, 100, 0, 100) : color(100, 100, 100, 100));
    circle(mouseX, mouseY, diameter);
  }
}

function drawMouseSupplySelection() {
  if (command.isSupply && (command.isCreate || command.isDelete)) {
    const diameter = mouseSelectionDiameter();
    const crossHairOffset = diameter / 10;
    const crossHairLength = diameter / 2 - crossHairOffset * 2;
    noStroke();
    fill(command.isCreate ? color(colors.mouseSelectionCreateBg) : color(colors.mouseSelectionDeleteBg));
    circle(mouseX, mouseY, diameter);
    stroke(command.isCreate ? color(colors.mouseSelectionCreateCh) : color(colors.mouseSelectionDeleteCh));
    strokeWeight(2);
    line(mouseX, mouseY - crossHairLength - crossHairOffset, mouseX, mouseY - crossHairOffset);
    line(mouseX, mouseY + crossHairLength + crossHairOffset, mouseX, mouseY + crossHairOffset);
    line(mouseX - crossHairLength - crossHairOffset, mouseY, mouseX - crossHairOffset, mouseY);
    line(mouseX + crossHairLength + crossHairOffset, mouseY, mouseX + crossHairOffset, mouseY);
  }
}

function mapReady() {
  console.log('Map ready');
  worldMap.map.setMinZoom(3);
}

function mapChanged() {
  //console.log('Map changed', worldMap.zoom(), worldMap.pixelToLatLng(mouseX, mouseY));
}

function keyTyped() {
  commandInput(key);
  return false;
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    commandReset();
    commandPrompt();
  }
}

function mouseClicked() {
  console.log('Mouse clicked', mouseX, mouseY, worldMap.zoom(), worldMap.pixelToLatLng(mouseX, mouseY));
  const clickedLocation = worldMap.pixelToLatLng(mouseX, mouseY);
  console.log('Distance between clicks', distanceBetween(lastClickedLocation, clickedLocation));
  lastClickedLocation = clickedLocation;

  if (command.isDemand && command.isCreate) {
    mouseClickedDemandCreate();
  } else if (command.isDemand && command.isDelete) {
    mouseClickedDemandDelete();
  } else if (command.isSupply && command.isCreate) {
    mouseClickedSupplyCreate();
  } else if (command.isSupply && command.isDelete) {
    mouseClickedSupplyDelete();
  }
  commandReset();
  commandPrompt();
  return false;
}

function mouseClickedDemandCreate() {
  const radius = radiusOfSelectionMeters(mouseX, mouseY, mouseSelectionRadius());
  const diameter = radius * 2;
  console.log('Demand create, selection radius meters', radius, 'diameter', diameter);
  mouseClickedPost('demand', 'create');
}

function mouseClickedDemandDelete() {
  const radius = radiusOfSelectionMeters(mouseX, mouseY, mouseSelectionRadius());
  const diameter = radius * 2;
  console.log('Demand delete, selection radius meters', radius, 'diameter', diameter);
  mouseClickedPost('demand', 'delete');
}

function mouseClickedSupplyCreate() {
  const radius = radiusOfSelectionMeters(mouseX, mouseY, mouseSelectionRadius());
  const diameter = radius * 2;
  console.log('Supply create, selection radius meters', radius, 'diameter', diameter);
  mouseClickedPost('supply', 'create');
}

function mouseClickedSupplyDelete() {
  const radius = radiusOfSelectionMeters(mouseX, mouseY, mouseSelectionRadius());
  const diameter = radius * 2;
  console.log('Supply delete, selection radius meters', radius, 'diameter', diameter);
  mouseClickedPost('supply', 'delete');
}

function mouseClickedPost(what, action) {
  httpPost(
    location + 'selection',
    'json',
    {
      what: what,
      action: action,
      amount: command.isDemand ? command.demand.amount.value : command.supply.amount.value,
      rate: command.isDemand ? command.demand.rate.value : command.supply.rate.value,
      location: locationOfClick()
    },
    function (response) {
      console.log(response);
    },
    function (error) {
      console.log(error);
    }
  );
}

function locationOfClick() {
  const radius = mouseSelectionRadius();
  const leftX = mouseX - radius;
  const rightX = mouseX + radius;
  const topY = mouseY - radius;
  const botY = mouseY + radius;

  return {
    radius: radiusOfSelectionMeters(mouseX, mouseY, radius),
    center: worldMap.pixelToLatLng(mouseX, mouseY),
    topLeft: worldMap.pixelToLatLng(leftX, topY),
    botRight: worldMap.pixelToLatLng(rightX, botY),
  }
}

function mouseMoved() {
  //console.log('Mouse moved', mouseX, mouseY);
  return false;
}

function commandInput(key) {
  if (isDemand(key)) {
    commandReset();
    command.isDemand = true;
    commandPrompt();
  } else if (isSupply(key)) {
    commandReset();
    command.isSupply = true;
    commandPrompt();
  } else if (isCreate(key)) {
    command.isCreate = true;
    commandPrompt();
  } else if (isDelete(key)) {
    command.isDelete = true;
    commandPrompt();
  } else if (isAdjustAmount(key)) {
    adjustAmount(key);
  } else if (isAdjustRate(key)) {
    adjustRate(key);
  }

  function isDemand(key) {
    return key == 'd' && !isSubCommand();
  }

  function isSupply(key) {
    return key == 's' && !isSubCommand();
  }

  function isCreate(key) {
    return key == 'c' && isSubCommand();
  }

  function isDelete(key) {
    return key == 'd' && isSubCommand();
  }

  function isAdjustAmount(key) {
    return isAdjustable() && (key == 'a' || key == 'A');
  }

  function isAdjustRate(key) {
    return isAdjustable() && (key == 'r' || key == 'R');
  }

  function isSubCommand() {
    return command.isDemand || command.isSupply;
  }

  function isAdjustable() {
    return isSubCommand() && (command.isCreate || command.isDelete);
  }

  function adjustAmount(key) {
    let amount;
    if (command.isDemand) {
      amount = command.demand.amount;
    } else {
      amount = command.supply.amount;
    }
    amount.value = adjust(key, amount.value, amount.min, amount.max);

    function adjust(key, amount, min, max) {
      return key == 'a' ? decrement(amount, min) : increment(amount, max);
    }
  }

  function adjustRate(key) {
    let rate;
    if (command.isDemand) {
      rate = command.demand.rate;
    } else {
      rate = command.supply.rate;
    }
    rate.value = adjust(key, rate.value, rate.min, rate.max);

    function adjust(key, rate, min, max) {
      return key == 'r' ? decrement(rate, min) : increment(rate, max);
    }
  }

  function increment(value, max) {
    let m = 10;
    while (value % m == 0) {
      m *= 10;
    }
    return Math.min(value + m / 10, max);
  }

  function decrement(value, min) {
    let m = min;
    while (value % m == 0) {
      m *= 10;
    }
    m = m / 10 == value ? m / 100 : m / 10;
    return Math.max(value - m, min);
  }
}

function commandReset() {
  command.isCreate = false;
  command.isDelete = false;
  command.isDemand = false;
  command.isSupply = false;
}

function commandPrompt() {
  if (!command.isDemand && !command.isSupply) {
    command.prompt = 'd - Demand, s - Supply';
  } else if (!command.isCreate && !command.isDelete) {
    command.prompt = (command.isDemand ? 'Demand' : 'Supply') + ': c - Create, d - Delete';
  } else {
    command.prompt = (command.isDemand ? 'Demand' : 'Supply') + ' ' + (command.isDelete ? 'Delete' : 'Create');
  }
}

function windowResized() {
  let style = getStyleByClassName('leaflet-container');
  if (style) {
    style.width = windowWidth + 'px';
    style.height = windowHeight + 'px';
  }
  worldMap.map.invalidateSize();
  resizeCanvas(windowWidth, windowHeight);

  grid.resize();

  function getStyleByClassName(className) {
    const element = document.getElementsByClassName(className);
    return (element && element[0]) ? element[0].style : undefined;
  }
}

function radiusOfSelectionMeters(x, y, radiusPx) {
  const latLngCenter = worldMap.pixelToLatLng(x, y);
  const latLngEdge = worldMap.pixelToLatLng(x, y + radiusPx);
  return distanceBetween(latLngCenter, latLngEdge);
}

function distanceBetween(latLng1, latLng2) {
  // Haversine formula
  console.log(latLng1, latLng2);
  const earthRadiusMeters = 6371 * 1000;
  const lat1 = latLng1.lat * Math.PI / 180;
  const lat2 = latLng2.lat * Math.PI / 180;
  const deltaLat = (latLng2.lat - latLng1.lat) * Math.PI / 180;
  const deltaLng = (latLng2.lng - latLng1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
          + Math.cos(lat1) * Math.cos(lat2)
          * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMeters * c;
}

const grid = {
  borderWidth: 20,
  ticksHorizontal: 100,
  ticksVertical: 0,
  tickWidth: 0,
  resize: function () {
    const gridWidth = windowWidth - 2 * this.borderWidth;
    this.tickWidth = gridWidth / this.ticksHorizontal;
    this.ticksVertical = windowHeight / windowWidth * this.ticksHorizontal;
  },
  toX: function (gridX) { // convert from grid scale to canvas scale
    return this.borderWidth + gridX * this.tickWidth;
  },
  toY: function (gridY) {
    return this.borderWidth + gridY * this.tickWidth;
  },
  toLength: function (gridLength) {
    return gridLength * this.tickWidth
  },
  toGridX: function(x) {
    return (x - this.borderWidth) / this.tickWidth;
  },
  toGridY: function(y) {
    return (y - this.borderWidth) / this.tickWidth;
  },
  toGridLength: function(length) {
    return length / this.tickWidth;
  },
  line: function (x1, y1, x2, y2) {
    line(grid.toX(x1), grid.toY(y1), grid.toX(x2), grid.toY(y2));
  },
  rect: function (x, y, w, h) {
    rect(grid.toX(x), grid.toY(y), grid.toLength(w), grid.toLength(h));
  }
};

const Label = function () {
  return {
    setX: function (x) { this.x = x; return this; },
    setY: function (y) { this.y = y; return this; },
    setW: function (w) { this.w = w; return this; },
    setH: function (h) { this.h = h; return this; },
    setBorder: function (b) { this.border = b; return this; },
    setKey: function (k) { this.key = k; return this; },
    setValue: function (v) { this.value = v; return this; },
    setBgColor: function (c) { this.bgColor = c; return this; },
    setKeyColor: function (c) { this.keyColor = c; return this; },
    setValueColor: function (c) { this.valueColor = c; return this; },
    draw: function () {
      const cx = grid.toX(this.x);
      const cy = grid.toY(this.y);
      const cw = grid.toLength(this.w);
      const ch = grid.toLength(this.h);
      const cb = grid.toLength(this.border);

      strokeWeight(0);
      fill(this.bgColor || color(0, 0));
      rect(cx, cy, cw, ch);

      textSize(ch - cb * 2);

      if (this.key) {
        textAlign(LEFT, CENTER);
        fill(this.keyColor || color(0, 0));
        text(this.key, cx + cb, cy + ch / 2);
      }

      if (this.value) {
        textAlign(RIGHT, CENTER);
        fill(this.valueColor || color(0, 0));
        text(this.value, cx + cw - cb, cy + ch / 2);
      }
    },
    Label: function () {
      if (!(this instanceof Label)) {
        return new Label();
      }
    }
  };
};

const Slider = function () {
  return {
    setX: function (x) { this.x = x; return this; },
    setY: function (y) { this.y = y; return this; },
    setW: function (w) { this.w = w; return this; },
    setH: function (h) { this.h = h; return this; },
    setBorder: function (b) { this.border = b; return this; },
    setMin: function (m) { this.min = m; return this; },
    setMax: function (m) { this.max = m; return this; },
    setValue: function (v) { this.value = v; return this; },
    setValueColor: function (c) { this.valueColor = c; return this; },
    setBgColor: function (c) { this.bgColor = c; return this; },
    setBarColor: function (c) { this.barColor = c; return this; },
    setLabel: function (l) { this.label = l; return this; },
    setLabelW: function (w) { this.labelW = w; return this; },
    setLabelColor: function (c) { this.labelColor = c; return this; },
    setStep: function (s) { this.step = s; return this; },
    draw: function () {
      const cx = grid.toX(this.x);
      const cy = grid.toY(this.y);
      const cw = grid.toLength(this.w);
      const ch = grid.toLength(this.h);
      const cb = grid.toLength(this.border);
      const lw = grid.toLength(this.labelW);
      const sliderW = cw - 2 * cb;
      const sliderPos = cx + cb + sliderW / (this.max - this.min) * this.value;

      this.step = this.step ? this.step : 1;

      strokeWeight(0);
      fill(this.bgColor || color(0, 0));
      rect(cx, cy, cw, ch);

      strokeWeight(ch / 20.0);
      stroke(this.barColor || color(255));
      line(cx + cb, cy + ch / 2, cx + cw - cb, cy + ch / 2);

      strokeWeight(0);
      fill(this.barColor || color(255));
      circle(sliderPos, cy + ch / 2, ch / 4);

      textSize((ch - cb * 2) / 4);

      textAlign(RIGHT, TOP);
      fill(this.labelColor || color(255));
      text(this.label, cx + cw / 2 - cb, cy + cb);

      fill(this.valueColor || color(255));

      textAlign(LEFT, TOP);
      text(this.value.toLocaleString(), cx + cw / 2 + cb, cy + cb);

      textAlign(LEFT, BOTTOM);
      text(this.min.toLocaleString(), cx + cb, cy + ch - cb);

      textAlign(RIGHT, BOTTOM);
      text(this.max.toLocaleString(), cx + cw - cb, cy + ch - cb);
    },
    Slider: function () {
      if (!(this instanceof Slider)) {
        return new Slider();
      }
    }
  };
};