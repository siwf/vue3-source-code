/*
 * @Description: 分支切换
 * @Date: 2022-08-13 10:25:01
 * @LastEditors: siwenfeng
 * @LastEditTime: 2022-08-13 12:18:31
 */
const data = {
  foo: 1
};
const bucket = new WeakMap();
let temp1, temp2

// target -> key -> effect
// weakmap -> map -> set

let activeEffect;
const effectStack = [];

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

function effect(fn, options = {}) {
  const effectFn = () => {
    cleanUp(effectFn)
    activeEffect = effectFn;
    effectStack.push(effectFn)
    fn();
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1];
  }
  effectFn.options = options;
  effectFn.deps = [];
  effectFn();
}

effect(() => {
  console.log(obj.foo);
}, {
  scheduler(fn) {
    setTimeout(fn);
  }
});
console.log('------------------------')

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
  const effectsRun = new Set();
  effects && effects.forEach(effectFn => {
    // 防止自己无限调用自己 避免栈溢出
    if (effectFn !== activeEffect) {
      effectsRun.add(effectFn)
    }
  })
  effectsRun && effectsRun.forEach((effectFn) =>  {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  });
}

function cleanUp(effectFn) {
  for (let index = 0; index < effectFn.deps.length; index++) {
    const deps = effectFn.deps[index];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

obj.foo ++;
console.log('end')