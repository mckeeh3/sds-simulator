
// Test of Gaussian Nominal Distribution (bell curve) calculations.
// https://riptutorial.com/javascript/example/8330/random--with-gaussian-distribution

const variance = 4;
const points = Array.from({ length: 5000 }, (v, k) => randomNominalDistribution(variance));
let spin = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  clear();
  background(0);
  translate(windowWidth / 2, windowHeight / 2);
  stroke(255);
  rotate(TWO_PI / 1000 * ++spin);

  points.forEach(p => {
    const length = p * windowWidth / 2;
    rotate(TWO_PI / points.length);
    circle(length, 0, 0.5);
  });
}

function randomNominalDistribution(variance) {
  const r = Array.from({ length: variance }, (v, k) => Math.random());
  return r.reduce((a, c) => a + c) / variance * 2 - 1;
}
