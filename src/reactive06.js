/*
 * @Description: 分支切换
 * @Date: 2022-08-13 10:25:01
 * @LastEditors: siwenfeng
 * @LastEditTime: 2022-08-13 12:03:09
 */
const data = {
  foo: true,
  bar: true,
};
const bucket = new WeakMap();
let temp1, temp2

// target -> key -> effect
// weakmap -> map -> set

let activeEffect;

const obj = new Proxy(data, {
  get(target, key) {
    console.log('get')
    if (!activeEffect) return target[key];
    track(target, key);
    return target[key];
  },

  set(target, key, newVal) {
    console.log('set')
    target[key] = newVal;
    trigger(target, key);
    return true;
  },
});

function effect(fn) {
  const effectFn = () => {
    cleanUp(effectFn)
    activeEffect = effectFn;
    fn();
  }
  effectFn.deps = [];
  effectFn();
}

effect(function effect1() {
  console.log('effect1');
  effect(function effect2() {
    console.log('effect2');
    temp2 = obj.bar
  })
  temp1 = obj.foo;
});
console.log('------------------------')
setTimeout(() => {
  // 新增属性
  obj.foo = "温风点火";
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
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  const effectsRun = new Set(effects);
  effectsRun && effectsRun.forEach((cb) => cb());
}

function cleanUp(effectFn) {
  for (let index = 0; index < effectFn.deps.length; index++) {
    const deps = effectFn.deps[index];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}