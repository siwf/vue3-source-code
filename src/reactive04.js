/*
 * @Description:
 * @Date: 2022-08-13 10:25:01
 * @LastEditors: siwenfeng
 * @LastEditTime: 2022-08-13 10:44:32
 */
const data = {
  text: "hello world",
};
const bucket = new WeakMap();

// target -> key -> effect
// weakmap -> map -> set

let activeEffect;

const obj = new Proxy(data, {
  get(target, key) {
    if (!activeEffect) return target[key];
    track(target, key);

    return target[key];
  },

  set(target, key, newVal) {
    target[key] = newVal;

    trigger(target, key);
    return true;
  },
});

function effect(fn) {
  activeEffect = fn;
  fn();
}

effect(() => {
  console.log("effect");
  document.body.innerText = obj.text;
});

setTimeout(() => {
  // 新增属性
  obj.newText = "温风点火";
}, 2000);

function track(target, key) {
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);

  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  effects && effects.forEach((cb) => cb());
}
