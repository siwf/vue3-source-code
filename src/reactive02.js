/*
 * @Description: 
 * @Date: 2022-08-13 09:44:13
 * @LastEditors: siwenfeng
 * @LastEditTime: 2022-08-13 10:34:14
 */
const data = {
  text: 'hello world'
}
let activeEffect;

const bucket = new Set();

const obj = new Proxy(data, {
  get(target, key) {

    if (activeEffect) {
      bucket.add(activeEffect);
    }
    console.log('get')
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    console.log('set')
    bucket.forEach(cb => cb())
    return true;
  }
})

function effect(fn) {
  activeEffect = fn;
  fn()
}
effect(() => {
  console.log('effect')
  document.body.innerText = obj.text;
});

setTimeout(() => {
  obj.newText = '温风点火'
}, 2000)



