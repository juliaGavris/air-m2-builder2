# air-m2-builder2

1. [Install](#install)
2. [Configuration](#configuration)
3. [Dependencies](#dependencies)
3. [Compilation](#compilation)
    * [Scss](#scss)
    * [View-source](#view-source)
    * [Stream-source](#stream-source)
    * [React-source](#react-source)
4. [Cache](#cache)


## Install

`npm install air-m2-builder2 --save-dev`

## Configuration

#### Подключение

```json
{
  "scripts": {
    "build": "node --experimental-modules ./node_modules/air-m2-builder2/bin/server.mjs",
    "dev": "node --experimental-modules ./node_modules/air-m2-builder2/bin/server.mjs --dev-server"
  }
}
```

#### Конфигурация

`air-m2.config.json`

```json
{
  "entry-unit": "master", //main m2 script data-arg
  "port": 9000,
  "latency": [{ "regex": "index\\.html", "delay": 1000 }]
}
```

Модуль, путь к которому удовлетворит условию регулярного выражения `regex`, будет выдан с задержкой `delay`.
Поиск срабатывает только по первому совпадению.

#### Запуск

`npm run dev`

#### Параметры запуска

- `--revision 111` - номер ревизии
- `--dev-server` - запуск отладочного сервера
- `--build-mode [production|development]` - режим сборки скриптов webpack
- `--m2units m2unit.prod` - переопределит зависимости
- `--direct-dependencies-only` - поиск и сборка только прямых зависемостей (из корня текущего проекта в файлах m2units.json и/или package.json#m2units)

## Dependencies

#### serverConfig
Список устанавливаемых модулей (`optional`) получается из `m2units.json` проекта и значений `m2units` внутри `package.json` проекта.
Приоритет у `m2units.json`. В случае несоответствия источника установленного модуля с указанным, модуль удаляется. 

#### postinstall
В процессе установки модулей список пополняется из `m2units` внутри `package.json` устанавливаемых модулей. 

## Compilation

### Точка входа

`lib/m2.js` и `lib/m2.html` - будут найдены в корне проекта.

### Compile HTML

#### Scss

Можно подключать стили, написанные с препроцессором SASS/SCSS, прямо в html страницу.
Для этого в любом месте кода нужно создать тег `style` с обязательным указанием атрибута `type="text/scss"`.
Стили будут скомпилированы в CSS каждый по отдельности.

```html
<style type="text/scss">
  $clr: red;
  .block {
    color: $clr;
  }
</style>
```

При компиляции стилей url(<адрес изображения>) заменяется на /* \<image url="${<адрес изображения>}"> */,
для замены на фронте регулярками

#### View-source

Можно подключать view-source внутри html, который компилируется в инлайновый скрипт с data-source-type="view-source". 
Внутри view-source можно импортировать данные из других модулей. При первой компиляции данные сохраняются к кэше 
<project-name>/node-modules/.cache и при обновлении страницы берутся из него. 

#### Stream-source

Можно подключать stream-source внутри html, который компилируется в инлайновый скрипт с data-source-type="stream-source". 

#### React-source

Для использования ReactJs используется тэг react-source. Компилируется в инлайновый скрипт внутри html. 

## Cache

#### Командная строка

- `clear cache [all|key]` - очищает кэш установки целиком, если без параметров или `all`, или конкретный ключ `key`


## Supported env's vars
STATIC_VERSION

## Supported local's vars
--revision:<build-number>

## debug вложения

Вкрапления для отладки:
``` 
/*<@debug>*/
код для отладки в production
/*</@debug>*/
```
