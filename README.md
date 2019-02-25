# air-m2-builder2

## Использование

### Установка

`npm install air-m2-builder2 --save-dev`

### Подключение

```json
{
  "scripts": {
    "build": "air-m2-builder2 --build:prod",
    "dev": "air-m2-builder2"
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
  "port": 9000
}
```
