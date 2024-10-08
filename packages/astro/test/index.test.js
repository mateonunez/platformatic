import { resolve } from 'node:path'
import { test } from 'node:test'
import {
  createRuntime,
  setFixturesDir,
  updateHMRVersion,
  verifyHMR,
  verifyHTMLViaHTTP,
  verifyHTMLViaInject,
  verifyJSONViaHTTP,
  verifyJSONViaInject
} from '../../basic/test/helper.js'

function websocketHMRHandler (message, resolveConnection, resolveReload) {
  switch (message.type) {
    case 'connected':
      resolveConnection()
      break
    case 'full-reload':
      resolveReload()
  }
}

const packageRoot = resolve(import.meta.dirname, '..')
setFixturesDir(resolve(import.meta.dirname, './fixtures'))

test('can detect and start an Astro application', async t => {
  await updateHMRVersion()
  const { url } = await createRuntime(t, 'astro/standalone/platformatic.runtime.json', packageRoot)

  const htmlContents = ['<body data-astro-source-file', /Hello from \d+/]

  await verifyHTMLViaHTTP(url, '/', htmlContents)
  await verifyHMR(url, '/', 'vite-hmr', websocketHMRHandler)
})

test('can detect and start an Astro application when exposed in a composer with a prefix', async t => {
  await updateHMRVersion()
  const { runtime, url } = await createRuntime(t, 'astro/composer-with-prefix/platformatic.runtime.json', packageRoot)

  const htmlContents = ['<body data-astro-source-file', /Hello from v\d+ t\d+/]

  await verifyHTMLViaHTTP(url, '/frontend/', htmlContents)
  await verifyHTMLViaInject(runtime, 'main', '/frontend', htmlContents)
  await verifyHMR(url, '/frontend/', 'vite-hmr', websocketHMRHandler)

  await verifyJSONViaHTTP(url, '/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/direct', 200, { ok: true })

  await verifyJSONViaInject(runtime, 'main', 'GET', 'plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'main', 'GET', '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/direct', 200, { ok: true })
})

test('can detect and start an Astro application when exposed in a composer without a prefix', async t => {
  await updateHMRVersion()
  const { runtime, url } = await createRuntime(
    t,
    'astro/composer-without-prefix/platformatic.runtime.json',
    packageRoot
  )

  const htmlContents = ['<body data-astro-source-file', /Hello from v\d+ t\d+/]

  await verifyHTMLViaHTTP(url, '/', htmlContents)
  await verifyHTMLViaInject(runtime, 'main', '/', htmlContents)
  await verifyHMR(url, '/', 'vite-hmr', websocketHMRHandler)

  await verifyJSONViaHTTP(url, '/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/direct', 200, { ok: true })

  await verifyJSONViaInject(runtime, 'main', 'GET', 'plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'main', 'GET', '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/direct', 200, { ok: true })
})

// In this file the application purposely does not specify a platformatic.application.json to see if we automatically detect one
test('can detect and start an Astro application when exposed in a composer with a custom config and by autodetecting the prefix', async t => {
  await updateHMRVersion()
  const { runtime, url } = await createRuntime(
    t,
    'astro/composer-autodetect-prefix/platformatic.runtime.json',
    packageRoot
  )

  const htmlContents = ['<body data-astro-source-file', /Hello from v\d+ t\d+/]

  await verifyHTMLViaHTTP(url, '/nested/base/dir/', htmlContents)
  await verifyHTMLViaInject(runtime, 'main', '/nested/base/dir', htmlContents)
  await verifyHMR(url, '/nested/base/dir/', 'vite-hmr', websocketHMRHandler)

  await verifyJSONViaHTTP(url, '/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/direct', 200, { ok: true })

  await verifyJSONViaInject(runtime, 'main', 'GET', 'plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'main', 'GET', '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/direct', 200, { ok: true })
})

test('can detect and start an Astro application in SSR mode when exposed in a composer with a prefix', async t => {
  await updateHMRVersion()
  const { runtime, url } = await createRuntime(t, 'astro/ssr-with-prefix/platformatic.runtime.json', packageRoot)

  const htmlContents = ['<body data-astro-source-file', /Hello from v\d+ t\d+/]

  await verifyHTMLViaHTTP(url, '/frontend/', htmlContents)
  await verifyHTMLViaInject(runtime, 'main', '/frontend', htmlContents)
  await verifyHMR(url, '/frontend/', 'vite-hmr', websocketHMRHandler)

  await verifyJSONViaHTTP(url, '/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/direct', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/mesh', 200, { ok: true })

  await verifyJSONViaInject(runtime, 'main', 'GET', 'plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'main', 'GET', '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/direct', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/mesh', 200, { ok: true })
})

test('can detect and start an Astro application in SSR mode when exposed in a composer without a prefix', async t => {
  await updateHMRVersion()
  const { runtime, url } = await createRuntime(t, 'astro/ssr-without-prefix/platformatic.runtime.json', packageRoot)

  const htmlContents = ['<body data-astro-source-file', /Hello from v\d+ t\d+/]

  await verifyHTMLViaHTTP(url, '/', htmlContents)
  await verifyHTMLViaInject(runtime, 'main', '/', htmlContents)
  await verifyHMR(url, '/', 'vite-hmr', websocketHMRHandler)

  await verifyJSONViaHTTP(url, '/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/direct', 200, { ok: true })

  await verifyJSONViaInject(runtime, 'main', 'GET', 'plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'main', 'GET', '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/direct', 200, { ok: true })
})

// In this file the application purposely does not specify a platformatic.application.json to see if we automatically detect one
test('can detect and start an Astro application in SSR mode when exposed in a composer with a custom config and by autodetecting the prefix', async t => {
  await updateHMRVersion()
  const { runtime, url } = await createRuntime(t, 'astro/ssr-autodetect-prefix/platformatic.runtime.json', packageRoot)

  const htmlContents = ['<body data-astro-source-file', /Hello from v\d+ t\d+/]

  await verifyHTMLViaHTTP(url, '/nested/base/dir/', htmlContents)
  await verifyHTMLViaInject(runtime, 'main', '/nested/base/dir', htmlContents)
  await verifyHMR(url, '/nested/base/dir/', 'vite-hmr', websocketHMRHandler)

  await verifyJSONViaHTTP(url, '/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaHTTP(url, '/service/direct', 200, { ok: true })

  await verifyJSONViaInject(runtime, 'main', 'GET', 'plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'main', 'GET', '/frontend/plugin', 200, { ok: true })
  await verifyJSONViaInject(runtime, 'service', 'GET', '/direct', 200, { ok: true })
})
