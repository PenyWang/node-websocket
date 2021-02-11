const Koa = require('koa2')
// 路由
const route = require('koa-route')
// koa封装的websocket这是官网（很简单有时间去看一下https://www.npmjs.com/package/koa-websocket）
const websockify = require('koa-websocket')
const app = websockify(new Koa());

let heartStatus = 0; // 0 代表心跳停止，1代表心跳继续

app.ws.use(function (ctx, next) {
    ctx.websocket.send(JSON.stringify({ type: 'connect', data: '连接成功' }));
    
    const intervalId = setInterval(() => {
        console.log('心跳中...')
        heartStatus = 0;
        ctx.websocket.send(JSON.stringify({ type: 'heartCheck' }));
        const timeoutId = setTimeout(() => {
            if(heartStatus === 0) {
                console.log('心跳停止...')
                clearInterval(intervalId);
                ctx.websocket.close();
            }
            clearTimeout(timeoutId);
        }, 5 * 1000)

    }, 30 * 1000)

    return next(ctx)
})
app.ws.use(route.all('/', function (ctx) {
    /**接收消息*/
    ctx.websocket.on('message', function (message) {
        const { type, data } = JSON.parse(message);
        console.log(message)
        switch(type) {
            case 'auth':
                ctx.websocket.send(JSON.stringify({ type: 'auth', data: '权限通过' }));
                break;
            case 'message':
                ctx.websocket.send(JSON.stringify({type: 'message', data: '你好，服务器思考中'}))
                break;
            case 'heartCheck':
            default: 
                heartStatus = 1; 
        }
        
    })
}));

app.listen(4000, () => {
    console.log("localhost:" + 4000);
});