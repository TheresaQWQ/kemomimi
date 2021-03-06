const imghash = require('imghash');
const leven = require('leven');
const fs = require('fs');
const path = require('path');

const promiseList = [];
const hashList = [];

console.log(`正在读取文件...`);

const files = fs.readdirSync('./image')

console.log(`文件读取完成,开始计算pHash...`);

files.forEach(filename => {
  const file = path.join('./image', filename);
  const p = imghash.hash(file, 16);

  p.then(hash => {
    hashList.push({
      file: filename,
      hash: hash
    })
  })

  promiseList.push(p);
})

Promise.all(promiseList).then(() => {
  let pass = true;

  const list = [];

  console.log('正在查找重复图片...');

  for (hash1 of hashList) {
    list.push(hash1.file);
    for(hash2 of hashList) {
      if(list.indexOf(hash2.file) !== -1) continue;

      if(leven(hash1.hash, hash2.hash) <= 6) {
        pass = false;
        console.log(`发现重复图片: ${hash1.file}, ${hash2.file}`)
        const file1 = fs.statSync(`./image/${hash1.file}`)
        const file2 = fs.statSync(`./image/${hash2.file}`)

        if(file1.size > file2.size) {
          fs.unlinkSync(`./image/${hash2.file}`)
          console.log(`已删除 ${hash2.file}`)
        } else {
          fs.unlinkSync(`./image/${hash1.file}`)
          console.log(`已删除 ${hash1.file}`)
        }
      }
    }
  }

  if(pass) console.log(`检查通过, 未发现重复图片`)
  if(!pass) process.exit(1);
})