
/*
 * @Description: 分支切换
 * @Date: 2022-08-13 10:25:01
 * @LastEditors: siwenfeng
 * @LastEditTime: 2022-08-13 12:33:46
 */
const data = {
  foo: 1
};
const bucket = new WeakMap();

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
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
  // effectFn();
}

const jobQueen = new Set();

const p = Promise.resolve();

let isFlushing = false;

function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueen.forEach(job => job())
  }).finally(() => {
    isFlushing = false;
  })
}


effect(() => {
  console.log(obj.foo);
});
console.log('effect 初始化之前 ------------------------')

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
obj.foo++