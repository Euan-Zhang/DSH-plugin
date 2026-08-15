// 生成「黑神话·悟空」的可导入皮肤文件（含 base64 视频背景）。
// 运行：node examples/_gen-wukong.mjs  （在插件根目录下）
// 产物：examples/wukong.dshskin
//
// 说明：本插件已内置 id="wukong" 的同一皮肤，因此「已安装本插件的环境」
// 再导入该文件会因 id 冲突被拒绝（这正是校验规则之一）。此文件用于：
//  1. 分享到「未内置黑神话皮肤」的其他 DSH 实例，导入即可获得该皮肤；
//  2. 作为「含视频背景皮肤如何打包」的完整范例。
// 若要在已内置的环境里再导入一份，把下方 id 改成别的（如 wukong-copy）再生成即可。

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { WUKONG_TOKENS, WUKONG_CSS } from '../lib/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const video = readFileSync(join(here, '..', 'assets', 'wukong-video.mp4'))
const b64 = video.toString('base64')

const skin = {
  schema: 'dsh-skin',
  schemaVersion: 1,
  id: 'wukong',
  name: '黑神话·悟空',
  version: '1.0.0',
  author: 'DSH',
  description: '黑金配色 + 毛玻璃金边 + 悟空官网视频底纹，参考《黑神话：悟空》。',
  colorScheme: 'dark',
  tokens: WUKONG_TOKENS,
  css: WUKONG_CSS,
  background: { type: 'video', value: 'data:video/mp4;base64,' + b64, opacity: 0.26, brightness: 2 },
}

const out = join(here, 'wukong.dshskin')
writeFileSync(out, JSON.stringify(skin, null, 2), 'utf8')
console.log('generated', out)
console.log('size:', (Buffer.byteLength(JSON.stringify(skin)) / 1024 / 1024).toFixed(2), 'MB')
