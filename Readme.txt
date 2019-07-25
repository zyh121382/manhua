npm install babel-cli -g
npm install babel-core --save-dev
npm install babel-preset-es2015 --save-dev
npm install babel-preset-stage-3 --save-dev
npm install babel-plugin-transform-runtime --save-dev

index.js  .babelrc 如下配置
run: babel-node index.js;

npm install node-fetch -S
npm install cheerio -S
npm install async -S
npm install request -S

可以爬取www.manhuadb.com上的漫画只需要知道漫画的编号就能修改下载另外的漫画
例子:东京食尸鬼1185
    哥布林杀手1268
参考于https://github.com/liumin1128/api.react.mobi/blob/master/server/crawler/jojo.js
用了很多js的异步操作但是没有用到request.get 请求ajax 爬取json，仅仅是通过node-fetch 有等待提高看看就行。
仅供学习用，共勉。

！！！！还存在bug 只能一章一章来 循环就会炸穿。。。。emm。菜醒
