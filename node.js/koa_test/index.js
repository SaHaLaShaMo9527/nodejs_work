
const KOA = require('koa');
const fs = require('fs');
const app = new KOA();
app.use(async (ctx) => {
    // ctx.body = 'hello koa'
    ctx.type = 'html';
    ctx.body = fs.createReadStream('./views/template.html');
}
);

app.listen(1029);
console.log('koa is listen 1029');
