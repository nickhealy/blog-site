import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { OUTPUT_PATH } from './generator/fs-utils'

new Elysia()
    .use(staticPlugin({ assets: OUTPUT_PATH}))
    .listen(8080)
