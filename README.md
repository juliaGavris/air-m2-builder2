# air-m2-builder2

## Использование

### Установка

`npm install air-m2-builder2 --save-dev`

### Подключение

```json
{
  "scripts": {
    "build": "node --experimental-modules ./node_modules/air-m2-builder2/bin/server.mjs --build:prod",
    "dev": "node --experimental-modules ./node_modules/air-m2-builder2/bin/server.mjs"
  }
}
```

### Запуск

`npm run dev`

### Командная строка

- `clear cache [all|key]` - очищает кэш установки целиком, если без параметров или `all`, или конкретный ключ `key`

## Конфигурация

`air-m2.config.json`

```json
{
  "port": 9000,
  "master": "master-module",
  "latency": [{ "regex": "index\\.html", "delay": 1000 }]
}
```

Модуль, путь к которому удовлетворит условию регулярного выражения `regex`, будет выдан с задержкой `delay`.
Поиск срабатывает только по первому совпадению.

## Точка входа

`src/m2.js` и `src/m2.html` - будут найдены в модуле, имя которого указано в json конфиге с ключом "master".
Если имя модуля не указано, будет произведён поиск файлов в текущем проекте.

## Встроенные стили

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
