/*
 * @Description: 
 * @Date: 2022-08-13 09:44:13
 * @LastEditors: siwenfeng
 * @LastEditTime: 2022-08-13 10:07:21
 */
// 源数据
const data = {
  text: 'hello world'
}

// 存储副作用函数的桶
const bucket = new Set();

// 响应式数据
const obj = new Proxy(data, {
  get(target, key) {

    bucket.add(effect);
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

// 副作用函数
function effect() {
  document.body.innerText = obj.text;
}
effect()

setTimeout(() => {
  obj.text = '温风点火'
}, 2000)



